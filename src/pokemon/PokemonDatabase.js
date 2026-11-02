/**
 * PokemonDatabase.js
 *
 * Repository of all Pokémon species definitions:
 *  - Base stats (HP, Attack, Defense, Sp. Atk, Sp. Def, Speed)
 *  - Typing (primary & secondary)
 *  - Catch rate, base experience payout
 *  - Level-up learnsets
 */

import { TYPE } from './PokemonType.js';

export const POKEMON_SPECIES = {
  bulbasaur: {
    id: 'bulbasaur',
    dexNumber: 1,
    name: 'Bulbasaur',
    category: 'Seed Pokémon',
    type1: TYPE.GRASS,
    type2: TYPE.POISON,
    baseStats: {
      hp: 45,
      attack: 49,
      defense: 49,
      spAttack: 65,
      spDefense: 65,
      speed: 45,
    },
    baseExp: 64,
    catchRate: 45,
    spriteKey: 'poke_bulbasaur',
    description: 'A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon.',
    starterMoves: ['tackle', 'growl', 'vine_whip'],
    learnset: [
      { level: 1, moveId: 'tackle' },
      { level: 1, moveId: 'growl' },
      { level: 3, moveId: 'vine_whip' },
    ],
  },

  charmander: {
    id: 'charmander',
    dexNumber: 4,
    name: 'Charmander',
    category: 'Lizard Pokémon',
    type1: TYPE.FIRE,
    type2: null,
    baseStats: {
      hp: 39,
      attack: 52,
      defense: 43,
      spAttack: 60,
      spDefense: 50,
      speed: 65,
    },
    baseExp: 62,
    catchRate: 45,
    spriteKey: 'poke_charmander',
    description: 'The flame at the tip of its tail indicates its emotions. Quietly flickers when happy, flares when enraged.',
    starterMoves: ['scratch', 'growl', 'ember'],
    learnset: [
      { level: 1, moveId: 'scratch' },
      { level: 1, moveId: 'growl' },
      { level: 3, moveId: 'ember' },
    ],
  },

  squirtle: {
    id: 'squirtle',
    dexNumber: 7,
    name: 'Squirtle',
    category: 'Tiny Turtle Pokémon',
    type1: TYPE.WATER,
    type2: null,
    baseStats: {
      hp: 44,
      attack: 48,
      defense: 65,
      spAttack: 50,
      spDefense: 64,
      speed: 43,
    },
    baseExp: 63,
    catchRate: 45,
    spriteKey: 'poke_squirtle',
    description: 'After birth, its back swells and hardens into a shell. Powerfully sprays foam from its mouth.',
    starterMoves: ['tackle', 'growl', 'water_gun'],
    learnset: [
      { level: 1, moveId: 'tackle' },
      { level: 1, moveId: 'growl' },
      { level: 3, moveId: 'water_gun' },
    ],
  },

  pidgey: {
    id: 'pidgey',
    dexNumber: 16,
    name: 'Pidgey',
    category: 'Tiny Bird Pokémon',
    type1: TYPE.NORMAL,
    type2: TYPE.FLYING,
    baseStats: {
      hp: 40,
      attack: 45,
      defense: 40,
      spAttack: 35,
      spDefense: 35,
      speed: 56,
    },
    baseExp: 50,
    catchRate: 255,
    spriteKey: 'poke_pidgey',
    description: 'Common in woods and routes. It flaps its wings at ground level to kick up blinding sand.',
    starterMoves: ['tackle', 'gust'],
    learnset: [
      { level: 1, moveId: 'tackle' },
      { level: 3, moveId: 'gust' },
      { level: 7, moveId: 'quick_attack' },
    ],
  },

  rattata: {
    id: 'rattata',
    dexNumber: 19,
    name: 'Rattata',
    category: 'Mouse Pokémon',
    type1: TYPE.NORMAL,
    type2: null,
    baseStats: {
      hp: 30,
      attack: 56,
      defense: 35,
      spAttack: 25,
      spDefense: 35,
      speed: 72,
    },
    baseExp: 51,
    catchRate: 255,
    spriteKey: 'poke_rattata',
    description: 'Bites anything when attacked. Small and very quick, it is a common sight in many places.',
    starterMoves: ['tackle', 'quick_attack'],
    learnset: [
      { level: 1, moveId: 'tackle' },
      { level: 4, moveId: 'quick_attack' },
      { level: 7, moveId: 'bite' },
    ],
  },

  pikachu: {
    id: 'pikachu',
    dexNumber: 25,
    name: 'Pikachu',
    category: 'Mouse Pokémon',
    type1: TYPE.ELECTRIC,
    type2: null,
    baseStats: {
      hp: 35,
      attack: 55,
      defense: 40,
      spAttack: 50,
      spDefense: 50,
      speed: 90,
    },
    baseExp: 112,
    catchRate: 190,
    spriteKey: 'poke_pikachu',
    description: 'When several of these Pokémon gather, their electricity could build and cause lightning storms.',
    starterMoves: ['thunder_shock', 'growl', 'quick_attack'],
    learnset: [
      { level: 1, moveId: 'thunder_shock' },
      { level: 1, moveId: 'growl' },
      { level: 4, moveId: 'quick_attack' },
    ],
  },
};

/**
 * Retrieves the species data definition by ID.
 * @param {string} speciesId
 * @returns {object}
 */
export function getSpecies(speciesId) {
  const species = POKEMON_SPECIES[speciesId.toLowerCase()];
  if (!species) {
    throw new Error(`Pokemon species '${speciesId}' does not exist in database.`);
  }
  return species;
}

