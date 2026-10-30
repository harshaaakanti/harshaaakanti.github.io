/* Google AdSense Auto ads. Loaded by the homepage, /writing/ and /writing/<slug>/ pages (not /privacy/ or 404).
   Google decides where ads go on the page (Auto ads must be on in AdSense:
   Ads → By site). The AdSense script is requested only after the page has finished loading, so it never
   competes with the page's own text, fonts and images. */
(function () {
  var CLIENT = 'ca-pub-8741162790097644';

  function load() {
    var s = document.createElement('script');
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + CLIENT;
    document.head.appendChild(s);
  }

  if (document.readyState === 'complete') load();
  else window.addEventListener('load', load, { once: true });
})();
