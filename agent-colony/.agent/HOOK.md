# 🎯 Task: Подключить TerminalPanel к tmux session агента

**Status:** ✅ COMPLETED
**Created:** 2026-01-21
**Completed:** 2026-01-21
**Agent:** Claude Sonnet 4.5

---

## 🎬 Context

**Проблема:**
- "Send Command" → отправляет в tmux session с Claude
- TerminalPanel (xterm.js) → создаёт ОТДЕЛЬНЫЙ PTY shell
- Пользователь видит пустой терминал без вывода Claude

**Цель:**
Подключить TerminalPanel к существующему tmux session агента для отображения вывода Claude CLI в реальном времени.

**Подход:** Attach PTY к tmux session через `tmux attach -t <session>`

---

## 🚂 Convoy (Molecules)

### ✅ M0: Analysis (DONE)
- Прочитать текущую реализацию
- Понять архитектуру
- Зафиксировать план

### ✅ M1: PtyManager Extension (DONE)
**Files:** `src/main/terminal/pty-manager.ts`
**Action:**
- Добавить метод `attachToTmux(agentId: string, tmuxSession: string)`
- Spawn PTY с командой `tmux attach -t ${tmuxSession}`
- Сохранить в terminals Map
**Checkpoint:** Метод работает, возвращает PTY instance
**Commit:** 57d452d

### ✅ M2: IPC Handlers Update (DONE)
**Files:** `src/main/terminal/pty-manager.ts`, `src/main/preload.ts`
**Action:**
- Добавить IPC handler `terminal:attach-tmux`
- Обновить preload API если нужно
- Проверить что данные передаются корректно
**Checkpoint:** IPC вызов работает из renderer
**Commit:** c79a1b1

### ✅ M3: TerminalPanel Refactor (DONE)
**Files:** `src/renderer/components/TerminalPanel.tsx`
**Action:**
- Получить tmuxSession из props
- Вызвать attachToTmux вместо spawnPty при наличии tmuxSession
- Обработать case когда tmuxSession не задан (fallback к обычному PTY)
**Checkpoint:** Терминал показывает вывод Claude
**Commit:** b2f3712

### ✅ M4: DetailPanel Integration (DONE)
**Files:** `src/renderer/components/DetailPanel.tsx`
**Action:**
- Передать agent.process.tmuxSession в TerminalPanel
- Опционально убрать "Send Command" форму (теперь ввод через терминал)
**Checkpoint:** Полная интеграция работает
**Commit:** 81ed171

### 🔴 M5: Testing & Cleanup (CURRENT)
**Action:**
- Build проверка ✅ (успешно)
- Обновить HOOK.md
- Final commit
**Checkpoint:** Всё протестировано, закоммичено

---

## 📋 Current Work

**Status:** ALL MOLECULES COMPLETED ✅

---

## 🔗 Dependencies

- Agent spawn должен уже создавать tmux session
- tmuxSession format: `agent-colony-{agentId}`
- Поле хранится в `agent.process.tmuxSession`

---

## 🎓 Lessons

1. **PTY attach pattern**: Использовать `pty.spawn('tmux', ['attach', '-t', sessionName])` для подключения к существующему tmux session
2. **Fallback pattern**: TerminalPanel поддерживает два режима - attach к tmux (для агентов) и обычный shell (для других случаев)
3. **IPC naming**: Использован kebab-case для IPC каналов (`terminal:attach-tmux`), camelCase для API методов (`terminalAttachTmux`)
4. **Type safety**: Обновлен Agent interface в DetailPanel для отражения полной структуры с `process.tmuxSession`

---

## 📦 Handoff Notes

_(если понадобится передача)_
