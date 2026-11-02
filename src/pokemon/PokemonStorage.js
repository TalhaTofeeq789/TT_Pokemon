/**
 * PokemonStorage.js
 *
 * Implements digital PC Storage Boxes (Bill's PC System).
 * When the active 6-slot party is full, caught Pokémon are automatically
 * transported to storage box without being discarded.
 */

export const BOX_CAPACITY = 30;
export const TOTAL_BOXES = 8;

export default class PokemonStorage {
  constructor() {
    this._boxes = [];
    for (let i = 0; i < TOTAL_BOXES; i++) {
      this._boxes.push([]);
    }
  }

  /**
   * Stores a Pokémon in the first available PC storage box.
   * @param {Pokemon} pokemon
   * @returns {{ success: boolean, boxNumber: number, boxName: string }}
   */
  store(pokemon) {
    for (let i = 0; i < TOTAL_BOXES; i++) {
      if (this._boxes[i].length < BOX_CAPACITY) {
        this._boxes[i].push(pokemon);
        return {
          success: true,
          boxNumber: i + 1,
          boxName: `BOX ${i + 1}`,
        };
      }
    }

    return {
      success: false,
      boxNumber: -1,
      boxName: 'FULL',
    };
  }

  /**
   * Retrieves Pokémon from specific box.
   * @param {number} boxIndex (0 to 7)
   * @returns {Pokemon[]}
   */
  getBox(boxIndex) {
    return this._boxes[boxIndex] || [];
  }

  /**
   * Total number of stored Pokémon across all boxes.
   */
  getTotalStoredCount() {
    return this._boxes.reduce((acc, box) => acc + box.length, 0);
  }
}

