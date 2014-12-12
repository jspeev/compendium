'use strict';

//Setting up route
angular.module('chatroom').config(['$stateProvider',
	function($stateProvider) {
		// Chatroom state routing
		$stateProvider.
		state('listChatrooms', {
			url: '/chatrooms',
			templateUrl: 'modules/chatroom/views/list-chatroom.client.view.html'
		}).
		state('createChatroom', {
			url: '/chatrooms/create',
			templateUrl: 'modules/chatroom/views/create-chatroom.client.view.html'
		}).
		state('viewChatroom', {
			url: '/chatrooms/:chatroomId',
			templateUrl: 'modules/chatroom/views/view-chatroom.client.view.html'
		}).
		state('editChatroom', {
			url: '/chatrooms/:chatroomId/edit',
			templateUrl: 'modules/chatroom/views/edit-chatroom.client.view.html'
		});
	}
]);