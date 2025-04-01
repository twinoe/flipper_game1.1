#include <BleKeyboard.h>
#include <Arduino.h>

BleKeyboard bleKeyboard;

const int ledPin = 14;       // GPIO pin where the LED is connected
const int buttonPin1 = 32;
const int button2Pin = 26;     // GPIO pin where the button is connected


void setup() {
  pinMode(ledPin, OUTPUT);  // StLED pin as output
  pinMode(buttonPin1, INPUT_PULLUP);
  pinMode(button2Pin, INPUT_PULLUP), // Set button pin as input
  bleKeyboard.begin();      // Initialize the BleKeyboard object
  Serial.begin(115200);     // Start serial communication for debugging
}

void loop() {
  if (bleKeyboard.isConnected()) {
      int button1State = digitalRead(buttonPin1); // Read the state of the button
      int button2State = digitalRead(button2Pin); // Read the state of the second button

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
      delay(100); // Small delay to debounce the button
  } 
}