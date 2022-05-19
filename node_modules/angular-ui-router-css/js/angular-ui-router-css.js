(function (angular, window) {

	'use strict';

	// used for the Uglify Grunt task when compiling the build. It sets a global variable 'DEBUG' and sets it to false.
	/* istanbul ignore next */
	if (angular.isUndefined(window.DEBUG)) {
		window.DEBUG = true;
	}

	var _$rootScope;
	var _$q;
	var _$injector;

	var EVENTS_NAMESPACE = 'uiRouterCss';
	var EVENT_LOADING_STARTED = 'loadingStarted';
	var EVENT_LOADING_FINISHED = 'loadingFinished';

	var linkElementPlaceholder;
	var nextResourceId = 1;
	var removeDefinitionQueue = [];
	var addedDefinitions = [];
	var firstAddedStateDefinition;

	function error(message) {
		throw Error('Error "angular-ui-router-css": ' + message);
	}

	function isInt (value) {
		return Number(value) === value && value % 1 === 0;
	}

	function generateResourceId () {
		return '@resource~' + nextResourceId++;
	}

	function isInjectable(obj) {
		return angular.isFunction(obj) || (angular.isArray(obj) && angular.isFunction(obj[obj.length - 1]));
	}

	/**
	 * Normalizes style definitions specified by user in the state configuration.
	 *
	 * @param {*} definition
	 * @param {?string} [key]
	 * @returns {Object|function}
	 */
	function normalizeStyleDefinition(definition, key) {
		if (!isInjectable(definition)) {
			if (angular.isString(definition) || !definition) {

				// Converting string or an empty definition to an object.
				definition = {
					url: definition
				};
			}

			if (angular.isUndefined(definition.url)) {
				error('The definition needs to contain a URL: ' + JSON.stringify(definition));
			}

			// Using specified ID as new object key.
			if (definition.id) {
				key = definition.id;
			}

			// Using custom unique resource ID instead of simple array index.
			if (isInt(key)) {
				key = generateResourceId();
			}

			definition.id = key;
		}
		return definition;
	}

	/**
	 * Normalizes style definitions specified by user in the state configuration.
	 *
	 * @param {*} definitions
	 * @returns {Object|function}
	 */
	function normalizeStyleDefinitions(definitions) {
		if (isInjectable(definitions)) {
			return definitions;
		}
		else if (angular.isString(definitions)) {
			definitions = [definitions];
		}

		// Making sure each entry has a unique resource ID.
		var normalizedDefinitions = {};
		angular.forEach(definitions, function (definition, key) {
			var normalizedDefinition = normalizeStyleDefinition(definition, key);
			normalizedDefinitions[normalizedDefinition.id] = normalizedDefinition;
		});
		return normalizedDefinitions;
	}

	/**
	 * Adds <link> element to the page according to the specified style definition.
	 *
	 * @param {Object} definition
	 * @param {Object} options
	 *
	 * @return {Promise}
	 */
	function loadStyleDefinition(definition, options) {
		var deferred = _$q.defer();

		if (DEBUG && !window.loadStylesheet) {
			error('Package "betsol-load-stylesheet" must be loaded before you can use "angular-ui-router-css"');
		}

		definition.element = window.loadStylesheet(definition.url, function () {
			deferred.resolve();
		}, options);

		return deferred.promise;
	}

	/**
	 * Loads required styles for the specified state.
	 *
	 * @param {object} $transition$
	 * @returns {Promise}
	 */
	function loadStylesForState($transition$) {

		removeDefinitionQueue = removeDefinitionQueue.concat(addedDefinitions);
		addedDefinitions = [];
		firstAddedStateDefinition = null;

		// building chain of states from top to bottom.
		var state = $transition$.to();
		var definitionChain = [];
		if (state.data && state.data.css) {
			var obj = state.data;
			while (obj !== null) {
				definitionChain.unshift(obj.css);
				obj = Object.getPrototypeOf(obj);
			}
		}

		var locals = {
			$transition$: $transition$
		};

		function inject($inject) {
			return _$injector.invoke($inject, null, locals);
		}

		// merging style definitions from all states together.
		var definitions = {};
		angular.forEach(definitionChain, function (_definitions) {
			if (isInjectable(_definitions)) {
				_definitions = normalizeStyleDefinitions(inject(_definitions));
			}
			angular.extend(definitions, _definitions);
		});

		// make sure we're working with a fresh object as it might otherwise lead to issues
		definitions = angular.copy(definitions);

		// adding required styles one-by-one.
		var promises = [];
		angular.forEach(definitions, function (definition) {
			if (isInjectable(definition)) {
				definition = normalizeStyleDefinition(inject(definition));
			}
			if (!definition.url) {
				return;
			}

			var definitionPromise = loadStyleDefinition(definition, {
				insertBefore: linkElementPlaceholder
			});

			// temporarily disable the stylesheet until the state has been fully resolved to give a smooth transition
			definition.element.disabled = true;

			// add the stylesheet promise to the definition
			definition.promise = definitionPromise;

			if (!firstAddedStateDefinition) {
				firstAddedStateDefinition = definition;
			}

			promises.push(definitionPromise);
			addedDefinitions.push(definition);
		});

		_$rootScope.$broadcast(EVENTS_NAMESPACE + '.' + EVENT_LOADING_STARTED, addedDefinitions);

		// firing an event when all styles are loaded.
		return _$q.all(promises).then(function () {
			_$rootScope.$broadcast(EVENTS_NAMESPACE + '.' + EVENT_LOADING_FINISHED);
		});

	}

	function loadStylesForStateComplete() {

		// enable all loaded stylesheets
		angular.forEach(addedDefinitions, function (definition) {
			definition.element.disabled = false;
		});

		// remove all stylesheets from the previous state
		var definition;
		while(definition = removeDefinitionQueue.pop()) {
			definition.element.remove();
		}
	}

	angular.module('hl.css.ui.router', ['ui.router'])

		.config(function ($stateProvider) {

			// using data decorator to normalize style definitions.
			$stateProvider.decorator('data', function (state, parent) {
				var data = parent(state);
				if (data && data.css) {
					data.css = normalizeStyleDefinitions(data.css);
				}
				return data;
			});
		})

		.run(function ($rootScope, $state, $transitions, $timeout, $q, $injector) {

			// set a few service references so they can be used without passing them around between functions
			_$rootScope = $rootScope;
			_$q = $q;
			_$injector = $injector;

			$transitions.onBefore({}, function(transition) {
				transition.addResolvable({
					token: '@css',
					resolveFn: function() {
						return loadStylesForState(transition);
					}
				});
			});

			$transitions.onSuccess({}, function() {
				loadStylesForStateComplete();
			});
		})

		.directive('uiCss', function() {
			return {
				restrict: 'A',
				link: function(scope, element, attrs) {
					if (DEBUG) {
						if (linkElementPlaceholder) {
							error('The directive "uiCss" can only be set once');
						}
						else if (document.getElementsByTagName('head')[0] !== element[0].parentNode) {
							error('The directive "uiCss" must be placed in the "head" of your HTML');
						}
					}

					linkElementPlaceholder = element[0];
				}
			}
		})

		.service('hlUiRouterCss', function($timeout) {
			this.injectStyleDefinitions = function(definitions) {
				definitions = normalizeStyleDefinitions(definitions);

				// immediately inject the stylesheets at the next tick
				$timeout(function() {
					angular.forEach(definitions, function (definition) {
						loadStyleDefinition(definition, {
							insertBefore: firstAddedStateDefinition ? firstAddedStateDefinition.element : linkElementPlaceholder
						});
					});
				});

				return function() {
					angular.forEach(definitions, function (definition) {
						definition.element.remove();
					});
				}
			};

			/* istanbul ignore next */
			if (DEBUG) {

				// necessary for resetting unit tests as those variables are not reset automatically
				this.reset = function() {
					linkElementPlaceholder = null;
					nextResourceId = 1;
					removeDefinitionQueue = [];
					addedDefinitions = [];
					firstAddedStateDefinition = null;
				};
			}
		});

})(angular, window);