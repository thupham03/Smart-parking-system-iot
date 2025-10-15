#include <WiFi.h>
#include <HTTPClient.h>
#include <SocketIoClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ESP32Servo.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

const char* ssid = "wifiname";
const char* password = "passwordname";

const char* carServerUrl = "http://172.20.10.3:3000/api/cars/rfid";          // API RFID
const char* slotStatusServerUrl = "http://172.20.10.3:3000/api/parking-slot/slotStatus"; // API Slot
SocketIoClient socket;

// LCD
LiquidCrystal_I2C lcd(0x27, 16, 2);

// RFID
#define SS_PIN_IN 4
#define RST_PIN_IN 22
#define SS_PIN_OUT 5
#define RST_PIN_OUT 21
MFRC522 rfidIn(SS_PIN_IN, RST_PIN_IN);
MFRC522 rfidOut(SS_PIN_OUT, RST_PIN_OUT);

// IR sensor
#define IR_SENSOR_PIN_1 15
#define IR_SENSOR_PIN_2 16

// Servo
Servo servoIn;
Servo servoOut;
int servoInPin = 14;
int servoOutPin = 2;

// Lấy ID thẻ
String getCardID(MFRC522 rfid) {
  String cardID = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    cardID += String(rfid.uid.uidByte[i], HEX);
  }
  cardID.toUpperCase();
  return cardID;
}

// Gửi log RFID sang Node
void sendLog(String cardID, bool gate_in_status, bool gate_out_status) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(carServerUrl);
    http.addHeader("Content-Type", "application/json");

    String payload = "{\"ma_the\": \"" + cardID + "\","
                     "\"trang_thai_cong_vao\": " + String(gate_in_status ? "true" : "false") + ","
                     "\"trang_thai_cong_ra\": " + String(gate_out_status ? "true" : "false") + "}";

    int httpResponseCode = http.POST(payload);
    Serial.print("HTTP Response code (sendLog): ");
    Serial.println(httpResponseCode);
    http.end();
  }
}

// Gửi trạng thái slot sang Node
void sendSlotStatus(bool sensor1, bool sensor2) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(slotStatusServerUrl);
    http.addHeader("Content-Type", "application/json");

    String payload = "{\"trang_thai_khu_1\": " + String(sensor1 ? "true" : "false") + ","
                     "\"trang_thai_khu_2\": " + String(sensor2 ? "true" : "false") + "}";

    int httpResponseCode = http.POST(payload);
    Serial.print("HTTP Response code (sendSlotStatus): ");
    Serial.println(httpResponseCode);
    http.end();
  }
}

// Nhận event servo từ Node
void handleServoEvent(const char* payload, size_t length) {
  Serial.printf("Servo Event: %s\n", payload);
  String data = String(payload);

  if (data.indexOf("\"gate\":\"in\"") >= 0 && data.indexOf("\"action\":\"open\"") >= 0) {
    lcd.clear();
    lcd.print("Gate IN OPEN");
    servoIn.write(0);
    delay(3000);
    servoIn.write(90);
    lcd.clear();
    lcd.print("Gate IN CLOSE");
  }
  if (data.indexOf("\"gate\":\"out\"") >= 0 && data.indexOf("\"action\":\"open\"") >= 0) {
    lcd.clear();
    lcd.print("Gate OUT OPEN");
    servoOut.write(0);
    delay(3000);
    servoOut.write(90);
    lcd.clear();
    lcd.print("Gate OUT CLOSE");
  }
}

void setup() {
  Serial.begin(115200);

  // Kết nối WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  // LCD
  Wire.begin(25, 26); 
  lcd.begin(16, 2);
  lcd.backlight();
  lcd.print("System Ready");

  // RFID
  SPI.begin();
  rfidIn.PCD_Init();
  rfidOut.PCD_Init();

  // Servo
  servoIn.attach(servoInPin);
  servoOut.attach(servoOutPin);
  servoIn.write(90);
  servoOut.write(90);

  // IR Sensor
  pinMode(IR_SENSOR_PIN_1, INPUT);
  pinMode(IR_SENSOR_PIN_2, INPUT);

  // Socket.IO
  socket.begin("172.20.10.3", 3000, "/socket.io/?EIO=4");
  socket.on("servo_event", handleServoEvent);

  Serial.println("Socket.IO client connected!");
}

void loop() {
  socket.loop();

  if (rfidIn.PICC_IsNewCardPresent() && rfidIn.PICC_ReadCardSerial()) {
    String cardIDIn = getCardID(rfidIn);
    Serial.print("Card IN: ");
    Serial.println(cardIDIn);
    lcd.clear();
    lcd.print("Card IN...");
    sendLog(cardIDIn, true, false);
    rfidIn.PICC_HaltA();
    delay(1000);
  }

  if (rfidOut.PICC_IsNewCardPresent() && rfidOut.PICC_ReadCardSerial()) {
    String cardIDOut = getCardID(rfidOut);
    Serial.print("Card OUT: ");
    Serial.println(cardIDOut);
    lcd.clear();
    lcd.print("Card OUT...");
    sendLog(cardIDOut, false, true);
    rfidOut.PICC_HaltA();
    delay(1000);
  }

  static bool lastSensor1 = false;
  static bool lastSensor2 = false;
  bool sensor1 = digitalRead(IR_SENSOR_PIN_1) == LOW;
  bool sensor2 = digitalRead(IR_SENSOR_PIN_2) == LOW;

  if (sensor1 != lastSensor1 || sensor2 != lastSensor2) {
    sendSlotStatus(sensor1, sensor2);
    lastSensor1 = sensor1;
    lastSensor2 = sensor2;
  }

  delay(200);
}
