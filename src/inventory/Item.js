/**
 * Item.js
 *
 * Defines item definitions and catalog (Poké Balls, Healing items, Key items).
 */

export const ITEM_CATEGORY = {
  BALL: 'BALL',
  MEDICINE: 'MEDICINE',
  KEY_ITEM: 'KEY_ITEM',
};

export const ITEM_DATABASE = {
  pokeball: {
    id: 'pokeball',
    name: 'Poké Ball',
    category: ITEM_CATEGORY.BALL,
    price: 200,
    catchMultiplier: 1.0,
    description: 'A device for catching wild Pokémon. It is thrown like a ball at the target.',
  },
  greatball: {
    id: 'greatball',
    name: 'Great Ball',
    category: ITEM_CATEGORY.BALL,
    price: 600,
    catchMultiplier: 1.5,
    description: 'A good, high-performance Ball that provides a higher catch rate than a standard Poké Ball.',
  },
  ultraball: {
    id: 'ultraball',
    name: 'Ultra Ball',
    category: ITEM_CATEGORY.BALL,
    price: 1200,
    catchMultiplier: 2.0,
    description: 'An ultra-high-performance Ball with a significantly higher catch rate than a Great Ball.',
  },
  potion: {
    id: 'potion',
    name: 'Potion',
    category: ITEM_CATEGORY.MEDICINE,
    price: 300,
    healAmount: 20,
    description: 'Restores the HP of one Pokémon by up to 20 points.',
  },
  super_potion: {
    id: 'super_potion',
    name: 'Super Potion',
    category: ITEM_CATEGORY.MEDICINE,
    price: 700,
    healAmount: 50,
    description: 'Restores the HP of one Pokémon by up to 50 points.',
  },
};

/**
 * Retrieves item metadata by id.
 * @param {string} itemId
 * @returns {object}
 */
export function getItem(itemId) {
  return ITEM_DATABASE[itemId] || null;
}

