export const QUEST_LOOT_POOL = [
  "Calleras de Carbono Rex (Tracción Mecánica Optimizada)",
  "Magnesio Profesional Antihumedad (Evita deslizamientos)",
  "Electrolitos Sódicos Concentrados (Soporte Mineral)",
  "Rodilleras de Neoprene 7mm (Estabilidad y Compresión)",
  "Muñequeras de Soporte Rígido (Estabilidad en Front Rack)",
  "Rodilleras de Compresión Anatómicas (Eficiencia Articular)",
  "Vendaje Neuromuscular Kinesiotape (Estabilidad Propioceptiva)",
  "Carbohidratos Simples Intra-entreno (Saturación de Glucógeno)",
  "Grip Gel con Sílice (Optimización de Agarre de Gancho)",
  "Cinturón Lumbar de Cuero 4'' (Aumento de Presión Intraabdominal)",
];

export const getDayReward = (dayId: string) => {
  let hash = 0;
  for (let i = 0; i < dayId.length; i++) {
    hash = dayId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const lootIndex = Math.abs(hash) % QUEST_LOOT_POOL.length;
  const xp = 120 + (Math.abs(hash) % 9) * 10; // 120 - 200 XP
  return {
    item: QUEST_LOOT_POOL[lootIndex],
    xp: xp,
  };
};
