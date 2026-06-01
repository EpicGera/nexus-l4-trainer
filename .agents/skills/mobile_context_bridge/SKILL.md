---
name: mobile-context-bridge
description: "Empaqueta todo el contexto del proyecto (código fuente y configuraciones) en un solo archivo Markdown para llevar a dispositivos móviles (Google AI Studio / Gemini App)."
---

# Mobile Context Bridge (Transición de Dominio)

Esta skill define el procedimiento táctico para trasladar el contexto de trabajo pesado en la PC hacia un entorno móvil (Google AI Studio).

## 1. El Problema
Los LLMs en dispositivos móviles no tienen acceso directo al sistema de archivos local de tu PC (Antigravity). Para continuar un proyecto sin perder la "huella digital" y la lógica construida, necesitamos inyectar todo el código relevante como un "Context Dump".

## 2. La Solución
Se utiliza el script `dump_context.ps1` que escanea las carpetas principales del proyecto (como `src/`, `package.json`, etc.) y las compila en un único archivo consolidado llamado `mobile_dump.md`.

## 3. Instrucciones de Uso

Cuando el usuario pida "empaquetar el proyecto para el celular", "armar el dump", o invoque esta skill, el Agente debe ejecutar el siguiente comando en la terminal:

```powershell
powershell.exe -ExecutionPolicy Bypass -File .agents/skills/mobile_context_bridge/scripts/dump_context.ps1
```

## 4. Post-Ejecución
Una vez que el script finalice, dile al usuario:
1. "El paquete está listo. Busca el archivo `mobile_dump.md` en la raíz del proyecto."
2. "Envíate ese archivo al celular (por WhatsApp, Drive o Email)."
3. "En tu celular, abre Google AI Studio, sube el archivo `.md` y dale el siguiente prompt inicial:"
   > *"Eres Nexus L4. Te adjunto el 'mobile_dump.md' con todo mi proyecto actual. Analízalo para tener el contexto y prepárate para mis próximas instrucciones."*
