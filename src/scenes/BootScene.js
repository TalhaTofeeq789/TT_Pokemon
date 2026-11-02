/**
 * BootScene.js
 * The very first scene that runs when the game starts.
 * Responsibility: set up global game settings and kick off the PreloadScene.
 * This scene runs instantly with no visible output.
 */

import { SCENES } from '../utils/Constants.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BOOT });
  }

  preload() {
    // Load only the assets needed to display the loading bar in PreloadScene.
    // Keep this minimal — heavy assets are loaded in PreloadScene.
  }

  create() {
    // Set global Phaser settings
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;

    // Move straight to the preload/loading screen
    this.scene.start(SCENES.PRELOAD);
  }
}
