import UserAvatar from "../../components/UserAvatar/UserAvatar.jsx";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import css from "../../pages/DescricaoPsicologo/DescricaoPsicologo.module.css";
import Skeleton, { Carregando } from "../../components/Skeleton/Skeleton.jsx";
import EscolherData from "../../components/EscolherData/EscolherData.jsx";
import VerHorarios from "../../components/VerHorarios/VerHorarios.jsx";
import api from "../../config/api.js";
import { ArrowLeft, CalendarDays, Heart, Star } from "lucide-react";
import { toast } from "sonner";
import { intervaloConsulta } from "../../utils/agendamento.js";
import { nomesModalidade, normalizarProfissional } from "../../utils/profissionais.js";

const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export default function DescricaoPsicologo() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const [abrirCalendario, setAbrirCalendario] = useState(false);
    const [dataAgendamento, setDataAgendamento] = useState(state?.dataAgendamento || "");
    const [mostrarHorarios, setMostrarHorarios] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [agendando, setAgendando] = useState(false);
    const [sessaoAgendada, setSessaoAgendada] = useState(null);
    const { idPsicologo } = useParams();

    const [psicologo, setPsicologo] = useState(null);
    // { janelas, horarios } ou { erro }; null enquanto carrega
    const [agenda, setAgenda] = useState(null);
    // Sem janelas cadastradas o profissional aceita qualquer horário (o POST /consultas confere)
    const temAgenda = agenda?.janelas?.length > 0;

    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        setPsicologo(null);
        setSessaoAgendada(null);
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
        } catch (erro) {
            setAgenda({ erro: erro.message });
        }
    }

    async function agendarConsulta() {
        if (agendando) return;
        if (!dataAgendamento || !psicologo) {
            verHorarios();
            return;
        }

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
                body: JSON.stringify({ id_sessao: sessao.sessao_id })
            });
            const pagamentoRetorno = await pagamento.json();
            if (!pagamento.ok) {
                setMensagem("Consulta agendada. Tente gerar o Pix novamente para continuar.");
                toast.warning(pagamentoRetorno.error || "Consulta agendada, mas o Pix não foi criado.");
                return;
            }
            const idCobranca = pagamentoRetorno.cobranca.id_cobranca;
            navigate(`/pagamento/${idCobranca}`, {
                state: { resumoConsulta: { idCobranca, psicologo, inicio: intervalo.inicio, fim: intervalo.fim } }
            });
        } catch (erro) {
            toast.error(erro.message || "Não foi possível conectar ao servidor.");
        } finally {
            setAgendando(false);
        }
    }

    function verHorarios() {
        if (!temAgenda) {
            setAbrirCalendario(true);
            return;
        }
        setMostrarHorarios((valorAtual) => !valorAtual);
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
                                            className={css.favorito}
                                            title="Favoritar profissional"
                                        >
                                            <Heart size={19} strokeWidth={1.8} aria-hidden="true" />
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

                                    <div className={css.blocoInfo}>
                                        <h3>Sobre o profissional:</h3>
                                        <p className={css.descricao}>
                                            {psicologo.descricao || "Nenhuma descrição cadastrada."}
                                        </p>
                                    </div>

                                    {psicologo.experiencia && (
                                        <p className={css.experiencia}>
                                            • {psicologo.experiencia}
                                        </p>
                                    )}

                                    <button
                                        className={css.verDisponibilidade}
                                        onClick={verHorarios}
                                        disabled={!agenda || agendando || Boolean(sessaoAgendada)}
                                    >
                                        {!agenda ? "Carregando horários..." : temAgenda ? "Ver horários disponíveis" : "Escolher data e horário"}
                                    </button>

                                    {mostrarHorarios && (
                                        <div className={css.dropdownHorarios}>
                                            <VerHorarios
                                                horarios={agenda.horarios}
                                                selecionado={dataAgendamento}
                                                fechar={() => setMostrarHorarios(false)}
                                                onSelecionar={(inicio) => {
                                                    setDataAgendamento(inicio);
                                                    setMostrarHorarios(false);
                                                }}
                                            />
                                        </div>
                                    )}

                                </div>

                            </div>

                            {dataAgendamento && (
                                <p className={css.dataSelecionada}>
                                    <CalendarDays size={18} strokeWidth={1.8} aria-hidden="true" />{" "}
                                    Consulta em {new Date(dataAgendamento).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                                </p>
                            )}
                            <div className={css.rodapeCard}>

                                <button
                                    className={css.agendar}
                                    onClick={agendarConsulta}
                                    disabled={agendando}
                                >
                                    {agendando ? "Aguarde..." : sessaoAgendada ? "Gerar Pix" : dataAgendamento ? "Confirmar consulta" : "Escolher horário"}
                                    <span>/</span>
                                    <strong>
                                        {formatarValor(psicologo.valor_sessao)}/h
                                    </strong>
                                </button>

                                <button
                                    className={css.calendario}
                                    onClick={verHorarios}
                                    title={temAgenda ? "Ver horários disponíveis" : "Escolher data e horário"}
                                    disabled={!agenda || agendando || Boolean(sessaoAgendada)}
                                >
                                        <CalendarDays size={22} strokeWidth={1.8} aria-hidden="true" />
                                </button>

                            </div>

                        </section>

                        {abrirCalendario && (
                            <EscolherData
                                dataInicial={dataAgendamento}
                                fechar={() => setAbrirCalendario(false)}
                                onSalvar={(novaData) => setDataAgendamento(novaData)}
                            />
                        )}

                        {mensagem && <p>{mensagem}</p>}

                    </div>

                )}

            </main>

        </div>

    );
}
