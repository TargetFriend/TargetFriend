angular.module('TFApp').controller('RoundArrowsetCtrl', function ($rootScope, $scope, $navigate, $i18next) {

	'use strict';

	var helper = $scope.helper;

	$scope.$navigate = $navigate;

	/**
	 * All arrowset form items.
	 * @type {Object}
	 */
	$scope.formData = {
		name: null,
		arrowsetSize: null,
		riser: null,
		riserSize: null,
		limbs: null,
		limbSize: null,
		braceHeight: null,
		tiller: null,
		topTiller: null,
		bottomTiller: null,
		drawWeight: null,
		limbWeight: null,
		arrowsetsightWindage: null,
		stringLength: null,
		stringNumber: null,
		stringMaterial: null,
		nockingpointPosition: null,
		stabiliser: null,
		stabiliserLength: null,
		button: null,
		note: null
	};

	$scope.heading = $i18next('arrowset_plural');
	$scope.leftButton = {
		iconClass: 'fa-chevron-left',
		tap: function () {
			$navigate.back();
		}
	};

	$scope.isArrowsetSelectPage = true;

	/**
	 * Counts the active arrowsets (we can't use data.arrowsets.length since deleted arrowsets
	 * are only marked as disabled)
	 */
	function countActiveArrowsets() {
		$scope.arrowsetsAvailable = false;
		for (var i = 0; i < $scope.data.arrowsets.length; i++) {
			if (!$scope.data.arrowsets[i].disabled) {
				$scope.arrowsetsAvailable = true;
				break;
			}
		}
	}

	/*
	 * Load neccassary data (arrowsets an distances)
	 */
	$scope.data.requireData(['arrowsets', 'distances']).then(function () {
		countActiveArrowsets();
	});

	$scope.tap = function (arrowset) {

		$scope.selected = arrowset;

		if (!arrowset) {
			helper.tmpFormData.round.arrowsetID = null;
		} else {
			helper.tmpFormData.round.arrowsetID = arrowset.id;
		}

		$navigate.back();

	};

	$scope.isActive = function (arrowset) {
		return $scope.selected === arrowset;
	};


});
