import { createContext, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import api from "../config/api.js";

const UsuarioContext = createContext(null);

export function UsuarioProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [fotoVersao, setFotoVersao] = useState(0);
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

    function carregar(forcar = false) {
        const atual = ++versao.current;
        setCarregando(true);
        setErro("");
        if (forcar) requisicao.current = null;
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
        carregar();
        const sincronizar = (evento) => {
            if (evento.key === null || evento.key === "id_usuario") {
                setUsuario(null);
                requisicao.current = null;
                carregar();
            }
        };
        window.addEventListener("storage", sincronizar);

        // 401 fora de /auth/ é sessão vencida (o JWT dura 8h); em /auth/ é senha ou código errado.
        const fetchOriginal = window.fetch;
        window.fetch = async (entrada, opcoes) => {
            const resposta = await fetchOriginal(entrada, opcoes);
            const url = String(entrada);
            if (resposta.status === 401 && url.startsWith(api) && !url.startsWith(`${api}/auth/`) && localStorage.getItem("id_usuario")) {
                toast.error("Sua sessão expirou. Entre novamente.", { id: "sessao-expirada" });
                limpar(); // o ProtectedRoute manda para /login
            }
            return resposta;
        };

        return () => {
            versao.current += 1;
            window.removeEventListener("storage", sincronizar);
            window.fetch = fetchOriginal;
        };
    }, []);

    // A URL da foto não muda ao trocar a imagem; o ?v= força o navegador a buscar a nova.
    const fotoUrl = usuario?.foto_url && (fotoVersao ? `${usuario.foto_url}?v=${fotoVersao}` : usuario.foto_url);
    function recarregarFoto() {
        setFotoVersao(versaoAtual => versaoAtual + 1);
    }
    return <UsuarioContext.Provider value={{ usuario, fotoUrl, carregando, erro, entrar, sair, recarregar: carregar, recarregarFoto }}>{children}</UsuarioContext.Provider>;
}

export function useUsuario() {
    return useContext(UsuarioContext);
}
