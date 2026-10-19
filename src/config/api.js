// Dev: /api passa pelo proxy do Vite até o backend local (vite.config.js).
// Build de produção: API no Northflank. VITE_API_URL sobrescreve os dois.
const API_BASE_URL = import.meta.env.VITE_API_URL
    || (import.meta.env.DEV ? "http://localhost:5000/api" : "https://p01--psicodaily-api--zfhqcbxfx5v8.code.run/api");

export default API_BASE_URL;
