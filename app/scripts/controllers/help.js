angular.module('TFApp').controller('HelpCtrl', function ($rootScope, $routeParams, $scope, $i18next) {

	'use strict';

	/*
	 * Set the sidebar items
	 */
	$rootScope.setSidebar('help');

	function init () {

		$scope.heading = $i18next('helpPage.heading');

		$scope.leftButton = {
			iconClass: 'fa-bars',
			tap: function () {
				$scope.snapRemote.open('left');
			}
		};

		$scope.page = $routeParams.page;

	}

	init();

});
