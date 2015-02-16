var G_Levels = [
  {},
  {
    name: "Demo - 1",
    description: "Tilemap + collision",
    width: 72,
    height: 21,
    mapping: {
      "B": G_Tiles.tiles.BLOCK,
      "R": G_Tiles.tiles.WALL_RIGHT,
      "F": G_Tiles.tiles.FLOOR,
      "f": G_Tiles.tiles.FLOOR_FLOATING,
      "g": G_Tiles.tiles.FLOOR_WALL_RIGHT,
      "d": G_Tiles.tiles.FLOOR_WALL_LEFT,
      "C": G_Tiles.tiles.CORNER_LEFT,
      "c": G_Tiles.tiles.CORNER_RIGHT,
      "L": G_Tiles.tiles.WALL_LEFT,
      " ": G_Tiles.tiles.EMPTY,
      "l": G_Tiles.tiles.EDGE_LEFT,
      "r": G_Tiles.tiles.EDGE_RIGHT,
    },
    imagePath: "tiles.png",
    tiles:
    "BBBBBBBR                                                        LBBBBBBB" +
    "BBBBBBBR                                                        LBBBBBBB" +
    "BBBBBBBR                                                        LBBBBBBB" +
    "BBBBBBBR                                                        LBBBBBBB" +
    "BBBBBBBR                                                        LBBBBBBB" +
    "BBBBBBBR                                                        LBBBBBBB" +
    "BBBBBBBR                                                        LBBBBBBB" +
    "BBBBBBBR                                                        LBBBBBBB" +
    "BBBBBBBR                                                        LBBBBBBB" +
    "BBBBBBBR                        E                               LBBBBBBB" +
    "BBBBBBBR                     lCffffcr           lCffffcr  lfcr  LBBBBBBB" +
    "BBBBBBBR                                                        LBBBBBBB" +
    "BBBBBBBR                               lCffffcr                 LBBBBBBB" +
    "BBBBBBBR                                                        LBBBBBBB" +
    "BBBBBBBR                      lCffffcr                          LBBBBBBB" +
    "BBBBBBBR                                E                       LBBBBBBB" +
    "BBBBBBBR              lgrldr         lCffffcr                   LBBBBBBB" +
    "BBBBBBBR      lFr    lFR  LFr                                   LBBBBBBB" +
    "BBBBBBBR P   lFB  E lFBR  LBFr                                X LBBBBBBB" +
    "BBBBBBBBFFFFFFBBFFFFFBBR  LBBFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFBBBBBBBB" +
    "BBBBBBBBBBBBBBBBBBBBBBBR  LBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
  },
];
