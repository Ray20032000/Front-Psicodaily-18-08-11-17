import Header from "../components/Header/Header.jsx"
import Footer from "../components/Footer/Footer.jsx"
import {useNavigate} from "react-router-dom"
import css from "../styles/Erro404.module.css"

function Erro404() {
    const navigate = useNavigate();
    return (
        <div>
            <Header />
            <div className={css.countainer}>
                <h1 className={css.ops}>Ops!</h1>

                <div className={css.cima}>
                    <h3 className={css.erro}>Erro </h3>
                    <img className={css.imagem}
                         src={"./../public/erro.png"}
                         alt={"imagem de erro"}
                    />
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