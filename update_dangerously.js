const fs = require('fs');

const files = [
  'src/components/WorkoutBlockCard.tsx',
  'src/components/WorkoutTimer.tsx',
  'src/components/ShareCardOverlay.tsx',
  'src/components/ExerciseLogger.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Replace dangerouslySetInnerHTML={{ __html: X }} with dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(X) }}

  // Find all instances
  content = content.replace(/dangerouslySetInnerHTML=\{\{\s*__html:\s*(.*?)\s*\}\}/g, (match, p1) => {
    // If it's already sanitized, leave it
    if (p1.startsWith('DOMPurify.sanitize(')) {
        return match;
    }
    return `dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(${p1}) }}`;
  });

  fs.writeFileSync(file, content);
});
