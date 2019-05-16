import { Board } from "../ui/board";

class Game{
    constructor(config){
        let canvasId = 'baghchal';
        let fakeCanvasId = 'fake-canvas';
        this.container = document.getElementById(config.container);
        this.container.innerHTML = `<canvas class="real-canvas" id="${canvasId}"></canvas>
        <canvas class="fake-canvas" id="${fakeCanvasId}"></canvas>`;
        this.container.style.position = 'relative';
        this.board = new Board(canvasId,fakeCanvasId);
        this.board.render();
    }
}
export default Game;