import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Activity, ArrowLeft, CalendarDays, ChartNoAxesCombined, Clock3, Smile, Utensils } from "lucide-react";
import Header from "../../components/Header/Header.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import MoodIcon from "../../components/MoodIcon/MoodIcon.jsx";
import UserAvatar from "../../components/UserAvatar/UserAvatar.jsx";
import api from "../../config/api.js";
import { nomesHumor, nomesSono, nomesAlimentacao } from "../../utils/registros.js";
import css from "./Prontuario.module.css";

const escala = ["Muito Mal", "Mal", "Neutro", "Bem", "Muito Bem"];
const dataLegivel = (data) => data ? data.slice(0, 10).split("-").reverse().join("/") : "Não informada";
const sonoLegivel = (minutos) => minutos == null ? "Não informado" : `${Math.floor(Math.round(minutos) / 60)}h ${Math.round(minutos) % 60}min`;

function GraficoHumor({ dados }) {
    const [selecionado, setSelecionado] = useState(null);
    if (!dados.length) return <p className={css.mensagem}>Sem registros de humor neste período.</p>;
    const inicio = Date.parse(dados[0].data);
    const fim = Date.parse(dados[dados.length - 1].data);
    const pontos = dados.map((item) => ({
        ...item,
        x: inicio === fim ? 300 : 10 + ((Date.parse(item.data) - inicio) / (fim - inicio)) * 580,
        y: 140 - ((item.valor - 1) / 4) * 130,
    }));
    const ativo = pontos.find((item) => item.data === selecionado);
    return <>
        <div className={css.areaGrafico}>
            <div className={css.eixoHumor}>{[...escala].reverse().map((nome) => <span key={nome}>{nome}</span>)}</div>
            <div className={css.grafico}>
                <svg viewBox="0 0 600 150" preserveAspectRatio="none" role="group" aria-label="Evolução do humor: média diária de 1 (Muito Mal) a 5 (Muito Bem)">
                    {[10, 42.5, 75, 107.5, 140].map((y) => <line key={y} x1="0" x2="600" y1={y} y2={y} />)}
                    <polyline points={pontos.map(({ x, y }) => `${x},${y}`).join(" ")} className={css.linhaGrafico} />
                    {pontos.map((item) => <circle key={item.data} cx={item.x} cy={item.y} r="5" className={css.pontoGrafico}
                        tabIndex={0} role="img" aria-label={`${dataLegivel(item.data)}: ${item.valor.toFixed(1)} de 5, ${item.quantidade} registro(s)`}
                        onFocus={() => setSelecionado(item.data)} onBlur={() => setSelecionado(null)}
                        onMouseEnter={() => setSelecionado(item.data)} onMouseLeave={() => setSelecionado(null)}
                        onClick={() => setSelecionado(item.data)}>
                        <title>{dataLegivel(item.data)} · {item.valor.toFixed(1)} / 5</title>
                    </circle>)}
                </svg>
                <div className={css.datasGrafico}><span>{dataLegivel(dados[0].data)}</span>{dados.length > 1 && <span>{dataLegivel(dados[dados.length - 1].data)}</span>}</div>
            </div>
        </div>
        <p className={css.mensagem} aria-live="polite">{ativo ? `${dataLegivel(ativo.data)}: ${ativo.valor.toFixed(1)} / 5 · ${ativo.quantidade} registro(s)` : "Selecione um ponto para ver a média do dia. Dias sem registros não têm pontos."}</p>
        <details className={css.tabelaDados}><summary>Ver dados do gráfico</summary>
            <table><caption>Médias diárias de humor</caption>
                <thead><tr><th scope="col">Data</th><th scope="col">Humor (1–5)</th><th scope="col">Registros</th></tr></thead>
                <tbody>{dados.map((item) => <tr key={item.data}><td>{dataLegivel(item.data)}</td><td>{item.valor.toFixed(1)}</td><td>{item.quantidade}</td></tr>)}</tbody>
            </table>
        </details>
    </>;
}

export default function Prontuario() {
    const { idPaciente } = useParams();
    // Remonta ao trocar de paciente, descartando dados e requisições anteriores.
    return <ConteudoProntuario key={idPaciente} idPaciente={idPaciente} />;
}

