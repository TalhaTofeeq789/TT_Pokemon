/**
 * SpriteGenerator.js
 *
 * Generates placeholder pixel-art sprites directly in code using
 * Phaser's Graphics object, then converts them to textures.
 *
 * WHY: We don't have real sprite sheet image files yet.
 * This lets us run and test the game immediately without external assets.
 * In Phase 10 (polish), these are replaced with real artwork.
 *
 * Each method creates a texture that any Phaser scene can use via
 * this.add.sprite(x, y, 'texture_key') or physics.add.sprite(...)
 */

import { ASSETS } from './Constants.js';
import { TILE } from '../world/TileIds.js';

export default class SpriteGenerator {
  /**
   * Call this once in a scene's create() or preload() method.
   * Generates all placeholder textures and stores them in Phaser's texture cache.
   * @param {Phaser.Scene} scene - The scene to generate textures in
   */
  static generateAll(scene) {
    SpriteGenerator.generatePlayerSpritesheet(scene);
    SpriteGenerator.generateNPCSpritesheet(scene);
    SpriteGenerator.generateAllNPCSpritesheets(scene);
    SpriteGenerator.generateUITextures(scene);
    SpriteGenerator.generateTileset(scene);
    SpriteGenerator.generatePokemonSprites(scene);
  }

  /**
   * Generates a 4-direction walking spritesheet for the player.
   *
   * Layout (each frame is 16x16 px):
   *  Row 0 (y=0):   Walking DOWN  — frames 0, 1, 2, 3
   *  Row 1 (y=16):  Walking LEFT  — frames 4, 5, 6, 7
   *  Row 2 (y=32):  Walking RIGHT — frames 8, 9, 10, 11
   *  Row 3 (y=48):  Walking UP    — frames 12, 13, 14, 15
   *
   * Total texture: 64 x 64 px
   */
  static generatePlayerSpritesheet(scene) {
    if (scene.textures.exists('player')) return;

    const FRAME_W = 16;
    const FRAME_H = 16;
    const COLS = 4;
    const ROWS = 4; // down, left, right, up

    const gfx = scene.make.graphics({ x: 0, y: 0, add: false });

    const directions = ['down', 'left', 'right', 'up'];

    directions.forEach((dir, row) => {
      for (let col = 0; col < COLS; col++) {
        const x = col * FRAME_W;
        const y = row * FRAME_H;
        const walkPhase = col % 2; // 0 = neutral, 1 = step

        // Body (trainer coat — blue)
        gfx.fillStyle(0x3355cc);
        gfx.fillRect(x + 4, y + 6, 8, 7);

        // Skin tone (face + hands)
        gfx.fillStyle(0xffcc99);
        // Head
        gfx.fillRect(x + 4, y + 1, 8, 6);
        // Hands
        gfx.fillRect(x + 2, y + 8, 2, 3);
        gfx.fillRect(x + 12, y + 8, 2, 3);

        // Pants (dark blue)
        gfx.fillStyle(0x223388);
        gfx.fillRect(x + 4, y + 11, 8, 3);

        // Shoes
        gfx.fillStyle(0x442211);
        if (walkPhase === 0) {
          // Standing: both feet down
          gfx.fillRect(x + 4, y + 14, 3, 2);
          gfx.fillRect(x + 9, y + 14, 3, 2);
        } else {
          // Walking: alternate feet
          const step = (col === 1 || col === 3) ? 1 : -1;
          gfx.fillRect(x + 4 + step, y + 14, 3, 2);
          gfx.fillRect(x + 9 - step, y + 14, 3, 2);
        }

        // Hair (dark brown)
        gfx.fillStyle(0x553311);
        gfx.fillRect(x + 4, y + 1, 8, 2);

        // Eyes - direction specific
        gfx.fillStyle(0x222222);
        if (dir === 'down') {
          gfx.fillRect(x + 5, y + 4, 2, 2);
          gfx.fillRect(x + 9, y + 4, 2, 2);
        } else if (dir === 'up') {
          // Facing away — no visible eyes, just back of head
          gfx.fillStyle(0x553311);
          gfx.fillRect(x + 4, y + 1, 8, 5);
        } else if (dir === 'left') {
          gfx.fillRect(x + 5, y + 4, 2, 2);
        } else if (dir === 'right') {
          gfx.fillRect(x + 9, y + 4, 2, 2);
        }

        // Red cap
        gfx.fillStyle(0xdd2222);
        gfx.fillRect(x + 3, y + 1, 10, 2);
        gfx.fillRect(x + 2, y + 3, 12, 1);
        if (dir === 'down' || dir === 'left') {
          // Brim facing down/left
          gfx.fillRect(x + 2, y + 2, 4, 1);
        } else if (dir === 'right') {
          gfx.fillRect(x + 10, y + 2, 4, 1);
        }
      }
    });

    // Bake the graphics into a texture
    gfx.generateTexture('player', FRAME_W * COLS, FRAME_H * ROWS);
    gfx.destroy();

    // Slice the texture into 16x16 individual animation frames (0-15)
    SpriteGenerator._sliceIntoFrames(scene, 'player', FRAME_W, FRAME_H, COLS, ROWS);
  }

