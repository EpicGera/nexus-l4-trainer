// FX de personas para la story: segmentación REAL (MediaPipe, 100% local —
// modelo y wasm servidos desde public/models, nada sale del dispositivo).
//
//  - "silueta": la persona queda como recorte negro sólido con borde blanco
//    sobre la foto en B&N — estética PRVN.
//  - "neon": resplandor aditivo del color de acento siguiendo el contorno real
//    del cuerpo; la persona queda visible.
//
// Carga lazy (dynamic import): el bundle inicial no engorda; el primer uso
// paga la carga del modelo (~250KB) y queda cacheado.

let segmenterPromise: Promise<any> | null = null;

function getSegmenter(): Promise<any> {
  if (!segmenterPromise) {
    segmenterPromise = (async () => {
      const { ImageSegmenter, FilesetResolver } = await import("@mediapipe/tasks-vision");
      const fileset = await FilesetResolver.forVisionTasks("/models/wasm");
      return ImageSegmenter.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: "/models/selfie_segmenter.tflite" },
        outputCategoryMask: true,
        runningMode: "IMAGE",
      });
    })().catch((e) => {
      segmenterPromise = null; // permitir reintento si falló la carga
      throw e;
    });
  }
  return segmenterPromise;
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo leer la imagen"));
    img.src = dataUrl;
  });
}

/** Canvas con la persona en blanco opaco sobre transparente (y % de cobertura). */
function maskToCanvas(mask: any, w: number, h: number): { canvas: HTMLCanvasElement; coverage: number } {
  const data: Uint8Array = mask.getAsUint8Array();
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(w, h);
  let on = 0;
  for (let i = 0; i < data.length; i++) {
    const person = data[i] > 127;
    if (person) on++;
    img.data[i * 4 + 3] = person ? 255 : 0;
    img.data[i * 4] = 255;
    img.data[i * 4 + 1] = 255;
    img.data[i * 4 + 2] = 255;
  }
  // el selfie segmenter marca la categoría de fondo alta en algunas variantes:
  // si "persona" cubre casi todo, la máscara viene invertida
  let coverage = on / data.length;
  if (coverage > 0.9) {
    for (let i = 0; i < data.length; i++) {
      img.data[i * 4 + 3] = data[i] > 127 ? 0 : 255;
    }
    coverage = 1 - coverage;
  }
  ctx.putImageData(img, 0, 0);
  return { canvas, coverage };
}

export async function applyPersonFx(
  dataUrl: string,
  mode: "silueta" | "neon",
  accent = "#DC2626",
): Promise<string> {
  const img = await loadImage(dataUrl);
  // techo de resolución para segmentar rápido en el teléfono
  const scale = Math.min(1, 1280 / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);

  const work = document.createElement("canvas");
  work.width = w;
  work.height = h;
  const ctx = work.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);

  const segmenter = await getSegmenter();
  const result = segmenter.segment(work);
  const { canvas: maskC, coverage } = maskToCanvas(result.categoryMask, w, h);
  result.close?.();
  if (coverage < 0.02) {
    throw new Error("No se detectó ninguna persona en la foto.");
  }

  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const o = out.getContext("2d")!;

  // capa auxiliar: la persona recortada de la foto
  const personLayer = document.createElement("canvas");
  personLayer.width = w;
  personLayer.height = h;
  const p = personLayer.getContext("2d")!;
  p.drawImage(work, 0, 0);
  p.globalCompositeOperation = "destination-in";
  p.drawImage(maskC, 0, 0);

  if (mode === "silueta") {
    // fondo B&N apagado
    o.filter = "grayscale(100%) contrast(110%) brightness(65%)";
    o.drawImage(work, 0, 0);
    o.filter = "none";
    // borde blanco: máscara dilatada por blur detrás de la silueta
    o.save();
    o.shadowColor = "#FFFFFF";
    o.shadowBlur = Math.max(6, w * 0.008);
    o.drawImage(maskC, 0, 0);
    o.restore();
    // persona como recorte negro sólido
    const black = document.createElement("canvas");
    black.width = w;
    black.height = h;
    const b = black.getContext("2d")!;
    b.fillStyle = "#0A0A0A";
    b.fillRect(0, 0, w, h);
    b.globalCompositeOperation = "destination-in";
    b.drawImage(maskC, 0, 0);
    o.drawImage(black, 0, 0);
  } else {
    // fondo oscurecido para que el neón reviente
    o.filter = "brightness(55%) saturate(70%)";
    o.drawImage(work, 0, 0);
    o.filter = "none";
    // halo aditivo del acento alrededor del contorno (varios pases)
    const tinted = document.createElement("canvas");
    tinted.width = w;
    tinted.height = h;
    const t = tinted.getContext("2d")!;
    t.fillStyle = accent;
    t.fillRect(0, 0, w, h);
    t.globalCompositeOperation = "destination-in";
    t.drawImage(maskC, 0, 0);
    o.globalCompositeOperation = "lighter";
    for (const blur of [18, 10, 4]) {
      o.save();
      o.filter = `blur(${Math.max(2, (blur * w) / 1280)}px)`;
      o.drawImage(tinted, 0, 0);
      o.restore();
    }
    o.globalCompositeOperation = "source-over";
    // la persona limpia encima: el glow queda solo en el borde
    o.drawImage(personLayer, 0, 0);
  }

  return out.toDataURL("image/jpeg", 0.92);
}
