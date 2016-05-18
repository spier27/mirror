(function(angular) {
    'use strict';

//Controller: most important .js file
    function MirrorCtrl(
            AnnyangService,
            GeolocationService,
            WeatherService,
            CalendarService,
            $rootScope, $scope, $timeout, $interval) {
        var _this = this;

        $scope.focus = "default";
        $scope.user = {};

//Update the time, store as moment.js "date" variable
        function updateTime(){
            $scope.date = new moment();
        }

        _this.init = function() {
            var tick = $interval(updateTime, 1000);
            updateTime();

//Get current location, then get the weather for current location
            var refreshMirrorData = function() {
                GeolocationService.getLocation({enableHighAccuracy: true}).then(function(geoposition) {
                    WeatherService.init(geoposition).then(function(){
                        $scope.currentforecast = WeatherService.currentforecast();
                        $scope.weeklyforecast = WeatherService.weeklyforecast();
                        $scope.hourlyforecast = WeatherService.hourlyforecast();
                      });
                });
//Pull events from calendar - shared iCal file - !!! Keep populated with upcoming events
                CalendarService.getCalendarEvents().then(function(response) {
                    $scope.calendar = CalendarService.getFutureEvents();
                });
            };

            refreshMirrorData();
            $interval(refreshMirrorData, 60000);  // <-- Refresh calendar and weather data every minute

            var defaultView = function() {
                $scope.focus = "default";
            }
        };
        _this.init();
    }

    angular.module('SmartMirror')
        .controller('MirrorCtrl', MirrorCtrl);
}(window.angular));
