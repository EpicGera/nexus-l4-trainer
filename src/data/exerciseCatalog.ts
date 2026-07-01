// Core CrossFit exercise catalog (authored once, shared by all athletes).
// Each movement carries the tags the derivation engine needs: modality (M/G/W),
// pattern, the 10-skill exposure, and a work model + displacement so work/power
// can be computed from reps+load without asking the athlete anything extra.
// See docs/BLUEPRINT-modelo-atleta.md §3.2. Displacement values are approximate
// per-rep ROM in meters and are tunable; precision is not the goal, structure is.
//
// This is a STARTER core (~50 movements: the program's movements + common
// CrossFit). It's meant to grow — add entries or let the coach/AI extend it.

import { Exercise, Modality, Pattern, GeneralSkill, WorkModel } from "../types/training";
import { STORAGE_KEYS } from "../lib/storageKeys";

export const CATALOG: Exercise[] = [
  // ── Weightlifting (W) ─────────────────────────────────────────────────────
  { id: "back-squat", name: "Back Squat", aliases: ["back squat", "sentadilla trasera", "bs"],
    modality: "W", pattern: "squat", loadType: "external", unilateral: false,
    skills: ["strength", "power"], workModel: "load-displacement", displacementM: 0.5 },
  { id: "front-squat", name: "Front Squat", aliases: ["front squat", "sentadilla frontal"],
    modality: "W", pattern: "squat", loadType: "external", unilateral: false,
    skills: ["strength", "power", "balance"], workModel: "load-displacement", displacementM: 0.5 },
  { id: "overhead-squat", name: "Overhead Squat", aliases: ["overhead squat", "ohs", "sentadilla overhead"],
    modality: "W", pattern: "squat", loadType: "external", unilateral: false,
    skills: ["strength", "balance", "flexibility", "coordination"], workModel: "load-displacement", displacementM: 0.55 },
  { id: "deadlift", name: "Deadlift", aliases: ["deadlift", "peso muerto", "dl"],
    modality: "W", pattern: "hinge", loadType: "external", unilateral: false,
    skills: ["strength", "power"], workModel: "load-displacement", displacementM: 0.5 },
  { id: "clean", name: "Clean", aliases: ["clean", "power clean", "squat clean", "cargada"],
    modality: "W", pattern: "olympic", loadType: "external", unilateral: false,
    skills: ["power", "coordination", "speed", "accuracy"], workModel: "load-displacement", displacementM: 1.1 },
  { id: "snatch", name: "Snatch", aliases: ["snatch", "power snatch", "squat snatch", "arranque"],
    modality: "W", pattern: "olympic", loadType: "external", unilateral: false,
    skills: ["power", "coordination", "speed", "accuracy", "flexibility"], workModel: "load-displacement", displacementM: 1.3 },
  { id: "clean-and-jerk", name: "Clean & Jerk", aliases: ["clean and jerk", "c&j", "envion"],
    modality: "W", pattern: "olympic", loadType: "external", unilateral: false,
    skills: ["power", "coordination", "strength"], workModel: "load-displacement", displacementM: 1.4 },
  { id: "strict-press", name: "Strict Press", aliases: ["strict press", "shoulder press", "overhead press", "press militar", "ohp"],
    modality: "W", pattern: "vertical-push", loadType: "external", unilateral: false,
    skills: ["strength"], workModel: "load-displacement", displacementM: 0.6 },
  { id: "push-press", name: "Push Press", aliases: ["push press"],
    modality: "W", pattern: "vertical-push", loadType: "external", unilateral: false,
    skills: ["power", "strength"], workModel: "load-displacement", displacementM: 0.6 },
  { id: "push-jerk", name: "Push Jerk", aliases: ["push jerk", "split jerk", "jerk"],
    modality: "W", pattern: "vertical-push", loadType: "external", unilateral: false,
    skills: ["power", "coordination"], workModel: "load-displacement", displacementM: 0.6 },
  { id: "bench-press", name: "Bench Press", aliases: ["bench press", "press banca", "press de banca"],
    modality: "W", pattern: "horizontal-push", loadType: "external", unilateral: false,
    skills: ["strength"], workModel: "load-displacement", displacementM: 0.4 },
  { id: "thruster", name: "Thruster", aliases: ["thruster", "thrusters"],
    modality: "W", pattern: "squat", loadType: "external", unilateral: false,
    skills: ["power", "stamina", "strength"], workModel: "load-displacement", displacementM: 0.9 },
  { id: "walking-lunge", name: "Walking Lunge", aliases: ["walking lunge", "lunge", "zancada", "zancadas"],
    modality: "W", pattern: "squat", loadType: "bodyweight+load", unilateral: true,
    skills: ["strength", "balance", "coordination"], workModel: "bodyweight", displacementM: 0.5, bodyweightFraction: 0.85 },
  { id: "kettlebell-swing", name: "Kettlebell Swing", aliases: ["kettlebell swing", "kb swing", "american swing", "russian swing"],
    modality: "W", pattern: "hinge", loadType: "external", unilateral: false,
    skills: ["power", "stamina"], workModel: "load-displacement", displacementM: 1.0 },
  { id: "goblet-squat", name: "Goblet Squat", aliases: ["goblet squat"],
    modality: "W", pattern: "squat", loadType: "external", unilateral: false,
    skills: ["strength", "balance"], workModel: "load-displacement", displacementM: 0.5 },
  { id: "bulgarian-split-squat", name: "Bulgarian Split Squat", aliases: ["bulgarian split squat", "split squat", "goblet bulgarian split"],
    modality: "W", pattern: "squat", loadType: "external", unilateral: true,
    skills: ["strength", "balance"], workModel: "load-displacement", displacementM: 0.45 },
  { id: "dumbbell-snatch", name: "Dumbbell Snatch", aliases: ["dumbbell snatch", "db snatch"],
    modality: "W", pattern: "olympic", loadType: "external", unilateral: true,
    skills: ["power", "coordination"], workModel: "load-displacement", displacementM: 1.4 },
  { id: "wall-ball", name: "Wall Ball", aliases: ["wall ball", "wall balls", "wall ball shots", "wb"],
    modality: "W", pattern: "squat", loadType: "external", unilateral: false,
    skills: ["power", "stamina", "accuracy"], workModel: "load-displacement", displacementM: 1.5 },
  { id: "medicine-ball-clean", name: "Med Ball Clean", aliases: ["medicine ball clean", "mb clean", "ball clean"],
    modality: "W", pattern: "olympic", loadType: "external", unilateral: false,
    skills: ["power", "coordination"], workModel: "load-displacement", displacementM: 1.0 },
  { id: "good-morning", name: "Good Morning", aliases: ["good morning", "good mornings", "banded good morning", "buenos dias"],
    modality: "W", pattern: "hinge", loadType: "external", unilateral: false,
    skills: ["stamina", "flexibility"], workModel: "none" },

  // ── Gymnastics (G) ─────────────────────────────────────────────────────────
  { id: "pull-up", name: "Pull-up", aliases: ["pull up", "pull-up", "pull ups", "dominada", "dominadas", "strict pull-up"],
    modality: "G", pattern: "vertical-pull", loadType: "bodyweight+load", unilateral: false,
    skills: ["strength", "coordination"], workModel: "bodyweight", displacementM: 0.6, bodyweightFraction: 1.0 },
  { id: "chest-to-bar", name: "Chest-to-Bar", aliases: ["chest to bar", "c2b", "ctb"],
    modality: "G", pattern: "vertical-pull", loadType: "bodyweight+load", unilateral: false,
    skills: ["strength", "coordination", "power"], workModel: "bodyweight", displacementM: 0.65, bodyweightFraction: 1.0 },
  { id: "push-up", name: "Push-up", aliases: ["push up", "push-up", "push ups", "flexiones", "lagartijas"],
    modality: "G", pattern: "horizontal-push", loadType: "bodyweight+load", unilateral: false,
    skills: ["strength", "stamina"], workModel: "bodyweight", displacementM: 0.5, bodyweightFraction: 0.65 },
  { id: "handstand-push-up", name: "Handstand Push-up", aliases: ["handstand push up", "hspu", "handstand push-up"],
    modality: "G", pattern: "vertical-push", loadType: "bodyweight", unilateral: false,
    skills: ["strength", "balance", "coordination"], workModel: "bodyweight", displacementM: 0.45, bodyweightFraction: 0.9 },
  { id: "air-squat", name: "Air Squat", aliases: ["air squat", "squat", "sentadilla", "bodyweight squat"],
    modality: "G", pattern: "squat", loadType: "bodyweight", unilateral: false,
    skills: ["stamina", "balance"], workModel: "bodyweight", displacementM: 0.5, bodyweightFraction: 0.85 },
  { id: "pistol-squat", name: "Pistol Squat", aliases: ["pistol", "pistol squat", "sentadilla a una pierna"],
    modality: "G", pattern: "squat", loadType: "bodyweight", unilateral: true,
    skills: ["strength", "balance", "flexibility", "coordination"], workModel: "bodyweight", displacementM: 0.5, bodyweightFraction: 0.85 },
  { id: "cossack-squat", name: "Cossack Squat", aliases: ["cossack squat", "sentadilla cosaca"],
    modality: "G", pattern: "squat", loadType: "bodyweight", unilateral: true,
    skills: ["flexibility", "balance", "stamina"], workModel: "bodyweight", displacementM: 0.5, bodyweightFraction: 0.85 },
  { id: "burpee", name: "Burpee", aliases: ["burpee", "burpees"],
    modality: "G", pattern: "gymnastics-skill", loadType: "bodyweight", unilateral: false,
    skills: ["stamina", "cardio", "coordination", "agility"], workModel: "bodyweight", displacementM: 0.45, bodyweightFraction: 1.0 },
  { id: "box-jump", name: "Box Jump", aliases: ["box jump", "box jumps", "bj", "salto al cajon"],
    modality: "G", pattern: "gymnastics-skill", loadType: "bodyweight", unilateral: false,
    skills: ["power", "coordination", "balance", "agility"], workModel: "bodyweight", displacementM: 0.6, bodyweightFraction: 1.0 },
  { id: "toes-to-bar", name: "Toes-to-Bar", aliases: ["toes to bar", "t2b", "ttb"],
    modality: "G", pattern: "core", loadType: "bodyweight", unilateral: false,
    skills: ["coordination", "stamina", "strength"], workModel: "bodyweight", displacementM: 0.7, bodyweightFraction: 0.4 },
  { id: "sit-up", name: "Sit-up", aliases: ["sit up", "sit-up", "sit ups", "abdominales"],
    modality: "G", pattern: "core", loadType: "bodyweight", unilateral: false,
    skills: ["stamina"], workModel: "bodyweight", displacementM: 0.4, bodyweightFraction: 0.4 },
  { id: "ghd-sit-up", name: "GHD Sit-up", aliases: ["ghd sit up", "ghd", "ghd situp"],
    modality: "G", pattern: "core", loadType: "bodyweight", unilateral: false,
    skills: ["strength", "stamina", "flexibility"], workModel: "bodyweight", displacementM: 0.7, bodyweightFraction: 0.4 },
  { id: "plank", name: "Plank", aliases: ["plank", "plancha"],
    modality: "G", pattern: "core", loadType: "timed", unilateral: false,
    skills: ["stamina", "balance"], workModel: "none" },
  { id: "hollow-rock", name: "Hollow Rock", aliases: ["hollow rock", "hollow", "hollow rocks"],
    modality: "G", pattern: "core", loadType: "bodyweight", unilateral: false,
    skills: ["coordination", "stamina"], workModel: "none" },
  { id: "muscle-up", name: "Muscle-up", aliases: ["muscle up", "mu"],
    modality: "G", pattern: "vertical-pull", loadType: "bodyweight", unilateral: false,
    skills: ["strength", "power", "coordination"], workModel: "bodyweight", displacementM: 0.9, bodyweightFraction: 1.0 },
  { id: "ring-dip", name: "Ring Dip", aliases: [
      "ring dip", "ring dips", "dips", "fondos", "fondos en anillas",
      "dip en anillas", "strict ring dip", "strict ring dips", "ring dip estricto",
    ],
    modality: "G", pattern: "vertical-push", loadType: "bodyweight+load", unilateral: false,
    skills: ["strength", "balance", "coordination"], workModel: "bodyweight", displacementM: 0.45, bodyweightFraction: 0.9 },
  { id: "rope-climb", name: "Rope Climb", aliases: ["rope climb", "trepa de cuerda", "trepa"],
    modality: "G", pattern: "vertical-pull", loadType: "bodyweight", unilateral: false,
    skills: ["strength", "coordination"], workModel: "bodyweight", displacementM: 4.5, bodyweightFraction: 1.0 },

  // ── Monostructural (M) ─────────────────────────────────────────────────────
  { id: "row-erg", name: "Row", aliases: ["row", "rowing", "remo", "c2 row", "concept2"],
    modality: "M", pattern: "monostructural", loadType: "machine", unilateral: false,
    skills: ["cardio", "stamina"], workModel: "erg-calories" },
  { id: "bike-erg", name: "Bike Erg", aliases: ["bike erg", "assault bike", "echo bike", "airbike", "bici", "bike"],
    modality: "M", pattern: "monostructural", loadType: "machine", unilateral: false,
    skills: ["cardio", "stamina"], workModel: "erg-calories" },
  { id: "ski-erg", name: "Ski Erg", aliases: ["ski erg", "skierg", "ski"],
    modality: "M", pattern: "monostructural", loadType: "machine", unilateral: false,
    skills: ["cardio", "stamina"], workModel: "erg-calories" },
  { id: "run", name: "Run", aliases: ["run", "running", "correr", "carrera", "trote"],
    modality: "M", pattern: "monostructural", loadType: "distance", unilateral: false,
    skills: ["cardio", "speed", "stamina"], workModel: "distance" },
  { id: "double-under", name: "Double Under", aliases: ["double under", "double unders", "du", "dobles"],
    modality: "M", pattern: "monostructural", loadType: "timed", unilateral: false,
    skills: ["coordination", "cardio", "speed", "agility"], workModel: "none" },
  { id: "single-under", name: "Single Under", aliases: ["single under", "single unders", "jump rope", "comba", "saltar la cuerda"],
    modality: "M", pattern: "monostructural", loadType: "timed", unilateral: false,
    skills: ["coordination", "cardio"], workModel: "none" },

  // ── Extended catalog (broad coverage to reduce "uncategorized" surprises) ──
  // More weightlifting / loaded
  { id: "hang-clean", name: "Hang Clean", aliases: ["hang clean", "hang power clean"],
    modality: "W", pattern: "olympic", loadType: "external", unilateral: false,
    skills: ["power", "coordination"], workModel: "load-displacement", displacementM: 0.8 },
  { id: "hang-snatch", name: "Hang Snatch", aliases: ["hang snatch", "hang power snatch"],
    modality: "W", pattern: "olympic", loadType: "external", unilateral: false,
    skills: ["power", "coordination", "flexibility"], workModel: "load-displacement", displacementM: 1.0 },
  { id: "clean-pull", name: "Clean Pull", aliases: ["clean pull"],
    modality: "W", pattern: "olympic", loadType: "external", unilateral: false,
    skills: ["strength", "power"], workModel: "load-displacement", displacementM: 0.6 },
  { id: "snatch-pull", name: "Snatch Pull", aliases: ["snatch pull"],
    modality: "W", pattern: "olympic", loadType: "external", unilateral: false,
    skills: ["strength", "power"], workModel: "load-displacement", displacementM: 0.7 },
  { id: "snatch-balance", name: "Snatch Balance", aliases: ["snatch balance"],
    modality: "W", pattern: "olympic", loadType: "external", unilateral: false,
    skills: ["power", "balance", "speed"], workModel: "load-displacement", displacementM: 0.4 },
  { id: "sumo-deadlift-high-pull", name: "Sumo Deadlift High Pull", aliases: ["sumo deadlift high pull", "sdhp"],
    modality: "W", pattern: "hinge", loadType: "external", unilateral: false,
    skills: ["power", "stamina"], workModel: "load-displacement", displacementM: 0.7 },
  { id: "romanian-deadlift", name: "Romanian Deadlift", aliases: [
      "romanian deadlift", "rdl", "peso muerto rumano",
      "single leg rdl", "single leg romanian deadlift",
    ],
    modality: "W", pattern: "hinge", loadType: "external", unilateral: false,
    skills: ["strength", "flexibility"], workModel: "load-displacement", displacementM: 0.45 },
  { id: "sumo-deadlift", name: "Sumo Deadlift", aliases: ["sumo deadlift", "peso muerto sumo"],
    modality: "W", pattern: "hinge", loadType: "external", unilateral: false,
    skills: ["strength", "power"], workModel: "load-displacement", displacementM: 0.45 },
  { id: "bent-over-row", name: "Bent-over Row", aliases: ["bent over row", "barbell row", "pendlay row", "remo con barra", "gorilla row", "gorilla rows", "kb row", "kettlebell row"],
    modality: "W", pattern: "horizontal-pull", loadType: "external", unilateral: false,
    skills: ["strength"], workModel: "load-displacement", displacementM: 0.4 },
  { id: "z-press", name: "Z Press", aliases: ["z press"],
    modality: "W", pattern: "vertical-push", loadType: "external", unilateral: false,
    skills: ["strength", "balance"], workModel: "load-displacement", displacementM: 0.6 },
  { id: "floor-press", name: "Floor Press", aliases: ["floor press"],
    modality: "W", pattern: "horizontal-push", loadType: "external", unilateral: false,
    skills: ["strength"], workModel: "load-displacement", displacementM: 0.3 },
  { id: "hip-thrust", name: "Hip Thrust", aliases: [
      "hip thrust", "hip thrusts", "barbell hip thrust",
      "glute bridge", "puente de gluteos", "hip extension barbell",
    ],
    modality: "W", pattern: "hinge", loadType: "external", unilateral: false,
    skills: ["strength", "power"], workModel: "load-displacement", displacementM: 0.3 },
  { id: "front-rack-lunge", name: "Front Rack Lunge", aliases: ["front rack lunge", "barbell lunge", "front rack walking lunge"],
    modality: "W", pattern: "squat", loadType: "external", unilateral: true,
    skills: ["strength", "balance"], workModel: "load-displacement", displacementM: 0.5 },
  { id: "back-rack-lunge", name: "Back Rack Lunge", aliases: ["back rack lunge"],
    modality: "W", pattern: "squat", loadType: "external", unilateral: true,
    skills: ["strength", "balance"], workModel: "load-displacement", displacementM: 0.5 },
  { id: "overhead-walking-lunge", name: "Overhead Lunge", aliases: ["overhead lunge", "overhead walking lunge", "ohwl"],
    modality: "W", pattern: "squat", loadType: "external", unilateral: true,
    skills: ["strength", "balance", "stamina"], workModel: "load-displacement", displacementM: 0.5 },
  { id: "weighted-step-up", name: "Step-up", aliases: ["step up", "step ups", "box step up", "weighted step up", "dumbbell step up"],
    modality: "W", pattern: "squat", loadType: "bodyweight+load", unilateral: true,
    skills: ["strength", "balance", "stamina"], workModel: "bodyweight", displacementM: 0.4, bodyweightFraction: 0.85 },
  { id: "dumbbell-thruster", name: "DB Thruster", aliases: ["dumbbell thruster", "db thruster"],
    modality: "W", pattern: "squat", loadType: "external", unilateral: false,
    skills: ["power", "stamina"], workModel: "load-displacement", displacementM: 0.9 },
  { id: "dumbbell-clean-and-jerk", name: "DB Clean & Jerk", aliases: ["dumbbell clean and jerk", "db clean and jerk"],
    modality: "W", pattern: "olympic", loadType: "external", unilateral: false,
    skills: ["power", "strength"], workModel: "load-displacement", displacementM: 1.2 },
  { id: "dumbbell-clean", name: "DB Clean", aliases: ["dumbbell clean", "db clean"],
    modality: "W", pattern: "olympic", loadType: "external", unilateral: false,
    skills: ["power", "coordination"], workModel: "load-displacement", displacementM: 0.9 },
  { id: "dumbbell-shoulder-press", name: "DB Shoulder Press", aliases: ["dumbbell shoulder press", "db shoulder press", "dumbbell press", "db press"],
    modality: "W", pattern: "vertical-push", loadType: "external", unilateral: false,
    skills: ["strength"], workModel: "load-displacement", displacementM: 0.6 },
  { id: "dumbbell-bench-press", name: "DB Bench Press", aliases: ["dumbbell bench press", "db bench press", "dumbbell bench"],
    modality: "W", pattern: "horizontal-push", loadType: "external", unilateral: false,
    skills: ["strength"], workModel: "load-displacement", displacementM: 0.4 },
  { id: "dumbbell-front-squat", name: "DB Front Squat", aliases: ["dumbbell front squat", "db front squat"],
    modality: "W", pattern: "squat", loadType: "external", unilateral: false,
    skills: ["strength"], workModel: "load-displacement", displacementM: 0.5 },
  { id: "dumbbell-deadlift", name: "DB Deadlift", aliases: ["dumbbell deadlift", "db deadlift"],
    modality: "W", pattern: "hinge", loadType: "external", unilateral: false,
    skills: ["strength", "stamina"], workModel: "load-displacement", displacementM: 0.4 },
  { id: "devil-press", name: "Devil Press", aliases: ["devil press", "devils press"],
    modality: "W", pattern: "olympic", loadType: "external", unilateral: false,
    skills: ["power", "stamina"], workModel: "load-displacement", displacementM: 1.3 },
  { id: "turkish-get-up", name: "Turkish Get-up", aliases: ["turkish get up", "tgu", "get up"],
    modality: "W", pattern: "core", loadType: "external", unilateral: true,
    skills: ["strength", "balance", "coordination"], workModel: "load-displacement", displacementM: 0.8 },
  { id: "kettlebell-clean", name: "KB Clean", aliases: ["kettlebell clean", "kb clean"],
    modality: "W", pattern: "olympic", loadType: "external", unilateral: false,
    skills: ["power", "coordination"], workModel: "load-displacement", displacementM: 0.7 },
  { id: "kettlebell-snatch", name: "KB Snatch", aliases: ["kettlebell snatch", "kb snatch"],
    modality: "W", pattern: "olympic", loadType: "external", unilateral: false,
    skills: ["power", "coordination"], workModel: "load-displacement", displacementM: 1.1 },
  { id: "farmers-carry", name: "Farmer's Carry", aliases: ["farmers carry", "farmer carry", "farmers walk", "farmer walk"],
    modality: "W", pattern: "carry", loadType: "external", unilateral: false,
    skills: ["strength", "stamina"], workModel: "none" },
  { id: "sandbag-carry", name: "Sandbag Carry", aliases: ["sandbag carry", "bear hug carry"],
    modality: "W", pattern: "carry", loadType: "external", unilateral: false,
    skills: ["strength", "stamina"], workModel: "none" },
  { id: "sandbag-clean", name: "Sandbag Clean", aliases: ["sandbag clean", "dball clean", "d-ball clean", "slam ball clean"],
    modality: "W", pattern: "olympic", loadType: "external", unilateral: false,
    skills: ["power", "strength"], workModel: "load-displacement", displacementM: 1.0 },
  { id: "sandbag-over-shoulder", name: "Sandbag Over Shoulder", aliases: ["sandbag over shoulder", "ball over shoulder", "dball over shoulder"],
    modality: "W", pattern: "hinge", loadType: "external", unilateral: false,
    skills: ["power", "strength"], workModel: "load-displacement", displacementM: 1.2 },
  { id: "back-extension", name: "Back Extension", aliases: ["back extension", "hip extension", "ghd back extension"],
    modality: "G", pattern: "hinge", loadType: "bodyweight", unilateral: false,
    skills: ["strength", "stamina"], workModel: "bodyweight", displacementM: 0.4, bodyweightFraction: 0.4 },

  // More gymnastics
  { id: "kipping-pull-up", name: "Kipping Pull-up", aliases: ["kipping pull up", "kipping pull-up", "kip pull up"],
    modality: "G", pattern: "vertical-pull", loadType: "bodyweight", unilateral: false,
    skills: ["stamina", "coordination", "power"], workModel: "bodyweight", displacementM: 0.6, bodyweightFraction: 1.0 },
  { id: "butterfly-pull-up", name: "Butterfly Pull-up", aliases: ["butterfly pull up", "butterfly pull-up", "butterfly"],
    modality: "G", pattern: "vertical-pull", loadType: "bodyweight", unilateral: false,
    skills: ["stamina", "coordination"], workModel: "bodyweight", displacementM: 0.6, bodyweightFraction: 1.0 },
  { id: "ring-muscle-up", name: "Ring Muscle-up", aliases: ["ring muscle up", "ring mu", "rmu"],
    modality: "G", pattern: "vertical-pull", loadType: "bodyweight", unilateral: false,
    skills: ["strength", "power", "coordination"], workModel: "bodyweight", displacementM: 0.95, bodyweightFraction: 1.0 },
  { id: "bar-muscle-up", name: "Bar Muscle-up", aliases: ["bar muscle up", "bmu", "bar mu"],
    modality: "G", pattern: "vertical-pull", loadType: "bodyweight", unilateral: false,
    skills: ["power", "strength", "coordination"], workModel: "bodyweight", displacementM: 0.9, bodyweightFraction: 1.0 },
  { id: "knees-to-elbow", name: "Knees-to-Elbow", aliases: ["knees to elbow", "knees to elbows", "k2e"],
    modality: "G", pattern: "core", loadType: "bodyweight", unilateral: false,
    skills: ["coordination", "stamina"], workModel: "bodyweight", displacementM: 0.6, bodyweightFraction: 0.4 },
  { id: "hanging-knee-raise", name: "Hanging Knee Raise", aliases: ["hanging knee raise", "knee raise"],
    modality: "G", pattern: "core", loadType: "bodyweight", unilateral: false,
    skills: ["stamina", "coordination"], workModel: "bodyweight", displacementM: 0.5, bodyweightFraction: 0.4 },
  { id: "v-up", name: "V-up", aliases: ["v up", "v-up", "v ups"],
    modality: "G", pattern: "core", loadType: "bodyweight", unilateral: false,
    skills: ["stamina", "coordination"], workModel: "bodyweight", displacementM: 0.5, bodyweightFraction: 0.4 },
  { id: "l-sit", name: "L-sit", aliases: ["l sit", "l-sit"],
    modality: "G", pattern: "core", loadType: "timed", unilateral: false,
    skills: ["strength", "balance"], workModel: "none" },
  { id: "wall-walk", name: "Wall Walk", aliases: ["wall walk", "wall walks"],
    modality: "G", pattern: "gymnastics-skill", loadType: "bodyweight", unilateral: false,
    skills: ["strength", "coordination", "balance"], workModel: "bodyweight", displacementM: 0.9, bodyweightFraction: 0.9 },
  { id: "handstand-walk", name: "Handstand Walk", aliases: ["handstand walk", "hs walk", "handstand walks"],
    modality: "G", pattern: "gymnastics-skill", loadType: "distance", unilateral: false,
    skills: ["balance", "coordination", "strength"], workModel: "distance" },
  { id: "handstand-hold", name: "Handstand Hold", aliases: ["handstand hold", "handstand"],
    modality: "G", pattern: "gymnastics-skill", loadType: "timed", unilateral: false,
    skills: ["balance", "strength"], workModel: "none" },
  { id: "pike-push-up", name: "Pike Push-up", aliases: ["pike push up", "pike push-up"],
    modality: "G", pattern: "vertical-push", loadType: "bodyweight", unilateral: false,
    skills: ["strength"], workModel: "bodyweight", displacementM: 0.4, bodyweightFraction: 0.7 },
  { id: "hand-release-push-up", name: "Hand-release Push-up", aliases: ["hand release push up", "hr push up", "hrpu"],
    modality: "G", pattern: "horizontal-push", loadType: "bodyweight", unilateral: false,
    skills: ["strength", "stamina"], workModel: "bodyweight", displacementM: 0.5, bodyweightFraction: 0.65 },
  { id: "bar-dip", name: "Bar Dip", aliases: ["bar dip", "bar dips", "parallette dip"],
    modality: "G", pattern: "vertical-push", loadType: "bodyweight+load", unilateral: false,
    skills: ["strength"], workModel: "bodyweight", displacementM: 0.45, bodyweightFraction: 0.9 },
  { id: "ring-row", name: "Ring Row", aliases: ["ring row", "ring rows", "inverted row"],
    modality: "G", pattern: "horizontal-pull", loadType: "bodyweight", unilateral: false,
    skills: ["strength", "stamina"], workModel: "bodyweight", displacementM: 0.5, bodyweightFraction: 0.6 },
  { id: "jumping-pull-up", name: "Jumping Pull-up", aliases: ["jumping pull up", "jumping pull-up"],
    modality: "G", pattern: "vertical-pull", loadType: "bodyweight", unilateral: false,
    skills: ["stamina"], workModel: "bodyweight", displacementM: 0.6, bodyweightFraction: 0.6 },
  { id: "jumping-lunge", name: "Jumping Lunge", aliases: ["jumping lunge", "jump lunge"],
    modality: "G", pattern: "squat", loadType: "bodyweight", unilateral: true,
    skills: ["power", "stamina"], workModel: "bodyweight", displacementM: 0.5, bodyweightFraction: 0.85 },
  { id: "box-jump-over", name: "Box Jump Over", aliases: ["box jump over", "box jump overs", "bjo"],
    modality: "G", pattern: "gymnastics-skill", loadType: "bodyweight", unilateral: false,
    skills: ["power", "agility", "coordination"], workModel: "bodyweight", displacementM: 0.6, bodyweightFraction: 1.0 },
  { id: "bar-facing-burpee", name: "Bar-facing Burpee", aliases: ["bar facing burpee", "burpee over bar", "lateral burpee", "bar facing burpees"],
    modality: "G", pattern: "gymnastics-skill", loadType: "bodyweight", unilateral: false,
    skills: ["stamina", "agility", "coordination"], workModel: "bodyweight", displacementM: 0.45, bodyweightFraction: 1.0 },
  { id: "burpee-box-jump-over", name: "Burpee Box Jump-over", aliases: ["burpee box jump over", "bbjo", "burpee box jump"],
    modality: "G", pattern: "gymnastics-skill", loadType: "bodyweight", unilateral: false,
    skills: ["power", "stamina", "agility"], workModel: "bodyweight", displacementM: 0.6, bodyweightFraction: 1.0 },
  { id: "legless-rope-climb", name: "Legless Rope Climb", aliases: ["legless rope climb", "legless"],
    modality: "G", pattern: "vertical-pull", loadType: "bodyweight", unilateral: false,
    skills: ["strength", "coordination"], workModel: "bodyweight", displacementM: 4.5, bodyweightFraction: 1.0 },

  // More monostructural / odd-object locomotion
  { id: "shuttle-run", name: "Shuttle Run", aliases: ["shuttle run", "shuttle runs", "shuttle"],
    modality: "M", pattern: "monostructural", loadType: "distance", unilateral: false,
    skills: ["speed", "agility", "cardio"], workModel: "distance" },
  { id: "sled-push", name: "Sled Push", aliases: ["sled push", "prowler push", "empuje de trineo"],
    modality: "W", pattern: "carry", loadType: "external", unilateral: false,
    skills: ["strength", "power", "stamina"], workModel: "distance" },
  { id: "sled-drag", name: "Sled Drag", aliases: ["sled drag", "sled pull", "prowler drag"],
    modality: "W", pattern: "carry", loadType: "external", unilateral: false,
    skills: ["strength", "stamina"], workModel: "distance" },
  { id: "swim", name: "Swim", aliases: ["swim", "swimming", "natacion", "nado"],
    modality: "M", pattern: "monostructural", loadType: "distance", unilateral: false,
    skills: ["cardio", "stamina"], workModel: "distance" },

  // ── Isolation / accessory (W) ─────────────────────────────────────────────
  // CrossFit taxonomy has no dedicated "isolation" pattern; horizontal-pull is
  // the closest structural fit for elbow-flexion curls (load moves via pulling).
  { id: "hammer-curl", name: "Hammer Curl", aliases: [
      "hammer curl", "hammer curls", "curl martillo", "curl hammer",
      "martillo", "hammer curl con mancuernas", "hammer curls con mancuernas",
    ],
    modality: "W", pattern: "horizontal-pull", loadType: "external", unilateral: false,
    skills: ["strength"], workModel: "load-displacement", displacementM: 0.35 },
  { id: "bicep-curl", name: "Bicep Curl", aliases: [
      "bicep curl", "bicep curls", "curl biceps", "curl con mancuernas",
      "curls con mancuernas", "curl alterno", "curl alternado", "curl", "curls",
      "dumbbell curl", "barbell curl", "ez curl",
    ],
    modality: "W", pattern: "horizontal-pull", loadType: "external", unilateral: false,
    skills: ["strength"], workModel: "load-displacement", displacementM: 0.35 },
  { id: "face-pull", name: "Face Pull", aliases: [
      "face pull", "face pulls", "banded face pull", "banded face pulls",
      "cable face pull", "face pull con banda", "face pull con cable",
    ],
    modality: "W", pattern: "horizontal-pull", loadType: "external", unilateral: false,
    skills: ["strength", "coordination"], workModel: "load-displacement", displacementM: 0.35 },
  { id: "tricep-extension", name: "Tricep Extension", aliases: [
      "tricep extension", "tricep extensions", "skull crusher", "skullcrusher",
      "tricep pushdown", "tricep pushdowns", "triceps pushdown", "triceps pushdowns",
      "tricep press", "press frances", "extension triceps", "extension de triceps",
    ],
    modality: "W", pattern: "vertical-push", loadType: "external", unilateral: false,
    skills: ["strength"], workModel: "load-displacement", displacementM: 0.35 },
  { id: "lateral-raise", name: "Lateral Raise", aliases: [
      "lateral raise", "lateral raises", "elevacion lateral", "elevaciones laterales",
      "shoulder raise", "dumbbell lateral raise",
    ],
    modality: "W", pattern: "horizontal-pull", loadType: "external", unilateral: false,
    skills: ["strength"], workModel: "load-displacement", displacementM: 0.5 },
  { id: "band-pull-apart", name: "Band Pull-apart", aliases: [
      "band pull apart", "band pull-apart", "pull apart", "pull-apart",
      "jaloneo con banda", "jaloneos con banda",
    ],
    modality: "W", pattern: "horizontal-pull", loadType: "external", unilateral: false,
    skills: ["strength", "coordination"], workModel: "none" },
  { id: "clean-deadlift", name: "Clean Deadlift", aliases: [
      "clean deadlift", "halterofilia deadlift",
    ],
    modality: "W", pattern: "hinge", loadType: "external", unilateral: false,
    skills: ["strength", "power"], workModel: "load-displacement", displacementM: 0.5 },

  // ── Gymnastics isometric / skill holds (G) ────────────────────────────────
  { id: "ring-hold", name: "Ring Hold", aliases: [
      "ring hold", "ring holds", "soporte en anillas", "hold en anillas",
      "support hold", "ring support", "ring support hold", "anillas hold",
    ],
    modality: "G", pattern: "gymnastics-skill", loadType: "bodyweight", unilateral: false,
    skills: ["strength", "balance", "coordination"], workModel: "none" },
  { id: "strict-pull-up-eccentric", name: "Eccentric Pull-up", aliases: [
      "eccentric pull up", "pull up eccentrico", "pull-up excentrico",
      "dominada excentrica", "dominadas excentricas", "excentric pull",
      "bajada excentrica", "lowering pull up",
    ],
    modality: "G", pattern: "vertical-pull", loadType: "bodyweight+load", unilateral: false,
    skills: ["strength", "coordination"], workModel: "bodyweight", displacementM: 0.6, bodyweightFraction: 1.0 },

  // ── Gymnastics / bodyweight accessories ──────────────────────────────────
  { id: "inchworm", name: "Inchworm", aliases: [
      "inchworm", "inchworms", "inchworm con push up", "inchworm con flexion",
      "gusano",
    ],
    modality: "G", pattern: "gymnastics-skill", loadType: "bodyweight", unilateral: false,
    skills: ["flexibility", "coordination", "stamina"], workModel: "none" },
  { id: "hollow-body", name: "Hollow Body", aliases: [
      "hollow body", "hollow hold", "hollow body hold", "cuerpo hueco",
    ],
    modality: "G", pattern: "core", loadType: "timed", unilateral: false,
    skills: ["stamina", "strength"], workModel: "none" },
  { id: "superman", name: "Superman", aliases: [
      "superman", "superwoman", "arch hold", "back arch hold",
    ],
    modality: "G", pattern: "core", loadType: "bodyweight", unilateral: false,
    skills: ["strength", "stamina"], workModel: "none" },
];

