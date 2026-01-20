/**
 * Renderer Process Entry Point
 *
 * Purpose: React app entry point - рендерит App в DOM
 */

import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

// Note: StrictMode disabled due to PixiJS WebGL context issue
// https://github.com/pixijs/pixi-react/issues/602
ReactDOM.createRoot(root).render(<App />);
