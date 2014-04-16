angular.module('TFApp').controller('EndSettingsCtrl', function ($rootScope, $scope, $routeParams, $timeout, $navigate, $i18next) {

	'use strict';

	$rootScope.setSidebar('settings');

	/**
	 * Default bow Details
	 * @type {Object}
	 */
	$scope.endDetails = {
		// hold in sync with end.js
		targetScaleMain: 4,
		targetScaleTop: 1.6,
		arrowRadius: 8
	};
	/**
	 * All form items.
	 * @type {Object}
	 */
	$scope.formData = {
		targetScaleMain: [0.8, 0.9, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8],
		targetScaleTop: [0.8, 1, 1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.4, 2.6, 2.8, 3, 3.2, 3.4, 3.6],
		arrowRadius: [6, 8, 10, 12, 14, 16, 18, 20]
	};

	function init () {

		$scope.heading = $i18next('setting_plural');

		$scope.leftButton = {
			name: 'menu',
			tap: function () {
				$navigate.back();
			}
		};

		$scope.data.requireData(['settings']).then(function () {
			$scope.endDetails.targetScaleMain = $scope.data.settings[0].targetScaleMain || $scope.endDetails.targetScaleMain;
			$scope.endDetails.targetScaleTop  = $scope.data.settings[0].targetScaleTop  || $scope.endDetails.targetScaleTop;
			$scope.endDetails.arrowRadius     = $scope.data.settings[0].arrowRadius     || $scope.endDetails.arrowRadius;
		});

	}

	$scope.save = function (endData) {

		if (!endData) {
			console.error('TF :: endSettings :: save :: no data! internal error');
			return;
		}

		var settings = $scope.data.settings;

		$scope.saveMsg = $i18next('saving') + '...';

		settings[0].targetScaleMain = endData.targetScaleMain;
		settings[0].targetScaleTop  = endData.targetScaleTop;
		settings[0].arrowRadius     = endData.arrowRadius;

		$scope.data.update('settings', settings).then(function () {

			$scope.saveMsg = $i18next('saved');

			$timeout(function () {
				$scope.saveMsg = '';
			}, 2000);

			$navigate.back();

			console.log('TF :: settings :: saved endSettings', endData);

		});

	};

	init();

});
