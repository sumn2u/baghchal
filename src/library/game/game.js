import { Board } from "../ui/board";
import { mount,el } from "../ui/dom";

class Game{
    constructor(config){
        this.container = document.getElementById(config.container);
        this.boardWrapper = el(
            'div.game-board',
            this.closeGame = el("div.close-options", el("div", {
                class: "close-cross"
            }, '')),
            (this.gameWrapper = el(
                    'div.game-box',
            
            this.infoBox = el('div.info'),
            this.canvasWrapper = el('div',{style: 'position: relative;'},
                this.realCanvas = el(`canvas#real-canvas.real-canvas`),
                this.fakeCanvas = el('canvas#fake-canvas.fake-canvas')
            ),
            this.dataWrapper = el('div'),
            
        )));
        mount(this.container, this.boardWrapper);
       this.container.style.position = 'relative';
        this.board = new Board(this.realCanvas,this.fakeCanvas,this.infoBox,this.dataWrapper, this.closeGame);
        this.board.render();
    }
}
export default Game;

 