function refreshIcons() {}

document.addEventListener('DOMContentLoaded', () => {

    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    const applyTheme = (theme) => {
        if (theme === 'dark') {
            htmlElement.classList.add('dark');
        } else {
            htmlElement.classList.remove('dark');
        }
    };

    const getPreferredTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme;
        
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    applyTheme(getPreferredTheme());

    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.classList.contains('dark') ? 'dark' : 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    const mockTabs = document.querySelectorAll('.mock-tab');
    const metricTitle = document.getElementById('metric-title-label');
    const metricValue = document.getElementById('metric-value-display');
    const metricChange = document.getElementById('metric-change-display');
    const barsContainer = document.getElementById('chart-bars-container');

    const metricsData = {
        revenue: {
            title: 'Weekly Revenue',
            value: '$18,450',
            change: '+12.4% vs last week',
            trend: 'up',
            bars: [60, 75, 45, 90, 80, 95, 85]
        },
        channels: {
            title: 'Top Traffic Channel',
            value: 'Google Ads (42%)',
            change: '+3.1% conversion rate',
            trend: 'up',
            bars: [40, 50, 70, 60, 85, 90, 95]
        },
        products: {
            title: 'Active Product Margins',
            value: '68.4% Average',
            change: '+0.8% margin optimization',
            trend: 'up',
            bars: [80, 85, 90, 75, 70, 88, 92]
        }
    };

    let activeTabIndex = 0;
    let autoPlayInterval;

    const switchTab = (index) => {
        const tab = mockTabs[index];
        mockTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const key = tab.getAttribute('data-metric');
        const data = metricsData[key];

        metricTitle.textContent = data.title;
        metricValue.textContent = data.value;
        metricChange.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width: 1rem; height: 1rem; vertical-align: middle; display: inline-block; margin-right: 2px;"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg> ${data.change}`;
        
        const barWrappers = barsContainer.querySelectorAll('.chart-bar-wrapper');
        barWrappers.forEach((wrapper, i) => {
            const bar = wrapper.querySelector('.chart-bar');
            bar.style.height = `${data.bars[i]}%`;
        });
        activeTabIndex = index;
    };

    const startAutoPlay = () => {
        autoPlayInterval = setInterval(() => {
            const nextIndex = (activeTabIndex + 1) % mockTabs.length;
            switchTab(nextIndex);
        }, 4000);
    };

    const stopAutoPlay = () => {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
        }
    };

    mockTabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            stopAutoPlay();
            switchTab(index);
            startAutoPlay();
        });
    });

    startAutoPlay();

    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.dock-item:not(.theme-toggle-btn)');

    const observerOptions = {
        root: null,
        rootMargin: '-30% 0px -60% 0px',
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${id}`) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    let lastScrollY = window.scrollY;
    const dockNav = document.getElementById('dock-nav');

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            dockNav.classList.add('nav-hidden');
        } else {
            dockNav.classList.remove('nav-hidden');
        }
        lastScrollY = currentScrollY;
    });

    const fadeSections = document.querySelectorAll('section, .contrast-card, .value-card, .portfolio-card');
    fadeSections.forEach(el => {
        el.classList.add('fade-in');
    });

    const fadeObserverOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
    };

    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, fadeObserverOptions);

    fadeSections.forEach(el => {
        fadeObserver.observe(el);
    });

    const toastContainer = document.getElementById('toast-container');

    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const iconClass = type === 'success' ? 'success-icon' : 'error-icon';
        const svgMarkup = type === 'success'
            ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width: 1.25rem; height: 1.25rem;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width: 1.25rem; height: 1.25rem;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

        toast.setAttribute('role', 'status');
        toast.innerHTML = `
            <div class="toast-icon ${iconClass}">
                ${svgMarkup}
            </div>
            <div class="toast-message">${message}</div>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px) scale(0.9)';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 5000);
    };

    window.showToast = showToast;
});

function revealCalculatedEmail(buttonElement) {
    const dictionary = "abcdefghijklmnopqrstuvwxyz0123456789.@-_";
    
    const mathEncoded = [13, 31, 21, 25, 41, 43, 5, 41, 79, 17, 29, 5, 21, 27, 77, 9, 33, 29];
    
    let decodedEmail = "";
    
    for (let i = 0; i < mathEncoded.length; i++) {
        const dictionaryIndex = (mathEncoded[i] - 5) / 2;
        decodedEmail += dictionary[dictionaryIndex];
    }
    
    const displayElement = document.getElementById("email-display");
    if (displayElement) {
        displayElement.textContent = decodedEmail;
        displayElement.style.display = "block";
    }
    
    buttonElement.innerHTML = 'Copied to Clipboard! <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width: 1rem; height: 1rem; vertical-align: middle; display: inline-block; margin-left: 5px;"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    buttonElement.style.opacity = "0.7";
    buttonElement.disabled = true;
    
    navigator.clipboard.writeText(decodedEmail).then(() => {
        if (typeof showToast === 'function') {
            showToast("Email address copied to clipboard!");
        }
    }).catch(err => {
        console.error("Could not copy text: ", err);
    });
}
