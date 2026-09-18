/* theme.js — läses in tidigt i <head> på alla sidor för att undvika flimmer */
(function(){
  var saved = localStorage.getItem('sak-theme');
  if (saved === 'light') document.documentElement.setAttribute('data-theme', 'light');
})();
