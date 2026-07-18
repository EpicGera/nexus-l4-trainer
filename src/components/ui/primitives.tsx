import React from "react";
import { X } from "lucide-react";

/**
 * Nexus L4 design primitives — single source of truth for section cards,
 * buttons, stat boxes and empty states across analytics & profile screens.
 *
 * Readability rules (do not regress; see DESIGN.md §2-3 for the source of truth):
 *  - Piso de tamaño: 7.5px (micro), texto identificador nunca baja de 10px (label).
 *  - Piso de contraste: --color-label (#bcbcca) mínimo sobre tarjeta. Body: --color-ink-2.
 *  - Un color semántico por sección, pasado vía `accent`.
 */

// Revamp "A×B humanizada": tarjetas mate elevadas (sombra, sin borde) sobre un
// fondo más claro; jerarquía por tipografía (Anton en títulos/números, mono en
// labels) + 4 colores semánticos. Legibilidad primero: NADA de texto por debajo
// de --color-label. El toque humano lo dan CoachNote / Scribble / rotaciones.
export const TXT = {
  sectionTitle:
    "text-sm font-brutalist tracking-[0.12em] text-white uppercase leading-snug",
  sectionSubtitle:
    "text-[10px] font-mono text-[color:var(--color-label)] uppercase tracking-wider leading-relaxed font-bold",
  label:
    "text-[10px] font-mono font-bold text-[color:var(--color-label)] uppercase tracking-[0.15em]",
  body: "text-[12px] font-mono text-[color:var(--color-ink-2)] leading-relaxed",
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
      className={`bg-[color:var(--color-card)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-5 text-left ${className}`}
    >
      <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-4">
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
  neutral: "bg-[color:var(--color-card-2)] text-[color:var(--color-ink-2)]",
  good: "bg-[color:var(--color-sem-green)] text-black",
  warn: "bg-[color:var(--color-sem-amber)] text-black",
  danger: "bg-[color:var(--color-sem-red)] text-white",
  accent: "bg-white text-black",
};

export function Pill({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-[var(--radius-tile)] text-[10px] font-mono font-bold uppercase tracking-wider leading-none ${BADGE_TONES[tone]}`}
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
  accent: "text-[color:var(--color-sem-cyan)]",
  good: "text-[color:var(--color-sem-green)]",
  warn: "text-[color:var(--color-sem-amber)]",
  danger: "text-[color:var(--color-sem-red)]",
};

/** Compact metric tile: label on top, big value, optional unit & hint. */
export function StatBox({ label, value, unit, tone = "neutral", hint }: StatBoxProps) {
  return (
    <div className="bg-[color:var(--color-card-2)] rounded-[var(--radius-tile)] p-3 text-center min-w-0">
      <div className={`${TXT.label} mb-1.5 truncate`} title={label}>
        {label}
      </div>
      <div
        className={`text-2xl font-brutalist font-black tracking-tight leading-none tabular-nums ${STAT_VALUE_TONES[tone]}`}
      >
        {value}
        {unit && (
          <span className="text-[10px] font-mono text-[color:var(--color-ink-2)] ml-1">{unit}</span>
        )}
      </div>
      {hint && (
        <div className="text-[10px] font-mono text-[color:var(--color-ink-2)] mt-1 leading-snug">{hint}</div>
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
    "bg-white text-black hover:-translate-y-px font-extrabold shadow-[var(--shadow-float)]",
  ghost:
    "bg-[color:var(--color-card-2)] text-[color:var(--color-ink-2)] hover:text-white hover:bg-[color:#26262e]",
  danger:
    "bg-[color:var(--color-sem-red)] text-white hover:-translate-y-px shadow-[0_10px_26px_-6px_rgba(255,69,58,.6)]",
  good:
    "bg-[color:var(--color-sem-green)] text-black hover:-translate-y-px shadow-[0_10px_26px_-6px_rgba(52,224,140,.5)]",
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
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[34px] rounded-[var(--radius-tile)] text-[10px] font-mono font-bold uppercase tracking-wider leading-none transition-all active:scale-95 cursor-pointer disabled:opacity-30 disabled:pointer-events-none ${BUTTON_VARIANTS[variant]} ${className}`}
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
      className={`border-2 border-dashed border-[color:var(--color-line-strong)] rounded-[var(--radius-card)] p-6 text-center space-y-1.5 ${className}`}
    >
      <p className="text-[11px] font-mono font-bold text-[color:var(--color-label)] uppercase tracking-wider">
        {message}
      </p>
      {hint && (
        <p className="text-[10px] font-mono text-[color:var(--color-ink-2)] leading-relaxed max-w-md mx-auto">
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
          className={`w-full bg-[color:var(--color-card-2)] rounded-[var(--radius-tile)] h-[38px] px-3 ${unit ? "pr-10" : ""} text-white font-mono text-sm outline-none focus:ring-2 focus:ring-[color:var(--color-sem-cyan)] transition-shadow placeholder:text-[color:var(--color-ink-faint)] ${className}`}
          {...rest}
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[color:var(--color-label)] uppercase pointer-events-none">
            {unit}
          </span>
        )}
      </div>
    );
  },
);

