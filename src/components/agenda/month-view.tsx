"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  adicionarDias,
  inicioGradeMes,
  toISODate,
  type EventoAgenda,
} from "@/lib/agenda-types";

const MAX_VISIVEIS = 3;

const statusDot: Record<EventoAgenda["status"], string> = {
  confirmada: "bg-primary",
  pendente: "bg-amber-500",
  cancelada: "bg-destructive",
};

export function MonthView({
  date,
  onDateChange,
  eventos,
  onSelect,
  onAbrirDia,
}: {
  date: Date;
  onDateChange: (d: Date) => void;
  eventos: EventoAgenda[];
  onSelect: (id: string) => void;
  /** Abre a visão de Dia para a data clicada — evita poluir o mês com detalhes. */
  onAbrirDia: (d: Date) => void;
}) {
  const inicio = inicioGradeMes(date);
  const dias = Array.from({ length: 42 }, (_, i) => adicionarDias(inicio, i));
  const hoje = toISODate(new Date());
  const mesAtual = date.getMonth();

  function mudarMes(delta: number) {
    onDateChange(new Date(date.getFullYear(), date.getMonth() + delta, 1));
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon-sm" onClick={() => mudarMes(-1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => mudarMes(1)}>
            <ChevronRight className="size-4" />
          </Button>
          <span className="ml-2 text-sm font-medium capitalize">
            {date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onDateChange(new Date())}>
          Hoje
        </Button>
      </div>

      <div className="grid grid-cols-7 overflow-hidden rounded-lg border">
        {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => (
          <div
            key={d}
            className="border-b bg-muted/40 px-2 py-1.5 text-center text-[11px] font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}

        {dias.map((d) => {
          const iso = toISODate(d);
          const doMes = d.getMonth() === mesAtual;
          const eventosDoDia = eventos
            .filter((e) => e.dia === iso && e.status !== "cancelada")
            .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
          const visiveis = eventosDoDia.slice(0, MAX_VISIVEIS);
          const restantes = eventosDoDia.length - visiveis.length;

          return (
            <div
              key={iso}
              className={cn(
                "flex min-h-24 flex-col gap-0.5 border-r border-b p-1 last:border-r-0",
                !doMes && "bg-muted/20"
              )}
            >
              <button
                onClick={() => onAbrirDia(d)}
                className={cn(
                  "mb-0.5 self-start rounded-full px-1.5 text-xs font-medium",
                  iso === hoje && "bg-primary text-primary-foreground",
                  !doMes && "text-muted-foreground/50"
                )}
              >
                {d.getDate()}
              </button>

              {visiveis.map((e) => (
                <button
                  key={e.id}
                  onClick={() => onSelect(e.id)}
                  className="flex items-center gap-1 truncate rounded px-1 py-0.5 text-left text-[10px] hover:bg-muted"
                >
                  <span
                    className={cn("size-1.5 shrink-0 rounded-full", statusDot[e.status])}
                  />
                  <span className="truncate">
                    {e.horaInicio} {e.titulo}
                  </span>
                </button>
              ))}

              {restantes > 0 && (
                <button
                  onClick={() => onAbrirDia(d)}
                  className="px-1 text-left text-[10px] font-medium text-muted-foreground hover:text-foreground"
                >
                  +{restantes} mais
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
