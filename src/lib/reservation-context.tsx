"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { salas } from "@/lib/mock-data";

interface ReservationContextValue {
  salaId: string;
  setSalaId: (id: string) => void;
  data: Date | undefined;
  setData: (d: Date | undefined) => void;
  range: [string, string] | null;
  setRange: (r: [string, string] | null) => void;
  temReservaEmAndamento: boolean;
  abrirCheckout: boolean;
  solicitarCheckout: () => void;
  limparSolicitacaoCheckout: () => void;
  reset: () => void;
}

const ReservationContext = createContext<ReservationContextValue | null>(
  null
);

export function ReservationProvider({ children }: { children: ReactNode }) {
  const [salaId, setSalaId] = useState(salas[0].id);
  // Começa vazio: new Date() no estado inicial quebra o prerender (Cache Components)
  const [data, setData] = useState<Date | undefined>(undefined);
  const [range, setRange] = useState<[string, string] | null>(null);
  const [abrirCheckout, setAbrirCheckout] = useState(false);

  // Define a data de hoje só no navegador, sem sobrescrever uma escolha do usuário
  useEffect(() => {
    setData((atual) => atual ?? new Date());
  }, []);

  function reset() {
    setRange(null);
  }

  return (
    <ReservationContext.Provider
      value={{
        salaId,
        setSalaId,
        data,
        setData,
        range,
        setRange,
        temReservaEmAndamento: !!range,
        abrirCheckout,
        solicitarCheckout: () => setAbrirCheckout(true),
        limparSolicitacaoCheckout: () => setAbrirCheckout(false),
        reset,
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservation() {
  const ctx = useContext(ReservationContext);
  if (!ctx)
    throw new Error("useReservation deve ser usado dentro de ReservationProvider");
  return ctx;
}
