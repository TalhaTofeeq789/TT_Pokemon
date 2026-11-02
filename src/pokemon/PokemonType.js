/**
 * PokemonType.js
 *
 * Defines the 18 standard Pokémon types, their display colors,
 * and the complete elemental type-effectiveness matchup chart.
 */

export const TYPE = {
  NORMAL:   'NORMAL',
  FIRE:     'FIRE',
  WATER:    'WATER',
  GRASS:    'GRASS',
  ELECTRIC: 'ELECTRIC',
  ICE:      'ICE',
  FIGHTING: 'FIGHTING',
  POISON:   'POISON',
  GROUND:   'GROUND',
  FLYING:   'FLYING',
  PSYCHIC:  'PSYCHIC',
  BUG:      'BUG',
  ROCK:     'ROCK',
  GHOST:    'GHOST',
  DRAGON:   'DRAGON',
  DARK:     'DARK',
  STEEL:    'STEEL',
  FAIRY:    'FAIRY',
};

export const TYPE_COLORS = {
  [TYPE.NORMAL]:   0xa8a878,
  [TYPE.FIRE]:     0xf08030,
  [TYPE.WATER]:    0x6890f0,
  [TYPE.GRASS]:    0x78c850,
  [TYPE.ELECTRIC]: 0xf8d030,
  [TYPE.ICE]:      0x98d8d8,
  [TYPE.FIGHTING]: 0xc03028,
  [TYPE.POISON]:   0xa040a0,
  [TYPE.GROUND]:   0xe0c068,
  [TYPE.FLYING]:   0xa890f0,
  [TYPE.PSYCHIC]:  0xf85888,
  [TYPE.BUG]:      0xa8b820,
  [TYPE.ROCK]:     0xb8a038,
  [TYPE.GHOST]:    0x705898,
  [TYPE.DRAGON]:   0x7038f8,
  [TYPE.DARK]:     0x705848,
  [TYPE.STEEL]:    0xb8b8d0,
  [TYPE.FAIRY]:    0xee99ac,
};

// 2.0 = Super Effective, 0.5 = Not Very Effective, 0.0 = No Effect
const TYPE_CHART = {
  [TYPE.NORMAL]: {
    [TYPE.ROCK]: 0.5,
    [TYPE.GHOST]: 0.0,
    [TYPE.STEEL]: 0.5,
  },
  [TYPE.FIRE]: {
    [TYPE.FIRE]: 0.5,
    [TYPE.WATER]: 0.5,
    [TYPE.GRASS]: 2.0,
    [TYPE.ICE]: 2.0,
    [TYPE.BUG]: 2.0,
    [TYPE.ROCK]: 0.5,
    [TYPE.DRAGON]: 0.5,
    [TYPE.STEEL]: 2.0,
  },
  [TYPE.WATER]: {
    [TYPE.FIRE]: 2.0,
    [TYPE.WATER]: 0.5,
    [TYPE.GRASS]: 0.5,
    [TYPE.GROUND]: 2.0,
    [TYPE.ROCK]: 2.0,
    [TYPE.DRAGON]: 0.5,
  },
  [TYPE.GRASS]: {
    [TYPE.FIRE]: 0.5,
    [TYPE.WATER]: 2.0,
    [TYPE.GRASS]: 0.5,
    [TYPE.POISON]: 0.5,
    [TYPE.GROUND]: 2.0,
    [TYPE.FLYING]: 0.5,
    [TYPE.BUG]: 0.5,
    [TYPE.ROCK]: 2.0,
    [TYPE.DRAGON]: 0.5,
    [TYPE.STEEL]: 0.5,
  },
  [TYPE.ELECTRIC]: {
    [TYPE.WATER]: 2.0,
    [TYPE.GRASS]: 0.5,
    [TYPE.ELECTRIC]: 0.5,
    [TYPE.GROUND]: 0.0,
    [TYPE.FLYING]: 2.0,
    [TYPE.DRAGON]: 0.5,
  },
  [TYPE.POISON]: {
    [TYPE.GRASS]: 2.0,
    [TYPE.POISON]: 0.5,
    [TYPE.GROUND]: 0.5,
    [TYPE.ROCK]: 0.5,
    [TYPE.GHOST]: 0.5,
    [TYPE.STEEL]: 0.0,
    [TYPE.FAIRY]: 2.0,
  },
  [TYPE.FLYING]: {
    [TYPE.GRASS]: 2.0,
    [TYPE.FIGHTING]: 2.0,
    [TYPE.BUG]: 2.0,
    [TYPE.ELECTRIC]: 0.5,
    [TYPE.ROCK]: 0.5,
    [TYPE.STEEL]: 0.5,
  },
  [TYPE.BUG]: {
    [TYPE.GRASS]: 2.0,
    [TYPE.FIRE]: 0.5,
    [TYPE.FIGHTING]: 0.5,
    [TYPE.POISON]: 0.5,
    [TYPE.FLYING]: 0.5,
    [TYPE.PSYCHIC]: 2.0,
    [TYPE.GHOST]: 0.5,
    [TYPE.DARK]: 2.0,
    [TYPE.STEEL]: 0.5,
  },
};

/**
 * Calculates the type matchup multiplier of an attacking move against defending type(s).
 * @param {string} attackType
 * @param {string} defenderType1
 * @param {string} [defenderType2=null]
 * @returns {number} 0.0, 0.25, 0.5, 1.0, 2.0, or 4.0
 */
export function getTypeEffectiveness(attackType, defenderType1, defenderType2 = null) {
  let multiplier = 1.0;

  if (TYPE_CHART[attackType] && TYPE_CHART[attackType][defenderType1] !== undefined) {
    multiplier *= TYPE_CHART[attackType][defenderType1];
  }

  if (defenderType2 && TYPE_CHART[attackType] && TYPE_CHART[attackType][defenderType2] !== undefined) {
    multiplier *= TYPE_CHART[attackType][defenderType2];
  }

  return multiplier;
}

