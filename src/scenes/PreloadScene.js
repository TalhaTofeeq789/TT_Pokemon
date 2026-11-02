/**
 * PreloadScene.js
 * Shows a pixel-art style loading screen with a progress bar.
 * Loads ALL game assets here so every other scene can use them instantly.
 * After loading completes, transitions to the MainMenuScene.
 */

import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants.js';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.PRELOAD });
  }

  preload() {
    this._createLoadingUI();
    this._registerLoadEvents();
    this._loadAssets();
  }

  /**
   * Draws the loading bar background and progress panel.
   * All coordinates are relative to the center of the screen.
   */
  _createLoadingUI() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Dark background
    this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x0d1117);

    // Pokemon-style logo text
    const titleText = this.add.text(cx, cy - 120, 'POKÉMON RPG', {
      fontFamily: '"Press Start 2P"',
      fontSize: '28px',
      fill: '#FFD700',
      stroke: '#000000',
      strokeThickness: 6,
      shadow: { offsetX: 4, offsetY: 4, color: '#000000', blur: 0, fill: true },
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(cx, cy - 70, 'A 2D Adventure', {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      fill: '#aaaaaa',
    }).setOrigin(0.5);

    // Loading bar border
    const barWidth = 400;
    const barHeight = 24;
    const barX = cx - barWidth / 2;
    const barY = cy + 40;

    this.add.rectangle(cx, barY + barHeight / 2, barWidth + 6, barHeight + 6, 0xffffff)
      .setOrigin(0.5);

    // Loading bar background
    this.add.rectangle(cx, barY + barHeight / 2, barWidth, barHeight, 0x222222)
      .setOrigin(0.5);

    // The progress fill — starts at zero width
    this._progressBar = this.add.rectangle(
      barX, barY, 0, barHeight, 0xFFD700
    ).setOrigin(0, 0);

    // Loading percentage text
    this._loadText = this.add.text(cx, barY + barHeight + 20, 'Loading... 0%', {
      fontFamily: '"Press Start 2P"',
      fontSize: '10px',
      fill: '#ffffff',
    }).setOrigin(0.5, 0);

    // Animate the title with a gentle pulse
    this.tweens.add({
      targets: titleText,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * Listens to Phaser's built-in loader events to update the progress bar.
   */
  _registerLoadEvents() {
    this.load.on('progress', (value) => {
      const barWidth = 400;
      this._progressBar.width = barWidth * value;
      this._loadText.setText(`Loading... ${Math.round(value * 100)}%`);
    });

    this.load.on('complete', () => {
      this._loadText.setText('Press any key to start!');
    });
  }

  /**
   * Registers all game assets.
   * Each asset gets a unique string key (defined in Constants.js).
   *
   * In Phase 1, we load placeholder/generated assets.
   * Real sprites and maps are added in later phases.
   */
  _loadAssets() {
    // ── Placeholder graphics (generated procedurally in create()) ──
    // Real spritesheets, tilemaps, and audio are added in phases 3–5.
    // For now we register nothing so Phaser's loader completes instantly.
  }

  create() {
    // Small delay so the player can see "Loading... 100%" before moving on.
    this.time.delayedCall(600, () => {
      this.scene.start(SCENES.MAIN_MENU);
    });
  }
}
