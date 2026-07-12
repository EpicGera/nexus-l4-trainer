import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { getProgramStartDate, setProgramStartDate } from "../lib/programStart";
import { SectionCard, TXT, NexusButton } from "./ui/primitives";

/**
 * Ancla la fecha real de Acto I · Semana 1 · Día 1: con esto, ACOPLAR HOY
 * calcula la semana/día reales del ciclo. Sin fecha, usa la semana del
 * calendario. Autosuficiente (lee/escribe directo en programStart.ts), sin
 * dependencia de un submit — cada cambio persiste al toque.
 */
export default function ProgramCalendarCard() {
  const [programStart, setProgramStart] = useState<string>(() => getProgramStartDate() || "");

  const updateProgramStart = (iso: string) => {
    setProgramStart(iso);
    setProgramStartDate(iso || null);
    window.dispatchEvent(new Event("nexus_logs_updated"));
  };

  return (
    <SectionCard
      title="Calendario del programa"
      icon={<CalendarDays size={16} className="text-[color:var(--color-sem-cyan)]" />}
      subtitle="Ancla ACOPLAR HOY a tu ciclo real"
    >
      <p className={TXT.body}>
        Fecha en que arrancaste <strong className="text-white">Acto I · Semana 1 · Día 1</strong>.
        Con esto, <strong className="text-white">ACOPLAR HOY</strong> calcula tu semana y día reales
        del ciclo (4 semanas) de ahí en adelante. Sin fecha, usa la semana del calendario.
      </p>
      <div className="flex items-center gap-2 pt-3">
        <input
          type="date"
          value={programStart}
          onChange={(e) => updateProgramStart(e.target.value)}
          className="bg-[color:var(--color-card-2)] rounded-[var(--radius-tile)] px-3 py-2 text-white font-mono text-sm outline-none focus:ring-2 focus:ring-[color:var(--color-sem-cyan)] transition-shadow [color-scheme:dark]"
        />
        {programStart && (
          <NexusButton variant="ghost" onClick={() => updateProgramStart("")}>
            Limpiar
          </NexusButton>
        )}
      </div>
    </SectionCard>
  );
}
