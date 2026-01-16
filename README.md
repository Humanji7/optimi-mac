<p align="center">
  <h1 align="center">🚀 optimi-mac</h1>
  <p align="center">
    <strong>AI-Native Developer Infrastructure</strong>
  </p>
  <p align="center">
    Toolkit for developers using Claude Code, Cursor, and Codex
  </p>
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-features">Features</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-usage">Usage</a>
</p>

---

## 🎯 What is this?

**optimi-mac** is an open-source toolkit that helps developers manage AI agent infrastructure across multiple projects.

**The Problem:** Claude Code, Cursor, and Codex each need their own config files (`CLAUDE.md`, `.cursorrules`, `AGENTS.md`). Managing these across 10+ projects becomes chaos.

**The Solution:** Single Source of Truth (`.agent/MAIN.md`) + visual dashboard + automation scripts.

---

## ⚡ Quick Start

### StatusLine (shows context usage in Claude Code)

```bash
curl -fsSL https://raw.githubusercontent.com/Humanji7/optimi-mac/main/.agent/scripts/install-statusline.sh | bash
```

### Health Dashboard

```bash
git clone https://github.com/Humanji7/optimi-mac.git
cd optimi-mac
npx -y http-server .agent/dashboard -p 8889 -o
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🏥 **Health Dashboard** | Web UI showing all projects status, active hooks, uncommitted changes |
| 🏗️ **Setup AI** | One-click `.agent/` infrastructure for any project |
| 📊 **StatusLine** | Real-time context usage (%) with color alerts in Claude Code |
| 🌙 **Night Watch** | Automated batch refactoring with dry-run preview |
| 🧠 **Triage** | Generates surgical fix prompts for broken projects |
| 📋 **GUPP** | Anti-crash protocols for reliable AI coding sessions |
| 📝 **Living Memory** | Error Journal for learning from human-agent collaboration failures |

---

## 📦 Installation

### Option 1: Clone (Full Features)

```bash
git clone https://github.com/Humanji7/optimi-mac.git ~/projects/optimi-mac
```

### Option 2: StatusLine Only

```bash
curl -fsSL https://raw.githubusercontent.com/Humanji7/optimi-mac/main/.agent/scripts/install-statusline.sh | bash
```

---

## 🛠 Usage

### Health Dashboard

```bash
# Start dashboard
cd ~/projects/optimi-mac
npx -y http-server .agent/dashboard -p 8889 -o

# Refresh data
bash .agent/scripts/projects-health-check.sh
```

### Setup AI Infrastructure (for a new project)

```bash
bash ~/projects/optimi-mac/.agent/scripts/setup-ai-infrastructure.sh ~/projects/YOUR_PROJECT

# Dry run (preview)
bash ~/projects/optimi-mac/.agent/scripts/setup-ai-infrastructure.sh --dry-run ~/projects/YOUR_PROJECT
```

This creates:
```
your_project/
├── .agent/
│   ├── MAIN.md        # Single Source of Truth
│   └── workflows/
├── CLAUDE.md          # → redirect to .agent/MAIN.md
├── AGENTS.md          # → redirect
└── .cursorrules       # → redirect
```

### Night Watch (Automated Refactoring)

```bash
# Preview what would be refactored
bash .agent/scripts/night-watch.sh --dry-run

# Run on specific projects
bash .agent/scripts/night-watch.sh project1 project2
```

---

## 📁 Project Structure

```
optimi-mac/
├── .agent/
│   ├── dashboard/         # Web UI
│   ├── scripts/           # Automation scripts
│   ├── workflows/         # Claude Code slash commands
│   ├── templates/         # .agent/ scaffolding
│   └── prompts/           # AI prompt templates
└── CLAUDE.md              # GUPP protocol
```

---

## 🔧 Scripts Reference

| Script | Purpose |
|--------|---------|
| `projects-health-check.sh` | Scan ~/projects and generate health report |
| `setup-ai-infrastructure.sh` | Create .agent/ + redirect files |
| `install-statusline.sh` | Install context usage indicator |
| `night-watch.sh` | Batch refactoring automation |
| `generate-triage-prompt.sh` | Create surgical fix prompts |
| `log-error.sh` | Log errors to Living Memory journal |

---

## 🎮 Workflows (Claude Code Slash Commands)

Copy `.agent/workflows/` to your project and use:

| Command | Description |
|---------|-------------|
| `/anti-crash-rules` | GUPP anti-crash protocols |
| `/decompose` | Break task into atomic molecules |
| `/setup-ai-pipeline` | Create .agent/ from scratch |
| `/triage-project` | Auto-fix dashboard issues |

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Made with 🧠 for AI-first developers
</p>
