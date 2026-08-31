import css from "./EdicaoAdm.module.css"
import Header from "./../../components/Header/Header.jsx"
import Footer from "./../../components/Footer/Footer.jsx"

function EdicaoAdm() {
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
                    <h1 className={css.titulo}>Edição ADM</h1>

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
                                <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
                                    <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
                                </svg>
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

export default EdicaoAdm;