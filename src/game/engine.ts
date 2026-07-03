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
import { drawHero, getHeroDesign, HeroDesign } from "./heroDesign";
import { drawEnemy, ENEMY_TINTS, BOSS_TINT, EnemyTint } from "./enemyDesign";
import { ZoneTheme, zoneForDepth } from "./zones";
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
  private ctx: CanvasRenderingContext2D;
  private opt: EngineOptions;
  private rng: RNG;

  private running = false;
  private rafId = 0;
  private lastTs = 0;
  private startedAt = 0;
  private ended = false;

  // dungeon
  private floor!: DungeonFloor;
  private explored!: Uint8Array;
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
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D no disponible");
    this.ctx = ctx;
    this.opt = opt;
    this.rng = new RNG(opt.run.seed ^ (opt.runNonce * 0x85ebca6b));
    this.hp = opt.character.vitality;
    this.will = opt.character.stamina;
    this.skillCds = opt.character.loadout.map(() => 0);

    this.heroDesign = getHeroDesign(opt.heroVariantIndex);

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
    this.explored = new Uint8Array(this.floor.gw * this.floor.gh);

    const sc = roomCenterWorld(this.floor.start);
    this.px = sc.x;
    this.py = sc.y;

    this.enemies = [];
    this.projectiles = [];
    this.bossAlive = false;
    this.lesionSec = 0; // el debuff se limpia al cambiar de acto
    this.spawnFloorEnemies();
    this.revealAround();
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

    this.revealAround();

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

  private revealAround() {
    const htx = Math.floor(this.px / TILE);
    const hty = Math.floor(this.py / TILE);
    for (let y = hty - SIGHT_TILES; y <= hty + SIGHT_TILES; y++) {
      for (let x = htx - SIGHT_TILES; x <= htx + SIGHT_TILES; x++) {
        if (x < 0 || y < 0 || x >= this.floor.gw || y >= this.floor.gh) continue;
        if ((x - htx) ** 2 + (y - hty) ** 2 <= SIGHT_TILES * SIGHT_TILES) {
          this.explored[y * this.floor.gw + x] = 1;
        }
      }
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

  // ── render ───────────────────────────────────────────────────────────────
  private render() {
    const { ctx, canvas } = this;
    const cw = canvas.width;
    const ch = canvas.height;
    const worldW = this.floor.gw * TILE;
    const worldH = this.floor.gh * TILE;

    const shakeX = (this.rng.next() - 0.5) * this.shake;
    const shakeY = (this.rng.next() - 0.5) * this.shake;
    let camX = this.px - cw / 2 + shakeX;
    let camY = this.py - ch / 2 + shakeY;
    camX = worldW <= cw ? (worldW - cw) / 2 : Math.max(0, Math.min(worldW - cw, camX));
    camY = worldH <= ch ? (worldH - ch) / 2 : Math.max(0, Math.min(worldH - ch, camY));

    ctx.fillStyle = this.zone.bg;
    ctx.fillRect(0, 0, cw, ch);

    ctx.save();
    ctx.translate(-camX, -camY);

    // visible tile range
    const x0 = Math.max(0, Math.floor(camX / TILE) - 1);
    const y0 = Math.max(0, Math.floor(camY / TILE) - 1);
    const x1 = Math.min(this.floor.gw - 1, Math.ceil((camX + cw) / TILE));
    const y1 = Math.min(this.floor.gh - 1, Math.ceil((camY + ch) / TILE));
    const htx = Math.floor(this.px / TILE);
    const hty = Math.floor(this.py / TILE);

    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        if (!this.explored[ty * this.floor.gw + tx]) continue;
        const t = this.floor.tiles[ty * this.floor.gw + tx];
        const wx = tx * TILE;
        const wy = ty * TILE;
        const inSight = (tx - htx) ** 2 + (ty - hty) ** 2 <= SIGHT_TILES * SIGHT_TILES;
        const dim = inSight ? 1 : 0.42;

        if (t === Tile.Wall) {
          // only draw wall blocks adjacent to floor (cuts overdraw, cleaner look)
          ctx.fillStyle = `rgba(${this.zone.wall},${dim})`;
          ctx.fillRect(wx, wy, TILE, TILE);
          ctx.fillStyle = `rgba(${this.zone.wallTop},${dim})`;
          ctx.fillRect(wx, wy, TILE, 4); // top highlight
          ctx.fillStyle = `rgba(0,0,0,${dim * 0.5})`;
          ctx.fillRect(wx, wy + TILE - 5, TILE, 5);
        } else {
          // floor
          ctx.fillStyle = `rgba(${this.zone.floor},${dim})`;
          ctx.fillRect(wx, wy, TILE, TILE);
          ctx.strokeStyle = `rgba(${this.zone.accentRgb},${dim * 0.05})`;
          ctx.lineWidth = 1;
          ctx.strokeRect(wx + 0.5, wy + 0.5, TILE - 1, TILE - 1);

          if (t === Tile.Stairs) this.drawStairs(wx, wy, dim);
          if (t === Tile.Exit) this.drawExitGate(wx, wy, dim, this.bossAlive);
        }
      }
    }

    // projectiles
    this.projectiles.forEach((p) => {
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 16);
      g.addColorStop(0, "rgba(240,171,252,0.95)");
      g.addColorStop(1, "rgba(168,85,247,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, 16, 0, Math.PI * 2); ctx.fill();
    });

    // enemies (only the active/visible ones)
    this.enemies.forEach((e) => {
      const inSight = (Math.floor(e.x / TILE) - htx) ** 2 + (Math.floor(e.y / TILE) - hty) ** 2
        <= (SIGHT_TILES + 1) ** 2;
      if (!inSight && !e.active) return;
      this.drawEnemy(e);
    });

    this.drawHero();

    // particles
    this.particles.forEach((p) => {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    });
    ctx.globalAlpha = 1;

    // damage numbers
    this.dmgNumbers.forEach((d) => {
      ctx.globalAlpha = Math.max(0, d.life / 0.9);
      ctx.font = d.crit ? "bold 22px monospace" : "bold 15px monospace";
      ctx.fillStyle = d.crit ? "#fbbf24" : "#f8fafc";
      ctx.textAlign = "center";
      ctx.fillText(String(d.value), d.x, d.y);
    });
    ctx.globalAlpha = 1;

    ctx.restore();

    // vignette
    const vg = ctx.createRadialGradient(cw / 2, ch / 2, ch * 0.3, cw / 2, ch / 2, ch * 0.8);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.7)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, cw, ch);

    // luna carmesí permanente en la azotea
    if (this.zone.id === "azotea") {
      ctx.fillStyle = `rgba(220,38,38,${0.04 + 0.02 * Math.sin(performance.now() / 900)})`;
      ctx.fillRect(0, 0, cw, ch);
    }

    if (this.hp / this.opt.character.vitality < 0.3) {
      ctx.fillStyle = `rgba(220,38,38,${0.08 + 0.05 * Math.sin(performance.now() / 180)})`;
      ctx.fillRect(0, 0, cw, ch);
    }

    // floor transition fade + act banner (Persona-style diagonal cut)
    if (this.transition > 0) {
      const half = this.transitionTotal / 2;
      const fade = Math.max(0, 1 - Math.abs(this.transition - half) / half);
      ctx.fillStyle = `rgba(0,0,0,${fade})`;
      ctx.fillRect(0, 0, cw, ch);

      const target = this.pendingDescend
        ? zoneForDepth(this.depth + 1, this.opt.run.totalFloors)
        : this.zone;
      ctx.save();
      ctx.globalAlpha = Math.min(1, fade * 1.6);
      ctx.translate(cw / 2, ch / 2);
      ctx.rotate(-0.055);
      ctx.fillStyle = target.accent;
      ctx.fillRect(-cw, -34, cw * 2, 68);
      ctx.fillStyle = "#050507";
      ctx.font = `bold ${Math.min(30, cw / 16)}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(target.name, 0, 1);
      ctx.restore();
    }
  }

  private drawStairs(wx: number, wy: number, dim: number) {
    const ctx = this.ctx;
    ctx.fillStyle = `rgba(168,85,247,${dim * 0.5})`;
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(wx + 6, wy + 8 + i * 8, TILE - 12 - i * 6, 5);
    }
    ctx.strokeStyle = `rgba(192,132,252,${dim})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(wx + 4, wy + 4, TILE - 8, TILE - 8);
  }

  private drawExitGate(wx: number, wy: number, dim: number, locked: boolean) {
    const ctx = this.ctx;
    const c = locked ? "220,38,38" : "16,185,129";
    const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 300);
    const g = ctx.createRadialGradient(wx + TILE / 2, wy + TILE / 2, 2, wx + TILE / 2, wy + TILE / 2, TILE / 2);
    g.addColorStop(0, `rgba(${c},${dim * (0.4 + pulse * 0.5)})`);
    g.addColorStop(1, `rgba(${c},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(wx - TILE / 2, wy - TILE / 2, TILE * 2, TILE * 2);
    ctx.strokeStyle = `rgba(${c},${dim})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(wx + TILE / 2, wy + TILE / 2, TILE / 2 - 4, 0, Math.PI * 2);
    ctx.stroke();
  }

  private drawHero() {
    const ctx = this.ctx;
    const flicker = this.iframes > 0 && Math.floor(this.iframes * 20) % 2 === 0;
    ctx.globalAlpha = flicker ? 0.5 : 1;
    drawHero(
      ctx,
      this.heroDesign,
      {
        x: this.px,
        y: this.py + PLAYER_RADIUS,
        faceLeft: this.faceLeft,
        moving: this.moving || this.dashTime > 0,
        walkPhase: this.walkPhase,
        attack: this.attackAnim > 0 ? 1 - this.attackAnim / 0.3 : 0,
        cast: this.castAnim > 0 ? 1 - this.castAnim / 0.4 : 0,
        guard: this.guardBuff > 0,
        hurt: this.iframes > 0.3 ? (this.iframes - 0.3) / 0.15 : 0,
        t: performance.now() / 1000,
      },
      1.25,
    );
    ctx.globalAlpha = 1;
  }

  private drawEnemy(e: Enemy) {
    const ctx = this.ctx;
    const tint =
      e.kind === "boss" ? BOSS_TINT :
      e.kind === "lesion" ? LESION_TINT :
      e.kind === "plateau" ? PLATEAU_TINT :
      ENEMY_TINTS[e.tintIndex];
    // los enemigos de Fase 2 reutilizan las siluetas existentes
    const silhouette = e.kind === "lesion" ? "minion" : e.kind === "plateau" ? "brute" : e.kind;
    drawEnemy(ctx, silhouette, tint, {
      x: e.x,
      y: e.y,
      radius: e.radius,
      t: performance.now() / 1000 + e.tintIndex,
      faceLeft: e.faceLeft,
      hitFlash: e.hitFlash,
      charging: e.charging,
      variant: e.variant,
    });

    // anillo de escudo de EL PLATEAU — solo lo rompen los críticos
    if (e.kind === "plateau" && e.shield > 0) {
      const frac = e.shield / e.maxShield;
      ctx.strokeStyle = `rgba(103,232,249,${0.35 + 0.55 * frac})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius + 7, 0, Math.PI * 2 * frac);
      ctx.stroke();
    }

    // hp bar + name
    if (e.hp < e.maxHp || e.kind === "boss" || e.kind === "plateau") {
      const bw = Math.max(e.radius * 2, e.kind === "boss" ? 120 : 30);
      const by = e.y - e.radius - (e.kind === "boss" ? 26 : 16);
      ctx.fillStyle = "rgba(0,0,0,0.75)";
      ctx.fillRect(e.x - bw / 2, by, bw, e.kind === "boss" ? 7 : 5);
      ctx.fillStyle = e.kind === "boss" ? "#dc2626" : "#a855f7";
      ctx.fillRect(e.x - bw / 2, by, (bw * Math.max(0, e.hp)) / e.maxHp, e.kind === "boss" ? 7 : 5);
      if (e.kind === "plateau" && e.shield > 0) {
        ctx.fillStyle = "#67e8f9";
        ctx.fillRect(e.x - bw / 2, by - 3, (bw * e.shield) / e.maxShield, 2);
      }
      if (e.kind === "boss" || e.kind === "brute" || e.kind === "plateau" || e.kind === "lesion") {
        ctx.font = e.kind === "boss" ? "bold 13px monospace" : "bold 9px monospace";
        ctx.fillStyle = e.kind === "boss" ? "#fca5a5" :
          e.kind === "plateau" ? "#a5f3fc" :
          e.kind === "lesion" ? "#bef264" : "#cbd5e1";
        ctx.textAlign = "center";
        ctx.fillText(e.name, e.x, by - (e.kind === "plateau" ? 7 : 4));
      }
    }
  }
}
