const fs = require('fs');
const path = require('path');

const transContent = fs.readFileSync('templates/ycz-store/src/lib/translations.ts', 'utf8');
const adminContent = fs.readFileSync('templates/ycz-store/src/lib/adminEn.ts', 'utf8');

const arabicKeyRegex = /'([^']*[\u0600-\u06FF][^']*)'/g;
const translatedKeys = new Set();

let m;
while ((m = arabicKeyRegex.exec(transContent)) !== null) {
  translatedKeys.add(m[1]);
}
arabicKeyRegex.lastIndex = 0;
while ((m = arabicKeyRegex.exec(adminContent)) !== null) {
  translatedKeys.add(m[1]);
}

console.log('Translation keys loaded:', translatedKeys.size);

function getAllFiles(dir, exts) {
  let results = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) results = results.concat(getAllFiles(full, exts));
    else if (exts.some(e => f.endsWith(e))) results.push(full);
  }
  return results;
}

const srcDir = 'templates/ycz-store/src';
const files = getAllFiles(srcDir, ['.ts', '.tsx']).filter(f => 
  !f.endsWith('translations.ts') && !f.endsWith('adminEn.ts')
);

console.log('Component files to scan:', files.length);

const arabicRange = /[\u0600-\u06FF]/;
const report = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!arabicRange.test(line)) continue;
    
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;
    
    // Match single-quoted strings containing Arabic
    const singleQuote = /'([^']*[\u0600-\u06FF][^']*)'/g;
    let match;
    while ((match = singleQuote.exec(line)) !== null) {
      const str = match[1];
      const inTrans = translatedKeys.has(str);
      report.push({
        file: file.replace(/\\/g, '/'),
        line: i + 1,
        string: str,
        inTranslations: inTrans
      });
    }
    
    // Match double-quoted strings containing Arabic
    const doubleQuote = /"([^"]*[\u0600-\u06FF][^"]*)"/g;
    while ((match = doubleQuote.exec(line)) !== null) {
      const str = match[1];
      const inTrans = translatedKeys.has(str);
      report.push({
        file: file.replace(/\\/g, '/'),
        line: i + 1,
        string: str,
        inTranslations: inTrans
      });
    }
    
    // Also check JSX text content (Arabic text between > and <)
    const jsxMatch = />([^<]*[\u0600-\u06FF][^<]*)</g;
    let jm;
    while ((jm = jsxMatch.exec(line)) !== null) {
      const str = jm[1].trim();
      if (str.length > 1) {
        const inTrans = translatedKeys.has(str);
        report.push({
          file: file.replace(/\\/g, '/'),
          line: i + 1,
          string: str,
          inTranslations: inTrans,
          type: 'jsx-text'
        });
      }
    }
  }
}

const missing = report.filter(r => !r.inTranslations);
const found = report.filter(r => r.inTranslations);

const byFile = {};
for (const m of missing) {
  if (!byFile[m.file]) byFile[m.file] = [];
  byFile[m.file].push(m);
}

// Print concise summary to console
console.log('\nMISSING: ' + missing.length + ' | TRANSLATED: ' + found.length + ' | TOTAL: ' + report.length);
console.log('Files with missing translations: ' + Object.keys(byFile).length);

// Write full report to file
const reportLines = [];
reportLines.push('UNTRANSLATED ARABIC STRINGS - FULL REPORT');
reportLines.push('=========================================\n');
reportLines.push('Total Arabic strings found: ' + report.length);
reportLines.push('Already translated: ' + found.length);
reportLines.push('MISSING translations: ' + missing.length);
reportLines.push('\n--- MISSING BY FILE ---\n');

for (const [file, items] of Object.entries(byFile)) {
  const shortPath = file.replace(/.*templates[\/\\]ycz-store[\/\\]src[\/\\]/, '');
  reportLines.push('FILE: ' + shortPath);
  const seen = new Set();
  for (const item of items) {
    const key = item.string;
    if (seen.has(key)) continue;
    seen.add(key);
    const tag = item.type === 'jsx-text' ? ' [JSX]' : '';
    reportLines.push('  L' + item.line + tag + ': "' + item.string + '"');
  }
  reportLines.push('');
}

fs.writeFileSync('scripts/untranslated_report.txt', reportLines.join('\n'), 'utf8');
console.log('Report written to scripts/untranslated_report.txt');
