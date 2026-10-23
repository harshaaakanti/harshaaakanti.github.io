/* Google ad blocking recovery message (Funding Choices) for article pages.
   Kept out of ads.js so blocklists that match "ads" don't stop it. Like ads.js, it only
   loads once the first ad box is close to the viewport. */
(function () {
  var SRC = 'https://fundingchoicesmessages.google.com/i/pub-8741162790097644?ers=1';

  var boxes = [].slice.call(document.querySelectorAll('.ad[data-ad]'));
  if (!boxes.length) return;

  var loaded = false;
  function load() {
    if (loaded) return;
    loaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = SRC;
    document.head.appendChild(s);
    // Google's standard signalGooglefcPresent snippet
    (function signalGooglefcPresent() {
      if (window.frames['googlefcPresent']) return;
      if (!document.body) return setTimeout(signalGooglefcPresent, 0);
      var iframe = document.createElement('iframe');
      iframe.style = 'width: 0; height: 0; border: none; z-index: -1000; left: -1000px; top: -1000px;';
      iframe.style.display = 'none';
      iframe.name = 'googlefcPresent';
      document.body.appendChild(iframe);
    })();
  }

  if (!('IntersectionObserver' in window)) return load();
  var io = new IntersectionObserver(function (entries) {
    if (entries.some(function (e) { return e.isIntersecting; })) { io.disconnect(); load(); }
  }, { rootMargin: '800px 0px' });
  boxes.forEach(function (b) { io.observe(b); });
})();
