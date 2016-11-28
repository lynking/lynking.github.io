// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

var nameApp = angular.module('starter', ['ionic', 'ui.router']);
var REDIRECT_URL = 'http://www.lynking.us';//'http://localhost:8000';
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
    })
    .state('details', {
      url: '/details',
      templateUrl: 'details.html',
      controller: 'DetailsCtrl'
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
      $state.go('search');
      profile = profile;
      profilePictureUrl = profile.pictureUrl;
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
  document.getElementById("avatar").setAttribute("src", profilePictureUrl);
  setTimeout(function(){ 
    console.log("Hello"); 
    $state.go('candidates');
  }, 3000);
});

nameApp.controller('CandidatesCtrl', function($scope, $http, $state, $ionicHistory, $ionicSlideBoxDelegate) {
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
  $scope.go = function(path) { 
    $location.path( path );
  }
  // fake data, get data from backend
  $.ajax({
    method: 'GET',
    url: SERVER_URL+'/api/user/'+profile.linkedinId+'/match'
  }).then(function successCallback(response) {
    // console.log(response);
    // console.log(response.data[0].name);
    console.log(response.data.users);
    $scope.personsList = response.data.users;
  }, function errorCallback(response) {
    console.log("data not get")
  });
  
  // refresh position
  document.getElementById("posi-btn").onclick = function() {
    navigator.geolocation.getCurrentPosition(function(pos){
      var crd = pos.coords;
      var lati = crd.latitude;
      var longi = crd.longitude;
      var accu = crd.accuracy; // in meters
      alert("relocatING...");
      console.log("success" + lati);
    }, function(err){
      console.warn('ERROR(' + err.code + '): ' + err.message);
    });
  }

  // next user
  $scope.data = {};
  $scope.data.currentPage = 0;
  var setupSlider = function() {
    //some options to pass to our slider
    $scope.data.sliderOptions = {
      initialSlide: 0,
      direction: 'horizontal', //or vertical
      speed: 300, //0.3s transition
      pagination: false
    };
  }
  setupSlider();
  document.getElementById("nope-btn").onclick = function() {
    $scope.data.sliderDelegate.slideNext();
  }

  // select this user
  document.getElementById("yeah-btn").onclick = function(){$scope.lookDetail();}
  $scope.lookDetail = function(){
    var tmpAvatarString = document.getElementsByClassName("swiper-slide-active")[0].getElementsByClassName("item-image")[0].getAttribute("style");
    redirectAvatar = tmpAvatarString.substring(tmpAvatarString.indexOf("('")+2,tmpAvatarString.indexOf("')"));
    redirectName = document.getElementsByClassName("swiper-slide-active")[0].getElementsByTagName('h2')[0].innerText;
    redirectHeadLine = document.getElementsByClassName("swiper-slide-active")[0].getElementsByTagName('h3')[0].innerText;
    redirectDistance = document.getElementsByClassName("swiper-slide-active")[0].getElementsByTagName('p')[0].innerText;
    //window.location.href = redirectURL;
    $state.go('details');
  }
});

nameApp.controller('DetailsCtrl', function($scope, $state, $ionicHistory) {
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
  document.getElementById("nope-detail-btn").onclick = function() {
    $ionicHistory.goBack();
  }
  document.getElementById("yeah-detail-btn").onclick = function() {
    alert("invitation sent! :)");
  }
  $scope.personDetail = {
    pictureUrl: redirectAvatar,
    name: redirectName,
    headline: redirectHeadLine,
    distance: redirectDistance
  }
});