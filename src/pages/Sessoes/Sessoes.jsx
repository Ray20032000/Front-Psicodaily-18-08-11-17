import { Link } from "react-router-dom";
import { useState } from "react";
import { CalendarDays, Plus, Star, Video } from "lucide-react";
import { toast } from "sonner";
import css from "./Sessoes.module.css";
import api from "../../config/api.js";
import Skeleton, { Carregando } from "../../components/Skeleton/Skeleton.jsx";
import UserAvatar from "../../components/UserAvatar/UserAvatar.jsx";
import useConsultas from "../../hooks/useConsultas.js";
import { horarioConsulta, statusConsulta } from "../../utils/consultas.js";

// A videochamada libera 15 minutos antes do início
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

    function abrirAvaliacao(sessaoId) {
        setAvaliando(sessaoId);
        setNota(0);
        setComentario("");
    }

    async function enviarAvaliacao(evento) {
        evento.preventDefault();
        setEnviando(true);
        try {
            const resposta = await fetch(`${api}/consultas/${avaliando}/avaliacao`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(comentario.trim() ? { nota, comentario: comentario.trim() } : { nota }),
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

    // ponytail: "agora" só é recalculado ao renderizar; o botão de entrar aparece ao recarregar a página
    const agora = new Date();
    const futuras = consultas.filter((sessao) => sessao.status !== "CANCELADO" && new Date(sessao.data_hora_fim) > agora);
    const historico = consultas.filter((sessao) => !futuras.includes(sessao)).reverse();
    const [proxima, ...proximas] = futuras;
    const podeEntrar = proxima && agora >= new Date(new Date(proxima.data_hora_inicio) - ANTECEDENCIA);
    const lista = aba === "proximas" ? proximas : historico;

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

                    {podeEntrar ? (
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
                                    {sessao.status === "REALIZADO" && (sessao.nota_avaliacao != null ? (
                                        <span className={css.notaDada} aria-label={`Você avaliou com ${sessao.nota_avaliacao} de 5`}>
                                            <Star size={14} fill="currentColor" strokeWidth={1.8} aria-hidden="true" /> {sessao.nota_avaliacao}
                                        </span>
                                    ) : avaliando !== sessao.sessao_id && (
                                        <button type="button" className={css.pill} onClick={() => abrirAvaliacao(sessao.sessao_id)}>Avaliar</button>
                                    ))}

                                    {avaliando === sessao.sessao_id && (
                                        <form className={css.formAvaliacao} onSubmit={enviarAvaliacao}>
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
                                            <div className={css.acoesAvaliacao}>
                                                <button type="button" className={css.pill} onClick={() => setAvaliando(null)}>Cancelar</button>
                                                <button type="submit" className={css.botao} disabled={!nota || enviando}>
                                                    {enviando ? "Enviando..." : "Enviar avaliação"}
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}

            </section>}

        </div>
    );
}
