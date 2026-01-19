/**
 * MetricsMonitor - CPU/Memory monitoring and context usage parsing for agent processes
 *
 * Purpose:
 * - Track process metrics (CPU, memory) for claude/codex agents
 * - Parse context usage from agent stdout buffers
 * - Detect hung agents (no activity timeout)
 * - Emit events for metrics, hung detection, resource alerts
 *
 * Dependencies: systeminformation
 *
 * Public Methods:
 * - start() - Begin periodic monitoring
 * - stop() - Stop all monitoring
 * - getProcessMetrics(processName) - Get CPU/memory for specific process
 * - parseContextUsage(outputBuffer) - Extract context % from output
 * - registerAgent(id, pid) - Register agent for activity tracking
 * - reportActivity(id) - Mark agent as active (call on stdout)
 *
 * Events:
 * - 'metrics' { id, pid, cpu, memory, memoryMB, contextUsage }
 * - 'hung' { id, pid, lastActivity, elapsed }
 * - 'highCpu' { id, pid, cpu }
 * - 'highMemory' { id, pid, memoryMB }
 */

const si = require('systeminformation');
const EventEmitter = require('events');

class MetricsMonitor extends EventEmitter {
  constructor(options = {}) {
    super();

    // Configuration
    this.interval = options.interval || 5000; // 5s default
    this.hangTimeout = options.hangTimeout || 60000; // 60s default

    // Thresholds
    this.cpuThreshold = options.cpuThreshold || 90; // %
    this.memoryThreshold = options.memoryThreshold || 2048; // MB

    // State
    this.intervalId = null;
    this.agents = new Map(); // id -> { pid, lastActivity }
    this.running = false;
  }

  /**
   * Start periodic monitoring
   */
  start() {
    if (this.running) {
      return;
    }

    this.running = true;
    this.intervalId = setInterval(() => {
      this._checkAllAgents();
      this._checkHungAgents();
    }, this.interval);

    this.emit('started');
  }

  /**
   * Stop monitoring and cleanup
   */
  stop() {
    if (!this.running) {
      return;
    }

    this.running = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.emit('stopped');
  }

  /**
   * Register agent for activity tracking
   * @param {string} id - Agent identifier
   * @param {number} pid - Process ID
   */
  registerAgent(id, pid) {
    this.agents.set(id, {
      pid,
      lastActivity: Date.now(),
    });
  }

  /**
   * Report agent activity (call when stdout/stderr received)
   * @param {string} id - Agent identifier
   */
  reportActivity(id) {
    const agent = this.agents.get(id);
    if (agent) {
      agent.lastActivity = Date.now();
    }
  }

  /**
   * Unregister agent (call when agent stops)
   * @param {string} id - Agent identifier
   */
  unregisterAgent(id) {
    this.agents.delete(id);
  }

  /**
   * Get process metrics by name
   * @param {string} processName - Process name to search (e.g., 'claude', 'codex')
   * @returns {Promise<Object|null>} { pid, cpu, memory, memoryMB } or null
   */
  async getProcessMetrics(processName) {
    try {
      const processes = await si.processes();

      // Find process by name (case-insensitive)
      const proc = processes.list.find(p =>
        p.name && p.name.toLowerCase().includes(processName.toLowerCase())
      );

      if (!proc) {
        return null;
      }

      return {
        pid: proc.pid,
        cpu: proc.cpu || 0,
        memory: proc.mem || 0, // % of total
        memoryMB: proc.memRss ? proc.memRss / 1024 / 1024 : 0, // Convert KB to MB
      };
    } catch (error) {
      this.emit('error', { type: 'metrics', error: error.message });
      return null;
    }
  }

  /**
   * Get process metrics by PID
   * @param {number} pid - Process ID
   * @returns {Promise<Object|null>} { pid, cpu, memory, memoryMB } or null
   */
  async getProcessMetricsByPid(pid) {
    try {
      const processes = await si.processes();
      const proc = processes.list.find(p => p.pid === pid);

      if (!proc) {
        return null;
      }

      return {
        pid: proc.pid,
        cpu: proc.cpu || 0,
        memory: proc.mem || 0,
        memoryMB: proc.memRss ? proc.memRss / 1024 / 1024 : 0,
      };
    } catch (error) {
      this.emit('error', { type: 'metrics_by_pid', error: error.message });
      return null;
    }
  }

  /**
   * Parse context usage from agent output buffer
   * @param {string} outputBuffer - stdout/stderr buffer
   * @returns {number|null} Context usage percentage (0-100) or null if not found
   */
  parseContextUsage(outputBuffer) {
    if (!outputBuffer) {
      return null;
    }

    // Look for "used_percentage": X pattern (common in Claude Code output)
    const match = outputBuffer.match(/"used_percentage":\s*(\d+(?:\.\d+)?)/);

    if (match && match[1]) {
      const percentage = parseFloat(match[1]);
      return isNaN(percentage) ? null : percentage;
    }

    // Alternative pattern: "context: 45%" or similar
    const altMatch = outputBuffer.match(/context:\s*(\d+(?:\.\d+)?)\s*%/i);

    if (altMatch && altMatch[1]) {
      const percentage = parseFloat(altMatch[1]);
      return isNaN(percentage) ? null : percentage;
    }

    return null;
  }

  /**
   * Check all registered agents and emit metrics
   * @private
   */
  async _checkAllAgents() {
    for (const [id, agent] of this.agents.entries()) {
      const metrics = await this.getProcessMetricsByPid(agent.pid);

      if (!metrics) {
        this.emit('error', {
          type: 'process_not_found',
          id,
          pid: agent.pid
        });
        continue;
      }

      // Emit metrics event
      this.emit('metrics', {
        id,
        ...metrics,
        contextUsage: null, // Set by external caller when parsing output
      });

      // Check thresholds
      if (metrics.cpu > this.cpuThreshold) {
        this.emit('highCpu', { id, pid: agent.pid, cpu: metrics.cpu });
      }

      if (metrics.memoryMB > this.memoryThreshold) {
        this.emit('highMemory', {
          id,
          pid: agent.pid,
          memoryMB: metrics.memoryMB
        });
      }
    }
  }

  /**
   * Check for hung agents (no activity for hangTimeout)
   * @private
   */
  _checkHungAgents() {
    const now = Date.now();

    for (const [id, agent] of this.agents.entries()) {
      const elapsed = now - agent.lastActivity;

      if (elapsed > this.hangTimeout) {
        this.emit('hung', {
          id,
          pid: agent.pid,
          lastActivity: agent.lastActivity,
          elapsed,
        });
      }
    }
  }
}

module.exports = { MetricsMonitor };
