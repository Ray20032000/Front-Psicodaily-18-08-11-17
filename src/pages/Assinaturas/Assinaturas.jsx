import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertDialog, Dialog } from "radix-ui";
import { ArrowLeft, ArrowRight, BadgeCheck, CalendarClock, Check, Crown, FileText, RefreshCw, Sparkles, Star, X } from "lucide-react";
import { toast } from "sonner";
import api from "../../config/api.js";
import Skeleton, { Carregando } from "../../components/Skeleton/Skeleton.jsx";
import CodigoPix from "../../components/CodigoPix/CodigoPix.jsx";
import MetodoPagamento, { lerPagamento, limparCartao } from "../../components/MetodoPagamento/MetodoPagamento.jsx";
import useAssinatura, { dataAssinatura } from "../../hooks/useAssinatura.js";
import { formatarCentavos, formatarReais, nomesMetodo } from "../../utils/dinheiro.js";
import { abrirPdf } from "../../utils/pdf.js";
import css from "./Assinaturas.module.css";

// Preço e taxa vêm da API. Os benefícios seguem .claude/docs/assinaturas.md: só o que já existe de verdade
const detalhesPlano = {
    ESSENCIAL: {
        icone: Star,
        descricao: "Para atender, sem limite de pacientes ou de sessões.",
        beneficios: [
            "Perfil completo na busca, com formação, idiomas e áreas de atuação",
            "Agendamentos, horários de atendimento e carteira",
            "Recebimento por Pix, boleto e cartão",
            "Videochamada e prontuário",
            "Chat com pacientes e encaminhamentos",
            "Bloqueio de férias e folgas",
        ],
    },
    PROFISSIONAL: {
        icone: Sparkles,
        destaque: true,
        descricao: "Para encher a agenda.",
        inclui: "Tudo do Essencial, mais:",
        beneficios: [
            "Vídeo de apresentação no perfil",
            "Lista de espera: o paciente é avisado quando abre horário",
            "Visualizações do perfil, consultas e novos favoritos",
        ],
    },
    PREMIUM: {
        icone: Crown,
        descricao: "Para ganhar visibilidade.",
        inclui: "Tudo do Profissional, mais:",
        beneficios: [
            "Selo de patrocinado e topo da busca, em rodízio com os outros Premium",
            "Publicação de artigos no perfil",
            "Artigos em destaque no site público",
            "Taxa de conversão e comparação com o período anterior",
        ],
    },
};

const AVISO_PAGUE_UMA = "Pague apenas uma. A Arkhé não cancela cobranças, e um pagamento a mais não é devolvido automaticamente.";

