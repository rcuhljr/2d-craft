var game_board = document.getElementById("viewport");

world_width_blocks = 1500;
world_height_blocks = 120;

var world = build_world({x:world_width_blocks, y:world_height_blocks});
var world_blocks = world.blocks;

var board_left = game_board.offsetLeft;
var board_top = game_board.offsetTop;

var viewport = {context:game_board.getContext("2d"), width:1000, height:600};

var palettes = {sky:"#C0F4FD", grass:"#00CC00", player:"FF0000", invis:"#C0F4FD", stone:"#C4C0B8", water:'#5C8CD9'};

var inventory = {stone:0, grass:0, water:100}

var player = {
	x: function(){
		return Math.floor(this.exactx);
	},
	y: function(){
		return Math.floor(this.exacty);
	}, 
	exactx: 0,
	exacty:0, 
	xvel:0, 
	yvel:0,
    moving_right:false,
    moving_left:false,
    };

var cursor_modes = {mining:"Mining", explorer:"Explorer", placing:"Place Blocks"};

var block_type = block_types.grass;

var cursor_mode = cursor_modes.mining;

var pixels_per_block = 10;
var clock_rate = 35;
var gravity = 2*pixels_per_block;
var run_accel = pixels_per_block;
var terminal_velocity =60*pixels_per_block;
var run_speed = 30*pixels_per_block;
var view_blocks = [[0,0],[1,1]];
var view_offset = [0,0];
var world_coords = [pixels_per_block*world_width_blocks, pixels_per_block*world_height_blocks];

var reset_position = function(){
	if(player.exactx > world_coords[0] || player.exactx < 0){
		player.exactx = 0;
	}
	if(player.exacty > world_coords[1]){
		player.exacty = 0;
	}
}

var draw_background = function(){
	viewport.context.fillStyle = palettes.sky;
	viewport.context.fillRect(0, 0, viewport.width, viewport.height);
}

var determine_viewport = function(){
	var halfwidth = viewport.width/2;
	var halfheight = viewport.height/2;
	if(player.x() < halfwidth){
		view_offset[0] = 0;
	}else if(player.x() > world_coords[0]-halfwidth){
		view_offset[0] = world_coords[0]-viewport.width;
	}else{
		view_offset[0] = player.x()-halfwidth;
	}

	if(player.y() < halfheight){
		view_offset[1] = 0;
	}else if(player.y() > world_coords[1]-halfheight){
		view_offset[1] = world_coords[1]-viewport.height;
	}else{
		view_offset[1] = player.y()-halfheight;
	}
	
	xblocks = Math.ceil(viewport.width/pixels_per_block);
	yblocks = Math.ceil(viewport.height/pixels_per_block);

	var upper_left = [Math.floor(view_offset[0]/pixels_per_block),Math.floor(view_offset[1]/pixels_per_block)]
	var lower_right = [Math.ceil((view_offset[0]+viewport.width)/pixels_per_block)-1,Math.ceil((view_offset[1]+viewport.height)/pixels_per_block)-1]
	view_blocks = [upper_left, lower_right];
}

var draw_blocks = function(){
	for(var x = view_blocks[0][0]; x <= view_blocks[1][0]; x++){
		for(var y = view_blocks[0][1]; y <= view_blocks[1][1]; y++){
			var block;
			if(block = world_blocks[x][y])
			{
				if(!block.fill)
				{
					draw_block(x*pixels_per_block, y*pixels_per_block, palettes[block.type]);
				}else{
					draw_partial_block(x*pixels_per_block, y*pixels_per_block, palettes[block.type], block.fill);
				}
				
			}
		}
	}
}

var draw_block = function(x, y, color){
	viewport.context.fillStyle = color;
	viewport.context.fillRect(x-view_offset[0],y-view_offset[1],pixels_per_block, pixels_per_block);
}

var draw_partial_block = function(x,y,color,fill){
	var adjust = (1-fill/100)*pixels_per_block;
	viewport.context.fillStyle = color;
	viewport.context.fillRect(x-view_offset[0],y-view_offset[1]+adjust,pixels_per_block, pixels_per_block-adjust);	
}

