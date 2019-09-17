import { Board } from "../ui/board";
import { mount,el } from "../ui/dom";

class Game{
    constructor(config){
        this.container = document.getElementById(config.container);
        this.gameWrapper = el(
            'div.pad-15',
            this.canvasWrapper = el('div.relative',
                this.infoBox = el('div.info'),
                this.realCanvas = el(`canvas#real-canvas.real-canvas`),
                this.fakeCanvas = el('canvas#fake-canvas.fake-canvas')
            ),
            this.dataWrapper = el('div')
        );
        mount(this.container,this.gameWrapper);
        this.container.style.position = 'relative';
        this.board = new Board(this.realCanvas,this.fakeCanvas,this.infoBox,this.dataWrapper);
        this.board.render();
    }
}
export default Game;