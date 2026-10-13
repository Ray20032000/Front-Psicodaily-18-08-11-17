import { Mail, Phone } from "lucide-react";
import styles from "../../layouts/Institucional.module.css";

const canais = [
    [Mail, "E-mail", "PSICOdaily@gmail.com", "mailto:PSICOdaily@gmail.com"],
    [Phone, "Telefone", "(18) 93452-8042", "tel:+5518934528042"],
];

function Contato() {
    return (
        <div className={`${styles.pagina} container`}>
            <header className={styles.topo}>
                <span className={styles.rotulo}>Contato</span>
                <h1>Fale com a equipe do Psicodaily.</h1>
                <p>Dúvidas sobre a plataforma, parcerias ou suporte: use um dos canais abaixo.</p>
            </header>

            <ul className={styles.canais}>
                {canais.map(([Icone, titulo, valor, href]) => (
                    <li key={titulo}>
                        <a href={href}>
                            <Icone size={20} aria-hidden="true" />
                            <span className={styles.canalTitulo}>{titulo}</span>
                            <span className={styles.canalValor}>{valor}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Contato;
