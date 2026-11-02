/**
 * NPC.js
 *
 * Represents an interactive Non-Player Character in the world.
 *
 * Features:
 *  - Immovable arcade physics body with foot-based collision
 *  - Directional facing (down, up, left, right)
 *  - Automatically faces the player when talked to
 *  - Carries customizable multi-page dialogue sequences
 *  - Supports optional post-conversation actions (e.g. triggering starter selection)
 */

import { TILE_SIZE, WORLD_SCALE } from '../utils/Constants.js';
import { DIRECTION } from '../player/Player.js';

export default class NPC {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} tileX - Initial tile X coordinate
   * @param {number} tileY - Initial tile Y coordinate
   * @param {string} textureKey - Sprite texture key ('npc_oak', 'npc_mom', etc.)
   * @param {object} options
   * @param {string} options.id - Unique ID
   * @param {string} options.name - Display name (e.g. "Prof. Oak")
   * @param {string[]} options.dialogue - Array of dialogue pages
   * @param {string} [options.facing='down'] - Initial facing direction
   * @param {() => void} [options.onTalk] - Optional callback when conversation starts/ends
   */
  constructor(scene, tileX, tileY, textureKey, options = {}) {
    this._scene = scene;
    this._tileX = tileX;
    this._tileY = tileY;
    this._textureKey = textureKey;

    this.id = options.id || `npc_${tileX}_${tileY}`;
    this.name = options.name || 'Citizen';
    this.dialogue = options.dialogue || ['Hello there, trainer!'];
    this.onTalk = options.onTalk || null;

    this._facing = options.facing || DIRECTION.DOWN;
    this._initialFacing = this._facing;

    const pixelX = tileX * TILE_SIZE * WORLD_SCALE + (TILE_SIZE * WORLD_SCALE) / 2;
    const pixelY = tileY * TILE_SIZE * WORLD_SCALE + (TILE_SIZE * WORLD_SCALE) / 2;

    this.sprite = scene.physics.add.sprite(pixelX, pixelY, textureKey, 0);
    this.sprite.setDepth(10);
    this.sprite.setScale(2);
    this.sprite.setImmovable(true);
    this.sprite.body.moves = false;

    // Feet collision box matching player proportions
    this.sprite.setBodySize(10, 8);
    this.sprite.setOffset(3, 8);

    this._setupAnimations();
    this.setFacing(this._facing);
  }

  _setupAnimations() {
    const anims = this._scene.anims;
    const key = this._textureKey;

    // Avoid re-registering animations if already cached
    if (anims.exists(`${key}_idle_down`)) return;

    const dirRowMap = {
      [DIRECTION.DOWN]: 0,
      [DIRECTION.LEFT]: 1,
      [DIRECTION.RIGHT]: 2,
      [DIRECTION.UP]: 3,
    };

    Object.entries(dirRowMap).forEach(([dir, row]) => {
      anims.create({
        key: `${key}_idle_${dir}`,
        frames: [{ key, frame: row * 4 }],
        frameRate: 1,
        repeat: 0,
      });

      anims.create({
        key: `${key}_walk_${dir}`,
        frames: anims.generateFrameNumbers(key, {
          start: row * 4,
          end: row * 4 + 3,
        }),
        frameRate: 6,
        repeat: -1,
      });
    });
  }

  /**
   * Returns dialogue lines, evaluating if provided as a generator function.
   * @returns {string[]}
   */
  getDialogue() {
    if (typeof this.dialogue === 'function') {
      return this.dialogue();
    }
    return this.dialogue;
  }

  /**
   * Updates sprite visual to face the given direction.
   * @param {string} dir - 'down', 'up', 'left', 'right'
   */
  setFacing(dir) {
    this._facing = dir;
    this.sprite.anims.play(`${this._textureKey}_idle_${dir}`, true);
  }

  /**
   * Turns the NPC to face towards the player based on relative tile positions.
   * @param {number} playerTileX
   * @param {number} playerTileY
   */
  facePlayer(playerTileX, playerTileY) {
    const dx = playerTileX - this._tileX;
    const dy = playerTileY - this._tileY;

    if (Math.abs(dx) > Math.abs(dy)) {
      this.setFacing(dx > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT);
    } else {
      this.setFacing(dy > 0 ? DIRECTION.DOWN : DIRECTION.UP);
    }
  }

  /**
   * Resets facing direction to default spawn orientation.
   */
  resetFacing() {
    this.setFacing(this._initialFacing);
  }

  get tileX() {
    return this._tileX;
  }

  get tileY() {
    return this._tileY;
  }

  get facing() {
    return this._facing;
  }

  destroy() {
    this.sprite.destroy();
  }
}

