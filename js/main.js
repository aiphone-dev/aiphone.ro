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
  // TYPING EFFECT ON HERO SUBTITLE
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
  // ANIMATED COUNTERS
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
  // STAGGERED SCROLL REVEAL
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
