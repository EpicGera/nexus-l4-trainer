# Guía para generar una programación mensual — Nexus L4 (IA externa)

> **Propósito:** este documento se le entrega a una IA externa (ChatGPT, Claude, Gemini, etc.)
> para que genere un programa de entrenamiento mensual completo y lo devuelva en un
> **archivo JSON** que la app Nexus L4 puede montar e integrar directamente como nuevo
> programa en progreso.
>
> **Cómo usarlo:** copiá este documento entero en el chat de la IA, agregá tu pedido
> concreto (ver §7) y pedile que devuelva **solo el JSON** en un bloque de código.
> Guardá ese JSON como `.json` y cargalo en la app (ver §8).

---

## 1. Qué tenés que devolver (regla de oro)

Un **único objeto JSON** cuyas claves de primer nivel son las semanas: `w1`, `w2`, `w3`, `w4`.
Cada semana contiene un arreglo de **días** (máximo 7). Cada día tiene **bloques** (cada
bloque con `title`, `scheme` e `items`). Hay **dos formatos de bloques**, los dos válidos:

- **Formato fijo (4 bloques):** las claves son exactamente `warmup`, `strength`, `metcon`,
  `accessories`. Simple, ideal para programas clásicos.
- **Formato flexible (recomendado):** claves `b1_…`, `b2_…`, `b3_…` numeradas y ordenadas,
  con **nombres libres** (`b2_skill`, `b4_grunt`, `b3_finisher`, `b2_gymnastics`, …) y de
  **2 a N bloques por día**. Permite días con halterofilia técnica, gimnasia, grunt work,
  finishers, etc., en el orden real de la sesión. Ver §2.4.

```
{ w1: { days: [ Día, Día, … ] }, w2: { … }, w3: { … }, w4: { … } }
```

- Devolvé **solo el JSON**, sin texto antes ni después, en un bloque ```json … ```.
- La app preserva el **orden** de los bloques flexibles por el número del prefijo `bN_`.
- No uses comentarios dentro del JSON (JSON puro, no JSON5).

---

## 2. Esquema exacto (lo que la app lee)

### 2.1 Estructura completa de un día

```json
{
  "id": "w1d1",
  "name": "LUNES",
  "title": "La Guarida del Mal",
  "variations": [
    {
      "tabName": "RX · REGISTRO REAL",
      "warmup":      { "title": "01. WARM-UP",    "scheme": "AMRAP 6 MIN",            "items": ["Remo", "Banded Good Mornings"] },
      "strength":    { "title": "02. FUERZA",     "scheme": "4x6 @ 65-70% | Rest 90s","items": ["Back Squat"] },
      "metcon":      { "title": "03. METCON",     "scheme": "AMRAP 12 MIN",           "items": ["10 Burpees", "15 Wall Balls (9kg)"] },
      "accessories": { "title": "04. ACCESORIOS", "scheme": "3 Series",               "items": ["Plancha 60s", "V-Ups Lastrados"] }
    }
  ]
}
```

### 2.2 Campos, por nivel

**Día**

| Campo        | Tipo     | Obligatorio | Notas |
|--------------|----------|-------------|-------|
| `id`         | string   | No (recom.) | Formato `w<semana>d<día>`, ej. `w2d3`. Si falta o es inválido, la app lo deriva de la posición. |
| `name`       | string   | No          | Día de la semana en mayúsculas. Si falta: LUNES, MARTES, MIÉRCOLES, JUEVES, VIERNES, SÁBADO, DOMINGO según posición. |
| `title`      | string   | No (recom.) | Nombre temático del día (lore). Ver §5. |
| `variations` | array    | No          | Normalmente **una** variación. Ver §4 para multi-variación (PLAN A/B). |

**Bloque** (`warmup` / `strength` / `metcon` / `accessories`)

| Campo    | Tipo       | Obligatorio | Notas |
|----------|------------|-------------|-------|
| `title`  | string     | No          | Encabezado del bloque. Usá los estándar: `01. WARM-UP`, `02. FUERZA`, `03. METCON`, `04. ACCESORIOS`. |
| `scheme` | string     | No          | El esquema/protocolo (series×reps, %RM, formato metcon, tiempo). Texto libre. Ver §3.3. |
| `items`  | string[]   | Sí          | Los ejercicios, uno por string. **Sin esto el bloque queda vacío.** |

