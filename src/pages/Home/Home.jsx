import { useState } from "react";
import { Link } from "react-router-dom";
import { MotionConfig, motion } from "motion/react";
import { ArrowRight, BookHeart, CalendarDays, ChartLine, Check, ClipboardList, ImageOff, QrCode, Video } from "lucide-react";
import { useUsuario } from "../../contexts/UsuarioContext.jsx";
import BlurText from "../../components/BlurText/BlurText.jsx";
import SpotlightCard from "../../components/SpotlightCard/SpotlightCard.jsx";
import GlareHover from "../../components/GlareHover/GlareHover.jsx";
import site from "../../layouts/SiteLayout.module.css";
import styles from "./Home.module.css";

// Capturas reais ficam em public/screenshots/; enquanto o arquivo não existir mostra um espaço reservado
function Captura({ arquivo, alt, raio = "14px", className = "" }) {
    const [faltando, setFaltando] = useState(false);

    return (
        <GlareHover width="100%" borderRadius={raio} glareOpacity={0.3} glareSize={40} className={`${styles.captura} ${className}`} style={{ border: 0 }}>
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

function Cabecalho({ rotulo, titulo, texto, centralizado = false }) {
    return (
        <Revelar className={`${styles.cabecalho} ${centralizado ? styles.centralizado : ""}`}>
            <span className={styles.rotulo}>{rotulo}</span>
            <h2>{titulo}</h2>
            {texto && <p>{texto}</p>}
        </Revelar>
    );
}

const destaquesHero = ["Videochamada integrada", "Pagamento via Pix", "Diário entre as sessões"];

const recursos = [
    [BookHeart, "Diário de humor", "Humor, sono, alimentação e atividade física registrados em poucos toques."],
    [ChartLine, "Evolução do humor", "Gráficos que mostram como o paciente está entre uma sessão e outra."],
    [Video, "Videochamada integrada", "A consulta acontece na própria plataforma, sem instalar nada."],
    [CalendarDays, "Agenda", "Horários organizados por dia e mês, com o status de cada sessão."],
    [ClipboardList, "Prontuário", "Histórico de consultas e registros de cada paciente em um só lugar."],
    [QrCode, "Pagamento via Pix", "O paciente paga a sessão por Pix, com a cobrança gerada na hora."],
];

const perfis = [
    {
        id: "pacientes",
        rotulo: "Para pacientes",
        titulo: "Acompanhe sua jornada no seu ritmo.",
        itens: [
            ["Diário de humor", "Registre humor, sono, alimentação, atividade física e anotações do dia."],
            ["Suas sessões", "Veja as próximas consultas e entre na videochamada pela plataforma."],
            ["Escolha do profissional", "Encontre um psicólogo, agende o horário e pague via Pix."],
        ],
    },
    {
        id: "profissionais",
        rotulo: "Para profissionais",
        titulo: "Sua rotina clínica organizada.",
        itens: [
            ["Agenda", "Consultas organizadas por dia e mês, em uma única tela."],
            ["Prontuário", "Histórico de consultas e evolução do humor de cada paciente."],
            ["Carteira", "Recebimentos, extrato e previsão das próximas sessões."],
        ],
    },
];

const passos = [
    ["Crie sua conta", "Cadastro rápido para pacientes. Profissionais informam o registro no conselho."],
    ["Agende a sessão", "Escolha o profissional e o horário, e pague a consulta via Pix."],
    ["Acompanhe a jornada", "Registre o dia no diário e entre na videochamada no horário marcado."],
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

            {/* HERO */}

            <section className={styles.hero}>
                <div className={`${styles.heroTexto} container`}>
                    <Revelar>
                        <span className={styles.selo}><span className={styles.ponto} aria-hidden="true" /> Acompanhamento psicológico</span>
                    </Revelar>
                    <BlurText as="h1" text="O cuidado continua além da consulta." delay={90} className={styles.titulo} />
                    <Revelar atraso={0.4}>
                        <p>
                            O Psicodaily conecta pacientes e profissionais em uma plataforma que organiza
                            consultas e acompanha a jornada de cuidado, de uma sessão à outra.
                        </p>
                        <div className={styles.ctas}>
                            <Link to={usuario ? "/app" : "/cadastropaciente"} className={site.botao}>
                                {usuario ? "Ir para o painel" : "Começar agora"} <ArrowRight size={16} aria-hidden="true" />
                            </Link>
                            <a href="#demonstracao" className={site.botaoSecundario}>Ver a plataforma</a>
                        </div>
                        <ul className={styles.destaques}>
                            {destaquesHero.map((texto) => (
                                <li key={texto}><Check size={16} aria-hidden="true" /> {texto}</li>
                            ))}
                        </ul>
                    </Revelar>
                </div>

                <Revelar atraso={0.6} className={`${styles.heroVisual} container`}>
                    <div className={styles.janela}>
                        <div className={styles.janelaBarra} aria-hidden="true">
                            <span /><span /><span />
                            <span className={styles.endereco}>psicodaily.com.br/app</span>
                        </div>
                        <Captura arquivo="dashboard.png" alt="Dashboard do paciente no Psicodaily" raio="0 0 12px 12px" className={styles.heroCaptura} />
                    </div>
                </Revelar>
            </section>

            {/* RECURSOS */}

            <section id="plataforma" className={styles.secao}>
                <div className="container">
                    <Cabecalho centralizado rotulo="Plataforma" titulo="O cuidado não termina quando a consulta acaba."
                        texto="Consultas, registros do dia a dia e histórico no mesmo lugar. O paciente registra como está entre as sessões; o profissional chega à próxima consulta com esse contexto em mãos." />
                    <div className={styles.recursos}>
                        {recursos.map(([Icone, titulo, texto], i) => (
                            <Revelar key={titulo} atraso={(i % 3) * 0.08} className={styles.recurso}>
                                <span className={styles.icone}><Icone size={20} strokeWidth={1.8} aria-hidden="true" /></span>
                                <h3>{titulo}</h3>
                                <p>{texto}</p>
                            </Revelar>
                        ))}
                    </div>
                </div>
            </section>

            {/* PERFIS */}

            <section className={`${styles.secao} ${styles.secaoSuperficie}`}>
                <div className="container">
                    <Cabecalho rotulo="Para quem é" titulo="Feito para os dois lados do cuidado." />
                    <div className={styles.perfis}>
                        {perfis.map(({ id, rotulo, titulo, itens }, i) => (
                            <Revelar key={id} atraso={i * 0.1}>
                                <SpotlightCard
                                    id={id}
                                    theme="light"
                                    spotlightColor={i ? "rgb(255 255 255 / 0.22)" : "var(--site-primaria-clara)"}
                                    spotlightSize={340}
                                    className={`${styles.perfil} ${i ? styles.perfilDestaque : ""}`}
                                    style={{
                                        "--spotlight-card-surface": i ? "var(--site-primaria)" : "var(--site-fundo)",
                                        "--spotlight-card-border": "var(--site-borda)",
                                        "--spotlight-card-shadow": "none",
                                    }}
                                >
                                    <span className={styles.rotuloPerfil}>{rotulo}</span>
                                    <h3>{titulo}</h3>
                                    <ul className={styles.itens}>
                                        {itens.map(([nome, texto]) => (
                                            <li key={nome}>
                                                <span className={styles.check}><Check size={14} strokeWidth={2.5} aria-hidden="true" /></span>
                                                <div>
                                                    <h4>{nome}</h4>
                                                    <p>{texto}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </SpotlightCard>
                            </Revelar>
                        ))}
                    </div>
                </div>
            </section>

            {/* COMO FUNCIONA */}

            <section className={styles.secao}>
                <div className="container">
                    <Cabecalho centralizado rotulo="Como funciona" titulo="Do cadastro à sessão em três passos." />
                    <ol className={styles.passos}>
                        {passos.map(([titulo, texto], i) => (
                            <li key={titulo}>
                                <Revelar atraso={i * 0.1} className={styles.passo}>
                                    <span className={styles.numero}>{String(i + 1).padStart(2, "0")}</span>
                                    <h3>{titulo}</h3>
                                    <p>{texto}</p>
                                </Revelar>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* DEMONSTRAÇÃO */}

            <section id="demonstracao" className={`${styles.secao} ${styles.secaoSuperficie}`}>
                <div className="container">
                    <Cabecalho rotulo="Demonstração" titulo="Por dentro do Psicodaily"
                        texto="Telas reais da plataforma, do lado do paciente e do profissional." />
                    <div className={styles.demoGrade}>
                        {demonstracao.map(([arquivo, titulo, legenda], i) => (
                            <Revelar key={arquivo} atraso={i * 0.1}>
                                <figure className={styles.demoItem}>
                                    <Captura arquivo={arquivo} alt={`Tela ${titulo} do Psicodaily`} raio="10px" />
                                    <figcaption><strong>{titulo}</strong>{legenda}</figcaption>
                                </figure>
                            </Revelar>
                        ))}
                    </div>
                </div>
            </section>

            {/* CHAMADA FINAL */}

            <section className={styles.secao}>
                <div className="container">
                    <Revelar className={styles.final}>
                        <div className={styles.finalTexto}>
                            <h2>Um lugar para cuidar com calma.</h2>
                            <p>Pacientes e profissionais acompanhando juntos, de uma consulta à outra.</p>
                            <div className={styles.ctas}>
                                <Link to={usuario ? "/app" : "/cadastropaciente"} className={styles.botaoClaro}>
                                    {usuario ? "Ir para o painel" : "Criar conta"} <ArrowRight size={16} aria-hidden="true" />
                                </Link>
                                {!usuario && <Link to="/cadastropsicologo" className={styles.botaoContorno}>Sou profissional</Link>}
                            </div>
                        </div>
                        <img className={styles.capivara} src="/capivara-meditando.png" alt="Capivara sentada na grama, de olhos fechados, meditando" loading="lazy" />
                    </Revelar>
                </div>
            </section>

        </MotionConfig>
    );
}

export default Home;
