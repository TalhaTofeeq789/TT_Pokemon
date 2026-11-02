/**
 * MapData.js
 *
 * Defines the layout of Pallet Town (40 columns x 30 rows).
 * Composed of two main tilemap layers:
 *  1. Ground Layer (Grass, Paths, Flowers, Water)
 *  2. Objects / Collision Layer (Buildings, Trees, Fences, Signs, Statues)
 *
 * Also defines metadata for interactables and zones:
 *  - Tall grass zones (wild encounters)
 *  - Signs (message and position)
 *  - Doors (building entrances)
 */

import { MAP_COLS, MAP_ROWS } from '../utils/Constants.js';
import { TILE } from './TileIds.js';

export class MapData {
  /**
   * Generates the 2D tile array for the ground layer (40x30).
   * @returns {number[][]}
   */
  static getGroundLayer() {
    const grid = [];

    // Initialize all cells with standard grass
    for (let r = 0; r < MAP_ROWS; r++) {
      const row = [];
      for (let c = 0; c < MAP_COLS; c++) {
        row.push(TILE.GRASS);
      }
      grid.push(row);
    }

    // 1. Water Pond (Top-Right: cols 26-36, rows 3-9)
    for (let r = 3; r <= 9; r++) {
      for (let c = 26; c <= 36; c++) {
        if (r === 3) {
          grid[r][c] = TILE.WATER_EDGE;
        } else {
          grid[r][c] = TILE.WATER;
        }
      }
    }

    // 2. Main Paths (Sandy paths connecting buildings)
    // Horizontal main street (row 16, cols 4 to 34)
    for (let c = 4; c <= 34; c++) {
      grid[15][c] = TILE.PATH;
      grid[16][c] = TILE.PATH;
      grid[17][c] = TILE.PATH;
    }

    // Vertical path leading north to Route 1 (cols 18-20, rows 0 to 15)
    for (let r = 0; r <= 15; r++) {
      grid[r][18] = TILE.PATH;
      grid[r][19] = TILE.PATH;
      grid[r][20] = TILE.PATH;
    }

    // Vertical path leading south (cols 18-20, rows 17 to 28)
    for (let r = 17; r <= 28; r++) {
      grid[r][18] = TILE.PATH;
      grid[r][19] = TILE.PATH;
      grid[r][20] = TILE.PATH;
    }

    // Driveway path to Player's House (cols 8-10, rows 12 to 14)
    for (let r = 12; r <= 14; r++) {
      grid[r][8] = TILE.PATH;
      grid[r][9] = TILE.PATH;
    }

    // Driveway path to Rival's House (cols 28-30, rows 12 to 14)
    for (let r = 12; r <= 14; r++) {
      grid[r][28] = TILE.PATH;
      grid[r][29] = TILE.PATH;
    }

    // Path down to Professor Oak's Lab (cols 10-13, rows 18 to 22)
    for (let r = 18; r <= 22; r++) {
      grid[r][11] = TILE.PATH;
      grid[r][12] = TILE.PATH;
    }

    // 3. Tall Grass Areas (Encounter zones for battles!)
    // North patch (West of Route 1 entrance: cols 6-15, rows 2-5)
    for (let r = 2; r <= 5; r++) {
      for (let c = 6; c <= 15; c++) {
        grid[r][c] = TILE.TALL_GRASS;
      }
    }
    // South-east meadow (cols 24-34, rows 20-25)
    for (let r = 20; r <= 25; r++) {
      for (let c = 24; c <= 34; c++) {
        grid[r][c] = TILE.TALL_GRASS;
      }
    }

    // 4. Decorative Flower patches
    const flowerCoords = [
      [7, 10], [7, 11], [7, 14], [8, 14],
      [27, 10], [27, 11], [31, 10], [31, 11],
      [15, 14], [16, 14], [22, 14], [23, 14],
      [14, 25], [15, 25], [16, 25],
    ];
    flowerCoords.forEach(([c, r]) => {
      if (grid[r] && grid[r][c] !== undefined) {
        grid[r][c] = TILE.FLOWERS;
      }
    });

    return grid;
  }

