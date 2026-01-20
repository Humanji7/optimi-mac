/**
 * Spawn Modal Component
 *
 * Purpose: Модальное окно для создания новых агентов
 * Dependencies: React, AgentRole type
 */

import { useState, FormEvent } from 'react';
import type { AgentRole } from '../pixi/types';

interface SpawnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpawn: (role: AgentRole, projectPath: string) => void;
}

const ROLE_OPTIONS: { value: AgentRole; label: string; emoji: string }[] = [
  { value: 'Architect', label: 'Architect', emoji: '🏰' },
  { value: 'Coder', label: 'Coder', emoji: '💻' },
  { value: 'Tester', label: 'Tester', emoji: '🧪' },
  { value: 'Reviewer', label: 'Reviewer', emoji: '👁️' },
];

export function SpawnModal({ isOpen, onClose, onSpawn }: SpawnModalProps) {
  const [role, setRole] = useState<AgentRole>('Architect');
  const [projectPath, setProjectPath] = useState<string>('');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!projectPath.trim()) {
      alert('Project path is required');
      return;
    }

    onSpawn(role, projectPath.trim());

    // Reset form
    setRole('Architect');
    setProjectPath('');
  };

  const handleCancel = () => {
    // Reset form on cancel
    setRole('Architect');
    setProjectPath('');
    onClose();
  };

  return (
    <div style={styles.overlay} onClick={handleCancel}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.title}>Spawn Agent</h2>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label htmlFor="role" style={styles.label}>
              Role:
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as AgentRole)}
              style={styles.select}
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.emoji} {option.label}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="projectPath" style={styles.label}>
              Project Path:
            </label>
            <input
              id="projectPath"
              type="text"
              placeholder="/path/to/project"
              value={projectPath}
              onChange={(e) => setProjectPath(e.target.value)}
              style={styles.input}
              autoFocus
            />
          </div>

          <div style={styles.buttonGroup}>
            <button type="button" onClick={handleCancel} style={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" style={styles.spawnButton}>
              Spawn
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Inline styles (темная тема)
const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#1e1e1e',
    padding: '24px',
    borderRadius: '8px',
    minWidth: '400px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
  },
  title: {
    margin: '0 0 20px 0',
    fontSize: '20px',
    fontWeight: 600,
    color: '#ffffff',
  },
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#cccccc',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    backgroundColor: '#2d2d2d',
    color: '#ffffff',
    border: '1px solid #444444',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    backgroundColor: '#2d2d2d',
    color: '#ffffff',
    border: '1px solid #444444',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
  },
  cancelButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#cccccc',
    backgroundColor: 'transparent',
    border: '1px solid #444444',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  spawnButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#ffffff',
    backgroundColor: '#007acc',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};
