import { useState, useEffect, useRef } from 'react';
import { AthleteState } from '../types/workout';
import { MessageSquare, Send, Sparkles, X, Brain, Heart, Zap, ShieldAlert, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface PushNotification {
  id: string;
  message: string;
  type: 'goal' | 'urgent' | 'info';
}

interface CoachChatProps {
  currentWorkouts: any;
  activeWeek: string;
  activeDayId: string;
  athlete: AthleteState;
  sideQuests: any;
  dailyGoals: Record<string, string>;
  onUpdateWorkouts: (workouts: any) => void;
  onUpdateAthlete: (athlete: AthleteState) => void;
  onUpdateSideQuests: (sideQuests: any) => void;
  onTriggerLightning?: () => void;
}

const PRESETS = [
  { label: '🏆 Reportar entrenamiento', prompt: 'Coach L4, vengo a reportar mi entrenamiento y mi Misión Secundaria de hoy. Te detallo qué ejercicios hice, mis repeticiones, cargas de peso, el RPE/RIR sentido, si mantuve el ROM completo y postura neutra, y si tuve que hacer alguna adaptación o escalado. Califícame y calcula mi recompensa.' },
  { label: '🛠️ Escalar el día de hoy', prompt: 'Coach, me siento un poco cansado hoy del SNC. ¿Podrías escalar el WOD o ejercicios de hoy manteniendo el estímulo fisiológico original pero regulando el RPE?' },
  { label: '🥤 ¿Por qué no guantes?', prompt: 'Coach, explícame por qué desaconsejas usar guantes en barra y cómo funciona el pliegue táctico de fibra de carbono.' },
  { label: '🏢 Adapta para Haedo', prompt: 'Coach L4, hoy entrenaré en Haedo. Por favor adapta la rutina de hoy considerando las limitaciones de espacio y equipamiento (mancuernas/médicas).' },
  { label: '🍕 Mitigar flexión core', prompt: 'Coach L4, siento molestia espinal baja. ¿Cómo hackeamos la rutina de hoy para desconectar por completo el psoas ilíaco?' }
];

export default function CoachChat({
  currentWorkouts,
  activeWeek,
  activeDayId,
  athlete,
  sideQuests,
  dailyGoals,
  onUpdateWorkouts,
  onUpdateAthlete,
  onUpdateSideQuests,
  onTriggerLightning
}: CoachChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [coachNotes, setCoachNotes] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Expose opening the chat from the outside
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open_nexus_chat', handleOpen);
    return () => window.removeEventListener('open_nexus_chat', handleOpen);
  }, []);

  // Expose receiving push notifications
  useEffect(() => {
    const handlePush = (e: any) => {
      if (e.detail) {
        const newNotif: PushNotification = {
          id: Math.random().toString(36).substring(7),
          message: e.detail.message,
          type: e.detail.type || 'info',
        };
        setNotifications(prev => [...prev, newNotif]);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
        }, 5000);
      }
    };
    window.addEventListener('nexus_push_notification', handlePush);
    return () => window.removeEventListener('nexus_push_notification', handlePush);
  }, []);

  // Load conversational history and notes from localStorage on mount
  useEffect(() => {
    const savedMsg = localStorage.getItem('nexus_coach_chat_v1');
    if (savedMsg) {
      try {
        setMessages(JSON.parse(savedMsg));
      } catch (e) {
        console.error('Failed to parse chat messages', e);
      }
    } else {
      // Warm initial welcome
      setMessages([
        {
          role: 'assistant',
          content: `¡Saludos, Nephalem **${athlete.identity}**! 🏋️‍♂️\n\nSoy **Nexus L4**, tu Master Coach clínico. Estoy listo para asistirte en vivo. Puedes hablar conmigo sobre tu entrenamiento, pedirme que re-estructure partes de tu rutina, que escale pesos, o que registre notas sobre tu progreso.\n\n*Dime: ¿en qué hackearemos tu entrenamiento hoy?*`
        }
      ]);
    }

    const savedNotes = localStorage.getItem('nexus_coach_notes_v1');
    if (savedNotes) {
      try {
        setCoachNotes(JSON.parse(savedNotes));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Sync assistant welcome message when athlete name is updated dynamically
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'assistant' && (messages[0].content.includes('Saludos, Nephalem') || messages[0].content.includes('Saludos,'))) {
      setMessages([
        {
          role: 'assistant',
          content: `¡Saludos, Nephalem **${athlete.identity}**! 🏋️‍♂️\n\nSoy **Nexus L4**, tu Master Coach clínico. Estoy listo para asistirte en vivo. Puedes hablar conmigo sobre tu entrenamiento, pedirme que re-estructure partes de tu rutina, que escale pesos, o que registre notas sobre tu progreso.\n\n*Dime: ¿en qué hackearemos tu entrenamiento hoy?*`
        }
      ]);
    }
  }, [athlete.identity]);

  // Save changes to localStorage on message update
  const saveMessages = (newMsgs: Message[]) => {
    setMessages(newMsgs);
    localStorage.setItem('nexus_coach_chat_v1', JSON.stringify(newMsgs));
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    const updatedHistory = [...messages, userMessage];
    saveMessages(updatedHistory);
    setInput('');
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory,
          currentWorkouts,
          athlete,
          activeWeek,
          activeDayId,
          sideQuests,
          dailyGoals
        })
      });

      if (!response.ok) {
        throw new Error('API server fluctuation');
      }

      const data = await response.json();
      
      // Update history with assistant reply
      const botMessage: Message = { role: 'assistant', content: data.message };
      saveMessages([...updatedHistory, botMessage]);

      // Check for live mutations
      if (data.updatedWorkouts) {
        onUpdateWorkouts(data.updatedWorkouts);
        triggerVisualSparkle('workouts');
      }

      if (data.updatedAthlete) {
        onUpdateAthlete(data.updatedAthlete);
        triggerVisualSparkle('athlete');
      }

      // Check if the AI filled in/updated side quests
      if (data.updatedSideQuests) {
        const wasCompleted = !!sideQuests[activeDayId]?.completed;
        const isCompleted = !!data.updatedSideQuests[activeDayId]?.completed;
        
        onUpdateSideQuests(data.updatedSideQuests);
        triggerVisualSparkle('sideQuests');

        if (isCompleted && !wasCompleted && onTriggerLightning) {
          onTriggerLightning();
        }
      }

      // Check if the AI filled in/updated exercise logs (RPE, RIR, reps, weights)
      if (data.updatedLogs && typeof data.updatedLogs === 'object') {
        Object.keys(data.updatedLogs).forEach(key => {
          const rawLogs = data.updatedLogs[key];
          if (Array.isArray(rawLogs)) {
            localStorage.setItem(key, JSON.stringify(rawLogs));
          }
        });
        // Dispatch event to update logs and charts immediately
        window.dispatchEvent(new Event('nexus_logs_updated'));
        triggerVisualSparkle('logs');
      }

      if (data.coachNotes && Array.isArray(data.coachNotes)) {
        setCoachNotes(data.coachNotes);
        localStorage.setItem('nexus_coach_notes_v1', JSON.stringify(data.coachNotes));
      }
    } catch (error) {
      console.error('Error during AI Chat:', error);
      saveMessages([
        ...updatedHistory,
        {
          role: 'assistant',
          content: '¡Alerta de SNC! He detectado una fluctuación de internet al entablar contacto con mi cerebro en la nube. Por favor, reitera tu consulta.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm('¿Está seguro de que desea borrar el historial de conversación con el Coach Nexus L4?')) {
      const initial: Message[] = [
        {
          role: 'assistant',
          content: `¡Historial borrado, Nephalem **${athlete.identity}**! El psoas se ha relajado. Mi bitácora de entrenamiento está limpia para registrar nuevos ciclos.`
        }
      ];
      saveMessages(initial);
      setCoachNotes([]);
      localStorage.removeItem('nexus_coach_notes_v1');
    }
  };

  const [sparkleType, setSparkleType] = useState<string | null>(null);
  const triggerVisualSparkle = (type: string) => {
    setSparkleType(type);
    setTimeout(() => setSparkleType(null), 3500);
  };

  return (
    <>
      {/* GLOBAL PUSH NOTIFICATION SYSTEM (L4 Coach AI Direct Messages) */}
      <div className="fixed top-6 right-6 z-[999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              layout
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-md shadow-2xl border font-mono text-xs w-72 md:w-80 backdrop-blur-md ${
                notif.type === 'goal'
                  ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100'
                  : notif.type === 'urgent'
                  ? 'bg-rose-950/90 border-rose-500/50 text-rose-100'
                  : 'bg-zinc-900/90 border-[#00f0ff]/30 text-white'
              }`}
            >
              <div className="shrink-0 pt-0.5">
                {notif.type === 'goal' ? <Award size={16} className="text-emerald-400" /> :
                 notif.type === 'urgent' ? <ShieldAlert size={16} className="text-rose-500 " /> :
                 <Brain size={16} className="text-[#00f0ff]" />}
              </div>
              <div className="flex-1 leading-relaxed whitespace-pre-wrap">
                {notif.message}
              </div>
              <button 
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                className="shrink-0 text-white/50 hover:text-white"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* FLOATING SPARK TOGGLE BUTTON (No Margin Clutter) */}
      <div className="fixed bottom-6 right-6 z-40 no-print flex flex-col items-end gap-2">
        <AnimatePresence>
          {sparkleType && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-zinc-900 border border-emerald-500/30 text-white text-[10px] md:text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xl font-mono text-[10px] uppercase font-bold"
            >
              <Zap size={11} className="text-amber-400" />
              <span>
                {sparkleType === 'workouts' 
                  ? '¡Rutina Modificada en Vivo por IA!' 
                  : '¡Ficha de Atleta Sincronizada!'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          id="btn-toggle-coach-chat"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-mono font-bold tracking-wider text-xs shadow-2xl transition-all hover:scale-105 select-none uppercase cursor-pointer z-40 border ${
            isOpen 
              ? 'bg-rose-600 text-white border-rose-700' 
              : 'bg-zinc-900 text-white hover:bg-black border-zinc-800'
          }`}
        >
          <Brain size={15} className={` text-rose-500`} />
          <span>{isOpen ? 'CERRAR CONSULTORIO' : 'CHATEAR CON L4 COACH AI'}</span>
          {!isOpen && (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -top-1 -right-1" />
          )}
        </button>
      </div>

      {/* CHAT PANEL SIDEBAR (Japan Brutalist - First Take Tone) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 260 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 260 }}
            transition={{ type: 'spring', damping: 24, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-full max-w-[430px] md:max-w-[460px] bg-[#FAFAFA] dark:bg-[#0D0D11] border-l border-zinc-200 dark:border-neutral-800 shadow-2xl z-[100] flex flex-col justify-between no-print font-sans normal-case"
          >
            {/* PANEL HEADER */}
            <div className="p-4 md:p-5 border-b border-zinc-200 dark:border-neutral-800 bg-white dark:bg-zinc-950 flex justify-between items-center relative">
              <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-rose-600" />
              
              <div className="pl-3.5 flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-rose-600 rounded-full" />
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-main)] font-mono flex items-center gap-1.5 leading-none">
                    <span>NEXUS L4 // COACH BIOMECÁNICO</span>
                  </h3>
                  <span className="text-[9px] text-[var(--text-muted)] font-mono font-extrabold block mt-1 tracking-widest">
                    CERTIFIED L4 COACH (PRVN • HWPO • MAYHEM)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  className="text-[9px] border border-zinc-200 dark:border-neutral-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 px-2.5 py-1 text-[var(--text-muted)] hover:text-rose-600 rounded-lg font-bold uppercase transition cursor-pointer"
                  title="Reiniciar chat"
                >
                  Limpiar
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 px-1.5 text-white hover:text-white font-bold transition rounded-full hover:bg-rose-700 bg-rose-600 cursor-pointer shadow flex items-center justify-center border border-rose-500 scale-95 origin-center hover:scale-100"
                  title="Cerrar Panel"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              </div>
            </div>

            {/* CHAT MESSAGE PANEL SCROLLER */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 bg-zinc-50 dark:bg-[#09090C]">
              
              {/* CURRENT NOTES SUBPANEL (Coach Clinical Remarks) */}
              {coachNotes.length > 0 && (
                <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-neutral-800 p-4 rounded-xl shadow-xs">
                  <div className="text-[9px] font-mono font-bold tracking-widest text-rose-600 uppercase flex items-center gap-1.5 mb-2 pb-1.5 border-b border-zinc-100 dark:border-zinc-800">
                    <ShieldAlert size={11} className="inline text-rose-500 shrink-0" />
                    <span>L4 CLINICAL TAKEAWAYS (EN VIVO):</span>
                  </div>
                  <ul className="space-y-1.5 list-none text-[10px] md:text-xs">
                    {coachNotes.map((note, idx) => (
                      <li key={`note-c-${idx}`} className="text-[var(--text-main)] flex items-start gap-1 font-medium italic">
                        <span className="text-rose-600 mr-1 font-bold font-mono">▸</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* MESSAGES LOOPER */}
              <div className="space-y-4">
                {messages.map((msg, idx) => {
                  const isAssistant = msg.role === 'assistant';
                  return (
                    <div
                      key={`msg-coach-${idx}`}
                      className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                    >
                      <div className="text-[8px] font-mono text-[var(--text-muted)] uppercase mb-1 px-1 tracking-widest font-extrabold">
                        {isAssistant ? 'NEXUS CF-L4' : athlete.identity}
                      </div>
                      
                      <div
                        className={`p-3.5 max-w-[90%] text-xs md:text-sm font-medium leading-relaxed rounded-2xl shadow-sm ${
                          isAssistant
                            ? 'bg-white dark:bg-zinc-900 text-[var(--text-main)] rounded-tl-none border border-zinc-100 dark:border-zinc-800'
                            : 'bg-zinc-900 text-white rounded-tr-none'
                        }`}
                      >
                        {/* Render simple custom text styling with bolding */}
                        {msg.content.split('\n').map((line, lIdx) => {
                          // Very basic markdown parser for strong syntax
                          const contentWithBold = line.split('**').map((chunk, cIdx) => {
                            if (cIdx % 2 === 1) {
                              return <strong key={cIdx} className="font-extrabold text-rose-600 dark:text-rose-400">{chunk}</strong>;
                            }
                            return chunk;
                          });
                          return (
                            <p key={lIdx} className={line === '' ? 'h-3' : 'mb-1.5'}>
                              {contentWithBold}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {isLoading && (
                  <div className="flex flex-col items-start">
                    <span className="text-[8px] font-mono text-[var(--text-muted)] uppercase mb-1 tracking-widest font-extrabold text-red-500 ">
                      NEXUS L4... ANALIZANDO PSICOMETRÍA Y BIOMECÁNICA
                    </span>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-600" />
                      <div className="w-2 h-2 rounded-full bg-rose-600" />
                      <div className="w-2 h-2 rounded-full bg-rose-600" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* PRESET INTEGRATED CHIPS */}
            <div className="p-3 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-neutral-800">
              <div className="text-[8px] text-[var(--text-muted)] font-mono font-bold uppercase mb-2 tracking-widest pl-1">
                PREGUNTAS RÁPIDAS AL COACH (EN VIVO):
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
                {PRESETS.map((preset, idx) => (
                  <button
                    key={`preset-${idx}`}
                    onClick={() => handleSendMessage(preset.prompt)}
                    className="shrink-0 bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-neutral-800 hover:border-rose-600 hover:bg-rose-50/10 text-[9px] md:text-[10px] text-[var(--text-main)] font-semibold px-2.5 py-1.5 rounded-lg uppercase tracking-wider transition-all select-none cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* MESSAGE INPUT CONSOLE */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(input);
              }}
              className="p-3 md:p-4 border-t border-zinc-200 dark:border-neutral-800 bg-white dark:bg-zinc-950 flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pregunta o pide mutar rutina..."
                disabled={isLoading}
                className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-neutral-800 text-[var(--text-main)] rounded-xl px-3.5 py-2.5 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-rose-500 font-semibold leading-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-zinc-900 dark:bg-[#18181F] text-white border border-zinc-700 hover:bg-rose-600 hover:border-rose-700 p-2.5 px-3.5 rounded-xl transition cursor-pointer disabled:opacity-40 shrink-0 flex items-center justify-center"
              >
                <Send size={14} className="stroke-[2.5px]" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
