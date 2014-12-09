'use strict';

var users = require('../../app/controllers/users.server.controller'),
	chatrooms = require('../../app/controllers/chatroom.server.controller');

module.exports = function(app) {
	// Chatroom Routes
	app.route('/chatrooms')
		.get(chatrooms.list)
		.post(users.requiresLogin, chatrooms.create);
	
	app.route('/chatrooms/:chatroomId')
		.get(chatrooms.read)
		.put(users.requiresLogin, chatrooms.hasAuthorization, chatrooms.update)
		.delete(users.requiresLogin, chatrooms.hasAuthorization, chatrooms.delete);
		//.transmit(users.requiresLogin, chatrooms.broadcastMessage)
	
	// Finish by binding the compendium middleware
	app.param('chatroomId', chatrooms.chatroomByID);
};