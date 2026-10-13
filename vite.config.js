import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Backend local (run.sh no WSL); mesma origem no dev, então o cookie de login funciona sem CORS
  const backend = loadEnv(mode, process.cwd(), "").VITE_API_PROXY_TARGET || "http://127.0.0.1:8000";
  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": { target: backend, changeOrigin: true },
        "/ws": { target: backend, changeOrigin: true, ws: true },
      },
    },
  };
});
