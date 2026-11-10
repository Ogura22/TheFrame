import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const cards = [
  {
    href: "/cliente",
    title: "Cliente",
    description:
      "Reserve sua sala, veja horários disponíveis e assine o contrato digitalmente.",
  },
  {
    href: "/clinica",
    title: "Clínica",
    description:
      "Gerencie a agenda das salas, pagamentos e política de cancelamento.",
  },
  {
    href: "/admin",
    title: "Admin",
    description:
      "Visão consolidada de todas as clínicas e da receita da plataforma.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-24 text-center">
      <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
        Protótipo de validação — V1
      </span>
      <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
        The Frame Coworking
      </h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        Gestão de locação de horários em consultórios clínicos de
        odontologia e HOF. Escolha uma visão para explorar o protótipo.
      </p>

      <div className="mt-12 grid w-full gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.href} href={c.href}>
            <Card className="h-full text-left transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle>{c.title}</CardTitle>
                <CardDescription>{c.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <Link
        href="/cliente"
        className={cn(buttonVariants({ size: "lg" }), "mt-10")}
      >
        Começar pela visão do Cliente
      </Link>
    </div>
  );
}
