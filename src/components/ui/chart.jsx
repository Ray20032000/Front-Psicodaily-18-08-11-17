import { createContext, useContext } from "react";
import { Legend, ResponsiveContainer, Tooltip } from "recharts";
import css from "./chart.module.css";

// Composição do Chart do shadcn/ui adaptada para JavaScript e CSS Modules.
// https://ui.shadcn.com/docs/components/chart
// As cores pertencem ao container; não há tokens ou resets no CSS global.
const ChartContext = createContext({});

export function ChartContainer({ config, children, className = "", style, ...props }) {
    const cores = Object.fromEntries(
        Object.entries(config).map(([chave, item]) => [`--color-${chave}`, item.color])
    );

    return (
        <ChartContext.Provider value={config}>
            <div className={`${css.container} ${className}`} style={{ ...cores, ...style }} {...props}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    {children}
                </ResponsiveContainer>
            </div>
        </ChartContext.Provider>
    );
}

export const ChartTooltip = Tooltip;

// indicator: "dot" | "line" | "dashed"; nameKey busca o rótulo no payload (ex.: fatias de pizza)
export function ChartTooltipContent({ active, payload, labelFormatter, valueFormatter, detailFormatter,
    indicator = "dot", hideLabel = false, nameKey }) {
    const config = useContext(ChartContext);
    const itens = payload?.filter((item) => item.value != null && item.type !== "none") || [];
    if (!active || !itens.length) return null;

    return (
        <div className={css.tooltip}>
            {!hideLabel && labelFormatter && <strong className={css.label}>{labelFormatter(itens[0].payload)}</strong>}
            {itens.map((item) => {
                const chave = nameKey ? item.payload[nameKey] : item.dataKey;
                const cor = config[chave]?.color || item.payload?.fill || item.color;
                return (
                    <div className={`${css.linha} ${indicator === "dot" ? css.linhaCentro : ""}`} key={chave}>
                        <span className={`${css.indicador} ${css[indicator]}`} style={{ backgroundColor: cor, borderColor: cor }} />
                        <span>{config[chave]?.label || item.name}</span>
                        <strong>{valueFormatter ? valueFormatter(item.value) : item.value}</strong>
                    </div>
                );
            })}
            {detailFormatter && <span className={css.detalhe}>{detailFormatter(itens[0].payload)}</span>}
        </div>
    );
}

export const ChartLegend = Legend;

export function ChartLegendContent({ payload, nameKey }) {
    const config = useContext(ChartContext);
    if (!payload?.length) return null;

    return (
        <div className={css.legenda}>
            {payload.filter((item) => item.type !== "none").map((item) => {
                const chave = nameKey ? item.payload?.[nameKey] : item.dataKey;
                return (
                    <div className={css.itemLegenda} key={chave}>
                        <span className={css.quadrado} style={{ backgroundColor: item.color }} />
                        {config[chave]?.label || item.value}
                    </div>
                );
            })}
        </div>
    );
}
