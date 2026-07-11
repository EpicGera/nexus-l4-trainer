import React from "react";
import { motion } from "motion/react";
import { User } from "firebase/auth";
import { AthleteState, DayWorkout } from "../types/workout";
import { pushAllLocalToCloud } from "../lib/syncEngine";
import {
  Trophy,
  Upload,
  FileText,
  Users,
  UserCheck,
  Plus,
  X,
} from "lucide-react";
import { SectionCard, NexusButton, Pill, TXT, EmptyState } from "./ui/primitives";

interface CrewMember {
  id: string;
  name: string;
  note: string;
}

const CREW_KEY = "nexus_crew"; // nexus_* prefix → roams via syncEngine per user

function loadCrew(): CrewMember[] {
  try {
    const raw = localStorage.getItem(CREW_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      return parsed.filter((m) => m && typeof m.name === "string");
    }
  } catch {
    /* ignore */
  }
  return [];
}

interface TelemetryBoardProps {
  athlete: AthleteState;
  currentWeek: string;
  weeklyCompletionInfo: { completedCount: number; percentage: number };
  activeDay: DayWorkout | null;
  activeDayLoggingPercentage: number;
  earnedLootList: string[];
  currentUser: User | null;
  manualSyncState: "idle" | "syncing" | "success" | "error";
  setManualSyncState: React.Dispatch<React.SetStateAction<"idle" | "syncing" | "success" | "error">>;
  setShowResetModal: (show: boolean) => void;
  setShowProfileModal: (show: boolean) => void;
  setTempAthlete: (athlete: AthleteState) => void;
  handleExportLocalHistory: () => void;
  handleExportLocalHistoryCSV: () => void;
  activeColorSet: { color: string; hover?: string; pulse?: string; text?: string; shadow?: string };
}

