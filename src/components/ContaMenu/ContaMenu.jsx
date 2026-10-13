import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DropdownMenu } from "radix-ui";
import { Check, ChevronRight, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useUsuario } from "../../contexts/UsuarioContext.jsx";
import { aplicarTema, temaSalvo, temas } from "../../utils/tema.js";
import UserAvatar from "../UserAvatar/UserAvatar.jsx";
import css from "./ContaMenu.module.css";

// Menu da conta (avatar + nome) com preferências, tema e sair
export default function ContaMenu({ className = "", mostrarNome = true }) {
    const { usuario, sair: encerrarSessao } = useUsuario();
    const navigate = useNavigate();
    const [tema, setTema] = useState(temaSalvo);
    const temaAtual = temas.find(item => item.valor === tema) || temas[2];

    function trocarTema(valor) {
        setTema(valor);
        aplicarTema(valor);
    }

    async function sair() {
        try {
            await encerrarSessao();
            navigate("/login");
        } catch {
            toast.error("Falha ao sair. Tente novamente.");
        }
    }

    return (
        // Relê o tema ao abrir: a página de preferências também pode trocá-lo
        <DropdownMenu.Root modal={false} onOpenChange={aberto => aberto && setTema(temaSalvo())}>
            <DropdownMenu.Trigger className={`${css.gatilho} ${className}`} aria-label="Menu da conta">
                <UserAvatar currentUser className={css.avatar} fallbackClassName={css.avatar} />
                {mostrarNome && <div className="d-none d-md-flex flex-column align-items-start">
                    <span className="fw-semibold">{usuario?.nome}</span>
                    {usuario?.email && <span className="mini-text fw-semibold text-secondary">{usuario.email}</span>}
                </div>}
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content align="end" sideOffset={8} className={css.conteudo}>
                    <div className={css.cabecalho}>
                        <UserAvatar currentUser className={css.avatarGrande} fallbackClassName={css.avatarGrande} />
                        <div className={css.identidade}>
                            <span className="fw-semibold">{usuario?.nome}</span>
                            {usuario?.email && <span className={css.email}>{usuario.email}</span>}
                            <DropdownMenu.Item asChild className={css.link}>
                                <Link to="/preferencias">Ver preferências</Link>
                            </DropdownMenu.Item>
                        </div>
                    </div>

                    <DropdownMenu.Separator className={css.separador} />

                    <DropdownMenu.Sub>
                        <DropdownMenu.SubTrigger className={css.item}>
                            <temaAtual.Icone size={18} strokeWidth={1.8} aria-hidden="true" />
                            <span>Tema: {temaAtual.rotulo}</span>
                            <ChevronRight size={16} className={css.seta} aria-hidden="true" />
                        </DropdownMenu.SubTrigger>
                        <DropdownMenu.Portal>
                            <DropdownMenu.SubContent sideOffset={6} className={css.conteudo}>
                                <DropdownMenu.RadioGroup value={tema} onValueChange={trocarTema}>
                                    {temas.map(({ valor, rotulo, Icone }) => (
                                        <DropdownMenu.RadioItem key={valor} value={valor} className={css.item}>
                                            <Icone size={18} strokeWidth={1.8} aria-hidden="true" />
                                            <span>{rotulo}</span>
                                            <DropdownMenu.ItemIndicator className={css.seta}>
                                                <Check size={16} aria-hidden="true" />
                                            </DropdownMenu.ItemIndicator>
                                        </DropdownMenu.RadioItem>
                                    ))}
                                </DropdownMenu.RadioGroup>
                            </DropdownMenu.SubContent>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Sub>

                    <DropdownMenu.Separator className={css.separador} />

                    <DropdownMenu.Item className={`${css.item} ${css.sair}`} onSelect={sair}>
                        <LogOut size={18} strokeWidth={1.8} aria-hidden="true" />
                        <span>Sair</span>
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}
