import type * as Phaser from 'phaser';

export const MIN_VIEWPORT_WIDTH = 375;
export const MIN_VIEWPORT_HEIGHT = 667;

type PhaserModule = typeof import('phaser');

function createScenes(PhaserRuntime: PhaserModule) {
  class MenuScene extends PhaserRuntime.Scene {
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

  class PartidaScene extends PhaserRuntime.Scene {
    private zoneObjects: Phaser.GameObjects.GameObject[] = [];

    private readonly ZONAS_CAMPO = ['DF1', 'MI1', 'MC', 'MI2', 'DF2'] as const;
    private readonly CORES_ZONA = [0x1d4ed8, 0x0ea5e9, 0x16a34a, 0xf59e0b, 0xdc2626] as const;

    constructor() {
      super('PartidaScene');
    }

    create() {
      this.cameras.main.setBackgroundColor('#09090b');
      this.drawField();
      this.scale.on('resize', () => this.drawField());
    }

    private drawField() {
      this.zoneObjects.forEach((obj) => obj.destroy());
      this.zoneObjects = [];

      const width = Math.max(this.scale.width, MIN_VIEWPORT_WIDTH);
      const height = Math.max(this.scale.height, MIN_VIEWPORT_HEIGHT);

      const fieldWidth = Math.min(width - 24, 1000);
      const zoneWidth = fieldWidth / this.ZONAS_CAMPO.length;
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

      this.ZONAS_CAMPO.forEach((zona, index) => {
        const centerX = startX + zoneWidth * index + zoneWidth / 2;
        const centerY = startY + zoneHeight / 2;
        const isCurrentZone = zona === 'MC';

        const zoneRect = this.add
          .rectangle(centerX, centerY, zoneWidth - 4, zoneHeight, this.CORES_ZONA[index], 1)
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

  class ResultadoScene extends PhaserRuntime.Scene {
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

  return [MenuScene, PartidaScene, ResultadoScene];
}

export function createGameConfig(
  PhaserRuntime: PhaserModule,
  parent: string | HTMLElement
): Phaser.Types.Core.GameConfig {
  return {
    type: PhaserRuntime.AUTO,
    parent,
    backgroundColor: '#09090b',
    scene: createScenes(PhaserRuntime),
    scale: {
      mode: PhaserRuntime.Scale.RESIZE,
      autoCenter: PhaserRuntime.Scale.CENTER_BOTH,
      width: MIN_VIEWPORT_WIDTH,
      height: MIN_VIEWPORT_HEIGHT,
    },
    input: {
      touch: true,
      activePointers: 2,
    },
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
      },
    },
  };
}
