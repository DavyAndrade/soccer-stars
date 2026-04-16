import * as Phaser from 'phaser';

const ZONAS_CAMPO = ['DF1', 'MI1', 'MC', 'MI2', 'DF2'] as const;
const CORES_ZONA = [0x1d4ed8, 0x0ea5e9, 0x16a34a, 0xf59e0b, 0xdc2626] as const;

export class PartidaScene extends Phaser.Scene {
  private zoneObjects: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super('PartidaScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#09090b');

    this.drawField();

    this.scale.on('resize', () => {
      this.drawField();
    });
  }

  private drawField() {
    this.zoneObjects.forEach((obj) => obj.destroy());
    this.zoneObjects = [];

    const width = Math.max(this.scale.width, 375);
    const height = Math.max(this.scale.height, 667);

    const fieldWidth = Math.min(width - 24, 1000);
    const zoneWidth = fieldWidth / ZONAS_CAMPO.length;
    const zoneHeight = Math.min(Math.round(height * 0.44), 340);
    const startX = (width - fieldWidth) / 2;
    const startY = (height - zoneHeight) / 2;

    const hudText = this.add.text(width / 2, 24, "Placar 0 x 0  •  Tempo 0'  •  Energia 10", {
      color: '#e4e4e7',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      fontStyle: '600',
    });
    hudText.setOrigin(0.5, 0);
    this.zoneObjects.push(hudText);

    ZONAS_CAMPO.forEach((zona, index) => {
      const centerX = startX + zoneWidth * index + zoneWidth / 2;
      const centerY = startY + zoneHeight / 2;
      const isCurrentZone = zona === 'MC';

      const zoneRect = this.add
        .rectangle(centerX, centerY, zoneWidth - 4, zoneHeight, CORES_ZONA[index], 1)
        .setStrokeStyle(isCurrentZone ? 4 : 2, isCurrentZone ? 0xfacc15 : 0xf4f4f5, isCurrentZone ? 1 : 0.3);

      const zoneLabel = this.add.text(centerX, centerY, zona, {
        color: '#fafafa',
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        fontStyle: '700',
      });
      zoneLabel.setOrigin(0.5);

      this.zoneObjects.push(zoneRect, zoneLabel);
    });

    const footerText = this.add.text(width / 2, startY + zoneHeight + 20, 'Zona atual: MC', {
      color: '#a1a1aa',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
    });
    footerText.setOrigin(0.5, 0);
    this.zoneObjects.push(footerText);
  }
}
