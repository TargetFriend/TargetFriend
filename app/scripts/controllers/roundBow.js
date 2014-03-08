angular.module('TFApp').controller('RoundBowCtrl', function ($rootScope, $scope, $navigate, $i18next) {

	'use strict';

	var helper = $scope.helper;

	$scope.$navigate = $navigate;

	/**
	 * All bow form items.
	 * @type {Object}
	 */
	$scope.formData = {
		name: null,
		bowSize: null,
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
		bowsightWindage: null,
		stringLength: null,
		stringNumber: null,
		stringMaterial: null,
		nockingpointPosition: null,
		stabiliser: null,
		stabiliserLength: null,
		button: null,
		note: null
	};

	$scope.heading = $i18next('bow_plural');
	$scope.leftButton = {
		iconClass: 'fa-chevron-left',
		tap: function () {
			$navigate.back();
		}
	};

	$scope.isBowSelectPage = true;

	/**
	 * Counts the active bows (we can't use data.bows.length since deleted bows
	 * are only marked as disabled)
	 */
	function countActiveBows() {
		$scope.bowsAvailable = false;
		for (var i = 0; i < $scope.data.bows.length; i++) {
			if (!$scope.data.bows[i].disabled) {
				$scope.bowsAvailable = true;
				break;
			}
		}

		console.log($scope.bowsAvailable, (!$scope.bowsAvailable && !!$scope.data.bows));

	}

	/*
	 * Load neccassary data (bows an distances)
	 */
	$scope.data.requireData(['bows', 'distances']).then(function () {
		countActiveBows();
	});

	$scope.tap = function (bow) {

		$scope.selected = bow;

		if (!bow) {
			helper.tmpFormData.round.bowID = null;
		} else {
			helper.tmpFormData.round.bowID = bow.id;
		}

		$navigate.back();

	};

	$scope.isActive = function (bow) {
		return $scope.selected === bow;
	};


});
