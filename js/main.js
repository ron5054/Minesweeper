'use strict'
var gElcell = null
var gBoard
const mine = '💣'
const empty = ''
const flag = '🚩'
const life = '❤️'
const happy = '🙂'
const loser = ''
var gLife
var gFlages
var gStartTime = null
var gTimerInterval = null

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gLevel = {
    size: 0,
    mines: 0,
}

function onInit(size = 4, mines = 2, lives = 1) {
    clearInterval(gTimerInterval)
    gGame.secsPassed = 0
    gGame.shownCount = 0
    gGame.markedCount = 0
    document.querySelector('.happy').innerText = happy
    gTimerInterval = null
    gStartTime = null
    gStartTime = Date.now()
    gLife = lives
    gLevel.size = size
    gFlages = mines
    gBoard = buildBoard()
    randomMines(mines)  // need to move to oncellclicked
    addMinesCount(gBoard)// need to move to oncellclicked
    renderBoard(gBoard) // need to move to oncellclicked
    renderlives()// need to move to oncellclicked
    renderFlagsCounter()// need to move to oncellclicked
    // console.log(gBoard)
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
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>\n`
        for (var j = 0; j < board[i].length; j++) {
            var cellcontent
            if (board[i][j].isMine) cellcontent = mine
            else cellcontent = board[i][j].minesAroundCount
            strHTML += `\t<td data-i="${i}" data-j="${j}" class="cell${cellcontent} hidden" 
            onclick="onCellClicked(this, ${i}, ${j})" oncontextmenu=onMarkedCell(this,event,${i},${j})>${cellcontent}</td>\n`
        }
    }
    strHTML += '</tr>'

    document.querySelector('.game-board').innerHTML = strHTML

}



function onCellClicked(elCell, i, j) {
    console.log('Cell clicked: ', gBoard[i][j], elCell, i, j)
    gGame.isOn
    if (gBoard[i][j].isMarked) return
    if (gBoard[i][j].isShown) return
    if (!gTimerInterval) {
        gStartTime = Date.now()
        gTimerInterval = setInterval(gameTimer, 1000)
    }

    if (gBoard[i][j].isMine) {
        elCell.classList.replace('hidden', 'dead')
        gBoard[i][j].isShown = true
        gGame.markedCount++ // a mine that was steped on while still have lives = marked mine
        gLife--
        renderlives()
        if (!gLife) {
            stepedOn3Mines(elCell)
            return
        }
    } else {
        gBoard[i][j].isShown = true
        gGame.shownCount++
        elCell.classList.replace('hidden', 'empty')
        openNegs(i, j)
        checkVictory()
    }
}


// show negs with recursion - not working like it should - try to fix - fixed!!
function openNegs(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            var currCell = gBoard[i][j]
            // console.log(currCell)
            if (!currCell.isMine && !currCell.isShown && !currCell.isMarked) {
                currCell.isShown = true
                gGame.shownCount++
                var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
                elCell.classList.remove("hidden")
                elCell.classList.add("empty")
                if (!currCell.minesAroundCount) { //comment this line to win on one click :-)
                    openNegs(i, j)
                }
            }
        }
    }
    // console.log(gGame)
}


function stepedOn3Mines(elCell) {
    //update database
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            gBoard[i][j].isShown = true
        }
    }
    //reveal all cell elements
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


function onMarkedCell(elCell, event, i, j) {
    event.preventDefault()

    gBoard[i][j].isMarked = !gBoard[i][j].isMarked
    if (gBoard[i][j].isMarked && gBoard[i][j].isMine) gGame.markedCount++
    else if (!gBoard[i][j].isMarked && gBoard[i][j].isMine) gGame.markedCount--
    console.log('marked: ', gGame.markedCount);

    if (elCell.classList.contains('flag')) {
        elCell.classList.replace('flag', 'hidden')
        elCell.innerHTML = elCell.getAttribute('data-content') //saves and restore the element content
        gFlages++
    } else {
        if (!gFlages) return
        if (elCell.classList.contains('empty') || elCell.classList.contains('dead')) return
        elCell.classList.replace('hidden', 'flag')
        elCell.setAttribute('data-content', elCell.innerHTML) //saves and restore the element content
        elCell.innerHTML = flag
        gFlages--
    }
    renderFlagsCounter()
    checkVictory()
}

function gameOver() {
    console.log('game over')
    gGame.secsPassed = Math.floor((Date.now() - gStartTime) / 1000);
    clearInterval(gTimerInterval)
    document.querySelector('.happy').innerText = '🤕'
    gGame.isOn = false
    console.log(`game time: ${gGame.secsPassed}'s`)
}

//needs refactor after lives feature added - done! *not original rules*
function checkVictory() {
    if (gGame.shownCount + gGame.markedCount === gLevel.size ** 2) {
        document.querySelector('.happy').innerText = '😎'
        console.log('victory')
        gGame.secsPassed = Math.floor((Date.now() - gStartTime) / 1000);
        clearInterval(gTimerInterval)
        console.log(`game time: ${gGame.secsPassed}'s`)
    }

}

function onDarkMode() {
    document.querySelector('body').classList.toggle('dark-mode')
}

function renderlives() {
    document.querySelector('.lives').innerText = `${life.repeat(gLife)}`
}

function renderFlagsCounter() {
    document.querySelector('.flags').innerText = `${flag} ${gFlages}`
}

function gameTimer() {
    var currentTime = Date.now();
    var elapsedTime = (currentTime - gStartTime) / 1000;
    var formattedTime = Math.floor(elapsedTime);
    document.querySelector('.timer').innerText = formattedTime;
}

function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min //The maximum is inclusive and the minimum is inclusive
}