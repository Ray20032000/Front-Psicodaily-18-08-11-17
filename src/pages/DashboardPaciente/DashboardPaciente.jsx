import { toast } from "sonner";
import { useUsuario } from "../../contexts/UsuarioContext.jsx";
import UserAvatar from "../../components/UserAvatar/UserAvatar.jsx";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../config/api.js";
import css from "./DashboardPaciente.module.css";
import Footer from "../../components/Footer/Footer.jsx";
import styles from "../Home/Home.module.css";
import Header from "../../components/Header/Header.jsx";
import Alerts from "../../components/Alerts/Alerts.jsx";
import Sidebar from "../../components/Sidebar/Sidebar.jsx";
import { Brain, CalendarDays, CheckCircle2, Heart, MessageCircle, TrendingUp } from "lucide-react";

export default function DashboardPaciente() {

    const navigate = useNavigate();
    const { sair: encerrarSessao } = useUsuario();

    const { usuario } = useUsuario();
    const nomeCompleto = usuario?.nome?.trim() || "";
    const primeiroNome = nomeCompleto.split(" ")[0];
    const [proximaSessao, setProximaSessao] = useState(null);
    const [carregandoSessao, setCarregandoSessao] = useState(true);
    const [erroSessao, setErroSessao] = useState("");

    useEffect(() => {
        const controller = new AbortController();
        async function carregarSessao() {
            try {
                const resposta = await fetch(`${api}/consultas/`, { credentials: "include", signal: controller.signal });
                if (!resposta.ok) throw new Error("Não foi possível carregar a próxima sessão.");
                const dados = await resposta.json();
                const futuras = (dados.consultas || [])
                    .filter((sessao) => sessao.status !== "CANCELADO" && new Date(sessao.data_hora_inicio) > new Date())
                    .sort((a, b) => new Date(a.data_hora_inicio) - new Date(b.data_hora_inicio));
                if (!controller.signal.aborted) setProximaSessao(futuras[0] || null);
            } catch (erro) {
                if (!controller.signal.aborted) setErroSessao(erro.message);
            } finally {
                if (!controller.signal.aborted) setCarregandoSessao(false);
            }
        }
        carregarSessao();
        return () => controller.abort();
    }, [usuario?.id_usuario]);

    const [nota, setNota] = useState("");
    const [mensagem, setMensagem] = useState(null);

    function mostrarMensagem(texto, tipo = "erro", titulo) {
        setMensagem({
            id: Date.now(),
            texto,
            tipo,
            titulo
        });
    }

    async function sair() {
        try {
            await encerrarSessao();
            navigate("/login");
        } catch {
            toast.error("Falha ao sair. Tente novamente.");
        }
    }

    function salvarNota() {
        const textoNota = nota.trim();

        if (!textoNota) {
            mostrarMensagem("Digite uma nota antes de salvar", "erro", "Nota vazia");
            return;
        }

        try {
            const notasSalvas = JSON.parse(localStorage.getItem("psicodaily:notasClinicas") || "[]");

            localStorage.setItem(
                "psicodaily:notasClinicas",
                JSON.stringify([
                    ...notasSalvas,
                    {
                        texto: textoNota,
                        criadaEm: new Date().toISOString()
                    }
                ])
            );

            mostrarMensagem("Nota salva neste navegador.", "sucesso", "Nota salva");
            setNota("");
        } catch {
            mostrarMensagem(
                "Nao foi possivel salvar a nota neste navegador.",
                "erro",
                "Falha ao salvar"
            );
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


            {/* CONTEÚDO AZUL */}

            <main className={css.areaDashboard}>


                {/* MENU LATERAL */}

                <Sidebar />


                {/* CARD PRINCIPAL */}

                <section className={css.dashboard}>

                    {/* BOAS-VINDAS */}

                    <div className={css.boasVindas}>

                        <div className={css.miniAvatar}>
                            <UserAvatar currentUser />
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
                                    <TrendingUp size={18} strokeWidth={1.8} aria-hidden="true" />
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
                                    {carregandoSessao ? "Carregando..." : erroSessao || (proximaSessao
                                        ? new Date(proximaSessao.data_hora_inicio).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
                                        : "Nenhuma sessão agendada")}
                                </h2>

                                <p>
                                    {proximaSessao && <><Heart size={15} strokeWidth={1.8} aria-hidden="true" /> Com {proximaSessao.profissional_nome || "profissional"}</>}
                                </p>

                            </div>

                            <div className={css.calendario}>
                                <CalendarDays size={24} strokeWidth={1.8} aria-hidden="true" />
                            </div>

                        </div>


                        {/* CARDS PEQUENOS */}

                        <div className={css.cardsResumo}>

                            <div className={css.cardPequeno}>

                                <span className={css.iconeDica}>
                                    <Brain size={24} strokeWidth={1.8} aria-hidden="true" />
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
                                    <CheckCircle2 size={24} strokeWidth={1.8} aria-hidden="true" />
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

                    <button className={css.chat} type="button" aria-label="Abrir chat">
                        <MessageCircle size={20} strokeWidth={1.8} aria-hidden="true" />
                    </button>

                </section>

            </main>


            <Footer />

        </div>
    );
}
