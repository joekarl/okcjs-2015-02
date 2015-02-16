var G_Enemy = (function(){

  var SQRT_2 = 1.41421356237;
  var HALF_SQRT_2 = 1 / SQRT_2;
  var SPEED = 1.2;
  var GRAVITY = -1.2;
  var width = 24;
  var height = 32;
  var drawWidth = 45;
  var drawHeight = 45;
  var spriteWidth = 75;
  var spriteHeight = 75;
  var halfWidth = width / 2;
  var halfHeight = height / 2;
  var halfDrawWidth = drawWidth / 2;
  var halfDrawHeight = drawHeight / 2;
  var spriteOffsetY = -halfDrawHeight - (halfDrawHeight - halfHeight);

  var animationStates = {
    WALKING: {
      render: function(enemy, gameState) {
        var ctx = gameState.ctx2d;
        var sprite = enemy.enemyImage;
        var frame = enemy.animationState.frame;
        var frameY = 0;
        var frameX = (frame / 8) % 4;
        frameX = Math.floor(frameX);


        ctx.drawImage(sprite,
          frameX * spriteWidth,
          frameY * spriteHeight,
          spriteWidth, spriteHeight,
          -halfDrawWidth, spriteOffsetY,
          drawWidth, drawHeight);
      }
    },
    DYING: {
      render: function(enemy, gameState) {
        var ctx = gameState.ctx2d;
        var sprite = enemy.enemyImage;
        var frame = enemy.animationState.frame;
        var frameY = 1;
        var frameX = (frame / 16) % 4;
        frameX = Math.floor(frameX);

        ctx.drawImage(sprite,
          frameX * spriteWidth,
          frameY * spriteHeight,
          spriteWidth, spriteHeight,
          -halfDrawWidth, spriteOffsetY,
          drawWidth, drawHeight);
      }
    },
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

  function Enemy(x, y, enemyImage) {
    this.prevX = x;
    this.prevY = y;
    this.x = x;
    this.y = y;
    this.vx = SPEED;
    this.vy = 0;
    this.ay = GRAVITY;
    this.ax = 0;
    this.fx = 1 - 0.4;
    this.fy = 1;//1 - 0.3;
    this.dying = false;
    this.dead = false;
    this.width = width;
    this.height = height;
    this.halfWidth = halfWidth;
    this.halfHeight = halfHeight;
    this.bounds = new G_Physics.Rect(0, 0, 0, 0);
    this.right = Math.random(5) < 3;
    this.animationState = {
      state: animationStates.WALKING,
      frame: 0,
    };
    this.enemyImage = enemyImage;
  }

  Enemy.prototype.die = function() {
    this.animationState.state = animationStates.DYING;
    this.animationState.frame = 0;
    this.dying = true;
    this.vx = 0;
  }

  Enemy.prototype.render = function(gameState) {
    var ctx = gameState.ctx2d;

    ctx.save();
    ctx.translate(this.x, this.y);

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

  Enemy.prototype.update = function(gameState) {
    var dt = gameState.gameplay.dt;
    var gameplay = gameState.gameplay;
    var enemyTileXY, enemyTile;

    this.prevX = this.x;
    this.x += this.vx * dt;

    // check x tile collision
    var collisionPointX = this.vx > 0 ? this.x + this.halfWidth : this.x - this.halfWidth;
    enemyTileXY = gameplay.fns.worldCoordToTile(collisionPointX, this.y);
    enemyTile = gameplay.fns.tileAtLocation(enemyTileXY.x, enemyTileXY.y, gameState);
    if (enemyTile.solid) {
      this.x = this.vx > 0 ?
                gameplay.fns.tileCoordToWorld(enemyTileXY.x, 0).x - gameplay.constants.HALF_TILE_DIMENSION - this.halfWidth :
                gameplay.fns.tileCoordToWorld(enemyTileXY.x, 0).x + gameplay.constants.HALF_TILE_DIMENSION + this.halfWidth;
      this.vx = -this.vx;
      this.right = !this.right;
    }

    //calc y physics
    this.vy = this.ay * dt + this.vy * this.fy;

    if (this.vy < 0.001 && this.vy > -0.001) {
      this.vy = 0;
    }

    this.prevY = this.y;
    this.y += this.vy * dt;

    //check y tile collision
    var collisionPointY = this.vy > 0 ? this.y + this.halfHeight : this.y - this.halfHeight;
    enemyTileXY = gameplay.fns.worldCoordToTile(this.x, collisionPointY);
    enemyTile = gameplay.fns.tileAtLocation(enemyTileXY.x, enemyTileXY.y, gameState);
    if (enemyTile && enemyTile.solid) {
      this.y = this.vy > 0 ?
                gameplay.fns.tileCoordToWorld(0, enemyTileXY.y).y - gameplay.constants.HALF_TILE_DIMENSION - this.halfHeight :
                gameplay.fns.tileCoordToWorld(0, enemyTileXY.y).y + gameplay.constants.HALF_TILE_DIMENSION + this.halfHeight;
      this.vy = 0;
    } else {
      // we're falling off the edge...
      // revert previous position and flip x direction
      this.y = this.prevY;
      this.x = this.prevX;
      this.vx = -this.vx;
      this.right = !this.right;
    }

    this.updateBounds();

    if (this.animationState.frame > 58 && this.dying) {
      this.dead = true;
      return;
    }

    this.animationState.frame++;
  };

  Enemy.prototype.updateBounds = function() {
    this.bounds.left = this.x - halfWidth;
    this.bounds.right = this.x + halfWidth;
    this.bounds.bottom = this.y - halfHeight;
    this.bounds.top = this.y + halfHeight;
  }

  return Enemy;
}());