const percentual = (valor) => `${Number(valor).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;

// Quanto o profissional precisa faturar por mês em consultas para a taxa menor pagar a diferença de preço
// para o plano de baixo. Calculado com os valores da API, então acompanha qualquer mudança de preço ou taxa
function vantagemSobreAnterior(planos, indice) {
    const anterior = planos[indice - 1];
    const diferencaTaxa = anterior ? anterior.taxa_plataforma_percentual - planos[indice].taxa_plataforma_percentual : 0;
    if (diferencaTaxa <= 0) return null;
    const faturamento = Math.ceil((planos[indice].preco_centavos - anterior.preco_centavos) / diferencaTaxa) * 100;
    return `Sai mais barato que o ${anterior.nome} a partir de ${formatarCentavos(faturamento)}/mês em consultas`;
}

export default function Assinaturas() {
    const navigate = useNavigate();
    const { assinatura, setAssinatura, erro: erroAssinatura, carregando: carregandoAssinatura, recarregar } = useAssinatura();
    const [planos, setPlanos] = useState(null);
    const [erroPlanos, setErroPlanos] = useState("");
    const [versaoPlanos, setVersaoPlanos] = useState(0);
    const [escolhido, setEscolhido] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const [cancelando, setCancelando] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        setErroPlanos("");
        fetch(`${api}/assinaturas/planos`, { credentials: "include", signal: controller.signal })
            .then(async (resposta) => {
                const dados = await resposta.json().catch(() => null);
                if (!resposta.ok || !Array.isArray(dados?.planos)) throw new Error(dados?.error || "Não foi possível carregar os planos.");
                setPlanos(dados.planos);
            })
            .catch((falha) => { if (!controller.signal.aborted) setErroPlanos(falha.message); });
        return () => controller.abort();
    }, [versaoPlanos]);

    const pendentes = assinatura?.cobrancas_pendentes || [];
    const nomePlano = (plano) => planos?.find((item) => item.plano === plano)?.nome || plano;
    // Sem plano ativo não há comparação: qualquer plano é uma assinatura nova
    const planoAtual = assinatura?.ativa ? planos?.find((item) => item.plano === assinatura.plano) : null;

    function casoDoPlano(plano) {
        if (!planoAtual) return "novo";
        if (plano.plano === planoAtual.plano) return "renovar";
        return plano.nivel > planoAtual.nivel ? "subir" : "descer";
    }

    const rotuloBotao = { novo: "Assinar", renovar: "Renovar", subir: "Subir para este plano", descer: "Mudar para este plano" };

    async function assinar(evento) {
        evento.preventDefault();
        const formulario = evento.currentTarget;
        const caso = casoDoPlano(escolhido);
        // No downgrade não há cobrança; `metodo` já tem padrão na API
        const pagamento = caso === "descer" ? {} : lerPagamento(formulario);
        setEnviando(true);
        try {
            const resposta = await fetch(`${api}/assinaturas/me`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plano: escolhido.plano, ...pagamento }),
            });
            const dados = await resposta.json().catch(() => null);
            if (!resposta.ok) throw new Error(dados?.error || "Não foi possível concluir a assinatura.");
            const cobranca = dados.cobranca;
            // O POST não traz as pendentes: mantém a lista e soma a nova até o GET responder
            setAssinatura((atual) => ({
                ...dados.assinatura,
                cobrancas_pendentes: cobranca && pagamento.metodo !== "CARTAO"
                    ? [...(atual?.cobrancas_pendentes || []).filter((item) => item.cobranca_id !== cobranca.cobranca_id), cobranca]
                    : atual?.cobrancas_pendentes || [],
            }));
            if (caso === "descer") toast.success(`Mudança agendada: o plano ${escolhido.nome} começa na próxima renovação.`);
            else if (pagamento.metodo === "CARTAO") toast.success(`Pagamento aprovado. Plano ${escolhido.nome} ativo.`);
            else toast.success("Cobrança gerada. O plano começa quando o pagamento for confirmado.");
            setEscolhido(null);
            recarregar();
        } catch (falha) {
            toast.error(falha.message);
        } finally {
            // O formulário pode já ter saído da tela quando o pagamento dá certo
            if (formulario.isConnected) limparCartao(formulario);
            setEnviando(false);
        }
    }

    async function cancelarRenovacao() {
        setEnviando(true);
        try {
            const resposta = await fetch(`${api}/assinaturas/me/cancelar`, { method: "POST", credentials: "include" });
            const dados = await resposta.json().catch(() => null);
            if (!resposta.ok) throw new Error(dados?.error || "Não foi possível cancelar a renovação.");
            setAssinatura((atual) => ({ ...dados.assinatura, cobrancas_pendentes: atual?.cobrancas_pendentes || [] }));
            toast.success("Renovação cancelada.");
        } catch (falha) {
            toast.error(falha.message);
        } finally {
            setCancelando(false);
            setEnviando(false);
        }
    }

    async function abrirBoleto(cobrancaId) {
        try {
            await abrirPdf(`/assinaturas/me/cobranca/${cobrancaId}/pdf`);
        } catch (falha) {
            toast.error(falha.message);
        }
    }

    const caso = escolhido && casoDoPlano(escolhido);

    return (
        <main className={css.pagina}>
            <div className={css.container}>
                <button type="button" className={css.voltar} onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} aria-hidden="true" />
                    Voltar
                </button>

                <header className={css.cabecalho}>
                    <div className={css.selo}>
                        <Sparkles size={16} aria-hidden="true" />
                        Planos PSICOdaily
                    </div>
                    <h1>Atenda sem limites. <span>Pague menos taxa ao crescer.</span></h1>
                    <p>Todo plano permite atender quantos pacientes você quiser. Os planos maiores dão mais benefícios e uma taxa menor em cada consulta.</p>
                </header>

                {/* SITUAÇÃO ATUAL */}

                <section className={css.situacao} aria-label="Sua assinatura">
                    {carregandoAssinatura && !assinatura ? <Carregando texto="Carregando sua assinatura..."><Skeleton height="72px" radius="10px" /></Carregando>
                        : erroAssinatura && !assinatura ? <p role="alert" className={css.erro}>
                            {erroAssinatura} <button type="button" className={css.botaoTexto} onClick={recarregar}>Tentar novamente</button>
                        </p>
                            : <>
                                <div className={css.situacaoInfo}>
                                    <span className={css.rotulo}>Seu plano</span>
                                    <h2>{assinatura.plano ? nomePlano(assinatura.plano) : "Nenhum plano"}</h2>
                                    {assinatura.ativa
                                        ? <p>
                                            {assinatura.periodo_gratis ? "Período grátis até " : "Válido até "}{dataAssinatura(assinatura.valida_ate)}
                                            {" · "}{assinatura.renovar ? "Renovação ligada" : "Renovação desligada"}
                                        </p>
                                        : <p className={css.erro}>
                                            {assinatura.valida_ate ? `Venceu em ${dataAssinatura(assinatura.valida_ate)}. ` : ""}
                                            Você não aparece na busca e não recebe agendamentos.
                                        </p>}
                                    {assinatura.plano_proximo && <p>Na próxima renovação: plano {nomePlano(assinatura.plano_proximo)}</p>}
                                </div>
                                {assinatura.ativa && assinatura.renovar && (
                                    <button type="button" className={css.botaoTexto} onClick={() => setCancelando(true)}>Cancelar renovação</button>
                                )}
                            </>}
                </section>

                {/* COBRANÇAS PENDENTES */}

                {pendentes.length > 0 && <section className={css.pendentes} aria-label="Cobranças pendentes">
                    <div className={css.tituloSecao}>
                        <div>
                            <h2>Cobranças pendentes</h2>
                            <p>O plano começa quando o pagamento for confirmado.</p>
                        </div>
                        <button type="button" className={css.atualizar} onClick={recarregar} disabled={carregandoAssinatura}>
                            <RefreshCw size={15} aria-hidden="true" /> {carregandoAssinatura ? "Atualizando..." : "Atualizar"}
                        </button>
                    </div>
                    {pendentes.length > 1 && <p className={css.aviso} role="alert">{AVISO_PAGUE_UMA}</p>}
                    <div className={css.gradePendentes}>
                        {pendentes.map((cobranca) => <article key={cobranca.cobranca_id} className={css.cobranca}>
                            <h3>Plano {nomePlano(cobranca.plano)}</h3>
                            <p>{formatarReais(cobranca.valor)} · {nomesMetodo[cobranca.metodo] || cobranca.metodo}</p>
                            {cobranca.metodo === "BOLETO"
                                ? <button type="button" className={css.botaoSecundario} onClick={() => abrirBoleto(cobranca.cobranca_id)}>
                                    <FileText size={17} aria-hidden="true" /> Abrir boleto em PDF
                                </button>
                                : <CodigoPix codigo={cobranca.codigo_pagamento} />}
                        </article>)}
                    </div>
                </section>}

                {/* PLANOS */}

                <section className={css.secaoPlanos}>
                    <div className={css.tituloSecao}>
                        <div>
                            <h2>Escolha seu plano</h2>
                            <p>Sem débito automático: a renovação chega como Pix por e-mail e WhatsApp, 3 dias antes do vencimento, mesmo para quem pagou com cartão.</p>
                        </div>
                        <span className={css.periodoCobranca}>Cobrança a cada 30 dias</span>
                    </div>

                    {erroPlanos ? <p role="alert" className={css.erro}>
                        {erroPlanos} <button type="button" className={css.botaoTexto} onClick={() => setVersaoPlanos((atual) => atual + 1)}>Tentar novamente</button>
                    </p> : !planos ? <Carregando texto="Carregando planos..." className={css.gradePlanos}>
                        {[1, 2, 3].map((item) => <Skeleton key={item} height="480px" radius="22px" />)}
                    </Carregando> : <div className={css.gradePlanos}>
                        {planos.map((plano, indice) => {
                            const detalhes = detalhesPlano[plano.plano];
                            const Icone = detalhes?.icone || Star;
                            const atual = planoAtual?.plano === plano.plano;
                            const agendado = assinatura?.plano_proximo === plano.plano;

                            return <article key={plano.plano} className={`${css.cartaoPlano} ${detalhes?.destaque ? css.cartaoDestaque : ""} ${atual ? css.cartaoAtual : ""}`}>
                                {atual && <div className={css.etiqueta}><BadgeCheck size={15} aria-hidden="true" /> Seu plano atual</div>}

                                <div className={css.topoPlano}>
                                    <div className={css.iconePlano}><Icone size={25} aria-hidden="true" /></div>
                                    <h3>{plano.nome}</h3>
                                    <p>{detalhes?.descricao}</p>
                                </div>

                                <div className={css.preco}>
                                    <span className={css.valor}>{formatarCentavos(plano.preco_centavos)}</span>
                                    <span className={css.periodo}>/30 dias</span>
                                </div>

                                <div className={css.divisor} />

                                <p className={css.tituloBeneficios}>{detalhes?.inclui || "O que está incluído:"}</p>
                                <ul className={css.listaBeneficios}>
                                    {[`Taxa da plataforma de ${percentual(plano.taxa_plataforma_percentual)} por consulta`, vantagemSobreAnterior(planos, indice), ...(detalhes?.beneficios || [])].filter(Boolean).map((beneficio) => <li key={beneficio}>
                                        <span className={css.checkBeneficio}><Check size={15} aria-hidden="true" /></span>
                                        <span>{beneficio}</span>
                                    </li>)}
                                </ul>

                                <button
                                    type="button"
                                    className={detalhes?.destaque ? css.botaoPrincipal : css.botaoSecundario}
                                    disabled={!assinatura || agendado}
                                    onClick={() => setEscolhido(plano)}
                                >
                                    {agendado ? "Agendado para a renovação" : rotuloBotao[casoDoPlano(plano)]}
                                    {!agendado && <ArrowRight size={18} aria-hidden="true" />}
                                </button>
                            </article>;
                        })}
                    </div>}
                </section>
            </div>

            {/* ASSINAR, RENOVAR OU TROCAR DE PLANO */}

            <Dialog.Root open={Boolean(escolhido)} onOpenChange={(aberto) => { if (!aberto && !enviando) setEscolhido(null); }}>
                <Dialog.Portal>
                    <Dialog.Overlay className={css.fundoModal}>
                        <Dialog.Content className={css.modal} aria-describedby={undefined}>
                            <Dialog.Close className={css.fecharModal} aria-label="Fechar" disabled={enviando}><X size={21} aria-hidden="true" /></Dialog.Close>
                            {escolhido && <form onSubmit={assinar}>
                                <Dialog.Title className={css.tituloModal}>Plano {escolhido.nome}</Dialog.Title>
                                <div className={css.precoModal}>{formatarCentavos(escolhido.preco_centavos)}<span>/30 dias</span></div>

                                {caso !== "descer" && <MetodoPagamento desabilitado={enviando} />}

                                <div className={css.avisoModal}>
                                    {caso === "novo" && <p>O plano começa quando o pagamento for confirmado.</p>}
                                    {caso === "subir" && <p>Você paga o valor cheio. O novo plano começa quando o pagamento for confirmado, e os dias restantes do plano atual não são aproveitados.</p>}
                                    {caso === "renovar" && <p>Os 30 dias contam a partir do fim do ciclo atual.</p>}
                                    {caso === "descer" && <p>Seu plano atual continua até o vencimento. A próxima renovação já vem no novo valor.</p>}
                                    {caso === "descer" && pendentes.length > 0 && <p>A cobrança já gerada continua no valor atual; pagá-la renova o plano atual e desfaz a mudança.</p>}
                                    {caso !== "descer" && pendentes.length > 0 && <p><strong>Você já tem cobrança pendente.</strong> {AVISO_PAGUE_UMA}</p>}
                                </div>

                                <button type="submit" className={css.botaoPrincipal} disabled={enviando}>
                                    {enviando ? "Aguarde..." : caso === "descer" ? "Confirmar mudança" : "Confirmar e pagar"}
                                    {!enviando && <CalendarClock size={18} aria-hidden="true" />}
                                </button>
                            </form>}
                        </Dialog.Content>
                    </Dialog.Overlay>
                </Dialog.Portal>
            </Dialog.Root>

            {/* CANCELAR RENOVAÇÃO */}

            <AlertDialog.Root open={cancelando} onOpenChange={(aberto) => { if (!enviando) setCancelando(aberto); }}>
                <AlertDialog.Portal>
                    <AlertDialog.Overlay className={css.fundoModal}>
                        <AlertDialog.Content className={css.modal}>
                            <AlertDialog.Title className={css.tituloModal}>Cancelar a renovação?</AlertDialog.Title>
                            <AlertDialog.Description className={css.textoModal}>
                                Seu plano continua até {assinatura?.valida_ate && dataAssinatura(assinatura.valida_ate)}, sem reembolso. Se pagar uma cobrança já gerada, a assinatura volta a renovar.
                            </AlertDialog.Description>
                            <div className={css.acoesModal}>
                                <AlertDialog.Cancel className={css.botaoSecundario} disabled={enviando}>Manter renovação</AlertDialog.Cancel>
                                <button type="button" className={css.botaoPrincipal} disabled={enviando} onClick={cancelarRenovacao}>
                                    {enviando ? "Cancelando..." : "Cancelar renovação"}
                                </button>
                            </div>
                        </AlertDialog.Content>
                    </AlertDialog.Overlay>
                </AlertDialog.Portal>
            </AlertDialog.Root>
        </main>
    );
}
