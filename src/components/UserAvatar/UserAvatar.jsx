import { useUsuario } from "../../contexts/UsuarioContext.jsx";
import { useEffect, useState } from "react";
import api from "../../config/api.js";
import AvatarPlaceholder from "../AvatarPlaceholder/AvatarPlaceholder.jsx";
import css from "./UserAvatar.module.css";

export default function UserAvatar({ userId, currentUser = false, nome, src, className, fallbackClassName }) {
    const { usuario, fotoUrl } = useUsuario();
    const usuarioLogado = usuario?.id_usuario;
    const [imagem, setImagem] = useState(null);
    const [falhou, setFalhou] = useState(false);
    const nomeExibido = nome || (currentUser ? usuario?.nome : "");
    const id = currentUser ? usuarioLogado : userId;
    const idValido = /^\d+$/.test(String(id)) && Number(id) > 0;
    const endpoint = idValido ? `${api}/usuarios/${currentUser ? "me" : Number(id)}/avatar` : null;
    // A identidade evita mostrar a foto de uma sessão anterior.
    const origem = `${usuarioLogado || ""}:${id || ""}:${src || endpoint || ""}`;


    useEffect(() => {
        setFalhou(false);
        setImagem(null);
        if (currentUser || src || !endpoint) return;
        const controller = new AbortController();
        let objectUrl;
        async function carregarAvatar() {
            try {
                const resposta = await fetch(endpoint, { credentials: "include", signal: controller.signal });
                if (!resposta.ok || !resposta.headers.get("content-type")?.startsWith("image/")) return;
                const blob = await resposta.blob();
                if (controller.signal.aborted) return;
                objectUrl = URL.createObjectURL(blob);
                setImagem({ origem, url: objectUrl });
            } catch {
                // Sem foto ou sem conexão, mantém o avatar alternativo.
            }
        }
        carregarAvatar();
        return () => {
            controller.abort();
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [currentUser, endpoint, origem, src]);

    const imagemUrl = src || (currentUser ? fotoUrl : (imagem?.origem === origem ? imagem.url : null));
    const exibirImagem = imagemUrl && !falhou;
    return (
        <div className={`${css.avatar} ${exibirImagem ? className || "" : fallbackClassName || className || ""}`}>
            {exibirImagem ? (
                <img className={css.imagem} src={imagemUrl} alt={nomeExibido ? `Foto de ${nomeExibido}` : "Foto do usuário"} onError={() => setFalhou(true)} />
            ) : (
                <span className={css.fallback} role="img" aria-label={nomeExibido ? `Avatar de ${nomeExibido}` : "Usuário sem foto"}>
                    {nomeExibido?.trim().charAt(0).toUpperCase() || <AvatarPlaceholder />}
                </span>
            )}
        </div>
    );
}
