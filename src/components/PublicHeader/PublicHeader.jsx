import { useUsuario } from "../../contexts/UsuarioContext.jsx";
import styles from "./PublicHeader.module.css"
import { Link } from "react-router-dom";
import ContaMenu from "../ContaMenu/ContaMenu.jsx";
import psicodaily from "../../assets/psicodaily.svg";

function PublicHeader() {
    const { usuario } = useUsuario();
    const autenticado = Boolean(usuario);

    return (
        <header className={styles.fundo}>
            <nav className="navbar navbar-expand-sm">
                <div className="container">
                    <Link to="/" className="navbar-brand">
                        <img className={styles.logo} src={psicodaily} data-logo alt="Logo PSICOdaily" />
                    </Link>
                    <div className={`${styles.botoes} navbar-nav ms-auto`}>
                        <Link to="/" className={`${styles.espaco} nav-link`}>Home</Link>
                        {autenticado ? (
                            <>
                                <Link to="/app" className={`${styles.espaco} nav-link`}>Dashboard</Link>
                                <Link to="/preferencias" className={`${styles.espaco} nav-link`}>Preferências</Link>
                                <Link to="/alterarsenha" className={`${styles.espaco} nav-link`}>Alterar senha</Link>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className={`${styles.espaco} nav-link`}>Login</Link>
                                <Link to="/cadastropaciente" className={`${styles.espaco} nav-link`}>Cadastro</Link>
                            </>
                        )}
                    </div>

                    {autenticado && <ContaMenu mostrarNome={false} className="ms-3" />}
                </div>
            </nav>
        </header>
    );
}

export default PublicHeader;
