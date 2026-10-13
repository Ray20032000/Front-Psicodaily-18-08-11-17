import { useState } from "react";
import { Link } from "react-router-dom";
import { MotionConfig, motion } from "motion/react";
import { ArrowRight, ImageOff } from "lucide-react";
import { useUsuario } from "../../contexts/UsuarioContext.jsx";
import BlurText from "../../components/BlurText/BlurText.jsx";
import SpotlightCard from "../../components/SpotlightCard/SpotlightCard.jsx";
import GlareHover from "../../components/GlareHover/GlareHover.jsx";
import site from "../../layouts/SiteLayout.module.css";
import styles from "./Home.module.css";

// Capturas reais ficam em public/screenshots/; enquanto o arquivo não existir mostra um espaço reservado
function Captura({ arquivo, alt, className = "" }) {
    const [faltando, setFaltando] = useState(false);

    return (
        <GlareHover width="100%" borderRadius="14px" glareOpacity={0.35} glareSize={40} className={`${styles.captura} ${className}`} style={{ border: 0 }}>
            {faltando ? (
                <div className={styles.capturaVazia}>
                    <ImageOff size={20} aria-hidden="true" />
                    <span>public/screenshots/{arquivo}</span>
                </div>
            ) : (
                <img src={`/screenshots/${arquivo}`} alt={alt} loading="lazy" onError={() => setFaltando(true)} />
            )}
        </GlareHover>
    );
}

// Surge suavemente ao entrar na tela (MotionConfig reducedMotion="user" tira o deslocamento)
function Revelar({ children, className = "", atraso = 0 }) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: atraso, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    );
}

const perfis = [
    {
        id: "pacientes",
        rotulo: "Para pacientes",
        titulo: "Acompanhe sua jornada no seu ritmo.",
        recursos: [
            ["Diário de humor", "Registre humor, sono, alimentação, atividade física e anotações do dia."],
            ["Suas sessões", "Veja as próximas consultas e entre na videochamada pela plataforma."],
            ["Escolha do profissional", "Encontre um psicólogo, agende o horário e pague via Pix."],
        ],
    },
    {
        id: "profissionais",
        rotulo: "Para profissionais",
        titulo: "Sua rotina clínica organizada.",
        recursos: [
            ["Agenda", "Consultas organizadas por dia e mês, em uma única tela."],
            ["Prontuário", "Histórico de consultas e evolução do humor de cada paciente."],
            ["Registros do paciente", "Acesso aos registros do diário entre uma sessão e outra."],
        ],
    },
];

const demonstracao = [
    ["sessoes.png", "Sessões", "Consultas agendadas e histórico."],
    ["diario.png", "Diário de humor", "O registro diário do paciente."],
    ["agenda.png", "Agenda", "A semana do profissional."],
];

function Home() {
    const { usuario } = useUsuario();

    return (
        <MotionConfig reducedMotion="user">
            <section className={`${styles.hero} container`}>
                <div className={styles.heroTexto}>
                    <Revelar>
                        <span className={styles.selo}>Acompanhamento psicológico</span>
                    </Revelar>
                    <BlurText as="h1" text="O cuidado continua além da consulta." delay={90} className={styles.titulo} />
                    <Revelar atraso={0.4}>
                        <p>
                            O Psicodaily conecta pacientes e profissionais em uma plataforma que ajuda a
                            organizar consultas e acompanhar a jornada de cuidado.
                        </p>
                        <div className={styles.ctas}>
                            <a href="#demonstracao" className={site.botao}>
                                Conhecer a plataforma <ArrowRight size={16} aria-hidden="true" />
                            </a>
                            <Link to={usuario ? "/app" : "/login"} className={site.botaoSecundario}>
                                {usuario ? "Ir para o painel" : "Acessar minha conta"}
                            </Link>
                        </div>
                    </Revelar>
                </div>
                <Revelar atraso={0.6} className={styles.heroVisual}>
                    <Captura arquivo="dashboard.png" alt="Dashboard do paciente no Psicodaily" className={styles.heroCaptura} />
                </Revelar>
            </section>

            <section id="plataforma" className={`${styles.proposta} container`}>
                <Revelar>
                    <h2>O cuidado não termina quando a consulta acaba.</h2>
                </Revelar>
                <Revelar atraso={0.1}>
                    <p>
                        Consultas, registros do dia a dia e histórico ficam no mesmo lugar. O paciente
                        registra como está entre as sessões; o profissional chega à próxima consulta
                        com esse contexto em mãos.
                    </p>
                </Revelar>
            </section>

            <section className={`${styles.perfis} container`}>
                {perfis.map(({ id, rotulo, titulo, recursos }, i) => (
                    <Revelar key={id} atraso={i * 0.1}>
                        <SpotlightCard
                            id={id}
                            theme="light"
                            spotlightColor="var(--site-verde)"
                            spotlightSize={320}
                            className={`${styles.perfil} ${i ? styles.perfilVerde : ""}`}
                            style={{
                                "--spotlight-card-surface": i ? "var(--site-verde-claro)" : "var(--site-superficie)",
                                "--spotlight-card-border": "var(--site-borda)",
                                "--spotlight-card-shadow": "none",
                            }}
                        >
                            <span className={styles.rotulo}>{rotulo}</span>
                            <h3>{titulo}</h3>
                            <ul className={styles.recursos}>
                                {recursos.map(([nome, texto]) => (
                                    <li key={nome}>
                                        <h4>{nome}</h4>
                                        <p>{texto}</p>
                                    </li>
                                ))}
                            </ul>
                        </SpotlightCard>
                    </Revelar>
                ))}
            </section>

            <section id="demonstracao" className={`${styles.demo} container`}>
                <Revelar>
                    <h2>Por dentro do Psicodaily</h2>
                    <p className={styles.demoSubtitulo}>Telas reais da plataforma, do lado do paciente e do profissional.</p>
                </Revelar>
                <div className={styles.demoGrade}>
                    {demonstracao.map(([arquivo, titulo, legenda], i) => (
                        <Revelar key={arquivo} atraso={i * 0.1}>
                            <figure>
                                <Captura arquivo={arquivo} alt={`Tela ${titulo} do Psicodaily`} />
                                <figcaption><strong>{titulo}</strong> {legenda}</figcaption>
                            </figure>
                        </Revelar>
                    ))}
                </div>
            </section>

            <section className={`${styles.final} container`}>
                <Revelar className={styles.finalTexto}>
                    <h2>Um lugar para cuidar com calma.</h2>
                    <p>Pacientes e profissionais acompanhando juntos, de uma consulta à outra.</p>
                    <div className={styles.ctas}>
                        <Link to={usuario ? "/app" : "/cadastropaciente"} className={site.botao}>
                            {usuario ? "Ir para o painel" : "Criar conta"} <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                        {!usuario && <Link to="/login" className={site.botaoSecundario}>Já tenho conta</Link>}
                    </div>
                </Revelar>
                <Revelar atraso={0.15}>
                    <img className={styles.capivara} src="/capivara-meditando.png" alt="Capivara sentada na grama, de olhos fechados, meditando" loading="lazy" />
                </Revelar>
            </section>
        </MotionConfig>
    );
}

export default Home;