export const CATALOG_BY_ID: Record<string, Exercise> = Object.fromEntries(
  CATALOG.map((e) => [e.id, e]),
);

const norm = (s: string): string =>
  String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

// normalized alias/name/id → exerciseId (built once)
const ALIAS_INDEX: Record<string, string> = (() => {
  const idx: Record<string, string> = {};
  for (const ex of CATALOG) {
    for (const key of [ex.id, ex.name, ...ex.aliases]) {
      const n = norm(key);
      if (n && !(n in idx)) idx[n] = ex.id;
    }
  }
  return idx;
})();

export function getExercise(id: string): Exercise | undefined {
  return CATALOG_BY_ID[id];
}

/**
 * Resolve a free-text movement name (from the program, a sheet, or manual
 * entry) to a catalog Exercise. Exact normalized match first; then the longest
 * alias contained in the text. Returns null when nothing matches — callers that
 * must not fail use resolveOrInfer instead.
 */
export function resolveExercise(raw: string): Exercise | null {
  const n = norm(raw);
  if (!n) return null;
  if (ALIAS_INDEX[n]) return CATALOG_BY_ID[ALIAS_INDEX[n]];

  // Contained-alias fallback: prefer the most specific (longest) key.
  const keys = Object.keys(ALIAS_INDEX).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (key.length >= 3 && (n.includes(` ${key} `) || n.includes(`${key} `) || n.includes(` ${key}`) || n === key)) {
      return CATALOG_BY_ID[ALIAS_INDEX[key]];
    }
  }
  return null;
}

