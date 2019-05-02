import Game from "./game/game";
(function(window){
    const _init = (config)=>{
       return new Game(config);
     }
     window.game = {
       init:_init
     }
   })(window);