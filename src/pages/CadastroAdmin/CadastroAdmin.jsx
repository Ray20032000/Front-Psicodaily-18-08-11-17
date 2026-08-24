import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import css from "./CadastroAdmin.module.css";

export default function CadastroAdm() {

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [cpf, setCpf] = useState("");
    const [foto, setFoto] = useState(null);

    function cadastrar(e) {
        e.preventDefault();

        if (senha !== confirmarSenha) {
            alert("As senhas não são iguais");
            return;
        }

        console.log({
            nome,
            email,
            senha,
            cpf,
            foto
        });
    }

    function selecionarFoto(e) {
        const arquivo = e.target.files[0];

        if (arquivo) {
            setFoto(URL.createObjectURL(arquivo));
        }
    }

    return (
        <div className={`${css.pagina} min-vh-100 d-flex flex-column`}>

            <Header />

            <main className={css.main}>

                <nav className={css.menu}>

                    <Link
                        to="/cadastroadmin"
                        className={`${css.botaoMenu} ${css.ativo}`}
                    >
                        Cadastrar
                        <span>ADM</span>
                    </Link>

                    <Link
                        to="/dashboardadm"
                        className={css.botaoMenu}
                    >
                        Usuários
                    </Link>

                </nav>


                <section className={css.containerCadastro}>

                    <form
                        className={css.formulario}
                        onSubmit={cadastrar}
                    >

                        <div className={css.logoFormulario}>
                            <img
                                src="/logo.png"
                                alt="PSICOdaily"
                            />
                        </div>

                        <h1>Cadastro de ADM</h1>


                        <div className={css.campo}>
                            <label>Nome</label>

                            <input
                                type="text"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                required
                            />
                        </div>


                        <div className={css.campo}>
                            <label>Email</label>

                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>


                        <div className={css.senhas}>

                            <div className={css.campo}>
                                <label>Senha</label>

                                <input
                                    type="password"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    required
                                />
                            </div>

                            <div className={css.campo}>
                                <label>Confirmar Senha</label>

                                <input
                                    type="password"
                                    value={confirmarSenha}
                                    onChange={(e) =>
                                        setConfirmarSenha(e.target.value)
                                    }
                                    required
                                />
                            </div>

                        </div>


                        <div className={css.campo}>
                            <label>CPF</label>

                            <input
                                type="text"
                                value={cpf}
                                onChange={(e) => setCpf(e.target.value)}
                                maxLength="14"
                                required
                            />
                        </div>


                        <div className={css.uploadArea}>

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
                                onChange={selecionarFoto}
                                className={css.inputFoto}
                            />

                            <div className={css.avatar}>

                                {foto ? (
                                    <img
                                        src={foto}
                                        alt="Foto de perfil"
                                    />
                                ) : (
                                    <>
                                        <span className={css.cabeca}></span>
                                        <span className={css.corpo}></span>
                                    </>
                                )}

                            </div>

                        </div>


                        <button
                            type="submit"
                            className={css.botaoCadastrar}
                        >
                            Cadastrar
                        </button>

                    </form>

                </section>

            </main>

            <Footer />

        </div>
    );
}