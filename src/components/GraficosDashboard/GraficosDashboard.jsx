import { Component, useId } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Label, LabelList, Pie, PieChart, XAxis, YAxis } from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "../ui/chart.jsx";
import Seletor from "../Seletor/Seletor.jsx";
import Skeleton from "../Skeleton/Skeleton.jsx";
import { dataConsulta } from "../../utils/consultas.js";
import { formatarCentavos } from "../../utils/dinheiro.js";
import { nomesHumor } from "../../utils/registros.js";
import css from "./GraficosDashboard.module.css";

// Cards e gráficos do dashboard do profissional, replicando a galeria do shadcn/ui
// https://ui.shadcn.com/charts

const configSessoes = {
    realizadas: { label: "Realizadas", color: "var(--cor-grafico-1)" },
    agendadas: { label: "Agendadas", color: "var(--cor-grafico-2)" },
    canceladas: { label: "Canceladas", color: "var(--cor-grafico-3)" },
};
const configFluxo = {
    recebido: { label: "Recebido", color: "var(--cor-grafico-1)" },
    taxas: { label: "Taxas", color: "var(--cor-grafico-3)" },
};
const configHumor = { pacientes: { label: "Pacientes", color: "var(--cor-grafico-1)" } };
const periodos = [
    { valor: "90", rotulo: "Últimos 3 meses" },
    { valor: "30", rotulo: "Últimos 30 dias" },
    { valor: "7", rotulo: "Últimos 7 dias" },
];
const diaCurto = (dia) => new Date(`${dia}T12:00:00`).toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
const variacao = (atual, anterior) => anterior > 0 ? ((atual - anterior) / anterior) * 100 : null;
const porcentagem = (valor) => `${valor > 0 ? "+" : ""}${valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;

export function Card({ titulo, descricao, acao, rodape, divisor = false, centralizado = false, className = "", children }) {
    return (
        <section className={`${css.card} ${className}`}>
            <header className={`${css.cabecalho} ${divisor ? css.cabecalhoDivisor : ""} ${centralizado ? css.cabecalhoCentro : ""}`}>
                <div className={css.titulos}>
                    <h2 className={css.titulo}>{titulo}</h2>
                    {descricao && <p className={css.descricao}>{descricao}</p>}
                </div>
                {acao}
            </header>
            <div className={css.conteudo}>{children}</div>
            {rodape && <footer className={css.rodape}>{rodape}</footer>}
        </section>
    );
}

function Tendencia({ valor, detalhe }) {
    const Icone = valor < 0 ? TrendingDown : TrendingUp;
    return (
        <>
            <div className={css.tendencia}>
                {valor === null ? "Sem sessões no mês anterior para comparar" : <>
                    {valor < 0 ? "Queda" : "Alta"} de {Math.abs(valor).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% em relação ao mês anterior
                    <Icone size={16} aria-hidden="true" />
                </>}
            </div>
            <div className={css.suave}>{detalhe}</div>
        </>
    );
}

function Vazio({ children }) {
    return <p className={css.vazio}>{children}</p>;
}

// Dados externos inesperados quebram só o card, não a página inteira
export class Protegido extends Component {
    state = { falhou: false };

    static getDerivedStateFromError() {
        return { falhou: true };
    }

    componentDidCatch(erro) {
        console.error(erro);
    }

    render() {
        if (!this.state.falhou) return this.props.children;
        return (
            <Card titulo={this.props.titulo}>
                <Vazio>Não foi possível exibir estes dados agora.</Vazio>
            </Card>
        );
    }
}

// "Section Cards" do dashboard-01 do shadcn
export function CardResumo({ descricao, valor, variacao: valorVariacao = null, destaque, detalhe, carregando }) {
    const Icone = valorVariacao < 0 ? TrendingDown : TrendingUp;
    return (
        <section className={`${css.card} ${css.resumo}`}>
            <header className={css.cabecalho}>
                <div className={css.titulos}>
                    <p className={css.descricao}>{descricao}</p>
                    <strong className={css.valor}>{carregando ? <Skeleton width="120px" height="30px" /> : valor}</strong>
                </div>
                {valorVariacao !== null && !carregando && <span className={css.selo}>
                    <Icone size={12} aria-hidden="true" /> {porcentagem(valorVariacao)}
                </span>}
            </header>
            <footer className={css.rodape}>
                <div className={css.tendencia}>{destaque}</div>
                <div className={css.suave}>{detalhe}</div>
            </footer>
        </section>
    );
}

// Area Chart - Interactive. `consultas` são as de /pagamentos/ganhos, em centavos
export function GraficoFluxoCaixa({ consultas, dias, onDias, carregando, erro, recarregar }) {
    const id = useId().replace(/:/g, "");
    const hoje = new Date();
    const pontos = Array.from({ length: dias }, (_, indice) => ({
        dia: dataConsulta(new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - dias + 1 + indice)),
        recebido: 0, taxas: 0,
    }));
    const porDia = Object.fromEntries(pontos.map((ponto) => [ponto.dia, ponto]));
    (consultas || []).filter((consulta) => consulta.situacao !== "REEMBOLSADO").forEach((consulta) => {
        const ponto = porDia[consulta.pago_em.slice(0, 10)];
        if (!ponto) return;
        ponto.recebido += consulta.valor_centavos;
        ponto.taxas += consulta.taxa_plataforma_centavos + consulta.taxa_cartao_centavos;
    });

    return (
        <Card titulo="Fluxo de caixa" descricao="Pagamentos recebidos e taxas descontadas" divisor
            acao={<Seletor value={String(dias)} onChange={(valor) => onDias(Number(valor))} opcoes={periodos}
                aria-label="Período do fluxo de caixa" className={css.seletor} />}>
            {erro ? <Vazio>{erro} <button type="button" className={css.link} onClick={recarregar}>Tentar novamente</button></Vazio>
                : carregando && !consultas ? <Skeleton width="100%" height="250px" radius="8px" />
                    : <ChartContainer config={configFluxo} className={css.alturaArea} aria-label="Recebido e taxas por dia">
                        <AreaChart accessibilityLayer data={pontos}>
                            <defs>
                                {Object.keys(configFluxo).map((chave) => (
                                    <linearGradient key={chave} id={`${id}-${chave}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={`var(--color-${chave})`} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={`var(--color-${chave})`} stopOpacity={0.1} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="dia" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} tickFormatter={diaCurto} />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent
                                labelFormatter={(item) => diaCurto(item.dia)} valueFormatter={formatarCentavos} />} />
                            {Object.keys(configFluxo).map((chave) => (
                                // monotone: suave como a "natural" do shadcn, mas sem ultrapassar os pontos (nunca abaixo de 0)
                                <Area key={chave} dataKey={chave} type="monotone" fill={`url(#${id}-${chave})`} stroke={`var(--color-${chave})`} />
                            ))}
                            <ChartLegend content={<ChartLegendContent />} />
                        </AreaChart>
                    </ChartContainer>}
        </Card>
    );
}

