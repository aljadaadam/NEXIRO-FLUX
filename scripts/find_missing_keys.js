const fs = require('fs');
const path = require('path');

// Read adminEn.ts
const adminEnContent = fs.readFileSync(
  path.join(__dirname, '..', 'templates', 'ycz-store', 'src', 'lib', 'adminEn.ts'),
  'utf8'
);

// Extract all keys from adminEn.ts
const keys = new Set();

// Match single-quoted keys:  'key':
const singleQuoteRegex = /^\s*'([^']+)'\s*:/gm;
let m;
while ((m = singleQuoteRegex.exec(adminEnContent)) !== null) {
  keys.add(m[1]);
}

// Match template literal keys:  [`key`]:
const templateRegex = /\[`([^`]+)`\]\s*:/g;
while ((m = templateRegex.exec(adminEnContent)) !== null) {
  keys.add(m[1]);
}

console.log('Dictionary keys count:', keys.size);

// Find all .tsx files in admin directories
function findTsxFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findTsxFiles(fullPath));
    } else if (entry.name.endsWith('.tsx')) {
      results.push(fullPath);
    }
  }
  return results;
}

const baseDir = path.join(__dirname, '..', 'templates', 'ycz-store', 'src');
const files = [
  ...findTsxFiles(path.join(baseDir, 'app', 'admin')),
  ...findTsxFiles(path.join(baseDir, 'components', 'admin')),
];

console.log('Files scanned:', files.length);

// Extract all t('...') keys from files
const usedKeys = new Set();
const tCallRegex = /t\('([^']+)'\)/g;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = tCallRegex.exec(content)) !== null) {
    usedKeys.add(match[1]);
  }
}

console.log('Unique t() keys used:', usedKeys.size);

// Find missing keys
const missing = [];
for (const key of usedKeys) {
  if (!keys.has(key)) {
    missing.push(key);
  }
}

console.log('MISSING keys:', missing.length);
console.log('');

// Sort and print
missing.sort().forEach((k, i) => {
  console.log(`${i + 1}. ${JSON.stringify(k)}`);
});
