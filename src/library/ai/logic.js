import { TIGER, GOAT, EAT, PUT, MOVE, TOTAL_GOAT, GOAT_EATING_POINTS } from '../constants';
const largeLimit = 1000000;
const debug = false;
export class Logic {

    constructor(board, AILevel){
        this.board = board;
        this.AILevel = AILevel;

        // depth level starts from 1 to AILevel
        this.depthLevel = 1;

        this.bestMove = {};
        this.turn = TIGER;

        this.movableTigers = 4;
        this.deadGoats = 0;
        // this.tigerClosedSpaceCount = 0;
        this.moveLists = {};

        // what will be the next point index
        this.nextMove = {
            turn: TIGER,
            sourcePoint: null,
            destinationPoint: null,
            actionType: MOVE,
            eatGoatPoint: null
        };
    }

    // total goats remaining to put on board
    goatsRemaining(goats){
        return TOTAL_GOAT - goats.length;
    }

    goatsDead(goats){
        if(!goats)
            return 0;

        return goats.reduce((count, goat) => {
            return count + (goat.dead ? 1: 0); 
        }, 0);
    }

    goatandtiger(text, display=false) {
        if(display) {
        }
    }

    getNextBestMove(turn, availableTigers = null) {
        this.turn = turn;
        if(turn == TIGER){
            let bestAvailableMove = {};
            let bestPossibleMove = {};

            // if only one possible move then return without computing
            if(availableTigers.length == 1 && availableTigers[0].possibleMoves.length == 1) {
                bestAvailableMove = availableTigers[0];
                bestPossibleMove = bestAvailableMove.possibleMoves[0];

            } else {
                this.moveLists = this.getTigerMoveListsFromAvailableTigers(availableTigers);

                // if(this.moveLists.length < 1)
                //     // return null;
                this.computeMinMax(this.depthLevel, true);

                bestAvailableMove = availableTigers.find(tiger => tiger.point == this.bestMove.sourcePoint);
                bestPossibleMove = bestAvailableMove.possibleMoves.find(bestMove =>  bestMove.point == this.bestMove.destinationPoint);
            }

            let eatGoatIndex = null;
            if(bestPossibleMove.hasOwnProperty('eatGoatIndex') && typeof bestPossibleMove.eatGoatIndex !== "object" ) {
                eatGoatIndex = bestPossibleMove.eatGoatIndex;
            }

            return {
                tigerIndex: bestAvailableMove.tiger,
                currentPointIndex: bestAvailableMove.point, 
                nextPointIndex: bestPossibleMove.point, 
                eatGoat: bestPossibleMove.eatGoat, 
                eatGoatIndex
            };

        } else { // GOAT
            let availableMoves = this.board.points.filter(p => !p.item);
            const goatsRemaining = this.goatsRemaining(this.board.goats);
            if(goatsRemaining > 0){ // PUT
                this.moveLists = this.getGoatPutMoveListsFromAvailableMoves(availableMoves);
            } else { // MOVE
                const goatMoves = [];
                this.board.goats.forEach(goat => {
                    if(!goat.dead){
                        const possibleMoves = this.board.getNextPossibleMove(goat.currentPoint, GOAT);

                        if(possibleMoves.length) {
                            possibleMoves.forEach(destinationPoint => {
                                goatMoves.push({
                                    turn: GOAT,
                                    sourcePoint: this.convertToNumber(goat.currentPoint),
                                    destinationPoint: this.convertToNumber(destinationPoint.point),
                                    actionType: MOVE,
                                    eatGoatPoint: null
                                });
                            });
                        }
                    }
                });

                this.moveLists = goatMoves;
            }
                        
            if(!this.moveLists.length) {
                return false;
            }
            this.computeMinMax(this.depthLevel, false);

            if(!this.bestMove) {
                return false;
            }

            const bestAvailableMove = availableMoves.find(move => move.index == this.bestMove.destinationPoint);
            if(!bestAvailableMove)
                return false;

            return {
                sourcePoint: this.bestMove.sourcePoint,
                destinationPoint: this.bestMove.destinationPoint,
                move: bestAvailableMove,
                type: this.bestMove.actionType,
            };
        }
    }

