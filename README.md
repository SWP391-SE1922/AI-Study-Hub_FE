# AI Study Hub - Integrated Platform

Dự án này là hệ thống **AI Study Hub**, bao gồm cả hai thành phần **Frontend (React/Vite)** và **Backend (Node.js/Express/Prisma)** tích hợp trong cùng một thư mục làm việc.

---

## 📁 Cấu trúc thư mục dự án

```text
├── prisma/
│   ├── migrations/      # Lịch sử migration cơ sở dữ liệu
│   ├── schema.prisma    # Định nghĩa mô hình dữ liệu (Prisma Schema)
│   └── seed.js          # Chèn dữ liệu mẫu ban đầu (Seed data)
├── src/
│   ├── app/             # [Frontend] Mã nguồn React, Components, Pages, State
│   ├── controllers/     # [Backend] Xử lý logic nghiệp vụ các request
│   ├── middlewares/     # [Backend] Xác thực JWT, phân quyền, xử lý lỗi
│   ├── routes/          # [Backend] Định nghĩa các endpoint API (ví dụ: /api/auth)
│   ├── services/        # [Backend] Các dịch vụ xử lý logic nghiệp vụ độc lập
│   ├── app.js           # [Backend] Cấu hình Express và Middleware
│   ├── main.tsx         # [Frontend] Entrypoint của React App
│   └── server.js        # [Backend] Entrypoint chạy Express server
├── package.json         # Khai báo các lệnh script và thư viện phụ thuộc
└── vite.config.mts      # Cấu hình build và chạy Frontend Vite
```

---

## 🚀 Quy trình Thiết lập & Khởi chạy dự án

### Bước 1: Cài đặt thư viện phụ thuộc (Dependencies)
Chạy lệnh sau tại thư mục gốc để cài đặt tất cả thư viện cho cả FE và BE:
```bash
npm install
```

### Bước 2: Tạo và cấu hình file môi trường `.env`
Sao chép cấu hình từ file mẫu `.env.example` thành file `.env` ở thư mục gốc và cấu hình kết nối database SQL Server cùng SMTP Email:
```env
PORT=3636
DATABASE_URL="sqlserver://localhost:1433;database=ai_management_system;user=sa;password=<MAT_KHAU_CUA_BAN>;encrypt=true;trustServerCertificate=true"
JWT_SECRET="uAiVBkJekQZ0eFI0MmPJXQLYSF6WVHCNV21BG24RAl0"
BCRYPT_SALT_ROUNDS=10

# Cấu hình Email gửi đi (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ntan0409@gmail.com
SMTP_PASS=geokvydsihqresri
```

### Bước 3: Thiết lập Cơ sở dữ liệu tự động
Chạy lệnh duy nhất sau để tự động khởi tạo database, chạy migrations và thêm tài liệu/tài khoản mẫu:
```bash
npm run setup
```

### Bước 4: Khởi chạy dự án

#### Chạy Frontend (Vite)
Mặc định chạy ở `http://localhost:5173`:
```bash
npm run dev
```

#### Chạy Backend (Nodemon)
Mặc định chạy ở `http://localhost:3636`:
```bash
npm run dev:be
```

---

## 👥 Tài khoản Dữ liệu Mẫu (Seed Data)
Sau khi chạy lệnh `npm run setup`, các tài khoản sau sẽ được tạo tự động:

1. **Tài khoản Admin:**
   * **Email:** `admin@gmail.com`
   * **Mật khẩu:** `123456`
   * **Role:** `admin`

2. **Tài khoản Học sinh (Student):**
   * **Email:** `student@gmail.com`
   * **Mật khẩu:** `123456`
   * **Role:** `student`
