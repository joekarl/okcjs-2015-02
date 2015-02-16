var G_Tiles = (function(){
  var tileTypes = {
    BLOCK: 0,
    EMPTY: 1,
    FLOOR: 2,
    FLOOR_FLOATING: 3,
    CORNER_LEFT: 4,
    CORNER_RIGHT: 5,
    WALL_LEFT: 6,
    WALL_RIGHT: 7,
    EDGE_LEFT: 8,
    EDGE_RIGHT: 9,
    FLOOR_WALL_LEFT: 10,
    FLOOR_WALL_RIGHT: 11,
  };

  var tiles = {
    BLOCK: {
      type: tileTypes.BLOCK,
      solid: true,
      x: 2,
      y: 2,
    },
    EMPTY: {
      type: tileTypes.EMPTY,
      solid: false,
      x: 6,
      y: 10,
    },
    FLOOR: {
      type: tileTypes.FLOOR,
      solid: true,
      x: 2,
      y: 1,
    },
    FLOOR_WALL_RIGHT: {
      type: tileTypes.FLOOR_WALL_RIGHT,
      solid: true,
      x: 5,
      y: 1,
    },
    FLOOR_WALL_LEFT: {
      type: tileTypes.FLOOR_WALL_LEFT,
      solid: true,
      x: 1,
      y: 1,
    },
    FLOOR_FLOATING: {
      type: tileTypes.FLOOR_FLOATING,
      solid: true,
      x: 2,
      y: 6
    },
    CORNER_LEFT: {
      type: tileTypes.CORNER_LEFT,
      solid: true,
      x: 1,
      y: 6,
    },
    CORNER_RIGHT: {
      type: tileTypes.CORNER_RIGHT,
      solid: true,
      x: 5,
      y: 6,
    },
    WALL_LEFT: {
      type: tileTypes.WALL_LEFT,
      solid: true,
      x: 1,
      y: 2,
    },
    WALL_RIGHT: {
      type: tileTypes.WALL_RIGHT,
      solid: true,
      x: 5,
      y: 2,
    },
    EDGE_LEFT: {
      type: tileTypes.EDGE_LEFT,
      solid: false,
      x: 0,
      y: 6,
    },
    EDGE_RIGHT: {
      type: tileTypes.EDGE_RIGHT,
      solid: false,
      x: 6,
      y: 6,
    },
  };

  return {
    tileTypes: tileTypes,
    tiles: tiles,
  };
}());
