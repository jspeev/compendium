'use strict';

//Setting up route
angular.module('chatroom').config(['$stateProvider',
	function($stateProvider) {
		// Chatroom state routing
		$stateProvider.
		state('chatroom', {
			url: '/chatroom',
			templateUrl: 'modules/chatroom/views/chatroom.client.view.html'
		});
	}
]);