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
                <td><strong>${project.name}</strong></td>
                <td><span class="badge healthy">✅</span></td>
                <td>${project.hook ? `<span class="badge active">🔴 ACTIVE</span>` : '<span style="color: var(--text-muted)">—</span>'}</td>
                <td><span class="badge healthy">✅ clean</span></td>
            </tr>
        `).join('');
    }

    renderAttentionTable() {
        const tbody = document.querySelector('#attentionTable tbody');
        const emptyState = document.getElementById('attentionEmpty');

        if (!tbody) return;

        if (this.data.attentionProjects.length === 0) {
            emptyState?.classList.add('visible');
            return;
        }

        emptyState?.classList.remove('visible');

        tbody.innerHTML = this.data.attentionProjects.map((project, index) => `
            <tr style="animation: fadeInUp 0.3s ease ${0.05 * index}s forwards; opacity: 0;">
                <td><strong>${project.name}</strong></td>
                <td>
                    ${project.issues.map(issue => {
            const isUrgent = issue.includes('Uncommitted') || issue.includes('No git');
            return `<span class="issue-tag ${isUrgent ? 'urgent' : ''}">${issue}</span>`;
        }).join('')}
                </td>
                <td>
                    ${project.issues.includes('No .agent/')
                ? `<button class="action-btn" onclick="alert('Run /setup-ai-pipeline in ${project.name}')">Setup</button>`
                : ''}
                </td>
            </tr>
        `).join('');
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
    new HealthDashboard();
});
