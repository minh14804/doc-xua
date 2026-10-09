/* Đọc Xưa — Mẫu ngụy trang dựng sẵn (HTML thật, không phải ảnh).
   Giao diện chung kiểu bảng tính / phần mềm thiết kế, không dùng logo hay thương hiệu của sản phẩm nào.
   Mỗi mẫu nhận: root (phần tử chứa), c = { title, text }, và trả về phần tử cuộn được. */
(function () {
  "use strict";

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ic(path, size) {
    return '<svg width="' + (size || 16) + '" height="' + (size || 16) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>';
  }
  var I = {
    undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
    redo: '<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>',
    print: '<path d="M6 9V3h12v6"/><rect x="4" y="9" width="16" height="8" rx="1"/><path d="M7 14h10v7H7z"/>',
    paint: '<path d="M19 11l-8-8-7 7 8 8z"/><path d="M20 15s2 2.5 2 4a2 2 0 0 1-4 0c0-1.5 2-4 2-4z"/>',
    bold: '<path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z"/>',
    italic: '<path d="M10 5h8M6 19h8M14 5l-4 14"/>',
    strike: '<path d="M5 12h14M16 7a4 4 0 0 0-4-2c-2.5 0-4 1.3-4 3s1.5 2.5 4 3m4 3c0 2-1.8 3-4 3a5 5 0 0 1-4-2"/>',
    color: '<path d="M7 16l5-12 5 12M9 12h6"/><path d="M4 20h16" stroke-width="3"/>',
    fill: '<path d="M4 12l7-7 7 7-7 7z"/><path d="M4 20h16" stroke-width="3"/>',
    border: '<rect x="4" y="4" width="16" height="16"/><path d="M4 12h16M12 4v16" stroke-dasharray="2 2"/>',
    merge: '<path d="M4 6h16v12H4zM9 12H5m10 0h4m-12-2l-2 2 2 2m10-4l2 2-2 2"/>',
    alignL: '<path d="M4 6h16M4 10h10M4 14h16M4 18h10"/>',
    valign: '<path d="M12 4v16M8 8l4-4 4 4M8 16l4 4 4-4"/>',
    wrap: '<path d="M4 6h16M4 12h13a3 3 0 0 1 0 6h-4m2-2l-2 2 2 2M4 18h5"/>',
    link: '<path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1"/>',
    comment: '<path d="M4 5h16v11H9l-5 4z"/>',
    chart: '<path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6"/>',
    filter: '<path d="M4 5h16l-6 8v6l-4-2v-4z"/>',
    sigma: '<path d="M18 5H6l6 7-6 7h12"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    star: '<path d="M12 4l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8z"/>',
    folder: '<path d="M3 7h6l2 2h10v10H3z"/>',
    cloud: '<path d="M7 18a4 4 0 0 1 0-8 6 6 0 0 1 11 2 3 3 0 0 1 0 6z"/>',
    share: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M17 11v6M14 14h6"/>',
    move: '<path d="M12 3v18M3 12h18M12 3l-3 3m3-3l3 3M12 21l-3-3m3 3l3-3M3 12l3-3m-3 3l3 3M21 12l-3-3m3 3l-3 3"/>',
    marquee: '<rect x="4" y="4" width="16" height="16" stroke-dasharray="3 3"/>',
    lasso: '<path d="M12 4c5 0 8 2.5 8 5.5S16 15 12 15s-8-2.5-8-5.5S7 4 12 4zM7 14c-1 2 0 4 2 5"/>',
    crop: '<path d="M6 2v16h16M2 6h16v16"/>',
    eyedrop: '<path d="M14 4l6 6-9 9H5v-6z"/><path d="M13 5l6 6"/>',
    brush: '<path d="M18 3l3 3-9 9-3-3z"/><path d="M9 12c-3 0-5 2-5 5v3h3c3 0 5-2 5-5"/>',
    stamp: '<path d="M9 3h6v6l3 3v3H6v-3l3-3zM5 19h14"/>',
    eraser: '<path d="M4 16l9-9 7 7-6 6H8z"/><path d="M14 20h6"/>',
    gradient: '<rect x="4" y="4" width="16" height="16"/><path d="M4 20L20 4" />',
    pen: '<path d="M12 3l7 7-7 11-7-11z"/><circle cx="12" cy="12" r="1.5"/>',
    text: '<path d="M5 6V4h14v2M12 4v16M9 20h6"/>',
    shape: '<rect x="4" y="4" width="16" height="16" rx="2"/>',
    hand: '<path d="M8 13V6a1.5 1.5 0 0 1 3 0v5V4.5a1.5 1.5 0 0 1 3 0V11V6a1.5 1.5 0 0 1 3 0v8a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-3l-2-4a1.5 1.5 0 0 1 2.5-1.5L8 13z"/>',
    zoom: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="1"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>'
  };

  /* chia chữ thành các dòng vừa với một độ rộng (px) theo font cho trước */
  function wrapLines(text, widthPx, font) {
    var cv = wrapLines._c || (wrapLines._c = document.createElement("canvas"));
    var cx = cv.getContext("2d"); cx.font = font;
    var out = [];
    text.split(/\n+/).forEach(function (para) {
      para = para.trim(); if (!para) return;
      var words = para.split(/\s+/), line = "";
      words.forEach(function (w) {
        var t = line ? line + " " + w : w;
        if (cx.measureText(t).width > widthPx && line) { out.push(line); line = w; }
        else line = t;
      });
      if (line) out.push(line);
    });
    return out;
  }
  function colName(i) { var s = ""; i++; while (i > 0) { var m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; }

  /* ================= MẪU BẢNG TÍNH ================= */
  function sheet(root, c, opt) {
    var font = '13px Arial, "Helvetica Neue", Helvetica, sans-serif';
    var docName = opt.tab || "Bảng tính 1";
    root.className = "tp-sheet";
    root.innerHTML =
      '<header class="ts-top">' +
        '<span class="ts-doc" aria-hidden="true">' + ic('<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16M4 15h16M10 9v12"/>', 26) + '</span>' +
        '<div class="ts-title"><div class="ts-name"><span>' + esc(docName) + '</span>' + ic(I.star, 15) + ic(I.folder, 15) + ic(I.cloud, 15) + '</div>' +
        '<nav class="ts-menu"><span>Tệp</span><span>Chỉnh sửa</span><span>Xem</span><span>Chèn</span><span>Định dạng</span><span>Dữ liệu</span><span>Công cụ</span><span>Tiện ích</span><span>Trợ giúp</span></nav></div>' +
        '<div class="ts-right"><span class="ts-iconbtn">' + ic(I.comment, 18) + '</span><span class="ts-share">' + ic(I.share, 16) + ' Chia sẻ</span><span class="ts-avatar">M</span></div>' +
      '</header>' +
      '<div class="ts-tools">' +
        '<span>' + ic(I.menu) + '</span><span>' + ic(I.undo) + '</span><span>' + ic(I.redo) + '</span><span>' + ic(I.print) + '</span><span>' + ic(I.paint) + '</span>' +
        '<i></i><span class="ts-sel">100% ▾</span><i></i><span class="ts-txt">₫</span><span class="ts-txt">%</span><span class="ts-txt">.0</span><span class="ts-txt">.00</span><span class="ts-txt">123 ▾</span>' +
        '<i></i><span class="ts-sel">Mặc định ▾</span><i></i><span class="ts-txt">−</span><span class="ts-num">10</span><span class="ts-txt">+</span>' +
        '<i></i><span>' + ic(I.bold) + '</span><span>' + ic(I.italic) + '</span><span>' + ic(I.strike) + '</span><span>' + ic(I.color) + '</span>' +
        '<i></i><span>' + ic(I.fill) + '</span><span>' + ic(I.border) + '</span><span>' + ic(I.merge) + '</span>' +
        '<i></i><span>' + ic(I.alignL) + '</span><span>' + ic(I.valign) + '</span><span>' + ic(I.wrap) + '</span>' +
        '<i></i><span>' + ic(I.link) + '</span><span>' + ic(I.comment) + '</span><span>' + ic(I.chart) + '</span><span>' + ic(I.filter) + '</span><span>' + ic(I.sigma) + '</span>' +
      '</div>' +
      '<div class="ts-fx"><span class="ts-ref" id="tsRef">B2</span><span class="ts-fxi">fx</span><span class="ts-fxv" id="tsFx"></span></div>' +
      '<div class="ts-grid" data-dg-scroll tabindex="0"><table id="tsTable"></table></div>' +
      '<footer class="ts-bottom"><span class="ts-add">' + ic(I.plus) + '</span><span class="ts-add">' + ic(I.menu) + '</span>' +
        '<span class="ts-tab on">Trang tính1 ▾</span><span class="ts-tab">Trang tính2</span><span class="ts-sum" id="tsSum">Số lượng: 1</span></footer>';

    var grid = root.querySelector(".ts-grid"), table = root.querySelector("#tsTable");
    var fx = root.querySelector("#tsFx"), ref = root.querySelector("#tsRef"), sum = root.querySelector("#tsSum");
    var statuses = ["Đã xong", "Đang làm", "Chờ duyệt", "Đã xong", "Đã gửi"];
    var notes = ["", "", "Kiểm tra lại", "", "", "Theo email", "", ""];

    function build() {
      var avail = grid.clientWidth - 46 - 92 - 100 - 112 - 3 * 100;   // trừ các cột còn lại
      var wB = Math.max(260, avail);
      var lines = wrapLines((c.title ? c.title + "\n" : "") + c.text, wB - 12, font);
      var cols = [46, wB, 92, 100, 112, 100, 100, 100];
      var html = '<colgroup><col style="width:46px">' + cols.map(function (w) { return '<col style="width:' + w + 'px">'; }).join("") + '</colgroup>';
      html += '<thead><tr><th class="corner"></th>' + cols.map(function (w, i) { return '<th>' + colName(i) + '</th>'; }).join("") + '</tr></thead><tbody>';
      html += '<tr><th>1</th><td class="h" data-v="STT">STT</td><td class="h" data-v="Mô tả công việc">Mô tả công việc</td><td class="h" data-v="Ngày">Ngày</td><td class="h" data-v="Trạng thái">Trạng thái</td><td class="h" data-v="Ghi chú">Ghi chú</td><td></td><td></td><td></td></tr>';
      var d0 = new Date(); d0.setDate(d0.getDate() - Math.min(lines.length, 60));
      var rows = Math.max(lines.length, 40);
      for (var r = 0; r < rows; r++) {
        var line = lines[r] || "";
        var dt = new Date(d0.getTime() + Math.floor(r / 3) * 864e5);
        var ds = line ? ("0" + dt.getDate()).slice(-2) + "/" + ("0" + (dt.getMonth() + 1)).slice(-2) + "/" + dt.getFullYear() : "";
        var st = line ? statuses[r % statuses.length] : "", nt = line ? notes[r % notes.length] : "";
        html += '<tr><th>' + (r + 2) + '</th>' +
          '<td class="n" data-v="' + (line ? r + 1 : "") + '">' + (line ? r + 1 : "") + '</td>' +
          '<td data-v="' + esc(line) + '">' + esc(line) + '</td>' +
          '<td class="n" data-v="' + ds + '">' + ds + '</td>' +
          '<td data-v="' + st + '">' + st + '</td>' +
          '<td data-v="' + nt + '">' + nt + '</td><td></td><td></td><td></td></tr>';
      }
      table.innerHTML = html + '</tbody>';
      select(table.querySelector("tbody tr:nth-child(2) td:nth-child(3)"));
    }
    function select(td) {
      if (!td) return;
      var old = table.querySelector("td.sel"); if (old) old.classList.remove("sel");
      td.classList.add("sel");
      var tr = td.parentElement, row = tr.rowIndex, col = td.cellIndex - 1;
      ref.textContent = colName(col) + row;
      fx.textContent = td.getAttribute("data-v") || "";
      sum.textContent = fx.textContent ? "Số lượng: 1" : "";
    }
    table.addEventListener("click", function (e) { var td = e.target.closest("td"); if (td) select(td); });
    build();
    var t; window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(build, 150); });
    return grid;
  }

  /* ================= MẪU THIẾT KẾ BANNER ================= */
  function design(root, c, opt) {
    var file = (opt.tab || "banner_khuyen_mai_final") + " @ 66,7% (RGB/8)";
    var tools = ["move", "marquee", "lasso", "crop", "eyedrop", "brush", "stamp", "eraser", "gradient", "pen", "text", "shape", "hand", "zoom"];
    root.className = "tp-design";
    root.innerHTML =
      '<header class="td-menu"><span class="td-logo" aria-hidden="true">' + ic(I.layers, 18) + '</span>' +
        '<span>Tệp</span><span>Chỉnh sửa</span><span>Ảnh</span><span>Lớp</span><span>Chữ</span><span>Vùng chọn</span><span>Bộ lọc</span><span>Xem</span><span>Cửa sổ</span><span>Trợ giúp</span></header>' +
      '<div class="td-opts"><span>' + ic(I.move) + '</span><label><input type="checkbox" checked tabindex="-1"> Tự chọn: Lớp ▾</label><label><input type="checkbox" tabindex="-1"> Hiện khung biến đổi</label>' +
        '<i></i><span>' + ic(I.alignL) + '</span><span>' + ic(I.valign) + '</span><span>' + ic(I.merge) + '</span><span class="td-sp"></span><span>' + ic(I.share) + '</span></div>' +
      '<div class="td-body">' +
        '<aside class="td-tools">' + tools.map(function (k, i) { return '<span class="' + (k === "text" ? "on" : "") + '">' + ic(I[k], 18) + '</span>'; }).join("") +
          '<span class="td-swatch"><b></b><b></b></span></aside>' +
        '<main class="td-work"><div class="td-tab"><span class="on">' + esc(file) + ' ✕</span><span>logo_mau_2 @ 100% (RGB/8) ✕</span></div>' +
          '<div class="td-canvas"><div class="td-board">' +
            '<div class="td-hero"><div class="td-blob a"></div><div class="td-blob b"></div>' +
              '<div class="td-k">BST THU · 10.10</div><div class="td-h">GIẢM ĐẾN 50%</div><div class="td-s">Miễn phí giao hàng toàn quốc · Số lượng có hạn</div>' +
              '<div class="td-cta">MUA NGAY</div><div class="td-prod"><span></span><span></span><span></span></div></div>' +
            '<div class="td-desc"><div class="td-dl">Mô tả chi tiết chương trình</div><div class="td-dt" data-dg-scroll tabindex="0"></div></div>' +
          '</div></div>' +
          '<div class="td-status">66,67%<i></i>Tài liệu: 2,61M/14,3M<span class="td-sp"></span>1200 × 1000 px (72 ppi)</div></main>' +
        '<aside class="td-panels">' +
          '<section><h4>Thuộc tính</h4><div class="td-prop"><span>Lớp chữ</span><div class="td-row"><b>Rộng</b> 980 px <b>Cao</b> 360 px</div><div class="td-row"><b>X</b> 110 px <b>Y</b> 600 px</div><div class="td-row"><b>Phông</b> Inter · Regular · 13 pt</div><div class="td-row"><b>Màu</b> <i class="td-chip"></i> #4A4A4A</div></div></section>' +
          '<section><h4>Lớp</h4><ul class="td-layers">' +
            ['Mô tả chi tiết', 'MUA NGAY', 'Giảm đến 50%', 'BST Thu 10.10', 'Ảnh sản phẩm', 'Hình trang trí', 'Nền gradient'].map(function (n, i) {
              return '<li class="' + (i === 0 ? "on" : "") + '"><span>' + ic(I.eye, 14) + '</span><span class="td-thumb ' + (i < 4 ? "t" : "") + '">' + (i < 4 ? "T" : "") + '</span>' + esc(n) + (i === 6 ? '<span class="td-sp"></span>' + ic(I.lock, 12) : "") + '</li>';
            }).join("") + '</ul></section>' +
        '</aside>' +
      '</div>';
    var dt = root.querySelector(".td-dt");
    dt.textContent = (c.title ? c.title + "\n\n" : "") + c.text;
    return dt;
  }

  window.DXTemplates = { sheet: sheet, design: design };
})();
