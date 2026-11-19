"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/mock-data";
import type { ClinicaDb, ReservaDb, SalaDb } from "@/lib/db-types";
import { createClient } from "@/lib/supabase/client";

function horasEntre(a: string, b: string) {
  const [h1, m1] = a.split(":").map(Number);
  const [h2, m2] = b.split(":").map(Number);
  return (h2 * 60 + m2 - (h1 * 60 + m1)) / 60;
}

export default function AdminPage() {
  const [clinicas, setClinicas] = useState<ClinicaDb[]>([]);
  const [salas, setSalas] = useState<SalaDb[]>([]);
  const [reservas, setReservas] = useState<ReservaDb[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("clinicas").select("*").order("created_at"),
      supabase.from("salas").select("*"),
      supabase.from("reservas").select("*").neq("status", "cancelada"),
    ]).then(([clinicasRes, salasRes, reservasRes]) => {
      setClinicas(clinicasRes.data ?? []);
      setSalas(salasRes.data ?? []);
      setReservas(reservasRes.data ?? []);
      setCarregando(false);
    });
  }, []);

  function resumoClinica(clinicaId: string) {
    const doClinica = reservas.filter((r) => r.clinica_id === clinicaId);
    const horas = doClinica.reduce(
      (acc, r) => acc + horasEntre(r.hora_inicio.slice(0, 5), r.hora_fim.slice(0, 5)),
      0
    );
    const faturamentoBruto = doClinica.reduce((acc, r) => acc + r.valor, 0);
    return { horas, faturamentoBruto, comissao: faturamentoBruto * 0.08 };
  }

  const faturamentoTotal = reservas.reduce((acc, r) => acc + r.valor, 0);
  const comissaoTotal = faturamentoTotal * 0.08;
  const horasTotal = reservas.reduce(
    (acc, r) => acc + horasEntre(r.hora_inicio.slice(0, 5), r.hora_fim.slice(0, 5)),
    0
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Administração do sistema
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Visão consolidada de todas as clínicas na plataforma
        </p>
      </div>

      <Tabs defaultValue="clinicas" className="mt-8">
        <TabsList>
          <TabsTrigger value="clinicas">Clínicas</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
        </TabsList>

        <TabsContent value="clinicas" className="mt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Clínicas cadastradas</CardTitle>
                <CardDescription>
                  {clinicas.length} clínica(s) ativas na plataforma
                </CardDescription>
              </div>
              <Button size="sm" render={<Link href="/admin/clinicas/nova" />}>
                Nova clínica
              </Button>
            </CardHeader>
            <CardContent>
              {carregando && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Carregando...
                </p>
              )}
              {!carregando && clinicas.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Nenhuma clínica cadastrada ainda.
                </p>
              )}
              {!carregando && clinicas.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Clínica</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Cidade</TableHead>
                      <TableHead>Salas</TableHead>
                      <TableHead>Checkout</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clinicas.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.nome}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {c.cnpj}
                        </TableCell>
                        <TableCell>{c.cidade}</TableCell>
                        <TableCell>
                          {salas.filter((s) => s.clinica_id === c.id).length}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              c.checkout === "automatico" ? "default" : "secondary"
                            }
                          >
                            {c.checkout === "automatico" ? "automático" : "com confirmação"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financeiro" className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Faturamento bruto total</CardDescription>
                <CardTitle className="text-2xl">
                  {formatCurrency(faturamentoTotal)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Receita da plataforma (8%)</CardDescription>
                <CardTitle className="text-2xl">
                  {formatCurrency(comissaoTotal)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Horas locadas no período</CardDescription>
                <CardTitle className="text-2xl">{horasTotal}h</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Retorno por clínica</CardTitle>
              <CardDescription>
                Filtros de dia, semana, mês e período customizado entram no V2.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Clínica</TableHead>
                    <TableHead>Horas locadas</TableHead>
                    <TableHead>Faturamento bruto</TableHead>
                    <TableHead>Comissão plataforma</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clinicas.map((c) => {
                    const r = resumoClinica(c.id);
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.nome}</TableCell>
                        <TableCell>{r.horas}h</TableCell>
                        <TableCell>{formatCurrency(r.faturamentoBruto)}</TableCell>
                        <TableCell>{formatCurrency(r.comissao)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
