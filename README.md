HỆ THỐNG BÃI ĐỖ XE THÔNG MINH (SMART PARKING SYSTEM IoT)

Dự án **IoT tích hợp** sử dụng **ESP32, Node.js, MongoDB và mô hình YOLOv5** để **quản lý xe ra/vào bãi, nhận diện biển số và tính tiền tự động**.  
Hệ thống hoạt động **theo thời gian thực**, điều khiển **cổng servo tự động**, ghi nhận dữ liệu từ cảm biến và hiển thị toàn bộ thông tin trên **bảng điều khiển web**.

## ⚙️ CẤU TRÚC HOẠT ĐỘNG

Hệ thống gồm 3 thành phần chính kết nối với nhau qua **HTTP (REST API)** và **Socket.IO**:
### 🔹 1. ESP32 (Thiết bị phần cứng)
- Gắn cảm biến **IR**, đầu đọc **RFID** và **servo motor**.  
- Khi xe đi vào, ESP32 phát hiện cảm biến, đọc thẻ RFID và **gửi dữ liệu lên server Node.js** qua **HTTP POST**.  
- Nhận **lệnh điều khiển servo** (mở/đóng cổng) từ Node.js thông qua **Socket.IO** theo thời gian thực.
### 🔹 2. Server Node.js (Điều phối trung tâm)
- Xử lý toàn bộ dữ liệu xe, slot bãi đỗ và log sự kiện.  
- Cung cấp các **API RESTful** (`/api/cars`, `/api/parking-slot`, `/api/logs`, `/api/users`).  
- Nhận dữ liệu từ ESP32 và Python, cập nhật trạng thái xe – chỗ đỗ – thời gian ra/vào.  
- Gửi lệnh điều khiển servo và **phát sự kiện realtime** (`car_event`, `rfid_event`, `slot_update`, `alert_event`).  
- Tính tiền gửi xe tự động: **5.000đ trong ngày, 10.000đ qua đêm**.  
- Lưu toàn bộ dữ liệu vào **MongoDB**.
### 🔹 3. Server Python (Nhận diện biển số)
- Sử dụng **YOLOv5 + OpenCV** để phát hiện và nhận diện biển số xe.  
- Gửi kết quả nhận diện về **Node.js server** qua **HTTP POST** để đối chiếu với thẻ RFID.  
- Hỗ trợ đồng bộ giữa **nhận diện camera** và **sự kiện RFID** để đảm bảo tính chính xác.
### 🔹 4. Dashboard Web (Giám sát thời gian thực)
- Xây dựng bằng **Handlebars + Socket.IO**.  
- Hiển thị:
  - Trạng thái chỗ đỗ (còn trống / đang sử dụng)  
  - Danh sách xe đang trong bãi  
  - Lịch sử ra/vào và thông báo cảnh báo  
  - Biểu đồ thống kê
## 🔄 LUỒNG DỮ LIỆU TỔNG QUÁT

<img width="787" height="645" alt="image" src="https://github.com/user-attachments/assets/655782c1-c92d-4841-9198-61518f6cb656" />

## 🧩 THIẾT BỊ & CÔNG NGHỆ 

| Thành phần | Mô tả |
|-------------|--------|
| **ESP32** | Vi điều khiển chính, xử lý cảm biến & RFID |
| **IR Sensor** | Phát hiện xe ra/vào |
| **RFID MFRC522** | Đọc thẻ định danh xe |
| **Servo Motor** | Mở/đóng cổng tự động |
| **Node.js + MongoDB** | Xử lý và lưu trữ dữ liệu |
| **Python + YOLOv5** | Nhận diện biển số xe |
| **Socket.IO** | Giao tiếp thời gian thực giữa server và web |
| **Handlebars (HBS)** | Giao diện giám sát realtime |
