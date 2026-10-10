import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar.jsx";
import Header from "../components/Header/Header.jsx";
import styles from "./AppLayout.module.css";

// Shell do app logado: só o <main> rola, Sidebar e Header ficam sempre visíveis
function AppLayout() {
    return (
        <div className={styles.app}>
            <Sidebar />
            <div className={styles.coluna}>
                <Header />
                <main className={styles.conteudo}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AppLayout;
