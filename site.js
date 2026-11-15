/* Maheen's Birthday Universe — shared effects and navigation. No dependencies. */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const palette = ['#ff9dca','#ffe3a0','#bba3ff','#88e7db','#ffffff','#f6ad8c'];
  const bg = document.getElementById('birthday-sky');
  const canvas = document.getElementById('party-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let particles = [];
  let animating = false;
  let dpr = 1;

  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const random = (a, b) => Math.random() * (b - a) + a;

  function sizeCanvas() {
    if (!canvas || !ctx) return;
    dpr = clamp(window.devicePixelRatio || 1, 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  sizeCanvas();
  window.addEventListener('resize', sizeCanvas, { passive: true });

  function seedRandom(seed) {
    return () => {
      seed |= 0;
      seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  if (bg) {
    const rng = seedRandom(16112026);
    for (let i = 0; i < 64; i++) {
      const star = document.createElement('span');
      star.className = 'sky-star';
      star.style.left = `${rng() * 100}%`;
      star.style.top = `${rng() * 100}%`;
      star.style.width = star.style.height = `${1 + rng() * 3}px`;
      star.style.opacity = `${0.15 + rng() * 0.62}`;
      star.style.animationDelay = `${rng() * 7}s`;
      star.style.animationDuration = `${2.6 + rng() * 4}s`;
      bg.appendChild(star);
    }
    const positions = [
      { x: '-1%', y: '16%', s: '0.98', c: 'pink', d:'-1s' },
      { x: '7%', y: '64%', s: '0.64', c: 'yellow', d:'-4s' },
      { x: '91%', y: '10%', s: '0.86', c: 'lavender', d:'-2s' },
      { x: '96%', y: '65%', s: '0.63', c: 'teal', d:'-5s' },
      { x: '22%', y: '86%', s: '0.39', c: 'pink', d:'-3s' },
      { x: '79%', y: '86%', s: '0.40', c: 'yellow', d:'-6s' }
    ];
    positions.forEach(p => {
      const balloon = document.createElement('div');
      balloon.className = `sky-balloon sky-balloon--${p.c}`;
      balloon.style.left = p.x;
      balloon.style.top = p.y;
      balloon.style.setProperty('--scale', p.s);
      balloon.style.animationDelay = p.d;
      balloon.innerHTML = '<i aria-hidden="true"></i>';
      balloon.setAttribute('aria-hidden', 'true');
      bg.appendChild(balloon);
    });
  }

  function drawFrame() {
    if (!ctx) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles = particles.filter(p => p.life > 0);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.99;
      p.vy += p.gravity;
      p.rot += p.spin;
      p.life -= 1;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = clamp(p.life / p.maxLife, 0, 1);
      ctx.fillStyle = p.color;
      if (p.circle) {
        ctx.beginPath();
        ctx.arc(0, 0, p.r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.r, -p.r / 2, p.r * 2.3, p.r);
      }
      ctx.restore();
    }
    if (particles.length) requestAnimationFrame(drawFrame);
    else animating = false;
  }
  function confetti(x = window.innerWidth / 2, y = window.innerHeight / 3, count = 100, mode = 'burst') {
    if (!ctx || reduceMotion) return;
    for (let i = 0; i < Math.min(count, 220); i++) {
      const angle = mode === 'rain' ? Math.PI / 2 + random(-0.6, 0.6) : random(0, Math.PI * 2);
      const speed = mode === 'rain' ? random(1, 4) : random(2.1, 9.8);
      const life = Math.round(random(55, 115));
      particles.push({
        x: x + random(-10, 10), y: y + random(-10, 10),
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - (mode === 'rain' ? 0 : 1),
        gravity: random(0.065, 0.13), spin: random(-0.19, 0.19), rot: random(0, 6),
        r: random(2.4, 5.6), life, maxLife: life, circle: Math.random() < .35,
        color: palette[Math.floor(random(0, palette.length))]
      });
    }
    if (!animating) { animating = true; requestAnimationFrame(drawFrame); }
  }
  window.BirthdayFX = {
    confetti,
    fireworks() {
      for (let i=0; i<5; i++) {
        window.setTimeout(() => confetti(random(window.innerWidth*.15, window.innerWidth*.85),
          random(window.innerHeight*.14, window.innerHeight*.64), 88), i * 240);
      }
    }
  };

  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.getElementById('main-nav');
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const open = mainNav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        mainNav.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
  const page = document.body.dataset.page;
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.dataset.page === page) {
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');
    }
  });
  document.querySelectorAll('a[href$=".html"]').forEach(link => {
    link.addEventListener('click', evt => {
      if (evt.ctrlKey || evt.metaKey || evt.shiftKey || evt.altKey || evt.button !== 0) return;
      const dest = link.getAttribute('href');
      if (!dest || dest.startsWith('http') || dest.startsWith('#')) return;
      evt.preventDefault();
      document.body.classList.add('page-exiting');
      window.setTimeout(() => { window.location.href = dest; }, reduceMotion ? 0 : 210);
    });
  });

  document.querySelectorAll('[data-confetti]').forEach(btn => {
    btn.addEventListener('click', () => {
      const r = btn.getBoundingClientRect();
      confetti(r.left + r.width / 2, r.top + r.height / 2, 80);
    });
  });
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = String(new Date().getFullYear()); });

  // Birthday soundtrack. "On" is the default user preference.
  // Modern mobile browsers may require an initial touch before allowing audible playback.
  const musicBtn = document.getElementById('music-toggle');
  const audio = document.getElementById('birthday-bgm');
  const musicPrefKey = 'maheen-birthday-music-preference';
  const musicTimeKey = 'maheen-birthday-music-position';
  const getStored = (which, key) => { try { return window[which].getItem(key); } catch (err) { return null; } };
  const setStored = (which, key, value) => { try { window[which].setItem(key, String(value)); } catch (err) {} };
  let wantsMusic = getStored('localStorage', musicPrefKey) !== 'off';

  function showMusicStatus(label, playing) {
    if (!musicBtn) return;
    musicBtn.setAttribute('aria-pressed', String(playing));
    musicBtn.classList.toggle('is-playing', playing);
    musicBtn.classList.toggle('needs-tap', label === 'Tap for music');
    const text = musicBtn.querySelector('.music-text');
    if (text) text.textContent = label;
    musicBtn.setAttribute('aria-label', playing ? 'Turn off birthday music' :
      wantsMusic ? 'Play birthday music' : 'Turn on birthday music');
  }

  if (audio && musicBtn) {
    audio.loop = true;
    audio.volume = 0.32; // gentle background volume
    const savedTime = Number(getStored('sessionStorage', musicTimeKey));
    if (Number.isFinite(savedTime) && savedTime > 0) {
      audio.addEventListener('loadedmetadata', () => {
        if (audio.duration > 0) {
          try { audio.currentTime = savedTime % audio.duration; } catch (err) {}
        }
      }, { once: true });
    }
    let starting = false;
    async function startMusic() {
      if (!wantsMusic || starting || !audio.paused) return;
      starting = true;
      try {
        await audio.play();
        showMusicStatus('Music on', true);
      } catch (err) {
        // Autoplay with sound is often blocked until the visitor taps the page.
        showMusicStatus('Tap for music', false);
      } finally {
        starting = false;
      }
    }
    function stopMusic() {
      audio.pause();
      wantsMusic = false;
      setStored('localStorage', musicPrefKey, 'off');
      showMusicStatus('Music off', false);
    }
    musicBtn.addEventListener('click', () => {
      if (!audio.paused) { stopMusic(); return; }
      wantsMusic = true;
      setStored('localStorage', musicPrefKey, 'on');
      startMusic();
    });
    // If sound was initially blocked, the visitor's first natural tap unlocks it.
    function unlockOnInteraction(event) {
      if (!wantsMusic || !audio.paused || event.target.closest?.('#music-toggle')) return;
      startMusic();
    }
    document.addEventListener('pointerdown', unlockOnInteraction, { passive: true, capture: true });
    document.addEventListener('click', unlockOnInteraction, { capture: true });
    document.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') unlockOnInteraction(event);
    }, { capture: true });
    audio.addEventListener('playing', () => showMusicStatus('Music on', true));
    audio.addEventListener('pause', () => {
      if (!wantsMusic) showMusicStatus('Music off', false);
    });
    window.addEventListener('pagehide', () => {
      setStored('sessionStorage', musicTimeKey, audio.currentTime || 0);
    });
    if (wantsMusic) {
      showMusicStatus('Tap for music', false);
      if (audio.paused) startMusic(); // immediate autoplay attempt on every page
      else showMusicStatus('Music on', true);
    } else {
      audio.pause();
      showMusicStatus('Music off', false);
    }
  }
})();


