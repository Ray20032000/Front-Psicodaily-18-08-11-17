import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Label, PolarAngleAxis, PolarRadiusAxis, RadialBar, RadialBarChart, XAxis } from "recharts";
import { ArrowDownLeft, ArrowUpRight, Download, Nfc, Search } from "lucide-react";
import Skeleton, { Carregando } from "../../components/Skeleton/Skeleton.jsx";
import { Card, CardResumo, GraficoFluxoCaixa, Protegido } from "../../components/GraficosDashboard/GraficosDashboard.jsx";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "../../components/ui/chart.jsx";
import useGanhos from "../../hooks/useGanhos.js";
import { dataConsulta } from "../../utils/consultas.js";
import { formatarCentavos, nomesMetodo, nomesSituacao } from "../../utils/dinheiro.js";
import css from "./Carteira.module.css";

const configMeses = {
    liquido: { label: "Líquido", color: "var(--cor-grafico-1)" },
    taxas: { label: "Taxas", color: "var(--cor-grafico-3)" },
};
const configMeta = { recebido: { label: "Recebido", color: "var(--cor-grafico-1)" } };
const coresMetodo = { PIX: "var(--cor-grafico-1)", BOLETO: "var(--cor-grafico-2)", CARTAO: "var(--cor-grafico-3)" };
const abas = [
    ["todas", "Todas", null],
    ["pendentes", "A receber", ["AGUARDANDO_CONSULTA", "A_RECEBER", "EM_REPASSE"]],
    ["repassadas", "Repassadas", ["REPASSADO"]],
    ["reembolsadas", "Reembolsadas", ["REEMBOLSADO"]],
];
const porPagina = 12;
const porcento = (valor) => `${valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
const dataHora = (texto) => new Date(texto).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
const dataCurta = (texto) => new Date(texto).toLocaleDateString("pt-BR");
const mesDe = (consulta) => consulta.pago_em.slice(0, 7);
const taxasDe = (consulta) => consulta.taxa_plataforma_centavos + consulta.taxa_cartao_centavos;

function somar(lista, campo) {
    return lista.reduce((total, item) => total + (typeof campo === "function" ? campo(item) : item[campo]), 0);
}

// CSV com ";" e BOM para o Excel em português abrir com acentos e colunas certas
function exportarCsv(extrato) {
    const celula = (valor) => `"${String(valor).replace(/"/g, '""')}"`;
    const reais = (centavos) => (centavos / 100).toFixed(2).replace(".", ",");
    const linhas = extrato.map((item) => [item.pago_em, item.data_sessao, item.paciente_nome, nomesMetodo[item.metodo] || item.metodo,
        reais(item.valor_centavos), reais(item.taxa_plataforma_centavos), reais(item.taxa_cartao_centavos), reais(item.liquido_centavos),
        nomesSituacao[item.situacao] || item.situacao].map(celula).join(";"));
    const csv = ["Pago em;Sessão;Paciente;Método;Valor;Taxa da plataforma;Taxa do cartão;Líquido;Situação", ...linhas].join("\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const link = Object.assign(document.createElement("a"), { href: url, download: `extrato-${dataConsulta(new Date())}.csv` });
    link.click();
    URL.revokeObjectURL(url);
}

export default function Carteira() {
    // 365 dias cobre o histórico mensal, o extrato e todos os períodos do fluxo de caixa
    const { ganhos, carregando, erro, recarregar } = useGanhos(365);
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
                        <p>Suas consultas pagas, já descontados {porcento(ganhos?.taxa_plataforma_percentual ?? 10)} da plataforma e a taxa do cartão</p>
                    </div>
                </header>

                {erro && !ganhos ? <Card titulo="Não foi possível carregar a carteira">
                    <p className={css.suave}>{erro} <button type="button" className={css.link} onClick={recarregar}>Tentar novamente</button></p>
                </Card> : !ganhos ? <Carregando texto="Carregando carteira..." className={css.carregando}>
                    <Skeleton width="100%" height="230px" radius="12px" />
                    <div className={css.resumos}>{[1, 2, 3, 4].map((item) => <Skeleton key={item} width="100%" height="150px" radius="12px" />)}</div>
                    <Skeleton width="100%" height="380px" radius="12px" />
                </Carregando> : <Protegido titulo="Carteira">
                    <Conteudo ganhos={ganhos} atualizando={carregando}
                        dias={dias} setDias={setDias} aba={aba} setAba={setAba} busca={busca} setBusca={setBusca}
                        limite={limite} setLimite={setLimite} />
                </Protegido>}

            </div>
        </div>
    );
}

