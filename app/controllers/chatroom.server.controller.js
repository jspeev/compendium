'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Chatroom = mongoose.model('Chatroom'),
    _ = require('lodash');


/**
 * Create a Chatroom
 */
exports.create = function(req, res) {
	
	var chatroom = new Chatroom(req.body);
	
	chatroom.user = req.user;
	
	chatroom.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(chatroom);
		}
	});
	
};

/**
 * Show the current Chatroom
 */
exports.read = function(req, res) {
	
	//var socket = req.app.get('socketio');
	
	res.json(req.chatroom);
};

/**
 * Remove from current Chatroom
 */
 /*
exports.expelUser = function(req,res){
	
	var socket = req.app.get('socketio');
	socket.emit('test', {'uh':'go'});
	//socket.emit('expelUser',{'name':req.param.username,'roomId':req.chatroom.id});
	res.send('user expelled');
	
};
*/
/**
 * Update a Chatroom
 */
exports.update = function(req, res) {
	
	var chatroom = req.chatroom;

	chatroom = _.extend(chatroom, req.body);

	chatroom.save(function(err) {
		
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(chatroom);
		}
		
	});
	
};

/**
 * Delete an Chatroom
 */
exports.delete = function(req, res) {
	
	var chatroom = req.chatroom;

	chatroom.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(chatroom);
		}
	});
};

/**
 * List of Chatrooms
 */
exports.list = function(req, res) {

	Chatroom.find().sort('-created').populate('user', 'displayName').exec(function(err, chatrooms) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(chatrooms);
		}
	});
	
};

/**
 * Chatroom middleware
 */
exports.chatroomByID = function(req, res, next, id) {
	Chatroom.findById(id).populate('user', 'displayName').exec(function(err, chatroom) {
		if (err) return next(err);
		if (!chatroom) return next(new Error('Failed to load chatroom ' + id));
		req.chatroom = chatroom;
		next();
	});
};

/**
 * Chatroom authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.chatroom.user.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};
