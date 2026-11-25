"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function RedefinirSenhaPage() {
  const [verificando, setVerificando] = useState(true);
  const [sessaoValida, setSessaoValida] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // O link do e-mail estabelece a sessão de recuperação assim que a
    // página carrega no navegador (via hash/código na URL).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessaoValida(!!session);
      setVerificando(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSessaoValida(!!data.session);
      setVerificando(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setSalvando(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: senha });
    setSalvando(false);

    if (error) {
      setErro("Não foi possível alterar a senha. Tente solicitar um novo link.");
      return;
    }

    await supabase.auth.signOut();
    setConcluido(true);
  }

  if (verificando) {
    return (
      <div className="mx-auto max-w-sm px-4 py-24 text-center text-sm text-muted-foreground">
        Verificando link...
      </div>
    );
  }

  if (concluido) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Senha alterada!
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sua senha foi redefinida. Faça login novamente com a nova senha.
        </p>
        <Button className="mt-6" onClick={() => (window.location.href = "/login")}>
          Ir para o login
        </Button>
      </div>
    );
  }

  if (!sessaoValida) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Link inválido ou expirado
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Solicite um novo link de redefinição de senha.
        </p>
        <Button className="mt-6" onClick={() => (window.location.href = "/login")}>
          Voltar para o login
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4">
      <h1 className="text-2xl font-semibold tracking-tight">Nova senha</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Escolha uma nova senha para sua conta.
      </p>

      <Card className="mt-6">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="senha">Nova senha</Label>
              <Input
                id="senha"
                type="password"
                required
                minLength={6}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmar">Confirmar senha</Label>
              <Input
                id="confirmar"
                type="password"
                required
                minLength={6}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
              />
            </div>

            {erro && <p className="text-sm text-destructive">{erro}</p>}

            <Button type="submit" className="w-full" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar nova senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
