/**
 * Constants.js
 * Central configuration for the entire game.
 * Change values here to affect the whole game — no hunting through files.
 */

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

// Tile size in pixels (native pixel size of each tile in the tileset image)
export const TILE_SIZE = 16;

// World scale: tiles are rendered at 2x their native size.
// A 16px tile appears as 32px on screen. This gives the classic pixel-art look.
// Camera zoom adds additional zoom on top of this.
export const WORLD_SCALE = 2;

// How many tiles wide and tall the map is
export const MAP_COLS = 40;
export const MAP_ROWS = 30;

// World pixel dimensions = MAP_COLS * TILE_SIZE * WORLD_SCALE
// = 40 * 16 * 2 = 1280 wide, 30 * 16 * 2 = 960 tall
export const WORLD_WIDTH  = MAP_COLS * TILE_SIZE * WORLD_SCALE;
export const WORLD_HEIGHT = MAP_ROWS * TILE_SIZE * WORLD_SCALE;

// How many pixels per second the player moves (world pixels, pre-camera-zoom)
export const PLAYER_SPEED = 128;

// Player's starting map
export const STARTING_MAP = 'hometown';

// Player starting tile position on that map (tile coordinates)
export const PLAYER_START_X = 9;
export const PLAYER_START_Y = 14;

// Maximum pokemon in party
export const MAX_PARTY_SIZE = 6;

// Scene keys — use these everywhere instead of raw strings
export const SCENES = {
  BOOT: 'BootScene',
  PRELOAD: 'PreloadScene',
  MAIN_MENU: 'MainMenuScene',
  GAME: 'GameScene',
  BATTLE: 'BattleScene',
  PARTY: 'PartyScene',
  INVENTORY: 'InventoryScene',
  DIALOGUE: 'DialogueScene',
  STARTER_SELECT: 'StarterSelectScene',
  PAUSE: 'PauseScene',
};

// Asset keys — use these everywhere instead of raw strings
export const ASSETS = {
  PLAYER: 'player',
  TILESET_WORLD: 'tileset_world',
  MAP_HOMETOWN: 'map_hometown',
  UI_PANEL: 'ui_panel',
  BATTLE_BG: 'battle_bg',
  LOGO: 'logo',
};

// Audio keys
export const AUDIO = {
  BGM_MENU: 'bgm_menu',
  BGM_BATTLE: 'bgm_battle',
  BGM_TOWN: 'bgm_town',
  SFX_SELECT: 'sfx_select',
  SFX_HIT: 'sfx_hit',
  SFX_CATCH: 'sfx_catch',
  SFX_LEVELUP: 'sfx_levelup',
};

// Pokemon type colors for UI
export const TYPE_COLORS = {
  NORMAL:   '#A8A878',
  FIRE:     '#F08030',
  WATER:    '#6890F0',
  GRASS:    '#78C850',
  ELECTRIC: '#F8D030',
  ICE:      '#98D8D8',
  FIGHTING: '#C03028',
  POISON:   '#A040A0',
  GROUND:   '#E0C068',
  FLYING:   '#A890F0',
  PSYCHIC:  '#F85888',
  BUG:      '#A8B820',
  ROCK:     '#B8A038',
  GHOST:    '#705898',
  DRAGON:   '#7038F8',
  DARK:     '#705848',
  STEEL:    '#B8B8D0',
};
