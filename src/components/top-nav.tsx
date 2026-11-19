"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";

const labelTipo: Record<string, string> = {
  super_admin: "Super Admin",
  clinica_admin: "Administração da clínica",
  recepcao: "Recepção",
  cliente: "Cliente",
};

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  return (partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "");
}

export function TopNav() {
  const router = useRouter();
  const [nome, setNome] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [tipo, setTipo] = useState<string | null>(null);
  const [perfilOpen, setPerfilOpen] = useState(false);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    let ativo = true;
    const supabase = createClient();

    async function carregarUsuario() {
      const { data } = await supabase.auth.getUser();
      if (!ativo) return;

      if (!data.user) {
        setEmail(null);
        setNome(null);
        setTipo(null);
        return;
      }

      setEmail(data.user.email ?? null);

      const { data: perfil } = await supabase
        .from("perfis")
        .select("nome, tipo")
        .eq("id", data.user.id)
        .single();

      if (!ativo) return;
      setNome(perfil?.nome ?? data.user.email ?? null);
      setTipo(perfil?.tipo ?? null);
    }

    carregarUsuario();

    // Reage a qualquer troca de sessão (login, logout, token renovado) —
    // sem isso, trocar de usuário sem dar reload deixava os dados antigos
    // visíveis no menu.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      carregarUsuario();
    });

    return () => {
      ativo = false;
      subscription.unsubscribe();
    };
  }, []);

  async function sair() {
    setSaindo(true);
    const supabase = createClient();
    await supabase.auth.signOut();

    // Mantém o modal com "Saindo..." por 2s antes de fechar e redirecionar,
    // para dar um feedback visual claro de que a ação está acontecendo.
    setTimeout(() => {
      setPerfilOpen(false);
      router.push("/login");
      router.refresh();
    }, 2000);
  }

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-xs font-bold tracking-tight text-primary-foreground">
            TF
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            The Frame
          </span>
        </Link>

        {nome && (
          <button
            type="button"
            onClick={() => setPerfilOpen(true)}
            className="rounded-full"
          >
            <Avatar className="size-8 cursor-pointer">
              <AvatarFallback className="bg-secondary text-xs font-medium">
                {iniciais(nome)}
              </AvatarFallback>
            </Avatar>
          </button>
        )}
      </div>

      <Dialog open={perfilOpen} onOpenChange={setPerfilOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Minha conta</DialogTitle>
            <DialogDescription>
              Dados de acesso ao The Frame Coworking.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3">
            <Avatar className="size-12">
              <AvatarFallback className="bg-secondary text-sm font-medium">
                {nome ? iniciais(nome) : ""}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium">{nome}</p>
              <p className="truncate text-sm text-muted-foreground">
                {email}
              </p>
            </div>
          </div>

          {tipo && (
            <Badge variant="secondary" className="w-fit">
              {labelTipo[tipo] ?? tipo}
            </Badge>
          )}

          <Button
            variant="outline"
            className="mt-2 w-full"
            disabled={saindo}
            onClick={sair}
          >
            <LogOut className="size-4" />
            {saindo ? "Saindo..." : "Sair"}
          </Button>
        </DialogContent>
      </Dialog>
    </header>
  );
}
