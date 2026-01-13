/**
 * 🏥 Projects Health Dashboard - App
 * Dynamic data rendering and interactions
 */

// ============================================================================
// ⚙️ Configuration System
// Config loaded from config.json, overrides stored in localStorage
// ============================================================================

let configDefault = null;
let configOverrides = {};

/**
 * Load configuration from config.json and localStorage
 */
async function loadConfig() {
    try {
        // Load default config from file
        const response = await fetch('config.json');
        if (response.ok) {
            configDefault = await response.json();
        }
    } catch (e) {
        console.warn('Could not load config.json, using fallback');
    }

    // Fallback if config.json not found
    if (!configDefault) {
        configDefault = {
            optimiPath: '~/projects/optimi-mac',
            projectsPath: '~/projects',
            githubRepo: 'Humanji7/optimi-mac'
        };
    }

    // Load overrides from localStorage
    try {
        const stored = localStorage.getItem('dashboardConfigOverrides');
        if (stored) {
            configOverrides = JSON.parse(stored);
        }
    } catch (e) {
        console.warn('Could not load config overrides from localStorage');
    }
}

/**
 * Get config value (override takes priority over default)
 */
function getConfig(key) {
    if (key) {
        return configOverrides[key] !== undefined ? configOverrides[key] : configDefault?.[key];
    }
    // Return merged config
    return { ...configDefault, ...configOverrides };
}

/**
 * Set config override (saved to localStorage)
 */
function setConfigOverride(key, value) {
    configOverrides[key] = value;
    localStorage.setItem('dashboardConfigOverrides', JSON.stringify(configOverrides));
}

/**
 * Reset config to defaults (clear localStorage overrides)
 */
function resetConfig() {
    configOverrides = {};
    localStorage.removeItem('dashboardConfigOverrides');
}

/**
 * Check if a path looks valid (basic heuristic)
 */
function isValidPath(path) {
    if (!path || typeof path !== 'string') return false;
    // Basic check: starts with ~/ or / and has reasonable length
    return (path.startsWith('~/') || path.startsWith('/')) && path.length >= 3;
}

// Legacy compatibility: OPTIMI_PATH getter
Object.defineProperty(window, 'OPTIMI_PATH', {
    get: () => getConfig('optimiPath')
});

// ============================================================================
// 🧪 Sandbox Results System
// ============================================================================

/**
 * Get sandbox test results from localStorage
 * @returns {Object} Map of project name to result {status, mode, date}
 */
function getSandboxResults() {
    try {
        return JSON.parse(localStorage.getItem('sandboxResults') || '{}');
    } catch {
        return {};
    }
}

/**
 * Save sandbox test result
 * @param {string} projectName
 * @param {string} status - 'passed' | 'failed'
 * @param {string} mode - 'lint' | 'smoke'
 */
function saveSandboxResult(projectName, status, mode) {
    const results = getSandboxResults();
    results[projectName] = {
        status,
        mode,
        date: new Date().toISOString().split('T')[0]
    };
    localStorage.setItem('sandboxResults', JSON.stringify(results));
}

/**
 * Generate sandbox status badge HTML
 * @param {string} projectName
 * @returns {string} HTML for badge
 */
function getSandboxBadge(projectName) {
    const results = getSandboxResults();
    const result = results[projectName];

    if (!result) {
        return '<span class="badge sandbox-none">—</span>';
    }

    if (result.status === 'passed') {
        const modeLabel = result.mode === 'smoke' ? 'Smoke' : 'Lint';
        return `<span class="badge sandbox-passed" title="${result.date}">✅ ${modeLabel}</span>`;
    }

    return `<span class="badge sandbox-failed" title="${result.date}">❌ Failed</span>`;
}

class HealthDashboard {
    constructor() {
        this.data = null;
        this.init();
    }

    async init() {
        try {
            await loadConfig(); // Load config first
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
                <td>${getSandboxBadge(project.name)}</td>
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
                <td>${getSandboxBadge(project.name)}</td>
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
                <td>${getSandboxBadge(project.name)}</td>
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
        const cmd = `bash ${OPTIMI_PATH}/.agent/scripts/projects-health-check.sh`;
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
        const cmd = `cd ${OPTIMI_PATH} && npx http-server .agent/dashboard -p 8889 -o`;
        navigator.clipboard.writeText(cmd).then(() => {
            alert(`📋 Terminal command copied:\n\n${cmd}`);
        }).catch(() => {
            alert(`Terminal command:\n\n${cmd}`);
        });
        actionsDropdown?.classList.remove('open');
    });

