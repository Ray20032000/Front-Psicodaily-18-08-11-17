import { toast } from "sonner";
import { useUsuario } from "../../contexts/UsuarioContext.jsx";
import styles from "./Header.module.css"
import { Link, useNavigate } from "react-router-dom";
import UserAvatar from "../UserAvatar/UserAvatar.jsx";
import { LogOut } from "lucide-react";

function Header() {
    const navigate = useNavigate();
    const { usuario, sair: encerrarSessao } = useUsuario();
    const autenticado = Boolean(usuario);
    const tipoUsuario = usuario?.tipo_usuario;

    const dashboardPorRole = {
        PACIENTE: "/dashboardpaciente",
        PSICOLOGO: "/dashboardpsicologo",
        PSIQUIATRA: "/dashboardpsicologo",
        ADMIN: "/dashboardadm"
    };


    async function sair() {
        try {
            await encerrarSessao();
            navigate("/login");
        } catch {
            toast.error("Falha ao sair. Tente novamente.");
        }
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
                                currentUser
                                className={styles.avatar}
                                fallbackClassName={styles.avatar}
                            />
                            <button type="button" className={styles.logout} onClick={sair} title="Sair">
                                <LogOut size={16} strokeWidth={1.8} aria-hidden="true" />
                                <span>Sair</span>
                            </button>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
}

export default Header;
