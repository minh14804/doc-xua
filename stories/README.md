# Truyện riêng (đăng trực tiếp trên Đọc Xưa)

Thư mục này chứa truyện **bạn có quyền đăng**: tự viết, thuê người viết, hoặc đã mua/được tác giả cấp phép.
Không đặt ở đây truyện copy từ web khác hay bản dịch ngôn tình chưa có giấy phép.

## Cách thêm một truyện

1. Tạo thư mục `stories/<slug>/`, ví dụ `stories/hoa-no-tren-pho/`.
2. Mỗi chương là một file:
   - `.txt`: chữ thường, các đoạn cách nhau bằng **một dòng trống**.
   - `.html`: nếu muốn tự định dạng (chỉ dùng `<p>`, `<em>`, `<strong>`, `<h2>`...).
3. Khai báo truyện trong `config.js` → `catalog`:

```js
{ title: "Hoa nở trên phố", author: "Bút danh của bạn", year: 2026, genre: "Ngôn tình",
  tags: ["truyen-rieng", "ngon-tinh"], source: "local", slug: "hoa-no-tren-pho",
  blurb: "Giới thiệu ngắn 1–2 câu.",
  chapters: [
    { label: "Chương 1", file: "01.txt" },
    { label: "Chương 2", file: "02.txt" }
  ] }
```

4. Commit và đẩy lên GitHub, khoảng 1 phút sau truyện sẽ xuất hiện ở hàng **Truyện độc quyền** và các hàng có tag tương ứng.

`label` là tên chương hiển thị, không dùng dấu `/`.
