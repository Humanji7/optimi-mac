/**
 * Session Recovery System для Agent Colony
 *
 * Сохраняет состояние агентских сессий в JSON и восстанавливает их после перезапуска.
 * Проверяет живые tmux сессии и переподключается к ним или перезапускает мёртвые.
 *
 * @module recover-sessions
 * @dependencies fs, child_process
 *
 * @example
 * const { SessionRecovery } = require('./recover-sessions');
 * const spawner = new AgentSpawner();
 * const recovery = new SessionRecovery(spawner);
 *
 * recovery.setupShutdownHandler();
 * await recovery.recover();
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const STATE_FILE = path.join(process.env.HOME, '.agent-colony', 'sessions.json');

/**
 * SessionRecovery - управление сохранением и восстановлением агентских сессий
 */
class SessionRecovery {
  /**
   * @param {Object} spawner - AgentSpawner instance для перезапуска мёртвых сессий
   */
  constructor(spawner) {
    if (!spawner) {
      throw new Error('SessionRecovery requires AgentSpawner instance');
    }
    this.spawner = spawner;
    this.sessions = new Map(); // id -> session metadata
    this.ensureStateDirectory();
  }

  /**
   * Создать ~/.agent-colony/ если не существует
   */
  ensureStateDirectory() {
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`[Recovery] Created state directory: ${dir}`);
    }
  }

  /**
   * Сохранить текущее состояние сессий в JSON файл
   */
  saveState() {
    try {
      const state = {
        timestamp: new Date().toISOString(),
        sessions: Array.from(this.sessions.entries()).map(([id, session]) => ({
          id,
          tmuxName: session.tmuxName,
          agentType: session.agentType,
          task: session.task,
          createdAt: session.createdAt,
          metadata: session.metadata || {}
        }))
      };

      fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
      console.log(`[Recovery] State saved: ${this.sessions.size} sessions → ${STATE_FILE}`);
    } catch (error) {
      console.error('[Recovery] Failed to save state:', error.message);
      // Не бросаем ошибку - не критично для работы системы
    }
  }

  /**
   * Загрузить сохранённое состояние из JSON файла
   * @returns {Array} Массив сессий из предыдущего запуска
   */
  loadState() {
    try {
      if (!fs.existsSync(STATE_FILE)) {
        console.log('[Recovery] No saved state found');
        return [];
      }

      const data = fs.readFileSync(STATE_FILE, 'utf8');
      const state = JSON.parse(data);

      console.log(`[Recovery] Loaded state from ${state.timestamp}`);
      console.log(`[Recovery] Found ${state.sessions.length} saved sessions`);

      return state.sessions;
    } catch (error) {
      console.error('[Recovery] Failed to load state:', error.message);
      return [];
    }
  }

  /**
   * Получить список живых tmux сессий
   * @returns {Array<string>} Массив имён активных tmux сессий
   */
  getLiveTmuxSessions() {
    try {
      const output = execSync('tmux list-sessions -F "#{session_name}"', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });

      const sessions = output
        .trim()
        .split('\n')
        .filter(line => line.length > 0);

      return sessions;
    } catch (error) {
      // tmux list-sessions returns exit code 1 if no sessions exist
      if (error.message.includes('no server running')) {
        console.log('[Recovery] No tmux server running');
        return [];
      }
      console.error('[Recovery] Failed to list tmux sessions:', error.message);
      return [];
    }
  }

  /**
   * Восстановить сессии после перезапуска приложения
   * @returns {Object} Отчёт о восстановлении
   */
  async recover() {
    const savedSessions = this.loadState();
    const liveTmux = new Set(this.getLiveTmuxSessions());

    const report = {
      total: savedSessions.length,
      reconnected: 0,
      respawned: 0,
      failed: 0,
      details: []
    };

    console.log(`[Recovery] Starting recovery: ${savedSessions.length} sessions to process`);
    console.log(`[Recovery] Live tmux sessions: ${liveTmux.size}`);

    for (const session of savedSessions) {
      const { id, tmuxName, agentType, task, metadata } = session;

      if (liveTmux.has(tmuxName)) {
        // Tmux сессия жива - переподключаемся
        try {
          this.registerSession({
            id,
            tmuxName,
            agentType,
            task,
            metadata,
            recovered: true
          });

          report.reconnected++;
          report.details.push({
            id,
            status: 'reconnected',
            tmuxName
          });

          console.log(`[Recovery] ✅ Reconnected to: ${tmuxName} (${agentType})`);
        } catch (error) {
          report.failed++;
          report.details.push({
            id,
            status: 'failed',
            tmuxName,
            error: error.message
          });

          console.error(`[Recovery] ❌ Failed to reconnect: ${tmuxName}`, error.message);
        }
      } else {
        // Tmux сессия мёртва - перезапускаем через spawner
        try {
          console.log(`[Recovery] 🔄 Respawning dead session: ${tmuxName} (${agentType})`);

          const newSession = await this.spawner.spawn({
            agentType,
            task,
            metadata: { ...metadata, respawned: true, originalId: id }
          });

          report.respawned++;
          report.details.push({
            id,
            status: 'respawned',
            tmuxName,
            newTmuxName: newSession.tmuxName
          });

          console.log(`[Recovery] ✅ Respawned: ${tmuxName} → ${newSession.tmuxName}`);
        } catch (error) {
          report.failed++;
          report.details.push({
            id,
            status: 'failed',
            tmuxName,
            error: error.message
          });

          console.error(`[Recovery] ❌ Failed to respawn: ${tmuxName}`, error.message);
        }
      }
    }

    console.log('[Recovery] Recovery complete:', report);
    return report;
  }

  /**
   * Зарегистрировать сессию для отслеживания
   * @param {Object} session - Метаданные сессии
   */
  registerSession(session) {
    if (!session.id || !session.tmuxName) {
      throw new Error('Session must have id and tmuxName');
    }

    this.sessions.set(session.id, {
      ...session,
      createdAt: session.createdAt || new Date().toISOString()
    });

    console.log(`[Recovery] Registered session: ${session.id} (${session.tmuxName})`);
  }

  /**
   * Удалить сессию из отслеживания
   * @param {string} id - ID сессии
   */
  unregisterSession(id) {
    const removed = this.sessions.delete(id);
    if (removed) {
      console.log(`[Recovery] Unregistered session: ${id}`);
    }
  }

  /**
   * Настроить graceful shutdown handlers
   * Сохраняет состояние при SIGINT/SIGTERM, но НЕ убивает tmux сессии
   */
  setupShutdownHandler() {
    const shutdown = (signal) => {
      console.log(`\n[Recovery] Received ${signal}, saving state...`);
      this.saveState();
      console.log('[Recovery] State saved. Tmux sessions will persist.');
      console.log('[Recovery] Run recovery.recover() on next startup to reconnect.');
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    console.log('[Recovery] Shutdown handlers registered (SIGINT, SIGTERM)');
  }
}

module.exports = { SessionRecovery, STATE_FILE };
