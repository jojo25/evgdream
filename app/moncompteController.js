var evgApp = angular.module("EvgDreamApp");


evgApp.controller("MonCompteController", ['$scope', '$rootScope', '$state', '$http', '$stateParams', '$cookies', '$window', function ($scope, $rootScope, $state, $http, $stateParams, $cookies, $window) {

    if ($stateParams.devis){
        $scope.devis = true;
    }

    $http.get($rootScope.apinode + 'devis/'+$rootScope.userid).then(successDestiCallback, errorDestiCallback);
    function successDestiCallback(response){
        $scope.listedevis = response.data;
        console.log( $scope.listedevis);
    }
    function errorDestiCallback(error){
        console.log(error);
    }

    $scope.Deconnexion = function() { 
        $cookies.remove('useremail');
        $rootScope.useremail = null;
        $state.go('accueil');
    }

}]);

