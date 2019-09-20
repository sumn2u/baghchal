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
        this.closedSpacesCount = 0;
        this.moveLists = {};

        // what will be the next point index
        this.nextMove = {
            turn: TIGER,
            sourcePoint: null,
            destinationPoint: null,
            actionType: MOVE 
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
            this.board.goats.forEach(goat => console.log(goat.currentPoint));
            console.log(`${text}======================================`);
            // this.board.tigers.forEach(tiger => console.log(tiger));
            // console.log(`${text}======================================`);
            // this.board.points.forEach(point => console.log(point));
            // console.log(`${text}======================================`);
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
        return this.bestMove;
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
                    if(turn ==TIGER && destination.eatGoat){
                        actionType = EAT;
                    } else if(goatsRemaining > 0){
                        actionType = PUT;
                    }

                    moves.push({
                        turn,
                        sourcePoint: Number(object.point),
                        destinationPoint: Number(destination.point),
                        actionType
                    });
                });
            }
        });
        this.movableTigers = totalMovableTigers;
        this.deadGoats = this.goatsDead(goats);
        return moves;
    }

    calculateScore(depthLevel) {
        const winner = this.getWinner();
        if(!winner) 
            return (1000 * this.movableTigers) + (1000 * this.deadGoats) - (1000 * this.closedSpacesCount) - (depthLevel * 10);

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
        const score = this.calculateScore(depthLevel);
        console.log(`${this.consoleSpaces(depthLevel)}->score->depthLevel->`, score, depthLevel);

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
                if(goatsRemaining) {
                    nextMoves = this.board.points.filter(point => !point.item);
                }
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

            nextMoves.forEach(nextMove => {
                let sourcePoint = this.nextMove.sourcePoint;
                // default action type(because both goat and tiger can move)
                let actionType = MOVE;
                // TODO: FIX EAT GOAT
                let eatGoat = false;
                if(this.turn ==TIGER && eatGoat){
                    actionType = EAT;
                } else if(goatsRemaining > 0){
                    actionType = PUT;
                    // when putting, there is no source point
                    sourcePoint = null;
                }
    
                moveLists.push({
                    turn: this.turn,
                    sourcePoint,
                    destinationPoint: nextMove.index,
                    actionType
                });
            });
        }


        let value = 100000000;
        if(isMax){
            console.log(`${this.consoleSpaces(depthLevel)} if condition`, moveLists); 
            value = -value;
            moveLists.forEach((move) => { 
                if(minLimit >= maxLimit) {
                    return false;
                }

                // backup the board before change
                const backups = this.backupBoard();

                this.nextMove = move;

                // go deeper in the search tree recursively
                console.log(`${this.consoleSpaces(depthLevel)}================Max, Start==================`, move, move.sourcePoint, move.destinationPoint);
                const value_t = this.computeMinMax(depthLevel+1, false, minLimit, maxLimit);
                console.log(`${this.consoleSpaces(depthLevel)} ================Max, End================== value, value_t`, value, value_t, depthLevel);

                if(value_t > value){
                    value = value_t;
                    minLimit = Math.max(minLimit, value);
                    if(depthLevel == 0){
                        this.bestMove = move;
                    }
                }

                // revert the last change
                this.revertBoard(backups);
            });

            return value;

        } else {
            console.log(`${this.consoleSpaces(depthLevel)}went to else`, moveLists); 
            
            moveLists.forEach((move) => {
                if(minLimit >= maxLimit){
                    return false;
                }

                // backup the board before change
                const backups = this.backupBoard();

                this.nextMove = move;

                // go deeper in the search tree recursively
                console.log(`${this.consoleSpaces(depthLevel)}================Min, Start==================`, move, move.sourcePoint, move.destinationPoint);
                const value_t = this.computeMinMax(depthLevel+1, true, minLimit, maxLimit);
                console.log(`${this.consoleSpaces(depthLevel)} ================Min, End================== value, value_t`, value, value_t, depthLevel);

                maxLimit = Math.min(maxLimit, value_t);

                if(value_t < value){
                    value = value_t;
                    minLimit = Math.min(minLimit, value);
                    if(depthLevel == 0){
                        this.bestMove = move;
                    }
                }

                // revert the last change
                this.revertBoard(backups);
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

            }
        } else {
            if(move.actionType == EAT){

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
    movableTigers() {
        return 4;
    }
    deadGoats() {
        return 4;
    }
    closedSpacesCount() {
        return 4;
    }


}