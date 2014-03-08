angular.module('TFApp').config(function ($routeProvider) {

	'use strict';

	$routeProvider
		/*
		 * Home
		 */
		.when('/home', {
			templateUrl: 'views/home.html',
			controller: 'HomeCtrl'
		})
		/*
		 * About
		 */
		.when('/about', {
			templateUrl: 'views/about.html',
			controller: 'AboutCtrl'
		})
		/*
		 * Competitions
		 */
		.when('/competitions', {
			templateUrl: 'views/competitions.html',
			controller: 'CompetitionCtrl'
		})
		.when('/competitions/new', {
			templateUrl: 'views/competitionForm.html',
			controller: 'CompetitionCtrl'
		})
		.when('/competition/edit/:competitionID', {
			templateUrl: 'views/competitionForm.html',
			controller: 'CompetitionCtrl'
		})
		/*
		 * Distances
		 */
		.when('/distances', {
			templateUrl: 'views/distances.html',
			controller: 'DistanceCtrl'
		})
		.when('/distances/new', {
			templateUrl: 'views/distanceForm.html',
			controller: 'DistanceCtrl'
		})
		.when('/distance/edit/:distanceID', {
			templateUrl: 'views/distanceForm.html',
			controller: 'DistanceCtrl'
		})
		.when('/select/distance/', {
			templateUrl: 'views/distances.html',
			controller: 'RoundDistanceCtrl'
		})
		/*
		 * Bows
		 */
		.when('/bows', {
			templateUrl: 'views/bows.html',
			controller: 'BowCtrl'
		})
		.when('/bows/new', {
			templateUrl: 'views/bowForm.html',
			controller: 'BowCtrl'
		})
		.when('/bow/edit/:bowID', {
			templateUrl: 'views/bowForm.html',
			controller: 'BowCtrl'
		})
		.when('/bow/setMarker/new', {
			templateUrl: 'views/bowMarker.html',
			controller: 'BowMarkerCtrl'
		})
		.when('/bow/setMarker/:bowID', {
			templateUrl: 'views/bowMarker.html',
			controller: 'BowMarkerCtrl'
		})
		.when('/select/bow/', {
			templateUrl: 'views/bows.html',
			controller: 'RoundBowCtrl'
		})
		/*
		 * Arrowset
		 */
		.when('/arrowsets', {
			templateUrl: 'views/arrowsets.html',
			controller: 'ArrowsetCtrl'
		})
		.when('/arrowsets/new', {
			templateUrl: 'views/arrowsetForm.html',
			controller: 'ArrowsetCtrl'
		})
		.when('/arrowset/edit/:arrowsetID', {
			templateUrl: 'views/arrowsetForm.html',
			controller: 'ArrowsetCtrl'
		})
		.when('/select/arrowset/', {
			templateUrl: 'views/arrowsets.html',
			controller: 'RoundArrowsetCtrl'
		})
		/*
		 * Pattern
		 */
		.when('/pattern', {
			templateUrl: 'views/pattern.html',
			controller: 'PatternCtrl'
		})
		.when('/select/pattern/', {
			templateUrl: 'views/pattern.html',
			controller: 'PatternCtrl'
		})

		/*
		 * Rounds
		 */
		.when('/competition/:competitionID', {
			templateUrl: 'views/rounds.html',
			controller: 'RoundCtrl'
		})
		.when('/competition/:competitionID/new', {
			templateUrl: 'views/roundForm.html',
			controller: 'RoundCtrl'
		})
		.when('/competition/:competitionID/edit/:roundID', {
			templateUrl: 'views/roundForm.html',
			controller: 'RoundCtrl'
		})
		/*
		 * Ends
		 */
		.when('/round/:competitionID/:roundID', {
			templateUrl: 'views/ends.html',
			controller: 'EndCtrl'
		})
		/*
		 * ShootingPaper
		 */
		.when('/round/:competitionID/:roundID/shootingPaper', {
			templateUrl: 'views/shootingPaper.html',
			controller: 'ShootingPaperCtrl'
		})
		/*
		 * TargetFaces
		 */
		.when('/targetFaces', {
			templateUrl: 'views/targetFaces.html',
			controller: 'TargetFaceCtrl'
		})
		/*
		 * Settings
		 */
		.when('/settings', {
			templateUrl: 'views/settings.html',
			controller: 'SettingsCtrl'
		})
		.when('/settings/user', {
			templateUrl: 'views/userForm.html',
			controller: 'UserCtrl'
		})
		.when('/settings/end', {
			templateUrl: 'views/endSettingsForm.html',
			controller: 'EndSettingsCtrl'
		})
		.when('/settings/competitionDefaults', {
			templateUrl: 'views/competitionForm.html',
			controller: 'CompetitionCtrl'
		})
		.when('/settings/roundDefaults', {
			templateUrl: 'views/roundForm.html',
			controller: 'RoundCtrl'
		})
		.when('/settings/competitionTags', {
			templateUrl: 'views/competitionTags.html',
			controller: 'SettingsCtrl'
		})
		/*
		 * Help
		 */
		.when('/help', {
			templateUrl: 'views/help.html',
			controller: 'HelpCtrl'
		})
		.when('/help/:page', {
			templateUrl: 'views/help.html',
			controller: 'HelpCtrl'
		})

		.otherwise({
			redirectTo: '/home'
		});

});
