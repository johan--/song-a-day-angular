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

.run(['$document','simpleLogin','$firebase','fbutil','$rootScope','$timeout', function($document,simpleLogin,$firebase,fbutil,$rootScope,$timeout) {

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
      $event.srcElement.outerHTML='<button style="float:right;" onclick=\'document.getElementById("v'+song.key+'").remove()\'>X</button><video id="v'+song.key+'" autoplay src="'+song.media.src+'" height="100%" width="100%" ></video>';
      var next=song.media;
      next.title=song.title;
      var videoPlayer=$document.find('#movie');
      videoPlayer.attr('src',next.src);
      $rootScope.pause();
    }
    $rootScope.playsong=function(song){
      var next=song.media;
      next.title=song.title;
      if($rootScope.queue.indexOf(next) == -1){
        $rootScope.queue.push(next);
        $timeout(function() {
          $rootScope.play();
        }, 100);
      }

    }
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

  }])
