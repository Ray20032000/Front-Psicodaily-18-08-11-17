import { useState } from "react";
import {Link, useNavigate} from "react-router-dom";
import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";
import css from "../styles/Cadastropaciente.module.css";

export default function Cadastropaciente() {

    const navigate = useNavigate();

    const [tipoCadastro, setTipoCadastro] = useState("paciente");

    const [nome, setNome] = useState("");
    const [cpf, setCpf] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [telefone, setTelefone] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");

    const [foto, setFoto] = useState(null);
    const [preview, setPreview] = useState(null);


    function escolherFoto(e) {

        const arquivo = e.target.files[0];

        if (arquivo) {
            setFoto(arquivo);
            setPreview(URL.createObjectURL(arquivo));
        }
    }


    function cadastrar(e) {

        e.preventDefault();

        if (senha !== confirmarSenha) {
            alert("As senhas não são iguais");
            return;
        }

        console.log({
            nome,
            cpf,
            email,
            senha,
            telefone,
            foto
        });

        alert("Cadastro realizado!");
    }


    function trocarCadastro(tipo) {

        setTipoCadastro(tipo);

        if (tipo === "psicologo") {
            navigate("/Cadastropsicologo");
        }
    }


    return (

        <div className={css.pagina}>

            <Header />

            <main className={css.fundo}>

                <section className={css.card}>

                    <div className={css.bordaInterna}>

                        <img
                            src="/logo.png"
                            alt="PSICOdaily"
                            className={css.logo}
                        />

                        <div className={css.linha}></div>


                        <h1 className={css.titulo}>
                            Seja nosso paciente
                        </h1>

                        <p className={css.subtitulo}>
                            Preencha seus dados para criar sua conta no PsicoDaily.
                        </p>


                        <div className={css.seletor}>

                            <button
                                type="button"
                                className={
                                    tipoCadastro === "paciente"
                                        ? css.ativo
                                        : css.inativo
                                }
                                onClick={() => trocarCadastro("paciente")}
                            >
                                Sou paciente
                            </button>

                            <button
                                type="button"
                                className={
                                    tipoCadastro === "psicologo"
                                        ? css.ativo
                                        : css.inativo
                                }
                                onClick={() => trocarCadastro("psicologo")}
                            >
                                Sou psicólogo
                            </button>

                        </div>


                        <form
                            className={css.formulario}
                            onSubmit={cadastrar}
                        >

                            <div className={css.colunas}>

                                <div className={css.coluna}>

                                    <div className={css.campo}>
                                        <label htmlFor="nome">
                                            Nome
                                        </label>

                                        <input
                                            id="nome"
                                            type="text"
                                            value={nome}
                                            onChange={(e) => setNome(e.target.value)}
                                        />
                                    </div>


                                    <div className={css.campo}>
                                        <label htmlFor="email">
                                            E-mail
                                        </label>

                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>


                                    <div className={css.campo}>
                                        <label htmlFor="telefone">
                                            Telefone
                                        </label>

                                        <input
                                            id="telefone"
                                            type="text"
                                            value={telefone}
                                            onChange={(e) => setTelefone(e.target.value)}
                                        />
                                    </div>

                                </div>


                                <div className={css.coluna}>

                                    <div className={css.campo}>
                                        <label htmlFor="cpf">
                                            CPF
                                        </label>

                                        <input
                                            id="cpf"
                                            type="text"
                                            value={cpf}
                                            onChange={(e) => setCpf(e.target.value)}
                                        />
                                    </div>


                                    <div className={css.campo}>
                                        <label htmlFor="senha">
                                            Senha
                                        </label>

                                        <input
                                            id="senha"
                                            type="password"
                                            value={senha}
                                            onChange={(e) => setSenha(e.target.value)}
                                        />
                                    </div>


                                    <div className={css.campo}>
                                        <label htmlFor="confirmarSenha">
                                            Confirmar senha
                                        </label>

                                        <input
                                            id="confirmarSenha"
                                            type="password"
                                            value={confirmarSenha}
                                            onChange={(e) =>
                                                setConfirmarSenha(e.target.value)
                                            }
                                        />
                                    </div>

                                </div>

                            </div>


                            <div className={css.areaFoto}>

                                <label
                                    htmlFor="foto"
                                    className={css.botaoFoto}
                                >
                                    Upload da foto de perfil
                                </label>

                                <input
                                    id="foto"
                                    type="file"
                                    accept="image/*"
                                    onChange={escolherFoto}
                                    className={css.inputFoto}
                                />


                                <div className={css.preview}>

                                    {preview ? (

                                        <img
                                            src={preview}
                                            alt="Foto de perfil"
                                        />

                                    ) : (

                                        <div className={css.usuarioPadrao}>
                                            <div className={css.cabeca}></div>
                                            <div className={css.corpo}></div>
                                        </div>

                                    )}

                                </div>

                            </div>


                            <button
                                type="submit"
                                className={css.botaoCadastrar}
                            >
                                Cadastrar
                            </button>

                            <p className={css.jaPossui}>
                                Já possui uma conta?
                            </p>

                            <Link
                                to="/login"
                                className={css.entrar}
                            >
                                Entrar
                            </Link>

                        </form>

                    </div>

                </section>

            </main>

            <Footer />

        </div>
    );
}