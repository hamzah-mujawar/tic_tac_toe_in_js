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
    if((row >= board.length || col >= board[0].length) || (row < 0 || col < 0)){
        console.log("Invalid move");
        return board;
    }
    if(!(board[row][col] === 0)){
        console.log("Cell is already occupied");
        return board;
    }
    return board.map((rowArr, r) =>
        rowArr.map((cell, c) => (r === row && c === col ? player.marker : cell))
    );
}

function GameManager(){
    let history = []; //array to hold board states
    let moveCount = 1;
    let undo_redo_flag = false;
    let currentBoard = createGameboard();

    return {
        getBoard: () => currentBoard,
        makeMove: (player, row, col) => {
            const newBoard = playerMove(player, currentBoard, row, col);
            if (newBoard !== currentBoard){
                if(undo_redo_flag === true && moveCount !== history.length){
                    undo_redo_flag = false;
                }
                history.push(currentBoard); // Save the current state before updating
                ++moveCount;
                currentBoard = newBoard;
                history.push(newBoard); // Push the new state as well
            }
        },
        undo: () => {
            if(moveCount > 0){
                undo_redo_flag = true;
                currentBoard = history[--moveCount];
            } else {
                console.log("Nothing to undo");
            }
        },
        redo: () => {
            if(history.length > moveCount){
                undo_redo_flag = true;
                currentBoard = history[++moveCount];
            } else{
                console.log("Nothing to redo");
            }
        }
    }
}
const player1 = Player("smth", "X");
const player2 = Player("smthelse", "O");

const gameManager = GameManager();


gameManager.makeMove(player1, 0, 0); // Player 1 makes a move
gameManager.makeMove(player2, 1, 1); // Player 2 makes a move

console.log(gameManager.getBoard());

gameManager.undo();

gameManager.makeMove(player1, 2, 2);
console.log(gameManager.getBoard());

gameManager.undo();
console.log(gameManager.getBoard());

gameManager.redo();
console.log(gameManager.getBoard());



