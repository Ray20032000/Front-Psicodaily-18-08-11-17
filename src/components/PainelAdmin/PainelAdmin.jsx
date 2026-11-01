import { useEffect, useState } from "react";
import { AlertDialog } from "radix-ui";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import api from "../../config/api.js";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart.jsx";
import { Card, CardResumo, Protegido } from "../GraficosDashboard/GraficosDashboard.jsx";
import Seletor from "../Seletor/Seletor.jsx";
import Skeleton, { Carregando } from "../Skeleton/Skeleton.jsx";
import { statusConsulta } from "../../utils/consultas.js";
import { formatarCentavos, nomesMetodo } from "../../utils/dinheiro.js";
import css from "./PainelAdmin.module.css";

const nomesPapel = { PACIENTE: "Pacientes", PSICOLOGO: "Psicólogos", PSIQUIATRA: "Psiquiatras", ADMIN: "Admins" };
const nomesPlano = { ESSENCIAL: "Essencial", PROFISSIONAL: "Profissional", PREMIUM: "Premium" };
// Mesmos valores aceitos pela API (ACOES em auditoria_service.py)
const acoesAuditoria = ["LOGIN", "LOGIN_FALHA", "PRONTUARIO_ACESSO", "SESSAO_AGENDADA", "SESSAO_ALTERADA", "SESSAO_CANCELADA",
    "ENCAMINHAMENTO_CRIADO", "SENHA_ALTERADA", "EMAIL_ALTERADO", "REEMBOLSO_PAGO", "REPASSE_CRIADO", "REPASSE_PAGO",
    "ASSINATURA_ALTERADA", "ASSINATURA_PAGA"];
const periodos = [
    { valor: "7", rotulo: "Últimos 7 dias" },
    { valor: "30", rotulo: "Últimos 30 dias" },
    { valor: "90", rotulo: "Últimos 3 meses" },
    { valor: "365", rotulo: "Último ano" },
];
const filtrosStatus = [
    { valor: "PENDENTE", rotulo: "Pendentes" },
    { valor: "PAGO", rotulo: "Pagos" },
    { valor: "", rotulo: "Todos" },
];
const dataHora = (valor) => new Date(valor).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
const formatarCpf = (cpf) => cpf?.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
const somar = (contagem) => Object.values(contagem).reduce((total, valor) => total + valor, 0);

async function pedirJson(caminho, opcoes) {
    const resposta = await fetch(`${api}${caminho}`, { credentials: "include", ...opcoes });
    const dados = await resposta.json().catch(() => null);
    if (!resposta.ok || !dados) {
        const falha = new Error(dados?.error || "Não foi possível falar com o servidor.");
        falha.status = resposta.status;
        throw falha;
    }
    return dados;
}

function ErroComRetry({ erro, recarregar }) {
    return <p role="alert" className={css.legenda}>{erro} <button type="button" className={css.link} onClick={recarregar}>Tentar novamente</button></p>;
}

// Um hue só: a altura mostra a quantidade, e o nome de cada barra está no eixo
function GraficoContagem({ titulo, descricao, contagem, nomes }) {
    // A ordem vem de `nomes`: o JSON da API chega em ordem alfabética, e Premium ficaria antes de Profissional
    const dados = Object.keys(nomes).map((chave) => ({ chave, nome: nomes[chave], total: contagem[chave] || 0 }));
    const config = { total: { label: titulo, color: "var(--cor-grafico-1)" } };
    return <Card titulo={titulo} descricao={descricao}>
        {!somar(contagem) ? <p className={css.legenda}>Nada neste período.</p>
            : <ChartContainer config={config} className={css.grafico} aria-label={`${titulo}: ${dados.map((item) => `${item.nome} ${item.total}`).join(", ")}`}>
                <BarChart accessibilityLayer data={dados} layout="vertical" margin={{ right: 28 }}>
                    <CartesianGrid horizontal={false} stroke="var(--cor-borda)" />
                    <YAxis dataKey="nome" type="category" width={92} tickLine={false} axisLine={false} tickMargin={8} />
                    <XAxis dataKey="total" type="number" allowDecimals={false} hide />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" labelFormatter={(item) => item.nome} />} />
                    <Bar dataKey="total" fill="var(--color-total)" radius={4} isAnimationActive={false}>
                        <LabelList dataKey="total" position="right" offset={8} fontSize={12} fill="var(--cor-texto-secundario)" />
                    </Bar>
                </BarChart>
            </ChartContainer>}
    </Card>;
}

