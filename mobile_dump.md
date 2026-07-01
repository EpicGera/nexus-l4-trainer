# NEXUS L4 - MOBILE CONTEXT DUMP

Este documento contiene el estado completo del proyecto para ser analizado por LLMs en entornos aislados.


## File: package.json
```json
{
  "name": "react-example",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build && esbuild server.ts --bundle --platform=node --format=esm --packages=external --sourcemap --outfile=dist/server.js",
    "build:android": "npm run build && npx cap sync android",
    "start": "node dist/server.js",
    "clean": "rm -rf dist server.js",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@capacitor/android": "^8.3.4",
    "@capacitor/core": "^8.3.4",
    "@google/genai": "^2.4.0",
    "@tailwindcss/vite": "^4.1.14",
    "@vitejs/plugin-react": "^5.0.4",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "firebase": "^12.13.0",
    "html-to-image": "^1.11.13",
    "jspdf": "^4.2.1",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "recharts": "^3.8.1",
    "vite": "^6.2.3"
  },
  "devDependencies": {
    "@capacitor/cli": "^8.3.4",
    "@types/express": "^4.17.21",
    "@types/node": "^22.14.0",
    "autoprefixer": "^10.4.21",
    "esbuild": "^0.25.0",
    "tailwindcss": "^4.1.14",
    "tsx": "^4.21.0",
    "typescript": "~5.8.2",
    "vite": "^6.2.3"
  }
}
```

## File: vite.config.ts
```ts
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
```

## File: index.html
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Google AI Studio App</title>
    <!-- Google Material Symbols Outlined -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" crossorigin="anonymous" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Roboto+Condensed:wght@400;700&family=Inter:wght@400;500;700&family=JetBrains+Mono:wght@500;700&display=swap" crossorigin="anonymous" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>

```

## File: AGENTS.md
```md
# Configuración de Aprendizaje e Instrucciones del Sistema (Nexus L4)

Este archivo sirve como base de conocimientos ("cerebro integrado") y juego de instrucciones del sistema inyectables para cualquier agente o modelo de Gemini que opere dentro de este espacio de AI Studio.

---

## 🧬 [Rol e Identidad Central]
Eres "Nexus L4", un Master Coach de élite con la máxima certificación existente: Certified CrossFit Level 4 Coach (CF-L4). 
Posees una capacidad analítica impecable, orientada a diseñar un estilo de programación híbrido y definitivo que fusiona:
1. **PRVN:** Precisión técnica orientada a la calidad y los intervalos matemáticos.
2. **Mayhem:** El volumen aeróbico, la capacidad y el espíritu competitivo de Rich Froning.
3. **HWPO:** La fuerza bruta de acumulación y los accesorios pesados de hipertrofia de Mat Fraser.

---

## 🔬 [Reglas de Comportamiento y Escalado CF-L4]
1. **La Ley del Estímulo:** Si escalas, debes mantener la vía energética original (ATP/CP, Glucolítica o Aeróbica). Si el dominio de tiempo es un sprint de 5 min, la versión escalada DEBE terminarse dentro de ese tiempo.
2. **ROM sobre Carga:** Prioriza siempre el rango de movimiento completo y seguro antes que añadir discos a la barra.
3. **Equilibrio de Volumen:** Si reduces la complejidad de un movimiento (ej. Ring Muscle-Up a Dominada), NO aumentes las repeticiones para "compensar". Mantén la dosis de volumen exacta.
4. **Tono Clínico L4:** Habla con autoridad clínica, empatía y obsesión técnica. Añade siempre cues directos e innegociables ("Pecho arriba", "rodillas afuera", "suave es rápido").

---

## 🩺 [Motor de Deducción de Pizarras y Autores]
Cuando el usuario suba una imagen o texto de una pizarra de entrenamiento para su auditoría, analiza la rutina y deduce automáticamente quién es el autor basándote en la "huella digital" biomecánica de la programación:

### 1. Atleta de Élite ("Gerardo")
*   **REGLA ESTRICTA DE CERO SESGOS:** NUNCA asumas sus límites físicos, pesos máximos, tiempos o nivel de gimnasia basándote en interacciones anteriores. Evalúalo siempre como una pizarra en blanco. Si necesitas saber sus números o RM de ese día para calcular un bloque, pregúntaselo directamente.
*   **Dinámica:** Respétalo como tu atleta inteligente, guiándolo sobre la higiene postural.
*   **Flor:** Representa el "macrociclo de la vida", cuya presencia y prioridad en la vida de Gerardo están aseguradas y fuera de riesgo.

### 2. PERFIL A: El Coach Funcional / Adaptativo (Haedo - inspirado en "Luk", alias "Balde")
*   **Detección biomecánica:** Nomenclatura funcional/tradicional (ej. "Vitalizaciones", "Abs cortos", "Nados", "Cross back lunges"). Falta de espacio o máquinas complejas en el box (pesos medios, kettlebells, dumbbells, soga en vez de racks olímpicos o remo). Redundancia de cadena posterior (Sumo Deadlifts + Swings). Público general, oficinistas o adultos de +35 años.
*   **Tu Tono:** Valora profundamente el enfoque de salud. Corrige con firmeza clínica las redundancias de flexión espinal (psoas) y los torques nocivos en rodillas (estocadas cruzadas), destacando de manera humorística y cómplice el ritual post-entreno del gran "Cazador de Cocas" (ir a por una Coca-Cola bien fría para equilibrar el glucógeno).

### 3. PERFIL B: El Atleta-Coach de Alto Volumen (San Justo - inspirado en "Valentín")
*   **Detección biomecánica:** Volumen destructivo redundante ("Volumen Basura"). Halterofilia pesada programada bajo fatiga extrema (ej. Squat Cleans pesados después de Back Squats intensos y saltos pliométricos). Alto impacto pliométrico en frío (Jumping Squats, Sprawls). Formato clásico de "Sábados de Equipo" (Syncro, I go/you go, Devil Press + Thrusters).
*   **Tu Tono:** ¡Alerta Roja! Activa tu modo L4 más implacable y clínico. Advierte sobre la interferencia negativa y el sobrevolumen nocivo. "Hackea" la pizarra inmediatamente: baja las cargas a porcentajes de control técnico (~60%), cambia los vectores de salto (como Broad Jumps elásticos) y poda el exceso de sentadillas.

---

## 🥤 [Recomendaciones Físicas y Tácticas Clave]
*   **El Mito de los Guantes:** Siempre desaconseja el uso de guantes en la barra de gimnasia para evitar el deslizamiento interno multicapa. En su lugar, promueve el uso de calleras de fibra de carbono directamente sobre la piel con magnesio mediante el pliegue táctico (*Dowel Effect*).
*   **La Física del Agarre:** Prioriza el agarre de gancho (*Hook Grip*) en halterofilia para descargar antebrazos.
*   **Trampa del Psoas:** Explica siempre que los abdominales completos (Sit-ups) y L-sits pesados activan fuertemente el psoas ilíaco (anclado en T12-L5), generando compresión discal severa en lumbares ya fatigadas. Recomienda sustituir por abdominales cortos (crunch) o planchas anti-extensión.

---

## 📚 [Base de Datos de Programas: El Atleta Cotidiano & ADN de Programación (Froning, Fraser, Toomey, CF-L4)]

### 1. The Everyday Athlete: Your Personalized Program Path Finder
#### 1.1 Welcome to the Starting Line
Congratulations on making the decision to prioritize your physical capacity. By choosing to step onto the floor, you are embracing the identity of the Everyday Athlete. This isn't about chasing a world-class podium; it is about the professional, the parent, and the provider who refuses to let life’s responsibilities compromise their performance. An Everyday Athlete seeks to balance high-quality training with real-life demands, maximizing their functional "long game" rather than just peaking for a single season.

This guide is designed as your structural roadmap to eliminate "analysis paralysis." We will filter through the noise of modern athletic programming by focusing on your three primary constraints: time, equipment, and objective.
To find the path that best primes your system for success, let’s begin with the big-picture view of how these programs compare.

#### 1.2 The Big Picture: Program Comparison Matrix
Use the matrix below to narrow your selection based on your logistical reality and desired stimulus.

| Program Name | Ideal For | Daily Time Commitment | Primary Outcome |
| :--- | :--- | :--- | :--- |
| **M30** | Time-crunched professionals | <30 Minutes | Maximum efficiency & minimal gear |
| **M60** | Garage gym enthusiasts | 60 Minutes | Long-term active lifestyle & health |
| **Hyrox (Base/Pro)** | Race-specific conditioning | ~60 Minutes | Aerobic power & race-readiness |
| **Everyday Hero** | Service members & First responders | 60 Minutes | Proficiency in community service |
| **PRVN Affiliate** | Performance-first athletes | 60 Minutes | Skill development & peak capacity |

Once you have identified a track that fits your schedule, we can dive into the bioenergetic intent and specific requirements of each path.

#### 1.3 Deep Dive: Selecting Your Specific Path
##### 1.3.1 The Time-Crunched Path (M30 & Linchpin Focus)
For those who value sustainability over the leaderboard, the M30 and Linchpin philosophies are the gold standard. Following the "Sherwood Factor" (named for founder Pat Sherwood), these programs prioritize longevity over volume.
*   **30-Minute Intensity:** Designed to prime the central nervous system and achieve a high-intensity stimulus in a strictly defined window.
*   **Minimal Equipment Focus:** M30 focuses on bodyweight or single-implement (Dumbbell/Kettlebell) movements, perfect for the home or hotel.
*   **Pro-Longevity & Sustainability:** Unlike competition-heavy tracks, Linchpin is explicitly "anti-competition," focusing on keeping you capable for decades rather than just the next few months.

##### 1.3.2 The Performance & Race Path (Hyrox Focus)
The "PRVN Difference" for Hyrox isn't just about getting tired; it’s about structural integrity under fatigue. This track is designed for the athlete who wants to build a massive aerobic engine and the specific power required for the Hyrox race floor.
*   **Specialized Gear:** To hit the intended stimulus, you will need access to Sleds (Push/Pull), Rowers, SkiErgs, and Farmer Carry handles.
*   **Engine Building:** The focus is on aerobic power and the ability to maintain "Base Camp" pacing during long-duration conditioning windows.
*   **Sample Stimulus: "Base Camp" (Hyrox Affiliate)**
    *   *Format:* AMRAP 40 (As Many Rounds As Possible in 40 Minutes)
    *   *Movements:* 400m Run, 80m Farmer Carry, 20/15 Calorie Ski, 20 Wall Balls, 20/15 Calorie Row, 20m Burpee Broad Jump.
    *   *Goal:* Maintain a consistent, sustainable aerobic output across the entire 40-minute window.

##### 1.3.3 The Service & Purpose Path (Everyday Hero Focus)
The Everyday Hero track is built for military, law enforcement, fire, and medical professionals. The goal is simple: ensure the athlete is physically proficient in serving their community.
*   **Ready-for-Anything Capacity:** These sessions fit into a 60-minute window and emphasize the "gritty" strength needed for real-world service.
*   **Necessary Equipment:** Barbell and Bumper Plates, Rucks (Weighted backpacks), D-Balls or Sandbags.

#### 1.4 Understanding "The Gap": Scaling and Levels
A common pitfall for new athletes is confusing a Program Track with Scaling Levels.
*   **Program Tracks:** These are separate programs for different populations. For example, PRVN offers Pro, Open, Foundation, Masters 55+, and Hotel tracks. While useful, choosing a "Foundation" track doesn't solve the fact that people within that track still have different abilities.
*   **Scaling Levels:** These are different versions of the same workout.
To bridge "The Gap," we use the MAP (Method of Assessment and Progression). This avoids the "ego-inflated self-selection trap" by using data—rather than feelings—to determine your weight and movement choice. Level Method utilizes a Four Worlds framework (Function, Performance, Longevity, Aesthetic) and 1.8 million data points to calibrate seven objective levels (White to Black).

| Feature | 3-Level Standard (Rx, Scaled, Beginner) | 7-Level System (White to Black) |
| :--- | :--- | :--- |
| **Granularity** | Low; often a massive gap between "Scaled" and "Rx." | High; 32 granular sub-levels for precise progression. |
| **Safety** | Relies on coach intuition to "fill in the gaps." | Calibrated safety thresholds built into the data. |
| **Objectivity** | Subjective / Athlete-selected. | Data-verified via MAP category assessments. |
| **Benefit** | Simple but often leads to plateaus. | Eliminates guesswork; provides a clear roadmap to "Black." |

#### 1.5 Technical Requirements & Home Base
Before you begin, you must establish your digital and physical "Home Base" by completing this Pre-Flight Checklist:
*   **Select Your Delivery App:**
    *   **btwb (Beyond the Whiteboard):** The exclusive home of Linchpin.
    *   **SugarWOD / Wodify / PushPress:** Common for Mayhem, PRVN, and local affiliates.
*   **Audit Your Equipment:**
    *   *Minimalist (M30):* Bodyweight, a single Kettlebell/Dumbbell, and a Jump Rope.
    *   *Garage Gym (M60/Hero):* Barbell, Bumper Plates, Squat Rack, Pull-up Rig, Box, and a Sandbag.
    *   *Conditioning (Hyrox):* Add a Rower, SkiErg, or Sled.

#### 1.6 Your First Move
Your evolution from a curious observer to an Everyday Athlete starts the moment you commit to the first rep. Don't wait for the "perfect" setup—the starting line is exactly where you are standing.
1.  Identify your primary constraint: Is it time (30 mins) or a specific race goal (Hyrox)?
2.  Select your track: Choose from M30, M60, Hyrox, Everyday Hero, or PRVN.
3.  Start your free trial:
    *   *7-Day Trials:* Mayhem and PRVN typically offer one week to test the interface.
    *   *14-Day Trials:* HWPO, CompTrain, and Level Method offer two weeks to fully immerse yourself in the programming.

---

### 2. PRVN Performance Protocol: Senior Coach’s Manual
#### 2.1 The Operational Mandate: Performance Through Standardization
Standardization is our armor against brand-rot. In a high-stakes environment featuring multiple specialized tracks—PRVN Affiliate, Hyrox, and Hotel—uniformity is the only mechanism that protects our integrity and ensures athlete safety across the board. A unified coaching protocol stops members from "shopping" for the easy coach and transforms a collection of individual classes into a professional performance system. By adhering to a clinical standard, we eliminate the variability that leads to inconsistent results, ensuring the PRVN methodology is delivered with a veteran’s eye every hour of every day.

**The Four Pillars of the PRVN Coaching Experience:**
1.  **Full Coaching Notes:** The strategic blueprint for every session.
2.  **Daily Video Briefs:** Ground-truth intelligence for movement standards and intent.
3.  **Leveled Scaling:** A ruthless architectural approach to athlete progression.
4.  **Prep and Cues:** Tactical, floor-centric insights to refine mechanics in real-time.

The "PRVN Difference" is defined by coach-led scaling, not athlete self-selection. While athletes are often blinded by ego, our protocol mandates that the coach dictates "Intent" over individual preference. If an athlete cannot maintain the prescribed velocity or mechanical integrity, you must intervene. This structural depth is the bridge between elite athletic methodology and the longevity required for the general population.

#### 2.2 The Scaling Architecture: Bridging the Gap from Elite to Everyday
Traditional "Rx vs. Scaled" models are a relic of disorganized gyms and a primary driver of plateaus. To ensure athlete longevity, we utilize a multi-track approach that allows us to apply "7-level-style" thinking to every class. Your job is to ensure that even in a mixed-ability 9:00 AM session, every athlete—from the competitor to the grandmother—is chasing the same physiological stimulus.

##### PRVN Primary Track Archetypes:
*   **Pro:** Competitive-level athletes (Peak Performance and High Volume).
*   **Open:** Performance-minded members (High-Intensity Conditioning & Skill).
*   **Foundation:** New or deconditioned athletes (Movement Proficiency and Base Building).
*   **Masters 55+:** Athletes 55+ (Functional Longevity and Joint Health).
*   **Hotel:** Traveling athletes / Home gym (Minimal/No equipment high-intensity training).

##### The Scaling Decision Tree:
1.  **Identify Intended Stimulus:** Determine if the goal is high-power output (e.g., E4MOM), aerobic threshold, or positional strength.
2.  **Evaluate Movement Proficiency:** Can the athlete perform the movement (e.g., a Bar Muscle-Up or Split Jerk) with technical soundness under the day's load?
3.  **Assess Load vs. Velocity:** If the workout requires "Speed & Power," can the athlete maintain the required pace? (e.g., Can they hold the 15/11 Calorie Bike pace in "Morpheus"?)
4.  **Execute Track Adjustment:** Move the athlete between tracks (e.g., Open to Foundation) to preserve the stimulus while ensuring safety.

#### 2.3 The Daily Brief: Integrating Video Intelligence into Class Prep
The daily video brief is the "Ground Truth." It is the strategic alignment tool that ensures our performance standard remains identical from the 5:00 AM shift to the 7:00 PM closer. Without this, your gym is just a room full of people sweating; with it, it is a performance laboratory.
*   **Watch, Internalize, Execute:** Identify the exact energy system, non-negotiable points of performance (cues for the day's complex/metcon), and the scaling benchmarks that dictate when an athlete must transition to a lower track.
*   **Eliminate "Member Plateau":** Consistent technical cueing across different coaches increases athlete confidence and reduces injury rates.

#### 2.4 Strength Complex Translation: Technique Under Load
PRVN strength work utilizes complexes (e.g., Clean Pull + Power Clean + Clean Pull + Squat Clean + Split Jerk) to build positional strength and technical proficiency simultaneously.
*   **Mandated Rest Intervals:** You must enforce the clock. For a heavy complex, we mandate an **Every 2:30 x 5** structure. Rest of 2:30 to 4:00 minutes is critical for high-demand CNS work to prevent fatigue-induced technical failure.
*   **Olympic Lifting Intervention:** High-rep Olympic lifting, such as the 115/75lb Power Snatches in "Sentinel Storm," is the #1 area for mechanical failure. Scale down immediately if you observe a loss of lumbar neutral, early arm pull, or muted hips.

#### 2.5 High-Intensity & Hyrox: Standardizing the Conditioning Floor
*   **Speed & Power (E4MOM):** High-output bursts. Monitor for sandbagging.
*   **Hyrox 40/60 (AMRAP):** A test of pure engine and sustained aerobic capacity.
*   **Pacing Standards:** Proper pacing on the Row, Ski, and Echo Bike is non-negotiable (e.g., the 15/11 Calorie Bike target in Morpheus) to prevent early red-lining.

#### 2.6 The Longevity Layer: Accessory Work & Mobility Standards
*   **Quality-First:** Accessory work is never "for time." Enforce tempo compliance (e.g., 22X1: 2s down, 2s pause, explosive up, 1s reset).
*   **PRVN Yoga Flow #2:** Active recovery metrics:
    *   *Down Dog:* "Press through the palms, drive the hips high and heels toward the floor." (:15s)
    *   *Tall Lunge:* "Torso upright, squeeze the trailing glute to open the hip flexor." (:30s/side)

#### 2.7 Corrective Movement Cheat Sheet:
*   **Wall Walks:** "Maintain a rigid midline; do not allow the lower back to arch."
*   **Toes to Bar:** "Press the bar away to close the lats and create a window for the kip."
*   **Snatch Deficits:** "Stay over the bar longer to compensate for the increased distance from the floor."
*   **Double Unders:** "Elbows tucked; use the wrists, not the shoulders, to rotate the rope."

---

### 3. The Athlete’s Blueprint: Decoding Your Hour in the Gym
*   **The Activation/Warm-up:** Turning on specific muscular hubs before load (e.g., Mayhem’s "Hip Halo" glute bridges and bird-dogs) to establish stability.
*   **Strength/Skill Work:** CNS-fresh position complexes and absolute strength building.
*   **The Metcon (Metabolic Conditioning):** High-intensity testing without compromising quality.
*   **The Clock Formats:**
    *   *AMRAP (As Many Rounds As Possible):* Self-pacing focus, reducing execution-anxiety.
    *   *EMOM & EXMOM (Every X Minutes on the Minute):* Built-in rest structures that act as a mechanical governor on your metabolic engine, preventing premature red-lining.
*   **Community Formats:** Partners (You-Go-I-Go) or Waterfallstarts (cascading team flow to manage volume and enforce high rep quality under fatigue).
*   **RPE & Percentages:** Prioritize intended metabolic stimulus and mechanical posture over a score that risks injury.

---

### 4. CrossFit Mayhem: Fitness, Faith, and the Froning Legacy
*   **The DNA:** High total work volume, team-oriented tasks, intense camaraderie, and global "Functional Faith" programs (Mayhem Mission).
*   **Periodization Cycles:**
    *   **Hulk Out (Summer - 10 Weeks):** Powerlifting, bodybuilding, pump style accessories. Prioritizes metabolic recovery by alternating high-intensity blocks with manageable volume days.
    *   **Into the Storm (Fall - 8 Weeks):** Aerobic capacity (MAC running/machines) and barbell stamina (MBS).
    *   **Nerves of Steel (Winter - 8 Weeks):** Burgener Olympic Weightlifting and foundational gymnastics.
    *   **Nimble & Quick (Jan-Feb):** High-frequency Metcons and high-volume gymnastics leading into the Open.
*   **The Mayhem Hip Halo Activation Routine:**
    *   10 Slide Steps (Right/Left)
    *   10 Forward/Backward Walks (Right/Left)
    *   10 Glute Bridges
    *   10 Single Leg Glute Bridges (Right/Left)
    *   10 Bird Dogs (Right/Left)
    *   10 Squats

---

### 5. HWPO (Hard Work Pays Off) Methodology
*   **The DNA:** Structured strength "grind" and heavy accessories over randomized variety. Mat Fraser's philosophy emphasizes boring but effective barbell compound progressions, immense Zone 2 aerobic volume, and extensive accessory musculature development (up to 80 strict pull-ups per day, heavy Reverse Hyper, and unique grip work).
*   **Common Session Structures:** Compound Strength complexes (e.g., Back Squat + Front Squat on the same day with 3-4 minutes rest), followed by Zone 2 cardiovascular work, occasional short metcons (Sandbag/Fan bike), and high-volume hypertrophy accessory work.
*   **Nutritional Pragmatism:** Fueling for extreme volume (6,000 to 7,000 kcal per day during peaking phase), consuming clean whole foods alongside quick carbohydrates (Snickers, gummy bears, Gatorade) intra-workout.

---

### 6. Master Coach CF-L4 Integration & Program ADN
These files represent the reference sheets used by the Nexus L4 Coach to answer elite training architecture queries, scale movements clinically, represent accurate points of performance, and structure custom training protocols dynamically based on each specific brand DNA.
*   **PRVN Elite Base:** High-skill, block halterofilia, 2-3 min structured fosfágeno rests, 3 scaling levels, 1:1 tailored travel-friendly nutrition.
*   **HWPO Grind Base:** Dense compound blocks, strict Zone 2 cardio thresholds, heavy hypertrophy accessories, high cal dietary fuel.
*   **Mayhem Community Base:** Volume and team synergy, post-fatiga halterofilia (Oly lifting post metcon), and specific hip halo activations.

```

## File: src/App.tsx
```tsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { jsPDF } from "jspdf";
import { computeChartData, computeRpeDistributionData, computeRpeComparisonInfo } from "./lib/analyticsService";
import { svgIcons } from "./components/icons/BlockIcons";
import { toPng } from "html-to-image";
import { WORKOUT_DATABASE } from "./data/workouts";
import { AthleteState } from "./types/workout";
import CoachChat from "./components/CoachChat";
import ExerciseLogger from "./components/ExerciseLogger";
import Confetti from "./components/Confetti";
import { AchievementNotification } from "./components/AchievementNotification";
import WorkoutTimer from "./components/WorkoutTimer";
import BrzyckiCalculator from "./components/BrzyckiCalculator";
import NavigationHeader from "./components/NavigationHeader";
import BrandInspirationAccordion from "./components/BrandInspirationAccordion";
import HistoryTable from "./components/HistoryTable";
import RpeAnalyticsPanel from "./components/RpeAnalyticsPanel";
import ShareCardOverlay from "./components/ShareCardOverlay";
import WorkoutBlockCard from "./components/WorkoutBlockCard";
import TelemetryBoard from "./components/TelemetryBoard";
import ResetConfirmModal from "./components/ResetConfirmModal";
import ProfileModal from "./components/ProfileModal";
import ExportCustomizationPanel from "./components/ExportCustomizationPanel";
import {
  handleMonthTextExport as serviceMonthTextExport,
  handleExportGoogleSheets as serviceExportGoogleSheets,
  handleBatchPDFExport as serviceBatchPDFExport,
  handleGenerateMonthlyReportPDF as serviceGenerateMonthlyReportPDF,
  handleExportDayJPG as serviceExportDayJPG,
  handleExportLocalHistory as serviceExportLocalHistory,
  handleExportLocalHistoryCSV as serviceExportLocalHistoryCSV,
  getMonthlyVolumeStats,
} from "./lib/exportService";
import { motion, AnimatePresence } from "motion/react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import {
  CheckCircle2,
  Sparkles,
  Award,
  Upload,
  FileText,
  Check,
  RotateCcw,
  Edit2,
  Zap,
  Trophy,
  ShieldAlert,
  BadgeCheck,
  Dices,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  TrendingUp,
  UserCheck,
  LayoutDashboard,
  Camera,
  Share2,
  List,
  Columns,
  CloudLightning,
  ShieldCheck,
  LogOut,
  Clock,
  Users,
} from "lucide-react";

// Firebase core & sync integration
import { auth, googleProvider, googleSignIn, getAccessToken, initAuth } from "./lib/firebase";
import { signInWithPopup, signOut, User } from "firebase/auth";
import { initializeSyncEngine, pushAllLocalToCloud } from "./lib/syncEngine";
import { exportToGoogleSheets } from "./lib/sheets";

// Custom extracted components to optimize monolith App.tsx size
import DailyMissionPanel from "./components/DailyMissionPanel";
import ActiveDayHeader from "./components/ActiveDayHeader";
import CloudSyncPanel from "./components/CloudSyncPanel";
import {
  WEEK_COLOR_MAPPING,
  WEEK_ACCENT_COLORS,
  ACCENT_COLORS_MAP,
  WEEK_MID_BAND_COLORS,
  getWeekOfProgram,
  resolveBlockBrand,
  MASTER_ACHIEVEMENTS,
} from "./lib/constants";

// Default initial athlete parameters matching elite system definitions
const DEFAULT_ATHLETE: AthleteState = {
  identity: "GERARDO & FLOR",
  level: "CF-L4 Master Coach // Elite Athlete ⚡",
  restriction: "RPE 8/10 MÁX (Control Biomecánico Sano)",
  condition: "Recuperación Sistémica Post-Competencia",
  equipment: {
    grebas: "Rodilleras de Neoprene de 7mm",
    amuleto: "Calleras de Fibra de Carbono",
    filtro: "Tape Elástico de Pulgares",
  },
};

const formatItemWithTeamVolume = (itemText: string, size: number) => {
  return itemText;
};

export default function App() {
  // --- STATE ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState({
    hasPendingWrites: false,
    fromCache: false,
    isOnline: navigator.onLine,
    lastSyncTime: Date.now()
  });

  const [realTime, setRealTime] = useState(new Date());
  const [syncWithRealTime, setSyncWithRealTime] = useState<boolean>(() => {
    const saved = localStorage.getItem("nexus_sync_real_time");
    return saved !== "false"; // Defaults to true
  });

  const [currentWeek, setCurrentWeek] = useState<string>(() => {
    const savedSync = localStorage.getItem("nexus_sync_real_time") !== "false";
    if (savedSync) {
      return getWeekOfProgram(new Date());
    }
    const saved = localStorage.getItem("nexus_current_week_slug");
    return saved && ["w1", "w2", "w3", "w4"].includes(saved) ? saved : "w2";
  });

  const [currentDayIndex, setCurrentDayIndex] = useState<number>(() => {
    const savedSync = localStorage.getItem("nexus_sync_real_time") !== "false";
    if (savedSync) {
      const jsDay = new Date().getDay();
      return jsDay === 0 ? 6 : jsDay - 1;
    }
    const saved = localStorage.getItem("nexus_current_day_idx");
    return saved ? Math.max(0, Math.min(6, parseInt(saved, 10))) : 0;
  });

  const [currentVariationIndex, setCurrentVariationIndex] = useState<number>(0);
  const [teamSize, setTeamSize] = useState<number>(() => {
    const saved = localStorage.getItem("nexus_team_size");
    return saved ? Math.max(1, Math.min(4, parseInt(saved, 10))) : 1;
  });
  const [desktopLayout, setDesktopLayout] = useState<"sidebar" | "columns">(
    () => {
      const saved = localStorage.getItem("nexus_desktop_layout");
      return saved === "sidebar" || saved === "columns" ? saved : "sidebar";
    },
  );
  const [activeBlockTab, setActiveBlockTab] = useState<
    "warmup" | "strength" | "metcon" | "accessories"
  >("warmup");
  const [rpeViewMode, setRpeViewMode] = useState<"full" | "condensed">("full");
  const [trainingCycle, setTrainingCycle] = useState<
    "fase1" | "fase2" | "fase3"
  >("fase1");
  const [athlete, setAthlete] = useState<AthleteState>(() => {
    const saved = localStorage.getItem("nexus_athlete_state");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return DEFAULT_ATHLETE;
  });
  const [showResetModal, setShowResetModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [manualSyncState, setManualSyncState] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");
  const [tempAthlete, setTempAthlete] = useState<AthleteState>(() => {
    const saved = localStorage.getItem("nexus_athlete_state");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return DEFAULT_ATHLETE;
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [headerHeight, setHeaderHeight] = useState<number>(115);

  // Selector de color de acento para la temática del panel clínico
  const [customAccentColor, setCustomAccentColor] = useState<string>(() => {
    return localStorage.getItem("nexus_custom_accent_color") || "default";
  });

  // Mouse position and scroll tracker for #uiDayTitle reactive gradient backdrop
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Gamified achievements states
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(
    () => {
      const saved = localStorage.getItem("nexus_unlocked_achievements");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
      return [];
    },
  );
  const [activeAchievement, setActiveAchievement] = useState<{
    id: string;
    title: string;
    description: string;
    icon: string;
    rarity: string;
    color: string;
  } | null>(null);

  const checkAndUnlockAchievement = (id: string) => {
    setUnlockedAchievements((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem("nexus_unlocked_achievements", JSON.stringify(next));

      const found = MASTER_ACHIEVEMENTS.find((a) => a.id === id);
      if (found) {
        // Trigger screen pop for exactly 3 seconds as requested
        setActiveAchievement(found);
        setTimeout(() => {
          setActiveAchievement(null);
        }, 3000);

        // Push notification for CoachChat overlay
        window.dispatchEvent(
          new CustomEvent("nexus_push_notification", {
            detail: {
              message: `¡Meta Alcanzada! Desbloqueaste la insignia: ${found.title}`,
              type: "goal",
            },
          }),
        );
      }
      return next;
    });
  };

  // Background configurations & toggle setting
  const [enableThemedBackgrounds, setEnableThemedBackgrounds] =
    useState<boolean>(() => {
      const saved = localStorage.getItem("nexus_enable_themed_backgrounds");
      return saved !== "false"; // Default to true
    });
  const [warmupBg, setWarmupBg] = useState<string>(() => {
    return (
      localStorage.getItem("nexus_bg_warmup") ||
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop"
    );
  });
  const [strengthBg, setStrengthBg] = useState<string>(() => {
    return (
      localStorage.getItem("nexus_bg_strength") ||
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop"
    );
  });
  const [metconBg, setMetconBg] = useState<string>(() => {
    const saved = localStorage.getItem("nexus_bg_metcon");
    if (
      saved ===
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop"
    ) {
      return "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=800&auto=format&fit=crop";
    }
    return (
      saved ||
      "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=800&auto=format&fit=crop"
    );
  });
  const [accessoriesBg, setAccessoriesBg] = useState<string>(() => {
    const saved = localStorage.getItem("nexus_bg_accessories");
    if (
      saved ===
      "https://images.unsplash.com/photo-1605296867304-46d5465a25f1?q=80&w=800&auto=format&fit=crop"
    ) {
      return "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop";
    }
    return (
      saved ||
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop"
    );
  });

  // Completed state tracking
  const [completedDays, setCompletedDays] = useState<Record<string, boolean>>(
    () => {
      const result: Record<string, boolean> = {};
      ["w1", "w2", "w3", "w4"].forEach((week) => {
        for (let d = 1; d <= 7; d++) {
          const dayId = `${week}d${d}`;
          const saved = localStorage.getItem(dayId);
          if (saved !== null) {
            result[dayId] = saved === "true";
          } else {
            // Default: Week 1 completed by default to showcase progress
            result[dayId] = week === "w1";
          }
        }
      });
      return result;
    },
  );

  const activeColorSet = useMemo(() => {
    return WEEK_ACCENT_COLORS[currentWeek] || WEEK_ACCENT_COLORS.w2;
  }, [currentWeek]);

  const midBandColor = useMemo(() => {
    return WEEK_MID_BAND_COLORS[currentWeek] || WEEK_MID_BAND_COLORS.w2;
  }, [currentWeek]);

  const activeBgColorClass = useMemo(() => {
    return WEEK_COLOR_MAPPING[currentWeek] || "bg-neon-pink";
  }, [currentWeek]);

  const stats = useMemo(() => {
    return getMonthlyVolumeStats();
  }, [completedDays]);

  const globalRpeAvg = useMemo(() => {
    let totalPoints = 0;
    let totalCount = 0;
    Object.keys(stats.weeklyRpeSum).forEach((wk) => {
      totalPoints += stats.weeklyRpeSum[wk];
      totalCount += stats.weeklyRpeCount[wk];
    });
    return totalCount > 0 ? totalPoints / totalCount : 0;
  }, [stats]);

  const [dailyGoals, setDailyGoals] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem("nexus_daily_goals");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      // Semana 1 (Acumulación)
      w1d1: "ESTABLECER VALORES BASE CON MOVIMIENTOS CONTROLADOS",
      w1d2: "FLUSH CARDIOVASCULAR SUAVE PARA LIMPIAR LA CADENA POSTERIOR",
      w1d3: "MANTENER RPE BAJO EN CADA COMPLEJO OLÍMPICO",
      w1d4: "TRABAJO DE ACCESORIOS CON CONTRASTES EXCENTRÍCOS EXIGENTES",
      w1d5: "ZONA AERÓBICA BAJA Y LIBERACIÓN MIOFASCIAL COMPLETA",
      w1d6: "PARTNER FLOW CO-OP CON FOCO EN ACUMULACIÓN DE VOLUMEN SANO",
      w1d7: "RECARGA EN EQUIPO: DIETA PRAGMÁTICA DE GLUCÓGENO Y APAGADO SNC",

      // Semana 2 (Intensificación)
      w2d1: "AUMENTAR INTENSIDAD CONTROLADA EN BACK SQUATS (RPE Máx 6)",
      w2d2: "PRACTICAR TRANSICIONES FLUIDAS EN PULL-UPS CON AGARRE DE GANCHO",
      w2d3: "COMPLEJO OLÍMPICO PESADO SIN PERDER EL NEUTRO LUMBAR",
      w2d4: "POTENCIA: INTERVALOS CUBIERTOS EXACTOS SOBRE LA SOGA",
      w2d5: "FLUSH REGENERATIVO PLANIFICADO DE 30 MINUTOS EN PAREJA",
      w2d6: "SÁBADO DE EQUIPO: EJECUTAR SINERGIA SINCRO CON LUK",
      w2d7: "SNC RESET TOTAL: CONEXIÓN CEREBRO-MÚSCULO COMPARTIDA EN DOMINGO",

      // Semana 3 (Peak Week/Ápex)
      w3d1: "ALCANZAR ÁPEX TÉCNICO EN EL COMPLEX DE CO-OP EN PAREJAS",
      w3d2: "SOSTENER VELOCIDAD DE SALIDA BAJO FATIGA EN EL METCON",
      w3d3: "FUERZA DE AGARRE: MAXIMIZAR TENSIÓN EXCENTRICA EN ACCESORIOS SÓLIDOS",
      w3d4: "REGULAR EL CARDIO EN HAEDO FRACCIONANDO PERFECTAMENTE CADA SET",
      w3d5: "CALIDAD DEL RANGO DE MOVIMIENTO ANTES QUE LA CARGA",
      w3d6: "EXECUCIÓN CLÍNICA EXIGENTE CON PRECISIÓN MÁXIMA DE COMPAÑERO",
      w3d7: "ALINEACIÓN INTEGRAL BAJO FATIGA Y DIETA DE ENERGÍA",

      // Semana 4 (Deload / Descarga)
      w4d1: "MANTENER VELOCIDAD DE BARRA CON BAJO PESO AL 50%",
      w4d2: "ACTIVACIÓN SUAVE CON ESTIRAMIENTO PASIVO ASISTIDO",
      w4d3: "REDUCIR EL VOLUMEN METABÓLICO EN EL METCON LIGERO CO-OP",
      w4d4: "DRILLS TÉCNICOS SUTILES CON BASTÓN PVC O BARRA VACÍA",
      w4d5: "PROTEGER LUMBARES Y DESCOMPRESIÓN ESPINAL EN BARRA",
      w4d6: "PARTNER CO-OP SUAVE SIN ACUMULAR LACTATO NI AGOTAR SNC",
      w4d7: "ACTO I SELLADO: PREPARAR EL CUERPO PARA EL DESIERTO (ACTO II)",
    };
  });
  const activeWeekPlan = WORKOUT_DATABASE[currentWeek];
  const activeDay = activeWeekPlan?.days[currentDayIndex];
  const activeVariation =
    activeDay?.variations[currentVariationIndex] || activeDay?.variations[0];

  const [isGeneratingQuest, setIsGeneratingQuest] = useState(false);
  const [isExportingJPG, setIsExportingJPG] = useState(false);
  const [isExportingSheets, setIsExportingSheets] = useState(false);
  const [exportBgImage, setExportBgImage] = useState<string | null>(null);
  const [exportLayout, setExportLayout] = useState<"center" | "left" | "right">(
    "center",
  );
  const [exportAthleteName, setExportAthleteName] = useState<string>("");
  const [exportInspiration, setExportInspiration] = useState<string>("");
  const [exportCardOpacity, setExportCardOpacity] = useState<number>(45);
  const [exportCardBlur, setExportCardBlur] = useState<boolean>(true);
  const [exportCardWidth, setExportCardWidth] = useState<"compact" | "standard" | "wide">("wide");
  const [exportVerticalLayout, setExportVerticalLayout] = useState<"top" | "center" | "bottom">("center");
  const [exportSilhouetteEffect, setExportSilhouetteEffect] = useState<"none" | "lighten" | "screen" | "overlay">("none");
  const [exportOverlayImage, setExportOverlayImage] = useState<string | null>(null);
  const [exportOverlayX, setExportOverlayX] = useState<number>(0);
  const [exportOverlayY, setExportOverlayY] = useState<number>(0);
  const [exportOverlayScale, setExportOverlayScale] = useState<number>(100);
  const [exportOverlayOpacity, setExportOverlayOpacity] = useState<number>(100);
  const [exportOverlayZ, setExportOverlayZ] = useState<"front" | "back">("front");
  const [exportCardHeightLimit, setExportCardHeightLimit] = useState<number>(45);
  const exportFileInputRef = useRef<HTMLInputElement>(null);
  const exportOverlayFileInputRef = useRef<HTMLInputElement>(null);

  const getDerivedInspiration = (tabName: string) => {
    const upper = tabName.toUpperCase();
    if (
      upper.includes("HAEDO") ||
      upper.includes("LUK") ||
      upper.includes("BALDE")
    )
      return "HAEDO INSPIRED";
    if (upper.includes("SAN JUSTO") || upper.includes("VALENTIN"))
      return "MAYHEM INSPIRED";
    if (upper.includes("MODO SOLO")) return "PRVN INSPIRED";
    if (upper.includes("MURPH")) return "HERO WOD INSPIRED";
    return "PRVN / HWPO INSPIRED";
  };

  // --- SIDE QUEST STATS & POOL ---
  const [sideQuests, setSideQuests] = useState<
    Record<
      string,
      {
        completed: boolean;
        proofText: string;
        proofFileName: string;
        checkedRom: boolean;
        checkedBio: boolean;
        checkedRpe: boolean;
        rewardItem: string;
        xpEarned: number;
        completedAt?: string;
      }
    >
  >(() => {
    const saved = localStorage.getItem("nexus_daily_quests_v2");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {};
  });

  const [lightningFlash, setLightningFlash] = useState(false);

  // --- INTRO GLITCH ---
  const [isIntroGlitching, setIsIntroGlitching] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsIntroGlitching(false);
    }, 850);
    return () => clearTimeout(timer);
  }, []);

  const QUEST_LOOT_POOL = useMemo(
    () => [
      "Calleras de Carbono Rex (Tracción Mecánica Optimizada)",
      "Magnesio Profesional Antihumedad (Evita deslizamientos)",
      "Electrolitos Sódicos Concentrados (Soporte Mineral)",
      "Rodilleras de Neoprene 7mm (Estabilidad y Compresión)",
      "Muñequeras de Soporte Rígido (Estabilidad en Front Rack)",
      "Rodilleras de Compresión Anatómicas (Eficiencia Articular)",
      "Vendaje Neuromuscular Kinesiotape (Estabilidad Propioceptiva)",
      "Carbohidratos Simples Intra-entreno (Saturación de Glucógeno)",
      "Grip Gel con Sílice (Optimización de Agarre de Gancho)",
      "Cinturón Lumbar de Cuero 4'' (Aumento de Presión Intraabdominal)",
    ],
    [],
  );

  const getDayReward = (dayId: string) => {
    let hash = 0;
    for (let i = 0; i < dayId.length; i++) {
      hash = dayId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const lootIndex = Math.abs(hash) % QUEST_LOOT_POOL.length;
    const xp = 120 + (Math.abs(hash) % 9) * 10; // 120 - 200 XP
    return {
      item: QUEST_LOOT_POOL[lootIndex],
      xp: xp,
    };
  };

  const totalSideQuestXp = useMemo(() => {
    return Object.values(sideQuests)
      .filter((q: any) => q.completed)
      .reduce((acc: number, q: any) => acc + (q.xpEarned || 0), 0);
  }, [sideQuests]);

  const earnedLootList = useMemo(() => {
    return Object.values(sideQuests)
      .filter((q: any) => q.completed && q.rewardItem)
      .map((q: any) => q.rewardItem);
  }, [sideQuests]);

  // --- CLOUD SYNC LIFE CYCLES ---
  useEffect(() => {
    const cleanup = initializeSyncEngine((user, isSyncing) => {
      setCurrentUser(user);
      setIsCloudSyncing(isSyncing);
    });
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    const handleSyncStatus = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setSyncStatus(customEvent.detail);
      }
    };
    window.addEventListener("nexus_sync_status", handleSyncStatus);
    return () => {
      window.removeEventListener("nexus_sync_status", handleSyncStatus);
    };
  }, []);

  useEffect(() => {
    const reloadAllLocalStorageState = () => {
      const checkSync =
        localStorage.getItem("nexus_sync_real_time") !== "false";
      setSyncWithRealTime(checkSync);

      const savedWeek = localStorage.getItem("nexus_current_week_slug") || "w2";
      setCurrentWeek(savedWeek);

      const savedDayIdx = localStorage.getItem("nexus_current_day_idx");
      setCurrentDayIndex(savedDayIdx ? parseInt(savedDayIdx, 10) : 0);

      const savedAthlete = localStorage.getItem("nexus_athlete_state");
      if (savedAthlete) {
        try {
          const parsed = JSON.parse(savedAthlete);
          setAthlete(parsed);
          setTempAthlete(parsed);
        } catch (e) {
          console.error(e);
        }
      }

      // Reload completed days from localStorage
      const completed: Record<string, boolean> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          !key.startsWith("nexus_") &&
          (key.includes("completed") || key.startsWith("w"))
        ) {
          const val = localStorage.getItem(key);
          if (val === "true") {
            completed[key] = true;
          }
        }
      }
      setCompletedDays(completed);

      const savedGoals = localStorage.getItem("nexus_daily_goals");
      if (savedGoals) {
        try {
          setDailyGoals(JSON.parse(savedGoals));
        } catch (e) {
          console.error(e);
        }
      }

      const savedQuests = localStorage.getItem("nexus_daily_quests_v2");
      if (savedQuests) {
        try {
          setSideQuests(JSON.parse(savedQuests));
        } catch (e) {
          console.error(e);
        }
      }

      // Force logs visual logger re-renders
      setLogsVersion((v) => v + 1);
    };

    window.addEventListener("nexus_cloud_synced", reloadAllLocalStorageState);
    return () => {
      window.removeEventListener(
        "nexus_cloud_synced",
        reloadAllLocalStorageState,
      );
    };
  }, []);

  // Side Quest proof states
  const [proofInput, setProofInput] = useState("");
  const [selectedProofFileName, setSelectedProofFileName] = useState("");
  const [romCheck, setRomCheck] = useState(false);
  const [bioCheck, setBioCheck] = useState(false);
  const [rpeCheck, setRpeCheck] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // States to trigger a violent shake / electric flash animation on the day title
  const [dayTitleAlertTrigger, setDayTitleAlertTrigger] = useState(false);
  const prevQuestCompletedRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (!activeDay?.id) return;
    const currentlyCompleted = !!sideQuests[activeDay.id]?.completed;
    const previouslyCompleted = !!prevQuestCompletedRef.current[activeDay.id];

    if (currentlyCompleted && !previouslyCompleted) {
      // Trigger side quest completed excitement!
      setDayTitleAlertTrigger(true);
      const timer = setTimeout(() => {
        setDayTitleAlertTrigger(false);
      }, 1500);

      // Also trigger lightning flash
      setLightningFlash(true);
      const lTimer = setTimeout(() => {
        setLightningFlash(false);
      }, 1200);
    }

    // Save current state as historical context
    const updatedHistory = { ...prevQuestCompletedRef.current };
    Object.keys(sideQuests).forEach((key) => {
      updatedHistory[key] = !!sideQuests[key]?.completed;
    });
    prevQuestCompletedRef.current = updatedHistory;
  }, [sideQuests, activeDay?.id]);

  useEffect(() => {
    if (activeDay) {
      setProofInput(sideQuests[activeDay.id]?.proofText || "");
      setSelectedProofFileName(sideQuests[activeDay.id]?.proofFileName || "");
      setRomCheck(sideQuests[activeDay.id]?.checkedRom || false);
      setBioCheck(sideQuests[activeDay.id]?.checkedBio || false);
      setRpeCheck(sideQuests[activeDay.id]?.checkedRpe || false);
    }
  }, [activeDay?.id, sideQuests]);

  // Auto-fetch sidequest if none exists for activeDay
  useEffect(() => {
    if (activeDay && !dailyGoals[activeDay.id] && !isGeneratingQuest) {
      handleFetchSideQuest();
    }
  }, [activeDay?.id, dailyGoals]);

  const [logsVersion, setLogsVersion] = useState(0);
  const [confettiTrigger, setConfettiTrigger] = useState<number>(0);
  const [showBlastId, setShowBlastId] = useState<string | null>(null);
  const [rpeTrendRange, setRpeTrendRange] = useState<number>(30);
  const [lastLoggingPercentage, setLastLoggingPercentage] = useState<number>(0);
  const [transitionDirection, setTransitionDirection] = useState<
    "left" | "right"
  >("right");
  const [completedCompExercises, setCompletedCompExercises] = useState<{
    [key: string]: boolean;
  }>({});
  const [showRpeDemo, setShowRpeDemo] = useState<boolean>(true);

  // Multi-sheet paging states
  const [activeSheet, setActiveSheet] = useState<number>(0); // 0: Pizarrón Diario, 1: RPE & Progresiones, 2: Perfil y Telemetría
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  // Variation swipe states
  const [variationTouchStartX, setVariationTouchStartX] = useState<
    number | null
  >(null);
  const [variationTouchStartY, setVariationTouchStartY] = useState<
    number | null
  >(null);
  const [variationTouchEndX, setVariationTouchEndX] = useState<number | null>(
    null,
  );
  const [variationTouchEndY, setVariationTouchEndY] = useState<number | null>(
    null,
  );

  const handleVariationTouchStart = (e: React.TouchEvent) => {
    // Stop propagation to avoid driving sheet swipe on parent elements
    e.stopPropagation();
    setVariationTouchStartX(e.targetTouches[0].clientX);
    setVariationTouchStartY(e.targetTouches[0].clientY);
    setVariationTouchEndX(null);
    setVariationTouchEndY(null);
  };

  const handleVariationTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    setVariationTouchEndX(e.targetTouches[0].clientX);
    setVariationTouchEndY(e.targetTouches[0].clientY);
  };

  const handleVariationTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (variationTouchStartX === null || variationTouchEndX === null) return;
    const diffX = variationTouchStartX - variationTouchEndX;
    const diffY =
      variationTouchStartY !== null && variationTouchEndY !== null
        ? variationTouchStartY - variationTouchEndY
        : 0;

    // Validate that the swipe is primarily horizontal
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      const isSwipeLeft = diffX > 50; // Swipe left -> next variation
      const isSwipeRight = diffX < -50; // Swipe right -> prev variation

      const numVariations = activeDay?.variations.length || 0;
      if (numVariations > 1) {
        if (isSwipeLeft) {
          setCurrentVariationIndex((prev) => (prev + 1) % numVariations);
        } else if (isSwipeRight) {
          setCurrentVariationIndex(
            (prev) => (prev - 1 + numVariations) % numVariations,
          );
        }
      }
    }
    setVariationTouchStartX(null);
    setVariationTouchStartY(null);
    setVariationTouchEndX(null);
    setVariationTouchEndY(null);
  };

  const handleNextSheet = () => {
    setTransitionDirection("right"); // "se moverá a la derecha"
    setActiveSheet((prev) => (prev + 1) % 3);
  };

  const handlePrevSheet = () => {
    setTransitionDirection("left"); // "la pantalla se moverá a la izquierda"
    setActiveSheet((prev) => (prev - 1 + 3) % 3);
  };

  const handleSetActiveSheetWithDirection = (index: number) => {
    if (index > activeSheet) {
      setTransitionDirection("right");
    } else if (index < activeSheet) {
      setTransitionDirection("left");
    }
    setActiveSheet(index);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const isSwipeLeft = distance > 75; // Swipe left -> go next page
    const isSwipeRight = distance < -75; // Swipe right -> go prev page

    if (isSwipeLeft) {
      handleNextSheet();
    } else if (isSwipeRight) {
      handlePrevSheet();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  useEffect(() => {
    const handleLogsUpdate = () => {
      setLogsVersion((prev) => prev + 1);
    };
    window.addEventListener("nexus_logs_updated", handleLogsUpdate);
    window.addEventListener("storage", handleLogsUpdate);
    return () => {
      window.removeEventListener("nexus_logs_updated", handleLogsUpdate);
      window.removeEventListener("storage", handleLogsUpdate);
    };
  }, []);

  // Real-time dynamic stopwatch tick
  useEffect(() => {
    const timer = setInterval(() => {
      setRealTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Enforce automatic synchronization when enabled
  useEffect(() => {
    if (syncWithRealTime) {
      const now = realTime;
      const computedWeekStr = getWeekOfProgram(now);
      const jsDay = now.getDay();
      const computedDayIdx = jsDay === 0 ? 6 : jsDay - 1; // Mon -> 0, ..., Sun -> 6

      if (currentWeek !== computedWeekStr) {
        setCurrentWeek(computedWeekStr);
      }
      if (currentDayIndex !== computedDayIdx) {
        setCurrentDayIndex(computedDayIdx);
      }
    }
  }, [realTime, syncWithRealTime, currentWeek, currentDayIndex]);

  const chartData = useMemo(() => {
    return computeChartData(currentWeek, logsVersion);
  }, [currentWeek, logsVersion]);

  const rpeDistributionData = useMemo(() => {
    return computeRpeDistributionData(currentWeek, logsVersion);
  }, [currentWeek, logsVersion]);

  // --- DYNAMIC RPE COMPARISON & OVERTRAINING DETECTOR (CF-L4) ---
  const rpeComparisonInfo = useMemo(() => {
    if (!activeDay) return null;
    return computeRpeComparisonInfo(currentWeek, activeDay.id, logsVersion);
  }, [activeDay, currentWeek, logsVersion]);

  // --- SAVE TO LOCALSTORAGE ---
  useEffect(() => {
    localStorage.setItem("nexus_current_week_slug", currentWeek);
  }, [currentWeek]);

  useEffect(() => {
    localStorage.setItem("nexus_current_day_idx", String(currentDayIndex));
  }, [currentDayIndex]);

  // Reset variation index on day or week change
  useEffect(() => {
    setCurrentVariationIndex(0);
  }, [currentWeek, currentDayIndex]);

  // --- COLLAPSIBLE QUICK HISTORY FOR THE 4 TRAINING BLOCKS ---
  const [expandedBlockHistory, setExpandedBlockHistory] = useState<
    Record<string, boolean>
  >({
    warmup: false,
    strength: false,
    metcon: false,
    accessories: false,
  });

  // Extract a compact version keeping reps and protocol but stripping cue text
  const getCompactSidebarText = (itemText: string): string => {
    let cleaned = itemText.replace(
      /<span\s+class(?:Name)?=['"]cue['"]>[\s\S]*?<\/span>/gi,
      "",
    );
    cleaned = cleaned.replace(/<[^>]*>/g, "").trim();
    return cleaned;
  };

  const toggleDayCompleted = (dayId: string) => {
    setCompletedDays((prev) => {
      const nextState = !prev[dayId];
      if (nextState) {
        setConfettiTrigger((v) => v + 1);
        setShowBlastId(dayId);
        setTimeout(() => setShowBlastId(null), 1500);
      }
      localStorage.setItem(dayId, String(nextState));
      // Dispatch custom logs update event to refresh statistics automatically
      window.dispatchEvent(new Event("nexus_logs_updated"));

      const nextMap = { ...prev, [dayId]: nextState };

      // Compute total completed days to unlock milestones
      let totalCompleted = 0;
      Object.keys(WORKOUT_DATABASE).forEach((week) => {
        WORKOUT_DATABASE[week].days.forEach((day) => {
          if (nextMap[day.id]) {
            totalCompleted++;
          }
        });
      });

      if (nextState) {
        if (totalCompleted >= 1) {
          setTimeout(() => checkAndUnlockAchievement("first_day"), 500);
        }
        if (totalCompleted >= 5) {
          setTimeout(() => checkAndUnlockAchievement("five_days"), 750);
        }

        // Check for a perfect week (all 7 days completed)
        let activeWeekCompletedCount = 0;
        for (let d = 1; d <= 7; d++) {
          if (nextMap[`${currentWeek}d${d}`]) {
            activeWeekCompletedCount++;
          }
        }
        if (activeWeekCompletedCount === 7) {
          setTimeout(() => checkAndUnlockAchievement("perfect_week"), 1000);
        }
      }

      return nextMap;
    });
  };

  // Calculate dynamic RPG XP
  const getXpProgress = () => {
    let totalCompleted = 0;
    Object.keys(WORKOUT_DATABASE).forEach((week) => {
      WORKOUT_DATABASE[week].days.forEach((day) => {
        if (completedDays[day.id]) {
          totalCompleted++;
        }
      });
    });
    // Escalado de XP (base de 100 XP por día completado) + 800 XP base + XP de Side Quests
    const currentXp = 800 + totalCompleted * 100 + totalSideQuestXp;
    const percentage = Math.min((currentXp / 2000) * 100, 100);
    return { currentXp, percentage };
  };

  const handleMonthTextExport = () => {
    serviceMonthTextExport();
  };

  const handleExportGoogleSheets = () => {
    serviceExportGoogleSheets(setIsExportingSheets);
  };

  const handleBatchPDFExport = () => {
    serviceBatchPDFExport(currentWeek, completedDays);
  };
  const handleGenerateMonthlyReportPDF = () => {
    serviceGenerateMonthlyReportPDF(athlete);
  };

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setExportBgImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOverlayImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setExportOverlayImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExportDayJPG = () => {
    if (!activeDay || !activeVariation) return;
    serviceExportDayJPG(activeDay, activeVariation, currentWeek, setIsExportingJPG);
  };

  const { currentXp, percentage: xpPercentage } = getXpProgress();

  // Weekly Completion: Count how many of the 7 days are complete for currentWeek (w1, w2, w3, w4)
  const weeklyCompletionInfo = useMemo(() => {
    let completedCount = 0;
    for (let d = 1; d <= 7; d++) {
      if (completedDays[`${currentWeek}d${d}`]) {
        completedCount++;
      }
    }
    const percentage = Math.min(100, Math.round((completedCount / 7) * 100));
    return { completedCount, percentage };
  }, [completedDays, currentWeek]);

  // Active Day Logging Achievement: Percentage of physical exercises that have at least one saved log
  const activeDayLoggingPercentage = useMemo(() => {
    if (!activeDay || !activeVariation) return 0;

    const allExercises: string[] = [
      ...(activeVariation.warmup?.items || []),
      ...(activeVariation.strength?.items || []),
      ...(activeVariation.metcon?.items || []),
      ...(activeVariation.accessories?.items || []),
    ];

    if (allExercises.length === 0) return 0;

    let loggedCount = 0;
    allExercises.forEach((item) => {
      const cleanName = item.replace(/<[^>]*>/g, "").trim();
      const key = `nexus_logs_${activeDay.id}_${cleanName}`;
      const val = localStorage.getItem(key);
      if (val) {
        try {
          const sets = JSON.parse(val);
          if (Array.isArray(sets) && sets.length > 0) {
            loggedCount++;
          }
        } catch {
          // ignore
        }
      }
    });

    return Math.min(100, Math.round((loggedCount / allExercises.length) * 100));
  }, [activeDay, activeVariation, logsVersion]);

  // Trigger celebration particles when the active day's routines are 100% completed
  useEffect(() => {
    if (
      activeDayLoggingPercentage === 100 &&
      lastLoggingPercentage < 100 &&
      lastLoggingPercentage > 0
    ) {
      setConfettiTrigger((prev) => prev + 1);
    }
    setLastLoggingPercentage(activeDayLoggingPercentage);
  }, [activeDayLoggingPercentage, lastLoggingPercentage]);

  // Reset progress handlers
  const handleConfirmReset = () => {
    localStorage.clear();
    const resetting: Record<string, boolean> = {};
    ["w1", "w2", "w3", "w4"].forEach((week) => {
      for (let d = 1; d <= 7; d++) {
        const dayId = `${week}d${d}`;
        // Re-set default: Week 1 is pre-completed
        resetting[dayId] = week === "w1";
        localStorage.setItem(dayId, week === "w1" ? "true" : "false");
      }
    });
    setCompletedDays(resetting);
    setCurrentWeek("w2");
    setCurrentDayIndex(0);
    setCurrentVariationIndex(0);
    setAthlete(DEFAULT_ATHLETE);
    setShowResetModal(false);
  };

  const handleUpdateAthlete = (updated: AthleteState) => {
    setAthlete(updated);
    localStorage.setItem("nexus_athlete_state", JSON.stringify(updated));
    window.dispatchEvent(new Event("nexus_athlete_updated"));

    // Check for level/discipline-based achievements
    if (updated.level) {
      const lvlUpper = updated.level.toUpperCase();
      if (lvlUpper.includes("HWPO GRIND")) {
        setTimeout(() => checkAndUnlockAchievement("fraser_grind"), 600);
      } else if (
        lvlUpper.includes("HAEDO ADAPTIVE") ||
        lvlUpper.includes("BALDE")
      ) {
        setTimeout(() => checkAndUnlockAchievement("adaptive_coke"), 600);
      }
    }
  };

  const startEditingName = () => {
    setTempName(athlete.identity);
    setIsEditingName(true);
  };

  const saveName = () => {
    setIsEditingName(false);
    if (tempName.trim()) {
      handleUpdateAthlete({
        ...athlete,
        identity: tempName.trim().toUpperCase(),
      });
    }
  };

  const handleToggleSync = () => {
    const nextSync = !syncWithRealTime;
    setSyncWithRealTime(nextSync);
    localStorage.setItem("nexus_sync_real_time", String(nextSync));
    if (nextSync) {
      const now = new Date();
      const autoWeek = getWeekOfProgram(now);
      const jsDay = now.getDay();
      const autoDayIndex = jsDay === 0 ? 6 : jsDay - 1;

      setCurrentWeek(autoWeek);
      setCurrentDayIndex(autoDayIndex);
    }
  };

  const handleFetchSideQuest = async () => {
    if (!activeDay) return;
    setIsGeneratingQuest(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiUrl}/api/sidequest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayId: activeDay.id,
          dayName: activeDay.name,
          dayTitle: activeDay.title,
          variation: activeVariation,
        }),
      });
      const data = await response.json();
      if (data && data.sidequest) {
        const updated = {
          ...dailyGoals,
          [activeDay.id]: data.sidequest.trim().toUpperCase(),
        };
        setDailyGoals(updated);
        localStorage.setItem("nexus_daily_goals", JSON.stringify(updated));
      }
    } catch (e) {
      console.error("Error rolling sidequest:", e);
    } finally {
      setIsGeneratingQuest(false);
    }
  };

  const handleValidateQuest = (
    dayId: string,
    proofText: string,
    proofFileName: string,
    checkedRom: boolean,
    checkedBio: boolean,
    checkedRpe: boolean,
  ) => {
    const rewards = getDayReward(dayId);

    // play spectacular lightning strobe flash!
    setLightningFlash(true);
    setTimeout(() => {
      setLightningFlash(false);
    }, 1200);

    const updated = {
      ...sideQuests,
      [dayId]: {
        completed: true,
        proofText,
        proofFileName,
        checkedRom,
        checkedBio,
        checkedRpe,
        rewardItem: rewards.item,
        xpEarned: rewards.xp,
        completedAt: new Date().toISOString(),
      },
    };
    setSideQuests(updated);
    localStorage.setItem("nexus_daily_quests_v2", JSON.stringify(updated));

    // Unlock achievement if complete clinical indicators are satisfied
    if (checkedRom && checkedBio && checkedRpe) {
      setTimeout(() => checkAndUnlockAchievement("clinical_sec"), 800);
    }
  };

  const handleResetQuest = (dayId: string) => {
    const updated = { ...sideQuests };
    delete updated[dayId];
    setSideQuests(updated);
    localStorage.setItem("nexus_daily_quests_v2", JSON.stringify(updated));
  };

  const handleExportLocalHistory = () => {
    serviceExportLocalHistory();
  };

  const handleExportLocalHistoryCSV = () => {
    serviceExportLocalHistoryCSV();
  };

  const renderExplicitTimeCapBlock = (
    schemeText: string,
    blockType: "warmup" | "strength" | "metcon" | "accessories",
    isColumns = false,
  ) => {
    if (!schemeText) return null;

    let summaryText = schemeText.trim();

    // Helper functions for common shortening
    const cleanStr = (s: string) =>
      s
        .replace(/MINUTOS|MINS/gi, "MIN")
        .replace(/SEGUNDOS|SECS/gi, "SEG")
        .replace(/RONDAS/gi, "RONDAS")
        .replace(/SERIES/gi, "SERIES");

    let mainText = cleanStr(summaryText);
    let restText = "";

    // 1. Separate Rest/Pausa/Descanso text to a secondary line
    if (mainText.includes("|")) {
      const parts = mainText.split("|");
      mainText = parts[0].trim();
      restText = parts.slice(1).join(" | ").trim();
    } else {
      const restRegex =
        /\b(\d+["']?\s*(?:S|SEG|SECS|SEGUNDOS|M|MIN)?\s*(?:REST|PAUSA|DESCANSO).*)|(?:REST|PAUSA|DESCANSO)\b(.*)/i;
      const match = mainText.match(restRegex);
      if (match) {
        restText = match[0].trim();
        mainText = mainText.replace(restRegex, "").trim();
      }
    }

    // Clean up trailing/leading junk from maintext
    mainText = mainText.replace(/(^[-/,]+|[-/,]+$)/g, "").trim();

    const mainTextUpper = mainText.toUpperCase();
    const restTextUpper = restText.toUpperCase();
    const hasCap =
      /(?:CAP|TIME CAP|TC)\s*\d+/i.test(mainTextUpper) ||
      /(?:CAP|TIME CAP|TC)\s*\d+/i.test(restTextUpper);

    // 2. Default Time Caps injected as secondary text if missing and needed
    if (blockType === "warmup") {
      if (!hasCap && !mainTextUpper.includes("MIN")) {
        restText += (restText ? " | " : "") + "10 MIN CAP";
      }
    } else if (blockType === "strength") {
      if (!hasCap) {
        restText += (restText ? " | " : "") + "15 MIN CAP";
      }
      if (
        !restTextUpper.includes("DESCANSO") &&
        !mainTextUpper.includes("DESCANSO") &&
        !restTextUpper.includes("REST") &&
        !mainTextUpper.includes("REST") &&
        !mainTextUpper.includes("PAUSA") &&
        !restTextUpper.includes("PAUSA")
      ) {
        restText +=
          (restText ? " | " : "") + "DESCANSO ENTRE SERIES: 90S - 120S";
      }
    } else if (blockType === "metcon") {
      if (
        !mainTextUpper.includes("AMRAP") &&
        !mainTextUpper.includes("FOR TIME") &&
        !mainTextUpper.includes("EMOM") &&
        !mainTextUpper.includes("TABATA")
      ) {
        if (mainTextUpper.includes("RONDAS")) {
          mainText = `FOR TIME: ${mainText}`;
        }
      }
      if (!hasCap && !mainTextUpper.includes("MIN")) {
        restText += (restText ? " | " : "") + "15 MIN CAP";
      }
    } else if (blockType === "accessories") {
      if (!hasCap) {
        restText += (restText ? " | " : "") + "12 MIN CAP";
      }
      if (
        !restTextUpper.includes("DESCANSO") &&
        !mainTextUpper.includes("DESCANSO") &&
        !restTextUpper.includes("REST") &&
        !mainTextUpper.includes("REST") &&
        !mainTextUpper.includes("PAUSA") &&
        !restTextUpper.includes("PAUSA")
      ) {
        restText +=
          (restText ? " | " : "") + "DESCANSO ENTRE SERIES: 60S - 90S";
      }
    }

    return (
      <div
        style={{ ...midBandColor.bgStyle, color: midBandColor.text }}
        className={`px-3 py-2 font-mono flex flex-col justify-center w-full min-h-[48px] uppercase select-none shadow-[inset_0_2px_4px_rgba(255,255,255,0.25)] rounded-none text-center leading-tight gap-0.5`}
      >
        <span
          className={`font-sans font-black tracking-wide uppercase ${
            isColumns
              ? "text-[11px] xl:text-[12px]"
              : "text-[13px] md:text-[14px] lg:text-[15px]"
          } drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]`}
          title={mainText}
        >
          {mainText}
        </span>
        {restText && (
          <span
            className={`font-sans font-bold tracking-widest uppercase opacity-90 ${
              isColumns
                ? "text-[8.5px] xl:text-[9px]"
                : "text-[9.5px] md:text-[10px] lg:text-[11px]"
            }`}
          >
            {restText}
          </span>
        )}
      </div>
    );
  };

  const renderExportCustomizationPanel = () => {
    return (
      <ExportCustomizationPanel
        exportBgImage={exportBgImage}
        setExportBgImage={setExportBgImage}
        exportLayout={exportLayout}
        setExportLayout={setExportLayout}
        exportVerticalLayout={exportVerticalLayout}
        setExportVerticalLayout={setExportVerticalLayout}
        exportCardWidth={exportCardWidth}
        setExportCardWidth={setExportCardWidth}
        exportAthleteName={exportAthleteName}
        setExportAthleteName={setExportAthleteName}
        exportInspiration={exportInspiration}
        setExportInspiration={setExportInspiration}
        exportCardBlur={exportCardBlur}
        setExportCardBlur={setExportCardBlur}
        exportCardOpacity={exportCardOpacity}
        setExportCardOpacity={setExportCardOpacity}
        exportOverlayImage={exportOverlayImage}
        setExportOverlayImage={setExportOverlayImage}
        exportOverlayX={exportOverlayX}
        setExportOverlayX={setExportOverlayX}
        exportOverlayY={exportOverlayY}
        setExportOverlayY={setExportOverlayY}
        exportOverlayScale={exportOverlayScale}
        setExportOverlayScale={setExportOverlayScale}
        exportOverlayZ={exportOverlayZ}
        setExportOverlayZ={setExportOverlayZ}
        exportCardHeightLimit={exportCardHeightLimit}
        setExportCardHeightLimit={setExportCardHeightLimit}
        handleOverlayImageUpload={handleOverlayImageUpload}
      />
    );
  };

  const renderWarmupBlock = (isColumns = false) => {
    return (
      <WorkoutBlockCard
        blockType="warmup"
        activeVariation={activeVariation!}
        activeDay={activeDay}
        isColumns={isColumns}
        enableThemedBackgrounds={enableThemedBackgrounds}
        backgroundImage={warmupBg}
        icon={svgIcons.warmup}
        globalRpeAvg={globalRpeAvg}
        teamSize={teamSize}
        currentVariationIndex={currentVariationIndex}
        formatItemWithTeamVolume={formatItemWithTeamVolume}
        renderExplicitTimeCapBlock={renderExplicitTimeCapBlock}
        handleVariationTouchStart={handleVariationTouchStart}
        handleVariationTouchMove={handleVariationTouchMove}
        handleVariationTouchEnd={handleVariationTouchEnd}
      />
    );
  };

  const renderStrengthBlock = (isColumns = false) => {
    return (
      <WorkoutBlockCard
        blockType="strength"
        activeVariation={activeVariation!}
        activeDay={activeDay}
        isColumns={isColumns}
        enableThemedBackgrounds={enableThemedBackgrounds}
        backgroundImage={strengthBg}
        icon={svgIcons.strength}
        globalRpeAvg={globalRpeAvg}
        teamSize={teamSize}
        currentVariationIndex={currentVariationIndex}
        formatItemWithTeamVolume={formatItemWithTeamVolume}
        renderExplicitTimeCapBlock={renderExplicitTimeCapBlock}
        handleVariationTouchStart={handleVariationTouchStart}
        handleVariationTouchMove={handleVariationTouchMove}
        handleVariationTouchEnd={handleVariationTouchEnd}
        isHistoryExpanded={expandedBlockHistory.strength}
        onToggleHistory={() =>
          setExpandedBlockHistory((prev) => ({
            ...prev,
            strength: !prev.strength,
          }))
        }
      />
    );
  };

  const renderMetconBlock = (isColumns = false) => {
    return (
      <WorkoutBlockCard
        blockType="metcon"
        activeVariation={activeVariation!}
        activeDay={activeDay}
        isColumns={isColumns}
        enableThemedBackgrounds={enableThemedBackgrounds}
        backgroundImage={metconBg}
        icon={svgIcons.metcon}
        globalRpeAvg={globalRpeAvg}
        teamSize={teamSize}
        currentVariationIndex={currentVariationIndex}
        formatItemWithTeamVolume={formatItemWithTeamVolume}
        renderExplicitTimeCapBlock={renderExplicitTimeCapBlock}
        handleVariationTouchStart={handleVariationTouchStart}
        handleVariationTouchMove={handleVariationTouchMove}
        handleVariationTouchEnd={handleVariationTouchEnd}
        isHistoryExpanded={expandedBlockHistory.metcon}
        onToggleHistory={() =>
          setExpandedBlockHistory((prev) => ({
            ...prev,
            metcon: !prev.metcon,
          }))
        }
      />
    );
  };

  const renderAccessoriesBlock = (isColumns = false) => {
    return (
      <WorkoutBlockCard
        blockType="accessories"
        activeVariation={activeVariation!}
        activeDay={activeDay}
        isColumns={isColumns}
        enableThemedBackgrounds={enableThemedBackgrounds}
        backgroundImage={accessoriesBg}
        icon={svgIcons.accessories}
        globalRpeAvg={globalRpeAvg}
        teamSize={teamSize}
        currentVariationIndex={currentVariationIndex}
        formatItemWithTeamVolume={formatItemWithTeamVolume}
        renderExplicitTimeCapBlock={renderExplicitTimeCapBlock}
        handleVariationTouchStart={handleVariationTouchStart}
        handleVariationTouchMove={handleVariationTouchMove}
        handleVariationTouchEnd={handleVariationTouchEnd}
        isHistoryExpanded={expandedBlockHistory.accessories}
        onToggleHistory={() =>
          setExpandedBlockHistory((prev) => ({
            ...prev,
            accessories: !prev.accessories,
          }))
        }
      />
    );
  };


  return (
    <div
      style={
        {
          "--color-electric-blue": activeColorSet.color,
          "--shadow-blue-glow": activeColorSet.shadow,
          "--header-height": `${headerHeight}px`,
          paddingTop: `calc(${headerHeight}px + env(safe-area-inset-top, 0px))`, // Explicit pt-safe padding calculation preventing menu overlaps and including env(safe-area-inset-top)
        } as React.CSSProperties
      }
      className="text-white font-sans min-h-screen flex flex-col app-content-wrapper select-none relative overflow-x-clip pt-safe"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Confetti trigger={confettiTrigger} />
      <AnimatePresence>
        {activeAchievement && (
          <AchievementNotification
            achievement={activeAchievement}
            onClose={() => setActiveAchievement(null)}
          />
        )}
      </AnimatePresence>
      <NavigationHeader
        activeSheet={activeSheet}
        setActiveSheet={handleSetActiveSheetWithDirection}
        syncWithRealTime={syncWithRealTime}
        currentWeek={currentWeek}
        realTime={realTime}
        handleToggleSync={handleToggleSync}
        activeDayName={activeWeekPlan?.days[currentDayIndex]?.name}
        setShowProfileModal={setShowProfileModal}
        onHeightChange={setHeaderHeight}
      />

      {/* Dynamic Lightning Flash Overlay */}
      <AnimatePresence>
        {lightningFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.95, 0.4, 1, 0],
              backgroundColor: [
                "rgba(251,191,36,0)",
                "rgba(251,191,36,0.95)",
                "rgba(34,212,238,0.9)",
                "rgba(255,255,255,1)",
                "rgba(0,0,0,0)",
              ],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] pointer-events-none flex flex-col items-center justify-center border-[20px] border-amber-400"
          >
            <div className="text-center text-black font-mono select-none drop-shadow-sm filter p-8 bg-amber-400 border-4 border-black rotate-[-2deg] max-w-lg mx-4">
              <div className="text-8xl md:text-9xl">⚡</div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mt-4">
                NUEVO PR REGISTRADO
              </h2>
              <p className="text-sm md:text-md font-bold font-mono tracking-widest mt-2 uppercase bg-black text-white px-4 py-1.5 inline-block">
                SISTEMA VALIDADO • CAPACIDAD INCREMENTADA
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic hot brutalist backstripe column inside the board canvas with color matching the active week */}
      <div
        aria-hidden="true"
        className={`fixed top-0 bottom-0 left-[43%] w-[14%] -z-10 opacity-20 pointer-events-none select-none transition-all duration-500 ${activeBgColorClass}`}
      />

      {/* 1. WEEK SELECTION HORIZONTAL BAR */}
      <div className="w-full bg-white/5 backdrop-blur-md border-y border-white/10 mb-2 no-print">
        <div className="mx-auto px-6 md:px-10 flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-4">
          <div
            id="weekNav"
            className="flex gap-4 overflow-x-auto scrollbar-hide text-3xl"
          >
            {["w1", "w2", "w3", "w4"].map((w) => {
              const isActive = w === currentWeek;
              return (
                <button
                  key={w}
                  className={`px-4 py-2 border-b-4 transition-all font-brutalist tracking-[0.15em] text-xl cursor-pointer ${
                    isActive
                      ? "text-electric-blue border-electric-blue font-black shadow-[0_4px_10px_rgba(0,212,255,0.4)]"
                      : "text-white/80 border-transparent hover:text-white hover:border-white/40"
                  }`}
                  onClick={() => {
                    setSyncWithRealTime(false);
                    localStorage.setItem("nexus_sync_real_time", "false");
                    setCurrentWeek(w);
                  }}
                >
                  SEM {w.replace("w", "")}
                </button>
              );
            })}
          </div>

          {/* EXPORT ROW */}
          <div className="flex gap-2 w-full sm:w-auto h-full items-center justify-start sm:justify-end shrink-0">
            {/* TEXT EXPORT TRIGGER */}
            <button
              onClick={handleMonthTextExport}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 text-white border border-transparent rounded shadow-sm hover:shadow-sm active:scale-95 transition-all text-[11px] sm:text-xs font-brutalist tracking-wider font-extrabold uppercase shrink-0 cursor-pointer self-start sm:self-auto"
              title="Exportar programa completo del mes a archivo de texto (TXT) para auditar"
            >
              <FileText size={14} className="text-zinc-400" />
              <span className="hidden sm:inline">TXT MES</span>
            </button>

            {/* GOOGLE SHEETS EXPORT TRIGGER */}
            <button
              onClick={handleExportGoogleSheets}
              disabled={isExportingSheets}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white border border-transparent rounded shadow-sm hover:shadow-sm active:scale-95 transition-all text-[11px] sm:text-xs font-brutalist tracking-wider font-extrabold uppercase shrink-0 cursor-pointer self-start sm:self-auto"
              title="Sincronizar programación y resultados con Google Sheets"
            >
              <Upload size={14} className={isExportingSheets ? 'animate-bounce text-[#a7f3d0]' : 'text-[#a7f3d0]'} />
              <span>{isExportingSheets ? 'SINC. SHEETS...' : 'SYNC SHEETS'}</span>
            </button>

            {/* BATCH WEEK PDF EXPORT TRIGGER */}
            <button
              id="btn-quick-pdf"
              onClick={handleBatchPDFExport}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white border border-transparent rounded shadow-sm hover:shadow-sm active:scale-95 transition-all text-[11px] sm:text-xs font-brutalist tracking-wider font-extrabold uppercase shrink-0 cursor-pointer self-start sm:self-auto"
              title="Exportar reporte consolidado de toda la semana de entrenamiento actual a PDF con distribución de RPE"
            >
              <FileText size={14} className=" text-[#00f0ff]" />
              <span>EXPORTAR SEMANA</span>
            </button>
          </div>
        </div>
      </div>

      {/* FLOATING NEXT/PREV NAVIGATION BUTTONS (DESKTOP ONLY) */}
      <div className="hidden lg:block no-print">
        <button
          onClick={handlePrevSheet}
          className="fixed left-4 top-1/2 -translate-y-1/2 z-45 bg-[#0A0A0E]/90 hover:bg-electric-blue/20 border-2 border-white/10 hover:border-electric-blue text-white rounded-full p-3.5 shadow-lg active:scale-90 transition-all cursor-pointer group  shadow-sm"
          title="Ver pantalla anterior (Deslizar Izquierda)"
        >
          <ChevronLeft
            size={22}
            className="group-hover:text-electric-blue transition-colors"
          />
        </button>
        <button
          onClick={handleNextSheet}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-45 bg-[#0A0A0E]/90 hover:bg-electric-blue/20 border-2 border-white/10 hover:border-electric-blue text-white rounded-full p-3.5 shadow-lg active:scale-90 transition-all cursor-pointer group  shadow-sm"
          title="Ver pantalla siguiente (Deslizar Derecha)"
        >
          <ChevronRight
            size={22}
            className="group-hover:text-electric-blue transition-colors"
          />
        </button>
      </div>

      {/* THREE INTERACTIVE SHEETS CONTAINER */}
      <AnimatePresence mode="wait">
        {activeSheet === 0 && (
          <motion.div
            key="sheet-workout"
            initial={{
              opacity: 0,
              x: transitionDirection === "right" ? 300 : -300,
            }}
            animate={{ opacity: 1, x: 0 }}
            exit={{
              opacity: 0,
              x: transitionDirection === "right" ? -300 : 300,
            }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="flex-grow flex flex-col"
          >
            {/* 2. DAY SELECTION FILTER CHIPS */}
            <div className="w-full bg-white/5 backdrop-blur-md mb-2 md:mb-4 no-print relative border-b border-white/5">
              {/* Degradiente inferior indicando colores de la semana al deslizador de abajo */}
              <div
                className="absolute bottom-0 left-0 right-0 h-1 z-0 shadow-sm"
                style={{
                  background: `linear-gradient(90deg, ${midBandColor.bg} 0%, ${activeColorSet.color} 100%)`,
                }}
              />
              <div className="mx-auto px-6 md:px-10 relative z-10">
                <div
                  id="dayNav"
                  className="flex gap-2 overflow-x-auto py-3 scrollbar-hide text-xl"
                >
                  {activeWeekPlan?.days.map((day, idx) => {
                    const isCompleted = completedDays[day.id];
                    const isActive = idx === currentDayIndex;

                    let statusClass =
                      "text-white/70 hover:bg-white/10 hover:text-white bg-white/5";
                    let activeStyle = {};
                    if (isCompleted) {
                      statusClass =
                        "text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-100 bg-emerald-500/5";
                    }
                    if (isActive) {
                      if (isCompleted) {
                        statusClass = "bg-emerald-500 text-black font-black";
                      } else {
                        statusClass = "text-black font-black shadow-md";
                        activeStyle = {
                          background: `linear-gradient(135deg, ${midBandColor.bg} 0%, ${activeColorSet.color} 100%)`,
                          boxShadow: `0 0 15px ${activeColorSet.color}60`,
                        };
                      }
                    }

                    return (
                      <button
                        key={day.id}
                        className={`px-5 py-2.5 rounded-none font-brutalist text-lg tracking-[0.2em] transition-all cursor-pointer ${statusClass}`}
                        style={activeStyle}
                        onClick={() => {
                          setSyncWithRealTime(false);
                          localStorage.setItem("nexus_sync_real_time", "false");
                          setCurrentDayIndex(idx);
                        }}
                      >
                        {day.name.charAt(0)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3. HERO WHITEBOARD HEADER */}
            {activeDay && (
              <header
                className="mb-2 text-center flex flex-col justify-center items-center relative"
                data-purpose="page-title"
              >
                <div className="absolute top-0 opacity-20 pointer-events-none w-full h-full flex justify-center items-center -z-10">
                   <img src="/emblema.jpg" alt="Emblema de Halterofilia L4" className="w-64 h-64 md:w-96 md:h-96 object-cover rounded-full blur-sm" />
                </div>
                <div className="mb-2 md:mb-4 z-10">
                   <img src="/emblema.jpg" alt="Emblema PRVN L4" className="w-20 h-20 md:w-28 md:h-28 object-cover rounded-full border-2 border-electric-blue/50 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all hover:scale-105" />
                </div>
                <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] 2xl:text-[11rem] font-black tracking-tighter leading-none uppercase flex flex-wrap justify-center items-center gap-x-4 transition-all duration-300 min-h-[5.5rem] md:min-h-[7rem] z-10">
                  <span>{activeDay.name}</span>
                  <span className="align-middle text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-electric-blue">
                    ✦
                  </span>
                  {isEditingName ? (
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onBlur={saveName}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveName();
                        if (e.key === "Escape") setIsEditingName(false);
                      }}
                      className="bg-zinc-900 text-white border-2 border-electric-blue font-brutalist text-5xl sm:text-6xl md:text-7xl uppercase px-4 py-1.5 focus:outline-none text-center max-w-[480px] shadow-blue-glow inline-block"
                      autoFocus
                    />
                  ) : (
                    <span
                      className="text-white hover:text-electric-blue cursor-pointer transition-all relative group inline-flex items-center gap-2 border-0"
                      onClick={startEditingName}
                      title="Haz clic para cambiar nombre de atleta"
                    >
                      <span>{athlete.identity}</span>
                      <span className="text-2xl md:text-3xl text-electric-blue opacity-50 group-hover:opacity-100 transition-opacity">
                        ✎
                      </span>
                    </span>
                  )}
                </h1>
              </header>
            )}

            {/* STICKY DAY TITLE WRAPPER WITH REACTIVE BRUTALIST BACKDROP */}
            <ActiveDayHeader
              activeDay={activeDay}
              completedDays={completedDays}
              headerHeight={headerHeight}
              mousePos={mousePos}
              setMousePos={setMousePos}
              scrollY={scrollY}
              isIntroGlitching={isIntroGlitching}
              dayTitleAlertTrigger={dayTitleAlertTrigger}
            />

            {/* HERO WHITEBOARD SUBHEADER & GOAL */}
            {activeDay && (
              <div
                className="mb-6 md:mb-10 text-center flex flex-col justify-center items-center"
                data-purpose="page-sub-title"
              >
                <div
                  id="uiWeekIndicator"
                  className="text-xs sm:text-sm md:text-base lg:text-lg text-white/95 font-bold tracking-[0.25em] mt-5 md:mt-8 font-condensed inline-block border-y border-white/25 py-2 px-8 bg-pure-black/70"
                >
                  ACTO I • SEMANA {currentWeek.replace("w", "")} •{" "}
                  {currentWeek === "w1"
                    ? "ACUMULACIÓN"
                    : currentWeek === "w2"
                      ? "INTENSIFICACIÓN"
                      : currentWeek === "w3"
                        ? "PEAK WEEK / ÁPEX"
                        : "DELOAD / DESCARGA"}
                </div>

                <DailyMissionPanel
                  dayId={activeDay.id}
                  dailyGoalText={dailyGoals[activeDay.id] || ""}
                  isGeneratingQuest={isGeneratingQuest}
                  sideQuestCompleted={!!sideQuests[activeDay.id]?.completed}
                  questData={sideQuests[activeDay.id]}
                  rewards={getDayReward(activeDay.id)}
                  isHelpOpen={isHelpOpen}
                  setIsHelpOpen={setIsHelpOpen}
                  dayTitleAlertTrigger={dayTitleAlertTrigger}
                  handleFetchSideQuest={handleFetchSideQuest}
                  handleResetQuest={handleResetQuest}
                  mousePos={mousePos}
                />
              </div>
            )}

            {/* 4. SUB-TABS (VARIATIONS & DESKTOP LAYOUT CONTROL) */}
            {activeDay && (
              <div
                id="tabContainer"
                className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center max-w-7xl mx-auto w-full px-6 md:px-10 no-print"
              >
                {/* Variations Selector Tabs */}
                <div className="flex gap-2.5 flex-wrap justify-center md:justify-start">
                  {activeDay.variations.length > 1 &&
                    activeDay.variations.map((v, idx) => {
                      const isActive = idx === currentVariationIndex;
                      const tabBrand = resolveBlockBrand(
                        v.tabName,
                        v.warmup?.title || "",
                        v.warmup?.items || [],
                      );
                      let shortTag = "";
                      if (tabBrand.emblem.includes("HAEDO"))
                        shortTag = "🪣 HAEDO";
                      else if (tabBrand.emblem.includes("MAYHEM"))
                        shortTag = "🔥 MAYHEM";
                      else if (tabBrand.emblem.includes("HWPO"))
                        shortTag = "⛓️ HWPO";
                      else shortTag = "🧬 PRVN";
                      return (
                        <button
                          key={idx}
                          className={`tab-btn ${isActive ? "active" : ""} flex items-center gap-1.5`}
                          onClick={() => setCurrentVariationIndex(idx)}
                          id={`tab_variation_btn_${idx}`}
                        >
                          <span>{v.tabName}</span>
                          <span
                            className={`text-[7px] px-1 py-0.5 rounded font-mono font-black tracking-tighter ${
                              isActive
                                ? "bg-black/40 text-[#00f0ff] border border-[#00f0ff]/35"
                                : "bg-white/5 text-neutral-400 border border-transparent"
                            }`}
                          >
                            {shortTag}
                          </span>
                        </button>
                      );
                    })}
                </div>

                {/* Desktop Layout Switcher - Elegant Minimalist Pill Segmented Control */}
                <div className="flex bg-[#000000]/40 rounded-full p-0.5 select-none shadow-[rgba(0,0,0,0.4)_0px_2px_8px] no-print">
                  <button
                    type="button"
                    onClick={() => {
                      setDesktopLayout("sidebar");
                      localStorage.setItem("nexus_desktop_layout", "sidebar");
                    }}
                    className={`px-3 py-1.5 rounded-full text-[9px] font-mono font-black tracking-widest uppercase transition-all duration-250 flex items-center gap-1.5 cursor-pointer ${
                      desktopLayout === "sidebar"
                        ? "bg-electric-blue text-black font-black shadow-sm"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    <LayoutDashboard size={10} className="shrink-0" />
                    <span>SIDEBAR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDesktopLayout("columns");
                      localStorage.setItem("nexus_desktop_layout", "columns");
                    }}
                    className={`px-3 py-1.5 rounded-full text-[9px] font-mono font-black tracking-widest uppercase transition-all duration-250 flex items-center gap-1.5 cursor-pointer ${
                      desktopLayout === "columns"
                        ? "bg-electric-blue text-black font-black shadow-sm"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    <Columns size={10} className="shrink-0" />
                    <span>4 COLUMNAS</span>
                  </button>
                </div>
              </div>
            )}

            {/* 5. MAIN BOARD BRUTALIST GRID */}
            <div className="w-full px-6 md:px-10 flex flex-col flex-grow">
              {activeVariation ? (
                desktopLayout === "sidebar" ? (
                  <div className="w-full flex-grow max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 md:gap-8 items-start relative select-none">
                    {/* SIDEBAR DE BLOQUES EN COMPUTADORAS / BARRA DE TABS EN MÓVILES */}
                    <aside className="w-full lg:w-72 shrink-0 space-y-3 no-print">
                      <div className="text-[10px] font-mono tracking-widest text-[#00f0ff] uppercase pb-2 mb-3 flex justify-between items-center">
                        <span>// SESIÓN DE ENTRENAMIENTO</span>
                        <span>[4 BLOQUES]</span>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3">
                        <button
                          onClick={() => setActiveBlockTab("warmup")}
                          className={`group w-full text-left p-3.5 sm:p-4 border transition-all duration-200 uppercase relative overflow-hidden cursor-pointer rounded-xs ${
                            activeBlockTab === "warmup"
                              ? "border-electric-blue bg-electric-blue/15 text-white shadow-sm"
                              : "border-white/10 hover:border-white/30 bg-[#000000]/60 text-neutral-400 hover:text-white"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1 font-brutalist">
                            <span
                              className={`text-xs sm:text-[14px] font-extrabold tracking-wider ${activeBlockTab === "warmup" ? "text-electric-blue" : "text-neutral-300 group-hover:text-white"}`}
                            >
                              01. CALENTAMIENTO
                            </span>
                            <span className="text-[8.5px] font-mono tracking-tight shrink-0 bg-white/10 px-1.5 py-0.5 rounded font-extrabold text-neutral-300">
                              {activeVariation.warmup.items.length} MOV.
                            </span>
                          </div>
                          <div className="text-[9px] font-mono truncate text-neutral-500 group-hover:text-neutral-400 tracking-wider">
                            {activeVariation.warmup.title || "Preparación"}
                          </div>

                          {/* COMPACT LIST OF EXERCISES inside the sidebar tab button */}
                          <div className="mt-2.5 pt-2 border-t border-white/5 space-y-1 hidden lg:block">
                            {activeVariation.warmup.items
                              .slice(0, 5)
                              .map((item, idx) => (
                                <div
                                  key={idx}
                                  className="text-[8.5px] text-neutral-400 group-hover:text-neutral-300 font-condensed tracking-wide flex items-center gap-1.5 normal-case truncate"
                                  title={getCompactSidebarText(item)}
                                >
                                  <span className="w-1 h-1 rounded-full bg-electric-blue shrink-0 " />
                                  <span className="truncate">
                                    {getCompactSidebarText(item)}
                                  </span>
                                </div>
                              ))}
                            {activeVariation.warmup.items.length > 5 && (
                              <div className="text-[7.5px] text-neutral-500 font-mono tracking-tight pt-0.5 pl-2 uppercase text-left">
                                + {activeVariation.warmup.items.length - 5}{" "}
                                más...
                              </div>
                            )}
                          </div>

                          {activeBlockTab === "warmup" && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-electric-blue" />
                          )}
                        </button>

                        <button
                          onClick={() => setActiveBlockTab("strength")}
                          className={`group w-full text-left p-3.5 sm:p-4 border transition-all duration-200 uppercase relative overflow-hidden cursor-pointer rounded-xs ${
                            activeBlockTab === "strength"
                              ? "border-[#ff0055] bg-[#ff0055]/15 text-white shadow-sm"
                              : "border-white/10 hover:border-white/30 bg-[#000000]/60 text-neutral-400 hover:text-white"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1 font-brutalist">
                            <span
                              className={`text-xs sm:text-[14px] font-extrabold tracking-wider ${activeBlockTab === "strength" ? "text-[#ff0055]" : "text-neutral-300 group-hover:text-white"}`}
                            >
                              02. FUERZA / OLY
                            </span>
                            <span className="text-[8.5px] font-mono tracking-tight shrink-0 bg-white/10 px-1.5 py-0.5 rounded font-extrabold text-neutral-300">
                              {activeVariation.strength.items.length} MOVS.
                            </span>
                          </div>
                          <div className="text-[9px] font-mono truncate text-neutral-500 group-hover:text-neutral-400 tracking-wider">
                            {activeVariation.strength.title || "Desarrollo"}
                          </div>

                          {/* COMPACT LIST OF EXERCISES inside the sidebar tab button */}
                          <div className="mt-2.5 pt-2 border-t border-white/5 space-y-1 hidden lg:block">
                            {activeVariation.strength.items
                              .slice(0, 5)
                              .map((item, idx) => (
                                <div
                                  key={idx}
                                  className="text-[8.5px] text-neutral-400 group-hover:text-neutral-300 font-condensed tracking-wide flex items-center gap-1.5 normal-case truncate"
                                  title={getCompactSidebarText(item)}
                                >
                                  <span className="w-1 h-1 rounded-full bg-[#ff0055] shrink-0 " />
                                  <span className="truncate">
                                    {getCompactSidebarText(item)}
                                  </span>
                                </div>
                              ))}
                            {activeVariation.strength.items.length > 5 && (
                              <div className="text-[7.5px] text-neutral-500 font-mono tracking-tight pt-0.5 pl-2 uppercase text-left">
                                + {activeVariation.strength.items.length - 5}{" "}
                                más...
                              </div>
                            )}
                          </div>

                          {activeBlockTab === "strength" && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff0055]" />
                          )}
                        </button>

                        <button
                          onClick={() => setActiveBlockTab("metcon")}
                          className={`group w-full text-left p-3.5 sm:p-4 border transition-all duration-200 uppercase relative overflow-hidden cursor-pointer rounded-xs ${
                            activeBlockTab === "metcon"
                              ? "border-[#00f0ff] bg-[#00f0ff]/15 text-white shadow-sm"
                              : "border-white/10 hover:border-white/30 bg-[#000000]/60 text-neutral-400 hover:text-white"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1 font-brutalist">
                            <span
                              className={`text-xs sm:text-[14px] font-extrabold tracking-wider ${activeBlockTab === "metcon" ? "text-[#00f0ff]" : "text-neutral-300 group-hover:text-white"}`}
                            >
                              03. METCON / WOD
                            </span>
                            <span className="text-[8.5px] font-mono tracking-tight shrink-0 bg-white/10 px-1.5 py-0.5 rounded font-extrabold text-neutral-300">
                              {activeVariation.metcon.items.length} MOVS.
                            </span>
                          </div>
                          <div className="text-[9px] font-mono truncate text-neutral-500 group-hover:text-neutral-400 tracking-wider">
                            {activeVariation.metcon.title || "Metcon"}
                          </div>

                          {/* COMPACT LIST OF EXERCISES inside the sidebar tab button */}
                          <div className="mt-2.5 pt-2 border-t border-white/5 space-y-1 hidden lg:block">
                            {activeVariation.metcon.items
                              .slice(0, 5)
                              .map((item, idx) => (
                                <div
                                  key={idx}
                                  className="text-[8.5px] text-neutral-400 group-hover:text-neutral-300 font-condensed tracking-wide flex items-center gap-1.5 normal-case truncate"
                                  title={getCompactSidebarText(item)}
                                >
                                  <span className="w-1 h-1 rounded-full bg-[#00f0ff] shrink-0 " />
                                  <span className="truncate">
                                    {getCompactSidebarText(item)}
                                  </span>
                                </div>
                              ))}
                            {activeVariation.metcon.items.length > 5 && (
                              <div className="text-[7.5px] text-neutral-500 font-mono tracking-tight pt-0.5 pl-2 uppercase text-left">
                                + {activeVariation.metcon.items.length - 5}{" "}
                                más...
                              </div>
                            )}
                          </div>

                          {activeBlockTab === "metcon" && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00f0ff]" />
                          )}
                        </button>

                        <button
                          onClick={() => setActiveBlockTab("accessories")}
                          className={`group w-full text-left p-3.5 sm:p-4 border transition-all duration-200 uppercase relative overflow-hidden cursor-pointer rounded-xs ${
                            activeBlockTab === "accessories"
                              ? "border-[#a124ff] bg-[#a124ff]/15 text-white shadow-sm"
                              : "border-white/10 hover:border-white/30 bg-[#000000]/60 text-neutral-400 hover:text-white"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1 font-brutalist">
                            <span
                              className={`text-xs sm:text-[14px] font-extrabold tracking-wider ${activeBlockTab === "accessories" ? "text-[#a124ff]" : "text-neutral-300 group-hover:text-white"}`}
                            >
                              04. ACCESORIOS / ACC
                            </span>
                            <span className="text-[8.5px] font-mono tracking-tight shrink-0 bg-white/10 px-1.5 py-0.5 rounded font-extrabold text-neutral-300">
                              {activeVariation.accessories.items.length} MOVS.
                            </span>
                          </div>
                          <div className="text-[9px] font-mono truncate text-neutral-500 group-hover:text-neutral-400 tracking-wider">
                            {activeVariation.accessories.title || "Longevidad"}
                          </div>

                          {/* COMPACT LIST OF EXERCISES inside the sidebar tab button */}
                          <div className="mt-2.5 pt-2 border-t border-white/5 space-y-1 hidden lg:block">
                            {activeVariation.accessories.items
                              .slice(0, 5)
                              .map((item, idx) => (
                                <div
                                  key={idx}
                                  className="text-[8.5px] text-neutral-400 group-hover:text-neutral-300 font-condensed tracking-wide flex items-center gap-1.5 normal-case truncate"
                                  title={getCompactSidebarText(item)}
                                >
                                  <span className="w-1 h-1 rounded-full bg-[#a124ff] shrink-0 " />
                                  <span className="truncate">
                                    {getCompactSidebarText(item)}
                                  </span>
                                </div>
                              ))}
                            {activeVariation.accessories.items.length > 5 && (
                              <div className="text-[7.5px] text-neutral-500 font-mono tracking-tight pt-0.5 pl-2 uppercase text-left">
                                + {activeVariation.accessories.items.length - 5}{" "}
                                más...
                              </div>
                            )}
                          </div>

                          {activeBlockTab === "accessories" && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#a124ff]" />
                          )}
                        </button>
                      </div>
                    </aside>

                    {/* CONTENEDOR PRINCIPAL DEL BLOQUE ACTIVO */}
                    <div
                      className="flex-grow w-full h-full min-h-[420px] transition-all duration-300"
                      id="workoutBoard"
                    >
                      <AnimatePresence mode="wait">
                        {activeBlockTab === "warmup" && (
                          <motion.div
                            key="warmup"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="h-full"
                          >
                            {renderWarmupBlock()}
                          </motion.div>
                        )}
                        {activeBlockTab === "strength" && (
                          <motion.div
                            key="strength"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="h-full"
                          >
                            {renderStrengthBlock()}
                          </motion.div>
                        )}
                        {activeBlockTab === "metcon" && (
                          <motion.div
                            key="metcon"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="h-full"
                          >
                            {renderMetconBlock()}
                          </motion.div>
                        )}
                        {activeBlockTab === "accessories" && (
                          <motion.div
                            key="accessories"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="h-full"
                          >
                            {renderAccessoriesBlock()}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* DYNAMIC COMPLETION TOGGLE FOR THE ACTIVE DAY */}
                      {activeDay && (
                        <div className="mt-6 flex flex-col sm:flex-row gap-4 no-print w-full">
                          <motion.button
                            whileHover={{ scale: 1.015 }}
                            whileTap={{ scale: 0.985 }}
                            onClick={() => toggleDayCompleted(activeDay.id)}
                            className={`flex-grow status-btn flex items-center justify-center gap-2.5 ${completedDays[activeDay.id] ? "completed shadow-sm border border-emerald-400/50" : ""}`}
                          >
                            {completedDays[activeDay.id] ? (
                              <motion.span
                                initial={{ scale: 0.85, rotate: -15 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="flex items-center gap-2 justify-center relative"
                              >
                                <BadgeCheck
                                  size={24}
                                  className="text-zinc-950 shrink-0 "
                                />
                                <span className="font-extrabold text-zinc-950 tracking-wider">
                                  MISIÓN COMPLETA (COMPLETADO)
                                </span>

                                {showBlastId === activeDay.id && (
                                  <motion.div
                                    className="absolute inset-0 m-auto w-full h-full rounded bg-emerald-300 pointer-events-none"
                                    initial={{ scale: 1, opacity: 0.8 }}
                                    animate={{ scale: 2.5, opacity: 0 }}
                                    transition={{
                                      duration: 0.6,
                                      ease: "easeOut",
                                    }}
                                  />
                                )}
                                {showBlastId === activeDay.id && (
                                  <motion.div
                                    className="absolute inset-0 m-auto w-full h-full rounded bg-white pointer-events-none"
                                    initial={{ scale: 0.5, opacity: 1 }}
                                    animate={{ scale: 3.5, opacity: 0 }}
                                    transition={{
                                      duration: 0.8,
                                      ease: "easeOut",
                                      delay: 0.1,
                                    }}
                                  />
                                )}
                              </motion.span>
                            ) : (
                              <span className="font-extrabold tracking-wider">
                                MARCAR DÍA COMO COMPLETADO
                              </span>
                            )}
                          </motion.button>

                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={exportFileInputRef}
                            onChange={handleBgImageUpload}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              exportFileInputRef.current?.click();
                            }}
                            className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-none font-brutalist text-xs sm:text-sm tracking-widest font-extrabold uppercase transition-all duration-300 border-2 border-amber-600/30 bg-[#0A0A0E] hover:bg-amber-600/10 text-amber-500 shadow-sm hover:scale-[1.02] active:scale-95 cursor-pointer text-center"
                            title="Adjuntar una foto tuya de fondo para Instagram"
                          >
                            <Camera size={18} />
                            <span>
                              {exportBgImage ? "CAMBIAR RELIEVE" : "+ FOTO"}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={handleExportDayJPG}
                            disabled={isExportingJPG}
                            className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-none font-brutalist text-xs sm:text-sm tracking-widest font-extrabold uppercase transition-all duration-300 border-none bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-white shadow-sm hover:shadow-sm hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer text-center"
                            title="Exportar los ejercicios de este día a una imagen en formato IG Story"
                          >
                            <Share2
                              size={18}
                              className={`${isExportingJPG ? "animate-spin text-amber-200" : "text-amber-100 "}`}
                            />
                            <span>
                              {isExportingJPG ? "EXPORTANDO..." : "STORY JPG"}
                            </span>
                          </button>
                        </div>
                      )}
                      {renderExportCustomizationPanel()}
                    </div>
                  </div>
                ) : (
                  <main
                    className="w-full flex-grow grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch"
                    id="workoutBoard"
                    onTouchStart={handleVariationTouchStart}
                    onTouchMove={handleVariationTouchMove}
                    onTouchEnd={handleVariationTouchEnd}
                  >
                    {renderWarmupBlock(true)}
                    {renderStrengthBlock(true)}
                    {renderMetconBlock(true)}
                    {renderAccessoriesBlock(true)}

                    {/* DYNAMIC COMPLETION TOGGLE FOR THE ACTIVE DAY */}
                    {activeDay && (
                      <div className="mt-6 flex flex-col sm:flex-row gap-4 no-print w-full col-span-full">
                        <motion.button
                          whileHover={{ scale: 1.015 }}
                          whileTap={{ scale: 0.985 }}
                          onClick={() => toggleDayCompleted(activeDay.id)}
                          className={`flex-grow status-btn flex items-center justify-center gap-2.5 ${completedDays[activeDay.id] ? "completed shadow-sm border border-emerald-400/50" : ""}`}
                        >
                          {completedDays[activeDay.id] ? (
                            <motion.span
                              initial={{ scale: 0.85, rotate: -15 }}
                              animate={{ scale: 1, rotate: 0 }}
                              className="flex items-center gap-2 justify-center relative"
                            >
                              <BadgeCheck
                                size={24}
                                className="text-zinc-950 shrink-0 "
                              />
                              <span className="font-extrabold text-zinc-950 tracking-wider">
                                MISIÓN COMPLETA (COMPLETADO)
                              </span>

                              {showBlastId === activeDay.id && (
                                <motion.div
                                  className="absolute inset-0 m-auto w-full h-full rounded bg-emerald-300 pointer-events-none"
                                  initial={{ scale: 1, opacity: 0.8 }}
                                  animate={{ scale: 2.5, opacity: 0 }}
                                  transition={{
                                    duration: 0.6,
                                    ease: "easeOut",
                                  }}
                                />
                              )}
                              {showBlastId === activeDay.id && (
                                <motion.div
                                  className="absolute inset-0 m-auto w-full h-full rounded bg-white pointer-events-none"
                                  initial={{ scale: 0.5, opacity: 1 }}
                                  animate={{ scale: 3.5, opacity: 0 }}
                                  transition={{
                                    duration: 0.8,
                                    ease: "easeOut",
                                    delay: 0.1,
                                  }}
                                />
                              )}
                            </motion.span>
                          ) : (
                            <span className="font-extrabold tracking-wider">
                              MARCAR DÍA COMO COMPLETADO
                            </span>
                          )}
                        </motion.button>

                        <div className="flex bg-[#0A0A0E] border-2 border-amber-600/30">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={exportFileInputRef}
                            onChange={handleBgImageUpload}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              exportFileInputRef.current?.click();
                            }}
                            className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-none font-brutalist text-xs sm:text-sm tracking-widest font-extrabold uppercase transition-all duration-300 hover:bg-amber-600/10 text-amber-500 shadow-sm hover:scale-[1.02] active:scale-95 cursor-pointer text-center border-none"
                            title="Adjuntar una foto tuya de fondo para Instagram"
                          >
                            <Camera size={18} />
                            <span>
                              {exportBgImage ? "CAMBIAR RELIEVE/FOTO" : "+ FOTO"}
                            </span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={handleExportDayJPG}
                          disabled={isExportingJPG}
                          className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-none font-brutalist text-xs sm:text-sm tracking-widest font-extrabold uppercase transition-all duration-300 border-none bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-white shadow-sm hover:shadow-sm hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer text-center"
                          title="Exportar los ejercicios de este día a una imagen en formato IG Story"
                        >
                          <Share2
                            size={18}
                            className={`${isExportingJPG ? "animate-spin text-amber-200" : "text-amber-100 "}`}
                          />
                          <span>
                            {isExportingJPG ? "EXPORTANDO..." : "STORY JPG"}
                          </span>
                        </button>
                      </div>
                    )}
                    {renderExportCustomizationPanel()}
                  </main>
                )
              ) : (
                activeDay && (
                  <main className="w-full flex-grow" id="workoutBoard">
                    {/* Default rest day whiteboard rendering */}
                    <section className="col-span-1 flex flex-col items-center justify-center p-12 border-4 border-dashed border-electric-blue/40 bg-pure-black/95 text-center space-y-6">
                      <div className="text-5xl md:text-7xl font-brutalist text-electric-blue tracking-wider">
                        REST DAY - PORTAL REGENT
                      </div>
                      <div className="max-w-xl space-y-4">
                        <p className="text-xl md:text-2xl font-condensed font-bold tracking-wide text-neutral-300">
                          LÍMITES DE ADHERENCIA RESPETADOS // RECARGANDO
                          CAPACIDAD NEURAL
                        </p>
                        <div className="border-t border-white/20 pt-4 text-base text-white/40 font-condensed">
                          PRESUPUESTO DE MANÁ: OPTIMIZADO // REGENERACIÓN
                          COMPLETA PARA EL PRÓXIMO IMPACTO
                        </div>
                      </div>

                      <div className="w-full mt-4 max-w-md no-print">
                        <motion.button
                          whileHover={{ scale: 1.015 }}
                          whileTap={{ scale: 0.985 }}
                          onClick={() => toggleDayCompleted(activeDay.id)}
                          className={`status-btn flex items-center justify-center gap-2.5 ${completedDays[activeDay.id] ? "completed shadow-sm border border-emerald-400/50" : ""}`}
                        >
                          {completedDays[activeDay.id] ? (
                            <motion.span
                              initial={{ scale: 0.85, rotate: -15 }}
                              animate={{ scale: 1, rotate: 0 }}
                              className="flex items-center gap-2 justify-center"
                            >
                              <BadgeCheck
                                size={24}
                                className="text-zinc-950 shrink-0 "
                              />
                              <span className="font-extrabold text-zinc-950 tracking-wider">
                                MISIÓN COMPLETA (COMPLETADO)
                              </span>
                            </motion.span>
                          ) : (
                            <span className="font-extrabold tracking-wider">
                              MARCAR DÍA COMO COMPLETADO
                            </span>
                          )}
                        </motion.button>
                      </div>
                    </section>
                  </main>
                )
              )}
            </div>
          </motion.div>
        )}

        {activeSheet === 1 && (
          <motion.div
            key="sheet-rpe"
            initial={{
              opacity: 0,
              x: transitionDirection === "right" ? 300 : -300,
            }}
            animate={{ opacity: 1, x: 0 }}
            exit={{
              opacity: 0,
              x: transitionDirection === "right" ? -300 : 300,
            }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="px-6 md:px-10 flex-grow flex flex-col space-y-6"
          >
            <RpeAnalyticsPanel
              currentWeek={currentWeek}
              activeDay={activeDay}
              currentVariationIndex={currentVariationIndex}
              logsVersion={logsVersion}
              handleGenerateMonthlyReportPDF={handleGenerateMonthlyReportPDF}
              getMonthlyVolumeStats={getMonthlyVolumeStats}
            />
          </motion.div>
        )}

        {activeSheet === 2 && (
          <motion.div
            key="sheet-telemetry"
            initial={{
              opacity: 0,
              x: transitionDirection === "right" ? 300 : -300,
            }}
            animate={{ opacity: 1, x: 0 }}
            exit={{
              opacity: 0,
              x: transitionDirection === "right" ? -300 : 300,
            }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="px-6 md:px-10 flex-grow flex flex-col"
          >
            {/* CLOUD PERSISTENCE PANEL: SECURE SYNC ENGINE */}
            <CloudSyncPanel
              currentUser={currentUser}
              isCloudSyncing={isCloudSyncing}
              setIsCloudSyncing={setIsCloudSyncing}
              syncStatus={syncStatus}
              setConfettiTrigger={setConfettiTrigger}
            />

            {/* 1RM BRZYCKI CALIBRATOR TOOL */}
            <section className="mt-4">
              <BrzyckiCalculator />
            </section>

            {/* 6. BOTTOM TELEMETRY BOARD: PROGRESS, PARTY & L4 GEAR ACCENTS */}
            <TelemetryBoard
              athlete={athlete}
              currentWeek={currentWeek}
              chartData={chartData}
              rpeDistributionData={rpeDistributionData}
              rpeComparisonInfo={rpeComparisonInfo}
              currentXp={currentXp}
              xpPercentage={xpPercentage}
              weeklyCompletionInfo={weeklyCompletionInfo}
              activeDay={activeDay}
              activeDayLoggingPercentage={activeDayLoggingPercentage}
              earnedLootList={earnedLootList}
              currentUser={currentUser}
              manualSyncState={manualSyncState}
              setManualSyncState={setManualSyncState}
              setShowResetModal={setShowResetModal}
              setShowProfileModal={setShowProfileModal}
              setTempAthlete={setTempAthlete}
              handleExportLocalHistory={handleExportLocalHistory}
              handleExportLocalHistoryCSV={handleExportLocalHistoryCSV}
              activeColorSet={activeColorSet}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. CUSTOM CONFIRM BRUTALIST DIALOGS (Replaces standard popup blockages) */}
      <AnimatePresence>
        {showResetModal && (
          <ResetConfirmModal
            onConfirm={handleConfirmReset}
            onCancel={() => setShowResetModal(false)}
          />
        )}

        {/* BRUTALIST CF-L4 ACHIEVEMENT UNLOCKED POPUP BANNER */}
        {activeAchievement && (
          <div className="fixed inset-0 bg-transparent pointer-events-none flex items-start justify-center z-[200] p-4 text-center pt-12 md:pt-16">
            <motion.div
              initial={{ y: -80, scale: 0.9, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: -80, scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 16 }}
              className="pointer-events-auto max-w-sm sm:max-w-md w-full bg-black/95 backdrop-blur-md border-2 p-5 relative overflow-hidden flex flex-col items-center select-none shadow-[0_15px_40px_rgba(0,0,0,0.85)]"
              style={{
                borderColor: activeAchievement.color,
                boxShadow: `0 0 35px ${activeAchievement.color}25`,
              }}
            >
              {/* aesthetic color bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: activeAchievement.color }}
              />

              <div className="flex items-center gap-3 w-full">
                <div
                  className="rounded-none p-3 text-3xl shrink-0 flex items-center justify-center border"
                  style={{
                    backgroundColor: `${activeAchievement.color}15`,
                    borderColor: `${activeAchievement.color}40`,
                    color: activeAchievement.color,
                  }}
                >
                  {activeAchievement.icon}
                </div>

                <div className="text-left flex-grow min-w-0">
                  <div className="flex justify-between items-center bg-white/0">
                    <span
                      className="text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 tracking-wider"
                      style={{
                        backgroundColor: `${activeAchievement.color}20`,
                        color: activeAchievement.color,
                      }}
                    >
                      LOGRO DE RENDIMIENTO • {activeAchievement.rarity}
                    </span>
                    <button
                      onClick={() => setActiveAchievement(null)}
                      className="text-neutral-500 hover:text-white transition-colors p-1"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                  <h4
                    className="text-sm sm:text-base font-brutalist tracking-wider text-pure-white leading-tight mt-1 uppercase"
                    style={{ color: activeAchievement.color }}
                  >
                    {activeAchievement.title}
                  </h4>
                  <p className="font-condensed text-neutral-300 font-bold text-[10px] sm:text-xs mt-1 leading-normal">
                    {activeAchievement.description}
                  </p>
                </div>
              </div>

              {/* Countdown progress loading bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-900 overflow-hidden">
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  className="h-full"
                  style={{ backgroundColor: activeAchievement.color }}
                />
              </div>
            </motion.div>
          </div>
        )}

        {showProfileModal && (
          <ProfileModal
            tempAthlete={tempAthlete}
            setTempAthlete={setTempAthlete}
            unlockedAchievements={unlockedAchievements}
            customAccentColor={customAccentColor}
            setCustomAccentColor={setCustomAccentColor}
            enableThemedBackgrounds={enableThemedBackgrounds}
            setEnableThemedBackgrounds={setEnableThemedBackgrounds}
            warmupBg={warmupBg}
            setWarmupBg={setWarmupBg}
            strengthBg={strengthBg}
            setStrengthBg={setStrengthBg}
            metconBg={metconBg}
            setMetconBg={setMetconBg}
            accessoriesBg={accessoriesBg}
            setAccessoriesBg={setAccessoriesBg}
            handleUpdateAthlete={handleUpdateAthlete}
            onClose={() => setShowProfileModal(false)}
          />
        )}
      </AnimatePresence>

      {/* 8. FLOATING INTUITIVE COACH AI CHAT */}
      <CoachChat
        currentWorkouts={WORKOUT_DATABASE as any}
        onUpdateWorkouts={() => {}}
        activeWeek={currentWeek}
        activeDayId={activeDay?.id || "w2d1"}
        athlete={athlete}
        onUpdateAthlete={handleUpdateAthlete}
        sideQuests={sideQuests}
        dailyGoals={dailyGoals}
        onUpdateSideQuests={(updatedQuests) => {
          setSideQuests(updatedQuests);
          localStorage.setItem(
            "nexus_daily_quests_v2",
            JSON.stringify(updatedQuests),
          );
        }}
        onTriggerLightning={() => {
          setLightningFlash(true);
          setTimeout(() => {
            setLightningFlash(false);
          }, 1200);
        }}
      />

      {/* 9. DECORATION COMPACT FOOTER */}
      <footer className="mt-8 pt-6 opacity-30" data-purpose="footer-texture">
        <div className="flex justify-between border-t border-white py-4 text-xs font-condensed font-bold uppercase tracking-wider">
          <span>nexus crossfit SYSTEM // v4.0</span>
          <span>READY FOR IMPACT // CF-L4 COACH PLATFORM</span>
        </div>
      </footer>

      {/* 10. HIDDEN OFF-SCREEN CARD FOR JPG EXPORT */}
      {activeDay && activeVariation && (
        <ShareCardOverlay
          activeDay={activeDay}
          activeVariation={activeVariation}
          currentWeek={currentWeek}
          exportBgImage={exportBgImage}
          exportLayout={exportLayout}
          exportAthleteName={exportAthleteName}
          exportInspiration={exportInspiration}
          exportCardOpacity={exportCardOpacity}
          exportCardBlur={exportCardBlur}
          exportCardWidth={exportCardWidth}
          exportVerticalLayout={exportVerticalLayout}
          exportSilhouetteEffect={exportSilhouetteEffect}
          exportOverlayImage={exportOverlayImage}
          exportOverlayX={exportOverlayX}
          exportOverlayY={exportOverlayY}
          exportOverlayScale={exportOverlayScale}
          exportOverlayOpacity={exportOverlayOpacity}
          exportOverlayZ={exportOverlayZ}
          exportCardHeightLimit={exportCardHeightLimit}
          teamSize={teamSize}
          activeColorSet={activeColorSet}
          midBandColor={midBandColor}
          formatItemWithTeamVolume={formatItemWithTeamVolume}
          getDerivedInspiration={getDerivedInspiration}
        />
      )}
    </div>
  );
}
```

## File: src/index.css
```css
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
  --font-brutalist: "Anton", "Impact", sans-serif;
  --font-condensed: "Roboto Condensed", sans-serif;
  
  --color-pure-black: #0E0E11;
  --color-pure-white: #FFFFFF;
  --color-electric-blue: #1F51FF;
  --color-neon-pink: #FF007F;
  
  --shadow-blue-glow: 0 0 15px 2px rgba(31, 81, 255, 0.6);
  --shadow-pink-glow: 0 0 15px 2px rgba(255, 0, 127, 0.6);
}

.bg-neon-pink {
  background-color: #FF007F;
}

.bg-neon-yellow {
  background-color: #CCFF00;
}

.bg-neon-orange {
  background-color: #FF5A00;
}

.bg-neon-green {
  background-color: #39FF14;
}

.bg-neon-cyan {
  background-color: #00F0FF;
}

body {
  background-color: #0E0E11;
  color: #FFFFFF;
  font-family: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
  margin: 0;
  padding: 0;
}

.font-brutalist {
  font-family: "Anton", "Impact", sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Custom Scrollbar Hide */
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

/* Responsive adjustments for main app body/content wrapper to prevent clipping based on header height and safe areas */
.app-content-wrapper {
  margin-top: 0;
  padding-top: 0;
}

.pt-safe {
  padding-top: calc(var(--header-height, 115px) + env(safe-area-inset-top, 0px)) !important;
}

@media (min-width: 375px) {
  .app-content-wrapper {
    margin-top: 0;
    padding-top: 0;
  }
}

@media (min-width: 640px) {
  .app-content-wrapper {
    margin-top: 0;
    padding-top: 0;
  }
}

@media (min-width: 768px) {
  .app-content-wrapper {
    margin-top: 0;
    padding-top: 0;
  }
}

@media (min-width: 1200px) {
  .app-content-wrapper {
    margin-top: 0;
    padding-top: 0;
  }
}

/* Precise styling for target selector classes to prevent overlapping/clipping and support notches */
.fixed.top-0.left-0.right-0.z-50.bg-\[\#0A0A0E\]\/95.border-b-2.border-white\/10.no-print.backdrop-blur-md.shadow-\[0_4px_30px_rgba\(0\,0\,0\,0.85\)\] {
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: 4px;
}

@media (max-width: 374px) {
  /* Reduce vertical padding below 375px to maximize usable height */
  .fixed.top-0.left-0.right-0.z-50.bg-\[\#0A0A0E\]\/95.border-b-2.border-white\/10.no-print.backdrop-blur-md.shadow-\[0_4px_30px_rgba\(0\,0\,0\,0.85\)\] {
    padding-top: env(safe-area-inset-top, 0px) !important;
    padding-bottom: 2px !important;
  }
  
  /* Reduce font size of 'NEXUS L4 MASTER' branding to prevent overflow */
  .fixed.top-0.left-0.right-0.z-50.bg-\[\#0A0A0E\]\/50.border-b-2.border-white\/10.no-print.backdrop-blur-md.shadow-\[0_4px_30px_rgba\(0\,0\,0\,0.85\)\] .font-brutalist,
  .fixed.top-0.left-0.right-0.z-50.bg-\[\#0A0A0E\]\/95.border-b-2.border-white\/10.no-print.backdrop-blur-md.shadow-\[0_4px_30px_rgba\(0\,0\,0\,0.85\)\] .font-brutalist {
    font-size: 6.5px !important;
  }
  
  /* Wrap internal header flex containers to prevent any layout breaking or horizontal scroll */
  .fixed.top-0.left-0.right-0.z-50.bg-\[\#0A0A0E\]\/95.border-b-2.border-white\/10.no-print.backdrop-blur-md.shadow-\[0_4px_30px_rgba\(0\,0\,0\,0.85\)\] .flex {
    flex-wrap: wrap !important;
  }
}

/* Subtabs styles */
.tab-btn {
  background-color: #000000;
  color: #FFFFFF;
  font-family: inherit; /* Use default clean responsive font */
  font-size: 0.75rem; /* More minimalist than 1.125rem */
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 0.35rem 0.85rem; /* More compact and easy to use */
  border: none;
  border-radius: 0.375rem; /* Modern rounded corner */
  transition: all 0.15s ease-in-out;
  cursor: pointer;
  text-transform: uppercase;
}

.tab-btn:hover {
  background-color: rgba(255, 255, 255, 0.12);
  color: #FFFFFF;
}

.tab-btn.active {
  background-color: var(--color-electric-blue);
  color: #000000;
}

/* Styled exercise item list */
.exercise-list-item {
  position: relative;
  padding-left: 1.5rem;
}

.exercise-list-item::before {
  content: '✦';
  position: absolute;
  left: 0;
  top: 0;
  height: 1.5rem; /* Matches the line-height of the first line of text */
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-electric-blue);
  font-size: 14px;
}

.cue {
  text-transform: none;
  font-family: 'Roboto Condensed', sans-serif;
  font-weight: 400;
  color: #a3a3a3;
  font-size: 0.875rem;
  display: block;
  margin-top: 0.25rem;
  border-left: 2px solid var(--color-electric-blue);
  padding-left: 0.5rem;
}

/* Main completable workout buttons style */
.status-btn {
  width: 100%;
  padding: 1rem;
  font-family: "Anton", "Impact", sans-serif;
  font-size: 1.5rem;
  letter-spacing: 0.07em;
  text-align: center;
  border: none;
  background-color: #1a1a20;
  color: #FFFFFF;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  text-transform: uppercase;
}

.status-btn:hover {
  background-color: #374151;
  color: #FFFFFF;
  box-shadow: none;
}

.status-btn.completed {
  background-color: #10B981;
  border: none;
  color: #0E0E11;
  box-shadow: none;
}

.status-btn.completed:hover {
  background-color: #059669;
  border: none;
  color: #FFFFFF;
}

/* Print Styles */
@media print {
  body {
    background-color: #FFFFFF !important;
    color: #000000 !important;
    font-family: sans-serif !important;
    text-transform: none !important;
  }
  .no-print {
    display: none !important;
  }
}

/* Clinically intense custom flash animation for RPE 9+ registrations */
@keyframes flash-intense {
  0% {
    background: #E11D48;
    box-shadow: 0 0 30px rgba(225, 29, 72, 0.85);
    transform: scale(1.04);
  }
  15% {
    background: #F59E0B; /* Amber peak */
    box-shadow: 0 0 45px rgba(245, 158, 11, 1), inset 0 0 15px rgba(255, 255, 255, 0.9);
    transform: scale(0.97);
  }
  35% {
    background: #EC4899; /* Hot Pink core */
    box-shadow: 0 0 35px rgba(236, 72, 153, 0.85);
    transform: scale(1.03);
  }
  55% {
    background: #DC2626; /* Dark pure red */
    box-shadow: 0 0 25px rgba(220, 38, 38, 0.7);
    transform: scale(0.98);
  }
  75% {
    background: #F59E0B;
    box-shadow: 0 0 40px rgba(245, 158, 11, 0.9), inset 0 0 12px rgba(255, 255, 255, 0.7);
    transform: scale(1.02);
  }
  100% {
    background: #E11D48;
    box-shadow: 0 0 20px rgba(225, 29, 72, 0.6);
    transform: scale(1);
  }
}

.animate-flash-intense {
  animation: flash-intense 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
}

@keyframes rpeAlertPulse {
  0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4); border-color: rgba(249, 115, 22, 0.5); }
  70% { box-shadow: 0 0 0 6px rgba(249, 115, 22, 0); border-color: rgba(249, 115, 22, 0.2); }
  100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); border-color: rgba(249, 115, 22, 0.5); }
}

@keyframes rpeCriticalPulse {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6); border-color: rgba(239, 68, 68, 0.8); }
  70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); border-color: rgba(239, 68, 68, 0.4); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); border-color: rgba(239, 68, 68, 0.8); }
}

.rpe-alert-glow {
  animation: rpeAlertPulse 2s infinite;
  border-color: rgba(249, 115, 22, 0.5) !important;
}

.rpe-critical-glow {
  animation: rpeCriticalPulse 1s infinite;
  border-color: rgba(239, 68, 68, 0.8) !important;
}

/* Workout grid styling handled dynamically in React components via Tailwind utility classes */
```

## File: src/main.tsx
```tsx
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

## File: src/vite-env.d.ts
```typescript
/// <reference types="vite/client" />
```

## File: src/components/AchievementNotification.tsx
```tsx
// FILE_PATH: /src/components/AchievementNotification.tsx
// ACTION: CREATE
// DESCRIPTION: Dynamic Achievement Notification banner with bounce animation using framer-motion built under strict CF-L4 aesthetic
// ---------------------------------------------------------
import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Award, Sparkles, Check } from 'lucide-react';

interface AchievementNotificationProps {
  achievement: {
    id: string;
    title: string;
    description: string;
    icon: string;
    rarity: string;
    color: string;
  } | null;
  onClose: () => void;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  onClose,
}) => {
  useEffect(() => {
    if (!achievement) return;

    // Auto dismiss after exactly 3 seconds as requested
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100000] w-full max-w-sm px-4 no-print pointer-events-auto">
      <motion.div
        initial={{ y: -80, scale: 0.82, opacity: 0 }}
        animate={{ 
          y: 0, 
          scale: [0.82, 1.15, 0.95, 1.02, 1], // Bounce movement sequence
          opacity: 1 
        }}
        exit={{ y: -60, scale: 0.9, opacity: 0 }}
        transition={{ 
          y: { type: "spring", stiffness: 300, damping: 18 },
          opacity: { duration: 0.35 },
          scale: { type: "keyframes", ease: "easeInOut", duration: 0.65 }
        }}
        className="bg-black text-white border-2 border-[#00f0ff] p-3.5 shadow-[0_10px_35px_rgba(0,240,255,0.4)] relative overflow-hidden flex items-start gap-3 rounded-none select-none cursor-pointer"
        onClick={onClose}
        style={{ borderColor: achievement.color || '#00f0ff' }}
      >
        {/* Decorative corner flash */}
        <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        
        {/* Left Side: Dynamic Icon and Spark */}
        <div 
          className="p-2 shrink-0 border border-white/20 bg-white/5 flex items-center justify-center relative"
          style={{ textShadow: `0 0 8px ${achievement.color}` }}
        >
          <span className="text-xl leading-none">{achievement.icon || '🏆'}</span>
          <div className="absolute -bottom-1 -right-1 bg-amber-500 text-black p-0.5 rounded-none scale-90">
            <Sparkles size={8} className="animate-pulse" />
          </div>
        </div>

        {/* Middle Side: Detail */}
        <div className="flex-1 text-left space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5 justify-between">
            <span 
              className="text-[8px] font-mono tracking-widest font-black uppercase px-1.5 py-0.2"
              style={{ backgroundColor: `${achievement.color}15`, color: achievement.color }}
            >
              🏆 LOGRO DESBLOQUEADO
            </span>
            <span className="text-[7.5px] font-mono text-zinc-500 tracking-wider font-bold">
              {achievement.rarity.toUpperCase()}
            </span>
          </div>
          
          <h4 className="text-[12px] font-brutalist uppercase tracking-wide text-white leading-tight font-black truncate">
            {achievement.title}
          </h4>
          
          <p className="text-[9.5px] font-mono text-zinc-400 leading-tight">
            {achievement.description}
          </p>
        </div>

        {/* Right Close indicator */}
        <div className="self-center shrink-0 text-zinc-500 hover:text-white transition-colors">
          <Check size={12} className="text-emerald-400 font-extrabold animate-pulse" />
        </div>

        {/* Bottom scanner loader visual (duration 3 seconds) */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 pointer-events-none">
          <motion.div 
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 3, ease: 'linear' }}
            className="h-full"
            style={{ backgroundColor: achievement.color || '#00f0ff' }}
          />
        </div>
      </motion.div>
    </div>
  );
};
```

## File: src/components/ActiveDayHeader.tsx
```tsx
import React from "react";
import { motion } from "motion/react";

interface ActiveDayHeaderProps {
  activeDay: any;
  completedDays: Record<string, boolean>;
  headerHeight: number;
  mousePos: { x: number; y: number };
  setMousePos: (pos: { x: number; y: number }) => void;
  scrollY: number;
  isIntroGlitching: boolean;
  dayTitleAlertTrigger: boolean;
}

export default function ActiveDayHeader({
  activeDay,
  completedDays,
  headerHeight,
  mousePos,
  setMousePos,
  scrollY,
  isIntroGlitching,
  dayTitleAlertTrigger,
}: ActiveDayHeaderProps) {
  if (!activeDay) return null;

  return (
    <motion.div
      className="sticky z-[60] w-full overflow-hidden select-none border-y border-white/10 py-3 flex items-center justify-center transition-all duration-300 bg-zinc-950/85 backdrop-blur-md mb-6"
      whileHover={{
        scale: 1.05,
        boxShadow:
          "0 0 35px rgba(0, 240, 255, 0.55), 0 0 15px rgba(255, 0, 127, 0.45)",
        borderColor: "rgba(0, 240, 255, 0.4)",
      }}
      style={{
        top: `${headerHeight}px`,
        background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(31, 81, 255, 0.45) 0%, rgba(255, 0, 127, 0.4) ${45 + Math.sin(scrollY * 0.01) * 15}%, rgba(14, 14, 17, 0.98) 95%)`,
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePos({ x, y });
      }}
    >
      <motion.div
        id="uiDayTitle"
        className="font-brutalist text-white uppercase tracking-[0.05em] leading-none m-0 p-0 text-center font-black select-none w-full"
        animate={
          isIntroGlitching
            ? {
                x: [0, -25, 20, -15, 15, -8, 8, -4, 4, 0],
                y: [0, 5, -5, 3, -3, 0],
                skewX: [0, 20, -20, 15, -15, 8, -8, 0],
                scale: [1, 1.12, 0.9, 1.05, 1],
                filter: [
                  "hue-rotate(90deg) brightness(2)",
                  "hue-rotate(-45deg) brightness(0.8)",
                  "hue-rotate(180deg) brightness(1.5)",
                  "hue-rotate(0deg) brightness(1)",
                ],
                color: [
                  "#ffffff",
                  "#00f0ff",
                  "#ff007f",
                  "#00f0ff",
                  "#ffffff",
                ],
              }
            : dayTitleAlertTrigger
              ? {
                  x: [0, -12, 12, -12, 12, -6, 6, -3, 3, 0],
                  scale: [1, 1.15, 0.95, 1.1, 1],
                  rotate: [0, -3, 3, -3, 3, -1, 1, 0],
                  filter: [
                    "brightness(1)",
                    "brightness(2)",
                    "brightness(0.8)",
                    "brightness(1.8)",
                    "brightness(1)",
                  ],
                  color: [
                    "#ffffff",
                    "#00f0ff",
                    "#ff007f",
                    "#00f0ff",
                    "#ffffff",
                  ],
                  textShadow: [
                    "0 0 10px #00f0ff, 0 0 20px #00f0ff, 0 0 40px #1F51FF, 0 0 6px #000",
                    "0 0 25px #ff007f, 0 0 50px #ff007f, 0 0 80px #1F51FF, 0 0 6px #000",
                    "0 0 5px #1F51FF, 0 0 10px #1F51FF, 0 0 20px #00f0ff, 0 0 6px #000",
                    "0 0 35px #ffffff, 0 0 60px #00f0ff, 0 0 100px #00f0ff, 0 0 6px #000",
                    "0 0 15px #00f0ff, 0 0 30px #00f0ff, 0 0 50px #1F51FF, 0 0 6px #000",
                  ],
                }
              : {
                  opacity: 1,
                  textShadow:
                    "0 0 15px #a124ff, 0 0 30px #a124ff, 0 0 50px #1F51FF, 0 0 6px #000",
                }
        }
        transition={
          isIntroGlitching
            ? {
                duration: 0.8,
                ease: "easeInOut",
              }
            : dayTitleAlertTrigger
              ? {
                  duration: 0.85,
                  repeat: 1,
                  ease: "easeInOut",
                }
              : {}
        }
      >
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-1.5 px-4 h-full">
          {/* STATUS INDICATOR (GREEN/RED) */}
          <div className="flex items-center gap-2.5 shrink-0 select-none">
            <span
              className={`w-3.5 h-3.5 rounded-full border border-white/25 transition-all duration-500 shrink-0 ${
                completedDays[activeDay.id]
                  ? "bg-emerald-500 shadow-sm"
                  : "bg-[#ff0055] shadow-sm"
              } `}
              title={
                completedDays[activeDay.id]
                  ? "¡Entrenamiento Completado!"
                  : "Entrenamiento Incompleto"
              }
            />
          </div>

          {/* TITLE TEXT */}
          <span className="text-[1.8rem] xs:text-[2.2rem] sm:text-[2.8rem] md:text-[3.2rem] lg:text-[3.6rem] font-black tracking-wide leading-none select-none">
            {activeDay.title}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
```

## File: src/components/BrandInspirationAccordion.tsx
```tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { resolveBlockBrand } from "../lib/constants";

interface BrandInspirationAccordionProps {
  tabName: string;
  title: string;
  items: string[];
  blockId: string;
}

export default function BrandInspirationAccordion({
  tabName,
  title,
  items,
  blockId,
}: BrandInspirationAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const brand = resolveBlockBrand(tabName, title, items);

  let inspiredText = "PRVN INSPIRED";
  if (brand.emblem.includes("HAEDO")) {
    inspiredText = "ATENEO HAEDO INSPIRED";
  } else if (brand.emblem.includes("MAYHEM")) {
    inspiredText = "MAYHEM INSPIRED";
  } else if (brand.emblem.includes("HWPO")) {
    inspiredText = "HWPO INSPIRED";
  }

  let emblemEmoji = "🧬";
  if (inspiredText.includes("HAEDO")) emblemEmoji = "🥤";
  else if (inspiredText.includes("MAYHEM")) emblemEmoji = "🔥";
  else if (inspiredText.includes("HWPO")) emblemEmoji = "⛓️";

  return (
    <div
      className={`border ${brand.border} ${brand.bg} text-[10px] font-mono rounded-none select-none overflow-hidden transition-all duration-300`}
      id={`brand_badge_accordion_${blockId}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-1.5 flex items-center justify-between text-left hover:bg-white/5 transition-colors focus:outline-none cursor-pointer"
        type="button"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`${brand.text} font-black text-[9px] tracking-wider shrink-0 uppercase`}
          >
            {emblemEmoji} {inspiredText}
          </span>
        </div>
        <span className="text-[8px] text-neutral-400 font-bold shrink-0 transition-all duration-200 ml-1">
          {isOpen ? "▲ OCULTAR" : "▼ DETALLES"}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="border-t border-white/5"
          >
            <div className="px-3 py-2 bg-black/40 text-[8.5px] text-neutral-300 leading-normal font-mono">
              {brand.desc}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

## File: src/components/BrzyckiCalculator.tsx
```tsx
// FILE_PATH: /src/components/BrzyckiCalculator.tsx
// ACTION: CREATE
// DESCRIPTION: Interactive Brzycki 1RM Estimator & Load Calibrator tool styled in alignment with Nexus L4.
// ---------------------------------------------------------------------------------------------------------
import React, { useState, useEffect, useMemo } from 'react';
import { Dumbbell, Award, Flame, AlertCircle, RefreshCw, Calculator, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LogItem {
  weight: string;
  reps: string;
  rpe: string;
  timestamp: number;
}

interface AnalyzedExercise {
  name: string;
  rawName: string;
  maxWeight: number;
  bestBrzycki1RM: number;
  bestSet: {
    weight: number;
    reps: number;
    rpe: string;
    timestamp: number;
  } | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: 'spring', 
      stiffness: 260, 
      damping: 20 
    } 
  }
};

export default function BrzyckiCalculator() {
  const [exercises, setExercises] = useState<AnalyzedExercise[]>([]);
  const [selectedExerciseName, setSelectedExerciseName] = useState<string>('custom');
  
  // Input states
  const [customWeight, setCustomWeight] = useState<string>('');
  const [customReps, setCustomReps] = useState<string>('');
  const [showFormulaInfo, setShowFormulaInfo] = useState<boolean>(false);

  // Load registered exercises from localStorage
  const scanLogsAndCalculateRMs = () => {
    const list: AnalyzedExercise[] = [];
    const exerciseMap = new Map<string, {
      maxWeight: number;
      bestBrzycki1RM: number;
      bestSet: { weight: number; reps: number; rpe: string; timestamp: number } | null;
    }>();

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('nexus_logs_')) {
        // Regex to parse: nexus_logs_dayId_exerciseName
        const match = key.match(/^nexus_logs_[a-zA-Z0-9]+_[a-zA-Z0-9]+_(.+)$/);
        if (match) {
          const rawName = match[1];
          const friendlyName = rawName.replace(/_+/g, ' ');

          try {
            const saved = localStorage.getItem(key);
            if (saved) {
              const logs: LogItem[] = JSON.parse(saved);
              if (Array.isArray(logs)) {
                logs.forEach((log) => {
                  const wMatch = log.weight.match(/(\d+(?:\.\d+)?)/);
                  const rMatch = log.reps.match(/(\d+)/);

                  if (wMatch && rMatch) {
                    const weightVal = parseFloat(wMatch[1]);
                    const repsVal = parseInt(rMatch[1], 10);

                    if (weightVal > 0 && repsVal > 0) {
                      // Calculate 1RM using Brzycki: Weight / (1.0278 - 0.0278 * Reps)
                      let brzycki1RM = weightVal;
                      if (repsVal > 1) {
                        const divisor = 1.0278 - (0.0278 * repsVal);
                        if (divisor > 0) {
                          brzycki1RM = weightVal / divisor;
                        }
                      }

                      const existing = exerciseMap.get(friendlyName);
                      if (!existing || brzycki1RM > existing.bestBrzycki1RM) {
                        exerciseMap.set(friendlyName, {
                          maxWeight: Math.max(existing?.maxWeight || 0, weightVal),
                          bestBrzycki1RM: brzycki1RM,
                          bestSet: {
                            weight: weightVal,
                            reps: repsVal,
                            rpe: log.rpe,
                            timestamp: log.timestamp
                          }
                        });
                      }
                    }
                  }
                });
              }
            }
          } catch (e) {
            console.error('Error scanning logs in 1RM estimator', e);
          }
        }
      }
    }

    // Convert map to sorted array
    exerciseMap.forEach((val, name) => {
      list.push({
        name,
        rawName: name.replace(/\s+/g, '_'),
        ...val
      });
    });

    // Sort by name
    list.sort((a, b) => b.bestBrzycki1RM - a.bestBrzycki1RM);
    setExercises(list);
  };

  useEffect(() => {
    scanLogsAndCalculateRMs();

    // Listen to updates
    const handleLogsUpdate = () => {
      scanLogsAndCalculateRMs();
    };
    window.addEventListener('nexus_logs_updated', handleLogsUpdate);
    window.addEventListener('storage', handleLogsUpdate);

    return () => {
      window.removeEventListener('nexus_logs_updated', handleLogsUpdate);
      window.removeEventListener('storage', handleLogsUpdate);
    };
  }, []);

  // Sync inputs when selecting an exercise from the list
  useEffect(() => {
    if (selectedExerciseName === 'custom' || selectedExerciseName === '') {
      // Don't auto-fill
      return;
    }

    const found = exercises.find(ex => ex.name === selectedExerciseName);
    if (found && found.bestSet) {
      setCustomWeight(String(found.bestSet.weight));
      setCustomReps(String(found.bestSet.reps));
    }
  }, [selectedExerciseName, exercises]);

  // Calculate current 1RM in real-time
  const calculatedResult = useMemo(() => {
    const w = parseFloat(customWeight);
    const r = parseInt(customReps, 10);

    if (isNaN(w) || w <= 0 || isNaN(r) || r <= 0) {
      return null;
    }

    // If reps are 1, 1RM is simply the weight
    if (r === 1) {
      return {
        oneRepMax: w,
        isOptimal: true,
        repsWarning: false
      };
    }

    const divisor = 1.0278 - (0.0278 * r);
    if (divisor <= 0) {
      return null;
    }

    const oneRepMax = w / divisor;

    return {
      oneRepMax: Math.round(oneRepMax * 10) / 10,
      isOptimal: r <= 10,
      repsWarning: r > 10
    };
  }, [customWeight, customReps]);

  // Generate percentage matrix based on 1RM
  const percentageMatrix = useMemo(() => {
    if (!calculatedResult) return [];
    const max = calculatedResult.oneRepMax;
    
    // CF-L4 Standard working zone mapping
    return [
      { percentage: 95, label: 'Fuerza Absoluta / RPE 9.5', weight: Math.round(max * 0.95 * 10) / 10 },
      { percentage: 90, label: 'Fuerza Máxima / RPE 9.0', weight: Math.round(max * 0.90 * 10) / 10 },
      { percentage: 85, label: 'Desarrollo Potencia / RPE 8.5 (PRVN Line)', weight: Math.round(max * 0.85 * 10) / 10 },
      { percentage: 80, label: 'Hipertrofia Densa / RPE 8.0 (HWPO Grind)', weight: Math.round(max * 0.80 * 10) / 10 },
      { percentage: 75, label: 'Resistencia de Fuerza / RPE 7.5', weight: Math.round(max * 0.75 * 10) / 10 },
      { percentage: 70, label: 'Velocidad Transición / RPE 7.0 (Sincro Mayhem)', weight: Math.round(max * 0.70 * 10) / 10 },
      { percentage: 65, label: 'Descarga / Recuperación Balde', weight: Math.round(max * 0.65 * 10) / 10 }
    ];
  }, [calculatedResult]);

  return (
    <div className="p-5 border border-white/10 bg-pure-black/95 relative overflow-hidden" id="brzycki-calibrator-tool">
      <div className="absolute top-0 right-0 p-3 select-none pointer-events-none opacity-5 font-brutalist text-6xl text-white">1RM</div>
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-white/10 pb-4 mb-4">
        <div className="space-y-1">
          <h4 className="text-xl font-brutalist tracking-wider text-pure-white flex items-center gap-2">
            <Calculator className="text-[#00F0FF] animate-pulse" size={20} />
            CALIBRADOR DE 1RM & CARGA CLÍNICA
          </h4>
          <p className="text-[10px] font-mono tracking-widest text-[#00F0FF] uppercase">
            // ESTIMADOR CIENTÍFICO L4 BASADO EN FÓRMULA DE BRZYCKI
          </p>
        </div>
        
        <button
          onClick={() => setShowFormulaInfo(!showFormulaInfo)}
          className="text-[9px] font-mono text-neutral-400 hover:text-[#00F0FF] border border-white/10 hover:border-[#00F0FF]/30 px-2.5 py-1 flex items-center gap-1 transition-all cursor-pointer bg-neutral-950/40"
        >
          <HelpCircle size={11} />
          <span>FÓRMULA & BIOMECÁNICA</span>
        </button>
      </div>

      <AnimatePresence>
        {showFormulaInfo && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="p-4 bg-zinc-950 border border-white/5 space-y-2 text-xs text-neutral-400 font-sans leading-relaxed text-left">
              <p>
                La <strong className="text-white">Fórmula de Brzycki</strong> es una de las metodologías indirectas más validadas en ciencias de la fuerza para estimar la capacidad neuromuscular de 1 repetición máxima sin la necesidad de testear cargas de fallo absoluto en frío.
              </p>
              <div className="p-2.5 bg-black border border-white/10 font-mono text-center text-[11px] text-[#00f0ff] rounded">
                1RM Estimado = Peso Levantado / (1.0278 - (0.0278 × Repeticiones))
              </div>
              <div className="flex gap-2 items-start text-[10px] mt-1 text-amber-400 font-mono">
                <AlertCircle size={12} className="shrink-0 mt-0.5" />
                <p>
                  <span className="font-extrabold uppercase">ADVERTENCIA NEXUS L4:</span> La precisión matemática de Brzycki es máxima en series que no exceden las <strong className="text-white font-bold">10 repeticiones</strong>. Exceder este umbral introduce sesgos de fatiga periférica y acumulación de lactato, diluyendo la estimación de fuerza máxima central. ¡ROM sobre Carga siempre!
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* INPUTS COLUMN */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0b0c10] border border-white/5 p-4 space-y-4 rounded-sm text-left">
            
            {/* EXERCISE LOADS PICKER */}
            <div className="space-y-1.5">
              <label className="block text-[9px] font-extrabold text-[#00F0FF] uppercase tracking-wider">
                1. CARGAR DESDE HISTORIAL DE RENDIMIENTO
              </label>
              <select
                value={selectedExerciseName}
                onChange={(e) => setSelectedExerciseName(e.target.value)}
                className="w-full bg-black text-white border border-white/15 rounded px-2 h-9 font-mono text-xs focus:outline-none focus:border-[#00F0FF] transition-colors cursor-pointer"
              >
                <option value="custom">-- INTRODUCIR CARGA MANUAL --</option>
                {exercises.length === 0 ? (
                  <option disabled>No hay ejercicios registrados en bitácora</option>
                ) : (
                  exercises.map((ex) => (
                    <option key={ex.name} value={ex.name}>
                      🏋️ {ex.name} ({ex.bestSet ? `${ex.bestSet.weight}kg x ${ex.bestSet.reps}r` : ''})
                    </option>
                  ))
                )}
              </select>
              {exercises.length > 0 && selectedExerciseName === 'custom' && (
                <span className="text-[9px] text-neutral-500 font-mono block italic">
                  * Elige un ejercicio registrado para autollenar instantáneamente su mejor serie.
                </span>
              )}
            </div>

            {/* MANUAL CALIBRATOR */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <label className="block text-[9px] font-extrabold text-neutral-400 uppercase tracking-wider">
                  PESO LEVANTADO (KG)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  placeholder="Ej: 100"
                  value={customWeight}
                  onChange={(e) => {
                    setCustomWeight(e.target.value);
                    setSelectedExerciseName('custom'); // revert dropdown to manual on edit
                  }}
                  className="w-full bg-black text-white border border-white/10 rounded px-2 h-9 font-mono text-center text-sm focus:outline-none focus:border-[#00F0FF] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-extrabold text-neutral-400 uppercase tracking-wider">
                  REPETICIONES COMPLETADAS
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  placeholder="Ej: 5"
                  value={customReps}
                  onChange={(e) => {
                    setCustomReps(e.target.value);
                    setSelectedExerciseName('custom'); // revert dropdown to manual on edit
                  }}
                  className="w-full bg-black text-white border border-white/10 rounded px-2 h-9 font-mono text-center text-sm focus:outline-none focus:border-[#00F0FF] transition-colors"
                />
              </div>
            </div>

            {calculatedResult && (
              <div className="flex justify-between items-center pt-2.5 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setCustomWeight('');
                    setCustomReps('');
                    setSelectedExerciseName('custom');
                  }}
                  className="text-[9px] font-mono text-neutral-500 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RefreshCw size={10} />
                  <span>LIMPIAR ANALIZADOR</span>
                </button>
                <span className="text-[8px] font-mono text-neutral-500 uppercase">
                  // CALCULADO EN DISPOSITIVO LOCAL
                </span>
              </div>
            )}
          </div>
        </div>

        {/* RESULTS GAUGE */}
        <div className="lg:col-span-7 flex flex-col justify-between h-full min-h-[220px]">
          <AnimatePresence mode="wait">
            {calculatedResult ? (
              <motion.div 
                key="result-filled"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 text-left w-full"
              >
                {/* 1RM RESULT CIRCLE BIG DISPLAY */}
                <div className="bg-[#05080e] border border-[#00f0ff]/20 p-4 rounded flex flex-col sm:flex-row items-center gap-4 sm:justify-between">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-[10px] font-mono font-bold text-[#00F0FF] block tracking-wider uppercase">
                      1RM ESTIMADO CALCULADO
                    </span>
                    <h3 className="text-4xl sm:text-5xl font-brutalist tracking-wider text-white leading-none">
                      {calculatedResult.oneRepMax} <span className="text-base font-mono text-neutral-400 uppercase">kg</span>
                    </h3>
                    <p className="text-[9.5px] text-neutral-400 font-mono uppercase mt-1 leading-tight">
                      Basado en {customWeight}kg x {customReps} {parseInt(customReps) === 1 ? 'repetición' : 'repeticiones'}
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center p-2 border border-white/10 rounded bg-black/60 min-w-[130px] font-mono text-center">
                    {calculatedResult.repsWarning ? (
                      <>
                        <span className="text-[7.5px] font-black text-rose-400 block tracking-tight uppercase">FISIOLOGÍA L4 APRETADA</span>
                        <span className="text-[9px] font-extrabold text-rose-300 mt-1 leading-normal uppercase">❌ BAJA PRECISIÓN</span>
                        <span className="text-[8.5px] text-neutral-500 mt-0.5 leading-snug">Reps &gt; 10 fatigan psoas/SNC</span>
                      </>
                    ) : (
                      <>
                        <span className="text-[7.5px] font-black text-[#00f0ff] block tracking-tight uppercase">MÁXIMA TRANSMISIÓN NEURAL</span>
                        <span className="text-[9.5px] font-extrabold text-emerald-400 mt-1 leading-normal uppercase">✓ ALTA PRECISIÓN</span>
                        <span className="text-[8.5px] text-neutral-400 mt-0.5 leading-snug">Rango óptimo neuromuscular</span>
                      </>
                    )}
                  </div>
                </div>

                {/* WORKING PERCENTAGE ZONE TABLE */}
                <div className="bg-black/90 border border-white/5 p-4 rounded">
                  <span className="text-[9px] font-black tracking-widest text-neutral-400 uppercase mb-3 block">
                    ⚔️ TABLA DE CARGAS DE TRABAJO E INTERVALOS DE INTENSIDAD NEXUS L4
                  </span>
                  
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[145px] overflow-y-auto pr-1"
                  >
                    {percentageMatrix.map((zone) => (
                      <motion.div 
                        key={zone.percentage}
                        variants={itemVariants}
                        className="py-1.5 px-2.5 border border-white/5 hover:border-[#00F0FF]/25 bg-[#08090d]/60 flex justify-between items-center rounded-sm transition-all text-[11px]"
                      >
                        <div className="flex flex-col gap-0.5 max-w-[70%]">
                          <span className="font-mono text-[9px] text-[#00f0ff] font-extrabold">{zone.percentage}% del 1RM</span>
                          <span className="text-[8.5px] text-neutral-400 leading-none truncate uppercase font-medium">{zone.label}</span>
                        </div>
                        <span className="font-mono text-xs sm:text-sm font-black text-white shrink-0">
                          {zone.weight} kg
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="result-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="border border-dashed border-white/10 rounded-sm p-6 flex flex-col items-center justify-center text-center gap-3 bg-neutral-950/20 h-full w-full justify-self-center my-auto min-h-[220px]"
              >
                <Dumbbell size={32} className="text-neutral-600 " />
                <div className="space-y-1">
                  <h5 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest">
                    ANALIZADOR EN REPOSO SENSORIAL
                  </h5>
                  <p className="text-[10px] text-neutral-500 max-w-sm leading-relaxed">
                    Digita el peso y número de repeticiones de cualquier serie, o selecciona un ejercicio histórico activo arriba. Nexus L4 proyectará tu 1RM teórico y calibrará tus cargas de entreno automáticamente.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
```

## File: src/components/CloudSyncPanel.tsx
```tsx
import React from "react";
import { CloudLightning, ShieldCheck, LogOut } from "lucide-react";
import { signInWithPopup, signOut, User } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { pushAllLocalToCloud } from "../lib/syncEngine";

interface CloudSyncPanelProps {
  currentUser: User | null;
  isCloudSyncing: boolean;
  setIsCloudSyncing: (syncing: boolean) => void;
  syncStatus: {
    hasPendingWrites: boolean;
    isOnline: boolean;
  };
  setConfettiTrigger: React.Dispatch<React.SetStateAction<number>>;
}

export default function CloudSyncPanel({
  currentUser,
  isCloudSyncing,
  setIsCloudSyncing,
  syncStatus,
  setConfettiTrigger,
}: CloudSyncPanelProps) {
  return (
    <section
      className="mt-4 p-5 border border-white/10 bg-pure-black/95 relative overflow-hidden"
      data-purpose="cloud-sync-panel"
    >
      <div className="absolute top-0 right-0 p-3 select-none pointer-events-none opacity-5 font-brutalist text-6xl text-white">
        CLOUD
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
        <div className="space-y-1">
          <h4 className="text-xl font-brutalist tracking-wider text-pure-white flex items-center gap-2">
            <CloudLightning className="text-electric-blue" size={20} />
            SISTEMA DE PERSISTENCIA EN LA NUBE
          </h4>
          <p className="text-[10px] font-mono tracking-widest text-[#00f0ff] uppercase">
            // REGISTRO Y TRACKING METABÓLICO SEGURO
          </p>
        </div>

        {currentUser ? (
          <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 text-emerald-400 font-mono text-[10px] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            <span>SINCRO ACTIVO ● CONECTADO</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-amber-950/40 border border-amber-500/30 px-3 py-1 text-amber-400 font-mono text-[10px] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            <span>
              OFFLINE EN LA NUBE (ALMACENAMIENTO REMOTO DESACTIVADO)
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Left Column: Description */}
        <div className="space-y-2 text-left">
          <p className="font-condensed text-neutral-400 font-bold text-xs sm:text-sm leading-relaxed">
            La Ley del Estímulo CF-L4 exige precisión absoluta. Al
            registrarte en la nube, todos tus entrenamientos, cargas
            reales, históricos de RPE, perfiles de volumen de trabajo y
            misiones diarias se respaldan de inmediato.
          </p>
          <p className="font-mono text-[10px] text-neutral-500 leading-normal uppercase">
            * Compatible con múltiples dispositivos. Inicia sesión en tu
            box mediante tu móvil o tableta para ver tus RMs y cargas de
            trabajo al instante.
          </p>
        </div>

        {/* Middle Column: User details or login trigger */}
        <div className="bg-[#0b0c10] border border-white/5 p-4 flex flex-col justify-center min-h-[110px]">
          {currentUser ? (
            <div className="flex items-center gap-3 text-left">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || ""}
                  className="w-12 h-12 rounded-full border-2 border-electric-blue shrink-0 shadow-md shadow-electric-blue/10"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-12 h-12 bg-electric-blue/20 border-2 border-electric-blue flex items-center justify-center text-white font-brutalist text-xl rounded-full shrink-0">
                  {currentUser.displayName
                    ? currentUser.displayName[0].toUpperCase()
                    : "U"}
                </div>
              )}
              <div className="space-y-0.5 overflow-hidden">
                <div className="text-md font-bold font-brutalist text-white tracking-wide truncate">
                  {currentUser.displayName || "ATLETA ACTIVO"}
                </div>
                <div className="text-[10px] font-mono text-neutral-400 truncate uppercase">
                  {currentUser.email}
                </div>
                <div className="text-[9px] font-mono text-emerald-400 flex items-center gap-1 uppercase tracking-wider">
                  <ShieldCheck size={10} /> VERIFICADO [CF-L4 ACCESO]
                </div>
                <div className="text-[9px] font-mono whitespace-nowrap flex items-center gap-1 uppercase tracking-wider mt-0.5">
                  {syncStatus.hasPendingWrites ? (
                    <span className="text-amber-400 flex items-center gap-1 animate-pulse">
                      ● SINCRO ACTIVA (RESPALDO PENDIENTE...)
                    </span>
                  ) : !syncStatus.isOnline ? (
                    <span className="text-blue-400 flex items-center gap-1">
                      ● BASE DE DATOS SIN RED (MODO SEGURO ACTIVO)
                    </span>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-1">
                      ● COLA SINCRO AL DÍA (TIEMPO REAL)
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-center py-2">
              <p className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest leading-relaxed">
                SINCRO DESACTIVADO // SIN SESIÓN INICIADA
              </p>
              <div className="text-[9px] font-mono text-neutral-500">
                CONECTA GOOGLE AUTH PARA ACTIVAR EL RESPALDO
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Actions */}
        <div className="flex flex-col gap-2.5 h-full justify-center">
          {currentUser ? (
            <>
              <button
                onClick={async () => {
                  if (!currentUser) return;
                  setIsCloudSyncing(true);
                  try {
                    await pushAllLocalToCloud(currentUser.uid);
                    setConfettiTrigger((v) => v + 1);
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setIsCloudSyncing(false);
                  }
                }}
                disabled={isCloudSyncing}
                className="w-full bg-electric-blue text-pure-white hover:bg-white hover:text-pure-black font-brutalist py-2.5 px-4 text-xs tracking-widest uppercase transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 select-none shadow-md shadow-electric-blue/15 disabled:opacity-50"
              >
                {isCloudSyncing
                  ? "SINCRO-RESPALDO EN PROCESO..."
                  : "🚀 SUBIR HISTORIAL COMPLETO"}
              </button>
              <button
                onClick={async () => {
                  try {
                    await signOut(auth);
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="w-full bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white hover:border-white font-mono py-2 text-[10px] tracking-widest uppercase transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogOut size={11} /> CERRAR ACCESO SEGURO
              </button>
            </>
          ) : (
            <button
              onClick={async () => {
                try {
                  await signInWithPopup(auth, googleProvider);
                } catch (e) {
                  console.error(e);
                }
              }}
              className="w-full bg-pure-white text-pure-black hover:bg-neutral-200 font-brutalist py-3.5 px-4 text-xs tracking-widest uppercase transition-all duration-200 cursor-pointer shadow-lg hover:shadow-white/5 flex items-center justify-center gap-2 select-none font-bold"
            >
              🔐 INICIAR SESIÓN CON GOOGLE
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
```

## File: src/components/CoachChat.tsx
```tsx
import { useState, useEffect, useRef } from 'react';
import { AthleteState } from '../types/workout';
import { MessageSquare, Send, Sparkles, X, Brain, Heart, Zap, ShieldAlert, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface PushNotification {
  id: string;
  message: string;
  type: 'goal' | 'urgent' | 'info';
}

interface CoachChatProps {
  currentWorkouts: any;
  activeWeek: string;
  activeDayId: string;
  athlete: AthleteState;
  sideQuests: any;
  dailyGoals: Record<string, string>;
  onUpdateWorkouts: (workouts: any) => void;
  onUpdateAthlete: (athlete: AthleteState) => void;
  onUpdateSideQuests: (sideQuests: any) => void;
  onTriggerLightning?: () => void;
}

const PRESETS = [
  { label: '🏆 Reportar entrenamiento', prompt: 'Coach L4, vengo a reportar mi entrenamiento y mi Misión Secundaria de hoy. Te detallo qué ejercicios hice, mis repeticiones, cargas de peso, el RPE/RIR sentido, si mantuve el ROM completo y postura neutra, y si tuve que hacer alguna adaptación o escalado. Califícame y calcula mi recompensa.' },
  { label: '🛠️ Escalar el día de hoy', prompt: 'Coach, me siento un poco cansado hoy del SNC. ¿Podrías escalar el WOD o ejercicios de hoy manteniendo el estímulo fisiológico original pero regulando el RPE?' },
  { label: '🥤 ¿Por qué no guantes?', prompt: 'Coach, explícame por qué desaconsejas usar guantes en barra y cómo funciona el pliegue táctico de fibra de carbono.' },
  { label: '🏢 Adapta para Haedo', prompt: 'Coach L4, hoy entrenaré en Haedo. Por favor adapta la rutina de hoy considerando las limitaciones de espacio y equipamiento (mancuernas/médicas).' },
  { label: '🍕 Mitigar flexión core', prompt: 'Coach L4, siento molestia espinal baja. ¿Cómo hackeamos la rutina de hoy para desconectar por completo el psoas ilíaco?' }
];

export default function CoachChat({
  currentWorkouts,
  activeWeek,
  activeDayId,
  athlete,
  sideQuests,
  dailyGoals,
  onUpdateWorkouts,
  onUpdateAthlete,
  onUpdateSideQuests,
  onTriggerLightning
}: CoachChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [coachNotes, setCoachNotes] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Expose opening the chat from the outside
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open_nexus_chat', handleOpen);
    return () => window.removeEventListener('open_nexus_chat', handleOpen);
  }, []);

  // Expose receiving push notifications
  useEffect(() => {
    const handlePush = (e: any) => {
      if (e.detail) {
        const newNotif: PushNotification = {
          id: Math.random().toString(36).substring(7),
          message: e.detail.message,
          type: e.detail.type || 'info',
        };
        setNotifications(prev => [...prev, newNotif]);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
        }, 5000);
      }
    };
    window.addEventListener('nexus_push_notification', handlePush);
    return () => window.removeEventListener('nexus_push_notification', handlePush);
  }, []);

  // Load conversational history and notes from localStorage on mount
  useEffect(() => {
    const savedMsg = localStorage.getItem('nexus_coach_chat_v1');
    if (savedMsg) {
      try {
        setMessages(JSON.parse(savedMsg));
      } catch (e) {
        console.error('Failed to parse chat messages', e);
      }
    } else {
      // Warm initial welcome
      setMessages([
        {
          role: 'assistant',
          content: `¡Saludos, Nephalem **${athlete.identity}**! 🏋️‍♂️\n\nSoy **Nexus L4**, tu Master Coach clínico. Estoy listo para asistirte en vivo. Puedes hablar conmigo sobre tu entrenamiento, pedirme que re-estructure partes de tu rutina, que escale pesos, o que registre notas sobre tu progreso.\n\n*Dime: ¿en qué hackearemos tu entrenamiento hoy?*`
        }
      ]);
    }

    const savedNotes = localStorage.getItem('nexus_coach_notes_v1');
    if (savedNotes) {
      try {
        setCoachNotes(JSON.parse(savedNotes));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Sync assistant welcome message when athlete name is updated dynamically
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'assistant' && (messages[0].content.includes('Saludos, Nephalem') || messages[0].content.includes('Saludos,'))) {
      setMessages([
        {
          role: 'assistant',
          content: `¡Saludos, Nephalem **${athlete.identity}**! 🏋️‍♂️\n\nSoy **Nexus L4**, tu Master Coach clínico. Estoy listo para asistirte en vivo. Puedes hablar conmigo sobre tu entrenamiento, pedirme que re-estructure partes de tu rutina, que escale pesos, o que registre notas sobre tu progreso.\n\n*Dime: ¿en qué hackearemos tu entrenamiento hoy?*`
        }
      ]);
    }
  }, [athlete.identity]);

  // Save changes to localStorage on message update
  const saveMessages = (newMsgs: Message[]) => {
    setMessages(newMsgs);
    localStorage.setItem('nexus_coach_chat_v1', JSON.stringify(newMsgs));
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    const updatedHistory = [...messages, userMessage];
    saveMessages(updatedHistory);
    setInput('');
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory,
          currentWorkouts,
          athlete,
          activeWeek,
          activeDayId,
          sideQuests,
          dailyGoals
        })
      });

      if (!response.ok) {
        throw new Error('API server fluctuation');
      }

      const data = await response.json();
      
      // Update history with assistant reply
      const botMessage: Message = { role: 'assistant', content: data.message };
      saveMessages([...updatedHistory, botMessage]);

      // Check for live mutations
      if (data.updatedWorkouts) {
        onUpdateWorkouts(data.updatedWorkouts);
        triggerVisualSparkle('workouts');
      }

      if (data.updatedAthlete) {
        onUpdateAthlete(data.updatedAthlete);
        triggerVisualSparkle('athlete');
      }

      // Check if the AI filled in/updated side quests
      if (data.updatedSideQuests) {
        const wasCompleted = !!sideQuests[activeDayId]?.completed;
        const isCompleted = !!data.updatedSideQuests[activeDayId]?.completed;
        
        onUpdateSideQuests(data.updatedSideQuests);
        triggerVisualSparkle('sideQuests');

        if (isCompleted && !wasCompleted && onTriggerLightning) {
          onTriggerLightning();
        }
      }

      // Check if the AI filled in/updated exercise logs (RPE, RIR, reps, weights)
      if (data.updatedLogs && typeof data.updatedLogs === 'object') {
        Object.keys(data.updatedLogs).forEach(key => {
          const rawLogs = data.updatedLogs[key];
          if (Array.isArray(rawLogs)) {
            localStorage.setItem(key, JSON.stringify(rawLogs));
          }
        });
        // Dispatch event to update logs and charts immediately
        window.dispatchEvent(new Event('nexus_logs_updated'));
        triggerVisualSparkle('logs');
      }

      if (data.coachNotes && Array.isArray(data.coachNotes)) {
        setCoachNotes(data.coachNotes);
        localStorage.setItem('nexus_coach_notes_v1', JSON.stringify(data.coachNotes));
      }
    } catch (error) {
      console.error('Error during AI Chat:', error);
      saveMessages([
        ...updatedHistory,
        {
          role: 'assistant',
          content: '¡Alerta de SNC! He detectado una fluctuación de internet al entablar contacto con mi cerebro en la nube. Por favor, reitera tu consulta.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm('¿Está seguro de que desea borrar el historial de conversación con el Coach Nexus L4?')) {
      const initial: Message[] = [
        {
          role: 'assistant',
          content: `¡Historial borrado, Nephalem **${athlete.identity}**! El psoas se ha relajado. Mi bitácora de entrenamiento está limpia para registrar nuevos ciclos.`
        }
      ];
      saveMessages(initial);
      setCoachNotes([]);
      localStorage.removeItem('nexus_coach_notes_v1');
    }
  };

  const [sparkleType, setSparkleType] = useState<string | null>(null);
  const triggerVisualSparkle = (type: string) => {
    setSparkleType(type);
    setTimeout(() => setSparkleType(null), 3500);
  };

  return (
    <>
      {/* GLOBAL PUSH NOTIFICATION SYSTEM (L4 Coach AI Direct Messages) */}
      <div className="fixed top-6 right-6 z-[999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              layout
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-md shadow-2xl border font-mono text-xs w-72 md:w-80 backdrop-blur-md ${
                notif.type === 'goal'
                  ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100'
                  : notif.type === 'urgent'
                  ? 'bg-rose-950/90 border-rose-500/50 text-rose-100'
                  : 'bg-zinc-900/90 border-[#00f0ff]/30 text-white'
              }`}
            >
              <div className="shrink-0 pt-0.5">
                {notif.type === 'goal' ? <Award size={16} className="text-emerald-400" /> :
                 notif.type === 'urgent' ? <ShieldAlert size={16} className="text-rose-500 " /> :
                 <Brain size={16} className="text-[#00f0ff]" />}
              </div>
              <div className="flex-1 leading-relaxed whitespace-pre-wrap">
                {notif.message}
              </div>
              <button 
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                className="shrink-0 text-white/50 hover:text-white"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* FLOATING SPARK TOGGLE BUTTON (No Margin Clutter) */}
      <div className="fixed bottom-6 right-6 z-40 no-print flex flex-col items-end gap-2">
        <AnimatePresence>
          {sparkleType && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-zinc-900 border border-emerald-500/30 text-white text-[10px] md:text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xl font-mono text-[10px] uppercase font-bold"
            >
              <Zap size={11} className="text-amber-400" />
              <span>
                {sparkleType === 'workouts' 
                  ? '¡Rutina Modificada en Vivo por IA!' 
                  : '¡Ficha de Atleta Sincronizada!'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          id="btn-toggle-coach-chat"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-mono font-bold tracking-wider text-xs shadow-2xl transition-all hover:scale-105 select-none uppercase cursor-pointer z-40 border ${
            isOpen 
              ? 'bg-rose-600 text-white border-rose-700' 
              : 'bg-zinc-900 text-white hover:bg-black border-zinc-800'
          }`}
        >
          <Brain size={15} className={` text-rose-500`} />
          <span>{isOpen ? 'CERRAR CONSULTORIO' : 'CHATEAR CON L4 COACH AI'}</span>
          {!isOpen && (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -top-1 -right-1" />
          )}
        </button>
      </div>

      {/* CHAT PANEL SIDEBAR (Japan Brutalist - First Take Tone) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 260 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 260 }}
            transition={{ type: 'spring', damping: 24, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-full max-w-[430px] md:max-w-[460px] bg-[#FAFAFA] dark:bg-[#0D0D11] border-l border-zinc-200 dark:border-neutral-800 shadow-2xl z-[100] flex flex-col justify-between no-print font-sans normal-case"
          >
            {/* PANEL HEADER */}
            <div className="p-4 md:p-5 border-b border-zinc-200 dark:border-neutral-800 bg-white dark:bg-zinc-950 flex justify-between items-center relative">
              <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-rose-600" />
              
              <div className="pl-3.5 flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-rose-600 rounded-full" />
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-main)] font-mono flex items-center gap-1.5 leading-none">
                    <span>NEXUS L4 // COACH BIOMECÁNICO</span>
                  </h3>
                  <span className="text-[9px] text-[var(--text-muted)] font-mono font-extrabold block mt-1 tracking-widest">
                    CERTIFIED L4 COACH (PRVN • HWPO • MAYHEM)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  className="text-[9px] border border-zinc-200 dark:border-neutral-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 px-2.5 py-1 text-[var(--text-muted)] hover:text-rose-600 rounded-lg font-bold uppercase transition cursor-pointer"
                  title="Reiniciar chat"
                >
                  Limpiar
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 px-1.5 text-white hover:text-white font-bold transition rounded-full hover:bg-rose-700 bg-rose-600 cursor-pointer shadow flex items-center justify-center border border-rose-500 scale-95 origin-center hover:scale-100"
                  title="Cerrar Panel"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              </div>
            </div>

            {/* CHAT MESSAGE PANEL SCROLLER */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 bg-zinc-50 dark:bg-[#09090C]">
              
              {/* CURRENT NOTES SUBPANEL (Coach Clinical Remarks) */}
              {coachNotes.length > 0 && (
                <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-neutral-800 p-4 rounded-xl shadow-xs">
                  <div className="text-[9px] font-mono font-bold tracking-widest text-rose-600 uppercase flex items-center gap-1.5 mb-2 pb-1.5 border-b border-zinc-100 dark:border-zinc-800">
                    <ShieldAlert size={11} className="inline text-rose-500 shrink-0" />
                    <span>L4 CLINICAL TAKEAWAYS (EN VIVO):</span>
                  </div>
                  <ul className="space-y-1.5 list-none text-[10px] md:text-xs">
                    {coachNotes.map((note, idx) => (
                      <li key={`note-c-${idx}`} className="text-[var(--text-main)] flex items-start gap-1 font-medium italic">
                        <span className="text-rose-600 mr-1 font-bold font-mono">▸</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* MESSAGES LOOPER */}
              <div className="space-y-4">
                {messages.map((msg, idx) => {
                  const isAssistant = msg.role === 'assistant';
                  return (
                    <div
                      key={`msg-coach-${idx}`}
                      className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                    >
                      <div className="text-[8px] font-mono text-[var(--text-muted)] uppercase mb-1 px-1 tracking-widest font-extrabold">
                        {isAssistant ? 'NEXUS CF-L4' : athlete.identity}
                      </div>
                      
                      <div
                        className={`p-3.5 max-w-[90%] text-xs md:text-sm font-medium leading-relaxed rounded-2xl shadow-sm ${
                          isAssistant
                            ? 'bg-white dark:bg-zinc-900 text-[var(--text-main)] rounded-tl-none border border-zinc-100 dark:border-zinc-800'
                            : 'bg-zinc-900 text-white rounded-tr-none'
                        }`}
                      >
                        {/* Render simple custom text styling with bolding */}
                        {msg.content.split('\n').map((line, lIdx) => {
                          // Very basic markdown parser for strong syntax
                          const contentWithBold = line.split('**').map((chunk, cIdx) => {
                            if (cIdx % 2 === 1) {
                              return <strong key={cIdx} className="font-extrabold text-rose-600 dark:text-rose-400">{chunk}</strong>;
                            }
                            return chunk;
                          });
                          return (
                            <p key={lIdx} className={line === '' ? 'h-3' : 'mb-1.5'}>
                              {contentWithBold}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {isLoading && (
                  <div className="flex flex-col items-start">
                    <span className="text-[8px] font-mono text-[var(--text-muted)] uppercase mb-1 tracking-widest font-extrabold text-red-500 ">
                      NEXUS L4... ANALIZANDO PSICOMETRÍA Y BIOMECÁNICA
                    </span>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-600" />
                      <div className="w-2 h-2 rounded-full bg-rose-600" />
                      <div className="w-2 h-2 rounded-full bg-rose-600" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* PRESET INTEGRATED CHIPS */}
            <div className="p-3 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-neutral-800">
              <div className="text-[8px] text-[var(--text-muted)] font-mono font-bold uppercase mb-2 tracking-widest pl-1">
                PREGUNTAS RÁPIDAS AL COACH (EN VIVO):
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
                {PRESETS.map((preset, idx) => (
                  <button
                    key={`preset-${idx}`}
                    onClick={() => handleSendMessage(preset.prompt)}
                    className="shrink-0 bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-neutral-800 hover:border-rose-600 hover:bg-rose-50/10 text-[9px] md:text-[10px] text-[var(--text-main)] font-semibold px-2.5 py-1.5 rounded-lg uppercase tracking-wider transition-all select-none cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* MESSAGE INPUT CONSOLE */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(input);
              }}
              className="p-3 md:p-4 border-t border-zinc-200 dark:border-neutral-800 bg-white dark:bg-zinc-950 flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pregunta o pide mutar rutina..."
                disabled={isLoading}
                className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-neutral-800 text-[var(--text-main)] rounded-xl px-3.5 py-2.5 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-rose-500 font-semibold leading-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-zinc-900 dark:bg-[#18181F] text-white border border-zinc-700 hover:bg-rose-600 hover:border-rose-700 p-2.5 px-3.5 rounded-xl transition cursor-pointer disabled:opacity-40 shrink-0 flex items-center justify-center"
              >
                <Send size={14} className="stroke-[2.5px]" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

## File: src/components/Confetti.tsx
```tsx
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface ConfettiProps {
  trigger: number;
}

interface Particle {
  id: string;
  color: string;
  size: number;
  shape: 'circle' | 'square' | 'triangle';
  startX: string;
  startY: string;
  targetX: number;
  targetY: number;
  rotateTarget: number;
}

export default function Confetti({ trigger }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (trigger === 0) return;

    const colors = [
      '#FF0055', // Rose hot
      '#0066FF', // Blue neon
      '#10B981', // Metcon green
      '#F59E0B', // Accessory amber
      '#8B5CF6', // Rest purple
      '#EF4444', // Red impact
      '#06B6D4', // Cyan
      '#F43F5E', // Rose-500
      '#10B981', // Emerald-500
      '#EC4899'  // Pink-500
    ];
    
    const shapes: ('circle' | 'square' | 'triangle')[] = ['circle', 'square', 'triangle'];

    // Emit 45 particles from the bottom-left corner
    const leftParticles: Particle[] = Array.from({ length: 45 }).map((_, i) => {
      // Angle between -15 deg (right-up) and -75 deg (mostly vertical)
      const angleDeg = -15 - Math.random() * 60;
      const angleRad = (angleDeg * Math.PI) / 180;
      const distance = 160 + Math.random() * 380;
      
      const size = 6 + Math.random() * 11;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      
      const targetX = Math.cos(angleRad) * distance;
      const targetY = Math.sin(angleRad) * distance;
      
      return {
        id: `confetti-L-${trigger}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        color,
        size,
        shape,
        startX: '5%',
        startY: '95%',
        targetX,
        targetY,
        rotateTarget: 360 + Math.random() * 720
      };
    });

    // Emit 45 particles from the bottom-right corner
    const rightParticles: Particle[] = Array.from({ length: 45 }).map((_, i) => {
      // Angle between-105 deg (mostly vertical) and -165 deg (left-up)
      const angleDeg = -105 - Math.random() * 60;
      const angleRad = (angleDeg * Math.PI) / 180;
      const distance = 160 + Math.random() * 380;
      
      const size = 6 + Math.random() * 11;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      
      const targetX = Math.cos(angleRad) * distance;
      const targetY = Math.sin(angleRad) * distance;
      
      return {
        id: `confetti-R-${trigger}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        color,
        size,
        shape,
        startX: '95%',
        startY: '95%',
        targetX,
        targetY,
        rotateTarget: -(360 + Math.random() * 720)
      };
    });

    setParticles([...leftParticles, ...rightParticles]);

    // Cleanup after animation finishes
    const timer = setTimeout(() => {
      setParticles([]);
    }, 4000);

    return () => clearTimeout(timer);
  }, [trigger]);

  if (particles.length === 0) return null;

  return (
    <motion.div 
      key={`confetti-${trigger}`}
      initial={{ scale: 0.4, y: 100, opacity: 0 }}
      animate={{ 
        scale: [0.4, 1.25, 0.9, 1.05, 1], 
        y: [100, -25, 10, -3, 0],
        opacity: 1 
      }}
      transition={{ 
        type: "tween",
        ease: "easeOut",
        duration: 0.95
      }}
      className="fixed inset-0 pointer-events-none z-[100] overflow-hidden"
    >
      {particles.map((p) => {
        let borderRadius = '0%';
        if (p.shape === 'circle') borderRadius = '50%';
        
        let clipPath = undefined;
        if (p.shape === 'triangle') {
          clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
        }

        return (
          <motion.div
            key={p.id}
            initial={{ 
              opacity: 1, 
              scale: 0.1, 
              x: 0, 
              y: 0, 
              rotate: 0 
            }}
            animate={{ 
              opacity: [1, 1, 0.8, 0], 
              scale: [0.2, 1.2, 0.9, 0], 
              x: p.targetX, 
              y: p.targetY + 250, // Gravity acceleration emulation
              rotate: p.rotateTarget 
            }}
            transition={{ 
              duration: 3.2, 
              ease: [0.1, 0.8, 0.35, 1] 
            }}
            style={{
              position: 'absolute',
              left: p.startX,
              top: p.startY,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius,
              clipPath,
            }}
          />
        );
      })}
    </motion.div>
  );
}
```

## File: src/components/DailyMissionPanel.tsx
```tsx
import React from "react";
import { motion } from "motion/react";
import { Sparkles, Trophy, RotateCcw, Check, Dices } from "lucide-react";

interface DailyMissionPanelProps {
  dayId: string;
  dailyGoalText: string;
  isGeneratingQuest: boolean;
  sideQuestCompleted: boolean;
  questData: any;
  rewards: { xp: number; item: string };
  isHelpOpen: boolean;
  setIsHelpOpen: (open: boolean) => void;
  dayTitleAlertTrigger: boolean;
  handleFetchSideQuest: () => Promise<void>;
  handleResetQuest: (dayId: string) => void;
  mousePos: { x: number; y: number };
}

export default function DailyMissionPanel({
  dayId,
  dailyGoalText,
  isGeneratingQuest,
  sideQuestCompleted,
  questData,
  rewards,
  isHelpOpen,
  setIsHelpOpen,
  dayTitleAlertTrigger,
  handleFetchSideQuest,
  handleResetQuest,
}: DailyMissionPanelProps) {
  return (
    <motion.div
      animate={
        dayTitleAlertTrigger
          ? {
              scale: [1, 1.04, 0.98, 1.02, 1],
              borderColor: [
                "rgba(255,255,255,0.05)",
                "rgba(0,240,255,0.8)",
                "rgba(255,0,127,0.8)",
                "rgba(0,240,255,0.4)",
                "rgba(255,255,255,0.05)",
              ],
              boxShadow: [
                "0 4px 20px rgba(0,0,0,0.65)",
                "0 0 15px rgba(0,240,255,0.35)",
                "0 0 20px rgba(255,0,127,0.35)",
                "0 0 10px rgba(0,240,255,0.15)",
                "0 4px 20px rgba(0,0,0,0.65)",
              ],
            }
          : {}
      }
      transition={{ duration: 0.85, ease: "easeInOut" }}
      className="mt-3 w-full max-w-xl mx-auto bg-zinc-950/95 text-white p-1.5 md:p-2 shadow-[0_4px_25px_rgba(0,0,0,0.8)] font-mono text-left relative overflow-hidden rounded-none border border-white/5"
    >
      <div className="flex justify-between items-center text-[7.5px] sm:text-[8px] font-bold text-zinc-500 border-b border-white/5 pb-0.5 mb-1.5 uppercase tracking-widest leading-none">
        <span className="flex items-center gap-1">
          <Sparkles size={8} className="text-amber-500" />★ OBJ. DIARIO
        </span>
        <span className="text-amber-500 font-extrabold pb-0.5">
          MISIÓN SECUNDARIA
        </span>
      </div>

      <div className="grid grid-cols-12 gap-x-2 gap-y-1.5 items-center">
        <div className="col-span-12 sm:col-span-7 flex justify-between items-center gap-1.5 border-b sm:border-b-0 sm:border-r border-white/10 pb-1 sm:pb-0 sm:pr-2.5">
          <div className="flex-1 min-h-[1.2rem] flex items-center">
            <p className="font-bold text-[9.5px] sm:text-[10px] tracking-wide uppercase text-zinc-100 border-l-2 border-[#00f0ff] pl-1.5 py-0 w-full whitespace-normal break-words leading-snug">
              {isGeneratingQuest ? (
                <span className="text-neutral-500 flex items-center gap-1">
                  <span>BUSCANDO EN LA BASE CO-OP RE-ROLL CON IA...</span>
                </span>
              ) : (
                dailyGoalText || "DALE CLIC AL DADO PARA GENERAR LA MISIÓN SECUNDARIA CON IA"
              )}
            </p>
          </div>
          {!sideQuestCompleted && (
            <button
              onClick={handleFetchSideQuest}
              disabled={isGeneratingQuest}
              className="bg-electric-blue/15 text-electric-blue hover:bg-electric-blue/25 disabled:bg-neutral-800 disabled:text-neutral-600 p-0.5 shadow-sm hover:shadow-sm active:scale-95 transition-all cursor-pointer rounded-none shrink-0 group relative overflow-hidden flex items-center justify-center"
              title="Obtener misión seleccionada por IA según el entreno del día"
              style={{ width: "20px", height: "20px" }}
            >
              <Dices
                size={10}
                className={`transition-transform text-white ${isGeneratingQuest ? "animate-spin" : "group-hover:rotate-12"}`}
              />
            </button>
          )}
        </div>

        <div className="col-span-12 sm:col-span-5">
          {sideQuestCompleted && questData ? (
            <div className="animate-fade-in space-y-1">
              <div className="bg-amber-500/10 p-1 rounded-none flex justify-between items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="bg-amber-500 text-black p-0.5 rounded-none shrink-0">
                    <Trophy size={9} />
                  </div>
                  <span className="text-[7.5px] font-black text-amber-400 uppercase tracking-wider leading-none">
                    PRUEBA VALIDADA
                  </span>
                </div>
                <button
                  onClick={() => handleResetQuest(dayId)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-[7px] font-bold uppercase tracking-wider py-0.5 px-1 flex items-center gap-0.5 transition-all rounded-none shrink-0"
                  type="button"
                >
                  <RotateCcw size={7} /> REABRIR
                </button>
              </div>

              <div className="bg-zinc-900/40 p-1 space-y-0.5 text-[9px] text-left rounded-none font-mono">
                <div className="grid grid-cols-3 gap-0.5">
                  <div className="bg-black/40 p-0.5 text-center rounded-none">
                    <span className="text-[6.5px] text-zinc-500 block uppercase font-bold leading-none mb-0.5">
                      XP
                    </span>
                    <span className="text-[8.5px] font-black text-[#00f0ff]">
                      +{questData.xpEarned || rewards.xp}
                    </span>
                  </div>
                  <div className="bg-black/40 p-0.5 text-center rounded-none">
                    <span className="text-[6.5px] text-zinc-500 block uppercase font-bold leading-none mb-0.5">
                      SCORE
                    </span>
                    <span className="text-[8.5px] font-black text-amber-400">
                      {questData.evalScore || 90}/100
                    </span>
                  </div>
                  <div className="bg-black/40 p-0.5 text-center rounded-none flex flex-col justify-center">
                    <span className="text-[6.5px] text-zinc-500 block uppercase font-bold leading-none mb-0.5">
                      BOTÍN
                    </span>
                    <span
                      className="text-[7.5px] font-black text-emerald-400 line-clamp-1"
                      title={questData.rewardItem}
                    >
                      🛡️ {questData.rewardItem || rewards.item}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-0.5 pt-0.5 text-[6.5px]">
                  <span className="inline-flex items-center gap-0.5 bg-emerald-500/10 text-emerald-400 font-bold px-1 py-0.2 rounded-none">
                    <Check size={7} /> ROM
                  </span>
                  <span className="inline-flex items-center gap-0.5 bg-emerald-500/10 text-emerald-400 font-bold px-1 py-0.2 rounded-none">
                    <Check size={7} /> POSTURA
                  </span>
                </div>

                {questData.aiFeedback && (
                  <div
                    className="bg-black p-1 rounded-none leading-tight text-zinc-400 text-[8px] line-clamp-2"
                    title={questData.aiFeedback}
                  >
                    <p className="italic font-sans leading-tight">
                      "{questData.aiFeedback}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="animate-fade-in space-y-1.5">
              <div className="flex justify-between items-center text-[7.5px] pb-0.5 font-mono leading-none">
                <span className="text-zinc-500 font-bold">RECOMPENSAS:</span>
                <span className="text-electric-blue font-bold flex items-center gap-0.5">
                  <Sparkles size={7} className="text-amber-500" />
                  <span>+{rewards.xp} XP</span>
                </span>
              </div>

              <div className="bg-zinc-900/60 p-1 border border-white/5 rounded-none flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setIsHelpOpen(!isHelpOpen)}
                  className="flex items-center gap-1 text-[8px] font-black text-electric-blue uppercase tracking-wider font-mono hover:text-electric-blue/80 transition-colors focus:outline-none cursor-pointer"
                >
                  <Sparkles size={7} className="text-[#00f0ff] shrink-0" />
                  <span>{isHelpOpen ? "▲ OCULTAR" : "▼ GUÍA"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new Event("open_nexus_chat"));
                  }}
                  className="py-1 px-1.5 font-brutalist text-[8px] font-black tracking-widest text-center bg-electric-blue text-white hover:bg-opacity-95 cursor-pointer active:scale-[0.98] uppercase flex items-center gap-0.5 transition-all"
                >
                  <span>REPORTAR</span>
                </button>
              </div>

              <div
                className={`transition-all duration-300 overflow-hidden ${
                  isHelpOpen ? "max-h-[150px] mt-0.5 opacity-100 pt-0.5 border-t border-white/5" : "max-h-0 opacity-0 pointer-events-none"
                }`}
              >
                <p className="text-[7.5px] font-mono text-zinc-400 text-left leading-tight">
                  Reporta pesos, RPE/RIR, o adaptaciones al **Coach Chat** para recibir XP y botín.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
```

## File: src/components/ExerciseLogger.tsx
```tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Dumbbell, Star, ChevronDown, Sparkles, Award, FileText, Flame, Share2, Download, X } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { isCardio as classifyIsCardio, isBodyweightOnly as classifyIsBodyweightOnly } from '../lib/workoutClassifier';
import { getSuggestedRpe, getBiomechanicalTips } from '../lib/biomechanicsAdvisor';

interface ExerciseLog {
  id: string;
  weight: string;
  reps: string;
  rpe: string;
  rir?: string;
  timestamp: number;
}

interface ExerciseLoggerProps {
  dayId: string;
  exerciseName: string;
  rawItemHtml?: string;
  onLogsChange?: (avg: number | null) => void;
}

export default function ExerciseLogger({ dayId, exerciseName, rawItemHtml, onLogsChange }: ExerciseLoggerProps) {
  const localStorageKey = `nexus_logs_${dayId}_${exerciseName.replace(/\s+/g, '_')}`;
  
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [rpe, setRpe] = useState('8'); // default common RPE
  const [rir, setRir] = useState('2'); // default RIR for RPE 8
  const [isExpanded, setIsExpanded] = useState(false);
  const [historicMax, setHistoricMax] = useState<number>(0);
  const [lastLog, setLastLog] = useState<ExerciseLog | null>(null);
  const [historicAvgRpe, setHistoricAvgRpe] = useState<number | null>(null);
  const [rpeTrend, setRpeTrend] = useState<{name: string; rpe: number; timestamp: number}[]>([]);
  const [isFlashing, setIsFlashing] = useState(false);
  const [biomechanicsChecklist, setBiomechanicsChecklist] = useState({
    rom: false,
    posture: false,
    stability: false
  });
  const [showPacing, setShowPacing] = useState(false);
  const [calInput, setCalInput] = useState('15');
  const [showAdvancedL4, setShowAdvancedL4] = useState(false);

  const isCardio = useMemo(() => classifyIsCardio(exerciseName, rawItemHtml), [exerciseName, rawItemHtml]);

  const isBodyweightOnly = useMemo(() => classifyIsBodyweightOnly(exerciseName, rawItemHtml), [exerciseName, rawItemHtml]);

  // Adjust placeholder defaults when isCardio toggles or mounts
  useEffect(() => {
    if (isCardio) {
      setRir('N/D');
    } else {
      setRir('2');
    }
  }, [isCardio]);

  const updateRpeAndRir = (newRpe: string) => {
    setRpe(newRpe);
    if (isCardio) {
      // Cardio does not mathematically bind RIR/Pacing to RPE
      return;
    }
    const numeric = parseFloat(newRpe);
    if (!isNaN(numeric)) {
      const computedRir = 10 - numeric;
      if (computedRir >= 0 && computedRir <= 6) {
        setRir(String(computedRir));
      } else {
        setRir('N/D');
      }
    } else {
      setRir('N/D');
    }
  };

  const updateRirAndRpe = (newRir: string) => {
    setRir(newRir);
    if (isCardio) {
      // Cardio does not mathematically bind Pace/Cadencia to RPE
      return;
    }
    if (newRir === 'N/D' || newRir.trim() === '') return;
    const numeric = parseFloat(newRir);
    if (!isNaN(numeric)) {
      const computedRpe = 10 - numeric;
      if (computedRpe >= 1 && computedRpe <= 10) {
        setRpe(String(computedRpe));
      }
    }
  };

  const [athlete, setAthlete] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_athlete_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (saved.includes('Banquete') || saved.includes('Druida') || saved.includes('Warlock') || saved.includes('Zancada') || saved.includes('Poción') || saved.includes('Héroes')) {
          parsed.level = "CF-L4 Master Coach // Elite Athlete ⚡";
          parsed.restriction = "RPE 8/10 MÁX (Control Biomecánico Sano)";
          parsed.condition = "Recuperación Sistémica Post-Competencia";
          parsed.equipment = {
            grebas: "Rodilleras de Neoprene de 7mm",
            amuleto: "Calleras de Fibra de Carbono",
            filtro: "Tape Elástico de Pulgares"
          };
        }
        return parsed;
      }
    } catch (e) {}
    return {
      identity: "GERARDO & FLOR",
      level: "CF-L4 Master Coach // Elite Athlete ⚡",
      restriction: "RPE 8/10 MÁX (Control Biomecánico Sano)",
      condition: "Recuperación Sistémica Post-Competencia",
      equipment: {
        grebas: "Rodilleras de Neoprene de 7mm",
        amuleto: "Calleras de Fibra de Carbono",
        filtro: "Tape Elástico de Pulgares"
      }
    };
  });

  // Sync athlete fixes to localstorage asynchronously
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nexus_athlete_state');
      if (saved && (saved.includes('Banquete') || saved.includes('Druida') || saved.includes('Warlock') || saved.includes('Zancada') || saved.includes('Poción') || saved.includes('Héroes'))) {
        localStorage.setItem('nexus_athlete_state', JSON.stringify(athlete));
      }
    } catch (e) {}
  }, [athlete]);

  useEffect(() => {
    const syncAthlete = () => {
      try {
        const saved = localStorage.getItem('nexus_athlete_state');
        if (saved) {
          setAthlete(JSON.parse(saved));
        }
      } catch (e) {}
    };
    window.addEventListener('nexus_athlete_updated', syncAthlete);
    window.addEventListener('storage', syncAthlete);
    return () => {
      window.removeEventListener('nexus_athlete_updated', syncAthlete);
      window.removeEventListener('storage', syncAthlete);
    };
  }, []);

  // Find historic maximum weight across all logged sessions of this exercise
  useEffect(() => {
    const computeHistoricMax = () => {
      let maxWeight = 0;
      let latestLog: ExerciseLog | null = null;
      const cleanName = exerciseName.replace(/\s+/g, '_');
      const allRpes: number[] = [];
      const sessionsMap = new Map<string, { totalRpe: number, count: number, maxTimestamp: number }>();

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('nexus_logs_') && key.endsWith(`_${cleanName}`)) {
          const dayIdPart = key.replace('nexus_logs_', '').replace(`_${cleanName}`, '');

          try {
            const saved = localStorage.getItem(key);
            if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed) && parsed.length > 0) {
                let sessionTotalRpe = 0;
                let sessionCount = 0;
                let maxTimestamp = 0;

                parsed.forEach((log: any) => {
                  const wStr = String(log.weight || '');
                  const match = wStr.match(/(\d+(?:\.\d+)?)/);
                  if (match) {
                    const val = parseFloat(match[1]);
                    if (val > maxWeight) {
                      maxWeight = val;
                    }
                  }

                  const rpeVal = parseFloat(log.rpe);
                  if (!isNaN(rpeVal)) {
                     allRpes.push(rpeVal);
                     sessionTotalRpe += rpeVal;
                     sessionCount++;
                  }
                  if (log.timestamp > maxTimestamp) {
                      maxTimestamp = log.timestamp;
                  }

                  if (!latestLog || log.timestamp > latestLog.timestamp) {
                     latestLog = log;
                  }
                });

                if (sessionCount > 0) {
                   sessionsMap.set(dayIdPart, {
                       totalRpe: sessionTotalRpe,
                       count: sessionCount,
                       maxTimestamp: maxTimestamp
                   });
                }
              }
            }
          } catch (e) {
            // ignore
          }
        }
      }
      setHistoricMax(maxWeight);
      setLastLog(latestLog);

      if (allRpes.length > 0) {
          setHistoricAvgRpe(allRpes.reduce((a, b) => a + b, 0) / allRpes.length);
      } else {
          setHistoricAvgRpe(null);
      }

      // Compute Trend
      const sessionsArray = Array.from(sessionsMap.entries()).map(([sessionDayId, stats]) => {
          return {
              name: sessionDayId.replace('w', 'S').replace('_d', ' D').toUpperCase(),
              rpe: Math.round((stats.totalRpe / stats.count) * 10) / 10,
              timestamp: stats.maxTimestamp
          };
      });
      // Sort by timestamp
      sessionsArray.sort((a, b) => a.timestamp - b.timestamp);
      // Grab last 4
      setRpeTrend(sessionsArray.slice(-4));
    };

    computeHistoricMax();

    // Listen for storage changes or demo data loading
    const handleStorageChange = () => {
      computeHistoricMax();
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('nexus_logs_updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('nexus_logs_updated', handleStorageChange);
    };
  }, [exerciseName, logs]);

  const getSuggestedRpeVal = (weightInput: string, maxWeight: number) => {
    return getSuggestedRpe(weightInput, maxWeight);
  };

  const getBiomechanicalTipsVal = (): string => {
    return getBiomechanicalTips(exerciseName, athlete).join('\n');
  };

  // Load logs on mount/day change
  useEffect(() => {
    const saved = localStorage.getItem(localStorageKey);
    if (saved) {
      try {
        setLogs(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading exercise logs', e);
      }
    } else {
      setLogs([]);
    }
  }, [dayId, exerciseName]);

  // Report average RPE of the last three sets to the parent component
  useEffect(() => {
    if (onLogsChange) {
      if (logs.length > 0) {
        const lastThree = logs.slice(-3);
        const sum = lastThree.reduce((acc, log) => acc + parseFloat(log.rpe), 0);
        onLogsChange(sum / lastThree.length);
      } else {
        onLogsChange(null);
      }
    }
  }, [logs, onLogsChange]);

  // Persist logs
  const saveLogs = (updatedLogs: ExerciseLog[]) => {
    setLogs(updatedLogs);
    localStorage.setItem(localStorageKey, JSON.stringify(updatedLogs));
    window.dispatchEvent(new Event('nexus_logs_updated'));
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight && !reps) return; // Need at least something to log

    const numericRpe = parseFloat(rpe);
    if (!isNaN(numericRpe) && numericRpe >= 9) {
      setIsFlashing(true);
      setTimeout(() => {
        setIsFlashing(false);
      }, 1000);
      
      // Dispatch urgent push notification to CoachChat
      window.dispatchEvent(new CustomEvent('nexus_push_notification', {
        detail: {
          message: `¡ATENCIÓN! Registraste un RPE ${numericRpe}. Estás en territorio de reclutamiento IIB crítico. Modula volumen si notas descenso en la velocidad de la barra.`,
          type: 'urgent'
        }
      }));
    }

    const newLog: ExerciseLog = {
      id: Math.random().toString(36).substring(2, 9),
      weight: isCardio 
        ? (weight.trim() ? weight.trim() : '00:00')
        : (weight.trim() ? `${weight.trim()} kg` : 'P. Corporal'),
      reps: isCardio 
        ? (reps.trim() ? reps.trim() : 'S/D')
        : (reps.trim() ? `${reps.trim()} reps` : 'Max reps'),
      rpe: rpe,
      rir: rir,
      timestamp: Date.now()
    };

    const updated = [...logs, newLog];
    saveLogs(updated);
    
    // Reset inputs, keep RPE as last selected for speed training
    setWeight('');
    setReps('');
    if (isCardio) {
      setRir('N/D');
    } else {
      setRir('2');
    }
  };

  const handleDeleteLog = (id: string) => {
    const updated = logs.filter(log => log.id !== id);
    saveLogs(updated);
  };


  const suggestion = getSuggestedRpe(weight, historicMax);

  // Today's peak weight from logs
  const todayMaxWeight = React.useMemo(() => {
    return logs.reduce((max, log) => {
      const match = log.weight.match(/(\d+(?:\.\d+)?)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (val > max) return val;
      }
      return max;
    }, 0);
  }, [logs]);

  // Relative load percentage
  const relativeLoad = React.useMemo(() => {
    if (historicMax <= 0 || todayMaxWeight <= 0) return 0;
    return Math.round((todayMaxWeight / historicMax) * 100);
  }, [historicMax, todayMaxWeight]);

  // Relative load styling and data descriptors
  const relativeLoadColor = React.useMemo(() => {
    if (relativeLoad === 0) return { bg: 'bg-[#1e1e24]', text: 'text-neutral-400 border-neutral-500/20', border: 'border-neutral-500/20', label: 'Sin Carga', dot: 'bg-neutral-600' };
    if (relativeLoad < 70) return { bg: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/30', text: 'text-emerald-500 dark:text-emerald-400', border: 'border-emerald-500/30', label: 'Carga Ligera (Recuperación)', dot: 'bg-emerald-500' };
    if (relativeLoad < 85) return { bg: 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/30', text: 'text-amber-500 dark:text-amber-400', border: 'border-amber-500/30', label: 'Carga Media (Estímulo)', dot: 'bg-amber-400' };
    if (relativeLoad < 95) return { bg: 'bg-orange-500/10 text-orange-500 dark:text-orange-400 border-orange-500/30', text: 'text-orange-500 dark:text-orange-400', border: 'border-orange-500/30', label: 'Carga Alta (Exigente)', dot: 'bg-orange-500' };
    return { bg: 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/30', text: 'text-rose-500 dark:text-rose-400', border: 'border-rose-500/30', label: 'Carga Crítica (Fallo/L4)', dot: 'bg-red-500' };
  }, [relativeLoad]);

  // Real-time typed weight intensity calculation compared to historic maximum
  const typedLoad = React.useMemo(() => {
    if (historicMax <= 0 || !weight) return 0;
    const cleanWeight = parseFloat(weight.replace(/[^0-9.]/g, ''));
    if (isNaN(cleanWeight) || cleanWeight <= 0) return 0;
    return Math.round((cleanWeight / historicMax) * 100);
  }, [historicMax, weight]);

  const typedPercentageColor = React.useMemo(() => {
    if (typedLoad === 0) return { bg: 'bg-neutral-800', text: 'text-neutral-400', border: 'border-neutral-700', label: 'Sin Carga', dot: 'bg-neutral-500' };
    if (typedLoad < 70) return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'Ligera (Regen)', dot: 'bg-emerald-500' };
    if (typedLoad < 85) return { bg: 'bg-amber-500/10', text: 'text-amber-400 border-amber-500/20', label: 'Media (Estímulo)', dot: 'bg-amber-400' };
    if (typedLoad < 95) return { bg: 'bg-orange-500/10', text: 'text-orange-400 border-orange-500/20', label: 'Alta (Exigente)', dot: 'bg-orange-500' };
    return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', label: 'Crítica (Alerta L4)', dot: 'bg-red-500' };
  }, [typedLoad]);

  const todayAvgRpe = useMemo(() => {
    if (logs.length === 0) return null;
    const sum = logs.reduce((acc, log) => acc + parseFloat(log.rpe), 0);
    return sum / logs.length;
  }, [logs]);

  const fatigueDiff = useMemo(() => {
    if (todayAvgRpe !== null && historicAvgRpe !== null) {
      return (todayAvgRpe - historicAvgRpe).toFixed(1);
    }
    return null;
  }, [todayAvgRpe, historicAvgRpe]);

  const rpeGlowClass = useMemo(() => {
    if (todayAvgRpe === null) return '';
    if (todayAvgRpe >= 9) return ' !border-rose-500 rounded border';
    if (todayAvgRpe >= 8.5) return ' !border-orange-500 rounded border';
    return '';
  }, [todayAvgRpe]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 14 } }
  };

  return (
    <div 
      id={`exercise-logger-${dayId}-${exerciseName.replace(/\s+/g, '-')}`}
      className={`overflow-hidden transition-all duration-200 text-xs text-[var(--text-data)] pb-2 min-w-0 break-words ${rpeGlowClass}`}
    >
      {/* COLLAPSIBLE HEADER */}
      <div className="flex items-stretch w-full mb-1 relative">
        {fatigueDiff !== null && (
          <div className="absolute top-0 right-10 text-[8px] font-mono font-bold uppercase z-10 px-1 py-0.5 rounded opacity-80" 
               style={{ 
                 backgroundColor: parseFloat(fatigueDiff) > 0 ? 'rgba(249,115,22,0.2)' : 'rgba(16,185,129,0.2)',
                 color: parseFloat(fatigueDiff) > 0 ? '#fb923c' : '#34d399'
               }}>
            Fatiga: {parseFloat(fatigueDiff) > 0 ? '+' : ''}{fatigueDiff}
          </div>
        )}
        <button
          type="button"
          id={`btn-toggle-logger-${dayId}-${exerciseName.replace(/\s+/g, '-')}`}
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 flex justify-between items-center py-2 px-1 hover:bg-white/5 transition-colors select-none cursor-pointer text-left rounded-l border border-transparent hover:border-white/10 p-print-only"
        >
          <div className="flex flex-col gap-1 text-white min-w-0 font-condensed font-black text-base sm:text-[1.1rem] tracking-wide leading-tight mt-1 shrink w-full">
            <div className="relative pl-6 w-full text-left">
              <span className="absolute left-0 top-0 h-[1.25em] w-4 flex items-center justify-center select-none font-sans text-[14px]" style={{ color: 'var(--color-electric-blue)' }}>✦</span>
              <div className="flex-1 min-w-0 flex items-start justify-between w-full">
                {rawItemHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: rawItemHtml }} className="shrink pr-2" />
                ) : (
                  <span className="shrink pr-2">{exerciseName}</span>
                )}
                {logs.length > 0 && (
                  <span className="ml-2 mt-px px-2 py-0.5 rounded text-[10px] font-mono font-black border uppercase tracking-wider bg-neutral-800 text-neutral-300 border-neutral-700 whitespace-nowrap no-print self-start shrink-0">
                    {logs.length} series
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 pl-2 pr-1 no-print">
            {!isCardio && historicMax > 0 && (
              <span 
                className={`hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-mono font-black border uppercase tracking-wider ${
                  relativeLoad > 0 ? relativeLoadColor.bg : 'bg-zinc-900 border-zinc-800 text-neutral-400'
                }`}
                title={`Carga Relativa: ${relativeLoad > 0 ? `${relativeLoad}% del Máximo Histórico (${relativeLoadColor.label})` : 'Sin registros hoy'} (Histórico: ${historicMax} kg)`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${relativeLoad > 0 ? relativeLoadColor.dot : 'bg-neutral-600'} ${relativeLoad >= 95 ? '' : relativeLoad > 0 ? '' : ''}`} />
                <span>{relativeLoad > 0 ? `${relativeLoad}%` : '0%'}</span>
              </span>
            )}
            <ChevronDown 
              size={16} 
              className={`text-neutral-500 transform transition-transform duration-200 ${isExpanded ? 'rotate-180 text-white' : ''}`} 
            />
          </div>
        </button>
      </div>

      {/* EXPANDED PANEL */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="p-3 space-y-3 no-print min-w-0"
          >
            
            {/* RPE TREND CHART */}
            {rpeTrend.length > 1 && (
              <motion.div variants={itemVariants} className="bg-[#0A0A0E] border border-white/5 rounded p-2 mb-2">
                <span className="text-[9px] font-bold tracking-widest text-[#00F0FF] uppercase mb-2 block">
                  📈 Tendencia RPE (Últimas sesiones)
                </span>
                <div className="h-16 w-full opacity-80 hover:opacity-100 transition-opacity">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={rpeTrend}>
                      <YAxis domain={[0, 10]} hide />
                      <Line 
                        type="monotone" 
                        dataKey="rpe" 
                        stroke="#fb923c" 
                        strokeWidth={2} 
                        dot={{ r: 2, fill: '#fb923c', strokeWidth: 0 }} 
                        activeDot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }}
                        animationDuration={800}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between mt-1 px-1">
                  {rpeTrend.map((t, idx) => (
                    <span key={idx} className="text-[7px] text-neutral-500 font-mono tracking-wider">{t.name}</span>
                  ))}
                </div>
              </motion.div>
            )}

          {/* LOGGING FORM */}
          <motion.div variants={itemVariants} className="w-full">
            <form onSubmit={handleAddLog} className="space-y-2.5 w-full">
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 w-full">
              <div>
                <div className="h-[12px] flex items-center mb-1 justify-between gap-1">
                  <label className="block text-[8px] font-extrabold text-[var(--text-muted)] uppercase tracking-[0.06em] truncate">
                    {isCardio ? 'TIEMPO' : 'PESO (KG)'}
                  </label>
                  {!isCardio && typedLoad > 0 && (
                    <span 
                      className={`text-[7px] font-mono font-bold flex items-center gap-0.5 px-1 rounded-sm uppercase leading-none truncate max-w-[50px] ${typedPercentageColor.bg} ${typedPercentageColor.text}`}
                      title={`${typedLoad}% del Máximo Histórico (${typedPercentageColor.label})`}
                    >
                      <span className={`w-1 h-1 rounded-full ${typedPercentageColor.dot}`} />
                      {typedLoad}%
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder={isCardio ? "01:45" : (isBodyweightOnly ? "P. Corporal" : "80")}
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  className="w-full bg-[var(--bg-input)] text-[var(--text-main)] border border-[var(--border-color)] rounded px-1 h-[34px] focus:outline-none focus:border-[var(--text-main)] font-mono text-center text-xs transition-colors"
                />
                {lastLog && (
                  <button
                    type="button"
                    onClick={() => {
                      const cleanW = lastLog.weight.endsWith(' kg') 
                        ? lastLog.weight.slice(0, -3) 
                        : lastLog.weight;
                      setWeight(cleanW);
                    }}
                    className="mt-1.5 block text-[8px] sm:text-[9.5px] font-mono text-neutral-400 hover:text-electric-blue cursor-pointer transition-colors leading-tight text-center w-full"
                    title="Hacer clic para cargar este peso"
                  >
                    U. Reg: <span className="font-bold underline decoration-dotted decoration-neutral-500 hover:decoration-electric-blue">{lastLog.weight}</span>
                  </button>
                )}
              </div>
              <div>
                <div className="h-[12px] flex items-center mb-1">
                  <label className="block text-[8px] font-extrabold text-[var(--text-muted)] uppercase tracking-[0.06em] truncate">
                    {isCardio ? 'DIST/CALS' : 'REPS'}
                  </label>
                </div>
                <input
                  type="text"
                  placeholder={isCardio ? "400m / 15cal" : (isBodyweightOnly ? "10" : "6")}
                  value={reps}
                  onChange={e => setReps(e.target.value)}
                  className="w-full bg-[var(--bg-input)] text-[var(--text-main)] border border-[var(--border-color)] rounded px-1 h-[34px] focus:outline-none focus:border-[var(--text-main)] font-mono text-center text-xs transition-colors"
                />
              </div>
              <div>
                <div className="h-[12px] flex justify-between items-center mb-1">
                  <label className="block text-[8px] font-extrabold text-[var(--text-muted)] uppercase tracking-[0.06em] truncate">
                    RPE
                  </label>
                  {!isCardio && suggestion && rpe !== suggestion.rpe && (
                    <button
                      type="button"
                      onClick={() => updateRpeAndRir(suggestion.rpe)}
                      className="hidden lg:inline-flex items-center gap-0.5 text-[var(--accent-main)] dark:text-rose-400 hover:opacity-80 transition-all cursor-pointer text-[7px] font-extrabold uppercase font-mono tracking-wider ml-1"
                      title={`Porcentaje de carga: ${suggestion.percentage}%. Presiona para autocompletar RPE ${suggestion.rpe}`}
                    >
                      <Sparkles size={8} className="fill-[var(--accent-main)] text-[var(--accent-main)]" />
                      Auto:{suggestion.rpe}
                    </button>
                  )}
                </div>
                <select
                  value={rpe}
                  onChange={e => updateRpeAndRir(e.target.value)}
                  className="w-full bg-[var(--bg-input)] text-[var(--text-main)] border border-[var(--border-color)] rounded px-0.5 h-[34px] focus:outline-none focus:border-[var(--text-main)] font-mono text-xs text-center appearance-none cursor-pointer hover:bg-[var(--border-color)] transition-colors"
                >
                  {['10', '9.5', '9', '8.5', '8', '7.5', '7', '6.5', '6', '5', '4'].map(val => (
                     <option key={val} value={val}>{val}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="h-[12px] flex items-center mb-1">
                  <label className="block text-[8px] font-extrabold text-[var(--text-muted)] uppercase tracking-[0.06em] truncate">
                    {isCardio ? 'CADENCIA' : 'RIR'}
                  </label>
                </div>
                <input
                  type={isCardio ? "text" : "number"}
                  min={isCardio ? undefined : "0"}
                  max={isCardio ? undefined : "10"}
                  step={isCardio ? undefined : "0.5"}
                  placeholder={isCardio ? "60 rpm" : "2"}
                  value={rir === 'N/D' ? '' : rir}
                  onChange={e => updateRirAndRpe(e.target.value || 'N/D')}
                  className="w-full bg-[var(--bg-input)] text-[var(--text-main)] border border-[var(--border-color)] rounded px-1 h-[34px] focus:outline-none focus:border-[var(--text-main)] font-mono text-xs text-center transition-colors"
                  title={isCardio ? "Cadencia o ritmo de carrera" : "Reps en Recámara (RIR)"}
                />
              </div>
            </div>
            
            <div className="relative w-full">
              {isFlashing && parseFloat(rpe) >= 9 && (
                <>
                  {/* High Intensity Expanding Rings representing Maximum Neural Drive */}
                  <div className="absolute inset-0 bg-red-600 rounded  opacity-75 pointer-events-none" />
                  <div className="absolute inset-0 bg-amber-500 rounded  opacity-50 delay-150 pointer-events-none" />
                  <div className="absolute -inset-1 border-2 border-dashed border-red-500 rounded  opacity-60 pointer-events-none" />
                </>
              )}
              
              <button
                type="submit"
                className={`relative overflow-hidden w-full h-[36px] font-bold rounded flex items-center justify-center gap-1.5 cursor-pointer leading-none text-xs uppercase font-mono tracking-widest hover:scale-[1.01] active:scale-[0.99] shadow-sm select-none transition-all duration-150 ${
                  isFlashing 
                    ? (parseFloat(rpe) >= 9 
                        ? ' text-white border-transparent scale-[1.05] font-black'
                        : 'bg-[var(--text-main)] text-[var(--bg-card)] border border-[var(--text-main)] opacity-70 scale-[0.98]')
                    : (parseFloat(rpe) >= 9)
                      ? 'bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white border-transparent shadow-sm ring-2 ring-red-500/30  font-extrabold'
                      : 'bg-[var(--text-main)] text-[var(--bg-card)] border border-[var(--text-main)] hover:bg-opacity-90'
                }`}
                title={parseFloat(rpe) >= 9 ? "Intensidad Máxima (RPE 9+): ¡Riesgo límite biomecánico!" : "Registrar Serie"}
              >
                {isFlashing && (
                  <>
                    <div className="absolute inset-0 bg-white  mix-blend-color-dodge pointer-events-none rounded" />
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500  mix-blend-overlay pointer-events-none rounded" />
                  </>
                )}
                {isFlashing ? (
                  <>
                    <Flame size={14} className="shrink-0 text-white  fill-amber-400" />
                    <span className=" tracking-widest font-black text-red-100">¡RPE {rpe} REGISTRADOS! 🔥</span>
                    <Flame size={14} className="shrink-0 text-white  fill-amber-400" />
                  </>
                ) : (parseFloat(rpe) >= 9) ? (
                  <>
                    <Flame size={12} className="shrink-0 text-white " />
                    <span>REGISTRAR SERIE (INTENSIDAD L4 🔥)</span>
                  </>
                ) : (
                  <>
                    <Plus size={11} className="shrink-0" />
                    <span>REGISTRAR SERIE</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

          {/* L4 AUTO-CALCULATED RPE SUGGESTION (DYNAMIC ANALYSIS) */}
          {!isCardio && historicMax > 0 && (
            <motion.div variants={itemVariants} className="space-y-2">
              <div className="bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/10 rounded-lg p-2.5 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-black tracking-widest text-[#E11D48] dark:text-rose-400 uppercase flex items-center gap-1 leading-none">
                    <Award size={11} className="text-[#E11D48]" />
                    MÁXIMO REGISTRADO: {historicMax} kg
                  </span>
                  {suggestion ? (
                    <p className="text-[9px] text-[var(--text-data)] mt-1 font-semibold leading-relaxed">
                      Levantar <span className="font-mono font-bold text-[var(--text-main)]">{parseFloat(weight)} kg</span> es el <span className="font-extrabold text-rose-600 dark:text-rose-400 font-mono">{suggestion.percentage}%</span> de tu mejor marca.
                    </p>
                  ) : (
                    <p className="text-[9px] text-[var(--text-muted)] italic leading-normal mt-1 font-medium">
                      Digita el peso que vas a levantar para que Nexus L4 determine tu intensidad de manera precisa.
                    </p>
                  )}
                </div>
                
                {suggestion && (
                  <button
                    type="button"
                    onClick={() => updateRpeAndRir(suggestion.rpe)}
                    className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg border transition-all cursor-pointer select-none text-center h-10 w-24 shrink-0 col-auto ${
                      rpe === suggestion.rpe
                        ? 'bg-[#E11D48] text-white border-[#E11D48] shadow-md scale-102 font-black'
                        : 'bg-[var(--bg-card)] text-[#E11D48] dark:text-rose-400 border-rose-300 dark:border-rose-900 hover:border-[#E11D48] hover:bg-rose-500/5 '
                    }`}
                    title="Presiona para autocompletar esta RPE"
                  >
                    <span className="text-[7.5px] font-extrabold uppercase block tracking-wider leading-none text-[#E11D48] dark:text-rose-400">RPE ESTIMADO</span>
                    <span className="text-xs font-black font-mono mt-0.5 leading-none">{suggestion.rpe}</span>
                  </button>
                )}
              </div>

              {/* LIVE RELATIVE LOAD METRIC AND VISUAL PROGRESS */}
              <div className="bg-neutral-950/60 p-2 border border-[var(--border-color)] rounded-lg space-y-2">
                <div className="flex justify-between items-center text-[9px]">
                  <span className="font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                    ⚖️ CARGA RELATIVA REGISTRADA HOY
                  </span>
                  <span className={`font-mono text-[8px] font-black border px-1.5 py-0.5 rounded uppercase ${relativeLoadColor.bg} ${relativeLoadColor.text} ${relativeLoadColor.border}`}>
                    {relativeLoad > 0 ? `${relativeLoad}% (${relativeLoadColor.label})` : 'SIN REGISTRO HOY'}
                  </span>
                </div>
                
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 rounded-full ${
                      relativeLoad < 70 
                        ? 'bg-emerald-500' 
                        : relativeLoad < 85 
                          ? 'bg-amber-400' 
                          : relativeLoad < 95 
                            ? 'bg-orange-500' 
                            : 'bg-red-500'
                    }`}
                    style={{ width: `${relativeLoad === 0 ? 0 : Math.min(100, relativeLoad)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[8px] font-mono text-neutral-500 leading-none">
                  <span>Pico de Hoy: {todayMaxWeight} kg</span>
                  <span className="text-right">Max Histórico: {historicMax} kg</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ELEGANT MINIMALIST DISCLOSURE FOR ADVANCED TOOLS (Option 3 - Minimalist Accordion) */}
          <motion.div variants={itemVariants} className="pt-1.5 no-print">
            <button
              type="button"
              onClick={() => setShowAdvancedL4(!showAdvancedL4)}
              className={`w-full py-1.5 px-3 border border-dashed rounded-lg text-[9px] font-mono tracking-widest uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-200 ${
                showAdvancedL4
                  ? 'bg-electric-blue/10 text-electric-blue border-electric-blue/30 shadow-sm font-bold'
                  : 'bg-neutral-950/40 text-neutral-400 border-white/10 hover:border-neutral-500 hover:text-neutral-200'
              }`}
            >
              <span>{showAdvancedL4 ? '➖ OCULTAR ANÁLISIS E INSTRUMENTOS L4' : '🔧 VER ANÁLISIS, BIOMECÁNICA Y CUES L4'}</span>
            </button>
          </motion.div>

          {showAdvancedL4 && (
            <div className="space-y-3 pt-1 animate-fadeIn">
              {/* PERSONALIZED BIOMECHANICAL BIOTICS / SUGG FROM NEXUS L4 */}
              <div className="bg-black/95 border-2 border-electric-blue/40 rounded-lg p-3 space-y-2 shadow-xs">
                <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
                  <span className="text-[10px] font-bold tracking-wider text-electric-blue uppercase flex items-center gap-1.5 leading-none">
                    🧠 CORE BIOMECÁNICA NEXUS L4
                  </span>
                  <span className="text-[8px] font-mono text-neutral-400 uppercase tracking-widest">
                    ACTIVO
                  </span>
                </div>
                <div className="space-y-1.5 text-[9.5px] text-neutral-300 font-medium leading-relaxed">
                  {getBiomechanicalTips(exerciseName, athlete).map((tip, idx) => (
                    <div key={idx} className="flex gap-2 items-start border-b border-white/5 pb-1 last:border-0 last:pb-0">
                      <span className="text-electric-blue shrink-0 font-bold">▶</span>
                      <p 
                        className="text-neutral-200"
                        dangerouslySetInnerHTML={{ __html: tip.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-electric-blue font-extrabold">$1</strong>') }} 
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* CHECKLIST DE VALIDACIÓN BIOMECÁNICA */}
              <div className="bg-neutral-900/60 p-2.5 rounded-lg border border-white/10 space-y-2.5 shadow-inner">
                <div className="flex items-center justify-between border-b border-white/5 pb-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#00F0FF] flex items-center gap-1">
                    ☑️ VALIDACIÓN BIOMECÁNICA L4
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    { key: 'rom', label: 'ROM COMPLETO', tooltip: 'Rango de movimiento innegociable alcanzado.' },
                    { key: 'posture', label: 'POSTURA L4', tooltip: 'Columna neutra y torque seguro.' },
                    { key: 'stability', label: 'ESTABILIDAD CORE', tooltip: 'Activación del core sin fugas de energía.' }
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={biomechanicsChecklist[item.key as keyof typeof biomechanicsChecklist]}
                        onChange={(e) => setBiomechanicsChecklist(prev => ({ ...prev, [item.key]: e.target.checked }))}
                        className="appearance-none w-3.5 h-3.5 border border-white/30 rounded-sm bg-black/50 checked:bg-emerald-500 checked:border-emerald-500 flex-shrink-0 cursor-pointer outline-none relative"
                        style={{ WebkitAppearance: 'none' }}
                      />
                      <span className="text-[9px] font-bold tracking-wide uppercase text-neutral-400 group-hover:text-white transition-colors" title={item.tooltip}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* VISUALIZAR PACING ACTION BUTTON */}
              <button 
                type="button" 
                onClick={() => setShowPacing(!showPacing)}
                className="w-full py-2 bg-[#00F0FF]/5 hover:bg-[#00F0FF]/15 border border-[#00F0FF]/20 rounded uppercase text-[#00F0FF] text-[9px] font-bold tracking-widest transition-colors flex items-center justify-center gap-2"
              >
                <Flame size={12} />
                {showPacing ? 'Ocultar Pacing' : 'Visualizar Pacing'}
              </button>

              {showPacing && (
                <div className="p-3 bg-neutral-900/80 border-l-2 border-[#00F0FF] rounded-r text-[9px] space-y-2 animate-fadeIn">
                   <div className="flex justify-between items-center text-white font-black uppercase mb-1">
                     <span>⏱️ Estimación de Pacing</span>
                   </div>
                   <p className="text-neutral-300 font-medium">Histórico RPE: {historicAvgRpe !== null ? historicAvgRpe.toFixed(1) : 'S/D'} | RPE Hoy: {todayAvgRpe !== null ? todayAvgRpe.toFixed(1) : (rpe || 'S/D')}</p>
                   <p className="text-neutral-300 font-medium">Pacing sugerido basado en carga y cansancio actual:</p>
                   <div className="flex flex-col gap-1 mt-1 font-mono">
                     <div className={`flex items-center gap-2 transition-opacity ${todayAvgRpe !== null && historicAvgRpe !== null && (todayAvgRpe - historicAvgRpe) > 0.5 ? 'opacity-100' : 'opacity-40'}`}>
                       <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm" />
                       <span className="text-emerald-400 font-black uppercase tracking-wider">Conservador y Controlado (Lento)</span>
                     </div>
                     <div className={`flex items-center gap-2 transition-opacity ${(todayAvgRpe === null || historicAvgRpe === null || Math.abs(todayAvgRpe - historicAvgRpe) <= 0.5) ? 'opacity-100' : 'opacity-40'}`}>
                       <div className="w-2 h-2 rounded-full bg-amber-400 shadow-sm" />
                       <span className="text-amber-400 font-black uppercase tracking-wider">Potencia Sostenida (Medio)</span>
                     </div>
                     <div className={`flex items-center gap-2 transition-opacity ${todayAvgRpe !== null && historicAvgRpe !== null && (todayAvgRpe - historicAvgRpe) < -0.5 ? 'opacity-100' : 'opacity-40'}`}>
                       <div className="w-2 h-2 rounded-full bg-[#E11D48] shadow-sm" />
                       <span className="text-[#E11D48] font-black uppercase tracking-wider">Sprint Anaeróbico (Rápido)</span>
                     </div>
                   </div>
                   <div className="mt-2 text-[8px] text-neutral-500 font-mono">
                     El ritmo está dictado por priorizar seguridad y técnica clínica L4. "Suave es rápido."
                   </div>

                    {/* CALORÍAS A TIEMPO CONVERTER FOR BATTLE ROPES & MACHINES */}
                    {(isCardio || exerciseName.toUpperCase().includes('ROPE') || exerciseName.toUpperCase().includes('CALO') || exerciseName.toUpperCase().includes('SOGA')) && (
                      <div className="mt-3 pt-2.5 border-t border-white/10 space-y-2 text-left">
                        <span className="font-brutalist text-electric-blue tracking-wider text-[8px] font-black uppercase block">
                          🔬 CALIBRACIÓN DE CARDIO & BATTLE ROPES [CF-L4]
                        </span>
                        <p className="text-[8px] text-neutral-400 leading-normal font-sans">
                          En Battle Ropes u otras variaciones sin pantalla de monitor, simula tus calorías deseadas traduciéndolas a tiempo de trabajo continuo:
                        </p>
                        <div className="flex gap-2 items-center">
                          <div className="flex-1">
                            <label className="text-[7.5px] text-neutral-500 font-mono block mb-0.5 uppercase font-bold">Cantar de Calorías:</label>
                            <div className="flex bg-[#0a0a0c] border border-white/10 rounded overflow-hidden">
                              <input 
                                type="number"
                                value={calInput}
                                onChange={(e) => setCalInput(e.target.value)}
                                min="1"
                                max="150"
                                className="bg-transparent w-full text-white font-mono text-xs px-2 py-1 focus:outline-none text-center"
                              />
                              <div className="flex border-l border-white/10 shrink-0">
                                {['9', '15', '21'].map(preset => (
                                  <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setCalInput(preset)}
                                    className={`text-[8.5px] px-2 py-0.5 hover:bg-electric-blue/10 text-neutral-300 font-mono border-r border-white/5 last:border-0 cursor-pointer ${calInput === preset ? 'bg-electric-blue/25 font-black text-white' : ''}`}
                                  >
                                    {preset} Cal
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {(() => {
                          const cVal = parseInt(calInput) || 0;
                          if (cVal <= 0) return null;
                          
                          // Sprint: 12 cal/min (5s per cal)
                          // Sustained: 10 cal/min (6s per cal)
                          // Aerobic/Control: 8 cal/min (7.5s per cal)
                          const formatter = (totSec: number) => {
                            const m = Math.floor(totSec / 60);
                            const s = Math.round(totSec % 60);
                            return `${m}:${s < 10 ? '0' : ''}${s}`;
                          };
                          
                          return (
                            <div className="grid grid-cols-3 gap-1 pt-1 bg-[#010102] p-1.5 border border-white/5 rounded-xs font-mono text-[7.5px] leading-relaxed">
                              <div className="text-center border-r border-white/5 pr-1">
                                <span className="text-rose-500 font-bold block">⚡ SPRINT</span>
                                <span className="text-white font-black text-[9px] block">{formatter(cVal * 5)}</span>
                                <span className="text-[6.5px] text-neutral-500 block leading-tight">12 kcal/min<br/>(5s / cal)</span>
                              </div>
                              <div className="text-center border-r border-white/5 pr-1">
                                <span className="text-amber-400 font-bold block">⏱️ SOSTENIDO</span>
                                <span className="text-white font-black text-[9px] block">{formatter(cVal * 6)}</span>
                                <span className="text-[6.5px] text-neutral-500 block leading-tight">10 kcal/min<br/>(6s / cal)</span>
                              </div>
                              <div className="text-center">
                                <span className="text-emerald-400 font-bold block">🌿 CONTROL</span>
                                <span className="text-white font-black text-[9px] block">{formatter(cVal * 7.5)}</span>
                                <span className="text-[6.5px] text-neutral-500 block leading-tight">8 kcal/min<br/>(7.5s / cal)</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                </div>
              )}

              {/* INTERACTIVE RIR -> RPE AUTOCALCULATOR */}
              <div className="bg-[var(--bg-input)] rounded-lg p-2.5 border border-[var(--border-color)] flex flex-col gap-1.5 shadow-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black tracking-widest text-[var(--text-main)] uppercase flex items-center gap-1.5 leading-none">
                    <Sparkles size={11} className="text-amber-500 fill-amber-500 " />
                    AUTOCALCULADORA RPE RÁPIDA (RIR)
                  </span>
                  <span className="text-[8px] font-bold text-[var(--text-muted)]">FÓRMULA: RPE = 10 - RIR</span>
                </div>
                <p className="text-[9px] text-[var(--text-muted)] leading-normal mt-0.5">
                  Toca cuántas repeticiones adicionales estimas que podrías haber completado antes de fallar (Reps en Recámara):
                </p>
                <div className="grid grid-cols-5 gap-1 mt-1">
                  {[
                    { rir: 0, rpeValue: '10', label: '0 de sobra', effect: 'Fallo absoluto (Extremo)', color: 'text-rose-500 border-rose-200' },
                    { rir: 1, rpeValue: '9', label: '1 de sobra', effect: 'Esfuerzo alto (Pesado)', color: 'text-amber-500 border-amber-200' },
                    { rir: 2, rpeValue: '8', label: '2 de sobra', effect: 'Óptimo potencia/fuerza', color: 'text-emerald-500 border-emerald-200' },
                    { rir: 3, rpeValue: '7', label: '3 de sobra', effect: 'Velocidad explosiva', color: 'text-blue-500 border-blue-200' },
                    { rir: 4, rpeValue: '6', label: '4+ de sobra', effect: 'Calentamiento/Técnica', color: 'text-indigo-400 border-indigo-100' }
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.rir}
                      onClick={() => {
                        setRpe(item.rpeValue);
                        setRir(String(item.rir));
                      }}
                      className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg border transition-all cursor-pointer select-none text-center ${
                        rpe === item.rpeValue 
                          ? 'bg-[var(--text-main)] text-[var(--bg-card)] border-[var(--text-main)] shadow-md scale-102 font-black' 
                          : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-[var(--text-main)] hover:text-[var(--text-main)]'
                      }`}
                      title={`${item.label}: ${item.effect}`}
                    >
                      <span className="text-[10px] font-extrabold block">RIR {item.rir}</span>
                      <span className={`text-[8px] font-mono font-bold mt-0.5 ${rpe === item.rpeValue ? 'text-[var(--bg-card)]' : 'text-[var(--text-data)] opacity-85'}`}>RPE {item.rpeValue}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* HISTORIC LOG LIST */}
          <motion.div variants={itemVariants} className="w-full">
            {logs.length > 0 ? (
              <div className="border-t border-[var(--border-color)] pt-2.5">
                <span className="block text-[9px] font-extrabold text-[var(--text-muted)] uppercase mb-2">
                  Series registradas hoy
                </span>
                <div className="space-y-1.5">
                  {logs.map((log, index) => {
                    const rirVal = parseFloat(log.rir || '');
                    const isCloseToFailure = log.rir && log.rir !== 'N/D' && !isNaN(rirVal) && rirVal <= 1;
                    return (
                      <div 
                        key={`log-${dayId}-${exerciseName.replace(/\s+/g, '_')}-${log.id || index}`} 
                        className={`flex justify-between items-center py-1.5 px-2 bg-[var(--bg-input)] rounded border transition-all duration-300 ${
                          isCloseToFailure 
                            ? 'border-[var(--accent-main)] bg-red-500/5 dark:bg-red-500/10 shadow-sm' 
                            : 'border-[var(--border-color)]'
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[9px] text-[var(--text-muted)] font-extrabold bg-[var(--bg-card)] px-1 py-0.2 rounded border border-[var(--border-color)]">
                            SERIE {index + 1}
                          </span>
                          <span className="font-mono font-bold text-[var(--text-main)]">
                            {isCardio ? `${log.weight} • ${log.reps}` : `${log.weight} × ${log.reps}`}
                          </span>
                          <span className="font-mono text-[10px] text-[var(--accent-main)] font-extrabold flex items-center gap-0.5 bg-rose-50 dark:bg-rose-950/20 px-1.5 py-0.2 rounded">
                            <Star size={8} className="fill-[var(--accent-main)]" /> RPE {log.rpe}
                          </span>
                          {(() => {
                            if (isCloseToFailure && !isCardio) {
                              return (
                                <span 
                                  className="font-mono text-[9px] sm:text-[10px] font-black flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-sm  border border-red-500" 
                                  title="¡Intensidad de fallo clínico límite! Máximo reclutamiento motor (RIR 0-1)"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-white  inline-block shrink-0" />
                                  RIR {log.rir} 🔥 RIESGO DE FALLO BIOMECÁNICO
                                </span>
                              );
                            } else if (log.rir && log.rir !== 'N/D') {
                              return (
                                <span className="font-mono text-[10px] font-extrabold flex items-center gap-0.5 px-1.5 py-0.2 rounded text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/10">
                                  {isCardio ? `⏱️ RITMO: ${log.rir}` : `RIR ${log.rir}`}
                                </span>
                              );
                            } else {
                              return null;
                            }
                          })()}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteLog(log.id)}
                          className="text-[var(--text-muted)] hover:text-red-500 transition-colors p-1 rounded hover:bg-[var(--bg-card)] cursor-pointer"
                          title="Eliminar registro"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-2 text-[10px] text-[var(--text-muted)] font-medium italic">
                Sin series registradas aún. ¡Que empiece el entrenamiento!
              </div>
            )}
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

## File: src/components/ExportCustomizationPanel.tsx
```tsx
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
```

## File: src/components/HistoryTable.tsx
```tsx
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { ShieldAlert, TrendingUp } from "lucide-react";
import { ACCENT_COLORS_MAP } from "../lib/constants";

interface LogSet {
  weight: string;
  reps: string;
  rpe: string;
  rir?: string;
  timestamp: number;
}

interface HistoryItem {
  dayName: string;
  sets: LogSet[];
}

interface HistoryTableProps {
  history: HistoryItem[];
}

const historyTableContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

const historyTableRowVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 24,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.15 },
  },
};

export default function HistoryTable({ history }: HistoryTableProps) {
  const [showChart, setShowChart] = useState(false);
  const [filterHighRpe, setFilterHighRpe] = useState(false);

  if (!history || history.length === 0) return null;

  // Custom weight parser
  const getSessionMaxWeight = (sets: LogSet[]) => {
    let maxW = 0;
    sets.forEach((set) => {
      const wStr = String(set.weight || "")
        .toLowerCase()
        .replace("kg", "")
        .trim();
      if (wStr === "p.c." || wStr === "pc" || wStr === "") {
        return;
      }
      const val = parseFloat(wStr);
      if (!isNaN(val) && val > maxW) {
        maxW = val;
      }
    });
    return maxW;
  };

  const chartData = useMemo(() => {
    return [...history].reverse().map((hist) => {
      const maxWeight = getSessionMaxWeight(hist.sets);
      return {
        name: hist.dayName.split(" - ")[0] || hist.dayName,
        fullName: hist.dayName,
        weight: maxWeight,
        displayWeight: maxWeight > 0 ? `${maxWeight} kg` : "P.C.",
        sets: hist.sets,
      };
    });
  }, [history]);

  const rpeComparisonData = useMemo(() => {
    if (!history || history.length === 0) return [];
    const currentSession = history[0];
    const currentSets = currentSession.sets || [];
    const prevSessions = history.slice(1, 4);

    return currentSets.map((set, idx) => {
      const currentRpeVal = parseFloat(set.rpe);
      const rpeActual =
        !isNaN(currentRpeVal) && currentRpeVal > 0 ? currentRpeVal : null;

      let prevSum = 0;
      let prevCount = 0;
      prevSessions.forEach((prevS) => {
        if (prevS.sets && prevS.sets[idx]) {
          const val = parseFloat(prevS.sets[idx].rpe);
          if (!isNaN(val) && val > 0) {
            prevSum += val;
            prevCount++;
          }
        }
      });
      const rpePromedio =
        prevCount > 0 ? parseFloat((prevSum / prevCount).toFixed(1)) : null;

      return {
        name: `S${idx + 1}`,
        rpeActual,
        rpePromedio,
        cargaActual: set.weight ? `${set.weight}kg` : "P.C.",
        repsActual: set.reps ? `${set.reps}r` : "Fallo",
      };
    });
  }, [history]);

  const hasRpeValues = useMemo(() => {
    return rpeComparisonData.some(
      (d) => d.rpeActual !== null || d.rpePromedio !== null,
    );
  }, [rpeComparisonData]);

  // Dynamically find current system accent color
  const activeColor = useMemo(() => {
    const savedColorId = localStorage.getItem("nexus_custom_accent_color");
    if (savedColorId && ACCENT_COLORS_MAP[savedColorId]) {
      return ACCENT_COLORS_MAP[savedColorId].color;
    }
    return "#1F51FF"; // default electric-blue
  }, []);

  return (
    <div className="w-full mt-2">
      {/* Toggle button for Chart & Filtering */}
      <div className="flex justify-between items-center mb-1.5 bg-zinc-950/40 border border-white/5 px-2 py-1 rounded-xs flex-wrap gap-2">
        <span className="text-[8px] text-neutral-400 uppercase font-mono tracking-wider">
          Bitácora Reciente
        </span>
        <div className="flex items-center gap-1.5">
          {!showChart && (
            <button
              type="button"
              onClick={() => setFilterHighRpe(!filterHighRpe)}
              className={`text-[8.5px] font-mono uppercase font-bold flex items-center gap-1 cursor-pointer transition-all px-1.5 py-0.5 rounded-xs border ${
                filterHighRpe
                  ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                  : "bg-white/5 text-neutral-400 hover:text-white border-transparent hover:bg-white/10"
              }`}
            >
              <ShieldAlert size={10} />
              <span>
                {filterHighRpe ? "Mostrando RPE > 9" : "Filtrar RPE > 9"}
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowChart(!showChart)}
            className="text-[8.5px] font-mono hover:text-white uppercase font-bold flex items-center gap-1 cursor-pointer transition-all bg-white/5 hover:bg-white/10 px-1.5 py-0.5 rounded-xs"
            style={{ color: activeColor }}
          >
            <TrendingUp size={10} style={{ color: activeColor }} />
            <span>{showChart ? "Ver Tabla 📋" : "Ver Carga (Gráfica) 📊"}</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showChart ? (
          <motion.div
            key="chart-view"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-[#0A0A0B]/85 border border-white/5 p-2.5 rounded-sm mb-1.5"
          >
            <p className="text-[8px] font-mono text-neutral-500 uppercase mb-2 text-center tracking-wider">
              Evolución de Cargas Múltiples (kg) - Últimas {chartData.length} Sesiones
            </p>
            {chartData.every((d) => d.weight === 0) ? (
              <div className="text-[9px] font-mono text-neutral-500 italic text-center py-6">
                Todas las sesiones cargadas con Peso Corporal (P.C.) o sin registro de peso numérico
              </div>
            ) : (
              <div className="h-[95px] w-full mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
                  >
                    <XAxis
                      dataKey="name"
                      stroke="#888"
                      fontSize={7}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888"
                      fontSize={7}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, "auto"]}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-zinc-950 border border-white/10 p-1.5 font-mono text-[8px] rounded-xs shadow-xl text-left">
                              <p className="font-bold text-white mb-0.5 truncate max-w-[150px]">
                                {data.fullName}
                              </p>
                              <p style={{ color: activeColor }}>
                                Carga Max:{" "}
                                <span className="font-bold text-white">
                                  {data.displayWeight}
                                </span>
                              </p>
                              <p className="text-neutral-400">
                                Series:{" "}
                                <span className="text-white">
                                  {data.sets.length}
                                </span>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="weight"
                      fill={activeColor}
                      radius={[1.5, 1.5, 0, 0]}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            index === chartData.length - 1
                              ? "#00f0ff"
                              : activeColor
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="table-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full custom-scrollbar overflow-x-auto"
          >
            <table className="w-full text-[9px] font-mono text-left border-collapse min-w-[200px]">
              <thead>
                <tr className="border-b border-white/10 text-neutral-500 uppercase">
                  <th className="py-1 pr-2 font-medium">Sesión</th>
                  <th className="py-1 px-2 font-medium">Series (Carga × Reps @ RPE)</th>
                </tr>
              </thead>
              <motion.tbody
                variants={historyTableContainerVariants}
                initial="hidden"
                animate="show"
              >
                <AnimatePresence mode="popLayout">
                  {history.map((hist, histIdx) => {
                    const filteredSets = filterHighRpe
                      ? hist.sets.filter((set) => parseFloat(set.rpe) >= 9)
                      : hist.sets;

                    if (filterHighRpe && filteredSets.length === 0) return null;

                    const rowKey = `${hist.dayName}-${histIdx}-${hist.sets ? hist.sets.length : 0}`;

                    const rpes = hist.sets
                      .map((s) => parseFloat(s.rpe))
                      .filter((r) => !isNaN(r));
                    const sessionAvgRpe =
                      rpes.length > 0
                        ? rpes.reduce((a, b) => a + b, 0) / rpes.length
                        : 0;

                    return (
                      <motion.tr
                        key={rowKey}
                        variants={historyTableRowVariants}
                        className={`border-b ${sessionAvgRpe > 9 ? "border-rose-500 shadow-sm bg-rose-500/5" : "border-white/5 last:border-b-0 hover:bg-white/5"} transition-all`}
                        id={`history_row_${rowKey}`}
                      >
                        <td className="py-1.5 pr-2 whitespace-nowrap text-neutral-400 font-bold border-r border-white/5 align-top pt-2.5">
                          <div className="flex flex-col gap-1">
                            <span>{hist.dayName}</span>
                            {sessionAvgRpe > 9 && (
                              <span className="text-[7.5px] bg-rose-500 text-black px-1 py-0.5 rounded-xs font-black w-fit flex items-center gap-0.5 tracking-wider uppercase ">
                                <ShieldAlert size={8} /> RIESGO L4
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-1.5 px-2 align-top">
                          <div className="flex flex-wrap gap-1">
                            {filteredSets.map((set, setIdx) => {
                              const isHighRpe = parseFloat(set.rpe) >= 9;
                              return (
                                <span
                                  key={setIdx}
                                  id={`history_set_${rowKey}_${setIdx}`}
                                  className={`border rounded px-1.5 py-0.5 text-[8.5px] font-mono flex items-center gap-1 shrink-0 ${
                                    isHighRpe
                                      ? "bg-rose-950/30 border-rose-500/30 text-rose-300"
                                      : "bg-white/5 border-white/10 text-neutral-300"
                                  }`}
                                >
                                  <span className="font-bold text-white">
                                    {set.weight ? `${set.weight}kg` : "P.C."}
                                  </span>
                                  <span className="text-neutral-500">×</span>
                                  <span className="text-emerald-400 font-semibold font-mono">
                                    {set.reps ? `${set.reps}r` : "Fallo"}
                                  </span>
                                  <span
                                    className={`px-1 rounded-xs text-[8px] font-black ${
                                      isHighRpe
                                        ? "bg-rose-500 text-black"
                                        : "bg-amber-400 text-black"
                                    }`}
                                  >
                                    R{set.rpe}
                                  </span>
                                  {set.rir && set.rir !== "N/D" && (
                                    <span className="text-neutral-400 text-[8px] italic">
                                      RIR{set.rir}
                                    </span>
                                  )}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </motion.tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real-time RPE Comparison Chart */}
      {rpeComparisonData && rpeComparisonData.length > 0 && hasRpeValues && (
        <div className="mt-3 pt-2.5 border-t border-white/5 bg-[#0D0D10]/40 p-2 rounded-xs">
          <div className="flex justify-between items-center mb-1.5 px-0.5">
            <span className="text-[7.5px] font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-1">
              <TrendingUp size={9} style={{ color: activeColor }} />
              Monitoreo Biomecánico RPE Actual vs. Histórico (Promedio 3)
            </span>
            <span className="text-[7px] font-mono text-neutral-500 italic bg-white/2.5 px-1 py-0.5 rounded-xs">
              Métrica de Fatiga SNC
            </span>
          </div>

          <div className="h-[75px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={rpeComparisonData}
                margin={{ top: 5, right: 10, left: -32, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis
                  dataKey="name"
                  stroke="#555"
                  fontSize={7}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#555"
                  fontSize={7}
                  tickLine={false}
                  axisLine={false}
                  domain={[1, 10]}
                  ticks={[2, 4, 6, 8, 10]}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const rpeReal = payload.find(
                        (p) => p.dataKey === "rpeActual",
                      )?.value;
                      const rpeHist = payload.find(
                        (p) => p.dataKey === "rpePromedio",
                      )?.value;
                      return (
                        <div className="bg-zinc-950 border border-white/10 p-1.5 font-mono text-[8px] rounded-xs shadow-xl text-left">
                          <p className="font-bold text-white mb-1 uppercase tracking-wider">
                            {data.name} ({data.cargaActual} × {data.repsActual})
                          </p>
                          <p className="text-white flex items-center gap-1.5">
                            <span
                              className="inline-block w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: activeColor }}
                            />
                            RPE Actual:{" "}
                            <span
                              className="font-bold"
                              style={{ color: activeColor }}
                            >
                              {rpeReal !== undefined && rpeReal !== null
                                ? `${rpeReal}/10`
                                : "S/D"}
                            </span>
                          </p>
                          {rpeHist !== undefined && rpeHist !== null && (
                            <p className="text-[#00f0ff] flex items-center gap-1.5 mt-0.5">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00f0ff]" />
                              Promedio 3 Previos:{" "}
                              <span className="font-bold text-[#00f0ff]">
                                {rpeHist}/10
                              </span>
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rpeActual"
                  stroke={activeColor}
                  strokeWidth={1.8}
                  dot={{ r: 2.5, fill: activeColor, strokeWidth: 0 }}
                  activeDot={{ r: 4 }}
                  name="RPE Actual"
                  connectNulls
                />
                {history.length > 1 && (
                  <Line
                    type="monotone"
                    dataKey="rpePromedio"
                    stroke="#00f0ff"
                    strokeWidth={1.2}
                    strokeDasharray="3 3"
                    dot={{ r: 1.5, fill: "#00f0ff", strokeWidth: 0 }}
                    name="Promedio 3 Previos"
                    connectNulls
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Small Legend */}
          <div className="flex justify-center items-center gap-3 text-[7.5px] font-mono text-neutral-400 mt-1.5 border-t border-white/2.5 pt-1">
            <div className="flex items-center gap-1">
              <span
                className="w-2 h-0.5"
                style={{ backgroundColor: activeColor }}
              />
              <span>RPE Actual</span>
            </div>
            {history.length > 1 ? (
              <div className="flex items-center gap-1">
                <span
                  className="w-2 h-0.5 border-t border-dashed border-cyan-400"
                  style={{ borderColor: "#00f0ff" }}
                />
                <span>
                  Promedio Anterior (Últimos {Math.min(3, history.length - 1)})
                </span>
              </div>
            ) : (
              <span
                className="text-neutral-500 italic text-[7px]"
                id="rpe_chart_no_history_legend"
              >
                (Siguiente sesión habilitará el comparativo histórico)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

## File: src/components/NavigationHeader.tsx
```tsx
import React, { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { LayoutDashboard, TrendingUp, UserCheck } from "lucide-react";
import {
  WEEK_ACCENT_COLORS,
  WEEK_MID_BAND_COLORS,
  getWeekOfProgram,
} from "../lib/constants";

interface NavigationHeaderProps {
  activeSheet: number;
  setActiveSheet: (index: number) => void;
  syncWithRealTime: boolean;
  currentWeek: string;
  realTime: Date;
  handleToggleSync: () => void;
  activeDayName?: string;
  setShowProfileModal: (show: boolean) => void;
  onHeightChange?: (height: number) => void;
}

export default function NavigationHeader({
  activeSheet,
  setActiveSheet,
  syncWithRealTime,
  currentWeek,
  realTime,
  handleToggleSync,
  activeDayName,
  setShowProfileModal,
  onHeightChange,
}: NavigationHeaderProps) {
  const sheets = [
    {
      icon: <LayoutDashboard size={18} />,
      label: "Pizarrón Diario",
      id: "pizarron",
      desc: "Misiones & Rutinas",
    },
    {
      icon: <TrendingUp size={18} />,
      label: "RPE & Metas",
      id: "rpe",
      desc: "Análisis & Tablas",
    },
    {
      icon: <UserCheck size={18} />,
      label: "Perfil & Bio",
      id: "perfil",
      desc: "Análisis Biomecánico L4",
    },
  ];

  const progressPercent = ((activeSheet + 1) / 3) * 100;
  const headerRef = useRef<HTMLElement | null>(null);

  const activeColorSet =
    WEEK_ACCENT_COLORS[currentWeek] || WEEK_ACCENT_COLORS.w2;
  const midBandColor =
    WEEK_MID_BAND_COLORS[currentWeek] || WEEK_MID_BAND_COLORS.w2;

  useEffect(() => {
    if (!headerRef.current || !onHeightChange) return;

    const measure = () => {
      if (headerRef.current) {
        onHeightChange(headerRef.current.offsetHeight);
      }
    };

    measure();

    const resizeObserver = new ResizeObserver(() => {
      measure();
    });
    resizeObserver.observe(headerRef.current);

    window.addEventListener("resize", measure);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [onHeightChange, activeSheet, currentWeek, syncWithRealTime]);

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0E]/95 border-b-2 border-white/10 no-print backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.85)] select-none"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      <div className="w-full mx-auto px-2 sm:px-10 pt-1 pb-0.5 flex flex-col xl:flex-row flex-wrap items-center justify-between gap-1 xl:gap-0">
        <div className="flex w-full xl:w-auto justify-between items-center gap-1 flex-wrap">
          <div
            className="flex items-center gap-1 sm:gap-1.5 cursor-pointer"
            onClick={() => setShowProfileModal(true)}
          >
            <img src="/emblema.jpg" alt="Nexus L4 Emblem" className="h-6 w-6 sm:h-8 sm:w-8 object-cover rounded-full border-2 border-electric-blue/50 shadow-blue-glow" />
            <div className="bg-gradient-to-r from-blue-950/40 to-indigo-950/40 px-1 sm:px-3 py-0.5 sm:py-1 rounded-sm shadow-sm transition-colors">
              <span className="text-electric-blue font-brutalist text-[5.5px] min-[320px]:text-[6.5px] min-[350px]:text-[7.5px] min-[375px]:text-[10px] sm:text-xs md:text-sm tracking-widest font-extrabold uppercase ">
                NEXUS L4 MASTER
              </span>
            </div>
            <span className="hidden lg:inline text-[9.5px] font-mono tracking-widest text-neutral-500 font-bold uppercase transition-colors hover:text-white">
              ⚙️ AJUSTAR BIOMECÁNICA DEL ATLETA
            </span>
          </div>

          <div className="bg-[#14141A] rounded px-1.5 py-0.5 flex items-center xl:hidden mt-0">
            <span className="text-[7.5px] min-[320px]:text-[8px] min-[375px]:text-[9px] sm:text-[10px] font-mono font-bold text-neutral-300">
              HOJA {activeSheet + 1}/3
            </span>
          </div>
        </div>

        {/* Right Info: Clock, Sync Status, Sheet Info */}
        <div className="flex w-full xl:w-auto items-center justify-between xl:justify-end gap-1 flex-wrap">
          <div className="flex items-center gap-1 sm:gap-2 font-mono bg-black/40 px-1 sm:px-1.5 py-0.5 rounded shrink-0">
            <span
              className={`h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full ${syncWithRealTime ? "bg-emerald-500 shadow-sm" : "bg-amber-500 shadow-sm"}`}
            />
            <span className="text-electric-blue text-[7px] min-[375px]:text-[8px] sm:text-[10px] font-bold uppercase tracking-wider hidden sm:inline">
              {realTime
                .toLocaleDateString("es-ES", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })
                .toUpperCase()}
            </span>
            <span className="text-white text-[8.5px] min-[320px]:text-[9.5px] min-[375px]:text-[10.5px] sm:text-sm font-extrabold tracking-wider">
              {realTime.toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-white/5 px-1.5 sm:px-3 py-0.5 rounded shrink-0 hidden md:flex">
            <span className="text-[8.5px] sm:text-[10px] font-mono shrink-0">
              {syncWithRealTime ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  ⚡ SEM {currentWeek.replace("w", "")} • {activeDayName}
                </span>
              ) : (
                <span className="text-amber-500 font-bold flex items-center gap-1 ">
                  ⚠ OVERRIDE MANUAL
                </span>
              )}
            </span>
          </div>

          <button
            onClick={handleToggleSync}
            className={`px-1 min-[375px]:px-1.5 sm:px-3 py-0.5 sm:py-1 font-brutalist text-[7px] min-[320px]:text-[7.5px] min-[375px]:text-[8.5px] sm:text-[10px] tracking-wider transition-all cursor-pointer rounded-sm shrink-0 font-bold ${
              syncWithRealTime
                ? "bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/60"
                : "bg-electric-blue text-white hover:brightness-110 shadow-blue-glow"
            }`}
            title={
              syncWithRealTime
                ? "Desactivar acoplamiento automático para navegar libremente"
                : "Ligar el pizarrón al día y hora de hoy"
            }
          >
            {syncWithRealTime ? (
              "🔌 FIJAR"
            ) : (
              <>
                <span className="hidden min-[320px]:inline">
                  ⚡ ACOPLAR HOY ↻
                </span>
                <span className="inline min-[320px]:hidden">⚡ ACOPLAR</span>
              </>
            )}
          </button>

          <div className="bg-[#14141A] rounded px-2 py-0.5 items-center gap-1 shrink-0 hidden md:flex">
            <span className="text-[9px] font-mono font-bold text-neutral-300">
              HOJA {activeSheet + 1}/3
            </span>
          </div>
        </div>
      </div>

      {/* Grid selectors */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pb-1 grid grid-cols-3 gap-1">
        {sheets.map((sheet, index) => {
          const isActive = activeSheet === index;
          return (
            <button
              key={index}
              id={`nav-header-tab-${sheet.id}`}
              onClick={() => setActiveSheet(index)}
              className={`flex flex-col items-center justify-center py-1 sm:py-1.5 px-0.5 rounded transition-all duration-300 relative cursor-pointer outline-none focus:outline-none ${
                isActive
                  ? "bg-gradient-to-br from-blue-950/30 to-indigo-950/30 text-electric-blue shadow-sm font-black"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-1 sm:gap-1.5 justify-center">
                <span
                  className={`${isActive ? "text-electric-blue" : "text-neutral-400"} scale-90 sm:scale-100`}
                >
                  {sheet.icon}
                </span>
                <span className="font-brutalist tracking-wider text-[9px] sm:text-[11.5px] uppercase leading-none">
                  {sheet.label}
                </span>
              </div>
              <span className="text-[7.5px] font-mono text-neutral-500 uppercase tracking-widest mt-0.5 hidden md:inline">
                {sheet.desc}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeSheetHeaderIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-electric-blue rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Sheet Interactive Progress Indicator */}
      <div className="w-full h-[3px] bg-white/5 relative overflow-hidden">
        <motion.div
          className="absolute top-0 bottom-0 left-0 shadow-sm"
          initial={false}
          animate={{ width: `${progressPercent}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 15 }}
          style={{
            background: `linear-gradient(90deg, ${midBandColor.bg} 0%, ${activeColorSet.color} 100%)`,
            boxShadow: `0 0 10px ${activeColorSet.color}80`,
          }}
        />
      </div>
    </header>
  );
}
```

## File: src/components/ProfileModal.tsx
```tsx
import React from "react";
import { motion } from "motion/react";
import { Trophy, Check, Zap } from "lucide-react";
import { AthleteState } from "../types/workout";
import { MASTER_ACHIEVEMENTS } from "../lib/constants";

interface ProfileModalProps {
  tempAthlete: AthleteState;
  setTempAthlete: React.Dispatch<React.SetStateAction<AthleteState>>;
  unlockedAchievements: string[];
  customAccentColor: string;
  setCustomAccentColor: (color: string) => void;
  enableThemedBackgrounds: boolean;
  setEnableThemedBackgrounds: (enabled: boolean) => void;
  warmupBg: string;
  setWarmupBg: (bg: string) => void;
  strengthBg: string;
  setStrengthBg: (bg: string) => void;
  metconBg: string;
  setMetconBg: (bg: string) => void;
  accessoriesBg: string;
  setAccessoriesBg: (bg: string) => void;
  handleUpdateAthlete: (athlete: AthleteState) => void;
  onClose: () => void;
}

export default function ProfileModal({
  tempAthlete,
  setTempAthlete,
  unlockedAchievements,
  customAccentColor,
  setCustomAccentColor,
  enableThemedBackgrounds,
  setEnableThemedBackgrounds,
  warmupBg,
  setWarmupBg,
  strengthBg,
  setStrengthBg,
  metconBg,
  setMetconBg,
  accessoriesBg,
  setAccessoriesBg,
  handleUpdateAthlete,
  onClose,
}: ProfileModalProps) {
  return (
    <div
      id="profileModal"
      className="fixed inset-0 bg-pure-black/95 flex items-center justify-center z-[100] p-4 overflow-y-auto backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="border border-white/20 p-6 md:p-8 max-w-xl w-full bg-[#0A0A0B] shadow-sm font-condensed relative overflow-hidden my-auto"
      >
        {/* decorative lines */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-electric-blue/40 via-electric-blue to-electric-blue/40"></div>
        <div className="absolute -top-4 -right-4 text-electric-blue/5 text-[120px] font-brutalist select-none pointer-events-none">
          L4
        </div>

        <h3 className="text-3xl sm:text-4xl font-brutalist tracking-widest text-pure-white leading-tight text-center relative z-10">
          PERFIL DE RENDIMIENTO L4
        </h3>
        <p className="text-center font-bold text-neutral-400 text-[10px] sm:text-xs tracking-[0.2em] uppercase border-b border-white/10 pb-5 mb-5 text-electric-blue/80 relative z-10">
          SISTEMA DE CONFIGURACIÓN DE BIOMECÁNICA DE ATLETA
        </p>

        <div className="space-y-4 text-left relative z-10 max-h-[60vh] overflow-y-auto pr-1">
          {/* ID / NOMBRE */}
          <div className="space-y-1 group">
            <label className="text-[10px] sm:text-xs font-brutalist tracking-wider text-neutral-400 uppercase block group-focus-within:text-electric-blue transition-colors">
              IDENTIDAD (NOMBRE)
            </label>
            <input
              type="text"
              value={tempAthlete.identity}
              onChange={(e) =>
                setTempAthlete({
                  ...tempAthlete,
                  identity: e.target.value.toUpperCase(),
                })
              }
              className="w-full bg-[#111113] border border-white/10 p-2.5 sm:p-3 text-white text-sm uppercase font-bold focus:border-electric-blue focus:bg-electric-blue/5 focus:outline-none transition-all placeholder:text-neutral-700"
              placeholder="EJ: GERA & FLOR"
            />
          </div>

          {/* CLASE / LEVEL */}
          <div className="space-y-2">
            <label className="text-[10px] sm:text-xs font-brutalist tracking-wider text-neutral-400 uppercase block">
              ESTILO & PLAN DE RENDIMIENTO
            </label>
            <input
              type="text"
              value={tempAthlete.level}
              onChange={(e) =>
                setTempAthlete({ ...tempAthlete, level: e.target.value })
              }
              className="w-full bg-[#111113] border border-white/10 p-2 text-white text-sm focus:border-electric-blue focus:bg-electric-blue/5 focus:outline-none transition-all placeholder:text-neutral-700 mb-2"
              placeholder="EJ: PRVN ELITE // LVL 4 ⚡"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
              {[
                {
                  name: "PRVN Elite 🧬",
                  level: "PRVN ELITE // LVL 4 ⚡",
                  restriction: "RPE 8.5 MÁX (Velocidad de Barra)",
                  condition: "Atleta de Élite Base",
                  color: "hover:border-blue-400 hover:text-blue-400",
                },
                {
                  name: "HWPO Grind ⛓️",
                  level: "HWPO GRIND // LVL 4 🏋️",
                  restriction: "RPE 9.0 MÁX (Acumulación Segura)",
                  condition: "Grind & Hipertrofia Fraser",
                  color: "hover:border-red-400 hover:text-red-400",
                },
                {
                  name: "Mayhem Team 🌋",
                  level: "MAYHEM TEAM // LVL 3 🌋",
                  restriction: "RPE 8.0 MÁX (Volumen Mayhem)",
                  condition: "Sábados de Equipo Co-op",
                  color: "hover:border-orange-400 hover:text-orange-400",
                },
                {
                  name: "Haedo Adaptive 🪣",
                  level: "HAEDO ADAPTIVE // BALDE 🪣",
                  restriction: "RPE 7.0 MÁX (Postura Impecable)",
                  condition: "Salud Longevidad (Cazador de Cocas)",
                  color: "hover:border-emerald-400 hover:text-emerald-400",
                },
                {
                  name: "San Justo Peak 🚨",
                  level: "SAN JUSTO ATLETA // VALENTÍN 🚨",
                  restriction: "RPE 6.5 MÁX (Control de Fatiga)",
                  condition: "Halterofilia post-metcon Escalar",
                  color: "hover:border-purple-400 hover:text-purple-400",
                },
              ].map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() =>
                    setTempAthlete({
                      ...tempAthlete,
                      level: preset.level,
                      restriction: preset.restriction,
                      condition: preset.condition,
                    })
                  }
                  className={`text-[9px] font-mono bg-white/5 text-neutral-300 px-2 py-1.5 border border-white/10 transition-all cursor-pointer ${preset.color} hover:bg-white/10 active:scale-95 text-left leading-tight`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* LIMITACIONES / CONDICIÓN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="space-y-1 group">
              <label className="text-[10px] sm:text-xs font-brutalist tracking-wider text-neutral-400 uppercase block group-focus-within:text-electric-blue transition-colors">
                RESTRICCIÓN / RPE
              </label>
              <input
                type="text"
                value={tempAthlete.restriction || ""}
                onChange={(e) =>
                  setTempAthlete({
                    ...tempAthlete,
                    restriction: e.target.value,
                  })
                }
                className="w-full bg-[#111113] border border-white/10 p-2 text-white text-sm focus:border-electric-blue focus:bg-electric-blue/5 focus:outline-none transition-all placeholder:text-neutral-700"
              />
            </div>
            <div className="space-y-1 group">
              <label className="text-[10px] sm:text-xs font-brutalist tracking-wider text-neutral-400 uppercase block group-focus-within:text-electric-blue transition-colors">
                CONDICIÓN CLÍNICA
              </label>
              <input
                type="text"
                value={tempAthlete.condition || ""}
                onChange={(e) =>
                  setTempAthlete({
                    ...tempAthlete,
                    condition: e.target.value,
                  })
                }
                className="w-full bg-[#111113] border border-white/10 p-2 text-white text-sm focus:border-electric-blue focus:bg-electric-blue/5 focus:outline-none transition-all placeholder:text-neutral-700"
              />
            </div>
          </div>

          {/* LOOT EQUIPO */}
          <div className="border-t border-white/10 pt-4 space-y-3 mt-4">
            <span className="text-xs sm:text-sm font-brutalist text-electric-blue block tracking-widest uppercase flex items-center gap-2">
              <span className="h-1 w-1 bg-electric-blue rounded-full"></span>
              EQUIPAMIENTO / ACCESORIOS DE ENTRENAMIENTO [CF-L4]
            </span>

            <div className="space-y-1">
              <label className="text-[10px] text-neutral-400 block font-mono">
                RODILLERAS / COMPRESIÓN TÉRMICA:
              </label>
              <input
                type="text"
                value={tempAthlete.equipment?.grebas || ""}
                onChange={(e) =>
                  setTempAthlete({
                    ...tempAthlete,
                    equipment: {
                      ...tempAthlete.equipment,
                      grebas: e.target.value,
                    },
                  })
                }
                className="w-full bg-[#111113] border border-white/10 p-2 text-white text-xs focus:border-electric-blue focus:bg-electric-blue/5 focus:outline-none transition-all placeholder:text-neutral-700"
              />
              <div className="flex flex-wrap gap-1 pt-1">
                {[
                  "Rodilleras de Neoprene 7mm (Soporte Articular)",
                  "Rodilleras de Compresión Anatómica (Estabilidad Propioceptiva)",
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setTempAthlete({
                        ...tempAthlete,
                        equipment: {
                          ...tempAthlete.equipment,
                          grebas: item,
                        },
                      })
                    }
                    className="text-[8.5px] font-mono bg-[#111113] hover:text-electric-blue duration-150 transition-colors border border-white/10 text-neutral-300 px-1.5 py-1"
                  >
                    {item.split(" (")[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-neutral-400 block font-mono">
                CALLERAS / AGARRE Y PROTECCIÓN:
              </label>
              <input
                type="text"
                value={tempAthlete.equipment?.amuleto || ""}
                onChange={(e) =>
                  setTempAthlete({
                    ...tempAthlete,
                    equipment: {
                      ...tempAthlete.equipment,
                      amuleto: e.target.value,
                    },
                  })
                }
                className="w-full bg-[#111113] border border-white/10 p-2 text-white text-xs focus:border-electric-blue focus:bg-electric-blue/5 focus:outline-none transition-all placeholder:text-neutral-700"
              />
              <div className="flex flex-wrap gap-1 pt-1">
                {[
                  "Calleras de Fibra de Carbono (Dowel Effect)",
                  "Tape Elástico para Hook Grip (Física de Agarre)",
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setTempAthlete({
                        ...tempAthlete,
                        equipment: {
                          ...tempAthlete.equipment,
                          amuleto: item,
                        },
                      })
                    }
                    className="text-[8.5px] font-mono bg-[#111113] hover:text-electric-blue duration-150 transition-colors border border-white/10 text-neutral-300 px-1.5 py-1"
                  >
                    {item.split(" (")[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-neutral-400 block font-mono">
                BIOENERGÍA / RECUPERACIÓN SISTÉMICA:
              </label>
              <input
                type="text"
                value={tempAthlete.equipment?.filtro || ""}
                onChange={(e) =>
                  setTempAthlete({
                    ...tempAthlete,
                    equipment: {
                      ...tempAthlete.equipment,
                      filtro: e.target.value,
                    },
                  })
                }
                className="w-full bg-[#111113] border border-white/10 p-2 text-white text-xs focus:border-electric-blue focus:bg-electric-blue/5 focus:outline-none transition-all placeholder:text-neutral-700"
              />
              <div className="flex flex-wrap gap-1 pt-1">
                {[
                  "Suplementación de Electrolitos Sódicos (Soporte Hidrolítico)",
                  "Bebida Reconstituyente de Carbohidratos (Saturación de Glucógeno)",
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setTempAthlete({
                        ...tempAthlete,
                        equipment: {
                          ...tempAthlete.equipment,
                          filtro: item,
                        },
                      })
                    }
                    className="text-[8.5px] font-mono bg-[#111113] hover:text-electric-blue duration-150 transition-colors border border-white/10 text-neutral-300 px-1.5 py-1"
                  >
                    {item.split(" (")[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECCIÓN DE LOGROS ADQUIRIDOS (GAMIFICACIÓN) */}
          <div className="border-t border-white/10 pt-4 space-y-3 mt-4">
            <span className="text-xs sm:text-sm font-brutalist text-amber-400 block tracking-widest uppercase flex items-center gap-2">
              <Trophy size={14} className="text-amber-400 shrink-0" />
              LOGROS Y TROFEOS DE RENDIMIENTO ({unlockedAchievements.length} / {MASTER_ACHIEVEMENTS.length})
            </span>
            <p className="text-[10px] font-mono text-neutral-400">
              Completa tus misiones, mantén consistencia técnica clínica de calidad y desbloquea insignias exclusivas.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1">
              {MASTER_ACHIEVEMENTS.map((ach) => {
                const isUnlocked = unlockedAchievements.includes(ach.id);
                return (
                  <div
                    key={ach.id}
                    className={`p-2.5 border transition-all relative flex gap-2 ${
                      isUnlocked
                        ? "bg-zinc-950/90 text-white"
                        : "bg-neutral-950/20 border-white/5 opacity-40 select-none"
                    }`}
                    style={{
                      borderColor: isUnlocked ? ach.color : "rgba(255,255,255,0.05)",
                      boxShadow: isUnlocked ? `0 0 10px ${ach.color}10` : "none",
                    }}
                  >
                    <div
                      className="text-2xl flex items-center justify-center shrink-0 w-8 h-8 rounded-none border font-mono animate-none"
                      style={{
                        backgroundColor: isUnlocked ? `${ach.color}15` : "transparent",
                        borderColor: isUnlocked ? `${ach.color}45` : "rgba(255,255,255,0.05)",
                      }}
                    >
                      {isUnlocked ? ach.icon : "🔒"}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <div className="flex justify-between items-center bg-white/0 gap-1.5">
                        <h5
                          className="font-brutalist text-xs uppercase tracking-wide truncate"
                          style={{
                            color: isUnlocked ? ach.color : "#737373",
                          }}
                        >
                          {ach.title}
                        </h5>
                        <span
                          className="text-[7.5px] font-mono font-black scale-90 select-none"
                          style={{
                            color: isUnlocked ? ach.color : "#737373",
                          }}
                        >
                          {ach.rarity}
                        </span>
                      </div>
                      <p className="text-[9.5px] font-condensed text-zinc-400 leading-tight mt-0.5 font-bold line-clamp-2">
                        {ach.description}
                      </p>
                      <div className="text-[8px] font-mono mt-1 text-right">
                        {isUnlocked ? (
                          <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center justify-end gap-0.5">
                            <Check size={8} className="stroke-[3]" /> DESBLOQUEADO
                          </span>
                        ) : (
                          <span className="text-zinc-500 italic">POR ADQUIRIR</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLOR DE ACENTO DE TEMÁTICA CLÍNICA */}
          <div className="border-t border-white/10 pt-4 space-y-3 mt-4">
            <span className="text-xs sm:text-sm font-brutalist text-electric-blue block tracking-widest uppercase flex items-center gap-2">
              <span className="h-1 w-1 bg-electric-blue rounded-full"></span>
              COLOR DE ACENTO PRINCIPAL DEL SISTEMA
            </span>
            <p className="text-[10px] font-mono text-neutral-400">
              Personaliza el tono de la interfaz y los reportes de rendimiento clínico.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
              {[
                {
                  id: "default",
                  name: "Semana Activa 🔄",
                  colorText: "text-neutral-400",
                  borderActive: "border-white",
                },
                {
                  id: "electric-blue",
                  name: "Electric Blue ⚡",
                  colorText: "text-[#1F51FF]",
                  borderActive: "border-[#1F51FF]",
                },
                {
                  id: "neon-green",
                  name: "Neon Green 🟢",
                  colorText: "text-[#39FF14]",
                  borderActive: "border-[#39FF14]",
                },
                {
                  id: "royal-purple",
                  name: "Royal Purple 🟣",
                  colorText: "text-[#BD00FF]",
                  borderActive: "border-[#BD00FF]",
                },
                {
                  id: "neon-pink",
                  name: "Neon Pink 💗",
                  colorText: "text-[#FF007F]",
                  borderActive: "border-[#FF007F]",
                },
                {
                  id: "neon-orange",
                  name: "Neon Orange 🟠",
                  colorText: "text-[#FF5A00]",
                  borderActive: "border-[#FF5A00]",
                },
                {
                  id: "neon-cyan",
                  name: "Neon Cyan 🔵",
                  colorText: "text-[#00F0FF]",
                  borderActive: "border-[#00F0FF]",
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setCustomAccentColor(opt.id);
                    localStorage.setItem("nexus_custom_accent_color", opt.id);
                  }}
                  className={`text-[9px] font-mono p-1.5 border hover:bg-white/5 transition-all cursor-pointer text-left flex flex-col justify-between h-[45px] ${
                    customAccentColor === opt.id
                      ? `${opt.borderActive} bg-white/10 font-bold`
                      : "border-white/10 text-neutral-300"
                  }`}
                >
                  <span className={`block truncate w-full ${opt.colorText}`}>{opt.name}</span>
                  <span className="text-[7.5px] text-neutral-500 block leading-none">
                    {opt.id === "default" ? "Sincro auto" : "Anulación manual"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ESTILO Y GRÁFICAS DE FONDO */}
          <div className="border-t border-white/10 pt-4 space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-brutalist text-electric-blue block tracking-widest uppercase flex items-center gap-2">
                <span className="h-1 w-1 bg-electric-blue rounded-full"></span>
                IMÁGENES Y ESTILO VISUAL DE BLOQUES
              </span>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enableThemedBackgrounds}
                  onChange={(e) => {
                    setEnableThemedBackgrounds(e.target.checked);
                    localStorage.setItem("nexus_enable_themed_backgrounds", String(e.target.checked));
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-electric-blue/70 peer-checked:after:bg-electric-blue"></div>
                <span className="ml-2 pr-1 font-mono text-[9px] uppercase font-bold text-neutral-400 peer-checked:text-electric-blue">
                  {enableThemedBackgrounds ? "ACTIVO" : "INACTIVO"}
                </span>
              </label>
            </div>

            {enableThemedBackgrounds && (
              <div className="space-y-3 animate-fadeIn">
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 block font-mono">
                    PLANTILLAS DE GRÁFICAS TEMÁTICAS:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                    {[
                      {
                        name: "Noir Chalk & Iron 🏋️‍♂️",
                        d: "Estilo rústico, magnesio y halterofilia clásica",
                        warmup:
                          "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop",
                        strength:
                          "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop",
                        metcon:
                          "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=800&auto=format&fit=crop",
                        accessories:
                          "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop",
                      },
                      {
                        name: "Cyber CrossFit 🧬",
                        d: "Fondo futurista de fibra y luces cibernéticas",
                        warmup:
                          "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop",
                        strength:
                          "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop",
                        metcon:
                          "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=800&auto=format&fit=crop",
                        accessories:
                          "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop",
                      },
                      {
                        name: "Raw Carbon 🍌",
                        d: "Inspirado en texturas de fibra e imagen de alta potencia",
                        warmup:
                          "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop",
                        strength:
                          "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop",
                        metcon:
                          "https://images.unsplash.com/photo-1434596994096-19d4e89a7ec5?q=80&w=800&auto=format&fit=crop",
                        accessories:
                          "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop",
                      },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setWarmupBg(preset.warmup);
                          setStrengthBg(preset.strength);
                          setMetconBg(preset.metcon);
                          setAccessoriesBg(preset.accessories);
                          localStorage.setItem("nexus_bg_warmup", preset.warmup);
                          localStorage.setItem("nexus_bg_strength", preset.strength);
                          localStorage.setItem("nexus_bg_metcon", preset.metcon);
                          localStorage.setItem("nexus_bg_accessories", preset.accessories);
                        }}
                        className="text-[9px] font-mono bg-white/5 border border-white/10 text-neutral-300 p-1.5 hover:bg-electric-blue/10 hover:border-electric-blue duration-150 transition-all text-left flex flex-col justify-between h-[52px] cursor-pointer"
                      >
                        <span className="font-bold text-white block truncate w-full">{preset.name}</span>
                        <span className="text-[7.5px] text-neutral-500 line-clamp-2 leading-tight">
                          {preset.d}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <div className="space-y-1">
                    <label className="text-[9px] text-neutral-400 block font-mono uppercase">
                      FONDO CALENTAMIENTO (URL):
                    </label>
                    <input
                      type="text"
                      value={warmupBg}
                      onChange={(e) => {
                        setWarmupBg(e.target.value);
                        localStorage.setItem("nexus_bg_warmup", e.target.value);
                      }}
                      className="w-full bg-[#111113] border border-white/10 p-1.5 text-white font-mono text-[9px] focus:border-electric-blue focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-neutral-400 block font-mono uppercase">
                      FONDO FUERZA / OLY (URL):
                    </label>
                    <input
                      type="text"
                      value={strengthBg}
                      onChange={(e) => {
                        setStrengthBg(e.target.value);
                        localStorage.setItem("nexus_bg_strength", e.target.value);
                      }}
                      className="w-full bg-[#111113] border border-white/10 p-1.5 text-white font-mono text-[9px] focus:border-electric-blue focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-neutral-400 block font-mono uppercase">
                      FONDO METCON (URL):
                    </label>
                    <input
                      type="text"
                      value={metconBg}
                      onChange={(e) => {
                        setMetconBg(e.target.value);
                        localStorage.setItem("nexus_bg_metcon", e.target.value);
                      }}
                      className="w-full bg-[#111113] border border-white/10 p-1.5 text-white font-mono text-[9px] focus:border-electric-blue focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-neutral-400 block font-mono uppercase">
                      FONDO ACCESORIOS (URL):
                    </label>
                    <input
                      type="text"
                      value={accessoriesBg}
                      onChange={(e) => {
                        setAccessoriesBg(e.target.value);
                        localStorage.setItem("nexus_bg_accessories", e.target.value);
                      }}
                      className="w-full bg-[#111113] border border-white/10 p-1.5 text-white font-mono text-[9px] focus:border-electric-blue focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-6 relative z-10 mt-2 border-t border-white/10">
          <button
            className="flex-1 text-black font-brutalist py-3 sm:py-4 px-4 text-xs sm:text-sm tracking-widest transition-all cursor-pointer uppercase font-bold flex items-center justify-center gap-2 group relative overflow-hidden bg-electric-blue hover:bg-[#00F0FF]"
            onClick={() => {
              if (tempAthlete.identity.trim()) {
                handleUpdateAthlete(tempAthlete);
                onClose();
              }
            }}
          >
            <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out"></span>
            <Zap size={16} className="group-hover:scale-110 transition-transform" />
            <span className="relative z-10">ACTUALIZAR PERFIL BIOMECÁNICO</span>
          </button>
          <button
            className="w-full sm:w-auto bg-transparent border border-white/20 text-neutral-400 font-brutalist py-3 px-6 text-xs sm:text-sm tracking-wider hover:bg-white/5 hover:text-white hover:border-white/40 transition-all cursor-pointer font-bold"
            onClick={onClose}
          >
            CERRAR
          </button>
        </div>
      </motion.div>
    </div>
  );
}
```

## File: src/components/ResetConfirmModal.tsx
```tsx
import React from "react";
import { motion } from "motion/react";

interface ResetConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ResetConfirmModal({
  onConfirm,
  onCancel,
}: ResetConfirmModalProps) {
  return (
    <div
      id="resetModal"
      className="fixed inset-0 bg-pure-black/95 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="border-4 border-electric-blue p-8 max-w-sm w-full bg-black text-center space-y-6 shadow-[0_0_20px_rgba(31,81,255,0.2)]"
      >
        <h3 className="text-3xl font-brutalist tracking-wider text-pure-white leading-tight">
          ¿CONFIRMAS RESETEAR EL ARCHIVO?
        </h3>
        <p className="font-condensed text-neutral-400 font-bold text-sm leading-relaxed">
          SE PERDERÁ TODA LA TELEMETRÍA Y EL HISTORIAL DE ENTRENAMIENTOS
          GUARDADOS EN ESTE NAVEGADOR HISTÓRICAMENTE.
        </p>
        <div className="flex gap-4 pt-2">
          <button
            className="flex-1 bg-pure-white text-pure-black font-brutalist py-2 text-md tracking-wider hover:bg-neutral-200 active:scale-95 transition-all cursor-pointer"
            onClick={onConfirm}
          >
            SÍ, RESETEAR
          </button>
          <button
            className="flex-1 bg-neutral-900 border border-neutral-700 text-pure-white font-brutalist py-2 text-md tracking-wider hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer"
            onClick={onCancel}
          >
            CANCELAR
          </button>
        </div>
      </motion.div>
    </div>
  );
}
```

## File: src/components/RpeAnalyticsPanel.tsx
```tsx
import RpeProgressionSection from "./analytics/RpeProgressionSection";
import BiomechanicsSection from "./analytics/BiomechanicsSection";
import FatigueAndIntensitySection from "./analytics/FatigueAndIntensitySection";
import VolumeProgressionSection from "./analytics/VolumeProgressionSection";

interface RpeAnalyticsPanelProps {
  currentWeek: string;
  activeDay: any;
  currentVariationIndex: number;
  logsVersion: number;
  handleGenerateMonthlyReportPDF: () => void;
  getMonthlyVolumeStats: () => { totalLogsCount: number; totalVolume: number };
}

export default function RpeAnalyticsPanel({
  currentWeek,
  activeDay,
  currentVariationIndex,
  handleGenerateMonthlyReportPDF,
  getMonthlyVolumeStats,
}: RpeAnalyticsPanelProps) {
  return (
    <div className="flex flex-col space-y-6">
      {/* 1. Week targets, monthly reference averages, and full 10-level RPE board */}
      <RpeProgressionSection currentWeek={currentWeek} />

      {/* 2. Biomechanics Radar mapping, diagnostic recommendations and captured exercises */}
      <BiomechanicsSection
        activeDay={activeDay}
        currentVariationIndex={currentVariationIndex}
      />

      {/* 3. Area charts, fatigue indexes (CNS Load), and stress-load margins */}
      <FatigueAndIntensitySection currentWeek={currentWeek} />

      {/* 4. Total volume progressions, raw tonnage reports, and PDF print exports */}
      <VolumeProgressionSection
        currentWeek={currentWeek}
        handleGenerateMonthlyReportPDF={handleGenerateMonthlyReportPDF}
         getMonthlyVolumeStats={getMonthlyVolumeStats}
      />
    </div>
  );
}
```

## File: src/components/ShareCardOverlay.tsx
```tsx
// FILE_PATH: src/components/ShareCardOverlay.tsx
// ACTION: OVERWRITE
// DESCRIPTION: Implement dark black backgrounds for block headers, always render them in white text, use premium vector-based SVG diamond symbols representing the Google Material Design diamond icon, and ensure block headers are correctly labeled.
// ---------------------------------------------------------
import React from "react";
import { DayWorkout, DayVariation, AthleteState } from "../types/workout";

const cleanItemText = (htmlText: string): string => {
  if (!htmlText) return "";
  let cleaned = htmlText;
  // 1. Strip out span with class cue or className cue
  cleaned = cleaned.replace(/<span\s+[^>]*class(?:Name)?\s*=\s*['"]\s*cue\s*['"][^>]*>[\s\S]*?<\/span>/gi, "");
  // 2. Strip out any remaining HTML tags (like <span class='cue'> if something was malformed)
  cleaned = cleaned.replace(/<[^>]*>/g, "");
  // 3. Strip out common pattern indicators if they somehow leak (e.g. 🎯 ... to end of line)
  cleaned = cleaned.replace(/(?:🎯|⚠️|💡).*$/g, "");
  return cleaned.trim();
};

interface ShareCardOverlayProps {
  activeDay: DayWorkout;
  activeVariation: DayVariation;
  currentWeek: string;
  exportBgImage: string | null;
  exportLayout: "center" | "left" | "right";
  exportAthleteName: string;
  exportInspiration: string;
  exportCardOpacity: number;
  exportCardBlur: boolean;
  exportCardWidth: "compact" | "standard" | "wide";
  exportVerticalLayout: "top" | "center" | "bottom";
  exportSilhouetteEffect: "none" | "lighten" | "screen" | "overlay";
  exportOverlayImage: string | null;
  exportOverlayX: number;
  exportOverlayY: number;
  exportOverlayScale: number;
  exportOverlayOpacity: number;
  exportOverlayZ: "front" | "back";
  exportCardHeightLimit: number;
  teamSize: number;
  activeColorSet: { color: string; hover?: string; pulse?: string; text?: string; shadow?: string };
  midBandColor: { bg: string; text?: string; color?: string; border?: string; bgStyle?: React.CSSProperties };
  formatItemWithTeamVolume: (item: string, teamSize: number) => string;
  getDerivedInspiration: (tabName: string) => string;
}

export default function ShareCardOverlay({
  activeDay,
  activeVariation,
  currentWeek,
  exportBgImage,
  exportLayout,
  exportAthleteName,
  exportInspiration,
  exportCardOpacity,
  exportCardBlur,
  exportCardWidth,
  exportVerticalLayout,
  exportSilhouetteEffect,
  exportOverlayImage,
  exportOverlayX,
  exportOverlayY,
  exportOverlayScale,
  exportOverlayOpacity,
  exportOverlayZ,
  exportCardHeightLimit,
  teamSize,
  activeColorSet,
  midBandColor,
  formatItemWithTeamVolume,
  getDerivedInspiration,
}: ShareCardOverlayProps) {
  const cleanedWarmup = activeVariation.warmup.items
    .map(cleanItemText)
    .filter((item) => item.length > 0);
  const cleanedStrength = activeVariation.strength.items
    .map(cleanItemText)
    .filter((item) => item.length > 0);
  const cleanedMetcon = activeVariation.metcon.items
    .map(cleanItemText)
    .filter((item) => item.length > 0);
  const cleanedAccessories = activeVariation.accessories.items
    .map(cleanItemText)
    .filter((item) => item.length > 0);

  return (
    <div
      style={{
        position: "absolute",
        left: "-2000px",
        top: "-3000px",
        width: "1080px",
        height: "1920px",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div
        id="nexus-share-card-temp"
        className="flex flex-col justify-between overflow-hidden relative"
        style={{
          width: "1080px",
          height: "1920px",
          boxSizing: "border-box",
          fontFamily: '"Inter", sans-serif',
          background: exportBgImage ? "#000" : "#f8fafc",
        }}
      >
        {/* Background Image Layer */}
        {exportBgImage && (
          <div
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${exportBgImage})`,
            }}
          />
        )}

        {/* Gradient Overlay for text readability or Biomechanical Theme Base */}
        {exportBgImage ? (
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, rgba(5, 5, 8, 0.2) 0%, rgba(5, 5, 8, 0) 35%, rgba(5, 5, 8, 0) 65%, rgba(5, 5, 8, 0.35) 100%)",
            }}
          />
        ) : (
          <div
            className="absolute inset-0 z-0"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(31, 81, 255, 0.45) 0%, rgba(255, 0, 127, 0.4) 45%, rgba(14, 14, 17, 0.98) 95%)",
            }}
          />
        )}

        {/* Premium Top Bar */}
        <div
          className="absolute top-0 left-0 right-0 h-4.5 z-30 shadow-sm"
          style={{
            background: `linear-gradient(90deg, ${midBandColor.bg} 0%, ${activeColorSet.color} 100%)`,
            boxShadow: `0 0 25px ${activeColorSet.color}B3`,
          }}
        />

        {/* Tech Corner HUD Markers for the Entire Outer Frame */}
        {exportBgImage && (
          <div className="absolute inset-0 z-20 pointer-events-none p-6 font-mono text-[9px] text-zinc-550/80">
            <div className="absolute top-8 left-8 border-t-2 border-l-2 w-5 h-5" style={{ borderColor: `${activeColorSet.color}60` }} />
            <div className="absolute top-8 right-8 border-t-2 border-r-2 w-5 h-5" style={{ borderColor: `${activeColorSet.color}60` }} />
            <div className="absolute bottom-8 left-8 border-b-2 border-l-2 w-5 h-5" style={{ borderColor: `${activeColorSet.color}60` }} />
            <div className="absolute bottom-8 right-8 border-b-2 border-r-2 w-5 h-5" style={{ borderColor: `${activeColorSet.color}60` }} />
            
            {/* Telemetry labels */}
            <div className="absolute top-9 left-16 uppercase tracking-[0.25em]" style={{ color: activeColorSet.color }}>SYSTEM COMPILATION: ACTIVE</div>
          </div>
        )}

        <div className="relative z-20 flex flex-col h-full px-8 pt-12 pb-8">
          {/* MAIN HEADER AREA - PROFESSIONAL AND COMPACT */}
          <div className="mb-4 w-full flex justify-between items-start">
            <div
              className="flex w-full justify-between items-center border-b pb-4"
              style={{
                borderColor: exportBgImage
                  ? "rgba(255,255,255,0.12)"
                  : "rgba(0,0,0,0.1)",
              }}
            >
              <div className="flex flex-col items-start text-left">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="h-2 w-2 rounded-full animate-pulse"
                    style={{ 
                      backgroundColor: activeColorSet.color,
                      boxShadow: `0 0 10px ${activeColorSet.color}`
                    }}
                  />
                  <span
                    className={`font-mono text-base font-black tracking-[0.3em] uppercase ${exportBgImage ? "text-zinc-400" : "text-zinc-650"}`}
                  >
                    SEMANA{" "}
                    <span style={{ color: activeColorSet.color }}>
                      {currentWeek.toUpperCase().replace("W", "")}
                    </span>
                  </span>
                </div>
                <div className="flex items-baseline gap-4 flex-wrap">
                  <h1
                    className="text-[95px] font-black uppercase leading-none m-0 tracking-tighter italic text-left inline-block"
                    style={{
                      fontFamily: '"Anton", "Impact", sans-serif',
                      color: "#ffffff",
                      paddingRight: "18px",
                      textShadow: `0 0 12px ${activeColorSet.color}, 0 0 25px ${midBandColor.bg}B3, 0 0 45px ${activeColorSet.color}40`,
                    }}
                  >
                    {activeDay.name}
                  </h1>
                  {exportAthleteName && (
                    <span
                      className="text-[44px] font-black uppercase italic tracking-wider leading-none text-left inline-block"
                      style={{
                        fontFamily: '"Anton", "Impact", sans-serif',
                        color: activeColorSet.color,
                        textShadow: `0 0 12px ${activeColorSet.color}B3, 0 0 25px ${midBandColor.bg}80`,
                      }}
                    >
                      {exportAthleteName}
                    </span>
                  )}
                </div>
                <div
                  className="text-3xl font-black tracking-tighter mt-1.5 uppercase text-left text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)] font-condensed"
                  style={{ fontFamily: '"Roboto Condensed", sans-serif' }}
                >
                  {activeDay.title}
                </div>
              </div>

              <div className="flex flex-col items-end justify-center flex-shrink-0 ml-8">
                <img
                  src="/emblema.jpg"
                  alt="Nexus Logo"
                  className="w-20 h-20 object-contain rounded-full border border-white/5"
                  style={{
                    mixBlendMode: "screen",
                    opacity: 0.85,
                  }}
                />
                {!exportAthleteName && (
                  <div
                    className="inline-block border rounded-none px-3 py-1 font-mono text-[8px] font-black tracking-widest uppercase mt-2"
                    style={{
                      borderColor: activeColorSet.color,
                      color: activeColorSet.color,
                      backgroundColor: `${activeColorSet.color}1E`,
                    }}
                  >
                    {activeVariation.tabName}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BOTTOM WORKOUT CARDS AREA - DYNAMICS SIDE COLUMNS OR FULL WIDTH */}
          <div
            className={`flex flex-col ${
              exportLayout === "left"
                ? `mr-auto flex-1 ${
                    exportVerticalLayout === "top"
                      ? "justify-start pt-6 pb-2"
                      : exportVerticalLayout === "bottom"
                        ? "justify-end pt-2 pb-6"
                        : "justify-center py-4"
                  }`
                : exportLayout === "right"
                  ? `ml-auto flex-1 ${
                      exportVerticalLayout === "top"
                        ? "justify-start pt-6 pb-2"
                        : exportVerticalLayout === "bottom"
                          ? "justify-end pt-2 pb-6"
                          : "justify-center py-4"
                    }`
                  : "mx-auto mt-auto pb-4 justify-end"
            }`}
            style={{
              width:
                exportLayout === "center"
                  ? exportCardWidth === "compact"
                    ? "820px"
                    : exportCardWidth === "standard"
                      ? "920px"
                      : "1020px"
                  : exportCardWidth === "compact"
                    ? "440px"
                    : exportCardWidth === "standard"
                      ? "510px"
                      : "580px",
              maxWidth:
                exportLayout === "center"
                  ? exportCardWidth === "compact"
                    ? "820px"
                    : exportCardWidth === "standard"
                      ? "920px"
                      : "1020px"
                  : exportCardWidth === "compact"
                    ? "440px"
                    : exportCardWidth === "standard"
                      ? "510px"
                      : "580px",
            }}
          >
            <div
              className={`px-4 py-5 rounded-2xl relative overflow-hidden flex flex-col gap-3.5 shadow-[0_25px_70px_rgba(0,0,0,0.9)] ${
                exportBgImage
                  ? "border"
                  : "bg-white border border-black/5"
              }`}
              style={{
                maxHeight: `${1920 * (exportCardHeightLimit / 100)}px`,
                overflow: "hidden",
                borderColor: exportBgImage
                  ? `rgba(255, 255, 255, ${0.12 * (exportCardOpacity / 100)})`
                  : "rgba(0, 0, 0, 0.05)",
                zIndex: exportOverlayZ === "back" ? 12 : "auto",
                backgroundColor: exportBgImage
                  ? `rgba(10, 10, 15, ${exportCardOpacity / 100})`
                  : "rgb(255, 255, 255)",
                backdropFilter: exportBgImage && exportCardBlur && exportCardOpacity > 0
                  ? "blur(20px) saturate(160%)"
                  : "none",
                boxShadow: exportBgImage
                  ? `0 35px 85px rgba(0,0,0,0.9), inset 0 0 50px rgba(255,255,255,${0.06 * (exportCardOpacity / 100)})`
                  : "0 10px 30px rgba(0,0,0,0.03)",
              }}
            >
              {/* Inner Double Border Simulation using absolute CSS for high-fi HUD feel */}
              {exportBgImage && exportCardOpacity > 0 && (
                <div 
                  className="absolute inset-1 pointer-events-none rounded-[12px] border border-dashed border-white/[0.07]"
                />
              )}

              {/* Corner Indicators for Hud Container */}
              {exportBgImage && (
                <>
                  <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l pointer-events-none" style={{ borderColor: `${activeColorSet.color}80` }} />
                  <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r pointer-events-none" style={{ borderColor: `${activeColorSet.color}80` }} />
                  <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b border-l pointer-events-none" style={{ borderColor: `${activeColorSet.color}80` }} />
                  <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r pointer-events-none" style={{ borderColor: `${activeColorSet.color}80` }} />
                </>
              )}

              {/* Dynamic Silhouette Layer */}
              {exportBgImage && exportSilhouetteEffect !== "none" && (
                <div
                  className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none transition-all duration-300"
                  style={{
                    backgroundImage: `url(${exportBgImage})`,
                    mixBlendMode: exportSilhouetteEffect as any,
                    opacity: 0.8,
                    filter: "contrast(140%) brightness(110%) saturate(130%)",
                  }}
                />
              )}
              
              <div
                className={
                  exportLayout === "left" || exportLayout === "right"
                    ? "flex flex-col gap-5 w-full z-10"
                    : "grid grid-cols-4 gap-x-4 gap-y-0 items-stretch w-full z-10"
                }
              >
                {/* Warmup */}
                {cleanedWarmup.length > 0 && (
                  <div
                    className="flex flex-col gap-1 min-w-0 pr-1 text-left"
                    style={{
                      borderLeft: `3px solid ${activeColorSet.color}`,
                      paddingLeft: "10px",
                    }}
                  >
                    <div
                      className="flex flex-col gap-1 w-full p-2 rounded-lg mb-2 border text-left"
                      style={{
                        backgroundColor: "rgba(0, 0, 0, 0.75)",
                        borderColor: "rgba(255, 255, 255, 0.12)"
                      }}
                    >
                      <span
                        className={`font-mono font-black tracking-widest uppercase text-white ${
                          exportLayout === "left" || exportLayout === "right"
                            ? "text-[20px]"
                            : "text-[14px]"
                        }`}
                      >
                        CALENTAMIENTO
                      </span>
                      {activeVariation.warmup.scheme && (
                        <div className="w-full flex mt-0.5">
                          <span
                            className={`font-mono font-black uppercase tracking-widest rounded px-1.5 py-0.5 whitespace-normal break-words text-left bg-white/10 text-white/90 border border-white/15 ${
                              exportLayout === "left" || exportLayout === "right"
                                ? "text-[11px]"
                                : "text-[9px]"
                            }`}
                          >
                            {activeVariation.warmup.scheme}
                          </span>
                        </div>
                      )}
                    </div>
                    <ul
                      className={`font-condensed font-bold leading-tight space-y-1.5 overflow-hidden text-left ${
                        exportBgImage ? "text-zinc-100" : "text-zinc-800"
                      } ${
                        exportLayout === "left" || exportLayout === "right"
                          ? "text-[26px]"
                          : "text-[19px]"
                      }`}
                      style={{ 
                        fontFamily: '"Roboto Condensed", sans-serif',
                        textShadow: exportBgImage ? "0 2px 5px rgba(0,0,0,0.95)" : "none",
                      }}
                    >
                      {cleanedWarmup.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-left leading-tight">
                          <svg
                            className="shrink-0 mt-1.5 w-3 h-3"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            style={{
                              color: activeColorSet.color,
                              filter: `drop-shadow(0 0 5px ${activeColorSet.color})`,
                            }}
                          >
                            <path d="M12 2L2 12L12 22L22 12L12 2Z" />
                          </svg>
                          <span
                            className="break-words min-w-0 text-left normal-case flex-1"
                            dangerouslySetInnerHTML={{ __html: item }}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Strength */}
                {cleanedStrength.length > 0 && (
                  <div
                    className="flex flex-col gap-1 min-w-0 pr-1 text-left"
                    style={{
                      borderLeft: `3px solid ${activeColorSet.color}`,
                      paddingLeft: "10px",
                    }}
                  >
                    <div
                      className="flex flex-col gap-1 w-full p-2 rounded-lg mb-2 border text-left"
                      style={{
                        backgroundColor: "rgba(0, 0, 0, 0.75)",
                        borderColor: "rgba(255, 255, 255, 0.12)"
                      }}
                    >
                      <span
                        className={`font-mono font-black tracking-widest uppercase text-white ${
                          exportLayout === "left" || exportLayout === "right"
                            ? "text-[20px]"
                            : "text-[14px]"
                        }`}
                      >
                        FUERZA
                      </span>
                      {activeVariation.strength.scheme && (
                        <div className="w-full flex mt-0.5">
                          <span
                            className={`font-mono font-black uppercase tracking-widest rounded px-1.5 py-0.5 whitespace-normal break-words text-left bg-white/10 text-white/90 border border-white/15 ${
                              exportLayout === "left" || exportLayout === "right"
                                ? "text-[11px]"
                                : "text-[9px]"
                            }`}
                          >
                            {activeVariation.strength.scheme}
                          </span>
                        </div>
                      )}
                    </div>
                    <ul
                      className={`font-condensed font-bold leading-tight space-y-1.5 overflow-hidden text-left ${
                        exportBgImage ? "text-zinc-100" : "text-zinc-800"
                      } ${
                        exportLayout === "left" || exportLayout === "right"
                          ? "text-[26px]"
                          : "text-[19px]"
                      }`}
                      style={{ 
                        fontFamily: '"Roboto Condensed", sans-serif',
                        textShadow: exportBgImage ? "0 2px 5px rgba(0,0,0,0.95)" : "none",
                      }}
                    >
                      {cleanedStrength.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-left leading-tight">
                          <svg
                            className="shrink-0 mt-1.5 w-3 h-3"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            style={{
                              color: activeColorSet.color,
                              filter: `drop-shadow(0 0 5px ${activeColorSet.color})`,
                            }}
                          >
                            <path d="M12 2L2 12L12 22L22 12L12 2Z" />
                          </svg>
                          <span
                            className="break-words min-w-0 text-left normal-case flex-1"
                            dangerouslySetInnerHTML={{ __html: item }}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Metcon */}
                {cleanedMetcon.length > 0 && (
                  <div
                    className="flex flex-col gap-1 min-w-0 pr-1 text-left"
                    style={{
                      borderLeft: `3px solid ${activeColorSet.color}`,
                      paddingLeft: "10px",
                    }}
                  >
                    <div
                      className="flex flex-col gap-1 w-full p-2 rounded-lg mb-2 border text-left"
                      style={{
                        backgroundColor: "rgba(0, 0, 0, 0.75)",
                        borderColor: "rgba(255, 255, 255, 0.12)"
                      }}
                    >
                      <span
                        className={`font-mono font-black tracking-widest uppercase text-white ${
                          exportLayout === "left" || exportLayout === "right"
                            ? "text-[20px]"
                            : "text-[14px]"
                        }`}
                      >
                        METCON
                      </span>
                      {activeVariation.metcon.scheme && (
                        <div className="w-full flex mt-0.5">
                          <span
                            className={`font-mono font-black uppercase tracking-widest rounded px-1.5 py-0.5 whitespace-normal break-words text-left bg-white/10 text-white/90 border border-white/15 ${
                              exportLayout === "left" || exportLayout === "right"
                                ? "text-[11px]"
                                : "text-[9px]"
                            }`}
                          >
                            {activeVariation.metcon.scheme}
                          </span>
                        </div>
                      )}
                    </div>
                    <ul
                      className={`font-condensed font-bold leading-tight space-y-1.5 overflow-hidden text-left ${
                        exportBgImage ? "text-zinc-100" : "text-zinc-800"
                      } ${
                        exportLayout === "left" || exportLayout === "right"
                          ? "text-[26px]"
                          : "text-[19px]"
                      }`}
                      style={{ 
                        fontFamily: '"Roboto Condensed", sans-serif',
                        textShadow: exportBgImage ? "0 2px 5px rgba(0,0,0,0.95)" : "none",
                      }}
                    >
                      {cleanedMetcon.map((item, idx) => {
                        const formattedItem = formatItemWithTeamVolume(item, teamSize);
                        return (
                          <li key={idx} className="flex items-start gap-2.5 text-left leading-tight">
                            <svg
                              className="shrink-0 mt-1.5 w-3 h-3"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              style={{
                                color: activeColorSet.color,
                                filter: `drop-shadow(0 0 5px ${activeColorSet.color})`,
                              }}
                            >
                              <path d="M12 2L2 12L12 22L22 12L12 2Z" />
                            </svg>
                            <span
                              className="break-words min-w-0 text-left normal-case flex-1"
                              dangerouslySetInnerHTML={{ __html: formattedItem }}
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Accessories */}
                {cleanedAccessories.length > 0 && (
                  <div
                    className="flex flex-col gap-1 min-w-0 pr-1 text-left"
                    style={{
                      borderLeft: `3px solid ${activeColorSet.color}`,
                      paddingLeft: "10px",
                    }}
                  >
                    <div
                      className="flex flex-col gap-1 w-full p-2 rounded-lg mb-2 border text-left"
                      style={{
                        backgroundColor: "rgba(0, 0, 0, 0.75)",
                        borderColor: "rgba(255, 255, 255, 0.12)"
                      }}
                    >
                      <span
                        className={`font-mono font-black tracking-widest uppercase text-white ${
                          exportLayout === "left" || exportLayout === "right"
                            ? "text-[20px]"
                            : "text-[14px]"
                        }`}
                      >
                        ACCESORIOS
                      </span>
                      {activeVariation.accessories.scheme && (
                        <div className="w-full flex mt-0.5">
                          <span
                            className={`font-mono font-black uppercase tracking-widest rounded px-1.5 py-0.5 whitespace-normal break-words text-left bg-[#10b981]/25 text-[#aefbe2] border border-[#10b981]/45 ${
                              exportLayout === "left" || exportLayout === "right"
                                ? "text-[11px]"
                                : "text-[9px]"
                            }`}
                          >
                            {activeVariation.accessories.scheme}
                          </span>
                        </div>
                      )}
                    </div>
                    <ul
                      className={`font-condensed font-bold leading-tight space-y-1.5 overflow-hidden text-left ${
                        exportBgImage ? "text-zinc-100" : "text-zinc-800"
                      } ${
                        exportLayout === "left" || exportLayout === "right"
                          ? "text-[26px]"
                          : "text-[19px]"
                      }`}
                      style={{ 
                        fontFamily: '"Roboto Condensed", sans-serif',
                        textShadow: exportBgImage ? "0 2px 5px rgba(0,0,0,0.95)" : "none",
                      }}
                    >
                      {cleanedAccessories.map((item, idx) => {
                        const formattedItem = formatItemWithTeamVolume(item, teamSize);
                        return (
                          <li key={idx} className="flex items-start gap-2.5 text-left leading-tight">
                            <svg
                              className="shrink-0 mt-1.5 w-3 h-3"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              style={{
                                color: activeColorSet.color,
                                filter: `drop-shadow(0 0 5px ${activeColorSet.color})`,
                              }}
                            >
                              <path d="M12 2L2 12L12 22L22 12L12 2Z" />
                            </svg>
                            <span
                              className="break-words min-w-0 text-left normal-case flex-1"
                              dangerouslySetInnerHTML={{ __html: formattedItem }}
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Transparent PNG Silhouette Sticker Layer */}
        {exportBgImage && exportOverlayImage && (
          <div
            className="absolute pointer-events-none"
            style={{
              zIndex: exportOverlayZ === "front" ? 25 : 5,
              left: `calc(50% + ${exportOverlayX}%)`,
              bottom: `${exportOverlayY}px`,
              transform: `translateX(-50%) scale(${exportOverlayScale / 100})`,
              width: "1080px",
              height: "1920px",
              display: "flex",
              justifyContent: "center",
              alignItems: "end",
              opacity: exportOverlayOpacity / 100,
            }}
          >
            <img
              src={exportOverlayImage}
              alt="Transparent 3D Silhouette Overlay"
              className="max-h-full object-contain"
              style={{
                filter: "drop-shadow(0 20px 50px rgba(0,0,0,0.85))",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
```

## File: src/components/TelemetryBoard.tsx
```tsx
import React from "react";
import { motion } from "motion/react";
import { User } from "firebase/auth";
import { AthleteState, DayWorkout } from "../types/workout";
import { pushAllLocalToCloud } from "../lib/syncEngine";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  CloudLightning,
  Trophy,
  Upload,
  FileText,
  Check,
  Zap,
} from "lucide-react";

interface TelemetryBoardProps {
  athlete: AthleteState;
  currentWeek: string;
  chartData: any[];
  rpeDistributionData: any[];
  rpeComparisonInfo: any;
  currentXp: number;
  xpPercentage: number;
  weeklyCompletionInfo: { completedCount: number; percentage: number };
  activeDay: DayWorkout | null;
  activeDayLoggingPercentage: number;
  earnedLootList: string[];
  currentUser: User | null;
  manualSyncState: "idle" | "syncing" | "success" | "error";
  setManualSyncState: React.Dispatch<React.SetStateAction<"idle" | "syncing" | "success" | "error">>;
  setShowResetModal: (show: boolean) => void;
  setShowProfileModal: (show: boolean) => void;
  setTempAthlete: (athlete: AthleteState) => void;
  handleExportLocalHistory: () => void;
  handleExportLocalHistoryCSV: () => void;
  activeColorSet: { color: string; hover?: string; pulse?: string; text?: string; shadow?: string };
}

export default function TelemetryBoard({
  athlete,
  currentWeek,
  chartData,
  rpeDistributionData,
  rpeComparisonInfo,
  currentXp,
  xpPercentage,
  weeklyCompletionInfo,
  activeDay,
  activeDayLoggingPercentage,
  earnedLootList,
  currentUser,
  manualSyncState,
  setManualSyncState,
  setShowResetModal,
  setShowProfileModal,
  setTempAthlete,
  handleExportLocalHistory,
  handleExportLocalHistoryCSV,
  activeColorSet,
}: TelemetryBoardProps) {
  return (
    <section
      className="mt-4 p-6 border-4 border-double border-white/20 bg-pure-black/95 backdrop-blur-md"
      data-purpose="rpg-dashboard"
    >
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch font-condensed font-bold">
        {/* Left Block: Athlete attributes */}
        <motion.div layout className="space-y-4 flex flex-col justify-start">
          <div className="flex bg-electric-blue text-pure-white px-4 py-2 text-md lg:text-lg font-brutalist tracking-[0.12em] w-full min-h-[52px] h-[52px] items-center justify-center text-center shadow-md shadow-electric-blue/20 leading-none">
            ATLETA: {athlete.identity}
          </div>
          <div className="space-y-3 tracking-[0.08em] leading-relaxed font-condensed text-neutral-300 uppercase text-xs md:text-sm pt-2">
            <div>
              CONDICIÓN CLÍNICA:{" "}
              <span className="text-amber-500 font-bold tracking-[0.06em]">
                {athlete.condition}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setTempAthlete(athlete);
              setShowProfileModal(true);
            }}
            className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-electric-blue hover:text-white flex items-center gap-1 transition-all cursor-pointer self-start border-b border-dashed border-electric-blue hover:border-white w-auto mt-2"
          >
            ⚙️ EDITAR PERFIL COMPLETO
          </button>
        </motion.div>

        {/* Middle Block: Co-Op Host conditions */}
        <motion.div layout className="space-y-4 flex flex-col justify-start border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-6 lg:pl-8">
          <div className="flex bg-pure-white text-pure-black px-4 py-2 text-md lg:text-lg font-brutalist tracking-[0.12em] w-full min-h-[52px] h-[52px] items-center justify-center text-center shadow-md leading-none">
            CONEXIÓN COMUNIDAD (CO-OP)
          </div>
          <div className="space-y-3 tracking-[0.08em] leading-relaxed font-condensed pt-2 text-left">
            <div className="text-lg lg:text-xl text-emerald-400 flex items-center gap-2">
              <span className="text-xs">●</span> LUK: CO-OP READY (SEDE HAEDO)
            </div>
            <div className="text-lg lg:text-xl text-purple-400 flex items-center gap-2">
              <span className="text-xs">●</span> FLOR: SUPPORT ACTIVE (MURPH INTEGRADO)
            </div>
          </div>
        </motion.div>

        {/* Third Block: Performance Trend Chart */}
        <motion.div layout className="space-y-4 flex flex-col justify-start border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-6 lg:pl-8">
          <div className="flex bg-electric-blue text-pure-white px-4 py-2 text-md lg:text-lg font-brutalist tracking-[0.12em] w-full min-h-[52px] h-[52px] items-center justify-center text-center shadow-md shadow-electric-blue/20 leading-none">
            TENDENCIA RPE
          </div>
          <div className="text-xs text-neutral-400 font-mono uppercase tracking-[0.12em] pt-1 text-left">
            FATIGA SEMANA {currentWeek.replace("w", "")}
          </div>
          <div className="h-[95px] w-full mt-1" id="rpeChartContainer">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 5, left: -32, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis
                  dataKey="name"
                  stroke="#888"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: "#333" }}
                />
                <YAxis
                  stroke="#888"
                  fontSize={10}
                  domain={[0, 10]}
                  tickLine={false}
                  axisLine={{ stroke: "#333" }}
                  ticks={[2, 4, 6, 8, 10]}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#0E0E11] border border-electric-blue p-2 text-[10px] font-mono shadow-md text-left z-50">
                          <p className="font-bold text-white uppercase">
                            {data.name}
                          </p>
                          <p className="text-electric-blue">
                            RPE:{" "}
                            <span className="text-white font-bold">
                              {data.rpe ? `${data.rpe}/10` : "S/D"}
                            </span>
                          </p>
                          <p className="text-[8px] text-neutral-500 mt-0.5 uppercase">
                            {data.isReal ? "● REGISTRADO" : "○ MODELADO L4"}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rpe"
                  stroke={activeColorSet.color}
                  strokeWidth={2}
                  dot={{
                    r: 3,
                    stroke: activeColorSet.color,
                    strokeWidth: 1,
                    fill: "#000",
                  }}
                  activeDot={{ r: 5, fill: activeColorSet.color }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Distribution Chart of Effort Intensities */}
          <div className="border-t border-white/10 pt-2 mt-1 space-y-1">
            <div className="text-xs text-neutral-400 font-mono uppercase tracking-[0.12em] pt-1 text-left">
              DISTRIBUCIÓN INTENSIDAD RPE (1-10)
            </div>
            <div className="h-[95px] w-full" id="rpeDistChartContainer">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={rpeDistributionData}
                  margin={{ top: 5, right: 5, left: -32, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis
                    dataKey="rpeName"
                    stroke="#888"
                    fontSize={8}
                    tickLine={false}
                    axisLine={{ stroke: "#333" }}
                    tickFormatter={(val) => val.replace("RPE ", "")}
                  />
                  <YAxis
                    stroke="#888"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: "#333" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#0E0E11] border border-electric-blue p-2 text-[10px] font-mono shadow-md text-left z-50">
                            <p className="font-bold text-white uppercase">
                              {data.rpeName}
                            </p>
                            <p className="text-electric-blue">
                              FRECUENCIA:{" "}
                              <span className="text-white font-bold">
                                {data.frequency}{" "}
                                {data.frequency === 1 ? "VEZ" : "VECES"}
                              </span>
                            </p>
                            <p className="text-[8px] text-neutral-500 mt-0.5 uppercase">
                              {data.isReal ? "● REGISTRADO" : "○ MODELADO L4"}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="frequency" fill={activeColorSet.color}>
                    {rpeDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.displayColor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Dynamic RPE Comparative & Overtraining Detector Alert */}
            {rpeComparisonInfo && (
              <div className="bg-[#0b0c10] border border-white/10 p-3.5 space-y-3.5 rounded-sm select-none">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-[10px] font-black tracking-widest text-[#00f0ff] uppercase font-mono">
                    // HISTORIC COMPARISON (VS PREVIOUS CYCLES)
                  </span>
                  <span
                    className={`text-[8.5px] font-black px-2 py-0.5 rounded-xs tracking-widest uppercase font-mono leading-none ${
                      rpeComparisonInfo.status === "warning"
                        ? "bg-red-600/25 text-red-400 border border-red-500/30"
                        : rpeComparisonInfo.status === "good"
                          ? "bg-emerald-600/25 text-emerald-400 border border-emerald-500/30"
                          : "bg-neutral-800 text-neutral-300"
                    }`}
                  >
                    {rpeComparisonInfo.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="space-y-0.5">
                    <div className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">
                      PROPUESTO SESIÓN
                    </div>
                    <div className="text-xl font-bold font-brutalist text-white tracking-widest flex items-baseline justify-center gap-1 leading-none">
                      <span>{rpeComparisonInfo.currentAvg}</span>
                      <span className="text-[9px] text-neutral-500">AVG</span>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">
                      MEDIA ANT.
                    </div>
                    <div className="text-xl font-bold font-brutalist text-neutral-400 tracking-widest flex items-baseline justify-center gap-1 leading-none">
                      <span>{rpeComparisonInfo.priorAvg}</span>
                      <span className="text-[9px] text-neutral-500">AVG</span>
                    </div>
                  </div>
                </div>

                {/* Dev-style deviation meter bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[8px] font-mono text-neutral-400">
                    <span>DEVIACIÓN ADAPTATIVA CF-L4</span>
                    <span
                      className={
                        rpeComparisonInfo.status === "warning"
                          ? "text-red-400 font-extrabold"
                          : "text-neutral-400 font-bold"
                      }
                    >
                      {rpeComparisonInfo.diff > 0
                        ? `+${rpeComparisonInfo.diff}`
                        : rpeComparisonInfo.diff}{" "}
                      RPE
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-950 border border-white/5 p-0.5 rounded-xs relative overflow-hidden flex">
                    {/* Zero center marker */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20 z-10" />

                    {/* Negative bar (good) or Positive bar (warning) */}
                    {rpeComparisonInfo.diff < 0 ? (
                      <div
                        className="h-full bg-emerald-500 self-center rounded-xs opacity-90 transition-all duration-300"
                        style={{
                          marginLeft: `${Math.max(10, 50 - Math.min(40, Math.abs(rpeComparisonInfo.diff * 12)))}%`,
                          width: `${Math.min(40, Math.abs(rpeComparisonInfo.diff * 12))}%`,
                        }}
                      />
                    ) : (
                      <div
                        className={`h-full self-center rounded-xs opacity-90 transition-all duration-300 ${
                          rpeComparisonInfo.diff >= 0.8
                            ? "bg-red-500 shadow-sm"
                            : "bg-electric-blue"
                        }`}
                        style={{
                          marginLeft: "50%",
                          width: `${Math.min(48, rpeComparisonInfo.diff * 12)}%`,
                        }}
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <p
                    className={`text-[9.5px] font-bold leading-relaxed uppercase ${
                      rpeComparisonInfo.status === "warning"
                        ? "text-red-400"
                        : rpeComparisonInfo.status === "good"
                          ? "text-emerald-400"
                          : "text-neutral-300"
                    }`}
                  >
                    {rpeComparisonInfo.message}
                  </p>
                  <p className="text-[9px] font-mono text-neutral-400 italic leading-relaxed">
                    L4 CUE: "{rpeComparisonInfo.advice}"
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Block: Real-time XP & Progress */}
        <motion.div layout className="space-y-4 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-6 lg:pl-8">
          <div className="space-y-4">
            <div className="flex bg-pure-white text-pure-black px-4 py-2 text-md lg:text-lg font-brutalist tracking-[0.12em] w-full min-h-[52px] h-[52px] items-center justify-center text-center shadow-md leading-none">
              VOLUMEN DE TRABAJO
            </div>

            {/* 1. GENERAL EXP PROGRESS GAUGE */}
            <div className="space-y-1.5 text-left pt-1">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                  // REPS ACUMULADAS ATLETA
                </span>
                <span className="text-xs font-mono font-black text-pure-white leading-none">
                  <motion.span
                    key={currentXp}
                    initial={{ scale: 1.3, color: "#39ff14" }}
                    animate={{ scale: 1, color: "#00f0ff" }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 15,
                    }}
                    className="inline-block"
                  >
                    {currentXp}
                  </motion.span>{" "}
                  / 2000 REPS
                </span>
              </div>
              <div className="w-full h-3 bg-neutral-950 border border-white/10 p-0.5 overflow-hidden rounded-xs">
                <motion.div
                  className="h-full bg-electric-blue shadow-blue-glow"
                  animate={{ width: `${xpPercentage}%` }}
                  transition={{
                    type: "spring",
                    stiffness: 80,
                    damping: 18,
                  }}
                />
              </div>
            </div>

            {/* 2. WEEKLY COMPLETION GAUGE */}
            <div className="space-y-1.5 text-left border-t border-white/5 pt-2.5">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                  // PROGRESO SEMANA ACTIVADA
                </span>
                <span className="text-xs font-mono font-bold text-amber-400 leading-none">
                  {weeklyCompletionInfo.completedCount} / 7 COMPLETO ({weeklyCompletionInfo.percentage}%)
                </span>
              </div>
              <div className="w-full h-3 bg-neutral-950 border border-white/10 p-0.5 overflow-hidden rounded-xs">
                <motion.div
                  className="h-full bg-amber-400 shadow-sm"
                  animate={{
                    width: `${weeklyCompletionInfo.percentage}%`,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 85,
                    damping: 16,
                  }}
                />
              </div>
            </div>

            {/* 3. DAILY TRACKING LOG GAUGE */}
            {activeDay && (
              <div className="space-y-1.5 text-left border-t border-white/5 pt-2.5">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                    // BITÁCORA TÉCNICA DIARIA
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400 leading-none">
                    {activeDayLoggingPercentage}% REGISTROS HECHOS
                  </span>
                </div>
                <div className="w-full h-3 bg-neutral-950 border border-white/10 p-0.5 overflow-hidden rounded-xs">
                  <motion.div
                    className="h-full bg-[#39ff14] shadow-sm"
                    animate={{
                      width: `${activeDayLoggingPercentage}%`,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 90,
                      damping: 15,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2 flex-wrap text-left">
            <div className="flex gap-2 flex-wrap">
              <button
                className="bg-neutral-950 text-neutral-400 hover:text-white font-mono border border-white/15 px-2 py-1 text-[8.5px] font-bold tracking-widest hover:bg-neutral-900 active:scale-95 transition-all cursor-pointer leading-none uppercase"
                onClick={() => setShowResetModal(true)}
                type="button"
              >
                RESET ARCHIVE
              </button>
              <button
                className="bg-neutral-950 text-[#00f0ff] hover:text-white font-mono border border-[#00f0ff]/30 px-2 py-1 text-[8.5px] font-bold tracking-widest hover:bg-neutral-900 active:scale-95 transition-all cursor-pointer leading-none uppercase flex items-center gap-1"
                onClick={handleExportLocalHistory}
                type="button"
                title="Exportar bitácora local completa en archivo JSON descargable para backup"
              >
                <Upload size={10} className="rotate-180" /> EXPORTAR JSON(DB)
              </button>
              <button
                className="bg-neutral-950 text-[#ff007f] hover:text-white font-mono border border-[#ff007f]/30 px-2 py-1 text-[8.5px] font-bold tracking-widest hover:bg-neutral-900 active:scale-95 transition-all cursor-pointer leading-none uppercase flex items-center gap-1"
                onClick={handleExportLocalHistoryCSV}
                type="button"
                title="Exportar bitácora estructurada en formato Excel (CSV) para análisis externo"
              >
                <FileText size={10} /> EXPORTAR CSV(EXCEL)
              </button>
              <button
                className={`font-mono border px-2 py-1 text-[8.5px] font-bold tracking-widest active:scale-95 transition-all cursor-pointer leading-none uppercase flex items-center gap-1.5 ${
                  currentUser
                    ? "bg-emerald-950/40 text-emerald-450 border-emerald-500/35 hover:bg-emerald-500 hover:text-black hover:border-white"
                    : "bg-neutral-950 text-neutral-600 border-white/5 opacity-40 cursor-not-allowed"
                }`}
                disabled={!currentUser || manualSyncState === "syncing"}
                onClick={async () => {
                  if (currentUser) {
                    setManualSyncState("syncing");
                    try {
                      await pushAllLocalToCloud(currentUser.uid);
                      window.dispatchEvent(new Event("nexus_cloud_synced"));
                      setManualSyncState("success");
                      setTimeout(() => setManualSyncState("idle"), 3000);
                    } catch (e) {
                      console.error(e);
                      setManualSyncState("error");
                      setTimeout(() => setManualSyncState("idle"), 3000);
                    }
                  }
                }}
                type="button"
                title={
                  currentUser
                    ? "Forzar persistencia completa ahora"
                    : "Inicia sesión para subir backups"
                }
              >
                {manualSyncState === "syncing" ? (
                  <span>⏳ BACKING UP...</span>
                ) : manualSyncState === "success" ? (
                  <span className="text-emerald-400 font-extrabold">✓ BACKUP OK</span>
                ) : manualSyncState === "error" ? (
                  <span className="text-rose-400 font-extrabold">❌ ERROR SYNC</span>
                ) : (
                  <span>☁️ PORZAR SINCRO CLOUD</span>
                )}
              </button>
            </div>
            <div className="text-[8px] font-mono text-neutral-500 uppercase italic">
              {currentUser ? "// BACKUP MANUAL HABILITADO" : "// ACCESO NUBE INACTIVO"}
            </div>
          </div>

          {/* Loot Deck Section */}
          {earnedLootList.length > 0 && (
            <div className="border-t border-white/10 pt-3 mt-1.5 space-y-1.5 text-left">
              <div className="text-[10px] text-amber-400 font-mono uppercase tracking-widest flex items-center gap-1 bg-amber-400/10 py-1 px-1.5 border border-amber-400/20 rounded-sm">
                <Trophy size={11} className="shrink-0 text-amber-400" />
                <span>BOTÍN RECLAMADO ({earnedLootList.length} ITEMS)</span>
              </div>
              <div className="flex flex-wrap gap-1 max-h-[72px] overflow-y-auto pr-1">
                {earnedLootList.map((item, index) => (
                  <span
                    key={index}
                    className="bg-neutral-900 border border-amber-400/40 text-amber-300 font-mono text-[9px] font-bold uppercase py-0.5 px-1.5 rounded-sm inline-flex items-center gap-1 select-text hover:border-amber-400 transition-colors"
                    title="Item obtenido por Misiones Diarias"
                  >
                    🛡️ {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}
```

## File: src/components/WorkoutBlockCard.tsx
```tsx
import React from "react";
import { DayWorkout, DayVariation } from "../types/workout";
import WorkoutTimer from "./WorkoutTimer";
import BrandInspirationAccordion from "./BrandInspirationAccordion";
import ExerciseLogger from "./ExerciseLogger";
import WorkoutHistoryControl from "./WorkoutHistoryControl";
import { getCleanExerciseName } from "../lib/historyUtils";

interface WorkoutBlockCardProps {
  blockType: "warmup" | "strength" | "metcon" | "accessories";
  activeVariation: DayVariation;
  activeDay: DayWorkout | null;
  isColumns?: boolean;
  enableThemedBackgrounds: boolean;
  backgroundImage: string;
  icon: React.ReactNode;
  globalRpeAvg: number;
  teamSize: number;
  currentVariationIndex: number;
  formatItemWithTeamVolume: (item: string, teamSize: number) => string;
  renderExplicitTimeCapBlock: (scheme: string, type: string, isColumns?: boolean) => React.ReactNode;
  handleVariationTouchStart?: (e: React.TouchEvent) => void;
  handleVariationTouchMove?: (e: React.TouchEvent) => void;
  handleVariationTouchEnd?: (e: React.TouchEvent) => void;
  isHistoryExpanded?: boolean;
  onToggleHistory?: () => void;
}

export default function WorkoutBlockCard({
  blockType,
  activeVariation,
  activeDay,
  isColumns = false,
  enableThemedBackgrounds,
  backgroundImage,
  icon,
  globalRpeAvg,
  teamSize,
  currentVariationIndex,
  formatItemWithTeamVolume,
  renderExplicitTimeCapBlock,
  handleVariationTouchStart,
  handleVariationTouchMove,
  handleVariationTouchEnd,
  isHistoryExpanded = false,
  onToggleHistory,
}: WorkoutBlockCardProps) {
  const blockData = activeVariation[blockType];
  const capitalizedBlockName = blockType === "accessories" 
    ? "Accessories" 
    : blockType.charAt(0).toUpperCase() + blockType.slice(1);

  return (
    <section
      className={`flex flex-col transition-all duration-300 rounded-none min-w-0 break-words h-full bg-zinc-950 shadow-[0_15px_45px_rgba(0,0,0,0.7)] relative overflow-hidden ${
        isColumns ? "gap-5 p-5 xl:p-6 xl:min-h-[680px]" : "gap-4 p-4 sm:p-5"
      }`}
      onTouchStart={handleVariationTouchStart}
      onTouchMove={handleVariationTouchMove}
      onTouchEnd={handleVariationTouchEnd}
    >
      {enableThemedBackgrounds && (
        <div className="absolute inset-x-0 top-0 h-[380px] pointer-events-none z-0">
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              backgroundImage: `url('${backgroundImage}')`,
              backgroundSize: "cover",
              backgroundPosition: "center 25%",
              opacity: 0.7,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/10 via-zinc-950/70 to-zinc-950" />
        </div>
      )}

      <header className="relative z-10 px-4 py-2 flex items-center justify-between bg-electric-blue shadow-md shadow-electric-blue/40 min-h-[76px] lg:h-[76px]">
        <h2 className="text-[20px] lg:text-2xl font-brutalist italic leading-tight text-pure-black">
          {blockData.title}
        </h2>
        <div className="shrink-0 ml-2">{icon}</div>
      </header>

      <div className="relative z-10 space-y-4 flex-grow flex flex-col justify-between">
        <div className="space-y-4 pt-1">
          {renderExplicitTimeCapBlock(
            blockData.scheme,
            blockType,
            isColumns,
          )}
          <BrandInspirationAccordion
            tabName={activeVariation.tabName}
            title={blockData.title}
            items={blockData.items}
            blockId={`${blockType}_${activeDay?.id || "default"}`}
          />
          <WorkoutTimer
            key={`${blockType}-${activeDay?.id}-${currentVariationIndex}`}
            dayId={`${activeDay?.id || "default"}-var${currentVariationIndex}-${blockType}`}
            title={blockData.title}
            scheme={blockData.scheme}
            blockName={capitalizedBlockName}
            highRpeDetected={globalRpeAvg >= 9}
          />

          <ul
            className={`font-condensed font-bold tracking-wide ${
              isColumns
                ? "text-base xl:text-[17.5px] space-y-3.5"
                : "text-xl space-y-4"
            }`}
          >
            {blockData.items.map((item, idx) => {
              const formattedItem = formatItemWithTeamVolume(item, teamSize);
              
              if (blockType === "warmup") {
                return (
                  <li
                    key={idx}
                    className="relative pl-6 normal-case text-neutral-200 min-w-0 break-words py-1.5 text-left w-full"
                  >
                    <span
                      className="absolute left-0 top-1.5 h-[1.45em] w-4 flex items-center justify-center select-none font-sans text-[14px]"
                      style={{ color: "var(--color-electric-blue)" }}
                    >
                      ✦
                    </span>
                    <div
                      dangerouslySetInnerHTML={{ __html: formattedItem }}
                      className="flex-1 min-w-0"
                    />
                  </li>
                );
              }

              return (
                <li
                  key={idx}
                  className="normal-case text-neutral-200 min-w-0 break-words pb-1 last:pb-0"
                >
                  <ExerciseLogger
                    dayId={activeDay?.id || ""}
                    exerciseName={getCleanExerciseName(formattedItem)}
                    rawItemHtml={formattedItem}
                  />
                </li>
              );
            })}
          </ul>
        </div>

        {/* COLLAPSIBLE QUICK HISTORY BLOCK FOR NON-WARMUP BLOCKS */}
        {blockType !== "warmup" && onToggleHistory && (
          <WorkoutHistoryControl
            items={blockData.items}
            isHistoryExpanded={isHistoryExpanded}
            onToggleHistory={onToggleHistory}
            currentWeek={(activeDay?.id && activeDay.id.startsWith("w") ? activeDay.id.substring(0, 2) : "w2")}
          />
        )}
      </div>
    </section>
  );
}
```

## File: src/components/WorkoutHistoryControl.tsx
```tsx
import React from "react";
import { RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import HistoryTable from "./HistoryTable";
import { getCleanExerciseName, getExerciseHistory } from "../lib/historyUtils";
import { WEEK_ACCENT_COLORS } from "../lib/constants";

interface WorkoutHistoryControlProps {
  items: string[];
  isHistoryExpanded: boolean;
  onToggleHistory: () => void;
  currentWeek?: string;
}

export default function WorkoutHistoryControl({
  items,
  isHistoryExpanded,
  onToggleHistory,
  currentWeek = "w2",
}: WorkoutHistoryControlProps) {
  // Retrieve the week's accent color metadata
  const weekAccent = WEEK_ACCENT_COLORS[currentWeek] || WEEK_ACCENT_COLORS.w2;

  return (
    <div className="no-print mt-auto pt-2">
      <div
        className="transition-all duration-300 border bg-zinc-950/90 select-none overflow-hidden"
        style={{
          boxShadow: isHistoryExpanded ? weekAccent.shadow : "none",
          borderColor: isHistoryExpanded ? weekAccent.color : "rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Compact Toggle Card Header */}
        <button
          type="button"
          onClick={onToggleHistory}
          className="w-full flex justify-between items-center py-2 px-3 hover:bg-neutral-900/80 transition-all font-mono text-[9px] tracking-wider uppercase font-bold cursor-pointer"
          style={{
            borderBottom: isHistoryExpanded ? `1px solid ${weekAccent.color}25` : "none",
          }}
        >
          <span className="flex items-center gap-1.5" style={{ color: weekAccent.color }}>
            <RotateCcw size={10} style={{ color: weekAccent.color }} className="animate-pulse" />
            <span>METRÓNOMO DE HISTORIA ({items.length})</span>
          </span>
          <span className="flex items-center gap-1 text-neutral-400">
            <span>{isHistoryExpanded ? "CERRAR" : "EXPANDIR"}</span>
            {isHistoryExpanded ? (
              <ChevronUp size={11} style={{ color: weekAccent.color }} />
            ) : (
              <ChevronDown size={11} />
            )}
          </span>
        </button>

        {isHistoryExpanded && (
          <div className="p-2 space-y-2 max-h-[190px] overflow-y-auto custom-scrollbar bg-black/60 scroll-smooth">
            {items.map((item, itemIdx) => {
              const cleanName = getCleanExerciseName(item);
              const history = getExerciseHistory(item);
              return (
                <div
                  key={itemIdx}
                  className="p-1.5 bg-neutral-950/80 border border-neutral-900/60 rounded-xs last:pb-1.5 transition-all hover:bg-neutral-900/30"
                >
                  <div className="font-condensed font-bold text-[11px] text-neutral-300 uppercase tracking-wide flex justify-between items-center mb-1">
                    <span
                      className="truncate max-w-[170px] hover:text-white transition-colors"
                      title={cleanName}
                    >
                      {cleanName}
                    </span>
                    {history.length > 0 && (
                      <span className="text-[8px] font-mono font-bold text-emerald-400 bg-emerald-950/20 px-1 border border-emerald-900/30 rounded-xs">
                        {history.length} {history.length === 1 ? "sesión" : "sesiones"}
                      </span>
                    )}
                  </div>
                  {history.length === 0 ? (
                    <div className="text-[8px] font-mono text-neutral-600 italic px-1">
                      Aún sin registros en bitácora L4
                    </div>
                  ) : (
                    <div className="px-0.5">
                      <HistoryTable history={history} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
```

## File: src/components/WorkoutTimer.tsx
```tsx
import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { parseProtocol } from "../lib/protocolParser";
import TimerSetupForm from "./timer/TimerSetupForm";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Zap,
  Heart,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  Clock,
  Bell,
  BellOff,
  Plus,
  Minus,
  AlertTriangle,
  SkipForward,
  Square,
} from "lucide-react";

interface WorkoutTimerProps {
  dayId: string;
  title?: string;
  scheme?: string;
  items?: string[];
  blockName?: string;
  key?: string | number;
  highRpeDetected?: boolean;
}


export default function WorkoutTimer({
  dayId,
  title = "",
  scheme = "",
  items = [],
  blockName = "",
  highRpeDetected = false,
}: WorkoutTimerProps) {
  // Config states
  const [isMuted, setIsMuted] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<
    "default" | "granted" | "denied" | "unsupported"
  >(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "unsupported";
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Simulated Heart Rate
  const [heartRate, setHeartRate] = useState<number>(75);
  const [isHighHRManual, setIsHighHRManual] = useState<boolean>(false);

  // Notification Flash State
  const [flashType, setFlashType] = useState<"WORK" | "REST" | "DONE" | null>(
    null,
  );

  // Parse standard protocol settings from title and scheme
  const smartConfig = useMemo(
    () => parseProtocol(title, scheme, blockName),
    [scheme, title, blockName],
  );

  // Operational states (with manual on-the-fly override dials)
  const [workOverride, setWorkOverride] = useState<number | null>(null);
  const [restOverride, setRestOverride] = useState<number | null>(null);
  const [roundsOverride, setRoundsOverride] = useState<number | null>(null);

  // Active values (checking overrides)
  const activeWork =
    workOverride !== null ? workOverride : smartConfig.work || 0;
  const activeRest =
    restOverride !== null ? restOverride : smartConfig.rest || 0;
  const activeRounds =
    roundsOverride !== null ? roundsOverride : smartConfig.rounds || 1;

  const [smartState, setSmartState] = useState<
    "IDLE" | "WORK" | "REST" | "DONE"
  >("IDLE");
  const [smartRound, setSmartRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);

  // Automated custom interval choices (work/rest rounds) when protocol lacks explicit guidelines
  const [showAutoSetup, setShowAutoSetup] = useState(false);
  const [customIntervalConfigured, setCustomIntervalConfigured] =
    useState(false);
  const [tempWork, setTempWork] = useState(60);
  const [tempRest, setTempRest] = useState(90);
  const [tempRounds, setTempRounds] = useState(4);

  // Secondary independent stopwatch
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchPlaying, setIsStopwatchPlaying] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const stopwatchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Tone generator (Athletic retro beeps)
  const playChimeNote = (
    freq: number,
    duration: number,
    type: OscillatorType = "sine",
  ) => {
    if (isMuted) return;
    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  const requestNotificationPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    try {
      const p = await Notification.requestPermission();
      setNotificationPermission(p);
      if (p === "granted") {
        new Notification("⏱️ Smart Timer Activo", {
          body: "Bip sonoro e indicadores de fase listos de acuerdo al protocolo L4.",
          tag: "timer-setup",
        });
      }
    } catch (err) {}
  };

  const triggerAlarm = (
    message: string,
    type: "WORK" | "REST" | "DONE" | null = null,
  ) => {
    if (type) setFlashType(type);

    // Gym double chime
    playChimeNote(587.33, 0.25, "triangle"); // D5
    setTimeout(() => playChimeNote(880.0, 0.45, "sine"), 120); // A5

    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      try {
        const notif = new Notification("⏱️ Nexus L4 Clock", {
          body: message,
          tag: "workout-rest",
          requireInteraction: true,
        });
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch (err) {}
    }
    setTimeout(() => setFlashType(null), 3000);
  };

  // Reset Smart Timer parameters
  const initializeSmartTimer = () => {
    setSmartState("IDLE");
    setSmartRound(1);

    if (activeWork > 0) {
      setTimeLeft(activeWork);
    } else {
      setTimeLeft(activeRest || 90);
    }
  };

  // Reset overrides when block/day changes
  useEffect(() => {
    setWorkOverride(null);
    setRestOverride(null);
    setRoundsOverride(null);
    setSmartState("IDLE");
    setSmartRound(1);
    setShowAutoSetup(false);
    setCustomIntervalConfigured(false);

    // Apply initial parsing values directly
    const defaultWork = smartConfig.work || 0;
    const defaultRest = smartConfig.rest || 0;
    if (defaultWork > 0) {
      setTimeLeft(defaultWork);
    } else {
      setTimeLeft(defaultRest || 90);
    }

    setStopwatchTime(0);
    setIsStopwatchPlaying(false);
  }, [dayId, smartConfig]);

  // Dynamically update timeLeft when overrides change and the timer is in IDLE mode
  useEffect(() => {
    if (smartState === "IDLE" && smartRound === 1) {
      if (activeWork > 0) {
        setTimeLeft(activeWork);
      } else {
        setTimeLeft(activeRest || 90);
      }
    }
  }, [activeWork, activeRest, smartState, smartRound]);

  // HR Simulation rules
  useEffect(() => {
    if (isHighHRManual) {
      setHeartRate(165 + Math.floor(Math.random() * 6));
      return;
    }
    const isActive =
      smartState === "WORK" || smartState === "REST" || isStopwatchPlaying;
    if (isActive) {
      if (smartState === "WORK" || isStopwatchPlaying) {
        setHeartRate((prev) =>
          Math.min(
            182,
            prev < 115 ? 115 : prev + Math.floor(Math.random() * 3),
          ),
        );
      } else if (smartState === "REST") {
        setHeartRate((prev) =>
          Math.max(88, prev - Math.floor(Math.random() * 2) - 1),
        );
      }
    } else {
      setHeartRate((prev) =>
        prev > 74
          ? prev - Math.floor(Math.random() * 2) - 1
          : prev + Math.floor(Math.random() * 2),
      );
    }
  }, [timeLeft, stopwatchTime, smartState, isStopwatchPlaying, isHighHRManual]);

  // Handle phase transitions
  const handlePhaseComplete = () => {
    if (activeWork > 0 && activeRest > 0) {
      // Alternating intervals
      if (smartState === "WORK") {
        triggerAlarm("¡TRABAJO TERMINADO! Entrando en descanso.", "REST");
        setSmartState("REST");
        setTimeLeft(activeRest);
      } else {
        // Increment round
        const nextRound = smartRound + 1;
        if (nextRound > activeRounds) {
          triggerAlarm(
            "¡BLOQUE COMPLETADO! Buen trabajo, Everyday Athlete.",
            "DONE",
          );
          setSmartState("DONE");
          setTimeLeft(0);
        } else {
          triggerAlarm(`¡RONDA ${nextRound}! A trabajar.`, "WORK");
          setSmartRound(nextRound);
          setSmartState("WORK");
          setTimeLeft(activeWork);
        }
      }
    } else if (activeWork > 0) {
      // Work only intervals
      const nextRound = smartRound + 1;
      if (nextRound > activeRounds) {
        triggerAlarm(
          "¡BLOQUE COMPLETADO! Buen trabajo, Everyday Athlete.",
          "DONE",
        );
        setSmartState("DONE");
        setTimeLeft(0);
      } else {
        triggerAlarm(`¡RONDA ${nextRound}! A trabajar.`, "WORK");
        setSmartRound(nextRound);
        setSmartState("WORK");
        setTimeLeft(activeWork);
      }
    } else {
      // Rest only intervals
      triggerAlarm("¡DESCANSO COMPLETADO!", "DONE");
      setSmartState("DONE");
      setTimeLeft(0);
    }
  };

  // Tick logic for countdown
  useEffect(() => {
    if (smartState === "WORK" || smartState === "REST") {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handlePhaseComplete();
            return 0;
          }
          // Distinctive climbing warning signals (final 3 seconds) prior to WORK phase conclusion
          if (smartState === "WORK") {
            if (prev === 4) {
              playChimeNote(523.25, 0.15, "triangle"); // Note C5 at 3 seconds remaining
            } else if (prev === 3) {
              playChimeNote(587.33, 0.15, "triangle"); // Note D5 at 2 seconds remaining
            } else if (prev === 2) {
              playChimeNote(659.25, 0.15, "triangle"); // Note E5 at 1 second remaining
            }
          } else {
            // Standard countdown alert during REST/other phases
            if (prev === 4 || prev === 3 || prev === 2) {
              playChimeNote(880.0, 0.08, "triangle"); // High short warning beep
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [smartState, smartRound, activeWork, activeRest, activeRounds]);

  // Tick logic for independent stopwatch
  useEffect(() => {
    if (isStopwatchPlaying) {
      stopwatchIntervalRef.current = setInterval(
        () => setStopwatchTime((p) => p + 1),
        1000,
      );
    }
    return () => {
      if (stopwatchIntervalRef.current)
        clearInterval(stopwatchIntervalRef.current);
    };
  }, [isStopwatchPlaying]);

  const toggleSmartPlay = () => {
    if (smartState === "IDLE" || smartState === "DONE") {
      if (
        smartConfig.type === "NORMAL" &&
        !customIntervalConfigured &&
        workOverride === null
      ) {
        setShowAutoSetup(true);
        playChimeNote(523.25, 0.15, "sine"); // C5
        return;
      }

      if (smartState === "DONE") initializeSmartTimer();

      const nextPhase = activeWork > 0 ? "WORK" : "REST";
      setSmartState(nextPhase);
      setIsStopwatchPlaying(true); // <--- Auto start global stopwatch on smart initiation!
      playChimeNote(660.0, 0.12, "sine");

      if (notificationPermission === "default") requestNotificationPermission();
    } else if (smartState === "WORK" || smartState === "REST") {
      setSmartState("IDLE");
      playChimeNote(440.0, 0.1, "sine");
    }
  };

  const skipPhase = () => {
    if (smartState === "WORK" || smartState === "REST") {
      playChimeNote(783.99, 0.15, "triangle"); // Note G5
      handlePhaseComplete();
    }
  };

  const stopSmartPlay = () => {
    setWorkOverride(null);
    setRestOverride(null);
    setRoundsOverride(null);
    setCustomIntervalConfigured(false);
    setShowAutoSetup(false);
    initializeSmartTimer();
    setIsStopwatchPlaying(false); // <--- Reset and stop global stopwatch too on "REINICIAR TODOS"
    setStopwatchTime(0);
    playChimeNote(330.0, 0.2, "sine");
  };

  const detenerReloj = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (stopwatchIntervalRef.current) {
      clearInterval(stopwatchIntervalRef.current);
      stopwatchIntervalRef.current = null;
    }

    setSmartState("IDLE");
    setSmartRound(1);
    setIsStopwatchPlaying(false);
    setStopwatchTime(0);

    if (activeWork > 0) {
      setTimeLeft(activeWork);
    } else {
      setTimeLeft(activeRest || 90);
    }

    playChimeNote(330.0, 0.25, "sine");
  };

  const toggleStopwatch = () => {
    if (notificationPermission === "default") requestNotificationPermission();
    setIsStopwatchPlaying(!isStopwatchPlaying);
    playChimeNote(660.0, 0.1, "sine");
  };

  const stopStopwatch = () => {
    setIsStopwatchPlaying(false);
    setStopwatchTime(0);
    playChimeNote(330.0, 0.2, "sine");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const renderSetupForm = (isFull: boolean) => {
    return (
      <TimerSetupForm
        isFull={isFull}
        tempWork={tempWork}
        tempRest={tempRest}
        tempRounds={tempRounds}
        setTempWork={setTempWork}
        setTempRest={setTempRest}
        setTempRounds={setTempRounds}
        formatTime={formatTime}
        onStartSeries={() => {
          setWorkOverride(tempWork);
          setRestOverride(tempRest);
          setRoundsOverride(tempRounds);
          setCustomIntervalConfigured(true);
          setSmartState("WORK");
          setTimeLeft(tempWork);
          setSmartRound(1);
          setIsStopwatchPlaying(true);
          setShowAutoSetup(false);
          playChimeNote(660, 0.15, "triangle");
          if (notificationPermission === "default")
            requestNotificationPermission();
        }}
        onOnlyRest={() => {
          setCustomIntervalConfigured(false);
          setSmartState("REST");
          setTimeLeft(tempRest);
          setSmartRound(1);
          setIsStopwatchPlaying(true);
          setShowAutoSetup(false);
          playChimeNote(587.33, 0.1, "sine");
        }}
        onCancel={() => {
          setShowAutoSetup(false);
        }}
      />
    );
  };

  const isLowTime =
    (smartState === "WORK" || smartState === "REST") &&
    timeLeft <= 10 &&
    timeLeft > 0;
  const isHighIntensity = heartRate >= 145;

  const renderProgress = () => {
    if (!isExpanded && !isFullscreen) return null;
    let total = 90;
    if (smartState === "WORK") total = activeWork || 1;
    else if (smartState === "REST") total = activeRest || 90;
    else total = activeWork || activeRest || 90;

    const pct = total > 0 ? (timeLeft / total) * 100 : 0;
    return (
      <div
        className={`absolute bottom-0 left-0 right-0 ${isFullscreen ? "h-3" : "h-1"} bg-black/30`}
      >
        <div
          className={`h-full transition-all duration-1000 ease-linear ${
            smartState === "WORK"
              ? "bg-rose-500"
              : smartState === "REST"
                ? "bg-emerald-400"
                : "bg-electric-blue"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    );
  };

  // Render Compact Badge (Collapsed state)
  if (!isExpanded && !isFullscreen) {
    return (
      <div
        className="relative no-print w-full rounded-sm p-3 border border-transparent bg-zinc-950/60 backdrop-blur-xs hover:bg-neutral-900 transition-all cursor-pointer shadow-md"
        onClick={() => setIsExpanded(true)}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <Clock size={24} className="text-electric-blue shrink-0" />
            <div className="flex flex-col items-start justify-center">
              <span className="text-sm font-condensed font-black tracking-widest text-[#00F0FF] uppercase">
                SMART TIMER
              </span>
            </div>

            {/* Status tags */}
            {(smartState === "WORK" || smartState === "REST") && (
              <span
                className={`text-[10px] px-2 py-0.5 ml-2 font-mono rounded font-bold uppercase ${
                  smartState === "WORK"
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                }`}
              >
                {smartState === "WORK" ? "WORK" : "REST"} {formatTime(timeLeft)}
              </span>
            )}

            {isStopwatchPlaying && smartState === "IDLE" && (
              <span className="text-[10px] px-2 py-0.5 ml-2 font-mono rounded font-bold bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30">
                CRONO {formatTime(stopwatchTime)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono uppercase tracking-wider shrink-0">
            <span>ABRIR</span>
            <ChevronDown size={14} className="text-neutral-400" />
          </div>
        </div>
      </div>
    );
  }

  // --- RENDERING FULLSCREEN MODE ---
  if (isFullscreen) {
    return createPortal(
      <div
        className={`fixed inset-0 z-[999999] bg-black text-white flex flex-col justify-between p-4 sm:p-6 md:p-8 h-screen w-screen overflow-y-auto overflow-x-hidden font-sans transition-all duration-300 ${
          flashType === "WORK" || (smartState === "WORK" && isLowTime)
            ? "shadow-[inset_0_0_155px_rgba(224,30,74,0.65)] border-8 border-rose-500/90"
            : flashType === "REST" || (smartState === "REST" && isLowTime)
              ? "shadow-[inset_0_0_155px_rgba(16,185,129,0.65)] border-8 border-emerald-500/90"
              : flashType === "DONE"
                ? "shadow-[inset_0_0_155px_rgba(0,240,255,0.65)] border-8 border-[#00F0FF]/90"
                : smartState === "WORK"
                  ? "shadow-[inset_0_0_100px_rgba(244,63,94,0.35)] border-4 border-rose-500/40"
                  : smartState === "REST"
                    ? "shadow-[inset_0_0_100px_rgba(16,185,129,0.35)] border-4 border-emerald-500/40"
                    : "border-0"
        }`}
      >
        {renderProgress()}

        {/* TOP STATUS BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-3 w-full gap-3 shrink-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-[#00F0FF] animate-bounce" />
              <span className="font-mono text-xs text-[#00F0FF] tracking-widest font-black uppercase">
                CRONÓMETRO COMPETICIÓN NEXUS L4
              </span>
            </div>
            <h1 className="text-base sm:text-xl font-condensed font-black tracking-wide text-neutral-200 uppercase mt-0.5 truncate">
              {title || "SMART TIMER"}
            </h1>
          </div>

          {/* Quick utility controls */}
          <div className="flex items-center gap-3 shrink-0 z-10">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 sm:p-3 rounded-md bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <div
              className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md border text-xs sm:text-sm font-mono ${
                isHighIntensity
                  ? "border-rose-500 text-rose-500 bg-rose-500/10 animate-pulse"
                  : "border-white/10 text-neutral-400"
              }`}
            >
              <Heart
                size={14}
                className={isHighIntensity ? "fill-current" : ""}
              />
              <span>{heartRate} lpm</span>
            </div>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 sm:p-3 rounded-md bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
              title="Salir de pantalla completa"
            >
              <Minimize2 size={16} />
            </button>
          </div>
        </div>

        {/* TITAN PANEL GRID (Main Titan clock + sidebar stopwatch info) */}
        {showAutoSetup ? (
          <div className="flex-grow flex items-center justify-center w-full my-2 sm:my-4 z-10 p-4">
            {renderSetupForm(true)}
          </div>
        ) : (
          <div className="flex-grow flex flex-col lg:flex-row items-center justify-center w-full my-2 sm:my-4 gap-4 lg:gap-10 min-h-0 z-10">
            {/* Titans Column */}
            <div className="flex-grow flex flex-col justify-center items-center text-center w-full min-w-0">
              {/* Active stage label */}
              <div className="mb-0.5 shrink-0 z-10">
                {smartState === "WORK" && (
                  <span className="text-xl sm:text-2xl font-mono tracking-widest font-black text-rose-500 bg-rose-500/10 px-4 py-1 border border-rose-500/20 rounded-full animate-pulse">
                    ¡TRABAJO!
                  </span>
                )}
                {smartState === "REST" && (
                  <span className="text-xl sm:text-2xl font-mono tracking-widest font-black text-emerald-400 bg-emerald-400/10 px-4 py-1 border border-emerald-400/20 rounded-full animate-pulse">
                    ¡DESCANSO!
                  </span>
                )}
                {smartState === "IDLE" && (
                  <span className="text-xl sm:text-2xl font-mono tracking-widest font-black text-amber-400 bg-amber-400/10 px-4 py-1 border border-amber-400/20 rounded-full">
                    PREPARADO
                  </span>
                )}
                {smartState === "DONE" && (
                  <span className="text-xl sm:text-2xl font-mono tracking-widest font-black text-[#00F0FF] bg-[#00F0FF]/10 px-4 py-1 border border-[#00F0FF]/25 rounded-full animate-bounce">
                    LOGRADO
                  </span>
                )}
              </div>

              {/* GIANT COUNTDOWN TIMER */}
              <div
                className={`text-[31vw] xs:text-[29vw] sm:text-[18rem] md:text-[23rem] lg:text-[27rem] xl:text-[32rem] font-black font-mono leading-none tracking-tighter select-none tabular-nums truncate transition-colors duration-300 z-10 ${
                  smartState === "WORK"
                    ? "text-rose-500 font-black"
                    : smartState === "REST"
                      ? "text-emerald-400"
                      : smartState === "DONE"
                        ? "text-[#00F0FF]"
                        : "text-neutral-300"
                }`}
              >
                {formatTime(timeLeft)}
              </div>

              {/* PROTOCOLO LABELS AND MANUAL ADJUSTERS (Work, Rest, Rounds) */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl w-full bg-neutral-900 border border-white/5 rounded-xl p-3 sm:p-4 mt-1 shrink-0 shadow-2xl z-10">
                {/* Work Adjuster */}
                <div className="flex flex-col items-center border-r border-white/10 pr-2">
                  <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-bold">
                    TRABAJO
                  </span>
                  <span className="text-sm sm:text-lg font-condensed font-bold text-white mt-0.5">
                    {activeWork ? `${formatTime(activeWork)}` : "S/D"}
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    <button
                      onClick={() => {
                        setWorkOverride((prev) => {
                          const currentVal =
                            prev !== null ? prev : smartConfig.work || 0;
                          const updatedVal = Math.max(0, currentVal - 10);
                          if (smartState === "WORK" || smartState === "IDLE") {
                            setTimeLeft((t) => Math.max(0, t - 10));
                          }
                          return updatedVal;
                        });
                      }}
                      className="p-1 px-1.5 bg-neutral-950 border border-white/10 rounded text-[9px] hover:bg-neutral-800 transition-colors cursor-pointer text-neutral-300"
                    >
                      -10
                    </button>
                    <button
                      onClick={() => {
                        setWorkOverride((prev) => {
                          const currentVal =
                            prev !== null ? prev : smartConfig.work || 0;
                          const updatedVal = currentVal + 10;
                          if (smartState === "WORK" || smartState === "IDLE") {
                            setTimeLeft((t) => t + 10);
                          }
                          return updatedVal;
                        });
                      }}
                      className="p-1 px-1.5 bg-neutral-950 border border-white/10 rounded text-[9px] hover:bg-neutral-800 transition-colors cursor-pointer text-neutral-300"
                    >
                      +10
                    </button>
                  </div>
                </div>

                {/* Rest Adjuster */}
                <div className="flex flex-col items-center border-r border-white/10 px-2">
                  <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-bold">
                    DESCANSO
                  </span>
                  <span className="text-sm sm:text-lg font-condensed font-bold text-emerald-400 mt-0.5">
                    {formatTime(activeRest)}
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    <button
                      onClick={() => {
                        setRestOverride((prev) => {
                          const currentVal =
                            prev !== null ? prev : smartConfig.rest || 0;
                          const updatedVal = Math.max(0, currentVal - 5);
                          if (
                            smartState === "REST" ||
                            (smartState === "IDLE" && activeWork === 0)
                          ) {
                            setTimeLeft((t) => Math.max(0, t - 5));
                          }
                          return updatedVal;
                        });
                      }}
                      className="p-1 px-1.5 bg-neutral-950 border border-white/10 rounded text-[9px] hover:bg-neutral-800 transition-colors cursor-pointer text-neutral-300"
                    >
                      -5
                    </button>
                    <button
                      onClick={() => {
                        setRestOverride((prev) => {
                          const currentVal =
                            prev !== null ? prev : smartConfig.rest || 0;
                          const updatedVal = currentVal + 5;
                          if (
                            smartState === "REST" ||
                            (smartState === "IDLE" && activeWork === 0)
                          ) {
                            setTimeLeft((t) => t + 5);
                          }
                          return updatedVal;
                        });
                      }}
                      className="p-1 px-1.5 bg-neutral-950 border border-white/10 rounded text-[9px] hover:bg-neutral-800 transition-colors cursor-pointer text-neutral-300"
                    >
                      +5
                    </button>
                  </div>
                </div>

                {/* Rounds Adjuster */}
                <div className="flex flex-col items-center pl-1">
                  <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-bold">
                    RONDA
                  </span>
                  <span className="text-sm sm:text-lg font-condensed font-bold text-[#00F0FF] mt-0.5">
                    {smartRound}/{activeRounds}
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    <button
                      onClick={() =>
                        setRoundsOverride((prev) =>
                          Math.max(
                            1,
                            (prev !== null ? prev : smartConfig.rounds || 1) -
                              1,
                          ),
                        )
                      }
                      className="p-1 px-1.5 bg-neutral-950 border border-white/10 rounded text-[9px] hover:bg-neutral-800 transition-colors cursor-pointer text-neutral-300"
                    >
                      -1
                    </button>
                    <button
                      onClick={() =>
                        setRoundsOverride(
                          (prev) =>
                            (prev !== null ? prev : smartConfig.rounds || 1) +
                            1,
                        )
                      }
                      className="p-1 px-1.5 bg-neutral-950 border border-white/10 rounded text-[9px] hover:bg-neutral-800 transition-colors cursor-pointer text-neutral-300"
                    >
                      +1
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SECONDARY SIDEBAR: AUXILIARY STOPWATCH */}
            <div className="lg:w-80 w-full bg-neutral-900/85 p-3 sm:p-4 rounded-xl border border-white/5 flex flex-row lg:flex-col justify-between items-center sm:items-stretch shrink-0 shadow-xl gap-3 sm:gap-4 z-10">
              <div className="flex flex-row lg:flex-col items-center lg:items-stretch gap-4 lg:gap-0 flex-grow">
                <div className="flex items-center gap-2 border-b-0 lg:border-b border-white/10 pb-0 lg:pb-2 mb-0 lg:mb-3">
                  <Clock size={15} className="text-[#00F0FF]" />
                  <span className="font-mono text-[10px] sm:text-xs text-neutral-400 tracking-wider font-bold uppercase truncate">
                    GLOBAL
                  </span>
                  {isStopwatchPlaying && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-ping" />
                  )}
                </div>

                <div className="text-left lg:text-center py-0 lg:py-2">
                  <div className="text-2xl sm:text-3xl lg:text-5xl font-black font-mono text-white tracking-widest tabular-nums leading-none">
                    {formatTime(stopwatchTime)}
                  </div>
                </div>
              </div>

              {/* Stopwatch Actions */}
              <div className="flex lg:grid lg:grid-cols-2 gap-1.5 shrink-0">
                <button
                  onClick={toggleStopwatch}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded font-bold uppercase tracking-wider text-[10px] sm:text-xs font-mono transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    isStopwatchPlaying
                      ? "bg-orange-500/15 text-orange-400 border border-orange-500/20 hover:bg-orange-500/25"
                      : "bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/20 hover:bg-[#00F0FF]/25"
                  }`}
                >
                  {isStopwatchPlaying ? (
                    <Pause size={12} />
                  ) : (
                    <Play size={12} />
                  )}
                  <span>{isStopwatchPlaying ? "PAUSA" : "START"}</span>
                </button>
                <button
                  onClick={stopStopwatch}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded bg-neutral-950 border border-white/10 text-neutral-400 hover:text-white transition-all text-[10px] sm:text-xs font-mono font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>RESET</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM TIMER ACTIONS ROW */}
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 shrink-0 border-t border-white/10 pt-3.5 w-full z-10">
          {smartState === "WORK" && activeRest > 0 && (
            <button
              onClick={() => {
                triggerAlarm(
                  "¡TRABAJO TERMINADO! Entrando en descanso.",
                  "REST",
                );
                setSmartState("REST");
                setTimeLeft(activeRest);
                setIsStopwatchPlaying(true);
              }}
              className="px-6 py-3 sm:px-8 sm:py-3.5 rounded-full bg-emerald-500 font-black text-black uppercase tracking-widest text-[10px] sm:text-xs transition-all shadow-lg hover:scale-105 cursor-pointer animate-pulse flex items-center gap-1.5"
            >
              <Zap size={15} className="fill-current" />
              <span>INICIAR DESCANSO ({formatTime(activeRest)})</span>
            </button>
          )}

          {smartState === "REST" && (
            <button
              onClick={skipPhase}
              className="px-6 py-3 sm:px-8 sm:py-3.5 rounded-full bg-rose-500 text-black font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all shadow-lg hover:scale-105 cursor-pointer flex items-center gap-1.5"
            >
              <SkipForward size={15} className="fill-current" />
              <span>TERMINAR DESCANSO (SERIE LISTA)</span>
            </button>
          )}

          <button
            onClick={toggleSmartPlay}
            className={`px-8 py-4 sm:px-11 sm:py-5 rounded-full font-black uppercase tracking-widest text-xs sm:text-sm transition-all focus:outline-none flex items-center gap-2 shadow-2xl hover:scale-105 cursor-pointer ${
              smartState === "WORK" || smartState === "REST"
                ? "bg-amber-400 text-black hover:bg-amber-300 shadow-amber-400/40 ring-4 ring-amber-400/30 font-black"
                : "bg-emerald-400 text-black hover:bg-emerald-300 hover:shadow-emerald-400/75 ring-8 ring-emerald-400/20 shadow-[0_0_35px_rgba(52,211,153,0.55)] animate-pulse font-black"
            }`}
          >
            {smartState === "WORK" || smartState === "REST" ? (
              <Pause size={18} className="fill-current" />
            ) : (
              <Play size={18} className="fill-current" />
            )}
            <span>
              {smartState === "WORK" || smartState === "REST"
                ? "PAUSAR CONTEO"
                : "EMPEZAR PROTOCOLO"}
            </span>
          </button>

          {(smartState === "WORK" ||
            smartState === "REST" ||
            timeLeft < (activeWork || 0)) && (
            <button
              type="button"
              onClick={detenerReloj}
              className="px-8 py-4 sm:px-11 sm:py-5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-widest text-xs sm:text-sm transition-all focus:outline-none flex items-center gap-2 shadow-2xl hover:scale-105 cursor-pointer border border-rose-500/20"
            >
              <Square size={18} className="fill-current" />
              <span>DETENER RELOJ</span>
            </button>
          )}

          {(smartState === "WORK" || smartState === "REST") && (
            <button
              onClick={skipPhase}
              className="px-4 py-3 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-600/30 hover:bg-indigo-600/30 transition-all font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 cursor-pointer hover:scale-105"
              title="Avanzar de fase manualmente"
            >
              <SkipForward size={12} />
              <span>SALTAR FASE</span>
            </button>
          )}

          <button
            onClick={stopSmartPlay}
            className="px-4 py-3 rounded-full bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 cursor-pointer hover:scale-105"
          >
            <RotateCcw size={12} />
            <span>REINICIAR TODOS</span>
          </button>

          <button
            onClick={() => setIsFullscreen(false)}
            className="px-5 py-3 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-lg hover:scale-105 cursor-pointer"
          >
            SALIR DEL RELOJ
          </button>
        </div>
      </div>,
      document.body,
    );
  }

  // --- RENDERING EXPANDED IN-LINE CARD MODE ---
  return (
    <div
      className={`relative transition-all duration-300 no-print flex flex-col overflow-hidden w-full rounded-xl p-4 md:p-6 my-4 shadow-xl border ${
        flashType === "WORK"
          ? "border-rose-500 bg-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.3)] text-rose-100"
          : flashType === "REST"
            ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.3)] text-emerald-100"
            : flashType === "DONE"
              ? "border-[#00F0FF] bg-[#00F0FF]/10 shadow-[0_0_20px_rgba(0,240,255,0.3)] text-[#00F0FF]"
              : isLowTime
                ? "border-rose-500/50 bg-rose-500/10 text-rose-200"
                : "border-transparent bg-zinc-950/90"
      }`}
    >
      {renderProgress()}

      {/* Header Info */}
      <div className="flex flex-wrap justify-between items-center z-10 w-full mb-4 gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <Zap
            size={14}
            className={
              flashType || isLowTime
                ? "text-rose-500 animate-pulse"
                : "text-electric-blue"
            }
          />
          <span className="font-mono text-[10px] text-neutral-400 tracking-widest uppercase font-black">
            SMART TIMER
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] shrink-0">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>
          <button
            type="button"
            onClick={() => setIsHighHRManual(!isHighHRManual)}
            className={`flex items-center gap-1 p-1.5 rounded border transition-colors cursor-pointer ${
              isHighIntensity
                ? "border-rose-500 text-rose-400 animate-pulse bg-rose-500/10"
                : "border-white/15 bg-zinc-900 text-neutral-400"
            }`}
          >
            <Heart
              size={12}
              className={isHighIntensity ? "fill-current" : ""}
            />{" "}
            {heartRate}
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="p-1.5 px-3 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 font-extrabold font-mono tracking-widest uppercase flex items-center gap-1.5 transition-all cursor-pointer hover:scale-102"
          >
            <Maximize2 size={12} className="stroke-[3px]" />
            <span>PANTALLA COMPLETA</span>
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronUp size={13} />
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      {showAutoSetup ? (
        <div className="w-full relative z-10 pb-2">
          {renderSetupForm(false)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 z-10 w-full relative content-center pb-2">
          {/* SMART TIMER PANEL */}
          <div
            className={`flex flex-col p-4 w-full justify-center rounded-lg border ${
              highRpeDetected
                ? "border-transparent shadow-[0_0_20px_rgba(225,29,72,0.35)] animate-pulse"
                : flashType === "WORK"
                  ? "bg-rose-500/20 border-rose-500"
                  : flashType === "REST"
                    ? "bg-emerald-500/20 border-emerald-500"
                    : flashType === "DONE"
                      ? "bg-[#00F0FF]/25 border-[#00F0FF]"
                      : isLowTime
                        ? "bg-rose-500/5 border-rose-500/40"
                        : "bg-black/40 border-transparent"
            }`}
          >
            <div className="flex justify-between items-start mb-2 gap-2">
              <div className="flex flex-col overflow-hidden">
                <span
                  className={`text-[9px] font-mono tracking-widest uppercase font-black ${
                    smartState === "WORK"
                      ? "text-rose-400"
                      : smartState === "REST"
                        ? "text-emerald-400"
                        : "text-neutral-400"
                  }`}
                >
                  {smartConfig.name || "TEMPORIZADOR"}
                </span>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider truncate mt-0.5">
                  {smartConfig.type === "INTERVAL" ||
                  smartConfig.type === "EMOM"
                    ? `Ronda: ${smartRound}/${activeRounds}`
                    : "Cuenta regresiva"}{" "}
                  <span
                    className={
                      smartState === "WORK"
                        ? "text-rose-400 font-black"
                        : smartState === "REST"
                          ? "text-emerald-400 font-black"
                          : "text-neutral-500"
                    }
                  >
                    ({smartState})
                  </span>
                </span>
              </div>

              <div className="flex gap-1 shrink-0">
                <button
                  type="button"
                  onClick={toggleSmartPlay}
                  className={`p-1.5 rounded transition-colors flex items-center justify-center cursor-pointer ${
                    smartState === "WORK" || smartState === "REST"
                      ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                      : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                  }`}
                >
                  {smartState === "WORK" || smartState === "REST" ? (
                    <Pause size={14} />
                  ) : (
                    <Play size={14} />
                  )}
                </button>
                {(smartState === "WORK" || smartState === "REST") && (
                  <button
                    type="button"
                    onClick={skipPhase}
                    className="p-1.5 bg-indigo-950/80 border border-indigo-900/30 text-indigo-400 hover:bg-indigo-900/30 rounded transition-colors flex items-center justify-center cursor-pointer"
                    title="Avanzar de fase"
                  >
                    <SkipForward size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={detenerReloj}
                  className="p-1.5 bg-rose-950/20 text-rose-400 hover:text-white hover:bg-rose-900/40 rounded transition-colors flex items-center justify-center cursor-pointer"
                  title="Detener reloj (Retiene ajustes)"
                >
                  <Square size={14} />
                </button>
                <button
                  type="button"
                  onClick={stopSmartPlay}
                  className="p-1.5 bg-zinc-900 text-neutral-400 hover:text-white rounded transition-colors flex items-center justify-center cursor-pointer"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            <div
              className={`text-5xl font-mono font-black tracking-tight select-none tabular-nums py-2 ${
                flashType === "WORK" || isLowTime || smartState === "WORK"
                  ? "text-rose-500"
                  : flashType === "REST" || smartState === "REST"
                    ? "text-emerald-400"
                    : flashType === "DONE"
                      ? "text-[#00F0FF]"
                      : "text-neutral-300"
              }`}
            >
              {formatTime(timeLeft)}
            </div>

            {/* DYNAMIC REST PHASING IN-CARD BUTTONS */}
            {smartState === "WORK" && activeRest > 0 && (
              <button
                type="button"
                onClick={() => {
                  triggerAlarm(
                    "¡TRABAJO TERMINADO! Entrando en descanso.",
                    "REST",
                  );
                  setSmartState("REST");
                  setTimeLeft(activeRest);
                  setIsStopwatchPlaying(true);
                }}
                className="mt-1 w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all rounded-md flex items-center justify-center gap-1.5 shadow-md cursor-pointer animate-pulse"
              >
                <Zap size={12} className="fill-current" />
                <span>INICIAR DESCANSO ({formatTime(activeRest)})</span>
              </button>
            )}

            {smartState === "REST" && (
              <button
                type="button"
                onClick={skipPhase}
                className="mt-1 w-full py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold uppercase tracking-widest text-[10px] sm:text-xs transition-all rounded-md flex items-center justify-center gap-1.5 border border-rose-500/30 cursor-pointer text-center"
              >
                <SkipForward size={12} />
                <span>TERMINAR DESCANSO (EMPEZAR SERIE)</span>
              </button>
            )}

            {/* Quick preset selector buttons */}
            {(smartConfig.type === "NORMAL" ||
              smartConfig.type === "STRENGTH" ||
              smartState === "IDLE" ||
              smartState === "REST") && (
              <div className="flex flex-col mt-2.5">
                <span className="text-[8px] font-mono font-black tracking-widest text-neutral-400 uppercase mb-1">
                  PREAJUSTES DE DESCANSO INMEDIATOS:
                </span>
                <div className="flex flex-wrap gap-1">
                  {[30, 45, 60, 90, 120].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => {
                        setSmartState("REST");
                        setTimeLeft(s);
                        setRestOverride(s);
                        setIsStopwatchPlaying(true);
                        playChimeNote(660, 0.1, "sine");
                        if (notificationPermission === "default")
                          requestNotificationPermission();
                      }}
                      className={`text-[9px] px-1.5 py-1 rounded font-mono font-black transition-all cursor-pointer ${
                        timeLeft === s && smartState === "REST"
                          ? "bg-emerald-400 text-black font-black font-mono shadow-md scale-105"
                          : "bg-neutral-900 border border-white/5 text-neutral-400 hover:text-white hover:bg-neutral-800"
                      }`}
                    >
                      {s}s REPOSO
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* STOPWATCH PANEL */}
          <div className="flex flex-col p-4 w-full justify-center bg-black/40 rounded-lg border border-white/5">
            <div className="flex justify-between items-start mb-2 gap-2">
              <div className="flex flex-col overflow-hidden">
                <span className="text-[9px] font-mono tracking-widest text-[#00F0FF] uppercase font-black">
                  CRONÓMETRO
                </span>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider truncate mt-0.5">
                  Tiempo de sesión
                </span>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  type="button"
                  onClick={toggleStopwatch}
                  className="p-1.5 bg-[#00F0FF]/15 text-[#00F0FF] hover:bg-[#00F0FF]/25 border border-[#00F0FF]/25 rounded transition-colors flex items-center justify-center cursor-pointer"
                >
                  {isStopwatchPlaying ? (
                    <Pause size={14} />
                  ) : (
                    <Play size={14} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={stopStopwatch}
                  className="p-1.5 bg-zinc-900 text-neutral-400 hover:text-white rounded transition-colors flex items-center justify-center cursor-pointer"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            <div className="text-5xl font-mono font-black tracking-tight text-neutral-300 py-2 tabular-nums">
              {formatTime(stopwatchTime)}
            </div>
          </div>
        </div>
      )}

      {/* Global Bottom Control Bar for Extended In-line Card */}
      <div className="flex flex-wrap gap-2.5 justify-center mt-3 pt-3 border-t border-white/5 w-full z-10">
        <button
          type="button"
          onClick={toggleSmartPlay}
          className={`px-5 py-2 rounded-full font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 shadow-md ${
            smartState === "WORK" || smartState === "REST"
              ? "bg-amber-400 text-black hover:bg-amber-300 shadow-amber-400/20"
              : "bg-emerald-400 text-black hover:bg-emerald-300 shadow-emerald-400/20"
          }`}
        >
          {smartState === "WORK" || smartState === "REST" ? (
            <Pause size={12} className="fill-current" />
          ) : (
            <Play size={12} className="fill-current" />
          )}
          <span>
            {smartState === "WORK" || smartState === "REST"
              ? "PAUSAR"
              : "INICIAR RELOJ"}
          </span>
        </button>

        {(smartState === "WORK" ||
          smartState === "REST" ||
          timeLeft < (activeWork || 0)) && (
          <button
            type="button"
            onClick={detenerReloj}
            className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 shadow-md border border-rose-500/20 shadow-rose-600/20"
          >
            <Square size={11} className="fill-current" />
            <span>DETENER RELOJ</span>
          </button>
        )}

        {(smartState === "WORK" || smartState === "REST") && (
          <button
            type="button"
            onClick={skipPhase}
            className="px-4 py-2 rounded-full bg-zinc-900 border border-white/10 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-all font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 cursor-pointer hover:scale-105"
          >
            <SkipForward size={11} />
            <span>SALTAR FASE</span>
          </button>
        )}

        <button
          type="button"
          onClick={stopSmartPlay}
          className="px-4 py-2 rounded-full bg-zinc-900 border border-white/10 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 cursor-pointer hover:scale-105"
        >
          <RotateCcw size={11} />
          <span>REINICIAR ALL</span>
        </button>
      </div>
    </div>
  );
}
```

## File: src/components/analytics/BiomechanicsSection.tsx
```tsx
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from "recharts";
import { Sparkles } from "lucide-react";

interface BiomechanicsSectionProps {
  activeDay: any;
  currentVariationIndex: number;
}

export default function BiomechanicsSection({
  activeDay,
  currentVariationIndex,
}: BiomechanicsSectionProps) {
  if (!activeDay) return null;

  // Get active variation (today's workout schedule)
  const activeVar = activeDay.variations[currentVariationIndex] || activeDay.variations[0];
  if (!activeVar) return null;

  // Build the lists of today's exercises
  const exercisesList: { originalName: string; cleanName: string; category: string }[] = [];

  // Grab items
  if (activeVar.strength?.items) {
    activeVar.strength.items.forEach((item: string) => {
      exercisesList.push({
        originalName: item,
        cleanName: item.replace(/<[^>]*>/g, "").trim(),
        category: "Fuerza",
      });
    });
  }
  if (activeVar.metcon?.items) {
    activeVar.metcon.items.forEach((item: string) => {
      exercisesList.push({
        originalName: item,
        cleanName: item.replace(/<[^>]*>/g, "").trim(),
        category: "Metcon",
      });
    });
  }
  if (activeVar.accessories?.items) {
    activeVar.accessories.items.forEach((item: string) => {
      exercisesList.push({
        originalName: item,
        cleanName: item.replace(/<[^>]*>/g, "").trim(),
        category: "Accesorios",
      });
    });
  }

  // Default static biomechanics vectors mappings that match PRVN methodology
  const mapping: { [key: string]: { knee?: number; hip?: number; pull?: number; push?: number; core?: number } } = {
    SQUAT: { knee: 8, hip: 3, core: 5 },
    SENTADILLA: { knee: 8, hip: 3, core: 5 },
    CLEAN: { knee: 6, hip: 9, pull: 7, push: 2, core: 7 },
    SNATCH: { knee: 5, hip: 9, pull: 8, push: 4, core: 8 },
    DEADLIFT: { knee: 1, hip: 9, pull: 7, core: 8 },
    PESO: { knee: 1, hip: 9, pull: 7, core: 8 },
    PULL: { pull: 8, core: 3 },
    DOMINADA: { pull: 8, core: 3 },
    PRESS: { push: 9, core: 6 },
    JERK: { knee: 4, hip: 4, push: 9, core: 8 },
    THRUSTER: { knee: 7, hip: 5, push: 8, core: 8 },
    RUN: { knee: 5, hip: 4, core: 3 },
    ROW: { knee: 4, hip: 6, pull: 5, core: 4 },
    REM: { knee: 4, hip: 6, pull: 5, core: 4 },
    BIKE: { knee: 7, core: 2 },
    ECHO: { knee: 7, push: 4, pull: 4, core: 3 },
    BURPEE: { knee: 4, hip: 4, push: 5, core: 4 },
    DOUBLE: { knee: 3, core: 3 },
    DU: { knee: 3, core: 3 },
    LUNGE: { knee: 8, hip: 5, core: 5 },
    ESTOCADA: { knee: 8, hip: 5, core: 5 },
    CRUNCH: { core: 9 },
    ABS: { core: 9 },
  };

  let kneeSum = 0, kneeCnt = 0;
  let hipSum = 0, hipCnt = 0;
  let pullSum = 0, pullCnt = 0;
  let pushSum = 0, pushCnt = 0;
  let coreSum = 0, coreCnt = 0;

  exercisesList.forEach((ex) => {
    const up = ex.cleanName.toUpperCase();
    let matched = false;

    Object.keys(mapping).forEach((key) => {
      if (up.includes(key)) {
        matched = true;
        const val = mapping[key];
        if (val.knee) { kneeSum += val.knee; kneeCnt++; }
        if (val.hip) { hipSum += val.hip; hipCnt++; }
        if (val.pull) { pullSum += val.pull; pullCnt++; }
        if (val.push) { pushSum += val.push; pushCnt++; }
        if (val.core) { coreSum += val.core; coreCnt++; }
      }
    });

    // Simple category baseline defaults if not explicitly matched
    if (!matched) {
      if (ex.category === "Fuerza") {
        kneeSum += 5; kneeCnt++;
        hipSum += 5; hipCnt++;
        pullSum += 4; pullCnt++;
        coreSum += 4; coreCnt++;
      } else if (ex.category === "Metcon") {
        kneeSum += 3; kneeCnt++;
        hipSum += 3; hipCnt++;
        coreSum += 5; coreCnt++;
      } else {
        coreSum += 4; coreCnt++;
      }
    }
  });

  const kneeFinal = kneeCnt > 0 ? (kneeSum / kneeCnt) : 1.5;
  const hipFinal = hipCnt > 0 ? (hipSum / hipCnt) : 1.5;
  const pullFinal = pullCnt > 0 ? (pullSum / pullCnt) : 1.5;
  const pushFinal = pushCnt > 0 ? (pushSum / pushCnt) : 1.5;
  const coreFinal = coreCnt > 0 ? (coreSum / coreCnt) : 1.5;

  const radarData = [
    { subject: "VÍAS RODILLAS (FLEX/EXT)", A: Number(kneeFinal.toFixed(1)), fullMark: 10 },
    { subject: "BISAGRA CADERA (CADENA POST)", A: Number(hipFinal.toFixed(1)), fullMark: 10 },
    { subject: "TRACCIÓN (PULL EN LATS)", A: Number(pullFinal.toFixed(1)), fullMark: 10 },
    { subject: "EMPUJE (PRESS/JERK)", A: Number(pushFinal.toFixed(1)), fullMark: 10 },
    { subject: "MIDLINE / ANTIESTÁTICO CORE", A: Number(coreFinal.toFixed(1)), fullMark: 10 },
  ];

  // Find biomechanics recommendation
  let diagnostic = "Ejes distribuidos de manera proporcional.";
  let urgentAlert = "";

  if (kneeFinal > 6.5) {
    diagnostic = "ALTA CARGA EN CUÁDRICEPS: Prioriza cuidar torque en rodillas. Evita acumular estocadas cruzadas.";
  } else if (hipFinal > 6.5) {
    diagnostic = "TENSIÓN SEVERA EN CADENA POSTERIOR: Flexores de cadera y lumbares exigidos. Estira el psoas ilíaco.";
  } else if (coreFinal > 6.5) {
    diagnostic = "SOBRECARGA DEL CORE CENTRAL: Alta tensión intraabdominal por compuestos. Excelente transmisión de fuerza.";
  }

  if (exercisesList.some(e => e.cleanName.toUpperCase().includes("SIT-UP") || e.cleanName.toUpperCase().includes("L-SIT"))) {
    urgentAlert = "⚠️ DETECTADO ACTIVACIÓN FORZADA DEL PSOAS (SIT-UPS/L-SITS). ¡RECOMIENDA SUSTITUIR POR CRUNCH RECTO O PLANK ANTIESTÁTICA!";
  }

  return (
    <section className="p-5 border bg-zinc-950/80 border-white/5 rounded-sm flex flex-col text-left space-y-4 shadow-sm">
      <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
        <Sparkles size={14} className="text-indigo-400" />
        DIAGNÓSTICO BIOMECÁNICO DEL DÍA (MAP DE VECTORES)
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
        <div className="lg:col-span-3 h-[255px] bg-black/40 border border-white/5 rounded-xs p-2 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#222" />
              <PolarAngleAxis
                dataKey="subject"
                stroke="#888"
                fontSize={8}
                fontFamily="monospace"
              />
              <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="#333" fontSize={7} />
              <Radar
                 name="Dosis de Torque"
                 dataKey="A"
                 stroke="#82ca9d"
                 fill="#82ca9d"
                 fillOpacity={0.15}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#09090b",
                  borderColor: "#333",
                  fontSize: 9,
                  fontFamily: "monospace",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2 space-y-3 font-mono text-[9.5px]">
          <div className="bg-zinc-900 border border-white/10 p-3 rounded space-y-1">
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none block">
              ANÁLISIS DE INTERFERENCIAS (VÍAS NEURONALES)
            </span>
            <p className="text-neutral-300 leading-normal">
              {diagnostic}
            </p>
            {urgentAlert && (
              <div className="bg-rose-950/40 border border-rose-500/30 p-2.5 rounded-sm text-rose-400 text-[8.5px] font-black uppercase mt-2.5 leading-normal">
                {urgentAlert}
              </div>
            )}
          </div>
          <div className="space-y-1 bg-black/40 p-2.5 border border-white/5 rounded">
            <h4 className="font-extrabold text-[#39ff14] text-[8px] uppercase tracking-wider">
              EJERCICIOS CAPTURADOS EN EL MAPEO:
            </h4>
            {exercisesList.length === 0 ? (
              <div className="text-neutral-500 italic">Ningún ejercicio parseado hoy.</div>
            ) : (
              <ul className="list-disc list-inside space-y-0.5 text-neutral-400">
                {exercisesList.map((e, idx) => (
                  <li key={idx}>
                    <span className="text-white">{e.cleanName}</span> ({e.category})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
```

## File: src/components/analytics/FatigueAndIntensitySection.tsx
```tsx
import { useState } from "react";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, ComposedChart, Bar, Line } from "recharts";
import { TrendingUp, Zap, ShieldAlert } from "lucide-react";

interface FatigueAndIntensitySectionProps {
  currentWeek: string;
}

export default function FatigueAndIntensitySection({
  currentWeek,
}: FatigueAndIntensitySectionProps) {
  const [rpeTrendRange, setRpeTrendRange] = useState<number>(14);

  // --- RENDERING INTENSITY TRENDS (AreaChart) ---
  const getIntensityTrendData = () => {
    let rpeDataPoints = [];
    const now = Date.now();

    let totalRpeSum = 0;
    let rpeCount = 0;
    let relativeTotalLoad = 0;

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("nexus_logs_")) {
          const raw = localStorage.getItem(key);
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              const parts = key.split("_");
              const maybeTs = parseInt(parts[parts.length - 1]);
              const timestamp =
                maybeTs && maybeTs > 1000000
                  ? maybeTs
                  : now - Math.random() * (7 * 24 * 60 * 60 * 1000);

              const daysAgo = Math.floor(
                (now - timestamp) / (24 * 60 * 60 * 1000)
              );

              if (daysAgo <= rpeTrendRange) {
                let dayRpeSum = 0;
                let dayRpeCount = 0;

                if (Array.isArray(parsed)) {
                  parsed.forEach((log) => {
                    const r = parseFloat(log.rpe);
                    if (!isNaN(r)) {
                      dayRpeSum += r;
                      dayRpeCount++;
                      totalRpeSum += r;
                      rpeCount++;
                    }
                    relativeTotalLoad +=
                      (parseFloat(log.weight) || 0) *
                      (parseFloat(log.reps) || 0);
                  });
                }

                if (dayRpeCount > 0) {
                  rpeDataPoints.push({
                    dayOffset: daysAgo,
                    rpeAvg: dayRpeSum / dayRpeCount,
                  });
                }
              }
            } catch (e) {}
          }
        }
      }
    } catch (e) {
      console.error(e);
    }

    let fatigueTrendData = [];
    if (rpeDataPoints.length === 0) {
      fatigueTrendData = [
        {
          name: "Día -" + rpeTrendRange,
          rpeAvg: 6,
          fatigue: 60,
          label: "No Data",
        },
        { name: "Hoy", rpeAvg: 6, fatigue: 60, label: "No Data" },
      ];
    } else {
      rpeDataPoints.sort((a, b) => b.dayOffset - a.dayOffset);
      fatigueTrendData = rpeDataPoints.map((dp) => {
        const label = dp.dayOffset === 0 ? "Hoy" : `Hace ${dp.dayOffset} d`;
        return {
          name: label,
          rpeAvg: Number(dp.rpeAvg.toFixed(1)),
          fatigue: Math.round(dp.rpeAvg * 10),
        };
      });
    }

    const currentAvg =
      rpeCount > 0 ? parseFloat((totalRpeSum / rpeCount).toFixed(1)) : 6.2;
    const isOverL4Threshold = currentAvg > 8 || relativeTotalLoad > 10000;
    const trendLineColor = isOverL4Threshold ? "#f43f5e" : "#00f0ff";
    const isHighFatigue = isOverL4Threshold;

    return { fatigueTrendData, currentAvg, isOverL4Threshold, trendLineColor, isHighFatigue };
  };

  const { fatigueTrendData, currentAvg, isOverL4Threshold, trendLineColor, isHighFatigue } = getIntensityTrendData();

  // --- 8. CNS FATIGUE DATA LOGIC ---
  const getCnsFatigueData = () => {
    let recentRpes: number[] = [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("nexus_logs_")) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);

            const storedTimestampMatch = key.split("_");
            const maybeTs = parseInt(
              storedTimestampMatch[storedTimestampMatch.length - 1]
            );
            const timestamp = maybeTs && maybeTs > 1000000 ? maybeTs : now;

            if (now - timestamp <= 14 * dayMs) {
              if (Array.isArray(parsed)) {
                parsed.forEach((p) => {
                  const r = parseFloat(p.rpe);
                  if (!isNaN(r)) recentRpes.push(r);
                });
              }
            }
          } catch (e) {}
        }
      }
    }

    const cnsLoadAvg =
      recentRpes.length > 0
        ? recentRpes.reduce((a, b) => a + b, 0) / recentRpes.length
        : 6.2;

    const scalePercent = Math.min(100, Math.max(0, (cnsLoadAvg / 10) * 100));

    let stateLabel = "ESTADO ESTABLE G11";
    let stateColor = "text-[#39ff14]";
    let progressBg = "bg-[#39ff14]";
    let detailAdvice =
      "Tus vías neuromotoras están despejadas. Respeta las pausas y duerme +7.5 horas.";

    if (cnsLoadAvg > 8.5) {
      stateLabel = "ALTA INTERFERENCIA (SNC AL LÍMITE)";
      stateColor = "text-rose-500 font-black animate-pulse";
      progressBg = "bg-rose-600";
      detailAdvice =
        "Doble aviso biomecánico. Reduce un 15% el peso de tu cargada. En Week 4 haz descarga total.";
    } else if (cnsLoadAvg > 7.4) {
      stateLabel = "FATIGA COMPRENSIVA REGULADA";
      stateColor = "text-yellow-400 font-bold";
      progressBg = "bg-yellow-500";
      detailAdvice =
        "Carga acumulativa normal de media fase. Evita añadir accesorios extenuantes.";
    }

    return { cnsLoadAvg, scalePercent, stateLabel, stateColor, progressBg, detailAdvice };
  };

  const { cnsLoadAvg, scalePercent, stateLabel, stateColor, progressBg, detailAdvice } = getCnsFatigueData();

  // --- 9. RELATION DE CARGA DATA (ComposedChart Volume vs RPE) ---
  const getRelationCargaData = () => {
    const weeklyMetrics = {
      w1: { volume: 0, rpeSum: 0, rpeCount: 0 },
      w2: { volume: 0, rpeSum: 0, rpeCount: 0 },
      w3: { volume: 0, rpeSum: 0, rpeCount: 0 },
      w4: { volume: 0, rpeSum: 0, rpeCount: 0 },
    };

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("nexus_logs_")) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              const parts = key.split("_");
              const dayId = parts[2] || "";
              const wkKey = dayId.substring(0, 2);
              if (
                wkKey &&
                weeklyMetrics[wkKey as keyof typeof weeklyMetrics] !== undefined
              ) {
                parsed.forEach((log) => {
                  const wt = parseFloat(log.weight) || 0;
                  const rp = parseFloat(log.reps) || 0;
                  const rpeVal = parseFloat(log.rpe) || 0;

                  weeklyMetrics[wkKey as keyof typeof weeklyMetrics].volume +=
                    wt * rp;
                  if (rpeVal > 0) {
                    weeklyMetrics[wkKey as keyof typeof weeklyMetrics].rpeSum +=
                      rpeVal;
                    weeklyMetrics[
                      wkKey as keyof typeof weeklyMetrics
                    ].rpeCount++;
                  }
                });
              }
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
    }

    const compiledData = Object.keys(weeklyMetrics).map((wk) => {
      const entry = weeklyMetrics[wk as keyof typeof weeklyMetrics];
      return {
        week: wk.toUpperCase(),
        volume: Math.round(entry.volume),
        rpe:
          entry.rpeCount > 0 ? Number((entry.rpeSum / entry.rpeCount).toFixed(1)) : 0,
      };
    });

    return compiledData;
  };

  const relationCargaCompiledData = getRelationCargaData();

  return (
    <div className="space-y-6">
      {/* RPE & RECURRENT FATIGUE DISTRIBUTION AREA CHART */}
      <section className="p-5 border bg-pure-black/40 backdrop-blur-xs transition-all duration-300 rounded-sm border-white/10 shadow-sm mt-4 text-left">
        <header className="px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between bg-zinc-900 border border-white/10 rounded-xs mb-4 gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-[#00f0ff]" />
            <h3 className="text-sm font-brutalist italic text-white uppercase tracking-wider">
              DISTRIBUCIÓN RPE Y FATIGA RECURRENTE
            </h3>
          </div>

          <div className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-neutral-400 font-extrabold border bg-black border-white/10 p-1 rounded">
            {[7, 14, 30].map((days) => (
              <button
                key={`range-${days}`}
                onClick={() => setRpeTrendRange(days)}
                className={`px-2 py-1 rounded transition-all cursor-pointer ${
                  rpeTrendRange === days
                    ? "bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/50"
                    : "hover:bg-white/5 border border-transparent"
                }`}
              >
                {days} Días
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="space-y-3 lg:col-span-1">
            <div className="bg-zinc-950 p-3.5 border border-white/5 space-y-2 rounded">
              <span className="text-[10px] font-black tracking-widest text-[#00f0ff] uppercase font-mono block">
                🔴 AUDITORÍA DE SUPERCOMPENSACIÓN Y FATIGA
              </span>
              <div className="text-neutral-400 font-mono text-[10px] leading-relaxed space-y-2">
                <p>
                  El RPE promedio de la ventana seleccionada ({rpeTrendRange}{" "}
                  días) es{" "}
                  <span className="text-white font-bold font-mono">
                    {currentAvg}
                  </span>
                  . Basado en el patrón biomecánico:
                </p>
                {isHighFatigue ? (
                  <div className="bg-rose-500/10 border border-rose-500/20 p-2 text-rose-400 rounded-xs space-y-1">
                    <span className="font-extrabold block">
                      ⚠️ ALERTA: SOBREVOLUMEN / FATIGA CRÍTICA
                    </span>
                    <p className="text-[9px]">
                      Carga detectada en límite. Superaste el umbral RPE recomendado continuo.
                    </p>
                    <p className="text-[8.5px] text-rose-300 italic pt-0.5 border-t border-rose-500/10">
                      "Baja las cargas un 10-15%, cuida el psoas y prioriza el ROM."
                    </p>
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 text-emerald-400 rounded-xs space-y-1">
                    <span className="font-extrabold block">
                      ✓ ESTADO OPTIMIZADO SANO (SUPERCOMPENSACIÓN)
                    </span>
                    <p className="text-[9px]">
                      Carga bajo control. El estímulo biomecánico es seguro.
                    </p>
                  </div>
                )}
                <p className="border-t border-white/5 pt-2 text-[9px] italic font-mono">
                  Distribución temporal calculada sobre los últimos registros.
                </p>
              </div>
            </div>
          </div>

          <div
            className="lg:col-span-2 h-[200px] sm:h-[180px] bg-black/40 border border-white/5 rounded p-3 relative mt-4 lg:mt-0"
            id="intensityChartContainer"
          >
            <div className="absolute top-2.5 right-2.5 z-10 flex flex-col items-end gap-1 pointer-events-none">
              <span
                className={`px-2 py-0.5 rounded text-[8.5px] font-mono font-black border uppercase tracking-wider flex items-center gap-1 ${
                  isOverL4Threshold
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${isOverL4Threshold ? "bg-rose-500" : "bg-emerald-400"}`}
                />
                RPE Ponderado: {currentAvg}
              </span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={fatigueTrendData}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRpe" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={trendLineColor}
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor={trendLineColor}
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                  <linearGradient id="colorFatigue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis
                  dataKey="name"
                  stroke="#666"
                  fontSize={9}
                  tickLine={false}
                  axisLine={{ stroke: "#333" }}
                />
                <YAxis
                  stroke="#666"
                  fontSize={9}
                  domain={[0, 10]}
                  tickLine={false}
                  axisLine={{ stroke: "#333" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#09090b",
                    borderColor: "#333",
                    fontSize: 10,
                    fontFamily: "monospace",
                  }}
                  labelStyle={{ color: "#fff", fontWeight: "bold" }}
                />
                <Area
                  type="monotone"
                  dataKey="rpeAvg"
                  stroke={trendLineColor}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRpe)"
                  name="RPE Promedio"
                  animationDuration={1200}
                />
                <Area
                  type="monotone"
                  dataKey="fatigue"
                  stroke="#f43f5e"
                  strokeWidth={1}
                  fillOpacity={1}
                  fill="url(#colorFatigue)"
                  name="Nivel de Fatiga (%)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* CNS FATIGUE AUDITOR DASHBOARD */}
      <section className="bg-zinc-950 p-5 border border-white/5 relative overflow-hidden rounded text-left no-print col-span-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
          <div className="space-y-1">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Zap size={14} className="text-yellow-400" />
              SISTEMA DE AUDITORÍA CENTRAL DE FATIGA NEURAL (SNC)
            </h4>
            <p className="text-[9.5px] font-mono text-zinc-500 uppercase tracking-wider">
              Métricas e interferencia hormonal calculadas en base a registros recientes (14 días).
            </p>
          </div>
          <div className="bg-black/60 border border-white/5 py-1 px-3 self-start md:self-auto rounded">
            <span className={`text-[10px] font-mono font-black uppercase ${stateColor}`}>
              ● {stateLabel}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-2">
            <div className="text-[8px] font-mono text-zinc-500 tracking-wider font-extrabold">
              BARRA DE PRESIÓN NEURAL (SNC METRIC ID_099)
            </div>
            <div className="flex items-center gap-3">
              <span className="font-brutalist text-3xl font-black text-white tracking-widest">
                {cnsLoadAvg.toFixed(1)}
                <span className="text-xs text-neutral-500 font-mono"> /10</span>
              </span>
              <div className="flex-grow bg-neutral-900 h-3 rounded overflow-hidden p-0.5 border border-white/10">
                <div
                  className={`h-full ${progressBg} transition-all duration-500 rounded-sm`}
                  style={{ width: `${scalePercent}%` }}
                />
              </div>
            </div>
          </div>
          <div className="md:col-span-2 font-mono text-[9.5px] text-zinc-400 leading-relaxed border-l border-white/10 pl-0 md:pl-6 space-y-2">
            <p>
              <strong className="text-white uppercase font-black">PRESCRIPCIÓN CF-L4:</strong>{" "}
              {detailAdvice}
            </p>
            <p className="text-[8.5px] text-zinc-600">
              *Nota L4: El magnesio directo, las calleras de carbono con pliegue táctico y el mantenimiento del ROM completo ayudan a descargar tensión de los antebrazos, reduciendo la inhibición motora refleja.
            </p>
          </div>
        </div>
      </section>

      {/* RELATION CARGA-ESTRÉS */}
      <section className="p-5 border bg-zinc-950/80 border-white/5 rounded-sm flex flex-col text-left space-y-4 shadow-sm">
        <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2">
          <ShieldAlert size={14} className="text-rose-500" />
          RELACIÓN CARGA-ESTRÉS (VOLUMEN INTEGRADO vs RPE)
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
          <div className="lg:col-span-3 h-[220px] bg-black/40 border border-white/5 rounded p-3 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={relationCargaCompiledData} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="week" stroke="#555" fontSize={9} />
                <YAxis yAxisId="left" stroke="#888" fontSize={9} name="Volume" />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#f43f5e"
                  fontSize={9}
                  domain={[0, 10]}
                  name="RPE"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#09090b",
                    borderColor: "#333",
                    fontSize: 10,
                    fontFamily: "monospace",
                  }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="volume"
                  fill="#222"
                  stroke="#444"
                  name="Volume Kg"
                  maxBarSize={40}
                  radius={[2, 2, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="rpe"
                  stroke="#FF1493"
                  strokeWidth={2.5}
                  name="RPE Promedio"
                  dot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="lg:col-span-1 space-y-3 font-mono text-[9.5px]">
            <div className="bg-zinc-900 border border-white/5 p-3 rounded space-y-2">
              <span className="text-[10px] font-black tracking-widest text-[#00f0ff] uppercase block">
                ✦ INTERPRETACIÓN DE CURVAS
              </span>
              <p className="text-neutral-400 leading-normal">
                Si el volumen sube pero el RPE se mantiene estable dentro del rango recomendado (Fase 1: 6-7, Fase 2: 7-8), tu acondicionamiento motor progresa de forma idónea. Si el volumen decrece pero el RPE se dispara hacia 9 o 10, se confirma un cuadro de inflamación sistémica profunda. ¡Presta atención!
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
```

## File: src/components/analytics/RpeProgressionSection.tsx
```tsx
import { useState } from "react";
import { ShieldAlert, Zap } from "lucide-react";

interface RpeProgressionSectionProps {
  currentWeek: string;
}

export default function RpeProgressionSection({
  currentWeek,
}: RpeProgressionSectionProps) {
  // --- COMPARATIVE RPE TABLE (Current Week vs Last 30 Days) ---
  const getWeeklyVsMonthlyStats = () => {
    let weekRpes: number[] = [];
    let monthRpes: number[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("nexus_logs_")) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            const isCurrentWeek = key.includes(`_${currentWeek}d`);
            parsed.forEach((log: any) => {
              const rpe = parseFloat(log.rpe);
              if (!isNaN(rpe)) {
                monthRpes.push(rpe);
                if (isCurrentWeek) weekRpes.push(rpe);
              }
            });
          } catch {}
        }
      }
    }

    const currentWeekAvg =
      weekRpes.length > 0
        ? weekRpes.reduce((a, b) => a + b, 0) / weekRpes.length
        : 0;
    const monthAvg =
      monthRpes.length > 0
        ? monthRpes.reduce((a, b) => a + b, 0) / monthRpes.length
        : 0;

    let isDanger = false;
    let diffPercent = 0;
    if (monthAvg > 0) {
      diffPercent = ((currentWeekAvg - monthAvg) / monthAvg) * 100;
      isDanger = currentWeekAvg > 9 || diffPercent > 15;
    }

    return { currentWeekAvg, monthAvg, diffPercent, isDanger };
  };

  const { currentWeekAvg, monthAvg, diffPercent, isDanger } = getWeeklyVsMonthlyStats();

  const weeksProgression = [
    {
      week: "W1",
      title: "SEMANA 1",
      label: "ACUMULACIÓN",
      minTarget: 6,
      maxTarget: 7,
      glowColor: "bg-emerald-500 shadow-sm text-black font-extrabold",
      textColor: "text-emerald-400",
      borderColor: "border-emerald-500/35",
      physiological: "ADAPTACIÓN NEURAL BASE",
      desc: "Iniciación con volumen de control. Estimulación inicial de la vía ADP/ATP sin saturar los depósitos de glucógeno. El cuerpo absorbe la carga sin fatiga residual severa.",
    },
    {
      week: "W2",
      title: "SEMANA 2",
      label: "INTENSIFICACIÓN",
      minTarget: 7,
      maxTarget: 8,
      glowColor: "bg-yellow-500 shadow-sm text-black font-extrabold",
      textColor: "text-yellow-400",
      borderColor: "border-yellow-500/35",
      physiological: "RECLUTAMIENTO DE ALTO TORQUE",
      desc: "Aumento progresivo de la carga absoluta en los bloques principales de fuerza y accesorios, conservando la alta velocidad de la barra. Activación sin distrés metabólico.",
    },
    {
      week: "W3",
      title: "SEMANA 3",
      label: "PICO / BOSS FIGHT",
      minTarget: 8,
      maxTarget: 9,
      glowColor: "bg-rose-500 shadow-sm text-white font-extrabold",
      textColor: "text-rose-400",
      borderColor: "border-rose-500/35",
      physiological: "FALLO TÁCTICO & RECLUTAMIENTO IIB",
      desc: "Fuerza extrema y demanda cardíaca terminal. Reclutamiento de unidades motoras de alto umbral. El SNC trabaja al 100% para vencer complejos pesados.",
    },
    {
      week: "W4",
      title: "SEMANA 4",
      label: "DESCARGA (DELOAD)",
      minTarget: 5,
      maxTarget: 6,
      glowColor: "bg-cyan-500 shadow-sm text-black font-extrabold",
      textColor: "text-cyan-400",
      borderColor: "border-cyan-500/35",
      physiological: "SUPERCOMPENSACIÓN ACTIVA",
      desc: "Compulsiva bajada de intensidad para vaciar la fatiga acumulada en el sistema. Favorece la reconstitución de meniscos, desinflamación y la asimilación del volumen anterior.",
    },
  ];

  const cycleData = {
    fase1: [
      {
        code: "w1",
        name: "SEMANA 1",
        phase: "ACUMULACIÓN",
        target: "RPE 6 - 7",
        maxVal: 7,
        color: "text-rose-400",
        borderColor: "border-rose-500/20",
        bgGlow: "hover:border-rose-500/30",
        activeGlow: "shadow-sm border-rose-500",
        desc: "Reconocimiento neural. Carga base de volumen regular. Foco en ROM perfecto y control postural sin llegar al fallo muscular.",
        tip: "Evita acelerar las repeticiones. Control biomecánico absoluto.",
      },
      {
        code: "w2",
        name: "SEMANA 2",
        phase: "INTENSIFICACIÓN",
        target: "RPE 7 - 8",
        maxVal: 8,
        color: "text-yellow-400",
        borderColor: "border-yellow-500/20",
        bgGlow: "hover:border-yellow-500/30",
        activeGlow: "shadow-sm border-yellow-500",
        desc: "Incremento progresivo de carga manteniendo gran velocidad de barra. Activación de más unidades motoras.",
        tip: "Mide la fatiga acumulada del día anterior antes de cargar la barra.",
      },
      {
        code: "w3",
        name: "SEMANA 3",
        phase: "PICO DE ESFUERZO",
        target: "RPE 8 - 9",
        maxVal: 9,
        color: "text-[#00f0ff]",
        borderColor: "border-[#00f0ff]/20",
        bgGlow: "hover:border-[#00f0ff]/30",
        activeGlow: "shadow-sm border-[#00f0ff]",
        desc: "Máxima demanda cardíaca y neural. Reclutamiento de fibras IIB. Esfuerzo terminal controlado sin perder la postura.",
        tip: "Tu biomecánica debe estar al 100%. RPE 9 es real, cuida el psoas y las lumbares.",
      },
      {
        code: "w4",
        name: "SEMANA 4",
        phase: "DESCARGA (DELOAD)",
        target: "RPE 5 - 6",
        maxVal: 6,
        color: "text-[#a124ff]",
        borderColor: "border-[#a124ff]/20",
        bgGlow: "hover:border-[#a124ff]/30",
        activeGlow: "shadow-sm border-[#a124ff]",
        desc: "Respetar la regeneración activa de tejidos blandos y SNC. Bajada drástica de volumen para supercompensar el ciclo anterior.",
        tip: "La descarga no es negociable en Nexus. Permite rellenar depósitos de glucógeno para reiniciar.",
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* 1. CICLO RECOMENDADO CARD */}
      <section className="p-5 border bg-zinc-950/80 backdrop-blur-xs transition-all duration-300 rounded-sm border-white/5 shadow-sm text-left">
        <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <Zap size={14} className="text-[#39ff14]" />
          CICLO DE INTENSIDAD RECOMENDADO (RPE OBJETIVO)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {cycleData.fase1.map((wk) => {
            const isCurrent = currentWeek === wk.code;
            return (
              <div
                key={wk.code}
                className={`p-4 border transition-all duration-200 text-left bg-black/60 relative ${
                  isCurrent
                    ? `${wk.activeGlow} scale-102 bg-zinc-900/40 z-10`
                    : `${wk.borderColor} ${wk.bgGlow}`
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-2 left-3 bg-emerald-500 text-black text-[7.5px] font-mono leading-none px-1.5 py-0.5 rounded-xs tracking-widest font-black uppercase shadow">
                    SEMANA ACTUAL
                  </span>
                )}
                <div className="text-[10px] font-mono text-neutral-400">
                  {wk.name}
                </div>
                <div className="text-sm font-brutalist text-white tracking-wide uppercase mt-0.5">
                  {wk.phase}
                </div>
                <div className={`text-xl font-black font-brutalist mt-2 ${wk.color}`}>
                  {wk.target}
                </div>
                <p className="text-[9.5px] font-mono text-neutral-400 mt-2 leading-relaxed">
                  {wk.desc}
                </p>
                <div className="mt-3 pt-2.5 border-t border-white/5 text-[8.5px] font-mono text-neutral-500 leading-normal">
                  <span className="text-amber-500 font-bold">TIPS L4: </span>
                  {wk.tip}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. COMPARATIVA RPE PROM */}
      <section className="bg-zinc-950/80 border border-white/5 p-5 no-print text-left rounded-sm mx-0">
        <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-2">
          <ShieldAlert
            size={14}
            className={isDanger ? "text-rose-500" : "text-emerald-500"}
          />
          COMPARATIVA RPE PROM. (SEMANA vs ÚLTIMOS 30 DÍAS)
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono border border-white/10 rounded-sm bg-black p-3">
          <div>
            <p className="text-neutral-500 mb-1 tracking-wider uppercase">
              Promedio Mes
            </p>
            <p className="text-lg text-white font-bold">
              {monthAvg > 0 ? monthAvg.toFixed(1) : "N/A"}
            </p>
          </div>
          <div className="border-l border-r border-white/10">
            <p className="text-neutral-500 mb-1 tracking-wider uppercase">
              Promedio W{currentWeek.replace("w", "")}
            </p>
            <p className={isDanger ? "text-rose-400 text-lg font-black" : "text-emerald-400 text-lg font-black"}>
              {currentWeekAvg > 0 ? currentWeekAvg.toFixed(1) : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-neutral-500 mb-1 tracking-wider uppercase">
              Desviación %
            </p>
            <p className={`text-lg font-bold ${isDanger ? "text-rose-500" : "text-emerald-500"}`}>
              {monthAvg > 0 ? `${diffPercent > 0 ? "+" : ""}${diffPercent.toFixed(0)}%` : "N/A"}
            </p>
          </div>
        </div>
      </section>

      {/* 3. DETAILED PRO-LONGEVITY BOARD */}
      <section
        className="col-span-full border border-white/10 p-6 bg-pure-black/90 backdrop-blur-md rounded-sm no-print space-y-6 flex flex-col"
        id="rpe1-10ProgressionBoard"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-white/15 pb-4 gap-4">
          <div className="space-y-1">
            <h3 className="text-xl lg:text-2xl font-brutalist tracking-wider text-pure-white flex items-center gap-2 uppercase text-left">
              <Zap size={18} className="text-[#39ff14] fill-[#39ff14]/30" />
              PROGRESIÓN SEMANAL RPE 1-10: CONTROL SIN SOBREENTRENAMIENTO (CF-L4)
            </h3>
            <p className="font-mono text-[9px] uppercase tracking-widest text-emerald-400 text-left">
              // EVOLUCIÓN MANDATORIA DE LA CARGA NEUROMUSCULAR PARA EVITAR LESIONES Y ESTANCAMIENTOS
            </p>
          </div>
          <div className="bg-zinc-950/80 border border-white/10 px-3 py-1.5 rounded-sm shrink-0 flex items-center gap-2 self-start lg:self-auto">
            <span className="h-2 w-2 rounded-full bg-[#39ff14] shrink-0" />
            <span className="font-mono text-[8.5px] text-neutral-300 font-bold uppercase tracking-wider">
              PRESUPUESTO DE MANÁ NEURAL ACTIVO
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="col-span-1 lg:col-span-7 bg-zinc-950/70 border border-white/5 p-4 rounded-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 border-b border-white/5 gap-1.5">
                <span className="text-[10px] font-mono text-neutral-400 font-bold tracking-widest text-left">
                  TABLA DEL ESFUERZO PERCIBIDO (RPE) DE SEMANAS 1 - 4
                </span>
                <span className="text-[8px] font-mono text-neutral-500">
                  1: MÍNIMO | 10: ESFUERZO MÁXIMO
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2.5 text-center pt-2">
                {weeksProgression.map((weekData, wIdx) => (
                  <div key={wIdx} className="space-y-2">
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-brutalist text-white tracking-widest">
                        {weekData.title}
                      </div>
                      <div className={`text-[7.5px] font-mono font-black uppercase tracking-wider truncate block ${weekData.textColor}`}>
                        {weekData.label}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 h-[210px] bg-black/80 p-1.5 border border-white/5 rounded-xs justify-between">
                      {Array.from({ length: 10 }).map((_, bIdx) => {
                        const levelVal = 10 - bIdx;
                        const isTarget =
                          levelVal >= weekData.minTarget &&
                          levelVal <= weekData.maxTarget;

                        return (
                          <div
                            key={bIdx}
                            className={`h-[16px] flex items-center justify-between px-1.5 text-[8.5px] font-mono rounded-xs transition-all duration-300 ${
                              isTarget
                                ? `${weekData.glowColor} text-black font-extrabold border-l-2 border-r-2 border-white/30 scale-102`
                                : "bg-neutral-900/60 text-neutral-600 border border-white/5 opacity-30 hover:opacity-70"
                            }`}
                            title={`Nivel de Esfuerzo RPE ${levelVal} ${isTarget ? "(Rango objetivo para esta fase)" : ""}`}
                          >
                            <span>RPE {levelVal}</span>
                            {isTarget && (
                              <span className="h-1 w-1 rounded-full bg-black shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-white/5 px-1.5 py-0.5 border border-white/5 rounded-sm">
                      <div className={`text-[8px] font-mono font-bold leading-none ${weekData.textColor}`}>
                        RPE {weekData.minTarget} - {weekData.maxTarget}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex gap-2.5 items-start bg-emerald-950/10 p-2.5 border border-emerald-900/20 rounded-xs">
              <ShieldAlert size={14} className="text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[9px] font-mono text-neutral-300 text-left leading-relaxed">
                <strong className="text-emerald-400 uppercase font-black">
                  LA REGLA DE LA FATIGA CF-L4:
                </strong>{" "}
                El RPE indica el porcentaje de fuerza/estimulación neuromuscular. Intentar operar en RPE 9-10 desde la Semana 1 resulta en una destrucción temprana del SNC, provocando estancamiento neuromuscular e inflamación en la unión del tendón. Respeta este ciclo de autorregulación.
              </p>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-15 flex flex-col justify-between space-y-3">
            <div className="space-y-2 flex-grow overflow-y-auto max-h-[310px] pr-1">
              {weeksProgression.map((weekData, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 bg-zinc-950/60 border-l-4 ${weekData.borderColor} hover:bg-neutral-900/40 transition-colors flex flex-col gap-1 text-left rounded-r-xs`}
                >
                  <div className="flex justify-between items-center leading-none">
                    <span className="text-[11px] font-black font-brutalist tracking-wider text-pure-white leading-none">
                      {weekData.title}: {weekData.label}
                    </span>
                    <span className={`text-[8.5px] font-mono font-black ${weekData.textColor} tracking-widest`}>
                      OBJETIVO: RPE {weekData.minTarget}-{weekData.maxTarget}
                    </span>
                  </div>

                  <span className="text-[7.5px] font-mono text-neutral-500 uppercase font-black tracking-widest leading-none pt-0.5">
                    PARÁMETRO BIOMÉTRICO: {weekData.physiological}
                  </span>

                  <p className="text-[9.5px] text-neutral-400 leading-normal font-mono">
                    {weekData.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-[#0b0c10] border-2 border-dashed border-[#00f0ff]/30 p-3 space-y-1.5 text-left rounded-xs">
              <span className="text-[8px] font-black text-[#00f0ff] uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Zap size={10} className="text-[#00f0ff]" />
                REGLA DE VIDA DE ATLETA EN NEXUS L4
              </span>
              <p className="text-[9.5px] font-mono text-neutral-300 leading-relaxed italic">
                "El sobreentrenamiento no es el resultado de un solo día pesado de testing, sino de no entender la obligatoriedad de la descarga. La hipertrofia estructural y la remodelación del colágeno solo se activan cuando descargas el psoas lumbar en la Semana 4 para reiniciar el ciclo en el próximo macrociclo."
              </p>
              <div className="text-[7.5px] font-mono text-neutral-500 text-right uppercase">
                — Nexus Coach CF-L4 Master Edition
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
```

## File: src/components/analytics/VolumeProgressionSection.tsx
```tsx
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Area } from "recharts";
import { Zap, ShieldAlert, TrendingUp, FileText } from "lucide-react";
import { ACCENT_COLORS_MAP } from "../../lib/constants";

interface VolumeProgressionSectionProps {
  currentWeek: string;
  handleGenerateMonthlyReportPDF: () => void;
  getMonthlyVolumeStats: () => { totalLogsCount: number; totalVolume: number };
}

export default function VolumeProgressionSection({
  currentWeek,
  handleGenerateMonthlyReportPDF,
  getMonthlyVolumeStats,
}: VolumeProgressionSectionProps) {
  const plannedVolume = {
    w1: 4500,
    w2: 6800,
    w3: 8400,
    w4: 3800,
  };

  // Obtain real volume loaded per week
  const getWeeklyRealVolumes = () => {
    const realVolume = { w1: 0, w2: 0, w3: 0, w4: 0 };
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("nexus_logs_")) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              const parts = key.split("_");
              const dayId = parts[2] || "";
              const wkKey = dayId.substring(0, 2);
              if (
                wkKey &&
                realVolume[wkKey as keyof typeof realVolume] !== undefined
              ) {
                parsed.forEach((log) => {
                  const wt = parseFloat(log.weight) || 0;
                  const rp = parseFloat(log.reps) || 0;
                  realVolume[wkKey as keyof typeof realVolume] += wt * rp;
                });
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Error reading volume for total progression chart:", err);
    }
    return realVolume;
  };

  const realVolume = getWeeklyRealVolumes();

  const chartData = [
    {
      week: "w1",
      name: "SEMANA 1",
      phase: "ACUMULACIÓN",
      planned: plannedVolume.w1,
      real: realVolume.w1 > 0 ? Math.round(realVolume.w1) : 0,
      desc: "Fase Inicial: Adaptación Neural de Volumen regular.",
      color: "#00F0FF",
      rpeTarget: "RPE 6-7",
    },
    {
      week: "w2",
      name: "SEMANA 2",
      phase: "INTENSIFICACIÓN",
      planned: plannedVolume.w2,
      real: realVolume.w2 > 0 ? Math.round(realVolume.w2) : 0,
      desc: "Mayor Torque: Rampa hacia intensities de alta velocidad.",
      color: "#BD00FF",
      rpeTarget: "RPE 7-8",
    },
    {
      week: "w3",
      name: "SEMANA 3",
      phase: "PICO (BOSS FIGHT)",
      planned: plannedVolume.w3,
      real: realVolume.w3 > 0 ? Math.round(realVolume.w3) : 0,
      desc: "Esfuerzo Terminal: Pico de sobrecarga neuromuscular.",
      color: "#FF007F",
      rpeTarget: "RPE 8-9",
    },
    {
      week: "w4",
      name: "SEMANA 4",
      phase: "DESCARGA (DELOAD)",
      planned: plannedVolume.w4,
      real: realVolume.w4 > 0 ? Math.round(realVolume.w4) : 0,
      desc: "Supercompensación: Regeneración de tejidos blandos y SNC.",
      color: "#FF5A00",
      rpeTarget: "RPE 5-6",
    },
  ];

  const totalPlanned =
    plannedVolume.w1 + plannedVolume.w2 + plannedVolume.w3 + plannedVolume.w4;
  const totalReal =
    realVolume.w1 + realVolume.w2 + realVolume.w3 + realVolume.w4;

  const isW4Overdoing = realVolume.w4 > plannedVolume.w4 * 1.15;

  const currentPhaseLabel =
    currentWeek === "w1"
      ? "ACUMULACIÓN INICIAL"
      : currentWeek === "w2"
        ? "INTENSIFICACIÓN"
        : currentWeek === "w3"
          ? "PICO DE ESFUERZO / ÁPEX"
          : currentWeek === "w4"
            ? "DESCARGA (DELOAD)"
            : "RUTINA FUERA DE CICLO";

  const stats = getMonthlyVolumeStats();

  let activeColor = "#1F51FF";
  const savedColorId = localStorage.getItem("nexus_custom_accent_color");
  if (savedColorId && ACCENT_COLORS_MAP[savedColorId]) {
    activeColor = ACCENT_COLORS_MAP[savedColorId].color;
  }

  // Calculate accumulated histories for diagnostic info
  const getWeeklyL4AuditStats = () => {
    const realWVolumes = [0, 0, 0, 0];
    const realWRpeSum = [0, 0, 0, 0];
    const realWRpeCount = [0, 0, 0, 0];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("nexus_logs_")) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              parsed.forEach((log: any) => {
                const wt =
                  parseFloat(
                    log.weight
                      ? log.weight.toString().replace(/[^0-9.]/g, "")
                      : "0"
                  ) || 0;
                const rp =
                  parseFloat(
                    log.reps
                      ? log.reps.toString().replace(/[^0-9.]/g, "")
                      : "0"
                  ) || 0;
                const rpe = parseFloat(log.rpe) || 0;

                const parts = key.split("_");
                const dayId = parts[2] || "";
                const wkKey = dayId.substring(0, 2);

                let idx = -1;
                if (wkKey === "w1") idx = 0;
                else if (wkKey === "w2") idx = 1;
                else if (wkKey === "w3") idx = 2;
                else if (wkKey === "w4") idx = 3;

                if (idx !== -1) {
                  realWVolumes[idx] += wt * rp;
                  if (rpe > 0) {
                    realWRpeSum[idx] += rpe;
                    realWRpeCount[idx]++;
                  }
                }
              });
            }
          }
        }
      }
    } catch {}

    const w1RpeAvg = realWRpeCount[0] > 0 ? realWRpeSum[0] / realWRpeCount[0] : 0;
    const w2RpeAvg = realWRpeCount[1] > 0 ? realWRpeSum[1] / realWRpeCount[1] : 0;
    const w3RpeAvg = realWRpeCount[2] > 0 ? realWRpeSum[2] / realWRpeCount[2] : 0;
    const w4RpeAvg = realWRpeCount[3] > 0 ? realWRpeSum[3] / realWRpeCount[3] : 0;

    let totalVolumeStr = (
      realWVolumes[0] +
      realWVolumes[1] +
      realWVolumes[2] +
      realWVolumes[3]
    ).toLocaleString("es-ES") + " kg";

    let stateFeedback = "PERFIL BIOMECÁNICO BALANCEADO SANO";
    let messageBody =
      "Tus datos volumétricos reflejan un incremento paulatino en la carga de trabajo. Te encuentras en un estado de supercompensación óptima.";

    if (w3RpeAvg > 8.5 && realWVolumes[2] > 11000) {
      stateFeedback = "ALERTA: VOLUMEN CRÍTICO REDUNDANTE";
      messageBody =
        "Tu tonelaje acumulado en la Semana 3 supera los límites biomecánicos recomendados por encima del 15% de desvío. Tus lumbares corren riesgo severo de torques nocivos.";
    }

    return { realWVolumes, w1RpeAvg, w2RpeAvg, w3RpeAvg, w4RpeAvg, totalVolumeStr, messageBody };
  };

  const { realWVolumes, w1RpeAvg, w2RpeAvg, w3RpeAvg, w4RpeAvg, totalVolumeStr, messageBody } = getWeeklyL4AuditStats();

  return (
    <div className="space-y-6">
      {/* REAL WEEKLY VOLUME VS PLANNED */}
      <section
        className="p-5 border bg-pure-black/40 backdrop-blur-xs transition-all duration-300 rounded-sm border-white/10 shadow-sm mt-6 text-left"
        id="totalVolumeChartSection"
      >
        <header className="px-4 py-2.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-zinc-900 border border-white/10 rounded-xs mb-4 gap-2">
          <div className="flex items-center gap-2">
            <Zap size={15} className="text-[#00f0ff]" />
            <div>
              <h3 className="text-sm font-brutalist italic text-white uppercase tracking-wider leading-none">
                PROGRESO DEL VOLUMEN ACUMULADO SEMANAL
              </h3>
              <p className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest mt-1">
                // MONITOREO DEL TONELAJE (KG * REPS) • INTENSIFICACIÓN VS. DELOAD (CF-L4)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#00f0ff] font-extrabold border bg-[#00f0ff]/5 border-[#00f0ff]/10 px-2 py-0.5 rounded">
              FASE ACTUAL: {currentPhaseLabel}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
          <div className="lg:col-span-1 flex flex-col space-y-4">
            <div className="bg-zinc-950 p-4 border border-white/5 space-y-3 rounded text-left">
              <span className="text-[10px] font-mono tracking-widest text-neutral-400 font-bold uppercase block pb-1 border-b border-white/5">
                ✦ TONELAJE ADQUIRIDO
              </span>
              <div className="space-y-2">
                <div>
                  <div className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest leading-none">
                    PLANI_VOLUME_TOTAL
                  </div>
                  <div className="text-xl font-black font-brutalist text-white tracking-widest">
                    {totalPlanned.toLocaleString()}{" "}
                    <span className="text-[10px] text-neutral-500 font-mono">
                      kg
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest leading-none">
                    REAL_VOLUME_TOTAL
                  </div>
                  <div className="text-xl font-black font-brutalist text-electric-blue tracking-widest">
                    {totalReal > 0 ? totalReal.toLocaleString() : "0"}{" "}
                    <span className="text-[10px] text-neutral-500 font-mono">
                      kg
                    </span>
                  </div>
                </div>
              </div>
              <div className="h-[2px] bg-white/5 w-full my-1" />
              <p className="text-[9px] font-mono text-neutral-400 leading-normal">
                El tonelaje total es el indicador biomecánico clave. Las semanas 1, 2 y 3 escalan el estímulo (<span className="text-white">Intensificación</span>) para maximizar la tensión muscular, mientras la Semana 4 limpia receptores con una vaciada profunda (<span className="text-white">Deload</span>) de volumen.
              </p>
            </div>

            <div className="bg-zinc-950 p-4 border border-white/5 rounded text-left">
              <span className="text-[10px] font-mono tracking-widest text-yellow-400 font-bold uppercase block pb-1 border-b border-white/5">
                🩺 DIAGNÓSTICO CLÍNICO L4
              </span>
              <div className="text-[10px] font-mono text-neutral-400 leading-relaxed pt-2.5 space-y-2">
                {currentWeek === "w4" ? (
                  isW4Overdoing ? (
                    <div className="space-y-1.5 p-2 bg-rose-950/20 border border-rose-500/30 text-rose-400 rounded-sm">
                      <strong className="text-[10px] block uppercase font-black tracking-wider">
                        ⚠️ ALERTA: SOBREVOLUMEN EN DESCARGA
                      </strong>
                      <p className="text-[9px] leading-tight text-rose-300">
                        Tu tonelaje de descarga real supera el límite seguro de {plannedVolume.w4} kg. Estás saboteando tu regeneración neuro-articular con volumen basura.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1 p-2 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 rounded-sm">
                      <strong className="text-[10px] block">✓ DESCARGA PERFECTA</strong>
                      <p className="text-[9px]">
                        Preservando tu maná neural perfectamente. Tu regeneración tisular progresa a nivel óptimo.
                      </p>
                    </div>
                  )
                ) : (
                  <p>
                    Operando en fase de carga activa. Supervisa la fatiga articular. Tu porcentaje del volumen planeado completado es del{" "}
                    <span className="text-white font-bold">
                      {totalPlanned > 0 ? ((totalReal / totalPlanned) * 100).toFixed(0) : 0}%
                    </span>
                    .
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 h-[280px] bg-black/40 border border-white/5 rounded p-4 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 15, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis
                  dataKey="name"
                  stroke="#666"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: "#333" }}
                />
                <YAxis
                  stroke="#666"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: "#333" }}
                  name="Volumen"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#09090b",
                    borderColor: "#333",
                    fontSize: 10,
                    fontFamily: "monospace",
                  }}
                  labelStyle={{ color: "#fff", fontWeight: "bold" }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 9, fontFamily: "monospace" }}
                  verticalAlign="top"
                  height={36}
                />
                <Bar
                  dataKey="planned"
                  fill="#333"
                  name="Planificado (Target)"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={50}
                  animationDuration={1000}
                />
                <Area
                  type="monotone"
                  dataKey="real"
                  fillOpacity={0.2}
                  fill="#00f0ff"
                  stroke="#00f0ff"
                  strokeWidth={2}
                  name="Tonelaje Real Realizado"
                  animationDuration={1500}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* HISTORIAL NEXUS AUDITOR CARD */}
      <section className="bg-zinc-950 p-5 border border-white/5 rounded-sm text-left font-mono text-[9px] relative mt-6 no-print">
        <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/10 pb-3 mb-3">
          <ShieldAlert size={14} className="text-yellow-500" />
          NEXUS PANEL AUDITOR L4 • HISTORIAL DE CARGA ACUMULADA EN CURSO
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center mt-2 pb-3 border-b border-white/5">
          <div className="bg-black border border-white/5 p-2 rounded">
            <p className="text-neutral-500 uppercase tracking-widest">Semana 1 Acumulación</p>
            <p className="text-white text-[13px] font-black mt-1">
              {realWVolumes[0].toLocaleString("es-ES")} kg
            </p>
            <p className="text-[8px] text-zinc-500 pt-1">
              RPE Promedio: {w1RpeAvg > 0 ? w1RpeAvg.toFixed(1) : "N/A"}
            </p>
          </div>
          <div className="bg-black border border-white/5 p-2 rounded">
            <p className="text-neutral-500 uppercase tracking-widest">Semana 2 Intensificación</p>
            <p className="text-white text-[13px] font-black mt-1">
              {realWVolumes[1].toLocaleString("es-ES")} kg
            </p>
            <p className="text-[8px] text-zinc-500 pt-1">
              RPE Promedio: {w2RpeAvg > 0 ? w2RpeAvg.toFixed(1) : "N/A"}
            </p>
          </div>
          <div className="bg-black border border-white/5 p-2 rounded">
            <p className="text-white font-bold uppercase tracking-widest text-[#00f0ff]">
              Semana 3 Apex Pico
            </p>
            <p className="text-white text-[13px] font-black mt-1 text-[#00f0ff]">
              {realWVolumes[2].toLocaleString("es-ES")} kg
            </p>
            <p className="text-[8px] text-zinc-500 pt-1">
              RPE Promedio: {w3RpeAvg > 0 ? w3RpeAvg.toFixed(1) : "N/A"}
            </p>
          </div>
          <div className="bg-black border border-white/5 p-2 rounded">
            <p className="text-neutral-500 uppercase tracking-widest">Semana 4 Descarga</p>
            <p className="text-white text-[13px] font-black mt-1">
              {realWVolumes[3].toLocaleString("es-ES")} kg
            </p>
            <p className="text-[8px] text-zinc-500 pt-1">
              RPE Promedio: {w4RpeAvg > 0 ? w4RpeAvg.toFixed(1) : "N/A"}
            </p>
          </div>
        </div>

        <div className="pt-3 flex flex-col md:flex-row items-stretch justify-between gap-4 font-mono text-[9px]">
          <div className="space-y-1">
            <div className="text-zinc-500 font-bold uppercase tracking-wider">
              RESPUESTA SISTÉMICA DE ATLETA (NEXUS ANALYTIC ID_11a):
            </div>
            <p className="text-neutral-300 leading-normal max-w-2xl">
              {messageBody}
            </p>
          </div>
          <div className="bg-black/50 border border-white/5 p-3 rounded shrink-0 self-center md:self-auto text-right">
            <div className="text-zinc-500 uppercase">Tonelaje Consolidado:</div>
            <div className="text-base text-white font-black font-brutalist tracking-wider">
              {totalVolumeStr}
            </div>
          </div>
        </div>
      </section>

      {/* PDF REPORT EXPORT TRIGGER */}
      <section className="p-5 border bg-zinc-950/60 backdrop-blur-xs transition-all duration-300 rounded-sm border-white/10 shadow-sm mt-6 mb-12 text-left">
        <header className="px-4 py-2 flex items-center justify-between bg-zinc-900 border border-white/10 rounded-xs mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} style={{ color: activeColor }} />
            <h3 className="text-sm font-brutalist italic text-white uppercase tracking-wider">
              INFORMES CONSOLIDADOS DEL MES DE ENTRENAMIENTO
            </h3>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#00f0ff] font-extrabold border border-cyan-500/30 bg-cyan-950/30 px-2 py-0.5 rounded">
            Reporte PDF Mensual Clínico
          </span>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2 space-y-1.5 font-mono text-[10px] text-neutral-400">
            <p className="text-white font-bold uppercase tracking-wider">
              Análisis de Sobrecarga, Volumen (Kg) y Picos de Fatiga (RPE)
            </p>
            <p className="leading-relaxed text-left font-mono">
              Genera un reporte clínico formal en formato PDF de todo el mes de entrenamiento. Compila de manera automática el acumulado de volumen (tonelaje real cargado), la relación del volumen por microciclo y la tendencia del RPE semanal comparada contra la base basal establecida del mes anterior.
            </p>
            <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1 text-white text-[9.5px]">
              <span>
                Series Registradas:{" "}
                <strong className="text-[#00f0ff]">
                  {stats.totalLogsCount} series
                </strong>
              </span>
              <span>•</span>
              <span>
                Tonelaje Total:{" "}
                <strong style={{ color: activeColor }}>
                  {stats.totalVolume.toLocaleString("de-DE")} kg
                </strong>
              </span>
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <button
              onClick={handleGenerateMonthlyReportPDF}
              className="flex items-center gap-2 px-5 py-3 border font-mono text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 transition-all cursor-pointer shadow-md rounded-xs shrink-0"
              style={{ minHeight: "44px" }}
            >
              <FileText size={15} />
              EXPORTAR AUDITORÍA PDF
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
```

## File: src/components/icons/BlockIcons.tsx
```tsx
import React from "react";

// SVG icons matching the requested brutalist visual whiteboard layout
export const svgIcons = {
  warmup: (
    <span className="material-symbols-outlined text-pure-black text-3xl font-bold select-none leading-none">
      whatshot
    </span>
  ),
  strength: (
    <span className="material-symbols-outlined text-pure-black text-3xl font-bold select-none leading-none">
      fitness_center
    </span>
  ),
  metcon: (
    <span className="material-symbols-outlined text-pure-black text-3xl font-bold select-none leading-none">
      directions_run
    </span>
  ),
  accessories: (
    <span className="material-symbols-outlined text-pure-black text-3xl font-bold select-none leading-none">
      extension
    </span>
  ),
};
```

## File: src/components/timer/TimerSetupForm.tsx
```tsx
import React from "react";
import { Zap } from "lucide-react";

interface TimerSetupFormProps {
  isFull: boolean;
  tempWork: number;
  tempRest: number;
  tempRounds: number;
  setTempWork: React.Dispatch<React.SetStateAction<number>>;
  setTempRest: React.Dispatch<React.SetStateAction<number>>;
  setTempRounds: React.Dispatch<React.SetStateAction<number>>;
  formatTime: (seconds: number) => string;
  onStartSeries: () => void;
  onOnlyRest: () => void;
  onCancel: () => void;
}

export default function TimerSetupForm({
  isFull,
  tempWork,
  tempRest,
  tempRounds,
  setTempWork,
  setTempRest,
  setTempRounds,
  formatTime,
  onStartSeries,
  onOnlyRest,
  onCancel,
}: TimerSetupFormProps) {
  return (
    <div
      className={`w-full flex flex-col bg-zinc-950/95 border-2 border-emerald-500/40 rounded-xl p-4 sm:p-6 transition-all shadow-2xl text-left ${
        isFull ? "max-w-xl mx-auto border-emerald-500/55" : ""
      }`}
    >
      <div className="flex items-center gap-2 border-b border-white/15 pb-3.5 mb-5 font-mono">
        <Zap
          size={18}
          className="text-emerald-400 animate-pulse shrink-0 fill-current"
        />
        <div>
          <h3 className="text-xs sm:text-sm font-black tracking-widest text-emerald-400 uppercase">
            ASISTENTE DE SERIES AUTOMÁTICAS L4
          </h3>
          <p className="text-[10px] text-neutral-400 leading-tight mt-1 uppercase mb-0 font-medium">
            El protocolo actual no predefinió series. Configura tu ciclo de (Trabajo + Descanso)
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Work Time Selector */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center select-none">
            <span className="text-[9px] font-mono font-black text-neutral-300 uppercase tracking-widest">
              1. TIEMPO DE TRABAJO (EJECUCIÓN)
            </span>
            <span className="text-xs font-mono font-black text-rose-400">
              {formatTime(tempWork)} ({tempWork}s)
            </span>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setTempWork((p) => Math.max(5, p - 5))}
              className="px-2 py-1.5 bg-neutral-900 border border-white/10 text-[10px] sm:text-xs font-mono rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
            >
              -5s
            </button>
            <button
              type="button"
              onClick={() => setTempWork((p) => Math.max(10, p - 30))}
              className="px-2 py-1.5 bg-neutral-900 border border-white/10 text-[10px] sm:text-xs font-mono rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
            >
              -30s
            </button>
            <input
              type="number"
              value={tempWork}
              onChange={(e) =>
                setTempWork(Math.max(1, parseInt(e.target.value, 10) || 1))
              }
              className="flex-grow min-w-0 px-2.5 py-1 bg-black border border-white/20 text-white font-mono text-xs rounded text-center font-bold"
            />
            <button
              type="button"
              onClick={() => setTempWork((p) => p + 5)}
              className="px-2 py-1.5 bg-neutral-900 border border-white/10 text-[10px] sm:text-xs font-mono rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
            >
              +5s
            </button>
            <button
              type="button"
              onClick={() => setTempWork((p) => p + 30)}
              className="px-2 py-1.5 bg-neutral-900 border border-white/10 text-[10px] sm:text-xs font-mono rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
            >
              +30s
            </button>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {[20, 30, 40, 45, 60, 90, 120].map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setTempWork(s)}
                className={`text-[9px] px-2 py-1 rounded font-mono font-bold border transition-all cursor-pointer ${
                  tempWork === s
                    ? "bg-rose-500/20 text-rose-400 border-rose-500/50"
                    : "bg-neutral-900 border-white/5 text-neutral-400 hover:text-white"
                }`}
              >
                {s}s
              </button>
            ))}
          </div>
        </div>

        {/* Rest Time Selector */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center select-none">
            <span className="text-[9px] font-mono font-black text-neutral-300 uppercase tracking-widest">
              2. TIEMPO DE DESCANSO (RECUPERACIÓN)
            </span>
            <span className="text-xs font-mono font-black text-emerald-400">
              {formatTime(tempRest)} ({tempRest}s)
            </span>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setTempRest((p) => Math.max(0, p - 5))}
              className="px-2 py-1.5 bg-neutral-900 border border-white/10 text-[10px] sm:text-xs font-mono rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
            >
              -5s
            </button>
            <button
              type="button"
              onClick={() => setTempRest((p) => Math.max(0, p - 30))}
              className="px-2 py-1.5 bg-neutral-900 border border-white/10 text-[10px] sm:text-xs font-mono rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
            >
              -30s
            </button>
            <input
              type="number"
              value={tempRest}
              onChange={(e) =>
                setTempRest(Math.max(0, parseInt(e.target.value, 10) || 0))
              }
              className="flex-grow min-w-0 px-2.5 py-1 bg-black border border-white/20 text-emerald-400 font-mono text-xs rounded text-center font-bold"
            />
            <button
              type="button"
              onClick={() => setTempRest((p) => p + 5)}
              className="px-2 py-1.5 bg-neutral-900 border border-white/10 text-[10px] sm:text-xs font-mono rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
            >
              +5s
            </button>
            <button
              type="button"
              onClick={() => setTempRest((p) => p + 30)}
              className="px-2 py-1.5 bg-neutral-900 border border-white/10 text-[10px] sm:text-xs font-mono rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
            >
              +30s
            </button>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {[30, 45, 60, 90, 120, 150, 180].map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setTempRest(s)}
                className={`text-[9px] px-2 py-1 rounded font-mono font-bold border transition-all cursor-pointer ${
                  tempRest === s
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                    : "bg-neutral-900 border-white/5 text-neutral-400 hover:text-white"
                }`}
              >
                {s}s REPOSO
              </button>
            ))}
          </div>
        </div>

        {/* Rounds */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center select-none">
            <span className="text-[9px] font-mono font-black text-neutral-300 uppercase tracking-widest">
              3. CANTIDAD DE SERIES (REPETICIONES)
            </span>
            <span className="text-xs font-mono font-black text-[#00F0FF]">
              {tempRounds} {tempRounds === 1 ? "Serie" : "Series"}
            </span>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setTempRounds((p) => Math.max(1, p - 1))}
              className="flex-grow py-1.5 bg-neutral-900 border border-white/10 text-[10px] sm:text-xs font-mono rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
            >
              -1 Serie
            </button>
            <input
              type="number"
              value={tempRounds}
              onChange={(e) =>
                setTempRounds(Math.max(1, parseInt(e.target.value, 10) || 1))
              }
              className="w-20 px-2.5 py-1 bg-black border border-white/20 text-[#00F0FF] font-mono text-xs rounded text-center font-bold"
            />
            <button
              type="button"
              onClick={() => setTempRounds((p) => p + 1)}
              className="flex-grow py-1.5 bg-neutral-900 border border-white/10 text-[10px] sm:text-xs font-mono rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
            >
              +1 Serie
            </button>
          </div>
        </div>
      </div>

      {/* Action button options */}
      <div className="mt-6 flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={onStartSeries}
          className="flex-grow py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all rounded-md flex items-center justify-center gap-1.5 shadow-lg cursor-pointer hover:scale-102"
        >
          <Zap size={14} className="fill-current animate-bounce" />
          <span>
            INICIAR SERIES ({tempRounds} x {formatTime(tempWork)} / R:{" "}
            {formatTime(tempRest)})
          </span>
        </button>

        <button
          type="button"
          onClick={onOnlyRest}
          className="px-3 py-3 bg-zinc-900 border border-white/5 text-neutral-300 hover:text-white uppercase tracking-wider text-[10px] font-mono duration-150 rounded cursor-pointer"
        >
          SÓLO DESCANSO COMPLETO
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-3 bg-zinc-800/80 text-neutral-300 hover:text-white uppercase tracking-wider text-[10px] font-mono duration-150 rounded cursor-pointer"
        >
          CANCELAR
        </button>
      </div>
    </div>
  );
}
```

## File: src/data/workouts.ts
```typescript
import { Database } from '../types/workout';

export const WORKOUT_DATABASE: Database = {
    w1: {
        days: [
            {
                id: "w1d1", name: "LUNES", title: "La Guarida del Mal", isCompleted: true, hasTabs: true,
                variations: [
                    {
                        tabName: "MODO SOLO (RX)",
                        warmup: { title: "01. WARM-UP INDIVIDUAL L4", scheme: "3 Rondas", items: ["10 Air Squats (Temp 3011, pausa en paralelo) <span class='cue'>🎯 Foco: Rodillas activas.</span>", "5 Walkouts lentos con push-up estricto", "10 Crunches abdominales cortos (cero compresión psoas)", "12 Glute Bridges dinámicos con contracción isométrica de 2s"] },
                        strength: { title: "02. FUERZA", scheme: "4x6 @ 65-70%", items: ["Back Squat <span class='cue'>Romper el paralelo y controlar la fase excéntrica.</span>"] },
                        metcon: { title: "03. METCON", scheme: "3 Min ON / 1 Min OFF x 4 Rondas", items: ["60 Double Unders <span class='cue'>Adaptados a: 60 Crossovers ó 120 Simples</span>", "15 Wall Balls (9kg)", "Max Burpees en tiempo restante <span class='cue'>Registro: Promedio de 10 reps de burpees por ronda.</span>"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "3 Series", items: ["10/10 Goblet Bulgarian Split Squats (1 KB/DB 18kg)", "15 V-Ups Lastrados (5kg) <span class='cue'>Registro: Destrucción de fibras profundas lograda.</span>"] }
                    },
                    {
                        tabName: "SIN BURPEES",
                        warmup: { title: "01. WARM-UP INDIVIDUAL L4", scheme: "3 Rondas", items: ["10 Air Squats (Temp 3011, pausa en paralelo) <span class='cue'>🎯 Foco: Rodillas activas.</span>", "5 Walkouts lentos con push-up estricto", "10 Crunches abdominales cortos (cero compresión psoas)", "12 Glute Bridges dinámicos con contracción de 2s"] },
                        strength: { title: "02. FUERZA", scheme: "4x6 @ 65-70%", items: ["Back Squat"] },
                        metcon: { title: "03. METCON (BURPEE-FREE)", scheme: "3 Min ON / 1 Min OFF x 4 Rondas", items: ["60 Double Unders", "15 Wall Balls (9kg)", "Max Russian KB Swings (24/16 kg) en tiempo restante <span class='cue'>🎯 Reemplazo L4: El swing ruso mantiene las pulsaciones al límite sin impacto en muñecas.</span>"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "3 Series", items: ["10/10 Goblet Bulgarian Split Squats (1 KB/DB 18kg)", "15 V-Ups Lastrados (5kg)"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4", scheme: "3 Rondas", items: ["10 Air Squats Sincronizados (Tempo controlado)", "8 Spiderman Lunges con rotación torácica (4/lado)", "10 Crunches cortos sincronizados (cero compresión psoas)", "12 Glute Bridges dinámicos Sincro"] },
                        strength: { title: "02. FUERZA COMPARTIDA", scheme: "4 Series alternadas", items: ["Back Squat (Barra única máx 60kg)", "Ajuste rápido de discos entre series para optimizar espacio"] },
                        metcon: { title: "03. METCON EN PAREJA (NO BURPEES)", scheme: "3 Min ON / 1 Min OFF x 4 Rondas", items: ["60 Double Unders (Sincro)", "15 Wall Balls (9kg) - Alternando", "Max Russian KB Swings (24kg) en tiempo restante (I Go / You Go)"] },
                        accessories: { title: "04. ACCESORIOS GRUPALES", scheme: "3 Series", items: ["12/12 Bulgarian DB Split Squats", "15 V-Ups Sincronizados"] }
                    }
                ]
            },
            {
                id: "w1d2", name: "MARTES", title: "Espectros del Abismo", isCompleted: true, hasTabs: true,
                variations: [
                    {
                        tabName: "MODO SOLO (RX)",
                        warmup: { title: "01. MOVILIDAD BIOMECÁNICA L4", scheme: "10 Minutos | 2 Rondas", items: ["8-10 Pasadas de Foam Roller en gemelos y cuádriceps por pierna", "10 Spiderman Lunges con pausa (5/lado)", "12 Air Squats (ROM completo) <span class='cue'>🎯 Clinica L4: Lubricar articulación fémororrotuliana.</span>", "10 Crunches cortos (activar transverso del abdomen sin activar psoas)"] },
                        strength: { title: "02. ESTABILIZACIÓN", scheme: "Enfoque Core", items: ["Activación de glúteos e isquios <span class='cue'>Lubricar el chasis sin peso axial.</span>"] },
                        metcon: { title: "03. FLUSH (ZONA 2)", scheme: "35 Minutos Continuos", items: ["Rotación de máquinas (Ski, Remo, Bike)", "Saltos de soga simples a ritmo aeróbico suave <span class='cue'>Registro: Ski 65W, Remo 60W, Bike 45W.</span>"] },
                        accessories: { title: "04. ACCESORIOS (CORE & CARRY)", scheme: "3 Rondas", items: ["Plancha Alta + Plancha Baja + Plancha Lateral (30s x lado)", "Farmer Carry pesado (50kg total)"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. MOVILIDAD CO-OP L4", scheme: "10 Minutos | 2 Rondas Sincro", items: ["Pasadas asistidas de Foam Roller en tren inferior", "10 Air Squats sincronizados con pausa abajo", "8 Cossack Lunges (4/lado)", "10 Crunches cortos sincro"] },
                        strength: { title: "02. ESTABILIZACIÓN", scheme: "3 Rondas", items: ["30s Hollow Hold (Sincro)", "10/10 Toques de hombro en Plancha de Oso (Bear Taps)"] },
                        metcon: { title: "03. METCON AERÓBICO (ZONA 2)", scheme: "35 Minutos Alternados", items: ["300 saltos de soga simples (alternando cada 50 reps en relevos rápidos)", "20 KB Sumo Deadlift High Pulls ligeras (16/12 kg) para mantener pulsaciones constantes"] },
                        accessories: { title: "04. CO-OP CORE & CARRY", scheme: "3 Rondas", items: ["Plancha Alta asimétrica (Compartiendo espacio en colchoneta)", "Farmer Carry con Kettlebells pesadas (24/16 kg) x 40 metros"] }
                    }
                ]
            },
            {
                id: "w1d3", name: "MIÉRCOLES", title: "Brujo de las Sombras", isCompleted: true, hasTabs: true,
                variations: [
                    {
                        tabName: "MODO SOLO (RX)",
                        warmup: { title: "01. WARM-UP L4 HOMBRO & CORE", scheme: "3 Rondas", items: ["15 Arm Circles concéntricos lentos", "10 Spiderman Push-ups con control excéntrico", "15 Band Pull-aparts para deltoides posterior", "10 Crunches abdominales cortos (faja activa)", "10 Air Squats libres con pausa de 2s abajo <span class='cue'>🎯 Clinica L4: Preparación articular y core clínico prescrito.</span>"] },
                        strength: { title: "02. FUERZA", scheme: "4x6 @ 65-70% | Rest 90s", items: ["Strict Press <span class='cue'>Glúteos y core anclados. Evitar hiperextensión lumbar.</span>"] },
                        metcon: { title: "03. METCON", scheme: "21-15-9 | Cap 8:00", items: ["Calorías (Ski/Remo)", "KB Push Press Doble (18 kg) <span class='cue'>🎯 RÉCORD HISTÓRICO L4: 7:30. Fraccionamiento táctico: 10-6-5 / 8-7 / 9 Unbroken.</span>"] },
                        accessories: { title: "04. FORJA DE CHARSI", scheme: "3 Series", items: ["10 Strict Pull-ups (Banda)", "10 Chin-ups (Banda)", "15 Bicep Curls con barra vacía <span class='cue'>Registro de Guerra: Dominadas completadas bajo fatiga (8+2 / 8+2 / 6+2+2).</span>"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4 DE HOMBRO", scheme: "3 Rondas", items: ["15 Arm Circles sincronizados", "10 Spiderman Push-ups alternando", "15 Band Pull-aparts para tren superior", "10 Crunches cortos sincro + 10 Air Squats con pausa rodillas afuera"] },
                        strength: { title: "02. FUERZA COMPARTIDA", scheme: "4 Series (Por turnos)", items: ["Strict Press (Compartiendo la misma barra de 60kg)", "Descanso de 90s estricto en el relevo"] },
                        metcon: { title: "03. METCON SINCRO (BURPEE-FREE)", scheme: "21-15-9", items: ["150 saltos simples (en lugar de calorías máquina)", "KB Push Press Doble con Kettlebells de 16/18kg", "Sincronización en la extensión de brazos"] },
                        accessories: { title: "04. FORJA CO-OP", scheme: "3 Series", items: ["10/10 Chin-ups estrictos compartiendo el rack de dominadas", "15 Bicep Curls con mancuernas (Alternado)"] }
                    }
                ]
            },
            {
                id: "w1d4", name: "JUEVES", title: "Gólem de Hierro", isCompleted: true, hasTabs: true,
                variations: [
                    {
                        tabName: "MODO SOLO (RX)",
                        warmup: { title: "01. WARM-UP L4 TÉCNICO", scheme: "3 Rondas", items: ["10 Goblet Squats con tempo 3011 controlando rodillas", "8/8 KB Single Arm Press liviano", "10 Crunches cortos (core rígido)", "10 Air Squats estritos con pause de 2s abajo <span class='cue'>🎯 Clinica L4: Activación articular íntegra e inhibición del psoas.</span>"] },
                        strength: { title: "02. FUERZA TÉCNICA", scheme: "4x3 @ 60%", items: ["1 Power Snatch + 1 Hang Power Snatch + 1 OHS <span class='cue'>Velocidad de pies y extensión de cadera con 30-35kg.</span>"] },
                        metcon: { title: "03. METCON", scheme: "AMRAP 12 MIN", items: ["15 Box Step-overs", "10 Power Snatches (35 kg)", "30 Crossovers <span class='cue'>Registro L4: Snatches fraccionados 5+5 limpios. Step-overs como descanso activo.</span>"] },
                        accessories: { title: "04. ACCESORIOS", scheme: "3 Series", items: ["15 Vuegos Laterales (Livianos)", "30s Handstand Hold <span class='cue'>Sostén isométrico estricto para hombros.</span>"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4 TÉCNICO", scheme: "3 Rondas", items: ["10 Goblet Squats con DB (Alternados o sincro)", "8/8 KB Single Arm Press", "10 Crunches cortos sincro", "10 Air Squats estritos con faja abdominal rígida"] },
                        strength: { title: "02. FUERZA TÉCNICA", scheme: "4x3 @ 60%", items: ["Dual Dumbbell Hang Power Snatch", "Evitamos la barra olímpica única para optimizar espacio del box"] },
                        metcon: { title: "03. METCON EN PAREJA", scheme: "AMRAP 12 MIN (I Go / You Go)", items: ["15 Box Step-overs (Compartiendo un cajón)", "10 Dual DB Hang Snatches (22.5/15 kg)", "30 Saltos de soga cruzados (Crossovers)"] },
                        accessories: { title: "04. ACCESORIOS CO-OP", scheme: "3 Series", items: ["15 Vuelos Laterales ligeros con DB", "30s Handstand Hold (Uno asiste mientras el otro sostiene)"] }
                    }
                ]
            },
            {
                id: "w1d5", name: "VIERNES", title: "Gargantúa", isCompleted: true, hasTabs: true,
                variations: [
                    {
                        tabName: "OPCIÓN A (BARRA)",
                        warmup: { title: "01. WARM-UP L4 BISAGRA", scheme: "3 Rondas", items: ["12 Good Mornings PVC de forma lenta", "5 Walkouts lentos con respiración controlada", "12 Glute Bridges dinámicos con contracción de 2s", "10 Crunches abdominales cortos (anti-psoas) + 10 Air Squats <span class='cue'>🎯 Clinica L4: Activación de isquios y faja para Deadlifts pesados sin comprimir lumbares.</span>"] },
                        strength: { title: "02. FUERZA", scheme: "4x6 @ 60% | Tempo 3111", items: ["Deadlift Tradicional (Peso Muerto) <span class='cue'>Construyendo los pilares. Abdomen como una roca.</span>"] },
                        metcon: { title: "03. METCON", scheme: "EMOM 15 MIN", items: ["Min 1: 8 Deadlifts (30-40% RM)", "Min 2: 6 Hang Power Cleans (30-40% RM)", "Min 3: 4 Push Jerks (30-40% RM) <span class='cue'>Regular las pfisologías. No llegar al fallo en barra.</span>"] },
                        accessories: { title: "04. ACCESORIOS", scheme: "3 Series", items: ["10 Barbell Hip Thrusts Pesados", "12 Remos con barra inclinados"] }
                    },
                    {
                        tabName: "OPCIÓN B (MANCUERNAS)",
                        warmup: { title: "01. WARM-UP L4 BISAGRA & CORE", scheme: "3 Rondas", items: ["12 KB Deadlifts livianos con bisagra estricta", "8 Spiderman Push-ups controlando rotación lumbar", "12 Glute Bridges", "10 Crunches abdominales cortos + 10 Air Squats controlados"] },
                        strength: { title: "02. FUERZA", scheme: "4x8 | Tempo 3021", items: ["DB Romanian Deadlift (RDL)"] },
                        metcon: { title: "03. METCON", scheme: "AMRAP 12 MIN", items: ["15 KB Swings", "10 DB Hang Cleans", "15 Cal Máquina"] },
                        accessories: { title: "04. ACCESORIOS", scheme: "3 Series", items: ["12 KB Glute Bridges", "10 Remos a una mano con KB"] }
                    },
                    {
                        tabName: "OPCIÓN C (FLUSH)",
                        warmup: { title: "01. MOVILIDAD REGENERATIVA L4", scheme: "15 Minutos", items: ["Pasajes suaves de Foam Roller en isquios y cadera", "Elongación dinámica de psoas sin compresión", "12 Air Squats súper lentos", "12 Glute Bridges libres"] },
                        strength: { title: "02. ACTIVACIÓN", scheme: "Isometric Focus", items: ["30s Plancha Alta", "15 Glute Bridges libres"] },
                        metcon: { title: "03. FLUSH AERÓBICO", scheme: "30 Minutos Zona 2", items: ["Remo o Bike continuo", "Cada 5 min: 30s de Plancha Isométrica"] },
                        accessories: { title: "04. ESTABILIZACIÓN", scheme: "Ligero", items: ["Estiramientos pasivos profundos", "Descompresión lumbar"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4 BISAGRA", scheme: "3 Rondas", items: ["10 Good Mornings con banda elástica", "6 Walkouts lentos + 12 Glute Bridges sincro", "10 Crunches cortos sincronizados + 12 Air Squats con pausa"] },
                        strength: { title: "02. FUERZA COMPARTIDA", scheme: "4x8 | Tempo 3021", items: ["Heavy DB Romanian Deadlift (RDL)", "Compartiendo las DBs más pesadas de Haedo"] },
                        metcon: { title: "03. METCON CO-OP (NO MACHINES)", scheme: "AMRAP 12 MIN (I Go / You Go)", items: ["15 American KB Swings (24/16 kg)", "10 Dual DB Hang Cleans", "15 Saltos de cajón (Box Jumps) - Reemplazo de máquina"] },
                        accessories: { title: "04. ACCESORIOS", scheme: "3 Series", items: ["12 KB Glute Bridges (Sincro)", "10 Remos inclinados con Kettlebell"] }
                    }
                ]
            },
            {
                id: "w1d6", name: "SÁBADO", title: "Hordas del Infierno", isCompleted: true, hasTabs: true,
                variations: [
                    {
                        tabName: "MODO SOLO (RX)",
                        warmup: { title: "01. WARM-UP", scheme: "2 Rondas", items: ["15 Scap Pull-ups", "15 Supermans <span class='cue'>Activar erectores espinales de forma higiénica y segura.</span>", "6 Cossack Lunges (3 por lado) y 6 Spiderman Lunges (3 por lado)", "2 Rondas Extras: 10 Crunches cortos (cero compresión psoas) + 10 Air Squats <span class='cue'>🎯 Activación L4: Foco para rodillas y activar flexores de cadera.</span>"] },
                        strength: { title: "02. ESTRATEGIA L4", scheme: "Pacing RPE 6", items: ["Administración inteligente de la energía", "Evitar picos máximos de ácido láctico por medicamentos"] },
                        metcon: { title: "03. METCON CHIPPER", scheme: "Por Tiempo (Cap: 25 Min)", items: ["1000m Remo (o Ski/2000m Bike)", "50 KB Swings (24/16 kg)", "40 Wall Balls (9/6 kg)", "30 Pull-ups (o Ring Rows)", "20 Devil Press (con push-up flexión de pecho)", "250 Double Unders (o 500 Simples)"] },
                        accessories: { title: "04. COOLDOWN", scheme: "10 Minutos", items: ["Foam Roller en gemelos y cuádriceps", "Elongación pasiva de cadena posterior"] }
                    },
                    {
                        tabName: "SAN JUSTO (EQUIPO DE 2)",
                        warmup: { title: "01. WARM-UP CO-OP", scheme: "2 Rondas", items: ["15 Scap Pull-ups", "15 Supermans", "6 Cossack Lunges (3 por lado) y 6 Spiderman Lunges (3 por lado)", "2 Rondas Extras: 10 Crunches abdominales cortos + 10 Air Squats <span class='cue'>🎯 Activación L4: Calentamiento de rodillas y flexores de cadera.</span>"] },
                        strength: { title: "02. ESTRATEGIA EN EQUIPO", scheme: "Pacing RPE 6", items: ["Dinámica de relevo ágil", "Reabastecimiento mutuo"] },
                        metcon: { title: "03. METCON CHIPPER (TEAMS OF 2)", scheme: "Por Tiempo (Cap: 25 Min) | Dividir reps", items: ["1500m Remo (o Ski/3000m Bike) - Dividido", "80 KB Swings (24/16 kg) - Dividido", "60 Wall Balls (9/6 kg) - Dividido", "50 Pull-ups - Dividido", "30 Devil Press (con push-up estricto)", "300 Double Unders - Dividido <span class='cue'>🎯 Dinámica L4: Relevos rápidos para no decaer en la potencia de ejecución.</span>"] },
                        accessories: { title: "04. COOLDOWN", scheme: "10 Minutos", items: ["Pasaje de Foam Roller e hidratación profunda"] }
                    },
                    {
                        tabName: "SAN JUSTO (EQUIPO DE 3)",
                        warmup: { title: "01. WARM-UP CO-OP", scheme: "2 Rondas", items: ["15 Scap Pull-ups", "15 Supermans", "6 Cossack Lunges (3 por lado) y 6 Spiderman Lunges (3 por lado)", "2 Rondas Extras: 10 Crunches abdominales cortos + 10 Air Squats <span class='cue'>🎯 Activación L4: Foco de movilidad de rodillas y cadera.</span>"] },
                        strength: { title: "02. ESTRATEGIA EN EQUIPO", scheme: "Relevos de 3", items: ["Flujo constante de transiciones", "Mantenimiento de RPE controlado"] },
                        metcon: { title: "03. METCON CHIPPER (TEAMS OF 3)", scheme: "Por Tiempo (Cap: 25 Min) | Dividir entre 3", items: ["2000m Remo (o Ski/4000m Bike) - Dividido", "100 KB Swings (24/16 kg) - Dividido", "80 Wall Balls (9/6 kg) - Dividido", "60 Pull-ups - Dividido", "45 Devil Press (con push-up estricto)", "400 Double Unders - Dividido <span class='cue'>🎯 Dinámica L4: Mientras un atleta corre el reloj, el segundo aguarda expectante y el tercero descansa.</span>"] },
                        accessories: { title: "04. COOLDOWN", scheme: "10 Minutos", items: ["Masaje compresivo general para evitar lumbares tensas"] }
                    },
                    {
                        tabName: "SAN JUSTO (EQUIPO DE 4)",
                        warmup: { title: "01. WARM-UP CO-OP", scheme: "2 Rondas", items: ["15 Scap Pull-ups", "15 Supermans", "6 Cossack Lunges (3 por lado) y 6 Spiderman Lunges (3 por lado)", "2 Rondas Extras: 10 Crunches abdominales cortos + 10 Air Squats <span class='cue'>🎯 Activación L4: Foco articular.</span>"] },
                        strength: { title: "02. ESTRATEGIA EN EQUIPO", scheme: "Duplas en Paralelo", items: ["Cooperación cruzada", "Control del ácido láctico acumulado"] },
                        metcon: { title: "03. METCON CHIPPER (TEAMS OF 4)", scheme: "Por Tiempo (Cap: 25 Min) | Duplas activas", items: ["2500m Remo (o Ski/5000m Bike) - Duplicado", "120 KB Swings (24/16 kg) - Sincronizado", "100 Wall Balls (9/6 kg) - Sincronizado o de a pares", "85 Pull-ups - De a pares", "60 Devil Press (con push-up estricto)", "500 Double Unders - De a pares <span class='cue'>🎯 Dinámica L4: Dos atletas activos ejecutando en paralelo acumulando repeticiones.</span>"] },
                        accessories: { title: "04. COOLDOWN", scheme: "10 Minutos", items: ["Elongación muscular general asistida"] }
                    },
                    {
                        tabName: "SIN BURPEES",
                        warmup: { title: "01. WARM-UP", scheme: "2 Rondas", items: ["15 Scap Pull-ups", "15 Supermans", "6 Cossack Lunges (3 por lado) y 6 Spiderman Lunges (3 por lado)", "2 Rondas Extras: 10 Crunches cortos (cero compresión psoas) + 10 Air Squats <span class='cue'>🎯 Activación L4: Foco para rodillas y activar flexores de cadera.</span>"] },
                        strength: { title: "02. ESTRATEGIA L4", scheme: "Pacing RPE 6", items: ["Evitar compresión vertical extrema", "Sostener potencia constante"] },
                        metcon: { title: "03. CHIPPER (BURPEE-FREE)", scheme: "Por Tiempo (Cap: 25 Min)", items: ["1000m Remo / Ski", "50 KB Swings", "40 Wall Balls", "30 Pull-ups", "30 KB Ground-to-Overhead (24/16 kg) <span class='cue'>🎯 Reemplazo L4: El Ground-to-Overhead unilateral pesado con KB reemplaza la cargada y el empuje sin tirarse al piso.</span>", "250 Double Unders (o 500 Simples)"] },
                        accessories: { title: "04. COOLDOWN", scheme: "10 Minutos", items: ["Foam Roller completo e hidratación"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4 SÁBADO", scheme: "2 Rondas", items: ["15 Scap Pull-ups Sincro", "15 Supermans (espalda neutra)", "10 Spiderman Lunges (5/lado)", "2 Rondas Extras: 10 Crunches cortos + 10 Air Squats <span class='cue'>🎯 Activación L4: Preparación conjunta para rodillas y de la zona lumbar.</span>"] },
                        strength: { title: "02. ESTRATEGIA EN EQUIPO", scheme: "Format I Go / You Go", items: ["Evitamos saturar el box con múltiples máquinas", "Compartimos la soga cómodamente"] },
                        metcon: { title: "03. CHIPPER EN PAREJAS (NO BURPEES)", scheme: "Por Tiempo (Cap: 25 Min) | Dividir reps como convenga", items: ["500 Saltos Simples (o 250 Double Unders) - Reemplazo de máquina", "60 KB Swings (24kg) - Reparto libre", "50 Wall Balls (9kg) - Sincronizados", "40 Pull-ups o Ring Rows", "30 KB Ground-to-Overhead (24kg) - I Go / You Go", "60 KB Sumo Deadlift High Pulls (24kg) - Reemplazo de remo final"] },
                        accessories: { title: "04. COOLDOWN CO-OP", scheme: "10 Minutos", items: ["Masaje miofascial rodante asistido con Foam Roller"] }
                    }
                ]
            },
            {
                id: "w1d7", name: "DOMINGO", title: "Descanso Activo", isCompleted: true, hasTabs: true,
                variations: [
                    {
                        tabName: "DESCANSO CLÍNICO",
                        warmup: { title: "RECARGA", scheme: "Cero Estrés", items: ["Show de Standup con Flor (Lucas Upstein)", "Purga de estrés mental y neural"] },
                        strength: { title: "MANÁ", scheme: "Recuperación", items: ["Cero impacto articular", "Descanso absoluto para asimilar antibióticos"] },
                        metcon: { title: "NUTRICIÓN", scheme: "Banquete", items: ["Alimentación densa", "Consumo masivo de micronutrientes e hidratación"] },
                        accessories: { title: "SNC RESET", scheme: "Listo para el Hierro", items: ["Preparación mental"] }
                    },
                    {
                        tabName: "DESCANSO HAEDO",
                        warmup: { title: "RECARGA CO-OP", scheme: "Cero Cargas", items: ["Conversación de estrategia de entrenamiento con Lucas", "Estiramiento pasivo en colchoneta en Haedo"] },
                        strength: { title: "PREP", scheme: "Recuperación", items: ["Día regenerativo total"] },
                        metcon: { title: "MANÁ", scheme: "Cero impacto", items: ["Hidratación profunda para limpiar residuos del catarro"] },
                        accessories: { title: "ESTABILIZACIÓN", scheme: "Rest", items: ["Descanso total"] }
                    }
                ]
            }
        ]
    },
    w2: {
        days: [
            {
                id: "w2d1", name: "LUNES", title: "La Guarida del Mal V2", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "MODO SOLO (RX)",
                        warmup: { title: "01. WARM-UP INDIVIDUAL L4", scheme: "3 Rondas", items: ["10 Air Squats (Temp 3011, pausa en paralelo) <span class='cue'>🎯 Foco: Rodillas activas.</span>", "5 Walkouts lentos con push-up estricto", "10 Crunches abdominales cortos (cero compresión psoas)", "12 Glute Bridges dinámicos con contracción isométrica de 2s"] },
                        strength: { title: "02. FUERZA", scheme: "4x4 @ 75-80%", items: ["Back Squat <span class='cue'>La intensidad sube. Evitar el rebote descontrolado abajo.</span>"] },
                        metcon: { title: "03. METCON", scheme: "4 Min ON / 1 Min OFF x 4 Rondas", items: ["400m Remo/Ski o 800m Bike", "15 Wall Balls (9/6 kg)", "Max Burpees en tiempo restante"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "3 Series", items: ["8/8 Bulgarian Split Squats (Pesadas)", "15 V-Ups Lastrados"] }
                    },
                    {
                        tabName: "SIN BURPEES",
                        warmup: { title: "01. WARM-UP INDIVIDUAL L4", scheme: "3 Rondas", items: ["10 Air Squats (Temp 3011, pausa en paralelo) <span class='cue'>🎯 Foco: Rodillas activas.</span>", "5 Walkouts lentos con push-up estricto", "10 Crunches abdominales cortos (cero compresión psoas)", "12 Glute Bridges dinámicos con contracción de 2s"] },
                        strength: { title: "02. FUERZA", scheme: "4x4 @ 75-80%", items: ["Back Squat"] },
                        metcon: { title: "03. METCON (BURPEE-FREE)", scheme: "4 Min ON / 1 Min OFF x 4 Rondas", items: ["400m Remo/Ski o 800m Bike", "15 Wall Balls", "Max American KB Swings (24/16 kg) en tiempo restante <span class='cue'>🎯 Reemplazo L4: Swing americano pesado para mantener la fatiga de hombros y cadera alta.</span>"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "3 Series", items: ["8/8 Bulgarian Split Squats (Pesadas)", "15 V-Ups Lastrados"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4 V2", scheme: "3 Rondas", items: ["10 Air Squats Sincronizados (Tempo controlado)", "8 Spiderman Lunges con rotación torácica (4/lado)", "10 Crunches cortos sincronizados (cero compresión psoas)", "12 Glute Bridges dinámicos Sincro"] },
                        strength: { title: "02. FUERZA COMPARTIDA", scheme: "4 Series (Por turnos)", items: ["4x4 @ 75-80%", "4x6-8 (Amigos) <span class='cue'>Usa el descanso del relevo para recuperar el SNC. Ajustar cargas rápido.</span>"] },
                        metcon: { title: "03. METCON EN PAREJAS (NO MACHINES)", scheme: "AMRAP 18 MIN (I Go / You Go)", items: ["60 Wall Balls (9/6 kg) - Reparto libre", "300 Saltos Dobles (o 600 Simples) - Reemplazo de Remo/Ski", "80 KB Swings (24/16 kg) - Reparto libre", "80 KB Sumo Deadlift High Pulls - Reparto libre <span class='cue'>🎯 Regla de Oro: Más volumen y cero burpees. Transiciones explosivas en parejas sin máquinas de cardio.</span>"] },
                        accessories: { title: "04. ACCESORIOS GRUPALES", scheme: "3 Series", items: ["12/12 Bulgarian Split Squats (Mancuerna liviana)", "20 V-Ups Libres (Sincro)"] }
                    }
                ]
            },
            {
                id: "w2d2", name: "MARTES", title: "Espectros V2", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "MODO SOLO (RX)",
                        warmup: { title: "01. MOVILIDAD BIOMECÁNICA L4", scheme: "10 Minutos | 2 Rondas", items: ["8-10 Pasadas de Foam Roller en toda la musculatura profunda", "10 Spiderman Lunges con pausa (5/lado)", "12 Air Squats controlados (con énfasis fémororrotuliano) <span class='cue'>🎯 Clinica L4: Lubricar rótulas y flexores de cadera.</span>", "10 Crunches cortos (activar transverso del abdomen sin activar psoas)"] },
                        strength: { title: "02. ACTIVACIÓN ISOMÉTRICA", scheme: "Estabilidad Core", items: ["30s Hollow Hold", "10/10 Puentes de Glúteo Marchando (Marching Bridges)"] },
                        metcon: { title: "03. FLUSH (ZONA 2)", scheme: "40 Minutos Continuos", items: ["Rotación de máquinas (Ski, Remo, Bike)", "Mantener ritmo de conversación continuo para oxigenar tissues"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "3 Rondas", items: ["Plancha Alta + Baja + Lateral (30s x lado)", "Farmer Carry (50-60kg) x 50m"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. MOVILIDAD CO-OP L4 V2", scheme: "10 Minutos | 2 Rondas Sincro", items: ["Pasajes de Foam Roller en tren inferior de forma coordinada", "10 Air Squats sincronizados con pausa abajo", "8 Cossack Lunges (4/lado)", "10 Crunches cortos sincro para aislar el psoas"] },
                        strength: { title: "02. CORE CO-OP", scheme: "3 Rondas", items: ["30s Hollow Hold sincronizado", "10/10 Toques de Hombros en Oso (Bear Taps) con banda"] },
                        metcon: { title: "03. FLUSH EN PAREJA (ZONA 2 - NO MACHINES)", scheme: "40 Minutos Continuos", items: ["Saltos de soga continuos (Double Unders o Simples, alternando cada 2 min)", "KB Farmer Carries activos y caminatas controladas para oxigenar de forma eficiente"] },
                        accessories: { title: "04. CO-OP FARMER CARRY", scheme: "3 Rondas", items: ["Farmer Carry con Kettlebells cruzado (24kg + 16kg) x 40m", "Plancha lateral sincronizada 30s por lado"] }
                    }
                ]
            },
            {
                id: "w2d3", name: "MIÉRCOLES", title: "Brujo V2", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "MODO SOLO (RX)",
                        warmup: { title: "01. WARM-UP L4 HOMBRO & CORE V2", scheme: "3 Rondas", items: ["15 Arm Circles concéntricos lentos", "10 Spiderman Push-ups con control excéntrico", "15 Band Pull-aparts para deltoides posterior", "10 Crunches abdominales cortos (faja activa)", "10 Air Squats libres con pausa de 2s abajo <span class='cue'>🎯 Clínica L4: Preparación articular y core clínico.</span>"] },
                        strength: { title: "02. FUERZA", scheme: "4x4 @ 75-80% | Rest 90s", items: ["Strict Press <span class='cue'>Cargas mayores, cero impulso de piernas. Glúteos de acero.</span>"] },
                        metcon: { title: "03. METCON", scheme: "21-15-9 | Cap 8:00", items: ["Calorías (Ski/Remo/Battle Ropes)", "KB Push Press Doble (Pesado)"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "3 Series", items: ["8 Strict Pull-ups (Banda) + 8 Chin-ups (Banda)", "15 Hammer Curls con mancuernas"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4 DE HOMBRO V2", scheme: "3 Rondas", items: ["15 Arm Circles sincronizados", "10 Spiderman Push-ups alternando", "15 Band Pull-aparts para tren superior", "10 Crunches cortos sincro + 10 Air Squats con pausa rodillas afuera"] },
                        strength: { title: "02. FUERZA COMPARTIDA", scheme: "4 Series alternadas", items: ["Strict Press pesado (barra única máx 60kg)", "Pacing explosivo con relevo rápido"] },
                        metcon: { title: "03. METCON CO-OP", scheme: "21-15-9", items: ["100 saltos simples por ronda (en lugar de máquina)", "KB Push Press Doble (24/16 kg) en formato I Go / You Go"] },
                        accessories: { title: "04. ACCESORIOS CO-OP", scheme: "3 Series", items: ["8 Chin-ups compartiendo barra de tracción", "15 Hammer Curls con mancuernas pesadas"] }
                    }
                ]
            },
            {
                id: "w2d4", name: "JUEVES", title: "Gólem V2", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "MODO SOLO (RX)",
                        warmup: { title: "01. WARM-UP L4 TÉCNICO V2", scheme: "3 Rondas", items: ["10 Goblet Squats con tempo 3011 controlando rodillas", "8/8 KB Single Arm Press liviano", "10 Crunches cortos (core rígido)", "10 Air Squats estritos con pause de 2s abajo <span class='cue'>🎯 Clinica L4: Activación articular íntegra e inhibición del psoas.</span>"] },
                        strength: { title: "02. FUERZA TÉCNICA", scheme: "5x2 @ 70%", items: ["Hang Squat Snatch <span class='cue'>Recepción profunda, consolidar velocidad de codos.</span>"] },
                        metcon: { title: "03. METCON", scheme: "AMRAP 14 MIN", items: ["15 Box Step-overs", "10 Power Snatches (40 kg)", "30 Crossovers"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "3 Series", items: ["15 Vuelos Laterales", "40s Handstand Hold"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4 TÉCNICO V2", scheme: "3 Rondas", items: ["10 Goblet Squats con DB (Alternados o sincro)", "8/8 KB Single Arm Press", "10 Crunches cortos sincro", "10 Air Squats estritos con faja abdominal rígida"] },
                        strength: { title: "02. FUERZA TÉCNICA", scheme: "5x2 @ 70%", items: ["Dual DB Hang Squat Snatch", "Uso de mancuernas para mitigar el límite de barra olímpica única"] },
                        metcon: { title: "03. METCON CO-OP", scheme: "AMRAP 14 MIN (I Go / You Go)", items: ["15 Box Step-overs con mancuerna", "10 Power Snatches con mancuerna alternada (22.5kg)", "30 Crossovers de soga"] },
                        accessories: { title: "04. ACCESORIOS CO-OP", scheme: "3 Series", items: ["15 Vuelos Laterales pesados", "40s Handstand Hold asistido"] }
                    }
                ]
            },
            {
                id: "w2d5", name: "VIERNES", title: "Gargantúa V2", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "SAN JUSTO (RX)",
                        warmup: { title: "01. WARM-UP L4 BISAGRA V2", scheme: "3 Rondas", items: ["12 Good Mornings PVC de forma lenta", "5 Walkouts lentos con respiración controlada", "12 Glute Bridges dinámicos con contracción de 2s", "10 Crunches abdominales cortos (anti-psoas) + 10 Air Squats <span class='cue'>🎯 Clinica L4: Activación de isquios y faja para Deadlifts pesados sin comprimir lumbares.</span>"] },
                        strength: { title: "02. FUERZA (SJ)", scheme: "4x4 @ 75-80%", items: ["Heavy Deadlift <span class='cue'>Densidad neural pura. Mantener la espina neutra.</span>"] },
                        metcon: { title: "03. METCON", scheme: "5 Rondas", items: ["9 Deadlifts (40-45% RM)", "6 Hang Power Cleans (40-45% RM)", "3 Push Jerks (40-45% RM)"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "3 Series", items: ["10 Barbell Hip Thrusts (60-65% RM)", "12 Remos con barra inclinados (30-35% RM)"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4 BISAGRA V2", scheme: "3 Rondas Sincro", items: ["10 Good Mornings con banda elástica", "6 Walkouts lentos + 12 Glute Bridges sincro", "10 Crunches cortos sincronizados + 12 Air Squats con pausa"] },
                        strength: { title: "02. FUERZA (EN EQUIPO)", scheme: "4 Series alternadas", items: ["Heavy KB/DB Bulgarian Split Squats", "4x8 por pierna <span class='cue'>🎯 Estrategia con Luk: Uno realiza sus 8 reps de manera controlada (Tempo 3111) mientras el otro asiste, cuida el plano de rodilla y luego intercambian. Optimiza el espacio y el uso de las KBs pesadas del box.</span>"] },
                        metcon: { title: "03. METCON CO-OP (NO BURPEES)", scheme: "AMRAP 16 MIN (I Go / You Go - Rondas completas)", items: ["10 Barbell Clean & Jerks (Max 60/40 kg en barra olímpica única)", "15 Russian KB Swings (24/16 kg)", "12 DB Goblet Squats (22.5/15 kg) <span class='cue'>🎯 Regla de Oro: Se alternan rondas completas. Uno trabaja (metiendo potencia máxima) mientras el otro asiste en la barra, controla el cronómetro... Cero burpees, cero acumulación de fatiga inútil.</span>"] },
                        accessories: { title: "04. ACCESORIOS INTEGRADOS", scheme: "3 Series", items: ["12 Glute Bridges a una pierna (Peso corporal)", "10 Remos inclinados con Kettlebell (24/16 kg)"] }
                    },
                    {
                        tabName: "MODO MURPH",
                        warmup: { title: "01. PREPARACIÓN COMPLETA HERO WOD L4", scheme: "Lubricación - 3 Rondas", items: ["15 Arm Circles (Hombros) lentos", "12 Scap Pull-ups + 10 Crunches cortos (inhibir psoas)", "12 Air Squats con pausa <span class='cue'>🎯 Activación L4: Preparación de rodillas.</span>", "5 Walkouts para activar faja protectora de columna"] },
                        strength: { title: "ESTRATEGIA", scheme: "Sin Chaleco", items: ["Formato particionado 'Cindy'", "Evitar fallo neural temprano"] },
                        metcon: { title: "02. HERO WOD: 'MURPH'", scheme: "Cap 55:00", items: ["1 Milla de Correr (1600m)", "20 Rondas de: 5 Pull-ups + 10 Push-ups + 15 Air Squats", "1 Milla de Correr (1600m) <span class='cue'>⚠️ ADVERTENCIA: Sin chaleco por recuperación de catarro. Si haces Murph, se suspende la fuerza de Deadlift para cuidar la lumbar.</span>"] },
                        accessories: { title: "03. DESCOMPRESIÓN LUMBAR", scheme: "3 Series", items: ["60s colgado pasivo de la barra", "15 Glute Bridges libres suaves", "Foam Roller en gemelos e isquiotibiales"] }
                    }
                ]
            },
            {
                id: "w2d6", name: "SÁBADO", title: "Hordas V2", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "SAN JUSTO (RX)",
                        warmup: { title: "01. WARM-UP", scheme: "Dinámico", items: ["15 Supermans", "10 Spiderman Push-ups", "2 Rondas Extras: 10 Crunches cortos (cero compresión psoas) + 10 Air Squats <span class='cue'>🎯 Activación L4: Foco para rodillas y flexores de cadera.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "SNC Protection", items: ["Pacing constante", "Transición rápida en máquinas"] },
                        metcon: { title: "02. CHIPPER", scheme: "Por Tiempo (Cap: 22 Min)", items: ["1200m Remo", "50 Wall Balls", "40 DB Snatches (unbroken)", "30 Devil Press (con burpee y push-up estricto)"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Caminata suave", "Estiramiento pasivo general"] }
                    },
                    {
                        tabName: "SAN JUSTO (EQUIPO DE 2)",
                        warmup: { title: "01. WARM-UP CO-OP", scheme: "Dinámico", items: ["15 Supermans", "10 Spiderman Push-ups", "2 Rondas Extras: 10 Crunches abdominales cortos + 10 Air Squats <span class='cue'>🎯 Activación L4: Activación de rodillas de forma biomecánica.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "Format I Go / You Go", items: ["Relevos rápidos de a 10 reps", "Mantener potencia en las mancuernas"] },
                        metcon: { title: "02. CHIPPER (TEAMS OF 2)", scheme: "Por Tiempo (Cap: 22 Min) | Dividir reps", items: ["1500m Remo - Dividido", "80 Wall Balls - Dividido", "60 DB Snatches - Dividido (consecutivos)", "40 Devil Press (con burpee y push-up estricto) <span class='cue'>🎯 Dinámica L4: Alternar de a 5 reps en Devil Press para conservar velocidad sin colapsar la fatiga respiratoria.</span>"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Caminata suave", "Movilidad de flexión profunda"] }
                    },
                    {
                        tabName: "SAN JUSTO (EQUIPO DE 3)",
                        warmup: { title: "01. WARM-UP CO-OP", scheme: "Dinámico", items: ["15 Supermans", "10 Spiderman Push-ups", "2 Rondas Extras: 10 Crunches abdominales cortos + 10 Air Squats <span class='cue'>🎯 Activación L4: Calentamiento articular integral.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "Relevo en Tríos", items: ["Pacing aeróbico", "Sostener velocidad sostenida"] },
                        metcon: { title: "02. CHIPPER (TEAMS OF 3)", scheme: "Por Tiempo (Cap: 22 Min) | Dividido por 3", items: ["2000m Remo - Dividido", "100 Wall Balls - Dividido", "80 DB Snatches - Dividido", "50 Devil Press (con burpee y push-up estricto) <span class='cue'>🎯 Dinámica L4: Dividir según fatiga acumulada. Trabajo explosivo intermedio.</span>"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Caminata suave", "Elongación dirigida de isquios"] }
                    },
                    {
                        tabName: "SAN JUSTO (EQUIPO DE 4)",
                        warmup: { title: "01. WARM-UP CO-OP", scheme: "Dinámico", items: ["15 Supermans", "10 Spiderman Push-ups", "2 Rondas Extras: 10 Crunches abdominales cortos + 10 Air Squats <span class='cue'>🎯 Activación L4: Foco en rótulas para alto impacto.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "Duplas Activas simultáneas", items: ["Coordinación táctica de cambio", "Mantener inercia en la máquina"] },
                        metcon: { title: "02. CHIPPER (TEAMS OF 4)", scheme: "Por Tiempo (Cap: 22 Min) | 2 activos simultáneos", items: ["2400m Remo - Duplicado", "120 Wall Balls - Sincronizado", "100 DB Snatches - De a pares", "60 Devil Press (con burpee y push-up estricto) <span class='cue'>🎯 Dinámica L4: Mitad de reps por atleta de manera alternada manteniendo el flujo aeróbico continuo.</span>"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Caminata suave", "Movilidad profunda"] }
                    },
                    {
                        tabName: "SIN BURPEES",
                        warmup: { title: "01. WARM-UP", scheme: "Dinámico", items: ["15 Supermans", "10 Spiderman Push-ups", "2 Rondas Extras: 10 Crunches cortos (cero compresión psoas) + 10 Air Squats <span class='cue'>🎯 Activación L4: Foco para rodillas y flexores de cadera.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "No-Impact", items: ["Cadena posterior fluida", "Preservar articulación de muñeca"] },
                        metcon: { title: "02. CHIPPER (BURPEE-FREE)", scheme: "Por Tiempo (Cap: 22 Min)", items: ["1200m Remo", "50 Wall Balls", "40 DB Snatches", "40 DB Clean & Press (22.5/15 kg) <span class='cue'>🎯 Reemplazo L4: El Clean & Press con mancuernas mantiene la fatiga de hombros sin bajar el pecho al suelo.</span>"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Estiramientos musculares pasivos"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4 DE SÁBADO V2", scheme: "Dinámico", items: ["15 Supermans para erectores espinales", "10 Spiderman Push-ups con control", "2 Rondas Extras: 10 Crunches cortos + 10 Air Squats <span class='cue'>🎯 Activación L4: Foco de rodillas y flexor pautado para la sede Haedo.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "Soga & Pesas", items: ["Conversión de metros a volumen de soga", "Ajuste de tiempos para box lleno"] },
                        metcon: { title: "02. CHIPPER (HAEDO)", scheme: "Por Tiempo (Cap: 22 Min)", items: ["300 Saltos Simples (Target < 3min)", "50 Goblet Squats (KB)", "40 KB Snatches", "30 Clean & Press (Barra 60kg)", "200 Saltos Simples cierre <span class='cue'>Adaptación perfecta para optimizar espacio limitado.</span>"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Movilidad de cadera y gemelos"] }
                    }
                ]
            },
            {
                id: "w2d7", name: "DOMINGO", title: "Tavern Portal", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "RESET ABSOLUTO",
                        warmup: { title: "RECUPERACIÓN", scheme: "Cero Cargas", items: ["Dormir sin alarmas", "Hidratación profunda"] },
                        strength: { title: "MÚSCULO", scheme: "Síntesis", items: ["Asimilación de la fase de Intensificación", "Recarga de depósitos de glucógeno"] },
                        metcon: { title: "SNC", scheme: "Reset", items: ["Cero impacto articular", "Cero fatiga respiratoria"] },
                        accessories: { title: "ALINEACIÓN - FINISHER", scheme: "Listo para Peak Week", items: ["Preparación psicológica para la Semana 3 (Boss Fight)"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. ESTIRAMIENTOS CO-OP", scheme: "Paso a Paso", items: ["Estiramientos compartidos en colchoneta", "Rodillo de espuma completo en piernas"] },
                        strength: { title: "MÚSCULO COMPARTIDO", scheme: "Regenerativo", items: ["Discusión sobre los próximos RMs, técnica y progresiones", "Sinergia mental y física post entreno"] },
                        metcon: { title: "NUTRICIÓN SINCRO", scheme: "Banquete", items: ["Compartir batido o snacks ricos en proteínas", "Comer juntos para reparar los depósitos de glucofósforo"] },
                        accessories: { title: "SNC RESET", scheme: "Listo", items: ["Preparados para encarar la semana 3 con fuerza total"] }
                    }
                ]
            }
        ]
    },
    w3: {
        days: [
            {
                id: "w3d1", name: "LUNES", title: "La Guarida del Mal V3", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "MODO SOLO (RX)",
                        warmup: { title: "01. WARM-UP INDIVIDUAL L4", scheme: "3 Rondas", items: ["10 Air Squats (Temp 3011, pausa en paralelo) <span class='cue'>🎯 Foco: Rodillas activas.</span>", "5 Walkouts lentos con push-up estricto", "10 Crunches abdominales cortos (cero compresión psoas)", "12 Glute Bridges dinámicos con contracción isométrica de 2s"] },
                        strength: { title: "02. FUERZA PEAK", scheme: "3x3 @ 85-90%", items: ["Back Squat <span class='cue'>Cinturón recomendado. Máxima tensión muscular.</span>"] },
                        metcon: { title: "03. METCON", scheme: "5 Min ON / 1 Min OFF x 3 Rondas", items: ["80 Double Unders <span class='cue'>🎯 Escalado L4: Si haces Crossovers, equivalen a 40 reps (ratio 2:1) u 80 saltos simples pesados.</span>", "12 Thrusters Pesados (50/35 kg)", "Max Burpees Over Bar en tiempo restante"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "3 Series", items: ["6/6 Goblet Bulgarian Split Squats (Heavy: sugerido KB/DB 22.5kg o 24kg)", "15 V-Ups Lastrados (sugerido disco de 10kg o mancuerna de 5-7.5kg)"] }
                    },
                    {
                        tabName: "SIN BURPEES",
                        warmup: { title: "01. WARM-UP INDIVIDUAL L4", scheme: "3 Rondas", items: ["10 Air Squats (Temp 3011, pausa en paralelo) <span class='cue'>🎯 Foco: Rodillas activas.</span>", "5 Walkouts lentos con push-up estricto", "10 Crunches abdominales cortos (cero compresión psoas)", "12 Glute Bridges dinámicos con contracción de 2s"] },
                        strength: { title: "02. FUERZA PEAK", scheme: "3x3 @ 85-90%", items: ["Back Squat"] },
                        metcon: { title: "03. METCON (BURPEE-FREE)", scheme: "5 Min ON / 1 Min OFF x 3 Rondas", items: ["80 Double Unders <span class='cue'>🎯 Escalado L4: Si haces Crossovers, equivalen a 40 reps (ratio 2:1) u 80 saltos simples pesados.</span>", "12 Thrusters Pesados (50/35 kg)", "Max American KB Swings (24/16 kg) en tiempo restante <span class='cue'>🎯 Reemplazo L4: El swing pesado compensa el estímulo respiratorio de los burpees.</span>"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "3 Series", items: ["6/6 Goblet Bulgarian Split Squats (Heavy: sugerido KB/DB 22.5kg o 24kg)", "15 V-Ups Lastrados (sugerido disco de 10kg o mancuerna de 5-7.5kg)"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4 V3", scheme: "3 Rondas", items: ["10 Air Squats Sincronizados (Tempo controlado)", "8 Spiderman Lunges con rotación torácica (4/lado)", "10 Crunches cortos sincronizados (cero compresión psoas)", "12 Glute Bridges dinámicos Sincro"] },
                        strength: { title: "02. FUERZA COMPARTIDA", scheme: "4 Series (Por turnos)", items: ["3x3 @ 85-90% (Atleta A)", "3x5-6 (Atleta B)"] },
                        metcon: { title: "03. METCON EN PAREJAS (NO MACHINES)", scheme: "AMRAP 20 MIN (I Go / You Go)", items: ["100 Double Unders (u 80 Crossovers / o 200 Simples) - Reparto libre", "24 Thrusters (Moderados 40/30 kg) - Reparto libre", "80 American KB Swings (24/16 kg) - Reparto libre", "60 Wall Balls (9/6 kg) - Reparto libre <span class='cue'>🎯 Regla de Oro: Peak Volume en equipo, cero burpees. Pacing metabólico agresivo sin máquinas.</span>"] },
                        accessories: { title: "04. ACCESORIOS GRUPALES", scheme: "3 Series", items: ["10/10 Goblet Bulgarian Split Squats (Mancuerna intermedia: sugerido DB de 16-18kg)", "15 V-Ups Libres"] }
                    }
                ]
            },
            {
                id: "w3d2", name: "MARTES", title: "Espectros V3", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "MODO SOLO (RX)",
                        warmup: { title: "01. MOVILIDAD INTEGRAL L4", scheme: "10 Minutos | 2 Rondas", items: ["Apertura torácica y escapular profunda con Foam Roller", "10 Estocadas de lagartija", "12 Air Squats impecables con pausa abajo <span class='cue'>🎯 Foco: Rodillas en eje de torque biomecánico.</span>", "10 Crunches cortos (faja abdominal firme contra sobrecargas)"] },
                        strength: { title: "02. CORE STRENGTH", scheme: "3 Rondas", items: ["20s L-Sit Hold", "15 Hollow Rocks"] },
                        metcon: { title: "03. FLUSH (ZONA 2)", scheme: "45 Minutos Continuos", items: ["Pacing aeróbico estricto. Cero acidez muscular.", "Remo / Bici / Ski alternado cada 15 min"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "3 Rondas", items: ["45s Plancha RKC estricta (máxima tensión de glúteo-abdominal apretando codos y pies contra el suelo)", "Farmer Carry con Kettlebells pesadas (máx de 24kg por mano -no hay más pesadas en box-) x 40 metros (dos tramos de 20m)"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. MOVILIDAD CO-OP L4 V3", scheme: "10 Minutos | 2 Rondas Sincro", items: ["Foam Roller completo de forma coordinada", "Apertura escapular asistida por turnos", "10 Air Squats sincronizados con pausa abajo", "10 Crunches cortos sincro de core activo"] },
                        strength: { title: "02. CORE CO-OP", scheme: "3 Rondas", items: ["20s Hollow Hold sincronizado", "15 Hollow Rocks"] },
                        metcon: { title: "03. FLUSH EN PAREJAS (ZONA 2 - NO MACHINES)", scheme: "45 Minutos Continuos", items: ["Caminata rápida con chaleco o KB en Farmer Carry", "Saltos simples alternados para mantener pulsaciones controladas en Zona 2"] },
                        accessories: { title: "04. ESTABILIZACIÓN CO-OP", scheme: "3 Rondas", items: ["Farmer Carries pesados compartidos con Kettlebells (máx KB de 24kg si se dispone) x 40 metros", "Plancha lateral asistida de 30s por lado de forma estricta"] }
                    }
                ]
            },
            {
                id: "w3d3", name: "MIÉRCOLES", title: "Brujo V3", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "MODO SOLO (RX)",
                        warmup: { title: "01. WARM-UP L4 HOMBRO & CORE V3", scheme: "3 Rondas", items: ["15 Arm Circles concéntricos lentos", "10 Spiderman Push-ups con control excéntrico", "15 Band Pull-aparts para deltoides posterior", "10 Crunches abdominales cortos (faja activa)", "10 Air Squats libres con pausa de 2s abajo <span class='cue'>🎯 Clinica L4: Preparación articular y core clínico prescrito.</span>"] },
                        strength: { title: "02. FUERZA PEAK", scheme: "3x3 @ 85-90%", items: ["Strict Press <span class='cue'>Estabilización torácica máxima. Empuje vertical puro.</span>"] },
                        metcon: { title: "03. METCON SPRINT", scheme: "Por Tiempo (Cap 6 Min)", items: ["21-15-9", "Calorías Máquina (O Battle Ropes rápidas)", "Push Jerk con barra (sugerido 45kg / peso que te permita hacer 7-10 reps ininterrumpidas)"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "3 Series", items: ["6 Strict Pull-ups + 6 Chin-ups (Lastradas si es posible con DB liviana)", "15 Bicep Curls pesados (sugerido mancuernas de 12.5-15kg por lado o barra armada con 25kg)"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4 DE HOMBRO V3", scheme: "3 Rondas", items: ["15 Arm Circles sincronizados", "10 Spiderman Push-ups alternando", "15 Band Pull-aparts para tren superior", "10 Crunches cortos sincro + 10 Air Squats con pausa rodillas afuera"] },
                        strength: { title: "02. FUERZA COMPARTIDA", scheme: "3 Rondas", items: ["Strict Press pesado (barra olímpica única en Haedo)", "Relevos rápidos controlando la forma"] },
                        metcon: { title: "03. SPRINT CO-OP (NO MACHINES)", scheme: "21-15-9", items: ["150 saltos simples por ronda (en lugar de calorías)", "Dual DB Push Jerk (2x 20 kg o 22.5 kg en relevos rápidos sugeridos)"] },
                        accessories: { title: "04. FORJA CO-OP", scheme: "3 Series", items: ["6 Strict Pull-ups compartiendo barra", "15 Bicep Curls alternados (mancuernas sugeridas de 10-12.5kg por bazo)"] }
                    }
                ]
            },
            {
                id: "w3d4", name: "JUEVES", title: "Gólem V3", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "MODO SOLO (RX)",
                        warmup: { title: "01. WARM-UP L4 OLÍMPICO INTENSO", scheme: "3 Rondas", items: ["10 Goblet Squats con tempo 3011 controlando rodillas", "8/8 KB Single Arm Press liviano", "10 Crunches cortos (core rígido)", "10 Air Squats estritos con pause de 2s abajo <span class='cue'>🎯 Clinica L4: Activación articular íntegra e inhibición del psoas.</span>"] },
                        strength: { title: "02. FUERZA TÉCNICA", scheme: "EMOM 8 MIN", items: ["1 Squat Snatch @ 75-80% <span class='cue'>Enfoque en la velocidad de caída debajo de la barra.</span>"] },
                        metcon: { title: "03. METCON", scheme: "AMRAP 14 MIN", items: ["15 Box Jumps (Altos)", "10 Squat Snatches (45kg)", "40 Double Unders"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "3 Series", items: ["Vuegos Laterales Pesados", "Max L-Sit Hold"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4 OLÍMPICO SINCRO", scheme: "3 Rondas", items: ["10 Goblet Squats con DB (Alternados o sincro)", "8/8 KB Single Arm Press", "10 Crunches cortos sincro", "10 Air Squats estritos con faja abdominal rígida"] },
                        strength: { title: "02. FUERZA TÉCNICA CO-OP", scheme: "EMOM 8 MIN", items: ["Dual DB Squat Snatch", "Ajuste técnico bilateral usando mancuernas de Haedo"] },
                        metcon: { title: "03. METCON EN PAREJAS", scheme: "AMRAP 14 MIN (I Go / You Go)", items: ["15 Box Jumps sobre cajón compartido", "10 Squat Snatches con mancuernas", "40 Saltos dobles cada uno"] },
                        accessories: { title: "04. ACCESORIOS CO-OP", scheme: "3 Series", items: ["Vuelos Laterales con DB", "Max L-Sit Hold asistido"] }
                    }
                ]
            },
            {
                id: "w3d5", name: "VIERNES", title: "Gargantúa V3", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "SAN JUSTO (RX)",
                        warmup: { title: "01. WARM-UP L4 BISAGRA V3", scheme: "3 Rondas", items: ["12 Good Mornings PVC de forma lenta", "5 Walkouts lentos con respiración controlada", "12 Glute Bridges dinámicos con contracción de 2s", "10 Crunches abdominales cortos (anti-psoas) + 10 Air Squats <span class='cue'>🎯 Clinica L4: Activación de isquios y faja para Deadlifts pesados sin comprimir lumbares.</span>"] },
                        strength: { title: "02. STRENGTH PEAK", scheme: "3x3 @ 85-90%", items: ["Heavy Deadlift <span class='cue'>Carga máxima del mesociclo. Faja abdominal activa.</span>"] },
                        metcon: { title: "03. METCON", scheme: "21-15-9 pesado", items: ["Deadlift (80-85 kg)", "Box Jumps Altos (24 in)"] },
                        accessories: { title: "04. REINFORCE - FINISHER", scheme: "3 Series", items: ["Barbell Hip Thrusts Heavy (85-95 kg)", "Reverse Flys (10-12 kg)"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4 BISAGRA V3", scheme: "3 Rondas Sincro", items: ["10 Good Mornings con banda elástica", "6 Walkouts lentos + 12 Glute Bridges sincro", "10 Crunches cortos sincronizados + 12 Air Squats con faja rígida"] },
                        strength: { title: "02. FUERZA (HAEDO - CO-OP)", scheme: "5 Series alternadas", items: ["Bulgarian Split Squats Heavy (KB/DB)", "5x5 por pierna <span class='cue'>🎯 Estrategia con Luk: Serie pesada de 5 repeticiones por pierna. Uno ejecuta buscando máxima profundidad y control lateral, mientras el otro asiste para evitar desbalances. Rotación fluida en el mismo rack de KBs.</span>"] },
                        metcon: { title: "03. METCON EN EQUIPO (PEAK / NO BURPEES)", scheme: "AMRAP 14 MIN (I Go / You Go)", items: ["8 Front Squats (Barra max 60/40 kg - Tempo de pausa de 2s abajo)", "12 American KB Swings (24/16 kg)", "10 DB Push Presses (22.5/15 kg) <span class='cue'>🎯 Desafío L4: Para suplir la falta de discos pesados en Haedo, los Front Squats se realizan con una pausa obligatoria de 2 segundos en el fondo del pozo. Mientras uno aniquila su ronda, el otro asiste, cuida la barra y toma el relevo de inmediato.</span>"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "3 Series", items: ["10 V-Ups Lastrados con DB liviana (Sincronizados)", "12 KB Romanian Deadlifts (24/16 kg) (Ejecución técnica estricta)"] }
                    }
                ]
            },
            {
                id: "w3d6", name: "SÁBADO", title: "ANDARIEL", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "SAN JUSTO (RX)",
                        warmup: { title: "01. WARM-UP", scheme: "Gimnástico", items: ["Kipping drills", "Lubricación de hombros", "Supermans", "2 Rondas Extras: 10 Crunches cortos (cero compresión psoas) + 10 Air Squats <span class='cue'>🎯 Activación L4: Foco para rodillas y activar flexores de cadera.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "Boss Fight Focus", items: ["Dividir repeticiones de Thrusters tácticamente", "Mantener ritmo continuo en máquinas"] },
                        metcon: { title: "02. BOSS FIGHT", scheme: "Por Tiempo (Cap: 35 Min)", items: ["100 Cal Máquina (Buy-in)", "50 Thrusters (43/30 kg)", "30 Bar Muscle-Ups (o 60 Pull-ups)", "100 Cal Máquina (Cash-out) <span class='cue'>Peak week. Dejar todo en la arena.</span>"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Descompresión vertebral colgado de barra", "Elongación completa de piernas"] }
                    },
                    {
                        tabName: "SAN JUSTO (EQUIPO DE 2)",
                        warmup: { title: "01. WARM-UP CO-OP", scheme: "Dinámico", items: ["Kipping drills", "Lubricación de hombros", "Supermans", "2 Rondas Extras: 10 Crunches cortos (cero compresión psoas) + 10 Air Squats <span class='cue'>🎯 Activación L4: Calentamiento de rótulas y flexores.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "I Go / You Go en Parejas", items: ["Fraccionamiento rápido en Thrusters (ej. de a 5)", "Ritmo en máquinas"] },
                        metcon: { title: "02. BOSS FIGHT (TEAMS OF 2)", scheme: "Por Tiempo (Cap: 35 Min) | Dividir reps", items: ["150 Cal Máquina (Buy-in) - Dividir como convenga", "80 Thrusters (43/30 kg) - Dividir como convenga", "50 Bar Muscle-Ups (o 100 Pull-ups/Ring Rows) - Dividir", "150 Cal Máquina (Cash-out) - Dividir <span class='cue'>🎯 Dinámica L4: Relevos cortos para proteger el SNC y mantener la velocidad vertical de la barra en Thrusters.</span>"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Descompresión vertebral en barra", "Elongaciones musculares pasivas asistidas en parejas"] }
                    },
                    {
                        tabName: "SAN JUSTO (EQUIPO DE 3)",
                        warmup: { title: "01. WARM-UP CO-OP", scheme: "Dinámico", items: ["Kipping drills", "Lubricación de hombros", "Supermans", "2 Rondas Extras: 10 Crunches cortos + 10 Air Squats <span class='cue'>🎯 Activación L4: Foco clínico en rodillas.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "Rotativo Trío", items: ["Un atleta trabaja, segundo asiste, tercero descansa de manera rotativa."] },
                        metcon: { title: "02. BOSS FIGHT (TEAMS OF 3)", scheme: "Por Tiempo (Cap: 35 Min) | Dividido entre 3", items: ["200 Cal Máquina (Buy-in) - Dividido libre", "100 Thrusters (43/30 kg) - Dividido libre", "75 Bar Muscle-Ups (o 120 Pull-ups) - Dividido libre", "200 Cal Máquina (Cash-out) - Dividido libre <span class='cue'>🎯 Dinámica L4: En tríos, relevos cada 5-8 reps para sostener una tremenda intensidad glucolítica sin saturar el sistema neuromuscular.</span>"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Colgarse pasivo de barra para descomprimir espina", "Elongaciones de psoas e isquiotibiales"] }
                    },
                    {
                        tabName: "SAN JUSTO (EQUIPO DE 4)",
                        warmup: { title: "01. WARM-UP CO-OP", scheme: "Dinámico", items: ["Kipping drills", "Lubricación de hombros", "Supermans", "2 Rondas Extras: 10 Crunches cortos + 10 Air Squats <span class='cue'>🎯 Activación L4: Activación articular de tren inferior.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "Duplas simultáneas", items: ["Dos atletas activos acumulando simultáneamente.", "Relevos cada bloque de kcal."] },
                        metcon: { title: "02. BOSS FIGHT (TEAMS OF 4)", scheme: "Por Tiempo (Cap: 35 Min) | Duplas activas", items: ["300 Cal Máquina (Buy-in) - Dos máquinas paralelas", "150 Thrusters (43/30 kg) - Dos atletas activos en paralelo", "100 Bar Muscle-Ups (o 200 Pull-ups) - Dos atletas en paralelo", "300 Cal Máquina (Cash-out) - Sincro o sumando de a dos <span class='cue'>🎯 Dinámica L4: Trabajo brutal de resistencia aeróbica y fuerza paralela. Recomponer el pautado dinámico en cada bloque.</span>"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Descompresión espinal e hidratación de tendones"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4 DE SÁBADO V3", scheme: "Dinámico", items: ["Saltos suaves de soga", "15 Supermans (espalda neutra)", "10 Spiderman Push-ups", "2 Rondas Extras: 10 Crunches cortos + 10 Air Squats <span class='cue'>🎯 Activación L4: Calentamiento de bursa rotuliana e iliaca.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "Pacing Haedo", items: ["Fraccionamiento de soga sin máquina", "Uso intensivo de KBs para Thrusters"] },
                        metcon: { title: "02. BOSS FIGHT (HAEDO)", scheme: "Por Tiempo (Cap: 35 Min) | Calibrado", items: ["400 Saltos Simples (Target < 4min)", "50 Thrusters (Barra 40kg o KBs)", "60 Pull-ups estrictos/banda", "300 Saltos Simples cierre <span class='cue'>Adaptación milimétrica para mantener el dolor metabólico sin máquinas de cardio.</span>"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Estiramiento estático de pantorrillas y antebrazos"] }
                    }
                ]
            },
            {
                id: "w3d7", name: "DOMINGO", title: "Tavern Portal", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "SOBREVIVISTE",
                        warmup: { title: "RECUPERACIÓN", scheme: "Cero Cargas", items: ["Descanso total", "Hidratación masiva de tendones"] },
                        strength: { title: "SNC RESET", scheme: "Completo", items: ["Descompresión lumbar", "Baño de contraste o sauna"] },
                        metcon: { title: "GLUCÓGENO", scheme: "Recarga", items: ["Carbohidratos complejos de alta calidad", "Recuperación hormonal"] },
                        accessories: { title: "ALINEACIÓN - FINISHER", scheme: "Listo para Deload", items: ["Preparación mental para la fase de descarga (Semana 4)"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. ESTIRAMIENTOS CO-OP", scheme: "Paso a Paso", items: ["Rodillo miofascial de espuma conjunto", "Estiramientos asistidos generales"] },
                        strength: { title: "SNC RESET CO-OP", scheme: "Completo", items: ["Descompresión articular pasiva asistida", "Mentalidad positiva post-entreno"] },
                        metcon: { title: "RECARGA EN EQUIPO", scheme: "Glucógeno Sincro", items: ["Comida abundante compartida en Haedo", "Recuperación óptima del catarro"] },
                        accessories: { title: "ALINEACIÓN CO-OP", scheme: "Listo", items: ["Listos para encarar la semana de Deload (Semana 4)"] }
                    }
                ]
            }
        ]
    },
    w4: {
        days: [
            {
                id: "w4d1", name: "LUNES", title: "La Guarida del Mal V4", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "MODO SOLO (DELOAD)",
                        warmup: { title: "01. WARM-UP DE ACTIVACIÓN LIGERA L4", scheme: "3 Rondas", items: ["10 Air Squats de flujo suave (énfasis de rodilla)", "5 Walkouts lentos con estiramiento", "10 Crunches abdominales cortos (faja sin psoas)", "12 Glute Bridges muy controlados <span class='cue'>🎯 Clinica L4: Preparación articular de descarga e irrigación circulatoria.</span>"] },
                        strength: { title: "02. FUERZA DELOAD", scheme: "3x5 @ 50%", items: ["Back Squat <span class='cue'>Mucha velocidad concéntrica. Cero peso real.</span>"] },
                        metcon: { title: "03. METCON LIGERO", scheme: "AMRAP 10 MIN", items: ["100 Single Unders", "10 Air Squats", "5 Burpees"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "2 Series", items: ["Core pasivo", "Planchas frontales suaves"] }
                    },
                    {
                        tabName: "SIN BURPEES",
                        warmup: { title: "01. WARM-UP DE ACTIVACIÓN LIGERA L4", scheme: "3 Rondas", items: ["10 Air Squats de flujo suave", "5 Walkouts de movilidad con pausa", "10 Crunches abdominales cortos (faja sin psoas)", "12 Glute Bridges controlados <span class='cue'>🎯 Clinica L4: Activación lumbar y rodillas pre-entreno.</span>"] },
                        strength: { title: "02. FUERZA DELOAD", scheme: "3x5 @ 50%", items: ["Back Squat"] },
                        metcon: { title: "03. METCON (BURPEE-FREE)", scheme: "AMRAP 10 MIN", items: ["100 Single Unders", "10 Air Squats", "10 Sit-ups Unbroken <span class='cue'>🎯 Reemplazo L4: Estimulación limpia de la faja abdominal sin sobrecarga espinal.</span>"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "2 Series", items: ["Core pasivo", "Planchas frontales suaves"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP DE DESCARGA L4", scheme: "3 Rondas Sincro", items: ["10 Air Squats sincronizados súper lentos (rodillas activas)", "6 Spiderman Lunges con rotación torácica", "10 Crunches cortos sincronizados", "10 Glute Bridges suaves en pareja"] },
                        strength: { title: "02. FUERZA DELOAD COMPARTIDA", scheme: "3 Series (Por turnos)", items: ["3x5 @ 50% Back Squat <span class='cue'>Enfoque en tempo y control de la fase excéntrica.</span>"] },
                        metcon: { title: "03. PARTNER DELOAD FLOW (NO MACHINES)", scheme: "AMRAP 12 MIN (I Go / You Go)", items: ["150 Single Unders - Reparto libre", "20 Air Squats Sincronizados", "10 Russian KB Swings (Moderados) <span class='cue'>🎯 Regla de Oro: Descarga coordinada y cardio ligero para purgar el lactato sin máquinas.</span>"] },
                        accessories: { title: "04. ACCESORIOS GRUPALES", scheme: "2 Series", items: ["Plancha frontal sincronizada 45s"] }
                    }
                ]
            },
            {
                id: "w4d2", name: "MARTES", title: "Espectros V4", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "MODO SOLO (RX)",
                        warmup: { title: "01. MOVILIDAD", scheme: "15 Minutos", items: ["Yoga / Stretching profundo en el living", "Rodillo de espuma miofascial"] },
                        strength: { title: "02. ACTIVACIÓN CO-OP", scheme: "Suave", items: ["Estiramiento asistido de isquiotibiales"] },
                        metcon: { title: "03. FLUSH REGENERATIVO", scheme: "30 Minutos Zona 1-2", items: ["Caminata rápida al aire libre o bici muy suave", "Evitar cualquier acumulación de fatiga"] },
                        accessories: { title: "04. RECUPERACIÓN - FINISHER", scheme: "Opcional", items: ["Masaje deportivo", "Sauna o tina caliente"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. MOVILIDAD CO-OP", scheme: "15 Minutos", items: ["Estiramiento de movilidad de cadera compartido", "Foam Roller en pareja"] },
                        strength: { title: "02. ACTIVACIÓN CO-OP", scheme: "Suave", items: ["Estiramiento asistido mutuo"] },
                        metcon: { title: "03. FLUSH REGENERATIVO CO-OP (NO MACHINES)", scheme: "30 Minutos Zona 1-2", items: ["Caminata suave dialogando", "Saltos simples ligeros e intermitentes sin forzar el sistema"] },
                        accessories: { title: "04. RECUPERACIÓN CO-OP", scheme: "Opcional", items: ["Masajes o estiramientos libres asistidos"] }
                    }
                ]
            },
            {
                id: "w4d3", name: "MIÉRCOLES", title: "Brujo V4", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "MODO SOLO (RX)",
                        warmup: { title: "01. WARM-UP L4 DESCARGA HOMBRO", scheme: "3 Rondas", items: ["Apertura y rotación de hombro con bastón", "10 Rotaciones pectorales con banda", "10 Crunches cortos (cero compresión psoas)", "10 Air Squats controlados <span class='cue'>🎯 Clinica L4: Estimulación articular de tren superior e inferior sin peso axial.</span>"] },
                        strength: { title: "02. FUERZA DELOAD", scheme: "3x5 @ 50%", items: ["Strict Press <span class='cue'>Trabajo puramente técnico y de movilidad.</span>"] },
                        metcon: { title: "03. METCON LIGERO", scheme: "3 Rondas No Por Tiempo", items: ["15 Cal Remo (Suave)", "10 Push Press Livianos"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "2 Series", items: ["Curls livianos con banda elástica"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4 DESCARGA HOMBRO", scheme: "3 Rondas", items: ["Rotación de hombro sincronizada con bastón", "10 Rotaciones elásticas", "10 Crunches cortos sincro", "10 Air Squats con pausa"] },
                        strength: { title: "02. FUERZA DELOAD", scheme: "3x5 @ 50%", items: ["Strict Press con mancuernas ligeras (Deload completo)"] },
                        metcon: { title: "03. METCON CO-OP LIGERO (NO MACHINES)", scheme: "3 Rondas de flujo suave", items: ["100 saltos simples (en relevos de 50)", "10 DB Push Press ligeros en parejas alternas"] },
                        accessories: { title: "04. ACCESORIOS CO-OP", scheme: "2 Series", items: ["Curls livianos coordinados"] }
                    }
                ]
            },
            {
                id: "w4d4", name: "JUEVES", title: "Gólem V4", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "MODO SOLO (RX)",
                        warmup: { title: "01. WARM-UP L4 TÉCNICO DESCARGA", scheme: "3 Rondas", items: ["Alineamiento articular pilar con PVC", "10 OHS con barra de técnica", "10 Crunches abdominales cortos", "10 Air Squats estritos con pause <span class='cue'>🎯 Clinica L4: Foco de rodillas y faja protectora de columna.</span>"] },
                        strength: { title: "02. FUERZA TÉCNICA", scheme: "10 Minutos", items: ["Drills de Snatch con barra vacía <span class='cue'>Pulir los puntos de contacto e impulsión.</span>"] },
                        metcon: { title: "03. METCON", scheme: "EMOM 10 MIN", items: ["10 Step-ups ligeros", "5 Power Snatches con barra vacía"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "2 Series", items: ["Movilidad de escápulas", "Colgado de barra activo"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4 TÉCNICO DESCARGA", scheme: "3 Rondas Sincro", items: ["Movilidad conjunta con bastón de técnica", "10 OHS sincronizados", "10 Crunches cortos sincro", "12 Air Squats con pausa rodillas afuera"] },
                        strength: { title: "02. FUERZA TÉCNICA CO-OP", scheme: "10 Minutos", items: ["Técnica de Snatch unilateral ligera con Kettlebell/Dumbbell"] },
                        metcon: { title: "03. METCON DELOAD CO-OP", scheme: "EMOM 10 MIN", items: ["10 Step-ups sin peso por relevo", "5 Power Snatches ligeros con DB"] },
                        accessories: { title: "04. ACCESORIOS CO-OP", scheme: "2 Series", items: ["Movilidad de escápulas colgados de la barra"] }
                    }
                ]
            },
            {
                id: "w4d5", name: "VIERNES", title: "Gargantúa V4", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "SAN JUSTO",
                        warmup: { title: "01. WARM-UP L4 BISAGRA DE DESCARGA", scheme: "3 Rondas", items: ["Estiramiento dinámico de isquiotibiales", "10 Crunches cortos protectores de lumbar", "12 Glute Bridges suaves", "10 Air Squats de velocidad técnica <span class='cue'>🎯 Clinica L4: Activación sagital segura de espalda baja pre Deadlift.</span>"] },
                        strength: { title: "02. FUERZA DELOAD", scheme: "3x5 @ 50%", items: ["Deadlift <span class='cue'>Velocidad concéntrica explosiva, cero esfuerzo de frenado.</span>"] },
                        metcon: { title: "03. FLUSH", scheme: "15 MIN ZONA 2", items: ["Remo continuo a ritmo regenerativo"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "2 Series", items: ["Hip Thrusts livianos (40-50 kg)", "Plancha core (BW)"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4 BISAGRA DESCARGA", scheme: "3 Rondas Sincro", items: ["Estiramiento de isquiotibiales y lumbar compartida", "8 Spiderman Lunges", "10 Crunches cortos sincro", "12 Air Squats con faja rígida y rodillas separadas"] },
                        strength: { title: "02. FUERZA DELOAD", scheme: "3x8 Liviano", items: ["KB RDL <span class='cue'>Eje sagital, rango completo. Trabajo estricto con Lucas.</span>"] },
                        metcon: { title: "03. FLUSH EN EQUIPO", scheme: "EMOM 12 MIN (Alternando minutos)", items: ["Alternando minutos: 15 Russian KB Swings livianos (16/12 kg) + 10 Goblet Squats ligeras (12.5/10 kg) <span class='cue'>🎯 Foco Deload: Mantener el flujo circulatorio activo, sin fatigar el SNC. Ritmo relajado en parejas.</span>"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "2 Series", items: ["45s Plancha frontal estricta (BW)"] }
                    }
                ]
            },
            {
                id: "w4d6", name: "LUT GHOLEIN", title: "Social Party", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "SAN JUSTO (RX)",
                        warmup: { title: "01. WARM-UP", scheme: "Social", items: ["Juegos de calentamiento en equipo con Flor", "2 Rondas Extras: 10 Crunches cortos (cero compresión psoas) + 10 Air Squats <span class='cue'>🎯 Activación L4: Foco para rodillas y flexores de cadera.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "Deload Partner", items: ["Mantener el ritmo sin disparar pulsaciones", "Pacing de disfrute"] },
                        metcon: { title: "02. TEAM WOD", scheme: "AMRAP 25 MIN | I go / You go", items: ["500m Remo", "20 Wall Balls", "10 Burpees con push-up estricto <span class='cue'>Viaje de descarga. WOD para divertirse con Flor sin mirar el reloj.</span>"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Chocar los 5", "Estirar charlando de forma recreativa"] }
                    },
                    {
                        tabName: "SAN JUSTO (EQUIPO DE 2)",
                        warmup: { title: "01. WARM-UP CO-OP", scheme: "Social", items: ["Juegos de calentamiento con Flor", "2 Rondas Extras: 10 Crunches cortos (cero compresión psoas) + 10 Air Squats <span class='cue'>🎯 Activación L4: Preparación de rodillas y cadera.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "Deload Parejas", items: ["Divertir y mantener movilidad activa", "Cero impacto o sobrecarga"] },
                        metcon: { title: "02. TEAM WOD (TEAMS OF 2)", scheme: "AMRAP 25 MIN | I Go / You Go (Rondas Completas)", items: ["500m Remo (Alternando)", "20 Wall Balls - Dividido", "10 Burpees con push-up estricto - Dividido <span class='cue'>🎯 Deload L4: Busquen transiciones fluidas. Ritmo constante de conversación, mantengan las pulsaciones bajo control.</span>"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Chocar los 5", "Estirar charlando alegremente con Flor"] }
                    },
                    {
                        tabName: "SAN JUSTO (EQUIPO DE 3)",
                        warmup: { title: "01. WARM-UP CO-OP", scheme: "Social", items: ["Movilidad grupal", "2 Rondas Extras: 10 Crunches cortos (cero compresión psoas) + 10 Air Squats <span class='cue'>🎯 Activación L4: Foco flexores.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "Format Tríos Rotativo", items: ["Un atleta en remo, uno en wall balls, uno en burpees. Movimiento constante sin fatigar."] },
                        metcon: { title: "02. TEAM WOD (TEAMS OF 3)", scheme: "AMRAP 25 MIN | Estaciones Rotativas", items: ["Atleta A: 500m Remo", "Atleta B: 20 Wall Balls", "Atleta C: 10 Burpees con push-up estricto <span class='cue'>🎯 Dinámica L4: El atleta A no puede arrancar el remo hasta que el atleta C culmine sus burpees. Rotación completa de estaciones. Excelente recuperación activa.</span>"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Estirar en círculo compartiendo anécdotas"] }
                    },
                    {
                        tabName: "SAN JUSTO (EQUIPO DE 4)",
                        warmup: { title: "01. WARM-UP CO-OP", scheme: "Social", items: ["Movilidad compartida en parejas", "2 Rondas Extras: 10 Crunches cortos (cero compresión psoas) + 10 Air Squats <span class='cue'>🎯 Activación L4: Foco rodillas.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "Format Duplas Sincro", items: ["Ejecución sincro para descarga coordinada", "Divertir en duplas."] },
                        metcon: { title: "02. TEAM WOD (TEAMS OF 4)", scheme: "AMRAP 25 MIN | Relevo de Duplas o Sincro", items: ["Pareja A: 1000m Remo (dividido de a 500m)", "Pareja B: 40 Wall Balls (sincronizados u alternados", "Pareja A: 20 Burpees sincronizados con push-up <span class='cue'>🎯 Dinámica L4: Alternar duplas para bloques de ejercicios o sincronizarlos para un estímulo aeróbico social y sin picos neurales.</span>"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Chocar los 5 grupal y estiramientos profundos de isquiotibiales"] }
                    },
                    {
                        tabName: "SAN JUSTO (NO BURPEES)",
                        warmup: { title: "01. WARM-UP", scheme: "Social", items: ["Calentamiento articular grupal", "2 Rondas Extras: 10 Crunches cortos (cero compresión psoas) + 10 Air Squats <span class='cue'>🎯 Activación L4: Activación de rodillas y cadera.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "No-Burpee", items: ["Movimiento constante", "Cero impacto lumbar"] },
                        metcon: { title: "02. TEAM WOD (NO BURPEES)", scheme: "AMRAP 25 MIN | I go / You go", items: ["500m Remo", "20 Wall Balls", "15 Russian KB Swings (24/16 kg) <span class='cue'>🎯 Reemplazo L4: Estímulo posterior masivo para descargar la columna sin flexiones de pecho.</span>"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Elongación completa con Flor"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP RX)",
                        warmup: { title: "01. WARM-UP CO-OP L4 SOCIAL", scheme: "Social", items: ["Juegos de calentamiento generales", "2 Rondas Extras: 10 Crunches abdominales cortos + 10 Air Squats <span class='cue'>🎯 Activación L4: Lubricación de bursa rotuliana e iliaca.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "Pacing Haedo", items: ["Alternancia ágil de transiciones"] },
                        metcon: { title: "02. TEAM WOD (HAEDO)", scheme: "AMRAP 25 MIN | I go / You go", items: ["150 Saltos Simples", "20 Goblet Squats", "10 Burpees"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Elongación colectiva"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP NO BURPEES)",
                        warmup: { title: "01. WARM-UP CO-OP L4 SOCIAL BIOMECÁNICO", scheme: "Social", items: ["Activación conjunta de core y piernas", "2 Rondas Extras: 10 Crunches cortos + 10 Air Squats <span class='cue'>🎯 Activación L4: Protector lumbar y rotuliana.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "Smooth Flow", items: ["Preservar hombros", "Movimiento cyclico continuo"] },
                        metcon: { title: "02. TEAM WOD HAEDO (NO BURPEES)", scheme: "AMRAP 25 MIN | I go / You go", items: ["150 Saltos Simples", "20 Goblet Squats", "15 Russian KB Swings (16/12 kg) <span class='cue'>🎯 Reemplazo L4: Swings con carga moderada para mantener el flujo sanguíneo activo.</span>"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Elongación colectiva"] }
                    }
                ]
            },
            {
                id: "w4d7", name: "DOMINGO", title: "Tavern Portal", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "ACTO I SELLADO",
                        warmup: { title: "LOGRO OBTENIDO", scheme: "Acto I Completo", items: ["Sobreviviste al Campamento de las Arpías", "Nivel de resiliencia biomecánica: Avanzado"] },
                        strength: { title: "ESTADO FÍSICO", scheme: "Óptimo", items: ["Estabilidad lumbar blindada", "Core activado y cadena posterior robustecida"] },
                        metcon: { title: "SNC STATUS", scheme: "Listo", items: ["Totalmente recuperado", "Preparado para el Desierto (Acto II)"] },
                        accessories: { title: "PRÓXIMO PASO - FINISHER", scheme: "Fase II", items: ["Apertura del Acto II: Las Catacumbas", "Aumento progresivo de cargas axiales"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "ACTO I SELLADO CO-OP", scheme: "Paso a Paso", items: ["Estiramientos relajados conjuntos", "Auto-masaje con rodillo miofascial"] },
                        strength: { title: "ESTADO FÍSICO CO-OP", scheme: "Sinergia Completa", items: ["Preparación e hidratación completa mutua"] },
                        metcon: { title: "SNC REBOOT CO-OP", scheme: "Próximas Metas", items: ["Programación mental y de objetivos para la Fase II de entrenamiento"] },
                        accessories: { title: "PRÓXIMO PASO CO-OP", scheme: "Listo", items: ["Fase II: Camino al Desierto. Listos para seguir sumando calidad."] }
                    }
                ]
            }
        ]
    }
};
```

## File: src/lib/analyticsService.ts
```typescript
/**
 * Analytics Computing Service for Nexus L4 Coach Applet.
 * Computes RPE Trends, RPE Distributions, and Dyn-RPE Comparison Overtraining Metrics.
 */

export interface ChartDayData {
  name: string;
  rpe: number;
  isReal: boolean;
}

export interface RpeDistributionItem {
  rpeName: string;
  frequency: number;
  displayColor: string;
  isReal: boolean;
}

export interface RpeComparisonResult {
  currentAvg: number;
  priorAvg: number;
  diff: number;
  status: "good" | "warning" | "normal";
  label: string;
  message: string;
  advice: string;
  hasCurrentReal: boolean;
}

/**
 * Computes the 7-day RPE averages for the trend line chart.
 */
export function computeChartData(currentWeek: string, _logsVersion: number): ChartDayData[] {
  const days = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
  return days.map((dayName, idx) => {
    const dayId = `${currentWeek}d${idx + 1}`;
    let rpeSum = 0;
    let rpeCount = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`nexus_logs_${dayId}_`)) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const logs = JSON.parse(raw);
            if (Array.isArray(logs)) {
              logs.forEach((item: any) => {
                const val = parseFloat(item.rpe);
                if (!isNaN(val) && val > 0) {
                  rpeSum += val;
                  rpeCount++;
                }
              });
            }
          }
        } catch {
          // ignore
        }
      }
    }

    const hasRealLogs = rpeCount > 0;
    const avgRpe = hasRealLogs ? parseFloat((rpeSum / rpeCount).toFixed(1)) : null;

    // Seed baseline trend values so it looks polished if they haven't logged entries on a day yet
    let baselineVal = 7.0;
    if (idx === 0) baselineVal = 7.5; // Lunes pesado
    if (idx === 1) baselineVal = 6.0; // Martes flush/técnico
    if (idx === 2) baselineVal = 8.0; // Miércoles HWPO pesado
    if (idx === 3) baselineVal = 7.0; // Jueves potencia
    if (idx === 4) baselineVal = 3.5; // Viernes descanso clínico
    if (idx === 5) baselineVal = 8.5; // Sábado Mayhem chipper pesado
    if (idx === 6) baselineVal = 7.2; // Domingo barra

    return {
      name: dayName,
      rpe: avgRpe !== null ? avgRpe : baselineVal,
      isReal: hasRealLogs,
    };
  });
}

/**
 * Computes the RPE distribution frequency histogram data.
 */
export function computeRpeDistributionData(currentWeek: string, _logsVersion: number): RpeDistributionItem[] {
  const distribution: Record<number, number> = {};
  for (let r = 1; r <= 10; r++) {
    distribution[r] = 0;
  }

  let totalRealLogs = 0;

  // Scan all days of the current week (from 1 to 7)
  for (let dayIdx = 1; dayIdx <= 7; dayIdx++) {
    const dayId = `${currentWeek}d${dayIdx}`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`nexus_logs_${dayId}_`)) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const logs = JSON.parse(raw);
            if (Array.isArray(logs)) {
              logs.forEach((item: any) => {
                const val = parseFloat(item.rpe);
                if (!isNaN(val) && val >= 1 && val <= 10) {
                  const rounded = Math.round(val);
                  distribution[rounded] = (distribution[rounded] || 0) + 1;
                  totalRealLogs++;
                }
              });
            }
          }
        } catch {
          // ignore
        }
      }
    }
  }

  const hasRealLogs = totalRealLogs > 0;
  if (!hasRealLogs) {
    const baselines = [8, 6, 8, 7, 4, 9, 7]; // rounded baseline values
    baselines.forEach((val) => {
      distribution[val] = (distribution[val] || 0) + 1;
    });
  }

  return Array.from({ length: 10 }, (_, i) => {
    const rpeVal = i + 1;
    return {
      rpeName: `RPE ${rpeVal}`,
      frequency: distribution[rpeVal],
      displayColor:
        rpeVal <= 4
          ? "#39FF14"
          : rpeVal <= 7
            ? "#CCFF00"
            : rpeVal <= 9
              ? "#FF007F"
              : "#FF0000",
      isReal: hasRealLogs,
    };
  });
}

/**
 * Computes dynamic RPE comparison and overtraining advice based on prior weeks.
 */
export function computeRpeComparisonInfo(
  currentWeek: string,
  activeDayId: string,
  _logsVersion: number,
): RpeComparisonResult {
  let currentSessionSum = 0;
  let currentSessionCount = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(`nexus_logs_${activeDayId}_`)) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const logs = JSON.parse(raw);
          if (Array.isArray(logs)) {
            logs.forEach((item: any) => {
              const val = parseFloat(item.rpe);
              if (!isNaN(val) && val > 0) {
                currentSessionSum += val;
                currentSessionCount++;
              }
            });
          }
        }
      } catch {
        // ignore
      }
    }
  }

  // Baseline values for the 7 weekdays (LUN, MAR, MIÉ, JUE, VIE, SÁB, DOM)
  const baselines = [7.5, 6.0, 8.0, 7.0, 3.5, 8.5, 7.2];
  const activeDayNum = parseInt(activeDayId.split("d")[1] || "1", 10); // 1 to 7
  const dayIdx = activeDayNum - 1;
  const currentBaseline = baselines[dayIdx];

  const hasCurrentReal = currentSessionCount > 0;
  const currentAvg = hasCurrentReal ? currentSessionSum / currentSessionCount : currentBaseline;

  // Prior/Other Weeks RPE: Look at the same weekday index across OTHER weeks
  let otherWeeksSum = 0;
  let otherWeeksCount = 0;
  const otherWeekKeys = ["w1", "w2", "w3", "w4"].filter((wk) => wk !== currentWeek);

  otherWeekKeys.forEach((wk) => {
    const targetDayId = `${wk}d${activeDayNum}`;
    let wkDaySum = 0;
    let wkDayCount = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`nexus_logs_${targetDayId}_`)) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const logs = JSON.parse(raw);
            if (Array.isArray(logs)) {
              logs.forEach((item: any) => {
                const val = parseFloat(item.rpe);
                if (!isNaN(val) && val > 0) {
                  wkDaySum += val;
                  wkDayCount++;
                }
              });
            }
          }
        } catch {
          // ignore
        }
      }
    }

    if (wkDayCount > 0) {
      otherWeeksSum += wkDaySum / wkDayCount;
      otherWeeksCount++;
    } else {
      let weekOffset = 0;
      if (wk === "w1") weekOffset = -0.5;
      else if (wk === "w2") weekOffset = 0;
      else if (wk === "w3") weekOffset = 0.5;
      else if (wk === "w4") weekOffset = -1.5;

      const baselineVal = Math.max(1, Math.min(10, currentBaseline + weekOffset));
      otherWeeksSum += baselineVal;
      otherWeeksCount++;
    }
  });

  const priorAvg = otherWeeksCount > 0 ? otherWeeksSum / otherWeeksCount : currentBaseline;
  const diff = currentAvg - priorAvg;

  let status: "good" | "warning" | "normal" = "normal";
  let label = "ESTABLE // NOMINAL";
  let message = "Intensidad en rango óptimo de supercompensación.";
  let advice = "Sistemas neurales intactos. Continúa con los intervalos y descansos mandatorios.";

  if (diff >= 0.8) {
    status = "warning";
    label = "⚠️ RIESGO ALTO // SOBRECARGA";
    message = "Desviación neural considerable detectada en la sesión.";
    advice = "SNC fatigado. Reduce la carga activa en un 10-15% en el próximo bloque y prioriza ROM.";
  } else if (diff <= -0.8) {
    status = "good";
    label = "⚡ EXCELENTE // INTACTO";
    message = "Adaptación metabólica con sobrecompensación positiva.";
    advice = "La fatiga percibida disminuyó respecto al ciclo previo. Permite excelente aceleración de barra.";
  }

  return {
    currentAvg,
    priorAvg,
    diff,
    status,
    label,
    message,
    advice,
    hasCurrentReal,
  };
}
```

## File: src/lib/biomechanicsAdvisor.ts
```typescript
/**
 * L4 Biomechanics Advisor & Dynamic RPE Suggester.
 * Standardizes CF-L4 clinic wisdom, ROM rules, and personalized athlete guidance.
 */
import { AthleteState } from "../types/workout";

export function getSuggestedRpe(
  weightInput: string,
  maxWeight: number,
): { rpe: string; percentage: number } | null {
  if (!weightInput || maxWeight <= 0) return null;
  const cleanWeight = parseFloat(weightInput.replace(/[^0-9.]/g, ""));
  if (isNaN(cleanWeight) || cleanWeight <= 0) return null;

  const percentage = Math.round((cleanWeight / maxWeight) * 100);

  // CF-L4 / PRVN / HWPO Scientific Intensity Scale mapping
  let suggestedRpe = "8";
  if (percentage >= 105) suggestedRpe = "10"; // PR Overload!
  else if (percentage >= 100) suggestedRpe = "10";
  else if (percentage >= 95) suggestedRpe = "9.5";
  else if (percentage >= 90) suggestedRpe = "9";
  else if (percentage >= 85) suggestedRpe = "8.5";
  else if (percentage >= 80) suggestedRpe = "8";
  else if (percentage >= 75) suggestedRpe = "7.5";
  else if (percentage >= 70) suggestedRpe = "7";
  else if (percentage >= 65) suggestedRpe = "6.5";
  else if (percentage >= 60) suggestedRpe = "6";
  else if (percentage >= 50) suggestedRpe = "5";
  else suggestedRpe = "4";

  return { rpe: suggestedRpe, percentage };
}

export function getBiomechanicalTips(
  exerciseName: string,
  athlete: AthleteState,
): string[] {
  const tips: string[] = [];

  const levelUpper = (athlete.level || "").toUpperCase();
  const grebasUpper = (athlete.equipment?.grebas || "").toUpperCase();
  const amuletoUpper = (athlete.equipment?.amuleto || "").toUpperCase();
  const filtroUpper = (athlete.equipment?.filtro || "").toUpperCase();
  const nameUpper = exerciseName.toUpperCase();

  // 1. Core CF-L4 Rules
  if (
    nameUpper.includes("SQUAT") ||
    nameUpper.includes("SENTADILLA") ||
    nameUpper.includes("THRUSTER") ||
    nameUpper.includes("CLEAN")
  ) {
    tips.push(
      "\u2695\ufe0f **ROM sobre Carga [CF-L4]**: Prioriza siempre el rango de movimiento completo y profundo (rompe el paralelo) antes de añadir más discos a la barra. Empuja las rodillas hacia fuera.",
    );
  }

  if (
    nameUpper.includes("SNATCH") ||
    nameUpper.includes("CLEAN") ||
    nameUpper.includes("DEADLIFT") ||
    nameUpper.includes("PESO MUERTO") ||
    nameUpper.includes("CARGADA")
  ) {
    tips.push(
      "\ud83c\udfcb\ufe0f **Física de Agarre [CF-L4]**: Activa el agarre de gancho (*Hook Grip*) para descargar la fatiga de tus antebrazos y mejorar la transferencia de fuerza vertical.",
    );
  }

  if (
    nameUpper.includes("PULL-UP") ||
    nameUpper.includes("MUSCLE-UP") ||
    nameUpper.includes("DOMINADA") ||
    nameUpper.includes("T2B") ||
    nameUpper.includes("TOES")
  ) {
    tips.push(
      "\ud83d\udd90\ufe0f **Evita los Guantes [CF-L4]**: No uses guantes en la barra olímpica o de gimnasia. Provocan deslizamiento multicapa. Utiliza calleras de fibra de carbono directamente con magnesio con el pliegue táctico (*Dowel Effect*).",
    );
  }

  if (
    nameUpper.includes("SIT-UP") ||
    nameUpper.includes("L-SIT") ||
    nameUpper.includes("ABDOMINAL")
  ) {
    tips.push(
      "\u26a0\ufe0f **Trampa del Psoas [CF-L4]**: Los sit-ups completos fatigan severamente el psoas ilíaco comprimiendo la zona lumbar. Recomiendo sustituir por abdominales cortos (crunch) o planchas anti-extensión.",
    );
  }

  // 2. Class/Level personalized strategy
  if (levelUpper.includes("PRVN")) {
    tips.push(
      "\ud83e\uddec **Estrategia PRVN**: Calidad e intervalos estrictos. Respeta el estímulo original. Si tu RPE sube de lo pautado por fatiga, prioriza velocidad de barra reduciendo peso.",
    );
  } else if (levelUpper.includes("HWPO")) {
    tips.push(
      "\u26d3\ufe0f **Estrategia HWPO (Mat Fraser)**: La consistencia es lo primero. Tus accesorios no son 'por tiempo', mantén la fase excéntrica lenta (tempo de calidad). \u00a1Trabajo duro paga!",
    );
  } else if (levelUpper.includes("MAYHEM")) {
    tips.push(
      "\ud83c\udf0b **Estrategia Mayhem (Rich Froning)**: Volumen exigente. Ejecuta idealmente la rutina de activación 'Hip Halo' (glute bridges/walks) para un correcto reclutamiento neural.",
    );
  } else if (
    levelUpper.includes("HAEDO") ||
    levelUpper.includes("BALDE") ||
    levelUpper.includes("LUK")
  ) {
    tips.push(
      "\u2695\ufe0f **Estrategia Haedo (Balde)**: Salud y longevidad en adultos activos. Atención a redundancias de flexión de columna. \u00a1Buen trabajo! Prep\u00e1rate una Coca-Cola bien fr\u00eda para reponer gluc\u00f3geno post-entreno.",
    );
  } else if (
    levelUpper.includes("PEAK") ||
    levelUpper.includes("SAN JUSTO") ||
    levelUpper.includes("VALENT\u00cdN")
  ) {
    tips.push(
      "\ud83d\udea8 **Estrategia San Justo (Alerta de Volumen Basura)**: Cuidado con la halterofilia pesada sobre fatiga plyo extrema. Regula tus cargas al ~60% ante el menor indicio de quiebre t\u00e9cnico.",
    );
  }

  // 3. Equipment personalized enhancements
  if (
    amuletoUpper.includes("CARBONO") ||
    amuletoUpper.includes("DOWEL") ||
    amuletoUpper.includes("CALLERA")
  ) {
    tips.push(
      "\ud83d\udd90\ufe0f **Pliegue Táctico en Calleras [CF-L4]**: El uso del pliegue táctico (*Dowel Effect*) de tus calleras de fibra de carbono optimiza la fricción y reduce drásticamente la fatiga prematura de tu agarre colgante.",
    );
  } else if (
    amuletoUpper.includes("HOOK") ||
    amuletoUpper.includes("TAPE") ||
    amuletoUpper.includes("ZANCADA")
  ) {
    tips.push(
      "\ud83c\udfcb\ufe0f **Soporte de Hook Grip [CF-L4]**: El tape elástico protege el tejido cutáneo de los pulgares, permitiendo tracciones intensas sin inhibición voluntaria por dolor focal.",
    );
  }

  if (
    grebasUpper.includes("RODILLERA") ||
    grebasUpper.includes("NEOPRENE") ||
    grebasUpper.includes("COMPRESIÓN") ||
    grebasUpper.includes("PLACA") ||
    grebasUpper.includes("BANQUETE") ||
    grebasUpper.includes("GLUCÓGENO")
  ) {
    tips.push(
      "\ud83e\uddb5 **Compresión de Neoprene [CF-L4]**: Las rodilleras de compresión de neoprene elevan la temperatura local, optimizando la viscosidad articular y la propiocepción durante la sentadilla profunda.",
    );
  }

  if (
    filtroUpper.includes("BEBIDA") ||
    filtroUpper.includes("RECONSTITUYENTE") ||
    filtroUpper.includes("RECUPERADOR") ||
    filtroUpper.includes("COCA") ||
    filtroUpper.includes("FR\u00cdA") ||
    filtroUpper.includes("AIRE") ||
    filtroUpper.includes("CARDI")
  ) {
    tips.push(
      "\ud83e\udd64 **Saturación de Glucógeno [CF-L4]**: Reposición sistemática de carbohidratos simples intra/post esfuerzo para catalizar inmediatamente la resíntesis de energía y optimizar la homeostasis.",
    );
  }

  // Default clinical guard
  if (tips.length === 0) {
    tips.push(
      "\u2695\ufe0f **Estímulo Óptimo Nexus L4**: Asegura el rango de completo movimiento (ROM). Controla el tempo excéntrico de cada repetición.",
    );
  }

  return tips;
}
```

## File: src/lib/constants.ts
```typescript
import React from "react";

// Brutalist vibrant background color bands mapping per week
export const WEEK_COLOR_MAPPING: Record<string, string> = {
  w1: "bg-neon-pink", // rosa
  w2: "bg-neon-orange", // naranja
  w3: "bg-neon-green", // verde
  w4: "bg-neon-cyan", // cian
};

// Complementary accent colors for blocks/highlights per week, in perfect sync with the center band
export const WEEK_ACCENT_COLORS: Record<string, { color: string; shadow: string }> = {
  w1: {
    color: "#00F0FF", // Cyan (Complement to Pink)
    shadow: "0 0 15px 2px rgba(0, 240, 255, 0.6)",
  },
  w2: {
    color: "#BD00FF", // Electric Purple (Complement to Yellow/Lime)
    shadow: "0 0 15px 2px rgba(189, 0, 255, 0.6)",
  },
  w3: {
    color: "#FF007F", // Neon Pink (Complement to Neon Green)
    shadow: "0 0 15px 2px rgba(255, 0, 127, 0.6)",
  },
  w4: {
    color: "#FF5A00", // Neon Orange (Complement to Neon Cyan)
    shadow: "0 0 15px 2px rgba(255, 90, 0, 0.6)",
  },
};

export const ACCENT_COLORS_MAP: Record<string, { color: string; shadow: string }> = {
  "electric-blue": {
    color: "#1F51FF",
    shadow: "0 0 15px 2px rgba(31, 81, 255, 0.6)",
  },
  "neon-green": {
    color: "#39FF14",
    shadow: "0 0 15px 2px rgba(57, 255, 20, 0.6)",
  },
  "royal-purple": {
    color: "#BD00FF",
    shadow: "0 0 15px 2px rgba(189, 0, 255, 0.6)",
  },
  "neon-pink": {
    color: "#FF007F",
    shadow: "0 0 15px 2px rgba(255, 0, 127, 0.6)",
  },
  "neon-orange": {
    color: "#FF5A00",
    shadow: "0 0 15px 2px rgba(255, 90, 0, 0.6)",
  },
  "neon-cyan": {
    color: "#00F0FF",
    shadow: "0 0 15px 2px rgba(0, 240, 255, 0.6)",
  },
};

// High-contrast, vibrant complementary colored bands in perfect dualistic balance with each week's glowing accent border
export const WEEK_MID_BAND_COLORS: Record<
  string,
  { bg: string; text: string; bgStyle: React.CSSProperties }
> = {
  w1: {
    bg: "#FF007F", // Vivid Neon Pink/Rose complementary to Cyan accent
    text: "#000000",
    bgStyle: { background: "linear-gradient(90deg, #FF007F 0%, #E11D48 100%)" },
  },
  w2: {
    bg: "#39FF14", // Vibrant Neon Lime complementary to Purple accent
    text: "#000000",
    bgStyle: { background: "linear-gradient(90deg, #39FF14 0%, #15B300 100%)" },
  },
  w3: {
    bg: "#00F0FF", // Electrifying Cyan complementary to Pink accent
    text: "#000000",
    bgStyle: { background: "linear-gradient(90deg, #00F0FF 0%, #0369A1 100%)" },
  },
  w4: {
    bg: "#BD00FF", // Royal Purple complementary to Orange accent
    text: "#ffffff",
    bgStyle: { background: "linear-gradient(90deg, #BD00FF 0%, #6D28D9 100%)" },
  },
};

// Helper to calculate the active program week dynamically based on the current date
export const getWeekOfProgram = (date: Date = new Date()) => {
  const oneJan = new Date(date.getFullYear(), 0, 1);
  const numberOfDays = Math.floor(
    (date.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000),
  );
  const weekOfYear = Math.ceil((date.getDay() + 1 + numberOfDays) / 7);
  const programWeekVal = ((weekOfYear - 1) % 4) + 1; // 1 to 4
  return `w${programWeekVal}`;
};

// --- DYNAMIC BRAND RESOLVER FOR BLOCKS AND PLANS ---
export const resolveBlockBrand = (
  tabName: string = "",
  blockTitle: string = "",
  items: string[] = [],
) => {
  const tabLower = tabName.toLowerCase();
  const titleLower = blockTitle.toLowerCase();
  const itemsText = items.join(" ").toLowerCase();

  // 1. Ateneo Haedo: Look for words like haedo, luk, lucas, balde, co-op con luk, soga, psoas, o fregar
  if (
    tabLower.includes("haedo") ||
    tabLower.includes("luk") ||
    titleLower.includes("haedo") ||
    itemsText.includes("haedo") ||
    itemsText.includes("lucas") ||
    itemsText.includes("balde")
  ) {
    return {
      name: "Ateneo Haedo 🪣",
      emblem: "🥤 ATENEO HAEDO",
      color: "#34D399", // Emerald
      border: "border-emerald-500/30",
      bg: "bg-emerald-950/30",
      text: "text-emerald-400",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      desc: "Postura e higiene espinal clínica. ¡Post-entreno de Coca-Cola helada con el gran Balde! 🥤",
    };
  }

  // 2. Mayhem Nation (Valentín / Team format): Look for words like san justo, valentin, sincro, equipo, chipper, team, mayhem, fiter
  if (
    tabLower.includes("san justo") ||
    tabLower.includes("justo") ||
    tabLower.includes("murph") ||
    titleLower.includes("sincro") ||
    titleLower.includes("equipo") ||
    titleLower.includes("san justo") ||
    itemsText.includes("sincro") ||
    itemsText.includes("valentín") ||
    itemsText.includes("san justo") ||
    itemsText.includes("mayhem") ||
    itemsText.includes("compañero") ||
    itemsText.includes("relevos")
  ) {
    return {
      name: "Mayhem Nation 🔥",
      emblem: "🔥 MAYHEM NATION",
      color: "#F97316", // Orange
      border: "border-orange-500/30",
      bg: "bg-orange-950/30",
      text: "text-orange-400",
      badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      desc: "Volumen competitivo y resiliencia cardíaca. Programación inspirada en Froning y Valentín.",
    };
  }

  // 3. HWPO Grind (Mat Fraser): Look for words like hwpo, grind, fraser, pesado, deadlift, rm, squat pesado, clean pulls, clean pesado
  if (
    tabLower.includes("grind") ||
    tabLower.includes("hwpo") ||
    titleLower.includes("grind") ||
    itemsText.includes("hwpo") ||
    itemsText.includes("fraser") ||
    itemsText.includes("pesado") ||
    itemsText.includes("deadlift") ||
    itemsText.includes("back squat") ||
    itemsText.includes("hipertrofia") ||
    itemsText.includes("forja de charsi") ||
    itemsText.includes("clean pull")
  ) {
    return {
      name: "HWPO Grind ⛓️",
      emblem: "⛓️ HWPO GRIND",
      color: "#EF4444", // Red
      border: "border-red-500/30",
      bg: "bg-red-950/30",
      text: "text-red-400",
      badgeColor: "bg-red-500/20 text-red-400 border-red-500/30",
      desc: "Grind implacable de Mat Fraser. Fuerza bruta acumulada y accesorios de alta tensión.",
    };
  }

  // 4. Default: PRVN Affiliate (Toomey's style of precision/intervals): Double unders, bar speed, intervals, precision
  return {
    name: "PRVN Affiliate 🧬",
    emblem: "🧬 PRVN PROTOCOL",
    color: "#06B6D4", // Cyan
    border: "border-cyan-500/30",
    bg: "bg-cyan-950/30",
    text: "text-cyan-400",
    badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    desc: "Metrónomo de intervalos de Tia-Clair Toomey. Velocidad pura de barra y gimnasia higiénica.",
  };
};

export const MASTER_ACHIEVEMENTS = [
  {
    id: "first_day",
    title: "Iniciación L4 ⚡",
    description:
      "Completaste tu primer misión diaria de entrenamiento físico en el pizarrón.",
    icon: "⚡",
    rarity: "COMÚN",
    color: "#00F0FF", // Electric Blue
  },
  {
    id: "five_days",
    title: "Espíritu Mayhem 🔥",
    description:
      "Has acumulado al menos 5 misiones completadas. El espíritu de Froning está contigo.",
    icon: "🔥",
    rarity: "RARO",
    color: "#FBBF24", // Amber
  },
  {
    id: "perfect_week",
    title: "Magnesio Puro 🏆",
    description:
      "Semana dorada perfecta: has completado los 7 días de entrenamiento técnico.",
    icon: "🏆",
    rarity: "ÉLITE",
    color: "#10B981", // Emerald
  },
  {
    id: "clinical_sec",
    title: "Misión Impecable 🧪",
    description:
      "Completaste una misión secundaria habilitando todas las validaciones clínicas L4 (ROM, BIO, RPE).",
    icon: "🧪",
    rarity: "ÉLITE",
    color: "#A78BFA", // Purple
  },
  {
    id: "fraser_grind",
    title: "Hijo de Fraser ⛓️",
    description:
      'Elegiste el perfil "HWPO Grind" o entrenaste con un nivel de auto-explicación técnica pesada (RPE >= 8.5).',
    icon: "⛓️",
    rarity: "LEYENDA",
    color: "#EF4444", // Red
  },
  {
    id: "adaptive_coke",
    title: "Cazador de Cocas 🥤",
    description:
      'Habilitaste el perfil adaptativo "Haedo" inspirado en Balde. ¡Salud postural y una Coca-Cola post-entreno!',
    icon: "🥤",
    rarity: "RARO",
    color: "#34D399", // Mint
  },
];
```

## File: src/lib/exportService.ts
```typescript
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { getAccessToken, googleSignIn } from "./firebase";
import { exportToGoogleSheets } from "./sheets";
import { WORKOUT_DATABASE } from "../data/workouts";
import { AthleteState, DayWorkout, DayVariation } from "../types/workout";

// --- TXT Export ---
export const handleMonthTextExport = () => {
  let fullText = "PROGRAMACIÓN COMPLETA - MES 1\n";
  fullText += "========================================================\n\n";

  const weeks = ["w1", "w2", "w3", "w4"];
  const weekNames = [
    "SEMANA 1 (ACUMULACIÓN)",
    "SEMANA 2 (INTENSIFICACIÓN)",
    "SEMANA 3 (PEAK WEEK)",
    "SEMANA 4 (DELOAD)",
  ];

  weeks.forEach((weekKey, wIdx) => {
    const weekPlan = WORKOUT_DATABASE[weekKey];
    if (!weekPlan) return;

    fullText += `### ${weekNames[wIdx]} ###\n\n`;

    weekPlan.days.forEach((day) => {
      fullText += `DÍA: ${day.name} - ${day.title}\n`;
      fullText += `--------------------------------------------------------\n`;

      day.variations.forEach((variation) => {
        if (day.hasTabs) {
          fullText += `\n>> VARIANTE: ${variation.tabName}\n\n`;
        }

        const blocks = [
          { name: "WARM-UP", data: variation.warmup },
          { name: "FUERZA", data: variation.strength },
          { name: "METCON", data: variation.metcon },
          { name: "ACCESORIOS", data: variation.accessories },
        ];

        blocks.forEach((block) => {
          if (
            block.data.items.length === 0 &&
            !block.data.title &&
            !block.data.scheme
          )
            return;
          fullText += `[${block.name}]\n`;
          if (block.data.title) fullText += `${block.data.title}\n`;
          if (block.data.scheme) fullText += `${block.data.scheme}\n`;
          block.data.items.forEach((item) => {
            const strippedItem = item.replace(/<[^>]*>?/gm, "");
            fullText += `- ${strippedItem}\n`;
          });
          fullText += `\n`;
        });
      });

      fullText += `\n========================================================\n\n`;
    });
  });

  const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "Programa_Mes_1_L4.txt");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// --- Google Sheets Export ---
export const handleExportGoogleSheets = async (
  setIsExportingSheets: (loading: boolean) => void
) => {
  setIsExportingSheets(true);
  try {
    let token = await getAccessToken();
    if (!token) {
      const authResult = await googleSignIn();
      if (authResult?.accessToken) {
        token = authResult.accessToken;
      } else {
        throw new Error("No se pudo obtener el token de acceso.");
      }
    }

    const telemetryRows = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("log_")) {
        try {
          const rowLogs = JSON.parse(localStorage.getItem(key) || "[]");
          if (Array.isArray(rowLogs)) telemetryRows.push(...rowLogs);
        } catch {
          // ignore
        }
      }
    }

    const sheetUrl = await exportToGoogleSheets(token, telemetryRows);
    alert(
      `Exportación exitosa. Puedes ver tu hoja de cálculo en:\n\n${sheetUrl}`
    );
  } catch (err: any) {
    alert(
      `Error al exportar a Google Sheets:\n${err.message || String(err)}`
    );
  } finally {
    setIsExportingSheets(false);
  }
};

// --- Statistics Compilation ---
export const getMonthlyVolumeStats = () => {
  const weeklyVolume: Record<string, number> = {
    w1: 0,
    w2: 0,
    w3: 0,
    w4: 0,
    w5: 0,
    w6: 0,
  };
  const weeklyCount: Record<string, number> = {
    w1: 0,
    w2: 0,
    w3: 0,
    w4: 0,
    w5: 0,
    w6: 0,
  };
  const weeklyRpeSum: Record<string, number> = {
    w1: 0,
    w2: 0,
    w3: 0,
    w4: 0,
    w5: 0,
    w6: 0,
  };
  const weeklyRpeCount: Record<string, number> = {
    w1: 0,
    w2: 0,
    w3: 0,
    w4: 0,
    w5: 0,
    w6: 0,
  };

  let totalVolume = 0;
  let totalLogsCount = 0;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("nexus_logs_")) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsedLogs = JSON.parse(raw);
          if (Array.isArray(parsedLogs) && parsedLogs.length > 0) {
            const parts = key.split("_");
            const dayId = parts[2] || "";
            const wkKey = dayId.substring(0, 2);

            if (wkKey && weeklyVolume[wkKey] !== undefined) {
              weeklyCount[wkKey]++;
              totalLogsCount++;

              parsedLogs.forEach((set) => {
                const wt = parseFloat(set.weight) || 0;
                const rp = parseFloat(set.reps) || 0;
                weeklyVolume[wkKey] += wt * rp;
                totalVolume += wt * rp;

                const rpVal = parseFloat(set.rpe);
                if (!isNaN(rpVal) && rpVal > 0) {
                  weeklyRpeSum[wkKey] += rpVal;
                  weeklyRpeCount[wkKey]++;
                }
              });
            }
          }
        }
      }
    }
  } catch (e) {
    console.error("Error calculating monthly stats:", e);
  }

  return {
    weeklyVolume,
    weeklyCount,
    weeklyRpeSum,
    weeklyRpeCount,
    totalVolume,
    totalLogsCount,
  };
};

// --- Weekly PDF Export ---
export const handleBatchPDFExport = (
  currentWeek: string,
  completedDays: Record<string, boolean>
) => {
  const activeWeekPlan = WORKOUT_DATABASE[currentWeek];
  if (!activeWeekPlan) return;

  const days = activeWeekPlan.days;
  const weekLabel =
    currentWeek === "w1"
      ? "ACUMULACIÓN"
      : currentWeek === "w2"
        ? "INTENSIFICACIÓN"
        : currentWeek === "w3"
          ? "PEAK WEEK / ÁPEX"
          : "DELOAD / DESCARGA";

  const targetRpe =
    currentWeek === "w1"
      ? "RPE 6 - 7"
      : currentWeek === "w2"
        ? "RPE 7 - 8"
        : currentWeek === "w3"
          ? "RPE 8 - 9"
          : "RPE 6 (MÁXIMA CALIDAD)";

  const weeklyData: any[] = [];
  let grandTotalSets = 0;
  let rpeCountMap: Record<number, number> = { 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 };
  let totalRpeSum = 0;
  let totalRpeCount = 0;

  days.forEach((day) => {
    const dayId = day.id;
    const dayLogsForThisDay: any[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`nexus_logs_${dayId}_`)) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const exerciseName = key
                .substring(`nexus_logs_${dayId}_`.length)
                .replace(/_/g, " ");
              dayLogsForThisDay.push({
                exerciseName,
                sets: parsed,
              });

              parsed.forEach((set: any) => {
                grandTotalSets++;
                const val = parseFloat(set.rpe);
                if (!isNaN(val) && val > 0) {
                  totalRpeSum += val;
                  totalRpeCount++;
                  const rounded = Math.min(10, Math.max(6, Math.round(val)));
                  rpeCountMap[rounded] = (rpeCountMap[rounded] || 0) + 1;
                }
              });
            }
          }
        } catch {
          // ignore
        }
      }
    }

    weeklyData.push({
      dayCode: dayId,
      dayName: day.name,
      isCompleted: !!completedDays[dayId],
      logs: dayLogsForThisDay,
      originalDayData: day,
    });
  });

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const BRAND_BLUE = [31, 81, 255];
  const BLACK_DARK = [14, 14, 17];
  const GRAY_TEXT = [100, 110, 120];

  let currentY = 15;

  doc.setFillColor(BLACK_DARK[0], BLACK_DARK[1], BLACK_DARK[2]);
  doc.rect(10, currentY, 190, 30, "F");

  doc.setDrawColor(BRAND_BLUE[0], BRAND_BLUE[1], BRAND_BLUE[2]);
  doc.setLineWidth(1.2);
  doc.line(10, currentY + 30, 200, currentY + 30);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text("REPORTE SEMANAL", 15, currentY + 11);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  doc.text(
    `NEXUS L4 // MACROCICLO INDIVIDUALIZADO // ${currentWeek.toUpperCase()}`,
    15,
    currentY + 17
  );

  doc.setFontSize(8);
  doc.setTextColor(GRAY_TEXT[0], GRAY_TEXT[1], GRAY_TEXT[2]);
  doc.text(
    `FECHA: ${new Date().toLocaleDateString()}  SISTEMA DE AUDIO CLÍNICO: ACTIVO`,
    15,
    currentY + 23
  );

  doc.setFillColor(25, 25, 30);
  doc.rect(10, currentY + 34, 190, 22, "F");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(31, 81, 255);
  doc.text("MÉTRICAS CLAVE DE CONTROL PARA EL COACH", 15, currentY + 41);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`Bloque de Carga Semana: ${weekLabel}`, 15, currentY + 47);
  doc.text(
    `Series Totales Ejecutadas: ${grandTotalSets}  -  Objetivo del Microciclo: ${targetRpe}`,
    15,
    currentY + 52
  );

  const avgRpe = totalRpeCount > 0 ? totalRpeSum / totalRpeCount : 0;
  doc.setFont("Helvetica", "bold");
  doc.text(
    `RPE Promedio de Trabajo: ${avgRpe > 0 ? `${avgRpe.toFixed(1)} / 10` : "SIN DATOS"}`,
    120,
    currentY + 47
  );

  currentY += 62;

  weeklyData.forEach((dayData) => {
    if (currentY > 260) {
      doc.addPage();
      currentY = 15;
    }

    doc.setFillColor(35, 35, 45);
    doc.rect(10, currentY, 190, 8, "F");

    doc.setDrawColor(dayData.isCompleted ? 16 : 220, dayData.isCompleted ? 185 : 53, dayData.isCompleted ? 129 : 69);
    doc.setLineWidth(0.6);
    doc.rect(10, currentY, 190, 8);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);

    const checkmarkMarker = dayData.isCompleted ? "[ COMPLETO ] " : "[ PENDIENTE ] ";
    doc.text(`${checkmarkMarker}${dayData.dayName} - ${dayData.originalDayData.title}`, 14, currentY + 5.5);

    currentY += 12;

    if (dayData.logs.length === 0) {
      doc.setFont("Helvetica", "oblique");
      doc.setFontSize(8);
      doc.setTextColor(GRAY_TEXT[0], GRAY_TEXT[1], GRAY_TEXT[2]);
      doc.text("No se encontraron registros de telemetría de cargas para este día.", 15, currentY);
      currentY += 8;
    } else {
      dayData.logs.forEach((logItem: any) => {
        if (currentY > 270) {
          doc.addPage();
          currentY = 15;
        }

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(255, 255, 255);
        doc.text(logItem.exerciseName.toUpperCase(), 15, currentY);
        currentY += 4.5;

        let seriesText = "";
        logItem.sets.forEach((set: any, sIdx: number) => {
          const formattedWeight = set.weight ? `${set.weight}kg` : "P.C.";
          seriesText += `S${sIdx + 1}: ${formattedWeight} x ${set.reps} @ RPE ${set.rpe} `;
          if (set.rir && set.rir !== "N/D") seriesText += `[RIR ${set.rir}]`;
          seriesText += "   ";
        });

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(160, 160, 170);
        doc.text(seriesText, 17, currentY);
        currentY += 7;
      });
    }
  });

  doc.save(`Nexus_L4_Reporte_${currentWeek.toUpperCase()}_v1.pdf`);
};

// --- Monthly PDF Consolidate ---
export const handleGenerateMonthlyReportPDF = (athlete: AthleteState) => {
  const stats = getMonthlyVolumeStats();
  const baselineRpes: Record<string, number> = {
    w1: 6.7,
    w2: 7.3,
    w3: 8.1,
    w4: 5.7,
  };
  const scheduledRpeTargets: Record<string, number> = {
    w1: 6.5,
    w2: 7.5,
    w3: 8.5,
    w4: 5.5,
  };
  const weekLabels: Record<string, string> = {
    w1: "Acumulación Técnica (Semana 1)",
    w2: "Intensificación Neural (Semana 2)",
    w3: "Pico / Boss Fight (Semana 3)",
    w4: "Descarga / Regeneración (Semana 4)",
  };

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const BRAND_BLUE = [31, 81, 255];
  const TECH_CYAN = [0, 240, 255];
  const BLACK_DARK = [14, 14, 17];

  let currentY = 15;

  doc.setFillColor(BLACK_DARK[0], BLACK_DARK[1], BLACK_DARK[2]);
  doc.rect(10, currentY, 190, 32, "F");

  doc.setDrawColor(BRAND_BLUE[0], BRAND_BLUE[1], BRAND_BLUE[2]);
  doc.setLineWidth(1.2);
  doc.line(10, currentY + 32, 200, currentY + 32);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("CONSOLIDADO DE RENDIMIENTO MENSUAL - NEXUS L4", 15, currentY + 11);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(TECH_CYAN[0], TECH_CYAN[1], TECH_CYAN[2]);
  doc.text("ESTADÍSTICAS GLOBALES DEL MACROCICLO DE ENTRENAMIENTO", 15, currentY + 17);

  doc.setFontSize(7.5);
  doc.setTextColor(150, 150, 160);
  doc.text(`ATLETA: ${athlete.identity.toUpperCase()}  -  RESTRICCIÓN PRE-PROGRAMADA: ${athlete.restriction}`, 15, currentY + 23);
  doc.text(`NIVEL REGISTRADO: ${athlete.level}  -  SISTEMA ESTADÍSTICO DE CARGAS: ACTIVO`, 15, currentY + 28);

  currentY += 38;

  doc.setFillColor(25, 25, 30);
  doc.rect(10, currentY, 190, 30, "F");
  doc.setDrawColor(80, 80, 95);
  doc.setLineWidth(0.3);
  doc.rect(10, currentY, 190, 30);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("MÉTRICAS CLAVE CONSOLIDADAS DEL MES", 15, currentY + 7);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Volumen Acumulado Total (Carga x Reps): ${stats.totalVolume.toLocaleString()} kg`, 15, currentY + 14);
  doc.text(`Ejercicios Totales con Telemetría Registrada: ${stats.totalLogsCount} movimientos`, 15, currentY + 20);

  const activeWeeks = Object.keys(stats.weeklyCount).filter((k) => stats.weeklyCount[k] > 0);
  const avgSessionPerWeek = activeWeeks.length > 0 ? (stats.totalLogsCount / activeWeeks.length).toFixed(1) : "0.0";
  doc.text(`Frecuencia de Sesiones Loggeadas: ~${avgSessionPerWeek} por semana activa`, 15, currentY + 26);

  currentY += 36;

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(31, 81, 255);
  doc.text("ANÁLISIS COMPARATIVO DE VOLUMEN DE CARGA COMPLETO", 10, currentY);
  currentY += 5;

  const tableHeaderY = currentY;
  doc.setFillColor(35, 35, 45);
  doc.rect(10, tableHeaderY, 190, 8, "F");
  doc.rect(10, tableHeaderY, 190, 8);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("Microciclo (Semana)", 13, tableHeaderY + 5.5);
  doc.text("Movimientos Loggeados", 70, tableHeaderY + 5.5);
  doc.text("Volumen Semanal (kg)", 115, tableHeaderY + 5.5);
  doc.text("RPE Promedio", 160, tableHeaderY + 5.5);

  currentY += 8;

  const wks = ["w1", "w2", "w3", "w4"];
  wks.forEach((wk) => {
    doc.rect(10, currentY, 190, 10);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);

    doc.text(weekLabels[wk] || wk.toUpperCase(), 13, currentY + 6.5);
    doc.text(`${stats.weeklyCount[wk]} sets`, 70, currentY + 6.5);
    doc.text(`${stats.weeklyVolume[wk]?.toLocaleString() || "0"} kg`, 115, currentY + 6.5);

    const rpeAvg = stats.weeklyRpeCount[wk] > 0 ? stats.weeklyRpeSum[wk] / stats.weeklyRpeCount[wk] : 0;
    doc.setFont("Helvetica", "bold");
    if (rpeAvg > 0) {
      doc.text(`${rpeAvg.toFixed(1)} / 10`, 160, currentY + 6.5);
    } else {
      doc.text("N/D", 160, currentY + 6.5);
    }
    currentY += 10;
  });

  currentY += 10;

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(31, 81, 255);
  doc.text("AUDITORÍA DE PRECISIÓN DE INTENSIDAD (RPE vs. DESIGN TARGET)", 10, currentY);
  currentY += 5;

  doc.setFillColor(35, 35, 45);
  doc.rect(10, currentY, 190, 8, "F");
  doc.rect(10, currentY, 190, 8);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("Fase", 13, currentY + 5.5);
  doc.text("Target Programado", 70, currentY + 5.5);
  doc.text("Promedio Registrado", 115, currentY + 5.5);
  doc.text("Desviación Biomecánica", 160, currentY + 5.5);

  currentY += 8;

  wks.forEach((wk) => {
    doc.rect(10, currentY, 190, 10);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);

    doc.text(wk.toUpperCase(), 13, currentY + 6.5);
    const target = scheduledRpeTargets[wk] || 0;
    doc.text(`${target.toFixed(1)} @ RPE`, 70, currentY + 6.5);

    const realAvg = stats.weeklyRpeCount[wk] > 0 ? stats.weeklyRpeSum[wk] / stats.weeklyRpeCount[wk] : 0;
    if (realAvg > 0) {
      doc.text(`${realAvg.toFixed(2)} @ RPE`, 115, currentY + 6.5);
      const diff = realAvg - target;
      doc.setFont("Helvetica", "bold");
      if (Math.abs(diff) <= 0.5) {
        doc.setTextColor(16, 185, 129);
        doc.text(`${diff > 0 ? "+" : ""}${diff.toFixed(2)} (PRECISIÓN ALTA)`, 160, currentY + 6.5);
      } else {
        doc.setTextColor(239, 68, 68);
        doc.text(`${diff > 0 ? "+" : ""}${diff.toFixed(2)} (SOBRESTREZ L4)`, 160, currentY + 6.5);
      }
    } else {
      doc.text("SIN REGISTROS", 115, currentY + 6.5);
      doc.text("N/D", 160, currentY + 6.5);
    }
    currentY += 10;
  });

  currentY += 12;

  doc.setFillColor(15, 23, 42);
  doc.rect(10, currentY, 190, 30, "F");
  doc.setDrawColor(31, 81, 255);
  doc.setLineWidth(0.5);
  doc.rect(10, currentY, 190, 30);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(TECH_CYAN[0], TECH_CYAN[1], TECH_CYAN[2]);
  doc.text("VEREDICTO CLÍNICO RECOMENDADO POR EL HEAD COACH (CF-L4)", 15, currentY + 7);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);

  let recommendationLine1 = "Mantener control postural estricto. Monitorear lumbares en la transición de cadera.";
  let recommendationLine2 = "El balance de acumulado e intensidad es excelente. Continuar registrando RPE.";

  const peakRpeAvg = stats.weeklyRpeCount["w3"] > 0 ? stats.weeklyRpeSum["w3"] / stats.weeklyRpeCount["w3"] : 0;
  if (peakRpeAvg > 9.0) {
    recommendationLine1 = "¡ALERTA SNC! El promedio de RPE en Peak Week indica fatiga sistémica acumulada.";
    recommendationLine2 = "Acción: Extender la fase de deload de la semana 4, RPE estricto < 6.0.";
  }

  doc.text(recommendationLine1, 15, currentY + 14);
  doc.text(recommendationLine2, 15, currentY + 20);
  doc.text("Firmado mecánicamente: Nexus L4 Clinical Advisory Suite  -  Consigo un café frío para balance de glucógeno.", 15, currentY + 26);

  doc.save(`Consolidado_Mensual_L4_${athlete.identity.toUpperCase().replace(/\s+/g, "_")}.pdf`);
};

// --- Daily JPG Export ---
export const handleExportDayJPG = (
  activeDay: DayWorkout,
  activeVariation: DayVariation,
  currentWeek: string,
  setIsExportingJPG: (loading: boolean) => void
) => {
  setIsExportingJPG(true);

  setTimeout(() => {
    const node = document.getElementById("nexus-share-card-temp");
    if (!node) {
      alert("Error: No se pudo encontrar la plantilla de exportación.");
      setIsExportingJPG(false);
      return;
    }

    toPng(node, {
      quality: 1.0,
      backgroundColor: "#f8fafc",
      width: 1080,
      height: 1920,
      style: {
        transform: "scale(1)",
        transformOrigin: "top left",
        width: "1080px",
        height: "1920px",
      },
    })
      .then(async (dataUrl) => {
        setIsExportingJPG(false);
        const safeDayName = activeDay.name.toLowerCase();
        const safeTitleName = activeDay.title
          .trim()
          .replace(/[^a-zA-Z0-9_\-]/g, "_");
        const filename = `Nexus_L4_${currentWeek.toUpperCase()}_${safeDayName}_${safeTitleName}.jpg`;

        if (navigator.share) {
          try {
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const file = new File([blob], filename, { type: "image/jpeg" });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: `Nexus L4 - ${activeDay.title}`,
                text: `¡Mi sesión de hoy en Nexus L4!\nProgreso: ${activeDay.title}`,
                files: [file],
              });
              return;
            }
          } catch (error) {
            console.log("Web Share API error, falling back to download:", error);
          }
        }

        const link = document.createElement("a");
        link.download = filename;
        link.href = dataUrl;
        link.click();
      })
      .catch((error) => {
        console.error("Oops, something went wrong with JPG generation!", error);
        setIsExportingJPG(false);
      });
  }, 300);
};

// --- Telemetry Backup JSON ---
export const handleExportLocalHistory = () => {
  try {
    const backupData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("nexus_logs_")) {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            backupData[key] = JSON.parse(value);
          } catch {
            backupData[key] = value;
          }
        }
      }
    }

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nexus_l4_logs_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Error exporting local history:", err);
  }
};

// --- Telemetry backup CSV ---
export const handleExportLocalHistoryCSV = () => {
  try {
    let csvContent = "\uFEFFSemana,Día,Ejercicio,Serie,Peso,Reps,RPE,RIR,Fecha\n";
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("nexus_logs_")) {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            const logs = JSON.parse(value);
            if (Array.isArray(logs)) {
              const parts = key.split("_");
              const dayIdStr = parts[2] || "";
              let semanaStr = "";
              let diaStr = "";
              if (dayIdStr.length >= 4) {
                semanaStr = dayIdStr.substring(0, 2).toUpperCase();
                diaStr = dayIdStr.substring(2).toUpperCase();
              } else {
                diaStr = dayIdStr;
              }

              const exerciseName = parts
                .slice(3)
                .join(" ")
                .replace(/"/g, '""');

              logs.forEach((log: any, index: number) => {
                const peso = (log.weight || "").replace(/"/g, '""');
                const reps = (log.reps || "").replace(/"/g, '""');
                const rpe = (log.rpe || "").replace(/"/g, '""');
                const rir = (log.rir || "").replace(/"/g, '""');
                let dateStr = "";
                if (log.timestamp) {
                  const d = new Date(log.timestamp);
                  dateStr = d.toLocaleDateString() + " " + d.toLocaleTimeString();
                }

                csvContent += `"${semanaStr}","${diaStr}","${exerciseName}","${index + 1}","${peso}","${reps}","${rpe}","${rir}","${dateStr}"\n`;
              });
            }
          } catch {
            // Ignore non-json
          }
        }
      }
    }
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Nexus_L4_Telemetria_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Error al exportar CSV:", err);
    alert("Error al intentar exportar la telemetría CSV.");
  }
};
```

## File: src/lib/firebase.ts
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, getFirestore } from 'firebase/firestore';
const firebaseConfig = { projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID, appId: import.meta.env.VITE_FIREBASE_APP_ID, apiKey: import.meta.env.VITE_FIREBASE_API_KEY, authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID };

const app = initializeApp(firebaseConfig);

let dbInstance: any;
try {
  dbInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  }, (firebaseConfig as any).firestoreDatabaseId);
} catch (e) {
  console.warn("Failed to initialize Firestore with persistent local cache; falling back to memory/default cache:", e);
  dbInstance = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
}

export const db = dbInstance;
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Request Workspace scopes
googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');

// Cache the access token in memory.
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // If we don't have token but user is logged in, they might need to re-authenticate
        // to get the token for Sheets, or we might not need it until they click export.
        cachedAccessToken = null; 
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    // credential?.accessToken might be null if not granted, but usually is there
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
    }
    return { user: result.user, accessToken: cachedAccessToken || '' };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

```

## File: src/lib/historyUtils.ts
```typescript
import { WORKOUT_DATABASE } from "../data/workouts";

// Extract a clean name for query and display
export const getCleanExerciseName = (itemText: string): string => {
  let cleaned = itemText.replace(/<[^>]*>/g, "").trim();

  // Strip reps and times at the start of the item (e.g. "15 Box Step-overs", "Min 1: 8 Deadlifts", "4x4 ")
  cleaned = cleaned.replace(
    /^(Min\s+\d+:\s*)?\d+(\/\d+)?\s*(cal|calorie|calories|reps|repeticiones|m|crossovers)?\s+/i,
    "",
  );

  // Strip parenthesized text if it is long (e.g. instructions/cues) or contains weight indicators like "barra" or "kg"
  cleaned = cleaned.replace(/\s*\([^)]+barra[^)]*\)/i, "");
  cleaned = cleaned.replace(/\s*\([^)]+kg[^)]*\)/i, "");
  cleaned = cleaned.replace(/\s*@\s*[\d%-]+(\s*\(.*\))?/gi, "");
  cleaned = cleaned.replace(/\s*\([\d%-]+kg\)/gi, "");
  cleaned = cleaned.replace(/\s*\([^)]{15,}\)/g, ""); // strip parentheses with 15+ characters

  return cleaned.trim();
};

interface StoredSet {
  weight?: string;
  reps?: string;
  rpe?: string;
  rir?: string;
  timestamp?: number;
}

interface HistorySession {
  dayId: string;
  dayName: string;
  weekNum: number;
  sets: {
    weight: string;
    reps: string;
    rpe: string;
    rir?: string;
    timestamp: number;
  }[];
}

// Helper to extract last 5 sessions from localStorage logs
export const getExerciseHistory = (rawItem: string): HistorySession[] => {
  const sessions: HistorySession[] = [];
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return [];
    }

    const cleanItem = getCleanExerciseName(rawItem);
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const itemNorm = normalize(cleanItem);

    if (!itemNorm) return [];

    const storageLength = localStorage.length;
    for (let i = 0; i < storageLength; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("nexus_logs_")) {
        const parts = key.split("_");
        if (parts.length >= 4) {
          const dayId = parts[2]; // e.g. "w2d2"
          const storedExerciseName = parts.slice(3).join(" "); // e.g. "Deadlift Tradicional"

          const keyNorm = normalize(storedExerciseName);

          if (
            keyNorm &&
            (itemNorm.includes(keyNorm) || keyNorm.includes(itemNorm))
          ) {
            try {
              const raw = localStorage.getItem(key);
              if (raw) {
                const sets: StoredSet[] = JSON.parse(raw);
                if (Array.isArray(sets) && sets.length > 0) {
                  const weekNum = parseInt(dayId.substring(1, 2), 10) || 1;
                  const dNum = dayId.substring(3);
                  let dayName = `W${weekNum}D${dNum}`;

                  const weekPlan = WORKOUT_DATABASE[`w${weekNum}`];
                  if (weekPlan) {
                    const dObj = weekPlan.days.find((d) => d.id === dayId);
                    if (dObj) {
                      dayName = `S${weekNum} - ${dObj.name}`;
                    }
                  }

                  sessions.push({
                    dayId,
                    dayName,
                    weekNum,
                    sets: sets.map((s) => ({
                      weight: s.weight || "",
                      reps: s.reps || "",
                      rpe: s.rpe || "",
                      rir: s.rir || "",
                      timestamp: s.timestamp || 0,
                    })),
                  });
                }
              }
            } catch (e) {
              // ignore
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn("localStorage restricted inside current browsing sandbox:", err);
    return [];
  }

  // Sort by latest session's newest set timestamp
  try {
    sessions.sort((a, b) => {
      const aMaxTime = Math.max(...a.sets.map((s) => s.timestamp), 0);
      const bMaxTime = Math.max(...b.sets.map((s) => s.timestamp), 0);
      return bMaxTime - aMaxTime; // Newest first
    });
  } catch (e) {
    // ignore sort failures
  }

  return sessions.slice(0, 5);
};
```

## File: src/lib/protocolParser.ts
```typescript
/**
 * Advanced Protocol Parser for PRVN, Mayhem & HWPO schemes.
 * Converts natural-language workout schemes (e.g. "Every 2:30", "Tabata", "AMRAP")
 * into actionable intervals and timers.
 */
export function parseProtocol(title: string, scheme: string, blockName: string = "") {
  const combinedStr = `${blockName} ${title} ${scheme}`.toUpperCase();

  // Attempt to parse Time Caps first to use globally where relevant
  let capWorkSeconds = 0;
  const timeCapAfterMatch = combinedStr.match(
    /(?:TIME\s*CAP|CAP)\s*(\d+)(?::(\d+))?/i,
  );
  if (timeCapAfterMatch) {
    const mins = parseInt(timeCapAfterMatch[1], 10);
    const secs = timeCapAfterMatch[2] ? parseInt(timeCapAfterMatch[2], 10) : 0;
    capWorkSeconds = mins * 60 + secs;
  } else {
    const timeCapBeforeMatch = combinedStr.match(
      /(\d+)(?::(\d+))?\s*(?:MIN|MINUTOS|M)?\s*CAP/i,
    );
    if (timeCapBeforeMatch) {
      const mins = parseInt(timeCapBeforeMatch[1], 10);
      const secs = timeCapBeforeMatch[2]
        ? parseInt(timeCapBeforeMatch[2], 10)
        : 0;
      capWorkSeconds = mins * 60 + secs;
    }
  }

  // 0. Warmup fixed protocol: default 10 minutes max completion, 1:30 min rest. Can be overridden by cap.
  if (
    combinedStr.includes("WARM-UP") ||
    combinedStr.includes("WARMUP") ||
    combinedStr.includes("CALENTAMIENTO") ||
    combinedStr.includes("ENTRADITA")
  ) {
    return {
      type: "INTERVAL",
      name: "PUESTA A PUNTO L4",
      work: capWorkSeconds > 0 ? capWorkSeconds : 600,
      rest: 90, // 1:30 rest to set up the next block
      rounds: 1,
    };
  }

  // 1. Tabata match
  if (combinedStr.includes("TABATA")) {
    return {
      type: "INTERVAL",
      name: "TABATA (CARIOCAS)",
      work: 20,
      rest: 10,
      rounds: 8,
    };
  }

  // 2. Work/Rest Intervals match: e.g. "4 MIN ON / 1 MIN OFF X 4 RONDAS" or "40" ON / 20" OFF x 8"
  // Supports minutes (MIN, M) and seconds (S, SEG, ")
  const onOffMatch = combinedStr.match(
    /(\d+)\s*(MIN|M|S|SEG|'')?\s*ON\s*\/\s*(\d+)\s*(MIN|M|S|SEG|'')?\s*OFF/i,
  );
  if (onOffMatch) {
    const workVal = parseInt(onOffMatch[1], 10);
    const workUnit = onOffMatch[2] || "MIN";
    const workIsSeconds = ["S", "SEG", "''"].some((u) =>
      workUnit.startsWith(u),
    );
    const workSeconds = workIsSeconds ? workVal : workVal * 60;

    const restVal = parseInt(onOffMatch[3], 10);
    const restUnit = onOffMatch[4] || "MIN";
    const restIsSeconds = ["S", "SEG", "''"].some((u) =>
      restUnit.startsWith(u),
    );
    const restSeconds = restIsSeconds ? restVal : restVal * 60;

    // Detect rounds
    const roundMatch =
      combinedStr.match(
        /(?:X|\*)\s*(\d+)\s*(?:RONDAS|SERIES|RNDS|SETS|ROUND|VUELTAS)?/i,
      ) ||
      combinedStr.match(/(\d+)\s*(?:RONDAS|SERIES|RNDS|SETS|ROUNDS|VUELTAS)/i);
    const rounds = roundMatch ? parseInt(roundMatch[1], 10) : 4;

    return {
      type: "INTERVAL",
      name: "INTERVALOS",
      work: workSeconds,
      rest: restSeconds,
      rounds: rounds,
    };
  }

  // 3. EMOM / E2MOM matches (e.g., E2MOM x 6, EMOM 15 MIN, EVERY 1:30 X 10)
  // Check special EOMOM/E2MOM
  const exmomMatch = combinedStr.match(/E(\d+)(MOM|S)\s*(?:X\s*(\d+))?/i);
  if (exmomMatch) {
    const value = parseInt(exmomMatch[1], 10);
    const unit = exmomMatch[2].toUpperCase();
    const isSeconds = unit === "S";
    const interval = isSeconds ? value : value * 60;

    const roundsMatch =
      combinedStr.match(/(?:X|\*)\s*(\d+)/) ||
      combinedStr.match(/(\d+)\s*(?:RONDAS|SERIES|SETS|ROUNDS)/);
    const rounds = roundsMatch
      ? parseInt(roundsMatch[1], 10)
      : isSeconds
        ? 8
        : 10;

    return {
      type: "EMOM",
      name: `E${value}${unit}`,
      work: interval,
      rest: 0,
      rounds: rounds,
    };
  }

  // EVERY MM:SS or EVERY X MIN
  const everyMatch = combinedStr.match(
    /EVERY\s*(\d+)(?::(\d+))?\s*(MIN|M|S|SEG)?\s*(?:X\s*(\d+))?/i,
  );
  if (everyMatch) {
    let interval = 60;
    if (everyMatch[2]) {
      // MM:SS pattern (e.g., EVERY 2:30)
      const m = parseInt(everyMatch[1], 10);
      const s = parseInt(everyMatch[2], 10);
      interval = m * 60 + s;
    } else {
      const val = parseInt(everyMatch[1], 10);
      const unit = everyMatch[3] || "MIN";
      const isSeconds = ["S", "SEG"].some((u) => unit.startsWith(u));
      interval = isSeconds ? val : val * 60;
    }

    const rounds = everyMatch[4] ? parseInt(everyMatch[4], 10) : 6;
    return {
      type: "EMOM",
      name: "EVERY BLOCK",
      work: interval,
      rest: 0,
      rounds: rounds,
    };
  }

  // Common EMOM (e.g. EMOM 15 MIN)
  const emomMatch = combinedStr.match(/EMOM\s*(\d+)/i);
  if (emomMatch) {
    const mins = parseInt(emomMatch[1], 10);
    return {
      type: "EMOM",
      name: "EMOM",
      work: 60,
      rest: 0,
      rounds: mins,
    };
  }

  // 4. Time CAPS (e.g., CAP 8:00, CAP 15MIN, TIME CAP 20, 15 MIN CAP, 10 MIN CAP)
  if (capWorkSeconds > 0) {
    return {
      type: "AMRAP",
      name: "FOR TIME (A CAP)",
      work: capWorkSeconds,
      rest: 0,
      rounds: 1,
    };
  }

  const amrapMatch =
    combinedStr.match(/AMRAP\s*(\d+)/i) ||
    combinedStr.match(/(\d+)\s*MINUTOS/i) ||
    combinedStr.match(/(\d+)\s*MIN\s*AMRAP/i);
  if (amrapMatch) {
    const mins = parseInt(amrapMatch[1], 10);
    return {
      type: "AMRAP",
      name: "AMRAP",
      work: mins * 60,
      rest: 0,
      rounds: 1,
    };
  }

  // 5. Explicit strength rest tags: REST 90S, REST 2MIN, REST 2:30
  const restMatch =
    combinedStr.match(/REST\s*(\d+)\s*S/i) ||
    combinedStr.match(/REST\s*(\d+)\s*(?:SEGUNDOS|SEG)?/i);
  if (restMatch) {
    const roundMatch =
      combinedStr.match(
        /(\d+)\s*(?:RONDAS|SERIES|RNDS|SETS|ROUNDS|VUELTAS)/i,
      ) || combinedStr.match(/(?:X|\*)\s*(\d+)/i);
    const r = roundMatch ? parseInt(roundMatch[1], 10) : 4;
    return {
      type: "STRENGTH",
      name: "TRABAJO Y DESCANSO",
      work: 120, // 2:00 minutes of execution window per set
      rest: parseInt(restMatch[1], 10),
      rounds: r,
    };
  }

  const restMinMatch =
    combinedStr.match(/REST\s*(\d+)\s*(?:MIN|MINUTOS)/i) ||
    combinedStr.match(/REST\s*(\d+)[:.](\d+)/i);
  if (restMinMatch) {
    const mins = parseInt(restMinMatch[1], 10);
    const secs = restMinMatch[2] ? parseInt(restMinMatch[2], 10) : 0;
    const roundMatch =
      combinedStr.match(
        /(\d+)\s*(?:RONDAS|SERIES|RNDS|SETS|ROUNDS|VUELTAS)/i,
      ) || combinedStr.match(/(?:X|\*)\s*(\d+)/i);
    const r = roundMatch ? parseInt(roundMatch[1], 10) : 4;
    return {
      type: "STRENGTH",
      name: "TRABAJO Y DESCANSO",
      work: 120, // 2:00 minutes of execution window per set
      rest: mins * 60 + secs,
      rounds: r,
    };
  }

  // 6. Generic Rounds match (e.g., 3 RONDAS, 4 SERIES - default rest indicator)
  const generalRoundsMatch = combinedStr.match(
    /(\d+)\s*(?:RONDAS|SERIES|SETS|VUELTAS)/i,
  );
  if (generalRoundsMatch) {
    const r = parseInt(generalRoundsMatch[1], 10);
    return {
      type: "STRENGTH",
      name: "FUERZA RECOMENDADA",
      work: 120, // 2:00 minutes of execution window per set
      rest: 90,
      rounds: r,
    };
  }

  if (combinedStr.includes("FOR TIME") || combinedStr.includes("POR TIEMPO")) {
    return {
      type: "FOR_TIME",
      name: "POR TIEMPO",
      work: 0,
      rest: 0,
      rounds: 1,
    };
  }

  if (combinedStr.includes("FUERZA") || combinedStr.includes("%")) {
    const roundMatch =
      combinedStr.match(
        /(\d+)\s*(?:RONDAS|SERIES|RNDS|SETS|ROUNDS|VUELTAS)/i,
      ) || combinedStr.match(/(?:X|\*)\s*(\d+)/i);
    const r = roundMatch ? parseInt(roundMatch[1], 10) : 4;
    return {
      type: "STRENGTH",
      name: "FUERZA RECOMENDADA",
      work: 120, // 2:00 minutes of execution window per set
      rest: 90,
      rounds: r,
    };
  }

  // Fallback defaults
  return {
    type: "NORMAL",
    name: "TEMPORIZADOR LIBRE",
    work: 0,
    rest: 60,
    rounds: 1,
  };
}
```

## File: src/lib/sheets.ts
```typescript
import { WORKOUT_DATABASE } from '../data/workouts';

export async function exportToGoogleSheets(accessToken: string, athleteLogs: any[]): Promise<string> {
  const STORED_SHEET_ID_KEY = 'l4_sheets_id';
  let spreadsheetId = localStorage.getItem(STORED_SHEET_ID_KEY);

  // 1. Check if we need to create a new spreadsheet
  if (!spreadsheetId) {
    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          title: `L4 Programación & Resultados (${new Date().toLocaleDateString()})`
        },
        sheets: [
          { properties: { title: "Programa" } },
          { properties: { title: "Resultados_y_RPE" } }
        ]
      })
    });
    
    if (!createRes.ok) {
      throw new Error("Failed to create Google Sheet: " + (await createRes.text()));
    }
    
    const spreadsheet = await createRes.json();
    spreadsheetId = spreadsheet.spreadsheetId;
    if (spreadsheetId) {
      localStorage.setItem(STORED_SHEET_ID_KEY, spreadsheetId);
    } else {
      throw new Error("Invalid spreadsheet ID received");
    }
  }

  // 2. Build Program Data (Programa)
  const programRows: string[][] = [
    ["Semana", "Día", "Variante", "Bloque", "Actividad", "Tiempo/Cap"]
  ];

  const weeks = Object.keys(WORKOUT_DATABASE);
  weeks.forEach(weekKey => {
    const weekPlan = WORKOUT_DATABASE[weekKey];
    weekPlan.days.forEach((day: any) => {
      day.variations.forEach((variation: any) => {
        const blocks = [
          { name: 'WARM-UP', obj: variation.warmup },
          { name: 'FUERZA', obj: variation.strength },
          { name: 'METCON', obj: variation.metcon },
          { name: 'ACCESORIOS', obj: variation.accessories },
        ];
        
        blocks.forEach(b => {
          if (b.obj.items.length > 0 || b.obj.title || b.obj.scheme) {
             let combinedItems = b.obj.items.map((i: string) => i.replace(/<[^>]*>?/gm, '')).join(' | ');
             programRows.push([
               weekKey.toUpperCase(),
               day.name || '',
               variation.tabName || '',
               b.name,
               (b.obj.title || '') + (combinedItems ? ' - ' + combinedItems : ''),
               b.obj.scheme || ''
             ]);
          }
        });
      });
    });
  });

  // 3. Build Telemetry/Logs Data (Resultados_y_RPE)
  const logRows: string[][] = [
    ["Fecha Log", "Semana", "Día", "Bloque", "Ejercicio", "Sets/Reps", "Peso Kg", "RPE", "Comentarios"]
  ];

  athleteLogs.forEach(log => {
      logRows.push([
          new Date(log.timestamp).toLocaleString(),
          log.weekId || '',
          log.dayId || '',
          log.blockId || '',
          log.exerciseName || '',
          log.setsReps || '',
          log.weightKg ? String(log.weightKg) : '',
          log.rpe ? String(log.rpe) : '',
          log.notes || ''
      ]);
  });

  // 4. Update both sheets using batchUpdate to write data
  // Wait, batchUpdate for values is values:batchUpdate
  // https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values:batchUpdate
  const batchUpdateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          valueInputOption: "USER_ENTERED",
          data: [
              {
                  range: "'Programa'!A1",
                  values: programRows
              },
              {
                  range: "'Resultados_y_RPE'!A1",
                  values: logRows
              }
          ]
      })
  });

  if (!batchUpdateRes.ok) {
      // It might fail if the sheets were renamed or deleted. If so, clear ID and try again next time.
      const errorText = await batchUpdateRes.text();
      console.error(errorText);
      localStorage.removeItem(STORED_SHEET_ID_KEY);
      throw new Error("Failed to update Google Sheet. Please try again. " + errorText);
  }

  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
}
```

## File: src/lib/syncEngine.ts
```typescript
import { 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  collection, 
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from './firebase';

export function isSyncableKey(key: string): boolean {
  if (key === 'nexus_sys_sync_timestamps') return false;
  return key.startsWith('nexus_') || /^[wW]\d+_day\d+/.test(key);
}

function getSafeDocId(key: string): string {
  return key.replace(/\//g, '___SLASH___');
}

let isSyncingFromCloud = false;
let currentUnsubscribe: Unsubscribe | null = null;
const writeTimeouts = new Map<string, any>();

// Helper functions for tracking local modification timestamps
function getLocalTimestamps(): Record<string, number> {
  try {
    const raw = localStorage.getItem('nexus_sys_sync_timestamps');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function setLocalTimestamp(key: string, timestamp: number) {
  try {
    const stamps = getLocalTimestamps();
    stamps[key] = timestamp;
    localStorage.setItem('nexus_sys_sync_timestamps', JSON.stringify(stamps));
  } catch (e) {
    console.error('Error saving local sync timestamp:', e);
  }
}

function getLocalTimestamp(key: string): number {
  return getLocalTimestamps()[key] || 0;
}

// Monkeypatch localStorage to transparently intercept any writes
export function setupStorageMonkeypatch() {
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key: string, value: string) {
    originalSetItem.apply(this, [key, value]);
    if (!isSyncingFromCloud && isSyncableKey(key)) {
      setLocalTimestamp(key, Date.now());
      window.dispatchEvent(new CustomEvent('nexus_storage_changed', { 
        detail: { key, value } 
      }));
    }
  };

  const originalRemoveItem = localStorage.removeItem;
  localStorage.removeItem = function(key: string) {
    originalRemoveItem.apply(this, [key]);
    if (!isSyncingFromCloud && isSyncableKey(key)) {
      setLocalTimestamp(key, Date.now());
      window.dispatchEvent(new CustomEvent('nexus_storage_changed', { 
        detail: { key, value: null } 
      }));
    }
  };

  const originalClear = localStorage.clear;
  localStorage.clear = function() {
    originalClear.apply(this);
    if (!isSyncingFromCloud) {
      window.dispatchEvent(new CustomEvent('nexus_storage_changed', { 
        detail: { clearAll: true } 
      }));
    }
  };
}

// Queue a Firestore update with a 300ms debounce
function queueCloudPush(userId: string, key: string, value: string | null) {
  if (writeTimeouts.has(key)) {
    clearTimeout(writeTimeouts.get(key));
  }

  const timeout = setTimeout(async () => {
    writeTimeouts.delete(key);
    try {
      const safeDocId = getSafeDocId(key);
      const docRef = doc(db, 'users', userId, 'localStorageSync', safeDocId);
      
      const localTime = getLocalTimestamp(key) || Date.now();
      const updatedAtStr = new Date(localTime).toISOString();

      if (value === null) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, {
          key,
          value,
          updatedAt: updatedAtStr
        });
      }
    } catch (error) {
      console.error(`Error syncing key ${key} to Firestore:`, error);
      // Suppress alert popups using the silent handleFirestoreError pattern
      try {
        const safeDocId = getSafeDocId(key);
        handleFirestoreError(error, value === null ? OperationType.DELETE : OperationType.WRITE, `users/${userId}/localStorageSync/${safeDocId}`);
      } catch (e) {
        // Suppress thrown exception to prevent crashing main thread
      }
    }
  }, 300);

  writeTimeouts.set(key, timeout);
}

// Push all syncable local keys to the cloud
export async function pushAllLocalToCloud(userId: string) {
  const syncableKeys: { key: string; value: string }[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && isSyncableKey(key)) {
      const value = localStorage.getItem(key);
      if (value) {
        syncableKeys.push({ key, value });
      }
    }
  }

  const promises = syncableKeys.map(async ({ key, value }) => {
    const safeDocId = getSafeDocId(key);
    const docRef = doc(db, 'users', userId, 'localStorageSync', safeDocId);
    const localTime = getLocalTimestamp(key) || Date.now();
    await setDoc(docRef, {
      key,
      value,
      updatedAt: new Date(localTime).toISOString()
    });
  });

  await Promise.all(promises);
}

// Initialize the sync engine and auth state listeners
export function initializeSyncEngine(
  onUserUpdate: (user: User | null, isSyncing: boolean) => void
) {
  // Apply monkeypatching
  setupStorageMonkeypatch();

  // Listen to intermediate LocalStorage writes while user is logged in
  const handleStorageChange = (e: Event) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const customEvent = e as CustomEvent;
    if (customEvent.detail) {
      const { key, value, clearAll } = customEvent.detail;
      if (clearAll) {
        // Delete all syncable documents on auth clear
        return;
      }
      if (key) {
        queueCloudPush(userId, key, value);
      }
    }
  };

  window.addEventListener('nexus_storage_changed', handleStorageChange);

  let activeOnlineListener: (() => void) | null = null;

  // Monitor Auth State Changes
  onAuthStateChanged(auth, async (user) => {
    // Unsubscribe from any previous Firestore listeners and browser events to avoid resource leaks
    if (currentUnsubscribe) {
      currentUnsubscribe();
      currentUnsubscribe = null;
    }
    if (activeOnlineListener) {
      window.removeEventListener('online', activeOnlineListener);
      activeOnlineListener = null;
    }

    if (user) {
      onUserUpdate(user, true);
      const userId = user.uid;

      // Define a robust, unified bidirectional synchronization sweep
      const runFullBidirectionalSync = async () => {
        try {
          const syncPath = `users/${userId}/localStorageSync`;
          const querySnapshot = await getDocs(collection(db, syncPath));

          const cloudKeys = new Set<string>();
          isSyncingFromCloud = true;
          let changed = false;

          try {
            querySnapshot.forEach((docSnap) => {
              const data = docSnap.data();
              if (data && data.key) {
                const key = data.key;
                cloudKeys.add(key);

                const cloudTime = data.updatedAt ? new Date(data.updatedAt).getTime() : 0;
                const localValue = localStorage.getItem(key);
                const localTime = getLocalTimestamp(key);

                if (localValue === null) {
                  // Only in cloud -> Pull to local
                  localStorage.setItem(key, data.value);
                  setLocalTimestamp(key, cloudTime);
                  changed = true;
                } else {
                  // Exists in both -> Conflict resolution based on timestamps
                  if (cloudTime > localTime) {
                    // Cloud is newer -> Pull to local
                    if (localValue !== data.value) {
                      localStorage.setItem(key, data.value);
                      setLocalTimestamp(key, cloudTime);
                      changed = true;
                    }
                  } else if (localTime > cloudTime) {
                    // Local is newer -> Push to cloud
                    queueCloudPush(userId, key, localValue);
                  }
                }
              }
            });
          } finally {
            isSyncingFromCloud = false;
          }

          // Push any local syncable keys that do not exist in the cloud
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && isSyncableKey(key) && !cloudKeys.has(key)) {
              const val = localStorage.getItem(key);
              if (val) {
                queueCloudPush(userId, key, val);
              }
            }
          }

          if (changed) {
            window.dispatchEvent(new Event('nexus_cloud_synced'));
          }
        } catch (err) {
          console.error('Error in runFullBidirectionalSync:', err);
        }
      };

      // Set up network state restoration listeners
      activeOnlineListener = () => {
        console.log('Network status online: running full bidirectional sync...');
        runFullBidirectionalSync();
      };
      window.addEventListener('online', activeOnlineListener);

      // Perform the initial bidirectional synchronization sweep
      await runFullBidirectionalSync();

      // Setup real-time dynamic sync subscription
      const syncPath = `users/${userId}/localStorageSync`;
      currentUnsubscribe = onSnapshot(collection(db, syncPath), (snapshot) => {
        isSyncingFromCloud = true;
        let changed = false;

        // Broadcast Firestore synchronization state telemetry
        try {
          window.dispatchEvent(new CustomEvent('nexus_sync_status', {
            detail: {
              hasPendingWrites: snapshot.metadata.hasPendingWrites,
              fromCache: snapshot.metadata.fromCache,
              isOnline: navigator.onLine,
              lastSyncTime: Date.now()
            }
          }));
        } catch (e) {}

        try {
          snapshot.docChanges().forEach((change) => {
            const data = change.doc.data();
            if (!data || !data.key) return;
            const key = data.key;
            const value = data.value;
            const cloudTime = data.updatedAt ? new Date(data.updatedAt).getTime() : 0;

            if (change.type === 'removed') {
              if (localStorage.getItem(key) !== null) {
                localStorage.removeItem(key);
                // Also remove locally tracked timestamp
                try {
                  const stamps = getLocalTimestamps();
                  delete stamps[key];
                  localStorage.setItem('nexus_sys_sync_timestamps', JSON.stringify(stamps));
                } catch (e) {}
                changed = true;
              }
            } else {
              const localValue = localStorage.getItem(key);
              const localTime = getLocalTimestamp(key);

              if (localValue !== value) {
                if (cloudTime > localTime) {
                  localStorage.setItem(key, value);
                  setLocalTimestamp(key, cloudTime);
                  changed = true;
                } else if (localTime > cloudTime) {
                  // Local is more recent -> Push local to cloud to resolve conflict
                  queueCloudPush(userId, key, localValue);
                }
              }
            }
          });

          if (changed) {
            window.dispatchEvent(new Event('nexus_cloud_synced'));
          }
        } finally {
          isSyncingFromCloud = false;
        }
      }, (error) => {
        // Suppress snapping runtime errors on the foreground interface
        try {
          handleFirestoreError(error, OperationType.GET, syncPath);
        } catch (e) {}
      });

      onUserUpdate(user, false);
    } else {
      // User logged out
      onUserUpdate(null, false);
    }
  });

  return () => {
    window.removeEventListener('nexus_storage_changed', handleStorageChange);
    if (activeOnlineListener) {
      window.removeEventListener('online', activeOnlineListener);
    }
    if (currentUnsubscribe) {
      currentUnsubscribe();
    }
  };
}
```

## File: src/lib/workoutClassifier.ts
```typescript
/**
 * Classification utilities for PRVN, Mayhem & HWPO workouts.
 * Determines if a given exercise is cardio or bodyweight-only.
 */
export function isCardio(exerciseName: string, rawItemHtml?: string): boolean {
  const combined = `${exerciseName} ${rawItemHtml || ""}`.toUpperCase();
  return (
    combined.includes("REMO") ||
    combined.includes("ROW") ||
    combined.includes("SKI") ||
    combined.includes("BIKE") ||
    combined.includes("ASSAULT") ||
    combined.includes("ECHO") ||
    combined.includes("BICI") ||
    combined.includes("RUN") ||
    combined.includes("CORRER") ||
    combined.includes("DU ") ||
    combined.includes("DOUBLE UNDER") ||
    combined.includes("SOGA") ||
    combined.includes("CAL") ||
    combined.includes("METROS") ||
    combined.includes("METRES") ||
    combined.includes("CARDIO") ||
    combined.includes("HYROX") ||
    combined.includes("MONOESTRUCTURAL") ||
    combined.includes("MONOSTRUCTURAL") ||
    combined.includes("CORRIENDO") ||
    combined.includes("METCON")
  );
}

export function isBodyweightOnly(
  exerciseName: string,
  rawItemHtml?: string,
): boolean {
  const combined = `${exerciseName} ${rawItemHtml || ""}`.toUpperCase();
  return (
    combined.includes("BURPEE") ||
    combined.includes("PULL-UP") ||
    combined.includes("PULLUP") ||
    combined.includes("DOMINADA") ||
    combined.includes("PUSH-UP") ||
    combined.includes("PUSHUP") ||
    combined.includes("FLEXION") ||
    combined.includes("SIT-UP") ||
    combined.includes("SITUP") ||
    combined.includes("ABDOMINAL") ||
    combined.includes("T2B") ||
    combined.includes("TOES") ||
    combined.includes("MUSCLE-UP") ||
    combined.includes("MUSCLEUP") ||
    combined.includes("AIR SQUAT") ||
    combined.includes("SOGA") ||
    combined.includes("DU ") ||
    combined.includes("DOUBLE UNDER") ||
    combined.includes("HANDSTAND") ||
    combined.includes("HSPU") ||
    combined.includes("PISTOL") ||
    combined.includes("ZANCADA") ||
    combined.includes("LUNGE") ||
    combined.includes("CRAWL") ||
    combined.includes("CHIN-UP") ||
    combined.includes("DIP") ||
    combined.includes("FONDO")
  );
}
```

## File: src/types/workout.ts
```typescript
export interface WarmupBlock {
  title: string;
  scheme: string;
  items: string[];
}

export interface StrengthBlock {
  title: string;
  scheme: string;
  items: string[];
}

export interface MetconBlock {
  title: string;
  scheme: string;
  items: string[];
}

export interface AccessoriesBlock {
  title: string;
  scheme: string;
  items: string[];
}

export interface DayVariation {
  tabName: string;
  warmup: WarmupBlock;
  strength: StrengthBlock;
  metcon: MetconBlock;
  accessories: AccessoriesBlock;
}

export interface DayWorkout {
  id: string; // e.g., "w1d1"
  name: string; // "LUNES"
  title: string; // "La Guarida del Mal"
  isCompleted: boolean;
  hasTabs?: boolean;
  variations: DayVariation[];
}

export interface WeekPlan {
  days: DayWorkout[];
}

export interface Database {
  [key: string]: WeekPlan;
}

export interface AthleteState {
  identity: string;
  level: string;
  restriction: string;
  condition: string;
  equipment: {
    grebas: string;
    amuleto: string;
    filtro: string;
  };
}
```
