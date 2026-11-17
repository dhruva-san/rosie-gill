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
  // A few dozen points of light on the nearer lines; none when motion is reduced.
  const glints = still ? [] : Array.from({ length: 36 }, () => ({
    r: Math.floor(Math.random() * 22), u: .03 + Math.random() * .94,
    phase: Math.random() * 6.28, speed: .4 + Math.random() * .5,
  }));

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
    const lineY = (sx, z) => {
      const x = (sx / w - .5) * 3.6 * z;
      const dip = press * .22 * Math.exp(-(((sx - pointerX) / (w * .12)) ** 2));
      return h * 1.02 / z - (wave(x, z, t) * amp - dip) * h * .5 / z;
    };
    // Far rows first; each row paints white beneath itself so nearer swells hide what is behind them.
    for (let r = ROWS - 1; r >= 0; r--) {
      const z = 1 + r * .2;
      ctx.beginPath();
      for (let i = 0; i <= cols; i++) {
        const sx = i / cols * w;
        const y = lineY(sx, z);
        i ? ctx.lineTo(sx, y) : ctx.moveTo(sx, y);
      }
      ctx.strokeStyle = `rgba(198, 162, 84, ${1 - r / ROWS * .75})`;  // a warmer, more saturated take on her #ae9d78 so 1px lines read as gold, not grey
      ctx.stroke();
      ctx.lineTo(w, h); ctx.lineTo(0, h);
      ctx.fillStyle = '#fff';
      ctx.fill();
      // Glints ride this row's line, so nearer swells still pass in front of them.
      for (const g of glints) {
        if (g.r !== r) continue;
        const b = Math.max(0, Math.sin(t * g.speed + g.phase)) ** 20;  // dark most of the time, a slow brief twinkle
        if (b < .02) continue;
        const gx = g.u * w, gy = lineY(gx, z);
        ctx.fillStyle = `rgba(222, 184, 96, ${b * .2})`;
        ctx.beginPath(); ctx.arc(gx, gy, 5, 0, 7); ctx.fill();
        ctx.fillStyle = `rgba(212, 170, 70, ${b})`;
        ctx.beginPath(); ctx.arc(gx, gy, .7 + b * .9, 0, 7); ctx.fill();
      }
    }
    if (running) requestAnimationFrame(draw);
  }

  function size() {
    const dpr = Math.min(devicePixelRatio, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineWidth = 1.25;
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
