import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import css from "./DashboardPaciente.module.css";
import Footer from "../../components/Footer/Footer.jsx";
import styles from "../Home/Home.module.css";

export default function DashboardPaciente() {

    const navigate = useNavigate();

    const nomeCompleto = localStorage.getItem("nome") || "Mariana";
    const primeiroNome = nomeCompleto.split(" ")[0];

    const [nota, setNota] = useState("");

    function sair() {
        localStorage.clear();
        navigate("/login");
    }

    function salvarNota() {
        if (!nota) {
            alert("Digite uma nota antes de salvar");
            return;
        }

        alert("Nota salva!");
        setNota("");
    }

    return (
        <div className={`${css.pagina} min-vh-100 d-flex flex-column`}>

            {/* HEADER */}

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
                        onClick={sair}
                        className={css.botaoSairTopo}
                        title="Sair"
                    >
                        ↪
                    </button>

                </div>

            </header>


            {/* CONTEÚDO AZUL */}

            <main className={css.areaDashboard}>


                {/* MENU LATERAL */}

                <aside className={css.sidebar}>

                    <nav className={css.menu}>

                        <NavLink
                            to="/dashboardpaciente"
                            className={({ isActive }) =>
                                isActive
                                    ? `${css.itemMenu} ${css.ativo}`
                                    : css.itemMenu
                            }
                        >
                            <span>▦</span>
                            Dashboard
                        </NavLink>


                        <NavLink
                            to="/diariodehumor"
                            className={css.itemMenu}
                        >
                            <span>☷</span>
                            Diário
                        </NavLink>


                        <NavLink
                            to="/sessoes"
                            className={css.itemMenu}
                        >
                            <span>▣</span>
                            Sessões
                        </NavLink>


                        <NavLink
                            to="/marketplace"
                            className={css.itemMenu}
                        >
                            <span>♙</span>
                            Marketplace
                        </NavLink>

                    </nav>


                    <div className={css.menuInferior}>

                        <Link
                            to="/suporte"
                            className={css.itemMenu}
                        >
                            <span>?</span>
                            Suporte
                        </Link>

                        <button
                            className={css.sair}
                            onClick={sair}
                        >
                            <span>↪</span>
                            Sair
                        </button>

                    </div>

                </aside>


                {/* CARD PRINCIPAL */}

                <section className={css.dashboard}>

                    {/* BOAS-VINDAS */}

                    <div className={css.boasVindas}>

                        <div className={css.miniAvatar}>
                            <span>👩🏻</span>
                        </div>

                        <p>
                            Bom dia,{" "}
                            <strong>{primeiroNome}</strong>
                        </p>

                    </div>


                    <h1 className={css.pergunta}>
                        Como está hoje?
                    </h1>


                    {/* PRIMEIRA LINHA */}

                    <div className={css.primeiraLinha}>


                        {/* GRÁFICO */}

                        <div className={css.cardGrafico}>

                            <div className={css.tituloGrafico}>

                                <div>
                                    <h3>Evolução Semanal</h3>
                                    <p>Humor médio: Estável</p>
                                </div>

                                <span className={css.iconeGrafico}>
                                    ↗
                                </span>

                            </div>


                            <div className={css.grafico}>

                                <div className={css.barraArea}>
                                    <div
                                        className={css.barra}
                                        style={{ height: "30px" }}
                                    ></div>
                                    <span>S</span>
                                </div>

                                <div className={css.barraArea}>
                                    <div
                                        className={css.barra}
                                        style={{ height: "45px" }}
                                    ></div>
                                    <span>T</span>
                                </div>

                                <div className={css.barraArea}>
                                    <div
                                        className={css.barra}
                                        style={{ height: "25px" }}
                                    ></div>
                                    <span>Q</span>
                                </div>

                                <div className={css.barraArea}>
                                    <div
                                        className={`${css.barra} ${css.barraDestaque}`}
                                        style={{ height: "64px" }}
                                    ></div>
                                    <span>Q</span>
                                </div>

                                <div className={css.barraArea}>
                                    <div
                                        className={css.barra}
                                        style={{ height: "52px" }}
                                    ></div>
                                    <span>S</span>
                                </div>

                                <div className={css.barraArea}>
                                    <div
                                        className={css.barra}
                                        style={{ height: "40px" }}
                                    ></div>
                                    <span>S</span>
                                </div>

                                <div className={css.barraArea}>
                                    <div
                                        className={css.barra}
                                        style={{ height: "48px" }}
                                    ></div>
                                    <span>D</span>
                                </div>

                            </div>

                        </div>


                        {/* MEDITAÇÃO */}

                        <div className={css.areaRelaxar}>

                            <p className={css.relaxarTitulo}>
                                Para você relaxar
                            </p>

                            <div className={css.cardMeditacao}>

                                <div className={css.conteudoMeditacao}>
                                    <div className={css.tempo}>
                                        <span>MEDITAÇÃO</span>
                                        <small>10 min</small>
                                    </div>

                                    <h3 className={css.paz}>
                                        Paz Interior e Equilíbrio
                                    </h3>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* SEGUNDA LINHA */}

                    <div className={css.segundaLinha}>


                        {/* PRÓXIMA SESSÃO */}

                        <div className={css.proximaSessao}>

                            <div>

                                <span>
                                    PRÓXIMA SESSÃO
                                </span>

                                <h2>
                                    Amanhã, às 14:30
                                </h2>

                                <p>
                                    ♡ Com Dra. Andreia Silva
                                </p>

                            </div>

                            <div className={css.calendario}>
                                                            ▣
                            </div>

                        </div>


                        {/* CARDS PEQUENOS */}

                        <div className={css.cardsResumo}>

                            <div className={css.cardPequeno}>

                                <span className={css.iconeDica}>
                                    🧘
                                </span>

                                <h4>
                                    Dica de hoje
                                </h4>

                                <p>
                                    Pratique 5 min de respiração.
                                </p>

                            </div>


                            <div className={css.cardPequeno}>

                                <span className={css.check}>
                                    ✓
                                </span>

                                <div>

                                    <strong>
                                        12
                                    </strong>

                                    <p>
                                        Sessões concluídas este mês.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* NOTAS */}

                    <div className={css.areaNotas}>

                        <h2>
                            Notas Clínicas
                        </h2>

                        <textarea
                            value={nota}
                            onChange={(e) => setNota(e.target.value)}
                            placeholder="Adicione notas da sessão de hoje..."
                        ></textarea>

                        <button
                            onClick={salvarNota}
                            className={css.salvarNota}
                        >
                            Salvar Nota
                        </button>

                    </div>


                    {/* CHAT */}

                    <button className={css.chat}>
                        ≡
                    </button>

                </section>

            </main>


            <Footer />

        </div>
    );
}