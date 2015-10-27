angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $window, Auth, $location, EnvironmentConfig) {
  $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.token = window.localStorage.token;
  $scope.loginOauth = function(provider) {
    
    // Android Flow
    if (ionic.Platform.isAndroid()){
      var popupWindow =  cordova.InAppBrowser.open(EnvironmentConfig.api + '/auth/'+ provider, '_blank', 'location=no,toolbar=no');
      popupWindow.addEventListener('loadstart', function(event){
        var hasToken = event.url.indexOf('?token=');
        if (hasToken > -1){
          token = event.url.match('token=(.*)')[1];
          popupWindow.close();
          window.localStorage.token = token;
          Auth.getUser();
          $location.path('/loggedIn');
        }
      })
    }
    // Web Flow
    else{
      $window.location.href = EnvironmentConfig.api + '/auth/' + provider;
    }
  };
})

.controller('LoginCtrl', function($scope, Auth) {
  $scope.user = Auth.getCurrentUser();
  $scope.isLoggedIn = Auth.isLoggedIn;
})

.controller('AuthCtrl', function($scope, $location, $window, Auth) {
  window.localStorage.token = $location.search().token
  $location.search('token', null)
  Auth.getUser();
  $location.path('/loggedIn');
})

.controller('SettingsCtrl', function($scope, $location, Auth) {
  $scope.user = Auth.getCurrentUser();
  $scope.isLoggedIn = Auth.isLoggedIn;

  $scope.logout = function(){
    Auth.logout()
  };
})


.controller('RestaurantCtrl', function($scope,geolocation, ApiService, $window, $stateParams) {
  ApiService.invalidateAll()
  $scope.back = function(){
    $window.history.back();
  }

  $scope.rejectHistory = function(){
      ApiService.postLogs($scope.restaurant.id)
  }

  $scope.coords = {}
  $scope.restaurant = {}
  $scope.restaurant = $stateParams.restaurant;

  $scope.markers = {locations: []}

  $scope.getParamsForState = function(){
    return {'restaurant' : $scope.restaurant}
  }

  geolocation.getLocation().then(function(data){
   $scope.coords = {lat:data.coords.latitude, long:data.coords.longitude};

   console.log($scope.coords)
    ApiService.getRestaurants(data.coords.latitude, data.coords.longitude, 1)
    .success(function(response){
      $scope.restaurant = $stateParams.restaurant || response[0]

      $scope.markers = {
      locations: [
        {
          coordinates: {
            lat: $scope.restaurant.position[0],
            lng: $scope.restaurant.position[1]
          },
          icon: {
            window: {
              template: $scope.restaurant.title
            }
          },
          id: 2
        },
        {
          coordinates: {
            lat: data.coords.latitude,
            lng: data.coords.longitude
          },
          icon: {
            window: {
              template: "You are here!"
            }
          },
          id: 2
        }
      ],
      icon: {
        window: {
          templateUrl: 'development/templates/window.html'
        }
      }
    };
  })

  });

   $scope.$watch('coords', function(newValue, oldValue) {
     if (newValue){
       $scope.map = {
         zoom : 15,
         center : {
           lng: $scope.coords.long,
           lat: $scope.coords.lat
         }
       };
     }
   })
})

.controller('BrowseHereCtrl', function($scope, geolocation, ApiService, $window, $stateParams) {
  $scope.coords = $stateParams.coords;
  $scope.restaurants = []

  $scope.back = function(){
    $window.history.back();
  }

  $scope.getParamsForState = function(index){
    return {'restaurant' : $scope.restaurants[index]}
  }

  $scope.remove_br = function(address){
    return address.replace("<br/>", ", ")
  }

  geolocation.getLocation().then(function(data){
   $scope.coords =  $stateParams.coords || {lat:data.coords.latitude, long:data.coords.longitude};
    ApiService.getRestaurants($scope.coords.lat, $scope.coords.long, 5)
    .success(function(response){
      for (var i = 0; i < 5; i++){
        $scope.restaurants.push(response[i])
      }})
    });
})

.controller('ConfirmCtrl', function($scope, geolocation, ApiService, $stateParams, $window){
  $scope.coords = {}
  $scope.restaurant = {}
  $scope.markers = {locations: []}
  $scope.goAgain =false;

  $scope.back = function(){
    $window.history.back();
  }

  $scope.getParamsForState = function(){
    return {'restaurant' : $scope.restaurant}
  }

  $scope.back = function(){
    $window.history.back();
  }

  $scope.restaurant = $stateParams.restaurant

  $scope.saveGoAgain= function(){
    ApiService.updateGoAgain($scope.restaurant.id, $scope.goAgain)
    .success(function(response){
      console.log(response)
    })
  }

  geolocation.getLocation().then(function(data){
   $scope.coords = {lat:data.coords.latitude, long:data.coords.longitude};

    ApiService.getRestaurants(data.coords.latitude, data.coords.longitude, 1)
    .success(function(response){
      $scope.restaurant = $stateParams.restaurant || response[0]

      $scope.markers = {
      locations: [
        {
          coordinates: {
            lat: $scope.restaurant.position[0],
            lng: $scope.restaurant.position[1]
          },
          icon: {
            window: {
              template: $scope.restaurant.title
            }
          },
          id: 2
        },
        {
          coordinates: {
            lat: data.coords.latitude,
            lng: data.coords.longitude
          },
          icon: {
            window: {
              template: "You are here!"
            }
          },
          id: 2
        }
      ],
      icon: {
        window: {
          templateUrl: 'development/templates/window.html'
        }

      }
    };
    ApiService.postLogs($scope.restaurant.id)
  })

  });

   $scope.$watch('coords', function(newValue, oldValue) {
     if (newValue){
       $scope.map = {
         zoom : 15,
         center : {
           lng: $scope.coords.long,
           lat: $scope.coords.lat
         }
       };
     }
   })
})

.controller('BrowseAnyCtrl', function($scope, geolocation, $window) {
  $scope.coords = {}
  $scope.coordsChosen = {}

  $scope.back = function(){
    $window.history.back();
  }

  $scope.getCoords = function(){
    var result = {}
    result.coords = {lat: $scope.coordsChosen.lat, long: $scope.coordsChosen.lng} || $scope.coords
    return result
  }
  
  geolocation.getLocation().then(function(data){
   $scope.coords = {lat:data.coords.latitude, long:data.coords.longitude};
  });

   $scope.$watch('coords', function(newValue, oldValue) {
     if (newValue){
       $scope.map = {
         zoom : 15,
         center : {
           lng: $scope.coords.long,
           lat: $scope.coords.lat
         }
       };
     }
   })
   $scope.marker = undefined

   $scope.ryanbullshit = function($event) {
    $scope.coordsChosen = this.mapObject.xa($event.layerX, $event.layerY);
    var old_marker = $scope.marker
    if (old_marker){
      this.mapObject.removeObject(old_marker)
    }
    $scope.marker = new H.map.Marker({lat:$scope.coordsChosen.lat, lng:$scope.coordsChosen.lng});
    this.mapObject.addObject($scope.marker);
   }
});
