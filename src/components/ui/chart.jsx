import { createContext, useContext } from "react";
import { ResponsiveContainer, Tooltip } from "recharts";
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

export function ChartTooltipContent({ active, payload, labelFormatter, valueFormatter, detailFormatter }) {
    const config = useContext(ChartContext);
    const itens = payload?.filter((item) => item.value != null && item.type !== "none") || [];
    if (!active || !itens.length) return null;

    return (
        <div className={css.tooltip}>
            {labelFormatter && <strong className={css.label}>{labelFormatter(itens[0].payload)}</strong>}
            {itens.map((item) => (
                <div className={css.linha} key={item.dataKey}>
                    <span className={css.indicador} style={{ backgroundColor: config[item.dataKey]?.color || item.color }} />
                    <span>{config[item.dataKey]?.label || item.name}</span>
                    <strong>{valueFormatter ? valueFormatter(item.value) : item.value}</strong>
                </div>
            ))}
            {detailFormatter && <span className={css.detalhe}>{detailFormatter(itens[0].payload)}</span>}
        </div>
    );
}
