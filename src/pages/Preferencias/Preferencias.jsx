import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import UserAvatar from "../../components/UserAvatar/UserAvatar.jsx";
import { useUsuario } from "../../contexts/UsuarioContext.jsx";
import api from "../../config/api.js";
import css from "./Preferencias.module.css";
import Skeleton, { Carregando } from "../../components/Skeleton/Skeleton.jsx";
import { centavosParaReais, formatarCentavos, reaisParaCentavos } from "../../utils/dinheiro.js";
import { aplicarTema, temaSalvo, temas } from "../../utils/tema.js";
import { abordagens, nomesModalidade } from "../../utils/profissionais.js";
import Seletor from "../../components/Seletor/Seletor.jsx";

const campos = [
    { nome: "nome", titulo: "Nome", tipo: "text", maxLength: 150, minLength: 3 },
    { nome: "email", titulo: "E-mail", tipo: "email", maxLength: 255 },
    { nome: "telefone", titulo: "Telefone", tipo: "tel", maxLength: 20 },
    { nome: "cpf", titulo: "CPF", tipo: "text", maxLength: 11, minLength: 11, inputMode: "numeric" },
];

// Só para PSICOLOGO/PSIQUIATRA, salvos em PATCH /profissionais/me
const camposAtendimento = [
    { nome: "preco_hora", titulo: "Valor por sessão", dica: "Em reais, ex.: 150,00", tipo: "text", maxLength: 10, inputMode: "decimal" },
    { nome: "descricao", titulo: "Descrição", dica: "Aparece no seu perfil para os pacientes", maxLength: 1000, minLength: 10, multilinha: true },
    {
        nome: "abordagem", titulo: "Abordagem terapêutica", dica: "Usada nos filtros da busca",
        opcoes: [{ valor: "", rotulo: "Não informar" }, ...abordagens.map(abordagem => ({ valor: abordagem, rotulo: abordagem }))],
    },
    {
        nome: "modalidade", titulo: "Modalidade", dica: "Usada nos filtros da busca",
        opcoes: [{ valor: "", rotulo: "Não informar" }, ...Object.entries(nomesModalidade).map(([valor, rotulo]) => ({ valor, rotulo }))],
    },
];

const papeis = {
    PACIENTE: "Paciente",
    PSICOLOGO: "Psicólogo(a)",
    PSIQUIATRA: "Psiquiatra",
    ADMIN: "Administrador(a)",
};

const formatarCpf = (cpf) => cpf?.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");

