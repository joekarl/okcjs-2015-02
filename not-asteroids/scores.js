var G_Scores = (function(){
  var maxScores = 10;
  var scoreKey = "not-asteroids.scores";
  var keyBindings = {
    ESCAPE: 27,
    DELETE: 46,
  };

  function init(gameState) {
    gameState.scores = {
      scoreList: getHighScores(),
      dummyScore: {
        name: "AAA",
        score: 0
      }
    };
  }

  function updateRender(gameState){
    var ctx = gameState.ctx2d;
    var input = gameState.input;
    var i, score;
    var scoreList = gameState.scores.scoreList;
    var dummyScore = gameState.scores.dummyScore;

    if (input.isActive(keyBindings.ESCAPE)) {
      gameState.state = "menu";
      input.clearKey(keyBindings.ESCAPE);
      return;
    }

    if (input.isActive(keyBindings.DELETE)) {
      localStorage.removeItem(scoreKey);
      gameState.scores.scoreList = getHighScores();
      scoreList = gameState.scores.scoreList;
      return;
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
    ctx.fillText("High Scores", gameState.width / 2 - 160, 100);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "#FFFF00";
    ctx.font = "32px monospace";
    for (i = 0; i < maxScores; ++i) {
      score = scoreList[i] ? scoreList[i] : dummyScore;
      ctx.fillText(score.name + "   " + padDigits(score.score, 5), gameState.width / 2 - 100, 150 + i * 40);
    }
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "#CCC";
    ctx.font = "14px monospace";
    ctx.fillText("Escape to return to main menu", gameState.width / 2 - 120, gameState.height - 30);
    ctx.restore();
  }

  function cleanup(gameState) {
    delete gameState.scores;
  }

  function Score(name, score) {
    this.name = name;
    this.score = score;
  }

  function addHighScore(name, score) {
    var scores = getHighScores();
    var score = new Score(name, score);
    var i;
    if (scores.length < maxScores) {
      scores.push(score);
    } else {
      for (i = maxScores - 1; i >= 0; --i) {
        if (scores[i] > score) {
          // find the first higher score, add score after it
          scores.splice(i, 0, score);
          scores = scores.slice(0, 5);
          break;
        }
      }
    }
    localStorage.setItem(scoreKey, JSON.stringify(scores));
  }

  function getHighScores() {
    var scoresStr = localStorage.getItem(scoreKey);
    var scores;
    if (scoresStr) {
      return JSON.parse(scoresStr);
    } else {
      return [];
    }
  }

  function checkHighScore(score) {
    // load scores
    var scores = getHighScores();
    if (scores.length < maxScores) {
      return true;
    } else if (scores[maxScores].score < score) {
      return true;
    } else {
      return false;
    }
  }

  function padDigits(number, digits) {
    return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
  }

  return {
    checkHighScore: checkHighScore,
    addHighScore: addHighScore,
    init: init,
    updateRender: updateRender,
    cleanup: cleanup,
  };
})();
