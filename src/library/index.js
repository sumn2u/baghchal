import Game from "./game/game";

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
      },
      FBCheck: function(){
        this.bagchal.checkFBBack();
      }
     }
})(window);

  