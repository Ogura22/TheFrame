"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { clienteLogado, termosContratoExemplo } from "@/lib/mock-data";
import { registrarAceite } from "@/lib/audit";

export function TermsGateDialog({
  open,
  onOpenChange,
  onConfirm,
  confirmLabel = "Confirmar e pagar",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  confirmLabel?: string;
}) {
  const [lido, setLido] = useState(false);
  const [aceite, setAceite] = useState(false);
  const [registrando, setRegistrando] = useState(false);

  // Reseta a cada vez que o modal abre — o cliente precisa confirmar de novo.
  useEffect(() => {
    if (open) {
      setLido(false);
      setAceite(false);
      setRegistrando(false);
    }
  }, [open]);

  async function confirmar() {
    setRegistrando(true);
    await registrarAceite(termosContratoExemplo, clienteLogado);
    setRegistrando(false);
    onConfirm();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Contrato de locação</DialogTitle>
          <DialogDescription>
            Leia o contrato até o fim para liberar o aceite.
          </DialogDescription>
        </DialogHeader>

        <pre
          onScroll={(e) => {
            const el = e.currentTarget;
            if (el.scrollTop + el.clientHeight >= el.scrollHeight - 16) {
              setLido(true);
            }
          }}
          className="min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap rounded-md border bg-muted/30 p-3 font-sans text-xs text-muted-foreground"
        >
          {termosContratoExemplo}
        </pre>

        <label
          className={`flex items-start gap-2 text-xs ${
            lido ? "text-muted-foreground" : "text-muted-foreground/40"
          }`}
        >
          <input
            type="checkbox"
            checked={aceite}
            disabled={!lido}
            onChange={(e) => setAceite(e.target.checked)}
            className="mt-0.5"
          />
          Li e estou de acordo com o contrato de locação da sala e com a
          política de cancelamento da clínica.
          {!lido && " (role o texto até o fim para habilitar)"}
        </label>

        <DialogFooter>
          <Button disabled={!aceite || registrando} onClick={confirmar}>
            {registrando ? "Registrando aceite..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
