import { formatarCentavos, reaisParaCentavos } from "../../utils/dinheiro.js";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import api from "../../config/api.js";
import css from "./Marketplace.module.css";
import Sidebar from "../../components/Sidebar/Sidebar.jsx";
import { toast } from "sonner";

function dataMinima() {
    const data = new Date();
    data.setMinutes(data.getMinutes() - data.getTimezoneOffset());
    return data.toISOString().slice(0, 10);
}

function fimDaConsulta(data, horario) {
    const [hora, minuto] = horario.split(":").map(Number);
    const inicio = new Date(`${data}T00:00:00`);
    inicio.setHours(hora + 1, minuto, 0, 0);
    const dataFormatada = [inicio.getFullYear(), String(inicio.getMonth() + 1).padStart(2, "0"), String(inicio.getDate()).padStart(2, "0")].join("-");
    return `${dataFormatada}T${String(inicio.getHours()).padStart(2, "0")}:${String(inicio.getMinutes()).padStart(2, "0")}:00`;
}

export default function Marketplace() {
    const navigate = useNavigate();
    const [profissionais, setProfissionais] = useState([]);
    const [filtros, setFiltros] = useState({ nome: "", especialidade: "", preco_max: "", data: "", horario: "" });
    const [selecionado, setSelecionado] = useState(null);
    const [cobranca, setCobranca] = useState(null);

    async function carregarProfissionais() {
        const parametros = new URLSearchParams({ page_size: "100" });
        if (filtros.nome) parametros.set("nome", filtros.nome);
        if (filtros.especialidade) parametros.set("especialidade", filtros.especialidade);
        if (filtros.preco_max) parametros.set("preco_max", String(reaisParaCentavos(filtros.preco_max)));
        if (filtros.data && filtros.horario) {
            const inicio = `${filtros.data}T${filtros.horario}`;
            parametros.set("disponibilidade_inicio", inicio);
            parametros.set("disponibilidade_fim", fimDaConsulta(filtros.data, filtros.horario).slice(0, 16));
        }

        const resposta = await fetch(`${api}/profissionais/?${parametros}`, { credentials: "include" });
        const retorno = await resposta.json();
        if (!resposta.ok) {
            toast.error(retorno.error || "Nao foi possivel carregar profissionais.");
            return;
        }
        setProfissionais(retorno.profissionais || []);
    }

    useEffect(() => {
        carregarProfissionais();
    }, []);

    async function agendar(event) {
        event.preventDefault();
        if (!filtros.data || !filtros.horario) {
            toast.warning("Escolha a data e o horario da consulta.");
            return;
        }

        const inicio = `${filtros.data}T${filtros.horario}:00`;
        const resposta = await fetch(`${api}/consultas/`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id_profissional: selecionado.id_usuario,
                timestamp_inicio: inicio,
                timestamp_fim: fimDaConsulta(filtros.data, filtros.horario)
            })
        });
        const retorno = await resposta.json();
        if (!resposta.ok) {
            toast.error(retorno.error || "Nao foi possivel agendar a consulta.");
            return;
        }
        setSelecionado(null);
        toast.success("Consulta agendada. Gerando o Pix para confirmar o pagamento.");
        await criarCobranca(retorno.sessao.sessao_id);
    }

    async function criarCobranca(idSessao) {
        const resposta = await fetch(`${api}/pagamentos/cobranca`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_sessao: idSessao })
        });
        const retorno = await resposta.json();
        if (!resposta.ok) {
            toast.warning(retorno.error || "Consulta criada, mas nao foi possivel gerar o Pix.");
            return;
        }
        setCobranca(retorno.cobranca);
    }

    return (
        <div className={`${css.pagina} min-vh-100 d-flex flex-column`}>
            <Header />
            <main className={css.conteudo}>
                <Sidebar />
                <section className={css.area}>
                    <div className={css.cabecalho}>
                        <p className={css.kicker}>Cuidado continuo</p>
                        <h1>Encontre seu profissional</h1>
                        <p>Compare especialidades, valores e horarios antes de marcar.</p>
                    </div>
                    <form className={css.filtros} onSubmit={(event) => { event.preventDefault(); carregarProfissionais(); }}>
                        <input placeholder="Pesquisar por nome" value={filtros.nome} onChange={(event) => setFiltros({ ...filtros, nome: event.target.value })} />
                        <select value={filtros.especialidade} onChange={(event) => setFiltros({ ...filtros, especialidade: event.target.value })}>
                            <option value="">Todas as especialidades</option>
                            <option value="Psicologia">Psicologia</option>
                            <option value="Psiquiatria">Psiquiatria</option>
                        </select>
                        <input type="number" min="0.01" step="0.01" placeholder="Valor maximo" value={filtros.preco_max} onChange={(event) => setFiltros({ ...filtros, preco_max: event.target.value })} />
                        <input type="date" min={dataMinima()} value={filtros.data} onChange={(event) => setFiltros({ ...filtros, data: event.target.value })} />
                        <input type="time" value={filtros.horario} onChange={(event) => setFiltros({ ...filtros, horario: event.target.value })} />
                        <button type="submit">Pesquisar</button>
                    </form>
                    {cobranca && <div className={css.pix}><strong>Pix criado</strong><span>Status: {cobranca.status === 1 ? "Pago" : "Pendente"}</span><code>{cobranca.codigo_pagamento}</code></div>}
                    <div className={css.lista}>
                        {profissionais.map((profissional) => (
                            <article className={css.profissional} key={profissional.id_usuario}>
                                <div><p className={css.especialidade}>{profissional.especialidade || "Profissional"}</p><h2>{profissional.nome}</h2><p>{profissional.descricao || "Atendimento individualizado."}</p><small>{profissional.conselho_tipo} {profissional.conselho_numero}</small></div>
                                <div className={css.acoes}><strong>{formatarCentavos(profissional.preco_centavos)}</strong><button type="button" onClick={() => setSelecionado(profissional)}>Agendar</button></div>
                            </article>
                        ))}
                        {!profissionais.length && <p>Nenhum profissional encontrado com esses filtros.</p>}
                    </div>
                </section>
            </main>
            <Footer />
            {selecionado && <div className={css.modal}><form onSubmit={agendar}><button type="button" className={css.fechar} onClick={() => setSelecionado(null)} aria-label="Fechar"><X size={20} strokeWidth={1.8} aria-hidden="true" /></button><p className={css.kicker}>Agendamento</p><h2>{selecionado.nome}</h2><p>Escolha um horario de uma hora para sua consulta.</p><label>Data<input required type="date" min={dataMinima()} value={filtros.data} onChange={(event) => setFiltros({ ...filtros, data: event.target.value })} /></label><label>Horario<input required type="time" value={filtros.horario} onChange={(event) => setFiltros({ ...filtros, horario: event.target.value })} /></label><button type="submit">Confirmar e gerar Pix</button></form></div>}
        </div>
    );
}
