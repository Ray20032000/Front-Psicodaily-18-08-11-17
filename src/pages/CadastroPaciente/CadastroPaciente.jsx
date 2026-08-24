import { useState } from "react";
import {Link, useNavigate} from "react-router-dom";
import Header from "../../components/Header/Header.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import Alerts from "../../components/Alerts/Alerts.jsx";
import css from "./CadastroPaciente.module.css";
import api from "../../config/api.js";

export default function CadastroPaciente() {

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
    const [mensagem, setMensagem] = useState(null);
    const [enviando, setEnviando] = useState(false);

    function mostrarMensagem(texto, tipo = "erro", titulo) {
        setMensagem({
            id: Date.now(),
            texto,
            tipo,
            titulo
        });
    }


    // MÁSCARA DO TELEFONE
    function mascaraTelefone(valor) {

        valor = valor.replace(/\D/g, "");

        valor = valor.replace(
            /(\d{2})(\d)/,
            "($1) $2"
        );

        valor = valor.replace(
            /(\d{5})(\d)/,
            "$1-$2"
        );

        return valor.slice(0, 15);
    }


    // MÁSCARA DO CPF
    function mascaraCpf(valor) {

        valor = valor.replace(/\D/g, "");

        valor = valor.replace(
            /(\d{3})(\d)/,
            "$1.$2"
        );

        valor = valor.replace(
            /(\d{3})(\d)/,
            "$1.$2"
        );

        valor = valor.replace(
            /(\d{3})(\d{1,2})$/,
            "$1-$2"
        );

        return valor.slice(0, 14);
    }


    function escolherFoto(e) {

        const arquivo = e.target.files[0];

        if (arquivo) {
            setFoto(arquivo);
            setPreview(URL.createObjectURL(arquivo));
        }
    }


    async function cadastrar(e) {

        e.preventDefault();

        if (senha !== confirmarSenha) {
            mostrarMensagem("As senhas nao sao iguais", "erro", "Senha invalida");
            return;
        }

        const dados = new FormData();

        dados.append("nome", nome);
        dados.append("cpf", cpf);
        dados.append("email", email);
        dados.append("senha", senha);
        dados.append("telefone", telefone);

        if (foto) {
            dados.append("imagem", foto);
        }

        setEnviando(true);

        try {
            const resposta = await fetch(`${api}/auth/cadastro`, {
                method: "POST",
                body: dados
            });
            const resultado = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                mostrarMensagem(
                    resultado.error || "Nao foi possivel realizar o cadastro",
                    "erro",
                    "Cadastro nao realizado"
                );
                return;
            }

            localStorage.setItem("cadastro_email", email);
            mostrarMensagem(
                resultado.message || "Usuario cadastrado com sucesso",
                "sucesso",
                "Cadastro realizado"
            );

            setTimeout(() => {
                navigate("/ativarconta");
            }, 1200);
        } catch {
            mostrarMensagem(
                "Nao foi possivel conectar a API. Verifique se o backend esta ativo.",
                "erro",
                "Conexao indisponivel"
            );
        } finally {
            setEnviando(false);
        }
    }


    function trocarCadastro(tipo) {

        setTipoCadastro(tipo);

        if (tipo === "psicologo") {
            navigate("/cadastropsicologo");
        }
    }


    return (

        <div className={`${css.pagina} min-vh-100 d-flex flex-column`}>

            <Header />

            <main className={css.fundo}>

                {mensagem && (
                    <Alerts
                        key={mensagem.id}
                        tipo={mensagem.tipo}
                        titulo={mensagem.titulo}
                        descricao={mensagem.texto}
                        onClose={() => setMensagem(null)}
                    />
                )}

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
                                onClick={() =>
                                    trocarCadastro("paciente")
                                }
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
                                onClick={() =>
                                    trocarCadastro("psicologo")
                                }
                            >
                                Sou psicólogo
                            </button>

                        </div>


                        <form
                            className={css.formulario}
                            onSubmit={cadastrar}
                        >

                            <div className={css.colunas}>


                                {/* COLUNA ESQUERDA */}

                                <div className={css.coluna}>

                                    <div className={css.campo}>

                                        <label htmlFor="nome">
                                            Nome
                                        </label>

                                        <input
                                            id="nome"
                                            type="text"
                                            value={nome}
                                            onChange={(e) =>
                                                setNome(e.target.value)
                                            }
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
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                        />

                                    </div>


                                    {/* TELEFONE COM MÁSCARA */}

                                    <div className={css.campo}>

                                        <label htmlFor="telefone">
                                            Telefone
                                        </label>

                                        <input
                                            id="telefone"
                                            type="text"
                                            value={telefone}
                                            placeholder="(18) 99999-9999"
                                            maxLength={15}
                                            onChange={(e) =>
                                                setTelefone(
                                                    mascaraTelefone(
                                                        e.target.value
                                                    )
                                                )
                                            }
                                        />

                                    </div>

                                </div>


                                {/* COLUNA DIREITA */}

                                <div className={css.coluna}>

                                    {/* CPF COM MÁSCARA */}

                                    <div className={css.campo}>

                                        <label htmlFor="cpf">
                                            CPF
                                        </label>

                                        <input
                                            id="cpf"
                                            type="text"
                                            value={cpf}
                                            placeholder="123.456.789-00"
                                            maxLength={14}
                                            onChange={(e) =>
                                                setCpf(
                                                    mascaraCpf(
                                                        e.target.value
                                                    )
                                                )
                                            }
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
                                            onChange={(e) =>
                                                setSenha(e.target.value)
                                            }
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
                                                setConfirmarSenha(
                                                    e.target.value
                                                )
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
                                disabled={enviando}
                            >
                                {enviando ? "Cadastrando..." : "Cadastrar"}
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
