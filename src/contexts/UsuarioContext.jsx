import { createContext, useContext, useEffect, useRef, useState } from "react";
import api from "../config/api.js";

const UsuarioContext = createContext(null);

export function UsuarioProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [foto, setFoto] = useState(null);
    const versao = useRef(0);
    const requisicao = useRef(null);

    function entrar(dados) {
        versao.current += 1;
        localStorage.setItem("id_usuario", dados.id_usuario);
        localStorage.setItem("tipo_usuario", dados.tipo_usuario);
        localStorage.removeItem("nome");
        setUsuario(dados);
        setErro("");
        setCarregando(false);
    }

    function limpar() {
        versao.current += 1;
        ["id_usuario", "tipo_usuario", "nome"].forEach((chave) => localStorage.removeItem(chave));
        setUsuario(null);
        setErro("");
        setCarregando(false);
    }

    async function sair() {
        // Mantém a sessão local se o servidor não conseguir encerrar o cookie.
        const resposta = await fetch(`${api}/auth/logout`, { method: "POST", credentials: "include" });
        if (!resposta.ok) throw new Error("Não foi possível sair. Tente novamente.");
        limpar();
    }

    function carregar() {
        const atual = ++versao.current;
        setCarregando(true);
        setErro("");
        // Reutiliza a chamada também durante a montagem dupla do StrictMode.
        if (!requisicao.current) {
            const pendente = fetch(`${api}/usuarios/me`, { credentials: "include" })
                .then(async (resposta) => {
                    if (resposta.status === 401 || resposta.status === 403) return null;
                    if (!resposta.ok) throw new Error("Não foi possível carregar seu perfil.");
                    return (await resposta.json()).usuario;
                }).finally(() => {
                    if (requisicao.current === pendente) requisicao.current = null;
                });
            requisicao.current = pendente;
        }
        requisicao.current.then((dados) => {
            if (atual !== versao.current) return;
            if (dados) entrar(dados);
            else limpar();
        }).catch(() => {
            if (atual === versao.current) setErro("Não foi possível carregar seu perfil. Tente novamente.");
        }).finally(() => {
            if (atual === versao.current) setCarregando(false);
        });
    }

    useEffect(() => {
        setFoto(null);
        if (!usuario?.id_usuario) return;
        const controller = new AbortController();
        let url;
        async function carregarFoto() {
            try {
                const resposta = await fetch(`${api}/usuarios/me/avatar`, { credentials: "include", signal: controller.signal });
                if (!resposta.ok || !resposta.headers.get("content-type")?.startsWith("image/")) return;
                const blob = await resposta.blob();
                if (controller.signal.aborted) return;
                url = URL.createObjectURL(blob);
                setFoto({ id: usuario.id_usuario, url });
            } catch {
                // A ausência da foto não impede o uso do perfil.
            }
        }
        carregarFoto();
        return () => {
            controller.abort();
            if (url) URL.revokeObjectURL(url);
        };
    }, [usuario?.id_usuario]);

    useEffect(() => {
        carregar();
        const sincronizar = (evento) => {
            if (evento.key === null || evento.key === "id_usuario") {
                setUsuario(null);
                requisicao.current = null;
                carregar();
            }
        };
        window.addEventListener("storage", sincronizar);
        return () => {
            versao.current += 1;
            window.removeEventListener("storage", sincronizar);
        };
    }, []);

    const fotoUrl = foto?.id === usuario?.id_usuario ? foto?.url : null;
    return <UsuarioContext.Provider value={{ usuario, fotoUrl, carregando, erro, entrar, sair, recarregar: carregar }}>{children}</UsuarioContext.Provider>;
}

export function useUsuario() {
    return useContext(UsuarioContext);
}
