"use client";

import { forwardRef } from "react";

const variantStyles = {
  primary:
    "bg-green-deep text-white font-bold shadow-sm border-b-3 border-b-black hover:bg-green-deep/90",
  secondary:
    "bg-white text-slate-300 font-normal border-2 border-slate-300 hover:text-slate-400 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2",
} as const;

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm rounded-md",
  md: "px-4 py-3 text-base rounded-lg",
  lg: "px-6 py-3.5 text-lg rounded-lg",
} as const;

export type ButtonVariant = keyof typeof variantStyles;
export type ButtonSize = keyof typeof sizeStyles;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      className = "",
      children,
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type="button"
        className={`inline-flex p-3.5 items-center justify-center transition cursor-pointer ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? "w-full sm:w-auto" : ""} ${className}`.trim()}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
