
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


app = angular.module('chessModule', ['ngAnimate']);
//chesspiece
app.directive('chesspiece', ['$document', function($document) {
    return function(scope, element, attr) {
      var startX, startY, x = 0, y = 0;

      element.on('dragcreate', function(event) {
		//pieces redrawn
      });
	  
	  element.on('dragstart', function(event,ui) {
		//notify movement, set metadata
		var piece = element[0].id;
		var parent = ($(ui.helper).data('start') === undefined) ? element[0].parentNode.id : $(ui.helper).data('start');

		scope.$apply(function(){
			scope.PickUp(piece,parent);
			scope.AppendLog("picked up a "+ piece);
		})
      });
	  
    };
}]);
  
app.directive('boardspace', ['$document', function($document) {
    return function(scope, element, attr) {
      var startX = 0, startY = 0, x = 0, y = 0;

      element.on('drop', function(event,ui) {
		//piece dropped
		var endPoint = element[0].id;
		
		//alert($(ui.helper).data('start'))
		scope.$apply(function(){
			scope.MoveTo(endPoint);
			scope.AppendLog(" dropped on " + endPoint);
		})
      });
    };
  }]); 
 
app.directive( 'autoscroll', function() {

    return {
        link: function( scope, elem, attrs ) {

            scope.$watch( function() {
                elem.scrollTop(elem[0].scrollHeight);
            } );
        }
    }

} )
	
 app.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
}); 

 app.filter('onlyShowLast', function() {
  return function(items, showAmount) {
    return items.slice(-showAmount);
  };
}); 

 app.filter('popOffLast', function() {
  return function(items, showAmount) {
  if(items.length > showAmount){
	items.shift();
  }
    return items
  };
}); 

//build table
app.controller('TableCtrl', function($scope,$interval) {
		var column = "ABCDEFGH";
		var square;
		$scope.pickeduppiece = emptyPiece;
		

		$scope.logText = "";
		$scope.eventlog	={
			Data: [],
		}
		$scope.AppendLog = function(newText){
			$scope.eventlog.Data.push(newText);
		}
		
		$scope.PickUp = function(pc,origin)
		{
			$scope.pickeduppiece = pc.split('-')[2] + "_" + origin.slice(-2);
			$scope.logData+= $scope.pickeduppiece
		}
		
		$scope.MoveTo = function(dest)
		{
			var start; var end; var x; var y;
			if($scope.pickeduppiece != emptyPiece)
			{
				start = $scope.pickeduppiece.slice(-2);
				x = column.indexOf(start[0]);
				y = start[1] - 1;
				end = dest.slice(-2);
				x = column.indexOf(end[0]);
				y = end[1] - 1;
				$scope.AppendLog(" moved "+ start + " to " + end);
			}
			
			$scope.pickeduppiece = emptyPiece;
		}
		
		$scope.PlaceChessObj = function(pieceObj,x,y) {
				$scope.BoardState.Board[y][x] = pieceObj;
		};
		
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
		
	});
