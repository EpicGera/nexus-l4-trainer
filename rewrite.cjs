const fs = require('fs');

const file = 'src/components/analytics/VolumeProgressionSection.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the type of getMonthlyVolumeStats in VolumeProgressionSectionProps
content = content.replace(
  /getMonthlyVolumeStats: \(\) => \{ totalLogsCount: number; totalVolume: number \};/,
  'getMonthlyVolumeStats: () => any;'
);

// Remove the `const stats = getMonthlyVolumeStats();` that occurs later so we only do it once
content = content.replace(/const stats = getMonthlyVolumeStats\(\);\n\n  let activeColor = "#1F51FF";/, `let activeColor = "#1F51FF";`);

// Replace getWeeklyRealVolumes and its usage with the stats
content = content.replace(
  /const getWeeklyRealVolumes = \(\) => {[\s\S]*?return realVolume;\n  };\n\n  const realVolume = getWeeklyRealVolumes\(\);/,
  `const stats = getMonthlyVolumeStats();

  const realVolume = {
    w1: stats.weeklyVolume.w1 || 0,
    w2: stats.weeklyVolume.w2 || 0,
    w3: stats.weeklyVolume.w3 || 0,
    w4: stats.weeklyVolume.w4 || 0,
  };`
);


// Replace getWeeklyL4AuditStats and its usage
content = content.replace(
  /const getWeeklyL4AuditStats = \(\) => {[\s\S]*?return \{ realWVolumes, w1RpeAvg, w2RpeAvg, w3RpeAvg, w4RpeAvg, totalVolumeStr, messageBody \};\n  };\n\n  const \{ realWVolumes, w1RpeAvg, w2RpeAvg, w3RpeAvg, w4RpeAvg, totalVolumeStr, messageBody \} = getWeeklyL4AuditStats\(\);/,
  `// Reuse stats from getMonthlyVolumeStats
  const realWVolumes = [
    stats.weeklyVolume.w1 || 0,
    stats.weeklyVolume.w2 || 0,
    stats.weeklyVolume.w3 || 0,
    stats.weeklyVolume.w4 || 0,
  ];

  const w1RpeAvg = stats.weeklyRpeCount.w1 > 0 ? stats.weeklyRpeSum.w1 / stats.weeklyRpeCount.w1 : 0;
  const w2RpeAvg = stats.weeklyRpeCount.w2 > 0 ? stats.weeklyRpeSum.w2 / stats.weeklyRpeCount.w2 : 0;
  const w3RpeAvg = stats.weeklyRpeCount.w3 > 0 ? stats.weeklyRpeSum.w3 / stats.weeklyRpeCount.w3 : 0;
  const w4RpeAvg = stats.weeklyRpeCount.w4 > 0 ? stats.weeklyRpeSum.w4 / stats.weeklyRpeCount.w4 : 0;

  let totalVolumeStr = (
    realWVolumes[0] +
    realWVolumes[1] +
    realWVolumes[2] +
    realWVolumes[3]
  ).toLocaleString("es-ES") + " kg";

  let stateFeedback = "PERFIL BIOMECÁNICO BALANCEADO SANO";
  let messageBody =
    "Tus datos volumétricos reflejan un incremento paulatino en la carga de trabajo. Te encuentras en un estado de supercompensación óptima.";

  if (w3RpeAvg > 8.5 && realWVolumes[2] > 11000) {
    stateFeedback = "ALERTA: VOLUMEN CRÍTICO REDUNDANTE";
    messageBody =
      "Tu tonelaje acumulado en la Semana 3 supera los límites biomecánicos recomendados por encima del 15% de desvío. Tus lumbares corren riesgo severo de torques nocivos.";
  }`
);

fs.writeFileSync(file, content);
