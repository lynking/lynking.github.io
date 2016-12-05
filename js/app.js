// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

var nameApp = angular.module('starter', ['ionic', 'ui.router']);
var REDIRECT_URL = 'https://lynking.github.io';//'http://localhost:8000';//http://www.lynking.us';
var CLIENT_ID = '81xcrsa3u39vr4';
var CLIENT_SECRET = '2P3itf8w1G5kgnY9';
var TOKEN_STATE = 'lynking123';
var SERVER_URL = 'https://4113studio.com';//'https://lynking-node.us-west-1.elasticbeanstalk.com'; // dev 'http://localhost:8080'

// glocal var
var profileLinkedinId = "";
var profilePictureUrl = "";
var receiverAvatar = "";
var receiverName = "";
var receiverHeadLine = "";
var receiverDistance = "";
var receiverSummary = "";
var receiverLinkedinId = "";

// friends & pending list
var friends = [];
var pending = [];

var socket = io(SERVER_URL);

socket.on('notification', function (data) {
    console.log(data);
    // {
    //   sender: '-AXeEda4CL',  // linkedinId
    //   receiver: 'NiMjtTCXCQ', // linkedinId
    //   type: 'friendRequest'  // 'friendRequest', 'acceptRequest' or 'denyRequest'
    // }
    if (data.receiver == profileLinkedinId) {
      // update chat button
      document.getElementsByClassName("chat-list-btn")[0].style.backgroundImage="url('../img/chat-new.png')";
    }
});

nameApp.factory('sharedData', function () {
  return {
    profile: {
      // emailAddress: '',
      // firstName: '',
      // formattedName: '',
      // headline: '',
      // industry: '',
      // lastName: '',
      // linkedinId: '',
      // numConnections: '',
      // pictureUrl: '',
      // profileUrl: '',
      // summary: '',
      // location: []
    },
    friend: {},
    matchedList: []
  }
});

nameApp.directive("ngMobileClick", [function () {
  return function (scope, elem, attrs) {
    elem.bind("touchstart click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      scope.$apply(attrs["ngMobileClick"]);
    });
  }
}]);

nameApp.directive('ngKeyEnter', function () {
  return function (scope, element, attrs) {
    element.bind("keyup", function (event) {
      if (event.which === 13) {
        scope.$apply(function () {
          scope.$eval(attrs.ngKeyEnter);
        });
        event.preventDefault();
      }
    });
  };
});
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
    url: SERVER_URL + '/api/linkedin/token',
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
    url: SERVER_URL + '/api/linkedin/profile?token=' + token,
    type: 'POST'
  });
}

/**
 * add user's location
 * 
 * @param {string} linkedinId
 * @param {number} lat
 * @param {number} lng
 * @returns
 */
function addLocation(linkedinId, lat, lng) {
  return $.ajax({
    url: SERVER_URL + '/api/user/' + linkedinId + '/location',
    type: 'POST',
    data: {
      lat: lat,
      lng: lng
    }
  });
}

/**
 * get user's location
 * 
 * @param {string} linkedinId
 * @param {number} lat
 * @param {number} lng
 * @returns
 */
function getLocation(success, fail) {
  navigator.geolocation.getCurrentPosition(function (pos) {
    var crd = pos.coords;
    var lati = crd.latitude;
    var longi = crd.longitude;
    var accu = crd.accuracy; // in meters
    // alert("relocatING...");
    addLocation(profileLinkedinId, lati, longi)
      .then(function (res) {
        console.log('Location updated');
        success && success({ lat: lati, lng: longi }, res);
      });
  }, function (err) {
    fail && fail(err);
    console.warn('ERROR(' + err.code + '): ' + err.message);
  });
}

/**
 * send invitation
 * 
 * @param {String} senderLinkedinId
 * @param {String} receiverLinkedinId
 * @returns
 */
function sendInivation(senderLinkedinId, receiverLinkedinId) {
  $.ajax({
    method: 'POST',
    url: SERVER_URL + '/api/user/' + senderLinkedinId + '/friends/' + receiverLinkedinId
  }).then(function successCallback(response) {
    alert("invitation sent! :)");
  }, function errorCallback(response) {
    if (response.responseJSON.errorMessage == "A pending request already exists") {
      alert("invitation pending for confirmation :)");
    } else if (response.responseJSON.errorMessage == "Requester and requested are already friends") {
      alert("You are already connected! :)");
    } else {
      alert("Something goes wrong :( try again later!");
    }
  });
}

