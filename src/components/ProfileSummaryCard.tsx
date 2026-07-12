import { useState } from "react";
import { UserCog, Settings } from "lucide-react";
import { AthleteState } from "../types/workout";
import { SectionCard, NexusButton, TXT } from "./ui/primitives";

/**
 * Ficha del atleta: identidad y restricción de intensidad, editables in situ
 * (sin submit — cada campo persiste solo en blur/Enter). Level/condición
 * clínica/equipamiento se retiraron (solo alimentaban tips de un wizard que
 * el usuario no encontraba útiles y no tocaban el programa ni la IA).
 */
export default function ProfileSummaryCard({
  athlete,
  handleUpdateAthlete,
  onRecalibrate,
}: {
  athlete: AthleteState;
  handleUpdateAthlete: (athlete: AthleteState) => void;
  onRecalibrate: () => void;
}) {
  const [identity, setIdentity] = useState(athlete.identity);
  const [restriction, setRestriction] = useState(athlete.restriction || "");

  const commitIdentity = () => {
    const v = identity.trim().toUpperCase();
    if (v && v !== athlete.identity) handleUpdateAthlete({ ...athlete, identity: v });
    else setIdentity(athlete.identity);
  };
  const commitRestriction = () => {
    if (restriction !== (athlete.restriction || "")) {
      handleUpdateAthlete({ ...athlete, restriction });
    }
  };

  return (
    <SectionCard
      title="Ficha del atleta"
      icon={<UserCog size={16} className="text-[color:var(--color-sem-cyan)]" />}
      subtitle="Identidad y restricción de intensidad"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className={TXT.label}>Identidad</div>
          <input
            type="text"
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
            onBlur={commitIdentity}
            onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
            placeholder="EJ: GERA & FLOR"
            className="w-full bg-[color:var(--color-card-2)] rounded-[var(--radius-tile)] px-3 py-2 text-white font-brutalist text-sm uppercase tracking-wide outline-none focus:ring-2 focus:ring-[color:var(--color-sem-cyan)] transition-shadow placeholder:text-[color:var(--color-ink-faint)]"
          />
        </div>
        <div className="space-y-1">
          <div className={TXT.label}>Restricción de intensidad</div>
          <input
            type="text"
            value={restriction}
            onChange={(e) => setRestriction(e.target.value)}
            onBlur={commitRestriction}
            onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
            placeholder="EJ: RPE 8/10 MÁX"
            className="w-full bg-[color:var(--color-card-2)] rounded-[var(--radius-tile)] px-3 py-2 text-white font-mono text-sm outline-none focus:ring-2 focus:ring-[color:var(--color-sem-cyan)] transition-shadow placeholder:text-[color:var(--color-ink-faint)]"
          />
        </div>
      </div>

      <NexusButton
        variant="ghost"
        icon={<Settings size={13} aria-hidden="true" />}
        onClick={onRecalibrate}
        className="mt-4 w-full sm:w-auto"
        title="Volver a responder el cuestionario y recomputar tu punto de referencia"
      >
        Calibrar atleta (onboarding)
      </NexusButton>
    </SectionCard>
  );
}
