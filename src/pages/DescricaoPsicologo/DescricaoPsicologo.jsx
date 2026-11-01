import UserAvatar from "../../components/UserAvatar/UserAvatar.jsx";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import css from "../../pages/DescricaoPsicologo/DescricaoPsicologo.module.css";
import Skeleton, { Carregando } from "../../components/Skeleton/Skeleton.jsx";
import VerHorarios from "../../components/VerHorarios/VerHorarios.jsx";
import { ArtigosPerfil } from "../../components/Artigos/Artigos.jsx";
import MetodoPagamento, { lerPagamento, limparCartao } from "../../components/MetodoPagamento/MetodoPagamento.jsx";
import api from "../../config/api.js";
import { ArrowLeft, CalendarDays, Heart, Star } from "lucide-react";
import { toast } from "sonner";
import useFavoritos from "../../hooks/useFavoritos.js";
import { dataHoraLocal, intervaloConsulta } from "../../utils/agendamento.js";
import { nomesModalidade, normalizarProfissional } from "../../utils/profissionais.js";

const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export default function DescricaoPsicologo() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const [dataAgendamento, setDataAgendamento] = useState(state?.dataAgendamento || "");
    const [mostrarHorarios, setMostrarHorarios] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [agendando, setAgendando] = useState(false);
    // O assistente agenda e manda para cá só para pagar
    const [sessaoAgendada, setSessaoAgendada] = useState(state?.sessaoAgendada || null);
    const [naListaEspera, setNaListaEspera] = useState(false);
    const [entrandoLista, setEntrandoLista] = useState(false);
    const { favoritos, alternarFavorito } = useFavoritos();
    const { idPsicologo } = useParams();

    const [psicologo, setPsicologo] = useState(null);
    // { janelas, horarios } ou { erro }; null enquanto carrega
    const [agenda, setAgenda] = useState(null);
    // Sem janelas cadastradas o profissional aceita qualquer horário (o POST /consultas confere)
    const temAgenda = agenda?.janelas?.length > 0;

    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        setPsicologo(null);
        setSessaoAgendada(state?.sessaoAgendada || null);
        setNaListaEspera(false);
        setMensagem("");
        setDataAgendamento(state?.dataAgendamento || "");
        buscarPsicologo();
        buscarAgenda();
    }, [idPsicologo]);

    async function buscarPsicologo() {
        if (!idPsicologo) {
            return;
        }

        try {
            setCarregando(true);

            const resposta = await fetch(
                `${api}/profissionais/${idPsicologo}`,
                {
                    credentials: "include"
                }
            );

            if (!resposta.ok) {
                console.log("Erro ao buscar psicólogo");
                return;
            }

            const dados = await resposta.json();

            if (!resposta.ok) {
                toast.error(dados.error || "Profissional não encontrado.");
                return;
            }

            setPsicologo(normalizarProfissional(dados.profissionais));

        } catch (erro) {
            console.log("Erro ao carregar psicólogo:", erro);
        } finally {
            setCarregando(false);
        }
    }

    async function buscarAgenda() {
        if (!idPsicologo) return;
        setAgenda(null);
        try {
            const [disponibilidade, livres] = await Promise.all(["disponibilidade", "horarios"].map(async (rota) => {
                const resposta = await fetch(`${api}/profissionais/${idPsicologo}/${rota}`, { credentials: "include" });
                const dados = await resposta.json().catch(() => null);
                if (!resposta.ok) throw new Error(dados?.error || "Não foi possível carregar os horários.");
                return dados;
            }));
            setAgenda({ janelas: disponibilidade.janelas, horarios: livres.horarios });
            if (disponibilidade.janelas.length && !livres.horarios.length) buscarListaEspera();
        } catch (erro) {
            setAgenda({ erro: erro.message });
        }
    }

    async function buscarListaEspera() {
        const resposta = await fetch(`${api}/lista-espera/`, { credentials: "include" }).catch(() => null);
        const dados = resposta?.ok ? await resposta.json() : null;
        setNaListaEspera(Boolean(dados?.lista_espera?.some((entrada) => entrada.profissional_id === Number(idPsicologo))));
    }

    // A vaga não fica reservada: o aviso só diz que abriu. A API aceita janelas de até 31 dias
    async function entrarNaListaEspera() {
        setEntrandoLista(true);
        try {
            const inicio = new Date(Date.now() + 5 * 60 * 1000);
            const fim = new Date(inicio.getTime() + 30 * 24 * 60 * 60 * 1000);
            const resposta = await fetch(`${api}/lista-espera/`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_profissional: psicologo.id, inicio: dataHoraLocal(inicio), fim: dataHoraLocal(fim) }),
            });
            const dados = await resposta.json().catch(() => null);
            if (!resposta.ok) throw new Error(dados?.error || "Não foi possível entrar na lista de espera.");
            setNaListaEspera(true);
            toast.success("Avisaremos se abrir um horário nos próximos 30 dias. A vaga não fica reservada.");
        } catch (falha) {
            toast.error(falha.message);
        } finally {
            setEntrandoLista(false);
        }
    }

    async function agendarConsulta(evento) {
        evento.preventDefault();
        if (agendando) return;
        if (!dataAgendamento || !psicologo) {
            verHorarios();
            return;
        }

        const formulario = evento.currentTarget;
        const { metodo, cartao } = lerPagamento(formulario);
        setAgendando(true);
        setMensagem("");
        try {
            const intervalo = intervaloConsulta(dataAgendamento);
            if (!sessaoAgendada && new Date(intervalo.inicio) <= new Date()) {
                throw new Error("Escolha um horário futuro para a consulta.");
            }
            let sessao = sessaoAgendada;
            if (!sessao) {
                const resposta = await fetch(`${api}/consultas/`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id_profissional: psicologo.id,
                        timestamp_inicio: intervalo.inicio,
                        timestamp_fim: `${intervalo.fim}:00`
                    })
                });
                const retorno = await resposta.json();
                if (!resposta.ok) {
                    // 409: o horário foi ocupado ou saiu da agenda desde que a lista foi carregada
                    if (resposta.status === 409) {
                        setDataAgendamento("");
                        buscarAgenda();
                    }
                    throw new Error(retorno.error || "Não foi possível agendar a consulta.");
                }
                sessao = retorno.sessao;
                setSessaoAgendada(sessao);
            }

            const pagamento = await fetch(`${api}/pagamentos/cobranca`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_sessao: sessao.sessao_id, metodo, ...(cartao && { cartao }) })
            });
            const pagamentoRetorno = await pagamento.json();
            if (!pagamento.ok) {
                // Recusa (402) não cria cobrança: o paciente pode tentar de novo com qualquer método
                setMensagem("Consulta agendada, mas o pagamento não foi concluído. Tente novamente ou escolha outra forma de pagamento.");
                toast.warning(pagamentoRetorno.error || "Consulta agendada, mas o pagamento não foi concluído.");
                return;
            }
            if (metodo === "CARTAO") {
                toast.success("Pagamento aprovado. Sua consulta está confirmada.");
                navigate("/sessoes");
                return;
            }
            // Daqui em diante não há outro método: a Arkhé não cancela a cobrança, e o paciente poderia pagar duas vezes
            const idCobranca = pagamentoRetorno.cobranca.id_cobranca;
            navigate(`/pagamento/${idCobranca}`, {
                state: { resumoConsulta: { idCobranca, psicologo, inicio: intervalo.inicio, fim: intervalo.fim } }
            });
        } catch (erro) {
            toast.error(erro.message || "Não foi possível conectar ao servidor.");
        } finally {
            limparCartao(formulario);
            setAgendando(false);
        }
    }

    function verHorarios() {
        setMostrarHorarios(true);
    }

    function voltar() {
        navigate(-1);
    }

    function formatarValor(valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    return (
        <div className={css.pagina}>

            <main className={css.areaPerfil}>

                {carregando ? (

                    <Carregando texto="Carregando profissional..." className={css.container}>
                        <Skeleton width="80px" height="20px" />
                        <section className={`${css.cardPerfil} ${css.skeletonLinha}`}>
                            <div className={css.conteudoCard}>
                                <div className={css.colunaFoto}>
                                    <Skeleton height="285px" radius="12px" />
                                    <div className={css.horarios}>
                                        <Skeleton width="70px" height="14px" />
                                        <Skeleton width="90%" height="12px" className={css.skeletonLinha} />
                                        <Skeleton width="80%" height="12px" className={css.skeletonLinha} />
                                    </div>
                                </div>
                                <div className={css.informacoes}>
                                    <div className={css.topoInformacoes}>
                                        <div>
                                            <Skeleton width="240px" height="28px" />
                                            <Skeleton width="140px" height="14px" className={css.skeletonLinha} />
                                        </div>
                                        <Skeleton width="110px" height="36px" />
                                    </div>
                                    <div className={css.blocoInfo}>
                                        <Skeleton width="120px" height="16px" />
                                        <Skeleton width="60%" height="13px" className={css.skeletonLinha} />
                                    </div>
                                    <div className={css.blocoInfo}>
                                        <Skeleton width="170px" height="16px" />
                                        <Skeleton height="13px" className={css.skeletonLinha} />
                                        <Skeleton height="13px" className={css.skeletonLinha} />
                                        <Skeleton width="75%" height="13px" className={css.skeletonLinha} />
                                    </div>
                                    <Skeleton width="220px" height="42px" radius="8px" className={css.skeletonLinha} />
                                </div>
                            </div>
                        </section>
                    </Carregando>

                ) : !psicologo ? (

                    <div className={css.carregando}>
                        {mensagem || "Profissional não encontrado."}
                    </div>

                ) : (

                    <div className={css.container}>

                        <button
                            className={css.voltar}
                            onClick={voltar}
                        >
                            <ArrowLeft size={18} strokeWidth={1.8} aria-hidden="true" />
                            Voltar
                        </button>

                        <section className={css.cardPerfil}>

                            <div className={css.conteudoCard}>

                                <div className={css.colunaFoto}>

                                    <div className={css.areaFoto}>

                                        <UserAvatar nome={psicologo.nome} src={psicologo.foto_url} className={css.foto} fallbackClassName={css.semFoto} />

                                        <button
                                            type="button"
                                            className={favoritos.has(psicologo.id) ? `${css.favorito} ${css.favoritoAtivo}` : css.favorito}
                                            title={favoritos.has(psicologo.id) ? "Remover dos favoritos" : "Favoritar profissional"}
                                            aria-label={`Favoritar ${psicologo.nome}`}
                                            aria-pressed={favoritos.has(psicologo.id)}
                                            onClick={() => alternarFavorito(psicologo.id)}
                                        >
                                            <Heart size={19} fill={favoritos.has(psicologo.id) ? "currentColor" : "none"} strokeWidth={1.8} aria-hidden="true" />
                                        </button>

                                    </div>

                                    <div className={css.horarios}>

                                        <strong>Horários:</strong>

                                        {agenda && !temAgenda && <p>{agenda.erro || "Selecione uma data e um horário para agendar."}</p>}
                                        {temAgenda && agenda.janelas.map((janela) => (
                                            <div
                                                key={`${janela.dia_semana}-${janela.inicio}`}
                                                className={css.itemHorario}
                                            >
                                                <span>{diasSemana[janela.dia_semana]}</span>

                                                <small>
                                                    • {janela.inicio} às {janela.fim}
                                                </small>
                                            </div>
                                        ))}

                                    </div>

                                </div>

                                <div className={css.informacoes}>

                                    <div className={css.topoInformacoes}>

                                        <div>
                                            <h1>{psicologo.nome}</h1>

                                            {psicologo.crp && (
                                                <span className={css.crp}>
                                                    Registro: {psicologo.crp}
                                                </span>
                                            )}

                                            {psicologo.patrocinado && <span className={css.patrocinado}>Patrocinado</span>}
                                        </div>

                                        <div className={css.avaliacoes}>

                                            <div className={css.estrelas}>
                                                {[1, 2, 3, 4, 5].map((estrela) => (
                                                    <span key={estrela}>
                                                        <Star size={16} fill={estrela <= Math.round(psicologo.avaliacao || 0) ? "currentColor" : "none"} strokeWidth={1.8} aria-hidden="true" />
                                                    </span>
                                                ))}
                                            </div>

                                            <div className={css.notaAvaliacao}>
                                                <strong>{psicologo.avaliacao?.toLocaleString("pt-BR") ?? "–"}</strong>
                                                <small>{psicologo.totalAvaliacoes} {psicologo.totalAvaliacoes === 1 ? "avaliação" : "avaliações"}</small>
                                            </div>

                                        </div>

                                    </div>

                                    <div className={css.blocoInfo}>
                                        <h3>Especialidades:</h3>
                                        <p>{psicologo.especialidade || "Não informado"}</p>
                                    </div>

                                    {psicologo.areas_atuacao?.length > 0 && (
                                        <div className={css.blocoInfo}>
                                            <h3>Áreas de atuação:</h3>
                                            <p>{psicologo.areas_atuacao.join(", ")}</p>
                                        </div>
                                    )}

                                    {psicologo.abordagem && (
                                        <div className={css.blocoInfo}>
                                            <h3>Abordagem terapêutica:</h3>
                                            <p>{psicologo.abordagem}</p>
                                        </div>
                                    )}

                                    {psicologo.modalidade && (
                                        <div className={css.blocoInfo}>
                                            <h3>Modalidade:</h3>
                                            <p>{nomesModalidade[psicologo.modalidade]}</p>
                                        </div>
                                    )}

                                    {psicologo.idiomas?.length > 0 && (
                                        <div className={css.blocoInfo}>
                                            <h3>Idiomas:</h3>
                                            <p>{psicologo.idiomas.join(", ")}</p>
                                        </div>
                                    )}

                                    {psicologo.formacao && (
                                        <div className={css.blocoInfo}>
                                            <h3>Formação:</h3>
                                            <p className={css.descricao}>{psicologo.formacao}</p>
                                        </div>
                                    )}

                                    <div className={css.blocoInfo}>
                                        <h3>Sobre o profissional:</h3>
                                        <p className={css.descricao}>
                                            {psicologo.descricao || "Nenhuma descrição cadastrada."}
                                        </p>
                                    </div>

                                    {psicologo.anos_experiencia != null && (
                                        <p className={css.experiencia}>
                                            • {psicologo.anos_experiencia === 1 ? "1 ano" : `${psicologo.anos_experiencia} anos`} de experiência
                                        </p>
                                    )}

                                    {/* null abaixo do plano Profissional; a API só aceita links de YouTube e Vimeo */}
                                    {psicologo.video_url && (
                                        <div className={css.blocoInfo}>
                                            <h3>Vídeo de apresentação:</h3>
                                            <iframe
                                                className={css.video}
                                                src={psicologo.video_url}
                                                title={`Vídeo de apresentação de ${psicologo.nome}`}
                                                loading="lazy"
                                                referrerPolicy="strict-origin-when-cross-origin"
                                                sandbox="allow-scripts allow-same-origin allow-presentation"
                                                allowFullScreen
                                            />
                                        </div>
                                    )}

                                    <button
                                        className={css.verDisponibilidade}
                                        onClick={verHorarios}
                                        disabled={!agenda || agendando || Boolean(sessaoAgendada)}
                                    >
                                        {!agenda ? "Carregando horários..." : temAgenda ? "Ver horários disponíveis" : "Escolher data e horário"}
                                    </button>

                                    {temAgenda && !agenda.horarios.length && (
                                        <button
                                            type="button"
                                            className={css.listaEspera}
                                            onClick={entrarNaListaEspera}
                                            disabled={naListaEspera || entrandoLista}
                                        >
                                            {naListaEspera ? "Você será avisado se abrir horário" : entrandoLista ? "Aguarde..." : "Avisar se abrir horário"}
                                        </button>
                                    )}

                                </div>

                            </div>

                            {dataAgendamento && (
                                <p className={css.dataSelecionada}>
                                    <CalendarDays size={18} strokeWidth={1.8} aria-hidden="true" />{" "}
                                    Consulta em {new Date(dataAgendamento).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                                </p>
                            )}
                            <form onSubmit={agendarConsulta}>

                                {dataAgendamento && (
                                    <div className={css.pagamento}>
                                        <MetodoPagamento parcelas desabilitado={agendando} />
                                    </div>
                                )}

                                <div className={css.rodapeCard}>

                                    <button
                                        type="submit"
                                        className={css.agendar}
                                        disabled={agendando}
                                    >
                                        {agendando ? "Aguarde..." : sessaoAgendada ? "Pagar consulta" : dataAgendamento ? "Confirmar e pagar" : "Escolher horário"}
                                        <span>/</span>
                                        <strong>
                                            {formatarValor(psicologo.valor_sessao)}/h
                                        </strong>
                                    </button>

                                    <button
                                        type="button"
                                        className={css.calendario}
                                        onClick={verHorarios}
                                        title={temAgenda ? "Ver horários disponíveis" : "Escolher data e horário"}
                                        aria-label={temAgenda ? "Ver horários disponíveis" : "Escolher data e horário"}
                                        disabled={!agenda || agendando || Boolean(sessaoAgendada)}
                                    >
                                            <CalendarDays size={22} strokeWidth={1.8} aria-hidden="true" />
                                    </button>

                                </div>

                            </form>

                        </section>

                        <ArtigosPerfil idProfissional={psicologo.id} />

                        {mostrarHorarios && (
                            <VerHorarios
                                horarios={temAgenda ? agenda.horarios : null}
                                selecionado={dataAgendamento}
                                fechar={() => setMostrarHorarios(false)}
                                onSelecionar={(inicio) => {
                                    setDataAgendamento(inicio);
                                    setMostrarHorarios(false);
                                }}
                            />
                        )}

                        {mensagem && <p>{mensagem}</p>}

                    </div>

                )}

            </main>

        </div>

    );
}
