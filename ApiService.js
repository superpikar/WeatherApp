const _ = require('./Libs/lodash');
const dateFns = require('./Libs/date_fns');
const Config = require('./Config');

const API = Config.API;

module.exports = {
  /**
   * get weather forecast by coordinates
   * @param number lat 
   * @param number lng 
   * @return {
   *    coord: {lat:0, lon:0},
   *    main: { temp: 0, humidity: 0, pressure: 0, temp_min: 0, temp_max: 0 },
   *    name: 'City Name',
   * }
   */
  getCurrentWeather(lat, lng) {
    return fetch(`${API.OPENWEATHER}/weather?lat=${lat}&lon=${lng}&appid=${API.OPENWEATHER_KEY}`)
      .then((response) => {
        return response.json();
      });
  },
  /**
   * get weather forecast by coordinates
   * @param number lat 
   * @param number lng 
   * @return {
   *    listDaily: [WeatherInfo, WeatherInfo],
   *    listHourly: [WeatherInfo, WeatherInfo],
   *    city: { name: 'CityName' }
   * }
   */
  getWeatherForecast(lat, lng) {
    return fetch(`${API.OPENWEATHER}/forecast?lat=${lat}&lon=${lng}&appid=${API.OPENWEATHER_KEY}`)
      .then((response) => {
        return response.json();
      })
      .then((jsonResponse) => {

        // grouped to daily data
        const groupByDay = _.groupBy(jsonResponse.list, (val) => {
          const theDate = new Date(val.dt_txt);
          return `${theDate.getMonth()+1}/${theDate.getDate()}`;
        });
        // set daily data, get only the latest 5
        const listDaily = _.map(groupByDay, (val, key) => {
          val[0].date = dateFns.format(new Date(val[0].dt_txt), 'MM/DD'); // modify date format
          return val[0]; // return the first weather data in a day :P
        }).filter((val, key) => key < 5);

        // set hourly data, get only the latest 5
        const listHourly = jsonResponse.list.filter((val, key) => key < 5).map((val) => {
          val.date = dateFns.format(new Date(val.dt_txt), 'HH:mm'); // modify date format
          return val;
        });

        console.log(JSON.stringify(`listHourly: ${listHourly.length}`));
        console.log(JSON.stringify(`listDaily: ${listDaily.length}`));

        return Object.assign(jsonResponse, { listDaily, listHourly });
      });
  },
  getLocation(lat, lng) {
    return fetch(`${API.GOOGLEMAP}?latlng=${lat},${lng}&sensor=true`)
      .then(function(response) {
        let jsonResponse = response.json();
        if (jsonResponse.results.length > 0) {
          jsonResponse.address = jsonResponse.results[0].formatted_address;
        }
        console.log(JSON.stringify(jsonResponse.address));
        return jsonResponse;
      });
  },
}
