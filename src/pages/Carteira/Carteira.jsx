import { useState } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Label, PolarAngleAxis, PolarRadiusAxis, RadialBar, RadialBarChart, XAxis } from "recharts";
import { ArrowDownLeft, ArrowUpRight, Download, Nfc, Search } from "lucide-react";
import UserAvatar from "../../components/UserAvatar/UserAvatar.jsx";
import Skeleton, { Carregando } from "../../components/Skeleton/Skeleton.jsx";
import { Card, CardResumo, GraficoFluxoCaixa, Protegido } from "../../components/GraficosDashboard/GraficosDashboard.jsx";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "../../components/ui/chart.jsx";
import useConsultas from "../../hooks/useConsultas.js";
import useFinanceiro from "../../hooks/useFinanceiro.js";
import { consultaAberta, dataConsulta, statusConsulta } from "../../utils/consultas.js";
import { formatarCentavos, formatarReais } from "../../utils/dinheiro.js";
import css from "./Carteira.module.css";

const configMeses = {
    receitas: { label: "Receitas", color: "var(--cor-grafico-1)" },
    despesas: { label: "Despesas", color: "var(--cor-grafico-3)" },
};
const configMeta = { recebido: { label: "Recebido", color: "var(--cor-grafico-1)" } };
const origens = {
    pix_qrcode: { label: "Pix QR Code", cor: "var(--cor-grafico-1)" },
    pix: { label: "Pix", cor: "var(--cor-grafico-2)" },
    boleto: { label: "Boleto", cor: "var(--cor-grafico-3)" },
};
const abas = [["todas", "Todas"], ["entrada", "Entradas"], ["saida", "Saídas"]];
const porPagina = 12;
const porcento = (valor) => `${valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
const dataHora = (texto) => new Date(texto.replace(" ", "T")).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
const mesDe = (item) => item.data_movimentacao.slice(0, 7);

function somar(lista) {
    return lista.reduce((total, item) => total + item.valor, 0);
}

// CSV com ";" e BOM para o Excel em português abrir com acentos e colunas certas
function exportarCsv(extrato) {
    const celula = (valor) => `"${String(valor).replace(/"/g, '""')}"`;
    const linhas = extrato.map((item) => [item.data_movimentacao, item.tipo, origens[item.origem]?.label || item.origem,
        item.nome_contraparte, (item.tipo === "saida" ? -item.valor : item.valor).toFixed(2).replace(".", ",")].map(celula).join(";"));
    const csv = ["Data;Tipo;Origem;Contraparte;Valor", ...linhas].join("\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const link = Object.assign(document.createElement("a"), { href: url, download: `extrato-${dataConsulta(new Date())}.csv` });
    link.click();
    URL.revokeObjectURL(url);
}

export default function Carteira() {
    // 365 dias cobre o histórico mensal, o extrato e todos os períodos do fluxo de caixa
    const { financeiro, carregando, erro, recarregar } = useFinanceiro(365);
    const consultas = useConsultas();
    const [dias, setDias] = useState(30);
    const [aba, setAba] = useState("todas");
    const [busca, setBusca] = useState("");
    const [limite, setLimite] = useState(porPagina);

    return (
        <div className={css.fundo}>
            <div className={css.container}>

                <header className={css.topo}>
                    <div>
                        <h1>Carteira</h1>
                        <p>Conta Arkhé{financeiro?.conta?.nome ? ` · ${financeiro.conta.nome}` : ""}</p>
                    </div>
                </header>

                {erro && !financeiro ? <Card titulo="Não foi possível carregar a carteira">
                    <p className={css.suave}>{erro} <button type="button" className={css.link} onClick={recarregar}>Tentar novamente</button></p>
                </Card> : !financeiro ? <Carregando texto="Carregando carteira..." className={css.carregando}>
                    <Skeleton width="100%" height="230px" radius="12px" />
                    <div className={css.resumos}>{[1, 2, 3, 4].map((item) => <Skeleton key={item} width="100%" height="150px" radius="12px" />)}</div>
                    <Skeleton width="100%" height="380px" radius="12px" />
                </Carregando> : <Protegido titulo="Carteira">
                    <Conteudo financeiro={financeiro} atualizando={carregando} consultas={consultas}
                        dias={dias} setDias={setDias} aba={aba} setAba={setAba} busca={busca} setBusca={setBusca}
                        limite={limite} setLimite={setLimite} />
                </Protegido>}

            </div>
        </div>
    );
}

