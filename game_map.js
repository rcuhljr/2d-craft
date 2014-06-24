
function Block(name, strength, x, y){
	this.type = name;
	this.strength = strength;

	this.x = x;
	this.y = y;

	this.mine = null;
	if(strength > 0){
		this.mine = function(val){
			this.strength -= val; 
			var that = this;
			setTimeout(function(){
				that.strength += val;
			}, 2500);
			return this.strength <= 0; 
		};
	}else {
		this.mine = function(){return false;}
	}
}


var build_world = function(args){
	var args = args || {};
	var x = args.x || 200;
	var y = args.y || 120;	

	var new_world = [];
	var land_height = y/3;

	for (var i = 0; i < x; i++)
	{
		new_world.push([])
		land_height += Math.floor(Math.random()*7)-3;
		land_height = Math.min(Math.max(y/3-15, land_height), y/3+15);
		for (var j = 0; j < y; j++)
		{
			if(j > land_height)
			{
				new_world[i].push(build_grass(i,j));
			}else
			{
				new_world[i].push(null);	
			}			
		}
	}



	return new_world;
}

var build_grass = function(x,y){
	return new Block('grass', 2, x, y);
}

var build_rock = function(x,y){
	return new Block('rock', 2, x, y);
}



// for (var i = 0; i < 200; i++){
// 	world_blocks[i][59] = new Block('grass', 2, i, 59);
// }

// for(var i = 1; i < 10; i++){
// 	world_blocks[0][59-i] = new Block('invis', -1, 0, 59-i);
// 	world_blocks[199][59-i] = new Block('invis', -1, 199, 59-i);
// }

// world_blocks[150][58] = new Block('grass', 2, 150, 58);
// world_blocks[150][57] = new Block('grass', 2, 150, 57);
// world_blocks[149][57] = new Block('grass', 2, 149, 57);
// world_blocks[151][57] = new Block('grass', 2, 151, 57);
// world_blocks[148][56] = new Block('grass', 2, 148, 56);
// world_blocks[152][56] = new Block('grass', 2, 152, 56);

// for (var i = 0; i < 60; i++){	
// 	world_blocks[20+i][57-i] = new Block('grass', 2, 20+i, 57-i);	
//}