import styles from "./Header.module.css"
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import UserAvatar from "../UserAvatar/UserAvatar.jsx";
import api from "../../config/api.js";

function Header() {
    const navigate = useNavigate();
    const [autenticado, setAutenticado] = useState(() => Boolean(localStorage.getItem("id_usuario")));
    const [tipoUsuario, setTipoUsuario] = useState(() => localStorage.getItem("tipo_usuario"));

    const dashboardPorRole = {
        PACIENTE: "/dashboardpaciente",
        PSICOLOGO: "/dashboardpsicologo",
        PSIQUIATRA: "/dashboardpsicologo",
        ADMIN: "/dashboardadm"
    };

    useEffect(() => {
        const atualizarAutenticacao = () => {
            setAutenticado(Boolean(localStorage.getItem("id_usuario")));
            setTipoUsuario(localStorage.getItem("tipo_usuario"));
        };

        window.addEventListener("psicodaily:auth-changed", atualizarAutenticacao);
        return () => window.removeEventListener("psicodaily:auth-changed", atualizarAutenticacao);
    }, []);

    async function sair() {
        await fetch(`${api}/usuarios/logout`, {
            method: "POST",
            credentials: "include"
        }).catch(() => undefined);

        localStorage.clear();
        window.dispatchEvent(new Event("psicodaily:auth-changed"));
        navigate("/login");
    }

    return (
        <header className={styles.fundo}>
            <nav className="navbar navbar-expand-sm">
                <div className="container">
                    <Link to="/" className="navbar-brand">
                        <img className={styles.logo} src="/logo.png" alt="Logo PSICOdaily" />
                    </Link>
                    <div className={`${styles.botoes} navbar-nav ms-auto`}>
                        <Link to="/" className={`${styles.espaco} nav-link`}>Home</Link>
                        {autenticado ? (
                            dashboardPorRole[tipoUsuario] && (
                                <Link to={dashboardPorRole[tipoUsuario]} className={`${styles.espaco} nav-link`}>
                                    Dashboard
                                </Link>
                            )
                        ) : (
                            <>
                                <Link to="/login" className={`${styles.espaco} nav-link`}>Login</Link>
                                <Link to="/cadastropaciente" className={`${styles.espaco} nav-link`}>Cadastro</Link>
                            </>
                        )}
                    </div>
                    {autenticado && (
                        <div className={styles.usuarioAutenticado}>
                            <UserAvatar
                                className={styles.avatar}
                                fallbackClassName={styles.avatar}
                            />
                            <button type="button" className={styles.logout} onClick={sair} title="Sair">
                                Sair
                            </button>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
}

export default Header;