angular.module('TFApp').controller('UserCtrl', function ($rootScope, $scope, $routeParams, $location, $navigate, $i18next, $timeout) {

	'use strict';

	/*
	 * Create $scope variable for navigation
	 */
	$scope.$navigate = $navigate;
	/*
	 * Set the sidebar items
	 */
	$rootScope.setSidebar('settings');

	$scope.savedMsg = '';

	/**
	 * Default bow Details
	 * @type {Object}
	 */
	$scope.userDetails = {
		firstName: 'Max',
		lastName: 'Mustermann',
		gender: 'm'
	};
	/**
	 * All form items.
	 * @type {Object}
	 */
	$scope.formData = {
		firstName: null,
		lastName: null,
		gender: {
			'm': $i18next('male'),
			'f': $i18next('female'),
			'o': $i18next('other')
		}
	};

	function init () {

		$scope.heading = $i18next('user');

		$scope.leftButton = {
			icon: 'chevron-left',
			tap: function () {
				$navigate.back();
			}
		};

		$scope.data.requireData(['settings', 'users']).then(function () {
			$scope.userDetails = $scope.data.users[0];
		});

	}

	$scope.save = function (userData) {

		if (!userData) {
			console.error('TF :: users :: save :: no data! internal error');
			return;
		}

		$scope.data.update('users', [userData]).then(function (user) {

			$scope.savedMsg = $i18next('saved');

			$timeout(function () {
				$scope.savedMsg = '';
			}, 2000);

			console.log('TF :: users :: edited', user[0]);

		});

	};

	init();

});