// Bar Chart - Stacked + Legend
export function GraficoSessoesMes({ dados }) {
    const [anterior, atual] = dados.slice(-2);
    const ativas = (mes) => mes.realizadas + mes.agendadas;
    const vazio = dados.every((mes) => !ativas(mes) && !mes.canceladas);

    return (
        <Card titulo="Sessões por mês" descricao={`${dados[0].mesCompleto} – ${atual.mesCompleto}`}
            rodape={!vazio && <Tendencia valor={variacao(ativas(atual), ativas(anterior))}
                detalhe="Sessões não canceladas, comparando com o mês anterior" />}>
            {vazio ? <Vazio>Nenhuma sessão nos últimos 6 meses.</Vazio> : <>
                <ChartContainer config={configSessoes} aria-label="Sessões por mês e status">
                    <BarChart accessibilityLayer data={dados}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="mes" tickLine={false} tickMargin={10} axisLine={false} />
                        <ChartTooltip content={<ChartTooltipContent labelFormatter={(item) => item.mesCompleto} />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="realizadas" stackId="a" fill="var(--color-realizadas)" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="agendadas" stackId="a" fill="var(--color-agendadas)" />
                        <Bar dataKey="canceladas" stackId="a" fill="var(--color-canceladas)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ChartContainer>
                <details className={css.tabela}>
                    <summary>Ver dados do gráfico</summary>
                    <table>
                        <thead><tr><th scope="col">Mês</th>{Object.values(configSessoes).map(({ label }) => <th scope="col" key={label}>{label}</th>)}</tr></thead>
                        <tbody>{dados.map((mes) => (
                            <tr key={mes.chave}><td>{mes.mesCompleto}</td><td>{mes.realizadas}</td><td>{mes.agendadas}</td><td>{mes.canceladas}</td></tr>
                        ))}</tbody>
                    </table>
                </details>
            </>}
        </Card>
    );
}

// Pie Chart - Donut with Text
export function GraficoStatusMes({ mes }) {
    const fatias = Object.keys(configSessoes).map((status) => ({ status, quantidade: mes[status], fill: `var(--color-${status})` }));
    const total = fatias.reduce((soma, fatia) => soma + fatia.quantidade, 0);
    const taxaCancelamento = total ? (mes.canceladas / total) * 100 : 0;

    return (
        <Card titulo="Sessões do mês" descricao={mes.mesCompleto} centralizado
            rodape={total > 0 && <>
                <div className={css.tendencia}>{mes.realizadas} realizada(s) · {mes.agendadas} agendada(s) · {mes.canceladas} cancelada(s)</div>
                <div className={css.suave}>Taxa de cancelamento de {taxaCancelamento.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%</div>
            </>}>
            {!total ? <Vazio>Nenhuma sessão neste mês.</Vazio>
                : <ChartContainer config={configSessoes} className={css.donut} aria-label={`${total} sessões no mês, por status`}>
                    <PieChart>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="status" />} />
                        <Pie data={fatias} dataKey="quantidade" nameKey="status" innerRadius={60} strokeWidth={5}>
                            <Label content={({ viewBox }) => viewBox && "cx" in viewBox && (
                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                    <tspan x={viewBox.cx} y={viewBox.cy} className={css.totalDonut}>{total}</tspan>
                                    <tspan x={viewBox.cx} y={viewBox.cy + 24} className={css.legendaDonut}>Sessões</tspan>
                                </text>
                            )} />
                        </Pie>
                        <ChartLegend content={<ChartLegendContent nameKey="status" />} />
                    </PieChart>
                </ChartContainer>}
        </Card>
    );
}

// Bar Chart - Horizontal com rótulos
export function GraficoHumorPacientes({ dados }) {
    const total = dados.reduce((soma, item) => soma + item.pacientes, 0);
    const bem = dados.filter((item) => ["BOM", "EXCELENTE"].includes(item.humor)).reduce((soma, item) => soma + item.pacientes, 0);

    return (
        <Card titulo="Humor dos pacientes" descricao="Último registro no diário de cada paciente"
            rodape={total > 0 && <>
                <div className={css.tendencia}>{bem} de {total} paciente(s) se sentindo bem</div>
                <div className={css.suave}>Pacientes sem registros no diário não aparecem</div>
            </>}>
            {!total ? <Vazio>Nenhum paciente registrou o humor ainda.</Vazio>
                : <ChartContainer config={configHumor} aria-label="Pacientes por humor mais recente">
                    <BarChart accessibilityLayer data={dados} layout="vertical" margin={{ right: 24 }}>
                        <CartesianGrid horizontal={false} />
                        <YAxis dataKey="humor" type="category" tickLine={false} tickMargin={10} axisLine={false}
                            width={72} tickFormatter={(humor) => nomesHumor[humor]} />
                        <XAxis dataKey="pacientes" type="number" allowDecimals={false} hide />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line"
                            labelFormatter={(item) => nomesHumor[item.humor]} />} />
                        <Bar dataKey="pacientes" fill="var(--color-pacientes)" radius={4}>
                            <LabelList dataKey="pacientes" position="right" offset={8} className={css.rotuloBarra} fontSize={12} />
                        </Bar>
                    </BarChart>
                </ChartContainer>}
        </Card>
    );
}