> **Importante sobre `items`:** son **strings de texto libre**, no objetos. La carga, reps
> y unidades van dentro del propio texto del item (ej. `"Wall Balls — 15 reps (9kg)"`).
> Strings vacíos o solo-espacios se descartan automáticamente.

### 2.2.1 Formato LEGIBLE del item (clave para el auto-registro) ⚠️

La app **pre-registra las series prescritas por defecto** leyendo el texto del item. Para que
funcione, **cada ejercicio de fuerza/skill/accesorios debe declarar series×reps (o tiempo)** en
su propio string. Reglas duras:

| Tipo | Escribilo así | La app lee |
|------|---------------|------------|
| Series × reps | `"Back Squat — 4×6 @ 70% WM"` · `"5×5 Pike Push-ups"` | 4 series de 6 / 5 series de 5 |
| Reps por lado | `"Bulgarian Split Squat — 3×8 por pierna @ 15kg"` | 8 reps, 15kg (series del scheme) |
| Hold por tiempo | `"Handstand Hold — 3×20s"` | 3 series de 20s |
| Carga explícita | `"… @ 60kg"` o `"… (60kg)"` | 60 kg |

- **NO** dejes el ejercicio sin número (`"Pike Push-ups a tempo"` ❌ → la app no sabe cuántas).
  Si es EMOM/AMRAP de reps libres, decilo en reps (`"EMOM: 8 Pike Push-ups por minuto"`).
- **NO** escribas la carga como multiplicador ambiguo (`"DB 2x15kg"` se confunde con reps);
  usá `"@ 15kg"` o `"(15kg)"`.
- Las **reps pueden ir en el `scheme` del bloque** si todos los items comparten esquema
  (`"scheme": "4x6 @ 70% WM"`), pero preferí declararlas por item cuando varían.
- Los items del **metcon** llevan reps como prefijo (`"50 Box Jump Overs"`, `"15 Wall Balls (9kg)"`)
  y NO se registran serie por serie (el resultado del metcon se mide aparte por su `scheme`).

#### Carga: TODO movimiento con peso → SIEMPRE `% WM` ⚠️

Cualquier movimiento que use peso (barra, mancuernas, kettlebell, balón, lastre) **debe** prescribir
su carga como **`% WM`** (porcentaje del Working Max del atleta). La app calcula el kg real desde la
marca del atleta, así la carga **escala y se autorregula** sola. Aplica a TODO: desde un clean & jerk
hasta un V-up lastrado.

| Movimiento | Escribilo así (✓) | Evitá (✗) |
|------------|-------------------|-----------|
| Levantamiento | `"Clean & Jerk — 5×3 @ 80% WM"` | `"Clean & Jerk 5x3"` (sin carga) |
| Accesorio DB | `"Bulgarian Split Squat — 3×8 @ 70% WM"` | `"Bulgarian Split Squat 3x8"` |
| Kettlebell | `"KB Swing — 20 reps @ 100% WM"` | `"KB Swing 20 reps"` |
| Lastre | `"V-up lastrado — 3×12 @ 60% WM"` | `"V-up lastrado 3x12"` |

- **Nunca** dejes un movimiento con peso sin carga, ni uses **kg absoluto** si hay base WMD —
  preferí siempre `% WM` (el kg absoluto no escala ni autorregula).
- Movimientos sin peso real (peso corporal puro, bandas elásticas, cardio) **no** llevan `% WM`.
- La app **audita** esto al importar/generar y marca cualquier movimiento con peso sin carga.

### 2.2.2 Títulos y notas (mantené los títulos limpios)

- El `title` del bloque es **solo el label**: `"02. FUERZA"`, `"02. SKILL"`, `"03. METCON"`.
  **NO** metas cues, clasificaciones ni descriptores en el título (`"02. SKILL (Gimnasia Empuje
  Invertido)"` ❌, `"03. METCON (El Sub-Jefe) [Resistencia…]"` ❌). El nombre temático va en el
  `title` del **día**, no del bloque.
