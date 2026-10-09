/* ===========================================================
   CẤU HÌNH WEB — chỉ cần sửa file này
   =========================================================== */
window.SITE_CONFIG = {
  siteName: "Đọc Xưa",
  tagline: "Truyện Việt kinh điển, đọc miễn phí mỗi ngày",

  /* Nguồn nội dung: Wikisource tiếng Việt (tác phẩm hết bản quyền / giấy phép mở) */
  wikiApi: "https://vi.wikisource.org/w/api.php",
  wikiBase: "https://vi.wikisource.org/wiki/",

  /* ---------- AFFILIATE ----------
     enabled      : bật/tắt toàn bộ phần affiliate
     gateEvery    : cứ đọc N chương thì hiện ô "mở link để đọc tiếp" (0 = không chặn, chỉ hiện banner)
     unlockMinutes: sau khi bấm link, mở khoá đọc tự do trong bao nhiêu phút
     links        : danh sách link affiliate (Shopee, Tiki, Lazada...). Mỗi lần chặn chọn ngẫu nhiên 1 link.
     → THAY các url "https://s.shopee.vn/XXXXXXXX" bằng link affiliate thật của bạn. */
  affiliate: {
    enabled: true,
    gateEvery: 3,
    unlockMinutes: 30,
    gateTitle: "Ủng hộ Đọc Xưa để đọc tiếp",
    gateText: "Mở ưu đãi bên dưới trong tab mới, chương truyện sẽ tự mở khoá. Mỗi lượt ủng hộ giúp web duy trì miễn phí.",
    links: [
      { label: "Săn sách giấy giảm giá trên Shopee", url: "https://s.shopee.vn/XXXXXXXX" },
      { label: "Đèn đọc sách kẹp bàn", url: "https://s.shopee.vn/XXXXXXXX" },
      { label: "Máy đọc sách Kindle / Kobo", url: "https://s.shopee.vn/XXXXXXXX" }
    ],
    bannerText: "Thích đọc bản giấy? Xem sách in giảm giá"
  },

  /* ---------- HÀNG TRUYỆN TRÊN TRANG CHỦ ----------
     Mỗi hàng là một nhóm tag; truyện có tag đó sẽ hiện trong hàng. */
  shelves: [
    { tag: "hien-thuc", name: "Hiện thực phê phán", sub: "Làng quê, sưu thuế, thi cử thời cũ" },
    { tag: "tinh-cam", name: "Tình yêu & gia đình", sub: "Những mối tình và xung đột lễ giáo" },
    { tag: "nam-bo", name: "Văn xuôi Nam Bộ", sub: "Hồ Biểu Chánh và đất phương Nam" },
    { tag: "tho", name: "Truyện thơ & ngâm khúc", sub: "Lục bát, song thất lục bát" }
  ],

  /* Truyện nổi bật ở đầu trang chủ */
  featured: "Tắt đèn",

  /* ---------- DANH MỤC TRUYỆN ----------
     title : tên trang chính xác trên vi.wikisource.org (phần sau /wiki/)
     blurb : giới thiệu ngắn (tự viết)
     tags  : khớp với shelves ở trên
     shopee: (tuỳ chọn) link affiliate mua bản sách giấy của riêng tác phẩm này
     Tác phẩm nào không còn trên Wikisource sẽ tự ẩn khi tải trang. */
  catalog: [
    { title: "Tắt đèn", author: "Ngô Tất Tố", year: 1937, genre: "Tiểu thuyết", tags: ["hien-thuc"],
      blurb: "Gia đình chị Dậu xoay xở giữa mùa sưu thuế ở một làng quê Bắc Bộ. Tác phẩm tiêu biểu nhất của dòng hiện thực phê phán trước 1945." },
    { title: "Lều chõng", author: "Ngô Tất Tố", year: 1939, genre: "Tiểu thuyết", tags: ["hien-thuc"],
      blurb: "Bức tranh về khoa cử Nho học những năm cuối: sĩ tử, trường thi và những được mất quanh con đường đỗ đạt." },
    { title: "Làm đĩ", author: "Vũ Trọng Phụng", year: 1936, genre: "Tiểu thuyết", tags: ["hien-thuc"],
      blurb: "Tiểu thuyết luận đề của Vũ Trọng Phụng về giáo dục giới tính và số phận người phụ nữ trong xã hội thành thị thời Pháp thuộc." },
    { title: "Tố Tâm", author: "Hoàng Ngọc Phách", year: 1925, genre: "Tiểu thuyết", tags: ["tinh-cam"],
      blurb: "Một trong những tiểu thuyết tâm lý đầu tiên của văn học Việt Nam hiện đại, kể về mối tình dang dở giữa khuôn phép gia đình." },
    { title: "Nửa chừng xuân", author: "Khái Hưng", year: 1934, genre: "Tiểu thuyết", tags: ["tinh-cam"],
      blurb: "Tác phẩm Tự Lực văn đoàn về cô gái nghèo giàu nghị lực, đặt tình yêu đôi lứa đối diện với nếp nhà phong kiến." },
    { title: "Ai làm được", author: "Hồ Biểu Chánh", year: 1922, genre: "Tiểu thuyết", tags: ["nam-bo"],
      blurb: "Tiểu thuyết Nam Bộ đầu thế kỷ XX, giọng kể mộc mạc, đậm chất đời sống miệt vườn." },
    { title: "Cha con nghĩa nặng", author: "Hồ Biểu Chánh", year: 1929, genre: "Tiểu thuyết", tags: ["nam-bo", "tinh-cam"],
      blurb: "Câu chuyện tình cha con và nghĩa gia đình, một trong những tác phẩm được đọc nhiều nhất của Hồ Biểu Chánh." },
    { title: "Con nhà nghèo", author: "Hồ Biểu Chánh", year: 1930, genre: "Tiểu thuyết", tags: ["nam-bo"],
      blurb: "Phận người nghèo ở thôn quê Nam Kỳ và những lựa chọn giữa nghèo khó với lương tâm." },
    { title: "Truyện Kiều", author: "Nguyễn Du", year: 1820, genre: "Truyện thơ", tags: ["tho", "tinh-cam"],
      blurb: "Kiệt tác lục bát của văn học Việt Nam, kể cuộc đời truân chuyên của Thúy Kiều." },
    { title: "Lục Vân Tiên", author: "Nguyễn Đình Chiểu", year: 1865, genre: "Truyện thơ", tags: ["tho", "nam-bo"],
      blurb: "Truyện thơ Nôm đề cao nhân nghĩa, được người Nam Bộ thuộc lòng và kể lại qua nhiều thế hệ." },
    { title: "Chinh phụ ngâm", author: "Đặng Trần Côn – Đoàn Thị Điểm", year: 1740, genre: "Ngâm khúc", tags: ["tho"],
      blurb: "Khúc ngâm song thất lục bát nói nỗi nhớ mong của người vợ có chồng ra trận." }
  ]
};
