var evgApp = angular.module("EvgDreamApp");


evgApp.controller("ConnexionController", ['$scope', '$rootScope', '$state', '$http', '$filter', '$cookies', '$stateParams', function ($scope, $rootScope, $state, $http, $filter, $cookies, $stateParams) {
  
    if ($rootScope.useremail){
        $state.go('moncompte');
    }

    $scope.Valider = function(user) { 
        // Vérifie si compte ok.
        $http.get($rootScope.apinode + 'connexioncompte/'+user.email + '/' + user.password).then(successCallback, errorCallback);
        function successCallback(response){
            if(response.data){
                $cookies.put('useremail', user.email);
                $cookies.put('userid', response.data);
                $rootScope.useremail = user.email;
                $rootScope.userid = response.data;

                if ($stateParams.devis){
                    postdevis($rootScope.userid, user.email, user.telephone);
                }
                else{
                    $state.go('moncompte');
                }
            }
            else{
                $scope.erreur = "Email ou mot de passe invalide.";
            }
        }
        function errorCallback(error){
            console.log(error);
        }              
    }

    function postdevis(userid, useremail, usertel){
        var totalPrix = 0;
        for(var i = 0; i < $rootScope.panierActivites.length; i++){
            totalPrix += $rootScope.panierActivites[i].prix;
        }

        var data = {
            id : userid,
            mail : useremail,
            tel :  usertel,
            date_depart : $filter('date')($rootScope.devis.date_depart, "yyyy-MM-dd"),
            date_retour : $filter('date')($rootScope.devis.date_retour, "yyyy-MM-dd"),
            ville_depart : $rootScope.devis.villedepart,
            nb_participant : $rootScope.devis.nb_participant,
            budget : $rootScope.devis.budget,
            destination : $rootScope.desti,
            details : $rootScope.devis.details,
            prix : totalPrix,
            date_creation : $filter('date')(new Date(), "yyyy-MM-dd HH:mm:ss"),
            date_modification : $filter('date')(new Date(), "yyyy-MM-dd HH:mm:ss"),
            activites : $rootScope.panierActivites,
        }

        // post le devis 
        var req = {
            method: 'POST',
            url: $rootScope.apinode + 'validationdevis',
            headers: {
            'Content-Type': 'application/json'
            },
            data: JSON.stringify(data)
        }

        $http(req).then(successPostCallback, errorPostCallback);
        function successPostCallback(response){
            $state.go('moncompte', { devis: true});
        }
        function errorPostCallback(error){
            console.log(error);
        }
    }

}]);

