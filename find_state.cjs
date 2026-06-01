const fs = require('fs');

const code = fs.readFileSync('src/App.tsx', 'utf8');

// Strip out everything inside hooks, functions, useMemos, etc. to see what's directly in the App function body.
// This is hard to do perfectly with regex, so let's just use simple text search for lines that contain a setState but are not clearly inside a callback.

const lines = code.split('\n');
let insideUseEffect = 0;
let insideCallback = 0;
let insideReturn = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes('useEffect(') || line.includes('useMemo(') || line.includes('useCallback(')) insideUseEffect++;
  if (line.includes('const handle') || line.includes('() =>') || line.includes('function ')) insideCallback++;
  if (line.includes('return (') && i > 50) insideReturn++;
  
  if (line.match(/\bset[A-Z][a-zA-Z0-9]*\(/)) {
    console.log(`Line ${i+1}: ${line}`);
  }
}
