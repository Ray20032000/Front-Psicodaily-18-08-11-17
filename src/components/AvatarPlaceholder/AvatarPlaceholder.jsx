import { UserRound } from "lucide-react";
import css from "./AvatarPlaceholder.module.css";

export default function AvatarPlaceholder() {
    return <UserRound className={css.icone} strokeWidth={1.8} aria-hidden="true" />;
}
