import { Select } from "radix-ui";
import { Check, ChevronDown } from "lucide-react";
import css from "./Seletor.module.css";

// O Radix não aceita "" como valor de item; a opção vazia usa um valor interno
const VAZIO = "__vazio__";
const paraRadix = (valor) => (String(valor) === "" ? VAZIO : String(valor));

// Select estilizado: opcoes = [{ valor, rotulo }], onChange recebe o valor (string)
export default function Seletor({ value, onChange, opcoes, id, className = "", "aria-label": ariaLabel }) {
    return (
        <Select.Root value={paraRadix(value)} onValueChange={(valor) => onChange(valor === VAZIO ? "" : valor)}>
            <Select.Trigger id={id} aria-label={ariaLabel} className={`${css.gatilho} ${className}`}>
                <Select.Value />
                <Select.Icon className={css.icone}>
                    <ChevronDown size={16} strokeWidth={1.8} aria-hidden="true" />
                </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
                <Select.Content position="popper" sideOffset={6} className={css.conteudo}>
                    <Select.Viewport className={css.viewport}>
                        {opcoes.map(({ valor, rotulo }) => (
                            <Select.Item key={paraRadix(valor)} value={paraRadix(valor)} className={css.item}>
                                <Select.ItemText>{rotulo}</Select.ItemText>
                                <Select.ItemIndicator className={css.indicador}>
                                    <Check size={14} strokeWidth={2} aria-hidden="true" />
                                </Select.ItemIndicator>
                            </Select.Item>
                        ))}
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    );
}
