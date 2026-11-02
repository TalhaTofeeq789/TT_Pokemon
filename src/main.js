/**
 * main.js
 * The entry point for the Pokémon RPG game.
 *
 * Responsibility:
 *  - Create the Phaser.Game instance with all configuration.
 *  - Register all scenes in the correct order.
 *  - The first scene in the list (BootScene) starts automatically.
 *
 * Design decision: All scenes are registered here, even ones
 * not yet implemented. This way, scene.start() calls in early scenes
 * won't throw "unknown scene" errors — we just need to add the scene
 * class content in the appropriate phase.
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './utils/Constants.js';

// ── Import all Scenes ──────────────────────────────────────────────────────
import BootScene          from './scenes/BootScene.js';
import PreloadScene       from './scenes/PreloadScene.js';
import MainMenuScene      from './scenes/MainMenuScene.js';
import GameScene          from './scenes/GameScene.js';          // Phase 3-5
import StarterSelectScene from './scenes/StarterSelectScene.js'; // Phase 6
import BattleScene        from './scenes/BattleScene.js';        // Phase 7

// ── Phaser Game Configuration ──────────────────────────────────────────────
const config = {
  type: Phaser.AUTO,           // Use WebGL if available, fall back to Canvas
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',    // The <div id="game-container"> in index.html
  backgroundColor: '#0d1117',

  // Pixel-art scaling — keeps sprites sharp when scaled
  pixelArt: true,
  antialias: false,
  roundPixels: true,

  // Physics — will be used for player movement in Phase 3
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },      // Top-down game: no gravity
      debug: false,            // Set to true to see collision boxes during dev
    },
  },

  // Scale settings — center the game in the browser window
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  // Register all scenes. Order matters: BootScene starts first.
  scene: [
    BootScene,
    PreloadScene,
    MainMenuScene,
    GameScene,             // Phase 3-5 — world exploration
    StarterSelectScene,    // Phase 6 — starter selection
    BattleScene,           // Phase 7 — turn-based wild battles
    // The following scenes will be implemented in later phases:
    // PartyScene     (Phase 9)
    // InventoryScene (Phase 9)
    // PauseScene     (Phase 10)
  ],
};

// ── Create and export the game instance ───────────────────────────────────
const game = new Phaser.Game(config);

export default game;
