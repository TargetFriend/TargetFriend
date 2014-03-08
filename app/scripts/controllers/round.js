angular.module('TFApp').controller('RoundCtrl', function ($rootScope, $scope, $routeParams, $location, $navigate, $i18next) {

	'use strict';

	var setRoundDefaultsPage = false;

	if ($location.path() === ('/settings/roundDefaults') || $location.path() === ('/settings/roundDefaults/')) {
		setRoundDefaultsPage = true;
	} else if (!$routeParams.competitionID) {
		$navigate.go('competitions');
		return;
	}

	var helper = $scope.helper;

	$scope.$navigate = $navigate;
	$scope.$i18next = $i18next;
	/*
	 * Set the sidebar items
	 */
	$rootScope.setSidebar();

	var competitionID = $scope.competition = parseInt($routeParams.competitionID, 10);

	$scope.roundDetails = {
		points: 0,
		endNumber: 6,
		arrowNumber: 6,
		outdoor: 1,
		compound: 0,
		arrownumbers: 0,
		weather: $i18next('sunny'),
		windspeed: $i18next('noWind'),
		winddirection: $i18next('tailwind'),
		light: $i18next('normal'),
		targetNumber: 1,
		distanceID: 2,
		targetFaceID: 1,
		showArrowNumbers: 0,
		targetScale: 1
	};

	$scope.formData = {
		name: null,
		note: null,
		endNumber: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
		arrowNumber: [3, 5, 6, 8, 10, 12, 14, 15],
		outdoor: [
			{value: 0, name: $i18next('Indoor')},
			{value: 1, name: $i18next('Outdoor')}
		],
		compound: [
			{value: 0, name: $i18next('no')},
			{value: 1, name: $i18next('yes')}
		],
		arrownumbers: [
			{value: 0, name: $i18next('no')},
			{value: 1, name: $i18next('yes')}
		],
		weather: [
			$i18next('storm'),
			$i18next('rain'),
			$i18next('cloudy'),
			$i18next('sunny')
		],
		windspeed: [
			$i18next('breeze'),
			$i18next('noWind'),
			$i18next('windy'),
			$i18next('strongWind')
		],
		winddirection: [
			$i18next('tailwind'),
			$i18next('againstwind'),
			$i18next('crosswind'),
			$i18next('crosswindLeft'),
			$i18next('crosswindRight')
		],
		light: [
			$i18next('normal'),
			$i18next('blinding'),
			$i18next('blindingMildly'),
			$i18next('blindingStrong')
		],
		showArrowNumbers: [
			{value: 0, name: $i18next('no')},
			{value: 1, name: $i18next('yes')}
		],
		targetNumber: [1, 2, 3, 4, 5, 6],
		targetScale: [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.2, 1.3, 1.4]
	};

	$scope.markers = [];
	$scope.isSaving = false;


	/**
	 * Whether the form is in edit mode
	 * @type {Boolean}
	 */
	var isEditPage = $scope.isEditPage = !!$routeParams.roundID;
	/**
	 * The id of the current round
	 * @type {Number}
	 */
	var roundID = isEditPage ? parseInt($routeParams.roundID, 10) : null;

	function init() {

		$scope.roundDetails = angular.extend($scope.roundDetails, $scope.data.settings[0].roundDefaults);

		if (setRoundDefaultsPage || isEditPage || $location.path().match(/(new)/)) {

			if (isEditPage) {

				$scope.competitionDetails = $scope.data.competitionsById[competitionID];
				$scope.roundDetails = $scope.competitionDetails.roundsById[roundID];

			}

			if (helper.tmpFormData.round) {
				$scope.roundDetails = angular.copy(helper.tmpFormData.round);
			} else {
				$scope.setHelperFormData();
			}

			$scope.heading = setRoundDefaultsPage ? $i18next('settingsPage.defaults') : (isEditPage ? $i18next('edit') : $i18next('new'));
			$scope.leftButton = {
				name: 'back',
				iconClass: 'icon-chevron-left',
				tap: function () {
					$navigate.back();
				}
			};

		} else {

			// Round list

			if (!($scope.data.competitionsById && $scope.data.competitionsById[competitionID]) ||
				$scope.data.bowsById || $scope.data.distancesById) {

				window.showLoader(true);

				$scope.data.requireData(['competitions', 'bows', 'distances']).then(function () {
					$scope.competitionDetails = $scope.data.competitionsById[competitionID];
					setCurRounds();
					window.showLoader(false);
				});

			} else {
				$scope.competitionDetails = $scope.data.competitionsById[competitionID];
				setCurRounds();
			}

			$scope.heading = $i18next('round_plural');
			$scope.leftButton = {
				name: 'back',
				iconClass: 'icon-chevron-left',
				tap: function () {
					$navigate.back();
				}
			};
			$scope.rightButton = {
				name: 'new',
				tap: function () {
					$navigate.go('competition/' + competitionID + '/new', 'slide');
				}
			};

		}
	}

	/**
	 * Sets data for the current rounds. E.g. it adds the bosightmarkers
	 */
	function setCurRounds () {


		var curRoundsById = $scope.data.competitionsById[competitionID].roundsById || [],
			curRounds = [],
			j = 0;

		$scope.roundTargetNames = [];

		for (var i = 0; i < curRoundsById.length; i++) {

			if (curRoundsById[i]) {

				curRounds[j] = curRoundsById[i];

				var round = curRounds[j] || {},
					bow = $scope.data.bowsById[round.bowID] || {};

				if (bow.markers) {
					for (var j = 0; j < bow.markers.length; j++) {
						if (parseInt(bow.markers[j].distanceID, 10) === parseInt(round.distanceID, 10)) {
							$scope.markers[round.id] = bow.markers[j];
						}
					}
				}

				j++;

			}

		}

		$scope.curRounds = curRounds;

	}

	/**
	 * Saves the data of the form. Needed for e.g. setting a bow or distance.
	 */
	$scope.setHelperFormData = function () {
		helper.tmpFormData.round = angular.copy($scope.roundDetails);
	};

	/**
	 * Saves the new or edited round to the competition or as default prameters.
	 * @param  {Object} data The data of the round
	 */
	$scope.save = function (data) {

		if (!data) {
			console.error('TF :: rounds :: save :: not all fields are filled');
			return;
		}

		$scope.isSaving = true;

		if (setRoundDefaultsPage) {
			saveRoundAsDefault(data);
		} else if (!isEditPage) {
			add(data);
		} else {
			edit(data);
		}

		helper.tmpFormData.round = null;

	};

	var saveRoundAsDefault = function (data) {

		$scope.data.settings[0].roundDefaults = data;

		$scope.data.update('settings', $scope.data.settings).then(function (settings) {

			$scope.$apply(function () {
				$navigate.back();
			});

			console.log('TF :: settings :: saved roundDefaults', settings);

		});
	};

	/**
	 * Adds a new round to the competition
	 * @param {Object} roundData Data of the new round.
	 */
	var add = function (roundData) {

		var competitionData = $scope.data.competitionsById[competitionID];

		roundData.id = competitionData.roundsById.length;

		roundData.dateStart = new Date();
		roundData.competitionID = competitionID;
		roundData.enabled = true;
		roundData.ends = helper.createEmptyArrows(roundData.endNumber, roundData.arrowNumber);

		if (!roundData.outdoor) {
			roundData.weather = null;
			roundData.windspeed = null;
			roundData.winddirection = null;
		} else if (roundData.windspeed === $i18next('noWind')) {
			roundData.winddirection = null;
		}

		if (!roundData.targetFaceID) {
			roundData.targetNumber = null;
			roundData.compound = 0;
		}

		competitionData.roundNumber++;
		competitionData.roundsById[competitionData.roundsById.length] = roundData;

		$scope.data.update('competitions', [competitionData]).then(function (competition) {

			$scope.isSaving = false;
			$navigate.back();

			console.log('TF :: rounds :: added', competition[0].roundsById[roundData.id]);

		});

	};

	/**
	 * Saves the edited round to the competition.
	 * @param  {Object} data Data of the round.
	 */
	var edit = function (roundData) {

		var competition = $scope.data.competitionsById[competitionID];

		if (!roundData.outdoor) {
			roundData.weather = null;
			roundData.windspeed = null;
			roundData.winddirection = null;
		} else if (roundData.windspeed === $i18next('noWind')) {
			roundData.winddirection = null;
		}

		competition.roundsById[$routeParams.roundID] = roundData;

		$scope.data.update('competitions', [competition]).then(function (competition) {

			$scope.isSaving = false;
			$navigate.back();

			console.log('TF :: rounds :: edited', competition);

		});

	};

	/**
	 * Removes a round from the competition.
	 * @param  {Integer} id Id of the round in the current competition.
	 */
	var remove = function (id) {

		$scope.helper.confirm($i18next('roundPage.deleteQuestionTitle'), $i18next('roundPage.deleteQuestionMsg'), function (index) {

			if (!index) {
				return;
			}

			var competition = $scope.data.competitionsById[competitionID],
				newRoundArray = [],
				i;

			for (i = 0; i < competition.roundsById.length; i++) {

				if (competition.roundsById[i] && competition.roundsById[i].id !== id) {
					newRoundArray[i] = competition.roundsById[i];
				}

			}

			$scope.data.competitionsById[competitionID].roundNumber--;
			$scope.data.competitionsById[competitionID].roundsById = newRoundArray;

			$scope.data.update('competitions', [competition]).then(function (competition) {

				console.log('TF :: rounds :: removed round', competition);

				setCurRounds();

				if (!$scope.$$phase) {
					$rootScope.$digest();
				}

			});

		});

	};


	$scope.taphold = function (round) {
		var items = [];

		if (round.bowID) {

			items[items.length] = {
				id: 'showBow',
				name: $i18next('showBow')
			};

		}

		$scope.openSelectmenu(round.id, {
			items: items
		});

	};

	$scope.tap = function (round) {
		$scope.selected = round;
		$navigate.go('round/' + competitionID + '/' + round.id);
	};

	$scope.isActive = function (round) {
		return $scope.selected === round;
	};

	$scope.onSelectMenuTap = function (type, roundID) {

		var actions = {
			edit: function () {
				/*
				 * Edit the round
				 */
				$navigate.go('competition/' + competitionID + '/edit/' + roundID);
			},
			delete: function () {
				remove(roundID);
			},
			showBow: function () {
				$navigate.go('bows');
			}
		};

		$scope.closeSelectmenu();

		if (actions[type]) {
			actions[type]();
		}

	};

	$scope.data.requireData(['settings', 'competitions']).then(function () {
		init();
	});

});
