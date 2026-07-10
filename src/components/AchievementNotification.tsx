// FILE_PATH: /src/components/AchievementNotification.tsx
// ACTION: CREATE
// DESCRIPTION: Dynamic Achievement Notification banner with bounce animation using framer-motion built under strict CF-L4 aesthetic
// ---------------------------------------------------------
import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Award, Sparkles, Check } from 'lucide-react';

interface AchievementNotificationProps {
  achievement: {
    id: string;
    title: string;
    description: string;
    icon: string;
    rarity: string;
    color: string;
  } | null;
  onClose: () => void;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  onClose,
}) => {
  useEffect(() => {
    if (!achievement) return;

    // Auto dismiss after exactly 3 seconds as requested
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100000] w-full max-w-sm px-4 no-print pointer-events-auto">
      <motion.div
        initial={{ y: -80, scale: 0.82, opacity: 0 }}
        animate={{ 
          y: 0, 
          scale: [0.82, 1.15, 0.95, 1.02, 1], // Bounce movement sequence
          opacity: 1 
        }}
        exit={{ y: -60, scale: 0.9, opacity: 0 }}
        transition={{ 
          y: { type: "spring", stiffness: 300, damping: 18 },
          opacity: { duration: 0.35 },
          scale: { type: "keyframes", ease: "easeInOut", duration: 0.65 }
        }}
        className="bg-black text-white border-2 border-[#00f0ff] p-3.5 shadow-[0_10px_35px_rgba(0,240,255,0.4)] relative overflow-hidden flex items-start gap-3 rounded-none select-none cursor-pointer"
        onClick={onClose}
        style={{ borderColor: achievement.color || '#00f0ff' }}
      >
        {/* Decorative corner flash */}
        <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        
        {/* Left Side: Dynamic Icon and Spark */}
        <div 
          className="p-2 shrink-0 border border-white/20 bg-[#18181B] flex items-center justify-center relative"
          style={{ textShadow: `0 0 8px ${achievement.color}` }}
        >
          <span className="text-xl leading-none">{achievement.icon || '🏆'}</span>
          <div className="absolute -bottom-1 -right-1 bg-amber-500 text-black p-0.5 rounded-none scale-90">
            <Sparkles size={8} className="animate-pulse" />
          </div>
        </div>

        {/* Middle Side: Detail */}
        <div className="flex-1 text-left space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5 justify-between">
            <span 
              className="text-[8px] font-mono tracking-widest font-black uppercase px-1.5 py-0.2"
              style={{ backgroundColor: `${achievement.color}15`, color: achievement.color }}
            >
              🏆 LOGRO DESBLOQUEADO
            </span>
            <span className="text-[7.5px] font-mono text-zinc-500 tracking-wider font-bold">
              {achievement.rarity.toUpperCase()}
            </span>
          </div>
          
          <h4 className="text-[12px] font-brutalist uppercase tracking-wide text-white leading-tight font-black truncate">
            {achievement.title}
          </h4>
          
          <p className="text-[9.5px] font-mono text-zinc-400 leading-tight">
            {achievement.description}
          </p>
        </div>

        {/* Right Close indicator */}
        <div className="self-center shrink-0 text-zinc-500 hover:text-white transition-colors">
          <Check size={12} className="text-emerald-400 font-extrabold animate-pulse" />
        </div>

        {/* Bottom scanner loader visual (duration 3 seconds) */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 pointer-events-none">
          <motion.div 
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 3, ease: 'linear' }}
            className="h-full"
            style={{ backgroundColor: achievement.color || '#00f0ff' }}
          />
        </div>
      </motion.div>
    </div>
  );
};
