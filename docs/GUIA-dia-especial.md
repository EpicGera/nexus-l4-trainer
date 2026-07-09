# Guía: generar un DÍA ESPECIAL en JSON (para pegar a la IA)

Un **día especial** es un WOD único (cumpleaños del box, competencia, team WOD,
día de deload improvisado) que se sube a la app como pestaña **ESPECIAL** del día
activo. **Suplanta** al día programado: se vuelve la pestaña por defecto, la
incursión lo loguea y todas las fórmulas/gráficos lo toman como el trabajo real
de ese día.

Este documento es el prompt. Copiá desde "PROMPT PARA LA IA" hasta el final y
pegalo en ChatGPT / Claude / Gemini. **Devuelve un archivo `.json`** y subilo con
el botón **"+ DÍA ESPECIAL"**.

> ⚠️ El error #1 es que la IA devuelve un **programa completo** (varias semanas o
> varios días) en vez de **un solo día**. La app rechaza eso. Un día especial es
> **UN día**.

---

## PROMPT PARA LA IA

Sos un programador de CrossFit nivel CF-L4. Generá **UN solo día** de
entrenamiento en JSON, siguiendo EXACTAMENTE este contrato. Devolvé **solo el
JSON**, sin texto antes ni después, sin ```markdown```.

### Formato bendecido (el único que se acepta)

Un objeto de día con `title` y un array `variations` de **una** variación. La
variación tiene bloques con clave `bN_<nombre>` (numerados en orden cronológico):

```json
{
  "title": "TEAM WOD DE CUMPLEAÑOS",
  "variations": [
    {
      "b1_warmup":  { "title": "01. WARM-UP", "scheme": "10 MIN", "items": ["Remo suave 3 min", "2 rondas: 10 air squats, 10 push-ups, 10 PVC pass-through"] },
      "b2_metcon":  { "title": "02. METCON",  "scheme": "AMRAP 14 MIN", "items": ["15 Cal Row", "12 Wall Balls @ 9kg", "9 Burpees"] }
    }
  ]
}
```

### Estructura de cada bloque

| Campo    | Obligatorio | Qué es |
|----------|-------------|--------|
| `title`  | recomendado | Nombre limpio del bloque (`"02. FUERZA"`). **Sin** cues ni clasificación entre paréntesis. |
| `scheme` | sí en metcon| El formato/esquema: `"AMRAP 14 MIN"`, `"For Time (cap 20)"`, `"EMOM 12"`, `"5x5 @ 80% WM"`. |
| `items`  | sí          | Array de **strings**. Un movimiento por string, con la carga/reps embebidas en el texto. |

Claves de bloque válidas: `b1_warmup`, `b2_strength`, `b3_metcon`,
`b4_accessories` — o cualquier `bN_<loquesea>`. El **número** define el orden; el
**nombre** sugiere la categoría (bucket). Podés tener varios bloques del mismo
tipo (`b2_strength` y `b4_strength` son dos tarjetas distintas).

### Reglas del auditor (si no las cumplís, el archivo se rechaza)

1. **Items legibles.** En bloques de fuerza/skill/accesorios, cada string debe
   declarar series/reps/carga o tiempo, para que la app pueda registrarlo:
   - ✅ `"Back Squat 5x5 @ 80% WM"`
   - ✅ `"Bulgarian Split Squat 3x10 @ 20kg"`
   - ✅ `"Plancha 3x45s"`
   - ❌ `"Back Squat"` (sin prescripción → no legible)
2. **Carga anclada (WMD).** Todo movimiento con peso de barra/mancuerna/kettlebell
   debe declarar la carga como **`% WM`** (preferido, escala y autorregula) o un
   **kg explícito**:
   - ✅ `"Deadlift 3x3 @ 85% WM"`  · ✅ `"Push Press 5x3 @ 60kg"`
   - ❌ `"Deadlift 3x3 pesado"` (sin carga anclada)
   - Bandas/gomas/soga NO necesitan carga.
3. **El scheme del metcon declara el formato.** `AMRAP n` / `For Time (cap n)` /
   `EMOM n` / intervalos. Sin formato, la clasificación energética falla.
4. **Un movimiento por item.** No metas `"15 Cal Row, 12 Wall Balls"` en un solo
   string; son dos items.
