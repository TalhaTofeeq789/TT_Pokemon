/**
 * BattleManager.js
 *
 * Coordinates turn-based battle logic between the Player and a Wild Pokémon.
 * Uses a clean event-driven queue so the battle scene can smoothly display
 * combat animations, health bar deductions, and dialogue text sequentially.
 */

import { BattleCalculator } from './BattleCalculator.js';
import { CatchCalculator } from './CatchCalculator.js';

export const BATTLE_STATE = {
  INTRO: 'INTRO',
  COMMAND_SELECT: 'COMMAND_SELECT',
  MOVE_SELECT: 'MOVE_SELECT',
  EXECUTING: 'EXECUTING',
  VICTORY: 'VICTORY',
  DEFEAT: 'DEFEAT',
  ESCAPED: 'ESCAPED',
};

export default class BattleManager {
  /**
   * @param {Pokemon} playerPokemon
   * @param {Pokemon} wildPokemon
   */
  constructor(playerPokemon, wildPokemon) {
    this.playerPokemon = playerPokemon;
    this.wildPokemon = wildPokemon;

    this.state = BATTLE_STATE.INTRO;
    this.runAttempts = 0;
  }

  /**
   * Generates the sequence of combat events for a single turn where
   * the player selected a move.
   *
   * @param {PokemonMove} playerMove
   * @returns {Array<object>} event queue to execute sequentially
   */
  executePlayerMoveTurn(playerMove) {
    const events = [];
    playerMove.use();

    // 1. Pick wild Pokémon's move randomly from its learned moves
    const wildMoves = this.wildPokemon.moves.filter((m) => m.currentPp > 0);
    const wildMove = wildMoves.length > 0
      ? wildMoves[Math.floor(Math.random() * wildMoves.length)]
      : this.wildPokemon.moves[0];

    // 2. Determine turn priority based on speed
    const playerFirst = this.playerPokemon.speed >= this.wildPokemon.speed;
    const first = playerFirst
      ? { attacker: this.playerPokemon, defender: this.wildPokemon, move: playerMove, isPlayer: true }
      : { attacker: this.wildPokemon, defender: this.playerPokemon, move: wildMove, isPlayer: false };

    const second = playerFirst
      ? { attacker: this.wildPokemon, defender: this.playerPokemon, move: wildMove, isPlayer: false }
      : { attacker: this.playerPokemon, defender: this.wildPokemon, move: playerMove, isPlayer: true };

    // Execute first attack
    this._appendAttackEvents(events, first.attacker, first.defender, first.move, first.isPlayer);

    // If defender survived, execute second attack
    if (!first.defender.isFainted()) {
      second.move.use();
      this._appendAttackEvents(events, second.attacker, second.defender, second.move, second.isPlayer);
    }

    return events;
  }

  /**
   * Appends move execution, hit animations, damage, and fainting events to queue.
   */
  _appendAttackEvents(events, attacker, defender, move, isPlayer) {
    const attackerName = (isPlayer ? '' : 'Wild ') + attacker.name.toUpperCase();
    const defenderName = (isPlayer ? 'Wild ' : '') + defender.name.toUpperCase();

    // Announce attack
    events.push({
      type: 'MESSAGE',
      text: `${attackerName} used\n${move.name.toUpperCase()}!`,
    });

    // Calculate result
    const result = BattleCalculator.calculateDamage(attacker, defender, move);

    if (!result.hits) {
      events.push({ type: 'MESSAGE', text: result.effectivenessText });
      return;
    }

    // Hit animation
    events.push({
      type: 'ANIMATION_HIT',
      target: isPlayer ? 'wild' : 'player',
    });

    // Apply damage
    const damageDealt = defender.takeDamage(result.damage);
    events.push({
      type: 'HEALTH_UPDATE',
      target: isPlayer ? 'wild' : 'player',
      newHp: defender.currentHp,
      maxHp: defender.maxHp,
      damage: damageDealt,
    });

    // Effectiveness announcement
    if (result.isCrit) {
      events.push({ type: 'MESSAGE', text: 'A critical hit!' });
    }
    if (result.effectivenessText) {
      events.push({ type: 'MESSAGE', text: result.effectivenessText });
    }

    // Check if defender fainted
    if (defender.isFainted()) {
      events.push({
        type: 'FAINT',
        target: isPlayer ? 'wild' : 'player',
        text: `${defenderName} fainted!`,
      });

      if (isPlayer) {
        // Player defeated wild pokemon -> VICTORY!
        const expGain = BattleCalculator.calculateExpYield(this.wildPokemon);
        events.push({
          type: 'MESSAGE',
          text: `${this.playerPokemon.name.toUpperCase()} gained\n${expGain} EXP Points!`,
        });

        const levelResult = this.playerPokemon.gainExp(expGain);
        if (levelResult.leveledUp) {
          events.push({
            type: 'MESSAGE',
            text: `${this.playerPokemon.name.toUpperCase()} grew to\nLevel ${levelResult.newLevel}!`,
          });
        }

        events.push({ type: 'BATTLE_END', outcome: 'VICTORY' });
      } else {
        // Player's pokemon fainted
        events.push({ type: 'BATTLE_END', outcome: 'DEFEAT' });
      }
    }
  }

