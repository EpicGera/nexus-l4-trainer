import React from "react";
import { X } from "lucide-react";

/**
 * Nexus L4 design primitives — single source of truth for section cards,
 * buttons, stat boxes and empty states across analytics & profile screens.
 *
 * Readability rules (do not regress):
 *  - No body/label text below 10px.
 *  - Labels: neutral-400 minimum contrast. Body: neutral-300.
 *  - One accent color per section, passed via `accent`.
 */

// PRVN monochrome: la jerarquía la lleva la tipografía (Anton en títulos/números,
// mono en labels), no el color. Un solo rojo señal (#DC2626) para intensidad/alertas.
export const TXT = {
  sectionTitle:
    "text-sm font-brutalist tracking-[0.12em] text-white uppercase leading-snug",
  sectionSubtitle:
    "text-[10px] font-mono text-neutral-500 uppercase tracking-wider leading-relaxed",
  label:
    "text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-[0.15em]",
  body: "text-[11px] font-mono text-neutral-300 leading-relaxed",
  bigValue: "text-3xl font-brutalist font-black text-white tracking-tight tabular-nums",
};

interface SectionCardProps {
  title: string;
  icon?: React.ReactNode;
  subtitle?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

/** Standard section container: same border, padding and title treatment everywhere. */
export function SectionCard({
  title,
  icon,
  subtitle,
  badge,
  children,
  className = "",
  id,
}: SectionCardProps) {
  return (
    <section
      id={id}
      className={`border border-[#3F3F46] bg-[#0A0A0A] rounded-none p-5 text-left ${className}`}
    >
      <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-4 pb-3 border-b border-[#3F3F46]">
        <div className="space-y-1 min-w-0">
          <h3 className={`${TXT.sectionTitle} flex items-center gap-2`}>
            {icon}
            <span>{title}</span>
          </h3>
          {subtitle && <p className={TXT.sectionSubtitle}>{subtitle}</p>}
        </div>
        {badge && <div className="shrink-0 self-start">{badge}</div>}
      </header>
      {children}
    </section>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  tone?: "neutral" | "good" | "warn" | "danger" | "accent";
}

const BADGE_TONES: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "bg-transparent text-neutral-400 border-[#3F3F46]",
  good: "bg-white text-black border-transparent",
  warn: "bg-transparent text-white border-white/40",
  danger: "bg-signal-red/15 text-signal-red border-signal-red/40",
  accent: "bg-white text-black border-transparent",
};

export function Pill({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-1 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider leading-none ${BADGE_TONES[tone]}`}
    >
      {children}
    </span>
  );
}

interface StatBoxProps {
  label: string;
  value: React.ReactNode;
  unit?: string;
  tone?: "neutral" | "accent" | "good" | "warn" | "danger";
  hint?: string;
}

const STAT_VALUE_TONES: Record<NonNullable<StatBoxProps["tone"]>, string> = {
  neutral: "text-white",
  accent: "text-white",
  good: "text-white",
  warn: "text-neutral-400",
  danger: "text-signal-red",
};

/** Compact metric tile: label on top, big value, optional unit & hint. */
export function StatBox({ label, value, unit, tone = "neutral", hint }: StatBoxProps) {
  return (
    <div className="bg-transparent border border-[#3F3F46] rounded-none p-3 text-center min-w-0">
      <div className={`${TXT.label} mb-1.5 truncate`} title={label}>
        {label}
      </div>
      <div
        className={`text-2xl font-brutalist font-black tracking-tight leading-none tabular-nums ${STAT_VALUE_TONES[tone]}`}
      >
        {value}
        {unit && (
          <span className="text-[10px] font-mono text-neutral-400 ml-1">{unit}</span>
        )}
      </div>
      {hint && (
        <div className="text-[10px] font-mono text-neutral-400 mt-1 leading-snug">{hint}</div>
      )}
    </div>
  );
}

type ButtonVariant = "primary" | "ghost" | "danger" | "good";

interface NexusButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-white text-black hover:bg-neutral-200 border-transparent font-extrabold",
  ghost:
    "bg-transparent text-neutral-300 hover:text-black hover:bg-white border-white/20",
  danger:
    "bg-transparent text-signal-red hover:text-white hover:bg-signal-red/20 border-signal-red/40",
  good:
    "bg-transparent text-white hover:text-black hover:bg-white border-white/30",
};

/** Uniform action button: same height, font and padding for every action in the app. */
export function NexusButton({
  variant = "ghost",
  icon,
  children,
  className = "",
  ...rest
}: NexusButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-1.5 border px-3 py-2 min-h-[34px] rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider leading-none transition-all active:scale-95 cursor-pointer disabled:opacity-30 disabled:pointer-events-none ${BUTTON_VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

interface EmptyStateProps {
  message: string;
  hint?: string;
  className?: string;
}

/** Honest empty state: shown instead of fabricated chart data. */
export function EmptyState({ message, hint, className = "" }: EmptyStateProps) {
  return (
    <div
      className={`border-2 border-dashed border-[#3F3F46] rounded-sm p-6 text-center space-y-1.5 ${className}`}
    >
      <p className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
        {message}
      </p>
      {hint && (
        <p className="text-[10px] font-mono text-neutral-400 leading-relaxed max-w-md mx-auto">
          {hint}
        </p>
      )}
    </div>
  );
}

// ── Form atoms (logging UX foundation; see BLUEPRINT §3.9) ─────────────────

interface FieldProps {
  label: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** Label + control wrapper: consistent label treatment for every input. */
export function Field({ label, hint, children, className = "" }: FieldProps) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className={`${TXT.label} flex items-center justify-between gap-2`}>
        <span className="truncate">{label}</span>
        {hint && <span className="text-neutral-400 normal-case">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  unit?: string;
}

/** Uniform input: same height, font, focus treatment as the rest of the app. */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ unit, className = "", ...rest }, ref) {
    return (
      <div className="relative w-full">
        <input
          ref={ref}
          spellCheck={false}
          className={`w-full bg-black/60 border border-[#3F3F46] rounded-sm h-[38px] px-3 ${unit ? "pr-10" : ""} text-white font-mono text-sm focus:outline-none focus:border-electric-blue transition-colors placeholder:text-neutral-600 ${className}`}
          {...rest}
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-neutral-400 uppercase pointer-events-none">
            {unit}
          </span>
        )}
      </div>
    );
  },
);

