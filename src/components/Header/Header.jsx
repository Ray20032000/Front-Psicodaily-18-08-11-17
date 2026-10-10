import { Menu, Settings } from "lucide-react";
import { useState } from "react";
import { useUsuario } from "../../contexts/UsuarioContext.jsx";
import UserAvatar from "../UserAvatar/UserAvatar.jsx";
import ConfigMenu from "../ConfigMenu/ConfigMenu.jsx";
import styles from "./Header.module.css";

function Header() {
    const { usuario } = useUsuario();
    const [menuAberto, setMenuAberto] = useState(false);

    return (
        <header className="w-100 p-3">
            <div
                className="geist d-flex align-items-center justify-content-between"
                style={{ height: "60px" }}
            >
                <button
                    type="button"
                    style={{ height: "3rem", width: "3rem" }}
                    className={`${styles.acao} border-0 p-2 rounded-2 d-flex d-lg-none align-items-center justify-content-center`}
                    data-bs-toggle="offcanvas"
                    data-bs-target="#sidebar"
                    aria-controls="sidebar"
                    aria-label="Abrir menu"
                >
                    <Menu />
                </button>
                <div className="d-flex gap-2 align-items-center ms-auto">
                    <div className="position-relative">
                        <button
                            type="button"
                            style={{ height: "3rem", width: "3rem" }}
                            className={`${styles.acao} border-0 p-2 rounded-2 d-flex align-items-center justify-content-center`}
                            onClick={() => setMenuAberto(!menuAberto)}
                            aria-label="Configurações"
                            aria-expanded={menuAberto}
                        >
                            <Settings />
                        </button>
                        {menuAberto && (
                            <div className={styles.configMenu}>
                                <ConfigMenu />
                            </div>
                        )}
                    </div>
                    <div style={{ height: "3rem" }} className={`${styles.acao} px-3 rounded-2 d-flex align-items-center gap-2`}>
                        <UserAvatar currentUser className={styles.avatar} fallbackClassName={styles.avatar} />

                        <div className="d-none d-md-flex flex-column align-items-start">
                            <span className="fw-semibold">{usuario?.nome}</span>
                            {usuario?.email && <span className="mini-text fw-semibold text-secondary">{usuario.email}</span>}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
