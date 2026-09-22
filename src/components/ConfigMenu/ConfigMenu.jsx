import css from "./ConfigMenu.module.css";
export default function ConfigMenu() {
    return (
            <div className={css.menu}>
                <a href="/src/pages" className={css.botao}>Edição</a>
                <a href="/src/pages/Home" className={css.sair}>Sair</a>
            </div>
        )
}