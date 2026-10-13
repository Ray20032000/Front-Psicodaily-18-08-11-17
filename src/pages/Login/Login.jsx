import { useUsuario } from "../../contexts/UsuarioContext.jsx";
import Alerts from "../../components/Alerts/Alerts.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AuthLayout, { InputSenha } from "../../components/AuthLayout/AuthLayout.jsx";
import css from "../../components/AuthLayout/AuthLayout.module.css";
import api from "../../config/api.js";

export default function Login({ setLogado }) {
    const { entrar, recarregar } = useUsuario();

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
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


    async function login(e) {

        e.preventDefault();

        let resposta = await fetch(`${api}/auth/login`, {

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

            entrar(retorno.usuario);
            recarregar(true);

            setLogado?.(true);


            setTimeout(() => navigate("/app"), 1000);
        }
    }


    return (
        <AuthLayout>
            {mensagem && (
                <Alerts
                    key={mensagem.id}
                    tipo={mensagem.tipo}
                    descricao={mensagem.texto}
                />
            )}

            <h1 className={css.titulo}>Bem-vindo de volta</h1>
            <p className={css.subtitulo}>Acesse sua conta para continuar</p>

            <form className={css.form} onSubmit={login}>
                <div className={css.campo}>
                    <label htmlFor="email">E-mail</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Digite seu e-mail"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className={css.campo}>
                    <div className={css.rotuloLinha}>
                        <label htmlFor="senha">Senha</label>
                        <Link to="/esquecisenha" className={css.link}>
                            Esqueci minha senha
                        </Link>
                    </div>
                    <InputSenha
                        id="senha"
                        placeholder="Digite sua senha"
                        required
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                    />
                </div>

                <button type="submit" className={css.botao}>
                    Entrar
                </button>

                <p className={css.ou}>ou</p>

                <Link to="/cadastropaciente" className={css.botaoSecundario}>
                    Criar uma conta
                </Link>
            </form>
        </AuthLayout>
    );
}
