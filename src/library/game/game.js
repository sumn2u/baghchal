import { Board } from "../ui/board";
import { mount,el } from "../ui/dom";
import  Player  from './player';
import { TIGER, GOAT } from "../constants";

class Game{
    constructor(config){
        this.container = document.getElementById(config.container);
        this.boardWrapper = el(
            'div.game-board',
             (this.gameModal = el('div',
                 (el('button', {
                     'data-modal-trigger': "error-message",
                     'style': "display:none;"

                 })),
                 (el("section", {
                         class: 'modal-wrapper',
                         'data-modal': "error-message"
                     },
                     el('article.modal-body',
                         el('header', el(
                             'button.close'
                         )),
                         el('div.modal-main',
                             el('div#game-over',
                                 el('h2#game-end-heading'),
                                 el('h3#game-end-subheading', 'May they bathe their circuits   in baghchal glory '),
                                 el('button.game-btn#game-reset-btn', '↺ Play again')
                             ))
                     )))
             )),
            (this.gameWrapper = el(
                    'div.game-box',
            
            this.infoBox = el('div.info'),
            this.canvasWrapper = el('div',{style: 'position: relative;'},
                this.realCanvas = el(`canvas#real-canvas.real-canvas`),
                this.fakeCanvas = el('canvas#fake-canvas.fake-canvas')
            ),
            this.dataWrapper = el('div')
        )));
        this.container.style.position = 'relative';
        mount(this.container,  this.boardWrapper);
        this.container.style.position = 'relative';
        this.board = new Board(this.realCanvas, this.fakeCanvas, this.infoBox, this.dataWrapper);
        this.board.render();
    }
}
export default Game;

 