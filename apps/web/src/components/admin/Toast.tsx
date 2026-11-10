"use client";

import { createContext, useCallback, useContext, useState } from "react";

type Toast = { id: number; text: string; kind: "success" | "error" };
const Ctx = createContext<(text: string, kind?: Toast["kind"]) => void>(() => {});
export const useToast = () => useContext(Ctx);

/** Lightweight toast notifications for the admin panel. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, kind: Toast["kind"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[min(360px,calc(100vw-2.5rem))] flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} role={t.kind === "error" ? "alert" : "status"}
            className={`pointer-events-auto rounded-lg px-4 py-3 text-[14px] font-medium text-white shadow-lg animate-[toast-in_.25s_ease-out] ${t.kind === "error" ? "bg-red-600" : "bg-brand"}`}>
            {t.text}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
