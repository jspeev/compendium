'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Compendium = mongoose.model('Compendium'),
    _ = require('lodash');

/*PERFECT -- MIGRATING EXAMPLE TO CHATROOM DEMO
exports.broadcastMessage = function(req,res){
	var socketio = req.app.get('socketio'); // take out socket instance from the app container
	
	console.log(req.compendium.id);
	if(req.body.message === 'all'){
		socketio.sockets.emit('exports.newMessage.'+req.compendium.id, req.body.message); // emit an event for all connected clients
	}else{
		socketio.sockets.emit('exports.newMessage.user'+req.body.to,req.body.message);
	}
	res.send('Server reached, attempting to emit broadcast');
	
};
*/

/**
 * Create a Compendium
 */
exports.create = function(req, res) {
	
	var socketio = req.app.get('socketio'); // tacke out socket instance from the app container
	socketio.sockets.emit('exports.create', req.body); // emit an event for all connected clients
	
	var compendium = new Compendium(req.body);
	
	compendium.user = req.user;

	compendium.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(compendium);
		}
	});
	
};

/**
 * Show the current Compendium
 */
exports.read = function(req, res) {
	res.json(req.compendium);
};

/**
 * Update a Compendium
 */
exports.update = function(req, res) {
	var compendium = req.compendium;

	compendium = _.extend(compendium, req.body);

	compendium.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(compendium);
		}
	});
};

/**
 * Delete a Compendium
 */
exports.delete = function(req, res) {
	var compendium = req.compendium;

	compendium.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(compendium);
		}
	});
};

/**
 * List of Compendia
 */
exports.list = function(req, res) {
	
	Compendium.find().sort('-created').populate('user', 'displayName').exec(function(err, compendia) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(compendia);
		}
	});
	
};

/**
 * Compendium middleware
 */
exports.compendiumByID = function(req, res, next, id) {
	Compendium.findById(id).populate('user', 'displayName').exec(function(err, compendium) {
		if (err) return next(err);
		if (!compendium) return next(new Error('Failed to load compendium ' + id));
		req.compendium = compendium;
		next();
	});
};

/**
 * Compendium authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.compendium.user.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};