angular.module('changeStatement', ['firebase.utils'])
  .factory('changeStatement', ['fbutil', '$q', function(fbutil, $q) {
    return function(newStatement, simpleLogin) {
      simpleLogin.getUser().set('statement',newStatement);
    };
}]);
