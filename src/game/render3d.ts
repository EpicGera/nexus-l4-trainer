/**
 * NEXUS: EL ABISMO — renderer 3D (Three.js).
 *
 * Toda la escena vive acá: el engine simula (2D top-down en px de mundo) y
 * este módulo dibuja. Mapeo de coordenadas: mundo (x,y) → 3D (x, altura, y).
 * El fog of war ahora es luz real: la antorcha del Eco + niebla de zona.
 * Los textos (números de daño, barras, banner de acto) van en un canvas 2D
 * superpuesto, proyectando posiciones de mundo a pantalla.
 */

import * as THREE from "three";
import { DungeonFloor, TILE, Tile } from "./dungeon";
import { ZoneTheme } from "./zones";

const WALL_H = 56;
const CAM_BACK = 225; // qué tan atrás mira la cámara (ángulo Diablo, empinado para que los muros no tapen al Eco)
const CAM_UP = 590;

export interface EnemyView {
  kind: "minion" | "brute" | "boss" | "lesion" | "plateau";
  x: number;
  y: number;
  radius: number;
  hp: number;
  maxHp: number;
  hitFlash: number;
  charging: number;
  faceLeft: boolean;
  name: string;
  shield: number;
  maxShield: number;
  tintBody: string;
  tintEdge: string;
}

export interface RenderState {
  px: number;
  py: number;
  facingX: number;
  facingY: number;
  moving: boolean;
  walkPhase: number;
  attackAnim: number; // 0..0.3s restante
  castAnim: number;
  iframes: number;
  guardBuff: number;
  hpFrac: number;
  heroPrimary: string;
  heroAccent: string;
  auraColor: string | null;
  enemies: readonly EnemyView[];
  projectiles: readonly { x: number; y: number }[];
  particles: readonly { x: number; y: number; life: number; maxLife: number; color: string }[];
  dmgNumbers: readonly { x: number; y: number; value: number; crit: boolean; life: number }[];
  shake: number;
  bossAlive: boolean;
  transition: number;
  transitionTotal: number;
  bannerText: string;
  bannerColor: string;
}

const MAX_PARTICLES = 300;

function rgb(triplet: string): THREE.Color {
  const [r, g, b] = triplet.split(",").map(Number);
  return new THREE.Color(r / 255, g / 255, b / 255);
}

export class AbyssRenderer3D {
  private renderer: THREE.WebGLRenderer;
  private overlay: HTMLCanvasElement;
  private octx: CanvasRenderingContext2D;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;

  private world = new THREE.Group(); // geometría estática del piso actual
  private torch: THREE.PointLight;
  private hemi: THREE.HemisphereLight;

  private hero = new THREE.Group();
  private heroBody!: THREE.Mesh;
  private heroHead!: THREE.Mesh;
  private auraRing: THREE.Mesh | null = null;
  private guardRing!: THREE.Mesh;
  private heroShadow!: THREE.Mesh;

  private gate: THREE.Mesh | null = null;
  private gateLight: THREE.PointLight | null = null;

  private enemyMeshes = new Map<object, THREE.Group>();
  private projMeshes: THREE.Mesh[] = [];
  private points: THREE.Points;
  private pPos: Float32Array;
  private pCol: Float32Array;

  private zoneBg = new THREE.Color("#050507");
  private w = 2;
  private h = 2;

