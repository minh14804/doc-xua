/* ===========================================================
   CẤU HÌNH WEB — chỉ cần sửa file này
   =========================================================== */
window.SITE_CONFIG = {
  siteName: "Đọc Xưa",
  tagline: "Tiểu thuyết, truyện và thơ Việt Nam đã thuộc về công chúng",

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

  /* ---------- DANH MỤC TRUYỆN ----------
     title : tên trang chính xác trên vi.wikisource.org (phần sau /wiki/)
     shopee: (tuỳ chọn) link affiliate mua bản sách giấy của riêng tác phẩm này
     Tác phẩm nào không còn trên Wikisource sẽ tự ẩn khi tải trang. */
  catalog: [
    { title: "Số đỏ", author: "Vũ Trọng Phụng", year: 1936, genre: "Tiểu thuyết trào phúng" },
    { title: "Giông tố", author: "Vũ Trọng Phụng", year: 1936, genre: "Tiểu thuyết" },
    { title: "Vỡ đê", author: "Vũ Trọng Phụng", year: 1936, genre: "Tiểu thuyết" },
    { title: "Làm đĩ", author: "Vũ Trọng Phụng", year: 1936, genre: "Tiểu thuyết" },
    { title: "Kỹ nghệ lấy Tây", author: "Vũ Trọng Phụng", year: 1934, genre: "Phóng sự" },
    { title: "Cơm thầy cơm cô", author: "Vũ Trọng Phụng", year: 1936, genre: "Phóng sự" },
    { title: "Tắt đèn", author: "Ngô Tất Tố", year: 1937, genre: "Tiểu thuyết" },
    { title: "Lều chõng", author: "Ngô Tất Tố", year: 1939, genre: "Tiểu thuyết" },
    { title: "Hồn bướm mơ tiên", author: "Khái Hưng", year: 1933, genre: "Tiểu thuyết" },
    { title: "Nửa chừng xuân", author: "Khái Hưng", year: 1934, genre: "Tiểu thuyết" },
    { title: "Gánh hàng hoa", author: "Khái Hưng & Nhất Linh", year: 1934, genre: "Tiểu thuyết" },
    { title: "Đoạn tuyệt", author: "Nhất Linh", year: 1935, genre: "Tiểu thuyết" },
    { title: "Lạnh lùng", author: "Nhất Linh", year: 1936, genre: "Tiểu thuyết" },
    { title: "Đôi bạn", author: "Nhất Linh", year: 1938, genre: "Tiểu thuyết" },
    { title: "Tố Tâm", author: "Hoàng Ngọc Phách", year: 1925, genre: "Tiểu thuyết" },
    { title: "Ai làm được", author: "Hồ Biểu Chánh", year: 1922, genre: "Tiểu thuyết" },
    { title: "Cha con nghĩa nặng", author: "Hồ Biểu Chánh", year: 1929, genre: "Tiểu thuyết" },
    { title: "Con nhà nghèo", author: "Hồ Biểu Chánh", year: 1930, genre: "Tiểu thuyết" },
    { title: "Thầy Lazarô Phiền", author: "Nguyễn Trọng Quản", year: 1887, genre: "Truyện" },
    { title: "Truyện Kiều", author: "Nguyễn Du", year: 1820, genre: "Truyện thơ" },
    { title: "Lục Vân Tiên", author: "Nguyễn Đình Chiểu", year: 1865, genre: "Truyện thơ" },
    { title: "Chinh phụ ngâm", author: "Đặng Trần Côn – Đoàn Thị Điểm", year: 1740, genre: "Ngâm khúc" }
  ]
};
