import { toast } from "sonner";
import { useUsuario } from "../../contexts/UsuarioContext.jsx";
import UserAvatar from "../../components/UserAvatar/UserAvatar.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import css from "../AgendaProfissional/AgendaProfissional.module.css";
import Footer from "../../components/Footer/Footer.jsx";
import { Ban, CalendarDays, Clock3, Ellipsis, LogOut, Play } from "lucide-react";
import api from "../../config/api.js";

export default function AgendaProfissional() {

    const navigate = useNavigate();
    const { sair: encerrarSessao } = useUsuario();

    const hoje = new Date();

    const [mesAtual, setMesAtual] = useState(hoje.getMonth());
    const [anoAtual, setAnoAtual] = useState(hoje.getFullYear());
    const [diaSelecionado, setDiaSelecionado] = useState(hoje.getDate());

    const [visualizacao, setVisualizacao] = useState("semana");

    const [sessoes, setSessoes] = useState([]);
    const [proximaSessao, setProximaSessao] = useState(null);
    const [sessoesDepois, setSessoesDepois] = useState([]);


    const meses = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro"
    ];


    const diasSemana = [
        "Dom",
        "Seg",
        "Ter",
        "Qua",
        "Qui",
        "Sex",
        "Sáb"
    ];


    useEffect(() => {

        buscarAgenda();

    }, [mesAtual, anoAtual]);


    async function buscarAgenda() {

        try {

            const resposta = await fetch(
                `${api}/consultas/`,
                {
                    credentials: "include"
                }
            );

            const dados = await resposta.json();
            const consultasDoMes = (dados.consultas || [])
                .map((consulta) => {
                    const inicio = new Date(consulta.data_hora_inicio);
                    return {
                        ...consulta,
                        data: `${inicio.getFullYear()}-${String(inicio.getMonth() + 1).padStart(2, "0")}-${String(inicio.getDate()).padStart(2, "0")}`,
                        horario: inicio.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
                        modalidade: consulta.link_reuniao ? "Online" : "Consulta",
                        nome_paciente: consulta.paciente_nome || "Paciente",
                    };
                })
                .filter((consulta) => {
                    const data = new Date(consulta.data_hora_inicio);
                    return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
                });

            setSessoes(consultasDoMes);
            setProximaSessao(consultasDoMes[0] || null);
            setSessoesDepois(consultasDoMes.slice(1));

        } catch (erro) {

            console.log(
                "Erro ao buscar agenda:",
                erro
            );

        }

    }


    function mesAnterior() {

        if (mesAtual === 0) {

            setMesAtual(11);
            setAnoAtual(anoAtual - 1);
            setDiaSelecionado(1);

        } else {

            setMesAtual(mesAtual - 1);
            setDiaSelecionado(1);

        }

    }


    function proximoMes() {

        if (mesAtual === 11) {

            setMesAtual(0);
            setAnoAtual(anoAtual + 1);
            setDiaSelecionado(1);

        } else {

            setMesAtual(mesAtual + 1);
            setDiaSelecionado(1);

        }

    }


    function voltarHoje() {

        const data = new Date();

        setMesAtual(data.getMonth());
        setAnoAtual(data.getFullYear());
        setDiaSelecionado(data.getDate());

    }


    function quantidadeDiasMes() {

        return new Date(
            anoAtual,
            mesAtual + 1,
            0
        ).getDate();

    }


    function primeiroDiaMes() {

        return new Date(
            anoAtual,
            mesAtual,
            1
        ).getDay();

    }


    function criarDiasMes() {

        const dias = [];

        const quantidade = quantidadeDiasMes();

        const primeiroDia = primeiroDiaMes();


        for (let i = 0; i < primeiroDia; i++) {

            dias.push(null);

        }


        for (let dia = 1; dia <= quantidade; dia++) {

            dias.push(dia);

        }


        return dias;

    }


    function criarSemana() {

        const data = new Date(
            anoAtual,
            mesAtual,
            diaSelecionado
        );


        const numeroDiaSemana = data.getDay();

        const diferenca =
            numeroDiaSemana === 0
                ? -6
                : 1 - numeroDiaSemana;


        const segunda = new Date(data);

        segunda.setDate(
            data.getDate() + diferenca
        );


        const semana = [];


        for (let i = 0; i < 5; i++) {

            const dia = new Date(segunda);

            dia.setDate(
                segunda.getDate() + i
            );


            semana.push({
                dia: dia.getDate(),
                mes: dia.getMonth(),
                ano: dia.getFullYear(),
                nome: diasSemana[dia.getDay()]
            });

        }


        return semana;

    }


    function sessoesDoDia(dia, mes, ano) {

        return sessoes.filter((sessao) => {

            if (!sessao.data) {
                return false;
            }

            const partes = sessao.data.split("-");

            const anoSessao = Number(partes[0]);
            const mesSessao = Number(partes[1]) - 1;
            const diaSessao = Number(partes[2]);


            return (
                diaSessao === dia &&
                mesSessao === mes &&
                anoSessao === ano
            );

        });

    }


    function calcularPosicao(horario) {

        if (!horario) {
            return 40;
        }

        const partes = horario.split(":");

        const hora = Number(partes[0]);
        const minuto = Number(partes[1]);

        const minutosDesdeOito =
            (hora - 8) * 60 + minuto;

        return 42 + (minutosDesdeOito / 60) * 48;

    }


    function definirDisponibilidade() {

        navigate("/Disponibilidade");

    }


    function bloquearHorario() {

        navigate("/BloquearHorario");

    }


    function iniciarSessao() {

        if (!proximaSessao) {
            return;
        }

        navigate(
            `/Videochamada/${proximaSessao.id}`
        );

    }


    function abrirProntuario(idPaciente) {

        navigate(
            `/Prontuario/${idPaciente}`
        );

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


            {/* HEADER */}

            <header className={css.header}>

                <img
                    src="/logo.png"
                    alt="PSICOdaily"
                    className={css.logo}
                />


                <div className={css.usuarioTopo}>

                    <Link
                        to="/perfilpsicologo"
                        className={css.perfilTopo}
                        aria-label="Meu perfil"
                    >

                        <div className={css.avatarTopo}>

                            <UserAvatar currentUser />

                        </div>

                    </Link>


                    <button
                        className={css.botaoSair}
                        aria-label="Sair"
                        onClick={sair}
                    >
                        <LogOut size={19} strokeWidth={1.8} aria-hidden="true" />
                    </button>

                </div>

            </header>



            {/* ÁREA PRINCIPAL */}

            <main className={css.areaAgenda}>

                <div className={css.container}>


                    {/* TÍTULO */}

                    <div className={css.topoPagina}>

                        <div>

                            <h1>
                                Minha Agenda
                            </h1>

                            <p>
                                Gerencie suas sessões e horários disponíveis.
                            </p>

                        </div>


                        <div className={css.visualizacao}>

                            <button
                                className={
                                    visualizacao === "semana"
                                        ? css.visualizacaoAtiva
                                        : ""
                                }
                                onClick={() =>
                                    setVisualizacao("semana")
                                }
                            >
                                Semana
                            </button>


                            <button
                                className={
                                    visualizacao === "mes"
                                        ? css.visualizacaoAtiva
                                        : ""
                                }
                                onClick={() =>
                                    setVisualizacao("mes")
                                }
                            >
                                Mês
                            </button>

                        </div>

                    </div>



                    <div className={css.conteudoAgenda}>


                        {/* CALENDÁRIO */}

                        <section className={css.calendario}>


                            <div className={css.topoCalendario}>

                                <div className={css.navegacaoMes}>

                                    <button onClick={mesAnterior}>
                                        ‹
                                    </button>


                                    <h2>
                                        {meses[mesAtual]} {anoAtual}
                                    </h2>


                                    <button onClick={proximoMes}>
                                        ›
                                    </button>

                                </div>


                                <button
                                    className={css.botaoHoje}
                                    onClick={voltarHoje}
                                >
                                    Hoje
                                </button>

                            </div>



                            {/* SEMANA */}

                            {visualizacao === "semana" && (

                                <div className={css.areaSemana}>

                                    <div className={css.horariosLateral}>

                                        <span>08:00</span>
                                        <span>09:00</span>
                                        <span>10:00</span>
                                        <span>11:00</span>
                                        <span>12:00</span>
                                        <span>13:00</span>
                                        <span>14:00</span>
                                        <span>15:00</span>
                                        <span>16:00</span>
                                        <span>17:00</span>

                                    </div>


                                    <div className={css.gradeSemana}>

                                        {criarSemana().map(
                                            (item, index) => (

                                                <div
                                                    key={index}
                                                    className={
                                                        item.dia === diaSelecionado &&
                                                        item.mes === mesAtual
                                                            ? `${css.diaSemana} ${css.diaSelecionadoSemana}`
                                                            : css.diaSemana
                                                    }
                                                >

                                                    <button
                                                        className={css.cabecalhoDia}
                                                        onClick={() => {

                                                            setDiaSelecionado(
                                                                item.dia
                                                            );

                                                            setMesAtual(
                                                                item.mes
                                                            );

                                                            setAnoAtual(
                                                                item.ano
                                                            );

                                                        }}
                                                    >

                                                        <span>
                                                            {item.nome}
                                                        </span>

                                                        <strong>
                                                            {item.dia}
                                                        </strong>

                                                    </button>


                                                    {sessoesDoDia(
                                                        item.dia,
                                                        item.mes,
                                                        item.ano
                                                    ).map((sessao) => (

                                                        <button
                                                            key={sessao.id}
                                                            className={
                                                                sessao.disponivel
                                                                    ? css.sessaoDisponivel
                                                                    : css.sessaoMarcada
                                                            }
                                                            style={{
                                                                top:
                                                                    `${calcularPosicao(
                                                                        sessao.horario
                                                                    )}px`
                                                            }}
                                                            onClick={() => {

                                                                if (
                                                                    sessao.paciente_id
                                                                ) {

                                                                    abrirProntuario(
                                                                        sessao.paciente_id
                                                                    );

                                                                }

                                                            }}
                                                        >

                                                            <strong>
                                                                {sessao.nome_paciente ||
                                                                    "Indisponível"}
                                                            </strong>

                                                            <span>
                                                                {sessao.horario}
                                                            </span>

                                                        </button>

                                                    ))}

                                                </div>

                                            )
                                        )}

                                    </div>

                                </div>

                            )}



                            {/* MÊS */}

                            {visualizacao === "mes" && (

                                <div className={css.areaMes}>

                                    <div className={css.cabecalhoMes}>

                                        {diasSemana.map((dia) => (

                                            <span key={dia}>
                                                {dia}
                                            </span>

                                        ))}

                                    </div>


                                    <div className={css.gradeMes}>

                                        {criarDiasMes().map(
                                            (dia, index) => (

                                                <button
                                                    key={index}
                                                    disabled={!dia}
                                                    className={
                                                        dia === diaSelecionado
                                                            ? css.diaMesSelecionado
                                                            : ""
                                                    }
                                                    onClick={() => {

                                                        if (dia) {

                                                            setDiaSelecionado(
                                                                dia
                                                            );

                                                        }

                                                    }}
                                                >

                                                    {dia && (

                                                        <>
                                                            <strong>
                                                                {dia}
                                                            </strong>


                                                            {sessoesDoDia(
                                                                dia,
                                                                mesAtual,
                                                                anoAtual
                                                            ).length > 0 && (

                                                                <span>
                                                                    {
                                                                        sessoesDoDia(
                                                                            dia,
                                                                            mesAtual,
                                                                            anoAtual
                                                                        ).length
                                                                    }{" "}
                                                                    sessão
                                                                </span>

                                                            )}

                                                        </>

                                                    )}

                                                </button>

                                            )
                                        )}

                                    </div>

                                </div>

                            )}

                        </section>



                        {/* LADO DIREITO */}

                        <aside className={css.lateral}>


                            {/* AÇÕES RÁPIDAS */}

                            <section className={css.cardLateral}>

                                <h2>
                                    Ações Rápidas
                                </h2>


                                <div className={css.acoesRapidas}>

                                    <button
                                        onClick={definirDisponibilidade}
                                    >

                                        <CalendarDays size={20} strokeWidth={1.8} aria-hidden="true" />

                                        <p>
                                            Definir
                                            <br />
                                            Disponibilidade
                                        </p>

                                    </button>


                                    <button
                                        onClick={bloquearHorario}
                                    >

                                        <Ban size={20} strokeWidth={1.8} aria-hidden="true" />

                                        <p>
                                            Bloquear
                                            <br />
                                            Horário
                                        </p>

                                    </button>

                                </div>

                            </section>



                            {/* PRÓXIMA SESSÃO */}

                            <section className={css.cardLateral}>

                                <div className={css.tituloProxima}>

                                    <h2>
                                        Próxima Sessão
                                    </h2>

                                    {proximaSessao && (

                                        <span>
                                            HOJE
                                        </span>

                                    )}

                                </div>


                                {proximaSessao ? (

                                    <>

                                        <div className={css.pacienteProximo}>

                                            <div className={css.avatarPaciente}>

                                                <UserAvatar userId={proximaSessao.paciente_id} nome={proximaSessao.nome_paciente} />

                                            </div>


                                            <div>

                                                <strong>
                                                    {
                                                        proximaSessao.nome_paciente
                                                    }
                                                </strong>

                                                <p>
                                                    {
                                                        proximaSessao.descricao
                                                    }
                                                </p>

                                            </div>

                                        </div>


                                        <div className={css.infoSessao}>

                                            <p>
                                                <Clock3 size={16} strokeWidth={1.8} aria-hidden="true" />{" "}
                                                {proximaSessao.horario}
                                            </p>

                                            <p>
                                                <CalendarDays size={16} strokeWidth={1.8} aria-hidden="true" />{" "}
                                                {proximaSessao.modalidade}
                                            </p>

                                        </div>


                                        <div className={css.acoesSessao}>

                                            <button
                                                className={css.iniciar}
                                                onClick={iniciarSessao}
                                            >
                                                <Play size={16} fill="currentColor" strokeWidth={1.8} aria-hidden="true" /> Iniciar
                                            </button>


                                            <button
                                                className={css.mais}
                                                aria-label="Mais opções da sessão"
                                            >
                                                <Ellipsis size={20} strokeWidth={1.8} aria-hidden="true" />
                                            </button>

                                        </div>

                                    </>

                                ) : (

                                    <p className={css.semSessao}>
                                        Nenhuma sessão marcada.
                                    </p>

                                )}



                                {/* MAIS TARDE */}

                                {sessoesDepois.length > 0 && (

                                    <div className={css.maisTarde}>

                                        <span className={css.tituloMaisTarde}>
                                            MAIS TARDE
                                        </span>


                                        {sessoesDepois.map(
                                            (sessao) => (

                                                <button
                                                    key={sessao.id}
                                                    className={css.itemMaisTarde}
                                                    onClick={() =>
                                                        abrirProntuario(
                                                            sessao.paciente_id
                                                        )
                                                    }
                                                >

                                                    <div
                                                        className={
                                                            css.avatarPequeno
                                                        }
                                                    >
                                                        <UserAvatar userId={sessao.paciente_id} nome={sessao.nome_paciente} />
                                                    </div>


                                                    <div>

                                                        <strong>
                                                            {
                                                                sessao.nome_paciente
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                sessao.horario
                                                            }{" "}
                                                            •{" "}
                                                            {
                                                                sessao.modalidade
                                                            }
                                                        </span>

                                                    </div>

                                                </button>

                                            )
                                        )}

                                    </div>

                                )}

                            </section>

                        </aside>

                    </div>

                </div>

            </main>


            <Footer />

        </div>

    );
}
