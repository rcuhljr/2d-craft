
var block_types = {grass:'grass', stone:'stone'};

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

	var deltay = 0
	var deltax = 0

	for (var i = 0; i < x; i++)
	{
		new_world.push([])
		if(deltax === 0){
			deltay = Math.floor(Math.random()*7)-3;
			deltax = Math.floor(Math.random()*10+1);
		}
		land_height += deltay/deltax;
		deltay -= deltay/deltax;
		deltax -= 1;
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

	place_stones(x,y,new_world);



	return new_world;
}

var place_stones = function(x,y, world){
	var seeds = x*y/Math.pow(30,2);
	while(seeds > 0){
		var width = Math.floor(Math.random()*15+1);
		var height = Math.floor(Math.random()*15+1);

		var seed_x = Math.max(Math.floor(Math.random()*x)-width,0);
		var seed_y = Math.max(Math.floor(Math.random()*y)-height, 0);

		var dist = (Math.pow(width/2,2)+Math.pow(height/2,2))*.6;

		for(var i = 0; i <= width; i++){
			for(var j = 0; j <= height; j++){				
				if(Math.pow(i-width/2,2)+Math.pow(j-height/2,2) < dist){
					if(world[seed_x+i][seed_y+j]){
						world[seed_x+i][seed_y+j] = build_stone(seed_x+i, seed_y+j);
					}
				}
			}
		}

		seeds--;
	}
}

var build_grass = function(x,y){
	return new Block('grass', 2, x, y);
}

var build_stone = function(x,y){
	return new Block('stone', 3, x, y);
}

var build_block_type = function(x,y,type){
	if(type === block_types.grass){
		return build_grass(x,y);
	}else if(type === block_types.stone){
		return build_stone(x.y);
	}
}
