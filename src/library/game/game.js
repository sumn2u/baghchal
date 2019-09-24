import { Board } from "../ui/board";
import { mount,el } from "../ui/dom";
import io from 'socket.io-client';
import  Player  from './player';
import { TIGER, GOAT } from "../constants";
const uuidv4 = require('uuid/v4');
const socket = io.connect('http://localhost:5000');
let player;

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
            this.dataWrapper = el('div')
        );
        mount(this.container,this.gameWrapper);
        this.socket = socket;
        this.container.style.position = 'relative';
        const roomId = window.game.roomId;
        this.player = player;
        if (roomId){
           const name = uuidv4();
           this.playerType = window.game.playerType.toLowerCase() === TIGER ? TIGER : GOAT;
            // socket join game
             this.socket.emit('joinGame', {
                 name: name,
                 roomId: roomId,
                 avatar: this.playerType
             });
            this.player = new Player(name, this.playerType);
            this.board = new Board(this.realCanvas, this.fakeCanvas, this.infoBox, this.dataWrapper, this.socket, window.game.roomId, uuidv4.DNS, this.player);
            
        }else{
            this.board = new Board(this.realCanvas, this.fakeCanvas, this.infoBox, this.dataWrapper, this.socket);
        }
        this.board.render();
    }
}
export default Game;

 