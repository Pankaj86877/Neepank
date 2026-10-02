const fs = require('fs');
const html = fs.readFileSync('/Users/pankaj.k/Documents/Toolkit /latest-toolkit-version/index.html', 'utf8');

// The first style tag ends at line 1006 or 1119. 
// We want the block from 1723 to 1909 which is the 3rd style tag!
const lines = html.split('\n');
const secondStyleBlock = lines.slice(1723, 1909).join('\n'); // lines are 0-indexed in array so 1723 is line 1724 but close enough

const globals = fs.readFileSync('/Users/pankaj.k/Documents/Toolkit /frontend/src/app/globals.css', 'utf8');
const merged = globals + '\n\n/* --- PNG OVERLAY SPECIFIC CSS --- */\n' + secondStyleBlock;

fs.writeFileSync('/Users/pankaj.k/Documents/Toolkit /frontend/src/app/globals.css', merged);
console.log('PNG CSS appended');
