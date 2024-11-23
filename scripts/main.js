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

function GameManager(){
    let history = []; // array to store the changes the players make to the board
    let moveCount = 0;
    let currentBoard = createGameboard();

    return {
	// getBoard does a deep copy of current board.
        getBoard: () => currentBoard.map(row => [...row]),
        makeMove: (player, row, col) => {
            const moveResult = playerMove(player, currentBoard, row, col);

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
                newValue: player.marker,
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
        },
        undo: () => {
            if(moveCount > 0){
                moveCount--;
                const delta = history[moveCount];

                currentBoard = currentBoard.map((rowArr, r) => (r === delta.row ? [...rowArr] : rowArr));
                currentBoard[delta.row][delta.col] = delta.prevValue;
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
            } else{
                console.log("Nothing to redo");
            }
        }
    };
}

const player1 = Player("Player 1", "X");
const player2 = Player("Player 2", "O");

const gameManager = GameManager();

gameManager.makeMove(player1, 0, 0); 
gameManager.makeMove(player2, 1, 1); 

console.log("Board after two moves:");
console.log(gameManager.getBoard());

gameManager.undo();
console.log("Board after undo:");
console.log(gameManager.getBoard());

gameManager.undo();
console.log("Board after undo:");
console.log(gameManager.getBoard());

gameManager.redo();
console.log("Board after redo:");
console.log(gameManager.getBoard());


gameManager.makeMove(player1, 2, 2); 
console.log("Board after new move:");
console.log(gameManager.getBoard());

gameManager.undo();
console.log("Board after undo:");
console.log(gameManager.getBoard());

gameManager.redo();
console.log("Board after redo:");
console.log(gameManager.getBoard());

