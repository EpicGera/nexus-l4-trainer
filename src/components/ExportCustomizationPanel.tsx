import React, { useRef } from "react";
import { Camera } from "lucide-react";

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
  exportInspiration: string;
  setExportInspiration: (ins: string) => void;
  exportCardBlur: boolean;
  setExportCardBlur: (blur: boolean) => void;
  exportCardOpacity: number;
  setExportCardOpacity: (op: number) => void;
  exportOverlayImage: string | null;
  setExportOverlayImage: (img: string | null) => void;
  exportOverlayX: number;
  setExportOverlayX: (x: number) => void;
  exportOverlayY: number;
  setExportOverlayY: (y: number) => void;
  exportOverlayScale: number;
  setExportOverlayScale: (scale: number) => void;
  exportOverlayZ: "front" | "back";
  setExportOverlayZ: (z: "front" | "back") => void;
  exportCardHeightLimit: number;
  setExportCardHeightLimit: (height: number) => void;
  handleOverlayImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

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
  exportInspiration,
  setExportInspiration,
  exportCardBlur,
  setExportCardBlur,
  exportCardOpacity,
  setExportCardOpacity,
  exportOverlayImage,
  setExportOverlayImage,
  exportOverlayX,
  setExportOverlayX,
  exportOverlayY,
  setExportOverlayY,
  exportOverlayScale,
  setExportOverlayScale,
  exportOverlayZ,
  setExportOverlayZ,
  exportCardHeightLimit,
  setExportCardHeightLimit,
  handleOverlayImageUpload,
}: ExportCustomizationPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!exportBgImage) return null;

  return (
    <div className="w-full col-span-full no-print bg-[#0a0a0f]/95 border-2 border-amber-500/40 p-6 mb-6 text-left flex flex-col gap-5 shadow-[0_25px_60px_rgba(0,0,0,0.85)] rounded-xl relative">
      {/* Decorative top dot neon glow */}
      <div className="absolute top-0 left-10 right-10 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-80" />

      <div className="flex items-center justify-between border-b border-zinc-800 pb-3.5">
        <div className="flex items-center gap-2">
          <Camera className="text-amber-500 animate-pulse" size={18} />
          <span className="font-mono text-xs font-black tracking-widest text-amber-500 uppercase">
            IG STORY CREATOR // TELEMETRÍA GRÁFICA V2
          </span>
        </div>
        <button
          onClick={() => {
            setExportBgImage(null);
            setExportOverlayImage(null);
          }}
          className="text-[9px] bg-red-950/60 hover:bg-red-900 px-3 py-1.5 text-red-400 font-mono font-black uppercase transition-all tracking-widest cursor-pointer border border-red-900/50 rounded"
        >
          QUITAR FOTO DE FONDO
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Fila 2: Posición Horizontal */}
        <div className="flex flex-col gap-2 font-condensed">
          <label className="text-[10px] font-mono font-black text-zinc-400 tracking-wider uppercase flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Alineación Horizontal
          </label>
          <div className="grid grid-cols-3 gap-1 bg-black/80 p-1 border border-zinc-800 rounded">
            <button
              onClick={() => setExportLayout("left")}
              className={`py-2.5 text-[10px] font-mono font-black tracking-widest uppercase transition-all cursor-pointer rounded-sm ${
                exportLayout === "left"
                  ? "bg-amber-500 text-black shadow-lg"
                  : "text-zinc-450 hover:text-white hover:bg-white/5"
              }`}
            >
              Izquierda
            </button>
            <button
              onClick={() => setExportLayout("center")}
              className={`py-2.5 text-[10px] font-mono font-black tracking-widest uppercase transition-all cursor-pointer rounded-sm ${
                exportLayout === "center"
                  ? "bg-amber-500 text-black shadow-lg"
                  : "text-zinc-450 hover:text-white hover:bg-white/5"
              }`}
            >
              Centrado
            </button>
            <button
              onClick={() => setExportLayout("right")}
              className={`py-2.5 text-[10px] font-mono font-black tracking-widest uppercase transition-all cursor-pointer rounded-sm ${
                exportLayout === "right"
                  ? "bg-amber-500 text-black shadow-lg"
                  : "text-zinc-450 hover:text-white hover:bg-white/5"
              }`}
            >
              Derecha
            </button>
          </div>
        </div>

        {/* Fila 2: Posición Vertical */}
        <div className="flex flex-col gap-2 font-condensed">
          <label className="text-[10px] font-mono font-black text-zinc-400 tracking-wider uppercase flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Alineación Vertical (Columnas)
          </label>
          <div className="grid grid-cols-3 gap-1 bg-black/80 p-1 border border-zinc-800 rounded">
            <button
              onClick={() => setExportVerticalLayout("top")}
              disabled={exportLayout === "center"}
              className={`py-2.5 text-[10px] font-mono font-black tracking-widest uppercase transition-all disabled:opacity-20 disabled:pointer-events-none cursor-pointer rounded-sm ${
                exportVerticalLayout === "top" && exportLayout !== "center"
                  ? "bg-amber-500 text-black shadow-lg"
                  : "text-zinc-450 hover:text-white hover:bg-white/5"
              }`}
              title="Colocar el bloque arriba"
            >
              Arriba
            </button>
            <button
              onClick={() => setExportVerticalLayout("center")}
              disabled={exportLayout === "center"}
              className={`py-2.5 text-[10px] font-mono font-black tracking-widest uppercase transition-all disabled:opacity-20 disabled:pointer-events-none cursor-pointer rounded-sm ${
                exportVerticalLayout === "center" && exportLayout !== "center"
                  ? "bg-amber-500 text-black shadow-lg"
                  : "text-zinc-450 hover:text-white hover:bg-white/5"
              }`}
              title="Centrar verticalmente"
            >
              Centro
            </button>
            <button
              onClick={() => setExportVerticalLayout("bottom")}
              disabled={exportLayout === "center"}
              className={`py-2.5 text-[10px] font-mono font-black tracking-widest uppercase transition-all disabled:opacity-20 disabled:pointer-events-none cursor-pointer rounded-sm ${
                exportVerticalLayout === "bottom" && exportLayout !== "center"
                  ? "bg-amber-500 text-black shadow-lg"
                  : "text-zinc-450 hover:text-white hover:bg-white/5"
              }`}
              title="Colocar el bloque abajo"
            >
              Abajo
            </button>
          </div>
        </div>

        {/* Ancho del bloque */}
        <div className="flex flex-col gap-2 font-condensed">
          <label className="text-[10px] font-mono font-black text-zinc-400 tracking-wider uppercase flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Ancho del Bloque
          </label>
          <div className="grid grid-cols-3 gap-1 bg-black/80 p-1 border border-zinc-800 rounded">
            <button
              onClick={() => setExportCardWidth("compact")}
              disabled={exportLayout === "center"}
              className={`py-2.5 text-[10px] font-mono font-black tracking-widest uppercase transition-all disabled:opacity-20 disabled:pointer-events-none cursor-pointer rounded-sm ${
                exportCardWidth === "compact" || exportLayout === "center"
                  ? "bg-amber-500 text-black shadow-lg"
                  : "text-zinc-450 hover:text-white hover:bg-white/5"
              }`}
              title="Súper compacto (440px)"
            >
              Compacto
            </button>
            <button
              onClick={() => setExportCardWidth("standard")}
              disabled={exportLayout === "center"}
              className={`py-2.5 text-[10px] font-mono font-black tracking-widest uppercase transition-all disabled:opacity-20 disabled:pointer-events-none cursor-pointer rounded-sm ${
                exportCardWidth === "standard" && exportLayout !== "center"
                  ? "bg-amber-500 text-black shadow-lg"
                  : "text-zinc-450 hover:text-white hover:bg-white/5"
              }`}
              title="Estándar (510px)"
            >
              Medio
            </button>
            <button
              onClick={() => setExportCardWidth("wide")}
              disabled={exportLayout === "center"}
              className={`py-2.5 text-[10px] font-mono font-black tracking-widest uppercase transition-all disabled:opacity-20 disabled:pointer-events-none cursor-pointer rounded-sm ${
                exportCardWidth === "wide" && exportLayout !== "center"
                  ? "bg-amber-500 text-black shadow-lg"
                  : "text-zinc-450 hover:text-white hover:bg-white/5"
              }`}
              title="Ancho (580px)"
            >
              Ancho
            </button>
          </div>
        </div>

        {/* Fila 1: Nombres y Texto */}
        <div className="flex flex-col gap-2 font-condensed">
          <label className="text-[10px] font-mono font-black text-zinc-400 tracking-wider uppercase">
            Nombre del Atleta (Remitente / Neón)
          </label>
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

        <div className="flex flex-col gap-2 font-condensed">
          <label className="text-[10px] font-mono font-black text-zinc-400 tracking-wider uppercase">
            Inspiración / Sello Derecho
          </label>
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

        {/* Esmerilado o Blur */}
        <div className="flex flex-col gap-2 font-condensed">
          <label className="text-[10px] font-mono font-black text-zinc-400 tracking-wider uppercase">
            Efecto Cristal Esmerilado
          </label>
          <div className="grid grid-cols-2 gap-1 bg-black/80 p-1 border border-zinc-800 rounded">
            <button
              type="button"
              onClick={() => setExportCardBlur(true)}
              className={`py-2.5 text-[10px] font-mono font-black tracking-widest uppercase transition-all cursor-pointer rounded-sm ${
                exportCardBlur
                  ? "bg-amber-500 text-black shadow-lg"
                  : "text-zinc-450 hover:text-white hover:bg-white/5"
              }`}
            >
              Activo
            </button>
            <button
              type="button"
              onClick={() => setExportCardBlur(false)}
              className={`py-2.5 text-[10px] font-mono font-black tracking-widest uppercase transition-all cursor-pointer rounded-sm ${
                !exportCardBlur
                  ? "bg-amber-500 text-black shadow-lg"
                  : "text-zinc-450 hover:text-white hover:bg-white/5"
              }`}
            >
              Inactivo
            </button>
          </div>
        </div>

        {/* Opacidad Slider */}
        <div className="flex flex-col gap-2 col-span-full md:col-span-1 lg:col-span-1 bg-black/60 p-4 border border-zinc-850 rounded font-condensed">
          <div className="flex justify-between items-center text-[10px] font-mono font-black text-zinc-400 tracking-wider uppercase mb-1">
            <span>Opacidad de Rutina: {exportCardOpacity}%</span>
            {exportCardOpacity === 0 ? (
              <span className="text-[#00f0ff] font-bold animate-pulse">FLOTANTE HUD</span>
            ) : (
              <span className="text-amber-500">{exportCardOpacity}% opaco</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              className="w-full h-2 bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-amber-500"
              value={exportCardOpacity}
              onChange={(e) => setExportCardOpacity(Number(e.target.value))}
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-sm font-mono text-amber-500 min-w-[4ch] text-right font-black">
              {exportCardOpacity}%
            </span>
          </div>
        </div>

        {/* Altura Máxima Slider */}
        <div className="flex flex-col gap-2 col-span-full md:col-span-1 lg:col-span-1 bg-black/60 p-4 border border-zinc-850 rounded font-condensed">
          <div className="flex justify-between items-center text-[10px] font-mono font-black text-zinc-400 tracking-wider uppercase mb-1">
            <span>Uso de Imagen (Altura): {exportCardHeightLimit}%</span>
            <span className="text-amber-500">Máx 50%</span>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="30"
              max="50"
              step="1"
              className="w-full h-2 bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-amber-500"
              value={exportCardHeightLimit}
              onChange={(e) => setExportCardHeightLimit(Number(e.target.value))}
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-sm font-mono text-amber-500 min-w-[4ch] text-right font-black">
              {exportCardHeightLimit}%
            </span>
          </div>
        </div>

        {/* Silueta PNG Sticker Upload Block */}
        <div className="flex flex-col gap-3 col-span-full bg-amber-950/15 border border-amber-500/25 p-5 rounded-lg font-condensed">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-3 mb-1">
            <div className="flex flex-col text-left">
              <span className="font-mono text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                ⭐ EFECTO 3D DE REVISTA: RECORTAR SILUETA DEL ATLETA (.PNG TRANSPARENTE)
              </span>
              <span className="text-[10px] font-mono text-zinc-400 normal-case mt-0.5">
                En iPhone/Android mantén presionado tu cuerpo sobre la foto original para guardarlo como sticker/recorte PNG transparente, súbelo aquí y calibrarás la superposición 3D.
              </span>
            </div>
            <div className="flex gap-2 shrink-0">
              <input
                type="file"
                accept="image/png"
                className="hidden"
                ref={fileInputRef}
                onChange={handleOverlayImageUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-amber-500 hover:bg-amber-400 text-black font-mono font-black text-[10px] px-3.5 py-2.5 uppercase transition-all tracking-widest cursor-pointer rounded shadow-md"
              >
                {exportOverlayImage ? "CAMBIAR SILUETA" : "SUBIR RECORTE PNG"}
              </button>
              {exportOverlayImage && (
                <button
                  type="button"
                  onClick={() => {
                    setExportOverlayImage(null);
                  }}
                  className="bg-red-950 hover:bg-red-900 border border-red-800/40 text-red-400 font-mono font-black text-[10px] px-3.5 py-2.5 uppercase transition-all tracking-widest cursor-pointer rounded"
                >
                  QUITAR
                </button>
              )}
            </div>
          </div>

          {exportOverlayImage ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2 bg-black/60 p-4 border border-zinc-850 rounded">
              {/* Desplazamiento X */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-[9px] text-zinc-400 uppercase tracking-wider">
                  <span>Posición Horizontal (X):</span>
                  <span className="text-amber-500 font-black">{exportOverlayX}%</span>
                </div>
                <input
                  type="range"
                  min="-80"
                  max="80"
                  step="1"
                  className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-amber-500"
                  value={exportOverlayX}
                  onChange={(e) => setExportOverlayX(Number(e.target.value))}
                />
                <div className="flex justify-between text-[8px] font-mono text-zinc-500 font-bold">
                  <span>Izquierda</span>
                  <span>Centro</span>
                  <span>Derecha</span>
                </div>
              </div>

              {/* Desplazamiento Y */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-[9px] text-zinc-400 uppercase tracking-wider">
                  <span>Posición Vertical (Y):</span>
                  <span className="text-amber-500 font-black">{exportOverlayY}px</span>
                </div>
                <input
                  type="range"
                  min="-400"
                  max="600"
                  step="5"
                  className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-amber-500"
                  value={exportOverlayY}
                  onChange={(e) => setExportOverlayY(Number(e.target.value))}
                />
                <div className="flex justify-between text-[8px] font-mono text-zinc-500 font-bold">
                  <span>Abajo</span>
                  <span>Centro</span>
                  <span>Arriba</span>
                </div>
              </div>

              {/* Escala */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-[9px] text-zinc-400 uppercase tracking-wider">
                  <span>Tamaño de Silueta:</span>
                  <span className="text-amber-500 font-black">{exportOverlayScale}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="220"
                  step="5"
                  className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-amber-500"
                  value={exportOverlayScale}
                  onChange={(e) => setExportOverlayScale(Number(e.target.value))}
                />
                <div className="flex justify-between text-[8px] font-mono text-zinc-500 font-bold">
                  <span>Pequeño</span>
                  <span>100%</span>
                  <span>Grande</span>
                </div>
              </div>

              {/* Posición de Capa Z-index */}
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider mb-1">
                  Profundidad de Silueta
                </span>
                <div className="grid grid-cols-2 gap-1 bg-black/60 p-0.5 border border-zinc-800 rounded">
                  <button
                    type="button"
                    onClick={() => setExportOverlayZ("front")}
                    className={`py-1.5 text-[9px] font-mono font-black tracking-tight uppercase transition-all cursor-pointer rounded-sm ${
                      exportOverlayZ === "front"
                        ? "bg-amber-500 text-black shadow-lg"
                        : "text-zinc-450 hover:text-white"
                    }`}
                    title="Muestra la silueta al frente, cubriendo el texto parcialmente para un efecto revista"
                  >
                    Delante (3D)
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportOverlayZ("back")}
                    className={`py-1.5 text-[9px] font-mono font-black tracking-tight uppercase transition-all cursor-pointer rounded-sm ${
                      exportOverlayZ === "back"
                        ? "bg-amber-500 text-black shadow-lg"
                        : "text-zinc-450 hover:text-white"
                    }`}
                    title="Detrás del cuadro de texto"
                  >
                    Detrás
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-[10px] text-amber-500/70 font-mono py-1">
              💡 TIP PROFESIONAL: Al habilitar el recorte PNG de tu cuerpo, podrás simular el efecto revista donde las letras del metcon pasan por detrás tuyo, logrando un poster visual espectacular.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
