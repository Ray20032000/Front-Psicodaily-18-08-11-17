export function signalingUrl(api, sessionId) {
    const url = new URL(import.meta.env?.VITE_SIGNALING_URL || "/ws/signaling", new URL(api, window.location.origin));
    url.protocol = url.protocol === "https:" || url.protocol === "wss:" ? "wss:" : "ws:";
    url.searchParams.set("sessao_id", sessionId);
    return url.href;
}

export function mediaError(error) {
    if (["NotAllowedError", "SecurityError"].includes(error.name)) return "Permita o acesso à câmera e ao microfone no navegador e tente novamente.";
    if (error.name === "NotFoundError") return "Nenhum microfone disponível. Conecte um dispositivo e tente novamente.";
    if (error.name === "NotReadableError") return "A câmera ou o microfone está em uso. Feche outros aplicativos e tente novamente.";
    return error.message || "Não foi possível iniciar a chamada. Tente novamente.";
}

// Uma tentativa possui seus próprios recursos. stop() também cancela mídia pendente.
export function createVideoCall({ url, iceServers, audioOnly, onStatus, onLocal, onRemote, onError }) {
    let stopped = false;
    let socket;
    let stream;
    let peer;
    let callId;
    let candidates = [];
    let messages = Promise.resolve();
    let socketTimer;
    let connectionTimer;
    let disconnectTimer;

    function closePeer() {
        clearTimeout(connectionTimer);
        clearTimeout(disconnectTimer);
        const oldPeer = peer;
        peer = null;
        callId = null;
        candidates = [];
        oldPeer?.close();
        onRemote(null);
    }

    function stop() {
        if (stopped) return;
        stopped = true;
        clearTimeout(socketTimer);
        closePeer();
        if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: "leave" }));
        socket?.close();
        stream?.getTracks().forEach(track => track.stop());
    }

    function fail(message) {
        if (stopped) return;
        stop();
        onError(message);
    }

    function send(message) {
        if (stopped) return;
        if (socket?.readyState !== WebSocket.OPEN) throw new Error("A conexão caiu. Tente entrar novamente.");
        socket.send(JSON.stringify(message));
    }

    function createPeer(id) {
        closePeer();
        callId = id;
        const current = new RTCPeerConnection({ iceServers });
        peer = current;
        stream.getTracks().forEach(track => current.addTrack(track, stream));
        current.onicecandidate = event => {
            if (stopped || peer !== current || !event.candidate) return;
            try { send({ type: "ice-candidate", call_id: id, data: event.candidate.toJSON() }); }
            catch (error) { fail(mediaError(error)); }
        };
        const remote = new MediaStream();
        current.ontrack = event => {
            if (stopped || peer !== current) return;
            if (!remote.getTracks().some(track => track.id === event.track.id)) remote.addTrack(event.track);
            onRemote(remote);
        };
        current.onconnectionstatechange = () => {
            if (stopped || peer !== current) return;
            if (current.connectionState === "connected") {
                clearTimeout(connectionTimer);
                clearTimeout(disconnectTimer);
                onStatus("Conectado");
            } else if (current.connectionState === "failed") {
                fail("Não foi possível conectar áudio e vídeo. Tente novamente ou use outra rede.");
            } else if (current.connectionState === "disconnected") {
                onStatus("Conexão instável. Aguardando recuperação...");
                clearTimeout(disconnectTimer);
                disconnectTimer = setTimeout(() => fail("A conexão caiu. Tente entrar novamente."), 12000);
            }
        };
        connectionTimer = setTimeout(() => fail("A conexão demorou demais. Tente novamente ou use outra rede."), 35000);
        onStatus("Conectando áudio e vídeo...");
        return current;
    }

    async function receive(message) {
        if (stopped) return;
        if (message.type === "error") return fail(message.message);
        if (message.type === "joined") {
            clearTimeout(socketTimer);
            onStatus("Aguardando o outro participante...");
            return;
        }
        if (message.type === "peer-left") {
            closePeer();
            onStatus("O outro participante saiu. Aguardando seu retorno...");
            return;
        }
        if (message.type === "ready") {
            const current = createPeer(message.call_id);
            if (message.initiator) {
                const offer = await current.createOffer();
                if (stopped) return;
                await current.setLocalDescription(offer);
                send({ type: "offer", call_id: callId, data: current.localDescription });
            }
            return;
        }
        if (!peer || message.call_id !== callId) return;
        const current = peer;
        if (message.type === "ice-candidate") {
            if (!current.remoteDescription) candidates.push(message.data);
            else await current.addIceCandidate(message.data);
        } else if (message.type === "offer" || message.type === "answer") {
            await current.setRemoteDescription(message.data);
            if (stopped) return;
            for (const candidate of candidates.splice(0)) await current.addIceCandidate(candidate);
            if (message.type === "offer") {
                const answer = await current.createAnswer();
                if (stopped) return;
                await current.setLocalDescription(answer);
                send({ type: "answer", call_id: callId, data: current.localDescription });
            }
        }
    }

    async function start() {
        try {
            if (!navigator.mediaDevices?.getUserMedia) throw new Error("Abra o site em HTTPS para usar câmera e microfone.");
            onStatus("Aguardando permissão de câmera e microfone...");
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: !audioOnly, audio: true });
            } catch (error) {
                if (stopped) return;
                if (!audioOnly && ["NotFoundError", "OverconstrainedError"].includes(error.name)) {
                    stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
                } else throw error;
            }
            if (stopped) {
                stream.getTracks().forEach(track => track.stop());
                return;
            }
            onLocal(stream);
            onStatus("Entrando na chamada...");
            socket = new WebSocket(url);
            socketTimer = setTimeout(() => fail("O servidor não respondeu. Tente novamente."), 15000);
            socket.onopen = () => {
                try { send({ type: "join" }); }
                catch (error) { fail(mediaError(error)); }
            };
            socket.onmessage = event => {
                // Serializa operações assíncronas para manter SDP e ICE na ordem.
                messages = messages.then(() => {
                    if (!stopped) return receive(JSON.parse(event.data));
                }).catch(error => fail(mediaError(error)));
            };
            socket.onerror = () => fail("Não foi possível conectar ao servidor da chamada. Tente novamente.");
            socket.onclose = () => {
                // Deixa uma mensagem de erro recebida antes do fechamento ser exibida.
                messages.finally(() => fail("A conexão com a chamada foi encerrada. Tente novamente."));
            };
        } catch (error) {
            fail(mediaError(error));
        }
    }

    return { start, stop, toggle(kind) {
        const tracks = stream?.getTracks().filter(track => track.kind === kind) || [];
        const enabled = tracks.length > 0 && !tracks[0].enabled;
        tracks.forEach(track => { track.enabled = enabled; });
        return enabled;
    } };
}
