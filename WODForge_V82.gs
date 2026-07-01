// ============================================================
// WODForge V82 — Formula-First + Chapter System (FIXED)
// ============================================================
// FIXES vs V81 (los gráficos rotos):
// 1. Minutos (Y): "14:00" ya NO se lee como 14 horas (840 min).
//    Nuevo parser: h:mm:ss / mm:ss + corrección automática si
//    el valor supera 180 min (ningún bloque dura 3+ horas).
// 2. Grids de carga diaria y minutos semanales: V81 usaba
//    MAXIFS con criterios-rango dentro de SUMPRODUCT (inválido
//    en Sheets → error → 0). Ahora la deduplicación por bloque
//    vive en columnas helper por fila (AC/AD) y los dashboards
//    usan SUMIFS simples. Neural Strain y Densidad vuelven a la vida.
// 3. RPE/RIR/Kilos guardados como TEXTO (Semanas 1-2): nuevas
//    columnas AA/AB (RPEn/RIRn) coercionan a número con VALUE(),
//    y todos los promedios del dashboard leen de ahí. Además
//    setupAll normaliza las celdas de texto numérico en origen.
// 4. e1RM (Z): ya no exige ISNUMBER estricto — coerciona Kilos
//    y lee RPE/RIR de AA/AB. Semanas 1-3 vuelven a graficar.
// 5. Reps Tot (W): ahora también parsea "12 Thrusters", "6/6
//    Bulgarian Split Squats" (número al inicio del ejercicio).
//
// Sin datos hardcodeados: todo sale de Resultados_y_RPE vía fórmulas.
// KEPT: Embellecer, RPG Sidebar, CSV Import, Auto-Load, Coronar PRs
// ============================================================

// ─── COLUMN INDICES (0-based) ────────────────────────────────
const COLS = {
  CAPITULO: 0, FECHA: 1, SEMANA: 2, DIA: 3, BLOQUE: 4, EJERCICIO: 5,
  ESQUEMA: 6, INTENSIDAD: 7, DESCANSO: 8, VOLUMEN: 9, REPS_EX: 10,
  TIEMPO: 11, KG: 12, RPE: 13, RIR: 14, MODO: 15, PR: 16, NOTAS: 17, REVISAR: 18
};
// Helper columns (1-based) — U..AD
const H = { CAT: 21, INT_PCT: 22, REPS: 23, VOL: 24, MIN: 25, E1RM: 26, RPE_N: 27, RIR_N: 28, MIN_BLQ: 29, CARGA_BLQ: 30 };
const H_COUNT = 10;
const H_HEADERS = ["Categoría", "Int%", "Reps Tot", "Vol-Carga", "Minutos", "e1RM", "RPEn", "RIRn", "MinBloque", "CargaBloque"];

const SEMANAS_SRC = ["Semana 1", "Semana 2", "Semana 3", "Semana 4"];
const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const RPG_CAL = {
  STR_DIVISOR: 6.0, POT_DIVISOR: 2.5, CON_DIVISOR: 450,
  DEX_REF_PACE: 25, VIT_DIVISOR: 150
};

const DATA_ROWS = 500; // max rows to cover (enough for 2+ chapters)

// ─── MENU ────────────────────────────────────────────────────
function onOpen() {
  SpreadsheetApp.getUi().createMenu('WODForge ⚡️')
    .addItem('⚡ Setup Completo (Fórmulas + Gráficos)', 'setupAll')
    .addSeparator()
    .addItem('🛡️ Hoja de Personaje / Configuración', 'mostrarSidebarConfiguracion')
    .addItem('🎨 Embellecer Hoja de Resultados', 'embellecerHojaResultados')
    .addSeparator()
    .addItem('🧹 Normalizar Datos Numéricos (texto → número)', 'normalizarDatosNumericosMenu')
    .addItem('🎯 Auto-Load (Calcular Kilos y Descansos)', 'calcularKilosPautados')
    .addItem('🏆 Detectar y Coronar PRs Reales', 'coronarPRs')
    .addSeparator()
    .addItem('📥 Importar CSV (desde App Nexus L4)', 'importarCSVDesdeApp')
    .addToUi();
}

// ─── SHEET FINDER ────────────────────────────────────────────
function getSourceSheet(ss) {
  const props = PropertiesService.getDocumentProperties();
  const conf = props.getProperty('WODFORGE_SOURCE_SHEET');
  if (conf) { const s = ss.getSheetByName(conf); if (s) return s; }
  const alts = [
    "Resultados_y_RPE", "Resultados",
    "L4 Programación & Resultados (29/5/2026)", "L4 Programación & Resultados",
    "Copy of Res_y_RPE"
  ];
  for (let a of alts) { let s = ss.getSheetByName(a); if (s) return s; }
  for (let s of ss.getSheets()) {
    const a1 = String(s.getRange("A1").getValue()).trim().toLowerCase();
    if (a1 === "capítulo" || a1 === "capitulo" || a1 === "skip") return s;
  }
  return ss.getActiveSheet();
}

// ─── BASIC HELPERS ───────────────────────────────────────────
function extractNumber(str) {
  if (typeof str === 'number') return str;
  const m = String(str).replace(",", ".").match(/(\d+(\.\d+)?)/);
  return m ? parseFloat(m[1]) : 0;
}
function identificarSemana(s) { const m = String(s).match(/semana\s*([1-4])/i); return m ? "SEMANA " + m[1] : null; }
function identificarDia(str) {
  const s = String(str).toLowerCase();
  const aliases = { "lut gholein": "Sábado", "andariel": "Sábado", "tavern portal": "Domingo" };
  for (let a in aliases) { if (s.includes(a)) return aliases[a]; }
  const dias = ["lunes","martes","miércoles","jueves","viernes","sábado","domingo"];
  for (let d of dias) { if (s.includes(d.replace("é","e").replace("á","a")) || s.includes(d)) return d.charAt(0).toUpperCase()+d.slice(1); }
  return null;
}
function resolverSemanaDia(fila) {
  const f = String(fila[COLS.SEMANA]) + " " + String(fila[COLS.DIA]);
  return { sem: identificarSemana(f), dia: identificarDia(f) };
}
function parsearSeriesReps(esquema) {
  const s = String(esquema);
  const re = /\b(\d{1,2})\s*[xX]\s*(\d{1,2})\b/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const before = s.slice(Math.max(0, m.index - 8), m.index).toLowerCase();
    if (before.indexOf("tempo") !== -1) continue;
    const series = parseInt(m[1]), reps = parseInt(m[2]);
    if (series >= 1 && series <= 10 && reps >= 1 && reps <= 50) return { series, reps };
  }
  return null;
}
function multiplicadorImplemento(texto) {
  return /c\/u|c\/ u|cada mano|cada brazo|doble kb|doble db|double|dual\s*(?:db|kb|dumbbell|kettlebell)/i.test(String(texto)) ? 2 : 1;
}
function nombreMovimiento(ej) {
  const s = String(ej).toLowerCase();
  const canon = ["back squat","front squat","overhead squat","hang power snatch","power snatch",
    "squat snatch","snatch","hang power clean","power clean","clean & jerk","clean and jerk",
    "clean","split jerk","push jerk","push press","strict press","bench press","thruster",
    "deadlift","gorilla row","bent over row","hip thrust","bicep curl","pull-up","chin-up","squat"];
  for (let c of canon) if (s.indexOf(c) !== -1) return c;
  return s.replace(/<[^>]*>/g,"").replace(/\([^)]*\)/g,"").replace(/[0-9]/g,"")
          .replace(/[^a-záéíóúñ ]/g," ").replace(/\s+/g," ").trim();
}
function estimar1RM(carga, reps, rpe, rir) {
  if (carga <= 0 || reps <= 0) return 0;
  if ((rpe||0) > 0 || (rir||0) > 0) {
    const reserva = rir > 0 ? rir : Math.max(0, 10-rpe);
    return carga * (1 + Math.min(15, reps+reserva) / 30);
  }
  return carga * (1 + reps / 30);
}
function _aSeg(n, sec, u) {
  const v = parseInt(n)||0;
  if (sec) return v*60+(parseInt(sec)||0);
  const ul = String(u||'').toLowerCase();
  return /min|mins|minutos|m|'|'|′/.test(ul) ? v*60 : v;
}
function descansoSegundos(esq) {
  const s = String(esq);
  let m = s.match(/(?:rest|descanso)\s*[:\-]?\s*(\d+)(?::(\d+))?\s*(seg|segundos|min|mins|minutos|s|m|'|'|′|″|")?/i);
  if (m) return _aSeg(m[1],m[2],m[3]);
  m = s.match(/(\d+)(?::(\d+))?\s*(seg|segundos|min|mins|minutos|s|m|'|'|′|″|")?\s*off\b/i);
  if (m) return _aSeg(m[1],m[2],m[3]||"'");
  return 0;
}
function normalizarIntensidad(val) {
  const s = String(val);
  const rng = s.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*%/);
  if (rng) return (parseFloat(rng[1])+parseFloat(rng[2]))/2;
  const pct = s.match(/(\d+(?:\.\d+)?)\s*%/);
  if (pct) { const n = parseFloat(pct[1]); if (n > 0 && n <= 100) return n; }
  return null;
}
function asegurarDimensiones(sheet, rows, cols) {
  if (sheet.getMaxRows() < rows) sheet.insertRowsAfter(sheet.getMaxRows(), rows - sheet.getMaxRows());
  if (sheet.getMaxColumns() < cols) sheet.insertColumnsAfter(sheet.getMaxColumns(), cols - sheet.getMaxColumns());
}

// ─── CHAPTER DETECTION ───────────────────────────────────────
function _isValidChapter(v) {
  if (v === false || v === true || v == null) return false;
  const s = String(v).trim();
  if (!s || s.toLowerCase() === 'false' || s.toLowerCase() === 'true') return false;
  return true;
}
function detectChapters(ss) {
  const src = getSourceSheet(ss);
  if (!src) return [];
  const lastR = src.getLastRow();
  if (lastR < 2) return [];
  const vals = src.getRange(2, 1, lastR-1, 1).getValues()
    .map(r => _isValidChapter(r[0]) ? String(r[0]).trim() : '')
    .filter(Boolean);
  const unique = [...new Set(vals)];
  return unique.length > 0 ? unique : [];
}

// ═══════════════════════════════════════════════════════════════
//  CHAPTER FILTER HELPERS
// ═══════════════════════════════════════════════════════════════
// For AVERAGEIFS/COUNTIFS/SUMIFS: returns ',src!A:A,"Andariel"' or ""
function _aiFilter(sq, chapter) {
  if (!chapter) return '';
  return ','+sq+'!A:A,"'+chapter+'"';
}
// For FILTER: returns ',src!A:A="Andariel"' or ""
function _fFilter(sq, chapter) {
  if (!chapter) return '';
  return ','+sq+'!A:A="'+chapter+'"';
}

// ═══════════════════════════════════════════════════════════════
//  NORMALIZAR TEXTO NUMÉRICO → NÚMERO (FIX #3)
//  Semanas 1-2 tenían Kilos/RPE/RIR como texto. AVERAGEIFS y
//  ISNUMBER fallaban silenciosamente. Esto convierte en origen.
// ═══════════════════════════════════════════════════════════════
function normalizarDatosNumericos() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const src = getSourceSheet(ss);
  if (!src) return 0;
  const lastR = src.getLastRow();
  if (lastR < 2) return 0;
  // Columnas numéricas (1-based): H Intensidad, I Descanso, J Rondas,
  // K Extra, M Kilos, N RPE, O RIR
  const cols = [8, 9, 10, 11, 13, 14, 15];
  let n = 0;
  cols.forEach(c => {
    const rng = src.getRange(2, c, lastR-1, 1);
    const vals = rng.getValues();
    let changed = false;
    for (let i = 0; i < vals.length; i++) {
      const v = vals[i][0];
      if (typeof v === 'string') {
        const s = v.trim().replace(',', '.');
        if (s !== '' && /^-?\d+(\.\d+)?$/.test(s)) {
          vals[i][0] = parseFloat(s);
          changed = true; n++;
        }
      }
    }
    if (changed) rng.setValues(vals);
  });
  return n;
}
function normalizarDatosNumericosMenu() {
  const n = normalizarDatosNumericos();
  SpreadsheetApp.getUi().alert(n > 0
    ? '🧹 ' + n + ' celdas de texto convertidas a número.'
    : '🧹 Todo ya estaba en formato numérico.');
}

// ═══════════════════════════════════════════════════════════════
//  SETUP: CAPÍTULO COLUMN (A)
// ═══════════════════════════════════════════════════════════════
function setupCapitulos(defaultChapter) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const src = getSourceSheet(ss);
  if (!src) return;
  src.getRange("A1").setValue("Capítulo")
    .setFontWeight("bold").setHorizontalAlignment("center")
    .setBackground("#0A0A0E").setFontColor("#FFD700");
  const lastR = src.getLastRow();
  if (lastR < 2 || !defaultChapter) return;
  const vals = src.getRange(2, 1, lastR-1, 1).getValues();
  const updates = vals.map(r => {
    return [_isValidChapter(r[0]) ? String(r[0]).trim() : defaultChapter];
  });
  src.getRange(2, 1, lastR-1, 1).setValues(updates);
}

// ═══════════════════════════════════════════════════════════════
//  SETUP: HELPER COLUMNS (U-AD en Resultados_y_RPE)
// ═══════════════════════════════════════════════════════════════
function setupHelperColumns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const src = getSourceSheet(ss);
  if (!src) { SpreadsheetApp.getUi().alert("⚠️ No se encontró la hoja de datos."); return; }
  const lastR = Math.max(src.getLastRow(), 2);
  const endR = Math.min(Math.max(lastR + 50, 100), DATA_ROWS);
  asegurarDimensiones(src, endR, H.CARGA_BLQ);

  src.getRange(1, H.CAT, 1, H_COUNT).setValues([H_HEADERS])
    .setFontWeight("bold").setHorizontalAlignment("center")
    .setBackground("#0A0A0E").setFontColor("#39FF14");

  const formulas = [];
  for (let r = 2; r <= endR; r++) {
    formulas.push([
      formulaCat(r), formulaIntPct(r), formulaReps(r),
      formulaVol(r), formulaMin(r), formulaE1rm(r),
      formulaRpeN(r), formulaRirN(r),
      formulaMinBloque(r), formulaCargaBloque(r)
    ]);
  }
  src.getRange(2, H.CAT, formulas.length, H_COUNT).setFormulas(formulas);
  src.getRange(2, H.CAT, formulas.length, H_COUNT)
    .setBackground("#0E0E11").setFontColor("#555555").setFontSize(9);
  src.getRange(2, H.VOL, formulas.length, 1).setNumberFormat("#,##0");
  src.getRange(2, H.MIN, formulas.length, 1).setNumberFormat("#,##0.0");
  src.getRange(2, H.E1RM, formulas.length, 1).setNumberFormat("#,##0.0");
  src.getRange(2, H.MIN_BLQ, formulas.length, 2).setNumberFormat("#,##0.0");
}

