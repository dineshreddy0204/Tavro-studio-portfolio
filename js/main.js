/* =========================================================
   TAVRO STUDIO — PREMIUM DIGITAL AGENCY
   Core Frontend Architecture & Motion Engine
   ========================================================= */

(() => {
  'use strict';

  // ---------- Math & Interpolation Utilities ----------
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const norm = (v, a, b) => clamp((v - a) / (b - a));
  const sstep = (a, b, v) => { const t = norm(v, a, b); return t * t * (3 - 2 * t); };
  const fract = (v) => v - Math.floor(v);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const bell = (v, a, peak, b) => (v <= a || v >= b ? 0 : v < peak ? sstep(a, peak, v) : 1 - sstep(peak, b, v));
  const f1 = (v) => v.toFixed(1);
  const f2 = (v) => v.toFixed(2);

  const html = document.documentElement;
  const fine = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(hover: hover) and (pointer: fine)').matches
    : false;
  const reduce = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  // ---------- Runtime Global State ----------
  const S = {
    W: window.innerWidth,
    H: window.innerHeight,
    y: 0,
    vel: 0,
    mx: 0,
    my: 0,
    smx: 0,
    smy: 0,
    cx: window.innerWidth / 2,
    cy: window.innerHeight / 2,
    t: 0,
    entered: false,
    lastP: 0,
    storyP: 0,
    workCase: 0,
    portalOpen: 0
  };

  if (typeof window !== 'undefined' && 'history' in window && 'scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  // =========================================================
  // REUSABLE PROJECT DATA STRUCTURE (EXTENSIBLE FOR UNLIMITED CASES)
  // =========================================================
  const PROJECTS_DATA = [
    {
      id: 'dazzlinglooks',
      num: '01',
      client: 'Dazzlinglooks',
      category: 'Beauty E-commerce',
      tagline: 'High-Conversion Luxury Beauty Flagship',
      description: 'A bespoke e-commerce platform engineered for an emerging luxury cosmetics brand. Focused on fluid product discovery, interactive shade matching, high-speed mobile checkout, and editorial brand storytelling.',
      services: [
        'Website Design & Development',
        'E-commerce Architecture',
        'UI/UX Design',
        'Performance Optimization'
      ],
      technologies: [
        'Shopify Plus / Hydrogen',
        'Next.js 15',
        'Tailwind CSS',
        'WebGL',
        'Framer Motion'
      ],
      liveUrl: 'https://www.dazzlinglooks.in/',
      isPlaceholder: false,
      year: '2026',
      accentColor: 'var(--accent-gold)'
    }
    // Future projects can simply be appended here!
  ];

  // =========================================================
  // GENERATIVE AMBIENT DIGITAL CANVAS ENGINE
  // =========================================================
  class GenerativeStage {
    constructor(ambientCanvas, filmCanvas) {
      this.amb = ambientCanvas;
      this.film = filmCanvas;
      this.ambCtx = ambientCanvas.getContext('2d');
      this.filmCtx = filmCanvas.getContext('2d');
      this.nodes = [];
      this.gridPoints = [];
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.initNodes();
    }

    initNodes() {
      this.nodes = [];
      const count = 48;
      for (let i = 0; i < count; i++) {
        this.nodes.push({
          x: Math.random(),
          y: Math.random(),
          z: Math.random() * 0.8 + 0.2,
          vx: (Math.random() - 0.5) * 0.0006,
          vy: (Math.random() - 0.5) * 0.0006,
          size: Math.random() * 2 + 1,
          alpha: Math.random() * 0.5 + 0.2
        });
      }
    }

    resize() {
      const w = S.W;
      const h = S.H;
      this.amb.width = Math.round(w * 0.5);
      this.amb.height = Math.round(h * 0.5);
      this.film.width = Math.round(w * this.dpr);
      this.film.height = Math.round(h * this.dpr);
    }

    render(p, time, vel) {
      const w = this.film.width;
      const h = this.film.height;
      const ctx = this.filmCtx;

      ctx.clearRect(0, 0, w, h);

      // Draw subtle luminous wave grid
      ctx.save();
      ctx.strokeStyle = 'rgba(197, 168, 128, 0.07)';
      ctx.lineWidth = 1 * this.dpr;

      const lines = 14;
      const cols = 22;
      const horizon = h * (0.55 + S.smy * 0.05);

      for (let i = 0; i < lines; i++) {
        const rowP = i / (lines - 1);
        const yBase = horizon + Math.pow(rowP, 1.8) * (h - horizon);
        ctx.beginPath();

        for (let j = 0; j < cols; j++) {
          const colP = j / (cols - 1);
          const x = colP * w;
          const wave = Math.sin(colP * 8 + time * 0.8 + rowP * 3) * (8 + rowP * 24);
          const y = yBase + wave + Math.sin(time * 0.5 + colP * 5) * 6;

          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Draw floating constellation nodes
      for (let i = 0; i < this.nodes.length; i++) {
        const n = this.nodes[i];
        n.x += n.vx + S.smx * 0.0003;
        n.y += n.vy + vel * 0.00008;

        if (n.x < 0) n.x = 1;
        if (n.x > 1) n.x = 0;
        if (n.y < 0) n.y = 1;
        if (n.y > 1) n.y = 0;

        const nx = (n.x * w) + S.smx * 40 * n.z;
        const ny = (n.y * h) + S.smy * 30 * n.z;

        ctx.fillStyle = `rgba(197, 168, 128, ${n.alpha * (1 - p * 0.7)})`;
        ctx.beginPath();
        ctx.arc(nx, ny, n.size * this.dpr * n.z, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby nodes
        for (let k = i + 1; k < this.nodes.length; k++) {
          const m = this.nodes[k];
          const mx = (m.x * w) + S.smx * 40 * m.z;
          const my = (m.y * h) + S.smy * 30 * m.z;
          const dist = Math.hypot(nx - mx, ny - my);

          if (dist < 110 * this.dpr) {
            ctx.strokeStyle = `rgba(197, 168, 128, ${(1 - dist / (110 * this.dpr)) * 0.12 * (1 - p * 0.7)})`;
            ctx.beginPath();
            ctx.moveTo(nx, ny);
            ctx.lineTo(mx, my);
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      // Ambient blur canvas sync
      const actx = this.ambCtx;
      actx.clearRect(0, 0, this.amb.width, this.amb.height);
      const rad = actx.createRadialGradient(
        this.amb.width * (0.5 + S.smx * 0.15),
        this.amb.height * (0.45 + S.smy * 0.15),
        10,
        this.amb.width * 0.5,
        this.amb.height * 0.5,
        this.amb.width * 0.6
      );
      rad.addColorStop(0, 'rgba(197, 168, 128, 0.22)');
      rad.addColorStop(0.5, 'rgba(142, 142, 147, 0.08)');
      rad.addColorStop(1, 'rgba(6, 6, 8, 0)');
      actx.fillStyle = rad;
      actx.fillRect(0, 0, this.amb.width, this.amb.height);
    }
  }

  const generative = new GenerativeStage($('#ambient'), $('#filmCanvas'));

  // =========================================================
  // 3D KINETIC PERSPECTIVE WORLD
  // =========================================================
  const WORLD = {
    fall: {
      back: [
        ['TAVRO STUDIO', 'xl ghost metallic'],
        ['Digital Architecture', 'serif molten'],
        ['E-Commerce', 'tag'],
        ['High Velocity', 'l ghost metallic'],
        ['Scale Without Friction', 'serif'],
        ['Sub-Second Speed', 'l ghost'],
        ['Bespoke UI/UX', 'tag'],
        ['Precision Craft', 'l molten'],
        ['Strategy × Code', 'serif'],
        ['Conversion Engine', 'tag']
      ],
      front: [
        ['INNOVATE', 'xxl ghost'],
        ['TRANSFORM', 'xxl ghost']
      ]
    },
    crowd: {
      back: [
        ['Commercial Rigor', 'serif ash'],
        ['No Fragile Templates', 'l ghost ash'],
        ['Bespoke Codebases', 'serif ash'],
        ['Uncompromising Speed', 'm ash'],
        ['Aesthetic Distinction', 'serif molten'],
        ['Global Reach', 'l ash']
      ],
      front: [
        ['IMPACT', 'xxl ghost']
      ]
    },
    rise: {
      back: [
        ['Engineered for Brands', 'xl ghost molten'],
        ['Driven by Business', 'serif'],
        ['Bespoke Commerce', 'xl metallic'],
        ['Enduring Digital Value', 'serif molten'],
        ['Next-Gen Web', 'l ghost']
      ],
      front: []
    }
  };

  const LINES = [
    ['We build digital experiences that move businesses forward.', 0.035, 0.18, -0.1],
    ['From ambitious ideas to exceptional digital products.', 0.14, 0.28, 0.12],
    ['High-performance websites and next-generation commerce.', 0.25, 0.39, -0.08],
    ['Engineered for speed, built for conversion.', 0.35, 0.48, 0.06],
    ['Where brand distinction meets commercial scale.', 0.49, 0.61, 0],
    ['Built for brands. Driven by business.', 0.63, 0.75, 0],
    ['Let us engineer what comes next.', 0.77, 0.89, 0]
  ];

  const CTAS = [
    ['Explore Our Work', 'work', 'fall', -0.3],
    ['Start a Project', 'contact', 'fall', 0.32],
    ['Explore Our Work', 'work', 'rise', 0.3],
    ['Start a Project', 'contact', 'rise', -0.28]
  ];

  const P = 900;
  const items = [];

  function makeItem(cam, text, kind, o) {
    const el = document.createElement(o.jump ? 'a' : 'div');
    el.className = 'wi ' + kind;
    const span = document.createElement('span');
    span.textContent = text;
    el.appendChild(span);
    if (o.jump) {
      el.href = '#' + o.jump;
      el.dataset.jump = o.jump;
      el.dataset.cursor = 'Go';
    }
    cam.appendChild(el);
    items.push(Object.assign({ el, vis: false, ry: 0 }, o));
  }

  function buildWorld() {
    const back = $('.world--back .cam');
    const front = $('.world--front .cam');
    const ui = $('.world--ui .cam');
    if (!back || !front || !ui) return;

    for (const [set, def] of Object.entries(WORLD)) {
      def.back.forEach(([text, kind], i, arr) => {
        const side = i % 2 ? 1 : -1;
        const depth = Math.random();
        makeItem(back, text, kind, {
          set, loop: true, depth,
          xs: side * (0.16 + Math.random() * 0.28),
          z: -120 - depth * 1300, zIn: 260, zOut: -700,
          rate: lerp(1.15, 0.6, depth), phase: i / arr.length + Math.random() * 0.03,
          ry: Math.round((Math.random() * 22 + 6) * -side)
        });
      });

      def.front.forEach(([text, kind], i, arr) => {
        makeItem(front, text, kind, {
          set, loop: true, depth: 0,
          xs: (i % 2 ? 1 : -1) * (0.12 + Math.random() * 0.12),
          z: 60, zIn: 320, zOut: -260,
          rate: 2.2, phase: i / arr.length + 0.17, cap: 0.75,
          ry: Math.round((Math.random() - 0.5) * 20)
        });
      });
    }

    LINES.forEach(([text, p0, p1, xs]) => {
      makeItem(front, text, 'line', { set: 'line', loop: false, p0, p1, xs, z: 0, zIn: 180, zOut: -420 });
    });

    CTAS.forEach(([text, jump, set, xs], i) => {
      makeItem(ui, text, 'cta', {
        set: 'ui-' + set, loop: true, jump, xs,
        z: -60, zIn: 200, zOut: -420, rate: 0.55, phase: i * 0.5 + 0.12,
        ry: xs > 0 ? -14 : 14
      });
    });
  }

  function placeWorld(p, travel, alpha, shockT) {
    const { W, H } = S;
    const stretch = 1 + Math.min(Math.abs(S.vel), 70) * 0.003;
    const skew = clamp(S.vel * 0.04, -4, 4);

    for (const it of items) {
      let a = alpha[it.set] || 0;
      let t;
      if (it.loop) t = fract(it.phase + travel * it.rate);
      else { t = (p - it.p0) / (it.p1 - it.p0); if (t <= 0 || t >= 1) a = 0; }
      if (a > 0) a *= sstep(0, 0.1, t) * (1 - sstep(0.86, 1, t)) * (it.cap || 1) * (1 - (it.depth || 0) * 0.55);

      let z = it.z + lerp(it.zIn, it.zOut, t);
      let xs = it.xs, rz = 0;
      if (it.set === 'crowd' && shockT > 0) {
        const dir = xs >= 0 ? 1 : -1;
        const e = easeOut(shockT);
        xs += dir * (0.35 + Math.abs(xs)) * e * 1.2;
        z += e * 650;
        rz = dir * e * 38;
        a *= 1 - shockT;
      }
      if (a <= 0.004) {
        if (it.vis) { it.el.style.visibility = 'hidden'; it.vis = false; }
        continue;
      }
      if (!it.vis) { it.el.style.visibility = 'visible'; it.vis = true; }
      z = Math.min(z, P - 140);
      const k = (P - z) / P;
      const x = xs * W * k;
      const y = lerp(0.72, -0.72, t) * H * k;
      const rx = lerp(-16, 34, t);
      it.el.style.opacity = f2(a);
      it.el.style.transform =
        `translate3d(${f1(x)}px,${f1(y)}px,${f1(z)}px) rotateX(${f2(rx)}deg) rotateY(${it.ry}deg) rotateZ(${f2(rz)}deg) skewY(${f2(skew)}deg) scaleY(${stretch.toFixed(3)})`;
    }
  }

  // ---------- DOM Reference Caches ----------
  const stageInner = $('#stageInner');
  const filmEl = $('#film');
  const vignette = $('.vignette');
  const ambientEl = $('#ambient');
  const cams = $$('.world .cam');
  const hero = $('#hero');
  const flash = $('.flash:not(.flash--ember)');
  const flashWord = $('.flash b');
  const flashEmber = $('.flash--ember');
  const shock = $('.shock');
  const riseEls = $$('.rise span');
  const indexName = $('.index-name');
  const tilesEl = $('#tiles');
  const hud = $('.hud');
  const hudNum = $('.hud-num');
  const hudName = $('.hud-name');
  const hudRead = $('#hudContext');
  const hudBar = $('#hudProgress');

  const screens = $$('.screen--case').map((el) => ({
    el,
    title: $('.screen-title span', el),
    mockup: $('.mockup-desktop', el),
    meta: $('.screen-meta', el),
    vis: true
  }));

  const portalCanvas = $('#portalCanvas');
  const tunnelCam = $('.tunnel-cam');
  const portalLines = $$('.portal-line').map((el) => {
    const [a, b] = el.dataset.w.split(',').map(Number);
    return { el, a, b };
  });
  const portalCta = $('.portal-cta');

  const layout = {};

  // ---------- Portal Tunnel Arches ----------
  const arches = [];
  (() => {
    if (!tunnelCam) return;
    const words = ['TAVRO STUDIO', '', 'DIGITAL CRAFT', '', 'HIGH VELOCITY', '', 'ENTERPRISE SCALE', ''];
    words.forEach((w) => {
      const el = document.createElement('div');
      el.className = 'arch';
      if (w) {
        const s = document.createElement('span');
        s.textContent = w;
        el.appendChild(s);
      }
      tunnelCam.appendChild(el);
      arches.push({ el });
    });
  })();

  // ---------- Manifesto Word-by-Word Illuminator ----------
  const manifesto = $('#manifesto');
  const words = [];
  if (manifesto && manifesto.textContent) {
    const text = manifesto.textContent.trim().split(/\s+/);
    manifesto.textContent = '';
    text.forEach((w, i) => {
      const s = document.createElement('span');
      s.className = 'w';
      s.textContent = w;
      manifesto.appendChild(s);
      if (i < text.length - 1) manifesto.appendChild(document.createTextNode(' '));
      words.push({ el: s, o: -1 });
    });
  }

  // ---------- Technology Marquee System ----------
  const marquees = $$('.marquee-row').map((row) => {
    const track = $('.marquee-track', row);
    if (!track) return null;
    if (track.innerHTML) {
      const clone = track.innerHTML;
      track.insertAdjacentHTML('beforeend', clone);
    }
    const spans = $$('span', track);
    spans.slice(Math.floor(spans.length / 2)).forEach((s) => s.setAttribute('aria-hidden', 'true'));
    return { track, dir: +row.dataset.dir || 1, x: 0, half: 0 };
  }).filter(Boolean);

  // ---------- Services Dynamic Preview Card ----------
  const svcPreview = $('#svcPreview');
  const spcName = $('#spcName');
  const spcCopy = $('#spcCopy');
  const pv = { x: S.W / 2, y: S.H / 2, on: false, s: 0.6 };

  const SERVICE_DETAILS = {
    'web-design-dev': {
      title: 'Website Design & Development',
      copy: 'Bespoke marketing engines & interactive brand platforms built for conversion and category leadership.'
    },
    'ecommerce-dev': {
      title: 'E-commerce Development',
      copy: 'Shopify Plus & headless commerce architectures engineered for rapid transaction speed and global revenue.'
    },
    'ui-ux-design': {
      title: 'UI/UX Design',
      copy: 'Comprehensive design systems, interactive prototypes, and conversion journey mapping.'
    },
    'digital-solutions': {
      title: 'Digital Solutions',
      copy: 'Custom web applications, API integrations, and specialized tools tailored to your operational needs.'
    },
    'website-redesign': {
      title: 'Website Redesign',
      copy: 'Modernizing legacy web presences with elevated aesthetics, faster speeds, and measurable conversion boosts.'
    }
  };

  $$('.svc').forEach((li) => {
    li.addEventListener('mouseenter', () => {
      const id = li.dataset.serviceId;
      if (SERVICE_DETAILS[id]) {
        spcName.textContent = SERVICE_DETAILS[id].title;
        spcCopy.textContent = SERVICE_DETAILS[id].copy;
      }
      pv.on = true;
      if (svcPreview) svcPreview.classList.add('is-on');
      Sound.tick();
    });
  });

  const svcList = $('.svc-list');
  if (svcList) {
    svcList.addEventListener('mouseleave', () => {
      pv.on = false;
      if (svcPreview) svcPreview.classList.remove('is-on');
    });
  }

  // ---------- Measure & Resize Architecture ----------
  function measure() {
    S.W = window.innerWidth;
    S.H = window.innerHeight;

    for (const id of ['story', 'work', 'studio', 'services', 'process', 'portal', 'contact']) {
      const el = document.getElementById(id);
      if (el) {
        const r = el.getBoundingClientRect();
        layout[id] = { top: r.top + window.scrollY, h: r.height };
      }
    }

    generative.resize();

    // Portal positioning
    if (tunnelCam) {
      tunnelCam.style.top = f1(S.H * 0.46) + 'px';
    }

    marquees.forEach((m) => {
      if (m && m.track) m.half = m.track.scrollWidth / 2;
    });
  }

  // ---------- Story Update (Hero 3D Perspective) ----------
  const CUT = 0.48;
  const SHOCK = 0.59;

  function updateStory() {
    const L = layout.story;
    if (!L || S.y > L.top + L.h) return;
    const p = clamp((S.y - L.top) / (L.h - S.H));
    const { W, H } = S;

    // Generative Canvas Render
    generative.render(p, S.t, S.vel);

    // 3D Camera tracking pointer
    const camT = `rotateX(${f2(-S.smy * 6)}deg) rotateY(${f2(S.smx * 8)}deg)`;
    for (const c of cams) c.style.transform = camT;

    // 3D Type World
    const travel = (S.y - L.top) / H * 0.22 + S.t * 0.005;
    const shockT = norm(p, SHOCK, 0.65);
    const alpha = {
      fall: sstep(0.01, 0.06, p) * (1 - sstep(CUT - 0.03, CUT, p)),
      crowd: sstep(CUT, CUT + 0.03, p),
      rise: sstep(0.66, 0.71, p) * (1 - sstep(0.85, 0.88, p)),
      line: 1,
      'ui-fall': sstep(0.03, 0.07, p) * (1 - sstep(0.42, 0.45, p)),
      'ui-rise': sstep(0.68, 0.72, p) * (1 - sstep(0.85, 0.88, p))
    };
    placeWorld(p, travel, alpha, shockT);

    // Hero title recedes into depth on scroll
    const he = sstep(0, 0.06, p);
    if (hero) {
      hero.style.transform = `perspective(900px) translate3d(0,${f1(-he * 24)}vh,${f1(-he * 600)}px) rotateX(${f1(he * 42)}deg)`;
      hero.style.opacity = f2(1 - sstep(0.015, 0.07, p));
      hero.style.visibility = p > 0.08 ? 'hidden' : 'visible';
    }

    // Flash & Shockwave effects
    const fl = bell(p, 0.44, CUT, 0.52);
    if (flash) {
      flash.style.opacity = f2(fl);
      if (fl > 0 && flashWord) {
        flashWord.style.opacity = f2(bell(p, 0.46, CUT, 0.5));
        flashWord.style.transform = `scale(${f2(lerp(0.8, 1.2, norm(p, 0.45, 0.51)))})`;
      }
    }

    if (flashEmber) {
      flashEmber.style.opacity = f2(bell(p, SHOCK - 0.005, SHOCK + 0.01, 0.63) * 0.4);
    }
    if (shock) {
      if (shockT > 0 && shockT < 1) {
        const e = easeOut(shockT);
        shock.style.opacity = f2((1 - shockT) * sstep(0, 0.06, shockT));
        shock.style.transform = `scale(${f2(lerp(0.12, 7.5, e))}, ${f2(lerp(0.12, 7.5, e) * 0.5)})`;
      } else {
        shock.style.opacity = '0';
      }
    }

    // R I S E letters assemble
    const rq = norm(p, 0.69, 0.81);
    const ex = sstep(0.82, 0.87, p);
    riseEls.forEach((el, i) => {
      const lt = easeOut(norm(rq, i * 0.1, i * 0.1 + 0.6));
      if (lt <= 0 || ex >= 1) { el.style.opacity = '0'; return; }
      const tx = (i - 1.5) * W * 0.15 * (1 - lt);
      const ty = (Math.sin(i) * H * 0.2) * (1 - lt) - ex * H * 0.4;
      const tz = lerp(-2400, 0, lt) - ex * 1400;
      el.style.transform = `translate3d(${f1(tx)}px,${f1(ty)}px,${f1(tz)}px)`;
      el.style.opacity = f2(lt * (1 - ex));
    });

    // Impact triggers
    if (S.lastP < CUT && p >= CUT && p - S.lastP < 0.05) impact(1);
    if (S.lastP < SHOCK && p >= SHOCK && p - S.lastP < 0.05) impact(0.7);
    S.lastP = p;
    S.storyP = p;
  }

  function impact(power) {
    if (!reduce && stageInner) {
      stageInner.classList.remove('is-shake');
      void stageInner.offsetWidth;
      stageInner.classList.add('is-shake');
    }
    if (hud) {
      hud.classList.remove('is-pulse');
      void hud.offsetWidth;
      hud.classList.add('is-pulse');
    }
    Sound.boom(power);
  }

  // ---------- Selected Work (Featured Case & 3D Depth) ----------
  function updateWork() {
    const L = layout.work;
    if (!L || S.y + S.H < L.top || S.y > L.top + L.h) return;
    const w = clamp((S.y - L.top) / (L.h - S.H));
    const n = screens.length;

    screens.forEach((sc, i) => {
      let ty = 0, tz = 0, rx = 0, rz = 0, dim = 0;

      if (n > 1) {
        const k = norm(w, 0, 0.88) * (n - 1);
        S.workCase = Math.round(k);
        const d = k - i;
        if (d < -1 || d > 2.4) {
          if (sc.vis) { sc.el.style.visibility = 'hidden'; sc.vis = false; }
          return;
        }
        if (!sc.vis) { sc.el.style.visibility = 'visible'; sc.vis = true; }
        const side = i % 2 ? 1 : -1;

        if (d < 0) {
          const e = easeOut(d + 1);
          ty = (1 - e) * 110;
          rx = (1 - e) * 22;
          rz = (1 - e) * 6 * side;
        } else {
          const r = d;
          tz = -r * 380;
          ty = -r * 5;
          rz = -r * 2.2 * side;
          rx = r * 4.5;
          dim = Math.min(r, 1.4) * 0.65;
        }
      } else {
        // Single featured project (Dazzlinglooks)
        if (!sc.vis) { sc.el.style.visibility = 'visible'; sc.vis = true; }
        const enterT = sstep(0, 0.22, w);
        const exitT = sstep(0.85, 1, w);
        ty = (1 - enterT) * 16 - exitT * 20;
        tz = (1 - enterT) * -80 - exitT * 180;
        rx = (1 - enterT) * 6 + exitT * 8;
        dim = exitT * 0.45;
      }

      sc.el.style.transform = `translate3d(0,${f2(ty)}%,${f1(tz)}px) rotateX(${f2(rx)}deg) rotateZ(${f2(rz)}deg)`;
      sc.el.style.setProperty('--dim', f2(dim));

      if (sc.title) {
        sc.title.style.transform = `translate3d(${f2(lerp(4, -36, w))}%,0,0)`;
      }

      // Parallax tilt on mockup with mouse
      if (sc.mockup && fine) {
        sc.mockup.style.transform = `rotateY(${f2(S.smx * -6)}deg) rotateX(${f2(S.smy * 5)}deg)`;
      }
    });
  }

  // ---------- Manifesto Word Illuminator Update ----------
  function updateAbout() {
    const L = layout.studio;
    if (!L || S.y + S.H < L.top || S.y > L.top + L.h) return;
    const m = norm(S.y, L.top - S.H * 0.65, L.top + L.h * 0.5 - S.H * 0.3);
    const N = words.length;
    const head = m * (N + 5);

    for (let i = 0; i < N; i++) {
      const o = Math.round(lerp(0.12, 1, clamp((head - i) / 4)) * 50) / 50;
      if (o !== words[i].o) {
        words[i].o = o;
        words[i].el.style.opacity = o;
        if (o >= 0.95 && (words[i].el.textContent.includes('TAVRO') || words[i].el.textContent.includes('commercial'))) {
          words[i].el.classList.add('is-hot');
        }
      }
    }
  }

  // ---------- Technology Marquee Update ----------
  let marqueeDir = 1;
  function updateMarquee(dt) {
    if (Math.abs(S.vel) > 0.5) marqueeDir = S.vel > 0 ? 1 : -1;
    const speed = (reduce ? 0 : 0.65) + Math.min(Math.abs(S.vel), 80) * 0.35;
    for (const m of marquees) {
      if (!m || !m.half) continue;
      m.x += speed * m.dir * marqueeDir * (dt / 16.67);
      if (m.x <= -m.half) m.x += m.half;
      if (m.x > 0) m.x -= m.half;
      m.track.style.transform = `translate3d(${f1(m.x)}px,0,0)`;
    }
  }

  // ---------- Services Hover Cursor Card ----------
  function updateServices() {
    if (!fine || !svcPreview) return;
    const L = layout.services;
    if (!L || S.y + S.H < L.top || S.y > L.top + L.h) return;
    pv.x = lerp(pv.x, S.cx, 0.14);
    pv.y = lerp(pv.y, S.cy, 0.14);
    pv.s = lerp(pv.s, pv.on ? 1 : 0.6, 0.12);
    const w = svcPreview.offsetWidth;
    const h = svcPreview.offsetHeight;
    svcPreview.style.transform = `translate3d(${f1(pv.x - w / 2)}px,${f1(pv.y - h / 2)}px,0) scale(${f2(pv.s)})`;
  }

  // ---------- Process Indicator Update ----------
  const processFill = $('#processFill');
  function updateProcess() {
    const L = layout.process;
    if (!L || !processFill) return;
    if (S.y + S.H < L.top || S.y > L.top + L.h) return;
    const p = clamp((S.y - L.top) / (L.h - S.H * 0.5));
    processFill.style.height = `${(p * 100).toFixed(1)}%`;
  }

  // ---------- The Portal Cinematic Update ----------
  function updatePortal() {
    const L = layout.portal;
    if (!L || S.y + S.H < L.top || S.y > L.top + L.h) { S.portalOpen = 0; return; }
    const w = clamp((S.y - L.top) / (L.h - S.H));

    const push = sstep(0.76, 1, w);
    if (portalCanvas) {
      portalCanvas.style.transform = `scale(${(1 + push * 0.28).toFixed(4)}) translate3d(${f1(S.smx * -10)}px,${f1(S.smy * -8)}px,0)`;
    }

    const open = Math.max(sstep(0.1, 0.24, w) * (1 - sstep(0.4, 0.52, w)), sstep(0.78, 0.9, w));
    S.portalOpen = Math.max(open, sstep(0.1, 0.3, w) * (1 - sstep(0.9, 1, w)));
    const rush = w * 2.4 + push * 3;

    for (let i = 0; i < arches.length; i++) {
      const a = arches[i];
      const z = -3600 + fract(i / arches.length + rush + S.t * 0.012) * 4300;
      const o = open * sstep(-3600, -2300, z) * (1 - sstep(220, 680, z));
      a.el.style.opacity = f2(o);
      if (o > 0) a.el.style.transform = `translate3d(${f1(S.smx * -36)}px,${f1(S.smy * -24)}px,${f1(z)}px)`;
    }

    for (const l of portalLines) {
      const t = norm(w, l.a, l.b);
      const o = sstep(0, 0.25, t) * (1 - sstep(0.75, 1, t));
      l.el.style.opacity = f2(o);
      l.el.style.transform = `translate3d(-50%,${f1(lerp(50, -50, t))}px,0)`;
    }

    const c = sstep(0.8, 0.9, w);
    if (portalCta) {
      portalCta.style.opacity = f2(c);
      portalCta.style.transform = `translateY(${f1((1 - c) * 40)}px)`;
      portalCta.classList.toggle('is-live', c > 0.5);
    }
  }

  // ---------- HUD Chapter & Progress Readout ----------
  const CHAPTERS = ['Overview', 'Selected Work', 'Our Studio', 'Capabilities', 'Our Process', 'Project Inquiry'];
  const hudState = { ch: -1, read: '', bar: -1 };

  function updateHud() {
    if (!layout.story) return;
    const mid = S.y + S.H * 0.5;
    let ch;

    if (mid < layout.work.top) ch = 0;
    else if (mid < layout.studio.top) ch = 1;
    else if (mid < layout.services.top) ch = 2;
    else if (mid < layout.process.top) ch = 3;
    else if (mid < layout.contact.top) ch = 4;
    else ch = 5;

    if (ch !== hudState.ch) {
      hudState.ch = ch;
      if (hudNum) hudNum.textContent = String(ch + 1).padStart(2, '0');
      if (hudName) hudName.textContent = CHAPTERS[ch];
    }

    const total = document.documentElement.scrollHeight - S.H;
    const pct = clamp(S.y / Math.max(1, total));

    let read;
    if (ch === 0) read = 'EST. 2026 // DIGITAL AGENCY';
    else if (ch === 1) read = 'FEATURED // DAZZLINGLOOKS.IN';
    else if (ch === 2) read = 'ETHOS // STRATEGY × CRAFT';
    else if (ch === 3) read = 'SERVICES // BESPOKE SOLUTIONS';
    else if (ch === 4) read = 'WORKFLOW // 4 STAGES';
    else read = 'INQUIRY // OPEN FOR 2026';

    if (read !== hudState.read && hudRead) {
      hudState.read = read;
      hudRead.textContent = read;
    }

    const b = Math.round(pct * 1000);
    if (b !== hudState.bar && hudBar) {
      hudState.bar = b;
      hudBar.style.transform = `scaleX(${b / 1000})`;
    }
  }

  // ---------- Pointer Tracking & Audio Feedback ----------
  window.addEventListener('pointermove', (e) => {
    S.cx = e.clientX;
    S.cy = e.clientY;
    S.mx = (e.clientX / S.W) * 2 - 1;
    S.my = (e.clientY / S.H) * 2 - 1;
  }, { passive: true });

  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest && e.target.closest('button, a, input, select, textarea, .magnet');
    if (t) Sound.tick();
  });

  // Magnetic Pull Physics
  if (fine) {
    $$('.magnet').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.classList.add('is-pull');
        el.style.transform = `translate(${f1(x * 0.22)}px,${f1(y * 0.3)}px)`;
      });
      el.addEventListener('pointerleave', () => {
        el.classList.remove('is-pull');
        el.style.transform = '';
      });
    });
  }

  // ---------- Studio Sound Synthesizer (Web Audio API) ----------
  const Sound = {
    ctx: null,
    on: false,
    init() {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      const c = (this.ctx = new AC());
      this.master = c.createGain();
      this.master.gain.value = 0;
      this.master.connect(c.destination);

      const len = c.sampleRate * 2;
      const buf = c.createBuffer(1, len, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.noise = buf;

      const src = c.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      this.windF = c.createBiquadFilter();
      this.windF.type = 'bandpass';
      this.windF.frequency.value = 350;
      this.windF.Q.value = 0.8;
      this.windG = c.createGain();
      this.windG.gain.value = 0;
      src.connect(this.windF).connect(this.windG).connect(this.master);
      src.start();

      this.droneLP = c.createBiquadFilter();
      this.droneLP.type = 'lowpass';
      this.droneLP.frequency.value = 260;
      this.droneG = c.createGain();
      this.droneG.gain.value = 0;

      [65.4, 65.9, 98.0, 130.8].forEach((f) => {
        const o = c.createOscillator();
        o.type = 'sine';
        o.frequency.value = f;
        o.connect(this.droneLP);
        o.start();
      });
      this.droneLP.connect(this.droneG).connect(this.master);
      return true;
    },
    set(on) {
      if (on && !this.ctx && !this.init()) return;
      this.on = on;
      if (this.ctx) {
        if (on) this.ctx.resume();
        this.master.gain.setTargetAtTime(on ? 0.7 : 0, this.ctx.currentTime, 0.25);
      }
      const btn = $('#soundBtn');
      if (btn) {
        btn.setAttribute('aria-pressed', String(on));
        const span = $('span', btn);
        if (span) span.textContent = on ? 'Sound on' : 'Sound off';
      }
      html.classList.toggle('sound-on', on);
    },
    update() {
      if (!this.on || !this.ctx) return;
      const t = this.ctx.currentTime;
      const v = Math.min(Math.abs(S.vel), 80) / 80;
      const wind = 0.03 + v * 0.35;
      const freq = 240 + v * 700;
      this.windG.gain.setTargetAtTime(wind, t, 0.08);
      this.windF.frequency.setTargetAtTime(freq, t, 0.12);
      const open = S.portalOpen || 0;
      this.droneG.gain.setTargetAtTime(open * 0.09, t, 0.4);
      this.droneLP.frequency.setTargetAtTime(200 + open * 800, t, 0.4);
    },
    boom(power) {
      if (!this.on || !this.ctx) return;
      const c = this.ctx, t = c.currentTime;
      const o = c.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(130, t);
      o.frequency.exponentialRampToValueAtTime(32, t + 1.2);
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.85 * power, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
      o.connect(g).connect(this.master);
      o.start(t);
      o.stop(t + 1.7);
    },
    tick() {
      if (!this.on || !this.ctx) return;
      const c = this.ctx, t = c.currentTime;
      const o = c.createOscillator();
      o.type = 'triangle';
      o.frequency.setValueAtTime(1600, t);
      o.frequency.exponentialRampToValueAtTime(800, t + 0.04);
      const g = c.createGain();
      g.gain.setValueAtTime(0.035, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
      o.connect(g).connect(this.master);
      o.start(t);
      o.stop(t + 0.07);
    }
  };

  const soundBtn = $('#soundBtn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => Sound.set(!Sound.on));
  }

  // ---------- Smooth Inertia Scrolling (Lenis Integration) ----------
  const lenis = typeof window.Lenis === 'function'
    ? new window.Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !reduce,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.3
    })
    : null;

  if (lenis) lenis.stop();
  window.tavro = { lenis, jump: (key) => jump(key), step: () => step(performance.now()) };

  // ---------- Navigation & Smooth Jump System ----------
  const menu = $('#menu');
  const menuBtn = $('#menuBtn');

  function setMenu(open) {
    html.classList.toggle('menu-open', open);
    if (menuBtn) {
      menuBtn.setAttribute('aria-expanded', String(open));
      const text = $('.nav-menu-text', menuBtn);
      if (text) text.textContent = open ? 'Close' : 'Menu';
    }
    if (menu) menu.setAttribute('aria-hidden', String(!open));
    if (lenis && S.entered) open ? lenis.stop() : lenis.start();
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', () => setMenu(!html.classList.contains('menu-open')));
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (html.classList.contains('menu-open')) setMenu(false);
      closeModal();
    }
  });

  function targetY(key) {
    if (key === 'top') return 0;
    if (key === 'work' && layout.work) return layout.work.top;
    if (key === 'studio' && layout.studio) return layout.studio.top;
    if (key === 'services' && layout.services) return layout.services.top;
    if (key === 'process' && layout.process) return layout.process.top;
    if (key === 'portal' && layout.portal) return layout.portal.top;
    if (key === 'contact') return document.documentElement.scrollHeight - S.H;
    return layout[key] ? layout[key].top : 0;
  }

  function jump(key) {
    if (!S.entered) return;
    const y = targetY(key);
    const dist = Math.abs(y - window.scrollY);
    if (lenis) {
      lenis.scrollTo(y, { duration: clamp((dist / S.H) * 0.22, 1.0, 4.0), easing: easeInOut, force: true });
    } else {
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    }
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-jump]');
    if (!a) return;
    const key = a.dataset.jump;
    if (!key) return;
    e.preventDefault();
    if (html.classList.contains('menu-open')) setMenu(false);

    // If starting a project with a pre-selected project type
    const projectType = a.dataset.projectType;
    if (projectType) {
      const radio = $(`input[name="projectType"][value="${projectType}"]`);
      if (radio) radio.checked = true;
    }

    jump(key);
  });

  // Copy Direct Email Utility
  const copyBtn = $('#copyEmail');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const email = copyBtn.dataset.email || 'dineshreddy02a@gmail.com';
      try {
        await navigator.clipboard.writeText(email);
        const span = $('span', copyBtn);
        if (span) span.textContent = 'Email Copied!';
      } catch {
        const span = $('span', copyBtn);
        if (span) span.textContent = email;
      }
      setTimeout(() => {
        const span = $('span', copyBtn);
        if (span) span.textContent = 'Copy Direct Email';
      }, 2400);
    });
  }

  // Live Studio Time (India / IST)
  const clock = $('#clock');
  const menuClock = $('#menuClock');
  const tickTime = () => {
    try {
      const timeStr = new Intl.DateTimeFormat('en-IN', {
        hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata'
      }).format(new Date());
      if (clock) clock.textContent = `${timeStr} IST`;
      if (menuClock) menuClock.textContent = `India ${timeStr} IST`;
    } catch {
      const timeStr = new Date().toTimeString().slice(0, 5);
      if (clock) clock.textContent = timeStr;
      if (menuClock) menuClock.textContent = `Studio ${timeStr}`;
    }
  };
  tickTime();
  setInterval(tickTime, 15000);

  // =========================================================
  // FUNCTIONAL CLIENT INQUIRY FORM & VALIDATION PROTOCOL
  // =========================================================
  const inquiryForm = $('#inquiryForm');
  const inputName = $('#inputName');
  const inputBrand = $('#inputBrand');
  const inputEmail = $('#inputEmail');
  const inputWhatsapp = $('#inputWhatsapp');
  const inputDescription = $('#inputDescription');
  const charCount = $('#charCount');
  const submitBtn = $('#submitBtn');

  // Modal References
  const inquiryModal = $('#inquiryModal');
  const modalCloseBtn = $('#modalCloseBtn');
  const modalConfirmBtn = $('#modalConfirmBtn');
  const modalManifestText = $('#modalManifestText');
  const btnCopyManifest = $('#btnCopyManifest');

  // Character counter
  if (inputDescription && charCount) {
    inputDescription.addEventListener('input', () => {
      charCount.textContent = `${inputDescription.value.length} / 800`;
    });
  }

  function validateField(field, errorEl, rule) {
    const valid = rule();
    if (!valid.ok) {
      field.classList.add('has-error');
      errorEl.textContent = valid.msg;
      return false;
    }
    field.classList.remove('has-error');
    errorEl.textContent = '';
    return true;
  }

  function closeModal() {
    if (inquiryModal) inquiryModal.classList.remove('is-open');
    if (lenis && S.entered) lenis.start();
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalConfirmBtn) modalConfirmBtn.addEventListener('click', closeModal);
  if (inquiryModal) {
    inquiryModal.addEventListener('click', (e) => {
      if (e.target === inquiryModal) closeModal();
    });
  }

  if (btnCopyManifest && modalManifestText) {
    btnCopyManifest.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(modalManifestText.textContent);
        btnCopyManifest.textContent = 'Copied!';
        setTimeout(() => { btnCopyManifest.textContent = 'Copy Manifest'; }, 2200);
      } catch {
        btnCopyManifest.textContent = 'Selected (Ctrl+C)';
      }
    });
  }

  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;

      // Validate Name
      const fName = $('#field-name');
      const errName = fName ? $('.field-error', fName) : null;
      if (fName && errName) {
        if (!validateField(fName, errName, () => {
          if (!inputName.value.trim()) return { ok: false, msg: 'Full name is required.' };
          if (inputName.value.trim().length < 2) return { ok: false, msg: 'Please enter at least 2 characters.' };
          return { ok: true };
        })) isValid = false;
      }

      // Validate Brand
      const fBrand = $('#field-brand');
      const errBrand = fBrand ? $('.field-error', fBrand) : null;
      if (fBrand && errBrand) {
        if (!validateField(fBrand, errBrand, () => {
          if (!inputBrand.value.trim()) return { ok: false, msg: 'Business / brand name is required.' };
          return { ok: true };
        })) isValid = false;
      }

      // Validate Email
      const fEmail = $('#field-email');
      const errEmail = fEmail ? $('.field-error', fEmail) : null;
      if (fEmail && errEmail) {
        if (!validateField(fEmail, errEmail, () => {
          const val = inputEmail.value.trim();
          if (!val) return { ok: false, msg: 'Work email address is required.' };
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(val)) return { ok: false, msg: 'Please enter a valid work email.' };
          return { ok: true };
        })) isValid = false;
      }

      // Validate WhatsApp
      const fWhatsapp = $('#field-whatsapp');
      const errWhatsapp = fWhatsapp ? $('.field-error', fWhatsapp) : null;
      if (fWhatsapp && errWhatsapp) {
        if (!validateField(fWhatsapp, errWhatsapp, () => {
          const val = inputWhatsapp ? inputWhatsapp.value.trim() : '';
          if (!val) return { ok: false, msg: 'WhatsApp phone number is required.' };
          if (val.replace(/[^0-9]/g, '').length < 8) return { ok: false, msg: 'Please enter a valid phone number.' };
          return { ok: true };
        })) isValid = false;
      }

      // Validate Description
      const fDesc = $('#field-description');
      const errDesc = fDesc ? $('.field-error', fDesc) : null;
      if (fDesc && errDesc) {
        if (!validateField(fDesc, errDesc, () => {
          const val = inputDescription.value.trim();
          if (!val) return { ok: false, msg: 'Project scope & description is required.' };
          if (val.length < 15) return { ok: false, msg: 'Please provide at least 15 characters describing your project.' };
          return { ok: true };
        })) isValid = false;
      }

      if (!isValid) return;

      // Extract form values
      const name = inputName.value.trim();
      const brand = inputBrand.value.trim();
      const email = inputEmail.value.trim();
      const whatsapp = inputWhatsapp ? inputWhatsapp.value.trim() : 'N/A';
      const projectType = ($('input[name="projectType"]:checked') || {}).value || 'Strategic Website Design & Development';
      const description = inputDescription.value.trim();
      const dateSubmitted = new Date().toUTCString();

      // Show submission state
      submitBtn.classList.add('is-submitting');

      // 1. Post to Server-Side Inquiries Storage (Node.js API)
      fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          brand,
          email,
          whatsapp,
          projectType,
          budget: 'To be discussed on discovery call',
          description
        })
      })
      .then(res => res.json())
      .then(data => {
        console.log('[TAVRO STUDIO] Inquiry saved to server:', data);
      })
      .catch(err => {
        console.warn('[TAVRO STUDIO] Server inquiry save fallback:', err);
      });

      setTimeout(() => {
        submitBtn.classList.remove('is-submitting');

        // Compile Structured Agency Brief Manifest
        const manifest = 
`=============================================================
TAVRO STUDIO // CLIENT INQUIRY MANIFEST
=============================================================
Date Submitted: ${dateSubmitted}
Client Name:    ${name}
Brand/Company:  ${brand}
Contact Email:  ${email}
WhatsApp:       ${whatsapp}
Project Type:   ${projectType}
Pricing/Scope:  To be discussed on discovery call
-------------------------------------------------------------
PROJECT SCOPE & REQUIREMENTS:
${description}
=============================================================
Direct Dispatch Target: dineshreddy02a@gmail.com
WhatsApp Dispatch:     +91 6301422287
Protocol Status:       COMPILED & REGISTERED
=============================================================`;

        if (modalManifestText) modalManifestText.textContent = manifest;

        // WhatsApp direct link formulation
        const waCleanNumber = '916301422287';
        const waMsg = `*New Project Inquiry — TAVRO STUDIO*\n\n*Name:* ${name}\n*Brand:* ${brand}\n*Email:* ${email}\n*WhatsApp:* ${whatsapp}\n*Project Type:* ${projectType}\n\n*Description:*\n${description}`;
        const waUrl = `https://wa.me/${waCleanNumber}?text=${encodeURIComponent(waMsg)}`;
        
        const modalWhatsAppBtn = $('#modalWhatsAppBtn');
        if (modalWhatsAppBtn) modalWhatsAppBtn.href = waUrl;

        // Trigger pre-formatted mailto link
        const subject = encodeURIComponent(`New Project Inquiry: ${brand} — ${projectType}`);
        const body = encodeURIComponent(manifest);
        const mailtoUrl = `mailto:dineshreddy02a@gmail.com?subject=${subject}&body=${body}`;

        const modalEmailBtn = $('#modalEmailBtn');
        if (modalEmailBtn) modalEmailBtn.href = mailtoUrl;

        // Open modal
        if (inquiryModal) {
          inquiryModal.classList.add('is-open');
          if (lenis) lenis.stop();
        }

        const link = document.createElement('a');
        link.href = mailtoUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      }, 550);
    });
  }

  // Live Project Previews Notice
  $$('.preview-link-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const client = btn.dataset.client || 'Client';
      console.log(`[TAVRO STUDIO] Opening production flagship for ${client}.`);
    });
  });

  // ---------- Preloader & Studio Enter ----------
  const loader = $('#loader');
  const loadPct = $('#loadPct');
  const loadFill = $('#loadFill');

  function enter(withSound) {
    if (S.entered) return;
    S.entered = true;
    if (withSound) Sound.set(true);
    if (loader) loader.classList.add('is-out');
    document.body.classList.remove('is-locked');
    html.classList.add('is-entered');
    if (lenis) lenis.start();
    measure();
    setTimeout(() => {
      if (loader) loader.remove();
    }, 1300);
  }

  $$('[data-enter]').forEach((b) => {
    b.addEventListener('click', () => enter(b.dataset.enter === 'sound'));
  });

  // Fast Synthetic Loader Simulation (Responsive, Instant)
  let loadProgress = 0;
  const loadInterval = setInterval(() => {
    loadProgress += Math.floor(Math.random() * 18 + 10);
    if (loadProgress >= 100) {
      loadProgress = 100;
      clearInterval(loadInterval);
      if (loadPct) loadPct.textContent = '100';
      if (loadFill) loadFill.style.width = '100%';
      if (loader) loader.classList.add('is-ready');
      const soundBtn = $('[data-enter="sound"]');
      if (soundBtn && typeof soundBtn.focus === 'function' && !S.entered) soundBtn.focus({ preventScroll: true });
    } else {
      if (loadPct) loadPct.textContent = String(loadProgress);
      if (loadFill) loadFill.style.width = `${loadProgress}%`;
    }
  }, 40);

  // ---------- Main RequestAnimationFrame Loop ----------
  buildWorld();
  measure();

  window.addEventListener('resize', () => {
    clearTimeout(measure.t);
    measure.t = setTimeout(measure, 100);
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(measure);
  }
  window.addEventListener('load', measure);

  let last = performance.now();
  function loop(now) {
    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(loop);
    }
    step(now);
  }

  function step(now) {
    const dt = Math.min(64, now - last);
    last = now;

    if (lenis) lenis.raf(now);
    const y = window.scrollY;
    S.vel = lerp(S.vel, y - S.y, 0.3);
    S.y = y;
    S.t = now / 1000;

    if (!fine) {
      S.mx = Math.sin(S.t * 0.4) * 0.3;
      S.my = Math.cos(S.t * 0.3) * 0.2;
    }
    S.smx = lerp(S.smx, S.mx, 0.07);
    S.smy = lerp(S.smy, S.my, 0.07);

    updateStory();
    updateWork();
    updateAbout();
    updateMarquee(dt);
    updateServices();
    updateProcess();
    updatePortal();
    updateHud();
    Sound.update();
  }

  // Private Admin Access Shortcuts (For Studio Owner Only)
  // 1. Secret keyboard shortcut: Ctrl + Shift + A (or Cmd + Shift + A)
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      window.open('/admin', '_blank');
    }
  });

  // 2. Secret triple-click on footer copyright notice
  const legalMark = $('#legalMark');
  if (legalMark) {
    let clickCount = 0;
    let clickTimer = null;
    legalMark.addEventListener('click', () => {
      clickCount++;
      clearTimeout(clickTimer);
      if (clickCount >= 3) {
        clickCount = 0;
        window.open('/admin', '_blank');
      } else {
        clickTimer = setTimeout(() => { clickCount = 0; }, 600);
      }
    });
  }

  if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
    window.requestAnimationFrame(loop);
  }

})();
