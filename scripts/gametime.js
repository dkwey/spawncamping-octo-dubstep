var size = 25
function colorCode (newr,newg,newb)
{
	this.dir = [1,1,1]
	this.code = [newr,newg,newb]
}

colorCode.prototype.strobe = function(kr,kg,kb) {
	for(i=0;i<3;i++){
		if(this.code[i] >= 255) this.dir[i]=-1
		else if(this.code[i] <= 0) this.dir[i] = 1
	}
	
	this.code[0]+= kr*this.dir[0]
	this.code[1]+= kg*this.dir[1]
	this.code[2]+= kb*this.dir[2]
}

var TableCtrl = function($scope,$interval)
{
	$scope.color = new colorCode(0,0,0)
	$scope.inc = 10;
	
$scope.data= []
for(i=0; i<size; i++)
	$scope.data[i] = []

for(y=0; y<size; y++)
{
	for(x=0;x<size;x++)
	{
		$scope.data[y][x] = { valStr: x + "," + y,
							  initX: (x * (255/size))|0,
							  initY: (y * (255/size))|0
		}
	}
}	


	$interval(function(){
		$scope.color.strobe(5,10,25)
		$scope.rval = $scope.color.code[0]
		$scope.gval = $scope.color.code[1]
		$scope.bval = $scope.color.code[2]
	},40);
	
}