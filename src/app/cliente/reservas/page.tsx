"use client";

import { useEffect, useState } from "react";
import { CalendarIcon, Clock } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { FieldBox } from "@/components/field-box";
import { TimeRangeSelect } from "@/components/time-range-select";
import { TermsGateDialog } from "@/components/terms-acceptance";
import { formatCurrency, formatDuracao, gerarSlots } from "@/lib/mock-data";
import type { ReservaDb, StatusReservaDb } from "@/lib/db-types";
import { createClient } from "@/lib/supabase/client";

const COMISSAO_PCT = 0.08;
const TAXA_GATEWAY_PCT = 0.0299;
const HORARIOS = gerarSlots("07:00", "24:00", 30);

type ReservaView = ReservaDb & { sala_nome: string };

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function horasEntre(a: string, b: string) {
  const [h1, m1] = a.split(":").map(Number);
  const [h2, m2] = b.split(":").map(Number);
  return (h2 * 60 + m2 - (h1 * 60 + m1)) / 60;
}

function StatusBadge({ status }: { status: StatusReservaDb }) {
  const map: Record<StatusReservaDb, { label: string; variant: "default" | "secondary" | "destructive" }> = {
    confirmada: { label: "Confirmada", variant: "default" },
    pendente: { label: "Aguardando aprovação", variant: "secondary" },
    cancelada: { label: "Cancelada", variant: "destructive" },
  };
  const s = map[status];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export default function MinhasReservasPage() {
  const [lista, setLista] = useState<ReservaView[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [reagendando, setReagendando] = useState<ReservaView | null>(null);
  const [novaData, setNovaData] = useState<Date | undefined>(undefined);
  const [novoRange, setNovoRange] = useState<[string, string] | null>(null);
  const [bloqueados, setBloqueados] = useState<string[]>([]);
  const [termosReagendamentoOpen, setTermosReagendamentoOpen] = useState(false);

  useEffect(() => {
    carregarReservas();
  }, []);

  async function carregarReservas() {
    setCarregando(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setCarregando(false);
      return;
    }

    const { data } = await supabase
      .from("reservas")
      .select("*, salas(nome)")
      .eq("cliente_id", user.id)
      .order("dia", { ascending: false });

    const linhas = (data ?? []) as unknown as (ReservaDb & {
      salas: { nome: string } | null;
    })[];
    setLista(linhas.map((r) => ({ ...r, sala_nome: r.salas?.nome ?? "Sala" })));
    setCarregando(false);
  }

  useEffect(() => {
    if (!reagendando || !novaData) return;
    const supabase = createClient();
    supabase
      .from("reservas")
      .select("hora_inicio, hora_fim")
      .eq("sala_id", reagendando.sala_id)
      .eq("dia", toISODate(novaData))
      .neq("status", "cancelada")
      .neq("id", reagendando.id)
      .then(({ data: ocupadas }) => {
        const slots = new Set<string>();
        for (const r of ocupadas ?? []) {
          const inicioIdx = HORARIOS.indexOf(r.hora_inicio.slice(0, 5));
          const fimIdx = HORARIOS.indexOf(r.hora_fim.slice(0, 5));
          for (let i = inicioIdx; i < (fimIdx === -1 ? HORARIOS.length : fimIdx); i++) {
            slots.add(HORARIOS[i]);
          }
        }
        setBloqueados([...slots]);
      });
  }, [reagendando, novaData]);

  const hojeISO = toISODate(new Date());

  const proximas = lista
    .filter((r) => r.dia >= hojeISO && r.status !== "cancelada")
    .sort((a, b) => a.dia.localeCompare(b.dia));
  const historico = lista
    .filter((r) => r.dia < hojeISO || r.status === "cancelada")
    .sort((a, b) => b.dia.localeCompare(a.dia));

  const horasNovoRange = novoRange ? horasEntre(novoRange[0], novoRange[1]) : 0;
  const valorHoraReagendando = reagendando
    ? reagendando.valor / horasEntre(reagendando.hora_inicio.slice(0, 5), reagendando.hora_fim.slice(0, 5))
    : 0;
  const novoValorBase = valorHoraReagendando * horasNovoRange;
  const novaComissao = novoValorBase * COMISSAO_PCT;
  const novaTaxaGateway = novoValorBase * TAXA_GATEWAY_PCT;
  const novoTotal = novoValorBase + novaComissao + novaTaxaGateway;

  function abrirReagendamento(r: ReservaView) {
    setReagendando(r);
    setNovaData(new Date(`${r.dia}T00:00:00`));
    setNovoRange([r.hora_inicio.slice(0, 5), r.hora_fim.slice(0, 5)]);
  }

  async function confirmarReagendamento() {
    if (!reagendando || !novaData || !novoRange) return;
    const supabase = createClient();
    await supabase
      .from("reservas")
      .update({
        dia: toISODate(novaData),
        hora_inicio: novoRange[0],
        hora_fim: novoRange[1],
        valor: novoValorBase,
        status: "pendente",
        pago: false,
      })
      .eq("id", reagendando.id);
    setReagendando(null);
    await carregarReservas();
  }

  async function cancelar(id: string) {
    const supabase = createClient();
    await supabase.from("reservas").update({ status: "cancelada" }).eq("id", id);
    setLista((l) => l.map((r) => (r.id === id ? { ...r, status: "cancelada" } : r)));
  }

  function ReservaCard({ r, podeAgir }: { r: ReservaView; podeAgir: boolean }) {
    return (
      <Card>
        <CardContent className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-medium">{r.sala_nome}</p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarIcon className="size-3.5" />
              {new Date(`${r.dia}T00:00:00`).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
              <Clock className="ml-2 size-3.5" />
              {r.hora_inicio.slice(0, 5)}–{r.hora_fim.slice(0, 5)} (
              {formatDuracao(horasEntre(r.hora_inicio.slice(0, 5), r.hora_fim.slice(0, 5)))})
            </p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(r.valor)} · {r.pago ? "Pago" : "Pagamento pendente"}
            </p>
            <StatusBadge status={r.status} />
          </div>
          {podeAgir && r.status !== "cancelada" && (
            <div className="flex shrink-0 flex-col gap-1.5">
              <Button size="sm" variant="outline" onClick={() => abrirReagendamento(r)}>
                Reagendar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => cancelar(r.id)}
              >
                Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (carregando) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center text-sm text-muted-foreground">
        Carregando...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 pt-6 pb-16">
      <h1 className="text-2xl font-semibold tracking-tight">Minhas Reservas</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Consulte, reagende ou cancele suas reservas.
      </p>

      <Tabs defaultValue="proximas" className="mt-6">
        <TabsList>
          <TabsTrigger value="proximas">Próximas</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="proximas" className="mt-4 space-y-3">
          {proximas.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nenhuma reserva futura.
            </p>
          ) : (
            proximas.map((r) => <ReservaCard key={r.id} r={r} podeAgir />)
          )}
        </TabsContent>

        <TabsContent value="historico" className="mt-4 space-y-3">
          {historico.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nenhuma reserva no histórico ainda.
            </p>
          ) : (
            historico.map((r) => <ReservaCard key={r.id} r={r} podeAgir={false} />)
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!reagendando}
        onOpenChange={(open) => !open && setReagendando(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reagendar reserva</DialogTitle>
            <DialogDescription>
              O reagendamento precisa ser confirmado pela clínica antes de
              valer — a reserva fica como &quot;Aguardando aprovação&quot;
              até lá.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Popover>
              <PopoverTrigger
                render={
                  <button type="button" className="w-full text-left">
                    <FieldBox
                      label="Nova data"
                      icon={
                        <CalendarIcon className="size-4 text-muted-foreground" />
                      }
                    >
                      {novaData
                        ? novaData.toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "Selecionar data"}
                    </FieldBox>
                  </button>
                }
              />
              <PopoverContent align="start" className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={novaData}
                  onSelect={setNovaData}
                  disabled={{ before: new Date() }}
                />
              </PopoverContent>
            </Popover>

            <div>
              <p className="mb-2 text-sm font-medium">Novo horário</p>
              <TimeRangeSelect
                slots={HORARIOS}
                blocked={bloqueados}
                value={novoRange}
                onChange={setNovoRange}
              />
            </div>

            {novoRange && (
              <>
                <Separator />
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nova duração</span>
                    <span>{formatDuracao(horasNovoRange)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Locação da sala</span>
                    <span>{formatCurrency(novoValorBase)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Comissão plataforma (8%)</span>
                    <span>{formatCurrency(novaComissao)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxa gateway (2,99%)</span>
                    <span>{formatCurrency(novaTaxaGateway)}</span>
                  </div>
                  <Separator className="my-1" />
                  <div className="flex justify-between font-semibold">
                    <span>Novo total</span>
                    <span>{formatCurrency(novoTotal)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              disabled={!novaData || !novoRange}
              onClick={() => setTermosReagendamentoOpen(true)}
            >
              Seguir com a confirmação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TermsGateDialog
        open={termosReagendamentoOpen}
        onOpenChange={setTermosReagendamentoOpen}
        onConfirm={confirmarReagendamento}
        confirmLabel="Confirmar reagendamento"
      />
    </div>
  );
}
