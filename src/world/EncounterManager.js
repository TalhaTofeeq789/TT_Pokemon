/**
 * EncounterManager.js
 *
 * Configurable wild Pokémon encounter tables by geographic region.
 * Computes spawn chances, levels, and species selection.
 */

import Pokemon from '../pokemon/Pokemon.js';

export const ENCOUNTER_TABLES = {
  pallet_town_grass: {
    rate: 0.15, // 15% chance per step
    pool: [
      { speciesId: 'pidgey', minLevel: 2, maxLevel: 4, weight: 45 },
      { speciesId: 'rattata', minLevel: 2, maxLevel: 4, weight: 40 },
      { speciesId: 'pikachu', minLevel: 3, maxLevel: 5, weight: 15 },
    ],
  },
  route_1_grass: {
    rate: 0.18,
    pool: [
      { speciesId: 'pidgey', minLevel: 3, maxLevel: 5, weight: 50 },
      { speciesId: 'rattata', minLevel: 3, maxLevel: 5, weight: 40 },
      { speciesId: 'pikachu', minLevel: 4, maxLevel: 6, weight: 10 },
    ],
  },
};

export class EncounterManager {
  /**
   * Evaluates if a wild encounter occurs on a step and generates the encounter.
   * @param {string} [areaKey='pallet_town_grass']
   * @returns {Pokemon | null}
   */
  static rollStep(areaKey = 'pallet_town_grass') {
    const table = ENCOUNTER_TABLES[areaKey] || ENCOUNTER_TABLES.pallet_town_grass;

    if (Math.random() >= table.rate) {
      return null;
    }

    // Pick species based on cumulative weight
    const totalWeight = table.pool.reduce((sum, entry) => sum + entry.weight, 0);
    let roll = Math.random() * totalWeight;

    for (const entry of table.pool) {
      if (roll < entry.weight) {
        const level = Math.floor(Math.random() * (entry.maxLevel - entry.minLevel + 1)) + entry.minLevel;
        return new Pokemon(entry.speciesId, level);
      }
      roll -= entry.weight;
    }

    // Fallback
    const first = table.pool[0];
    return new Pokemon(first.speciesId, first.minLevel);
  }
}