  constructor(canvas: HTMLCanvasElement, overlay: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.overlay = overlay;
    const octx = overlay.getContext("2d");
    if (!octx) throw new Error("Canvas 2D overlay no disponible");
    this.octx = octx;

    this.camera = new THREE.PerspectiveCamera(46, 1, 10, 4000);
    this.scene.add(this.world);

    this.hemi = new THREE.HemisphereLight("#8888aa", "#000000", 0.22);
    this.scene.add(this.hemi);
    this.torch = new THREE.PointLight("#ffd9a0", 1400, 540, 1.8);
    this.torch.position.set(0, 130, 0);
    this.scene.add(this.torch);

    this.buildHero("#1f3a8a", "#22d3ee");
    this.scene.add(this.hero);

    // pool de partículas (Points con color por vértice, blending aditivo)
    this.pPos = new Float32Array(MAX_PARTICLES * 3);
    this.pCol = new Float32Array(MAX_PARTICLES * 3);
    const pg = new THREE.BufferGeometry();
    pg.setAttribute("position", new THREE.BufferAttribute(this.pPos, 3));
    pg.setAttribute("color", new THREE.BufferAttribute(this.pCol, 3));
    this.points = new THREE.Points(
      pg,
      new THREE.PointsMaterial({
        size: 7, vertexColors: true, transparent: true,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }),
    );
    this.points.frustumCulled = false;
    this.scene.add(this.points);
  }

  resize(w: number, h: number) {
    this.w = Math.max(2, w);
    this.h = Math.max(2, h);
    this.renderer.setSize(this.w, this.h, false);
    this.overlay.width = this.w;
    this.overlay.height = this.h;
    this.camera.aspect = this.w / this.h;
    this.camera.updateProjectionMatrix();
  }

