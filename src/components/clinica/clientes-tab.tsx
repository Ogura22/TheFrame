"use client";

import { useState } from "react";
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
import {
  clientesDetalhe,
  formatCurrency,
  reservas,
  type ClienteDetalhe,
} from "@/lib/mock-data";

export function ClientesTab() {
  const [selecionado, setSelecionado] = useState<ClienteDetalhe | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Clientes</CardTitle>
        <CardDescription>
          Base de locatários da clínica. Clique em um cliente para ver
          histórico de reservas e materiais.
        </CardDescription>
      </CardHeader>
      <CardContent className="divide-y">
        {clientesDetalhe.map((c) => (
          <button
            key={c.cpf}
            onClick={() => setSelecionado(c)}
            className="flex w-full items-center gap-3 py-3 text-left first:pt-0 last:pb-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.foto}
              alt={c.nome}
              className="size-10 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{c.nome}</p>
              <p className="text-xs text-muted-foreground">
                {c.especialidade} · {c.registroProfissional} · {c.celular}
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
                  <p>{selecionado.cpf}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Registro profissional
                  </p>
                  <p>{selecionado.registroProfissional}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Celular</p>
                  <p>{selecionado.celular}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">
                    Endereço de cobrança
                  </p>
                  <p>{selecionado.enderecoCobranca}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">E-mail</p>
                  <p>{selecionado.email}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  Redefinir senha do cliente
                </Button>
              </div>

              <Separator />

              <div>
                <p className="mb-2 font-medium">Histórico de reservas</p>
                <div className="space-y-2">
                  {reservas
                    .filter((r) => r.dr === selecionado.nome)
                    .map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between rounded-md border px-3 py-2"
                      >
                        <div>
                          <p>{r.sala}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(r.dia).toLocaleDateString("pt-BR")} ·{" "}
                            {r.horaInicio}–{r.horaFim}
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