/* home page features */
if (document.body.dataset.page === "home") {
(() => {
  const days = document.getElementById('count-days');
  const hours = document.getElementById('count-hours');
  const minutes = document.getElementById('count-minutes');
  const seconds = document.getElementById('count-seconds');
  const status = document.getElementById('countdown-status');
  // Local midnight on November 16. This works offline in the visitor's local timezone.
  const birthday = new Date(2026, 10, 16, 0, 0, 0);
  const end = new Date(2026, 10, 17, 0, 0, 0);
  function tick() {
    const now = new Date();
    const delta = Math.max(0, birthday - now);
    const pad = n => String(n).padStart(2, '0');
    days.textContent = pad(Math.floor(delta / 86400000));
    hours.textContent = pad(Math.floor((delta / 3600000) % 24));
    minutes.textContent = pad(Math.floor((delta / 60000) % 60));
    seconds.textContent = pad(Math.floor((delta / 1000) % 60));
    if (now >= birthday && now < end) status.textContent = 'The big day is here! Happy Birthday, Maheen! ✨';
    else if (now >= end) status.textContent = 'The birthday magic never has to end. ✨';
    else status.textContent = 'Counting every sparkle until your special day';
  }
  tick();
  window.setInterval(tick, 1000);
  const star = document.getElementById('magic-star');
  const note = document.getElementById('magic-note');
  if (star) star.addEventListener('click', () => {
    note.textContent = 'Psst… a little extra magic just for Maheen. ✨';
    window.BirthdayFX?.confetti(window.innerWidth / 2, window.innerHeight * .43, 110);
  });
})();

}

