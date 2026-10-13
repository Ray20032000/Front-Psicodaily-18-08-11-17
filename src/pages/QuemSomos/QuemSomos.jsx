import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import site from "../../layouts/SiteLayout.module.css";
import styles from "../../layouts/Institucional.module.css";

const pilares = [
    ["Registros diários", "O paciente registra humor, sono, alimentação e outros hábitos entre as sessões."],
    ["Consultas online", "Atendimento com psicólogos e psiquiatras por videochamada, com agendamento na própria plataforma."],
    ["Acompanhamento contínuo", "O profissional acessa o histórico e a evolução do paciente para conduzir o cuidado."],
];

function QuemSomos() {
    return (
        <div className={`${styles.pagina} container`}>
            <header className={styles.topo}>
                <span className={styles.rotulo}>Quem somos</span>
                <h1>Tecnologia a serviço do cuidado em saúde mental.</h1>
                <p>
                    O Psicodaily, desenvolvido pelo Grupo Verk, é uma plataforma que une tecnologia e saúde
                    mental para oferecer um acompanhamento mais acessível, organizado e contínuo.
                </p>
            </header>

            <section className={styles.bloco}>
                <h2>O que fazemos</h2>
                <p>
                    Por meio de registros diários e consultas online com psicólogos e psiquiatras, o Psicodaily
                    auxilia usuários e profissionais no cuidado da saúde emocional, promovendo um atendimento
                    mais humanizado e baseado em informações do dia a dia.
                </p>
            </section>

            <ul className={styles.lista}>
                {pilares.map(([titulo, texto]) => (
                    <li key={titulo}>
                        <h3>{titulo}</h3>
                        <p>{texto}</p>
                    </li>
                ))}
            </ul>

            <section className={styles.chamada}>
                <h2>Quer falar com a gente?</h2>
                <Link to="/contato" className={site.botao}>
                    Contato <ArrowRight size={16} aria-hidden="true" />
                </Link>
            </section>
        </div>
    );
}

export default QuemSomos;
