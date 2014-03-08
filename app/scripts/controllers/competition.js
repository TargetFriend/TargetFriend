angular.module('TFApp').controller('CompetitionCtrl', function ($rootScope, $scope, $routeParams, $location, $navigate, helper, $i18next) {

	'use strict';

	/**
	 * Whether we want to save the competition as default
	 * @type {Boolean}
	 */
	$scope.isCompetitionDefaultsPage = ($location.path() === ('/settings/competitionDefaults') || $location.path() === ('/settings/competitionDefaults/'));
	/**
	 * Whether we are currently saving the round or not
	 * @type {Boolean}
	 */
	$scope.isSaving = false;
	/*
	 * Set the sidebar items
	 */
	$rootScope.setSidebar('competitions');
	/**
	 * Default competition Details
	 * @type {Object}
	 */
	$scope.competitionDetails = {
		points: 0,
		tagIDs: null
	};
	/**
	 * Current pattern name. Default is that no pattern is selected
	 * @type {String}
	 */
	$scope.curPatternName = 'noPattern';
	/**
	 * Whether the form page is in edit mode or not
	 * @type {Boolean}
	 */
	var isEditPage = $scope.isEditPage = !!$routeParams.competitionID;
	/**
	 * ID of the competition (used for edit-form-page).
	 * @type {Number}
	 */
	var competitionID = isEditPage ? parseInt($routeParams.competitionID, 10) : null;

	function init() {

		$scope.competitionDetails = angular.extend($scope.competitionDetails, $scope.data.settings[0].competitionDefaults);
		$scope.competitionTags = $scope.data.settings[0].competitionTags;

		if ($scope.isCompetitionDefaultsPage) {

			$scope.heading = $i18next('settingsPage.defaults');

			$scope.leftButton = {
				name: 'back',
				iconClass: 'icon-chevron-left',
				tap: function () {
					$navigate.back();
				}
			};

		} else if (isEditPage || $location.path().match(/(new)/)) {

			if (isEditPage) {
				/*
				 * Load competitions and set the competition details, so the HTML form
				 * can use the data
				 */
				$scope.data.requireData(['competitions']).then(function () {
					$scope.competitionDetails = $scope.data.competitionsById[competitionID];
				});

			} else {

				if (helper.tmpFormData.competition) {
					$scope.competitionDetails = angular.copy(helper.tmpFormData.competition);
				} else {
					$scope.setHelperFormData();
				}

			}

			/*
			 * Set form heading
			 */
			$scope.heading = isEditPage ? $i18next('competitionPage.editHeading') : $i18next('competitionPage.addHeading');
			/*
			 * Set left button
			 */
			$scope.leftButton = {
				iconClass: 'icon-chevron-left',
				tap: function () {
					$navigate.back();
				}
			};

		} else {

			/*
			 * Set form heading
			 */
			$scope.heading = $i18next('competition_plural');

			$scope.leftButton = {
				iconClass: 'fa-chevron-left',
				tap: function () {
					$scope.snapRemote.open('left');
				}
			};
			$scope.rightButton = {
				iconClass: 'fa-plus',
				tap: function () {
					$navigate.go('competitions/new');
				}
			};

		}

	}

	/**
	 * Saves the data of the form. Needed for e.g. setting a bow or distance.
	 */
	$scope.setHelperFormData = function () {
		helper.tmpFormData.competition = angular.copy($scope.competitionDetails);
	};

	/**
	 * Save an existing or a new competition.
	 * @param {Object} competitionData The (new) data of the competition
	 */
	$scope.save = function (competitionData) {

		if (!competitionData) {
			console.error('TF :: competitions :: save :: no data! internal error');
			return;
		}

		$scope.isSaving = true;

		if (!angular.isArray(competitionData.tagIDs)) {
			competitionData.tagIDs = null;
		}

		if ($scope.isCompetitionDefaultsPage) {
			saveCompetitionAsDefault(competitionData);
		} else if (!isEditPage) {
			add(competitionData);
		} else {
			edit(competitionData);
		}

		helper.tmpFormData.competition = null;

	};

	var saveCompetitionAsDefault = function (data) {

		$scope.data.settings[0].competitionDefaults = data;

		$scope.data.update('settings', $scope.data.settings).then(function (settings) {

			$scope.$apply(function () {
				$navigate.back();
			});

			console.log('TF :: settings :: saved competitionDefaults', settings);

		});
	};

	/**
	 * Add a new competition
	 * @param {Object} competitionData Data of the competition we want to add
	 */
	var add = function (competitionData) {

		competitionData.dateStart = new Date();

		if (competitionData.patternID) {

			var patternRounds = $scope.data.patternById[competitionData.patternID].rounds;

			for (var i = 0; i < patternRounds.length; i++) {
				patternRounds[i].dateStart = new Date();
				patternRounds[i].enabled = true;
				patternRounds[i].ends = helper.createEmptyArrows(patternRounds[i].endNumber, patternRounds[i].arrowNumber);
			}

			competitionData.roundsById = patternRounds;
			competitionData.roundNumber = patternRounds.length;

		} else {

			competitionData.roundsById = [];
			competitionData.roundNumber = 0;

		}

		$scope.data.add('competitions', [competitionData]).then(function (competition) {

			$scope.isSaving = false;
			/*
			 * Change hash and page
			 */
			$navigate.go('competition/' + competition[0].id);

			console.log('TF :: competitions :: added', competition[0]);

		}, function (error) {
			console.error(error.msg);
		});

	};
	/**
	 * Edit an existing competition
	 * @param {Object} competitionData Data of the competition we want to edit
	 */
	var edit = function (data) {

		$scope.data.update('competitions', [data]).then(function (competition) {

			$scope.isSaving = false;
			$navigate.back();

			console.log('TF :: competitions :: edited', competition[0]);

		});

	};
	/**
	 * Remove a competition
	 * @param  {Number} id If of the competition we want to remove
	 */
	var remove = function (id) {

		helper.confirm($i18next('competitionPage.deleteQuestionTitle'), $i18next('competitionPage.deleteQuestionMsg'), function (index) {

			if (!index) { return; }

			$scope.data.remove('competitions', [id]).then(function (removedId) {
				console.log('TF :: competitions :: deleted', removedId[0]);
				$scope.$broadcast('refreshItems');
			});

		});

	};
	/**
	 * Gets called when we tap on a competition for a longer time.
	 * @param {Object} competition The competition
	 */
	$scope.taphold = function (competition) {
		/*
		 * Open a select menu
		 */
		$scope.openSelectmenu(competition.id);
	};
	/**
	 * Gets called if one taps on a competition
	 * @param {Object} competition The competition
	 */
	$scope.tap = function (competition) {
		$scope.selected = competition;
		$navigate.go('competition/' + competition.id);
	};
	/**
	 * Checks if the competition is active (e.g. whether one has tapped on it)
	 * @param  {Object}  competition The competition
	 * @return {Boolean}             True if the competition is active
	 */
	$scope.isActive = function (competition) {
		return $scope.selected === competition;
	};
	/**
	 * Function to handle the select menu
	 * @param {String} type          Either 'delete' or 'edit'
	 * @param {Number} competitionID Id of the competition
	 */
	$scope.onSelectMenuTap = function (type, competitionID) {

		var actions = {
			edit: function () {
				/*
				 * Go to form page to edit the competition
				 */
				$navigate.go('competition/edit/' + competitionID);

			},
			delete: function () {
				/*
				 * Delete the competition
				 */
				remove(competitionID);
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

	$scope.data.requireData(['settings']).then(function () {
		init();
	});

});
