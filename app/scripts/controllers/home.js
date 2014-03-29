angular.module('TFApp').controller('HomeCtrl', function ($rootScope, $scope, $navigate, $timeout, $i18next, $http, helper, $sce) {

	'use strict';

	$scope.userName = ' ';

	$rootScope.setSidebar('home');

	$scope.leftButton = {
		iconClass: 'fa-list',
		tap: function () {
			$scope.snapRemote.open('left');
		}
	};

	function setUser() {
		var user = $scope.data.users[0] || {
			lastName: '',
			firstName: ''
		};
		$scope.userDetails = user;
		$scope.userName = user.firstName + ' ' + user.lastName;
	}

	$scope.checkForUpdate = function () {

		var currentVersion = $scope.versionCode,
			newVersionAvailable,
			firstName = $scope.data.users[0].firstName,
			gotFile = false;

		window.showLoader(true);

		$timeout(function() {
			if (!gotFile) {
				window.showLoader(false);
				helper.alert($i18next('homePage.unableToLoadDescription'), $i18next('homePage.unableToLoad'));
			}
		}, 7000);

		$http.get($scope.appConfig.updateCheck.url, {timeout: 7000}).success(function (data, status, headers) {

			gotFile = true;

			var headerData = headers();

			window.showLoader(false);

			// Check whether the file was found
			if (status === '404') {

				helper.alert('File was NOT found!', 'Error 404');
				return false;

			// Some checks for security reasons... (I hope it's not useless :P )
			} else if (headerData['content-type'] !== 'text/plain' || status !== 200) {

				helper.alert('There are security problems!', 'Security Error');
				return false;

			}

			newVersionAvailable = (parseInt(data, 10) > currentVersion);

			helper.alert(newVersionAvailable ? $i18next('homePage.updateAvailable', {firstName: firstName}) :
				$i18next('homePage.noUpdateAvailable', {firstName: firstName}),
				newVersionAvailable ? $i18next('homePage.updateFound') : $i18next('homePage.updateNotFound'));

			console.log('TF :: home :: checked for new version:', newVersionAvailable);

		}).error(function () {

			gotFile = true;

			window.showLoader(false);

			helper.alert($i18next('homePage.cannotLoadDescription'), $i18next('homePage.cannotLoad'));

		});

	};

	$scope.parseAsHTML = function (value) {
		return $sce.trustAsHtml(value);
	};

	$scope.data.requireData(['settings', 'users']).then(function () {
		$scope.heading = $i18next('home');
		setUser();
	});

	$rootScope.$on('dataUpdated', function () {
		setUser();
	});

});
