const fs = require('fs');

const indexHtml = fs.readFileSync('/Users/pankaj.k/Documents/Toolkit /old_files/index.html', 'utf8');
const globalsCss = fs.readFileSync('/Users/pankaj.k/Documents/Toolkit /frontend/src/app/globals.css', 'utf8');

// Extract the <style id="premium-theme-overrides"> block
const startIndex = indexHtml.indexOf('<style id="premium-theme-overrides">');
const endIndex = indexHtml.indexOf('</style>', startIndex);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find premium theme overrides");
    process.exit(1);
}

// Get the content inside the style tag
const ddesignCss = indexHtml.substring(startIndex + '<style id="premium-theme-overrides">'.length, endIndex);

const merged = globalsCss + '\n\n/* ================= DDESIGN OVERRIDES ================= */\n' + ddesignCss;

fs.writeFileSync('/Users/pankaj.k/Documents/Toolkit /frontend/src/app/globals.css', merged);
console.log('DDesign CSS appended successfully');
