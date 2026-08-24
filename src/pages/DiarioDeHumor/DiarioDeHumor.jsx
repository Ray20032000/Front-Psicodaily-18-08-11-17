import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import css from "./DiarioDeHumor.module.css";
import Footer from "../../components/Footer/Footer.jsx";
import Header from "../../components/Header/Header.jsx";

export default function Diario() {

    const navigate = useNavigate();

    const [humor, setHumor] = useState("Neutro");
    const [sono, setSono] = useState(7);
    const [qualidadeSono, setQualidadeSono] = useState("Média");

    const [cafe, setCafe] = useState(false);
    const [almoco, setAlmoco] = useState(false);
    const [jantar, setJantar] = useState(false);
    const [lanches, setLanches] = useState(false);
    const [agua, setAgua] = useState(false);

    const [atividade, setAtividade] = useState("");
    const [duracao, setDuracao] = useState("");

    const [socializacao, setSocializacao] = useState([]);

    const [anotacao, setAnotacao] = useState("");

    const humores = [
        {
            nome: "Muito Mal",
            icone: "☹"
        },
        {
            nome: "Mal",
            icone: "☹"
        },
        {
            nome: "Neutro",
            icone: "😐"
        },
        {
            nome: "Bem",
            icone: "☺"
        },
        {
            nome: "Muito Bem",
            icone: "😁"
        }
    ];

    const pessoas = [
        "Família",
        "Amigos",
        "Trabalho",
        "Parceiro(a)",
        "Ninguém"
    ];


    function selecionarPessoa(pessoa) {

        if (socializacao.includes(pessoa)) {

            setSocializacao(
                socializacao.filter(item => item !== pessoa)
            );

        } else {

            setSocializacao([
                ...socializacao,
                pessoa
            ]);

        }
    }


    function limpar() {

        setHumor("Neutro");

        setSono(7);

        setQualidadeSono("Média");

        setCafe(false);
        setAlmoco(false);
        setJantar(false);
        setLanches(false);
        setAgua(false);

        setAtividade("");
        setDuracao("");

        setSocializacao([]);

        setAnotacao("");
    }


    function salvarRegistro() {

        const registro = {
            humor,
            sono,
            qualidadeSono,
            cafe,
            almoco,
            jantar,
            lanches,
            agua,
            atividade,
            duracao,
            socializacao,
            anotacao
        };

        console.log(registro);

        alert("Registro salvo com sucesso!");
    }


    function sair() {

        localStorage.clear();

        navigate("/login");
    }


    return (

        <div className={`${css.pagina} min-vh-100 d-flex flex-column`}>


            <Header />


            {/* CONTEÚDO */}

            <main className={css.areaDiario}>


                {/* SIDEBAR */}

                <aside className={css.sidebar}>

                    <nav className={css.menu}>

                        <NavLink
                            to="/dashboardpaciente"
                            className={css.itemMenu}
                        >
                            <span>▦</span>
                            Dashboard
                        </NavLink>


                        <NavLink
                            to="/diariodehumor"
                            className={({ isActive }) =>
                                isActive
                                    ? `${css.itemMenu} ${css.ativo}`
                                    : css.itemMenu
                            }
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

                        <button className={css.novaAnotacao}>
                            <span>＋</span>
                            Nova Anotação
                        </button>


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

                <section className={css.diario}>


                    {/* HUMOR */}

                    <div className={css.cardHumor}>

                        <div className={css.tituloHumor}>

                            <h2>
                                <span>☺</span>
                                Humor do Dia
                            </h2>

                            <p>
                                Selecione uma opção
                            </p>

                        </div>


                        <div className={css.opcoesHumor}>

                            {humores.map((item) => (

                                <button
                                    key={item.nome}
                                    onClick={() => setHumor(item.nome)}
                                    className={
                                        humor === item.nome
                                            ? `${css.humor} ${css.humorAtivo}`
                                            : css.humor
                                    }
                                >

                                    <span className={css.rosto}>
                                        {item.icone}
                                    </span>

                                    <span>
                                        {item.nome}
                                    </span>

                                </button>

                            ))}

                        </div>

                    </div>


                    {/* SONO + ALIMENTAÇÃO */}

                    <div className={css.linhaCards}>


                        {/* SONO */}

                        <div className={css.card}>

                            <h2>
                                <span>☾</span>
                                Sono
                            </h2>


                            <p className={css.label}>
                                Horas dormidas
                            </p>


                            <div className={css.areaRange}>

                                <input
                                    type="range"
                                    min="1"
                                    max="12"
                                    value={sono}
                                    onChange={(e) => setSono(e.target.value)}
                                />

                                <strong>
                                    {sono}h
                                </strong>

                            </div>


                            <p className={css.label}>
                                Qualidade
                            </p>


                            <div className={css.qualidade}>

                                {["Ruim", "Média", "Boa"].map((item) => (

                                    <button
                                        key={item}
                                        onClick={() => setQualidadeSono(item)}
                                        className={
                                            qualidadeSono === item
                                                ? css.qualidadeAtiva
                                                : ""
                                        }
                                    >
                                        {item}
                                    </button>

                                ))}

                            </div>

                        </div>


                        {/* ALIMENTAÇÃO */}

                        <div className={css.card}>

                            <h2>
                                <span>🍴</span>
                                Alimentação
                            </h2>


                            <div className={css.alimentacao}>


                                <label>
                                    <input
                                        type="checkbox"
                                        checked={cafe}
                                        onChange={() => setCafe(!cafe)}
                                    />
                                    Café da manhã
                                </label>


                                <label>
                                    <input
                                        type="checkbox"
                                        checked={almoco}
                                        onChange={() => setAlmoco(!almoco)}
                                    />
                                    Almoço
                                </label>


                                <label>
                                    <input
                                        type="checkbox"
                                        checked={jantar}
                                        onChange={() => setJantar(!jantar)}
                                    />
                                    Jantar
                                </label>


                                <label>
                                    <input
                                        type="checkbox"
                                        checked={lanches}
                                        onChange={() => setLanches(!lanches)}
                                    />
                                    Lanches
                                </label>

                            </div>


                            <label className={css.agua}>

                                <span>
                                    ♧ Bebeu água suficiente?
                                </span>

                                <input
                                    type="checkbox"
                                    checked={agua}
                                    onChange={() => setAgua(!agua)}
                                />

                            </label>

                        </div>

                    </div>


                    {/* ATIVIDADE + SOCIALIZAÇÃO */}

                    <div className={css.linhaCards}>


                        {/* ATIVIDADE */}

                        <div className={css.card}>

                            <h2>
                                <span>⚒</span>
                                Atividade Física
                            </h2>


                            <select
                                value={atividade}
                                onChange={(e) =>
                                    setAtividade(e.target.value)
                                }
                            >

                                <option value="">
                                    Tipo de atividade...
                                </option>

                                <option value="Caminhada">
                                    Caminhada
                                </option>

                                <option value="Corrida">
                                    Corrida
                                </option>

                                <option value="Academia">
                                    Academia
                                </option>

                                <option value="Ciclismo">
                                    Ciclismo
                                </option>

                                <option value="Yoga">
                                    Yoga
                                </option>

                                <option value="Outro">
                                    Outro
                                </option>

                            </select>


                            <div className={css.duracao}>

                                <span>
                                    Duração:
                                </span>

                                <input
                                    type="number"
                                    value={duracao}
                                    onChange={(e) =>
                                        setDuracao(e.target.value)
                                    }
                                    placeholder="min"
                                />

                                <span>
                                    minutos
                                </span>

                            </div>

                        </div>


                        {/* SOCIALIZAÇÃO */}

                        <div className={css.card}>

                            <h2>
                                <span>♟</span>
                                Socialização
                            </h2>


                            <p className={css.label}>
                                Com quem você interagiu hoje?
                            </p>


                            <div className={css.pessoas}>

                                {pessoas.map((pessoa) => (

                                    <button
                                        key={pessoa}
                                        onClick={() =>
                                            selecionarPessoa(pessoa)
                                        }
                                        className={
                                            socializacao.includes(pessoa)
                                                ? css.pessoaAtiva
                                                : ""
                                        }
                                    >
                                        {pessoa}
                                    </button>

                                ))}

                            </div>

                        </div>

                    </div>


                    {/* ANOTAÇÕES */}

                    <div className={css.anotacoes}>

                        <h2>
                            <span>☰</span>
                            Anotações Livres
                        </h2>


                        <textarea
                            value={anotacao}
                            onChange={(e) =>
                                setAnotacao(e.target.value)
                            }
                            placeholder="Como foi o seu dia? Quais pensamentos ou sentimentos você gostaria de registrar?"
                        />


                        <div className={css.botoes}>

                            <button
                                className={css.descartar}
                                onClick={limpar}
                            >
                                Descartar
                            </button>


                            <button
                                className={css.salvar}
                                onClick={salvarRegistro}
                            >
                                Salvar Registro
                            </button>

                        </div>

                    </div>

                </section>

            </main>


            <Footer />

        </div>

    );
}