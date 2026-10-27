import { useState } from "react";
import { useUsuario } from "../../contexts/UsuarioContext.jsx";
import UserAvatar from "../../components/UserAvatar/UserAvatar.jsx";
import useConsultas from "../../hooks/useConsultas.js";
import useGanhos from "../../hooks/useGanhos.js";
import { consultaAberta, dataConsulta, horarioConsulta, humorPacientes, linkConsulta, resumoMensal, sessoesPorMes, statusConsulta } from "../../utils/consultas.js";
import { formatarCentavos, nomesMetodo } from "../../utils/dinheiro.js";
import { Link } from "react-router-dom";
import css from "./DashboardPsicologo.module.css";
import Skeleton, { Carregando } from "../../components/Skeleton/Skeleton.jsx";
import { Card, CardResumo, GraficoFluxoCaixa, GraficoHumorPacientes, GraficoSessoesMes, GraficoStatusMes, Protegido } from "../../components/GraficosDashboard/GraficosDashboard.jsx";
import { CalendarDays, Play } from "lucide-react";

export default function DashboardPsicologo() {

    const { consultas, carregando, erro, recarregar } = useConsultas();
    const [dias, setDias] = useState(30);
    const financeiro = useGanhos(dias);
    const ganhos = financeiro.ganhos;
    const carregandoFinanceiro = financeiro.carregando && !ganhos;

    const hoje = new Date();
    const resumo = resumoMensal(consultas, hoje);
    const meses = sessoesPorMes(consultas, hoje);
    const pronto = !carregando && !erro;
    const consultasHoje = consultas.filter((consulta) => consulta.status !== "CANCELADO" && dataConsulta(consulta.data_hora_inicio) === dataConsulta(hoje));
    const pacientes = Array.from(new Map(consultas.filter((consulta) => consulta.status !== "CANCELADO")
        .map((consulta) => [consulta.paciente_id, { id_usuario: consulta.paciente_id, nome: consulta.paciente_nome, foto_url: consulta.paciente_foto_url }])).values())
        .sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));
    // A API já manda do pagamento mais recente para o mais antigo
    const pagamentos = (ganhos?.consultas || []).slice(0, 5);

    const { usuario } = useUsuario();
    const nomeCompleto = usuario?.nome?.trim() || "";
    const primeiroNome = nomeCompleto.split(" ")[0];
    const semFinanceiro = financeiro.erro && !ganhos;

    return (
        <div className={css.fundo}>

            <div className={css.container}>

                {/* BOAS VINDAS */}

                <section className={css.boasVindas}>
                    <h1>Olá{primeiroNome ? `, ${primeiroNome}` : ""}</h1>
                    <p>{hoje.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
                </section>

                {carregando && <Carregando texto="Carregando consultas..." />}
                {erro && <p role="alert" className={css.erro}>{erro} <button onClick={recarregar}>Tentar novamente</button></p>}

                {/* RESUMOS */}

                <div className={css.resumos}>
                    <CardResumo descricao="A receber" carregando={carregandoFinanceiro}
                        valor={semFinanceiro ? "—" : formatarCentavos(ganhos?.saldo.a_receber_centavos)}
                        destaque={semFinanceiro ? financeiro.erro : `${formatarCentavos(ganhos?.saldo.em_repasse_centavos)} em repasse`}
                        detalhe={semFinanceiro ? "Tente novamente mais tarde" : `${formatarCentavos(ganhos?.saldo.aguardando_consulta_centavos)} aguardando consulta`} />
                    <CardResumo descricao={`Líquido em ${dias} dias`} carregando={carregandoFinanceiro}
                        valor={semFinanceiro ? "—" : formatarCentavos(ganhos?.resumo.liquido_centavos)}
                        destaque={semFinanceiro ? "Ganhos indisponíveis" : `Recebido: ${formatarCentavos(ganhos?.resumo.recebido_centavos)}`}
                        detalhe={semFinanceiro ? "Tente novamente mais tarde"
                            : `Taxas: ${formatarCentavos(ganhos?.resumo.taxa_plataforma_centavos + ganhos?.resumo.taxa_cartao_centavos)}`} />
                    <CardResumo descricao="Faturamento previsto" carregando={carregando}
                        valor={pronto ? formatarCentavos(resumo.previsto) : "—"}
                        variacao={pronto ? resumo.variacao : null}
                        destaque={pronto ? `${formatarCentavos(resumo.emAberto)} em sessões agendadas` : "—"}
                        detalhe="Sessões do mês, exceto canceladas" />
                    <CardResumo descricao="Pacientes" carregando={carregando}
                        valor={pronto ? pacientes.length : "—"}
                        destaque={pronto ? `${resumo.sessoes} sessão(ões) neste mês` : "—"}
                        detalhe={pronto ? `${consultasHoje.length} consulta(s) hoje` : ""} />
                </div>

                {/* FLUXO DE CAIXA */}

                <Protegido titulo="Fluxo de caixa">
                    <GraficoFluxoCaixa consultas={ganhos?.consultas} dias={dias} onDias={setDias}
                        carregando={financeiro.carregando} erro={financeiro.erro} recarregar={financeiro.recarregar} />
                </Protegido>

                {/* SESSÕES */}

                {pronto && <div className={css.linha}>
                    <GraficoSessoesMes dados={meses} />
                    <GraficoStatusMes mes={meses[meses.length - 1]} />
                </div>}

                {/* AGENDA + HUMOR */}

                <div className={css.linha}>

                    <Card titulo={<span className={css.tituloIcone}><CalendarDays size={18} strokeWidth={1.8} aria-hidden="true" /> Agenda de hoje</span>}
                        descricao={pronto ? `${consultasHoje.length} consulta(s)` : undefined}
                        acao={<Link to="/agendaprofissional" className={css.verTodas}>Ver todas</Link>}>

                        {carregando && [1, 2].map((item) => (
                            <div className={css.consulta} key={item} aria-hidden="true">
                                <div className={css.horario}><Skeleton width="40px" height="14px" /></div>
                                <Skeleton width="32px" height="32px" radius="50%" />
                                <div className={css.dadosConsulta}>
                                    <Skeleton width="130px" height="13px" />
                                    <Skeleton width="70px" height="10px" className={css.skeletonLinha} />
                                </div>
                                <Skeleton width="80px" height="30px" radius="8px" />
                            </div>
                        ))}
                        {pronto && !consultasHoje.length && <p className={css.vazio}>Nenhuma consulta para hoje.</p>}
                        {pronto && consultasHoje.map((consulta) => (
                            <div className={css.consulta} key={consulta.sessao_id}>
                                <div className={css.horario}>
                                    <strong>{horarioConsulta(consulta.data_hora_inicio)}</strong>
                                </div>
                                <UserAvatar src={consulta.paciente_foto_url} nome={consulta.paciente_nome} className={css.fotoPaciente} />
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
                    </Card>

                    {pronto && <GraficoHumorPacientes dados={humorPacientes(consultas)} />}

                </div>

                {/* MOVIMENTAÇÕES + PACIENTES */}

                <div className={css.linha}>

                    <Protegido titulo="Últimos pagamentos"><Card titulo="Últimos pagamentos" descricao="Líquido de cada consulta, no período do fluxo de caixa"
                        acao={<Link to="/carteira" className={css.verTodas}>Ver carteira</Link>}>
                        {carregandoFinanceiro && [1, 2, 3].map((item) => (
                            <div className={css.movimentacao} key={item} aria-hidden="true">
                                <div className={css.dadosConsulta}>
                                    <Skeleton width="130px" height="13px" />
                                    <Skeleton width="80px" height="10px" className={css.skeletonLinha} />
                                </div>
                                <Skeleton width="70px" height="14px" />
                            </div>
                        ))}
                        {semFinanceiro && <p className={css.vazio}>{financeiro.erro}</p>}
                        {ganhos && !pagamentos.length && <p className={css.vazio}>Nenhum pagamento no período.</p>}
                        {pagamentos.map((pagamento) => (
                            <div className={css.movimentacao} key={pagamento.sessao_id}>
                                <div className={css.dadosConsulta}>
                                    <strong>{pagamento.paciente_nome}</strong>
                                    <span>
                                        {new Date(pagamento.pago_em).toLocaleDateString("pt-BR")}
                                        {" · "}{nomesMetodo[pagamento.metodo] || pagamento.metodo}
                                    </span>
                                </div>
                                <strong className={pagamento.situacao === "REEMBOLSADO" ? css.saida : css.entrada}>
                                    {pagamento.situacao === "REEMBOLSADO" ? "Reembolsado" : `+ ${formatarCentavos(pagamento.liquido_centavos)}`}
                                </strong>
                            </div>
                        ))}
                    </Card></Protegido>

                    <Card titulo="Pacientes" descricao={pronto ? `${pacientes.length} com consultas` : undefined}>
                        <div className={css.listaPacientes}>
                            {carregando && [1, 2, 3, 4, 5].map((item) => (
                                <div className={css.paciente} key={item} aria-hidden="true">
                                    <Skeleton width="45px" height="45px" radius="50%" />
                                    <Skeleton width="45px" height="10px" />
                                </div>
                            ))}
                            {pronto && pacientes.map((paciente) => (
                                <Link key={paciente.id_usuario} to={`/prontuario/${paciente.id_usuario}`} state={{ paciente }} className={css.paciente}>
                                    <UserAvatar src={paciente.foto_url} nome={paciente.nome} className={css.avatarPaciente} />
                                    <span>{paciente.nome}</span>
                                </Link>
                            ))}
                            {pronto && !pacientes.length && <p className={css.vazio}>Nenhum paciente com consultas.</p>}
                        </div>
                    </Card>

                </div>

            </div>

        </div>
    );
}
