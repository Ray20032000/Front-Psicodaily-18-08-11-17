import { useEffect, useId, useState } from "react";
import { Link } from "react-router-dom";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import api from "../../config/api.js";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart.jsx";
import { Card, CardResumo } from "../GraficosDashboard/GraficosDashboard.jsx";
import Seletor from "../Seletor/Seletor.jsx";
import Skeleton from "../Skeleton/Skeleton.jsx";
import css from "./Desempenho.module.css";

const config = { total: { label: "Visualizações", color: "var(--cor-grafico-1)" } };
const periodos = [
    { valor: "7", rotulo: "Últimos 7 dias" },
    { valor: "30", rotulo: "Últimos 30 dias" },
    { valor: "90", rotulo: "Últimos 3 meses" },
];
const dataCurta = (dia) => new Date(`${dia}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
const variacao = (atual, anterior) => anterior > 0 ? ((atual - anterior) / anterior) * 100 : null;

// A API só devolve os dias com visualização; no gráfico, os outros valem zero
function preencherDias(relatorio) {
    const totais = new Map(relatorio.visualizacoes_por_dia.map((item) => [item.dia, item.total]));
    const inicio = new Date(`${relatorio.data_inicio}T12:00:00`);
    return Array.from({ length: relatorio.dias }, (_, indice) => {
        const data = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + indice, 12);
        const dia = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
        return { dia, total: totais.get(dia) || 0 };
    });
}

// Relatório do plano Profissional; o Premium soma a conversão e a comparação com o período anterior
export default function Desempenho() {
    const gradienteId = `visualizacoes-${useId().replace(/:/g, "")}`;
    const [dias, setDias] = useState("30");
    const [relatorio, setRelatorio] = useState(null);
    const [erro, setErro] = useState("");
    const [precisaPlano, setPrecisaPlano] = useState(false);
    const [versao, setVersao] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setErro("");
        fetch(`${api}/profissionais/me/desempenho?dias=${dias}`, { credentials: "include", signal: controller.signal })
            .then(async (resposta) => {
                const dados = await resposta.json().catch(() => null);
                if (resposta.status === 403 && dados?.plano_necessario) {
                    setPrecisaPlano(true);
                    return;
                }
                if (!resposta.ok || !dados) throw new Error(dados?.error || "Não foi possível carregar seu desempenho.");
                setPrecisaPlano(false);
                setRelatorio(dados);
            })
            .catch((falha) => { if (!controller.signal.aborted) setErro(falha.message); });
        return () => controller.abort();
    }, [dias, versao]);

    if (precisaPlano) {
        return <Card titulo="Desempenho" descricao="Veja quantas pessoas visitam seu perfil e quantas agendam.">
            <p className={css.chamada}>Este relatório faz parte do plano Profissional. <Link to="/assinaturas">Ver planos</Link></p>
        </Card>;
    }

    const anterior = relatorio?.periodo_anterior;
    const pontos = relatorio ? preencherDias(relatorio) : [];

    return <Card
        titulo="Desempenho"
        descricao="Visitas ao seu perfil e agendamentos no período"
        acao={<Seletor className={css.seletor} value={dias} onChange={setDias} opcoes={periodos} aria-label="Período do desempenho" />}
    >
        {erro && !relatorio && <p role="alert" className={css.chamada}>{erro} <button type="button" className={css.link} onClick={() => setVersao((atual) => atual + 1)}>Tentar novamente</button></p>}
        {!erro && !relatorio && <Skeleton height="260px" radius="10px" />}
        {relatorio && <>
            <div className={css.resumos}>
                <CardResumo descricao="Visualizações" valor={relatorio.visualizacoes}
                    variacao={anterior ? variacao(relatorio.visualizacoes, anterior.visualizacoes) : null}
                    destaque="Visitas ao seu perfil" detalhe={`Em ${relatorio.dias} dias`} />
                <CardResumo descricao="Agendamentos" valor={relatorio.agendamentos_feitos}
                    variacao={anterior ? variacao(relatorio.agendamentos_feitos, anterior.agendamentos_feitos) : null}
                    destaque="Feitos no período" detalhe={relatorio.conversao != null
                        ? `Conversão: ${(relatorio.conversao * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% das visitas`
                        : `Em ${relatorio.dias} dias`} />
                <CardResumo descricao="Novos favoritos" valor={relatorio.novos_favoritos}
                    variacao={anterior ? variacao(relatorio.novos_favoritos, anterior.novos_favoritos) : null}
                    destaque="Pacientes que guardaram seu perfil" detalhe={`Em ${relatorio.dias} dias`} />
                <CardResumo descricao="Consultas realizadas" valor={relatorio.consultas.REALIZADO}
                    variacao={anterior ? variacao(relatorio.consultas.REALIZADO, anterior.consultas.REALIZADO) : null}
                    destaque={`${relatorio.consultas.CANCELADO} cancelada(s)`} detalhe={`${relatorio.consultas.AGENDADO + relatorio.consultas.CONFIRMADO} em aberto`} />
            </div>

            {relatorio.visualizacoes === 0 ? <p className={css.chamada}>Nenhuma visita ao seu perfil neste período.</p> : <>
                <ChartContainer config={config} className={css.grafico} aria-label="Visualizações do perfil por dia">
                    <AreaChart accessibilityLayer data={pontos} margin={{ top: 12, right: 16, bottom: 8, left: 0 }}>
                        <defs>
                            <linearGradient id={gradienteId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-total)" stopOpacity={0.35} />
                                <stop offset="95%" stopColor="var(--color-total)" stopOpacity={0.03} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="var(--cor-borda)" />
                        <XAxis dataKey="dia" tickFormatter={dataCurta} tickLine={false} axisLine={false} tickMargin={10} minTickGap={32} />
                        <YAxis allowDecimals={false} width={36} tickLine={false} axisLine={false} tickMargin={8} />
                        <ChartTooltip cursor={{ stroke: null }} content={<ChartTooltipContent indicator="line" labelFormatter={(item) => dataCurta(item.dia)} />} />
                        <Area dataKey="total" type="monotone" stroke="var(--color-total)" strokeWidth={2} fill={`url(#${gradienteId})`} isAnimationActive={false} />
                    </AreaChart>
                </ChartContainer>
                <details className={css.tabela}>
                    <summary>Ver dados do gráfico</summary>
                    <table>
                        <caption>Visualizações do perfil por dia</caption>
                        <thead><tr><th scope="col">Data</th><th scope="col">Visualizações</th></tr></thead>
                        <tbody>{pontos.filter((ponto) => ponto.total).map((ponto) => <tr key={ponto.dia}><td>{dataCurta(ponto.dia)}</td><td>{ponto.total}</td></tr>)}</tbody>
                    </table>
                </details>
            </>}
        </>}
    </Card>;
}
