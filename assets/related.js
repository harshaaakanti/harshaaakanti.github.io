/* Fills the "Keep reading" block on article pages with a random pick of other posts
   on every load. The static links in the page stay as the no-JS fallback.
   Add one line here for each new article (newest first). */
(function () {
  var POSTS = [
    {"slug": "how-i-used-ai-to-build-my-portfolio-website", "key": "ai-site", "k": "Building with AI", "h": "How I used AI to build and run my portfolio website", "p": "Nine pull requests from an AI assistant: faster fonts, blog search, ads with consent, and the moments a human still had to step in."},
    {"slug": "ai-assisted-soc-alert-triage", "key": "triage", "k": "SOC automation", "h": "Cutting L1 triage from 15 minutes to 30 seconds", "p": "How the enrichment pipeline behind 30-second triage is built, step by step, and an honest list of what it still gets wrong."},
    {"slug": "reduce-siem-false-positives-detection-tuning", "key": "tuning", "k": "Detection engineering", "h": "Tuning detections to remove 35% of false positives", "p": "A practical playbook for cutting false positives from custom SIEM detections by about 35% without losing coverage."},
    {"slug": "llm-security-risks-in-the-soc", "key": "llm-risk", "k": "AI security", "h": "Can LLMs be trusted in the SOC?", "p": "Prompt injection in alert data, hallucinated IOCs and over-privileged agents, and the guardrails that make LLMs safe to use."},
    {"slug": "threat-hunting-walkthrough-llmjacking-aws", "key": "hunt", "k": "Threat hunting", "h": "A threat hunt walkthrough, from hypothesis to detection", "p": "One hunt from start to finish: the hypothesis, the CloudTrail queries, what turned up, and the detection that came out of it."},
    {"slug": "detection-as-code", "key": "dac", "k": "Detection engineering", "h": "Detection-as-code: treating detection rules like software", "p": "Version control, tests, peer review and CI for detection rules, and why they make a SOC faster and safer."},
    {"slug": "incident-response-lessons-learned", "key": "ir", "k": "Incident response", "h": "Incident response lessons from the field", "p": "The incident response mistakes that cost time or evidence, anonymised, and what I would do differently next time."},
    {"slug": "from-offensive-security-to-blue-team", "key": "red-blue", "k": "Career", "h": "From offensive security to blue team", "p": "What three years of hunting bugs taught me about catching attackers, and what I had to unlearn on the blue side."},
    {"slug": "soc-analyst-starter-kit", "key": "starter", "k": "Career", "h": "A SOC analyst's starter kit", "p": "The tools, skills and habits I recommend to every new SOC analyst, from years of training intern cohorts."},
    {"slug": "mfa-is-not-your-last-line-of-defense", "key": "mfa", "k": "Identity security", "h": "MFA is not your last line of defense", "p": "Info-stealers lift session cookies and tokens, so attackers skip the login entirely. What to detect and change instead."},
    {"slug": "ai-will-not-replace-l1-soc-analysts", "key": "ai-soc", "k": "SOC automation", "h": "AI will not replace L1 SOC analysts", "p": "How LLMs and the Model Context Protocol cut first-pass triage from 15 minutes to 30 seconds, and why that helps analysts."}
  ];
  var SHOW = 2;
  var list = document.querySelector('.related-list[data-current]');
  if (!list || !list.replaceChildren) return;
  var cur = list.getAttribute('data-current');
  var from = '';
  POSTS.forEach(function (p) { if (p.slug === cur) from = p.key; });
  var pool = POSTS.filter(function (p) { return p.slug !== cur; });
  for (var i = pool.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1)), t = pool[i];
    pool[i] = pool[j]; pool[j] = t;
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }
  var frag = document.createDocumentFragment();
  pool.slice(0, SHOW).forEach(function (p) {
    var a = el('a');
    a.href = '/writing/' + p.slug + '/';
    a.setAttribute('data-ga', 'related_post_click');
    a.setAttribute('data-ga-from', from);
    a.setAttribute('data-ga-to', p.key);
    a.appendChild(el('span', 'k', p.k));
    a.appendChild(el('h3', '', p.h));
    a.appendChild(el('p', '', p.p));
    a.appendChild(el('span', 'more', 'Read article →'));
    var li = el('li');
    li.appendChild(a);
    frag.appendChild(li);
  });
  list.replaceChildren(frag);
})();
