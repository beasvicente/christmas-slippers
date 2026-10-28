import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

export function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 " +
    "rounded-full px-7 py-3.5 text-sm font-semibold " +
    "transition-colors duration-200 " +
    "focus-visible:outline-2 focus-visible:outline-offset-4 " +
    "disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    primary: "bg-forest text-snow hover:bg-cranberry",
    secondary:
      "border-2 border-cranberry bg-transparent " +
      "text-cranberry hover:bg-cranberry hover:text-snow",
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
