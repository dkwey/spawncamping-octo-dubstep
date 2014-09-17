
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

var autoMovePiece = function(data) //jquery handler to move piece
{
	var p = $("#"+data.piece);
	var e = $("#"+data.dropped);
	var o = p.parent();
	
	p.animate({
		//css
		top:e.position().top - o.position().top,
		left:e.position().left - o.position().left
		}, 300, function() {
			//done
		});
		
	p.animate({ color: "#FF9999", easing: 'easeInOutCubic'}, 100 );
		console.log(data.dropped);
	p.animate({ color: data.piece.split('-')[1], easing: 'easeInOutCirc'}, 250 );	
	e.parent().effect('highlight',{'color':'red'},500);
	
	p.data('start',data.dropped);
}

var removePieceFromGame = function(data)
{
	var p = $("#"+data.piece);
	var e = $("#"+data.dropped);
	var o = p.parent();
	
	p.animate({
		//css
		top:e.position().top - o.position().top,
		left:e.position().left - o.position().left
		}, 300, function() {
			//done
		});
}

var emptyPiece = new Piece("empty","empty");

app = angular.module('chessModule', ['ngAnimate']);


//build table
app.controller('TableCtrl', function($scope,socket) {
		var column = "ABCDEFGH";
		var square;
		$scope.loaded = 0;
		$scope.login = 0;
		$scope.pickeduppiece = emptyPiece;
		
		$scope.username = "";
		$scope.typedInChat = "";
		
		$scope.chatNotification = "";
			
		socket.on('news', function(data){
			console.log(data);
			$scope.eventlog.Data.push(data["hello"])
			$scope.username = data["username"];
			socket.emit('ack-event', "ok");
			$scope.loaded = 1;
			$scope.login = 0;
		});
		
		socket.on('logUpdate', function(data){
			$scope.eventlog.Data.push(data.user + " " + data.message);
		});

		
		socket.on('game:move_sync', function(data){
				//console.log(data);
				autoMovePiece(data);
		});
		
		socket.on('game:piece_captured', function(data){
				//console.log(data);
				$scope.eventlog.Data.push("A " + data.piece.type + " was captured!");
				socket.emit('game:board_sync_request', "ok");
		});
		
		socket.on('chat:push', function(data){
			$scope.eventlog.Data.push(data["user"] +": " + data["message"]);
			//socket.emit('ack-event', "ok");
		});
		
		socket.on('user:connected', function(data){
			plural = (data==1)? "" : "s";
			$scope.chatNotification = (data + " player"+plural+" connected.");
		});
		
		socket.on('user:disconnected', function(data){
			plural = (data==1)? "" : "s";
			$scope.chatNotification = (data + " player"+plural+" connected.");
			console.log(data);
		});
		

		$scope.logText = "";
		$scope.eventlog	={
			Data: [],
		}
		$scope.AppendLog = function(newText){
			$scope.eventlog.Data.push("You " + newText);
			socket.emit('log:push', newText);
		}
		
		$scope.PickUp = function(pc,org)
		{
			$scope.pickeduppiece = { piece: pc, origin: org };
			//console.log($scope.pickeduppiece);
			$scope.logData+= pc.split('-')[0] + "_" + pc.split('-')[2] + "_" + org.slice(-2)
		}
		
		$scope.MoveTo = function(dest)
		{
			var start; var end; var origin_x; var origin_y; var drop_x; var drop_y;
			if($scope.pickeduppiece != emptyPiece)
			{
				start = $scope.pickeduppiece['origin'].slice(-2);
				origin_x= column.indexOf(start[0]);
				origin_y = start[1] - 1;
				end = dest.slice(-2);
				drop_x = column.indexOf(end[0]);
				drop_y = end[1] - 1;
				if(start!=end) $scope.AppendLog("moved "+ start + " to " + end);
				
				//do a little processing for server
		        socket.emit('game:move_complete',{ piece: $scope.pickeduppiece.piece, 
												   origin: { cell: $scope.pickeduppiece.origin, 
															 x: origin_x,
															 y: origin_y },
												   dropped: { cell: dest,
															  x: drop_x,
															  y: drop_y  }
												 });
			}
			
			$scope.pickeduppiece = emptyPiece;
		}
		
		$scope.PlaceChessObj = function(pieceObj,x,y) {
				$scope.BoardState.Board[y][x] = pieceObj;
		};
		
		$scope.BoardState = {
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
		$scope.data= []
		for(i=0; i<8; i++)
			$scope.data[i] = [];

		socket.on('game:board_sync', function(sData){
			console.log("Synced!");
			$scope.BoardState = sData;			
			//console.log(sData);
			for(y=0; y<8; y++)
			{
				for(x=0;x<8;x++)
				{
					if((x + y)%2)
					{
						square = "Gray"
					}
					else{
						square = "Silver"
					}
					
					$scope.data[y][x] = { 
						  col: column[x],
						  uid: column[x] + (y+1),
						  piece: $scope.BoardState.Board[y][x],
						  bgcolor: square
					}

				}
			}
		});
		
		socket.on('chat:request_nick_result', function(data){
			if(data.nickAvailable)
			{
				$scope.username = data.username;
				$scope.loginErr = "";
				$scope.login = 1;
			}
			else{
				$scope.loginErr = "Username not available!";
			}
		});
    $scope.RequestReset = function(){
		socket.emit('game:board_reset_request',0);
	}
	
	$scope.SetNick = function(){
		if($scope.newusername != undefined && $scope.newusername.length > 1)
		{
			socket.emit('chat:request_nick', $scope.newusername);
		}
		else{
			$scope.loginErr = "Bad username!";
		}
	}
	
	$scope.checkKeyPress = function(e){
		if(e.which == 13 && $scope.typedInChat != ""){
			socket.emit('chat:incoming', {message: $scope.typedInChat});
			$scope.typedInChat = "";
		}
	};
		
	});
