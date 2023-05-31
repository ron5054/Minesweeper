'use strict'
var gBoard
const mine = '💣'
const empty = ''
const flag = '🚩'
const boom = '💥'
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gLevel = {
    size: 4,
    mines: 2,
}

function onInit() {
    gBoard = buildBoard()
    renderBoard(gBoard)
    console.log(countMinesAround(gBoard, 3, 3));
}

function buildBoard() {
    var board = []
    for (var i = 0; i < gLevel.size; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.size; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i][j] = cell
        }

    }
    board[0][0].isMine = true
    board[2][2].isMine = true
    board[2][3].isMine = true
    console.log(board);
    // for (var i = 0; i < gLevel.size; i++) {
    //     for (var j = 0; j < gLevel.size; j++) {
    //         cell.minesAroundCount = countMinesAround(board, i, j)
    //     }
    // }
    return board
}

function renderBoard(board) {
    var strHTML = ''
    var className = 'hidden'
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr class="game-row">\n`
        for (var j = 0; j < board[i].length; j++) {
            var cellcontent
            if (board[i][j].isMine) cellcontent = mine
            else if (board[i][j].isMarked) cellcontent = flag
            else cellcontent = board[i][j].minesAroundCount
            strHTML += `\t<td data-i="${i}" data-j="${j}" class="cell ${className}" 
            onclick="onCellClicked(this, ${i}, ${j}) " >${cellcontent}
         </td>\n`
        }
    }
    strHTML += '</tr>'

    document.querySelector('.game-board').innerHTML = strHTML

}

function onCellClicked(elCell, i, j) {
    console.log('Cell clicked: ', elCell, i, j)
    if (gBoard[i][j].isMarked)
        if (gBoard[i][j].isMine) {
            for (var i = 0; i < gBoard.length; i++) {
                for (var j = 0; j < gBoard[i].length; j++) {
                    gBoard[i][j].isShown = true
                }
            }
            var cells = document.getElementsByClassName('hidden')
            for (var i = 0; i < cells.length; i++) {
                cells[i].classList.remove('hidden')
            }
            gameOver()
            return
        } else {
            gBoard[i][j].isShown = true
            elCell.classList.remove('hidden')
        }
    console.log(gBoard[i][j]);

}

// count mines around cell
function countMinesAround(board, rowIdx, colIdx) {
    var count = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            if (currCell.isMine) count++
        }
    }
    return count
}

function gameOver() {
    console.log('game over')
}

console.log(gBoard);

