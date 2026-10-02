const fs = require('fs');

const legacy = fs.readFileSync('/Users/pankaj.k/Documents/Toolkit /frontend/src/app/legacy.css', 'utf8');
const globals = fs.readFileSync('/Users/pankaj.k/Documents/Toolkit /frontend/src/app/globals.css', 'utf8');

// The first 53 lines of legacy.css contain the duplicate :root and body rules.
const lines = legacy.split('\n');
const layoutCss = lines.slice(53).join('\n');

const merged = globals + '\n\n/* --- RESTORED LEGACY CSS --- */\n' + layoutCss;

fs.writeFileSync('/Users/pankaj.k/Documents/Toolkit /frontend/src/app/globals.css', merged);
console.log('CSS merged successfully');
