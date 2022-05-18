var evgApp = angular.module("EvgDreamApp");


evgApp.controller("MonCompteController", ['$scope', '$rootScope', '$state', '$http', '$filter', '$cookies', '$window', function ($scope, $rootScope, $state, $http, $filter, $cookies, $window) {

    $scope.Deconnexion = function() { 
        $cookies.remove('useremail');
        $rootScope.useremail = null;
        $state.go('accueil');
    }

}]);

