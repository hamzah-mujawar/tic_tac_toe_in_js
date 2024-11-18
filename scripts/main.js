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
    return { name, marker }
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
    //copying the board
    const newBoard = board.map((rowArr, r) => (r === row ? [...rowArr] : rowArr));
    newBoard[row][col] = player.marker;

    return { success: true, board: newBoard };
}

function GameManager(){
    let history = []; //array to hold board states
    let moveCount = 0;
    let currentBoard = createGameboard();

    return {
        getBoard: () => currentBoard.map(row => [...row]),
        makeMove: (player, row, col) => {
            const moveResult = playerMove(player, currentBoard, row, col);

            //Handle invalid moves
            if(!moveResult.success){
                console.log(moveResult.message);
                return;
            }
            const delta = {
                row,
                col,
                prevValue: currentBoard[row][col],
                newValue: player.marker,
            };
            if(moveCount < history.length){
                history = history.slice(0, moveCount);
            }
            history.push(delta);
            moveCount++;
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
    }
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

gameManager.makeMove(player1, 2, 2); 
console.log("Board after new move:");
console.log(gameManager.getBoard());

gameManager.undo();
console.log("Board after undo:");
console.log(gameManager.getBoard());

gameManager.redo();
console.log("Board after redo:");
console.log(gameManager.getBoard());

