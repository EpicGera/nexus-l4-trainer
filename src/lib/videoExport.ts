// Story video export (Fase A). Toma la tarjeta de Story ya renderizada (PNG
// 1080×1920) y produce un video vertical con un efecto de movimiento suave y,
// opcionalmente, un fragmento de audio de un archivo local del atleta.
//
// Dos caminos, con feature-detect:
//  1) PRIMARIO — WebCodecs + mp4-muxer: render OFFLINE frame a frame (sin frames
//     caídos, máxima calidad), H.264 + AAC → .mp4 (lo que Instagram acepta).
//  2) FALLBACK — canvas.captureStream + MediaRecorder → .webm (vp8/opus). Corre
//     en tiempo real; cubre WebViews sin WebCodecs. IG puede rechazar webm →
//     el caller avisa que se comparta por WhatsApp.

import { Muxer, ArrayBufferTarget } from "mp4-muxer";

export type StoryEffect = "kenburns" | "pulse" | "none";

export interface StoryVideoOpts {
  /** tarjeta de Story (1080×1920) como data URL PNG. Con `videoBg`, va con alfa. */
  overlayPng: string;
  effect: StoryEffect;
  /** duración del clip en segundos */
  durationSec: number;
  fps?: number;
  /** audio ya decodificado (música local o audio del clip) + desde qué segundo */
  audio?: { buffer: AudioBuffer; offsetSec: number };
  /** clip de video de fondo (object URL). Si está, `effect` se ignora: el
   * movimiento lo pone el propio clip y el overlay se compone encima sin zoom. */
  videoBg?: { url: string };
  onProgress?: (pct: number) => void;
}

export const STORY_W = 1080;
export const STORY_H = 1920;

/**
 * Transform del efecto en el instante normalizado t01 ∈ [0,1]. Puro y testeable.
 * `scale` ≥ 1 (así siempre cubre el frame); `txN`/`tyN` son fracción del ancho/
 * alto y se acotan a (scale-1)/2 para no destapar bordes.
 */
export function effectTransform(
  effect: StoryEffect,
  t01: number,
): { scale: number; txN: number; tyN: number } {
  const t = Math.max(0, Math.min(1, t01));
  if (effect === "kenburns") {
    const scale = 1 + 0.12 * t; // 1.00 → 1.12
    const margin = (scale - 1) / 2;
    return { scale, txN: -margin * (2 * t - 1), tyN: -margin * t };
  }
  if (effect === "pulse") {
    const scale = 1 + 0.05 * (0.5 - 0.5 * Math.cos(2 * Math.PI * t)); // 1 → 1.05 → 1
    return { scale, txN: 0, tyN: 0 };
  }
  return { scale: 1, txN: 0, tyN: 0 };
}

/** Dibuja el overlay animado en el ctx para el frame t01. */
function drawFrame(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  effect: StoryEffect,
  t01: number,
): void {
  const { scale, txN, tyN } = effectTransform(effect, t01);
  const dw = STORY_W * scale;
  const dh = STORY_H * scale;
  const dx = (STORY_W - dw) / 2 + txN * STORY_W;
  const dy = (STORY_H - dh) / 2 + tyN * STORY_H;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, STORY_W, STORY_H);
  ctx.drawImage(img, dx, dy, dw, dh);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo cargar la imagen del overlay."));
    img.src = src;
  });
}

/**
 * Rectángulo destino para encajar una fuente srcW×srcH dentro de dstW×dstH con
 * `object-fit: cover` (llena el marco, recorta el excedente, centrado). Puro.
 */
export function coverRect(
  srcW: number,
  srcH: number,
  dstW: number,
  dstH: number,
): { dx: number; dy: number; w: number; h: number } {
  if (srcW <= 0 || srcH <= 0) return { dx: 0, dy: 0, w: dstW, h: dstH };
  const scale = Math.max(dstW / srcW, dstH / srcH);
  const w = srcW * scale;
  const h = srcH * scale;
  return { dx: (dstW - w) / 2, dy: (dstH - h) / 2, w, h };
}

function prepareVideo(url: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const el = document.createElement("video");
    el.muted = true;
    el.playsInline = true;
    el.preload = "auto";
    el.src = url;
    el.onloadeddata = () => resolve(el);
    el.onerror = () => reject(new Error("No se pudo cargar el clip de video de fondo."));
  });
}

/** Coloca el clip en `time` (segundos) y espera a que el frame esté listo. */
function seekVideo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    const onSeeked = () => { video.removeEventListener("seeked", onSeeked); resolve(); };
    video.addEventListener("seeked", onSeeked);
    video.currentTime = time;
  });
}

