import styles from "./Header.module.css"
import { Link } from "react-router-dom";

function Header() {

    return (
        <header className={styles.fundo}>
            <nav className="navbar navbar-expand-sm">
                <div className="container">
                    <Link to="/" className="navbar-brand">
                        <img className={styles.logo} src="/logo.png" alt="Logo PSICOdaily" />
                    </Link>
                    <div className={`${styles.botoes} navbar-nav ms-auto`}>
                        <Link to="/" className={`${styles.espaco} nav-link`}>Home</Link>
                        <Link to="/login" className={`${styles.espaco} nav-link`}>Login</Link>
                        <Link to="/cadastropaciente" className={`${styles.espaco} nav-link`}>Cadastro</Link>
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Header;