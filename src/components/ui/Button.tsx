import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type ButtonVariant = "primary" | "secondary";

interface ButtonBaseProps {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
}

type LinkButtonProps = ButtonBaseProps &
  { href: string } &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className" | "href">;

type NativeButtonProps = ButtonBaseProps &
  { href?: never } &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">;

type ButtonProps = LinkButtonProps | NativeButtonProps;

function buttonStyles(variant: ButtonVariant, className: string) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 " +
    "rounded-full px-7 py-3.5 text-sm font-semibold " +
    "transition-all duration-200 hover:-translate-y-0.5 " +
    "focus-visible:outline-2 focus-visible:outline-offset-4 " +
    "disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    primary:
      "bg-forest text-snow shadow-[0_8px_24px_rgba(37,73,54,0.2)] " +
      "hover:bg-cranberry hover:shadow-[0_10px_28px_rgba(146,46,58,0.22)]",
    secondary:
      "border-2 border-cranberry bg-transparent " +
      "text-cranberry hover:bg-cranberry hover:text-snow",
  };

  return `${baseStyles} ${variants[variant]} ${className}`;
}

function LinkButton({
  children,
  variant = "primary",
  className = "",
  href,
  ...props
}: LinkButtonProps) {
  return (
    <a href={href} className={buttonStyles(variant, className)} {...props}>
      {children}
    </a>
  );
}

function NativeButton({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: NativeButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles(variant, className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function Button(props: ButtonProps) {
  if (typeof props.href === "string") {
    return <LinkButton {...props} />;
  }

  return <NativeButton {...props} />;
}
