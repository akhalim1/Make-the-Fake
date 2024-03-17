class MenuScene extends BaseScene {
  constructor(config) {
    super("MenuScene", config);

    this.menu = [
      { scene: "PlayScene", text: "START", position: { x: 250, y: 480 } },
      {
        scene: "TutorialScene",
        text: "Tutorial",
        position: { x: this.config.width - 120, y: this.config.height - 50 },
      },
      {
        scene: "CreditsScene",
        text: "Credits",
        position: { x: this.config.width - 50, y: this.config.height - 50 },
      },
    ];
  }

  preload() {
    this.load.image("gameTitle", "assets/newgametitle.png");
    this.load.image("creditsIcon", "assets/creditsicon.png");
    this.load.image("tutorialIcon", "assets/tutorialicon.png");
  }

  create() {
    // Add the game title as a background
    this.add
      .image(this.cameras.main.centerX, this.cameras.main.centerY, "gameTitle")
      .setScale(0.6)
      .setOrigin(0.5, 0.5);

    this.createMenu(this.menu, this.setUpMenuEvents.bind(this)); // second argument will bind the correct "this" context

    const startMenuItem = this.menu.find((item) => item.text === "START");
    if (startMenuItem && startMenuItem.textObj) {
      this.makeTextBlink(startMenuItem.textObj);
    }
  }

  setUpMenuEvents(menuItem) {
    const textObj = menuItem.textObj;
    textObj.setInteractive();

    if (menuItem.position) {
      textObj.setPosition(menuItem.position.x, menuItem.position.y);
    }

    textObj.on("pointerdown", () => {});

    textObj.on("pointerup", () => {
      // Start a fade out effect when a menu item is clicked
      this.cameras.main.fadeOut(1000, 0, 0, 0);

      this.cameras.main.once("camerafadeoutcomplete", () => {
        menuItem.scene && this.scene.start(menuItem.scene);

        if (menuItem === "Exit") {
          this.game.destroy(true);
        }
      });
    });
  }

  makeTextBlink(textObj) {
    this.time.addEvent({
      delay: 500,
      callback: () => {
        textObj.visible = !textObj.visible;
      },
      loop: true,
    });
  }
}
