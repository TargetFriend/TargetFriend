angular.module('TFApp').directive('ngStatisticsPie', function ($rootScope, $timeout) {

	'use strict';

	var width = window.innerWidth - 180;

	if (width > 500) {
		width = 350;
	}

	function setChart(element, data) {

		if (!data || data.data.length === 0) {
			return;
		}

		var options = data.options || {};

		element = element[0];

		element.width = width;
		element.height = width;
		element.style.margin = '50px auto';
		element.style.display = 'block';

		var ctx = element.getContext('2d');

		$timeout(function () {
			var myNewChart = new Chart(ctx).Pie(data.data, options);
			console.log('New pie chart:', myNewChart);
		}, 1200);

	}

	return {

		// 'A': only as attribute
		restrict: 'A',

		link: function (scope, element, attrs) {

			attrs.$observe('ngStatisticsPie', function (value) {

				setChart(element, scope.$eval(value));

			});

		}

	};

});
