'use strict';

var users = require('../../app/controllers/users.server.controller'),
	chatrooms = require('../../app/controllers/chatroom.server.controller'),
	socketio = require('socket.io'),
	http = require('http');
	


module.exports = function(app) {
	
	// Chatroom Routes
	app.route('/chatrooms')
		.get(chatrooms.list)
		.post(users.requiresLogin, chatrooms.create);
	
	app.route('/chatrooms/:chatroomId')
		.get(users.requiresLogin,chatrooms.read)
		.put(users.requiresLogin, chatrooms.hasAuthorization, chatrooms.update)
		.delete(users.requiresLogin, chatrooms.hasAuthorization, chatrooms.delete);
	
	app.post('/chatrooms/:chatroomId/expelUser',users.requiresLogin, chatrooms.hasAuthorization, function(req,res){
		expelUser(req.query.username);
		res.send('user expelled');
	});
	
	// Finish by binding the chatroom middleware
	app.param('chatroomId', chatrooms.chatroomByID);
	//////////////////////
	
	var server = http.createServer(app);
	var io = socketio.listen(server);
	
	app.set('socketio', io);
	app.set('server', server);
	
	var rooms = (function(){
	
		var join = function(roomId,name){
			if (!rooms[roomId]) {
				rooms[roomId] = [name];
			}else{
				rooms[roomId].push(name);
			}
		};
		
		var leave = function(roomId,name){
			if(rooms[roomId]){
				for(var iName = 0 ; iName < rooms[roomId].length; iName ++){
					if(rooms[roomId][iName] === name){
						rooms[roomId].splice(iName,1);
					}
				}
			}
		};
		
		var getUsers = function(roomId){
		    return rooms[roomId];
		};
		
		return{
			join:join,
			leave:leave,
			getUsers:getUsers
		};
		
	}());
	
	var chatUsers = (function(){
		var join = function(name,roomId,socket){
			if (!chatUsers[name]) {
				chatUsers[name] = [roomId];
			}else{
				chatUsers[name].push(roomId);
			}
			chatUsers[name][roomId] = socket;
		};
		
		var leave = function(name,roomId){
			if(chatUsers[name][roomId]){
				delete chatUsers[name][roomId];
			}
		};
		
		return {
			join:join,
			leave:leave
		};
	}());
	
	var userNames = (function () {
	
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
		 res.splice(0,4);
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
		
		
		var roomId;
		
	  function expelUser(exp_username){
	  		if(roomId){
	  			chatUsers[exp_username][roomId].emit('expel');
	  			chatUsers[exp_username][roomId].leave('/room/'+roomId);
				chatUsers.leave(exp_username,roomId);
				
		  		rooms.leave(roomId,exp_username);
		  		roomId = null;
	  		}
	  }
		
	
	io.sockets.on('connection', function (socket) {

		var socketId = socket.id;
    	var clientIp = socket.request.connection.remoteAddress;
		
    	console.log('New connection from: '+clientIp);
    	
		var name = userNames.getGuestName();
		
		function joinRoom(){
	  		socket.join('/room/'+roomId);
	  		chatUsers.join(name,roomId,socket);
	  		rooms.join(roomId,name);
	   }
	  
	   function leaveRoom(){
	  		if(roomId){
	  			console.log('leaving room:'+roomId);
	  			socket.leave('/room/'+roomId);
				chatUsers.leave(name,roomId);
		  		rooms.leave(roomId,name);
		  		roomId = null;
		  		console.log(socket.rooms);
	  		}
	  	}
	  	
	   
	   socket.on('joinRoom',function(data){
	  		
			leaveRoom();
			
	  		roomId = data.id;
	  		//name = data.user;
	  		
	  		joinRoom(name,roomId);
	  		
	  		console.log('joining room'+roomId);
	  		
			// send the new user their name and a list of users
			socket.emit('init', {
				name: name,
				chatUsers: rooms.getUsers(roomId)
			});
		  
		  // notify other clients that a new user has joined
		  io.to('/room/'+roomId).emit('user:join', {
		    name: name
		  });
	  		console.log('rooms: '+socket.rooms);
	  });
  	  
	  socket.on('send:message', function (data) {
		  	console.log('RECEIVED CALL for ' +roomId);
		  	io.to('/room/'+roomId).emit('send:message', {
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
	
	      io.sockets.emit('change:name', {
	        oldName: oldName,
	        newName: name
	      });
	
	      fn(true);
	    } else {
	      fn(false);
	    }
	  });
	  
	  socket.on('leave',function(){
	  	if(roomId){
	  		 console.log('leaving...');
		    io.to('/room/'+roomId).emit('user:left', {
		      name: name
		    });
		    
		    leaveRoom();
	  	}
	  	 
	  });
	  
	  //DISCONNECT IS RESERVED AND CANNOT BE EMITTED FROM THE CLIENT
	  socket.on('disconnect', function () {
	  	 console.log('disconnecting');
	    io.to('/room/'+roomId).emit('user:left', {
	      name: name
	    });
	    
	    leaveRoom();
	  	 userNames.free(name);
	  });
	  
	});
		
}; 