/**
 * NPCManager.js
 *
 * Spawns and manages all Non-Player Characters across the world.
 * Sets up collision between characters and provides tile-based lookup.
 */

import NPC from './NPC.js';
import { DIRECTION } from '../player/Player.js';

export default class NPCManager {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this._scene = scene;
    this._npcs = [];
    this._npcGroup = scene.physics.add.group();
  }

  /**
   * Spawns all inhabitants of Pallet Town.
   */
  spawnTownInhabitants() {
    // 1. Professor Oak (Standing near Town Center / Route 1 junction)
    this.addNPC(19, 14, 'npc_oak', {
      id: 'prof_oak',
      name: 'Prof. Oak',
      facing: DIRECTION.DOWN,
      dialogue: () => {
        const party = this._scene.playerParty;
        if (!party || party.count === 0) {
          return [
            'Hello there! Welcome to the wonderful world of Pokémon!',
            'My name is OAK. People affectionately refer to me as the Pokémon Professor.',
            'Before you can safely explore the wild grass north of town, you will need a companion.',
            'Here! I have prepared three rare Pokémon for you. Choose wisely!',
          ];
        } else {
          const lead = party.get(0);
          return [
            `How is your ${lead.name.toUpperCase()} doing, young trainer?`,
            'Raise it with love and care, and battle wild Pokémon to grow together!',
            'Remember: Grass beats Water, Water douses Fire, and Fire burns Grass!',
          ];
        }
      },
      onTalk: () => {
        const party = this._scene.playerParty;
        if (!party || party.count === 0) {
          this._scene.triggerStarterSelection();
        }
      },
    });

    // 2. Mom (Standing near player house garden)
    this.addNPC(7, 13, 'npc_mom', {
      id: 'mom',
      name: 'Mom',
      facing: DIRECTION.DOWN,
      dialogue: () => {
        const party = this._scene.playerParty;
        if (party && party.count > 0) {
          party.healAll();
          return [
            'Welcome home, sweetie! You and your Pokémon look exhausted from traveling.',
            'Here, let me fix you some warm soup and rest your team...',
            'Your Pokémon have been restored to full health!',
          ];
        }
        return [
          'Right! All ambitious young trainers leave home someday. It said so on TV.',
          'Prof. Oak was looking for you in the town square earlier, sweetie.',
          'Make sure to bundle up and take good care of yourself out there!',
        ];
      },
    });

    // 3. Rival Blue (Standing near rival house entrance)
    this.addNPC(28, 13, 'npc_rival', {
      id: 'rival_blue',
      name: 'Blue',
      facing: DIRECTION.DOWN,
      dialogue: () => {
        const party = this._scene.playerParty;
        if (party && party.count > 0) {
          const lead = party.get(0);
          return [
            `So you chose ${lead.name.toUpperCase()} as your partner?`,
            'Hah! I picked the one with the type advantage over yours!',
            'Get ready, because my team is going to be unstoppable! Smell ya later!',
          ];
        }
        return [
          'Yo! Gramps said he prepared three rare Pokémon for us at his lab!',
          'No matter which one you choose, I am picking the one with the type advantage.',
          'Smell ya later, Red!',
        ];
      },
    });

    // 4. Lass Lily (Town square guide near the monument)
    this.addNPC(18, 17, 'npc_girl', {
      id: 'lass_lily',
      name: 'Lass Lily',
      facing: DIRECTION.LEFT,
      dialogue: [
        'Technology is incredible! You can catch wild Pokémon in Poké Balls and carry them anywhere.',
        'Whenever you step into tall grass, wild Pokémon might appear and challenge you to a battle!',
        'Make sure your team has full health before venturing further north!',
      ],
    });
  }

  /**
   * Instantiates an NPC, registers it with physics, and tracks it.
   */
  addNPC(tileX, tileY, textureKey, options) {
    const npc = new NPC(this._scene, tileX, tileY, textureKey, options);
    this._npcs.push(npc);
    this._npcGroup.add(npc.sprite);
    return npc;
  }

  /**
   * Sets up physics collision between the player sprite and all NPCs.
   * @param {Phaser.Physics.Arcade.Sprite} playerSprite
   */
  setupCollision(playerSprite) {
    this._scene.physics.add.collider(playerSprite, this._npcGroup);
  }

  /**
   * Finds the NPC situated at the specified tile coordinates.
   * @param {number} tileX
   * @param {number} tileY
   * @returns {NPC | null}
   */
  getNPCAt(tileX, tileY) {
    return this._npcs.find((n) => n.tileX === tileX && n.tileY === tileY) || null;
  }

  /**
   * Destroys all spawned NPCs.
   */
  destroy() {
    this._npcs.forEach((n) => n.destroy());
    this._npcs = [];
    this._npcGroup.destroy(true);
  }
}

