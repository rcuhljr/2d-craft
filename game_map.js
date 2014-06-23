


var world_blocks = []

for (var i = 0; i < 200; i++){
	world_blocks.push([])
	for (var j = 0; j < 120; j++){
		world_blocks[i].push(null)		
	}
}

for (var i = 0; i < 200; i++){
	world_blocks[i][59] = 'grass';
}

for(var i = 0; i < 10; i++){
	world_blocks[0][59-i] = 'grass';
	world_blocks[199][59-i] = 'grass';
}

world_blocks[150][58] = 'grass';
world_blocks[150][57] = 'grass';
world_blocks[149][57] = 'grass';
world_blocks[151][57] = 'grass';
world_blocks[148][56] = 'grass';
world_blocks[152][56] = 'grass';
