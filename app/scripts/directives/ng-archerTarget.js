angular.module('archerTarget', []).directive('ngArchertarget', function ($rootScope, $timeout) {

	'use strict';

	if (!$rootScope.archerTargets) {
		$rootScope.archerTargets = {};
	}

	function setTarget(element, options) {

		console.log('TF :: archerTarget.js directive :: set target');

		options = options || {};

		element.empty().off();

		element = element[0];

		$timeout(function () {
			if ($rootScope.archerTargets[element.id]) {
				$rootScope.archerTargets[element.id].removeEventListeners();
			}
			$rootScope.archerTargets[element.id] = new ArcherTarget(element, options);
		}, 80);
	}

	return {

		// 'A': only as attribute
		restrict: 'A',

		link: function (scope, element) {

			var latestValue;

			scope.$on('targetOptionsManualChange', function () {
				console.log('targetOptionsManualChange');
				setTarget(element, latestValue);
			});

			scope.$watch('targetOptions', function (value) {
				if (value) {
					latestValue = value;
					setTarget(element, value);
				}
			});

		}

	};

});
