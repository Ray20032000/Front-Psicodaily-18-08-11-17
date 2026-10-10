import "./styles.css";

const variants = {
	primary: "buttonEspecial text-white",
	secondary: "border border-dark",
}

const ButtonEspecial = ({ children, onClick, variant = "primary" }) => (
	<button
		onClick={onClick}
		className={`button px-4 py-2 rounded-3 fw-semibold ${variants[variant]}`}
	>
		{children}
	</button>
)

export default ButtonEspecial;
