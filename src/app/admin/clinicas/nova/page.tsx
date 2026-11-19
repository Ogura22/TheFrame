"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { criarClinicaComLogin } from "@/app/admin/clinicas/actions";

function senhaTemporaria() {
  return Math.random().toString(36).slice(-10) + "Aa1!";
}

export default function NovaClinicaPage() {
  const router = useRouter();
  const [clinicaNome, setClinicaNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [cidade, setCidade] = useState("");
  const [adminNome, setAdminNome] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminSenha, setAdminSenha] = useState(senhaTemporaria());
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const resultado = await criarClinicaComLogin({
      clinicaNome,
      cnpj,
      cidade,
      adminNome,
      adminEmail,
      adminSenha,
    });

    setCarregando(false);

    if (!resultado.ok) {
      setErro(resultado.erro ?? "Não foi possível criar a clínica.");
      return;
    }

    setSucesso(true);
  }

  if (sucesso) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Clínica criada!
        </h1>
        <div className="mt-4 space-y-1 rounded-md border bg-muted/30 p-4 text-left text-sm">
          <p>
            <span className="text-muted-foreground">Login:</span>{" "}
            {adminEmail}
          </p>
          <p>
            <span className="text-muted-foreground">Senha temporária:</span>{" "}
            <span className="font-mono">{adminSenha}</span>
          </p>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Copie e envie essa senha com segurança para a clínica — ela não vai
          aparecer de novo depois que você sair desta tela.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="outline" onClick={() => router.push("/admin")}>
            Voltar para clínicas
          </Button>
          <Button onClick={() => router.refresh()}>
            Cadastrar outra clínica
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Nova clínica</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Cria a clínica e o login de administração dela.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados da clínica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="clinica-nome">Nome</Label>
              <Input
                id="clinica-nome"
                required
                value={clinicaNome}
                onChange={(e) => setClinicaNome(e.target.value)}
                placeholder="The Frame Coworking — Jardins"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  required
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  placeholder="00.000.000/0001-00"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  required
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="São Paulo, SP"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Login de administração</CardTitle>
            <CardDescription>
              A clínica usa esse e-mail/senha para entrar no painel dela.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-nome">Nome do responsável</Label>
              <Input
                id="admin-nome"
                required
                value={adminNome}
                onChange={(e) => setAdminNome(e.target.value)}
                placeholder="Dra. Karen..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-email">E-mail de login</Label>
              <Input
                id="admin-email"
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-senha">Senha temporária</Label>
              <div className="flex gap-2">
                <Input
                  id="admin-senha"
                  required
                  value={adminSenha}
                  onChange={(e) => setAdminSenha(e.target.value)}
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAdminSenha(senhaTemporaria())}
                >
                  Gerar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Compartilhe essa senha com a clínica fora do sistema (ex:
                WhatsApp) — ela deve trocar no primeiro acesso.
              </p>
            </div>
          </CardContent>
        </Card>

        {erro && <p className="text-sm text-destructive">{erro}</p>}

        <Button type="submit" className="w-full" disabled={carregando}>
          {carregando ? "Criando..." : "Criar clínica e login"}
        </Button>
      </form>
    </div>
  );
}
