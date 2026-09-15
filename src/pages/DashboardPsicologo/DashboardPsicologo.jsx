import { useUsuario } from "../../contexts/UsuarioContext.jsx";
import UserAvatar from "../../components/UserAvatar/UserAvatar.jsx";
import { useEffect, useState } from "react";
import api from "../../config/api.js";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import css from "./DashboardPsicologo.module.css";
import Footer from "../../components/Footer/Footer.jsx";
import Header from "../../components/Header/Header.jsx";
import { CalendarDays, Play } from "lucide-react";

export default function DashboardPsicologo() {

    const [consultas, setConsultas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    useEffect(() => {
        const controller = new AbortController();
        async function carregarConsultas() {
            try {
                const resposta = await fetch(`${api}/consultas/`, { credentials: "include", signal: controller.signal });
                const dados = await resposta.json();
                if (!resposta.ok) throw new Error(dados.error || "Erro ao carregar consultas.");
                setConsultas(dados.consultas || []);
            } catch (erro) {
                if (!controller.signal.aborted) setErro(erro.message);
            } finally {
                if (!controller.signal.aborted) setCarregando(false);
            }
        }
        carregarConsultas();
        return () => controller.abort();
    }, []);
    const consultasHoje = consultas.filter((consulta) => consulta.status !== "CANCELADO" && new Date(consulta.data_hora_inicio).toDateString() === new Date().toDateString());
    const pacientes = Array.from(new Map(consultas.map((consulta) => [consulta.paciente_id, { id_usuario: consulta.paciente_id, nome: consulta.paciente_nome }])).values());
    function iniciarConsulta(consulta) {
        try {
            const url = new URL(consulta.link_reuniao);
            if (!["https:", "http:"].includes(url.protocol)) throw new Error("Link invalido");
            window.open(url.href, "_blank", "noopener,noreferrer");
        } catch {
            toast.info("O link da consulta ainda n\u00e3o est\u00e1 dispon\u00edvel.");
        }
    }


    const { usuario } = useUsuario();
    const nomeCompleto = usuario?.nome?.trim() || "";
    const primeiroNome = nomeCompleto.split(" ")[0];

    return (
        <div className={`${css.pagina} min-vh-100 d-flex flex-column`}>

            <Header />


            {/* CONTEÚDO */}

            <main className={css.fundo}>

                <div className={css.container}>

                    {/* BOAS VINDAS */}

                    <section className={css.boasVindas}>

                        <h1>
                            Olá{primeiroNome ? `, ${primeiroNome}` : ""}
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
                                        <CalendarDays size={20} strokeWidth={1.8} aria-hidden="true" />
                                    </span>

                                    Agenda de Hoje
                                </h2>


                                <Link
                                    to="/agendaprofissional"
                                    className={css.verTodas}
                                >
                                    Ver todas
                                </Link>

                            </div>


                            {carregando && <p role="status">Carregando consultas...</p>}
                            {erro && <p role="alert">{erro}</p>}
                            {!carregando && !erro && !consultasHoje.length && <p>Nenhuma consulta para hoje.</p>}
                            {consultasHoje.map((consulta) => (
                                <div className={css.consulta} key={consulta.sessao_id}>
                                    <div className={css.horario}>
                                        <strong>{new Date(consulta.data_hora_inicio).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</strong>
                                    </div>
                                    <UserAvatar userId={consulta.paciente_id} nome={consulta.paciente_nome} className={css.fotoPaciente} />
                                    <div className={css.dadosConsulta}>
                                        <strong>{consulta.paciente_nome}</strong>
                                        <span>{consulta.status}</span>
                                    </div>
                                    <button className={css.botaoIniciar} onClick={() => iniciarConsulta(consulta)}>
                                        <Play size={16} strokeWidth={1.8} aria-hidden="true" /> Iniciar
                                    </button>
                                </div>
                            ))}
                        </div>

                    </section>


                    {/* PACIENTES */}

                    <section className={css.pacientes}>

                        <h2>
                            Pacientes
                        </h2>


                        <div className={css.listaPacientes}>
                            {pacientes.map((paciente) => (
                                <Link key={paciente.id_usuario} to={`/prontuario/${paciente.id_usuario}`} state={{ paciente }} className={css.paciente}>
                                    <UserAvatar userId={paciente.id_usuario} nome={paciente.nome} className={css.avatarPaciente} />
                                    <span>{paciente.nome}</span>
                                </Link>
                            ))}
                            {!carregando && !erro && !pacientes.length && <p>Nenhum paciente com consultas.</p>}
                        </div>

                    </section>

                </div>

            </main>


            <Footer />

        </div>
    );
}
