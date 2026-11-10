import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FieldBox({
  label,
  icon,
  children,
  className,
}: {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative rounded-xl border bg-card px-3 pt-4 pb-2.5",
        className
      )}
    >
      <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center gap-2 text-sm font-medium">
        {icon}
        {children}
      </div>
    </div>
  );
}
