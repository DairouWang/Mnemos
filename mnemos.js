// Mnemos v2.0 - Timeline Memory Visualization Engine
// Pan, zoom, temporal focus, event weight, parallax depth, sparse years
import { TIME_RANGE, historicalEvents, personalEvents } from './data.js';

class Mnemos {
  constructor() {
    this.canvas = document.getElementById('main-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container = document.getElementById('canvas-container');

    // Dimensions
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Timeline config
    this.timeRange = TIME_RANGE;
    this.yearCount = this.timeRange.end - this.timeRange.start + 1;

    // Layout – vertical breathing space (timeline never touches top/bottom)
    this.padding = { left: 60, right: 60 };
    this.mainAxisY = this.height * 0.5;
    this.verticalExtent = 0.28;

    // Time scale: base width per year; actual width = base * zoomScale
    this.baseYearWidth = (this.width - this.padding.left - this.padding.right) / (this.yearCount - 1);
    this.yearWidth = this.baseYearWidth;
    this.zoomScale = 1;
    this.zoomTarget = 1;
    this.zoomMin = 0.4;
    this.zoomMax = 4.5; // Increased for wider spacing when zoomed in
    this.zoomEase = 0.08; // Balanced zoom speed - responsive but smooth
    this.zoomSensitivity = 0.003;
    this.zoomAnchorX = null;
    this.zoomAnchorIndex = null;
    this.zoomGestureUntil = 0;

    // Horizontal pan (time dragging) – physical, weighted feel
    this.panOffset = 0;
    this.panVelocity = 0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartPan = 0;
    this.lastPanX = 0;
    this.lastPanTime = 0;
    this.panFriction = 0.92;
    this.panDecay = 0.96;

    // Temporal focus – default center year, subtle highlight
    this.focusYear = 1890;
    this.focusIntensityBoost = 0.12;

    // Parallax depth – upper zone further (slower), lower closer (faster)
    this.parallaxUpper = 0.985;
    this.parallaxLower = 1.018;
    this.centerX = this.width * 0.5;

    // Year line cache (year, phase, flicker, events – x computed each frame from pan/zoom)
    this.yearLines = [];

    // Interaction state (hover reset while dragging)
    this.hoveredYear = null;
    this.mouseX = 0;
    this.mouseY = 0;

    // Animation
    this.time = 0;
    this.lastTime = 0;

    // Particle system for ambient effect
    this.particles = [];
    this.maxParticles = 40;

    // Event text element cache
    this.eventElements = [];

    // Smooth transitions – slower for breathing feel
    this.transitionSpeed = 0.04;
    this.currentIntensities = {};
    this.currentScales = {};

    this.init();
  }
  
  init() {
    this.resize();
    this.createYearLines();
    this.centerOnFocusYear();
    this.initParticles();
    this.bindEvents();
    this.animate();
  }
  
  initParticles() {
    // Create ambient floating particles
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createParticle());
    }
  }
  
  createParticle() {
    return {
      x: Math.random() * this.width,
      y: this.mainAxisY + (Math.random() - 0.5) * this.height * this.verticalExtent * 2,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.1,
      size: 0.5 + Math.random() * 1.2,
      alpha: 0.05 + Math.random() * 0.15,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.8
    };
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    this.mainAxisY = this.height * 0.5;
    this.centerX = this.width * 0.5;
    this.baseYearWidth = (this.width - this.padding.left - this.padding.right) / (this.yearCount - 1);
    this.yearWidth = this.baseYearWidth * this.zoomScale;

    const [panMin, panMax] = this.getPanBounds();
    this.panOffset = Math.max(panMin, Math.min(panMax, this.panOffset));
  }

  // Pan bounds so timeline stays within view (no scrollbar)
  getPanBounds(yearWidth = this.yearWidth) {
    const totalWidth = (this.yearCount - 1) * yearWidth;
    const viewWidth = this.width - this.padding.left - this.padding.right;
    const maxPan = Math.max(0, totalWidth - viewWidth);
    return [0, maxPan];
  }

  // Screen x for year index (pan + zoom applied)
  getYearLineX(yearIndex) {
    return this.padding.left + yearIndex * this.yearWidth - this.panOffset;
  }

  createYearLines() {
    this.yearLines = [];

    // Create entries for ALL years (including empty ones) to preserve true time spacing
    // Empty years won't draw lines, but they occupy their temporal position
    for (let i = 0; i < this.yearCount; i++) {
      const year = this.timeRange.start + i;
      const hist = historicalEvents[year] || [];
      const personal = personalEvents[year] || [];
      const hasEvents = hist.length > 0 || personal.length > 0;

      this.yearLines.push({
        year,
        yearIndex: i,
        hasEvents,
        phase: Math.random() * Math.PI * 2,
        flickerSpeed: 0.4 + Math.random() * 1.2,
        pulseSpeed: 0.2 + Math.random() * 0.3,
        baseIntensity: 0.25 + Math.random() * 0.15,
        historicalEvents: hist,
        personalEvents: personal
      });
    }
  }
  
  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      const [panMin, panMax] = this.getPanBounds();
      this.panOffset = Math.max(panMin, Math.min(panMax, this.panOffset));
    });

    // Horizontal pan – physical drag (hover reset while dragging)
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      this.isDragging = true;
      this.hoveredYear = null;
      this.clearEventTexts();
      this.dragStartX = e.clientX;
      this.dragStartPan = this.panOffset;
      this.panVelocity = 0;
      this.lastPanX = e.clientX;
      this.lastPanTime = performance.now();
    });

    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      if (this.isDragging) {
        const dx = e.clientX - this.dragStartX;
        this.panOffset = this.dragStartPan - dx;
        const now = performance.now();
        const dt = (now - this.lastPanTime) / 1000;
        if (dt > 0) this.panVelocity = (this.lastPanX - e.clientX) / dt;
        this.lastPanX = e.clientX;
        this.lastPanTime = now;
        const [panMin, panMax] = this.getPanBounds();
        this.panOffset = Math.max(panMin, Math.min(panMax, this.panOffset));
      } else {
        this.updateHoveredYear();
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button !== 0) return;
      if (this.isDragging) {
        this.isDragging = false;
        // Keep a bit of velocity for physical feel (weighted)
        this.panVelocity *= 0.3;
      }
    });

    // Scroll zoom – mouse-centered with gesture lock (no horizontal drifting)
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      // Disable hover visuals during zoom
      this.hoveredYear = null;
      this.clearEventTexts();
      const now = performance.now();
      // Lock anchor per wheel gesture so zoom stays stable
      if (now > this.zoomGestureUntil || this.zoomAnchorX === null || this.zoomAnchorIndex === null) {
        this.zoomAnchorX = this.mouseX;
        this.zoomAnchorIndex = (this.zoomAnchorX - this.padding.left + this.panOffset) / this.yearWidth;
      }

      // Exponential zoom gives smooth continuous response and faster feel
      const factor = Math.exp(-e.deltaY * this.zoomSensitivity);
      this.zoomTarget = Math.max(this.zoomMin, Math.min(this.zoomMax, this.zoomTarget * factor));
      this.zoomGestureUntil = now + 130;
      this.panVelocity = 0;
    }, { passive: false });

    this.canvas.addEventListener('mouseleave', () => {
      if (!this.isDragging) {
        this.hoveredYear = null;
        this.clearEventTexts();
      }
    });
  }

  // Center timeline on focus year (used on load and when restoring focus feel)
  centerOnFocusYear() {
    const focusIndex = this.focusYear - this.timeRange.start;
    if (focusIndex < 0 || focusIndex >= this.yearCount) return;
    this.yearWidth = this.baseYearWidth * this.zoomScale;
    this.panOffset = this.padding.left + focusIndex * this.yearWidth - this.centerX;
    const [panMin, panMax] = this.getPanBounds();
    this.panOffset = Math.max(panMin, Math.min(panMax, this.panOffset));
  }

  // Check whether the mouse is currently over the timeline band
  isMouseWithinTimeline() {
    const extent = this.height * this.verticalExtent;
    const topBound = this.mainAxisY - extent * 0.8;
    const bottomBound = this.mainAxisY + extent * 0.8;
    const isInVerticalRange = this.mouseY >= topBound && this.mouseY <= bottomBound;
    const isInHorizontalRange = this.mouseX >= this.padding.left - 20 &&
      this.mouseX <= this.width - this.padding.right + 20;
    return isInVerticalRange && isInHorizontalRange;
  }

  // Year index used as zoom anchor – mouse position if within band, otherwise center
  getZoomAnchorYearIndex() {
    const effectiveX = this.isMouseWithinTimeline() ? this.mouseX : this.centerX;
    return (effectiveX - this.padding.left + this.panOffset) / this.yearWidth;
  }

  // Hover should stay disabled while zoom gesture/easing is active
  isZooming() {
    return this.zoomAnchorIndex !== null || Math.abs(this.zoomTarget - this.zoomScale) > 0.0008;
  }

  updateHoveredYear() {
    if (this.isDragging || this.isZooming()) return;
    let closestLine = null;
    let closestDist = Infinity;

    const extent = this.height * this.verticalExtent;
    const topBound = this.mainAxisY - extent * 0.8;
    const bottomBound = this.mainAxisY + extent * 0.8;

    const isInVerticalRange = this.mouseY >= topBound && this.mouseY <= bottomBound;
    const isInHorizontalRange = this.mouseX >= this.padding.left - 20 &&
      this.mouseX <= this.width - this.padding.right + 20;

    if (isInVerticalRange && isInHorizontalRange) {
      // Always find the closest year with events (no distance cap)
      // so hovering between years still lights up the neighborhood
      for (const line of this.yearLines) {
        if (!line.hasEvents) continue;
        const x = this.getYearLineX(line.yearIndex);
        const dist = Math.abs(this.mouseX - x);
        if (dist < closestDist) {
          closestDist = dist;
          closestLine = line;
        }
      }
    }

    if (this.hoveredYear !== closestLine) {
      this.hoveredYear = closestLine;
      this.updateEventTexts();
    }
  }
  
  updateEventTexts() {
    this.clearEventTexts();

    if (!this.hoveredYear) return;

    // Hovered year: full info (year label + event text)
    // Nearby years (±5): only year label (event nodes already glow via drawEventNodes)
    const nearbyRadius = 5;
    const hoveredLine = this.hoveredYear;
    const hoveredX = this.getYearLineX(hoveredLine.yearIndex);
    const hoveredScale = this.currentScales[hoveredLine.year] || 1.0;
    const hoveredExtent = this.height * this.verticalExtent * hoveredScale * 0.6;
    const hoveredSpacing = 50 * hoveredScale;

    // Hovered year: full label + event text
    this.showYearLabel(hoveredLine.year, hoveredX, 1.0);

    const baseYH = this.mainAxisY - 80 * hoveredScale;
    hoveredLine.historicalEvents.forEach((event, i) => {
      const y = baseYH - i * hoveredSpacing;
      const maxY = this.mainAxisY - hoveredExtent + 20;
      if (y > maxY) {
        this.showEventText(event.title, null, hoveredX, y, 'historical', i, hoveredLine.year, 1.0);
      }
    });

    const baseYP = this.mainAxisY + 80 * hoveredScale;
    hoveredLine.personalEvents.forEach((event, i) => {
      const y = baseYP + i * hoveredSpacing;
      const maxY = this.mainAxisY + hoveredExtent - 20;
      if (y < maxY) {
        this.showEventText(event.action, event.person, hoveredX, y, 'personal', i, hoveredLine.year, 1.0);
      }
    });

    // Nearby years: year label in staircase layout (farther = lower + more transparent)
    const stepHeight = 22;
    for (const line of this.yearLines) {
      if (!line.hasEvents) continue;
      const dist = Math.abs(line.year - hoveredLine.year);
      if (dist === 0 || dist > nearbyRadius) continue;
      const opacity = Math.max(0.15, 1 - dist / (nearbyRadius + 1));
      const x = this.getYearLineX(line.yearIndex);
      const yOffset = dist * stepHeight;
      this.showYearLabel(line.year, x, opacity, yOffset);
    }
  }
  
  showYearLabel(year, x, opacity = 1, yOffset = 0) {
    const label = document.createElement('div');
    label.className = 'year-label';
    label.textContent = year;
    label.style.left = x + 'px';
    label.style.top = (this.mainAxisY + 8 + yOffset) + 'px';
    label.style.opacity = '0';
    label.dataset.targetOpacity = String(opacity);
    label.dataset.yearKey = String(year);
    label.dataset.yOffset = String(yOffset);
    this.container.appendChild(label);
    this.eventElements.push(label);
    
    requestAnimationFrame(() => {
      label.style.opacity = String(opacity);
      label.style.transition = 'opacity 0.25s ease-out';
    });
  }
  
  showEventText(title, person, x, y, type, index, yearKey, opacity = 1) {
    const el = document.createElement('div');
    el.className = `event-text ${type}`;
    
    el.style.position = 'absolute';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.transform = type === 'historical'
      ? 'translate(-50%, 10px)'
      : 'translate(-50%, calc(-100% - 10px))';
    el.style.opacity = '0';
    
    if (person) {
      el.innerHTML = `<div class="person">${person}</div><div class="title">${title}</div>`;
    } else {
      el.innerHTML = `<div class="title">${title}</div>`;
    }

    el.dataset.type = type;
    el.dataset.index = String(index);
    el.dataset.yearKey = String(yearKey);
    el.dataset.targetOpacity = String(opacity);
    
    this.container.appendChild(el);
    this.eventElements.push(el);
    
    requestAnimationFrame(() => {
      el.style.opacity = String(opacity);
      el.style.transition = 'opacity 0.3s ease-out';
    });
  }

  // Keep ALL event texts locked to their node positions each frame
  positionEventTexts() {
    if (!this.hoveredYear || this.eventElements.length === 0) return;

    for (const el of this.eventElements) {
      const yearKey = Number(el.dataset.yearKey);
      const line = this.yearLines.find(l => l.year === yearKey);
      if (!line) continue;

      const x = this.getYearLineX(line.yearIndex);
      const scale = this.currentScales[yearKey] || 1.0;
      const extent = this.height * this.verticalExtent * scale * 0.6;
      const spacing = 50 * scale;

      if (el.classList.contains('year-label')) {
        const yOff = Number(el.dataset.yOffset || 0);
        el.style.left = x + 'px';
        el.style.top = (this.mainAxisY + 8 + yOff) + 'px';
        continue;
      }

      const type = el.dataset.type;
      const idx = Number(el.dataset.index || 0);
      if (type === 'historical') {
        const y = this.mainAxisY - 80 * scale - idx * spacing;
        const maxY = this.mainAxisY - extent + 20;
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.display = y > maxY ? 'block' : 'none';
      } else if (type === 'personal') {
        const y = this.mainAxisY + 80 * scale + idx * spacing;
        const maxY = this.mainAxisY + extent - 20;
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.display = y < maxY ? 'block' : 'none';
      }
    }
  }
  
  clearEventTexts() {
    this.eventElements.forEach(el => el.remove());
    this.eventElements = [];
  }
  
  animate(currentTime = 0) {
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    this.time += deltaTime;

    // Ease zoom (ease-in-out feel)
    this.zoomScale += (this.zoomTarget - this.zoomScale) * this.zoomEase;
    this.yearWidth = this.baseYearWidth * this.zoomScale;

    // Keep mouse anchor fixed while zooming (prevents left-right drifting)
    if (this.zoomAnchorIndex !== null && this.zoomAnchorX !== null) {
      this.panOffset = this.padding.left + this.zoomAnchorIndex * this.yearWidth - this.zoomAnchorX;
      const [panMin, panMax] = this.getPanBounds();
      this.panOffset = Math.max(panMin, Math.min(panMax, this.panOffset));

      const zoomSettled = Math.abs(this.zoomTarget - this.zoomScale) < 0.0008;
      if (performance.now() > this.zoomGestureUntil && zoomSettled) {
        this.zoomAnchorIndex = null;
        this.zoomAnchorX = null;
      }
    }

    // Pan velocity decay (physical, weighted)
    if (!this.isDragging && Math.abs(this.panVelocity) > 0.5) {
      this.panOffset += this.panVelocity * deltaTime * 60;
      this.panVelocity *= this.panDecay;
      const [panMin, panMax] = this.getPanBounds();
      this.panOffset = Math.max(panMin, Math.min(panMax, this.panOffset));
      if (this.panOffset <= panMin || this.panOffset >= panMax) this.panVelocity = 0;
    }

    // Keep hover fully disabled during zoom, then restore automatically
    if (this.isZooming()) {
      if (this.hoveredYear) {
        this.hoveredYear = null;
        this.clearEventTexts();
      }
    } else if (!this.isDragging) {
      this.updateHoveredYear();
    }

    this.draw();
    this.positionEventTexts();
    requestAnimationFrame((t) => this.animate(t));
  }
  
  draw() {
    const ctx = this.ctx;
    
    // Clear canvas with subtle trail effect
    ctx.fillStyle = 'rgba(12, 11, 10, 0.94)';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw ambient particles
    this.drawParticles();
    
    // Draw background glow
    this.drawBackgroundGlow();
    
    // Draw main timeline axis
    this.drawMainAxis();
    
    // Draw all year lines
    this.drawYearLines();
    
    // Draw hover energy field
    if (this.hoveredYear) {
      this.drawHoverEnergyField();
    }
  }
  
  drawParticles() {
    const ctx = this.ctx;
    const centerY = this.mainAxisY;
    const extent = this.height * this.verticalExtent;
    
    for (const p of this.particles) {
      // Update position
      p.x += p.vx;
      p.y += p.vy;
      
      // Horizontal boundary loop
      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      
      // Vertical boundary - keep within extent
      if (p.y < centerY - extent || p.y > centerY + extent) {
        p.vy *= -1;
      }
      
      // Flicker
      const flicker = Math.sin(this.time * p.speed + p.phase) * 0.5 + 0.5;
      const alpha = p.alpha * flicker;
      
      // Gold/silver particle color
      const isGold = p.phase > Math.PI;
      const color = isGold 
        ? `rgba(200, 170, 120, ${alpha})`
        : `rgba(180, 180, 190, ${alpha})`;
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }
  
  drawHoverEnergyField() {
    const ctx = this.ctx;
    const x = this.getYearLineX(this.hoveredYear.yearIndex);
    const extent = this.height * this.verticalExtent;
    
    // Vertical energy column - gold tint
    const gradient = ctx.createLinearGradient(x - 40, 0, x + 40, 0);
    gradient.addColorStop(0, 'rgba(200, 170, 100, 0)');
    gradient.addColorStop(0.5, 'rgba(200, 170, 100, 0.04)');
    gradient.addColorStop(1, 'rgba(200, 170, 100, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x - 40, this.mainAxisY - extent, 80, extent * 2);
    
    // Pulse ring at center
    const pulseRadius = 15 + Math.sin(this.time * 3) * 4;
    ctx.beginPath();
    ctx.arc(x, this.mainAxisY, pulseRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(220, 190, 130, ${0.25 + Math.sin(this.time * 4) * 0.1})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  drawBackgroundGlow() {
    const ctx = this.ctx;
    const extent = this.height * this.verticalExtent;
    
    // Central horizontal glow band - warm gold/amber with very soft edges
    const breathe = 0.2 + Math.sin(this.time * 0.25) * 0.06;
    const gradient = ctx.createLinearGradient(0, this.mainAxisY - extent * 1.5, 0, this.mainAxisY + extent * 1.5);
    gradient.addColorStop(0, 'rgba(12, 11, 10, 0)');
    gradient.addColorStop(0.15, 'rgba(18, 16, 14, 0)');
    gradient.addColorStop(0.35, `rgba(28, 24, 18, ${breathe * 0.3})`);
    gradient.addColorStop(0.5, `rgba(35, 30, 22, ${breathe * 0.6})`);
    gradient.addColorStop(0.65, `rgba(28, 24, 18, ${breathe * 0.3})`);
    gradient.addColorStop(0.85, 'rgba(18, 16, 14, 0)');
    gradient.addColorStop(1, 'rgba(12, 11, 10, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, this.mainAxisY - extent * 1.5, this.width, extent * 3);
    
    // Upper region - silver cool tone with soft fade
    const topGradient = ctx.createLinearGradient(0, this.mainAxisY - extent * 1.2, 0, this.mainAxisY);
    topGradient.addColorStop(0, 'rgba(180, 180, 190, 0)');
    topGradient.addColorStop(0.4, 'rgba(180, 180, 190, 0.015)');
    topGradient.addColorStop(1, 'rgba(180, 180, 190, 0)');
    ctx.fillStyle = topGradient;
    ctx.fillRect(0, this.mainAxisY - extent * 1.2, this.width, extent * 1.2);
    
    // Lower region - gold warm tone with soft fade
    const bottomGradient = ctx.createLinearGradient(0, this.mainAxisY, 0, this.mainAxisY + extent * 1.2);
    bottomGradient.addColorStop(0, 'rgba(200, 170, 120, 0)');
    bottomGradient.addColorStop(0.6, 'rgba(200, 170, 120, 0.015)');
    bottomGradient.addColorStop(1, 'rgba(200, 170, 120, 0)');
    ctx.fillStyle = bottomGradient;
    ctx.fillRect(0, this.mainAxisY, this.width, extent * 1.2);
  }

  drawMainAxis() {
    const ctx = this.ctx;
    const y = this.mainAxisY;
    
    // Main axis pulse - multi-layer effect
    const pulseIntensity = 0.3 + Math.sin(this.time * 0.4) * 0.08;
    const fastPulse = Math.sin(this.time * 1.5) * 0.03;
    
    // Horizontal gradient for soft edges
    const createHorizontalGradient = (alpha) => {
      const grad = ctx.createLinearGradient(0, y, this.width, y);
      grad.addColorStop(0, `rgba(200, 175, 130, 0)`);
      grad.addColorStop(0.05, `rgba(200, 175, 130, ${alpha})`);
      grad.addColorStop(0.5, `rgba(210, 185, 140, ${alpha})`);
      grad.addColorStop(0.95, `rgba(200, 175, 130, ${alpha})`);
      grad.addColorStop(1, `rgba(200, 175, 130, 0)`);
      return grad;
    };

    // Scanning highlight first (with top/bottom faded mask), then axis on top so axis stays solid
    const scanX = (this.time * 35) % (this.width + 200) - 100;
    const scanGradient = ctx.createRadialGradient(scanX, y, 0, scanX, y, 70);
    scanGradient.addColorStop(0, 'rgba(240, 220, 180, 0.15)');
    scanGradient.addColorStop(0.5, 'rgba(220, 195, 150, 0.05)');
    scanGradient.addColorStop(1, 'rgba(200, 175, 130, 0)');
    ctx.fillStyle = scanGradient;
    ctx.fillRect(scanX - 70, y - 24, 140, 48);
    // Vertical fade mask: fade out at top and bottom
    ctx.globalCompositeOperation = 'destination-in';
    const fadeGradient = ctx.createLinearGradient(scanX, y - 24, scanX, y + 24);
    fadeGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    fadeGradient.addColorStop(0.35, 'rgba(255, 255, 255, 1)');
    fadeGradient.addColorStop(0.65, 'rgba(255, 255, 255, 1)');
    fadeGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = fadeGradient;
    ctx.fillRect(scanX - 70, y - 24, 140, 48);
    ctx.globalCompositeOperation = 'source-over';

    // Main axis on top - always solid
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(this.width, y);
    ctx.strokeStyle = createHorizontalGradient((pulseIntensity + fastPulse) * 0.1);
    ctx.lineWidth = 14;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(this.width, y);
    ctx.strokeStyle = createHorizontalGradient((pulseIntensity + fastPulse) * 0.2);
    ctx.lineWidth = 5;
    ctx.stroke();
    const coreGrad = ctx.createLinearGradient(0, y, this.width, y);
    coreGrad.addColorStop(0, `rgba(230, 210, 170, 0)`);
    coreGrad.addColorStop(0.04, `rgba(230, 210, 170, ${pulseIntensity + fastPulse + 0.1})`);
    coreGrad.addColorStop(0.5, `rgba(240, 220, 180, ${pulseIntensity + fastPulse + 0.15})`);
    coreGrad.addColorStop(0.96, `rgba(230, 210, 170, ${pulseIntensity + fastPulse + 0.1})`);
    coreGrad.addColorStop(1, `rgba(230, 210, 170, 0)`);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(this.width, y);
    ctx.strokeStyle = coreGrad;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  drawYearLines() {
    for (const line of this.yearLines) {
      // Skip drawing year lines that have no events (leave empty space)
      if (!line.hasEvents) continue;
      this.drawYearLine(line);
    }
  }

  drawYearLine(line) {
    const ctx = this.ctx;
    const x = this.getYearLineX(line.yearIndex);
    const extent = this.height * this.verticalExtent;

    const isHovered = this.hoveredYear === line;
    const hoverDist = this.hoveredYear ? Math.abs(line.year - this.hoveredYear.year) : Infinity;
    const isNearHovered = this.hoveredYear && hoverDist > 0 && hoverDist <= 5;
    const isFocusYear = line.year === this.focusYear;

    // Flicker and pulse (150–300ms feel via speed); empty years still flicker
    const flicker1 = Math.sin(this.time * line.flickerSpeed + line.phase) * 0.12;
    const flicker2 = Math.sin(this.time * line.flickerSpeed * 1.7 + line.phase * 0.5) * 0.06;
    const pulse = Math.sin(this.time * line.pulseSpeed) * 0.08;
    const randomFlash = Math.random() < 0.001 ? 0.3 : 0;

    let targetIntensity = line.baseIntensity + flicker1 + flicker2 + pulse + randomFlash;
    let targetScale = 1.0;

    if (isHovered) {
      targetIntensity = 1.0;
      targetScale = 1.8;
    } else if (isNearHovered) {
      // Nearby years glow with smooth falloff (closer = brighter)
      const t = 1 - hoverDist / 6;
      targetIntensity = Math.max(targetIntensity, 0.25 + 0.45 * t);
      targetScale = 1.0 + 0.3 * t;
    } else if (this.hoveredYear) {
      // Dim all other years when hovering
      targetIntensity *= 0.12;
      targetScale = 0.7;
    } else if (isFocusYear) {
      // Temporal focus: subtle brighter presence when no hover
      targetIntensity = Math.min(1, targetIntensity + this.focusIntensityBoost);
    }
    
    // Smooth transition for intensity
    const intensityKey = line.year;
    if (this.currentIntensities[intensityKey] === undefined) {
      this.currentIntensities[intensityKey] = targetIntensity;
    }
    this.currentIntensities[intensityKey] += (targetIntensity - this.currentIntensities[intensityKey]) * this.transitionSpeed;
    const intensity = this.currentIntensities[intensityKey];
    
    // Smooth transition for scale
    const scaleKey = line.year;
    if (this.currentScales[scaleKey] === undefined) {
      this.currentScales[scaleKey] = targetScale;
    }
    this.currentScales[scaleKey] += (targetScale - this.currentScales[scaleKey]) * this.transitionSpeed;
    const scale = this.currentScales[scaleKey];
    
    // Line width based on scale
    let lineWidth = scale * 1.2;
    
    // Calculate vertical bounds with scale
    const scaledExtent = extent * scale * 0.6;
    const topY = this.mainAxisY - scaledExtent;
    const bottomY = this.mainAxisY + scaledExtent;
    
    // Outer glow - gold/silver blend with gradient
    if (intensity > 0.15) {
      const outerGlowGrad = ctx.createLinearGradient(x, topY, x, bottomY);
      outerGlowGrad.addColorStop(0, `rgba(200, 180, 140, 0)`);
      outerGlowGrad.addColorStop(0.2, `rgba(200, 180, 140, ${intensity * 0.04})`);
      outerGlowGrad.addColorStop(0.5, `rgba(200, 180, 140, ${intensity * 0.06})`);
      outerGlowGrad.addColorStop(0.8, `rgba(200, 180, 140, ${intensity * 0.04})`);
      outerGlowGrad.addColorStop(1, `rgba(200, 180, 140, 0)`);
      
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x, bottomY);
      ctx.strokeStyle = outerGlowGrad;
      ctx.lineWidth = lineWidth * 10;
      ctx.stroke();
    }
    
    // Middle glow with gradient
    if (intensity > 0.2) {
      const midGlowGrad = ctx.createLinearGradient(x, topY, x, bottomY);
      midGlowGrad.addColorStop(0, `rgba(210, 190, 150, 0)`);
      midGlowGrad.addColorStop(0.15, `rgba(210, 190, 150, ${intensity * 0.08})`);
      midGlowGrad.addColorStop(0.5, `rgba(210, 190, 150, ${intensity * 0.12})`);
      midGlowGrad.addColorStop(0.85, `rgba(210, 190, 150, ${intensity * 0.08})`);
      midGlowGrad.addColorStop(1, `rgba(210, 190, 150, 0)`);
      
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x, bottomY);
      ctx.strokeStyle = midGlowGrad;
      ctx.lineWidth = lineWidth * 4;
      ctx.stroke();
    }
    
    // Main line - gradient with soft fade at ends
    const lineGradient = ctx.createLinearGradient(x, topY, x, bottomY);
    lineGradient.addColorStop(0, `rgba(180, 175, 165, 0)`);
    lineGradient.addColorStop(0.1, `rgba(200, 190, 170, ${intensity * 0.15})`);
    lineGradient.addColorStop(0.3, `rgba(220, 200, 160, ${intensity * 0.5})`);
    lineGradient.addColorStop(0.5, `rgba(240, 220, 180, ${intensity * 0.8})`);
    lineGradient.addColorStop(0.7, `rgba(220, 200, 160, ${intensity * 0.5})`);
    lineGradient.addColorStop(0.9, `rgba(200, 190, 170, ${intensity * 0.15})`);
    lineGradient.addColorStop(1, `rgba(180, 175, 165, 0)`);
    
    ctx.beginPath();
    ctx.moveTo(x, topY);
    ctx.lineTo(x, bottomY);
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    
    // Axis intersection emphasis
    const crossGlow = intensity * 0.5;
    const crossRadius = 2 + intensity * 2 * scale;
    ctx.beginPath();
    ctx.arc(x, this.mainAxisY, crossRadius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(240, 220, 180, ${crossGlow})`;
    ctx.fill();
    
    // Draw event nodes
    this.drawEventNodes(line, 'historical', intensity, isHovered, scale);
    this.drawEventNodes(line, 'personal', intensity, isHovered, scale);
  }

  drawEventNodes(line, type, intensity, isHovered, scale) {
    const ctx = this.ctx;
    const lineX = this.getYearLineX(line.yearIndex);
    const events = type === 'historical' ? line.historicalEvents : line.personalEvents;

    if (events.length === 0) return;

    // When hovering, only show event nodes for the hovered year and its nearby neighbors
    if (this.hoveredYear) {
      const dist = Math.abs(line.year - this.hoveredYear.year);
      if (dist > 5) return;
    }

    // Event nodes are placed directly on the year line (no horizontal offset)
    const x = lineX;

    const colors = type === 'historical'
      ? { r: 170, g: 175, b: 190, r2: 200, g2: 205, b2: 220 }
      : { r: 210, g: 175, b: 120, r2: 240, g2: 210, b2: 160 };

    const extent = this.height * this.verticalExtent * scale * 0.6;
    // Increased offset from year label: 80px instead of 35px (more breathing room)
    const baseY = type === 'historical'
      ? this.mainAxisY - 80 * scale
      : this.mainAxisY + 80 * scale;
    const direction = type === 'historical' ? -1 : 1;
    const spacing = isHovered ? 50 * scale : 35 * scale;

    events.forEach((event, i) => {
      const y = baseY + direction * i * spacing;

      const maxY = type === 'historical'
        ? this.mainAxisY - extent + 20
        : this.mainAxisY + extent - 20;
      if ((type === 'historical' && y < maxY) || (type === 'personal' && y > maxY)) {
        return;
      }

      // Event weight: node size, glow, pulse, flicker (no labels)
      const w = event.weight ?? event.intensity ?? 0.7;
      const eventIntensity = event.intensity ?? 0.7;

      const flickerAmp = 0.15 * w + 0.05;
      const pulseAmp = 0.1 * w + 0.05;
      const flicker1 = Math.sin(this.time * (1.0 + i * 0.3) + line.phase) * flickerAmp;
      const flicker2 = Math.sin(this.time * (1.8 + i * 0.2) + line.phase * 1.5) * (flickerAmp * 0.5);
      const pulse = Math.sin(this.time * 0.6 + i) * pulseAmp;

      let nodeIntensity = intensity * eventIntensity + (flicker1 + flicker2 + pulse) * (0.2 + 0.15 * w);

      if (isHovered) {
        nodeIntensity = Math.min(1, eventIntensity + 0.35);
      }

      const connGradient = ctx.createLinearGradient(x, this.mainAxisY, x, y);
      connGradient.addColorStop(0, `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${nodeIntensity * 0.08})`);
      connGradient.addColorStop(1, `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${nodeIntensity * 0.4})`);

      ctx.beginPath();
      ctx.moveTo(x, this.mainAxisY + direction * 4);
      ctx.lineTo(x, y);
      ctx.strokeStyle = connGradient;
      ctx.lineWidth = (isHovered ? 1.5 : 0.8) * scale * (0.6 + 0.4 * w);
      ctx.stroke();

      const baseRadius = (isHovered ? 5 : 3) * scale;
      const nodeRadius = baseRadius * (0.55 + 0.45 * w);

      const glowRadius = nodeRadius * (3 + 0.5 * w);
      const weightBoost = 0.75 + 0.25 * w;
      const outerGlow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
      outerGlow.addColorStop(0, `rgba(${colors.r2}, ${colors.g2}, ${colors.b2}, ${nodeIntensity * 0.25 * weightBoost})`);
      outerGlow.addColorStop(0.5, `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${nodeIntensity * 0.08 * weightBoost})`);
      outerGlow.addColorStop(1, `rgba(${colors.r}, ${colors.g}, ${colors.b}, 0)`);

      ctx.beginPath();
      ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = outerGlow;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, nodeRadius * 1.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${colors.r2}, ${colors.g2}, ${colors.b2}, ${nodeIntensity * 0.18 * weightBoost})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
      const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, nodeRadius);
      coreGradient.addColorStop(0, `rgba(255, 250, 240, ${nodeIntensity * 0.9})`);
      coreGradient.addColorStop(0.4, `rgba(${colors.r2}, ${colors.g2}, ${colors.b2}, ${nodeIntensity * 0.85})`);
      coreGradient.addColorStop(1, `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${nodeIntensity * 0.6})`);
      ctx.fillStyle = coreGradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, nodeRadius * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 250, ${nodeIntensity * 0.9})`;
      ctx.fill();

      if (isHovered) {
        const ringPhase = (this.time * 1.8 + i * 0.5) % 1;
        const ringRadius = nodeRadius + ringPhase * 12 * scale * w;
        const ringAlpha = (1 - ringPhase) * 0.35 * nodeIntensity;

        ctx.beginPath();
        ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${colors.r2}, ${colors.g2}, ${colors.b2}, ${ringAlpha})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    });
  }
}

// Utility: linear interpolation
function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  new Mnemos();
});