// Column letters: A=Capítulo, B=Fecha, C=Semana, D=Día, E=Bloque, F=Ejercicio,
// G=Esquema, H=Intensidad, I=Descanso, J=Rondas, K=Extra, L=Tiempo, M=Kilos,
// N=RPE, O=RIR, P=Modo, Q=PR, R=Notas, S=Revisar
// Helpers: U=Cat, V=Int%, W=Reps, X=Vol, Y=Min, Z=e1RM,
//          AA=RPEn, AB=RIRn, AC=MinBloque, AD=CargaBloque
function formulaCat(r) {
  return '=IF(E'+r+'="","",IF(REGEXMATCH(LOWER(E'+r+'),"fuerza|strength|peak|heavy"),"Fuerza",' +
    'IF(REGEXMATCH(LOWER(E'+r+'),"metcon|boss|wod|sprint|chipper|team|couplet|interval|amrap|emom|for time|por tiempo"),"Metcon",' +
    'IF(REGEXMATCH(LOWER(E'+r+'),"acc|finisher|reinforce|hyper"),"Accesorios",' +
    'IF(REGEXMATCH(LOWER(E'+r+'),"warm|mov|activac|movilidad|prehab"),"Warm-up",' +
    'IF(REGEXMATCH(LOWER(E'+r+'),"desc|rest|descanso|recuper|flush|logro|estado|próximo|snc|cooldown|regenerat"),"Descanso","Otro"))))))';
}

function formulaIntPct(r) {
  return '=IFERROR(IF(REGEXMATCH(TO_TEXT(G'+r+'),"\\d+\\.?\\d*\\s*-\\s*\\d+\\.?\\d*\\s*%"),' +
    '(VALUE(REGEXEXTRACT(TO_TEXT(G'+r+'),"(\\d+\\.?\\d*)\\s*-\\s*\\d+\\.?\\d*\\s*%"))+' +
    'VALUE(REGEXEXTRACT(TO_TEXT(G'+r+'),"\\d+\\.?\\d*\\s*-\\s*(\\d+\\.?\\d*)\\s*%")))/2,' +
    'IF(REGEXMATCH(TO_TEXT(G'+r+'),"\\d+\\.?\\d*\\s*%"),' +
    'VALUE(REGEXEXTRACT(TO_TEXT(G'+r+'),"(\\d+\\.?\\d*)\\s*%")),"")),"")';
}

// FIX #5: agrega parsing de "6/6 Ejercicio" y "12 Ejercicio" (número
// al inicio del nombre) — el estilo de registro de la Semana 3+.
function formulaReps(r) {
  return '=IF(F'+r+'="","",LET(' +
    'g,TO_TEXT(G'+r+'),f,TO_TEXT(F'+r+'),' +
    'j,IF(AND(ISNUMBER(J'+r+'),J'+r+'>0),J'+r+',1),' +
    'k,IF(AND(ISNUMBER(K'+r+'),K'+r+'>0),K'+r+',0),' +
    'combo,LOWER(f&" "&g),' +
    'ch_ok,REGEXMATCH(g,"\\d{1,3}\\s*-\\s*\\d{1,3}\\s*-\\s*\\d{1,3}"),' +
    'ch_s,IF(ch_ok,IFERROR(SPLIT(REGEXEXTRACT(g,"(\\d{1,3}\\s*-\\s*\\d{1,3}\\s*-\\s*\\d{1,3})"),"-"),{"0","0","0"}),{"0","0","0"}),' +
    'ch_v,IF(ch_ok,IFERROR(VALUE(INDEX(ch_s,,1))+VALUE(INDEX(ch_s,,2))+VALUE(INDEX(ch_s,,3)),0),0),' +
    'gc,REGEXREPLACE(REGEXREPLACE(g,"(?i)tempo\\s*\\d+\\s*[xX]\\s*\\d+",""),"\\d+:\\d+",""),' +
    'nx_ok,REGEXMATCH(gc,"\\d{1,2}\\s*[xX]\\s*\\d{1,2}"),' +
    'nx_n,IF(nx_ok,IFERROR(VALUE(REGEXEXTRACT(gc,"(\\d{1,2})\\s*[xX]\\s*\\d{1,2}")),0),0),' +
    'nx_m,IF(nx_ok,IFERROR(VALUE(REGEXEXTRACT(gc,"\\d{1,2}\\s*[xX]\\s*(\\d{1,2})")),0),0),' +
    'ac_ok,REGEXMATCH(g,"(?i)acumular\\s*\\d+"),' +
    'ac_v,IF(ac_ok,IFERROR(VALUE(REGEXEXTRACT(g,"(?i)acumular\\s*(\\d+)")),0),0),' +
    'rp_ok,REGEXMATCH(g,"(?i)\\d+\\s*reps"),' +
    'rp_v,IF(rp_ok,IFERROR(VALUE(REGEXEXTRACT(g,"(?i)(\\d+)\\s*reps")),0),0),' +
    'cd_ok,REGEXMATCH(g,"(?i)\\d+\\s*cada"),' +
    'cd_r,IF(cd_ok,IFERROR(VALUE(REGEXEXTRACT(g,"(?i)(\\d+)\\s*cada")),0),0),' +
    'cd_s,IF(cd_ok,IFERROR(VALUE(REGEXEXTRACT(g,"(?i)(\\d+)\\s*series")),j),j),' +
    'sl_ok,REGEXMATCH(f,"^\\s*\\d+\\s*/\\s*\\d+"),' +
    'sl_v,IF(sl_ok,IFERROR(VALUE(REGEXEXTRACT(f,"^\\s*(\\d+)"))+VALUE(REGEXEXTRACT(f,"^\\s*\\d+\\s*/\\s*(\\d+)")),0),0),' +
    'fn_ok,REGEXMATCH(f,"^\\s*\\d+\\s"),' +
    'fn_v,IF(fn_ok,IFERROR(VALUE(REGEXEXTRACT(f,"^\\s*(\\d+)")),0),0),' +
    'bil,IF(REGEXMATCH(combo,"por pierna|por lado|cada lado|cada pierna|por brazo"),2,1),' +
    'base,IF(ch_ok,ch_v,IF(nx_ok,nx_n*nx_m,IF(cd_ok,cd_r*cd_s,IF(ac_ok,ac_v,IF(rp_ok,rp_v*j,IF(sl_ok,sl_v*j,IF(fn_ok,fn_v*j,j))))))),' +
    'base*bil+k))';
}

function formulaVol(r) {
  return '=IFERROR(LET(' +
    'kg,IF(ISNUMBER(M'+r+'),M'+r+',IF(ISNUMBER(VALUE(M'+r+')),VALUE(M'+r+'),0)),' +
    'reps,W'+r+',' +
    'dual,IF(REGEXMATCH(LOWER(TO_TEXT(F'+r+')&" "&TO_TEXT(G'+r+')),"c/u|cada mano|cada brazo|doble kb|doble db|double kb|double db|dual"),2,1),' +
    'IF(AND(kg>0,ISNUMBER(reps),reps>0),kg*dual*reps,0)),0)';
}

// FIX #1: parser de tiempo correcto.
// · h:mm:ss → horas*60 + min + seg/60
// · mm:ss   → min + seg/60  (¡"14:00" son 14 minutos, no 14 horas!)
// · Si la celda es una duración real de Sheets y supera 180 min,
//   se asume que el usuario tipeó mm:ss y Sheets lo guardó como
//   horas → se divide por 60. Ningún bloque de entrenamiento
//   dura más de 3 horas.
function formulaMin(r) {
  return '=IFERROR(LET(' +
    't,L'+r+',g,UPPER(TO_TEXT(G'+r+')),' +
    'raw,IF(t="",0,IF(ISNUMBER(t),IF(t<1,t*24*60,t),' +
      'LET(s,TO_TEXT(t),' +
      'IF(REGEXMATCH(s,"^\\d{1,2}:\\d{1,2}:\\d{1,2}$"),' +
        'LET(p,SPLIT(s,":"),INDEX(p,1,1)*60+INDEX(p,1,2)+INDEX(p,1,3)/60),' +
      'IF(REGEXMATCH(s,"^\\d{1,3}:\\d{1,2}$"),' +
        'LET(q,SPLIT(s,":"),INDEX(q,1,1)+INDEX(q,1,2)/60),' +
      'IFERROR(VALUE(REGEXEXTRACT(s,"(\\d+)")),0)))))),' +
    't_num,IF(raw>=180,raw/60,raw),' +
    'amrap,IFERROR(VALUE(REGEXEXTRACT(g,"AMRAP\\s*(\\d+)")),0),' +
    'emom,IFERROR(VALUE(REGEXEXTRACT(g,"EMOM\\s*(\\d+)")),0),' +
    'cap,IFERROR(VALUE(REGEXEXTRACT(g,"CAP[:\\s]*?(\\d+)")),0),' +
    'mk,IFERROR(VALUE(REGEXEXTRACT(g,"(\\d+)\\s*MIN")),0),' +
    'iv_on,IFERROR(VALUE(REGEXEXTRACT(g,"(\\d+)\\s*[\'′]?\\s*(?:MIN)?\\s*ON")),0),' +
    'iv_off,IFERROR(VALUE(REGEXEXTRACT(g,"(\\d+)\\s*[\'′]?\\s*(?:MIN)?\\s*OFF")),0),' +
    'iv_rds,IF(AND(iv_on>0,iv_off>0),IFERROR(VALUE(REGEXEXTRACT(g,"(\\d+)\\s*RONDAS")),IF(AND(ISNUMBER(J'+r+'),J'+r+'>0),J'+r+',4)),0),' +
    'iv_mins,IF(AND(iv_on>0,iv_off>0),iv_rds*(iv_on+iv_off),0),' +
    'est,IF(amrap>0,amrap,IF(emom>0,emom,IF(iv_mins>0,iv_mins,IF(cap>0,cap,mk)))),' +
    'IF(t_num>0,t_num,est)),0)';
}

// FIX #4 (v2): e1RM sin LET — la versión con LET anidado daba
// #ERROR! de parseo en Sheets. Esta usa solo construcciones ya
// probadas en las demás columnas helper. Coerciona Kilos con
// VALUE(TO_TEXT()) y lee RPE/RIR numéricos de AA/AB.
// Devuelve 0 (no "") cuando no aplica, para que Z:Z>0 filtre limpio.
function formulaE1rm(r) {
  const KG = 'IFERROR(VALUE(TO_TEXT(M'+r+')),0)';
  const RPE = 'AA'+r;
  const RIR = 'AB'+r;
  const DUAL = 'IF(REGEXMATCH(LOWER(TO_TEXT(F'+r+')&" "&TO_TEXT(G'+r+')),"c/u|cada mano|doble|double|dual"),2,1)';
  const RSET = 'IFERROR(VALUE(REGEXEXTRACT(REGEXREPLACE(REGEXREPLACE(TO_TEXT(G'+r+'),"(?i)tempo\\s*\\d+\\s*[xX]\\s*\\d+",""),"\\d+:\\d+",""),"\\d{1,2}\\s*[xX]\\s*(\\d{1,2})")),1)';
  return '=IF(AND(REGEXMATCH(LOWER(TO_TEXT(E'+r+')),"fuerza|strength|peak|heavy"),' +
    KG+'>0,'+RPE+'+'+RIR+'>0),' +
    'ROUND('+KG+'*'+DUAL+'*(1+MIN(15,'+RSET+'+IF('+RIR+'>0,'+RIR+',MAX(0,10-'+RPE+')))/30),1),0)';
}

