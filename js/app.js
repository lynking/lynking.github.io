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
    fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      data: JSON.stringify(reqBody),
      headers: {
        // 'Allow-Control-Allow-Origin': '*',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Host': 'www.linkedin.com'
      },
    }).then(function (response) {
      console.log(response.access_token);
    }, function (response) {
      console.log("get token fail")
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

nameApp.controller('CandidatesCtrl', function($scope, $http, $state, $ionicHistory, $ionicSlideBoxDelegate) {
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
  $scope.go = function(path) { 
    $location.path( path );
  }
  // fake data, get data from backend
  fetch('http://lynking-node.us-west-1.elasticbeanstalk.com/api/user/Aroshi%20Handa/match', {
    method: 'GET',
  }).then(function (response) {
    // console.log(response.data.users);
    // $scope.personsList = response.data.users;
    $scope.personsList = [{
      profileUrl: "http://www.baidu.com",
      pictureUrl: "http://ww2.sinaimg.cn/large/7359a3efgw1f8kxu5rp5zj20m80yo47d.jpg",
      name: 1111111,
      headline: "students",
      distance: 100
    },{
      profileUrl: "http://www.baidu.com",
      pictureUrl: "http://ww1.sinaimg.cn/large/7359a3efgw1f8gaphogxxj21kw168adk.jpg",
      name: 2222222,
      headline: "students",
      distance: 200
    },{
      profileUrl: "http://www.baidu.com",
      pictureUrl: "http://ww3.sinaimg.cn/large/7359a3efgw1f9ydiucfdhj20qo0hstbb.jpg",
      name: 3333333,
      headline: "students",
      distance: 300
    }]
  }, function (response) {
    console.log("data not get")
  });
  
  // refresh position
  document.getElementById("posi-btn").onclick = function() {
    navigator.geolocation.getCurrentPosition(function(pos){
      var crd = pos.coords;
      var lati = crd.latitude;
      var longi = crd.longitude;
      var accu = crd.accuracy; // in meters
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