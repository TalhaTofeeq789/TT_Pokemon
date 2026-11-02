/**
 * PlayerController.js
 *
 * Reads keyboard input and translates it into movement intent.
 *
 * DESIGN DECISION: The controller is separate from the Player class.
 *  - Player.js knows HOW to move (physics, animation, speed).
 *  - PlayerController.js knows WHEN and WHERE to move (input reading).
 *  - This separation makes it easy to swap control schemes (e.g., gamepad,
 *    touch joystick) without touching player logic.
 *
 * Returns a simple { dx, dy, interacting } object each frame.
 * dx/dy range: -1 (left/up), 0 (still), +1 (right/down)
 */

export default class PlayerController {
  /**
   * @param {Phaser.Scene} scene - The scene that owns this controller
   */
  constructor(scene) {
    this._scene = scene;

    // Arrow keys + WASD
    this._cursors = scene.input.keyboard.createCursorKeys();
    this._wasd = scene.input.keyboard.addKeys({
      up:    Phaser.Input.Keyboard.KeyCodes.W,
      down:  Phaser.Input.Keyboard.KeyCodes.S,
      left:  Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // Interaction key (Z, Space, or Enter)
    this._interactKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.Z
    );
    this._spaceKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this._enterKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ENTER
    );

    // Pause key (Escape)
    this._pauseKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );
  }

  /**
   * Called every frame by GameScene.
   * @returns {{ dx: number, dy: number, interacting: boolean, pausing: boolean }}
   */
  getInput() {
    const c = this._cursors;
    const w = this._wasd;

    let dx = 0;
    let dy = 0;

    // Horizontal movement (left takes priority over right if both pressed)
    if (Phaser.Input.Keyboard.JustDown(c.left)  || c.left.isDown  || w.left.isDown)  dx = -1;
    if (Phaser.Input.Keyboard.JustDown(c.right) || c.right.isDown || w.right.isDown) dx = 1;

    // Only allow horizontal OR vertical movement, not diagonal
    // (classic Pokémon style — no diagonal walking)
    if (dx === 0) {
      if (Phaser.Input.Keyboard.JustDown(c.up)   || c.up.isDown   || w.up.isDown)   dy = -1;
      if (Phaser.Input.Keyboard.JustDown(c.down) || c.down.isDown || w.down.isDown) dy = 1;
    }

    const interacting =
      Phaser.Input.Keyboard.JustDown(this._interactKey) ||
      Phaser.Input.Keyboard.JustDown(this._spaceKey) ||
      Phaser.Input.Keyboard.JustDown(this._enterKey);

    const pausing = Phaser.Input.Keyboard.JustDown(this._pauseKey);

    return { dx, dy, interacting, pausing };
  }

  /**
   * Disables all input (e.g., during dialogue or battle transition).
   */
  disable() {
    this._scene.input.keyboard.enabled = false;
  }

  /**
   * Re-enables input after a dialogue or transition ends.
   */
  enable() {
    this._scene.input.keyboard.enabled = true;
  }

  /**
   * Cleans up keyboard bindings.
   * Call when the scene shuts down.
   */
  destroy() {
    this._cursors = null;
    this._wasd = null;
  }
}

