(function() {
  // Initialize theme immediately on page load, before any rendering
  const html = document.documentElement;
  const savedTheme = localStorage.getItem('theme') ||
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  html.setAttribute('data-theme', savedTheme);

  function initThemeAndNav() {
    const menuBtn = document.getElementById('menu-toggle'); // your button id
    const navMenu = document.getElementById('nav-menu');    // your nav id
    const navLinks = navMenu ? Array.from(navMenu.querySelectorAll('.nav__link')) : [];
    // theme toggles (desktop and inside panel); IDs/classes in HTML: #theme-toggle, #theme-toggle-desktop
    const themeToggles = () => Array.from(document.querySelectorAll('#theme-toggle, #theme-toggle-desktop'));

    // --- Theme toggle logic ---
    if (themeToggles().length) {
      function toggleTheme() {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        const nextLabel = `Switch to ${newTheme === 'dark' ? 'light' : 'dark'} mode`;
        themeToggles().forEach(t => t.setAttribute('aria-label', nextLabel));
      }

      themeToggles().forEach(toggle => {
        toggle.addEventListener('click', function (e) {
          e.preventDefault();
          toggleTheme();
        });
      });

      const initialLabel = `Switch to ${savedTheme === 'dark' ? 'light' : 'dark'} mode`;
      themeToggles().forEach(t => t.setAttribute('aria-label', initialLabel));
    }

    // --- Menu toggle logic ---
    function closeMenu() {
      if (!menuBtn || !navMenu) return;
      menuBtn.setAttribute('aria-expanded', 'false');
      navMenu.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    }

    function openMenu() {
      if (!menuBtn || !navMenu) return;
      menuBtn.setAttribute('aria-expanded', 'true');
      navMenu.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
      const firstLink = navMenu.querySelector('.nav__link');
      if (firstLink) firstLink.focus();
    }

    if (menuBtn && navMenu) {
      // set correct initial state
      menuBtn.setAttribute('aria-expanded', 'false');
      navMenu.setAttribute('aria-expanded', 'false');

      menuBtn.addEventListener('click', (e) => {
        const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
        if (expanded) closeMenu(); else openMenu();
      });

      // close on Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
      });

      // click outside to close (uses body.menu-open overlay)
      document.addEventListener('click', (e) => {
        if (!document.body.classList.contains('menu-open')) return;
        // click inside the menu or the toggle -> ignore
        if (navMenu.contains(e.target) || menuBtn.contains(e.target)) return;
        closeMenu();
      });

      // close when a nav link is clicked (typical mobile behaviour)
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          closeMenu();
        });
      });

      // close on resize to avoid stuck open on layout change
      window.addEventListener('resize', () => {
        if (window.innerWidth >= 1200) closeMenu();
      });
    }

    // --- Smooth scroll for in-page anchors (keeps your behaviour) ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (!targetId || targetId === '#') return;
        const target = document.querySelector(targetId);
        if (!target) return;
        e.preventDefault();
        window.scrollTo({
          top: target.offsetTop - 80,
          behavior: 'smooth'
        });
      });
    });

    // --- Section highlight logic ---
    const sections = document.querySelectorAll('main section[id]');
    if (navMenu && sections.length) {
      const links = navMenu.querySelectorAll('.nav__link');
      function highlightNav() {
        let current = '';
        sections.forEach(section => {
          const sectionTop = section.offsetTop - 100;
          const sectionHeight = section.offsetHeight;
          if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
            current = '#' + section.id;
          }
        });
        links.forEach(link => {
          link.classList.remove('active');
          if (current && link.getAttribute('href') === current) link.classList.add('active');
        });
      }
      window.addEventListener('scroll', highlightNav);
      highlightNav();
    }
  }

  // expose for manual init if needed and run now
  window.initThemeAndNav = initThemeAndNav;
  document.addEventListener('DOMContentLoaded', initThemeAndNav);
})();
