"use client";

import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import type { PerfilDb } from "@/lib/db-types";

const PLACEHOLDER_FOTO = "https://picsum.photos/seed/sem-foto/200/200";

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<PerfilDb | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEnviado, setResetEnviado] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: perfilDb } = await supabase
        .from("perfis")
        .select("*")
        .eq("id", data.user.id)
        .single();
      setPerfil(perfilDb);
      setCarregando(false);
    });
  }, []);

  async function salvar() {
    if (!perfil) return;
    setSalvando(true);
    const supabase = createClient();
    await supabase
      .from("perfis")
      .update({
        nome: perfil.nome,
        especialidade: perfil.especialidade,
        registro_profissional: perfil.registro_profissional,
        endereco_cobranca: perfil.endereco_cobranca,
        celular: perfil.celular,
      })
      .eq("id", perfil.id);
    setSalvando(false);
    setSalvo(true);
  }

  async function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !perfil) return;

    const supabase = createClient();
    const caminho = `${perfil.id}/foto-${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("perfis").upload(caminho, file, {
      upsert: true,
    });
    if (error) return;

    const { data } = supabase.storage.from("perfis").getPublicUrl(caminho);
    await supabase.from("perfis").update({ foto_url: data.publicUrl }).eq("id", perfil.id);
    setPerfil({ ...perfil, foto_url: data.publicUrl });
  }

  async function enviarResetSenha() {
    if (!perfil?.email) return;
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(perfil.email);
    setResetEnviado(true);
  }

  if (carregando || !perfil) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center text-sm text-muted-foreground">
        Carregando...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <h1 className="text-2xl font-semibold tracking-tight">Meu perfil</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Dados usados no contrato, na cobrança e no contato com a clínica.
      </p>

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="group relative size-20 shrink-0 overflow-hidden rounded-full border"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={perfil.foto_url ?? PLACEHOLDER_FOTO}
            alt={perfil.nome}
            className="size-full object-cover"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-transparent transition-colors group-hover:bg-black/40 group-hover:text-white">
            <Camera className="size-5" />
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFoto}
        />
        <div>
          <p className="font-medium">{perfil.nome}</p>
          <p className="text-sm text-muted-foreground">{perfil.especialidade}</p>
        </div>
      </div>

      <Card className="mt-6">
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={perfil.nome}
              onChange={(e) => {
                setSalvo(false);
                setPerfil({ ...perfil, nome: e.target.value });
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="especialidade">Especialidade</Label>
            <Input
              id="especialidade"
              value={perfil.especialidade ?? ""}
              onChange={(e) => {
                setSalvo(false);
                setPerfil({ ...perfil, especialidade: e.target.value });
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" value={perfil.cpf ?? ""} disabled />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="registro">Registro profissional (CRO/CRM)</Label>
              <Input
                id="registro"
                value={perfil.registro_profissional ?? ""}
                onChange={(e) => {
                  setSalvo(false);
                  setPerfil({ ...perfil, registro_profissional: e.target.value });
                }}
                placeholder="Ex: CRO-SP 12345"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="endereco">Endereço de cobrança</Label>
            <Input
              id="endereco"
              value={perfil.endereco_cobranca ?? ""}
              onChange={(e) => {
                setSalvo(false);
                setPerfil({ ...perfil, endereco_cobranca: e.target.value });
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="celular">Celular</Label>
              <Input
                id="celular"
                value={perfil.celular ?? ""}
                onChange={(e) => {
                  setSalvo(false);
                  setPerfil({ ...perfil, celular: e.target.value });
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" value={perfil.email ?? ""} disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button onClick={salvar} disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar alterações"}
        </Button>
        <Button variant="outline" onClick={() => setResetOpen(true)}>
          Redefinir senha
        </Button>
        {salvo && (
          <span className="text-sm text-muted-foreground">Alterações salvas.</span>
        )}
      </div>

      <Dialog
        open={resetOpen}
        onOpenChange={(o) => {
          setResetOpen(o);
          if (!o) setResetEnviado(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redefinir senha</DialogTitle>
            <DialogDescription>
              {resetEnviado
                ? `Enviamos um link de redefinição para ${perfil.email}.`
                : "Vamos enviar um link de redefinição de senha para o seu e-mail cadastrado."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {!resetEnviado && (
              <Button onClick={enviarResetSenha}>Enviar link</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
