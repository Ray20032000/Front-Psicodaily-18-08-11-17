import UserAvatar from "../../components/UserAvatar/UserAvatar.jsx";
import css from "./EdicaoPaciente.module.css"
import Header from "./../../components/Header/Header.jsx"
import Footer from "./../../components/Footer/Footer.jsx"

function EdicaoPaciente() {
    return (
        <div>
            <Header />
            <div className={css.container}>
                <div className={css.formulario}>
                    <img
                        src="/logo.png"
                        alt="PSICOdaily"
                        className={css.logo}
                    />
                    <div className={css.linha}></div>
                    <h1 className={css.titulo}>Edição Paciente</h1>

                    <form>
                        <div className={css.linhaForm}>
                            <div className={css.colunaesquerda}>
                                <div>
                                    <label>Nome</label>
                                    <input placeholder="Seu nome" id="nome" type="text" />
                                </div>
                                <div>
                                    <label>Email</label>
                                    <input placeholder="Seu email" id="email" type="email" />
                                </div>
                                <div>
                                    <label>Telefone</label>
                                    <input placeholder="Seu telefone" id="telefone" type="tel" />
                                </div>
                            </div>

                            <div className={css.colunadireita}>
                                <div>
                                    <label>Cpf</label>
                                    <input placeholder="Seu cpf" id="cpf" type="number" />
                                </div>
                                <div>
                                    <label>Senha</label>
                                    <input placeholder="Senha" id="senha" type="password" />
                                </div>
                                <div>
                                    <label>Confirmar senha</label>
                                    <input placeholder="Confirmar senha" id="confirmarsenha" type="password" />
                                </div>
                            </div>
                        </div>

                        <div className={css.fotoContainer}>
                            <label htmlFor="foto" className={css.botaoFoto}>
                                Upload da foto de perfil
                            </label>
                            <input id="foto" type="file" accept="image/*" className={css.inputFoto} />
                            <div className={css.avatarPreview}>
                                <UserAvatar currentUser />
                            </div>
                        </div>

                        <button type="submit" className={css.botaoCadastrar}>
                            Editar
                        </button>
                    </form>
                </div>

            </div>
            <Footer />
        </div>
    )
}

export default EdicaoPaciente;