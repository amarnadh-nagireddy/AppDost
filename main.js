(() => {
  const qs = (s, c = document) => c.querySelector(s);
  const qsa = (s, c = document) => [...c.querySelectorAll(s)];

  // ===== HAMBURGER MENU =====
  const $menuToggle = qs('#menu-toggle');
  const $navMenu = qs('#nav-menu');
  const $body = document.body;
  let isMenuOpen = false;

  if ($menuToggle && $navMenu) {
    function closeMenu() {
      $navMenu.setAttribute('aria-expanded', 'false');
      $menuToggle.setAttribute('aria-expanded', 'false');
      $body.style.overflow = '';
      $body.classList.remove('menu-open');
      isMenuOpen = false;
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    }

    function openMenu() {
      $navMenu.setAttribute('aria-expanded', 'true');
      $menuToggle.setAttribute('aria-expanded', 'true');
      $body.style.overflow = 'hidden';
      $body.classList.add('menu-open');
      isMenuOpen = true;
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
      }, 10);
    }

    function handleClickOutside(event) {
      if (isMenuOpen && !$navMenu.contains(event.target) && event.target !== $menuToggle) {
        closeMenu();
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape' && isMenuOpen) {
        closeMenu();
        $menuToggle.focus();
      }
    }

    // Toggle menu on button click
    $menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const expanded = $navMenu.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close menu when clicking on nav links
    qsa('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });
  }

  // Service accordion
  qsa('.service').forEach(card => {
    const head = qs('.service__head', card);

    head?.addEventListener('click', () => {
      const expanded = card.getAttribute('aria-expanded') === 'true';

      // Close all
      qsa('.service').forEach(c =>
        c.setAttribute('aria-expanded', 'false')
      );

      // Toggle this one
      card.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    });
  });

  // Filters
  const filters = qsa('[data-filter]');
  const items = qsa('[data-category]');

  if (filters.length) {
    const set = cat => {
      filters.forEach(b =>
        b.setAttribute('aria-pressed', b.dataset.filter === cat ? 'true' : 'false')
      );

      items.forEach(it => {
        const categories = it.dataset.category
          .split(',')
          .map(s => s.trim());

        const match = cat === 'all' || categories.includes(cat);
        it.style.display = match ? 'block' : 'none';
      });
    };

    filters.forEach(b =>
      b.addEventListener('click', () => set(b.dataset.filter))
    );

    set('all');
    // Search + combined filter support for careers page
    const searchInput = document.getElementById('job-search');
    const clearSearch = document.getElementById('clear-search');

    function getActiveFilter() {
      const active = filters.find(b => b.getAttribute('aria-pressed') === 'true');
      return active ? active.dataset.filter : 'all';
    }

    function updateVisibility() {
      const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      const active = getActiveFilter();

      items.forEach(it => {
        const categories = it.dataset.category.split(',').map(s => s.trim());
        const filterMatch = active === 'all' || categories.includes(active);
        const text = it.innerText.toLowerCase();
        const searchMatch = !query || text.includes(query);
        it.style.display = (filterMatch && searchMatch) ? 'block' : 'none';
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', updateVisibility);
    }

    if (clearSearch) {
      clearSearch.addEventListener('click', (e) => {
        e.preventDefault();
        if (searchInput) searchInput.value = '';
        updateVisibility();
      });
    }

    // Override filter click handlers to use updateVisibility instead
    filters.forEach(b => {
      b.addEventListener('click', (e) => {
        e.preventDefault();
        filters.forEach(f => f.setAttribute('aria-pressed', f === b ? 'true' : 'false'));
        updateVisibility();
      });
    });
  }

  // Contact form validation
  const form = qs('#contact-form');

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      const name = qs('#name', form);
      const email = qs('#email', form);
      const subject = qs('#subject', form);
      const message = qs('#message', form);

      let ok = true;

      const setErr = (el, has) =>
        el.setAttribute('aria-invalid', has ? 'true' : 'false');

      // Name
      setErr(name, !name.value.trim());
      ok = ok && !!name.value.trim();

      // Email
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      setErr(email, !emailOk);
      ok = ok && emailOk;

      // Subject
      setErr(subject, !subject.value.trim());
      ok = ok && !!subject.value.trim();

      // Message min length
      const msgOk = message.value.trim().length >= 10;
      setErr(message, !msgOk);
      ok = ok && msgOk;

      if (!ok) return;

      const payload = {
        name: name.value.trim(),
        email: email.value.trim(),
        subject: subject.value.trim(),
        message: message.value.trim(),
        timestamp: new Date().toISOString()
      };

      console.log(
        'Prepared JSON payload:',
        JSON.stringify(payload)
      );

      form.reset();
      alert('Thanks! Your message is prepared for submission.');
    });
  }
})();
