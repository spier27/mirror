(function(angular) {
    'use strict';

//Controller: most important part
    function MirrorCtrl(
            AnnyangService,
            GeolocationService,
            WeatherService,
            MapService,
            CalendarService,
            $rootScope, $scope, $timeout, $interval) {
        var _this = this;
        var DEFAULT_COMMAND_TEXT = 'Ask \"What can I say?\" to learn more'

        $scope.listening = false;
        $scope.debug = false;
        $scope.focus = "default";
        $scope.user = {};
        $scope.interimResult = DEFAULT_COMMAND_TEXT;

//Update the time
        function updateTime(){
            $scope.date = new moment();
        }

// reset voice command text (or set to default)
        var resetCommand = function(){
          $scope.interimResult = DEFAULT_COMMAND_TEXT;
        }

//Uses GeolocationService to determine position, and initializes map based on coordinates
        _this.init = function() {
            var tick = $interval(updateTime, 1000);
            updateTime();
            GeolocationService.getLocation({enableHighAccuracy: true}).then(function(geoposition){
                $scope.map = MapService.generateMap(geoposition.coords.latitude+','+geoposition.coords.longitude);
            });
            resetCommand();

            var refreshMirrorData = function() {
                //Get our location and then get the weather for our location
                GeolocationService.getLocation({enableHighAccuracy: true}).then(function(geoposition){
                    WeatherService.init(geoposition).then(function(){
                        $scope.currentForcast = WeatherService.currentForcast();
                        $scope.weeklyForcast = WeatherService.weeklyForcast();
                        $scope.hourlyForcast = WeatherService.hourlyForcast();
                      });
                });
                CalendarService.getCalendarEvents().then(function(response) {
                    $scope.calendar = CalendarService.getFutureEvents();
                });

            };

            refreshMirrorData();
            $interval(refreshMirrorData, 1500000);

            var defaultView = function() {
                $scope.focus = "default";
            }

// List available voice commands
            AnnyangService.addCommand('What can I say', function() {
                $scope.focus = "commands";
            });

// Go back to default view
            AnnyangService.addCommand('Go home', defaultView);

// Show map (default = Greencastle)
            AnnyangService.addCommand('Show map', function() {
                GeolocationService.getLocation({enableHighAccuracy: true}).then(function(geoposition){
                    $scope.map = MapService.generateMap(geoposition.coords.latitude+','+geoposition.coords.longitude);
                    $scope.focus = "map";
                });
            });

// Show a map of a specific city or location
            AnnyangService.addCommand('Show (me a) map of *location', function(location) {
                $scope.map = MapService.generateMap(location);
                $scope.focus = "map";
            });

// zoom in on the map
            AnnyangService.addCommand('(map) zoom in', function() {
                $scope.map = MapService.zoomIn();
            });

// zoom out on the map
            AnnyangService.addCommand('(map) zoom out', function() {
                $scope.map = MapService.zoomOut();
            });

// tracks when Annyang is listening and when commands begin/end
// handles when to time out, and displaying interimResult (text as it is recognized)
            var resetCommandTimeout;
            AnnyangService.start(function(listening){
                $scope.listening = listening;
            },
            function(interimResult){
                $scope.interimResult = interimResult;
                $timeout.cancel(resetCommandTimeout);
            },
            function(result){
                if(typeof result != 'undefined'){
                    $scope.interimResult = result[0];
                    resetCommandTimeout = $timeout(resetCommand, 5000);
                }
            });
        };

        _this.init();
    }

    angular.module('SmartMirror')
        .controller('MirrorCtrl', MirrorCtrl);

}(window.angular));
