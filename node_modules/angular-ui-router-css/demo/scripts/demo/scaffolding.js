angular.module('demo')
	.config(function($stateProvider) {
		$stateProvider
			.state('root.demo', {
				url: '/demo',
				views: {
					'content@root': {
						templateUrl: 'views/demo/demo.html',
						controller: 'DemoCtrl'
					}
				},
				data: {
					css: {
						root: 'styles/demo/core.css'
					}
				}
			})

			.state('root.demo.home', {
				url: '/home',
				templateUrl: 'views/demo/pages/home.html',
				data: {
					css: 'styles/demo/pages/home.css'
				}
			})
			.state('root.demo.about', {
				abstract: true,
				url: '/about',
				templateUrl: 'views/demo/pages/about.html',
				data: {
					css: {
						about: 'styles/demo/pages/about.css'
					}
				}
			})
			.state('root.demo.about.me', {
				url: '/me',
				templateUrl: 'views/demo/pages/about-me.html',
				data: {
					css: ['styles/demo/pages/about-me.css']
				}
			})
			.state('root.demo.about.the-project', {
				url: '/the-project',
				templateUrl: 'views/demo/pages/about-the-project.html',
				data: {
					css: {
						about: null,
						aboutTheProject: 'styles/demo/pages/about-the-project.css'
					}
				}
			})
			.state('root.demo.contact', {
				url: '/contact',
				templateUrl: 'views/demo/pages/contact.html',
				data: {
					css: ['styles/demo/pages/contact.css']
				}
			})
			.state('root.demo.contact.employee', {
				url: '?employee',
				templateUrl: 'views/demo/pages/contact-employee.html',
				controller: function($scope, $transition$) {
					var params = $transition$.params();
					$scope.employee = {
						name: params.employee
					}
				},
				data: {
					css: {
						employeeCore: 'styles/demo/employees/core.css',
						employee: ['$transition$', function($transition$) {
							return 'styles/demo/employees/' + $transition$.params().employee + '.css'
						}]
					}
				}
			});
	})

	.controller('DemoCtrl', function($rootScope, $scope, hlUiRouterCss, $state) {

		$scope.definitions = [];

		$rootScope.$on('uiRouterCss.loadingStarted', function(event, definitions) {
			$scope.definitions = definitions;
		});


		// make sure I enter a demo page as this will cause the definitions to be shown correctly
		if ($state.$current.name === 'root.demo') {
			$state.go('root.demo.home');
		}


		$scope.theme = {
			model: 'light'
		};

		var currentThemeStylesheetReference;
		function removeThemeStylesheet() {
			if (currentThemeStylesheetReference) {
				currentThemeStylesheetReference();
			}
		}

		function applyTheme() {

			// if a theme has been previously set, remove it first
			removeThemeStylesheet();

			$scope.theme.path = 'styles/demo/themes/' + $scope.theme.model + '.css';

			// inject the custom theme stylesheet and sae the reference
			currentThemeStylesheetReference = hlUiRouterCss.injectStyleDefinitions($scope.theme.path);
		}
		$scope.themeChange = function() {
			applyTheme();
		};
		applyTheme();

		$scope.$on('$destroy', function() {
			removeThemeStylesheet();
		});
	});