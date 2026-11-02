/**
 * Pokemon.js
 *
 * Represents an individual Pokémon instance (e.g. in player's party or wild).
 * Handles level, stats, HP, move list, experience, and fainting.
 */

import { getSpecies } from './PokemonDatabase.js';
import { getMove } from './PokemonMove.js';

export default class Pokemon {
  /**
   * @param {string} speciesId - e.g. 'bulbasaur', 'charmander', 'squirtle'
   * @param {number} [level=5]
   * @param {string} [nickname=null]
   */
  constructor(speciesId, level = 5, nickname = null) {
    this.species = getSpecies(speciesId);
    this.speciesId = this.species.id;
    this.name = nickname || this.species.name;
    this.nickname = nickname;
    this.level = level;
    this.status = null; // null | 'burn' | 'paralysis' | 'sleep' | 'poison' | 'freeze'

    // Exp progression (Medium Fast curve: level^3)
    this.currentExp = Math.floor(this.level ** 3);
    this.nextLevelExp = Math.floor((this.level + 1) ** 3);

    // Dynamic stats
    this.maxHp = 0;
    this.currentHp = 0;
    this.attack = 0;
    this.defense = 0;
    this.spAttack = 0;
    this.spDefense = 0;
    this.speed = 0;

    // Moveset (max 4 moves)
    this.moves = [];

    this._calculateStats();
    this.currentHp = this.maxHp;
    this._initializeMoves();
  }

  /**
   * Calculates actual stats based on species base stats and current level.
   */
  _calculateStats() {
    const b = this.species.baseStats;
    const lvl = this.level;
    const prevMaxHp = this.maxHp;

    // Classic Gen 1/2 stat scaling formula
    this.maxHp = Math.floor(((2 * b.hp + 15) * lvl) / 100) + lvl + 10;
    this.attack = Math.floor(((2 * b.attack + 15) * lvl) / 100) + 5;
    this.defense = Math.floor(((2 * b.defense + 15) * lvl) / 100) + 5;
    this.spAttack = Math.floor(((2 * b.spAttack + 15) * lvl) / 100) + 5;
    this.spDefense = Math.floor(((2 * b.spDefense + 15) * lvl) / 100) + 5;
    this.speed = Math.floor(((2 * b.speed + 15) * lvl) / 100) + 5;

    // On level up, adjust current HP upward by HP increase
    if (prevMaxHp > 0) {
      this.currentHp += (this.maxHp - prevMaxHp);
    }
  }

  /**
   * Populates move list based on species learnset up to current level.
   */
  _initializeMoves() {
    this.moves = [];
    const eligible = this.species.learnset.filter((m) => m.level <= this.level);

    // Keep the most recent 4 moves
    const recent = eligible.slice(-4);
    recent.forEach((m) => {
      this.moves.push(getMove(m.moveId));
    });

    // Fallback if learnset didn't provide moves
    if (this.moves.length === 0) {
      this.moves.push(getMove('tackle'));
    }
  }

  /**
   * Inflicts damage on this Pokémon.
   * @param {number} amount
   * @returns {number} actual damage dealt
   */
  takeDamage(amount) {
    const damage = Math.max(1, Math.floor(amount));
    this.currentHp = Math.max(0, this.currentHp - damage);
    return damage;
  }

  /**
   * Restores HP to this Pokémon.
   * @param {number} amount
   * @returns {number} actual HP restored
   */
  heal(amount) {
    const prev = this.currentHp;
    this.currentHp = Math.min(this.maxHp, this.currentHp + Math.floor(amount));
    if (this.currentHp > 0 && this.status === 'faint') {
      this.status = null;
    }
    return this.currentHp - prev;
  }

  /**
   * Returns true if HP has reached 0.
   * @returns {boolean}
   */
  isFainted() {
    return this.currentHp <= 0;
  }

  /**
   * Awards experience points to this Pokémon. Handles level-up loop.
   * @param {number} expGain
   * @returns {{ leveledUp: boolean, oldLevel: number, newLevel: number }}
   */
  gainExp(expGain) {
    const oldLevel = this.level;
    this.currentExp += Math.max(0, Math.floor(expGain));

    while (this.currentExp >= this.nextLevelExp && this.level < 100) {
      this.level++;
      this._calculateStats();
      this.nextLevelExp = Math.floor((this.level + 1) ** 3);
    }

    return {
      leveledUp: this.level > oldLevel,
      oldLevel,
      newLevel: this.level,
    };
  }

  get type1() {
    return this.species.type1;
  }

  get type2() {
    return this.species.type2;
  }

  get hpPercent() {
    return this.maxHp > 0 ? this.currentHp / this.maxHp : 0;
  }

  get spriteKey() {
    return this.species.spriteKey;
  }
}

