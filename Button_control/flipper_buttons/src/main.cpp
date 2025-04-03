#include <BleKeyboard.h>
#include <Arduino.h>

BleKeyboard bleKeyboard;

const int ledPin = 14;       // GPIO-Pin für die LED
const int flipperLeftPin = 32;   // GPIO-Pin für den ersten Button
const int flipperRightPin = 26;   // GPIO-Pin für den zweiten Button
const int SpringPin = 25;   // GPIO-Pin für den dritten Button

void setup() {
    pinMode(ledPin, OUTPUT);  // LED-Pin als Ausgang definieren
    pinMode(flipperLeftPin, INPUT_PULLUP); // Button-Pin als Eingang mit Pull-Up-Widerstand definieren
    pinMode(flipperRightPin, INPUT_PULLUP); // Zweiten Button-Pin als Eingang mit Pull-Up-Widerstand definieren
    pinMode(SpringPin, INPUT_PULLUP); // Dritten Button-Pin als Eingang mit Pull-Up-Widerstand definieren
    bleKeyboard.begin();      // BleKeyboard-Objekt initialisieren
    Serial.begin(115200);     // Serielle Kommunikation für Debugging starten
}

int flipperLeftState = HIGH; // Aktueller Zustand des ersten Buttons
int flipperRightState = HIGH; // Aktueller Zustand des zweiten Buttons
int SpringState = HIGH; // Aktueller Zustand des dritten Buttons

void loop() {
    if (bleKeyboard.isConnected()) {
        int flipperLeft = digitalRead(flipperLeftPin); // Zustand des ersten Buttons lesen
        int flipperRight = digitalRead(flipperRightPin); // Zustand des zweiten Buttons lesen
        int Spring = digitalRead(SpringPin); // Zustand des dritten Buttons lesen

        if (Spring == LOW && SpringState == HIGH) { // drückt die leertaste wenn es gedrückt wurde
            Serial.println("both buttons pressed bugi bugi");
            digitalWrite(ledPin, HIGH); // LED einschalten
            bleKeyboard.press(0x20); // Leertaste senden
        }

        if (Spring == HIGH && SpringState == LOW) { // Löst die leertastet wenn es gedrückt wurde
            Serial.println("both buttons release bugi bugi");
            digitalWrite(ledPin, HIGH); // LED einschalten
            bleKeyboard.release(0x20); // Leertaste senden
        }

        SpringState = Spring; // Aktuellen Zustand des dritten Buttons speichern

        if (flipperLeft == LOW && flipperLeftState == HIGH) { // If the button is pressed
            Serial.println("left button pressed ");
            bleKeyboard.press(KEY_LEFT_ARROW); // Simulate pressing the up arrow key
            digitalWrite(ledPin, HIGH); // Turn the LED on
        }

        if (flipperLeft == HIGH && flipperLeftState == LOW) { // If the button is released
            bleKeyboard.release(KEY_LEFT_ARROW); // Release all keys
            digitalWrite(ledPin, LOW); // Turn the LED off
            delay(100); // Small delay to debounce the button
        }
        flipperLeftState = flipperLeft; // Aktuellen Zustand des ersten Buttons speichern

        if (flipperRight == LOW && flipperRightState == HIGH) { // If the button is pressed
            Serial.println("right button pressed ");
            bleKeyboard.press(KEY_RIGHT_ARROW); // Simulate pressing the right arrow key
            digitalWrite(ledPin, HIGH); // Turn the LED on
        }

        if (flipperRight == HIGH && flipperRightState == LOW) { // If the button is released
            bleKeyboard.release(KEY_RIGHT_ARROW); // Release all keys
            digitalWrite(ledPin, LOW); // Turn the LED off
            delay(100); // Small delay to debounce the button
        }
        flipperRightState = flipperRight; // Aktuellen Zustand des zweiten Buttons speichern

        delay(100); // Kurze Verzögerung zum Entprellen des Buttons
    }
}