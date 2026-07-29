import { PropsWithChildren, ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action, children }: PropsWithChildren<EmptyStateProps>) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink-600 px-8 py-16 text-center">
      {icon}
      <p className="font-display text-lg text-paper-100">{title}</p>
      <p className="max-w-sm text-sm text-paper-400">{description}</p>
      {action}
      {children}
    </div>
  );
}