  /**
   * Generates the 2D tile array for objects and collidables (40x30).
   * -1 represents an empty/passable cell on this layer.
   * @returns {number[][]}
   */
  static getObjectsLayer() {
    const grid = [];

    // Initialize all cells to empty (-1)
    for (let r = 0; r < MAP_ROWS; r++) {
      const row = [];
      for (let c = 0; c < MAP_COLS; c++) {
        row.push(TILE.EMPTY);
      }
      grid.push(row);
    }

    // Helper: place tree pair (top + bottom)
    const placeTree = (col, row) => {
      if (row >= 0 && row < MAP_ROWS && col >= 0 && col < MAP_COLS) {
        grid[row][col] = TILE.TREE_TOP;
      }
      if (row + 1 >= 0 && row + 1 < MAP_ROWS && col >= 0 && col < MAP_COLS) {
        grid[row + 1][col] = TILE.TREE_BOTTOM;
      }
    };

    // 1. Boundary Trees & Fences
    // Top border trees (except Route 1 exit at cols 18-20)
    for (let c = 0; c < MAP_COLS; c++) {
      if (c < 18 || c > 20) {
        placeTree(c, 0);
      }
    }

    // Bottom border trees
    for (let c = 0; c < MAP_COLS; c++) {
      placeTree(c, MAP_ROWS - 2);
    }

    // Left and right border trees
    for (let r = 0; r < MAP_ROWS; r += 2) {
      placeTree(0, r);
      placeTree(1, r);
      placeTree(MAP_COLS - 2, r);
      placeTree(MAP_COLS - 1, r);
    }

    // 2. Fences around properties
    // Player's house fence
    for (let c = 5; c <= 13; c++) {
      if (c !== 8 && c !== 9) { // Entrance gap
        grid[14][c] = TILE.FENCE_H;
      }
    }
    // Rival's house fence
    for (let c = 25; c <= 33; c++) {
      if (c !== 28 && c !== 29) { // Entrance gap
        grid[14][c] = TILE.FENCE_H;
      }
    }

    // 3. Player's House (cols 6-11, rows 8-11)
    // Red roof on rows 8-9, wall & door on rows 10-11
    for (let c = 6; c <= 11; c++) {
      grid[8][c] = TILE.BUILDING_ROOF_RED;
      grid[9][c] = TILE.BUILDING_ROOF_RED;
      grid[10][c] = (c === 8 || c === 10) ? TILE.BUILDING_WINDOW : TILE.BUILDING_WALL_RED;
      grid[11][c] = (c === 9) ? TILE.BUILDING_DOOR : TILE.BUILDING_WALL_RED;
    }

    // 4. Rival's House (cols 26-31, rows 8-11)
    for (let c = 26; c <= 31; c++) {
      grid[8][c] = TILE.BUILDING_ROOF_RED;
      grid[9][c] = TILE.BUILDING_ROOF_RED;
      grid[10][c] = (c === 27 || c === 30) ? TILE.BUILDING_WINDOW : TILE.BUILDING_WALL_RED;
      grid[11][c] = (c === 28) ? TILE.BUILDING_DOOR : TILE.BUILDING_WALL_RED;
    }

    // 5. Professor Oak's Research Lab (cols 8-16, rows 19-23)
    // Large prominent building with blue roof
    for (let c = 8; c <= 16; c++) {
      grid[19][c] = TILE.BUILDING_ROOF_BLUE;
      grid[20][c] = TILE.BUILDING_ROOF_BLUE;
      grid[21][c] = (c === 9 || c === 12 || c === 15) ? TILE.BUILDING_WINDOW : TILE.BUILDING_WALL_BLUE;
      grid[22][c] = (c === 12) ? TILE.BUILDING_DOOR : TILE.BUILDING_WALL_BLUE;
    }

    // 6. Pokeball Monument Statue (Town Center, col 19, row 16)
    grid[16][16] = TILE.POKEBALL_STATUE;

    // 7. Signs
    grid[12][7] = TILE.SIGN;   // Sign near Player's house
    grid[12][25] = TILE.SIGN;  // Sign near Rival's house
    grid[23][14] = TILE.SIGN;  // Sign near Oak's Lab
    grid[6][21] = TILE.SIGN;   // Sign pointing to Route 1

    return grid;
  }

  /**
   * Interactive world entities & signs metadata.
   */
  static getSignData() {
    return [
      { tileX: 7, tileY: 12, text: "Red's House" },
      { tileX: 25, tileY: 12, text: "Blue's House" },
      { tileX: 14, tileY: 23, text: "Prof. Oak's Pokémon Research Lab" },
      { tileX: 21, tileY: 6, text: "Route 1 — North to Viridian City" },
      { tileX: 16, tileY: 16, text: "Pallet Town — Shades of your journey await!" },
    ];
  }

  /**
   * Building doors metadata.
   */
  static getDoorData() {
    return [
      { tileX: 9, tileY: 11, name: "Player's House", targetScene: 'HomeInterior' },
      { tileX: 28, tileY: 11, name: "Rival's House", targetScene: 'RivalInterior' },
      { tileX: 12, tileY: 22, name: "Prof. Oak's Lab", targetScene: 'LabInterior' },
    ];
  }
}

