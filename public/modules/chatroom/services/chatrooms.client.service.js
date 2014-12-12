'use strict';

angular.module('chatroom').factory('Chatrooms', ['$resource',
	function($resource) {
		// Chatrooms service logic
		return $resource('chatrooms/:chatroomId', {
			chatroomId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
		
	}
]);