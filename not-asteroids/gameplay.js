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

  function initGameplay(gameState) {
    var i, y;
    gameState.gameplay = {
      loading: true,
      laserSound: undefined,
      explosionSound: undefined,
      thrustSound: undefined,
      asteroidSound: undefined,
      score: 0,
      lives: 3,
      lasers: [],
      ship: new Ship(),
      level: 0,
      levelComplete: true,
      planets: [],
      gameover: false,
      laserFired: false,
      paused: false,
      pauseLatency: 0,
      changingLevel: true,
      scanlines: [],
      once: true,
      highscore: false
    };

    var loadCount = 0;
    var onSoundLoad = function() {
      if (++loadCount == 4) {
        gameState.gameplay.loading = false;
      }
    };
    var laserSound = new Audio('laser.wav');
    var explosionSound = new Audio('explosion.mp3');
    var thrustSound = new Audio('thrust.wav');
    var asteroidSound = new Audio('asteroidBreak.wav');
    laserSound.addEventListener("canplay", onSoundLoad);
    explosionSound.addEventListener("canplay", onSoundLoad);
    thrustSound.addEventListener("canplay", onSoundLoad);
    asteroidSound.addEventListener("canplay", onSoundLoad);
    laserSound.load();
    explosionSound.load();
    thrustSound.load();
    asteroidSound.load();
    thrustSound.volume = 0.2;
    thrustSound.loop = true;
    laserSound.playbackRate = 2;
    explosionSound.playbackRate = 4;
    asteroidSound.playbackRate = 2;

    gameState.gameplay.laserSound = laserSound;
    gameState.gameplay.explosionSound = explosionSound;
    gameState.gameplay.thrustSound = thrustSound;
    gameState.gameplay.asteroidSound = asteroidSound;

    for (i = 0; i < 30; ++i) {
      y = gameState.height / 30 * i + Math.random() * 5;
      gameState.gameplay.scanlines.push(new Scanline(y, gameState));
    }
  }

  function updateRenderGameplay(gameState) {
    var ctx = gameState.ctx2d;
    var gameplay = gameState.gameplay;
    var i;

    if (gameplay.loading) {
      // do something not terrible here
      return;
    }

    if (gameplay.once) {
      gameState.gameplay.thrustSound.play();
      gameplay.once = false;
    }

    gameplay.scanLinePosition += Math.random() + 1;
    if (gameplay.scanLinePosition > gameState.height) {
      gameplay.scanLinePosition = 0;
    }

    // check for special cases
    checkSpecialStates(gameState);

    if (gameState.input.isActive(keyBindings.ESCAPE) && !gameplay.gameover && !gameplay.changingLevel && gameplay.pauseLatency <= 0) {
      gameplay.pauseLatency = 30;
      gameplay.paused = !gameplay.paused;
      if (gameplay.paused) {
        gameState.gameplay.thrustSound.pause();
      } else {
        gameState.gameplay.thrustSound.play();
        gameState.gameplay.thrustSound.volume = 0.2;
      }
    }

    gameplay.pauseLatency -= 1;
    if (gameplay.pauseLatency < 0) {
      gameplay.pauseLatency = 0;
    }

    // check if we should change game states
    if (gameState.input.isActive(keyBindings.Q) && gameplay.paused) {
      gameState.state = "menu";
      return;
    }

    if (gameState.input.isActive(keyBindings.ESCAPE) && gameplay.gameover && gameplay.highscore) {
      gameState.state = "scoreEntry";
      gameState.transition = gameplay.score;
      return;
    }

    if (gameState.input.isActive(keyBindings.ESCAPE) && gameplay.gameover) {
      gameState.state = "menu";
      return;
    }

    if (gameState.input.isActive(keyBindings.ENTER) && gameplay.changingLevel) {
      gameplay.changingLevel = false;
      return;
    }

    for (i = 0; i < gameplay.scanlines.length; ++i) {
      gameplay.scanlines[i].update(gameState);
    }

    // update game if not paused
    if (!gameplay.paused) {
      if (gameplay.changingLevel) {
        // noop
      } else {
        updateGameObjects(gameState);
      }
    }

    // clear canvas
    ctx.save();
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, gameState.width, gameState.height);
    ctx.restore();

    if (gameplay.changingLevel) {
      renderLevelChange(gameState);
    } else {
      renderGame(gameState);
    }

    renderOverlays(gameState);
  }

  function cleanupGameplay(gameState) {
    delete gameState.gameplay;
  }

  function checkSpecialStates(gameState) {
    var gameplay = gameState.gameplay;

    if (gameplay.ship.isDead && !gameplay.gameover) {
      gameplay.explosionSound.play();
    }

    if (gameplay.lives <= 0 && !gameplay.gameover) {
      gameplay.gameover = true;
      gameState.gameplay.thrustSound.pause();
      // check for high score
      if (G_Scores.checkHighScore(gameplay.score)) {
        gameplay.highscore = true;
      }
    }

    if (gameplay.planets.length == 0 && !gameplay.levelComplete) {
      gameplay.levelComplete = true;
      gameplay.changingLevel = true;
      gameplay.lasers = [];
      return;
    }

    if (gameplay.ship.isDead && !gameplay.gameover) {
      gameplay.ship = new Ship();
    }

    if (gameplay.levelComplete) {
      gameplay.ship = new Ship();
      gameplay.level++;
      gameplay.levelComplete = false;
      for (i = 0; i < gameplay.level; ++i) {
        gameplay.planets.push(new Planet(3, 1, gameState));
      }
    }

  }

  function updateGameObjects(gameState) {
    var gameplay = gameState.gameplay;
    var i, j;
    var planetCount = gameplay.planets.length;
    var laserCount = gameplay.lasers.length;
    var deadPlanet;
    var p = {
      x: 0,
      y: 0
    };

    if (gameState.input.isActive(keyBindings.SPACE) && !gameplay.laserFired && !gameplay.gameover) {
      gameplay.lasers.push(new Laser(gameplay.ship));
      gameplay.laserFired = true;
      gameplay.laserSound.play();
    } else if (!gameState.input.isActive(keyBindings.SPACE)) {
      gameplay.laserFired = false;
    }

    // check to see if we have any dead planets and deal with that
    for (j = 0; j < planetCount; ++j) {
      if (gameplay.planets[j].isDead) {
        gameplay.asteroidSound.play();
        deadPlanet = gameplay.planets[j];
        gameplay.planets.splice(j, 1);
        planetCount--;
        if (deadPlanet.size != 1) {
          gameplay.planets.push(new Planet(deadPlanet.size - 1, 1, gameState, deadPlanet.x, deadPlanet.y));
          gameplay.planets.push(new Planet(deadPlanet.size - 1, 1, gameState, deadPlanet.x, deadPlanet.y));
          gameplay.planets.push(new Planet(deadPlanet.size - 1, 1, gameState, deadPlanet.x, deadPlanet.y));
          planetCount += 3;
        }
      }
    }

    for (i = 0; i < gameplay.planets.length; ++i) {
      gameplay.planets[i].update(gameState);
    }

    if (!gameplay.gameover) {
      // update locations
      gameplay.ship.update(gameState);

      for (i = 0; i < laserCount; ++i) {
        if (gameplay.lasers[i].life < 0) {
          gameplay.lasers.splice(i, 1);
          laserCount--;
          continue;
        }
        gameplay.lasers[i].update(gameState);
      }

      // check for collisions
      for (i = 0; i < laserCount; ++i) {
        p.x = gameplay.lasers[i].x;
        p.y = gameplay.lasers[i].y;
        for (j = 0; j < planetCount; ++j) {
          if (pointInPolygon(p, gameplay.planets[j].vertices, gameplay.planets[j].x, gameplay.planets[j].y)) {
            gameplay.lasers[i].life = -1;
            gameplay.planets[j].isDead = true;
            gameplay.score += 10;
            break;
          }
        }
      }

      p.x = gameplay.ship.x;
      p.y = gameplay.ship.y;
      for (j = 0; j < planetCount; ++j) {
        if (pointInPolygon(p, gameplay.planets[j].vertices, gameplay.planets[j].x, gameplay.planets[j].y) && gameplay.ship.invulnerable <= 0 && !gameplay.ship.isDead) {
          gameplay.lives -= 1;
          gameplay.ship.isDead = true;
          break;
        }
      }
    }
  }

  function renderGame(gameState) {
    var ctx = gameState.ctx2d;
    var gameplay = gameState.gameplay;

    if (!gameplay.gameover && !gameplay.ship.isDead) {
      ctx.save();
      gameplay.ship.render(ctx);
      ctx.restore();
    }

    var laserCount = gameplay.lasers.length;
    for (i = 0; i < laserCount; ++i) {
      if (gameplay.lasers[i].life > 0) {
        ctx.save();
        gameplay.lasers[i].render(ctx);
        ctx.restore();
      }
    }

    for (i = 0; i < gameplay.planets.length; ++i) {
      ctx.save();
      gameplay.planets[i].render(ctx);
      ctx.restore();
    }
  }

  function renderOverlays(gameState) {
    var ctx = gameState.ctx2d;
    var gameplay = gameState.gameplay;

    // draw overlays
    ctx.save();
    ctx.fillStyle = "#FFF";
    ctx.font = "14px monospace";
    ctx.fillText("Score - " + padDigits(gameplay.score, 5), gameState.width - 210, 20);
    ctx.fillText("Lives - " + gameplay.lives, gameState.width - 90, 20);
    ctx.restore();

    if (gameplay.paused || gameplay.gameover) {
      // draw menu overlay
      ctx.save();
      ctx.fillStyle = "rgba(128, 128, 128, 0.4)";
      ctx.fillRect(0, 0, gameState.width, gameState.height);
      ctx.restore();

      if (gameplay.paused) {
        ctx.save();
        ctx.fillStyle = "#FFF";
        ctx.font = "24px monospace";
        ctx.fillText("Paused", gameState.width / 2 - 45, gameState.height / 2 - 75);
        ctx.font = "14px monospace";
        ctx.fillText("Esc to unpause, Q to quit", gameState.width / 2 - 100, gameState.height / 2 - 50);
        ctx.restore();
      } else if (gameplay.gameover) {
        ctx.save();
        ctx.fillStyle = "#F00";
        ctx.font = "24px monospace";
        ctx.fillText("Game Over", gameState.width / 2 - 75, gameState.height / 2 - 75);
        ctx.font = "14px monospace";
        ctx.fillText("Esc to quit", gameState.width / 2 - 50, gameState.height / 2 - 50);
        if (gameplay.highscore) {
          ctx.fillStyle = "#FFFF00";
          ctx.font = "24px monospace";
          ctx.fillText("New High Score!", gameState.width / 2 - 110, gameState.height / 2);
        }
        ctx.restore();
      }
    }
    renderScanLine(gameState);
  }

  function renderLevelChange(gameState) {
    var ctx = gameState.ctx2d;
    var gameplay = gameState.gameplay;

    ctx.save();
    ctx.fillStyle = "rgba(128, 128, 128, 0.4)";
    ctx.fillRect(0, 0, gameState.width, gameState.height);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "#FFF";
    ctx.font = "24px monospace";
    var extraWidth = gameState.gameplay.level > 9 ? 10 : 0;
    ctx.fillText("Level " + gameState.gameplay.level, gameState.width / 2 - 50 - extraWidth, gameState.height / 2 - 75);
    ctx.font = "14px monospace";
    ctx.fillText("Press enter to start", gameState.width / 2 - 90, gameState.height / 2 - 50);
    ctx.restore();

    renderScanLine(gameState);
  }

  function renderScanLine(gameState) {
    // render scan lines
    var ctx = gameState.ctx2d;
    var gameplay = gameState.gameplay;
    var i;
    ctx.save();
    ctx.fillStyle = "rgba(128, 128, 128, 0.2)";
    ctx.fillRect(0, 0, gameState.width, gameState.height);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.01)";
    for (i = 0; i < gameplay.scanlines.length; ++i) {
      gameplay.scanlines[i].render(ctx);
    }
    ctx.restore();
  }

  function Scanline(y, gameState) {
    this.y = y;
    this.width = gameState.width;
    this.vy = 0.5;
    this.height = Math.random() * 3;
  }

  Scanline.prototype.update = function(gameState) {
    this.y += this.vy;
    if (this.y > gameState.height) {
      this.y = -1;
    }
  }

  Scanline.prototype.render = function(ctx) {
    ctx.fillRect(0, this.y, this.width, this.height);
  }

  function Planet(size, speed, gameState, x, y) {
    this.isDead = false;
    this.size = size;

    if (!x || !y) {
      // set random xy
      if (Math.random() < 0.5) {
        // random offscreen x
        this.x = Math.random() < 0.5 ? -10 : gameState.width + 10;
        this.y = Math.random() * gameState.height;
      } else {
        // random offscreen y
        this.y = Math.random() < 0.5 ? -10 : gameState.height + 10;
        this.x = Math.random() * gameState.width;
      }
    } else {
      this.x = x;
      this.y = y;
    }


    this.velocity = speed;
    this.angle = Math.random() * 360;

    this.vertices = [];
    var i;
    var vertCount = 5 * size;
    var vertStep = 360 / vertCount;
    var vertAngle = 0;
    var jutter;
    for (i = 0; i < vertCount; ++i) {
      jutter = Math.random() * 5 * size;
      this.vertices[i] = {};
      this.vertices[i].x = jutter + this.size * 10 * Math.cos((Math.PI/180) * vertAngle);
      this.vertices[i].y = jutter + this.size * 10 * Math.sin((Math.PI/180) * vertAngle);
      vertAngle += vertStep;
    }
  }

  Planet.prototype.update = function(gameState) {

    var vx = Math.cos((Math.PI/180) * this.angle) * this.velocity;
    var vy = Math.sin((Math.PI/180) * this.angle) * this.velocity;

    this.x += vx;
    this.y += vy;

    if (this.x < 0) {
      this.x += gameState.width;
    } else if (this.x > gameState.width) {
      this.x -= gameState.width;
    }

    if (this.y < 0) {
      this.y += gameState.height;
    } else if (this.y > gameState.height) {
      this.y -= gameState.height;
    }
  };

  Planet.prototype.render = function(ctx) {
    ctx.translate(this.x, this.y);

    // draw planet
    ctx.strokeStyle = "#00FF00";
    var lastVertex = this.vertices[this.vertices.length - 1];
    ctx.beginPath();
    ctx.moveTo(lastVertex.x, lastVertex.y);
    var i, vertex;
    for (i = 0; i < this.vertices.length; ++i) {
      vertex = this.vertices[i];
      ctx.lineTo(vertex.x, vertex.y);
    }
    ctx.stroke();
  };

  function Laser(ship) {
    this.life = 100;
    this.x = ship.x + Math.cos((Math.PI/180) * ship.angle) * 7.5;
    this.y = ship.y + Math.sin((Math.PI/180) * ship.angle) * 7.5;
    this.vx = Math.cos((Math.PI/180) * ship.angle) * 10;
    this.vy = Math.sin((Math.PI/180) * ship.angle) * 10;
  }

  Laser.prototype.update = function(gameState) {
    this.life--;

    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > gameState.width ||
      this.y < 0 || this.y > gameState.height) {
        this.life = -1;
    }
  };

  Laser.prototype.render = function(ctx) {
    ctx.translate(this.x, this.y);

    // draw laser
    ctx.fillStyle = "#FF9900";
    ctx.fillRect(-2, -2, 4, 4);
  };

  function Ship() {
    this.isDead = false;
    this.invulnerable = 200;
    this.x = 400;
    this.y = 300;
    this.thrust = 0;
    this.angle = -90;
    this.thrusting = false;
  }

  Ship.prototype.update = function(gameState) {
    this.invulnerable -= 1;
    if (this.invulnerable < 0) {
      this.invulnerable = 0;
    }
    var input = gameState.input;
    if (input.isActive(keyBindings.LEFT)) {
      this.angle -= 2.5;
    }
    if (input.isActive(keyBindings.RIGHT)) {
      this.angle += 2.5;
    }
    if (input.isActive(keyBindings.UP)) {
      this.thrust += 1;
      this.thrusting = true;
      if (!this.isDead) {
        gameState.gameplay.thrustSound.volume = 1;
      }
    } else {
      this.thrusting = false;
      gameState.gameplay.thrustSound.volume = 0.2;
    }

    this.thrust -= 0.15;
    if (this.thrust < 0) {
      this.thrust = 0;
    } else if (this.thrust > 5) {
      this.thrust = 5;
    }

    var vx = Math.cos((Math.PI/180) * this.angle) * this.thrust;
    var vy = Math.sin((Math.PI/180) * this.angle) * this.thrust;

    this.x += vx;
    this.y += vy;

    if (this.x < 0) {
      this.x += gameState.width;
    } else if (this.x > gameState.width) {
      this.x -= gameState.width;
    }

    if (this.y < 0) {
      this.y += gameState.height;
    } else if (this.y > gameState.height) {
      this.y -= gameState.height;
    }
  };

  Ship.prototype.render = function(ctx) {
    ctx.translate(this.x, this.y);
    ctx.rotate((Math.PI/180) * this.angle);
    ctx.scale(2, 2);

    var opacity = this.invulnerable % 10 > 5 ? 0.7 : 1;

    // draw ship
    ctx.strokeStyle = "rgba(255, 255, 255, " + opacity + ")";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-5, 5);
    ctx.lineTo(7.5, 0);
    ctx.lineTo(-5, -5);
    ctx.lineTo(0, 0);
    ctx.stroke();

    // draw thrust
    if (this.thrusting) {
      ctx.strokeStyle = "rgba(255, 102, 0, " + opacity + ")";
      ctx.beginPath();
      ctx.moveTo(-3, 3);
      ctx.lineTo(-1 * (3 + Math.random() * 3), 1.5);
      ctx.lineTo(-3, 0);
      ctx.lineTo(-1 * (3 + Math.random() * 3), -1.5);
      ctx.lineTo(-3, -3);
      ctx.stroke();
    }
  };

  function padDigits(number, digits) {
    return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
  }

  // https://github.com/substack/point-in-polygon/blob/master/index.js
  function pointInPolygon(point, vs, offsetX, offsetY) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var x = point.x, y = point.y;

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      var xi = vs[i].x + offsetX, yi = vs[i].y + offsetY;
      var xj = vs[j].x + offsetX, yj = vs[j].y + offsetY;

      var intersect = ((yi > y) != (yj > y))
      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  };

  return {
    init: initGameplay,
    updateRender: updateRenderGameplay,
    cleanup: cleanupGameplay,
  }
})();