export function MetricasAdmin() {
    const [dias, setDias] = useState("30");
    const [metricas, setMetricas] = useState(null);
    const [erro, setErro] = useState("");
    const [versao, setVersao] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setErro("");
        pedirJson(`/admin/metricas?dias=${dias}`, { signal: controller.signal })
            .then(setMetricas)
            .catch((falha) => { if (!controller.signal.aborted) setErro(falha.message); });
        return () => controller.abort();
    }, [dias, versao]);

    return <div className={css.secao}>
        <div className={css.topo}>
            <h1>Métricas</h1>
            <Seletor className={css.seletor} value={dias} onChange={setDias} opcoes={periodos} aria-label="Período das métricas" />
        </div>
        {erro && <ErroComRetry erro={erro} recarregar={() => setVersao((atual) => atual + 1)} />}
        {!erro && !metricas && <Carregando texto="Carregando métricas..."><Skeleton height="320px" radius="12px" /></Carregando>}
        {metricas && <Protegido titulo="Métricas">
            <div className={css.resumos}>
                <CardResumo descricao="Total pago em consultas" valor={formatarCentavos(metricas.faturamento_centavos)}
                    destaque="Não é a receita do app" detalhe="Sem as consultas reembolsadas" />
                <CardResumo descricao="Receita de assinaturas" valor={formatarCentavos(metricas.assinaturas.receita_centavos)}
                    destaque={`${somar(metricas.assinaturas.ativas_por_plano)} assinatura(s) ativa(s)`} detalhe="Pagamentos confirmados no período" />
                <CardResumo descricao="Usuários ativos" valor={somar(metricas.usuarios_ativos)}
                    destaque={`${somar(metricas.novos_cadastros)} novo(s) no período`} detalhe="Todos os perfis" />
                <CardResumo descricao="Avaliação média" valor={metricas.avaliacao.media?.toLocaleString("pt-BR") ?? "—"}
                    destaque={`${metricas.avaliacao.total} avaliação(ões)`} detalhe="De 1 a 5" />
            </div>
            <div className={css.graficos}>
                <GraficoContagem titulo="Consultas por status" descricao="Pela data da sessão" contagem={metricas.consultas_por_status} nomes={statusConsulta} />
                <GraficoContagem titulo="Assinaturas ativas" descricao="Por plano, hoje" contagem={metricas.assinaturas.ativas_por_plano} nomes={nomesPlano} />
                <GraficoContagem titulo="Usuários ativos" descricao="Por perfil, hoje" contagem={metricas.usuarios_ativos} nomes={nomesPapel} />
                <GraficoContagem titulo="Novos cadastros" descricao="Por perfil, no período" contagem={metricas.novos_cadastros} nomes={nomesPapel} />
            </div>
        </Protegido>}
    </div>;
}

export function AuditoriaAdmin() {
    const [usuarioId, setUsuarioId] = useState("");
    const [acao, setAcao] = useState("");
    const [filtros, setFiltros] = useState({ usuarioId: "", acao: "" });
    const [itens, setItens] = useState(null);
    const [cursor, setCursor] = useState(null);
    const [erro, setErro] = useState("");
    const [versao, setVersao] = useState(0);
    const [carregandoMais, setCarregandoMais] = useState(false);

    function parametros(antes) {
        const busca = new URLSearchParams({ limite: "50" });
        if (filtros.usuarioId) busca.set("usuario_id", filtros.usuarioId);
        if (filtros.acao) busca.set("acao", filtros.acao);
        if (antes) busca.set("antes", antes);
        return busca;
    }

    useEffect(() => {
        const controller = new AbortController();
        setErro("");
        setItens(null);
        pedirJson(`/admin/auditoria?${parametros()}`, { signal: controller.signal })
            .then((dados) => {
                setItens(dados.auditoria);
                setCursor(dados.proximo_cursor);
            })
            .catch((falha) => { if (!controller.signal.aborted) setErro(falha.message); });
        return () => controller.abort();
    }, [filtros, versao]);

    async function carregarMais() {
        setCarregandoMais(true);
        try {
            const dados = await pedirJson(`/admin/auditoria?${parametros(cursor)}`);
            setItens((atuais) => [...atuais, ...dados.auditoria]);
            setCursor(dados.proximo_cursor);
        } catch (falha) {
            toast.error(falha.message);
        } finally {
            setCarregandoMais(false);
        }
    }

    return <div className={css.secao}>
        <div className={css.topo}><h1>Auditoria</h1></div>
        <form className={css.filtros} onSubmit={(evento) => { evento.preventDefault(); setFiltros({ usuarioId: usuarioId.trim(), acao }); }}>
            <label>ID do usuário
                <input type="number" min="1" value={usuarioId} onChange={(evento) => setUsuarioId(evento.target.value)} />
            </label>
            <div className={css.campo}>
                <span>Ação</span>
                <Seletor value={acao} onChange={setAcao} aria-label="Ação" opcoes={[{ valor: "", rotulo: "Todas" }, ...acoesAuditoria.map((item) => ({ valor: item, rotulo: item }))]} />
            </div>
            <button type="submit" className={css.primario}>Filtrar</button>
        </form>
        {erro && <ErroComRetry erro={erro} recarregar={() => setVersao((atual) => atual + 1)} />}
        {!erro && !itens && <Carregando texto="Carregando auditoria..."><Skeleton height="200px" radius="12px" /></Carregando>}
        {itens && !itens.length && <p className={css.legenda}>Nenhum registro com esses filtros.</p>}
        {itens?.length > 0 && <div className={css.tabelaContainer}>
            <table className={css.tabela}>
                <thead><tr><th scope="col">Quando</th><th scope="col">Usuário</th><th scope="col">Ação</th><th scope="col">Entidade</th><th scope="col">IP</th></tr></thead>
                <tbody>{itens.map((item) => <tr key={item.auditoria_id}>
                    <td>{dataHora(item.criado_em)}</td>
                    <td>{item.usuario_id ?? "—"}</td>
                    <td>{item.acao}</td>
                    <td>{item.entidade ? `${item.entidade} ${item.entidade_id ?? ""}` : "—"}</td>
                    <td>{item.ip || "—"}</td>
                </tr>)}</tbody>
            </table>
        </div>}
        {cursor && <button type="button" className={css.secundario} disabled={carregandoMais} onClick={carregarMais}>{carregandoMais ? "Carregando..." : "Carregar mais"}</button>}
    </div>;
}

