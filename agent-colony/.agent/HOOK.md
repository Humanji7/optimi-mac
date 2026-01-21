# 🎯 Task: Подключить TerminalPanel к tmux session агента

**Status:** 🔴 ACTIVE
**Created:** 2026-01-21
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

### 🔴 M1: PtyManager Extension (CURRENT)
**Files:** `src/main/terminal/pty-manager.ts`
**Action:**
- Добавить метод `attachToTmux(agentId: string, tmuxSession: string)`
- Spawn PTY с командой `tmux attach -t ${tmuxSession}`
- Сохранить в terminals Map
**Checkpoint:** Метод работает, возвращает PTY instance

### ⚪ M2: IPC Handlers Update
**Files:** `src/main/terminal/pty-manager.ts`, `src/main/preload.ts`
**Action:**
- Добавить IPC handler `terminal:attach-tmux`
- Обновить preload API если нужно
- Проверить что данные передаются корректно
**Checkpoint:** IPC вызов работает из renderer

### ⚪ M3: TerminalPanel Refactor
**Files:** `src/renderer/components/TerminalPanel.tsx`
**Action:**
- Получить tmuxSession из props
- Вызвать attachToTmux вместо spawnPty при наличии tmuxSession
- Обработать case когда tmuxSession не задан (fallback к обычному PTY)
**Checkpoint:** Терминал показывает вывод Claude

### ⚪ M4: DetailPanel Integration
**Files:** `src/renderer/components/DetailPanel.tsx`
**Action:**
- Передать agent.process.tmuxSession в TerminalPanel
- Опционально убрать "Send Command" форму (теперь ввод через терминал)
**Checkpoint:** Полная интеграция работает

### ⚪ M5: Testing & Cleanup
**Action:**
- Открыть агента → проверить терминал показывает Claude
- Ввести команду в терминал → проверить работает
- git commit
**Checkpoint:** Всё протестировано, закоммичено

---

## 📋 Current Work

**Molecule:** M1
**Step:** Starting analysis
**Next:** Read pty-manager.ts

---

## 🔗 Dependencies

- Agent spawn должен уже создавать tmux session
- tmuxSession format: `agent-colony-{agentId}`
- Поле хранится в `agent.process.tmuxSession`

---

## 🎓 Lessons

_(будут добавлены по ходу)_

---

## 📦 Handoff Notes

_(если понадобится передача)_
