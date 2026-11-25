"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, CalendarPlus, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { CartProvider } from "@/lib/cart-context";
import { ReservationProvider } from "@/lib/reservation-context";
import { ClinicaProvider } from "@/lib/clinica-context";

const links = [
  { href: "/cliente/perfil", label: "Perfil", icon: User },
  { href: "/cliente", label: "Reservar", icon: CalendarPlus },
  { href: "/cliente/reservas", label: "Minhas Reservas", icon: CalendarCheck },
  { href: "/cliente/itens", label: "Itens", icon: ShoppingBag },
];

export function ClienteShell({
  clinicaId,
  clinicaNome,
  children,
}: {
  clinicaId: string;
  clinicaNome: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <ClinicaProvider clinicaId={clinicaId} clinicaNome={clinicaNome}>
      <ReservationProvider>
        <CartProvider>
          <div>
            <div className="border-b bg-background/95 backdrop-blur">
              <div className="mx-auto flex max-w-xl gap-1 overflow-x-auto px-3 py-2">
                {links.map((l) => {
                  const active =
                    l.href === "/cliente"
                      ? pathname === "/cliente"
                      : pathname?.startsWith(l.href);
                  const Icon = l.icon;
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={cn(
                        "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-secondary text-secondary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="size-4" />
                      {l.label}
                    </Link>
                  );
                })}
              </div>
            </div>
            {children}
          </div>
        </CartProvider>
      </ReservationProvider>
    </ClinicaProvider>
  );
}
