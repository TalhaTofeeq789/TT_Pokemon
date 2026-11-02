/**
 * CatchCalculator.js
 *
 * Implements standard Pokémon catching probability formulas.
 * Factors in species catch rate, remaining HP percentage, ball multiplier,
 * and status conditions.
 */

export class CatchCalculator {
  /**
   * Attempts to catch a wild Pokémon.
   * @param {Pokemon} wildPokemon
   * @param {object} ballItem - metadata with catchMultiplier
   * @returns {{
   *   caught: boolean,
   *   shakes: number,
   *   message: string
   * }}
   */
  static attemptCatch(wildPokemon, ballItem) {
    const maxHp = wildPokemon.maxHp;
    const curHp = Math.max(1, wildPokemon.currentHp);
    const catchRate = wildPokemon.species.catchRate || 45;
    const ballMult = ballItem?.catchMultiplier || 1.0;

    // Status bonus
    let statusMult = 1.0;
    if (wildPokemon.status === 'sleep' || wildPokemon.status === 'freeze') {
      statusMult = 2.0;
    } else if (wildPokemon.status) {
      statusMult = 1.5;
    }

    // Classic Gen 1/2 catch formula value 'a' (0 to 255)
    const a = Math.floor(
      (((3 * maxHp - 2 * curHp) * catchRate * ballMult) / (3 * maxHp)) * statusMult
    );

    // Guaranteed capture threshold
    if (a >= 255) {
      return {
        caught: true,
        shakes: 3,
        message: `Gotcha! ${wildPokemon.name.toUpperCase()} was caught!`,
      };
    }

    // Shake probability check:
    // b = 65536 * (a / 255)^0.25
    // In integers: b = Math.floor(65536 * Math.sqrt(Math.sqrt(a / 255)))
    const b = Math.floor(65536 * Math.pow(Math.max(0.001, a / 255), 0.25));

    let shakes = 0;
    for (let i = 0; i < 4; i++) {
      const roll = Math.floor(Math.random() * 65536);
      if (roll < b) {
        shakes++;
      } else {
        break;
      }
    }

    if (shakes >= 4) {
      return {
        caught: true,
        shakes: 3,
        message: `Gotcha! ${wildPokemon.name.toUpperCase()} was caught!`,
      };
    }

    // Failure message based on number of shakes achieved
    let message = 'Oh no! The Pokémon broke free!';
    if (shakes === 1) {
      message = 'Aww! It appeared to be caught!';
    } else if (shakes === 2) {
      message = 'Aargh! Almost had it!';
    } else if (shakes === 3) {
      message = 'Shoot! It was so close, too!';
    }

    return {
      caught: false,
      shakes,
      message,
    };
  }
}

