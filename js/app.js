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