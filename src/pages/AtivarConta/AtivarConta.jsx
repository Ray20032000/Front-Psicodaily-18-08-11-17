import Alerts from "../../components/Alerts/Alerts.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import css from "./AtivarConta.module.css";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import api from "../../config/api.js";

export default function AtivarConta() {

    const [codigo, setCodigo] = useState(["", "", "", "", "", ""]);
    const [mensagem, setMensagem] = useState(null);
    const [email, setEmail] = useState(() => localStorage.getItem("cadastro_email") || "");

    const inputsRef = useRef([]);
    const navigate = useNavigate();


    useEffect(() => {

        if (mensagem) {

            const timer = setTimeout(() => {
                setMensagem(null);
            }, 10000);

            return () => clearTimeout(timer);
        }

    }, [mensagem]);


    function alterarDigito(valor, indice) {

        if (!/^[0-9]?$/.test(valor)) {
            return;
        }

        const novoCodigo = [...codigo];

        novoCodigo[indice] = valor;

        setCodigo(novoCodigo);

        if (valor && indice < 5) {
            inputsRef.current[indice + 1].focus();
        }
    }


    function aoApagar(e, indice) {

        if (
            e.key === "Backspace" &&
            !codigo[indice] &&
            indice > 0
        ) {
            inputsRef.current[indice - 1].focus();
        }
    }

    function colarCodigo(e) {
        e.preventDefault();
        const valorColado = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!valorColado) return;
        setCodigo([...valorColado.split(""), ...Array(6 - valorColado.length).fill("")]);
        inputsRef.current[Math.min(valorColado.length, 5)]?.focus();
    }


    async function ativarConta(e) {

        e.preventDefault();

        const codigoCompleto = codigo.join("");

        if (codigoCompleto.length < 6) {

            setMensagem({
                id: Date.now(),
                texto: "Preencha todos os dígitos do código",
                tipo: "erro"
            });

            return;
        }


        if (!email) {
            setMensagem({ id: Date.now(), texto: "Informe o e-mail usado no cadastro", tipo: "erro" });
            return;
        }

        let resposta = await fetch(`${api}/auth/verificar_codigo`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            credentials: "include",

            body: JSON.stringify({
                email,
                codigo: codigoCompleto
            })

        });


        const retorno = await resposta.json();


        if (!retorno) {
            console.log("Erro no servidor");
            return;
        }


        if (!resposta.ok) {

            setMensagem({
                id: Date.now(),
                texto: retorno.error || "Código inválido",
                tipo: "erro"
            });
        }


        if (resposta.ok) {

            localStorage.removeItem("cadastro_email");

            setTimeout(() => {
                navigate("/login");
            }, 1000);
        }
    }


    return (

        <div className={`${css.pagina} min-vh-100 d-flex flex-column`}>

            <Header />

            <main className={css.paginaAtivarConta}>

                {mensagem && (

                    <Alerts
                        key={mensagem.id}
                        tipo={mensagem.tipo}
                        descricao={mensagem.texto}
                    />

                )}


                <div className={css.formulario}>

                    <div className={css.bordaInterna}>

                        <img
                            src="/logo.png"
                            alt="PSICOdaily"
                            className={css.logo}
                        />

                        <div className={css.linha}></div>


                        <h2 className={css.titulo}>
                            Ativar Conta
                        </h2>


                        <p className={css.subtitulo}>
                            Ative sua conta para ter acesso
                        </p>


                        <form
                            className={css.form}
                            onSubmit={ativarConta}
                        >

                            <label htmlFor="email" className="form-label">E-mail usado no cadastro</label>
                            <input
                                id="email"
                                type="email"
                                className="form-control mb-3"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <p className={css.labelCodigo}>
                                Insira o código:
                            </p>


                            <div className={css.areaCodigo}>

                                {codigo.map((digito, indice) => (

                                    <input
                                        key={indice}
                                        ref={(el) => inputsRef.current[indice] = el}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength="1"
                                        className={css.caixaCodigo}
                                        value={digito}
                                        onChange={(e) =>
                                            alterarDigito(
                                                e.target.value,
                                                indice
                                            )
                                        }
                                        onKeyDown={(e) =>
                                            aoApagar(e, indice)
                                        }
                                        onPaste={indice === 0 ? colarCodigo : undefined}
                                    />

                                ))}

                            </div>


                            <button
                                type="submit"
                                className={css.botaoConfirmar}
                            >
                                Confirmar
                            </button>


                            <p className={css.naoTemConta}>
                                Não tem uma conta?
                            </p>


                            <Link
                                to="/cadastropaciente"
                                className={css.cadastreSe}
                            >
                                Cadastre-se!
                            </Link>

                        </form>

                    </div>

                </div>

            </main>

            <Footer />

        </div>
    );
}