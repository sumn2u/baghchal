import Game from "./game/game";
(function(window){
     window.game = {
       init: (config)=>{return new Game(config)}
     }
})(window);

  