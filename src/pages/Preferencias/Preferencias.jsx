import { useEffect, useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import UserAvatar from "../../components/UserAvatar/UserAvatar.jsx";
import { useUsuario } from "../../contexts/UsuarioContext.jsx";
import api from "../../config/api.js";
import css from "./Preferencias.module.css";
import Skeleton, { Carregando } from "../../components/Skeleton/Skeleton.jsx";
import { centavosParaReais, formatarCentavos, reaisParaCentavos } from "../../utils/dinheiro.js";

const campos = [
    { nome: "nome", titulo: "Nome", tipo: "text", maxLength: 150 },
    { nome: "email", titulo: "E-mail", tipo: "email", maxLength: 255 },
    { nome: "telefone", titulo: "Telefone", tipo: "tel", maxLength: 20 },
    { nome: "cpf", titulo: "CPF", tipo: "text", maxLength: 11, inputMode: "numeric" },
];

// Só para PSICOLOGO/PSIQUIATRA, salvos em PATCH /profissionais/me
const camposAtendimento = [
    { nome: "descricao", titulo: "Descrição", maxLength: 1000, minLength: 10, multilinha: true },
    { nome: "preco_hora", titulo: "Valor por sessão (R$)", tipo: "text", maxLength: 10, inputMode: "decimal" },
];

export default function Preferencias() {
    const { usuario, carregando, recarregar, recarregarFoto } = useUsuario();
    const [editando, setEditando] = useState(null);
    const [valorEditado, setValorEditado] = useState("");
    const [foto, setFoto] = useState(null);
    const [salvando, setSalvando] = useState(false);
    const [atendimento, setAtendimento] = useState(null);
    const profissional = ["PSICOLOGO", "PSIQUIATRA"].includes(usuario?.tipo_usuario);

    useEffect(() => {
        if (!profissional) return;
        const controller = new AbortController();
        fetch(`${api}/profissionais/${usuario.id_usuario}`, { credentials: "include", signal: controller.signal })
            .then(async resposta => {
                const retorno = await resposta.json();
                if (!resposta.ok) throw new Error(retorno.error);
                setAtendimento(retorno.profissionais);
            })
            .catch(erro => {
                if (erro.name !== "AbortError") toast.error("Não foi possível carregar os dados de atendimento.");
            });
        return () => controller.abort();
    }, [profissional, usuario?.id_usuario]);

    function iniciarEdicao(campo, valor) {
        setEditando(campo);
        setValorEditado(valor || "");
    }

    async function salvarCampo(evento, campo) {
        evento.preventDefault();
        const valor = campo === "cpf" ? valorEditado.replace(/\D/g, "") : valorEditado.trim();
        const dadosAtualizados = Object.fromEntries(campos.map(item => [
            item.nome,
            item.nome === campo ? valor : usuario?.[item.nome] || "",
        ]));
        setSalvando(true);
        try {
            const resposta = await fetch(`${api}/usuarios/me`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dadosAtualizados),
            });
            const retorno = await resposta.json();
            if (!resposta.ok) throw new Error(retorno.error || "Não foi possível salvar a alteração.");
            toast.success(`${campos.find(item => item.nome === campo).titulo} atualizado.`);
            setEditando(null);
            recarregar();
        } catch (erro) {
            toast.error(erro.message || "Não foi possível salvar a alteração.");
        } finally {
            setSalvando(false);
        }
    }

    async function salvarAtendimento(evento, campo) {
        evento.preventDefault();
        const valor = valorEditado.trim();
        setSalvando(true);
        try {
            const centavos = campo === "preco_hora" ? reaisParaCentavos(valor) : null;
            const resposta = await fetch(`${api}/profissionais/me`, {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [campo]: valor }),
            });
            const retorno = await resposta.json();
            if (!resposta.ok) throw new Error(retorno.error || "Não foi possível salvar a alteração.");
            toast.success(`${camposAtendimento.find(item => item.nome === campo).titulo} atualizado.`);
            setAtendimento(atual => campo === "preco_hora" ? { ...atual, preco_centavos: centavos } : { ...atual, descricao: valor });
            setEditando(null);
        } catch (erro) {
            toast.error(erro.message || "Não foi possível salvar a alteração.");
        } finally {
            setSalvando(false);
        }
    }

    function cancelarEdicao() {
        setEditando(null);
        setValorEditado("");
    }

    async function salvarFoto() {
        if (!foto) return;
        const formulario = new FormData();
        campos.forEach(campo => formulario.append(campo.nome, usuario?.[campo.nome] || ""));
        formulario.append("imagem", foto);
        setSalvando(true);
        try {
            const resposta = await fetch(`${api}/usuarios/me`, { method: "PUT", credentials: "include", body: formulario });
            const retorno = await resposta.json();
            if (!resposta.ok) throw new Error(retorno.error || "Não foi possível alterar a foto.");
            toast.success("Foto de perfil atualizada.");
            setFoto(null);
            recarregarFoto();
        } catch (erro) {
            toast.error(erro.message || "Não foi possível alterar a foto.");
        } finally {
            setSalvando(false);
        }
    }

    function campoEditavel(campo, valor, salvar, exibir = valor) {
        const Entrada = campo.multilinha ? "textarea" : "input";
        return <div className={`${css.campoPerfil} ${campo.multilinha ? css.campoLargo : ""}`} key={campo.nome}>
            <label htmlFor={`perfil-${campo.nome}`}>{campo.titulo}</label>
            {editando === campo.nome ? <form className={css.edicaoCampo} onSubmit={evento => salvar(evento, campo.nome)}>
                <Entrada
                    id={`perfil-${campo.nome}`}
                    type={campo.multilinha ? undefined : campo.tipo}
                    rows={campo.multilinha ? 4 : undefined}
                    inputMode={campo.inputMode}
                    maxLength={campo.maxLength}
                    minLength={campo.minLength ?? (campo.nome === "nome" ? 3 : campo.nome === "cpf" ? 11 : undefined)}
                    required
                    autoFocus
                    value={valorEditado}
                    onChange={evento => setValorEditado(campo.nome === "cpf" ? evento.target.value.replace(/\D/g, "").slice(0, 11) : evento.target.value)}
                />
                <button type="submit" disabled={salvando} aria-label={`Salvar ${campo.titulo}`} title="Salvar"><Check size={18} /></button>
                <button type="button" onClick={cancelarEdicao} aria-label="Cancelar edição" title="Cancelar"><X size={18} /></button>
            </form> : <div className={css.valorCampo}>
                <span>{exibir || "Não informado"}</span>
                <button type="button" onClick={() => iniciarEdicao(campo.nome, valor)} aria-label={`Editar ${campo.titulo}`} title={`Editar ${campo.titulo}`}><Pencil size={17} /></button>
            </div>}
        </div>;
    }

    return <div>        <main className={css.container}>
            <section className={css.formulario}>
                <img src="/logo.png" alt="PSICOdaily" className={css.logo} />
                <div className={css.linha} />
                <h1 className={css.titulo}>Preferências</h1>
                {carregando ? <Carregando texto="Carregando preferências...">
                    <div className={css.camposPerfil}>
                        {campos.map(campo => <div className={css.campoPerfil} key={campo.nome}>
                            <span>{campo.titulo}</span>
                            <div className={css.valorCampo}><Skeleton width="60%" height="16px" /></div>
                        </div>)}
                    </div>
                    <div className={css.fotoContainer}>
                        <Skeleton width="150px" height="16px" />
                        <Skeleton width="50px" height="50px" radius="50%" />
                    </div>
                </Carregando> : <>
                    <div className={css.camposPerfil}>
                        {campos.map(campo => campoEditavel(campo, usuario?.[campo.nome], salvarCampo))}
                    </div>
                    <div className={css.fotoContainer}>
                        <label htmlFor="foto" className={css.botaoFoto}>Alterar foto de perfil</label>
                        <input id="foto" type="file" accept="image/jpeg,.jpg,.jpeg" className={css.inputFoto} onChange={evento => setFoto(evento.target.files?.[0] || null)} />
                        <div className={css.avatarPreview}><UserAvatar currentUser /></div>
                        {foto && <button type="button" className={css.botaoCadastrar} onClick={salvarFoto} disabled={salvando}>{salvando ? "Salvando..." : "Salvar foto"}</button>}
                    </div>
                    {profissional && <>
                        <div className={css.linha} />
                        <h2 className={css.subtitulo}>Atendimento</h2>
                        <div className={css.camposPerfil}>
                            {atendimento ? <>
                                <div className={css.campoPerfil}>
                                    <span>Conselho</span>
                                    <div className={css.valorCampo}><span>{atendimento.conselho_tipo} {atendimento.conselho_numero}</span></div>
                                </div>
                                {campoEditavel(camposAtendimento[1], String(centavosParaReais(atendimento.preco_centavos)).replace(".", ","), salvarAtendimento, formatarCentavos(atendimento.preco_centavos))}
                                {campoEditavel(camposAtendimento[0], atendimento.descricao, salvarAtendimento)}
                            </> : camposAtendimento.map(campo => <div className={css.campoPerfil} key={campo.nome}>
                                <span>{campo.titulo}</span>
                                <div className={css.valorCampo}><Skeleton width="60%" height="16px" /></div>
                            </div>)}
                        </div>
                    </>}
                </>}
            </section>
        </main>    </div>;
}
