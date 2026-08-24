import css from "./Input.module.css";

export default function Input({
                                  label,
                                  tipo,
                                  placeholder,
                                  valor,
                                  alterar
                              }) {
    return (
        <div className={`${css.campo} mb-3`}>
            <label className="form-label">{label}</label>

            <input
                type={tipo}
                placeholder={placeholder}
                value={valor}
                onChange={alterar}
                className="form-control"
                required
            />
        </div>
    );
}