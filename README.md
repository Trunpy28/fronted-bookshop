# FRONTEND BOOKSHOP
## Cài đặt

### 1. Clone repository
```bash
git clone <repository-url>
cd frontend-bookshop
```

### 2. Cài đặt các dependencies
```bash
npm install
# hoặc
yarn install
```

### 3. Tạo file .env
Sao chép file .example.env thành file .env:
```bash
cp .example.env .env
```

### 4. Cấu hình file .env
Mở file .env và cập nhật các thông số sau:
```
# API URL - Đường dẫn đến backend API
VITE_API_URL=http://localhost:3001

# Paypal - Client ID từ tài khoản PayPal Developer
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id

# Chế độ môi trường local
VITE_IS_LOCAL=true
```

### 5. Khởi động ứng dụng
```bash
# Chế độ phát triển
npm run dev
# hoặc
yarn dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173` (mặc định của Vite)

### 6. Build cho production
```bash
npm run build
# hoặc
yarn build
```

## Lưu ý
- Đảm bảo backend đang chạy trước khi khởi động frontend
- Kiểm tra kỹ các thông số trong file .env trước khi triển khai
- Để sử dụng tính năng thanh toán PayPal, cần đăng ký tài khoản PayPal Developer và lấy Client ID
