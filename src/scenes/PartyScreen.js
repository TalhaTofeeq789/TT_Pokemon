/**
 * PartyScreen.js
 *
 * Phase 9: Pokémon Party Management Screen
 *
 * Features:
 *  - Full inspection of up to 6 active party members
 *  - Real-time HP bars, status conditions (OK / FAINT), levels, and typings
 *  - Detailed sidebar: Attack, Defense, Sp. Atk, Sp. Def, Speed, and 4 Move cards with PP
 *  - Shift / Swap party positions to choose who leads into battle
 *  - Supports item usage mode (applying Potions) and battle-switch mode
 */

import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants.js';
import { TYPE_COLORS } from '../pokemon/PokemonType.js';
import SpriteGenerator from '../utils/SpriteGenerator.js';

export default class PartyScreen extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.PARTY });

    this._party = null;
    this._mode = 'BROWSE'; // 'BROWSE' | 'ACTIONS' | 'SWAP' | 'USE_ITEM' | 'BATTLE_SELECT'
    this._selectedIndex = 0;
    this._swapSourceIndex = -1;
    this._pendingItem = null;
    this._onComplete = null;
    this._slotContainers = [];
  }

  init(data) {
    this._party = data.party;
    this._mode = data.mode || 'BROWSE'; // 'BROWSE' | 'USE_ITEM' | 'BATTLE_SELECT'
    this._pendingItem = data.item || null;
    this._onComplete = data.onComplete || null;
    this._selectedIndex = 0;
    this._swapSourceIndex = -1;
  }

  create() {
    SpriteGenerator.generateAll(this);

    this._createBackground();
    this._createHeader();
    this._createPartySlots();
    this._createInspectorCard();
    this._createActionModal();
    this._setupInput();

    this._updateSelection();
    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  // ─── Visuals ────────────────────────────────────────────────────────────────

  _createBackground() {
    // Dark slate background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0f172a);

    // Grid pattern
    const g = this.add.graphics();
    g.lineStyle(1, 0x1e293b, 0.5);
    for (let x = 0; x < GAME_WIDTH; x += 32) g.lineBetween(x, 0, x, GAME_HEIGHT);
    for (let y = 0; y < GAME_HEIGHT; y += 32) g.lineBetween(0, y, GAME_WIDTH, y);
  }

  _createHeader() {
    let title = 'POKÉMON PARTY';
    if (this._mode === 'USE_ITEM') {
      title = `USE ${this._pendingItem?.name?.toUpperCase()} ON WHICH POKÉMON?`;
    } else if (this._mode === 'BATTLE_SELECT') {
      title = 'CHOOSE A POKÉMON TO SEND INTO BATTLE!';
    }

    this._headerText = this.add.text(32, 24, title, {
      fontFamily: '"Press Start 2P"',
      fontSize: '11px',
      fill: '#facc15',
    });

    this._hintText = this.add.text(GAME_WIDTH - 32, 24, 'ESC / X: Back', {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
      fill: '#94a3b8',
    }).setOrigin(1, 0);
  }

  _createPartySlots() {
    this._slotContainers = [];
    const startX = 32;
    const startY = 60;
    const slotW = 440;
    const slotH = 76;
    const spacing = 84;

    for (let i = 0; i < 6; i++) {
      const y = startY + i * spacing;
      const container = this.add.container(startX, y);

      // Slot background
      const bg = this.add.rectangle(0, 0, slotW, slotH, 0x1e293b, 0.95)
        .setStrokeStyle(2, 0x334155)
        .setOrigin(0, 0);

      // Selected highlight border
      const highlight = this.add.rectangle(0, 0, slotW, slotH, 0xfacc15, 0.0)
        .setStrokeStyle(2, 0xfacc15)
        .setOrigin(0, 0)
        .setVisible(false);

      // Sprite placeholder (filled in _updateSlots)
      const sprite = this.add.sprite(36, slotH / 2, 'poke_bulbasaur')
        .setScale(1.5)
        .setVisible(false);

      // Name & Level
      const nameText = this.add.text(72, 14, '', {
        fontFamily: '"Press Start 2P"',
        fontSize: '10px',
        fill: '#ffffff',
      });

      const levelText = this.add.text(slotW - 16, 14, '', {
        fontFamily: '"Press Start 2P"',
        fontSize: '9px',
        fill: '#facc15',
      }).setOrigin(1, 0);

      // HP Bar background
      const barX = 72;
      const barY = 34;
      const barW = 220;
      const barH = 8;
      const hpBg = this.add.rectangle(barX, barY, barW, barH, 0x334155)
        .setOrigin(0, 0);
      const hpFill = this.add.rectangle(barX, barY, barW, barH, 0x22c55e)
        .setOrigin(0, 0);

      // Numeric HP
      const hpNum = this.add.text(barX + barW + 12, barY - 1, '', {
        fontFamily: '"Press Start 2P"',
        fontSize: '7px',
        fill: '#cbd5e1',
      });

      // Type & Status Pill
      const statusPill = this.add.text(72, 50, '', {
        fontFamily: '"Press Start 2P"',
        fontSize: '7px',
        fill: '#38bdf8',
      });

      // Empty slot label
      const emptyLabel = this.add.text(slotW / 2, slotH / 2, '- EMPTY SLOT -', {
        fontFamily: '"Press Start 2P"',
        fontSize: '9px',
        fill: '#475569',
      }).setOrigin(0.5).setVisible(false);

      container.add([bg, highlight, sprite, nameText, levelText, hpBg, hpFill, hpNum, statusPill, emptyLabel]);
      container._components = { bg, highlight, sprite, nameText, levelText, hpBg, hpFill, hpNum, statusPill, emptyLabel, barW };

      this._slotContainers.push(container);
    }

    this._renderSlots();
  }

  _renderSlots() {
    const list = this._party ? this._party.all : [];

    for (let i = 0; i < 6; i++) {
      const c = this._slotContainers[i]._components;
      const p = list[i];

      if (p) {
        c.emptyLabel.setVisible(false);
        c.sprite.setVisible(true).setTexture(p.spriteKey);
        c.nameText.setText(p.name.toUpperCase()).setVisible(true);
        c.levelText.setText(`Lv.${p.level}`).setVisible(true);

        const ratio = p.maxHp > 0 ? p.currentHp / p.maxHp : 0;
        c.hpFill.width = Math.max(0, Math.floor(c.barW * ratio));
        c.hpFill.setFillStyle(ratio > 0.5 ? 0x22c55e : (ratio > 0.2 ? 0xeab308 : 0xef4444));
        c.hpBg.setVisible(true);
        c.hpFill.setVisible(true);
        c.hpNum.setText(`${p.currentHp}/${p.maxHp} HP`).setVisible(true);

        const statusTag = p.isFainted() ? '[FAINTED]' : '[OK]';
        c.statusPill.setText(`${statusTag}  TYPE: ${p.type1}${p.type2 ? '/' + p.type2 : ''}`)
          .setStyle({ fill: p.isFainted() ? '#ef4444' : '#38bdf8' })
          .setVisible(true);
      } else {
        c.emptyLabel.setVisible(true);
        c.sprite.setVisible(false);
        c.nameText.setVisible(false);
        c.levelText.setVisible(false);
        c.hpBg.setVisible(false);
        c.hpFill.setVisible(false);
        c.hpNum.setVisible(false);
        c.statusPill.setVisible(false);
      }
    }
  }

  _createInspectorCard() {
    const cardX = 500;
    const cardY = 60;
    const cardW = 268;
    const cardH = 500;

    this._inspector = this.add.container(cardX, cardY);

    const bg = this.add.rectangle(0, 0, cardW, cardH, 0x1e293b, 0.98)
      .setStrokeStyle(2, 0x475569)
      .setOrigin(0, 0);

    const title = this.add.text(18, 18, 'STAT SUMMARY', {
      fontFamily: '"Press Start 2P"',
      fontSize: '10px',
      fill: '#facc15',
    });

    this._inspectStats = this.add.text(18, 44, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
      fill: '#e2e8f0',
      lineSpacing: 10,
    });

    const movesTitle = this.add.text(18, 200, 'LEARNED MOVES:', {
      fontFamily: '"Press Start 2P"',
      fontSize: '9px',
      fill: '#38bdf8',
    });

    this._inspectMoves = this.add.text(18, 226, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
      fill: '#f1f5f9',
      lineSpacing: 14,
    });

    this._inspector.add([bg, title, this._inspectStats, movesTitle, this._inspectMoves]);
  }

  _createActionModal() {
    this._actionModal = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2)
      .setDepth(200)
      .setVisible(false);

    const overlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.65);
    const bg = this.add.rectangle(0, 0, 320, 180, 0x1e293b)
      .setStrokeStyle(3, 0xfacc15);

    this._actionTitle = this.add.text(0, -55, 'POKÉMON OPTIONS', {
      fontFamily: '"Press Start 2P"',
      fontSize: '10px',
      fill: '#ffffff',
    }).setOrigin(0.5);

    this._actShift  = this.add.text(-90, -10, '► SHIFT / SWAP', { fontFamily: '"Press Start 2P"', fontSize: '9px', fill: '#facc15' });
    this._actCancel = this.add.text(-90, 35,  '  CANCEL',       { fontFamily: '"Press Start 2P"', fontSize: '9px', fill: '#94a3b8' });

    this._actionModal.add([overlay, bg, this._actionTitle, this._actShift, this._actCancel]);
    this._actionChoice = 0;
  }

  // ─── Input Handling ──────────────────────────────────────────────────────────

  _setupInput() {
    this.input.keyboard.on('keydown', (e) => {
      if (this._mode === 'ACTIONS') {
        this._handleActionModalInput(e);
        return;
      }

      if (e.code === 'Escape' || e.code === 'KeyX') {
        if (this._mode === 'SWAP') {
          this._mode = 'BROWSE';
          this._swapSourceIndex = -1;
          this._updateSelection();
          return;
        }
        this._exitScreen(null);
        return;
      }

      const partyCount = this._party ? this._party.count : 0;
      if (partyCount === 0) return;

      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        this._selectedIndex = (this._selectedIndex + 1) % partyCount;
        this._updateSelection();
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        this._selectedIndex = (this._selectedIndex - 1 + partyCount) % partyCount;
        this._updateSelection();
      } else if (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyZ') {
        this._handleConfirm();
      }
    });
  }

  _updateSelection() {
    const partyCount = this._party ? this._party.count : 0;

    this._slotContainers.forEach((sc, idx) => {
      const c = sc._components;
      const isSelected = idx === this._selectedIndex;
      const isSwapSource = idx === this._swapSourceIndex;

      c.highlight.setVisible(isSelected || isSwapSource);
      c.highlight.setStrokeStyle(2, isSwapSource ? 0x38bdf8 : 0xfacc15);
      sc.setScale(isSelected ? 1.02 : 1.0);
    });

    if (partyCount > 0 && this._selectedIndex < partyCount) {
      const p = this._party.get(this._selectedIndex);
      this._inspectStats.setText(
        `HP:      ${p.currentHp} / ${p.maxHp}\n` +
        `ATTACK:  ${p.attack}\n` +
        `DEFENSE: ${p.defense}\n` +
        `SP. ATK: ${p.spAttack}\n` +
        `SP. DEF: ${p.spDefense}\n` +
        `SPEED:   ${p.speed}\n\n` +
        `EXP:     ${p.currentExp}\n` +
        `NEXT LV: ${p.nextLevelExp}`
      );

      const movesStr = p.moves
        .map((m) => `• ${m.name.toUpperCase()}\n  PP ${m.currentPp}/${m.maxPp} [${m.type}]`)
        .join('\n');
      this._inspectMoves.setText(movesStr);
    } else {
      this._inspectStats.setText('No Pokémon in this slot.');
      this._inspectMoves.setText('');
    }
  }

  _handleConfirm() {
    const selectedPokemon = this._party.get(this._selectedIndex);
    if (!selectedPokemon) return;

    if (this._mode === 'USE_ITEM') {
      // Apply Potion / healing item
      if (selectedPokemon.isFainted()) {
        this._showToast('Cannot use on a fainted Pokémon!');
        return;
      }
      if (selectedPokemon.currentHp >= selectedPokemon.maxHp) {
        this._showToast("It won't have any effect!");
        return;
      }

      const healed = selectedPokemon.heal(this._pendingItem.healAmount || 20);
      this._renderSlots();
      this._updateSelection();

      // Green heal flash on slot
      const comp = this._slotContainers[this._selectedIndex]._components;
      this.tweens.add({
        targets: comp.bg,
        fillColor: 0x16a34a,
        duration: 200,
        yoyo: true,
      });

      this._showToast(`Restored ${healed} HP to ${selectedPokemon.name.toUpperCase()}!`);

      this.time.delayedCall(1200, () => {
        this._exitScreen({ usedItem: this._pendingItem, targetPokemon: selectedPokemon });
      });
      return;
    }

    if (this._mode === 'BATTLE_SELECT') {
      // Swapping into battle
      if (selectedPokemon.isFainted()) {
        this._showToast("That Pokémon has fainted and can't battle!");
        return;
      }
      this._exitScreen({ switchedPokemon: selectedPokemon, slotIndex: this._selectedIndex });
      return;
    }

    if (this._mode === 'SWAP') {
      // Complete party swap
      this._party.swap(this._swapSourceIndex, this._selectedIndex);
      this._mode = 'BROWSE';
      this._swapSourceIndex = -1;
      this._renderSlots();
      this._updateSelection();
      this._showToast('Party order updated!');
      return;
    }

    // Default BROWSE mode -> open action modal
    this._openActionModal();
  }

  _openActionModal() {
    const p = this._party.get(this._selectedIndex);
    this._mode = 'ACTIONS';
    this._actionChoice = 0;
    this._actionTitle.setText(p.name.toUpperCase());
    this._updateActionButtons();
    this._actionModal.setVisible(true);
  }

  _handleActionModalInput(e) {
    if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      this._actionChoice = 1;
      this._updateActionButtons();
    } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
      this._actionChoice = 0;
      this._updateActionButtons();
    } else if (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyZ') {
      if (this._actionChoice === 0) {
        // Enter SWAP mode
        this._actionModal.setVisible(false);
        this._mode = 'SWAP';
        this._swapSourceIndex = this._selectedIndex;
        this._updateSelection();
        this._showToast('Select another slot to swap with!');
      } else {
        this._actionModal.setVisible(false);
        this._mode = 'BROWSE';
      }
    } else if (e.code === 'Escape' || e.code === 'KeyX') {
      this._actionModal.setVisible(false);
      this._mode = 'BROWSE';
    }
  }

  _updateActionButtons() {
    this._actShift.setText((this._actionChoice === 0 ? '► ' : '  ') + 'SHIFT / SWAP')
      .setStyle({ fill: this._actionChoice === 0 ? '#facc15' : '#ffffff' });
    this._actCancel.setText((this._actionChoice === 1 ? '► ' : '  ') + 'CANCEL')
      .setStyle({ fill: this._actionChoice === 1 ? '#facc15' : '#94a3b8' });
  }

  _showToast(msg) {
    const toast = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 30, msg, {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
      fill: '#fde047',
      backgroundColor: '#000000cc',
      padding: { x: 14, y: 8 },
    }).setOrigin(0.5).setDepth(300);

    this.time.delayedCall(1600, () => toast.destroy());
  }

  _exitScreen(result) {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop();
      if (this._onComplete) {
        this._onComplete(result);
      } else {
        this.scene.resume(SCENES.GAME);
      }
    });
  }
}

