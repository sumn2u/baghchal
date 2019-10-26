  class Player {
      constructor(name, type) {
          this.name = name;
          this.type = type;
          this.currentTurn = true;
          this.playsArr = 0;
      }

      static get wins() {
          return [7, 56, 448, 73, 146, 292, 273, 84];
      }

      // Set the bit of the move played by the player
      // tileValue - Bitmask used to set the recently played move.
      updatePlaysArr(tileValue) {
          this.playsArr += tileValue;
      }

      getPlaysArr() {
          return this.playsArr;
      }

      // Set the currentTurn for player to turn and update UI to reflect the same.
      setCurrentTurn(turn) {
          this.currentTurn = turn;
          const message = turn ? 'Your turn' : 'Waiting for Opponent';
        //   $('#turn').text(message);
      }

      getPlayerName() {
          return this.name;
      }

      getPlayerType() {
          return this.type;
      }

      getCurrentTurn() {
          return this.currentTurn;
      }
  }

  export default Player;