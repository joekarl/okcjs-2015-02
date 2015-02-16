var G_Gameplay = (function(){
  var keyBindings = {
    UP:     38,
    DOWN:   40,
    LEFT:   37,
    RIGHT:  39,
    SPACE:  32,
    ENTER:  13,
    ESCAPE: 27,
    Q:      81,
  };

  var TILE_DIMENSION = 32;
  var HALF_TILE_DIMENSION = TILE_DIMENSION / 2;
  var CAMERA_PADDING = 200;

  function clamp(val, min, max) {
    if (val < min) {
      return min;
    } else if (val > max) {
      return max;
    } else {
      return val;
    }
  }

  function initGameplay(gameState, timestep) {
    gameState.gameplay = {
      camera: {
        x: 3 * TILE_DIMENSION,
        y: 0,
        offsetX: gameState.width / 2,
        offsetY: gameState.height / 2,
      },
      character: undefined,
      currentLevel: 1,
      enemies: [],
      levelDetails: undefined,
      levelWidth: undefined,
      levelHeight: undefined,
      levelTiles: undefined,
      levelTileImage: undefined,
      playerLocation: undefined,
      exitLocation: undefined,
      levelLoaded: false,
      levelLoading: false,
      prevTimestep: timestep,
      currTimestep: timestep,
      fns: {
        worldCoordToTile: worldCoordToTile,
        tileCoordToWorld: tileCoordToWorld,
        tileAtLocation: tileAtLocation,
      },
      constants: {
        TILE_DIMENSION: TILE_DIMENSION,
        HALF_TILE_DIMENSION: HALF_TILE_DIMENSION,
      }
    };
  }

  function updateRenderGameplay(gameState, timestep) {
    var ctx = gameState.ctx2d;
    var gameplay = gameState.gameplay;
    var levelDetails = gameplay.levelDetails;
    var character = gameplay.character;
    var enemies = gameplay.enemies;
    var camera = gameplay.camera;
    var characterSpawnXY;
    var i, enemy;

    if (!gameplay.levelLoaded) {
      if (!gameplay.levelLoading) {
        levelLoading = true;
        loadLevel(gameplay);
      }
      return;
    }

    gameplay.prevTimestep = gameplay.currTimestep;
    gameplay.currTimestep = timestep;
    gameplay.dt = (gameplay.currTimestep - gameplay.prevTimestep) / 16.6666;
    gameplay.dt = clamp(gameplay.dt, 0, 1);

    // check death state
    if (character.y < 0 || character.dead) {
      characterSpawnXY = tileCoordToWorld(levelDetails.playerLocation.x, levelDetails.playerLocation.y);
      character.x = characterSpawnXY.x;
      character.y = characterSpawnXY.y - HALF_TILE_DIMENSION + character.halfHeight;
      character.vx = 0;
      character.vy = 0;
      character.dying = false;
      character.dead = false;
    }

    // update enemies
    for (i = 0; i < enemies.length; ++i) {
      enemy = enemies[i];
      if (enemy.dead) {
        enemies.splice(i, 1);
        continue;
      }
      enemy.update(gameState);
    }

    // update player
    character.update(gameState);

    // check collision with enemies
    enemies.forEach(function(enemy){
      if (enemy.dying || character.dying) {
        return;
      }
      var enemyBounds = enemy.bounds;
      var characterBounds = character.bounds;
      if (G_Physics.checkCollision(enemyBounds, characterBounds)) {
        if (character.jumping) {
          // enemy dies
          // character jumps again
          enemy.die();
          character.vy = 10;
        } else {
          // character dies
          character.die();
        }
      }
    });

    // update camera position based on character
    if (character.x < camera.x + CAMERA_PADDING) {
      camera.x -= camera.x + CAMERA_PADDING - character.x;
    } else if (character.x > camera.x - CAMERA_PADDING + gameState.width) {
      camera.x += character.x - (camera.x + gameState.width - CAMERA_PADDING);
    }

    if (camera.x < 0) {
      camera.x = 0;
    }

    if (camera.x + gameState.width > gameplay.levelDetails.width * TILE_DIMENSION) {
      camera.x = gameplay.levelDetails.width * TILE_DIMENSION - gameState.width;
    }

    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, 0, gameState.width, gameState.height);

    ctx.save();

    ctx.scale(1, -1); // origin to bottom left corner
    ctx.translate(-camera.x, -camera.y - gameState.height);

    drawLevel(gameState);

    drawEnemies(gameState);

    drawCharacter(gameState);

    ctx.restore();
  }

  function cleanupGameplay(gameState) {
    gameState.gameplay = undefined;
  }

  function drawLevel(gameState) {
    var x, y, tile, tileXY;
    var camera = gameState.gameplay.camera;
    var ctx = gameState.ctx2d;
    var levelTiles = gameState.gameplay.levelDetails.levelTiles;
    var level = gameState.gameplay.currentLevel;
    var cameraOffsetX = camera.x % TILE_DIMENSION;
    var cameraOffsetY = camera.y % TILE_DIMENSION;
    var backgroundCameraOffsetX = camera.x * 0.5 % TILE_DIMENSION;
    var backgroundCameraOffsetY = camera.y * 0.5 % TILE_DIMENSION;
    // draw background
    for (y = 0; y <= gameState.height + TILE_DIMENSION; y += TILE_DIMENSION) {
      for (x = 0; x <= gameState.width + TILE_DIMENSION; x += TILE_DIMENSION) {

        tile = G_Tiles.tiles.EMPTY;
        ctx.save();
        ctx.translate(x + camera.x - backgroundCameraOffsetX,
                      y + camera.y - backgroundCameraOffsetY);
        // must flip y coordinate before drawing
        ctx.scale(1,-1);
        ctx.drawImage(gameState.gameplay.levelDetails.levelImage,
          tile.x * TILE_DIMENSION,
          tile.y * TILE_DIMENSION,
          TILE_DIMENSION, TILE_DIMENSION,
          -HALF_TILE_DIMENSION, -HALF_TILE_DIMENSION,
          TILE_DIMENSION, TILE_DIMENSION);

        ctx.restore();
      }
    }

    //draw foreground
    for (y = 0; y <= gameState.height + TILE_DIMENSION; y += TILE_DIMENSION) {
      for (x = 0; x <= gameState.width + TILE_DIMENSION; x += TILE_DIMENSION) {

        tileXY = worldCoordToTile(x + camera.x - cameraOffsetX,
                                  y + camera.y - cameraOffsetY);
        tile = tileAtLocation(tileXY.x, tileXY.y, gameState);

        if (tile.type == G_Tiles.tileTypes.EMPTY) {
          /* noop */
          continue;
        }

        ctx.save();
        ctx.translate(x + camera.x - cameraOffsetX,
                      y + camera.y - cameraOffsetY);
        // draw tile based on x/y in sprite
        // must flip y coordinate before drawing
        ctx.scale(1,-1);
        ctx.drawImage(gameState.gameplay.levelDetails.levelImage,
          tile.x * TILE_DIMENSION,
          tile.y * TILE_DIMENSION,
          TILE_DIMENSION, TILE_DIMENSION,
          -HALF_TILE_DIMENSION, -HALF_TILE_DIMENSION,
          TILE_DIMENSION, TILE_DIMENSION);

        ctx.restore();
      }
    }
  }

  function drawCharacter(gameState) {
    var ctx = gameState.ctx2d;
    ctx.save();
    gameState.gameplay.character.render(gameState);
    ctx.restore();
  }

  function drawEnemies(gameState) {
    var ctx = gameState.ctx2d;
    gameState.gameplay.enemies.forEach(function(enemy){
      ctx.save();
      enemy.render(gameState);
      ctx.restore();
    });
  }

  /*
   *
   */
  function loadLevel(gameplay) {
    var level = G_Levels[gameplay.currentLevel];
    var x, y;
    var tileChar, row;
    var tileCount = level.width * level.height;
    var levelDetails = gameplay.levelDetails = {};

    var imagesLoaded = 0;
    var numberToLoad = 3;

    var checkIfImagesLoaded = function() {
      if (imagesLoaded == numberToLoad) {
        gameplay.levelLoaded = true;
        gameplay.levelLoading = false;
      }
    }

    // load level image
    var levelImage = new Image();
    levelImage.onload = function loadLevelImage() {
      imagesLoaded++;
      checkIfImagesLoaded();
    }
    levelImage.src = level.imagePath;
    levelDetails.levelImage = levelImage;

    // load character image
    var characterImage = new Image();
    characterImage.onload = function loadLevelImage() {
      imagesLoaded++;
      checkIfImagesLoaded();
    }
    characterImage.src = "character_sprite.png";

    // load character image
    var enemyImage = new Image();
    enemyImage.onload = function loadLevelImage() {
      imagesLoaded++;
      checkIfImagesLoaded();
    }
    enemyImage.src = "supahpossum.png";

    levelDetails.levelTiles = [];
    for (y = 0; y < level.height; ++y) {
      levelDetails.levelTiles[level.height - y - 1] = [];
      row = levelDetails.levelTiles[level.height - y - 1];
      for (x = 0; x < level.width; ++x) {
        tileChar = level.tiles.charAt(y * level.width + x);
        row[x] = level.mapping[tileChar];

        if (!row[x]) {
          if (tileChar == "P") {
            levelDetails.playerLocation = {
              x: x,
              y: level.height - y - 1,
            };
            row[x] = G_Tiles.tiles.EMPTY;
          } else if (tileChar == "X") {
            levelDetails.exitLocation = {
              x: x,
              y: level.height - y - 1,
            };
            row[x] = G_Tiles.tiles.EMPTY;
          } else if (tileChar == "E") {
            var enemyCoord = tileCoordToWorld(x, level.height - y - 1);
            gameplay.enemies.push(new G_Enemy(enemyCoord.x, enemyCoord.y, enemyImage));
            console.log("Putting enemy at " + enemyCoord.x + ":" + enemyCoord.y);
            row[x] = G_Tiles.tiles.EMPTY;
          } else {
            console.error("No tile for char " + tileChar + " at x:" + x + " y:" + y);
            row[x] = G_Tiles.tiles.EMPTY;
          }
        }
      }
    }
    levelDetails.width = level.width;
    levelDetails.height = level.height;
    levelDetails.name = level.name;
    levelDetails.description = level.description;
    var characterWorldXY = tileCoordToWorld(levelDetails.playerLocation.x, levelDetails.playerLocation.y);
    gameplay.camera.x = characterWorldXY.x - gameplay.camera.offsetX;
    gameplay.character = new G_Character(
      characterWorldXY.x,
      characterWorldXY.y - HALF_TILE_DIMENSION + 16,
      characterImage
    );
  }

  function worldCoordToTile(x, y) {
    return {
      x: Math.floor(x / TILE_DIMENSION + 0.5),
      y: Math.floor(y / TILE_DIMENSION + 0.5),
    };
  }

  function tileCoordToWorld(x, y) {
    return {
      x: x * TILE_DIMENSION,
      y: y * TILE_DIMENSION,
    };
  }

  function tileToRect(x, y, rect, camera) {
    rect.left = x * TILE_DIMENSION - HALF_TILE_DIMENSION;
    rect.right = x * TILE_DIMENSION + HALF_TILE_DIMENSION;
    rect.top = y * TILE_DIMENSION + HALF_TILE_DIMENSION;
    rect.bottom = y * TILE_DIMENSION - HALF_TILE_DIMENSION;
  }

  function tileAtLocation(x, y, gameState) {
    var tile;
    var levelDetails = gameState.gameplay.levelDetails;
    if (y < 0 || y >= levelDetails.height ||
        x < 0 || x >= levelDetails.width) {
      tile = G_Tiles.EMPTY;
    } else {
      tile = levelDetails.levelTiles[y][x];
    }
    return tile;
  }

  return {
    init: initGameplay,
    updateRender: updateRenderGameplay,
    cleanup: cleanupGameplay,
  }
})();
