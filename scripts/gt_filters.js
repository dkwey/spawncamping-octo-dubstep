
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