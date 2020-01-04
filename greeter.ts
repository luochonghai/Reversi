const readlineSync = require('readline-sync');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
    path: 'test.csv',
    append: true,
    header: [
        { id: 'timepoint', title: 'Timepoint' },
        { id: 'duration', title: 'Duration', },
        { id: 'board_size', title: 'Board_Size' },
        { id: 'sente', title: 'Sente' },
        { id: 'gote', title: 'Gote' },
        { id: 'result', title: 'Result'},
    ]
});

//to write result into txt
function writeLog(resList)
{
    csvWriter
    .writeRecords(resList)
    .then(()=>console.log('Written into .csv!'));
}
/*var data = [
    {
        'timepoint': 1,
        'duration': 1,
        'board_size': 1,
        'sente': 1,
        'gote': 1,
        'result': 1,
    }
];
csvWriter
    .writeRecords(data)
    .then(()=>console.log('Written into .csv!'));*/

//to get input from command line
function getInput([chessboardLen, sente]: [number, number])
{
    chessboardLen = readlineSync.question("Enter the board dimension:");
    chessboardLen = Number(chessboardLen);
    let senteStr = readlineSync.question("Computer plays(X/O):");
    if (senteStr == 'X')
        sente = 0;
    else
        sente = 1;
    return [chessboardLen, sente];
}

//to check whether the player can put the chess piece on the tail of the line in the current direction
function lineAvail(curOrder: number, curM: Array<number>, curMat: Array<Array<number>>, directions: Array<number>): Array<number>
{
    let lineRes: Array<number> = [];
    let iter_i: number = 1;
    while(iter_i * directions[0] + curM[0] < curMat.length &&
        iter_i * directions[0] + curM[0] >= 0 && 
        iter_i * directions[1] + curM[1] < curMat.length &&
        iter_i * directions[1] + curM[1] >= 0)
    {
        let tmpX: number = iter_i * directions[0] + curM[0],
            tmpY: number = iter_i * directions[1] + curM[1];
        if (curMat[tmpX][tmpY] == -1)
        {
            let formerX: number = tmpX - directions[0];
            let formerY: number = tmpY - directions[1];
            if(curMat[formerX][formerY] != curOrder)
                lineRes = [tmpX, tmpY];
            break;
        }
        iter_i++;
    }
    return lineRes;
}

//to check whether the next player could move or not
function nextAvail(curOrder: number, curMat: Array<Array<number>>):number
{
    let nextPlace: number = 0;
    //to find all the chess pieces with the same color
    let curChessPiece: Array<Array<number>> = [];
    let iter_i: number, iter_j: number;
    for (iter_i = 0; iter_i < curMat.length; iter_i++)
    {
        for (iter_j = 0; iter_j < curMat.length; iter_j++)
        {
            if (curMat[iter_i][iter_j] == curOrder)
                curChessPiece.push([iter_i, iter_j]);
        }    
    }
    if (curChessPiece.length == 0)
        return nextPlace;
    
    let allDirect: Array<Array<number>> = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    for (iter_i = 0; iter_i < curChessPiece.length; iter_i++)
    {
        for (iter_j = 0; iter_j < allDirect.length; iter_j++)
        {
            nextPlace += lineAvail(curOrder, curChessPiece[iter_i], curMat, allDirect[iter_j]).length;
            if (nextPlace > 0)
                return 1;
        }    
    }
    return nextPlace;
}

