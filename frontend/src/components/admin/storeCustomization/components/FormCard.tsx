import type { ReactNode } from "react";

type FormCardProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export default function FormCard({
  title,
  description,
  children,
}: FormCardProps) {
  return (
    <section className="p-5">
      <div className="space-y-1">
        <h4 className="text-base font-semibold text-base-content">{title}</h4>
        <p className="text-sm text-base-content/65">{description}</p>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}
