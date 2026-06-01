const fs = require('fs');

const code = fs.readFileSync('./src/components/ExerciseLogger.tsx', 'utf8');

const lines = code.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.match(/\bset[A-Z][a-zA-Z0-9]*\(/)) {
    console.log(`Line ${i+1}: ${line}`);
  }
}
