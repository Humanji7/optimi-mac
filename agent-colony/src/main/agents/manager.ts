/**
 * Agent Manager - Main Lifecycle Manager
 *
 * Responsibilities:
 * - Spawn/kill agents
 * - Health monitoring
 * - Event emission
 * - Registry management
 * - Graceful shutdown
 */

import { v4 as uuidv4 } from 'uuid';
import * as tmux from '../tmux';
import { sendEscape, sessionExists } from '../tmux';
import { createAgent as dbCreateAgent, updateAgent as dbUpdateAgent, getAllAgents as dbGetAllAgents } from '../db/models/agent';
import { initDatabase as initDb } from '../db';
import * as registry from './registry';
import { agentEvents } from './events';
import { checkHealth } from './health';
import { Agent, SpawnAgentOptions, AgentStatus } from './types';
import { AgentRecord } from '../db/types';

/**
 * Convert AgentRecord (db) to Agent (manager)
 */
function recordToAgent(record: AgentRecord): Agent {
  return {
    id: record.id,
    role: record.role as Agent['role'],
    status: record.status as Agent['status'],
    project: {
      name: record.project_name,
      path: record.project_path,
    },
    process: {
      tmuxSession: record.tmux_session || '',
      pid: null,
    },
    metrics: {
      health: 'unknown',
      contextUsage: null,
      uptime: Math.floor((Date.now() - record.created_at) / 1000),
      lastActivity: record.last_seen,
    },
    position: {
      x: record.position_x,
      y: record.position_y,
    },
    hookStatus: {
      active: false,
      currentMolecule: null,
      totalMolecules: null,
      hookPath: null,
    },
    createdAt: record.created_at,
  };
}

/**
 * Convert Agent (manager) to partial AgentRecord (db)
 */
function agentToRecord(agent: Agent): Omit<AgentRecord, 'created_at' | 'last_seen'> {
  return {
    id: agent.id,
    role: agent.role,
    status: agent.status,
    project_name: agent.project.name,
    project_path: agent.project.path,
    tmux_session: agent.process.tmuxSession || null,
    position_x: agent.position.x,
    position_y: agent.position.y,
  };
}

const HEALTH_CHECK_INTERVAL = 10000; // 10 seconds
const GRACEFUL_EXIT_TIMEOUT = 5000; // 5 seconds

export class AgentManager {
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private isShuttingDown = false;

  /**
   * Initialize manager
   * Loads agents from SQLite and starts health checks
   */
  async init(): Promise<void> {
    console.log('[AgentManager] Initializing...');

    // Initialize database first
    initDb();

    // Load agents from SQLite into registry
    const savedRecords = dbGetAllAgents();
    console.log(`[AgentManager] Loaded ${savedRecords.length} agents from database`);

    for (const record of savedRecords) {
      const agent = recordToAgent(record);
      registry.setAgent(agent);
    }

    // Start health check interval
    this.healthCheckInterval = setInterval(() => {
      this.runHealthCheck().catch((error) => {
        console.error('[AgentManager] Health check failed:', error);
      });
    }, HEALTH_CHECK_INTERVAL);

    console.log('[AgentManager] Initialized successfully');
  }

  /**
   * Spawn new agent
   */
  async spawnAgent(options: SpawnAgentOptions): Promise<Agent> {
    if (this.isShuttingDown) {
      throw new Error('Cannot spawn agent during shutdown');
    }

    const id = uuidv4();
    const sessionName = `agent-${id.slice(0, 8)}`;
    const command = options.command || 'claude';

    console.log(`[AgentManager] Spawning agent ${id} (${options.role}) for ${options.projectName}`);

    // Create tmux session
    await tmux.spawnSession({
      sessionName,
      workDir: options.projectPath,
      command,
    });

    const now = Date.now();

    // Create agent object
    const agent: Agent = {
      id,
      role: options.role,
      status: 'idle',
      project: {
        name: options.projectName,
        path: options.projectPath,
      },
      process: {
        tmuxSession: sessionName,
        pid: null, // Will be populated later if needed
      },
      metrics: {
        health: 'healthy',
        contextUsage: null,
        uptime: 0,
        lastActivity: now,
      },
      position: {
        x: 0,
        y: 0,
      },
      hookStatus: {
        active: false,
        currentMolecule: null,
        totalMolecules: null,
        hookPath: null,
      },
      createdAt: now,
    };

    // Save to SQLite
    dbCreateAgent(agentToRecord(agent));

    // Add to registry
    registry.setAgent(agent);

    // Emit event
    agentEvents.emit('agent:spawned', agent);

    console.log(`[AgentManager] Agent ${id} spawned successfully`);

    return agent;
  }

