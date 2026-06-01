import { Database } from '../types/workout';

export const WORKOUT_DATABASE: Database = {
    w1: {
        days: [
            {
                id: "w1d1", name: "LUNES", title: "La Guarida del Mal", isCompleted: true, hasTabs: true,
                variations: [
                    {
                        tabName: "MODO SOLO (RX)",
                        warmup: { title: "01. WARM-UP INDIVIDUAL L4", scheme: "3 Rondas", items: ["10 Air Squats (Temp 3011, pausa en paralelo) <span class='cue'>🎯 Foco: Rodillas activas.</span>", "5 Walkouts lentos con push-up estricto", "10 Crunches abdominales cortos (cero compresión psoas)", "12 Glute Bridges dinámicos con contracción isométrica de 2s"] },
                        strength: { title: "02. FUERZA", scheme: "4x6 @ 65-70%", items: ["Back Squat <span class='cue'>Romper el paralelo y controlar la fase excéntrica.</span>"] },
                        metcon: { title: "03. METCON", scheme: "3 Min ON / 1 Min OFF x 4 Rondas", items: ["60 Double Unders <span class='cue'>Adaptados a: 60 Crossovers ó 120 Simples</span>", "15 Wall Balls (9kg)", "Max Burpees en tiempo restante <span class='cue'>Registro: Promedio de 10 reps de burpees por ronda.</span>"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "3 Series", items: ["10/10 Goblet Bulgarian Split Squats (1 KB/DB 18kg)", "15 V-Ups Lastrados (5kg) <span class='cue'>Registro: Destrucción de fibras profundas lograda.</span>"] }
                    },
                    {
                        tabName: "SIN BURPEES",
                        warmup: { title: "01. WARM-UP INDIVIDUAL L4", scheme: "3 Rondas", items: ["10 Air Squats (Temp 3011, pausa en paralelo) <span class='cue'>🎯 Foco: Rodillas activas.</span>", "5 Walkouts lentos con push-up estricto", "10 Crunches abdominales cortos (cero compresión psoas)", "12 Glute Bridges dinámicos con contracción de 2s"] },
                        strength: { title: "02. FUERZA", scheme: "4x6 @ 65-70%", items: ["Back Squat"] },
                        metcon: { title: "03. METCON (BURPEE-FREE)", scheme: "3 Min ON / 1 Min OFF x 4 Rondas", items: ["60 Double Unders", "15 Wall Balls (9kg)", "Max Russian KB Swings (24/16 kg) en tiempo restante <span class='cue'>🎯 Reemplazo L4: El swing ruso mantiene las pulsaciones al límite sin impacto en muñecas.</span>"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "3 Series", items: ["10/10 Goblet Bulgarian Split Squats (1 KB/DB 18kg)", "15 V-Ups Lastrados (5kg)"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4", scheme: "3 Rondas", items: ["10 Air Squats Sincronizados (Tempo controlado)", "8 Spiderman Lunges con rotación torácica (4/lado)", "10 Crunches cortos sincronizados (cero compresión psoas)", "12 Glute Bridges dinámicos Sincro"] },
                        strength: { title: "02. FUERZA COMPARTIDA", scheme: "4 Series alternadas", items: ["Back Squat (Barra única máx 60kg)", "Ajuste rápido de discos entre series para optimizar espacio"] },
                        metcon: { title: "03. METCON EN PAREJA (NO BURPEES)", scheme: "3 Min ON / 1 Min OFF x 4 Rondas", items: ["60 Double Unders (Sincro)", "15 Wall Balls (9kg) - Alternando", "Max Russian KB Swings (24kg) en tiempo restante (I Go / You Go)"] },
                        accessories: { title: "04. ACCESORIOS GRUPALES", scheme: "3 Series", items: ["12/12 Bulgarian DB Split Squats", "15 V-Ups Sincronizados"] }
                    }
                ]
            },
            {
                id: "w1d2", name: "MARTES", title: "Espectros del Abismo", isCompleted: true, hasTabs: true,
                variations: [
                    {
                        tabName: "MODO SOLO (RX)",
                        warmup: { title: "01. MOVILIDAD BIOMECÁNICA L4", scheme: "10 Minutos | 2 Rondas", items: ["8-10 Pasadas de Foam Roller en gemelos y cuádriceps por pierna", "10 Spiderman Lunges con pausa (5/lado)", "12 Air Squats (ROM completo) <span class='cue'>🎯 Clinica L4: Lubricar articulación fémororrotuliana.</span>", "10 Crunches cortos (activar transverso del abdomen sin activar psoas)"] },
                        strength: { title: "02. ESTABILIZACIÓN", scheme: "Enfoque Core", items: ["Activación de glúteos e isquios <span class='cue'>Lubricar el chasis sin peso axial.</span>"] },
                        metcon: { title: "03. FLUSH (ZONA 2)", scheme: "35 Minutos Continuos", items: ["Rotación de máquinas (Ski, Remo, Bike)", "Saltos de soga simples a ritmo aeróbico suave <span class='cue'>Registro: Ski 65W, Remo 60W, Bike 45W.</span>"] },
                        accessories: { title: "04. ACCESORIOS (CORE & CARRY)", scheme: "3 Rondas", items: ["Plancha Alta + Plancha Baja + Plancha Lateral (30s x lado)", "Farmer Carry pesado (50kg total)"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. MOVILIDAD CO-OP L4", scheme: "10 Minutos | 2 Rondas Sincro", items: ["Pasadas asistidas de Foam Roller en tren inferior", "10 Air Squats sincronizados con pausa abajo", "8 Cossack Lunges (4/lado)", "10 Crunches cortos sincro"] },
                        strength: { title: "02. ESTABILIZACIÓN", scheme: "3 Rondas", items: ["30s Hollow Hold (Sincro)", "10/10 Toques de hombro en Plancha de Oso (Bear Taps)"] },
                        metcon: { title: "03. METCON AERÓBICO (ZONA 2)", scheme: "35 Minutos Alternados", items: ["300 saltos de soga simples (alternando cada 50 reps en relevos rápidos)", "20 KB Sumo Deadlift High Pulls ligeras (16/12 kg) para mantener pulsaciones constantes"] },
                        accessories: { title: "04. CO-OP CORE & CARRY", scheme: "3 Rondas", items: ["Plancha Alta asimétrica (Compartiendo espacio en colchoneta)", "Farmer Carry con Kettlebells pesadas (24/16 kg) x 40 metros"] }
                    }
                ]
            },
            {
                id: "w1d3", name: "MIÉRCOLES", title: "Brujo de las Sombras", isCompleted: true, hasTabs: true,
                variations: [
                    {
                        tabName: "MODO SOLO (RX)",
                        warmup: { title: "01. WARM-UP L4 HOMBRO & CORE", scheme: "3 Rondas", items: ["15 Arm Circles concéntricos lentos", "10 Spiderman Push-ups con control excéntrico", "15 Band Pull-aparts para deltoides posterior", "10 Crunches abdominales cortos (faja activa)", "10 Air Squats libres con pausa de 2s abajo <span class='cue'>🎯 Clinica L4: Preparación articular y core clínico prescrito.</span>"] },
                        strength: { title: "02. FUERZA", scheme: "4x6 @ 65-70% | Rest 90s", items: ["Strict Press <span class='cue'>Glúteos y core anclados. Evitar hiperextensión lumbar.</span>"] },
                        metcon: { title: "03. METCON", scheme: "21-15-9 | Cap 8:00", items: ["Calorías (Ski/Remo)", "KB Push Press Doble (18 kg) <span class='cue'>🎯 RÉCORD HISTÓRICO L4: 7:30. Fraccionamiento táctico: 10-6-5 / 8-7 / 9 Unbroken.</span>"] },
                        accessories: { title: "04. FORJA DE CHARSI", scheme: "3 Series", items: ["10 Strict Pull-ups (Banda)", "10 Chin-ups (Banda)", "15 Bicep Curls con barra vacía <span class='cue'>Registro de Guerra: Dominadas completadas bajo fatiga (8+2 / 8+2 / 6+2+2).</span>"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4 DE HOMBRO", scheme: "3 Rondas", items: ["15 Arm Circles sincronizados", "10 Spiderman Push-ups alternando", "15 Band Pull-aparts para tren superior", "10 Crunches cortos sincro + 10 Air Squats con pausa rodillas afuera"] },
                        strength: { title: "02. FUERZA COMPARTIDA", scheme: "4 Series (Por turnos)", items: ["Strict Press (Compartiendo la misma barra de 60kg)", "Descanso de 90s estricto en el relevo"] },
                        metcon: { title: "03. METCON SINCRO (BURPEE-FREE)", scheme: "21-15-9", items: ["150 saltos simples (en lugar de calorías máquina)", "KB Push Press Doble con Kettlebells de 16/18kg", "Sincronización en la extensión de brazos"] },
                        accessories: { title: "04. FORJA CO-OP", scheme: "3 Series", items: ["10/10 Chin-ups estrictos compartiendo el rack de dominadas", "15 Bicep Curls con mancuernas (Alternado)"] }
                    }
                ]
            },
            {
                id: "w1d4", name: "JUEVES", title: "Gólem de Hierro", isCompleted: true, hasTabs: true,
                variations: [
                    {
                        tabName: "MODO SOLO (RX)",
                        warmup: { title: "01. WARM-UP L4 TÉCNICO", scheme: "3 Rondas", items: ["10 Goblet Squats con tempo 3011 controlando rodillas", "8/8 KB Single Arm Press liviano", "10 Crunches cortos (core rígido)", "10 Air Squats estritos con pause de 2s abajo <span class='cue'>🎯 Clinica L4: Activación articular íntegra e inhibición del psoas.</span>"] },
                        strength: { title: "02. FUERZA TÉCNICA", scheme: "4x3 @ 60%", items: ["1 Power Snatch + 1 Hang Power Snatch + 1 OHS <span class='cue'>Velocidad de pies y extensión de cadera con 30-35kg.</span>"] },
                        metcon: { title: "03. METCON", scheme: "AMRAP 12 MIN", items: ["15 Box Step-overs", "10 Power Snatches (35 kg)", "30 Crossovers <span class='cue'>Registro L4: Snatches fraccionados 5+5 limpios. Step-overs como descanso activo.</span>"] },
                        accessories: { title: "04. ACCESORIOS", scheme: "3 Series", items: ["15 Vuegos Laterales (Livianos)", "30s Handstand Hold <span class='cue'>Sostén isométrico estricto para hombros.</span>"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4 TÉCNICO", scheme: "3 Rondas", items: ["10 Goblet Squats con DB (Alternados o sincro)", "8/8 KB Single Arm Press", "10 Crunches cortos sincro", "10 Air Squats estritos con faja abdominal rígida"] },
                        strength: { title: "02. FUERZA TÉCNICA", scheme: "4x3 @ 60%", items: ["Dual Dumbbell Hang Power Snatch", "Evitamos la barra olímpica única para optimizar espacio del box"] },
                        metcon: { title: "03. METCON EN PAREJA", scheme: "AMRAP 12 MIN (I Go / You Go)", items: ["15 Box Step-overs (Compartiendo un cajón)", "10 Dual DB Hang Snatches (22.5/15 kg)", "30 Saltos de soga cruzados (Crossovers)"] },
                        accessories: { title: "04. ACCESORIOS CO-OP", scheme: "3 Series", items: ["15 Vuelos Laterales ligeros con DB", "30s Handstand Hold (Uno asiste mientras el otro sostiene)"] }
                    }
                ]
            },
            {
                id: "w1d5", name: "VIERNES", title: "Gargantúa", isCompleted: true, hasTabs: true,
                variations: [
                    {
                        tabName: "OPCIÓN A (BARRA)",
                        warmup: { title: "01. WARM-UP L4 BISAGRA", scheme: "3 Rondas", items: ["12 Good Mornings PVC de forma lenta", "5 Walkouts lentos con respiración controlada", "12 Glute Bridges dinámicos con contracción de 2s", "10 Crunches abdominales cortos (anti-psoas) + 10 Air Squats <span class='cue'>🎯 Clinica L4: Activación de isquios y faja para Deadlifts pesados sin comprimir lumbares.</span>"] },
                        strength: { title: "02. FUERZA", scheme: "4x6 @ 60% | Tempo 3111", items: ["Deadlift Tradicional (Peso Muerto) <span class='cue'>Construyendo los pilares. Abdomen como una roca.</span>"] },
                        metcon: { title: "03. METCON", scheme: "EMOM 15 MIN", items: ["Min 1: 8 Deadlifts (30-40% RM)", "Min 2: 6 Hang Power Cleans (30-40% RM)", "Min 3: 4 Push Jerks (30-40% RM) <span class='cue'>Regular las pfisologías. No llegar al fallo en barra.</span>"] },
                        accessories: { title: "04. ACCESORIOS", scheme: "3 Series", items: ["10 Barbell Hip Thrusts Pesados", "12 Remos con barra inclinados"] }
                    },
                    {
                        tabName: "OPCIÓN B (MANCUERNAS)",
                        warmup: { title: "01. WARM-UP L4 BISAGRA & CORE", scheme: "3 Rondas", items: ["12 KB Deadlifts livianos con bisagra estricta", "8 Spiderman Push-ups controlando rotación lumbar", "12 Glute Bridges", "10 Crunches abdominales cortos + 10 Air Squats controlados"] },
                        strength: { title: "02. FUERZA", scheme: "4x8 | Tempo 3021", items: ["DB Romanian Deadlift (RDL)"] },
                        metcon: { title: "03. METCON", scheme: "AMRAP 12 MIN", items: ["15 KB Swings", "10 DB Hang Cleans", "15 Cal Máquina"] },
                        accessories: { title: "04. ACCESORIOS", scheme: "3 Series", items: ["12 KB Glute Bridges", "10 Remos a una mano con KB"] }
                    },
                    {
                        tabName: "OPCIÓN C (FLUSH)",
                        warmup: { title: "01. MOVILIDAD REGENERATIVA L4", scheme: "15 Minutos", items: ["Pasajes suaves de Foam Roller en isquios y cadera", "Elongación dinámica de psoas sin compresión", "12 Air Squats súper lentos", "12 Glute Bridges libres"] },
                        strength: { title: "02. ACTIVACIÓN", scheme: "Isometric Focus", items: ["30s Plancha Alta", "15 Glute Bridges libres"] },
                        metcon: { title: "03. FLUSH AERÓBICO", scheme: "30 Minutos Zona 2", items: ["Remo o Bike continuo", "Cada 5 min: 30s de Plancha Isométrica"] },
                        accessories: { title: "04. ESTABILIZACIÓN", scheme: "Ligero", items: ["Estiramientos pasivos profundos", "Descompresión lumbar"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4 BISAGRA", scheme: "3 Rondas", items: ["10 Good Mornings con banda elástica", "6 Walkouts lentos + 12 Glute Bridges sincro", "10 Crunches cortos sincronizados + 12 Air Squats con pausa"] },
                        strength: { title: "02. FUERZA COMPARTIDA", scheme: "4x8 | Tempo 3021", items: ["Heavy DB Romanian Deadlift (RDL)", "Compartiendo las DBs más pesadas de Haedo"] },
                        metcon: { title: "03. METCON CO-OP (NO MACHINES)", scheme: "AMRAP 12 MIN (I Go / You Go)", items: ["15 American KB Swings (24/16 kg)", "10 Dual DB Hang Cleans", "15 Saltos de cajón (Box Jumps) - Reemplazo de máquina"] },
                        accessories: { title: "04. ACCESORIOS", scheme: "3 Series", items: ["12 KB Glute Bridges (Sincro)", "10 Remos inclinados con Kettlebell"] }
                    }
                ]
            },
            {
                id: "w1d6", name: "SÁBADO", title: "Hordas del Infierno", isCompleted: true, hasTabs: true,
                variations: [
                    {
                        tabName: "MODO SOLO (RX)",
                        warmup: { title: "01. WARM-UP", scheme: "2 Rondas", items: ["15 Scap Pull-ups", "15 Supermans <span class='cue'>Activar erectores espinales de forma higiénica y segura.</span>", "6 Cossack Lunges (3 por lado) y 6 Spiderman Lunges (3 por lado)", "2 Rondas Extras: 10 Crunches cortos (cero compresión psoas) + 10 Air Squats <span class='cue'>🎯 Activación L4: Foco para rodillas y activar flexores de cadera.</span>"] },
                        strength: { title: "02. ESTRATEGIA L4", scheme: "Pacing RPE 6", items: ["Administración inteligente de la energía", "Evitar picos máximos de ácido láctico por medicamentos"] },
                        metcon: { title: "03. METCON CHIPPER", scheme: "Por Tiempo (Cap: 25 Min)", items: ["1000m Remo (o Ski/2000m Bike)", "50 KB Swings (24/16 kg)", "40 Wall Balls (9/6 kg)", "30 Pull-ups (o Ring Rows)", "20 Devil Press (con push-up flexión de pecho)", "250 Double Unders (o 500 Simples)"] },
                        accessories: { title: "04. COOLDOWN", scheme: "10 Minutos", items: ["Foam Roller en gemelos y cuádriceps", "Elongación pasiva de cadena posterior"] }
                    },
                    {
                        tabName: "SAN JUSTO (EQUIPO DE 2)",
                        warmup: { title: "01. WARM-UP CO-OP", scheme: "2 Rondas", items: ["15 Scap Pull-ups", "15 Supermans", "6 Cossack Lunges (3 por lado) y 6 Spiderman Lunges (3 por lado)", "2 Rondas Extras: 10 Crunches abdominales cortos + 10 Air Squats <span class='cue'>🎯 Activación L4: Calentamiento de rodillas y flexores de cadera.</span>"] },
                        strength: { title: "02. ESTRATEGIA EN EQUIPO", scheme: "Pacing RPE 6", items: ["Dinámica de relevo ágil", "Reabastecimiento mutuo"] },
                        metcon: { title: "03. METCON CHIPPER (TEAMS OF 2)", scheme: "Por Tiempo (Cap: 25 Min) | Dividir reps", items: ["1500m Remo (o Ski/3000m Bike) - Dividido", "80 KB Swings (24/16 kg) - Dividido", "60 Wall Balls (9/6 kg) - Dividido", "50 Pull-ups - Dividido", "30 Devil Press (con push-up estricto)", "300 Double Unders - Dividido <span class='cue'>🎯 Dinámica L4: Relevos rápidos para no decaer en la potencia de ejecución.</span>"] },
                        accessories: { title: "04. COOLDOWN", scheme: "10 Minutos", items: ["Pasaje de Foam Roller e hidratación profunda"] }
                    },
                    {
                        tabName: "SAN JUSTO (EQUIPO DE 3)",
                        warmup: { title: "01. WARM-UP CO-OP", scheme: "2 Rondas", items: ["15 Scap Pull-ups", "15 Supermans", "6 Cossack Lunges (3 por lado) y 6 Spiderman Lunges (3 por lado)", "2 Rondas Extras: 10 Crunches abdominales cortos + 10 Air Squats <span class='cue'>🎯 Activación L4: Foco de movilidad de rodillas y cadera.</span>"] },
                        strength: { title: "02. ESTRATEGIA EN EQUIPO", scheme: "Relevos de 3", items: ["Flujo constante de transiciones", "Mantenimiento de RPE controlado"] },
                        metcon: { title: "03. METCON CHIPPER (TEAMS OF 3)", scheme: "Por Tiempo (Cap: 25 Min) | Dividir entre 3", items: ["2000m Remo (o Ski/4000m Bike) - Dividido", "100 KB Swings (24/16 kg) - Dividido", "80 Wall Balls (9/6 kg) - Dividido", "60 Pull-ups - Dividido", "45 Devil Press (con push-up estricto)", "400 Double Unders - Dividido <span class='cue'>🎯 Dinámica L4: Mientras un atleta corre el reloj, el segundo aguarda expectante y el tercero descansa.</span>"] },
                        accessories: { title: "04. COOLDOWN", scheme: "10 Minutos", items: ["Masaje compresivo general para evitar lumbares tensas"] }
                    },
                    {
                        tabName: "SAN JUSTO (EQUIPO DE 4)",
                        warmup: { title: "01. WARM-UP CO-OP", scheme: "2 Rondas", items: ["15 Scap Pull-ups", "15 Supermans", "6 Cossack Lunges (3 por lado) y 6 Spiderman Lunges (3 por lado)", "2 Rondas Extras: 10 Crunches abdominales cortos + 10 Air Squats <span class='cue'>🎯 Activación L4: Foco articular.</span>"] },
                        strength: { title: "02. ESTRATEGIA EN EQUIPO", scheme: "Duplas en Paralelo", items: ["Cooperación cruzada", "Control del ácido láctico acumulado"] },
                        metcon: { title: "03. METCON CHIPPER (TEAMS OF 4)", scheme: "Por Tiempo (Cap: 25 Min) | Duplas activas", items: ["2500m Remo (o Ski/5000m Bike) - Duplicado", "120 KB Swings (24/16 kg) - Sincronizado", "100 Wall Balls (9/6 kg) - Sincronizado o de a pares", "85 Pull-ups - De a pares", "60 Devil Press (con push-up estricto)", "500 Double Unders - De a pares <span class='cue'>🎯 Dinámica L4: Dos atletas activos ejecutando en paralelo acumulando repeticiones.</span>"] },
                        accessories: { title: "04. COOLDOWN", scheme: "10 Minutos", items: ["Elongación muscular general asistida"] }
                    },
                    {
                        tabName: "SIN BURPEES",
                        warmup: { title: "01. WARM-UP", scheme: "2 Rondas", items: ["15 Scap Pull-ups", "15 Supermans", "6 Cossack Lunges (3 por lado) y 6 Spiderman Lunges (3 por lado)", "2 Rondas Extras: 10 Crunches cortos (cero compresión psoas) + 10 Air Squats <span class='cue'>🎯 Activación L4: Foco para rodillas y activar flexores de cadera.</span>"] },
                        strength: { title: "02. ESTRATEGIA L4", scheme: "Pacing RPE 6", items: ["Evitar compresión vertical extrema", "Sostener potencia constante"] },
                        metcon: { title: "03. CHIPPER (BURPEE-FREE)", scheme: "Por Tiempo (Cap: 25 Min)", items: ["1000m Remo / Ski", "50 KB Swings", "40 Wall Balls", "30 Pull-ups", "30 KB Ground-to-Overhead (24/16 kg) <span class='cue'>🎯 Reemplazo L4: El Ground-to-Overhead unilateral pesado con KB reemplaza la cargada y el empuje sin tirarse al piso.</span>", "250 Double Unders (o 500 Simples)"] },
                        accessories: { title: "04. COOLDOWN", scheme: "10 Minutos", items: ["Foam Roller completo e hidratación"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4 SÁBADO", scheme: "2 Rondas", items: ["15 Scap Pull-ups Sincro", "15 Supermans (espalda neutra)", "10 Spiderman Lunges (5/lado)", "2 Rondas Extras: 10 Crunches cortos + 10 Air Squats <span class='cue'>🎯 Activación L4: Preparación conjunta para rodillas y de la zona lumbar.</span>"] },
                        strength: { title: "02. ESTRATEGIA EN EQUIPO", scheme: "Format I Go / You Go", items: ["Evitamos saturar el box con múltiples máquinas", "Compartimos la soga cómodamente"] },
                        metcon: { title: "03. CHIPPER EN PAREJAS (NO BURPEES)", scheme: "Por Tiempo (Cap: 25 Min) | Dividir reps como convenga", items: ["500 Saltos Simples (o 250 Double Unders) - Reemplazo de máquina", "60 KB Swings (24kg) - Reparto libre", "50 Wall Balls (9kg) - Sincronizados", "40 Pull-ups o Ring Rows", "30 KB Ground-to-Overhead (24kg) - I Go / You Go", "60 KB Sumo Deadlift High Pulls (24kg) - Reemplazo de remo final"] },
                        accessories: { title: "04. COOLDOWN CO-OP", scheme: "10 Minutos", items: ["Masaje miofascial rodante asistido con Foam Roller"] }
                    }
                ]
            },
            {
                id: "w1d7", name: "DOMINGO", title: "Descanso Activo", isCompleted: true, hasTabs: true,
                variations: [
                    {
                        tabName: "DESCANSO CLÍNICO",
                        warmup: { title: "RECARGA", scheme: "Cero Estrés", items: ["Show de Standup con Flor (Lucas Upstein)", "Purga de estrés mental y neural"] },
                        strength: { title: "MANÁ", scheme: "Recuperación", items: ["Cero impacto articular", "Descanso absoluto para asimilar antibióticos"] },
                        metcon: { title: "NUTRICIÓN", scheme: "Banquete", items: ["Alimentación densa", "Consumo masivo de micronutrientes e hidratación"] },
                        accessories: { title: "SNC RESET", scheme: "Listo para el Hierro", items: ["Preparación mental"] }
                    },
                    {
                        tabName: "DESCANSO HAEDO",
                        warmup: { title: "RECARGA CO-OP", scheme: "Cero Cargas", items: ["Conversación de estrategia de entrenamiento con Lucas", "Estiramiento pasivo en colchoneta en Haedo"] },
                        strength: { title: "PREP", scheme: "Recuperación", items: ["Día regenerativo total"] },
                        metcon: { title: "MANÁ", scheme: "Cero impacto", items: ["Hidratación profunda para limpiar residuos del catarro"] },
                        accessories: { title: "ESTABILIZACIÓN", scheme: "Rest", items: ["Descanso total"] }
                    }
                ]
            }
        ]
    },
    w2: {
        days: [
            {
                id: "w2d1", name: "LUNES", title: "La Guarida del Mal V2", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "MODO SOLO (RX)",
                        warmup: { title: "01. WARM-UP INDIVIDUAL L4", scheme: "3 Rondas", items: ["10 Air Squats (Temp 3011, pausa en paralelo) <span class='cue'>🎯 Foco: Rodillas activas.</span>", "5 Walkouts lentos con push-up estricto", "10 Crunches abdominales cortos (cero compresión psoas)", "12 Glute Bridges dinámicos con contracción isométrica de 2s"] },
                        strength: { title: "02. FUERZA", scheme: "4x4 @ 75-80%", items: ["Back Squat <span class='cue'>La intensidad sube. Evitar el rebote descontrolado abajo.</span>"] },
                        metcon: { title: "03. METCON", scheme: "4 Min ON / 1 Min OFF x 4 Rondas", items: ["400m Remo/Ski o 800m Bike", "15 Wall Balls (9/6 kg)", "Max Burpees en tiempo restante"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "3 Series", items: ["8/8 Bulgarian Split Squats (Pesadas)", "15 V-Ups Lastrados"] }
                    },
                    {
                        tabName: "SIN BURPEES",
                        warmup: { title: "01. WARM-UP INDIVIDUAL L4", scheme: "3 Rondas", items: ["10 Air Squats (Temp 3011, pausa en paralelo) <span class='cue'>🎯 Foco: Rodillas activas.</span>", "5 Walkouts lentos con push-up estricto", "10 Crunches abdominales cortos (cero compresión psoas)", "12 Glute Bridges dinámicos con contracción de 2s"] },
                        strength: { title: "02. FUERZA", scheme: "4x4 @ 75-80%", items: ["Back Squat"] },
                        metcon: { title: "03. METCON (BURPEE-FREE)", scheme: "4 Min ON / 1 Min OFF x 4 Rondas", items: ["400m Remo/Ski o 800m Bike", "15 Wall Balls", "Max American KB Swings (24/16 kg) en tiempo restante <span class='cue'>🎯 Reemplazo L4: Swing americano pesado para mantener la fatiga de hombros y cadera alta.</span>"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "3 Series", items: ["8/8 Bulgarian Split Squats (Pesadas)", "15 V-Ups Lastrados"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4 V2", scheme: "3 Rondas", items: ["10 Air Squats Sincronizados (Tempo controlado)", "8 Spiderman Lunges con rotación torácica (4/lado)", "10 Crunches cortos sincronizados (cero compresión psoas)", "12 Glute Bridges dinámicos Sincro"] },
                        strength: { title: "02. FUERZA COMPARTIDA", scheme: "4 Series (Por turnos)", items: ["4x4 @ 75-80%", "4x6-8 (Amigos) <span class='cue'>Usa el descanso del relevo para recuperar el SNC. Ajustar cargas rápido.</span>"] },
                        metcon: { title: "03. METCON EN PAREJAS (NO MACHINES)", scheme: "AMRAP 18 MIN (I Go / You Go)", items: ["60 Wall Balls (9/6 kg) - Reparto libre", "300 Saltos Dobles (o 600 Simples) - Reemplazo de Remo/Ski", "80 KB Swings (24/16 kg) - Reparto libre", "80 KB Sumo Deadlift High Pulls - Reparto libre <span class='cue'>🎯 Regla de Oro: Más volumen y cero burpees. Transiciones explosivas en parejas sin máquinas de cardio.</span>"] },
                        accessories: { title: "04. ACCESORIOS GRUPALES", scheme: "3 Series", items: ["12/12 Bulgarian Split Squats (Mancuerna liviana)", "20 V-Ups Libres (Sincro)"] }
                    }
                ]
            },
            {
                id: "w2d2", name: "MARTES", title: "Espectros V2", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "MODO SOLO (RX)",
                        warmup: { title: "01. MOVILIDAD BIOMECÁNICA L4", scheme: "10 Minutos | 2 Rondas", items: ["8-10 Pasadas de Foam Roller en toda la musculatura profunda", "10 Spiderman Lunges con pausa (5/lado)", "12 Air Squats controlados (con énfasis fémororrotuliano) <span class='cue'>🎯 Clinica L4: Lubricar rótulas y flexores de cadera.</span>", "10 Crunches cortos (activar transverso del abdomen sin activar psoas)"] },
                        strength: { title: "02. ACTIVACIÓN ISOMÉTRICA", scheme: "Estabilidad Core", items: ["30s Hollow Hold", "10/10 Puentes de Glúteo Marchando (Marching Bridges)"] },
                        metcon: { title: "03. FLUSH (ZONA 2)", scheme: "40 Minutos Continuos", items: ["Rotación de máquinas (Ski, Remo, Bike)", "Mantener ritmo de conversación continuo para oxigenar tissues"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "3 Rondas", items: ["Plancha Alta + Baja + Lateral (30s x lado)", "Farmer Carry (50-60kg) x 50m"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. MOVILIDAD CO-OP L4 V2", scheme: "10 Minutos | 2 Rondas Sincro", items: ["Pasajes de Foam Roller en tren inferior de forma coordinada", "10 Air Squats sincronizados con pausa abajo", "8 Cossack Lunges (4/lado)", "10 Crunches cortos sincro para aislar el psoas"] },
                        strength: { title: "02. CORE CO-OP", scheme: "3 Rondas", items: ["30s Hollow Hold sincronizado", "10/10 Toques de Hombros en Oso (Bear Taps) con banda"] },
                        metcon: { title: "03. FLUSH EN PAREJA (ZONA 2 - NO MACHINES)", scheme: "40 Minutos Continuos", items: ["Saltos de soga continuos (Double Unders o Simples, alternando cada 2 min)", "KB Farmer Carries activos y caminatas controladas para oxigenar de forma eficiente"] },
                        accessories: { title: "04. CO-OP FARMER CARRY", scheme: "3 Rondas", items: ["Farmer Carry con Kettlebells cruzado (24kg + 16kg) x 40m", "Plancha lateral sincronizada 30s por lado"] }
                    }
                ]
            },
            {
                id: "w2d3", name: "MIÉRCOLES", title: "Brujo V2", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "MODO SOLO (RX)",
                        warmup: { title: "01. WARM-UP L4 HOMBRO & CORE V2", scheme: "3 Rondas", items: ["15 Arm Circles concéntricos lentos", "10 Spiderman Push-ups con control excéntrico", "15 Band Pull-aparts para deltoides posterior", "10 Crunches abdominales cortos (faja activa)", "10 Air Squats libres con pausa de 2s abajo <span class='cue'>🎯 Clínica L4: Preparación articular y core clínico.</span>"] },
                        strength: { title: "02. FUERZA", scheme: "4x4 @ 75-80% | Rest 90s", items: ["Strict Press <span class='cue'>Cargas mayores, cero impulso de piernas. Glúteos de acero.</span>"] },
                        metcon: { title: "03. METCON", scheme: "21-15-9 | Cap 8:00", items: ["Calorías (Ski/Remo/Battle Ropes)", "KB Push Press Doble (Pesado)"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "3 Series", items: ["8 Strict Pull-ups (Banda) + 8 Chin-ups (Banda)", "15 Hammer Curls con mancuernas"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4 DE HOMBRO V2", scheme: "3 Rondas", items: ["15 Arm Circles sincronizados", "10 Spiderman Push-ups alternando", "15 Band Pull-aparts para tren superior", "10 Crunches cortos sincro + 10 Air Squats con pausa rodillas afuera"] },
                        strength: { title: "02. FUERZA COMPARTIDA", scheme: "4 Series alternadas", items: ["Strict Press pesado (barra única máx 60kg)", "Pacing explosivo con relevo rápido"] },
                        metcon: { title: "03. METCON CO-OP", scheme: "21-15-9", items: ["100 saltos simples por ronda (en lugar de máquina)", "KB Push Press Doble (24/16 kg) en formato I Go / You Go"] },
                        accessories: { title: "04. ACCESORIOS CO-OP", scheme: "3 Series", items: ["8 Chin-ups compartiendo barra de tracción", "15 Hammer Curls con mancuernas pesadas"] }
                    }
                ]
            },
            {
                id: "w2d4", name: "JUEVES", title: "Gólem V2", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "MODO SOLO (RX)",
                        warmup: { title: "01. WARM-UP L4 TÉCNICO V2", scheme: "3 Rondas", items: ["10 Goblet Squats con tempo 3011 controlando rodillas", "8/8 KB Single Arm Press liviano", "10 Crunches cortos (core rígido)", "10 Air Squats estritos con pause de 2s abajo <span class='cue'>🎯 Clinica L4: Activación articular íntegra e inhibición del psoas.</span>"] },
                        strength: { title: "02. FUERZA TÉCNICA", scheme: "5x2 @ 70%", items: ["Hang Squat Snatch <span class='cue'>Recepción profunda, consolidar velocidad de codos.</span>"] },
                        metcon: { title: "03. METCON", scheme: "AMRAP 14 MIN", items: ["15 Box Step-overs", "10 Power Snatches (40 kg)", "30 Crossovers"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "3 Series", items: ["15 Vuelos Laterales", "40s Handstand Hold"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4 TÉCNICO V2", scheme: "3 Rondas", items: ["10 Goblet Squats con DB (Alternados o sincro)", "8/8 KB Single Arm Press", "10 Crunches cortos sincro", "10 Air Squats estritos con faja abdominal rígida"] },
                        strength: { title: "02. FUERZA TÉCNICA", scheme: "5x2 @ 70%", items: ["Dual DB Hang Squat Snatch", "Uso de mancuernas para mitigar el límite de barra olímpica única"] },
                        metcon: { title: "03. METCON CO-OP", scheme: "AMRAP 14 MIN (I Go / You Go)", items: ["15 Box Step-overs con mancuerna", "10 Power Snatches con mancuerna alternada (22.5kg)", "30 Crossovers de soga"] },
                        accessories: { title: "04. ACCESORIOS CO-OP", scheme: "3 Series", items: ["15 Vuelos Laterales pesados", "40s Handstand Hold asistido"] }
                    }
                ]
            },
            {
                id: "w2d5", name: "VIERNES", title: "Gargantúa V2", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "SAN JUSTO (RX)",
                        warmup: { title: "01. WARM-UP L4 BISAGRA V2", scheme: "3 Rondas", items: ["12 Good Mornings PVC de forma lenta", "5 Walkouts lentos con respiración controlada", "12 Glute Bridges dinámicos con contracción de 2s", "10 Crunches abdominales cortos (anti-psoas) + 10 Air Squats <span class='cue'>🎯 Clinica L4: Activación de isquios y faja para Deadlifts pesados sin comprimir lumbares.</span>"] },
                        strength: { title: "02. FUERZA (SJ)", scheme: "4x4 @ 75-80%", items: ["Heavy Deadlift <span class='cue'>Densidad neural pura. Mantener la espina neutra.</span>"] },
                        metcon: { title: "03. METCON", scheme: "5 Rondas", items: ["9 Deadlifts (40-45% RM)", "6 Hang Power Cleans (40-45% RM)", "3 Push Jerks (40-45% RM)"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "3 Series", items: ["10 Barbell Hip Thrusts (60-65% RM)", "12 Remos con barra inclinados (30-35% RM)"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4 BISAGRA V2", scheme: "3 Rondas Sincro", items: ["10 Good Mornings con banda elástica", "6 Walkouts lentos + 12 Glute Bridges sincro", "10 Crunches cortos sincronizados + 12 Air Squats con pausa"] },
                        strength: { title: "02. FUERZA (EN EQUIPO)", scheme: "4 Series alternadas", items: ["Heavy KB/DB Bulgarian Split Squats", "4x8 por pierna <span class='cue'>🎯 Estrategia con Luk: Uno realiza sus 8 reps de manera controlada (Tempo 3111) mientras el otro asiste, cuida el plano de rodilla y luego intercambian. Optimiza el espacio y el uso de las KBs pesadas del box.</span>"] },
                        metcon: { title: "03. METCON CO-OP (NO BURPEES)", scheme: "AMRAP 16 MIN (I Go / You Go - Rondas completas)", items: ["10 Barbell Clean & Jerks (Max 60/40 kg en barra olímpica única)", "15 Russian KB Swings (24/16 kg)", "12 DB Goblet Squats (22.5/15 kg) <span class='cue'>🎯 Regla de Oro: Se alternan rondas completas. Uno trabaja (metiendo potencia máxima) mientras el otro asiste en la barra, controla el cronómetro... Cero burpees, cero acumulación de fatiga inútil.</span>"] },
                        accessories: { title: "04. ACCESORIOS INTEGRADOS", scheme: "3 Series", items: ["12 Glute Bridges a una pierna (Peso corporal)", "10 Remos inclinados con Kettlebell (24/16 kg)"] }
                    },
                    {
                        tabName: "MODO MURPH",
                        warmup: { title: "01. PREPARACIÓN COMPLETA HERO WOD L4", scheme: "Lubricación - 3 Rondas", items: ["15 Arm Circles (Hombros) lentos", "12 Scap Pull-ups + 10 Crunches cortos (inhibir psoas)", "12 Air Squats con pausa <span class='cue'>🎯 Activación L4: Preparación de rodillas.</span>", "5 Walkouts para activar faja protectora de columna"] },
                        strength: { title: "ESTRATEGIA", scheme: "Sin Chaleco", items: ["Formato particionado 'Cindy'", "Evitar fallo neural temprano"] },
                        metcon: { title: "02. HERO WOD: 'MURPH'", scheme: "Cap 55:00", items: ["1 Milla de Correr (1600m)", "20 Rondas de: 5 Pull-ups + 10 Push-ups + 15 Air Squats", "1 Milla de Correr (1600m) <span class='cue'>⚠️ ADVERTENCIA: Sin chaleco por recuperación de catarro. Si haces Murph, se suspende la fuerza de Deadlift para cuidar la lumbar.</span>"] },
                        accessories: { title: "03. DESCOMPRESIÓN LUMBAR", scheme: "3 Series", items: ["60s colgado pasivo de la barra", "15 Glute Bridges libres suaves", "Foam Roller en gemelos e isquiotibiales"] }
                    }
                ]
            },
            {
                id: "w2d6", name: "SÁBADO", title: "Hordas V2", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "SAN JUSTO (RX)",
                        warmup: { title: "01. WARM-UP", scheme: "Dinámico", items: ["15 Supermans", "10 Spiderman Push-ups", "2 Rondas Extras: 10 Crunches cortos (cero compresión psoas) + 10 Air Squats <span class='cue'>🎯 Activación L4: Foco para rodillas y flexores de cadera.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "SNC Protection", items: ["Pacing constante", "Transición rápida en máquinas"] },
                        metcon: { title: "02. CHIPPER", scheme: "Por Tiempo (Cap: 22 Min)", items: ["1200m Remo", "50 Wall Balls", "40 DB Snatches (unbroken)", "30 Devil Press (con burpee y push-up estricto)"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Caminata suave", "Estiramiento pasivo general"] }
                    },
                    {
                        tabName: "SAN JUSTO (EQUIPO DE 2)",
                        warmup: { title: "01. WARM-UP CO-OP", scheme: "Dinámico", items: ["15 Supermans", "10 Spiderman Push-ups", "2 Rondas Extras: 10 Crunches abdominales cortos + 10 Air Squats <span class='cue'>🎯 Activación L4: Activación de rodillas de forma biomecánica.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "Format I Go / You Go", items: ["Relevos rápidos de a 10 reps", "Mantener potencia en las mancuernas"] },
                        metcon: { title: "02. CHIPPER (TEAMS OF 2)", scheme: "Por Tiempo (Cap: 22 Min) | Dividir reps", items: ["1500m Remo - Dividido", "80 Wall Balls - Dividido", "60 DB Snatches - Dividido (consecutivos)", "40 Devil Press (con burpee y push-up estricto) <span class='cue'>🎯 Dinámica L4: Alternar de a 5 reps en Devil Press para conservar velocidad sin colapsar la fatiga respiratoria.</span>"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Caminata suave", "Movilidad de flexión profunda"] }
                    },
                    {
                        tabName: "SAN JUSTO (EQUIPO DE 3)",
                        warmup: { title: "01. WARM-UP CO-OP", scheme: "Dinámico", items: ["15 Supermans", "10 Spiderman Push-ups", "2 Rondas Extras: 10 Crunches abdominales cortos + 10 Air Squats <span class='cue'>🎯 Activación L4: Calentamiento articular integral.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "Relevo en Tríos", items: ["Pacing aeróbico", "Sostener velocidad sostenida"] },
                        metcon: { title: "02. CHIPPER (TEAMS OF 3)", scheme: "Por Tiempo (Cap: 22 Min) | Dividido por 3", items: ["2000m Remo - Dividido", "100 Wall Balls - Dividido", "80 DB Snatches - Dividido", "50 Devil Press (con burpee y push-up estricto) <span class='cue'>🎯 Dinámica L4: Dividir según fatiga acumulada. Trabajo explosivo intermedio.</span>"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Caminata suave", "Elongación dirigida de isquios"] }
                    },
                    {
                        tabName: "SAN JUSTO (EQUIPO DE 4)",
                        warmup: { title: "01. WARM-UP CO-OP", scheme: "Dinámico", items: ["15 Supermans", "10 Spiderman Push-ups", "2 Rondas Extras: 10 Crunches abdominales cortos + 10 Air Squats <span class='cue'>🎯 Activación L4: Foco en rótulas para alto impacto.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "Duplas Activas simultáneas", items: ["Coordinación táctica de cambio", "Mantener inercia en la máquina"] },
                        metcon: { title: "02. CHIPPER (TEAMS OF 4)", scheme: "Por Tiempo (Cap: 22 Min) | 2 activos simultáneos", items: ["2400m Remo - Duplicado", "120 Wall Balls - Sincronizado", "100 DB Snatches - De a pares", "60 Devil Press (con burpee y push-up estricto) <span class='cue'>🎯 Dinámica L4: Mitad de reps por atleta de manera alternada manteniendo el flujo aeróbico continuo.</span>"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Caminata suave", "Movilidad profunda"] }
                    },
                    {
                        tabName: "SIN BURPEES",
                        warmup: { title: "01. WARM-UP", scheme: "Dinámico", items: ["15 Supermans", "10 Spiderman Push-ups", "2 Rondas Extras: 10 Crunches cortos (cero compresión psoas) + 10 Air Squats <span class='cue'>🎯 Activación L4: Foco para rodillas y flexores de cadera.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "No-Impact", items: ["Cadena posterior fluida", "Preservar articulación de muñeca"] },
                        metcon: { title: "02. CHIPPER (BURPEE-FREE)", scheme: "Por Tiempo (Cap: 22 Min)", items: ["1200m Remo", "50 Wall Balls", "40 DB Snatches", "40 DB Clean & Press (22.5/15 kg) <span class='cue'>🎯 Reemplazo L4: El Clean & Press con mancuernas mantiene la fatiga de hombros sin bajar el pecho al suelo.</span>"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Estiramientos musculares pasivos"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4 DE SÁBADO V2", scheme: "Dinámico", items: ["15 Supermans para erectores espinales", "10 Spiderman Push-ups con control", "2 Rondas Extras: 10 Crunches cortos + 10 Air Squats <span class='cue'>🎯 Activación L4: Foco de rodillas y flexor pautado para la sede Haedo.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "Soga & Pesas", items: ["Conversión de metros a volumen de soga", "Ajuste de tiempos para box lleno"] },
                        metcon: { title: "02. CHIPPER (HAEDO)", scheme: "Por Tiempo (Cap: 22 Min)", items: ["300 Saltos Simples (Target < 3min)", "50 Goblet Squats (KB)", "40 KB Snatches", "30 Clean & Press (Barra 60kg)", "200 Saltos Simples cierre <span class='cue'>Adaptación perfecta para optimizar espacio limitado.</span>"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Movilidad de cadera y gemelos"] }
                    }
                ]
            },
            {
                id: "w2d7", name: "DOMINGO", title: "Tavern Portal", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "RESET ABSOLUTO",
                        warmup: { title: "RECUPERACIÓN", scheme: "Cero Cargas", items: ["Dormir sin alarmas", "Hidratación profunda"] },
                        strength: { title: "MÚSCULO", scheme: "Síntesis", items: ["Asimilación de la fase de Intensificación", "Recarga de depósitos de glucógeno"] },
                        metcon: { title: "SNC", scheme: "Reset", items: ["Cero impacto articular", "Cero fatiga respiratoria"] },
                        accessories: { title: "ALINEACIÓN - FINISHER", scheme: "Listo para Peak Week", items: ["Preparación psicológica para la Semana 3 (Boss Fight)"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. ESTIRAMIENTOS CO-OP", scheme: "Paso a Paso", items: ["Estiramientos compartidos en colchoneta", "Rodillo de espuma completo en piernas"] },
                        strength: { title: "MÚSCULO COMPARTIDO", scheme: "Regenerativo", items: ["Discusión sobre los próximos RMs, técnica y progresiones", "Sinergia mental y física post entreno"] },
                        metcon: { title: "NUTRICIÓN SINCRO", scheme: "Banquete", items: ["Compartir batido o snacks ricos en proteínas", "Comer juntos para reparar los depósitos de glucofósforo"] },
                        accessories: { title: "SNC RESET", scheme: "Listo", items: ["Preparados para encarar la semana 3 con fuerza total"] }
                    }
                ]
            }
        ]
    },
    w3: {
        days: [
            {
                id: "w3d1", name: "LUNES", title: "La Guarida del Mal V3", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "MODO SOLO (RX)",
                        warmup: { title: "01. WARM-UP INDIVIDUAL L4", scheme: "3 Rondas", items: ["10 Air Squats (Temp 3011, pausa en paralelo) <span class='cue'>🎯 Foco: Rodillas activas.</span>", "5 Walkouts lentos con push-up estricto", "10 Crunches abdominales cortos (cero compresión psoas)", "12 Glute Bridges dinámicos con contracción isométrica de 2s"] },
                        strength: { title: "02. FUERZA PEAK", scheme: "3x3 @ 85-90%", items: ["Back Squat <span class='cue'>Cinturón recomendado. Máxima tensión muscular.</span>"] },
                        metcon: { title: "03. METCON", scheme: "5 Min ON / 1 Min OFF x 3 Rondas", items: ["80 Double Unders <span class='cue'>🎯 Escalado L4: Si haces Crossovers, equivalen a 40 reps (ratio 2:1) u 80 saltos simples pesados.</span>", "12 Thrusters Pesados (50/35 kg)", "Max Burpees Over Bar en tiempo restante"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "3 Series", items: ["6/6 Goblet Bulgarian Split Squats (Heavy: sugerido KB/DB 22.5kg o 24kg)", "15 V-Ups Lastrados (sugerido disco de 10kg o mancuerna de 5-7.5kg)"] }
                    },
                    {
                        tabName: "SIN BURPEES",
                        warmup: { title: "01. WARM-UP INDIVIDUAL L4", scheme: "3 Rondas", items: ["10 Air Squats (Temp 3011, pausa en paralelo) <span class='cue'>🎯 Foco: Rodillas activas.</span>", "5 Walkouts lentos con push-up estricto", "10 Crunches abdominales cortos (cero compresión psoas)", "12 Glute Bridges dinámicos con contracción de 2s"] },
                        strength: { title: "02. FUERZA PEAK", scheme: "3x3 @ 85-90%", items: ["Back Squat"] },
                        metcon: { title: "03. METCON (BURPEE-FREE)", scheme: "5 Min ON / 1 Min OFF x 3 Rondas", items: ["80 Double Unders <span class='cue'>🎯 Escalado L4: Si haces Crossovers, equivalen a 40 reps (ratio 2:1) u 80 saltos simples pesados.</span>", "12 Thrusters Pesados (50/35 kg)", "Max American KB Swings (24/16 kg) en tiempo restante <span class='cue'>🎯 Reemplazo L4: El swing pesado compensa el estímulo respiratorio de los burpees.</span>"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "3 Series", items: ["6/6 Goblet Bulgarian Split Squats (Heavy: sugerido KB/DB 22.5kg o 24kg)", "15 V-Ups Lastrados (sugerido disco de 10kg o mancuerna de 5-7.5kg)"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4 V3", scheme: "3 Rondas", items: ["10 Air Squats Sincronizados (Tempo controlado)", "8 Spiderman Lunges con rotación torácica (4/lado)", "10 Crunches cortos sincronizados (cero compresión psoas)", "12 Glute Bridges dinámicos Sincro"] },
                        strength: { title: "02. FUERZA COMPARTIDA", scheme: "4 Series (Por turnos)", items: ["3x3 @ 85-90% (Atleta A)", "3x5-6 (Atleta B)"] },
                        metcon: { title: "03. METCON EN PAREJAS (NO MACHINES)", scheme: "AMRAP 20 MIN (I Go / You Go)", items: ["100 Double Unders (u 80 Crossovers / o 200 Simples) - Reparto libre", "24 Thrusters (Moderados 40/30 kg) - Reparto libre", "80 American KB Swings (24/16 kg) - Reparto libre", "60 Wall Balls (9/6 kg) - Reparto libre <span class='cue'>🎯 Regla de Oro: Peak Volume en equipo, cero burpees. Pacing metabólico agresivo sin máquinas.</span>"] },
                        accessories: { title: "04. ACCESORIOS GRUPALES", scheme: "3 Series", items: ["10/10 Goblet Bulgarian Split Squats (Mancuerna intermedia: sugerido DB de 16-18kg)", "15 V-Ups Libres"] }
                    }
                ]
            },
            {
                id: "w3d2", name: "MARTES", title: "Espectros V3", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "MODO SOLO (RX)",
                        warmup: { title: "01. MOVILIDAD INTEGRAL L4", scheme: "10 Minutos | 2 Rondas", items: ["Apertura torácica y escapular profunda con Foam Roller", "10 Estocadas de lagartija", "12 Air Squats impecables con pausa abajo <span class='cue'>🎯 Foco: Rodillas en eje de torque biomecánico.</span>", "10 Crunches cortos (faja abdominal firme contra sobrecargas)"] },
                        strength: { title: "02. CORE STRENGTH", scheme: "3 Rondas", items: ["20s L-Sit Hold", "15 Hollow Rocks"] },
                        metcon: { title: "03. FLUSH (ZONA 2)", scheme: "45 Minutos Continuos", items: ["Pacing aeróbico estricto. Cero acidez muscular.", "Remo / Bici / Ski alternado cada 15 min"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "3 Rondas", items: ["45s Plancha RKC estricta (máxima tensión de glúteo-abdominal apretando codos y pies contra el suelo)", "Farmer Carry con Kettlebells pesadas (máx de 24kg por mano -no hay más pesadas en box-) x 40 metros (dos tramos de 20m)"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. MOVILIDAD CO-OP L4 V3", scheme: "10 Minutos | 2 Rondas Sincro", items: ["Foam Roller completo de forma coordinada", "Apertura escapular asistida por turnos", "10 Air Squats sincronizados con pausa abajo", "10 Crunches cortos sincro de core activo"] },
                        strength: { title: "02. CORE CO-OP", scheme: "3 Rondas", items: ["20s Hollow Hold sincronizado", "15 Hollow Rocks"] },
                        metcon: { title: "03. FLUSH EN PAREJAS (ZONA 2 - NO MACHINES)", scheme: "45 Minutos Continuos", items: ["Caminata rápida con chaleco o KB en Farmer Carry", "Saltos simples alternados para mantener pulsaciones controladas en Zona 2"] },
                        accessories: { title: "04. ESTABILIZACIÓN CO-OP", scheme: "3 Rondas", items: ["Farmer Carries pesados compartidos con Kettlebells (máx KB de 24kg si se dispone) x 40 metros", "Plancha lateral asistida de 30s por lado de forma estricta"] }
                    }
                ]
            },
            {
                id: "w3d3", name: "MIÉRCOLES", title: "Brujo V3", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "MODO SOLO (RX)",
                        warmup: { title: "01. WARM-UP L4 HOMBRO & CORE V3", scheme: "3 Rondas", items: ["15 Arm Circles concéntricos lentos", "10 Spiderman Push-ups con control excéntrico", "15 Band Pull-aparts para deltoides posterior", "10 Crunches abdominales cortos (faja activa)", "10 Air Squats libres con pausa de 2s abajo <span class='cue'>🎯 Clinica L4: Preparación articular y core clínico prescrito.</span>"] },
                        strength: { title: "02. FUERZA PEAK", scheme: "3x3 @ 85-90%", items: ["Strict Press <span class='cue'>Estabilización torácica máxima. Empuje vertical puro.</span>"] },
                        metcon: { title: "03. METCON SPRINT", scheme: "Por Tiempo (Cap 6 Min)", items: ["21-15-9", "Calorías Máquina (O Battle Ropes rápidas)", "Push Jerk con barra (sugerido 45kg / peso que te permita hacer 7-10 reps ininterrumpidas)"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "3 Series", items: ["6 Strict Pull-ups + 6 Chin-ups (Lastradas si es posible con DB liviana)", "15 Bicep Curls pesados (sugerido mancuernas de 12.5-15kg por lado o barra armada con 25kg)"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4 DE HOMBRO V3", scheme: "3 Rondas", items: ["15 Arm Circles sincronizados", "10 Spiderman Push-ups alternando", "15 Band Pull-aparts para tren superior", "10 Crunches cortos sincro + 10 Air Squats con pausa rodillas afuera"] },
                        strength: { title: "02. FUERZA COMPARTIDA", scheme: "3 Rondas", items: ["Strict Press pesado (barra olímpica única en Haedo)", "Relevos rápidos controlando la forma"] },
                        metcon: { title: "03. SPRINT CO-OP (NO MACHINES)", scheme: "21-15-9", items: ["150 saltos simples por ronda (en lugar de calorías)", "Dual DB Push Jerk (2x 20 kg o 22.5 kg en relevos rápidos sugeridos)"] },
                        accessories: { title: "04. FORJA CO-OP", scheme: "3 Series", items: ["6 Strict Pull-ups compartiendo barra", "15 Bicep Curls alternados (mancuernas sugeridas de 10-12.5kg por bazo)"] }
                    }
                ]
            },
            {
                id: "w3d4", name: "JUEVES", title: "Gólem V3", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "MODO SOLO (RX)",
                        warmup: { title: "01. WARM-UP L4 OLÍMPICO INTENSO", scheme: "3 Rondas", items: ["10 Goblet Squats con tempo 3011 controlando rodillas", "8/8 KB Single Arm Press liviano", "10 Crunches cortos (core rígido)", "10 Air Squats estritos con pause de 2s abajo <span class='cue'>🎯 Clinica L4: Activación articular íntegra e inhibición del psoas.</span>"] },
                        strength: { title: "02. FUERZA TÉCNICA", scheme: "EMOM 8 MIN", items: ["1 Squat Snatch @ 75-80% <span class='cue'>Enfoque en la velocidad de caída debajo de la barra.</span>"] },
                        metcon: { title: "03. METCON", scheme: "AMRAP 14 MIN", items: ["15 Box Jumps (Altos)", "10 Squat Snatches (45kg)", "40 Double Unders"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "3 Series", items: ["Vuegos Laterales Pesados", "Max L-Sit Hold"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4 OLÍMPICO SINCRO", scheme: "3 Rondas", items: ["10 Goblet Squats con DB (Alternados o sincro)", "8/8 KB Single Arm Press", "10 Crunches cortos sincro", "10 Air Squats estritos con faja abdominal rígida"] },
                        strength: { title: "02. FUERZA TÉCNICA CO-OP", scheme: "EMOM 8 MIN", items: ["Dual DB Squat Snatch", "Ajuste técnico bilateral usando mancuernas de Haedo"] },
                        metcon: { title: "03. METCON EN PAREJAS", scheme: "AMRAP 14 MIN (I Go / You Go)", items: ["15 Box Jumps sobre cajón compartido", "10 Squat Snatches con mancuernas", "40 Saltos dobles cada uno"] },
                        accessories: { title: "04. ACCESORIOS CO-OP", scheme: "3 Series", items: ["Vuelos Laterales con DB", "Max L-Sit Hold asistido"] }
                    }
                ]
            },
            {
                id: "w3d5", name: "VIERNES", title: "Gargantúa V3", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "SAN JUSTO (RX)",
                        warmup: { title: "01. WARM-UP L4 BISAGRA V3", scheme: "3 Rondas", items: ["12 Good Mornings PVC de forma lenta", "5 Walkouts lentos con respiración controlada", "12 Glute Bridges dinámicos con contracción de 2s", "10 Crunches abdominales cortos (anti-psoas) + 10 Air Squats <span class='cue'>🎯 Clinica L4: Activación de isquios y faja para Deadlifts pesados sin comprimir lumbares.</span>"] },
                        strength: { title: "02. STRENGTH PEAK", scheme: "3x3 @ 85-90%", items: ["Heavy Deadlift <span class='cue'>Carga máxima del mesociclo. Faja abdominal activa.</span>"] },
                        metcon: { title: "03. METCON", scheme: "21-15-9 pesado", items: ["Deadlift (80-85 kg)", "Box Jumps Altos (24 in)"] },
                        accessories: { title: "04. REINFORCE - FINISHER", scheme: "3 Series", items: ["Barbell Hip Thrusts Heavy (85-95 kg)", "Reverse Flys (10-12 kg)"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4 BISAGRA V3", scheme: "3 Rondas Sincro", items: ["10 Good Mornings con banda elástica", "6 Walkouts lentos + 12 Glute Bridges sincro", "10 Crunches cortos sincronizados + 12 Air Squats con faja rígida"] },
                        strength: { title: "02. FUERZA (HAEDO - CO-OP)", scheme: "5 Series alternadas", items: ["Bulgarian Split Squats Heavy (KB/DB)", "5x5 por pierna <span class='cue'>🎯 Estrategia con Luk: Serie pesada de 5 repeticiones por pierna. Uno ejecuta buscando máxima profundidad y control lateral, mientras el otro asiste para evitar desbalances. Rotación fluida en el mismo rack de KBs.</span>"] },
                        metcon: { title: "03. METCON EN EQUIPO (PEAK / NO BURPEES)", scheme: "AMRAP 14 MIN (I Go / You Go)", items: ["8 Front Squats (Barra max 60/40 kg - Tempo de pausa de 2s abajo)", "12 American KB Swings (24/16 kg)", "10 DB Push Presses (22.5/15 kg) <span class='cue'>🎯 Desafío L4: Para suplir la falta de discos pesados en Haedo, los Front Squats se realizan con una pausa obligatoria de 2 segundos en el fondo del pozo. Mientras uno aniquila su ronda, el otro asiste, cuida la barra y toma el relevo de inmediato.</span>"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "3 Series", items: ["10 V-Ups Lastrados con DB liviana (Sincronizados)", "12 KB Romanian Deadlifts (24/16 kg) (Ejecución técnica estricta)"] }
                    }
                ]
            },
            {
                id: "w3d6", name: "SÁBADO", title: "ANDARIEL", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "SAN JUSTO (RX)",
                        warmup: { title: "01. WARM-UP", scheme: "Gimnástico", items: ["Kipping drills", "Lubricación de hombros", "Supermans", "2 Rondas Extras: 10 Crunches cortos (cero compresión psoas) + 10 Air Squats <span class='cue'>🎯 Activación L4: Foco para rodillas y activar flexores de cadera.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "Boss Fight Focus", items: ["Dividir repeticiones de Thrusters tácticamente", "Mantener ritmo continuo en máquinas"] },
                        metcon: { title: "02. BOSS FIGHT", scheme: "Por Tiempo (Cap: 35 Min)", items: ["100 Cal Máquina (Buy-in)", "50 Thrusters (43/30 kg)", "30 Bar Muscle-Ups (o 60 Pull-ups)", "100 Cal Máquina (Cash-out) <span class='cue'>Peak week. Dejar todo en la arena.</span>"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Descompresión vertebral colgado de barra", "Elongación completa de piernas"] }
                    },
                    {
                        tabName: "SAN JUSTO (EQUIPO DE 2)",
                        warmup: { title: "01. WARM-UP CO-OP", scheme: "Dinámico", items: ["Kipping drills", "Lubricación de hombros", "Supermans", "2 Rondas Extras: 10 Crunches cortos (cero compresión psoas) + 10 Air Squats <span class='cue'>🎯 Activación L4: Calentamiento de rótulas y flexores.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "I Go / You Go en Parejas", items: ["Fraccionamiento rápido en Thrusters (ej. de a 5)", "Ritmo en máquinas"] },
                        metcon: { title: "02. BOSS FIGHT (TEAMS OF 2)", scheme: "Por Tiempo (Cap: 35 Min) | Dividir reps", items: ["150 Cal Máquina (Buy-in) - Dividir como convenga", "80 Thrusters (43/30 kg) - Dividir como convenga", "50 Bar Muscle-Ups (o 100 Pull-ups/Ring Rows) - Dividir", "150 Cal Máquina (Cash-out) - Dividir <span class='cue'>🎯 Dinámica L4: Relevos cortos para proteger el SNC y mantener la velocidad vertical de la barra en Thrusters.</span>"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Descompresión vertebral en barra", "Elongaciones musculares pasivas asistidas en parejas"] }
                    },
                    {
                        tabName: "SAN JUSTO (EQUIPO DE 3)",
                        warmup: { title: "01. WARM-UP CO-OP", scheme: "Dinámico", items: ["Kipping drills", "Lubricación de hombros", "Supermans", "2 Rondas Extras: 10 Crunches cortos + 10 Air Squats <span class='cue'>🎯 Activación L4: Foco clínico en rodillas.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "Rotativo Trío", items: ["Un atleta trabaja, segundo asiste, tercero descansa de manera rotativa."] },
                        metcon: { title: "02. BOSS FIGHT (TEAMS OF 3)", scheme: "Por Tiempo (Cap: 35 Min) | Dividido entre 3", items: ["200 Cal Máquina (Buy-in) - Dividido libre", "100 Thrusters (43/30 kg) - Dividido libre", "75 Bar Muscle-Ups (o 120 Pull-ups) - Dividido libre", "200 Cal Máquina (Cash-out) - Dividido libre <span class='cue'>🎯 Dinámica L4: En tríos, relevos cada 5-8 reps para sostener una tremenda intensidad glucolítica sin saturar el sistema neuromuscular.</span>"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Colgarse pasivo de barra para descomprimir espina", "Elongaciones de psoas e isquiotibiales"] }
                    },
                    {
                        tabName: "SAN JUSTO (EQUIPO DE 4)",
                        warmup: { title: "01. WARM-UP CO-OP", scheme: "Dinámico", items: ["Kipping drills", "Lubricación de hombros", "Supermans", "2 Rondas Extras: 10 Crunches cortos + 10 Air Squats <span class='cue'>🎯 Activación L4: Activación articular de tren inferior.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "Duplas simultáneas", items: ["Dos atletas activos acumulando simultáneamente.", "Relevos cada bloque de kcal."] },
                        metcon: { title: "02. BOSS FIGHT (TEAMS OF 4)", scheme: "Por Tiempo (Cap: 35 Min) | Duplas activas", items: ["300 Cal Máquina (Buy-in) - Dos máquinas paralelas", "150 Thrusters (43/30 kg) - Dos atletas activos en paralelo", "100 Bar Muscle-Ups (o 200 Pull-ups) - Dos atletas en paralelo", "300 Cal Máquina (Cash-out) - Sincro o sumando de a dos <span class='cue'>🎯 Dinámica L4: Trabajo brutal de resistencia aeróbica y fuerza paralela. Recomponer el pautado dinámico en cada bloque.</span>"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Descompresión espinal e hidratación de tendones"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4 DE SÁBADO V3", scheme: "Dinámico", items: ["Saltos suaves de soga", "15 Supermans (espalda neutra)", "10 Spiderman Push-ups", "2 Rondas Extras: 10 Crunches cortos + 10 Air Squats <span class='cue'>🎯 Activación L4: Calentamiento de bursa rotuliana e iliaca.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "Pacing Haedo", items: ["Fraccionamiento de soga sin máquina", "Uso intensivo de KBs para Thrusters"] },
                        metcon: { title: "02. BOSS FIGHT (HAEDO)", scheme: "Por Tiempo (Cap: 35 Min) | Calibrado", items: ["400 Saltos Simples (Target < 4min)", "50 Thrusters (Barra 40kg o KBs)", "60 Pull-ups estrictos/banda", "300 Saltos Simples cierre <span class='cue'>Adaptación milimétrica para mantener el dolor metabólico sin máquinas de cardio.</span>"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Estiramiento estático de pantorrillas y antebrazos"] }
                    }
                ]
            },
            {
                id: "w3d7", name: "DOMINGO", title: "Tavern Portal", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "SOBREVIVISTE",
                        warmup: { title: "RECUPERACIÓN", scheme: "Cero Cargas", items: ["Descanso total", "Hidratación masiva de tendones"] },
                        strength: { title: "SNC RESET", scheme: "Completo", items: ["Descompresión lumbar", "Baño de contraste o sauna"] },
                        metcon: { title: "GLUCÓGENO", scheme: "Recarga", items: ["Carbohidratos complejos de alta calidad", "Recuperación hormonal"] },
                        accessories: { title: "ALINEACIÓN - FINISHER", scheme: "Listo para Deload", items: ["Preparación mental para la fase de descarga (Semana 4)"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. ESTIRAMIENTOS CO-OP", scheme: "Paso a Paso", items: ["Rodillo miofascial de espuma conjunto", "Estiramientos asistidos generales"] },
                        strength: { title: "SNC RESET CO-OP", scheme: "Completo", items: ["Descompresión articular pasiva asistida", "Mentalidad positiva post-entreno"] },
                        metcon: { title: "RECARGA EN EQUIPO", scheme: "Glucógeno Sincro", items: ["Comida abundante compartida en Haedo", "Recuperación óptima del catarro"] },
                        accessories: { title: "ALINEACIÓN CO-OP", scheme: "Listo", items: ["Listos para encarar la semana de Deload (Semana 4)"] }
                    }
                ]
            }
        ]
    },
    w4: {
        days: [
            {
                id: "w4d1", name: "LUNES", title: "La Guarida del Mal V4", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "MODO SOLO (DELOAD)",
                        warmup: { title: "01. WARM-UP DE ACTIVACIÓN LIGERA L4", scheme: "3 Rondas", items: ["10 Air Squats de flujo suave (énfasis de rodilla)", "5 Walkouts lentos con estiramiento", "10 Crunches abdominales cortos (faja sin psoas)", "12 Glute Bridges muy controlados <span class='cue'>🎯 Clinica L4: Preparación articular de descarga e irrigación circulatoria.</span>"] },
                        strength: { title: "02. FUERZA DELOAD", scheme: "3x5 @ 50%", items: ["Back Squat <span class='cue'>Mucha velocidad concéntrica. Cero peso real.</span>"] },
                        metcon: { title: "03. METCON LIGERO", scheme: "AMRAP 10 MIN", items: ["100 Single Unders", "10 Air Squats", "5 Burpees"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "2 Series", items: ["Core pasivo", "Planchas frontales suaves"] }
                    },
                    {
                        tabName: "SIN BURPEES",
                        warmup: { title: "01. WARM-UP DE ACTIVACIÓN LIGERA L4", scheme: "3 Rondas", items: ["10 Air Squats de flujo suave", "5 Walkouts de movilidad con pausa", "10 Crunches abdominales cortos (faja sin psoas)", "12 Glute Bridges controlados <span class='cue'>🎯 Clinica L4: Activación lumbar y rodillas pre-entreno.</span>"] },
                        strength: { title: "02. FUERZA DELOAD", scheme: "3x5 @ 50%", items: ["Back Squat"] },
                        metcon: { title: "03. METCON (BURPEE-FREE)", scheme: "AMRAP 10 MIN", items: ["100 Single Unders", "10 Air Squats", "10 Sit-ups Unbroken <span class='cue'>🎯 Reemplazo L4: Estimulación limpia de la faja abdominal sin sobrecarga espinal.</span>"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "2 Series", items: ["Core pasivo", "Planchas frontales suaves"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP DE DESCARGA L4", scheme: "3 Rondas Sincro", items: ["10 Air Squats sincronizados súper lentos (rodillas activas)", "6 Spiderman Lunges con rotación torácica", "10 Crunches cortos sincronizados", "10 Glute Bridges suaves en pareja"] },
                        strength: { title: "02. FUERZA DELOAD COMPARTIDA", scheme: "3 Series (Por turnos)", items: ["3x5 @ 50% Back Squat <span class='cue'>Enfoque en tempo y control de la fase excéntrica.</span>"] },
                        metcon: { title: "03. PARTNER DELOAD FLOW (NO MACHINES)", scheme: "AMRAP 12 MIN (I Go / You Go)", items: ["150 Single Unders - Reparto libre", "20 Air Squats Sincronizados", "10 Russian KB Swings (Moderados) <span class='cue'>🎯 Regla de Oro: Descarga coordinada y cardio ligero para purgar el lactato sin máquinas.</span>"] },
                        accessories: { title: "04. ACCESORIOS GRUPALES", scheme: "2 Series", items: ["Plancha frontal sincronizada 45s"] }
                    }
                ]
            },
            {
                id: "w4d2", name: "MARTES", title: "Espectros V4", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "MODO SOLO (RX)",
                        warmup: { title: "01. MOVILIDAD", scheme: "15 Minutos", items: ["Yoga / Stretching profundo en el living", "Rodillo de espuma miofascial"] },
                        strength: { title: "02. ACTIVACIÓN CO-OP", scheme: "Suave", items: ["Estiramiento asistido de isquiotibiales"] },
                        metcon: { title: "03. FLUSH REGENERATIVO", scheme: "30 Minutos Zona 1-2", items: ["Caminata rápida al aire libre o bici muy suave", "Evitar cualquier acumulación de fatiga"] },
                        accessories: { title: "04. RECUPERACIÓN - FINISHER", scheme: "Opcional", items: ["Masaje deportivo", "Sauna o tina caliente"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. MOVILIDAD CO-OP", scheme: "15 Minutos", items: ["Estiramiento de movilidad de cadera compartido", "Foam Roller en pareja"] },
                        strength: { title: "02. ACTIVACIÓN CO-OP", scheme: "Suave", items: ["Estiramiento asistido mutuo"] },
                        metcon: { title: "03. FLUSH REGENERATIVO CO-OP (NO MACHINES)", scheme: "30 Minutos Zona 1-2", items: ["Caminata suave dialogando", "Saltos simples ligeros e intermitentes sin forzar el sistema"] },
                        accessories: { title: "04. RECUPERACIÓN CO-OP", scheme: "Opcional", items: ["Masajes o estiramientos libres asistidos"] }
                    }
                ]
            },
            {
                id: "w4d3", name: "MIÉRCOLES", title: "Brujo V4", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "MODO SOLO (RX)",
                        warmup: { title: "01. WARM-UP L4 DESCARGA HOMBRO", scheme: "3 Rondas", items: ["Apertura y rotación de hombro con bastón", "10 Rotaciones pectorales con banda", "10 Crunches cortos (cero compresión psoas)", "10 Air Squats controlados <span class='cue'>🎯 Clinica L4: Estimulación articular de tren superior e inferior sin peso axial.</span>"] },
                        strength: { title: "02. FUERZA DELOAD", scheme: "3x5 @ 50%", items: ["Strict Press <span class='cue'>Trabajo puramente técnico y de movilidad.</span>"] },
                        metcon: { title: "03. METCON LIGERO", scheme: "3 Rondas No Por Tiempo", items: ["15 Cal Remo (Suave)", "10 Push Press Livianos"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "2 Series", items: ["Curls livianos con banda elástica"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4 DESCARGA HOMBRO", scheme: "3 Rondas", items: ["Rotación de hombro sincronizada con bastón", "10 Rotaciones elásticas", "10 Crunches cortos sincro", "10 Air Squats con pausa"] },
                        strength: { title: "02. FUERZA DELOAD", scheme: "3x5 @ 50%", items: ["Strict Press con mancuernas ligeras (Deload completo)"] },
                        metcon: { title: "03. METCON CO-OP LIGERO (NO MACHINES)", scheme: "3 Rondas de flujo suave", items: ["100 saltos simples (en relevos de 50)", "10 DB Push Press ligeros en parejas alternas"] },
                        accessories: { title: "04. ACCESORIOS CO-OP", scheme: "2 Series", items: ["Curls livianos coordinados"] }
                    }
                ]
            },
            {
                id: "w4d4", name: "JUEVES", title: "Gólem V4", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "MODO SOLO (RX)",
                        warmup: { title: "01. WARM-UP L4 TÉCNICO DESCARGA", scheme: "3 Rondas", items: ["Alineamiento articular pilar con PVC", "10 OHS con barra de técnica", "10 Crunches abdominales cortos", "10 Air Squats estritos con pause <span class='cue'>🎯 Clinica L4: Foco de rodillas y faja protectora de columna.</span>"] },
                        strength: { title: "02. FUERZA TÉCNICA", scheme: "10 Minutos", items: ["Drills de Snatch con barra vacía <span class='cue'>Pulir los puntos de contacto e impulsión.</span>"] },
                        metcon: { title: "03. METCON", scheme: "EMOM 10 MIN", items: ["10 Step-ups ligeros", "5 Power Snatches con barra vacía"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "2 Series", items: ["Movilidad de escápulas", "Colgado de barra activo"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4 TÉCNICO DESCARGA", scheme: "3 Rondas Sincro", items: ["Movilidad conjunta con bastón de técnica", "10 OHS sincronizados", "10 Crunches cortos sincro", "12 Air Squats con pausa rodillas afuera"] },
                        strength: { title: "02. FUERZA TÉCNICA CO-OP", scheme: "10 Minutos", items: ["Técnica de Snatch unilateral ligera con Kettlebell/Dumbbell"] },
                        metcon: { title: "03. METCON DELOAD CO-OP", scheme: "EMOM 10 MIN", items: ["10 Step-ups sin peso por relevo", "5 Power Snatches ligeros con DB"] },
                        accessories: { title: "04. ACCESORIOS CO-OP", scheme: "2 Series", items: ["Movilidad de escápulas colgados de la barra"] }
                    }
                ]
            },
            {
                id: "w4d5", name: "VIERNES", title: "Gargantúa V4", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "SAN JUSTO",
                        warmup: { title: "01. WARM-UP L4 BISAGRA DE DESCARGA", scheme: "3 Rondas", items: ["Estiramiento dinámico de isquiotibiales", "10 Crunches cortos protectores de lumbar", "12 Glute Bridges suaves", "10 Air Squats de velocidad técnica <span class='cue'>🎯 Clinica L4: Activación sagital segura de espalda baja pre Deadlift.</span>"] },
                        strength: { title: "02. FUERZA DELOAD", scheme: "3x5 @ 50%", items: ["Deadlift <span class='cue'>Velocidad concéntrica explosiva, cero esfuerzo de frenado.</span>"] },
                        metcon: { title: "03. FLUSH", scheme: "15 MIN ZONA 2", items: ["Remo continuo a ritmo regenerativo"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "2 Series", items: ["Hip Thrusts livianos (40-50 kg)", "Plancha core (BW)"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "01. WARM-UP CO-OP L4 BISAGRA DESCARGA", scheme: "3 Rondas Sincro", items: ["Estiramiento de isquiotibiales y lumbar compartida", "8 Spiderman Lunges", "10 Crunches cortos sincro", "12 Air Squats con faja rígida y rodillas separadas"] },
                        strength: { title: "02. FUERZA DELOAD", scheme: "3x8 Liviano", items: ["KB RDL <span class='cue'>Eje sagital, rango completo. Trabajo estricto con Lucas.</span>"] },
                        metcon: { title: "03. FLUSH EN EQUIPO", scheme: "EMOM 12 MIN (Alternando minutos)", items: ["Alternando minutos: 15 Russian KB Swings livianos (16/12 kg) + 10 Goblet Squats ligeras (12.5/10 kg) <span class='cue'>🎯 Foco Deload: Mantener el flujo circulatorio activo, sin fatigar el SNC. Ritmo relajado en parejas.</span>"] },
                        accessories: { title: "04. ACCESORIOS - FINISHER", scheme: "2 Series", items: ["45s Plancha frontal estricta (BW)"] }
                    }
                ]
            },
            {
                id: "w4d6", name: "LUT GHOLEIN", title: "Social Party", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "SAN JUSTO (RX)",
                        warmup: { title: "01. WARM-UP", scheme: "Social", items: ["Juegos de calentamiento en equipo con Flor", "2 Rondas Extras: 10 Crunches cortos (cero compresión psoas) + 10 Air Squats <span class='cue'>🎯 Activación L4: Foco para rodillas y flexores de cadera.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "Deload Partner", items: ["Mantener el ritmo sin disparar pulsaciones", "Pacing de disfrute"] },
                        metcon: { title: "02. TEAM WOD", scheme: "AMRAP 25 MIN | I go / You go", items: ["500m Remo", "20 Wall Balls", "10 Burpees con push-up estricto <span class='cue'>Viaje de descarga. WOD para divertirse con Flor sin mirar el reloj.</span>"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Chocar los 5", "Estirar charlando de forma recreativa"] }
                    },
                    {
                        tabName: "SAN JUSTO (EQUIPO DE 2)",
                        warmup: { title: "01. WARM-UP CO-OP", scheme: "Social", items: ["Juegos de calentamiento con Flor", "2 Rondas Extras: 10 Crunches cortos (cero compresión psoas) + 10 Air Squats <span class='cue'>🎯 Activación L4: Preparación de rodillas y cadera.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "Deload Parejas", items: ["Divertir y mantener movilidad activa", "Cero impacto o sobrecarga"] },
                        metcon: { title: "02. TEAM WOD (TEAMS OF 2)", scheme: "AMRAP 25 MIN | I Go / You Go (Rondas Completas)", items: ["500m Remo (Alternando)", "20 Wall Balls - Dividido", "10 Burpees con push-up estricto - Dividido <span class='cue'>🎯 Deload L4: Busquen transiciones fluidas. Ritmo constante de conversación, mantengan las pulsaciones bajo control.</span>"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Chocar los 5", "Estirar charlando alegremente con Flor"] }
                    },
                    {
                        tabName: "SAN JUSTO (EQUIPO DE 3)",
                        warmup: { title: "01. WARM-UP CO-OP", scheme: "Social", items: ["Movilidad grupal", "2 Rondas Extras: 10 Crunches cortos (cero compresión psoas) + 10 Air Squats <span class='cue'>🎯 Activación L4: Foco flexores.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "Format Tríos Rotativo", items: ["Un atleta en remo, uno en wall balls, uno en burpees. Movimiento constante sin fatigar."] },
                        metcon: { title: "02. TEAM WOD (TEAMS OF 3)", scheme: "AMRAP 25 MIN | Estaciones Rotativas", items: ["Atleta A: 500m Remo", "Atleta B: 20 Wall Balls", "Atleta C: 10 Burpees con push-up estricto <span class='cue'>🎯 Dinámica L4: El atleta A no puede arrancar el remo hasta que el atleta C culmine sus burpees. Rotación completa de estaciones. Excelente recuperación activa.</span>"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Estirar en círculo compartiendo anécdotas"] }
                    },
                    {
                        tabName: "SAN JUSTO (EQUIPO DE 4)",
                        warmup: { title: "01. WARM-UP CO-OP", scheme: "Social", items: ["Movilidad compartida en parejas", "2 Rondas Extras: 10 Crunches cortos (cero compresión psoas) + 10 Air Squats <span class='cue'>🎯 Activación L4: Foco rodillas.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "Format Duplas Sincro", items: ["Ejecución sincro para descarga coordinada", "Divertir en duplas."] },
                        metcon: { title: "02. TEAM WOD (TEAMS OF 4)", scheme: "AMRAP 25 MIN | Relevo de Duplas o Sincro", items: ["Pareja A: 1000m Remo (dividido de a 500m)", "Pareja B: 40 Wall Balls (sincronizados u alternados", "Pareja A: 20 Burpees sincronizados con push-up <span class='cue'>🎯 Dinámica L4: Alternar duplas para bloques de ejercicios o sincronizarlos para un estímulo aeróbico social y sin picos neurales.</span>"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Chocar los 5 grupal y estiramientos profundos de isquiotibiales"] }
                    },
                    {
                        tabName: "SAN JUSTO (NO BURPEES)",
                        warmup: { title: "01. WARM-UP", scheme: "Social", items: ["Calentamiento articular grupal", "2 Rondas Extras: 10 Crunches cortos (cero compresión psoas) + 10 Air Squats <span class='cue'>🎯 Activación L4: Activación de rodillas y cadera.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "No-Burpee", items: ["Movimiento constante", "Cero impacto lumbar"] },
                        metcon: { title: "02. TEAM WOD (NO BURPEES)", scheme: "AMRAP 25 MIN | I go / You go", items: ["500m Remo", "20 Wall Balls", "15 Russian KB Swings (24/16 kg) <span class='cue'>🎯 Reemplazo L4: Estímulo posterior masivo para descargar la columna sin flexiones de pecho.</span>"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Elongación completa con Flor"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP RX)",
                        warmup: { title: "01. WARM-UP CO-OP L4 SOCIAL", scheme: "Social", items: ["Juegos de calentamiento generales", "2 Rondas Extras: 10 Crunches abdominales cortos + 10 Air Squats <span class='cue'>🎯 Activación L4: Lubricación de bursa rotuliana e iliaca.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "Pacing Haedo", items: ["Alternancia ágil de transiciones"] },
                        metcon: { title: "02. TEAM WOD (HAEDO)", scheme: "AMRAP 25 MIN | I go / You go", items: ["150 Saltos Simples", "20 Goblet Squats", "10 Burpees"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Elongación colectiva"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP NO BURPEES)",
                        warmup: { title: "01. WARM-UP CO-OP L4 SOCIAL BIOMECÁNICO", scheme: "Social", items: ["Activación conjunta de core y piernas", "2 Rondas Extras: 10 Crunches cortos + 10 Air Squats <span class='cue'>🎯 Activación L4: Protector lumbar y rotuliana.</span>"] },
                        strength: { title: "ESTRATEGIA", scheme: "Smooth Flow", items: ["Preservar hombros", "Movimiento cyclico continuo"] },
                        metcon: { title: "02. TEAM WOD HAEDO (NO BURPEES)", scheme: "AMRAP 25 MIN | I go / You go", items: ["150 Saltos Simples", "20 Goblet Squats", "15 Russian KB Swings (16/12 kg) <span class='cue'>🎯 Reemplazo L4: Swings con carga moderada para mantener el flujo sanguíneo activo.</span>"] },
                        accessories: { title: "03. COOLDOWN - FINISHER", scheme: "10 Minutos", items: ["Elongación colectiva"] }
                    }
                ]
            },
            {
                id: "w4d7", name: "DOMINGO", title: "Tavern Portal", isCompleted: false, hasTabs: true,
                variations: [
                    {
                        tabName: "ACTO I SELLADO",
                        warmup: { title: "LOGRO OBTENIDO", scheme: "Acto I Completo", items: ["Sobreviviste al Campamento de las Arpías", "Nivel de resiliencia biomecánica: Avanzado"] },
                        strength: { title: "ESTADO FÍSICO", scheme: "Óptimo", items: ["Estabilidad lumbar blindada", "Core activado y cadena posterior robustecida"] },
                        metcon: { title: "SNC STATUS", scheme: "Listo", items: ["Totalmente recuperado", "Preparado para el Desierto (Acto II)"] },
                        accessories: { title: "PRÓXIMO PASO - FINISHER", scheme: "Fase II", items: ["Apertura del Acto II: Las Catacumbas", "Aumento progresivo de cargas axiales"] }
                    },
                    {
                        tabName: "SEDE HAEDO (CO-OP CON LUK)",
                        warmup: { title: "ACTO I SELLADO CO-OP", scheme: "Paso a Paso", items: ["Estiramientos relajados conjuntos", "Auto-masaje con rodillo miofascial"] },
                        strength: { title: "ESTADO FÍSICO CO-OP", scheme: "Sinergia Completa", items: ["Preparación e hidratación completa mutua"] },
                        metcon: { title: "SNC REBOOT CO-OP", scheme: "Próximas Metas", items: ["Programación mental y de objetivos para la Fase II de entrenamiento"] },
                        accessories: { title: "PRÓXIMO PASO CO-OP", scheme: "Listo", items: ["Fase II: Camino al Desierto. Listos para seguir sumando calidad."] }
                    }
                ]
            }
        ]
    }
};
