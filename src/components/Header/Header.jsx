import { Menu } from "lucide-react";
import ContaMenu from "../ContaMenu/ContaMenu.jsx";
import styles from "./Header.module.css";

function Header() {
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
                <ContaMenu className="ms-auto" />
            </div>
        </header>
    );
}

export default Header;
