import styles from "./Home.module.css";
import Header from "../../components/Header/Header.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import { useNavigate } from "react-router-dom";

function Home() {

    const navigate = useNavigate();

    return (
        <div className={`${styles.pagina} min-vh-100 d-flex flex-column`}>

            <Header />

            <main className={`${styles.container} container-fluid px-0`}>

                <section className={`${styles.inicio} container`}>

                    <div className={`${styles.titulos} container-fluid px-0`}>
                        <h1>Cuidar da sua mente</h1>
                        <h2>nunca foi tão simples!</h2>
                    </div>

                    <p className={`${styles.subtitulo} col-lg-7`}>
                        Cuide da sua saúde mental com conteúdos, exercícios e
                        acompanhamento no seu ritmo.
                    </p>

                    <img
                        className={styles.img1}
                        src="/imagemhome1.png"
                        alt="Pessoa cuidando da saúde mental"
                    />

                    <button
                        className={styles.botao}
                        onClick={() => navigate("/cadastropaciente")}
                    >
                        Começar agora!
                    </button>

                </section>


                <section className={`${styles.quemSomos} container`}>

                    <h3 className={styles.quem}>Quem somos?</h3>
                    <div className={styles.linha}></div>
                    <p>
                        O Psicodaily, desenvolvido pelo Grupo Verk, é uma plataforma que une
                        tecnologia e saúde mental para oferecer um acompanhamento mais
                        acessível, organizado e contínuo. Por meio de registros diários e consultas
                        online com psicólogos e psiquiatras, auxilia usuários e profissionais no
                        cuidado da saúde emocional, promovendo um atendimento mais
                        humanizado e baseado em informações do dia a dia.
                    </p>

                </section>


                <section className={`${styles.profissionais} container`}>

                    <h3>
                        Aqui temos profissionais
                        capacitados para cuidar
                        do seu bem-estar!
                    </h3>

                    <img
                        className={styles.img2}
                        src="/imagemhome2.png"
                        alt="Profissionais capacitados"
                    />

                </section>


                <section className={`${styles.plataforma} container-fluid px-0`}>

                    <div className={`${styles.tituloPlataforma} container`}>

                        <h3>
                            A plataforma completa para a sua saúde mental
                        </h3>

                        <div className={styles.linha}></div>

                    </div>

                    <img
                        className={styles.banner}
                        src="/banner.png"
                        alt="Recursos da plataforma Psicodaily"
                    />

                </section>

            </main>

            <Footer />

        </div>
    );
}

export default Home;