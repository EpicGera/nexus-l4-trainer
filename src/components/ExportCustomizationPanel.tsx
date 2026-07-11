import React from "react";
import { Camera, Share2, Maximize } from "lucide-react";

interface ExportCustomizationPanelProps {
  exportBgImage: string | null;
  setExportBgImage: (bg: string | null) => void;
  exportLayout: "center" | "left" | "right";
  setExportLayout: (layout: "center" | "left" | "right") => void;
  exportVerticalLayout: "top" | "center" | "bottom";
  setExportVerticalLayout: (layout: "top" | "center" | "bottom") => void;
  exportCardWidth: "compact" | "standard" | "wide";
  setExportCardWidth: (width: "compact" | "standard" | "wide") => void;
  exportAthleteName: string;
  setExportAthleteName: (name: string) => void;
  exportTheme?: string;
  setExportTheme?: (theme: string) => void;
  exportInspiration: string;
  setExportInspiration: (ins: string) => void;
  exportCardBlur: boolean;
  setExportCardBlur: (blur: boolean) => void;
  exportCardOpacity: number;
  setExportCardOpacity: (op: number) => void;
  exportCardHeightLimit: number;
  setExportCardHeightLimit: (height: number) => void;
  exportPhotoFilter: "none" | "vibrant" | "grayscale" | "sepia" | "duotone" | "silueta" | "neon";
  setExportPhotoFilter: (
    f: "none" | "vibrant" | "grayscale" | "sepia" | "duotone" | "silueta" | "neon",
  ) => void;
  // Live preview of the story card (scaled-down ShareCardOverlay)
  preview?: React.ReactNode;
  onExport?: () => void;
  isExporting?: boolean;
  isFullscreenPreview?: boolean;
  setIsFullscreenPreview?: (val: boolean) => void;
  // Modo clip de video: el panel se muestra aunque no haya foto, oculta los
  // controles de foto (filtro, quitar foto) y el export pasa a "EXPORTAR VIDEO".
  clipMode?: boolean;
  onExportVideo?: () => void;
  isExportingVideo?: boolean;
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="text-[10px] font-mono font-black text-zinc-400 tracking-wider uppercase flex items-center gap-1.5">
    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> {children}
  </label>
);

const segBtnClass = (active: boolean) =>
  `py-2.5 text-[10px] font-mono font-black tracking-widest uppercase transition-all cursor-pointer rounded-sm ${
    active
      ? "bg-amber-500 text-black shadow-lg"
      : "text-zinc-400 hover:text-white hover:bg-[color:var(--color-card-2)]"
  }`;