- Las notas/coaching van **como items aparte** con prefijo `[NOTA]:` (`"[NOTA]: Costillas
  adentro, empujá el suelo."`). La app las muestra como guía y nunca las registra como ejercicio.

> La app trae un **auditor** que valida el JSON al importarlo: limpia títulos automáticamente y
> te marca qué items no son legibles, así corregís el origen antes de entrenar.

### 2.3 Forma mínima válida (la IA puede ser más escueta)

El parser es **tolerante**. Esto también es válido y la app lo completa solo:

```json
{
  "w1": {
    "days": [
      { "title": "Día de Fuerza", "strength": { "items": ["Back Squat 5x5 @ 75%"] } }
    ]
  }
}
```

La app deriva: `id → "w1d1"`, `name → "LUNES"`, `tabName → "ÚNICO"`, y los bloques
faltantes (`warmup`, `metcon`, `accessories`) quedan vacíos. **Aun así, preferí la forma
completa de §2.1** para que el atleta vea un día bien armado.

> Atajo extra: una semana puede ser directamente un arreglo de días, sin envolver en `days`:
> `{ "w1": [ {día}, {día} ] }`. Funciona igual.

### 2.4 Formato de bloques FLEXIBLE (recomendado para días ricos)

Cuando un día tiene más de cuatro piezas, o piezas que no encajan en los 4 nombres fijos
(halterofilia técnica, gimnasia, grunt work, finisher…), usá claves `bN_nombre` numeradas:

```json
{
  "tabName": "RX · MODO COMPETIDOR",
  "b1_warmup":      { "title": "01. WARM-UP",            "scheme": "AMRAP 10 MIN",        "items": ["2 Min Bici", "10 Inchworms"] },
  "b2_skill":       { "title": "02. HALTEROFILIA TÉCNICA","scheme": "10 MIN RELOJ",        "items": ["3 Tall Muscle Clean + 3 Front Squat"] },
  "b3_strength":    { "title": "03. FUERZA",             "scheme": "4x6 @ 65-70% WM",     "items": ["Front Squat — Tempo 21X1"] },
  "b4_metcon":      { "title": "04. METCON",             "scheme": "AMRAP 14 MIN",        "items": ["15 Wall Balls (9kg)", "10 Burpees", "5 Hang Power Cleans (50kg)"] },
  "b5_accessories": { "title": "05. ACCESORIOS",         "scheme": "3 Series",            "items": ["DB Bench Press — 3×12 @ 15kg", "Plancha Lastrada — 3×60s"] }
}
```

Reglas del formato flexible:
- **La clave debe empezar con `b<n>_`** (`b1_`, `b2_`, …). Ese número define el **orden**.
- Después del `_`, **nombre libre** que sugiere el tipo: `warmup`, `skill`, `strength`,
  `metcon`, `gymnastics`, `grunt`, `accessories`, `finisher`, etc.
- Cada bloque sigue teniendo `title`, `scheme`, `items` (igual que el formato fijo).
- Podés mezclar días con 2 bloques (recuperación) y días con 5 (competidor) en el mismo programa.
- La app preserva todos los bloques en orden; además los mapea internamente a las 4 lanes
  clásicas para sus análisis (skill/halterofilia/gimnasia → fuerza; grunt/finisher → accesorios).

> **Working Max (`% WM`)**: en `scheme` de fuerza, expresá los porcentajes sobre el Working
> Max (90% del 1RM), no sobre el 1RM real. Ej: `"4x6 @ 65-70% WM"`. Ver enciclopedia, cap. 17.

### 2.5 Intención de bloque y Engranaje por semana (`meta`)

Cada semana puede declarar su **intención** (la adaptación dominante del bloque) y el
**Engranaje** de estilo de vida, con una clave `meta` al lado de `days`:

```json
{
  "w3": {
    "meta": { "intention": "realizacion", "gear": 4 },
    "days": [ ... ]
  }
}
```

- `intention`: una de `acumulacion` · `intensificacion` · `realizacion` (peak) · `restauracion`
  (deload). También acepta alias en inglés/sinónimos (`deload`, `peak`, `accumulation`…).