    getTigerMoveListsFromAvailableTigers(availableTigers) {
        const goats = this.board.goats;
        const turn = this.turn;

        let goatsRemaining = 0;
        if(turn == GOAT){
            // check only if it's goat's turn
            goatsRemaining = this.goatsRemaining(goats);
        }

        const moves = [];

        let totalMovableTigers = 0;
        availableTigers.forEach((object) => {
            if(object.possibleMoves.length){
                totalMovableTigers+=1;
                object.possibleMoves.forEach((destination) => {

                    // default action type(because both goat and tiger can move)
                    let actionType = MOVE;
                    let eatGoatPoint = null;
                    if(turn == TIGER && destination.eatGoat){
                        actionType = EAT;
                        // finding which point we can eat goat
                        eatGoatPoint = this.convertToNumber(this.board.goats[destination.eatGoatIndex].currentPoint);
                    } else if(goatsRemaining > 0){
                        actionType = PUT;
                    }

                    moves.push({
                        turn,
                        sourcePoint: this.convertToNumber(object.point),
                        destinationPoint: this.convertToNumber(destination.point),
                        actionType,
                        eatGoatPoint
                    });
                });
            }
        });
        this.movableTigers = totalMovableTigers;
        // this.tigerClosedSpaceCount = moves.length;
        this.deadGoats = this.goatsDead(goats);
        return moves;
    }

    getGoatPutMoveListsFromAvailableMoves(availableMoves) {
        const goatsRemaining = this.goatsRemaining(this.board.goats);
        let actionType = MOVE;
        if(goatsRemaining > 0){
            actionType = PUT;
        }

        const moves = [];
        if (availableMoves && availableMoves.length > 0) {
            availableMoves.forEach((object) => {
                moves.push({
                    turn: GOAT,
                    sourcePoint: null,
                    destinationPoint: this.convertToNumber(object.index),
                    actionType,
                    eatGoatPoint: null
                });
            });
            // this.movableTigers = totalMovableTigers;
            // this.tigerClosedSpaceCount = moves.length;
            // this.deadGoats = this.goatsDead(goats);
        }
        return moves;
    }

    convertToNumber(value) {
        if(typeof value === 'object' && !value) 
            return null;

        return Number(value);
    }
    
    checkGoatDiesAnywhere(destinationPoint) {
        return this.board.tigers.some(tiger => {
            const tigerPoint = tiger.currentPoint;
            
            const goatDiesInDestinationPoint = this.checkIfGoatDies(tigerPoint, destinationPoint);
            if(goatDiesInDestinationPoint) {
                return true;
            }

            return this.board.goats.some(goat => {
                const goatPoint = goat.currentPoint;
                return this.checkIfGoatDies(tigerPoint, goatPoint);
            });
        });
    }

    checkIfGoatDies(tigerPoint, goatPoint) {
        if( GOAT_EATING_POINTS[tigerPoint].hasOwnProperty(goatPoint) && this.board.points.hasOwnProperty(goatPoint) ) {
            const reachPoint = GOAT_EATING_POINTS[tigerPoint][goatPoint];
            // check if reach Point is empty in board, if empty then return true
            if ((typeof this.board.points[reachPoint].item === "object") && !this.board.points[reachPoint].item) {
                return true;
            }
        }
        return false;
    }

