import { Monitor, Moon, Sun } from "lucide-react";

const midia = matchMedia("(prefers-color-scheme: dark)");

export const temas = [
    { valor: "claro", rotulo: "Claro", Icone: Sun },
    { valor: "escuro", rotulo: "Escuro", Icone: Moon },
    { valor: "sistema", rotulo: "Sistema", Icone: Monitor },
];

export const temaSalvo = () => localStorage.getItem("tema") || "sistema";

// "sistema" segue o SO; data-bs-theme também troca os componentes do Bootstrap
export function aplicarTema(tema = temaSalvo()) {
    localStorage.setItem("tema", tema);
    const escuro = tema === "escuro" || (tema === "sistema" && midia.matches);
    document.documentElement.dataset.bsTheme = escuro ? "dark" : "light";
}

midia.addEventListener("change", () => aplicarTema());
