'use strict';

var users = require('../../app/controllers/users.server.controller'),
	chatrooms = require('../../app/controllers/chatroom.server.controller');

module.exports = function(app) {
	// Chatroom Routes
	app.route('/chatrooms')
		.get(chatrooms.list)
		.post(users.requiresLogin, chatrooms.create);
	
	app.route('/chatrooms/:chatroomId')
		.get(users.requiresLogin,chatrooms.read)
		.put(users.requiresLogin, chatrooms.hasAuthorization, chatrooms.update)
		.delete(users.requiresLogin, chatrooms.hasAuthorization, chatrooms.delete);

	app.route('/chatrooms/:chatroomId/broadcastMessage')
		.post(chatrooms.broadcastMessage);
		/*
	app.route('/chatrooms/:chatroomId/userList')
		.get(chatrooms.getUserList);
*/
	// Finish by binding the chatroom middleware
	app.param('chatroomId', chatrooms.chatroomByID);
	
}; 