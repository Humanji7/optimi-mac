/**
 * Terminal Tooltip Component
 * Purpose: Показывает последние N строк терминала при hover
 */

import { useEffect, useState } from 'react';

interface TerminalTooltipProps {
  agentId: string;
  x: number;
  y: number;
  lines?: number;
}

export function TerminalTooltip({ agentId, x, y, lines = 10 }: TerminalTooltipProps) {
  const [output, setOutput] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchOutput = async () => {
      setLoading(true);
      try {
        const data = await window.electronAPI.terminalCapture(agentId, lines);
        if (!cancelled) {
          setOutput(data);
        }
      } catch (error) {
        console.error('[TerminalTooltip] Error:', error);
        if (!cancelled) {
          setOutput(['Error loading output']);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchOutput();

    return () => {
      cancelled = true;
    };
  }, [agentId, lines]);

  return (
    <div style={{
      position: 'fixed',
      left: x + 20,
      top: y,
      backgroundColor: '#1e1e1e',
      border: '1px solid #444',
      borderRadius: 4,
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      zIndex: 10000,
      maxWidth: 500,
      maxHeight: 250,
      overflow: 'hidden',
      pointerEvents: 'none',
    }}>
      <div style={{
        padding: '6px 10px',
        backgroundColor: '#2d2d2d',
        borderBottom: '1px solid #444',
        fontSize: 10,
        fontWeight: 600,
        color: '#888',
        textTransform: 'uppercase',
      }}>
        Terminal Preview
      </div>
      <div style={{
        padding: 8,
        fontFamily: 'Menlo, Monaco, monospace',
        fontSize: 11,
        color: '#ccc',
        lineHeight: 1.4,
        overflowY: 'auto',
        maxHeight: 200,
      }}>
        {loading ? (
          <div style={{ color: '#666' }}>Loading...</div>
        ) : output.length > 0 ? (
          output.map((line, i) => (
            <div key={i} style={{ whiteSpace: 'pre' }}>
              {line || '\u00A0'}
            </div>
          ))
        ) : (
          <div style={{ color: '#666', fontStyle: 'italic' }}>No output</div>
        )}
      </div>
    </div>
  );
}
