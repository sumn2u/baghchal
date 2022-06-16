import { Board } from "../ui/board";
import { mount, el } from "../ui/dom";
import { Backend } from "../ui/backend";
import Player from "./player";
import { TIGER, GOAT, FB_IMAGE } from "../constants";

class Game {
  constructor(config) {
    this.FBInstant = config.FBInstant;
    this._matchData = [];
    this.backend = new Backend("https://bagchalserver.vercel.app/");
    this.board = null;
    this.socket = null;
    this.container = document.getElementById(config.container);

    this.createBoard = () => {
      this.boardWrapper = el(
        "div.game-board",

        (this.gameWrapper = el(
          "div.game-box#game-box",

          (this.infoBox = el("div.info")),
          (this.canvasWrapper = el(
            "div",
            {
              style: "position: relative;",
            },
            (this.realCanvas = el(`canvas#real-canvas.real-canvas`)),
            (this.fakeCanvas = el("canvas#fake-canvas.fake-canvas"))
          )),
          el(
            "div.move-wrapper",
            (this.moveCount = el("span.move-count")),
            (this.moveIndicator = el("div.move-indicator"))
          ),
          (this.gameModal = el(
            "div",
            el("button", {
              "data-modal-trigger": "error-message",
              style: "display:none;",
            }),
            el(
              "section",
              {
                class: "modal-wrapper",
                "data-modal": "error-message",
              },
              el(
                "article.modal-body",
                el(
                  "div.modal-main",
                  el(
                    "div#game-over",
                    el("h2#game-end-heading"),
                    el(
                      "h3#game-end-subheading",
                      "May they bathe their circuits   in baghchal glory. "
                    ),
                    el("button.game-btn#game-reset-btn", "")
                  )
                )
              )
            )
          )),
          (this.dataWrapper = el("div"))
        ))
      );
      this.container.style.position = "relative";
      mount(this.container, this.boardWrapper);
      this.container.style.position = "relative";

      this.board = new Board(
        this.realCanvas,
        this.fakeCanvas,
        this.infoBox,
        this.dataWrapper,
        this.moveIndicator,
        this.moveCount,
        this.FBInstant,
        this._matchData
      );
      this.board.render();
    };
    this.startFBGame = () => {
      let _this = this;
      let contextId = _this.FBInstant.context.getID();

      // emit socket
      _this.socket = _this.board.emitSocket();
      _this.FBInstant.player
        .getSignedPlayerInfoAsync(contextId)
        .then(function (signedPlayerInfo) {
          return _this.backend.load(signedPlayerInfo.getSignature());
        })
        .then(
          function (result) {
            if (result.empty) {
              //  _this.backend.clear(contextId).then(function () {
              return _this.createNewGameAsync();
              //  });
            } else {
              return Promise.resolve(result);
            }
          }.bind(this)
        )
        .then(
          function (backendData) {
            _this.populateFromBackend(backendData);
          }.bind(this)
        )
        .catch(
          function (error) {
            console.log(error, "error");
          }.bind(this)
        );
    };
    this.populateFromBackend = (matchData) => {
      let _this = this;
      // _this.board.showPlayerJoinGame();
      this._matchData = JSON.parse(matchData.data || "{}");
      let playerId = _this.FBInstant.player.getID();

      // if there is already players
      if (this._matchData.players) {
        if (
          this._matchData.players.length == 1 &&
          this._matchData.players[0] !== playerId
        ) {
          // This player just accepted a challenge.
          // We need to persist their ID as the second player
          this._matchData.players.push(playerId);
        }
        // check the status
        let playerIndex = this._matchData.players.indexOf(playerId);
        if (this._matchData.playerTurn !== playerIndex) {
          console.log("It's not this player's turn, let's display a message");
          _this.socket.sendRequestToFriend(matchData.socketId);
          _this.board.showPlayerJoinGame();
        }

        // find a way to do it from board
        document.getElementById("play-with-interface").classList.add("hide");
        document.getElementById("select-interface").classList.remove("hide");
      } else {
        //  _this.backend.clear(_this.FBInstant.context.getID()).then(function () {
        //    return _this.createNewGameAsync();
        // //    return Promise.resolve(result);
        //  });
        //_this.socket.sendRequestToFriend(matchData.socketId);
        // document.getElementById("play-with-interface").classList.add("hide");
        // document.getElementById("select-interface").classList.remove("hide");
      }
    };
    //create game async
    this.createNewGameAsync = () => {
      let playerId = this.FBInstant.player.getID();
      let _this = this;
      _this.sendInvitationToFriend();
      this._matchData = {
        moves: [],
        playerTurn: 0,
        avatar: null,
        players: [playerId],
      };
      return new Promise(
        function (resolve, reject) {
          this.saveDataAsync()
            .then((savedData) => resolve(JSON.stringify(savedData)))
            .catch(reject);
        }.bind(this)
      );
    };
    this.sendInvitationToFriend = () => {
      const playerName = this.FBInstant.player.getName();
      FBInstant.updateAsync({
        action: "CUSTOM",
        cta: "Start Game!",
        image: FB_IMAGE,
        text: {
          default: playerName + " wants to play with you!",
          localizations: {
            pt_BR: playerName + " venceu!",
            en_US: playerName + " wants to play with you !",
            de_DE: playerName + " hat gewonnen",
          },
        },
        template: "start_game",
        data: {
          playButton: true,
        },
        strategy: "IMMEDIATE",
        notification: "NO_PUSH",
      });
    };
    this.getMatchedData = () => {
      return this._matchData;
    };
    this.saveDataAsync = () => {
      let _this = this;
      let matchData = _this._matchData;
      return new Promise(function (resolve, reject) {
        // needs timeout cause socket is not initialized yet
        setTimeout(function () {
          const socketId = _this.socket.player.socketId;
          const friendSocketId = _this.socket.friend
            ? _this.socket.friend.socketId
            : "";
          FBInstant.player
            .getSignedPlayerInfoAsync(JSON.stringify(matchData))
            .then(function (result) {
              return _this.backend.save(
                FBInstant.context.getID(),
                result.getPlayerID(),
                result.getSignature(),
                socketId,
                friendSocketId
              );
            })
            .then(function () {
              resolve(matchData);
            })
            .catch(function (error) {
              reject(error);
            });
        }, 500);
      });
    };
    this.checkFBBack = () => {
      let _this = this;
      let contextId = _this.FBInstant.context.getID();
      FBInstant.player
        .getSignedPlayerInfoAsync(contextId)
        .then(function (signedPlayerInfo) {
          return backend.load(signedPlayerInfo.getSignature());
        })
        .then(
          function (result) {
            if (result.empty) {
              return null;
            } else {
              return Promise.resolve(result.data);
            }
          }.bind(this)
        )
        .then(
          function (backendData) {
            if (backendData) {
              // example {"moves":{"type":"new","nextPoint":null,"goatPoint":{"x":167,"y":33.4,"dead":false,"drag":false,"currentPoint":2,"index":0}},"playerTurn":1,"avatar":"goat","players":["2402026286512125"]}
              // start game for next player using that config
            }
            //this.populateFromBackend(backendData);
          }.bind(this)
        )
        .catch(
          function (error) {
            this.displayError(error);
          }.bind(this)
        );
    };
  }
}
export default Game;
