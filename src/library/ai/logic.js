import { TIGER, GOAT } from '../constants';

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
        this.nextPointIndex = 0;
    }

    goatsRemaining(goats){
        const totalUsedGoats = goats.reduce((count, goat) => {
            return count + (goat.pulled ? 1: 0); 
        }, 0);
        return goats.length - totalUsedGoats;
    }

    goatsDead(goats){
        return goats.reduce((count, goat) => {
            return count + (goat.dead ? 1: 0); 
        }, 0);
    }

    getNextBestMove(turn, availableTigers, goats) {
        this.turn = turn;

        let goatsRemaining = 0;
        if(turn == GOAT){
            // check only if it's goat's turn
            goatsRemaining = this.goatsRemaining(goats);
        }

        let totalMovableTigers = 0;
        const moves = [];
        availableTigers.forEach((object) => {
            if(object.possibleMoves.length){
                totalMovableTigers+=1;
                object.possibleMoves.forEach((destination) => {

                    // default action type(because both goat and tiger can move)
                    let actionType = "move";
                    if(turn ==TIGER && destination.eatGoat){
                        actionType = "eat";
                    } else if(goatsRemaining > 0){
                        actionType = "put";
                    }

                    moves.push({
                        turn,
                        sourcePoint: object.point,
                        destinationPoint: destination.point,
                        actionType
                    });
                });
            }
        });
        this.movableTigers = totalMovableTigers;
        this.deadGoats = this.goatsDead(goats);
        this.moveLists = moves;

        console.clear();

        console.log('====================================');
        console.log(moves);
        console.log('====================================');

        // this.computeMinMax(true, this.AILevel);
        if(turn == TIGER){
            this.computeMinMax(this.depthLevel, true);
        } else if(turn == GOAT) {
            this.computeMinMax(this.depthLevel, false);
        }
        return this.bestMove;
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
        const score = this.calculateScore(depthLevel);
        console.log(`${this.consoleSpaces(depthLevel)}->score->depthLevel->`, score, depthLevel);

        // return the score from leaf node
        if((depthLevel > this.AILevel) || (Math.abs(score) == largeLimit)) {
            console.log(`${this.consoleSpaces(depthLevel)} this.AILevel`, this.AILevel, 'score', score);
            return score;
        }

        let moveLists = {}; 

        // level 1 move list has already been created by
        if(depthLevel == 1)
            moveLists = this.moveLists;
        else {
            const nextMOves = this.board.getNextPossibleMove(this.nextPointIndex, GOAT);
            console.log(this.consoleSpaces(depthLevel), nextMOves);   
            // write function to get next move lists
            moveLists = {};
        }


        let value = largeLimit;
        if(isMax){
            value = -value;
            moveLists.forEach((move) => {
                this.nextPointIndex = move.destinationPoint;

                // first make the move
                // this.simulateMove(move);

                // go deeper in the search tree recursively
                console.log(`${this.consoleSpaces(depthLevel)}================True, single possible move==================`, move.sourcePoint, move.destinationPoint);
                const value_t = this.computeMinMax(depthLevel+1, false, minLimit, maxLimit);
                console.log(`${this.consoleSpaces(depthLevel)}value, value_t`, value, value_t);

                if(value_t > value){
                    value = value_t;
                    minLimit = Math.max(minLimit, value);
                    if(depthLevel == 0){
                        this.bestMove = move;
                    }
                }


                // // then revert the move
                // self.board.revert_move(move)

                // if minLimit >= maxLimit:
                //     break

                return value;
            });


        } else {
            console.log(`${this.consoleSpaces(depthLevel)}went to else`); 
            
            // moveLists.forEach((move) => {
            //     this.nextPointIndex = move.destinationPoint;
            //     // first make the move
            //     // this.simulateMove(move);

            //     // go deeper in the search tree recursively
            //     console.log(`${this.consoleSpaces(depthLevel)}================True, single possible move==================`, move.sourcePoint, move.destinationPoint);
            //     const value_t = this.computeMinMax(depthLevel+1, false, minLimit, maxLimit);
            //     console.log(`${this.consoleSpaces(depthLevel)}value, value_t`, value, value_t);

            //     maxLimit = Math.min(maxLimit, value_t);

            //     if(value_t < value){
            //         value = value_t;
            //         minLimit = Math.min(minLimit, value);
            //         if(depthLevel == 0){
            //             this.bestMove = move;
            //         }
            //     }

            //     // // then revert the move
            //     // self.board.revert_move(move)

            //     if(minLimit >= maxLimit){
            //         return false;
            //     }

            //     return value;
            // });
        }
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