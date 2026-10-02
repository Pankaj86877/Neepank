const fs = require('fs');
const newCSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
@import "tailwindcss";

:root{box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);
--bg:#0a0a0b;--side:#0f0f11;--card:#151518;--c2:#1c1c20;--line:#26262b;--text:#f4f4f5;--muted:#8d8d96;--tile:#0a0a0b;--brand:#e8682f}
@media(prefers-color-scheme:light){:root:not([data-theme=dark]){--bg:#f3f3f1;--side:#fff;--card:#fff;--c2:#efefec;--line:#dcdcd8;--text:#141416;--muted:#6b6b73}}
:root[data-theme=light]{--bg:#f3f3f1;--side:#fff;--card:#fff;--c2:#efefec;--line:#dcdcd8;--text:#141416;--muted:#6b6b73}
:root[data-theme=dark]{--bg:#0a0a0b;--side:#0f0f11;--card:#151518;--c2:#1c1c20;--line:#26262b;--text:#f4f4f5;--muted:#8d8d96}
html{scroll-padding-top:env(safe-area-inset-top,0px);height:100%}
*{box-sizing:border-box}
body{margin:0;height:100%;background:var(--bg);color:var(--text);font:15px/1.5 Syne,system-ui,sans-serif;display:flex}
button{font:inherit;color:inherit;cursor:pointer}
.mono{font-family:"JetBrains Mono",ui-monospace,monospace}
:focus-visible{outline:2px solid var(--brand);outline-offset:2px}
aside{width:230px;background:var(--side);border-right:1px solid var(--line);display:flex;flex-direction:column;flex-shrink:0;transition:width .25s;overflow:hidden}
.brand{display:flex;align-items:center;gap:12px;padding:18px 18px;border-bottom:1px solid var(--line)}
.logo{width:32px;height:32px;border-radius:50%;background:#fff;color:var(--brand);display:grid;place-items:center;font-weight:800;flex-shrink:0}
.brand b{display:block;font-size:19px;font-weight:800;line-height:1.1}.brand small{color:var(--muted);font-size:10px;letter-spacing:.2em}
.sl{padding:18px 18px 8px;color:var(--muted);font-size:10.5px;letter-spacing:.22em}
nav{padding:0 12px;display:flex;flex-direction:column;gap:2px;flex:1;overflow-y:auto}
nav button{display:flex;align-items:center;gap:12px;background:none;border:0;padding:7px 8px;border-radius:10px;color:var(--muted);text-align:left;white-space:nowrap;font-weight:500;font-size:13.5px}
nav button:hover,nav button[aria-current=true]{background:var(--c2);color:var(--text)}
.mini{width:26px;height:26px;border-radius:7px;background:var(--tile);border:1.5px solid var(--c);color:var(--c);display:grid;place-items:center;font-size:10.5px;font-weight:800;flex-shrink:0}
#col{margin:12px;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:9px 14px;text-align:left;color:var(--muted);white-space:nowrap;font-size:12.5px}
body.col aside{width:68px}body.col .brand>div:last-child,body.col .sl,body.col nav button span:last-child,body.col #col span{display:none}body.col nav button{justify-content:center}
main{flex:1;min-width:0;display:flex;flex-direction:column}
.bar{display:flex;align-items:flex-end;gap:4px;padding:8px 12px 0;border-bottom:1px solid var(--line);background:var(--side);overflow-x:auto;flex-shrink:0}
.tab{display:flex;align-items:center;gap:8px;padding:8px 10px 8px 12px;border:1px solid transparent;border-bottom:0;border-radius:10px 10px 0 0;background:none;color:var(--muted);font-size:13px;white-space:nowrap;font-weight:500}
.tab:hover{color:var(--text)}
.tab[aria-selected=true]{background:var(--bg);border-color:var(--line);color:var(--text);box-shadow:inset 0 2px 0 var(--c,var(--brand))}
.tab .mini{width:20px;height:20px;font-size:8.5px;border-radius:5px}
.x{border:0;background:none;color:var(--muted);width:20px;height:20px;border-radius:5px;line-height:1;padding:0}.x:hover{background:var(--c2);color:var(--text)}
.sp{margin-left:auto;display:flex;gap:8px;align-items:center;padding:0 6px 8px}
.pill{display:flex;align-items:center;gap:7px;border:1px solid #1f4d33;background:#0f2a1c;color:#4ade80;padding:4px 10px;border-radius:8px;font-size:11px}.pill i{width:6px;height:6px;border-radius:50%;background:#4ade80}
.chip{background:var(--card);border:1px solid var(--line);border-radius:9px;padding:6px 12px;font-size:11.5px;color:var(--muted);cursor:pointer}.chip:hover{color:var(--text)}
.chip[aria-pressed=true]{background:var(--brand);border-color:var(--brand);color:#fff}
.views{flex:1;min-height:0;position:relative}
.pane{position:absolute;inset:0;overflow:auto}.pane[hidden]{display:none}
.home{padding:clamp(18px,3vw,38px) clamp(16px,3vw,36px) 50px}
h1{font-size:clamp(32px,5vw,50px);margin:0 0 6px;font-weight:800;line-height:1.05}
.sub{color:var(--muted);font-size:13px;margin:0 0 22px}
.tools{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}
.tools input{background:var(--card);border:1px solid var(--line);color:var(--text);padding:9px 14px;border-radius:9px;min-width:220px;font-size:12.5px; outline:none;}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px}
.tile{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:16px;text-align:left;position:relative;overflow:hidden;transition:border-color .2s;width:100%}
.tile::after{content:"";position:absolute;inset:auto -30% -60% -30%;height:70%;background:radial-gradient(closest-side,var(--c),transparent);opacity:.12;pointer-events:none}
.tile:hover{border-color:var(--c)}
.ico{width:58px;height:58px;border-radius:14px;background:var(--tile);border:2.5px solid var(--c);color:var(--c);display:grid;place-items:center;font-weight:800;font-size:24px;letter-spacing:-.03em;transition:transform .25s}
.tile:hover .ico{transform:rotate(-5deg) scale(1.06)}
.tile h2{margin:0;font-size:17px}.tile p{margin:4px 0 0;color:var(--muted);font-size:11.5px}
.tile .st{font-size:11px;color:var(--muted)}
.ws{display:flex;height:100%}
.stage{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:22px;background:repeating-conic-gradient(var(--c2) 0 25%,transparent 0 50%) 0 0/20px 20px}
.stage canvas{max-width:100%;max-height:calc(100vh - 170px);box-shadow:0 20px 60px #0007;touch-action:none;cursor:grab;background:transparent}
.hint{color:var(--muted);font-size:11px}
.panel{width:310px;flex-shrink:0;border-left:1px solid var(--line);background:var(--side);padding:20px;overflow-y:auto;display:flex;flex-direction:column;gap:14px}
.panel h3{margin:0;display:flex;align-items:center;gap:10px;font-size:18px}
.lb{display:flex;justify-content:space-between;font-size:10.5px;letter-spacing:.14em;color:var(--muted);text-transform:uppercase;margin-bottom:5px}.lb b{color:#31a8ff;font-weight:500}
.panel input[type=range]{width:100%;accent-color:var(--brand)}
.panel select,.panel input[type=color]{width:100%;background:var(--card);color:var(--text);border:1px solid var(--line);border-radius:9px;padding:8px;font:inherit;font-size:12px}
.two{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.pb{background:var(--card);border:1px solid var(--line);border-radius:9px;padding:9px;font-size:11.5px;letter-spacing:.08em}.pb:hover{border-color:var(--brand)}
.dl{background:linear-gradient(#f07a3c,#e8682f);border:0;border-radius:11px;padding:13px;font-weight:800;color:#fff;font-size:13px;margin-top:auto}
.dl:disabled{opacity:.4;cursor:not-allowed}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.ph{margin:auto;text-align:center;color:var(--muted);max-width:420px;padding:30px}.ph .ico{margin:0 auto 18px;width:84px;height:84px;font-size:34px}
#toast{position:fixed;left:50%;bottom:calc(22px + env(safe-area-inset-bottom,0px));transform:translate(-50%,20px);background:var(--text);color:var(--bg);padding:9px 16px;border-radius:9px;opacity:0;transition:.2s;pointer-events:none;font-size:12px; z-index:9999;}
#toast.on{opacity:1;transform:translate(-50%,0)}
@media(max-width:820px){body{flex-direction:column}aside,body.col aside{width:100%;flex-direction:row;align-items:center;border-right:0;border-bottom:1px solid var(--line);overflow-x:auto}.brand{border:0;padding:10px 14px}.sl,#col{display:none}nav{flex-direction:row;padding:0 8px}body.col .brand>div:last-child{display:block}.ws{flex-direction:column}.panel{width:100%;border-left:0;border-top:1px solid var(--line)}.stage canvas{max-height:50vh}}
@media(prefers-reduced-motion:reduce){*{transition:none!important}}

/* Legacy overrides to ensure no conflict with new root */
`;

const file = 'frontend/src/app/globals.css';
let content = fs.readFileSync(file, 'utf8');

// Remove old imports and body definitions
content = content.replace(/@import.*?tailwindcss";/s, '');
content = content.replace(/body\s*{[^}]*}/, '');

fs.writeFileSync(file, newCSS + '\n' + content);
console.log('CSS updated successfully');
