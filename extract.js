const fs = require('fs');
const html = fs.readFileSync('/Users/pankaj.k/Documents/Toolkit /latest-toolkit-version/index.html', 'utf8');
const styleStart = html.indexOf('<style>');
const styleEnd = html.indexOf('</style>', styleStart);
const css = html.substring(styleStart + 7, styleEnd);
fs.writeFileSync('/Users/pankaj.k/Documents/Toolkit /frontend/src/app/legacy.css', css);
console.log('CSS extracted');
