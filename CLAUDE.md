# Sistema de Memoria Persistente - Claude Code

## Reglas de Gestión de Contexto
1. Mantener este archivo siempre por debajo de las 200 líneas de longitud para mitigar la degradación del contexto (context rot).
2. No almacenar listados masivos de código; externalizar esos datos a archivos dedicados dentro de `claude/memory/domains/`.
3. Al recibir la instrucción explícita "reorganize memory", proceder a escanear los logs diarios, resolver hilos pendientes, eliminar redundancias y actualizar los índices maestros.

## Repositorios de Memoria Activos
- Índice de Proyecto General: `claude/memory/memory.mmd`
- Convenciones Globales: `claude/memory/general.mmd`

## Enciclopedia metodológica (constitución del sistema)

- **Documento vigente:** `docs/NEXUSL4V7.MD` (V7, generalizado multi-atleta). Es el grounding de toda feature de IA y la fuente de verdad metodológica.
- **Legacy archivado:** `docs/NEXUS-enciclopedia.LEGACY.md` (v2, hardcodeado a Gerardo). NO usar como referencia salvo arqueología; quedó obsoleto.
- El parser `src/lib/encyclopediaContext.ts` segmenta por `PARTE` (números romanos) y alimenta cada feature de IA. Nutrición + Lifestyle Gears viven en la **Parte XXIV** (portada del legacy); directivas LLM en **Parte XVIII**; glosario en **Apéndice J**. Si cambian los números de parte, actualizar los `getParts(...)` de ese archivo.

## graphify — Grafo de conocimiento del proyecto

El proyecto tiene un grafo de conocimiento generado por graphify en `graphify-out/`.

**Cuándo consultar el grafo (ANTES de leer archivos manualmente):**
- Preguntas de arquitectura ("¿cómo se conecta X con Y?", "¿quién llama a Z?")
- Trazado de flujo de datos entre módulos (ej: ExerciseLogger → sessionStore → syncEngine)
- Preguntas sobre qué archivos o funciones son centrales al proyecto
- Antes de refactorizar: entender el impacto de un cambio
- Cuando la pregunta cruza más de 2 archivos

**Cómo usar el grafo:**
- El grafo vive en `src/graphify-out/graph.json` (765 nodos, 1655 aristas, 52 comunidades)
- Si existe → `graphify query "<pregunta>" --graph src/graphify-out/graph.json` (NO reconstruir)
- Si no existe → `/graphify src --no-viz` para reconstruirlo
- Para actualizar tras cambios de código → `graphify src --update --no-viz`

**El grafo NO reemplaza leer código** cuando se necesita el contenido exacto de una función. Es el mapa; el código fuente es el territorio.
