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
