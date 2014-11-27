'use strict';

/* Filters */

angular.module('myApp.filters', [])
   .filter('interpolate', ['version', function(version) {
      return function(text) {
         return String(text).replace(/\%VERSION\%/mg, version);
      }
   }])
   .filter('trustUrl', function ($sce) {
     return function(url) {
       return $sce.trustAsResourceUrl(url);
     };
   })
   .filter('reverse', function() {
      return function(items) {
         return items.slice().reverse();
      };
   });
