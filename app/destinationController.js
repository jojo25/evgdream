var evgApp = angular.module("EvgDreamApp");

evgApp.controller("DestinationController", ['$scope', '$rootScope', '$http', '$filter', '$cookies', '$stateParams', function ($scope, $rootScope, $http, $filter, $cookies, $stateParams) {
  
    var idDesti =  $stateParams.desti;

    $scope.panierActivites = [];

    // récupere les acti du panier
    var panierActivitesCookie = $cookies.getObject('panier');
    if (panierActivitesCookie != null){
        $scope.panierActivites = panierActivitesCookie;
    }

    $scope.destination = {};
    $scope.activitesDay = {};
    $scope.activitesNight= {};

    $scope.showActiDay = 4;
    $scope.showActiNight = 4;
  
    $http.get($rootScope.apinode + 'destination/'+idDesti).then(successDestiCallback, errorDestiCallback);
    function successDestiCallback(response){
        $scope.destination = response.data;
    }
    function errorDestiCallback(error){
        console.log(error);
    }

    $http.get($rootScope.apinode + 'destinationsacti/' + idDesti).then(successCallback, errorCallback);
    function successCallback(response){       
        $scope.activitesDay = $filter('filter')(response.data , {type: 'day'});
        $scope.activitesNight = $filter('filter')(response.data , {type: 'night'});
        $scope.activitesSejour = $filter('filter')(response.data , {type: 'sejour'});
        $scope.activitesPack = $filter('filter')(response.data , {type: 'pack'});
        $scope.activitesHeberg = $filter('filter')(response.data , {type: 'hebergement'});
    }
    function errorCallback(error){
        console.log(error);
    }

    $scope.AddToPanier = function (activite) {
        // Controle si il y a acti d'une desti diff dans le panier
        var panierActiFiltre = $filter('filter')($scope.panierActivites , {type: '!sejour'});
        if (panierActiFiltre[0] != null && panierActiFiltre[0].id_destination != activite.id_destination){
            $scope.panierActivites = [];
        }

        // Controle si il y a acti different du sejour ajouté dans le panier
        var panierSejourFiltre = $filter('filter')($scope.panierActivites , {type: 'sejour'});
        if (panierSejourFiltre[0] != null && panierSejourFiltre[0].id_sous_destination != activite.id_destination){
            $scope.panierActivites = [];
        }

        
        // controle pas 2 sejours dans le meme panier
        if (panierSejourFiltre.length > 0 && activite.type == 'sejour'){
            $scope.panierActivites = [];
        }

        // Controle si il y a deja un hebergement, si oui on le supprime
        var panierHebergementFiltre = $filter('filter')($scope.panierActivites , {type: 'hebergement'});
        if (panierHebergementFiltre.length > 0 && activite.type == 'hebergement'){
            var index = $scope.panierActivites.indexOf(panierHebergementFiltre[0]);
            $scope.panierActivites.splice(index, 1);
        }
     
        // Controle si acti en double - ajout dans le panier sinon
        var activiteDouble = $filter('filter')($scope.panierActivites , {id: activite.id});
        var index = $scope.panierActivites.indexOf(activite);
        if (index == -1 && activiteDouble.length == 0){
            $scope.panierActivites.push(activite);
            $cookies.putObject('panier', $scope.panierActivites);
            $cookies.put('panier_destination', activite.id_destination);
        }

        // Si sejour change l'id destination 
        if (activite.type =='sejour'){
            $cookies.put('panier_destination', activite.id_sous_destination);
        }

        // Si seulement sejour dans le panier on propose d'ajouter activité
        if ($scope.panierActivites.length == 1 && $scope.panierActivites[0].type == "sejour"){
            $scope.boutonSejour = true;
            $scope.id_sous_destination = activite.id_sous_destination;
        }

        $rootScope.panierActivites = $scope.panierActivites;
    };

    $scope.removeFromPanier = function(activite) { 
        var index = $scope.panierActivites.indexOf(activite);
        $scope.panierActivites.splice(index, 1);     
        $cookies.putObject('panier', $scope.panierActivites);

        if ($scope.panierActivites.length == 0 || $scope.panierActivites == null){
            $cookies.put('panier_destination', 0);
        }

        $rootScope.panierActivites = $scope.panierActivites;
    }

    $scope.VoirPlusActiDay = function() { 
        $scope.showActiDay += 8;
    }
    $scope.VoirPlusActiNight = function() { 
        $scope.showActiNight += 8;
    }
}]);

