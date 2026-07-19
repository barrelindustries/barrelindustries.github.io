(function () {
  const canvas = document.querySelector(".debris");
  if (!canvas) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = canvas.getContext("2d");
  if (!ctx || !("IntersectionObserver" in window)) return;
  const SHAPES = ["square", "triangle", "hex", "bar"];
  const COUNT = window.innerWidth < 720 ? 42 : 88;

  let particles = [];
  let raf = null;
  let running = false;

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function dims() {
    return { w: canvas.offsetWidth, h: canvas.offsetHeight };
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { w, h } = dims();
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn() {
    const { w, h } = dims();
    const minDim = Math.min(w, h);
    const minR = minDim * 0.22;
    const maxR = minDim * 0.7;
    particles = [];
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        angle: rand(0, Math.PI * 2),
        radius: rand(minR, maxR),
        angularV: -rand(0.0006, 0.0022),
        wobbleAmp: rand(0, 10),
        wobblePhase: rand(0, Math.PI * 2),
        wobbleSpeed: rand(0.004, 0.018),
        s: rand(3, 11),
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.004, 0.004),
        shape: SHAPES[Math.floor(rand(0, SHAPES.length))],
        alpha: rand(0.08, 0.4),
        ember: Math.random() > 0.84
      });
    }
  }

  function drawParticle(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = p.alpha;
    ctx.strokeStyle = p.ember ? "#f06d48" : "#d63a2e";
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    const s = p.s;
    if (p.shape === "square") {
      ctx.rect(-s / 2, -s / 2, s, s);
    } else if (p.shape === "triangle") {
      ctx.moveTo(0, -s / 2);
      ctx.lineTo(s / 2, s / 2);
      ctx.lineTo(-s / 2, s / 2);
      ctx.closePath();
    } else if (p.shape === "hex") {
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        const x = Math.cos(a) * s / 2;
        const y = Math.sin(a) * s / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    } else {
      ctx.moveTo(-s / 2, 0);
      ctx.lineTo(s / 2, 0);
    }
    ctx.stroke();
    ctx.restore();
  }

  function tick() {
    if (!running) return;
    const { w, h } = dims();
    const cx = w * 0.92;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      const wobble = Math.sin(p.wobblePhase) * p.wobbleAmp;
      const r = p.radius + wobble;
      p.x = cx + Math.cos(p.angle) * r;
      p.y = cy + Math.sin(p.angle) * r;
      p.angle += p.angularV;
      p.wobblePhase += p.wobbleSpeed;
      p.rot += p.vr;
      drawParticle(p);
    }
    raf = requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    running = true;
    tick();
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => (entry.isIntersecting ? start() : stop()));
  });
  io.observe(canvas);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (canvas.getBoundingClientRect().bottom > 0 && canvas.getBoundingClientRect().top < window.innerHeight) start();
  });

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      spawn();
    }, 150);
  });

  resize();
  spawn();
  start();
})();
