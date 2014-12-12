'use strict';
/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
	compendia = require('../../app/controllers/compendium.server.controller');

module.exports = function(app) {
	
	// Compendium Routes
	app.route('/compendia')
		.get(compendia.list)
		.post(users.requiresLogin, compendia.create);
	
	app.route('/compendia/:compendiumId')
		.get(compendia.read)
		.put(users.requiresLogin, compendia.hasAuthorization, compendia.update)
		.delete(users.requiresLogin, compendia.hasAuthorization, compendia.delete);
		
/*THIS WORKS HOLY SHIT -- moving on to use route for controller functionality
	app.post('/broadcastMessage', function (req, res) {
		
		console.log('express hit');
		var socketio = req.app.get('socketio'); // take out socket instance from the app container
		socketio.sockets.emit('exports.newMessage', req.body.message); // emit an event for all connected clients
		res.send('Server reached, attempting to emit broadcast');
	});
*/

/*PERFECT -- MIGRATING EXAMPLE TO CHATROOM DEMO
	app.route('/compendia/:compendiumId/broadcastMessage')
		.post(compendia.broadcastMessage);
	
*/
	// Finish by binding the compendium middleware
	app.param('compendiumId', compendia.compendiumByID);
};