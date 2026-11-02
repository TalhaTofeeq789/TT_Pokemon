/**
 * GameMenu.js
 *
 * Slide-out top-right RPG pause menu for exploration mode.
 * Provides access to:
 *  - POKÉMON (Party screen)
 *  - BAG (Inventory screen)
 *  - TRAINER (Trainer card)
 *  - SAVE (Save progress)
 *  - CLOSE (Resume exploration)
 */

import { GAME_WIDTH } from '../utils/Constants.js';

export const MENU_OPTIONS = [
  { id: 'pokemon', label: 'POKÉMON' },
  { id: 'bag',     label: 'BAG' },
  { id: 'trainer', label: 'TRAINER' },
  { id: 'save',    label: 'SAVE' },
  { id: 'close',   label: 'CLOSE' },
];

export default class GameMenu {
  /**
   * @param {Phaser.Scene} scene
   * @param {object} callbacks
   */
  constructor(scene, callbacks = {}) {
    this._scene = scene;
    this._callbacks = callbacks;
    this._isOpen = false;
    this._selectedIndex = 0;
    this._menuButtons = [];

    this._createUI();
    this.hide();
  }

  _createUI() {
    const menuW = 180;
    const menuH = 200;
    const menuX = GAME_WIDTH - menuW / 2 - 16;
    const menuY = menuH / 2 + 16;

    this.container = this._scene.add.container(menuX, menuY)
      .setScrollFactor(0)
      .setDepth(900);

    // Drop shadow
    const shadow = this._scene.add.rectangle(4, 4, menuW, menuH, 0x000000, 0.5);

    // Frame background
    const bg = this._scene.add.rectangle(0, 0, menuW, menuH, 0x1e293b, 0.98)
      .setStrokeStyle(3, 0x475569);

    // Inner panel
    const inner = this._scene.add.rectangle(0, 0, menuW - 10, menuH - 10, 0x0f172a)
      .setStrokeStyle(1, 0x334155);

    this.container.add([shadow, bg, inner]);

    // Menu options
    const startY = -menuH / 2 + 28;
    const spacing = 34;

    MENU_OPTIONS.forEach((opt, idx) => {
      const y = startY + idx * spacing;
      const text = this._scene.add.text(-menuW / 2 + 24, y, opt.label, {
        fontFamily: '"Press Start 2P"',
        fontSize: '10px',
        fill: idx === 0 ? '#facc15' : '#cbd5e1',
      }).setOrigin(0, 0.5);

      this._menuButtons.push(text);
      this.container.add(text);
    });
  }

  open() {
    this._isOpen = true;
    this._selectedIndex = 0;
    this._updateVisuals();
    this.container.setVisible(true);
    this.container.setAlpha(1);
  }

  hide() {
    this._isOpen = false;
    this.container.setVisible(false);
  }

  handleInput(event) {
    if (!this._isOpen) return false;

    if (event.code === 'ArrowDown' || event.code === 'KeyS') {
      this._selectedIndex = (this._selectedIndex + 1) % MENU_OPTIONS.length;
      this._updateVisuals();
      return true;
    } else if (event.code === 'ArrowUp' || event.code === 'KeyW') {
      this._selectedIndex = (this._selectedIndex - 1 + MENU_OPTIONS.length) % MENU_OPTIONS.length;
      this._updateVisuals();
      return true;
    } else if (event.code === 'Enter' || event.code === 'Space' || event.code === 'KeyZ') {
      this._confirmSelection();
      return true;
    } else if (event.code === 'Escape' || event.code === 'KeyX') {
      this.hide();
      if (this._callbacks.onClose) this._callbacks.onClose();
      return true;
    }

    return false;
  }

  _updateVisuals() {
    this._menuButtons.forEach((btn, idx) => {
      const isSelected = idx === this._selectedIndex;
      btn.setText((isSelected ? '► ' : '  ') + MENU_OPTIONS[idx].label);
      btn.setStyle({ fill: isSelected ? '#facc15' : '#cbd5e1' });
    });
  }

  _confirmSelection() {
    const selected = MENU_OPTIONS[this._selectedIndex];
    this.hide();

    if (this._callbacks.onSelect) {
      this._callbacks.onSelect(selected.id);
    }
  }

  isOpen() {
    return this._isOpen;
  }

  destroy() {
    this.container.destroy();
  }
}