var draw_player = function(){
	draw_block(player.x(),player.y(),palettes.player);
}

var apply_gravity = function(){
	player.yvel += gravity;
	if(player.yvel > terminal_velocity){player.yvel = terminal_velocity}
	if(player.moving_right){
		player.xvel += run_accel;
		if(player.xvel > run_speed){player.xvel = run_speed}
	}else if(player.moving_left){
		player.xvel -= run_accel;
		if(player.xvel < -1*run_speed){player.xvel = -1*run_speed}
	}
}

var block_check = function(blocks){
	for(var i in blocks){
		var block = blocks[i];
		if(world_blocks[block[0]] && world_blocks[block[0]][block[1]]){
			if(world_blocks[block[0]][block[1]].blocks_movement){
				return [block[0],block[1]];
			}				
		}
	}
	return false;
}

var block_below = function(new_x, new_y){
	var blockll = [Math.floor(new_x/pixels_per_block), Math.floor((new_y+pixels_per_block-1)/pixels_per_block)];
	var blocklr = [Math.floor((new_x+pixels_per_block-1)/pixels_per_block), Math.floor((new_y+pixels_per_block-1)/pixels_per_block)];
	return block_check([blockll, blocklr]);
}

var block_above = function(new_x, new_y){	
	var blockul = [Math.floor(new_x/pixels_per_block), Math.floor(new_y/pixels_per_block)];
	var blockur = [Math.floor((new_x+pixels_per_block-1)/pixels_per_block), Math.floor(new_y/pixels_per_block)];	
	return block_check([blockul, blockur]);
}

var block_right = function(new_x, new_y){	
	var blockru = [Math.floor((new_x+pixels_per_block-1)/pixels_per_block), Math.floor(new_y/pixels_per_block)];
	var blockrl = [Math.floor((new_x+pixels_per_block-1)/pixels_per_block), Math.floor((new_y+pixels_per_block-1)/pixels_per_block)];
	return block_check([blockru, blockrl]);
}

var block_left = function(new_x, new_y){	
	var blocklu = [Math.floor(new_x/pixels_per_block), Math.floor(new_y/pixels_per_block)];
	var blockll = [Math.floor(new_x/pixels_per_block), Math.floor((new_y+pixels_per_block-1)/pixels_per_block)];
	return block_check([blockll, blockll]);
}

var move_player = function(){	
	var new_y = player.exacty + player.yvel*(clock_rate/1000);
	var new_x = player.exactx + player.xvel*(clock_rate/1000);
	var ydelta = Math.floor(new_y) - player.y();
	var xdelta = Math.floor(new_x) - player.x();
	
	while(ydelta > 0)	
	{		
		var block;
		if(block = block_below(player.x(), player.y()+1)){
			player.yvel = 0;
			ydelta = 0;
			new_y = (block[1]-1)*pixels_per_block;
		}else{
			ydelta--;
			player.exacty += 1;
		}
	}
	while(ydelta < 0){
		var block;
		if(block = block_above(player.x(), player.y()-1)){
			player.yvel = 0;
			ydelta = 0;
			new_y = (block[1]+1)*pixels_per_block;
		}else{
			ydelta++;
			player.exacty -= 1;
		}	
	}	

	while(xdelta > 0){
		var block;
		if(block = block_right(player.x()+1, player.y())){
			player.xvel = 0;
			xdelta = 0;
			new_x = (block[0]-1)*pixels_per_block;
		}else{
			xdelta--;
			player.exactx += 1;
		}	
	}

	while(xdelta < 0){
		var block;
		if(block = block_left(player.x()-1, player.y())){
			player.xvel = 0;
			xdelta = 0;
			new_x = (block[0]+1)*pixels_per_block;
		}else{
			xdelta++;
			player.exactx -= 1;
		}	
	}

	player.exacty = new_y;
	player.exactx = new_x;

}

