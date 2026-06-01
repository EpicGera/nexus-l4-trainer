import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { resolveBlockBrand } from "../lib/constants";

interface BrandInspirationAccordionProps {
  tabName: string;
  title: string;
  items: string[];
  blockId: string;
}

export default function BrandInspirationAccordion({
  tabName,
  title,
  items,
  blockId,
}: BrandInspirationAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const brand = resolveBlockBrand(tabName, title, items);

  let inspiredText = "PRVN INSPIRED";
  if (brand.emblem.includes("HAEDO")) {
    inspiredText = "ATENEO HAEDO INSPIRED";
  } else if (brand.emblem.includes("MAYHEM")) {
    inspiredText = "MAYHEM INSPIRED";
  } else if (brand.emblem.includes("HWPO")) {
    inspiredText = "HWPO INSPIRED";
  }

  let emblemEmoji = "🧬";
  if (inspiredText.includes("HAEDO")) emblemEmoji = "🥤";
  else if (inspiredText.includes("MAYHEM")) emblemEmoji = "🔥";
  else if (inspiredText.includes("HWPO")) emblemEmoji = "⛓️";

  return (
    <div
      className={`border ${brand.border} ${brand.bg} text-[10px] font-mono rounded-none select-none overflow-hidden transition-all duration-300`}
      id={`brand_badge_accordion_${blockId}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-1.5 flex items-center justify-between text-left hover:bg-white/5 transition-colors focus:outline-none cursor-pointer"
        type="button"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`${brand.text} font-black text-[9px] tracking-wider shrink-0 uppercase`}
          >
            {emblemEmoji} {inspiredText}
          </span>
        </div>
        <span className="text-[8px] text-neutral-400 font-bold shrink-0 transition-all duration-200 ml-1">
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
