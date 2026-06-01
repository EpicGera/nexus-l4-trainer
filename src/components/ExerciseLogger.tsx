import DOMPurify from 'isomorphic-dompurify';
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Dumbbell, Star, ChevronDown, Sparkles, Award, FileText, Flame, Share2, Download, X } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { isCardio as classifyIsCardio, isBodyweightOnly as classifyIsBodyweightOnly } from '../lib/workoutClassifier';
import { getSuggestedRpe, getBiomechanicalTips } from '../lib/biomechanicsAdvisor';

interface ExerciseLog {
  id: string;
  weight: string;
  reps: string;
  rpe: string;
  rir?: string;
  timestamp: number;
}

interface ExerciseLoggerProps {
  dayId: string;
  exerciseName: string;
  rawItemHtml?: string;
  onLogsChange?: (avg: number | null) => void;
}

export default function ExerciseLogger({ dayId, exerciseName, rawItemHtml, onLogsChange }: ExerciseLoggerProps) {
  const localStorageKey = `nexus_logs_${dayId}_${exerciseName.replace(/\s+/g, '_')}`;
  
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [rpe, setRpe] = useState('8'); // default common RPE
  const [rir, setRir] = useState('2'); // default RIR for RPE 8
  const [isExpanded, setIsExpanded] = useState(false);
  const [historicMax, setHistoricMax] = useState<number>(0);
  const [lastLog, setLastLog] = useState<ExerciseLog | null>(null);
  const [historicAvgRpe, setHistoricAvgRpe] = useState<number | null>(null);
  const [rpeTrend, setRpeTrend] = useState<{name: string; rpe: number; timestamp: number}[]>([]);
  const [isFlashing, setIsFlashing] = useState(false);
  const [biomechanicsChecklist, setBiomechanicsChecklist] = useState({
    rom: false,
    posture: false,
    stability: false
  });
  const [showPacing, setShowPacing] = useState(false);
  const [calInput, setCalInput] = useState('15');
  const [showAdvancedL4, setShowAdvancedL4] = useState(false);

  const isCardio = useMemo(() => classifyIsCardio(exerciseName, rawItemHtml), [exerciseName, rawItemHtml]);

  const isBodyweightOnly = useMemo(() => classifyIsBodyweightOnly(exerciseName, rawItemHtml), [exerciseName, rawItemHtml]);

  // Adjust placeholder defaults when isCardio toggles or mounts
  useEffect(() => {
    if (isCardio) {
      setRir('N/D');
    } else {
      setRir('2');
    }
  }, [isCardio]);

  const updateRpeAndRir = (newRpe: string) => {
    setRpe(newRpe);
    if (isCardio) {
      // Cardio does not mathematically bind RIR/Pacing to RPE
      return;
    }
    const numeric = parseFloat(newRpe);
    if (!isNaN(numeric)) {
      const computedRir = 10 - numeric;
      if (computedRir >= 0 && computedRir <= 6) {
        setRir(String(computedRir));
      } else {
        setRir('N/D');
      }
    } else {
      setRir('N/D');
    }
  };

  const updateRirAndRpe = (newRir: string) => {
    setRir(newRir);
    if (isCardio) {
      // Cardio does not mathematically bind Pace/Cadencia to RPE
      return;
    }
    if (newRir === 'N/D' || newRir.trim() === '') return;
    const numeric = parseFloat(newRir);
    if (!isNaN(numeric)) {
      const computedRpe = 10 - numeric;
      if (computedRpe >= 1 && computedRpe <= 10) {
        setRpe(String(computedRpe));
      }
    }
  };

  const [athlete, setAthlete] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_athlete_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (saved.includes('Banquete') || saved.includes('Druida') || saved.includes('Warlock') || saved.includes('Zancada') || saved.includes('Poción') || saved.includes('Héroes')) {
          parsed.level = "CF-L4 Master Coach // Elite Athlete ⚡";
          parsed.restriction = "RPE 8/10 MÁX (Control Biomecánico Sano)";
          parsed.condition = "Recuperación Sistémica Post-Competencia";
          parsed.equipment = {
            grebas: "Rodilleras de Neoprene de 7mm",
            amuleto: "Calleras de Fibra de Carbono",
            filtro: "Tape Elástico de Pulgares"
          };
        }
        return parsed;
      }
    } catch (e) {}
    return {
      identity: "GERARDO & FLOR",
      level: "CF-L4 Master Coach // Elite Athlete ⚡",
      restriction: "RPE 8/10 MÁX (Control Biomecánico Sano)",
      condition: "Recuperación Sistémica Post-Competencia",
      equipment: {
        grebas: "Rodilleras de Neoprene de 7mm",
        amuleto: "Calleras de Fibra de Carbono",
        filtro: "Tape Elástico de Pulgares"
      }
    };
  });

  // Sync athlete fixes to localstorage asynchronously
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nexus_athlete_state');
      if (saved && (saved.includes('Banquete') || saved.includes('Druida') || saved.includes('Warlock') || saved.includes('Zancada') || saved.includes('Poción') || saved.includes('Héroes'))) {
        localStorage.setItem('nexus_athlete_state', JSON.stringify(athlete));
      }
    } catch (e) {}
  }, [athlete]);

  useEffect(() => {
    const syncAthlete = () => {
      try {
        const saved = localStorage.getItem('nexus_athlete_state');
        if (saved) {
          setAthlete(JSON.parse(saved));
        }
      } catch (e) {}
    };
    window.addEventListener('nexus_athlete_updated', syncAthlete);
    window.addEventListener('storage', syncAthlete);
    return () => {
      window.removeEventListener('nexus_athlete_updated', syncAthlete);
      window.removeEventListener('storage', syncAthlete);
    };
  }, []);

  // Find historic maximum weight across all logged sessions of this exercise
  useEffect(() => {
    const computeHistoricMax = () => {
      let maxWeight = 0;
      let latestLog: ExerciseLog | null = null;
      const cleanName = exerciseName.replace(/\s+/g, '_');
      const allRpes: number[] = [];
      const sessionsMap = new Map<string, { totalRpe: number, count: number, maxTimestamp: number }>();

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('nexus_logs_') && key.endsWith(`_${cleanName}`)) {
          const dayIdPart = key.replace('nexus_logs_', '').replace(`_${cleanName}`, '');

          try {
            const saved = localStorage.getItem(key);
            if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed) && parsed.length > 0) {
                let sessionTotalRpe = 0;
                let sessionCount = 0;
                let maxTimestamp = 0;

                parsed.forEach((log: any) => {
                  const wStr = String(log.weight || '');
                  const match = wStr.match(/(\d+(?:\.\d+)?)/);
                  if (match) {
                    const val = parseFloat(match[1]);
                    if (val > maxWeight) {
                      maxWeight = val;
                    }
                  }

                  const rpeVal = parseFloat(log.rpe);
                  if (!isNaN(rpeVal)) {
                     allRpes.push(rpeVal);
                     sessionTotalRpe += rpeVal;
                     sessionCount++;
                  }
                  if (log.timestamp > maxTimestamp) {
                      maxTimestamp = log.timestamp;
                  }

                  if (!latestLog || log.timestamp > latestLog.timestamp) {
                     latestLog = log;
                  }
                });

                if (sessionCount > 0) {
                   sessionsMap.set(dayIdPart, {
                       totalRpe: sessionTotalRpe,
                       count: sessionCount,
                       maxTimestamp: maxTimestamp
                   });
                }
              }
            }
          } catch (e) {
            // ignore
          }
        }
      }
      setHistoricMax(maxWeight);
      setLastLog(latestLog);

      if (allRpes.length > 0) {
          setHistoricAvgRpe(allRpes.reduce((a, b) => a + b, 0) / allRpes.length);
      } else {
          setHistoricAvgRpe(null);
      }

      // Compute Trend
      const sessionsArray = Array.from(sessionsMap.entries()).map(([sessionDayId, stats]) => {
          return {
              name: sessionDayId.replace('w', 'S').replace('_d', ' D').toUpperCase(),
              rpe: Math.round((stats.totalRpe / stats.count) * 10) / 10,
              timestamp: stats.maxTimestamp
          };
      });
      // Sort by timestamp
      sessionsArray.sort((a, b) => a.timestamp - b.timestamp);
      // Grab last 4
      setRpeTrend(sessionsArray.slice(-4));
    };

    computeHistoricMax();

    // Listen for storage changes or demo data loading
    const handleStorageChange = () => {
      computeHistoricMax();
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('nexus_logs_updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('nexus_logs_updated', handleStorageChange);
    };
  }, [exerciseName, logs]);

  const getSuggestedRpeVal = (weightInput: string, maxWeight: number) => {
    return getSuggestedRpe(weightInput, maxWeight);
  };

  const getBiomechanicalTipsVal = (): string => {
    return getBiomechanicalTips(exerciseName, athlete).join('\n');
  };

  // Load logs on mount/day change
  useEffect(() => {
    const saved = localStorage.getItem(localStorageKey);
    if (saved) {
      try {
        setLogs(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading exercise logs', e);
      }
    } else {
      setLogs([]);
    }
  }, [dayId, exerciseName]);

  // Report average RPE of the last three sets to the parent component
  useEffect(() => {
    if (onLogsChange) {
      if (logs.length > 0) {
        const lastThree = logs.slice(-3);
        const sum = lastThree.reduce((acc, log) => acc + parseFloat(log.rpe), 0);
        onLogsChange(sum / lastThree.length);
      } else {
        onLogsChange(null);
      }
    }
  }, [logs, onLogsChange]);

  // Persist logs
  const saveLogs = (updatedLogs: ExerciseLog[]) => {
    setLogs(updatedLogs);
    localStorage.setItem(localStorageKey, JSON.stringify(updatedLogs));
    window.dispatchEvent(new Event('nexus_logs_updated'));
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight && !reps) return; // Need at least something to log

    const numericRpe = parseFloat(rpe);
    if (!isNaN(numericRpe) && numericRpe >= 9) {
      setIsFlashing(true);
      setTimeout(() => {
        setIsFlashing(false);
      }, 1000);
      
      // Dispatch urgent push notification to CoachChat
      window.dispatchEvent(new CustomEvent('nexus_push_notification', {
        detail: {
          message: `¡ATENCIÓN! Registraste un RPE ${numericRpe}. Estás en territorio de reclutamiento IIB crítico. Modula volumen si notas descenso en la velocidad de la barra.`,
          type: 'urgent'
        }
      }));
    }

    const newLog: ExerciseLog = {
      id: crypto.randomUUID(),
      weight: isCardio 
        ? (weight.trim() ? weight.trim() : '00:00')
        : (weight.trim() ? `${weight.trim()} kg` : 'P. Corporal'),
      reps: isCardio 
        ? (reps.trim() ? reps.trim() : 'S/D')
        : (reps.trim() ? `${reps.trim()} reps` : 'Max reps'),
      rpe: rpe,
      rir: rir,
      timestamp: Date.now()
    };

    const updated = [...logs, newLog];
    saveLogs(updated);
    
    // Reset inputs, keep RPE as last selected for speed training
    setWeight('');
    setReps('');
    if (isCardio) {
      setRir('N/D');
    } else {
      setRir('2');
    }
  };

  const handleDeleteLog = (id: string) => {
    const updated = logs.filter(log => log.id !== id);
    saveLogs(updated);
  };


  const suggestion = getSuggestedRpe(weight, historicMax);

  // Today's peak weight from logs
  const todayMaxWeight = React.useMemo(() => {
    return logs.reduce((max, log) => {
      const match = log.weight.match(/(\d+(?:\.\d+)?)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (val > max) return val;
      }
      return max;
    }, 0);
  }, [logs]);

  // Relative load percentage
  const relativeLoad = React.useMemo(() => {
    if (historicMax <= 0 || todayMaxWeight <= 0) return 0;
    return Math.round((todayMaxWeight / historicMax) * 100);
  }, [historicMax, todayMaxWeight]);

  // Relative load styling and data descriptors
  const relativeLoadColor = React.useMemo(() => {
    if (relativeLoad === 0) return { bg: 'bg-[#1e1e24]', text: 'text-neutral-400 border-neutral-500/20', border: 'border-neutral-500/20', label: 'Sin Carga', dot: 'bg-neutral-600' };
    if (relativeLoad < 70) return { bg: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/30', text: 'text-emerald-500 dark:text-emerald-400', border: 'border-emerald-500/30', label: 'Carga Ligera (Recuperación)', dot: 'bg-emerald-500' };
    if (relativeLoad < 85) return { bg: 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/30', text: 'text-amber-500 dark:text-amber-400', border: 'border-amber-500/30', label: 'Carga Media (Estímulo)', dot: 'bg-amber-400' };
    if (relativeLoad < 95) return { bg: 'bg-orange-500/10 text-orange-500 dark:text-orange-400 border-orange-500/30', text: 'text-orange-500 dark:text-orange-400', border: 'border-orange-500/30', label: 'Carga Alta (Exigente)', dot: 'bg-orange-500' };
    return { bg: 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/30', text: 'text-rose-500 dark:text-rose-400', border: 'border-rose-500/30', label: 'Carga Crítica (Fallo/L4)', dot: 'bg-red-500' };
  }, [relativeLoad]);

  // Real-time typed weight intensity calculation compared to historic maximum
  const typedLoad = React.useMemo(() => {
    if (historicMax <= 0 || !weight) return 0;
    const cleanWeight = parseFloat(weight.replace(/[^0-9.]/g, ''));
    if (isNaN(cleanWeight) || cleanWeight <= 0) return 0;
    return Math.round((cleanWeight / historicMax) * 100);
  }, [historicMax, weight]);

  const typedPercentageColor = React.useMemo(() => {
    if (typedLoad === 0) return { bg: 'bg-neutral-800', text: 'text-neutral-400', border: 'border-neutral-700', label: 'Sin Carga', dot: 'bg-neutral-500' };
    if (typedLoad < 70) return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'Ligera (Regen)', dot: 'bg-emerald-500' };
    if (typedLoad < 85) return { bg: 'bg-amber-500/10', text: 'text-amber-400 border-amber-500/20', label: 'Media (Estímulo)', dot: 'bg-amber-400' };
    if (typedLoad < 95) return { bg: 'bg-orange-500/10', text: 'text-orange-400 border-orange-500/20', label: 'Alta (Exigente)', dot: 'bg-orange-500' };
    return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', label: 'Crítica (Alerta L4)', dot: 'bg-red-500' };
  }, [typedLoad]);

  const todayAvgRpe = useMemo(() => {
    if (logs.length === 0) return null;
    const sum = logs.reduce((acc, log) => acc + parseFloat(log.rpe), 0);
    return sum / logs.length;
  }, [logs]);

  const fatigueDiff = useMemo(() => {
    if (todayAvgRpe !== null && historicAvgRpe !== null) {
      return (todayAvgRpe - historicAvgRpe).toFixed(1);
    }
    return null;
  }, [todayAvgRpe, historicAvgRpe]);

  const rpeGlowClass = useMemo(() => {
    if (todayAvgRpe === null) return '';
    if (todayAvgRpe >= 9) return ' !border-rose-500 rounded border';
    if (todayAvgRpe >= 8.5) return ' !border-orange-500 rounded border';
    return '';
  }, [todayAvgRpe]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 14 } }
  };

  return (
    <div 
      id={`exercise-logger-${dayId}-${exerciseName.replace(/\s+/g, '-')}`}
      className={`overflow-hidden transition-all duration-200 text-xs text-[var(--text-data)] pb-2 min-w-0 break-words ${rpeGlowClass}`}
    >
      {/* COLLAPSIBLE HEADER */}
      <div className="flex items-stretch w-full mb-1 relative">
        {fatigueDiff !== null && (
          <div className="absolute top-0 right-10 text-[8px] font-mono font-bold uppercase z-10 px-1 py-0.5 rounded opacity-80" 
               style={{ 
                 backgroundColor: parseFloat(fatigueDiff) > 0 ? 'rgba(249,115,22,0.2)' : 'rgba(16,185,129,0.2)',
                 color: parseFloat(fatigueDiff) > 0 ? '#fb923c' : '#34d399'
               }}>
            Fatiga: {parseFloat(fatigueDiff) > 0 ? '+' : ''}{fatigueDiff}
          </div>
        )}
        <button
          type="button"
          id={`btn-toggle-logger-${dayId}-${exerciseName.replace(/\s+/g, '-')}`}
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 flex justify-between items-center py-2 px-1 hover:bg-white/5 transition-colors select-none cursor-pointer text-left rounded-l border border-transparent hover:border-white/10 p-print-only"
        >
          <div className="flex flex-col gap-1 text-white min-w-0 font-condensed font-black text-base sm:text-[1.1rem] tracking-wide leading-tight mt-1 shrink w-full">
            <div className="relative pl-6 w-full text-left">
              <span className="absolute left-0 top-0 h-[1.25em] w-4 flex items-center justify-center select-none font-sans text-[14px] text-white">✦</span>
              <div className="flex-1 min-w-0 flex items-start justify-between w-full">
                {rawItemHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(rawItemHtml) }} className="shrink pr-2" />
                ) : (
                  <span className="shrink pr-2">{exerciseName}</span>
                )}
                {logs.length > 0 && (
                  <span className="ml-2 mt-px px-2 py-0.5 rounded text-[10px] font-mono font-black border uppercase tracking-wider bg-neutral-800 text-neutral-300 border-neutral-700 whitespace-nowrap no-print self-start shrink-0">
                    {logs.length} series
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 pl-2 pr-1 no-print">
            {!isCardio && historicMax > 0 && (
              <span 
                className={`hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-mono font-black border uppercase tracking-wider ${
                  relativeLoad > 0 ? relativeLoadColor.bg : 'bg-zinc-900 border-zinc-800 text-neutral-400'
                }`}
                title={`Carga Relativa: ${relativeLoad > 0 ? `${relativeLoad}% del Máximo Histórico (${relativeLoadColor.label})` : 'Sin registros hoy'} (Histórico: ${historicMax} kg)`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${relativeLoad > 0 ? relativeLoadColor.dot : 'bg-neutral-600'} ${relativeLoad >= 95 ? '' : relativeLoad > 0 ? '' : ''}`} />
                <span>{relativeLoad > 0 ? `${relativeLoad}%` : '0%'}</span>
              </span>
            )}
            <ChevronDown 
              size={16} 
              className={`text-neutral-500 transform transition-transform duration-200 ${isExpanded ? 'rotate-180 text-white' : ''}`} 
            />
          </div>
        </button>
      </div>

      {/* EXPANDED PANEL */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            variants={{} as any}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="p-3 space-y-3 no-print min-w-0"
          >
            
            {/* RPE TREND CHART */}
            {rpeTrend.length > 1 && (
              <motion.div variants={{} as any} className="bg-[#0A0A0E] border border-white/5 rounded p-2 mb-2">
                <span className="text-[9px] font-bold tracking-widest text-[#00F0FF] uppercase mb-2 block">
                  📈 Tendencia RPE (Últimas sesiones)
                </span>
                <div className="h-16 w-full opacity-80 hover:opacity-100 transition-opacity">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={rpeTrend}>
                      <YAxis domain={[0, 10]} hide />
                      <Line 
                        type="monotone" 
                        dataKey="rpe" 
                        stroke="#fb923c" 
                        strokeWidth={2} 
                        dot={{ r: 2, fill: '#fb923c', strokeWidth: 0 }} 
                        activeDot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }}
                        animationDuration={800}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between mt-1 px-1">
                  {rpeTrend.map((t, idx) => (
                    <span key={idx} className="text-[7px] text-neutral-500 font-mono tracking-wider">{t.name}</span>
                  ))}
                </div>
              </motion.div>
            )}

          {/* LOGGING FORM */}
          <motion.div variants={{} as any} className="w-full">
            <form onSubmit={handleAddLog} className="space-y-2.5 w-full">
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 w-full">
              <div>
                <div className="h-[12px] flex items-center mb-1 justify-between gap-1">
                  <label className="block text-[8px] font-extrabold text-[var(--text-muted)] uppercase tracking-[0.06em] truncate">
                    {isCardio ? 'TIEMPO' : 'PESO (KG)'}
                  </label>
                  {!isCardio && typedLoad > 0 && (
                    <span 
                      className={`text-[7px] font-mono font-bold flex items-center gap-0.5 px-1 rounded-sm uppercase leading-none truncate max-w-[50px] ${typedPercentageColor.bg} ${typedPercentageColor.text}`}
                      title={`${typedLoad}% del Máximo Histórico (${typedPercentageColor.label})`}
                    >
                      <span className={`w-1 h-1 rounded-full ${typedPercentageColor.dot}`} />
                      {typedLoad}%
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder={isCardio ? "01:45" : (isBodyweightOnly ? "P. Corporal" : "80")}
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  className="w-full bg-[var(--bg-input)] text-[var(--text-main)] border border-[var(--border-color)] rounded px-1 h-[34px] focus:outline-none focus:border-[var(--text-main)] font-mono text-center text-xs transition-colors"
                />
                {lastLog && (
                  <button
                    type="button"
                    onClick={() => {
                      const cleanW = lastLog.weight.endsWith(' kg') 
                        ? lastLog.weight.slice(0, -3) 
                        : lastLog.weight;
                      setWeight(cleanW);
                    }}
                    className="mt-1.5 block text-[8px] sm:text-[9.5px] font-mono text-neutral-400 hover:text-electric-blue cursor-pointer transition-colors leading-tight text-center w-full"
                    title="Hacer clic para cargar este peso"
                  >
                    U. Reg: <span className="font-bold underline decoration-dotted decoration-neutral-500 hover:decoration-electric-blue">{lastLog.weight}</span>
                  </button>
                )}
              </div>
              <div>
                <div className="h-[12px] flex items-center mb-1">
                  <label className="block text-[8px] font-extrabold text-[var(--text-muted)] uppercase tracking-[0.06em] truncate">
                    {isCardio ? 'DIST/CALS' : 'REPS'}
                  </label>
                </div>
                <input
                  type="text"
                  placeholder={isCardio ? "400m / 15cal" : (isBodyweightOnly ? "10" : "6")}
                  value={reps}
                  onChange={e => setReps(e.target.value)}
                  className="w-full bg-[var(--bg-input)] text-[var(--text-main)] border border-[var(--border-color)] rounded px-1 h-[34px] focus:outline-none focus:border-[var(--text-main)] font-mono text-center text-xs transition-colors"
                />
              </div>
              <div>
                <div className="h-[12px] flex justify-between items-center mb-1">
                  <label className="block text-[8px] font-extrabold text-[var(--text-muted)] uppercase tracking-[0.06em] truncate">
                    RPE
                  </label>
                  {!isCardio && suggestion && rpe !== suggestion.rpe && (
                    <button
                      type="button"
                      onClick={() => updateRpeAndRir(suggestion.rpe)}
                      className="hidden lg:inline-flex items-center gap-0.5 text-[var(--accent-main)] dark:text-rose-400 hover:opacity-80 transition-all cursor-pointer text-[7px] font-extrabold uppercase font-mono tracking-wider ml-1"
                      title={`Porcentaje de carga: ${suggestion.percentage}%. Presiona para autocompletar RPE ${suggestion.rpe}`}
                    >
                      <Sparkles size={8} className="fill-[var(--accent-main)] text-[var(--accent-main)]" />
                      Auto:{suggestion.rpe}
                    </button>
                  )}
                </div>
                <select
                  value={rpe}
                  onChange={e => updateRpeAndRir(e.target.value)}
                  className="w-full bg-[var(--bg-input)] text-[var(--text-main)] border border-[var(--border-color)] rounded px-0.5 h-[34px] focus:outline-none focus:border-[var(--text-main)] font-mono text-xs text-center appearance-none cursor-pointer hover:bg-[var(--border-color)] transition-colors"
                >
                  {['10', '9.5', '9', '8.5', '8', '7.5', '7', '6.5', '6', '5', '4'].map(val => (
                     <option key={val} value={val}>{val}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="h-[12px] flex items-center mb-1">
                  <label className="block text-[8px] font-extrabold text-[var(--text-muted)] uppercase tracking-[0.06em] truncate">
                    {isCardio ? 'CADENCIA' : 'RIR'}
                  </label>
                </div>
                <input
                  type={isCardio ? "text" : "number"}
                  min={isCardio ? undefined : "0"}
                  max={isCardio ? undefined : "10"}
                  step={isCardio ? undefined : "0.5"}
                  placeholder={isCardio ? "60 rpm" : "2"}
                  value={rir === 'N/D' ? '' : rir}
                  onChange={e => updateRirAndRpe(e.target.value || 'N/D')}
                  className="w-full bg-[var(--bg-input)] text-[var(--text-main)] border border-[var(--border-color)] rounded px-1 h-[34px] focus:outline-none focus:border-[var(--text-main)] font-mono text-xs text-center transition-colors"
                  title={isCardio ? "Cadencia o ritmo de carrera" : "Reps en Recámara (RIR)"}
                />
              </div>
            </div>
            
            <div className="relative w-full">
              {isFlashing && parseFloat(rpe) >= 9 && (
                <>
                  {/* High Intensity Expanding Rings representing Maximum Neural Drive */}
                  <div className="absolute inset-0 bg-red-600 rounded  opacity-75 pointer-events-none" />
                  <div className="absolute inset-0 bg-amber-500 rounded  opacity-50 delay-150 pointer-events-none" />
                  <div className="absolute -inset-1 border-2 border-dashed border-red-500 rounded  opacity-60 pointer-events-none" />
                </>
              )}
              
              <button
                type="submit"
                className={`relative overflow-hidden w-full h-[36px] font-bold rounded flex items-center justify-center gap-1.5 cursor-pointer leading-none text-xs uppercase font-mono tracking-widest hover:scale-[1.01] active:scale-[0.99] shadow-sm select-none transition-all duration-150 ${
                  isFlashing 
                    ? (parseFloat(rpe) >= 9 
                        ? ' text-white border-transparent scale-[1.05] font-black'
                        : 'bg-[var(--text-main)] text-[var(--bg-card)] border border-[var(--text-main)] opacity-70 scale-[0.98]')
                    : (parseFloat(rpe) >= 9)
                      ? 'bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white border-transparent shadow-sm ring-2 ring-red-500/30  font-extrabold'
                      : 'bg-[var(--text-main)] text-[var(--bg-card)] border border-[var(--text-main)] hover:bg-opacity-90'
                }`}
                title={parseFloat(rpe) >= 9 ? "Intensidad Máxima (RPE 9+): ¡Riesgo límite biomecánico!" : "Registrar Serie"}
              >
                {isFlashing && (
                  <>
                    <div className="absolute inset-0 bg-white  mix-blend-color-dodge pointer-events-none rounded" />
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500  mix-blend-overlay pointer-events-none rounded" />
                  </>
                )}
                {isFlashing ? (
                  <>
                    <Flame size={14} className="shrink-0 text-white  fill-amber-400" />
                    <span className=" tracking-widest font-black text-red-100">¡RPE {rpe} REGISTRADOS! 🔥</span>
                    <Flame size={14} className="shrink-0 text-white  fill-amber-400" />
                  </>
                ) : (parseFloat(rpe) >= 9) ? (
                  <>
                    <Flame size={12} className="shrink-0 text-white " />
                    <span>REGISTRAR SERIE (INTENSIDAD L4 🔥)</span>
                  </>
                ) : (
                  <>
                    <Plus size={11} className="shrink-0" />
                    <span>REGISTRAR SERIE</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

          {/* L4 AUTO-CALCULATED RPE SUGGESTION (DYNAMIC ANALYSIS) */}
          {!isCardio && historicMax > 0 && (
            <motion.div variants={{} as any} className="space-y-2">
              <div className="bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/10 rounded-lg p-2.5 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-black tracking-widest text-[#E11D48] dark:text-rose-400 uppercase flex items-center gap-1 leading-none">
                    <Award size={11} className="text-[#E11D48]" />
                    MÁXIMO REGISTRADO: {historicMax} kg
                  </span>
                  {suggestion ? (
                    <p className="text-[9px] text-[var(--text-data)] mt-1 font-semibold leading-relaxed">
                      Levantar <span className="font-mono font-bold text-[var(--text-main)]">{parseFloat(weight)} kg</span> es el <span className="font-extrabold text-rose-600 dark:text-rose-400 font-mono">{suggestion.percentage}%</span> de tu mejor marca.
                    </p>
                  ) : (
                    <p className="text-[9px] text-[var(--text-muted)] italic leading-normal mt-1 font-medium">
                      Digita el peso que vas a levantar para que Nexus L4 determine tu intensidad de manera precisa.
                    </p>
                  )}
                </div>
                
                {suggestion && (
                  <button
                    type="button"
                    onClick={() => updateRpeAndRir(suggestion.rpe)}
                    className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg border transition-all cursor-pointer select-none text-center h-10 w-24 shrink-0 col-auto ${
                      rpe === suggestion.rpe
                        ? 'bg-[#E11D48] text-white border-[#E11D48] shadow-md scale-102 font-black'
                        : 'bg-[var(--bg-card)] text-[#E11D48] dark:text-rose-400 border-rose-300 dark:border-rose-900 hover:border-[#E11D48] hover:bg-rose-500/5 '
                    }`}
                    title="Presiona para autocompletar esta RPE"
                  >
                    <span className="text-[7.5px] font-extrabold uppercase block tracking-wider leading-none text-[#E11D48] dark:text-rose-400">RPE ESTIMADO</span>
                    <span className="text-xs font-black font-mono mt-0.5 leading-none">{suggestion.rpe}</span>
                  </button>
                )}
              </div>

              {/* LIVE RELATIVE LOAD METRIC AND VISUAL PROGRESS */}
              <div className="bg-neutral-950/60 p-2 border border-[var(--border-color)] rounded-lg space-y-2">
                <div className="flex justify-between items-center text-[9px]">
                  <span className="font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                    ⚖️ CARGA RELATIVA REGISTRADA HOY
                  </span>
                  <span className={`font-mono text-[8px] font-black border px-1.5 py-0.5 rounded uppercase ${relativeLoadColor.bg} ${relativeLoadColor.text} ${relativeLoadColor.border}`}>
                    {relativeLoad > 0 ? `${relativeLoad}% (${relativeLoadColor.label})` : 'SIN REGISTRO HOY'}
                  </span>
                </div>
                
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 rounded-full ${
                      relativeLoad < 70 
                        ? 'bg-emerald-500' 
                        : relativeLoad < 85 
                          ? 'bg-amber-400' 
                          : relativeLoad < 95 
                            ? 'bg-orange-500' 
                            : 'bg-red-500'
                    }`}
                    style={{ width: `${relativeLoad === 0 ? 0 : Math.min(100, relativeLoad)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[8px] font-mono text-neutral-500 leading-none">
                  <span>Pico de Hoy: {todayMaxWeight} kg</span>
                  <span className="text-right">Max Histórico: {historicMax} kg</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ELEGANT MINIMALIST DISCLOSURE FOR ADVANCED TOOLS (Option 3 - Minimalist Accordion) */}
          <motion.div variants={{} as any} className="pt-1.5 no-print">
            <button
              type="button"
              onClick={() => setShowAdvancedL4(!showAdvancedL4)}
              className={`w-full py-1.5 px-3 border border-dashed rounded-lg text-[9px] font-mono tracking-widest uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-200 ${
                showAdvancedL4
                  ? 'bg-electric-blue/10 text-electric-blue border-electric-blue/30 shadow-sm font-bold'
                  : 'bg-neutral-950/40 text-neutral-400 border-white/10 hover:border-neutral-500 hover:text-neutral-200'
              }`}
            >
              <span>{showAdvancedL4 ? '➖ OCULTAR ANÁLISIS E INSTRUMENTOS L4' : '🔧 VER ANÁLISIS, BIOMECÁNICA Y CUES L4'}</span>
            </button>
          </motion.div>

          {showAdvancedL4 && (
            <div className="space-y-3 pt-1 animate-fadeIn">
              {/* PERSONALIZED BIOMECHANICAL BIOTICS / SUGG FROM NEXUS L4 */}
              <div className="bg-black/95 border-2 border-electric-blue/40 rounded-lg p-3 space-y-2 shadow-xs">
                <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
                  <span className="text-[10px] font-bold tracking-wider text-electric-blue uppercase flex items-center gap-1.5 leading-none">
                    🧠 CORE BIOMECÁNICA NEXUS L4
                  </span>
                  <span className="text-[8px] font-mono text-neutral-400 uppercase tracking-widest">
                    ACTIVO
                  </span>
                </div>
                <div className="space-y-1.5 text-[9.5px] text-neutral-300 font-medium leading-relaxed">
                  {getBiomechanicalTips(exerciseName, athlete).map((tip, idx) => (
                    <div key={idx} className="flex gap-2 items-start border-b border-white/5 pb-1 last:border-0 last:pb-0">
                      <span className="text-electric-blue shrink-0 font-bold">▶</span>
                      <p 
                        className="text-neutral-200"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(tip.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-electric-blue font-extrabold">$1</strong>')) }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* CHECKLIST DE VALIDACIÓN BIOMECÁNICA */}
              <div className="bg-neutral-900/60 p-2.5 rounded-lg border border-white/10 space-y-2.5 shadow-inner">
                <div className="flex items-center justify-between border-b border-white/5 pb-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#00F0FF] flex items-center gap-1">
                    ☑️ VALIDACIÓN BIOMECÁNICA L4
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    { key: 'rom', label: 'ROM COMPLETO', tooltip: 'Rango de movimiento innegociable alcanzado.' },
                    { key: 'posture', label: 'POSTURA L4', tooltip: 'Columna neutra y torque seguro.' },
                    { key: 'stability', label: 'ESTABILIDAD CORE', tooltip: 'Activación del core sin fugas de energía.' }
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={biomechanicsChecklist[item.key as keyof typeof biomechanicsChecklist]}
                        onChange={(e) => setBiomechanicsChecklist(prev => ({ ...prev, [item.key]: e.target.checked }))}
                        className="appearance-none w-3.5 h-3.5 border border-white/30 rounded-sm bg-black/50 checked:bg-emerald-500 checked:border-emerald-500 flex-shrink-0 cursor-pointer outline-none relative"
                        style={{ WebkitAppearance: 'none' }}
                      />
                      <span className="text-[9px] font-bold tracking-wide uppercase text-neutral-400 group-hover:text-white transition-colors" title={item.tooltip}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* VISUALIZAR PACING ACTION BUTTON */}
              <button 
                type="button" 
                onClick={() => setShowPacing(!showPacing)}
                className="w-full py-2 bg-[#00F0FF]/5 hover:bg-[#00F0FF]/15 border border-[#00F0FF]/20 rounded uppercase text-[#00F0FF] text-[9px] font-bold tracking-widest transition-colors flex items-center justify-center gap-2"
              >
                <Flame size={12} />
                {showPacing ? 'Ocultar Pacing' : 'Visualizar Pacing'}
              </button>

              {showPacing && (
                <div className="p-3 bg-neutral-900/80 border-l-2 border-[#00F0FF] rounded-r text-[9px] space-y-2 animate-fadeIn">
                   <div className="flex justify-between items-center text-white font-black uppercase mb-1">
                     <span>⏱️ Estimación de Pacing</span>
                   </div>
                   <p className="text-neutral-300 font-medium">Histórico RPE: {historicAvgRpe !== null ? historicAvgRpe.toFixed(1) : 'S/D'} | RPE Hoy: {todayAvgRpe !== null ? todayAvgRpe.toFixed(1) : (rpe || 'S/D')}</p>
                   <p className="text-neutral-300 font-medium">Pacing sugerido basado en carga y cansancio actual:</p>
                   <div className="flex flex-col gap-1 mt-1 font-mono">
                     <div className={`flex items-center gap-2 transition-opacity ${todayAvgRpe !== null && historicAvgRpe !== null && (todayAvgRpe - historicAvgRpe) > 0.5 ? 'opacity-100' : 'opacity-40'}`}>
                       <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm" />
                       <span className="text-emerald-400 font-black uppercase tracking-wider">Conservador y Controlado (Lento)</span>
                     </div>
                     <div className={`flex items-center gap-2 transition-opacity ${(todayAvgRpe === null || historicAvgRpe === null || Math.abs(todayAvgRpe - historicAvgRpe) <= 0.5) ? 'opacity-100' : 'opacity-40'}`}>
                       <div className="w-2 h-2 rounded-full bg-amber-400 shadow-sm" />
                       <span className="text-amber-400 font-black uppercase tracking-wider">Potencia Sostenida (Medio)</span>
                     </div>
                     <div className={`flex items-center gap-2 transition-opacity ${todayAvgRpe !== null && historicAvgRpe !== null && (todayAvgRpe - historicAvgRpe) < -0.5 ? 'opacity-100' : 'opacity-40'}`}>
                       <div className="w-2 h-2 rounded-full bg-[#E11D48] shadow-sm" />
                       <span className="text-[#E11D48] font-black uppercase tracking-wider">Sprint Anaeróbico (Rápido)</span>
                     </div>
                   </div>
                   <div className="mt-2 text-[8px] text-neutral-500 font-mono">
                     El ritmo está dictado por priorizar seguridad y técnica clínica L4. "Suave es rápido."
                   </div>

                    {/* CALORÍAS A TIEMPO CONVERTER FOR BATTLE ROPES & MACHINES */}
                    {(isCardio || exerciseName.toUpperCase().includes('ROPE') || exerciseName.toUpperCase().includes('CALO') || exerciseName.toUpperCase().includes('SOGA')) && (
                      <div className="mt-3 pt-2.5 border-t border-white/10 space-y-2 text-left">
                        <span className="font-brutalist text-electric-blue tracking-wider text-[8px] font-black uppercase block">
                          🔬 CALIBRACIÓN DE CARDIO & BATTLE ROPES [CF-L4]
                        </span>
                        <p className="text-[8px] text-neutral-400 leading-normal font-sans">
                          En Battle Ropes u otras variaciones sin pantalla de monitor, simula tus calorías deseadas traduciéndolas a tiempo de trabajo continuo:
                        </p>
                        <div className="flex gap-2 items-center">
                          <div className="flex-1">
                            <label className="text-[7.5px] text-neutral-500 font-mono block mb-0.5 uppercase font-bold">Cantar de Calorías:</label>
                            <div className="flex bg-[#0a0a0c] border border-white/10 rounded overflow-hidden">
                              <input 
                                type="number"
                                value={calInput}
                                onChange={(e) => setCalInput(e.target.value)}
                                min="1"
                                max="150"
                                className="bg-transparent w-full text-white font-mono text-xs px-2 py-1 focus:outline-none text-center"
                              />
                              <div className="flex border-l border-white/10 shrink-0">
                                {['9', '15', '21'].map(preset => (
                                  <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setCalInput(preset)}
                                    className={`text-[8.5px] px-2 py-0.5 hover:bg-electric-blue/10 text-neutral-300 font-mono border-r border-white/5 last:border-0 cursor-pointer ${calInput === preset ? 'bg-electric-blue/25 font-black text-white' : ''}`}
                                  >
                                    {preset} Cal
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {(() => {
                          const cVal = parseInt(calInput) || 0;
                          if (cVal <= 0) return null;
                          
                          // Sprint: 12 cal/min (5s per cal)
                          // Sustained: 10 cal/min (6s per cal)
                          // Aerobic/Control: 8 cal/min (7.5s per cal)
                          const formatter = (totSec: number) => {
                            const m = Math.floor(totSec / 60);
                            const s = Math.round(totSec % 60);
                            return `${m}:${s < 10 ? '0' : ''}${s}`;
                          };
                          
                          return (
                            <div className="grid grid-cols-3 gap-1 pt-1 bg-[#010102] p-1.5 border border-white/5 rounded-xs font-mono text-[7.5px] leading-relaxed">
                              <div className="text-center border-r border-white/5 pr-1">
                                <span className="text-rose-500 font-bold block">⚡ SPRINT</span>
                                <span className="text-white font-black text-[9px] block">{formatter(cVal * 5)}</span>
                                <span className="text-[6.5px] text-neutral-500 block leading-tight">12 kcal/min<br/>(5s / cal)</span>
                              </div>
                              <div className="text-center border-r border-white/5 pr-1">
                                <span className="text-amber-400 font-bold block">⏱️ SOSTENIDO</span>
                                <span className="text-white font-black text-[9px] block">{formatter(cVal * 6)}</span>
                                <span className="text-[6.5px] text-neutral-500 block leading-tight">10 kcal/min<br/>(6s / cal)</span>
                              </div>
                              <div className="text-center">
                                <span className="text-emerald-400 font-bold block">🌿 CONTROL</span>
                                <span className="text-white font-black text-[9px] block">{formatter(cVal * 7.5)}</span>
                                <span className="text-[6.5px] text-neutral-500 block leading-tight">8 kcal/min<br/>(7.5s / cal)</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                </div>
              )}

              {/* INTERACTIVE RIR -> RPE AUTOCALCULATOR */}
              <div className="bg-[var(--bg-input)] rounded-lg p-2.5 border border-[var(--border-color)] flex flex-col gap-1.5 shadow-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black tracking-widest text-[var(--text-main)] uppercase flex items-center gap-1.5 leading-none">
                    <Sparkles size={11} className="text-amber-500 fill-amber-500 " />
                    AUTOCALCULADORA RPE RÁPIDA (RIR)
                  </span>
                  <span className="text-[8px] font-bold text-[var(--text-muted)]">FÓRMULA: RPE = 10 - RIR</span>
                </div>
                <p className="text-[9px] text-[var(--text-muted)] leading-normal mt-0.5">
                  Toca cuántas repeticiones adicionales estimas que podrías haber completado antes de fallar (Reps en Recámara):
                </p>
                <div className="grid grid-cols-5 gap-1 mt-1">
                  {[
                    { rir: 0, rpeValue: '10', label: '0 de sobra', effect: 'Fallo absoluto (Extremo)', color: 'text-rose-500 border-rose-200' },
                    { rir: 1, rpeValue: '9', label: '1 de sobra', effect: 'Esfuerzo alto (Pesado)', color: 'text-amber-500 border-amber-200' },
                    { rir: 2, rpeValue: '8', label: '2 de sobra', effect: 'Óptimo potencia/fuerza', color: 'text-emerald-500 border-emerald-200' },
                    { rir: 3, rpeValue: '7', label: '3 de sobra', effect: 'Velocidad explosiva', color: 'text-blue-500 border-blue-200' },
                    { rir: 4, rpeValue: '6', label: '4+ de sobra', effect: 'Calentamiento/Técnica', color: 'text-indigo-400 border-indigo-100' }
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.rir}
                      onClick={() => {
                        setRpe(item.rpeValue);
                        setRir(String(item.rir));
                      }}
                      className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg border transition-all cursor-pointer select-none text-center ${
                        rpe === item.rpeValue 
                          ? 'bg-[var(--text-main)] text-[var(--bg-card)] border-[var(--text-main)] shadow-md scale-102 font-black' 
                          : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-[var(--text-main)] hover:text-[var(--text-main)]'
                      }`}
                      title={`${item.label}: ${item.effect}`}
                    >
                      <span className="text-[10px] font-extrabold block">RIR {item.rir}</span>
                      <span className={`text-[8px] font-mono font-bold mt-0.5 ${rpe === item.rpeValue ? 'text-[var(--bg-card)]' : 'text-[var(--text-data)] opacity-85'}`}>RPE {item.rpeValue}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* HISTORIC LOG LIST */}
          <motion.div variants={{} as any} className="w-full">
            {logs.length > 0 ? (
              <div className="border-t border-[var(--border-color)] pt-2.5">
                <span className="block text-[9px] font-extrabold text-[var(--text-muted)] uppercase mb-2">
                  Series registradas hoy
                </span>
                <div className="space-y-1.5">
                  {logs.map((log, index) => {
                    const rirVal = parseFloat(log.rir || '');
                    const isCloseToFailure = log.rir && log.rir !== 'N/D' && !isNaN(rirVal) && rirVal <= 1;
                    return (
                      <div 
                        key={`log-${dayId}-${exerciseName.replace(/\s+/g, '_')}-${log.id || index}`} 
                        className={`flex justify-between items-center py-1.5 px-2 bg-[var(--bg-input)] rounded border transition-all duration-300 ${
                          isCloseToFailure 
                            ? 'border-[var(--accent-main)] bg-red-500/5 dark:bg-red-500/10 shadow-sm' 
                            : 'border-[var(--border-color)]'
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[9px] text-[var(--text-muted)] font-extrabold bg-[var(--bg-card)] px-1 py-0.2 rounded border border-[var(--border-color)]">
                            SERIE {index + 1}
                          </span>
                          <span className="font-mono font-bold text-[var(--text-main)]">
                            {isCardio ? `${log.weight} • ${log.reps}` : `${log.weight} × ${log.reps}`}
                          </span>
                          <span className="font-mono text-[10px] text-[var(--accent-main)] font-extrabold flex items-center gap-0.5 bg-rose-50 dark:bg-rose-950/20 px-1.5 py-0.2 rounded">
                            <Star size={8} className="fill-[var(--accent-main)]" /> RPE {log.rpe}
                          </span>
                          {(() => {
                            if (isCloseToFailure && !isCardio) {
                              return (
                                <span 
                                  className="font-mono text-[9px] sm:text-[10px] font-black flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-sm  border border-red-500" 
                                  title="¡Intensidad de fallo clínico límite! Máximo reclutamiento motor (RIR 0-1)"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-white  inline-block shrink-0" />
                                  RIR {log.rir} 🔥 RIESGO DE FALLO BIOMECÁNICO
                                </span>
                              );
                            } else if (log.rir && log.rir !== 'N/D') {
                              return (
                                <span className="font-mono text-[10px] font-extrabold flex items-center gap-0.5 px-1.5 py-0.2 rounded text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/10">
                                  {isCardio ? `⏱️ RITMO: ${log.rir}` : `RIR ${log.rir}`}
                                </span>
                              );
                            } else {
                              return null;
                            }
                          })()}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteLog(log.id)}
                          className="text-[var(--text-muted)] hover:text-red-500 transition-colors p-1 rounded hover:bg-[var(--bg-card)] cursor-pointer"
                          title="Eliminar registro"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-2 text-[10px] text-[var(--text-muted)] font-medium italic">
                Sin series registradas aún. ¡Que empiece el entrenamiento!
              </div>
            )}
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