// FIX #3: RPE/RIR numéricos a prueba de texto. Todos los promedios
// del dashboard leen de estas columnas.
function formulaRpeN(r) {
  return '=IF(N'+r+'="",0,IF(ISNUMBER(N'+r+'),N'+r+',IFERROR(VALUE(SUBSTITUTE(TO_TEXT(N'+r+'),",",".")),0)))';
}
function formulaRirN(r) {
  return '=IF(O'+r+'="",0,IF(ISNUMBER(O'+r+'),O'+r+',IFERROR(VALUE(SUBSTITUTE(TO_TEXT(O'+r+'),",",".")),0)))';
}

// FIX #2: deduplicación por bloque hecha POR FILA (escalar, válida).
// AC = minutos del bloque, contados solo en la PRIMERA fila de cada
//      grupo (Capítulo, Semana, Día, Bloque), valor = MAX del grupo.
// AD = minutos del bloque × RPE máx del bloque (carga sRPE Foster),
//      también solo en la primera fila del grupo.
// Los dashboards después solo hacen SUMIFS sobre AC/AD.
function formulaMinBloque(r) {
  const N = DATA_ROWS;
  return '=IF($E'+r+'="",0,IF(COUNTIFS($A$2:$A'+r+',$A'+r+',$C$2:$C'+r+',$C'+r+',$D$2:$D'+r+',$D'+r+',$E$2:$E'+r+',$E'+r+')=1,' +
    'IFERROR(MAXIFS($Y$2:$Y$'+N+',$A$2:$A$'+N+',$A'+r+',$C$2:$C$'+N+',$C'+r+',$D$2:$D$'+N+',$D'+r+',$E$2:$E$'+N+',$E'+r+'),0),0))';
}
function formulaCargaBloque(r) {
  const N = DATA_ROWS;
  return '=IF($E'+r+'="",0,IF(COUNTIFS($A$2:$A'+r+',$A'+r+',$C$2:$C'+r+',$C'+r+',$D$2:$D'+r+',$D'+r+',$E$2:$E'+r+',$E'+r+')=1,' +
    'IFERROR(MAXIFS($Y$2:$Y$'+N+',$A$2:$A$'+N+',$A'+r+',$C$2:$C$'+N+',$C'+r+',$D$2:$D$'+N+',$D'+r+',$E$2:$E$'+N+',$E'+r+')*' +
    'MAXIFS($AA$2:$AA$'+N+',$A$2:$A$'+N+',$A'+r+',$C$2:$C$'+N+',$C'+r+',$D$2:$D$'+N+',$D'+r+',$E$2:$E$'+N+',$E'+r+'),0),0))';
}

// ═══════════════════════════════════════════════════════════════
//  SETUP: DASHBOARD FORMULAS (chapter-aware)
//  chapter = null → General (sin filtro) | "Andariel" → filtrado
// ═══════════════════════════════════════════════════════════════
function setupDashboardFormulas(chapter) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const src = getSourceSheet(ss);
  if (!src) return;
  const srcName = src.getName();
  const sq = /[^A-Za-z0-9_]/.test(srcName) ? "'" + srcName.replace(/'/g, "''") + "'" : srcName;

  const sheetName = chapter ? "WODForge_" + chapter : "WODForge_Dashboard";
  let dash = ss.getSheetByName(sheetName);
  const perfil = recuperarPerfilExistente(ss);
  if (!dash) dash = ss.insertSheet(sheetName);
  asegurarDimensiones(dash, 400, 30);
  dash.getCharts().forEach(c => dash.removeChart(c));
  dash.setTabColor(chapter ? "#1F51FF" : "#FF007F").setRowHeights(1, 150, 24);
  dash.setColumnWidth(1, 210);
  for (let c = 2; c <= 24; c++) dash.setColumnWidth(c, 110);
  dash.getRange(1, 1, 400, 30).setBackground("#0E0E11");

  const aiF = _aiFilter(sq, chapter);
  const fF = _fFilter(sq, chapter);

  // ── Title ──
  const titulo = chapter ? "📊 " + chapter.toUpperCase() : "📊 GENERAL (TODOS LOS CAPÍTULOS)";
  dash.getRange(1, 4, 1, 7).merge().setValue(titulo)
    .setBackground("#0A0A0E").setFontColor("#FFD700").setFontWeight("bold").setFontSize(14).setHorizontalAlignment("center");

  // ── Perfil (A2:B10) ──
  const isMain = !ss.getSheetByName("WODForge_Dashboard") || sheetName === "WODForge_Dashboard";
  escribirYObtenerPerfil(dash, perfil, isMain);

  // ── KPI Blocks ──
  inyectarKpiFormula(dash, 2, 4, "🛡️ TOTAL ARMAS (SUMATORIA RM)",
    '=SUM(B4:B10)&" KG"', "#FFFFFF");
  inyectarKpiFormula(dash, 2, 8, "🚀 POTENCIA RELATIVA TOTAL",
    '=ROUND(SUM(B4:B10)/B2,2)&"x BW"', "#39FF14");
  inyectarKpiFormula(dash, 5, 4, "⚖️ VOLUMEN-CARGA" + (chapter ? " ("+chapter+")" : " TOTAL"),
    '=TEXT(ROUND(SUMIFS('+sq+'!X:X,'+sq+'!X:X,">0"'+aiF+')),"#,##0")&" KG"', "#1F51FF");
  inyectarKpiFormula(dash, 5, 8, "🏆 HITOS DE INTENSIDAD",
    '=COUNTIFS('+sq+'!Q:Q,"*PR*"'+aiF+')&" Récords"', "#FFCC00");

  // ── Explanatory text blocks ──
  escribirBloquesExplicativos(dash);

  // ── Table 1 (row 250): Intensidad vs RPE ──
  dash.getRange(250, 1, 1, 3).setValues([["Semana", "Intensidad Pautada (%)", "RPE Promedio"]]);
  for (let i = 0; i < 4; i++) {
    const sem = SEMANAS_SRC[i];
    dash.getRange(251+i, 1).setValue(sem);
    dash.getRange(251+i, 2).setFormula(
      '=IFERROR(AVERAGEIFS('+sq+'!V:V,'+sq+'!C:C,"'+sem+'",'+sq+'!V:V,">0"'+aiF+'),0)');
    dash.getRange(251+i, 3).setFormula(
      '=IFERROR(AVERAGEIFS('+sq+'!AA:AA,'+sq+'!C:C,"'+sem+'",'+sq+'!AA:AA,">0"'+aiF+'),0)');
  }
  dash.getRange(250, 1, 5, 3).setFontColor("#0E0E11");

  // ── Table 2 (row 265): e1RM Back Squat ──
  dash.getRange(265, 1, 1, 3).setValues([["Semana", "e1RM Back Squat (estimado)", "1RM Back Squat (real)"]]);
  for (let i = 0; i < 4; i++) {
    const sem = SEMANAS_SRC[i];
    dash.getRange(266+i, 1).setValue(sem);
    dash.getRange(266+i, 2).setFormula(
      '=IFERROR(MAX(FILTER('+sq+'!Z:Z,'+sq+'!C:C="'+sem+'",REGEXMATCH(LOWER('+sq+'!F:F&""),"back squat"),'+sq+'!Z:Z>0'+fF+')),0)');
    dash.getRange(266+i, 3).setFormula('=B4');
  }
  dash.getRange(265, 1, 5, 3).setFontColor("#0E0E11");

  // ── Table 3 (row 280): Volume Distribution ──
  dash.getRange(280, 1, 1, 2).setValues([["Bloque", "Volumen-Carga (Kg)"]]);
  ["Fuerza","Metcon","Accesorios"].forEach((cat, i) => {
    dash.getRange(281+i, 1).setValue(cat);
    dash.getRange(281+i, 2).setFormula(
      '=ROUND(SUMIFS('+sq+'!X:X,'+sq+'!U:U,"'+cat+'"'+aiF+'))');
  });
  dash.getRange(280, 1, 4, 2).setFontColor("#0E0E11");

  // ── Helper Grid (row 200): Daily Loads (sRPE) — FIX #2: SUMIFS sobre AD ──
  dash.getRange(200, 1, 1, 8).setValues([["", ...DIAS]]).setFontColor("#0E0E11");
  for (let si = 0; si < 4; si++) {
    const sem = SEMANAS_SRC[si];
    dash.getRange(201+si, 1).setValue(sem).setFontColor("#0E0E11");
    for (let di = 0; di < 7; di++) {
      const dia = DIAS[di];
      dash.getRange(201+si, 2+di).setFormula(
        '=IFERROR(ROUND(SUMIFS('+sq+'!AD:AD,'+sq+'!C:C,"'+sem+'",'+sq+'!D:D,"'+dia+'"'+aiF+'),1),0)'
      ).setFontColor("#0E0E11");
    }
  }

  // ── Table 4 (row 295): Neural Strain ──
  dash.getRange(295, 1, 1, 2).setValues([["Semana", "Neural Strain (Carga x Monotonía)"]]);
  for (let si = 0; si < 4; si++) {
    const lr = 201 + si;
    dash.getRange(296+si, 1).setValue(SEMANAS_SRC[si]);
    dash.getRange(296+si, 2).setFormula(
      '=LET(raw,{B'+lr+',C'+lr+',D'+lr+',E'+lr+',F'+lr+',G'+lr+',H'+lr+'},' +
      'total,SUMPRODUCT((raw>0)*raw),n,SUMPRODUCT((raw>0)*1),' +
      'IF(n<2,ROUND(total),LET(mean_v,total/n,' +
      'sd_v,SQRT(SUMPRODUCT((raw>0)*(raw-mean_v)^2)/n),' +
      'mono,MIN(2.5,mean_v/MAX(sd_v,mean_v*0.1)),ROUND(total*mono))))');
  }
  dash.getRange(295, 1, 5, 2).setFontColor("#0E0E11");

  // ── Helper Grid (row 210): Weekly total minutes — FIX #2: SUMIFS sobre AC ──
  dash.getRange(210, 1, 1, 2).setValues([["Semana", "Min Totales"]]).setFontColor("#0E0E11");
  for (let si = 0; si < 4; si++) {
    const sem = SEMANAS_SRC[si];
    dash.getRange(211+si, 1).setValue(sem).setFontColor("#0E0E11");
    dash.getRange(211+si, 2).setFormula(
      '=IFERROR(ROUND(SUMIFS('+sq+'!AC:AC,'+sq+'!C:C,"'+sem+'"'+aiF+'),1),0)'
    ).setFontColor("#0E0E11");
  }

  // ── Table 5 (row 310): Densidad ──
  dash.getRange(310, 1, 1, 3).setValues([["Semana", "Densidad (Kg por Minuto)", "Minutos Totales"]]);
  for (let si = 0; si < 4; si++) {
    dash.getRange(311+si, 1).setValue(SEMANAS_SRC[si]);
    dash.getRange(311+si, 2).setFormula(
      '=IFERROR(ROUND(SUMIFS('+sq+'!X:X,'+sq+'!C:C,"'+SEMANAS_SRC[si]+'"'+aiF+')/B'+(211+si)+',1),0)');
    dash.getRange(311+si, 3).setFormula('=ROUND(B'+(211+si)+')');
  }
  dash.getRange(310, 1, 5, 3).setFontColor("#0E0E11");

  // ── Table 6 (row 325): Volume vs PRs ──
  dash.getRange(325, 1, 1, 3).setValues([["Semana", "Volumen-Carga Semanal", "Nº de PRs Rotos"]]);
  for (let si = 0; si < 4; si++) {
    const sem = SEMANAS_SRC[si];
    dash.getRange(326+si, 1).setValue(sem);
    dash.getRange(326+si, 2).setFormula(
      '=ROUND(SUMIFS('+sq+'!X:X,'+sq+'!C:C,"'+sem+'"'+aiF+'))');
    dash.getRange(326+si, 3).setFormula(
      '=COUNTIFS('+sq+'!C:C,"'+sem+'",'+sq+'!Q:Q,"*PR*"'+aiF+')');
  }
  dash.getRange(325, 1, 5, 3).setFontColor("#0E0E11");

  // ── Table 7 (row 340): RPE vs RIR — FIX #3: lee AA/AB ──
  dash.getRange(340, 1, 1, 3).setValues([["Semana", "RPE Promedio", "RIR Promedio"]]);
  for (let si = 0; si < 4; si++) {
    const sem = SEMANAS_SRC[si];
    dash.getRange(341+si, 1).setValue(sem);
    dash.getRange(341+si, 2).setFormula(
      '=IFERROR(AVERAGEIFS('+sq+'!AA:AA,'+sq+'!C:C,"'+sem+'",'+sq+'!AA:AA,">0"'+aiF+'),0)');
    dash.getRange(341+si, 3).setFormula(
      '=IFERROR(AVERAGEIFS('+sq+'!AB:AB,'+sq+'!C:C,"'+sem+'",'+sq+'!AB:AB,">0"'+aiF+'),0)');
  }
  dash.getRange(340, 1, 5, 3).setFontColor("#0E0E11");

  // ── Table 8 (row 355): Volume vs Descanso ──
  // Cuenta DÍAS de descanso (días distintos con ≥1 bloque de recuperación),
  // no filas — las filas narrativas (Logro/Estado/SNC) inflaban el conteo.
  dash.getRange(355, 1, 1, 3).setValues([["Semana", "Volumen-Carga (Kg)", "Días de Descanso"]]);
  for (let si = 0; si < 4; si++) {
    const sem = SEMANAS_SRC[si];
    dash.getRange(356+si, 1).setValue(sem);
    dash.getRange(356+si, 2).setFormula(
      '=ROUND(SUMIFS('+sq+'!X:X,'+sq+'!C:C,"'+sem+'"'+aiF+'))');
    dash.getRange(356+si, 3).setFormula(
      '=IFERROR(SUMPRODUCT(MAP({"Lunes";"Martes";"Miércoles";"Jueves";"Viernes";"Sábado";"Domingo"},' +
      'LAMBDA(d,IF(COUNTIFS('+sq+'!C:C,"'+sem+'",'+sq+'!D:D,d,'+sq+'!U:U,"Descanso"'+aiF+')>0,1,0)))),0)');
  }
  dash.getRange(355, 1, 5, 3).setFontColor("#0E0E11");
}

