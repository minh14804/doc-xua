/* Đọc Xưa — web đọc truyện tĩnh, nội dung lấy từ Wikisource tiếng Việt lúc người đọc mở trang. */
(function () {
  "use strict";
  var C = window.SITE_CONFIG;
  var A = C.affiliate || {};
  var $app = document.getElementById("app");
  var cache = new Map();      // title -> page
  var existence = null;       // Map catalogTitle -> resolvedTitle | null

  /* ---------- lưu trữ an toàn ---------- */
  function load(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  /* ---------- tiện ích ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function route(t) { return "#/doc/" + encodeURIComponent(t); }
  function lastPart(t) { var i = t.lastIndexOf("/"); return i < 0 ? t : t.slice(i + 1); }
  function parentOf(t) { var i = t.lastIndexOf("/"); return i < 0 ? null : t.slice(0, i); }
  function rootOf(t) { return t.split("/")[0]; }
  function setTitle(t) { document.title = t ? t + " · " + C.siteName : C.siteName; }
  /* các nguồn Wikisource: vi (mặc định), en ... — khai báo trong config.wikis */
  var WIKIS = Object.assign({ vi: { api: C.wikiApi, base: C.wikiBase } }, C.wikis || {});
  function langOf(t) {
    var root = rootOf(t);
    var b = C.catalog.find(function (x) { return x.title === root || (existence && existence.get(x.title) === root); });
    return (b && b.wiki && WIKIS[b.wiki]) ? b.wiki : "vi";
  }
  function api(params, lang) {
    var qs = Object.keys(params).map(function (k) { return k + "=" + encodeURIComponent(params[k]); }).join("&");
    return fetch(WIKIS[lang || "vi"].api + "?format=json&formatversion=2&origin=*&" + qs).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  }
  function book(t) {
    var root = rootOf(t);
    return C.catalog.find(function (b) { return b.title === root || (existence && existence.get(b.title) === root); }) || null;
  }
  function visibleBooks() {
    return C.catalog.filter(function (b) { return !existence || existence.get(b.title); });
  }
  function bookHref(b) { return route(existence && existence.get(b.title) || b.title); }

  /* ---------- bìa tự vẽ ---------- */
  /* bảng màu pastel: [nền bìa, hoạ tiết, chữ] */
  var PALETTES = [
    ["#f9d5df", "#f2a7bd", "#5a2236"], ["#e6dcf5", "#b9a3e3", "#3a2560"], ["#fde2cf", "#f5b58c", "#5b3016"],
    ["#d9ecdf", "#a3cfb2", "#22432f"], ["#fbe9b7", "#f0cd6e", "#4d3a08"], ["#f6d0c8", "#e79a8b", "#5a2419"],
    ["#d6e6f5", "#9ec2e6", "#1f3a57"], ["#efd3ea", "#d79fcd", "#4f2148"], ["#f3e3d3", "#d9b391", "#4a3020"],
    ["#c96a8e", "#e8a2bd", "#ffffff"], ["#8f78c9", "#bba8ec", "#ffffff"]
  ];
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  function palette(t) { return PALETTES[hash(rootOf(t)) % PALETTES.length]; }
  var thumbs = {};   // tên trang Wikisource -> ảnh bìa (Wikimedia Commons)
  function coverImg(t) {
    var root = rootOf(t);
    var b = C.catalog.find(function (x) { return x.title === root || (existence && existence.get(x.title) === root); });
    if (b && b.cover) return b.cover;
    return thumbs[root] || (b && thumbs[b.title]) || null;
  }
  function cover(t, author) {
    var img = coverImg(t);
    if (img) {
      return '<span class="cover has-img"><img src="' + esc(img) + '" alt="Bìa ' + esc(rootOf(t)) + '" loading="lazy" referrerpolicy="no-referrer"></span>';
    }
    var p = palette(t), name = rootOf(t);
    var size = name.length > 14 ? "18px" : name.length > 8 ? "21px" : "25px";
    return '<span class="cover" style="--c1:' + p[0] + ';--c2:' + p[1] + ';--c3:' + p[2] + ';--ct-size:' + size + '">' +
      '<span class="flower"></span><span class="ct">' + esc(name) + '</span><span class="ca">' + esc(author || "Đọc Xưa") + '</span></span>';
  }
  function card(b, extra) {
    return '<a class="card" href="' + (extra && extra.href || bookHref(b)) + '">' + cover(b.title, b.author) +
      '<span class="t">' + esc(b.title) + '</span>' +
      (extra && extra.bar != null ? '<span class="bar"><i style="width:' + extra.bar + '%"></i></span>' : "") +
      '<span class="m">' + esc(extra && extra.meta || (b.author + " · " + b.genre)) + '</span></a>';
  }

  /* ---------- tiến độ & thư viện ---------- */
  function progress() { return load("dx.progress", {}); }
  function library() { return load("dx.library", []); }
  function inLibrary(root) { return library().indexOf(root) >= 0; }
  function toggleLibrary(root) {
    var l = library(), i = l.indexOf(root);
    if (i >= 0) l.splice(i, 1); else l.unshift(root);
    save("dx.library", l); return i < 0;
  }

  /* ---------- kiểm tra tác phẩm còn trên Wikisource ---------- */
  function checkCatalog() {
    if (existence) return Promise.resolve(existence);
    var remote = C.catalog.filter(function (b) { return b.source !== "local"; });
    var titles = remote.map(function (b) { return b.title; });
    var locals = C.catalog.filter(function (b) { return b.source === "local"; });
    var batches = [];
    Object.keys(WIKIS).forEach(function (lang) {
      var ts = remote.filter(function (b) { return (b.wiki || "vi") === lang; }).map(function (b) { return b.title; });
      for (var i = 0; i < ts.length; i += 50) batches.push({ lang: lang, titles: ts.slice(i, i + 50) });
    });
    return Promise.all(batches.map(function (bt) {
      return api({ action: "query", redirects: 1, titles: bt.titles.join("|"), prop: "pageimages", piprop: "thumbnail", pithumbsize: 480, pilimit: 50 }, bt.lang)
        .catch(function () { return {}; });
    })).then(function (ds) {
      var d = { query: { normalized: [], redirects: [], pages: [] } };
      ds.forEach(function (x) { var q = x.query || {}; ["normalized", "redirects", "pages"].forEach(function (k) { d.query[k] = d.query[k].concat(q[k] || []); }); });
      return d;
    }).then(function (d) {
      var q = d.query || {}, map = new Map(), alias = {}, ok = {};
      locals.forEach(function (b) { map.set(b.title, b.title); });
      (q.normalized || []).forEach(function (n) { alias[n.from] = n.to; });
      (q.redirects || []).forEach(function (n) { alias[n.from] = n.to; });
      (q.pages || []).forEach(function (p) {
        if (!p.missing && !p.invalid) ok[p.title] = true;
        if (p.thumbnail && p.thumbnail.source) thumbs[p.title] = p.thumbnail.source;
      });
      titles.forEach(function (t) {
        var r = t; for (var i = 0; i < 3 && alias[r]; i++) r = alias[r];
        map.set(t, ok[r] ? r : null);
      });
      existence = map; return map;
    }).catch(function () { return null; });
  }

  /* ---------- tải & làm sạch một trang ---------- */
  /* truyện riêng lưu trong repo: thư mục stories/<slug>/ */
  function localBook(t) {
    return C.catalog.find(function (b) { return b.source === "local" && b.title === rootOf(t); }) || null;
  }
  function fetchLocal(lb, title) {
    var chs = (lb.chapters || []).map(function (c) { return { title: lb.title + "/" + c.label, label: c.label, file: c.file }; });
    if (title === lb.title) {
      var p = { title: title, chapters: chs, html: "", textLength: 0, words: 0, isStory: true };
      cache.set(title, p); return Promise.resolve(p);
    }
    var ch = chs.find(function (c) { return c.title === title; });
    if (!ch) return Promise.reject(new Error("missing"));
    return fetch("stories/" + lb.slug + "/" + ch.file, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error("missing"); return r.text();
    }).then(function (txt) {
      var html = /\.txt$/i.test(ch.file)
        ? txt.split(/\n\s*\n/).map(function (p) { return "<p>" + esc(p.trim()).replace(/\n/g, "<br>") + "</p>"; }).join("")
        : txt;
      var doc = new DOMParser().parseFromString(html, "text/html");
      doc.querySelectorAll("script,style,iframe,object,embed").forEach(function (n) { n.remove(); });
      var text = doc.body.textContent.replace(/\s+/g, " ").trim();
      var p = { title: title, chapters: [], html: doc.body.innerHTML, textLength: text.length, words: text.split(" ").length };
      cache.set(title, p); return p;
    });
  }

  function fetchPage(title) {
    if (cache.has(title)) return Promise.resolve(cache.get(title));
    var lb = localBook(title);
    if (lb) return fetchLocal(lb, title);
    var lang = langOf(title);
    return api({ action: "parse", page: title, redirects: 1, prop: "text", disableeditsection: 1 }, lang).then(function (d) {
      if (d.error) throw new Error(d.error.code === "missingtitle" ? "missing" : d.error.info);
      var real = d.parse.title, page = clean(d.parse.text, real, WIKIS[lang].base);
      page.title = real; cache.set(title, page); cache.set(real, page);
      return page;
    });
  }
  function clean(html, title, base) {
    var doc = new DOMParser().parseFromString(html, "text/html"), root = doc.body;
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
        if (t.indexOf(":") < 0) {
          a.setAttribute("href", route(t));
          if (t.indexOf(title + "/") === 0 && !seen[t]) { seen[t] = 1; chapters.push({ title: t, label: a.textContent.trim() || lastPart(t) }); }
        } else {
          a.setAttribute("href", (base || C.wikiBase) + href.slice(6)); a.target = "_blank"; a.rel = "noopener"; a.className = "ext";
        }
      } else if (/^https?:|^\/\//.test(href)) {
        a.target = "_blank"; a.rel = "noopener nofollow";
        if (href.indexOf("//") === 0) a.setAttribute("href", "https:" + href);
      } else if (href.indexOf("/w/") === 0) {
        a.replaceWith(doc.createTextNode(a.textContent));
      }
    });
    root.querySelectorAll("img").forEach(function (img) {
      ["src", "srcset"].forEach(function (k) { var v = img.getAttribute(k); if (v) img.setAttribute(k, v.replace(/(^|\s)\/\//g, "$1https://")); });
      img.loading = "lazy";
    });
    root.querySelectorAll("[style]").forEach(function (n) {
      n.style.removeProperty("color"); n.style.removeProperty("background"); n.style.removeProperty("background-color");
    });
    var text = root.textContent.replace(/\s+/g, " ").trim();
    return { html: root.innerHTML, chapters: chapters, textLength: text.length, words: text.split(" ").length };
  }

  /* ---------- trang chủ ---------- */
  function continueItems() {
    var p = progress();
    return Object.keys(p).map(function (k) { return Object.assign({ root: k }, p[k]); })
      .sort(function (a, b) { return b.at - a.at; }).slice(0, 12);
  }
  function viewHome() {
    setTitle(""); nav("home");
    var books = visibleBooks();
    /* trang chủ chỉ hiện truyện có ảnh bìa; truyện chưa có bìa nằm trong trang thể loại */
    var covered = books.filter(function (b) { return !!coverImg(b.title); });
    var feat = covered.find(function (b) { return b.title === C.featured; }) || covered[0] ||
      books.find(function (b) { return b.title === C.featured; }) || books[0];
    var html = '<div class="wrap">';
    if (feat) {
      var fp = palette(feat.title);
      html += '<section class="feature" style="--fc1:' + fp[0] + ';--fc3:' + fp[2] + '">' + cover(feat.title, feat.author) +
        '<div><div class="feature-k">Truyện nổi bật</div><h1>' + esc(feat.title) + '</h1>' +
        '<div class="by">' + esc(feat.author) + ' · ' + esc(feat.year) + '</div>' +
        '<p>' + esc(feat.blurb || "") + '</p><div class="acts">' +
        '<a class="btn" href="' + bookHref(feat) + '">Đọc ngay</a>' +
        '<button class="btn line" type="button" data-lib="' + esc(feat.title) + '">' + (inLibrary(feat.title) ? "Đã lưu vào thư viện" : "+ Thêm vào thư viện") + '</button>' +
        '</div></div></section>';
    }
    var cont = continueItems();
    if (cont.length) {
      html += rowHtml("Đọc tiếp", "Quay lại đúng chương bạn đang đọc", cont.map(function (c) {
        var b = book(c.root) || { title: c.root, author: "", genre: "" };
        return card(b, { href: route(c.title), bar: c.total ? Math.round((c.idx + 1) / c.total * 100) : null, meta: c.label });
      }));
    }
    (C.shelves || []).forEach(function (s) {
      var all = books.filter(function (b) { return (b.tags || []).indexOf(s.tag) >= 0; });
      var list = all.filter(function (b) { return !!coverImg(b.title); });
      if (list.length) html += rowHtml(s.name, s.sub, list.map(function (b) { return card(b); }), s.tag, all.length);
    });
    html += '<div class="genres">' + (C.shelves || []).map(function (s) {
      return '<a class="chip" href="#/browse/' + encodeURIComponent(s.tag) + '">' + esc(s.name) + '</a>';
    }).join("") + '</div></div>';
    $app.innerHTML = html;
    bindRows(); bindLib();
  }
  function rowHtml(name, sub, cards, tag, total) {
    return '<section class="row"><div class="row-h"><div><h2>' + esc(name) + '</h2>' + (sub ? '<p>' + esc(sub) + '</p>' : "") + '</div>' +
      (tag ? '<a class="see-all" href="#/browse/' + encodeURIComponent(tag) + '">Xem tất cả ' + total + ' truyện ›</a>' : "") +
      '<div class="row-nav"><button type="button" data-dir="-1" aria-label="Lùi">‹</button><button type="button" data-dir="1" aria-label="Tiếp">›</button></div></div>' +
      '<div class="rail">' + cards.join("") + '</div></section>';
  }
  function bindRows() {
    $app.querySelectorAll(".row").forEach(function (row) {
      var rail = row.querySelector(".rail");
      row.querySelectorAll(".row-nav button").forEach(function (b) {
        b.addEventListener("click", function () { rail.scrollBy({ left: Number(b.dataset.dir) * rail.clientWidth * 0.85, behavior: "smooth" }); });
      });
    });
  }
  function bindLib() {
    $app.querySelectorAll("[data-lib]").forEach(function (b) {
      b.addEventListener("click", function () {
        var added = toggleLibrary(b.dataset.lib);
        b.textContent = added ? "Đã lưu vào thư viện" : "+ Thêm vào thư viện";
      });
    });
  }

  /* ---------- thể loại ---------- */
  function viewBrowse(tag) {
    setTitle("Thể loại"); nav("browse");
    var books = visibleBooks();
    var list = tag ? books.filter(function (b) { return (b.tags || []).indexOf(tag) >= 0; }) : books;
    var shelf = (C.shelves || []).find(function (s) { return s.tag === tag; });
    $app.innerHTML = '<div class="wrap"><div class="page-h"><h1>' + esc(shelf ? shelf.name : "Tất cả truyện") + '</h1><p>' + list.length + ' tác phẩm</p></div>' +
      '<div class="genres" style="margin:16px 0 28px"><a class="chip" href="#/browse"' + (tag ? "" : ' aria-pressed="true"') + '>Tất cả</a>' +
      (C.shelves || []).map(function (s) { return '<a class="chip" href="#/browse/' + encodeURIComponent(s.tag) + '"' + (s.tag === tag ? ' aria-pressed="true"' : "") + '>' + esc(s.name) + '</a>'; }).join("") +
      '</div><div class="grid">' + list.map(function (b) { return card(b); }).join("") + '</div></div>';
  }

  /* ---------- thư viện ---------- */
  function viewLibrary() {
    setTitle("Thư viện"); nav("library");
    var saved = library().map(function (t) { return book(t) || { title: t, author: "", genre: "" }; });
    var cont = continueItems();
    var html = '<div class="wrap"><div class="page-h"><h1>Thư viện của bạn</h1><p>Lưu trên trình duyệt này, không cần tài khoản.</p></div>';
    html += '<section class="row"><div class="row-h"><div><h2>Đang đọc</h2></div></div>' + (cont.length ? '<div class="grid">' + cont.map(function (c) {
      var b = book(c.root) || { title: c.root, author: "", genre: "" };
      return card(b, { href: route(c.title), bar: c.total ? Math.round((c.idx + 1) / c.total * 100) : null, meta: c.label });
    }).join("") + '</div>' : '<div class="empty">Chưa đọc truyện nào. <a href="#/">Khám phá tủ sách</a></div>') + '</section>';
    html += '<section class="row"><div class="row-h"><div><h2>Đã lưu</h2></div></div>' + (saved.length ? '<div class="grid">' + saved.map(function (b) { return card(b); }).join("") + '</div>' :
      '<div class="empty">Bấm “Thêm vào thư viện” ở trang truyện để lưu lại.</div>') + '</section></div>';
    $app.innerHTML = html;
  }

  /* ---------- tìm kiếm ---------- */
  function viewSearch(q) {
    setTitle("Tìm: " + q); nav("");
    document.getElementById("q").value = q;
    var local = visibleBooks().filter(function (b) {
      var s = (b.title + " " + b.author).toLowerCase(); return s.indexOf(q.toLowerCase()) >= 0;
    });
    $app.innerHTML = '<div class="wrap"><div class="page-h"><h1>Kết quả cho “' + esc(q) + '”</h1></div>' +
      (local.length ? '<section class="row"><div class="row-h"><div><h2>Trong tủ sách</h2></div></div><div class="grid">' + local.map(function (b) { return card(b); }).join("") + '</div></section>' : "") +
      '<section class="row"><div class="row-h"><div><h2>Trên Wikisource</h2></div></div><div class="state" id="wsres">Đang tìm…</div></section></div>';
    api({ action: "query", list: "search", srsearch: q, srnamespace: 0, srlimit: 30 }).then(function (d) {
      var hits = (d.query && d.query.search) || [], box = document.getElementById("wsres");
      if (!box) return;
      if (!hits.length) { box.textContent = "Không tìm thấy thêm tác phẩm nào. Thử tên tác giả hoặc tên truyện khác."; return; }
      var ul = document.createElement("ul"); ul.className = "results";
      ul.innerHTML = hits.map(function (h) {
        return '<li><a href="' + route(h.title) + '">' + esc(h.title) + '</a><p>' + esc(h.snippet.replace(/<[^>]+>/g, "")) + '…</p></li>';
      }).join("");
      box.replaceWith(ul);
    }).catch(function () { var b = document.getElementById("wsres"); if (b) b.textContent = "Không kết nối được Wikisource. Kiểm tra mạng rồi thử lại."; });
  }

  /* ---------- affiliate ---------- */
  function pickLink() { var l = A.links || []; return l[Math.floor(Math.random() * l.length)]; }
  /* Popup affiliate:
     - mỗi lần mở một chương (khác chương vừa xem) thì cộng 1;
     - đủ gateEvery chương → bật cờ "đang chờ bấm link" (lưu trên máy);
     - còn cờ thì chương nào, truyện nào cũng hiện popup cho tới khi bấm link;
     - bấm link → xoá cờ, đếm lại từ 0. */
  function gateOn() { return !!(A.enabled && A.gateEvery && (A.links || []).length); }
  function countChapter(title) {
    if (!gateOn()) return;
    if (load("dx.lastViewed", "") === title) return;   // tải lại cùng chương không tính
    save("dx.lastViewed", title);
    var n = load("dx.sinceGate", 0) + 1;
    save("dx.sinceGate", n);
    if (n >= A.gateEvery) save("dx.gatePending", true);
  }
  function showGateIfPending() {
    var old = document.getElementById("gateModal");
    if (old) old.remove();
    document.body.classList.remove("gated");
    if (!gateOn() || !load("dx.gatePending", false)) return;
    var link = pickLink();
    var m = document.createElement("div");
    m.id = "gateModal"; m.className = "gate-modal";
    m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true"); m.setAttribute("aria-labelledby", "gateTitle");
    m.innerHTML = '<div class="gate-card"><div class="gate-icon" aria-hidden="true">♡</div>' +
      '<h3 id="gateTitle">' + esc(A.gateTitle) + '</h3><p>' + esc(A.gateText) + '</p>' +
      '<a class="btn" id="gateBtn" href="' + esc(link.url) + '" target="_blank" rel="noopener sponsored">' + esc(link.label) + ' ↗</a>' +
      '<small>Liên kết tiếp thị liên kết. Truyện mở lại ngay khi bạn bấm.</small></div>';
    document.body.appendChild(m);
    document.body.classList.add("gated");
    var btn = document.getElementById("gateBtn");
    btn.focus();
    btn.addEventListener("click", function () {
      save("dx.gatePending", false);
      save("dx.sinceGate", 0);
      m.remove();
      document.body.classList.remove("gated");
    });
  }
  function bannerHtml(b) {
    if (!A.enabled) return "";
    var link = (b && b.shopee) ? { url: b.shopee, label: "Mua sách " + b.title } : pickLink();
    if (!link) return "";
    return '<div class="aff-banner"><span><span class="aff-tag">Gợi ý</span> · ' + esc(A.bannerText) + '</span>' +
      '<a href="' + esc(link.url) + '" target="_blank" rel="noopener sponsored">' + esc(link.label) + ' ↗</a></div>';
  }

  /* ---------- trang truyện / trình đọc ---------- */
  function viewDoc(title) {
    nav("");
    $app.innerHTML = '<div class="wrap"><div class="state">Đang tải…</div></div>';
    window.scrollTo(0, 0);
    fetchPage(title).then(function (page) {
      if (page.isStory || page.chapters.length >= 2) return viewStory(page);
      return viewReader(page);
    }).catch(function (err) {
      var missing = err && err.message === "missing";
      $app.innerHTML = '<div class="wrap"><div class="state">' +
        (missing ? "Trang “" + esc(title) + "” không có trên Wikisource." : "Không tải được nội dung. Kiểm tra kết nối mạng rồi tải lại trang.") +
        '<p><a class="btn ghost" href="#/">Về trang chủ</a></p></div></div>';
    });
  }

  function viewStory(page) {
    var b = book(page.title), root = rootOf(page.title), isRoot = !parentOf(page.title);
    var name = isRoot ? page.title : lastPart(page.title);
    setTitle(name);
    var seen = load("dx.seen", {}), pr = progress()[root];
    var resume = pr && pr.title.indexOf(page.title + "/") === 0 ? pr : null;
    var first = page.chapters[0];
    var shelfTags = b ? (b.tags || []).map(function (t) { var s = (C.shelves || []).find(function (x) { return x.tag === t; }); return s ? '<a class="tag" href="#/browse/' + encodeURIComponent(t) + '">' + esc(s.name) + '</a>' : ""; }).join("") : "";
    $app.innerHTML = '<div class="wrap">' +
      '<section class="story">' + cover(page.title, b ? b.author : "") +
      '<div><h1>' + esc(name) + '</h1>' +
      '<div class="by">' + (b ? 'của <b>' + esc(b.author) + '</b> · ' + esc(b.year) : (isRoot ? "" : 'thuộc <a href="' + route(parentOf(page.title)) + '">' + esc(parentOf(page.title)) + '</a>')) + '</div>' +
      '<div class="stats"><div class="stat"><b>' + page.chapters.length + '</b><span>Phần</span></div>' +
      (b ? '<div class="stat"><b>' + esc(b.genre) + '</b><span>Thể loại</span></div><div class="stat"><b>' + esc(b.year) + '</b><span>Năm</span></div>' : "") +
      '<div class="stat"><b>Miễn phí</b><span>Phạm vi công cộng</span></div></div>' +
      (b && b.blurb && isRoot ? '<p class="blurb">' + esc(b.blurb) + '</p>' : "") +
      '<div class="acts">' + (resume ? '<a class="btn" href="' + route(resume.title) + '">Đọc tiếp: ' + esc(resume.label) + '</a><a class="btn ghost" href="' + route(first.title) + '">Đọc từ đầu</a>'
        : '<a class="btn" href="' + route(first.title) + '">Bắt đầu đọc</a>') +
      '<button class="btn line" type="button" data-lib="' + esc(root) + '">' + (inLibrary(root) ? "Đã lưu vào thư viện" : "+ Thêm vào thư viện") + '</button></div>' +
      (shelfTags ? '<div class="tags">' + shelfTags + '</div>' : "") +
      '</div></section>' +
      '<section class="parts"><div class="parts-h"><h2>Mục lục</h2><span>' + page.chapters.length + ' phần</span></div><ol class="toc">' +
      page.chapters.map(function (c, i) {
        return '<li><a href="' + route(c.title) + '"><span class="num">' + (i + 1) + '</span><span class="lab">' + esc(c.label) + '</span>' +
          (seen[c.title] ? '<span class="seen">Đã đọc</span>' : "") + '</a></li>';
      }).join("") + '</ol>' +
      (page.textLength > 600 ? '<div class="intro prose" style="margin-top:28px">' + page.html + '</div>' : "") +
      bannerHtml(b) + '</section></div>';
    bindLib();
    showGateIfPending();
  }

  function viewReader(page) {
    var b = book(page.title), root = rootOf(page.title), parent = parentOf(page.title);
    setTitle(page.title.replace(/\//g, " · "));
    var seen = load("dx.seen", {});
    if (!seen[page.title]) { seen[page.title] = 1; save("dx.seen", seen); }
    countChapter(page.title);
    var minutes = Math.max(1, Math.round(page.words / 220));

    $app.innerHTML =
      '<div class="readbar"><div class="readbar-in wrap">' +
      '<a class="mini" href="' + route(parent || root) + '" aria-label="Về trang truyện">' + cover(root, "") + '</a>' +
      '<div class="info"><a href="' + route(parent || root) + '">' + esc(parent ? lastPart(parent) : root) + '</a><span>' + esc(lastPart(page.title)) + ' · ' + minutes + ' phút đọc</span></div>' +
      '<label class="sr" for="chSel">Chọn chương</label><select id="chSel" hidden></select></div></div>' +
      '<div class="wrap"><article class="reader"><h1>' + esc(lastPart(page.title)) + '</h1>' +
      '<div class="prose" id="prose">' + page.html + '</div>' +
      '<div class="pager" id="pager"></div>' + bannerHtml(b) + '</article></div>';
    showGateIfPending();
    var p = progress();
    p[root] = { title: page.title, label: lastPart(page.title), idx: 0, total: 0, at: Date.now() };
    save("dx.progress", p);
    if (parent) wireChapters(page.title, parent, root);
  }

  function wireChapters(title, parent, root) {
    fetchPage(parent).then(function (pp) {
      var list = pp.chapters, i = list.findIndex(function (c) { return c.title === title; });
      if (i < 0) return;
      var p = progress();
      if (p[root] && p[root].title === title) { p[root].idx = i; p[root].total = list.length; p[root].label = list[i].label; save("dx.progress", p); }
      var sel = document.getElementById("chSel");
      if (sel) {
        sel.innerHTML = list.map(function (c, k) { return '<option value="' + esc(c.title) + '"' + (k === i ? " selected" : "") + '>' + (k + 1) + '. ' + esc(c.label) + '</option>'; }).join("");
        sel.hidden = false;
        sel.addEventListener("change", function () { location.hash = route(sel.value); });
      }
      var el = document.getElementById("pager"); if (!el) return;
      var prev = list[i - 1], next = list[i + 1];
      el.innerHTML =
        (prev ? '<a class="btn ghost" href="' + route(prev.title) + '">← ' + esc(prev.label) + '</a>' : '<a class="btn ghost" href="' + route(parent) + '">← Mục lục</a>') +
        (next ? '<a class="btn next" href="' + route(next.title) + '">' + esc(next.label) + ' →</a>' : '<a class="btn next" href="' + route(parent) + '">Hết truyện · Mục lục</a>');
      if (next) fetchPage(next.title).catch(function () {});
    }).catch(function () {});
  }

  /* ---------- định tuyến ---------- */
  function nav(key) {
    document.querySelectorAll("[data-nav]").forEach(function (a) { a.classList.toggle("on", a.dataset.nav === key); });
  }
  function render() {
    var h = location.hash.replace(/^#/, "");
    var go = function () {
      if (h.indexOf("/doc/") === 0) return viewDoc(decodeURIComponent(h.slice(5)));
      if (h.indexOf("/search/") === 0) return viewSearch(decodeURIComponent(h.slice(8)));
      if (h.indexOf("/browse") === 0) return viewBrowse(decodeURIComponent(h.slice(8)) || "");
      if (h.indexOf("/library") === 0) return viewLibrary();
      viewHome();
    };
    if (existence) return go();
    $app.innerHTML = '<div class="wrap"><div class="state">Đang tải tủ sách…</div></div>';
    checkCatalog().then(go);
  }
  window.addEventListener("hashchange", function () { window.scrollTo(0, 0); render(); });

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
    delete r.dataset.theme;   /* sáng/tối luôn theo hệ thống */
    S.theme = "auto";
    if (S.font === "sans") r.dataset.font = "sans"; else delete r.dataset.font;
    r.style.setProperty("--read-size", S.size + "px");
    document.getElementById("sizeOut").textContent = S.size;
    $set.querySelectorAll("[data-theme]").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.theme === S.theme); });
    $set.querySelectorAll("[data-font]").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.font === S.font); });
    save("dx.settings", S);
  }
  $btn.addEventListener("click", function (e) { e.stopPropagation(); $set.hidden = !$set.hidden; $btn.setAttribute("aria-expanded", !$set.hidden); });
  $set.addEventListener("click", function (e) {
    e.stopPropagation();
    var b = e.target.closest("button"); if (!b) return;
    if (b.dataset.size) S.size = Math.min(28, Math.max(14, S.size + Number(b.dataset.size)));
    if (b.dataset.theme) S.theme = b.dataset.theme;
    if (b.dataset.font) S.font = b.dataset.font;
    applySettings();
  });
  document.addEventListener("click", function () { if (!$set.hidden) { $set.hidden = true; $btn.setAttribute("aria-expanded", "false"); } });

  var bar = document.createElement("div"); bar.className = "progress"; document.body.appendChild(bar);
  window.addEventListener("scroll", function () {
    var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
  }, { passive: true });

  document.getElementById("brandName").textContent = C.siteName;
  applySettings();
  render();
})();
