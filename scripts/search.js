(function () {
  var index = window.SEARCH_INDEX || [];
  var input = document.getElementById('search-input');
  var summary = document.getElementById('search-summary');
  var list = document.getElementById('search-results');
  if (!input || !summary || !list) return;

  var params = new URLSearchParams(window.location.search);
  var query = (params.get('q') || '').trim();
  input.value = query;

  function norm(s) {
    return s.toLowerCase().replace(/ё/g, 'е');
  }

  function stem(w) {
    if (w.length >= 7) return w.slice(0, -2);
    if (w.length >= 5) return w.slice(0, -1);
    return w;
  }

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function reEscape(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function plural(n) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return 'страница';
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'страницы';
    return 'страниц';
  }

  if (!query) {
    summary.textContent = 'Введите запрос в строку поиска.';
    return;
  }

  var tokens = norm(query).split(/[^a-z0-9а-я]+/).filter(Boolean);
  var stems = tokens.map(stem);

  var results = [];
  index.forEach(function (item) {
    var text = norm(item.x);
    var title = norm(item.t);
    var score = 0;
    for (var i = 0; i < stems.length; i++) {
      var inText = text.split(stems[i]).length - 1;
      var inTitle = title.indexOf(stems[i]) !== -1;
      if (!inText && !inTitle) return;
      score += inText + (inTitle ? 20 : 0);
    }
    results.push({ item: item, score: score, text: text });
  });

  results.sort(function (a, b) { return b.score - a.score; });

  if (!results.length) {
    summary.textContent = 'По запросу «' + query + '» ничего не найдено. Попробуйте изменить формулировку.';
    return;
  }

  summary.textContent = 'По запросу «' + query + '» найдено: ' + results.length + ' ' + plural(results.length);

  var marker = new RegExp('(' + stems.map(reEscape).join('|') + ')[а-яa-z0-9]*', 'gi');

  results.forEach(function (r) {
    var pos = r.text.indexOf(stems[0]);
    var start = Math.max(0, pos - 70);
    var snippet = r.item.x.substr(start, 220);
    if (start > 0) snippet = '…' + snippet;
    if (start + 220 < r.item.x.length) snippet += '…';

    var li = document.createElement('li');
    li.className = 'search-results__item';
    li.innerHTML =
      '<a class="search-results__link" href="../' + r.item.u + '">' + esc(r.item.t) + '</a>' +
      '<p class="search-results__text">' + esc(snippet).replace(marker, '<mark>$&</mark>') + '</p>';
    list.appendChild(li);
  });
})();
