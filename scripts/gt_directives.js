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
			scope.AppendLog("dropped on " + endPoint);
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
	