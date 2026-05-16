# SplitEZ - Ứng dụng Quản lý & Chia hóa đơn Thông minh 

<img width="945" height="2046" alt="image" src="https://github.com/user-attachments/assets/5a78a920-db5a-4777-9837-3df4385dba9e" />



**SplitEZ** là một ứng dụng di động được xây dựng trên nền tảng **React Native (Expo)** giúp việc chia tiền nhóm, quản lý nợ nần trở nên đơn giản, minh bạch và nhanh chóng hơn bao giờ hết. Với sự hỗ trợ của công nghệ **OCR (Quét hóa đơn)** và thuật toán **Tối ưu hóa nợ**, bạn sẽ không còn phải đau đầu tính toán sau mỗi bữa tiệc.

---
## Cấu Trúc Thư Mục

```text
SplitEZ/
├── src/                    # Thư mục chứa toàn bộ mã nguồn ứng dụng
│   ├── api/                # Quản lý các kết nối bên ngoài (Firebase, OCR)
│   ├── assets/             # Tài nguyên tĩnh (Hình ảnh, Fonts, Icons)
│   ├── components/         # Các thành phần giao diện dùng chung (Button, Card...)
│   ├── constants/          # Lưu trữ hằng số và Theme (màu sắc, font size)
│   ├── navigation/         # Cấu hình điều hướng (Stack, Tabs)
│   ├── screens/            # Chứa các màn hình chính của ứng dụng
│   ├── store/              # Quản lý trạng thái toàn cục (Zustand Stores)
│   └── utils/              # Các hàm bổ trợ và thuật toán (Debt Simplification)
├── App.js                  # Entry point của ứng dụng Expo
├── app.json                # Cấu hình dự án Expo
├── package.json            # Quản lý thư viện và scripts
└── TECHNICAL_GUIDE.md      # Tài liệu hướng dẫn kỹ thuật chi tiết
```

---

## Tính Năng Nổi Bật

- **Quét Hóa Đơn Thông Minh (OCR)**: Tự động bóc tách tên món và giá tiền từ ảnh chụp hóa đơn.
- **Tối Ưu Hóa Nợ (Debt Simplification)**: Thuật toán thông minh giúp giảm tối đa số lượng giao dịch cần thực hiện trong nhóm.
- **Đồng Bộ Real-time**: Dữ liệu cập nhật ngay lập tức nhờ Firebase Cloud Firestore.
- **Nhắc Nợ Tự Động**: Thông báo đẩy nhắc nhở các thành viên thanh toán đúng hạn.
- **Thanh Toán Nhanh**: Tích hợp tạo mã QR thanh toán (VietQR/MoMo) để chuyển khoản trong tích tắc.
- **Quản Lý Nhóm**: Tạo nhóm riêng biệt cho bạn bè, gia đình hoặc đồng nghiệp.

---

## Công Nghệ Sử Dụng

- **Frontend**: React Native, Expo SDK
- **State Management**: Zustand
- **Backend**: Firebase (Authentication, Firestore)
- **UI Library**: React Native Paper (Material Design)
- **OCR Service**: OCR.space API
- **Navigation**: React Navigation (Stack & Tabs)

---

## Hướng Dẫn Cài Đặt

### 1. Yêu cầu hệ thống
- Đã cài đặt **Node.js** (LTS version).
- Đã cài đặt **Git**.
- Ứng dụng **Expo Go** trên điện thoại (để test).

### 2. Các bước thực hiện
```bash
# Clone dự án
git clone https://github.com/LuongTuanDev/SplitEZ.git

# Di chuyển vào thư mục dự án
cd SplitEZ

# Cài đặt thư viện
npm install

# Chạy ứng dụng
npx expo start
```

---

## Ảnh Chụp Ứng Dụng

| Dashboard | Quét Hóa Đơn | Quản Lý Nhóm |
| :---: | :---: | :---: |
| <img width="945" height="2046" alt="image" src="https://github.com/user-attachments/assets/e0a15591-5d3d-43c5-b134-bda97dd938e7" />
 | <img width="945" height="2046" alt="image" src="https://github.com/user-attachments/assets/1cce00d0-c37d-44a2-b5d5-6e20c1866d90" />
 <img width="945" height="2046" alt="image" src="https://github.com/user-attachments/assets/bac1e1d8-e682-4a28-ba63-4c892653b5ac" />
<img width="945" height="2046" alt="image" src="https://github.com/user-attachments/assets/aad74de3-9024-4a55-ab27-1d6986437ef5" />
 | <img width="945" height="2046" alt="image" src="https://github.com/user-attachments/assets/f8f55544-133b-4a0a-83e6-761ea8a54471" />
 |


---

## Tài Liệu Kỹ Thuật
Để hiểu sâu hơn về kiến trúc và các thuật toán trong app 
# TỔNG HỢP KIẾN THỨC VÀ CÔNG NGHỆ SỬ DỤNG TRONG SPLITEZ

---

## 1. Công Nghệ Cốt Lõi (Core Technologies)

### Frontend Framework: React Native & Expo
- **React Native**: Framework mã nguồn mở cho phép phát triển ứng dụng di động đa nền tảng (iOS & Android) bằng JavaScript/TypeScript.
- **Expo SDK**: Bộ công cụ giúp truy cập các tính năng phần cứng (Camera, Notifications, Storage) một cách dễ dàng và đồng nhất.
- **Mô hình lập trình**: Functional Components với **React Hooks** (`useState`, `useEffect`, `useMemo`, `useCallback`).

