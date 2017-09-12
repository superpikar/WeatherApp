const _ = require('./Libs/lodash');
const dateFns = require('./Libs/date_fns');
const Config = require('./Config');

const API = Config.API;
const QUERYPARAMS = `appid=${API.OPENWEATHER_KEY}&units=metric`;

/**
 * 
 * @param Array array of object
 * @param number numberOfChunk 
 * @sample
 * input : 
 *    array = [1,2,3,4,5,6]
 *    numberOfChunk = 3
 * output : 
 *    [[1,2,3], [4,5,6]]
 */
function splitArrayPerChunk(array, numberOfChunk) {
  let result = [];
  array.forEach((val, key) => {
    const index = Math.floor(key / numberOfChunk);
    if (!result[index]) {
      result[index] = [];
    }
    result[index].push(val);
  });
  return Object.values(result);
}

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
    return fetch(`${API.OPENWEATHER}/weather?${QUERYPARAMS}&lat=${lat}&lon=${lng}`)
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
    const LASTHOURLY = 10;
    return fetch(`${API.OPENWEATHER}/forecast?${QUERYPARAMS}&lat=${lat}&lon=${lng}`)
      .then((response) => {
        return response.json();
      })
      .then((jsonResponse) => {

        // set hourly data, get only the latest 5
        let listHourly = _.cloneDeep(jsonResponse.list).filter((val, key) => key < LASTHOURLY).map((val) => {
          val.date = dateFns.format(new Date(val.dt_txt), 'MM/DD'); // modify date format
          val.time = dateFns.format(new Date(val.dt_txt), 'HH:mm'); // modify date format
          return val;
        });

        // grouped to daily data
        const groupByDay = _.groupBy(_.cloneDeep(jsonResponse.list), (val) => {
          const theDate = new Date(val.dt_txt);
          return `${theDate.getMonth()+1}/${theDate.getDate()}`;
        });
        // set daily data, get only the latest 5
        let listDaily = _.map(groupByDay, (val, key) => {
          val[0].date = dateFns.format(new Date(val[0].dt_txt), 'MM/DD'); // modify date format
          val[0].time = '';
          return val[0]; // return the first weather data in a day :P
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
