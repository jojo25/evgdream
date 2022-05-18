var evgApp = angular.module("EvgDreamApp");


evgApp.controller("MonCompteController", ['$scope', '$rootScope', '$state', '$http', '$filter', '$cookies', '$window', function ($scope, $rootScope, $state, $http, $filter, $cookies, $window) {
  
    $scope.Valider = function(user) { 
        $rootScope.user = user;
        $state.go('moncompte');
    }

}]);

