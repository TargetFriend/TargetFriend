angular.module('TFApp').controller('PatternCtrl', function ($rootScope, $scope, $routeParams, $location, $navigate, $i18next) {

	'use strict';

	var isSelectPage = ($location.path() === '/select/pattern' || $location.path() === '/select/pattern/');

	var helper = $scope.helper;

	/*
	 * Set the sidebar items
	 */
	$rootScope.setSidebar('pattern');

	/*
	 * Set form heading
	 */
	$scope.heading = $i18next('pattern_plural');

	$scope.leftButton = {
		iconClass: isSelectPage ? 'fa-chevron-left' : 'fa-reorder',
		tap: function () {
			if (isSelectPage) {
				$navigate.back();
			} else {
				$scope.snapRemote.open('left');
			}
		}
	};
	/**
	 * Gets called if one taps on a pattern
	 * @param {Object} pattern The pattern
	 */
	$scope.tap = function (pattern) {

		$scope.selected = pattern;

		if (!isSelectPage) {
			return;
		}

		helper.tmpFormData.competition.patternID = pattern ? pattern.id : null;
		$navigate.back();

	};
	/**
	 * Checks if the pattern is active (e.g. whether one has tapped on it)
	 * @param  {Object}  pattern The pattern
	 * @return {Boolean}     True if the pattern is active
	 */
	$scope.isActive = function (pattern) {
		return $scope.selected === pattern;
	};

});
