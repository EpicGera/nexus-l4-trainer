import React from "react";
import { Info } from "lucide-react";

interface HelpNoteProps {
  /** Short, plain-language "how to use / how to read this" guidance. */
  children: React.ReactNode;
  /** Optional bold lead-in (e.g. the tool name) shown before the text. */
  title?: string;
}

/**
 * A muted "cómo usar" caption shown above a chart or tool (Fase 7). Soft border
 * (no neon), low visual weight — it explains how to read the section and how the
 * data is fed, so the analytics tab stops being opaque.
 */
export default function HelpNote({ children, title }: HelpNoteProps) {
  return (
    <div className="flex items-start gap-2 border border-[color:var(--color-line)] bg-white/[0.03] px-3 py-2 text-[11px] leading-snug text-neutral-400 rounded-none">
      <Info size={13} className="mt-0.5 shrink-0 text-neutral-500" />
      <p className="min-w-0">
        {title && <span className="font-bold text-neutral-300">{title}: </span>}
        {children}
      </p>
    </div>
  );
}
