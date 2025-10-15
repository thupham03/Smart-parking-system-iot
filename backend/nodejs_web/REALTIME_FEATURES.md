# Realtime Features Documentation

## Tổng quan
Hệ thống đã được cập nhật để hỗ trợ hiển thị dữ liệu realtime sử dụng Socket.IO. Tất cả các trang đều có thể nhận và hiển thị dữ liệu cập nhật theo thời gian thực.

## Các tính năng Realtime

### 1. Trang chủ (Home)
- **Cập nhật số xe hiện tại**: Tự động cập nhật khi có xe vào/ra
- **Cập nhật số chỗ trống**: Hiển thị realtime số chỗ đỗ còn trống
- **Cập nhật thống kê**: Số lượt xe vào/ra trong ngày
- **Danh sách xe hiện tại**: Cập nhật danh sách xe đang đỗ

### 2. Quản lý bãi đỗ (Parking Management)
- **Trạng thái slot**: Hiển thị realtime slot nào đang có xe/trống
- **Biển số xe**: Hiển thị biển số xe đang đỗ tại mỗi slot
- **Cập nhật slot**: Tự động cập nhật khi có thay đổi từ sensor/camera

### 3. Quản lý xe (Car Management)
- **Danh sách xe**: Cập nhật danh sách xe mới nhất
- **Trạng thái xe**: Hiển thị xe nào đang đỗ/đã rời
- **Thông tin RFID**: Cập nhật thông tin RFID của xe

### 4. Logs
- **Log mới**: Tự động thêm log mới vào đầu danh sách
- **Cảnh báo**: Hiển thị cảnh báo khi có sự kiện bất thường
- **Lọc và phân trang**: Duy trì trạng thái lọc khi có dữ liệu mới

### 5. Analytics
- **Biểu đồ**: Cập nhật biểu đồ theo thời gian thực
- **Thống kê**: Cập nhật các số liệu thống kê
- **So sánh**: Hiển thị thay đổi so với kỳ trước

## Socket.IO Events

### Events từ Server
- `parking_update`: Cập nhật trạng thái slot đỗ xe
- `car_update`: Cập nhật thông tin xe
- `log_update`: Thêm log mới
- `stats_update`: Cập nhật thống kê
- `alert_event`: Cảnh báo hệ thống

### Events từ Client
- `connect`: Kết nối thành công
- `disconnect`: Mất kết nối
- `test`: Test kết nối (chỉ dành cho development)

## Cách sử dụng

### 1. Kích hoạt Realtime
Socket.IO sẽ tự động kết nối khi trang được tải. Không cần cấu hình thêm.

### 2. Test Realtime
Sử dụng file `socket-test.js` để test các tính năng realtime:
```javascript
// Test kết nối
testSocketConnection();

// Test cập nhật
testRealtimeUpdates();
```

### 3. Debug
Mở Developer Tools (F12) để xem các log Socket.IO:
- `🔗 Connected to server`: Kết nối thành công
- `❌ Disconnected from server`: Mất kết nối
- `🅿️ Parking update received`: Nhận cập nhật bãi đỗ
- `🚗 Car update received`: Nhận cập nhật xe
- `📋 Log update received`: Nhận log mới
- `📊 Stats update received`: Nhận cập nhật thống kê
- `⚠️ Alert received`: Nhận cảnh báo

## Cấu hình

### Backend (Server)
- Socket.IO được tích hợp vào Express server
- Events được emit từ các controller khi có thay đổi dữ liệu
- Tự động cập nhật stats khi có sự kiện xe vào/ra

### Frontend (Client)
- Socket.IO client tự động kết nối
- Event listeners được đăng ký cho từng trang
- UI được cập nhật realtime khi nhận events

## Troubleshooting

### 1. Không nhận được updates
- Kiểm tra kết nối Socket.IO trong Developer Tools
- Đảm bảo server đang chạy
- Kiểm tra network connection

### 2. Dữ liệu không cập nhật
- Refresh trang để tải lại dữ liệu ban đầu
- Kiểm tra console để xem có lỗi JavaScript không
- Đảm bảo các event listeners được đăng ký đúng

### 3. Performance issues
- Giảm tần suất polling (đã được tối ưu)
- Kiểm tra số lượng events được emit
- Monitor memory usage trong browser

## Tương lai

### Các tính năng có thể thêm:
1. **Push notifications**: Thông báo khi có xe vào/ra
2. **Sound alerts**: Âm thanh cảnh báo
3. **Visual indicators**: Hiệu ứng visual khi có cập nhật
4. **Mobile responsive**: Tối ưu cho mobile
5. **Offline support**: Hoạt động khi mất kết nối

### Tối ưu hóa:
1. **Data compression**: Nén dữ liệu Socket.IO
2. **Selective updates**: Chỉ cập nhật phần cần thiết
3. **Caching**: Cache dữ liệu để giảm tải server
4. **Rate limiting**: Giới hạn tần suất cập nhật
