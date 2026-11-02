/**
 * MapManager.js
 *
 * Responsible for:
 *  - Building the tilemap and its visual layers from MapData
 *  - Setting up tile collisions for solid objects (trees, walls, fences, water)
 *  - Providing query methods for game mechanics (tall grass checks, signs, doors)
 *  - Configuring physics colliders with the player
 */

import { TILE_SIZE, WORLD_SCALE, MAP_COLS, MAP_ROWS, ASSETS } from '../utils/Constants.js';
import { TILE, COLLIDABLE_TILES } from './TileIds.js';
import { MapData } from './MapData.js';

export default class MapManager {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this._scene = scene;
    this._map = null;
    this._groundLayer = null;
    this._objectsLayer = null;

    this._signs = MapData.getSignData();
    this._doors = MapData.getDoorData();
  }

  /**
   * Builds the entire tilemap, sets up layers, scaling, and collision.
   */
  createMap() {
    // Create empty tilemap with dimensions
    this._map = this._scene.make.tilemap({
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
      width: MAP_COLS,
      height: MAP_ROWS,
    });

    // Link the generated tileset texture
    const tileset = this._map.addTilesetImage('tileset_world', ASSETS.TILESET_WORLD, TILE_SIZE, TILE_SIZE);

    // 1. Ground Layer (Grass, Paths, Flowers, Water)
    this._groundLayer = this._map.createBlankLayer('ground', tileset);
    const groundData = MapData.getGroundLayer();
    this._groundLayer.putTilesAt(groundData, 0, 0);
    this._groundLayer.setScale(WORLD_SCALE);
    this._groundLayer.setDepth(0);

    // Water is on the ground layer and should block the player
    this._groundLayer.setCollision([TILE.WATER, TILE.WATER_EDGE]);

    // 2. Objects Layer (Buildings, Trees, Fences, Signs, Statues)
    this._objectsLayer = this._map.createBlankLayer('objects', tileset);
    const objectsData = MapData.getObjectsLayer();
    this._objectsLayer.putTilesAt(objectsData, 0, 0);
    this._objectsLayer.setScale(WORLD_SCALE);
    this._objectsLayer.setDepth(5);

    // Enable collision on solid objects
    this._objectsLayer.setCollision(COLLIDABLE_TILES);
  }

  /**
   * Registers physics colliders between the player's sprite and collidable tilemap layers.
   * @param {Phaser.Physics.Arcade.Sprite} playerSprite
   */
  setupCollision(playerSprite) {
    if (!this._groundLayer || !this._objectsLayer) return;

    this._scene.physics.add.collider(playerSprite, this._groundLayer);
    this._scene.physics.add.collider(playerSprite, this._objectsLayer);
  }

  /**
   * Checks if a given tile coordinate is tall grass (used for wild encounters).
   * @param {number} tileX
   * @param {number} tileY
   * @returns {boolean}
   */
  isTallGrass(tileX, tileY) {
    const tile = this._groundLayer?.getTileAt(tileX, tileY);
    return tile !== null && tile !== undefined && tile.index === TILE.TALL_GRASS;
  }

  /**
   * Finds sign metadata at the given tile coordinate.
   * @param {number} tileX
   * @param {number} tileY
   * @returns {{ tileX: number, tileY: number, text: string } | null}
   */
  getSignAt(tileX, tileY) {
    return this._signs.find((s) => s.tileX === tileX && s.tileY === tileY) || null;
  }

  /**
   * Finds door metadata at the given tile coordinate.
   * @param {number} tileX
   * @param {number} tileY
   * @returns {{ tileX: number, tileY: number, name: string, targetScene: string } | null}
   */
  getDoorAt(tileX, tileY) {
    return this._doors.find((d) => d.tileX === tileX && d.tileY === tileY) || null;
  }

  /**
   * Returns whether a tile contains any solid obstacle.
   * @param {number} tileX
   * @param {number} tileY
   * @returns {boolean}
   */
  isTileSolid(tileX, tileY) {
    const groundTile = this._groundLayer?.getTileAt(tileX, tileY);
    if (groundTile && groundTile.collides) return true;

    const objectTile = this._objectsLayer?.getTileAt(tileX, tileY);
    if (objectTile && objectTile.collides) return true;

    return false;
  }

  get groundLayer() {
    return this._groundLayer;
  }

  get objectsLayer() {
    return this._objectsLayer;
  }

  get map() {
    return this._map;
  }
}

