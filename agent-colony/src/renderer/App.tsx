/**
 * Main React Component
 *
 * Purpose: Главный компонент приложения - отображает заголовок и информацию из main process
 */

import { useEffect, useState } from 'react';

interface AppInfo {
  version: string;
  name: string;
  platform: string;
}

function App() {
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get app info from main process via IPC
    window.electronAPI
      .getAppInfo()
      .then((info) => {
        setAppInfo(info);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to get app info');
      });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Agent Colony v0.1.0</h1>

      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {appInfo && (
        <div style={{ marginTop: '20px', fontSize: '14px' }}>
          <p>
            <strong>App Name:</strong> {appInfo.name}
          </p>
          <p>
            <strong>Version:</strong> {appInfo.version}
          </p>
          <p>
            <strong>Platform:</strong> {appInfo.platform}
          </p>
        </div>
      )}

      {!appInfo && !error && (
        <p style={{ marginTop: '10px', color: '#666' }}>Loading app info...</p>
      )}
    </div>
  );
}

export default App;
