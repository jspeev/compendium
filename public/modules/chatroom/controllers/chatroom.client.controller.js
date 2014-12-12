'use strict';

angular.module('chatroom').controller('ChatroomController', ['$scope', '$stateParams', '$location','$http', '$log', 'Authentication','Socket','Chatrooms',
	function($scope,$stateParams,$location,$http,$log,Authentication,Socket,Chatrooms) {

		$scope.authentication = Authentication;
		
		var username = $scope.authentication.user.displayName;
		
		$scope.bSending = false;
		$scope.messages = [
			{'from':'sys','to':username,'message':'Welcome!'}
		];
		
		$scope.users = [];
		
		Socket.on('connection', function(socket){
			$log.log('connected');
			socket.join('room'+$stateParams.chatroomId);
		});
		
		/*SOCKET EMITTER*/
		Socket.on('exports.newMessage.system',function(body){
			addToMessageBoard(body);
		});
		
		Socket.on('exports.newMessage.user'+username,function(body){
			addToMessageBoard(body);
		});
		
		Socket.on('exports.newMessage.'+$stateParams.chatroomId, function(body) {
			addToMessageBoard(body);
		});
		
		var addToMessageBoard = function(body){
			
			$scope.messages.push(body);
			$scope.bSending = false;
			$scope.input = '';
			
			angular.element(document.querySelector('#messageBoard')).scrollTop(9999999);
		};
		
		$scope.sendMessage = function(){
			$log.log('message pulled',$scope.input);
			broadcastMessage('room',$scope.input);
			$scope.bSending = true;
		};
		
		$scope.getUserList = function(){
			$http({
				    method: 'GET',
				    url: 'http://localhost:3000/chatrooms/'+$stateParams.chatroomId+'/userList'
				})
				.success(function(data,status) {
					$log.info('status code:',status,data);
				})
				.error(function(data,status) {
					$log.warn('error status code:',status);
				});
		};
		
		var broadcastMessage = function(stTo,stMessage){
			
			if($stateParams.chatroomId){
				
				$log.log('Attempting to send message',$stateParams.chatroomId);
				
				var js_data = {
					'from':username,
					'to':stTo,
					'message':stMessage
				};
				
				$http({
				    method: 'POST',
				    url: 'http://localhost:3000/chatrooms/'+$stateParams.chatroomId+'/broadcastMessage',
				    data: js_data
				})
				.success(function(data,status) {
					//DO NOTHING ON SUCCESS
					//$log.info('status code:',status,data);
				})
				.error(function(data,status) {
					$log.warn('error status code:',status);
				});
				
			}
			
		};
		
		broadcastMessage('room',username+' entered the room.');
		///////////////////////////////////////////////////////////////
		
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