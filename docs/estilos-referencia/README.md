# Estilos de referencia — ADN de programación

Material crudo (transcripciones de programas reales) del que se **destilan** los
`StyleExemplar` en `src/data/styleExemplars.ts`. El generador de capítulos NO
lee estos archivos: consume los exemplars destilados (condensados), que se
inyectan al prompt vía `exemplarsPromptBlock(selectExemplars(...))` en
`buildChapterPrompt` (`src/lib/chapterCreator.ts`).

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
