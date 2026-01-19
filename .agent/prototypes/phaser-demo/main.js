import Phaser from 'phaser';

/**
 * MainScene - основная сцена с 25 анимированными спрайтами
 *
 * Функциональность:
 * - Создание 25 круглых спрайтов с разными цветами
 * - Физика движения (arcade physics)
 * - Отскок от границ canvas
 * - Отображение FPS и количества спрайтов
 */
class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
    this.sprites = [];
    this.fpsText = null;
    this.spriteCountText = null;
  }

  preload() {
    // Не требуется загрузка внешних ассетов
  }

  create() {
    // Создаем текстуру для круглого спрайта (один раз)
    this.createCircleTexture();

    // Создаем 25 спрайтов
    const SPRITE_COUNT = 25;
    const colors = [
      0xff6b6b, // красный
      0x4ecdc4, // бирюзовый
      0x45b7d1, // голубой
      0xf7dc6f, // жёлтый
      0xbb8fce, // фиолетовый
      0x52d3aa, // зелёный
      0xff8c42, // оранжевый
    ];

    for (let i = 0; i < SPRITE_COUNT; i++) {
      // Случайная позиция
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);

      // Создаем спрайт
      const sprite = this.physics.add.sprite(x, y, 'circle');

      // Случайный цвет
      const color = colors[i % colors.length];
      sprite.setTint(color);

      // Случайная скорость
      const velocityX = Phaser.Math.Between(-200, 200);
      const velocityY = Phaser.Math.Between(-200, 200);
      sprite.setVelocity(velocityX, velocityY);

      // Отскок от границ
      sprite.setBounce(1, 1);
      sprite.setCollideWorldBounds(true);

      this.sprites.push(sprite);
    }

    // FPS счётчик (верхний левый угол)
    this.fpsText = this.add.text(10, 10, 'FPS: 0', {
      fontSize: '18px',
      fontFamily: 'Courier New',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });

    // Счётчик спрайтов (верхний правый угол)
    this.spriteCountText = this.add.text(790, 10, `Sprites: ${SPRITE_COUNT}`, {
      fontSize: '18px',
      fontFamily: 'Courier New',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    }).setOrigin(1, 0);
  }

  update() {
    // Обновляем FPS каждый кадр
    const fps = Math.round(this.game.loop.actualFps);
    this.fpsText.setText(`FPS: ${fps}`);
  }

  /**
   * Создает текстуру круга размером 20x20px
   */
  createCircleTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(10, 10, 10);
    graphics.generateTexture('circle', 20, 20);
    graphics.destroy();
  }
}

/**
 * Конфигурация Phaser игры
 */
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: MainScene
};

// Запуск игры
const game = new Phaser.Game(config);
