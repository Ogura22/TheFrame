"use client";

import { useEffect, useState } from "react";
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
import { useClinica } from "@/lib/clinica-context";
import { createClient } from "@/lib/supabase/client";
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

export function SalasTab() {
  const { clinicaId } = useClinica();
  const [lista, setLista] = useState<SalaDb[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [novaOpen, setNovaOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("salas")
      .select("*")
      .eq("clinica_id", clinicaId)
      .order("created_at")
      .then(({ data }) => {
        setLista(data ?? []);
        setCarregando(false);
      });
  }, [clinicaId]);

  async function criar(dados: { nome: string; capacidade: number; valor_hora: number }) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("salas")
      .insert({ ...dados, clinica_id: clinicaId })
      .select("*")
      .single();
    if (!error && data) setLista((l) => [...l, data]);
  }

  async function remover(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("salas").delete().eq("id", id);
    if (!error) setLista((l) => l.filter((s) => s.id !== id));
  }

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
        {!carregando && lista.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhuma sala cadastrada ainda. Crie a primeira para liberar
            reservas.
          </p>
        )}
        {lista.map((s) => (
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
              onClick={() => remover(s.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </CardContent>

      <NovaSalaDialog open={novaOpen} onOpenChange={setNovaOpen} onCriar={criar} />
    </Card>
  );
}
