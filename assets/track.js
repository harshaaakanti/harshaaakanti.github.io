/* Sends a Google Analytics event for any link marked with data-ga="event_name".
   Extra data-ga-* attributes become event parameters (e.g. data-ga-article="mfa"). */
(function () {
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-ga]');
    if (!el || typeof window.gtag !== 'function') return;
    var params = { transport_type: 'beacon', link_url: el.href || '' };
    for (var k in el.dataset) {
      if (k.indexOf('ga') === 0 && k.length > 2) {
        var name = k.slice(2).replace(/^[A-Z]/, function (c) { return c.toLowerCase(); })
                             .replace(/[A-Z]/g, function (c) { return '_' + c.toLowerCase(); });
        params[name] = el.dataset[k];
      }
    }
    window.gtag('event', el.dataset.ga, params);
  });
})();

/* Sends "article_read" once, when the reader reaches the end of an article
   (the footer with the Discuss button), with the article key and seconds on page. */
(function () {
  var end = document.querySelector('.article-foot');
  if (!end || !('IntersectionObserver' in window)) return;
  var tagged = end.querySelector('[data-ga-article]');
  var io = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', 'article_read', {
      article: tagged ? tagged.getAttribute('data-ga-article') : location.pathname,
      read_seconds: Math.round(performance.now() / 1000)
    });
  });
  io.observe(end);
})();
