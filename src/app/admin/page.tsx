"use client";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { clinicas, formatCurrency } from "@/lib/mock-data";

export default function AdminPage() {
  const faturamentoTotal = clinicas.reduce(
    (acc, c) => acc + c.faturamentoBruto,
    0
  );
  const comissaoTotal = clinicas.reduce(
    (acc, c) => acc + c.comissaoPlataforma,
    0
  );
  const horasTotal = clinicas.reduce((acc, c) => acc + c.horasLocadas, 0);

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
            <CardHeader>
              <CardTitle className="text-base">Clínicas cadastradas</CardTitle>
              <CardDescription>
                {clinicas.length} clínica(s) ativas na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                      <TableCell>{c.salas}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            c.checkout === "automático"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {c.checkout}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                Filtros de dia, semana, mês e período customizado entram no V2
                com dados reais.
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
                  {clinicas.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.nome}</TableCell>
                      <TableCell>{c.horasLocadas}h</TableCell>
                      <TableCell>
                        {formatCurrency(c.faturamentoBruto)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(c.comissaoPlataforma)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
