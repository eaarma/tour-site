"use client";

import { ReactNode } from "react";

interface ManagerSectionContainerProps {
  children: ReactNode;
  className?: string;
}

export default function ManagerSectionContainer({
  children,
  className = "",
}: ManagerSectionContainerProps) {
  return <div className={`min-h-[600px] ${className}`}>{children}</div>;
}
