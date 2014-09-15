var io = require('socket.io').listen(8080);
var plural =""
var userTable = []

var chessSymbol = { //unicode table for pieces

			 king: "♚",
			 queen: "♛",
			 rook: "♜",
			 bishop: "♝",
			 knight: "♞",
			 pawn: "♟",
			 empty: ""
	 
}

var Piece = function(color, type){
	this.color = color;
	this.type = type;
	this.symbol = chessSymbol[type];
}

var emptyPiece = new Piece("empty","empty");

io.sockets.on('connection', function(socket) {
  for(i=0;i<userTable.length;i++)
  {
	var userAlreadyExists = userTable.some(function(el){
		return el == "unnamed"+i;
	});
	if(!userAlreadyExists) break;
	
  }
  socket.username = "unnamed"+i;
  userTable.push(socket.username);
  var userCount = userTable.length;
  	console.log(userTable);
  plural = (userCount==1)? "" : "s";
  socket.emit('news', {hello: 'Welcome! Currently '+userCount+' player'+plural+' connected!' });
  socket.broadcast.emit('user:connected', userCount);
  console.log("^ " + userCount);
  
 console.log(socket.username + "synced");
 socket.emit('game:board_sync', {
		id: 0,
		TurnState: "White",
		Board: [[new Piece("white","pawn"), new Piece("white","knight"), new Piece("white","bishop"), new Piece("white","queen"), new Piece("white","king"), new Piece("white","bishop"), new Piece("white","knight"), new Piece("white","rook")],
				[new Piece("white","pawn"), new Piece("white","pawn"), new Piece("white","pawn"), new Piece("white","pawn"), new Piece("white","pawn"), new Piece("white","pawn"), new Piece("white","pawn"), new Piece("white","pawn") ],
				[emptyPiece,emptyPiece,emptyPiece,emptyPiece,emptyPiece,emptyPiece,emptyPiece,emptyPiece],
				[emptyPiece,emptyPiece,emptyPiece,emptyPiece,emptyPiece,emptyPiece,emptyPiece,emptyPiece],
				[emptyPiece,emptyPiece,emptyPiece,emptyPiece,emptyPiece,emptyPiece,emptyPiece,emptyPiece],
				[emptyPiece,emptyPiece,emptyPiece,emptyPiece,emptyPiece,emptyPiece,emptyPiece,emptyPiece],
				[new Piece("black","pawn"), new Piece("black","pawn"), new Piece("black","pawn"), new Piece("black","pawn"), new Piece("black","pawn"), new Piece("black","pawn"), new Piece("black","pawn"), new Piece("black","pawn") ],
				[new Piece("black","rook"), new Piece("black","knight"), new Piece("black","bishop"), new Piece("black","queen"), new Piece("black","king"), new Piece("black","bishop"), new Piece("black","knight"), new Piece("black","rook")]]
		
	});
  
  socket.on('ack-event', function(data) {
    console.log(data);
  });
  
  socket.on('log:push', function(data) {
     socket.broadcast.emit('logUpdate', data);
	 console.log(data);
  });
  
  socket.on('game:board_sync_request', function() {

  });
  
  
  socket.on('game:move_complete', function(data) {
	 socket.broadcast.emit('game:move_sync', data);
	 console.log(data);
  });
  
  socket.on('chat:incoming', function(data) {
    var newData = { user: socket.username, message: data['message'] };
	console.log(newData);
	io.sockets.emit('chat:push', newData);
  });
  
  socket.on('disconnect', function() { 
    var uIndex = userTable.indexOf(socket.username);
	if(uIndex!= -1) userTable.splice(uIndex,1);
    userCount = userTable.length;
  
	socket.broadcast.emit('user:disconnected', userCount);
	 console.log("v "+userCount);
	 	console.log(userTable);
	});
  
});

