/**
 * NEXUS: EL ABISMO — procedural hero renderer.
 *
 * Each of the 10 Ecos is a distinct PARAMETRIC design (build proportions +
 * weapon + headgear + cape + palette), drawn from vector primitives every
 * frame. Because it's drawn live (not pre-baked frames), attacks and casts
 * animate the body and weapon directly: lunge, weapon swing, cast flare.
 *
 * Real diversity comes from combining different builds, weapons and silhouettes
 * — not from recoloring one shape.
 */

export type Build = "slim" | "normal" | "heavy";
export type Weapon =
  | "sword" | "katana" | "daggers" | "hammer" | "spear"
  | "scythe" | "axe" | "staff" | "bow" | "greatsword";
export type Head = "helm" | "hood" | "horns" | "crown" | "bandana" | "mask";

export interface HeroColors {
  skin: string;
  primary: string; // main armor/cloth
  secondary: string; // trim / inner
  metal: string; // weapon + plate
  accent: string; // glow / emblem
  cape?: string;
}

export interface HeroDesign {
  id: string;
  name: string;
  build: Build;
  weapon: Weapon;
  head: Head;
  cape: boolean;
  colors: HeroColors;
}

export interface HeroPose {
  x: number;
  y: number; // feet/ground point in world px
  faceLeft: boolean;
  moving: boolean;
  walkPhase: number; // seconds, accumulates
  attack: number; // 0..1 swing progress (0 = idle)
  cast: number; // 0..1 cast flare progress
  guard: boolean;
  hurt: number; // 0..1 white flash
  t: number; // global time seconds (idle breathing / cape sway)
}

export const HERO_DESIGNS: HeroDesign[] = [
  {
    id: "atleta", name: "ATLETA", build: "normal", weapon: "sword", head: "bandana", cape: false,
    colors: { skin: "#d9a066", primary: "#1f3a8a", secondary: "#0ea5e9", metal: "#cbd5e1", accent: "#22d3ee" },
  },
  {
    id: "ronin", name: "RONIN", build: "slim", weapon: "katana", head: "mask", cape: true,
    colors: { skin: "#d9a066", primary: "#7f1d1d", secondary: "#1c1917", metal: "#e2e8f0", accent: "#ef4444", cape: "#991b1b" },
  },
  {
    id: "espectro", name: "ESPECTRO", build: "slim", weapon: "daggers", head: "hood", cape: true,
    colors: { skin: "#bae6fd", primary: "#0c4a6e", secondary: "#082f49", metal: "#7dd3fc", accent: "#38bdf8", cape: "#0e7490" },
  },
  {
    id: "titan", name: "TITÁN", build: "heavy", weapon: "hammer", head: "horns", cape: false,
    colors: { skin: "#d9a066", primary: "#78350f", secondary: "#92760a", metal: "#fbbf24", accent: "#fde047" },
  },
  {
    id: "valkiria", name: "VALKIRIA", build: "normal", weapon: "spear", head: "helm", cape: true,
    colors: { skin: "#e8c39e", primary: "#cbd5e1", secondary: "#64748b", metal: "#f1f5f9", accent: "#22d3ee", cape: "#0e7490" },
  },
  {
    id: "sombra", name: "SOMBRA", build: "slim", weapon: "scythe", head: "hood", cape: true,
    colors: { skin: "#9ca3af", primary: "#1e1b2e", secondary: "#2e1065", metal: "#a855f7", accent: "#c084fc", cape: "#171522" },
  },
  {
    id: "berserker", name: "BERSERKER", build: "heavy", weapon: "axe", head: "horns", cape: false,
    colors: { skin: "#d9a066", primary: "#7f1d1d", secondary: "#27272a", metal: "#dc2626", accent: "#f97316" },
  },
  {
    id: "monje", name: "MONJE", build: "normal", weapon: "staff", head: "bandana", cape: false,
    colors: { skin: "#d9a066", primary: "#ea580c", secondary: "#9a3412", metal: "#d6d3d1", accent: "#fb923c" },
  },
  {
    id: "cazadora", name: "CAZADORA", build: "slim", weapon: "bow", head: "hood", cape: false,
    colors: { skin: "#e8c39e", primary: "#14532d", secondary: "#3f6212", metal: "#84cc16", accent: "#4ade80" },
  },
  {
    id: "paladin", name: "PALADÍN", build: "heavy", weapon: "greatsword", head: "helm", cape: true,
    colors: { skin: "#d9a066", primary: "#475569", secondary: "#1e293b", metal: "#e2e8f0", accent: "#60a5fa", cape: "#1d4ed8" },
  },
];

