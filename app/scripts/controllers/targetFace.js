angular.module('TFApp').controller('TargetFaceCtrl', function ($rootScope, $scope, $navigate, $i18next) {

	'use strict';

	$scope.heading = $i18next('targetFace_plural');

	$scope.leftButton = {
		name: 'back',
		tap: function () {
			$navigate.back();
		}
	};

	$scope.isOutdoor = 1;
	$scope.isRecurve = -1;


	$scope.setOutdoor = function (isOutdoor) {
		$scope.isOutdoor = isOutdoor;
		$scope.isRecurve = isOutdoor ? -1 : 2;
	};

	$scope.setRecurve = function (isRecurve) {
		$scope.isRecurve = isRecurve;
	};

	$scope.tap = function (targetFace) {
		$scope.selected = targetFace;
		$scope.helper.tmpFormData.round.targetFaceID = targetFace ? targetFace.id : null;
		$navigate.back();
	};

	$scope.isActive = function (targetFace) {
		return $scope.selected === targetFace;
	};

});
