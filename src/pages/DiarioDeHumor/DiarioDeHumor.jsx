import { toast } from "sonner";
import { useUsuario } from "../../contexts/UsuarioContext.jsx";
import MoodIcon, { humores } from "../../components/MoodIcon/MoodIcon.jsx";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import css from "./DiarioDeHumor.module.css";
import Footer from "../../components/Footer/Footer.jsx";
import Header from "../../components/Header/Header.jsx";
import Sidebar from "../../components/Sidebar/Sidebar.jsx";
import { Activity, Droplets, Moon, NotebookPen, Smile, UsersRound, Utensils } from "lucide-react";
import Alerts from "../../components/Alerts/Alerts.jsx";

export default function Diario() {

    const navigate = useNavigate();
    const { sair: encerrarSessao } = useUsuario();

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
    const [mensagem, setMensagem] = useState(null);

    function mostrarMensagem(texto, tipo = "erro", titulo) {
        setMensagem({
            id: Date.now(),
            texto,
            tipo,
            titulo
        });
    }


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

        try {
            const registrosSalvos = JSON.parse(localStorage.getItem("psicodaily:diarioHumor") || "[]");

            localStorage.setItem(
                "psicodaily:diarioHumor",
                JSON.stringify([
                    ...registrosSalvos,
                    {
                        ...registro,
                        criadoEm: new Date().toISOString()
                    }
                ])
            );

            mostrarMensagem("Registro salvo neste navegador.", "sucesso", "Registro salvo");
        } catch {
            mostrarMensagem(
                "Nao foi possivel salvar o registro neste navegador.",
                "erro",
                "Falha ao salvar"
            );
        }
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

        <div className={`${css.pagina} min-vh-100 d-flex flex-column`}>


            <Header />

            {mensagem && (
                <Alerts
                    key={mensagem.id}
                    tipo={mensagem.tipo}
                    titulo={mensagem.titulo}
                    descricao={mensagem.texto}
                    onClose={() => setMensagem(null)}
                />
            )}


            {/* CONTEÚDO */}

            <main className={css.areaDiario}>


                {/* SIDEBAR */}

                <Sidebar />


                {/* CARD PRINCIPAL */}

                <section className={css.diario}>


                    {/* HUMOR */}

                    <div className={css.cardHumor}>

                        <div className={css.tituloHumor}>

                            <h2>
                                <Smile size={22} strokeWidth={1.8} aria-hidden="true" />
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
                                    aria-pressed={humor === item.nome}
                                    className={
                                        humor === item.nome
                                            ? `${css.humor} ${css.humorAtivo}`
                                            : css.humor
                                    }
                                >

                                    <span className={css.rosto}>
                                        <MoodIcon humor={item.nome} size="1em" />
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
                                <Moon size={18} strokeWidth={1.8} aria-hidden="true" />
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
                                <Utensils size={18} strokeWidth={1.8} aria-hidden="true" />
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
                                    <Droplets size={18} strokeWidth={1.8} aria-hidden="true" /> Bebeu água suficiente?
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
                                <Activity size={18} strokeWidth={1.8} aria-hidden="true" />
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
                                <UsersRound size={18} strokeWidth={1.8} aria-hidden="true" />
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
                            <NotebookPen size={18} strokeWidth={1.8} aria-hidden="true" />
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
