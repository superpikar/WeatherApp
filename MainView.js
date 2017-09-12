const dateFns = require('./Libs/date_fns');
const Observable = require('FuseJS/Observable');
const GeoLocation = require('FuseJS/GeoLocation');
const ApiService = require('./ApiService');
const CountryService = require('./CountryService');

const weatherData = Observable();
const forecastDaily = Observable();
const forecastHourly = Observable();
const location = Observable();
const errorMessage = Observable();
const isLoading = Observable(false);
const currentDate = Observable('');

function initializeData() {
  currentDate.value = dateFns.format(new Date(), 'YYYY/MM/DD')
  location.value = {
    city: '-',
    country: '-',
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
  isLoading.value = false;
  errorMessage.clear();
}

function getCurrentWeather(lat, lng) {
  ApiService.getCurrentWeather(lat, lng)
    .then((response) => {
      weatherData.value = response;
      location.value = {
        city: response.name,
        country: CountryService.getCountryName(response.sys.country),
        latitude: lat,
        longitude: lng
      };
      isLoading.value = false;
    })
    .catch((error) => {
      errorMessage.add(`Can't get weather data. No internet connection.`);
      isLoading.value = false;
    });
}

function getWeatherForecast(lat, lng) {
  isLoading.value = true;
  ApiService.getWeatherForecast(lat, lng)
    .then((response) => {
      forecastDaily.replaceAll(response.listDaily);
      forecastHourly.replaceAll(response.listHourly);
      console.log("[getWeatherForecast] - success " + JSON.stringify(response.listDaily.length));
    })
    .catch(function(fail) {
      console.log("[getWeatherForecast] - fail " + fail);
      errorMessage.add(`Can't get weather forecast.`);
      isLoading.value = false;
    });;
}

// function geoCoding(lat, lng) {
//   ApiService.getLocation(lat, lng).then(function(response) {
//       location.value = response;
//       isLoading.value = false;
//     })
//     .catch((error) => {
//       isLoading.value = false;
//       errorMessage.add(`Can't locate address. No internet connection.`);
//     });
// }

function detectCurrentLocation() {
  initializeData();
  isLoading.value = true;
  const TIMEOUT = 4000;
  GeoLocation.getLocation(TIMEOUT)
    .then(function(loc) {
      console.log("[getLocation] - success " + JSON.stringify(loc));
      // geoCoding(loc.latitude, loc.longitude);
      getCurrentWeather(loc.latitude, loc.longitude);
      getWeatherForecast(loc.latitude, loc.longitude);
    })
    .catch(function(fail) {
      console.log("[getLocation] - fail " + fail);
      isLoading.value = false;
      errorMessage.add(`Can't detect location. Please turn on your GPS.`);
    });
}

initializeData();

module.exports = {
  currentDate,
  weatherData,
  forecastDaily,
  forecastHourly,
  isLoading,
  errorMessage,
  location,
  detectCurrentLocation,
};