export default function TelemetryBoard({
  athlete,
  currentWeek,
  weeklyCompletionInfo,
  activeDay,
  activeDayLoggingPercentage,
  earnedLootList,
  currentUser,
  manualSyncState,
  setManualSyncState,
  setShowResetModal,
  setShowProfileModal,
  setTempAthlete,
  handleExportLocalHistory,
  handleExportLocalHistoryCSV,
}: TelemetryBoardProps) {
  // ── Per-athlete crew (replaces the old hardcoded co-op block) ──────────
  const [crew, setCrew] = React.useState<CrewMember[]>(loadCrew);
  const [newName, setNewName] = React.useState("");
  const [newNote, setNewNote] = React.useState("");

  const persistCrew = (next: CrewMember[]) => {
    setCrew(next);
    localStorage.setItem(CREW_KEY, JSON.stringify(next));
  };

  const addCrewMember = () => {
    const name = newName.trim();
    if (!name) return;
    persistCrew([
      ...crew,
      {
        id: `crew-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: name.toUpperCase().slice(0, 24),
        note: newNote.trim().slice(0, 40),
      },
    ]);
    setNewName("");
    setNewNote("");
  };

  const removeCrewMember = (id: string) => {
    persistCrew(crew.filter((m) => m.id !== id));
  };

  // ── CSV import (Drive workbook association) ───────────────────────────
  const [showCsvImport, setShowCsvImport] = React.useState(false);
  const [csvText, setCsvText] = React.useState("");
  const [importStatus, setImportStatus] = React.useState<"idle" | "success" | "error">("idle");
  const [importError, setImportError] = React.useState("");
  const [importMode, setImportMode] = React.useState<"merge" | "replace">("merge");
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleCsvImportSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!csvText.trim()) {
      setImportError("Por favor ingresa o arrastra datos CSV válidos.");
      setImportStatus("error");
      return;
    }

    try {
      const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length === 0) {
        throw new Error("El archivo o texto está vacío.");
      }

      // Check for header row
      let startIndex = 0;
      if (
        lines[0].toLowerCase().includes("semana") ||
        lines[0].toLowerCase().includes("ejercicio") ||
        lines[0].toLowerCase().includes("skip") ||
        lines[0].includes(",")
      ) {
        const columns = lines[0].split(",");
        const isHeader = columns.some(col => {
          const c = col.toLowerCase();
          return c.includes("skip") || c.includes("fecha") || c.includes("semana") || c.includes("día") || c.includes("dia") || c.includes("bloque") || c.includes("ejercicio");
        });
        if (isHeader) {
          startIndex = 1;
        }
      }

      const parsedLogs: Record<string, any[]> = {};
      let validRowCount = 0;

      const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = "";
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      };

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i];
        const cells = parseCSVLine(line);
        if (cells.length < 6) continue;

        const skipVal = cells[0]?.toUpperCase();
        if (skipVal === "TRUE") continue;

        const rawSemana = cells[2] || "";
        const rawDia = cells[3] || "";
        const rawEjercicio = cells[5] || "";
        const rawEsquema = cells[6] || "";
        const rawRondasCompletas = cells[9] || "";
        const rawKg = cells[12] || "";
        const rawRpe = cells[13] || "";
        const rawRir = cells[14] || "";

        if (!rawSemana || !rawDia || !rawEjercicio) {
          continue;
        }

        let weekId = "w1";
        const semLower = rawSemana.toLowerCase();
        if (semLower.includes("1") || semLower.includes("one")) weekId = "w1";
        else if (semLower.includes("2") || semLower.includes("two")) weekId = "w2";
        else if (semLower.includes("3") || semLower.includes("three")) weekId = "w3";
        else if (semLower.includes("4") || semLower.includes("four")) weekId = "w4";

        let dayNum = "1";
        const diaLower = rawDia.toLowerCase();
        if (diaLower.includes("lunes") || diaLower.includes("mon")) dayNum = "1";
        else if (diaLower.includes("martes") || diaLower.includes("tue")) dayNum = "2";
        else if (diaLower.includes("miércoles") || diaLower.includes("miercoles") || diaLower.includes("wed")) dayNum = "3";
        else if (diaLower.includes("jueves") || diaLower.includes("thu")) dayNum = "4";
        else if (diaLower.includes("viernes") || diaLower.includes("fri")) dayNum = "5";
        else if (diaLower.includes("sábado") || diaLower.includes("sabado") || diaLower.includes("sat")) dayNum = "6";
        else if (diaLower.includes("domingo") || diaLower.includes("sun")) dayNum = "7";

        const dayId = `${weekId}d${dayNum}`;
        const exerciseName = rawEjercicio.trim();

        let weightStr = "P. Corporal";
        if (rawKg && rawKg.trim() && rawKg.trim().toLowerCase() !== "body weight" && rawKg.trim().toLowerCase() !== "bodyweight" && rawKg.trim().toLowerCase() !== "bw") {
          const cleanKg = rawKg.trim().replace(/[A-Za-z\s]+/g, "");
          weightStr = cleanKg ? `${cleanKg} kg` : rawKg.trim();
        }

        let setsCount = 1;
        if (rawRondasCompletas) {
          const parsedSets = parseInt(rawRondasCompletas.trim(), 10);
          if (!isNaN(parsedSets) && parsedSets > 0) {
            setsCount = parsedSets;
          }
        }

        let repsStr = "6 reps";
        const multMatch = rawEsquema.match(/(\d+)\s*[xX]\s*(\d+)/);
        if (multMatch) {
          repsStr = `${multMatch[2]} reps`;
        } else {
          const repsMatch = rawEsquema.match(/(\d+)\s*(?:reps|repeticiones)/i);
          if (repsMatch) {
            repsStr = `${repsMatch[1]} reps`;
          } else {
            const extraReps = cells[10] || "";
            if (extraReps && !isNaN(parseInt(extraReps, 10)) && parseInt(extraReps, 10) > 0) {
              repsStr = `${extraReps} reps`;
            }
          }
        }

        const rpeVal = rawRpe.trim() || "8";
        const rirVal = rawRir.trim() || "2";

        const weekNum = parseInt(weekId.replace("w", ""), 10);
        const dNum = parseInt(dayNum, 10);
        const dayOffset = (weekNum - 1) * 7 + (dNum - 1);
        const baseTimestamp = 1779264000000;

        const localStorageKey = `nexus_logs_${dayId}_${exerciseName.replace(/\s+/g, '_')}`;

        if (!parsedLogs[localStorageKey]) {
          parsedLogs[localStorageKey] = [];
        }

        for (let s = 0; s < setsCount; s++) {
          const singleSetTimestamp = baseTimestamp + dayOffset * 24 * 60 * 60 * 1000 + s * 60 * 1000;
          parsedLogs[localStorageKey].push({
            id: `imported-${dayId}-${exerciseName.replace(/\s+/g, '_')}-${s}-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
            weight: weightStr,
            reps: repsStr,
            rpe: rpeVal,
            rir: rirVal,
            timestamp: singleSetTimestamp
          });
        }
        validRowCount++;
      }

      if (validRowCount === 0) {
        throw new Error("No se encontraron registros de entrenamiento válidos. Verifica el formato de las columnas.");
      }

      if (importMode === "replace") {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("nexus_logs_")) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }

      Object.keys(parsedLogs).forEach(key => {
        let finalLogs = parsedLogs[key];
        if (importMode === "merge") {
          const existingStr = localStorage.getItem(key);
          if (existingStr) {
            try {
              const existing = JSON.parse(existingStr);
              if (Array.isArray(existing)) {
                finalLogs = [...existing, ...parsedLogs[key]].sort((a, b) => a.timestamp - b.timestamp);
              }
            } catch (e) {
              // fallback is overwrite
            }
          }
        }
        localStorage.setItem(key, JSON.stringify(finalLogs));
      });

      window.dispatchEvent(new Event("nexus_logs_updated"));

      setImportStatus("success");
      setCsvText("");
      setImportError("");
      setTimeout(() => {
        setImportStatus("idle");
        setShowCsvImport(false);
      }, 3500);

    } catch (err: any) {
      console.error(err);
      setImportError(err?.message || "Ocurrió un error inesperado al parsear el CSV.");
      setImportStatus("error");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCsvText(event.target.result as string);
          setImportStatus("idle");
          setImportError("");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCsvText(event.target.result as string);
          setImportStatus("idle");
          setImportError("");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="mt-4 space-y-5" data-purpose="rpg-dashboard">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {/* ── 1. ATLETA ─────────────────────────────────────────────── */}
        <SectionCard
          title="ATLETA"
          icon={<UserCheck size={15} className="text-cyan-300" />}
          subtitle="Tu identidad y estado clínico"
        >
          <div className="space-y-3">
            <div>
              <div className={TXT.label}>IDENTIDAD</div>
              <div className="text-lg font-brutalist text-white tracking-wider truncate">
                {athlete.identity}
              </div>
            </div>
            <div>
              <div className={TXT.label}>CONDICIÓN CLÍNICA</div>
              <div className="text-[12px] font-condensed font-bold text-amber-400 leading-snug">
                {athlete.condition}
              </div>
            </div>
            <div>
              <div className={TXT.label}>RESTRICCIÓN ACTIVA</div>
              <div className="text-[12px] font-condensed font-bold text-neutral-300 leading-snug">
                {athlete.restriction}
              </div>
            </div>
            <NexusButton
              variant="ghost"
              onClick={() => {
                setTempAthlete(athlete);
                setShowProfileModal(true);
              }}
            >
              ⚙️ EDITAR PERFIL COMPLETO
            </NexusButton>
          </div>
        </SectionCard>

        {/* ── 2. MI EQUIPO (per-athlete, editable, synced) ──────────── */}
        <SectionCard
          title="MI EQUIPO"
          icon={<Users size={15} className="text-emerald-400" />}
          subtitle="Tus compañeros de box — solo vos los ves"
          badge={
            crew.length > 0 ? <Pill tone="good">{crew.length} EN EL CREW</Pill> : undefined
          }
        >
          <div className="space-y-3">
            {crew.length === 0 ? (
              <EmptyState
                message="Todavía no agregaste a nadie"
                hint="Sumá a tus compañeros de entrenamiento o coach. Se guardan en tu cuenta y se sincronizan entre tus dispositivos."
              />
            ) : (
              <ul className="space-y-1.5">
                {crew.map((member) => (
                  <li
                    key={member.id}
                    className="flex items-center gap-2 bg-black/60 rounded-sm px-3 py-2"
                  >
                    <span className="text-emerald-400 text-[10px]">●</span>
                    <div className="flex-grow min-w-0">
                      <div className="text-[12px] font-condensed font-bold text-white truncate">
                        {member.name}
                      </div>
                      {member.note && (
                        <div className="text-[10px] font-mono text-neutral-400 truncate">
                          {member.note}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCrewMember(member.id)}
                      className="text-[color:var(--color-label)] hover:text-rose-400 transition-colors cursor-pointer p-1"
                      title={`Quitar a ${member.name}`}
                    >
                      <X size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-col gap-1.5 pt-1 border-t border-white/5">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCrewMember()}
                placeholder="Nombre (ej: LUCAS)"
                maxLength={24}
                className="bg-black/80 rounded-sm px-3 py-2 text-[11px] font-mono text-white placeholder:text-[color:var(--color-label)] focus:outline-none focus:border-emerald-500/50"
              />
              <div className="flex gap-1.5">
                <input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCrewMember()}
                  placeholder="Nota (ej: partner de WOD)"
                  maxLength={40}
                  className="flex-grow min-w-0 bg-black/80 rounded-sm px-3 py-2 text-[11px] font-mono text-white placeholder:text-[color:var(--color-label)] focus:outline-none focus:border-emerald-500/50"
                />
                <NexusButton
                  variant="good"
                  icon={<Plus size={12} />}
                  onClick={addCrewMember}
                  disabled={!newName.trim()}
                >
                  SUMAR
                </NexusButton>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── 3. PROGRESO OPERATIVO ─────────────────────────────────── */}
        <SectionCard
          title="PROGRESO DE LA SEMANA"
          icon={<Trophy size={15} className="text-amber-400" />}
          subtitle={`Semana ${currentWeek.replace("w", "")} en curso`}
        >
          <div className="space-y-4">
            {/* Weekly completion */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-end">
                <span className={TXT.label}>DÍAS COMPLETADOS</span>
                <span className="text-[11px] font-mono font-bold text-amber-400 leading-none">
                  {weeklyCompletionInfo.completedCount} / 7 ({weeklyCompletionInfo.percentage}%)
                </span>
              </div>
              <div className="w-full h-3 bg-neutral-950 p-0.5 overflow-hidden rounded-xs">
                <motion.div
                  className="h-full bg-amber-400"
                  animate={{ width: `${weeklyCompletionInfo.percentage}%` }}
                  transition={{ type: "spring", stiffness: 85, damping: 16 }}
                />
              </div>
            </div>

            {/* Daily logging */}
            {activeDay && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-end">
                  <span className={TXT.label}>BITÁCORA DE HOY</span>
                  <span className="text-[11px] font-mono font-bold text-emerald-400 leading-none">
                    {activeDayLoggingPercentage}% REGISTRADO
                  </span>
                </div>
                <div className="w-full h-3 bg-neutral-950 p-0.5 overflow-hidden rounded-xs">
                  <motion.div
                    className="h-full bg-[#39ff14]"
                    animate={{ width: `${activeDayLoggingPercentage}%` }}
                    transition={{ type: "spring", stiffness: 90, damping: 15 }}
                  />
                </div>
                <p className="text-[10px] font-mono text-[color:var(--color-label)] leading-relaxed">
                  % de movimientos de hoy con series registradas. Tu XP y rango viven en la pestaña GUERRERO.
                </p>
              </div>
            )}

            {/* Loot */}
            {earnedLootList.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <div className={`${TXT.label} flex items-center gap-1.5`}>
                  <Trophy size={11} className="text-amber-400" />
                  BOTÍN RECLAMADO ({earnedLootList.length})
                </div>
                <div className="flex flex-wrap gap-1 max-h-[72px] overflow-y-auto pr-1">
                  {earnedLootList.map((item, index) => (
                    <span
                      key={index}
                      className="bg-neutral-900 border border-amber-400/40 text-amber-300 font-mono text-[10px] font-bold uppercase py-0.5 px-1.5 rounded-sm inline-flex items-center gap-1"
                      title="Item obtenido por Misiones Diarias"
                    >
                      🛡️ {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* ── 4. GESTIÓN DE DATOS ─────────────────────────────────────── */}
      <SectionCard
        title="GESTIÓN DE DATOS"
        icon={<Upload size={15} className="text-cyan-300" />}
        subtitle="Backups, exportación e importación de tu bitácora"
        badge={
          <Pill tone={currentUser ? "good" : "neutral"}>
            {currentUser ? "NUBE ACTIVA" : "NUBE INACTIVA"}
          </Pill>
        }
      >
        <div className="flex gap-2 flex-wrap">
          <NexusButton
            variant="ghost"
            icon={<Upload size={12} className="rotate-180" />}
            onClick={handleExportLocalHistory}
            title="Exportar bitácora local completa en archivo JSON descargable para backup"
          >
            EXPORTAR JSON
          </NexusButton>
          <NexusButton
            variant="ghost"
            icon={<FileText size={12} />}
            onClick={handleExportLocalHistoryCSV}
            title="Exportar bitácora estructurada en formato Excel (CSV) para análisis externo"
          >
            EXPORTAR CSV
          </NexusButton>
          <NexusButton
            variant="good"
            icon={<Upload size={12} />}
            onClick={() => setShowCsvImport(!showCsvImport)}
            title="Vincular tu planilla de Google Drive o cargar tu archivo CSV de entrenamientos"
          >
            IMPORTAR CSV (DRIVE)
          </NexusButton>
          <NexusButton
            variant="good"
            disabled={!currentUser || manualSyncState === "syncing"}
            onClick={async () => {
              if (currentUser) {
                setManualSyncState("syncing");
                try {
                  await pushAllLocalToCloud(currentUser.uid);
                  window.dispatchEvent(new Event("nexus_cloud_synced"));
                  setManualSyncState("success");
                  setTimeout(() => setManualSyncState("idle"), 3000);
                } catch (e) {
                  console.error(e);
                  setManualSyncState("error");
                  setTimeout(() => setManualSyncState("idle"), 3000);
                }
              }
            }}
            title={
              currentUser
                ? "Forzar persistencia completa ahora"
                : "Inicia sesión para subir backups"
            }
          >
            {manualSyncState === "syncing"
              ? "⏳ SUBIENDO..."
              : manualSyncState === "success"
                ? "✓ BACKUP OK"
                : manualSyncState === "error"
                  ? "❌ ERROR SYNC"
                  : "☁️ FORZAR SYNC NUBE"}
          </NexusButton>
          <NexusButton
            variant="danger"
            onClick={() => setShowResetModal(true)}
          >
            RESET ARCHIVO
          </NexusButton>
        </div>

        {showCsvImport && (
          <div className="mt-4 p-4 bg-zinc-950/95 border-2 border-[#10b981]/30 rounded-lg flex flex-col gap-4 text-left font-condensed relative">
            <div className="absolute top-0 left-5 right-5 h-0.5 bg-gradient-to-r from-transparent via-[#10b981]/50 to-transparent" />
            <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
              <div className="flex items-center gap-1.5 font-mono text-xs text-[#10b981] font-extrabold uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-ping" />
                NEXUS SYSTEM // ASOCIAR BITÁCORA DRIVE
              </div>
              <NexusButton
                variant="ghost"
                onClick={() => {
                  setShowCsvImport(false);
                  setImportStatus("idle");
                }}
              >
                CERRAR
              </NexusButton>
            </div>

            <p className="text-zinc-400 text-xs leading-relaxed normal-case font-normal">
              Asocia tu bitácora de Google Drive arrastrando tu archivo CSV o copiando y pegando el texto de las celdas aquí. Esto mapeará tus series de halterofilia e intensidad acumulada para que puedas evaluar tu volumen en el dashboard.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleFileDrop}
                className={`border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                  dragActive
                    ? "border-[#10b981] bg-[#10b981]/10 text-[#10b981]"
                    : "border-zinc-850 hover:border-zinc-700 bg-black/60 text-zinc-400 hover:bg-black/80"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv"
                  className="hidden"
                />
                <Upload className="text-[#10b981] mb-2" size={20} />
                <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-[#10b981] block">
                  Arrastra aquí tu CSV de Drive
                </span>
                <span className="text-[10px] text-[color:var(--color-label)] block mt-1 uppercase font-mono tracking-tight">
                  O HAZ CLIC PARA AGREGAR ARCHIVO
                </span>
              </div>

              {/* Paste Area */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-400 flex items-center gap-1 text-left">
                  <span className="h-1 w-1 rounded-full bg-zinc-400" /> O PEGA EL DETALLE DE LAS CELDAS DIRECTO:
                </span>
                <textarea
                  rows={4}
                  value={csvText}
                  onChange={(e) => {
                    setCsvText(e.target.value);
                    if (importStatus === "error") setImportStatus("idle");
                  }}
                  placeholder="FALSE,,Semana 1,Lunes,Fuerza,Back Squat,4x6 @ 65-70% RM (Tempo 21X1 / Rest 90s),65-70%,Tempo 21X1 / Rest 90s,4,0,0:14:00,80,7,3,Rx,,"
                  className="w-full h-full bg-black/90 text-zinc-300 font-mono text-[10px] border border-zinc-850 p-2 text-left rounded focus:outline-none focus:border-[#10b981] transition-all whitespace-pre leading-relaxed scrollbar-thin"
                />
              </div>
            </div>

            {/* Mode Select & Submit Button */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-black/40 p-3 rounded border border-zinc-900">
              <div className="flex items-center gap-3 text-left">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-black">
                  MODO:
                </span>
                <div className="flex gap-1 bg-black p-0.5 rounded border border-zinc-850">
                  <button
                    type="button"
                    onClick={() => setImportMode("merge")}
                    className={`px-3 py-1.5 text-[10px] font-mono font-bold tracking-wider uppercase rounded-sm cursor-pointer transition-all ${
                      importMode === "merge"
                        ? "bg-[#10b981] text-black font-extrabold"
                        : "text-[color:var(--color-label)] hover:text-white"
                    }`}
                    title="Suma las series importadas a tu historial actual sin borrar tus otros registros"
                  >
                    Fusionar
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportMode("replace")}
                    className={`px-3 py-1.5 text-[10px] font-mono font-bold tracking-wider uppercase rounded-sm cursor-pointer transition-all ${
                      importMode === "replace"
                        ? "bg-red-500 text-black font-extrabold"
                        : "text-[color:var(--color-label)] hover:text-white"
                    }`}
                    title="¡ALERTA! Elimina todos los registros actuales para sustituirlos por la historia de Drive"
                  >
                    Sobrescribir
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 flex-wrap">
                {importStatus === "success" && (
                  <span className="text-[#10b981] font-bold font-mono text-[10px] tracking-wider uppercase">
                    ✓ ¡HISTORIAL DRIVE INTEGRADO CON ÉXITO!
                  </span>
                )}
                {importStatus === "error" && (
                  <span className="text-red-400 font-bold font-mono text-[10px] tracking-wider uppercase">
                    ❌ {importError}
                  </span>
                )}

                <NexusButton
                  variant="primary"
                  onClick={() => handleCsvImportSubmit()}
                  disabled={!csvText.trim()}
                >
                  PROCESAR Y SINCRONIZAR
                </NexusButton>
              </div>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
