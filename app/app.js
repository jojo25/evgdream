var myApp = angular.module('EvgDreamApp', ['ui.router', 'ngCookies']);

myApp.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

    $urlRouterProvider.otherwise('/accueil');
    $locationProvider.hashPrefix('');

    var acceueilState = {
        name: 'accueil',
        url: '/accueil',
        templateUrl: 'templates/accueil.html',
        controller: 'AccueilController'
    }

    var destinationState = {
        name: 'destination',
        url: '/destination/:desti',
        templateUrl: 'templates/destination.html',
        controller: 'DestinationController'
    }

    var devisState = {
        name: 'devis',
        url: '/devis',
        templateUrl: 'templates/devis.html',
        controller: 'DevisController'
    }

    var connexionState = {
        name: 'connexion',
        url: '/connexion',
        templateUrl: 'templates/connexion.html',
        controller: 'ConnexionController'
    }

    var creationcompteState = {
        name: 'creationcompte',
        url: '/creationcompte',
        params: {
            devis: null
        },
        templateUrl: 'templates/creationcompte.html',
        controller: 'CreationCompteController'
    }

    var moncompteState = {
        name: 'moncompte',
        url: '/moncompte',
        templateUrl: 'templates/moncompte.html',
        params: {
            devis: null
        },
        controller: 'MonCompteController'
    }

    $stateProvider.state(acceueilState);
    $stateProvider.state(destinationState);
    $stateProvider.state(devisState);
    $stateProvider.state(connexionState);
    $stateProvider.state(moncompteState);
    $stateProvider.state(creationcompteState);
})
    .run(['$rootScope', '$cookies',
        function ($rootScope, $cookies) {
            $rootScope.apinode = 'http://localhost:8080/';

            $rootScope.$on('$stateChangeSuccess', function() {
                document.body.scrollTop = document.documentElement.scrollTop = 0;
             });

            // récupere l'utilisateur connecté
            var useremail = $cookies.get('useremail');
            if (useremail != null){
                $rootScope.useremail = useremail;
            }

            // récupere le panier
            var panierActivitesCookie = $cookies.getObject('panier');
            if (panierActivitesCookie != null){
                $rootScope.panierActivites = panierActivitesCookie;
            }
    }])
;