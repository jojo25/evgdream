var evgApp = angular.module("EvgDreamApp");


evgApp.controller("MonCompteController", ['$scope', '$rootScope', '$state', '$http', '$stateParams', '$cookies', '$window', function ($scope, $rootScope, $state, $http, $stateParams, $cookies, $window) {

    if ($stateParams.devis){
        $scope.devis = true;
    }

    $scope.Deconnexion = function() { 
        $cookies.remove('useremail');
        $rootScope.useremail = null;
        $state.go('accueil');
    }

}]);