/* wishes page features */
if (document.body.dataset.page === "wishes") {
(() => {
  const envelopes = document.querySelectorAll('.wish-envelope');
  envelopes.forEach(env => {
    env.addEventListener('click', () => {
      const open = env.classList.toggle('is-open');
      env.setAttribute('aria-expanded', String(open));
      if (open) {
        const r = env.getBoundingClientRect();
        window.BirthdayFX?.confetti(r.left + r.width/2, r.top + r.height/2, 30);
      }
    });
  });
  const key = 'maheen-birthday-2026-wishes';
  const form = document.getElementById('wish-form');
  const textarea = document.getElementById('wish-message');
  const list = document.getElementById('wish-list');
  const count = document.getElementById('wish-char-count');
  const empty = document.getElementById('wish-empty');
  const total = document.getElementById('wish-total');
  const toast = document.getElementById('wish-feedback');
  let wishes = [];
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    if (Array.isArray(saved)) wishes = saved.filter(v => typeof v === 'string').slice(0, 30);
  } catch (e) { /* Private mode may disallow storage. */ }
  function persist() { try { localStorage.setItem(key, JSON.stringify(wishes)); } catch (e) {} }
  function render() {
    list.replaceChildren();
    empty.hidden = wishes.length > 0;
    total.textContent = `${wishes.length} ${wishes.length === 1 ? 'wish' : 'wishes'} saved in this browser`;
    wishes.forEach((wish, i) => {
      const li = document.createElement('li');
      li.className = 'saved-wish';
      const span = document.createElement('span');
      span.textContent = wish;
      const remove = document.createElement('button');
      remove.className = 'delete-wish';
      remove.type = 'button';
      remove.textContent = '×';
      remove.setAttribute('aria-label', `Delete wish ${i + 1}`);
      remove.addEventListener('click', () => { wishes.splice(i, 1); persist(); render(); });
      li.append(span, remove);
      list.appendChild(li);
    });
  }
  textarea.addEventListener('input', () => { count.textContent = String(textarea.value.length); });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const value = textarea.value.trim();
    if (!value) { textarea.focus(); return; }
    wishes.unshift(value.slice(0, 180));
    wishes = wishes.slice(0, 30);
    persist(); render();
    textarea.value = ''; count.textContent = '0';
    toast.textContent = 'Your wish was tucked safely into the jar ✨';
    const r = form.getBoundingClientRect();
    window.BirthdayFX?.confetti(r.left + r.width/2, Math.max(80, r.top + 60), 90);
  });
  render();
})();

}

