var G_ScoreEntry = (function(){
  var keyBindings = {
    BACKSPACE:  8,
    ENTER:      13,
    UP:         38,
    DOWN:       40,
    LEFT:       37,
    RIGHT:      39,
  };
  var maxKeyLatency = 10;

  var letters = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z'
  ]

  function init(gameState) {
    gameState.scoreEntry = {
      score: gameState.transition ? gameState.transition : 0,
      chars: [0, 0, 0],
      charIndex: 0,
      keyLatency: 0,
    };
  }

  function updateRender(gameState){
    var ctx = gameState.ctx2d;
    var input = gameState.input;
    var scoreEntry = gameState.scoreEntry;

    if (input.isActive(keyBindings.ENTER)) {
      gameState.state = "scores";
      input.clearKey(keyBindings.ENTER);
      G_Scores.addHighScore(strFromChars(scoreEntry.chars), scoreEntry.score);
      return;
    }

    if (input.isActive(keyBindings.UP) && scoreEntry.keyLatency <= 0) {
      scoreEntry.keyLatency = maxKeyLatency;
      scoreEntry.chars[scoreEntry.charIndex] += 1;
      if (scoreEntry.chars[scoreEntry.charIndex] >= 26) {
        scoreEntry.chars[scoreEntry.charIndex] = 0;
      }
    }

    if (input.isActive(keyBindings.DOWN) && scoreEntry.keyLatency <= 0) {
      scoreEntry.keyLatency = maxKeyLatency;
      scoreEntry.chars[scoreEntry.charIndex] -= 1;
      if (scoreEntry.chars[scoreEntry.charIndex] < 0) {
        scoreEntry.chars[scoreEntry.charIndex] = 25;
      }
    }

    if (input.isActive(keyBindings.RIGHT) && scoreEntry.keyLatency <= 0) {
      scoreEntry.keyLatency = maxKeyLatency;
      scoreEntry.charIndex++;
      if (scoreEntry.charIndex >= 3) {
        scoreEntry.charIndex = 0;
      }
    }

    if (input.isActive(keyBindings.LEFT) && scoreEntry.keyLatency <= 0) {
      scoreEntry.keyLatency = maxKeyLatency;
      scoreEntry.charIndex--;
      if (scoreEntry.charIndex < 0) {
        scoreEntry.charIndex = 2;
      }
    }

    if (scoreEntry.keyLatency > 0) {
      scoreEntry.keyLatency--;
    }

    // clear background
    ctx.save();
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, gameState.width, gameState.height);
    ctx.restore();

    // title
    ctx.save();
    ctx.fillStyle = "#CCC";
    ctx.font = "48px monospace";
    ctx.fillText("New High Score", gameState.width / 2 - 190, 100);
    ctx.restore();

    // char entry
    ctx.save();
    ctx.fillStyle = "#FF0";
    ctx.font = "48px monospace";
    ctx.fillText(letters[scoreEntry.chars[0]], 250, 175);
    ctx.fillText(letters[scoreEntry.chars[1]], 300, 175);
    ctx.fillText(letters[scoreEntry.chars[2]], 350, 175);
    ctx.fillText(padDigits(scoreEntry.score, 5), 420, 175);
    ctx.restore;

    ctx.save();
    ctx.fillStyle = "#FF0";
    ctx.fillRect(250 + scoreEntry.charIndex * 50, 180, 30, 5);
    ctx.restore;

    ctx.save();
    ctx.fillStyle = "#CCC";
    ctx.font = "14px monospace";
    ctx.fillText("Enter to return to main menu, up/down set letter, left/right change letter", gameState.width / 2 - 310, gameState.height - 30);
    ctx.restore();
  }

  function cleanup(gameState) {
    delete gameState.scores;
  }

  function strFromChars(chars) {
    return "" + letters[chars[0]] + letters[chars[1]] + letters[chars[2]];
  }

  function padDigits(number, digits) {
    return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
  }

  return {
    init: init,
    updateRender: updateRender,
    cleanup: cleanup,
  };
})();
