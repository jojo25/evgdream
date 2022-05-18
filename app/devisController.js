var evgApp = angular.module("EvgDreamApp");


evgApp.controller("DevisController", ['$scope', '$rootScope', '$state', '$cookies', '$window', function ($scope, $rootScope, $state, $cookies, $window) {
  
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
        $state.go('creationcompte');
    }

}]);

