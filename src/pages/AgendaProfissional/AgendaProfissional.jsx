import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CalendarDays, Ellipsis, Play, RefreshCw } from "lucide-react";
import Header from "../../components/Header/Header.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import UserAvatar from "../../components/UserAvatar/UserAvatar.jsx";
import EditarConsulta from "../../components/EditarConsulta/EditarConsulta.jsx";
import useConsultas from "../../hooks/useConsultas.js";
import { consultaAberta, dataConsulta, horarioConsulta, linkConsulta, statusConsulta } from "../../utils/consultas.js";
import css from "./AgendaProfissional.module.css";

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function AgendaProfissional() {
    const location = useLocation();
    const { consultas, carregando, erro, recarregar, atualizarConsulta } = useConsultas();
    const [dataSelecionada, setDataSelecionada] = useState(new Date());
    const [visualizacao, setVisualizacao] = useState("semana");
    const [sessaoId, setSessaoId] = useState(location.state?.sessaoId || null);
    const [mostrarCanceladas, setMostrarCanceladas] = useState(false);
    const [agora, setAgora] = useState(new Date());

    useEffect(() => {
        const timer = window.setInterval(() => setAgora(new Date()), 60000);
        return () => window.clearInterval(timer);
    }, []);

    const ano = dataSelecionada.getFullYear();
    const mes = dataSelecionada.getMonth();
    const dataChave = dataConsulta(dataSelecionada);
    const visiveis = consultas.filter((consulta) => mostrarCanceladas || consulta.status !== "CANCELADO");
    const sessoesDoDia = (data) => visiveis.filter((consulta) => dataConsulta(consulta.data_hora_inicio) === dataConsulta(data));
    const sessoesSelecionadas = sessoesDoDia(dataSelecionada);
    const proximas = consultas.filter((consulta) => consultaAberta(consulta) && new Date(consulta.data_hora_fim) > agora);
    const proxima = proximas[0];
    const selecionada = consultas.find((consulta) => consulta.sessao_id === sessaoId);

    // Inclui sabado/domingo e dias de meses vizinhos na mesma semana.
    const segunda = new Date(ano, mes, dataSelecionada.getDate());
    segunda.setDate(segunda.getDate() - (segunda.getDay() + 6) % 7);
    const semana = Array.from({ length: 7 }, (_, indice) => new Date(segunda.getFullYear(), segunda.getMonth(), segunda.getDate() + indice));
    const consultasSemana = semana.flatMap(sessoesDoDia);
    const horaInicial = Math.min(8, ...consultasSemana.map((consulta) => new Date(consulta.data_hora_inicio).getHours()));
    const horaFinal = Math.max(18, ...consultasSemana.map((consulta) => {
        const fim = new Date(consulta.data_hora_fim);
        return dataConsulta(fim) !== dataConsulta(consulta.data_hora_inicio) ? 24 : fim.getHours() + (fim.getMinutes() > 0 ? 1 : 0);
    }));
    const horarios = Array.from({ length: horaFinal - horaInicial }, (_, indice) => horaInicial + indice);
    const diasMes = Array.from({ length: new Date(ano, mes, 1).getDay() }, () => null);
    for (let dia = 1; dia <= new Date(ano, mes + 1, 0).getDate(); dia++) diasMes.push(new Date(ano, mes, dia));

    function navegar(direcao) {
        if (visualizacao === "mes") setDataSelecionada(new Date(ano, mes + direcao, 1));
        else setDataSelecionada(new Date(ano, mes, dataSelecionada.getDate() + direcao * 7));
    }

    function posicao(consulta) {
        const inicio = new Date(consulta.data_hora_inicio);
        const minutos = (inicio.getHours() - horaInicial) * 60 + inicio.getMinutes();
        const fimDoDia = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + 1);
        const fim = Math.min(new Date(consulta.data_hora_fim).getTime(), fimDoDia.getTime());
        return { top: `${50 + minutos * .8}px`, height: `${Math.max(22, (fim - inicio) / 60000 * .8 - 2)}px` };
    }

    function itemSessao(consulta, comData = false) {
        return <button key={consulta.sessao_id} className={css.itemMaisTarde} onClick={() => setSessaoId(consulta.sessao_id)}>
            <UserAvatar userId={consulta.paciente_id} nome={consulta.paciente_nome} className={css.avatarPequeno} />
            <div><strong>{consulta.paciente_nome}</strong>
                <span>{comData && `${new Date(consulta.data_hora_inicio).toLocaleDateString("pt-BR")} · `}
                    {horarioConsulta(consulta.data_hora_inicio)} – {horarioConsulta(consulta.data_hora_fim)} · {statusConsulta[consulta.status]}</span>
            </div>
        </button>;
    }

    return <div className={css.pagina}>
        <Header />
        <main className={css.areaAgenda}>
            <div className={css.container}>
                <Link to="/dashboardpsicologo">Voltar à dashboard</Link>
                <div className={css.topoPagina}>
                    <div><h1>Minha Agenda</h1><p>Consulte e gerencie suas sessões.</p></div>
                    <div className={css.visualizacao}>
                        <button className={visualizacao === "semana" ? css.visualizacaoAtiva : ""} aria-pressed={visualizacao === "semana"} onClick={() => setVisualizacao("semana")}>Semana</button>
                        <button className={visualizacao === "mes" ? css.visualizacaoAtiva : ""} aria-pressed={visualizacao === "mes"} onClick={() => setVisualizacao("mes")}>Mês</button>
                    </div>
                </div>
                <div className={css.filtros}>
                    <label>Ir para data <input type="date" value={dataChave} onChange={(evento) => {
                        if (evento.target.value) setDataSelecionada(new Date(`${evento.target.value}T12:00:00`));
                    }} /></label>
                    <label><input type="checkbox" checked={mostrarCanceladas} onChange={(evento) => setMostrarCanceladas(evento.target.checked)} /> Mostrar canceladas</label>
                    <button className={css.botaoHoje} onClick={recarregar} disabled={carregando}><RefreshCw size={15} aria-hidden="true" /> Atualizar</button>
                </div>
                {carregando && <p role="status">Carregando agenda...</p>}
                {erro && <p role="alert">{erro} <button onClick={recarregar}>Tentar novamente</button></p>}
                {!carregando && !erro && <div className={css.conteudoAgenda}>
                    <section className={css.calendario} aria-label="Calendário de sessões">
                        <div className={css.topoCalendario}>
                            <div className={css.navegacaoMes}>
                                <button aria-label={visualizacao === "semana" ? "Semana anterior" : "Mês anterior"} onClick={() => navegar(-1)}>‹</button>
                                <h2>{dataSelecionada.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</h2>
                                <button aria-label={visualizacao === "semana" ? "Próxima semana" : "Próximo mês"} onClick={() => navegar(1)}>›</button>
                            </div>
                            <button className={css.botaoHoje} onClick={() => setDataSelecionada(new Date())}>Hoje</button>
                        </div>
                        {visualizacao === "semana" ? <>
                            <p className={css.periodo}>{semana[0].toLocaleDateString("pt-BR")} a {semana[6].toLocaleDateString("pt-BR")}</p>
                            <div className={css.areaSemana}>
                                <div className={css.horariosLateral}>{horarios.map((hora) => <span key={hora}>{String(hora).padStart(2, "0")}:00</span>)}</div>
                                <div className={css.gradeSemana} style={{ height: `${50 + horarios.length * 48}px` }}>
                                    {semana.map((dia) => <div key={dataConsulta(dia)} className={`${css.diaSemana} ${dataConsulta(dia) === dataChave ? css.diaSelecionadoSemana : ""}`}>
                                        <button className={css.cabecalhoDia} aria-pressed={dataConsulta(dia) === dataChave} onClick={() => setDataSelecionada(dia)}>
                                            <span>{diasSemana[dia.getDay()]}</span><strong>{dia.getDate()}</strong>
                                        </button>
                                        {sessoesDoDia(dia).map((consulta) => <button key={consulta.sessao_id}
                                            className={`${css.sessaoMarcada} ${consulta.status === "CANCELADO" ? css.cancelada : ""}`}
                                            style={posicao(consulta)} onClick={() => setSessaoId(consulta.sessao_id)}
                                            title={`${consulta.paciente_nome} · ${horarioConsulta(consulta.data_hora_inicio)} · ${statusConsulta[consulta.status]}`}>
                                            <strong>{consulta.paciente_nome}</strong><span>{horarioConsulta(consulta.data_hora_inicio)}</span>
                                        </button>)}
                                    </div>)}
                                </div>
                            </div>
                        </> : <div className={css.areaMes}>
                            <div className={css.cabecalhoMes}>{diasSemana.map((dia) => <span key={dia}>{dia}</span>)}</div>
                            <div className={css.gradeMes}>{diasMes.map((dia, indice) => <button key={indice} disabled={!dia}
                                className={dia && dataConsulta(dia) === dataChave ? css.diaMesSelecionado : ""}
                                aria-label={dia ? `${dia.toLocaleDateString("pt-BR")}, ${sessoesDoDia(dia).length} sessões` : undefined}
                                onClick={() => setDataSelecionada(dia)}>
                                {dia && <><strong>{dia.getDate()}</strong>{sessoesDoDia(dia).length > 0 && <span>{sessoesDoDia(dia).length} sessões</span>}</>}
                            </button>)}</div>
                        </div>}
                    </section>
                    <aside className={css.lateral}>
                        <section className={css.cardLateral}>
                            <h2>Sessões de {dataSelecionada.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</h2>
                            {sessoesSelecionadas.length ? sessoesSelecionadas.map((consulta) => itemSessao(consulta)) : <p className={css.semSessao}>Nenhuma sessão neste dia.</p>}
                        </section>
                        <section className={css.cardLateral}>
                            <div className={css.tituloProxima}><h2>Próxima sessão</h2>
                                {proxima && <span>{dataConsulta(proxima.data_hora_inicio) === dataConsulta(agora) ? "HOJE" : new Date(proxima.data_hora_inicio).toLocaleDateString("pt-BR")}</span>}
                            </div>
                            {proxima ? <>
                                <div className={css.pacienteProximo}>
                                    <UserAvatar userId={proxima.paciente_id} nome={proxima.paciente_nome} className={css.avatarPaciente} />
                                    <div><strong>{proxima.paciente_nome}</strong><p>{statusConsulta[proxima.status]}</p></div>
                                </div>
                                <div className={css.infoSessao}>
                                    <p><CalendarDays size={16} aria-hidden="true" /> {new Date(proxima.data_hora_inicio).toLocaleDateString("pt-BR")} · {horarioConsulta(proxima.data_hora_inicio)} – {horarioConsulta(proxima.data_hora_fim)}</p>
                                </div>
                                <div className={css.acoesSessao}>
                                    {linkConsulta(proxima) ? <a className={css.iniciar} href={linkConsulta(proxima)} target="_blank" rel="noopener noreferrer"><Play size={16} aria-hidden="true" /> Iniciar</a>
                                        : <button className={css.iniciar} onClick={() => setSessaoId(proxima.sessao_id)}>Entrar na reunião</button>}
                                    <button className={css.mais} aria-label="Gerenciar próxima sessão" onClick={() => setSessaoId(proxima.sessao_id)}><Ellipsis size={20} aria-hidden="true" /></button>
                                </div>
                                {proximas.length > 1 && <div className={css.maisTarde}><span className={css.tituloMaisTarde}>PRÓXIMOS ATENDIMENTOS</span>{proximas.slice(1, 4).map((consulta) => itemSessao(consulta, true))}</div>}
                            </> : <p className={css.semSessao}>Nenhuma sessão futura marcada.</p>}
                        </section>
                    </aside>
                </div>}
            </div>
        </main>
        {selecionada && <EditarConsulta key={selecionada.sessao_id} consulta={selecionada} aoFechar={() => setSessaoId(null)} aoSalvar={atualizarConsulta} />}
        <Footer />
    </div>;
}