interface Proportions {
  shoulderW: number;
  torsoW: number;
  hipW: number;
  torsoH: number;
  legH: number;
  headR: number;
}

const BUILDS: Record<Build, Proportions> = {
  slim: { shoulderW: 16, torsoW: 13, hipW: 12, torsoH: 17, legH: 13, headR: 7.5 },
  normal: { shoulderW: 19, torsoW: 16, hipW: 14, torsoH: 18, legH: 13, headR: 8 },
  heavy: { shoulderW: 25, torsoW: 21, hipW: 17, torsoH: 19, legH: 12, headR: 8.5 },
};

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rad = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
  ctx.fill();
}

/** Draw a weapon along local +X (forward), pivoted at the hand (0,0). */
function drawWeapon(ctx: CanvasRenderingContext2D, w: Weapon, c: HeroColors) {
  ctx.lineCap = "round";
  switch (w) {
    case "sword":
      ctx.strokeStyle = c.metal; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(26, 0); ctx.stroke();
      ctx.strokeStyle = c.secondary; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(-2, -4); ctx.lineTo(-2, 4); ctx.stroke();
      break;
    case "katana":
      ctx.strokeStyle = c.metal; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(18, -3, 30, -9); ctx.stroke();
      ctx.strokeStyle = c.accent; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(-1, -3); ctx.lineTo(-1, 3); ctx.stroke();
      break;
    case "daggers":
      ctx.strokeStyle = c.metal; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(13, -2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(11, 5); ctx.stroke();
      break;
    case "hammer":
      ctx.strokeStyle = c.secondary; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(22, 0); ctx.stroke();
      ctx.fillStyle = c.metal; rr(ctx, 18, -9, 12, 18, 3);
      break;
    case "spear":
      ctx.strokeStyle = c.secondary; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(30, 0); ctx.stroke();
      ctx.fillStyle = c.metal;
      ctx.beginPath(); ctx.moveTo(30, -5); ctx.lineTo(40, 0); ctx.lineTo(30, 5); ctx.closePath(); ctx.fill();
      break;
    case "scythe":
      ctx.strokeStyle = c.secondary; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(28, -2); ctx.stroke();
      ctx.strokeStyle = c.metal; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(28, -12, 13, 0.3, 1.9); ctx.stroke();
      break;
    case "axe":
      ctx.strokeStyle = c.secondary; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(20, 0); ctx.stroke();
      ctx.fillStyle = c.metal;
      ctx.beginPath();
      ctx.moveTo(16, -4); ctx.quadraticCurveTo(34, -14, 30, 2);
      ctx.quadraticCurveTo(34, 14, 16, 6); ctx.closePath(); ctx.fill();
      break;
    case "staff":
      ctx.strokeStyle = c.secondary; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(28, 0); ctx.stroke();
      ctx.fillStyle = c.accent;
      ctx.beginPath(); ctx.arc(30, 0, 5, 0, Math.PI * 2); ctx.fill();
      break;
    case "bow":
      ctx.strokeStyle = c.metal; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(6, 0, 16, -1.2, 1.2); ctx.stroke();
      ctx.strokeStyle = c.accent; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(6 + 16 * Math.cos(-1.2), 16 * Math.sin(-1.2));
      ctx.lineTo(6 + 16 * Math.cos(1.2), 16 * Math.sin(1.2)); ctx.stroke();
      break;
    case "greatsword":
      ctx.strokeStyle = c.metal; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(38, 0); ctx.stroke();
      ctx.strokeStyle = c.secondary; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(-3, -6); ctx.lineTo(-3, 6); ctx.stroke();
      break;
  }
}

function drawHead(ctx: CanvasRenderingContext2D, head: Head, c: HeroColors, r: number) {
  // base head (skin)
  ctx.fillStyle = c.skin;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  // eyes (glowing accent)
  ctx.fillStyle = c.accent;
  ctx.fillRect(r * 0.05, -r * 0.2, r * 0.45, r * 0.22);

  switch (head) {
    case "helm":
      ctx.fillStyle = c.metal;
      rr(ctx, -r, -r - 2, r * 2, r * 1.1, 4);
      ctx.fillStyle = c.secondary; // visor slit
      ctx.fillRect(-r * 0.2, -r * 0.25, r * 1.0, r * 0.18);
      ctx.fillStyle = c.accent; // crest
      ctx.fillRect(-2, -r - 9, 4, 8);
      break;
    case "hood":
      ctx.fillStyle = c.primary;
      ctx.beginPath();
      ctx.moveTo(-r - 2, r * 0.4);
      ctx.quadraticCurveTo(-r - 3, -r - 5, 0, -r - 5);
      ctx.quadraticCurveTo(r + 3, -r - 5, r + 2, r * 0.4);
      ctx.quadraticCurveTo(r * 0.4, -r * 0.2, 0, -r * 0.1);
      ctx.quadraticCurveTo(-r * 0.4, -r * 0.2, -r - 2, r * 0.4);
      ctx.closePath(); ctx.fill();
      break;
    case "horns":
      ctx.fillStyle = c.metal;
      ctx.beginPath(); ctx.moveTo(-r * 0.7, -r * 0.6); ctx.lineTo(-r * 1.6, -r * 1.7); ctx.lineTo(-r * 0.3, -r); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(r * 0.7, -r * 0.6); ctx.lineTo(r * 1.6, -r * 1.7); ctx.lineTo(r * 0.3, -r); ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.primary; rr(ctx, -r, -r - 1, r * 2, r * 0.7, 3); // brow band
      break;
    case "crown":
      ctx.fillStyle = c.metal;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath(); ctx.moveTo(i * r * 0.55 - 2, -r); ctx.lineTo(i * r * 0.55, -r - 7); ctx.lineTo(i * r * 0.55 + 2, -r); ctx.closePath(); ctx.fill();
      }
      ctx.fillRect(-r, -r - 1, r * 2, 3);
      break;
    case "bandana":
      ctx.fillStyle = c.primary; rr(ctx, -r, -r * 0.5, r * 2, r * 0.5, 2);
      ctx.fillStyle = c.accent; ctx.fillRect(-r, -r * 0.4, r * 2, 2);
      break;
    case "mask":
      ctx.fillStyle = c.secondary; rr(ctx, -r, -r * 0.1, r * 2, r * 0.9, 3); // lower face mask
      ctx.fillStyle = c.primary; rr(ctx, -r, -r, r * 2, r * 0.55, 3); // brow
      break;
  }
}