// ── Open-world fallback: inference for movements not in the catalog ──────────

export interface InferContext {
  /** block bucket the movement appeared in (helps guess modality) */
  bucket?: "warmup" | "strength" | "metcon" | "accessories";
  /** whether the athlete logged external load for it */
  hasLoad?: boolean;
}

const has = (n: string, words: string[]) => words.some((w) => n.includes(w));

const CARDIO_WORDS = ["row", "remo", "run", "correr", "carrera", "trote", "bike", "bici", "ski", "swim", "nad", "jump rope", "comba", "double under", "single under", "skip", "erg", "assault", "echo"];
const LOAD_WORDS = ["barbell", "barra", "dumbbell", "mancuerna", "kettlebell", "pesa rusa", "clean", "snatch", "jerk", "press", "squat", "sentadilla", "deadlift", "peso muerto", "thruster", "swing", "lunge", "zancada", "carry", "carga", "farmer", "sandbag", "wall ball"];
const GYM_WORDS = ["pull", "dominada", "push up", "flexion", "muscle up", "dip", "fondo", "handstand", "pistol", "burpee", "box jump", "salto", "toes", "sit up", "abdominal", "plank", "plancha", "hollow", "rope climb", "trepa", "ring", "gymnastic"];

function guessModality(n: string, ctx?: InferContext): Modality {
  if (has(n, CARDIO_WORDS)) return "M";
  if (ctx?.hasLoad || ctx?.bucket === "strength" || has(n, LOAD_WORDS)) return "W";
  return "G";
}

