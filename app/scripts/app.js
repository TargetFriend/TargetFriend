angular.module('mobile-navigate', []);

angular.module('jm.i18next').config(function ($i18nextProvider) {

	'use strict';

	$i18nextProvider.options = {
		lng: 'de-DE',
		useCookie: false,
		useLocalStorage: false,
		fallbackLng: 'dev'
	};

});

angular.module('TFApp', ['ngTouch', 'ngRoute', 'templates-main', 'pasvaz.bindonce', 'jm.i18next', 'mobile-navigate', 'ajoslin.scrolly', 'ajoslin.mobile-navigate', 'archerTarget', 'snap'])
.run(function ($rootScope, $route, $timeout, $http, $templateCache, dataService, helper, $navigate, snapRemote) {

	'use strict';

	// angular.forEach($route.routes, function (r) {
	// 	if (r.templateUrl) {
	// 		$http.get(r.templateUrl, {cache: $templateCache});
	// 	}
	// });

	$http.get('./config.json').then(function (response) {

		var data = response.data,
			curVersion = window.localStorage.getItem('version');;

		$rootScope.appConfig = data;

		window.archeryAppName = data.appName;

		/*
		 * Check whether it's the first time running this app
		 */
		$rootScope.firstStart = !curVersion;
		/*
		 * Check whether we're using a new version
		 */
		if (!!curVersion && curVersion !== data.version) {

			$rootScope.oldVersion = curVersion;

			switch (curVersion) {
				case '0.8.6':
					$rootScope.newVersion = 'update.0-8-7';
					dataService.doUpdate(curVersion);
					break;
				default:
					console.log('Unknown version!', curVersion);
					break;
			}

		}

		window.localStorage.setItem('version', data.version);

		if (!window.localStorage.getItem('firstInstalledVersion')) {
			window.localStorage.setItem('firstInstalledVersion', data.version);
		}

		$rootScope.version = data.version;
		$rootScope.versionCode = data.versionCode;

	});

	$rootScope.isPhoneGap = window.isPhoneGap;

	$rootScope.snapOpts = {
		disable: 'right',
		maxPosition: 265,
		tapToClose: false,
		touchToDrag: false
	};

	$timeout(function () {

		$rootScope.snapRemote = snapRemote;

		snapRemote.getSnapper().then(function(snapper) {

			var sidebarHelpLayer = document.getElementById('sidebarHelpLayer');

			snapper.on('animated', function () {

				console.log('TF :: snapper :: new state:', snapper.state().state);

				var state = snapper.state().state,
					display = 'none';

				if (state === 'left') {
					display = 'block';
				}

				sidebarHelpLayer.style.display = display;


			});

		});

	}, 700);

	$rootScope.go = $navigate.go;

	$rootScope.setSidebar = function (item, pageItems) {

		item = item || '';
		pageItems = pageItems || [];

		$rootScope.sidebar = {
			contentId: 'container',
			pageItems: pageItems,
			defaultItems: [
				{
					id: 'defaultDivider',
					name: 'home',
					isDivider: true
				},
				{
					id: 'home',
					name: 'home',
					link: 'home',
					faIcon: 'home',
					isActive: (item === 'home')
				},
				{
					id: 'competitions',
					name: 'competition_plural',
					link: 'competitions',
					faIcon: 'home',
					isActive: (item === 'competitions')
				},
				{
					id: 'distances',
					name: 'distance_plural',
					link: 'distances',
					faIcon: 'home',
					isActive: (item === 'distances')
				},
				{
					id: 'bows',
					name: 'bow_plural',
					link: 'bows',
					tfIcon: 'recurve',
					isActive: (item === 'bows')
				},
				{
					id: 'arrowsets',
					name: 'arrowset_plural',
					link: 'arrowsets',
					tfIcon: 'arrow',
					isActive: (item === 'arrowsets')
				},
				{
					id: 'settingsDivider',
					name: 'setting_plural',
					isDivider: true
				},
				{
					id: 'settings',
					name: 'setting_plural',
					link: 'settings',
					faIcon: 'gear',
					isActive: (item === 'settings')
				},
				{
					id: 'helpDivider',
					name: 'help',
					isDivider: true
				},
				{
					id: 'help',
					name: 'help',
					link: 'help',
					faIcon: 'question',
					isActive: (item === 'help')
				},
				{
					id: 'about',
					name: 'about',
					link: 'about',
					faIcon: 'info',
					isActive: (item === 'about')
				}
			]
		};

	};

	$rootScope.setSidebar();

	window.setInterval(function() {
		var pageElements = document.getElementsByClassName('mb-page');
		if (pageElements.length > 1) {
			pageElements[0].parentElement.removeChild(pageElements[0]);
		}
		scroll(0, 0);
	}, 6000);

	/*
	 * Make dataService and helper available in every $scope
	 */
	$rootScope.data = dataService;
	$rootScope.helper = helper;

	$rootScope.$on('dataUpdated', function () {
		$rootScope.$apply(function () {
			$rootScope.data = dataService;
		});
	});

}).filter('reverse', function () {

	return function (items) {
		return items ? items.slice().reverse() : [];
	};

}).filter('range', function () {

	return function (input, total) {
		total = parseInt(total);
		for (var i = 0; i < total; i++) {
			input.push(i);
		}
		return input;
	};

});
