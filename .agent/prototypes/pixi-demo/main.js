import { Application, Graphics, Container } from 'pixi.js';

// Configuration
const SPRITE_COUNT = 25;
const SPRITE_RADIUS = 12;
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;
const SPEED_MIN = 1;
const SPEED_MAX = 3;

// Agent colors (distinct colors for each agent)
const AGENT_COLORS = [
  0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24, 0xf0932b,
  0xeb4d4b, 0x6c5ce7, 0xa29bfe, 0x00b894, 0x00cec9,
  0xfd79a8, 0xfdcb6e, 0xe17055, 0x74b9ff, 0x0984e3,
  0xfd79a8, 0xe84393, 0x6c5ce7, 0xa29bfe, 0xdfe6e9,
  0x00b894, 0x00cec9, 0x81ecec, 0x74b9ff, 0x0984e3
];

class Agent {
  constructor(x, y, color, container) {
    this.x = x;
    this.y = y;
    this.color = color;

    // Random velocity
    this.vx = (Math.random() - 0.5) * (SPEED_MAX - SPEED_MIN) + SPEED_MIN;
    this.vy = (Math.random() - 0.5) * (SPEED_MAX - SPEED_MIN) + SPEED_MIN;

    // Pulsing animation state
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.pulseSpeed = 0.05 + Math.random() * 0.05;

    // Create sprite (circular graphic)
    this.sprite = new Graphics();
    this.drawSprite();

    container.addChild(this.sprite);
  }

  drawSprite() {
    this.sprite.clear();

    // Outer glow
    this.sprite.circle(0, 0, SPRITE_RADIUS + 2);
    this.sprite.fill({ color: this.color, alpha: 0.3 });

    // Main circle
    this.sprite.circle(0, 0, SPRITE_RADIUS);
    this.sprite.fill({ color: this.color, alpha: 1 });

    // Inner highlight
    this.sprite.circle(-3, -3, SPRITE_RADIUS / 3);
    this.sprite.fill({ color: 0xffffff, alpha: 0.6 });

    this.sprite.x = this.x;
    this.sprite.y = this.y;
  }

  update(delta) {
    // Update position
    this.x += this.vx * delta;
    this.y += this.vy * delta;

    // Bounce off walls
    if (this.x - SPRITE_RADIUS < 0 || this.x + SPRITE_RADIUS > CANVAS_WIDTH) {
      this.vx *= -1;
      this.x = Math.max(SPRITE_RADIUS, Math.min(CANVAS_WIDTH - SPRITE_RADIUS, this.x));
    }

    if (this.y - SPRITE_RADIUS < 0 || this.y + SPRITE_RADIUS > CANVAS_HEIGHT) {
      this.vy *= -1;
      this.y = Math.max(SPRITE_RADIUS, Math.min(CANVAS_HEIGHT - SPRITE_RADIUS, this.y));
    }

    // Pulsing scale animation
    this.pulsePhase += this.pulseSpeed * delta;
    const pulseScale = 1 + Math.sin(this.pulsePhase) * 0.15;

    // Update sprite
    this.sprite.x = this.x;
    this.sprite.y = this.y;
    this.sprite.scale.set(pulseScale);
  }

  destroy() {
    this.sprite.destroy();
  }
}

class AgentDemo {
  constructor() {
    this.agents = [];
    this.app = null;
    this.agentContainer = null;
  }

  async init() {
    // Create PixiJS application
    this.app = new Application();

    await this.app.init({
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      background: '#1a1a2e',
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true
    });

    // Add canvas to DOM
    document.querySelector('#app').appendChild(this.app.canvas);

    // Create container for agents
    this.agentContainer = new Container();
    this.app.stage.addChild(this.agentContainer);

    // Create agents
    this.createAgents();

    // Setup animation loop
    this.app.ticker.add((ticker) => this.animate(ticker.deltaTime));

    // Setup FPS counter
    this.setupFPSCounter();

    console.log('PixiJS v8 Demo initialized');
    console.log(`Canvas: ${CANVAS_WIDTH}x${CANVAS_HEIGHT}`);
    console.log(`Agents: ${SPRITE_COUNT}`);
  }

  createAgents() {
    for (let i = 0; i < SPRITE_COUNT; i++) {
      const x = SPRITE_RADIUS + Math.random() * (CANVAS_WIDTH - SPRITE_RADIUS * 2);
      const y = SPRITE_RADIUS + Math.random() * (CANVAS_HEIGHT - SPRITE_RADIUS * 2);
      const color = AGENT_COLORS[i % AGENT_COLORS.length];

      const agent = new Agent(x, y, color, this.agentContainer);
      this.agents.push(agent);
    }

    // Update sprite count display
    document.getElementById('sprite-count').textContent = this.agents.length;
  }

  animate(delta) {
    // Update all agents
    for (const agent of this.agents) {
      agent.update(delta);
    }
  }

  setupFPSCounter() {
    setInterval(() => {
      const fps = Math.round(this.app.ticker.FPS);
      document.getElementById('fps').textContent = fps;

      // Color-code FPS
      const fpsElement = document.getElementById('fps');
      if (fps >= 55) {
        fpsElement.style.color = '#00ff00';
      } else if (fps >= 30) {
        fpsElement.style.color = '#ffff00';
      } else {
        fpsElement.style.color = '#ff0000';
      }
    }, 100);
  }

  destroy() {
    this.agents.forEach(agent => agent.destroy());
    this.agents = [];
    this.app.destroy(true, { children: true, texture: true });
  }
}

// Initialize demo when DOM is ready
(async () => {
  const demo = new AgentDemo();
  await demo.init();

  // Expose to window for debugging
  window.demo = demo;
})();