    // 🌙 Night Watch Modal
    const nightWatchModal = document.getElementById('nightWatchModal');
    const projectChecklist = document.getElementById('projectChecklist');
    const selectAllCheckbox = document.getElementById('selectAllProjects');

    // Open Night Watch Modal
    document.getElementById('nightWatchBtn')?.addEventListener('click', () => {
        const workingProjects = dashboard.data?.workingProjects || [];

        if (workingProjects.length === 0) {
            alert('✅ No working projects to refactor.\n\nNight Watch runs on projects with uncommitted changes.');
            return;
        }

        // Populate checkboxes
        projectChecklist.innerHTML = workingProjects.map(project => `
            <label class="project-checkbox">
                <input type="checkbox" name="nightWatchProject" value="${project.name}" checked>
                <span class="project-name">${project.name}</span>
                ${project.hook ? '<span class="badge active">🔴 HOOK</span>' : ''}
            </label>
        `).join('');

        selectAllCheckbox.checked = true;
        nightWatchModal?.classList.add('open');
    });

    // Select All toggle
    selectAllCheckbox?.addEventListener('change', (e) => {
        const checkboxes = projectChecklist.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = e.target.checked);
    });

    // Update Select All when individual checkboxes change
    projectChecklist?.addEventListener('change', () => {
        const checkboxes = projectChecklist.querySelectorAll('input[type="checkbox"]');
        const allChecked = [...checkboxes].every(cb => cb.checked);
        const someChecked = [...checkboxes].some(cb => cb.checked);
        selectAllCheckbox.checked = allChecked;
        selectAllCheckbox.indeterminate = someChecked && !allChecked;
    });

    // Close Night Watch Modal
    const closeNightWatchModal = () => nightWatchModal?.classList.remove('open');
    document.getElementById('closeNightWatchModal')?.addEventListener('click', closeNightWatchModal);
    nightWatchModal?.addEventListener('click', (e) => {
        if (e.target === nightWatchModal) closeNightWatchModal();
    });

    // Get selected projects
    function getSelectedProjects() {
        const checkboxes = projectChecklist.querySelectorAll('input[type="checkbox"]:checked');
        return [...checkboxes].map(cb => cb.value);
    }

    // Night Watch Run Button
    document.getElementById('nightWatchRunBtn')?.addEventListener('click', () => {
        const selected = getSelectedProjects();
        if (selected.length === 0) {
            alert('Please select at least one project.');
            return;
        }

        const projectsArg = selected.join(' ');
        const cmd = `bash ${OPTIMI_PATH}/.agent/scripts/night-watch.sh ${projectsArg}`;

        navigator.clipboard.writeText(cmd).then(() => {
            closeNightWatchModal();
            alert(
                `🌙 Night Watch command copied!\n\n` +
                `Selected: ${selected.length} project(s)\n\n` +
                `Paste in terminal to start:\n${cmd}\n\n` +
                `Review tomorrow:\ngit log refactor/night-watch-$(date +%Y%m%d) --oneline`
            );
        }).catch(() => {
            alert(`Run this command:\n\n${cmd}`);
        });
    });

    // Night Watch Dry Run Button (in modal)
    document.getElementById('nightWatchDryRunBtn')?.addEventListener('click', () => {
        const selected = getSelectedProjects();
        if (selected.length === 0) {
            alert('Please select at least one project.');
            return;
        }

        const projectsArg = selected.join(' ');
        const cmd = `bash ${OPTIMI_PATH}/.agent/scripts/night-watch.sh --dry-run ${projectsArg}`;

        navigator.clipboard.writeText(cmd).then(() => {
            closeNightWatchModal();
            alert(`🔍 Dry Run command copied!\n\n${cmd}\n\nThis shows what would be refactored.`);
        }).catch(() => {
            alert(`Run this command:\n\n${cmd}`);
        });
    });

    // Night Watch Dry Run (from dropdown - all projects)
    document.getElementById('nightWatchDryRun')?.addEventListener('click', () => {
        const cmd = `bash ${OPTIMI_PATH}/.agent/scripts/night-watch.sh --dry-run`;
        navigator.clipboard.writeText(cmd).then(() => {
            alert(`🔍 Dry Run command copied!\n\n${cmd}\n\nThis shows what would be refactored without making changes.`);
        }).catch(() => {
            alert(`Run this command:\n\n${cmd}`);
        });
        actionsDropdown?.classList.remove('open');
    });

    // 📊 StatusLine Modal
    const statusLineModal = document.getElementById('statusLineModal');
    const statusLineBtn = document.getElementById('statusLineBtn');
    const closeStatusLineModal = document.getElementById('closeStatusLineModal');
    const copyStatusLineCmd = document.getElementById('copyStatusLineCmd');
    const installStatusLine = document.getElementById('installStatusLine');
    const statusLineCommand = document.getElementById('statusLineCommand');

    const installCmd = 'curl -fsSL https://raw.githubusercontent.com/Humanji7/optimi-mac/main/.agent/scripts/install-statusline.sh | bash';

    // Open StatusLine Modal
    statusLineBtn?.addEventListener('click', () => {
        statusLineModal?.classList.add('open');
    });

    // Close StatusLine Modal
    closeStatusLineModal?.addEventListener('click', () => {
        statusLineModal?.classList.remove('open');
    });

    statusLineModal?.addEventListener('click', (e) => {
        if (e.target === statusLineModal) {
            statusLineModal.classList.remove('open');
        }
    });

    // Copy command
    copyStatusLineCmd?.addEventListener('click', () => {
        navigator.clipboard.writeText(installCmd).then(() => {
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.textContent = '📋 Install command copied!';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        });
    });

    // Click on command box to copy
    statusLineCommand?.addEventListener('click', () => {
        navigator.clipboard.writeText(installCmd).then(() => {
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.textContent = '📋 Command copied!';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        });
    });

    // Install Now button - copy and show instructions
    installStatusLine?.addEventListener('click', () => {
        navigator.clipboard.writeText(installCmd).then(() => {
            statusLineModal?.classList.remove('open');
            alert(
                '⚡ Install command copied!\n\n' +
                '1. Open Terminal\n' +
                '2. Paste the command (Cmd+V)\n' +
                '3. Press Enter\n' +
                '4. Restart Claude Code\n\n' +
                'StatusLine will show context usage with color alerts!'
            );
        });
    });

    // 🏗️ Setup AI Infrastructure Modal
    const setupAIModal = document.getElementById('setupAIModal');
    const setupAIBtn = document.getElementById('setupAIBtn');
    const closeSetupAIModal = document.getElementById('closeSetupAIModal');
    const setupAIProjectSelect = document.getElementById('setupAIProjectSelect');
    const setupAICommand = document.getElementById('setupAICommand');
    const copySetupAICmd = document.getElementById('copySetupAICmd');
    const setupAIDryRun = document.getElementById('setupAIDryRun');

    // Get projects needing setup (attention projects without .agent/)
    function getProjectsNeedingSetup() {
        const attentionProjects = dashboard.data?.attentionProjects || [];
        return attentionProjects.filter(p =>
            p.issues && p.issues.some(issue => issue.includes('No .agent/'))
        );
    }

    // Update command based on selected project
    function updateSetupAICommand() {
        const selected = setupAIProjectSelect?.value || 'PROJECT';
        const cmd = `bash ${OPTIMI_PATH}/.agent/scripts/setup-ai-infrastructure.sh ~/projects/${selected}`;
        if (setupAICommand) {
            setupAICommand.textContent = cmd;
        }
        return cmd;
    }

    // Open Setup AI Modal
    setupAIBtn?.addEventListener('click', () => {
        const needsSetup = getProjectsNeedingSetup();

        if (needsSetup.length === 0) {
            alert('✅ All projects already have .agent/ infrastructure!\n\nNo setup needed.');
            return;
        }

        // Populate project dropdown
        setupAIProjectSelect.innerHTML = needsSetup.map(p =>
            `<option value="${p.name}">${p.name}</option>`
        ).join('');

        updateSetupAICommand();
        setupAIModal?.classList.add('open');
    });

    // Update command when project selection changes
    setupAIProjectSelect?.addEventListener('change', updateSetupAICommand);

    // Close Setup AI Modal
    closeSetupAIModal?.addEventListener('click', () => {
        setupAIModal?.classList.remove('open');
    });

    setupAIModal?.addEventListener('click', (e) => {
        if (e.target === setupAIModal) {
            setupAIModal.classList.remove('open');
        }
    });

    // Copy Setup AI Command
    copySetupAICmd?.addEventListener('click', () => {
        const cmd = updateSetupAICommand();
        navigator.clipboard.writeText(cmd).then(() => {
            setupAIModal?.classList.remove('open');
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.textContent = '📋 Setup command copied! Paste in terminal.';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        });
    });

    // Click on command box to copy
    setupAICommand?.addEventListener('click', () => {
        const cmd = updateSetupAICommand();
        navigator.clipboard.writeText(cmd).then(() => {
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.textContent = '📋 Command copied!';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        });
    });

    // Dry Run button
    setupAIDryRun?.addEventListener('click', () => {
        const selected = setupAIProjectSelect?.value || 'PROJECT';
        const cmd = `bash ${OPTIMI_PATH}/.agent/scripts/setup-ai-infrastructure.sh ~/projects/${selected} --dry-run`;
        navigator.clipboard.writeText(cmd).then(() => {
            setupAIModal?.classList.remove('open');
            alert(`🔍 Dry Run command copied!\n\n${cmd}\n\nThis shows what would be created without making changes.`);
        });
    });

    // 🧪 Sandbox Test Modal
    const sandboxModal = document.getElementById('sandboxModal');
    const sandboxBtn = document.getElementById('sandboxBtn');
    const closeSandboxModal = document.getElementById('closeSandboxModal');
    const sandboxProjectSelect = document.getElementById('sandboxProjectSelect');
    const sandboxCommand = document.getElementById('sandboxCommand');
    const copySandboxCmd = document.getElementById('copySandboxCmd');
    const runSandboxTest = document.getElementById('runSandboxTest');

    // Get all projects for sandbox testing
    function getAllProjects() {
        const healthy = dashboard.data?.healthyProjects || [];
        const working = dashboard.data?.workingProjects || [];
        const attention = dashboard.data?.attentionProjects || [];
        const allProjects = [
            ...healthy.map(p => p.name),
            ...working.map(p => p.name),
            ...attention.map(p => p.name)
        ];
        // Remove duplicates
        return [...new Set(allProjects)].sort();
    }

    // Get selected sandbox mode
    function getSandboxMode() {
        const modeRadio = document.querySelector('input[name="sandboxMode"]:checked');
        return modeRadio?.value || 'lint';
    }

    // Update sandbox command based on selected project and mode
    function updateSandboxCommand() {
        const selected = sandboxProjectSelect?.value || 'PROJECT';
        const mode = getSandboxMode();
        const smokeFlag = mode === 'smoke' ? ' --smoke' : '';
        const cmd = `bash ${OPTIMI_PATH}/.agent/scripts/sandbox-test.sh ~/projects/${selected}${smokeFlag}`;
        if (sandboxCommand) {
            sandboxCommand.textContent = cmd;
        }
        return cmd;
    }

    // Open Sandbox Modal
    sandboxBtn?.addEventListener('click', () => {
        const projects = getAllProjects();

        if (projects.length === 0) {
            alert('❌ No projects found.\n\nRun health check first.');
            return;
        }

        // Populate project dropdown
        sandboxProjectSelect.innerHTML = projects.map(name =>
            `<option value="${name}">${name}</option>`
        ).join('');

        updateSandboxCommand();
        sandboxModal?.classList.add('open');
    });

    // Update command when project selection or mode changes
    sandboxProjectSelect?.addEventListener('change', updateSandboxCommand);
    document.querySelectorAll('input[name="sandboxMode"]').forEach(radio => {
        radio.addEventListener('change', updateSandboxCommand);
    });

    // Close Sandbox Modal
    closeSandboxModal?.addEventListener('click', () => {
        sandboxModal?.classList.remove('open');
    });

    sandboxModal?.addEventListener('click', (e) => {
        if (e.target === sandboxModal) {
            sandboxModal.classList.remove('open');
        }
    });

    // Copy Sandbox Command
    copySandboxCmd?.addEventListener('click', () => {
        const cmd = updateSandboxCommand();
        navigator.clipboard.writeText(cmd).then(() => {
            sandboxModal?.classList.remove('open');
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.textContent = '📋 Sandbox command copied!';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        });
    });

    // Click on command box to copy
    sandboxCommand?.addEventListener('click', () => {
        const cmd = updateSandboxCommand();
        navigator.clipboard.writeText(cmd).then(() => {
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.textContent = '📋 Command copied!';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        });
    });

    // Run Sandbox Test button
    runSandboxTest?.addEventListener('click', () => {
        const cmd = updateSandboxCommand();
        const mode = getSandboxMode();
        navigator.clipboard.writeText(cmd).then(() => {
            sandboxModal?.classList.remove('open');
            alert(
                `🧪 Sandbox Test command copied!\n\n` +
                `Mode: ${mode === 'smoke' ? 'Lint + Smoke (Claude agent)' : 'Lint only (fast)'}\n\n` +
                `Paste in terminal to run:\n${cmd}`
            );
        });
    });

    // Mark Sandbox Result buttons
    const markSandboxPassed = document.getElementById('markSandboxPassed');
    const markSandboxFailed = document.getElementById('markSandboxFailed');

    markSandboxPassed?.addEventListener('click', () => {
        const selected = sandboxProjectSelect?.value;
        const mode = getSandboxMode();
        if (selected) {
            saveSandboxResult(selected, 'passed', mode);
            sandboxModal?.classList.remove('open');
            dashboard.render(); // Refresh tables to show new status

            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.textContent = `✅ ${selected} marked as passed (${mode})`;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }
    });

    markSandboxFailed?.addEventListener('click', () => {
        const selected = sandboxProjectSelect?.value;
        const mode = getSandboxMode();
        if (selected) {
            saveSandboxResult(selected, 'failed', mode);
            sandboxModal?.classList.remove('open');
            dashboard.render(); // Refresh tables to show new status

            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.textContent = `❌ ${selected} marked as failed`;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }
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
                    💡 Run: <code>cat ${OPTIMI_PATH}/.agent/HOOK.md</code> for full details
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
            const cmd = `bash ${OPTIMI_PATH}/.agent/scripts/generate-triage-prompt.sh ${projectName}`;

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

    // ⚙️ Settings Modal
    const settingsModal = document.getElementById('settingsModal');
    const settingsBtn = document.getElementById('settingsBtn');
    const closeSettingsModal = document.getElementById('closeSettingsModal');
    const resetSettingsBtn = document.getElementById('resetSettingsBtn');

    // Settings inputs
    const settingsOptimiPath = document.getElementById('settingsOptimiPath');
    const settingsProjectsPath = document.getElementById('settingsProjectsPath');
    const settingsGithubRepo = document.getElementById('settingsGithubRepo');

    // Status indicators
    const statusOptimiPath = document.getElementById('statusOptimiPath');
    const statusProjectsPath = document.getElementById('statusProjectsPath');

    /**
     * Update status indicator based on path validity
     */
    function updatePathStatus(input, statusEl) {
        const value = input.value.trim();
        if (!value) {
            statusEl.className = 'status-indicator';
            return;
        }
        if (isValidPath(value)) {
            statusEl.className = 'status-indicator valid';
        } else {
            statusEl.className = 'status-indicator invalid';
        }
    }

    /**
     * Populate settings modal with current config values
     */
    function populateSettings() {
        const config = getConfig();
        settingsOptimiPath.value = config.optimiPath || '';
        settingsProjectsPath.value = config.projectsPath || '';
        settingsGithubRepo.value = config.githubRepo || '';

        // Update status indicators
        updatePathStatus(settingsOptimiPath, statusOptimiPath);
        updatePathStatus(settingsProjectsPath, statusProjectsPath);
    }

    /**
     * Save setting on blur (auto-save)
     */
    function saveSettingOnBlur(input, configKey, statusEl) {
        input.addEventListener('blur', () => {
            const value = input.value.trim();
            const defaultValue = configDefault?.[configKey] || '';

            // If value matches default, remove override
            if (value === defaultValue) {
                delete configOverrides[configKey];
                localStorage.setItem('dashboardConfigOverrides', JSON.stringify(configOverrides));
            } else if (value) {
                setConfigOverride(configKey, value);
            }

            // Update status indicator if applicable
            if (statusEl) {
                updatePathStatus(input, statusEl);
            }
        });

        // Also update status on input
        if (statusEl) {
            input.addEventListener('input', () => {
                updatePathStatus(input, statusEl);
            });
        }
    }

    // Setup auto-save for each field
    saveSettingOnBlur(settingsOptimiPath, 'optimiPath', statusOptimiPath);
    saveSettingOnBlur(settingsProjectsPath, 'projectsPath', statusProjectsPath);
    saveSettingOnBlur(settingsGithubRepo, 'githubRepo', null);

    // Open Settings Modal
    settingsBtn?.addEventListener('click', () => {
        populateSettings();
        settingsModal?.classList.add('open');
    });

    // Close Settings Modal
    closeSettingsModal?.addEventListener('click', () => {
        settingsModal?.classList.remove('open');
    });

    settingsModal?.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.remove('open');
        }
    });

    // Reset to defaults
    resetSettingsBtn?.addEventListener('click', () => {
        resetConfig();
        populateSettings();

        // Show toast
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = '↺ Settings reset to defaults';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    });
});
