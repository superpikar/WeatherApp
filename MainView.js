const Observable = require("FuseJS/Observable");
const GeoLocation = require("FuseJS/GeoLocation");

const weatherData = Observable();
const location = Observable();

function initializeData() {
  location.value = {
    address: '-',
    latitude: 0,
    longitude: 0,
  };

  weatherData.value = {
    main: {
      temp: 0,
      pressure: 0,
      humidity: 0,
    },
    wind: {
      speed: 0,
      deg: 0,
    }
  }
}

function getCurrentWeather(lat, lng) {
  fetch(`http://samples.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=b1b15e88fa797225412429c1c50c122a1`)
    .then(function(response) {
      return response.json();
    })
    .then(function(responseObject) {
      weatherData.value = responseObject;
    });
}

function geoCoding(lat, lng) {
  fetch(`http://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&sensor=true`)
    .then(function(response) {
      return response.json();
    })
    .then(function(responseObject) {
      const loc = Object.assign(location.value, {
        address: responseObject.results[0].formatted_address,
      });
      console.log(JSON.stringify(loc))
      location.value = loc;
    });
}

function detectCurrentLocation() {
  initializeData();
  const TIMEOUT = 5000;
  GeoLocation.getLocation(TIMEOUT).then(function(loc) {
    console.log("getLocation success " + JSON.stringify(loc));
    location.value = loc;
    geoCoding(loc.latitude, loc.longitude);
    getCurrentWeather(loc.latitude, loc.longitude);
  }).catch(function(fail) {
    console.log("getLocation fail " + fail);
  });
}

initializeData();

module.exports = {
  weatherData,
  location,
  detectCurrentLocation,
};
