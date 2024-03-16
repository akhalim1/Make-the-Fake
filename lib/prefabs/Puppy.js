class Puppy extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "puppy", "default");
    scene.add.existing(this);
    scene.physics.world.enable(this);

    this.body.setSize(50, 50).setOffset(100, 300).setImmovable(true);

    this.createAnimations();
  }

  createAnimations() {
    this.scene.anims.create({
      key: "default",
      frames: [{ key: "puppy", frame: "default" }],
      frameRate: 10,
    });

    this.scene.anims.create({
      key: "layingDown",
      frames: [{ key: "puppy", frame: "layingDown" }],
      frameRate: 10,
    });

    this.scene.anims.create({
      key: "tickled",
      frames: [{ key: "puppy", frame: "tickled" }],
      frameRate: 10,
    });

    this.scene.anims.create({
      key: "ouch",
      frames: [{ key: "puppy", frame: "ouch" }],
      frameRate: 10,
    });
  }

  changeState(newState) {
    if (this.currentState !== newState) {
      this.currentState = newState;
      this.play(newState);
    }
  }
}
