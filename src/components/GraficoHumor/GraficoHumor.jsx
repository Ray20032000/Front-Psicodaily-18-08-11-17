import { useId } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart.jsx";
import css from "./GraficoHumor.module.css";

const config = { valor: { label: "Humor médio", color: "#1871b3" } };
const escala = ["Muito Mal", "Mal", "Neutro", "Bem", "Muito Bem"];
const numero = (valor) => valor.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const dataCompleta = (data) => data.slice(0, 10).split("-").reverse().join("/");
const dataEixo = (timestamp) => new Date(timestamp).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", timeZone: "UTC",
});

export default function GraficoHumor({ dados }) {
    const gradienteId = `humor-${useId().replace(/:/g, "")}`;
    if (!dados.length) return <p className={css.mensagem}>Sem registros de humor neste período.</p>;

    const pontos = dados.map((item) => ({ ...item, timestamp: Date.parse(item.data) }));
    // Datas em escala numérica preservam a distância entre dias sem registros.
    const inicio = pontos[0].timestamp;
    const fim = pontos[pontos.length - 1].timestamp;
    const dominio = inicio === fim ? [inicio - 43200000, fim + 43200000] : [inicio, fim];

    return (
        <>
            <ChartContainer config={config} aria-label="Evolução do humor: média diária de 1 (Muito Mal) a 5 (Muito Bem)">
                <AreaChart accessibilityLayer data={pontos} margin={{ top: 12, right: 16, bottom: 8, left: 0 }}>
                    <defs>
                        <linearGradient id={gradienteId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-valor)" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="var(--color-valor)" stopOpacity={0.03} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#e3e9ee" strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" type="number" scale="time" domain={dominio}
                        ticks={inicio === fim ? [inicio] : undefined} tickCount={4}
                        tickFormatter={dataEixo} tickLine={false} axisLine={false}
                        tickMargin={10} minTickGap={24} />
                    <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} width={72}
                        tickFormatter={(valor) => escala[valor - 1]}
                        tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip cursor={{ stroke: "#bfc6cb", strokeDasharray: "4 4" }}
                        content={<ChartTooltipContent
                            labelFormatter={(item) => dataCompleta(item.data)}
                            valueFormatter={(valor) => `${numero(valor)} / 5`}
                            detailFormatter={(item) => `${item.quantidade} registro(s) neste dia`}
                        />} />
                    <Area dataKey="valor" type="monotone" baseValue={1}
                        stroke="var(--color-valor)" strokeWidth={2.5}
                        fill={`url(#${gradienteId})`}
                        dot={{ r: 3, fill: "var(--color-valor)", stroke: "#fff", strokeWidth: 2 }}
                        activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
                        isAnimationActive={false} />
                </AreaChart>
            </ChartContainer>
            <p className={css.mensagem}>Selecione um ponto para ver a média do dia. Dias sem registros não têm pontos.</p>
            <details className={css.tabelaDados}>
                <summary>Ver dados do gráfico</summary>
                <table>
                    <caption>Médias diárias de humor</caption>
                    <thead><tr><th scope="col">Data</th><th scope="col">Humor (1–5)</th><th scope="col">Registros</th></tr></thead>
                    <tbody>{dados.map((item) => (
                        <tr key={item.data}><td>{dataCompleta(item.data)}</td><td>{numero(item.valor)}</td><td>{item.quantidade}</td></tr>
                    ))}</tbody>
                </table>
            </details>
        </>
    );
}
