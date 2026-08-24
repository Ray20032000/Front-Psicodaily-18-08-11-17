import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import Alerts from "../../components/Alerts/Alerts.jsx";
import css from "./CadastroPsicologo.module.css";
import InputMask from "react-input-mask";

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


    function cadastrar(e) {

        e.preventDefault();

        if (senha !== confirmarSenha) {
            mostrarMensagem("As senhas nao sao iguais", "erro", "Senha invalida");
            return;
        }

        console.log({
            nome,
            email,
            crp,
            telefone,
            cpf,
            senha,
            descricao,
            valor,
            especialidade,
            dias,
            foto
        });

        mostrarMensagem(
            "Dados validados no front. A API de cadastro profissional ainda nao esta conectada nesta tela.",
            "redirecionamento",
            "Cadastro aguardando API"
        );
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

                                        <label>
                                            Nome
                                        </label>

                                        <input
                                            type="text"
                                            value={nome}
                                            onChange={(e) => setNome(e.target.value)}
                                        />

                                    </div>


                                    <div className={css.campo}>

                                        <label>
                                            E-mail
                                        </label>

                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />

                                    </div>


                                    <div className={css.campo}>

                                        <label>
                                            CRP/CRM
                                        </label>

                                        <input
                                            type="text"
                                            value={crp}
                                            onChange={(e) => setCrp(e.target.value)}
                                        />

                                    </div>


                                    <div className={css.campo}>

                                        <label>
                                            Telefone
                                        </label>

                                        <input
                                            type="text"
                                            value={telefone}
                                            onChange={(e) => setTelefone(e.target.value)}
                                        />

                                    </div>


                                    <div className={css.campo}>

                                        <label>
                                            CPF
                                        </label>

                                        <input
                                            type="text"
                                            value={cpf}
                                            onChange={(e) => setCpf(e.target.value)}
                                        />

                                    </div>


                                    <div className={css.campo}>

                                        <label>
                                            Senha
                                        </label>

                                        <input
                                            type="password"
                                            value={senha}
                                            onChange={(e) => setSenha(e.target.value)}
                                        />

                                    </div>


                                    <div className={css.campo}>

                                        <label>
                                            Confirmar senha
                                        </label>

                                        <input
                                            type="password"
                                            value={confirmarSenha}
                                            onChange={(e) => setConfirmarSenha(e.target.value)}
                                        />

                                    </div>

                                </div>


                                {/* COLUNA DIREITA */}

                                <div className={css.colunaDireita}>

                                    <div className={css.campo}>

                                        <label>
                                            Descrição
                                        </label>

                                        <input
                                            type="text"
                                            value={descricao}
                                            onChange={(e) => setDescricao(e.target.value)}
                                        />

                                    </div>


                                    <div className={css.campo}>

                                        <label>
                                            Valor por sessão
                                        </label>

                                        <input
                                            type="number"
                                            value={valor}
                                            onChange={(e) => setValor(e.target.value)}
                                        />

                                    </div>


                                    <div className={css.areaEspecialidade}>

                                        <label>
                                            Especialidade
                                        </label>


                                        <div className={css.especialidades}>

                                            <button
                                                type="button"
                                                className={
                                                    especialidade === "Psicologia"
                                                        ? css.especialidadeAtiva
                                                        : css.especialidade
                                                }
                                                onClick={() => setEspecialidade("Psicologia")}
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
                                                onClick={() => setEspecialidade("Psiquiatria")}
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
                                                    onClick={() => escolherDia(dia)}
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
