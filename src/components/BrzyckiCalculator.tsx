// FILE_PATH: /src/components/BrzyckiCalculator.tsx
// ACTION: CREATE
// DESCRIPTION: Interactive Brzycki 1RM Estimator & Load Calibrator tool styled in alignment with Nexus L4.
// ---------------------------------------------------------------------------------------------------------
import React, { useState, useEffect, useMemo } from 'react';
import { Dumbbell, Award, Flame, AlertCircle, RefreshCw, Calculator, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LogItem {
  weight: string;
  reps: string;
  rpe: string;
  timestamp: number;
}

interface AnalyzedExercise {
  name: string;
  rawName: string;
  maxWeight: number;
  bestBrzycki1RM: number;
  bestSet: {
    weight: number;
    reps: number;
    rpe: string;
    timestamp: number;
  } | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: 'spring', 
      stiffness: 260, 
      damping: 20 
    } 
  }
};

export default function BrzyckiCalculator() {
  const [exercises, setExercises] = useState<AnalyzedExercise[]>([]);
  const [selectedExerciseName, setSelectedExerciseName] = useState<string>('custom');
  
  // Input states
  const [customWeight, setCustomWeight] = useState<string>('');
  const [customReps, setCustomReps] = useState<string>('');
  const [showFormulaInfo, setShowFormulaInfo] = useState<boolean>(false);

  // Load registered exercises from localStorage
  const scanLogsAndCalculateRMs = () => {
    const list: AnalyzedExercise[] = [];
    const exerciseMap = new Map<string, {
      maxWeight: number;
      bestBrzycki1RM: number;
      bestSet: { weight: number; reps: number; rpe: string; timestamp: number } | null;
    }>();

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('nexus_logs_')) {
        // Regex to parse: nexus_logs_dayId_exerciseName
        const match = key.match(/^nexus_logs_[a-zA-Z0-9]+_[a-zA-Z0-9]+_(.+)$/);
        if (match) {
          const rawName = match[1];
          const friendlyName = rawName.replace(/_+/g, ' ');

          try {
            const saved = localStorage.getItem(key);
            if (saved) {
              const logs: LogItem[] = JSON.parse(saved);
              if (Array.isArray(logs)) {
                logs.forEach((log) => {
                  const wMatch = log.weight.match(/(\d+(?:\.\d+)?)/);
                  const rMatch = log.reps.match(/(\d+)/);

                  if (wMatch && rMatch) {
                    const weightVal = parseFloat(wMatch[1]);
                    const repsVal = parseInt(rMatch[1], 10);

                    if (weightVal > 0 && repsVal > 0) {
                      // Calculate 1RM using Brzycki: Weight / (1.0278 - 0.0278 * Reps)
                      let brzycki1RM = weightVal;
                      if (repsVal > 1) {
                        const divisor = 1.0278 - (0.0278 * repsVal);
                        if (divisor > 0) {
                          brzycki1RM = weightVal / divisor;
                        }
                      }

                      const existing = exerciseMap.get(friendlyName);
                      if (!existing || brzycki1RM > existing.bestBrzycki1RM) {
                        exerciseMap.set(friendlyName, {
                          maxWeight: Math.max(existing?.maxWeight || 0, weightVal),
                          bestBrzycki1RM: brzycki1RM,
                          bestSet: {
                            weight: weightVal,
                            reps: repsVal,
                            rpe: log.rpe,
                            timestamp: log.timestamp
                          }
                        });
                      }
                    }
                  }
                });
              }
            }
          } catch (e) {
            console.error('Error scanning logs in 1RM estimator', e);
          }
        }
      }
    }

    // Convert map to sorted array
    exerciseMap.forEach((val, name) => {
      list.push({
        name,
        rawName: name.replace(/\s+/g, '_'),
        ...val
      });
    });

    // Sort by name
    list.sort((a, b) => b.bestBrzycki1RM - a.bestBrzycki1RM);
    setExercises(list);
  };

  useEffect(() => {
    scanLogsAndCalculateRMs();

    // Listen to updates
    const handleLogsUpdate = () => {
      scanLogsAndCalculateRMs();
    };
    window.addEventListener('nexus_logs_updated', handleLogsUpdate);
    window.addEventListener('storage', handleLogsUpdate);

    return () => {
      window.removeEventListener('nexus_logs_updated', handleLogsUpdate);
      window.removeEventListener('storage', handleLogsUpdate);
    };
  }, []);

  // Sync inputs when selecting an exercise from the list
  useEffect(() => {
    if (selectedExerciseName === 'custom' || selectedExerciseName === '') {
      // Don't auto-fill
      return;
    }

    const found = exercises.find(ex => ex.name === selectedExerciseName);
    if (found && found.bestSet) {
      setCustomWeight(String(found.bestSet.weight));
      setCustomReps(String(found.bestSet.reps));
    }
  }, [selectedExerciseName, exercises]);

  // Calculate current 1RM in real-time
  const calculatedResult = useMemo(() => {
    const w = parseFloat(customWeight);
    const r = parseInt(customReps, 10);

    if (isNaN(w) || w <= 0 || isNaN(r) || r <= 0) {
      return null;
    }

    // If reps are 1, 1RM is simply the weight
    if (r === 1) {
      return {
        oneRepMax: w,
        isOptimal: true,
        repsWarning: false
      };
    }

    const divisor = 1.0278 - (0.0278 * r);
    if (divisor <= 0) {
      return null;
    }

    const oneRepMax = w / divisor;

    return {
      oneRepMax: Math.round(oneRepMax * 10) / 10,
      isOptimal: r <= 10,
      repsWarning: r > 10
    };
  }, [customWeight, customReps]);

  // Generate percentage matrix based on 1RM
  const percentageMatrix = useMemo(() => {
    if (!calculatedResult) return [];
    const max = calculatedResult.oneRepMax;
    
    // CF-L4 Standard working zone mapping
    return [
      { percentage: 95, label: 'Fuerza Absoluta / RPE 9.5', weight: Math.round(max * 0.95 * 10) / 10 },
      { percentage: 90, label: 'Fuerza Máxima / RPE 9.0', weight: Math.round(max * 0.90 * 10) / 10 },
      { percentage: 85, label: 'Desarrollo Potencia / RPE 8.5 (PRVN Line)', weight: Math.round(max * 0.85 * 10) / 10 },
      { percentage: 80, label: 'Hipertrofia Densa / RPE 8.0 (HWPO Grind)', weight: Math.round(max * 0.80 * 10) / 10 },
      { percentage: 75, label: 'Resistencia de Fuerza / RPE 7.5', weight: Math.round(max * 0.75 * 10) / 10 },
      { percentage: 70, label: 'Velocidad Transición / RPE 7.0 (Sincro Mayhem)', weight: Math.round(max * 0.70 * 10) / 10 },
      { percentage: 65, label: 'Descarga / Recuperación Balde', weight: Math.round(max * 0.65 * 10) / 10 }
    ];
  }, [calculatedResult]);

  return (
    <div className="p-5 border border-white/10 bg-pure-black/95 relative overflow-hidden" id="brzycki-calibrator-tool">
      <div className="absolute top-0 right-0 p-3 select-none pointer-events-none opacity-5 font-brutalist text-6xl text-white">1RM</div>
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-white/10 pb-4 mb-4">
        <div className="space-y-1">
          <h4 className="text-xl font-brutalist tracking-wider text-pure-white flex items-center gap-2">
            <Calculator className="text-[#00F0FF] animate-pulse" size={20} />
            CALIBRADOR DE 1RM & CARGA CLÍNICA
          </h4>
          <p className="text-[10px] font-mono tracking-widest text-[#00F0FF] uppercase">
            // ESTIMADOR CIENTÍFICO L4 BASADO EN FÓRMULA DE BRZYCKI
          </p>
        </div>
        
        <button
          onClick={() => setShowFormulaInfo(!showFormulaInfo)}
          className="text-[9px] font-mono text-neutral-400 hover:text-[#00F0FF] border border-white/10 hover:border-[#00F0FF]/30 px-2.5 py-1 flex items-center gap-1 transition-all cursor-pointer bg-neutral-950/40"
        >
          <HelpCircle size={11} />
          <span>FÓRMULA & BIOMECÁNICA</span>
        </button>
      </div>

      <AnimatePresence>
        {showFormulaInfo && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="p-4 bg-zinc-950 border border-white/5 space-y-2 text-xs text-neutral-400 font-sans leading-relaxed text-left">
              <p>
                La <strong className="text-white">Fórmula de Brzycki</strong> es una de las metodologías indirectas más validadas en ciencias de la fuerza para estimar la capacidad neuromuscular de 1 repetición máxima sin la necesidad de testear cargas de fallo absoluto en frío.
              </p>
              <div className="p-2.5 bg-black border border-white/10 font-mono text-center text-[11px] text-[#00f0ff] rounded">
                1RM Estimado = Peso Levantado / (1.0278 - (0.0278 × Repeticiones))
              </div>
              <div className="flex gap-2 items-start text-[10px] mt-1 text-amber-400 font-mono">
                <AlertCircle size={12} className="shrink-0 mt-0.5" />
                <p>
                  <span className="font-extrabold uppercase">ADVERTENCIA NEXUS L4:</span> La precisión matemática de Brzycki es máxima en series que no exceden las <strong className="text-white font-bold">10 repeticiones</strong>. Exceder este umbral introduce sesgos de fatiga periférica y acumulación de lactato, diluyendo la estimación de fuerza máxima central. ¡ROM sobre Carga siempre!
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* INPUTS COLUMN */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0b0c10] border border-white/5 p-4 space-y-4 rounded-sm text-left">
            
            {/* EXERCISE LOADS PICKER */}
            <div className="space-y-1.5">
              <label className="block text-[9px] font-extrabold text-[#00F0FF] uppercase tracking-wider">
                1. CARGAR DESDE HISTORIAL DE RENDIMIENTO
              </label>
              <select
                value={selectedExerciseName}
                onChange={(e) => setSelectedExerciseName(e.target.value)}
                className="w-full bg-black text-white border border-white/15 rounded px-2 h-9 font-mono text-xs focus:outline-none focus:border-[#00F0FF] transition-colors cursor-pointer"
              >
                <option value="custom">-- INTRODUCIR CARGA MANUAL --</option>
                {exercises.length === 0 ? (
                  <option disabled>No hay ejercicios registrados en bitácora</option>
                ) : (
                  exercises.map((ex) => (
                    <option key={ex.name} value={ex.name}>
                      🏋️ {ex.name} ({ex.bestSet ? `${ex.bestSet.weight}kg x ${ex.bestSet.reps}r` : ''})
                    </option>
                  ))
                )}
              </select>
              {exercises.length > 0 && selectedExerciseName === 'custom' && (
                <span className="text-[9px] text-neutral-500 font-mono block italic">
                  * Elige un ejercicio registrado para autollenar instantáneamente su mejor serie.
                </span>
              )}
            </div>

            {/* MANUAL CALIBRATOR */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <label className="block text-[9px] font-extrabold text-neutral-400 uppercase tracking-wider">
                  PESO LEVANTADO (KG)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  placeholder="Ej: 100"
                  value={customWeight}
                  onChange={(e) => {
                    setCustomWeight(e.target.value);
                    setSelectedExerciseName('custom'); // revert dropdown to manual on edit
                  }}
                  className="w-full bg-black text-white border border-white/10 rounded px-2 h-9 font-mono text-center text-sm focus:outline-none focus:border-[#00F0FF] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-extrabold text-neutral-400 uppercase tracking-wider">
                  REPETICIONES COMPLETADAS
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  placeholder="Ej: 5"
                  value={customReps}
                  onChange={(e) => {
                    setCustomReps(e.target.value);
                    setSelectedExerciseName('custom'); // revert dropdown to manual on edit
                  }}
                  className="w-full bg-black text-white border border-white/10 rounded px-2 h-9 font-mono text-center text-sm focus:outline-none focus:border-[#00F0FF] transition-colors"
                />
              </div>
            </div>

            {calculatedResult && (
              <div className="flex justify-between items-center pt-2.5 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setCustomWeight('');
                    setCustomReps('');
                    setSelectedExerciseName('custom');
                  }}
                  className="text-[9px] font-mono text-neutral-500 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RefreshCw size={10} />
                  <span>LIMPIAR ANALIZADOR</span>
                </button>
                <span className="text-[8px] font-mono text-neutral-500 uppercase">
                  // CALCULADO EN DISPOSITIVO LOCAL
                </span>
              </div>
            )}
          </div>
        </div>

        {/* RESULTS GAUGE */}
        <div className="lg:col-span-7 flex flex-col justify-between h-full min-h-[220px]">
          <AnimatePresence mode="wait">
            {calculatedResult ? (
              <motion.div 
                key="result-filled"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 text-left w-full"
              >
                {/* 1RM RESULT CIRCLE BIG DISPLAY */}
                <div className="bg-[#05080e] border border-[#00f0ff]/20 p-4 rounded flex flex-col sm:flex-row items-center gap-4 sm:justify-between">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-[10px] font-mono font-bold text-[#00F0FF] block tracking-wider uppercase">
                      1RM ESTIMADO CALCULADO
                    </span>
                    <h3 className="text-4xl sm:text-5xl font-brutalist tracking-wider text-white leading-none">
                      {calculatedResult.oneRepMax} <span className="text-base font-mono text-neutral-400 uppercase">kg</span>
                    </h3>
                    <p className="text-[9.5px] text-neutral-400 font-mono uppercase mt-1 leading-tight">
                      Basado en {customWeight}kg x {customReps} {parseInt(customReps) === 1 ? 'repetición' : 'repeticiones'}
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center p-2 border border-white/10 rounded bg-black/60 min-w-[130px] font-mono text-center">
                    {calculatedResult.repsWarning ? (
                      <>
                        <span className="text-[7.5px] font-black text-rose-400 block tracking-tight uppercase">FISIOLOGÍA L4 APRETADA</span>
                        <span className="text-[9px] font-extrabold text-rose-300 mt-1 leading-normal uppercase">❌ BAJA PRECISIÓN</span>
                        <span className="text-[8.5px] text-neutral-500 mt-0.5 leading-snug">Reps &gt; 10 fatigan psoas/SNC</span>
                      </>
                    ) : (
                      <>
                        <span className="text-[7.5px] font-black text-[#00f0ff] block tracking-tight uppercase">MÁXIMA TRANSMISIÓN NEURAL</span>
                        <span className="text-[9.5px] font-extrabold text-emerald-400 mt-1 leading-normal uppercase">✓ ALTA PRECISIÓN</span>
                        <span className="text-[8.5px] text-neutral-400 mt-0.5 leading-snug">Rango óptimo neuromuscular</span>
                      </>
                    )}
                  </div>
                </div>

                {/* WORKING PERCENTAGE ZONE TABLE */}
                <div className="bg-black/90 border border-white/5 p-4 rounded">
                  <span className="text-[9px] font-black tracking-widest text-neutral-400 uppercase mb-3 block">
                    ⚔️ TABLA DE CARGAS DE TRABAJO E INTERVALOS DE INTENSIDAD NEXUS L4
                  </span>
                  
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[145px] overflow-y-auto pr-1"
                  >
                    {percentageMatrix.map((zone) => (
                      <motion.div 
                        key={zone.percentage}
                        variants={itemVariants}
                        className="py-1.5 px-2.5 border border-white/5 hover:border-[#00F0FF]/25 bg-[#08090d]/60 flex justify-between items-center rounded-sm transition-all text-[11px]"
                      >
                        <div className="flex flex-col gap-0.5 max-w-[70%]">
                          <span className="font-mono text-[9px] text-[#00f0ff] font-extrabold">{zone.percentage}% del 1RM</span>
                          <span className="text-[8.5px] text-neutral-400 leading-none truncate uppercase font-medium">{zone.label}</span>
                        </div>
                        <span className="font-mono text-xs sm:text-sm font-black text-white shrink-0">
                          {zone.weight} kg
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="result-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="border border-dashed border-white/10 rounded-sm p-6 flex flex-col items-center justify-center text-center gap-3 bg-neutral-950/20 h-full w-full justify-self-center my-auto min-h-[220px]"
              >
                <Dumbbell size={32} className="text-neutral-600 " />
                <div className="space-y-1">
                  <h5 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest">
                    ANALIZADOR EN REPOSO SENSORIAL
                  </h5>
                  <p className="text-[10px] text-neutral-500 max-w-sm leading-relaxed">
                    Digita el peso y número de repeticiones de cualquier serie, o selecciona un ejercicio histórico activo arriba. Nexus L4 proyectará tu 1RM teórico y calibrará tus cargas de entreno automáticamente.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
