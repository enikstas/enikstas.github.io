document.addEventListener('DOMContentLoaded', () => {
    initDemoTheme();


    const cashSlider = document.getElementById('cash-slider');
    const revenueSlider = document.getElementById('revenue-slider');
    const expensesSlider = document.getElementById('expenses-slider');
    const delaySlider = document.getElementById('delay-slider');

    const MONTHS_TO_PROJECT = 18;
    let cashChart;

    function simulate(cash, revenue, expenses, delayDays) {
        const delayMonths = delayDays / 30;
        const balances = [cash];
        let runwayMonth = null;

        for (let m = 1; m <= MONTHS_TO_PROJECT; m++) {
            const rampFraction = delayMonths <= 0 ? 1 : Math.min(1, m / (delayMonths + 1));
            const revenueThisMonth = revenue * rampFraction;
            const next = balances[m - 1] + revenueThisMonth - expenses;
            balances.push(next);

            if (runwayMonth === null && next <= 0) {
                const prev = balances[m - 1];
                const frac = prev / (prev - next);
                runwayMonth = (m - 1) + frac;
            }
        }

        return { balances, runwayMonth };
    }

    function updateBanner(runwayMonth, netBurn) {
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

        if (runwayMonth === null) {
            banner.classList.add('good');
            title.textContent = 'Sustainable — 18+ months';
            sub.textContent = 'Revenue covers expenses within the projection window.';
            iconContainer.innerHTML = svgs.trendingUp;
        } else if (runwayMonth >= 8) {
            banner.classList.add('warn');
            title.textContent = `Runway: ${runwayMonth.toFixed(1)} months`;
            sub.textContent = 'Comfortable for now, but the gap is growing.';
            iconContainer.innerHTML = svgs.alertTriangle;
        } else {
            banner.classList.add('bad');
            title.textContent = `Runway: ${runwayMonth.toFixed(1)} months`;
            sub.textContent = 'Cash runs out inside a year at this burn rate.';
            iconContainer.innerHTML = svgs.trendingDown;
        }
    }

    function renderChart(balances) {
        const colors = demoChartColors();
        const wrap = document.getElementById('cashChart');
        wrap.innerHTML = '';
        
        let maxVal = -Infinity;
        let minVal = Infinity;
        balances.forEach(b => {
            if (b > maxVal) maxVal = b;
            if (b < minVal) minVal = b;
        });
        
        if (maxVal === minVal) {
            maxVal += 1000;
            minVal -= 1000;
        }
        
        if (minVal > 0) minVal = 0; 
        
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 100 40");
        svg.setAttribute("preserveAspectRatio", "none");
        svg.style.width = "100%";
        svg.style.height = "100%";
        svg.style.overflow = "visible";
        
        let pathD = "";
        let areaD = "";
        
        balances.forEach((val, idx) => {
            const x = (idx / (balances.length - 1)) * 100;
            const y = 35 - ((val - minVal) / (maxVal - minVal)) * 30;
            
            if (idx === 0) {
                pathD = `M ${x} ${y}`;
                areaD = `M ${x} 35 L ${x} ${y}`;
            } else {
                pathD += ` L ${x} ${y}`;
                areaD += ` L ${x} ${y}`;
            }
        });
        
        const zeroY = 35 - ((0 - minVal) / (maxVal - minVal)) * 30;
        areaD += ` L 100 ${zeroY} L 0 ${zeroY} Z`;
        
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
        
        if (minVal < 0) {
            const zeroLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            zeroLine.setAttribute("x1", "0");
            zeroLine.setAttribute("y1", zeroY);
            zeroLine.setAttribute("x2", "100");
            zeroLine.setAttribute("y2", zeroY);
            zeroLine.setAttribute("stroke", "red");
            zeroLine.setAttribute("stroke-dasharray", "1, 1");
            zeroLine.setAttribute("stroke-width", "0.5");
            svg.appendChild(zeroLine);
        }
        
        wrap.appendChild(svg);
    }

    function render() {
        const cash = Number(cashSlider.value);
        const revenue = Number(revenueSlider.value);
        const expenses = Number(expensesSlider.value);
        const delay = Number(delaySlider.value);

        document.getElementById('cash-value').textContent = '$' + cash.toLocaleString();
        document.getElementById('revenue-value').textContent = '$' + revenue.toLocaleString();
        document.getElementById('expenses-value').textContent = '$' + expenses.toLocaleString();
        document.getElementById('delay-value').textContent = delay;

        const netBurn = expenses - revenue;
        document.getElementById('stat-burn').textContent = (netBurn >= 0 ? '-$' : '+$') + Math.abs(netBurn).toLocaleString();
        document.getElementById('stat-delay-effect').textContent = (delay / 30).toFixed(1) + ' mo';

        const { balances, runwayMonth } = simulate(cash, revenue, expenses, delay);
        document.getElementById('stat-runway').textContent = runwayMonth === null ? '18+ mo' : runwayMonth.toFixed(1) + ' mo';

        const chartElement = document.getElementById('cashChart');
        const runwayText = runwayMonth === null ? '18+ months' : `${runwayMonth.toFixed(1)} months`;
        const endingCash = balances[balances.length - 1];
        chartElement.onclick = () => {
            showDemoToast(`Projected Runway: ${runwayText} | Ending Cash: $${endingCash.toLocaleString()}`);
        };

        updateBanner(runwayMonth, netBurn);
        renderChart(balances);
    }

    [cashSlider, revenueSlider, expensesSlider, delaySlider].forEach(el => el.addEventListener('input', render));
    window.addEventListener('demo-theme-changed', render);
    render();
});
