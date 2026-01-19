/**
 * Canvas 2D API Demo - Animated Circles
 *
 * Purpose: Baseline performance test for agent simulation using pure Canvas 2D
 * Features:
 * - 25 animated circles with physics (velocity, bounce)
 * - FPS counter (manual calculation)
 * - Size pulsing animation
 * - Random colors and movement
 */

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const fpsElement = document.getElementById('fps');
const spritesElement = document.getElementById('sprites');

// Configuration
const AGENT_COUNT = 25;
const MIN_RADIUS = 8;
const MAX_RADIUS = 16;
const MIN_SPEED = 50; // pixels per second
const MAX_SPEED = 150;
const PULSE_SPEED = 2; // radians per second

// Agent array
const agents = [];

// FPS calculation
let frameCount = 0;
let lastFpsUpdate = performance.now();
let currentFps = 0;

/**
 * Generate random number between min and max
 */
function random(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Generate random color
 */
function randomColor() {
  const colors = [
    '#16c79a', // teal
    '#f5a962', // orange
    '#ff6b9d', // pink
    '#c44569', // dark pink
    '#84a59d', // sage
    '#f6bd60', // yellow
    '#5e72eb', // purple
    '#58b4ae', // cyan
    '#ed6663', // red
    '#4a90e2', // blue
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Create agent with random properties
 */
function createAgent() {
  const radius = random(MIN_RADIUS, MAX_RADIUS);
  const angle = random(0, Math.PI * 2);
  const speed = random(MIN_SPEED, MAX_SPEED);

  return {
    x: random(radius, canvas.width - radius),
    y: random(radius, canvas.height - radius),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    baseRadius: radius,
    radius: radius,
    color: randomColor(),
    pulsePhase: random(0, Math.PI * 2),
  };
}

/**
 * Initialize agents
 */
function initAgents() {
  for (let i = 0; i < AGENT_COUNT; i++) {
    agents.push(createAgent());
  }
  spritesElement.textContent = agents.length;
}

/**
 * Update agent position and handle collisions
 */
function updateAgent(agent, deltaTime) {
  // Update position
  agent.x += agent.vx * deltaTime;
  agent.y += agent.vy * deltaTime;

  // Bounce off left/right walls
  if (agent.x - agent.radius < 0) {
    agent.x = agent.radius;
    agent.vx = Math.abs(agent.vx);
  } else if (agent.x + agent.radius > canvas.width) {
    agent.x = canvas.width - agent.radius;
    agent.vx = -Math.abs(agent.vx);
  }

  // Bounce off top/bottom walls
  if (agent.y - agent.radius < 0) {
    agent.y = agent.radius;
    agent.vy = Math.abs(agent.vy);
  } else if (agent.y + agent.radius > canvas.height) {
    agent.y = canvas.height - agent.radius;
    agent.vy = -Math.abs(agent.vy);
  }

  // Update pulse animation
  agent.pulsePhase += PULSE_SPEED * deltaTime;
  const pulseFactor = 0.2 * Math.sin(agent.pulsePhase);
  agent.radius = agent.baseRadius * (1 + pulseFactor);
}

/**
 * Draw agent on canvas
 */
function drawAgent(agent) {
  ctx.beginPath();
  ctx.arc(agent.x, agent.y, agent.radius, 0, Math.PI * 2);
  ctx.fillStyle = agent.color;
  ctx.fill();

  // Optional: Add glow effect
  ctx.shadowBlur = 10;
  ctx.shadowColor = agent.color;
  ctx.fill();
  ctx.shadowBlur = 0;
}

/**
 * Update FPS counter
 */
function updateFps() {
  frameCount++;
  const now = performance.now();
  const elapsed = now - lastFpsUpdate;

  // Update FPS every 500ms
  if (elapsed >= 500) {
    currentFps = Math.round((frameCount * 1000) / elapsed);
    fpsElement.textContent = currentFps;
    frameCount = 0;
    lastFpsUpdate = now;
  }
}

/**
 * Main animation loop
 */
let lastFrameTime = performance.now();

function animate() {
  const now = performance.now();
  const deltaTime = (now - lastFrameTime) / 1000; // Convert to seconds
  lastFrameTime = now;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update and draw all agents
  for (const agent of agents) {
    updateAgent(agent, deltaTime);
    drawAgent(agent);
  }

  // Update FPS counter
  updateFps();

  // Next frame
  requestAnimationFrame(animate);
}

/**
 * Start application
 */
function start() {
  console.log('Canvas 2D Demo started');
  console.log(`Canvas size: ${canvas.width}x${canvas.height}`);
  console.log(`Agents: ${AGENT_COUNT}`);

  initAgents();
  animate();
}

// Start when DOM is ready
start();
