/* Writing index: search, topic/year filters, sort and pagination.
   The article list is plain HTML so it works without JS; this script only
   hides and reorders the existing items. State is kept in the URL query. */
(function () {
  var form = document.getElementById('finder');
  var list = document.getElementById('posts');
  if (!form || !list || !('replaceState' in history)) return;

  var q = document.getElementById('f-q');
  var tagSel = document.getElementById('f-tag');
  var yearSel = document.getElementById('f-year');
  var sortSel = document.getElementById('f-sort');
  var perSel = document.getElementById('f-per');
  var status = document.getElementById('f-status');
  var clearBtn = document.getElementById('f-clear');
  var empty = document.getElementById('f-empty');
  var pager = document.getElementById('pager');
  var PER_KEY = 'writing-per-page';
  var page = 1;

  function norm(s) {
    s = (s || '').toLowerCase();
    return s.normalize ? s.normalize('NFD').replace(/[̀-ͯ]/g, '') : s;
  }
  function text(el) { return el ? el.textContent.trim() : ''; }

  var posts = Array.prototype.map.call(list.children, function (li, i) {
    var time = li.querySelector('time');
    var date = time ? time.getAttribute('datetime') || '' : '';
    var tags = Array.prototype.map.call(li.querySelectorAll('.tags li'), text);
    return {
      el: li,
      order: i,
      date: date,
      year: date.slice(0, 4),
      tags: tags,
      hay: norm([text(li.querySelector('h2')), text(li.querySelector('p')), tags.join(' ')].join(' '))
    };
  });

  function fill(sel, values) {
    values.forEach(function (v) {
      var o = document.createElement('option');
      o.value = o.textContent = v;
      sel.appendChild(o);
    });
  }
  var tagCount = {};
  posts.forEach(function (p) { p.tags.forEach(function (t) { tagCount[t] = (tagCount[t] || 0) + 1; }); });
  fill(tagSel, Object.keys(tagCount).sort(function (a, b) { return a.localeCompare(b); }));
  Array.prototype.forEach.call(tagSel.options, function (o) {
    if (o.value) o.textContent = o.value + ' (' + tagCount[o.value] + ')';
  });
  var years = {};
  posts.forEach(function (p) { if (p.year) years[p.year] = 1; });
  fill(yearSel, Object.keys(years).sort().reverse());

  function hasOption(sel, v) {
    return Array.prototype.some.call(sel.options, function (o) { return o.value === v; });
  }
  function readStored() {
    try { return localStorage.getItem(PER_KEY); } catch (e) { return null; }
  }

  // Restore state from the URL, falling back to the remembered page size.
  var params = new URLSearchParams(location.search);
  q.value = params.get('q') || '';
  if (hasOption(tagSel, params.get('tag'))) tagSel.value = params.get('tag');
  if (hasOption(yearSel, params.get('year'))) yearSel.value = params.get('year');
  if (params.get('sort') === 'old') sortSel.value = 'old';
  var per = params.get('per') || readStored();
  if (hasOption(perSel, per)) perSel.value = per;
  page = Math.max(1, parseInt(params.get('page'), 10) || 1);

  function writeUrl() {
    var p = new URLSearchParams();
    if (q.value.trim()) p.set('q', q.value.trim());
    if (tagSel.value) p.set('tag', tagSel.value);
    if (yearSel.value) p.set('year', yearSel.value);
    if (sortSel.value !== 'new') p.set('sort', sortSel.value);
    if (perSel.value !== '10') p.set('per', perSel.value);
    if (page > 1) p.set('page', page);
    var s = p.toString();
    history.replaceState(null, '', location.pathname + (s ? '?' + s : '') + location.hash);
  }

  function pageList(cur, total) {
    // 1 … 4 5 6 … 12, always showing first, last and neighbours of the current page.
    var out = [], last = 0;
    for (var i = 1; i <= total; i++) {
      if (i === 1 || i === total || Math.abs(i - cur) <= 1) {
        if (last && i - last > 1) out.push(i - last === 2 ? last + 1 : 0);
        out.push(i);
        last = i;
      }
    }
    return out;
  }

  function button(label, target, opts) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.dataset.page = target;
    if (opts.cls) b.className = opts.cls;
    if (opts.aria) b.setAttribute('aria-label', opts.aria);
    if (opts.current) b.setAttribute('aria-current', 'page');
    if (opts.disabled) b.disabled = true;
    return b;
  }

  function render() {
    var terms = norm(q.value).split(/\s+/).filter(Boolean);
    var tag = tagSel.value, year = yearSel.value;
    var matches = posts.filter(function (p) {
      if (tag && p.tags.indexOf(tag) < 0) return false;
      if (year && p.year !== year) return false;
      return terms.every(function (t) { return p.hay.indexOf(t) >= 0; });
    });
    var dir = sortSel.value === 'old' ? 1 : -1;
    matches.sort(function (a, b) {
      return a.date === b.date ? a.order - b.order : (a.date < b.date ? -dir : dir);
    });

    var size = parseInt(perSel.value, 10) || 10;
    var pages = Math.max(1, Math.ceil(matches.length / size));
    if (page > pages) page = pages;
    var start = (page - 1) * size;
    var shown = matches.slice(start, start + size);

    posts.forEach(function (p) { p.el.hidden = true; });
    shown.forEach(function (p) { p.el.hidden = false; list.appendChild(p.el); });

    var filtered = terms.length || tag || year;
    var noun = matches.length === 1 ? ' article' : ' articles';
    status.textContent = !matches.length ? 'No matching articles'
      : pages > 1 ? 'Showing ' + (start + 1) + '–' + (start + shown.length) + ' of ' + matches.length + noun
      : matches.length + noun + (filtered ? ' found' : '');
    clearBtn.hidden = !filtered;
    empty.hidden = matches.length > 0;

    pager.textContent = '';
    pager.hidden = pages < 2;
    if (pages > 1) {
      pager.appendChild(button('← Prev', page - 1, { aria: 'Previous page', disabled: page === 1 }));
      pageList(page, pages).forEach(function (n) {
        if (!n) {
          var gap = document.createElement('span');
          gap.className = 'gap';
          gap.textContent = '…';
          gap.setAttribute('aria-hidden', 'true');
          pager.appendChild(gap);
        } else {
          pager.appendChild(button(String(n), n, { cls: 'num', aria: 'Page ' + n, current: n === page }));
        }
      });
      var pos = document.createElement('span');
      pos.className = 'pos';
      pos.textContent = page + ' / ' + pages;
      pager.appendChild(pos);
      pager.appendChild(button('Next →', page + 1, { aria: 'Next page', disabled: page === pages }));
    }
    writeUrl();
  }

  function reset() { page = 1; render(); }

  form.addEventListener('submit', function (e) { e.preventDefault(); q.blur(); });
  q.addEventListener('input', reset);
  [tagSel, yearSel, sortSel].forEach(function (s) { s.addEventListener('change', reset); });
  perSel.addEventListener('change', function () {
    try { localStorage.setItem(PER_KEY, perSel.value); } catch (e) {}
    reset();
  });
  function clearAll() {
    q.value = '';
    tagSel.value = yearSel.value = '';
    reset();
  }
  form.addEventListener('reset', function (e) { e.preventDefault(); clearAll(); q.focus(); });
  document.getElementById('f-empty-clear').addEventListener('click', function () { clearAll(); q.focus(); });
  pager.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b || b.disabled) return;
    page = parseInt(b.dataset.page, 10);
    render();
    form.scrollIntoView({ block: 'start' });
    // Move focus to the first article on the new page for keyboard and screen reader users.
    var first = list.querySelector('li:not([hidden]) > a');
    if (first) first.focus({ preventScroll: true });
  });

  form.hidden = false;
  render();
})();
