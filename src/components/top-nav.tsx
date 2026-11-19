"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  return (partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "");
}

export function TopNav() {
  const router = useRouter();
  const [nome, setNome] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setEmail(data.user.email ?? null);
      const { data: perfil } = await supabase
        .from("perfis")
        .select("nome")
        .eq("id", data.user.id)
        .single();
      setNome(perfil?.nome ?? data.user.email ?? null);
    });
  }, []);

  async function sair() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
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
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button type="button">
                  <Avatar className="size-8 cursor-pointer">
                    <AvatarFallback className="bg-secondary text-xs font-medium">
                      {iniciais(nome)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <p className="truncate">{nome}</p>
                {email && (
                  <p className="truncate text-xs font-normal text-muted-foreground">
                    {email}
                  </p>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={sair}>
                <LogOut className="size-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
