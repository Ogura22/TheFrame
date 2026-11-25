"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { tiposPlanoInfoDb, type ClinicaDb, type TipoPlanoDb } from "@/lib/db-types";
import { createClient } from "@/lib/supabase/client";
import { enviarRedefinicaoSenha } from "@/lib/reset-password";

const TODOS_TIPOS: TipoPlanoDb[] = ["avulso", "flex", "fixo"];

export default function EditarClinicaPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [clinica, setClinica] = useState<ClinicaDb | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [excluirOpen, setExcluirOpen] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [emailAdmin, setEmailAdmin] = useState<string | null>(null);
  const [enviandoReset, setEnviandoReset] = useState(false);
  const [resetEnviado, setResetEnviado] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("clinicas")
      .select("*")
      .eq("id", params.id)
      .single()
      .then(({ data }) => {
        setClinica(data);
        setCarregando(false);
      });

    supabase
      .from("perfis")
      .select("email")
      .eq("clinica_id", params.id)
      .eq("tipo", "clinica_admin")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setEmailAdmin(data?.email ?? null));
  }, [params.id]);

  async function resetarSenhaAdmin() {
    if (!emailAdmin) return;
    setEnviandoReset(true);
    await enviarRedefinicaoSenha(emailAdmin);
    setEnviandoReset(false);
    setResetEnviado(true);
  }

  function toggleTipo(tipo: TipoPlanoDb) {
    if (!clinica) return;
    setSalvo(false);
    const atual = clinica.tipos_plano_habilitados;
    setClinica({
      ...clinica,
      tipos_plano_habilitados: atual.includes(tipo)
        ? atual.filter((t) => t !== tipo)
        : [...atual, tipo],
    });
  }

  async function salvar() {
    if (!clinica) return;
    setSalvando(true);
    setErro(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("clinicas")
      .update({
        nome: clinica.nome,
        cnpj: clinica.cnpj,
        telefone: clinica.telefone,
        email: clinica.email,
        endereco: clinica.endereco,
        cidade: clinica.cidade,
        checkout: clinica.checkout,
        comissao_percentual: clinica.comissao_percentual,
        tipos_plano_habilitados: clinica.tipos_plano_habilitados,
      })
      .eq("id", clinica.id);
    setSalvando(false);
    if (error) {
      setErro("Não foi possível salvar. Tente novamente.");
      return;
    }
    setSalvo(true);
  }

  async function excluir() {
    if (!clinica) return;
    setExcluindo(true);
    const supabase = createClient();
    const { error } = await supabase.from("clinicas").delete().eq("id", clinica.id);
    setExcluindo(false);
    if (error) {
      setErro("Não foi possível excluir. Tente novamente.");
      setExcluirOpen(false);
      return;
    }
    router.push("/admin");
  }

  if (carregando || !clinica) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-muted-foreground">
        Carregando...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Editar clínica</h1>
      <p className="mt-1 text-sm text-muted-foreground">{clinica.nome}</p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Dados da clínica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={clinica.nome}
              onChange={(e) => {
                setSalvo(false);
                setClinica({ ...clinica, nome: e.target.value });
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={clinica.cnpj}
                onChange={(e) => {
                  setSalvo(false);
                  setClinica({ ...clinica, cnpj: e.target.value });
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={clinica.cidade ?? ""}
                onChange={(e) => {
                  setSalvo(false);
                  setClinica({ ...clinica, cidade: e.target.value });
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={clinica.telefone ?? ""}
                onChange={(e) => {
                  setSalvo(false);
                  setClinica({ ...clinica, telefone: e.target.value });
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                value={clinica.email ?? ""}
                onChange={(e) => {
                  setSalvo(false);
                  setClinica({ ...clinica, email: e.target.value });
                }}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={clinica.endereco ?? ""}
              onChange={(e) => {
                setSalvo(false);
                setClinica({ ...clinica, endereco: e.target.value });
              }}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Checkout</Label>
            <Select
              value={clinica.checkout}
              onValueChange={(v) => {
                if (!v) return;
                setSalvo(false);
                setClinica({ ...clinica, checkout: v as ClinicaDb["checkout"] });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="automatico">Automático</SelectItem>
                <SelectItem value="com_confirmacao">Com confirmação</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="comissao">Comissão da plataforma (%)</Label>
            <Input
              id="comissao"
              type="number"
              step="0.1"
              value={clinica.comissao_percentual}
              onChange={(e) => {
                setSalvo(false);
                setClinica({
                  ...clinica,
                  comissao_percentual: Number(e.target.value) || 0,
                });
              }}
              className="w-32"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Tipos de plano habilitados</Label>
            <div className="space-y-1.5">
              {TODOS_TIPOS.map((tipo) => (
                <label key={tipo} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={clinica.tipos_plano_habilitados.includes(tipo)}
                    onChange={() => toggleTipo(tipo)}
                  />
                  {tiposPlanoInfoDb[tipo].label}
                </label>
              ))}
            </div>
          </div>

          {erro && <p className="text-sm text-destructive">{erro}</p>}

          <div className="flex items-center gap-3">
            <Button onClick={salvar} disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar alterações"}
            </Button>
            {salvo && (
              <span className="text-sm text-muted-foreground">Alterações salvas.</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Acesso da clínica</CardTitle>
          <CardDescription>
            {emailAdmin
              ? `Login de administração: ${emailAdmin}`
              : "Nenhum login de administração vinculado a esta clínica."}
          </CardDescription>
        </CardHeader>
        {emailAdmin && (
          <CardContent>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={resetarSenhaAdmin}
                disabled={enviandoReset}
              >
                {enviandoReset ? "Enviando..." : "Redefinir senha do admin da clínica"}
              </Button>
              {resetEnviado && (
                <span className="text-sm text-muted-foreground">
                  Link de redefinição enviado.
                </span>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      <Card className="mt-6 border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Excluir clínica</CardTitle>
          <CardDescription>
            Apaga a clínica e todos os dados ligados a ela (salas, itens,
            reservas, planos). Não dá pra desfazer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setExcluirOpen(true)}>
            Excluir clínica
          </Button>
        </CardContent>
      </Card>

      <Dialog open={excluirOpen} onOpenChange={setExcluirOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir {clinica.nome}?</DialogTitle>
            <DialogDescription>
              Essa ação remove permanentemente a clínica e todos os dados
              ligados a ela. Não dá pra desfazer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="destructive" onClick={excluir} disabled={excluindo}>
              {excluindo ? "Excluindo..." : "Sim, excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
