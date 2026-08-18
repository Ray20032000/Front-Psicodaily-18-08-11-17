import css from "./Footer.module.css";

function Footer() {

    return (

        <footer className={css.footer}>

            <div className={css.conteudo}>

                <div className={css.bloco}>

                    <h3>CONTATO</h3>

                    <p>
                        EMAIL: PSICOdaily@gmail.com
                    </p>

                    <p>
                        TELEFONE: (18) 93452-8042
                    </p>

                </div>


                <div className={css.bloco}>

                    <h3>SOBRE O SISTEMA</h3>

                    <p>
                        Uma plataforma desenvolvida para conectar pacientes
                        e psicólogos, oferecendo agendamento de consultas,
                        acompanhamento terapêutico e monitoramento do
                        bem-estar emocional em um ambiente seguro e integrado.
                    </p>

                </div>


                <div className={css.logoArea}>

                    <img
                        src="/logo.png"
                        alt="Logo PSICOdaily"
                    />

                    <div className={css.direitos}>

                        <p>
                            Política de Privacidade | Termos de uso
                        </p>

                        <p>
                            ©2026 PSICOdaily – Todos os direitos reservados
                        </p>

                    </div>

                </div>

            </div>

        </footer>

    );
}

export default Footer;