function ConteudoProntuario({ idPaciente }) {
    const [dias, setDias] = useState(30);
    const [dados, setDados] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [tentativa, setTentativa] = useState(0);
    const [antes, setAntes] = useState(null);
    useEffect(() => {
        const controller = new AbortController();
        async function carregar() {
            setCarregando(true);
            setErro("");
            try {
                if (!idPaciente || !/^\d+$/.test(idPaciente)) throw new Error("Selecione um paciente na agenda ou no dashboard.");
                const parametros = new URLSearchParams({ dias });
                if (antes) parametros.set("antes", antes);
                const resposta = await fetch(`${api}/prontuario/${idPaciente}?${parametros}`, { credentials: "include", signal: controller.signal });
                if (!resposta.ok) throw new Error(resposta.status === 403 ? "Você não tem acesso ao prontuário deste paciente." :
                    resposta.status === 401 ? "Sua sessão expirou. Entre novamente." : "Não foi possível carregar o prontuário. Tente novamente.");
                const resultado = await resposta.json();
                if (!controller.signal.aborted) setDados((atual) => ({
                    ...resultado,
                    registros: antes ? [...(atual?.registros || []), ...resultado.registros] : resultado.registros,
                }));
            } catch (error) {
                if (!controller.signal.aborted) setErro(error.message);
            } finally {
                if (!controller.signal.aborted) setCarregando(false);
            }
        }
        carregar();
        return () => controller.abort();
    }, [idPaciente, dias, antes, tentativa]);
    function trocarPeriodo(event) {
        setDados(null);
        setAntes(null);
        setDias(Number(event.target.value));
    }
    const resumo = dados?.resumo;
    return <div className={css.pagina}>
        <Header />
        <main className={css.areaProntuario}><div className={css.container}>
            <div className={css.pacienteTopo}>
                <Link to="/dashboardpsicologo" className={css.voltar} aria-label="Voltar aos pacientes"><ArrowLeft size={18} /></Link>
                {dados && <div className={css.fotoPaciente}><UserAvatar userId={idPaciente} nome={dados.paciente.nome} /></div>}
                <div><h1>{dados?.paciente.nome || "Prontuário do paciente"}</h1><p>Registros e acompanhamento do paciente</p></div>
            </div>
            <div className={css.filtroPeriodo}><label htmlFor="periodo-prontuario">Período do diário</label>
                <select id="periodo-prontuario" value={dias} onChange={trocarPeriodo}>
                    <option value={7}>Últimos 7 dias</option><option value={30}>Últimos 30 dias</option><option value={90}>Últimos 90 dias</option>
                </select>
            </div>
            {carregando && <p role="status" className={css.mensagem}>Carregando prontuário...</p>}
            {erro && <div role="alert" className={css.erro}><p>{erro}</p><button onClick={() => setTentativa((valor) => valor + 1)} disabled={carregando}>Tentar novamente</button></div>}
            {dados && <>
                <div className={css.cardsResumo}>
                    <div className={css.cardResumo}><span className={css.tituloResumo}><CalendarDays size={16} /> ÚLTIMA CONSULTA REALIZADA</span><strong>{dados.ultimaConsulta ? dataLegivel(dados.ultimaConsulta.data) : "Sem consulta realizada"}</strong><small>Com você</small></div>
                    <div className={css.cardResumo}><span className={css.tituloResumo}><Clock3 size={16} /> REGISTROS NO PERÍODO</span><strong>{resumo.totalRegistros} registro(s)</strong><small>{resumo.diasRegistrados} de {dias} dias com preenchimento</small></div>
                    <div className={css.cardResumo}><span className={css.tituloResumo}><Smile size={16} /> HUMOR MÉDIO ({dias}D)</span><strong className={css.azul}>{resumo.humorMedio == null ? "Sem registros" : escala[Math.round(resumo.humorMedio) - 1]}</strong><small>{resumo.humorMedio == null ? "Ainda não há dados de humor." : `${resumo.humorMedio.toFixed(1)} de 5 · média dos registros`}</small></div>
                </div>
                <div className={css.gridPrincipal}><div className={css.colunaEsquerda}>
                    <section className={css.cardGrafico}><div className={css.tituloCard}><h2><ChartNoAxesCombined size={18} /> Evolução de humor</h2></div><GraficoHumor key={dias} dados={dados.evolucaoHumor} /></section>
                    <section className={css.cardRegistros}><h2><CalendarDays size={18} /> Registros do diário</h2>
                        <div className={css.listaRegistros}>
                            {!dados.registros.length && <p className={css.mensagem}>Nenhum registro neste período.</p>}
                            {dados.registros.map((registro) => {
                                const humor = nomesHumor[registro.humor] || "Não informado";
                                const classe = ["BOM", "EXCELENTE"].includes(registro.humor) ? css.humorBom : registro.humor === "NEUTRO" ? css.humorNeutro : css.humorRuim;
                                return <article className={css.registro} key={registro.registro_id}>
                                    <div className={`${css.iconeRegistro} ${classe}`}><MoodIcon humor={humor} /></div>
                                    <div className={css.conteudoRegistro}><div className={css.topoRegistro}><strong>{dataLegivel(registro.criado_em)}</strong><span className={classe}>{humor}</span></div>
                                        <p className={css.textoRegistro}>{registro.anotacao || "Sem anotação neste registro."}</p>
                                        <div className={css.detalhesRegistro}>
                                            <span><Clock3 size={15} /> Sono: {sonoLegivel(registro.minutos_sono)} · {nomesSono[registro.qualidade_sono] || "Qualidade não informada"}</span>
                                            <span><Utensils size={15} /> Alimentação: {nomesAlimentacao[registro.alimentacao] || "Não informada"}</span>
                                            <span><Activity size={15} /> Exercício: {registro.exercicio_fisico == null ? "Não informado" : registro.exercicio_fisico ? "Sim" : "Não"}</span>
                                            {registro.interacao != null && <span>Socialização: {registro.interacao} categoria(s) de interação</span>}
                                        </div>
                                    </div>
                                </article>;
                            })}
                        </div>
                        {dados.proximo_cursor && <button className={css.verRegistros} disabled={carregando} onClick={() => { setAntes(dados.proximo_cursor); setTentativa((valor) => valor + 1); }}>{carregando ? "Carregando..." : "Carregar mais registros"}</button>}
                    </section>
                </div>
                <aside className={css.cardAnotacoes}><div className={css.tituloAnotacoes}><h2><Activity size={18} /> Resumo de hábitos</h2></div>
                    <p className={css.mensagem}>Informações registradas pelo paciente nos últimos {dias} dias.</p>
                    <dl className={css.resumoHabitos}>
                        <div><dt>Tempo médio de sono</dt><dd>{sonoLegivel(resumo.minutosSonoMedio)}</dd></div>
                        <div><dt>Registros com exercício físico</dt><dd>{resumo.registrosComExercicio} de {resumo.totalRegistros}</dd></div>
                        <div><dt>Dias com registros</dt><dd>{resumo.diasRegistrados} de {dias}</dd></div>
                    </dl>
                </aside></div>
            </>}
        </div></main>
        <Footer />
    </div>;
}
