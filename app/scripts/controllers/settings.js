angular.module('TFApp').controller('SettingsCtrl', function ($rootScope, $scope, $routeParams, $location, $navigate, $timeout, $i18next) {

	'use strict';

	var helper = $scope.helper;

	$scope.$navigate = $navigate;

	$rootScope.setSidebar('settings');

	/**
	 * Whether to support DropBox usage
	 * @type {Boolean}
	 */
	$scope.useDropbox = false;
	/**
	 * Whether the user is logged into dropbox
	 * @type {Boolean|Null}
	 */
	$scope.dropboxLoggedIn = null;
	/**
	 * Dropbox.js object
	 * @type {Object}
	 */
	var client = null,
		settings = null,
		isCompetitionTagPage;

	$scope.isSaving = false;
	$scope.isSaved = false;

	$scope.showSettingsPart = 'none';

	$scope.competitionTags = null;

	function init () {

		$scope.useDropbox = (localStorage.getItem('useDropbox') === 'true');

		isCompetitionTagPage = $location.path().match(/(competitionTags)/);

		settings = $scope.data.settings[0] || {};

		$scope.heading = isCompetitionTagPage ? $i18next('tag_plural') : $i18next('setting_plural');

		if (isCompetitionTagPage) {

			$scope.competitionTags = settings ? settings.competitionTags : null;

			$scope.addTag = function () {
				$scope.competitionTags.push({
					id: $scope.competitionTags.length || 0,
					name: ''
				});
			};

			$scope.leftButton = {
				name: 'back',
				iconClass: 'fa-chevron-left',
				tap: function () {
					$navigate.back();
				}
			};

		} else {

			$scope.leftButton = {
				name: 'menu',
				tap: function () {
					$scope.snapRemote.open('left');
				}
			};

			$scope.userDetails = $scope.data.users[0];

		}
	}

	$scope.saveCompetitionTags = function (competitionTags) {

		settings.competitionTags = competitionTags;

		$scope.isSaving = true;

		$scope.data.update('settings', [settings]).then(function (settings) {

			$scope.isSaving = false;
			$scope.isSaved = true;

			$timeout(function () {
				$scope.isSaved = false;
			}, 2000);

			$navigate.back();

			console.log('TF :: settings :: saved competitionTags', settings);

		});

	};

	$scope.saveDropboxState = function () {
		window.localStorage.setItem('useDropbox', $scope.useDropbox);
	};

	function setAuthDriver (client) {

		// Set authentication mode
		if (isPhoneGap) {

			// https://github.com/dropbox/dropbox-js/blob/stable/guides/builtin_drivers.md
			client.authDriver(new Dropbox.AuthDriver.Cordova({
				receiverUrl: 'http://localhost:9000/dropboxReceiver.html',
				rememberUser: true
			}));

		} else {

			client.authDriver(new Dropbox.AuthDriver.Popup({
				receiverUrl: 'http://localhost:9000/dropboxReceiver.html',
				rememberUser: true
			}));

		}
	}

	$scope.dropboxInit = function () {

		// https://www.dropbox.com/developers/apps/info/{{appConfig.dropbox.key}}
		client = new Dropbox.Client({
			key: $rootScope.appConfig.dropbox.key
		});

		setAuthDriver(client);

		client.authenticate({interactive:false}, function (error, client) {

			if (error) {
				return showDropboxError(error);
			}
			$scope.dropboxLoggedIn = client.isAuthenticated();

		});

	};

	$scope.dropboxToggle = function () {

		if ($scope.dropboxLoggedIn) {

			client.signOut(function (error) {

				if (error) {
					return showDropboxError();
				}

				$scope.$apply(function () {
					helper.alert('Erfolgreich ausgeloggt!', 'Ausgeloggt!');
					$scope.dropboxLoggedIn = false;
				});

			});

		} else {

			setAuthDriver(client);

			$scope.dropboxLoggedIn = null;

			client.authenticate(function (error) {
				if (error) {
					return showDropboxError(error);
				}
			});

		}

	};

	var saveBackupToDropbox = function (filename, jsonData) {

		client.writeFile(filename, jsonData, function (error, stat) {

			window.showLoader(false);

			if (error) {
				return showDropboxError(error);  // Something went wrong.
			}

			helper.alert('Das Backup wurde erfolgreich gespeichert! Dateigröße: ' + stat.humanSize, 'Gespeichert');

		});

	};

	var showDropboxError = function(error) {

		window.showLoader(false);

		switch (error.status) {

		case Dropbox.ApiError.INVALID_TOKEN:
			// If you're using dropbox.js, the only cause behind this error is that
			// the user token expired.
			// Get the user through the authentication flow again.
			// https://github.com/dropbox/dropbox-js/blob/stable/guides/getting_started.md

			helper.alert('Please log in again!');
			break;

		case Dropbox.ApiError.NOT_FOUND:
			// The file or folder you tried to access is not in the user's Dropbox.
			// Handling this error is specific to your application.

			helper.alert('Folder not found!');
			break;

		case Dropbox.ApiError.OVER_QUOTA:
			// The user is over their Dropbox quota.
			// Tell them their Dropbox is full. Refreshing the page won't help.

			helper.alert('Your Dropbox is full!');
			break;

		case Dropbox.ApiError.RATE_LIMITED:
			// Too many API requests. Tell the user to try again later.
			// Long-term, optimize your code to use fewer API calls.

			helper.alert('Too many requests! Try again later!');
			break;

		case Dropbox.ApiError.NETWORK_ERROR:
			// An error occurred at the XMLHttpRequest layer.
			// Most likely, the user's network connection is down.
			// API calls will not succeed until the user gets back online.

			helper.alert('Network error! Are you still online?');
			break;

		case Dropbox.ApiError.INVALID_PARAM:
		case Dropbox.ApiError.OAUTH_ERROR:
		case Dropbox.ApiError.INVALID_METHOD:
		/* falls through */
		default:
			helper.alert('Error! Please refresh the app!');
			console.log(error);
			// Caused by a bug in dropbox.js, in your application, or in Dropbox.
			// Tell the user an error occurred, ask them to refresh the page.
		}

	};

	$scope.enable = function (type) {

		var types = {
				bows: true,
				arrowsets: true,
				distances: true
			},
			enabled = 0,
			data;

		if (!types[type]) {
			return;
		}

		data = $scope.data[type];

		function update (i) {
			$scope.data.update(type, [data[i]]).then(function () {});
		}

		for (var i = 0; i < data.length; i++) {

			if (data[i].disabled) {

				enabled++;

				data[i].disabled = false;

				update(i);

			}

		}

		console.log('enabled ' + type, enabled);

		if (type === 'bows') {

			$scope.helper.alert($i18next('settingsPage.enableBowsSuccessMsg', {number: enabled}), $i18next('settingsPage.enableBowsSuccessTitle'));

		} else if (type === 'arrowsets') {

			$scope.helper.alert($i18next('settingsPage.enableArrowsetsSuccessMsg', {number: enabled}), $i18next('settingsPage.enableArrowsetsSuccessTitle'));

		} else if (type === 'distances') {

			$scope.helper.alert($i18next('settingsPage.enableDistancesSuccessMsg', {number: enabled}), $i18next('settingsPage.enableDistancesSuccessTitle'));

		}

	};

	/*
	 * Creates a backup
	 */
	$scope.createBackup = function () {

		window.showLoader(true);

		var data = {
			backup: {
				appName: window.archeryAppName,
				version: $scope.version,
				firstInstalledVersion: window.localStorage.getItem('firstInstalledVersion'),
				date: new Date(),
				device: {
					cordova: window.device.cordova,
					model: window.device.model,
					platform: window.device.platform,
					version: window.device.version,
					name: window.device.name
				}
			}
		};

		var dataService = $scope.data,
			schema = dataService.schema,
			date = new Date(),
			filename = [
				'backup_',
				date.getDate(),
				'-',
				(date.getMonth() + 1),
				'-',
				date.getFullYear(),
				'_',
				date.getHours(),
				'-',
				date.getMinutes(),
				'.txt'
			].join('');

		for (var table in schema) {
			if (schema.hasOwnProperty(table)) {
				data[table] = dataService[table];
			}
		}

		var backup = JSON.stringify(data);

		helper.saveFile(filename, backup, function () {

			window.showLoader(false);

			helper.alert($i18next('backup.success.msg'), $i18next('backup.success.title'), function () {

				if (!$scope.dropboxLoggedIn) {
					return;
				}

				helper.confirm('Auch in Dropbox speichern?', 'Dropbox?', function (index) {

					window.showLoader(true);

					if (!index) {
						window.showLoader(false);
						return;
					}

					saveBackupToDropbox(filename, backup);

				});

			});

		});

	};

	$scope.selectBackup = function () {

		$scope.backups = [];

		console.log('Gonna search for entries!');

		function toArray(list) {
			return Array.prototype.slice.call(list || [], 0);
		}

		function createEntryList (entries) {

			for (var i = 0; i < entries.length; i++) {
				if (entries[i].isFile) {
					$scope.backups[i] = entries[i];
				}
			}

			$scope.i18nextBackupOptions = {count: entries.length};

			if (!$scope.$$phase) {
				$rootScope.$digest();
			}
		}

		function getFiles(dirEntry) {

			var dirReader = dirEntry.createReader(),
				entries = [];

			// Call the reader.readEntries() until no more results are returned.
			var readEntries = function() {
				dirReader.readEntries (function (results) {

					if (!results.length) {

						createEntryList(entries.sort());

					} else {

						entries = entries.concat(toArray(results));
						readEntries();

					}

				}, helper.FSError);
			};

			readEntries(); // Start reading dirs.

		}

		helper.getTFDirectory(getFiles);

	};

	$scope.restoreFromBackup = function (fileEntry) {

		window.showLoader(true);

		helper.getFileContent(fileEntry, function (content) {

			var dataObj = JSON.parse(content),
				dataService = $scope.data,
				tables = [],
				i = 0;

			helper.confirm($i18next('restoration.confirm.title'), $i18next('restoration.confirm.msg',
				{oldVersion: dataObj.backup.version, newVersion: $scope.version}), function (index) {

				if (!index) {
					return;
				}


				for (var table in dataService.schema) {
					if (dataService.schema.hasOwnProperty(table)) {
						tables.push(table);
					}
				}

				dataService.clear(tables).then(function () {

					console.log('Database cleared!');

					for (var table in dataObj) {

						if (dataObj.hasOwnProperty(table) && dataService.schema[table]) {
							/*jshint loopfunc:true*/
							dataService.add(table, dataObj[table]).then(function () {

								console.log(table, ' restored!');
								i++;

								if (i === tables.length) {

									window.showLoader(false);
									console.log('Succesfully resotred everything!');
									helper.alert($i18next('restoration.success.msg'), $i18next('restoration.success.title'));

								}

							}, function (error) {
								console.error(error.msg);
							});
							/*jshint loopfunc:false*/
						}

					}

				});

			});
		});

	};

	$scope.data.requireData(['settings']).then(function () {
		init();
	});
});