type BarTone = "accent" | "good" | "warn" | "danger";
const BAR_TONES: Record<BarTone, string> = {
  accent: "bg-[color:var(--color-sem-cyan)]",
  good: "bg-[color:var(--color-sem-green)]",
  warn: "bg-[color:var(--color-sem-amber)]",
  danger: "bg-[color:var(--color-sem-red)]",
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
    <div className={`w-full bg-black/50 rounded-full h-1.5 overflow-hidden ${className}`}>
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
        className={`relative flex flex-col bg-[color:var(--color-card)] shadow-[var(--shadow-card)] overflow-hidden ${
          fullScreen
            ? "w-full h-full sm:h-[92vh] sm:max-w-2xl sm:rounded-[var(--radius-card)]"
            : "w-full sm:max-w-lg max-h-[90vh] rounded-[var(--radius-card)]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || subtitle) && (
          <header className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[color:var(--color-line)] shrink-0">
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
          <footer className="shrink-0 border-t border-[color:var(--color-line)] p-4 bg-black/40">{footer}</footer>
        )}
      </div>
    </div>
  );
}

// RPE por color: fácil (blanco) → medio (ámbar) → duro (rojo señal).
function rpeTier(v: number): string {
  if (v >= 9) return "bg-[color:var(--color-sem-red)]";
  if (v >= 8) return "bg-[color:var(--color-sem-amber)]";
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
            className={`flex-1 min-w-0 py-2 rounded-[var(--radius-tile)] text-sm font-mono font-bold transition-colors cursor-pointer ${
              sel
                ? `${rpeTier(v)} text-black`
                : "bg-[color:var(--color-card-2)] text-[color:var(--color-ink-2)] hover:bg-[color:#26262e]"
            }`}
          >
            {v}
          </button>
        );
      })}
    </div>
  );
}

// ── Toque humano: notas del coach, tick de sección, círculo de birome ──────

interface CoachNoteProps {
  /** Texto de la nota; si es null/"" no renderiza nada (el silencio también es humano). */
  note?: string | null;
  /** Grados de rotación para que parezca escrito a mano (leve). */
  rotate?: number;
  className?: string;
}

/** Nota manuscrita del coach (amarillo birome, tipografía Caveat). La generan las
 *  reglas de coachNotes.ts a partir de datos reales — no es decoración fija. */
export function CoachNote({ note, rotate = 0, className = "" }: CoachNoteProps) {
  if (!note) return null;
  return (
    <p
      className={`font-hand text-[color:var(--color-pen)] text-[15px] leading-[1.25] ${className}`}
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
    >
      {note}
    </p>
  );
}

type TickTone = "red" | "cyan" | "amber" | "green" | "white";
const TICK_TONES: Record<TickTone, string> = {
  red: "bg-[color:var(--color-sem-red)] text-white shadow-[0_5px_14px_-3px_rgba(255,69,58,.55)]",
  cyan: "bg-[color:var(--color-sem-cyan)] text-black shadow-[0_5px_14px_-3px_rgba(53,214,240,.55)]",
  amber: "bg-[color:var(--color-sem-amber)] text-black shadow-[0_5px_14px_-3px_rgba(255,176,32,.55)]",
  green: "bg-[color:var(--color-sem-green)] text-black shadow-[0_5px_14px_-3px_rgba(52,224,140,.55)]",
  white: "bg-white text-black",
};

/** Cuadradito de icono al lado del título de sección: da color semántico y peso. */
export function Tick({ tone = "cyan", children }: { tone?: TickTone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-grid place-items-center w-5 h-5 rounded-[4px] text-[11px] shrink-0 ${TICK_TONES[tone]}`}
    >
      {children}
    </span>
  );
}

/** Elipse "de birome" que rodea un valor a mano. Posicionar el contenedor
 *  padre en `relative`; esto se estira sobre él (absolute inset). */
export function Scribble({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`absolute pointer-events-none ${className}`}
      style={{ inset: "-9px -12px" }}
      viewBox="0 0 120 80"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <ellipse
        cx="60" cy="40" rx="54" ry="33"
        fill="none" stroke="var(--color-pen)" strokeWidth="2" strokeLinecap="round"
        transform="rotate(-4 60 40)" opacity="0.85"
        strokeDasharray="230 40"
      />
    </svg>
  );
}
