import cv2
import torch
import argparse
import threading
import requests
import time
from flask import Flask, Response
from function.helper import read_plate
from function.utils_rotate import deskew

print("🔄 Loading YOLO models...")
yolo_LP_detect = torch.hub.load(
    'yolov5', 'custom', path='models/LP_detector.pt',
    source='local', force_reload=False
)
yolo_license_plate = torch.hub.load(
    'yolov5', 'custom', path='models/LP_ocr.pt',
    source='local', force_reload=False
)

device = 'cuda' if torch.cuda.is_available() else 'cpu'
yolo_LP_detect.to(device)
yolo_license_plate.to(device)
print(f"✅ YOLO models loaded on {device}")

app = Flask(__name__)
output_frame = None
frame_lock = threading.Lock()

recent_plates = {}
COOLDOWN_SECONDS = 6        
CACHE_CLEANUP_INTERVAL = 60  


def cleanup_cache():
    """Tự động dọn cache biển số cũ để tránh đầy bộ nhớ"""
    while True:
        now = time.time()
        expired_keys = [k for k, t in recent_plates.items() if now - t > COOLDOWN_SECONDS * 3]
        for k in expired_keys:
            del recent_plates[k]
        time.sleep(CACHE_CLEANUP_INTERVAL)


threading.Thread(target=cleanup_cache, daemon=True).start()


def send_to_node(camera_type, plate, node_url):
    """Gửi dữ liệu biển số sang NodeJS, có chống gửi trùng"""
    global recent_plates

    key = f"{camera_type}:{plate}".lower().strip()
    now = time.time()

    if key in recent_plates and (now - recent_plates[key]) < COOLDOWN_SECONDS:
        print(f"⏳ Skipped duplicate plate ({camera_type}): {plate}")
        return

    recent_plates[key] = now

    url = f"{node_url}/api/cars/event"
    payload = {
        "plate_number": plate,
        "event": camera_type,
        "camera_id": camera_type,
        "video_filename": None
    }

    try:
        res = requests.post(url, json=payload, timeout=2)
        print(f"✅ Sent to NodeJS ({camera_type}): {plate} | Response: {res.status_code}")
    except Exception as e:
        print("❌ Error sending to NodeJS:", e)


def detect_and_draw(frame, camera_type, node_url):
    try:
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = yolo_LP_detect(rgb)
        plates = results.pandas().xyxy[0]

        for _, row in plates.iterrows():
            if row['confidence'] > 0.5:
                x1, y1, x2, y2 = map(int, [int(row['xmin']), int(row['ymin']),
                                           int(row['xmax']), int(row['ymax'])])
                plate_roi = rgb[y1:y2, x1:x2]
                plate = read_plate(yolo_license_plate, plate_roi)

                # Vẽ khung và label
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                label = plate if plate else "Unknown"
                cv2.putText(frame, label, (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

                if plate and plate.lower() != "unknown":
                    send_to_node(camera_type, plate, node_url)

    except Exception as e:
        print("⚠️ Error detect:", e)

    return frame

def camera_worker(camera_id, camera_type, node_url):
    global output_frame
    cap = cv2.VideoCapture(camera_id)
    if not cap.isOpened():
        print(f"❌ Camera {camera_id} không mở được!")
        return

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame = detect_and_draw(frame, camera_type, node_url)

        with frame_lock:
            output_frame = frame.copy()

    cap.release()

def generate_stream():
    global output_frame
    while True:
        with frame_lock:
            if output_frame is None:
                continue
            ret, buffer = cv2.imencode('.jpg', output_frame)
            frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')


@app.route('/video_feed')
def video_feed():
    return Response(generate_stream(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--camera_id", type=int, required=True, help="ID của camera (0,1,2...)")
    parser.add_argument("--camera_type", choices=["in", "out"], required=True, help="Loại camera: in/out")
    parser.add_argument("--node_url", type=str, default="http://localhost:3000", help="API NodeJS server URL")
    args = parser.parse_args()

    t = threading.Thread(target=camera_worker, args=(args.camera_id, args.camera_type, args.node_url), daemon=True)
    t.start()

    port = 5000 if args.camera_type == "in" else 5001
    print(f"🚀 Flask running for camera {args.camera_type} on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False, threaded=True, use_reloader=False)
