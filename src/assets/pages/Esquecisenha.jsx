import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";
import Alerts from "../components/Alerts/Alerts.jsx";
import css from "../styles/Esquecisenha.module.css";

export default function Esquecisenha({ api }) {

    const [email, setEmail] = useState("");
    const [mensagem, setMensagem] = useState(null);


    useEffect(() => {

        if (mensagem) {

            const timer = setTimeout(() => {
                setMensagem(null);
            }, 10000);

            return () => clearTimeout(timer);
        }

    }, [mensagem]);


    async function enviarEmail(e) {

        e.preventDefault();

        if (email === "") {

            setMensagem({
                id: Date.now(),
                texto: "Digite seu e-mail",
                tipo: "erro"
            });

            return;
        }


        try {

            let retorno = await fetch(`${api}/esqueci_minha_senha`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include",

                body: JSON.stringify({
                    email: email
                })

            });


            retorno = await retorno.json();


            if (retorno.mensagem) {

                setMensagem({
                    id: Date.now(),
                    texto: retorno.mensagem.descricao,
                    tipo: retorno.mensagem.tipo
                });

            }

        } catch (erro) {

            setMensagem({
                id: Date.now(),
                texto: "Erro ao enviar o e-mail",
                tipo: "erro"
            });

        }
    }


    return (

        <div className={css.pagina}>

            <Header />

            <main className={css.fundo}>

                {mensagem && (

                    <Alerts
                        key={mensagem.id}
                        tipo={mensagem.tipo}
                        descricao={mensagem.texto}
                    />

                )}


                <div className={css.card}>

                    <div className={css.bordaInterna}>

                        <img
                            src="/logo.png"
                            alt="PSICOdaily"
                            className={css.logo}
                        />


                        <div className={css.linha}></div>


                        <h1 className={css.titulo}>
                            Esqueci minha senha
                        </h1>
                        <p className={css.textinho}>Informe o e-mail cadastrado na sua conta. Enviaremos as instruções para redefinir sua senha.</p>


                        <form
                            className={css.formulario}
                            onSubmit={enviarEmail}
                        >

                            <div className={css.campo}>

                                <label htmlFor="email">
                                    Email da conta
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />

                            </div>


                            <button
                                type="submit"
                                className={css.botaoEnviar}
                            >
                                Enviar E-mail
                            </button>


                            <p className={css.naoTemConta}>
                                Não tem uma conta?
                            </p>


                            <Link
                                to="/Cadastropaciente"
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