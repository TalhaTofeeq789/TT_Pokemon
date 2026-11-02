/**
 * PokemonMove.js
 *
 * Defines Pokémon moves: power, accuracy, PP, category, and type.
 */

import { TYPE } from './PokemonType.js';

export const MOVE_CATEGORY = {
  PHYSICAL: 'PHYSICAL',
  SPECIAL:  'SPECIAL',
  STATUS:   'STATUS',
};

export class PokemonMove {
  /**
   * @param {object} config
   */
  constructor({ id, name, type, category, power, accuracy, pp, description = '' }) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.category = category;
    this.power = power;
    this.accuracy = accuracy;
    this.maxPp = pp;
    this.currentPp = pp;
    this.description = description;
  }

  /**
   * Clones the move with fresh PP for a new Pokémon instance.
   */
  clone() {
    return new PokemonMove({
      id: this.id,
      name: this.name,
      type: this.type,
      category: this.category,
      power: this.power,
      accuracy: this.accuracy,
      pp: this.maxPp,
      description: this.description,
    });
  }

  use() {
    if (this.currentPp > 0) {
      this.currentPp--;
      return true;
    }
    return false;
  }

  restorePp(amount = 999) {
    this.currentPp = Math.min(this.maxPp, this.currentPp + amount);
  }
}

// ── MOVE DATABASE ────────────────────────────────────────────────────────────
export const MOVE_DATABASE = {
  tackle: new PokemonMove({
    id: 'tackle',
    name: 'Tackle',
    type: TYPE.NORMAL,
    category: MOVE_CATEGORY.PHYSICAL,
    power: 40,
    accuracy: 100,
    pp: 35,
    description: 'A physical charge attack using the whole body.',
  }),
  scratch: new PokemonMove({
    id: 'scratch',
    name: 'Scratch',
    type: TYPE.NORMAL,
    category: MOVE_CATEGORY.PHYSICAL,
    power: 40,
    accuracy: 100,
    pp: 35,
    description: 'Hard, pointed, sharp claws rake the target.',
  }),
  vine_whip: new PokemonMove({
    id: 'vine_whip',
    name: 'Vine Whip',
    type: TYPE.GRASS,
    category: MOVE_CATEGORY.PHYSICAL,
    power: 45,
    accuracy: 100,
    pp: 25,
    description: 'Slender, whiplike vines lash the target violently.',
  }),
  ember: new PokemonMove({
    id: 'ember',
    name: 'Ember',
    type: TYPE.FIRE,
    category: MOVE_CATEGORY.SPECIAL,
    power: 40,
    accuracy: 100,
    pp: 25,
    description: 'Small flames are shot at the target.',
  }),
  water_gun: new PokemonMove({
    id: 'water_gun',
    name: 'Water Gun',
    type: TYPE.WATER,
    category: MOVE_CATEGORY.SPECIAL,
    power: 40,
    accuracy: 100,
    pp: 25,
    description: 'A powerful blast of water is shot at the target.',
  }),
  growl: new PokemonMove({
    id: 'growl',
    name: 'Growl',
    type: TYPE.NORMAL,
    category: MOVE_CATEGORY.STATUS,
    power: 0,
    accuracy: 100,
    pp: 40,
    description: 'Growls cute, lowering the foe’s Attack.',
  }),
  quick_attack: new PokemonMove({
    id: 'quick_attack',
    name: 'Quick Attack',
    type: TYPE.NORMAL,
    category: MOVE_CATEGORY.PHYSICAL,
    power: 40,
    accuracy: 100,
    pp: 30,
    description: 'An almost invisibly fast lunge attack.',
  }),
  thunder_shock: new PokemonMove({
    id: 'thunder_shock',
    name: 'Thunder Shock',
    type: TYPE.ELECTRIC,
    category: MOVE_CATEGORY.SPECIAL,
    power: 40,
    accuracy: 100,
    pp: 30,
    description: 'An electric shock that may paralyze.',
  }),
  gust: new PokemonMove({
    id: 'gust',
    name: 'Gust',
    type: TYPE.FLYING,
    category: MOVE_CATEGORY.SPECIAL,
    power: 40,
    accuracy: 100,
    pp: 35,
    description: 'Flaps wings to whip up a fierce wind.',
  }),
  bite: new PokemonMove({
    id: 'bite',
    name: 'Bite',
    type: TYPE.DARK,
    category: MOVE_CATEGORY.PHYSICAL,
    power: 60,
    accuracy: 100,
    pp: 25,
    description: 'Bites with vicious fangs.',
  }),
};

/**
 * Helper to fetch a clone of a move from the database.
 * @param {string} moveId
 * @returns {PokemonMove}
 */
export function getMove(moveId) {
  const move = MOVE_DATABASE[moveId];
  if (!move) {
    console.warn(`Move '${moveId}' not found in database, defaulting to Tackle.`);
    return MOVE_DATABASE.tackle.clone();
  }
  return move.clone();
}