var keydown = function(code){
	console.log(code.keyCode);
	var key = code.keyCode;
	if(key == 39 || key ==68) //right
	{
		player.moving_right = true;		
	}else if(key == 37 || key == 65) //left
	{
		player.moving_left = true;		
	}else if((key == 38 || key == 87) && block_below(player.x(), player.y()+1)){		
		player.yvel = -15*gravity;
	}else if(key == 49) //1
	{
		cursor_mode = cursor_modes.mining;
	}else if(key == 50) //2
	{
		cursor_mode = cursor_modes.explorer;
	}else if(key == 51) //2
	{
		if(cursor_mode === cursor_modes.placing){
			if(block_type === block_types.grass){
				block_type = block_types.stone;
			}else if(block_type == block_types.water){
				block_type = block_types.grass;
			}else{
				block_type = block_types.water;
			}
		}else{
			cursor_mode = cursor_modes.placing;	
		}		
	}

};

var keyup = function(code){
	var key = code.keyCode;
	if(key == 39 || key == 37 || key == 65 || key == 68)
	{
		player.xvel = 0;	
		if(key == 39 || key == 68)	{
			player.moving_right = false;
		}else{
			player.moving_left = false;	
		}
	}
};

document.onkeydown = keydown;

document.onkeyup = keyup;

var block_coords_at_point = function(x,y){
	return [Math.floor(x/pixels_per_block), Math.floor(y/pixels_per_block)];
}

var get_block_at_point = function(x,y){
	
	var block = block_coords_at_point(x,y);
	if(world_blocks[block[0]] && world_blocks[block[0]][block[1]]){
		return world_blocks[block[0]][block[1]];
	}
	return null;
}

var try_mining = function(ev_x,ev_y){
	if(Math.abs(player.x() - ev_x) > pixels_per_block*6){ return; }
	if(Math.abs(player.y() - ev_y) > pixels_per_block*6){ return; }	
	var block = get_block_at_point(ev_x,ev_y);
	if(block){
		console.log(block);
		var mine = block.mine(1);
		if(mine){
			world_blocks[block.x][block.y] = null;
			inventory[block.type]++;			
		}
	}
}

var try_blocking = function(ev_x,ev_y){
	if(inventory[block_type] === 0){
		return;
	}
	if(Math.abs(player.x() - ev_x) > pixels_per_block*6){ return; }
	if(Math.abs(player.y() - ev_y) > pixels_per_block*6){ return; }	
	var block = get_block_at_point(ev_x,ev_y);
	if(!block){
		var coords = block_coords_at_point(ev_x, ev_y);
		console.log('adding '+ block_type);		
		world_blocks[coords[0]][coords[1]] = build_block_type(coords[0], coords[1], block_type);
		inventory[block_type]--;
	}
}

var click_world = function(event){
	var ev_x = event.x + view_offset[0]-board_top;
	var ev_y = event.y + view_offset[1]-board_left;

	if(cursor_mode === cursor_modes.mining){
		try_mining(ev_x,ev_y);
	}else if(cursor_mode === cursor_modes.placing){
		try_blocking(ev_x,ev_y);
	}

}

game_board.onclick = click_world;

var draw_fps = function(){
	if(frame_count  === 10){
		var this_time = Date.now()
		fps = Math.round(10/((this_time-last_time)/1000));
		last_time = this_time;
		frame_count = 0;
	}

	viewport.context.font = 'Bold 14pt Arial black';
	viewport.context.fillStyle = 'red';	
	viewport.context.textAlign = 'center';
	viewport.context.fillText(""+fps, 30, 30);
	frame_count++;
}

var last_time = Date.now();
var frame_count = 0;
var fps = 0;

var draw_hud = function(){
	viewport.context.font = '12pt Arial black';
	viewport.context.fillStyle = 'black';	
	viewport.context.textAlign = 'center';

	viewport.context.fillText(cursor_mode, viewport.width*.75, 20);

	if(cursor_mode === cursor_modes.placing){
		viewport.context.fillText(block_type + ": " +inventory[block_type] , viewport.width*.75, 45);		
	}
}


var main_loop = function(delay){			
	var start_time = Date.now();		
	apply_gravity();
	move_player();
	reset_position();
	determine_viewport();
	settle_water();
	draw_background();
	draw_blocks();
	draw_player();
	draw_hud();
	draw_fps();	
	setTimeout(function() {
		main_loop(delay);
	}, delay-(Date.now()-start_time));
}

main_loop(clock_rate);