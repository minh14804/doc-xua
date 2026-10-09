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
    { tag: "ngon-tinh", name: "Ngôn tình cổ điển", sub: "Tiểu thuyết tình yêu thời xưa, đọc là thương" },
    { tag: "tinh-cam", name: "Tình yêu & hôn nhân", sub: "Những mối tình vượt lễ giáo, chuyện vợ chồng, nhà chồng" },
    { tag: "tho-tinh", name: "Thơ tình & truyện thơ", sub: "Lục bát, ngâm khúc, những cuộc tình bằng thơ" },
    { tag: "nam-bo", name: "Tình cảm Nam Bộ", sub: "Giọng văn miệt vườn của Hồ Biểu Chánh" },
    { tag: "co-tich", name: "Cổ tích & truyền kỳ", sub: "Chuyện xưa kể lại, nhẹ nhàng trước giờ ngủ" },
    { tag: "phan-nguoi", name: "Phận người", sub: "Những người phụ nữ giữa thời cuộc" },
    { tag: "truyen-rieng", name: "Truyện độc quyền", sub: "Truyện mới đăng riêng trên Đọc Xưa" }
  ],

  /* Truyện nổi bật ở đầu trang chủ */
  featured: "Tố Tâm",

  /* ---------- DANH MỤC TRUYỆN ----------
     title : tên trang chính xác trên vi.wikisource.org (phần sau /wiki/)
     blurb : giới thiệu ngắn (tự viết)
     tags  : khớp với shelves ở trên
     shopee: (tuỳ chọn) link affiliate mua bản sách giấy của riêng tác phẩm này
     Tác phẩm nào không có trên Wikisource sẽ tự ẩn khi tải trang.

     TRUYỆN RIÊNG CỦA BẠN (tự viết / thuê viết / đã mua bản quyền):
     { title: "Tên truyện", author: "Bút danh", year: 2026, genre: "Ngôn tình", tags: ["truyen-rieng", "ngon-tinh"],
       source: "local", slug: "ten-truyen", blurb: "…",
       chapters: [ { label: "Chương 1", file: "01.txt" }, { label: "Chương 2", file: "02.txt" } ] }
     → đặt file chương vào thư mục stories/ten-truyen/ (xem stories/README.md) */
  catalog: [
    /* --- Ngôn tình cổ điển --- */
    { title: "Tố Tâm", author: "Hoàng Ngọc Phách", year: 1925, genre: "Tiểu thuyết tình", tags: ["ngon-tinh", "tinh-cam"],
      blurb: "Tiểu thuyết tâm lý tình yêu đầu tiên của văn học Việt Nam hiện đại: mối tình sâu nặng mà dang dở giữa khuôn phép gia đình. Từng khiến cả một thế hệ thiếu nữ rơi nước mắt." },
    { title: "Tuyết hồng lệ sử", author: "Từ Chẩm Á (bản dịch Đông Châu)", year: 1924, genre: "Ngôn tình cổ điển", tags: ["ngon-tinh"],
      blurb: "Tiểu thuyết tình dòng “uyên ương hồ điệp” của Trung Hoa đầu thế kỷ XX, kể bằng thư từ và nhật ký, được dịch sang tiếng Việt từ thập niên 1920." },
    { title: "Ngọc lê hồn", author: "Từ Chẩm Á", year: 1912, genre: "Ngôn tình cổ điển", tags: ["ngon-tinh"],
      blurb: "Một trong những tiểu thuyết tình buồn nổi tiếng nhất của văn học Trung Hoa cận đại, văn phong bay bổng, nhiều thơ từ." },
    { title: "Nửa chừng xuân", author: "Khái Hưng", year: 1934, genre: "Tiểu thuyết tình", tags: ["ngon-tinh", "tinh-cam", "phan-nguoi"],
      blurb: "Cô gái nghèo giàu nghị lực và mối tình bị nếp nhà phong kiến chia cắt. Một trong những tiểu thuyết tình được yêu thích nhất của Tự Lực văn đoàn." },
    { title: "Trống mái", author: "Khái Hưng", year: 1936, genre: "Tiểu thuyết tình", tags: ["ngon-tinh", "tinh-cam"],
      blurb: "Câu chuyện tình bên bờ biển Sầm Sơn giữa một tiểu thư thành thị và chàng trai làng chài, nhẹ nhàng mà nhiều suy ngẫm." },
    { title: "Bướm trắng", author: "Nhất Linh", year: 1941, genre: "Tiểu thuyết tình", tags: ["ngon-tinh", "tinh-cam"],
      blurb: "Tiểu thuyết tâm lý tình yêu của Nhất Linh, đi sâu vào những rung động mong manh của con người." },

    /* --- Tình yêu & hôn nhân, phận người --- */
    { title: "Đẹp", author: "Khái Hưng", year: 1940, genre: "Tiểu thuyết tình", tags: ["tinh-cam"],
      blurb: "Tiểu thuyết của Khái Hưng về tình yêu, cái đẹp và người nghệ sĩ." },
    { title: "Thoát ly", author: "Khái Hưng", year: 1938, genre: "Tiểu thuyết", tags: ["tinh-cam", "phan-nguoi"],
      blurb: "Người con gái tìm cách thoát khỏi gia đình nặng nề lễ giáo để được sống cho mình." },
    { title: "Ngày mới", author: "Thạch Lam", year: 1939, genre: "Tiểu thuyết", tags: ["tinh-cam"],
      blurb: "Tiểu thuyết duy nhất của Thạch Lam, chuyện hôn nhân và gia đình với giọng văn dịu dàng, tinh tế." },
    { title: "Tắt đèn", author: "Ngô Tất Tố", year: 1937, genre: "Tiểu thuyết", tags: ["phan-nguoi"],
      blurb: "Chị Dậu, người vợ người mẹ tần tảo, xoay xở giữa mùa sưu thuế để giữ lấy gia đình. Hình tượng phụ nữ nông thôn đẹp nhất văn học Việt Nam." },
    { title: "Làm đĩ", author: "Vũ Trọng Phụng", year: 1936, genre: "Tiểu thuyết", tags: ["phan-nguoi"],
      blurb: "Tiểu thuyết luận đề về giáo dục giới tính và số phận người phụ nữ trong xã hội thành thị thời Pháp thuộc." },
    { title: "Lều chõng", author: "Ngô Tất Tố", year: 1939, genre: "Tiểu thuyết", tags: ["phan-nguoi"],
      blurb: "Khoa cử Nho học những năm cuối, qua những sĩ tử và người vợ tảo tần đứng sau họ." },

    /* --- Tình cảm Nam Bộ (Hồ Biểu Chánh) --- */
    { title: "Lời thề trước miễu", author: "Hồ Biểu Chánh", year: 1938, genre: "Tiểu thuyết tình", tags: ["nam-bo", "ngon-tinh"],
      blurb: "Tiểu thuyết tình cảm Nam Bộ quanh một lời thề son sắt, giọng văn mộc mạc của Hồ Biểu Chánh." },
    { title: "Vì nghĩa vì tình", author: "Hồ Biểu Chánh", year: 1929, genre: "Tiểu thuyết tình", tags: ["nam-bo", "tinh-cam"],
      blurb: "Giằng co giữa chữ nghĩa và chữ tình trong một câu chuyện tình cảm đất phương Nam." },
    { title: "Một chữ tình", author: "Hồ Biểu Chánh", year: 1923, genre: "Tiểu thuyết tình", tags: ["nam-bo", "ngon-tinh"],
      blurb: "Tiểu thuyết tình cảm của Hồ Biểu Chánh, kể về những ràng buộc và hy sinh vì một chữ tình." },
    { title: "Khóc thầm", author: "Hồ Biểu Chánh", year: 1929, genre: "Tiểu thuyết", tags: ["nam-bo", "tinh-cam"],
      blurb: "Những nỗi niềm giấu kín trong một gia đình Nam Bộ đầu thế kỷ XX." },
    { title: "Duyên kiếp", author: "Hồ Biểu Chánh", year: 1936, genre: "Tiểu thuyết tình", tags: ["nam-bo", "tinh-cam"],
      blurb: "Chuyện duyên phận vợ chồng qua giọng kể miệt vườn quen thuộc của Hồ Biểu Chánh." },
    { title: "Tỉnh mộng", author: "Hồ Biểu Chánh", year: 1935, genre: "Tiểu thuyết", tags: ["nam-bo", "tinh-cam"],
      blurb: "Tiểu thuyết tâm lý xã hội Nam Bộ về những ảo tưởng tình ái và lúc tỉnh ra." },
    { title: "Cha con nghĩa nặng", author: "Hồ Biểu Chánh", year: 1929, genre: "Tiểu thuyết", tags: ["nam-bo", "tinh-cam"],
      blurb: "Tình cha con và nghĩa gia đình, một trong những tác phẩm được đọc nhiều nhất của Hồ Biểu Chánh." },
    { title: "Ai làm được", author: "Hồ Biểu Chánh", year: 1922, genre: "Tiểu thuyết", tags: ["nam-bo"],
      blurb: "Tiểu thuyết Nam Bộ đầu thế kỷ XX, đậm chất đời sống miệt vườn." },
    { title: "Con nhà nghèo", author: "Hồ Biểu Chánh", year: 1930, genre: "Tiểu thuyết", tags: ["nam-bo", "phan-nguoi"],
      blurb: "Phận người nghèo ở thôn quê Nam Kỳ và những lựa chọn giữa nghèo khó với lương tâm." },

    /* --- Thơ tình & truyện thơ --- */
    { title: "Truyện Kiều", author: "Nguyễn Du", year: 1820, genre: "Truyện thơ", tags: ["tho-tinh", "phan-nguoi"],
      blurb: "Mối tình Kim – Kiều và mười lăm năm lưu lạc của người con gái tài sắc. Kiệt tác lục bát của văn học Việt Nam." },
    { title: "Truyện Hoa Tiên", author: "Nguyễn Huy Tự", year: 1780, genre: "Truyện thơ", tags: ["tho-tinh"],
      blurb: "Truyện thơ Nôm về tình yêu đôi lứa tự do, được xem là tiền thân của Truyện Kiều." },
    { title: "Sơ kính tân trang", author: "Phạm Thái", year: 1804, genre: "Truyện thơ", tags: ["tho-tinh"],
      blurb: "Truyện thơ tình lãng mạn, nhiều phần mang bóng dáng cuộc tình có thật của chính tác giả." },
    { title: "Bích câu kỳ ngộ", author: "Khuyết danh", year: 1800, genre: "Truyện thơ", tags: ["tho-tinh", "co-tich"],
      blurb: "Chàng thư sinh gặp tiên nữ nơi đất Bích Câu: chuyện tình người – tiên đẹp như cổ tích." },
    { title: "Cung oán ngâm khúc", author: "Nguyễn Gia Thiều", year: 1780, genre: "Ngâm khúc", tags: ["tho-tinh", "phan-nguoi"],
      blurb: "Lời than của người cung nữ bị ruồng bỏ, câu chữ trau chuốt bậc nhất thơ Nôm." },
    { title: "Chinh phụ ngâm", author: "Đặng Trần Côn – Đoàn Thị Điểm", year: 1740, genre: "Ngâm khúc", tags: ["tho-tinh"],
      blurb: "Nỗi nhớ mong của người vợ có chồng ra trận, viết bằng song thất lục bát." },
    { title: "Truyện Phan Trần", author: "Khuyết danh", year: 1800, genre: "Truyện thơ", tags: ["tho-tinh"],
      blurb: "Mối tình giữa chàng Phan Sinh và ni cô Diệu Thường, một truyện thơ Nôm tình duyên quen thuộc." },
    { title: "Lục Vân Tiên", author: "Nguyễn Đình Chiểu", year: 1865, genre: "Truyện thơ", tags: ["tho-tinh", "nam-bo"],
      blurb: "Mối tình chung thủy Vân Tiên – Nguyệt Nga giữa bao gian truân. Truyện thơ được người Nam Bộ thuộc lòng." },

    /* --- Cổ tích --- */
    { title: "Truyện cổ nước Nam", author: "Nguyễn Văn Ngọc", year: 1932, genre: "Cổ tích", tags: ["co-tich"],
      blurb: "Tuyển tập truyện cổ tích, ngụ ngôn Việt Nam do Nguyễn Văn Ngọc sưu tầm, kể lại giản dị, dễ đọc." }
  ]
};
