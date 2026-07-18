---
name: json-audit
description: Valida un JSON de programa Nexus (generado con IA externa) contra el contrato canónico ANTES de subirlo a Firestore - corre auditProgram, reporta títulos sucios, cues mezclados con ejercicios, pesos WMD faltantes y protocolos mal detectados. Trigger cuando el usuario pasa un archivo .json de programa (típicamente desde Descargas), o dice "revisa este json", "/json-audit".
---

# /json-audit — validar el JSON antes de que rompa la app

Gerardo genera programas mensuales con IA externa y los importa; cuando el JSON varía del contrato, se rompen títulos, el wizard no reconoce ejercicios, y aparecen bugs "misteriosos" río abajo. Validar SIEMPRE antes de subir.

## Flujo

1. Leer el archivo JSON que pasó (ruta tipo `C:\Users\JDB\Descargas\Nexus_L4_Programa_*.json`).
2. Correr el validador real del proyecto con un script Node/tsx efímero en el scratchpad que importe `auditProgram` de [auditProgram.ts](src/lib/auditProgram.ts) y le pase el JSON parseado.
3. Reportar el AuditResult completo + chequeos extra del historial de bugs:
   - Títulos con basura mezclada (números de bloque, protocolo pegado al nombre).
   - Cues/notas clasificados como ejercicios loggeables (nunca deben serlo).
   - Ejercicios con carga (KB swing, bulgarian, v-up lastrado, clean & jerk…) **sin peso WMD** — regla acordada: todo JSON nuevo incluye pesos WMD siempre.
   - Metcons sin protocolo detectable (el default vago a AMRAP está prohibido).
   - Claves de semana/día fuera del formato `wN`/`wNdN` o días duplicados.
4. Si hay problemas: listar cada uno con la ruta JSON exacta (`w2.days[3].blocks[1].title`) y proponer el fix. Ofrecer generar el JSON corregido en Descargas o scratchpad.
5. Solo con audit limpio, decir que está listo para importar/subir.
