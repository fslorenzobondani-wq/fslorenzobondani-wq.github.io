// Genera tutti i file del sito a partire da DATA (data.json), CSS e SCRIPT.
// Uso in Node:  node builder.js   -> crea la cartella site/ (testi) e images.txt (lista immagini)
function buildSite(D, CSS, SCRIPT, README) {
  const files = {}, images = [], seen = new Set();
  const SIZES = { home: 1200, thumb: 600, full: 1600 };
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const parse = s => { const [hash, name, w, h] = s.split(' '); return { hash, name, w: +w, h: +h }; };
  const localName = (i, n) => String(i).padStart(2, '0') + '-' + n.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
  const img = (m, folder, i, size, prefix) => {
    const path = `images/${folder}/${localName(i, m.name)}`;
    if (!seen.has(path)) { seen.add(path); images.push({ path, url: `https://freight.cargo.site/w/${SIZES[size]}/q/80/i/${m.hash}/${m.name}` }); }
    return prefix + path;
  };
  const link = (prefix, t) => prefix + (t ? t + '/' : '') + 'index.html';

  const page = (title, body, prefix, cls) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(D.bio)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(D.bio)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500&family=Geist+Mono:wght@400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${prefix}style.css">
</head>
<body class="${cls}">
${body}
<script src="${prefix}script.js"></script>
</body>
</html>
`;
  const header = p => `<header class="site-header">
  <a href="${link(p, '')}">${esc(D.name)}</a>
  <nav><a href="${link(p, 'work')}">WORK</a><a href="${link(p, 'about')}">ABOUT</a></nav>
</header>`;
  const marquee = p => `<div class="marquee" aria-hidden="true"><div class="marquee-track">${D.home.map((s, i) => { const m = parse(s); return `<img src="${img(m, 'home', i + 1, 'home', p)}" width="${m.w}" height="${m.h}" alt="">`; }).join('')}</div></div>
<div class="clock">00:00:00</div>`;

  files['style.css'] = CSS;
  files['script.js'] = SCRIPT;
  if (README) files['LEGGIMI.txt'] = README;
  files['index.html'] = page(D.name, header('') + marquee(''), '', 'home');

  const p = '../';
  files['about/index.html'] = page(`About — ${D.name}`, `<section class="about">
  <div class="about-contact">
    <a href="${link(p, '')}">${esc(D.name)}</a>
    <p>CONTACT<br><a href="mailto:${esc(D.email)}">${esc(D.email)}</a><br><a href="${esc(D.instagram)}" target="_blank" rel="noopener">Instagram</a></p>
  </div>
  <div class="about-bio">${esc(D.bio)}</div>
  <div class="about-close"><a href="${link(p, '')}">(Close)</a></div>
</section>` + marquee(p), p, 'home about-page');

  const items = D.projects.map((pr, i) => { const t = parse(pr.thumb); return `<a class="work-item" href="${link(p, pr.slug)}">
    <div class="work-thumb"><img src="${img(t, 'work', i + 1, 'thumb', p)}" width="${t.w}" height="${t.h}" alt="${esc(pr.index[0])}" loading="lazy"></div>
    <div class="work-text">${pr.index.map(esc).join('<br>')}</div>
  </a>`; });
  files['work/index.html'] = page(`Work — ${D.name}`, header(p) + '<main class="work-list">' + items.join('\n') + '</main>', p, 'work-page');

  for (const pr of D.projects) {
    const gal = pr.images.map((s, i) => { const m = parse(s); return `<img src="${img(m, pr.slug, i + 1, 'full', p)}" width="${m.w}" height="${m.h}" alt="${esc(pr.credits[0])}" loading="lazy">`; }).join('');
    let credits = pr.credits.map(esc).join('<br>');
    if (pr.link) credits += `<br><a href="${esc(pr.link)}" target="_blank" rel="noopener">LINK</a>`;
    files[`${pr.slug}/index.html`] = page(`${pr.credits[0]} — ${D.name}`, header(p) + marquee(p) + `<main class="sheet">
  <div class="credits">${credits}</div>
  <div class="return-row"><hr><a class="caption" href="${link(p, 'work')}" data-back>Return to List of Works</a></div>
  <div class="gallery">${gal}</div>
</main>
<div class="lightbox" hidden><img alt=""></div>`, p, 'home project-page');
  }
  files['404.html'] = page(D.name, header('/') + marquee('/'), '/', 'home');
  return { files, images };
}

if (typeof module !== 'undefined' && require.main === module) {
  const fs = require('fs'), path = require('path');
  const r = f => fs.readFileSync(path.join(__dirname, f), 'utf8');
  const { files, images } = buildSite(JSON.parse(r('data.json')), r('style.css'), r('script.js'), fs.existsSync(path.join(__dirname, 'LEGGIMI.txt')) ? r('LEGGIMI.txt') : '');
  for (const [f, c] of Object.entries(files)) { const out = path.join(__dirname, 'site', f); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, c); }
  fs.writeFileSync(path.join(__dirname, 'images.txt'), images.map(i => i.path + ' ' + i.url).join('\n'));
  console.log(Object.keys(files).length + ' file, ' + images.length + ' immagini');
}
if (typeof module !== 'undefined') module.exports = buildSite;
