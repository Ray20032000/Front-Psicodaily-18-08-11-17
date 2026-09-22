import { useEffect, useRef } from "react";
import { useUsuario } from "../../contexts/UsuarioContext";

export default function TesteVideo() {
    const socketRef = useRef(null);
    const peerConnectionRef = useRef(null);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    const { usuario } = useUsuario();

    useEffect(() => {
        if (!usuario?.id_usuario) return;

        let cancelled = false;
        let localStream = null;

        const socket = new WebSocket(
            "wss://paulocavallini.pythonanywhere.com/ws/signaling"
        );

        const peerConnection = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" }
            ]
        });

        socketRef.current = socket;
        peerConnectionRef.current = peerConnection;

        socket.addEventListener("open", () => {
            if (cancelled) return;

            socket.send(JSON.stringify({
                type: "join",
                room: "teste-1",
                user_id: usuario.id_usuario
            }));
        });

        peerConnection.addEventListener("icecandidate", event => {
            if (!event.candidate || cancelled) return;

            socket.send(JSON.stringify({
                type: "ice-candidate",
                data: event.candidate
            }));
        });

        peerConnection.addEventListener("track", event => {
            if (cancelled) return;

            remoteVideoRef.current.srcObject = event.streams[0];
        });

        socket.addEventListener("message", async event => {
            if (cancelled) return;

            const message = JSON.parse(event.data);

            if (message.type === "offer") {
                await peerConnection.setRemoteDescription(message.data);

                const answer = await peerConnection.createAnswer();

                await peerConnection.setLocalDescription(answer);

                socket.send(JSON.stringify({
                    type: "answer",
                    data: answer
                }));
            }

            if (message.type === "answer") {
                await peerConnection.setRemoteDescription(message.data);
            }

            if (message.type === "ice-candidate") {
                await peerConnection.addIceCandidate(message.data);
            }
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

            localVideoRef.current.srcObject = stream;

            stream.getTracks().forEach(track => {
                peerConnection.addTrack(track, stream);
            });
        }

        initialize().catch(console.error);

        return () => {
            cancelled = true;

            localStream?.getTracks().forEach(track => {
                track.stop();
            });

            // socket.close();
            peerConnection.close();
        };
    }, [usuario?.id_usuario]);

    async function makeCall() {
        const peerConnection = peerConnectionRef.current;
        const socket = socketRef.current;

        const offer = await peerConnection.createOffer();

        await peerConnection.setLocalDescription(offer);

        socket.send(JSON.stringify({
            type: "offer",
            data: offer
        }));
    }

    return (
        <div>
            <button onClick={makeCall}>
                Ligar
            </button>

            <video
                style={{ width: "15%" }}
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
            />

            <video
                className="w-100"
                ref={remoteVideoRef}
                autoPlay
                playsInline
            />
        </div>
    );
}