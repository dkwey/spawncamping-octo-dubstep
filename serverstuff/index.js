var io = require('socket.io').listen(9001);
var userTable = []
var boardState = []

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
	this.uid = -1;
}

var emptyPiece = new Piece("empty","empty");

var ResetBoard = function(b){
		boardState[b] = {
			id: 0,
			TurnState: "White",
			Board: [[new Piece("white","rook"), new Piece("white","knight"), new Piece("white","bishop"), new Piece("white","queen"), new Piece("white","king"), new Piece("white","bishop"), new Piece("white","knight"), new Piece("white","rook")],
					[new Piece("white","pawn"), new Piece("white","pawn"), new Piece("white","pawn"), new Piece("white","pawn"), new Piece("white","pawn"), new Piece("white","pawn"), new Piece("white","pawn"), new Piece("white","pawn") ],
					[emptyPiece,emptyPiece,emptyPiece,emptyPiece,emptyPiece,emptyPiece,emptyPiece,emptyPiece],
					[emptyPiece,emptyPiece,emptyPiece,emptyPiece,emptyPiece,emptyPiece,emptyPiece,emptyPiece],
					[emptyPiece,emptyPiece,emptyPiece,emptyPiece,emptyPiece,emptyPiece,emptyPiece,emptyPiece],
					[emptyPiece,emptyPiece,emptyPiece,emptyPiece,emptyPiece,emptyPiece,emptyPiece,emptyPiece],
					[new Piece("black","pawn"), new Piece("black","pawn"), new Piece("black","pawn"), new Piece("black","pawn"), new Piece("black","pawn"), new Piece("black","pawn"), new Piece("black","pawn"), new Piece("black","pawn") ],
					[new Piece("black","rook"), new Piece("black","knight"), new Piece("black","bishop"), new Piece("black","queen"), new Piece("black","king"), new Piece("black","bishop"), new Piece("black","knight"), new Piece("black","rook")]]
			
		}
		
		var i = 0;
		boardState[b].Board.forEach(function(entry) {
			entry.forEach(function(pc) {
					pc.uid = i++;
			});
			console.log(entry)
		});
		
		
};

//initial board;
ResetBoard(0);

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

  socket.emit('news', {hello: 'Connected to MMO Chess server as '+socket.username+'!', username: socket.username });
  io.sockets.emit('user:connected', userCount);
  console.log("^ " + userCount);
  
 console.log(socket.username + "synced");
 socket.emit('game:board_sync', boardState[0]);
  
  socket.on('ack-event', function(data) {
    console.log(data);
  });
  
  socket.on('chat:request_nick', function(data) {
	  var nickAvailable = ( userTable.indexOf(data) == -1);

	  if(nickAvailable){
	  
	    var uIndex = userTable.indexOf(socket.username);
		if(uIndex!= -1) userTable.splice(uIndex,1);
		userTable.push(data);
		
		io.sockets.emit('logUpdate', {message: " changed their name to " + data, user:socket.username});
		
		socket.username = data;
	  }
	  
	  socket.emit('chat:request_nick_result', { 'nickAvailable' : nickAvailable, 'username' : socket.username });
	  console.log(userTable.indexOf(data) == -1);
	  
  });
  
  socket.on('log:push', function(data) {
     socket.broadcast.emit('logUpdate', {message: data, user:socket.username});
	 console.log(data);
  });
  
  socket.on('game:board_sync_request', function() {
	socket.emit('game:board_sync', boardState[0]);
  });
  
  socket.on('game:board_reset_request', function(data) {
    if(data in boardState) {
		ResetBoard(0);
		io.sockets.emit('game:board_sync', boardState[data]);
		console.log('Reset on Board'+data);
	}
  });

  socket.on('game:move_complete', function(data) {
     //update board 
	 var id = 0; //replace with session id at some point
	 var movedPiece = boardState[id].Board[data.origin.y][data.origin.x];
	 var dropSpace = boardState[id].Board[data.dropped.y][data.dropped.x];
	 console.log(movedPiece.color + " VS " + dropSpace.color);
	 if(movedPiece.type == emptyPiece.type)
	 {
		io.sockets.emit('game:board_sync', boardState[0]);
	 }
	 else if(movedPiece.color === dropSpace.color)
	 {
		socket.emit('game:move_sync', { piece: data.piece,
									origin: data.dropped.cell,
									dropped: data.origin.cell
									});
	 }
	 else if(dropSpace != emptyPiece && dropSpace != movedPiece)
	 {
			console.log( dropSpace.type + " captured by a "+ movedPiece.type +"!");
			boardState[id].Board[data.dropped.y][data.dropped.x] = movedPiece;
			boardState[id].Board[data.origin.y][data.origin.x] = emptyPiece;
		 
		 	io.sockets.emit('game:piece_captured',{ piece: dropSpace });
	 }
	 else if(data.origin.cell!=data.dropped.cell) //we didn't drop it in place or capture a piece, update the board
	 {
		 boardState[id].Board[data.dropped.y][data.dropped.x] = movedPiece;
		 boardState[id].Board[data.origin.y][data.origin.x] = emptyPiece;
				 
		 socket.broadcast.emit('game:move_sync', { piece: data.piece,
												   origin: data.origin.cell,
												   dropped: data.dropped.cell
													}); //broadcast move to everyone else
	 }
	 
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

