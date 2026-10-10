import { useUsuario } from "../../contexts/UsuarioContext.jsx";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../config/api.js";
import css from "./DashboardPaciente.module.css";
import { dataHoraLocal } from "../../utils/agendamento.js";
import { horarioConsulta, statusConsulta } from "../../utils/consultas.js";
import { nomesHumor } from "../../utils/registros.js";
import Skeleton, { Carregando } from "../../components/Skeleton/Skeleton.jsx";
import { Brain, CalendarCheck, CalendarDays, CheckCircle2, ChevronRight, Heart, MessageCircle, Sprout, TrendingUp } from "lucide-react";

const nomesDias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

// Mesma escala do prontuário: PESSIMO = 1 ... EXCELENTE = 5
const chavesHumor = Object.keys(nomesHumor);
const numero = (valor) => valor.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const rotuloHumor = (media) => nomesHumor[chavesHumor[Math.round(media) - 1]];
// Alturas das barras fantasmas enquanto o gráfico carrega
const alturasSkeleton = ["55%", "70%", "45%", "80%", "60%", "50%", "65%"];

const frases = [
    "Cuidar de si também é uma forma de progresso.",
    "Um passo pequeno ainda é um passo em frente.",
    "Seus sentimentos são válidos, mesmo os difíceis.",
    "Respire fundo: você não precisa resolver tudo hoje.",
    "Perceber como você está já é um ato de cuidado.",
    "Gentileza consigo mesmo também se pratica.",
];

const classesStatus = {
    REALIZADO: css.statusSucesso,
    CANCELADO: css.statusErro,
};

// Datas locais (YYYY-MM-DD) de segunda a domingo da semana atual
function semanaAtual(hoje = new Date()) {
    const segunda = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - ((hoje.getDay() + 6) % 7));
    return nomesDias.map((nome, indice) => ({
        nome,
        data: dataHoraLocal(new Date(segunda.getFullYear(), segunda.getMonth(), segunda.getDate() + indice)).slice(0, 10),
    }));
}

