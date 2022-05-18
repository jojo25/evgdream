var evgApp = angular.module("EvgDreamApp");


evgApp.controller("ConnexionController", ['$scope', '$rootScope', '$state', '$http', '$filter', '$cookies', '$window', function ($scope, $rootScope, $state, $http, $filter, $cookies, $window) {
  
    if ($rootScope.useremail){
        $state.go('moncompte');
    }

    $scope.Valider = function(user) { 
        // Vérifie si compte ok.
        $http.get($rootScope.apinode + 'connexioncompte/'+user.email + '/' + user.password).then(successCallback, errorCallback);
        function successCallback(response){
            if(response.data){
                $cookies.put('useremail', user.email);
                $rootScope.useremail = user.email;
                $state.go('moncompte');
            }
            else{
                $scope.erreur = "Email ou mot de passe invalide.";
            }
        }
        function errorCallback(error){
            console.log(error);
        }              
    }

}]);

