import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { resolveBlockBrand, brandByKey } from "../lib/constants";

interface BrandInspirationAccordionProps {
  tabName: string;
  title: string;
  items: string[];
  blockId: string;
  /**
   * Stored inspiration brand key (Fase 3, AI-classified at import). When set the
   * badge uses it directly instead of re-guessing from keywords every render.
   */
  inspiration?: string;
}

const INSPIRED_TEXT: Record<string, string> = {
  HAEDO: "ATENEO HAEDO INSPIRED",
  MAYHEM: "MAYHEM INSPIRED",
  HWPO: "HWPO INSPIRED",
  PRVN: "PRVN INSPIRED",
};
const INSPIRED_EMOJI: Record<string, string> = {
  HAEDO: "🥤",
  MAYHEM: "🔥",
  HWPO: "⛓️",
  PRVN: "🧬",
};

export default function BrandInspirationAccordion({
  tabName,
  title,
  items,
  blockId,
  inspiration,
}: BrandInspirationAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const brand = inspiration
    ? brandByKey(inspiration)
    : resolveBlockBrand(tabName, title, items);

  const inspiredText = INSPIRED_TEXT[brand.key] || "PRVN INSPIRED";
  const emblemEmoji = INSPIRED_EMOJI[brand.key] || "🧬";

  return (
    <div
      className={`${brand.bg} text-[10px] font-mono rounded-none select-none overflow-hidden transition-all duration-300`}
      id={`brand_badge_accordion_${blockId}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-1.5 flex items-center justify-between text-left hover:bg-[color:var(--color-card-2)] transition-colors focus:outline-none cursor-pointer"
        type="button"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`${brand.text} font-black text-[11px] tracking-[0.1em] shrink-0 uppercase`}
          >
            {emblemEmoji} {inspiredText}
          </span>
        </div>
        <span className="text-[9px] text-neutral-400 font-bold shrink-0 transition-all duration-200 ml-1">
          {isOpen ? "▲ OCULTAR" : "▼ DETALLES"}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="border-t border-white/5"
          >
            <div className="px-3 py-2 bg-black/40 text-[8.5px] text-neutral-300 leading-normal font-mono">
              {brand.desc}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