- `gear`: 1 a 5 (Engranaje, enciclopedia cap. 60). Opcional.
- Si **no** ponés `meta`, la app **infiere** la intención de los títulos/schemes (ej. "Deload"
  → restauración, "Peak Week" → realización) y la marca como inferida. Aun así, **declararla
  explícitamente es mejor**. La periodización típica del mes: w1 acumulación · w2 intensificación ·
  w3 realización/peak · w4 restauración/deload.

---

## 3. Semántica de los bloques

Los días se renderizan SIEMPRE en este orden. Asigná cada ejercicio al bloque correcto:

### 3.1 `warmup` — Preparación / activación
Calentamiento, movilidad, activación, técnica ligera, cardio Zona 2 de entrada.
Acá también van **días de recuperación** (sauna, tina, caminata, movilidad).

### 3.2 `strength` — Fuerza / levantamientos
Levantamientos con carga y esquema de series×reps: sentadillas, pesos muertos,
press, olímpicos (snatch, clean & jerk), trabajo de fuerza dedicado.
Si el día no tiene bloque de fuerza (ej. día puro de cardio), dejá `items: []`.

### 3.3 `metcon` — Acondicionamiento metabólico (el WOD)
El corazón del día CrossFit. Acá va el AMRAP / For Time / EMOM / intervalos.
**El `scheme` del metcon debe declarar el protocolo claramente**, porque define cómo
se registra después en la app. Formatos reconocidos:

| Formato     | Ejemplo de `scheme`              | Qué mide |
|-------------|----------------------------------|----------|
| AMRAP       | `"AMRAP 12 MIN"`                  | Rondas + reps en tiempo fijo |
| For Time    | `"FOR TIME (Cap 15 MIN)"`        | Tiempo total (o reps al cap si no termina) |
| EMOM        | `"EMOM 16 MIN"`                  | Trabajo por minuto |
| Intervalos  | `"3 Min ON / 1 Min OFF x 4"`     | Bloques de trabajo/descanso |
| Continuo    | `"35 Minutos Continuos Zona 2"`  | Cardio sostenido |

### 3.4 `accessories` — Accesorios / finisher
Trabajo accesorio, hipertrofia localizada, core, carries, correctivos, finishers.

---

## 4. Variaciones (opcional — días con pestañas A/B)

Casi siempre un día tiene **una sola variación** (`tabName: "RX · REGISTRO REAL"` o `"ÚNICO"`).
Si querés ofrecer dos planes el mismo día (ej. RX vs Escalado, o Plan-Box vs Plan-Casa),
poné **dos objetos** en `variations`:

```json
"variations": [
  { "tabName": "RX",       "strength": { "items": ["Snatch 5x2 @ 80%"] }, "metcon": { "items": ["..."] } },
  { "tabName": "ESCALADO", "strength": { "items": ["Power Snatch 5x3 @ 65%"] }, "metcon": { "items": ["..."] } }
]
```

Si no ponés `tabName`, la app deriva `PLAN A`, `PLAN B`, … automáticamente cuando hay más de una.

---

## 5. Tono temático (lore) — el campo `title`

Nexus L4 es un proyecto con estética **oscura / brutalista / ARPG (estilo Diablo × SMT)**.
Cada día lleva un `title` temático que nombra al "boss" o escenario de ese entrenamiento.
Ejemplos del proyecto: `"La Guarida del Mal"`, `"Espectros del Abismo"`, `"Brujo de las Sombras"`,
`"Gólem de Hierro"`, `"Gargantúa"`, `"Hordas del Infierno"`, `"Descanso Activo"`.

**Pedile a la IA que invente títulos en esta línea**, idealmente con un hilo narrativo a lo
largo del mes (ej. una incursión que progresa hacia un boss final en la semana 4). El día de
descanso suele llamarse algo como `"Portal de Regeneración"` o `"Descanso Activo"`.

---

## 6. Cómo periodizar el MES (metodología)

Un buen mes no es repetir el mismo día 4 veces. Estructura recomendada (4 semanas / mesociclo):

