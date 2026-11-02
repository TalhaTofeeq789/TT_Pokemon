/**
 * StarterSelectScene.js
 *
 * Phase 6: Starter Pokémon Selection Screen
 *
 * Allows the player to inspect and choose their first companion:
 *  - 🌿 Bulbasaur (Seed Pokémon | Grass/Poison)
 *  - 🔥 Charmander (Lizard Pokémon | Fire)
 *  - 💧 Squirtle (Tiny Turtle Pokémon | Water)
 *
 * Features:
 *  - Interactive 3-way carousel with keyboard navigation
 *  - 4x scaled animated Pokémon pixel-art preview
 *  - Detailed stat cards (Type badges, base stats, starter moves, Dex lore)
 *  - Confirmation dialogue before committing to the party
 */

import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants.js';
import { POKEMON_SPECIES, getSpecies } from '../pokemon/PokemonDatabase.js';
import { TYPE_COLORS } from '../pokemon/PokemonType.js';
import Pokemon from '../pokemon/Pokemon.js';
import SpriteGenerator from '../utils/SpriteGenerator.js';

const STARTER_OPTIONS = ['bulbasaur', 'charmander', 'squirtle'];

export default class StarterSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.STARTER_SELECT });

    this._selectedIndex = 0;
    this._confirming = false;
    this._confirmChoice = 0; // 0 = YES, 1 = NO
    this._playerParty = null;
    this._onComplete = null;
  }

  init(data) {
    this._playerParty = data?.party || null;
    this._onComplete = data?.onComplete || null;
    this._selectedIndex = 1; // Default to center (Charmander)
    this._confirming = false;
  }

  create() {
    SpriteGenerator.generateAll(this);

    this._createBackground();
    this._createHeader();
    this._createStarterPedestals();
    this._createPokemonPreview();
    this._createDetailsCard();
    this._createConfirmModal();
    this._setupInput();

    this._updateSelection();
    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  // ─── Visual Layout ──────────────────────────────────────────────────────────

  _createBackground() {
    // Lab interior gradient background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0f172a);

    // Floor tiles pattern
    const g = this.add.graphics();
    g.lineStyle(1, 0x1e293b, 0.6);
    for (let x = 0; x < GAME_WIDTH; x += 32) {
      g.lineBetween(x, 0, x, GAME_HEIGHT);
    }
    for (let y = 0; y < GAME_HEIGHT; y += 32) {
      g.lineBetween(0, y, GAME_WIDTH, y);
    }

    // Lab desk top mat
    this.add.rectangle(GAME_WIDTH / 2, 210, 720, 150, 0x1e293b)
      .setStrokeStyle(3, 0x334155);
  }

  _createHeader() {
    this.add.text(GAME_WIDTH / 2, 34, "PROF. OAK'S RESEARCH LAB", {
      fontFamily: '"Press Start 2P"',
      fontSize: '15px',
      fill: '#fde047',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 60, 'Choose your first Pokémon companion!', {
      fontFamily: '"Press Start 2P"',
      fontSize: '9px',
      fill: '#94a3b8',
    }).setOrigin(0.5);
  }

  _createStarterPedestals() {
    this._pedestals = [];
    const spacing = 220;
    const startX = GAME_WIDTH / 2 - spacing;
    const y = 210;

    STARTER_OPTIONS.forEach((key, i) => {
      const x = startX + i * spacing;
      const container = this.add.container(x, y);

      // Pedestal base ring
      const base = this.add.ellipse(0, 40, 90, 30, 0x0f172a)
        .setStrokeStyle(2, 0x475569);

      // Pedestal column
      const col = this.add.rectangle(0, 15, 60, 45, 0x334155)
        .setStrokeStyle(2, 0x64748b);

      // Pokéball icon
      const ball = this.add.image(0, -10, 'pokeball_item').setScale(1.2);

      // Selection glow ring
      const glow = this.add.ellipse(0, 40, 100, 36, 0xfacc15, 0.4)
        .setVisible(false);

      // Name label
      const species = getSpecies(key);
      const label = this.add.text(0, 58, species.name.toUpperCase(), {
        fontFamily: '"Press Start 2P"',
        fontSize: '9px',
        fill: '#ffffff',
      }).setOrigin(0.5);

      container.add([glow, col, base, ball, label]);
      container._glow = glow;
      container._ball = ball;
      container._label = label;

      this._pedestals.push(container);
    });
  }

  _createPokemonPreview() {
    // Large center preview of the selected Pokémon
    this._previewSprite = this.add.sprite(GAME_WIDTH / 2, 170, 'poke_charmander')
      .setScale(3.5)
      .setDepth(20);

    // Subtle breathing/bounce animation
    this.tweens.add({
      targets: this._previewSprite,
      y: 165,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  _createDetailsCard() {
    const cardW = 720;
    const cardH = 240;
    const cardX = GAME_WIDTH / 2;
    const cardY = 440;

    this._detailsCard = this.add.container(cardX, cardY);

    // Background card panel
    const bg = this.add.rectangle(0, 0, cardW, cardH, 0x1e293b, 0.95)
      .setStrokeStyle(3, 0x475569);

    // Left Column: Name, Category, Typing pills
    this._cardName = this.add.text(-cardW / 2 + 30, -cardH / 2 + 25, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '16px',
      fill: '#facc15',
    });

    this._cardCategory = this.add.text(-cardW / 2 + 30, -cardH / 2 + 55, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
      fill: '#94a3b8',
    });

    this._typeBadge1 = this.add.rectangle(-cardW / 2 + 65, -cardH / 2 + 85, 90, 22, 0x78c850);
    this._typeText1 = this.add.text(-cardW / 2 + 65, -cardH / 2 + 85, 'GRASS', {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
      fill: '#ffffff',
    }).setOrigin(0.5);

    this._typeBadge2 = this.add.rectangle(-cardW / 2 + 165, -cardH / 2 + 85, 90, 22, 0xa040a0);
    this._typeText2 = this.add.text(-cardW / 2 + 165, -cardH / 2 + 85, 'POISON', {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
      fill: '#ffffff',
    }).setOrigin(0.5);

    // Lore Description
    this._cardLore = this.add.text(-cardW / 2 + 30, -cardH / 2 + 115, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
      fill: '#cbd5e1',
      lineSpacing: 8,
      wordWrap: { width: 330 },
    });

    // Right Column: Starting Moves & Base Stats
    const rightColX = 70;

    this.add.text(rightColX, -cardH / 2 + 25, 'STARTING MOVES:', {
      fontFamily: '"Press Start 2P"',
      fontSize: '9px',
      fill: '#38bdf8',
    });

    this._movesText = this.add.text(rightColX, -cardH / 2 + 45, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
      fill: '#f1f5f9',
      lineSpacing: 6,
    });

    this.add.text(rightColX, -cardH / 2 + 115, 'BASE STATS:', {
      fontFamily: '"Press Start 2P"',
      fontSize: '9px',
      fill: '#38bdf8',
    });

    this._statsText = this.add.text(rightColX, -cardH / 2 + 135, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
      fill: '#f1f5f9',
      lineSpacing: 6,
    });

    // Bottom prompt
    const hint = this.add.text(0, cardH / 2 - 20, '◄ ► / A D: Switch   •   Z / Space / Enter: Choose', {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
      fill: '#fde047',
    }).setOrigin(0.5);

    this._detailsCard.add([
      bg,
      this._cardName,
      this._cardCategory,
      this._typeBadge1,
      this._typeText1,
      this._typeBadge2,
      this._typeText2,
      this._cardLore,
      hint,
      this._movesText,
      this._statsText,
    ]);
  }

  _createConfirmModal() {
    this._confirmModal = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2)
      .setDepth(100)
      .setVisible(false);

    const overlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);

    const dialogBg = this.add.rectangle(0, 0, 480, 180, 0x1e293b)
      .setStrokeStyle(3, 0xfacc15);

    this._confirmTitle = this.add.text(0, -45, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '11px',
      fill: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);

    this._btnYes = this.add.text(-80, 30, '► YES', {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      fill: '#facc15',
    }).setOrigin(0.5);

    this._btnNo = this.add.text(80, 30, '  NO', {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      fill: '#94a3b8',
    }).setOrigin(0.5);

    this._confirmModal.add([
      overlay,
      dialogBg,
      this._confirmTitle,
      this._btnYes,
      this._btnNo,
    ]);
  }

  // ─── Input Handling ──────────────────────────────────────────────────────────

  _setupInput() {
    this.input.keyboard.on('keydown', (event) => {
      if (this._confirming) {
        if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
          this._confirmChoice = 0;
          this._updateConfirmButtons();
        } else if (event.code === 'ArrowRight' || event.code === 'KeyD') {
          this._confirmChoice = 1;
          this._updateConfirmButtons();
        } else if (event.code === 'Enter' || event.code === 'Space' || event.code === 'KeyZ') {
          this._handleConfirmInput();
        } else if (event.code === 'Escape' || event.code === 'KeyX') {
          this._cancelConfirm();
        }
        return;
      }

      if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
        this._selectedIndex = (this._selectedIndex - 1 + STARTER_OPTIONS.length) % STARTER_OPTIONS.length;
        this._updateSelection();
      } else if (event.code === 'ArrowRight' || event.code === 'KeyD') {
        this._selectedIndex = (this._selectedIndex + 1) % STARTER_OPTIONS.length;
        this._updateSelection();
      } else if (event.code === 'Enter' || event.code === 'Space' || event.code === 'KeyZ') {
        this._openConfirmModal();
      }
    });
  }

  // ─── Selection Updates ───────────────────────────────────────────────────────

  _updateSelection() {
    const key = STARTER_OPTIONS[this._selectedIndex];
    const species = getSpecies(key);

    // Update pedestals visuals
    this._pedestals.forEach((p, idx) => {
      const isSelected = idx === this._selectedIndex;
      if (p._glow) p._glow.setVisible(isSelected);
      if (p._label) p._label.setStyle({ fill: isSelected ? '#facc15' : '#64748b' });
      p.setScale(isSelected ? 1.08 : 0.95);
    });

    // Update center preview sprite
    this._previewSprite.setTexture(species.spriteKey);
    this._previewSprite.setX(this._pedestals[this._selectedIndex].x);

    // Update details card
    this._cardName.setText(`#00${species.dexNumber} ${species.name.toUpperCase()}`);
    this._cardCategory.setText(`The ${species.category}`);
    this._cardLore.setText(species.description);

    // Type badges
    const c1 = TYPE_COLORS[species.type1] || 0x78c850;
    this._typeBadge1.setFillStyle(c1);
    this._typeText1.setText(species.type1);

    if (species.type2) {
      const c2 = TYPE_COLORS[species.type2] || 0xa040a0;
      this._typeBadge2.setVisible(true);
      this._typeText2.setVisible(true);
      this._typeBadge2.setFillStyle(c2);
      this._typeText2.setText(species.type2);
    } else {
      this._typeBadge2.setVisible(false);
      this._typeText2.setVisible(false);
    }

    // Moves list
    const movesList = species.starterMoves
      .map((m) => `• ${m.replace('_', ' ').toUpperCase()}`)
      .join('\n');
    this._movesText.setText(movesList);

    // Stats
    const b = species.baseStats;
    this._statsText.setText(
      `HP: ${b.hp}    ATK: ${b.attack}   DEF: ${b.defense}\n` +
      `SP.ATK: ${b.spAttack}   SP.DEF: ${b.spDefense}   SPD: ${b.speed}`
    );
  }

  _openConfirmModal() {
    const key = STARTER_OPTIONS[this._selectedIndex];
    const species = getSpecies(key);

    this._confirming = true;
    this._confirmChoice = 0;
    this._confirmTitle.setText(
      `Do you choose ${species.name.toUpperCase()}?\n\nThis will be your first Pokémon!`
    );
    this._updateConfirmButtons();
    this._confirmModal.setVisible(true);
  }

  _updateConfirmButtons() {
    if (this._confirmChoice === 0) {
      this._btnYes.setText('► YES').setStyle({ fill: '#facc15' });
      this._btnNo.setText('  NO').setStyle({ fill: '#94a3b8' });
    } else {
      this._btnYes.setText('  YES').setStyle({ fill: '#94a3b8' });
      this._btnNo.setText('► NO').setStyle({ fill: '#facc15' });
    }
  }

  _cancelConfirm() {
    this._confirming = false;
    this._confirmModal.setVisible(false);
  }

  _handleConfirmInput() {
    if (this._confirmChoice === 1) {
      this._cancelConfirm();
      return;
    }

    // Player chose YES!
    const key = STARTER_OPTIONS[this._selectedIndex];
    const chosenPokemon = new Pokemon(key, 5);

    if (this._playerParty) {
      this._playerParty.add(chosenPokemon);
    }

    // Celebration flash
    this.cameras.main.flash(500, 255, 255, 255);

    this.time.delayedCall(400, () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.stop();
        if (this._onComplete) {
          this._onComplete(chosenPokemon);
        } else {
          this.scene.resume(SCENES.GAME, { chosenStarter: chosenPokemon });
        }
      });
    });
  }
}

