# Nhịp

Ứng dụng không gian công việc nhóm bằng tiếng Việt, xây dựng với Next.js và Auth.js. Đăng nhập bằng tài khoản Google qua OAuth 2.0 / OpenID Connect.

## Bắt đầu

Yêu cầu Node.js 20.9 trở lên và npm.

1. Cài dependencies: `npm install`
2. Tạo OAuth Client ID dạng **Web application** trong Google Cloud Console.
3. Thêm Authorized JavaScript origin `http://localhost:3000` và Authorized redirect URI `http://localhost:3000/api/auth/callback/google`.
4. Điền Client ID vào `AUTH_GOOGLE_ID` và Client Secret vào `AUTH_GOOGLE_SECRET` trong `.env.local`. Đặt `AUTH_HR_ADMIN_EMAIL` thành email Google được cấp HR Admin ban đầu. `AUTH_SECRET` đã được tạo sẵn nếu bạn tiếp tục dùng file hiện tại.
5. Chạy `npm run dev` và mở `http://localhost:3000`.

Trong Google Cloud Console, cấu hình OAuth consent screen và thêm tài khoản Google của bạn vào danh sách test users nếu ứng dụng đang ở chế độ Testing. Không chia sẻ Client Secret; giữ secret ở phía máy chủ và không dùng tiền tố `NEXT_PUBLIC_`.

## Lệnh

- `npm run dev`: chạy môi trường phát triển.
- `npm run build`: tạo bản production.
- `npm start`: chạy bản production đã build.
- `npm run lint`: kiểm tra ESLint.
- `npm run typecheck`: kiểm tra kiểu TypeScript.

## Tính năng

- Đăng nhập và đăng xuất bằng Google qua Auth.js.
- Trang tổng quan chỉ hiển thị khi đã đăng nhập.
- Có ba chức vụ: Nhân viên, Quản lý và HR Admin. Quản lý xem danh sách nhân sự; HR Admin có thể thay đổi chức vụ. Quyền được kiểm tra ở server.
- Tài khoản trong `AUTH_HR_ADMIN_EMAIL` luôn được giữ ở chức vụ HR Admin; không thể hạ chức vụ tài khoản này trong giao diện.
- Danh sách nhân sự và chức vụ hiện chỉ được lưu tạm trong bộ nhớ máy chủ, mất khi tiến trình khởi động lại và không đồng bộ giữa nhiều instance. Chỉ dùng để thử nghiệm; cần chuyển sang cơ sở dữ liệu dùng chung trước khi triển khai production.
- Tìm kiếm, lọc, tạo và đánh dấu hoàn thành công việc trong giao diện.
- Bảng công việc hiện dùng dữ liệu mẫu trong bộ nhớ trình duyệt; dữ liệu sẽ trở về mẫu ban đầu khi tải lại trang. Chưa có cơ sở dữ liệu hoặc lưu trữ công việc lâu dài.