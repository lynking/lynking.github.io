// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

var nameApp = angular.module('starter', ['ionic', 'ui.router']);
var REDIRECT_URL = 'http://localhost:8000';
var CLIENT_ID = '81xcrsa3u39vr4';
var CLIENT_SECRET = '2P3itf8w1G5kgnY9';
var TOKEN_STATE = 'lynking123';
var SERVER_URL = 'http://lynking-node.us-west-1.elasticbeanstalk.com'; // dev 'http://localhost:8080'

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
    var linkedAuthUrl = 'https://www.linkedin.com/oauth/v2/authorization?response_type=code';
    linkedAuthUrl+= '&client_id='+CLIENT_ID;
    linkedAuthUrl+= '&redirect_uri='+encodeURIComponent(REDIRECT_URL);
    linkedAuthUrl+= '&state='+TOKEN_STATE;
    location.href= linkedAuthUrl;
  };

  /**
   * get Token from linkedin
   * 
   * @param {object} params
   * {
   *     grant_type: 'authorization_code',
   *     code: code,
   *     redirect_uri: 'http://localhost:8000',
   *     client_id: '81xcrsa3u39vr4',
   *     client_secret: '2P3itf8w1G5kgnY9'
   * }
   * @returns
   * {
   *  access_token: '',
   *  expires_in: 5184000
   * }
   */
  function getToken(params) {
    return $.ajax({
      url: SERVER_URL+'/api/linkedin/token',
      type: 'GET',
      data: params
    });
  }

  /**
   * Get profile from server
   * 
   * @param {any} token
   * @returns
   * {
   * "emailAddress": "shreks7@gmail.com",
   * "firstName": "Shrey",
   * "formattedName": "Shrey Malhotra",
   * "headline": "Master's Student at Carnegie Mellon University",
   * "industry": "Computer Software",
   * "lastName": "Malhotra",
   * "linkedinId": "LRYv4JCUeo",
   * "numConnections": 500,
   * "pictureUrl": "https://media.licdn.com/mpr/mprx/0_1js6_1Awg0ugyNqZL7bkcUpe7x8gDsqOQBbk9DgSg-DjDnZYQRQ3LU8IaKSqdnZBKBbkNw3mgLuZYw5q3nIWNHTDoLu4YwWgLnIX31gSx0jAYp4qL-RLw36D3f",
   * "profileUrl": "https://www.linkedin.com/in/shreymalhotra",
   * "location": [-122.0707008,37.3991423]
   * }
   */
  function getProfile(token) {
    return $.ajax({
          url: SERVER_URL+'/api/linkedin/profile?token='+token,
          type: 'POST'
        });
  }

  console.log(window.location.href);
  var currentURL = window.location.href;
  if(currentURL.includes("code")) {
    var start = currentURL.indexOf("code");
    var end = currentURL.indexOf("state");
    var code = currentURL.substring(start+5, end-1);
    var reqBody = {
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: REDIRECT_URL,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET
      };
    getToken(reqBody)
    .then(function(data){
      return getProfile(data.access_token);
    })
    .then(function(profile){
      console.log('profile', profile);
    });
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
    url: SERVER_URL+'/api/user/Aroshi%20Handa/match'
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