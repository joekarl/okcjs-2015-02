var G_Character = (function(){
  var keyBindings = {
    UP:     38,
    DOWN:   40,
    LEFT:   37,
    RIGHT:  39,
    SPACE:  32
  };

  var SQRT_2 = 1.41421356237;
  var HALF_SQRT_2 = 1 / SQRT_2;
  var SKEW_X = 0;//1;
  var SKEW_Y = 0;//0.8;
  var SPEED = 1.5;
  var GRAVITY = -1.2;
  var JUMP_VELOCITY = 15;
  var width = 52;
  var height = 52;
  var spriteWidth = 75;
  var spriteHeight = 75;
  var halfWidth = width / 2;
  var halfHeight = height / 2;

  var animationStates = {
    STANDING: {
      render: function(character, gameState) {
        var ctx = gameState.ctx2d;
        var sprite = character.characterImage;
        var frame = character.animationState.frame;
        var frameY = 0;
        var frameX = (frame / 12) % 5;
        frameX = Math.floor(frameX);

        ctx.drawImage(sprite,
          frameX * spriteWidth,
          frameY * spriteHeight,
          spriteWidth, spriteHeight,
          -halfWidth, -halfHeight,
          width, height);
      }
    },
    WALKING: {
      render: function(character, gameState) {
        var ctx = gameState.ctx2d;
        var sprite = character.characterImage;
        var frame = character.animationState.frame;
        var frameY = 1;
        var frameX = (frame / 8) % 6;
        frameX = Math.floor(frameX);


        ctx.drawImage(sprite,
          frameX * spriteWidth,
          frameY * spriteHeight,
          spriteWidth, spriteHeight,
          -halfWidth, -halfHeight,
          width, height);
      }
    },
    RUNNING: {
      render: function(character, gameState) {
        var ctx = gameState.ctx2d;
        var sprite = character.characterImage;
        var frame = character.animationState.frame;
        var frameX;
        var frameY;
        if (frame < 8) {
          frameX = 1 + (frame / 2) % 4;
          frameY = 1;
        } else if (frame < 16) {
          frameX = (frame / 2) % 4;
          frameY = 3;
        } else {
          frameX = 4 + (frame / 2) % 4;
          frameY = 3;
        }
        frameX = Math.floor(frameX);

        ctx.drawImage(sprite,
          frameX * spriteWidth,
          frameY * spriteHeight,
          spriteWidth, spriteHeight,
          -halfWidth, -halfHeight,
          width, height);
      }
    },
    JUMPING: {
      render: function(character, gameState) {
        var ctx = gameState.ctx2d;
        var sprite = character.characterImage;
        var frame = character.animationState.frame;
        var frameX;
        var frameY = 2;
        if (frame < 8) {
          frameX = (frame / 4) % 2;
        } else {
          frameX = 2 + (frame / 3) % 3;
        }
        frameX = Math.floor(frameX);

        ctx.drawImage(sprite,
          frameX * spriteWidth,
          frameY * spriteHeight,
          spriteWidth, spriteHeight,
          -halfWidth, -halfHeight,
          width, height);
      }
    }
  };

  function clamp(val, min, max) {
    if (val < min) {
      return min;
    } else if (val > max) {
      return max;
    } else {
      return val;
    }
  }

  function Character(x, y, characterImage) {
    this.prevX = x;
    this.prevY = y;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.ay = GRAVITY;
    this.ax = 0;
    this.fx = 1 - 0.4;
    this.fy = 1;//1 - 0.3;
    this.width = width;
    this.height = height;
    this.halfWidth = halfWidth;
    this.halfHeight = halfHeight;
    this.bounds = new G_Physics.Rect(0, 0, 0, 0);
    this.jumping = false;
    this.jumped = false;
    this.right = true;
    this.animationState = {
      state: animationStates.STANDING,
      frame: 0,
    };
    this.characterImage = characterImage;
  }

  Character.prototype.render = function(gameState) {
    var ctx = gameState.ctx2d;
    var i;
    var horizontalSkew = this.vx == 0 ? 0 : this.vx * SKEW_X;
    var verticalSkew = this.vy == 0 ? 0 : this.vy * -SKEW_Y;

    ctx.save();
    ctx.translate(this.x, this.y);

    // ctx.fillStyle = "#FFF";
    // ctx.beginPath();
    // ctx.moveTo(-halfWidth, -halfHeight);
    // ctx.lineTo(halfWidth, -halfHeight);
    // ctx.lineTo(halfWidth + horizontalSkew, halfHeight + verticalSkew);
    // ctx.lineTo(-halfWidth + horizontalSkew, halfHeight + verticalSkew);
    // ctx.fill();

    // flip y scale before drawing
    // flip x scale if facing left
    if (!this.right) {
      ctx.scale(-1, -1);
    } else {
      ctx.scale(1, -1);
    }
    this.animationState.state.render(this, gameState);

    ctx.restore();
  };

  Character.prototype.update = function(gameState) {
    var dt = gameState.gameplay.dt;
    var speed = SPEED;
    var gameplay = gameState.gameplay;
    var characterTileXY, characterTile;
    var landing = false;
    var walking = false;
    var blockedWalking = false;
    var running = false;
    var startedJump = false;

    if (gameState.input.isActive(keyBindings.UP)) {
      speed *= 2;
      running = true;
    }

    // calc x physics
    this.ax = 0;

    if (gameState.input.isActive(keyBindings.LEFT) &&
        !gameState.input.isActive(keyBindings.RIGHT)) {
      this.ax = -speed;
      this.right = false;
      walking = true;
    } else if (gameState.input.isActive(keyBindings.RIGHT) &&
        !gameState.input.isActive(keyBindings.LEFT)) {
      this.ax = speed;
      this.right = true;
      walking = true;
    }

    this.vx = this.ax * dt + this.vx * this.fx;
    if (this.vx < 0.01 && this.vx > -0.01) {
      this.vx = 0;
    }

    this.prevX = this.x;
    this.x += this.vx * dt;

    // check x tile collision
    var collisionPointX = this.vx > 0 ? this.x + this.halfWidth : this.x - this.halfWidth;
    characterTileXY = gameplay.fns.worldCoordToTile(collisionPointX, this.y);
    characterTile = gameplay.fns.tileAtLocation(characterTileXY.x, characterTileXY.y, gameState);
    if (characterTile.solid) {
      this.x = this.vx > 0 ?
                gameplay.fns.tileCoordToWorld(characterTileXY.x, 0).x - gameplay.constants.HALF_TILE_DIMENSION - this.halfWidth :
                gameplay.fns.tileCoordToWorld(characterTileXY.x, 0).x + gameplay.constants.HALF_TILE_DIMENSION + this.halfWidth;
      this.vx = 0;
      blockedWalking = true;
    }

    //calc y physics
    if (gameState.input.isActive(keyBindings.SPACE) &&
        !this.jumping &&
        !this.jumped &&
        this.vy == 0) {
      this.vy = JUMP_VELOCITY;
      this.jumping = true;
      this.jumped = true;
      startedJump = true;
    } else if (!gameState.input.isActive(keyBindings.SPACE) &&
        this.jumped) {
      this.jumped = false;
    }

    this.vy = this.ay * dt + this.vy * this.fy;

    if (this.vy < 0.001 && this.vy > -0.001) {
      this.vy = 0;
    }

    this.prevY = this.y;
    this.y += this.vy * dt;

    //check y tile collision
    var collisionPointY = this.vy > 0 ? this.y + this.halfHeight : this.y - this.halfHeight;
    characterTileXY = gameplay.fns.worldCoordToTile(this.x, collisionPointY);
    characterTile = gameplay.fns.tileAtLocation(characterTileXY.x, characterTileXY.y, gameState);
    if (characterTile && characterTile.solid) {
      this.y = this.vy > 0 ?
                gameplay.fns.tileCoordToWorld(0, characterTileXY.y).y - gameplay.constants.HALF_TILE_DIMENSION - this.halfHeight :
                gameplay.fns.tileCoordToWorld(0, characterTileXY.y).y + gameplay.constants.HALF_TILE_DIMENSION + this.halfHeight;

      if (this.vy < 0 && this.jumping) {
        this.jumping = false;
        landing = true;
      }
      this.vy = 0;
    }

    this.updateBounds();

    this.animationState.frame++;

    // set animation state
    if (startedJump && !running) {
      console.log("Started jumping");
      this.animationState.state = animationStates.JUMPING;
      this.animationState.frame = 0;
    } else if (landing && !running) {
      console.log("Started standing");
      this.animationState.state = animationStates.STANDING;
      this.animationState.frame = 0;
    } else if (running &&
        this.animationState.state == animationStates.WALKING) {
      console.log("Started running");
      this.animationState.state = animationStates.RUNNING;
      this.animationState.frame = 0;
    } else if (walking &&
        this.animationState.state == animationStates.STANDING) {
      console.log("Started walking");
      this.animationState.state = animationStates.WALKING;
      this.animationState.frame = 0;
    } else if (walking && !running &&
        this.animationState.state == animationStates.RUNNING) {
      console.log("Started walking");
      this.animationState.state = animationStates.WALKING;
      this.animationState.frame = 0;
    } else if (this.vx == 0 && !this.jumping && !blockedWalking &&
        this.animationState.state != animationStates.STANDING) {
      console.log("Started standing");
      this.animationState.state = animationStates.STANDING;
      this.animationState.frame = 0;
    }

  };

  Character.prototype.updateBounds = function() {
    this.bounds.left = this.x - halfWidth;
    this.bounds.right = this.x + halfWidth;
    this.bounds.bottom = this.y - halfHeight;
    this.bounds.top = this.y + halfHeight;
  }

  return Character;
}());
