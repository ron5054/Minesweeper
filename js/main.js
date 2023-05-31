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
    randomMines(2)  // need to move to oncellclicked
    addMinesCount(gBoard)// need to move to oncellclicked
    renderBoard(gBoard) // need to move to oncellclicked
    console.log(gBoard);
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

    // board[0][0].isMine = true
    // board[2][2].isMine = true
    // board[2][3].isMine = true

    return board
}
// adds the negs numbers to the board
function addMinesCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            board[i][j].minesAroundCount = countMinesAround(board, i, j)
            if (board[i][j].minesAroundCount === 0) board[i][j].minesAroundCount = ''
        }
    }
}

// set x number of mines in random positions
function randomMines(mineNumber) {
    var size = gLevel.size
    var mineCount = 0

    while (mineCount < mineNumber) {
        var row = getRandomInt(0, size - 1)
        var col = getRandomInt(0, size - 1)

        if (!gBoard[row][col].isMine) {
            gBoard[row][col].isMine = true
            mineCount++
        }
    }
}

function renderBoard(board) {
    var strHTML = ''
    var className = 'hidden'
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr class="game-row">\n`
        for (var j = 0; j < board[i].length; j++) {
            var cellcontent
            if (board[i][j].isMine) cellcontent = mine
            else cellcontent = board[i][j].minesAroundCount
            strHTML += `\t<td data-i="${i}" data-j="${j}" class="cell ${className}" 
            onclick="onCellClicked(this, ${i}, ${j}) " >${cellcontent}
         </td>\n`
        }
    }
    strHTML += '</tr>'

    document.querySelector('.game-board').innerHTML = strHTML

}
// set Difficulty
function onDifficulty(size, mines) {
    gLevel.size = size
    console.log(gLevel.size);
    gBoard = buildBoard()
    randomMines(mines)
    addMinesCount(gBoard)
    renderBoard(gBoard)
}

function onCellClicked(elCell, i, j) {
    console.log('Cell clicked: ', elCell, i, j)
    if (gBoard[i][j].isMarked) return
    if (gBoard[i][j].isMine) {
        //update database
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[i].length; j++) {
                gBoard[i][j].isShown = true
            }
        }
        //reveal all cells
        var cells = document.getElementsByClassName('hidden')
        for (var k = 0; k < cells.length; i++) {
            cells[k].classList.replace('hidden', 'empty')
        }
        elCell.classList.replace('empty', 'dead')
        gameOver()
        return
    } else {
        gBoard[i][j].isShown = true
        elCell.classList.replace('hidden', 'empty');
    }
    console.log(gBoard[i][j]);
}

// onRightClick(event)() {
//     if (event.button === 2) elCell.innerText = flag
//     console.log(event)
// }



function countMinesAround(mat, rowIdx, colIdx) {
    var count = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > mat.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > mat[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            var currCell = mat[i][j]
            if (currCell.isMine) count++
        }
    }
    return count
}



function gameOver() {
    console.log('game over')
    document.querySelector('.happy').innerText = '🤕'
}

function onReset() {
    location.reload() // fix this shit!
}


function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min //The maximum is inclusive and the minimum is inclusive
}