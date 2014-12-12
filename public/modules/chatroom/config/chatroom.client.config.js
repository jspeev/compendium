'use strict';

// Chatroom module config
angular.module('chatroom').run(['Menus',
	function(Menus) {
		// Config logic
		Menus.addMenuItem('topbar', 'Chatrooms', 'chatrooms', 'dropdown', '/chatrooms(/create)?');
		Menus.addSubMenuItem('topbar', 'chatrooms', 'List Chatrooms', 'chatrooms');
		Menus.addSubMenuItem('topbar', 'chatrooms', 'New Chatroom', 'chatrooms/create');
	}
]);