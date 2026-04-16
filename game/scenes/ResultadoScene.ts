import * as Phaser from 'phaser';

export class ResultadoScene extends Phaser.Scene {
  constructor() {
    super('ResultadoScene');
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#09090b');

    this.add
      .text(width / 2, height / 2 - 24, 'Fim de partida', {
        color: '#fafafa',
        fontFamily: 'Arial, sans-serif',
        fontSize: '36px',
        fontStyle: '700',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 20, 'Resultado será exibido aqui', {
        color: '#a1a1aa',
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
      })
      .setOrigin(0.5);
  }
}
