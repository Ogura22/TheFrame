"use client";

import { useEffect, useState } from "react";
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
import type { PoliticaCancelamentoDb } from "@/lib/db-types";
import { useClinica } from "@/lib/clinica-context";
import { createClient } from "@/lib/supabase/client";

const PADRAO: Omit<PoliticaCancelamentoDb, "clinica_id"> = {
  horas_antecedencia_gratuita: 48,
  percentual_cobrado_fora_prazo: 100,
  reagendamento_requer_aprovacao: true,
};

export function PoliticaTab() {
  const { clinicaId } = useClinica();
  const [politica, setPolitica] = useState(PADRAO);
  const [carregando, setCarregando] = useState(true);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("politicas_cancelamento")
      .select("*")
      .eq("clinica_id", clinicaId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setPolitica(data);
        setCarregando(false);
      });
  }, [clinicaId]);

  async function salvar() {
    const supabase = createClient();
    await supabase
      .from("politicas_cancelamento")
      .upsert({ ...politica, clinica_id: clinicaId });
    setSalvo(true);
  }

  if (carregando) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          Carregando...
        </CardContent>
      </Card>
    );
  }

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
            value={politica.horas_antecedencia_gratuita}
            onChange={(e) => {
              setSalvo(false);
              setPolitica({
                ...politica,
                horas_antecedencia_gratuita: Number(e.target.value) || 0,
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
            value={politica.percentual_cobrado_fora_prazo}
            onChange={(e) => {
              setSalvo(false);
              setPolitica({
                ...politica,
                percentual_cobrado_fora_prazo: Number(e.target.value) || 0,
              });
            }}
            className="w-32"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={politica.reagendamento_requer_aprovacao}
            onChange={(e) => {
              setSalvo(false);
              setPolitica({
                ...politica,
                reagendamento_requer_aprovacao: e.target.checked,
              });
            }}
          />
          Reagendamento precisa de aprovação manual da clínica
        </label>

        <div className="flex items-center gap-3">
          <Button onClick={salvar}>Salvar política</Button>
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
