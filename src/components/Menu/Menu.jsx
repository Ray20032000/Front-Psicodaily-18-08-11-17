import styles from "./Menu.module.css";
import { useNavigate } from "react-router-dom";

function Menu() {

    const navigate = useNavigate();
    return (
        <div>
            <main className={styles.container}>

                <div className={styles.botoes}>
                    <img className={styles.imagem}
                        src="/Dashboard.png"
                        alt="Logo Dashboard"
                    />
                    <button className={styles.botao}
                            onClick={() => navigate("/dashboardpaciente")}>
                    Dashboard</button>
                </div>

                <div className={styles.botoes}>
                    <img className={styles.imagem}
                        src="/Diario.png"
                        alt="Logo Diario"
                    />
                    <button className={styles.botao}
                            onClick={() => navigate("/DiarioDeHumor")}>
                    Diário </button>
                </div>

                <div className={styles.botoes}>
                    <img className={styles.imagem}
                        src="/Sessoes.png"
                        alt="Logo Sessoes"
                    />
                    <button className={styles.botao}
                            onClick={() => navigate("/sessoes")}
                    >Sessões</button>
                </div>

                <div className={styles.botoes}>
                    <img className={styles.imagem}
                        src="/Marketplace.png"
                        alt="Logo Marketplace"
                    />
                    <button className={styles.botao}
                            onClick={() => navigate("/selecionarprofissional")}
                    >Marketplace</button>
                </div>

                <div className={styles.linha}></div>
                <div className={styles.saida}>
                    <img className={styles.imagem}
                        src={"/Sair.png"}
                        alt="Logo Sair"
                    />
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