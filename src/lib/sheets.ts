import { WORKOUT_DATABASE } from '../data/workouts';

export async function exportToGoogleSheets(accessToken: string, athleteLogs: any[]): Promise<string> {
  const STORED_SHEET_ID_KEY = 'l4_sheets_id';
  let spreadsheetId = localStorage.getItem(STORED_SHEET_ID_KEY);

  // 1. Check if we need to create a new spreadsheet
  if (!spreadsheetId) {
    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          title: `L4 Programación & Resultados (${new Date().toLocaleDateString()})`
        },
        sheets: [
          { properties: { title: "Programa" } },
          { properties: { title: "Resultados_y_RPE" } }
        ]
      })
    });
    
    if (!createRes.ok) {
      throw new Error("Failed to create Google Sheet: " + (await createRes.text()));
    }
    
    const spreadsheet = await createRes.json();
    spreadsheetId = spreadsheet.spreadsheetId;
    if (spreadsheetId) {
      localStorage.setItem(STORED_SHEET_ID_KEY, spreadsheetId);
    } else {
      throw new Error("Invalid spreadsheet ID received");
    }
  }

  // 2. Build Program Data (Programa)
  const programRows: string[][] = [
    ["Semana", "Día", "Variante", "Bloque", "Actividad", "Tiempo/Cap"]
  ];

  const weeks = Object.keys(WORKOUT_DATABASE);
  weeks.forEach(weekKey => {
    const weekPlan = WORKOUT_DATABASE[weekKey];
    weekPlan.days.forEach((day: any) => {
      day.variations.forEach((variation: any) => {
        const blocks = [
          { name: 'WARM-UP', obj: variation.warmup },
          { name: 'FUERZA', obj: variation.strength },
          { name: 'METCON', obj: variation.metcon },
          { name: 'ACCESORIOS', obj: variation.accessories },
        ];
        
        blocks.forEach(b => {
          if (b.obj.items.length > 0 || b.obj.title || b.obj.scheme) {
             let combinedItems = b.obj.items.map((i: string) => i.replace(/<[^>]*>?/gm, '')).join(' | ');
             programRows.push([
               weekKey.toUpperCase(),
               day.name || '',
               variation.tabName || '',
               b.name,
               (b.obj.title || '') + (combinedItems ? ' - ' + combinedItems : ''),
               b.obj.scheme || ''
             ]);
          }
        });
      });
    });
  });

  // 3. Build Telemetry/Logs Data (Resultados_y_RPE)
  const logRows: string[][] = [
    ["Fecha Log", "Semana", "Día", "Bloque", "Ejercicio", "Sets/Reps", "Peso Kg", "RPE", "Comentarios"]
  ];

  athleteLogs.forEach(log => {
      logRows.push([
          new Date(log.timestamp).toLocaleString(),
          log.weekId || '',
          log.dayId || '',
          log.blockId || '',
          log.exerciseName || '',
          log.setsReps || '',
          log.weightKg ? String(log.weightKg) : '',
          log.rpe ? String(log.rpe) : '',
          log.notes || ''
      ]);
  });

  // 4. Update both sheets using batchUpdate to write data
  // Wait, batchUpdate for values is values:batchUpdate
  // https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values:batchUpdate
  const batchUpdateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          valueInputOption: "USER_ENTERED",
          data: [
              {
                  range: "'Programa'!A1",
                  values: programRows
              },
              {
                  range: "'Resultados_y_RPE'!A1",
                  values: logRows
              }
          ]
      })
  });

  if (!batchUpdateRes.ok) {
      // It might fail if the sheets were renamed or deleted. If so, clear ID and try again next time.
      const errorText = await batchUpdateRes.text();
      console.error(errorText);
      localStorage.removeItem(STORED_SHEET_ID_KEY);
      throw new Error("Failed to update Google Sheet. Please try again. " + errorText);
  }

  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
}