/**
 * get pendings & friends, then jump to list
 * @return 
 */
function getPendingAndFriends(linkedinId, callback) {
  $.ajax({
    method: 'GET',
    url: SERVER_URL + '/api/user/' + linkedinId + '/friends/requests'
  }).then(function successCallback(response) {
    pending = response.received;
    $.ajax({
      method: 'GET',
      url: SERVER_URL + '/api/user/' + linkedinId + '/friends'
    }).then(function successCallback(response) {
      friends = response.friends;
      callback();
    })
  })
}


nameApp.run(function () {
  if (window.StatusBar) {
    // StatusBar.overlaysWebView(true);
    // StatusBar.styleLightContent();
    StatusBar.styleBlackTranslucent();
    // StatusBar.styleBlackOpaque();
  }
});

nameApp.config(function ($stateProvider, $urlRouterProvider) {

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
    })
    .state('chat', {
      url: '/chat/:linkedinId/:friendLinkedinId',
      templateUrl: 'chat.html',
      controller: 'ChatCtrl'
    })
    .state('chatList', {
      url: '/chatList',
      templateUrl: 'chatList.html',
      controller: 'ChatListCtrl'
    });

  $urlRouterProvider.otherwise("/");

});

nameApp.controller('IndexCtrl', function ($scope, $state, sharedData) {
  $scope.redirect = function () {
    var linkedAuthUrl = 'https://www.linkedin.com/oauth/v2/authorization?response_type=code';
    linkedAuthUrl += '&client_id=' + CLIENT_ID;
    linkedAuthUrl += '&redirect_uri=' + encodeURIComponent(REDIRECT_URL);
    linkedAuthUrl += '&state=' + TOKEN_STATE;
    location.href = linkedAuthUrl;
  };

  console.log(window.location.href);
  var currentURL = window.location.href;
  if (currentURL.indexOf("code") > -1) {
    var start = currentURL.indexOf("code");
    var end = currentURL.indexOf("state");
    var code = currentURL.substring(start + 5, end - 1);
    var reqBody = {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URL,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    };
    getToken(reqBody)
      .then(function (data) {
        return getProfile(data.access_token);
      })
      .then(function (profile) {
        console.log('profile', profile);
        $state.go('search');
        profileLinkedinId = profile.linkedinId;
        profilePictureUrl = profile.pictureUrl;
        profileName = profile.formattedName;
        sharedData.profile = profile;
      });
  }

  $scope.changePage = function () {
    $state.go('search');
  }

});

nameApp.controller('SearchCtrl', function ($scope, $state, $ionicHistory) {
  $scope.goBack = function () {
    $ionicHistory.goBack();
  }
  document.getElementById("avatar").setAttribute("src", profilePictureUrl);

  getLocation(function () {
    console.info('location updated');
    $state.go('candidates');
  }, function () {
    var needRefresh = confirm('Failed to get Location, Want to refresh ?');
    if (needRefresh) {
      location.reload();
    }
    console.error('location error');
  });
});