// ═══════════════════════════════════════════════════════════════
//  SETUP: SIMETRICO FORMULAS (chapter-aware)
// ═══════════════════════════════════════════════════════════════
function setupSimetricoFormulas(chapter) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const src = getSourceSheet(ss);
  if (!src) return;
  const srcName = src.getName();
  const sq = /[^A-Za-z0-9_]/.test(srcName) ? "'" + srcName.replace(/'/g, "''") + "'" : srcName;

  const sheetName = chapter ? "WODForge_Sim_" + chapter : "WODForge_Simetrico";
  let sim = ss.getSheetByName(sheetName);
  const perfil = recuperarPerfilExistente(ss);
  if (!sim) sim = ss.insertSheet(sheetName);
  asegurarDimensiones(sim, 280, 30);
  sim.getCharts().forEach(c => sim.removeChart(c));
  sim.setTabColor(chapter ? "#39FF14" : "#00FFFF").setRowHeights(1, 150, 24);
  sim.setColumnWidth(1, 210);
  for (let c = 2; c <= 24; c++) sim.setColumnWidth(c, 110);
  sim.getRange(1, 1, 280, 30).setBackground("#0E0E11");

  const aiF = _aiFilter(sq, chapter);

  const isMain = !ss.getSheetByName("WODForge_Dashboard") || !chapter;
  escribirYObtenerPerfil(sim, perfil, isMain && !ss.getSheetByName("WODForge_Dashboard"));

  const titulo = chapter ? "⚖️ SIMÉTRICO — " + chapter.toUpperCase() : "⚖️ SIMÉTRICO GENERAL";
  sim.getRange(1, 4, 1, 7).merge().setValue(titulo)
    .setBackground("#0A0A0E").setFontColor("#FFD700").setFontWeight("bold").setFontSize(14).setHorizontalAlignment("center");

  // ── KPI Blocks ──
  inyectarKpiFormula(sim, 2, 4, "🔥 DÍA MAYOR VOLUMEN",
    '=IFERROR(LET(dias,{"Lunes";"Martes";"Miércoles";"Jueves";"Viernes";"Sábado";"Domingo"},' +
    'vols,MAP(dias,LAMBDA(d,ROUND(SUMIFS('+sq+'!X:X,'+sq+'!D:D,d'+aiF+')))),' +
    'mx,MAX(vols),idx,MATCH(mx,vols,0),' +
    'UPPER(INDEX(dias,idx))&" ("&TEXT(mx,"#,##0")&" KG)"),"—")', "#1F51FF");

  inyectarKpiFormula(sim, 2, 8, "🧠 RESPUESTA MÁXIMA RPE",
    '=IFERROR(LET(dias,{"Lunes";"Martes";"Miércoles";"Jueves";"Viernes";"Sábado";"Domingo"},' +
    'rpes,MAP(dias,LAMBDA(d,IFERROR(AVERAGEIFS('+sq+'!AA:AA,'+sq+'!D:D,d,'+sq+'!AA:AA,">0"'+aiF+'),0))),' +
    'mx,MAX(rpes),idx,MATCH(mx,rpes,0),' +
    'UPPER(INDEX(dias,idx))&" ("&TEXT(mx,"0.0")&" RPE)"),"—")', "#FF007F");

  inyectarKpiFormula(sim, 5, 4, "⚖️ PROMEDIO DIARIO DE CARGA",
    '=IFERROR(LET(grid,B251:E257,' +
    'total,SUMPRODUCT(grid),dias,SUMPRODUCT((grid>0)*1),' +
    'IF(dias>0,TEXT(ROUND(total/dias),"#,##0")&" KG","—")),"—")', "#39FF14");

  inyectarKpiFormula(sim, 5, 8, "📅 DÍAS REGISTRADOS",
    '=IFERROR(SUMPRODUCT((B251:E257>0)*1)&" / 28 DÍAS","—")', "#FFCC00");

  // ── Table (row 250): Volume grid (Día × Semana) ──
  sim.getRange(250, 1, 1, 5).setValues([["Día", "Semana 1", "Semana 2", "Semana 3", "Semana 4"]]);
  for (let di = 0; di < 7; di++) {
    sim.getRange(251+di, 1).setValue(DIAS[di]);
    for (let si = 0; si < 4; si++) {
      sim.getRange(251+di, 2+si).setFormula(
        '=IFERROR(ROUND(SUMIFS('+sq+'!X:X,'+sq+'!C:C,"'+SEMANAS_SRC[si]+'",'+sq+'!D:D,"'+DIAS[di]+'"'+aiF+')),0)');
    }
  }
  sim.getRange(250, 1, 8, 5).setFontColor("#0E0E11");

  // ── Table (row 265): RPE grid (Día × Semana) — FIX #3: lee AA ──
  sim.getRange(265, 1, 1, 5).setValues([["Día", "Semana 1", "Semana 2", "Semana 3", "Semana 4"]]);
  for (let di = 0; di < 7; di++) {
    sim.getRange(266+di, 1).setValue(DIAS[di]);
    for (let si = 0; si < 4; si++) {
      sim.getRange(266+di, 2+si).setFormula(
        '=IFERROR(AVERAGEIFS('+sq+'!AA:AA,'+sq+'!C:C,"'+SEMANAS_SRC[si]+'",' +
        sq+'!D:D,"'+DIAS[di]+'",'+sq+'!AA:AA,">0"'+aiF+'),0)');
    }
  }
  sim.getRange(265, 1, 8, 5).setFontColor("#0E0E11");
}

// ═══════════════════════════════════════════════════════════════
//  SETUP: CHARTS
// ═══════════════════════════════════════════════════════════════
function setupDashboardCharts(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dash = ss.getSheetByName(sheetName || "WODForge_Dashboard");
  if (!dash) return;
  dash.getCharts().forEach(c => dash.removeChart(c));

  const charts = [
    dash.newChart().setChartType(Charts.ChartType.COMBO)
      .addRange(dash.getRange(250,1,5,3)).setNumHeaders(1).setPosition(13,2,0,0)
      .setOption('title','🔬 CORRELACIÓN: % Intensidad vs. Fatiga Percibida')
      .setOption('backgroundColor','#1A1A1A').setOption('titleTextStyle',{color:'#00FFFF',fontSize:11,bold:true})
      .setOption('legend',{textStyle:{color:'#FFFFFF'}}).setOption('hAxis',{textStyle:{color:'#FFFFFF'}})
      .setOption('vAxes',{0:{textStyle:{color:'#1F51FF'},title:'Intensidad (%)',titleTextStyle:{color:'#1F51FF'},minValue:0,maxValue:100},1:{textStyle:{color:'#FF007F'},title:'RPE',titleTextStyle:{color:'#FF007F'},minValue:0,maxValue:10}})
      .setOption('series',{0:{type:'bars',color:'#1F51FF',targetAxisIndex:0},1:{type:'line',color:'#FF007F',pointSize:6,targetAxisIndex:1}})
      .setOption('width',580).setOption('height',320).build(),

    dash.newChart().setChartType(Charts.ChartType.COMBO)
      .addRange(dash.getRange(265,1,5,3)).setNumHeaders(1).setPosition(13,10,0,0)
      .setOption('title','🏆 FUERZA MÁXIMA REAL (e1RM Back Squat vs 1RM)')
      .setOption('backgroundColor','#1A1A1A').setOption('titleTextStyle',{color:'#FFCC00',fontSize:11,bold:true})
      .setOption('legend',{textStyle:{color:'#FFFFFF'}}).setOption('hAxis',{textStyle:{color:'#FFFFFF'}}).setOption('vAxis',{textStyle:{color:'#FFFFFF'}})
      .setOption('series',{0:{type:'bars',color:'#39FF14',targetAxisIndex:0},1:{type:'line',color:'#FFD700',lineDashStyle:[4,4],targetAxisIndex:0}})
      .setOption('width',580).setOption('height',320).build(),

    dash.newChart().setChartType(Charts.ChartType.PIE)
      .addRange(dash.getRange(280,1,4,2)).setNumHeaders(1).setPosition(41,2,0,0)
      .setOption('title','🍕 DISTRIBUCIÓN DEL VOLUMEN POR VÍA ENERGÉTICA')
      .setOption('backgroundColor','#1A1A1A').setOption('titleTextStyle',{color:'#FFFFFF',fontSize:11,bold:true})
      .setOption('legend',{textStyle:{color:'#FFFFFF'}})
      .setOption('slices',{0:{color:'#1F51FF'},1:{color:'#FF007F'},2:{color:'#39FF14'}}).setOption('pieHole',0.4)
      .setOption('width',580).setOption('height',320).build(),

    dash.newChart().setChartType(Charts.ChartType.AREA)
      .addRange(dash.getRange(295,1,5,2)).setNumHeaders(1).setPosition(41,10,0,0)
      .setOption('title','⚡ NEURAL TRAINING STRAIN (Tensión Acumulada)')
      .setOption('backgroundColor','#1A1A1A').setOption('titleTextStyle',{color:'#8000FF',fontSize:11,bold:true})
      .setOption('legend',{position:'none'}).setOption('hAxis',{textStyle:{color:'#FFFFFF'}}).setOption('vAxis',{textStyle:{color:'#FFFFFF'}})
      .setOption('series',{0:{color:'#8000FF',areaOpacity:0.3}})
      .setOption('width',580).setOption('height',320).build(),

    dash.newChart().setChartType(Charts.ChartType.COMBO)
      .addRange(dash.getRange(310,1,5,3)).setNumHeaders(1).setPosition(69,2,0,0)
      .setOption('title','🔥 DENSIDAD DE CARGA: Kilos por Minuto')
      .setOption('backgroundColor','#1A1A1A').setOption('titleTextStyle',{color:'#FF8C00',fontSize:11,bold:true})
      .setOption('legend',{textStyle:{color:'#FFFFFF'}}).setOption('hAxis',{textStyle:{color:'#FFFFFF'}})
      .setOption('vAxes',{0:{textStyle:{color:'#FF8C00'},title:'Kg/Min',titleTextStyle:{color:'#FF8C00'}},1:{textStyle:{color:'#00FFFF'},title:'Min Totales',titleTextStyle:{color:'#00FFFF'}}})
      .setOption('series',{0:{type:'bars',color:'#FF8C00',targetAxisIndex:0},1:{type:'line',color:'#00FFFF',targetAxisIndex:1,pointSize:6}})
      .setOption('width',580).setOption('height',320).build(),

    dash.newChart().setChartType(Charts.ChartType.COMBO)
      .addRange(dash.getRange(325,1,5,3)).setNumHeaders(1).setPosition(69,10,0,0)
      .setOption('title','📈 SOBRECARGA: Volumen-Carga vs PRs')
      .setOption('backgroundColor','#1A1A1A').setOption('titleTextStyle',{color:'#FF00FF',fontSize:11,bold:true})
      .setOption('legend',{textStyle:{color:'#FFFFFF'}}).setOption('hAxis',{textStyle:{color:'#FFFFFF'}})
      .setOption('vAxes',{0:{textStyle:{color:'#1F51FF'},title:'Volumen-Carga',titleTextStyle:{color:'#1F51FF'}},1:{textStyle:{color:'#FFD700'},title:'PRs',titleTextStyle:{color:'#FFD700'}}})
      .setOption('series',{0:{type:'bars',color:'#1F51FF',targetAxisIndex:0},1:{type:'line',color:'#FFD700',targetAxisIndex:1,pointSize:8,lineWidth:3}})
      .setOption('width',580).setOption('height',320).build(),

    dash.newChart().setChartType(Charts.ChartType.COMBO)
      .addRange(dash.getRange(340,1,5,3)).setNumHeaders(1).setPosition(97,2,0,0)
      .setOption('title','📊 RECUPERACIÓN (RIR vs RPE)')
      .setOption('backgroundColor','#1A1A1A').setOption('titleTextStyle',{color:'#FFCC00',fontSize:11,bold:true})
      .setOption('legend',{textStyle:{color:'#FFFFFF'}}).setOption('hAxis',{textStyle:{color:'#FFFFFF'}})
      .setOption('vAxes',{0:{textStyle:{color:'#FF007F'},title:'RPE',titleTextStyle:{color:'#FF007F'},minValue:0,maxValue:10},1:{textStyle:{color:'#39FF14'},title:'RIR',titleTextStyle:{color:'#39FF14'},minValue:0,maxValue:5}})
      .setOption('series',{0:{type:'line',color:'#FF007F',targetAxisIndex:0,lineWidth:3},1:{type:'bars',color:'#39FF14',targetAxisIndex:1}})
      .setOption('width',580).setOption('height',320).build(),

    dash.newChart().setChartType(Charts.ChartType.COMBO)
      .addRange(dash.getRange(355,1,5,3)).setNumHeaders(1).setPosition(97,10,0,0)
      .setOption('title','⏳ METABOLISMO: Volumen vs Descansos')
      .setOption('backgroundColor','#1A1A1A').setOption('titleTextStyle',{color:'#00FFFF',fontSize:11,bold:true})
      .setOption('legend',{textStyle:{color:'#FFFFFF'}}).setOption('hAxis',{textStyle:{color:'#FFFFFF'}})
      .setOption('vAxes',{0:{textStyle:{color:'#1F51FF'},title:'Volumen-Carga',titleTextStyle:{color:'#1F51FF'}},1:{textStyle:{color:'#FFCC00'},title:'Descanso',titleTextStyle:{color:'#FFCC00'},minValue:0}})
      .setOption('series',{0:{type:'area',color:'#1F51FF',areaOpacity:0.2,targetAxisIndex:0},1:{type:'bars',color:'#FFCC00',targetAxisIndex:1}})
      .setOption('width',580).setOption('height',320).build()
  ];
  charts.forEach(c => dash.insertChart(c));
}

