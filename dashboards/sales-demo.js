document.addEventListener('DOMContentLoaded', () => {
    initDemoTheme();


    const channelMeta = {
        shopify: { label: 'Shopify', color: '#0284c7' },
        pos: { label: 'In-store POS', color: '#0d9488' },
        amazon: { label: 'Amazon', color: '#7c3aed' }
    };

    const periodConfig = {
        day: { labels: ['8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm'] },
        week: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
        month: { labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'] }
    };

    const productsByPeriod = {
        day: [
            { name: 'Wireless Earbuds Pro', units: 42, margin: '38%' },
            { name: 'Insulated Steel Bottle', units: 37, margin: '52%' },
            { name: 'Canvas Tote Bag', units: 29, margin: '61%' },
            { name: 'Desk Plant Kit', units: 18, margin: '44%' }
        ],
        week: [
            { name: 'Wireless Earbuds Pro', units: 268, margin: '38%' },
            { name: 'Canvas Tote Bag', units: 211, margin: '61%' },
            { name: 'Insulated Steel Bottle', units: 190, margin: '52%' },
            { name: 'Ceramic Mug Set', units: 143, margin: '47%' }
        ],
        month: [
            { name: 'Wireless Earbuds Pro', units: 1120, margin: '38%' },
            { name: 'Insulated Steel Bottle', units: 902, margin: '52%' },
            { name: 'Canvas Tote Bag', units: 845, margin: '61%' },
            { name: 'Desk Plant Kit', units: 601, margin: '44%' }
        ]
    };

    function seededSeries(len, base, spread, seed) {
        const out = [];
        let s = seed;
        for (let i = 0; i < len; i++) {
            s = (s * 9301 + 49297) % 233280;
            const rnd = s / 233280;
            out.push(Math.round(base + rnd * spread + Math.sin(i * 1.3 + seed) * (spread * 0.3)));
        }
        return out;
    }

    function buildDatasets(period) {
        const len = periodConfig[period].labels.length;
        const scale = period === 'day' ? 1 : period === 'week' ? 6 : 26;
        return {
            shopify: seededSeries(len, 40 * scale, 20 * scale, 11),
            pos: seededSeries(len, 25 * scale, 14 * scale, 47),
            amazon: seededSeries(len, 30 * scale, 18 * scale, 91)
        };
    }

    let activePeriod = 'day';
    let activeChannels = new Set(['shopify', 'pos', 'amazon']);
    let chart;

    function computeStats(datasets) {
        let total = 0, orders = 0;
        activeChannels.forEach(ch => {
            const arr = datasets[ch] || [];
            total += arr.reduce((a, b) => a + b, 0);
            orders += arr.length * (ch === 'pos' ? 3 : 5);
        });
        return { total, orders, aov: orders ? total / orders : 0 };
    }

    function render() {
        const labels = periodConfig[activePeriod].labels;
        const datasets = buildDatasets(activePeriod);

        const chartDatasets = Object.keys(channelMeta)
            .filter(ch => activeChannels.has(ch))
            .map(ch => ({
                label: channelMeta[ch].label,
                data: datasets[ch],
                backgroundColor: channelMeta[ch].color,
                borderRadius: 6,
                stack: 'revenue'
            }));

        const wrap = document.getElementById('salesChart');
        wrap.innerHTML = '';
        wrap.className = 'custom-bar-chart';
        
        let maxTotal = 0;
        const colCount = labels.length;
        const totals = [];
        
        for (let i = 0; i < colCount; i++) {
            let colTotal = 0;
            chartDatasets.forEach(ds => {
                colTotal += ds.data[i] || 0;
            });
            totals.push(colTotal);
            if (colTotal > maxTotal) maxTotal = colTotal;
        }
        
        labels.forEach((label, i) => {
            const col = document.createElement('div');
            col.className = 'custom-chart-col';
            
            chartDatasets.forEach(ds => {
                const val = ds.data[i] || 0;
                const pct = maxTotal > 0 ? (val / maxTotal) * 100 : 0;
                
                if (pct > 0) {
                    const seg = document.createElement('div');
                    seg.className = 'custom-chart-seg';
                    seg.style.height = `${pct}%`;
                    seg.style.backgroundColor = ds.backgroundColor;
                    seg.setAttribute('title', `${ds.label}: $${val.toLocaleString()}`);
                    col.appendChild(seg);
                }
            });
            
            const labelEl = document.createElement('span');
            labelEl.className = 'custom-chart-label';
            labelEl.textContent = label;
            col.appendChild(labelEl);
            
            wrap.appendChild(col);
        });

        const stats = computeStats(datasets);
        document.getElementById('stat-revenue').textContent = '$' + stats.total.toLocaleString();
        document.getElementById('stat-orders').textContent = stats.orders.toLocaleString();
        document.getElementById('stat-aov').textContent = '$' + stats.aov.toFixed(2);

        const tbody = document.getElementById('top-products-body');
        tbody.innerHTML = '';
        productsByPeriod[activePeriod].forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td class="cell-strong">${p.name}</td><td>${p.units}</td><td>${p.margin}</td>`;
            tbody.appendChild(tr);
        });
    }

    document.querySelectorAll('.tab-btn[data-period]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn[data-period]').forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            activePeriod = btn.getAttribute('data-period');
            render();
        });
    });

    document.querySelectorAll('.chip-btn[data-channel]').forEach(btn => {
        btn.addEventListener('click', () => {
            const ch = btn.getAttribute('data-channel');
            if (activeChannels.has(ch)) {
                if (activeChannels.size === 1) return;
                activeChannels.delete(ch);
                btn.classList.remove('active');
            } else {
                activeChannels.add(ch);
                btn.classList.add('active');
            }
            render();
        });
    });

    window.addEventListener('demo-theme-changed', render);
    render();
});
