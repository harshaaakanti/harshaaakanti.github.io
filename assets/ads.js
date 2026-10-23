/* Google AdSense for the blog. Loaded only by /writing/ and /writing/<slug>/ pages, never the homepage.
   Slot IDs come from AdSense (Ads → By ad unit). A box without a valid slot ID is removed,
   and if no box is left nothing is fetched.
   The AdSense script is only requested once the first ad box is close to the viewport. */
(function () {
  var CLIENT = 'ca-pub-8741162790097644';
  // writing-list reuses the after-article unit; give it its own unit for separate reporting.
  var SLOTS = { 'in-article': '3300455830', 'after-article': '4910592962', 'writing-list': '4910592962' };

  var boxes = [].slice.call(document.querySelectorAll('.ad[data-ad]')).filter(function (b) {
    if (/^[1-9]\d{9}$/.test(SLOTS[b.dataset.ad] || '')) return true;
    b.remove();
    return false;
  });
  if (!boxes.length) return;

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
