# Đọc Xưa — web đọc truyện chữ

Web tĩnh (HTML/CSS/JS thuần, không cần build) để đọc tiểu thuyết, truyện và thơ Việt Nam.
Nội dung được tải **trực tiếp từ [Wikisource tiếng Việt](https://vi.wikisource.org)** trong trình duyệt người đọc,
nên repo không chứa văn bản tác phẩm.

## Tính năng
- Tủ sách theo thể loại, tự ẩn tác phẩm không còn trên Wikisource
- Tìm kiếm toàn bộ Wikisource tiếng Việt
- Trình đọc: mục lục, chương trước/sau, tải trước chương kế, thanh tiến độ
- Cài đặt đọc: cỡ chữ, nền Sáng / Giấy / Tối, chữ có chân / không chân (lưu trên máy)
- "Đang đọc dở" để quay lại chương gần nhất
- **Affiliate**: cứ N chương hiện ô "mở link để đọc tiếp" (mở khoá X phút), banner gợi ý cuối chương, link mua sách riêng cho từng tác phẩm

## Cấu hình — sửa `config.js`
| Mục | Ý nghĩa |
|---|---|
| `affiliate.links` | **Thay `https://s.shopee.vn/XXXXXXXX` bằng link affiliate thật** |
| `affiliate.gateEvery` | Số chương giữa mỗi lần chặn (0 = không chặn) |
| `affiliate.unlockMinutes` | Thời gian đọc tự do sau khi bấm link |
| `affiliate.enabled` | Tắt hẳn phần affiliate |
| `catalog[]` | Danh mục truyện: `title` là tên trang trên vi.wikisource.org; thêm `shopee` để gắn link mua sách riêng |

## Chạy thử trên máy
```bash
python -m http.server 8000
# mở http://localhost:8000
```

## Đăng lên GitHub Pages
Settings → Pages → Source: *Deploy from a branch* → `main` / `/ (root)`.

## Bản quyền nội dung
Tác phẩm trên Wikisource thuộc phạm vi công cộng hoặc giấy phép CC BY-SA; footer đã ghi nguồn.
