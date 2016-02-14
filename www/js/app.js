var coords = {};
var currentLatitude, currentLongitude;
var getLocation = function () {
    var suc = function (p) {
        //alert("geolocation success:"+p.coords.latitude);
        if (p.coords.latitude != undefined) {
            currentLatitude = p.coords.latitude;
            currentLongitude = p.coords.longitude;
            coords = {lat:currentLatitude,lng:currentLongitude};

        }
    };
    var fail = function (e) {
        //console.log("geolocation failed");
        getLocation();
    };

    navigator.geolocation.getCurrentPosition(suc,fail,{timeout:10000});

}
getLocation();

angular.module('whatsNearApp', ['ionic'])

.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      console.clear();
      if(window.StatusBar) {
        StatusBar.styleDefault();
      }
      console.log('ready');
    });
    
    
})

.controller('MainCtrl',['$scope','factoryGetKeys',function($scope,factoryGetKeys){
  console.log(factoryGetKeys.get());
}])

.controller('AppCtrl',['$scope',function($scope){

}])

.controller('KeysCtrl', ['$scope','$http','factoryGetKeys','$timeout',function($scope,$http,factoryGetKeys,$timeout) {
  /*
  $scope.keys = [
    { title: 'restaurant', id: 1 },
    { title: 'atm', id: 2 },
    { title: 'bank', id: 3 },
    { title: 'hospital', id: 4 }
  ];
  */
    $scope.$watch('myCoords', function(newValue, oldValue) {
        console.log(newValue);
        $scope.myCoords = newValue;
    });

    $scope.myCoords = coords;
  if(factoryGetKeys.keys.length){
    $scope.keys = factoryGetKeys.keys;
  }else{
    factoryGetKeys.getKeys().then(function (d) {
      $scope.keys = d;
      console.log(d);
          
    })
  };     
    
  
    
    
    /* Get Location Coords */    
    
    /*if(JSON.stringify(factoryGetLoc.coords) != '{}'){
        $scope.myLoc = factoryGetLoc.coords;
    }else{
        $scope.myLoc = factoryGetLoc.getCoords();
    }
    
    $scope.$watch('myLoc', function(newValue, oldValue) {
        console.log(newValue);
        $scope.myLoc = newValue;
    });*/
}])

.controller('MapCtrl', ['$scope','$stateParams','factoryGetKeys','$filter',function($scope,$stateParams,factoryGetKeys,$filter) {

  $scope.key = $filter('uppercase')(factoryGetKeys.keys[$stateParams.mapId].title);

  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(function (position) {
			myLocation = {
				lat: position.coords.latitude,
				lng: position.coords.longitude
			};
      //console.log(myLocation);
      $scope.myLoc = myLocation;
		});
  };
}])
/*
.factory('factoryGetLoc',[function(){
  var self = this;
  this.coords = {};
  this.getCoords = function(){
      if(JSON.stringify(self.coords) !== '{}'){
          console.log('if coords already there!! Grab from self.coords');
          return self.coords;
      }else{
          console.log('if coords not there, then get from geo.');
          
          var currentLatitude, currentLongitude;

          var getLocation = function () {
              var suc = function (p) {
                  //alert("geolocation success:"+p.coords.latitude);
                  if (p.coords.latitude != undefined) {
                      currentLatitude = p.coords.latitude;
                      currentLongitude = p.coords.longitude;
                      //$scope.myLoc = currentLatitude+':'+currentLongitude;
                      self.coords = {lat:currentLatitude,lng:currentLongitude};
                      return self.coords;
                  }
              };
              var fail = function () {
                  alert("geolocation failed");
                  //getLocation();
              };

              navigator.geolocation.getCurrentPosition(suc, fail);
          }

          getLocation();
      }
  };
    return this;
}])
*/
.factory('factoryGetKeys',['$http',function($http){

  var self = this;
  this.keys = [];
  this.getKeys = function(){

    if(self.keys.length){
      console.log('keys are already there !! Grab from self.keys');
      //console.log(self.keys);
      return self.keys;
    }else{
      console.log('keys are not there !! Make ajax call');
      return $http.get('https://raw.githubusercontent.com/hammerstrike/nutrimeals-main/master/keys.json').then(function(response){
          if (response.data.error) {
             return response.data.error;
         } else {
             self.keys = response.data.keys;
             //console.log(self.keys);
             return self.keys;
         }
        });
    }
  }
  console.log('factoryGetKeys called');
  return this;
}])

.directive('embedMap',function(){
  return {
    restrict: 'E',
    transclude: true,
			scope : {
                loc : '=',
                key : '@'
			},
			link : function(scope,el,attrs){
        //console.log(scope.loc);
        //el.html(scope.loc.lat+":"+scope.loc.lng)

        var map = new google.maps.Map(el[0], {
    			center: scope.loc,
    			zoom: 18
    		});
/*
        var marker = new google.maps.Marker({
    		    map: map,
    		    anchorPoint: new google.maps.Point(0, -29)
    		  });*/
/*
          var service = new google.maps.places.PlacesService(map);
      		service.nearbySearch({
      			location: scope.loc,
      			radius: 500,
      			types: scope.key
      		}, callback);*/
/*
          function callback(results, status) {
        		if (status === google.maps.places.PlacesServiceStatus.OK) {
        			for (var i = 0; i < results.length; i++) {
        				createMarker(results[i]);
        			}
        		}
        	}*/
/*
        	function createMarker(place) {
        		var placeLoc = place.geometry.location;
        		var marker = new google.maps.Marker({
        			map: map,
        			position: place.geometry.location,
        			animation: google.maps.Animation.DROP
        		});*/
			}
  }
})

.config(function($stateProvider, $urlRouterProvider) {

    $stateProvider

    .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
    })
    .state('app.keys', {
      url: '/keys',
      views: {
        'menuContent': {
          templateUrl: 'templates/keys.html',
          controller: 'KeysCtrl'
        }
      }
    })
    .state('app.map', {
        url: '/keys/:mapId',
        views: {
          'menuContent': {
            templateUrl: 'templates/map.html',
            controller: 'MapCtrl'
          }
        }
      });

    $urlRouterProvider.otherwise('/app/keys');
    
});
