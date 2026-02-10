// Mnemos - Timeline Memory Visualization Engine
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
    
    // Layout parameters - more vertical whitespace
    this.padding = { left: 60, right: 60 };
    this.mainAxisY = this.height * 0.5;
    this.verticalExtent = 0.28; // Lines only extend 28% above/below center
    
    // Year line parameters
    this.yearLines = [];
    this.yearWidth = (this.width - this.padding.left - this.padding.right) / (this.yearCount - 1);
    
    // Interaction state
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
    
    // Smooth transitions
    this.transitionSpeed = 0.12;
    this.currentIntensities = {};
    this.currentScales = {};
    
    this.init();
  }
  
  init() {
    this.resize();
    this.createYearLines();
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
    this.yearWidth = (this.width - this.padding.left - this.padding.right) / (this.yearCount - 1);
    
    // Recalculate year line positions
    this.yearLines.forEach((line, i) => {
      line.x = this.padding.left + i * this.yearWidth;
    });
  }
  
  createYearLines() {
    for (let i = 0; i < this.yearCount; i++) {
      const year = this.timeRange.start + i;
      const x = this.padding.left + i * this.yearWidth;
      
      this.yearLines.push({
        year,
        x,
        // Each line has unique phase and frequency
        phase: Math.random() * Math.PI * 2,
        flickerSpeed: 0.4 + Math.random() * 1.2,
        pulseSpeed: 0.2 + Math.random() * 0.3,
        baseIntensity: 0.25 + Math.random() * 0.15,
        // Event data
        historicalEvents: historicalEvents[year] || [],
        personalEvents: personalEvents[year] || []
      });
    }
  }
  
  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.createYearLines();
    });
    
    this.canvas.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.updateHoveredYear();
    });
    
    this.canvas.addEventListener('mouseleave', () => {
      this.hoveredYear = null;
      this.clearEventTexts();
    });
  }
  
  updateHoveredYear() {
    let closestLine = null;
    let closestDist = Infinity;
    
    // Calculate the visible vertical bounds
    const extent = this.height * this.verticalExtent;
    const topBound = this.mainAxisY - extent * 0.8;
    const bottomBound = this.mainAxisY + extent * 0.8;
    
    // Only trigger hover if mouse is within the timeline region
    const isInVerticalRange = this.mouseY >= topBound && this.mouseY <= bottomBound;
    const isInHorizontalRange = this.mouseX >= this.padding.left - 20 && 
                                 this.mouseX <= this.width - this.padding.right + 20;
    
    if (isInVerticalRange && isInHorizontalRange) {
      for (const line of this.yearLines) {
        const dist = Math.abs(this.mouseX - line.x);
        if (dist < closestDist && dist < this.yearWidth * 0.5) {
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
    
    const line = this.hoveredYear;
    const x = line.x;
    
    // Show year label
    this.showYearLabel(line.year, x);
    
    // Historical events (above)
    const topExtent = this.height * this.verticalExtent;
    let yOffset = this.mainAxisY - 60;
    line.historicalEvents.forEach((event, i) => {
      const y = yOffset - i * 45;
      if (y > this.mainAxisY - topExtent + 30) {
        this.showEventText(event.title, null, x, y, 'historical');
      }
    });
    
    // Personal events (below)
    yOffset = this.mainAxisY + 60;
    line.personalEvents.forEach((event, i) => {
      const y = yOffset + i * 45;
      if (y < this.mainAxisY + topExtent - 30) {
        this.showEventText(event.action, event.person, x, y, 'personal');
      }
    });
  }
  
  showYearLabel(year, x) {
    const label = document.createElement('div');
    label.className = 'year-label';
    label.textContent = year;
    label.style.left = x + 'px';
    label.style.top = (this.mainAxisY + 8) + 'px';
    this.container.appendChild(label);
    this.eventElements.push(label);
    
    requestAnimationFrame(() => label.classList.add('visible'));
  }
  
  showEventText(title, person, x, y, type) {
    const el = document.createElement('div');
    el.className = `event-text ${type}`;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.transform = `translate(-50%, ${type === 'historical' ? '0' : '-100%'})`;
    
    if (person) {
      el.innerHTML = `<div class="person">${person}</div><div class="title">${title}</div>`;
    } else {
      el.innerHTML = `<div class="title">${title}</div>`;
    }
    
    this.container.appendChild(el);
    this.eventElements.push(el);
    
    requestAnimationFrame(() => el.classList.add('visible'));
  }
  
  clearEventTexts() {
    this.eventElements.forEach(el => el.remove());
    this.eventElements = [];
  }
  
  animate(currentTime = 0) {
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    this.time += deltaTime;
    
    this.draw();
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
    const x = this.hoveredYear.x;
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
    
    // Outer glow - gold with soft horizontal fade
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(this.width, y);
    ctx.strokeStyle = createHorizontalGradient((pulseIntensity + fastPulse) * 0.1);
    ctx.lineWidth = 14;
    ctx.stroke();
    
    // Middle glow
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(this.width, y);
    ctx.strokeStyle = createHorizontalGradient((pulseIntensity + fastPulse) * 0.2);
    ctx.lineWidth = 5;
    ctx.stroke();
    
    // Core line - bright gold with soft edges
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
    
    // Scanning highlight moving along axis
    const scanX = (this.time * 35) % (this.width + 200) - 100;
    const scanGradient = ctx.createRadialGradient(scanX, y, 0, scanX, y, 70);
    scanGradient.addColorStop(0, 'rgba(240, 220, 180, 0.15)');
    scanGradient.addColorStop(0.5, 'rgba(220, 195, 150, 0.05)');
    scanGradient.addColorStop(1, 'rgba(200, 175, 130, 0)');
    ctx.fillStyle = scanGradient;
    ctx.fillRect(scanX - 70, y - 20, 140, 40);
  }

  drawYearLines() {
    const ctx = this.ctx;
    
    for (const line of this.yearLines) {
      this.drawYearLine(line);
    }
  }

  drawYearLine(line) {
    const ctx = this.ctx;
    const x = line.x;
    const extent = this.height * this.verticalExtent;
    
    // Calculate current line state
    const isHovered = this.hoveredYear === line;
    const isNearHovered = this.hoveredYear && 
      Math.abs(line.year - this.hoveredYear.year) <= 2 &&
      Math.abs(line.year - this.hoveredYear.year) > 0;
    
    // Calculate flicker and pulse - multi-layer randomness
    const flicker1 = Math.sin(this.time * line.flickerSpeed + line.phase) * 0.12;
    const flicker2 = Math.sin(this.time * line.flickerSpeed * 1.7 + line.phase * 0.5) * 0.06;
    const pulse = Math.sin(this.time * line.pulseSpeed) * 0.08;
    
    // Random flash - occasional bright flash
    const randomFlash = Math.random() < 0.001 ? 0.3 : 0;
    
    // Base intensity
    let targetIntensity = line.baseIntensity + flicker1 + flicker2 + pulse + randomFlash;
    
    // Target scale - hover makes it bigger, others stay small
    let targetScale = 1.0;
    
    // Adjust based on hover state
    if (isHovered) {
      targetIntensity = 1.0;
      targetScale = 1.8; // Enlarge hovered line
    } else if (isNearHovered) {
      const dist = Math.abs(line.year - this.hoveredYear.year);
      targetIntensity = 0.5 - dist * 0.12;
      targetScale = 1.0 + (0.3 / dist); // Slightly larger for adjacent
    } else if (this.hoveredYear) {
      targetIntensity *= 0.2; // Other lines dim
      targetScale = 0.7; // Shrink non-hovered lines
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
    const x = line.x;
    const events = type === 'historical' ? line.historicalEvents : line.personalEvents;
    
    if (events.length === 0) return;
    
    // Color config - silver (historical) vs gold (personal)
    const colors = type === 'historical' 
      ? { r: 170, g: 175, b: 190, r2: 200, g2: 205, b2: 220 }   // Silver cool
      : { r: 210, g: 175, b: 120, r2: 240, g2: 210, b2: 160 };  // Gold warm
    
    // Position config
    const extent = this.height * this.verticalExtent * scale * 0.6;
    const baseY = type === 'historical' 
      ? this.mainAxisY - 35 * scale
      : this.mainAxisY + 35 * scale;
    const direction = type === 'historical' ? -1 : 1;
    const spacing = isHovered ? 45 * scale : 30 * scale;
    
    events.forEach((event, i) => {
      const y = baseY + direction * i * spacing;
      
      // Check bounds
      const maxY = type === 'historical' 
        ? this.mainAxisY - extent + 20
        : this.mainAxisY + extent - 20;
      if ((type === 'historical' && y < maxY) || (type === 'personal' && y > maxY)) {
        return;
      }
      
      const eventIntensity = event.intensity || 0.7;
      
      // Node flicker
      const flicker1 = Math.sin(this.time * (1.0 + i * 0.3) + line.phase) * 0.15;
      const flicker2 = Math.sin(this.time * (1.8 + i * 0.2) + line.phase * 1.5) * 0.08;
      const pulse = Math.sin(this.time * 0.6 + i) * 0.1;
      
      let nodeIntensity = intensity * eventIntensity + (flicker1 + flicker2 + pulse) * 0.25;
      
      if (isHovered) {
        nodeIntensity = Math.min(1, eventIntensity + 0.35);
      }
      
      // Connection line gradient
      const connGradient = ctx.createLinearGradient(x, this.mainAxisY, x, y);
      connGradient.addColorStop(0, `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${nodeIntensity * 0.08})`);
      connGradient.addColorStop(1, `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${nodeIntensity * 0.4})`);
      
      ctx.beginPath();
      ctx.moveTo(x, this.mainAxisY + direction * 4);
      ctx.lineTo(x, y);
      ctx.strokeStyle = connGradient;
      ctx.lineWidth = isHovered ? 1.5 * scale : 0.8 * scale;
      ctx.stroke();
      
      // Node size
      const nodeRadius = (isHovered ? 5 : 3) * scale;
      
      // Outer glow
      const glowRadius = nodeRadius * 3.5;
      const outerGlow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
      outerGlow.addColorStop(0, `rgba(${colors.r2}, ${colors.g2}, ${colors.b2}, ${nodeIntensity * 0.25})`);
      outerGlow.addColorStop(0.5, `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${nodeIntensity * 0.08})`);
      outerGlow.addColorStop(1, `rgba(${colors.r}, ${colors.g}, ${colors.b}, 0)`);
      
      ctx.beginPath();
      ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = outerGlow;
      ctx.fill();
      
      // Inner glow
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius * 1.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${colors.r2}, ${colors.g2}, ${colors.b2}, ${nodeIntensity * 0.18})`;
      ctx.fill();
      
      // Core
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
      const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, nodeRadius);
      coreGradient.addColorStop(0, `rgba(255, 250, 240, ${nodeIntensity * 0.9})`);
      coreGradient.addColorStop(0.4, `rgba(${colors.r2}, ${colors.g2}, ${colors.b2}, ${nodeIntensity * 0.85})`);
      coreGradient.addColorStop(1, `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${nodeIntensity * 0.6})`);
      ctx.fillStyle = coreGradient;
      ctx.fill();
      
      // Highlight center
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 250, ${nodeIntensity * 0.9})`;
      ctx.fill();
      
      // Pulse ring on hover
      if (isHovered) {
        const ringPhase = (this.time * 1.8 + i * 0.5) % 1;
        const ringRadius = nodeRadius + ringPhase * 12 * scale;
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
