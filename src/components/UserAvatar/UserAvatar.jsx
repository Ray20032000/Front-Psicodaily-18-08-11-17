import { useUsuario } from "../../contexts/UsuarioContext.jsx";
import { useEffect, useState } from "react";
import AvatarPlaceholder from "../AvatarPlaceholder/AvatarPlaceholder.jsx";
import css from "./UserAvatar.module.css";

// `src` é a foto_url que a API manda junto do usuário; sem foto no bucket, cai na inicial.
export default function UserAvatar({ currentUser = false, nome, src, className, fallbackClassName }) {
    const { usuario, fotoUrl } = useUsuario();
    const [falhou, setFalhou] = useState(false);
    const nomeExibido = nome || (currentUser ? usuario?.nome : "");
    const imagemUrl = src || (currentUser ? fotoUrl : null);

    useEffect(() => setFalhou(false), [imagemUrl]);

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
