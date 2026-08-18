import { Link, useNavigate } from "react-router-dom";
import css from "../styles/Dashboardpsicologo.module.css";
import Footer from "../components/Footer/Footer.jsx";

export default function Dashboardpsicologo() {

    const navigate = useNavigate();

    const nomeCompleto = localStorage.getItem("nome") || "Helena";
    const primeiroNome = nomeCompleto.split(" ")[0];

    function sair() {
        localStorage.clear();
        navigate("/login");
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

                <div className={css.areaPerfil}>

                    <Link
                        to="/Perfilpsicologo"
                        className={css.perfil}
                    >
                        <div className={css.avatarTopo}>
                            <div className={css.cabeca}></div>
                            <div className={css.corpo}></div>
                        </div>
                    </Link>

                    <button
                        className={css.sair}
                        onClick={sair}
                    >
                        ↪
                    </button>

                </div>

            </header>


            {/* CONTEÚDO */}

            <main className={css.fundo}>

                <div className={css.container}>

                    {/* BOAS VINDAS */}

                    <section className={css.boasVindas}>

                        <h1>
                            Olá, Dra. {primeiroNome}
                        </h1>

                        <p>
                            Sexta-feira, 24 de Novembro
                        </p>

                    </section>


                    {/* RESUMO + AGENDA */}

                    <section className={css.areaPrincipal}>


                        {/* RESUMO MENSAL */}

                        <div className={css.resumo}>

                            <h2>
                                Resumo Mensal
                            </h2>

                            <span className={css.textoMenor}>
                                Faturamento Previsto
                            </span>

                            <div className={css.faturamento}>

                                <strong>
                                    R$ 12.450
                                </strong>

                                <span>
                                    +8%
                                </span>

                            </div>


                            <div className={css.divisor}></div>


                            <div className={css.resumoInferior}>

                                <div>
                                    <span>
                                        A Receber
                                    </span>

                                    <strong>
                                        R$ 3.200
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Sessões
                                    </span>

                                    <strong>
                                        18
                                    </strong>
                                </div>

                            </div>

                        </div>


                        {/* AGENDA */}

                        <div className={css.agenda}>

                            <div className={css.topoAgenda}>

                                <h2>
                                    <span className={css.calendarioIcone}>
                                        <img
                                            src="/Icon.png"
                                            alt="Icone de agenda"
                                        />
                                    </span>

                                    Agenda de Hoje
                                </h2>


                                <Link
                                    to="/Agendapsicologo"
                                    className={css.verTodas}
                                >
                                    Ver todas
                                </Link>

                            </div>


                            {/* CONSULTA 1 */}

                            <div className={`${css.consulta} ${css.consultaAtiva}`}>

                                <div className={css.horario}>

                                    <strong>
                                        09:00
                                    </strong>

                                    <span>
                                        50 min
                                    </span>

                                </div>


                                <img
                                    src="/paciente-mariana.png"
                                    alt="Mariana"
                                    className={css.fotoPaciente}
                                />


                                <div className={css.dadosConsulta}>

                                    <strong>
                                        Mariana S. (Online)
                                    </strong>

                                    <span>
                                        Terapia Cognitivo-Comportamental
                                    </span>

                                </div>


                                <button
                                    className={css.botaoIniciar}
                                    onClick={() => navigate("/Sessao")}
                                >
                                    ▣ Iniciar
                                </button>

                            </div>


                            {/* CONSULTA 2 */}

                            <div className={css.consulta}>

                                <div className={css.horario}>

                                    <strong>
                                        11:00
                                    </strong>

                                    <span>
                                        50 min
                                    </span>

                                </div>


                                <div className={css.avatarIniciais}>
                                    RC
                                </div>


                                <div className={css.dadosConsulta}>

                                    <strong>
                                        Roberto C. (Presencial)
                                    </strong>

                                    <span>
                                        Primeira Consulta
                                    </span>

                                </div>


                                <span className={css.seta}>
                                    ›
                                </span>

                            </div>

                        </div>

                    </section>


                    {/* PACIENTES */}

                    <section className={css.pacientes}>

                        <h2>
                            Pacientes
                        </h2>


                        <div className={css.listaPacientes}>

                            <Link
                                to="/Paciente/laura"
                                className={css.paciente}
                            >

                                <img
                                    src="/paciente-laura.png"
                                    alt="Laura"
                                />

                                <span>
                                    Laura
                                </span>

                            </Link>


                            <Link
                                to="/Paciente/carlos"
                                className={css.paciente}
                            >

                                <img
                                    src="/paciente-carlos.png"
                                    alt="Carlos"
                                />

                                <span>
                                    Carlos
                                </span>

                            </Link>


                            <Link
                                to="/Paciente/mariana"
                                className={css.paciente}
                            >

                                <img
                                    src="/paciente-mariana.png"
                                    alt="Mariana"
                                />

                                <span>
                                    Mariana
                                </span>

                            </Link>


                            <Link
                                to="/Paciente/joao"
                                className={css.paciente}
                            >

                                <img
                                    src="/paciente-joao.png"
                                    alt="João"
                                />

                                <span>
                                    João
                                </span>

                            </Link>


                            <Link
                                to="/Paciente/ana"
                                className={css.paciente}
                            >

                                <img
                                    src="/paciente-ana.png"
                                    alt="Ana"
                                />

                                <span>
                                    Ana
                                </span>

                            </Link>

                        </div>

                    </section>

                </div>

            </main>


            <Footer />

        </div>
    );
}