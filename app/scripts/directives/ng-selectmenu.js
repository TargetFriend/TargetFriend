angular.module('TFApp').directive('ngSelectmenu', function () {

	'use strict';

	var isOpen = false,
		tmpData = null;

	return {
		replace: false,
		restrict: 'A',
		templateUrl: 'views/selectmenu.html',
		link: function (scope, element) {

			scope.items = [];

			scope.clickItem = function (dataName) {

				if (dataName) {
					element.find('[data-id="' + dataName + '"]').addClass('active');
				}

				if (scope.onSelectMenuTap) {
					scope.onSelectMenuTap(dataName, tmpData);
				}

			};

			/**
			 * Opens the select menu
			 * @param {} data Data which will be submitted to onSelectMenuTap()
			 */
			scope.openSelectmenu = function (data, config) {
				isOpen = true;
				tmpData = data;
				scope.items = config ? config.items : [];
				element.addClass('active');
			};

			scope.closeSelectmenu = function () {
				isOpen = false;
				element.removeClass('active');
				element.find('.active').removeClass('active');
			};

		}
	};

});
