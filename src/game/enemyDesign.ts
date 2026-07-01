/**
 * NEXUS: EL ABISMO — procedural enemy renderer.
 *
 * Shadows drawn live from vector primitives, with silhouette variety per kind
 * (minions come in 3 shapes), menacing details (jagged bodies, glowing eyes,
 * tendrils, spikes) and idle/attack animation. Manifestations of the day's
 * weakness — tinted per rift.
 */

export interface EnemyTint {
  body: string;
  edge: string;
  eye: string;
}

export const ENEMY_TINTS: EnemyTint[] = [
  { body: "#16121f", edge: "#a855f7", eye: "#ef4444" },
  { body: "#1f1212", edge: "#ef4444", eye: "#fbbf24" },
  { body: "#0f1a14", edge: "#4ade80", eye: "#f87171" },
  { body: "#101622", edge: "#38bdf8", eye: "#f472b6" },
  { body: "#1c1426", edge: "#c084fc", eye: "#facc15" },
];

export const BOSS_TINT: EnemyTint = { body: "#1c0a0a", edge: "#dc2626", eye: "#fbbf24" };

export interface EnemyPose {
  x: number;
  y: number;
  radius: number;
  t: number; // time seconds for idle wobble
  faceLeft: boolean;
  hitFlash: number; // 0..1
  charging: number; // boss telegraph >0
  variant: number; // silhouette selector
}

function jaggedBlob(
  ctx: CanvasRenderingContext2D,
  r: number,
  spikes: number,
  inner: number,
  wobble: number,
  t: number,
) {
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2;
    const base = i % 2 === 0 ? r : r * inner;
    const rad = base + Math.sin(t * 3 + i) * wobble;
    const x = Math.cos(a) * rad;
    const y = Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/** Minion — 3 silhouette variants: crawler, floater, biter. */
function drawMinion(ctx: CanvasRenderingContext2D, tint: EnemyTint, r: number, t: number, variant: number) {
  ctx.fillStyle = tint.body;
  ctx.strokeStyle = tint.edge;
  ctx.lineWidth = 1.6;

  if (variant % 3 === 0) {
    // crawler: low, many little legs
    jaggedBlob(ctx, r, 5, 0.62, 1.2, t);
    ctx.fill(); ctx.stroke();
    ctx.strokeStyle = tint.edge;
    ctx.lineWidth = 1.2;
    for (let i = -2; i <= 2; i++) {
      const lx = i * r * 0.4;
      const sw = Math.sin(t * 8 + i) * 2;
      ctx.beginPath(); ctx.moveTo(lx, r * 0.5); ctx.lineTo(lx + sw, r * 1.1); ctx.stroke();
    }
  } else if (variant % 3 === 1) {
    // floater: round, drifting tendrils
    ctx.beginPath(); ctx.arc(0, Math.sin(t * 2) * 1.5, r * 0.9, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.lineWidth = 1.3;
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 2 + (i - 1.5) * 0.4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6);
      ctx.quadraticCurveTo(Math.cos(a) * r * 1.1 + Math.sin(t * 5 + i) * 2, r * 1.2, Math.cos(a) * r * 0.9, r * 1.5);
      ctx.stroke();
    }
  } else {
    // biter: vertical maw with teeth
    jaggedBlob(ctx, r, 7, 0.7, 0.8, t);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = tint.eye;
    const gap = 1.5 + Math.abs(Math.sin(t * 6)) * 2.5;
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, -gap); ctx.lineTo(r * 0.5, -gap);
    ctx.lineTo(r * 0.3, gap); ctx.lineTo(-r * 0.3, gap); ctx.closePath(); ctx.fill();
  }

  // eyes
  ctx.fillStyle = tint.eye;
  const eo = r * 0.32;
  ctx.beginPath(); ctx.arc(-eo, -r * 0.15, 2.1, 0, Math.PI * 2);
  ctx.arc(eo, -r * 0.15, 2.1, 0, Math.PI * 2); ctx.fill();
}