5. **Sin cues como ejercicios.** `"Mantené el core firme"` es una nota, no un
   movimiento loggable — está bien como nota suelta, pero no cuentes con que se
   registre.

### Campos opcionales (la app los deriva si faltan — no hace falta ponerlos)

`bucket` (`warmup`·`strength`·`metcon`·`accessories`), `timeDomain`
(`sprint`·`short`·`medium`·`long`), `energySystem`
(`phosphagen`·`glycolytic`·`oxidative`·`mixed`), `inspiration`
(`PRVN`·`MAYHEM`·`HWPO`·`HAEDO`), `capSec` (número, segundos).

---

## Ejemplos válidos completos

### Ejemplo A — mínimo (warm-up + metcon)

```json
{
  "title": "MURPH LIGERO",
  "variations": [
    {
      "b1_warmup": { "title": "01. WARM-UP", "scheme": "8 MIN", "items": ["Trote suave 400m", "2 rondas: 10 air squats, 5 push-ups"] },
      "b2_metcon": { "title": "02. METCON", "scheme": "For Time (cap 40)", "items": ["1600m Run", "100 Pull-ups", "200 Push-ups", "300 Air Squats", "1600m Run"] }
    }
  ]
}
```

### Ejemplo B — completo (5 bloques, con fuerza y skill)

```json
{
  "title": "DÍA ESPECIAL: FUERZA + BENCHMARK",
  "variations": [
    {
      "b1_warmup":      { "title": "01. WARM-UP",   "scheme": "10 MIN",          "items": ["Bike 3 min Zona 2", "Movilidad de cadera y tobillo", "2x5 Snatch grip deadlift con barra vacía"] },
      "b2_skill":       { "title": "02. SKILL",     "scheme": "10 MIN práctica", "items": ["Double Unders 5x30s", "Handstand hold 3x30s"] },
      "b3_strength":    { "title": "03. FUERZA",    "scheme": "5x3 @ 82% WM",    "items": ["Back Squat 5x3 @ 82% WM"] },
      "b4_metcon":      { "title": "04. METCON",    "scheme": "AMRAP 12 MIN",    "items": ["10 Thrusters @ 40kg", "12 Toes-to-Bar", "14 Cal Assault Bike"] },
      "b5_accessories": { "title": "05. ACCESORIOS","scheme": "3 rondas",        "items": ["Curl de bíceps 3x12 @ 12kg", "Plancha 3x45s"] }
    }
  ]
}
```

---

## Contraejemplos (lo que NO hay que devolver)

| Lo que la IA devuelve mal | Error que produce |
|---------------------------|-------------------|
| Un **programa completo** `{ "w1": { "days": [...] }, "w2": {...} }` | "El archivo es un programa de N días. Para la pestaña ESPECIAL exportá UN solo día." |
| Un **canónico multi-día** `{ "schemaVersion": "1.0", "weeks": [{ "days": [d1, d2, d3] }] }` | Mismo error de N días. |
| Un **array de varios días** `[ {día1}, {día2} ]` | Mismo error de N días. |
| Items con cues como movimientos: `"items": ["Back Squat — recordá respirar"]` sin reps | "No legible automáticamente" → se rechaza si son muchos. |
| Metcon sin formato: `"scheme": "duro"` | La clasificación energética falla; poné `AMRAP`/`For Time`/`EMOM`. |
| Peso sin anclar: `"Clean 5x3 pesado"` | "Movimiento con peso sin carga WMD" → usá `@ % WM` o kg. |

> La app **sí desanida** un programa de **exactamente 1 día** (`{w1:{days:[d]}}`,
> `{weeks:[{days:[d]}]}`, `[d]`) — pero lo correcto es entregar el día suelto.

---

## Checklist antes de entregar el JSON

- [ ] Es **UN** objeto de día (no un programa, no varias semanas, no varios días).
- [ ] Tiene `title` y `variations` con **una** variación.
- [ ] Cada bloque es `bN_<nombre>` con `title`, `scheme` e `items` (array de strings).
- [ ] Cada movimiento de fuerza/skill declara series/reps/carga o tiempo.
- [ ] Todo peso de barra/DB/KB lleva `@ Y% WM` o kg explícito.
- [ ] El `scheme` del metcon declara el formato (AMRAP / For Time / EMOM / intervalos).
- [ ] Un movimiento por item.
- [ ] La respuesta es **solo el JSON**, sin texto extra ni ```markdown```.
