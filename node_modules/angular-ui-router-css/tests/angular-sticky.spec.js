'use strict';

describe('angular-ui-router-css', function() {

	var $rootScope;
	var $compile;
	var $document;
	var $window;
	var $timeout;
	var $log;
	var $q;

	var $state;
	var $stateProvider;
	var $transitions;

	var hlUiRouterCss;

	var head;
	var body;
	var assetsPath = 'base/tests/assets/';

	beforeEach(module('hl.css.ui.router'));
	beforeEach(module(function (_$stateProvider_) {
		$stateProvider = _$stateProvider_;

		// using data decorator to normalize style definitions.
		$stateProvider.decorator('data', function (state, parent) {
			var data = parent(state);
			if (data && data.css) {
				angular.forEach(data.css, function (definition) {
					if (definition.url) {
						definition.url = assetsPath + definition.url;
					}
				});
			}
			return data;
		});
	}));
	beforeEach(inject(function(_$rootScope_, _$compile_, _$document_, _$window_, _$timeout_, _$log_, _$q_) {
		$rootScope = _$rootScope_;
		$compile = _$compile_;
		$document = _$document_;
		$window = _$window_;
		$timeout = _$timeout_;
		$log = _$log_;
		$q = _$q_;
	}));
	beforeEach(inject(function(_$state_, _$transitions_) {
		$state = _$state_;
		$transitions = _$transitions_;
	}));

	beforeEach(inject(function(_hlUiRouterCss_) {
		hlUiRouterCss = _hlUiRouterCss_;
	}));

	beforeEach(function() {
		head = $document[0].getElementsByTagName('head')[0];
		body = $document.find('body').eq(0);
		assetsPath = 'base/tests/assets/';
	});

	function getStylesheetElements() {
		return $(head).find('link[href]');
	}

	function removeAllStylesheetElements() {
		getStylesheetElements().remove();
	}

	function getStylesheetPaths() {
		var styleSheets = [];

		getStylesheetElements().each(function(index, element) {
			element = $(element);
			var href = element.attr('href');
			if (href) {
				styleSheets.push(href.replace(assetsPath, ''));
			}
		});

		return styleSheets;
	}

	function reset() {
		hlUiRouterCss.reset();
		removeAllStylesheetElements();
	}

	beforeEach(function() {
		reset();
	});
	afterEach(function() {
		window.DEBUG = true;
	});

	beforeEach(function () {
		jasmine.addMatchers({
			toEqualStylesheets: function () {
				return {
					compare: function (matchedStylesheets) {
						var stylesheets = getStylesheetPaths();
						var result = {
							pass: angular.equals(stylesheets, matchedStylesheets)
						};
						if (result.pass) {
							result.message = 'Expected stylesheets are found';
						}
						else {
							result.message = 'Expected stylesheets are either not found or in the wrong order. Expected: ' + stylesheets.join(', ') + '. Value: ' + matchedStylesheets.join(', ');
						}
						return result;
					}
				};
			}
		})
	});

	function getStyle(className) {
		for (var i = 0; i < document.styleSheets.length; i++) {
			var sheet = document.styleSheets[i];
			var classes = sheet.rules || sheet.cssRules;

			for (var x = 0; x < classes.length; x++) {
				var selector = classes[x];
				if (selector.selectorText === className) {
					return selector.style.cssText;
				}
			}
		}
	}

	/**
	 * Compiles a HTML string into a DOM element by adding it to the body
	 * @param element string HTML string
	 * @param scope Supply a scope if you want
	 * @returns {*}
	 */
	function compile(element, scope) {
		scope = scope ? scope : $rootScope.$new();
		var el = angular.element(element);
		$compile(el)(scope);
		scope.$digest();
		return $(el);
	}

	/**
	 * Compiles a HTML string into a DOM element by adding it to the body
	 * @param element string HTML string
	 * @param scope Supply a scope if you want
	 * @returns {*}
	 */
	function compileToHead(element, scope) {
		scope = scope ? scope : $rootScope.$new();
		var el = angular.element(element);
		head.appendChild(el[0]);
		$compile(el)(scope);
		scope.$digest();
		return $(el);
	}

	function addState(name, css) {
		var data = {};

		if (css) {
			data.css = css;
		}

		$stateProvider.state({
			name: name,
			url: '/' + name,
			template: '<div><ui-view></ui-view></div>',
			data: data
		});
	}

	function stateGo(name) {
		$state.go(name);
		$rootScope.$digest();
	}

	describe('service:$state', function() {

		beforeEach(inject(function($compile, $rootScope) {
			var $scope = $rootScope.$new();
			$compile('<div><ui-view></ui-view></div>')($scope);
		}));

		afterEach(function() {
			removeAllStylesheetElements();
		});

		describe('service:$state', function() {

			describe('state css injection', function () {
				it('no stylesheets', function () {
					addState('test');
					stateGo('test');
					expect([]).toEqualStylesheets();
				});

				it('string', function () {
					addState('test', 'foo.css');
					stateGo('test');
					expect(['foo.css']).toEqualStylesheets();
				});

				it('array', function () {
					addState('test', ['foo.css', 'bar.css']);
					stateGo('test');
					expect(['foo.css', 'bar.css']).toEqualStylesheets();
				});

				it('object', function () {
					addState('test', {
						foo: 'foo.css'
					});
					stateGo('test');
					expect(['foo.css']).toEqualStylesheets();
				});

				it('object', function () {
					addState('test', {
						foo: {
							id: 'foo',
							url: 'foo.css'
						}
					});
					stateGo('test');
					expect(['foo.css']).toEqualStylesheets();
				});

				it('object without id', function () {
					addState('test', {
						foo: {
							url: 'foo.css'
						}
					});
					stateGo('test');
					expect(['foo.css']).toEqualStylesheets();
				});

				it('object invalid', function () {
					expect(function () {
						addState('test', {
							foo: {
								id: 'foo'
							}
						})
					}).toThrow(new Error('Error "angular-ui-router-css": The definition needs to contain a URL: {"id":"foo"}'));
				});

				it('injectable', function () {
					addState('test', function () {
						return 'foo.css'
					});
					stateGo('test');
					expect(['foo.css']).toEqualStylesheets();
				});

				it('injectable single', function () {
					addState('test', {
						foo: function () {
							return 'foo.css'
						}
					});
					stateGo('test');
					expect(['foo.css']).toEqualStylesheets();
				});

				it('override in child state', function (done) {
					addState('test', {
						foo: 'foo.css'
					});
					addState('test.test', {
						foo: 'bar.css'
					});

					stateGo('test');
					expect(['foo.css']).toEqualStylesheets();

					setTimeout(function () {
						$rootScope.$digest();
						stateGo('test.test');

						// at this point, both stylesheets need to have been injected
						expect(['foo.css', 'bar.css']).toEqualStylesheets();

						setTimeout(function () {
							$rootScope.$digest();

							// when the transition is done, only the overwritten stylesheet remains
							expect(['bar.css']).toEqualStylesheets();

							done();
						}, 100);
					}, 100);
				});

				it('override to nothing in child state', function () {
					addState('test', {
						foo: 'foo.css'
					});
					addState('test.test', {
						foo: null
					});

					stateGo('test.test');

					// at this point, both stylesheets need to have been injected
					expect([]).toEqualStylesheets();
				});
			});

			describe('combinations', function() {

				it('both state and injection', function () {

					addState('test', {
						foo: 'foo.css'
					});
					stateGo('test');

					var removeHandler = hlUiRouterCss.injectStyleDefinitions(assetsPath + 'test.css');
					$timeout.flush();

					// at this point, both stylesheets need to have been injected
					expect(['test.css', 'foo.css']).toEqualStylesheets();

					removeHandler();
				});
			})
		});

		it('cannot find "betsol-load-stylesheet"', function(done) {
			var loadStylesheet = window.loadStylesheet;
			window.loadStylesheet = null;

			$state.defaultErrorHandler(function(error) {
				expect(error.detail.message).toBe('Error "angular-ui-router-css": Package "betsol-load-stylesheet" must be loaded before you can use "angular-ui-router-css"');

				done();
			});

			addState('test', 'foo.css');
			stateGo('test');

			// restore the plugin
			window.loadStylesheet = loadStylesheet;
		});
	});


	describe('directive:uiCss', function() {

		it('throws an error when not added to the head', function() {
			window.DEBUG = false;
			expect(function () {
				compile('<link ui-css>');
			}).not.toThrow(new Error('Error "angular-ui-router-css": The directive "uiCss" must be placed in the "head" of your HTML'));
		});
		it('not throws an error when not added to the head', function() {
			expect(function () {
				compile('<link ui-css>');
			}).toThrow(new Error('Error "angular-ui-router-css": The directive "uiCss" must be placed in the "head" of your HTML'));
		});

		it('throws an error when it\'s being added twice', function() {
			expect(function () {
				compileToHead('<link ui-css>');
				compileToHead('<link ui-css>');
			}).toThrow(new Error('Error "angular-ui-router-css": The directive "uiCss" can only be set once'));
		});
		it('throws an error when it\'s being added twice', function() {
			window.DEBUG = false;
			expect(function () {
				compileToHead('<link ui-css>');
				compileToHead('<link ui-css>');
			}).not.toThrow(new Error('Error "angular-ui-router-css": The directive "uiCss" can only be set once'));
		});

	});

	describe('service:hlUiRouterCss', function() {

		it('inject a stylesheet and remove it afterwards', function(done) {
			var removeHandler = hlUiRouterCss.injectStyleDefinitions(assetsPath + 'test.css');
			$timeout.flush();

			setTimeout(function() {
				expect(getStyle('.test')).toBe('color: rgb(255, 0, 0);');
				removeHandler();
				expect(getStyle('.test')).toBeUndefined();

				done();
			}, 100);
		});

		it('inject a stylesheet and remove it afterwards with ui-css', function(done) {
			var uiCssElement = compileToHead('<link ui-css>');
			var removeHandler = hlUiRouterCss.injectStyleDefinitions(assetsPath + 'test.css');
			$timeout.flush();

			setTimeout(function() {
				expect(uiCssElement.prev().attr('href').indexOf('test.css') !== -1).toBeTruthy();
				removeHandler();

				done();
			}, 100);
		});
	});
});