function guessPattern(n: string, modality: Modality): Pattern {
  if (modality === "M") return "monostructural";
  if (has(n, ["clean", "snatch"])) return "olympic";
  if (has(n, ["squat", "sentadilla", "lunge", "zancada", "thruster", "wall ball", "pistol"])) return "squat";
  if (has(n, ["deadlift", "peso muerto", "hinge", "swing", "good morning", "rdl", "kb"])) return "hinge";
  if (has(n, ["bench", "banca", "push up", "flexion", "dip", "fondo"])) return "horizontal-push";
  if (has(n, ["press", "jerk", "handstand", "hspu", "overhead"])) return "vertical-push";
  if (has(n, ["pull", "dominada", "muscle up", "row", "remo", "rope climb", "trepa", "chin"])) return "vertical-pull";
  if (has(n, ["carry", "farmer", "sandbag", "lug"])) return "carry";
  if (has(n, ["toes", "sit up", "abdominal", "plank", "plancha", "hollow", "ghd", "v up", "core"])) return "core";
  return "gymnastics-skill";
}

function guessSkills(modality: Modality): GeneralSkill[] {
  if (modality === "M") return ["cardio", "stamina"];
  if (modality === "W") return ["strength", "power"];
  return ["stamina", "coordination"];
}

function guessWorkModel(n: string, modality: Modality): WorkModel {
  // Honest by default: don't fabricate joules for an unknown loaded movement.
  // Only ergs/runs have an unambiguous work source from what we capture.
  if (has(n, ["row", "remo", "bike", "bici", "ski", "erg", "assault", "echo"])) return "erg-calories";
  if (has(n, ["run", "correr", "carrera", "trote"])) return "distance";
  if (modality === "M") return "none";
  return "none";
}

