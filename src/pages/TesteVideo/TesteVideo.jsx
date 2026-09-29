import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, MonitorUp, MessageSquare, Phone, PhoneOff, Send, X } from "lucide-react";
import { useUsuario } from "../../contexts/UsuarioContext";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../config/api.js";
import css from "./TesteVideo.module.css";
import { useParams } from "react-router-dom";
import Header from "../../components/Header/Header";

export default function TesteVideo() {
    const socketRef = useRef(null);
    const peerConnectionRef = useRef(null);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const localStreamRef = useRef(null);
    const screenStreamRef = useRef(null);
    const cleanupRef = useRef(null);
    const channelRef = useRef(null);
    const messagesRef = useRef(null);
    const [microfone, setMicrofone] = useState(true);
    const [camera, setCamera] = useState(true);
    const [midiaPronta, setMidiaPronta] = useState(false);
    const [socketPronto, setSocketPronto] = useState(false);
    const [status, setStatus] = useState("aguardando");
    const [encerrada, setEncerrada] = useState(false);
    const [segundos, setSegundos] = useState(0);
    const [erro, setErro] = useState("");
    const [compartilhando, setCompartilhando] = useState(false);
    const [trocandoTela, setTrocandoTela] = useState(false);
    const [chatAberto, setChatAberto] = useState(false);
    const [chatPronto, setChatPronto] = useState(false);
    const [mensagens, setMensagens] = useState([]);
    const [mensagem, setMensagem] = useState("");

    const { usuario } = useUsuario();
    const { sessaoId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (!usuario?.id_usuario || !sessaoId || encerrada) return;

        let cancelled = false;
        let localStream = null;
        const pendingCandidates = [];

        const apiUrl = new URL(api, window.location.origin);
        apiUrl.protocol = apiUrl.protocol === "https:" ? "wss:" : "ws:";
        apiUrl.pathname = "/ws/signaling";
        apiUrl.searchParams.set("sessao_id", sessaoId);
        const socket = new WebSocket(apiUrl.toString());

        const peerConnection = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" }
            ]
        });

        socketRef.current = socket;
        peerConnectionRef.current = peerConnection;

        // O mesmo canal nos dois clientes permite conversar sem alterar a sinalização.
        const channel = peerConnection.createDataChannel("conversa", { negotiated: true, id: 0 });
        channelRef.current = channel;
        channel.addEventListener("open", () => { if (!cancelled) setChatPronto(true); });
        channel.addEventListener("close", () => { if (!cancelled) setChatPronto(false); });
        channel.addEventListener("message", event => {
            if (!cancelled && typeof event.data === "string") {
                setMensagens(anteriores => [...anteriores, { texto: event.data.slice(0, 2000), propria: false }]);
            }
        });
        peerConnection.addEventListener("connectionstatechange", () => {
            if (cancelled) return;
            if (peerConnection.connectionState === "connected") { setStatus("conectado"); setErro(""); }
            if (peerConnection.connectionState === "disconnected") setStatus("reconectando");
            if (peerConnection.connectionState === "failed") {
                setStatus("falhou");
                setErro("A conexão foi interrompida. Encerre e entre novamente na sala.");
            }
        });

        socket.addEventListener("open", () => {
            if (cancelled) {
                socket.close();
                return;
            }

            socket.send(JSON.stringify({
                type: "join",
                room: `sessao:${sessaoId}`,
                user_id: usuario.id_usuario
            }));
            setSocketPronto(true);
        });

        socket.addEventListener("error", () => {
            if (!cancelled) setErro("Não foi possível conectar à sala. Recarregue a página para tentar novamente.");
        });
        socket.addEventListener("close", () => {
            if (!cancelled) {
                setSocketPronto(false);
                setErro("A conexão com a sala foi fechada. Recarregue a página para conectar novamente.");
            }
        });

        peerConnection.addEventListener("icecandidate", event => {
            if (!event.candidate || cancelled || socket.readyState !== WebSocket.OPEN) return;

            socket.send(JSON.stringify({
                type: "ice-candidate",
                data: event.candidate
            }));
        });

        peerConnection.addEventListener("track", event => {
            if (cancelled) return;

            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
        });

        let signalingQueue = Promise.resolve();
        socket.addEventListener("message", event => {
            signalingQueue = signalingQueue.then(async () => {
                if (cancelled) return;
                const mediaAvailable = await mediaReady;
                if (!mediaAvailable || cancelled) return;
                const message = JSON.parse(event.data);

                if (message.type === "offer") {
                    await peerConnection.setRemoteDescription(message.data);
                    for (const candidate of pendingCandidates.splice(0)) await peerConnection.addIceCandidate(candidate);
                    if (cancelled) return;
                    setStatus("conectando");
                    const answer = await peerConnection.createAnswer();
                    await peerConnection.setLocalDescription(answer);
                    if (cancelled || socket.readyState !== WebSocket.OPEN) return;
                    socket.send(JSON.stringify({ type: "answer", data: answer }));
                }

                if (message.type === "answer") {
                    await peerConnection.setRemoteDescription(message.data);
                    for (const candidate of pendingCandidates.splice(0)) await peerConnection.addIceCandidate(candidate);
                }

                if (message.type === "ice-candidate") {
                    if (peerConnection.remoteDescription) await peerConnection.addIceCandidate(message.data);
                    else pendingCandidates.push(message.data);
                }
            }).catch(() => {
                if (!cancelled) setErro("Não foi possível estabelecer a chamada. Encerre e entre novamente para tentar outra vez.");
            });
        });

        async function initialize() {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            // Effect antigo já morreu
            if (cancelled) {
                stream.getTracks().forEach(track => track.stop());
                return;
            }

            localStream = stream;
            localStreamRef.current = stream;

            localVideoRef.current.srcObject = stream;

            stream.getTracks().forEach(track => {
                peerConnection.addTrack(track, stream);
            });
            setMidiaPronta(true);
            return true;
        }

        const mediaReady = initialize().catch(() => {
            if (!cancelled) setErro("Não foi possível acessar a câmera e o microfone. Confira as permissões do navegador e recarregue a página.");
            return false;
        });

        function cleanup() {
            if (cancelled) return;
            cancelled = true;

            localStream?.getTracks().forEach(track => {
                track.stop();
            });

            screenStreamRef.current?.getTracks().forEach(track => track.stop());
            screenStreamRef.current = null;
            localStreamRef.current = null;
            channel.close();
            if (socket.readyState === WebSocket.OPEN) socket.close();
            peerConnection.close();
        }
        cleanupRef.current = cleanup;
        return cleanup;
    }, [usuario?.id_usuario, sessaoId, encerrada]);

    useEffect(() => {
        if (status !== "conectado" || encerrada) return;
        const timer = window.setInterval(() => setSegundos(valor => valor + 1), 1000);
        return () => window.clearInterval(timer);
    }, [status, encerrada]);

    useEffect(() => {
        messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight });
    }, [mensagens, chatAberto]);

    async function makeCall() {
        if (!midiaPronta || !socketPronto || status !== "aguardando") return;
        const peerConnection = peerConnectionRef.current;
        const socket = socketRef.current;
        setStatus("conectando");
        setErro("");
        try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            if (peerConnection.connectionState === "closed") return;
            socket.send(JSON.stringify({ type: "offer", data: offer }));
        } catch {
            if (peerConnection.connectionState === "closed") return;
            setErro("Não foi possível iniciar a chamada. Tente novamente.");
            setStatus("aguardando");
        }
    }

    function alternarMicrofone() {
        localStreamRef.current?.getAudioTracks().forEach(track => { track.enabled = !microfone; });
        setMicrofone(!microfone);
    }

    function alternarCamera() {
        localStreamRef.current?.getVideoTracks().forEach(track => { track.enabled = !camera; });
        setCamera(!camera);
    }

    async function pararCompartilhamento() {
        const stream = screenStreamRef.current;
        if (!stream) return;
        screenStreamRef.current = null;
        stream.getTracks().forEach(track => track.stop());
        const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
        const sender = peerConnectionRef.current?.getSenders().find(item => item.track?.kind === "video");
        try { if (sender && cameraTrack) await sender.replaceTrack(cameraTrack); }
        catch { setErro("Não foi possível restaurar a câmera. Encerre e entre novamente na sala."); }
        if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
        setCompartilhando(false);
    }

    async function compartilharTela() {
        if (compartilhando) return pararCompartilhamento();
        if (!navigator.mediaDevices?.getDisplayMedia) { setErro("Este navegador não permite compartilhar a tela."); return; }
        setTrocandoTela(true);
        const peer = peerConnectionRef.current;
        let stream;
        try {
            stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            if (peer.connectionState === "closed") { stream.getTracks().forEach(track => track.stop()); return; }
            const track = stream.getVideoTracks()[0];
            const sender = peer.getSenders().find(item => item.track?.kind === "video");
            if (!sender) throw new Error("Vídeo indisponível");
            await sender.replaceTrack(track);
            if (peer.connectionState === "closed") { stream.getTracks().forEach(item => item.stop()); return; }
            screenStreamRef.current = stream;
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;
            setCompartilhando(true);
            track.addEventListener("ended", pararCompartilhamento, { once: true });
        } catch (error) {
            stream?.getTracks().forEach(track => track.stop());
            if (error.name !== "NotAllowedError") setErro("Não foi possível compartilhar a tela. Tente novamente.");
        } finally { setTrocandoTela(false); }
    }

    function encerrarChamada() {
        cleanupRef.current?.();
        setEncerrada(true);
        setMidiaPronta(false);
        setSocketPronto(false);
        setChatPronto(false);
        setCompartilhando(false);
    }

    function enviarMensagem(event) {
        event.preventDefault();
        const texto = mensagem.trim();
        if (!texto || channelRef.current?.readyState !== "open") return;
        try {
            channelRef.current.send(texto);
            setMensagens(anteriores => [...anteriores, { texto, propria: true }]);
            setMensagem("");
        } catch { setErro("Não foi possível enviar a mensagem. Tente novamente."); }
    }

    const conectado = status === "conectado";
    const tempo = `${String(Math.floor(segundos / 60)).padStart(2, "0")}:${String(segundos % 60).padStart(2, "0")}`;

    if (!sessaoId) return <main className={css.encerrada}><div className={css.cartaoFinal}><h1>Sessão inválida</h1><p>Abra a chamada pela sua lista de sessões.</p><button onClick={() => navigate("/sessoes")}>Voltar às sessões</button></div></main>;

    if (encerrada) return <main className={css.encerrada}>
        <div className={css.cartaoFinal}><span className={css.iconeFinal}><PhoneOff size={26} /></span>
            <h1>Chamada encerrada</h1><p>Você saiu da sala.</p>
            <button onClick={() => { setSegundos(0); setMensagens([]); setMensagem(""); setChatAberto(false); setMicrofone(true); setCamera(true); setStatus("aguardando"); setErro(""); setEncerrada(false); }}>Entrar novamente</button>
        </div>
    </main>;

    return (
        <>
            <Header />
            <main className={css.pagina} aria-label="Videochamada">
                <section className={css.palco} aria-label="Vídeo do participante">
                    <video className={css.videoPrincipal} ref={remoteVideoRef} autoPlay playsInline />
                    {!conectado && <div className={css.espera} role="status">
                        <span className={css.iconeEspera}><Video size={32} strokeWidth={1.4} /></span>
                        <h1>{status === "conectando" ? "Chamando…" : status === "reconectando" ? "Reconectando…" : status === "falhou" ? "Conexão interrompida" : "Sua sala de chamada"}</h1>
                        <p>O vídeo do outro participante aparecerá aqui.</p>
                        {status === "aguardando" && <button onClick={makeCall} disabled={!socketPronto || !midiaPronta}><Phone size={17} /> Iniciar chamada</button>}
                    </div>}
                    <div className={css.identificacao}><span className={`${css.indicador} ${conectado ? css.conectado : ""}`} aria-hidden="true" /><span>{conectado ? "Em chamada" : "Sala de chamada"}</span><span className={css.tempo} aria-label={`Duração: ${tempo}`}>{tempo} / 50:00</span></div>
                    <div className={css.miniatura} aria-label="Seu vídeo">
                        <video className={`${css.videoLocal} ${compartilhando ? css.tela : ""}`} ref={localVideoRef} autoPlay playsInline muted />
                        {(!camera || !midiaPronta) && !compartilhando && <div className={css.cameraDesligada}><VideoOff size={25} /><span>{midiaPronta ? "Câmera desligada" : "Aguardando câmera"}</span></div>}
                        <span className={css.nomeLocal}>{compartilhando ? "Sua tela" : "Você"}{!microfone && <MicOff size={12} />}</span>
                    </div>
                    {erro && <div className={css.aviso} role="alert"><span>{erro}</span><button onClick={() => setErro("")} aria-label="Fechar aviso"><X size={16} /></button></div>}
                    <div className={css.controles} role="group" aria-label="Controles da chamada">
                        <button disabled={!midiaPronta} className={!microfone ? css.desativado : ""} onClick={alternarMicrofone} aria-pressed={!microfone} aria-label={microfone ? "Desativar microfone" : "Ativar microfone"} title={microfone ? "Desativar microfone" : "Ativar microfone"}>{microfone ? <Mic /> : <MicOff />}</button>
                        <button disabled={!midiaPronta} className={!camera ? css.desativado : ""} onClick={alternarCamera} aria-pressed={!camera} aria-label={camera ? "Desativar câmera" : "Ativar câmera"} title={camera ? "Desativar câmera" : "Ativar câmera"}>{camera ? <Video /> : <VideoOff />}</button>
                        <button disabled={!midiaPronta || trocandoTela} className={`${css.compartilhar} ${compartilhando ? css.ativo : ""}`} onClick={compartilharTela} aria-pressed={compartilhando} aria-label={compartilhando ? "Parar compartilhamento" : "Compartilhar tela"} title={compartilhando ? "Parar compartilhamento" : "Compartilhar tela"}><MonitorUp /></button>
                        <button className={`${css.botaoChat} ${chatAberto ? css.ativo : ""}`} onClick={() => setChatAberto(!chatAberto)} aria-expanded={chatAberto} aria-controls="chat-chamada" aria-label={chatAberto ? "Fechar conversa" : "Abrir conversa"} title="Conversa"><MessageSquare /></button>
                        <span className={css.separador} />
                        <button className={css.desligar} onClick={encerrarChamada} aria-label="Encerrar chamada" title="Encerrar chamada"><PhoneOff /></button>
                    </div>
                </section>
                {chatAberto && <aside className={css.chat} id="chat-chamada" aria-label="Conversa da chamada">
                    <header><h2>Conversa</h2><button onClick={() => setChatAberto(false)} aria-label="Fechar conversa"><X size={20} /></button></header>
                    <div className={css.mensagens} ref={messagesRef} role="log" aria-live="polite">
                        {!mensagens.length && <p className={css.chatVazio}>{chatPronto ? "Sua conversa começa aqui." : "As mensagens estarão disponíveis quando o outro participante se conectar."}</p>}
                        {mensagens.map((item, indice) => <div key={indice} className={`${css.mensagem} ${item.propria ? css.propria : ""}`}><span>{item.propria ? "Você" : "Participante"}</span><p>{item.texto}</p></div>)}
                    </div>
                    <form onSubmit={enviarMensagem}><input aria-label="Mensagem" placeholder="Escreva uma mensagem…" value={mensagem} onChange={event => setMensagem(event.target.value)} maxLength={2000} disabled={!chatPronto} /><button type="submit" disabled={!chatPronto || !mensagem.trim()} aria-label="Enviar mensagem"><Send size={18} /></button></form>
                </aside>}
            </main>
        </>
    );
}
