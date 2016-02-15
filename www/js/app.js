angular.module('whatsNearApp', ['ionic'])

.run(function ($ionicPlatform) {
	$ionicPlatform.ready(function () {
		//console.clear();
		if (window.StatusBar) {
			StatusBar.styleDefault();
		}
		console.log('ready');
	});


})

.controller('AppCtrl', ['$scope', function ($scope) {

}])

.controller('KeysCtrl', ['$scope', '$http', 'factoryGetKeys', '$window', 'factoryGetLoc', function ($scope, $http, factoryGetKeys, $window, factoryGetLoc) {

	if (factoryGetKeys.keys.length) {
		$scope.keys = factoryGetKeys.keys;
	} else {
		factoryGetKeys.getKeys().then(function (d) {
			$scope.keys = d;
			console.log(d);
		})
	};

	
	if (factoryGetLoc.isCoords) {
		console.log(factoryGetLoc.coords);
		$scope.myCoords = factoryGetLoc.coords;
		
	} else {
		var suc = function (pos) {
			//$scope.$apply(function () {
				$scope.myCoords = {
					lat: pos.coords.latitude,
					lng: pos.coords.longitude
				};
				factoryGetLoc.setCoords(pos.coords);
			//});
		}
		var fail = function (e) {
			console.log(e);
		}
		$window.navigator.geolocation.getCurrentPosition(suc, fail, {
			timeout: 10000
		});
	}

}])

.controller('MapCtrl', ['$scope', '$stateParams', 'factoryGetKeys', 'factoryGetLoc', '$filter', function ($scope, $stateParams, factoryGetKeys, factoryGetLoc, $filter) {

	//Print Key
	$scope.key = $filter('uppercase')(factoryGetKeys.keys[$stateParams.mapId].title);
	if (factoryGetKeys.keys.length) {
		$scope.keys = factoryGetKeys.keys;
	} else {
		factoryGetKeys.getKeys().then(function (d) {
			$scope.keys = d;
			console.log(d);
		})
	};

	
	//Location 
	if (factoryGetLoc.isCoords) {
		$scope.myLoc = factoryGetLoc.coords;
	} else {
		var suc = function (pos) {
			$scope.$apply(function () {
				$scope.myLoc = {
					lat: pos.coords.latitude,
					lng: pos.coords.longitude
				};
				factoryGetLoc.setCoords(pos.coords);
			});
		}
		var fail = function (e) {
			console.log(e);
		}
		$window.navigator.geolocation.getCurrentPosition(suc, fail, {
			timeout: 10000
		});
	}

}])

.factory('factoryGetLoc', ['$window', function ($window) {
	var self = this;
	this.coords = {};
	this.isCoords = false;
	this.setCoords = function (c) {
		self.coords = c;
		self.isCoords = true;
	};
	this.getCoords = function () {
		return self.coords;
	};
	return self;
}])

.factory('factoryGetKeys', ['$http', function ($http) {

	var self = this;
	this.keys = [];
	this.getKeys = function () {

		if (self.keys.length) {
			console.log('keys are already there !! Grab from self.keys');
			//console.log(self.keys);
			return self.keys;
		} else {
			console.log('keys are not there !! Make ajax call');
			return $http.get('https://raw.githubusercontent.com/hammerstrike/nutrimeals-main/master/keys.json').then(function (response) {
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
	console.log(this);
	return this;
}])

.directive('embedMap', function () {
	return {
		restrict: 'E',
		transclude: true,
		scope: {
			loc: '=',
			key: '@'
		},
		link: function (scope, el, attrs,$filter) {
			//console.log(scope.loc);		
			
			console.log(scope.key);
			var map = new google.maps.Map(el[0], {
				center: {lat:scope.loc.latitude,lng:scope.loc.longitude},
				zoom: 18
			});
			var infowindow = new google.maps.InfoWindow();
			
			map.setCenter({lat:scope.loc.latitude,lng:scope.loc.longitude});
			var marker = new google.maps.Marker({
				map: map,
				position : {lat:scope.loc.latitude,lng:scope.loc.longitude}
			});
			
			var service = new google.maps.places.PlacesService(map);
				service.nearbySearch({
					location: {lat:scope.loc.latitude,lng:scope.loc.longitude},
					radius: 500,
					types: [scope.key]
				}, callback);
			
			function callback(results, status) {
			  if (status === google.maps.places.PlacesServiceStatus.OK) {
				for (var i = 0; i < results.length; i++) {
				  createMarker(results[i]);
				}
			  }
			}
			
			function createMarker(place) {
				var placeLoc = place.geometry.location;
				var marker = new google.maps.Marker({
					map: map,
					position: place.geometry.location
				});

				google.maps.event.addListener(marker, 'click', function () {
					infowindow.setContent(place.name);
					infowindow.open(map, this);
				});
			}
		}
	}
})

.config(function ($stateProvider, $urlRouterProvider) {

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