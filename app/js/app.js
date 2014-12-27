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
    'mediaPlayer',
    'ngSanitize',
    'ngS3upload',
    'angularMoment'
])

.run(['$location','$document','simpleLogin','$firebase','fbutil','$rootScope','$timeout', function($location,$document,simpleLogin,$firebase,fbutil,$rootScope,$timeout) {

  $rootScope.refreshYourself=function(callback){
    simpleLogin.getUser().then(function(user){
        if(user){
          var current_artist_key=CryptoJS.SHA1(user.google.email).toString().substring(0,11);
          $rootScope.me = fbutil.syncObject('artists/'+current_artist_key);
          if  (!$rootScope.me['key']){
            $rootScope.me['key']=current_artist_key;
          }
          if  (!$rootScope.me['avatar']){
            if ('cachedUserProfile' in user){
              if ('picture' in user.cachedUserProfile){
                $rootScope.me['avatar']=user.cachedUserProfile.picture;
              }
            }
          }
          if  (!$rootScope.me['songs']){
            $rootScope.me['songs']=[];
          }
          if (callback){
            $rootScope.me.$loaded(function(){callback($rootScope.me);});
          }

        }
      });
    }

    $rootScope.refreshYourself(function(){
        $rootScope.alerts = fbutil.syncObject('alerts/'+$rootScope.me.key);
    });
    $rootScope.queue=[];
    $rootScope.hideNav=true;
    $rootScope.toggleNav=function(){
      $rootScope.hideNav=!$rootScope.hideNav;
    }
    $rootScope.beginComment=function(song){
      song.transmittingComment=true;
    }
    $rootScope.transmitComment=function(song){
      song.freshComment.timestamp=(new Date()).toISOString()
      var comments = fbutil.syncArray(['songs', song.key+'','/comments']);
      comments.$loaded(function(){

        song.freshComment.author={}
        song.freshComment.author={'alias':$rootScope.me.alias,'key':$rootScope.me.key}
        comments.$add(song.freshComment);
        song.freshComment={}
        song.transmittingComment=false;
      })

    }
    $rootScope.nowPlaying=function(){
      return $rootScope.queue[$rootScope.player.currentTrack];
    }
    $rootScope.playVideo=function(song,$event){

      var video=angular.element(document.querySelector('#movie'+song.key))[0]
      song.playingVideo=true;
      if(!video.paused){
        video.pause();
      }else{
        video.play();
      }
      song.pause=video.paused;
      video.onended = function(e) {
        $rootScope.play();
        song.playingVideo=false;
        $rootScope.$apply()
      };
      $rootScope.pause();
    }
    $rootScope.playsong=function(song){
      var next=song.media;
      next.title=song.title;
      next.artist=song.artist;
      if($rootScope.queue.indexOf(next) == -1){
        if(!$rootScope.player.playing){
          $rootScope.queue.push(next);
          $rootScope.player.currentTrack=$rootScope.queue.length;
          console.log($rootScope.player.currentTrack);
          $rootScope.player.pause();
        }else{
          $rootScope.queue.push(next);
        }
        $timeout(function() {
          $rootScope.play();
        }, 100);
      }else{
        $rootScope.skip($rootScope.queue.indexOf(next));
      }

    }
    $rootScope.showArtist = function ( key ) {
      $location.path( 'artist/'+key );
    };
    $rootScope.play=function(){
        $rootScope.player.play();
      }
    $rootScope.skip=function(index){
      $rootScope.player.playPause(index);
    }
    $rootScope.pause=function(){
      $rootScope.player.pause();
    }

    $rootScope.next=function(){
      $rootScope.player.next();
    }

    $rootScope.removeTrack=function(index){
      $rootScope.queue.splice(index,1);
      if(index+1<$rootScope.player.currentTrack){
        $rootScope.player.currentTrack=index
        return;
      }else if (index+1==$rootScope.player.currentTrack){
        $rootScope.player.currentTrack=index;
        $timeout(function() {
          $rootScope.play();
        }, 100);
      }else{

      }

    }
    $rootScope.clear=function(){
      $rootScope.player.pause();
      $rootScope.queue=[];
    }
    $rootScope.startsWith = function(str,target){
      if (typeof ( str )== 'undefined'){
        return false;
      }
      return str.startsWith(target);
    }
    $rootScope.seekPercentage = function ($event) {
      var percentage = ($event.offsetX / $event.target.offsetWidth);
      if (percentage <= 1) {
        return percentage;
      } else {
        return 0;
      }
    };
    $rootScope.login = function() {
      simpleLogin.login();
    };

    $rootScope.logout = function() {
      if ('me' in $rootScope){
        $rootScope.me.$destroy;
      }
      simpleLogin.logout();
      $location.path('/login');
    };



  }])
