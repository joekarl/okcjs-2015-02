var G_MainMenu = (function(){
  var keyBindings = {
    UP:     38,
    DOWN:   40,
    ENTER:  13
  };

  function initMenu(gameState) {
    gameState.menu = {
      menuIndex: 0,
      menuItems: [
      "Play",
      "Scores"
      ],
      changeLatency: 0
    };
  }

  function updateRenderMenu(gameState) {
    var ctx = gameState.ctx2d;
    var menu = gameState.menu;
    var input = gameState.input;
    var i;

    if (input.isActive(keyBindings.ENTER)) {
      if (menu.menuIndex == 0) {
        gameState.state = "gameplay";
        input.clearKey(keyBindings.ENTER);
        return;
      }
      if (menu.menuIndex == 1) {
        gameState.state = "scores";
        input.clearKey(keyBindings.ENTER);
        return;
      }
    }

    menu.changeLatency--;

    if (input.isActive(keyBindings.UP) &&
      input.isActive(keyBindings.DOWN)) {
        // noop
    } else if (menu.changeLatency <= 0 && input.isActive(keyBindings.UP)) {
      menu.menuIndex--;
      menu.changeLatency = 10;
    } else if (menu.changeLatency <= 0 && input.isActive(keyBindings.DOWN)) {
      menu.menuIndex++;
      menu.changeLatency = 10;
    }

    if (menu.changeLatency < 0) {
      menu.changeLatency = 0;
    }

    if (menu.menuIndex < 0) {
      menu.menuIndex = menu.menuItems.length - 1;
    } else if (menu.menuIndex > menu.menuItems.length - 1) {
      menu.menuIndex = 0;
    }

    ctx.save();
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, gameState.width, gameState.height);
    ctx.restore();

    // draw title
    ctx.save();
    ctx.fillStyle = "#CCC";
    ctx.font = "48px monospace";
    ctx.fillText("(not) Asteroids!", gameState.width / 2 - 220, 100);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "#CCC";
    ctx.font = "14px monospace";
    ctx.fillText("Arrow keys to move, space to fire, escape to pause", gameState.width / 2 - 200, gameState.height - 30);
    ctx.restore();


    // draw menu items
    for (i = 0; i < menu.menuItems.length; ++i) {
      ctx.save();
      if (i == menu.menuIndex) {
        ctx.fillStyle = "#FF0";
      } else {
        ctx.fillStyle = "#CCC";
      }
      ctx.font = "36px monospace";
      ctx.fillText(menu.menuItems[i], gameState.width / 2 - 200, 250 + i * 60);
      ctx.restore();
    }

  }

  function cleanupMenu(gameState) {
    delete gameState.menu;
  }

  return {
    init: initMenu,
    updateRender: updateRenderMenu,
    cleanup: cleanupMenu
  }
})();
