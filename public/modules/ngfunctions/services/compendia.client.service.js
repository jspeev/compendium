'use strict';

angular.module('ngfunctions').factory('Compendia', ['$resource',
	function($resource) {
		// Compendia service logic
		return $resource('compendia/:compendiumId', {
			compendiumId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
		
	}
]);