nameApp.controller('CandidatesCtrl', function ($scope, $http, $state, $ionicHistory, $ionicSlideBoxDelegate, sharedData) {
  $scope.goBack = function () {
    $ionicHistory.goBack();
  }
  $scope.go = function (path) {
    $location.path(path);
  }

  var curProfile = sharedData.profile;

  if (!curProfile.linkedinId) {
    alert('Need login');
    $state.go('index');
    return;
  }

  $scope.jumpToChatList = function(){
    getPendingAndFriends(profileLinkedinId, function(){
      // remove little red dot!
      document.getElementsByClassName("chat-list-btn")[0].style.backgroundImage="url('../img/chat.png')";
      $state.go('chatList');
    });
  };

  // fake data, get data from backend
  $.ajax({
    method: 'GET',
    url: SERVER_URL + '/api/user/' + curProfile.linkedinId + '/match?distance=1500'
  }).then(function successCallback(response) {
    // console.log(response);
    // console.log(response.data[0].name);
    // console.log(response.users);
    $scope.personsList = response.users;
    sharedData.matchedList = response.users;

  }, function errorCallback(response) {
    console.log("data not get");
  });

  // refresh position
  document.getElementById("posi-btn").onclick = function () {
    getLocation(function () {
      console.info('location updated');
      alert("location updated!");
      // location.reload();
    }, function () {
      console.error('location error');
    });
  }

  // next user
  $scope.data = {};
  $scope.data.currentPage = 0;
  var setupSlider = function () {
    //some options to pass to our slider
    $scope.data.sliderOptions = {
      initialSlide: 0,
      direction: 'horizontal', //or vertical
      speed: 300, //0.3s transition
      pagination: false
    };
  }
  setupSlider();
  document.getElementById("nope-btn").onclick = function () {
    $scope.data.sliderDelegate.slideNext();
  }

  // select this user
  // document.getElementById("yeah-btn").onclick = function(){$scope.lookDetail();}
  document.getElementById("yeah-btn").onclick = function () {
    receiverLinkedinId = document.getElementsByClassName("swiper-slide-active")[0].getElementsByClassName('uid')[0].innerHTML;
    sendInivation(profileLinkedinId, receiverLinkedinId);
  }
  $scope.lookDetail = function (index) {
    sharedData.friend = sharedData.matchedList[index];
    // var tmpAvatarString = document.getElementsByClassName("swiper-slide-active")[0].getElementsByClassName("item-image")[0].getAttribute("style");
    // receiverAvatar = tmpAvatarString.substring(tmpAvatarString.indexOf("('")+2,tmpAvatarString.indexOf("')"));
    // receiverName = document.getElementsByClassName("swiper-slide-active")[0].getElementsByTagName('h2')[0].innerText;
    // receiverHeadLine = document.getElementsByClassName("swiper-slide-active")[0].getElementsByTagName('h3')[0].innerText;
    // receiverDistance = document.getElementsByClassName("swiper-slide-active")[0].getElementsByTagName('p')[0].innerText;
    // receiverSummary = document.getElementsByClassName("swiper-slide-active")[0].getElementsByClassName('summary')[0].innerHTML;
    // receiverLinkedinId = document.getElementsByClassName("swiper-slide-active")[0].getElementsByClassName('uid')[0].innerHTML;
    //window.location.href = redirectURL;
    receiverLinkedinId = document.getElementsByClassName("swiper-slide-active")[0].getElementsByClassName('uid')[0].innerHTML;
    $state.go('details');
  }
});

nameApp.controller('DetailsCtrl', function ($scope, $state, $ionicHistory, sharedData) {
  $scope.goBack = function () {
    $ionicHistory.goBack();
  }

  $scope.jumpToChatList = function(){
    getPendingAndFriends(profileLinkedinId, function(){
      // remove little red dot!
      document.getElementsByClassName("chat-list-btn")[0].style.backgroundImage="url('../img/chat.png')";
      $state.go('chatList');
    })
  }

  var curProfile = sharedData.profile;
  var friend = sharedData.friend;

  // fill detailed page with person information
  // $scope.personDetail = {
  //   pictureUrl: redirectAvatar,
  //   formattedName: redirectName,
  //   headline: redirectHeadLine,
  //   distance: redirectDistance,
  //   summary: redirectSummary
  // }

  $scope.personDetail = friend;

  // send invitation
  document.getElementById("yeah-detail-btn").onclick = function () { sendInivation(profileLinkedinId, receiverLinkedinId); }
});

