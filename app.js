var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var listeningPort = 5001;
var users = [];
var usersTyping = [];

function getTime() {
	return (new Date()).toString().split(' ')[4];
}
function msgEntry(msgData) {
	return '[' + msgData.time + '] ' + msgData.origin + ': ' + msgData.msg
}

app.get('/', function(req, res){
	app.use(express.static(__dirname + '/public'));
	res.sendFile(__dirname + '/public/index.html');
});

// 'io' is the client side
// 'socket' is a channel transporting events/communications
io.on('connection', function(socket){
	var userName = 'User';

	socket.on('user_name', function(newUserName){

		// 1) Assign user name
		userName = newUserName;
		users.push(userName);
		console.log(userName + ' just connected.');

		// Emit to others only
		socket.broadcast.emit('user_connected', userName);

		// 2) Initial greeting
		var dataOut = {
			origin: 'Server',
			time: getTime(),
			msg: 'Oh, hi there, ' + userName + '!'
		};
		socket.emit('chat_message', dataOut);

		socket.on('started_typing', function(){
			if (usersTyping.indexOf(userName) === -1) {
				usersTyping.push(userName);
			}
			console.log('Now typing:', usersTyping.join(', '));
			socket.broadcast.emit('user_started_typing', usersTyping);
		});

		socket.on('stopped_typing', function(){
			var i = usersTyping.indexOf(userName);
			if (i !== -1) {
				usersTyping.splice(i, 1);
			}
			console.log('Now typing:', usersTyping.join(', '));
			socket.broadcast.emit('user_stopped_typing', usersTyping);
		});

		socket.on('chat_message', function(dataIn){
			console.log(msgEntry(dataIn));

			// Emit to all clients
			io.emit('chat_message', dataIn);
		});

		socket.on('disconnect', function(){
			console.log(userName + ' just disconnected.');

			// Remove from typing users
			var i = usersTyping.indexOf(userName);
			if (i !== -1) {
				usersTyping.splice(i, 1);
			}
			// Remove from connected users
			var j = users.indexOf(userName);
			if (j !== -1) {
				users.splice(j, 1);
			}

			// Emit to others from this socket
			socket.broadcast.emit('user_disconnected', userName);
		});

	});

});

http.listen(listeningPort, function(){
	console.log('Listening on *:' + listeningPort);
});
