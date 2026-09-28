/* theme.js — läses in tidigt i <head> på alla sidor för att undvika flimmer.
   Ljust läge är standard. Mörkt läge gäller bara om besökaren valt det. */
(function(){
  var saved = null;
  try { saved = localStorage.getItem('sak-theme'); } catch(e) {}
  document.documentElement.setAttribute('data-theme', saved === 'dark' ? 'dark' : 'light');
})();
