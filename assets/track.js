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
