angular.module('mobile-navigate').directive('ngTaphold', function ($timeout) {

	'use strict';

	var _duration = 1500, // -> 1.5s
		timeout,
		startTime,
		endTime,
		startX,
		startY,
		curX,
		curY,
		hasMoved = false,
		wasTaphold = false;


	function taphold(scope, element, attrs) {

		console.log('TF :: taphold :: user made taphold');

		$timeout.cancel(timeout);

		endTime = new Date().getTime();


		if (!hasMoved && (endTime - startTime) >= _duration) {

			wasTaphold = true;
			scope.$apply(attrs['ngTaphold'], element);

		}

	}

	return function (scope, element, attrs) {

		element.bind('touchstart', function (e) {

			hasMoved = false;

			startTime = new Date().getTime();
			startX = e.originalEvent.touches[0].pageX;
			startY = e.originalEvent.touches[0].pageY;

			timeout = $timeout(function () {
				taphold(scope, element, attrs);
			}, _duration);

		});

		element.bind('touchmove', function (e) {

			if (hasMoved) { return; }

			curX = e.originalEvent.touches[0].pageX;
			curY = e.originalEvent.touches[0].pageY;

			if (curX > (startX + 10) ||
				curX < (startX - 10) ||
				curY > (startY + 10) ||
				curY < (startY - 10)
			) {
				hasMoved = true;
			}

		});

		element.bind('touchend', function () {

			$timeout.cancel(timeout);

			if (wasTaphold) {
				wasTaphold = false;
				return false;
			}

		});

	};

});
