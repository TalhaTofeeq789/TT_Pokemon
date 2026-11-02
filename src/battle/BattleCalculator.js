/**
 * BattleCalculator.js
 *
 * Implements Pokémon damage formulas, accuracy checks, STAB,
 * critical hits, type-effectiveness, and run escape probability.
 */

import { getTypeEffectiveness } from '../pokemon/PokemonType.js';

export class BattleCalculator {
  /**
   * Calculates damage dealt by an attack.
   * @param {Pokemon} attacker
   * @param {Pokemon} defender
   * @param {PokemonMove} move
   * @returns {{
   *   damage: number,
   *   multiplier: number,
   *   isCrit: boolean,
   *   hits: boolean,
   *   effectivenessText: string
   * }}
   */
  static calculateDamage(attacker, defender, move) {
    // 1. Accuracy check
    const roll = Math.random() * 100;
    if (roll > move.accuracy) {
      return {
        damage: 0,
        multiplier: 1.0,
        isCrit: false,
        hits: false,
        effectivenessText: 'The attack missed!',
      };
    }

    // Status moves deal 0 direct damage
    if (move.power <= 0) {
      return {
        damage: 0,
        multiplier: 1.0,
        isCrit: false,
        hits: true,
        effectivenessText: '',
      };
    }

    // 2. Base Damage using standard Gen 1/2 damage formula
    const levelFactor = Math.floor((2 * attacker.level) / 5) + 2;

    // Stat selection (Physical vs Special)
    let attackStat = attacker.attack;
    let defenseStat = defender.defense;
    if (move.category === 'SPECIAL') {
      attackStat = attacker.spAttack;
      defenseStat = defender.spDefense;
    }

    // Base formula
    let baseDamage = Math.floor(
      (Math.floor((levelFactor * move.power * attackStat) / Math.max(1, defenseStat)) / 50) + 2
    );

    // 3. STAB (Same Type Attack Bonus: x1.5)
    let stab = 1.0;
    if (move.type === attacker.type1 || move.type === attacker.type2) {
      stab = 1.5;
    }

    // 4. Type effectiveness
    const multiplier = getTypeEffectiveness(move.type, defender.type1, defender.type2);

    // 5. Critical hit (1 in 16 chance = ~6.25%)
    const isCrit = Math.random() < 0.0625;
    const critBonus = isCrit ? 1.5 : 1.0;

    // 6. Random damage variance (85% to 100%)
    const randomVariance = (Math.floor(Math.random() * 16) + 85) / 100;

    // Final calculated damage
    let finalDamage = Math.floor(baseDamage * stab * multiplier * critBonus * randomVariance);

    // If move was not immune and hits, deals at least 1 damage
    if (multiplier > 0 && finalDamage <= 0) {
      finalDamage = 1;
    } else if (multiplier === 0) {
      finalDamage = 0;
    }

    // Effectiveness message
    let effectivenessText = '';
    if (multiplier >= 2.0) {
      effectivenessText = "It's super effective!";
    } else if (multiplier > 0 && multiplier < 1.0) {
      effectivenessText = "It's not very effective...";
    } else if (multiplier === 0) {
      effectivenessText = `It doesn't affect ${defender.name.toUpperCase()}...`;
    }

    return {
      damage: finalDamage,
      multiplier,
      isCrit,
      hits: true,
      effectivenessText,
    };
  }

  /**
   * Calculates escape chance from wild battle.
   * @param {Pokemon} playerPokemon
   * @param {Pokemon} wildPokemon
   * @param {number} attempts
   * @returns {boolean}
   */
  static calculateRunSuccess(playerPokemon, wildPokemon, attempts = 1) {
    if (playerPokemon.speed >= wildPokemon.speed) {
      return true; // Always escape if faster
    }
    const f = Math.floor(((playerPokemon.speed * 128) / wildPokemon.speed) + 30 * attempts) % 256;
    const roll = Math.floor(Math.random() * 256);
    return roll < f;
  }

  /**
   * Calculates experience awarded to victor.
   * @param {Pokemon} defeatedPokemon
   * @returns {number}
   */
  static calculateExpYield(defeatedPokemon) {
    const baseExp = defeatedPokemon.species.baseExp || 50;
    const exp = Math.floor((baseExp * defeatedPokemon.level) / 7);
    return Math.max(10, exp);
  }
}

