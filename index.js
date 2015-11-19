var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	console.log('A user just connected.');

	socket.on('chat_message', function(msg){
		console.log('Message: ' + msg);
	});

	socket.on('disconnect', function(){
		console.log('User just disconnected.');
	});
});

// io.on('connection', function(socket){
//   socket.on('chat message', function(msg){
//     console.log('message: ' + msg);
//   });
// });

http.listen(5000, function(){
	console.log('Listening on *:5000');
});
