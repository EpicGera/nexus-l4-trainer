import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface ConfettiProps {
  trigger: number;
}

interface Particle {
  id: string;
  color: string;
  size: number;
  shape: 'circle' | 'square' | 'triangle';
  startX: string;
  startY: string;
  targetX: number;
  targetY: number;
  rotateTarget: number;
}

export default function Confetti({ trigger }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (trigger === 0) return;

    const colors = [
      '#FF0055', // Rose hot
      '#0066FF', // Blue neon
      '#10B981', // Metcon green
      '#F59E0B', // Accessory amber
      '#8B5CF6', // Rest purple
      '#EF4444', // Red impact
      '#06B6D4', // Cyan
      '#F43F5E', // Rose-500
      '#10B981', // Emerald-500
      '#EC4899'  // Pink-500
    ];
    
    const shapes: ('circle' | 'square' | 'triangle')[] = ['circle', 'square', 'triangle'];

    // Emit 45 particles from the bottom-left corner
    const leftParticles: Particle[] = Array.from({ length: 45 }).map((_, i) => {
      // Angle between -15 deg (right-up) and -75 deg (mostly vertical)
      const angleDeg = -15 - Math.random() * 60;
      const angleRad = (angleDeg * Math.PI) / 180;
      const distance = 160 + Math.random() * 380;
      
      const size = 6 + Math.random() * 11;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      
      const targetX = Math.cos(angleRad) * distance;
      const targetY = Math.sin(angleRad) * distance;
      
      return {
        id: `confetti-L-${trigger}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        color,
        size,
        shape,
        startX: '5%',
        startY: '95%',
        targetX,
        targetY,
        rotateTarget: 360 + Math.random() * 720
      };
    });

    // Emit 45 particles from the bottom-right corner
    const rightParticles: Particle[] = Array.from({ length: 45 }).map((_, i) => {
      // Angle between-105 deg (mostly vertical) and -165 deg (left-up)
      const angleDeg = -105 - Math.random() * 60;
      const angleRad = (angleDeg * Math.PI) / 180;
      const distance = 160 + Math.random() * 380;
      
      const size = 6 + Math.random() * 11;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      
      const targetX = Math.cos(angleRad) * distance;
      const targetY = Math.sin(angleRad) * distance;
      
      return {
        id: `confetti-R-${trigger}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        color,
        size,
        shape,
        startX: '95%',
        startY: '95%',
        targetX,
        targetY,
        rotateTarget: -(360 + Math.random() * 720)
      };
    });

    setParticles([...leftParticles, ...rightParticles]);

    // Cleanup after animation finishes
    const timer = setTimeout(() => {
      setParticles([]);
    }, 4000);

    return () => clearTimeout(timer);
  }, [trigger]);

  if (particles.length === 0) return null;

  return (
    <motion.div 
      key={`confetti-${trigger}`}
      initial={{ scale: 0.4, y: 100, opacity: 0 }}
      animate={{ 
        scale: [0.4, 1.25, 0.9, 1.05, 1], 
        y: [100, -25, 10, -3, 0],
        opacity: 1 
      }}
      transition={{ 
        type: "tween",
        ease: "easeOut",
        duration: 0.95
      }}
      className="fixed inset-0 pointer-events-none z-[100] overflow-hidden"
    >
      {particles.map((p) => {
        let borderRadius = '0%';
        if (p.shape === 'circle') borderRadius = '50%';
        
        let clipPath = undefined;
        if (p.shape === 'triangle') {
          clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
        }

        return (
          <motion.div
            key={p.id}
            initial={{ 
              opacity: 1, 
              scale: 0.1, 
              x: 0, 
              y: 0, 
              rotate: 0 
            }}
            animate={{ 
              opacity: [1, 1, 0.8, 0], 
              scale: [0.2, 1.2, 0.9, 0], 
              x: p.targetX, 
              y: p.targetY + 250, // Gravity acceleration emulation
              rotate: p.rotateTarget 
            }}
            transition={{ 
              duration: 3.2, 
              ease: [0.1, 0.8, 0.35, 1] 
            }}
            style={{
              position: 'absolute',
              left: p.startX,
              top: p.startY,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius,
              clipPath,
            }}
          />
        );
      })}
    </motion.div>
  );
}