/** Brute — bulky, armored shoulders, single cyclops eye. */
function drawBrute(ctx: CanvasRenderingContext2D, tint: EnemyTint, r: number, t: number) {
  const breathe = Math.sin(t * 2) * 1.5;
  ctx.fillStyle = tint.body;
  ctx.strokeStyle = tint.edge;
  ctx.lineWidth = 2;
  // hulking torso
  jaggedBlob(ctx, r, 6, 0.8, 1.0 + breathe * 0.2, t);
  ctx.fill(); ctx.stroke();
  // shoulder spikes
  ctx.fillStyle = tint.edge;
  ctx.beginPath(); ctx.moveTo(-r * 0.9, -r * 0.4); ctx.lineTo(-r * 1.3, -r * 1.1); ctx.lineTo(-r * 0.5, -r * 0.7); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(r * 0.9, -r * 0.4); ctx.lineTo(r * 1.3, -r * 1.1); ctx.lineTo(r * 0.5, -r * 0.7); ctx.closePath(); ctx.fill();
  // big single eye
  ctx.fillStyle = tint.eye;
  ctx.beginPath(); ctx.arc(0, -r * 0.1, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = tint.body;
  ctx.fillRect(-4.5, -r * 0.1 - 1, 9, 2);
}

/** Boss — EL SEDENTARIO: massive, crowned with spikes, four eyes, charge glow. */
function drawBoss(ctx: CanvasRenderingContext2D, tint: EnemyTint, r: number, t: number, charging: number) {
  // aura when charging
  if (charging > 0.9) {
    ctx.fillStyle = "rgba(251,191,36,0.18)";
    ctx.beginPath(); ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = tint.body;
  ctx.strokeStyle = charging > 0.9 ? "#fbbf24" : tint.edge;
  ctx.lineWidth = 3;
  jaggedBlob(ctx, r, 9, 0.74, 2.0, t);
  ctx.fill(); ctx.stroke();

  // crown of spikes
  ctx.fillStyle = tint.edge;
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i - 2) * 0.45;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a - 0.08) * r, Math.sin(a - 0.08) * r);
    ctx.lineTo(Math.cos(a) * r * 1.45, Math.sin(a) * r * 1.45);
    ctx.lineTo(Math.cos(a + 0.08) * r, Math.sin(a + 0.08) * r);
    ctx.closePath(); ctx.fill();
  }

  // four burning eyes
  ctx.fillStyle = charging > 0.9 ? "#fde047" : tint.eye;
  const ey = -r * 0.12;
  [-r * 0.45, -r * 0.16, r * 0.16, r * 0.45].forEach((ex) => {
    ctx.beginPath(); ctx.arc(ex, ey, 3.2, 0, Math.PI * 2); ctx.fill();
  });
  // maw
  ctx.fillStyle = "#000";
  ctx.beginPath(); ctx.ellipse(0, r * 0.35, r * 0.45, r * 0.18, 0, 0, Math.PI * 2); ctx.fill();
}

export function drawEnemy(
  ctx: CanvasRenderingContext2D,
  kind: "minion" | "brute" | "boss",
  tint: EnemyTint,
  pose: EnemyPose,
) {
  // ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath(); ctx.ellipse(pose.x, pose.y + pose.radius, pose.radius, 5, 0, 0, Math.PI * 2); ctx.fill();

  ctx.save();
  ctx.translate(pose.x, pose.y);
  if (pose.faceLeft) ctx.scale(-1, 1);

  if (kind === "boss") drawBoss(ctx, tint, pose.radius, pose.t, pose.charging);
  else if (kind === "brute") drawBrute(ctx, tint, pose.radius, pose.t);
  else drawMinion(ctx, tint, pose.radius, pose.t, pose.variant);

  // hit flash
  if (pose.hitFlash > 0) {
    ctx.globalAlpha = pose.hitFlash * 0.8;
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(0, 0, pose.radius * 1.05, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
