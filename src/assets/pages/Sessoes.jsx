import { Link, NavLink, useNavigate } from "react-router-dom";
import css from "../styles/Sessoes.module.css";
import Footer from "../components/Footer/Footer.jsx";

export default function Sessoes() {

    const navigate = useNavigate();

    const sessoes = [
        {
            id: 1,
            titulo: "Sessão Hoje",
            dia: "Segunda-feira",
            data: "",
            horario: "16:00",
            profissional: "Dra. Andreia Silva",
            hoje: true
        },

        {
            id: 2,
            titulo: "Sessão Marcada",
            dia: "Sábado",
            data: "07/08/26",
            horario: "17:00",
            profissional: "Dra. Andreia Silva"
        },

        {
            id: 3,
            titulo: "Sessão Marcada",
            dia: "Segunda-feira",
            data: "17/08/26",
            horario: "18:00",
            profissional: "Dra. Andreia Silva"
        },

        {
            id: 4,
            titulo: "Sessão Marcada",
            dia: "Quarta-feira",
            data: "26/08/26",
            horario: "10:00",
            profissional: "Dra. Andreia Silva"
        },

        {
            id: 5,
            titulo: "Sessão Marcada",
            dia: "Quarta-feira",
            data: "02/09/26",
            horario: "09:00",
            profissional: "Dra. Andreia Silva"
        },

        {
            id: 6,
            titulo: "Sessão Marcada",
            dia: "Terça-feira",
            data: "18/08/26",
            horario: "11:00",
            profissional: "Dra. Andreia Silva"
        }
    ];


    function sair() {
        localStorage.clear();
        navigate("/login");
    }


    function entrarSessao() {
        navigate("/Videochamada");
    }


    function marcarSessao() {
        navigate("/Marketplace");
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
                    >
                        ↪
                    </button>

                </div>

            </header>


            {/* ÁREA PRINCIPAL */}

            <main className={css.areaSessoes}>


                {/* SIDEBAR */}

                <aside className={css.sidebar}>

                    <nav className={css.menu}>

                        <NavLink
                            to="/Dashboardpaciente"
                            className={css.itemMenu}
                        >
                            <span>▦</span>
                            Dashboard
                        </NavLink>


                        <NavLink
                            to="/Diario"
                            className={css.itemMenu}
                        >
                            <span>☷</span>
                            Diário
                        </NavLink>


                        <NavLink
                            to="/Sessoes"
                            className={({ isActive }) =>
                                isActive
                                    ? `${css.itemMenu} ${css.ativo}`
                                    : css.itemMenu
                            }
                        >
                            <span>▣</span>
                            Sessões
                        </NavLink>


                        <NavLink
                            to="/Marketplace"
                            className={css.itemMenu}
                        >
                            <span>♙</span>
                            Marketplace
                        </NavLink>

                    </nav>


                    <div className={css.menuInferior}>

                        <Link
                            to="/Suporte"
                            className={css.itemMenu}
                        >
                            <span>?</span>
                            Suporte
                        </Link>


                        <button
                            onClick={sair}
                            className={css.sair}
                        >
                            <span>↪</span>
                            Sair
                        </button>

                    </div>

                </aside>


                {/* CONTEÚDO DAS SESSÕES */}

                <section className={css.conteudo}>

                    <div className={css.cardSessoes}>

                        <div className={css.listaSessoes}>

                            {sessoes.map((sessao) => (

                                <div
                                    key={sessao.id}
                                    className={
                                        sessao.hoje
                                            ? `${css.cardSessao} ${css.sessaoHoje}`
                                            : css.cardSessao
                                    }
                                >

                                    <div className={css.informacoes}>

                                        <h2>
                                            {sessao.titulo}
                                        </h2>

                                        <p>
                                            {sessao.dia}
                                            {sessao.data && ` ${sessao.data}`}
                                        </p>

                                        <p>
                                            {sessao.horario}
                                        </p>

                                        <p>
                                            {sessao.profissional}
                                        </p>

                                    </div>


                                    {sessao.hoje && (

                                        <button
                                            className={css.entrar}
                                            onClick={entrarSessao}
                                        >
                                            Entrar agora
                                        </button>

                                    )}

                                </div>

                            ))}

                        </div>


                        <button
                            className={css.marcarSessao}
                            onClick={marcarSessao}
                        >

                            <span>
                                Marcar Sessão
                            </span>

                            <strong>
                                +
                            </strong>

                        </button>

                    </div>

                </section>

            </main>


            <Footer />

        </div>

    );
}