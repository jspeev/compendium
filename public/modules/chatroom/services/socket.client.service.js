'use strict';
/* globals io */
angular.module('chatroom').factory('Socket', ['$rootScope',
	function($rootScope) {

	  var socket = io.connect('http://localhost:3000');
	  
	  return {
	  	 removeCallbacks: function(aryCall){
	  	 	for(var iCall = 0 ; iCall < aryCall.length ; iCall ++){
	  	 		socket._callbacks[aryCall[iCall]] = [];
	  	 	}
	  	 },
	    on: function (eventName, callback) {
	      socket.on(eventName, function () {  
	        var args = arguments;
	        $rootScope.$apply(function () {
	          callback.apply(socket, args);
	        });
	      });
	    },
	    emit: function (eventName, data, callback) {
	      socket.emit(eventName, data, function () {
	        var args = arguments;
	        $rootScope.$apply(function () {
	          if (callback) {
	            callback.apply(socket, args);
	          }
	        });
	      });
	    }
	  };
  }  
]);