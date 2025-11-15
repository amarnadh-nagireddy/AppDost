document.addEventListener('DOMContentLoaded', () => {
  const headerPlaceholder = document.getElementById('header-placeholder');
  const footerPlaceholder = document.getElementById('footer-placeholder');

  const currentScript = document.currentScript;
  let rootPath = '';

  if (currentScript && currentScript.src) {
    rootPath = currentScript.src.replace(/\/js\/loadContent\.js(?:\?.*)?$/, '/');
  } else {
    const path = window.location.pathname;
    rootPath = path.replace(/\/[^/]*$/, '/');
  }

  const loadHTML = async (relativeUrl, placeholder) => {
    if (!placeholder) return;

    const url = rootPath + relativeUrl;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
      }
      const text = await response.text();
      placeholder.innerHTML = text;
    } catch (error) {
      console.error(error);
      placeholder.innerHTML = `<p>Error loading content. Please try again later.</p>`;
    }
  };

  const setActiveNavLink = () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav__link');

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      const linkPage = href.split('/').pop();
      if (linkPage === currentPage) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const normalizeNavLinks = () => {
    const navLinks = document.querySelectorAll('.nav__link[data-page]');
    navLinks.forEach(link => {
      const page = link.getAttribute('data-page');
      if (!page) return;
      // Build absolute URL based on rootPath so links work from subfolders too
      link.setAttribute('href', rootPath + page);
    });
  };

  const loadMainScript = () => {
    const script = document.createElement('script');
    script.src = rootPath + 'main.js';
    script.defer = true;
    document.body.appendChild(script);
  };

  const initThemeAndNavIfAvailable = () => {
    if (window && typeof window.initThemeAndNav === 'function') {
      window.initThemeAndNav();
    }
  };

  const loadPartials = async () => {
    await Promise.all([
      loadHTML('partials/header.html', headerPlaceholder),
      loadHTML('partials/footer.html', footerPlaceholder)
    ]);

    // Small delay to ensure DOM is updated
    setTimeout(() => {
      normalizeNavLinks();
      setActiveNavLink();
      initThemeAndNavIfAvailable();
      loadMainScript();
    }, 10);
  };

  loadPartials();
});