function Conteudo({ financeiro, atualizando, consultas, dias, setDias, aba, setAba, busca, setBusca, limite, setLimite }) {
    const hoje = new Date();
    const { saldo, conta, resumo, movimentacoes } = financeiro;
    const mesAtual = dataConsulta(hoje).slice(0, 7);

    const entradasMes = movimentacoes.filter((item) => item.tipo === "entrada" && mesDe(item) === mesAtual);
    const recebido = resumo.total_receitas;
    const saidas = resumo.total_despesas;
    const ticketMedio = entradasMes.length ? somar(entradasMes) / entradasMes.length : 0;

    // Mês atual é parcial: compara com o mesmo período do mês anterior
    const inicioAnterior = dataConsulta(new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1));
    const fimAnterior = dataConsulta(new Date(hoje.getFullYear(), hoje.getMonth() - 1, hoje.getDate()));
    const recebidoAnterior = somar(movimentacoes.filter((item) => item.tipo === "entrada"
        && item.data_movimentacao.slice(0, 10) >= inicioAnterior && item.data_movimentacao.slice(0, 10) <= fimAnterior));
    const variacaoMes = recebidoAnterior ? ((somar(entradasMes) - recebidoAnterior) / recebidoAnterior) * 100 : null;

    const meses = Array.from({ length: 12 }, (_, indice) => {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - 11 + indice, 1);
        const chave = dataConsulta(data).slice(0, 7);
        const doMes = movimentacoes.filter((item) => mesDe(item) === chave);
        return {
            chave,
            mes: data.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
            mesCompleto: data.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
            receitas: somar(doMes.filter((item) => item.tipo === "entrada")),
            despesas: somar(doMes.filter((item) => item.tipo === "saida")),
        };
    });
    const mesesComMovimento = meses.filter((mes) => mes.receitas || mes.despesas);

    // Meta: igualar a média dos últimos 3 meses completos que tiveram receita
    const base = meses.slice(-4, -1).filter((mes) => mes.receitas > 0);
    const meta = base.length ? somar(base.map((mes) => ({ valor: mes.receitas }))) / base.length : 0;
    const progresso = meta ? Math.min((recebido / meta) * 100, 100) : 0;

    const totalOrigens = somar(entradasMes) || 1;
    const porOrigem = Object.entries(origens).map(([chave, origem]) => ({
        chave, ...origem, valor: somar(entradasMes.filter((item) => item.origem === chave)),
    }));

    // A receber: sessões futuras ainda abertas (o pagamento é feito por sessão)
    const agora = new Date();
    const aReceber = consultas.consultas.filter((consulta) => consultaAberta(consulta) && new Date(consulta.data_hora_inicio) >= agora);
    const totalAReceber = aReceber.reduce((total, consulta) => total + Number(consulta.valor_centavos || 0), 0);

    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    const extrato = [...movimentacoes]
        .sort((a, b) => b.data_movimentacao.localeCompare(a.data_movimentacao))
        .filter((item) => (aba === "todas" || item.tipo === aba) && item.nome_contraparte.toLocaleLowerCase("pt-BR").includes(termo));

    return (
        <>
            {/* SALDO + CARTÃO */}

            <section className={css.hero} aria-label="Saldo">
                <div className={css.saldo}>
                    <span className={css.rotulo}>Saldo disponível</span>
                    <strong className={css.valorSaldo}>{formatarReais(saldo)}</strong>
                    {variacaoMes !== null && <span className={`${css.variacao} ${variacaoMes < 0 ? css.variacaoNegativa : ""}`}>
                        {variacaoMes >= 0 ? <ArrowUpRight size={14} aria-hidden="true" /> : <ArrowDownLeft size={14} aria-hidden="true" />}
                        {porcento(Math.abs(variacaoMes))} {variacaoMes >= 0 ? "a mais" : "a menos"} recebido que no mesmo período do mês passado
                    </span>}
                    <div className={css.acoes}>
                        <button type="button" className={css.botaoPrimario} onClick={() => exportarCsv(extrato)} disabled={!extrato.length}>
                            <Download size={16} aria-hidden="true" /> Exportar extrato
                        </button>
                    </div>
                </div>

                <div className={css.cartao} aria-label="Cartão da conta Arkhé">
                    <div className={css.cartaoTopo}>
                        <span>Arkhé · Conta PJ</span>
                        <Nfc size={20} aria-hidden="true" />
                    </div>
                    <div className={css.chip} aria-hidden="true" />
                    <span className={css.numeroConta}>
                        {conta ? `Ag. ${conta.agencia} · Conta •••• ${conta.final}` : "Conta Arkhé"}
                    </span>
                    <div className={css.cartaoRodape}>
                        <span>{conta?.nome || "Psicodaily"}</span>
                        <span>{atualizando ? "Atualizando..." : "Atualizado agora"}</span>
                    </div>
                </div>
            </section>

            {/* RESUMOS */}

            <div className={css.resumos}>
                <CardResumo descricao="Recebido no mês" valor={formatarReais(recebido)} variacao={variacaoMes}
                    destaque={`${entradasMes.length} pagamento(s)`} detalhe="Entradas desde o dia 1º" />
                <CardResumo descricao="A receber" carregando={consultas.carregando}
                    valor={consultas.erro ? "—" : formatarCentavos(totalAReceber)}
                    destaque={consultas.erro ? "Consultas indisponíveis" : `${aReceber.length} sessão(ões) agendada(s)`}
                    detalhe="Sessões futuras ainda não realizadas" />
                <CardResumo descricao="Ticket médio" valor={entradasMes.length ? formatarReais(ticketMedio) : "—"}
                    destaque="Por pagamento recebido" detalhe="Entradas do mês" />
                <CardResumo descricao="Saídas do mês" valor={formatarReais(saidas)}
                    destaque={recebido ? `${porcento((saidas / recebido) * 100)} das receitas` : "Sem receitas no mês"}
                    detalhe={`Saldo do mês: ${formatarReais(resumo.saldo_periodo)}`} />
            </div>

            {/* FLUXO DE CAIXA */}

            <GraficoFluxoCaixa movimentacoes={movimentacoes} dias={dias} onDias={setDias} carregando={false} erro="" />

            {/* MESES + META */}

            <div className={css.linha}>
                <Card titulo="Receitas × despesas" descricao={`${meses[0].mesCompleto} – ${meses.at(-1).mesCompleto}`}
                    rodape={mesesComMovimento.length > 0 && <>
                        <div className={css.tendencia}>
                            {formatarReais(somar(meses.map((mes) => ({ valor: mes.receitas }))))} recebidos em 12 meses
                        </div>
                        <div className={css.suave}>Mês atual parcial, até hoje</div>
                    </>}>
                    {!mesesComMovimento.length ? <p className={css.suave}>Nenhuma movimentação nos últimos 12 meses.</p>
                        : <ChartContainer config={configMeses} aria-label="Receitas e despesas por mês">
                            <BarChart accessibilityLayer data={meses}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="mes" tickLine={false} tickMargin={10} axisLine={false} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed"
                                    labelFormatter={(item) => item.mesCompleto} valueFormatter={formatarReais} />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar dataKey="receitas" fill="var(--color-receitas)" radius={4} />
                                <Bar dataKey="despesas" fill="var(--color-despesas)" radius={4} />
                            </BarChart>
                        </ChartContainer>}
                </Card>

                <Card titulo="Meta do mês" centralizado
                    descricao={meta ? `${formatarReais(recebido)} de ${formatarReais(meta)}` : "Média dos últimos 3 meses"}
                    rodape={meta > 0 && <>
                        <div className={css.tendencia}>
                            {recebido >= meta ? "Meta atingida!" : `Faltam ${formatarReais(meta - recebido)}`}
                        </div>
                        <div className={css.suave}>
                            {recebido >= meta || !ticketMedio ? "Meta: média de receitas dos últimos meses completos"
                                : `Cerca de ${Math.ceil((meta - recebido) / ticketMedio)} pagamento(s) no ticket médio`}
                        </div>
                    </>}>
                    {!meta ? <p className={css.suave}>A meta aparece depois do primeiro mês completo com receitas.</p>
                        : <ChartContainer config={configMeta} className={css.radial} aria-label={`${porcento(progresso)} da meta do mês`}>
                            <RadialBarChart data={[{ recebido: progresso }]} startAngle={90} endAngle={-270} innerRadius={80} outerRadius={110}>
                                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                                <RadialBar dataKey="recebido" fill="var(--color-recebido)" cornerRadius={10}
                                    background={{ fill: "var(--cor-superficie-suave)" }} />
                                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                                    <Label content={({ viewBox }) => viewBox && "cx" in viewBox && (
                                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                            <tspan x={viewBox.cx} y={viewBox.cy} className={css.totalRadial}>{Math.round(progresso)}%</tspan>
                                            <tspan x={viewBox.cx} y={viewBox.cy + 24} className={css.legendaRadial}>da meta</tspan>
                                        </text>
                                    )} />
                                </PolarRadiusAxis>
                            </RadialBarChart>
                        </ChartContainer>}
                </Card>
            </div>

            {/* ORIGENS + A RECEBER */}

            <div className={css.linha}>
                <Card titulo="Recebimentos por origem" descricao="Entradas do mês por forma de pagamento">
                    {!entradasMes.length ? <p className={css.suave}>Nenhuma entrada neste mês.</p> : <>
                        <div className={css.segmentos} role="img" aria-label={porOrigem.map((origem) => `${origem.label}: ${porcento((origem.valor / totalOrigens) * 100)}`).join(", ")}>
                            {porOrigem.filter((origem) => origem.valor > 0).map((origem) => (
                                <span key={origem.chave} style={{ flexGrow: origem.valor, backgroundColor: origem.cor }} />
                            ))}
                        </div>
                        <ul className={css.listaOrigens}>
                            {porOrigem.map((origem) => (
                                <li key={origem.chave}>
                                    <span className={css.quadrado} style={{ backgroundColor: origem.cor }} aria-hidden="true" />
                                    <span>{origem.label}</span>
                                    <span className={css.suave}>{formatarReais(origem.valor)}</span>
                                    <strong>{porcento((origem.valor / totalOrigens) * 100)}</strong>
                                </li>
                            ))}
                        </ul>
                    </>}
                </Card>

                <Card titulo="Próximas sessões a receber" descricao={consultas.erro ? undefined : `${formatarCentavos(totalAReceber)} previstos`}
                    acao={<Link to="/agendaprofissional" className={css.verTodas}>Ver agenda</Link>}>
                    {consultas.carregando && [1, 2, 3].map((item) => (
                        <div className={css.cobranca} key={item} aria-hidden="true">
                            <Skeleton width="36px" height="36px" radius="50%" />
                            <div className={css.dados}><Skeleton width="140px" height="13px" /><Skeleton width="90px" height="10px" /></div>
                        </div>
                    ))}
                    {consultas.erro && <p className={css.suave}>{consultas.erro} <button type="button" className={css.link} onClick={consultas.recarregar}>Tentar novamente</button></p>}
                    {!consultas.carregando && !consultas.erro && !aReceber.length && <p className={css.suave}>Nenhuma sessão agendada.</p>}
                    <ul className={css.lista}>
                        {aReceber.slice(0, 5).map((consulta) => (
                            <li key={consulta.sessao_id} className={css.cobranca}>
                                <UserAvatar src={consulta.paciente_foto_url} nome={consulta.paciente_nome} className={css.avatar} />
                                <div className={css.dados}>
                                    <strong>{consulta.paciente_nome}</strong>
                                    <span>
                                        {new Date(consulta.data_hora_inicio).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                        {" · "}{formatarCentavos(consulta.valor_centavos)}
                                    </span>
                                </div>
                                <span className={`${css.selo} ${consulta.status === "CONFIRMADO" ? css.seloConfirmada : ""}`}>
                                    {statusConsulta[consulta.status] || consulta.status}
                                </span>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>

            {/* EXTRATO */}

            <Card className={css.extrato} titulo="Extrato" descricao={`${extrato.length} movimentação(ões) nos últimos 12 meses`}
                acao={<div className={css.filtros}>
                    <div className={css.abas} role="group" aria-label="Filtrar por tipo">
                        {abas.map(([valor, rotulo]) => (
                            <button key={valor} type="button" aria-pressed={aba === valor}
                                className={aba === valor ? css.abaAtiva : ""} onClick={() => { setAba(valor); setLimite(porPagina); }}>{rotulo}</button>
                        ))}
                    </div>
                    <label className={css.busca}>
                        <Search size={16} aria-hidden="true" />
                        <input type="search" placeholder="Buscar por nome" value={busca}
                            onChange={(evento) => { setBusca(evento.target.value); setLimite(porPagina); }} aria-label="Buscar no extrato" />
                    </label>
                </div>}>
                {!extrato.length ? <p className={css.suave}>Nenhuma movimentação encontrada.</p>
                    : <ul className={css.lista}>
                        {extrato.slice(0, limite).map((item, indice) => (
                            <li key={item.id_movimentacao ?? `sem-id-${indice}`} className={css.linhaExtrato}>
                                <span className={`${css.iconeTipo} ${item.tipo === "saida" ? css.iconeSaida : ""}`}>
                                    {item.tipo === "saida" ? <ArrowUpRight size={16} aria-hidden="true" /> : <ArrowDownLeft size={16} aria-hidden="true" />}
                                </span>
                                <div className={css.dados}>
                                    <strong>{item.nome_contraparte}</strong>
                                    <span>{dataHora(item.data_movimentacao)} · {origens[item.origem]?.label || item.origem}</span>
                                </div>
                                <strong className={item.tipo === "saida" ? css.saida : css.entrada}>
                                    {item.tipo === "saida" ? "− " : "+ "}{formatarReais(item.valor)}
                                </strong>
                            </li>
                        ))}
                    </ul>}
                {extrato.length > limite && <button type="button" className={css.mais} onClick={() => setLimite(limite + porPagina)}>
                    Ver mais ({extrato.length - limite} restantes)
                </button>}
            </Card>
        </>
    );
}
