import AvatarPlaceholder from "../../components/AvatarPlaceholder/AvatarPlaceholder.jsx";
import { useState } from "react";
import {Link, useNavigate} from "react-router-dom";
import Alerts from "../../components/Alerts/Alerts.jsx";
import AuthLayout, { InputSenha } from "../../components/AuthLayout/AuthLayout.jsx";
import css from "../../components/AuthLayout/AuthLayout.module.css";
import api from "../../config/api.js";
import { toast } from "sonner";

export default function CadastroPaciente() {

    const navigate = useNavigate();

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
        dados.append("confirmar_senha", confirmarSenha);
        dados.append("telefone", telefone);

        if (foto) {
            dados.append("imagem", foto);
        }

        setEnviando(true);

        try {
            const resposta = await fetch(`${api}/usuarios/`, {
                method: "POST",
                body: dados
            });
            const resultado = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                // mostrarMensagem(
                //     resultado.error || "Nao foi possivel realizar o cadastro",
                //     "erro",
                //     "Cadastro nao realizado"
                // );
				toast.error(resultado.error || "Não foi possível realizar o cadastro", {
					position: "top-center"
				});
                return;
            }

            localStorage.setItem("cadastro_email", email);
            // mostrarMensagem(
            //     resultado.message || "Usuario cadastrado com sucesso",
            //     "sucesso",
            //     "Cadastro realizado"
            // );

			toast.success(resultado.message || "Usuário cadastrado com sucesso", {
				position: "top-center"
			});

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


    return (
        <AuthLayout>
            {mensagem && (
                <Alerts
                    key={mensagem.id}
                    tipo={mensagem.tipo}
                    titulo={mensagem.titulo}
                    descricao={mensagem.texto}
                    onClose={() => setMensagem(null)}
                />
            )}

            <h1 className={css.titulo}>Crie sua conta</h1>
            <p className={css.subtitulo}>Poucos passos para começar a cuidar de você.</p>

            <nav className={css.abas}>
                <span className={css.ativo}>Sou paciente</span>
                <Link to="/cadastropsicologo">Sou profissional</Link>
            </nav>

            <form className={css.form} onSubmit={cadastrar}>
                <div className={css.campo}>
                    <label htmlFor="nome">Nome</label>
                    <input
                        id="nome"
                        type="text"
                        placeholder="Seu nome"
                        required
                        maxLength={150}
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                    />
                </div>

                <div className={css.campo}>
                    <label htmlFor="email">E-mail</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="seuemail@gmail.com"
                        required
                        maxLength={255}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className={css.dupla}>
                    <div className={css.campo}>
                        <label htmlFor="cpf">CPF</label>
                        <input
                            id="cpf"
                            type="text"
                            placeholder="123.456.789-00"
                            required
                            minLength={11}
                            maxLength={14}
                            value={cpf}
                            onChange={(e) => setCpf(mascaraCpf(e.target.value))}
                        />
                    </div>

                    <div className={css.campo}>
                        <label htmlFor="telefone">Telefone</label>
                        <input
                            id="telefone"
                            type="text"
                            placeholder="(18) 99999-9999"
                            required
                            maxLength={15}
                            value={telefone}
                            onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
                        />
                    </div>
                </div>

                <div className={css.dupla}>
                    <div className={css.campo}>
                        <label htmlFor="senha">Senha</label>
                        <InputSenha
                            id="senha"
                            placeholder="8 a 12 caracteres"
                            required
                            minLength={8}
                            maxLength={12}
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                        />
                    </div>

                    <div className={css.campo}>
                        <label htmlFor="confirmarSenha">Confirmar senha</label>
                        <InputSenha
                            id="confirmarSenha"
                            placeholder="Repita a senha"
                            required
                            minLength={8}
                            maxLength={12}
                            value={confirmarSenha}
                            onChange={(e) => setConfirmarSenha(e.target.value)}
                        />
                    </div>
                </div>

                <div className={css.foto}>
                    <div className={css.preview}>
                        {preview ? <img src={preview} alt="Foto de perfil" /> : <AvatarPlaceholder />}
                    </div>
                    <label htmlFor="foto" className={css.botaoSecundario}>
                        Enviar foto de perfil
                    </label>
                    <input
                        id="foto"
                        type="file"
                        accept="image/jpeg,.jpg,.jpeg"
                        onChange={escolherFoto}
                    />
                </div>

                <button type="submit" className={css.botao} disabled={enviando}>
                    {enviando ? "Cadastrando..." : "Cadastrar"}
                </button>
            </form>

            <p className={css.rodape}>
                Já possui uma conta? <Link to="/login">Entrar</Link>
            </p>
        </AuthLayout>
    );
}
