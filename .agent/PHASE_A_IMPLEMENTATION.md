# Phase A: UX Fixes — Implementation Plan

**Generated:** 2026-01-21
**Status:** Ready for implementation

---

## Порядок реализации (рекомендуемый)

1. **M3** (Resizable sidebar) — простейшая, минимальные изменения
2. **M4** (Hotkeys) — нет внешних зависимостей
3. **M1+M2** (Pan/Zoom) — требует pixi-viewport
4. **M5** (Pause All) — зависит от агентского API

---

## M3: Resizable Sidebar

### Файлы для изменения

| Файл | Строки | Что менять |
|------|--------|------------|
| `agent-colony/package.json` | — | Добавить `react-resizable-panels@^2.1.0` |
| `agent-colony/src/renderer/App.tsx` | 176-214, 258-263 | Обернуть в PanelGroup |
| `agent-colony/src/renderer/components/DetailPanel.tsx` | 214-217 | Убрать fixed width |

### Пошаговый план

```
1. pnpm add react-resizable-panels@^2.1.0

2. App.tsx:
   - Import: { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
   - Обернуть canvas + panel в <PanelGroup direction="horizontal">
   - Canvas → <Panel defaultSize={75} minSize={30}>
   - Panel → <Panel defaultSize={25} minSize={15} maxSize={40}>
   - Добавить <PanelResizeHandle /> между ними

3. DetailPanel.tsx:
   - Удалить width: '280px' (строка 217)
   - Заменить position: fixed → position: relative (строка 214)
   - Добавить height: 100%

4. App.tsx:
   - Удалить marginRight условие в canvasContainerWithPanel (строка 262)
```

---

## M4: Hotkeys 1-9

### Файлы для изменения

| Файл | Строки | Что менять |
|------|--------|------------|
| `agent-colony/src/renderer/App.tsx` | после 174 | Добавить useEffect для keydown |

### Пошаговый план

```typescript
// App.tsx — добавить после строки 174

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Игнорировать если фокус в input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    if (e.key >= '1' && e.key <= '9') {
      const index = parseInt(e.key) - 1;
      const agentList = Array.from(_agents.values());

      if (index < agentList.length) {
        const agent = agentList[index];
        setSelectedAgent(agent);
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [_agents]);
```

---

## M1 + M2: Pan и Zoom

### Файлы для изменения

| Файл | Строки | Что менять |
|------|--------|------------|
| `agent-colony/package.json` | — | Добавить `pixi-viewport@^6.0.0` |
| `agent-colony/src/renderer/components/PixiCanvas.tsx` | 68-148 | Создать viewport, перенести слои |

### Пошаговый план

```
1. pnpm add pixi-viewport@^6.0.0

2. PixiCanvas.tsx (строка ~72, после TilemapLayer):
   - Import: { Viewport } from 'pixi-viewport'
   - Создать ref: viewportRef = useRef<Viewport | null>(null)

3. После создания слоёв (строка ~102):
   const viewport = new Viewport({
     screenWidth: app.screen.width,
     screenHeight: app.screen.height,
     worldWidth: tilemapLayer.getMapSize().width,
     worldHeight: tilemapLayer.getMapSize().height,
     events: app.renderer.events,
   });

   viewport
     .drag({ mouseButtons: 'left' })
     .pinch()
     .wheel({ smooth: 3 });

   app.stage.addChild(viewport);

   // Перенести слои в viewport
   viewport.addChild(tilemapLayer);
   viewport.addChild(buildingsLayer);
   viewport.addChild(agentLayer);

   viewportRef.current = viewport;

4. Cleanup (строка ~148):
   - Добавить viewport.destroy()

5. Resize handler (строка ~335):
   - Добавить viewportRef.current?.resize(newWidth, newHeight)
```

---

## M5: Emergency Pause All

### Файлы для изменения

| Файл | Строки | Что менять |
|------|--------|------------|
| `agent-colony/src/main/agents/manager.ts` | ~270 | Добавить pauseAll() |
| `agent-colony/src/main/index.ts` | ~130 | Добавить IPC handler |
| `agent-colony/src/main/preload.ts` | ~76 | Добавить pauseAll в API |
| `agent-colony/src/renderer/App.tsx` | ~191 | Добавить кнопку |

### Пошаговый план

```
1. manager.ts — добавить метод pauseAll():
   async pauseAll(): Promise<void> {
     const agents = registry.getAllAgents();
     await Promise.allSettled(
       agents.map(agent =>
         tmux.sendKeys(agent.process.tmuxSession, 'Ctrl-Z')
       )
     );
     for (const agent of agents) {
       await this.updateStatus(agent.id, 'paused');
     }
   }

2. main/index.ts — добавить IPC handler:
   ipcMain.handle('agent:pause-all', async () => {
     await agentManager.pauseAll();
   });

3. preload.ts — добавить в electronAPI:
   pauseAll: (): Promise<void> => {
     return ipcRenderer.invoke('agent:pause-all');
   }

4. App.tsx — добавить кнопку в header:
   <button
     onClick={() => window.electronAPI.pauseAll()}
     style={{ backgroundColor: '#ef4444', ... }}
   >
     ⏸ Pause All
   </button>
```

---

## Зависимости

| Молекула | Новые пакеты |
|----------|--------------|
| M3 | `react-resizable-panels@^2.1.0` |
| M1+M2 | `pixi-viewport@^6.0.0` |
| M4, M5 | нет |

---

## Тестирование

| Молекула | Что проверить |
|----------|---------------|
| M3 | Drag resize bar, min/max width, терминал читается |
| M4 | Hotkeys 1-9, игнор в input, несуществующий индекс |
| M1+M2 | Pan drag, wheel zoom, pinch trackpad, границы карты |
| M5 | Pause all, agents status update, кнопка confirm |
