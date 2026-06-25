/* script.js — All interactivity for the portfolio */

document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // 1. SCROLL PROGRESS BAR
  // ============================================================
  const scrollProgress = document.getElementById('scroll-progress');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = progress + '%';
  }, { passive: true });


  // ============================================================
  // 2. SCROLL REVEAL (Intersection Observer)
  // ============================================================
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));


  // ============================================================
  // 3. TYPEWRITER ANIMATION
  // ============================================================
  const typewriterEl = document.getElementById('typewriter');
  const phrases = [
    'Full-Stack Developer',
    'Data Analyst',
    'UI/UX Enthusiast',
    'Python Engineer',
  ];

  let phraseIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let typingTimer;

  function typeWrite() {
    const currentPhrase = phrases[phraseIdx];

    if (!isDeleting) {
      charIdx++;
      typewriterEl.textContent = currentPhrase.slice(0, charIdx);
      if (charIdx === currentPhrase.length) {
        // Pause at end of word
        typingTimer = setTimeout(() => {
          isDeleting = true;
          typeWrite();
        }, 1800);
        return;
      }
    } else {
      charIdx--;
      typewriterEl.textContent = currentPhrase.slice(0, charIdx);
      if (charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
      }
    }

    const speed = isDeleting ? 55 : 95;
    typingTimer = setTimeout(typeWrite, speed);
  }

  typeWrite();


  // ============================================================
  // 4. MOBILE NAV (Hamburger + Drawer + Overlay)
  // ============================================================
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  const navOverlay = document.getElementById('nav-overlay');
  const navDrawer = document.getElementById('nav-drawer');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function openNav() {
    document.body.classList.add('nav-open');
    mobileNav.classList.remove('pointer-events-none');
    navOverlay.style.opacity = '1';
    navDrawer.style.transform = 'translateX(0)';
  }

  function closeNav() {
    document.body.classList.remove('nav-open');
    mobileNav.classList.add('pointer-events-none');
    navOverlay.style.opacity = '0';
    navDrawer.style.transform = 'translateX(100%)';
  }

  hamburger.addEventListener('click', () => {
    document.body.classList.contains('nav-open') ? closeNav() : openNav();
  });

  navOverlay.addEventListener('click', closeNav);

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeNav);
  });


  // ============================================================
  // 5. SMOOTH SCROLLING (anchor links)
  // ============================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = 88; // nav height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  // ============================================================
  // 6. THEME TOGGLE (Dark / Light)
  // ============================================================
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const html = document.documentElement;

  // Read saved preference (default: dark)
  const saved = localStorage.getItem('theme');
  if (saved === 'light') {
    html.classList.remove('dark');
    themeIcon.className = 'ph ph-sun text-amber-400 text-lg';
  }

  themeToggle.addEventListener('click', () => {
    const isDark = html.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeIcon.className = isDark
      ? 'ph ph-moon text-slate-300 text-lg'
      : 'ph ph-sun text-amber-400 text-lg';
  });


  // ============================================================
  // 7. PROJECT CARD TILT EFFECT
  // ============================================================
  const projectCards = document.querySelectorAll('.project-card');

  projectCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotX = ((y - cy) / cy) * -8;
      const rotY = ((x - cx) / cx) * 8;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0)';
    });
  });


  // ============================================================
  // 8. CRAFTSMANSHIP SECTION: TAB SWITCHING
  // ============================================================
  const tabGalleryBtn = document.getElementById('tab-gallery-btn');
  const tabBuilderBtn = document.getElementById('tab-builder-btn');
  const panelGallery = document.getElementById('panel-gallery');
  const panelBuilder = document.getElementById('panel-builder');

  function switchTab(showGallery) {
    if (showGallery) {
      panelGallery.classList.remove('hidden');
      panelBuilder.classList.add('hidden');
      tabGalleryBtn.classList.add('active-tab');
      tabGalleryBtn.classList.remove('text-slate-500');
      tabBuilderBtn.classList.remove('active-tab');
      tabBuilderBtn.classList.add('text-slate-500');
    } else {
      panelGallery.classList.add('hidden');
      panelBuilder.classList.remove('hidden');
      tabBuilderBtn.classList.add('active-tab');
      tabBuilderBtn.classList.remove('text-slate-500');
      tabGalleryBtn.classList.remove('active-tab');
      tabGalleryBtn.classList.add('text-slate-500');
      // Trigger reveal on builder panel items
      panelBuilder.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
    }
  }

  tabGalleryBtn.addEventListener('click', () => switchTab(true));
  tabBuilderBtn.addEventListener('click', () => switchTab(false));


  // ============================================================
  // 9. CARD BUILDER — Live Sliders
  // ============================================================
  const builderCard = document.getElementById('builder-card');

  const sliderBlur   = document.getElementById('slider-blur');
  const sliderBg     = document.getElementById('slider-bg');
  const sliderBorder = document.getElementById('slider-border');
  const sliderRadius = document.getElementById('slider-radius');
  const sliderShadow = document.getElementById('slider-shadow');

  const blurVal   = document.getElementById('blur-val');
  const bgVal     = document.getElementById('bg-val');
  const borderVal = document.getElementById('border-val');
  const radiusVal = document.getElementById('radius-val');
  const shadowVal = document.getElementById('shadow-val');

  // Detect dark mode for card builder bg calculation
  function isDark() {
    return document.documentElement.classList.contains('dark');
  }

  function updateCard() {
    const blur   = sliderBlur.value;
    const bg     = sliderBg.value;
    const border = sliderBorder.value;
    const radius = sliderRadius.value;
    const shadow = sliderShadow.value;

    const bgColor = isDark()
      ? `rgba(255,255,255,${bg / 100})`
      : `rgba(255,255,255,${(parseInt(bg) + 40) / 100})`;

    const borderColor = isDark()
      ? `rgba(255,255,255,${border / 100})`
      : `rgba(0,0,0,${border / 100})`;

    const shadowColor = isDark()
      ? `rgba(0,0,0,${shadow / 100})`
      : `rgba(0,0,0,${shadow / 200})`;

    builderCard.style.backdropFilter   = `blur(${blur}px)`;
    builderCard.style.webkitBackdropFilter = `blur(${blur}px)`;
    builderCard.style.background       = bgColor;
    builderCard.style.border           = `1px solid ${borderColor}`;
    builderCard.style.borderRadius     = `${radius}px`;
    builderCard.style.boxShadow        = `0 8px ${shadow}px ${shadowColor}`;

    blurVal.textContent   = `${blur}px`;
    bgVal.textContent     = `${bg}%`;
    borderVal.textContent = `${border}%`;
    radiusVal.textContent = `${radius}px`;
    shadowVal.textContent = shadow;
  }

  [sliderBlur, sliderBg, sliderBorder, sliderRadius, sliderShadow].forEach(slider => {
    slider.addEventListener('input', updateCard);
  });


  // ============================================================
  // 10. CARD BUILDER — Color Swatches
  // ============================================================
  const builderAvatar = document.getElementById('builder-avatar');
  const builderBtn    = document.getElementById('builder-btn');
  const swatches      = document.querySelectorAll('.color-swatch');

  let activeColor = '#3b82f6';

  // Set first swatch as active on load
  if (swatches.length > 0) {
    swatches[0].classList.add('active');
    swatches[0].style.setProperty('--swatch-color', activeColor);
  }

  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      swatches.forEach(s => {
        s.classList.remove('active');
        s.style.outline = 'none';
      });

      swatch.classList.add('active');
      activeColor = swatch.dataset.color;

      // Apply outline manually for cross-browser
      swatch.style.outline = `2px solid ${activeColor}`;
      swatch.style.outlineOffset = '3px';

      builderAvatar.style.backgroundColor = activeColor;
      builderBtn.style.backgroundColor    = activeColor;
    });
  });

});