export default function ExportCustomizationPanel({
  exportBgImage,
  setExportBgImage,
  exportLayout,
  setExportLayout,
  exportVerticalLayout,
  setExportVerticalLayout,
  exportCardWidth,
  setExportCardWidth,
  exportAthleteName,
  setExportAthleteName,
  exportTheme = "nexus",
  setExportTheme,
  exportInspiration,
  setExportInspiration,
  exportCardBlur,
  setExportCardBlur,
  exportCardOpacity,
  setExportCardOpacity,
  exportCardHeightLimit,
  setExportCardHeightLimit,
  exportPhotoFilter,
  setExportPhotoFilter,
  preview,
  onExport,
  isExporting = false,
  isFullscreenPreview,
  setIsFullscreenPreview,
  clipMode = false,
  onExportVideo,
  isExportingVideo = false,
}: ExportCustomizationPanelProps) {
  if (!exportBgImage && !clipMode) return null;

  return (
    <div className="w-full col-span-full no-print bg-[#0a0a0f]/95 border-2 border-amber-500/40 p-6 mb-6 text-left flex flex-col gap-5 shadow-[0_25px_60px_rgba(0,0,0,0.85)] rounded-xl relative">
      {/* Decorative top dot neon glow */}
      <div className="absolute top-0 left-10 right-10 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-80" />

      <div className="flex items-center justify-between border-b border-zinc-800 pb-3.5">
        <div className="flex items-center gap-2">
          <Camera className="text-amber-500 animate-pulse" size={18} />
          <span className="font-mono text-xs font-black tracking-widest text-amber-500 uppercase">
            IG STORY CREATOR // {clipMode ? "EMPLAZAMIENTO SOBRE CLIP" : "TELEMETRÍA GRÁFICA V3"}
          </span>
        </div>
        {!clipMode && (
          <button
            onClick={() => setExportBgImage(null)}
            className="text-[9px] bg-red-950/60 hover:bg-red-900 px-3 py-1.5 text-red-400 font-mono font-black uppercase transition-all tracking-widest cursor-pointer border border-red-900/50 rounded"
          >
            QUITAR FOTO DE FONDO
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── LIVE PREVIEW COLUMN ───────────────────────────────────────── */}
        {preview && (
          <div className="flex flex-col items-center gap-3 shrink-0 lg:sticky lg:top-24 self-start mx-auto lg:mx-0">
            <span className="font-mono text-[10px] font-black tracking-widest text-zinc-400 uppercase flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              VISTA PREVIA EN VIVO
            </span>
            <div className="relative group cursor-pointer">
              {preview}
              
              {setIsFullscreenPreview && (
                <button
                  type="button"
                  onClick={() => setIsFullscreenPreview(true)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm"
                >
                  <Maximize size={32} className="text-white drop-shadow-md" />
                  <span className="font-mono font-black text-white tracking-widest text-sm drop-shadow-md bg-black/50 px-3 py-1 rounded">MOVER / PANTALLA COMPLETA</span>
                </button>
              )}
            </div>
            {clipMode ? (
              onExportVideo && (
                <button
                  type="button"
                  onClick={onExportVideo}
                  disabled={isExportingVideo}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 font-mono text-[11px] font-black tracking-widest uppercase bg-signal-red hover:brightness-110 text-white rounded shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Share2 size={15} className={isExportingVideo ? "animate-spin" : ""} />
                  {isExportingVideo ? "RENDERIZANDO..." : "EXPORTAR VIDEO"}
                </button>
              )
            ) : (
              onExport && (
                <button
                  type="button"
                  onClick={onExport}
                  disabled={isExporting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 font-mono text-[11px] font-black tracking-widest uppercase bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-white rounded shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Share2 size={15} className={isExporting ? "animate-spin" : ""} />
                  {isExporting ? "EXPORTANDO..." : "EXPORTAR STORY JPG"}
                </button>
              )
            )}
          </div>
        )}

        {/* ── CONTROLS ──────────────────────────────────────────────────── */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Alineación Horizontal */}
          <div className="flex flex-col gap-2 font-condensed">
            <SectionLabel>Alineación Horizontal</SectionLabel>
            <div className="grid grid-cols-3 gap-1 bg-black/80 p-1 border border-zinc-800 rounded">
              <button
                onClick={() => setExportLayout("left")}
                className={segBtnClass(exportLayout === "left")}
              >
                Izquierda
              </button>
              <button
                onClick={() => setExportLayout("center")}
                className={segBtnClass(exportLayout === "center")}
              >
                Centrado
              </button>
              <button
                onClick={() => setExportLayout("right")}
                className={segBtnClass(exportLayout === "right")}
              >
                Derecha
              </button>
            </div>
          </div>

          {/* Alineación Vertical */}
          <div className="flex flex-col gap-2 font-condensed">
            <SectionLabel>Alineación Vertical</SectionLabel>
            <div className="grid grid-cols-3 gap-1 bg-black/80 p-1 border border-zinc-800 rounded">
              <button
                onClick={() => setExportVerticalLayout("top")}
                className={segBtnClass(exportVerticalLayout === "top")}
                title="Colocar el bloque arriba"
              >
                Arriba
              </button>
              <button
                onClick={() => setExportVerticalLayout("center")}
                className={segBtnClass(exportVerticalLayout === "center")}
                title="Centrar verticalmente"
              >
                Centro
              </button>
              <button
                onClick={() => setExportVerticalLayout("bottom")}
                className={segBtnClass(exportVerticalLayout === "bottom")}
                title="Colocar el bloque abajo"
              >
                Abajo
              </button>
            </div>
          </div>
          {/* Tema Visual */}
          <div className="flex flex-col gap-2 font-condensed col-span-1 md:col-span-2 mb-4">
            <SectionLabel>Estilo Gráfico (Tema)</SectionLabel>
            <div className="grid grid-cols-4 gap-1 bg-black/80 p-1 border border-zinc-800 rounded">
              <button
                onClick={() => setExportTheme && setExportTheme("nexus")}
                className={segBtnClass(exportTheme === "nexus")}
                title="Nexus L4 (Ambar/Naranja)"
              >
                Nexus L4
              </button>
              <button
                onClick={() => setExportTheme && setExportTheme("cyberpunk")}
                className={segBtnClass(exportTheme === "cyberpunk")}
                title="Cyberpunk (Cian/Rosa)"
              >
                Cyberpunk
              </button>
              <button
                onClick={() => setExportTheme && setExportTheme("monochrome")}
                className={segBtnClass(exportTheme === "monochrome")}
                title="Monochrome (Blanco/Gris)"
              >
                Monochrome
              </button>
              <button
                onClick={() => setExportTheme && setExportTheme("wodfrg")}
                className={segBtnClass(exportTheme === "wodfrg")}
                title="WODFRG (Rojo/Blanco/Negro)"
              >
                WODFRG
              </button>
              <button
                onClick={() => setExportTheme && setExportTheme("brutalist")}
                className={segBtnClass(exportTheme === "brutalist")}
                title="Brutalist (Anton gigante, ámbar, alto contraste)"
              >
                Brutalist
              </button>
              <button
                onClick={() => setExportTheme && setExportTheme("synthwave")}
                className={segBtnClass(exportTheme === "synthwave")}
                title="Synthwave (magenta/cian, glow retro)"
              >
                Synthwave
              </button>
              <button
                onClick={() => setExportTheme && setExportTheme("editorial")}
                className={segBtnClass(exportTheme === "editorial")}
                title="Editorial (revista/poster, grano sutil)"
              >
                Editorial
              </button>
              <button
                onClick={() => setExportTheme && setExportTheme("holo")}
                className={segBtnClass(exportTheme === "holo")}
                title="Holo (aberración cromática + scanlines)"
              >
                Holo
              </button>
            </div>
          </div>

          {/* Ancho del bloque */}
          <div className="flex flex-col gap-2 font-condensed">
            <SectionLabel>Ancho del Bloque</SectionLabel>
            <div className="grid grid-cols-3 gap-1 bg-black/80 p-1 border border-zinc-800 rounded">
              <button
                onClick={() => setExportCardWidth("compact")}
                className={segBtnClass(exportCardWidth === "compact")}
                title="Súper compacto"
              >
                Compacto
              </button>
              <button
                onClick={() => setExportCardWidth("standard")}
                className={segBtnClass(exportCardWidth === "standard")}
                title="Estándar"
              >
                Medio
              </button>
              <button
                onClick={() => setExportCardWidth("wide")}
                className={segBtnClass(exportCardWidth === "wide")}
                title="Ancho"
              >
                Ancho
              </button>
            </div>
          </div>

          {/* Efecto Cristal Esmerilado */}
          <div className="flex flex-col gap-2 font-condensed">
            <SectionLabel>Efecto Cristal Esmerilado</SectionLabel>
            <div className="grid grid-cols-2 gap-1 bg-black/80 p-1 border border-zinc-800 rounded">
              <button
                type="button"
                onClick={() => setExportCardBlur(true)}
                className={segBtnClass(exportCardBlur)}
              >
                Activo
              </button>
              <button
                type="button"
                onClick={() => setExportCardBlur(false)}
                className={segBtnClass(!exportCardBlur)}
              >
                Inactivo
              </button>
            </div>
          </div>

          {/* Nombre del Atleta */}
          <div className="flex flex-col gap-2 font-condensed">
            <SectionLabel>Nombre del Atleta (Neón)</SectionLabel>
            <input
              type="text"
              placeholder="Ej. GERA Y FLOR..."
              className="bg-black/90 border border-zinc-800 text-white text-xs px-3.5 py-2.5 rounded uppercase focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono transition-all"
              value={exportAthleteName}
              onChange={(e) => setExportAthleteName(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              spellCheck={false}
            />
          </div>

          {/* Inspiración */}
          <div className="flex flex-col gap-2 font-condensed">
            <SectionLabel>Inspiración / Sello Inferior</SectionLabel>
            <input
              type="text"
              placeholder="Ej. MAYHEM INSPIRED..."
              className="bg-black/90 border border-zinc-800 text-white text-xs px-3.5 py-2.5 rounded uppercase focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono transition-all"
              value={exportInspiration}
              onChange={(e) => setExportInspiration(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              spellCheck={false}
            />
          </div>

          {/* Opacidad Slider */}
          <div className="flex flex-col gap-2 bg-black/60 p-4 border border-zinc-800 rounded font-condensed">
            <div className="flex justify-between items-center text-[10px] font-mono font-black text-zinc-400 tracking-wider uppercase mb-1">
              <span>Opacidad de Rutina</span>
              {exportCardOpacity === 0 ? (
                <span className="text-[#00f0ff] font-bold animate-pulse">
                  FLOTANTE HUD
                </span>
              ) : (
                <span className="text-amber-500">{exportCardOpacity}%</span>
              )}
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              value={exportCardOpacity}
              onChange={(e) => setExportCardOpacity(Number(e.target.value))}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Altura Máxima Slider */}
          <div className="flex flex-col gap-2 bg-black/60 p-4 border border-zinc-800 rounded font-condensed">
            <div className="flex justify-between items-center text-[10px] font-mono font-black text-zinc-400 tracking-wider uppercase mb-1">
              <span>Uso de Imagen (Altura)</span>
              <span className="text-amber-500">{exportCardHeightLimit}%</span>
            </div>
            <input
              type="range"
              min="30"
              max="70"
              step="1"
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              value={exportCardHeightLimit}
              onChange={(e) => setExportCardHeightLimit(Number(e.target.value))}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Filtro de Foto de Fondo (tratamiento de la imagen) — solo con foto */}
          {!clipMode && (
          <div className="flex flex-col gap-2 font-condensed md:col-span-2">
            <SectionLabel>Filtro de Foto de Fondo</SectionLabel>
            <div className="grid grid-cols-4 gap-1 bg-black/80 p-1 border border-zinc-800 rounded">
              <button
                type="button"
                onClick={() => setExportPhotoFilter("none")}
                className={segBtnClass(exportPhotoFilter === "none")}
                title="Foto original"
              >
                Original
              </button>
              <button
                type="button"
                onClick={() => setExportPhotoFilter("vibrant")}
                className={segBtnClass(exportPhotoFilter === "vibrant")}
                title="Saturación y contraste reforzados"
              >
                Vibrante
              </button>
              <button
                type="button"
                onClick={() => setExportPhotoFilter("grayscale")}
                className={segBtnClass(exportPhotoFilter === "grayscale")}
                title="Blanco y negro"
              >
                B&N
              </button>
              <button
                type="button"
                onClick={() => setExportPhotoFilter("sepia")}
                className={segBtnClass(exportPhotoFilter === "sepia")}
                title="Tono cálido vintage"
              >
                Sepia
              </button>
              <button
                type="button"
                onClick={() => setExportPhotoFilter("duotone")}
                className={segBtnClass(exportPhotoFilter === "duotone")}
                title="Duotono según el acento del tema"
              >
                Duotono
              </button>
              <button
                type="button"
                onClick={() => setExportPhotoFilter("silueta")}
                className={segBtnClass(exportPhotoFilter === "silueta")}
                title="Detecta personas y las recorta como silueta sólida (local, sin nube)"
              >
                Silueta
              </button>
              <button
                type="button"
                onClick={() => setExportPhotoFilter("neon")}
                className={segBtnClass(exportPhotoFilter === "neon")}
                title="Resplandor neón siguiendo el contorno real de las personas"
              >
                Neón
              </button>
            </div>
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
              Silueta / Neón detectan personas (procesado local en el dispositivo)
            </span>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
