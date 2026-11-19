"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/mock-data";
import type { PerfilDb, ReservaDb } from "@/lib/db-types";
import { useClinica } from "@/lib/clinica-context";
import { createClient } from "@/lib/supabase/client";

type ReservaComSala = ReservaDb & { salas: { nome: string } | null };

export function ClientesTab() {
  const { clinicaId } = useClinica();
  const [clientes, setClientes] = useState<PerfilDb[]>([]);
  const [reservasPorCliente, setReservasPorCliente] = useState<
    Record<string, ReservaComSala[]>
  >({});
  const [carregando, setCarregando] = useState(true);
  const [selecionado, setSelecionado] = useState<PerfilDb | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("reservas")
      .select("*, salas(nome), perfis:cliente_id(*)")
      .eq("clinica_id", clinicaId)
      .then(({ data }) => {
        if (!data) {
          setCarregando(false);
          return;
        }
        const mapaClientes = new Map<string, PerfilDb>();
        const mapaReservas: Record<string, ReservaComSala[]> = {};

        for (const r of data as unknown as (ReservaComSala & { perfis: PerfilDb })[]) {
          if (r.perfis) mapaClientes.set(r.perfis.id, r.perfis);
          const lista = mapaReservas[r.cliente_id] ?? [];
          lista.push(r);
          mapaReservas[r.cliente_id] = lista;
        }

        setClientes([...mapaClientes.values()]);
        setReservasPorCliente(mapaReservas);
        setCarregando(false);
      });
  }, [clinicaId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Clientes</CardTitle>
        <CardDescription>
          Locatários que já reservaram salas nesta clínica. Clique para ver
          histórico.
        </CardDescription>
      </CardHeader>
      <CardContent className="divide-y">
        {carregando && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Carregando...
          </p>
        )}
        {!carregando && clientes.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhum cliente ainda — aparece aqui assim que a primeira reserva
            for feita.
          </p>
        )}
        {clientes.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelecionado(c)}
            className="flex w-full items-center gap-3 py-3 text-left first:pt-0 last:pb-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.foto_url ?? "https://picsum.photos/seed/sem-foto/200/200"}
              alt={c.nome}
              className="size-10 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{c.nome}</p>
              <p className="text-xs text-muted-foreground">
                {c.especialidade ?? "—"} · {c.registro_profissional ?? "—"} ·{" "}
                {c.celular ?? "—"}
              </p>
            </div>
          </button>
        ))}
      </CardContent>

      <Dialog
        open={!!selecionado}
        onOpenChange={(o) => !o && setSelecionado(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selecionado?.nome}</DialogTitle>
            <DialogDescription>{selecionado?.especialidade}</DialogDescription>
          </DialogHeader>

          {selecionado && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">CPF</p>
                  <p>{selecionado.cpf ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Registro profissional
                  </p>
                  <p>{selecionado.registro_profissional ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Celular</p>
                  <p>{selecionado.celular ?? "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">
                    Endereço de cobrança
                  </p>
                  <p>{selecionado.endereco_cobranca ?? "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">E-mail</p>
                  <p>{selecionado.email ?? "—"}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="mb-2 font-medium">Histórico de reservas</p>
                <div className="space-y-2">
                  {(reservasPorCliente[selecionado.id] ?? []).map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2"
                    >
                      <div>
                        <p>{r.salas?.nome ?? "Sala"}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(`${r.dia}T00:00:00`).toLocaleDateString("pt-BR")} ·{" "}
                          {r.hora_inicio}–{r.hora_fim}
                        </p>
                      </div>
                      <div className="text-right">
                        <p>{formatCurrency(r.valor)}</p>
                        <Badge
                          variant={
                            r.status === "confirmada"
                              ? "default"
                              : r.status === "pendente"
                              ? "secondary"
                              : "destructive"
                          }
                          className="mt-1 text-[10px]"
                        >
                          {r.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