function setupSimetricoCharts(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sim = ss.getSheetByName(sheetName || "WODForge_Simetrico");
  if (!sim) return;
  sim.getCharts().forEach(c => sim.removeChart(c));

  [
    sim.newChart().setChartType(Charts.ChartType.COLUMN)
      .addRange(sim.getRange(250,1,8,5)).setNumHeaders(1).setPosition(12,2,0,0)
      .setOption('title','⚖️ VARIACIÓN SIMÉTRICA DEL VOLUMEN-CARGA')
      .setOption('backgroundColor','#1A1A1A').setOption('titleTextStyle',{color:'#FFD700',fontSize:11,bold:true})
      .setOption('legend',{textStyle:{color:'#FFFFFF'}}).setOption('hAxis',{textStyle:{color:'#FFFFFF'}}).setOption('vAxis',{textStyle:{color:'#FFFFFF'}})
      .setOption('series',{0:{color:'#1F51FF'},1:{color:'#39FF14'},2:{color:'#FFCC00'},3:{color:'#FF007F'}})
      .setOption('width',580).setOption('height',320).build(),

    sim.newChart().setChartType(Charts.ChartType.COLUMN)
      .addRange(sim.getRange(265,1,8,5)).setNumHeaders(1).setPosition(12,10,0,0)
      .setOption('title','🧠 RESPUESTA DEL SNC (RPE DIARIO)')
      .setOption('backgroundColor','#1A1A1A').setOption('titleTextStyle',{color:'#39FF14',fontSize:11,bold:true})
      .setOption('legend',{textStyle:{color:'#FFFFFF'}}).setOption('hAxis',{textStyle:{color:'#FFFFFF'}}).setOption('vAxis',{textStyle:{color:'#FFFFFF'},minValue:0,maxValue:10})
      .setOption('series',{0:{color:'#1F51FF'},1:{color:'#39FF14'},2:{color:'#FFCC00'},3:{color:'#FF007F'}})
      .setOption('width',580).setOption('height',320).build()
  ].forEach(c => sim.insertChart(c));
}

// ═══════════════════════════════════════════════════════════════
//  ONE-CLICK FULL SETUP
// ═══════════════════════════════════════════════════════════════
function setupAll() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let chapters = detectChapters(ss);
  if (chapters.length === 0) {
    const resp = ui.prompt("⚡ WODForge V82 Setup",
      "No se detectaron capítulos en columna A.\n" +
      "¿Cómo se llama el capítulo actual? (ej: Andariel, Duriel)",
      ui.ButtonSet.OK_CANCEL);
    if (resp.getSelectedButton() !== ui.Button.OK) return;
    const defaultCh = resp.getResponseText().trim() || "Andariel";
    setupCapitulos(defaultCh);
    chapters = [defaultCh];
  } else {
    setupCapitulos(chapters[0]);
  }

  const conf = ui.alert("⚡ WODForge V82",
    "Capítulos detectados: " + chapters.join(", ") + "\n\n" +
    "Esto va a:\n" +
    "1. Normalizar texto numérico (RPE/Kilos como texto → número)\n" +
    "2. Configurar columnas-fórmula (U-AD)\n" +
    "3. Crear Dashboard General + uno por capítulo\n" +
    "4. Crear Simétrico General + uno por capítulo\n" +
    "5. Generar gráficos\n\n" +
    "¿Continuar?", ui.ButtonSet.OK_CANCEL);
  if (conf !== ui.Button.OK) return;

  // 0a. Clean up old V80 helpers in column T (if present)
  const src = getSourceSheet(ss);
  if (src) {
    const t1 = String(src.getRange("T1").getValue()).trim().toLowerCase();
    if (t1 === "categoría" || t1 === "categoria" || t1 === "cat") {
      const lastR = Math.max(src.getLastRow(), 2);
      src.getRange(1, 20, lastR, 1).clearContent();
    }
  }

  // 0b. FIX #3: convertir texto numérico a número en origen
  normalizarDatosNumericos();

  // 1. Helper columns (chapter-agnostic)
  setupHelperColumns();

  // 2. All formulas first (dashboards + simetricos)
  setupDashboardFormulas(null);
  chapters.forEach(ch => setupDashboardFormulas(ch));
  setupSimetricoFormulas(null);
  chapters.forEach(ch => setupSimetricoFormulas(ch));

  // 3. Flush so formulas compute before charts read their cells
  SpreadsheetApp.flush();

  // 4. Now create all charts
  setupDashboardCharts("WODForge_Dashboard");
  chapters.forEach(ch => setupDashboardCharts("WODForge_" + ch));
  setupSimetricoCharts("WODForge_Simetrico");
  chapters.forEach(ch => setupSimetricoCharts("WODForge_Sim_" + ch));

  ui.alert("✅ WODForge V82 instalado.\n\n" +
    "Pestañas creadas:\n" +
    "· WODForge_Dashboard (General)\n" +
    chapters.map(c => "· WODForge_" + c).join("\n") + "\n" +
    "· WODForge_Simetrico (General)\n" +
    chapters.map(c => "· WODForge_Sim_" + c).join("\n") + "\n\n" +
    "Para agregar un nuevo capítulo:\n" +
    "1. Agregá filas abajo con Semana 1-4 de nuevo\n" +
    "2. Poné el nombre del capítulo en columna A\n" +
    "3. Corré ⚡ Setup Completo de nuevo\n\n" +
    "Los datos se auto-actualizan. Cambiar ejercicios no rompe nada.");
}

// ═══════════════════════════════════════════════════════════════
//  HELPER: KPI Block con fórmula
// ═══════════════════════════════════════════════════════════════
function inyectarKpiFormula(sheet, row, col, label, formula, color) {
  sheet.getRange(row, col, 1, 3).merge().setValue(label)
    .setBackground("#1A1A22").setFontColor("#A0A0A0").setFontWeight("bold").setFontSize(9).setHorizontalAlignment("center");
  sheet.getRange(row+1, col, 1, 3).merge().setFormula(formula)
    .setBackground("#1A1A22").setFontColor(color).setFontWeight("bold").setFontSize(16).setHorizontalAlignment("center");
  sheet.getRange(row, col, 2, 3).setBorder(true,true,true,true,false,false,"#3A3A4A",SpreadsheetApp.BorderStyle.SOLID);
}

// ═══════════════════════════════════════════════════════════════
//  PERFIL HELPERS
// ═══════════════════════════════════════════════════════════════
function recuperarPerfilExistente(ss) {
  const props = PropertiesService.getDocumentProperties();
  const dash = ss.getSheetByName("WODForge_Dashboard");
  let v = [];
  if (dash) { try { v = dash.getRange("B2:B10").getValues().map(r => extractNumber(r[0])); } catch(e) {} }
  const val = (i, pk, d) => (v[i]>0 ? v[i] : (extractNumber(props.getProperty(pk))||d));
  return {
    peso: val(0,'WODFORGE_PESO',90), altura: val(1,'WODFORGE_ALTURA',175),
    backSquat: val(2,'WODFORGE_BACKSQUAT',110), deadlift: val(3,'WODFORGE_DEADLIFT',140),
    frontSquat: val(4,'WODFORGE_FRONTSQUAT',95), cleanJerk: val(5,'WODFORGE_CLEANJERK',85),
    snatch: val(6,'WODFORGE_SNATCH',65), thruster: val(7,'WODFORGE_THRUSTER',60),
    strictPress: val(8,'WODFORGE_STRICTPRESS',55)
  };
}

function escribirYObtenerPerfil(sheet, perfil, isMain) {
  if (!sheet) return perfil;
  sheet.getRange("A1:B1").merge().setValue("⚙️ PERFIL DE RMs OLÍMPICOS")
    .setBackground("#FFCC00").setFontColor("#000000").setFontWeight("bold").setHorizontalAlignment("center");
  const labels = [
    ["Peso Corporal (Kg)", perfil.peso, "='WODForge_Dashboard'!B2"],
    ["Altura Corporal (Cm)", perfil.altura, "='WODForge_Dashboard'!B3"],
    ["1RM Back Squat (Kg)", perfil.backSquat, "='WODForge_Dashboard'!B4"],
    ["1RM Deadlift (Kg)", perfil.deadlift, "='WODForge_Dashboard'!B5"],
    ["1RM Front Squat (Kg)", perfil.frontSquat, "='WODForge_Dashboard'!B6"],
    ["1RM Clean & Jerk (Kg)", perfil.cleanJerk, "='WODForge_Dashboard'!B7"],
    ["1RM Snatch (Kg)", perfil.snatch, "='WODForge_Dashboard'!B8"],
    ["1RM Thruster (Kg)", perfil.thruster, "='WODForge_Dashboard'!B9"],
    ["1RM Strict Press (Kg)", perfil.strictPress, "='WODForge_Dashboard'!B10"]
  ];
  sheet.getRange("A2:A10").setValues(labels.map(l=>[l[0]])).setBackground("#121212").setFontColor("#A0A0A0").setFontWeight("bold");
  const rB = sheet.getRange("B2:B10");
  isMain ? rB.setValues(labels.map(l=>[l[1]])) : rB.setFormulas(labels.map(l=>[l[2]]));
  rB.setBackground("#1A1A1A").setFontColor("#39FF14").setFontWeight("bold").setHorizontalAlignment("center");
  sheet.getRange("A1:B10").setBorder(true,true,true,true,true,true,"#FFCC00",SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  perfil.sumRMs = perfil.backSquat+perfil.deadlift+perfil.frontSquat+perfil.cleanJerk+perfil.snatch+perfil.thruster+perfil.strictPress;
  return perfil;
}

function escribirBloquesExplicativos(dash) {
  const textos = [
    [12, 2, "📖 CÓMO LEER LA RELACIÓN INTENSIDAD vs FATIGA"],
    [12, 10, "📖 CÓMO LEER TU FUERZA MÁXIMA ESTIMADA (e1RM)"],
    [40, 2, "📖 CÓMO LEER LA DISTRIBUCIÓN DEL VOLUMEN"],
    [40, 10, "📖 CÓMO LEER EL NEURAL TRAINING STRAIN"],
    [68, 2, "📖 DENSIDAD DE CARGA: KILOS POR MINUTO"],
    [68, 10, "📖 VOLUMEN-CARGA SEMANAL VS. PRs ROTOS"],
    [96, 2, "📖 RPE PROMEDIO VS. RIR PROMEDIO"],
    [96, 10, "📖 VOLUMEN-CARGA VS. BLOQUES DE DESCANSO"]
  ];
  textos.forEach(([r, c, title]) => {
    dash.getRange(r, c, 1, 7).merge().setValue(title)
      .setBackground("#1A1A22").setFontColor("#FFCC00").setFontWeight("bold").setFontSize(9)
      .setWrap(true).setVerticalAlignment("top");
  });
}

// ═══════════════════════════════════════════════════════════════
//  EMBELLECER (KEPT)
// ═══════════════════════════════════════════════════════════════
function embellecerHojaResultados() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getSourceSheet(ss);
  if (!sheet) return;
  const maxR = sheet.getMaxRows(), maxC = sheet.getMaxColumns();
  sheet.clearConditionalFormatRules();
  sheet.getRange(1,1,maxR,maxC).setBackground("#0E0E11").setFontColor("#FFFFFF").setBorder(false,false,false,false,false,false);
  sheet.setFrozenRows(1); sheet.setFrozenColumns(5);

  const headers = ['Capítulo','Fecha','Semana','Día','Bloque','Ejercicio','Esquema','Intensidad (Kg)','Descanso','Rondas','Extra','Tiempo','Kilos','RPE','RIR','Modo','PR','Notas y Comentarios','⚠ Revisar'];
  const headerRange = sheet.getRange(1,1,1,19);
  headerRange.setValues([headers]).setFontWeight("bold").setHorizontalAlignment("center").setVerticalAlignment("middle").setWrap(true);
  sheet.setRowHeight(1,40);
  headerRange.setBackground("#0A0A0E").setFontColor("#FFFFFF");
  headerRange.setBorder(null,null,true,null,null,null,"#1F51FF",SpreadsheetApp.BorderStyle.SOLID_THICK);
  sheet.getRange(1,1).setFontColor("#FFD700");

  const dataRange = sheet.getRange(2,1,maxR-1,19);
  const colSemana = sheet.getRange(2,3,maxR-1,1);
  const colRpe = sheet.getRange(2,14,maxR-1,1);
  const rules = [];
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($C2="Semana 3",$D2="Sábado")').setBackground("#4A0000").setFontColor("#FFD700").setBold(true).setRanges([dataRange]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$C2="Semana 1"').setBackground("#1A000D").setFontColor("#FF007F").setRanges([colSemana]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$C2="Semana 2"').setBackground("#061A02").setFontColor("#39FF14").setRanges([colSemana]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$C2="Semana 3"').setBackground("#001A1A").setFontColor("#00F0FF").setRanges([colSemana]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$C2="Semana 4"').setBackground("#12001A").setFontColor("#BD00FF").setRanges([colSemana]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$N2>=9').setBackground("#3A0909").setFontColor("#EF4444").setBold(true).setRanges([colRpe]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$N2>=8').setBackground("#2E1402").setFontColor("#F97316").setBold(true).setRanges([colRpe]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=REGEXMATCH($E2,"(?i)fuerza|peak|heavy|strength")').setBackground("#1C0606").setFontColor("#EF4444").setRanges([dataRange]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=REGEXMATCH($E2,"(?i)warm|mov|core|prehab")').setBackground("#061C14").setFontColor("#34D399").setItalic(true).setRanges([dataRange]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=REGEXMATCH($E2,"(?i)metcon|cond|inter|emom")').setBackground("#02161A").setFontColor("#06B6D4").setRanges([dataRange]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=REGEXMATCH($E2,"(?i)acc|hyper|team|sync")').setBackground("#1C0D02").setFontColor("#F97316").setRanges([dataRange]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=REGEXMATCH($E2,"(?i)desc|rest|off")').setBackground("#120924").setFontColor("#A78BFA").setRanges([dataRange]).build());
  sheet.setConditionalFormatRules(rules);
  dataRange.setBorder(null,null,true,null,null,null,"#262626",SpreadsheetApp.BorderStyle.SOLID);
  SpreadsheetApp.getUi().alert("🎨 ¡Estética Brutalista L4 Inyectada!");
}

