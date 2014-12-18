'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Chatroom = mongoose.model('Chatroom'),
    _ = require('lodash');

exports.getUserList = function(req,res){
	
	//req.chatroom.userList
	
};

exports.broadcastMessage = function(req,res){

	console.log('broadcast server reached from :'+req.hostname +' by user:'+req.ip);
	
	var socketio = req.app.get('socketio'); // take out socket instance from the app container
	
	if(req.body.to === 'room'){
		socketio.sockets.emit('exports.newMessage.'+req.chatroom.id, {'from':req.body.from,'to':req.body.to,'message':req.body.message}); // emit an event for all connected clients
		//socketio.sockets.emit('exports.newMessage.'+req.chatroom.id, req.body.message); // emit an event for all connected clients
	}else{
		socketio.sockets.emit('exports.newMessage.user'+req.body.to,req.body.message);
	}
	res.send('Server reached, attempting to emit broadcast');
	
};







	var userNames = (function () {
	  var names = {};
	
	  var claim = function (name) {
	    if (!name || userNames[name]) {
	      return false;
	    } else {
	      userNames[name] = true;
	      return true;
	    }
	  };
	
	  // find the lowest unused "guest" name and claim it
	  var getGuestName = function () {
	    var name,
	      nextUserId = 1;
	
	    do {
	      name = 'Guest ' + nextUserId;
	      nextUserId += 1;
	    } while (!claim(name));
	
	    return name;
	  };
	
	  // serialize claimed names as an array
	  var get = function () {
	    var res = [];
	    for (var user in userNames) {
	      res.push(user);
	    }
	
	    return res;
	  };
	
	  var free = function (name) {
	    if (userNames[name]) {
	      delete userNames[name];
	    }
	  };
	
	  return {
	    claim: claim,
	    free: free,
	    get: get,
	    getGuestName: getGuestName
	  };
	}());
	



exports.socketCommBegin = function(req,res){
	
	var socket = req.app.get('socketio');
	var name = userNames.getGuestName();
	
  // send the new user their name and a list of users
  socket.emit('init', {
    name: name,
    users: userNames.get()
  });

  // notify other clients that a new user has joined
  socket.emit('user:join', {
    name: name
  });

  // broadcast a user's message to other users
  socket.on('send:message', function (data) {
  	console.log('RECEIVED CALL');
    socket.emit('send:message', {
      user: name,
      text: data.message
    });
  });

  // validate a user's name change, and broadcast it on success
  socket.on('change:name', function (data, fn) {
    if (userNames.claim(data.name)) {
      var oldName = name;
      userNames.free(oldName);

      name = data.name;

      socket.emit('change:name', {
        oldName: oldName,
        newName: name
      });

      fn(true);
    } else {
      fn(false);
    }
  });

  // clean up when a user leaves, and broadcast it to other users
  socket.on('disconnect', function () {
    socket.emit('user:left', {
      name: name
    });
    userNames.free(name);
  });
	
};


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
	res.json(req.chatroom);
};

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

/**
 * Chatroom add user to list
 */
 /*
exports.addUserToRoom = function(req,res,next){
 	
 	Chatroom.findByIdAndUpdate(req.chatroom.id,{userList:[]},function(err,chatroom){
 		console.log(chatroom);
 		next();
 	});
 	
};
 	

exports.removeUserFromRoom = function(req,res,next){
	
	req.existingUserList = req.chatroom.userList;
	
	for(var i=0 ; i<req.existingUserList.length ; i++){
		if(req.existingUserList[i] === req.user.displayName){
			req.existingUserList.splice(i,1);
		}
	}
	
	Chatroom.findByIdAndUpdate(req.chatroom.id,{userList:req.existingUserList},function(err,chatroom){
 		console.log(chatroom);
 		next();
 	});
	
};
*/