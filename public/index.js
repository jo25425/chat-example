
var uniqueTimer = 0;
var userName = '...';

function addEntry(entryTxt) {
	$('#messages').append($('<li>').text(entryTxt));
	var d = document.getElementById('messages');
	d.scrollTop = d.scrollHeight;
}

function getTime() {
	return (new Date()).toString().split(' ')[4];
}

function msgEntry(msgData){
	return '[' + msgData.time + '] ' + msgData.origin + ': ' + msgData.msg
}

function renderTypingMessage(users){
	$('#typing').text(typingMessage(users));
}

function typingMessage(users){
	switch(users.length){
		case 0: return '';
		case 1: return users[0] + ' is typing...';
		case 2: return users[0] + ' and ' + users[1] + ' are typing...';
		case 3: return 'Several users are typing';
	}
}

function delayFunction() {
  return function(callback1, callback2, ms){
		if (!uniqueTimer) callback1();
		clearTimeout (uniqueTimer);
	  uniqueTimer = setTimeout(function(){
			callback2();
			uniqueTimer = 0;
		}, ms);
	};
}

function socketSetup() {
  var socket = io();

	// Register user name
	socket.emit('user_name', userName);

	// Send a message
	$('#send-message').submit(function(){

		if (uniqueTimer) {
      socket.emit('stopped_typing');
  		clearTimeout (uniqueTimer);
  		uniqueTimer = 0;
    }

		var dataOut = {
			origin: userName,
			time: getTime(),
			msg: $('#m').val()
		};
		socket.emit('chat_message', dataOut);
		$('#m').val('');

		return false;
	});

	// Send 'started typing' or 'stopped typing'
	$('input').keydown(function(event){
    if (event.keyCode !== 13) {
      delay(function(){
  			socket.emit('started_typing');
  	  },function(){
  			socket.emit('stopped_typing');
  	  }, 1500 );
    }
	});

	// Receive 'started typing' or 'stopped typing'
	socket.on('user_started_typing', function(usersTyping){
		renderTypingMessage(usersTyping);
	});

	// Receive 'stopped typing'
	socket.on('user_stopped_typing', function(usersTyping){
		renderTypingMessage(usersTyping);
	});

	// Receive messages
	socket.on('chat_message', function(dataIn){
		var txt = msgEntry(dataIn);
		addEntry(txt);
	});

	// Someone else connected
	socket.on('user_connected', function(user_name){
		var txt = user_name + ' connected.';
		addEntry(txt);
	});

	// Someone else disconnected
	socket.on('user_disconnected', function(user_name){
		var txt = user_name + ' disconnected.';
		addEntry(txt);
	});
}

var delay = delayFunction();

$(document).ready(function(){

  document.getElementById('n').focus();

  $('#pick-name').submit(function(){
  	userName = $('#n').val().trim() || 'Idiot-who-won\'t-type-in-their-name';
  	$('#user-name').text(userName);
  	document.getElementById('modal').hidden = true;
    document.getElementById('m').focus();

    socketSetup();

  	return false;
  });

});