// ═══════════════════════════════════════════════════════════════
//  AUTO-LOAD (KEPT)
// ═══════════════════════════════════════════════════════════════
function calcularKilosPautados() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getSourceSheet(ss);
  if (!sheet) return;
  const rawData = sheet.getDataRange().getDisplayValues();
  const perfil = recuperarPerfilExistente(ss);
  let celdasActualizadas = 0;
  for (let i = 1; i < rawData.length; i++) {
    const ejeStr = String(rawData[i][COLS.EJERCICIO]).toLowerCase();
    const esqStr = String(rawData[i][COLS.ESQUEMA]);
    const currentInt = String(rawData[i][COLS.INTENSIDAD]).trim();
    const currentDesc = String(rawData[i][COLS.DESCANSO]).trim();
    const pctMatch = esqStr.match(/(\d{1,3})(?:\s*-\s*(\d{1,3}))?\s*%/);
    if (pctMatch) {
      const minPct = parseFloat(pctMatch[1]);
      const maxPct = pctMatch[2] ? parseFloat(pctMatch[2]) : null;
      let rm = 0;
      if (ejeStr.includes("back squat")) rm = perfil.backSquat;
      else if (ejeStr.includes("front squat")) rm = perfil.frontSquat;
      else if (ejeStr.includes("deadlift")) rm = perfil.deadlift;
      else if (ejeStr.includes("clean & jerk") || ejeStr.includes("clean and jerk")) rm = perfil.cleanJerk;
      else if (ejeStr.includes("snatch")) rm = perfil.snatch;
      else if (ejeStr.includes("thruster")) rm = perfil.thruster;
      else if (ejeStr.includes("strict press") || ejeStr.includes("shoulder press")) rm = perfil.strictPress;
      else if (ejeStr.includes("clean") && !ejeStr.includes("jerk")) rm = perfil.cleanJerk;
      if (rm > 0) {
        let finalKg = (rm * minPct) / 100;
        if (maxPct) finalKg = (finalKg + (rm * maxPct) / 100) / 2;
        const nuevo = Math.round(finalKg);
        if (currentInt !== String(nuevo)) { sheet.getRange(i+1, COLS.INTENSIDAD+1).setValue(nuevo); celdasActualizadas++; }
      }
    }
    const sec = descansoSegundos(esqStr);
    if (sec > 0 && currentDesc !== String(sec)) { sheet.getRange(i+1, COLS.DESCANSO+1).setValue(sec); celdasActualizadas++; }
  }
  SpreadsheetApp.getUi().alert(celdasActualizadas > 0
    ? '🎯 Auto-Load completado.\n\n'+celdasActualizadas+' celdas inyectadas.'
    : '🎯 Auto-Load verificado.\n\nTodos los datos ya estaban al día.');
}

// ═══════════════════════════════════════════════════════════════
//  CORONAR PRs (KEPT)
// ═══════════════════════════════════════════════════════════════
function coronarPRs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getSourceSheet(ss);
  if (!sheet) return;
  const rawData = sheet.getDataRange().getDisplayValues();
  const best = {}; const filasPR = []; let total = 0;
  for (let i = 1; i < rawData.length; i++) {
    const sd = resolverSemanaDia(rawData[i]);
    if (!sd.sem || !sd.dia) continue;
    const blo = String(rawData[i][COLS.BLOQUE]).toLowerCase();
    if (!/fuerza|strength|peak/.test(blo)) continue;
    const eje = String(rawData[i][COLS.EJERCICIO]);
    const kg = extractNumber(rawData[i][COLS.KG]);
    const rpe = extractNumber(rawData[i][COLS.RPE]);
    const rir = extractNumber(rawData[i][COLS.RIR]);
    if ((rpe||0) <= 0 && (rir||0) <= 0) continue;
    const sr = parsearSeriesReps(String(rawData[i][COLS.ESQUEMA]));
    const repsSet = sr ? sr.reps : 0;
    if (kg <= 0 || repsSet <= 0) continue;
    const e1 = estimar1RM(kg * multiplicadorImplemento(eje), repsSet, rpe, rir);
    if (e1 <= 0) continue;
    const chap = String(rawData[i][COLS.CAPITULO]).trim();
    const key = (chap ? chap + ":" : "") + nombreMovimiento(eje);
    if (best[key] === undefined) { best[key] = e1; }
    else if (e1 > best[key] + 0.01) { best[key] = e1; filasPR.push(i); total++; }
  }
  filasPR.forEach(i => {
    sheet.getRange(i+1, COLS.PR+1).setValue("🏆 PR").setFontColor("#FFD700").setFontWeight("bold");
  });
  SpreadsheetApp.getUi().alert("🏆 " + total + " PRs reales detectados y coronados.");
}

// ═══════════════════════════════════════════════════════════════
//  RPG SIDEBAR (KEPT — reads raw data, chapter-agnostic)
// ═══════════════════════════════════════════════════════════════
function mostrarSidebarConfiguracion() {
  const html = HtmlService.createHtmlOutput(getSidebarHtml())
    .setTitle('WODForge 🛡️ Character Control').setWidth(300);
  SpreadsheetApp.getUi().showSidebar(html);
}

function obtenerConfiguracionInicial() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets().map(s => s.getName());
  const props = PropertiesService.getDocumentProperties();
  const currentSheet = props.getProperty('WODFORGE_SOURCE_SHEET') || "";
  const perfil = recuperarPerfilExistente(ss);
  const rpg = { str: 0, con: 0, dex: 0, vit: 0, pot: 0 };
  const sourceSheet = getSourceSheet(ss);
  if (sourceSheet) {
    const rawData = sourceSheet.getDataRange().getDisplayValues();
    const cargaDiaria = {}, sesionWOD = {};
    const engineSemana = {};
    const blocksTracker = {};
    for (let i = 1; i < rawData.length; i++) {
      const sd = resolverSemanaDia(rawData[i]);
      if (!sd.sem || !sd.dia) continue;
      const idDia = sd.sem+"_"+sd.dia;
      const blo = String(rawData[i][COLS.BLOQUE]).toLowerCase().trim();
      const ejeL = String(rawData[i][COLS.EJERCICIO]).toLowerCase();
      const esq = String(rawData[i][COLS.ESQUEMA]);
      const rpe = extractNumber(rawData[i][COLS.RPE]);
      const mins = parsearMinutos(rawData[i][COLS.TIEMPO]) || minutosEstimados(esq);
      const bKey = idDia+"_"+blo;
      if (!blocksTracker[bKey]) blocksTracker[bKey] = { mins:0, rpe:0, esAcond:false, esZona2:false, tieneCardio:false, reps:0 };
      if (mins > blocksTracker[bKey].mins) blocksTracker[bKey].mins = mins;
      if (rpe > blocksTracker[bKey].rpe) blocksTracker[bKey].rpe = rpe;
      const esAcond = /metcon|boss|wod|sprint|chipper|team|amrap|emom|couplet|for time|por tiempo/i.test(blo+" "+ejeL);
      const esZona2 = /zona 2|cardio continuo|flush|regenerativo/.test(blo+" "+ejeL);
      if (esAcond) blocksTracker[bKey].esAcond = true;
      if (esZona2) blocksTracker[bKey].esZona2 = true;
      if (/remo|bike|ski|soga|run|correr/.test(ejeL)) blocksTracker[bKey].tieneCardio = true;
      if (esAcond && !esZona2) {
        const rondas = extractNumber(rawData[i][COLS.VOLUMEN]);
        const repsExtra = extractNumber(rawData[i][COLS.REPS_EX]);
        blocksTracker[bKey].reps += contarReps(String(rawData[i][COLS.EJERCICIO]), esq, rondas, repsExtra);
      }
    }
    Object.keys(blocksTracker).forEach(bKey => {
      const b = blocksTracker[bKey];
      const parts = bKey.split("_");
      const idDia = parts[0]+"_"+parts[1], semKey = parts[0];
      if (b.mins > 0 || b.rpe > 0) cargaDiaria[idDia] = (cargaDiaria[idDia]||0) + b.mins*(b.rpe||7);
      if (b.esAcond && !b.esZona2) {
        if (!sesionWOD[idDia]) sesionWOD[idDia] = { reps:0, min:0 };
        sesionWOD[idDia].reps += b.reps;
        sesionWOD[idDia].min += b.mins;
      }
      if (b.esAcond || b.esZona2 || b.tieneCardio) {
        if (!engineSemana[semKey]) engineSemana[semKey] = 0;
        engineSemana[semKey] += b.mins;
      }
    });
    const weight = parseFloat(perfil.peso||90);
    const sumRMs = perfil.backSquat+perfil.deadlift+perfil.frontSquat+perfil.cleanJerk+perfil.snatch+perfil.thruster+perfil.strictPress;
    rpg.str = Math.min(100, Math.round(((sumRMs/weight)/RPG_CAL.STR_DIVISOR)*100));
    rpg.pot = Math.min(100, Math.round((((perfil.snatch+perfil.cleanJerk)/weight)/RPG_CAL.POT_DIVISOR)*100));
    const cargas = Object.values(cargaDiaria).filter(c=>c>0);
    rpg.con = Math.min(100, Math.round((cargas.length ? cargas.reduce((a,b)=>a+b,0)/cargas.length : 0)/RPG_CAL.CON_DIVISOR*100)) || (cargas.length?15:0);
    const paces = Object.values(sesionWOD).filter(s=>s.reps>0&&s.min>0).map(s=>s.reps/s.min);
    rpg.dex = Math.min(100, Math.round((paces.length ? paces.reduce((a,b)=>a+b,0)/paces.length : 0)/RPG_CAL.DEX_REF_PACE*100)) || (paces.length?15:0);
    const eMins = Object.values(engineSemana).filter(m=>m>0);
    rpg.vit = Math.min(100, Math.round((eMins.length ? eMins.reduce((a,b)=>a+b,0)/eMins.length : 0)/RPG_CAL.VIT_DIVISOR*100)) || (eMins.length>0?15:0);
  }
  return { sheets, currentSheet, perfil, rpg };
}

