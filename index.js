var Service, Characteristic;
var net = require('net');

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-vsx", "VSX", VSX);
}

function VSX(log, config) {
  this.log = log;
  this.name = config.name;
  this.speakerName = config.speaker_name;
  this.HOST = config.ip;
  this.PORT = config.port;

  this.powerService;
  this.speakerService;
  this.infoService;

  this.log('Starting VSX Accessory');
}

VSX.prototype.getServices = function() {
  var availableServices = [];

  this.powerService = new Service.Switch(this.name);
  availableServices.push(this.powerService);

  this.powerService.getCharacteristic(Characteristic.On)
    .on("set", this.setOn.bind(this))
    .on("get", this.getOn.bind(this));

  this.speakerService = new Service.Speaker(this.speakerName);
  availableServices.push(this.speakerService);

  this.speakerService.getCharacteristic(Characteristic.Mute)
    .on("set", this.setMuted.bind(this))
    .on("get", this.getMuted.bind(this));
  this.speakerService.addCharacteristic(new Characteristic.Volume())
    .on("set", this.setVolume.bind(this))
    .on("get", this.getVolume.bind(this));

  this.infoService = new Service.AccessoryInformation();
  availableServices.push(this.infoService);

  this.infoService
    .setCharacteristic(Characteristic.Manufacturer, "Pioneer")
    .setCharacteristic(Characteristic.Model, "VSX-921")
    .setCharacteristic(Characteristic.SerialNumber, "123-456-789");

  return availableServices;
}

VSX.prototype.getOn = function(callback) {

  var client = new net.Socket();
  client.connect(this.PORT, this.HOST, function() {

    console.log('CONNECTED TO: ' + this.HOST + ':' + this.PORT);
    client.write('?P\r\n');

  });

  client.on('data', function(data) {

    console.log('DATA: ' + data);
    var str = data.toString();

    if (str.includes("PWR1")) {
      console.log("OFF");
      var on = false;
      client.destroy();
      callback(null,on);

    } else if (str.includes("PWR0")) {
      console.log("ON");
      var on = true;
      client.destroy();
      callback(null,on);

    } else {
      console.log("waiting");
    }

  });

  client.on('close', function() {
    console.log('Connection closed');
  });

  client.on('error', function(ex) {
    console.log("handled error");
    console.log(ex);
    callback(ex);
  });

}

VSX.prototype.setOn = function(on, callback) {

  if(on){

    var client = new net.Socket();
    client.connect(this.PORT, this.HOST, function() {
      console.log('CONNECTED TO: ' + this.HOST + ':' + this.PORT);
      // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client
      client.write('PO\r\n');
      client.destroy();
    });

    //Add a 'close' event handler for the client sock
    client.on('close', function() {
      console.log('Connection closed');
    });

    client.on('error', function(ex) {
      console.log("handled error");
      console.log(ex);

    });

  } else {

    var client = new net.Socket();
    client.connect(this.PORT, this.HOST, function() {
      console.log('CONNECTED TO: ' + this.HOST + ':' + this.PORT);
      // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client
      client.write('PF\r\n');
      client.destroy();
    });

    //Add a 'close' event handler for the client sock
    client.on('close', function() {
      console.log('Connection closed');
    });

    client.on('error', function(ex) {
      console.log("handled error");
      console.log(ex);
    });

  }
  callback();

}

VSX.prototype.getMuted = function(callback) {

  var client = new net.Socket();
  client.connect(this.PORT, this.HOST, function() {

    console.log('CONNECTED TO: ' + this.HOST + ':' + this.PORT);
    client.write('?M\r\n');

  });

  client.on('data', function(data) {

    console.log('DATA: ' + data);
    var str = data.toString();

    if (str.includes("MUT1")) {
      console.log("NOT MUTED");
      var muted = false;
      client.destroy();
      callback(null,muted);

    } else if (str.includes("MUT0")) {
      console.log("MUTED");
      var muted = true;
      client.destroy();
      callback(null,muted);

    } else {
      console.log("waiting");
    }

  });

  client.on('close', function() {
    console.log('Connection closed');
  });

  client.on('error', function(ex) {
    console.log("handled error");
    console.log(ex);
    callback(ex);
  });

}

VSX.prototype.setMuted = function(muted, callback) {

  if (muted) {
    var client = new net.Socket();
    client.connect(this.PORT, this.HOST, function() {
      console.log('CONNECTED TO: ' + this.HOST + ':' + this.PORT);
      // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client
      client.write('MO\r\n'); // toggle mute state
      client.destroy();
    });

    //Add a 'close' event handler for the client sock
    client.on('close', function() {
      console.log('Connection closed');
    });

    client.on('error', function(ex) {
      console.log("handled error");
      console.log(ex);
    });
  } else {
    var client = new net.Socket();
    client.connect(this.PORT, this.HOST, function() {
      console.log('CONNECTED TO: ' + this.HOST + ':' + this.PORT);
      // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client
      client.write('MF\r\n'); // toggle mute state
      client.destroy();
    });

    //Add a 'close' event handler for the client sock
    client.on('close', function() {
      console.log('Connection closed');
    });

    client.on('error', function(ex) {
      console.log("handled error");
      console.log(ex);
    });
  }
  callback();

}

VSX.prototype.getVolume = function(callback) {

  var client = new net.Socket();
  client.connect(this.PORT, this.HOST, function() {

    console.log('CONNECTED TO: ' + this.HOST + ':' + this.PORT);
    client.write('?V\r\n');

  });

  client.on('data', function(data) {

    console.log('DATA: ' + data);
    var str = data.toString();

    if (str.includes("VOL")) {
      var volume = str.substring(3,6);
      console.log("VOLUME: " + volume);
      client.destroy();
      callback(null,volume);

    } else {
      console.log("waiting");
    }

  });

  client.on('close', function() {
    console.log('Connection closed');
  });

  client.on('error', function(ex) {
    console.log("handled error");
    console.log(ex);
    callback(ex);
  });

}

VSX.prototype.setVolume = function(volume, callback) {

  // VOL000 = -80.5 dB, VOL100 = -30.5 dB, VOL185 = +12 dB

  // volume has to be padded with 0
  if (volume < 10) {
    volume = '00' + volume;
  } else if (volume < 100) {
    volume = '0' + volume;
  }

  var client = new net.Socket();
  client.connect(this.PORT, this.HOST, function() {
    console.log('CONNECTED TO: ' + this.HOST + ':' + this.PORT);
    // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client
    client.write(volume + 'VL\r\n'); // 050VL
    client.destroy();
  });

  //Add a 'close' event handler for the client sock
  client.on('close', function() {
    console.log('Connection closed');
  });

  client.on('error', function(ex) {
    console.log("handled error");
    console.log(ex);
  });

  callback();

}

