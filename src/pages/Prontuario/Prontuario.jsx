import { useUsuario } from "../../contexts/UsuarioContext.jsx";
import MoodIcon from "../../components/MoodIcon/MoodIcon.jsx";
import UserAvatar from "../../components/UserAvatar/UserAvatar.jsx";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import css from "../Prontuario/Prontuario.module.css";
import Footer from "../../components/Footer/Footer.jsx";
import { Activity, ArrowLeft, BookOpen, CalendarDays, ChartNoAxesCombined, CheckCircle2, Clock3, LogOut, Smile, TrendingUp, UserRound, Utensils } from "lucide-react";
import { toast } from "sonner";

export default function Prontuario({ api }) {

    const navigate = useNavigate();
    const { sair: encerrarSessao } = useUsuario();

    const { idPaciente } = useParams();
    const { state } = useLocation();


    const [paciente, setPaciente] = useState({
        nome: "",
        idade: "",
        desde: "",
        foto: "",
        ...state?.paciente
    });


    const [ultimaConsulta, setUltimaConsulta] = useState({
        data: "",
        status: ""
    });


    const [frequencia, setFrequencia] = useState({
        tipo: "",
        detalhe: ""
    });


    const [humorMedio, setHumorMedio] = useState({
        titulo: "",
        detalhe: ""
    });


    const [evolucaoHumor, setEvolucaoHumor] = useState([]);

    const [registros, setRegistros] = useState([]);

    const [anotacao, setAnotacao] = useState("");

    const [historico, setHistorico] = useState([]);


    useEffect(() => {

        buscarProntuario();

    }, [idPaciente]);


    async function buscarProntuario() {

        if (!api || !idPaciente) {
            return;
        }

        try {

            const resposta = await fetch(
                `${api}/prontuario/${idPaciente}`,
                {
                    credentials: "include"
                }
            );


            if (!resposta.ok) {

                console.log("Erro ao buscar prontuário");

                return;
            }


            const dados = await resposta.json();


            setPaciente(
                dados.paciente || {
                    nome: "",
                    idade: "",
                    desde: "",
                    foto: ""
                }
            );


            setUltimaConsulta(
                dados.ultimaConsulta || {
                    data: "",
                    status: ""
                }
            );


            setFrequencia(
                dados.frequencia || {
                    tipo: "",
                    detalhe: ""
                }
            );


            setHumorMedio(
                dados.humorMedio || {
                    titulo: "",
                    detalhe: ""
                }
            );


            setEvolucaoHumor(
                dados.evolucaoHumor || []
            );


            setRegistros(
                dados.registros || []
            );


            setAnotacao(
                dados.anotacao || ""
            );


            setHistorico(
                dados.historico || []
            );


        } catch (erro) {

            console.log(
                "Erro ao carregar prontuário:",
                erro
            );

        }

    }


    async function salvarNota() {

        if (!anotacao.trim()) {

            toast.warning("Digite uma anotação");

            return;
        }


        try {

            const resposta = await fetch(
                `${api}/prontuario/${idPaciente}/anotacao`,
                {
                    method: "POST",

                    credentials: "include",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        anotacao: anotacao
                    })
                }
            );


            if (resposta.ok) {

                toast.success("Nota salva com sucesso!");

                buscarProntuario();

            } else {

                toast.error("Erro ao salvar nota");

            }


        } catch (erro) {

            console.log(
                "Erro ao salvar nota:",
                erro
            );

        }

    }


    function criarPontosGrafico() {

        if (evolucaoHumor.length === 0) {

            return "";

        }


        const largura = 600;

        const altura = 150;


        return evolucaoHumor
            .map((item, index) => {

                const x =
                    evolucaoHumor.length === 1
                        ? largura / 2
                        : (
                        index /
                        (evolucaoHumor.length - 1)
                    ) * largura;


                const valor = Number(item.valor) || 1;


                const y =
                    altura -
                    ((valor - 1) / 4) * altura;


                return `${x},${y}`;

            })
            .join(" ");

    }


    function classeHumor(humor) {

        if (
            humor === "Bem" ||
            humor === "Muito Bem"
        ) {

            return css.humorBom;

        }


        if (humor === "Neutro") {

            return css.humorNeutro;

        }


        return css.humorRuim;

    }


    function voltar() {

        navigate(-1);

    }


    function verTodosRegistros() {

        navigate(
            `/DiarioPaciente/${idPaciente}`
        );

    }


    async function sair() {
        try {
            await encerrarSessao();
            navigate("/login");
        } catch {
            toast.error("Falha ao sair. Tente novamente.");
        }
    }


    return (

        <div className={css.pagina}>


            {/* HEADER */}

            <header className={css.header}>

                <img
                    src="/logo.png"
                    alt="PSICOdaily"
                    className={css.logo}
                />


                <div className={css.usuarioTopo}>

                    <Link
                        to="/perfilpsicologo"
                        className={css.perfilTopo}
                        aria-label="Meu perfil"
                    >

                        <div className={css.avatarTopo}>

                            <UserAvatar currentUser />

                        </div>

                    </Link>


                    <button
                        className={css.sairTopo}
                        aria-label="Sair"
                        onClick={sair}
                    >
                        <LogOut size={19} strokeWidth={1.8} aria-hidden="true" />
                    </button>

                </div>

            </header>



            {/* ÁREA DO PRONTUÁRIO */}

            <main className={css.areaProntuario}>

                <div className={css.container}>


                    {/* PACIENTE */}

                    <div className={css.pacienteTopo}>

                        <button
                            className={css.voltar}
                            aria-label="Voltar"
                            onClick={voltar}
                        >
                            <ArrowLeft size={18} strokeWidth={1.8} aria-hidden="true" />
                        </button>


                        <div className={css.fotoPaciente}>

                            <UserAvatar userId={paciente.id_usuario || idPaciente} nome={paciente?.nome} src={paciente?.foto}  />

                        </div>


                        <div>

                            <h1>

                                {paciente.nome ||
                                    "Paciente"}

                            </h1>


                            <p>

                                {paciente.idade &&
                                    `${paciente.idade} anos`}

                                {paciente.idade &&
                                    paciente.desde &&
                                    " • "}

                                {paciente.desde &&
                                    `Paciente desde ${paciente.desde}`}

                            </p>

                        </div>

                    </div>



                    {/* CARDS DE RESUMO */}

                    <div className={css.cardsResumo}>


                        <div className={css.cardResumo}>

                            <span className={css.tituloResumo}>

                                <CalendarDays size={16} strokeWidth={1.8} aria-hidden="true" /> ÚLTIMA CONSULTA

                            </span>


                            <strong>

                                {ultimaConsulta.data ||
                                    "Sem consulta"}

                            </strong>


                            {ultimaConsulta.status && (

                                <small className={css.confirmado}>

                                    <CheckCircle2 size={15} strokeWidth={1.8} aria-hidden="true" /> {ultimaConsulta.status}

                                </small>

                            )}

                        </div>



                        <div className={css.cardResumo}>

                            <span className={css.tituloResumo}>

                                <Clock3 size={16} strokeWidth={1.8} aria-hidden="true" /> FREQUÊNCIA

                            </span>


                            <strong>

                                {frequencia.tipo ||
                                    "Não definida"}

                            </strong>


                            {frequencia.detalhe && (

                                <small>

                                    <Clock3 size={15} strokeWidth={1.8} aria-hidden="true" /> {frequencia.detalhe}

                                </small>

                            )}

                        </div>



                        <div className={css.cardResumo}>

                            <span className={css.tituloResumo}>

                                <Smile size={16} strokeWidth={1.8} aria-hidden="true" /> HUMOR MÉDIO (30D)

                            </span>


                            <strong className={css.azul}>

                                {humorMedio.titulo ||
                                    "Sem registros"}

                            </strong>


                            {humorMedio.detalhe && (

                                <small className={css.confirmado}>

                                    <TrendingUp size={15} strokeWidth={1.8} aria-hidden="true" /> {humorMedio.detalhe}

                                </small>

                            )}

                        </div>

                    </div>



                    {/* CONTEÚDO PRINCIPAL */}

                    <div className={css.gridPrincipal}>


                        {/* COLUNA ESQUERDA */}

                        <div className={css.colunaEsquerda}>


                            {/* EVOLUÇÃO DO HUMOR */}

                            <section className={css.cardGrafico}>


                                <div className={css.tituloCard}>

                                    <h2>

                                        <ChartNoAxesCombined size={18} strokeWidth={1.8} aria-hidden="true" />

                                        Evolução de Humor

                                    </h2>


                                    <button>

                                        Últimos 30 dias

                                    </button>

                                </div>



                                <div className={css.areaGrafico}>


                                    <div className={css.eixoHumor}>

                                        <span>Excelente</span>

                                        <span>Bem</span>

                                        <span>Neutro</span>

                                        <span>Baixo</span>

                                        <span>Crítico</span>

                                    </div>



                                    <div className={css.grafico}>


                                        {evolucaoHumor.length > 0 ? (

                                            <>

                                                <svg
                                                    viewBox="0 0 600 150"
                                                    preserveAspectRatio="none"
                                                >

                                                    <line
                                                        x1="0"
                                                        y1="0"
                                                        x2="600"
                                                        y2="0"
                                                    />

                                                    <line
                                                        x1="0"
                                                        y1="37.5"
                                                        x2="600"
                                                        y2="37.5"
                                                    />

                                                    <line
                                                        x1="0"
                                                        y1="75"
                                                        x2="600"
                                                        y2="75"
                                                    />

                                                    <line
                                                        x1="0"
                                                        y1="112.5"
                                                        x2="600"
                                                        y2="112.5"
                                                    />

                                                    <line
                                                        x1="0"
                                                        y1="150"
                                                        x2="600"
                                                        y2="150"
                                                    />


                                                    <polyline
                                                        points={
                                                            criarPontosGrafico()
                                                        }
                                                        className={
                                                            css.linhaGrafico
                                                        }
                                                    />

                                                </svg>



                                                <div
                                                    className={
                                                        css.datasGrafico
                                                    }
                                                >

                                                    {evolucaoHumor.map(
                                                        (
                                                            item,
                                                            index
                                                        ) => (

                                                            <span
                                                                key={index}
                                                            >
                                                                {
                                                                    item.dia
                                                                }
                                                            </span>

                                                        )
                                                    )}

                                                </div>

                                            </>

                                        ) : (

                                            <p>
                                                Sem dados de humor.
                                            </p>

                                        )}

                                    </div>

                                </div>

                            </section>



                            {/* REGISTROS DO DIÁRIO */}

                            <section className={css.cardRegistros}>

                                <h2>

                                    <CalendarDays size={18} strokeWidth={1.8} aria-hidden="true" />

                                    Registros Recentes do Diário

                                </h2>



                                <div className={css.listaRegistros}>


                                    {registros.length > 0 ? (

                                        registros.map(
                                            (registro) => (

                                                <div
                                                    className={
                                                        css.registro
                                                    }
                                                    key={
                                                        registro.id
                                                    }
                                                >


                                                    <div
                                                        className={
                                                            `${css.iconeRegistro} ${classeHumor(
                                                                registro.humor
                                                            )}`
                                                        }
                                                    >

                                                        <MoodIcon humor={registro.humor} />

                                                    </div>



                                                    <div
                                                        className={
                                                            css.conteudoRegistro
                                                        }
                                                    >


                                                        <div
                                                            className={
                                                                css.topoRegistro
                                                            }
                                                        >

                                                            <strong>

                                                                {
                                                                    registro.data
                                                                }

                                                            </strong>


                                                            <span
                                                                className={
                                                                    classeHumor(
                                                                        registro.humor
                                                                    )
                                                                }
                                                            >

                                                                {
                                                                    registro.humor
                                                                }

                                                            </span>

                                                        </div>



                                                        <p>

                                                            {
                                                                registro.texto
                                                            }

                                                        </p>



                                                        <div
                                                            className={
                                                                css.detalhesRegistro
                                                            }
                                                        >

                                                            <span>

                                                                <Clock3 size={15} strokeWidth={1.8} aria-hidden="true" />{" "}
                                                                {
                                                                    registro.sono
                                                                }

                                                            </span>


                                                            <span>

                                                                <Utensils size={15} strokeWidth={1.8} aria-hidden="true" />{" "}
                                                                {
                                                                    registro.alimentacao
                                                                }

                                                            </span>


                                                            <span>

                                                                <Activity size={15} strokeWidth={1.8} aria-hidden="true" />{" "}
                                                                {
                                                                    registro.atividade
                                                                }

                                                            </span>

                                                        </div>

                                                    </div>

                                                </div>

                                            )
                                        )

                                    ) : (

                                        <p>
                                            Nenhum registro encontrado.
                                        </p>

                                    )}

                                </div>



                                {registros.length > 0 && (

                                    <button
                                        className={
                                            css.verRegistros
                                        }
                                        onClick={
                                            verTodosRegistros
                                        }
                                    >

                                        Ver todos os registros

                                    </button>

                                )}

                            </section>

                        </div>



                        {/* ANOTAÇÕES CLÍNICAS */}

                        <aside className={css.cardAnotacoes}>


                            <div className={css.tituloAnotacoes}>

                                <h2>

                                    <BookOpen size={18} strokeWidth={1.8} aria-hidden="true" />

                                    Anotações Clínicas

                                </h2>

                                <UserRound size={18} strokeWidth={1.8} aria-hidden="true" />

                            </div>



                            <textarea
                                value={anotacao}
                                onChange={(e) =>
                                    setAnotacao(
                                        e.target.value
                                    )
                                }
                                placeholder="Digite suas anotações clínicas..."
                            />



                            <button
                                className={css.salvar}
                                onClick={salvarNota}
                            >

                                Salvar Nota

                            </button>



                            {/* HISTÓRICO */}

                            <div className={css.historico}>

                                <h3>

                                    HISTÓRICO DE NOTAS

                                </h3>


                                {historico.length > 0 ? (

                                    historico.map(
                                        (nota) => (

                                            <div
                                                className={
                                                    css.itemHistorico
                                                }
                                                key={
                                                    nota.id
                                                }
                                            >

                                                <span>

                                                    {
                                                        nota.titulo
                                                    }

                                                </span>

                                                <small>

                                                    {
                                                        nota.data
                                                    }

                                                </small>

                                            </div>

                                        )
                                    )

                                ) : (

                                    <p>
                                        Nenhuma nota anterior.
                                    </p>

                                )}

                            </div>

                        </aside>

                    </div>

                </div>

            </main>


            <Footer />

        </div>

    );
}