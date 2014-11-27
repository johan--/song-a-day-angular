'use strict';

/* Controllers */

angular.module('myApp.controllers', ['firebase.utils', 'simpleLogin'])
  .controller('HomeCtrl', ['$scope', 'fbutil', 'user', 'FBURL', function($scope, fbutil, user, FBURL) {
    $scope.syncedValue = fbutil.syncObject('syncedValue');
    $scope.user = user;
    $scope.FBURL = FBURL;
  }])


  .controller('MissionCtrl', ['$scope', 'fbutil', function($scope, fbutil) {
    $scope.artist=fbutil.syncObject('mission');
  }])

  .controller('ArtistCtrl', ['$scope', 'fbutil','$routeParams', function($scope, fbutil, $routeParams) {
    $scope.artist=fbutil.syncObject('artists/'+$routeParams.artist);
  }])

  .controller('ArchiveCtrl', ['$scope','songList', function($scope,songList) {
    $scope.songs=songList;
  }])


  .controller('ArtistsCtrl', ['$scope','artistList', function($scope,artistList) {
    $scope.artists=artistList;
    $scope.predicate='-songs'
  }])

.controller('SongCtrl', ['$scope','$routeParams','fbutil', function($scope, $routeParams, fbutil) {
  $scope.song=fbutil.syncObject('songs/'+$routeParams.song);
}])

.controller('SongsCtrl', ['$scope','songList', function($scope,songList) {
  $scope.songs=songList;
}])


  .controller('ChatCtrl', ['$scope', 'messageList', function($scope, messageList) {
    $scope.messages = messageList;
    $scope.addMessage = function(newMessage) {
      if( newMessage ) {
        $scope.messages.$add({text: newMessage});
      }
    };
  }])

  .controller('LoginCtrl', ['$scope', 'simpleLogin', '$location', function($scope, simpleLogin, $location) {
    $scope.email = null;
    $scope.pass = null;
    $scope.confirm = null;
    $scope.createMode = false;

    $scope.login = function(email, pass) {
      $scope.err = null;
      simpleLogin.login(email, pass)
        .then(function(/* user */) {
          $location.path('/artists/me');
        }, function(err) {
          $scope.err = errMessage(err);
        });
    };

    $scope.createAccount = function() {
      $scope.err = null;
      if( assertValidAccountProps() ) {
        simpleLogin.createAccount($scope.email, $scope.pass)
          .then(function(/* user */) {
            $location.path('/artists/me');
          }, function(err) {
            $scope.err = errMessage(err);
          });
      }
    };

    function assertValidAccountProps() {
      if( !$scope.email ) {
        $scope.err = 'Please enter an email address';
      }
      else if( !$scope.pass || !$scope.confirm ) {
        $scope.err = 'Please enter a password';
      }
      else if( $scope.createMode && $scope.pass !== $scope.confirm ) {
        $scope.err = 'Passwords do not match';
      }
      return !$scope.err;
    }

    function errMessage(err) {
      return angular.isObject(err) && err.code? err.code : err + '';
    }
  }])

  .controller('AccountCtrl', ['$scope', 'simpleLogin', 'fbutil', 'user', '$location',
    function($scope, simpleLogin, fbutil, user, $location) {
      // create a 3-way binding with the user profile object in Firebase
      var profile = fbutil.syncObject(['users', user.uid]);
      profile.$bindTo($scope, 'profile');

      // expose logout function to scope
      $scope.logout = function() {
        profile.$destroy();
        simpleLogin.logout();
        $location.path('/login');
      };

      $scope.changePassword = function(pass, confirm, newPass) {
        resetMessages();
        if( !pass || !confirm || !newPass ) {
          $scope.err = 'Please fill in all password fields';
        }
        else if( newPass !== confirm ) {
          $scope.err = 'New pass and confirm do not match';
        }
        else {
          simpleLogin.changePassword(profile.email, pass, newPass)
            .then(function() {
              $scope.msg = 'Password changed';
            }, function(err) {
              $scope.err = err;
            })
        }
      };

      $scope.clear = resetMessages;

      $scope.changeStatement = function(newStatement) {
        resetMessages();
        simpleLogin.changeStatement(newStatement);
      };

      function resetMessages() {
        $scope.err = null;
        $scope.msg = null;
        $scope.emailerr = null;
        $scope.emailmsg = null;
      }
    }
  ])
  .controller('TransmitCtrl', ['$scope', 'simpleLogin', 'fbutil',
  function($scope, simpleLogin, fbutil) {
    $scope.upload = function(newStatement) {
      console.log($scope.media);
    };

    function checkMedia() {
      $scope.err = null;
      $scope.msg = null;
      $scope.emailerr = null;
      $scope.emailmsg = null;
    }
  }
  ])
