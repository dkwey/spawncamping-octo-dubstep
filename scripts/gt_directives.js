//chesspiece
app.directive('chesspiece', ['$document', function($document) {
    return function(scope, element, attr) {
      var startX, startY, x = 0, y = 0;

	  element.draggable({opacity: 0.6,
						snap: ".snapto", snapMode: "inner", snapTolerance: 20, revert: "invalid", 
						create: function(e,ui){     
							//initial drag apply
						} 
	});
	  
      element.on('dragcreate', function(event) {
		//pieces redrawn
		
      });

	  element.on('dragstart', function(event,ui) {
		//notify movement, set metadata
		if(ui.helper.data('id') === undefined) {
			ui.helper.data('start',element[0].parentNode.id);
		    ui.helper.data('id',element[0].id);
		}

		var piece = element[0].id;
		var parent = ($(ui.helper).data('start') === undefined) ? element[0].parentNode.id : $(ui.helper).data('start');

		scope.$apply(function(){
			scope.PickUp(piece,parent);
			scope.AppendLog("picked up a "+ piece);
		})
      });
	  
	  element.on('dragend', function(event,ui) {
		//notify movement, set metadata
		
      });
	  
    };
}]);
  
app.directive('boardspace', ['$document', function($document) {
    return function(scope, element, attr) {
      var startX = 0, startY = 0, x = 0, y = 0;
	  
	  element.droppable({hoverClass: "ui-state-hover"});
	  
      element.on('drop', function(event,ui) {
		//piece dropped
		var endPoint = element[0].id;
		ui.helper.data('start',endPoint); //reset start point

		scope.$apply(function(){
			scope.MoveTo(endPoint);
			scope.AppendLog("dropped on " + endPoint);
		})
      });
    };
  }]); 

//lets logger always scroll to the bottom when updated 
app.directive( 'autoscroll', function() {

    return {
        link: function( scope, elem, attrs ) {
            scope.$watch( function() {
                elem.scrollTop(elem[0].scrollHeight);
            } );
        }
    }

} );

app.directive( 'gotreset', function() {

    return {
        link: function( scope, element, attrs ) {
			var originalColor = element.css('background-color');
			
			element.on('click', function(event,ui){
				scope.$apply(function(){
							scope.RequestReset();
						})
			});
			element.on('mouseenter', function(event,ui){
				element.animate({
					'background-color': "#FF0000"
				}, 400);
			});
			element.on('mouseleave', function(event,ui){
				element.clearQueue();
				element.animate({
					'background-color': originalColor
				}, 400);
			});
        }
    }

} );
