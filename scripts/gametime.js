
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

var emptyPiece = new Piece("empty","empty")

//local board copy


app = angular.module('chessModule', []);
//chesspiece
app.directive('chesspiece', ['$document', function($document) {
    return function(scope, element, attr) {
      var startX, startY, x = 0, y = 0;

      element.on('dragcreate', function(event) {
		//pieces redrawn
      });
	  
	  element.on('dragstart', function(event) {
		//notify movement, set metadata
		var piece = element[0].id;
		var parent = element[0].parentNode.id;			

		scope.$apply(function(){
			scope.AppendLog(piece + parent);
		})
      });
	  
    };
}]);
  
app.directive('boardspace', ['$document', function($document) {
    return function(scope, element, attr) {
      var startX = 0, startY = 0, x = 0, y = 0;

      element.on('drop', function(event) {
		//piece dropped
		var endPoint = element[0].id;
		
		scope.$apply(function(){
			scope.AppendLog(" dropped on " + endPoint);
		})
      });
    };
  }]); 

//build table
app.controller('TableCtrl', function($scope,$interval) {
		var column = "ABCDEFGH";
		var square;
		var piece;
		

		$scope.logText = "";
		$scope.logData = "";
		$scope.AppendLog = function(newText){
			$scope.logData+=newText
		}
		
		
		$scope.BoardState = {
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
					
				pieceObj = $scope.BoardState.Board[y][x]
				$scope.data[y][x] = { 
									  uid: column[x] + (y+1),
									  piece: pieceObj,
									  bgcolor: square,
				}
			}
		}
		
	$scope.$watchCollection('logData', function () {
        $scope.logText = $scope.logData;
    });

		
	});
