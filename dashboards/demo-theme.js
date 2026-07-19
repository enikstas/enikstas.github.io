function initDemoTheme() {
    const htmlElement = document.documentElement;
    const toggle = document.getElementById('demo-theme-toggle');

    const applyTheme = (theme) => {
        if (theme === 'dark') {
            htmlElement.classList.add('dark');
        } else {
            htmlElement.classList.remove('dark');
        }
    };

    const getPreferredTheme = () => {
        const saved = localStorage.getItem('theme');
        if (saved) return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    applyTheme(getPreferredTheme());

    if (toggle) {
        toggle.addEventListener('click', () => {
            const current = htmlElement.classList.contains('dark') ? 'dark' : 'light';
            const next = current === 'light' ? 'dark' : 'light';
            applyTheme(next);
            localStorage.setItem('theme', next);
            window.dispatchEvent(new CustomEvent('demo-theme-changed', { detail: next }));
        });
    }

    return getPreferredTheme();
}

function demoChartColors() {
    const isDark = document.documentElement.classList.contains('dark');
    return {
        accent: isDark ? '#ff7554' : '#ff5f38',
        accentSoft: isDark ? 'rgba(255, 117, 84, 0.15)' : 'rgba(255, 95, 56, 0.12)',
        text: isDark ? '#9ca3af' : '#4b5563',
        grid: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(17, 24, 39, 0.06)',
        success: isDark ? '#34d399' : '#10b981',
        blue: isDark ? '#38bdf8' : '#0284c7',
        purple: isDark ? '#c084fc' : '#7c3aed'
    };
}

function showDemoToast(message) {
    let container = document.getElementById('demo-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'demo-toast-container';
        container.style.position = 'fixed';
        container.style.top = '1.5rem';
        container.style.left = '50%';
        container.style.transform = 'translateX(-50%)';
        container.style.zIndex = '9999';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '0.5rem';
        container.style.width = 'max-content';
        container.style.maxWidth = '90vw';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.style.background = 'var(--bg-tertiary)';
    toast.style.color = 'var(--text-primary)';
    toast.style.border = '1px solid var(--border-color)';
    toast.style.padding = '0.6rem 1.1rem';
    toast.style.borderRadius = '12px';
    toast.style.boxShadow = 'var(--shadow-lg)';
    toast.style.fontFamily = 'var(--font-heading)';
    toast.style.fontWeight = '600';
    toast.style.fontSize = '0.82rem';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => { toast.remove(); }, 250);
    }, 2800);
}
