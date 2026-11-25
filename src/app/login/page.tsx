"use client";

import { useState } from "react";
import Link from "next/link";
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
import { enviarRedefinicaoSenha } from "@/lib/reset-password";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const [esqueciOpen, setEsqueciOpen] = useState(false);
  const [emailEsqueci, setEmailEsqueci] = useState("");
  const [enviandoReset, setEnviandoReset] = useState(false);
  const [resetEnviado, setResetEnviado] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    setCarregando(false);

    if (error) {
      setErro("E-mail ou senha incorretos.");
      return;
    }

    // Navegação completa (não client-side): garante que o middleware rode
    // do zero e nenhuma página da sessão anterior fique em cache no navegador.
    window.location.href = "/";
  }

  async function handleEsqueciSenha() {
    if (!emailEsqueci) return;
    setEnviandoReset(true);
    await enviarRedefinicaoSenha(emailEsqueci);
    setEnviandoReset(false);
    setResetEnviado(true);
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4">
      <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        The Frame Coworking
      </p>

      <Card className="mt-6">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="senha">Senha</Label>
                <button
                  type="button"
                  onClick={() => {
                    setEmailEsqueci(email);
                    setResetEnviado(false);
                    setEsqueciOpen(true);
                  }}
                  className="text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
                >
                  Esqueci minha senha
                </button>
              </div>
              <Input
                id="senha"
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>

            {erro && <p className="text-sm text-destructive">{erro}</p>}

            <Button type="submit" className="w-full" disabled={carregando}>
              {carregando ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Não tem conta?{" "}
        <Link href="/cadastro" className="font-medium text-foreground underline underline-offset-2">
          Cadastre-se
        </Link>
      </p>

      <Dialog open={esqueciOpen} onOpenChange={setEsqueciOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redefinir senha</DialogTitle>
            <DialogDescription>
              {resetEnviado
                ? `Se existir uma conta com o e-mail ${emailEsqueci}, enviamos um link de redefinição.`
                : "Informe o e-mail da sua conta para receber o link de redefinição."}
            </DialogDescription>
          </DialogHeader>

          {!resetEnviado && (
            <div className="space-y-1.5">
              <Label htmlFor="email-esqueci">E-mail</Label>
              <Input
                id="email-esqueci"
                type="email"
                value={emailEsqueci}
                onChange={(e) => setEmailEsqueci(e.target.value)}
              />
            </div>
          )}

          <DialogFooter>
            {!resetEnviado && (
              <Button onClick={handleEsqueciSenha} disabled={enviandoReset || !emailEsqueci}>
                {enviandoReset ? "Enviando..." : "Enviar link"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
