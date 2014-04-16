angular.module('TFApp').controller('BowCtrl', function ($rootScope, $scope, $routeParams, $location, $navigate, $i18next) {

	'use strict';

	/*
	 * Set the sidebar items
	 */
	$rootScope.setSidebar('bows');
	/**
	 * Default bow Details
	 * @type {Object}
	 */
	$scope.bowDetails = {
		name: $i18next('myBow'),
		bowSize: '68"',
		riserSize: '25"',
		limbSize: 'medium'
	};
	/**
	 * Object containing alternative bow details
	 * @type {Object}
	 */
	$scope.bowDetailsAlt = {};
	/**
	 * All bow form items.
	 * @type {Object}
	 */
	$scope.formData = {
		name: null,
		bowSize: ['64"', '65"', '66"', '67"', '68"', '69"', '70"', '71"', '72"'],
		riser: null,
		riserSize: ['22"', '23"', '24"', '25"', '26"', '27"', '28"', '29"', '30"'],
		limbs: null,
		limbSize: ['small', 'medium', 'large'],
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
	/**
	 * Whether the bow is currently being saved or not.
	 * @type {Boolean}
	 */
	$scope.isSaving = false;
	/**
	 * Whether the form page is in edit mode or not
	 * @type {Boolean}
	 */
	var isEditPage = !!$routeParams.bowID;
	/**
	 * ID of the bow (used for edit-form-page).
	 * @type {Number}
	 */
	var bowID = isEditPage ? parseInt($routeParams.bowID, 10) : null;

	function init() {

		/*
		 * Check if we want to edit an existing bow or create a new one.
		 */
		if (isEditPage || $location.path().match(/(new)/)) {

			$scope.bowMarkerID = isEditPage ? bowID : 'new';

			if (isEditPage) {
				/*
				 * Load bows and set the bow details, so the HTML form
				 * can use the data
				 */
				$scope.data.requireData(['bows']).then(function () {
					$scope.bowDetails = $scope.data.bowsById[bowID];
				});

			} else {

				if ($scope.helper.tmpFormData.bow) {
					$scope.bowDetails = angular.copy($scope.helper.tmpFormData.bow);
				} else {
					$scope.setHelperFormData();
				}

			}
			/*
			 * Set form heading
			 */
			$scope.heading = isEditPage ? $i18next('edit') : $i18next('new');
			/*
			 * Set left button
			 */
			$scope.leftButton = {
				tap: function () {
					$navigate.back();
				}
			};

		/*
		 * Well, it has to be the default bow list
		 */
		} else {

			/*
			 * Set form heading
			 */
			$scope.heading = $i18next('bow_plural');

			$scope.leftButton = {
				iconClass: 'fa-bars',
				tap: function () {
					$scope.snapRemote.open('left');
				}
			};
			$scope.rightButton = {
				tap: function () {
					$navigate.go('bows/new', 'slide');
				}
			};
			/*
			 * Load neccassary data (bows an distances)
			 */
			$scope.data.requireData(['bows', 'distances']).then(function () {
				countActiveBows();
			});

		}
	}
	/**
	 * Counts the active bows (we can't use data.bows.length since removed bows
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

		console.log('TF :: bows :: bows available: ' + $scope.bowsAvailable);

	}
	/**
	 * Saves the bow data when going to the bowsight markers page
	 */
	$scope.setHelperFormData = function () {
		var markers = $scope.helper.tmpFormData.bow ? $scope.helper.tmpFormData.bow.markers : [];
		$scope.helper.tmpFormData.bow = angular.copy($scope.bowDetails);
		$scope.helper.tmpFormData.bow.markers = markers;
	};

	/**
	 * Save an existing or a new bow.
	 * @param {Object} bowData The (new) data of the bow
	 */
	$scope.save = function (bowData) {

		if (!bowData) {
			console.error('TF :: bows :: save :: no data! internal error');
			return;
		}

		$scope.isSaving = true;

		if (!isEditPage) {
			add(bowData);
		} else {
			edit(bowData);
		}
		/*
		 * Reset the temporary bow data after saving the bow
		 */
		$scope.helper.tmpFormData.bow = null;

	};
	/**
	 * Adds a new bow
	 * @param {Object} bowData Data of the bow we want to add
	 */
	var add = function (bowData) {

		if (!bowData.bowSize) {
			bowData.bowSize = $scope.bowDetailsAlt.bowSize || null;
		}
		if (!bowData.riserSize) {
			bowData.riserSize = $scope.bowDetailsAlt.riserSize || null;
		}
		if (!bowData.limbSize) {
			bowData.limbSize = $scope.bowDetailsAlt.limbSize || null;
		}

		bowData.dateStart = new Date();
		bowData.markers = $scope.helper.tmpFormData.bow ?
			$scope.helper.tmpFormData.bow.markers : [];

		$scope.data.add('bows', [bowData]).then(function (bows) {

			$scope.isSaving = false;
			$navigate.back();

			console.log('TF :: bows :: added', bows[0]);

		}, function (error) {
			console.error(error.msg);
		});

	};
	/**
	 * Edit an existing bow
	 * @param {Object} bowData Data of the bow we want to edit
	 */
	var edit = function (bowData) {

		$scope.data.update('bows', [bowData]).then(function (bow) {

			$scope.isSaving = false;
			$navigate.back();

			console.log('TF :: bows :: edited', bow[0]);

		});

	};
	/**
	 * Remove a bow
	 * @param  {Number} id If of the bow we want to remove
	 */
	var remove = function (id) {

		$scope.helper.confirm($i18next('bowPage.deleteQuestionTitle'), $i18next('bowPage.deleteQuestionMsg'), function (index) {

			if (!index) {
				return;
			}

			var bowData = $scope.data.bowsById[id];

			bowData.disabled = true;

			$scope.data.update('bows', [bowData]).then(function (removed) {

				countActiveBows();

				console.log('TF :: bows :: deleted', removed);

				if (!$scope.$$phase) {
					$scope.$digest();
				}

			});

		});

	};

	/**
	 * Gets called when we tap on a bow for a longer time.
	 * @param {Object} bow The bow
	 */
	$scope.taphold = function (bow) {
		/*
		 * Open a select menu
		 */
		$scope.openSelectmenu(bow.id);
	};
	/**
	 * Gets called if one taps on a bow
	 * @param {Object} bow The bow
	 */
	$scope.tap = function (bow) {
		$scope.selected = bow;
	};
	/**
	 * Checks if the bow is active (e.g. whether one has tapped on it)
	 * @param  {Object}  bow The bow
	 * @return {Boolean}     True if the bow is active
	 */
	$scope.isActive = function (bow) {
		return $scope.selected === bow;
	};
	/**
	 * Function to handle the select menu
	 * @param {String} type  Either 'delete' or 'edit'
	 * @param {Number} bowID Id of the bow
	 */
	$scope.onSelectMenuTap = function (type, bowID) {

		var actions = {
			edit: function () {
				/*
				 * Go to form page to edit the bow
				 */
				$navigate.go('bow/edit/' + bowID);
			},
			delete: function () {
				/*
				 * Delete the bow
				 */
				remove(bowID);
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
