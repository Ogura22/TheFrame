"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

const personas = [
  { href: "/cliente", label: "Cliente" },
  { href: "/clinica", label: "Clínica" },
  { href: "/admin", label: "Admin" },
];

export function TopNav() {
  const pathname = usePathname();

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

        <nav className="flex items-center gap-1 rounded-full border bg-muted/50 p-1">
          {personas.map((p) => {
            const active = pathname?.startsWith(p.href);
            return (
              <Link
                key={p.href}
                href={p.href}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-card text-foreground shadow-sm ring-1 ring-foreground/10"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {p.label}
              </Link>
            );
          })}
        </nav>

        <Avatar className="size-8">
          <AvatarFallback className="bg-secondary text-xs font-medium">
            MC
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
