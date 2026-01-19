/**
 * spawn-agent.js
 *
 * Purpose: Spawn Claude Code or Codex CLI agents in isolated tmux sessions
 *
 * Public methods:
 *   - spawnAgent(config): Create new tmux session with agent
 *   - listSessions(): Get all active agent sessions
 *   - killSession(name): Terminate specific session
 *   - sendCommand(name, command): Send command to running session
 *
 * Dependencies:
 *   - child_process (Node.js built-in)
 *   - events (Node.js built-in)
 *
 * Events:
 *   - 'spawned': (sessionInfo) => emitted after successful spawn
 *   - 'killed': (sessionName) => emitted after session termination
 *   - 'error': (error) => emitted on any error
 */

const { execSync, spawn } = require('child_process');
const EventEmitter = require('events');

// Allowed agent types
const AGENT_TYPES = {
  CLAUDE: 'claude',
  CODEX: 'codex'
};

// Default working directory
const DEFAULT_WORKDIR = process.cwd();

/**
 * AgentSpawner - Manages tmux sessions for Claude Code and Codex CLI agents
 *
 * @extends EventEmitter
 * @example
 * const spawner = new AgentSpawner();
 * spawner.on('spawned', (info) => console.log('Agent started:', info));
 *
 * const session = await spawner.spawnAgent({
 *   type: 'claude',
 *   name: 'agent-1',
 *   workdir: '/path/to/project'
 * });
 */
class AgentSpawner extends EventEmitter {
  constructor() {
    super();
    this._validateTmuxInstalled();
  }

  /**
   * Validate that tmux is installed on the system
   * @private
   * @throws {Error} If tmux is not found
   */
  _validateTmuxInstalled() {
    try {
      execSync('which tmux', { stdio: 'ignore' });
    } catch (error) {
      const err = new Error('tmux is not installed. Install with: brew install tmux');
      this.emit('error', err);
      throw err;
    }
  }

  /**
   * Validate session name format
   * @private
   * @param {string} name - Session name to validate
   * @throws {Error} If name contains invalid characters
   */
  _validateSessionName(name) {
    if (!name || typeof name !== 'string') {
      throw new Error('Session name is required and must be a string');
    }

    // Only allow alphanumeric characters and dashes
    const validPattern = /^[a-zA-Z0-9-]+$/;
    if (!validPattern.test(name)) {
      throw new Error('Session name must contain only alphanumeric characters and dashes');
    }

    // Check if session already exists
    const sessions = this.listSessions();
    if (sessions.some(s => s.name === name)) {
      throw new Error(`Session with name "${name}" already exists`);
    }
  }

  /**
   * Get command to start agent based on type
   * @private
   * @param {string} type - Agent type ('claude' or 'codex')
   * @returns {string} Command to execute
   */
  _getAgentCommand(type) {
    switch (type) {
      case AGENT_TYPES.CLAUDE:
        return 'claude';
      case AGENT_TYPES.CODEX:
        return 'codex';
      default:
        throw new Error(`Unknown agent type: ${type}. Use 'claude' or 'codex'`);
    }
  }

  /**
   * Create tmux session with agent
   *
   * @param {Object} config - Spawn configuration
   * @param {string} config.type - Agent type ('claude' or 'codex')
   * @param {string} config.name - Unique session name (alphanumeric + dashes only)
   * @param {string} [config.workdir] - Working directory (defaults to current)
   * @returns {Promise<Object>} Session info: { sessionName, pid, startedAt, type, workdir }
   * @throws {Error} If spawn fails or validation fails
   */
  async spawnAgent(config) {
    try {
      const { type, name, workdir = DEFAULT_WORKDIR } = config;

      // Validate inputs
      this._validateSessionName(name);
      const agentCommand = this._getAgentCommand(type);

      // Create tmux session in detached mode
      execSync(`tmux new-session -d -s ${name} -c "${workdir}"`, {
        encoding: 'utf-8'
      });

      // Send command to start agent
      execSync(`tmux send-keys -t ${name} "${agentCommand}" Enter`, {
        encoding: 'utf-8'
      });

      // Get session PID
      const pidOutput = execSync(`tmux list-panes -t ${name} -F "#{pane_pid}"`, {
        encoding: 'utf-8'
      }).trim();
      const pid = parseInt(pidOutput, 10);

      const sessionInfo = {
        sessionName: name,
        pid,
        startedAt: new Date().toISOString(),
        type,
        workdir
      };

      this.emit('spawned', sessionInfo);
      return sessionInfo;

    } catch (error) {
      const err = new Error(`Failed to spawn agent: ${error.message}`);
      this.emit('error', err);
      throw err;
    }
  }

  /**
   * List all active tmux sessions
   *
   * @returns {Array<Object>} Array of session info: [{ name, pid, created }]
   */
  listSessions() {
    try {
      const output = execSync('tmux list-sessions -F "#{session_name}:#{pane_pid}:#{session_created}"', {
        encoding: 'utf-8'
      }).trim();

      if (!output) {
        return [];
      }

      return output.split('\n').map(line => {
        const [name, pid, created] = line.split(':');
        return {
          name,
          pid: parseInt(pid, 10),
          created: new Date(parseInt(created, 10) * 1000).toISOString()
        };
      });

    } catch (error) {
      // No sessions found is not an error
      if (error.message.includes('no server running')) {
        return [];
      }
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Kill specific tmux session
   *
   * @param {string} name - Session name to kill
   * @throws {Error} If session doesn't exist or kill fails
   */
  killSession(name) {
    try {
      execSync(`tmux kill-session -t ${name}`, {
        encoding: 'utf-8'
      });

      this.emit('killed', name);

    } catch (error) {
      const err = new Error(`Failed to kill session "${name}": ${error.message}`);
      this.emit('error', err);
      throw err;
    }
  }

  /**
   * Send command to running tmux session
   *
   * @param {string} name - Session name
   * @param {string} command - Command to send (will append Enter automatically)
   * @throws {Error} If session doesn't exist or send fails
   */
  sendCommand(name, command) {
    try {
      execSync(`tmux send-keys -t ${name} "${command}" Enter`, {
        encoding: 'utf-8'
      });

    } catch (error) {
      const err = new Error(`Failed to send command to session "${name}": ${error.message}`);
      this.emit('error', err);
      throw err;
    }
  }
}

module.exports = { AgentSpawner, AGENT_TYPES };
