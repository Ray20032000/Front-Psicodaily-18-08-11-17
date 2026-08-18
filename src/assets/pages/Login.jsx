import Input from "../components/Input/Input.jsx";
import Buton from "../components/Buton/Buton.jsx";
import Form from "../components/Form/Form.jsx";
import Alerts from "../components/Alerts/Alerts.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import css from "./../styles/Login.module.css";
import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";

export default function Login({ setLogado, api }) {

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

        let retorno = await fetch(`${api}/login`, {

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


        retorno = await retorno.json();


        if (!retorno) {
            console.log("Erro no servidor");
            return;
        }


        if (retorno.mensagem) {

            setMensagem({
                id: Date.now(),
                texto: retorno.mensagem.descricao,
                tipo: retorno.mensagem.tipo
            });
        }


        if (retorno.usuario) {

            localStorage.setItem("nome", retorno.usuario.nome);
            localStorage.setItem("email", retorno.usuario.email);
            localStorage.setItem("id_usuario", retorno.usuario.id_usuario);
            localStorage.setItem("tipo_usuario", retorno.usuario.tipoUsuario);

            setLogado(true);


            setTimeout(() => {

                if (retorno.usuario.tipoUsuario == 0) {
                    navigate("/Dashboardpaciente");
                }

                else if (retorno.usuario.tipoUsuario == 1) {
                    navigate("/Dashboardpsicologo");
                }

                else if (retorno.usuario.tipoUsuario == 2) {
                    navigate("/Dashboardadmin");
            }

            }, 1000);
        }
    }


    return (
        <div>
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
                                tipoInp="email"
                                label="E-mail"
                                htmlFor="email"
                                value={email}
                                funcao={(e) => setEmail(e.target.value)}
                            />


                            <Input
                                tipo="password"
                                label="Senha"
                                valor={senha}
                                alterar={(e) => setSenha(e.target.value)}
                            />



                            <div className={css.areaBotao}>

                                <Buton
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
                                to="/Cadastropaciente"
                                className={css.criarConta}
                            >
                                Criar conta
                            </Link>


                            <Link
                                to="/Esquecisenha"
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