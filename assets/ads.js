/* Google AdSense for article pages. Loaded only by /writing/<slug>/ pages, never the homepage.
   Fill in CLIENT and the slot IDs from AdSense (Ads → By ad unit). Until CLIENT is set,
   nothing is fetched and the reserved ad boxes are removed, so the page looks as before.
   The AdSense script is only requested once the first ad box is close to the viewport. */
(function () {
  var CLIENT = 'ca-pub-XXXXXXXXXXXXXXXX'; // TODO: AdSense publisher ID
  var SLOTS = { 'in-article': '0000000000', 'after-article': '0000000000' }; // TODO: ad unit slot IDs

  var boxes = [].slice.call(document.querySelectorAll('.ad[data-ad]'));
  if (!boxes.length) return;
  if (/X{16}/.test(CLIENT)) { boxes.forEach(function (b) { b.remove(); }); return; }

  var loaded = false;
  function load() {
    if (loaded) return;
    loaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + CLIENT;
    document.head.appendChild(s);
    boxes.forEach(function (b) {
      var ins = document.createElement('ins');
      ins.className = 'adsbygoogle';
      ins.style.display = 'block';
      ins.setAttribute('data-ad-client', CLIENT);
      ins.setAttribute('data-ad-slot', SLOTS[b.dataset.ad] || '');
      ins.setAttribute('data-ad-format', 'auto');
      ins.setAttribute('data-full-width-responsive', 'true');
      b.appendChild(ins);
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    });
  }

  if (!('IntersectionObserver' in window)) return load();
  var io = new IntersectionObserver(function (entries) {
    if (entries.some(function (e) { return e.isIntersecting; })) { io.disconnect(); load(); }
  }, { rootMargin: '800px 0px' });
  boxes.forEach(function (b) { io.observe(b); });
})();
