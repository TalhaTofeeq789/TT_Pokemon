/**
 * TileIds.js
 *
 * Defines the numerical indices corresponding to each tile in our generated tileset.
 * Each tile is 16x16 pixels.
 *
 * In Phaser Tilemaps, -1 typically represents an empty tile (transparent).
 * 0 and above map to sequential tiles in the tileset image (row-major).
 */

export const TILE = {
  EMPTY: -1,
  GRASS: 0,
  TALL_GRASS: 1,
  PATH: 2,
  PATH_BORDER: 3,
  WATER: 4,
  WATER_EDGE: 5,
  TREE_TOP: 6,
  TREE_BOTTOM: 7,
  BUILDING_ROOF_RED: 8,
  BUILDING_WALL_RED: 9,
  BUILDING_ROOF_BLUE: 10,
  BUILDING_WALL_BLUE: 11,
  BUILDING_DOOR: 12,
  BUILDING_WINDOW: 13,
  FENCE_H: 14,
  FENCE_V: 15,
  SIGN: 16,
  FLOWERS: 17,
  FLOWER_BED: 18,
  POKEBALL_STATUE: 19,
};

// Set of tile IDs that have collision enabled (blocking the player)
export const COLLIDABLE_TILES = [
  TILE.WATER,
  TILE.WATER_EDGE,
  TILE.TREE_TOP,
  TILE.TREE_BOTTOM,
  TILE.BUILDING_ROOF_RED,
  TILE.BUILDING_WALL_RED,
  TILE.BUILDING_ROOF_BLUE,
  TILE.BUILDING_WALL_BLUE,
  TILE.BUILDING_WINDOW,
  TILE.FENCE_H,
  TILE.FENCE_V,
  TILE.SIGN,
  TILE.POKEBALL_STATUE,
];

