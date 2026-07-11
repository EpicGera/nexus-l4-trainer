import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

interface ToastItem {
  id: number;
  message: string;
  kind: "success" | "error" | "info";
  durationMs: number;
}

const KIND_STYLES = {
  success: { border: "#10b981", icon: <CheckCircle2 size={18} className="text-emerald-400" /> },
  error: { border: "#ef4444", icon: <AlertTriangle size={18} className="text-red-400" /> },
  info: { border: "#1f51ff", icon: <Info size={18} className="text-electric-blue" /> },
};

export default function Toast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      const id = Date.now() + Math.random();
      const item: ToastItem = {
        id,
        message: detail.message || "",
        kind: detail.kind || "info",
        durationMs: detail.durationMs || 6000,
      };
      setToasts((prev) => [...prev, item]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, item.durationMs);
    };
    window.addEventListener("nexus_toast", handler);
    return () => window.removeEventListener("nexus_toast", handler);
  }, []);

  const dismiss = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return createPortal(
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[400] flex flex-col gap-2 w-[92vw] max-w-md pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const style = KIND_STYLES[t.kind];
          return (
            <motion.div
              key={t.id}
              initial={{ y: 40, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="pointer-events-auto bg-[#0a0a0e] border-2 px-4 py-3 flex items-start gap-3 shadow-[0_10px_40px_rgba(0,0,0,0.85)]"
              style={{ borderColor: style.border }}
            >
              <span className="shrink-0 mt-0.5">{style.icon}</span>
              <p className="flex-grow text-sm font-condensed font-bold text-white leading-snug break-words">
                {t.message}
              </p>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 text-[color:var(--color-label)] hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body
  );
}
