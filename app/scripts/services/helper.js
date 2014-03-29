angular.module('TFApp').service('helper', function ($i18next, $window) {

	'use strict';

	var helper = {};

	helper.parseDate = function (dateString) {

		if (!dateString || dateString === '') {
			return '';
		}

		var dateObj = new Date(dateString),

			date = dateObj.getDate() + '.' + (dateObj.getMonth() + 1) + '.' + dateObj.getFullYear();

		return date;

	};

	helper.confirm = function (title, message, confirmCallback, buttonLabels) {

		if (isPhoneGap) {

			buttonLabels = buttonLabels || [$i18next('ok'), $i18next('cancel')];

			navigator.notification.confirm(message, function (index) {

				confirmCallback(index === 1);

			}, title, buttonLabels);

		} else {

			confirmCallback(!!window.confirm(title + ': ' + message));

		}

	};

	helper.alert = function (message, title, alertCallback, buttonName) {

		alertCallback = alertCallback || null;

		if (isPhoneGap) {

			navigator.notification.alert(message, alertCallback, title, buttonName);

		} else {

			window.alert(title + ': ' + message);

		}
	};

	helper.tmpFormData = {
		round: null,
		competition: null,
		bow: null
	};

	helper.openLink = function (link) {
		if ($window.isPhoneGap) {
			// Open with InAppBrowser
			$window.open(link, '_system', 'location=yes');
		} else {
			// Just open a new tab
			$window.open(link, '_blank');
		}
	};

	/**
	 * FileSystem error handler
	 */
	helper.FSError = function (err) {

		var msg;

		switch (err.code) {
		case FileError.QUOTA_EXCEEDED_ERR:
			msg = 'QUOTA_EXCEEDED_ERR';
			break;
		case FileError.NOT_FOUND_ERR:
			msg = 'NOT_FOUND_ERR';
			break;
		case FileError.SECURITY_ERR:
			msg = 'SECURITY_ERR';
			break;
		case FileError.INVALID_MODIFICATION_ERR:
			msg = 'INVALID_MODIFICATION_ERR';
			break;
		case FileError.INVALID_STATE_ERR:
			msg = 'INVALID_STATE_ERR';
			break;
		default:
			msg = 'Unknown Error';
			break;
		}

		console.error('FileSystem Error:' + msg + ' ' + err);

	};

	/**
	 * Request filesystem
	 * @param  {Function} callback
	 */
	helper.requestFileSystem = function (callback) {

		window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

		function browserFileSystem() {
			// 10 MB
			navigator.webkitTemporaryStorage.requestQuota(10*1024*1024, function (grantedBytes) {

				$window.requestFileSystem(PERSISTENT, grantedBytes, callback, helper.FSError);

			}, helper.FSError);
		}

		function phonegapFileSystem() {
			$window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, callback, helper.FSError);
		}

		if ($window.isPhoneGap) {
			phonegapFileSystem();
		} else {
			browserFileSystem();
		}

	};

	helper.getTFDirectory = function (callback) {

		function getDirectory(fileSystem) {

			fileSystem.root.getDirectory('TargetFriend', {create: true}, function (dirEntry) {
				if (callback) {
					callback(dirEntry);
				}
			}, helper.FSError);

		}

		helper.requestFileSystem(getDirectory);

	};

	/**
	 * Saves a file into local filesystem (with Phonegap on SDCard)
	 * @param  {String}   filename Filename, e.g. backup.txt
	 * @param  {String}   data     Text that we want to write into the file
	 * @param  {Function} callback Callback function which is called when the file is saved
	 */
	helper.saveFile = function (filename, data, callback) {

		if (!filename || !data) {
			return false;
		}

		/*
		 * Make sure that it's a string
		 */
		data = typeof(data) !== 'string' ? JSON.stringify(data) : data;

		function getFile(dirEntry) {

			dirEntry.getFile(filename, {create: true, exclusive: false}, function (fileEntry) {

				fileEntry.createWriter(function (fileWriter) {

					fileWriter.onwriteend = function() {

						// Write data
						if (!$window.isPhoneGap) {

							var blob = new Blob([data], { type: 'text/plain' });

							fileWriter.write(blob);

						} else {
							fileWriter.write(data);
						}

						fileWriter.onwriteend = function() {

							console.log('Successfully saved file!');

							if (callback) {
								callback();
							}

						};

					};

					// If file exists, clear it.
					fileWriter.truncate(0);

				});

			}, helper.FSError);
		}

		helper.getTFDirectory(getFile);

	};

	helper.getFileContentByURL = function (url, callback) {

		//var rFSURL = window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL;

		if (!$window.isPhoneGap) {
			url = ['filesystem:', window.location.origin, '/persistent', url].join('');
		}
		console.log(url);

		window.webkitResolveLocalFileSystemURL(url, function (fileEntry) {

			helper.getFileContent(fileEntry, callback);

		}, helper.FSError);
	};

	helper.getFileContent = function (fileEntry, callback) {

		fileEntry.file(function (file) {

			var reader = new FileReader();

			reader.onloadend = function() {
				if (callback) {
					callback(this.result);
				}
			};

			reader.readAsText(file);

		}, helper.FSError);
	};

	helper.fireEvent = function (target, name, params) {

		var evt = document.createEvent('Event');

		evt.initEvent(name, true, true); //true for can bubble, true for cancelable

		if (params) {
			for (var param in params) {
				if (params.hasOwnProperty(param)) {
					evt[param] = params[param];
				}
			}
		}

		target.dispatchEvent(evt);

	};

	helper.fireTouchEvent = function (target, type, touchOptions) {

		touchOptions = touchOptions || {};

		var pageX = touchOptions.pageX || 0,
			pageY = touchOptions.pageY || 0,
			types = {
				touchstart: true
			};

		if (!types[type]) {
			type = 'touchstart';
		}

		var e = document.createEvent('UIEvent');

		// Simple hack for TF
		e.touches = [{
			pageX: pageX,
			pageY: pageY,
			noOffset: !!touchOptions.noOffset
		}];

		e.initUIEvent(type, true, true);

		target.dispatchEvent(e);

	};

	helper.createEmptyArrows = function (ends, arrows) {

		var endArray = [],
			arrowArray;

		for (var i = 0; i < ends; i++) {
			arrowArray = [];
			for (var j = 0; j < arrows; j++) {
				arrowArray.push({
					x: 0,
					y: 0,
					ring: 0,
					active: false,
					id: j
				});
			}
			endArray.push({ data: arrowArray });
		}

		return endArray;

	};

	helper.checkCompoundRing = function(isCompound, ring) {

		if (isCompound) {
			if (ring === 'X') {
				return 10;
			} else if (ring === 10 || ring === '10') {
				return 9;
			}
		}

		return ring;

	};

	helper.ringToNumber = function (isCompound, ring) {
		ring = helper.checkCompoundRing(isCompound, ring);
		return (ring === 'X') ? 10 : ((ring === 'M') ? 0 : parseInt(ring, 10));
	};

	/**
	 * Creates the target list for archerTarget.js
	 * @param  {String} targetFace   The AT.js target name
	 * @param  {String} targetNumber Number of targets to show
	 * @return {Array}               The target list
	 */
	helper.createTargetList = function (targetFace, targetNumber, zoomFactor) {

		zoomFactor = zoomFactor || 1;

		var targetFaceList = [];
		/**
		 * The target face for the current round
		 * @type {String}
		 */
		var face = targetFace || 'wa_x';
		/**
		 * The Number of target faces to display
		 * @type {Number}
		 */
		var length = targetNumber || 1;

		var targetSettings = [
			/*
			 * One target
			 */
			{
				positions: [
					[50, 50]
				],
				diameter: 95
			},
			/*
			 * Two targets
			 */
			{
				positions: [
					[50, 28],
					[50, 73]
				],
				diameter: 52
			},
			/*
			 * Three targets
			 */
			{
				positions: [
					[25, 25],
					[75, 25],
					[50, 75]
				],
				diameter: 44
			},
			/*
			 * Four targets
			 */
			{
				positions: [
					[26, 26],
					[74, 26],
					[26, 74],
					[74, 74]
				],
				diameter: 44
			},
			/*
			 * Five targets
			 */
			{
				positions: [
					[25, 25],
					[75, 25],
					[25, 75],
					[75, 75],
					[50, 50]
				],
				diameter: 37
			},
			/*
			 * Six targets
			 */
			{
				positions: [
					[25, 20],
					[75, 20],
					[25, 50],
					[75, 50],
					[25, 80],
					[75, 80]
				],
				diameter: 35
			}
		];
		for (var i = 0; i < length; i++) {

			var t = targetSettings[length - 1];

			targetFaceList[i] = {
				name: face,
				center: t.positions[i],
				diameter: t.diameter * zoomFactor
			};

		}

		return targetFaceList;

	};


	helper.exampleData = {

		settings: [
			{
				roundDefaults: {},
				competitionDefaults: {},
				competitionTags: [
					{
						id: 0,
						name: 'A'
					},
					{
						id: 1,
						name: 'B'
					},
					{
						id: 2,
						name: 'C'
					},
					{
						id: 3,
						name: 'D'
					},
					{
						id: 4,
						name: 'E'
					}
				]
			}
		],

		targetFaces: [
			{
				id: 1,
				name:      'WA - 120cm',
				note:      '',
				img:     'images/targetFaces/wa_x.png',
				targetName: 'wa_x',
				outdoor: 2,
				recurve: 2
			},

			{
				id: 2,
				name:      'WA - 80cm',
				note:      '',
				img:     'images/targetFaces/wa_x.png',
				targetName: 'wa_x',
				outdoor: 2,
				recurve: 2
			},
			{
				id: 3,
				name:      'WA - 60cm',
				note:      '',
				img:     'images/targetFaces/wa_x.png',
				targetName: 'wa_x',
				outdoor: 0,
				recurve: 2
			},
			{
				id: 4,
				name:      'WA - 40cm',
				note:      '',
				img:     'images/targetFaces/wa_x.png',
				targetName: 'wa_x',
				outdoor: 0,
				recurve: 2
			},


			{
				id: 5,
				name: 'WA - 40cm - Recurve',
				note: '',
				img: 'images/targetFaces/wa_10_recurve.png',
				targetName: 'wa_10_recurve',
				outdoor: 0,
				recurve: 1
			},
			{
				id: 6,
				name: 'WA - 60cm - Recurve',
				note: '',
				img: 'images/targetFaces/wa_10_recurve.png',
				targetName: 'wa_10_recurve',
				outdoor: 0,
				recurve: 1
			},
			{
				id: 7,
				name: 'WA - 80cm - Recurve',
				note: '',
				img: 'images/targetFaces/wa_10_recurve.png',
				targetName: 'wa_10_recurve',
				outdoor:   0,
				recurve: 1
			},


			{
				id: 8,
				name:      'WA - 40cm - Compound',
				note:      '',
				img:     'images/targetFaces/wa_10_compound.png',
				targetName: 'wa_10_compound',
				outdoor:   0,
				recurve: 0
			},
			{
				id: 9,
				name:      'WA - 60cm - Compound',
				note:      '',
				img:     'images/targetFaces/wa_10_compound.png',
				targetName: 'wa_10_compound',
				outdoor:   0,
				recurve: 0
			},
			{
				id: 10,
				name:      'WA - 80cm - Compound',
				note:      '',
				img:     'images/targetFaces/wa_10_compound.png',
				targetName: 'wa_10_compound',
				outdoor:   0,
				recurve: 0
			},


			{
				id: 11,
				name:      'WA - Spot - 80cm',
				note:      '',
				img:     'images/targetFaces/wa_x_6.png',
				targetName: 'wa_x_6',
				outdoor:   0,
				recurve: 2
			},
			{
				id: 12,
				name:      'WA - Spot - 60cm',
				note:      '',
				img:     'images/targetFaces/wa_x_6.png',
				targetName: 'wa_x_6',
				outdoor:   0,
				recurve: 2
			},
			{
				id: 13,
				name:      'WA - Spot - 40cm',
				note:      '',
				img:     'images/targetFaces/wa_x_6.png',
				targetName: 'wa_x_6',
				outdoor:   0,
				recurve: 2
			},


			{
				id: 14,
				name:      'WA - 40cm - Spot - Recurve',
				note:      '',
				img:     'images/targetFaces/wa_10_6_recurve.png',
				targetName: 'wa_10_6_recurve',
				outdoor:   0,
				recurve: 1
			},


			{
				id: 15,
				name:      'WA - 40cm - Spot - Compound',
				note:      '',
				img:     'images/targetFaces/wa_10_6_compound.png',
				targetName: 'wa_10_6_compound',
				outdoor:   0,
				recurve: 0
			},


			{
				id: 16,
				name:      'WA - Spot - 5',
				note:      '',
				img:     'images/targetFaces/wa_x_5.png',
				targetName: 'wa_x_5',
				outdoor:   0,
				recurve: 2
			},

			{
				id: 17,
				name:      'WA - Field',
				note:      '',
				img:     'images/targetFaces/wa_field.png',
				targetName: 'wa_field',
				outdoor:   1,
				recurve: 2
			},

			{
				id: 18,
				name:      'DFBV Spiegel',
				note:      '',
				img:     'images/targetFaces/dfbv_spiegel.png',
				targetName: 'dfbv_spiegel',
				outdoor:   1,
				recurve: 2
			},
			{
				id: 19,
				name:      'DFBV Spot',
				note:      '',
				img:     'images/targetFaces/dfbv_spiegel_spot.png',
				targetName: 'dfbv_spiegel_spot',
				outdoor:   1,
				recurve: 2
			}
		],

		distances: [
			{
				id: 1,
				order: 3,
				name: '90m',
				note: ''
			},
			{
				id: 2,
				order: 1,
				name: '70m',
				note: ''
			},
			{
				id: 3,
				order: 4,
				name: '60m',
				note: ''
			},
			{
				id: 4,
				order: 7,
				name: '50m',
				note: ''
			},
			{
				id: 5,
				order: 5,
				name: '40m',
				note: ''
			},
			{
				id: 6,
				order: 8,
				name: '30m',
				note: ''
			},
			{
				id: 7,
				order: 6,
				name: '25m',
				note: ''
			},
			{
				id: 8,
				order: 2,
				name: '18m',
				note: ''
			}
		],

		pattern: [
			{
				name: 'wa_competition_outdoor_70m',
				rounds: [
					{
						id: 0,
						points: 0,
						endNumber: 6,
						arrowNumber: 6,
						outdoor: 1,
						compound: 0,
						arrownumbers: 0,
						targetNumber: 1,
						distanceID: 2, // 70m
						targetFaceID: 1 // WA - 120cm
					},
					{
						id: 1,
						points: 0,
						endNumber: 6,
						arrowNumber: 6,
						outdoor: 1,
						compound: 0,
						arrownumbers: 0,
						targetNumber: 1,
						distanceID: 2, // 70m
						targetFaceID: 1 // WA - 120cm
					}
				]
			},
			{
				name: 'wa_competition_indoor_18m_recurve_spot',
				rounds: [
					{
						id: 0,
						points: 0,
						endNumber: 10,
						arrowNumber: 3,
						outdoor: 1,
						compound: 0,
						arrownumbers: 0,
						targetNumber: 1,
						distanceID: 8, // 18m
						targetFaceID: 14 // WA - 40cm - Spot - Recurve
					},
					{
						id: 1,
						points: 0,
						endNumber: 10,
						arrowNumber: 3,
						outdoor: 1,
						compound: 0,
						arrownumbers: 0,
						targetNumber: 1,
						distanceID: 8, // 18m
						targetFaceID: 14 // WA - 40cm - Spot - Recurve
					}
				]
			},
			{
				name: 'wa_competition_indoor_18m_recurve_40cm',
				rounds: [
					{
						id: 0,
						points: 0,
						endNumber: 10,
						arrowNumber: 3,
						outdoor: 1,
						compound: 0,
						arrownumbers: 0,
						targetNumber: 1,
						distanceID: 8, // 18m
						targetFaceID: 5 // WA - 40cm - Recurve
					},
					{
						id: 1,
						points: 0,
						endNumber: 10,
						arrowNumber: 3,
						outdoor: 1,
						compound: 0,
						arrownumbers: 0,
						targetNumber: 1,
						distanceID: 8, // 18m
						targetFaceID: 5 // WA - 40cm - Recurve
					}
				]
			},
			{
				name: 'wa_competition_indoor_18m_compound_spot',
				rounds: [
					{
						id: 0,
						points: 0,
						endNumber: 10,
						arrowNumber: 3,
						outdoor: 1,
						compound: 0,
						arrownumbers: 0,
						targetNumber: 1,
						distanceID: 8, // 18m
						targetFaceID: 15 // WA - 40cm - Spot - Compound
					},
					{
						id: 1,
						points: 0,
						endNumber: 10,
						arrowNumber: 3,
						outdoor: 1,
						compound: 0,
						arrownumbers: 0,
						targetNumber: 1,
						distanceID: 8, // 18m
						targetFaceID: 15 // WA - 40cm - Spot - Compound
					}
				]
			},
			{
				name: 'wa_star_men',
				rounds: [
					{
						id: 0,
						points: 0,
						endNumber: 6,
						arrowNumber: 6,
						outdoor: 1,
						compound: 0,
						arrownumbers: 0,
						targetNumber: 1,
						distanceID: 1, // 90m
						targetFaceID: 1 // WA - 120cm
					},
					{
						id: 1,
						points: 0,
						endNumber: 6,
						arrowNumber: 6,
						outdoor: 1,
						compound: 0,
						arrownumbers: 0,
						targetNumber: 1,
						distanceID: 2, // 70m
						targetFaceID: 1 // WA - 120cm
					},
					{
						id: 2,
						points: 0,
						endNumber: 6,
						arrowNumber: 6,
						outdoor: 1,
						compound: 0,
						arrownumbers: 0,
						targetNumber: 1,
						distanceID: 4, // 50m
						targetFaceID: 1 // WA - 120cm
					},
					{
						id: 3,
						points: 0,
						endNumber: 6,
						arrowNumber: 6,
						outdoor: 1,
						compound: 0,
						arrownumbers: 0,
						targetNumber: 1,
						distanceID: 6, // 30m
						targetFaceID: 1 // WA - 120cm
					}
				]
			},
			{
				name: 'wa_star_women',
				rounds: [
					{
						id: 0,
						points: 0,
						endNumber: 6,
						arrowNumber: 6,
						outdoor: 1,
						compound: 0,
						arrownumbers: 0,
						targetNumber: 1,
						distanceID: 2, // 70m
						targetFaceID: 1 // WA - 120cm
					},
					{
						id: 1,
						points: 0,
						endNumber: 6,
						arrowNumber: 6,
						outdoor: 1,
						compound: 0,
						arrownumbers: 0,
						targetNumber: 1,
						distanceID: 3, // 60m
						targetFaceID: 1 // WA - 120cm
					},
					{
						id: 2,
						points: 0,
						endNumber: 6,
						arrowNumber: 6,
						outdoor: 1,
						compound: 0,
						arrownumbers: 0,
						targetNumber: 1,
						distanceID: 4, // 50m
						targetFaceID: 1 // WA - 120cm
					},
					{
						id: 3,
						points: 0,
						endNumber: 6,
						arrowNumber: 6,
						outdoor: 1,
						compound: 0,
						arrownumbers: 0,
						targetNumber: 1,
						distanceID: 6, // 30m
						targetFaceID: 1 // WA - 120cm
					}
				]
			},
			{
				name: 'wa_competition_indoor_25m_recurve_60cm',
				rounds: [
					{
						id: 0,
						points: 0,
						endNumber: 10,
						arrowNumber: 3,
						outdoor: 1,
						compound: 0,
						arrownumbers: 0,
						targetNumber: 1,
						distanceID: 7, // 25m
						targetFaceID: 3 // WA - 60cm
					},
					{
						id: 1,
						points: 0,
						endNumber: 10,
						arrowNumber: 3,
						outdoor: 1,
						compound: 0,
						arrownumbers: 0,
						targetNumber: 1,
						distanceID: 7, // 25m
						targetFaceID: 3 // WA - 60cm
					}
				]
			},
			{
				name: 'wa_competition_indoor_25m_compound_60cm_spot',
				rounds: [
					{
						id: 0,
						points: 0,
						endNumber: 10,
						arrowNumber: 3,
						outdoor: 1,
						compound: 1,
						arrownumbers: 0,
						targetNumber: 1,
						distanceID: 7, // 25m
						targetFaceID: 12 // WA - Spot- 60cm
					},
					{
						id: 1,
						points: 0,
						endNumber: 10,
						arrowNumber: 3,
						outdoor: 1,
						compound: 1,
						arrownumbers: 0,
						targetNumber: 1,
						distanceID: 7, // 25m
						targetFaceID: 12 // WA - Spot- 60cm
					}
				]
			},
			{
				name: 'wa_outdoor_30m_80cm',
				rounds: [
					{
						id: 0,
						points: 0,
						endNumber: 10,
						arrowNumber: 3,
						outdoor: 1,
						compound: 1,
						arrownumbers: 0,
						targetNumber: 1,
						distanceID: 6, // 30m
						targetFaceID: 2 // WA - 80cm
					},
					{
						id: 1,
						points: 0,
						endNumber: 10,
						arrowNumber: 3,
						outdoor: 1,
						compound: 1,
						arrownumbers: 0,
						targetNumber: 1,
						distanceID: 6, // 30m
						targetFaceID: 2 // WA - 80cm
					}
				]
			},
			{
				name: 'wa_outdoor_compound_30m_80cm_spot_5',
				rounds: [
					{
						id: 0,
						points: 0,
						endNumber: 10,
						arrowNumber: 3,
						outdoor: 1,
						compound: 1,
						arrownumbers: 0,
						targetNumber: 1,
						distanceID: 4, // 50m
						targetFaceID: 16 // WA - 80cm
					},
					{
						id: 1,
						points: 0,
						endNumber: 10,
						arrowNumber: 3,
						outdoor: 1,
						compound: 1,
						arrownumbers: 0,
						targetNumber: 1,
						distanceID: 4, // 50m
						targetFaceID: 16 // WA - 80cm
					}
				]
			}
		],

		users: [
			{
				firstName: 'Max',
				lastName: 'Mustermann',
				gender: 'm',
				imagePath: null,
				association: null
			}
		]

	};

	return helper;

});
