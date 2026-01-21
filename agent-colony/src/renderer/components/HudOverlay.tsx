/**
 * HUD Overlay Component
 *
 * Purpose: Показывает общую статистику по всем агентам
 * Displays: total agents, status breakdown, health summary, avg uptime
 */

import type { Agent } from './DetailPanel';
import { getSeverity } from '../utils/severity';

interface HudOverlayProps {
  agents: Map<string, Agent>;
}

export function HudOverlay({ agents }: HudOverlayProps) {
  const agentList = Array.from(agents.values());
  const total = agentList.length;

  if (total === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.item}>
          <span style={styles.label}>Agents</span>
          <span style={styles.value}>0</span>
        </div>
      </div>
    );
  }

  // Status breakdown
  const working = agentList.filter((a) => a.status === 'working').length;
  const idle = agentList.filter((a) => a.status === 'idle').length;
  const errors = agentList.filter((a) => a.status === 'error').length;
  const paused = agentList.filter((a) => a.status === 'paused').length;

  // Severity breakdown
  const severityCounts = agentList.reduce(
    (acc, agent) => {
      const severity = getSeverity(agent.metrics?.health, agent.status);
      if (severity) acc[severity]++;
      return acc;
    },
    { blocker: 0, warning: 0, info: 0 }
  );

  // Total uptime
  const totalUptime = agentList.reduce((sum, a) => sum + (a.metrics?.uptime || 0), 0);

  return (
    <div style={styles.container}>
      {/* Agents count */}
      <div style={styles.item}>
        <span style={styles.label}>Agents</span>
        <span style={styles.value}>{total}</span>
        <span style={styles.breakdown}>
          {working > 0 && <span style={styles.working}>{working} working</span>}
          {idle > 0 && <span style={styles.idle}>{idle} idle</span>}
          {paused > 0 && <span style={styles.paused}>{paused} paused</span>}
          {errors > 0 && <span style={styles.error}>{errors} error</span>}
        </span>
      </div>

      {/* Issues by severity */}
      {(severityCounts.blocker > 0 || severityCounts.warning > 0 || severityCounts.info > 0) && (
        <div style={styles.item}>
          <span style={styles.label}>Issues</span>
          <span style={styles.breakdown}>
            {severityCounts.blocker > 0 && (
              <span style={{ color: '#ef4444' }}>{severityCounts.blocker} blocker</span>
            )}
            {severityCounts.warning > 0 && (
              <span style={{ color: '#eab308' }}>{severityCounts.warning} warn</span>
            )}
            {severityCounts.info > 0 && (
              <span style={{ color: '#3b82f6' }}>{severityCounts.info} info</span>
            )}
          </span>
        </div>
      )}

      {/* Uptime */}
      <div style={styles.item}>
        <span style={styles.label}>Uptime</span>
        <span style={styles.value}>{formatUptime(totalUptime)}</span>
      </div>
    </div>
  );
}

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    padding: '4px 12px',
    backgroundColor: '#1e1e1e',
    borderRadius: '4px',
    fontSize: '12px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  label: {
    color: '#888',
    fontWeight: 500,
    textTransform: 'uppercase',
    fontSize: '10px',
  },
  value: {
    color: '#fff',
    fontWeight: 600,
    fontFamily: 'monospace',
  },
  breakdown: {
    display: 'flex',
    gap: '6px',
    fontSize: '11px',
  },
  working: {
    color: '#22c55e',
  },
  idle: {
    color: '#888',
  },
  paused: {
    color: '#eab308',
  },
  error: {
    color: '#ef4444',
  },
  healthy: {
    color: '#22c55e',
  },
  warn: {
    color: '#eab308',
  },
};
