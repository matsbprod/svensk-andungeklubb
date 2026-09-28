(function() {
  // ── Tema: ljust är standard, mörkt är ett val ───────────────
  var THEME_KEY = 'sak-theme';

  function readTheme() {
    try { return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'; }
    catch (e) { return 'light'; }
  }
  function applyTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    try { localStorage.setItem(THEME_KEY, mode); } catch (e) {}
  }
  document.documentElement.setAttribute('data-theme', readTheme());

  var toggleButtons = [];
  function toggleLabel(long) {
    var isLight = document.documentElement.getAttribute('data-theme') !== 'dark';
    var text = isLight ? '\u263E M\u00f6rkt' : '\u2600 Ljust';
    return long ? text + ' l\u00e4ge' : text;
  }
  function makeToggle(long) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label', 'Byt tema');
    btn._long = long;
    btn.textContent = toggleLabel(long);
    btn.addEventListener('click', function() {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      toggleButtons.forEach(function(b) { b.textContent = toggleLabel(b._long); });
    });
    toggleButtons.push(btn);
    return btn;
  }

  // Knapp i den vanliga menyraden (dator/surfplatta)
  function injectThemeButton() {
    var navLinks = document.querySelector('.nav-links');
    if (!navLinks || document.getElementById('theme-toggle')) return;
    var btn = makeToggle(false);
    btn.id = 'theme-toggle';
    navLinks.appendChild(btn);
  }

  // Hamburgermeny + mobilmeny med temaknapp (nav-links är dold på små skärmar).
  // Görs bara om sidan inte redan har en hamburgermeny.
  function setupMobileMenu() {
    if (document.querySelector('.hamburger') || document.querySelector('.nav-drawer')) return;
    var navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    var burger = document.createElement('button');
    burger.className = 'hamburger';
    burger.setAttribute('aria-label', 'Meny');
    burger.innerHTML = '<span></span><span></span><span></span>';
    document.body.appendChild(burger);

    var drawer = document.createElement('div');
    drawer.className = 'nav-drawer';
    navLinks.querySelectorAll('a').forEach(function(a) {
      var link = document.createElement('a');
      link.href = a.href;
      link.textContent = a.textContent;
      drawer.appendChild(link);
    });
    drawer.appendChild(makeToggle(true));
    document.body.appendChild(drawer);

    burger.addEventListener('click', function() {
      var isOpen = burger.classList.toggle('open');
      drawer.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    drawer.addEventListener('click', function(e) {
      if (e.target.tagName === 'A') {
        burger.classList.remove('open');
        drawer.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // ── Inject shared navbar ──────────────────────────────────────────────────
  var existingNav = document.getElementById('navbar');
  fetch('../../nav.html')
    .then(function(r){ return r.text(); })
    .then(function(html){
      var tmp = document.createElement('div');
      tmp.innerHTML = html;
      var newNav = tmp.querySelector('nav');
      if (newNav) {
        if (existingNav) {
          existingNav.parentNode.replaceChild(newNav, existingNav);
        } else {
          document.body.insertBefore(newNav, document.body.firstChild);
        }
      }
      injectThemeButton();
      setupMobileMenu();
    })
    .catch(function(){
      // If fetch fails (e.g. local file://) leave existing nav in place
      injectThemeButton();
      setupMobileMenu();
    });

  // ── Logo + duck placement ─────────────────────────────────────────────────
  var block = document.getElementById("logo-block");
  var line1 = document.getElementById("line1");
  var line2 = document.getElementById("line2");
  var duck  = document.getElementById("duck-img");

  if (!block) return;

  var NAV_H   = 64;
  var PX      = 22;
  var DUCK_AR = 2000 / 1116;

  if (window.DUCK_SRC) duck.src = window.DUCK_SRC;

  function place() {
    line1.style.fontSize      = PX + "px";
    line2.style.fontSize      = PX + "px";
    line1.style.letterSpacing = "0.09em";
    line2.style.letterSpacing = "0.09em";

    block.style.left = "clamp(1.5rem, 5vw, 6rem)";
    block.style.top  = ((NAV_H - block.offsetHeight) / 2) + "px";

    var line2W    = line2.offsetWidth;
    var line1W    = line1.offsetWidth;
    var blockLeft = parseFloat(window.getComputedStyle(block).left) || 48;
    var line1Left = blockLeft + (line2W - line1W) / 2;
    var duckH     = line1.offsetHeight || PX;
    var duckW     = Math.round(duckH * DUCK_AR);

    duck.style.width   = duckW + "px";
    duck.style.height  = duckH + "px";
    duck.style.left    = Math.max(4, line1Left - duckW - 12) + "px";
    duck.style.top     = block.style.top;
    duck.style.opacity = "1";
  }

  place();
  setTimeout(place, 100);
  setTimeout(place, 500);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function() { place(); });
  }
  window.addEventListener("resize", place);

  // ── Scroll reveal ─────────────────────────────────────────────────────────
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    reveals.forEach(function(el) { io.observe(el); });
  } else {
    reveals.forEach(function(el) { el.classList.add("visible"); });
  }
})();