  /**
   * Kill agent gracefully
   */
  async killAgent(id: string): Promise<void> {
    console.log(`[AgentManager] Killing agent ${id}`);

    const agent = registry.getAgent(id);
    if (!agent) {
      throw new Error(`Agent ${id} not found`);
    }

    try {
      // Send exit command to tmux
      await tmux.sendKeys(agent.process.tmuxSession, 'exit');

      // Wait for graceful exit
      await this.waitForExit(agent.process.tmuxSession, GRACEFUL_EXIT_TIMEOUT);
    } catch (error) {
      console.warn(`[AgentManager] Graceful exit failed for ${id}, forcing kill:`, error);
    }

    // Force kill if still exists
    const stillExists = await tmux.sessionExists(agent.process.tmuxSession);
    if (stillExists) {
      console.log(`[AgentManager] Force killing session ${agent.process.tmuxSession}`);
      await tmux.killSession(agent.process.tmuxSession);
    }

    // Update SQLite
    dbUpdateAgent(id, {
      status: 'idle',
      last_seen: Date.now(),
    });

    // Remove from registry
    registry.removeAgent(id);

    // Emit event
    agentEvents.emit('agent:killed', { id });

    console.log(`[AgentManager] Agent ${id} killed successfully`);
  }

  /**
   * Update agent status
   */
  async updateStatus(id: string, status: AgentStatus): Promise<void> {
    const agent = registry.getAgent(id);
    if (!agent) {
      throw new Error(`Agent ${id} not found`);
    }

    const updatedAgent = registry.updateAgent(id, { status });
    if (!updatedAgent) {
      throw new Error(`Failed to update agent ${id}`);
    }

    dbUpdateAgent(id, { status, last_seen: Date.now() });

    agentEvents.emit('agent:updated', { id, changes: { status } });
  }

  /**
   * Send command to agent
   */
  async sendCommand(id: string, command: string): Promise<void> {
    const agent = registry.getAgent(id);
    if (!agent) {
      throw new Error(`Agent ${id} not found`);
    }

    console.log(`[AgentManager] Sending command to agent ${id}: ${command}`);

    await tmux.sendKeys(agent.process.tmuxSession, command);

    // Update lastActivity
    const now = Date.now();
    const updatedAgent = registry.updateAgent(id, {
      metrics: {
        ...agent.metrics,
        lastActivity: now,
      },
    });

    if (updatedAgent) {
      dbUpdateAgent(id, { last_seen: now });
      agentEvents.emit('agent:updated', {
        id,
        changes: { metrics: updatedAgent.metrics },
      });
    }
  }

  /**
   * Update agent activity timestamp and status
   * Called when terminal output is detected
   */
  updateActivity(id: string): void {
    const agent = registry.getAgent(id);
    if (!agent) return;

    const now = Date.now();
    const wasIdle = agent.status === 'idle';

    const updates: Partial<Agent> = {
      metrics: {
        ...agent.metrics,
        lastActivity: now,
      },
    };

    // Change status to working if was idle
    if (wasIdle) {
      updates.status = 'working';
    }

    const updatedAgent = registry.updateAgent(id, updates);

    if (updatedAgent) {
      dbUpdateAgent(id, { last_seen: now, status: updatedAgent.status });

      // Emit update - include status ONLY if it changed (idle → working)
      const changes: { metrics: typeof updatedAgent.metrics; status?: string } = {
        metrics: updatedAgent.metrics
      };
      if (wasIdle) {
        changes.status = updatedAgent.status;
      }
      agentEvents.emit('agent:updated', { id, changes });
    }
  }

