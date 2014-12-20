'use strict';

/* Controllers */

angular.module('myApp.controllers', ['firebase.utils', 'simpleLogin'])
  .controller('HomeCtrl', ['$scope', 'fbutil', 'user', 'FBURL', function($scope, fbutil, user, FBURL) {
    $scope.user = user;
    $scope.FBURL = FBURL;
  }])


  .controller('MissionCtrl', ['$scope', 'fbutil', function($scope, fbutil) {
  }])

  .controller('ArtistCtrl', ['$scope', 'artistPage','$routeParams', function($scope, artistPage, $routeParams) {
    artistPage.fetch($routeParams.artist)
    $scope.artist=artistPage.artist;
    $scope.predicate='-key';


  }])

  .controller('ArchiveCtrl', ['$scope','songList', function($scope,songList) {
    $scope.songs=songList;
    $scope.predicate='-songs | length'
  }])


  .controller('ArtistsCtrl', ['$scope','artistList', function($scope,artistList) {
    var arts=artistList;
    $scope.artists=arts;
    $scope.moreArtists=function(){
      console.log($scope.moreArtists);
    }
  }])

.controller('SongCtrl', ['$scope','$routeParams','fbutil', function($scope, $routeParams, fbutil) {
  $scope.song=fbutil.syncObject('songs/'+$routeParams.song);
}])
.controller('MediaCtrl', ['$scope','$rootScope','$routeParams','fbutil', function($scope,$rootScope, $routeParams, fbutil) {


}])

.controller('SongsCtrl', ['$scope','songs','$window', function($scope,songs,$window) {
  $scope.songs=songs.list;
  songs.fetch();
  $scope.predicate='-key'
  $scope.moreSongs=function(){
    var moreSongs=songs.fetch();
  }


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

  .controller('AccountCtrl', ['$scope', 'simpleLogin', 'fbutil', 'user', '$location','$rootScope',
    function($scope, simpleLogin, fbutil, user, $location,$rootScope) {
      // expose logout function to scope
      if ('me' in $scope){
        $scope.me.$bindTo($scope,'me');
        $scope.artist=$scope.me;
      }

      $scope.logout = function() {
        if ('me' in $scope){
          $scope.me.$destroy;
        }
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
          simpleLogin.changePassword(user.email, pass, newPass)
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

      };
      $scope.chooseArt = function(avatar,wallart){
        resetMessages();
        console.log($scope);
        $scope.wallerr=avatar;
        $scope.avatarerr=wallart;
      };

      function resetMessages() {
        $scope.err = null;
        $scope.msg = null;
        $scope.emailerr = null;
        $scope.emailmsg = null;
        $scope.avatarmsg = null;
        $scope.avatarerr = null;
        $scope.wallmsg = null;
        $scope.wallerr = null;
      }
    }
  ])
  .controller('TransmitCtrl', ['$timeout','$rootScope','$scope', 'simpleLogin','$firebase', 'fbutil',
  function($timeout,$rootScope,$scope, simpleLogin,$firebase, fbutil) {
    $scope.refreshYourself(function(self){

      $scope.s3OptionsUri='/config/aws.json';
      self.$loaded(function(){
        $scope.destfolder='/media/'+self.alias;
        console.log($scope.destfolder);
      });
    });

    $scope.$on('s3upload:success',function(e) {
      $scope.filename=e.targetScope['filename'];
      $timeout(function() {
        $scope.media=e.targetScope['media'];
      });
    });
      $scope.calculateKey = function() {
        var today=new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();

        if(dd<10) {
          dd='0'+dd
        }

        if(mm<10) {
          mm='0'+mm
        }
        today = mm+'/'+dd+'/'+yyyy;
        return CryptoJS.SHA1(today+$scope.me.email).toString().substring(0,11)
      }
      $scope.sendTransmission = function() {
        $scope.refreshYourself(function(self){
          var fresh_key=$scope.calculateKey($scope.transmission)
          var song={};
          song['info']=$scope.info;
          song['title']=$scope.title;
          song['timestamp']= (new Date()).toISOString();
          song['media']={}
          song['key']=fresh_key;
          song['media']['src']= $scope.media;
          self.$loaded(function(){
            song['artist']={'alias':self.alias,'key':self.key,'avatar':self.avatar};
            var rf=fbutil.ref('songs/'+song.key)
            $firebase(rf).$set(song).then(function(){
              $scope.song=song;
              console.log("Awesome");
            });
          });



        });
      };

    function checkMedia() {
      $scope.err = null;
      $scope.msg = null;
      $scope.emailerr = null;
      $scope.emailmsg = null;
    }
  }
  ])
  .controller('SketchCtrl', ['$scope', 'simpleLogin', 'fbutil',
  function($scope, simpleLogin, fbutil) {
    console.log('sketch it up!');
  }
  ])
  .controller('NavCtrl', ['$scope',
  function($scope) {
    $scope.hideNav=true;
    $scope.toggleNav=function(){
      $scope.hideNav=!$scope.hideNav;
    }

  }
  ])
