import { WORKOUT_DATABASE } from './src/data/workouts';
import * as fs from 'fs';

let csv = "Semana,Dia,NombreDia,Variante,Bloque,Titulo,Esquema,Ejercicios\n";

const weeks = ['w1', 'w2', 'w3', 'w4'];
weeks.forEach(w => {
    const week = WORKOUT_DATABASE[w];
    if (!week) return;
    week.days.forEach(day => {
        day.variations.forEach(variation => {
            if (variation.tabName && variation.tabName.toUpperCase().includes("JUSTO")) {
                const blocks = [
                    { name: "Warm-up", data: variation.warmup },
                    { name: "Fuerza", data: variation.strength },
                    { name: "Metcon", data: variation.metcon },
                    { name: "Accesorios", data: variation.accessories },
                ];
                blocks.forEach(b => {
                    if (b.data.items.length === 0 && !b.data.title && !b.data.scheme) return;
                    const itemsText = b.data.items.map(i => i.replace(/<[^>]*>?/gm, '').replace(/"/g, '""')).join(' | ');
                    const titleText = (b.data.title || '').replace(/"/g, '""');
                    const schemeText = (b.data.scheme || '').replace(/"/g, '""');
                    csv += `"${w}","${day.id}","${day.name}","${variation.tabName}","${b.name}","${titleText}","${schemeText}","${itemsText}"\n`;
                });
            }
        });
    });
});

fs.writeFileSync('output.csv', csv);
console.log("Done");