/** Render a hero at its ground point. scale ~1 → ~30px tall. */
export function drawHero(
  ctx: CanvasRenderingContext2D,
  d: HeroDesign,
  pose: HeroPose,
  scale: number,
) {
  const p = BUILDS[d.build];
  const c = d.colors;
  const swing = Math.sin(Math.max(0, pose.attack) * Math.PI); // 0..1..0
  const lunge = swing * 6;
  const bob = pose.moving
    ? Math.abs(Math.sin(pose.walkPhase * Math.PI * 2)) * 1.6
    : Math.sin(pose.t * 2) * 0.7;
  const legSwing = pose.moving ? Math.sin(pose.walkPhase * Math.PI * 2) * 3.2 : 0;
  const castGlow = Math.sin(Math.max(0, pose.cast) * Math.PI);

  ctx.save();
  ctx.translate(pose.x, pose.y);
  ctx.scale(scale * (pose.faceLeft ? -1 : 1), scale);
  ctx.translate(lunge, 0);

  // ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath(); ctx.ellipse(0, 1, p.shoulderW * 0.6, 4, 0, 0, Math.PI * 2); ctx.fill();

  const shoulderY = -(p.legH + p.torsoH) - bob;
  const hipY = -p.legH - bob;

  // cape (behind)
  if (d.cape && c.cape) {
    const sway = Math.sin(pose.t * 2.2) * 2 + (pose.moving ? 2.5 : 0) - lunge * 0.6;
    ctx.fillStyle = c.cape;
    ctx.beginPath();
    ctx.moveTo(-p.shoulderW * 0.4, shoulderY + 2);
    ctx.lineTo(p.shoulderW * 0.4, shoulderY + 2);
    ctx.quadraticCurveTo(p.shoulderW * 0.5 + sway, hipY + 6, sway, -bob + 2);
    ctx.quadraticCurveTo(-p.shoulderW * 0.5 + sway, hipY + 6, -p.shoulderW * 0.4, shoulderY + 2);
    ctx.closePath(); ctx.fill();
  }

  // legs
  ctx.fillStyle = c.secondary;
  rr(ctx, -p.hipW / 2 + legSwing, hipY, p.hipW * 0.42, p.legH + bob, 3);
  rr(ctx, p.hipW * 0.08 - legSwing, hipY, p.hipW * 0.42, p.legH + bob, 3);
  ctx.fillStyle = c.metal; // boots
  rr(ctx, -p.hipW / 2 + legSwing, -3 - bob, p.hipW * 0.42, 4, 2);
  rr(ctx, p.hipW * 0.08 - legSwing, -3 - bob, p.hipW * 0.42, 4, 2);

  // back arm
  ctx.fillStyle = c.secondary;
  rr(ctx, -p.shoulderW * 0.5, shoulderY + 2, 5, p.torsoH * 0.75, 2.5);

  // torso
  ctx.fillStyle = c.primary;
  rr(ctx, -p.torsoW / 2, shoulderY, p.torsoW, p.torsoH, 4);
  // emblem / chest accent
  ctx.fillStyle = c.accent;
  ctx.globalAlpha = 0.85 + castGlow * 0.15;
  ctx.fillRect(-2, shoulderY + p.torsoH * 0.28, 4, p.torsoH * 0.4);
  ctx.globalAlpha = 1;
  // belt
  ctx.fillStyle = c.secondary;
  rr(ctx, -p.torsoW / 2, hipY - 3, p.torsoW, 3, 1);

  // pauldrons for heavy build
  if (d.build === "heavy") {
    ctx.fillStyle = c.metal;
    ctx.beginPath(); ctx.arc(-p.shoulderW / 2 + 2, shoulderY + 3, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(p.shoulderW / 2 - 2, shoulderY + 3, 5, 0, Math.PI * 2); ctx.fill();
  }

  // head
  ctx.save();
  ctx.translate(0, shoulderY - p.headR + 1);
  drawHead(ctx, d.head, c, p.headR);
  ctx.restore();

  // front arm + weapon (animated)
  ctx.save();
  ctx.translate(p.shoulderW * 0.36, shoulderY + 3);
  // idle rests forward-down; attack swings up then chops forward
  const armAngle = 0.55 - swing * 1.7 + (pose.cast > 0 ? -castGlow * 1.1 : 0);
  ctx.rotate(armAngle);
  ctx.fillStyle = c.primary;
  rr(ctx, -2.5, 0, 5, p.torsoH * 0.62, 2.5); // upper arm
  ctx.translate(0, p.torsoH * 0.6);
  ctx.fillStyle = c.skin;
  ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill(); // hand
  // weapon points forward (local +x); rotate so it extends from the hand
  ctx.save();
  ctx.rotate(-armAngle - Math.PI / 2 + 0.2); // re-orient weapon roughly forward
  drawWeapon(ctx, d.weapon, c);
  ctx.restore();
  ctx.restore();

  // attack slash arc
  if (swing > 0.15) {
    ctx.strokeStyle = `rgba(255,255,255,${swing * 0.7})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(p.shoulderW * 0.3, shoulderY + p.torsoH * 0.5, p.torsoH * 0.95, -0.9, 0.9);
    ctx.stroke();
  }

  // guard aura
  if (pose.guard) {
    ctx.strokeStyle = "rgba(96,165,250,0.6)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, shoulderY + p.torsoH / 2, p.shoulderW * 0.75, (p.torsoH + p.legH) * 0.62, 0, 0, Math.PI * 2); ctx.stroke();
  }

  // cast flare
  if (castGlow > 0.05) {
    ctx.globalAlpha = castGlow * 0.7;
    ctx.fillStyle = c.accent;
    ctx.beginPath(); ctx.arc(0, shoulderY + p.torsoH / 2, p.shoulderW * (0.6 + castGlow * 0.5), 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  // hurt flash overlay
  if (pose.hurt > 0) {
    ctx.globalAlpha = pose.hurt * 0.6;
    ctx.fillStyle = "#fff";
    rr(ctx, -p.shoulderW / 2, shoulderY - p.headR * 2, p.shoulderW, p.torsoH + p.legH + p.headR * 2, 4);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

export function getHeroDesign(index: number): HeroDesign {
  return HERO_DESIGNS[((index % HERO_DESIGNS.length) + HERO_DESIGNS.length) % HERO_DESIGNS.length];
}
