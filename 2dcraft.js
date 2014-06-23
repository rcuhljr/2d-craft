var game_board = document.getElementById("viewport");

var viewport = {context:game_board.getContext("2d"), width:1000, height:600};

var palettes = {sky:"#C0F4FD", grass:"#00CC00", player:"FF0000"};

var player = {
	x: function(){
		return Math.floor(this.exactx);
	},
	y: function(){
		return Math.floor(this.exacty);
	}, 
	exactx: 400,
	exacty:200, 
	xvel:0, 
	yvel:0,
    moving_right:false,
    moving_left:false,
    };

var pixels_per_block = 5;
var clock_rate = 35;
var gravity = 20;
var terminal_velocity =300;
var run_speed = 150;

var draw_background = function(){
	viewport.context.fillStyle = palettes.sky;
	viewport.context.fillRect(0, 0, viewport.width, viewport.height);
}

var draw_blocks = function(){
	for(var x in world_blocks){
		for(var y in world_blocks[x]){
			if(world_blocks[x][y])
			draw_block(x*pixels_per_block, y*pixels_per_block, palettes.grass);
		}
	}
}

var draw_block = function(x, y, color){
	viewport.context.fillStyle = color;
	viewport.context.fillRect(x,y,pixels_per_block, pixels_per_block);
}

var draw_player = function(){
	draw_block(player.x(),player.y(),palettes.player);
}

var apply_gravity = function(){
	player.yvel += gravity;
	if(player.yvel > terminal_velocity){player.yvel = terminal_velocity}
	if(player.moving_right){
		player.xvel += gravity;
		if(player.xvel > run_speed){player.xvel = run_speed}
	}else if(player.moving_left){
		player.xvel -= gravity;
		if(player.xvel < -1*run_speed){player.xvel = -1*run_speed}
	}
}

var block_check = function(blocks){
	for(var i in blocks){
		var block = blocks[i];
		if(world_blocks[block[0]][block[1]]){
			return [block[0],block[1]];
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
	var key = code.keyCode;
	if(key == 39) //right
	{
		player.moving_right = true;		
	}else if(key == 37) //left
	{
		player.moving_left = true;		
	}else if(key == 38 && block_below(player.x(), player.y()+1)){		
		player.yvel = -10*gravity;
	}
};

var keyup = function(code){
	var key = code.keyCode;
	if(key == 39 || key == 37)
	{
		player.xvel = 0;	
		if(key == 39)	{
			player.moving_right = false;
		}else{
			player.moving_left = false;	
		}
	}
};

document.onkeydown = keydown;

document.onkeyup = keyup;

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

var main_loop = function(delay){		
	var start_time = Date.now();
	draw_background();
	draw_blocks();
	apply_gravity();
	move_player();
	draw_player();
	draw_fps();	
	setTimeout(function() {
		main_loop(delay);
	}, delay-(Date.now()-start_time));
}

main_loop(clock_rate);