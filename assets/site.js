// Menu
const header = document.querySelector('.site-header');
const menuBtn = document.querySelector('.menu-btn');
menuBtn?.addEventListener('click', () => {
  menuBtn.setAttribute('aria-expanded', header.classList.toggle('open'));
});

// Contact form
// ponytail: opens the visitor's email app; swap for a form endpoint (Netlify Forms, Formspree) once hosting is chosen.
document.querySelector('form[data-mailto]')?.addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const body = `${f.get('message')}\n\n${f.get('name')}\n${f.get('email')}`;
  location.href = `mailto:${e.target.dataset.mailto}?subject=${encodeURIComponent('Session enquiry')}&body=${encodeURIComponent(body)}`;
});

// Hero: a field of fine gold lines that rises and falls at a resting breath.
const canvas = document.querySelector('.breath');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const BREATH = 10;  // seconds per breath: about six a minute, the pace of slow resting breathing
  const ROWS = 40;
  let w, h, cols, pointerX = 0, press = 0, pressTarget = 0, running = false;

  const wave = (x, z, t) =>
    Math.sin(x * 1.1 + z * .7 + t * .12) * .5 +
    Math.sin(x * .45 + z * 1.9 - t * .08) * .7 +
    Math.sin(x * 2.3 + z * .4 + t * .15) * .18;

  function draw(ms) {
    const t = ms / 1000;
    const breath = .5 - .5 * Math.cos(2 * Math.PI * t / BREATH);
    const amp = .2 + .16 * breath;
    press += (pressTarget - press) * .04;
    ctx.clearRect(0, 0, w, h);
    // Far rows first; each row paints white beneath itself so nearer swells hide what is behind them.
    for (let r = ROWS - 1; r >= 0; r--) {
      const z = 1 + r * .2;
      const base = h * 1.02 / z;
      ctx.beginPath();
      for (let i = 0; i <= cols; i++) {
        const sx = i / cols * w;
        const x = (sx / w - .5) * 3.6 * z;
        const dip = press * .22 * Math.exp(-(((sx - pointerX) / (w * .12)) ** 2));
        const y = base - (wave(x, z, t) * amp - dip) * h * .5 / z;
        i ? ctx.lineTo(sx, y) : ctx.moveTo(sx, y);
      }
      ctx.strokeStyle = `rgba(174, 157, 120, ${.95 - r / ROWS * .8})`;
      ctx.stroke();
      ctx.lineTo(w, h); ctx.lineTo(0, h);
      ctx.fillStyle = '#fff';
      ctx.fill();
    }
    if (running) requestAnimationFrame(draw);
  }

  function size() {
    const dpr = Math.min(devicePixelRatio, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineWidth = 1;
    cols = Math.max(40, Math.round(w / 12));
    if (!running) draw(2500);
  }
  addEventListener('resize', size);
  size();

  if (!still) {
    // Only animate while the hero is on screen.
    new IntersectionObserver(([entry]) => {
      const was = running;
      running = entry.isIntersecting;
      if (running && !was) requestAnimationFrame(draw);
    }).observe(canvas);

    const hero = canvas.parentElement;
    hero.addEventListener('pointermove', e => { pointerX = e.clientX; pressTarget = 1; });
    hero.addEventListener('pointerleave', () => { pressTarget = 0; });
  }
}
