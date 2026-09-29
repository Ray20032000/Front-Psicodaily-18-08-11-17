import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import css from "./Sessoes.module.css";
import Footer from "../../components/Footer/Footer.jsx";
import Header from "../../components/Header/Header.jsx";
import Sidebar from "../../components/Sidebar/Sidebar.jsx";
import api from "../../config/api.js";

export default function Sessoes() {
    const navigate = useNavigate();
    const [sessoes, setSessoes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        carregarSessoes();
    }, []);

    async function carregarSessoes() {
        setCarregando(true);
        setErro("");
        try {
            const resposta = await fetch(`${api}/consultas/`, { credentials: "include" });
            const retorno = await resposta.json();
            if (!resposta.ok) throw new Error(retorno.error || "Não foi possível carregar suas sessões.");
            setSessoes(retorno.consultas || []);
        } catch (erro) {
            setErro(erro.message || "Não foi possível conectar ao servidor.");
        } finally {
            setCarregando(false);
        }
    }

    function formatarInicio(valor) {
        const data = new Date(valor);
        return {
            dia: data.toLocaleDateString("pt-BR", { weekday: "long" }),
            data: data.toLocaleDateString("pt-BR"),
            horario: data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            hoje: data.toDateString() === new Date().toDateString(),
            anterior: data < new Date()
        };
    }

    return (
        <div className={`${css.pagina} min-vh-100 d-flex flex-column`}>
            <Header />
            <main className={css.areaSessoes}>
                <Sidebar />
                <section className={css.conteudo}>
                    <div className={css.cardSessoes}>
                        <div className={css.listaSessoes}>
                            {carregando && <p role="status">Carregando sessões...</p>}
                            {!carregando && erro && (
                                <div role="alert">
                                    <p>{erro}</p>
                                    <button type="button" className={css.entrar} onClick={carregarSessoes}>Tentar novamente</button>
                                </div>
                            )}
                            {!carregando && !erro && sessoes.length === 0 && (
                                <p>Você ainda não tem sessões agendadas. Escolha um profissional para começar.</p>
                            )}
                            {!carregando && !erro && sessoes.map((sessao) => {
                                const inicio = formatarInicio(sessao.data_hora_inicio);
                                const cancelada = sessao.status === "CANCELADO";
                                const sessaoHoje = inicio.hoje && !cancelada;
                                const inicioSessao = new Date(sessao.data_hora_inicio);
                                const fimSessao = new Date(sessao.data_hora_fim);
                                const agora = new Date();
                                const podeEntrar = !cancelada && agora >= new Date(inicioSessao.getTime() - 15 * 60 * 1000) && agora <= fimSessao;
                                const titulo = cancelada ? "Sessão cancelada" : inicio.hoje ? "Sessão hoje" : inicio.anterior ? "Sessão anterior" : "Sessão marcada";
                                return (
                                    <div key={sessao.sessao_id} className={sessaoHoje ? `${css.cardSessao} ${css.sessaoHoje}` : css.cardSessao}>
                                        <div className={css.informacoes}>
                                            <h2>{titulo}</h2>
                                            <p>{inicio.dia} {inicio.data}</p>
                                            <p>{inicio.horario}</p>
                                            <p>{sessao.profissional_nome}</p>
                                            {sessao.ultimo_humor && <p>Humor mais recente: {sessao.ultimo_humor}</p>}
                                        </div>
                                        {podeEntrar && (
                                            <Link to={`/videochamada/${sessao.sessao_id}`} target="_blank" rel="noopener noreferrer" className={css.entrar}>Entrar na videochamada</Link>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <button type="button" className={css.marcarSessao} onClick={() => navigate("/profissionais")}>
                            <span>Marcar Sessão</span>
                            <Plus size={22} strokeWidth={1.8} aria-hidden="true" />
                        </button>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
