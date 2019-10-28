import { Board } from "../ui/board";
import { mount,el } from "../ui/dom";
import  Player  from './player';
import { TIGER, GOAT } from "../constants";

class Game{
    constructor(config){
        this.FBInstant = config.FBInstant;
        this._matchData = [];
        this.backendClient = new backendClient('https://wiggly-licorice.glitch.me/');
        this.container = document.getElementById(config.container);
        
    }
    createBoard(){
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
                'div.game-box#game-box',

                this.infoBox = el('div.info'),
                this.canvasWrapper = el('div', {
                        style: 'position: relative;'
                    },
                    this.realCanvas = el(`canvas#real-canvas.real-canvas`),
                    this.fakeCanvas = el('canvas#fake-canvas.fake-canvas')
                ),
                this.dataWrapper = el('div')
            )));
        this.container.style.position = 'relative';
        mount(this.container, this.boardWrapper);
        this.container.style.position = 'relative';

        this.board = new Board(this.realCanvas, this.fakeCanvas, this.infoBox, this.dataWrapper, this.FBInstant, this._matchData);
        this.board.render();
    }
    startFBGame(){
        console.log(" i am here ")
         const backendCLient = new backendClient('https://wiggly-licorice.glitch.me/')
         var contextId = FBInstant.context.getID();
         FBInstant.player.getSignedPlayerInfoAsync(contextId)
             .then(function (signedPlayerInfo) {
                 return backendCLient.load(signedPlayerInfo.getSignature());
             })
             .then(function (result) {
                 if (result.empty) {
                     return this.createNewGameAsync();
                 } else {
                     return Promise.resolve(result.data);
                 }
             }.bind(this))
             .then(function (backendData) {
                 this.populateFromBackend(backendData);
             }.bind(this))
             .catch(function (error) {
                 this.displayError(error);
             }.bind(this));
     }
     populateFromBackend(matchData) {
         this._matchData = JSON.parse(matchData);
         var playerId = FBInstant.player.getID();
         if (this._matchData.players){
         if (this._matchData.players.length == 1 && this._matchData.players[0] !== playerId) {
             // This player just accepted a challenge.
             // We need to persist their ID as the second player
             this._matchData.players.push(playerId);
         }
         // check the status
         var playerIndex = this._matchData.players.indexOf(playerId);
         if (this._matchData.playerTurn !== playerIndex) {
             console.log("It's not this player's turn, let's display a message");
         }
         // find a way to do it from board
         console.log(this._matchData, 'this._matchData ==>')
         document.getElementById('play-with-interface').classList.add('hide');
         if(!this._matchData.avatar){
            document.getElementById('select-interface').classList.remove('hide');
         }else {
            document.getElementById('select-interface').classList.remove('hide');
         }
        }
     }
     createNewGameAsync(){
        var playerId = FBInstant.player.getID();
        this._matchData = {
            'moves': [],
            'playerTurn': 0,
            'avatar':null,
            'players': [
                playerId
            ],
        }
        return new Promise(function(resolve, reject){
            this.saveDataAsync()
            .then((savedData) => resolve(JSON.stringify(savedData)))
            .catch(reject);
        }.bind(this)); 
                //  const backendCLient = new backendClient('https://wiggly-licorice.glitch.me/')
     }
     getMatchedData(){
         return this._matchData;
     }
     saveDataAsync(){
        const backendClientL = new backendClient('https://wiggly-licorice.glitch.me/')
        var matchData = this._matchData;
        return new Promise(function(resolve, reject){
            console.log('going to save', JSON.stringify(matchData));
            FBInstant.player
            .getSignedPlayerInfoAsync(JSON.stringify(matchData))
            .then(function(result){
                return backendClientL.save(
                    FBInstant.context.getID(),
                    result.getPlayerID(),
                    result.getSignature()
                )
            })
            .then(function(){
                resolve(matchData);
            })
            .catch(function(error){
                reject(error);
            })
        });
     }
     checkFBBack(){
          const backendCLient = new backendClient('https://wiggly-licorice.glitch.me/')
          var contextId = FBInstant.context.getID();
          FBInstant.player.getSignedPlayerInfoAsync(contextId)
              .then(function (signedPlayerInfo) {
                  return backendCLient.load(signedPlayerInfo.getSignature());
              })
              .then(function (result) {
                  if (result.empty) {
                      return null;
                  } else {
                      return Promise.resolve(result.data);
                  }
              }.bind(this))
              .then(function (backendData) {
                  console.log(backendData, 'backendData ==>');
                  //this.populateFromBackend(backendData);
              }.bind(this))
              .catch(function (error) {
                  this.displayError(error);
              }.bind(this));
     }

}
export default Game;

 