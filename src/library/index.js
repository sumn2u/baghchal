import Game from "./game/game";
import './scss/style.scss';
(function(window){
     window.game = {
      bagchal:null,
      init: function(config){
        const game = new Game(config)
        this.bagchal = game;
        return game;
      },
      start: function(){
        this.bagchal.startFBGame();
      }
     }
})(window);

  