import { UserCog, Pencil } from "lucide-react";
import { AthleteState } from "../types/workout";
import { SectionCard, NexusButton, TXT, Pill } from "./ui/primitives";

/**
 * Read-only profile summary that finally makes the athlete profile the primary
 * thing on the "Perfil & Bio" tab (it used to hide behind the telemetry board).
 * Full editing still lives in ProfileModal, reached via the prominent CTA.
 */
export default function ProfileSummaryCard({
  athlete,
  onEdit,
}: {
  athlete: AthleteState;
  onEdit: () => void;
}) {
  const eq = athlete.equipment || ({} as AthleteState["equipment"]);
  return (
    <SectionCard
      title={athlete.identity || "ATLETA NEXUS"}
      icon={<UserCog size={16} className="text-electric-blue" />}
      subtitle={athlete.level}
      badge={
        <NexusButton variant="primary" icon={<Pencil size={13} />} onClick={onEdit}>
          Editar perfil
        </NexusButton>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className={TXT.label}>Restricción de intensidad</div>
          <div className={TXT.body}>{athlete.restriction || "—"}</div>
        </div>
        <div className="space-y-1">
          <div className={TXT.label}>Condición clínica</div>
          <div className={TXT.body}>{athlete.condition || "—"}</div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10">
        <div className={`${TXT.label} mb-2`}>Equipo</div>
        <div className="flex flex-wrap gap-2">
          {eq?.grebas && <Pill tone="neutral">{eq.grebas}</Pill>}
          {eq?.amuleto && <Pill tone="neutral">{eq.amuleto}</Pill>}
          {eq?.filtro && <Pill tone="neutral">{eq.filtro}</Pill>}
          {!eq?.grebas && !eq?.amuleto && !eq?.filtro && (
            <span className={TXT.body}>Sin equipo declarado.</span>
          )}
        </div>
      </div>

      <p className="mt-4 text-[10px] font-mono text-neutral-500 leading-relaxed">
        Tus 1RM / Working Max, calendario de programa, colores y fondos se editan en el perfil completo.
      </p>
    </SectionCard>
  );
}
