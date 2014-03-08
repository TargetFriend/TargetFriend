angular.module('TFApp').controller('EndCtrl', function ($rootScope, $scope, $routeParams, $navigate, helper, $timeout) {

	'use strict';

	/*
	 * Check if all neccassary parameters are given. If not, go
	 * to the competition list
	 */
	if (!$routeParams.competitionID || !$routeParams.roundID) {
		$navigate.go('competitions');
		return;
	}

	//                    innerheight   -    header - table
	$scope.targetHeight = $(window).height() - 75 - 160;

	var isTouch = true,
		/**
		 * Whether we're using compound scoring or not. If true,
		 * `X` becomes `10` and `10` becomes `9`
		 *
		 * @type {Boolean}
		 */
		isCompound,
		/**
		 * ID of the current competition
		 * @type {Number}
		 */
		competitionID = $scope.competitionID = parseInt($routeParams.competitionID, 10),
		/**
		 * ID of the current round
		 * @type {Number}
		 */
		roundID = $scope.roundID = parseInt($routeParams.roundID, 10),
		/**
		 * Whether the targetarrows are enabled or disabled
		 * @type {Boolean}
		 */
		isEnabled = false,
		/**
		 * Whether to show the target face (archerTarget.js) or not
		 * @type {Boolean}
		 */
		isTargetFaceMode = true,
		/**
		 * ...
		 */
		breakAfter,
		/**
		 * Contains the target faces for the target script
		 * @type {Array}
		 */
		targetFaceList = [],
		/**
		 * Number of active arrows in an end
		 * @type {Number}
		 */
		activeArrows = 0,
		/**
		 * Arrow options for ArcherTarget.js
		 * @type {Object}
		 */
		arrowOptions = {
			disabled: {
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
			enabled:  {
				radius: 8,
				draggable: 1,
				style: {
					initial: {
						opacity: 0.75,
						color: '#00ffff',
						stroke: '#000'
					},
					hover: {
						opacity: 1,
						color: '#00ff00',
						stroke: '#000'
					},
					selected: {
						opacity: 1,
						color: '#00ff00',
						stroke: '#000'
					}
				}
			}
		},

		isTargetInitialized = false;

	/**
	 * Current end of the round
	 * @type {Number}
	 */
	$scope.curEnd = 0;
	/**
	 * Points of the round
	 * @type {Number}
	 */
	$scope.roundPoints = 0;
	/**
	 * Points of the current end
	 * @type {Number}
	 */
	$scope.endPoints = 0;
	/**
	 * Arrow which is currently highlighted
	 * @type {Number}
	 */
	$scope.highlightedArrow = -1;

	// hold in sync with endSettings.js
	var defaults = {
		targetScaleMain: 4,
		targetScaleTop: 2.4
	};

	$scope.leftButton = {
		tap: function () {
			$scope.snapRemote.open('left');
		}
	};

	/**
	 * Initialize the target
	 */
	function init() {
		/**
		 * Current competition
		 * @type {Number}
		 */
		$scope.competition = $scope.data.competitionsById[competitionID];
		/**
		 * Current round
		 * @type {Number}
		 */
		$scope.round = $scope.competition.roundsById[roundID];
		/*
		 * Set the sidebar
		 */
		setSidebar();

		isTargetFaceMode = !!$scope.round.targetFaceID;
		isEnabled = $scope.round.enabled;
		isCompound = $scope.isCompound = !!parseInt($scope.round.compound, 10);

		if (isTargetFaceMode) {
			/*
			 * We have to disable every arrow...
			 */
			initArrows();
		}

		/**
		 * Arrows array of the current end
		 * @type {Array}
		 */
		$scope.curArrows = $scope.round.ends[$scope.curEnd];

		if (isTargetFaceMode) {

			targetFaceList = helper.createTargetList(
				$scope.data.targetFacesById[$scope.round.targetFaceID].targetName,
				$scope.round.targetNumber,
				$scope.round.targetScale || 1
			);

			initTargetOptions();
			initEndTargetFace();


		} else {

			$scope.targetOptions = null;
			initEndPaper();

		}

	}

	/**
	 * Set the sidebar items
	 */
	function setSidebar() {

		var sidebar = [
			{
				id: 'endDividier',
				name: 'round',
				isDivider: true
			},
			{
				id: 'shootingPaper',
				name: 'shootingPaper',
				link: '/round/' + competitionID + '/' + roundID + '/shootingPaper',
				icon: 'file'
			},
			{
				id: 'toggleRound',
				name: $scope.round.enabled ? 'disable' : 'enable',
				icon: $scope.round.enabled ? 'lock' : 'unlock',
				click: function () {
					toggleRound();
				}
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
			j = 0,
			i;

		/*
		 * Create a sidebar item for every round in the competition
		 */
		for (i = 0; i < rounds.length; i++) {
			if (rounds[i]) {
				j++;
				sidebar[sidebar.length] = {
					id: 'round_' + j,
					name: '[i18next]({count:' + j + '})endPage.round',
					link: '/round/' + $scope.competition.id + '/' + rounds[i].id + '',
					icon: 'circle',
					isActive: $scope.round.id === rounds[i].id
				};
			}
		}

		/*
		 * Now set the sidebar items
		 */
		$rootScope.setSidebar(null, sidebar);

	}


	/**
	 * Initializes arrows. Does NOT update archerTarget.js target.
	 * Also deletes style and radius and checks whether the
	 * arrow is draggable.
	 */
	function initArrows() {

		var arrowNumber = $scope.round.arrowNumber,
			endNumber = $scope.round.endNumber;

		for (var i = 0, j = 0;
			i < endNumber && j < arrowNumber;
			j++, i = (j === arrowNumber) ? i + 1 : i, j = (j === arrowNumber) ? j = 0 : j)
		{

			if (j === 0) {

				$scope.round.ends[i].active = (i === $scope.curEnd);
				$scope.round.ends[i].draggable = isEnabled;
				$scope.round.ends[i].style = {};
				delete $scope.round.ends[i].radius;

			}

			$scope.round.ends[i].data[j].active = false;

		}

	}

	/**
	 * Initializes the target options for archerTarget.js
	 */
	function initTargetOptions() {

		var arrowDefaults = !isEnabled ? arrowOptions.disabled : arrowOptions.enabled;

		$scope.targetOptions = {

			target: targetFaceList,

			arrowDefaults: arrowDefaults,

			arrows: $scope.round.ends,

			plugins: {
				appZoom: {
					scaledZoom: $scope.data.settings[0].targetScaleTop || defaults.scaleTop,
					//main target; zoom could be 3.5
					tapScale: $scope.data.settings[0].targetScaleMain || defaults.scaleMain,
					width: 100,
					height: 160, // table
					useHeightPx: true,
					crossWidth: 2,
					crossColor: '#000',
					margin: {
						bottom: 15
					}
				}
			},

			scale: 1,
			scalable: 0,
			draggable: 0,

			touch: isTouch,

			onArrowMove: function (e) {

				if (!isEnabled) {
					return false;
				}
				/*
				 * The ring that is shown while moving the arrow
				 */
				var ring = helper.checkCompoundRing(isCompound, $scope.round.ends[e.arrowset].data[e.arrow].ring);

				$scope.$apply(function () {

					$scope.curArrowRing = (ring === 0) ? 'M' : ring;

				});

			},

			onArrowSelect: function (e) {

				if (!isEnabled) {
					return false;
				}

				$scope.round.ends = e.arrows;

			},

			onArrowDeselect: function (e) {

				if (!isEnabled) {
					e.preventDefault();
					return;
				}

				$scope.$apply(function () {

					$scope.round.ends = e.arrows;
					$scope.curArrows = $scope.round.ends[$scope.curEnd];
					$scope.curArrowRing = null;

					var arrow = $scope.round.ends[e.arrowset].data[e.arrow];

					if (isNaN(arrow.x) || typeof(arrow.x) === 'undefined') {
						arrow.x = 1;
					} else if (isNaN(arrow.y) || typeof(arrow.y) === 'undefined') {
						arrow.y = 1;
					}

					setPoints();
				});

			},

			onContainerMousedown: function (e) {

				/*
				 * Did we already shoot all arrows? If true, return false.
				 */
				if (activeArrows >= $scope.round.arrowNumber || !isEnabled) {
					e.preventDefault();
					return;
				}

				var atRef = $rootScope.archerTargets['target'];

				$scope.$apply(function () {
					$scope.round.ends = atRef.get('arrows');
					$scope.curArrows = $scope.round.ends[$scope.curEnd];
				});

				var arrowData = $scope.curArrows.data[activeArrows],
					arrowElement = arrowData.el;

				atRef.set('arrowActive', {
					arrowsetID: $scope.curEnd,
					arrowID: activeArrows,
					active: true
				});

				arrowData.x = e.targetCoords.x;
				arrowData.y = e.targetCoords.y;
				arrowData.target = e.targetCoords.target;

				atRef.set('arrowOptions', {
					arrowsetID: $scope.curEnd,
					options: {
						data: $scope.curArrows.data
					}
				});

				arrowData.ring = helper.checkCompoundRing(isCompound, atRef.get('ring', arrowData));

				var x = isNaN(e.canvasCoords.xPx) ? 1 : e.canvasCoords.xPx;
				var y = isNaN(e.canvasCoords.yPx) ? 1 : e.canvasCoords.yPx;

				arrowElement.setAttribute('cx', x);
				arrowElement.setAttribute('cy', y);

				helper.fireTouchEvent(arrowElement, 'touchstart', {
					noOffset: true,
					pageX: x,
					pageY: y
				});

				activeArrows++;

			}
		};

		if (!$scope.$$phase) {
			$rootScope.$digest();
		}

		isTargetInitialized = true;

	}

	/**
	 * Initializes the end for target face mode
	 */
	function initEndTargetFace() {

		var arrows = $scope.curArrows.data,
			curEnd = $scope.curEnd,
			i, x, y;

		activeArrows = 0;

		if (!$rootScope.archerTargets) {
			$timeout(function() {
				initEndTargetFace();
			}, 300);
			return;
		}

		function setArrowActive(arrowsetID, arrowID) {

			var atRef = $rootScope.archerTargets['target'];

			if (atRef && isTargetInitialized) {
				atRef.set('arrowActive', {
					arrowsetID: arrowsetID,
					arrowID: arrowID,
					active: true
				});
			} else {
				window.setTimeout(function() {
					setArrowActive(arrowsetID, arrowID);
				}, 200);
			}

		}

		for (i = 0; i < arrows.length; i++) {

			x = parseFloat(arrows[i].x, 10);
			y = parseFloat(arrows[i].y, 10);

			$scope.round.ends[curEnd].data[i].ring = arrows[i].ring = y = isNaN(y) ? 'M' : arrows[i].ring;

			if (x !== 0 || y !== 0) {

				setArrowActive(curEnd, activeArrows);

				arrows[i].active = true;

				activeArrows++;

			} else {

				/*
				 * Break because there should'nt be any other active arrows after
				 * this one.
				 */
				break;
			}

		}

		setPoints(true);

	}

	/**
	 * Initializes the end for non target face mode
	 */
	function initEndPaper() {

		$scope.highlightedArrow = isEnabled ? 0 : -1;

		var arrows = $scope.curArrows.data,
			end = [],
			j = 0;

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

		for (var i = 0; i < arrows.length; i++) {

			if (!end[j]) {
				end[j] = [];
			}

			end[j].push(arrows[i]);

			if ((i + 1) % breakAfter === 0) {
				j++;
			}
		}

		$scope.end = end;

		setPoints(true);

	}

	/**
	 * Change the current end.
	 *
	 * @param {String|Boolean} direction Either 'next' or 'prev'. If false, we'll use `newEnd`
	 * @param {Number}         newEnd    Index of end to show
	 */
	$scope.changeEnd = function(direction, newEnd) {

		var atRef = $rootScope.archerTargets['target'],
			oldEnd = $scope.curEnd;

		if (isTargetFaceMode && $scope.highlightedArrow >= 0) {
			atRef.set('arrowStyle', {
				arrowsetID: oldEnd,
				arrowID: $scope.highlightedArrow,
				style: {}
			});
		}

		$scope.highlightedArrow = -1;

		function hideEnd (end) {

			atRef.set('arrowActive', {
				arrowsetID: end,
				active: false
			});

		}

		if (direction === 'next') {

			if ($scope.curEnd >= ($scope.round.endNumber - 1)) { return; }

			$scope.curEnd++;

		} else if (direction === 'prev') {

			if ($scope.curEnd <= 0) { return; }

			$scope.curEnd--;

		} else if (!direction && typeof(newEnd) !== 'undefined') {

			$scope.curEnd = newEnd;

		} else {

			return;

		}

		if (isTargetFaceMode) {
			hideEnd(oldEnd);
		}

		$scope.curArrows = $scope.round.ends[$scope.curEnd];
		if (isTargetFaceMode) {
			initEndTargetFace();
		} else {
			initEndPaper();
		}

	};

	/**
	 * Highlights a specific arrow
	 *
	 * @param {Object} arrow
	 */
	$scope.highlightArrow = function (arrow) {

		if (isTargetFaceMode) {

			var atRef = $rootScope.archerTargets['target'];

			if ($scope.highlightedArrow >= 0) {
				atRef.set('arrowStyle', {
					arrowsetID: $scope.curEnd,
					arrowID: $scope.highlightedArrow,
					style: {}
				});
			}

			var style = {
				opacity: 1,
				color: '#0000ff',
				stroke: '#ff0000',
				radius: 10
			};

			atRef.set('arrowStyle', {
				arrowsetID: $scope.curEnd,
				arrowID: arrow.id,
				style: style
			});

		}

		$scope.highlightedArrow = arrow.id;

	};

	/**
	 * For non target mode
	 */
	$scope.insertRing = function (ring) {

		$scope.round.ends[$scope.curEnd].data[$scope.highlightedArrow].ring = ring;

		if ($scope.highlightedArrow < $scope.round.arrowNumber - 1) {
			$scope.highlightedArrow++;
		}

		setPoints();

	};

	function setPoints(noSave) {

		var pointsEnd = 0,
			pointsRound = 0,
			dataEnd = $scope.curArrows.data,
			dataRound = $scope.round.ends,
			i;

		for (i = 0; i < dataEnd.length; i++) {
			pointsEnd += helper.ringToNumber(isCompound, dataEnd[i].ring);
		}

		for (i = 0; i < dataRound.length; i++) {
			if (i !== $scope.curEnd) {
				pointsRound += parseInt(dataRound[i].endPoints, 10) || 0;
			}
		}

		pointsRound += pointsEnd;

		$scope.round.ends[$scope.curEnd].endPoints = $scope.endPoints = pointsEnd;
		$scope.roundPoints = pointsRound;

		/*
		 * Now save the end
		 */
		if (!noSave) {
			save();
		}

	}

	/**
	 * Enables or disables a round, so the user can (not) move the arrows.
	 */
	function toggleRound () {

		isEnabled = $scope.round.enabled = $scope.competition.roundsById[roundID].enabled = !$scope.competition.roundsById[roundID].enabled;

		initArrows();

		if (isTargetFaceMode) {
			initEndTargetFace();
		} else {
			initEndPaper();
		}

		$scope.data.update('competitions', [$scope.competition]).then(function (competitionData) {

			console.log('TF :: round :: edited', competitionData);

			if (isTargetFaceMode) {
				initTargetOptions();
			}

			setSidebar();

		});
	}

	/**
	 * Saves the end/round/competition
	 */
	function save() {

		var round = {},
			item;

		for (item in $scope.round) {
			if ($scope.round.hasOwnProperty(item) && item !== 'ends' && item !== '$$hashKey' && item !== 'enabled') {
				round[item] = $scope.round[item];
			}
		}

		if ($scope.round.enabled) {
			round.enabled = 1;
		}

		round.points = $scope.roundPoints;
		round.average = $scope.roundPoints / ($scope.round.endNumber * $scope.round.arrowNumber);

		round.ends = [];

		var ends = $scope.round.ends;

		/*
		 * We don't want to save the element as well as $$hashKey
		 */
		for (var i = ends.length - 1; i >= 0; i--) {

			round.ends[i] = {};

			round.ends[i].endPoints = ends[i].endPoints;

			round.ends[i].data = [];

			for (var j = ends[i].data.length - 1; j >= 0; j--) {

				round.ends[i].data[j] = {};

				for (item in ends[i].data[j]) {

					round.ends[i].data[j].x = ends[i].data[j].x;
					round.ends[i].data[j].y = ends[i].data[j].y;
					round.ends[i].data[j].target = ends[i].data[j].target;
					round.ends[i].data[j].id = ends[i].data[j].id;
					round.ends[i].data[j].ring = ends[i].data[j].ring;

				}

			}

		}

		var d = $scope.data.competitionsById[competitionID];

		d.roundsById[round.id] = round;

		d.points = 0;

		for (var l = 0; l < d.roundsById.length; l++) {
			if (d.roundsById[l] && d.roundsById[l].points) {
				d.points += d.roundsById[l].points;
			}
		}

		$scope.data.update('competitions', [d]).then(function (roundData) {

			console.log('TF :: rounds :: edited', roundData);

		});

	}

	$scope.data.requireData(['competitions', 'targetFaces']).then(function () {
		init();
	});

});
