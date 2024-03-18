class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    this.load.image("gameTitle", "assets/newgametitle.png");
    this.load.image("creditsIcon", "assets/creditsicon.png");
    this.load.image("tutorialIcon", "assets/tutorialicon.png");
    this.load.image("pinkbg", "assets/pinkbg.png");
    this.load.image("backbutton", "assets/backbutton.png");
    this.load.image("background", "assets/background.png");
    this.load.image("clicker", "assets/clicker.png");
    this.load.image("heart", "assets/unfilledheart.png");
    this.load.image("filledHeart", "assets/filledheart.png");

    this.load.audio("ouch", "assets/ouch.mp3");
    this.load.audio("bark", "assets/bark.mp3");

    this.load.atlas(
      "puppy",
      "assets/spritesheet/puppy.png",
      "assets/spritesheet/puppy.json"
    );

    this.load.bitmapFont(
      "copyduck",
      "assets/font/copyduck.png",
      "assets/font/copyduck.xml"
    );
  }

  create() {
    this.scene.start("MenuScene");
  }
}