  /**
   * Generates a simple NPC spritesheet (green-coat character).
   * Same layout as player: 4 directions × 4 frames.
   */
  static generateNPCSpritesheet(scene) {
    if (scene.textures.exists('npc')) return;

    const FRAME_W = 16;
    const FRAME_H = 16;
    const COLS = 4;
    const ROWS = 4;

    const gfx = scene.make.graphics({ x: 0, y: 0, add: false });

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const x = col * FRAME_W;
        const y = row * FRAME_H;

        // Body (green coat)
        gfx.fillStyle(0x336633);
        gfx.fillRect(x + 4, y + 6, 8, 7);
        // Face
        gfx.fillStyle(0xffddaa);
        gfx.fillRect(x + 4, y + 1, 8, 6);
        // Eyes
        gfx.fillStyle(0x222222);
        gfx.fillRect(x + 5, y + 4, 2, 2);
        gfx.fillRect(x + 9, y + 4, 2, 2);
        // Hair
        gfx.fillStyle(0xddaa44);
        gfx.fillRect(x + 4, y + 1, 8, 2);
        // Pants
        gfx.fillStyle(0x443322);
        gfx.fillRect(x + 4, y + 11, 8, 3);
        // Shoes
        gfx.fillStyle(0x222222);
        gfx.fillRect(x + 4, y + 14, 3, 2);
        gfx.fillRect(x + 9, y + 14, 3, 2);
      }
    }

    gfx.generateTexture('npc', FRAME_W * COLS, FRAME_H * ROWS);
    gfx.destroy();

    SpriteGenerator._sliceIntoFrames(scene, 'npc', FRAME_W, FRAME_H, COLS, ROWS);
  }

  /**
   * Generates themed NPC spritesheets for Pallet Town inhabitants.
   */
  static generateAllNPCSpritesheets(scene) {
    // 1. Professor Oak (Lab coat, gray hair, red collar)
    SpriteGenerator._generateCustomCharacter(scene, 'npc_oak', {
      bodyColor: 0xf8fafc,    // White lab coat
      accentColor: 0xd97706,  // Tan undershirt
      hairColor: 0x94a3b8,    // Gray professor hair
      pantsColor: 0x78350f,   // Brown slacks
      shoesColor: 0x1e293b,
      skinColor: 0xfde047,
    });

    // 2. Mom (Warm pink sweater, dark apron, brown hair)
    SpriteGenerator._generateCustomCharacter(scene, 'npc_mom', {
      bodyColor: 0xf43f5e,    // Rose apron
      accentColor: 0xffedd5,  // Cream blouse
      hairColor: 0x713f12,    // Brunette bun
      pantsColor: 0x2563eb,   // Long blue skirt
      shoesColor: 0x881337,
      skinColor: 0xffddaa,
    });

    // 3. Rival Blue (Purple shirt, spiky dark brown hair)
    SpriteGenerator._generateCustomCharacter(scene, 'npc_rival', {
      bodyColor: 0x7c3aed,    // Purple shirt
      accentColor: 0x1e1b4b,  // Dark pendant
      hairColor: 0xa16207,    // Spiky brownish-orange hair
      pantsColor: 0x334155,   // Dark jeans
      shoesColor: 0x0f172a,
      skinColor: 0xffddaa,
    });

    // 4. Town Lass / Guide (Teal dress, blonde hair)
    SpriteGenerator._generateCustomCharacter(scene, 'npc_girl', {
      bodyColor: 0x0d9488,    // Teal dress
      accentColor: 0xfffbeb,  // White ribbon
      hairColor: 0xfacc15,    // Blonde hair
      pantsColor: 0x0f766e,   // Skirt fold
      shoesColor: 0x475569,
      skinColor: 0xffddaa,
    });
  }

  /**
   * Helper that procedurally bakes a 4x4 walking spritesheet for any character.
   */
  static _generateCustomCharacter(scene, key, colors) {
    if (scene.textures.exists(key)) return;

    const FRAME_W = 16;
    const FRAME_H = 16;
    const COLS = 4;
    const ROWS = 4;

    const gfx = scene.make.graphics({ x: 0, y: 0, add: false });
    const directions = ['down', 'left', 'right', 'up'];

    directions.forEach((dir, row) => {
      for (let col = 0; col < COLS; col++) {
        const x = col * FRAME_W;
        const y = row * FRAME_H;
        const walkPhase = col % 2;

        // Torso / Shirt / Coat
        gfx.fillStyle(colors.bodyColor);
        gfx.fillRect(x + 4, y + 6, 8, 7);

        // Accent / Collar
        if (colors.accentColor) {
          gfx.fillStyle(colors.accentColor);
          gfx.fillRect(x + 6, y + 6, 4, 3);
        }

        // Face
        gfx.fillStyle(colors.skinColor || 0xffddaa);
        gfx.fillRect(x + 4, y + 1, 8, 6);

        // Eyes
        gfx.fillStyle(0x1e293b);
        if (dir === 'down') {
          gfx.fillRect(x + 5, y + 4, 2, 2);
          gfx.fillRect(x + 9, y + 4, 2, 2);
        } else if (dir === 'left') {
          gfx.fillRect(x + 5, y + 4, 2, 2);
        } else if (dir === 'right') {
          gfx.fillRect(x + 9, y + 4, 2, 2);
        } else if (dir === 'up') {
          // Facing away, show hair covering back of head
          gfx.fillStyle(colors.hairColor);
          gfx.fillRect(x + 4, y + 1, 8, 6);
        }

        // Hair
        gfx.fillStyle(colors.hairColor);
        gfx.fillRect(x + 4, y + 1, 8, 2);
        if (dir !== 'up') {
          gfx.fillRect(x + 3, y + 2, 2, 3);
          gfx.fillRect(x + 11, y + 2, 2, 3);
        }

        // Legs / Skirt
        gfx.fillStyle(colors.pantsColor);
        gfx.fillRect(x + 4, y + 11, 8, 3);

        // Feet / Shoes
        gfx.fillStyle(colors.shoesColor);
        if (walkPhase === 0) {
          gfx.fillRect(x + 4, y + 14, 3, 2);
          gfx.fillRect(x + 9, y + 14, 3, 2);
        } else {
          const step = (col === 1 || col === 3) ? 1 : -1;
          gfx.fillRect(x + 4 + step, y + 14, 3, 2);
          gfx.fillRect(x + 9 - step, y + 14, 3, 2);
        }
      }
    });

    gfx.generateTexture(key, FRAME_W * COLS, FRAME_H * ROWS);
    gfx.destroy();

    SpriteGenerator._sliceIntoFrames(scene, key, FRAME_W, FRAME_H, COLS, ROWS);
  }

  /**
   * Slices a texture into standard grid animation frames (indices 0..N-1).
   */
  static _sliceIntoFrames(scene, textureKey, frameWidth, frameHeight, cols, rows) {
    const texture = scene.textures.get(textureKey);
    if (!texture) return;

    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        texture.add(idx, 0, c * frameWidth, r * frameHeight, frameWidth, frameHeight);
        idx++;
      }
    }
  }

  /**
   * Generates reusable UI panel textures.
   */
  static generateUITextures(scene) {
    if (!scene.textures.exists('panel_white')) {
      const g = scene.make.graphics({ x: 0, y: 0, add: false });
      // White panel with dark border
      g.fillStyle(0xffffff);
      g.fillRect(0, 0, 256, 64);
      g.lineStyle(3, 0x333333, 1);
      g.strokeRect(1, 1, 254, 62);
      g.generateTexture('panel_white', 256, 64);
      g.destroy();
    }
  }

  /**
   * Generates a complete 16x16 tileset image for the world map.
   * Stripped horizontally (320x16 px) so tile index directly corresponds
   * to index * 16 on the X axis.
   */
  static generateTileset(scene) {
    if (scene.textures.exists(ASSETS.TILESET_WORLD)) return;

    const TILE_COUNT = 20;
    const TS = 16;
    const g = scene.make.graphics({ x: 0, y: 0, add: false });

    for (let i = 0; i < TILE_COUNT; i++) {
      const x = i * TS;
      const y = 0;

      switch (i) {
        case TILE.GRASS: {
          // Base grass
          g.fillStyle(0x56a64b);
          g.fillRect(x, y, TS, TS);
          // Darker blades
          g.fillStyle(0x438639);
          g.fillRect(x + 3, y + 2, 2, 2);
          g.fillRect(x + 11, y + 4, 2, 2);
          g.fillRect(x + 7, y + 10, 2, 2);
          // Lighter blade tips
          g.fillStyle(0x6ec060);
          g.fillRect(x + 3, y + 1, 2, 1);
          g.fillRect(x + 11, y + 3, 2, 1);
          g.fillRect(x + 7, y + 9, 2, 1);
          break;
        }

        case TILE.TALL_GRASS: {
          // Wild grass (battle encounter zone)
          g.fillStyle(0x38782f);
          g.fillRect(x, y, TS, TS);
          // Tall tufts
          g.fillStyle(0x285922);
          g.fillRect(x + 1, y + 3, 4, 13);
          g.fillRect(x + 7, y + 1, 4, 15);
          g.fillRect(x + 12, y + 4, 3, 12);
          // Highlight tips
          g.fillStyle(0x5cb84d);
          g.fillRect(x + 2, y + 1, 2, 3);
          g.fillRect(x + 8, y + 0, 2, 3);
          g.fillRect(x + 13, y + 2, 2, 3);
          break;
        }

        case TILE.PATH: {
          // Sandy path
          g.fillStyle(0xdeb887);
          g.fillRect(x, y, TS, TS);
          // Path texture speckles
          g.fillStyle(0xc89e6c);
          g.fillRect(x + 2, y + 3, 2, 1);
          g.fillRect(x + 8, y + 9, 2, 1);
          g.fillRect(x + 12, y + 5, 2, 1);
          g.fillRect(x + 5, y + 13, 2, 1);
          break;
        }

        case TILE.PATH_BORDER: {
          // Path with grass border top
          g.fillStyle(0xdeb887);
          g.fillRect(x, y, TS, TS);
          g.fillStyle(0x56a64b);
          g.fillRect(x, y, TS, 4);
          g.fillStyle(0x438639);
          g.fillRect(x, y + 3, TS, 1);
          break;
        }

        case TILE.WATER: {
          // Water tile
          g.fillStyle(0x3b82f6);
          g.fillRect(x, y, TS, TS);
          // Water ripples
          g.fillStyle(0x60a5fa);
          g.fillRect(x + 2, y + 4, 5, 2);
          g.fillRect(x + 9, y + 10, 5, 2);
          g.fillStyle(0x93c5fd);
          g.fillRect(x + 3, y + 4, 3, 1);
          g.fillRect(x + 10, y + 10, 3, 1);
          break;
        }

        case TILE.WATER_EDGE: {
          // Water shoreline (sand edge top)
          g.fillStyle(0x3b82f6);
          g.fillRect(x, y, TS, TS);
          g.fillStyle(0xdeb887);
          g.fillRect(x, y, TS, 4);
          g.fillStyle(0x60a5fa);
          g.fillRect(x, y + 4, TS, 2);
          break;
        }

        case TILE.TREE_TOP: {
          // Tree foliage top
          g.fillStyle(0x56a64b); // grass background
          g.fillRect(x, y, TS, TS);
          // Canopy circle
          g.fillStyle(0x1e5a22);
          g.fillCircle(x + 8, y + 8, 7);
          g.fillStyle(0x2e7d32);
          g.fillCircle(x + 8, y + 7, 5);
          g.fillStyle(0x4caf50);
          g.fillRect(x + 6, y + 4, 4, 3);
          break;
        }

        case TILE.TREE_BOTTOM: {
          // Tree trunk & lower canopy
          g.fillStyle(0x56a64b);
          g.fillRect(x, y, TS, TS);
          // Lower canopy overhang
          g.fillStyle(0x1e5a22);
          g.fillRect(x + 2, y, 12, 5);
          // Trunk
          g.fillStyle(0x6d4c41);
          g.fillRect(x + 6, y + 5, 4, 8);
          // Bark shadow
          g.fillStyle(0x4e342e);
          g.fillRect(x + 8, y + 5, 2, 8);
          break;
        }

        case TILE.BUILDING_ROOF_RED: {
          // Red roof shingle
          g.fillStyle(0xc0392b);
          g.fillRect(x, y, TS, TS);
          g.fillStyle(0xe74c3c);
          g.fillRect(x + 1, y + 1, TS - 2, 4);
          g.fillRect(x + 1, y + 7, TS - 2, 4);
          g.fillStyle(0x962d22);
          g.fillRect(x, y + 6, TS, 1);
          g.fillRect(x, y + 12, TS, 1);
          break;
        }

        case TILE.BUILDING_WALL_RED: {
          // Warm beige wall
          g.fillStyle(0xf5eedc);
          g.fillRect(x, y, TS, TS);
          g.fillStyle(0xe0d6c3);
          g.fillRect(x, y + 7, TS, 1);
          g.fillRect(x, y + 15, TS, 1);
          g.fillRect(x + 7, y, 1, 7);
          g.fillRect(x + 11, y + 8, 1, 7);
          break;
        }

        case TILE.BUILDING_ROOF_BLUE: {
          // Blue roof (Lab / Mart)
          g.fillStyle(0x1e3a8a);
          g.fillRect(x, y, TS, TS);
          g.fillStyle(0x2563eb);
          g.fillRect(x + 1, y + 1, TS - 2, 4);
          g.fillRect(x + 1, y + 7, TS - 2, 4);
          g.fillStyle(0x172554);
          g.fillRect(x, y + 6, TS, 1);
          g.fillRect(x, y + 12, TS, 1);
          break;
        }

        case TILE.BUILDING_WALL_BLUE: {
          // White/gray brick wall
          g.fillStyle(0xe2e8f0);
          g.fillRect(x, y, TS, TS);
          g.fillStyle(0xcfd8dc);
          g.fillRect(x, y + 7, TS, 1);
          g.fillRect(x, y + 15, TS, 1);
          g.fillRect(x + 8, y, 1, 7);
          break;
        }

        case TILE.BUILDING_DOOR: {
          // Doorway
          g.fillStyle(0xf5eedc);
          g.fillRect(x, y, TS, TS);
          // Wooden door
          g.fillStyle(0x78350f);
          g.fillRect(x + 2, y + 2, 12, 14);
          g.fillStyle(0x92400e);
          g.fillRect(x + 3, y + 3, 10, 12);
          // Handle
          g.fillStyle(0xfacc15);
          g.fillRect(x + 10, y + 9, 2, 2);
          break;
        }

        case TILE.BUILDING_WINDOW: {
          // Wall with window
          g.fillStyle(0xf5eedc);
          g.fillRect(x, y, TS, TS);
          // Frame
          g.fillStyle(0x334155);
          g.fillRect(x + 3, y + 3, 10, 10);
          // Glass
          g.fillStyle(0x93c5fd);
          g.fillRect(x + 4, y + 4, 8, 8);
          // Glint
          g.fillStyle(0xffffff);
          g.fillRect(x + 5, y + 5, 2, 2);
          break;
        }

        case TILE.FENCE_H: {
          // Horizontal wooden fence on grass
          g.fillStyle(0x56a64b);
          g.fillRect(x, y, TS, TS);
          // Horizontal rails
          g.fillStyle(0xa16207);
          g.fillRect(x, y + 5, TS, 3);
          g.fillRect(x, y + 10, TS, 3);
          // Posts
          g.fillStyle(0x713f12);
          g.fillRect(x + 1, y + 3, 3, 11);
          g.fillRect(x + 12, y + 3, 3, 11);
          break;
        }

        case TILE.FENCE_V: {
          // Vertical fence
          g.fillStyle(0x56a64b);
          g.fillRect(x, y, TS, TS);
          g.fillStyle(0x713f12);
          g.fillRect(x + 6, y, 4, TS);
          g.fillStyle(0xa16207);
          g.fillRect(x + 7, y + 1, 2, TS - 2);
          break;
        }

        case TILE.SIGN: {
          // Wooden board sign on grass
          g.fillStyle(0x56a64b);
          g.fillRect(x, y, TS, TS);
          // Post
          g.fillStyle(0x5c3818);
          g.fillRect(x + 7, y + 8, 2, 8);
          // Board
          g.fillStyle(0xb45309);
          g.fillRect(x + 2, y + 2, 12, 8);
          g.fillStyle(0xd97706);
          g.fillRect(x + 3, y + 3, 10, 6);
          break;
        }

        case TILE.FLOWERS: {
          // Grass with scattered flowers
          g.fillStyle(0x56a64b);
          g.fillRect(x, y, TS, TS);
          // Red flower
          g.fillStyle(0xef4444);
          g.fillRect(x + 3, y + 4, 3, 3);
          g.fillStyle(0xfde047);
          g.fillRect(x + 4, y + 5, 1, 1);
          // Yellow flower
          g.fillStyle(0xfde047);
          g.fillRect(x + 10, y + 9, 3, 3);
          g.fillStyle(0xf97316);
          g.fillRect(x + 11, y + 10, 1, 1);
          break;
        }

        case TILE.FLOWER_BED: {
          // Cultivated flower bed
          g.fillStyle(0x78350f);
          g.fillRect(x, y, TS, TS);
          // Flowers
          g.fillStyle(0xf43f5e);
          g.fillRect(x + 2, y + 3, 3, 3);
          g.fillRect(x + 10, y + 3, 3, 3);
          g.fillRect(x + 6, y + 8, 3, 3);
          g.fillStyle(0xfde047);
          g.fillRect(x + 3, y + 4, 1, 1);
          g.fillRect(x + 11, y + 4, 1, 1);
          g.fillRect(x + 7, y + 9, 1, 1);
          break;
        }

        case TILE.POKEBALL_STATUE: {
          // Monument base
          g.fillStyle(0x56a64b);
          g.fillRect(x, y, TS, TS);
          g.fillStyle(0x64748b);
          g.fillRect(x + 2, y + 6, 12, 10);
          g.fillStyle(0x94a3b8);
          g.fillRect(x + 3, y + 7, 10, 8);
          // Little Pokeball crest
          g.fillStyle(0xef4444);
          g.fillCircle(x + 8, y + 5, 4);
          g.fillStyle(0xffffff);
          g.fillRect(x + 4, y + 5, 8, 4);
          g.fillStyle(0x0f172a);
          g.fillRect(x + 4, y + 5, 8, 1);
          g.fillCircle(x + 8, y + 5, 1);
          break;
        }
      }
    }

    g.generateTexture(ASSETS.TILESET_WORLD, TS * TILE_COUNT, TS);
    g.destroy();
  }

  /**
   * Generates 32x32 pixel-art front sprites for Pokémon & items.
   */
  static generatePokemonSprites(scene) {
    // 1. Pokéball Item
    if (!scene.textures.exists('pokeball_item')) {
      const g = scene.make.graphics({ x: 0, y: 0, add: false });
      // Red top hemisphere
      g.fillStyle(0xef4444);
      g.fillCircle(16, 16, 14);
      // White bottom hemisphere
      g.fillStyle(0xf8fafc);
      g.fillRect(2, 16, 28, 14);
      // Dark outline / band
      g.lineStyle(2, 0x0f172a, 1);
      g.strokeCircle(16, 16, 14);
      g.fillStyle(0x0f172a);
      g.fillRect(2, 15, 28, 3);
      // Center button
      g.fillStyle(0x0f172a);
      g.fillCircle(16, 16, 5);
      g.fillStyle(0xffffff);
      g.fillCircle(16, 16, 3);
      g.generateTexture('pokeball_item', 32, 32);
      g.destroy();
    }

    // 2. Bulbasaur (32x32)
    if (!scene.textures.exists('poke_bulbasaur')) {
      const g = scene.make.graphics({ x: 0, y: 0, add: false });
      // Green bulb on back
      g.fillStyle(0x15803d);
      g.fillCircle(16, 11, 8);
      g.fillStyle(0x22c55e);
      g.fillCircle(16, 10, 6);
      g.fillStyle(0x86efac);
      g.fillRect(14, 6, 4, 3);

      // Turquoise body & head
      g.fillStyle(0x14b8a6);
      g.fillRect(8, 14, 16, 13);
      g.fillRect(6, 10, 14, 10);

      // Darker spots
      g.fillStyle(0x0f766e);
      g.fillRect(10, 11, 3, 2);
      g.fillRect(18, 17, 3, 3);
      g.fillRect(10, 20, 2, 2);

      // Red eyes
      g.fillStyle(0xdc2626);
      g.fillRect(7, 13, 3, 3);
      g.fillRect(15, 13, 2, 3);
      g.fillStyle(0xffffff);
      g.fillRect(8, 13, 1, 1);

      // Stubby legs & claws
      g.fillStyle(0x14b8a6);
      g.fillRect(8, 25, 4, 5);
      g.fillRect(18, 25, 4, 5);
      g.fillStyle(0xffffff);
      g.fillRect(8, 29, 2, 1);
      g.fillRect(18, 29, 2, 1);

      g.generateTexture('poke_bulbasaur', 32, 32);
      g.destroy();
    }

    // 3. Charmander (32x32)
    if (!scene.textures.exists('poke_charmander')) {
      const g = scene.make.graphics({ x: 0, y: 0, add: false });
      // Orange body & round head
      g.fillStyle(0xf97316);
      g.fillCircle(16, 11, 7); // head
      g.fillRect(11, 15, 10, 12); // torso

      // Pale cream belly
      g.fillStyle(0xfef08a);
      g.fillRect(13, 16, 6, 9);

      // Blue eyes
      g.fillStyle(0x2563eb);
      g.fillRect(13, 9, 2, 3);
      g.fillRect(19, 9, 2, 3);
      g.fillStyle(0xffffff);
      g.fillRect(13, 9, 1, 1);

      // Cute snout
      g.fillStyle(0xea580c);
      g.fillRect(15, 12, 4, 2);

      // Tail with flaming tip
      g.fillStyle(0xf97316);
      g.fillRect(7, 20, 5, 4);
      g.fillRect(5, 17, 3, 4);

      // Tail Flame!
      g.fillStyle(0xef4444);
      g.fillCircle(5, 15, 4);
      g.fillStyle(0xfacc15);
      g.fillCircle(5, 14, 2);

      // Feet
      g.fillStyle(0xf97316);
      g.fillRect(10, 26, 4, 4);
      g.fillRect(18, 26, 4, 4);

      g.generateTexture('poke_charmander', 32, 32);
      g.destroy();
    }

    // 4. Squirtle (32x32)
    if (!scene.textures.exists('poke_squirtle')) {
      const g = scene.make.graphics({ x: 0, y: 0, add: false });
      // Brown turtle shell on back
      g.fillStyle(0x9a3412);
      g.fillCircle(18, 17, 8);
      g.fillStyle(0xd97706);
      g.fillRect(19, 11, 4, 12);

      // Light blue body & round head
      g.fillStyle(0x38bdf8);
      g.fillCircle(14, 11, 7);
      g.fillRect(10, 16, 10, 10);

      // Pale yellow front belly
      g.fillStyle(0xfef08a);
      g.fillRect(10, 16, 5, 9);

      // Purple/dark eyes
      g.fillStyle(0x6b21a8);
      g.fillRect(11, 9, 2, 3);
      g.fillRect(16, 9, 2, 3);
      g.fillStyle(0xffffff);
      g.fillRect(11, 9, 1, 1);

      // Curled squirrel tail
      g.fillStyle(0x38bdf8);
      g.fillCircle(25, 20, 4);
      g.fillStyle(0x7dd3fc);
      g.fillCircle(26, 19, 2);

      // Feet
      g.fillStyle(0x38bdf8);
      g.fillRect(9, 25, 4, 5);
      g.fillRect(16, 25, 4, 5);

      g.generateTexture('poke_squirtle', 32, 32);
      g.destroy();
    }

    // 5. Pidgey (32x32)
    if (!scene.textures.exists('poke_pidgey')) {
      const g = scene.make.graphics({ x: 0, y: 0, add: false });
      // Brown bird body & head
      g.fillStyle(0x78350f);
      g.fillCircle(16, 12, 6);
      g.fillRect(11, 16, 11, 9);
      // Cream belly
      g.fillStyle(0xfef3c7);
      g.fillRect(10, 16, 5, 8);
      // Black eye line & eye
      g.fillStyle(0x0f172a);
      g.fillRect(12, 11, 4, 2);
      g.fillStyle(0xffffff);
      g.fillRect(13, 11, 1, 1);
      // Pink beak
      g.fillStyle(0xf472b6);
      g.fillRect(9, 13, 3, 2);
      // Tail feathers
      g.fillStyle(0x92400e);
      g.fillRect(20, 20, 6, 4);
      // Talons
      g.fillStyle(0xfbcfe8);
      g.fillRect(12, 25, 3, 3);
      g.fillRect(17, 25, 3, 3);

      g.generateTexture('poke_pidgey', 32, 32);
      g.destroy();
    }

    // 6. Rattata (32x32)
    if (!scene.textures.exists('poke_rattata')) {
      const g = scene.make.graphics({ x: 0, y: 0, add: false });
      // Purple rodent body
      g.fillStyle(0x7e22ce);
      g.fillCircle(14, 13, 6);
      g.fillRect(12, 17, 12, 8);
      // Large round ears
      g.fillStyle(0x9333ea);
      g.fillCircle(18, 8, 4);
      g.fillStyle(0xfbcfe8);
      g.fillCircle(18, 8, 2);
      // White belly & big front tooth
      g.fillStyle(0xf3e8ff);
      g.fillRect(10, 18, 6, 7);
      g.fillStyle(0xffffff);
      g.fillRect(9, 15, 2, 3);
      // Red eyes
      g.fillStyle(0xdc2626);
      g.fillRect(12, 11, 2, 2);
      // Curly tail
      g.fillStyle(0x7e22ce);
      g.fillRect(22, 18, 5, 2);
      g.fillRect(26, 15, 2, 4);

      g.generateTexture('poke_rattata', 32, 32);
      g.destroy();
    }

    // 7. Pikachu (32x32)
    if (!scene.textures.exists('poke_pikachu')) {
      const g = scene.make.graphics({ x: 0, y: 0, add: false });
      // Bright yellow mouse body
      g.fillStyle(0xfacc15);
      g.fillCircle(16, 12, 7);
      g.fillRect(11, 16, 11, 9);
      // Ears with black tips
      g.fillStyle(0xfacc15);
      g.fillRect(9, 4, 3, 6);
      g.fillRect(20, 4, 3, 6);
      g.fillStyle(0x0f172a);
      g.fillRect(9, 3, 3, 3);
      g.fillRect(20, 3, 3, 3);
      // Rosy red cheeks!
      g.fillStyle(0xef4444);
      g.fillCircle(11, 14, 2);
      g.fillCircle(21, 14, 2);
      // Black eyes
      g.fillStyle(0x0f172a);
      g.fillRect(13, 10, 2, 2);
      g.fillRect(18, 10, 2, 2);
      g.fillStyle(0xffffff);
      g.fillRect(13, 10, 1, 1);
      // Lightning bolt tail
      g.fillStyle(0xfacc15);
      g.fillRect(5, 17, 3, 3);
      g.fillRect(3, 14, 4, 3);
      g.fillRect(5, 12, 3, 3);
      // Brown back stripes
      g.fillStyle(0x78350f);
      g.fillRect(13, 18, 7, 1);
      g.fillRect(13, 21, 7, 1);

      g.generateTexture('poke_pikachu', 32, 32);
      g.destroy();
    }
  }

  /**
   * Generates a simple colored rectangle texture.
   * Useful for placeholder tile images.
   */
  static generateColorTexture(scene, key, width, height, color, borderColor = null) {
    if (scene.textures.exists(key)) return;
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(color);
    g.fillRect(0, 0, width, height);
    if (borderColor !== null) {
      g.lineStyle(1, borderColor, 1);
      g.strokeRect(0, 0, width, height);
    }
    g.generateTexture(key, width, height);
    g.destroy();
  }
}

