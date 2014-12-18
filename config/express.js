'use strict';

/**
 * Module dependencies.
 */
var fs = require('fs'),
	http = require('http'),
	https = require('https'),
	express = require('express'),
	morgan = require('morgan'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	compress = require('compression'),
	methodOverride = require('method-override'),
	cookieParser = require('cookie-parser'),
	helmet = require('helmet'),
	passport = require('passport'),
	mongoStore = require('connect-mongo')({
		session: session
	}),
	flash = require('connect-flash'),
	config = require('./config'),
	consolidate = require('consolidate'),
	path = require('path'),
	socketio = require('socket.io');
	
module.exports = function(db) {
	// Initialize express app
	var app = express();

	// Globbing model files
	config.getGlobbedFiles('./app/models/**/*.js').forEach(function(modelPath) {
		require(path.resolve(modelPath));
	});


	// Setting application local variables
	app.locals.title = config.app.title;
	app.locals.description = config.app.description;
	app.locals.keywords = config.app.keywords;
	app.locals.facebookAppId = config.facebook.clientID;
	app.locals.jsFiles = config.getJavaScriptAssets();
	app.locals.cssFiles = config.getCSSAssets();

	// Passing the request url to environment locals
	app.use(function(req, res, next) {
		res.locals.url = req.protocol + '://' + req.headers.host + req.url;
		next();
	});

	// Should be placed before express.static
	app.use(compress({
		filter: function(req, res) {
			return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
		},
		level: 9
	}));

	// Showing stack errors
	app.set('showStackError', true);

	// Set swig as the template engine
	app.engine('server.view.html', consolidate[config.templateEngine]);

	// Set views path and view engine
	app.set('view engine', 'server.view.html');
	app.set('views', './app/views');

	// Environment dependent middleware
	if (process.env.NODE_ENV === 'development') {
		// Enable logger (morgan)
		app.use(morgan('dev'));

		// Disable views cache
		app.set('view cache', false);
	} else if (process.env.NODE_ENV === 'production') {
		app.locals.cache = 'memory';
	}

	// Request body parsing middleware should be above methodOverride
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	app.use(methodOverride());

	// CookieParser should be above session
	app.use(cookieParser());

	// Express MongoDB session storage
	app.use(session({
		saveUninitialized: true,
		resave: true,
		secret: config.sessionSecret,
		store: new mongoStore({
			db: db.connection.db,
			collection: config.sessionCollection
		})
	}));

	// use passport session
	app.use(passport.initialize());
	app.use(passport.session());

	// connect flash for flash messages
	app.use(flash());

	// Use helmet to secure Express headers
	app.use(helmet.xframe());
	app.use(helmet.xssFilter());
	app.use(helmet.nosniff());
	app.use(helmet.ienoopen());
	app.disable('x-powered-by');

	// Setting the app router and static folder
	app.use(express.static(path.resolve('./public')));

	// Globbing routing files
	config.getGlobbedFiles('./app/routes/**/*.js').forEach(function(routePath) {
		require(path.resolve(routePath))(app);
	});

	// Assume 'not found' in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
	app.use(function(err, req, res, next) {
		// If the error object doesn't exists
		if (!err) return next();

		// Log it
		console.error(err.stack);

		// Error page
		res.status(500).render('500', {
			error: err.stack
		});
	});

	// Assume 404 since no middleware responded
	app.use(function(req, res) {
		res.status(404).render('404', {
			url: req.originalUrl,
			error: 'Not Found'
		});
	});

	if (process.env.NODE_ENV === 'secure') {
		// Log SSL usage
		console.log('Securely using https protocol');

		// Load SSL key and certificate
		var privateKey = fs.readFileSync('./config/sslcerts/key.pem', 'utf8');
		var certificate = fs.readFileSync('./config/sslcerts/cert.pem', 'utf8');

		// Create HTTPS Server
		var httpsServer = https.createServer({
			key: privateKey,
			cert: certificate
		}, app);

		// Return HTTPS server instance
		return httpsServer;
	}

	//CHATROOM OPEN SOCKET PORT LISTENNER
	// Attach Socket.io
	/*
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
	
	var users = (function(){
		
		var join = function(name,roomId){
			if (!users[name]) {
				users[name] = [roomId];
			}else{
				users[name].push(roomId);
			}
		};
		
		var leave = function(name,roomId){
			if(users[name]){
				for(var iRoom = 0 ; iRoom < users[name].length; iRoom ++){
					if(users[name][iRoom] === roomId){
						users[name].splice(iRoom,1);
					}
				}
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
	
	
	io.sockets.on('connection', function (socket) {

		var socketId = socket.id;
    	var clientIp = socket.request.connection.remoteAddress;
		
    	console.log('New connection from: '+clientIp);
    	
		var roomId;
		var name = userNames.getGuestName();
	  
		function joinRoom(){
	  		socket.join('/room/'+roomId);
	  		users.join(name,roomId);
	  		rooms.join(roomId,name);
	  }
	  
	  function leaveRoom(){
	  		if(roomId){
	  			console.log('leaving room:'+roomId);
	  			socket.leave('/room/'+roomId);
				users.leave(name,roomId);
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
				users: rooms.getUsers(roomId)
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
	*/
	// Return Express server instance
	return app;
};