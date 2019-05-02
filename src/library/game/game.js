import { Board } from "../ui/board";

class Game{
    constructor(config){
        let canvasId = 'baghchal';
        this.container = document.getElementById(config.container);
        this.container.innerHTML = `<canvas id="${canvasId}"></canvas>`;
        this.board = new Board(canvasId);
        this.board.render();
    }
}
export default Game;