function Conteudo({ ganhos, atualizando, dias, setDias, aba, setAba, busca, setBusca, limite, setLimite }) {
    const hoje = new Date();
    const { saldo, consultas, repasses, taxa_plataforma_percentual: taxaPlataforma } = ganhos;
    const validas = consultas.filter((consulta) => consulta.situacao !== "REEMBOLSADO");
    const mesAtual = dataConsulta(hoje).slice(0, 7);

    const doMes = validas.filter((consulta) => mesDe(consulta) === mesAtual);
    const recebido = somar(doMes, "valor_centavos");
    const taxas = somar(doMes, taxasDe);
    const liquido = somar(doMes, "liquido_centavos");
    const ticketMedio = doMes.length ? liquido / doMes.length : 0;

    // Mês atual é parcial: compara com o mesmo período do mês anterior
    const inicioAnterior = dataConsulta(new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1));
    const fimAnterior = dataConsulta(new Date(hoje.getFullYear(), hoje.getMonth() - 1, hoje.getDate()));
    const liquidoAnterior = somar(validas.filter((consulta) => consulta.pago_em.slice(0, 10) >= inicioAnterior
        && consulta.pago_em.slice(0, 10) <= fimAnterior), "liquido_centavos");
    const variacaoMes = liquidoAnterior ? ((liquido - liquidoAnterior) / liquidoAnterior) * 100 : null;

    const meses = Array.from({ length: 12 }, (_, indice) => {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - 11 + indice, 1);
        const chave = dataConsulta(data).slice(0, 7);
        const pagas = validas.filter((consulta) => mesDe(consulta) === chave);
        return {
            chave,
            mes: data.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
            mesCompleto: data.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
            liquido: somar(pagas, "liquido_centavos"),
            taxas: somar(pagas, taxasDe),
        };
    });
    const mesesComPagamento = meses.filter((mes) => mes.liquido || mes.taxas);

    // Meta: igualar a média dos últimos 3 meses completos que tiveram ganhos
    const base = meses.slice(-4, -1).filter((mes) => mes.liquido > 0);
    const meta = base.length ? somar(base, "liquido") / base.length : 0;
    const progresso = meta ? Math.min((liquido / meta) * 100, 100) : 0;

    const totalMetodos = recebido || 1;
    const porMetodo = Object.entries(nomesMetodo).map(([chave, label]) => ({
        chave, label, cor: coresMetodo[chave], valor: somar(doMes.filter((consulta) => consulta.metodo === chave), "valor_centavos"),
    }));

    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    const situacoes = abas.find(([valor]) => valor === aba)[2];
    const extrato = consultas.filter((consulta) => (!situacoes || situacoes.includes(consulta.situacao))
        && consulta.paciente_nome.toLocaleLowerCase("pt-BR").includes(termo));

    return (
        <>
            {/* A RECEBER + REPASSES */}

            <section className={css.hero} aria-label="Saldo">
                <div className={css.saldo}>
                    <span className={css.rotulo}>A receber</span>
                    <strong className={css.valorSaldo}>{formatarCentavos(saldo.a_receber_centavos)}</strong>
                    <span className={css.rotulo}>Consultas realizadas que entram no próximo repasse</span>
                    {variacaoMes !== null && <span className={`${css.variacao} ${variacaoMes < 0 ? css.variacaoNegativa : ""}`}>
                        {variacaoMes >= 0 ? <ArrowUpRight size={14} aria-hidden="true" /> : <ArrowDownLeft size={14} aria-hidden="true" />}
                        {porcento(Math.abs(variacaoMes))} {variacaoMes >= 0 ? "a mais" : "a menos"} de líquido que no mesmo período do mês passado
                    </span>}
                    <div className={css.acoes}>
                        <button type="button" className={css.botaoPrimario} onClick={() => exportarCsv(extrato)} disabled={!extrato.length}>
                            <Download size={16} aria-hidden="true" /> Exportar extrato
                        </button>
                    </div>
                </div>

                <div className={css.cartao} aria-label="Resumo dos repasses">
                    <div className={css.cartaoTopo}>
                        <span>Psicodaily · Repasses</span>
                        <Nfc size={20} aria-hidden="true" />
                    </div>
                    <div className={css.chip} aria-hidden="true" />
                    <span className={css.numeroConta}>{formatarCentavos(saldo.em_repasse_centavos)} em repasse</span>
                    <div className={css.cartaoRodape}>
                        <span>{formatarCentavos(saldo.aguardando_consulta_centavos)} aguardando consulta</span>
                        <span>{atualizando ? "Atualizando..." : "Atualizado agora"}</span>
                    </div>
                </div>
            </section>

            {/* RESUMOS */}

            <div className={css.resumos}>
                <CardResumo descricao="Recebido no mês" valor={formatarCentavos(recebido)}
                    destaque={`${doMes.length} pagamento(s)`} detalhe="Valor pago pelos pacientes desde o dia 1º" />
                <CardResumo descricao="Taxas do mês" valor={formatarCentavos(taxas)}
                    destaque={`${porcento(taxaPlataforma)} da plataforma + taxa do cartão`}
                    detalhe={recebido ? `${porcento((taxas / recebido) * 100)} do recebido` : "Sem pagamentos no mês"} />
                <CardResumo descricao="Líquido do mês" valor={formatarCentavos(liquido)} variacao={variacaoMes}
                    destaque="Recebido menos as taxas" detalhe="O que vai para os seus repasses" />
                <CardResumo descricao="Ticket médio" valor={doMes.length ? formatarCentavos(ticketMedio) : "—"}
                    destaque="Líquido por consulta paga" detalhe="Pagamentos do mês" />
            </div>

            {/* FLUXO DE CAIXA */}

            <GraficoFluxoCaixa consultas={consultas} dias={dias} onDias={setDias} carregando={false} erro="" />

            {/* MESES + META */}

            <div className={css.linha}>
                <Card titulo="Ganhos por mês" descricao={`${meses[0].mesCompleto} – ${meses.at(-1).mesCompleto}`}
                    rodape={mesesComPagamento.length > 0 && <>
                        <div className={css.tendencia}>
                            {formatarCentavos(somar(meses, "liquido"))} líquidos em 12 meses
                        </div>
                        <div className={css.suave}>Mês atual parcial, até hoje</div>
                    </>}>
                    {!mesesComPagamento.length ? <p className={css.suave}>Nenhum pagamento nos últimos 12 meses.</p>
                        : <ChartContainer config={configMeses} aria-label="Líquido e taxas por mês">
                            <BarChart accessibilityLayer data={meses}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="mes" tickLine={false} tickMargin={10} axisLine={false} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed"
                                    labelFormatter={(item) => item.mesCompleto} valueFormatter={formatarCentavos} />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar dataKey="liquido" fill="var(--color-liquido)" radius={4} />
                                <Bar dataKey="taxas" fill="var(--color-taxas)" radius={4} />
                            </BarChart>
                        </ChartContainer>}
                </Card>

                <Card titulo="Meta do mês" centralizado
                    descricao={meta ? `${formatarCentavos(liquido)} de ${formatarCentavos(meta)}` : "Média dos últimos 3 meses"}
                    rodape={meta > 0 && <>
                        <div className={css.tendencia}>
                            {liquido >= meta ? "Meta atingida!" : `Faltam ${formatarCentavos(meta - liquido)}`}
                        </div>
                        <div className={css.suave}>
                            {liquido >= meta || !ticketMedio ? "Meta: média do líquido dos últimos meses completos"
                                : `Cerca de ${Math.ceil((meta - liquido) / ticketMedio)} consulta(s) no ticket médio`}
                        </div>
                    </>}>
                    {!meta ? <p className={css.suave}>A meta aparece depois do primeiro mês completo com ganhos.</p>
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

            {/* MÉTODOS + REPASSES */}

            <div className={css.linha}>
                <Card titulo="Recebimentos por método" descricao="Pagamentos do mês por forma de pagamento">
                    {!doMes.length ? <p className={css.suave}>Nenhum pagamento neste mês.</p> : <>
                        <div className={css.segmentos} role="img" aria-label={porMetodo.map((metodo) => `${metodo.label}: ${porcento((metodo.valor / totalMetodos) * 100)}`).join(", ")}>
                            {porMetodo.filter((metodo) => metodo.valor > 0).map((metodo) => (
                                <span key={metodo.chave} style={{ flexGrow: metodo.valor, backgroundColor: metodo.cor }} />
                            ))}
                        </div>
                        <ul className={css.listaOrigens}>
                            {porMetodo.map((metodo) => (
                                <li key={metodo.chave}>
                                    <span className={css.quadrado} style={{ backgroundColor: metodo.cor }} aria-hidden="true" />
                                    <span>{metodo.label}</span>
                                    <span className={css.suave}>{formatarCentavos(metodo.valor)}</span>
                                    <strong>{porcento((metodo.valor / totalMetodos) * 100)}</strong>
                                </li>
                            ))}
                        </ul>
                    </>}
                </Card>

                <Card titulo="Repasses" descricao={`${formatarCentavos(saldo.em_repasse_centavos)} em repasse`}>
                    {!repasses.length && <p className={css.suave}>Nenhum repasse ainda. Os repasses juntam as consultas realizadas e são pagos por Pix na sua chave CPF.</p>}
                    <ul className={css.lista}>
                        {repasses.slice(0, 5).map((repasse) => (
                            <li key={repasse.repasse_id} className={css.cobranca}>
                                <div className={css.dados}>
                                    <strong>{formatarCentavos(repasse.valor_centavos)}</strong>
                                    <span>Fechado em {dataCurta(repasse.criado_em)}{repasse.pago_em ? ` · pago em ${dataCurta(repasse.pago_em)}` : ""}</span>
                                </div>
                                <span className={`${css.selo} ${repasse.status === "PAGO" ? css.seloConfirmada : ""}`}>
                                    {repasse.status === "PAGO" ? "Pago" : "Pendente"}
                                </span>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>

            {/* EXTRATO */}

            <Card className={css.extrato} titulo="Extrato" descricao={`${extrato.length} pagamento(s) nos últimos 12 meses`}
                acao={<div className={css.filtros}>
                    <div className={css.abas} role="group" aria-label="Filtrar por situação">
                        {abas.map(([valor, rotulo]) => (
                            <button key={valor} type="button" aria-pressed={aba === valor}
                                className={aba === valor ? css.abaAtiva : ""} onClick={() => { setAba(valor); setLimite(porPagina); }}>{rotulo}</button>
                        ))}
                    </div>
                    <label className={css.busca}>
                        <Search size={16} aria-hidden="true" />
                        <input type="search" placeholder="Buscar por paciente" value={busca}
                            onChange={(evento) => { setBusca(evento.target.value); setLimite(porPagina); }} aria-label="Buscar no extrato" />
                    </label>
                </div>}>
                {!extrato.length ? <p className={css.suave}>Nenhum pagamento encontrado.</p>
                    : <ul className={css.lista}>
                        {extrato.slice(0, limite).map((item) => {
                            const reembolsado = item.situacao === "REEMBOLSADO";
                            return (
                                <li key={item.sessao_id} className={css.linhaExtrato}>
                                    <span className={`${css.iconeTipo} ${reembolsado ? css.iconeSaida : ""}`}>
                                        {reembolsado ? <ArrowUpRight size={16} aria-hidden="true" /> : <ArrowDownLeft size={16} aria-hidden="true" />}
                                    </span>
                                    <div className={css.dados}>
                                        <strong>{item.paciente_nome}</strong>
                                        <span>
                                            Sessão de {dataHora(item.data_sessao)} · {nomesMetodo[item.metodo] || item.metodo}
                                            {" · "}{formatarCentavos(item.valor_centavos)} menos {formatarCentavos(taxasDe(item))} de taxas
                                        </span>
                                    </div>
                                    <span className={`${css.selo} ${item.situacao === "REPASSADO" ? css.seloConfirmada : ""}`}>
                                        {nomesSituacao[item.situacao] || item.situacao}
                                    </span>
                                    <strong className={reembolsado ? css.estornado : css.entrada}>
                                        {formatarCentavos(item.liquido_centavos)}
                                    </strong>
                                </li>
                            );
                        })}
                    </ul>}
                {extrato.length > limite && <button type="button" className={css.mais} onClick={() => setLimite(limite + porPagina)}>
                    Ver mais ({extrato.length - limite} restantes)
                </button>}
            </Card>
        </>
    );
}