  /**
   * Executes a RUN attempt.
   */
  attemptRun() {
    this.runAttempts++;
    const success = BattleCalculator.calculateRunSuccess(
      this.playerPokemon,
      this.wildPokemon,
      this.runAttempts
    );

    const events = [];
    if (success) {
      events.push({ type: 'MESSAGE', text: 'Got away safely!' });
      events.push({ type: 'BATTLE_END', outcome: 'ESCAPED' });
    } else {
      events.push({ type: 'MESSAGE', text: "Can't escape!" });

      // Wild Pokemon gets a free attack!
      const wildMoves = this.wildPokemon.moves.filter((m) => m.currentPp > 0);
      const wildMove = wildMoves.length > 0 ? wildMoves[0] : this.wildPokemon.moves[0];
      this._appendAttackEvents(events, this.wildPokemon, this.playerPokemon, wildMove, false);
    }
    return events;
  }

  /**
   * Executes a Poké Ball throw sequence.
   * @param {object} ballItem
   * @param {Inventory} inventory
   * @param {PokemonParty} party
   * @param {PokemonStorage} storage
   * @returns {Array<object>} events queue
   */
  executeCatchAttempt(ballItem, inventory, party, storage) {
    const events = [];

    // Deduct ball from inventory
    if (inventory) {
      inventory.removeItem(ballItem.id, 1);
    }

    // 1. Throw announcement
    events.push({
      type: 'MESSAGE',
      text: `You threw one\n${ballItem.name.toUpperCase()}!`,
    });

    // 2. Ball throw animation
    events.push({
      type: 'ANIMATION_THROW_BALL',
    });

    // Calculate catch outcome
    const result = CatchCalculator.attemptCatch(this.wildPokemon, ballItem);

    // 3. Ball shake animation
    events.push({
      type: 'ANIMATION_BALL_SHAKE',
      shakes: result.shakes,
      caught: result.caught,
    });

    if (result.caught) {
      // 4. Capture success!
      events.push({
        type: 'MESSAGE',
        text: result.message,
      });

      // Party capacity handling
      let addedToParty = false;
      if (party) {
        addedToParty = party.add(this.wildPokemon);
      }

      if (addedToParty) {
        events.push({
          type: 'MESSAGE',
          text: `${this.wildPokemon.name.toUpperCase()} was added\nto your party!`,
        });
      } else {
        // Party is full -> Transfer to PC Storage!
        let boxText = "Bill's PC Storage!";
        if (storage) {
          const storeRes = storage.store(this.wildPokemon);
          boxText = `Bill's PC [${storeRes.boxName}]!`;
        }
        events.push({
          type: 'MESSAGE',
          text: `Party is full (6/6)!\nSent to ${boxText}`,
        });
      }

      events.push({ type: 'BATTLE_END', outcome: 'CAUGHT', pokemon: this.wildPokemon });
    } else {
      // 5. Broke free!
      events.push({
        type: 'ANIMATION_BALL_BREAK',
      });
      events.push({
        type: 'MESSAGE',
        text: result.message,
      });

      // Wild Pokémon retaliates!
      const wildMoves = this.wildPokemon.moves.filter((m) => m.currentPp > 0);
      const wildMove = wildMoves.length > 0 ? wildMoves[0] : this.wildPokemon.moves[0];
      this._appendAttackEvents(events, this.wildPokemon, this.playerPokemon, wildMove, false);
    }

    return events;
  }
}

