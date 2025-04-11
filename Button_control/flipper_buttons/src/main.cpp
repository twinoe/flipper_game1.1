#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>

// WLAN-Zugangsdaten
const char* ssid = "Moto";
const char* password = "lws_ae2025";

// Webserver & WebSocket auf Port 8080
AsyncWebServer server(8080);
AsyncWebSocket ws("/ws");

// Pin-Zuweisung für Buttons: 32 = links, 26 = rechts
const int pins[] = {32, 26};
const char* buttonNames[] = {"left", "right"}; // Namen für Nachrichten

int lastStates[2] = {HIGH, HIGH}; // Letzter Zustand der Buttons (HIGH = nicht gedrückt)

// Sende Nachricht an alle Clients
void notifyClients(const String& msg) {
  ws.textAll(msg);
  Serial.println("Sent: " + msg);
}

// WebSocket Event-Handler
void handleWebSocketEvent(AsyncWebSocket* server, AsyncWebSocketClient* client,
                          AwsEventType type, void* arg, uint8_t* data, size_t len) {
  if (type == WS_EVT_CONNECT) {
    Serial.printf("WebSocket Client #%u connected\n", client->id());
  }
}

// Setup-Funktion
void setup() {
  Serial.begin(115200);

  // Pins als Eingang mit Pullup
  for (int i = 0; i < 2; i++) {
    pinMode(pins[i], INPUT_PULLUP);
  }

  // WLAN-Verbindung herstellen
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi! IP address: " + WiFi.localIP().toString());

  // WebSocket Setup
  ws.onEvent(handleWebSocketEvent);
  server.addHandler(&ws);

  // Testseite
  server.on("/", HTTP_GET, [](AsyncWebServerRequest* request) {
    request->send(200, "text/plain", "Flipper Server Running");
  });

  server.begin();
}

// Haupt-Loop
void loop() {
  static unsigned long lastCheck = 0;

  // Alle 20ms Buttons prüfen
  if (millis() - lastCheck > 20) {
    for (int i = 0; i < 2; i++) {
      int current = digitalRead(pins[i]);

      if (current != lastStates[i]) {
        String action = (current == LOW) ? "_pressed" : "_released";
        String message = String(buttonNames[i]) + action;
        notifyClients(message);

        lastStates[i] = current;
      }
    }
    lastCheck = millis();
  }

  // Ungültige Clients aus Liste entfernen
  ws.cleanupClients();
}
