import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import css from "./AuthLayout.module.css";

// ponytail: placeholder aleatório, trocar pela foto definitiva (ex.: "/auth.jpg" em public/)
const IMAGEM = "https://picsum.photos/seed/psicodaily/900/1200";

export default function AuthLayout({ children }) {
    return (
        <div className={css.pagina}>
            <div className={css.card}>
                <aside className={css.lateral}>
                    <img src={IMAGEM} alt="" className={css.imagem} />

                    <Link to="/" className={css.marca}>
                        <img src="/logo.png" alt="PSICOdaily" />
                    </Link>

                    <p className={css.frase}>
                        Cuidar da mente começa<br />com um pequeno passo
                    </p>
                </aside>

                <main className={css.conteudo}>
                    <div className={css.formulario}>
                        <Link to="/" className={css.marcaMobile}>
                            <img src="/logo.png" alt="PSICOdaily" />
                        </Link>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

export function InputSenha(props) {
    const [visivel, setVisivel] = useState(false);
    const Icone = visivel ? EyeOff : Eye;

    return (
        <div className={css.senha}>
            <input {...props} type={visivel ? "text" : "password"} />
            <button
                type="button"
                onClick={() => setVisivel(!visivel)}
                aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
            >
                <Icone size={18} />
            </button>
        </div>
    );
}