| Semana | Intención        | Carga típica de fuerza        | Densidad metcon |
|--------|------------------|-------------------------------|-----------------|
| **w1** | Acumulación      | 4x8 @ 65-70%                  | Media |
| **w2** | Acumulación+     | 4x6 @ 70-75%                  | Media-Alta |
| **w3** | Intensificación  | 5x3-5 @ 80-85%                | Alta |
| **w4** | Restauración/Deload | 3x5 @ 50-60% (o test/PR)   | Baja |

Principios para que el programa sea **variado y equilibrado** (CrossFit real):

1. **Tres modalidades** a lo largo de la semana — equilibrá:
   - **M** (Monoestructural / cardio: remo, bike, run, ski, comba)
   - **G** (Gimnástico: pull-ups, HSPU, muscle-ups, peso corporal)
   - **W** (Halterofilia / cargas externas: snatch, clean, squat, deadlift, press)
2. **Patrones de movimiento** repartidos en la semana: sentadilla, bisagra de cadera (hinge),
   empuje, tracción, acarreo (carry), core. No machaques el mismo patrón días seguidos.
3. **Dominios de tiempo** variados en los metcons: sprint (<5'), corto (5-10'),
   medio (10-20'), largo (20'+).
4. **Progresión semana a semana** — sube intensidad/densidad w1→w3, descarga en w4.
5. **Rotá los levantamientos** entre días/semanas; no pongas Back Squat los 5 días.
6. **Día(s) de descanso** reales: 1-2 por semana, como bloque `warmup` de movilidad/recuperación.

> Si querés más profundidad metodológica (decisión por nivel de atleta, vetos de seguridad,
> estilos Mayhem / PRVN / HWPO / CF-L4), está en `docs/NEXUSL4V7.MD` del proyecto;
> podés pegar también ese archivo a la IA externa.

---

## 7. Prompt sugerido para la IA externa

Pegá este documento y luego algo como:

