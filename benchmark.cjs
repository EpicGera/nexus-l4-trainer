const { performance } = require('perf_hooks');

// Mock localStorage
const localStorage = {
  store: {},
  getItem: function(key) { return this.store[key] || null; },
  setItem: function(key, value) { this.store[key] = value.toString(); },
  key: function(i) { return Object.keys(this.store)[i]; },
  get length() { return Object.keys(this.store).length; },
  clear: function() { this.store = {}; }
};

// Populate
for (let i = 0; i < 5000; i++) {
  const data = [];
  for (let j = 0; j < 5; j++) {
    data.push({ weight: "100", reps: "10", rpe: "8" });
  }
  const wk = "w" + ((i % 4) + 1);
  localStorage.setItem(`nexus_logs_${wk}_day${i}`, JSON.stringify(data));
}

function oldStats() {
  const realWVolumes = [0, 0, 0, 0];
  const realWRpeSum = [0, 0, 0, 0];
  const realWRpeCount = [0, 0, 0, 0];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("nexus_logs_")) {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((log) => {
            const wt = parseFloat(log.weight) || 0;
            const rp = parseFloat(log.reps) || 0;
            const rpe = parseFloat(log.rpe) || 0;
            const parts = key.split("_");
            const dayId = parts[2] || "";
            const wkKey = dayId.substring(0, 2);
            let idx = -1;
            if (wkKey === "w1") idx = 0;
            else if (wkKey === "w2") idx = 1;
            else if (wkKey === "w3") idx = 2;
            else if (wkKey === "w4") idx = 3;
            if (idx !== -1) {
              realWVolumes[idx] += wt * rp;
              if (rpe > 0) {
                realWRpeSum[idx] += rpe;
                realWRpeCount[idx]++;
              }
            }
          });
        }
      }
    }
  }
  return realWVolumes;
}

// Mock getMonthlyVolumeStats (which is already executed)
function newStats() {
  // Simulating what's already available in `stats`
  const stats = {
    weeklyVolume: { w1: 1250000, w2: 1250000, w3: 1250000, w4: 1250000 },
    weeklyRpeSum: { w1: 100000, w2: 100000, w3: 100000, w4: 100000 },
    weeklyRpeCount: { w1: 12500, w2: 12500, w3: 12500, w4: 12500 },
  };

  const realWVolumes = [
    stats.weeklyVolume.w1 || 0,
    stats.weeklyVolume.w2 || 0,
    stats.weeklyVolume.w3 || 0,
    stats.weeklyVolume.w4 || 0,
  ];

  return realWVolumes;
}

// Warmup
oldStats();
newStats();

// Benchmark Old
let sumOld = 0;
const iterations = 10;
for (let i = 0; i < iterations; i++) {
  const t0 = performance.now();
  oldStats();
  const t1 = performance.now();
  sumOld += (t1 - t0);
}
const avgOld = sumOld / iterations;
console.log(`Old stats avg: ${avgOld.toFixed(2)} ms`);

// Benchmark New
let sumNew = 0;
for (let i = 0; i < iterations; i++) {
  const t0 = performance.now();
  newStats();
  const t1 = performance.now();
  sumNew += (t1 - t0);
}
const avgNew = sumNew / iterations;
console.log(`New stats avg: ${avgNew.toFixed(2)} ms`);

console.log(`Improvement: ${((avgOld - avgNew) / avgOld * 100).toFixed(2)}%`);
console.log(`Speedup: ${(avgOld / avgNew).toFixed(2)}x`);
