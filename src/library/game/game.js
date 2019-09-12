import { Board } from "../ui/board";
import { mount,el } from "../ui/dom";

class Game{
    constructor(config){
        this.container = document.getElementById(config.container);
        this.gameWrapper = el(
            'div.row',
            this.canvasWrapper = el('div.col-sm-8',
                this.realCanvas = el(`canvas#real-canvas.real-canvas`),
                this.fakeCanvas = el('canvas#fake-canvas.fake-canvas')
            ),
            this.dataWrapper = el('div.col-sm-4')
        );
            mount(this.container,this.gameWrapper);
        this.container.style.position = 'relative';
        this.board = new Board(this.realCanvas,this.fakeCanvas,this.dataWrapper);
        this.board.render();
    }
}
export default Game;