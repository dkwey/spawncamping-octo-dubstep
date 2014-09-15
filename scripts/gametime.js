
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

var autoMovePiece = function(p, e) //jquery handler to move piece
{
	p.animate({
		//css
		top:e.position().top,
		left:e.position().left
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
		$scope.pickeduppiece = emptyPiece;
		$scope.username = "";
		$scope.typedInChat = "";
			
		socket.on('news', function(data){
			console.log(data);
			$scope.eventlog.Data.push(data["hello"])
			socket.emit('ack-event', "ok");
		});
		
		socket.on('logUpdate', function(data){
			$scope.eventlog.Data.push("Someone " + data);
			//socket.emit('ack-event', "ok");
		});

		
		socket.on('game:move_sync', function(data){
				var pieceObj = $("#"+data["piece"]);
				var remoteCellObj = $("#"+data["dropped"]);
				console.log (":)");
				console.log(data);
				autoMovePiece(pieceObj, remoteCellObj);
		});
		
		socket.on('chat:push', function(data){
			$scope.eventlog.Data.push(data["user"] +": " + data["message"]);
			//socket.emit('ack-event', "ok");
		});
		
		socket.on('user:connected', function(data){
			$scope.eventlog.Data.push(data + " users now connected.");
		});
		
		socket.on('user:disconnect', function(data){
			$scope.eventlog.Data.push(data + " users now connected.");
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
			console.log($scope.pickeduppiece);
			$scope.logData+= pc.split('-')[0] + "_" + pc.split('-')[2] + "_" + org.slice(-2)
		}
		
		$scope.MoveTo = function(dest)
		{
			var start; var end; var x; var y;
			if($scope.pickeduppiece != emptyPiece)
			{
				start = $scope.pickeduppiece['origin'].slice(-2);
				x = column.indexOf(start[0]);
				y = start[1] - 1;
				end = dest.slice(-2);
				x = column.indexOf(end[0]);
				y = end[1] - 1;
				if(start!=end) $scope.AppendLog("moved "+ start + " to " + end);
		        socket.emit('game:move_complete',{ piece: $scope.pickeduppiece.piece, origin: $scope.pickeduppiece.origin, dropped: dest });
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


		socket.on('game:board_sync', function(sData){
			console.log("Synced");
			$scope.BoardState = sData;
			
			
		});
	
		for(i=0; i<8; i++)
			$scope.data[i] = []

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
					  bgcolor: square,
				}

			}
		}

	$scope.$watch('BoardState.Board', function () {
		$( ".dragme" ).draggable({opacity: 0.6,snap: ".snapto", snapMode: "inner", snapTolerance: 20, revert: "invalid" });
    },true);
	
	$scope.checkKeyPress = function(e){
		if(e.which == 13 && $scope.typedInChat != ""){
			socket.emit('chat:incoming', {message: $scope.typedInChat});
			$scope.typedInChat = "";
		}
	};
		
	});
