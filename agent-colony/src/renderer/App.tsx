/**
 * Main React Component
 *
 * Purpose: Главный компонент приложения с PixiJS canvas для Agent Colony
 */

import { PixiCanvas } from './components/PixiCanvas';
import type { Application } from 'pixi.js';

function App() {
  const handleAppReady = (app: Application) => {
    console.log('[App] PixiJS ready:', {
      width: app.screen.width,
      height: app.screen.height,
    });
  };

  return <PixiCanvas onAppReady={handleAppReady} />;
}

export default App;
