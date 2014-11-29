var socket = io.connect('http://gazu.carina.uberspace.de:61027');

tictactoe = function(io){

	var xTurn;
	var sub_grid;
	var main_grid = new iio.Grid(0,0,3,3,150);
	var user = new Array(3);
	var ID = 0;
	var TURN = 1;
    var square; //will be layed over the currently clickable grid 
    var clickable = new Array(3);

	var init = function(){
		xTurn = true;
		sub_grid = new Array(3);
		square = new iio.Rect(io.canvas.center, 450, 450);

		for(var x = 0; x < 3; ++x){
			sub_grid[x] = new Array(3);
			for(var y = 0; y < 3; ++y){
				sub_grid[x][y] = new iio.Grid(150*x, 150*y, 3, 3, 50);
				io.addObj(sub_grid[x][y]);
			}
		}

		for(var x = 0; x < 3; ++x){
			clickable[x] = new Array(3);
			for(var y = 0; y < 3; ++y){
				clickable[x][y] = true;
			}
		}

		main_grid.setLineWidth(4);
		io.addObj(main_grid);
		square.setStrokeStyle('red', 5);	
		io.addObj(square);
		io.draw();
	}

	init();

	//////////////////////////////////
	//		Window Event Handlers	//
	//////////////////////////////////

	$('#chatmessage').keyup(function(e){
		if(e.keyCode==13){
			var msg = $('#chatmessage').val();
			var name = $('#namebox').val();
			if(name == ''){
				name = 'anonymous';
			}
			$('#chatlog')
				.val(($('#chatlog').val() + name +': '+msg))
				.animate({scrollTop: $('#chatlog').prop('scrollHeight')}, 0);
			$('#chatmessage').val('');

			socket.emit('sendMessage', {msg: msg, name: name});
		}
	});

	$('#send').click(function(){
		alert('u mad, silly human? Try hitting Return');
	});

	$('#reset').click(function(){
		io.rmvAll();
		init();
		socket.emit('reset');
	});

	//////////////////////////////////
	//		Socket Event Handlers	//
	//////////////////////////////////

	socket.on('setUser', function(data){
		user[ID] = data.id;
		user[TURN] = data.turn;
		xTurn = data.xTurn;
		console.log('user: '+user[ID]);
		console.log('Client Player Turn = ' + user[TURN]);
	});

	socket.on('setCell', function(data){
		main_grid.cells[data.cellX][data.cellY].taken = data.turn;

		if(data.turn == 'x'){
				io.addObj((new iio.XShape(75+data.cellX*150, 75+data.cellY*150, 130))
						.setStrokeStyle('red', 5));
    			return true;
    		}else if(data.turn == 'o'){
				io.addObj((new iio.Circle(75+data.cellX*150, 75+data.cellY*150, 70))
						.setStrokeStyle('blue', 5));
    		}

	});

	socket.on('setSubCell', function(data){
		xTurn = data.xTurn;

		if(data.taken == 'x'){
			io.addObj((new iio.XShape(data.center, 30))
					.setStrokeStyle('red', 3));

		}else if(data.taken == 'o'){
			io.addObj((new iio.Circle(data.center, 17))
					.setStrokeStyle('blue', 3));
		}

		sub_grid[data.cellX][data.cellY].cells[data.subCellX][data.subCellY]
			.taken = data.taken;

		setClickable(data.subCellX, data.subCellY, false);
	});

	/*socket.on('setTurn', function(data){
		xTurn = data;
		console.log('set xTurn to: ' + xTurn);
	});*/

	socket.on('changeUser', function(data){
		if(user[ID] == data.id){
			user[TURN] = data.turn;
		}
	});

	socket.on('sendMessage', function(data){
		var msg = data.msg;
		var name = data.name;
		console.log(data.msg + ' ' + data.name);
		if(name == ''){
			name = 'anonymous';
		}
		$('#chatlog')
			.val(($('#chatlog').val() + name +': '+msg))
			.animate({scrollTop: $('#chatlog').prop('scrollHeight')}, 0);
		$('#chatmessage').val('');
	});

	socket.on('reset', function(data){
		io.rmvAll();
		init();	
	});

	socket.on('log', function(data){
		console.log(data);
	});

	//////////////////////////////////
	//		Canvas Event Listener 	//
	//////////////////////////////////

	io.canvas.addEventListener('mousedown', function(event){

		// Get the coordinates of the selected cell
		var cell = main_grid.getCellAt(io.getEventPosition(event), true);
		var cellCenter = main_grid.getCellCenter(cell);
		var subCell = sub_grid[cell.x][cell.y].getCellAt(io.getEventPosition(event), true);
		var subCellCenter = sub_grid[cell.x][cell.y].getCellCenter(subCell);

		if(clickable[cell.x][cell.y] &&
			typeof sub_grid[cell.x][cell.y].cells[subCell.x][subCell.y].taken == 'undefined'){
			
			if(xTurn && user[TURN] == 'x'){
				io.addObj((new iio.XShape(subCellCenter, 30))
					.setStrokeStyle('red', 3));

				socket.emit("setSubCell", {cellX: cell.x, cellY: cell.y, 
										subCellX: subCell.x, subCellY: subCell.y,
										center: subCellCenter,
										taken: user[TURN], xTurn: xTurn});

				sub_grid[cell.x][cell.y]
					.cells[subCell.x][subCell.y]
					.taken = 'x';

				xTurn = !xTurn;
				setClickable(subCell.x, subCell.y, false);

			}else if(!xTurn && user[TURN] == 'o'){
				io.addObj((new iio.Circle(subCellCenter, 17))
					.setStrokeStyle('blue', 3));

				socket.emit("setSubCell", {cellX: cell.x, cellY: cell.y, 
										subCellX: subCell.x, subCellY: subCell.y,
										center: subCellCenter,
										taken: user[TURN], xTurn: xTurn});
				sub_grid[cell.x][cell.y]
					.cells[subCell.x][subCell.y]
					.taken = 'o';

				xTurn = !xTurn;
				setClickable(subCell.x, subCell.y, false);
			}

			isWon(cell.x, cell.y, user[TURN], cellCenter);
		}

	});

	//////////////////////////////////
	//		Helper Functions		//
	//////////////////////////////////

    // Determine if a subgrid has been won by either player
    var isWon = function(cellX, cellY, turn, center){ //determine subgrid by coordinates of maingrid

    	console.log('Checking if subGrid is won...');

    	if(((sub_grid[cellX][cellY].cells[0][0].taken==turn && sub_grid[cellX][cellY].cells[0][1].taken==turn && sub_grid[cellX][cellY].cells[0][2].taken==turn)||
    		(sub_grid[cellX][cellY].cells[1][0].taken==turn && sub_grid[cellX][cellY].cells[1][1].taken==turn && sub_grid[cellX][cellY].cells[1][2].taken==turn)||
    		(sub_grid[cellX][cellY].cells[2][0].taken==turn && sub_grid[cellX][cellY].cells[2][1].taken==turn && sub_grid[cellX][cellY].cells[2][2].taken==turn)||
    		(sub_grid[cellX][cellY].cells[0][0].taken==turn && sub_grid[cellX][cellY].cells[1][0].taken==turn && sub_grid[cellX][cellY].cells[2][0].taken==turn)||
    		(sub_grid[cellX][cellY].cells[0][1].taken==turn && sub_grid[cellX][cellY].cells[1][1].taken==turn && sub_grid[cellX][cellY].cells[2][1].taken==turn)||
    		(sub_grid[cellX][cellY].cells[0][2].taken==turn && sub_grid[cellX][cellY].cells[1][2].taken==turn && sub_grid[cellX][cellY].cells[2][2].taken==turn)||
    		(sub_grid[cellX][cellY].cells[0][0].taken==turn && sub_grid[cellX][cellY].cells[1][1].taken==turn && sub_grid[cellX][cellY].cells[2][2].taken==turn)||
    		(sub_grid[cellX][cellY].cells[2][0].taken==turn && sub_grid[cellX][cellY].cells[1][1].taken==turn && sub_grid[cellX][cellY].cells[0][2].taken==turn))&&
			 main_grid.cells[cellX][cellY].taken == 0
    	){
    		if(turn == 'x'){
				io.addObj((new iio.XShape(center, 130))
						.setStrokeStyle('red', 5));
    		}else if(turn == 'o'){
				io.addObj((new iio.Circle(center, 70))
						.setStrokeStyle('blue', 5));
    		}

    		main_grid.cells[cellX][cellY].taken = turn;
    		console.log('set ['+cellX+']['+cellY+'] to "'+turn+'"');
    		socket.emit('setCell', {cellX: cellX, cellY: cellY,
    								turn: turn});
    	}

    }

    var setClickable = function(subCellX, subCellY, all){

    	for(var y = 0;y<3;++y){
	    	for(var x = 0;x<3;++x){
	    		if(x==subCellX && y==subCellY){
	    			clickable[x][y] = true;
	    		}else if(!all){
	    			clickable[x][y] = false;
	    		}else{
	    			clickable[x][y] = true;
	    		}
	    	}
    	}

    	io.rmvObj(square);
    	io.draw();
    	square = new iio.Rect(75+150*subCellX, 75+150*subCellY, 150, 150);
		if(xTurn){
			square.setStrokeStyle('red', 4);	
		}else{
			square.setStrokeStyle('blue', 4);
		}
    	io.addObj(square);
    }

// Game closure
};