  /**
   * Pause all agents by sending Escape to interrupt Claude
   * Skips agents with dead tmux sessions and removes them from registry
   */
  async pauseAll(): Promise<{ paused: number; skipped: number; errors: string[] }> {
    console.log('[AgentManager] Pausing all agents...');

    const agents = registry.getAllAgents();
    const errors: string[] = [];
    let paused = 0;
    let skipped = 0;

    await Promise.allSettled(
      agents.map(async (agent) => {
        try {
          // Check if tmux session exists before sending Escape
          const exists = await sessionExists(agent.process.tmuxSession);
          if (!exists) {
            console.log(`[AgentManager] Skipping dead agent ${agent.id} (session not found)`);
            // Remove dead agent from registry
            registry.removeAgent(agent.id);
            skipped++;
            return;
          }

          await sendEscape(agent.process.tmuxSession);
          paused++;
          console.log(`[AgentManager] Paused agent ${agent.id}`);
        } catch (error) {
          const msg = `Failed to pause ${agent.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(msg);
          console.error(`[AgentManager] ${msg}`);
        }
      })
    );

    console.log(`[AgentManager] Pause complete: ${paused} paused, ${skipped} skipped (dead)`);
    return { paused, skipped, errors };
  }

  /**
   * Periodic health check
   */
  private async runHealthCheck(): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    const agents = registry.getAllAgents();
    const now = Date.now();

    for (const agent of agents) {
      try {
        const health = await checkHealth(agent);
        const uptime = Math.floor((now - agent.createdAt) / 1000);
        const idleTime = (now - agent.metrics.lastActivity) / 1000;

        const updatedMetrics = {
          ...agent.metrics,
          health,
          uptime,
        };

        // Determine status based on activity
        // Working → Idle if no activity for 10 seconds
        let newStatus = agent.status;
        const statusChanged = agent.status === 'working' && idleTime > 10;
        if (statusChanged) {
          newStatus = 'idle';
        }

        const updatedAgent = registry.updateAgent(agent.id, {
          metrics: updatedMetrics,
          status: newStatus,
        });

        if (updatedAgent) {
          // Update in SQLite
          dbUpdateAgent(agent.id, { last_seen: Date.now(), status: newStatus });

          // Emit update event - include status ONLY if it changed
          const changes: { metrics: typeof updatedMetrics; status?: string } = { metrics: updatedMetrics };
          if (statusChanged) {
            changes.status = newStatus;
          }
          agentEvents.emit('agent:updated', {
            id: agent.id,
            changes,
          });
        }
      } catch (error) {
        console.error(`[AgentManager] Health check failed for ${agent.id}:`, error);
        agentEvents.emit('agent:error', {
          id: agent.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Emit health check event
    agentEvents.emit('health:checked', { agents: registry.getAllAgents() });
  }

  /**
   * Wait for tmux session to exit
   */
  private async waitForExit(
    sessionName: string,
    timeout: number
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const exists = await tmux.sessionExists(sessionName);
      if (!exists) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    throw new Error(`Session ${sessionName} did not exit within ${timeout}ms`);
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    console.log('[AgentManager] Shutting down...');
    this.isShuttingDown = true;

    // Stop health check interval
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    // Save all agent states to SQLite
    const agents = registry.getAllAgents();
    console.log(`[AgentManager] Saving ${agents.length} agents to database`);

    for (const agent of agents) {
      try {
        dbUpdateAgent(agent.id, {
          status: agent.status,
          last_seen: Date.now(),
        });
      } catch (error) {
        console.error(`[AgentManager] Failed to save agent ${agent.id}:`, error);
      }
    }

    console.log('[AgentManager] Shutdown complete');
  }

  /**
   * Get agent by ID
   */
  getAgent(id: string): Agent | undefined {
    return registry.getAgent(id);
  }

  /**
   * Get all agents
   */
  getAllAgents(): Agent[] {
    return registry.getAllAgents();
  }
}

// Singleton instance
export const agentManager = new AgentManager();
