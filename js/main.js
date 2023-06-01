'use strict'
var gElcell = null
var gBoard
const mine = '💣'
const empty = ''
const flag = '🚩'
const life = '❤️'
var gLife = 3
var gFlages = 2
var gStartTime = null
var gTimerInterval = null
var gMines = 2

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
    gTimerInterval = null
    gStartTime = null
    gStartTime = Date.now()
    gLife = 3
    gLevel.size = 4
    gBoard = buildBoard()
    randomMines(2)  // need to move to oncellclicked
    addMinesCount(gBoard)// need to move to oncellclicked
    renderBoard(gBoard) // need to move to oncellclicked
    renderlives()
    gGame.isOn = true
    addFlagOnRightClick()
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
    gTimerInterval = null
    gStartTime = null
    gStartTime = Date.now()
    document.querySelector('.happy').innerText = '🙂'
    gLevel.size = size
    gBoard = buildBoard()
    randomMines(mines)
    addMinesCount(gBoard)
    renderBoard(gBoard)
    gLife = 3
    renderlives()
    gFlages = mines
    gMines = mines
    // addFlagOnRightClick() 
    renderFlagsCounter()
}

function onCellClicked(elCell, i, j) {
    if (!gGame.isOn) return
    if (gBoard[i][j].isMarked) return
    if (!gTimerInterval) gTimerInterval = setInterval(gameTimer, 1)

    if (gBoard[i][j].isMine) {
        elCell.classList.replace('hidden', 'dead')
        gBoard[i][j].isShown = true
        gLife--
        renderlives()
        if (!gLife) {
            isMine(elCell)
            return
        }
    } else {
        gBoard[i][j].isShown = true
        elCell.classList.replace('hidden', 'empty');
        openNegs(i, j)
        checkVictory()
        console.log('Cell clicked: ', elCell, i, j)
    }
}


//show negs with recursion - not working like it should - try to fix
function openNegs(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            var currCell = gBoard[i][j]
            console.log(currCell)
            if (!currCell.isMine && !currCell.isShown && !currCell.isMarked) {
                currCell.isShown = true
                var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
                elCell.classList.remove("hidden")
                elCell.classList.add("empty")
                if (currCell.minesAroundCount === 0)
                    openNegs(i, j)
            }
        }
    }
}


function isMine(elCell) {
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
}

// countes the mines around a cell 
function countMinesAround(board, rowIdx, colIdx) {
    var count = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            var currCell = board[i][j]
            if (currCell.isMine) count++
        }
    }
    return count
}

function gameOver() {
    console.log('game over')
    clearInterval(gTimerInterval)
    document.querySelector('.happy').innerText = '🤕'
    gGame.isOn = false
}

function onReset() {
    clearInterval(gTimerInterval)
    gFlages = gMines
    renderFlagsCounter()
    onInit()
    document.querySelector('.happy').innerText = '🙂'
}

// need to fix - every second click on one of the buttons the flags are disabled 
function addFlagOnRightClick() {
    const gameBoard = document.querySelector('.game-board')
    gameBoard.addEventListener('contextmenu', function (e) {
        const targetCell = e.target
        if (targetCell.tagName === 'TD') {
            if (targetCell.classList.contains('flag')) {
                targetCell.classList.add('hidden')
                targetCell.classList.remove('flag')
                targetCell.innerHTML = targetCell.getAttribute('data-content')
                gFlages++
                console.log(gFlages);
            } else {
                if (!gFlages) return
                targetCell.classList.remove('hidden')
                targetCell.classList.add('flag')
                targetCell.setAttribute('data-content', targetCell.innerHTML)
                targetCell.innerHTML = flag
                gFlages--
            }
        }
        renderFlagsCounter()
    })
}
//needs refactor after lives feature added
function checkVictory() {
    var openCells = 0
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].isShown) openCells++
        }
    }
    if (openCells + gMines === gLevel.size ** 2) {
        document.querySelector('.happy').innerText = '😎'
        console.log('victory')
        clearInterval(gTimerInterval)
    }

}

function onDarkMode() {
    document.querySelector('body').classList.toggle('dark-mode')
}

function renderlives() {
    document.querySelector('.lives').innerText = `${gLife} ${life}`
}

function renderFlagsCounter() {
    document.querySelector('.flags').innerText = `${flag} ${gFlages}`
}

function gameTimer() {
    var currentTime = Date.now();
    var elapsedTime = (currentTime - gStartTime) / 1000;
    var minutes = Math.floor(elapsedTime / 60);
    var seconds = Math.floor(elapsedTime % 60);
    var formattedTime = (minutes > 0 ? minutes + ':' : '') + (minutes > 0 && seconds < 10 ? '0' : '') + seconds;
    document.querySelector('.timer').innerText = 'Time: ' + formattedTime;
}


function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min //The maximum is inclusive and the minimum is inclusive
}