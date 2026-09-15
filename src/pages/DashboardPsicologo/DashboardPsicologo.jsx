import { useUsuario } from "../../contexts/UsuarioContext.jsx";
import UserAvatar from "../../components/UserAvatar/UserAvatar.jsx";
import useConsultas from "../../hooks/useConsultas.js";
import { consultaAberta, dataConsulta, horarioConsulta, linkConsulta, resumoMensal, statusConsulta } from "../../utils/consultas.js";
import { formatarCentavos } from "../../utils/dinheiro.js";
import { Link } from "react-router-dom";
import css from "./DashboardPsicologo.module.css";
import Footer from "../../components/Footer/Footer.jsx";
import Header from "../../components/Header/Header.jsx";
import { CalendarDays, Play } from "lucide-react";

export default function DashboardPsicologo() {

    const { consultas, carregando, erro, recarregar } = useConsultas();
    const hoje = new Date();
    const resumo = resumoMensal(consultas, hoje);
    const pronto = !carregando && !erro;
    const consultasHoje = consultas.filter((consulta) => consulta.status !== "CANCELADO" && dataConsulta(consulta.data_hora_inicio) === dataConsulta(hoje));
    const pacientes = Array.from(new Map(consultas.filter((consulta) => consulta.status !== "CANCELADO")
        .map((consulta) => [consulta.paciente_id, { id_usuario: consulta.paciente_id, nome: consulta.paciente_nome }])).values())
        .sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));


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
                            {hoje.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                        </p>

                    </section>


                    {carregando && <p role="status">Carregando consultas...</p>}
                    {erro && <p role="alert">{erro} <button onClick={recarregar}>Tentar novamente</button></p>}
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
                                    {pronto ? formatarCentavos(resumo.previsto) : "—"}
                                </strong>

                                {pronto && resumo.variacao !== null && <span title="Em relação ao mês anterior" style={{ color: resumo.variacao < 0 ? "#b23b3b" : undefined }}>
                                    {resumo.variacao > 0 ? "+" : ""}{resumo.variacao.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
                                </span>}

                            </div>


                            <div className={css.divisor}></div>


                            <div className={css.resumoInferior}>

                                <div>
                                    <span>
                                        Em sessões agendadas
                                    </span>

                                    <strong>
                                        {pronto ? formatarCentavos(resumo.emAberto) : "—"}
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Sessões
                                    </span>

                                    <strong>
                                        {pronto ? resumo.sessoes : "—"}
                                    </strong>
                                </div>

                            </div>
                            <p className={css.textoMenor}>Previsão das sessões do mês, exceto canceladas. Não representa pagamentos confirmados.</p>
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


                            {!carregando && !erro && !consultasHoje.length && <p>Nenhuma consulta para hoje.</p>}
                            {pronto && consultasHoje.map((consulta) => (
                                <div className={css.consulta} key={consulta.sessao_id}>
                                    <div className={css.horario}>
                                        <strong>{horarioConsulta(consulta.data_hora_inicio)}</strong>
                                    </div>
                                    <UserAvatar userId={consulta.paciente_id} nome={consulta.paciente_nome} className={css.fotoPaciente} />
                                    <div className={css.dadosConsulta}>
                                        <strong>{consulta.paciente_nome}</strong>
                                        <span>{statusConsulta[consulta.status] || consulta.status}</span>
                                    </div>
                                    {linkConsulta(consulta) ? <a className={css.botaoIniciar} href={linkConsulta(consulta)} target="_blank" rel="noopener noreferrer">
                                        <Play size={16} strokeWidth={1.8} aria-hidden="true" /> Iniciar
                                    </a> : <Link className={css.botaoIniciar} to="/agendaprofissional" state={{ sessaoId: consulta.sessao_id }}>
                                        {consultaAberta(consulta) ? "Gerenciar" : "Detalhes"}
                                    </Link>}
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
                            {pronto && pacientes.map((paciente) => (
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
