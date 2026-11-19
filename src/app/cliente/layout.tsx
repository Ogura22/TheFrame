"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CartProvider } from "@/lib/cart-context";
import { ReservationProvider } from "@/lib/reservation-context";

const links = [
  { href: "/cliente", label: "Reservar" },
  { href: "/cliente/reservas", label: "Minhas Reservas" },
  { href: "/cliente/itens", label: "Adicionar Itens" },
  { href: "/cliente/planos", label: "Planos" },
  { href: "/cliente/perfil", label: "Perfil" },
];

export default function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <ReservationProvider>
    <CartProvider>
      <div>
        <div className="border-b bg-background">
          <div className="mx-auto flex max-w-xl gap-6 overflow-x-auto px-4">

            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "relative shrink-0 whitespace-nowrap py-3 text-sm font-medium transition-colors",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {l.label}
                  {active && (
                    <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
        {children}
      </div>
    </CartProvider>
    </ReservationProvider>
  );
}
