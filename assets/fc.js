/* Google ad blocking recovery message (Funding Choices) for blog pages (/writing/ and articles).
   Kept out of ads.js so blocklists that match "ads" don't stop it. Like ads.js, it only
   loads after the page has finished loading. */
(function () {
  var SRC = 'https://fundingchoicesmessages.google.com/i/pub-8741162790097644?ers=1';

  function load() {
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

  if (document.readyState === 'complete') load();
  else window.addEventListener('load', load, { once: true });
})();
