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
import { detectBeats } from "./beatDetect";

export type StoryEffect = "kenburns" | "pulse" | "none";

/** Efectos opcionales, combinables, dibujados por frame sobre el canvas. */
export interface StoryFx {
  /** destello blanco en cada beat de la música (requiere audio) */
  beatFlash?: boolean;
  /** sacudida de cámara en cada beat (requiere audio) */
  beatShake?: boolean;
  /** partículas de polvo de hielo / stardust con glow */
  stardust?: boolean;
  /** aberración cromática + scanlines estilo cámara 70s */
  retro70s?: boolean;
}

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
  /** efectos visuales opcionales (destellos, shake, stardust, glitch 70s) */
  fx?: StoryFx;
  onProgress?: (pct: number) => void;
}

// ── Efectos por frame ────────────────────────────────────────────────────────
const FLASH_DUR = 0.15; // s que dura el destello tras un beat
const SHAKE_PX = 12; // amplitud máxima del shake
const STARDUST_N = 80; // partículas de polvo de hielo
const frac = (x: number) => x - Math.floor(x);
const hash = (n: number) => frac(Math.sin(n) * 43758.5453);

/** Alpha del destello en tSec dado los tiempos de beat. Puro y testeable. */
export function flashAlpha(tSec: number, beats: number[]): number {
  let a = 0;
  for (const b of beats) {
    const dt = tSec - b;
    if (dt >= 0 && dt <= FLASH_DUR) a = Math.max(a, 0.6 * (1 - dt / FLASH_DUR));
  }
  return a;
}

/** Desplazamiento del shake en tSec (determinista por beat). Puro y testeable. */
export function shakeOffset(tSec: number, beats: number[]): { dx: number; dy: number } {
  for (let i = 0; i < beats.length; i++) {
    const dt = tSec - beats[i];
    if (dt >= 0 && dt <= FLASH_DUR) {
      const decay = 1 - dt / FLASH_DUR;
      const ang = hash(i * 12.9898) * Math.PI * 2;
      return { dx: Math.cos(ang) * SHAKE_PX * decay, dy: Math.sin(ang) * SHAKE_PX * decay };
    }
  }
  return { dx: 0, dy: 0 };
}

/** Campo de partículas de polvo de hielo (función pura de t → sin estado). */
function drawStardust(ctx: CanvasRenderingContext2D, tSec: number): void {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < STARDUST_N; i++) {
    const rx = hash(i * 127.1);
    const ry = hash(i * 311.7);
    const rs = hash(i * 74.7);
    const x = rx * STORY_W;
    const drift = 20 + rs * 60; // px/s hacia arriba
    let y = (ry * STORY_H - drift * tSec) % STORY_H;
    if (y < 0) y += STORY_H;
    const twinkle = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(tSec * (1 + rs * 3) * Math.PI * 2 + i));
    ctx.globalAlpha = twinkle;
    ctx.fillStyle = i % 3 === 0 ? "#BFEFFF" : "#FFFFFF";
    ctx.shadowColor = "#BFEFFF";
    ctx.shadowBlur = 6 + rs * 8;
    ctx.beginPath();
    ctx.arc(x, y, 1.2 + rs * 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Glitch de color 70s: aberración cromática + scanlines + jitter ocasional.
 * Sin getImageData (inviable a 1080×1920×30fps) — todo drawImage/composite. */
function drawRetro70s(ctx: CanvasRenderingContext2D, scratch: HTMLCanvasElement, tSec: number): void {
  const sctx = scratch.getContext("2d")!;
  sctx.clearRect(0, 0, STORY_W, STORY_H);
  sctx.drawImage(ctx.canvas, 0, 0); // snapshot del frame actual
  const off = 4 + 2 * Math.sin(tSec * 3); // aberración que "respira"
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.5;
  ctx.filter = "brightness(1.1) sepia(1) saturate(6) hue-rotate(-30deg)"; // fantasma rojo
  ctx.drawImage(scratch, -off, 0);
  ctx.filter = "brightness(1.1) sepia(1) saturate(6) hue-rotate(140deg)"; // fantasma cian
  ctx.drawImage(scratch, off, 0);
  ctx.restore();
  // scanlines
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = "#000";
  for (let y = 0; y < STORY_H; y += 4) ctx.fillRect(0, y, STORY_W, 2);
  ctx.restore();
  // jitter horizontal ocasional (banda desplazada), determinista por frame
  const frame = Math.floor(tSec * 30);
  if (frame % 40 === 0) {
    const bandY = hash(frame) * (STORY_H - 120);
    ctx.drawImage(scratch, 0, bandY, STORY_W, 60, 30, bandY, STORY_W, 60);
  }
}

/** Aplica los overlays de efecto sobre el frame ya dibujado (bg + overlay). */
function applyFx(
  ctx: CanvasRenderingContext2D,
  tSec: number,
  fx: StoryFx,
  beats: number[],
  scratch: HTMLCanvasElement | null,
): void {
  if (fx.retro70s && scratch) drawRetro70s(ctx, scratch, tSec);
  if (fx.stardust) drawStardust(ctx, tSec);
  if (fx.beatFlash) {
    const a = flashAlpha(tSec, beats);
    if (a > 0) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = a;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, STORY_W, STORY_H);
      ctx.restore();
    }
  }
}

