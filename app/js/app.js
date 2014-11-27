'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp', [
    'myApp.config',
    'myApp.controllers',
    'myApp.decorators',
    'myApp.directives',
    'myApp.filters',
    'myApp.routes',
    'myApp.services',
    'flow'
])

.run(['simpleLogin','$rootScope', function(simpleLogin,$rootScope) {
    simpleLogin.getUser();
    $rootScope.song=function(song){
      console.log(song);
    }
    $rootScope.playsong=function(song){
      console.log(song);
    }
    $rootScope.alerts=[{"type":"info","message":"I AM Celestial"}]
}])
