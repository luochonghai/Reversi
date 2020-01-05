var readlineSync = require('readline-sync');
var createCsvWriter = require('csv-writer').createObjectCsvWriter;
var csvWriter = createCsvWriter({
    path: 'test.csv',
    append: true,
    header: [
        { id: 'timepoint', title: 'Timepoint' },
        { id: 'duration', title: 'Duration' },
        { id: 'board_size', title: 'Board_Size' },
        { id: 'sente', title: 'Sente' },
        { id: 'gote', title: 'Gote' },
        { id: 'result', title: 'Result' },
    ]
});
//to write result into txt
function writeLog(resList) {
    csvWriter
        .writeRecords(resList)
        .then(function () { return console.log('Written into .csv!'); });
}
//to get input from command line
function getInput(_a) {
    var chessboardLen = _a[0], sente = _a[1];
    chessboardLen = readlineSync.question("Enter the board dimension:");
    chessboardLen = Number(chessboardLen);
    var senteStr = readlineSync.question("Computer plays(X/O):");
    if (senteStr == 'X')
        sente = 0;
    else
        sente = 1;
    return [chessboardLen, sente];
}
//to check whether the player can put the chess piece on the tail of the line in the current direction
function lineAvail(curOrder, curM, curMat, directions) {
    var lineRes = [];
    var iter_i = 1;
    while (iter_i * directions[0] + curM[0] < curMat.length &&
        iter_i * directions[0] + curM[0] >= 0 &&
        iter_i * directions[1] + curM[1] < curMat.length &&
        iter_i * directions[1] + curM[1] >= 0) {
        var tmpX = iter_i * directions[0] + curM[0], tmpY = iter_i * directions[1] + curM[1];
        if (curMat[tmpX][tmpY] == -1) {
            var formerX = tmpX - directions[0];
            var formerY = tmpY - directions[1];
            if (curMat[formerX][formerY] != curOrder)
                lineRes = [tmpX, tmpY];
            break;
        }
        iter_i++;
    }
    return lineRes;
}
//to check whether the next player could move or not
function nextAvail(curOrder, curMat) {
    var nextPlace = 0;
    //to find all the chess pieces with the same color
    var curChessPiece = [];
    var iter_i, iter_j;
    for (iter_i = 0; iter_i < curMat.length; iter_i++) {
        for (iter_j = 0; iter_j < curMat.length; iter_j++) {
            if (curMat[iter_i][iter_j] == curOrder)
                curChessPiece.push([iter_i, iter_j]);
        }
    }
    if (curChessPiece.length == 0)
        return nextPlace;
    var allDirect = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    for (iter_i = 0; iter_i < curChessPiece.length; iter_i++) {
        for (iter_j = 0; iter_j < allDirect.length; iter_j++) {
            nextPlace += lineAvail(curOrder, curChessPiece[iter_i], curMat, allDirect[iter_j]).length;
            if (nextPlace > 0)
                return 1;
        }
    }
    return nextPlace;
}
//to check whether the chess piece on the tail of the very line has the same color as the current one
function lineCheck(curOrder, curM, curMat, directions) {
    var lineRes = 0;
    var iter_i = 1;
    while (iter_i * directions[0] + curM[0] < curMat.length &&
        iter_i * directions[0] + curM[0] >= 0 &&
        iter_i * directions[1] + curM[1] < curMat.length &&
        iter_i * directions[1] + curM[1] >= 0) {
        var tmpX = iter_i * directions[0] + curM[0], tmpY = iter_i * directions[1] + curM[1];
        if (curMat[tmpX][tmpY] == -1)
            break;
        if (iter_i == 1 && curMat[tmpX][tmpY] == curOrder)
            break;
        if (curOrder == curMat[tmpX][tmpY]) {
            lineRes *= -1;
            break;
        }
        iter_i++;
        lineRes--;
    }
    if (lineRes < 0)
        lineRes = 0;
    return lineRes;
}
//to check whether the move is valid
function moveCheck(curOrder, curM, curMat) {
    if (curMat[curM[0]][curM[1]] != -1) {
        console.log("A chess piece exists there!");
        return -1;
    }
    var allDirect = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    var iter_i, pointValid = 0;
    for (iter_i = 0; iter_i < allDirect.length; iter_i++)
        pointValid += lineCheck(curOrder, curM, curMat, allDirect[iter_i]);
    return pointValid;
}
//to visualize the chessboard
function boardVis(curMat) {
    var crossN = 0, circleN = 0;
    var chessPiece = ['.', 'X', 'O'];
    var iter_i, iter_j;
    var headStr = "  ";
    for (iter_i = 0; iter_i < curMat.length; iter_i++)
        headStr += String.fromCharCode(97 + iter_i) + ' ';
    console.log(headStr);
    for (iter_i = 0; iter_i < curMat.length; iter_i++) {
        var curVisRow = String.fromCharCode(97 + iter_i) + ' ';
        for (iter_j = 0; iter_j < curMat.length; iter_j++) {
            if (curMat[iter_i][iter_j] == 0)
                crossN += 1;
            else if (curMat[iter_i][iter_j] == 1)
                circleN += 1;
            curVisRow += chessPiece[1 + curMat[iter_i][iter_j]] + ' ';
        }
        console.log(curVisRow);
    }
    return [crossN, circleN];
}
//to generate a single line of initialized chessboard(not 2 middle lines)
function initLine1(inputN) {
    return Array.from(Array(inputN[1]), function (v, k) { return -1; });
}
//to generate a single line of initialized chessboard(2 middle lines)
function initLine2(inputN) {
    return initLine1([0, inputN[1] / 2 - 1]).concat([inputN[1] / 2 - inputN[0], 1 + inputN[0] - inputN[1] / 2], initLine1([0, inputN[1] / 2 - 1]));
}
//to generate the index list used to generate the initialized chessboard line
function indexList(chessboardLen) {
    return Array.from(Array(chessboardLen), function (v, k) { return [k, chessboardLen]; });
}
//to select which func should be used to generate lines
function selectFunc(inputN) {
    return inputN[0] == inputN[1] / 2 || inputN[0] == inputN[1] / 2 - 1 ? initLine2(inputN) : initLine1(inputN);
}
function boardIf(chessboardLen) {
    return indexList(chessboardLen).map(selectFunc);
}
function boardInit(chessboardLen) {
    var initBoard = new Array();
    var iter_i;
    for (iter_i = 0; iter_i < chessboardLen; iter_i++) {
        var tmpRow = new Array();
        var iter_j = void 0;
        for (iter_j = 0; iter_j < chessboardLen; iter_j++)
            tmpRow[iter_j] = -1;
        if (iter_i == chessboardLen / 2) {
            tmpRow[chessboardLen / 2] = 1;
            tmpRow[chessboardLen / 2 - 1] = 0;
        }
        else if (iter_i == chessboardLen / 2 - 1) {
            tmpRow[chessboardLen / 2] = 0;
            tmpRow[chessboardLen / 2 - 1] = 1;
        }
        initBoard[iter_i] = tmpRow;
    }
    return initBoard;
}
//to select the next player
function nextPlayer(curOrder, curMat) {
    var next_avail = nextAvail(curOrder, curMat);
    if (next_avail != 0)
        return curOrder;
    else
        return 1 - curOrder;
}
//to move the chess piece
function moveChess(curOrder, curM, curMat) {
    curMat[curM[0]][curM[1]] = curOrder;
    curMat = turnChess(curOrder, curM, curMat);
    return curMat;
}
//to turn over the nearest chess pieces on a line
function lineTurnover(curOrder, curM, curMat, directions) {
    var iter_i = 1;
    var curX = curM[0] + directions[0] * iter_i, curY = curM[1] + directions[1] * iter_i;
    while (curX < curMat.length &&
        curX >= 0 &&
        curY < curMat.length &&
        curY >= 0 &&
        curMat[curX][curY] == 1 - curOrder) {
        iter_i++;
        curMat[curX][curY] = curOrder;
        curX = curM[0] + directions[0] * iter_i;
        curY = curM[1] + directions[1] * iter_i;
    }
    return curMat;
}
//to turn over the chess pieces at a time
function turnChess(curOrder, curM, curMat) {
    var allDirect = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    //to check whether there exists some pieces need to be turned over in 4 noncollinear directions at a time
    var iter_i;
    for (iter_i = 0; iter_i < allDirect.length; iter_i++) {
        if (lineCheck(curOrder, curM, curMat, allDirect[iter_i]) > 0)
            curMat = lineTurnover(curOrder, curM, curMat, allDirect[iter_i]);
    }
    return curMat;
}
//to let computer know where to put the chess piece
function compChess(curOrder, curMat) {
    //to find all the possible locations and its putting value
    var nextPlace = [];
    //to find all the chess pieces with the same color
    var curChessPiece = [];
    var iter_i, iter_j;
    for (iter_i = 0; iter_i < curMat.length; iter_i++) {
        for (iter_j = 0; iter_j < curMat.length; iter_j++) {
            if (curMat[iter_i][iter_j] == curOrder)
                curChessPiece.push([iter_i, iter_j]);
        }
    }
    if (curChessPiece.length == 0)
        return nextPlace;
    var placeL = [];
    var valL = [];
    var allDirect = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    for (iter_i = 0; iter_i < curChessPiece.length; iter_i++) {
        var pointVal = 0;
        for (iter_j = 0; iter_j < allDirect.length; iter_j++) {
            var tempP = lineAvail(curOrder, curChessPiece[iter_i], curMat, allDirect[iter_j]);
            if (tempP.length > 0 && placeL.includes(tempP) == false)
                placeL.push(tempP);
        }
    }
    for (var _i = 0, placeL_1 = placeL; _i < placeL_1.length; _i++) {
        var tp = placeL_1[_i];
        var tmpVal = 0;
        for (iter_i = 0; iter_i < allDirect.length; iter_i++)
            tmpVal += lineCheck(curOrder, tp, curMat, allDirect[iter_i]);
        valL.push(tmpVal);
    }
    var maxV = Math.max.apply(null, valL);
    for (iter_i = 0; iter_i < valL.length; iter_i++) {
        if (valL[iter_i] == maxV) {
            if (nextPlace.length == 0)
                nextPlace = placeL[iter_i];
            else if (nextPlace[0] > placeL[iter_i][0])
                nextPlace = placeL[iter_i];
            else if (nextPlace[0] == placeL[iter_i][0] &&
                nextPlace[1] > placeL[iter_i][1])
                nextPlace = placeL[iter_i];
        }
    }
    return nextPlace;
}
//to get the current date of the match
function getNowDate() {
    var date = new Date();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month <= 9) {
        month = "0" + month;
    }
    if (strDate <= 9) {
        strDate = "0" + strDate;
    }
    return date.getFullYear() + "-" + month + "-" + strDate + " "
        + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}
