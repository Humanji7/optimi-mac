# Agent Colony V3 — Implementation Plan

**Status:** APPROVED
**Created:** 2026-01-21
**Source:** UX/UI Deep Interview + Multi-perspective Review

---

## Vision Summary

> "Полная геймификация MMORPG + терминалы без компромиссов"
> "Детская непосредственная радость — как малыш с конструктором"
> "Экосистема вовлекает тебя как мэра, генерала"

**Target Audience:** Non-tech founders, vibe coders, developers с agentic AI mindset
**Hook:** Ностальгия по стратегиям (Heroes, Dune, Dota)

---

## Phase A: UX Fixes (Must Have)

| # | Molecule | Description | Status |
|---|----------|-------------|--------|
| M1 | Pan карты | Два пальца трекпад | ⚪ |
| M2 | Zoom | Pinch gesture | ⚪ |
| M3 | Resizable sidebar | Drag для изменения ширины | ⚪ |
| M4 | Hotkeys 1-9 | Быстрый доступ к агентам | ⚪ |
| M5 | Emergency Pause All | Space bar = pause all agents | ⚪ |

## Phase B: Information Layer (Must Have)

| # | Molecule | Description | Status |
|---|----------|-------------|--------|
| M6 | Agent status badge | Статус над спрайтом (idle/working/error/waiting/done) | ⚪ |
| M7 | Terminal preview on hover | Последние N строк при наведении | ⚪ |
| M8 | HUD + resource meter | Общая статистика + tokens/rate limits | ⚪ |
| M9 | Minimap | Кликабельный, агенты как цветные точки | ⚪ |
| M10 | Activity timeline | Лента событий за последние 15 минут | ⚪ |
| M11 | Error severity levels | blocker/warning/info classification | ⚪ |

## Phase C: Multi-Agent Control (Must Have)

| # | Molecule | Description | Status |
|---|----------|-------------|--------|
| M12 | Agent filtering UI | По статусу, проекту, типу задачи | ⚪ |
| M13 | Batch controls | Pause all, resume selected, kill idle | ⚪ |
| M14 | Dependency graph | Визуализация: кто кого блокирует | ⚪ |
| M15 | macOS notifications | Critical events в notification center | ⚪ |

## Phase D: Visual & Audio (Should Have)

| # | Molecule | Description | Status |
|---|----------|-------------|--------|
| M16 | Click-to-move | RTS-style: клик на карту → агент идёт | ⚪ |
| M17 | State animations | Ошибка, вопрос, успех для каждого типа | ⚪ |
| M18 | Event sounds | С настройками severity filtering | ⚪ |
| M19 | Enhanced buildings | Prompt book → генерация → интеграция | ⚪ |

## Phase E: Engagement (Should Have)

| # | Molecule | Description | Status |
|---|----------|-------------|--------|
| M20 | Agent XP/Levels | Базовая прогрессия | ⚪ |
| M21 | Achievements | Milestone rewards | ⚪ |
| M22 | Sidebar tabs | Быстрое переключение между терминалами | ⚪ |

---

## Backlog (V4+)

- Multi-terminal split-screen (vertical split / popup windows / grid mode)
- Разнообразие карты (больше тайлов)
- Skill trees / ветки прокачки
- Передача задач между агентами (MCP integration)
- Вход внутрь зданий → file tree / репозиторий
- 3D версия

---

## Agent Animations Reference

| Agent | Idle | Error | Question | Success |
|-------|------|-------|----------|---------|
| **Architect** (тарелка) | Летает, смотрит в трубу | Чинит тарелку отвёрткой | Крутит трубу, поднимает руки | TBD |
| **Coder** (осьминог) | Печатает щупальцами | Запутался в клавиатуре | Чешет голову щупальцем | TBD |
| **Tester** (мышь) | Нюхает, исследует | Паникует, бегает кругами | Принюхивается | TBD |
| **Reviewer** (ворона) | Читает книжку | Листает бешено, перья летят | Наклоняет голову | TBD |

---

## Success Criteria

1. Можно работать с агентами **не менее удобно**, чем с обычными терминалами
2. Видно **что происходит** у всех агентов с одного взгляда
3. Есть **ощущение живости** — агенты двигаются, реагируют, издают звуки
4. **Визуально приятно** — не "прикольно", а "хочу пользоваться каждый день"

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Over-gamification | Gamification = opt-in в настройках |
| Performance degradation | Load test с 20 агентами на каждом этапе |
| Cognitive overload | Progressive disclosure, customizable HUD |
| Unclear value vs tmux | Onboarding tutorial, focus на multi-agent scenarios |
