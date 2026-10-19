# Nhịp

Ứng dụng không gian công việc nhóm bằng tiếng Việt, xây dựng với Next.js và Auth.js. Đăng nhập bằng tài khoản Google qua OAuth 2.0 / OpenID Connect.

## Chạy cục bộ

Yêu cầu Node.js 20.9 trở lên và npm.

1. Cài dependencies bằng `npm install`.
2. Tạo OAuth Client ID loại **Web application** trong Google Cloud Console.
3. Trong phần Authorized redirect URIs, thêm chính xác `http://localhost:3000/api/auth/callback/google`. Có thể thêm Authorized JavaScript origin `http://localhost:3000`.
4. Sao chép `.env.example` thành `.env.local`, rồi điền `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` và đặt `AUTH_HR_ADMIN_EMAIL` thành email Google sẽ làm HR Admin khởi tạo. Tạo `AUTH_SECRET` riêng, ví dụ bằng `openssl rand -base64 32`.
5. Cấu hình OAuth consent screen. Nếu ứng dụng đang ở chế độ Testing, thêm các tài khoản muốn thử vào danh sách test users.
6. Chạy `npm run dev` và mở `http://localhost:3000`.

Nếu đổi cổng mặc định 3000, cập nhật `AUTH_URL`, OAuth origin và redirect URI trong Google Cloud Console cho khớp. Không commit `.env.local`, không chia sẻ Client Secret, và không đưa thông tin xác thực vào biến `NEXT_PUBLIC_*`.

## Demo OAuth 2.0 / OpenID Connect

Auth.js Google provider được cấu hình dạng OpenID Connect (OIDC), xây trên OAuth 2.0. Khi đăng nhập:

1. Tại `/login`, chọn **Tiếp tục với Google**. Trình duyệt được chuyển tới Google để xác thực và xin quyền đăng nhập.
2. Sau khi chấp thuận, Google chuyển trình duyệt về `/api/auth/callback/google` bằng authorization code.
3. Auth.js xử lý callback và trao đổi code với Google ở phía máy chủ; provider OIDC xác minh phản hồi danh tính, rồi Auth.js tạo session cho ứng dụng.
4. Ứng dụng đọc session ở phía máy chủ. Người chưa có session bị chuyển về `/login`; role trong session được lấy từ registry phía máy chủ.

Để trình bày demo, mở Developer Tools → Network và quan sát lượt chuyển hướng tới Google cùng callback về `/api/auth/callback/google`. Việc đổi authorization code và xử lý token diễn ra server-to-server, vì vậy không cần và không nên sao chép ID token, access token hay client secret ra console, ảnh chụp màn hình hoặc công cụ chia sẻ. OAuth 2.0 cấp quyền truy cập; OIDC bổ sung lớp xác thực danh tính và ID token.

## Demo Phân Quyền

Vai trò gồm **Nhân viên**, **Quản lý** và **HR Admin**. Cách tạo dữ liệu demo:

1. Đặt `AUTH_HR_ADMIN_EMAIL` bằng email Google của tài khoản quản trị demo rồi khởi động ứng dụng.
2. Đăng nhập bằng tài khoản đó. Tài khoản này được khởi tạo với vai trò HR Admin và không thể bị hạ quyền trong giao diện.
3. Đăng xuất, lần lượt đăng nhập bằng ít nhất hai tài khoản Google khác để chúng xuất hiện trong danh sách nhân sự. Các tài khoản mới mặc định là Nhân viên.
4. Đăng nhập lại bằng HR Admin, mở **Nhân sự** ở thanh bên hoặc vào `/people`. Đổi một tài khoản thành Quản lý và một tài khoản khác giữ vai trò Nhân viên.
5. Đăng nhập bằng tài khoản Quản lý: `/people` hiển thị danh sách, nhưng không có điều khiển đổi chức vụ.
6. Đăng nhập bằng tài khoản Nhân viên: mở trực tiếp `/people`; ứng dụng chuyển về trang tổng quan. Nhân viên không thấy mục Nhân sự trong thanh bên.
7. Kiểm tra giới hạn bảo vệ: server action chỉ chấp nhận cập nhật khi session thuộc HR Admin; HR Admin không thể tự hạ quyền, hạ tài khoản khởi tạo hoặc xóa HR Admin cuối cùng.

Đổi role chỉ cập nhật registry trong bộ nhớ, nên kết quả tồn tại trong tiến trình hiện tại. Đừng khởi động lại dev server giữa các bước demo nếu muốn giữ danh sách và vai trò.

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
- Danh sách nhân sự và chức vụ chỉ được lưu tạm trong bộ nhớ máy chủ, mất khi tiến trình khởi động lại và không đồng bộ giữa nhiều instance. Đây là demo, chưa phù hợp production; cần chuyển sang cơ sở dữ liệu dùng chung trước khi triển khai thật.
- Tìm kiếm, lọc, tạo và đánh dấu hoàn thành công việc trong giao diện.
- Bảng công việc hiện dùng dữ liệu mẫu trong bộ nhớ trình duyệt; dữ liệu sẽ trở về mẫu ban đầu khi tải lại trang. Chưa có cơ sở dữ liệu hoặc lưu trữ công việc lâu dài.