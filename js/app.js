// Warning if config.js has an error
if(typeof config == 'undefined'){
    alert("Warning: 'config.js' contains an error");
}

// Bootstrap Angular
(function(angular) {
    'use strict';

    angular.module('SmartMirror', ['ngAnimate']);


}(window.angular));
