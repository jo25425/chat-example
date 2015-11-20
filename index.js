var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var users = [];

function getTime() {
	return (new Date()).toString().split(' ')[4];
}
function msgEntry(msgData) {
	return '[' + msgData.time + '] ' + msgData.origin + ': ' + msgData.msg
}

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
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

		socket.on('chat_message', function(dataIn){
			console.log(msgEntry(dataIn));

			// Emit to all clients
			io.emit('chat_message', dataIn);
		});

		socket.on('disconnect', function(){
			console.log(userName + ' just disconnected.');
			socket.broadcast.emit('user_disconnected', userName);
		});

	});

});

http.listen(5000, function(){
	console.log('Listening on *:5000');
});
