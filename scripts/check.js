/**
 * Verificación rápida del sitio antes de publicar:  npm run check
 *  - precio y WhatsApp consistentes entre lib/event.js, index.html y gracias.html
 *  - todos los archivos locales referenciados por las páginas existen
 *  - no quedan rastros de pasarelas/pixeles ajenos
 */
const fs   = require('fs');
const path = require('path');
const { product, whatsapp } = require('../lib/event');

const ROOT   = path.join(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const pages  = ['index.html', 'gracias.html'];
let errors = 0;
const fail = (msg) => { errors++; console.error('✗ ' + msg); };
const ok   = (msg) => console.log('✓ ' + msg);

const copFormat = (n) => '$' + n.toLocaleString('es-CO').replace(/,/g, '.');   // 280000 → $280.000

for (const page of pages) {
    const html = fs.readFileSync(path.join(PUBLIC, page), 'utf8');

    // Precio
    const priceNum = html.match(/PRICE_COP\s*=\s*(\d+)/);
    if (priceNum) {
        Number(priceNum[1]) === product.unitPrice
            ? ok(`${page}: PRICE_COP = ${product.unitPrice}`)
            : fail(`${page}: PRICE_COP (${priceNum[1]}) ≠ lib/event.js (${product.unitPrice})`);
    }
    if (page === 'index.html') {
        html.includes(copFormat(product.unitPrice))
            ? ok(`index.html muestra ${copFormat(product.unitPrice)}`)
            : fail(`index.html no muestra el precio ${copFormat(product.unitPrice)}`);
    }

    // WhatsApp: todo link wa.me debe apuntar a TU número
    const waLinks = [...html.matchAll(/wa\.me\/(\d+)/g)].map(m => m[1]);
    const waVar   = html.match(/WA_NUMBER\s*=\s*'(\d+)'/);
    if (waVar) waLinks.push(waVar[1]);
    const bad = waLinks.filter(n => n !== whatsapp);
    bad.length
        ? fail(`${page}: hay números de WhatsApp distintos a ${whatsapp}: ${[...new Set(bad)].join(', ')}`)
        : ok(`${page}: WhatsApp → ${whatsapp} (${waLinks.length} referencias)`);

    // Archivos locales referenciados
    const refs = [...html.matchAll(/(?:src|href)="([^"#?]+)"/g)].map(m => m[1])
        .filter(u => !/^(https?:|mailto:|tel:|data:|\/\/)/.test(u));
    for (const r of new Set(refs)) {
        const file = path.join(PUBLIC, r.replace(/^\//, ''));
        if (r === '/' || r === '') continue;
        fs.existsSync(file) ? null : fail(`${page}: falta el archivo referenciado "${r}"`);
    }
    ok(`${page}: ${new Set(refs).size} archivos locales revisados`);

    // Rastros ajenos
    for (const needle of ['wompi', 'wa.link', 'filesafe.space', '2019865372285506', '3559974890833540']) {
        html.toLowerCase().includes(needle) ? fail(`${page}: contiene "${needle}"`) : null;
    }
}

for (const f of ['favicon.svg', 'robots.txt', 'sitemap.xml', 'pixel.js']) {
    fs.existsSync(path.join(PUBLIC, f)) ? ok(`public/${f} existe`) : fail(`falta public/${f}`);
}

// Video de testimonios (se carga con git lfs/clon completo; solo aviso)
fs.existsSync(path.join(PUBLIC, 'media', 'video-testimonios.mp4'))
    ? ok('public/media/video-testimonios.mp4 existe')
    : console.warn('! falta public/media/video-testimonios.mp4 (en un clon parcial es normal; en Netlify llega con el repo)');

if (product.statementDescriptor.length > 16) fail('statementDescriptor supera 16 caracteres (límite de MercadoPago)');

console.log(errors ? `\n${errors} problema(s)` : '\nTodo en orden ✔');
process.exit(errors ? 1 : 0);
