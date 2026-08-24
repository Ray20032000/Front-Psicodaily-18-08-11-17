import Header from "../../components/Header/Header.jsx"
import Footer from "../../components/Footer/Footer.jsx"
import {useNavigate} from "react-router-dom"
import css from "./Erro404.module.css"

function Erro404() {
    const navigate = useNavigate();
    return (
        <div className="min-vh-100 d-flex flex-column">
            <Header />
            <div className={`${css.countainer} flex-grow-1`}>
                <h1 className={css.ops}>Ops!</h1>

                <div className={css.cima}>
                    <img className={css.imagem} src="/erro.png" alt="Imagem de erro" />
                </div>
                <h2 className={css.naoencontrada}>A página não foi encontrada</h2>
                <p className={css.descanso}>Parece que esta página resolveu tirar um dia de descanso.</p>
                <button className={css.voltar} onClick={() => navigate(-1)}>
                    Voltar
                </button>
            </div>
            <Footer />
        </div>
    )
}

export default Erro404;