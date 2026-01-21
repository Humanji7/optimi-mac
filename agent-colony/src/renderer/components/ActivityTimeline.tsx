/**
 * Activity Timeline Component
 * Purpose: Лента событий за последние 15 минут
 * Dependencies: electronAPI events (agent:spawned, agent:killed, agent:updated, agent:error)
 */

import { useState, useEffect, useCallback } from 'react';

interface TimelineEvent {
  id: string;
  timestamp: number;
  type: 'spawned' | 'killed' | 'updated' | 'error';
  agentId: string;
  agentRole?: string;
  message: string;
}

const MAX_AGE_MS = 15 * 60 * 1000; // 15 minutes
const MAX_EVENTS = 50;

export function ActivityTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  const addEvent = useCallback((event: Omit<TimelineEvent, 'id'>) => {
    setEvents((prev) => {
      const now = Date.now();
      const filtered = prev
        .filter((e) => now - e.timestamp < MAX_AGE_MS)
        .slice(0, MAX_EVENTS - 1);

      return [
        { ...event, id: `${now}-${Math.random().toString(36).slice(2)}` },
        ...filtered,
      ];
    });
  }, []);

  // Cleanup old events periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setEvents((prev) => prev.filter((e) => now - e.timestamp < MAX_AGE_MS));
    }, 30000); // every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Subscribe to events
  useEffect(() => {
    const handleSpawned = (data: unknown) => {
      const agent = data as { id: string; role: string };
      addEvent({
        timestamp: Date.now(),
        type: 'spawned',
        agentId: agent.id,
        agentRole: agent.role,
        message: `${agent.role} spawned`,
      });
    };

    const handleKilled = (data: unknown) => {
      const { id } = data as { id: string };
      addEvent({
        timestamp: Date.now(),
        type: 'killed',
        agentId: id,
        message: 'Agent stopped',
      });
    };

    const handleUpdated = (data: unknown) => {
      const update = data as { id: string; changes?: { status?: string } };
      if (update.changes?.status) {
        addEvent({
          timestamp: Date.now(),
          type: 'updated',
          agentId: update.id,
          message: `Status: ${update.changes.status}`,
        });
      }
    };

    const handleError = (data: unknown) => {
      const { id, error } = data as { id: string; error: string };
      addEvent({
        timestamp: Date.now(),
        type: 'error',
        agentId: id,
        message: error.slice(0, 50),
      });
    };

    const unsub1 = window.electronAPI.onAgentSpawned(handleSpawned);
    const unsub2 = window.electronAPI.onAgentKilled(handleKilled);
    const unsub3 = window.electronAPI.onAgentUpdated(handleUpdated);
    const unsub4 = window.electronAPI.onAgentError(handleError);

    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
    };
  }, [addEvent]);

  if (events.length === 0) {
    return null; // Hide when empty
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>Activity</div>
      <div style={styles.list}>
        {events.slice(0, 10).map((event) => (
          <div key={event.id} style={styles.item}>
            <span style={{ ...styles.icon, color: getEventColor(event.type) }}>
              {getEventIcon(event.type)}
            </span>
            <span style={styles.message}>{event.message}</span>
            <span style={styles.time}>{formatTime(event.timestamp)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getEventIcon(type: TimelineEvent['type']): string {
  switch (type) {
    case 'spawned': return '+';
    case 'killed': return '×';
    case 'updated': return '↻';
    case 'error': return '!';
  }
}

function getEventColor(type: TimelineEvent['type']): string {
  switch (type) {
    case 'spawned': return '#22c55e';
    case 'killed': return '#888';
    case 'updated': return '#3b82f6';
    case 'error': return '#ef4444';
  }
}

function formatTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h`;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    width: 200,
    maxHeight: 250,
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    borderRadius: 4,
    border: '1px solid #444',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
  },
  header: {
    padding: '6px 10px',
    backgroundColor: '#2d2d2d',
    borderBottom: '1px solid #444',
    fontSize: 10,
    fontWeight: 600,
    color: '#888',
    textTransform: 'uppercase',
  },
  list: {
    padding: '4px 0',
    maxHeight: 210,
    overflowY: 'auto',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    fontSize: 11,
    color: '#ccc',
  },
  icon: {
    fontWeight: 'bold',
    fontSize: 12,
    width: 12,
    textAlign: 'center',
  },
  message: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  time: {
    color: '#666',
    fontSize: 10,
  },
};
