/* Microsoft Clarity: session replays, heatmaps and scroll depth.
   - Loaded only after the page has finished loading, so it never slows the page itself.
   - Text and inputs are masked by Clarity's masking setting (set in the Clarity dashboard).
   - Each session is tagged with where the visit came from (ai / search / social / other,
     plus the referring site and utm_source), so replays can be filtered, e.g. ref_type = ai.
   - Visitors where Google's consent message applies (EEA, UK, Switzerland) are only tracked
     with cookies after they allow "store and/or access information on a device" there. */
(function () {
  var PROJECT_ID = 'zfjsoeg2o9';

  var AI = /(^|\.)(chatgpt\.com|chat\.openai\.com|openai\.com|perplexity\.ai|gemini\.google\.com|bard\.google\.com|copilot\.microsoft\.com|claude\.ai|you\.com|phind\.com|poe\.com|deepseek\.com|meta\.ai|grok\.com|mistral\.ai)$/;
  var SEARCH = /(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com|search\.yahoo\.com|yandex\.[a-z]+|ecosia\.org|search\.brave\.com|baidu\.com)$/;
  var SOCIAL = /(^|\.)(linkedin\.com|lnkd\.in|youtube\.com|youtu\.be|instagram\.com|x\.com|twitter\.com|t\.co|facebook\.com|reddit\.com)$/;
  var AI_UTM = /chatgpt|openai|perplexity|gemini|copilot|claude|deepseek|grok/i;

  function referrerInfo() {
    var host = '';
    try { if (document.referrer) host = new URL(document.referrer).hostname.replace(/^www\./, ''); } catch (e) {}
    var utm = '';
    try { utm = new URLSearchParams(location.search).get('utm_source') || ''; } catch (e) {}
    var type = 'direct';
    if (AI.test(host) || AI_UTM.test(utm)) type = 'ai';
    else if (host && host === location.hostname) type = 'internal';
    else if (SEARCH.test(host)) type = 'search';
    else if (SOCIAL.test(host) || /^(li|linkedin|yt|youtube|ig|instagram|x|twitter)$/i.test(utm)) type = 'social';
    else if (host) type = 'other';
    return { host: host, utm: utm, type: type };
  }

  function tagSession() {
    var r = referrerInfo();
    // Tag the landing page only; later pages in the same visit keep the first tags.
    if (r.type === 'internal') return;
    window.clarity('set', 'ref_type', r.type);
    if (r.host) window.clarity('set', 'ref_host', r.host);
    if (r.utm) window.clarity('set', 'utm_source', r.utm);
    if (r.type === 'ai') window.clarity('event', 'ai_referral');
  }

  // Pass the visitor's choice from Google's consent message (IAB TCF) to Clarity.
  function bridgeConsent(triesLeft) {
    if (typeof window.__tcfapi !== 'function') {
      if (triesLeft > 0) setTimeout(function () { bridgeConsent(triesLeft - 1); }, 500);
      return;
    }
    window.__tcfapi('addEventListener', 2, function (tc, ok) {
      if (!ok || !tc || !tc.gdprApplies) return;
      if (tc.eventStatus !== 'tcloaded' && tc.eventStatus !== 'useractioncomplete') return;
      var allowed = !!(tc.purpose && tc.purpose.consents && tc.purpose.consents[1]);
      window.clarity('consentv2', {
        ad_Storage: 'denied',
        analytics_Storage: allowed ? 'granted' : 'denied'
      });
    });
  }

  function load() {
    if (!/^[a-z0-9]{6,20}$/i.test(PROJECT_ID)) return;
    window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.clarity.ms/tag/' + PROJECT_ID;
    document.head.appendChild(s);
    tagSession();
    bridgeConsent(20);
  }

  if (document.readyState === 'complete') load();
  else window.addEventListener('load', load, { once: true });
})();
