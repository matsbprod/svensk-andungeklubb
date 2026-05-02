(function() {
  var navbar = document.getElementById("navbar");
  var block  = document.getElementById("logo-block");
  var line1  = document.getElementById("line1");
  var line2  = document.getElementById("line2");
  var duck   = document.getElementById("duck-img");

  if (!block) return;

  // ── Hamburger menu ──────────────────────────────────────────
  var navLinks = navbar ? navbar.querySelector('.nav-links') : null;
  var burger = document.createElement('button');
  burger.className = 'hamburger';
  burger.setAttribute('aria-label', 'Meny');
  burger.innerHTML = '<span></span><span></span><span></span>';
  document.body.appendChild(burger);

  // Build drawer from existing nav links
  var drawer = document.createElement('div');
  drawer.className = 'nav-drawer';
  if (navLinks) {
    navLinks.querySelectorAll('a').forEach(function(a) {
      var link = document.createElement('a');
      link.href = a.href;
      link.textContent = a.textContent;
      drawer.appendChild(link);
    });
  }
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

  var SCROLL_END = 300;
  var NAV_SMALL  = 220;
  var NAV_LARGE  = 64;
  var SMALL_PX   = 60;
  var LARGE_PX   = 15;
  var DUCK_AR    = 2000 / 1116;

  function clamp(v,a,b){ return Math.min(Math.max(v,a),b); }
  function lerp(a,b,t) { return a+(b-a)*clamp(t,0,1); }
  function easeIO(t)   { return t<.5 ? 2*t*t : -1+(4-2*t)*t; }

  function update() {
    var sy  = window.scrollY;
    var vw  = window.innerWidth;
    var t   = easeIO(clamp(sy / SCROLL_END, 0, 1));

    var navH = Math.round(lerp(NAV_SMALL, NAV_LARGE, t));
    navbar.style.height = navH + "px";

    var curPx   = lerp(SMALL_PX, LARGE_PX, t);
    var spacing = lerp(0.07, 0.10, t);

    line1.style.fontSize      = curPx + "px";
    line1.style.letterSpacing = spacing + "em";
    line2.style.fontSize      = curPx + "px";
    line2.style.letterSpacing = spacing + "em";

    block.style.left = "clamp(1.5rem, 5vw, 6rem)";
    var blockH   = block.offsetHeight || curPx * 2.2;
    var blockTop = (navH - blockH) / 2;
    block.style.top = blockTop + "px";

    // Keep hamburger vertically centred in navbar
    burger.style.top = Math.round((navH - 18) / 2) + "px";

    if (duck) {
      var duckH     = line1.offsetHeight || Math.round(curPx);
      var duckW     = Math.round(duckH * DUCK_AR);
      duck.style.width  = duckW + "px";
      duck.style.height = duckH + "px";
      var line2W    = line2.offsetWidth  || curPx * 10;
      var line1W    = line1.offsetWidth  || curPx * 6;
      var blockLeft = parseFloat(getComputedStyle(block).left) || 48;
      var line1Left = blockLeft + (line2W - line1W) / 2;
      duck.style.left   = clamp(line1Left - duckW - 10, 4, vw - duckW - 4) + "px";
      duck.style.top    = blockTop + "px";
      duck.style.opacity = "1";
    }

    if (navbar) navbar.classList.add("bg");
  }

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();

  if (duck) {
    if (window.DUCK_SRC) duck.src = window.DUCK_SRC;
    setTimeout(function() {
      duck.style.transition = "opacity 0.5s ease";
      duck.style.opacity = "1";
      setTimeout(function() {
        duck.style.transition = "";
        update();
      }, 600);
    }, 200);
  }

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
