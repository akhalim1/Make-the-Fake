class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    this.load.image("background", "assets/background.png");
  }

  create() {
    this.scene.start("PlayScene");
  }
}
