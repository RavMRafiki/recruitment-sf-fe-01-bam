/* global Phaser */
(() => {
  "use strict";

  const W = 360;
  const H = 640;
  const PLAY_TOP = 58;
  const PLAYFIELD_TOP = 220;
  const PLAY_BOTTOM = 600;
  const PLAYER_X = 82;
  const START_JUMP_INTERVAL = 800;
  const ASSET = "assets/";
  const obstacleNames = [
    "bac1",
    "txt1",
    "bac2",
    "txt2",
    "bac3",
    "txt3",
    "bac4",
    "txt4",
    "bac5",
    "txt5",
    "bac6",
    "txt6",
    "txt7",
    "txt8",
    "txt9",
  ];
  const hitboxDefinitions = {
    bac1: { type: "circle", radius: 0.45 },
    bac2: { type: "rectangle", width: 0.58, height: 1 },
    bac3: { type: "rectangle", width: 1, height: 0.8 },
    bac4: {
      type: "multiple",
      shapes: [
        { type: "rectangle", x: -0.32, y: -0.2, width: 0.4, height: 0.5 },
        { type: "rectangle", x: 0.2, y: 0.2, width: 0.7, height: 0.5 },
      ],
    },
    bac5: { type: "circle", radius: 0.55 },
    bac6: { type: "circle", radius: 0.52 },
    txt1: { type: "rectangle", width: 0.7, height: 1 },
    txt2: { type: "rectangle", width: 0.8, height: 1 },
    txt3: { type: "rectangle", width: 1, height: 1 },
    txt4: { type: "rectangle", width: 0.8, height: 1 },
    txt5: { type: "rectangle", width: 0.8, height: 1 },
    txt6: { type: "rectangle", width: 0.8, height: 1 },
    txt7: { type: "rectangle", width: 1, height: 1 },
    txt8: { type: "rectangle", width: 0.8, height: 1 },
    txt9: { type: "rectangle", width: 0.8, height: 1 },
  };

  class GutRun extends Phaser.Scene {
    constructor() {
      super("GutRun");
      this.mode = "start";
      this.obstacles = [];
      this.audio = {};
      this.soundOn = true;
      this.pausedByEnvironment = false;
      this.windowFocused = true;
      this.mouseInsideGame = true;
      this.debugMode = new URLSearchParams(window.location.search).has("debug");
    }

    preload() {
      this.load.image("bg", `${ASSET}bg.jpg`);
      this.load.image("border", `${ASSET}border.png`);
      this.load.image("logo", `${ASSET}logo.png`);
      this.load.image("gesture", `${ASSET}gesture.png`);
      this.load.image("gameplay", `${ASSET}01_game/gameplay.png`);
      this.load.image("texture", `${ASSET}01_game/bg_texture.png`);
      this.load.image("player", `${ASSET}01_game/player.png`);
      this.load.image("tut", `${ASSET}01_game/tut.png`);
      obstacleNames.forEach((name) => {
        const folder = name.startsWith("bac") ? "01_game" : "01_game";
        this.load.image(name, `${ASSET}${folder}/${name}.png`);
      });
      [
        "fail-bubble",
        "fail-cta",
        "fail-hl",
        "fail-replay",
        "fail-sad",
        "fail-bac1",
        "fail-bac2",
        "fail-bac3",
        "fail-bac4",
        "fail-bac5",
        "win-bubble",
        "win-cta",
        "win-happy",
        "win-hl",
        "win-konfetti",
      ].forEach((key) => {
        const [card, file] =
          key.split("-").length > 2
            ? [key.split("-")[0], key.substring(key.indexOf("-") + 1)]
            : [key.split("-")[0], key.substring(key.indexOf("-") + 1)];
        this.load.image(key, `${ASSET}02_endcard/${card}/${file}.png`);
      });
      this.load.audio(
        "loop",
        `${ASSET}music/background_music/Funny Game Loop.mp3`,
      );
      this.load.audio("crash", `${ASSET}music/crash/Cartoon Crash Boing.mp3`);
      this.load.audio("fail", `${ASSET}music/endcard_fail/Fail.mp3`);
      this.load.audio(
        "win",
        `${ASSET}music/endcard_win/Celebrative Happy Woohoo Cheer 2.mp3`,
      );
      this.load.audio("applause", `${ASSET}music/endcard_win/applause.mp3`);
    }

    create() {
      this.input.addPointer(1);
      this.input.on("pointerdown", this.handleTap, this);
      this.windowFocused = document.hasFocus();
      document.addEventListener("visibilitychange", () => {
        this.updateEnvironmentPause();
      });
      window.addEventListener("blur", () => {
        this.windowFocused = false;
        this.updateEnvironmentPause();
      });
      window.addEventListener("focus", () => {
        this.windowFocused = true;
        this.updateEnvironmentPause();
      });
      const gameElement = document.getElementById("game");
      gameElement.addEventListener("mouseenter", () => {
        this.mouseInsideGame = true;
        this.updateEnvironmentPause();
      });
      gameElement.addEventListener("mouseleave", () => {
        this.mouseInsideGame = false;
        this.updateEnvironmentPause();
      });
      document.getElementById("mute").addEventListener("click", (event) => {
        event.stopPropagation();
        this.soundOn = !this.soundOn;
        this.sound.mute = !this.soundOn;
        event.currentTarget.textContent = this.soundOn ? "🔊" : "🔇";
        event.currentTarget.classList.toggle("is-muted", !this.soundOn);
      });
      this.showStart();
    }

    addFull(key, depth = 0) {
      return this.add
        .image(W / 2, H / 2, key)
        .setDisplaySize(W, H)
        .setDepth(depth);
    }

    addHalf(key, x, y, depth = 0) {
      const source = this.textures.get(key).getSourceImage();
      return this.add
        .image(x, y, key)
        .setDisplaySize(source.width / 2, source.height / 2)
        .setDepth(depth);
    }

    showStart() {
      this.clearStage();
      this.mode = "start";
      this.addFull("bg");
      this.add
        .rectangle(W / 2, 0, W, PLAY_TOP, 0xffffff)
        .setOrigin(0.5, 0)
        .setDepth(1);
      const logo = this.addFull("logo", 2);
      logo.setY(-8).setAlpha(0);
      this.tweens.add({
        targets: logo,
        y: H / 2,
        alpha: 1,
        duration: 520,
        ease: "Back.out",
      });
      this.add
        .image(0, PLAY_TOP, "gameplay")
        .setOrigin(0, 0)
        .setDisplaySize(2528, 640)
        .setDepth(0);
      this.addFull("texture", 1);
      this.addFull("border", 4);
      const headline = this.addFull("tut", 5);
      headline.setY(H / 2 + 12).setAlpha(0);
      this.tweens.add({
        targets: headline,
        y: H / 2,
        alpha: 1,
        duration: 560,
        delay: 140,
        ease: "Back.out",
      });
      const introPlayer = this.add
        .image(76, 280, "player")
        .setScale(0.5)
        .setDepth(6);
      this.startPlayer = introPlayer;
      this.startPlayerY = 280;
      this.startPlayerVelocity = 0;
      this.startJumpTimer = 300;
      introPlayer.setScale(0.4);
      this.tweens.add({
        targets: introPlayer,
        scale: 0.5,
        duration: 480,
        delay: 240,
        ease: "Back.out",
      });
      [
        ["bac6", 109, 375],
        ["bac2", 289, 367],
        ["txt1", 108, 450],
        ["txt2", 321, 448],
      ].forEach(([key, x, y]) => {
        const enemy = this.add.image(x, y, key).setScale(0.4).setDepth(6);
        this.tweens.add({
          targets: enemy,
          scale: 0.5,
          duration: 420,
          delay: 260 + x,
          ease: "Back.out",
        });
      });
      const gesture = this.add
        .image(190, 500, "gesture")
        .setScale(0.5)
        .setDepth(6);
      gesture.setY(512);
      this.tweens.add({
        targets: gesture,
        y: 500,
        duration: 500,
        delay: 520,
        ease: "Back.out",
      });
      this.tweens.add({
        targets: gesture,
        scale: 0.54,
        duration: START_JUMP_INTERVAL / 2,
        delay: START_JUMP_INTERVAL / 2,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      });
    }

    handleTap(pointer) {
      if (this.pausedByEnvironment || !pointer) return;
      if (this.mode === "start") {
        this.startGame();
      } else if (this.mode === "playing") {
        this.jump();
      } else if (this.mode === "fail" && pointer.y > 530) {
        this.startGame();
      } else if (this.mode === "fail" || this.mode === "win") {
        this.clickout();
      }
    }

    startGame() {
      this.clearStage();
      this.mode = "countdown";
      this.score = 0;
      this.playerY = 350;
      this.velocity = 0;
      this.countdownElapsed = 0;
      this.gameplayElapsed = 0;
      this.obstacles = [];
      this.addFull("bg");
      this.gut = this.add
        .image(0, PLAY_TOP, "gameplay")
        .setOrigin(0, 0)
        .setDisplaySize(2528, 640);
      this.texture = this.add
        .image(0, PLAY_TOP, "texture")
        .setOrigin(0, 0)
        .setDisplaySize(W, 640)
        .setDepth(1);
      this.addFull("logo", 2);
      this.addFull("tut", 5);
      this.player = this.add
        .image(PLAYER_X, this.playerY, "player")
        .setDisplaySize(42, 41)
        .setDepth(4);
      this.addFull("border", 6);
      this.makeObstacles();
      this.debugGraphics = this.add.graphics().setDepth(20);
      this.audio.loop = this.sound.add("loop", { loop: true, volume: 0.22 });
      this.playSound("loop");
      this.gameStart = this.time.now;
      this.countdownLabel = this.add
        .text(W / 2, H / 2, "3", {
          fontFamily: "Arial Black, Arial, sans-serif",
          fontSize: "60px",
          color: "#ffffff",
          stroke: "#091d4c",
          strokeThickness: 8,
          align: "center",
        })
        .setOrigin(0.5)
        .setDepth(10);
    }

    makeObstacles() {
      const gap = 235;
      obstacleNames.forEach((name, index) => {
        const image = this.add
          .image(W + 70 + index * gap, 0, name)
          .setOrigin(0.5)
          .setDepth(3);
        const source = this.textures.get(name).getSourceImage();
        const scale = name.startsWith("txt") ? 0.5 : 0.52;
        image.setDisplaySize(source.width * scale, source.height * scale);
        const desiredY = PLAYFIELD_TOP + 34 + (index % 4) * 92;
        const minY = PLAYFIELD_TOP + image.displayHeight / 2 + 30;
        const maxY = PLAY_BOTTOM - image.displayHeight / 2 - 30;
        image.y = Phaser.Math.Clamp(desiredY, minY, maxY);
        this.obstacles.push({
          image,
          passed: false,
          hitbox: hitboxDefinitions[name],
        });
      });
    }

    jump() {
      this.velocity = -300;
      this.playSound("jump");
    }

    update(_time, delta) {
      if (this.mode === "start") {
        this.updateStartPreview(delta);
        return;
      }
      if (
        (this.mode !== "countdown" && this.mode !== "playing") ||
        this.pausedByEnvironment
      )
        return;
      if (this.mode === "countdown") {
        this.updateCountdown(delta);
        return;
      }
      const dt = Math.min(delta, 40) / 1000;
      this.velocity += 720 * dt;
      this.playerY += this.velocity * dt;
      this.player.y = this.playerY;
      this.player.angle = Phaser.Math.Clamp(this.velocity * 0.035, -18, 30);
      if (this.playerY < PLAYFIELD_TOP + 22 || this.playerY > PLAY_BOTTOM - 30)
        this.endGame(false);
      this.gameplayElapsed += dt;
      const currentSpeed = 132 + Math.min(this.gameplayElapsed * 8, 108);
      const speed = currentSpeed * dt;
      const backgroundSpeed = 0.5 * speed;
      this.gut.x -= backgroundSpeed;
      this.obstacles.forEach((item) => {
        item.image.x -= speed;
        if (
          !item.passed &&
          item.image.x + item.image.displayWidth / 2 < PLAYER_X - 4
        ) {
          item.passed = true;
          this.score += 1;
        }
        if (this.fairHit(item)) this.endGame(false);
      });
      this.drawDebugHitboxes();
      if (this.score === this.obstacles.length) this.endGame(true);
    }

    updateCountdown(delta) {
      this.countdownElapsed += delta;
      const step =
        this.countdownElapsed < 700
          ? "3"
          : this.countdownElapsed < 1400
            ? "2"
            : this.countdownElapsed < 2100
              ? "1"
              : "START";
      if (step !== this.countdownLabel.text) {
        this.countdownLabel.setText(step).setScale(0.7).setAlpha(1);
        this.tweens.add({
          targets: this.countdownLabel,
          scale: 1,
          duration: 220,
          ease: "Back.out",
        });
      }
      if (this.countdownElapsed >= 2700) {
        this.countdownLabel.destroy();
        this.countdownLabel = null;
        this.mode = "playing";
      }
    }

    updateStartPreview(delta) {
      if (this.pausedByEnvironment || !this.startPlayer) return;
      const dt = Math.min(delta, 40) / 1000;
      this.startJumpTimer -= delta;
      if (this.startJumpTimer <= 0) {
        this.startPlayerVelocity = -300;
        this.startJumpTimer = START_JUMP_INTERVAL;
      }
      this.startPlayerVelocity += 720 * dt;
      this.startPlayerY += this.startPlayerVelocity * dt;
      if (this.startPlayerY < 250) {
        this.startPlayerY = 250;
        this.startPlayerVelocity = 0;
      } else if (this.startPlayerY > 470) {
        this.startPlayerY = 470;
        this.startPlayerVelocity = -300;
        this.startJumpTimer = START_JUMP_INTERVAL;
      }
      this.startPlayer.y = this.startPlayerY;
      this.startPlayer.angle = Phaser.Math.Clamp(
        this.startPlayerVelocity * 0.035,
        -18,
        30,
      );
    }

    fairHit(item) {
      const p = new Phaser.Geom.Circle(this.player.x, this.player.y, 17);
      return this.getEnemyHitboxes(item).some((hitbox) =>
        hitbox.type === "circle"
          ? Phaser.Geom.Intersects.CircleToCircle(p, hitbox.shape)
          : Phaser.Geom.Intersects.CircleToRectangle(p, hitbox.shape),
      );
    }

    getEnemyHitboxes(item) {
      const definition = item.hitbox;
      const definitions =
        definition.type === "multiple" ? definition.shapes : [definition];
      return definitions.map((shape) => this.createEnemyHitbox(item, shape));
    }

    createEnemyHitbox(item, definition) {
      const x =
        item.image.x +
        (definition.x ?? definition.offsetX ?? 0) * item.image.displayWidth;
      const y =
        item.image.y +
        (definition.y ?? definition.offsetY ?? 0) * item.image.displayHeight;
      if (definition.type === "circle") {
        return {
          type: definition.type,
          shape: new Phaser.Geom.Circle(
            x,
            y,
            Math.min(item.image.displayWidth, item.image.displayHeight) *
              definition.radius,
          ),
        };
      }
      const size =
        definition.type === "square"
          ? Math.min(item.image.displayWidth, item.image.displayHeight) *
            definition.size
          : null;
      const width = size ?? item.image.displayWidth * definition.width;
      const height = size ?? item.image.displayHeight * definition.height;
      return {
        type: definition.type,
        shape: new Phaser.Geom.Rectangle(
          x - width / 2,
          y - height / 2,
          width,
          height,
        ),
      };
    }

    drawDebugHitboxes() {
      if (!this.debugMode || !this.debugGraphics) return;
      this.debugGraphics.clear();
      this.debugGraphics.lineStyle(2, 0xffff00, 1);
      this.debugGraphics.strokeRect(
        0,
        PLAYFIELD_TOP,
        W,
        PLAY_BOTTOM - PLAYFIELD_TOP,
      );
      this.debugGraphics.lineStyle(2, 0x00ff66, 1);
      this.debugGraphics.strokeCircle(this.player.x, this.player.y, 17);
      this.obstacles.forEach((item) => {
        this.getEnemyHitboxes(item).forEach((hitbox) => {
          if (hitbox.type === "circle") {
            this.debugGraphics.strokeCircle(
              hitbox.shape.x,
              hitbox.shape.y,
              hitbox.shape.radius,
            );
          } else {
            this.debugGraphics.strokeRectShape(hitbox.shape);
          }
        });
      });
    }

    endGame(won) {
      if (this.mode !== "playing" && this.mode !== "countdown") return;
      this.mode = won ? "win" : "fail";
      this.stopLoop();
      if (won) {
        this.playSound("win");
        this.playSound("applause", 0.18);
        this.showWin();
      } else {
        this.playSound("crash");
        this.playSound("fail");
        this.showFail();
      }
    }

    showFail() {
      this.clearStage();
      this.addFull("bg");
      const logo = this.addFull("logo", 2);
      logo.setY(-8).setAlpha(0);
      this.tweens.add({
        targets: logo,
        y: H / 2,
        alpha: 1,
        duration: 520,
        ease: "Back.out",
      });
      [
        "fail-bubble",
        "fail-bac1",
        "fail-bac2",
        "fail-bac3",
        "fail-bac4",
        "fail-bac5",
        "fail-sad",
        "fail-hl",
      ].forEach((key, index) => {
        const layer = this.addFull(key, index + 1);
        layer.setY(layer.y + (index % 2 ? 8 : -8));
        this.tweens.add({
          targets: layer,
          y: H / 2,
          duration: 500,
          delay: index * 55,
          ease: "Back.out",
        });
        if (key.startsWith("fail-bac")) {
          this.tweens.add({
            targets: layer,
            scaleX: layer.scaleX * 1.04,
            scaleY: layer.scaleY * 1.04,
            duration: 200,
            delay: 1000 + index * 55,
            yoyo: true,
            repeat: 5,
            ease: "Sine.inOut",
          });
        }
      });
      [
        ["fail-cta", 180, 503],
        ["fail-replay", 180, 558],
      ].forEach(([key, x, y], index) => {
        const layer = this.addHalf(key, x, y, 10 + index);
        layer.setY(y + 24).setAlpha(1);
        this.tweens.add({
          targets: layer,
          y,
          duration: 500,
          delay: 420 + index * 90,
          ease: "Back.out",
        });
        this.tweens.add({
          targets: layer,
          scaleX: layer.scaleX * 1.03,
          scaleY: layer.scaleY * 1.03,
          duration: 650,
          delay: 1000 + index * 90,
          yoyo: true,
          repeat: -1,
          ease: "Sine.inOut",
        });
      });
    }

    showWin() {
      this.clearStage();
      this.addFull("bg");
      const logo = this.addFull("logo", 2);
      logo.setY(-8).setAlpha(0);
      this.tweens.add({
        targets: logo,
        y: H / 2,
        alpha: 1,
        duration: 520,
        ease: "Back.out",
      });
      ["win-bubble", "win-konfetti", "win-happy", "win-hl"].forEach(
        (key, index) => {
          const layer = this.addFull(key, index + 1);
          layer.setY(layer.y + 18);
          this.tweens.add({
            targets: layer,
            y: H / 2,
            duration: 650,
            delay: index * 80,
            ease: "Back.out",
          });
          if (key === "win-happy") {
            this.tweens.add({
              targets: layer,
              y: H / 2 - 50,
              duration: 400,
              delay: 900,
              yoyo: true,
              repeat: 2,
              ease: "Sine.inOut",
            });
          }
          if (key === "win-konfetti") {
            this.tweens.add({
              targets: layer,
              scaleX: layer.scaleX * 1.1,
              scaleY: layer.scaleY * 1.1,
              duration: 250,
              delay: 300,
              yoyo: true,
              ease: "Sine.inOut",
            });
          }
        },
      );
      const cta = this.addHalf("win-cta", 180, 584, 10);
      cta.setY(608).setAlpha(1);
      this.tweens.add({
        targets: cta,
        y: 584,
        duration: 650,
        delay: 360,
        ease: "Back.out",
      });
      this.tweens.add({
        targets: cta,
        scaleX: cta.scaleX * 1.03,
        scaleY: cta.scaleY * 1.03,
        duration: 650,
        delay: 1100,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      });
    }

    clickout() {
      window.open("https://example.com", "_blank", "noopener");
    }

    playSound(key, volume) {
      if (!this.soundOn) return;
      if (key === "jump") return;
      const sound =
        key === "loop"
          ? this.audio.loop
          : this.sound.add(key, { volume: volume ?? 0.65 });
      sound.play();
    }

    stopLoop() {
      if (this.audio.loop) this.audio.loop.stop();
    }

    updateEnvironmentPause() {
      const shouldPause =
        (this.mode === "countdown" || this.mode === "playing") &&
        (document.hidden || !this.windowFocused || !this.mouseInsideGame);
      this.pausedByEnvironment = shouldPause;
      if (shouldPause) {
        this.scene.pause();
        this.sound.pauseAll();
      } else {
        this.scene.resume();
        this.sound.resumeAll();
      }
    }

    clearStage() {
      this.tweens.killAll();
      this.stopLoop();
      this.children.removeAll(true);
      this.obstacles = [];
    }
  }

  new Phaser.Game({
    type: Phaser.AUTO,
    parent: "game",
    width: W,
    height: H,
    backgroundColor: "#091d4c",
    render: { antialias: true, roundPixels: false },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: GutRun,
  });
})();
