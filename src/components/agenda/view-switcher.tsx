"use client";

import { cn } from "@/lib/utils";
import type { ModoVisaoAgenda } from "@/lib/agenda-types";

const OPCOES: { valor: ModoVisaoAgenda; label: string }[] = [
  { valor: "dia", label: "Dia" },
  { valor: "semana", label: "Semana" },
  { valor: "mes", label: "Mês" },
];

export function ViewSwitcher({
  modo,
  onChange,
}: {
  modo: ModoVisaoAgenda;
  onChange: (m: ModoVisaoAgenda) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full border bg-muted/50 p-1">
      {OPCOES.map((o) => (
        <button
          key={o.valor}
          onClick={() => onChange(o.valor)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            modo === o.valor
              ? "bg-card text-foreground shadow-sm ring-1 ring-foreground/10"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
