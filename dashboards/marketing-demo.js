document.addEventListener('DOMContentLoaded', () => {
    initDemoTheme();


    const spendSlider = document.getElementById('spend-slider');
    const splitSlider = document.getElementById('split-slider');
    const lifetimeSlider = document.getElementById('lifetime-slider');

    const REVENUE_PER_CUSTOMER_MONTH = 42;
    const GROSS_MARGIN = 0.62;
    const FB_BASE_CAC = 26;
    const GOOGLE_BASE_CAC = 33;
    const DIMINISHING_FACTOR = 42000;

    let roiChart;

    function customersForChannel(spend, baseCac) {
        if (spend <= 0) return 0;
        const effectiveCac = baseCac * (1 + spend / DIMINISHING_FACTOR);
        return spend / effectiveCac;
    }

    function computeMetrics(spend, splitPct, lifetimeMonths) {
        const spendFb = spend * (splitPct / 100);
        const spendGoogle = spend * (1 - splitPct / 100);
        const customers = customersForChannel(spendFb, FB_BASE_CAC) + customersForChannel(spendGoogle, GOOGLE_BASE_CAC);
        const cac = customers > 0 ? spend / customers : 0;
        const ltv = REVENUE_PER_CUSTOMER_MONTH * lifetimeMonths * GROSS_MARGIN;
        const ratio = cac > 0 ? ltv / cac : 0;
        return { cac, ltv, ratio, customers };
    }

    function updateBanner(ratio) {
        const banner = document.getElementById('result-banner');
        const title = document.getElementById('result-title');
        const sub = document.getElementById('result-sub');
        const iconContainer = banner.querySelector('.banner-icon-container');

        banner.classList.remove('good', 'warn', 'bad');

        const svgs = {
            trendingUp: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 1.5rem; height: 1.5rem;"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`,
            alertTriangle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 1.5rem; height: 1.5rem;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
            trendingDown: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 1.5rem; height: 1.5rem;"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>`
        };

        if (ratio >= 3) {
            banner.classList.add('good');
            title.textContent = 'Healthy ROI';
            sub.textContent = 'LTV comfortably covers acquisition cost.';
            iconContainer.innerHTML = svgs.trendingUp;
        } else if (ratio >= 1.5) {
            banner.classList.add('warn');
            title.textContent = 'Marginal ROI';
            sub.textContent = 'Acquisition cost is eating into long-term margin.';
            iconContainer.innerHTML = svgs.alertTriangle;
        } else {
            banner.classList.add('bad');
            title.textContent = 'Losing Money on Acquisition';
            sub.textContent = 'CAC exceeds the value each customer brings back.';
            iconContainer.innerHTML = svgs.trendingDown;
        }
    }

    function renderChart(currentSpend, splitPct, lifetimeMonths) {
        const colors = demoChartColors();
        const points = [];
        let maxRoi = -Infinity;
        let minRoi = Infinity;
        
        for (let s = 1000; s <= 30000; s += 2000) {
            const m = computeMetrics(s, splitPct, lifetimeMonths);
            const roi = m.cac > 0 ? ((m.ltv - m.cac) / m.cac) * 100 : 0;
            points.push({ spend: s, roi: roi });
            if (roi > maxRoi) maxRoi = roi;
            if (roi < minRoi) minRoi = roi;
        }
        
        if (maxRoi === minRoi) {
            maxRoi += 1;
            minRoi -= 1;
        }
        
        const wrap = document.getElementById('roiChart');
        wrap.innerHTML = '';
        
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 100 40");
        svg.setAttribute("preserveAspectRatio", "none");
        svg.style.width = "100%";
        svg.style.height = "100%";
        svg.style.overflow = "visible";
        
        let pathD = "";
        let areaD = "";
        let currentDot = null;
        
        points.forEach((p, idx) => {
            const x = (idx / (points.length - 1)) * 100;
            const y = 35 - ((p.roi - minRoi) / (maxRoi - minRoi)) * 30;
            
            if (idx === 0) {
                pathD = `M ${x} ${y}`;
                areaD = `M ${x} 40 L ${x} ${y}`;
            } else {
                pathD += ` L ${x} ${y}`;
                areaD += ` L ${x} ${y}`;
            }
            
            if (Math.abs(p.spend - currentSpend) < 1000) {
                currentDot = { x, y, roi: p.roi, spend: p.spend };
            }
        });
        
        areaD += ` L 100 40 Z`;
        
        const areaPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        areaPath.setAttribute("d", areaD);
        areaPath.setAttribute("fill", colors.accentSoft);
        svg.appendChild(areaPath);
        
        const linePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        linePath.setAttribute("d", pathD);
        linePath.setAttribute("fill", "none");
        linePath.setAttribute("stroke", colors.accent);
        linePath.setAttribute("stroke-width", "1.5");
        svg.appendChild(linePath);
        
        wrap.appendChild(svg);
        
        if (currentDot) {
            const dot = document.createElement('div');
            dot.className = 'chart-active-dot';
            dot.style.left = `${currentDot.x}%`;
            dot.style.top = `${(currentDot.y / 40) * 100}%`;
            dot.setAttribute('title', `Spend: $${currentDot.spend.toLocaleString()}, ROI: ${currentDot.roi.toFixed(1)}%`);
            dot.addEventListener('click', () => {
                showDemoToast(`Spend: $${currentDot.spend.toLocaleString()}, ROI: ${currentDot.roi.toFixed(1)}%`);
            });
            wrap.appendChild(dot);
        }
    }

    function render() {
        const spend = Number(spendSlider.value);
        const split = Number(splitSlider.value);
        const lifetime = Number(lifetimeSlider.value);

        document.getElementById('spend-value').textContent = '$' + spend.toLocaleString();
        document.getElementById('split-value').textContent = `${split} / ${100 - split}`;
        document.getElementById('lifetime-value').textContent = lifetime;

        const m = computeMetrics(spend, split, lifetime);
        document.getElementById('stat-cac').textContent = '$' + m.cac.toFixed(2);
        document.getElementById('stat-ltv').textContent = '$' + m.ltv.toFixed(2);
        document.getElementById('stat-ratio').textContent = m.ratio.toFixed(1) + 'x';

        updateBanner(m.ratio);
        renderChart(spend, split, lifetime);
    }

    [spendSlider, splitSlider, lifetimeSlider].forEach(el => el.addEventListener('input', render));
    window.addEventListener('demo-theme-changed', render);
    render();
});
