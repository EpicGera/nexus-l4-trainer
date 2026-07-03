/**
 * NEXUS: EL ABISMO — dungeon-crawler engine (canvas 2D).
 *
 * Tile-based procedural dungeon in the heavy occult SMT/Persona mood:
 * you descend floor by floor through walled rooms and corridors, fog of war
 * peeling back as you explore, sealing the rift at the bottom — or, on a boss
 * day, fighting EL SEDENTARIO in the final arena.
 *
 * Framework-agnostic: receives a GameCharacter + RunContext + canvas, exposes
 * input setters (keyboard internal, touch fed from React), reports HUD + result
 * through callbacks. Sprites are procedural pixel-art (see sprites.ts).
 */

import { GameCharacter } from "./characterBuilder";
import { UnlockedSkill } from "./skills";
import { RNG, RunContext } from "./runContext";
import {
  DungeonFloor,
  generateFloor,
  TILE,
  Tile,
  circleHitsWall,
  tileAt,
  roomCenterWorld,
  Room,
} from "./dungeon";
import { getHeroDesign, HeroDesign } from "./heroDesign";
import { ENEMY_TINTS, BOSS_TINT, EnemyTint } from "./enemyDesign";
import { ZoneTheme, zoneForDepth } from "./zones";
import { AbyssRenderer3D } from "./render3d";
import {
  LESION_DEBUFF_SEC,
  LESION_SLOW_FACTOR,
  plateauShieldAfterHit,
  plateauShieldRegen,
  spawnPlanForDepth,
} from "./mechanics";

// enemigos nuevos de Fase 2: reutilizan las siluetas existentes con tinte fijo
const LESION_TINT: EnemyTint = { body: "#101a10", edge: "#84cc16", eye: "#bef264" };
const PLATEAU_TINT: EnemyTint = { body: "#0e141c", edge: "#94a3b8", eye: "#67e8f9" };

export interface HudState {
  hp: number;
  maxHp: number;
  will: number;
  maxWill: number;
  depth: number;
  totalFloors: number;
  kills: number;
  enemiesLeft: number;
  skillReadiness: number[];
  healUsed: boolean;
  objective: string;
  onExit: boolean;
  zoneName: string;
  /** segundos restantes del debuff de LA LESIÓN (0 = sano) */
  lesionSec: number;
}

export interface GameResult {
  victory: boolean;
  depth: number;
  kills: number;
  timeMs: number;
  bossDefeated: boolean;
}

export interface EngineOptions {
  character: GameCharacter;
  heroVariantIndex: number;
  run: RunContext;
  runNonce: number;
  /** Acto inicial (1-based) — permite reintentar desde el acto alcanzado. */
  startDepth?: number;
  /** canvas 2D superpuesto para textos (números de daño, barras, banner) */
  overlayCanvas: HTMLCanvasElement;
  onEnd: (r: GameResult) => void;
  onHud: (h: HudState) => void;
}

interface Enemy {
  kind: "minion" | "brute" | "boss" | "lesion" | "plateau";
  name: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  radius: number;
  speed: number;
  damage: number;
  attackCd: number;
  hitFlash: number;
  active: boolean;
  faceLeft: boolean;
  tintIndex: number;
  variant: number;
  charging: number;
  chargeDx: number;
  chargeDy: number;
  shield: number;
  maxShield: number;
  sinceCrit: number;
}

interface Projectile {
  x: number; y: number; vx: number; vy: number; damage: number; life: number;
}
interface Particle {
  x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; color: string;
}
interface DamageNumber {
  x: number; y: number; value: number; crit: boolean; life: number;
}

const PLAYER_RADIUS = 15;
const SIGHT_TILES = 7;

export class AbyssEngine {
  private canvas: HTMLCanvasElement;
  private r3d: AbyssRenderer3D;
  private opt: EngineOptions;
  private rng: RNG;

  private running = false;
  private rafId = 0;
  private lastTs = 0;
  private startedAt = 0;
  private ended = false;

  // dungeon
  private floor!: DungeonFloor;
  private zone!: ZoneTheme;
  private depth = 0;
  private transition = 0; // >0 while fading between floors
  private transitionTotal = 0.85;
  private pendingDescend = false;

