/**
 * PokemonParty.js
 *
 * Manages the player's active team of up to 6 Pokémon.
 */

import { MAX_PARTY_SIZE } from '../utils/Constants.js';

export default class PokemonParty {
  constructor() {
    this._pokemon = [];
  }

  /**
   * Adds a Pokémon to the party if space is available.
   * @param {Pokemon} pokemon
   * @returns {boolean} true if added, false if party is already full
   */
  add(pokemon) {
    if (this._pokemon.length >= MAX_PARTY_SIZE) {
      return false;
    }
    this._pokemon.push(pokemon);
    return true;
  }

  /**
   * Returns Pokémon at specific party slot (0-5).
   * @param {number} index
   * @returns {Pokemon | null}
   */
  get(index) {
    return this._pokemon[index] || null;
  }

  /**
   * Returns the first non-fainted Pokémon to enter battle.
   * @returns {Pokemon | null}
   */
  getFirstAble() {
    return this._pokemon.find((p) => !p.isFainted()) || null;
  }

  /**
   * Returns true if at least one Pokémon is capable of battling.
   * @returns {boolean}
   */
  hasAblePokemon() {
    return this._pokemon.some((p) => !p.isFainted());
  }

  /**
   * Swaps the positions of two Pokémon in the party.
   * @param {number} indexA
   * @param {number} indexB
   */
  swap(indexA, indexB) {
    if (
      indexA >= 0 && indexA < this._pokemon.length &&
      indexB >= 0 && indexB < this._pokemon.length
    ) {
      const temp = this._pokemon[indexA];
      this._pokemon[indexA] = this._pokemon[indexB];
      this._pokemon[indexB] = temp;
      return true;
    }
    return false;
  }

  /**
   * Fully restores HP and PP for every Pokémon in the party.
   */
  healAll() {
    this._pokemon.forEach((p) => {
      p.heal(9999);
      p.status = null;
      p.moves.forEach((m) => m.restorePp());
    });
  }

  get count() {
    return this._pokemon.length;
  }

  get isFull() {
    return this._pokemon.length >= MAX_PARTY_SIZE;
  }

  get all() {
    return [...this._pokemon];
  }
}

