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
  var GRAVITY = -1.6;
  var JUMP_VELOCITY = 20;
  var width = 24;
  var height = 24;
  var halfWidth = width / 2;
  var halfHeight = height / 2;

  function clamp(val, min, max) {
    if (val < min) {
      return min;
    } else if (val > max) {
      return max;
    } else {
      return val;
    }
  }

  function Character(x, y) {
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
  }

  Character.prototype.render = function(gameState) {
    var ctx = gameState.ctx2d;
    var i;
    var horizontalSkew = this.vx == 0 ? 0 : this.vx * SKEW_X;
    var verticalSkew = this.vy == 0 ? 0 : this.vy * -SKEW_Y;

    ctx.save();
    ctx.translate(this.x, this.y);

    ctx.fillStyle = "#F00";
    ctx.beginPath();
    ctx.moveTo(-halfWidth, -halfHeight);
    ctx.lineTo(halfWidth, -halfHeight);
    ctx.lineTo(halfWidth + horizontalSkew, halfHeight + verticalSkew);
    ctx.lineTo(-halfWidth + horizontalSkew, halfHeight + verticalSkew);
    ctx.fill();

    // ctx.fillStyle = "#0F0";
    // ctx.strokeRect(-halfWidth, -halfHeight, width, height);
    //
    // ctx.fillStyle = "#FFF";
    // ctx.fillRect(-1, -1, 2, 2);

    ctx.restore();
  };

  Character.prototype.update = function(gameState) {
    var dt = gameState.gameplay.dt;
    var speed = SPEED;
    var gameplay = gameState.gameplay;
    var characterTileXY, characterTile;

    if (gameState.input.isActive(keyBindings.UP)) {
      speed *= 1.5;
    }

    // calc x physics
    this.ax = 0;

    if (gameState.input.isActive(keyBindings.LEFT) &&
        !gameState.input.isActive(keyBindings.RIGHT)) {
      this.ax = -speed;
    } else if (gameState.input.isActive(keyBindings.RIGHT) &&
        !gameState.input.isActive(keyBindings.LEFT)) {
      this.ax = speed;
    }

    this.vx = this.ax * dt + this.vx * this.fx;
    if (this.vx < 0.001 && this.vx > -0.001) {
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
    }

    //calc y physics
    if (gameState.input.isActive(keyBindings.SPACE) &&
        !this.jumping &&
        !this.jumped &&
        this.vy == 0) {
      this.vy = JUMP_VELOCITY;
      this.jumping = true;
      this.jumped = true;
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
    if (characterTile.solid) {
      this.y = this.vy > 0 ?
                gameplay.fns.tileCoordToWorld(0, characterTileXY.y).y - gameplay.constants.HALF_TILE_DIMENSION - this.halfHeight :
                gameplay.fns.tileCoordToWorld(0, characterTileXY.y).y + gameplay.constants.HALF_TILE_DIMENSION + this.halfHeight;

      if (this.vy < 0) {
        this.jumping = false;
      }
      this.vy = 0;
    }

    this.updateBounds();
  };

  Character.prototype.updateBounds = function() {
    this.bounds.left = this.x - halfWidth;
    this.bounds.right = this.x + halfWidth;
    this.bounds.bottom = this.y - halfHeight;
    this.bounds.top = this.y + halfHeight;
  }

  return Character;
}());
