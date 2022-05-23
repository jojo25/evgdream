var evgApp = angular.module("EvgDreamApp");


evgApp.controller("DevisController", ['$scope', '$rootScope', '$state', '$cookies', '$filter', '$http', function ($scope, $rootScope, $state, $cookies, $filter, $http) {
  
    $scope.selectDesti = null;
    
    // récupere desti cookie
    $scope.selectDestiCookie = $cookies.get('panier_destination');
    $scope.panierActivites = [];

    // récupere les acti du panier
    var panierActivitesCookie = $cookies.getObject('panier');
    if (panierActivitesCookie != null){
        $scope.panierActivites = panierActivitesCookie;
    }
    
    $scope.removeFromPanier = function(activite) { 
        var index = $scope.panierActivites.indexOf(activite);
        $scope.panierActivites.splice(index, 1);     
        $cookies.putObject('panier', $scope.panierActivites);

        if ($scope.panierActivites.length == 0 || $scope.panierActivites == null){
            $cookies.put('panier_destination', 0);
            $scope.selectDestiCookie = 0;
        }

        $rootScope.panierActivites = $scope.panierActivites;
    }

    $scope.ValiderDevis = function(devis) { 
        $rootScope.devis = devis;
        $scope.disable = true;

        var desti;
        if ($scope.selectDestiCookie){
            desti = $scope.selectDestiCookie;
        }
        else{
            desti = $scope.selectDesti;
        }
        $rootScope.desti = desti;
        
        if ($rootScope.useremail){
            postdevis($rootScope.useremail);
        }
        else
        {
            $state.go('creationcompte', { devis: true});
        }
    }

    function postdevis(useremail){
        var totalPrix = 0;
        for(var i = 0; i < $rootScope.panierActivites.length; i++){
            totalPrix += $rootScope.panierActivites[i].prix;
        }

        var data = {
            mail : useremail,
            tel :  "en base",
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

