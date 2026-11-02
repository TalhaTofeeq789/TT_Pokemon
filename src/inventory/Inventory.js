/**
 * Inventory.js
 *
 * Manages player's bag items, quantities, and wallet currency.
 */

import { getItem } from './Item.js';

export default class Inventory {
  /**
   * Initializes player's inventory with starting items and pocket money.
   */
  constructor() {
    this._items = new Map(); // itemId -> count
    this._money = 3000;

    // Starting adventure bundle: 5 Poké Balls and 2 Potions
    this.addItem('pokeball', 5);
    this.addItem('potion', 2);
  }

  /**
   * Adds quantity of item to bag.
   * @param {string} itemId
   * @param {number} [quantity=1]
   */
  addItem(itemId, quantity = 1) {
    const item = getItem(itemId);
    if (!item) {
      console.warn(`Attempted to add invalid item '${itemId}'`);
      return;
    }
    const current = this._items.get(itemId) || 0;
    this._items.set(itemId, current + Math.max(1, quantity));
  }

  /**
   * Removes quantity of item from bag.
   * @param {string} itemId
   * @param {number} [quantity=1]
   * @returns {boolean} true if successfully removed, false if not enough
   */
  removeItem(itemId, quantity = 1) {
    const current = this._items.get(itemId) || 0;
    if (current < quantity) {
      return false;
    }
    const remaining = current - quantity;
    if (remaining <= 0) {
      this._items.delete(itemId);
    } else {
      this._items.set(itemId, remaining);
    }
    return true;
  }

  hasItem(itemId, quantity = 1) {
    return (this._items.get(itemId) || 0) >= quantity;
  }

  getCount(itemId) {
    return this._items.get(itemId) || 0;
  }

  /**
   * Returns list of item objects with their count.
   * @returns {Array<{ item: object, count: number }>}
   */
  getAllItems() {
    const list = [];
    this._items.forEach((count, id) => {
      list.push({ item: getItem(id), count });
    });
    return list;
  }

  /**
   * Returns all ball items for battle bag menu.
   */
  getBattleBalls() {
    return this.getAllItems().filter((entry) => entry.item.category === 'BALL');
  }

  /**
   * Returns all medicine items for battle bag menu.
   */
  getBattleMedicines() {
    return this.getAllItems().filter((entry) => entry.item.category === 'MEDICINE');
  }

  get money() {
    return this._money;
  }

  addMoney(amount) {
    this._money += Math.max(0, amount);
  }

  spendMoney(amount) {
    if (this._money >= amount) {
      this._money -= amount;
      return true;
    }
    return false;
  }
}