function parsearMinutos(valor) {
  const s = String(valor).trim();
  if (s === "") return 0;
  if (s.indexOf(":") !== -1) {
    const p = s.split(":").map(x => parseFloat(x)||0);
    let mins;
    if (p.length === 3) mins = p[0]*60+p[1]+p[2]/60;
    else if (p.length === 2) mins = p[0]+p[1]/60;  // mm:ss (¡no h:mm!)
    else mins = p[0];
    return mins >= 180 ? mins/60 : mins;
  }
  return extractNumber(s);
}
function minutosEstimados(esquema) {
  const s = String(esquema).toUpperCase();
  let m = s.match(/AMRAP\s*(\d+)/); if (m) return parseInt(m[1]);
  m = s.match(/EMOM\s*(\d+)/); if (m) return parseInt(m[1]);
  const iv = s.match(/(\d+)\s*['′"]?\s*(?:MIN|M)?\s*ON\s*\/\s*(\d+)\s*['′"]?\s*(?:MIN|M)?\s*OFF/);
  if (iv) { const r = parseInt((s.match(/(\d+)\s*RONDAS/)||[])[1]||"4",10); return r*(parseInt(iv[1])+parseInt(iv[2])); }
  m = s.match(/CAP[:\s]*?(\d+)/); if (m) return parseInt(m[1]);
  m = s.match(/(\d+)\s*MIN/); if (m) return parseInt(m[1]);
  return 0;
}
function contarReps(ejercicio, esquema, rondas, repsExtra) {
  let base = 0;
  const chip = String(esquema).match(/\d+(?:\s*-\s*\d+){2,}/);
  if (chip) { base = (chip[0].match(/\d+/g)||[]).reduce((a,n)=>a+parseInt(n),0); }
  else {
    const sr = parsearSeriesReps(esquema);
    if (sr) base = sr.series*sr.reps;
    else { base = (parsearReps(ejercicio)||repsDeEsquema(esquema))*(rondas>0?rondas:(rondasDeEsquema(esquema)||1)); }
  }
  if (!/\d+\s*\/\s*\d+/.test(ejercicio) && /por pierna|por lado|cada lado|cada pierna/i.test(ejercicio+" "+esquema)) base *= 2;
  return base + (repsExtra||0);
}
function parsearReps(t) { const m = String(t).match(/^\s*(\d+)/); return m ? parseInt(m[1]) : 0; }
function repsDeEsquema(e) { const m = String(e).match(/(?:-\s*)?(\d+)\s*reps/i) || String(e).match(/acumular\s*(\d+)/i); return m ? parseInt(m[1]) : 0; }
function rondasDeEsquema(e) { const m = String(e).match(/(\d+)\s*(rondas|series|vueltas)/i); return m ? parseInt(m[1]) : 0; }

function guardarHojaOrigen(sheetName) {
  const props = PropertiesService.getDocumentProperties();
  sheetName === "" ? props.deleteProperty('WODFORGE_SOURCE_SHEET') : props.setProperty('WODFORGE_SOURCE_SHEET', sheetName);
}
function guardarPerfilDesdeSidebar(p) {
  const pv = val => (val===""||val==null||isNaN(parseFloat(val))) ? "" : parseFloat(val);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dash = ss.getSheetByName("WODForge_Dashboard");
  if (dash) {
    dash.getRange("B2:B10").setValues([[pv(p.peso)],[pv(p.altura)],[pv(p.backSquat)],[pv(p.deadlift)],
      [pv(p.frontSquat)],[pv(p.cleanJerk)],[pv(p.snatch)],[pv(p.thruster)],[pv(p.strictPress)]]);
  }
  const props = PropertiesService.getDocumentProperties();
  Object.keys(p).forEach(k => props.setProperty('WODFORGE_'+k.toUpperCase(), p[k]||""));
}

function getSidebarHtml() {
  return [
    '<!DOCTYPE html><html><head><base target="_top">',
    '<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>',
    '<style>',
    'body{background:#0E0E11;color:#FFF;font-family:Arial,sans-serif;padding:12px;margin:0}',
    '.tab-header{display:flex;border-bottom:2px solid #3A3A4A;margin-bottom:15px}',
    '.tab-btn{flex:1;background:none;border:none;color:#A0A0A0;padding:10px 5px;cursor:pointer;font-weight:bold;font-size:11px;text-transform:uppercase;text-align:center}',
    '.tab-btn.active{color:#FFCC00;border-bottom:2px solid #FFCC00;margin-bottom:-2px}',
    '.tab-content{display:none}.tab-content.active{display:block}',
    'h3{color:#FFCC00;font-size:13px;margin-top:0;text-transform:uppercase;border-bottom:1px solid #3A3A4A;padding-bottom:5px}',
    'p{font-size:10px;color:#A0A0A0;line-height:1.4;margin-bottom:15px}',
    '.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:15px}',
    '.form-group{display:flex;flex-direction:column}.form-group-full{grid-column:span 2;display:flex;flex-direction:column}',
    'label{font-size:10px;color:#39FF14;font-weight:bold;margin-bottom:3px;text-transform:uppercase}',
    'input,select{background:#1A1A22;color:#FFF;border:1px solid #3A3A4A;padding:6px;border-radius:4px;font-size:11px;box-sizing:border-box}',
    'input:focus,select:focus{border-color:#39FF14;outline:none}',
    'button.action-btn{background:#39FF14;color:#000;border:none;padding:10px 12px;font-weight:bold;border-radius:4px;cursor:pointer;font-size:11px;text-transform:uppercase;width:100%;margin-top:10px}',
    'button.action-btn:hover{background:#2ECC71}',
    '.status{font-size:11px;color:#39FF14;text-align:center;margin-top:10px;font-weight:bold}',
    '.rank-banner{text-align:center;font-size:13px;font-weight:bold;margin-bottom:15px;text-transform:uppercase;letter-spacing:1px}',
    '.chart-container{width:100%;height:220px;margin:0 auto}',
    '.rpg-rules p{margin-bottom:8px;font-size:10px}.rpg-rules b{color:#FFF}',
    '</style></head><body>',
    '<div class="tab-header">',
    '  <button class="tab-btn active" id="btn-perfil">🛡️ Héroe</button>',
    '  <button class="tab-btn" id="btn-sistema">⚙️ Sistema</button>',
    '  <button class="tab-btn" id="btn-rpg">🎮 RPG Info</button>',
    '</div>',
    '<div id="perfilTab" class="tab-content active">',
    '  <h3>🛡️ Perfil del Héroe</h3><p>Ajusta tus RMs base.</p>',
    '  <div class="form-grid">',
    '    <div class="form-group"><label>Peso (Kg):</label><input type="number" step="0.1" id="p_peso"></div>',
    '    <div class="form-group"><label>Altura (Cm):</label><input type="number" id="p_altura"></div>',
    '    <div class="form-group"><label>Back Squat:</label><input type="number" id="p_bs"></div>',
    '    <div class="form-group"><label>Deadlift:</label><input type="number" id="p_dl"></div>',
    '    <div class="form-group"><label>Front Squat:</label><input type="number" id="p_fs"></div>',
    '    <div class="form-group"><label>Clean & Jerk:</label><input type="number" id="p_cj"></div>',
    '    <div class="form-group"><label>Snatch:</label><input type="number" id="p_sn"></div>',
    '    <div class="form-group"><label>Thruster:</label><input type="number" id="p_th"></div>',
    '    <div class="form-group-full"><label>Strict Press:</label><input type="number" id="p_sp"></div>',
    '  </div>',
    '  <button class="action-btn" id="btn-guardar-perfil">Guardar Estadísticas</button>',
    '</div>',
    '<div id="sistemaTab" class="tab-content">',
    '  <h3>⚙️ Sistema</h3><p>Especifica tu pestaña activa actual.</p>',
    '  <div class="form-group-full" style="margin-bottom:15px"><label for="sheetSelect">Pestaña de Origen:</label><select id="sheetSelect"><option value="">Cargando...</option></select></div>',
    '  <button class="action-btn" id="btn-guardar-sistema">Guardar Ajustes</button>',
    '</div>',
    '<div id="gameTab" class="tab-content">',
    '  <h3>🎮 Radar de Atributos</h3>',
    '  <div id="rpgRank" class="rank-banner">Calculando...</div>',
    '  <div class="chart-container"><canvas id="rpgChart"></canvas></div>',
    '  <div class="rpg-rules" style="margin-top:10px">',
    '    <p>■ <b style="color:#FF3366">STR:</b> <span style="color:#A0A0A0">Suma RMs / Peso.</span></p>',
    '    <p>■ <b style="color:#33CCFF">POT:</b> <span style="color:#A0A0A0">(Snatch+C&J) / Peso.</span></p>',
    '    <p>■ <b style="color:#FFCC00">CON:</b> <span style="color:#A0A0A0">sRPE Foster promedio.</span></p>',
    '    <p>■ <b style="color:#39FF14">DEX:</b> <span style="color:#A0A0A0">Reps/min en metcon.</span></p>',
    '    <p>■ <b style="color:#FF6600">VIT:</b> <span style="color:#A0A0A0">Min bajo tensión metabólica.</span></p>',
    '  </div>',
    '</div>',
    '<div id="statusMsg" class="status"></div>',
    '<script>',
    'let myChart=null,globalScores=[0,0,0,0,0],globalColor="#FFF",chartRendered=false;',
    'window.onload=function(){',
    '  document.getElementById("statusMsg").innerText="Calculando...";',
    '  google.script.run.withSuccessHandler(cargarDatos).obtenerConfiguracionInicial();',
    '  document.getElementById("btn-perfil").addEventListener("click",()=>tab("perfilTab","btn-perfil"));',
    '  document.getElementById("btn-sistema").addEventListener("click",()=>tab("sistemaTab","btn-sistema"));',
    '  document.getElementById("btn-rpg").addEventListener("click",()=>tab("gameTab","btn-rpg"));',
    '  document.getElementById("btn-guardar-perfil").addEventListener("click",guardarPerfil);',
    '  document.getElementById("btn-guardar-sistema").addEventListener("click",guardarSistema);',
    '};',
    'function tab(t,b){document.querySelectorAll(".tab-content").forEach(e=>e.style.display="none");document.querySelectorAll(".tab-btn").forEach(e=>e.classList.remove("active"));document.getElementById(t).style.display="block";document.getElementById(b).classList.add("active");if(t==="gameTab"&&!chartRendered){renderChart(globalScores,globalColor);chartRendered=true;}}',
    'function cargarDatos(d){document.getElementById("statusMsg").innerText="";var sel=document.getElementById("sheetSelect");sel.innerHTML=\'<option value="">🤖 Auto-Detectar</option>\';d.sheets.forEach(function(n){sel.add(new Option(n,n,false,n===d.currentSheet))});var p=d.perfil;document.getElementById("p_peso").value=p.peso;document.getElementById("p_altura").value=p.altura;document.getElementById("p_bs").value=p.backSquat;document.getElementById("p_dl").value=p.deadlift;document.getElementById("p_fs").value=p.frontSquat;document.getElementById("p_cj").value=p.cleanJerk;document.getElementById("p_sn").value=p.snatch;document.getElementById("p_th").value=p.thruster;document.getElementById("p_sp").value=p.strictPress;var r=d.rpg;globalScores=[r.str,r.con,r.dex,r.vit,r.pot];var avg=(r.str+r.con+r.dex+r.vit+r.pot)/5;var rn="🛡️ Recluta Novato",rc="#A0A0A0";if(avg>=90){rn="👑 Leyenda Inmortal";rc="#FF007F"}else if(avg>=75){rn="🥇 Señor de la Guerra";rc="#FFD700"}else if(avg>=60){rn="🥈 Campeón de Plata";rc="#00FFFF"}else if(avg>=45){rn="⚔️ Guerrero de Hierro";rc="#CCC"}else if(avg>=30){rn="🥉 Escudero de Bronce";rc="#CD7F32"}globalColor=rc;var el=document.getElementById("rpgRank");el.innerText=rn;el.style.color=rc;if(chartRendered)renderChart(globalScores,globalColor);}',
    'function renderChart(s,c){try{var ctx=document.getElementById("rpgChart").getContext("2d");if(myChart){myChart.data.datasets[0].data=s;myChart.data.datasets[0].borderColor=c;myChart.data.datasets[0].backgroundColor=c+"33";myChart.data.datasets[0].pointBackgroundColor=c;myChart.update();return;}myChart=new Chart(ctx,{type:"radar",data:{labels:["STR","CON","DEX","VIT","POT"],datasets:[{data:s,backgroundColor:c+"33",borderColor:c,borderWidth:2,pointBackgroundColor:c,pointBorderColor:"#FFF",pointHoverBackgroundColor:"#FFF",pointHoverBorderColor:c}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{r:{angleLines:{color:"#3A3A4A"},grid:{color:"#3A3A4A"},pointLabels:{color:"#E0E0E0",font:{size:9,weight:"bold"}},ticks:{display:false,stepSize:20},suggestedMin:0,suggestedMax:100}}}});}catch(e){}}',
    'function guardarPerfil(){var p={peso:document.getElementById("p_peso").value,altura:document.getElementById("p_altura").value,backSquat:document.getElementById("p_bs").value,deadlift:document.getElementById("p_dl").value,frontSquat:document.getElementById("p_fs").value,cleanJerk:document.getElementById("p_cj").value,snatch:document.getElementById("p_sn").value,thruster:document.getElementById("p_th").value,strictPress:document.getElementById("p_sp").value};msg("Guardando...","#FFCC00");google.script.run.withSuccessHandler(function(){msg("🛡️ Guardado!","#39FF14");google.script.run.withSuccessHandler(cargarDatos).obtenerConfiguracionInicial()}).guardarPerfilDesdeSidebar(p);}',
    'function guardarSistema(){msg("Guardando...","#FFCC00");google.script.run.withSuccessHandler(function(){msg("⚙️ Guardado!","#39FF14")}).guardarHojaOrigen(document.getElementById("sheetSelect").value);}',
    'function msg(t,c){var e=document.getElementById("statusMsg");e.innerText=t;e.style.color=c;setTimeout(function(){e.innerText=""},3000);}',
    '</script></body></html>'
  ].join('\n');
}

// ═══════════════════════════════════════════════════════════════
//  CSV IMPORT (KEPT)
// ═══════════════════════════════════════════════════════════════
function importarCSVDesdeApp() {
  const html = HtmlService.createHtmlOutput([
    '<!DOCTYPE html><html><head><base target="_top"><style>',
    'body{background:#0E0E11;color:#fff;font-family:Arial,sans-serif;padding:18px;margin:0}',
    'h2{color:#00F0FF;font-size:15px;margin:0 0 10px}p{color:#A0A0A0;font-size:11px;margin:0 0 12px;line-height:1.5}',
    'textarea{width:100%;height:190px;background:#1A1A22;color:#39FF14;border:1px solid #3A3A4A;border-radius:4px;padding:10px;font-family:monospace;font-size:11px;box-sizing:border-box;resize:vertical}',
    'textarea:focus{border-color:#00F0FF;outline:none}',
    '.btn{background:#00F0FF;color:#000;border:none;padding:11px;font-weight:bold;border-radius:4px;cursor:pointer;font-size:12px;width:100%;margin-top:12px;text-transform:uppercase}',
    '.btn:hover{background:#00D4E0}.btn:disabled{opacity:.5;cursor:not-allowed}',
    '.filebtn{display:block;background:#39FF14;color:#000;text-align:center;padding:12px;font-weight:bold;border-radius:4px;cursor:pointer;font-size:13px;margin-bottom:10px;text-transform:uppercase}',
    '.filebtn:hover{background:#2ECC71}.divider{text-align:center;color:#555;font-size:10px;margin:10px 0;text-transform:uppercase;letter-spacing:2px}',
    '.status{margin-top:12px;font-size:12px;text-align:center;font-weight:bold;min-height:18px;white-space:pre-line}',
    '</style></head><body>',
    '<h2>📥 Importar CSV</h2>',
    '<label class="filebtn" for="file">📁 Seleccionar archivo CSV</label>',
    '<input type="file" id="file" accept=".csv,text/csv,text/plain" style="display:none" onchange="loadFile(this)">',
    '<div class="divider">— o pegá el texto manualmente —</div>',
    '<textarea id="csv" placeholder="Semana,Día,Bloque,Ejercicio,..."></textarea>',
    '<button class="btn" id="btn" onclick="run()">⚡ Importar</button>',
    '<div class="status" id="st"></div>',
    '<script>',
    'function loadFile(i){var f=i.files[0];if(!f)return;var r=new FileReader();r.onload=function(e){document.getElementById("csv").value=e.target.result;msg("📄 "+f.name+" cargado.","#FFCC00");run()};r.readAsText(f)}',
    'function run(){var csv=document.getElementById("csv").value.trim();if(!csv){msg("❌ Pegá el CSV.","#FF4444");return}document.getElementById("btn").disabled=true;msg("⏳ Procesando...","#FFCC00");google.script.run.withSuccessHandler(function(r){msg(r,"#39FF14");document.getElementById("btn").disabled=false}).withFailureHandler(function(e){msg("❌ "+e.message,"#FF4444");document.getElementById("btn").disabled=false}).procesarCSVApp(csv)}',
    'function msg(t,c){var e=document.getElementById("st");e.innerText=t;e.style.color=c}',
    '</script></body></html>'
  ].join('\n')).setWidth(460).setHeight(480);
  SpreadsheetApp.getUi().showModalDialog(html, '📥 Importar CSV');
}

function procesarCSVApp(csvText) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getSourceSheet(ss);
  if (!sheet) throw new Error("No se encontró la hoja de resultados.");
  csvText = String(csvText).replace(/^﻿/, '');
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) throw new Error("CSV vacío o sin datos.");
  const sample = lines.slice(0, Math.min(5, lines.length)).join('\n');
  const tabs = (sample.match(/\t/g)||[]).length;
  const commas = (sample.match(/,/g)||[]).length;
  const semis = (sample.match(/;/g)||[]).length;
  let DELIM = ',';
  if (tabs >= commas && tabs >= semis && tabs > 0) DELIM = '\t';
  else if (semis > commas && semis > 0) DELIM = ';';
  const parseCSVLine = function(line) {
    const out = []; let cur = '', q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (q) { if (c==='"'&&line[i+1]==='"'){cur+='"';i++} else if(c==='"'){q=false} else{cur+=c} }
      else { if(c==='"'){q=true} else if(c===DELIM){out.push(cur.trim());cur=''} else{cur+=c} }
    }
    out.push(cur.trim()); return out;
  };
  const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
  const lastRow = sheet.getLastRow();
  const lastCol = Math.max(sheet.getLastColumn(), COLS.RIR+1);
  const sheetData = lastRow > 1 ? sheet.getRange(2,1,lastRow-1,lastCol).getDisplayValues() : [];
  const headerValid = /semana|ejercicio/i.test(lines[0]);
  const col = {capitulo:-1,semana:-1,dia:-1,bloque:-1,ejercicio:-1,kilos:-1,reps:-1,rondas:-1,repsExtra:-1,tiempo:-1,rpe:-1,rir:-1,fecha:-1};
  let dataLines;
  if (headerValid) {
    const headers = parseCSVLine(lines[0]).map(norm);
    headers.forEach((h,i) => {
      if (/^capitulo/.test(h)) col.capitulo=i;
      else if (/^semana/.test(h)) col.semana=i;
      else if (/^dia$/.test(h)) col.dia=i;
      else if (/^bloque/.test(h)) col.bloque=i;
      else if (/^ejercicio/.test(h)) col.ejercicio=i;
      else if (/reps\s*extra|repsextra/.test(h)) col.repsExtra=i;
      else if (/^kilos|^kg|^peso/.test(h)) col.kilos=i;
      else if (/^reps/.test(h)) col.reps=i;
      else if (/^rondas/.test(h)) col.rondas=i;
      else if (/^tiempo/.test(h)) col.tiempo=i;
      else if (/^rpe/.test(h)) col.rpe=i;
      else if (/^rir/.test(h)) col.rir=i;
      else if (/^fecha/.test(h)) col.fecha=i;
    });
    dataLines = lines.slice(1);
  } else {
    col.capitulo=0;col.semana=1;col.dia=2;col.bloque=3;col.ejercicio=4;col.kilos=6;col.reps=7;col.rondas=8;
    col.repsExtra=9;col.tiempo=10;col.rpe=11;col.rir=12;col.fecha=13;
    dataLines = lines;
  }
  if (col.semana<0||col.dia<0||col.ejercicio<0) throw new Error("No se reconocieron las columnas.");
  const at = (f,idx) => idx>=0&&idx<f.length ? f[idx] : '';
  const grupos = {};
  dataLines.forEach(line => {
    const f = parseCSVLine(line);
    const semana=at(f,col.semana), dia=at(f,col.dia), ejercicio=at(f,col.ejercicio);
    if (!semana||!dia||!ejercicio) return;
    const key = norm(semana)+'||'+norm(dia)+'||'+norm(ejercicio);
    if (!grupos[key]) grupos[key] = {capitulo:at(f,col.capitulo),semana,dia,ejercicio,bloque:at(f,col.bloque),kilos:[],rondas:[],repsExtra:[],tiempos:[],rpe:[],rir:[],fecha:at(f,col.fecha)};
    const kg=parseFloat(at(f,col.kilos))||0, rondas=parseFloat(at(f,col.rondas))||0;
    const re=parseFloat(at(f,col.repsExtra))||0, tiempo=String(at(f,col.tiempo)||'').trim();
    const rpe=parseFloat(at(f,col.rpe))||0, rir=parseFloat(at(f,col.rir))||0;
    if(kg>0)grupos[key].kilos.push(kg); if(rondas>0)grupos[key].rondas.push(rondas);
    if(re>0)grupos[key].repsExtra.push(re); if(tiempo)grupos[key].tiempos.push(tiempo);
    if(rpe>0)grupos[key].rpe.push(rpe); if(rir>0)grupos[key].rir.push(rir);
  });
  if (!Object.keys(grupos).length) throw new Error("No se encontraron registros válidos.");
  let updated = 0, added = 0;
  Object.keys(grupos).forEach(key => {
    const g = grupos[key];
    const maxKg = g.kilos.length ? Math.max(...g.kilos) : 0;
    const maxRn = g.rondas.length ? Math.max(...g.rondas) : 0;
    const maxRe = g.repsExtra.length ? Math.max(...g.repsExtra) : 0;
    const tiempo = g.tiempos.length ? g.tiempos[g.tiempos.length-1] : '';
    const avgRpe = g.rpe.length ? g.rpe.reduce((a,b)=>a+b,0)/g.rpe.length : 0;
    const avgRir = g.rir.length ? g.rir.reduce((a,b)=>a+b,0)/g.rir.length : 0;
    const ns = norm(g.semana), nd = norm(g.dia), ne = norm(g.ejercicio);
    let matchRow = -1;
    for (let i = 0; i < sheetData.length; i++) {
      const rs=norm(sheetData[i][COLS.SEMANA]), rd=norm(sheetData[i][COLS.DIA]), re=norm(sheetData[i][COLS.EJERCICIO]);
      const semOk = rs.includes(ns.replace('semana ','')) || ns.includes(rs.replace('semana ',''));
      const diaOk = rd === nd;
      const ejeOk = re.includes(ne) || ne.includes(re) || ne.split(' ').every(w => w.length<3 || re.includes(w));
      if (semOk && diaOk && ejeOk) { matchRow = i; break; }
    }
    if (matchRow >= 0) {
      const sr = matchRow + 2;
      if(maxKg>0) sheet.getRange(sr,COLS.KG+1).setValue(maxKg);
      if(maxRn>0) sheet.getRange(sr,COLS.VOLUMEN+1).setValue(maxRn);
      if(maxRe>0) sheet.getRange(sr,COLS.REPS_EX+1).setValue(maxRe);
      if(tiempo) sheet.getRange(sr,COLS.TIEMPO+1).setValue(tiempo);
      if(avgRpe>0) sheet.getRange(sr,COLS.RPE+1).setValue(parseFloat(avgRpe.toFixed(1)));
      if(avgRir>0) sheet.getRange(sr,COLS.RIR+1).setValue(parseFloat(avgRir.toFixed(1)));
      updated++;
    } else {
      const nr = lastRow+added+1;
      const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy");
      if(g.capitulo) sheet.getRange(nr,COLS.CAPITULO+1).setValue(g.capitulo);
      sheet.getRange(nr,COLS.SEMANA+1).setValue(g.semana);
      sheet.getRange(nr,COLS.DIA+1).setValue(g.dia);
      if(g.bloque) sheet.getRange(nr,COLS.BLOQUE+1).setValue(g.bloque);
      sheet.getRange(nr,COLS.EJERCICIO+1).setValue(g.ejercicio);
      if(maxKg>0) sheet.getRange(nr,COLS.KG+1).setValue(maxKg);
      if(maxRn>0) sheet.getRange(nr,COLS.VOLUMEN+1).setValue(maxRn);
      if(maxRe>0) sheet.getRange(nr,COLS.REPS_EX+1).setValue(maxRe);
      if(tiempo) sheet.getRange(nr,COLS.TIEMPO+1).setValue(tiempo);
      if(avgRpe>0) sheet.getRange(nr,COLS.RPE+1).setValue(parseFloat(avgRpe.toFixed(1)));
      if(avgRir>0) sheet.getRange(nr,COLS.RIR+1).setValue(parseFloat(avgRir.toFixed(1)));
      sheet.getRange(nr,2).setValue(g.fecha||today);
      added++;
    }
  });
  return (updated>0 ? '✅ '+updated+' actualizado(s). ' : '') +
         (added>0 ? '➕ '+added+' agregado(s). ' : '') +
         '\n💡 Los dashboards se actualizan solos.';
}
