import UserAvatar from "../../components/UserAvatar/UserAvatar.jsx";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import css from "../Pagamento/Pagamento.module.css";
import Skeleton, { Carregando } from "../../components/Skeleton/Skeleton.jsx";
import api from "../../config/api.js";
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



            {/* ÁREA PRINCIPAL */}

            <main className={css.areaPagamento}>

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

                        <Carregando texto="Carregando informações da consulta..." className={css.gridPagamento}>
                            <section className={css.cardConsulta}>
                                <Skeleton width="200px" height="22px" />
                                <div className={`${css.psicologo} ${css.skeletonLinha}`}>
                                    <Skeleton width="80px" height="80px" radius="50%" />
                                    <div className={css.dadosPsicologo}>
                                        <Skeleton width="160px" height="18px" />
                                        <Skeleton width="100px" height="12px" className={css.skeletonLinha} />
                                        <Skeleton width="130px" height="12px" className={css.skeletonLinha} />
                                    </div>
                                </div>
                                <div className={css.detalhesConsulta}>
                                    {[1, 2, 3].map((item) => (
                                        <div key={item} className={css.itemDetalhe}>
                                            <Skeleton width="36px" height="36px" radius="8px" />
                                            <Skeleton width="150px" height="14px" />
                                        </div>
                                    ))}
                                </div>
                                <Skeleton height="56px" radius="10px" className={css.skeletonLinha} />
                            </section>
                            <section className={css.cardPagamento}>
                                <Skeleton width="160px" height="22px" />
                                <Skeleton width="80%" height="12px" className={css.skeletonLinha} />
                                <Skeleton width="120px" height="28px" className={css.skeletonLinha} />
                                <div className={`${css.areaQrCode} ${css.skeletonLinha}`}>
                                    <Skeleton width="235px" height="235px" radius="10px" />
                                </div>
                                <Skeleton height="40px" radius="8px" className={css.skeletonLinha} />
                            </section>
                        </Carregando>

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

                                            <UserAvatar nome={consulta.psicologo?.nome} src={consulta.psicologo?.foto_url} />

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

                                        {consulta.pagamento?.codigoPix ? (

                                            <QRCodeSVG
                                                value={consulta.pagamento.codigoPix}
                                                size={235}
                                                marginSize={4}
                                                title="QR Code PIX"
                                                role="img"
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

        </div>

    );
}
