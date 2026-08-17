import type { ButtonHTMLAttributes } from "react";
import "./Button.css";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export default function Button({ variant = "primary", className = "", ...rest }: ButtonProps) {
  const classes = ["btn", `btn--${variant}`, className].filter(Boolean).join(" ");
  return <button className={classes} {...rest} />;
}
