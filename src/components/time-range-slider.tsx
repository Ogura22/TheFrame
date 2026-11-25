"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface TimeRangeSliderProps {
  slots: string[];
  blocked: string[];
  value: [string, string] | null;
  onChange: (value: [string, string] | null) => void;
  stepMin?: number;
  /** Duração mínima que o plano ativo do cliente exige para uma reserva. */
  minimoHoras?: number;
}

export function TimeRangeSlider({
  slots,
  blocked,
  value,
  onChange,
  stepMin = 30,
  minimoHoras = 1,
}: TimeRangeSliderProps) {
  const [anchor, setAnchor] = useState<string | null>(null);

  const blockedSet = useMemo(() => new Set(blocked), [blocked]);

  const indexOf = (t: string) => slots.indexOf(t);

  function rangeHasBlocked(a: string, b: string) {
    const [start, end] = [indexOf(a), indexOf(b)].sort((x, y) => x - y);
    for (let i = start; i <= end; i++) {
      if (blockedSet.has(slots[i])) return true;
    }
    return false;
  }

  const slotsMinimos = Math.max(1, Math.round((minimoHoras * 60) / stepMin));

  // Seleção inicial padrão: a duração mínima exigida pelo plano do cliente,
  // reduzindo bloco a bloco se algum horário no meio já estiver ocupado.
  function rangeMinima(slot: string): [string, string] {
    const i = indexOf(slot);
    let alcance = slotsMinimos;
    while (alcance > 1) {
      const proximo = slots[i + alcance - 1];
      if (proximo && !blockedSet.has(proximo)) break;
      alcance -= 1;
    }
    const fimIndex = i + alcance;
    const fim = slots[fimIndex] ?? addMinutes(slot, alcance * stepMin);
    return [slot, fim];
  }

  function selectSlot(slot: string) {
    if (blockedSet.has(slot)) return;

    // Nenhuma seleção em andamento: inicia uma nova a partir deste horário.
    if (!anchor) {
      setAnchor(slot);
      onChange(rangeMinima(slot));
      return;
    }

    // Clicar de novo no início desmarca a seleção.
    if (slot === anchor) {
      setAnchor(null);
      onChange(null);
      return;
    }

    // Intervalo cruzaria um horário bloqueado: recomeça a seleção a partir daqui.
    if (rangeHasBlocked(anchor, slot)) {
      setAnchor(slot);
      onChange(rangeMinima(slot));
      return;
    }

    // Qualquer outro clique estica (ou encolhe) o intervalo a partir da âncora fixa,
    // permitindo quantas horas o cliente quiser enquanto houver disponibilidade —
    // nunca abaixo do mínimo exigido pelo plano.
    const [start, end] = [indexOf(anchor), indexOf(slot)].sort(
      (a, b) => a - b
    );
    const endAjustado = Math.max(end, start + slotsMinimos - 1);
    const endExclusive =
      slots[endAjustado + 1] ?? addMinutes(slots[endAjustado], stepMin);
    onChange([slots[start], endExclusive]);
  }

  function limpar() {
    setAnchor(null);
    onChange(null);
  }

  function isSelected(slot: string) {
    if (!value) return false;
    const [start, end] = value;
    return slot >= start && slot < end;
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border bg-card">
        <div className="flex min-w-max">
          {slots.map((slot) => {
            const isBlocked = blockedSet.has(slot);
            const selected = isSelected(slot);
            const isAnchor = slot === anchor;
            return (
              <button
                key={slot}
                type="button"
                disabled={isBlocked}
                onClick={() => selectSlot(slot)}
                className={cn(
                  "relative flex h-16 w-14 shrink-0 flex-col items-center justify-end border-r pb-1 text-[11px] transition-colors last:border-r-0",
                  isBlocked &&
                    "cursor-not-allowed bg-[repeating-linear-gradient(135deg,var(--muted)_0px,var(--muted)_4px,transparent_4px,transparent_8px)] text-muted-foreground/50",
                  !isBlocked && selected && "bg-primary text-primary-foreground",
                  !isBlocked &&
                    !selected &&
                    "text-muted-foreground hover:bg-muted",
                  isAnchor && !isBlocked && "ring-2 ring-inset ring-primary"
                )}
              >
                <span>{slot}</span>
              </button>
            );
          })}
        </div>
      </div>
      {anchor && (
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Início marcado às {anchor} — toque em outro horário para esticar a reserva.</span>
          <button
            type="button"
            onClick={limpar}
            className="font-medium text-foreground underline underline-offset-2"
          >
            Limpar
          </button>
        </div>
      )}
    </div>
  );
}

function addMinutes(time: string, min: number) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + min;
  const hh = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const mm = (total % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
}
