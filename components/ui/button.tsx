"use client";

import React from "react";

type ButtonVariant = "default" | "ghost" | "outline";
type ButtonSize = "sm" | "default" | "lg" | "icon";

function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  className,
  variant = "default",
  size = "default",
  disabled,
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center whitespace-nowrap rounded px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:pointer-events-none disabled:opacity-50";

  const variants: Record<ButtonVariant, string> = {
    default: "bg-primary text-white hover:brightness-110 active:scale-95",
    ghost: "bg-transparent text-foreground/80 hover:bg-foreground/5",
    outline:
      "bg-transparent text-foreground/90 border border-foreground/20 hover:border-foreground/40",
  };

  const sizes: Record<ButtonSize, string> = {
    sm: "h-8 px-3 text-xs",
    default: "h-10 px-4",
    lg: "h-12 px-6 text-base",
    icon: "h-10 w-10 p-0",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled}
      {...props}
    />
  );
}

export default Button;
