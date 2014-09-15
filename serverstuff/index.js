var io = require('socket.io').listen(8080);
var userCount = 0
var plural =""
io.sockets.on('connection', function(socket) {
  userCount++;
  plural = (userCount==1)? "" : "s";
  socket.emit('news', {hello: 'Welcome! Currently '+userCount+' player'+plural+' connected!' });
  socket.broadcast.emit('user:connected', userCount);
  console.log("^ " + userCount);
  
  socket.on('my other event', function(data) {
    console.log(data);
  });
  socket.on('droppedItem', function(data) {
     socket.broadcast.emit('logUpdate', data);
	 console.log(data);
  });
  
  socket.on('disconnect', function() { 
	userCount--;
	socket.broadcast.emit('user:disconnected', userCount);
	 console.log("v "+userCount);
	});
  
});

