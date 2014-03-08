angular.module('TFApp').controller('ShootingPaperCtrl', function ($rootScope, $scope, $routeParams, $navigate, $timeout, helper) {

	'use strict';

	if (!$routeParams.competitionID || !$routeParams.roundID) {
		$navigate.go('competitions');
		return;
	}

	/**
	 * Height of the statistic target face. Height and width are
	 * the same because it is a square.
	 *
	 * @type {Number}
	 */
	$scope.targetHeight = window.innerWidth;
	/**
	 * Statistic chart data and options
	 *
	 * @type {Object}
	 */
	$scope.chart = {
		data: [],
		options: []
	};
	/**
	 * Left button properties
	 * @type {Object}
	 */
	$scope.leftButton = {
		name: 'back',
		tap: function () {
			$scope.snapRemote.open('left');
		}
	};

	var /**
		 * Whether the device uses touch or not.
		 */
		isTouch = true,
		/* Whether to use a target face (default) or just
		 * write down the rings
		 *
		 * @type {Boolean}
		 */
		isTargetFaceMode = true,
		/**
		 * Id of the current competition. Also required in scope.
		 *
		 * @type {Number}
		 */
		competitionID = $scope.competitionID = parseInt($routeParams.competitionID, 10),
		/**
		 * Id of the current round. Also required in scope.
		 *
		 * @type {Number}
		 */
		roundID = $scope.roundID = parseInt($routeParams.roundID, 10),
		/**
		 * Whether we're using compound scoring or not. If true,
		 * `X` becomes `10` and `10` becomes `9`
		 *
		 * @type {Boolean}
		 */
		isCompound = false,
		/**
		 * Ends (and arrows) of the current round to show on the statistik target
		 * @type {Array}
		 */
		targetEnds = [],
		/**
		 * Array containing the target faces.
		 * @type {Array}
		 */
		targetFaceList = [],
		/**
		 * The maximal ring a archer can shoot. Default is 10. Is set later in init()
		 * @type {Number}
		 */
		maxRing = 10,
		/**
		 * Number of arrows in the current round. Arrows per end * number of ends.
		 * @type {Number}
		 */
		maxArrowNumber,
		/**
		 * Break the shootingpaper line after `x` arrows
		 * @type {Number}
		 */
		breakAfter,
		targetModeChangeTimeout = 350;
	/**
	 * Array of ends which are hidden on the target
	 * @type {Array}
	 */
	$scope.paperTargetHiddenEnds = [];
	/**
	 * Array of arrows which are hidden on the target
	 * @type {Array}
	 */
	$scope.paperTargetHiddenArrows = [];
	/**
	 * Whether the standard deviation is shown
	 * @type {Boolean}
	 */
	$scope.isStandardDeviationVisible = true;
	/**
	 * Array containing the points in a round until each end.
	 *
	 * @type {Array}
	 */
	$scope.roundPoints = [];
	/**
	 * Contains points of each end.
	 *
	 * @type {Array}
	 */
	$scope.endPoints = [];
	/**
	 * Initializes the shootingpaper page
	 */
	function init() {
		/**
		 * Current competition
		 * @type {Object}
		 */
		$scope.competition = $scope.data.competitionsById[competitionID];
		/**
		 * Current round
		 * @type {Object}
		 */
		$scope.round = $scope.data.competitionsById[competitionID].roundsById[roundID];

		isTargetFaceMode = $scope.isTargetFaceMode = !!$scope.round.targetFaceID;
		maxArrowNumber = $scope.round.endNumber * $scope.round.arrowNumber;

		/**
		 * When using a target face, set some variables
		 */
		if (isTargetFaceMode) {
			var /**
				 * Targetface object of current round
				 * @type {Object}
				 */
				roundTargetFace = $scope.data.targetFacesById[$scope.round.targetFaceID],
				/**
				 * archerTarget.js data of current target
				 * @type {Object}
				 */
				targetFaceData = ArcherTarget.getTarget(roundTargetFace.targetName);

			maxRing = helper.ringToNumber(false, targetFaceData.rating[targetFaceData.rating.length - 1]);

		}

		$scope.maxPoints = $scope.round.endNumber * $scope.round.arrowNumber * maxRing;
		isCompound = $scope.isCompound = !!parseInt($scope.round.compound, 10);

		setSidebar();

		switch ($scope.round.arrowNumber) {
		case 4:
		case 8:
			breakAfter = 4;
			break;
		case 5:
		case 10:
			breakAfter = 5;
			break;
		default:
			breakAfter = 3;
		}

		/**
		 * Create the targetface array
		 */
		if (isTargetFaceMode) {
			targetFaceList = helper.createTargetList(
				$scope.data.targetFacesById[$scope.round.targetFaceID].targetName,
				$scope.round.targetNumber
			);
		}

		prepareRound();

		createChartData();

	}

	/**
	 * Sets the sidebar items
	 */
	function setSidebar () {
		/**
		 * Shootingpaper sidebar items
		 * @type {Array}
		 */
		var sidebar = [
			{
				id: 'endDividier',
				name: 'round',
				isDivider: true
			},
			{
				id: 'endPage',
				name: 'end_plural',
				link: '/round/' + competitionID + '/' + roundID + '',
				icon: 'file'
			},
			{
				id: 'roundOverview',
				name: 'competition',
				link: '/competition/' + competitionID + '',
				icon: 'reorder'
			},
			{
				id: 'rounds',
				name: 'round_plural',
				isDivider: true
			}
		];

		var rounds = $scope.competition.roundsById,
			j = 0;

		/*
		 * Create a sidebar item for every round in the competition
		 */
		for (var i = 0; i < rounds.length; i++) {
			if (rounds[i]) {
				j++;
				sidebar[sidebar.length] = {
					id: 'round_' + j,
					name: '[i18next]({count:' + j + '})endPage.round',
					link: '/round/' + $scope.competition.id + '/' + rounds[i].id + '/shootingPaper',
					icon: 'circle',
					isActive: $scope.round.id === rounds[i].id
				};
			}
		}

		/*
		 * Now set the sidebar items
		 */
		$rootScope.setSidebar('shootingPaper', sidebar);

	}
	/**
	 * Prepares the round
	 */
	function prepareRound () {

		console.log('TF :: targetNumber ::', $scope.round.targetNumber);

		var /**
			 * Array containg the (sorted) rings.
			 *
			 * @type {Array}
			 */
			ends = [],
			/**
			 * Maximal number of ends (or rows of the shootingpaper)
			 * @type {Number}
			 */
			maxEnds = ($scope.round.endNumber * $scope.round.arrowNumber) / breakAfter,
			/**
			 * Original (unsorted) array of ends.
			 * @type {Array}
			 */
			orgEnds = $scope.round.ends,
			/**
			 * Array containing the current end (and arrows).
			 * The array gets sorted later.
			 *
			 * @type {Array}
			 */
			endArray,
			/**
			 * Index of current end. Starts with 0.
			 *
			 * @type {Number}
			 */
			curEnd = 0,
			/**
			 * Index of current arrow. Starts with 0.
			 *
			 * @type {Number}
			 */
			curArrow = 0,
			/**
			 * Whether the arrow is active (on the target) or not.
			 */
			isArrowActive,
			/**
			 * Number of arrows that are not on the target.
			 * Used for calculating center point.
			 *
			 * @type {Number}
			 */
			numberOfArrowsDisabled = 0,
			/**
			 * Possible rings. Other rings have to be added manually
			 * when adding other target faces
			 *
			 * @type {Object}
			 */
			rings = {
				'M': 0,
				'1': 0,
				'2': 0,
				'3': 0,
				'4': 0,
				'5': 0,
				'6': 0,
				'7': 0,
				'8': 0,
				'9': 0,
				'10': 0,
				'X': 0,
			},
			/**
			 * Center point of all arrows (except the ones that aren't on the target)
			 *
			 * @type {Object}
			 */
			mainCenterPoint = {
				x: 0,
				y: 0
			},
			/**
			 * Centerpoint of each target. Is only used when there
			 * are more than one targets.
			 *
			 * @type {Array}
			 */
			targetCenterPoint = [],
			i, j;

		/*
		 * Create a centerpoint object for each target if there
		 * is more than one target.
		 */
		if ($scope.round.targetNumber > 1) {
			for (i = 0; i < $scope.round.targetNumber; i++) {
				targetCenterPoint[i] = {
					x: 0,
					y: 0,
					/**
					 * Number of arrows on this target.
					 *
					 * @type {Number}
					 */
					length: 0
				};
			}
		}

		var arrowNumber = $scope.round.arrowNumber;

		for (i = 0, j = 0;
			i < orgEnds.length && j < arrowNumber;
			j++, i = (j === arrowNumber) ? i + 1 : i, j = (j === arrowNumber) ? j = 0 : j)
		{

			if (j === 0) {

				ends[curEnd] = [];

				endArray = angular.copy(orgEnds[i].data);

				endArray.sort(sortEnd);

				curArrow = 0;

				$scope.round.ends[i].active = true;

				targetEnds[i] = {
					data: [],
					active: true
				};

				// Set end points
				$scope.endPoints[curEnd] = 0;

			}


			/*jshint eqeqeq:false*/
			isArrowActive = !(endArray[j].x == '0' && endArray[j].y == '0');

			ends[curEnd][curArrow] = {
				id: endArray[j].id + 1,
				ring: ((endArray[j].ring == '0') || (typeof(endArray[j].ring) === 'undefined')) ? 'M' :
					helper.checkCompoundRing(isCompound, endArray[j].ring)
			};
			/*jshint eqeqeq:true*/

			rings[ends[curEnd][curArrow].ring]++;

			// Set points
			$scope.endPoints[curEnd] += ringToInteger(ends[curEnd][curArrow].ring);


			if ((j + 1) % breakAfter === 0 && (curEnd < maxEnds - 1)) {

				$scope.roundPoints[curEnd] = ($scope.roundPoints[curEnd - 1] ? $scope.roundPoints[curEnd - 1] : 0) + $scope.endPoints[curEnd];

				curEnd++;
				ends[curEnd] = [];
				curArrow = 0;

				// Set end points
				$scope.endPoints[curEnd] = 0;

			} else {

				curArrow++;

			}

			$scope.round.ends[i].data[j].active = true;

			targetEnds[i].data[j] = {
				active: isArrowActive,
				target: endArray[j].target,
				x: endArray[j].x,
				y: endArray[j].y,
				id: endArray[j].id
			};

			if (isArrowActive) {
				mainCenterPoint.x += endArray[j].x;
				mainCenterPoint.y += endArray[j].y;

				if ($scope.round.targetNumber > 1) {
					targetCenterPoint[endArray[j].target].x += endArray[j].x;
					targetCenterPoint[endArray[j].target].y += endArray[j].y;
					targetCenterPoint[endArray[j].target].length++;
				}

			} else {
				numberOfArrowsDisabled++;
			}

		}

		$scope.roundPoints[curEnd] = ($scope.roundPoints[curEnd - 1] ? $scope.roundPoints[curEnd - 1] : 0) + $scope.endPoints[curEnd];

		var roundAverage = $scope.roundPoints[$scope.roundPoints.length - 1] / maxArrowNumber;
		$scope.roundAverage = Math.round(roundAverage * 100) / 100;

		$scope.ends = ends;

		$scope.rings = rings;

		if (isTargetFaceMode) {
			initTargetOptions();
		}

		var sum = 0;

		for (i = 0, j = 0;
			i < ends.length && j < breakAfter;
			j++, i = (j === breakAfter) ? i + 1 : i, j = (j === breakAfter) ? j = 0 : j)
		{
			sum += Math.pow(ringToInteger(ends[i][j].ring) - roundAverage, 2);
		}

		$scope.roundStandardDeviation = Math.round(Math.sqrt(sum / (breakAfter * ends.length)) * 100) / 100;

	}

	/**
	 * Creates the data required for Chart.js
	 */
	function createChartData() {

		var rings = $scope.rings,
			j = 0,
			targetFaceData = ArcherTarget.getTarget('wa_x');

		$scope.chart.data = [];

		if (rings['M']) {

			$scope.chart.data[0] = {
				value: rings['M'],
				color: '#ccc'
			};

			j = 1;

		}

		for (var i = 0; i < targetFaceData.rating.length; i++) {

			var ringRating = targetFaceData.rating[i];

			if (rings[ringRating]) {
				$scope.chart.data[j] = {
					value: rings[ringRating],
					color: targetFaceData.colors[i]
				};
				j++;
			}

		}

		$scope.chart.options = {
			animationSteps : 70
		};

	}
	/**
	 * Initlialzes archerTarget.js target options
	 */
	var initTargetOptions = $scope.initTargetOptions = function () {

		$scope.paperTargetHiddenEnds = [];
		$scope.paperTargetHiddenArrows = [];
		$scope.curPaperTargetMode = 'default';

		$scope.targetOptions = {

			target: targetFaceList,

			arrowDefaults: {
				radius: 3,
				draggable: 0,
				style: {
					initial: {
						opacity: 0.9,
						color: '#000',
						stroke: false
					},
					hover: {
						opacity: 0.9,
						color: '#000',
						stroke: false
					},
					selected: {
						opacity: 0.9,
						color: '#000',
						stroke: false
					}
				}
			},

			arrows: targetEnds,

			scale: 1,
			zoom: 1,
			scalable: 0,
			draggable: 0,

			touch: isTouch,

			plugins: {
				'statistic': {
					arrows: targetEnds.slice(0, $scope.round.endNumber),
					showCenterPoint: true,
					centerPointOptions: {
						color: '#ff00ff',
						stroke: '#0000ff',
						strokeWidth: 1,
						radius: 5
					},
					showEndCenterPoint: false,
					endCenterPointOptions: {
						textColor: '#000',
						textSize: 14,
						color: 'rgba(255, 255, 0, .5)',
						stroke: '#000',
						strokeWidth: 0,
						radius: 10
					},
					showTargetCenterPoint: false,
					targetCenterPointOptions: {
						color: '#00ffff',
						stroke: '#000000',
						strokeWidth: 1,
						radius: 5
					},
					showStandardDeviation: false,
					standardDeviationOptions: {
						color: 'rgba(0, 255, 0, .35)',
						stroke: 'rgba(0, 255, 0, .6)',
						strokeWidth: 2
					},
					showTargetStandardDeviation: false,
					targetStandardDeviationOptions: {
						color: 'rgba(255, 0, 255, .25)',
						stroke: 'rgba(255, 0, 255, .6)',
						strokeWidth: 2
					},
					showEndStandardDeviation: false,
					endStandardDeviationOptions: {
						color: 'rgba(255, 0, 255, .11)',
						stroke: 'rgba(255, 0, 255, .9)',
						strokeWidth: 2
					}
				}
			}

		};

	};

	$scope.showDefaultTarget = function () {

		function show () {

			for (var i = 0; i < $scope.paperTargetHiddenEnds.length; i++) {
				$rootScope.archerTargets['paperTarget'].set('arrowActive', {
					arrowsetID: i,
					active: true
				});
			}

			$scope.paperTargetHiddenEnds = [];
			$scope.paperTargetHiddenArrows = [];
			$scope.curPaperTargetMode = 'default';

			var pluginData = $rootScope.archerTargets['paperTarget'].get('pluginData', 'statistic');

			pluginData.showAverage({
				active: false,
				targetID: 'all'
			});
			pluginData.showStandardDeviation({
				active: false,
				targetID: 'all'
			});
			pluginData.showAverage({
				active: false,
				arrowsetID: 'all'
			});
			pluginData.showStandardDeviation({
				active: false,
				arrowsetID: 'all'
			});
			pluginData.showStandardDeviation({
				active: false,
				showAll: 'all'
			});

		}

		if (targetFaceList.length > 1 && $scope.targetOptions.target.length === 1) {
			$scope.targetOptions.target = targetFaceList;
			$scope.$broadcast('targetOptionsManualChange');
			$timeout(function () {
				show();
			}, targetModeChangeTimeout);
		} else {
			show();
		}

	};

	$scope.showAdvancedTargets = function () {

		function show () {

			for (var i = 0; i < $scope.paperTargetHiddenEnds.length; i++) {
				$rootScope.archerTargets['paperTarget'].set('arrowActive', {
					arrowsetID: i,
					active: true
				});
			}

			$scope.paperTargetHiddenEnds = [];
			$scope.paperTargetHiddenArrows = [];
			$scope.curPaperTargetMode = 'advancedTargets';
			$scope.isStandardDeviationVisible = true;

			var pluginData = $rootScope.archerTargets['paperTarget'].get('pluginData', 'statistic');

			pluginData.showAverage({
				active: false,
				arrowsetID: 'all'
			});
			pluginData.showStandardDeviation({
				active: false,
				arrowsetID: 'all'
			});

			pluginData.showAverage({
				active: true,
				targetID: 'all'
			});
			pluginData.showStandardDeviation({
				active: true,
				targetID: 'all'
			});

			pluginData.showStandardDeviation({
				active: true,
				showAll: 'all'
			});

		}

		if (targetFaceList.length > 1 && $scope.targetOptions.target.length === 1) {
			$scope.targetOptions.target = targetFaceList;
			$scope.$broadcast('targetOptionsManualChange');
			$timeout(function () {
				show();
			}, targetModeChangeTimeout);
		} else {
			show();
		}

	};

	$scope.showAdvancedEnds = function () {

		function show () {

			for (var i = 0; i < $scope.paperTargetHiddenEnds.length; i++) {
				$rootScope.archerTargets['paperTarget'].set('arrowActive', {
					arrowsetID: i,
					active: true
				});
			}

			$scope.paperTargetHiddenEnds = [];
			$scope.paperTargetHiddenArrows = [];
			$scope.curPaperTargetMode = 'advancedEnds';
			$scope.isStandardDeviationVisible = true;

			var pluginData = $rootScope.archerTargets['paperTarget'].get('pluginData', 'statistic');

			pluginData.showAverage({
				active: false,
				targetID: 'all'
			});
			pluginData.showStandardDeviation({
				active: false,
				targetID: 'all'
			});


			pluginData.showAverage({
				active: true,
				arrowsetID: 'all'
			});

			pluginData.showStandardDeviation({
				active: true,
				arrowsetID: 'all'
			});

			pluginData.showStandardDeviation({
				active: true,
				showAll: 'all'
			});
		}

		if (targetFaceList.length > 1 && $scope.targetOptions.target.length > 1) {
			$scope.targetOptions.target = helper.createTargetList(
				$scope.data.targetFacesById[$scope.round.targetFaceID].targetName,
				1
			);
			$scope.$broadcast('targetOptionsManualChange');
			$timeout(function () {
				show();
			}, targetModeChangeTimeout);
		} else {
			show();
		}

	};

	$scope.showStandardDeviation = function (isVisible) {

		$scope.isStandardDeviationVisible = isVisible;

		var pluginData = $rootScope.archerTargets['paperTarget'].get('pluginData', 'statistic');

		if ($scope.curPaperTargetMode === 'advancedEnds') {
			pluginData.showStandardDeviation({
				active: isVisible,
				arrowsetID: 'all'
			});
			pluginData.showStandardDeviation({
				active: isVisible,
				showAll: 'all'
			});
		} else if ($scope.curPaperTargetMode === 'advancedTargets') {
			pluginData.showStandardDeviation({
				active: isVisible,
				targetID: 'all'
			});
			pluginData.showStandardDeviation({
				active: isVisible,
				showAll: 'all'
			});
		}

	};

	$scope.togglePaperTargetEnd = function (index) {

		var pluginData = $rootScope.archerTargets['paperTarget'].get('pluginData', 'statistic'),
			targetHiddenArrows = $scope.paperTargetHiddenArrows,
			isActive,
			i;

		$scope.paperTargetHiddenEnds[index] = !$scope.paperTargetHiddenEnds[index];

		isActive = !$scope.paperTargetHiddenEnds[index];

		if ($scope.curPaperTargetMode === 'advancedEnds') {
			pluginData.showAverage({
				active: isActive,
				arrowsetID: index
			});
			if ($scope.isStandardDeviationVisible) {
				pluginData.showStandardDeviation({
					active: isActive,
					arrowsetID: index
				});
			}
		}

		for (i = 0; i < $scope.round.arrowNumber; i++) {

			if (!targetHiddenArrows[i]) {
				$rootScope.archerTargets['paperTarget'].set('arrowActive', {
					arrowsetID: index,
					arrowID: i,
					active: isActive
				});
			}

		}

	};

	$scope.togglePaperTargetArrow = function (index) {

		console.log(index, 'toggleArrow');

		var targetHiddenEnds = $scope.paperTargetHiddenEnds,
			isActive,
			i;

		$scope.paperTargetHiddenArrows[index] = !$scope.paperTargetHiddenArrows[index];

		isActive = !$scope.paperTargetHiddenArrows[index];

		for (i = 0; i < $scope.round.endNumber; i++) {
			if (!targetHiddenEnds[i]) {
				$rootScope.archerTargets['paperTarget'].set('arrowActive', {
					arrowsetID: i,
					arrowID: index,
					active: isActive
				});
			}
		}

	};

	/**
	 * Converts a ring to an integer
	 *
	 * @param  {String} ring Arrow ring
	 * @return {Number}      Converted ring
	 */
	function ringToInteger (ring) {

		if (typeof ring === 'undefined') {

			return 0;

		} else if (ring === 'X') {

			return 10;

		} else if (ring === 'M') {

			return 0;

		} else {

			return parseInt(ring, 10);

		}

	}
	/**
	 * Sorts an end
	 *
	 * @param  {String|Number} a First ring
	 * @param  {String|Number} b Second ring
	 * @return {Number}        Second ring minus first ring
	 */
	function sortEnd (a, b) {

		a = a.ring || 0;
		b = b.ring || 0;

		if (a === 'X') { a = 11; } else if (a === 'M') { a = 0; }
		if (b === 'X') { b = 11; } else if (b === 'M') { b = 0; }

		return b - a;

	}
	/**
	 * Calculates points of an end
	 *
	 * @param  {Object} end End object
	 * @return {Number}     End points
	 */
	$scope.calcEndPoints = function (end) {

		if (!end || !end.data) {
			return '0';
		}

		var points = 0;

		for (var i = 0; i < end.data.length; i++) {
			points += ringToInteger(end.data[i].ring);
		}

		return points;

	};
	/*
	 * Initialize shooting paper page
	 */
	$scope.data.requireData(['competitions', 'targetFaces']).then(function () {
		init();
	});

});
