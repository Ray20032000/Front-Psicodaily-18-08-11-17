import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar.jsx";
import Header from "../components/Header/Header.jsx";
import Assistente from "../components/Assistente/Assistente.jsx";
import { useUsuario } from "../contexts/UsuarioContext.jsx";
import styles from "./AppLayout.module.css";

// Shell do app logado: só o <main> rola, Sidebar e Header ficam sempre visíveis
function AppLayout() {
    const { usuario } = useUsuario();
    const { pathname } = useLocation();
    // O botão flutuante cobriria o envio do chat e os controles da chamada
    const semAssistente = pathname.startsWith("/mensagens") || pathname.startsWith("/videochamada");
    return (
        <div className={styles.app}>
            <Sidebar />
            <div className={styles.coluna}>
                <Header />
                <main className={styles.conteudo}>
                    <Outlet />
                </main>
            </div>
            {usuario?.tipo_usuario === "PACIENTE" && <Assistente oculto={semAssistente} />}
        </div>
    );
}

export default AppLayout;
