/**
 * Player.js
 *
 * The player character. Handles:
 *  - Physics-enabled sprite
 *  - 4-directional walking animations (down, up, left, right)
 *  - Speed, facing direction, and movement state
 *  - An interaction "reach" — a point just in front of the player
 *    used in Phase 5 to check if an NPC/sign is nearby
 *
 * DESIGN DECISION: Player does NOT read input directly.
 * GameScene calls player.move(dx, dy) with values from PlayerController.
 * This keeps the Player pure: it only knows how to represent and move
 * a character, not what keys are pressed.
 */

import { PLAYER_SPEED, TILE_SIZE, WORLD_SCALE } from '../utils/Constants.js';

// Directions as strings — used for animation keys and facing state
export const DIRECTION = {
  DOWN:  'down',
  UP:    'up',
  LEFT:  'left',
  RIGHT: 'right',
};

// Maps direction → spritesheet row (matches SpriteGenerator layout)
const DIR_ROW = {
  [DIRECTION.DOWN]:  0,
  [DIRECTION.LEFT]:  1,
  [DIRECTION.RIGHT]: 2,
  [DIRECTION.UP]:    3,
};

export default class Player {
  /**
   * @param {Phaser.Scene} scene     - The owning scene
   * @param {number}       x         - Starting world X (pixels)
   * @param {number}       y         - Starting world Y (pixels)
   */
  constructor(scene, x, y) {
    this._scene = scene;

    // Create physics-enabled sprite
    this.sprite = scene.physics.add.sprite(x, y, 'player', 0);
    this.sprite.setDepth(10);            // Draw above floor tiles
    this.sprite.setScale(2);             // Scale 16px → 32px on screen
    this.sprite.setCollideWorldBounds(true);

    // Shrink the physics body to just the feet
    // (makes collision feel more natural — head can overlap objects)
    this.sprite.setBodySize(10, 8);
    this.sprite.setOffset(3, 8);

    this._facing = DIRECTION.DOWN;
    this._isMoving = false;
    this._speed = PLAYER_SPEED;

    this._createAnimations();
  }

  // ─── Animations ─────────────────────────────────────────────────────────────

  /**
   * Creates all 4 directional walk animations in Phaser's animation manager.
   * Animation keys: 'walk_down', 'walk_up', 'walk_left', 'walk_right'
   * Each animation cycles through 4 frames (columns 0-3 of its spritesheet row).
   */
  _createAnimations() {
    const anims = this._scene.anims;

    // Avoid re-creating if the scene was restarted
    if (anims.exists('walk_down')) return;

    Object.values(DIRECTION).forEach((dir) => {
      const row = DIR_ROW[dir];
      anims.create({
        key: `walk_${dir}`,
        frames: anims.generateFrameNumbers('player', {
          start: row * 4,       // First frame of this row
          end:   row * 4 + 3,   // Last frame of this row
        }),
        frameRate: 8,           // 8 fps — classic Pokémon walking speed
        repeat: -1,             // Loop forever while moving
      });

      // Idle animation: just the first frame of each direction (no loop)
      anims.create({
        key: `idle_${dir}`,
        frames: [{ key: 'player', frame: row * 4 }],
        frameRate: 1,
        repeat: 0,
      });
    });
  }

  // ─── Movement ────────────────────────────────────────────────────────────────

  /**
   * Called every frame by GameScene with input from PlayerController.
   * @param {number} dx - Horizontal direction: -1, 0, or 1
   * @param {number} dy - Vertical direction: -1, 0, or 1
   */
  move(dx, dy) {
    const body = this.sprite.body;

    if (dx !== 0 || dy !== 0) {
      // Determine facing direction
      if (dx < 0)      this._facing = DIRECTION.LEFT;
      else if (dx > 0) this._facing = DIRECTION.RIGHT;
      else if (dy < 0) this._facing = DIRECTION.UP;
      else if (dy > 0) this._facing = DIRECTION.DOWN;

      // Apply velocity
      body.setVelocity(dx * this._speed, dy * this._speed);

      // Play walk animation for current direction
      this.sprite.anims.play(`walk_${this._facing}`, true);
      this._isMoving = true;
    } else {
      // Stop moving
      body.setVelocity(0, 0);

      if (this._isMoving) {
        // Show idle frame — same direction they were walking
        this.sprite.anims.play(`idle_${this._facing}`, true);
        this._isMoving = false;
      }
    }
  }

  /**
   * Stops all movement immediately (used during dialogue, transitions, etc.)
   */
  stopMovement() {
    this.sprite.body.setVelocity(0, 0);
    this.sprite.anims.play(`idle_${this._facing}`, true);
    this._isMoving = false;
  }

  // ─── Interaction helpers ─────────────────────────────────────────────────────

  /**
   * Returns current grid tile coordinate of player.
   */
  getTilePosition() {
    const tileSize = TILE_SIZE * WORLD_SCALE;
    return {
      x: Math.floor(this.sprite.x / tileSize),
      y: Math.floor(this.sprite.y / tileSize),
    };
  }

  /**
   * Returns grid tile coordinate directly in front of the player based on facing direction.
   */
  getFacingTilePosition() {
    const current = this.getTilePosition();
    switch (this._facing) {
      case DIRECTION.DOWN:  return { x: current.x, y: current.y + 1 };
      case DIRECTION.UP:    return { x: current.x, y: current.y - 1 };
      case DIRECTION.LEFT:  return { x: current.x - 1, y: current.y };
      case DIRECTION.RIGHT: return { x: current.x + 1, y: current.y };
      default:              return current;
    }
  }

  /**
   * Returns the pixel position one tile in front of the player.
   * Used by GameScene to check if an NPC/sign is at that position.
   * @returns {{ x: number, y: number }}
   */
  getInteractionPoint() {
    const px = this.sprite.x;
    const py = this.sprite.y;
    const reach = TILE_SIZE * WORLD_SCALE; // 1 tile in front

    switch (this._facing) {
      case DIRECTION.DOWN:  return { x: px,         y: py + reach };
      case DIRECTION.UP:    return { x: px,         y: py - reach };
      case DIRECTION.LEFT:  return { x: px - reach, y: py };
      case DIRECTION.RIGHT: return { x: px + reach, y: py };
      default:              return { x: px,         y: py };
    }
  }

  // ─── Getters ─────────────────────────────────────────────────────────────────

  get x()       { return this.sprite.x; }
  get y()       { return this.sprite.y; }
  get facing()  { return this._facing; }
  get isMoving(){ return this._isMoving; }

  /**
   * Sets exact world position (used when loading a save or entering a door).
   */
  setPosition(x, y) {
    this.sprite.setPosition(x, y);
  }

  /**
   * Cleanup — destroy the sprite when the scene closes.
   */
  destroy() {
    this.sprite.destroy();
  }
}

