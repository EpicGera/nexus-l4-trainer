import { Image as ImageIcon } from "lucide-react";
import { SectionCard, TXT } from "./ui/primitives";

const PRESETS = [
  {
    name: "Noir Chalk & Iron 🏋️‍♂️",
    d: "Estilo rústico, magnesio y halterofilia clásica",
    warmup: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop",
    strength: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop",
    metcon: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=800&auto=format&fit=crop",
    accessories: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Cyber CrossFit 🧬",
    d: "Fondo futurista de fibra y luces cibernéticas",
    warmup: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop",
    strength: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop",
    metcon: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=800&auto=format&fit=crop",
    accessories: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Raw Carbon 🍌",
    d: "Inspirado en texturas de fibra e imagen de alta potencia",
    warmup: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop",
    strength: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop",
    metcon: "https://images.unsplash.com/photo-1434596994096-19d4e89a7ec5?q=80&w=800&auto=format&fit=crop",
    accessories: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop",
  },
];

interface BlockImagesCardProps {
  enableThemedBackgrounds: boolean;
  setEnableThemedBackgrounds: (v: boolean) => void;
  warmupBg: string;
  setWarmupBg: (v: string) => void;
  strengthBg: string;
  setStrengthBg: (v: string) => void;
  metconBg: string;
  setMetconBg: (v: string) => void;
  accessoriesBg: string;
  setAccessoriesBg: (v: string) => void;
}

/**
 * Imágenes de fondo de cada bloque del pizarrón (calentamiento/fuerza/metcon/
 * accesorios): 3 presets o URL manual por bloque. Antes vivía en el modal
 * "Editar perfil" (eliminado); misma función, ahora como tarjeta directa.
 */
export default function BlockImagesCard({
  enableThemedBackgrounds,
  setEnableThemedBackgrounds,
  warmupBg,
  setWarmupBg,
  strengthBg,
  setStrengthBg,
  metconBg,
  setMetconBg,
  accessoriesBg,
  setAccessoriesBg,
}: BlockImagesCardProps) {
  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    setWarmupBg(preset.warmup);
    setStrengthBg(preset.strength);
    setMetconBg(preset.metcon);
    setAccessoriesBg(preset.accessories);
    localStorage.setItem("nexus_bg_warmup", preset.warmup);
    localStorage.setItem("nexus_bg_strength", preset.strength);
    localStorage.setItem("nexus_bg_metcon", preset.metcon);
    localStorage.setItem("nexus_bg_accessories", preset.accessories);
  };

  const fields: {
    label: string;
    value: string;
    set: (v: string) => void;
    key: string;
  }[] = [
    { label: "Fondo calentamiento (URL)", value: warmupBg, set: setWarmupBg, key: "nexus_bg_warmup" },
    { label: "Fondo fuerza / oly (URL)", value: strengthBg, set: setStrengthBg, key: "nexus_bg_strength" },
    { label: "Fondo metcon (URL)", value: metconBg, set: setMetconBg, key: "nexus_bg_metcon" },
    { label: "Fondo accesorios (URL)", value: accessoriesBg, set: setAccessoriesBg, key: "nexus_bg_accessories" },
  ];

  return (
    <SectionCard
      title="Imágenes y estilo visual de bloques"
      icon={<ImageIcon size={16} className="text-[color:var(--color-sem-cyan)]" />}
      subtitle="Fondo temático por tipo de bloque del pizarrón"
      badge={
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={enableThemedBackgrounds}
            onChange={(e) => {
              setEnableThemedBackgrounds(e.target.checked);
              localStorage.setItem("nexus_enable_themed_backgrounds", String(e.target.checked));
            }}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-[color:var(--color-card-2)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[color:var(--color-label)] after:border after:border-transparent after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[color:var(--color-sem-cyan)]/70 peer-checked:after:bg-[color:var(--color-sem-cyan)]" />
          <span className="ml-2 pr-1 font-mono text-[9px] uppercase font-bold text-[color:var(--color-label)] peer-checked:text-[color:var(--color-sem-cyan)]">
            {enableThemedBackgrounds ? "ACTIVO" : "INACTIVO"}
          </span>
        </label>
      }
    >
      {enableThemedBackgrounds && (
        <div className="space-y-3">
          <div className="space-y-1">
            <div className={TXT.label}>Plantillas de gráficas temáticas</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="text-[9px] font-mono bg-[color:var(--color-card-2)] text-[color:var(--color-ink-2)] rounded-[var(--radius-tile)] p-1.5 hover:brightness-125 transition-all text-left flex flex-col justify-between h-[52px] cursor-pointer"
                >
                  <span className="font-bold text-white block truncate w-full">{preset.name}</span>
                  <span className="text-[7.5px] text-[color:var(--color-label)] line-clamp-2 leading-tight">
                    {preset.d}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {fields.map((f) => (
              <div key={f.key} className="space-y-1">
                <label className="text-[9px] text-[color:var(--color-label)] block font-mono uppercase">
                  {f.label}
                </label>
                <input
                  type="text"
                  value={f.value}
                  onChange={(e) => {
                    f.set(e.target.value);
                    localStorage.setItem(f.key, e.target.value);
                  }}
                  className="w-full bg-[color:var(--color-card-2)] rounded-[var(--radius-tile)] p-1.5 text-white font-mono text-[9px] outline-none focus:ring-2 focus:ring-[color:var(--color-sem-cyan)]"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
}
