"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/mock-data";
import type { SalaDb } from "@/lib/db-types";

function NovaSalaDialog({
  open,
  onOpenChange,
  onCriar,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCriar: (dados: { nome: string; capacidade: number; valor_hora: number }) => void;
}) {
  const [nome, setNome] = useState("");
  const [capacidade, setCapacidade] = useState("1");
  const [valorHora, setValorHora] = useState("");

  function limpar() {
    setNome("");
    setCapacidade("1");
    setValorHora("");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) limpar();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova sala</DialogTitle>
          <DialogDescription>
            Fica disponível para reserva assim que criada.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="sala-nome">Nome</Label>
            <Input
              id="sala-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Sala 1 — Consultório Odonto"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sala-capacidade">Capacidade</Label>
              <Input
                id="sala-capacidade"
                type="number"
                min={1}
                value={capacidade}
                onChange={(e) => setCapacidade(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sala-valor">Valor/hora (R$)</Label>
              <Input
                id="sala-valor"
                type="number"
                step="0.01"
                value={valorHora}
                onChange={(e) => setValorHora(e.target.value)}
                placeholder="0,00"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            disabled={!nome.trim() || !valorHora}
            onClick={() => {
              onCriar({
                nome: nome.trim(),
                capacidade: Number(capacidade) || 1,
                valor_hora: Number(valorHora) || 0,
              });
              limpar();
              onOpenChange(false);
            }}
          >
            Criar sala
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SalasTab({
  salas,
  carregando,
  onCriar,
  onRemover,
}: {
  salas: SalaDb[];
  carregando: boolean;
  onCriar: (dados: { nome: string; capacidade: number; valor_hora: number }) => void;
  onRemover: (id: string) => void;
}) {
  const [novaOpen, setNovaOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">Salas</CardTitle>
          <CardDescription>
            Espaços disponíveis para locação nesta clínica.
          </CardDescription>
        </div>
        <Button size="sm" onClick={() => setNovaOpen(true)}>
          <Plus className="size-4" />
          Nova sala
        </Button>
      </CardHeader>
      <CardContent className="divide-y">
        {carregando && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Carregando...
          </p>
        )}
        {!carregando && salas.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhuma sala cadastrada ainda. Crie a primeira para liberar
            reservas.
          </p>
        )}
        {salas.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div>
              <p className="text-sm font-medium">{s.nome}</p>
              <p className="text-xs text-muted-foreground">
                Capacidade {s.capacidade} · {formatCurrency(s.valor_hora)}/h
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => onRemover(s.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </CardContent>

      <NovaSalaDialog open={novaOpen} onOpenChange={setNovaOpen} onCriar={onCriar} />
    </Card>
  );
}
