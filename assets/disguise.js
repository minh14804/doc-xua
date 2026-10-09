/* Đọc Xưa — Chế độ ngụy trang
   Người đọc chọn một ảnh chụp màn hình (bảng tính, phần mềm chỉnh ảnh...), chọn vùng,
   chữ của chương đang đọc được đặt vào vùng đó như thể là một phần của màn hình.
   Phím tắt: → chương sau, ← chương trước, ↓/Space cuộn, Esc thoát.
   Ảnh chỉ lưu trong trình duyệt của người đọc (IndexedDB), không gửi đi đâu. */
(function () {
  "use strict";

  var KEY_ON = "dx.disguiseOn";
  var DEF = { tpl: "sheet", rect: null, font: "sheet", size: 13, color: "#202124", flow: "rows", rowH: 21, tab: "Bảng tính 1" };
  var FONTS = {
    sheet: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
    app: '"Segoe UI", system-ui, -apple-system, Roboto, sans-serif',
    doc: '"Times New Roman", Times, serif'
  };

  /* ---------- lưu trữ ---------- */
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function ssGet(k) { try { return sessionStorage.getItem(k) === "1"; } catch (e) { return false; } }
  function ssSet(k, on) { try { on ? sessionStorage.setItem(k, "1") : sessionStorage.removeItem(k); } catch (e) {} }

  function idb() {
    return new Promise(function (res, rej) {
      try {
        var r = indexedDB.open("doc-xua", 1);
        r.onupgradeneeded = function () { r.result.createObjectStore("kv"); };
        r.onsuccess = function () { res(r.result); };
        r.onerror = function () { rej(r.error); };
      } catch (e) { rej(e); }
    });
  }
  function imgSave(dataUrl) {
    return idb().then(function (db) {
      return new Promise(function (res) {
        var tx = db.transaction("kv", "readwrite"); tx.objectStore("kv").put(dataUrl, "disguiseImg");
        tx.oncomplete = function () { res(true); }; tx.onerror = function () { res(false); };
      });
    }).catch(function () { return false; });
  }
  function imgLoad() {
    return idb().then(function (db) {
      return new Promise(function (res) {
        var q = db.transaction("kv").objectStore("kv").get("disguiseImg");
        q.onsuccess = function () { res(q.result || null); }; q.onerror = function () { res(null); };
      });
    }).catch(function () { return null; });
  }

  function settings() { return Object.assign({}, DEF, lsGet("dx.disguise", {})); }

  /* ---------- lấy nội dung chương đang mở ---------- */
  function chapterText() {
    var prose = document.getElementById("prose");
    var h1 = document.querySelector(".reader h1");
    var t = prose ? prose.innerText : "";
    t = t.replace(/ /g, " ").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
    return { title: h1 ? h1.textContent.trim() : "", text: t };
  }
  function pagerLinks() {
    var pager = document.getElementById("pager");
    if (!pager) return { prev: null, next: null };
    var links = pager.querySelectorAll("a");
    var next = pager.querySelector("a.next");
    var prev = links[0] && links[0] !== next ? links[0] : null;
    return { prev: prev ? prev.getAttribute("href") : null, next: next ? next.getAttribute("href") : null };
  }

  /* ---------- tự tìm vùng trống lớn nhất trong ảnh ---------- */
  function autoRegion(img) {
    var W = 160, H = Math.max(1, Math.round(W * img.naturalHeight / img.naturalWidth));
    var cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    var cx = cv.getContext("2d", { willReadFrequently: true });
    cx.drawImage(img, 0, 0, W, H);
    var px = cx.getImageData(0, 0, W, H).data;
    // màu nền phổ biến nhất (lượng tử hoá)
    var counts = {}, best = null, bestN = 0;
    for (var i = 0; i < px.length; i += 4) {
      var k = (px[i] >> 4) + "," + (px[i + 1] >> 4) + "," + (px[i + 2] >> 4);
      counts[k] = (counts[k] || 0) + 1;
      if (counts[k] > bestN) { bestN = counts[k]; best = [px[i], px[i + 1], px[i + 2]]; }
    }
    // ô "trống" = gần màu nền (cho phép đường kẻ mảnh)
    var ok = new Uint8Array(W * H);
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var j = (y * W + x) * 4;
      var d = Math.abs(px[j] - best[0]) + Math.abs(px[j + 1] - best[1]) + Math.abs(px[j + 2] - best[2]);
      ok[y * W + x] = d < 60 ? 1 : 0;
    }
    // hình chữ nhật lớn nhất toàn ô trống (thuật toán histogram)
    var h = new Array(W).fill(0), area = 0, R = null;
    for (y = 0; y < H; y++) {
      for (x = 0; x < W; x++) h[x] = ok[y * W + x] ? h[x] + 1 : 0;
      var st = [];
      for (x = 0; x <= W; x++) {
        var cur = x === W ? 0 : h[x], start = x;
        while (st.length && st[st.length - 1][1] >= cur) {
          var top = st.pop(), a = top[1] * (x - top[0]);
          if (a > area) { area = a; R = { x: top[0], y: y - top[1] + 1, w: x - top[0], h: top[1] }; }
          start = top[0];
        }
        st.push([start, cur]);
      }
    }
    if (!R) return { x: 10, y: 15, w: 80, h: 70 };
    var pad = 1;
    return {
      x: (R.x + pad) / W * 100, y: (R.y + pad) / H * 100,
      w: Math.max(5, (R.w - pad * 2) / W * 100), h: Math.max(5, (R.h - pad * 2) / H * 100)
    };
  }

  /* ---------- màn hình thiết lập ---------- */
  function openSetup(thenStart) {
    var S = settings();
    var dataUrl = null;
    var box = document.createElement("div");
    box.className = "dg-setup"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true");
    box.innerHTML =
      '<div class="dg-panel">' +
      '<div class="dg-head"><h3>Đọc ngụy trang</h3><button type="button" class="iconbtn" data-x aria-label="Đóng">✕</button></div>' +
      '<div class="dg-tpls" role="radiogroup" aria-label="Kiểu ngụy trang">' +
      '<label class="dg-tpl"><input type="radio" name="dgTpl" value="sheet"><span class="dg-tpl-pic sheet"></span><b>Bảng tính</b><small>Truyện nằm trong các ô của bảng</small></label>' +
      '<label class="dg-tpl"><input type="radio" name="dgTpl" value="design"><span class="dg-tpl-pic design"></span><b>Thiết kế banner</b><small>Truyện là chữ mô tả dưới banner</small></label>' +
      '<label class="dg-tpl"><input type="radio" name="dgTpl" value="image"><span class="dg-tpl-pic image"></span><b>Ảnh của bạn</b><small>Dùng ảnh chụp màn hình bất kỳ</small></label>' +
      '</div>' +
      '<div id="dgImgPart">' +
      '<p class="dg-hint">Chọn hoặc dán (Ctrl+V) ảnh chụp màn hình một phần mềm bất kỳ, rồi <b>kéo chọn vùng</b> muốn chữ hiện lên. Ảnh chỉ lưu trên máy bạn.</p>' +
      '<label class="btn ghost dg-file"><input type="file" accept="image/*" id="dgFile" hidden>Chọn ảnh chụp màn hình</label>' +
      '<div class="dg-preview" id="dgPrev"><div class="dg-empty">Chưa có ảnh</div></div>' +
      '<div class="dg-row"><button type="button" class="btn line" id="dgAuto" disabled>Tự tìm vùng trống</button><span class="dg-note" id="dgNote"></span></div>' +
      '</div>' +
      '<div class="dg-grid">' +
      '<label class="img-only">Kiểu chữ<select id="dgFont"><option value="sheet">Bảng tính (Arial)</option><option value="app">Phần mềm (Segoe UI)</option><option value="doc">Văn bản (Times)</option></select></label>' +
      '<label class="img-only">Kiểu dòng<select id="dgFlow"><option value="rows">Liền dòng như ô bảng tính</option><option value="para">Đoạn văn</option></select></label>' +
      '<label class="img-only">Cỡ chữ (px trên ảnh)<input id="dgSize" type="number" min="8" max="40" step="1"></label>' +
      '<label class="img-only">Chiều cao dòng (px)<input id="dgRowH" type="number" min="10" max="60" step="1"></label>' +
      '<label class="img-only">Màu chữ<input id="dgColor" type="color"></label>' +
      '<label>Tên tab / tên tệp<input id="dgTab" type="text" maxlength="60"></label>' +
      '</div>' +
      '<div class="dg-actions"><button type="button" class="btn ghost" data-x>Huỷ</button><button type="button" class="btn" id="dgGo" disabled>Bắt đầu đọc</button></div>' +
      '</div>';
    document.body.appendChild(box);

    var $ = function (id) { return document.getElementById(id); };
    $("dgFont").value = S.font; $("dgFlow").value = S.flow; $("dgSize").value = S.size;
    $("dgRowH").value = S.rowH; $("dgColor").value = S.color; $("dgTab").value = S.tab;
    var tpl = S.tpl;
    function setTpl(v) {
      tpl = v;
      box.querySelectorAll('input[name="dgTpl"]').forEach(function (r) { r.checked = r.value === v; });
      $("dgImgPart").hidden = v !== "image";
      box.querySelectorAll(".img-only").forEach(function (el) { el.hidden = v !== "image"; });
      $("dgGo").disabled = v === "image" ? !rect || !img : false;
    }
    box.querySelectorAll('input[name="dgTpl"]').forEach(function (r) { r.addEventListener("change", function () { setTpl(r.value); }); });

    var prev = $("dgPrev"), rect = S.rect, img = null, sel = null;
    function drawSel() {
      if (!sel) { sel = document.createElement("div"); sel.className = "dg-sel"; prev.appendChild(sel); }
      if (!rect) { sel.hidden = true; return; }
      sel.hidden = false;
      sel.style.left = rect.x + "%"; sel.style.top = rect.y + "%"; sel.style.width = rect.w + "%"; sel.style.height = rect.h + "%";
      if (tpl === "image") $("dgGo").disabled = false;
    }
    function setImage(url) {
      dataUrl = url;
      prev.innerHTML = ""; sel = null;
      img = new Image(); img.src = url; img.alt = "Ảnh chụp màn hình đã chọn"; img.draggable = false;
      prev.appendChild(img);
      img.onload = function () {
        $("dgAuto").disabled = false;
        if (!rect) rect = autoRegion(img);
        drawSel();
        $("dgNote").textContent = img.naturalWidth + " × " + img.naturalHeight + " px";
      };
    }
    imgLoad().then(function (u) { if (u && !dataUrl) setImage(u); });

    function readFile(f) {
      if (!f || !/^image\//.test(f.type)) return;
      var fr = new FileReader();
      fr.onload = function () { rect = null; setImage(fr.result); };
      fr.readAsDataURL(f);
    }
    $("dgFile").addEventListener("change", function (e) { readFile(e.target.files[0]); });
    function onPaste(e) {
      var items = (e.clipboardData && e.clipboardData.items) || [];
      for (var i = 0; i < items.length; i++) if (items[i].type.indexOf("image/") === 0) { readFile(items[i].getAsFile()); e.preventDefault(); break; }
    }
    document.addEventListener("paste", onPaste);
    setTpl(tpl);
    $("dgAuto").addEventListener("click", function () { if (img) { rect = autoRegion(img); drawSel(); } });

    // kéo chọn vùng
    var start = null;
    function pos(e) {
      var r = prev.getBoundingClientRect();
      return { x: Math.min(100, Math.max(0, (e.clientX - r.left) / r.width * 100)), y: Math.min(100, Math.max(0, (e.clientY - r.top) / r.height * 100)) };
    }
    prev.addEventListener("pointerdown", function (e) {
      if (!img) return; start = pos(e); prev.setPointerCapture(e.pointerId); e.preventDefault();
    });
    prev.addEventListener("pointermove", function (e) {
      if (!start) return; var p = pos(e);
      rect = { x: Math.min(start.x, p.x), y: Math.min(start.y, p.y), w: Math.abs(p.x - start.x), h: Math.abs(p.y - start.y) };
      drawSel();
    });
    prev.addEventListener("pointerup", function () {
      start = null;
      if (rect && (rect.w < 3 || rect.h < 3)) { rect = autoRegion(img); drawSel(); }
    });

    function close() { document.removeEventListener("paste", onPaste); box.remove(); }
    box.querySelectorAll("[data-x]").forEach(function (b) { b.addEventListener("click", close); });
    $("dgGo").addEventListener("click", function () {
      var ns = {
        tpl: tpl, rect: rect, font: $("dgFont").value, flow: $("dgFlow").value,
        size: Number($("dgSize").value) || DEF.size, rowH: Number($("dgRowH").value) || DEF.rowH,
        color: $("dgColor").value, tab: $("dgTab").value || DEF.tab
      };
      lsSet("dx.disguise", ns);
      (dataUrl && tpl === "image" ? imgSave(dataUrl) : Promise.resolve()).then(function () { close(); if (thenStart) start_(); });
    });
  }

  /* ---------- màn hình ngụy trang ---------- */
  var oldTitle = null;
  function start_() {
    imgLoad().then(function (url) {
      var S = settings();
      if (S.tpl !== "image" && window.DXTemplates && window.DXTemplates[S.tpl]) return startTemplate(S);
      if (!url || !S.rect) { openSetup(true); return; }
      stop(true);
      ssSet(KEY_ON, true);
      var c = chapterText();
      var ov = document.createElement("div");
      ov.id = "dgView"; ov.className = "dg-view";
      ov.innerHTML =
        '<div class="dg-stage" id="dgStage"><img id="dgImg" alt="" draggable="false">' +
        '<div class="dg-text" id="dgText" tabindex="0"></div></div>' +
        '<div class="dg-dock" aria-label="Điều khiển">' +
        '<button type="button" data-a="prev" aria-label="Chương trước">‹</button>' +
        '<button type="button" data-a="next" aria-label="Chương sau">›</button>' +
        '<button type="button" data-a="setup" aria-label="Chỉnh ngụy trang">⚙</button>' +
        '<button type="button" data-a="exit" aria-label="Thoát ngụy trang">✕</button></div>';
      document.body.appendChild(ov);
      document.body.classList.add("dg-on");
      if (oldTitle === null) oldTitle = document.title;
      document.title = S.tab;

      var im = document.getElementById("dgImg"), tx = document.getElementById("dgText"), stage = document.getElementById("dgStage");
      tx.textContent = (c.title ? c.title + "\n" : "") + (S.flow === "rows" ? c.text.replace(/\n\n/g, "\n") : c.text);
      tx.style.fontFamily = FONTS[S.font] || FONTS.sheet;
      tx.style.color = S.color;
      tx.classList.toggle("para", S.flow === "para");
      tx.style.left = S.rect.x + "%"; tx.style.top = S.rect.y + "%"; tx.style.width = S.rect.w + "%"; tx.style.height = S.rect.h + "%";

      function layout() {
        if (!im.naturalWidth) return;
        var vw = window.innerWidth, vh = window.innerHeight, ar = im.naturalWidth / im.naturalHeight;
        var w = vw, h = vw / ar;
        if (h > vh) { h = vh; w = vh * ar; }
        stage.style.width = w + "px"; stage.style.height = h + "px";
        var k = w / im.naturalWidth;
        tx.style.fontSize = (S.size * k) + "px";
        tx.style.lineHeight = S.flow === "rows" ? (S.rowH * k) + "px" : "1.5";
      }
      im.onload = function () {
        // màu nền viền lấy từ góc ảnh cho liền mạch
        try {
          var cv = document.createElement("canvas"); cv.width = 1; cv.height = 1;
          var cx = cv.getContext("2d"); cx.drawImage(im, 0, 0, 1, 1, 0, 0, 1, 1);
          var p = cx.getImageData(0, 0, 1, 1).data; ov.style.background = "rgb(" + p[0] + "," + p[1] + "," + p[2] + ")";
        } catch (e) {}
        layout();
      };
      im.src = url;
      window.addEventListener("resize", layout);
      ov._cleanup = function () { window.removeEventListener("resize", layout); };

      ov.querySelector(".dg-dock").addEventListener("click", function (e) {
        var b = e.target.closest("button"); if (!b) return;
        act(b.dataset.a);
      });
      tx.focus({ preventScroll: true });
      if (document.documentElement.requestFullscreen && !document.fullscreenElement && ov._wantFs) {
        document.documentElement.requestFullscreen().catch(function () {});
      }
    });
  }
  function startTemplate(S) {
    stop(true);
    ssSet(KEY_ON, true);
    var c = chapterText();
    var ov = document.createElement("div");
    ov.id = "dgView"; ov.className = "dg-view tpl";
    ov.innerHTML = '<div id="dgTpl"></div>' + dockHtml();
    document.body.appendChild(ov);
    document.body.classList.add("dg-on");
    if (oldTitle === null) oldTitle = document.title;
    document.title = S.tab;
    var scroller = window.DXTemplates[S.tpl](document.getElementById("dgTpl"), c, S);
    if (scroller) { scroller.id = scroller.id || "dgScroll"; scroller.focus({ preventScroll: true }); }
    ov.querySelector(".dg-dock").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (b) act(b.dataset.a);
    });
  }
  function dockHtml() {
    return '<div class="dg-dock" aria-label="Điều khiển">' +
      '<button type="button" data-a="prev" aria-label="Chương trước">‹</button>' +
      '<button type="button" data-a="next" aria-label="Chương sau">›</button>' +
      '<button type="button" data-a="setup" aria-label="Chỉnh ngụy trang">⚙</button>' +
      '<button type="button" data-a="exit" aria-label="Thoát ngụy trang">✕</button></div>';
  }
  function stop(keepFlag) {
    var ov = document.getElementById("dgView");
    if (ov) { if (ov._cleanup) ov._cleanup(); ov.remove(); }
    document.body.classList.remove("dg-on");
    if (!keepFlag) {
      ssSet(KEY_ON, false);
      if (oldTitle !== null) { document.title = oldTitle; oldTitle = null; }
    }
  }
  function act(a) {
    var L = pagerLinks();
    if (a === "exit") return stop(false);
    if (a === "setup") { stop(false); return openSetup(true); }
    if (a === "next" && L.next) location.hash = L.next;
    if (a === "prev" && L.prev) location.hash = L.prev;
  }

  document.addEventListener("keydown", function (e) {
    if (!document.getElementById("dgView")) return;
    if (document.getElementById("gateModal")) return;
    var tx = document.getElementById("dgText") || document.querySelector("#dgView [data-dg-scroll]");
    if (e.key === "Escape") { stop(false); e.preventDefault(); }
    else if (e.key === "ArrowRight") { act("next"); e.preventDefault(); }
    else if (e.key === "ArrowLeft") { act("prev"); e.preventDefault(); }
    else if ((e.key === "ArrowDown" || e.key === " ") && tx) { tx.scrollBy({ top: tx.clientHeight * (e.key === " " ? 0.9 : 0.2) }); e.preventDefault(); }
    else if (e.key === "ArrowUp" && tx) { tx.scrollBy({ top: -tx.clientHeight * 0.2 }); e.preventDefault(); }
  });

  // nút trên thanh đọc
  document.addEventListener("click", function (e) {
    if (e.target.closest("#disguiseBtn")) { e.preventDefault(); start_(); }
  });
  // khi trình đọc vẽ xong một chương: nếu đang ngụy trang thì vẽ lại với chương mới
  document.addEventListener("dx:reader", function () { if (ssGet(KEY_ON)) start_(); });
  // rời trình đọc (về trang chủ, thể loại...) thì thoát ngụy trang
  document.addEventListener("dx:leave", function () { if (document.getElementById("dgView")) stop(false); });
})();
