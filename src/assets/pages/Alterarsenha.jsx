import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";
import Alerts from "../components/Alerts/Alerts.jsx";
import css from "../styles/Alterarsenha.module.css";

export default function Alterarsenha({ api }) {

    const [codigo, setCodigo] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [mensagem, setMensagem] = useState(null);

    const navigate = useNavigate();


    useEffect(() => {

        if (mensagem) {

            const timer = setTimeout(() => {
                setMensagem(null);
            }, 10000);

            return () => clearTimeout(timer);
        }

    }, [mensagem]);


    async function alterarSenha(e) {

        e.preventDefault();


        if (!codigo || !novaSenha || !confirmarSenha) {

            setMensagem({
                id: Date.now(),
                texto: "Preencha todos os campos",
                tipo: "erro"
            });

            return;
        }


        if (novaSenha !== confirmarSenha) {

            setMensagem({
                id: Date.now(),
                texto: "As senhas não são iguais",
                tipo: "erro"
            });

            return;
        }


        try {

            let retorno = await fetch(`${api}/alterar_senha`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include",

                body: JSON.stringify({
                    codigo: codigo,
                    senha: novaSenha,
                    confirmar_senha: confirmarSenha
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


            if (retorno.sucesso) {

                setTimeout(() => {
                    navigate("/login");
                }, 1000);

            }

        } catch (erro) {

            setMensagem({
                id: Date.now(),
                texto: "Erro ao alterar a senha",
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
                            Alterar Senha
                        </h1>


                        <form
                            className={css.formulario}
                            onSubmit={alterarSenha}
                        >


                            <div className={css.campo}>

                                <label htmlFor="codigo">
                                    Código:
                                </label>

                                <input
                                    id="codigo"
                                    type="text"
                                    value={codigo}
                                    onChange={(e) => setCodigo(e.target.value)}
                                />

                            </div>


                            <div className={css.campo}>

                                <label htmlFor="novaSenha">
                                    Nova senha:
                                </label>

                                <input
                                    id="novaSenha"
                                    type="password"
                                    value={novaSenha}
                                    onChange={(e) => setNovaSenha(e.target.value)}
                                />

                            </div>


                            <div className={css.campo}>

                                <label htmlFor="confirmarSenha">
                                    Confirmar nova senha:
                                </label>

                                <input
                                    id="confirmarSenha"
                                    type="password"
                                    value={confirmarSenha}
                                    onChange={(e) => setConfirmarSenha(e.target.value)}
                                />

                            </div>


                            <button
                                type="submit"
                                className={css.botao}
                            >
                                Alterar senha
                            </button>


                        </form>

                    </div>

                </div>

            </main>


            <Footer />

        </div>

    );
}