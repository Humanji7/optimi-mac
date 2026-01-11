/**
 * 🏥 Projects Health Dashboard - App
 * Dynamic data rendering and interactions
 */

class HealthDashboard {
    constructor() {
        this.data = null;
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.render();
        } catch (error) {
            console.error('Failed to load health data:', error);
            this.showError();
        }
    }

    async loadData() {
        // Try to load JSON data first
        try {
            const response = await fetch('data.json');
            if (response.ok) {
                this.data = await response.json();
                return;
            }
        } catch (e) {
            console.log('No JSON data, using embedded data');
        }

        // Fallback to embedded sample data for demo
        this.data = {
            generated: new Date().toLocaleString('ru-RU'),
            scannedPath: '~/projects',
            summary: {
                total: 11,
                withAgent: 6,
                activeHooks: 1,
                uncommitted: 5,
                noGit: 3
            },
            healthyProjects: [
                { name: 'pointg', agent: true, hook: null, gitStatus: 'clean' },
                { name: 'reels-bot', agent: true, hook: null, gitStatus: 'clean' }
            ],
            attentionProjects: [
                { name: 'Parsertang', issues: ['No .agent/', 'Uncommitted changes'] },
                { name: 'bip-buddy', issues: ['Uncommitted changes'] },
                { name: 'extra-vibe', issues: ['No .agent/', 'No git'] },
                { name: 'optimi-mac', issues: ['No git'] },
                { name: 'personal-site', issues: ['Uncommitted changes'] },
                { name: 'reelstudio', issues: ['No .agent/', 'Uncommitted changes'] },
                { name: 'sphere-777', issues: ['No .agent/'] },
                { name: 'tg-tr-7', issues: ['No git'] },
                { name: 'vob', issues: ['No .agent/', 'Uncommitted changes'] }
            ],
            recommendations: [
                { text: 'Add .agent/ infrastructure to 5 projects', command: '/setup-ai-pipeline' },
                { text: 'Commit or stash changes in 5 projects', command: null },
                { text: '1 active HOOK — continue pending work with GUPP', command: null }
            ]
        };
    }

    render() {
        this.renderLastUpdated();
        this.renderSummaryCards();
        this.renderHealthyTable();
        this.renderWorkingTable();
        this.renderAttentionTable();
        this.renderRecommendations();
    }

    renderLastUpdated() {
        const el = document.getElementById('lastUpdated');
        if (el && this.data.generated) {
            el.innerHTML = `
                <span class="pulse"></span>
                <span>Last scan: ${this.data.generated}</span>
            `;
        }
    }

    renderSummaryCards() {
        const { summary } = this.data;
        const healthyCount = this.data.healthyProjects.length;
        const attentionCount = this.data.attentionProjects.length;

        // Update values with animation
        this.animateValue('totalProjects', summary.total);
        this.animateValue('healthyProjects', healthyCount);
        this.animateValue('withAgent', summary.withAgent);
        this.animateValue('activeHooks', summary.activeHooks);
        this.animateValue('uncommitted', summary.uncommitted);
        this.animateValue('needsAttention', attentionCount);

        // Update progress bars
        setTimeout(() => {
            const healthyPercent = Math.round((healthyCount / summary.total) * 100);
            const agentPercent = Math.round((summary.withAgent / summary.total) * 100);

            const healthyBar = document.getElementById('healthyBar');
            const agentBar = document.getElementById('agentBar');

            if (healthyBar) healthyBar.style.width = `${healthyPercent}%`;
            if (agentBar) agentBar.style.width = `${agentPercent}%`;
        }, 500);
    }

    animateValue(elementId, targetValue) {
        const el = document.getElementById(elementId);
        if (!el) return;

        const duration = 1000;
        const startTime = performance.now();
        const startValue = 0;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease out cubic)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.round(startValue + (targetValue - startValue) * easeOut);

            el.textContent = currentValue;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    renderHealthyTable() {
        const tbody = document.querySelector('#healthyTable tbody');
        const emptyState = document.getElementById('healthyEmpty');

        if (!tbody) return;

        if (this.data.healthyProjects.length === 0) {
            emptyState?.classList.add('visible');
            return;
        }

        emptyState?.classList.remove('visible');

        tbody.innerHTML = this.data.healthyProjects.map((project, index) => `
            <tr style="animation: fadeInUp 0.3s ease ${0.1 * index}s forwards; opacity: 0;">
                <td><strong class="project-link" data-project="${project.name}">${project.name}</strong></td>
                <td><span class="badge healthy">✅</span></td>
                <td>${project.hook ? `<span class="badge active">🔴 ACTIVE</span>` : '<span style="color: var(--text-muted)">—</span>'}</td>
                <td><span class="badge healthy">✅ clean</span></td>
            </tr>
        `).join('');
    }

    renderWorkingTable() {
        const tbody = document.querySelector('#workingTable tbody');
        const emptyState = document.getElementById('workingEmpty');
        const workingProjects = this.data.workingProjects || [];

        if (!tbody) return;

        if (workingProjects.length === 0) {
            emptyState?.classList.add('visible');
            tbody.innerHTML = '';
            return;
        }

        emptyState?.classList.remove('visible');

        tbody.innerHTML = workingProjects.map((project, index) => `
            <tr style="animation: fadeInUp 0.3s ease ${0.05 * index}s forwards; opacity: 0;">
                <td><strong class="project-link" data-project="${project.name}">${project.name}</strong></td>
                <td>${project.hook ? `<span class="badge active">🔴 ACTIVE</span>` : '<span style="color: var(--text-muted)">—</span>'}</td>
                <td><span class="badge working">⚠️ uncommitted</span></td>
                <td class="actions-cell">
                    <button class="action-btn triage-btn" data-project="${project.name}" title="Generate surgical prompt">🧠 Triage</button>
                </td>
            </tr>
        `).join('');
    }

    renderAttentionTable() {
        const tbody = document.querySelector('#attentionTable tbody');
        const emptyState = document.getElementById('attentionEmpty');

        if (!tbody) return;

        // Filter out archived projects
        const archivedProjects = this.getArchivedProjects();
        const visibleProjects = this.data.attentionProjects.filter(
            p => !archivedProjects.includes(p.name)
        );

        if (visibleProjects.length === 0) {
            emptyState?.classList.add('visible');
            tbody.innerHTML = '';
            return;
        }

        emptyState?.classList.remove('visible');

        tbody.innerHTML = visibleProjects.map((project, index) => `
            <tr style="animation: fadeInUp 0.3s ease ${0.05 * index}s forwards; opacity: 0;">
                <td><strong class="project-link" data-project="${project.name}">${project.name}</strong></td>
                <td>
                    ${project.issues.map(issue => {
            const isUrgent = issue.includes('Uncommitted') || issue.includes('No git');
            return `<span class="issue-tag ${isUrgent ? 'urgent' : ''}">${issue}</span>`;
        }).join('')}
                </td>
                <td class="actions-cell">
                    <button class="action-btn triage-btn" data-project="${project.name}" title="Generate surgical prompt">🧠 Triage</button>
                    <button class="action-btn archive-btn" data-project="${project.name}" title="Hide from list">📦</button>
                </td>
            </tr>
        `).join('');

        // Render archived section if any
        this.renderArchivedSection();
    }

    getArchivedProjects() {
        try {
            return JSON.parse(localStorage.getItem('archivedProjects') || '[]');
        } catch {
            return [];
        }
    }

    archiveProject(name) {
        const archived = this.getArchivedProjects();
        if (!archived.includes(name)) {
            archived.push(name);
            localStorage.setItem('archivedProjects', JSON.stringify(archived));
        }
        this.renderAttentionTable();
    }

    restoreProject(name) {
        const archived = this.getArchivedProjects().filter(p => p !== name);
        localStorage.setItem('archivedProjects', JSON.stringify(archived));
        this.renderAttentionTable();
    }

    renderArchivedSection() {
        const archived = this.getArchivedProjects();
        let section = document.getElementById('archivedSection');

        if (archived.length === 0) {
            section?.remove();
            return;
        }

        if (!section) {
            section = document.createElement('div');
            section.id = 'archivedSection';
            section.className = 'archived-section';
            document.querySelector('.attention-table')?.appendChild(section);
        }

        section.innerHTML = `
            <details>
                <summary>📦 Archived (${archived.length})</summary>
                <div class="archived-list">
                    ${archived.map(name => `
                        <div class="archived-item">
                            <span>${name}</span>
                            <button class="restore-btn" data-project="${name}">Restore</button>
                        </div>
                    `).join('')}
                </div>
            </details>
        `;
    }

    renderRecommendations() {
        const list = document.getElementById('recommendationsList');
        if (!list) return;

        list.innerHTML = this.data.recommendations.map(rec => `
            <li>
                <span>${rec.text}</span>
                ${rec.command ? `<code>${rec.command}</code>` : ''}
            </li>
        `).join('');
    }

    showError() {
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; gap: 1rem;">
                <h1 style="font-size: 2rem;">⚠️ Failed to load health data</h1>
                <p style="color: var(--text-secondary);">Run <code>projects-health-check.sh</code> to generate data</p>
                <button onclick="location.reload()" style="padding: 0.5rem 1rem; background: var(--accent-purple); border: none; border-radius: 8px; color: white; cursor: pointer;">
                    Retry
                </button>
            </div>
        `;
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new HealthDashboard();

    // Quick Actions Dropdown
    const actionsToggle = document.getElementById('actionsToggle');
    const actionsDropdown = document.getElementById('actionsDropdown');
    const refreshBtn = document.getElementById('refreshBtn');

    // Toggle dropdown
    actionsToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        actionsDropdown.classList.toggle('open');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        actionsDropdown?.classList.remove('open');
    });

    // Refresh button
    refreshBtn?.addEventListener('click', () => {
        location.reload();
    });

    // Action: Run Health Check
    document.getElementById('runHealthCheck')?.addEventListener('click', () => {
        const cmd = 'bash ~/projects/optimi-mac/.agent/scripts/projects-health-check.sh';
        navigator.clipboard.writeText(cmd).then(() => {
            alert(`📋 Copied to clipboard:\n\n${cmd}\n\nPaste in terminal and run, then refresh this page.`);
        }).catch(() => {
            alert(`Run this command:\n\n${cmd}`);
        });
        actionsDropdown?.classList.remove('open');
    });

    // Action: Copy Report Path
    document.getElementById('copyReport')?.addEventListener('click', () => {
        const path = '~/.agent/health-report.md';
        navigator.clipboard.writeText(path).then(() => {
            alert(`📋 Report path copied:\n\n${path}`);
        }).catch(() => {
            alert(`Report path:\n\n${path}`);
        });
        actionsDropdown?.classList.remove('open');
    });

    // Action: Open Terminal Command
    document.getElementById('openTerminal')?.addEventListener('click', () => {
        const cmd = 'cd ~/projects/optimi-mac && npx http-server .agent/dashboard -p 8889 -o';
        navigator.clipboard.writeText(cmd).then(() => {
            alert(`📋 Terminal command copied:\n\n${cmd}`);
        }).catch(() => {
            alert(`Terminal command:\n\n${cmd}`);
        });
        actionsDropdown?.classList.remove('open');
    });

    // 🌙 Night Watch Button
    document.getElementById('nightWatchBtn')?.addEventListener('click', () => {
        const workingCount = dashboard.data?.workingProjects?.length || 0;

        if (workingCount === 0) {
            alert('✅ No working projects to refactor.\n\nNight Watch runs on projects with uncommitted changes.');
            return;
        }

        const confirm = window.confirm(
            `🌙 Night Watch\n\n` +
            `This will run code-simplifier on ${workingCount} working project(s):\n` +
            `${(dashboard.data?.workingProjects || []).map(p => `  • ${p.name}`).join('\n')}\n\n` +
            `⚠️ All changes go to separate branches (safe)\n\n` +
            `Continue?`
        );

        if (confirm) {
            const cmd = 'bash ~/projects/optimi-mac/.agent/scripts/night-watch.sh';
            navigator.clipboard.writeText(cmd).then(() => {
                alert(
                    `🌙 Night Watch command copied!\n\n` +
                    `Paste in terminal to start:\n${cmd}\n\n` +
                    `Tomorrow morning, review with:\n` +
                    `git log refactor/night-watch-$(date +%Y%m%d) --oneline`
                );
            }).catch(() => {
                alert(`Run this command:\n\n${cmd}`);
            });
        }
    });

    // Night Watch Dry Run
    document.getElementById('nightWatchDryRun')?.addEventListener('click', () => {
        const cmd = 'bash ~/projects/optimi-mac/.agent/scripts/night-watch.sh --dry-run';
        navigator.clipboard.writeText(cmd).then(() => {
            alert(`🔍 Dry Run command copied!\n\n${cmd}\n\nThis shows what would be refactored without making changes.`);
        }).catch(() => {
            alert(`Run this command:\n\n${cmd}`);
        });
        actionsDropdown?.classList.remove('open');
    });

    // HOOK Details Modal
    const hookModal = document.getElementById('hookModal');
    const hookModalBody = document.getElementById('hookModalBody');
    const hooksCard = document.querySelector('.summary-card.hooks');

    // Open modal when clicking on Active HOOKs card
    hooksCard?.addEventListener('click', () => {
        const activeHooks = dashboard.data?.summary?.activeHooks || 0;

        if (activeHooks === 0) {
            hookModalBody.innerHTML = `
                <div class="no-hooks">
                    <p>✅ No active HOOKs</p>
                    <p style="font-size: 0.875rem; margin-top: 0.5rem;">All pending work completed!</p>
                </div>
            `;
        } else {
            // For demo, show info about existing hooks
            hookModalBody.innerHTML = `
                <div class="hook-item">
                    <div class="hook-project">📁 optimi-mac</div>
                    <div class="hook-molecule">🔴 CURRENT: M2 - HOOK Details Modal</div>
                    <div class="hook-molecule" style="margin-top: 0.5rem; color: var(--text-muted);">
                        Convoy: M1 ✅ → M2 🔴 → M3 ⚪ → M4 ⚪
                    </div>
                </div>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 1rem;">
                    💡 Run: <code>cat ~/projects/optimi-mac/.agent/HOOK.md</code> for full details
                </p>
            `;
        }

        hookModal?.classList.add('open');
    });

    // Close modal handlers
    const closeModal = () => hookModal?.classList.remove('open');

    document.getElementById('closeHookModal')?.addEventListener('click', closeModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);

    hookModal?.addEventListener('click', (e) => {
        if (e.target === hookModal) closeModal();
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // Auto-Refresh Toggle
    const autoRefreshToggle = document.getElementById('autoRefreshToggle');
    const countdownEl = document.getElementById('countdown');
    let refreshInterval = null;
    let countdownInterval = null;
    let secondsLeft = 30;
    const REFRESH_INTERVAL = 30; // seconds

    autoRefreshToggle?.addEventListener('change', (e) => {
        if (e.target.checked) {
            // Start auto-refresh
            secondsLeft = REFRESH_INTERVAL;
            updateCountdown();

            countdownInterval = setInterval(() => {
                secondsLeft--;
                updateCountdown();

                if (secondsLeft <= 0) {
                    secondsLeft = REFRESH_INTERVAL;
                    dashboard.loadData().then(() => dashboard.render());
                }
            }, 1000);
        } else {
            // Stop auto-refresh
            clearInterval(countdownInterval);
            countdownInterval = null;
            countdownEl.textContent = '';
        }
    });

    function updateCountdown() {
        if (countdownEl) {
            countdownEl.textContent = `${secondsLeft}s`;
        }
    }

    // M4: Click-to-Open Project
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('project-link')) {
            const projectName = e.target.dataset.project;
            const cmd = `cd ~/projects/${projectName}`;

            navigator.clipboard.writeText(cmd).then(() => {
                alert(`📋 Copied to clipboard:\n\n${cmd}\n\nPaste in terminal to open project.`);
            }).catch(() => {
                alert(`Open project:\n\n${cmd}`);
            });
        }

        // Triage button - copy bash script command
        if (e.target.classList.contains('triage-btn')) {
            const projectName = e.target.dataset.project;
            const cmd = `bash ~/projects/optimi-mac/.agent/scripts/generate-triage-prompt.sh ${projectName}`;

            navigator.clipboard.writeText(cmd).then(() => {
                // Show brief toast instead of alert
                const toast = document.createElement('div');
                toast.className = 'toast';
                toast.textContent = '🧠 Triage command copied! Paste in terminal.';
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 3000);
            }).catch(() => {
                alert(`Run in terminal:\n\n${cmd}`);
            });
        }

        // Archive button
        if (e.target.classList.contains('archive-btn')) {
            const projectName = e.target.dataset.project;
            dashboard.archiveProject(projectName);

            // Brief toast
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.textContent = `📦 ${projectName} archived`;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2000);
        }

        // Restore button
        if (e.target.classList.contains('restore-btn')) {
            const projectName = e.target.dataset.project;
            dashboard.restoreProject(projectName);
        }
    });
});
