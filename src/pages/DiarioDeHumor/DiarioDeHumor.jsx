import api from "../../config/api.js";
import { prepararRegistro, nomesHumor, nomesSono, nomesAlimentacao } from "../../utils/registros.js";
import { toast } from "sonner";
import { useUsuario } from "../../contexts/UsuarioContext.jsx";
import MoodIcon, { humores } from "../../components/MoodIcon/MoodIcon.jsx";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import css from "./DiarioDeHumor.module.css";
import Footer from "../../components/Footer/Footer.jsx";
import Header from "../../components/Header/Header.jsx";
import Sidebar from "../../components/Sidebar/Sidebar.jsx";
import { Activity, Droplets, Moon, NotebookPen, Smile, UsersRound, Utensils } from "lucide-react";
import Alerts from "../../components/Alerts/Alerts.jsx";

export default function Diario() {

    const navigate = useNavigate();
    const { sair: encerrarSessao } = useUsuario();

    const [alimentacao, setAlimentacao] = useState("");
    const [registros, setRegistros] = useState([]);
    const [cursor, setCursor] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erroHistorico, setErroHistorico] = useState("");
    const [salvando, setSalvando] = useState(false);
    const envioEmCurso = useRef(false);
    const historicoEmCurso = useRef(false);
    const montado = useRef(false);
    useEffect(() => {
        montado.current = true;
        carregarHistorico();
        return () => { montado.current = false; };
    }, []);

    async function carregarHistorico(antes = null) {
        if (historicoEmCurso.current) return;
        historicoEmCurso.current = true;
        setCarregando(true);
        setErroHistorico("");
        try {
            const resposta = await fetch(`${api}/registros/${antes ? `?antes=${antes}` : ""}`, { credentials: "include" });
            if (!resposta.ok) throw new Error("Falha ao carregar o hist\u00f3rico.");
            const dados = await resposta.json();
            if (!montado.current) return;
            setRegistros((atuais) => antes ? [...atuais, ...dados.registros] : dados.registros);
            setCursor(dados.proximo_cursor);
        } catch (erro) {
            if (montado.current) setErroHistorico(erro.message);
        } finally {
            historicoEmCurso.current = false;
            if (montado.current) setCarregando(false);
        }
    }

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

        if (pessoa === "Ninguém") {
            setSocializacao(socializacao.includes(pessoa) ? [] : [pessoa]);
            return;
        }

        if (socializacao.includes(pessoa)) {

            setSocializacao(
                socializacao.filter(item => item !== pessoa)
            );

        } else {

            setSocializacao([
                ...socializacao.filter((item) => item !== "Ninguém"),
                pessoa
            ]);

        }
    }


    function limpar() {
        setAlimentacao("");

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


    async function salvarRegistro() {
        if (envioEmCurso.current) return;
        envioEmCurso.current = true;
        setSalvando(true);
        try {
            const registro = prepararRegistro({ humor, sono, qualidadeSono, alimentacao, cafe, almoco, jantar, lanches, agua, atividade, duracao, socializacao, anotacao });
            const resposta = await fetch(`${api}/registros/`, {
                method: "POST", credentials: "include",
                headers: { "Content-Type": "application/json" }, body: JSON.stringify(registro),
            });
            const dados = await resposta.json();
            if (!resposta.ok) throw new Error(dados.error || "Falha ao salvar registro.");
            if (!montado.current) return;
            setRegistros((atuais) => [dados.registro, ...atuais]);
            mostrarMensagem("Registro salvo na sua conta.", "sucesso", "Registro salvo");
        } catch (erro) {
            if (montado.current) mostrarMensagem(erro.message || "Falha ao salvar registro.", "erro", "Falha ao salvar");
        } finally {
            envioEmCurso.current = false;
            if (montado.current) setSalvando(false);
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

                                {Object.values(nomesSono).map((item) => (

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
                                    Como foi sua alimentação?
                                    <select value={alimentacao} onChange={(event) => setAlimentacao(event.target.value)}>
                                        <option value="">Não informado</option>
                                        {Object.entries(nomesAlimentacao).map(([valor, nome]) => <option key={valor} value={valor}>{nome}</option>)}
                                    </select>
                                </label>


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
                                disabled={salvando}
                                onClick={limpar}
                            >
                                Descartar
                            </button>


                            <button
                                className={css.salvar}
                                disabled={salvando || carregando}
                                onClick={salvarRegistro}
                            >
                                {salvando ? "Salvando..." : "Salvar Registro"}
                            </button>

                        </div>

                    </div>

                    <section className={css.anotacoes} aria-label="Histórico do diário">
                        <h2>Histórico do diário</h2>
                        {carregando && <p role="status">Carregando registros...</p>}
                        {erroHistorico && <p role="alert">{erroHistorico} <button disabled={carregando} onClick={() => carregarHistorico(cursor)}>Tentar novamente</button></p>}
                        {!carregando && !erroHistorico && registros.length === 0 && <p>Nenhum registro salvo na sua conta.</p>}
                        {registros.map((registro) => (
                            <article key={registro.registro_id} className={css.card}>
                                <h3>{registro.criado_em?.split("-").reverse().join("/")} — {nomesHumor[registro.humor]}</h3>
                                <p>Sono: {nomesSono[registro.qualidade_sono]}{registro.minutos_sono != null ? ` · ${registro.minutos_sono} minutos` : ""}</p>
                                <p>Alimentação: {nomesAlimentacao[registro.alimentacao] || "Não informada"} · Exercício: {registro.exercicio_fisico ? "Sim" : "Não"}</p>
                                <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{registro.anotacao}</p>
                            </article>
                        ))}
                        {cursor && <button disabled={carregando || salvando} onClick={() => carregarHistorico(cursor)}>Carregar mais</button>}
                    </section>
                </section>

            </main>


            <Footer />

        </div>

    );
}