/** ¿Hay que correr detección de beats para estos efectos? */
function fxNeedsBeats(fx?: StoryFx): boolean {
  return !!fx && (!!fx.beatFlash || !!fx.beatShake);
}

/** Canvas 1080×1920 (scratch para el glitch 70s). */
function makeStoryCanvas(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = STORY_W;
  c.height = STORY_H;
  return c;
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

  // Efectos: beats (una vez, offline) + canvas scratch para el glitch 70s.
  const beats = fxNeedsBeats(opts.fx) && audio ? detectBeats(audio.buffer, audio.offsetSec, opts.durationSec) : [];
  const scratch = opts.fx?.retro70s ? makeStoryCanvas() : null;

  const VideoFrameCtor = (globalThis as any).VideoFrame;
  for (let i = 0; i < totalFrames; i++) {
    const tSec = i / fps;
    const shake = opts.fx?.beatShake ? shakeOffset(tSec, beats) : { dx: 0, dy: 0 };
    if (shake.dx || shake.dy) { ctx.fillStyle = "#000"; ctx.fillRect(0, 0, STORY_W, STORY_H); }
    ctx.save();
    if (shake.dx || shake.dy) ctx.translate(shake.dx, shake.dy);
    if (bgVideo) {
      await seekVideo(bgVideo, clipDur > 0 ? (i / fps) % clipDur : 0);
      drawVideoFrame(ctx, bgVideo, bgVideo.videoWidth, bgVideo.videoHeight, img);
    } else {
      drawFrame(ctx, img, opts.effect, totalFrames <= 1 ? 0 : i / (totalFrames - 1));
    }
    ctx.restore();
    if (opts.fx) applyFx(ctx, tSec, opts.fx, beats, scratch);
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

  // Mismos efectos que el camino mp4 (todo es función pura de tSec).
  const beats = fxNeedsBeats(opts.fx) && opts.audio ? detectBeats(opts.audio.buffer, opts.audio.offsetSec, opts.durationSec) : [];
  const scratch = opts.fx?.retro70s ? makeStoryCanvas() : null;

  recorder.start();
  if (source && audioCtx) source.start(0, opts.audio!.offsetSec);

  const t0 = performance.now();
  const totalMs = opts.durationSec * 1000;
  await new Promise<void>((resolve) => {
    const tick = () => {
      const elapsed = performance.now() - t0;
      const t01 = Math.min(1, elapsed / totalMs);
      const tSec = elapsed / 1000;
      const shake = opts.fx?.beatShake ? shakeOffset(tSec, beats) : { dx: 0, dy: 0 };
      if (shake.dx || shake.dy) { ctx.fillStyle = "#000"; ctx.fillRect(0, 0, STORY_W, STORY_H); }
      ctx.save();
      if (shake.dx || shake.dy) ctx.translate(shake.dx, shake.dy);
      if (bgVideo) drawVideoFrame(ctx, bgVideo, bgVideo.videoWidth, bgVideo.videoHeight, img);
      else drawFrame(ctx, img, opts.effect, t01);
      ctx.restore();
      if (opts.fx) applyFx(ctx, tSec, opts.fx, beats, scratch);
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
