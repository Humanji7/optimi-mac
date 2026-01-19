# Canvas 2D API Demo

Pure Canvas 2D API demo with 25 animated circles simulating agents.

## Features

- **25 animated circles** with random colors and velocities
- **Physics simulation**: agents bounce off canvas edges
- **Pulsing animation**: each circle size oscillates smoothly
- **FPS counter**: manual frame rate calculation
- **Sprite count**: displays active agent count

## Technical Details

- **Pure Canvas 2D API** (no libraries)
- **requestAnimationFrame** for smooth 60 FPS animation
- **Delta time based movement** for frame-independent physics
- **Manual FPS calculation** using `performance.now()`
- **ctx.arc()** for circle rendering
- **ctx.clearRect()** for frame clearing

## How to Run

### Option 1: Vite (Recommended)

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`

### Option 2: Simple HTTP Server

```bash
# Python 3
python3 -m http.server 8000

# Node.js (if you have http-server)
npx http-server -p 8000
```

Opens at `http://localhost:8000`

## Architecture

```
agents[] = [
  {
    x, y,          // position
    vx, vy,        // velocity (pixels/second)
    radius,        // current radius
    baseRadius,    // original radius
    color,         // hex color
    pulsePhase     // animation phase
  }
]
```

## Performance Baseline

This demo serves as a performance baseline for comparing:
- Phaser.js
- PixiJS
- Three.js (2D mode)

**Expected FPS:** 60 on modern hardware

## Code Structure

- `index.html` - Canvas element + UI + styles
- `main.js` - Core animation loop + agent logic
- `package.json` - Vite dev server config

## Agent Behavior

1. **Movement**: Constant velocity with direction
2. **Collision**: Bounce off canvas edges (velocity reversal)
3. **Pulsing**: `sin(time)` based radius scaling (±20%)
4. **Colors**: Random from predefined palette (10 colors)

## FPS Calculation

```javascript
frameCount++
every 500ms:
  fps = (frameCount * 1000) / elapsed
  reset frameCount
```

## Next Steps

- Compare with Phaser.js demo (scene-based)
- Compare with PixiJS demo (sprite-based)
- Measure memory usage and CPU load
- Test with 100+ agents for scalability