// Reembolsos e repasses têm o mesmo fluxo: lista, pagar por Pix da Arkhé ou marcar o que já foi pago por fora
const saidas = {
    reembolsos: {
        titulo: "Reembolsos",
        campoId: "reembolso_id",
        chave: "reembolsos",
        pessoa: (item) => item.paciente,
        detalhe: (item) => `Sessão de ${dataHora(item.data_sessao)} · ${nomesMetodo[item.metodo] || item.metodo}`,
        rota: "/admin/reembolsos",
    },
    repasses: {
        titulo: "Repasses",
        campoId: "repasse_id",
        chave: "repasses",
        pessoa: (item) => item.profissional,
        detalhe: (item) => `${item.consultas} consulta(s)`,
        rota: "/admin/repasses",
    },
};

function ListaSaidas({ tipo }) {
    const saida = saidas[tipo];
    const [status, setStatus] = useState("PENDENTE");
    const [itens, setItens] = useState(null);
    const [erro, setErro] = useState("");
    const [versao, setVersao] = useState(0);
    const [pagando, setPagando] = useState(null);
    const [recusa, setRecusa] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [fechandoRepasses, setFechandoRepasses] = useState(false);
    const recarregar = () => setVersao((atual) => atual + 1);

    useEffect(() => {
        const controller = new AbortController();
        setErro("");
        pedirJson(`${saida.rota}${status ? `?status=${status}` : ""}`, { signal: controller.signal })
            .then((dados) => setItens(dados[saida.chave]))
            .catch((falha) => { if (!controller.signal.aborted) setErro(falha.message); });
        return () => controller.abort();
    }, [saida, status, versao]);

    function fecharPagamento() {
        if (enviando) return;
        setPagando(null);
        setRecusa("");
    }

    async function pagar(manual) {
        setEnviando(true);
        try {
            await pedirJson(`${saida.rota}/${pagando[saida.campoId]}/pagar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(manual ? { manual: true } : {}),
            });
            toast.success(manual ? "Marcado como pago." : "Pix enviado.");
            setPagando(null);
            setRecusa("");
            recarregar();
        } catch (falha) {
            // 502: a Arkhé recusou e nada saiu da conta; repetir devolve a mesma recusa, então resta pagar por fora
            if (falha.status === 502) setRecusa(falha.message);
            else toast.error(falha.message);
        } finally {
            setEnviando(false);
        }
    }

    async function fecharRepasses() {
        setEnviando(true);
        try {
            const dados = await pedirJson("/admin/repasses", { method: "POST" });
            toast.success(`${dados.repasses.length} repasse(s) criado(s).`);
            recarregar();
        } catch (falha) {
            toast.error(falha.message);
        } finally {
            setFechandoRepasses(false);
            setEnviando(false);
        }
    }

    const pessoaPagando = pagando && saida.pessoa(pagando);

    return <div className={css.secao}>
        <div className={css.topo}>
            <h1>{saida.titulo}</h1>
            <div className={css.acoesTopo}>
                <Seletor className={css.seletor} value={status} onChange={setStatus} opcoes={filtrosStatus} aria-label={`Filtrar ${saida.titulo}`} />
                {tipo === "repasses" && <button type="button" className={css.primario} onClick={() => setFechandoRepasses(true)}>Fechar repasses</button>}
            </div>
        </div>

        {erro && <ErroComRetry erro={erro} recarregar={recarregar} />}
        {!erro && !itens && <Carregando texto={`Carregando ${saida.titulo.toLowerCase()}...`}><Skeleton height="160px" radius="12px" /></Carregando>}
        {itens && !itens.length && <p className={css.legenda}>Nada por aqui com esse filtro.</p>}
        {itens?.length > 0 && <div className={css.tabelaContainer}>
            <table className={css.tabela}>
                <thead><tr><th scope="col">Para</th><th scope="col">CPF</th><th scope="col">Detalhe</th><th scope="col">Valor</th><th scope="col">Situação</th><th scope="col">Ação</th></tr></thead>
                <tbody>{itens.map((item) => <tr key={item[saida.campoId]}>
                    <td>{saida.pessoa(item).nome}</td>
                    <td>{formatarCpf(saida.pessoa(item).cpf)}</td>
                    <td>{saida.detalhe(item)}</td>
                    <td>{formatarCentavos(item.valor_centavos)}</td>
                    <td>{item.status === "PAGO" ? `Pago em ${dataHora(item.pago_em)}${item.id_movimentacao_arkhe ? "" : " (por fora)"}` : "Pendente"}</td>
                    <td>{item.status === "PENDENTE" && <button type="button" className={css.primario} onClick={() => setPagando(item)}>Pagar</button>}</td>
                </tr>)}</tbody>
            </table>
        </div>}

        <AlertDialog.Root open={Boolean(pagando)} onOpenChange={(aberto) => { if (!aberto) fecharPagamento(); }}>
            <AlertDialog.Portal>
                <AlertDialog.Overlay className={css.fundo} />
                <AlertDialog.Content className={css.dialogo}>
                    <AlertDialog.Title>Pagar {pagando && formatarCentavos(pagando.valor_centavos)} a {pessoaPagando?.nome}?</AlertDialog.Title>
                    <AlertDialog.Description>
                        {recusa
                            ? `${recusa} Marque como pago só depois de fazer o Pix para o CPF ${formatarCpf(pessoaPagando?.cpf)}. Marcar não envia dinheiro.`
                            : `O Pix sai na hora da conta da plataforma, para a chave CPF ${formatarCpf(pessoaPagando?.cpf)}.`}
                    </AlertDialog.Description>
                    <div className={css.acoesDialogo}>
                        <AlertDialog.Cancel className={css.secundario} disabled={enviando}>Voltar</AlertDialog.Cancel>
                        {recusa
                            ? <button type="button" className={css.primario} disabled={enviando} onClick={() => pagar(true)}>{enviando ? "Salvando..." : "Já paguei por fora"}</button>
                            : <button type="button" className={css.primario} disabled={enviando} onClick={() => pagar(false)}>{enviando ? "Enviando..." : "Enviar Pix"}</button>}
                    </div>
                </AlertDialog.Content>
            </AlertDialog.Portal>
        </AlertDialog.Root>

        <AlertDialog.Root open={fechandoRepasses} onOpenChange={(aberto) => { if (!enviando) setFechandoRepasses(aberto); }}>
            <AlertDialog.Portal>
                <AlertDialog.Overlay className={css.fundo} />
                <AlertDialog.Content className={css.dialogo}>
                    <AlertDialog.Title>Fechar os repasses?</AlertDialog.Title>
                    <AlertDialog.Description>Cria um repasse pendente por profissional com o líquido das consultas realizadas. Nenhum dinheiro sai agora: cada repasse é pago depois, aqui na lista.</AlertDialog.Description>
                    <div className={css.acoesDialogo}>
                        <AlertDialog.Cancel className={css.secundario} disabled={enviando}>Voltar</AlertDialog.Cancel>
                        <button type="button" className={css.primario} disabled={enviando} onClick={fecharRepasses}>{enviando ? "Fechando..." : "Fechar repasses"}</button>
                    </div>
                </AlertDialog.Content>
            </AlertDialog.Portal>
        </AlertDialog.Root>
    </div>;
}

export function FinanceiroAdmin() {
    return <div className={css.financeiro}>
        <ListaSaidas tipo="reembolsos" />
        <ListaSaidas tipo="repasses" />
    </div>;
}
