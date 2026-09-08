import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import css from "../Pagamento/Pagamento.module.css";
import Footer from "../../components/Footer/Footer.jsx";

export default function Pagamento({ api }) {

    const navigate = useNavigate();
    const { idAgendamento } = useParams();

    const [consulta, setConsulta] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [copiado, setCopiado] = useState(false);


    useEffect(() => {

        buscarPagamento();

    }, [idAgendamento]);


    async function buscarPagamento() {

        try {

            setCarregando(true);
            setErro("");

            const resposta = await fetch(
                `${api}/pagamento/${idAgendamento}`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );


            if (!resposta.ok) {

                setErro(
                    "Não foi possível carregar as informações da consulta."
                );

                return;
            }


            const dados = await resposta.json();

            setConsulta(dados);


        } catch (erro) {

            console.log(
                "Erro ao buscar pagamento:",
                erro
            );

            setErro(
                "Erro ao conectar com o servidor."
            );

        } finally {

            setCarregando(false);

        }

    }


    async function copiarPix() {

        if (!consulta?.pagamento?.codigoPix) {
            return;
        }


        try {

            await navigator.clipboard.writeText(
                consulta.pagamento.codigoPix
            );

            setCopiado(true);


            setTimeout(() => {

                setCopiado(false);

            }, 2000);


        } catch (erro) {

            console.log(
                "Erro ao copiar PIX:",
                erro
            );

        }

    }


    function voltar() {

        navigate(-1);

    }


    function sair() {

        localStorage.clear();

        navigate("/login");

    }


    function formatarValor(valor) {

        return Number(valor || 0).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    }


    function textoStatus(status) {

        if (status === "pago") {
            return "Pagamento confirmado";
        }

        if (status === "cancelado") {
            return "Pagamento cancelado";
        }

        if (status === "expirado") {
            return "Pagamento expirado";
        }

        return "Aguardando pagamento";

    }


    function classeStatus(status) {

        if (status === "pago") {
            return `${css.statusPagamento} ${css.statusPago}`;
        }

        if (
            status === "cancelado" ||
            status === "expirado"
        ) {
            return `${css.statusPagamento} ${css.statusErro}`;
        }

        return css.statusPagamento;

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
                        to="/perfilpaciente"
                        className={css.perfilTopo}
                    >

                        <div className={css.avatarTopo}>

                            <div className={css.cabeca}></div>

                            <div className={css.corpo}></div>

                        </div>

                    </Link>


                    <button
                        className={css.botaoSair}
                        onClick={sair}
                        title="Sair"
                    >
                        ↪
                    </button>

                </div>

            </header>


            {/* ÁREA PRINCIPAL */}

            <main className={css.areaPagamento}>

                <div className={css.container}>


                    {/* VOLTAR */}

                    <button
                        className={css.voltar}
                        onClick={voltar}
                    >
                        ←
                    </button>


                    {/* TÍTULO */}

                    <section className={css.introducao}>

                        <div className={css.seguranca}>
                            🔒 Pagamento 100% seguro
                        </div>


                        <h1>
                            Finalize sua consulta
                        </h1>


                        <p>
                            Confirme os detalhes da sua consulta
                            e realize o pagamento via Pix.
                        </p>

                    </section>


                    {/* CARREGAMENTO */}

                    {carregando && (

                        <div className={css.mensagemEstado}>

                            Carregando informações da consulta...

                        </div>

                    )}


                    {/* ERRO */}

                    {!carregando && erro && (

                        <div className={css.mensagemErro}>

                            <p>
                                {erro}
                            </p>

                            <button
                                onClick={buscarPagamento}
                            >
                                Tentar novamente
                            </button>

                        </div>

                    )}


                    {/* CONTEÚDO */}

                    {!carregando &&
                        !erro &&
                        consulta && (

                            <div className={css.gridPagamento}>


                                {/* ========================= */}
                                {/* INFORMAÇÕES DA CONSULTA */}
                                {/* ========================= */}

                                <section className={css.cardConsulta}>

                                    <h2>
                                        Informações da consulta
                                    </h2>


                                    {/* PSICÓLOGO */}

                                    <div className={css.psicologo}>


                                        <div className={css.fotoPsicologo}>

                                            {consulta.psicologo?.foto ? (

                                                <img
                                                    src={
                                                        consulta.psicologo.foto
                                                    }
                                                    alt={
                                                        consulta.psicologo.nome
                                                    }
                                                />

                                            ) : (

                                                <span>

                                                    {consulta.psicologo?.nome
                                                        ?.charAt(0)
                                                        .toUpperCase()}

                                                </span>

                                            )}

                                        </div>


                                        <div className={css.dadosPsicologo}>

                                            <h3>
                                                {consulta.psicologo?.nome}
                                            </h3>


                                            {consulta.psicologo?.crp && (

                                                <p>
                                                    CRP:{" "}
                                                    {consulta.psicologo.crp}
                                                </p>

                                            )}


                                            {consulta.psicologo
                                                ?.especialidade && (

                                                <p
                                                    className={
                                                        css.especialidade
                                                    }
                                                >

                                                    {
                                                        consulta.psicologo
                                                            .especialidade
                                                    }

                                                </p>

                                            )}

                                        </div>


                                        <div className={css.avaliacao}>

                                            <div>

                                                <span>
                                                    ★
                                                </span>

                                                <strong>

                                                    {consulta.psicologo
                                                        ?.avaliacao || 0}

                                                </strong>

                                            </div>


                                            <small>

                                                {consulta.psicologo
                                                    ?.totalAvaliacoes || 0}{" "}
                                                avaliações

                                            </small>

                                        </div>

                                    </div>


                                    {/* DETALHES DA CONSULTA */}

                                    <div className={css.detalhesConsulta}>


                                        {/* DATA */}

                                        <div className={css.itemDetalhe}>

                                            <span className={css.icone}>
                                                📅
                                            </span>

                                            <div>

                                                <strong>

                                                    {consulta.diaSemana}

                                                    {consulta.diaSemana &&
                                                        consulta.data &&
                                                        ", "}

                                                    {consulta.data}

                                                </strong>

                                            </div>

                                        </div>


                                        {/* HORÁRIO */}

                                        <div className={css.itemDetalhe}>

                                            <span className={css.icone}>
                                                ◷
                                            </span>

                                            <div>

                                                <strong>
                                                    Horário
                                                </strong>

                                                <p>

                                                    {
                                                        consulta.horarioInicio
                                                    }

                                                    {consulta.horarioFim &&
                                                        ` - ${consulta.horarioFim}`}

                                                </p>

                                            </div>

                                        </div>


                                        {/* DURAÇÃO */}

                                        <div className={css.itemDetalhe}>

                                            <span className={css.icone}>
                                                ⌛
                                            </span>

                                            <div>

                                                <strong>
                                                    Duração
                                                </strong>

                                                <p>
                                                    {consulta.duracao}
                                                </p>

                                            </div>

                                        </div>

                                    </div>


                                    {/* VALOR */}

                                    <div className={css.valorConsulta}>

                                        <span>
                                            Valor da consulta:
                                        </span>

                                        <strong>
                                            {formatarValor(
                                                consulta.valor
                                            )}
                                        </strong>

                                    </div>

                                </section>



                                {/* ========================= */}
                                {/* PAGAMENTO PIX */}
                                {/* ========================= */}

                                <section className={css.cardPagamento}>

                                    <h2>
                                        Pagamento via Pix
                                    </h2>


                                    <p className={css.instrucao}>

                                        Escaneie o QR Code abaixo
                                        e faça o pagamento de forma segura.

                                    </p>


                                    <div className={css.valorPagar}>

                                        <span>
                                            Valor a pagar:
                                        </span>

                                        <strong>
                                            {formatarValor(
                                                consulta.valor
                                            )}
                                        </strong>

                                    </div>


                                    {/* QR CODE */}

                                    <div className={css.areaQrCode}>

                                        {consulta.pagamento?.qrCode ? (

                                            <img
                                                src={
                                                    consulta.pagamento.qrCode
                                                }
                                                alt="QR Code PIX"
                                                className={css.qrCode}
                                            />

                                        ) : (

                                            <div className={css.semQrCode}>

                                                QR Code não disponível.

                                            </div>

                                        )}

                                    </div>


                                    {/* CÓDIGO PIX */}

                                    <p className={css.textoCodigo}>

                                        Ou copie o código Pix abaixo

                                    </p>


                                    <div className={css.codigoPix}>

                                        <input
                                            type="text"
                                            value={
                                                consulta.pagamento
                                                    ?.codigoPix || ""
                                            }
                                            readOnly
                                        />


                                        <button
                                            onClick={copiarPix}
                                            title="Copiar código PIX"
                                            disabled={
                                                !consulta.pagamento
                                                    ?.codigoPix
                                            }
                                        >

                                            {copiado
                                                ? "✓"
                                                : "▣"}

                                        </button>

                                    </div>


                                    {copiado && (

                                        <p className={css.copiado}>

                                            Código PIX copiado!

                                        </p>

                                    )}


                                    {/* STATUS DO PAGAMENTO */}

                                    <div
                                        className={classeStatus(
                                            consulta.pagamento?.status
                                        )}
                                    >

                                        <span className={css.relogio}>

                                            {consulta.pagamento?.status ===
                                            "pago"
                                                ? "✓"
                                                : "◷"}

                                        </span>


                                        <strong>

                                            {textoStatus(
                                                consulta.pagamento?.status
                                            )}

                                        </strong>

                                    </div>

                                </section>

                            </div>

                        )}

                </div>

            </main>


            {/* FOOTER */}

            <Footer />

        </div>

    );
}