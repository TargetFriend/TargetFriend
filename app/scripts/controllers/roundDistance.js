angular.module('TFApp').controller('RoundDistanceCtrl', function ($rootScope, $scope, $navigate, $i18next) {

	'use strict';

	var helper = $scope.helper;

	$scope.$navigate = $navigate;

	$scope.heading = $i18next('distance_plural');
	$scope.leftButton = {
		name: 'back',
		tap: function () {
			$navigate.back();
		}
	};


	$scope.tap = function (distance) {
		$scope.selected = distance;
		helper.tmpFormData.round.distanceID = distance.id;
		$navigate.back();
	};

	$scope.isActive = function (distance) {
		return $scope.selected === distance;
	};


});
