'use strict';
/* ═══════════════════════════════════════════════════════
   EasyVora SPA Router
   ─ Only swaps <main id="main-content"> on navigation
   ─ nav, footer, cursor and all persistent UI stay intact
   ═══════════════════════════════════════════════════════ */
(function () {

  window.EV_SPA_LOADED = true;

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  /* ── Progress bar (reuses existing #sbar) ─────────── */
  function pbStart() {
    const b = document.getElementById('sbar');
    if (!b) return;
    b.style.transition = 'width .4s ease';
    b.style.width = '65%';
  }
  function pbDone() {
    const b = document.getElementById('sbar');
    if (!b) return;
    b.style.transition = 'width .25s ease';
    b.style.width = '100%';
    setTimeout(() => { b.style.transition = 'none'; b.style.width = '0%'; }, 320);
  }

  /* ── Nav active link ──────────────────────────────── */
  function updateActiveNav(url) {
    const path = new URL(url, location.href).pathname;
    document.querySelectorAll('.nav-links a, #mob-menu a').forEach(a => {
      try {
        const href = a.getAttribute('href') || '';
        if (href.startsWith('#') || /^(mailto:|tel:)/i.test(href)) return;
        const aPath = new URL(a.href, location.href).pathname;
        a.classList.toggle('active', aPath === path);
      } catch (_) {}
    });
  }

  /* ── Re-execute <script> tags injected by innerHTML ─ */
  function execScripts(container) {
    container.querySelectorAll('script').forEach(old => {
      const s = document.createElement('script');
      if (old.src) { s.src = old.src; s.async = false; }
      else { s.textContent = old.textContent; }
      old.replaceWith(s);
    });
  }

  /* ── Re-initialise things that depend on DOM content ─ */
  function afterNavigate(url) {
    const main = document.getElementById('main-content');
    const ring = document.getElementById('cur-ring');

    /* 1 – fade-in IntersectionObserver for .fi elements */
    if (main) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      main.querySelectorAll('.fi:not(.in)').forEach(el => io.observe(el));
    }

    /* 2 – cursor ring hover for new interactive elements */
    if (ring && main) {
      main.querySelectorAll('a,button,.svc-card,.why-item,.feat,.svc-more,label').forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('big'));
        el.addEventListener('mouseleave', () => ring.classList.remove('big'));
      });
    }

    /* 3 – index.html-specific re-init (canvas, typewriter, observers) */
    if (document.getElementById('inicio')) {
      if (window.EV_initCanvas)     window.EV_initCanvas();
      if (window.EV_initTypewriter) window.EV_initTypewriter();
      if (window.EV_initIndexPage)  window.EV_initIndexPage();
    }

    /* 4 – process-line IntersectionObserver */
    const pg = document.querySelector('.proc-grid');
    if (pg) {
      const lo = new IntersectionObserver(
        e => e.forEach(x => x.target.classList.toggle('drawn', x.isIntersecting)),
        { threshold: 0.4 }
      );
      lo.observe(pg);
    }

    /* 5 – scroll to hash if URL contains one */
    const hash = new URL(url, location.href).hash;
    if (hash) {
      setTimeout(() => {
        const t = document.querySelector(hash);
        if (t) t.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    }

    /* 6 – update nav */
    updateActiveNav(url);
  }

  /* ── Which links should the SPA handle? ──────────── */
  function isSpannable(href) {
    if (!href) return false;
    if (href.startsWith('#')) return false;
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return false;
    try {
      const u = new URL(href, location.href);
      if (u.origin !== location.origin) return false;
      const p = u.pathname;
      // Only SPA-navigate between index and formulario
      return p.endsWith('index.html') || p === '/' || p.endsWith('formulario.html');
    } catch (_) { return false; }
  }

  /* ── Core navigation ──────────────────────────────── */
  async function navigate(url, push) {
    const absUrl = new URL(url, location.href).href;
    const newPath = new URL(absUrl).pathname;
    const curPath = new URL(location.href).pathname;

    /* Same page, different hash → smooth scroll only */
    if (newPath === curPath) {
      const hash = new URL(absUrl).hash;
      if (hash) {
        const t = document.querySelector(hash);
        if (t) t.scrollIntoView({ behavior: 'smooth' });
        if (push) history.pushState({ url: absUrl }, '', absUrl);
      }
      return;
    }

    pbStart();

    /* Fetch the target page */
    let html;
    try {
      const res = await fetch(absUrl);
      if (!res.ok) throw new Error(res.status);
      html = await res.text();
    } catch (_) {
      location.href = absUrl; // fallback: normal navigation
      return;
    }

    const doc = new DOMParser().parseFromString(html, 'text/html');
    const newMain = doc.getElementById('main-content');
    if (!newMain) { location.href = absUrl; return; } // page not SPA-ready

    /* Fade out */
    const main = document.getElementById('main-content');
    main.style.transition = 'opacity .17s ease';
    main.style.opacity = '0';
    await sleep(170);

    /* Swap content */
    main.innerHTML = newMain.innerHTML;
    document.title = doc.title;

    /* Re-run any <script> tags that were inside the new <main> */
    execScripts(main);

    /* Fade in */
    main.style.opacity = '1';
    window.scrollTo(0, 0);

    /* Push history state */
    if (push) history.pushState({ url: absUrl }, '', absUrl);

    afterNavigate(absUrl);
    pbDone();
  }

  /* ── Intercept link clicks ────────────────────────── */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    const href = a.getAttribute('href');
    if (!isSpannable(href)) return;
    e.preventDefault();
    navigate(href, true);
  });

  /* ── Browser back / forward ───────────────────────── */
  window.addEventListener('popstate', e => {
    const url = (e.state && e.state.url) ? e.state.url : location.href;
    navigate(url, false);
  });

  /* ── Bootstrap ────────────────────────────────────── */
  history.replaceState({ url: location.href }, '', location.href);
  updateActiveNav(location.href);

})();