  // player
  private px = 0;
  private py = 0;
  private hp: number;
  private will: number;
  private facingX = 1;
  private facingY = 0;
  private faceLeft = false;
  private attackCd = 0;
  private iframes = 0;
  private dashTime = 0;
  private speedBuff = 0;
  private guardBuff = 0;
  private healUsed = false;
  private lesionSec = 0; // debuff de LA LESIÓN — movilidad reducida
  private skillCds: number[];
  private walkPhase = 0;
  private moving = false;
  private attackAnim = 0; // seconds remaining on the attack swing
  private castAnim = 0; // seconds remaining on the cast flare

  // input
  private keys = new Set<string>();
  private touchMoveX = 0;
  private touchMoveY = 0;
  private wantAttack = false;
  private wantSkill: number | null = null;

  // world entities
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private particles: Particle[] = [];
  private dmgNumbers: DamageNumber[] = [];
  private kills = 0;
  private shake = 0;
  private bossAlive = false;

  private heroDesign: HeroDesign;
  private auraColor: string | null = null;
  private trailColor: string | null = null;

  private keydownHandler = (e: KeyboardEvent) => {
    this.keys.add(e.key.toLowerCase());
    if (["1", "2", "3", "4"].includes(e.key)) this.wantSkill = parseInt(e.key, 10) - 1;
    if (e.key === " " || e.key.toLowerCase() === "j") this.wantAttack = true;
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(e.key.toLowerCase())) {
      e.preventDefault();
    }
  };
  private keyupHandler = (e: KeyboardEvent) => this.keys.delete(e.key.toLowerCase());
  private mouseHandler = () => { this.wantAttack = true; };

  constructor(canvas: HTMLCanvasElement, opt: EngineOptions) {
    this.canvas = canvas;
    this.opt = opt;
    this.r3d = new AbyssRenderer3D(canvas, opt.overlayCanvas);
    this.rng = new RNG(opt.run.seed ^ (opt.runNonce * 0x85ebca6b));
    this.hp = opt.character.vitality;
    this.will = opt.character.stamina;
    this.skillCds = opt.character.loadout.map(() => 0);

    this.heroDesign = getHeroDesign(opt.heroVariantIndex);
    this.auraColor = opt.character.cosmetics.find((c) => c.kind === "aura")?.color ?? null;
    this.trailColor = opt.character.cosmetics.find((c) => c.kind === "trail")?.color ?? null;
    this.r3d.setHeroColors(this.heroDesign.colors.primary, this.heroDesign.colors.accent);
    this.r3d.setAura(this.auraColor);

    const startDepth = Math.max(1, Math.min(opt.run.totalFloors, opt.startDepth ?? 1));
    this.loadFloor(startDepth);
    // entry banner: the act announces itself before control kicks in
    this.transition = 1.1;
    this.transitionTotal = 1.1;
  }

  // ── floor lifecycle ──────────────────────────────────────────────────────
  private loadFloor(depth: number) {
    this.depth = depth;
    this.zone = zoneForDepth(depth, this.opt.run.totalFloors);
    const isBoss = this.opt.run.isBossDay && depth >= this.opt.run.totalFloors;
    const floorSeed = this.opt.run.seed ^ (this.opt.runNonce * 2654435761) ^ (depth * 40503);
    this.floor = generateFloor(floorSeed, depth, isBoss);
    this.r3d.buildFloor(this.floor, this.zone);

    const sc = roomCenterWorld(this.floor.start);
    this.px = sc.x;
    this.py = sc.y;

    this.enemies = [];
    this.projectiles = [];
    this.bossAlive = false;
    this.lesionSec = 0; // el debuff se limpia al cambiar de acto
    this.spawnFloorEnemies();
  }

  private spawnFloorEnemies() {
    const { run } = this.opt;
    const depthScale = 1 + (this.depth - 1) * 0.25 + (this.opt.character.level - 1) * 0.04;
    const plan = spawnPlanForDepth(this.depth, run.totalFloors);

    this.floor.rooms.forEach((room) => {
      if (room.kind === "start") return;

      if (this.floor.isBoss && room.kind === "exit") {
        // boss arena
        const c = roomCenterWorld(room);
        this.enemies.push(this.makeEnemy("boss", c.x, c.y, depthScale, run.dayName));
        this.bossAlive = true;
        for (let i = 0; i < 3; i++) {
          const p = this.scatterInRoom(room);
          this.enemies.push(this.makeEnemy("minion", p.x, p.y, depthScale, run.dayName));
        }
        return;
      }

      const minions = this.rng.int(2, 4);
      for (let i = 0; i < minions; i++) {
        const p = this.scatterInRoom(room);
        this.enemies.push(this.makeEnemy("minion", p.x, p.y, depthScale, run.dayName));
      }
      if (this.depth >= 2 && this.rng.chance(0.55)) {
        const p = this.scatterInRoom(room);
        this.enemies.push(this.makeEnemy("brute", p.x, p.y, depthScale, run.dayName));
      }
      if (this.rng.chance(plan.lesionChancePerRoom)) {
        const p = this.scatterInRoom(room);
        this.enemies.push(this.makeEnemy("lesion", p.x, p.y, depthScale, run.dayName));
      }
    });

    // EL PLATEAU custodia el último acto (mini-jefe, fuera de la arena del boss)
    if (plan.plateauOnFloor) {
      const room = this.floor.rooms.find((r) => r.kind === "combat");
      if (room) {
        const p = this.scatterInRoom(room);
        this.enemies.push(this.makeEnemy("plateau", p.x, p.y, depthScale, run.dayName));
      }
    }
  }

  private scatterInRoom(room: Room): { x: number; y: number } {
    const tx = room.x + this.rng.int(0, room.w - 1);
    const ty = room.y + this.rng.int(0, room.h - 1);
    return { x: (tx + 0.5) * TILE, y: (ty + 0.5) * TILE };
  }

  private makeEnemy(
    kind: Enemy["kind"], x: number, y: number, scale: number, dayName: string,
  ): Enemy {
    const tintIndex = this.rng.int(0, ENEMY_TINTS.length - 1);
    const variant = this.rng.int(0, 2);
    const zero = { attackCd: 0, hitFlash: 0, active: false, faceLeft: false,
      charging: 0, chargeDx: 0, chargeDy: 0, shield: 0, maxShield: 0, sinceCrit: 0 };
    if (kind === "boss") {
      return {
        kind, name: "EL SEDENTARIO", x, y,
        hp: 900 * scale, maxHp: 900 * scale, radius: 38,
        speed: 78, damage: 24, tintIndex: 0, variant: 0, ...zero,
      };
    }
    if (kind === "plateau") {
      const shield = Math.round(110 * scale);
      return {
        kind, name: "EL PLATEAU", x, y,
        hp: 170 * scale, maxHp: 170 * scale, radius: 26,
        speed: 46, damage: 18, tintIndex: 0, variant: 0,
        ...zero, shield, maxShield: shield,
      };
    }
    if (kind === "lesion") {
      return {
        kind, name: "LA LESIÓN", x, y,
        hp: 40 * scale, maxHp: 40 * scale, radius: 15,
        speed: 92, damage: 6, tintIndex: 0, variant: 1, ...zero,
      };
    }
    if (kind === "brute") {
      return {
        kind, name: `BRUTO · ${dayName}`, x, y,
        hp: 80 * scale, maxHp: 80 * scale, radius: 22,
        speed: 62, damage: 15, tintIndex, variant, ...zero,
      };
    }
    return {
      kind, name: dayName, x, y,
      hp: 24 * scale, maxHp: 24 * scale, radius: 13,
      speed: 118 + this.rng.int(0, 30), damage: 7, tintIndex, variant, ...zero,
    };
  }

  // ── lifecycle ──────────────────────────────────────────────────────────
  start() {
    if (this.running) return;
    this.running = true;
    this.startedAt = performance.now();
    this.lastTs = this.startedAt;
    window.addEventListener("keydown", this.keydownHandler);
    window.addEventListener("keyup", this.keyupHandler);
    this.canvas.addEventListener("mousedown", this.mouseHandler);
    const loop = (ts: number) => {
      if (!this.running) return;
      const dt = Math.min(0.05, (ts - this.lastTs) / 1000);
      this.lastTs = ts;
      this.update(dt);
      this.render();
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  destroy() {
    this.running = false;
    cancelAnimationFrame(this.rafId);
    window.removeEventListener("keydown", this.keydownHandler);
    window.removeEventListener("keyup", this.keyupHandler);
    this.canvas.removeEventListener("mousedown", this.mouseHandler);
    this.r3d.dispose();
  }

  /** El overlay React es dueño del tamaño; el renderer ajusta cámara y buffers. */
  resize(w: number, h: number) {
    this.r3d.resize(w, h);
  }

  setMoveVector(x: number, y: number) { this.touchMoveX = x; this.touchMoveY = y; }
  pressAttack() { this.wantAttack = true; }
  pressSkill(index: number) { this.wantSkill = index; }

  // ── update ───────────────────────────────────────────────────────────────
  private update(dt: number) {
    if (this.ended) return;

    if (this.transition > 0) {
      this.transition -= dt;
      if (this.transition <= 0 && this.pendingDescend) {
        this.pendingDescend = false;
        this.loadFloor(this.depth + 1);
        // curación parcial entre actos (Persona-style breather)
        this.hp = Math.min(
          this.opt.character.vitality,
          this.hp + Math.round(this.opt.character.vitality * 0.25),
        );
      }
      this.pushHud();
      return;
    }

    // movement
    let mx = this.touchMoveX;
    let my = this.touchMoveY;
    if (this.keys.has("w") || this.keys.has("arrowup")) my -= 1;
    if (this.keys.has("s") || this.keys.has("arrowdown")) my += 1;
    if (this.keys.has("a") || this.keys.has("arrowleft")) mx -= 1;
    if (this.keys.has("d") || this.keys.has("arrowright")) mx += 1;
    const mlen = Math.hypot(mx, my);
    this.moving = mlen > 0.15 && this.dashTime <= 0;
    if (this.moving) {
      mx /= Math.max(1, mlen);
      my /= Math.max(1, mlen);
      this.facingX = mx;
      this.facingY = my;
      if (Math.abs(mx) > 0.1) this.faceLeft = mx < 0;
      const speed = this.opt.character.moveSpeed
        * (this.speedBuff > 0 ? 1.6 : 1)
        * (this.lesionSec > 0 ? LESION_SLOW_FACTOR : 1);
      this.moveBody(mx * speed * dt, my * speed * dt);
    }

    if (this.dashTime > 0) {
      this.dashTime -= dt;
      this.moveBody(this.facingX * 1300 * dt, this.facingY * 1300 * dt);
      this.spawnParticles(this.px, this.py, 2, "#7dd3fc");
    }

    // walk animation phase
    if (this.moving || this.dashTime > 0) this.walkPhase += dt * 2.2;

    // ESTELA (cosmético por PR real) — partículas al caminar, cero gameplay
    if (this.trailColor && this.moving && this.rng.chance(0.4)) {
      this.spawnParticles(this.px, this.py + PLAYER_RADIUS * 0.6, 1, this.trailColor);
    }

    // timers
    this.attackCd = Math.max(0, this.attackCd - dt);
    this.attackAnim = Math.max(0, this.attackAnim - dt);
    this.castAnim = Math.max(0, this.castAnim - dt);
    this.iframes = Math.max(0, this.iframes - dt);
    this.lesionSec = Math.max(0, this.lesionSec - dt);
    this.speedBuff = Math.max(0, this.speedBuff - dt);
    this.guardBuff = Math.max(0, this.guardBuff - dt);
    this.shake = Math.max(0, this.shake - dt * 30);
    this.skillCds = this.skillCds.map((cd) => Math.max(0, cd - dt * 1000));
    this.will = Math.min(this.opt.character.stamina, this.will + this.opt.character.staminaRegen * dt);

    if (this.wantAttack) {
      this.wantAttack = false;
      if (this.attackCd <= 0) {
        this.attackCd = 0.36;
        this.attackAnim = 0.3;
        // strike toward the nearest enemy if idle, so the swing reads on touch
        if (!this.moving) this.faceNearestEnemy();
        this.meleeArc(96, 2.4, this.opt.character.power);
      }
    }
    if (this.wantSkill !== null) {
      const idx = this.wantSkill;
      this.wantSkill = null;
      this.castSkill(idx);
    }

    this.updateEnemies(dt);
    this.updateProjectiles(dt);
    this.enemies = this.enemies.filter((e) => e.hp > 0);

    this.particles = this.particles.filter((p) => {
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; return p.life > 0;
    });
    this.dmgNumbers = this.dmgNumbers.filter((d) => {
      d.y -= 48 * dt; d.life -= dt; return d.life > 0;
    });

    // exit interaction
    this.checkExit();

    this.pushHud();
  }

  private moveBody(dx: number, dy: number) {
    if (!circleHitsWall(this.floor, this.px + dx, this.py, PLAYER_RADIUS)) this.px += dx;
    if (!circleHitsWall(this.floor, this.px, this.py + dy, PLAYER_RADIUS)) this.py += dy;
  }

  /** Aim the hero at the closest active enemy (so a tap-attack reads clearly). */
  private faceNearestEnemy() {
    let best: Enemy | null = null;
    let bd = 320;
    this.enemies.forEach((e) => {
      const d = Math.hypot(e.x - this.px, e.y - this.py);
      if (d < bd) { bd = d; best = e; }
    });
    if (best) {
      const dx = (best as Enemy).x - this.px;
      const dy = (best as Enemy).y - this.py;
      const len = Math.hypot(dx, dy) || 1;
      this.facingX = dx / len;
      this.facingY = dy / len;
      if (Math.abs(dx) > 2) this.faceLeft = dx < 0;
    }
  }

  private moveEnemy(e: Enemy, dx: number, dy: number) {
    if (!circleHitsWall(this.floor, e.x + dx, e.y, e.radius)) e.x += dx;
    else if (!circleHitsWall(this.floor, e.x, e.y + Math.sign(dy || 1) * Math.abs(dx), e.radius)) {
      e.y += Math.sign(dy || (this.rng.next() - 0.5)) * Math.abs(dx); // slide
    }
    if (!circleHitsWall(this.floor, e.x, e.y + dy, e.radius)) e.y += dy;
    else if (!circleHitsWall(this.floor, e.x + Math.sign(dx || 1) * Math.abs(dy), e.y, e.radius)) {
      e.x += Math.sign(dx || (this.rng.next() - 0.5)) * Math.abs(dy);
    }
  }

  private updateEnemies(dt: number) {
    this.enemies.forEach((e) => {
      e.hitFlash = Math.max(0, e.hitFlash - dt * 6);
      e.attackCd = Math.max(0, e.attackCd - dt);
      if (e.kind === "plateau") {
        e.sinceCrit += dt;
        e.shield = plateauShieldRegen(e.shield, e.maxShield, e.sinceCrit, dt);
      }

      const dx = this.px - e.x;
      const dy = this.py - e.y;
      const dist = Math.hypot(dx, dy) || 1;

      // activate when the hero gets close enough (room-by-room pacing)
      if (!e.active && dist < SIGHT_TILES * TILE) e.active = true;
      if (!e.active) return;

      if (Math.abs(dx) > 2) e.faceLeft = dx < 0;

      if (e.kind === "boss") {
        if (e.charging > 0) {
          e.charging -= dt;
          if (e.charging < 0.9) {
            this.moveEnemy(e, e.chargeDx * 640 * dt, e.chargeDy * 640 * dt);
            this.spawnParticles(e.x, e.y, 1, "#dc2626");
          }
        } else {
          this.moveEnemy(e, (dx / dist) * e.speed * dt, (dy / dist) * e.speed * dt);
          if (dist < 460 && this.rng.chance(0.45 * dt)) {
            e.charging = 1.3; e.chargeDx = dx / dist; e.chargeDy = dy / dist;
          }
        }
      } else {
        this.moveEnemy(e, (dx / dist) * e.speed * dt, (dy / dist) * e.speed * dt);
      }

      // soft separation between enemies
      this.enemies.forEach((o) => {
        if (o === e) return;
        const sx = e.x - o.x, sy = e.y - o.y;
        const sd = Math.hypot(sx, sy);
        const minD = e.radius + o.radius;
        if (sd > 0 && sd < minD) {
          e.x += (sx / sd) * (minD - sd) * 0.5;
          e.y += (sy / sd) * (minD - sd) * 0.5;
        }
      });

      // contact damage
      if (dist < e.radius + PLAYER_RADIUS + 3 && e.attackCd <= 0 && this.iframes <= 0) {
        e.attackCd = 0.8;
        const dmg = this.guardBuff > 0 ? Math.round(e.damage * 0.4) : e.damage;
        this.hp -= dmg;
        this.iframes = 0.45;
        this.shake = 6;
        this.spawnParticles(this.px, this.py, 8, "#ef4444");
        if (e.kind === "lesion") {
          // el golpe de LA LESIÓN deja al Eco rengueando
          this.lesionSec = LESION_DEBUFF_SEC;
          this.spawnParticles(this.px, this.py, 7, "#84cc16");
        }
        if (this.hp <= 0) { this.hp = 0; this.finish(false); }
      }
    });
  }

  private updateProjectiles(dt: number) {
    this.projectiles = this.projectiles.filter((p) => {
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
      if (p.life <= 0) return false;
      if (!circleHitsWall(this.floor, p.x, p.y, 6)) {
        // ok
      } else {
        this.spawnParticles(p.x, p.y, 5, "#f0abfc");
        return false;
      }
      for (const e of this.enemies) {
        if (Math.hypot(e.x - p.x, e.y - p.y) < e.radius + 14) {
          this.damageEnemy(e, p.damage);
          this.spawnParticles(p.x, p.y, 6, "#f0abfc");
          return false;
        }
      }
      return true;
    });
  }

  private checkExit() {
    const tx = Math.floor(this.px / TILE);
    const ty = Math.floor(this.py / TILE);
    const t = tileAt(this.floor, tx, ty);
    if (t === Tile.Stairs) {
      // descend to next floor
      this.beginTransition(true);
    } else if (t === Tile.Exit && !this.bossAlive) {
      // final floor sealed (boss dead or no boss)
      this.finish(true);
    }
  }

  private beginTransition(descend: boolean) {
    if (this.transition > 0 || this.ended) return;
    if (descend && this.depth >= this.opt.run.totalFloors) {
      // reached the bottom on a non-boss run → rift sealed
      this.finish(true);
      return;
    }
    this.transition = 1.4; // long enough to read the act banner
    this.transitionTotal = 1.4;
    this.pendingDescend = descend;
    this.spawnParticles(this.px, this.py, 18, "#a855f7");
  }

  // ── combat ───────────────────────────────────────────────────────────────
  private rollDamage(base: number): { value: number; crit: boolean } {
    const crit = this.rng.next() < this.opt.character.critChance;
    const variance = 0.85 + this.rng.next() * 0.3;
    return { value: Math.max(1, Math.round(base * variance * (crit ? 2 : 1))), crit };
  }

  private damageEnemy(e: Enemy, base: number) {
    const { value, crit } = this.rollDamage(base);
    if (e.kind === "plateau" && e.shield > 0) {
      e.active = true;
      if (crit) {
        e.sinceCrit = 0;
        e.shield = plateauShieldAfterHit(e.shield, value, true);
        e.hitFlash = 1;
        this.dmgNumbers.push({ x: e.x, y: e.y - e.radius - 6, value, crit: true, life: 0.9 });
        if (e.shield <= 0) {
          this.shake = Math.max(this.shake, 8);
          this.spawnParticles(e.x, e.y, 16, "#67e8f9");
        }
      } else {
        // bloqueado: solo los críticos muerden el escudo
        this.dmgNumbers.push({ x: e.x, y: e.y - e.radius - 6, value: 0, crit: false, life: 0.6 });
        this.spawnParticles(e.x, e.y, 3, "#94a3b8");
      }
      return;
    }
    e.hp -= value;
    e.hitFlash = 1;
    e.active = true;
    this.dmgNumbers.push({ x: e.x, y: e.y - e.radius - 6, value, crit, life: 0.9 });
    if (crit) this.shake = Math.max(this.shake, 3);
    if (e.hp <= 0) {
      this.kills++;
      this.spawnParticles(e.x, e.y, e.kind === "boss" ? 22 : 12, e.kind === "boss" ? "#dc2626" : "#a855f7");
      if (e.kind === "boss") {
        this.bossAlive = false;
        this.shake = 16;
        // open the gate visually
        this.floor.tiles[this.floor.exit.cy * this.floor.gw + this.floor.exit.cx] = Tile.Exit;
      }
    }
  }

  private meleeArc(range: number, arcRad: number, damage: number) {
    const fa = Math.atan2(this.facingY, this.facingX);
    this.enemies.forEach((e) => {
      const dx = e.x - this.px, dy = e.y - this.py;
      const dist = Math.hypot(dx, dy);
      if (dist > range + e.radius) return;
      const angle = Math.atan2(dy, dx);
      let diff = Math.abs(angle - fa);
      if (diff > Math.PI) diff = 2 * Math.PI - diff;
      if (diff <= arcRad / 2) {
        this.damageEnemy(e, damage);
        e.x += (dx / (dist || 1)) * 12;
        e.y += (dy / (dist || 1)) * 12;
      }
    });
    this.spawnParticles(this.px + this.facingX * 36, this.py + this.facingY * 36, 5, "#e2e8f0");
  }

  private castSkill(idx: number) {
    const skill: UnlockedSkill | undefined = this.opt.character.loadout[idx];
    if (!skill || this.skillCds[idx] > 0) return;
    if (skill.archetype === "heal" && this.healUsed) return;
    if (this.will < skill.cost) return;

    this.will -= skill.cost;
    this.skillCds[idx] = skill.cooldownMs;
    this.castAnim = 0.4;
    if (!this.moving) this.faceNearestEnemy();
    const power = this.opt.character.power * skill.powerMult;

    switch (skill.archetype) {
      case "slam":
        this.shake = 10; this.aoeDamage(this.px, this.py, 165, power, 50);
        this.ringParticles(this.px, this.py, 165, "#f59e0b"); break;
      case "dash":
        this.dashTime = 0.15; this.iframes = Math.max(this.iframes, 0.3);
        this.enemies.forEach((e) => {
          const t = this.pointToSegment(e.x, e.y, this.px, this.py,
            this.px + this.facingX * 260, this.py + this.facingY * 260);
          if (t < e.radius + 46) this.damageEnemy(e, power);
        }); break;
      case "pull":
        this.enemies.forEach((e) => {
          const dx = this.px - e.x, dy = this.py - e.y, d = Math.hypot(dx, dy);
          if (d < 290 && d > 1) {
            this.moveEnemy(e, (dx / d) * Math.min(130, d - 40), (dy / d) * Math.min(130, d - 40));
            this.damageEnemy(e, power);
          }
        });
        this.ringParticles(this.px, this.py, 290, "#a855f7"); break;
      case "burst":
        this.shake = 8;
        this.enemies.forEach((e) => {
          const dx = e.x - this.px, dy = e.y - this.py, d = Math.hypot(dx, dy);
          if (d < 185) { this.damageEnemy(e, power); e.x += (dx / (d || 1)) * 90; e.y += (dy / (d || 1)) * 90; }
        });
        this.ringParticles(this.px, this.py, 185, "#f8fafc"); break;
      case "strike": {
        let nearest: Enemy | null = null; let nd = 230;
        this.enemies.forEach((e) => {
          const d = Math.hypot(e.x - this.px, e.y - this.py);
          if (d < nd) { nd = d; nearest = e; }
        });
        if (nearest) { this.damageEnemy(nearest, power); this.spawnParticles((nearest as Enemy).x, (nearest as Enemy).y, 10, "#fbbf24"); }
        break;
      }
      case "projectile":
        this.projectiles.push({
          x: this.px + this.facingX * 22, y: this.py + this.facingY * 22,
          vx: this.facingX * 520, vy: this.facingY * 520, damage: power, life: 1.4,
        }); break;
      case "spin":
        this.aoeDamage(this.px, this.py, 215, power, 30);
        this.ringParticles(this.px, this.py, 215, "#22d3ee"); break;
      case "speed":
        this.speedBuff = 4; this.spawnParticles(this.px, this.py, 10, "#39ff14"); break;
      case "guard":
        this.guardBuff = 5; this.ringParticles(this.px, this.py, 56, "#60a5fa"); break;
      case "heal":
        this.healUsed = true;
        this.hp = Math.min(this.opt.character.vitality, this.hp + this.opt.character.vitality * 0.5);
        this.ringParticles(this.px, this.py, 76, "#34d399"); break;
    }
  }

  private aoeDamage(x: number, y: number, radius: number, damage: number, knockback: number) {
    this.enemies.forEach((e) => {
      const dx = e.x - x, dy = e.y - y, d = Math.hypot(dx, dy);
      if (d < radius + e.radius) {
        this.damageEnemy(e, damage);
        if (knockback > 0 && d > 0) { e.x += (dx / d) * knockback; e.y += (dy / d) * knockback; }
      }
    });
  }

  private pointToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1, dy = y2 - y1;
    const len2 = dx * dx + dy * dy || 1;
    let t = ((px - x1) * dx + (py - y1) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  }

  private finish(victory: boolean) {
    if (this.ended) return;
    this.ended = true;
    const bossDefeated = this.opt.run.isBossDay && victory && !this.bossAlive;
    const result: GameResult = {
      victory, depth: this.depth, kills: this.kills,
      timeMs: Math.round(performance.now() - this.startedAt), bossDefeated,
    };
    setTimeout(() => this.opt.onEnd(result), victory ? 900 : 1200);
  }

  // ── vfx ──────────────────────────────────────────────────────────────────
  private spawnParticles(x: number, y: number, count: number, color: string) {
    if (this.particles.length > 240) return;
    for (let i = 0; i < count; i++) {
      const a = this.rng.next() * Math.PI * 2;
      const sp = 40 + this.rng.next() * 150;
      this.particles.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: 0.35 + this.rng.next() * 0.4, maxLife: 0.75,
        size: 2 + this.rng.next() * 3, color,
      });
    }
  }
  private ringParticles(x: number, y: number, radius: number, color: string) {
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * Math.PI * 2;
      this.particles.push({
        x: x + Math.cos(a) * radius * 0.7, y: y + Math.sin(a) * radius * 0.7,
        vx: Math.cos(a) * 120, vy: Math.sin(a) * 120,
        life: 0.4, maxLife: 0.4, size: 3, color,
      });
    }
  }

  private pushHud() {
    let objective: string;
    if (this.floor.isBoss && this.bossAlive) objective = "DERROTÁ A EL SEDENTARIO";
    else if (this.floor.isBoss) objective = "PISÁ EL PORTAL PARA SELLAR LA GRIETA";
    else if (this.depth >= this.opt.run.totalFloors) objective = "ENCONTRÁ EL PORTAL FINAL";
    else objective = "ENCONTRÁ LAS ESCALERAS";

    const tx = Math.floor(this.px / TILE);
    const ty = Math.floor(this.py / TILE);
    const t = tileAt(this.floor, tx, ty);
    const onExit = (t === Tile.Stairs) || (t === Tile.Exit && !this.bossAlive);

    this.opt.onHud({
      hp: Math.max(0, Math.round(this.hp)),
      maxHp: this.opt.character.vitality,
      will: Math.round(this.will),
      maxWill: this.opt.character.stamina,
      depth: this.depth,
      totalFloors: this.opt.run.totalFloors,
      kills: this.kills,
      enemiesLeft: this.enemies.length,
      skillReadiness: this.opt.character.loadout.map((s, i) =>
        s.cooldownMs <= 0 ? 1 : 1 - this.skillCds[i] / s.cooldownMs,
      ),
      healUsed: this.healUsed,
      objective,
      onExit,
      zoneName: this.zone.name,
      lesionSec: this.lesionSec,
    });
  }

  // ── render (delegado al renderer 3D) ────────────────────────────────────
  private tintFor(e: Enemy): EnemyTint {
    return e.kind === "boss" ? BOSS_TINT :
      e.kind === "lesion" ? LESION_TINT :
      e.kind === "plateau" ? PLATEAU_TINT :
      ENEMY_TINTS[e.tintIndex];
  }

  private render() {
    const target = this.pendingDescend
      ? zoneForDepth(this.depth + 1, this.opt.run.totalFloors)
      : this.zone;
    this.r3d.render({
      px: this.px,
      py: this.py,
      facingX: this.facingX,
      facingY: this.facingY,
      moving: this.moving || this.dashTime > 0,
      walkPhase: this.walkPhase,
      attackAnim: this.attackAnim,
      castAnim: this.castAnim,
      iframes: this.iframes,
      guardBuff: this.guardBuff,
      hpFrac: this.hp / this.opt.character.vitality,
      heroPrimary: this.heroDesign.colors.primary,
      heroAccent: this.heroDesign.colors.accent,
      auraColor: this.auraColor,
      enemies: this.enemies.map((e) => {
        const tint = this.tintFor(e);
        return {
          kind: e.kind, x: e.x, y: e.y, radius: e.radius,
          hp: e.hp, maxHp: e.maxHp, hitFlash: e.hitFlash, charging: e.charging,
          faceLeft: e.faceLeft, name: e.name,
          shield: e.shield, maxShield: e.maxShield,
          tintBody: tint.body, tintEdge: tint.edge,
        };
      }),
      projectiles: this.projectiles,
      particles: this.particles,
      dmgNumbers: this.dmgNumbers,
      shake: this.shake,
      bossAlive: this.bossAlive,
      transition: this.transition,
      transitionTotal: this.transitionTotal,
      bannerText: target.name,
      bannerColor: target.accent,
    });
  }
}