/**
 * Best-effort classification of an UNKNOWN movement from its name (+ optional
 * block context). Never throws; always returns an Exercise flagged
 * `source:"inferred"`, `confidence:"low"`. workModel defaults to "none" so we
 * never invent work/power — volume (weight×reps), RPE, load and e1RM still work
 * downstream; only displacement-based work and a confident M/G/W split wait for
 * a real catalog entry. This is the open-world safety net (see BLUEPRINT §3.2.1).
 */
export function inferExercise(raw: string, ctx?: InferContext): Exercise {
  const n = norm(raw);
  const modality = guessModality(n, ctx);
  const pattern = guessPattern(n, modality);
  return {
    id: `inferred:${n.replace(/\s+/g, "-") || "movimiento"}`,
    name: String(raw || "").trim() || "Movimiento sin nombre",
    aliases: [],
    modality,
    pattern,
    loadType: modality === "M" ? "machine" : ctx?.hasLoad || modality === "W" ? "external" : "bodyweight",
    unilateral: false,
    skills: guessSkills(modality),
    workModel: guessWorkModel(n, modality),
    source: "inferred",
    confidence: "low",
  };
}

// User catalog overrides: the athlete/coach classifies an unknown movement
// (1-tap) → we remember it so future analysis is correct, without a code
// release. Keyed by normalized name. Stored nexus_-prefixed (syncs).
const OVERRIDES_KEY = STORAGE_KEYS.CATALOG_OVERRIDES;

