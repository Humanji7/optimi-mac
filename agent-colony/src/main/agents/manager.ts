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
import * as db from '../db';
import * as registry from './registry';
import { agentEvents } from './events';
import { checkHealth } from './health';
import { Agent, SpawnAgentOptions, AgentStatus } from './types';

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

    // Load agents from SQLite into registry
    const savedAgents = await db.loadAgents();
    console.log(`[AgentManager] Loaded ${savedAgents.length} agents from database`);

    for (const agent of savedAgents) {
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
    await tmux.createSession(sessionName, options.projectPath, command);

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
    await db.saveAgent(agent);

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
    const updatedAgent: Agent = {
      ...agent,
      status: 'idle',
      metrics: {
        ...agent.metrics,
        lastActivity: Date.now(),
      },
    };
    await db.saveAgent(updatedAgent);

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

    await db.saveAgent(updatedAgent);

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
      await db.saveAgent(updatedAgent);
      agentEvents.emit('agent:updated', {
        id,
        changes: { metrics: updatedAgent.metrics },
      });
    }
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

        const updatedMetrics = {
          ...agent.metrics,
          health,
          uptime,
        };

        const updatedAgent = registry.updateAgent(agent.id, {
          metrics: updatedMetrics,
        });

        if (updatedAgent) {
          // Save metrics snapshot to SQLite
          await db.saveAgent(updatedAgent);
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
        await db.saveAgent(agent);
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
