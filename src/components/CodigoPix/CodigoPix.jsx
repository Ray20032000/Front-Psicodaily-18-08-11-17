import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Clipboard } from "lucide-react";
import { toast } from "sonner";
import css from "./CodigoPix.module.css";

export default function CodigoPix({ codigo }) {
    const [copiado, setCopiado] = useState(false);

    async function copiar() {
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(codigo);
            } else {
                // Sem HTTPS o navegador não oferece a API de área de transferência
                const campo = document.createElement("textarea");
                campo.value = codigo;
                campo.style.position = "fixed";
                campo.style.opacity = "0";
                document.body.appendChild(campo);
                campo.select();
                try {
                    if (!document.execCommand("copy")) throw new Error("Não foi possível copiar.");
                } finally {
                    document.body.removeChild(campo);
                }
            }
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000);
        } catch {
            toast.error("Não foi possível copiar o código Pix.");
        }
    }

    return <>
        <div className={css.areaQrCode}>
            {codigo
                ? <QRCodeSVG value={codigo} size={235} marginSize={4} title="QR Code Pix" role="img" className={css.qrCode} />
                : <div className={css.semQrCode}>QR Code não disponível.</div>}
        </div>
        <p className={css.textoCodigo}>Ou copie o código Pix abaixo</p>
        <div className={css.codigoPix}>
            <input type="text" value={codigo || ""} aria-label="Código Pix" readOnly />
            <button type="button" onClick={copiar} aria-label="Copiar código Pix" title="Copiar código Pix" disabled={!codigo}>
                {copiado ? <Check size={17} strokeWidth={1.8} aria-hidden="true" /> : <Clipboard size={17} strokeWidth={1.8} aria-hidden="true" />}
            </button>
        </div>
        {copiado && <p role="status" className={css.copiado}>Código Pix copiado!</p>}
    </>;
}
