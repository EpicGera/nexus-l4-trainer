import React from "react";
import { Info } from "lucide-react";

interface HelpNoteProps {
  /** Short, plain-language "how to use / how to read this" guidance. */
  children: React.ReactNode;
  /** Optional bold lead-in (e.g. the tool name) shown before the text. */
  title?: string;
  className?: string;
}

/**
 * A muted "cómo usar" caption shown above a chart or tool. Low visual weight —
 * explica cómo leer la sección y de dónde salen los datos, sin ser una caja más.
 */
export default function HelpNote({ children, title, className = "" }: HelpNoteProps) {
  return (
    <div className={`flex items-start gap-2 bg-white/[0.04] px-3 py-2 text-[11px] leading-snug text-[color:var(--color-ink-2)] rounded-[var(--radius-tile)] ${className}`}>
      <Info size={13} className="mt-0.5 shrink-0 text-[color:var(--color-label)]" />
      <p className="min-w-0">
        {title && <span className="font-bold text-white">{title}: </span>}
        {children}
      </p>
    </div>
  );
}
