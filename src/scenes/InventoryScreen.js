/**
 * InventoryScreen.js
 *
 * Phase 9: Inventory Bag Management Screen
 *
 * Features:
 *  - Categorized item browser (Medicine & Poké Balls)
 *  - Real-time stock counters and player cash wallet display
 *  - Detailed description cards with item lore
 *  - Using Potions links directly to PartyScreen to select and heal injured Pokémon
 *  - Contextual error checks (e.g. Poké Balls can only be thrown in wild battle)
 */

import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants.js';
import SpriteGenerator from '../utils/SpriteGenerator.js';

export default class InventoryScreen extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.INVENTORY });

    this._inventory = null;
    this._party = null;
    this._selectedIndex = 0;
    this._itemEntries = [];
    this._slotTexts = [];
    this._onComplete = null;
  }

  init(data) {
    this._inventory = data.inventory;
    this._party = data.party;
    this._onComplete = data.onComplete || null;
    this._selectedIndex = 0;
  }

  create() {
    SpriteGenerator.generateAll(this);

    this._createBackground();
    this._createHeader();
    this._createItemList();
    this._createItemCard();
    this._setupInput();

    this._refreshInventory();
    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  // ─── Visual Layout ──────────────────────────────────────────────────────────

  _createBackground() {
    // Dark slate background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0f172a);

    // Subtle checkered lines
    const g = this.add.graphics();
    g.lineStyle(1, 0x1e293b, 0.45);
    for (let x = 0; x < GAME_WIDTH; x += 32) g.lineBetween(x, 0, x, GAME_HEIGHT);
    for (let y = 0; y < GAME_HEIGHT; y += 32) g.lineBetween(0, y, GAME_WIDTH, y);
  }

  _createHeader() {
    this.add.text(32, 24, "TRAINER'S BAG", {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      fill: '#facc15',
    });

    this._moneyText = this.add.text(GAME_WIDTH - 32, 24, '$3,000', {
      fontFamily: '"Press Start 2P"',
      fontSize: '10px',
      fill: '#4ade80',
    }).setOrigin(1, 0);

    // Subtitle instruction
    this.add.text(32, 44, 'Select an item to use or inspect', {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
      fill: '#94a3b8',
    });
  }

  _createItemList() {
    const listX = 32;
    const listY = 70;
    const listW = 430;
    const listH = 470;

    // Panel background
    const bg = this.add.rectangle(listX, listY, listW, listH, 0x1e293b, 0.95)
      .setStrokeStyle(2, 0x334155)
      .setOrigin(0, 0);

    this._slotTexts = [];
    const maxVisibleSlots = 8;
    const startSlotY = listY + 28;
    const slotSpacing = 48;

    for (let i = 0; i < maxVisibleSlots; i++) {
      const y = startSlotY + i * slotSpacing;

      const highlight = this.add.rectangle(listX + 10, y - 4, listW - 20, 36, 0x334155, 0.6)
        .setOrigin(0, 0)
        .setVisible(false);

      const nameText = this.add.text(listX + 24, y + 6, '', {
        fontFamily: '"Press Start 2P"',
        fontSize: '9px',
        fill: '#ffffff',
      });

      const countText = this.add.text(listX + listW - 30, y + 6, '', {
        fontFamily: '"Press Start 2P"',
        fontSize: '9px',
        fill: '#facc15',
      }).setOrigin(1, 0);

      this._slotTexts.push({ highlight, nameText, countText });
    }

    // Bottom controls hint
    this.add.text(listX + 20, listY + listH - 24, '↑↓ / WS: Select   ENTER / SPACE: Use   ESC: Back', {
      fontFamily: '"Press Start 2P"',
      fontSize: '7px',
      fill: '#64748b',
    });
  }

  _createItemCard() {
    const cardX = 490;
    const cardY = 70;
    const cardW = 278;
    const cardH = 470;

    const bg = this.add.rectangle(cardX, cardY, cardW, cardH, 0x1e293b, 0.98)
      .setStrokeStyle(2, 0x475569)
      .setOrigin(0, 0);

    const title = this.add.text(cardX + 20, cardY + 24, 'ITEM DETAILS', {
      fontFamily: '"Press Start 2P"',
      fontSize: '10px',
      fill: '#facc15',
    });

    // Pokéball icon display
    this._itemIcon = this.add.image(cardX + 46, cardY + 80, 'pokeball_item')
      .setScale(1.6)
      .setVisible(false);

    this._cardItemName = this.add.text(cardX + 80, cardY + 70, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '10px',
      fill: '#ffffff',
    });

    this._cardCategory = this.add.text(cardX + 80, cardY + 88, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '7px',
      fill: '#38bdf8',
    });

    this._cardDescription = this.add.text(cardX + 20, cardY + 130, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
      fill: '#cbd5e1',
      lineSpacing: 10,
      wordWrap: { width: cardW - 40 },
    });

    // Price tag
    this._cardPrice = this.add.text(cardX + 20, cardY + cardH - 30, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
      fill: '#4ade80',
    });
  }

  _refreshInventory() {
    this._itemEntries = this._inventory ? this._inventory.getAllItems() : [];
    if (this._selectedIndex >= this._itemEntries.length) {
      this._selectedIndex = Math.max(0, this._itemEntries.length - 1);
    }

    if (this._inventory) {
      this._moneyText.setText(`$${this._inventory.money.toLocaleString()}`);
    }

    this._slotTexts.forEach((slot, idx) => {
      if (idx < this._itemEntries.length) {
        const entry = this._itemEntries[idx];
        const isSelected = idx === this._selectedIndex;
        slot.highlight.setVisible(isSelected);
        slot.nameText.setText(`${isSelected ? '► ' : '  '}${entry.item.name.toUpperCase()}`)
          .setStyle({ fill: isSelected ? '#facc15' : '#ffffff' });
        slot.countText.setText(`x${entry.count}`);
      } else {
        slot.highlight.setVisible(false);
        slot.nameText.setText('');
        slot.countText.setText('');
      }
    });

    if (this._itemEntries.length > 0 && this._selectedIndex < this._itemEntries.length) {
      const current = this._itemEntries[this._selectedIndex].item;
      this._itemIcon.setVisible(true);
      this._cardItemName.setText(current.name.toUpperCase());
      this._cardCategory.setText(`[${current.category}]`);
      this._cardDescription.setText(current.description);
      this._cardPrice.setText(`Retail Value: $${current.price}`);
    } else {
      this._itemIcon.setVisible(false);
      this._cardItemName.setText('BAG EMPTY');
      this._cardCategory.setText('');
      this._cardDescription.setText('No items currently held in bag.');
      this._cardPrice.setText('');
    }
  }

  _setupInput() {
    this.input.keyboard.on('keydown', (e) => {
      if (e.code === 'Escape' || e.code === 'KeyX') {
        this._exitScreen();
        return;
      }

      const totalItems = this._itemEntries.length;
      if (totalItems === 0) return;

      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        this._selectedIndex = (this._selectedIndex + 1) % totalItems;
        this._refreshInventory();
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        this._selectedIndex = (this._selectedIndex - 1 + totalItems) % totalItems;
        this._refreshInventory();
      } else if (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyZ') {
        this._handleUseItem();
      }
    });
  }

  _handleUseItem() {
    if (this._itemEntries.length === 0) return;
    const entry = this._itemEntries[this._selectedIndex];
    const item = entry.item;

    if (item.category === 'BALL') {
      this._showToast('Poké Balls can only be used during wild encounters!');
      return;
    }

    if (item.category === 'MEDICINE') {
      // Open PartyScreen in USE_ITEM mode
      this.cameras.main.fadeOut(250, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.pause();
        this.scene.launch(SCENES.PARTY, {
          party: this._party,
          mode: 'USE_ITEM',
          item,
          onComplete: (res) => {
            this.scene.resume();
            this.cameras.main.fadeIn(300, 0, 0, 0);
            if (res?.usedItem) {
              // Deduct from inventory
              this._inventory.removeItem(res.usedItem.id, 1);
            }
            this._refreshInventory();
          },
        });
      });
      return;
    }

    this._showToast(`Cannot use ${item.name} right now.`);
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

  _exitScreen() {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop();
      if (this._onComplete) {
        this._onComplete();
      } else {
        this.scene.resume(SCENES.GAME);
      }
    });
  }
}

