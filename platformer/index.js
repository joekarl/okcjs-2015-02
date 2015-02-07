(function(){

  window.onload = function startGame() {
    var canvas = document.getElementById("gameCanvas");
    var gameState = {
      width: canvas.width,
      height: canvas.height,
      ctx2d: canvas.getContext("2d"),
      state: "gameplay",
      previousState: -1,
      input: new Input(),
    };

    window.requestAnimationFrame(updateAndRenderGame.bind(null, gameState));
  }

  var stateFunctions = {
    gameplay: G_Gameplay
  };

  function updateAndRenderGame(gameState, timestep) {

    if (gameState.previousState != gameState.state) {
      if (stateFunctions[gameState.previousState]) {
        stateFunctions[gameState.previousState].cleanup(gameState);
      }
      if (stateFunctions[gameState.state]) {
        stateFunctions[gameState.state].init(gameState, timestep);
      }
      gameState.previousState = gameState.state;
    }

    stateFunctions[gameState.state].updateRender(gameState, timestep);

    window.requestAnimationFrame(updateAndRenderGame.bind(null, gameState));
  }


  function Input() {
    this.pressed = {};
    window.addEventListener('keyup', function(event) { this.onKeyup(event); }.bind(this), false);
    window.addEventListener('keydown', function(event) { this.onKeydown(event); }.bind(this), false);
  }

  Input.prototype.isActive = function(code) {
    return this.pressed[code];
  }

  Input.prototype.onKeyup = function(e) {
    delete this.pressed[e.keyCode];
  };

  Input.prototype.clearKey = function(code) {
    delete this.pressed[code];
  }

  Input.prototype.onKeydown = function(e) {
    this.pressed[e.keyCode] = true;
  };

}());
