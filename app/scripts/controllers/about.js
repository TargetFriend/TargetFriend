angular.module('TFApp').controller('AboutCtrl', function ($rootScope, $scope, $i18next) {

	'use strict';

	var contents = [];

	/*
	 * Set the sidebar items
	 */
	$rootScope.setSidebar('about');

	$scope.userDetails = {
		firstName: ''
	};

	function init () {

		$scope.heading = $i18next('aboutPage.heading');

		$scope.leftButton = {
			iconClass: 'fa-reorder',
			tap: function () {
				$scope.snapRemote.open('left');
			}
		};

		$scope.data.requireData(['settings', 'users']).then(function () {
			$scope.userDetails = $scope.data.users[0];
		});

	}

	contents.push('aboutPage.content_intro');
	contents.push('aboutPage.content_main');
	contents.push('aboutPage.content_outro');

	$scope.contents = contents;

	$scope.links = [
		'http://www.bogensportinfo.de/board/index.php',
		'http://bogenundpfeile.de/',
		'http://www.bogensport-extra.de/',
		'http://www.bb-bogenschiessen.de/'
	];

	$scope.open = function (link) {
		window.open(link, '_system', 'location=yes');
	};

	init();

});
