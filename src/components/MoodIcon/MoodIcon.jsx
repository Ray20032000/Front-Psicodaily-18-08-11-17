import { Angry, Frown, Laugh, Meh, Smile } from "lucide-react";

export const humores = [
    { nome: "Muito Mal", Icone: Angry },
    { nome: "Mal", Icone: Frown },
    { nome: "Neutro", Icone: Meh },
    { nome: "Bem", Icone: Smile },
    { nome: "Muito Bem", Icone: Laugh }
];

export default function MoodIcon({ humor, size = 20 }) {
    const Icone = humores.find((item) => item.nome === humor)?.Icone || Meh;
    return <Icone size={size} strokeWidth={1.8} aria-hidden="true" />;
}
