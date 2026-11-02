/**
 * HealthBar.js
 *
 * Dedicated combat health bar component.
 * Displays Pokémon name, level, animated HP bar, and numeric HP counters.
 * Dynamically shifts color (Green -> Yellow -> Red) as HP depletes.
 */

export default class HealthBar {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {object} options
   * @param {boolean} [options.showNumbers=true]
   * @param {number} [options.barWidth=140]
   */
  constructor(scene, x, y, options = {}) {
    this._scene = scene;
    this._x = x;
    this._y = y;
    this._showNumbers = options.showNumbers !== false;
    this._barWidth = options.barWidth || 140;
    this._barHeight = 8;

    this._currentHp = 100;
    this._maxHp = 100;

    this._createUI();
  }

  _createUI() {
    this.container = this._scene.add.container(this._x, this._y).setDepth(30);

    const cardW = this._barWidth + 50;
    const cardH = this._showNumbers ? 56 : 42;

    // Background card panel
    const bg = this._scene.add.rectangle(0, 0, cardW, cardH, 0x1e293b, 0.95)
      .setStrokeStyle(2, 0x475569)
      .setOrigin(0, 0);

    // Name text
    this._nameText = this._scene.add.text(8, 7, 'POKEMON', {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
      fill: '#ffffff',
    });

    // Level text
    this._levelText = this._scene.add.text(cardW - 44, 7, 'Lv.5', {
      fontFamily: '"Press Start 2P"',
      fontSize: '7px',
      fill: '#facc15',
    });

    // "HP" label tag
    const hpTag = this._scene.add.text(8, 22, 'HP', {
      fontFamily: '"Press Start 2P"',
      fontSize: '6px',
      fill: '#f59e0b',
    });

    // HP Bar background track
    const barX = 28;
    const barY = 22;
    this._barBg = this._scene.add.rectangle(barX, barY, this._barWidth, this._barHeight, 0x334155)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x0f172a);

    // HP Bar Fill
    this._barFill = this._scene.add.rectangle(barX, barY, this._barWidth, this._barHeight, 0x22c55e)
      .setOrigin(0, 0);

    // Numerical HP text (e.g. "19 / 19 HP")
    if (this._showNumbers) {
      this._numText = this._scene.add.text(cardW - 8, 36, '100/100', {
        fontFamily: '"Press Start 2P"',
        fontSize: '7px',
        fill: '#cbd5e1',
      }).setOrigin(1, 0);
      this.container.add(this._numText);
    }

    this.container.add([bg, this._nameText, this._levelText, hpTag, this._barBg, this._barFill]);
  }

  /**
   * Initializes the bar with Pokémon data.
   * @param {Pokemon} pokemon
   */
  setPokemon(pokemon) {
    this._nameText.setText(pokemon.name.toUpperCase());
    this._levelText.setText(`Lv.${pokemon.level}`);
    this._currentHp = pokemon.currentHp;
    this._maxHp = pokemon.maxHp;

    this._updateBarVisuals(pokemon.currentHp, pokemon.maxHp, false);
  }

  /**
   * Updates health bar fill width and numeric text, with optional tween animation.
   * @param {number} newHp
   * @param {number} maxHp
   * @param {boolean} [animate=true]
   * @param {() => void} [onComplete]
   */
  animateHp(newHp, maxHp, animate = true, onComplete = null) {
    this._currentHp = Math.max(0, Math.min(maxHp, newHp));
    this._maxHp = maxHp;
    const ratio = maxHp > 0 ? this._currentHp / maxHp : 0;
    const targetWidth = Math.max(0, Math.floor(this._barWidth * ratio));

    const targetColor = this._getHpColor(ratio);

    if (!animate) {
      this._barFill.width = targetWidth;
      this._barFill.setFillStyle(targetColor);
      if (this._numText) this._numText.setText(`${this._currentHp}/${this._maxHp}`);
      if (onComplete) onComplete();
      return;
    }

    // Smooth tween down
    this._scene.tweens.add({
      targets: this._barFill,
      width: targetWidth,
      duration: 500,
      ease: 'Quad.easeOut',
      onUpdate: () => {
        const curRatio = this._barFill.width / this._barWidth;
        this._barFill.setFillStyle(this._getHpColor(curRatio));
        if (this._numText) {
          const currentVisualHp = Math.ceil(curRatio * this._maxHp);
          this._numText.setText(`${currentVisualHp}/${this._maxHp}`);
        }
      },
      onComplete: () => {
        this._barFill.setFillStyle(targetColor);
        if (this._numText) this._numText.setText(`${this._currentHp}/${this._maxHp}`);
        if (onComplete) onComplete();
      },
    });
  }

  _updateBarVisuals(hp, maxHp, animate = false) {
    this.animateHp(hp, maxHp, animate);
  }

  _getHpColor(ratio) {
    if (ratio > 0.5) return 0x22c55e; // Green
    if (ratio > 0.2) return 0xeab308; // Yellow
    return 0xef4444;                  // Red
  }

  destroy() {
    this.container.destroy();
  }
}

