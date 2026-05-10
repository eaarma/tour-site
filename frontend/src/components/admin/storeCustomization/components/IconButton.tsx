import type { ReactNode } from "react";

type IconButtonProps = {
  children: ReactNode;
  label: string;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
};

const joinClasses = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export default function IconButton({
  children,
  label,
  disabled = false,
  onClick,
  className,
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={joinClasses("btn btn-ghost btn-sm btn-square", className)}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
