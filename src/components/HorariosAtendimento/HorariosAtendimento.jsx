import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import api from "../../config/api.js";
import { useUsuario } from "../../contexts/UsuarioContext.jsx";
import Skeleton from "../Skeleton/Skeleton.jsx";
import css from "./HorariosAtendimento.module.css";

// 0 = domingo, como na API; a lista começa na segunda, como a grade da agenda
const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const ordem = [1, 2, 3, 4, 5, 6, 0];

// Janelas semanais em que o profissional atende: GET /profissionais/<id>/disponibilidade e
// PUT /profissionais/me/disponibilidade, que substitui todas
export default function HorariosAtendimento() {
    const { usuario } = useUsuario();
    const [janelas, setJanelas] = useState(null);
    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [versao, setVersao] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setErro("");
        fetch(`${api}/profissionais/${usuario.id_usuario}/disponibilidade`, { credentials: "include", signal: controller.signal })
            .then(async (resposta) => {
                const dados = await resposta.json().catch(() => null);
                if (!resposta.ok || !Array.isArray(dados?.janelas)) throw new Error(dados?.error || "Não foi possível carregar seus horários.");
                setJanelas(dados.janelas);
            })
            .catch((falha) => { if (!controller.signal.aborted) setErro(falha.message); });
        return () => controller.abort();
    }, [usuario.id_usuario, versao]);

    function alterar(indice, campo, valor) {
        setJanelas((atual) => atual.map((janela, i) => i === indice ? { ...janela, [campo]: valor } : janela));
    }

    // A nova janela começa onde termina a última do dia, para não sobrepor
    function adicionar(dia) {
        const inicio = janelas.filter((janela) => janela.dia_semana === dia)
            .reduce((maior, janela) => janela.fim > maior ? janela.fim : maior, "08:00");
        setJanelas((atual) => [...atual, { dia_semana: dia, inicio, fim: inicio < "18:00" ? "18:00" : "23:59" }]);
    }

    async function salvar(evento) {
        evento.preventDefault();
        setSalvando(true);
        try {
            const resposta = await fetch(`${api}/profissionais/me/disponibilidade`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ janelas }),
            });
            const dados = await resposta.json().catch(() => null);
            if (!resposta.ok) throw new Error(dados?.error || "Não foi possível salvar seus horários.");
            setJanelas(dados.janelas);
            toast.success("Horários de atendimento salvos.");
        } catch (falha) {
            toast.error(falha.message);
        } finally {
            setSalvando(false);
        }
    }

    return <>
        <h2>Horários de atendimento</h2>
        <p className={css.dica}>Os pacientes só conseguem agendar dentro destes horários.</p>
        {erro ? <p role="alert">{erro} <button type="button" onClick={() => setVersao((atual) => atual + 1)}>Tentar novamente</button></p>
            : !janelas ? <Skeleton height="220px" radius="10px" />
                : <form onSubmit={salvar}>
                    {!janelas.length && <p className={css.aviso}>Sem horários cadastrados, seu perfil não mostra horários livres para agendar.</p>}
                    {ordem.map((dia) => <div key={dia} className={css.dia}>
                        <span className={css.nomeDia}>{diasSemana[dia]}</span>
                        <div className={css.janelas}>
                            {janelas.map((janela, indice) => janela.dia_semana === dia && <div key={indice} className={css.janela}>
                                <input type="time" required value={janela.inicio} aria-label={`Início, ${diasSemana[dia]}`}
                                    onChange={(evento) => alterar(indice, "inicio", evento.target.value)} />
                                <span aria-hidden="true">–</span>
                                <input type="time" required min={janela.inicio} value={janela.fim} aria-label={`Fim, ${diasSemana[dia]}`}
                                    onChange={(evento) => alterar(indice, "fim", evento.target.value)} />
                                <button type="button" className={css.remover} aria-label={`Remover horário de ${diasSemana[dia]}`}
                                    onClick={() => setJanelas((atual) => atual.filter((_, i) => i !== indice))}>
                                    <X size={16} aria-hidden="true" />
                                </button>
                            </div>)}
                            <button type="button" className={css.adicionar} onClick={() => adicionar(dia)}>
                                <Plus size={14} aria-hidden="true" /> Adicionar
                            </button>
                        </div>
                    </div>)}
                    <button type="submit" className={css.salvar} disabled={salvando}>{salvando ? "Salvando..." : "Salvar horários"}</button>
                </form>}
    </>;
}