/** Fondo = frame del clip (cover-fit) + overlay PNG encima, sin transform. */
function drawVideoFrame(
  ctx: CanvasRenderingContext2D,
  video: CanvasImageSource,
  vw: number,
  vh: number,
  overlay: CanvasImageSource,
): void {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, STORY_W, STORY_H);
  const r = coverRect(vw, vh, STORY_W, STORY_H);
  ctx.drawImage(video, r.dx, r.dy, r.w, r.h);
  ctx.drawImage(overlay, 0, 0, STORY_W, STORY_H);
}

/** ¿El navegador puede encodear H.264 por WebCodecs? (el camino mp4 primario) */
export async function canEncodeMp4(): Promise<boolean> {
  if (typeof (globalThis as any).VideoEncoder === "undefined") return false;
  try {
    const support = await (globalThis as any).VideoEncoder.isConfigSupported({
      codec: "avc1.4d0028",
      width: STORY_W,
      height: STORY_H,
      bitrate: 9_000_000,
      framerate: 30,
    });
    return !!support?.supported;
  } catch {
    return false;
  }
}

async function canEncodeAac(sampleRate: number, channels: number): Promise<boolean> {
  if (typeof (globalThis as any).AudioEncoder === "undefined") return false;
  try {
    const s = await (globalThis as any).AudioEncoder.isConfigSupported({
      codec: "mp4a.40.2",
      sampleRate,
      numberOfChannels: channels,
      bitrate: 128_000,
    });
    return !!s?.supported;
  } catch {
    return false;
  }
}

// ── Camino primario: WebCodecs offline → mp4 ─────────────────────────────────
async function renderMp4(opts: StoryVideoOpts): Promise<Blob> {
  const fps = opts.fps ?? 30;
  const totalFrames = Math.round(opts.durationSec * fps);
  const img = await loadImage(opts.overlayPng);

  const canvas = document.createElement("canvas");
  canvas.width = STORY_W;
  canvas.height = STORY_H;
  const ctx = canvas.getContext("2d")!;

  // ¿incluimos audio? Solo si AAC está soportado; si no, este camino no aplica
  // (mezclar mp4+opus lo rechaza IG) y el orquestador cae al fallback.
  const audio = opts.audio;
  const sampleRate = audio?.buffer.sampleRate ?? 48000;
  const channels = audio ? Math.min(2, audio.buffer.numberOfChannels) : 0;
  const withAudio = !!audio && (await canEncodeAac(sampleRate, channels));
  if (audio && !withAudio) throw new Error("AAC no soportado");

  const target = new ArrayBufferTarget();
  const muxer = new Muxer({
    target,
    fastStart: "in-memory",
    video: { codec: "avc", width: STORY_W, height: STORY_H },
    ...(withAudio ? { audio: { codec: "aac", sampleRate, numberOfChannels: channels } } : {}),
  });

  const VideoEncoderCtor = (globalThis as any).VideoEncoder;
  const videoEncoder = new VideoEncoderCtor({
    output: (chunk: any, meta: any) => muxer.addVideoChunk(chunk, meta),
    error: (e: any) => { throw e; },
  });
  videoEncoder.configure({
    codec: "avc1.4d0028",
    width: STORY_W,
    height: STORY_H,
    bitrate: 9_000_000,
    framerate: fps,
  });

  // Clip de fondo (opcional): seek exacto por frame, loopeando si es más corto.
  const bgVideo = opts.videoBg ? await prepareVideo(opts.videoBg.url) : null;
  const clipDur = bgVideo?.duration || 0;

  const VideoFrameCtor = (globalThis as any).VideoFrame;
  for (let i = 0; i < totalFrames; i++) {
    if (bgVideo) {
      await seekVideo(bgVideo, clipDur > 0 ? (i / fps) % clipDur : 0);
      drawVideoFrame(ctx, bgVideo, bgVideo.videoWidth, bgVideo.videoHeight, img);
    } else {
      drawFrame(ctx, img, opts.effect, totalFrames <= 1 ? 0 : i / (totalFrames - 1));
    }
    const frame = new VideoFrameCtor(canvas, {
      timestamp: Math.round((i * 1_000_000) / fps),
      duration: Math.round(1_000_000 / fps),
    });
    videoEncoder.encode(frame, { keyFrame: i % fps === 0 });
    frame.close();
    // backpressure: no encolar sin límite
    if (videoEncoder.encodeQueueSize > fps) {
      await new Promise((r) => setTimeout(r, 0));
    }
    opts.onProgress?.(Math.round((i / totalFrames) * (withAudio ? 80 : 95)));
  }
  await videoEncoder.flush();

  if (withAudio && audio) {
    await encodeAudioTrack(muxer, audio, opts.durationSec, sampleRate, channels, opts.onProgress);
  }

  muxer.finalize();
  opts.onProgress?.(100);
  return new Blob([target.buffer], { type: "video/mp4" });
}

