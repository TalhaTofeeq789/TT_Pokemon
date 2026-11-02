/**
 * BattleScene.js
 *
 * Phase 8: Turn-Based Wild Pokémon Battle Scene with Catching System
 *
 * Features:
 *  - Classic split battlefield (Enemy top-right, Player bottom-left)
 *  - Animated health bars with dynamic color changes
 *  - 4-option combat menu: FIGHT, BAG, POKÉMON, RUN
 *  - 4-move selection interface with elemental typing and PP counters
 *  - In-battle BAG system supporting Poké Ball, Great Ball, and Ultra Ball throwing
 *  - Parabolic ball toss animation and multi-stage wobble sequence (0 to 3 shakes)
 *  - Capture success / breakout handling with party & PC box storage management
 */

import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants.js';
import HealthBar from '../ui/HealthBar.js';
import BattleManager from '../battle/BattleManager.js';
import SpriteGenerator from '../utils/SpriteGenerator.js';

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BATTLE });

    this._battleManager = null;
    this._playerPokemon = null;
    this._wildPokemon = null;
    this._inventory = null;
    this._party = null;
    this._storage = null;

    // Menu state
    this._menuMode = 'COMMANDS'; // 'COMMANDS' | 'MOVES' | 'BAG' | 'BUSY'
    this._selectedCommand = 0;   // 0: FIGHT, 1: BAG, 2: POKEMON, 3: RUN
    this._selectedMove = 0;
    this._selectedBagItem = 0;
    this._eventQueue = [];
    this._activeBallSprite = null;
  }

  init(data) {
    this._playerPokemon = data.playerPokemon;
    this._wildPokemon = data.wildPokemon;
    this._inventory = data.inventory || null;
    this._party = data.party || null;
    this._storage = data.storage || null;
    this._onBattleEnd = data.onBattleEnd || null;

    this._menuMode = 'BUSY';
    this._selectedCommand = 0;
    this._selectedMove = 0;
    this._selectedBagItem = 0;
    this._eventQueue = [];
    this._activeBallSprite = null;
  }

  create() {
    SpriteGenerator.generateAll(this);

    this._battleManager = new BattleManager(this._playerPokemon, this._wildPokemon);

    this._createBattlefield();
    this._createCombatants();
    this._createHealthBars();
    this._createUI();
    this._setupInput();

    // Opening battle sequence
    this.cameras.main.flash(400, 255, 255, 255);
    this._startIntro();
  }

  // ─── Visual Layout ──────────────────────────────────────────────────────────

  _createBattlefield() {
    // Sky
    this.add.rectangle(GAME_WIDTH / 2, 175, GAME_WIDTH, 350, 0xbae6fd);

    // Green grassy hills
    const g = this.add.graphics();
    g.fillStyle(0x86efac);
    g.fillCircle(180, 260, 200);
    g.fillCircle(620, 240, 240);

    // Field floor
    this.add.rectangle(GAME_WIDTH / 2, 400, GAME_WIDTH, 200, 0x22c55e);

    // Enemy Platform (top-right)
    this.add.ellipse(600, 210, 260, 80, 0x15803d)
      .setStrokeStyle(3, 0x166534);
    this.add.ellipse(600, 206, 240, 70, 0x4ade80);

    // Player Platform (bottom-left)
    this.add.ellipse(200, 390, 300, 90, 0x15803d)
      .setStrokeStyle(3, 0x166534);
    this.add.ellipse(200, 385, 280, 80, 0x4ade80);
  }

  _createCombatants() {
    // Wild Pokémon Sprite (top-right)
    this._wildSprite = this.add.sprite(600, 170, this._wildPokemon.spriteKey)
      .setScale(3.5)
      .setDepth(15);

    // Player Pokémon Sprite (bottom-left)
    this._playerSprite = this.add.sprite(200, 340, this._playerPokemon.spriteKey)
      .setScale(3.5)
      .setDepth(15);

    // Gentle hover tween for wild pokemon
    this.tweens.add({
      targets: this._wildSprite,
      y: 165,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  _createHealthBars() {
    // Enemy Health Bar (Top-Left)
    this._enemyHpBar = new HealthBar(this, 60, 50, {
      showNumbers: false,
      barWidth: 150,
    });
    this._enemyHpBar.setPokemon(this._wildPokemon);

    // Player Health Bar (Bottom-Right)
    this._playerHpBar = new HealthBar(this, 480, 320, {
      showNumbers: true,
      barWidth: 160,
    });
    this._playerHpBar.setPokemon(this._playerPokemon);
  }

  _createUI() {
    const bottomY = 460;
    const bottomH = 140;

    // Bottom command container
    this._uiContainer = this.add.container(0, bottomY).setDepth(100);

    // Background panel
    const bg = this.add.rectangle(GAME_WIDTH / 2, bottomH / 2, GAME_WIDTH, bottomH, 0x1e293b)
      .setStrokeStyle(3, 0x475569)
      .setOrigin(0.5);

    // Left Dialog Box
    this._dialogBox = this.add.rectangle(230, bottomH / 2, 430, bottomH - 16, 0x0f172a)
      .setStrokeStyle(2, 0x334155)
      .setOrigin(0.5);

    this._battleText = this.add.text(40, 24, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '11px',
      fill: '#ffffff',
      lineSpacing: 10,
    });

    // 1. Right Command Box (FIGHT / BAG / POKÉMON / RUN)
    this._commandBox = this.add.container(460, 8);
    const cmdBg = this.add.rectangle(160, bottomH / 2 - 8, 320, bottomH - 16, 0x0f172a)
      .setStrokeStyle(2, 0x334155)
      .setOrigin(0.5);

    this._cmdFight   = this.add.text(30, 24, '► FIGHT',   { fontFamily: '"Press Start 2P"', fontSize: '11px', fill: '#facc15' });
    this._cmdBag     = this.add.text(180, 24, '  BAG',     { fontFamily: '"Press Start 2P"', fontSize: '11px', fill: '#94a3b8' });
    this._cmdPokemon = this.add.text(30, 74, '  POKÉMON', { fontFamily: '"Press Start 2P"', fontSize: '11px', fill: '#94a3b8' });
    this._cmdRun     = this.add.text(180, 74, '  RUN',     { fontFamily: '"Press Start 2P"', fontSize: '11px', fill: '#94a3b8' });

    this._commandBox.add([cmdBg, this._cmdFight, this._cmdBag, this._cmdPokemon, this._cmdRun]);

    // 2. Move Selection Box (FIGHT)
    this._moveBox = this.add.container(460, 8).setVisible(false);
    const moveBg = this.add.rectangle(160, bottomH / 2 - 8, 320, bottomH - 16, 0x0f172a)
      .setStrokeStyle(2, 0x334155)
      .setOrigin(0.5);

    this._moveButtons = [];
    const positions = [
      { x: 20, y: 18 },
      { x: 170, y: 18 },
      { x: 20, y: 64 },
      { x: 170, y: 64 },
    ];

    for (let i = 0; i < 4; i++) {
      const pos = positions[i];
      const name = this.add.text(pos.x, pos.y, '-', {
        fontFamily: '"Press Start 2P"',
        fontSize: '9px',
        fill: '#ffffff',
      });
      const pp = this.add.text(pos.x + 14, pos.y + 16, '', {
        fontFamily: '"Press Start 2P"',
        fontSize: '7px',
        fill: '#facc15',
      });
      this._moveButtons.push({ name, pp });
      this._moveBox.add([name, pp]);
    }
    this._moveBox.add(moveBg);
    this._moveBox.sendToBack(moveBg);

    // 3. Bag Selection Box (BAG)
    this._bagBox = this.add.container(460, 8).setVisible(false);
    const bagBg = this.add.rectangle(160, bottomH / 2 - 8, 320, bottomH - 16, 0x0f172a)
      .setStrokeStyle(2, 0x334155)
      .setOrigin(0.5);

    this._bagButtons = [];
    for (let i = 0; i < 4; i++) {
      const by = 20 + i * 26;
      const itemTxt = this.add.text(20, by, '', {
        fontFamily: '"Press Start 2P"',
        fontSize: '9px',
        fill: '#ffffff',
      });
      this._bagButtons.push(itemTxt);
      this._bagBox.add(itemTxt);
    }
    this._bagBox.add(bagBg);
    this._bagBox.sendToBack(bagBg);

    this._uiContainer.add([
      bg,
      this._dialogBox,
      this._battleText,
      this._commandBox,
      this._moveBox,
      this._bagBox,
    ]);
  }

  // ─── Turn Flow & Input ───────────────────────────────────────────────────────

  _startIntro() {
    this._battleText.setText(`A wild ${this._wildPokemon.name.toUpperCase()}\nappeared!`);
    this.time.delayedCall(1600, () => {
      this._battleText.setText(`Go! ${this._playerPokemon.name.toUpperCase()}!`);
      this.time.delayedCall(1200, () => {
        this._showCommandMenu();
      });
    });
  }

  _showCommandMenu() {
    this._menuMode = 'COMMANDS';
    this._commandBox.setVisible(true);
    this._moveBox.setVisible(false);
    this._bagBox.setVisible(false);
    this._battleText.setText(`What will\n${this._playerPokemon.name.toUpperCase()} do?`);
    this._updateCommandCursor();
  }

  _showMoveMenu() {
    this._menuMode = 'MOVES';
    this._commandBox.setVisible(false);
    this._moveBox.setVisible(true);
    this._bagBox.setVisible(false);
    this._selectedMove = 0;

    const moves = this._playerPokemon.moves;
    for (let i = 0; i < 4; i++) {
      const btn = this._moveButtons[i];
      if (moves[i]) {
        btn.name.setText((i === 0 ? '► ' : '  ') + moves[i].name.toUpperCase());
        btn.pp.setText(`PP ${moves[i].currentPp}/${moves[i].maxPp} [${moves[i].type}]`);
        btn.name.setStyle({ fill: i === 0 ? '#facc15' : '#ffffff' });
      } else {
        btn.name.setText('  --');
        btn.pp.setText('');
      }
    }
  }

  _showBagMenu() {
    const balls = this._inventory ? this._inventory.getBattleBalls() : [];

    if (balls.length === 0) {
      this._battleText.setText('No Poké Balls left\nin your Bag!');
      this.time.delayedCall(1200, () => this._showCommandMenu());
      return;
    }

    this._menuMode = 'BAG';
    this._commandBox.setVisible(false);
    this._moveBox.setVisible(false);
    this._bagBox.setVisible(true);
    this._selectedBagItem = 0;
    this._currentBagList = balls;

    this._updateBagDisplay();
  }

  _updateBagDisplay() {
    for (let i = 0; i < 4; i++) {
      const btn = this._bagButtons[i];
      if (this._currentBagList[i]) {
        const entry = this._currentBagList[i];
        const isSelected = i === this._selectedBagItem;
        btn.setText(`${isSelected ? '► ' : '  '}${entry.item.name.toUpperCase()} x${entry.count}`);
        btn.setStyle({ fill: isSelected ? '#facc15' : '#ffffff' });
      } else {
        btn.setText('');
      }
    }
  }

  _setupInput() {
    this.input.keyboard.on('keydown', (e) => {
      if (this._menuMode === 'BUSY') return;

      if (this._menuMode === 'COMMANDS') {
        this._handleCommandInput(e);
      } else if (this._menuMode === 'MOVES') {
        this._handleMoveInput(e);
      } else if (this._menuMode === 'BAG') {
        this._handleBagInput(e);
      }
    });
  }

  _handleCommandInput(e) {
    if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      if (this._selectedCommand % 2 === 0) this._selectedCommand++;
    } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      if (this._selectedCommand % 2 === 1) this._selectedCommand--;
    } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      if (this._selectedCommand < 2) this._selectedCommand += 2;
    } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
      if (this._selectedCommand >= 2) this._selectedCommand -= 2;
    } else if (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyZ') {
      this._confirmCommand();
      return;
    }
    this._updateCommandCursor();
  }

  _updateCommandCursor() {
    const cmds = [this._cmdFight, this._cmdBag, this._cmdPokemon, this._cmdRun];
    const names = ['FIGHT', 'BAG', 'POKÉMON', 'RUN'];

    cmds.forEach((cmd, idx) => {
      const isSelected = idx === this._selectedCommand;
      cmd.setText((isSelected ? '► ' : '  ') + names[idx]);
      cmd.setStyle({ fill: isSelected ? '#facc15' : '#94a3b8' });
    });
  }

  _confirmCommand() {
    switch (this._selectedCommand) {
      case 0: // FIGHT
        this._showMoveMenu();
        break;
      case 1: // BAG
        this._showBagMenu();
        break;
      case 2: // POKEMON
        this._battleText.setText('Party screen coming\nin Phase 9!');
        this.time.delayedCall(1200, () => this._showCommandMenu());
        break;
      case 3: // RUN
        this._menuMode = 'BUSY';
        this._commandBox.setVisible(false);
        const runEvents = this._battleManager.attemptRun();
        this._queueEvents(runEvents);
        break;
    }
  }

  _handleMoveInput(e) {
    const moveCount = this._playerPokemon.moves.length;

    if (e.code === 'Escape' || e.code === 'KeyX') {
      this._showCommandMenu();
      return;
    }

    if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      if (this._selectedMove % 2 === 0 && this._selectedMove + 1 < moveCount) this._selectedMove++;
    } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      if (this._selectedMove % 2 === 1) this._selectedMove--;
    } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      if (this._selectedMove + 2 < moveCount) this._selectedMove += 2;
    } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
      if (this._selectedMove >= 2) this._selectedMove -= 2;
    } else if (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyZ') {
      this._confirmMove();
      return;
    }

    this._playerPokemon.moves.forEach((move, i) => {
      const isSelected = i === this._selectedMove;
      this._moveButtons[i].name.setText((isSelected ? '► ' : '  ') + move.name.toUpperCase());
      this._moveButtons[i].name.setStyle({ fill: isSelected ? '#facc15' : '#ffffff' });
    });
  }

  _confirmMove() {
    const move = this._playerPokemon.moves[this._selectedMove];
    if (!move || move.currentPp <= 0) {
      this._battleText.setText('No PP left for this move!');
      return;
    }

    this._menuMode = 'BUSY';
    this._moveBox.setVisible(false);

    const turnEvents = this._battleManager.executePlayerMoveTurn(move);
    this._queueEvents(turnEvents);
  }

  _handleBagInput(e) {
    if (e.code === 'Escape' || e.code === 'KeyX') {
      this._showCommandMenu();
      return;
    }

    if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      if (this._selectedBagItem + 1 < this._currentBagList.length) {
        this._selectedBagItem++;
        this._updateBagDisplay();
      }
    } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
      if (this._selectedBagItem > 0) {
        this._selectedBagItem--;
        this._updateBagDisplay();
      }
    } else if (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyZ') {
      this._confirmThrowBall();
    }
  }

  _confirmThrowBall() {
    const entry = this._currentBagList[this._selectedBagItem];
    if (!entry) return;

    this._menuMode = 'BUSY';
    this._bagBox.setVisible(false);

    const catchEvents = this._battleManager.executeCatchAttempt(
      entry.item,
      this._inventory,
      this._party,
      this._storage
    );
    this._queueEvents(catchEvents);
  }

  // ─── Event Queue Processing ─────────────────────────────────────────────────

  _queueEvents(events) {
    this._eventQueue = [...events];
    this._processNextEvent();
  }

  _processNextEvent() {
    if (this._eventQueue.length === 0) {
      if (!this._playerPokemon.isFainted() && !this._wildPokemon.isFainted()) {
        this._showCommandMenu();
      }
      return;
    }

    const ev = this._eventQueue.shift();

    switch (ev.type) {
      case 'MESSAGE':
        this._battleText.setText(ev.text);
        this.time.delayedCall(1300, () => this._processNextEvent());
        break;

      case 'ANIMATION_HIT': {
        const target = ev.target === 'wild' ? this._wildSprite : this._playerSprite;
        const attacker = ev.target === 'wild' ? this._playerSprite : this._wildSprite;

        const originalX = attacker.x;
        const lungeDelta = ev.target === 'wild' ? 25 : -25;

        this.tweens.add({
          targets: attacker,
          x: originalX + lungeDelta,
          duration: 100,
          yoyo: true,
          onComplete: () => {
            this.tweens.add({
              targets: target,
              alpha: 0.2,
              duration: 70,
              yoyo: true,
              repeat: 3,
              onComplete: () => {
                target.setAlpha(1);
                this._processNextEvent();
              },
            });
          },
        });
        break;
      }

      case 'HEALTH_UPDATE': {
        const hpBar = ev.target === 'wild' ? this._enemyHpBar : this._playerHpBar;
        hpBar.animateHp(ev.newHp, ev.maxHp, true, () => {
          this.time.delayedCall(400, () => this._processNextEvent());
        });
        break;
      }

      case 'FAINT': {
        this._battleText.setText(ev.text);
        const target = ev.target === 'wild' ? this._wildSprite : this._playerSprite;

        this.tweens.add({
          targets: target,
          y: target.y + 60,
          alpha: 0,
          duration: 600,
          ease: 'Quad.easeIn',
          onComplete: () => {
            this.time.delayedCall(700, () => this._processNextEvent());
          },
        });
        break;
      }

      case 'ANIMATION_THROW_BALL': {
        // Create ball sprite at player position
        const ball = this.add.image(200, 340, 'pokeball_item')
          .setScale(0.8)
          .setDepth(50);
        this._activeBallSprite = ball;

        // Arcing parabolic throw towards wild Pokémon
        this.tweens.add({
          targets: ball,
          x: 600,
          duration: 600,
          ease: 'Linear',
        });

        this.tweens.add({
          targets: ball,
          y: 120,
          duration: 300,
          ease: 'Quad.easeOut',
          yoyo: true,
          onComplete: () => {
            // Wild Pokémon turns red and shrinks into ball
            this._wildSprite.setTint(0xef4444);
            this.tweens.add({
              targets: this._wildSprite,
              scaleX: 0,
              scaleY: 0,
              alpha: 0,
              duration: 300,
              onComplete: () => {
                // Ball drops down onto platform
                this.tweens.add({
                  targets: ball,
                  y: 206,
                  duration: 250,
                  ease: 'Bounce.easeOut',
                  onComplete: () => {
                    this._processNextEvent();
                  },
                });
              },
            });
          },
        });
        break;
      }

      case 'ANIMATION_BALL_SHAKE': {
        const ball = this._activeBallSprite;
        const shakes = ev.shakes;
        let count = 0;

        const wobbleNext = () => {
          if (count >= shakes) {
            if (ev.caught) {
              // Stars sparkle and capture flash!
              this.cameras.main.flash(300, 255, 255, 255);
              this.time.delayedCall(600, () => this._processNextEvent());
            } else {
              this._processNextEvent();
            }
            return;
          }

          count++;
          this.time.delayedCall(450, () => {
            this.tweens.add({
              targets: ball,
              angle: -22,
              duration: 120,
              yoyo: true,
              repeat: 1,
              onComplete: () => {
                ball.setAngle(0);
                wobbleNext();
              },
            });
          });
        };

        wobbleNext();
        break;
      }

      case 'ANIMATION_BALL_BREAK': {
        const ball = this._activeBallSprite;
        if (ball) ball.destroy();

        // Wild Pokémon pops back out!
        this._wildSprite.clearTint();
        this._wildSprite.setY(170);
        this.tweens.add({
          targets: this._wildSprite,
          scaleX: 3.5,
          scaleY: 3.5,
          alpha: 1,
          duration: 250,
          ease: 'Back.easeOut',
          onComplete: () => {
            this.time.delayedCall(300, () => this._processNextEvent());
          },
        });
        break;
      }

      case 'BATTLE_END':
        this.time.delayedCall(1000, () => {
          this._endBattle(ev.outcome);
        });
        break;
    }
  }

  _endBattle(outcome) {
    if (this._activeBallSprite) {
      this._activeBallSprite.destroy();
    }
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop();
      if (this._onBattleEnd) {
        this._onBattleEnd(outcome);
      } else {
        this.scene.resume(SCENES.GAME, { battleOutcome: outcome });
      }
    });
  }
}
