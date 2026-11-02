/**
 * DialogueBox.js
 *
 * Classic Pokémon-style dialogue window rendered at the bottom of the screen.
 *
 * Features:
 *  - Fixed viewport position (setScrollFactor(0))
 *  - High visual polish: double-bordered frame with speaker badge
 *  - Typewriter text effect for natural RPG feel
 *  - Skip typing: pressing interact key while typing reveals the rest of the page instantly
 *  - Multi-page dialogue: advances on interaction key (Z / Space / Enter)
 *  - Animated blinking prompt indicator (▼) when ready for input
 *  - Calls onComplete callback when closed to resume gameplay
 */

import { GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants.js';

export default class DialogueBox {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this._scene = scene;

    this._isOpen = false;
    this._pages = [];
    this._currentPageIndex = 0;
    this._onComplete = null;

    // Typewriter variables
    this._fullText = '';
    this._displayedText = '';
    this._charIndex = 0;
    this._typeTimer = null;
    this._isTyping = false;
    this._typeSpeed = 22; // ms per character

    this._createUI();
    this.hide();
  }

  _createUI() {
    const boxW = GAME_WIDTH - 48;
    const boxH = 130;
    const boxX = GAME_WIDTH / 2;
    const boxY = GAME_HEIGHT - boxH / 2 - 20;

    // Main UI container (high depth so it renders above world & overlays)
    this._container = this._scene.add.container(boxX, boxY)
      .setScrollFactor(0)
      .setDepth(1000);

    // 1. Box background & borders
    // Outer drop shadow
    const shadow = this._scene.add.rectangle(4, 4, boxW, boxH, 0x000000, 0.45);

    // Outer dark border
    const outerBorder = this._scene.add.rectangle(0, 0, boxW, boxH, 0x1e293b)
      .setStrokeStyle(3, 0x0f172a);

    // Inner box fill
    const innerBox = this._scene.add.rectangle(0, 0, boxW - 10, boxH - 10, 0xffffff)
      .setStrokeStyle(2, 0x94a3b8);

    // 2. Speaker Name Badge (top-left tab)
    this._badgeBg = this._scene.add.rectangle(-boxW / 2 + 100, -boxH / 2, 170, 26, 0x2563eb)
      .setStrokeStyle(2, 0x1e3a8a);
    this._badgeText = this._scene.add.text(-boxW / 2 + 100, -boxH / 2, 'SPEAKER', {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
      fill: '#ffffff',
    }).setOrigin(0.5);

    // 3. Dialogue Text Area
    const textStartX = -boxW / 2 + 24;
    const textStartY = -boxH / 2 + 28;

    this._dialogueText = this._scene.add.text(textStartX, textStartY, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '11px',
      fill: '#1e293b',
      lineSpacing: 10,
      wordWrap: { width: boxW - 56 },
    });

    // 4. Blinking Advance Arrow (▼)
    this._arrow = this._scene.add.text(boxW / 2 - 32, boxH / 2 - 26, '▼', {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      fill: '#dc2626',
    }).setOrigin(0.5);

    // Arrow bounce animation
    this._scene.tweens.add({
      targets: this._arrow,
      y: boxH / 2 - 22,
      duration: 350,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this._container.add([
      shadow,
      outerBorder,
      innerBox,
      this._badgeBg,
      this._badgeText,
      this._dialogueText,
      this._arrow,
    ]);
  }

  /**
   * Opens the dialogue box with a given speaker and page array.
   * @param {string} speaker - Name of speaker (e.g. "PROF. OAK") or empty string
   * @param {string | string[]} textOrPages - Dialogue page or array of pages
   * @param {() => void} [onComplete] - Callback fired when dialog finishes
   */
  show(speaker, textOrPages, onComplete = null) {
    this._pages = Array.isArray(textOrPages) ? textOrPages : [textOrPages];
    this._currentPageIndex = 0;
    this._onComplete = onComplete;
    this._isOpen = true;

    // Update speaker badge
    if (speaker && speaker.trim() !== '') {
      this._badgeText.setText(speaker.toUpperCase());
      const badgeW = Math.max(120, speaker.length * 12 + 24);
      this._badgeBg.setSize(badgeW, 26);
      this._badgeBg.setVisible(true);
      this._badgeText.setVisible(true);
    } else {
      this._badgeBg.setVisible(false);
      this._badgeText.setVisible(false);
    }

    this._container.setVisible(true);
    this._container.setAlpha(1);

    this._displayCurrentPage();
  }

  _displayCurrentPage() {
    this._fullText = this._pages[this._currentPageIndex] || '';
    this._displayedText = '';
    this._charIndex = 0;
    this._isTyping = true;
    this._arrow.setVisible(false);

    this._dialogueText.setText('');

    // Cancel existing timer
    if (this._typeTimer) {
      this._typeTimer.remove();
    }

    // Typewriter timer
    this._typeTimer = this._scene.time.addEvent({
      delay: this._typeSpeed,
      callback: this._typeNextChar,
      callbackScope: this,
      loop: true,
    });
  }

  _typeNextChar() {
    if (this._charIndex < this._fullText.length) {
      this._displayedText += this._fullText[this._charIndex];
      this._dialogueText.setText(this._displayedText);
      this._charIndex++;
    } else {
      this._finishTyping();
    }
  }

  _finishTyping() {
    if (this._typeTimer) {
      this._typeTimer.remove();
      this._typeTimer = null;
    }
    this._displayedText = this._fullText;
    this._dialogueText.setText(this._fullText);
    this._isTyping = false;
    this._arrow.setVisible(true);
  }

  /**
   * Advances the dialogue:
   * If still typing, immediately prints entire page.
   * If page finished, advances to next page or finishes dialogue.
   */
  advance() {
    if (!this._isOpen) return;

    if (this._isTyping) {
      this._finishTyping();
      return;
    }

    this._currentPageIndex++;

    if (this._currentPageIndex < this._pages.length) {
      this._displayCurrentPage();
    } else {
      this.hide();
      if (this._onComplete) {
        const cb = this._onComplete;
        this._onComplete = null;
        cb();
      }
    }
  }

  hide() {
    if (this._typeTimer) {
      this._typeTimer.remove();
      this._typeTimer = null;
    }
    this._isOpen = false;
    this._isTyping = false;
    this._container.setVisible(false);
  }

  isOpen() {
    return this._isOpen;
  }

  isTyping() {
    return this._isTyping;
  }

  destroy() {
    if (this._typeTimer) this._typeTimer.remove();
    this._container.destroy();
  }
}

