export type ModoVisaoAgenda = "dia" | "semana" | "mes";

export interface EventoAgenda {
  id: string;
  dia: string; // YYYY-MM-DD
  horaInicio: string; // HH:MM
  horaFim: string; // HH:MM
  titulo: string;
  subtitulo?: string;
  status: "confirmada" | "pendente" | "cancelada";
}

export const statusStylesAgenda: Record<EventoAgenda["status"], string> = {
  confirmada: "border-primary/30 bg-primary/10 text-primary",
  pendente: "border-amber-400/50 bg-amber-400/15 text-amber-700",
  cancelada:
    "border-destructive/30 bg-destructive/10 text-destructive line-through opacity-60",
};

export function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** Segunda-feira da semana que contém a data informada. */
export function inicioDaSemana(d: Date) {
  const data = new Date(d);
  const diaSemana = data.getDay(); // 0 = domingo
  const deslocamento = diaSemana === 0 ? -6 : 1 - diaSemana;
  data.setDate(data.getDate() + deslocamento);
  data.setHours(0, 0, 0, 0);
  return data;
}

export function adicionarDias(d: Date, dias: number) {
  const nova = new Date(d);
  nova.setDate(nova.getDate() + dias);
  return nova;
}

/** Primeiro dia (podendo ser do mês anterior) da grade de 6 semanas do mês. */
export function inicioGradeMes(d: Date) {
  const primeiroDoMes = new Date(d.getFullYear(), d.getMonth(), 1);
  return inicioDaSemana(primeiroDoMes);
}