//to check whether the chess piece on the tail of the very line has the same color as the current one
function lineCheck(curOrder: number, curM: Array<number>, curMat: Array<Array<number>>, directions: Array<number>): number
{
    let lineRes: number = 0;
    let iter_i: number = 1;
    while (iter_i * directions[0] + curM[0] < curMat.length &&
        iter_i * directions[0] + curM[0] >= 0 && 
        iter_i * directions[1] + curM[1] < curMat.length &&
        iter_i * directions[1] + curM[1] >= 0)
    {
        let tmpX: number = iter_i * directions[0] + curM[0],
            tmpY: number = iter_i * directions[1] + curM[1];
        if (curMat[tmpX][tmpY] == -1)
            break;
        if (iter_i == 1 && curMat[tmpX][tmpY] == curOrder)
            break;
        if (curOrder == curMat[tmpX][tmpY])
        {
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
function moveCheck(curOrder: number, curM: Array<number>, curMat: Array<Array<number>>): number
{
    if (curMat[curM[0]][curM[1]] != -1)
    {
        console.log("A chess piece exists there!");
        return -1;
    }
    let allDirect: Array<Array<number>> = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    let iter_i: number, pointValid: number = 0;
    for (iter_i = 0; iter_i < allDirect.length; iter_i++)
        pointValid += lineCheck(curOrder, curM, curMat, allDirect[iter_i]);
    return pointValid;
}

//to visualize the chessboard
function boardVis(curMat: Array<Array<number>>): Array<number>
{
    let crossN: number = 0, circleN: number = 0;
    let chessPiece: Array<string> = ['.', 'X', 'O'];
    let iter_i: number, iter_j: number;
    let headStr: string = "  ";
    for (iter_i = 0; iter_i < curMat.length; iter_i++)
        headStr += String.fromCharCode(97 + iter_i) + ' ';
    console.log(headStr);
    for (iter_i = 0; iter_i < curMat.length; iter_i++)
    {
        let curVisRow: string = String.fromCharCode(97 + iter_i) + ' ';
        for (iter_j = 0; iter_j < curMat.length; iter_j++)
        {
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

function boardInit(chessboardLen: number): Array<Array<number>>
{
    let initBoard: Array<Array<number>> = new Array<Array<number>>();
    let iter_i: number;
    for (iter_i = 0; iter_i < chessboardLen; iter_i++)
    {
        let tmpRow: Array<number> = new Array<number>();
        let iter_j: number;
        for (iter_j = 0; iter_j < chessboardLen; iter_j++)
            tmpRow[iter_j] = -1;
        if (iter_i == chessboardLen / 2)
        {
            tmpRow[chessboardLen / 2] = 1;
            tmpRow[chessboardLen / 2 - 1] = 0;
        }
        else if (iter_i == chessboardLen / 2 - 1)
        {
            tmpRow[chessboardLen / 2] = 0;
            tmpRow[chessboardLen / 2 - 1] = 1;            
        }
        initBoard[iter_i] = tmpRow;
    }
    
    return initBoard;
}

//to select the next player
function nextPlayer(curOrder: number, curMat: Array<Array<number>>): number
{
    var next_avail: number = nextAvail(curOrder, curMat);
    if (next_avail != 0)
        return curOrder;
    else
        return 1-curOrder;
}

//to move the chess piece
function moveChess(curOrder: number, curM: Array<number>, curMat: Array<Array<number>>): Array<Array<number>>
{
    curMat[curM[0]][curM[1]] = curOrder;
    curMat = turnChess(curOrder, curM, curMat);
    return curMat;
}

//to turn over the nearest chess pieces on a line
function lineTurnover(curOrder: number, curM: Array<number>, curMat: Array<Array<number>>, directions: Array<number>): Array<Array<number>>
{
    let iter_i: number = 1;
    let curX: number = curM[0] + directions[0] * iter_i,
        curY: number = curM[1] + directions[1] * iter_i;
    while (curX < curMat.length &&
        curX >= 0 && 
        curY < curMat.length &&
        curY >= 0 &&
        curMat[curX][curY] == 1 - curOrder)
    {
        iter_i++;
        curMat[curX][curY] = curOrder;
        curX = curM[0] + directions[0] * iter_i;
        curY = curM[1] + directions[1] * iter_i;
    }
    return curMat;
}

//to turn over the chess pieces at a time
function turnChess(curOrder: number, curM: Array<number>,curMat: Array<Array<number>>): Array<Array<number>>
{
    let allDirect: Array<Array<number>> = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    //to check whether there exists some pieces need to be turned over in 4 noncollinear directions at a time
    let iter_i: number;
    for (iter_i = 0; iter_i < allDirect.length; iter_i++)
    {
        if(lineCheck(curOrder, curM, curMat, allDirect[iter_i]) > 0)
            curMat = lineTurnover(curOrder, curM, curMat, allDirect[iter_i]);
    }
    return curMat;
}

//to let computer know where to put the chess piece
function compChess(curOrder: number, curMat: Array<Array<number>>): Array<number>
{
    //to find all the possible locations and its putting value
    let nextPlace: Array<number> = [];
    //to find all the chess pieces with the same color
    let curChessPiece: Array<Array<number>> = [];
    let iter_i: number, iter_j: number;
    for (iter_i = 0; iter_i < curMat.length; iter_i++)
    {
        for (iter_j = 0; iter_j < curMat.length; iter_j++)
        {
            if (curMat[iter_i][iter_j] == curOrder)
                curChessPiece.push([iter_i, iter_j]);
        }    
    }
    if (curChessPiece.length == 0)
        return nextPlace;
    
    let placeL: Array<Array<number>> = [];
    let valL: Array<number> = [];
    let allDirect: Array<Array<number>> = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    for (iter_i = 0; iter_i < curChessPiece.length; iter_i++)
    {
        let pointVal: number = 0;
        for (iter_j = 0; iter_j < allDirect.length; iter_j++) 
        {
            let tempP: Array<number> = lineAvail(curOrder, curChessPiece[iter_i], curMat, allDirect[iter_j]);
            if (tempP.length > 0 && placeL.includes(tempP) == false)
                placeL.push(tempP);
        }
    }

    for (var tp of placeL)
    {
        let tmpVal: number = 0;
        for (iter_i = 0; iter_i < allDirect.length; iter_i++)
            tmpVal += lineCheck(curOrder, tp, curMat, allDirect[iter_i]);    
        valL.push(tmpVal);
    }

    let maxV: number = Math.max.apply(null, valL);
    for (iter_i = 0; iter_i < valL.length; iter_i++)
    {
        if (valL[iter_i] == maxV)
        {
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
function getNowDate(): string {
    const date = new Date();
    let month: string | number = date.getMonth() + 1;
    let strDate: string | number = date.getDate();
  
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
function runner()
{
    let staTime: number = Date.parse(new Date().toString()) / 1000;
    let resType: string;
    var chessboardLen: number = 4;
    var sente: number = 0;
    [chessboardLen, sente] = getInput([chessboardLen, sente]);
    let initBoard = boardInit(chessboardLen);
    boardVis(initBoard);
    let boardChess: Array<string> = ['X', 'O'];
    let counter: Array<number> = [];

    let goPlayer: number = 0, validInput: number = 0, gameSig: number = 1;
    //to check whether the 2 player could put chess onto the chessboard
    do
    {
        goPlayer = nextPlayer(goPlayer, initBoard);
        let nextX: number, nextY: number;
        if (goPlayer == sente)//human player
        {
            let humPos = readlineSync.question("Enter move for " + boardChess[sente] + '(Row-Col):');
            nextX = humPos[0].charCodeAt(0) - 97;
            nextY = humPos[1].charCodeAt(0) - 97;
        }
        else
        {
            [nextX, nextY] = compChess(goPlayer, initBoard);
            console.log("Computer places " + boardChess[1 - sente] + ':' + 
                String.fromCharCode(97 + nextX) + String.fromCharCode(97 + nextY));
        }
        if (goPlayer == sente)
        {
            validInput = moveCheck(goPlayer, [nextX, nextY], initBoard);
            if (validInput == 0)
            {
                console.log("You make an invalid move! Computer win!")
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
    if (gameSig == 0)
    {
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

    let endTime: number = Date.parse(new Date().toString())/1000;
    //to save match result into .csv
    let sente_str: string, gote_str: string;
    if (sente == 0)
        sente_str = 'human', gote_str = 'computer';
    else
        sente_str = 'computer', gote_str = 'human';
    var matchLog = [
        {
            'timepoint': getNowDate(),
            'duration': endTime-staTime,
            'board_size': String(chessboardLen) + '*' + String(chessboardLen),
            'sente': sente_str,
            'gote': gote_str,
            'result': resType,
        }
    ];
    writeLog(matchLog);
}

runner();
    
