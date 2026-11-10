"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface CartContextValue {
  cart: Record<string, number>;
  setQty: (itemId: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Record<string, number>>({});

  function setQty(itemId: string, qty: number) {
    setCart((c) => ({ ...c, [itemId]: qty }));
  }

  function clear() {
    setCart({});
  }

  return (
    <CartContext.Provider value={{ cart, setQty, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de CartProvider");
  return ctx;
}
