import UserAvatar from "../../components/UserAvatar/UserAvatar.jsx";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import css from "../../pages/DescricaoPsicologo/DescricaoPsicologo.module.css";
import Footer from "../../components/Footer/Footer.jsx";
import EscolherData from "../../components/EscolherData/EscolherData.jsx";
import VerHorarios from "../../components/VerHorarios/VerHorarios.jsx";
import api from "../../config/api.js";
import Header from "../../components/Header/Header.jsx";
import Sidebar from "../../components/Sidebar/Sidebar.jsx";
import { ArrowLeft, CalendarDays, Heart, Star } from "lucide-react";
import { toast } from "sonner";
import { intervaloConsulta } from "../../utils/agendamento.js";
import { normalizarProfissional } from "../../utils/profissionais.js";

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

    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        setPsicologo(null);
        setSessaoAgendada(null);
        setMensagem("");
        setDataAgendamento(state?.dataAgendamento || "");
        buscarPsicologo();
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

            const profissional = dados.profissionais;
            setPsicologo({
                ...normalizarProfissional(profissional),
                horarios: profissional.horarios || [],
                horariosDisponiveis: profissional.horariosDisponiveis || {},
            });

        } catch (erro) {
            console.log("Erro ao carregar psicólogo:", erro);
        } finally {
            setCarregando(false);
        }
    }

    async function agendarConsulta() {
        if (agendando) return;
        if (!dataAgendamento || !psicologo) {
            setAbrirCalendario(true);
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
                if (!resposta.ok) throw new Error(retorno.error || "Não foi possível agendar a consulta.");
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
        if (!Object.keys(psicologo?.horariosDisponiveis || {}).length) {
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

            <Header />

            <main className={css.areaPerfil}>

                <Sidebar />

                {carregando ? (

                    <div className={css.carregando}>
                        Carregando profissional...
                    </div>

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

                                        <UserAvatar userId={psicologo.id} nome={psicologo?.nome} src={psicologo?.foto} className={css.foto} fallbackClassName={css.semFoto} />

                                        <button
                                            className={css.favorito}
                                            title="Favoritar profissional"
                                        >
                                            <Heart size={19} strokeWidth={1.8} aria-hidden="true" />
                                        </button>

                                    </div>

                                    <div className={css.horarios}>

                                        <strong>Horários:</strong>

                                        {!psicologo.horarios?.length && <p>Selecione uma data e um horário para agendar.</p>}
                                        {psicologo.horarios?.map((horario, index) => (
                                            <div
                                                key={index}
                                                className={css.itemHorario}
                                            >
                                                <span>{horario.dia}</span>

                                                <small>
                                                    • {horario.inicio} às {horario.fim}
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
                                                <strong>{psicologo.avaliacao || "0"}</strong>
                                                <small>{psicologo.totalAvaliacoes || 0} avaliações</small>
                                            </div>

                                        </div>

                                    </div>

                                    <div className={css.blocoInfo}>
                                        <h3>Especialidades:</h3>
                                        <p>{psicologo.especialidade || "Não informado"}</p>
                                    </div>

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
                                        disabled={agendando || Boolean(sessaoAgendada)}
                                    >
                                        {Object.keys(psicologo.horariosDisponiveis).length ? "Ver horários disponíveis" : "Escolher data e horário"}
                                    </button>

                                    {mostrarHorarios && (
                                        <div className={css.dropdownHorarios}>
                                            <VerHorarios
                                                horariosDisponiveis={psicologo.horariosDisponiveis}
                                                fechar={() => setMostrarHorarios(false)}
                                                onSelecionar={({ dia, horario }) => toast.success(`${dia}, ${horario} selecionado.`)}
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
                                    onClick={() => setAbrirCalendario(true)}
                                    title="Escolher data e horário"
                                    disabled={agendando || Boolean(sessaoAgendada)}
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

            <Footer/>

        </div>

    );
}
