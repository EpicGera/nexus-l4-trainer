import { WORKOUT_DATABASE } from './src/data/workouts';
import * as fs from 'fs';

let output = "# 📅 PROGRAMACIÓN MES 1 - DETALLE DE AUDITORÍA\n\n";

const cleanHtml = (str) => {
  if (!str) return '';
  return str.replace(/<[^>]*>?/gm, '');
};

for (const [weekId, weekData] of Object.entries(WORKOUT_DATABASE)) {
  if (!['w1', 'w2', 'w3', 'w4'].includes(weekId)) continue;
  output += `## 🔹 SEMANA ${weekId.replace('w', '')}: ${weekId === 'w4' ? 'DELOAD / DESCARGA' : 'FASE DE DESARROLLO'}\n\n`;

  for (const day of weekData.days) {
    output += `### 🗓️ ${day.name} - ${day.title}\n`;
    
    for (const v of day.variations) {
      output += `\n#### 🏋️ MODALIDAD: ${v.tabName}\n`;
      
      const blocks = [v.warmup, v.strength, v.metcon, v.accessories];
      const types = ['WARM-UP', 'FUERZA', 'METCON', 'ACCESORIO'];
      
      blocks.forEach((b, i) => {
        if (!b) return;
        
        let schemeRaw = cleanHtml(b.scheme).toUpperCase();
        output += `**${b.title}** [${schemeRaw}]\n`;
        for (const item of b.items) {
           output += `• ${cleanHtml(item)}\n`;
        }
        output += '\n';
      });
    }
    output += `---\n\n`;
  }
}
fs.writeFileSync('mes1_dump.md', output);