    costEvaluation(depthLevel) {
        const tigerClosedSpaceCount = this.tigerClosedSpaceCount();

        if(debug)
            console.log(this.consoleSpaces(depthLevel), '=================costEvaluation start===================');
        if(debug)
            console.log(this.consoleSpaces(depthLevel), this.nextMove.turn, this.nextMove.destinationPoint);
        
        // const winner = this.getWinner();
        let score = 0;
        // if(!winner) {
        score = (200 * this.movableTigers) + (1000 * this.deadGoats) - (100 * depthLevel);
        let scoreString = `(200 * ${this.movableTigers}) + (1000 * ${this.deadGoats}) - (100 * ${depthLevel})`;
        const tigerClosedSpaceCountScore = (200 * tigerClosedSpaceCount);

        // if chosen goat to play, tiger closed space is good, so reduce the score
        if(this.board.chosenItem == GOAT) {   
            score -= tigerClosedSpaceCountScore;
            scoreString += ` - (200 * ${tigerClosedSpaceCount})`;
        } else {
            score += tigerClosedSpaceCountScore;
            scoreString += ` + (200 * ${tigerClosedSpaceCount})`;
        }

        if(typeof this.nextMove.eatGoatPoint !== "object"){ // NOT NULL OBJECT(Only when played as goat)
            if(debug)
                console.log(this.consoleSpaces(depthLevel), 'NOT NULL OBJECT CHECK');
            score += 10000;
            scoreString += ` + 10000`;

            if(debug)
                console.log(this.consoleSpaces(depthLevel), `eatGoatPoint score is ${score}`);
        } 

        if(this.nextMove.turn == GOAT) { // (when played as tiger)
            const destinationPoint = (this.nextMove.destinationPoint) ? this.nextMove.destinationPoint : 0;
            const goatDies = this.checkGoatDiesAnywhere(destinationPoint);

            if(debug)
                console.log(this.consoleSpaces(depthLevel), `GOAT DIES ANYWHERE? `, Boolean(goatDies));
            
            // when user is playing as a tiger, if tiger eats goat, then scores increases
            if(goatDies) { 
                score += 10000;
                scoreString += ` + 10000`;
            }
        }

        scoreString += ` = ${score}`;
        if(debug)
            console.log(this.consoleSpaces(depthLevel), `SCORE IS ${scoreString}`);
        if(debug)
            console.log(this.consoleSpaces(depthLevel), '=================costEvaluation ended===================');

        return score;
    }

    tigerClosedSpaceCount() {
        let count = 0;
        this.board.tigers.forEach(point => {
            const possibleMoves = this.board.getNextPossibleMove(point.currentPoint);
            count += possibleMoves.length;
        });

        return count;
    }

    // only to display logs with tabs based on level, more the level more space indent will be left, just for test, will be removed later
    consoleSpaces(depthLevel) {
        let spaces = '';
        for(let i=1; i < depthLevel; i++) {
            spaces += '    ';
        }
        return spaces;
    }


