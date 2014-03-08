angular.module('TFApp')
.service('dataService', function ($rootScope, $q, $i18next, helper) {

	'use strict';

	var
		/**
		 * Name of the database
		 * @type {String}
		 */
		dbName = 'TF',
		/**
		 * Database version (must be an integer)
		 * @type {String}
		 */
		dbVersion = '1.0',
		/**
		 * Database size (must be an integer)
		 * @type {Number}
		 */
		dbSize = 10 * 1024 * 1024,
		/**
		 * Description of the database
		 * @type {String}
		 */
		dbDescription = 'TF database',
		/**
		 * Internal reference to database
		 * @type {Object}
		 */
		db = null,
		/**
		 * Database schema
		 * @type {Object}
		 */
		schema = {
			settings: true,
			competitions: true,
			bows: true,
			arrowsets: true,
			distances: true,
			targetFaces: true,
			pattern: {
				reset: true
			},
			users: true
		},
		/**
		 * Namespace for data functions, etc.
		 * @type {Object}
		 */
		dataService = {},
		dataLoaded = false;

	dataService.schema = schema;

	/**
	 * Updates the data in $rootScope which itself refreshes it in every
	 * $scope
	 */
	function broadcastUpdated() {
		$rootScope.$broadcast('dataUpdated');
	}

	// requireData promise list
	var RequireTablePromiseList = [];
	function resolveRequirePromises() {
		for (var i = 0, il = RequireTablePromiseList.length; i < il; i++) {
			RequireTablePromiseList[i].resolve();
		}
		RequireTablePromiseList = [];
	}

	/**
	 * Returns a promise which is resolved when database is initialized.
	 * @param  {Array}   tables The required tables. Was useful when using IndexedDB.
	 * @return {Promise} Angular $q promise
	 */
	var requireData = dataService.requireData = function (tables) {

		var deferred = $q.defer();

		if (dataLoaded) {

			deferred.resolve();

		} else {
			// Is resolved when databse is initialized.
			RequireTablePromiseList.push(deferred);
		}

		return deferred.promise;

	};

	/**
	 * Adds data to a table.
	 * @param {String}   table    Table to insert data in
	 * @param {Array}    data     Items to insert
	 */
	dataService.add = function (table, data) {

		var deferred = $q.defer();

		if (!schema[table]) {
			deferred.reject({msg: table + ' does not exists in database!'});
			return deferred.promise;
		}

		function insert(tx, table, id, data) {
			tx.executeSql('INSERT INTO ' + table + ' (id, data) VALUES (?, ?)', [id, data]);
		}

		requireData().then(function () {

			var id = dataService[table].length > 0 ? (parseInt(dataService[table][dataService[table].length - 1].id, 10) + 1) : 1;

			db.transaction(function (tx) {

				for (var i = 0; i < data.length; i++) {

					console.log('TF :: data_sql :: adding entry :: new id:', id);

					data[i].id = id;

					insert(tx, table, id, JSON.stringify(data[i]));

					dataService[table].push(data[i]);
					dataService[table + 'ById'][id] = data[i];

					id++;
				}

			}, function (err) {

				deferred.reject({error: err, msg: 'Add: Error processing SQL: ' + err.code});

				throw new Error('Add: Error processing SQL: ' + err.code);

			}, function () {

				console.log('TF :: data_sql :: successfully added entry/entries');

				broadcastUpdated();

				deferred.resolve(data);

			});

		});

		return deferred.promise;

	};

	/**
	 * Adds data to a table.
	 * @param {String}   table    Table to update data
	 * @param {Array}    data     Items to update
	 */
	dataService.update = function (table, data) {

		var deferred = $q.defer();

		if (!schema[table]) {
			deferred.reject({msg: table + ' does not exists in database!'});
			return deferred.promise;
		}

		function update(tx, table, id, data) {
			tx.executeSql('UPDATE ' + table + ' SET data=? WHERE id=?', [data, id]);
		}

		requireData().then(function () {

			db.transaction(function (tx) {

				for (var i = 0; i < data.length; i++) {

					update(tx, table, data[i].id, JSON.stringify(data[i]));

					dataService[table + 'ById'][data[i].id] = data[i];

				}

			}, function (err) {

				deferred.reject({error: err, msg: 'Update: Error processing SQL: ' + err.code});

				throw new Error('Update: Error processing SQL: ' + err.code);

			}, function () {

				var itemsLeftToUpdate = data.length;

				for (var i = 0; i < dataService[table].length; i++) {
					for (var j = 0; j < data.length; j++) {

						if (dataService[table][i].id === data[j].id) {

							dataService[table][i] = data[j];

							if (itemsLeftToUpdate--) {
								break;
							}
						}

					}
				}

				console.log('TF :: data_sql :: successfully edited entry');

				broadcastUpdated();
				deferred.resolve(data);

			});

		});

		return deferred.promise;

	};

	/**
	 * Remove an item from
	 * @param  {String}   table    Table in the database to delete from
	 * @param  {Array}    idList   List of ids in the table to remove
	 */
	dataService.remove = function (table, idList) {

		var deferred = $q.defer();

		if (!schema[table]) {
			deferred.reject({msg: table + ' does not exists in database!'});
			return deferred.promise;
		}

		function remove (tx, tableName, id) {

			tx.executeSql('DELETE FROM ' + tableName + ' WHERE id=?', [id], function () {

				var table = dataService[tableName];

				for (var j = 0; j < table.length; j++) {
					if (!!table[j] && table[j].id === id) {
						dataService[tableName].splice(j, 1);
					}
				}

				delete dataService[tableName + 'ById'][id];

			});

		}

		requireData().then(function () {

			db.transaction(function (tx) {

				for (var i = 0; i < idList.length; i++) {

					remove(tx, table, idList[i]);

				}

			}, function (err) {

				deferred.reject({error: err, msg: 'Remove: Error processing SQL: ' + err.code});

				throw new Error('Remove: Error processing SQL: ' + err.code);

			}, function () {

				console.log('TF :: data_sql :: successfully removed entry');

				broadcastUpdated();
				deferred.resolve(idList);

			});

		});

		return deferred.promise;

	};

	/**
	 * Clears all data from the given tables
	 * @param  {Array}    tables   Tables to clear
	 */
	dataService.clear = function (tables) {

		var deferred = $q.defer();

		tables = tables || [];

		function clear (tx, table) {

			tx.executeSql('DELETE FROM ' + table, [], function () {

				// result is the id
				dataService[table + 'ById'] = [];
				dataService[table] = [];

			});

		}

		requireData().then(function () {

			db.transaction(function (tx) {

				for (var i = 0; i < tables.length; i++) {

					var table = tables[i];

					if (!schema[table]) {

						console.error(table + ' does not exists in database! Can not delete table!');

					} else {

						clear(tx, table);

					}
				}

			}, function (err) {

				deferred.reject({error: err, msg: 'Clear: Error processing SQL: ' + err.code});

				throw new Error('Clear: Error processing SQL: ' + err.code);

			}, function () {

				console.log('TF :: data_sql :: successfully cleared table(s)');

				broadcastUpdated();
				deferred.resolve();

			});

		});

		return deferred.promise;

	};

	function checkForUpdate (table) {

		if (table === 'settings' && !dataService.settings[0].competitionTags) {

			dataService.settings[0].competitionTags = $rootScope.helper.exampleData.settings[0].competitionTags;
			dataService.update('settings', dataService.settings).then(function () {
				console.log('TF :: data_sql :: added competitionTags');
			});

		}

	}

	//TODO
	dataService.doUpdate = function (version) {

		switch (version) {

		case '0.8.6':

			requireData().then(function () {

			});

			break;

		default:
			break;


		}

	};

	function init() {

		var deferred = $q.defer();

		db = window.openDatabase(dbName, dbVersion, dbDescription, dbSize);

		if (!db) {
			throw new Error('Can NOT open database');
		}

		function selectData (tx, table) {
			tx.executeSql('SELECT * FROM ' + table, [], function (tx, results) {

				for (var i = 0, len = results.rows.length; i < len; i++) {

					var result = results.rows.item(i),
						data = JSON.parse(result.data);

					dataService[table][i] = data;
					dataService[table + 'ById'][result.id] = data;
				}

			});
		}

		db.transaction(function (tx) {

			for (var table in schema) {

				if (schema.hasOwnProperty(table)) {

					if (schema[table].reset) {
						tx.executeSql('DROP TABLE IF EXISTS ' + table );
					}

					tx.executeSql('CREATE TABLE IF NOT EXISTS ' + table + ' (id INTEGER PRIMARY KEY, data TEXT)');

				}

				dataService[table] = [];
				dataService[table + 'ById'] = [];

				selectData(tx, table);

			}

		}, function (err) {

			deferred.reject({error: err, msg: 'Init: Error processing SQL: ' + err.code});

			throw new Error('Init: Error processing SQL: ' + err.code);

		}, function () {

			dataLoaded = true;

			// Success
			console.log('TF :: data_sql :: successfully loaded db');

			console.log(dataService, !dataService.settings.length, $rootScope.helper.exampleData);

			if (!dataService.settings.length) {
				dataService.add('settings', $rootScope.helper.exampleData.settings);
			} else {
				checkForUpdate('settings');
			}

			if (!dataService.users.length) {
				dataService.add('users', $rootScope.helper.exampleData.users);
			}

			if (!dataService.targetFaces.length) {
				dataService.add('targetFaces', $rootScope.helper.exampleData.targetFaces);
			}

			if (!dataService.distances.length) {
				dataService.add('distances', $rootScope.helper.exampleData.distances);
			}

			if (!dataService.pattern.length) {
				var pattern = $rootScope.helper.exampleData.pattern;

				for (var i = 0; i < pattern.length; i++) {
					for (var j = 0; j < pattern[i].rounds.length; j++) {
						pattern[i].rounds[j].name = $i18next('round') + ' ' + (j + 1);
					}
				}

				dataService.add('pattern', $rootScope.helper.exampleData.pattern);
			}

			deferred.resolve();

			/*
			 * We're using 'requireData' to fire all promises
			 */
			//requireData(true);
			/*
			 * And broadcast that data has been updated
			 */
			broadcastUpdated();

		});

		return deferred.promise;

	}

	if (window.deviceready) {
		init().then(function () {
			resolveRequirePromises();
		});
	} else {
		document.addEventListener('appLoaded', function () {
			init().then(function () {
				resolveRequirePromises();
			});
		}, false);
	}

	return dataService;

});