//main function
function runner() {
    var _a, _b;
    var staTime = Date.parse(new Date().toString()) / 1000;
    var resType;
    var chessboardLen = 4;
    var sente = 0;
    _a = getInput([chessboardLen, sente]), chessboardLen = _a[0], sente = _a[1];
    //let initBoard = boardInit(chessboardLen);
    var initBoard = boardIf(chessboardLen);
    boardVis(initBoard);
    var boardChess = ['X', 'O'];
    var counter = [];
    var goPlayer = 0, validInput = 0, gameSig = 1;
    //to check whether the 2 player could put chess onto the chessboard
    do {
        goPlayer = nextPlayer(goPlayer, initBoard);
        var nextX = void 0, nextY = void 0;
        if (goPlayer == sente) //human player
         {
            var humPos = readlineSync.question("Enter move for " + boardChess[sente] + '(Row-Col):');
            nextX = humPos[0].charCodeAt(0) - 97;
            nextY = humPos[1].charCodeAt(0) - 97;
        }
        else {
            _b = compChess(goPlayer, initBoard), nextX = _b[0], nextY = _b[1];
            console.log("Computer places " + boardChess[1 - sente] + ':' +
                String.fromCharCode(97 + nextX) + String.fromCharCode(97 + nextY));
        }
        if (goPlayer == sente) {
            validInput = moveCheck(goPlayer, [nextX, nextY], initBoard);
            if (validInput == 0) {
                console.log("You make an invalid move! Computer win!");
                resType = "Human gave up.";
                break;
            }
        }
        initBoard = moveChess(goPlayer, [nextX, nextY], initBoard);
        counter = boardVis(initBoard);
        //check whether the game is over
        goPlayer = 1 - goPlayer;
        gameSig = nextAvail(goPlayer, initBoard);
    } while (gameSig);
    if (gameSig == 0) {
        resType = String(counter[0] + ':' + String(counter[1]));
        console.log("Both players have no valid move.\nGame over.\nX:O="
            + resType);
        if (counter[0] > counter[1])
            console.log('X player wins.');
        else if (counter[0] < counter[1])
            console.log('O player wins.');
        else
            console.log('Draw.');
    }
    var endTime = Date.parse(new Date().toString()) / 1000;
    //to save match result into .csv
    var sente_str, gote_str;
    if (sente == 0)
        sente_str = 'human', gote_str = 'computer';
    else
        sente_str = 'computer', gote_str = 'human';
    var matchLog = [
        {
            'timepoint': getNowDate(),
            'duration': endTime - staTime,
            'board_size': String(chessboardLen) + '*' + String(chessboardLen),
            'sente': sente_str,
            'gote': gote_str,
            'result': resType
        }
    ];
    writeLog(matchLog);
}
runner();
