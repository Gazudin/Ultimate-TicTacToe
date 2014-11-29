Ultimate-TicTacToe
==================

A more sophisticated version of a tic tac toe game.

The general idea is, that instead of having just a 3x3 game, we have a game consisting of 3 seperate 3x3 games, making it a 9x9 game. Each of the 3x3 games functions as one cell of the 9x9 game. So to ultimately win the game, you have to start winning multiple 3x3 games.

To make it more difficult, you cannot freely choose where to put your x or o, except for the very first turn of the starting player, since the game has to start somewhere. The turn of your opponent determines in which of the 3x3 games you have to continue playing. 
For example, if the first player decides to put his x in the bottom right cell of any of the 3x3 grids, the second player has to put his o in any of the cells of the bottom right 3x3 grid. I he decides to put his o into the center of the grid, the first player then has to choose a cell of the center 3x3 grid to place his x in.

If a player wins one 3x3 grid, they can still be sent their by the other player, until every cell of that 3x3 grid is taken. If a player gets sent to a 33 grid without wny free cells, he can then freely choose where to put his x or o.


