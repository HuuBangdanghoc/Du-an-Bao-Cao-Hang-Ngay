# 📅 Bảng Điều Khiển Ngày

Web app cá nhân giúp quản lý **lịch học, lịch chạy xe, mục tiêu Deep Work** theo từng thứ trong tuần, kèm **theo dõi thu chi hằng ngày** với cảnh báo tự động. Toàn bộ dữ liệu được đồng bộ vào **Google Sheets** của bạn thông qua Google Apps Script — không cần server, không tốn phí.

🔗 **Demo trực tiếp:** `https://<tên-tài-khoản>.github.io/<tên-repo>/`

---

## ✨ Tính năng

- **Chọn ngày trong tuần** (Thứ Hai → Chủ Nhật) để xem đúng lịch trình của ngày đó.
- **Thêm / xoá lịch học, lịch chạy xe, mục tiêu Deep Work** ngay trên giao diện — không cần sửa code. Lịch được gắn theo *Thứ* nên sẽ tự lặp lại vào tuần sau.
- **Tick hoàn thành mục tiêu Deep Work**, trạng thái lưu riêng theo từng ngày cụ thể.
- **Quản lý Thu / Chi hằng ngày**, tự động đổi màu cảnh báo:
  - 🔴 **Cảnh báo** nếu Chi > 126.000đ hoặc Thu < 220.000đ
  - 🟢 **OK** nếu ngược lại
- **Đồng bộ 2 chiều với Google Sheets** — mở app trên máy/điện thoại nào cũng thấy dữ liệu mới nhất.
- Hoạt động cả khi mất mạng nhờ lưu tạm bằng `localStorage`, tự đồng bộ lại khi có mạng.

---

## 📁 Cấu trúc file

| File | Vai trò |
|---|---|
| `index.html` | Toàn bộ giao diện + logic web app (HTML/CSS/JS gộp 1 file) |
| `Code.gs` | Backend Google Apps Script — đọc/ghi dữ liệu vào Google Sheet |
| `HUONG_DAN_CAU_HINH.md` | Hướng dẫn chi tiết cách kết nối Google Sheet |

---

## 🚀 Bắt đầu sử dụng

### 1. Kết nối Google Sheet (bắt buộc để lưu dữ liệu)
Làm theo hướng dẫn chi tiết trong [`HUONG_DAN_CAU_HINH.md`](./HUONG_DAN_CAU_HINH.md):
1. Tạo 1 Google Sheet trống.
2. Dán nội dung `Code.gs` vào **Extensions → Apps Script** của Sheet đó.
3. Deploy thành **Web app** (quyền truy cập: *Anyone*).
4. Copy URL `.../exec` vừa tạo, dán vào biến `gasUrl` trong `index.html`.

### 2. Mở app
- **Cách đơn giản nhất:** bật **GitHub Pages** cho repo này (Settings → Pages → Branch: `main`, thư mục `/root`), sau đó mở link `https://<tên-tài-khoản>.github.io/<tên-repo>/`.
- Không nên mở `index.html` bằng cách double-click trực tiếp trên máy (`file://...`) vì trình duyệt sẽ chặn kết nối tới Google Sheet vì lý do bảo mật (CORS).

### 3. Dùng hằng ngày
- Chọn ngày cần xem ở thanh tab phía trên.
- Bấm **"+ Thêm..."** dưới mỗi khối để thêm lịch học / lịch chạy xe / mục tiêu Deep Work.
- Nhập Thu/Chi ở khung tài chính bên phải, theo dõi trạng thái qua đồng hồ đo (gauge).

---

## 🛠️ Công nghệ sử dụng

- HTML / CSS / JavaScript thuần (không framework, không build tool)
- Google Apps Script làm backend miễn phí
- Google Sheets làm cơ sở dữ liệu

---

## ❓ Xử lý sự cố

Gặp lỗi *"Không tải được từ Sheet"* hoặc dữ liệu không đồng bộ? Xem mục **"Xử lý sự cố thường gặp"** ở cuối file [`HUONG_DAN_CAU_HINH.md`](./HUONG_DAN_CAU_HINH.md).

---

## 📌 Ghi chú

Đây là dự án cá nhân, dữ liệu được lưu trong Google Sheet **của riêng bạn** — không có bên thứ ba nào truy cập được, miễn là bạn không chia sẻ URL Apps Script hoặc quyền truy cập Sheet cho người khác.
