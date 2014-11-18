(function() {
   'use strict';

   /* Services */

   angular.module('myApp.services', [])

      // put your services here!
      // .service('serviceName', ['dependency', function(dependency) {}]);

    .factory('messageList', ['fbutil', function(fbutil) {
      return fbutil.syncArray('messages', {limit: 10, endAt: null});
    }])
    .factory('songList', ['fbutil', function(fbutil) {
      return fbutil.syncArray('songs', {limit: 10, endAt: null});
    }])
    .factory('artistList', ['fbutil', function(fbutil) {
      return fbutil.syncArray('artists', {limit: 10, endAt: null});
    }]);

})();
