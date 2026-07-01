# Formato canónico de programa — Nexus L4 (`schemaVersion: "1.0"`)

Este es el **único formato de intercambio** entre frontends (la app React actual y el
front nuevo en Flutter). Un programa = un capítulo de entrenamiento. Hay **un solo
modelo de bloques**: cada variación de un día tiene una lista ordenada `blocks[]` y
**nada más**. No existen los campos legacy `warmup/strength/metcon/accessories`.

> Regla de oro para el consumidor: **renderizá `blocks[]` en orden y listo.** Un día
> puede tener 1, 2, 5 u 8 bloques, y puede haber varios del mismo `bucket` (p. ej. dos
> de `strength`: Back Squat y Front Squat). Nunca asumas “un bloque por tipo”.

## Estructura

```jsonc
{
  "schemaVersion": "1.0",
  "title": "ACTO II — SUN KEN ROCK",   // opcional: nombre del capítulo
  "lore": "Seúl. Inspiración: Sun Ken Rock.", // opcional: narrativa
  "weeks": [
    {
      "week": 1,                  // número de semana (1..N)
      "intention": "intensificacion", // opcional, ver enum
      "gear": 3,                  // opcional, 1..5 (Lifestyle Gear)
      "days": [
        {
          "id": "w1d1",          // id estable: w{semana}d{dia}
          "name": "LUNES",
          "title": "El Pico y la Montaña (Monte Jirisan)",
          "variations": [
            {
              "tabName": "RX · MODO COMPETIDOR", // nivel/variante
              "blocks": [
                {
                  "key": "b2_strength", // id estable del bloque (ordena por bN_)
                  "bucket": "strength", // categoría (enum, ver abajo)
                  "title": "02. FUERZA (Piernas de Roca)",
                  "scheme": "4x6 @ 75-80% RM | Rest 2 Min",
                  "items": ["Back Squat - 4x6 (75-85kg)", "Tempo 21X1"],
                  "capSec": 840,            // opcional: time cap en segundos
                  "timeDomain": "medium",   // opcional (solo metcon), ver enum
                  "energySystem": "mixed",  // opcional (solo metcon), ver enum
                  "inspiration": "HWPO"     // opcional: marca de inspiración
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## Enums

| Campo | Valores |
|---|---|
| `bucket` | `warmup` · `strength` · `metcon` · `accessories` |
| `intention` (semana) | `acumulacion` · `intensificacion` · `realizacion` · `restauracion` |
| `timeDomain` (bloque) | `sprint` (<2 min) · `short` (2–8) · `medium` (8–20) · `long` (20+) |
| `energySystem` (bloque) | `phosphagen` · `glycolytic` · `oxidative` · `mixed` |
| `inspiration` (bloque) | `PRVN` · `MAYHEM` · `HWPO` · `HAEDO` |

## Notas para el consumidor (Flutter)

- **Orden:** los bloques vienen ya ordenados; respetá el orden del array. El prefijo
  `bN_` del `key` refleja la posición cronológica.
- **`bucket` es categoría, no posición.** Sirve para iconos/colores; no para agrupar ni
  deduplicar. Dos bloques `strength` son dos tarjetas distintas.
- **Campos opcionales:** `capSec`, `timeDomain`, `energySystem`, `inspiration`,
  `intention`, `gear`, `title`, `lore` pueden faltar. Tratalos como nullables.
- **`items`** son líneas de texto libre (pueden traer cargas, tempos, notas entre
  paréntesis). No vienen parseadas.
- **`id`** (`w{semana}d{dia}`) es la clave para guardar resultados/avances por día.

## Producción / consumo en la app React

- **Exportar:** `toCanonicalProgram(db, meta)` en
  [`src/lib/canonicalProgram.ts`](../src/lib/canonicalProgram.ts) — el botón Descargar
  de la Biblioteca de Capítulos emite este formato.
- **Importar:** `parseJsonToDatabase` acepta tanto este formato (`weeks[]`) como el viejo
  (`{ w1: { days } }`); internamente sigue derivando las lanes legacy para sus consumidores
  históricos, pero eso no se exporta.
- **Round-trip garantizado** por tests en `canonicalProgram.test.ts` (db → canónico → db
  preserva todos los bloques, incluidos dos del mismo bucket).
