/* ============================================
   AI Phone - Main JavaScript
   Enhanced Interactive Edition
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // =============================================
  // UTILITY: detect mobile
  // =============================================
  const isMobile = () => window.innerWidth < 768 || 'ontouchstart' in window;

  // =============================================
  // 1. NEURAL NETWORK PARTICLE CANVAS
  // =============================================
  (function initNeuralCanvas() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'neuralCanvas';
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      zIndex: '0',
      pointerEvents: 'none'
    });

    // Insert canvas as first child of hero so it sits behind content
    hero.style.position = hero.style.position || 'relative';
    hero.insertBefore(canvas, hero.firstChild);

    const ctx = canvas.getContext('2d');
    let width, height;
    const PARTICLE_COUNT = 80;
    const CONNECTION_DIST = 150;
    const MOUSE_REPEL_DIST = 120;
    const MOUSE_REPEL_FORCE = 0.8;
    const particles = [];
    const mouse = { x: -9999, y: -9999 };

    function resize() {
      const rect = hero.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    class Particle {
      constructor() {
        this.x = Math.random() * (width || 800);
        this.y = Math.random() * (height || 600);
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2 + 1;
        // Neon blue or magenta
        this.color = Math.random() > 0.5
          ? `hsla(${200 + Math.random() * 20}, 100%, 70%, 0.9)`
          : `hsla(${290 + Math.random() * 20}, 100%, 70%, 0.8)`;
      }

      update() {
        // Mouse repulsion
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_REPEL_DIST && dist > 0) {
          const force = (MOUSE_REPEL_DIST - dist) / MOUSE_REPEL_DIST * MOUSE_REPEL_FORCE;
          this.vx += (dx / dist) * force;
          this.vy += (dy / dist) * force;
        }

        // Damping
        this.vx *= 0.98;
        this.vy *= 0.98;

        // Minimum drift speed
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed < 0.15) {
          this.vx += (Math.random() - 0.5) * 0.1;
          this.vy += (Math.random() - 0.5) * 0.1;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Wrap around edges
        if (this.x < -10) this.x = width + 10;
        if (this.x > width + 10) this.x = -10;
        if (this.y < -10) this.y = height + 10;
        if (this.y > height + 10) this.y = -10;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    function init() {
      resize();
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
      }
    }

    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const opacity = (1 - dist / CONNECTION_DIST) * 0.25;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(100, 180, 255, ${opacity})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      drawConnections();
      requestAnimationFrame(animate);
    }

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    hero.addEventListener('mouseleave', () => {
      mouse.x = -9999;
      mouse.y = -9999;
    });

    window.addEventListener('resize', () => {
      resize();
    });

    init();
    animate();
  })();

  // =============================================
  // 2. TYPING EFFECT ON HERO SUBTITLE
  // =============================================
  (function initTypingEffect() {
    const subtitle = document.querySelector('.hero-subtitle');
    if (!subtitle) return;

    const fullText = subtitle.textContent.trim();
    subtitle.textContent = '';
    subtitle.style.visibility = 'visible';

    // Create cursor element
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    cursor.textContent = '|';
    Object.assign(cursor.style, {
      display: 'inline',
      fontWeight: '100',
      animation: 'blinkCursor 0.7s infinite',
      marginLeft: '2px',
      color: 'var(--accent, #6c63ff)'
    });

    // Add blink animation
    if (!document.getElementById('typingCursorStyle')) {
      const style = document.createElement('style');
      style.id = 'typingCursorStyle';
      style.textContent = `
        @keyframes blinkCursor {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    let charIndex = 0;
    subtitle.appendChild(cursor);

    setTimeout(() => {
      const typeInterval = setInterval(() => {
        if (charIndex < fullText.length) {
          // Insert text before cursor
          cursor.before(fullText.charAt(charIndex));
          charIndex++;
        } else {
          clearInterval(typeInterval);
          // Keep cursor blinking for a while, then stop
          setTimeout(() => {
            cursor.style.animation = 'blinkCursor 0.7s infinite';
          }, 2000);
        }
      }, 25);
    }, 500);
  })();

  // =============================================
  // 3. ANIMATED COUNTERS
  // =============================================
  (function initAnimatedCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');
    if (!statNumbers.length) return;

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function animateCounter(el) {
      const text = el.textContent.trim();
      let target, suffix = '';

      if (text.endsWith('%')) {
        target = parseInt(text);
        suffix = '%';
      } else if (text.endsWith('+')) {
        target = parseInt(text);
        suffix = '+';
      } else {
        target = parseInt(text);
      }

      if (isNaN(target)) return;

      const duration = 2000;
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutExpo(progress);
        const currentValue = Math.round(easedProgress * target);

        el.textContent = currentValue + (progress >= 1 ? suffix : '');

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      }

      requestAnimationFrame(update);
    }

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Animate all stat-numbers within this container
          const numbers = entry.target.querySelectorAll
            ? entry.target.querySelectorAll('.stat-number')
            : [entry.target];
          numbers.forEach((el, i) => {
            setTimeout(() => animateCounter(el), i * 200);
          });
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    const statsBar = document.querySelector('.stats-bar');
    if (statsBar) {
      counterObserver.observe(statsBar);
    }
  })();

  // =============================================
  // 4. TILT EFFECT ON CARDS
  // =============================================
  (function initTiltEffect() {
    if (isMobile()) return;

    const cardSelectors = [
      '.tutorial-card',
      '.blog-card',
      '.feature-card',
      '.wwd-card',
      '.value-card',
      '.team-card',
      '.platform-phone'
    ];

    const cards = document.querySelectorAll(cardSelectors.join(', '));
    const MAX_TILT = 8;

    cards.forEach(card => {
      card.style.transition = 'transform 0.15s ease-out';
      card.style.transformStyle = 'preserve-3d';
      card.style.willChange = 'transform';

      // Create glare overlay
      const glare = document.createElement('div');
      glare.className = 'tilt-glare';
      Object.assign(glare.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        borderRadius: 'inherit',
        pointerEvents: 'none',
        background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 80%)',
        opacity: '0',
        transition: 'opacity 0.3s ease',
        zIndex: '10'
      });

      // Only add glare if card has relative/absolute positioning
      const pos = getComputedStyle(card).position;
      if (pos === 'static') {
        card.style.position = 'relative';
      }
      card.style.overflow = card.style.overflow || 'hidden';
      card.appendChild(glare);

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -MAX_TILT;
        const rotateY = ((x - centerX) / centerX) * MAX_TILT;

        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

        // Move glare
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;
        glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.2) 0%, transparent 80%)`;
        glare.style.opacity = '1';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        glare.style.opacity = '0';
      });
    });
  })();

  // =============================================
  // 5. CURSOR GLOW FOLLOWER
  // =============================================
  (function initCursorGlow() {
    if (isMobile()) return;

    const glow = document.createElement('div');
    glow.id = 'cursorGlow';
    glow.setAttribute('aria-hidden', 'true');
    Object.assign(glow.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '200px',
      height: '200px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.08) 40%, transparent 70%)',
      pointerEvents: 'none',
      zIndex: '9999',
      transform: 'translate(-50%, -50%)',
      mixBlendMode: 'screen',
      willChange: 'left, top'
    });
    document.body.appendChild(glow);

    let cursorX = -200, cursorY = -200;
    let glowX = -200, glowY = -200;

    document.addEventListener('mousemove', (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
    });

    function updateGlow() {
      // Lerp for smooth following
      glowX += (cursorX - glowX) * 0.12;
      glowY += (cursorY - glowY) * 0.12;
      glow.style.left = glowX + 'px';
      glow.style.top = glowY + 'px';
      requestAnimationFrame(updateGlow);
    }

    requestAnimationFrame(updateGlow);
  })();

  // =============================================
  // 6. STAGGERED SCROLL REVEAL
  // =============================================
  const revealElements = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;

        // Find grid children to stagger
        const gridChildren = el.querySelectorAll(
          '.feature-list li, .faq-item, .blog-card, .wwd-card, .value-card, .team-card, .stat-item, .tutorial-meta .meta-item'
        );

        if (gridChildren.length > 0) {
          el.classList.add('visible');
          gridChildren.forEach((child, i) => {
            child.style.opacity = '0';
            child.style.transform = 'translateY(25px)';
            child.style.transition = `opacity 0.5s ease ${i * 100}ms, transform 0.5s ease ${i * 100}ms`;
            // Force reflow then animate
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                child.style.opacity = '1';
                child.style.transform = 'translateY(0)';
              });
            });
          });
        } else {
          el.classList.add('visible');
        }

        observer.unobserve(el);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  revealElements.forEach(el => observer.observe(el));

  // =============================================
  // 7. MAGNETIC BUTTONS
  // =============================================
  (function initMagneticButtons() {
    if (isMobile()) return;

    const buttons = document.querySelectorAll('.btn-primary');
    const MAGNETIC_RANGE = 100;
    const MAGNETIC_STRENGTH = 0.3;

    buttons.forEach(btn => {
      btn.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), background 0.3s ease, box-shadow 0.3s ease';

      document.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const btnCenterX = rect.left + rect.width / 2;
        const btnCenterY = rect.top + rect.height / 2;

        const dx = e.clientX - btnCenterX;
        const dy = e.clientY - btnCenterY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAGNETIC_RANGE) {
          const pull = (MAGNETIC_RANGE - dist) / MAGNETIC_RANGE;
          const moveX = dx * pull * MAGNETIC_STRENGTH;
          const moveY = dy * pull * MAGNETIC_STRENGTH;
          btn.style.transform = `translate(${moveX}px, ${moveY}px)`;
        } else {
          btn.style.transform = 'translate(0, 0)';
        }
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
      });
    });
  })();

  // =============================================
  // 8. EASTER EGG - KONAMI CODE MATRIX RAIN
  // =============================================
  (function initKonamiCode() {
    const konamiSequence = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'b', 'a'
    ];
    let konamiIndex = 0;

    document.addEventListener('keydown', (e) => {
      const expected = konamiSequence[konamiIndex];
      if (e.key === expected || e.key.toLowerCase() === expected) {
        konamiIndex++;
        if (konamiIndex === konamiSequence.length) {
          konamiIndex = 0;
          triggerMatrixRain();
        }
      } else {
        konamiIndex = 0;
      }
    });

    function triggerMatrixRain() {
      const matrixCanvas = document.createElement('canvas');
      matrixCanvas.id = 'matrixRain';
      matrixCanvas.setAttribute('aria-hidden', 'true');
      Object.assign(matrixCanvas.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        zIndex: '99999',
        pointerEvents: 'none',
        opacity: '1',
        transition: 'opacity 0.5s ease'
      });
      document.body.appendChild(matrixCanvas);

      const mCtx = matrixCanvas.getContext('2d');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      matrixCanvas.width = window.innerWidth * dpr;
      matrixCanvas.height = window.innerHeight * dpr;
      mCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const w = window.innerWidth;
      const h = window.innerHeight;
      const fontSize = 14;
      const columns = Math.floor(w / fontSize);
      const drops = new Array(columns).fill(0).map(() => Math.random() * -50);

      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()アイウエオカキクケコサシスセソ';

      let animId;
      const startTime = Date.now();

      function drawMatrix() {
        mCtx.fillStyle = 'rgba(0, 0, 0, 0.06)';
        mCtx.fillRect(0, 0, w, h);

        mCtx.fillStyle = '#0f0';
        mCtx.font = fontSize + 'px JetBrains Mono, monospace';

        for (let i = 0; i < drops.length; i++) {
          const char = chars[Math.floor(Math.random() * chars.length)];

          // Vary green shade
          const brightness = Math.random() * 155 + 100;
          mCtx.fillStyle = `rgb(0, ${brightness}, 0)`;

          mCtx.fillText(char, i * fontSize, drops[i] * fontSize);

          if (drops[i] * fontSize > h && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i] += 0.6 + Math.random() * 0.4;
        }

        if (Date.now() - startTime < 2500) {
          animId = requestAnimationFrame(drawMatrix);
        } else {
          // Fade out
          matrixCanvas.style.opacity = '0';
          setTimeout(() => {
            cancelAnimationFrame(animId);
            matrixCanvas.remove();
          }, 500);
        }
      }

      animId = requestAnimationFrame(drawMatrix);
    }
  })();

  // =============================================
  // NAVBAR SCROLL EFFECT (existing)
  // =============================================
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  // =============================================
  // MOBILE NAV TOGGLE (existing)
  // =============================================
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const isOpen = navLinks.classList.contains('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // =============================================
  // SMOOTH SCROLL FOR ANCHOR LINKS (existing)
  // =============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // =============================================
  // SCROLL PROGRESS BAR (existing)
  // =============================================
  const scrollProgress = document.getElementById('scrollProgress');
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = scrollPercent + '%';
  }, { passive: true });

  // =============================================
  // BACK TO TOP (existing)
  // =============================================
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 600);
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // =============================================
  // THEME TOGGLE (existing)
  // =============================================
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('aiphone-theme');

  if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else if (!savedTheme && window.matchMedia('(prefers-color-scheme: light)').matches) {
    document.documentElement.setAttribute('data-theme', 'light');
  }

  themeToggle.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('aiphone-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('aiphone-theme', 'light');
    }
  });

  // =============================================
  // SEARCH OVERLAY (existing)
  // =============================================
  const searchToggle = document.getElementById('searchToggle');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');

  const searchIndex = [
    { title: 'Google Gemini pe Android', section: '#android', tags: 'gemini android asistent ai google chat' },
    { title: 'Galaxy AI (Samsung)', section: '#android', tags: 'galaxy samsung traduceri foto editare note' },
    { title: 'Circle to Search', section: '#android', tags: 'circle search cauta ecran android' },
    { title: 'Apple Intelligence pe iOS', section: '#ios', tags: 'apple intelligence ios texte rezumate notificari' },
    { title: 'Siri cu AI avansat', section: '#ios', tags: 'siri ios conversatii aplicatii raspunsuri' },
    { title: 'Instrumente creative iOS', section: '#ios', tags: 'imagini fotografii genmoji creative ios' },
    { title: 'Cum să planifici o vacanță completă în 10 minute cu AI', section: '#tutorial', tags: 'vacanta planificare tutorial cazare buget' },
    { title: 'Ce este AI pe telefon?', section: '#faq', tags: 'ce este ai telefon faq' },
    { title: 'Google Gemini este gratuit?', section: '#faq', tags: 'gemini gratuit pret cost faq' },
    { title: 'Ce telefoane suportă Apple Intelligence?', section: '#faq', tags: 'apple intelligence telefoane compatibil faq' },
    { title: 'Cum să fiu mai productiv cu AI?', section: '#faq', tags: 'productiv productivitate email documente faq' },
    { title: 'Este sigur AI pe telefon?', section: '#faq', tags: 'sigur securitate confidentialitate date faq' },
  ];

  function openSearch() {
    searchOverlay.classList.add('active');
    searchInput.value = '';
    searchInput.focus();
    document.body.style.overflow = 'hidden';
    renderSearchHint();
  }

  function closeSearch() {
    searchOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function renderSearchHint() {
    searchResults.innerHTML = '<div class="search-hint">Incearca: <span class="search-tag">Gemini</span> <span class="search-tag">Galaxy AI</span> <span class="search-tag">Apple Intelligence</span> <span class="search-tag">Siri</span> <span class="search-tag">vacanta</span></div>';
    searchResults.querySelectorAll('.search-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        searchInput.value = tag.textContent;
        performSearch(tag.textContent);
      });
    });
  }

  function performSearch(query) {
    const q = query.toLowerCase().trim();
    if (!q) { renderSearchHint(); return; }

    const results = searchIndex.filter(item =>
      item.title.toLowerCase().includes(q) || item.tags.includes(q)
    );

    if (results.length === 0) {
      searchResults.innerHTML = '<div class="search-no-results">Niciun rezultat pentru \u201E' + escapeHtml(query) + '\u201D</div>';
      return;
    }

    searchResults.innerHTML = results.map(item =>
      '<a href="' + item.section + '" class="search-result-item">' +
        '<span class="search-result-title">' + highlightMatch(item.title, q) + '</span>' +
        '<span class="search-result-section">' + item.section + '</span>' +
      '</a>'
    ).join('');

    searchResults.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('click', closeSearch);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function highlightMatch(text, query) {
    const idx = text.toLowerCase().indexOf(query);
    if (idx === -1) return escapeHtml(text);
    return escapeHtml(text.substring(0, idx)) +
      '<mark>' + escapeHtml(text.substring(idx, idx + query.length)) + '</mark>' +
      escapeHtml(text.substring(idx + query.length));
  }

  searchToggle.addEventListener('click', openSearch);
  searchOverlay.addEventListener('click', (e) => {
    if (e.target === searchOverlay) closeSearch();
  });
  searchInput.addEventListener('input', () => performSearch(searchInput.value));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
      closeSearch();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
  });

  // =============================================
  // SHARE BUTTONS (existing)
  // =============================================
  const pageUrl = window.location.href;
  const pageTitle = document.title;

  document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.share;
      const text = encodeURIComponent('Cum sa planifici o vacanta completa in 10 minute cu AI - AIphone.ro');
      const url = encodeURIComponent(pageUrl);

      switch (type) {
        case 'whatsapp':
          window.open('https://wa.me/?text=' + text + '%20' + url, '_blank', 'noopener');
          break;
        case 'facebook':
          window.open('https://www.facebook.com/sharer/sharer.php?u=' + url, '_blank', 'noopener');
          break;
        case 'x':
          window.open('https://x.com/intent/tweet?text=' + text + '&url=' + url, '_blank', 'noopener');
          break;
        case 'copy':
          navigator.clipboard.writeText(window.location.href).then(() => {
            const original = btn.innerHTML;
            btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
            btn.classList.add('copied');
            setTimeout(() => {
              btn.innerHTML = original;
              btn.classList.remove('copied');
            }, 2000);
          });
          break;
      }
    });
  });

  // =============================================
  // NEWSLETTER (existing)
  // =============================================
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterSuccess = document.getElementById('newsletterSuccess');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      newsletterForm.hidden = true;
      newsletterSuccess.hidden = false;
    });
  }

  // =============================================
  // COOKIE CONSENT (existing)
  // =============================================
  const cookieBanner = document.getElementById('cookieBanner');
  const cookieAccept = document.getElementById('cookieAccept');
  const cookieDecline = document.getElementById('cookieDecline');
  const cookieSettingsBtn = document.getElementById('cookieSettings');
  const cookieSettingsPanel = document.getElementById('cookieSettingsPanel');
  const cookieSaveSettings = document.getElementById('cookieSaveSettings');
  const cookieAnalytics = document.getElementById('cookieAnalytics');

  const cookieConsent = localStorage.getItem('aiphone-cookie-consent');

  if (!cookieConsent && cookieBanner) {
    cookieBanner.classList.add('visible');
  }

  function hideBanner() {
    cookieBanner.classList.remove('visible');
    cookieBanner.classList.add('hiding');
    setTimeout(() => {
      cookieBanner.classList.remove('hiding');
    }, 400);
  }

  if (cookieAccept) {
    cookieAccept.addEventListener('click', () => {
      localStorage.setItem('aiphone-cookie-consent', JSON.stringify({ essential: true, analytics: true }));
      hideBanner();
    });
  }

  if (cookieDecline) {
    cookieDecline.addEventListener('click', () => {
      localStorage.setItem('aiphone-cookie-consent', JSON.stringify({ essential: true, analytics: false }));
      hideBanner();
    });
  }

  if (cookieSettingsBtn) {
    cookieSettingsBtn.addEventListener('click', () => {
      cookieSettingsPanel.hidden = !cookieSettingsPanel.hidden;
    });
  }

  if (cookieSaveSettings) {
    cookieSaveSettings.addEventListener('click', () => {
      localStorage.setItem('aiphone-cookie-consent', JSON.stringify({
        essential: true,
        analytics: cookieAnalytics.checked
      }));
      hideBanner();
    });
  }

});
