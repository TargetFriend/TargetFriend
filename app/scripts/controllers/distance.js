angular.module('TFApp').controller('DistanceCtrl', function ($rootScope, $scope, $routeParams, $location, $navigate, $i18next) {

	'use strict';

	/*
	 * Set the sidebar items
	 */
	$rootScope.setSidebar('distances');
	/**
	 * Default distance Details
	 * @type {Object}
	 */
	$scope.distanceDetails = {
		name: '70m'
	};
	/**
	 * Whether we are currently saving the round or not
	 * @type {Boolean}
	 */
	$scope.isSaving = false;
	/**
	 * Whether the form page is in edit mode or not
	 * @type {Boolean}
	 */
	var isEditPage = !!$routeParams.distanceID;
	/**
	 * ID of the competition (used for edit-form-page).
	 * @type {Number}
	 */
	var distanceID = isEditPage ? parseInt($routeParams.distanceID, 10) : null;

	function init () {
		/*
		 * Check if we want to edit an existing distance or create a new one.
		 */
		if (isEditPage || $location.path().match(/(new)/)) {

			if (isEditPage) {
				/*
				 * Load distances and set the distance details, so the HTML form
				 * can use the data
				 */
				$scope.data.requireData(['distances']).then(function () {
					$scope.distanceDetails = $scope.data.distancesById[distanceID];
				});
			}

			$scope.heading = isEditPage ? $i18next('edit') : $i18next('new');

			$scope.leftButton = {
				name: 'back',
				tap: function () {
					$navigate.back();
				}
			};

		/*
		 * Well, it has to be the default distance list
		 */
		} else {
			/*
			 * Set form heading
			 */
			$scope.heading = $i18next('distance_plural');

			$scope.leftButton = {
				iconClass: 'fa-chevron-left',
				tap: function () {
					$scope.snapRemote.open('left');
				}
			};
			$scope.rightButton = {
				tap: function () {
					$navigate.go('distances/new', 'slide');
				}
			};
		}
	}

	/**
	 * Save an existing or a new distance.
	 * @param {Object} distanceData The (new) data of the distance
	 */
	$scope.save = function (distanceData) {

		if (!distanceData) {
			console.error('TF :: distances :: save :: not all fields are filled');
			return;
		}

		$scope.isSaving = true;

		if (!isEditPage) {

			add(distanceData);

		} else {

			edit(distanceData);

		}

	};
	/**
	 * Add a new distance
	 * @param {Object} distanceData Data of the distance we want to add
	 */
	var add = function (distanceData) {

		distanceData.dateStart = new Date();

		$scope.data.add('distances', [distanceData]).then(function (distance) {

			$scope.isSaving = false;
			$navigate.back();

			console.log('TF :: distances :: added', distance[0]);

		}, function (error) {
			console.error(error.msg);
		});

	};
	/**
	 * Edit an existing distance
	 * @param {Object} distanceData Data of the distance we want to edit
	 */
	var edit = function (distanceData) {

		$scope.data.update('distances', [distanceData]).then(function (distance) {

			$scope.isSaving = false;
			$navigate.back();

			console.log('TF :: distances :: edited', distance[0]);

		});

	};
	/**
	 * Remove a distance
	 * @param  {Number} id If of the distance we want to remove
	 */
	var remove = function (id) {

		$scope.helper.confirm($i18next('distancePage.deleteQuestionTitle'), $i18next('distancePage.deleteQuestionMsg'), function (index) {

			if (!index) {
				return;
			}

			var distanceData = $scope.data.distancesById[id];

			distanceData.disabled = true;

			$scope.data.update('distances', [distanceData]).then(function (removedId) {

				console.log('TF :: distances :: deleted', removedId[0]);

			});
		});

	};

	/**
	 * Gets called when we tap on a distance for a longer time.
	 * @param {Object} distance The distance
	 */
	$scope.taphold = function (distance) {
		/*
		 * Open a select menu
		 */
		$scope.openSelectmenu(distance.id);
	};
	/**
	 * Gets called if one taps on a distance
	 * @param {Object} distance The distance
	 */
	$scope.tap = function (distance) {
		$scope.selected = distance;
	};
	/**
	 * Checks if the distance is active (e.g. whether one has tapped on it)
	 * @param  {Object}  distance The distance
	 * @return {Boolean}          True if the distance is active
	 */
	$scope.isActive = function (distance) {
		return $scope.selected === distance;
	};
	/**
	 * Function to handle the select menu
	 * @param {String} type  Either 'delete' or 'edit'
	 * @param {Number} distanceID Id of the distance
	 */
	$scope.onSelectMenuTap = function (type, distanceID) {

		var actions = {
			edit: function () {
				/*
				 * Go to form page to edit the distance
				 */
				$navigate.go('distance/edit/' + distanceID);
			},
			delete: function () {
				/*
				 * Delete the bow
				 */
				remove(distanceID);
			}
		};

		/*
		 * Close the selectmenu
		 */
		$scope.closeSelectmenu();
		/*
		 * Now either remove a competition or go to the form page
		 */
		if (actions[type]) {
			actions[type]();
		}

	};

	init();

});
