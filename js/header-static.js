(function() {
  var block = document.getElementById("logo-block");
  var line1 = document.getElementById("line1");
  var line2 = document.getElementById("line2");
  var duck  = document.getElementById("duck-img");

  if (!block) return;

  var NAV_H   = 100;
  var PX      = 22;       // fixed font size for inner pages
  var DUCK_AR = 2000 / 1116;

  if (window.DUCK_SRC) duck.src = window.DUCK_SRC;

  function place() {
    // Set font size
    line1.style.fontSize      = PX + "px";
    line2.style.fontSize      = PX + "px";
    line1.style.letterSpacing = "0.09em";
    line2.style.letterSpacing = "0.09em";

    // Position block vertically centered in navbar
    block.style.left = "clamp(1.5rem, 5vw, 6rem)";
    block.style.top  = ((NAV_H - block.offsetHeight) / 2) + "px";

    // Position duck using real measured widths (same as header.js)
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

  // Run immediately, then after fonts load
  place();
  setTimeout(place, 100);
  setTimeout(place, 500);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function() { place(); });
  }
  window.addEventListener("resize", place);

  // Scroll reveal
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