async function encodeAudioTrack(
  muxer: any,
  audio: { buffer: AudioBuffer; offsetSec: number },
  durationSec: number,
  sampleRate: number,
  channels: number,
  onProgress?: (pct: number) => void,
): Promise<void> {
  const AudioEncoderCtor = (globalThis as any).AudioEncoder;
  const AudioDataCtor = (globalThis as any).AudioData;
  const encoder = new AudioEncoderCtor({
    output: (chunk: any, meta: any) => muxer.addAudioChunk(chunk, meta),
    error: (e: any) => { throw e; },
  });
  encoder.configure({ codec: "mp4a.40.2", sampleRate, numberOfChannels: channels, bitrate: 128_000 });

  const buf = audio.buffer;
  const startSample = Math.floor(audio.offsetSec * buf.sampleRate);
  const totalSamples = Math.floor(durationSec * buf.sampleRate);
  const chunkSize = 4096;

  // Interleave f32 [ch0,ch1,ch0,ch1,...] recortando desde offset; loop si el
  // fragmento es más corto que el clip.
  for (let pos = 0; pos < totalSamples; pos += chunkSize) {
    const frames = Math.min(chunkSize, totalSamples - pos);
    const data = new Float32Array(frames * channels);
    for (let f = 0; f < frames; f++) {
      const srcIdx = (startSample + pos + f) % buf.length;
      for (let c = 0; c < channels; c++) {
        data[f * channels + c] = buf.getChannelData(c)[srcIdx] ?? 0;
      }
    }
    const audioData = new AudioDataCtor({
      format: "f32",
      sampleRate,
      numberOfFrames: frames,
      numberOfChannels: channels,
      timestamp: Math.round((pos / buf.sampleRate) * 1_000_000),
      data,
    });
    encoder.encode(audioData);
    audioData.close();
    onProgress?.(80 + Math.round((pos / totalSamples) * 18));
  }
  await encoder.flush();
}

// ── Fallback: captureStream + MediaRecorder → webm (tiempo real) ─────────────
async function renderWebm(opts: StoryVideoOpts): Promise<Blob> {
  const fps = opts.fps ?? 30;
  const img = await loadImage(opts.overlayPng);
  const canvas = document.createElement("canvas");
  canvas.width = STORY_W;
  canvas.height = STORY_H;
  const ctx = canvas.getContext("2d")!;

  // Clip de fondo (opcional): en tiempo real lo dejamos reproducir en loop y
  // dibujamos su frame vigente en cada rAF (sin seeks).
  const bgVideo = opts.videoBg ? await prepareVideo(opts.videoBg.url) : null;
  if (bgVideo) {
    bgVideo.loop = true;
    try { await bgVideo.play(); } catch { /* autoplay muted debería andar */ }
  }

  const stream = (canvas as any).captureStream(fps) as MediaStream;

  // Mezcla el audio local en un track del stream, si hay.
  let audioCtx: AudioContext | null = null;
  let source: AudioBufferSourceNode | null = null;
  if (opts.audio) {
    audioCtx = new AudioContext();
    const dest = audioCtx.createMediaStreamDestination();
    source = audioCtx.createBufferSource();
    source.buffer = opts.audio.buffer;
    source.loop = true;
    source.connect(dest);
    dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
  }

  const mime = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"]
    .find((m) => (window as any).MediaRecorder?.isTypeSupported?.(m)) || "video/webm";
  const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 9_000_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };

  const done = new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
  });

  recorder.start();
  if (source && audioCtx) source.start(0, opts.audio!.offsetSec);

  const t0 = performance.now();
  const totalMs = opts.durationSec * 1000;
  await new Promise<void>((resolve) => {
    const tick = () => {
      const elapsed = performance.now() - t0;
      const t01 = Math.min(1, elapsed / totalMs);
      if (bgVideo) drawVideoFrame(ctx, bgVideo, bgVideo.videoWidth, bgVideo.videoHeight, img);
      else drawFrame(ctx, img, opts.effect, t01);
      opts.onProgress?.(Math.round(t01 * 95));
      if (elapsed >= totalMs) resolve();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  recorder.stop();
  source?.stop();
  bgVideo?.pause();
  await audioCtx?.close();
  const blob = await done;
  opts.onProgress?.(100);
  return blob;
}

/**
 * Renderiza el video de la Story. Intenta mp4 (WebCodecs); si no está soportado
 * —o si el audio no puede ir en AAC— cae a webm (MediaRecorder).
 */
export async function renderStoryVideo(
  opts: StoryVideoOpts,
): Promise<{ blob: Blob; ext: "mp4" | "webm" }> {
  if (await canEncodeMp4()) {
    try {
      return { blob: await renderMp4(opts), ext: "mp4" };
    } catch (err: any) {
      // AAC no soportado u otro fallo del camino WebCodecs → fallback completo.
      if (!/AAC/i.test(err?.message ?? "")) console.warn("mp4 export falló, uso webm:", err);
    }
  }
  return { blob: await renderWebm(opts), ext: "webm" };
}
