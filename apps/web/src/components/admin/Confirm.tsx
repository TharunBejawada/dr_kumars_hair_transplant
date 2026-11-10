"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type Opts = { title: string; message?: string; confirmLabel?: string; danger?: boolean };
const Ctx = createContext<(o: Opts) => Promise<boolean>>(async () => false);
export const useConfirm = () => useContext(Ctx);

/** Styled replacement for window.confirm(). `await confirm({...})` resolves true/false. */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [opts, setOpts] = useState<Opts | null>(null);
  const resolver = useRef<(v: boolean) => void>(() => {});
  const confirm = useCallback((o: Opts) => new Promise<boolean>((res) => { resolver.current = res; setOpts(o); }), []);
  const close = (v: boolean) => { resolver.current(v); setOpts(null); };

  useEffect(() => {
    if (!opts) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [opts]);

  return (
    <Ctx.Provider value={confirm}>
      {children}
      {opts && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4" onClick={() => close(false)}>
          <div role="alertdialog" aria-modal="true" aria-labelledby="cf-t" className="w-full max-w-[420px] rounded-xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 id="cf-t" className="text-[18px] font-semibold">{opts.title}</h2>
            {opts.message && <p className="mt-2 text-[14px] text-gray-600">{opts.message}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button autoFocus onClick={() => close(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-[14px] font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={() => close(true)} className={`rounded-lg px-4 py-2 text-[14px] font-semibold text-white ${opts.danger ? "bg-red-600 hover:bg-red-700" : "bg-brand hover:bg-brand-2"}`}>{opts.confirmLabel ?? "Confirm"}</button>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}
