import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    ArrowRight,
    BadgeCheck,
    Check,
    Crown,
    Headphones,
    Sparkles,
    Star,
    X,
} from "lucide-react";
import css from "./Assinaturas.module.css";

const planos = [
    {
        id: "essencial",
        nome: "Essencial",
        descricao: "Sua presença profissional no marketplace.",
        preco: 50,
        icone: Star,
        destaque: false,
        beneficios: [
            "Perfil profissional no marketplace",
            "Cadastro de especialidades e abordagens",
            "Divulgação de modalidades e preços",
            "Recebimento de solicitações de pacientes",
            "Recursos básicos de agenda",
        ],
    },
    {
        id: "profissional",
        nome: "Profissional",
        descricao: "Mais ferramentas para desenvolver sua presença.",
        preco: 100,
        icone: Sparkles,
        destaque: true,
        beneficios: [
            "Todos os benefícios do Essencial",
            "Perfil com personalização ampliada",
            "Estatísticas de visualizações do perfil",
            "Relatórios de desempenho",
            "Ferramentas adicionais para organizar a agenda",
        ],
    },
    {
        id: "premium",
        nome: "Premium",
        descricao: "Recursos avançados para sua atuação profissional.",
        preco: 150,
        icone: Crown,
        destaque: false,
        beneficios: [
            "Todos os benefícios do Profissional",
            "Destaque visual identificado como patrocinado",
            "Relatórios avançados de desempenho",
            "Personalização ampliada do perfil",
            "Recursos exclusivos de divulgação",
        ],
    },
];

export default function Assinaturas() {
    const navigate = useNavigate();
    const [planoSelecionado, setPlanoSelecionado] = useState(null);

    function selecionarPlano(plano) {
        setPlanoSelecionado(plano);
    }

    function fecharConfirmacao() {
        setPlanoSelecionado(null);
    }

    return (
        <main className={css.pagina}>
            <div className={css.container}>
                <button
                    type="button"
                    className={css.voltar}
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft size={18} />
                    Voltar
                </button>

                <header className={css.cabecalho}>
                    <div className={css.selo}>
                        <Sparkles size={16} />
                        Planos PSICOdaily
                    </div>

                    <h1>
                        Invista no seu crescimento
                        <span> profissional.</span>
                    </h1>

                    <p>
                        Escolha o plano ideal para sua jornada e tenha acesso a recursos
                        que ajudam a fortalecer sua presença no marketplace.
                    </p>
                </header>

                <section className={css.informacoes}>
                    <div className={css.informacaoItem}>
                        <BadgeCheck size={21} />
                        <span>Planos para diferentes necessidades</span>
                    </div>

                    <div className={css.informacaoItem}>
                        <Check size={21} />
                        <span>Benefícios claros em cada plano</span>
                    </div>

                    <div className={css.informacaoItem}>
                        <Headphones size={21} />
                        <span>Gerencie sua assinatura pela plataforma</span>
                    </div>
                </section>

                <section className={css.secaoPlanos}>
                    <div className={css.tituloSecao}>
                        <div>
                            <h2>Escolha seu plano</h2>
                            <p>Compare os benefícios e encontre o ideal para você.</p>
                        </div>

                        <span className={css.cobranca}>Cobrança mensal</span>
                    </div>

                    <div className={css.gradePlanos}>
                        {planos.map((plano) => {
                            const Icone = plano.icone;
                            const selecionado = planoSelecionado?.id === plano.id;

                            return (
                                <article
                                    key={plano.id}
                                    className={[
                                        css.cartaoPlano,
                                        plano.destaque ? css.cartaoDestaque : "",
                                        selecionado ? css.cartaoSelecionado : "",
                                    ].join(" ")}
                                >
                                    {plano.destaque && (
                                        <div className={css.etiquetaPopular}>
                                            <Sparkles size={15} />
                                            Mais escolhido
                                        </div>
                                    )}

                                    <div className={css.topoPlano}>
                                        <div
                                            className={`${css.iconePlano} ${
                                                plano.destaque ? css.iconeDestaque : ""
                                            }`}
                                        >
                                            <Icone size={25} />
                                        </div>

                                        <h3>{plano.nome}</h3>
                                        <p>{plano.descricao}</p>
                                    </div>

                                    <div className={css.preco}>
                                        <span className={css.simbolo}>R$</span>
                                        <span className={css.valor}>{plano.preco}</span>
                                        <span className={css.periodo}>/mês</span>
                                    </div>

                                    <div className={css.divisor} />

                                    <p className={css.tituloBeneficios}>
                                        O que está incluído:
                                    </p>

                                    <ul className={css.listaBeneficios}>
                                        {plano.beneficios.map((beneficio) => (
                                            <li key={beneficio}>
                        <span className={css.checkBeneficio}>
                          <Check size={15} />
                        </span>
                                                <span>{beneficio}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        type="button"
                                        className={
                                            plano.destaque
                                                ? css.botaoPrincipal
                                                : css.botaoSecundario
                                        }
                                        onClick={() => selecionarPlano(plano)}
                                    >
                                        {selecionado ? "Plano selecionado" : "Escolher plano"}
                                        <ArrowRight size={18} />
                                    </button>

                                    <p className={css.notaPlano}>
                                        Assinatura mensal de R$ {plano.preco},00.
                                    </p>
                                </article>
                            );
                        })}
                    </div>
                </section>

                <section className={css.ajuda}>
                    <div className={css.iconeAjuda}>
                        <Headphones size={23} />
                    </div>

                    <div>
                        <h3>Precisa de ajuda para escolher?</h3>
                        <p>
                            Compare os benefícios de cada plano e escolha aquele que melhor
                            atende às suas necessidades profissionais.
                        </p>
                    </div>
                </section>

                <footer className={css.rodape}>
                    <p>
                        PSICOdaily · Sua jornada profissional, com mais possibilidades.
                    </p>
                    <span>Os benefícios estão sujeitos às condições da plataforma.</span>
                </footer>
            </div>

            {planoSelecionado && (
                <div
                    className={css.fundoModal}
                    onClick={fecharConfirmacao}
                    role="presentation"
                >
                    <section
                        className={css.modal}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="titulo-modal"
                        onClick={(evento) => evento.stopPropagation()}
                    >
                        <button
                            type="button"
                            className={css.fecharModal}
                            onClick={fecharConfirmacao}
                            aria-label="Fechar"
                        >
                            <X size={21} />
                        </button>

                        <div className={css.iconeModal}>
                            <BadgeCheck size={31} />
                        </div>

                        <span className={css.selo}>Plano escolhido</span>

                        <h2 id="titulo-modal">
                            Plano {planoSelecionado.nome}
                        </h2>

                        <p className={css.textoModal}>
                            Você selecionou o plano de assinatura do PSICOdaily por:
                        </p>

                        <div className={css.precoModal}>
                            R$ {planoSelecionado.preco},00
                            <span>/mês</span>
                        </div>

                        <div className={css.avisoIntegracao}>
                            <strong>Próxima etapa</strong>
                            <p>
                                Esta tela é a versão visual do sistema. A contratação e a
                                cobrança ainda precisam ser conectadas ao serviço de pagamento.
                                Nenhuma cobrança foi realizada.
                            </p>
                        </div>

                        <button
                            type="button"
                            className={css.botaoPrincipal}
                            onClick={fecharConfirmacao}
                        >
                            Entendi
                            <Check size={18} />
                        </button>
                    </section>
                </div>
            )}
        </main>
    );
}
