import Input from "../../components/Input/Input.jsx";
import Button from "../../components/Button/Button.jsx";
import Form from "../../components/Form/Form.jsx";
import Alerts from "../../components/Alerts/Alerts.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import css from "./Login.module.css";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import api from "../../../config/api.js";

export default function Login({ setLogado }) {

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [mensagem, setMensagem] = useState(null);

    const navigate = useNavigate();

    const mobile = window.innerWidth <= 768;


    useEffect(() => {

        if (mensagem) {

            const timer = setTimeout(() => {
                setMensagem(null);
            }, 10000);

            return () => clearTimeout(timer);
        }

    }, [mensagem]);


    async function login(e) {

        e.preventDefault();

        let resposta = await fetch(`${api}/login`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            credentials: "include",

            body: JSON.stringify({
                email,
                senha
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
                texto: retorno.error || "Não foi possível entrar",
                tipo: "erro"
            });

            return;
        }


        if (retorno.usuario) {

            localStorage.setItem("id_usuario", retorno.usuario.id_usuario);
            localStorage.setItem("tipo_usuario", retorno.usuario.tipo_usuario);

            setLogado?.(true);


            setTimeout(() => {

                if (retorno.usuario.tipo_usuario === "PACIENTE") {
                    navigate("/dashboardpaciente");
                }

                else if (["PSICOLOGO", "PSIQUIATRA"].includes(retorno.usuario.tipo_usuario)) {
                    navigate("/dashboardpsicologo");
                }

            }, 1000);
        }
    }


    return (
        <div className="min-vh-100 d-flex flex-column">
            <Header />
            <main className={css.paginaLogin}>


                {mensagem && (

                    <Alerts
                        key={mensagem.id}
                        tipo={mensagem.tipo}
                        descricao={mensagem.texto}
                    />

                )}


                <div className={css.formulario}>
                    <div className={css.bordinha}>
                        <img
                            src="/logo.png"
                            alt="PSICOdaily"
                            className={css.logo}
                        />

                        <div className={css.linha}></div>


                        <h2 className={css.titulo}>
                            Bem-vindo de volta
                        </h2>

                        <p className={css.subtitulo}>
                            Acesse sua conta para continuar
                        </p>

                        <Form onSubmit={login}>


                            <Input
                                tipo="email"
                                label="E-mail"
                                valor={email}
                                alterar={(e) => setEmail(e.target.value)}
                            />


                            <Input
                                tipo="password"
                                label="Senha"
                                valor={senha}
                                alterar={(e) => setSenha(e.target.value)}
                            />



                            <div className={css.areaBotao}>

                                <Button
                                    texto="Login"
                                    tamanho={mobile ? "pequeno" : "medio"}
                                    background="azul"
                                    tipo="submit"
                                />

                            </div>


                            <p className={css.naoPossui}>
                                Novo por aqui?
                            </p>


                            <Link
                                to="/cadastropaciente"
                                className={css.criarConta}
                            >
                                Criar conta
                            </Link>


                            <Link
                                to="/esquecisenha"
                                className={css.esqueciSenha}
                            >
                                Esqueci minha senha
                            </Link>
                        </Form>
                    </div>
                </div>

            </main>
            <Footer/>
        </div>

    );
}