export default function Preferencias() {
    const { usuario, carregando, recarregar, recarregarFoto } = useUsuario();
    const [editando, setEditando] = useState(null);
    const [valorEditado, setValorEditado] = useState("");
    const [foto, setFoto] = useState(null);
    const [previa, setPrevia] = useState(null);
    const [salvando, setSalvando] = useState(false);
    // null = carregando, false = falhou
    const [atendimento, setAtendimento] = useState(null);
    const [tentativaAtendimento, setTentativaAtendimento] = useState(0);
    const [tema, setTema] = useState(temaSalvo);
    const profissional = ["PSICOLOGO", "PSIQUIATRA"].includes(usuario?.tipo_usuario);

    useEffect(() => {
        if (!profissional) return;
        setAtendimento(null);
        const controller = new AbortController();
        fetch(`${api}/profissionais/${usuario.id_usuario}`, { credentials: "include", signal: controller.signal })
            .then(async resposta => {
                const retorno = await resposta.json();
                if (!resposta.ok) throw new Error(retorno.error);
                setAtendimento(retorno.profissionais);
            })
            .catch(erro => {
                if (erro.name !== "AbortError") setAtendimento(false);
            });
        return () => controller.abort();
    }, [profissional, usuario?.id_usuario, tentativaAtendimento]);

    useEffect(() => {
        if (!foto) {
            setPrevia(null);
            return;
        }
        const url = URL.createObjectURL(foto);
        setPrevia(url);
        return () => URL.revokeObjectURL(url);
    }, [foto]);

    function iniciarEdicao(campo, valor) {
        setEditando(campo);
        setValorEditado(valor || "");
    }

    function cancelarEdicao() {
        setEditando(null);
        setValorEditado("");
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
            setAtendimento(atual => campo === "preco_hora" ? { ...atual, preco_centavos: centavos } : { ...atual, [campo]: valor || null });
            setEditando(null);
        } catch (erro) {
            toast.error(erro.message || "Não foi possível salvar a alteração.");
        } finally {
            setSalvando(false);
        }
    }

    async function salvarFoto() {
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

    function trocarTema(valor) {
        setTema(valor);
        aplicarTema(valor);
    }

    // Linha "rótulo | valor | Editar"; ao editar, vira um formulário na mesma linha
    function linhaEditavel(campo, valor, salvar, exibir = valor) {
        const Entrada = campo.multilinha ? "textarea" : "input";
        const id = `preferencia-${campo.nome}`;
        return <li className={css.linha} key={campo.nome}>
            <div className={css.rotulo}>
                <label htmlFor={id}>{campo.titulo}</label>
                {campo.dica && <span>{campo.dica}</span>}
            </div>
            {editando === campo.nome ? <form className={css.edicao} onSubmit={evento => salvar(evento, campo.nome)}>
                {campo.opcoes ? <Seletor id={id} className={css.entrada} value={valorEditado} onChange={setValorEditado} opcoes={campo.opcoes} /> : <Entrada
                    id={id}
                    className={css.entrada}
                    type={campo.multilinha ? undefined : campo.tipo}
                    rows={campo.multilinha ? 4 : undefined}
                    inputMode={campo.inputMode}
                    maxLength={campo.maxLength}
                    minLength={campo.minLength}
                    required
                    autoFocus
                    value={valorEditado}
                    onChange={evento => setValorEditado(campo.nome === "cpf" ? evento.target.value.replace(/\D/g, "").slice(0, 11) : evento.target.value)}
                    onKeyDown={evento => evento.key === "Escape" && cancelarEdicao()}
                />}
                <div className={css.acoes}>
                    <button type="button" className={css.botaoSecundario} onClick={cancelarEdicao}>Cancelar</button>
                    <button type="submit" className={css.botaoPrimario} disabled={salvando}>{salvando ? "Salvando..." : "Salvar"}</button>
                </div>
            </form> : <>
                <span className={`${css.valor} ${campo.multilinha ? css.valorLongo : ""}`}>
                    {exibir || <span className={css.vazio}>Não informado</span>}
                </span>
                <button type="button" className={css.botaoTexto} onClick={() => iniciarEdicao(campo.nome, valor)} aria-label={`Editar ${campo.titulo}`}>
                    Editar
                </button>
            </>}
        </li>;
    }

    function linhaCarregando(titulo) {
        return <li className={css.linha} key={titulo}>
            <div className={css.rotulo}><span className={css.rotuloTexto}>{titulo}</span></div>
            <Skeleton width="45%" height="16px" />
        </li>;
    }

    function secao(id, titulo, descricao, conteudo) {
        return <section className={css.card} aria-labelledby={id}>
            <header className={css.cabecalhoCard}>
                <h2 id={id}>{titulo}</h2>
                <p>{descricao}</p>
            </header>
            {conteudo}
        </section>;
    }

    return <main className={css.pagina}>
        <header className={css.cabecalho}>
            <h1>Preferências</h1>
            <p>Gerencie seus dados, sua foto e a aparência do app.</p>
        </header>

        <section className={`${css.card} ${css.perfil}`} aria-label="Perfil">
            {carregando ? <Carregando texto="Carregando perfil..." className={css.perfilConteudo}>
                <Skeleton width="72px" height="72px" radius="50%" />
                <div className={css.identidade}>
                    <Skeleton width="180px" height="20px" />
                    <Skeleton width="220px" height="14px" />
                </div>
            </Carregando> : <div className={css.perfilConteudo}>
                <div className={css.avatar}>
                    <UserAvatar currentUser src={previa} />
                </div>
                <div className={css.identidade}>
                    <h2>{usuario?.nome}</h2>
                    <span className={css.email}>{usuario?.email}</span>
                    {papeis[usuario?.tipo_usuario] && <span className={css.papel}>{papeis[usuario.tipo_usuario]}</span>}
                </div>
                <div className={css.acoesFoto}>
                    <input id="foto" type="file" accept="image/jpeg,.jpg,.jpeg" className="visually-hidden" onChange={evento => { setFoto(evento.target.files?.[0] || null); evento.target.value = ""; }} />
                    {foto ? <>
                        <button type="button" className={css.botaoSecundario} onClick={() => setFoto(null)} disabled={salvando}>Cancelar</button>
                        <button type="button" className={css.botaoPrimario} onClick={salvarFoto} disabled={salvando}>{salvando ? "Salvando..." : "Salvar foto"}</button>
                    </> : <>
                        <label htmlFor="foto" className={css.botaoSecundario}>
                            <Camera size={16} strokeWidth={1.8} aria-hidden="true" /> Alterar foto
                        </label>
                        <span className={css.dicaFoto}>JPG ou JPEG</span>
                    </>}
                </div>
            </div>}
        </section>

        {secao("secao-dados", "Dados pessoais", "Usados para contato e identificação nas sessões.",
            <ul className={css.lista}>
                {carregando
                    ? campos.map(campo => linhaCarregando(campo.titulo))
                    : campos.map(campo => linhaEditavel(campo, usuario?.[campo.nome], salvarCampo, campo.nome === "cpf" ? formatarCpf(usuario?.cpf) : usuario?.[campo.nome]))}
            </ul>
        )}

        {profissional && secao("secao-atendimento", "Atendimento", "Como você aparece para os pacientes no marketplace.",
            <ul className={css.lista}>
                {atendimento ? <>
                    <li className={css.linha}>
                        <div className={css.rotulo}>
                            <span className={css.rotuloTexto}>Conselho</span>
                            <span>Não pode ser alterado</span>
                        </div>
                        <span className={css.valor}>{atendimento.conselho_tipo} {atendimento.conselho_numero}</span>
                    </li>
                    {linhaEditavel(camposAtendimento[0], String(centavosParaReais(atendimento.preco_centavos)).replace(".", ","), salvarAtendimento, formatarCentavos(atendimento.preco_centavos))}
                    {linhaEditavel(camposAtendimento[1], atendimento.descricao, salvarAtendimento)}
                    {linhaEditavel(camposAtendimento[2], atendimento.abordagem, salvarAtendimento)}
                    {linhaEditavel(camposAtendimento[3], atendimento.modalidade, salvarAtendimento, nomesModalidade[atendimento.modalidade])}
                </> : atendimento === false ? <li className={css.linha} role="alert">
                    <span className={css.vazio}>Não foi possível carregar os dados de atendimento.</span>
                    <button type="button" className={css.botaoTexto} onClick={() => setTentativaAtendimento(atual => atual + 1)}>Tentar novamente</button>
                </li> : ["Conselho", ...camposAtendimento.map(campo => campo.titulo)].map(linhaCarregando)}
            </ul>
        )}

        {secao("secao-aparencia", "Aparência", "Escolha o tema do app. “Sistema” acompanha o seu dispositivo.",
            <div className={css.temas} role="radiogroup" aria-labelledby="secao-aparencia">
                {temas.map(({ valor, rotulo, Icone }) => (
                    <label key={valor} className={`${css.tema} ${tema === valor ? css.temaAtivo : ""}`}>
                        <input type="radio" name="tema" value={valor} checked={tema === valor} onChange={() => trocarTema(valor)} className="visually-hidden" />
                        <Icone size={20} strokeWidth={1.8} aria-hidden="true" />
                        <span>{rotulo}</span>
                    </label>
                ))}
            </div>
        )}

        {secao("secao-seguranca", "Segurança", "Proteja o acesso à sua conta.",
            <ul className={css.lista}>
                <li className={css.linha}>
                    <div className={css.rotulo}><span className={css.rotuloTexto}>Senha</span></div>
                    <span className={css.valor}>••••••••</span>
                    <Link to="/alterarsenha" className={css.botaoTexto}>Alterar</Link>
                </li>
            </ul>
        )}
    </main>;
}
