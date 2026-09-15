import UserAvatar from "../../components/UserAvatar/UserAvatar.jsx";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import css from "../Pagamento/Pagamento.module.css";
import Footer from "../../components/Footer/Footer.jsx";
import api from "../../config/api.js";
import Header from "../../components/Header/Header.jsx";
import Sidebar from "../../components/Sidebar/Sidebar.jsx";
import { ArrowLeft, CalendarDays, Check, Clipboard, Clock3, LockKeyhole, Star, Timer } from "lucide-react";
import { toast } from "sonner";
import { resumoConsulta } from "../../utils/agendamento.js";

export default function Pagamento() {

    const navigate = useNavigate();
    const { idCobranca } = useParams();
    const { state } = useLocation();
    const contexto = Number(state?.resumoConsulta?.idCobranca) === Number(idCobranca) ? state.resumoConsulta : null;

    const [consulta, setConsulta] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [copiado, setCopiado] = useState(false);
    const [atualizando, setAtualizando] = useState(false);


    useEffect(() => {

        buscarPagamento();

    }, [idCobranca]);


    async function buscarPagamento(atualizar = false) {

        try {

            if (atualizar) setAtualizando(true);
            else setCarregando(true);
            setErro("");

            const resposta = await fetch(
                `${api}/pagamentos/cobranca/${idCobranca}`,
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

            if (!resposta.ok || !dados.cobranca) {
                setErro(dados.error || "Não foi possível carregar o pagamento.");
                return;
            }

            const cobranca = dados.cobranca;
            setConsulta({
                valor: cobranca.valor,
                ...resumoConsulta(contexto),
                pagamento: {
                    codigoPix: cobranca.codigo_pagamento,
                    status: cobranca.status === 1 ? "pago" : "pendente",
                    qrCode: null,
                },
            });


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
            setAtualizando(false);

        }

    }


    async function copiarPix() {

        if (!consulta?.pagamento?.codigoPix) {
            return;
        }


        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(consulta.pagamento.codigoPix);
            } else {
                const campo = document.createElement("textarea");
                campo.value = consulta.pagamento.codigoPix;
                campo.style.position = "fixed";
                campo.style.opacity = "0";
                document.body.appendChild(campo);
                campo.select();
                try {
                    if (!document.execCommand("copy")) throw new Error("Não foi possível copiar.");
                } finally {
                    document.body.removeChild(campo);
                }
            }

            setCopiado(true);


            setTimeout(() => {

                setCopiado(false);

            }, 2000);


        } catch (erro) {
            toast.error("Não foi possível copiar o código Pix.");

        }

    }


    function voltar() {

        navigate(-1);

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


            <Header />


            {/* ÁREA PRINCIPAL */}

            <main className={css.areaPagamento}>

                <Sidebar />

                <div className={css.container}>


                    {/* VOLTAR */}

                    <button
                        className={css.voltar}
                        aria-label="Voltar"
                        onClick={voltar}
                    >
                        <ArrowLeft size={21} strokeWidth={1.8} aria-hidden="true" />
                    </button>


                    {/* TÍTULO */}

                    <section className={css.introducao}>

                        <div className={css.seguranca}>
                            <LockKeyhole size={16} strokeWidth={1.8} aria-hidden="true" />
                            Pagamento 100% seguro
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
                                onClick={() => buscarPagamento()}
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

                                    {consulta.temResumo ? (
                                    <>
                                <div className={css.psicologo}>


                                        <div className={css.fotoPsicologo}>

                                            <UserAvatar userId={consulta.psicologo?.id_usuario || consulta.psicologo?.id} nome={consulta.psicologo?.nome} src={consulta.psicologo?.foto}  />

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

                                                <Star size={16} fill="currentColor" strokeWidth={1.8} aria-hidden="true" />

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
                                                <CalendarDays size={19} strokeWidth={1.8} aria-hidden="true" />
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
                                                <Clock3 size={19} strokeWidth={1.8} aria-hidden="true" />
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
                                                <Timer size={19} strokeWidth={1.8} aria-hidden="true" />
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

                                        </>
                                ) : (
                                    <p>Os detalhes da consulta estão em <Link to="/sessoes">Minhas sessões</Link>.</p>
                                )}
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


                                    <button type="button" className={css.atualizarStatus} onClick={() => buscarPagamento(true)} disabled={atualizando}>
                                        {atualizando ? "Atualizando..." : "Atualizar status do pagamento"}
                                    </button>

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
                                                ? <Check size={17} strokeWidth={1.8} aria-hidden="true" />
                                                : <Clipboard size={17} strokeWidth={1.8} aria-hidden="true" />}

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

                                            {consulta.pagamento?.status === "pago"
                                                ? <Check size={17} strokeWidth={1.8} aria-hidden="true" />
                                                : <Clock3 size={17} strokeWidth={1.8} aria-hidden="true" />}

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