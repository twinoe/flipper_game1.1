#include <BleKeyboard.h>
#include <Arduino.h>

BleKeyboard bleKeyboard;

const int flipperLeftPin = 32;      // GPIO-Pin für den ersten Button
const int flipperRightPin = 26;     // GPIO-Pin für den zweiten Button
const int SpringPin = 25;           // GPIO-Pin für den dritten Button

void setup() {
    pinMode(flipperLeftPin, INPUT_PULLUP);  // Button-Pin als Eingang mit Pull-Up-Widerstand definieren             ! Wichtig Low = gedrückt High = nicht gedrückt
    pinMode(flipperRightPin, INPUT_PULLUP); // Zweiten Button-Pin als Eingang mit Pull-Up-Widerstand definieren
    pinMode(SpringPin, INPUT_PULLUP);       // Dritten Button-Pin als Eingang mit Pull-Up-Widerstand definieren
    bleKeyboard.begin();                    // BleKeyboard-Objekt initialisieren
    Serial.begin(115200);                   // Serielle Kommunikation für Debugging starten
}

int flipperLeftState = HIGH;                    // Aktueller Zustand des ersten Buttons nicht gedrückt = 0
int flipperRightState = HIGH;                   // Aktueller Zustand des zweiten Buttons nicht gedrückt = 0
int SpringState = HIGH;                         // Aktueller Zustand des dritten Buttons nicht gedrückt = 0

void loop() {
    if (bleKeyboard.isConnected()) {
        int flipperLeft = digitalRead(flipperLeftPin);           // Zustand des linken Buttons lesen
        int flipperRight = digitalRead(flipperRightPin);         // Zustand des rechten Buttons lesen
        int Spring = digitalRead(SpringPin);                     // Zustand des feder Buttons lesen

        if (Spring == LOW && SpringState == HIGH) {              // drückt die leertaste wenn es zuvor nciht gedrückt wurde.
            Serial.println(" spring button pressed ");
            bleKeyboard.press(0x20);                             // Leertaste senden
        }

        if (Spring == HIGH && SpringState == LOW) {              // LÖST die leertaste wenn es zuvor gedrückt wurde.
            Serial.println("both buttons release bugi bugi");
            bleKeyboard.release(0x20);                           // Leertaste senden 0X20 ist die Leertaste
        }

        SpringState = Spring;                                    // Aktuellen Zustand des feder Buttons speichern

        if (flipperLeft == LOW && flipperLeftState == HIGH) {    // drückt die linke Pfeil Taste wenn es zuvor nicht gedrückt wurde.
            Serial.println("left button pressed ");
            bleKeyboard.press(KEY_LEFT_ARROW);                   // simuliert das drücken der linken pfeil Taste
        }

        if (flipperLeft == HIGH && flipperLeftState == LOW) {    // LÖST die leertaste wenn es zuvor gedrückt wurde.
            bleKeyboard.release(KEY_LEFT_ARROW);                 // simuliert das lösen der linken pfeil Taste
            Serial.println("left button released ");
        }
        flipperLeftState = flipperLeft;                          // Aktuellen Zustand des ersten Buttons speichern

        if (flipperRight == LOW && flipperRightState == HIGH) {  // drückt die rechte Pfeil Taste wenn es zuvor gedrückt wurde.
            Serial.println("right button pressed ");
            bleKeyboard.press(KEY_RIGHT_ARROW);                  // simuliert das drücken der rechten Pfeil Taste
          }

        if (flipperRight == HIGH && flipperRightState == LOW) {   // LÖST die rechte Pfeil Taste wenn es zuvor gedrückt wurde.
            Serial.println("right button released ");
            bleKeyboard.release(KEY_RIGHT_ARROW);                 // simuliert das lösen der linken pfeil Taste
            delay(100);
        }

        flipperRightState = flipperRight;                           // Aktuellen Zustand des rechten Buttons speichern

        delay(100);                                                 // Kurze Verzögerung zum Entprellen des Buttons
    }
}