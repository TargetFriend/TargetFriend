angular.module('TFApp').controller('BowMarkerCtrl', function ($scope, $routeParams, $navigate, $i18next) {

	'use strict';

	/**
	 * Contains the markers sorted by the id of the distance
	 * @type {Array}
	 */
	$scope.markersById = [];

	var isEditPage = !!$routeParams.bowID,
		bowDetails;

	function init() {

		$scope.heading = isEditPage ? $i18next('edit') : $i18next('bow_plural');

		$scope.leftButton = {
			iconClass: 'fa-chevron-left',
			tap: function () {
				$navigate.back();
			}
		};

		if (!isEditPage && $scope.helper.tmpFormData.bow && $scope.helper.tmpFormData.bow.markers) {
			setMarkers($scope.helper.tmpFormData.bow.markers);
		}

		$scope.data.requireData(['bows', 'distances']).then(function () {

			if (isEditPage) {

				bowDetails = $scope.data.bowsById[$routeParams.bowID];

				setMarkers(bowDetails);

				setActiveDistances();

			} else {

				setActiveDistances();

			}

		});
	}

	/**
	 * Creates an array containing only the active (and not disabled) distances
	 */
	function setActiveDistances() {

		$scope.activeDistances = [];

		for (var i = 0; i < $scope.data.distances.length; i++) {
			if (!$scope.data.distances[i].disabled) {
				$scope.activeDistances[i] = $scope.data.distances[i];
			}
		}

	}

	/**
	 * Sets the markersById array
	 */
	function setMarkers(bow) {

		var markers = bow.markers || [];

		for (var i = 0; i < markers.length; i++) {
			if (markers[i]) {
				$scope.markersById[markers[i].distanceID] = markers[i].position;
			}
		}

	}

	/**
	 * Saves the bowsightmarkers
	 * @param {Array} data The markers
	 */
	$scope.save = function (data) {

		data = data || [];

		var markers = [],
			i;

		for (i = 0; i < data.length; i++) {
			if (data[i]) {
				markers[markers.length] = {
					distanceID: i,
					position: data[i]
				};
			}
		}

		if (isEditPage) {

			bowDetails.markers = markers;

			/*
			 * Update the bow and go back to the previous page
			 */
			$scope.data.update('bows', [bowDetails]).then(function (bow) {

				$scope.$apply(function () {

					$navigate.back();

				});

				console.log('TF :: bows :: set markers', bow[0]);

			});


		} else {

			$scope.helper.tmpFormData.bow.markers = markers;

			$navigate.back();

		}

	};

	init();

});
