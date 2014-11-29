Ultimate-TicTacToe
==================

A more sophisticated version of a tic tac toe game.

 -------- How It works --------

The general idea is, that instead of having just a 3x3 game, we have a game consisting of 3 seperate 3x3 games, making it a 9x9 game. Each of the 3x3 games functions as one cell of the 9x9 game. So to ultimately win the game, you have to start winning multiple 3x3 games.

To make it more difficult, you cannot freely choose where to put your x or o, except for the very first turn of the starting player, since the game has to start somewhere. The turn of your opponent determines in which of the 3x3 games you have to continue playing. 
For example, if the first player decides to put his x in the bottom right cell of any of the 3x3 grids, the second player has to put his o in any of the cells of the bottom right 3x3 grid. I he decides to put his o into the center of the grid, the first player then has to choose a cell of the center 3x3 grid to place his x in.

If a player wins one 3x3 grid, they can still be sent their by the other player, until every cell of that 3x3 grid is taken. If a player gets sent to a 33 grid without wny free cells, he can then freely choose where to put his x or o.



 ------- Current state of the Game -------
 
Right now, ther is only one set instance of the game, as opposed to having a lobby system where people can open their own instances of the game via sessions. This is mostly due to the game still being in alpha and missing some key features to ensure full playablity. If the core game is ready, I will start scaling it towards



Needs fixes:
 - After winning a 3x3 grid and resetting the game, the bigger x (or o, respectively), indicating that the grid has been won   by a player, stops appearing.
 - If a player is sent to a fully occupied 3x3 grid, he can not place his x or o on any cell. It is intended that he is able   to put his x or o on any free cell of the 9x9 grid.
 
Mssing features:
 - Indication for having won the game after winning the 9x9 grid.
 - Public User List.
 - Vote for a game reset, instead of anyone just being able to reset the game.
 - Database system + user registration.
 - Lobby for creating games as well as searching, joining, or watching games of other users.
 - Possibly a ranking system and matchmaking, depending on demand.
 - A small integrated video tutorial on how to play the game, or possibly just an additional canvas automatically (on toggle) displaying the key differences between this and a regular game of tictactoe.
 

 
