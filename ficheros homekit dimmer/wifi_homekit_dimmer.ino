#include <ESP8266WiFi.h>
#include <PubSubClient.h>

const char *ssid =	"SSID";		// SSID de nuestra red wifi
const char *pass =	"PASSWORD";	// Contrasea de nuestra red wifi
const char* host = "Dimmer1";
IPAddress server(192, 168, 0, 56); // IP de la raspberry Pi
const int led1 = 2;
const int led2 = 0;
float  brillo=0;

#define BUFFER_SIZE 100

void callback(const MQTT::Publish& pub) {

  String myMessage = String(pub.payload_string());
  Serial.print(pub.topic());
  Serial.print(" => ");
  String myTopic = String(pub.topic());

if(myTopic == host)
  {
    Serial.println(pub.payload_string());
if(pub.payload_string() == "on")
    { 
      analogWrite(led1,brillo);
     digitalWrite(led2, LOW);     
    }
else
    {
    analogWrite(led1,0);
    digitalWrite(led2, HIGH);
    }
  }
else if(myTopic == host+(String)"/brightness")
 { 
    Serial.println(pub.payload_string());
    brillo = (myMessage.toFloat())/100;
    brillo = brillo*1024;
    Serial.print (" Brillo : ");
    Serial.println(brillo);
    analogWrite(led1,brillo);
  }
}

WiFiClient wclient;
PubSubClient client(wclient, server);

void setup() 
{
pinMode(led1, OUTPUT);
pinMode(led2, OUTPUT);
Serial.begin(9600);
WiFi.mode(WIFI_STA);
delay(10);
digitalWrite(led1, LOW);
digitalWrite(led2, HIGH);
client.set_callback(callback);
}

void loop() {

  if (WiFi.status() != WL_CONNECTED) {
    Serial.print("Connecting to ");
    Serial.print(ssid);
    Serial.println("...");
    WiFi.begin(ssid, pass);

    if (WiFi.waitForConnectResult() != WL_CONNECTED)
      return;
    Serial.println("WiFi connected");
  }

  if (WiFi.status() == WL_CONNECTED) {
    if (!client.connected()) {
      if (client.connect("ESP8266: Fountain")) {
        client.publish("outTopic",(String)"hello world, I'm "+host);
        client.subscribe(host+(String)"/#");
      }
    }

    if (client.connected())
      client.loop();
  }
}


