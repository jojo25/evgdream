var evgApp = angular.module("EvgDreamApp");


evgApp.controller("CreationCompteController", ['$scope', '$rootScope', '$state', '$http', '$cookies', '$stateParams', '$filter', function ($scope, $rootScope, $state, $http, $cookies, $stateParams, $filter) {
  
    $scope.Valider = function(user) { 
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
                function errorPostCallback(error){
                    console.log(error);
                }
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

