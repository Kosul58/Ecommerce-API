import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
  size?: "small" | "medium" | "large";
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "medium",
  className = "",
  onClick,
  disabled,
  type = "button",
  ...rest
}) => {
  const baseStyles =
    "font-semibold py-2 px-4 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex justify-center items-center gap-1";

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-700 focus:ring-purple-500",
    secondary:
      "bg-gradient-to-r from-slate-300 to-gray-300 text-gray-800 hover:from-slate-400 hover:to-gray-400 hover:text-white focus:ring-gray-400 border border-transparent",
    danger:
      "bg-gradient-to-r from-red-400 to-red-500 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-500",
    outline:
      "bg-gradient-to-r from-white to-gray-50 border border-gray-400 text-gray-700 hover:from-gray-50 hover:to-gray-100 focus:ring-gray-400",
    ghost:
      "bg-gradient-to-r from-transparent to-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400",
  }[variant];

  const sizeStyles = {
    small: "text-sm py-1 px-3",
    medium: "text-base py-2 px-4",
    large: "text-lg py-3 px-6",
  }[size];

  const disabledStyles = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${disabledStyles} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