```
Usá la guía de arriba. Generá un programa de entrenamiento de CrossFit de 4 semanas
(w1-w4), 5 días de entrenamiento + 1-2 de descanso por semana.

CONTEXTO DEL ATLETA:
- Nivel: intermedio
- Objetivo del mes: mejorar capacidad de trabajo y técnica de halterofilia
- Equipo disponible: barra, rack, remo, kettlebells, cajón, comba
- Puntos débiles a atacar: tracción gimnástica (pull-ups) y motor (Zona 2)
- Días/semana: 6 (5 trabajo, 1 descanso activo)
- Duración por sesión: ~60 min

REQUISITOS:
- Periodizá: w1-w2 acumulación, w3 intensificación, w4 deload.
- Equilibrá M/G/W y los patrones de movimiento en cada semana.
- Variá los formatos de metcon (AMRAP, For Time, EMOM, intervalos).
- Títulos temáticos ARPG oscuros, con hilo narrativo hacia un boss final en w4.
- Devolvé SOLO el JSON, en un bloque ```json, sin texto adicional.
```

---

## 8. Cómo montarlo en la app

1. Guardá la respuesta de la IA como un archivo, ej. `mi-programa-junio.json`.
2. Verificá que empiece con `{` y que tenga claves `w1`…`w4` (validá en cualquier visor JSON).
3. En la app Nexus L4 → panel **Sincronización / Nube** → botón **importar programa**
   (acepta `.json` y `.csv`).
4. La app valida con `parseJsonToDatabase`, muestra un resumen
   (`X semanas · Y días · Z ejercicios`) y lo instala como programa activo en progreso.
5. A partir de ahí registrás cada día con el botón **⚔ INCURSIÓN**.

**Si la app rechaza el archivo**, revisá:
- Que sea un objeto `{...}`, no un arreglo en la raíz.
- Que haya al menos una clave de semana válida (`w1`, `w2`, … en minúscula o mayúscula).
- Que cada día tenga al menos un `items` con ejercicios reales (no todo vacío).

---

## 9. Ejemplo completo y mínimo (1 semana, 3 días) — copiá este formato

```json
{
  "w1": {
    "days": [
      {
        "id": "w1d1",
        "name": "LUNES",
        "title": "La Guarida del Mal",
        "variations": [
          {
            "tabName": "RX · REGISTRO REAL",
            "warmup":      { "title": "01. WARM-UP",    "scheme": "AMRAP 6 MIN",             "items": ["Remo 300m", "Banded Good Mornings x10", "Cossack Squats x10"] },
            "strength":    { "title": "02. FUERZA",     "scheme": "4x6 @ 70% | Rest 90s",    "items": ["Back Squat"] },
            "metcon":      { "title": "03. METCON",     "scheme": "AMRAP 12 MIN",            "items": ["12 Wall Balls (9kg)", "9 Toes-to-Bar", "6 Power Cleans (60kg)"] },
            "accessories": { "title": "04. ACCESORIOS", "scheme": "3 Series",                "items": ["Goblet Bulgarian Split Squat x10/pierna", "Hollow Hold 40s"] }
          }
        ]
      },
      {
        "id": "w1d2",
        "name": "MARTES",
        "title": "Espectros del Abismo",
        "variations": [
          {
            "tabName": "RX · REGISTRO REAL",
            "warmup":      { "title": "01. WARM-UP",    "scheme": "10 MIN",                  "items": ["Movilidad de hombro", "Activación escapular con banda"] },
            "strength":    { "title": "02. FUERZA",     "scheme": "5x3 @ 80% | Rest 2 min",  "items": ["Push Press"] },
            "metcon":      { "title": "03. METCON",     "scheme": "EMOM 16 MIN (4 movimientos)", "items": ["Min 1: 12 Cal Bike", "Min 2: 10 Burpees", "Min 3: 14 KB Swings (24kg)", "Min 4: Descanso"] },
            "accessories": { "title": "04. ACCESORIOS", "scheme": "3 Rondas",                "items": ["Strict Pull-up x Max", "Farmer Carry 40m pesado"] }
          }
        ]
      },
      {
        "id": "w1d3",
        "name": "MIÉRCOLES",
        "title": "Portal de Regeneración",
        "variations": [
          {
            "tabName": "ÚNICO",
            "warmup":      { "title": "01. WARM-UP",    "scheme": "Recuperación",            "items": ["Caminata 20 min", "Movilidad completa de cadera y tobillo"] },
            "strength":    { "title": "02. FUERZA",     "scheme": "",                        "items": [] },
            "metcon":      { "title": "03. METCON",     "scheme": "30 MIN Continuos Zona 2", "items": ["Remo / Bike a ritmo conversacional"] },
            "accessories": { "title": "04. ACCESORIOS", "scheme": "Opcional",                "items": ["Sauna 15 min", "Foam Roller cuerpo completo"] }
          }
        ]
      }
    ]
  }
}
```

---

## 10. Checklist antes de entregar el JSON

- [ ] Es un objeto `{...}` con claves `w1`…`w4` (o las semanas que pidas).
- [ ] Cada semana tiene un arreglo de días (≤ 7).
- [ ] Cada día tiene `title` temático y, donde corresponde, los 4 bloques.
- [ ] Los `items` son **strings**, con carga/reps embebidas en el texto.
- [ ] El `scheme` del metcon declara el formato (AMRAP / For Time / EMOM / intervalos).
- [ ] Hay progresión semana a semana y equilibrio M/G/W + patrones.
- [ ] Hay día(s) de descanso.
- [ ] La respuesta es **solo el JSON**, sin texto extra.

## Archivo de DÍA SUELTO (pestaña ESPECIAL)

Además del programa completo, la app acepta un JSON de UN día para agregarlo
como pestaña ESPECIAL del día activo (botón "DÍA ESPECIAL"). Mismo contrato de
bloques; el original queda intacto y el wizard/cálculos lo toman igual.

```json
{
  "title": "TEAM WOD ESPECIAL",
  "variations": [{
    "b1_warmup": { "title": "01. WARM-UP", "scheme": "10 Min", "items": ["Remo suave"] },
    "b2_metcon": { "title": "02. METCON", "scheme": "AMRAP 14 Min", "items": ["15 Cal Row", "10 Burpees"] }
  }]
}
```

También se acepta la variación sola (el objeto interno de `variations`) sin wrapper.