### Quản lý trạng thái (State Management): Zustand
- Thay vì sử dụng Redux phức tạp, ứng dụng sử dụng **Zustand**.
- **Lý do chọn**: Nhẹ, hiệu năng cao, cú pháp đơn giản, hỗ trợ tốt cho ứng dụng Real-time.
- **Sử dụng**: Quản lý thông tin người dùng, danh sách nhóm, và trạng thái loading toàn ứng dụng.

### Backend & Database: Firebase
- **Firebase Authentication**: Quản lý đăng nhập/đăng ký, bảo mật tài khoản người dùng.
- **Cloud Firestore**: Cơ sở dữ liệu NoSQL Real-time. Giúp đồng bộ hóa dữ liệu nợ nần giữa các thành viên ngay lập tức khi có thay đổi.
- **Firestore Security Rules**: Thiết lập quyền truy cập dữ liệu (chỉ thành viên trong nhóm mới được xem hóa đơn của nhóm đó).

---

## 2. Các Tính Năng Kỹ Thuật Đặc Biệt (Advanced Features)

### Công nghệ OCR (Optical Character Recognition)
- **Dịch vụ**: Sử dụng **OCR.space API**.
- **Quy trình xử lý**:
    1. Chụp ảnh/Chọn ảnh từ thư viện bằng `expo-image-picker`.
    2. Chuyển đổi ảnh sang định dạng **Base64**.
    3. Gửi Request qua **Axios** tới máy chủ OCR.
    4. **Regex Parsing**: Sử dụng Biểu thức chính quy (Regular Expressions) để bóc tách dữ liệu từ chuỗi văn bản thô (Tên món ăn, Đơn giá, Tổng tiền, Giảm giá).

### Thuật toán Tối ưu hóa nợ (Debt Simplification)
Đây là "trái tim" của ứng dụng, giúp giảm thiểu số lượng giao dịch cần thiết để tất cả mọi người hết nợ.
- **Thuật toán**: Sử dụng thuật toán **Greedy (Tham lam)**.
- **Cách thức hoạt động**:
    1. Tính toán **Số dư ròng (Net Balance)** của từng người (Tổng tiền được nhận - Tổng tiền phải trả).
    2. Chia làm 2 nhóm: Người nợ (âm) và Người được nợ (dương).
    3. Khớp nợ giữa người nợ nhiều nhất và người được nợ nhiều nhất cho đến khi số dư về 0.
- **Lợi ích**: Thay vì A trả B, B trả C, C trả A -> Thuật toán sẽ tính toán để chỉ cần 1-2 giao dịch trực tiếp.

### Thông báo đẩy (Push Notifications)
- **Thư viện**: `expo-notifications`.
- **Ứng dụng**: Nhắc nhở thành viên trả nợ định kỳ hoặc thông báo khi có hóa đơn mới được tạo trong nhóm.

---

## 3. Kiến Thức Lập Trình Mobile Quan Trọng

### Điều hướng (Navigation)
- **React Navigation**: Sử dụng kết hợp **Stack Navigation** (để chuyển giữa các màn hình như Login -> Home) và **Bottom Tab Navigation** (menu chính ở dưới cùng).

### Giao diện người dùng (UI/UX)
- **React Native Paper**: Thư viện UI theo chuẩn Material Design, đảm bảo ứng dụng trông hiện đại và chuyên nghiệp trên cả Android và iOS.
- **Linear Gradient**: Sử dụng `expo-linear-gradient` để tạo các hiệu ứng màu sắc cao cấp, tăng tính thẩm mỹ.
- **Responsive Design**: Sử dụng `Dimensions` và `Flexbox` để giao diện tự điều chỉnh theo kích thước màn hình điện thoại khác nhau.

### Bảo mật dữ liệu
- **AsyncStorage**: Lưu trữ Token đăng nhập cục bộ để người dùng không phải đăng nhập lại nhiều lần.
- **Environment Variables**: Quản lý API Key bảo mật.

---

## 4. Các Hàm Quan Trọng (Key Functions)

| Hàm | Vị trí | Chức năng |
| :--- | :--- | :--- |
| `simplifyDebts()` | `src/utils/debtUtils.js` | Thực hiện thuật toán tối ưu hóa nợ. |
| `scanReceipt()` | `src/api/ocrService.js` | Gửi ảnh lên server OCR và xử lý kết quả trả về. |
| `parseRawText()` | `src/api/ocrService.js` | Sử dụng Regex để tách text thành Item và Price. |
| `useAuthStore()` | `src/store/useAuthStore.js` | Quản lý trạng thái đăng nhập toàn ứng dụng qua Zustand. |
| `calculateGroupStats()` | `src/screens/DashboardScreen.js` | Tính toán tổng nợ/có của người dùng từ Firestore. |

---
---

## Đóng Góp
Mọi đóng góp hoặc báo lỗi vui lòng mở **Issue** hoặc tạo **Pull Request**. 

---
**SplitEZ** - *Chia tiền dễ dàng, giữ trọn niềm vui!*
