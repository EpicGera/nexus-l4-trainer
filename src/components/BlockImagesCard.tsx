import { Image as ImageIcon, RotateCcw } from "lucide-react";
import { SectionCard, TXT } from "./ui/primitives";

/** Set local (public/images/) — reemplaza los presets viejos de Unsplash. */
const LOCAL_DEFAULTS = {
  warmup: "/images/warmup_bg.png",
  strength: "/images/strength_bg.png",
  metcon: "/images/metcon_bg.png",
  accessories: "/images/accessories_bg.png",
};

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
 * accesorios). Antes vivía en el modal "Editar perfil" (eliminado); misma
 * función, ahora como tarjeta directa. Set propio en public/images/ por
 * default — sin URLs externas de Unsplash.
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
  const restoreLocalDefaults = () => {
    setWarmupBg(LOCAL_DEFAULTS.warmup);
    setStrengthBg(LOCAL_DEFAULTS.strength);
    setMetconBg(LOCAL_DEFAULTS.metcon);
    setAccessoriesBg(LOCAL_DEFAULTS.accessories);
    localStorage.setItem("nexus_bg_warmup", LOCAL_DEFAULTS.warmup);
    localStorage.setItem("nexus_bg_strength", LOCAL_DEFAULTS.strength);
    localStorage.setItem("nexus_bg_metcon", LOCAL_DEFAULTS.metcon);
    localStorage.setItem("nexus_bg_accessories", LOCAL_DEFAULTS.accessories);
  };

  const fields: {
    label: string;
    value: string;
    set: (v: string) => void;
    key: string;
  }[] = [
    { label: "Fondo calentamiento", value: warmupBg, set: setWarmupBg, key: "nexus_bg_warmup" },
    { label: "Fondo fuerza / oly", value: strengthBg, set: setStrengthBg, key: "nexus_bg_strength" },
    { label: "Fondo metcon", value: metconBg, set: setMetconBg, key: "nexus_bg_metcon" },
    { label: "Fondo accesorios", value: accessoriesBg, set: setAccessoriesBg, key: "nexus_bg_accessories" },
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
          <button
            type="button"
            onClick={restoreLocalDefaults}
            className="flex items-center gap-1.5 text-[9px] font-mono font-black uppercase tracking-wider bg-[color:var(--color-sem-cyan)]/10 text-[color:var(--color-sem-cyan)] hover:bg-[color:var(--color-sem-cyan)] hover:text-black transition-all px-3 py-1.5 rounded-[var(--radius-tile)] cursor-pointer"
          >
            <RotateCcw size={11} aria-hidden="true" /> Restaurar imágenes Nexus
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