/* cake page features */
if (document.body.dataset.page === "cake") {
(() => {
  const candles = Array.from(document.querySelectorAll('.candle'));
  const lightBtn = document.getElementById('light-candles');
  const blowBtn = document.getElementById('blow-candles');
  const resetBtn = document.getElementById('reset-cake');
  const message = document.getElementById('cake-message');
  const cake = document.getElementById('cake-sculpture');
  function update() {
    const lit = candles.filter(c => c.classList.contains('is-lit')).length;
    blowBtn.disabled = lit === 0;
    lightBtn.disabled = lit === candles.length;
    resetBtn.disabled = lit === 0;
    candles.forEach((c,i) => c.setAttribute('aria-label', `${c.classList.contains('is-lit') ? 'Blow out' : 'Light'} candle ${i+1}`));
  }
  function lightAll() {
    candles.forEach(c => c.classList.add('is-lit'));
    cake.classList.remove('is-blown');
    message.textContent = 'Now close your eyes, make a wish… and blow them out! ✨';
    update();
  }
  function blowAll() {
    if (!candles.some(c => c.classList.contains('is-lit'))) return;
    candles.forEach(c => c.classList.remove('is-lit'));
    cake.classList.add('is-blown');
    message.textContent = 'Your wish is on its way to the stars, Maheen! 🎂';
    window.BirthdayFX?.fireworks();
    update();
  }
  lightBtn.addEventListener('click', lightAll);
  blowBtn.addEventListener('click', blowAll);
  resetBtn.addEventListener('click', () => {
    candles.forEach(c => c.classList.remove('is-lit'));
    cake.classList.remove('is-blown');
    message.textContent = 'A birthday wish starts with a little light.';
    update();
  });
  candles.forEach(c => c.addEventListener('click', () => {
    c.classList.toggle('is-lit');
    cake.classList.remove('is-blown');
    const lit = candles.filter(v => v.classList.contains('is-lit')).length;
    message.textContent = lit === 5 ? 'All five candles are glowing! Make your wish. ✨' : 'A little more birthday magic…';
    update();
  }));
  update();
})();

}

/* surprises page features */
if (document.body.dataset.page === "surprises") {
(() => {
  const cards = Array.from(document.querySelectorAll('.present-card'));
  const opened = new Set();
  const count = document.getElementById('gift-count');
  const complete = document.getElementById('gift-complete');
  cards.forEach(card => {
    const button = card.querySelector('.gift-button');
    const reveal = card.querySelector('.gift-reveal');
    const id = card.dataset.gift;
    button.addEventListener('click', () => {
      if (opened.has(id)) return;
      opened.add(id);
      card.classList.add('is-open');
      button.setAttribute('aria-expanded', 'true');
      button.setAttribute('aria-label', `Opened ${button.dataset.name}`);
      reveal.hidden = false;
      count.textContent = `${opened.size} / 3 surprises opened`;
      const r = button.getBoundingClientRect();
      window.BirthdayFX?.confetti(r.left + r.width/2, r.top + r.height/2, 100);
      if (opened.size === cards.length) {
        complete.hidden = false;
        window.setTimeout(() => window.BirthdayFX?.confetti(window.innerWidth/2, window.innerHeight*.35, 155), 350);
      }
    });
  });
})();

}

