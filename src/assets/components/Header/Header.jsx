import "../../../global.css";
import styles from "./Header.module.css"
import { Link } from "react-router-dom";

function Header() {

    return (
        <div className={styles.fundo}>
            <img className={styles.logo}
                src="/logo.png"
                alt="Logo PSICOdaily"
            />
            <div className={styles.botoes}>
                <Link to="/" className={styles.espaco}>Home</Link>
                <Link to="/Login" className={styles.espaco}>Login</Link>
                <Link to="/Cadastropaciente" className={styles.espaco}>Cadastro</Link>
            </div>

        </div>
    );
}

export default Header;