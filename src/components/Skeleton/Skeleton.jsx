import css from "./Skeleton.module.css";

// Bloco que pulsa no lugar do conteúdo enquanto ele carrega
export default function Skeleton({ width, height, radius, className = "" }) {
    return <span aria-hidden="true" className={`${css.skeleton} ${className}`} style={{ width, height, borderRadius: radius }} />;
}

// Envolve os skeletons e anuncia o carregamento para leitores de tela
export function Carregando({ texto = "Carregando...", className, children }) {
    return (
        <div role="status" className={className}>
            <span className="visually-hidden">{texto}</span>
            {children}
        </div>
    );
}
