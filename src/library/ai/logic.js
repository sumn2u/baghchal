import { TIGER, GOAT, EAT, PUT, MOVE, TOTAL_GOAT } from '../constants';

const largeLimit = 1000000;
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
        this.tigerClosedSpaceCount = 0;
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
            console.log(`${text}======================================`);
            this.board.goats.forEach(goat => console.log(goat));
            console.log(`${text}======================================`);
            this.board.tigers.forEach(tiger => console.log(tiger));
            console.log(`${text}======================================`);
            this.board.points.forEach(point => console.log(point));
            console.log(`${text}======================================`);
        }
    }

    getNextBestMove(turn, availableTigers) {
        this.turn = turn;
        this.moveLists = this.getMoveListsFromAvailableTigers(availableTigers);

        // this.computeMinMax(true, this.AILevel);
        if(turn == TIGER){
            this.computeMinMax(this.depthLevel, true);
        } else if(turn == GOAT) {
            this.computeMinMax(this.depthLevel, false);
        }

        const tigerIndex = availableTigers.findIndex(tiger => tiger.point == this.bestMove.sourcePoint);

        const bestAvailableMove = availableTigers[tigerIndex];

        const bestPossibleMove = bestAvailableMove.possibleMoves.find(bestMove =>  bestMove.point == this.bestMove.destinationPoint);

        bestAvailableMove.possibleMoves = [bestPossibleMove];

        return [bestAvailableMove];
    }

    getMoveListsFromAvailableTigers(availableTigers) {
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
        this.tigerClosedSpaceCount = moves.length;
        console.log('                         tiger closed space count', this.tigerClosedSpaceCount);
        this.deadGoats = this.goatsDead(goats);
        return moves;
    }

    convertToNumber(value) {
        if(typeof value === 'object' && !value) 
            return null;

        return Number(value);
    }

    costEvaluation(depthLevel) {
        console.log(this.consoleSpaces(depthLevel), 'tigerClosedSpaceCount----------', this.tigerClosedSpaceCount, depthLevel);
        const winner = this.getWinner();
        let score = 0;
        if(!winner) {
            score = (300 * this.movableTigers) + (700 * this.deadGoats) - (700 * this.tigerClosedSpaceCount) - (100 * depthLevel);
            if(typeof this.nextMove.eatGoatPoint !== "object"){ // NOT NULL
                score += 5000;
            }
            return score;
        }

        if(winner == GOAT)
            return -largeLimit;

        else if(winner == TIGER)
            return largeLimit;
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

        console.log(this.consoleSpaces(depthLevel), 'score', score, 'depth', depthLevel);

        // return the score from leaf node
        if((depthLevel > this.AILevel) || (Math.abs(score) == largeLimit)) {
            console.log(`${this.consoleSpaces(depthLevel)} this.AILevel`, this.AILevel, 'score', score);
            return score;
        }

        let moveLists = []; 
        // level 1 move list has already been created by
        if(depthLevel == 1)
            moveLists = this.moveLists;
        else {
            this.simulateMove(this.nextMove);
            let nextMoves = [];
            let goatsRemaining = 0;
            if(this.turn == GOAT){
                goatsRemaining = this.goatsRemaining(this.board.goats);
                let actionType = MOVE;
                if(goatsRemaining) {
                    nextMoves = this.board.points.filter(point => !point.item);
                    actionType = PUT;
                } else {
                    // TODO, GOAT MOVE LIST
                    nextMoves = [];
                }

                nextMoves.forEach(nextMove => {
                    let sourcePoint = (actionType == PUT)? null : this.nextMove.sourcePoint;
                    moveLists.push({
                        turn: this.turn,
                        sourcePoint,
                        destinationPoint: nextMove.index,
                        actionType,
                        eatGoatPoint: false
                    });
                });
            } else {
                // get from board
                const availableTigers = [];
                this.board.tigers.forEach(point => {
                    availableTigers.push({
                        point: point.currentPoint,
                        possibleMoves: this.board.getNextPossibleMove(point.currentPoint)
                    });
                });

                moveLists = this.getMoveListsFromAvailableTigers(availableTigers);
            }
        }

        let value = 100000000;
        if(isMax){
            console.log(`${this.consoleSpaces(depthLevel)} if condition`, moveLists, minLimit, maxLimit, minLimit >= maxLimit); 
            // if(minLimit >= maxLimit) {
            //     return false;
            // }

            value = -value;
            moveLists.forEach((move) => { 
                // backup the board before change
                const backups = this.backupBoard();

                this.nextMove = move;

                // go deeper in the search tree recursively
                console.log(this.consoleSpaces(depthLevel), '================Max, Start==================', `${move.sourcePoint}-${move.destinationPoint}-${move.actionType}`);
                const value_t = this.computeMinMax(depthLevel+1, false, minLimit, maxLimit);
                console.log(this.consoleSpaces(depthLevel), '================Max, End==================', value, value_t, depthLevel);
                console.log('');

                if(value_t > value){
                    value = value_t;
                    minLimit = Math.max(minLimit, value);
                    if(depthLevel == 1){
                        console.log(this.consoleSpaces(depthLevel), `Max, best move is ${move.sourcePoint}-${move.destinationPoint}`, 'the max value is:', value)
                        console.log('');
                        this.bestMove = move;
                    }
                }

                // revert the last change
                this.revertBoard(backups);

                if(minLimit >= maxLimit) {
                    return false;
                }
            });

            return value;

        } else {
            console.log(`${this.consoleSpaces(depthLevel)}went to else`, moveLists, minLimit, maxLimit, minLimit >= maxLimit); 
            // if(minLimit >= maxLimit){
            //     return false;
            // }
            
            moveLists.forEach((move) => {
                // backup the board before change
                const backups = this.backupBoard();

                this.nextMove = move;

                // go deeper in the search tree recursively
                console.log(this.consoleSpaces(depthLevel), '================Min, Start==================', `${move.sourcePoint}-${move.destinationPoint}-${move.actionType}`);
                const value_t = this.computeMinMax(depthLevel+1, true, minLimit, maxLimit);
                console.log(this.consoleSpaces(depthLevel), '================Min, End==================', value, value_t, depthLevel);
                console.log('');

                maxLimit = Math.min(maxLimit, value_t);

                if(value_t < value){
                    value = value_t;
                    minLimit = Math.min(minLimit, value);
                    if(depthLevel == 1){
                        console.log(this.consoleSpaces(depthLevel), `Min, best move is ${move.sourcePoint}-${move.destinationPoint}`, 'the max value is:', value)
                        console.log('');
                        this.bestMove = move;
                    }
                }

                // revert the last change
                this.revertBoard(backups);

                if(minLimit >= maxLimit) {
                    return false;
                }
            });

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
                // TODO: GOAT MOVE
                console.log('--------------goat move--------------------')
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
    
    getWinner() {
        return false;
    }

}