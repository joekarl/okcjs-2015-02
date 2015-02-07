var G_Physics = (function(){

  function Rect(bottom, top, left, right) {
    this.bottom = bottom;
    this.top = top;
    this.left = left;
    this.right = right;
  }

  function checkCollision(rect1, rect2) {

    if (rect1.right < rect2.left || rect1.left > rect2.right) {
      return false;
    }
    if (rect1.top < rect2.bottom || rect1.bottom > rect2.top) {
      return false;
    }
    return true;
  }

  return {
    Rect: Rect,
    checkCollision: checkCollision
  }

}());
