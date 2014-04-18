'use strict';

describe('Service: Helper', function () {

	beforeEach(module('TFApp'));
	beforeEach(module('template'));

	var $httpBackend,
		helper;

	beforeEach(inject(function ($injector) {

		$httpBackend = $injector.get('$httpBackend');
		helper       = $injector.get('helper');

		$httpBackend.whenGET('./config.json').respond({
			appName: 'TargetFriend',
			version: '0.9.0',
			versionCode: 90,
			compatibility: {
				sinceVersion: '0.8.8',
				sinceVersionCode: '88'
			},
			updateCheck: {
				url: 'http://andremeyering.de/tf_news/latest_version.txt'
			}
		});

	}));

	afterEach(function() {
		$httpBackend.flush();
	});

	it('should parse correct date', function () {
		var date = 'Fri Apr 5 2014 14:00:00 GMT+0200 (CEST)';
		expect(helper.parseDate(date)).toBe('05.04.2014');
	});

	it('should create an ampty arrow-array', function () {

		var arrowsetData = [
			{
				x: 0,
				y: 0,
				ring: 0,
				active: false,
				id: 0
			},
			{
				x: 0,
				y: 0,
				ring: 0,
				active: false,
				id: 1
			}
		];

		expect(helper.createEmptyArrows(2, 2)).toEqual([
			{
				data: arrowsetData
			},
			{
				data: arrowsetData
			}
		]);

	});

	describe('checkCompoundRing(): ', function () {

		it('should return compound ring (X->10; 10->9)', function () {
			expect(helper.checkCompoundRing(true, 'X')).toBe(10);
			expect(helper.checkCompoundRing(true, '10')).toBe(9);
			expect(helper.checkCompoundRing(true, 10)).toBe(9);
		});

		it('should NOT return compound ring', function () {
			expect(helper.checkCompoundRing(false, 'X')).toBe('X');
			expect(helper.checkCompoundRing(false, '10')).toBe('10');
			expect(helper.checkCompoundRing(false, 10)).toBe(10);
		});

	});

	describe('ringToNumber():', function () {

		it('should return numbers and not strings', function () {
			expect(helper.ringToNumber(false, 'X')).toBe(10);
			expect(helper.ringToNumber(false, '10')).toBe(10);
			expect(helper.ringToNumber(false, 'M')).toBe(0);
		});

		it('should return numbers and not strings and should check for compound ring', function () {
			expect(helper.ringToNumber(true, 'X')).toBe(10);
			expect(helper.ringToNumber(true, '10')).toBe(9);
			expect(helper.ringToNumber(true, 'M')).toBe(0);
		});

	});

});
