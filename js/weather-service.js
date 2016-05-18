(function() {
    'use strict';

    function WeatherService($http) {
        var serv = {};
        serv.forecast = null;
        var location = null;

        serv.init = function(geoposition) {
            location = geoposition;
            return $http.jsonp('https://api.forecast.io/forecast/'+config.forecast.key+'/'+
                    geoposition.coords.latitude+','+geoposition.coords.longitude+'?units=' +
                    config.forecast.units + "&lang="+ config.language.substr(0, 2) + "&callback=JSON_CALLBACK")

            .then(function(response) {
                return serv.forecast = response;
            });
        };

// Current Forecast function
// Returns the current temperature along with high and low tempratures for the current day
        serv.currentforecast = function() {
            if(serv.forecast === null) {
                return null;
            }
            serv.forecast.data.currently.day = moment.unix(serv.forecast.data.currently.time).format('ddd');
            serv.forecast.data.currently.temperature = parseFloat(serv.forecast.data.currently.temperature).toFixed(1);
            serv.forecast.data.currently.wi = "wi-forecast-io-" + serv.forecast.data.currently.icon;
            serv.forecast.data.currently.iconAnimation = serv.forecast.data.currently.icon;
            return serv.forecast.data.currently;
        }

// Returns forecast for the week
        serv.weeklyforecast = function(){
            if(serv.forecast === null){
                return null;
            }
// Loops through to get data for each day of the week
// .wi for weather icons
            for (var i = 0; i < serv.forecast.data.daily.data.length; i++) {
                serv.forecast.data.daily.data[i].day = moment.unix(serv.forecast.data.daily.data[i].time).format('ddd');
                serv.forecast.data.daily.data[i].temperatureMin = parseFloat(serv.forecast.data.daily.data[i].temperatureMin).toFixed(1);
                serv.forecast.data.daily.data[i].temperatureMax = parseFloat(serv.forecast.data.daily.data[i].temperatureMax).toFixed(1);
                serv.forecast.data.daily.data[i].wi = "wi-forecast-io-" + serv.forecast.data.daily.data[i].icon;
                serv.forecast.data.daily.data[i].counter = String.fromCharCode(97 + i);
                serv.forecast.data.daily.data[i].iconAnimation = serv.forecast.data.daily.data[i].icon;
            };
            return serv.forecast.data.daily;
        }

// Returns forecast for the hour
        serv.hourlyforecast = function() {
            if(serv.forecast === null){
                return null;
            }
            serv.forecast.data.hourly.day = moment.unix(serv.forecast.data.hourly.time).format('ddd')
            return serv.forecast.data.hourly;
        }

// Refreshes the weather based on current location
        serv.refreshWeather = function(){
            return serv.init(location);
        }
        return serv;
    }

    angular.module('SmartMirror')
    .factory('WeatherService', WeatherService);
}());
