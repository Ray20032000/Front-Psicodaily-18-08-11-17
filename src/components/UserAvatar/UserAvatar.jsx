import { useEffect, useState } from "react";
import api from "../../config/api.js";

export default function UserAvatar({ className, fallbackClassName, headClassName, bodyClassName }) {
    const [avatarUrl, setAvatarUrl] = useState(null);
    const autenticado = Boolean(localStorage.getItem("id_usuario"));

    useEffect(() => {
        let url;

        async function carregarAvatar() {
            if (!autenticado) {
                return;
            }

            const resposta = await fetch(`${api}/usuarios/me/avatar`, {
                credentials: "include"
            });

            if (resposta.ok) {
                url = URL.createObjectURL(await resposta.blob());
                setAvatarUrl(url);
            }
        }

        carregarAvatar().catch(() => setAvatarUrl(null));

        return () => {
            if (url) {
                URL.revokeObjectURL(url);
            }
        };
    }, [autenticado]);

    if (!autenticado) {
        return null;
    }

    if (avatarUrl) {
        return <img className={className} src={avatarUrl} alt="Foto do usuário" />;
    }

    return (
        <div className={fallbackClassName} aria-label="Avatar do usuário">
            <div className={headClassName}></div>
            <div className={bodyClassName}></div>
        </div>
    );
}
