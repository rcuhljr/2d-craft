var settle_water = function(){
	var water_bodies = get_water_bodies();
	for(var i in water_bodies){
		var body = water_bodies[i];
		settle_body(body);
	}
}

var settle_body = function(body){
	var water_layers = {}
	for(var i in body){
		var block = body[i];
		if(water_layers[block.y])
		{
			water_layers[block.y].push(block);
		}else{
			water_layers[block.y] = [block];
		}
	}
	var reverse_depths = [];
	for(var i in water_layers){
		reverse_depths.unshift(i);
	}
	var cur_layer;
	while(cur_layer = reverse_depths.shift()){
		var layer = water_layers[cur_layer]
		var horizontal_sort = []
		var volume = 0;
		var side_drains = {};
		var bottom_drains = {};
		var new_squares = 0;
		for(var i in layer){
			new_squares++;
			var block = layer[i];
			//horizontal_sort[block.x] = block;
			volume += block.fill;
			if(block.y < world_height_blocks-2 && !world_blocks[block.x][block.y+1])
			{
				bottom_drains[block.x + ':'+ (block.y+1)] = build_water(block.x, block.y+1, 0);
			}else if(block.y < world_height_blocks-2 && world_blocks[block.x][block.y+1].fill < 100){
				bottom_drains[block.x + ':'+ (block.y+1)] = world_blocks[block.x][block.y+1];
			}else{
				if(block.x > 0 && !world_blocks[block.x-1][block.y]
					&& !side_drains[(block.x-1) + ':'+ block.y]){
					side_drains[(block.x-1) + ':'+ block.y] = build_water(block.x-1, block.y, 0);
					new_squares++;
				}
				if(block.x < world_width_blocks-2 && !world_blocks[block.x+1][block.y]
					&& !side_drains[(block.x+1) + ':'+ block.y]){
					side_drains[(block.x+1) + ':'+ block.y] = build_water(block.x+1, block.y, 0);
					new_squares++;
				}
			}
		}

		var max_bottom_drain = 0;
		for(var i in bottom_drains){
			drain = bottom_drains[i];
			max_bottom_drain += Math.min(25, 100-drain.fill);
		}

		while(max_bottom_drain > 0 && volume > 0){
			for(var i in bottom_drains){
				drain = bottom_drains[i];
				if(drain.fill < 100){
					var delta = Math.min(1, volume);
					drain.fill+= delta;
					max_bottom_drain-= delta;
					volume-=delta;
				}
			}
		}

		for(var i in bottom_drains){
			var block = bottom_drains[i];
			world_blocks[block.x][block.y] = block;
			
		}

		if(volume > 0){
			var new_fill = volume/new_squares;
			for(var i in side_drains){
				var block = side_drains[i];
				block.fill = new_fill;
				world_blocks[block.x][block.y] = block;							
			}
			for(var i in layer){
				var block = layer[i];
				block.fill = new_fill;				
			}
		}else{
			for(var i in side_drains){
				var block = side_drains[i];				
				world_blocks[block.x][block.y] = null;								
				world.water.splice(world.water.indexOf(block),1);
			}
			for(var i in layer){
				var block = layer[i];
				world_blocks[block.x][block.y] = null;
				world.water.splice(world.water.indexOf(block),1);
			}
		}
		
	}
}

var get_water_bodies = function(){
	var water_blocks = world.water;
	var visited = [];
	var water_sets = [];

	for(var i in water_blocks){
		if(visited.indexOf(water_blocks[i]) > -1)
			continue;
		var foundhash = {};
		foundhash[water_blocks[i].x+':'+water_blocks[i].y] = true;
		var connected = get_connected([water_blocks[i]], [water_blocks[i]], foundhash);
		for(var j in connected){
			visited.push(connected[j]);
		}
		water_sets.push(connected);
	}
	return water_sets;
}

var get_connected = function(edges, found, foundhash){
	var new_finds = [];
	for(var i in edges){
		var neighbors = get_neighbors(edges[i]);
		for(var j in neighbors){
			var block = neighbors[j];
			if(block.type === block_types.water && !foundhash[block.x+':'+block.y]){
				new_finds.push(block);
				found.push(block);
				foundhash[block.x+':'+block.y] = true;
			}
		}
	}
	if(new_finds.length === 0){
		return found;
	}else{
		return get_connected(new_finds, found, foundhash);
	}
	
}

var get_neighbors = function(block){
	return [
		world_blocks[block.x-1][block.y-1],
		world_blocks[block.x][block.y-1],
		world_blocks[block.x+1][block.y-1],
		world_blocks[block.x-1][block.y],
		world_blocks[block.x+1][block.y],
		world_blocks[block.x-1][block.y+1],
		world_blocks[block.x][block.y+1],
		world_blocks[block.x+1][block.y+1],
	].filter(function(item){return item;});
}