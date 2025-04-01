#include <BleKeyboard.h>
#include <Arduino.h>

BleKeyboard bleKeyboard;

const int ledPin = 14;       // GPIO-Pin für die LED
const int buttonPin1 = 32;   // GPIO-Pin für den ersten Button
const int button2Pin = 26;   // GPIO-Pin für den zweiten Button
const int button3Pin = 25;   // GPIO-Pin für den dritten Button
void setup() {
  pinMode(ledPin, OUTPUT);  // LED-Pin als Ausgang definieren
  pinMode(buttonPin1, INPUT_PULLUP); // Button-Pin als Eingang mit Pull-Up-Widerstand definieren
  pinMode(button2Pin, INPUT_PULLUP); // Zweiten Button-Pin als Eingang mit Pull-Up-Widerstand definieren
  pinMode(button3Pin, INPUT_PULLUP); // Dritten Button-Pin als Eingang mit Pull-Up-Widerstand definieren
  bleKeyboard.begin();      // BleKeyboard-Objekt initialisieren
  Serial.begin(115200);     // Serielle Kommunikation für Debugging starten
}

void loop() {
  if (bleKeyboard.isConnected()) {
    int button1State = digitalRead(buttonPin1); // Zustand des ersten Buttons lesen
    int button2State = digitalRead(button2Pin); // Zustand des zweiten Buttons lesen
    int button3State = digitalRead(button3Pin); // Zustand des dritten Buttons lesen

    if (button3State == LOW) { // Wenn beide Buttons losgelassen werden
      Serial.println("both buttons bugi bugi");
      digitalWrite(ledPin, HIGH); // LED einschalten
      bleKeyboard.press(KEY_NUM_ENTER); // Simuliere das Drücken der linken STRG-Taste
      bleKeyboard.print(" "); // Leertaste senden
      delay(100); // 100 Millisekunden warten
      digitalWrite(ledPin, LOW); // LED ausschalten
    }

    if (button1State == LOW) { // If the button is pressed
      Serial.println("left button pressed ");
      bleKeyboard.press(KEY_LEFT_ARROW); // Simulate pressing the up arrow key
      digitalWrite(ledPin, HIGH); // Turn the LED on
      delay(100); // Wait for 100 milliseconds
      bleKeyboard.release(KEY_LEFT_ARROW); // Release all keys
      digitalWrite(ledPin, LOW); // Turn the LED off
      delay(100); // Small delay to debounce the button
  }

  if (button2State == LOW) { // If the button is pressed
    Serial.println("right button pressed ");
    bleKeyboard.press(KEY_RIGHT_ARROW); // Simulate pressing the down arrow key
    digitalWrite(ledPin, HIGH); // Turn the LED off
    delay(100); // Wait for 100 milliseconds
    bleKeyboard.release(KEY_RIGHT_ARROW); // Release all keys
    digitalWrite(ledPin, LOW); // Turn the LED off
    delay(100); // Small delay to debounce the button
  }



    delay(100); // Kurze Verzögerung zum Entprellen des Buttons
  } 
}