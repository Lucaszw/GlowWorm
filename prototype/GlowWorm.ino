int receiverPins[4] = {A0, A1, A2, A3};
int transmitterPins[4] = {4,5,6,7};
int pushBtnPin = A4;
int LEDPin = 2;

int pushBtnState;
int receiverStates[4] = {0,0,0,0};

void setup() {
  // put your setup code here, to run once:
  pinMode(receiverPins[0], INPUT);
  pinMode(receiverPins[1], INPUT);
  pinMode(receiverPins[2], INPUT);
  pinMode(receiverPins[3], INPUT);

  pinMode(transmitterPins[0], OUTPUT);
  pinMode(transmitterPins[1], OUTPUT);
  pinMode(transmitterPins[2], OUTPUT);
  pinMode(transmitterPins[3], OUTPUT);

  pinMode(pushBtnPin, INPUT);
  pinMode(LEDPin, OUTPUT);
  
  Serial.begin(9600);
}

void turnOnAllTransmitters() {
  for (int i=0;i<4;i++) {
    digitalWrite(transmitterPins[i], HIGH);
  }
}

void turnOffAllTransmitters() {
  for (int i=0;i<4;i++) {
    digitalWrite(transmitterPins[i], LOW);
  }
}

bool checkAllReceivers() {
  for (int i=0;i<4;i++) {
    if (receiverStates[i] > 990)
      return true;
  }
  return false;
}

void loop() {
  String output = "";
  pushBtnState = analogRead(pushBtnPin);

  for (int i=0;i<4;i++) {
    receiverStates[i] = analogRead(receiverPins[i]);
    output += receiverStates[i];
    if (i<3)
      output += ",";
  }
  Serial.println(output);
  Serial.println(pushBtnState);

  bool receivedSignal = checkAllReceivers();
  
  if (receivedSignal || pushBtnState > 500) {
    delay(1000);
    digitalWrite(LEDPin, HIGH);
    turnOnAllTransmitters();
    delay(2000);
    digitalWrite(LEDPin, LOW);
    turnOffAllTransmitters();
  }
}
