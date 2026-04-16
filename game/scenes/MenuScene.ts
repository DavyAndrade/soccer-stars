import * as Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#09090b');

    this.add
      .text(width / 2, height / 2 - 36, 'Soccer Stars', {
        color: '#fafafa',
        fontFamily: 'Arial, sans-serif',
        fontSize: '40px',
        fontStyle: '700',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 24, 'Toque para iniciar', {
        color: '#a1a1aa',
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
      })
      .setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.start('PartidaScene');
    });
  }
}
