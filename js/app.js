// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

var nameApp = angular.module('starter', ['ionic', 'ui.router']);

nameApp.run(function() {
    if(window.StatusBar) {
      // StatusBar.overlaysWebView(true);
      // StatusBar.styleLightContent();
      StatusBar.styleBlackTranslucent();
      // StatusBar.styleBlackOpaque();
    }
});

nameApp.config(function($stateProvider, $urlRouterProvider) {
 
  $stateProvider
    .state('index', {
      url: '/',
      templateUrl: 'index.html',
      controller: 'IndexCtrl'
    })
    .state('search', {
      url: '/search',
      templateUrl: 'search.html',
      controller: 'SearchCtrl'
    })
    .state('candidates', {
      url: '/candidates',
      templateUrl: 'candidates.html',
      controller: 'CandidatesCtrl'
    });
 
  $urlRouterProvider.otherwise("/");

});

nameApp.controller('IndexCtrl', function($scope, $state) {
  $scope.redirect = function(){
    //location.href="https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=81xcrsa3u39vr4&redirect_uri=https%3A%2F%2Flynking.github.io&state=lynking123"
    location.href="https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=81xcrsa3u39vr4&redirect_uri=http%3A%2F%2Flocalhost%3A8000&state=lynking123"
  };

  console.log(window.location.href);
  var currentURL = window.location.href;
  if(currentURL.includes("code")) {
    var start = currentURL.indexOf("code");
    var end = currentURL.indexOf("state");
    var code = currentURL.substring(start+5, end-1);
    var reqBody = {
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: 'http://localhost:8000',
          client_id: '81xcrsa3u39vr4',
          client_secret: '2P3itf8w1G5kgnY9'
      };
    $.ajax({
      url: 'https://www.linkedin.com/oauth/v2/accessToken', 
      type: 'POST',
      data: JSON.stringify(reqBody),
      success: function(data, textStatus, jqXHR) {
        console.log(data.access_token);
      },
      error: function(jqXHR, textStatus, errorThrown){
        console.log("get token fail")
      }
    })
  }

  $scope.changePage = function(){
    $state.go('search');
  }
  
});
 
nameApp.controller('SearchCtrl', function($scope, $state, $ionicHistory) {
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
  setTimeout(function(){ 
    console.log("Hello"); 
    $state.go('candidates');
  }, 3000);
});

nameApp.controller('CandidatesCtrl', function($scope, $http, $state, $ionicHistory) {
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
  $scope.go = function(path) {
    $location.path( path );
  }
  // fake data, get data from backend
  $http({
    method: 'GET',
    url: 'http://lynking-node.us-west-1.elasticbeanstalk.com/api/user/Aroshi%20Handa/match'
  }).then(function successCallback(response) {
    // console.log(response);
    // console.log(response.data[0].name);
    console.log(response.data.users);
    $scope.personsList = response.data.users;
  }, function errorCallback(response) {
    console.log("data not get")
  });
  
  document.getElementById("yeah-btn").onclick = function() {
    var redirectURL = document.getElementsByClassName("swiper-slide-active")[0].getElementsByTagName('a')[0].getAttribute("href");
    window.location.href = redirectURL;
  }

});