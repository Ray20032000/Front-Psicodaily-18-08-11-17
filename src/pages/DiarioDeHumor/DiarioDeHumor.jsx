import api from "../../config/api.js";
import { prepararRegistro, nomesHumor, nomesSono, nomesAlimentacao } from "../../utils/registros.js";
import { toast } from "sonner";
import { useUsuario } from "../../contexts/UsuarioContext.jsx";
import MoodIcon, { humores } from "../../components/MoodIcon/MoodIcon.jsx";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import css from "./DiarioDeHumor.module.css";
import Seletor from "../../components/Seletor/Seletor.jsx";
import { Activity, ChevronDown, Droplets, History, Moon, NotebookPen, Smile, UsersRound, Utensils } from "lucide-react";
import Alerts from "../../components/Alerts/Alerts.jsx";
import Skeleton, { Carregando } from "../../components/Skeleton/Skeleton.jsx";

const atividades = ["Caminhada", "Corrida", "Academia", "Ciclismo", "Yoga", "Outro"];

const classesHumor = {
    EXCELENTE: css.humorBom,
    BOM: css.humorBom,
    NEUTRO: css.humorNeutro,
    RUIM: css.humorRuim,
    PESSIMO: css.humorRuim,
};

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

        <div className={css.pagina}>


            {mensagem && (
                <Alerts
                    key={mensagem.id}
                    tipo={mensagem.tipo}
                    titulo={mensagem.titulo}
                    descricao={mensagem.texto}
                    onClose={() => setMensagem(null)}
                />
            )}


            {/* FORMULÁRIO */}

            <div className={css.formulario}>


                {/* HUMOR */}

                <section className={`${css.card} ${css.cardHumor}`}>

                    <div className={css.tituloCard}>
                        <div>
                            <h2>Humor do Dia</h2>
                            <p>Selecione uma opção</p>
                        </div>
                        <span className={css.iconeTile}>
                            <Smile size={18} strokeWidth={1.8} aria-hidden="true" />
                        </span>
                    </div>

                    <div className={css.opcoesHumor}>
                        {humores.map((item) => (
                            <button
                                key={item.nome}
                                type="button"
                                onClick={() => setHumor(item.nome)}
                                aria-pressed={humor === item.nome}
                                className={humor === item.nome ? `${css.humor} ${css.humorAtivo}` : css.humor}
                            >
                                <span className={css.rosto}>
                                    <MoodIcon humor={item.nome} size="1em" />
                                </span>
                                <span>{item.nome}</span>
                            </button>
                        ))}
                    </div>

                </section>


                {/* SONO + ALIMENTAÇÃO */}

                <div className={css.linhaCards}>

                    <section className={css.card}>

                        <div className={css.tituloCard}>
                            <div>
                                <h2>Sono</h2>
                                <p>Como você descansou</p>
                            </div>
                            <span className={css.iconeTile}>
                                <Moon size={18} strokeWidth={1.8} aria-hidden="true" />
                            </span>
                        </div>

                        <p className={css.numeroDestaque}>
                            {sono}h<small>dormidas</small>
                        </p>

                        <input
                            className={css.range}
                            type="range"
                            min="1"
                            max="12"
                            value={sono}
                            onChange={(e) => setSono(e.target.value)}
                            aria-label="Horas dormidas"
                        />

                        <p className={css.label}>Qualidade</p>

                        <div className={css.segmentado}>
                            {Object.values(nomesSono).map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    aria-pressed={qualidadeSono === item}
                                    onClick={() => setQualidadeSono(item)}
                                    className={qualidadeSono === item ? css.segmentoAtivo : ""}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>

                    </section>


                    <section className={css.card}>

                        <div className={css.tituloCard}>
                            <div>
                                <h2>Alimentação</h2>
                                <p>Refeições e hidratação</p>
                            </div>
                            <span className={css.iconeTile}>
                                <Utensils size={18} strokeWidth={1.8} aria-hidden="true" />
                            </span>
                        </div>

                        <label className={css.campo}>
                            Como foi sua alimentação?
                            <Seletor
                                value={alimentacao}
                                onChange={setAlimentacao}
                                opcoes={[{ valor: "", rotulo: "Não informado" }, ...Object.entries(nomesAlimentacao).map(([valor, rotulo]) => ({ valor, rotulo }))]}
                            />
                        </label>

                        <div className={css.refeicoes}>
                            {[
                                ["Café da manhã", cafe, setCafe],
                                ["Almoço", almoco, setAlmoco],
                                ["Jantar", jantar, setJantar],
                                ["Lanches", lanches, setLanches],
                            ].map(([nome, marcado, marcar]) => (
                                <label key={nome} className={marcado ? css.refeicaoAtiva : ""}>
                                    <input type="checkbox" checked={marcado} onChange={() => marcar(!marcado)} />
                                    {nome}
                                </label>
                            ))}
                        </div>

                        <label className={css.agua}>
                            <span>
                                <Droplets size={16} strokeWidth={1.8} aria-hidden="true" /> Bebeu água suficiente?
                            </span>
                            <input type="checkbox" checked={agua} onChange={() => setAgua(!agua)} />
                        </label>

                    </section>

                </div>


                {/* ATIVIDADE + SOCIALIZAÇÃO */}

                <div className={css.linhaCards}>

                    <section className={css.card}>

                        <div className={css.tituloCard}>
                            <div>
                                <h2>Atividade Física</h2>
                                <p>O que você praticou hoje</p>
                            </div>
                            <span className={css.iconeTile}>
                                <Activity size={18} strokeWidth={1.8} aria-hidden="true" />
                            </span>
                        </div>

                        <label className={css.campo}>
                            Tipo de atividade
                            <Seletor
                                value={atividade}
                                onChange={setAtividade}
                                opcoes={[{ valor: "", rotulo: "Nenhuma" }, ...atividades.map((nome) => ({ valor: nome, rotulo: nome }))]}
                            />
                        </label>

                        <label className={css.campo}>
                            Duração
                            <span className={css.duracao}>
                                <input
                                    type="number"
                                    min="0"
                                    value={duracao}
                                    onChange={(e) => setDuracao(e.target.value)}
                                    placeholder="0"
                                />
                                minutos
                            </span>
                        </label>

                    </section>


                    <section className={css.card}>

                        <div className={css.tituloCard}>
                            <div>
                                <h2>Socialização</h2>
                                <p>Com quem você interagiu hoje?</p>
                            </div>
                            <span className={css.iconeTile}>
                                <UsersRound size={18} strokeWidth={1.8} aria-hidden="true" />
                            </span>
                        </div>

                        <div className={css.pessoas}>
                            {pessoas.map((pessoa) => (
                                <button
                                    key={pessoa}
                                    type="button"
                                    aria-pressed={socializacao.includes(pessoa)}
                                    onClick={() => selecionarPessoa(pessoa)}
                                    className={socializacao.includes(pessoa) ? css.pessoaAtiva : ""}
                                >
                                    {pessoa}
                                </button>
                            ))}
                        </div>

                    </section>

                </div>


                {/* ANOTAÇÕES */}

                <section className={css.card}>

                    <div className={css.tituloCard}>
                        <div>
                            <h2>Anotações Livres</h2>
                            <p>Pensamentos e sentimentos do dia</p>
                        </div>
                        <span className={css.iconeTile}>
                            <NotebookPen size={18} strokeWidth={1.8} aria-hidden="true" />
                        </span>
                    </div>

                    <textarea
                        className={css.textarea}
                        value={anotacao}
                        onChange={(e) => setAnotacao(e.target.value)}
                        aria-label="Anotações livres"
                        placeholder="Como foi o seu dia? Quais pensamentos ou sentimentos você gostaria de registrar?"
                    />

                    <div className={css.botoes}>
                        <button type="button" className={css.descartar} disabled={salvando} onClick={limpar}>
                            Descartar
                        </button>
                        <button type="button" className={css.salvar} disabled={salvando || carregando} onClick={salvarRegistro}>
                            {salvando ? "Salvando..." : "Salvar Registro"}
                        </button>
                    </div>

                </section>

            </div>


            {/* HISTÓRICO */}

            <section className={`${css.card} ${css.historico}`} aria-label="Histórico do diário">

                <div className={css.tituloCard}>
                    <div>
                        <h2>Histórico do diário</h2>
                        <p>Seus registros mais recentes</p>
                    </div>
                    <span className={css.iconeTile}>
                        <History size={18} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                </div>

                {erroHistorico && (
                    <p role="alert" className={css.legenda}>
                        {erroHistorico}{" "}
                        <button className={css.pill} disabled={carregando} onClick={() => carregarHistorico(cursor)}>Tentar novamente</button>
                    </p>
                )}
                {!carregando && !erroHistorico && registros.length === 0 && (
                    <p className={css.legenda}>Nenhum registro salvo na sua conta.</p>
                )}

                <ul className={css.listaRegistros}>
                    {registros.map((registro) => {
                        const data = new Date(`${registro.criado_em?.slice(0, 10)}T12:00:00`);
                        const nomeHumor = nomesHumor[registro.humor];
                        return (
                            <li key={registro.registro_id}>
                                <details className={css.registro}>
                                    <summary>
                                        <span className={`${css.tileHumor} ${classesHumor[registro.humor] || ""}`}>
                                            <MoodIcon humor={nomeHumor} size={18} />
                                        </span>
                                        <span className={css.infoRegistro}>
                                            <strong>{nomeHumor}</strong>
                                            <small>
                                                {data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                                                {" · "}Sono {nomesSono[registro.qualidade_sono]?.toLowerCase()}
                                            </small>
                                        </span>
                                        <ChevronDown size={16} strokeWidth={1.8} className={css.seta} aria-hidden="true" />
                                    </summary>
                                    <div className={css.detalhesRegistro}>
                                        <p>
                                            Sono: {nomesSono[registro.qualidade_sono]}{registro.minutos_sono != null ? ` · ${registro.minutos_sono} minutos` : ""}
                                        </p>
                                        <p>
                                            Alimentação: {nomesAlimentacao[registro.alimentacao] || "Não informada"} · Exercício: {registro.exercicio_fisico ? "Sim" : "Não"}
                                        </p>
                                        {registro.anotacao && <p className={css.anotacaoRegistro}>{registro.anotacao}</p>}
                                    </div>
                                </details>
                            </li>
                        );
                    })}
                </ul>

                {carregando && (
                    <Carregando texto="Carregando registros..." className={css.listaRegistros}>
                        {[1, 2, 3, 4].map((item) => (
                            <div key={item} className={css.registroSkeleton}>
                                <Skeleton width="36px" height="36px" radius="10px" />
                                <div className={css.infoRegistro}>
                                    <Skeleton width="60px" height="12px" />
                                    <Skeleton width="130px" height="10px" className={css.skeletonLinha} />
                                </div>
                            </div>
                        ))}
                    </Carregando>
                )}

                {cursor && (
                    <button className={`${css.pill} ${css.carregarMais}`} disabled={carregando || salvando} onClick={() => carregarHistorico(cursor)}>
                        Carregar mais
                    </button>
                )}

            </section>

        </div>

    );
}
