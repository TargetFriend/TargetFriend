// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {

	config.set({

		// base path, that will be used to resolve files and exclude
		basePath: '',

		// testing framework to use
		frameworks: ['jasmine'],

		// list of files / patterns to load in the browser
		files: [
			'app/bower_components/jquery/dist/jquery.js',
			'app/bower_components/angular/angular.js',
			'app/bower_components/angular-mocks/angular-mocks.js',
			'app/bower_components/angular-sanitize/angular-sanitize.js',
			'app/bower_components/angular-route/angular-route.js',
			'app/bower_components/angular-mobile-nav/mobile-nav.js',
			'app/bower_components/i18next/i18next.js',
			'app/bower_components/angular-touch/angular-touch.js',
			'app/bower_components/ng-i18next/dist/ng-i18next.js',
			'app/bower_components/angular-mobile-nav/mobile-nav.js',
			'app/bower_components/angular-bindonce/bindonce.js',
			'app/bower_components/archerTarget.js/dist/archerTarget.js',
			'app/bower_components/archerTarget.js/dist/targets/archerTarget.targets.js',
			'app/bower_components/archerTarget.js/src/plugins/appZoom/appZoom.js',
			'app/bower_components/archerTarget.js/src/plugins/statistic/statistic.js',
			'app/bower_components/snapjs/snap.js',
			'app/bower_components/angular-snap/angular-snap.js',
			'app/bower_components/Chart.js/Chart.min.js',
			'app/bower_components/dropbox/index.js',
			'app/scripts/*.js',
			'app/scripts/**/*.js',
			//'test/mock/**/*.js',
			'test/spec/**/*.js',

			'app/index_app.html',
			'app/views/*.html'

		],

		// list of files / patterns to exclude
		exclude: [
			'app/scripts/services/data.js'
		],

		preprocessors: {
			'**/*.html': ['ng-html2js']
		},

		ngHtml2JsPreprocessor: {

			stripPrefix: 'app/',

			// setting this option will create only a single module that contains templates
			// from all the files, so you can load them all with module('foo')
			moduleName: 'template'
		},

		// web server port
		port: 8080,

		browserDisconnectTimeout: 3000,

		// level of logging
		// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
		logLevel: config.LOG_INFO,

		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: false,
		// Start these browsers, currently available:
		// - Chrome
		// - ChromeCanary
		// - Firefox
		// - Opera
		// - Safari (only Mac)
		// - PhantomJS
		// - IE (only Windows)
		browsers: ['PhantomJS'],

		// Continuous Integration mode
		// if true, it capture browsers, run tests and exit
		singleRun: false
	});
};
