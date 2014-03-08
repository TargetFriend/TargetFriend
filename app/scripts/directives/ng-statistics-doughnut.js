angular.module('TFApp').directive('ngStatisticsDoughnut', function ($rootScope, $timeout) {

	'use strict';

	var width = window.innerWidth - 100;

	function setChart(element, data) {

		console.log('chartData', data);

		if (!data || data.data.length === 0) {
			return;
		}

		var options = data.options || {};

		element = element[0];

		element.width = width;
		element.height = width;
		element.style.margin = '50px';

		var ctx = element.getContext('2d');

		$timeout(function () {
			var myNewChart = new Chart(ctx).Doughnut(data.data, options);
			console.log('New chart', myNewChart);
		}, 1200);
	}

	return {

		// 'A': only as attribute
		restrict: 'A',

		link: function (scope, element, attrs) {

			attrs.$observe('ngStatisticsDoughnut', function (value) {

				setChart(element, scope.$eval(value));

			});

		}

	};

});
