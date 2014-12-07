'use strict';

/* Filters */

angular.module('myApp.filters', [])
   .filter('interpolate', ['version', function(version) {
      return function(text) {
         return String(text).replace(/\%VERSION\%/mg, version);
      }
   }])
   .filter('default', function() {
     return function(input, value) {
       if (input !== null && input !== undefined && (input !== '' || angular.isNumber(input))) {
         return input;
       }
       return value || '';
     };
   })
   .filter('trustUrl', function ($sce) {
     return function(url) {
       return $sce.trustAsResourceUrl(url);
     };
   })
   .filter('reverse', function() {
      return function(items) {
         return items.slice().reverse();
      };
   })
   .filter('length', function () {
     return function (item) {
       return Object.keys(item||{}).length;
     };
   });
