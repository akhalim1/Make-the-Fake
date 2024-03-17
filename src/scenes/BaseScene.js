class BaseScene extends Phaser.Scene {
  constructor(key, config) {
    super(key);
    this.config = config;
    this.fontSize = 40;
    this.lineHeight = 50;
    this.fontOptions = { fontSize: `${this.fontSize}px`, fill: "#fff" };
    this.screenCenter = [config.width / 2, config.height / 2];
  }

  preload() {
    this.load.bitmapFont(
      "copyduck",
      "assets/font/copyduck.png",
      "assets/font/copyduck.xml"
    );

    this.load.image("pinkbg", "assets/pinkbg.png");
  }
  create() {
    this.add.image(0, 0, "pinkbg").setOrigin(0);
    if (this.config.canGoBack) {
      const backButton = this.add
        .image(this.config.width - 10, this.config.height - 10, "backbutton")
        .setOrigin(1)
        .setScale(0.5)
        .setInteractive();

      backButton.on("pointerup", () => {
        this.scene.start("MenuScene");
      });
    }
  }

  createMenu(menu, setUpMenuEvents) {
    let lastMenuPositionY = 0;

    menu.forEach((menuItem) => {
      const menuPosition = [
        this.screenCenter[0],
        this.screenCenter[1] + lastMenuPositionY,
      ];

      if (menuItem.text === "Start") {
        menuItem.textObj = this.add
          .text(...menuPosition, menuItem.text, this.fontOptions)
          .setOrigin(0.5, 1);
      } else {
        const spriteKey =
          menuItem.text === "Tutorial" ? "tutorialIcon" : "creditsIcon";

        menuItem.textObj = this.add
          .sprite(...menuPosition, spriteKey)
          .setScale(0.2)
          .setInteractive();
      }

      lastMenuPositionY += this.lineHeight;
      setUpMenuEvents(menuItem);
    });
  }
  startScene(sceneKey) {
    this.cameras.main.fadeOut(1000, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start(sceneKey);
    });
  }
}
