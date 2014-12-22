'use strict';

angular.module('chatroom').controller('ChatroomController', ['$scope', '$stateParams', '$location','$http', '$log', '$window', 'Authentication','Socket','Chatrooms',
	function($scope,$stateParams,$location,$http,$log,$window,Authentication,Socket,Chatrooms) {
      
		$scope.authentication = Authentication;
		
		//$scope.name = $scope.authentication.user.displayName;
		
		$scope.bSending = false;
		$scope.messages = [];
		
		$scope.users = [];
		
		var username = $scope.authentication.user.displayName;
		var aryCallback = ['init','send:message','user:join','change:name','user:left','expel'];
		




	  // Socket listeners
	  // ================
	  $scope.beginChat = function(){
		  Socket.emit('joinRoom',{id:$stateParams.chatroomId,user:username+'_'+Math.round(Math.random()*100)},function(){$log.log('connected to:',$stateParams.chatroomId);});
	  };
  
  	  Socket.on('init', function (data) {
	  	 $scope.messages=[{user:'chatroom',text:'Welcome!'}];
	  	 $log.log('initted '+data.chatUsers);
	    $scope.name = data.name;
	    $scope.users = data.chatUsers;
	    $log.log($scope.messages);
	  });
	  
	  Socket.on('send:message', function (message) {
	    $scope.messages.push(message);
	    angular.element(document.querySelector('#messageBoard')).scrollTop(9999999);
	  });
	
	  Socket.on('change:name', function (data) {
	    changeName(data.oldName, data.newName);
	  });
	  
	  Socket.on('testComplete',function(data){
	  	$log.log(data);
	  });
	  
	  Socket.on('expel',function(){
	  	 $window.alert('You have been expelled from this room');
	  	 $location.url('/chatrooms');
	  });	
	
	  Socket.on('user:join', function (data) {
	  	 $log.log('new user joins: '+data.name);
	  	 
	  	 var bFound = false;
		
	  	 for (var i = 0; i < $scope.users.length; i++) {
	  	 	console.log($scope.users[i]);
	      if ($scope.users[i] === data.name) {
	        bFound = true;
	      }
	    }
	  	 
	  	 if(!bFound){
	  	 	$scope.messages.push({
		      user: 'chatroom',
		      text: 'User ' + data.name + ' has joined.'
		    });
		    $scope.users.push(data.name);
	  	 }
	  });
	
	  // add a message to the conversation when a user disconnects or leaves the room
	  Socket.on('user:left', function (data) {
	    $scope.messages.push({
	      user: 'chatroom',
	      text: 'User ' + data.name + ' has left.'
	    });
	    var i, user;
	    for (i = 0; i < $scope.users.length; i++) {
	      user = $scope.users[i];
	      if (user === data.name) {
	        $scope.users.splice(i, 1);
	        break;
	      }
	    }
	  });
	
	  // Private helpers
	  // ===============
	
	  var changeName = function (oldName, newName) {
	    // rename user in list of users
	    var i;
	    for (i = 0; i < $scope.users.length; i++) {
	      if ($scope.users[i] === oldName) {
	        $scope.users[i] = newName;
	      }
	    }
	  };
	 
	 $scope.$on('$destroy', function(){
         Socket.emit('leave');
         Socket.removeCallbacks(aryCallback);
    }); 
    
  
  
  
	  // Methods published to the scope
	  // ==============================
	  $scope.changeName = function () {
	    Socket.emit('change:name', {
	      name: $scope.newName
	    }, function (result) {
	      if (!result) {
	        alert('There was an error changing your name');
	      } else {
	
	        changeName($scope.name, $scope.newName);
	
	        $scope.name = $scope.newName;
	        $scope.newName = '';
	      }
	    });
	  };
	  
	  $scope.sendMessage = function () {
		  	
		  	if($scope.input.charAt(0) === '/'){
		  		//HTTP CALL
		  		var _func = $scope.input.substr(1,$scope.input.indexOf(' ')-1);
		  		var _targetUser = $scope.input.substr($scope.input.indexOf(' ')+1,$scope.input.length);
		  		
		  		switch(_func){
		  			case 'expel':
		  			expelUser(_targetUser);
		  			break;
		  		}
		  		
		  	}else{
		  		Socket.emit('send:message', {
			      message: $scope.input
			    });
		  	}
		    
		    // clear message box
		    $scope.input = '';
		  
		 };
		
	  	  
	
		//$scope.newName = $scope.authentication.user.displayName;
		//$scope.changeName();

		var expelUser = function(exp_username){
			
			if(exp_username){
				
				$log.log('Attempting to expel user: ',exp_username);
				
				var js_data = {
					'username':exp_username
				};
				
				$http({
				    method: 'POST',
				    url: 'http://localhost:3000/chatrooms/'+$stateParams.chatroomId+'/expelUser?username='+exp_username,
				    data: js_data
				})
				.success(function(data,status) {
					//DO NOTHING ON SUCCESS
					$log.info('status code:',status,data);
				})
				.error(function(data,status) {
					$log.warn('error status code:',status);
				});
				
			}
			
		};
		
		
		
		$scope.create = function() {
			var chatroom = new Chatrooms({
				title: this.title,
				type: this.type,
				description: this.description,
				content: this.content
			});
			chatroom.$save(function(response) {
				$log.log('res id: ',response._id);
				$location.path('chatrooms/' + response._id);
				$scope.title = '';
				$scope.content = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};
		
		$scope.remove = function(chatroom) {
			
			if (chatroom) {
				
				chatroom.$remove();

				for (var i in $scope.chatrooms) {
					if ($scope.chatrooms[i] === chatroom) {
						$scope.chatrooms.splice(i, 1);
					}
				}
				
			} else {
				$scope.chatroom.$remove(function() {
					$location.path('chatrooms');
				});
			}
		};

		$scope.update = function() {
			
			var chatroom = $scope.chatroom;

			chatroom.$update(function() {
				$location.path('chatrooms/' + chatroom._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
			
		};

		$scope.find = function() {
			$scope.chatrooms = Chatrooms.query();
		};

		$scope.findOne = function() {
			$scope.chatroom = Chatrooms.get({
				chatroomId: $stateParams.chatroomId
			});
		};
		
	}
]);