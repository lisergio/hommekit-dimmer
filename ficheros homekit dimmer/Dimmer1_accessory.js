// MQTT Setup
var mqtt = require('mqtt');
console.log("Connecting to MQTT broker...");
var mqtt = require('mqtt');
var options = {
  port: 1883,
  host: '192.168.0.56',
  clientId: 'Dimmer 1'
};
var client = mqtt.connect(options);
console.log("Wifi Light Connected to MQTT broker");


var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;

// here's a fake hardware device that we'll expose to HomeKit
var DIMMER1 = {
  powerOn: false,
  brightness: 100, // percentage
  hue: 0,
  saturation: 0,

  setPowerOn: function(on) { 
    console.log("Turning Dimmer1 %s!", on ? "on" : "off");

    if (on) {
      client.publish('Dimmer1', 'on');
      DIMMER1.powerOn = on;
   	} 
    else {
	    client.publish('Dimmer1','off');
      DIMMER1.powerOn = false;   
   };

  },
  setBrightness: function(brightness) {
    console.log("Setting light brightness to %s", brightness);
    client.publish('Dimmer1/brightness',String(brightness));
    DIMMER1.brightness = brightness;
  },
//  setHue: function(hue){
//    console.log("Setting light Hue to %s", hue);
//    client.publish('Dimmer1/hue',String(hue));
//    DIMMER1.hue = hue;
//  },
//  setSaturation: function(saturation){
//    console.log("Setting light Saturation to %s", saturation);
//    client.publish('Dimmer1/saturation',String(saturation));
//    DIMMER1.saturation = saturation;
//  },
  identify: function() {
    console.log("Identify the light!");
  }
}

// Generate a consistent UUID for our light Accessory that will remain the same even when
// restarting our server. We use the `uuid.generate` helper function to create a deterministic
// UUID based on an arbitrary "namespace" and the word "DIMMER1".
var lightUUID = uuid.generate('hap-nodejs:accessories:DIMMER1');

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake light.
var light = exports.accessory = new Accessory('Dimmer 1', lightUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
light.username = "FF:FF:FF:FF:FF:1A";
light.pincode = "031-45-154";

// set some basic properties (these values are arbitrary and setting them is optional)
light
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "MakeUseOf")
  .setCharacteristic(Characteristic.Model, "Rev-1")
  .setCharacteristic(Characteristic.SerialNumber, "LOLWUT");

// listen for the "identify" event for this Accessory
light.on('identify', function(paired, callback) {
  DIMMER1.identify();
  callback(); // success
});

// Add the actual Lightbulb Service and listen for change events from iOS.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
light
  .addService(Service.Lightbulb, "Dimmer 1") // services exposed to the user should have "names" like "Fake Light" for us
  .getCharacteristic(Characteristic.On)
  .on('set', function(value, callback) {
    DIMMER1.setPowerOn(value);
    callback(); // Our fake Light is synchronous - this value has been successfully set
  });

// We want to intercept requests for our current power state so we can query the hardware itself instead of
// allowing HAP-NodeJS to return the cached Characteristic.value.
light
  .getService(Service.Lightbulb)
  .getCharacteristic(Characteristic.On)
  .on('get', function(callback) {
    
    // this event is emitted when you ask Siri directly whether your light is on or not. you might query
    // the light hardware itself to find this out, then call the callback. But if you take longer than a
    // few seconds to respond, Siri will give up.
    
    var err = null; // in case there were any problems
    
    if (DIMMER1.powerOn) {
      console.log("Are we on? Yes.");
      callback(err, true);
    }
    else {
      console.log("Are we on? No.");
      callback(err, false);
    }
  });

// also add an "optional" Characteristic for Brightness
light
  .getService(Service.Lightbulb)
  .addCharacteristic(Characteristic.Brightness)
  .on('get', function(callback) {
    callback(null, DIMMER1.brightness);
  })
  .on('set', function(value, callback) {
    DIMMER1.setBrightness(value);
    callback();
  })

//light
//  .getService(Service.Lightbulb)
//  .addCharacteristic(Characteristic.Hue)
//  .on('get',function(callback){
//   callback(null,DIMMER1.hue);
//   })
//   .on('set',function(value,callback){
//   DIMMER1.setHue(value);
//   callback();   
//   })

//light
//  .getService(Service.Lightbulb)
//  .addCharacteristic(Characteristic.Saturation)
//  .on('get',function(callback){
//   callback(null,DIMMER1.saturation);
//   })
//   .on('set',function(value,callback){
//   DIMMER1.setSaturation(value);
//   callback();   
//   })