nameApp.controller('ChatListCtrl', function ($scope, $state, $ionicHistory, sharedData) {
  $scope.goBack = function () {
    $ionicHistory.goBack();
  }

  var profile = sharedData.profile;
  var friend = sharedData.friend;
  // pendingList and fiendList data
  $scope.pendingList = pending;
  $scope.friendsList = friends;

  // accept friend request
  $scope.acceptReq = function ($event) {
    var btns = angular.element($event.target).parent()[0]; // btns
    var friendLinkedinId = btns.parentElement.getElementsByClassName("linkedinId")[0].innerHTML; // friend linkedin id
    // post req
    $.ajax({
      method: 'PUT',
      url: SERVER_URL + '/api/user/' + profile.linkedinId + '/friends/' + friend.linkedinId,
      data: {
        action: "accept"
      }
    }).then(function successCallback(response) {
      btns.getElementsByClassName("accept-btn")[0].style.display = 'none'; // hide accept btn
      btns.getElementsByClassName("reject-btn")[0].style.display = 'none'; // hide reject btn
      btns.getElementsByClassName("gochat-btn")[0].style.display = 'block'; // show gochat btn
    }, function errorCallback(response) {
      alert("please try again later");
    });
  }

  // decline friend request
  $scope.rejectReq = function ($event) {
    var listItem = angular.element($event.target).parent()[0].parentElement; // current list item
    var friendLinkedinId = listItem.getElementsByClassName("linkedinId")[0].innerHTML; // friend linkedin id
    // post req
    $.ajax({
      method: 'PUT',
      url: SERVER_URL + '/api/user/' + profileLinkedinId + '/friends/' + friendLinkedinId,
      data: {
        action: "deny"
      }
    }).then(function successCallback(response) {
      listItem.style.display = 'none'; // hide this item
    }, function errorCallback(response) {
      alert("please try again later");
    });
  }

  // go to chat!
  $scope.goChat = function(friend) {
    $state.go('chat', {
      linkedinId: profile.linkedinId,
      friendLinkedinId: friend.linkedinId
    });
  }
});

nameApp.controller('ChatCtrl', function ($scope, $state, $ionicHistory, sharedData) {
  var uid = $state.params.linkedinId;
  var friendId = $state.params.friendLinkedinId;

  // properties
  $scope.messages = [];
  $scope.input = {
    text: ''
  };
  $scope.curProfile = sharedData.profile;

  if (!firebase.apps.length) {
    // Initialize Firebase
    var config = {
      apiKey: "AIzaSyBst2CUBQYUJZZ8eEg-KhcgSi8L_P6tJVs",
      authDomain: "lynking-33fb0.firebaseapp.com",
      databaseURL: "https://lynking-33fb0.firebaseio.com",
      storageBucket: "lynking-33fb0.appspot.com",
      messagingSenderId: "489592513195"
    };
    firebase.initializeApp(config);

    // inital auth
    $.ajax({
      method: 'POST',
      url: SERVER_URL + '/api/user/' + uid + '/chatToken'
    })
      .then(function (res) {
        $scope.auth = firebase.auth().signInWithCustomToken(res.chatToken);

        var dbRef = firebase.database().ref('chats/' + uid + '/' + friendId);
        var dbRefCopy = firebase.database().ref('chats/' + friendId + '/' + uid);

        dbRef.off();

        // listen server to get message
        dbRef.limitToLast(20).on('child_added', refreshMessage);
        // dbRefCopy.limitToLast(12).on('child_added', refreshMessage);

        $scope.dbRef = dbRef;
        $scope.dbRefCopy = dbRefCopy;

      })
      .fail(function (err) {
        alert(err.responseJSON.errorMessage);
      });

    // methods
    $scope.goBack = function () {
      $ionicHistory.goBack();
    }
    /**
     * send text to server (firebase)
     */
    $scope.sendMessage = function () {
      var text = $scope.input.text;
      if (text === null || text === '') {
        return;
      }

      var curProfile = sharedData.profile;
      var message = {
        linkedinId: uid,
        text: text,
        photoUrl: curProfile.pictureUrl,
        name: curProfile.formattedName,
        // photoUrl: uid === profileLinkedinId ? profilePictureUrl : redirectAvatar,
        // name: uid === profileLinkedinId ? profileName : redirectName,
        timestamp: Date.now()
      };

      $scope.dbRef.push(message);
      $scope.dbRefCopy.push(message);

      $scope.input.text = '';
    }
  }

  // refresh view message
  function refreshMessage(data) {
    var val = data.val();
    $scope.messages.push(val);
    $scope.$apply();
  }
  // $scope. = $state;
  // debugger;
});