  // ── héroe ──────────────────────────────────────────────────────────────
  private buildHero(primary: string, accent: string) {
    this.hero.clear();
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(10, 16, 4, 10),
      new THREE.MeshStandardMaterial({ color: primary, roughness: 0.6 }),
    );
    body.position.y = 20;
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(7, 12, 10),
      new THREE.MeshStandardMaterial({
        color: "#d9c1a0", emissive: accent, emissiveIntensity: 0.15, roughness: 0.7,
      }),
    );
    head.position.y = 40;
    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(11, 3, 3),
      new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 1.2 }),
    );
    visor.position.set(0, 41, 5.5);
    this.guardRing = new THREE.Mesh(
      new THREE.TorusGeometry(20, 1.6, 8, 28),
      new THREE.MeshBasicMaterial({ color: "#60a5fa", transparent: true, opacity: 0.7 }),
    );
    this.guardRing.rotation.x = Math.PI / 2;
    this.guardRing.position.y = 14;
    this.guardRing.visible = false;
    this.heroShadow = new THREE.Mesh(
      new THREE.CircleGeometry(14, 20),
      new THREE.MeshBasicMaterial({ color: "#000000", transparent: true, opacity: 0.45 }),
    );
    this.heroShadow.rotation.x = -Math.PI / 2;
    this.heroShadow.position.y = 0.6;
    this.heroBody = body;
    this.heroHead = head;
    this.hero.add(body, head, visor, this.guardRing, this.heroShadow);
  }

  setHeroColors(primary: string, accent: string) {
    this.buildHero(primary, accent);
  }

  setAura(color: string | null) {
    if (this.auraRing) {
      this.hero.remove(this.auraRing);
      this.auraRing = null;
    }
    if (color) {
      this.auraRing = new THREE.Mesh(
        new THREE.TorusGeometry(24, 1.2, 8, 32),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5 }),
      );
      this.auraRing.rotation.x = Math.PI / 2;
      this.auraRing.position.y = 2;
      this.hero.add(this.auraRing);
    }
  }

  // ── piso estático ──────────────────────────────────────────────────────
  buildFloor(floor: DungeonFloor, zone: ZoneTheme) {
    // desmontar el acto anterior
    this.world.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else if (mat) mat.dispose();
    });
    this.world.clear();
    this.gate = null;
    if (this.gateLight) { this.scene.remove(this.gateLight); this.gateLight = null; }

    this.zoneBg = new THREE.Color(zone.bg);
    this.scene.background = this.zoneBg;
    this.scene.fog = new THREE.Fog(this.zoneBg, 520, 1500);
    this.hemi.color = new THREE.Color(zone.accent).lerp(new THREE.Color("#8888aa"), 0.5);
    this.hemi.intensity = zone.id === "azotea" ? 0.34 : 0.22;

    const ww = floor.gw * TILE;
    const wh = floor.gh * TILE;

    // suelo
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(ww, wh),
      new THREE.MeshStandardMaterial({ color: rgb(zone.floor), roughness: 0.95 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(ww / 2, 0, wh / 2);
    this.world.add(ground);

    // grilla sutil con el acento de zona
    const grid = new THREE.GridHelper(Math.max(ww, wh), Math.max(floor.gw, floor.gh), zone.accent, zone.accent);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.05;
    grid.position.set(ww / 2, 0.4, wh / 2);
    this.world.add(grid);

    // muros instanciados (solo los adyacentes a piso, como en 2D)
    const wallCells: { x: number; y: number }[] = [];
    for (let ty = 0; ty < floor.gh; ty++) {
      for (let tx = 0; tx < floor.gw; tx++) {
        if (floor.tiles[ty * floor.gw + tx] !== Tile.Wall) continue;
        let nearFloor = false;
        for (let dy = -1; dy <= 1 && !nearFloor; dy++) {
          for (let dx = -1; dx <= 1 && !nearFloor; dx++) {
            const nx = tx + dx, ny = ty + dy;
            if (nx < 0 || ny < 0 || nx >= floor.gw || ny >= floor.gh) continue;
            if (floor.tiles[ny * floor.gw + nx] !== Tile.Wall) nearFloor = true;
          }
        }
        if (nearFloor) wallCells.push({ x: tx, y: ty });
      }
    }
    const wallGeo = new THREE.BoxGeometry(TILE, WALL_H, TILE);
    const wallMat = new THREE.MeshStandardMaterial({ color: rgb(zone.wall), roughness: 0.9 });
    const walls = new THREE.InstancedMesh(wallGeo, wallMat, wallCells.length);
    const capGeo = new THREE.BoxGeometry(TILE, 4, TILE);
    const capMat = new THREE.MeshStandardMaterial({
      color: rgb(zone.wallTop), emissive: rgb(zone.wallTop), emissiveIntensity: 0.12,
    });
    const caps = new THREE.InstancedMesh(capGeo, capMat, wallCells.length);
    const m4 = new THREE.Matrix4();
    wallCells.forEach((c, i) => {
      m4.setPosition((c.x + 0.5) * TILE, WALL_H / 2, (c.y + 0.5) * TILE);
      walls.setMatrixAt(i, m4);
      m4.setPosition((c.x + 0.5) * TILE, WALL_H + 2, (c.y + 0.5) * TILE);
      caps.setMatrixAt(i, m4);
    });
    this.world.add(walls, caps);

    // portal de salida (escaleras o sello) — anillo emisivo pulsante
    const gx = (floor.exit.cx + 0.5) * TILE;
    const gz = (floor.exit.cy + 0.5) * TILE;
    const gateColor = floor.isBoss ? "#dc2626" : "#a855f7";
    this.gate = new THREE.Mesh(
      new THREE.TorusGeometry(TILE * 0.42, 3, 10, 36),
      new THREE.MeshStandardMaterial({
        color: gateColor, emissive: gateColor, emissiveIntensity: 1.6,
      }),
    );
    this.gate.rotation.x = Math.PI / 2;
    this.gate.position.set(gx, 3, gz);
    this.world.add(this.gate);
    this.gateLight = new THREE.PointLight(gateColor, 900, 320, 1.8);
    this.gateLight.position.set(gx, 60, gz);
    this.scene.add(this.gateLight);
  }

  // ── enemigos ───────────────────────────────────────────────────────────
  private makeEnemyMesh(e: EnemyView): THREE.Group {
    const g = new THREE.Group();
    const body = new THREE.Color(e.tintBody);
    const edge = new THREE.Color(e.tintEdge);
    const mat = new THREE.MeshStandardMaterial({
      color: body, emissive: edge, emissiveIntensity: 0.4,
      roughness: 0.7, flatShading: true,
    });
    let mesh: THREE.Mesh;
    if (e.kind === "boss") {
      mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(e.radius, 1), mat);
      for (let i = 0; i < 5; i++) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(5, 20, 6), mat.clone());
        const a = -Math.PI / 2 + (i - 2) * 0.5;
        spike.position.set(Math.cos(a) * e.radius, e.radius + Math.sin(-a) * 8 + 8, 0);
        spike.rotation.z = -a;
        g.add(spike);
      }
    } else if (e.kind === "brute" || e.kind === "plateau") {
      mesh = new THREE.Mesh(
        new THREE.BoxGeometry(e.radius * 1.7, e.radius * 1.7, e.radius * 1.3), mat,
      );
      const s1 = new THREE.Mesh(new THREE.ConeGeometry(4, 14, 5), mat.clone());
      s1.position.set(-e.radius * 0.8, e.radius * 1.1, 0);
      const s2 = s1.clone();
      s2.position.x = e.radius * 0.8;
      g.add(s1, s2);
      if (e.kind === "plateau") {
        const shield = new THREE.Mesh(
          new THREE.SphereGeometry(e.radius + 9, 18, 14),
          new THREE.MeshBasicMaterial({
            color: "#67e8f9", transparent: true, opacity: 0.22,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }),
        );
        shield.name = "shield";
        g.add(shield);
      }
    } else {
      mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(e.radius * 0.95, 0), mat);
    }
    mesh.name = "body";
    g.add(mesh);
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(e.radius * 0.9, 16),
      new THREE.MeshBasicMaterial({ color: "#000", transparent: true, opacity: 0.4 }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.5;
    g.add(shadow);
    return g;
  }

  private syncEnemies(state: RenderState, t: number) {
    const seen = new Set<object>();
    state.enemies.forEach((e) => {
      seen.add(e);
      let g = this.enemyMeshes.get(e);
      if (!g) {
        g = this.makeEnemyMesh(e);
        this.enemyMeshes.set(e, g);
        this.scene.add(g);
      }
      const bounce = e.kind === "minion" || e.kind === "lesion" ? Math.abs(Math.sin(t * 5 + e.x)) * 5 : 0;
      g.position.set(e.x, e.radius + 2 + bounce, e.y);
      g.rotation.y = e.faceLeft ? 0.35 : -0.35;
      const bodyMesh = g.getObjectByName("body") as THREE.Mesh | undefined;
      if (bodyMesh) {
        const m = bodyMesh.material as THREE.MeshStandardMaterial;
        m.emissiveIntensity = 0.4 + e.hitFlash * 2.2 + (e.charging > 0.9 ? 0.8 : 0);
        const wob = 1 + Math.sin(t * 3 + e.y) * 0.04;
        bodyMesh.scale.setScalar(wob + e.hitFlash * 0.12);
      }
      const shield = g.getObjectByName("shield") as THREE.Mesh | undefined;
      if (shield) {
        shield.visible = e.shield > 0;
        (shield.material as THREE.MeshBasicMaterial).opacity =
          0.1 + 0.25 * (e.maxShield > 0 ? e.shield / e.maxShield : 0);
      }
    });
    // remover muertos
    this.enemyMeshes.forEach((g, key) => {
      if (!seen.has(key)) {
        this.scene.remove(g);
        g.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.geometry) m.geometry.dispose();
          const mat = m.material as THREE.Material | undefined;
          if (mat) mat.dispose();
        });
        this.enemyMeshes.delete(key);
      }
    });
  }

  // ── frame ──────────────────────────────────────────────────────────────
  render(state: RenderState) {
    const t = performance.now() / 1000;

    // héroe
    this.hero.position.set(state.px, 0, state.py);
    const face = Math.atan2(state.facingX, state.facingY);
    this.hero.rotation.y = face;
    const bob = state.moving ? Math.abs(Math.sin(state.walkPhase * 6)) * 4 : Math.sin(t * 2) * 1.2;
    this.heroBody.position.y = 20 + bob;
    this.heroHead.position.y = 40 + bob;
    // lunge del ataque + flare de cast
    const lunge = state.attackAnim > 0 ? Math.sin((1 - state.attackAnim / 0.3) * Math.PI) : 0;
    this.hero.position.x += state.facingX * lunge * 10;
    this.hero.position.z += state.facingY * lunge * 10;
    const heroMat = this.heroBody.material as THREE.MeshStandardMaterial;
    heroMat.emissive = new THREE.Color(state.castAnim > 0 ? state.heroAccent : "#000000");
    heroMat.emissiveIntensity = state.castAnim > 0 ? 1.2 * (state.castAnim / 0.4) : 0;
    heroMat.transparent = state.iframes > 0;
    heroMat.opacity = state.iframes > 0 && Math.floor(state.iframes * 20) % 2 === 0 ? 0.35 : 1;
    this.guardRing.visible = state.guardBuff > 0;
    if (this.auraRing) {
      (this.auraRing.material as THREE.MeshBasicMaterial).opacity =
        0.3 + 0.2 * Math.sin(t * 4);
      this.auraRing.rotation.z = t * 0.8;
    }

    // antorcha sigue al Eco
    this.torch.position.set(state.px, 140, state.py + 30);

    // portal pulsante (rojo trabado si el jefe vive)
    if (this.gate) {
      const gm = this.gate.material as THREE.MeshStandardMaterial;
      const locked = state.bossAlive;
      const c = locked ? "#dc2626" : "#10b981";
      gm.color.set(c);
      gm.emissive.set(c);
      gm.emissiveIntensity = 1.2 + Math.sin(t * 4) * 0.6;
      this.gate.scale.setScalar(1 + Math.sin(t * 3) * 0.06);
      if (this.gateLight) this.gateLight.color.set(c);
    }

    this.syncEnemies(state, t);

    // proyectiles (pool simple)
    while (this.projMeshes.length < state.projectiles.length) {
      const p = new THREE.Mesh(
        new THREE.SphereGeometry(7, 10, 8),
        new THREE.MeshBasicMaterial({ color: "#f0abfc" }),
      );
      this.scene.add(p);
      this.projMeshes.push(p);
    }
    this.projMeshes.forEach((m, i) => {
      const src = state.projectiles[i];
      m.visible = !!src;
      if (src) m.position.set(src.x, 18, src.y);
    });

    // partículas
    const n = Math.min(MAX_PARTICLES, state.particles.length);
    const col = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const p = state.particles[i];
      this.pPos[i * 3] = p.x;
      this.pPos[i * 3 + 1] = 14 + (1 - p.life / p.maxLife) * 26;
      this.pPos[i * 3 + 2] = p.y;
      col.set(p.color).multiplyScalar(Math.max(0, p.life / p.maxLife));
      this.pCol[i * 3] = col.r;
      this.pCol[i * 3 + 1] = col.g;
      this.pCol[i * 3 + 2] = col.b;
    }
    this.points.geometry.setDrawRange(0, n);
    this.points.geometry.attributes.position.needsUpdate = true;
    this.points.geometry.attributes.color.needsUpdate = true;

    // cámara Diablo con shake
    const shx = (Math.random() - 0.5) * state.shake * 2;
    const shy = (Math.random() - 0.5) * state.shake * 2;
    this.camera.position.set(state.px + shx, CAM_UP, state.py + CAM_BACK + shy);
    this.camera.lookAt(state.px + shx, 0, state.py + shy);

    this.renderer.render(this.scene, this.camera);
    this.drawOverlay(state);
  }

  /** Proyección mundo → pantalla para el overlay 2D. */
  private project(x: number, height: number, y: number): { sx: number; sy: number } {
    const v = new THREE.Vector3(x, height, y).project(this.camera);
    return { sx: (v.x * 0.5 + 0.5) * this.w, sy: (-v.y * 0.5 + 0.5) * this.h };
  }

  private drawOverlay(state: RenderState) {
    const ctx = this.octx;
    ctx.clearRect(0, 0, this.w, this.h);

    // barras de vida + nombres de enemigos
    state.enemies.forEach((e) => {
      const showBar = e.hp < e.maxHp || e.kind === "boss" || e.kind === "plateau";
      if (!showBar) return;
      const p = this.project(e.x, e.radius * 2 + 26, e.y);
      if (p.sx < -60 || p.sx > this.w + 60 || p.sy < -30 || p.sy > this.h + 30) return;
      const bw = e.kind === "boss" ? 120 : 40;
      const bh = e.kind === "boss" ? 7 : 4;
      ctx.fillStyle = "rgba(0,0,0,0.75)";
      ctx.fillRect(p.sx - bw / 2, p.sy, bw, bh);
      ctx.fillStyle = e.kind === "boss" ? "#dc2626" : "#a855f7";
      ctx.fillRect(p.sx - bw / 2, p.sy, (bw * Math.max(0, e.hp)) / e.maxHp, bh);
      if (e.kind === "plateau" && e.shield > 0) {
        ctx.fillStyle = "#67e8f9";
        ctx.fillRect(p.sx - bw / 2, p.sy - 3, (bw * e.shield) / e.maxShield, 2);
      }
      if (e.kind !== "minion") {
        ctx.font = e.kind === "boss" ? "bold 13px monospace" : "bold 9px monospace";
        ctx.fillStyle = e.kind === "boss" ? "#fca5a5" :
          e.kind === "plateau" ? "#a5f3fc" :
          e.kind === "lesion" ? "#bef264" : "#cbd5e1";
        ctx.textAlign = "center";
        ctx.fillText(e.name, p.sx, p.sy - 5);
      }
    });

    // números de daño
    state.dmgNumbers.forEach((d) => {
      const p = this.project(d.x, 50 + (0.9 - d.life) * 55, d.y);
      ctx.globalAlpha = Math.max(0, d.life / 0.9);
      ctx.font = d.crit ? "bold 22px monospace" : "bold 15px monospace";
      ctx.fillStyle = d.crit ? "#fbbf24" : "#f8fafc";
      ctx.textAlign = "center";
      ctx.fillText(String(d.value), p.sx, p.sy);
    });
    ctx.globalAlpha = 1;

    // aviso de vida baja
    if (state.hpFrac < 0.3) {
      ctx.fillStyle = `rgba(220,38,38,${0.08 + 0.05 * Math.sin(performance.now() / 180)})`;
      ctx.fillRect(0, 0, this.w, this.h);
    }

    // transición de acto + banner diagonal
    if (state.transition > 0) {
      const half = state.transitionTotal / 2;
      const fade = Math.max(0, 1 - Math.abs(state.transition - half) / half);
      ctx.fillStyle = `rgba(0,0,0,${fade})`;
      ctx.fillRect(0, 0, this.w, this.h);
      ctx.save();
      ctx.globalAlpha = Math.min(1, fade * 1.6);
      ctx.translate(this.w / 2, this.h / 2);
      ctx.rotate(-0.055);
      ctx.fillStyle = state.bannerColor;
      ctx.fillRect(-this.w, -34, this.w * 2, 68);
      ctx.fillStyle = "#050507";
      ctx.font = `bold ${Math.min(30, this.w / 16)}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(state.bannerText, 0, 1);
      ctx.restore();
    }
  }

  dispose() {
    this.enemyMeshes.forEach((g) => this.scene.remove(g));
    this.enemyMeshes.clear();
    this.renderer.dispose();
  }
}