export default function DashboardPaciente() {

    const { usuario } = useUsuario();
    const [proximaSessao, setProximaSessao] = useState(null);
    const [historico, setHistorico] = useState([]);
    const [carregandoSessao, setCarregandoSessao] = useState(true);
    const [erroSessao, setErroSessao] = useState("");
    const [sessoesConcluidas, setSessoesConcluidas] = useState(null);
    const [humorPorDia, setHumorPorDia] = useState({});
    const [carregandoRitmo, setCarregandoRitmo] = useState(true);
    const [erroRitmo, setErroRitmo] = useState("");
    const [indiceFrase, setIndiceFrase] = useState(() => new Date().getDate() % frases.length);

    useEffect(() => {
        const controller = new AbortController();
        async function carregarSessao() {
            try {
                const resposta = await fetch(`${api}/consultas/`, { credentials: "include", signal: controller.signal });
                if (!resposta.ok) throw new Error("Não foi possível carregar suas sessões.");
                const dados = await resposta.json();
                const consultas = dados.consultas || [];
                const agora = new Date();
                const futuras = consultas
                    .filter((sessao) => sessao.status !== "CANCELADO" && new Date(sessao.data_hora_inicio) > agora)
                    .sort((a, b) => new Date(a.data_hora_inicio) - new Date(b.data_hora_inicio));
                const anteriores = consultas
                    .filter((sessao) => new Date(sessao.data_hora_inicio) <= agora)
                    .sort((a, b) => new Date(b.data_hora_inicio) - new Date(a.data_hora_inicio));
                const concluidas = consultas.filter((sessao) => {
                    const data = new Date(sessao.data_hora_inicio);
                    return sessao.status === "REALIZADO" && data.getMonth() === agora.getMonth()
                        && data.getFullYear() === agora.getFullYear();
                }).length;
                if (!controller.signal.aborted) {
                    setProximaSessao(futuras[0] || null);
                    setHistorico(anteriores.slice(0, 3));
                    setSessoesConcluidas(concluidas);
                }
            } catch (erro) {
                if (!controller.signal.aborted) setErroSessao(erro.message);
            } finally {
                if (!controller.signal.aborted) setCarregandoSessao(false);
            }
        }
        carregarSessao();
        return () => controller.abort();
    }, [usuario?.id_usuario]);

    useEffect(() => {
        const controller = new AbortController();
        async function carregarRitmo() {
            try {
                // ponytail: lê só os 100 registros mais recentes; basta para cobrir uma semana
                const resposta = await fetch(`${api}/registros/?limite=100`, { credentials: "include", signal: controller.signal });
                if (!resposta.ok) throw new Error("Não foi possível carregar seus registros.");
                const dados = await resposta.json();
                const porDia = {};
                for (const registro of dados.registros || []) {
                    const valor = chavesHumor.indexOf(registro.humor) + 1;
                    const data = registro.criado_em?.slice(0, 10);
                    if (!valor || !data) continue;
                    porDia[data] ??= { soma: 0, quantidade: 0 };
                    porDia[data].soma += valor;
                    porDia[data].quantidade += 1;
                }
                if (!controller.signal.aborted) setHumorPorDia(porDia);
            } catch (erro) {
                if (!controller.signal.aborted) setErroRitmo(erro.message);
            } finally {
                if (!controller.signal.aborted) setCarregandoRitmo(false);
            }
        }
        carregarRitmo();
        return () => controller.abort();
    }, [usuario?.id_usuario]);

    // Troca a frase a cada 20 segundos
    useEffect(() => {
        const intervalo = setInterval(() => setIndiceFrase((atual) => (atual + 1) % frases.length), 20000);
        return () => clearInterval(intervalo);
    }, []);

    const semana = semanaAtual().map((dia) => {
        const registros = humorPorDia[dia.data];
        return { ...dia, quantidade: registros?.quantidade || 0, media: registros ? registros.soma / registros.quantidade : null };
    });
    const hojeLocal = dataHoraLocal().slice(0, 10);
    const diasComRegistro = semana.filter((dia) => dia.media !== null);
    const totalSemana = diasComRegistro.length;
    const registrosSemana = diasComRegistro.reduce((total, dia) => total + dia.quantidade, 0);
    const mediaSemana = registrosSemana
        ? diasComRegistro.reduce((total, dia) => total + dia.media * dia.quantidade, 0) / registrosSemana
        : null;

    return (
        <div className={css.pagina}>

            {/* GRÁFICO */}

            <section className={`${css.card} ${css.cardGrafico}`}>

                <div className={css.tituloCard}>
                    <div>
                        <h3>Evolução Semanal</h3>
                        <p>
                            {carregandoRitmo ? <Skeleton width="160px" height="12px" /> : erroRitmo || (mediaSemana !== null
                                ? `Humor médio: ${rotuloHumor(mediaSemana)} (${numero(mediaSemana)} de 5)`
                                : "Sem registros de humor nesta semana")}
                        </p>
                    </div>
                    <span className={css.iconeTile}>
                        <TrendingUp size={18} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                </div>

                {carregandoRitmo ? (
                    <Carregando texto="Carregando gráfico de humor..." className={css.grafico}>
                        {alturasSkeleton.map((altura, indice) => (
                            <div key={indice} className={css.barraArea}>
                                <div className={css.trilho}>
                                    <Skeleton width="60%" height={altura} radius="8px 8px 4px 4px" />
                                </div>
                                <span aria-hidden="true">{nomesDias[indice].slice(0, 3)}</span>
                            </div>
                        ))}
                    </Carregando>
                ) : <div className={css.grafico}>
                    {semana.map((dia) => {
                        const descricao = dia.media === null
                            ? `${dia.nome}: sem registro`
                            : `${dia.nome}: ${rotuloHumor(dia.media)} (${numero(dia.media)} de 5, ${dia.quantidade} registro${dia.quantidade > 1 ? "s" : ""})`;
                        return (
                            <div key={dia.data} className={css.barraArea} title={descricao}>
                                <div className={css.trilho} role="img" aria-label={descricao}>
                                    {dia.media !== null && (
                                        <div
                                            className={`${css.barra} ${dia.data === hojeLocal ? css.barraDestaque : ""}`}
                                            style={{ height: `${(dia.media / 5) * 100}%` }}
                                        ></div>
                                    )}
                                </div>
                                <span aria-hidden="true">{dia.nome.slice(0, 3)}</span>
                            </div>
                        );
                    })}
                </div>}

            </section>


            {/* MOMENTO PARA VOCÊ */}

            <section className={`${css.card} ${css.cardMomento}`}>

                <div className={css.tituloCard}>
                    <div>
                        <h3>Momento para você</h3>
                        <p>Uma reflexão para agora</p>
                    </div>
                    <span className={css.iconeTile}>
                        <Sprout size={18} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                </div>

                <p className={css.frase} aria-live="polite">“{frases[indiceFrase]}”</p>

                <div className={css.rodapeMomento}>
                    <div className={css.indicadores} aria-hidden="true">
                        {frases.map((frase, indice) => (
                            <span key={frase} className={indice === indiceFrase ? css.indicadorAtivo : ""}></span>
                        ))}
                    </div>
                    <Link to="/diario" className={css.botao}>
                        Registrar no diário <ChevronRight size={14} strokeWidth={2} aria-hidden="true" />
                    </Link>
                </div>

            </section>


            {/* RITMO + PRÓXIMA SESSÃO */}

            <div className={`${css.coluna} ${css.colunaRitmo}`}>

                <section className={`${css.card} ${css.cardRitmo}`}>

                    <div className={css.tituloCard}>
                        <div>
                            <h3>Ritmo na semana</h3>
                            <p>Dias com registro no diário</p>
                        </div>
                        <span className={css.iconeTile}>
                            <CalendarCheck size={18} strokeWidth={1.8} aria-hidden="true" />
                        </span>
                    </div>

                    <p className={css.numeroDestaque}>
                        {carregandoRitmo ? <Skeleton width="90px" height="28px" /> : <>{erroRitmo ? "–" : totalSemana}<small>/7 dias</small></>}
                    </p>

                    <ul className={css.dias}>
                        {semana.map((dia) => {
                            const descricao = `${dia.nome}: ${dia.media !== null ? "registrado" : "sem registro"}`;
                            return (
                                <li key={dia.data} title={descricao}>
                                    <span
                                        role="img"
                                        aria-label={descricao}
                                        className={`${css.dia} ${dia.media !== null ? css.diaRegistrado : ""} ${dia.data === hojeLocal ? css.diaHoje : ""}`}
                                    ></span>
                                    <small aria-hidden="true">{dia.nome[0]}</small>
                                </li>
                            );
                        })}
                    </ul>

                    <p className={css.legenda}>
                        {carregandoRitmo ? <Skeleton width="70%" height="12px" /> : erroRitmo || (totalSemana
                            ? "Continue registrando como você se sente."
                            : "Nenhum registro de humor nesta semana ainda.")}
                    </p>

                </section>


                <section className={css.proximaSessao}>

                    <div>
                        <span>PRÓXIMA SESSÃO</span>
                        <h2>
                            {carregandoSessao ? <Skeleton width="160px" height="22px" className={css.skeletonClaro} /> : erroSessao || (proximaSessao
                                ? new Date(proximaSessao.data_hora_inicio).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
                                : "Nenhuma sessão agendada")}
                        </h2>
                        <p>
                            {proximaSessao && <><Heart size={14} strokeWidth={1.8} aria-hidden="true" /> Com {proximaSessao.profissional_nome || "profissional"}</>}
                        </p>
                    </div>

                    <div className={css.calendario}>
                        <CalendarDays size={22} strokeWidth={1.8} aria-hidden="true" />
                    </div>

                </section>

            </div>


            {/* RELAXAR + RESUMO */}

            <div className={`${css.coluna} ${css.colunaRelaxar}`}>

                <section className={`${css.card} ${css.areaRelaxar}`}>

                    <div className={css.tituloCard}>
                        <div>
                            <h3>Para você relaxar</h3>
                            <p>Pausa guiada</p>
                        </div>
                    </div>

                    <div className={css.cardMeditacao}>
                        <a className={css.link} href="https://youtu.be/dyYO-k-fQDQ?is=UbH9MZ5leCp7XnVo" aria-label="Meditação Paz Interior e Equilíbrio">
                            <img src="/relaxar.png" alt="" />
                        </a>
                        <div className={css.conteudoMeditacao}>
                            <div className={css.tempo}>
                                <span>MEDITAÇÃO</span>
                                <small>10 min</small>
                            </div>
                            <h3>Paz Interior e Equilíbrio</h3>
                        </div>
                    </div>

                </section>


                <div className={css.cardsResumo}>

                    <div className={`${css.card} ${css.cardPequeno}`}>
                        <span className={css.iconeTile}>
                            <Brain size={18} strokeWidth={1.8} aria-hidden="true" />
                        </span>
                        <div>
                            <h4>Dica de hoje</h4>
                            <p>Pratique 5 min de respiração.</p>
                        </div>
                    </div>

                    <div className={`${css.card} ${css.cardPequeno}`}>
                        <span className={`${css.iconeTile} ${css.iconeSucesso}`}>
                            <CheckCircle2 size={18} strokeWidth={1.8} aria-hidden="true" />
                        </span>
                        <div>
                            <h4>Sessões concluídas</h4>
                            {carregandoSessao ? <Skeleton width="70px" height="12px" /> : <p><strong>{sessoesConcluidas ?? "–"}</strong> neste mês</p>}
                        </div>
                    </div>

                </div>

            </div>


            {/* HISTÓRICO DE CONSULTAS */}

            <section className={`${css.card} ${css.cardHistorico}`}>

                <div className={css.tituloCard}>
                    <div>
                        <h3>Histórico de consultas</h3>
                        <p>Suas últimas sessões</p>
                    </div>
                    <Link to="/sessoes" className={css.pill}>Ver todas</Link>
                </div>

                {carregandoSessao && (
                    <Carregando texto="Carregando histórico de consultas..." className={css.listaHistorico}>
                        {[1, 2, 3].map((item) => (
                            <div key={item} className={css.itemHistorico}>
                                <Skeleton width="40px" height="40px" radius="10px" />
                                <div className={css.infoHistorico}>
                                    <Skeleton width="70%" height="12px" />
                                    <Skeleton width="40%" height="10px" className={css.skeletonLinha} />
                                </div>
                                <Skeleton width="50px" height="10px" />
                            </div>
                        ))}
                    </Carregando>
                )}
                {!carregandoSessao && erroSessao && <p className={css.legenda} role="alert">{erroSessao}</p>}
                {!carregandoSessao && !erroSessao && historico.length === 0 && (
                    <p className={css.legenda}>Nenhuma consulta anterior ainda.</p>
                )}

                <ul className={css.listaHistorico}>
                    {historico.map((sessao) => {
                        const data = new Date(sessao.data_hora_inicio);
                        return (
                            <li key={sessao.sessao_id} className={css.itemHistorico}>
                                <span className={css.dataHistorico}>
                                    <strong>{data.getDate()}</strong>
                                    {data.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
                                </span>
                                <div className={css.infoHistorico}>
                                    <strong>{sessao.profissional_nome || "Profissional"}</strong>
                                    <small>{horarioConsulta(sessao.data_hora_inicio)}</small>
                                </div>
                                <span className={classesStatus[sessao.status] || css.statusNeutro}>
                                    {statusConsulta[sessao.status] || sessao.status}
                                </span>
                            </li>
                        );
                    })}
                </ul>

            </section>


            {/* CHAT */}

            <button className={css.chat} type="button" aria-label="Abrir chat">
                <MessageCircle size={20} strokeWidth={1.8} aria-hidden="true" />
            </button>

        </div>
    );
}
