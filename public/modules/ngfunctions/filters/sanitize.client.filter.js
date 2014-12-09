'use strict';

angular.module('ngfunctions').filter('sanitize',  ['$sce',
	function($sce) {
		return function(htmlcode) {
			return $sce.trustAsHtml(htmlcode);
		};
	}
]);