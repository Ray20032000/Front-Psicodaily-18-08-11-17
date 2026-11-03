import { useState } from "react";
import { Banknote, CreditCard, QrCode } from "lucide-react";
import Seletor from "../Seletor/Seletor.jsx";
import css from "./MetodoPagamento.module.css";

const metodos = [
    { valor: "PIX", rotulo: "Pix", detalhe: "QR Code ou código", Icone: QrCode },
    { valor: "BOLETO", rotulo: "Boleto", detalhe: "Abre o PDF", Icone: Banknote },
    { valor: "CARTAO", rotulo: "Cartão", detalhe: "Resultado na hora", Icone: CreditCard },
];
const tipos = [{ valor: "CREDITO", rotulo: "Crédito" }, { valor: "DEBITO", rotulo: "Débito" }];
const opcoesParcelas = Array.from({ length: 15 }, (_, indice) => ({
    valor: String(indice + 1),
    rotulo: indice ? `${indice + 1}x` : "À vista",
}));
const camposSensiveis = ["numero_cartao", "validade", "cvv"];

// "122030" vira "12/2030" enquanto digita; a barra só aparece depois do mês, então o Backspace não trava nela
function mascaraValidade(evento) {
    const digitos = evento.target.value.replace(/\D/g, "").slice(0, 6);
    evento.target.value = digitos.length > 2 ? `${digitos.slice(0, 2)}/${digitos.slice(2)}` : digitos;
}

// Os campos do cartão não têm estado no React: os dados só existem no formulário até o envio
export function lerPagamento(formulario) {
    const dados = new FormData(formulario);
    const metodo = dados.get("metodo");
    if (metodo !== "CARTAO") return { metodo };
    const cartao = {
        numero_cartao: dados.get("numero_cartao").replace(/\s/g, ""),
        validade: dados.get("validade").trim(),
        cvv: dados.get("cvv").trim(),
        tipo: dados.get("tipo"),
    };
    if (dados.get("parcelas")) cartao.parcelas = Number(dados.get("parcelas"));
    return { metodo, cartao };
}

export function limparCartao(formulario) {
    camposSensiveis.forEach((campo) => {
        if (formulario.elements[campo]) formulario.elements[campo].value = "";
    });
}

// Precisa estar dentro de um <form>; `parcelas` mostra a escolha de parcelas no crédito
export default function MetodoPagamento({ parcelas = false, desabilitado = false }) {
    const [metodo, setMetodo] = useState("PIX");
    const [tipo, setTipo] = useState("CREDITO");
    const [quantidade, setQuantidade] = useState("1");

    return <fieldset className={css.metodo} disabled={desabilitado}>
        <legend>Forma de pagamento</legend>
        <div className={css.opcoes}>
            {metodos.map(({ valor, rotulo, detalhe, Icone }) => <label key={valor} className={css.opcao}>
                <input type="radio" name="metodo" value={valor} checked={metodo === valor} onChange={() => setMetodo(valor)} />
                <Icone size={18} strokeWidth={1.8} aria-hidden="true" />
                <strong>{rotulo}</strong>
                <small>{detalhe}</small>
            </label>)}
        </div>

        {metodo === "CARTAO" && <div className={css.cartao}>
            <label className={css.largo}>Número do cartão
                <input name="numero_cartao" required inputMode="numeric" autoComplete="cc-number" maxLength={19}
                    pattern="\d{4} ?\d{4} ?\d{4} ?\d{4}" title="16 dígitos" placeholder="0000 0000 0000 0000" />
            </label>
            <label>Validade
                <input name="validade" required inputMode="numeric" autoComplete="cc-exp" maxLength={7}
                    pattern="(0[1-9]|1[0-2])/\d{4}" title="Mês e ano no formato MM/AAAA" placeholder="MM/AAAA"
                    onInput={mascaraValidade} />
            </label>
            <label>CVV
                <input name="cvv" required inputMode="numeric" autoComplete="cc-csc" maxLength={3}
                    pattern="\d{3}" title="3 dígitos" placeholder="000" />
            </label>
            <div className={css.campo}>
                <span>Tipo</span>
                <Seletor value={tipo} opcoes={tipos} aria-label="Tipo do cartão" onChange={(valor) => {
                    setTipo(valor);
                    setQuantidade("1");
                }} />
                <input type="hidden" name="tipo" value={tipo} />
            </div>
            {/* Débito é sempre à vista */}
            {parcelas && tipo === "CREDITO" && <div className={css.campo}>
                <span>Parcelas</span>
                <Seletor value={quantidade} opcoes={opcoesParcelas} aria-label="Parcelas" onChange={setQuantidade} />
                <input type="hidden" name="parcelas" value={quantidade} />
            </div>}
        </div>}
    </fieldset>;
}
