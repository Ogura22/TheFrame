"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function CadastroPage() {
  return (
    <Suspense>
      <CadastroForm />
    </Suspense>
  );
}

function CadastroForm() {
  const searchParams = useSearchParams();
  const clinicaId = searchParams.get("clinica");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [celular, setCelular] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [confirmacaoEnviada, setConfirmacaoEnviada] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome, celular, clinica_id: clinicaId ?? undefined },
      },
    });

    setCarregando(false);

    if (error) {
      setErro(
        error.message.includes("already registered")
          ? "Já existe uma conta com esse e-mail."
          : "Não foi possível criar a conta. Tente novamente."
      );
      return;
    }

    // Projeto com confirmação de e-mail ativada: sem sessão ainda.
    if (!data.session) {
      setConfirmacaoEnviada(true);
      return;
    }

    window.location.href = "/";
  }

  if (confirmacaoEnviada) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Confirme seu e-mail
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enviamos um link de confirmação para {email}. Clique nele para
          ativar sua conta e depois faça login.
        </p>
        <Button className="mt-6" render={<Link href="/login" />}>
          Ir para o login
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4">
      <h1 className="text-2xl font-semibold tracking-tight">Criar conta</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        The Frame Coworking
      </p>

      <Card className="mt-6">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="celular">Celular</Label>
              <Input
                id="celular"
                required
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                required
                minLength={6}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>

            {erro && <p className="text-sm text-destructive">{erro}</p>}

            <Button type="submit" className="w-full" disabled={carregando}>
              {carregando ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-foreground underline underline-offset-2">
          Entrar
        </Link>
      </p>
    </div>
  );
}