type BarTone = "accent" | "good" | "warn" | "danger";
const BAR_TONES: Record<BarTone, string> = {
  accent: "bg-white",
  good: "bg-white",
  warn: "bg-neutral-500",
  danger: "bg-signal-red",
};

interface ProgressBarProps {
  /** 0..1 */
  value: number;
  tone?: BarTone;
  className?: string;
}

/** Thin progress/load bar — wizard step progress, relative-load meters, etc. */
export function ProgressBar({ value, tone = "accent", className = "" }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={`w-full bg-[#18181B] rounded-full h-1.5 overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${BAR_TONES[tone]}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

interface ModalSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  /** When true the panel fills the screen (wizard); otherwise it's a centered dialog. */
  fullScreen?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/** Themed overlay shell for modals and the full-screen logging wizard. */
export function ModalSheet({
  open,
  onClose,
  title,
  subtitle,
  fullScreen = false,
  footer,
  children,
}: ModalSheetProps) {
  // Close on Escape — keyboard users must be able to dismiss without the mouse.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-stretch sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || "Diálogo"}
        className={`relative flex flex-col bg-zinc-950 border border-[#3F3F46] shadow-2xl overflow-hidden ${
          fullScreen
            ? "w-full h-full sm:h-[92vh] sm:max-w-2xl sm:rounded-sm"
            : "w-full sm:max-w-lg max-h-[90vh] rounded-sm"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || subtitle) && (
          <header className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[#3F3F46] shrink-0">
            <div className="space-y-1 min-w-0">
              {title && <h3 className={TXT.sectionTitle}>{title}</h3>}
              {subtitle && <p className={TXT.sectionSubtitle}>{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="shrink-0 text-neutral-400 hover:text-white transition-colors leading-none px-1 cursor-pointer"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </header>
        )}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && (
          <footer className="shrink-0 border-t border-[#3F3F46] p-4 bg-black/40">{footer}</footer>
        )}
      </div>
    </div>
  );
}

// RPE es la única señal funcional por color: escala de gris (fácil) → rojo (duro).
function rpeTier(v: number): string {
  if (v >= 9) return "bg-signal-red";
  if (v >= 8.5) return "bg-signal-red/70";
  if (v >= 8) return "bg-neutral-300";
  return "bg-white";
}

interface RpeDialProps {
  value: number | null;
  onChange: (v: number) => void;
  values?: number[];
  className?: string;
}

/** RPE selector with intensity color tiers (emerald→amber→orange→rose). */
export function RpeDial({ value, onChange, values = [6, 7, 8, 9, 10], className = "" }: RpeDialProps) {
  return (
    <div role="radiogroup" aria-label="RPE" className={`flex gap-1.5 ${className}`}>
      {values.map((v) => {
        const sel = value === v;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={sel}
            aria-label={`RPE ${v}`}
            onClick={() => onChange(v)}
            className={`flex-1 min-w-0 py-2 rounded-sm border text-sm font-mono font-bold transition-colors cursor-pointer ${
              sel
                ? `${rpeTier(v)} text-black border-transparent`
                : "bg-black/40 text-neutral-300 border-[#3F3F46] hover:border-white/30"
            }`}
          >
            {v}
          </button>
        );
      })}
    </div>
  );
}
