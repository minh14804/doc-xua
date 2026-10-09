/* Đọc Xưa — web đọc truyện tĩnh, nội dung lấy từ Wikisource tiếng Việt lúc người đọc mở trang. */
(function () {
  "use strict";
  var C = window.SITE_CONFIG;
  var $app = document.getElementById("app");
  var cache = new Map();          // title -> {title, html, chapters}
  var existence = null;           // Map catalogTitle -> resolvedTitle | null

  /* ---------- lưu trữ an toàn ---------- */
  function load(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  /* ---------- tiện ích ---------- */
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function route(t) { return "#/doc/" + encodeURIComponent(t); }
  function lastPart(t) { var i = t.lastIndexOf("/"); return i < 0 ? t : t.slice(i + 1); }
  function parentOf(t) { var i = t.lastIndexOf("/"); return i < 0 ? null : t.slice(0, i); }
  function api(params) {
    var qs = Object.keys(params).map(function (k) { return k + "=" + encodeURIComponent(params[k]); }).join("&");
    return fetch(C.wikiApi + "?format=json&formatversion=2&origin=*&" + qs).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  }
  function setTitle(t) { document.title = t ? t + " · " + C.siteName : C.siteName; }
  function catInfo(t) {
    var root = t.split("/")[0];
    return C.catalog.find(function (b) { return b.title === root || (existence && existence.get(b.title) === root); });
  }

  /* ---------- kiểm tra tác phẩm còn trên Wikisource ---------- */
  function checkCatalog() {
    if (existence) return Promise.resolve(existence);
    var titles = C.catalog.map(function (b) { return b.title; });
    return api({ action: "query", redirects: 1, titles: titles.join("|") }).then(function (d) {
      var q = d.query || {}, map = new Map(), alias = {};
      (q.normalized || []).forEach(function (n) { alias[n.from] = n.to; });
      (q.redirects || []).forEach(function (n) { alias[n.from] = n.to; });
      var ok = {};
      (q.pages || []).forEach(function (p) { if (!p.missing && !p.invalid) ok[p.title] = true; });
      titles.forEach(function (t) {
        var r = t; for (var i = 0; i < 3 && alias[r]; i++) r = alias[r];
        map.set(t, ok[r] ? r : null);
      });
      existence = map; return map;
    }).catch(function () { return null; });
  }

  /* ---------- tải & làm sạch một trang ---------- */
  function fetchPage(title) {
    if (cache.has(title)) return Promise.resolve(cache.get(title));
    return api({ action: "parse", page: title, redirects: 1, prop: "text|displaytitle", disableeditsection: 1 }).then(function (d) {
      if (d.error) throw new Error(d.error.code === "missingtitle" ? "missing" : d.error.info);
      var real = d.parse.title;
      var page = clean(d.parse.text, real);
      page.title = real;
      cache.set(title, page); cache.set(real, page);
      return page;
    });
  }

  function clean(html, title) {
    var doc = new DOMParser().parseFromString(html, "text/html");
    var root = doc.body;
    root.querySelectorAll([
      "script", "style", "link", "meta", ".mw-editsection", ".noprint", ".navbox", ".ws-noexport",
      "#headerContainer", ".headertemplate", ".ws-header", ".wst-header", "#ws-data", ".mw-empty-elt",
      ".licenseContainer", ".licensetpl", ".PDheader", ".sisterproject", ".metadata", "#toc", ".toc"
    ].join(",")).forEach(function (n) { n.remove(); });

    var chapters = [], seen = {};
    root.querySelectorAll("a[href]").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href.indexOf("/wiki/") === 0) {
        var t = decodeURIComponent(href.slice(6).split("#")[0]).replace(/_/g, " ");
        if (t.indexOf(":") < 0) {               // trang nội dung (không phải Tác giả:, Thể loại:…)
          a.setAttribute("href", route(t));
          if (t.indexOf(title + "/") === 0 && !seen[t]) { seen[t] = 1; chapters.push({ title: t, label: a.textContent.trim() || lastPart(t) }); }
        } else {
          a.setAttribute("href", C.wikiBase + href.slice(6)); a.target = "_blank"; a.rel = "noopener"; a.className = "ext";
        }
      } else if (/^https?:|^\/\//.test(href)) {
        a.target = "_blank"; a.rel = "noopener nofollow";
        if (href.indexOf("//") === 0) a.setAttribute("href", "https:" + href);
      } else if (href.indexOf("/w/") === 0) {
        a.replaceWith(doc.createTextNode(a.textContent));   // link sửa đổi / trang chưa có
      }
    });
    root.querySelectorAll("img").forEach(function (img) {
      ["src", "srcset"].forEach(function (k) {
        var v = img.getAttribute(k); if (v) img.setAttribute(k, v.replace(/(^|\s)\/\//g, "$1https://"));
      });
      img.loading = "lazy";
    });
    root.querySelectorAll("[style]").forEach(function (n) {   // bỏ màu cứng để hợp nền sáng/tối
      n.style.removeProperty("color"); n.style.removeProperty("background"); n.style.removeProperty("background-color");
    });
    var text = root.textContent.replace(/\s+/g, " ").trim();
    return { html: root.innerHTML, chapters: chapters, textLength: text.length };
  }

  /* ---------- trang chủ ---------- */
  function viewHome() {
    setTitle("");
    var last = load("dx.last", null);
    var genres = ["Tất cả"].concat(Array.from(new Set(C.catalog.map(function (b) { return b.genre; }))));
    var html =
      '<section class="hero"><h1>' + esc(C.tagline) + '</h1>' +
      '<p>Đọc miễn phí, không cần tài khoản. Nội dung lấy từ kho văn bản mở Wikisource.</p></section>';
    if (last) {
      html += '<div class="section-h"><h2>Đang đọc dở</h2></div>' +
        '<div class="continue"><div class="t">' + esc(last.label) + '<small>' + esc(last.book) + '</small></div>' +
        '<a class="btn" href="' + route(last.title) + '">Đọc tiếp</a></div>';
    }
    html += '<div class="section-h"><h2>Tủ sách</h2><span id="count">' + C.catalog.length + ' tác phẩm</span></div>' +
      '<div class="filters seg" id="filters">' + genres.map(function (g, i) {
        return '<button type="button" data-g="' + esc(g) + '" aria-pressed="' + (i === 0) + '">' + esc(g) + '</button>';
      }).join("") + '</div><div class="shelf" id="shelf">' +
      C.catalog.map(function (b) {
        return '<a class="book" data-g="' + esc(b.genre) + '" data-t="' + esc(b.title) + '" href="' + route(b.title) + '">' +
          '<span class="g">' + esc(b.genre) + '</span><span class="n">' + esc(b.title) + '</span>' +
          '<span class="a">' + esc(b.author) + ' · <span class="y">' + esc(b.year) + '</span></span></a>';
      }).join("") + '</div>';
    $app.innerHTML = html;

    var shelf = document.getElementById("shelf");
    document.getElementById("filters").addEventListener("click", function (e) {
      var btn = e.target.closest("button"); if (!btn) return;
      this.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b === btn); });
      var g = btn.dataset.g;
      shelf.querySelectorAll(".book").forEach(function (el) { el.hidden = g !== "Tất cả" && el.dataset.g !== g; });
    });

    checkCatalog().then(function (map) {
      if (!map) return;
      var n = 0;
      shelf.querySelectorAll(".book").forEach(function (el) {
        var r = map.get(el.dataset.t);
        if (!r) el.classList.add("missing"); else { n++; el.setAttribute("href", route(r)); }
      });
      var c = document.getElementById("count"); if (c) c.textContent = n + " tác phẩm";
    });
  }

  /* ---------- tìm kiếm ---------- */
  function viewSearch(q) {
    setTitle("Tìm: " + q);
    document.getElementById("q").value = q;
    $app.innerHTML = '<div class="reader"><h1>Kết quả cho “' + esc(q) + '”</h1><div class="state">Đang tìm…</div></div>';
    api({ action: "query", list: "search", srsearch: q, srnamespace: 0, srlimit: 30 }).then(function (d) {
      var hits = (d.query && d.query.search) || [];
      var box = $app.querySelector(".state");
      if (!hits.length) { box.textContent = "Không tìm thấy tác phẩm phù hợp. Thử tên tác giả hoặc tên truyện khác."; return; }
      var ul = document.createElement("ul"); ul.className = "results";
      ul.innerHTML = hits.map(function (h) {
        var snip = h.snippet.replace(/<[^>]+>/g, "");
        return '<li><a href="' + route(h.title) + '">' + esc(h.title) + '</a><p>' + esc(snip) + '…</p></li>';
      }).join("");
      box.replaceWith(ul);
    }).catch(function () { $app.querySelector(".state").textContent = "Không kết nối được Wikisource. Kiểm tra mạng rồi thử lại."; });
  }

  /* ---------- affiliate ---------- */
  var A = C.affiliate || {};
  function pickLink() { var l = A.links || []; return l[Math.floor(Math.random() * l.length)]; }
  function isUnlocked() { return Date.now() < load("dx.unlockUntil", 0); }
  function shouldGate() {
    if (!A.enabled || !A.gateEvery || !(A.links || []).length || isUnlocked()) return false;
    var n = load("dx.readCount", 0);
    return n > 0 && n % A.gateEvery === 0;
  }
  function gateHtml(link) {
    return '<div class="gate" id="gate"><h3>' + esc(A.gateTitle) + '</h3><p>' + esc(A.gateText) + '</p>' +
      '<a class="btn" id="gateBtn" href="' + esc(link.url) + '" target="_blank" rel="noopener sponsored">' + esc(link.label) + ' ↗</a>' +
      '<small>Liên kết tiếp thị liên kết. Chương sẽ mở khoá ngay khi bạn bấm.</small></div>';
  }
  function bannerHtml(book) {
    if (!A.enabled) return "";
    var link = (book && book.shopee) ? { url: book.shopee, label: "Mua sách " + book.title } : pickLink();
    if (!link) return "";
    return '<div class="aff-banner"><span><span class="aff-tag">Gợi ý</span> · ' + esc(A.bannerText) + '</span>' +
      '<a href="' + esc(link.url) + '" target="_blank" rel="noopener sponsored">' + esc(link.label) + ' ↗</a></div>';
  }

  /* ---------- trình đọc ---------- */
  function viewDoc(title) {
    $app.innerHTML = '<div class="reader"><div class="state">Đang tải “' + esc(title) + '”…</div></div>';
    window.scrollTo(0, 0);
    fetchPage(title).then(function (page) {
      var parent = parentOf(page.title);
      var isToc = page.chapters.length >= 2;
      var book = catInfo(page.title);
      setTitle(page.title.replace(/\//g, " · "));

      var crumbs = '<nav class="crumbs"><a href="#/">Tủ sách</a>';
      var parts = page.title.split("/"), acc = "";
      parts.slice(0, -1).forEach(function (p) { acc = acc ? acc + "/" + p : p; crumbs += '<span>/</span><a href="' + route(acc) + '">' + esc(p) + '</a>'; });
      crumbs += '</nav>';

      var head = '<div class="reader">' + crumbs + '<h1>' + esc(lastPart(page.title)) + '</h1>';
      if (book && !parent) head = head.replace('</h1>', '</h1><p style="margin:-14px 0 22px;color:var(--muted)">' + esc(book.author) + ' · ' + esc(book.year) + '</p>');

      if (isToc) {
        var intro = page.textLength > 600 ? '<div class="prose">' + page.html + '</div>' : "";
        var first = page.chapters[0];
        $app.innerHTML = head +
          '<p><a class="btn" href="' + route(first.title) + '">Bắt đầu đọc</a></p>' +
          '<div class="section-h"><h2>Mục lục</h2><span>' + page.chapters.length + ' phần</span></div>' +
          '<ol class="toc">' + page.chapters.map(function (c, i) {
            return '<li><a href="' + route(c.title) + '"><span class="num">' + (i + 1) + '</span><span>' + esc(c.label) + '</span></a></li>';
          }).join("") + '</ol>' + intro + bannerHtml(book) + '</div>';
        return;
      }

      // trang nội dung (chương hoặc truyện một trang)
      var counted = load("dx.counted", {});
      if (!counted[page.title]) {
        counted[page.title] = 1; save("dx.counted", counted);
        save("dx.readCount", load("dx.readCount", 0) + 1);
      }
      save("dx.last", { title: page.title, label: lastPart(page.title), book: parent ? parent.split("/")[0] : (book ? book.author : "") });

      var gated = shouldGate();
      var link = gated ? pickLink() : null;
      $app.innerHTML = head +
        '<div class="prose' + (gated ? ' gate-fade' : '') + '" id="prose">' + page.html + '</div>' +
        (gated ? gateHtml(link) : "") +
        '<div class="pager" id="pager"></div>' + bannerHtml(book) + '</div>';

      if (gated) {
        document.getElementById("gateBtn").addEventListener("click", function () {
          save("dx.unlockUntil", Date.now() + (A.unlockMinutes || 30) * 60000);
          document.getElementById("prose").classList.remove("gate-fade");
          document.getElementById("gate").remove();
        });
      }
      if (parent) buildPager(page.title, parent);
    }).catch(function (err) {
      var missing = err && err.message === "missing";
      $app.innerHTML = '<div class="reader"><div class="state">' +
        (missing ? "Trang “" + esc(title) + "” không có trên Wikisource." : "Không tải được nội dung. Kiểm tra kết nối mạng rồi tải lại trang.") +
        '<p><a class="btn ghost" href="#/">Về tủ sách</a></p></div></div>';
    });
  }

  function buildPager(title, parent) {
    fetchPage(parent).then(function (p) {
      var list = p.chapters, i = list.findIndex(function (c) { return c.title === title; });
      var el = document.getElementById("pager"); if (!el || i < 0) return;
      var prev = list[i - 1], next = list[i + 1];
      el.innerHTML =
        (prev ? '<a class="btn ghost" href="' + route(prev.title) + '">← ' + esc(prev.label) + '</a>' : '<a class="btn ghost" href="' + route(parent) + '">← Mục lục</a>') +
        (next ? '<a class="btn" href="' + route(next.title) + '">' + esc(next.label) + ' →</a>' : '<a class="btn ghost" href="' + route(parent) + '">Hết · Mục lục</a>');
      if (next) fetchPage(next.title).catch(function () {});   // tải trước chương sau
    }).catch(function () {});
  }

  /* ---------- định tuyến ---------- */
  function render() {
    var h = location.hash.replace(/^#/, "");
    if (h.indexOf("/doc/") === 0) return viewDoc(decodeURIComponent(h.slice(5)));
    if (h.indexOf("/search/") === 0) return viewSearch(decodeURIComponent(h.slice(8)));
    viewHome();
  }
  window.addEventListener("hashchange", render);

  document.getElementById("searchForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var q = document.getElementById("q").value.trim();
    if (q) location.hash = "#/search/" + encodeURIComponent(q);
  });

  /* ---------- cài đặt đọc ---------- */
  var S = load("dx.settings", { size: 19, theme: "auto", font: "serif" });
  var $set = document.getElementById("settings"), $btn = document.getElementById("settingsBtn");
  function applySettings() {
    var r = document.documentElement;
    if (S.theme === "auto") delete r.dataset.theme; else r.dataset.theme = S.theme;
    if (S.font === "sans") r.dataset.font = "sans"; else delete r.dataset.font;
    r.style.setProperty("--read-size", S.size + "px");
    document.getElementById("sizeOut").textContent = S.size;
    $set.querySelectorAll("[data-theme]").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.theme === S.theme); });
    $set.querySelectorAll("[data-font]").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.font === S.font); });
    save("dx.settings", S);
  }
  $btn.addEventListener("click", function () { $set.hidden = !$set.hidden; $btn.setAttribute("aria-expanded", !$set.hidden); });
  $set.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    if (b.dataset.size) S.size = Math.min(28, Math.max(14, S.size + Number(b.dataset.size)));
    if (b.dataset.theme) S.theme = b.dataset.theme;
    if (b.dataset.font) S.font = b.dataset.font;
    applySettings();
  });

  /* thanh tiến độ đọc */
  var bar = document.createElement("div"); bar.className = "progress"; document.body.appendChild(bar);
  window.addEventListener("scroll", function () {
    var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
  }, { passive: true });

  document.getElementById("brand").textContent = C.siteName;
  applySettings();
  render();
})();
