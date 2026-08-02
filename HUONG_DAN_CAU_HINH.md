# Hướng dẫn cấu hình — Bảng Điều Khiển Ngày

Bộ 3 file:

| File | Vai trò |
|---|---|
| `index.html` | Toàn bộ Web App (HTML + CSS + JS gộp 1 file) |
| `Code.gs` | Backend chạy trên Google Apps Script, đọc/ghi Google Sheet |
| `HUONG_DAN_CAU_HINH.md` | File này |

**Điểm mới:** giờ bạn **thêm / xoá lịch học, lịch chạy xe, mục tiêu Deep Work ngay trên giao diện web** — không cần mở code nữa. Mỗi khối có nút **"+ Thêm..."** ở cuối, bấm vào để nhập rồi Lưu; mỗi mục có nút **✕** để xoá.

---

## Bước 1 — Tạo Google Sheet

1. Vào [sheets.google.com](https://sheets.google.com) → **Blank spreadsheet**.
2. Đặt tên bất kỳ, ví dụ **"Data - Bang Dieu Khien Ngay"**.
3. Không cần tạo sẵn cột/sheet con nào — script tự tạo 3 sheet `Schedule`, `Transactions`, `Goals` khi chạy lần đầu.

## Bước 2 — Gắn Apps Script vào Sheet

1. Trong Google Sheet: **Tiện ích mở rộng (Extensions) → Apps Script**.
2. Xoá code mẫu `myFunction() {...}` có sẵn.
3. Copy toàn bộ nội dung file `Code.gs` mình gửi, dán vào.
4. Nhấn 💾 **Lưu** (`Ctrl+S`).

## Bước 3 — Triển khai (Deploy) thành Web App

1. Góc trên phải: **Triển khai (Deploy) → Triển khai mới (New deployment)**.
2. Bấm ⚙️ ở mục **Select type** → chọn **Web app**.
3. Cấu hình:
   - **Execute as**: `Me (bạn)`
   - **Who has access**: `Anyone` — bắt buộc để web gọi được API không cần đăng nhập Google.
4. Bấm **Deploy**.
5. Cấp quyền lần đầu: chọn tài khoản → nếu cảnh báo "chưa xác minh" → **Advanced** → **Go to [project] (unsafe)** → **Allow**. (Bình thường vì đây là script cá nhân.)
6. Copy **URL Web App** hiện ra, dạng:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

## Bước 4 — Gắn URL vào `index.html`

Mở `index.html`, tìm:
```js
gasUrl: "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE",
```
Thay bằng URL vừa copy, lưu file lại.

## Bước 5 — Sử dụng

1. Mở `index.html` bằng trình duyệt (double-click, hoặc host trên GitHub Pages/Netlify tuỳ ý).
2. Chọn 1 ngày trong tuần (VD: Thứ Ba).
3. Ở mỗi khối **Lịch học / Lịch chạy xe / Mục tiêu Deep Work**, bấm **"+ Thêm..."**, nhập giờ + nội dung (giờ không bắt buộc với Deep Work), bấm **Lưu**.
   → Mục này sẽ **lặp lại vào mọi Thứ Ba** các tuần sau (lịch trình gắn theo THỨ trong tuần, không phải theo 1 ngày cụ thể).
4. Muốn xoá mục nào, bấm dấu **✕** bên cạnh mục đó.
5. Khung Tài chính: nhập Thu/Chi — dữ liệu này gắn theo **ngày cụ thể** (không lặp lại), tự đổi màu gauge theo ngưỡng cảnh báo.
6. Trạng thái đồng bộ ở góc trên phải: 🟠 đang tải, 🟢 đã đồng bộ, 🔴 lỗi mạng (dữ liệu vẫn an toàn trong máy, sẽ không mất).

## Phân biệt 2 loại dữ liệu

- **Lịch trình (Schedule)**: lặp lại theo **Thứ** (T2–CN) — sửa 1 lần, áp dụng cho thứ đó ở mọi tuần. Lưu ở sheet `Schedule`.
- **Thu/Chi và trạng thái hoàn thành mục tiêu**: gắn theo **ngày cụ thể** (VD: 05/08/2026) — mỗi ngày độc lập. Lưu ở sheet `Transactions` và `Goals`.

## Chỉnh ngưỡng cảnh báo tài chính

Trong `index.html`, mục `CONFIG`:
```js
chiThreshold: 126000,  // Chi > 126.000đ => cảnh báo
thuThreshold: 220000,  // Thu < 220.000đ => cảnh báo
```

## Xử lý sự cố thường gặp

- **"Không tải được từ Sheet"**: kiểm tra URL kết thúc bằng `/exec` (không phải `/dev`), và Deploy đã chọn "Anyone".
- **Sửa `Code.gs` sau này không có tác dụng**: mỗi lần sửa, phải vào **Deploy → Manage deployments → bút chì Edit → chọn version mới (New version) → Deploy** thì mới áp dụng.
- **Xem dữ liệu thô**: mở lại Google Sheet, sẽ có 3 tab `Schedule`, `Transactions`, `Goals` tạo tự động.
- **Nhiều thiết bị**: mỗi lần mở app, nó tự tải lịch trình mới nhất từ Sheet (nếu đã cấu hình `gasUrl`), nên sửa trên máy này sẽ thấy trên máy khác sau khi tải lại trang.
