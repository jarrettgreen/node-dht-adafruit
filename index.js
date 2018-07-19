require("dotenv").config();

const dht = require("./node_modules/pigpio-dht/index.js");
const axios = require("axios");

const dataPin = 4;
const dhtType = 22; //optional
const sensor = dht(dataPin, dhtType);

const AIO_KEY = process.env.AIO_KEY;
const AIO_USER = process.env.AIO_USER;

setInterval(() => {
  sensor.read();
}, 5000); // the sensor can only be red every 2 seconds

var request = axios.create({
  baseURL: `https://io.adafruit.com/api/v2/${AIO_USER}/feeds`,
  timeout: 2000,
  headers: { "X-AIO-Key": AIO_KEY, "Content-Type": "application/json" }
});

sensor.on("result", data => {
  var temp = data.temperature * 1.8 + 32; // to freedom units.
  var hum = data.humidity;
  console.log(`temp: `);
  console.log(`rhum: ${hum}%`);

  request
    .post("/zoltorb.temp/data", {
      value: temp
    })
    .then(function(response) {
      console.log(
        `Temperature AdafruitIO Log: ${temp}° - (${response.statusText})`
      );
    });

  request
    .post("/zoltorb.hum/data", {
      value: hum
    })
    .then(function(response) {
      console.log(
        `Humidity AdafruitIO Log: ${hum}% - (${response.statusText})`
      );
    });
});