function loadOverrides(): Record<string, { modality: Modality; pattern: Pattern }> {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    const o = raw ? JSON.parse(raw) : {};
    return o && typeof o === "object" ? o : {};
  } catch {
    return {};
  }
}

/** Persist a user classification for an unknown movement (modality + pattern). */
export function classifyMovement(name: string, modality: Modality, pattern: Pattern): void {
  try {
    const o = loadOverrides();
    o[norm(name)] = { modality, pattern };
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(o));
    if (typeof window !== "undefined") window.dispatchEvent(new Event("nexus_logs_updated"));
  } catch {
    /* ignore */
  }
}

/**
 * The resolver callers should use when they must not fail: a catalog match
 * (source "catalog"), then a user override (source "user"), then an inferred
 * stub (source "inferred"). Never returns null — the app keeps working when
 * chapter 2 brings movements the catalog hasn't met yet.
 */
export function resolveOrInfer(raw: string, ctx?: InferContext): Exercise {
  const hit = resolveExercise(raw);
  if (hit) return { ...hit, source: hit.source ?? "catalog", confidence: "high" };
  const ov = loadOverrides()[norm(raw)];
  const inferred = inferExercise(raw, ctx);
  if (ov) {
    return { ...inferred, modality: ov.modality, pattern: ov.pattern, source: "user", confidence: "high" };
  }
  return inferred;
}