    computeMinMax(depthLevel, isMax=true, minLimit=-largeLimit, maxLimit=largeLimit) {
        this.turn = (isMax)?TIGER:GOAT;
        const score = this.costEvaluation(depthLevel);

        // return the score from leaf node
        if((depthLevel > this.AILevel) || (Math.abs(score) == largeLimit)) {
            return score;
        }

        let moveLists = []; 
        // level 1 move list has already been created by
        if(depthLevel == 1) {
            moveLists = this.moveLists;
        } else {
            this.simulateMove(this.nextMove);
            let goatsRemaining = 0;
            if(this.turn == GOAT){
                goatsRemaining = this.goatsRemaining(this.board.goats);
                let actionType = MOVE;
                if(goatsRemaining) {
                    // If goats remaining then put
                    actionType = PUT;
                    const nextMoves = this.board.points.filter(point => !point.item);
                    nextMoves.forEach(nextMove => {
                        let sourcePoint = (actionType == PUT)? null : this.nextMove.sourcePoint;
                        moveLists.push({
                            turn: this.turn,
                            sourcePoint,
                            destinationPoint: nextMove.index,
                            actionType,
                            eatGoatPoint: null
                        });
                    });
                } else {
                    this.board.goats.forEach(goat => {
                        const possibleMovePoints = this.board.getNextPossibleMove(goat.currentPoint, GOAT);
                        // console.log('possible moves points', possibleMovePoints);
                        if(possibleMovePoints.length){
                            possibleMovePoints.forEach(point => {
                                moveLists.push({
                                    turn: GOAT,
                                    sourcePoint: goat.currentPoint,
                                    destinationPoint: point.point,
                                    actionType: MOVE,
                                    eatGoatPoint: null
                                });
                            });
                        }
                    });
                }
            } else {
                // get from board
                const availableTigers = [];
                this.board.tigers.forEach(point => {
                    const tigerMove = {
                        point: point.currentPoint,
                        possibleMoves: this.board.getNextPossibleMove(point.currentPoint)
                    };
                    availableTigers.push(tigerMove);
                });

                moveLists = this.getTigerMoveListsFromAvailableTigers(availableTigers);
            }
        }

        // if no movelist, return the previous score
        if(!moveLists.length)
            return score;
            
        let value = 100000000;
        if(isMax){
            if(debug)
                console.log(this.consoleSpaces(depthLevel), 'Turn =>', this.turn);
            if(debug)
                console.log(this.consoleSpaces(depthLevel), 'isMax Condition =====>', JSON.stringify(moveLists));

            value = -value;
            for(let move of moveLists) {
                // backup the board before change
                const backups = this.backupBoard();

                this.nextMove = move;

                // go deeper in the search tree recursively
                if(debug)
                    console.log(this.consoleSpaces(depthLevel), '================Max, Start==================', JSON.stringify(move));
                const value_t = this.computeMinMax(depthLevel+1, false, minLimit, maxLimit);
                if(debug)
                    console.log(this.consoleSpaces(depthLevel), '================Max, End==================', value, value_t, depthLevel);
                if(debug)
                    console.log('');

                if(value_t > value){
                    value = value_t;
                    minLimit = Math.max(minLimit, value);
                    if(depthLevel == 1){
                        if(debug)
                            console.log(this.consoleSpaces(depthLevel), 'Max, best move is', JSON.stringify(move), 'the max value is:', value);
                        if(debug)
                            console.log('');
                        this.bestMove = move;
                    }
                }

                // revert the last change
                this.revertBoard(backups);

                if(minLimit >= maxLimit) {
                    break;
                }
            }

            return value;

        } else {
            if(debug)
                console.log(this.consoleSpaces(depthLevel), 'Turn =>', this.turn);
            if(debug)
                console.log(this.consoleSpaces(depthLevel), 'not Max Condition =====>', JSON.stringify(moveLists));

            for(let move of moveLists) {
                // backup the board before change
                const backups = this.backupBoard();

                this.nextMove = move;

                // go deeper in the search tree recursively
                if(debug)
                    console.log(this.consoleSpaces(depthLevel), '================Min, Start==================', JSON.stringify(move));
                const value_t = this.computeMinMax(depthLevel+1, true, minLimit, maxLimit);
                if(debug)
                    console.log(this.consoleSpaces(depthLevel), '================Min, End==================', value, value_t, depthLevel);
                if(debug)
                    console.log('');

                maxLimit = Math.min(maxLimit, value_t);

                if(value_t < value){
                    value = value_t;
                    minLimit = Math.min(minLimit, value);
                    if(depthLevel == 1){
                        if(debug)
                            console.log(this.consoleSpaces(depthLevel), 'Min, best move is', JSON.stringify(move), 'the min value is:', value);
                        if(debug)
                            console.log('');
                        this.bestMove = move;
                    }
                }

                // revert the last change
                this.revertBoard(backups);

                if(minLimit >= maxLimit) {
                    break;
                }
            }

            return value;
        }
    }

