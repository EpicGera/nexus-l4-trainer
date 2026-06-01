const fs = require('fs');
const contents = fs.readFileSync('src/components/ExerciseLogger.tsx', 'utf8');

const regex = /\bset[A-Z]\w*\((.*?)\)/g;
let match;
while ((match = regex.exec(contents)) !== null) {
    if (match.index > 0) {
        // Find line number
        const prior = contents.substring(0, match.index);
        const lineStr = prior.split('\n').length;
        console.log(`Line ${lineStr}: ${match[0]}`);
    }
}
