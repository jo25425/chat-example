var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var users = [];

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

// 'io' is the client side
// 'socket' is a channel transporting events/communications
io.on('connection', function(socket){
	console.log('A user just connected.');

	// Emit to sender only
	// 1) Assign user name
	var newUserName = 'user' + users.length;
	users.push(newUserName);
	socket.emit('user_name', newUserName);

	// 2) Initial greeting
	var dataOut = {
		origin: 'Server',
		msg: 'Oh, hi there!'
	};
	socket.emit('chat_message', dataOut);

	socket.on('chat_message', function(dataIn){
		console.log('Message: ' + dataIn.msg);

		// Emit to all clients
		io.emit('chat_message', dataIn);
	});

	socket.on('disconnect', function(){
		console.log('User just disconnected.');
	});
});

http.listen(5000, function(){
	console.log('Listening on *:5000');
});
