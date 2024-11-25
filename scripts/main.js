//DOM elements for the grid to place our X and Os' on
const grid = document.getElementById("grid");

function createGameboard()
{
    return [
        [ 0, 0, 0 ],
        [ 0, 0, 0 ],
        [ 0, 0, 0 ],
    ];
}

function Player(name, marker)
{
    return { name, marker };
}

function playerMove(player, board, row, col)
{
    //check if the move is valid
    if((row >= board.length || col >= board[0].length) || (row < 0 || col < 0)){
        return { success: false, message: "Invalid, move", board };
    }
    //check if the cell is occupied or not
    if(!(board[row][col] === 0)){
        console.log("Cell is already occupied");
        return board;
    }
    /*the below line makes a copy, it does this by doing a deep copy of the corresponding row where the player has made a move (placed and X or an O)
     *this is done to save memory as we don't want to deep copy everything, deep copying just the rows where the player has made changes means that -
     *we are modifying the board later on.
     */
    const newBoard = board.map((rowArr, r) => (r === row ? [...rowArr] : rowArr));
    newBoard[row][col] = player.marker;
    return { success: true, board: newBoard };
}

function GameState(player1, player2)
{
    let currentPlayer = player1; //starting with player 1
    let winner = null; //variable that tracks who won
    let isGameOver = false; //variable to track if the game is over or not

    return {
	getCurrentPlayer: () => currentPlayer,
	getWinner: () => winner,
	isOver: () => isGameOver,
	nextTurn: () => {
	    if(isGameOver){
		console.log("Game is already over");
		return;
	    }
	    currentPlayer = currentPlayer === player1 ? player2 : player1;
	},
	endGame: (winningPlayer) => {
	    isGameOver = true;
	    winner = winningPlayer;
	},
	reset: () => {
	    currentPlayer = player1;
	    winner = null;
	    isGameOver = false;
	},
    };
}
function DisplayHandler()
{
    return {
	renderBoard: (board, grid) => {
	    board.forEach( (row, rowIndex) => {
		row.forEach( (cell, colIndex) => {
		    const cellDiv = grid.children[rowIndex * board[0].length + colIndex]; //finding the corresponding grid child
		    cellDiv.innerHTML = cell === 0 ? "" : cell; //empty string for unoccupied cells
		});
	    });
	}
    };
}

function GameManager(player1, player2, displayHandler, grid)
{
    let history = []; // array to store the changes the players make to the board
    let moveCount = 0;
    let currentBoard = createGameboard();
    const gameState = GameState(player1, player2);

    const checkWinCondition = (board, player) => {
	const marker = player.marker;
	const rows = board.length;
	const cols = board[0].length;

	//checking rows and columns for three in a rows
	for(let i = 0; i < rows; i++){
	    if(board[i].every(cell => cell === marker)) return true;
	}
	for(let i = 0; i < cols; i++){
	    if(board.every(row => row[i] === marker)) return true;
	}
	//checking diagonals
	if(board.every((row, idx) => row[idx] === marker)) return true;
	if(board.every((row, idx) => row[cols - idx - 1] === marker)) return true;

	//if no three in a row then we just return false
	return false;
    };

    //function that gets called everytime a change is made to the board
    const updateDisplay = () => {
	displayHandler.renderBoard(currentBoard, grid);
    };
    
    return {
	// getBoard does a deep copy of current board.
        getBoard: () => currentBoard.map(row => [...row]),
        makeMove: (row, col) => {
	    //checking if the game is already over before making any moves
	    if(gameState.isOver()){
		console.log("Game over, no more moves allowed");
		return;
	    }
	    //getting whose turn it is to make a move
	    const currentPlayer = gameState.getCurrentPlayer();
            const moveResult = playerMove(currentPlayer, currentBoard, row, col);

            //Handle invalid moves
            if(!moveResult.success){
                console.log(moveResult.message);
                return;
            }
	    /*
	     *instead of saving the entire board everytime a player makes a move we just store the changes (the deltas)
	     *this later on lets us implement undo and redo logic, as we can use these deltas to modify the board to the prev
	     *or new values.
	     */
            const delta = {
                row,
                col,
                prevValue: currentBoard[row][col],
                newValue: currentPlayer.marker,
            };
	    /*
	     *if for example: history has 5 elements in its array, now the player undos say 2 times and then makes a move
	     *this mean that our moveCount variable would decrement twice and would be lower than history.length. In that case - 
	     *we delete all the moves that would come after the current index in history as they would be overwritten by the user-
	     *when they make a new move.
	     */
            if(moveCount < history.length){
                history = history.slice(0, moveCount);
            }
	    //push the deltas onto history array
            history.push(delta);
	    //increment moveCount
            moveCount++;
	    //set currentBoard to the board with the new move.
            currentBoard = moveResult.board;

	    //checking if the move wins the game
	    if(checkWinCondition(currentBoard, currentPlayer)){
		console.log(`${currentPlayer.name} wins`);
		gameState.endGame(currentPlayer);
	    }
	    else if (currentBoard.flat().every(cell => cell !== 0)){
		console.log("It's a draw");
		gameState.endGame(null);//setting to null means that there's no winners
	    }
	    //otherwise we just keep playing
	    else{
		gameState.nextTurn();
	    }
	    
	    updateDisplay(); //automatically update the board
        },
        undo: () => {
            if(moveCount > 0){
                moveCount--;
                const delta = history[moveCount];

                currentBoard = currentBoard.map((rowArr, r) => (r === delta.row ? [...rowArr] : rowArr));
                currentBoard[delta.row][delta.col] = delta.prevValue;


		gameState.nextTurn(); //advance turn
		updateDisplay();
            } else {
                console.log("Nothing to undo");
            }
        },
        redo: () => {
            if(moveCount < history.length){
                const delta = history[moveCount];
                
                currentBoard = currentBoard.map((rowArr, r) => (r === delta.row ? [...rowArr] : rowArr));
                moveCount++;
                currentBoard[delta.row][delta.col] = delta.newValue;

		gameState.nextTurn();//advance turn
		updateDisplay();
            } else{
                console.log("Nothing to redo");
            }
        },
	//exposing GameState methods
	getCurrentPlayer: gameState.getCurrentPlayer,
	isGameover: gameState.isOver,
	getWinner: gameState.getWinner,
    };
}



const player1 = Player("Player 1", "X");
const player2 = Player("Player 2", "O");

const displayHandler = DisplayHandler();
const gameManager = GameManager(player1, player2, displayHandler, grid);

gameManager.makeMove(0, 0);
gameManager.makeMove(1, 1);
gameManager.makeMove(2, 2);
gameManager.makeMove(0, 1);

