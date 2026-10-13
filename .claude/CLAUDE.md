# Stack
- JavaScript + JSX (sem TypeScript), React 18 + Vite 6
- Bootstrap 5.3 via CDN (`index.html`) — não instalar via npm
- react-router-dom 6, radix-ui (pacote único: `import { Select } from "radix-ui"`)
- lucide-react (ícones), sonner (`toast`), recharts (gráficos)
- React Bits (reactbits.dev) para animações/efeitos: componentes copiados para `src/components/` (variante JS + CSS), não é dependência npm. Já copiados: BlurText (usa `motion`), SpotlightCard, GlareHover

# Comandos
- `npm run dev` / `npm run build` / `npm run preview`
- Sem testes nem lint configurados

# Estrutura
- `src/pages/<Nome>/<Nome>.jsx` — uma pasta por página; rotas em `src/App.jsx`
- `src/components/<Nome>/<Nome>.jsx` + `<Nome>.module.css`
- `src/layouts/AppLayout.jsx` — layout das rotas logadas (dentro de `ProtectedRoute`)
- `src/layouts/SiteLayout.jsx` — layout público (home, quem somos, contato): header com dropdowns, rodapé, tokens `--site-*` e botões
- `src/contexts/UsuarioContext.jsx` — `useUsuario()` (usuário, login/logout)
- `src/hooks/`, `src/utils/` — reutilizar antes de criar (ex.: `utils/tema.js`, `utils/dinheiro.js`)
- `.claude/refs/` — imagens de referência de design

# Convenções
- Nomes de arquivos, componentes, variáveis e comentários em português
- Estilo: CSS Modules por componente; cores/fontes via tokens de `src/global.css` (`var(--cor-...)`), nunca hex solto
- Tema escuro via `[data-bs-theme="dark"]` (ver `utils/tema.js`); todo estilo novo precisa funcionar nos dois temas
- API: base URL de `src/config/api.js`, chamadas com `fetch` e `credentials: "include"` (auth por cookie)
- Feedback ao usuário com `toast` do sonner

# Deploy / dependências
- Vercel usa pnpm, Docker usa npm: após mudar dependências, atualizar `package-lock.json` E `pnpm-lock.yaml`
- Env: `VITE_API_URL`, `VITE_SIGNALING_URL`

# Git
- Commits em português, padrão `feat:` / `fix:` / `chore:`
- Nunca adicionar Claude como autor/coautor
