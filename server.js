var port = 61027; // or 61037
//var server = require('http');
var io = require('socket.io').listen(port);

var xTurn;
var users = new Array();
var main_grid = new Array(3);
var sub_grid = new Array(9);

var init = function(){
	xTurn = true;

	for(var a = 0; a < 3; ++a){
		main_grid[a] = new Array(3);
		for(var b = 0; b < 3; ++b){
			main_grid[a][b] = 0;
		}
	}

	for(var a = 0; a < 9; ++a){
		sub_grid[a] = new Array(9);
		for(var b = 0; b < 9; ++b){
			sub_grid[a][b] = 0;
		}
	}
}

init();

io.sockets.on('connection', function(client){
	users.push(client.id);
	console.log('New connection: '+client.id);
	console.log('Client: '+client);
	console.log('Users: '+users);
	console.log('Users length: '+users.length);
	client.broadcast.emit('log', 'User "' + client.id + '" has connected!');

	if(typeof users[0] == 'undefined' || users.length==1){
		users[0] = users.splice(users.length-1,1);
		client.emit('setUser', {turn: 'x', id: client.id, xTurn: xTurn})
		console.log('Set User '+users.length+' to x.');
	}else if(users.length==2){
		client.emit('setUser', {turn: 'o', id: client.id, xTurn: xTurn})
		console.log('Set User '+users.length+' to o.');
	}else{
		//Set User as spectator
		client.emit('setUser', {turn: 's', id: client.id, xTurn: xTurn})
		console.log('Set User '+users.length+' to s.');
	}

	for(var y = 0; y < 9; ++y){
		for(var x = 0; x < 9; ++x){
			if(typeof sub_grid[x][y].taken != 'undefined'){

				console.log('sub_grid['+x+']['+y+']: '+sub_grid[x][y]);
				var cellX = Math.floor(x/3);
				var cellY = Math.floor(y/3);
				var subCellX = x-(3*cellX);
				var subCellY = y-(3*cellY);
				client.emit('setSubCell', {cellX: cellX, cellY: cellY,
										subCellX: subCellX, subCellY: subCellY,
										center: sub_grid[x][y],
    									taken: sub_grid[x][y].taken, xTurn: xTurn});
			}
		}
	}
	for(var y = 0; y < 3; ++y){
		for(var x = 0; x < 3; ++x){
			if(typeof main_grid[x][y] != 'undefined'){

				console.log('main_grid['+x+']['+y+']: '+main_grid[x][y]);
				var cellX = x;
				var cellY = y;
				client.emit('setCell', {cellX: cellX, cellY: cellY,
    									turn: main_grid[x][y]});
			}
		}
	}

	client.on('disconnect', function(){
		console.log('user disconnected: '+client.id);
		client.broadcast.emit('log', 'User "' + client.id + '" has disconnected!');

		//remove disconnected client from users
		for(var i = 0; i < users.length; ++i){
			if(users[i] == client.id){
				if(i==0){
					if(users.length>2){
						users[i] = users.splice(2,1);
						console.log('users['+i+']: '+users[i]);
						//broadcast id and xTurn to clients
						//client who was users[2] (spectator) will now change to turn x and users[0]
						client.broadcast.emit('changeUser', {turn: 'x', id: users[i]})
					}else if(users.length>1){
						delete users[i];
					}else{
						users.splice(i,1);
					}
				}else if(i==1){
					if(users.length>2){
						users[i] = users.splice(2,1);
						//broadcast id and xTurn to clients
						//client who was users[2] (spectator) will now change to turn o and users[1]
						client.broadcast.emit('changeUser', {turn: 'o', id: users[i]})
					}else{
						users.splice(i,1);
					}
				}else{
					users.splice(i,1);
				}
			console.log('Users: '+users.length);
			}
		}
    });

    client.on('setSubCell', function(data){
    	//switch the whose turn it is when cell has been set
    	xTurn = !data.xTurn;
    	var cellX = data.cellX;
    	var cellY = data.cellY;
    	var subCellX = data.subCellX;
    	var subCellY = data.subCellY;
    	//mark that cell as either 'x' or 'o'
    	sub_grid[subCellX+(3*cellX)][subCellY+(3*cellY)] = data.center;
    	sub_grid[subCellX+(3*cellX)][subCellY+(3*cellY)].taken = data.taken;
    	//broadcast marked cell to all clients
    	client.broadcast.emit('setSubCell', {cellX: cellX, cellY: cellY,
    										subCellX: subCellX, subCellY: subCellY,
    										center: data.center,
    										taken: data.taken, xTurn: xTurn});
    });

    client.on('setCell', function(data){
   		main_grid[data.cellX][data.cellY] = data.turn;
   		client.broadcast.emit('setCell', data);

    });

    client.on('sendMessage', function(data){
    	console.log(data.msg + ' ' + data.name);
    	client.broadcast.emit('sendMessage', data);
    });

    client.on('reset', function(data){
    	xTurn = true;
    	reset();
   		client.broadcast.emit('reset');
   		client.broadcast.emit('log', '\n==========\nRESET GAME\n==========\n');

    });

    //////////////////////////
    //	     	Helpers	  		//
    //////////////////////////

    // Resetting the current game
    var reset = function(){

		main_grid = new Array(3);
		sub_grid = new Array(9);

		init();

		/*
    	for(var y = 0; y < 9; ++y){
			for(var x = 0; x < 9; ++x){
				sub_grid[x][y].taken = 'undefined';
			}
		}

		for(var y = 0; y < 3; ++y){
			for(var x = 0; x < 3; ++x){
				main_grid[x][y] = 'undefined';
			}
		}
		*/
    }

    // Broadcasting console log to all clients


});
