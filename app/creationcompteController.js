var evgApp = angular.module("EvgDreamApp");


evgApp.controller("CreationCompteController", ['$scope', '$rootScope', '$state', '$http', '$filter', '$cookies', '$window', function ($scope, $rootScope, $state, $http, $filter, $cookies, $window) {
  
    $scope.Valider = function(user) { 
        $rootScope.user = user;

        // check le format du mail
        var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if(!user.email.match(mailformat)){
            $scope.erreuremail = "Email non valide.";
            return;
        }

        // check le nb de char du mdp
        if (user.password.length < 6){
            $scope.erreurmdp = "Minimum 6 caractères.";
            return;
        }

        // verifie si les deux mots de passe correspondent 
        if (user.password != user.password2){
            $scope.erreurmdp2 = "Les mots de passe ne sont pas identiques.";
            return;
        }

        // Vérifie si l'email existe deja.
        $http.get($rootScope.apinode + 'getcomptebyemail/'+user.email).then(successCallback, errorCallback);
        function successCallback(response){
            if(response.data){
                $scope.erreuremail = "Ce compte existe déjà.";
                return;
            }
            else{
                // post le compte 
                var req = {
                    method: 'POST',
                    url: $rootScope.apinode + 'creationcompte',
                    headers: {
                    'Content-Type': 'application/json'
                    },
                    data: JSON.stringify(user)
                }

                $http(req).then(successPostCallback, errorPostCallback);
                function successPostCallback(response){
                    $rootScope.user = user.email;
                    $state.go('moncompte');
                }
                function errorPostCallback(error){
                    console.log(error);
                }
            }
        }
        function errorCallback(error){
            console.log(error);
        }        
    }

}]);

