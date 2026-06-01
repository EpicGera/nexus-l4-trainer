import React from "react";
import { motion } from "framer-motion";

interface ResetConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ResetConfirmModal({
  onConfirm,
  onCancel,
}: ResetConfirmModalProps) {
  return (
    <div
      id="resetModal"
      className="fixed inset-0 bg-pure-black/95 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="border-4 border-electric-blue p-8 max-w-sm w-full bg-black text-center space-y-6 shadow-[0_0_20px_rgba(31,81,255,0.2)]"
      >
        <h3 className="text-3xl font-brutalist tracking-wider text-pure-white leading-tight">
          ¿CONFIRMAS RESETEAR EL ARCHIVO?
        </h3>
        <p className="font-condensed text-neutral-400 font-bold text-sm leading-relaxed">
          SE PERDERÁ TODA LA TELEMETRÍA Y EL HISTORIAL DE ENTRENAMIENTOS
          GUARDADOS EN ESTE NAVEGADOR HISTÓRICAMENTE.
        </p>
        <div className="flex gap-4 pt-2">
          <button
            className="flex-1 bg-pure-white text-pure-black font-brutalist py-2 text-md tracking-wider hover:bg-neutral-200 active:scale-95 transition-all cursor-pointer"
            onClick={onConfirm}
          >
            SÍ, RESETEAR
          </button>
          <button
            className="flex-1 bg-neutral-900 border border-neutral-700 text-pure-white font-brutalist py-2 text-md tracking-wider hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer"
            onClick={onCancel}
          >
            CANCELAR
          </button>
        </div>
      </motion.div>
    </div>
  );
}
