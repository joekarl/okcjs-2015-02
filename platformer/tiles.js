var G_Tiles = (function(){
  var tileTypes = {
    BLOCK: 0,
    EMPTY: 1,
  };

  return {
    tileTypes: tileTypes,
    BLOCK: {
      type: tileTypes.BLOCK,
      solid: true,
    },
    EMPTY: {
      type: tileTypes.EMPTY,
      solid: false,
    },
  };
}());
