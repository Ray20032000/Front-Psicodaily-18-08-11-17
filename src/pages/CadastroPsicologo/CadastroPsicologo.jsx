import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import Alerts from "../../components/Alerts/Alerts.jsx";
import css from "./CadastroPsicologo.module.css";
import api from "../../config/api.js";

export default function CadastroPsicologo() {

    const navigate = useNavigate();

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [crp, setCrp] = useState("");
    const [telefone, setTelefone] = useState("");
    const [cpf, setCpf] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");

    const [descricao, setDescricao] = useState("");
    const [valor, setValor] = useState("");

    const [especialidade, setEspecialidade] = useState("Psicologia");

    const [dias, setDias] = useState([]);

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


    const listaDias = [
        "Segunda",
        "Terça",
        "Quarta",
        "Quinta",
        "Sexta",
        "Sábado",
        "Domingo"
    ];


    // MÁSCARA TELEFONE
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


    // MÁSCARA CPF
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


    // MÁSCARA CRP
    function mascaraCrp(valor) {

        valor = valor.replace(/\D/g, "");

        valor = valor.replace(
            /(\d{2})(\d)/,
            "$1/$2"
        );

        return valor.slice(0, 9);
    }


    // MÁSCARA CRM
    function mascaraCrm(valor) {

        valor = valor.toUpperCase();

        valor = valor.replace(
            /[^A-Z0-9]/g,
            ""
        );

        if (valor.startsWith("CRM")) {
            valor = valor.substring(3);
        }

        const estado = valor
            .replace(/[^A-Z]/g, "")
            .slice(0, 2);

        const numero = valor
            .replace(/\D/g, "")
            .slice(0, 6);

        let resultado = "CRM";

        if (estado) {
            resultado += "/" + estado;
        }

        if (numero) {
            resultado += " " + numero;
        }

        return resultado;
    }


    function escolherDia(dia) {

        if (dias.includes(dia)) {

            setDias(
                dias.filter((item) => item !== dia)
            );

        } else {

            setDias([
                ...dias,
                dia
            ]);

        }
    }


    function escolherFoto(e) {

        const arquivo = e.target.files[0];

        if (arquivo) {

            setFoto(arquivo);

            setPreview(
                URL.createObjectURL(arquivo)
            );
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
        dados.append("email", email);
        dados.append("telefone", telefone);
        dados.append("cpf", cpf);
        dados.append("senha", senha);
        dados.append("confirmarSenha", confirmarSenha);
        dados.append("crp_crm", crp);
        dados.append("especialidade", especialidade);
        dados.append("descricao", descricao);
        dados.append("valor", valor);

        if (foto) {
            dados.append("imagem", foto);
        }

        dias.forEach((dia) => {
            dados.append("dias[]", dia);
        });

        setEnviando(true);

        try {
            const resposta = await fetch(`${api}/auth/cadastro_profissional`, {
                method: "POST",
                body: dados
            });

            const resultado = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                mostrarMensagem(
                    resultado.error || "Nao foi possivel realizar o cadastro profissional",
                    "erro",
                    "Cadastro nao realizado"
                );
                return;
            }

            localStorage.setItem("cadastro_email", email);
            mostrarMensagem(
                resultado.message || "Profissional cadastrado com sucesso",
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
                            Seja um profissional parceiro
                        </h1>


                        <p className={css.subtitulo}>
                            Preencha seus dados para criar sua conta profissional no PsicoDaily.
                        </p>


                        <div className={css.seletor}>

                            <button
                                type="button"
                                className={css.inativo}
                                onClick={() => navigate("/cadastropaciente")}
                            >
                                Sou paciente
                            </button>


                            <button
                                type="button"
                                className={css.ativo}
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
                                            name="nome"
                                            placeholder="Seu nome"
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
                                            name="email"
                                            placeholder="SeuEmail@gmail.com"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />

                                    </div>


                                    {/* CRP / CRM */}

                                    <div className={css.campo}>

                                        <label htmlFor="crp_crm">
                                            CRP/CRM
                                        </label>

                                        <input
                                            id="crp_crm"
                                            name="crp_crm"
                                            type="text"
                                            value={crp}
                                            placeholder={
                                                especialidade === "Psicologia"
                                                    ? "06/123456"
                                                    : "CRM/SP 123456"
                                            }
                                            onChange={(e) => {

                                                if (especialidade === "Psicologia") {

                                                    setCrp(
                                                        mascaraCrp(e.target.value)
                                                    );

                                                } else {

                                                    setCrp(
                                                        mascaraCrm(e.target.value)
                                                    );

                                                }

                                            }}
                                        />

                                    </div>


                                    {/* TELEFONE */}

                                    <div className={css.campo}>

                                        <label htmlFor="telefone">
                                            Telefone
                                        </label>

                                        <input
                                            id="telefone"
                                            name="telefone"
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


                                    {/* CPF */}

                                    <div className={css.campo}>

                                        <label htmlFor="cpf">
                                            CPF
                                        </label>

                                        <input
                                            id="cpf"
                                            name="cpf"
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
                                            name="senha"
                                            placeholder="Sua senha"
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
                                            name="confirmarSenha"
                                            placeholder="Sua senha"
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


                                {/* COLUNA DIREITA */}

                                <div className={css.colunaDireita}>

                                    <div className={css.campo}>

                                        <label htmlFor="descricao">
                                            Descrição
                                        </label>

                                        <input
                                            id="descricao"
                                            name="descricao"
                                            placeholder="Sua descrição"
                                            type="text"
                                            value={descricao}
                                            onChange={(e) =>
                                                setDescricao(
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>


                                    <div className={css.campo}>

                                        <label htmlFor="valor">
                                            Valor por sessão
                                        </label>

                                        <input
                                            id="valor"
                                            name="valor"
                                            placeholder="Valor de cada sessão"
                                            type="number"
                                            value={valor}
                                            onChange={(e) =>
                                                setValor(
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>


                                    <div className={css.areaEspecialidade}>

                                        <label htmlFor="especialidade">
                                            Especialidade
                                        </label>


                                        <div id="especialidade" className={css.especialidades}>

                                            <button
                                                type="button"
                                                className={
                                                    especialidade === "Psicologia"
                                                        ? css.especialidadeAtiva
                                                        : css.especialidade
                                                }
                                                onClick={() => {

                                                    setEspecialidade(
                                                        "Psicologia"
                                                    );

                                                    setCrp("");

                                                }}
                                            >
                                                Psicologia
                                            </button>


                                            <button
                                                type="button"
                                                className={
                                                    especialidade === "Psiquiatria"
                                                        ? css.especialidadeAtiva
                                                        : css.especialidade
                                                }
                                                onClick={() => {

                                                    setEspecialidade(
                                                        "Psiquiatria"
                                                    );

                                                    setCrp("");

                                                }}
                                            >
                                                Psiquiatria
                                            </button>

                                        </div>

                                    </div>


                                    <div className={css.areaDias}>

                                        <label>
                                            Dias de atendimento
                                        </label>


                                        <div className={css.dias}>

                                            {listaDias.map((dia) => (

                                                <button
                                                    key={dia}
                                                    type="button"
                                                    onClick={() =>
                                                        escolherDia(dia)
                                                    }
                                                    className={
                                                        dias.includes(dia)
                                                            ? css.diaAtivo
                                                            : css.dia
                                                    }
                                                >
                                                    {dia}
                                                </button>

                                            ))}

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
