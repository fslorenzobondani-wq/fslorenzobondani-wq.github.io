(() => {
  // Orologio 24h HH:MM:SS
  const clock = document.querySelector('.clock');
  if (clock) {
    const p = n => String(n).padStart(2, '0');
    const tick = () => {
      const d = new Date();
      clock.textContent = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
    };
    tick();
    setInterval(tick, 1000);
  }

  // Striscia di immagini che scorre verso destra, trascinabile
  const track = document.querySelector('.marquee-track');
  if (track) {
    track.innerHTML += track.innerHTML; // duplica per il loop continuo
    const SPEED = 38; // px al secondo
    let x = 0, half = 0, last = performance.now();
    let dragging = false, dragX = 0, velocity = 0;
    const measure = () => { half = track.scrollWidth / 2; };
    track.querySelectorAll('img').forEach(i => i.complete || i.addEventListener('load', measure));
    window.addEventListener('resize', measure);
    measure();

    const marquee = track.parentElement;
    marquee.addEventListener('pointerdown', e => { dragging = true; dragX = e.clientX; velocity = 0; marquee.setPointerCapture(e.pointerId); });
    marquee.addEventListener('pointermove', e => { if (!dragging) return; const dx = e.clientX - dragX; dragX = e.clientX; x += dx; velocity = dx; });
    ['pointerup', 'pointercancel'].forEach(t => marquee.addEventListener(t, () => { dragging = false; }));

    const loop = now => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (!dragging) {
        velocity *= 0.92;
        x += SPEED * dt + velocity;
      }
      if (half) { x = ((x % half) + half) % half; }
      track.style.transform = `translate3d(${x - half}px,0,0)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  // Lightbox nelle pagine progetto
  const box = document.querySelector('.lightbox');
  const imgs = [...document.querySelectorAll('.gallery img')];
  if (box && imgs.length) {
    const big = box.querySelector('img');
    let idx = 0;
    const show = i => { idx = (i + imgs.length) % imgs.length; big.src = imgs[idx].currentSrc || imgs[idx].src; box.hidden = false; };
    imgs.forEach((im, i) => im.addEventListener('click', () => show(i)));
    box.addEventListener('click', () => { box.hidden = true; });
    document.addEventListener('keydown', e => {
      if (box.hidden) {
        if (e.key === 'Escape') { const back = document.querySelector('[data-back]'); if (back) location.href = back.href; }
        return;
      }
      if (e.key === 'Escape') box.hidden = true;
      if (e.key === 'ArrowRight') show(idx + 1);
      if (e.key === 'ArrowLeft') show(idx - 1);
    });
  }
})();
