/**
 * 🪐 3D Space Particle Nebula Animation (2026 Web Design Inspiration)
 * Directly inspired by the reference image with dual gold & electric blue glowing particle clouds.
 * Ultra-optimized Canvas particle system with 3D projection, depth sorting, and smooth physics.
 */
(function() {
  'use strict';

  function initSpaceCanvas() {
    let canvas = document.getElementById('space-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'space-canvas';
      document.body.insertBefore(canvas, document.body.firstChild);
    }

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Mouse & Parallax state
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let isMouseActive = false;

    // 3D rotation angles
    let angleY = 0.2;
    let angleX = -0.15;
    let targetAngleY = 0.2;
    let targetAngleX = -0.15;

    // Palette: Gold / Tangerine and Cyan / Electric Blue / White
    const COLOR_PALETTES = {
      blue: [
        'rgba(56, 189, 248, ',   // cyan / sky
        'rgba(96, 165, 250, ',   // bright blue
        'rgba(59, 130, 246, ',   // electric blue
        'rgba(129, 140, 248, ',  // indigo
        'rgba(224, 231, 255, '   // pale icy white-blue
      ],
      gold: [
        'rgba(251, 191, 36, ',   // amber gold
        'rgba(245, 158, 11, ',   // deep warm gold
        'rgba(249, 115, 22, ',   // sunset tangerine
        'rgba(253, 224, 71, ',   // bright light yellow
        'rgba(254, 215, 170, '   // apricot glow
      ],
      white: [
        'rgba(255, 255, 255, ',
        'rgba(241, 245, 249, ',
        'rgba(226, 232, 240, '
      ]
    };

    // Pre-rendered circular glowing sprites for high-performance blitting
    const spriteCache = {};

    function createParticleSprite(r, g, b, radius) {
      const key = `${r}_${g}_${b}_${radius}`;
      if (spriteCache[key]) return spriteCache[key];

      const sCanvas = document.createElement('canvas');
      const size = Math.ceil(radius * 5);
      sCanvas.width = size;
      sCanvas.height = size;
      const sCtx = sCanvas.getContext('2d');
      const half = size / 2;

      const grad = sCtx.createRadialGradient(half, half, 0, half, half, half);
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
      grad.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, 0.75)`);
      grad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, 0.25)`);
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, size, size);
      spriteCache[key] = sCanvas;
      return sCanvas;
    }

    // Pre-cache primary sprite styles
    const spriteCyan = createParticleSprite(56, 189, 248, 4);
    const spriteBlue = createParticleSprite(96, 165, 250, 4);
    const spriteGold = createParticleSprite(251, 191, 36, 4);
    const spriteOrange = createParticleSprite(249, 115, 22, 4);
    const spriteWhite = createParticleSprite(255, 255, 255, 3.5);

    // Particle storage
    const particles = [];
    const NUM_PARTICLES = 2200;

    class Particle3D {
      constructor(type) {
        this.reset(type);
      }

      reset(type) {
        this.type = type || (Math.random() < 0.48 ? 'blue' : (Math.random() < 0.9 ? 'gold' : 'star'));

        if (this.type === 'star') {
          // Distant starfield scattered widely
          const spread = 950;
          this.x = (Math.random() - 0.5) * spread * 2.2;
          this.y = (Math.random() - 0.5) * spread * 1.5;
          this.z = (Math.random() - 0.5) * spread;
          this.baseRadius = 0.8 + Math.random() * 1.2;
          this.colorFamily = 'white';
          this.sprite = spriteWhite;
          this.twinkleSpeed = 0.02 + Math.random() * 0.04;
          this.twinklePhase = Math.random() * Math.PI * 2;
          this.speedFactor = 0.15;
        } else if (this.type === 'blue') {
          // Core & central celestial cluster / sphere
          // Spherical / ellipsoidal cluster with dense center
          const u = Math.random();
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          // Shaped into an organic core
          const r = Math.pow(u, 0.6) * 170;
          this.x = r * Math.sin(phi) * Math.cos(theta);
          this.y = (r * Math.sin(phi) * Math.sin(theta)) * 0.95;
          this.z = r * Math.cos(phi);

          // Shift slightly toward center-right like in reference photo
          this.x += 120 + (Math.random() - 0.5) * 40;
          this.y += -20 + (Math.random() - 0.5) * 40;

          this.baseRadius = 1.2 + Math.random() * 2.2;
          this.sprite = Math.random() < 0.6 ? spriteCyan : spriteBlue;
          this.twinkleSpeed = 0.03 + Math.random() * 0.03;
          this.twinklePhase = Math.random() * Math.PI * 2;
          this.speedFactor = 0.9;
        } else {
          // 'gold': Trailing golden comet / outer wing / sweeping arc (like the photo)
          const angle = Math.random() * Math.PI * 1.6 - 0.8;
          const dist = 90 + Math.random() * 260;
          // Elliptical arc wrapping around the core
          const thickness = (Math.random() - 0.5) * 65;
          this.x = Math.cos(angle) * dist + 100 + thickness;
          this.y = Math.sin(angle) * (dist * 0.75) + thickness * 0.8;
          this.z = (Math.sin(angle * 2) * 110) + (Math.random() - 0.5) * 70;

          this.baseRadius = 1.1 + Math.random() * 2.0;
          this.sprite = Math.random() < 0.65 ? spriteGold : spriteOrange;
          this.twinkleSpeed = 0.03 + Math.random() * 0.04;
          this.twinklePhase = Math.random() * Math.PI * 2;
          this.speedFactor = 1.0;
        }

        // Store original positions for harmonic wave oscillation
        this.origX = this.x;
        this.origY = this.y;
        this.origZ = this.z;
        this.waveFreq = 0.8 + Math.random() * 1.4;
        this.waveAmp = 3 + Math.random() * 7;
      }

      update(time) {
        // Subtle organic breathing oscillation
        const wave = Math.sin(time * this.waveFreq + this.twinklePhase) * this.waveAmp;
        this.curX = this.x + (this.type !== 'star' ? wave * 0.5 : 0);
        this.curY = this.y + (this.type !== 'star' ? wave * 0.4 : 0);
        this.curZ = this.z + (this.type !== 'star' ? wave * 0.6 : 0);

        // Twinkle factor
        this.alpha = 0.45 + 0.45 * Math.sin(time * this.twinkleSpeed * 60 + this.twinklePhase);
      }
    }

    // Initialize particles
    for (let i = 0; i < NUM_PARTICLES; i++) {
      let t = 'blue';
      if (i < 900) t = 'blue';
      else if (i < 1850) t = 'gold';
      else t = 'star';
      particles.push(new Particle3D(t));
    }

    // Resize handling
    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    // Mouse & Touch Tracking
    function onPointerMove(e) {
      const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : width / 2);
      const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : height / 2);
      targetMouseX = (clientX - width / 2);
      targetMouseY = (clientY - height / 2);
      isMouseActive = true;
    }

    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });

    // Center offset coordinates (shifts the 3D focal center right on desktop like the photo)
    function getCenterOffsetX() {
      return width > 800 ? width * 0.62 : width * 0.5;
    }
    function getCenterOffsetY() {
      return height * 0.48;
    }

    // Animation Loop
    let lastTime = 0;
    let animId = null;
    let isTabVisible = true;

    document.addEventListener('visibilitychange', () => {
      isTabVisible = !document.hidden;
      if (isTabVisible && !animId) {
        lastTime = performance.now();
        animId = requestAnimationFrame(render);
      }
    });

    function render(now) {
      if (!isTabVisible) {
        animId = null;
        return;
      }

      animId = requestAnimationFrame(render);
      const timeSec = now * 0.001;

      // Mouse interpolation
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Subtle slow auto rotation + interactive mouse parallax
      targetAngleY = 0.2 + (mouseX / width) * 0.75 + timeSec * 0.08;
      targetAngleX = -0.15 + (mouseY / height) * 0.45;

      angleY += (targetAngleY - angleY) * 0.06;
      angleX += (targetAngleX - angleX) * 0.06;

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      // Deep space background gradient
      const bgGrad = ctx.createRadialGradient(
        getCenterOffsetX(), getCenterOffsetY(), 50,
        getCenterOffsetX(), getCenterOffsetY(), Math.max(width, height) * 0.95
      );
      // Celestial navy, deep cosmic void, rich abyss
      bgGrad.addColorStop(0, '#0a1024');
      bgGrad.addColorStop(0.35, '#070a18');
      bgGrad.addColorStop(0.7, '#04060e');
      bgGrad.addColorStop(1, '#020306');

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Perspective projection constants
      const fov = 650;
      const centerX = getCenterOffsetX();
      const centerY = getCenterOffsetY();

      // Render mode: additive blending for glowing celestial points
      ctx.globalCompositeOperation = 'lighter';

      const pCount = particles.length;
      for (let i = 0; i < pCount; i++) {
        const p = particles[i];
        p.update(timeSec);

        // 3D Rotation Y
        let rx1 = p.curX * cosY - p.curZ * sinY;
        let rz1 = p.curZ * cosY + p.curX * sinY;

        // 3D Rotation X
        let ry2 = p.curY * cosX - rz1 * sinX;
        let rz2 = rz1 * cosX + p.curY * sinX;

        // Camera distance shift
        const zDepth = rz2 + fov;
        if (zDepth <= 20) continue; // Behind camera

        const scale = fov / zDepth;
        const screenX = centerX + rx1 * scale;
        const screenY = centerY + ry2 * scale;

        // Viewport bounds check
        if (screenX < -60 || screenX > width + 60 || screenY < -60 || screenY > height + 60) {
          continue;
        }

        const rad = Math.max(0.5, p.baseRadius * scale);
        const alpha = Math.min(1, Math.max(0.12, p.alpha * (scale * 0.85)));

        ctx.globalAlpha = alpha;

        // Fast sprite blit
        const sprite = p.sprite;
        const drawSize = rad * 4;
        ctx.drawImage(
          sprite,
          screenX - drawSize / 2,
          screenY - drawSize / 2,
          drawSize,
          drawSize
        );
      }

      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';
    }

    lastTime = performance.now();
    animId = requestAnimationFrame(render);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSpaceCanvas);
  } else {
    initSpaceCanvas();
  }
})();
