/**
 * MainMenuScene.js
 * Phase 2: The main menu shown after the loading screen.
 *
 * Shows:
 *  - Game logo / title
 *  - Menu options: New Game, Continue, Exit
 *  - Animated background with floating particles
 *  - Keyboard and mouse/touch support
 */

import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants.js';

// Menu items and which scene/action they trigger
const MENU_ITEMS = [
  { label: 'NEW GAME',  action: 'new_game'  },
  { label: 'CONTINUE',  action: 'continue'  },
  { label: 'EXIT',      action: 'exit'      },
];

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.MAIN_MENU });
    this._selectedIndex = 0;
    this._menuItems = [];     // Phaser Text objects
    this._cursor = null;      // The ► arrow graphic
    this._canInput = false;
  }

  create() {
    this._createBackground();
    this._createTitle();
    this._createMenuItems();
    this._createCursor();
    this._setupInput();
    this._animateIn();
  }

  // ─── Background ────────────────────────────────────────────────────────────

  _createBackground() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Deep dark gradient background (drawn with rectangles for pixel-art feel)
    this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x0d1117);

    // Starfield
    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(0, GAME_HEIGHT);
      const size = Phaser.Math.Between(1, 3);
      const alpha = Phaser.Math.FloatBetween(0.3, 1.0);
      const star = this.add.rectangle(x, y, size, size, 0xffffff, alpha);

      // Twinkle animation
      this.tweens.add({
        targets: star,
        alpha: { from: alpha, to: alpha * 0.2 },
        duration: Phaser.Math.Between(800, 2500),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000),
        ease: 'Sine.easeInOut',
      });
    }

    // Bottom grass strip (decorative)
    this.add.rectangle(cx, GAME_HEIGHT - 30, GAME_WIDTH, 60, 0x1a3a1a);
    this.add.rectangle(cx, GAME_HEIGHT - 58, GAME_WIDTH, 6, 0x2d5a2d);

    // Floating Pokeball decoration (drawn with graphics)
    this._createPokeballDecor(120, 420, 0.25);
    this._createPokeballDecor(660, 380, 0.2);
    this._createPokeballDecor(740, 500, 0.15);
  }

  _createPokeballDecor(x, y, alpha) {
    const g = this.add.graphics({ alpha });
    const r = 40;
    // Top half (red)
    g.fillStyle(0xcc3333);
    g.fillCircle(x, y, r);
    // Bottom half (white) — draw over the top
    g.fillStyle(0xeeeeee);
    g.fillRect(x - r, y, r * 2, r);
    // Center band
    g.fillStyle(0x111111);
    g.fillRect(x - r, y - 4, r * 2, 8);
    // Center button
    g.fillStyle(0x111111);
    g.fillCircle(x, y, 10);
    g.fillStyle(0xffffff);
    g.fillCircle(x, y, 6);

    // Float animation
    this.tweens.add({
      targets: g,
      y: y - 12,
      duration: Phaser.Math.Between(2000, 3000),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: Phaser.Math.Between(0, 1000),
    });
  }

  // ─── Title ──────────────────────────────────────────────────────────────────

  _createTitle() {
    const cx = GAME_WIDTH / 2;

    // Shadow
    this.add.text(cx + 4, 94, 'POKÉMON RPG', {
      fontFamily: '"Press Start 2P"',
      fontSize: '36px',
      fill: '#000000',
    }).setOrigin(0.5);

    // Main title
    this._titleText = this.add.text(cx, 90, 'POKÉMON RPG', {
      fontFamily: '"Press Start 2P"',
      fontSize: '36px',
      fill: '#FFD700',
      stroke: '#8B4513',
      strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0);

    // Subtitle
    this._subtitleText = this.add.text(cx, 145, 'A 2D Adventure', {
      fontFamily: '"Press Start 2P"',
      fontSize: '13px',
      fill: '#87ceeb',
    }).setOrigin(0.5).setAlpha(0);

    // Version tag
    this.add.text(GAME_WIDTH - 10, GAME_HEIGHT - 10, 'v0.1.0', {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
      fill: '#444444',
    }).setOrigin(1, 1);
  }

  // ─── Menu items ─────────────────────────────────────────────────────────────

  _createMenuItems() {
    const cx = GAME_WIDTH / 2;
    const startY = 280;
    const spacing = 56;

    MENU_ITEMS.forEach((item, index) => {
      const txt = this.add.text(cx + 20, startY + index * spacing, item.label, {
        fontFamily: '"Press Start 2P"',
        fontSize: '18px',
        fill: '#ffffff',
      }).setOrigin(0.5).setAlpha(0);

      // Make it interactive (mouse/touch)
      txt.setInteractive({ useHandCursor: true });
      txt.on('pointerover', () => this._setSelection(index));
      txt.on('pointerdown', () => this._confirmSelection());

      this._menuItems.push(txt);
    });
  }

  _createCursor() {
    this._cursor = this.add.text(0, 0, '►', {
      fontFamily: '"Press Start 2P"',
      fontSize: '18px',
      fill: '#FFD700',
    }).setAlpha(0);

    // Bounce animation for cursor
    this.tweens.add({
      targets: this._cursor,
      x: `+=5`,
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  _updateCursor() {
    const cx = GAME_WIDTH / 2;
    const startY = 280;
    const spacing = 56;
    const selectedY = startY + this._selectedIndex * spacing;

    this._cursor.setPosition(cx - 90, selectedY);

    // Highlight selected, dim others
    this._menuItems.forEach((item, i) => {
      if (i === this._selectedIndex) {
        item.setStyle({ fill: '#FFD700' });
        item.setScale(1.05);
      } else {
        item.setStyle({ fill: '#aaaaaa' });
        item.setScale(1);
      }
    });
  }

  // ─── Input ──────────────────────────────────────────────────────────────────

  _setupInput() {
    const keys = this.input.keyboard.createCursorKeys();
    const wasd = this.input.keyboard.addKeys('W,S,SPACE,ENTER');

    this.input.keyboard.on('keydown', (event) => {
      if (!this._canInput) return;

      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          this._setSelection(
            (this._selectedIndex - 1 + MENU_ITEMS.length) % MENU_ITEMS.length
          );
          break;
        case 'ArrowDown':
        case 'KeyS':
          this._setSelection(
            (this._selectedIndex + 1) % MENU_ITEMS.length
          );
          break;
        case 'Enter':
        case 'Space':
        case 'KeyZ':
          this._confirmSelection();
          break;
      }
    });
  }

  _setSelection(index) {
    this._selectedIndex = index;
    this._updateCursor();
  }

  _confirmSelection() {
    if (!this._canInput) return;
    this._canInput = false;

    const selected = MENU_ITEMS[this._selectedIndex];

    // Flash the selected item
    this.tweens.add({
      targets: this._menuItems[this._selectedIndex],
      alpha: 0,
      duration: 80,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this._handleAction(selected.action);
      },
    });
  }

  _handleAction(action) {
    switch (action) {
      case 'new_game':
        // Fade out and launch the game world
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start(SCENES.GAME);
        });
        break;
      case 'continue':
        this._showComingSoon('Save/Load coming\nin Phase 11!');
        break;
      case 'exit':
        this._showComingSoon('Close the browser\ntab to exit.');
        break;
    }
  }

  _showComingSoon(message) {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Overlay
    const overlay = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.75);
    const msg = this.add.text(cx, cy, message, {
      fontFamily: '"Press Start 2P"',
      fontSize: '14px',
      fill: '#ffffff',
      align: 'center',
      lineSpacing: 10,
    }).setOrigin(0.5);

    const hint = this.add.text(cx, cy + 100, 'Press Z / ENTER to go back', {
      fontFamily: '"Press Start 2P"',
      fontSize: '9px',
      fill: '#aaaaaa',
    }).setOrigin(0.5);

    // Re-enable input to go back
    this.time.delayedCall(300, () => {
      this.input.keyboard.once('keydown', () => {
        overlay.destroy();
        msg.destroy();
        hint.destroy();
        this._canInput = true;
      });
    });
  }

  // ─── Entry animation ────────────────────────────────────────────────────────

  _animateIn() {
    // Title fades + slides in
    this.tweens.add({
      targets: this._titleText,
      alpha: 1,
      y: { from: 60, to: 90 },
      duration: 700,
      ease: 'Back.easeOut',
    });
    this.tweens.add({
      targets: this._subtitleText,
      alpha: 1,
      y: { from: 120, to: 145 },
      duration: 700,
      delay: 200,
      ease: 'Back.easeOut',
    });

    // Menu items stagger in
    this._menuItems.forEach((item, i) => {
      this.tweens.add({
        targets: item,
        alpha: 1,
        x: { from: GAME_WIDTH / 2 + 80, to: GAME_WIDTH / 2 + 20 },
        duration: 400,
        delay: 500 + i * 120,
        ease: 'Back.easeOut',
      });
    });

    // Cursor appears after all items
    this.time.delayedCall(500 + MENU_ITEMS.length * 120 + 100, () => {
      this._cursor.setAlpha(1);
      this._updateCursor();
      this._canInput = true;
    });

    // Title gentle float
    this.tweens.add({
      targets: this._titleText,
      y: 96,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 1000,
    });
  }
}
