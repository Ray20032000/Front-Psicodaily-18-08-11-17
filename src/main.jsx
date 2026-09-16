import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { UsuarioProvider } from "./contexts/UsuarioContext.jsx";
import "./global.css";
import { Toaster } from "sonner";
import { CircleAlert, CircleCheck, Info, LoaderCircle, TriangleAlert, X } from "lucide-react";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <UsuarioProvider><App /></UsuarioProvider>
        <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{ closeButtonAriaLabel: "Fechar alerta" }}
            icons={{
                success: <CircleCheck size={20} strokeWidth={1.8} aria-hidden="true" />,
                error: <CircleAlert size={20} strokeWidth={1.8} aria-hidden="true" />,
                info: <Info size={20} strokeWidth={1.8} aria-hidden="true" />,
                warning: <TriangleAlert size={20} strokeWidth={1.8} aria-hidden="true" />,
                loading: <LoaderCircle className="iconeCarregando" size={20} strokeWidth={1.8} aria-hidden="true" />,
                // close: <X size={14} strokeWidth={1.8} aria-hidden="true" />
            }}
        />
    </React.StrictMode>
);