    simulateMove(move){
        if(move.turn == GOAT) {
            if(move.actionType == PUT){
                // because array, starts from 0
                const goatIndex = this.board.goats.length;
                const newGoatMove = {
                    dead: false,
                    drag: false,
                    index: goatIndex,
                };
                
                this.board.points.forEach((point, index) => {
                    if(point.index == move.destinationPoint) {
                        point.item = GOAT;
                        point.itemIndex = goatIndex; 
                        newGoatMove.x = point.x;
                        newGoatMove.y = point.y;
                        newGoatMove.currentPoint = move.destinationPoint;
                    }
                    return point;
                }); 
                this.board.goats.push(newGoatMove);
            } else if(move.actionType == MOVE) {
                const goatIndex = this.board.goats.findIndex(goat => goat.currentPoint == move.sourcePoint);
                const goatMove = this.board.goats[goatIndex];

                // updating goat and points
                this.board.points.forEach((point) => {
                    if(point.index == move.sourcePoint) {
                        point.item = null;
                        point.itemIndex = null; 
                    }
                    if(point.index == move.destinationPoint) {
                        point.item = GOAT;
                        point.itemIndex = goatIndex; 
                        goatMove.x = point.x;
                        goatMove.y = point.y;
                        goatMove.currentPoint = move.destinationPoint;
                    }
                    return point;
                }); 

                this.board.goats[goatIndex] = goatMove;
            }
        } else {
            if(move.actionType == EAT){
                const tigerIndex = this.board.tigers.findIndex(tiger => tiger.currentPoint == move.sourcePoint);
                const goatIndex = this.board.goats.findIndex(goat => goat.currentPoint == move.eatGoatPoint);
                const newTigerMove = this.board.tigers[tigerIndex];
                const newGoatMove = this.board.goats[goatIndex];

                // updating tiger and points
                this.board.points.forEach((point) => {
                    // remove goat
                    if(point.index == move.eatGoatPoint) {
                        point.item = null;
                        point.itemIndex = null; 

                        newGoatMove.x = 0;
                        newGoatMove.y = 0;
                        newGoatMove.dead = true;
                        newGoatMove.currentPoint = -1;
                    }
                    // remove from board
                    if(point.index == move.sourcePoint) {
                        point.item = null;
                        point.itemIndex = null; 
                    }
                    // update tiger points
                    if(point.index == move.destinationPoint) {
                        point.item = TIGER;
                        point.itemIndex = tigerIndex; 
                        newTigerMove.x = point.x;
                        newTigerMove.y = point.y;
                        newTigerMove.currentPoint = move.destinationPoint;
                    }
                    return point;
                }); 

                this.board.tigers[tigerIndex] = newTigerMove;
                this.board.goats[goatIndex] = newGoatMove;

            } else if(move.actionType == MOVE) {
                const tigerIndex = this.board.tigers.findIndex(tiger => tiger.currentPoint == move.sourcePoint);
                const newTigerMove = this.board.tigers[tigerIndex];

                // updating tiger and points
                this.board.points.forEach((point) => {
                    if(point.index == move.sourcePoint) {
                        point.item = null;
                        point.itemIndex = null; 
                    }
                    if(point.index == move.destinationPoint) {
                        point.item = TIGER;
                        point.itemIndex = tigerIndex; 
                        newTigerMove.x = point.x;
                        newTigerMove.y = point.y;
                        newTigerMove.currentPoint = move.destinationPoint;
                    }
                    return point;
                }); 

                this.board.tigers[tigerIndex] = newTigerMove;
            }
        }
    }

    backupBoard() {
        // cloning goats, tigers, and points
        return {
            goats: JSON.parse(JSON.stringify(this.board.goats)),
            tigers: JSON.parse(JSON.stringify(this.board.tigers)),
            points: JSON.parse(JSON.stringify(this.board.points))
        };
    }

    revertBoard(backups) {
        this.board.goats = backups.goats;
        this.board.tigers = backups.tigers;
        this.board.points = backups.points;
        return true;
    }
    
    // getWinner() {
    //     return false;
    // }

}