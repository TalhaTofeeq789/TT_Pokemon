/**
 * GameScene.js
 *
 * Phase 5: Interaction — NPCs, Signs, Doors, and Dialogue Box
 *
 * Coordinates:
 *  - TileMap world (Pallet Town)
 *  - NPCs (Prof. Oak, Mom, Rival Blue, Lass Lily) with animations and directional facing
 *  - Dialogue Box system with typewriter effect, multi-page progression, and speaker badges
 *  - Interactive signs and doors
 *  - Full collision handling between Player, Map, and NPCs
 */

import {
  SCENES,
  GAME_WIDTH,
  GAME_HEIGHT,
  TILE_SIZE,
  WORLD_SCALE,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  PLAYER_START_X,
  PLAYER_START_Y,
} from '../utils/Constants.js';
import SpriteGenerator from '../utils/SpriteGenerator.js';
import MapManager from '../world/MapManager.js';
import NPCManager from '../world/NPCManager.js';
import DialogueBox from '../ui/DialogueBox.js';
import PokemonParty from '../pokemon/PokemonParty.js';
import PokemonStorage from '../pokemon/PokemonStorage.js';
import Inventory from '../inventory/Inventory.js';
import { EncounterManager } from '../world/EncounterManager.js';
import Pokemon from '../pokemon/Pokemon.js';
import Player from '../player/Player.js';
import PlayerController from '../player/PlayerController.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.GAME });

    this._mapManager = null;
    this._npcManager = null;
    this._dialogueBox = null;
    this._player = null;
    this._controller = null;
    this._debugText = null;
    this._isPaused = false;
    this._inBattle = false;
    this._lastTilePos = { x: -1, y: -1 };
  }

  // ─── Phaser lifecycle ────────────────────────────────────────────────────────

  create() {
    // 1. Generate placeholder sprites, NPCs, and tileset
    SpriteGenerator.generateAll(this);

    // 2. Build the tilemap world
    this._mapManager = new MapManager(this);
    this._mapManager.createMap();

    // 3. Create player at starting tile position
    const startPixelX = PLAYER_START_X * TILE_SIZE * WORLD_SCALE + (TILE_SIZE * WORLD_SCALE) / 2;
    const startPixelY = PLAYER_START_Y * TILE_SIZE * WORLD_SCALE + (TILE_SIZE * WORLD_SCALE) / 2;
    this._player = new Player(this, startPixelX, startPixelY);

    // 4. Setup NPCs and spawn inhabitants
    this._npcManager = new NPCManager(this);
    this._npcManager.spawnTownInhabitants();

    // 5. Physics collisions: Player vs Map and Player vs NPCs
    this._mapManager.setupCollision(this._player.sprite);
    this._npcManager.setupCollision(this._player.sprite);

    // 6. Setup keyboard controller
    this._controller = new PlayerController(this);

    // 7. Setup Dialogue Box UI
    this._dialogueBox = new DialogueBox(this);

    // 8. Player Pokemon Party & PC Storage
    this.playerParty = new PokemonParty();
    this.storage = new PokemonStorage();

    // 9. Player Inventory (starts with 5 Poké Balls and 2 Potions)
    this.inventory = new Inventory();

    // 8. Configure camera to follow the player within world bounds
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.startFollow(this._player.sprite, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.0);

    // 9. World bounds for arcade physics
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // 10. Debug info & controls hints
    this._createDebugOverlay();
    this._createControlsHint();

    // Camera fade-in
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  update() {
    if (this._isPaused || this._inBattle) return;

    // Read input from keyboard
    const input = this._controller.getInput();

    // ── DIALOGUE MODE ──────────────────────────────────────────────────────
    if (this._dialogueBox.isOpen()) {
      // Freeze player movement while reading dialogue
      this._player.stopMovement();

      // Interaction key advances text
      if (input.interacting) {
        this._dialogueBox.advance();
      }
      return;
    }

    // ── EXPLORATION MODE ───────────────────────────────────────────────────
    this._player.move(input.dx, input.dy);

    // Check step into tall grass for wild encounter
    const tilePos = this._player.getTilePosition();
    if (tilePos.x !== this._lastTilePos.x || tilePos.y !== this._lastTilePos.y) {
      this._lastTilePos = { x: tilePos.x, y: tilePos.y };
      this._checkWildEncounter(tilePos);
    }

    if (input.interacting) {
      this._handleInteraction();
    }

    if (input.pausing) {
      this._handlePause();
    }

    this._updateDebug();
  }

  // ─── Interaction ─────────────────────────────────────────────────────────────

  _handleInteraction() {
    const facingTile = this._player.getFacingTilePosition();
    const playerTile = this._player.getTilePosition();

    // 1. Check if facing an NPC
    const npc = this._npcManager.getNPCAt(facingTile.x, facingTile.y);
    if (npc) {
      // Turn NPC to face player while speaking
      npc.facePlayer(playerTile.x, playerTile.y);
      this._player.stopMovement();

      this._dialogueBox.show(npc.name, npc.getDialogue(), () => {
        npc.resetFacing();
        if (npc.onTalk) npc.onTalk();
      });
      return;
    }

    // 2. Check if facing a Sign
    const sign = this._mapManager.getSignAt(facingTile.x, facingTile.y);
    if (sign) {
      this._player.stopMovement();
      this._dialogueBox.show('NOTICE', sign.text);
      return;
    }

    // 3. Check if facing a Door
    const door = this._mapManager.getDoorAt(facingTile.x, facingTile.y);
    if (door) {
      this._player.stopMovement();
      this._dialogueBox.show('DOOR', [
        `You stand outside ${door.name}.`,
        'The door is closed. You can hear quiet activity inside.',
      ]);
      return;
    }

    // 4. Solid obstacle inspection
    if (this._mapManager.isTileSolid(facingTile.x, facingTile.y)) {
      this._player.stopMovement();
      this._dialogueBox.show('', 'Nothing of interest here.');
    }
  }

  // ─── Starter Selection Flow ──────────────────────────────────────────────────

  triggerStarterSelection() {
    this._player.stopMovement();
    let launched = false;

    const launchSelect = () => {
      if (launched) return;
      launched = true;
      this.scene.pause();
      this.scene.launch(SCENES.STARTER_SELECT, {
        party: this.playerParty,
        onComplete: (starter) => this._onStarterChosen(starter),
      });
    };

    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', launchSelect);
    this.time.delayedCall(400, launchSelect);
  }

  _onStarterChosen(starter) {
    this.scene.resume();
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // Oak congratulates the player
    this.time.delayedCall(300, () => {
      this._dialogueBox.show('PROF. OAK', [
        `Ah! You chose ${starter.name.toUpperCase()}!`,
        `It is energetic and full of vitality! Treat it with great care!`,
        'Now that you have a Pokémon companion, you are ready to venture north into Route 1!',
      ]);
    });
  }

  // ─── Wild Encounters & Battle System ─────────────────────────────────────────

  _checkWildEncounter(tilePos) {
    if (!this._mapManager.isTallGrass(tilePos.x, tilePos.y)) return;

    // Check if player has at least one usable Pokémon
    if (!this.playerParty || !this.playerParty.hasAblePokemon()) {
      this._player.stopMovement();
      this._dialogueBox.show('PROF. OAK', [
        "OAK: Wait! Don't wander out into the tall grass alone!",
        'Wild Pokémon inhabit the grass!',
        'Come speak with me in the town square to choose your first Pokémon partner!',
      ]);
      return;
    }

    // Roll encounter through encounter manager
    const wildPokemon = EncounterManager.rollStep('pallet_town_grass');
    if (wildPokemon) {
      this._triggerWildBattle(wildPokemon);
    }
  }

  _triggerWildBattle(wildPokemon) {
    this._inBattle = true;
    this._player.stopMovement();

    const playerPokemon = this.playerParty.getFirstAble();

    // Screen flash & battle transition
    this.cameras.main.flash(400, 255, 255, 255);
    this.cameras.main.shake(300, 0.015);

    this.time.delayedCall(400, () => {
      let launched = false;
      const launchBattle = () => {
        if (launched) return;
        launched = true;
        this.scene.pause();
        this.scene.launch(SCENES.BATTLE, {
          playerPokemon,
          wildPokemon,
          inventory: this.inventory,
          party: this.playerParty,
          storage: this.storage,
          onBattleEnd: (outcome) => this._onBattleEnd(outcome),
        });
      };

      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', launchBattle);
      this.time.delayedCall(350, launchBattle);
    });
  }

  _onBattleEnd(outcome) {
    this._inBattle = false;
    this.scene.resume();
    this.cameras.main.fadeIn(500, 0, 0, 0);

    if (outcome === 'DEFEAT') {
      // Wiped out -> Mom rushes to aid
      this.playerParty.healAll();
      const homeX = 9 * TILE_SIZE * WORLD_SCALE;
      const homeY = 14 * TILE_SIZE * WORLD_SCALE;
      this._player.setPosition(homeX, homeY);

      this.time.delayedCall(400, () => {
        this._dialogueBox.show('MOM', [
          'Oh no! You and your Pokémon fainted from the battle!',
          'I carried you home and gave your team a full rest...',
          'Be more careful next time, sweetie!',
        ]);
      });
    } else if (outcome === 'CAUGHT') {
      this.time.delayedCall(300, () => {
        const stored = this.storage.getTotalStoredCount();
        const storedText = stored > 0 ? ` (${stored} in PC Box)` : '';
        this._dialogueBox.show('', [
          `Capture Successful!`,
          `Party: ${this.playerParty.count}/6 Pokémon${storedText}.`,
        ]);
      });
    } else if (outcome === 'VICTORY') {
      this.time.delayedCall(300, () => {
        this._dialogueBox.show('', 'Victory! You defeated the wild Pokémon!');
      });
    }
  }

  // ─── Pause ───────────────────────────────────────────────────────────────────

  _handlePause() {
    if (this._dialogueBox.isOpen() || this._inBattle) return;

    this._dialogueBox.show('PAUSE', [
      'Game Paused.',
      'Phase 7: Turn-based battles are active! Walk in tall grass to battle!',
    ]);
  }

  // ─── Overlays ────────────────────────────────────────────────────────────────

  _createDebugOverlay() {
    this._debugText = this.add.text(12, 12, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      lineSpacing: 5,
    }).setScrollFactor(0).setDepth(100);
  }

  _createControlsHint() {
    const hintBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 16, GAME_WIDTH, 26, 0x000000, 0.75)
      .setScrollFactor(0).setDepth(99);

    const hintText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT - 16,
      '↑↓←→ / WASD: Move    Z / Space: Talk & Read    ESC: Pause',
      {
        fontFamily: '"Press Start 2P"',
        fontSize: '7px',
        fill: '#fde047',
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(100);
  }

  _updateDebug() {
    const tilePos = this._player.getTilePosition();
    const facingPos = this._player.getFacingTilePosition();
    const inTallGrass = this._mapManager.isTallGrass(tilePos.x, tilePos.y);

    let status = inTallGrass ? '🌿 [TALL GRASS - WILD ZONE]' : '🚶 Walking';

    let partyInfo = 'None (Talk to Prof. Oak!)';
    if (this.playerParty && this.playerParty.count > 0) {
      const lead = this.playerParty.get(0);
      partyInfo = `${lead.name.toUpperCase()} Lv.${lead.level} (${lead.currentHp}/${lead.maxHp} HP)`;
    }

    let ballsCount = this.inventory ? this.inventory.getCount('pokeball') : 0;
    let storageCount = this.storage ? this.storage.getTotalStoredCount() : 0;

    this._debugText.setText(
      `Pallet Town\n` +
      `Tile: (${tilePos.x}, ${tilePos.y})\n` +
      `Facing: ${this._player.facing} (${facingPos.x}, ${facingPos.y})\n` +
      `Team Lead: ${partyInfo}\n` +
      `Party: ${this.playerParty.count}/6 | PC: ${storageCount} | Balls: ${ballsCount}\n` +
      `Phase 8: Catching & Poké Balls ✓`
    );
  }

  // ─── Scene cleanup ───────────────────────────────────────────────────────────

  shutdown() {
    this._player?.destroy();
    this._controller?.destroy();
    this._npcManager?.destroy();
    this._dialogueBox?.destroy();
  }
}
