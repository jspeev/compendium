'use strict';

//Setting up route
angular.module('ngfunctions').config(['$stateProvider',
	function($stateProvider) {
		// Ngfunctions state routing
		$stateProvider.
		state('listNgfunctions', {
			url: '/compendia',
			templateUrl: 'modules/ngfunctions/views/list-ngfunctions.client.view.html'
		}).
		state('createNgfunction', {
			url: '/compendia/create',
			templateUrl: 'modules/ngfunctions/views/create-ngfunction.client.view.html'
		}).
		state('viewNgfunction', {
			url: '/compendia/:compendiumId',
			templateUrl: 'modules/ngfunctions/views/view-ngfunction.client.view.html'
		}).
		state('editNgfunction', {
			url: '/compendia/:compendiumId/edit',
			templateUrl: 'modules/ngfunctions/views/edit-ngfunction.client.view.html'
		});
	}
]);