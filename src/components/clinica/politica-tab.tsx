"use client";

import { useState } from "react";
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
import { politicaCancelamentoPadrao } from "@/lib/mock-data";

export function PoliticaTab() {
  const [politica, setPolitica] = useState(politicaCancelamentoPadrao);
  const [salvo, setSalvo] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Política de cancelamento e reagendamento
        </CardTitle>
        <CardDescription>
          Essas regras aparecem no contrato e orientam quando um
          cancelamento/reagendamento gera cobrança.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="antecedencia">
            Antecedência mínima sem custo (horas)
          </Label>
          <Input
            id="antecedencia"
            type="number"
            value={politica.horasAntecedenciaGratuita}
            onChange={(e) => {
              setSalvo(false);
              setPolitica({
                ...politica,
                horasAntecedenciaGratuita: Number(e.target.value) || 0,
              });
            }}
            className="w-32"
          />
          <p className="text-xs text-muted-foreground">
            Ex: 48h — cancelamentos/reagendamentos feitos até 48h antes não
            geram custo.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="percentual">
            Cobrança fora do prazo (% do valor da reserva)
          </Label>
          <Input
            id="percentual"
            type="number"
            value={politica.percentualCobradoForaPrazo}
            onChange={(e) => {
              setSalvo(false);
              setPolitica({
                ...politica,
                percentualCobradoForaPrazo: Number(e.target.value) || 0,
              });
            }}
            className="w-32"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={politica.reagendamentoRequerAprovacao}
            onChange={(e) => {
              setSalvo(false);
              setPolitica({
                ...politica,
                reagendamentoRequerAprovacao: e.target.checked,
              });
            }}
          />
          Reagendamento precisa de aprovação manual da clínica
        </label>

        <div className="flex items-center gap-3">
          <Button onClick={() => setSalvo(true)}>Salvar política</Button>
          {salvo && (
            <span className="text-sm text-muted-foreground">
              Política atualizada.
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
