import { BookOpen, CalendarDays, LayoutDashboard, LogOut, UsersRound } from "lucide-react";
import styles from "./Menu.module.css";
import { useNavigate } from "react-router-dom";

function Menu() {

    const navigate = useNavigate();
    return (
        <div>
            <main className={styles.container}>

                <div className={styles.botoes}>
                    <LayoutDashboard className={styles.imagem} size={20} strokeWidth={1.8} aria-hidden="true" />
                    <button className={styles.botao}
                            onClick={() => navigate("/dashboardpaciente")}>
                    Dashboard</button>
                </div>

                <div className={styles.botoes}>
                    <BookOpen className={styles.imagem} size={20} strokeWidth={1.8} aria-hidden="true" />
                    <button className={styles.botao}
                            onClick={() => navigate("/diario")}>
                    Diário </button>
                </div>

                <div className={styles.botoes}>
                    <CalendarDays className={styles.imagem} size={20} strokeWidth={1.8} aria-hidden="true" />
                    <button className={styles.botao}
                            onClick={() => navigate("/sessoes")}
                    >Sessões</button>
                </div>

                <div className={styles.botoes}>
                    <UsersRound className={styles.imagem} size={20} strokeWidth={1.8} aria-hidden="true" />
                    <button className={styles.botao}
                            onClick={() => navigate("/profissionais")}
                    >Marketplace</button>
                </div>

                <div className={styles.linha}></div>
                <div className={styles.saida}>
                    <LogOut className={styles.imagem} size={20} strokeWidth={1.8} aria-hidden="true" />
                    <button className={styles.sair}
                            onClick={() => navigate("/")}
                    >
                        Sair
                    </button>
                </div>

            </main>
        </div>
    );
}

export default Menu;