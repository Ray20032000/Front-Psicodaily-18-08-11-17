import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { AlertDialog } from "radix-ui";
import { CalendarDays, Plus, Star, Video } from "lucide-react";
import { toast } from "sonner";
import css from "./Sessoes.module.css";
import api from "../../config/api.js";
import Skeleton, { Carregando } from "../../components/Skeleton/Skeleton.jsx";
import UserAvatar from "../../components/UserAvatar/UserAvatar.jsx";
import useConsultas from "../../hooks/useConsultas.js";
import { consultaAberta, horarioConsulta, statusConsulta } from "../../utils/consultas.js";
import { formatarCentavos } from "../../utils/dinheiro.js";

// A videochamada libera 15 minutos antes do início, e é o mesmo limite para o paciente cancelar
const ANTECEDENCIA = 15 * 60 * 1000;

const classesStatus = {
    REALIZADO: css.statusSucesso,
    CANCELADO: css.statusErro,
};

const periodo = (sessao) => `${horarioConsulta(sessao.data_hora_inicio)}–${horarioConsulta(sessao.data_hora_fim)}`;
const ehHoje = (valor) => new Date(valor).toDateString() === new Date().toDateString();

export default function Sessoes() {
    const { consultas, carregando, erro, recarregar, atualizarConsulta } = useConsultas();
    const [aba, setAba] = useState("proximas");
    const [avaliando, setAvaliando] = useState(null);
    const [nota, setNota] = useState(0);
    const [comentario, setComentario] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [cancelando, setCancelando] = useState(null);
    const [publica, setPublica] = useState(false);
    // Ao sair da videochamada, a sala manda para cá com ?avaliar=<id>
    const [parametros, setParametros] = useSearchParams();

    function abrirAvaliacao(sessaoId) {
        setAvaliando(sessaoId);
        setNota(0);
        setComentario("");
        setPublica(false);
    }

    useEffect(() => {
        const id = Number(parametros.get("avaliar"));
        const sessao = consultas.find((consulta) => consulta.sessao_id === id);
        if (!sessao) return;
        setParametros({}, { replace: true });
        if (!podeAvaliar(sessao)) return;
        if (new Date(sessao.data_hora_fim) <= new Date()) setAba("historico");
        abrirAvaliacao(id);
    }, [consultas]);

    async function enviarAvaliacao(evento) {
        evento.preventDefault();
        setEnviando(true);
        try {
            const resposta = await fetch(`${api}/consultas/${avaliando}/avaliacao`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(comentario.trim() ? { nota, comentario: comentario.trim(), publica } : { nota }),
            });
            const retorno = await resposta.json();
            if (!resposta.ok) throw new Error(retorno.error || "Não foi possível enviar a avaliação.");
            toast.success("Obrigado pela avaliação!");
            atualizarConsulta({ sessao_id: avaliando, nota_avaliacao: nota });
            setAvaliando(null);
        } catch (falha) {
            toast.error(falha.message || "Não foi possível enviar a avaliação.");
        } finally {
            setEnviando(false);
        }
    }

    async function confirmarCancelamento() {
        setEnviando(true);
        try {
            const resposta = await fetch(`${api}/consultas/${cancelando.sessao_id}/cancelar`, { method: "POST", credentials: "include" });
            const retorno = await resposta.json();
            if (!resposta.ok) throw new Error(retorno.error || "Não foi possível cancelar a sessão.");
            atualizarConsulta(retorno.sessao);
            toast.success(retorno.reembolso_centavos > 0
                ? `Sessão cancelada. ${formatarCentavos(retorno.reembolso_centavos)} serão devolvidos pela equipe.`
                : "Sessão cancelada.");
        } catch (falha) {
            toast.error(falha.message || "Não foi possível cancelar a sessão.");
        } finally {
            setCancelando(null);
            setEnviando(false);
        }
    }

    // ponytail: "agora" só é recalculado ao renderizar; o botão de entrar aparece ao recarregar a página
    const agora = new Date();
    const podeCancelar = (sessao) => consultaAberta(sessao) && new Date(sessao.data_hora_inicio) - agora > ANTECEDENCIA;
    // A API aceita avaliar consulta paga que já começou: logo ao sair da chamada ela ainda está CONFIRMADO
    const podeAvaliar = (sessao) => ["CONFIRMADO", "REALIZADO"].includes(sessao.status) && sessao.nota_avaliacao == null
        && new Date(sessao.data_hora_inicio) <= agora;
    const futuras = consultas.filter((sessao) => sessao.status !== "CANCELADO" && new Date(sessao.data_hora_fim) > agora);
    const historico = consultas.filter((sessao) => !futuras.includes(sessao)).reverse();
    const [proxima, ...proximas] = futuras;
    const podeEntrar = proxima?.status === "CONFIRMADO" && agora >= new Date(new Date(proxima.data_hora_inicio) - ANTECEDENCIA);
    const lista = aba === "proximas" ? proximas : historico;

    // Uma consulta AGENDADO (ainda sem pagamento) volta para a tela do profissional só para pagar
    const estadoPagamento = (sessao) => ({ dataAgendamento: sessao.data_hora_inicio.slice(0, 16), sessaoAgendada: sessao });

    function formularioAvaliacao() {
        return <form className={css.formAvaliacao} onSubmit={enviarAvaliacao}>
            <div className={css.estrelas} role="group" aria-label="Nota da sessão">
                {[1, 2, 3, 4, 5].map((valor) => (
                    <button
                        key={valor}
                        type="button"
                        aria-pressed={nota === valor}
                        aria-label={`${valor} de 5`}
                        onClick={() => setNota(valor)}
                    >
                        <Star size={22} fill={valor <= nota ? "currentColor" : "none"} strokeWidth={1.8} aria-hidden="true" />
                    </button>
                ))}
            </div>
            <textarea
                className={css.comentario}
                rows={2}
                maxLength={500}
                placeholder="Comentário (opcional)"
                aria-label="Comentário sobre a sessão"
                value={comentario}
                onChange={(evento) => setComentario(evento.target.value)}
            />
            <label className={css.publica}>
                <input type="checkbox" checked={publica} disabled={!comentario.trim()} onChange={(evento) => setPublica(evento.target.checked)} />
                Mostrar o comentário no perfil do profissional, sem o meu nome. Desmarcado, só o profissional lê.
            </label>
            <div className={css.acoesAvaliacao}>
                <button type="button" className={css.pill} onClick={() => setAvaliando(null)}>Cancelar</button>
                <button type="submit" className={css.botao} disabled={!nota || enviando}>
                    {enviando ? "Enviando..." : "Enviar avaliação"}
                </button>
            </div>
        </form>;
    }

    return (
        <div className={css.pagina}>

            <header className={css.cabecalho}>
                <div>
                    <h1>Sessões</h1>
                    <p>Acompanhe suas consultas</p>
                </div>
                <Link to="/profissionais" className={css.botao}>
                    <Plus size={16} strokeWidth={2} aria-hidden="true" /> Marcar sessão
                </Link>
            </header>

            {erro && !carregando && (
                <section className={`${css.card} ${css.erro}`} role="alert">
                    <p>{erro}</p>
                    <button type="button" className={css.pill} onClick={recarregar}>Tentar novamente</button>
                </section>
            )}

            {/* PRÓXIMA SESSÃO */}

            {carregando && (
                <Carregando texto="Carregando sessões..." className={css.destaque}>
                    <div className={css.infoDestaque}>
                        <Skeleton width="90px" height="10px" className={css.skeletonClaro} />
                        <Skeleton width="240px" height="22px" className={css.skeletonClaro} />
                        <Skeleton width="150px" height="14px" className={css.skeletonClaro} />
                    </div>
                </Carregando>
            )}

            {!carregando && !erro && (proxima ? (
                <section className={css.destaque}>
                    <div className={css.infoDestaque}>
                        <span className={css.rotulo}>{ehHoje(proxima.data_hora_inicio) ? "HOJE" : "PRÓXIMA SESSÃO"}</span>
                        <h2>
                            {new Date(proxima.data_hora_inicio).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                            <span> · {periodo(proxima)}</span>
                        </h2>
                        <div className={css.profissional}>
                            <span className={css.avatar}>
                                <UserAvatar src={proxima.profissional_foto_url} nome={proxima.profissional_nome} />
                            </span>
                            Com {proxima.profissional_nome || "profissional"}
                        </div>
                    </div>

                    <div className={css.acoesDestaque}>
                        {proxima.status === "AGENDADO" ? (
                            <Link to={`/profissionais/${proxima.profissional_id}`} state={estadoPagamento(proxima)} className={css.botaoClaro}>
                                Pagar para confirmar
                            </Link>
                        ) : podeEntrar ? (
                            <Link
                                to={`/videochamada/${proxima.sessao_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={css.botaoClaro}
                            >
                                <Video size={16} strokeWidth={2} aria-hidden="true" /> Entrar na videochamada
                            </Link>
                        ) : (
                            <p className={css.aviso}>A videochamada é liberada 15 min antes</p>
                        )}
                        {podeCancelar(proxima) && (
                            <button type="button" className={css.cancelarDestaque} onClick={() => setCancelando(proxima)}>Cancelar sessão</button>
                        )}
                        {podeAvaliar(proxima) && avaliando !== proxima.sessao_id && (
                            <button type="button" className={css.cancelarDestaque} onClick={() => abrirAvaliacao(proxima.sessao_id)}>Avaliar consulta</button>
                        )}
                    </div>
                    {avaliando === proxima.sessao_id && formularioAvaliacao()}
                </section>
            ) : (
                <section className={`${css.card} ${css.vazio}`}>
                    <span className={css.iconeTile}>
                        <CalendarDays size={18} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <div>
                        <h3>Nenhuma sessão agendada</h3>
                        <p>Escolha um profissional para marcar sua próxima consulta.</p>
                    </div>
                    <Link to="/profissionais" className={css.pill}>Escolher profissional</Link>
                </section>
            ))}

            {/* LISTA */}

            {!erro && <section className={css.card}>

                <div className={css.tituloCard}>
                    <h3>Suas sessões</h3>
                    <div className={css.abas} role="tablist">
                        {[["proximas", "Próximas", proximas], ["historico", "Histórico", historico]].map(([valor, rotulo, itens]) => (
                            <button
                                key={valor}
                                type="button"
                                role="tab"
                                aria-selected={aba === valor}
                                className={aba === valor ? css.abaAtiva : ""}
                                onClick={() => setAba(valor)}
                            >
                                {rotulo} {!carregando && <small>{itens.length}</small>}
                            </button>
                        ))}
                    </div>
                </div>

                {carregando ? (
                    <Carregando texto="Carregando lista de sessões..." className={css.lista}>
                        {[1, 2, 3].map((item) => (
                            <div key={item} className={css.item}>
                                <Skeleton width="44px" height="44px" radius="10px" />
                                <div className={css.infoItem}>
                                    <Skeleton width="45%" height="12px" />
                                    <Skeleton width="30%" height="10px" className={css.skeletonLinha} />
                                </div>
                            </div>
                        ))}
                    </Carregando>
                ) : lista.length === 0 ? (
                    <p className={css.legenda}>
                        {aba === "proximas" ? "Nenhuma outra sessão marcada." : "Suas sessões anteriores aparecerão aqui."}
                    </p>
                ) : (
                    <ul className={css.lista}>
                        {lista.map((sessao) => {
                            const data = new Date(sessao.data_hora_inicio);
                            return (
                                <li key={sessao.sessao_id} className={css.item}>
                                    <span className={css.data}>
                                        <strong>{data.getDate()}</strong>
                                        {data.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
                                    </span>
                                    <div className={css.infoItem}>
                                        <strong>{sessao.profissional_nome || "Profissional"}</strong>
                                        <small>
                                            {data.toLocaleDateString("pt-BR", { weekday: "long" })} · {periodo(sessao)}
                                        </small>
                                    </div>
                                    {ehHoje(sessao.data_hora_inicio) && sessao.status !== "CANCELADO" && <span className={css.hoje}>Hoje</span>}
                                    <span className={classesStatus[sessao.status] || css.statusNeutro}>
                                        {statusConsulta[sessao.status] || sessao.status}
                                    </span>
                                    {sessao.status === "AGENDADO" && new Date(sessao.data_hora_inicio) > agora && (
                                        <Link to={`/profissionais/${sessao.profissional_id}`} state={estadoPagamento(sessao)} className={css.pill}>Pagar</Link>
                                    )}
                                    {podeCancelar(sessao) && (
                                        <button type="button" className={css.pill} onClick={() => setCancelando(sessao)}>Cancelar</button>
                                    )}
                                    {sessao.nota_avaliacao != null ? (
                                        <span className={css.notaDada} aria-label={`Você avaliou com ${sessao.nota_avaliacao} de 5`}>
                                            <Star size={14} fill="currentColor" strokeWidth={1.8} aria-hidden="true" /> {sessao.nota_avaliacao}
                                        </span>
                                    ) : podeAvaliar(sessao) && avaliando !== sessao.sessao_id && (
                                        <button type="button" className={css.pill} onClick={() => abrirAvaliacao(sessao.sessao_id)}>Avaliar</button>
                                    )}

                                    {avaliando === sessao.sessao_id && formularioAvaliacao()}
                                </li>
                            );
                        })}
                    </ul>
                )}

            </section>}

            <AlertDialog.Root open={Boolean(cancelando)} onOpenChange={(aberto) => { if (!aberto && !enviando) setCancelando(null); }}>
                <AlertDialog.Portal>
                    <AlertDialog.Overlay className={css.fundoDialogo} />
                    <AlertDialog.Content className={css.dialogo}>
                        <AlertDialog.Title>Cancelar esta sessão?</AlertDialog.Title>
                        <AlertDialog.Description>
                            {cancelando && `${new Date(cancelando.data_hora_inicio).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}, ${periodo(cancelando)}. `}
                            O que você pagou será devolvido integralmente pela equipe.
                        </AlertDialog.Description>
                        <div className={css.acoesAvaliacao}>
                            <AlertDialog.Cancel className={css.pill} disabled={enviando}>Manter sessão</AlertDialog.Cancel>
                            <button type="button" className={css.botao} disabled={enviando} onClick={confirmarCancelamento}>
                                {enviando ? "Cancelando..." : "Cancelar sessão"}
                            </button>
                        </div>
                    </AlertDialog.Content>
                </AlertDialog.Portal>
            </AlertDialog.Root>

        </div>
    );
}
