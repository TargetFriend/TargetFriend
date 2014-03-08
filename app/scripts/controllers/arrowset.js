angular.module('TFApp').controller('ArrowsetCtrl', function ($rootScope, $scope, $routeParams, $location, $navigate, $i18next) {

	'use strict';

	/*
	 * Set the sidebar items
	 */
	$rootScope.setSidebar('arrowsets');
	/**
	 * Default arrowset Details
	 * @type {Object}
	 */
	$scope.arrowsetDetails = {
		name: $i18next('myArrowset'),
		arrowMaterial: $i18next('carbon')
	};
	/**
	 * Object containing alternative arrowset details
	 * @type {Object}
	 */
	$scope.arrowsetDetailsAlt = {};
	/**
	 * All arrowset form items.
	 * @type {Object}
	 */
	$scope.formData = {
		name: null,
		arrowMaterial: [$i18next('aluminium'), $i18next('carbon'), $i18next('wood')]
	};
	/**
	 * Whether the arrowset is currently being saved or not.
	 * @type {Boolean}
	 */
	$scope.isSaving = false;
	/**
	 * Whether the form page is in edit mode or not
	 * @type {Boolean}
	 */
	var isEditPage = !!$routeParams.arrowsetID;
	/**
	 * ID of the arrowset (used for edit-form-page).
	 * @type {Number}
	 */
	var arrowsetID = isEditPage ? parseInt($routeParams.arrowsetID, 10) : null;

	function init() {

		/*
		 * Check if we want to edit an existing arrowset or create a new one.
		 */
		if (isEditPage || $location.path().match(/(new)/)) {

			$scope.arrowsetMarkerID = isEditPage ? arrowsetID : 'new';

			if (isEditPage) {
				/*
				 * Load arrowsets and set the arrowset details, so the HTML form
				 * can use the data
				 */
				$scope.data.requireData(['arrowsets']).then(function () {
					$scope.arrowsetDetails = $scope.data.arrowsetsById[arrowsetID];
				});

			} else {

				if ($scope.helper.tmpFormData.arrowset) {
					$scope.arrowsetDetails = angular.copy($scope.helper.tmpFormData.arrowset);
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
		 * Well, it has to be the default arrowset list
		 */
		} else {

			/*
			 * Set form heading
			 */
			$scope.heading = $i18next('arrowset_plural');

			$scope.leftButton = {
				iconClass: 'fa-reorder',
				tap: function () {
					$scope.snapRemote.open('left');
				}
			};
			$scope.rightButton = {
				tap: function () {
					$navigate.go('arrowsets/new', 'slide');
				}
			};
			/*
			 * Load neccassary data (arrowsets an distances)
			 */
			$scope.data.requireData(['arrowsets', 'distances']).then(function () {
				countActiveArrowsets();
			});

		}
	}
	/**
	 * Counts the active arrowsets (we can't use data.arrowsets.length since removed arrowsets
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

		console.log('TF :: arrowsets :: arrowsets available: ' + $scope.arrowsetsAvailable);

	}
	/**
	 * Saves the arrowset data when going to the arrowsetsight markers page
	 */
	$scope.setHelperFormData = function () {
		var markers = $scope.helper.tmpFormData.arrowset ? $scope.helper.tmpFormData.arrowset.markers : [];
		$scope.helper.tmpFormData.arrowset = angular.copy($scope.arrowsetDetails);
		$scope.helper.tmpFormData.arrowset.markers = markers;
	};

	/**
	 * Save an existing or a new arrowset.
	 * @param {Object} arrowsetData The (new) data of the arrowset
	 */
	$scope.save = function (arrowsetData) {

		if (!arrowsetData) {
			console.error('TF :: arrowsets :: save :: no data! internal error');
			return;
		}

		$scope.isSaving = true;

		if (!isEditPage) {
			add(arrowsetData);
		} else {
			edit(arrowsetData);
		}
		/*
		 * Reset the temporary arrowset data after saving the arrowset
		 */
		$scope.helper.tmpFormData.arrowset = null;

	};
	/**
	 * Adds a new arrowset
	 * @param {Object} arrowsetData Data of the arrowset we want to add
	 */
	var add = function (arrowsetData) {

		if (!arrowsetData.arrowsetSize) {
			arrowsetData.arrowsetSize = $scope.arrowsetDetailsAlt.arrowsetSize || null;
		}
		if (!arrowsetData.riserSize) {
			arrowsetData.riserSize = $scope.arrowsetDetailsAlt.riserSize || null;
		}
		if (!arrowsetData.limbSize) {
			arrowsetData.limbSize = $scope.arrowsetDetailsAlt.limbSize || null;
		}

		arrowsetData.dateStart = new Date();
		arrowsetData.markers = $scope.helper.tmpFormData.arrowset ?
			$scope.helper.tmpFormData.arrowset.markers : [];

		$scope.data.add('arrowsets', [arrowsetData]).then(function (arrowsets) {

			$scope.isSaving = false;
			$navigate.back();

			console.log('TF :: arrowsets :: added', arrowsets[0]);

		}, function (error) {
			console.error(error.msg);
		});

	};
	/**
	 * Edit an existing arrowset
	 * @param {Object} arrowsetData Data of the arrowset we want to edit
	 */
	var edit = function (arrowsetData) {

		$scope.data.update('arrowsets', [arrowsetData]).then(function (arrowset) {

			$scope.isSaving = false;
			$navigate.back();

			console.log('TF :: arrowsets :: edited', arrowset[0]);

		});

	};
	/**
	 * Remove a arrowset
	 * @param  {Number} id If of the arrowset we want to remove
	 */
	var remove = function (id) {

		$scope.helper.confirm($i18next('arrowsetPage.deleteQuestionTitle'), $i18next('arrowsetPage.deleteQuestionMsg'), function (index) {

			if (!index) {
				return;
			}

			var arrowsetData = $scope.data.arrowsetsById[id];

			arrowsetData.disabled = true;

			$scope.data.update('arrowsets', [arrowsetData]).then(function (removed) {

				countActiveArrowsets();

				console.log('TF :: arrowsets :: deleted', removed);

				if (!$scope.$$phase) {
					$scope.$digest();
				}

			});

		});

	};

	/**
	 * Gets called when we tap on a arrowset for a longer time.
	 * @param {Object} arrowset The arrowset
	 */
	$scope.taphold = function (arrowset) {
		/*
		 * Open a select menu
		 */
		$scope.openSelectmenu(arrowset.id);
	};
	/**
	 * Gets called if one taps on a arrowset
	 * @param {Object} arrowset The arrowset
	 */
	$scope.tap = function (arrowset) {
		$scope.selected = arrowset;
	};
	/**
	 * Checks if the arrowset is active (e.g. whether one has tapped on it)
	 * @param  {Object}  arrowset The arrowset
	 * @return {Boolean}     True if the arrowset is active
	 */
	$scope.isActive = function (arrowset) {
		return $scope.selected === arrowset;
	};
	/**
	 * Function to handle the select menu
	 * @param {String} type  Either 'delete' or 'edit'
	 * @param {Number} arrowsetID Id of the arrowset
	 */
	$scope.onSelectMenuTap = function (type, arrowsetID) {

		var actions = {
			edit: function () {
				/*
				 * Go to form page to edit the arrowset
				 */
				$navigate.go('arrowset/edit/' + arrowsetID);
			},
			delete: function () {
				/*
				 * Delete the arrowset
				 */
				remove(arrowsetID);
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
