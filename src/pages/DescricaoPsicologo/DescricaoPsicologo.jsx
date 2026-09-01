import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import css from "../../pages/DescricaoPsicologo/DescricaoPsicologo.module.css";
import Footer from "../../components/Footer/Footer.jsx";
import EscolherData from "../../components/EscolherData/EscolherData.jsx";

export default function DescricaoPsicologo({ api }) {
    const navigate = useNavigate();
    const [abrirCalendario, setAbrirCalendario] = useState(false);
    const [dataAgendamento, setDataAgendamento] = useState("");
    const [mostrarHorarios, setMostrarHorarios] = useState(false);
    const { idPsicologo } = useParams();

    const [psicologo, setPsicologo] = useState({
        id: "",
        nome: "Andreia Silva",
        foto: "",
        crp: "06/123456",
        especialidade: "Terapia online, depressão e relacionamentos.",
        descricao:
            "Especialista em atendimento online, auxílio adolescentes e adultos a enfrentarem sintomas de ansiedade, depressão e dificuldades nos relacionamentos. Busca criar um ambiente seguro para que o paciente possa se expressar livremente e evoluir em seu processo terapêutico.",
        avaliacao: 5,
        totalAvaliacoes: 235,
        valor_sessao: 160,
        experiencia: "3 anos de experiência",
        horarios: [
            {
                dia: "Segunda a Sexta",
                inicio: "08:00",
                fim: "18:00"
            },
            {
                dia: "Sábado",
                inicio: "08:00",
                fim: "12:00"
            }
        ]
    });

    const [carregando, setCarregando] = useState(false);

    useEffect(() => {
        buscarPsicologo();
    }, [idPsicologo]);

    async function buscarPsicologo() {
        if (!api || !idPsicologo) {
            return;
        }

        try {
            setCarregando(true);

            const resposta = await fetch(
                `${api}/psicologo/${idPsicologo}`,
                {
                    credentials: "include"
                }
            );

            if (!resposta.ok) {
                console.log("Erro ao buscar psicólogo");
                return;
            }

            const dados = await resposta.json();

            setPsicologo(dados);

        } catch (erro) {
            console.log("Erro ao carregar psicólogo:", erro);
        } finally {
            setCarregando(false);
        }
    }

    function agendarConsulta() {
        navigate(`/Agendamento/${psicologo.id || idPsicologo}`);
    }

    function verHorarios() {
        setMostrarHorarios((valorAtual) => !valorAtual);
    }

    function sair() {
        localStorage.clear();
        navigate("/login");
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

            <header className={css.header}>

                <img
                    src="/logo.png"
                    alt="PSICOdaily"
                    className={css.logo}
                />

                <div className={css.usuarioTopo}>

                    <Link
                        to="/perfilpaciente"
                        className={css.perfilTopo}
                    >
                        <div className={css.avatarTopo}>
                            <div className={css.cabeca}></div>
                            <div className={css.corpo}></div>
                        </div>
                    </Link>

                    <button
                        className={css.botaoSair}
                        onClick={sair}
                        title="Sair"
                    >
                        ↪
                    </button>

                </div>

            </header>

            <main className={css.areaPerfil}>

                {carregando ? (

                    <div className={css.carregando}>
                        Carregando profissional...
                    </div>

                ) : (

                    <div className={css.container}>

                        <button
                            className={css.voltar}
                            onClick={voltar}
                        >
                            ← Voltar
                        </button>

                        <section className={css.cardPerfil}>

                            <div className={css.conteudoCard}>

                                <div className={css.colunaFoto}>

                                    <div className={css.areaFoto}>

                                        {psicologo.foto ? (
                                            <img
                                                src={psicologo.foto}
                                                alt={psicologo.nome}
                                                className={css.foto}
                                            />
                                        ) : (
                                            <div className={css.semFoto}>
                                                {psicologo.nome?.charAt(0).toUpperCase()}
                                            </div>
                                        )}

                                        <button
                                            className={css.favorito}
                                            title="Favoritar profissional"
                                        >
                                            ♡
                                        </button>

                                    </div>

                                    <div className={css.horarios}>

                                        <strong>Horários:</strong>

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
                                                    CRP: {psicologo.crp}
                                                </span>
                                            )}
                                        </div>

                                        <div className={css.avaliacoes}>

                                            <div className={css.estrelas}>
                                                {[1, 2, 3, 4, 5].map((estrela) => (
                                                    <span key={estrela}>
                                                        {estrela <= Math.round(psicologo.avaliacao || 0) ? "★" : "☆"}
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
                                    >
                                        Ver horários disponíveis
                                    </button>

                                    {mostrarHorarios && (
                                        <div className={css.listaHorariosDisponiveis}>

                                            {psicologo.horarios?.length > 0 ? (
                                                psicologo.horarios.map((horario, index) => (
                                                    <div
                                                        key={index}
                                                        className={css.linhaHorarioDisponivel}
                                                    >
                                                        <span>{horario.dia}</span>
                                                        <small>{horario.inicio} às {horario.fim}</small>
                                                    </div>
                                                ))
                                            ) : (
                                                <p>Nenhum horário disponível no momento.</p>
                                            )}

                                        </div>
                                    )}

                                </div>

                            </div>

                            <div className={css.rodapeCard}>

                                <button
                                    className={css.agendar}
                                    onClick={agendarConsulta}
                                >
                                    Agendar consulta
                                    <span>/</span>
                                    <strong>
                                        {formatarValor(psicologo.valor_sessao)}/h
                                    </strong>
                                </button>

                                <button
                                    className={css.calendario}
                                    onClick={() => setAbrirCalendario(true)}
                                    title="Ver agenda"
                                >
                                    <img
                                        className={css.imagem}
                                        src="/Frame.png"
                                        alt="Calendário"
                                    />
                                </button>

                            </div>

                        </section>

                        {abrirCalendario && (
                            <EscolherData
                                fechar={() => setAbrirCalendario(false)}
                                onSalvar={(novaData) => setDataAgendamento(novaData)}
                            />
                        )}

                    </div>

                )}

            </main>

            <Footer/>

        </div>

    );
}