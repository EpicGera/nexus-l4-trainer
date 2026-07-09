# Estilos de referencia — ADN de programación

Material crudo (transcripciones de programas reales) del que se **destilan** los
`StyleExemplar` en `src/data/styleExemplars.ts`. El generador de capítulos NO
lee estos archivos: consume los exemplars destilados (condensados), que se
inyectan al prompt vía `exemplarsPromptBlock(selectExemplars(...))` en
`buildChapterPrompt` (`src/lib/chapterCreator.ts`).

## Relación con la enciclopedia (`docs/NEXUSL4V7.MD`)

Dos capas distintas, no redundantes:
- **La enciclopedia** es el grounding constitucional — prosa metodológica que
  alimenta las TRES features de IA (generación, auditoría, chat coach) vía
  `encyclopediaContext.ts`. Ya tiene una Parte IV dedicada a HWPO y apéndices
  de referencia rápida (B, G, H...).
- **`styleExemplars.ts`** es una capa más chica y concreta — solo para
  generación de capítulos — con ejemplos de "cómo se ve escrito" (voz, formato).

**Regla:** los datos NUMÉRICOS reutilizables (ratios de sustitución, tablas de
conversión, coeficientes) van en la enciclopedia como única fuente de verdad
(ej. Apéndice G). `styleExemplars` los referencia en vez de duplicarlos —
evita que ambas capas diverjan con el tiempo. Ya pasó una vez: un ratio de
HSPU quedó mal atribuido en `styleExemplars` por una lectura ambigua de la
tabla escaneada; se corrigió al fusionar en el Apéndice G.

## Objetivo

Que Nexus **aprenda cómo programa cada escuela** (HWPO, PRVN, Mayhem, HAEDO) y
**combine lo mejor de cada una** según lo que la periodización del atleta pide —
nunca que copie literal ni que arme todo con una sola escuela.

## Cómo sumar una escuela / más ejemplos

1. Pegá la transcripción cruda en `docs/estilos-referencia/<ESCUELA>.md`.
2. Destilá 1 exemplar por facet (`structure`, `strength`, `accessory`, `metcon`,
   `cardio`, `skill`) en `styleExemplars.ts`, en el array de esa escuela. Cada
   uno: un `pattern` (insight en una línea) + un `example` condensado (cómo
   prescribe esa escuela ese facet). Condensado, NO el WOD entero — el prompt
   debe quedar liviano.
3. El selector reparte entre escuelas solo; al sumar PRVN/Mayhem/HAEDO el
   generador empieza a combinar automáticamente.

## Estado

- **HWPO** — sembrado (Strong 2.0 · Foundations · Flagship). Ver `HWPO.md`.
- **PRVN / MAYHEM / HAEDO** — pendientes de transcripciones.