/* finale page features */
if (document.body.dataset.page === "finale") {
(() => {
  const celebrateBtn = document.getElementById('celebrate-btn');
  const downloadBtn = document.getElementById('download-card');
  const feedback = document.getElementById('finale-feedback');
  const paper = document.getElementById('letter-paper');
  celebrateBtn.addEventListener('click', () => {
    window.BirthdayFX?.fireworks();
    paper.classList.add('is-glowing');
    feedback.textContent = 'The sky is cheering for you, Maheen! ✨';
    window.setTimeout(() => paper.classList.remove('is-glowing'), 1800);
  });

  function roundRect(ctx,x,y,w,h,r) {
    ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();
  }
  function star(ctx, x, y, size, color) {
    ctx.fillStyle=color; ctx.beginPath();
    for (let i=0;i<10;i++) {
      const angle = i*Math.PI/5-Math.PI/2;
      const r = i%2===0 ? size : size*.43;
      const xx=x+Math.cos(angle)*r, yy=y+Math.sin(angle)*r;
      if(i===0)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy);
    }
    ctx.closePath();ctx.fill();
  }
  function balloon(ctx, x, y, fill, scale=1) {
    ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
    ctx.strokeStyle='rgba(255,255,255,.38)';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(0,61);ctx.bezierCurveTo(17,104,-17,134,0,176);ctx.stroke();
    ctx.fillStyle=fill;ctx.beginPath();ctx.ellipse(0,0,49,65,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.moveTo(-8,61);ctx.lineTo(8,61);ctx.lineTo(0,75);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.36)';ctx.beginPath();ctx.ellipse(-17,-27,9,20,-.5,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
  downloadBtn.addEventListener('click', () => {
    try {
      const c = document.createElement('canvas'); c.width=1200;c.height=1500;
      const ctx=c.getContext('2d');
      // Matching pastel keepsake card — drawn locally, no external resources.
      const gradient=ctx.createLinearGradient(0,0,1200,1500);
      gradient.addColorStop(0,'#fff9f4'); gradient.addColorStop(.5,'#ffe8ee'); gradient.addColorStop(1,'#f8edf7');
      ctx.fillStyle=gradient; ctx.fillRect(0,0,1200,1500);
      const glow=ctx.createRadialGradient(550,300,10,550,300,800);
      glow.addColorStop(0,'rgba(255,255,255,.64)'); glow.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle=glow;ctx.fillRect(0,0,1200,1500);
      // Paper panel with a double line border.
      ctx.fillStyle='#fffefa'; roundRect(ctx,88,112,1024,1270,52);
      ctx.strokeStyle='#eccbd7'; ctx.lineWidth=3; ctx.strokeRect(114,138,972,1218);
      ctx.strokeStyle='#f6e4e8'; ctx.lineWidth=2; ctx.strokeRect(132,156,936,1182);
      function flower(x,y,size,petal,core) {
        ctx.save();ctx.translate(x,y);ctx.fillStyle=petal;
        for(let i=0;i<6;i++) {ctx.save();ctx.rotate((i*Math.PI)/3);ctx.beginPath();ctx.ellipse(0,-size*.56,size*.32,size*.48,0,0,Math.PI*2);ctx.fill();ctx.restore();}
        ctx.fillStyle=core;ctx.beginPath();ctx.arc(0,0,size*.24,0,Math.PI*2);ctx.fill();ctx.restore();
      }
      flower(185,260,100,'#f4d0dd','#f8e5ba');
      flower(1032,330,72,'#e9d8f1','#f9e0b7');
      flower(1020,1202,93,'#f1c2d5','#f6ddae');
      flower(174,1185,64,'#dce9df','#edc6a0');
      for(let i=0;i<28;i++){
        const x=175+(i*137)%845,y=207+(i*211)%1023;
        star(ctx,x,y,i%4===0?9:5,i%2===0?'#dfb3c2':'#e3cfa9');
      }
      ctx.textAlign='center';
      ctx.fillStyle='#ac7891';ctx.font='bold 27px Arial';
      ctx.fillText('SIXTEENTH OF NOVEMBER  •  2026',600,380);
      ctx.fillStyle='#68485b';ctx.font='normal 78px Georgia';
      ctx.fillText('Happy Birthday',600,552);
      ctx.fillStyle='#bd7296';ctx.font='italic 166px Georgia';
      ctx.fillText('Maheen',600,765);
      ctx.fillStyle='#d7a2b7';ctx.font='normal 52px Georgia';
      ctx.fillText('♡   ✿   ♡',600,864);
      ctx.fillStyle='#775d6d';ctx.font='33px Georgia';
      ['May your days be filled with little wonders,',
       'sweet surprises, beautiful memories,',
       'and the happiness you deserve.'].forEach((line,i)=>ctx.fillText(line,600,952+i*56));
      ctx.fillStyle='#a76988';ctx.font='italic 33px Georgia';
      ctx.fillText('The world is lovelier with you in it.',600,1192);
      ctx.fillStyle='#a98195';ctx.font='bold 20px Arial';
      ctx.fillText('A LITTLE WORLD OF WISHES, MADE JUST FOR YOU',600,1294);
      const link=document.createElement('a');link.download='Happy_Birthday_Maheen_2026.png';link.href=c.toDataURL('image/png');
      document.body.appendChild(link);link.click();link.remove();
      feedback.textContent='Your birthday card is ready! 💌';
    } catch (e) {
      feedback.textContent='The card could not be saved in this browser.';
    }
  });
})();

}
