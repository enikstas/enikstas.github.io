document.addEventListener('DOMContentLoaded', () => {
    initDemoTheme();


    const products = [
        { name: 'Wireless Earbuds Pro', a: 320, b: 210, c: 40, threshold: 150 },
        { name: 'Insulated Steel Bottle', a: 180, b: 90, c: 60, threshold: 150 },
        { name: 'Canvas Tote Bag', a: 45, b: 30, c: 12, threshold: 150 },
        { name: 'Desk Plant Kit', a: 20, b: 15, c: 8, threshold: 80 },
        { name: 'Ceramic Mug Set', a: 410, b: 260, c: 95, threshold: 200 },
        { name: 'Bluetooth Speaker Mini', a: 12, b: 6, c: 4, threshold: 60 },
        { name: 'Recycled Notebook', a: 500, b: 300, c: 140, threshold: 200 },
        { name: 'Travel Charging Cable', a: 8, b: 5, c: 2, threshold: 100 },
        { name: 'Cork Yoga Mat', a: 95, b: 70, c: 20, threshold: 100 },
        { name: 'Stainless Lunch Box', a: 260, b: 150, c: 55, threshold: 150 }
    ];

    function status(total, threshold) {
        if (total <= threshold * 0.15) return 'critical';
        if (total <= threshold * 0.5) return 'low';
        return 'ok';
    }

    let searchTerm = '';
    let activeFilter = 'all';
    let sortMode = 'stock-asc';
    let openRow = null;
    let warehouseChart;

    function getFiltered() {
        return products
            .map(p => ({ ...p, total: p.a + p.b + p.c, st: status(p.a + p.b + p.c, p.threshold) }))
            .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(p => activeFilter === 'all' || p.st === activeFilter)
            .sort((x, y) => sortMode === 'name' ? x.name.localeCompare(y.name) : x.total - y.total);
    }

    function renderWarehouseChart(list) {
        const totals = { a: 0, b: 0, c: 0 };
        list.forEach(p => { totals.a += p.a; totals.b += p.b; totals.c += p.c; });
        const colors = demoChartColors();

        const wrap = document.getElementById('inventoryChart');
        wrap.innerHTML = '';
        wrap.className = 'custom-bar-chart inventory-chart';
        
        const maxVal = Math.max(totals.a, totals.b, totals.c, 1);
        
        const whs = [
            { name: 'Warehouse A', val: totals.a, color: colors.accent },
            { name: 'Warehouse B', val: totals.b, color: colors.blue },
            { name: 'Warehouse C', val: totals.c, color: colors.purple }
        ];
        
        whs.forEach(wh => {
            const col = document.createElement('div');
            col.className = 'custom-chart-col';
            
            const pct = (wh.val / maxVal) * 100;
            const bar = document.createElement('div');
            bar.className = 'custom-chart-bar';
            bar.style.height = `${pct}%`;
            bar.style.backgroundColor = wh.color;
            bar.setAttribute('title', `${wh.name}: ${wh.val.toLocaleString()} units`);
            col.appendChild(bar);
            
            const labelEl = document.createElement('span');
            labelEl.className = 'custom-chart-label';
            labelEl.textContent = wh.name;
            col.appendChild(labelEl);
            
            wrap.appendChild(col);
        });
    }

    function render() {
        const list = getFiltered();
        const tbody = document.getElementById('inventory-body');
        tbody.innerHTML = '';

        list.forEach((p, i) => {
            const rowId = 'row-' + i;
            const tr = document.createElement('tr');
            tr.className = 'expand-row';
            tr.setAttribute('tabindex', '0');
            tr.setAttribute('role', 'button');
            tr.setAttribute('aria-expanded', openRow === rowId ? 'true' : 'false');
            tr.innerHTML = `
                <td class="cell-strong">${p.name}</td>
                <td>${p.total.toLocaleString()} units</td>
                <td><span class="stock-pill ${p.st}">${p.st === 'ok' ? 'Healthy' : p.st === 'low' ? 'Low stock' : 'Critical'}</span></td>
                <td><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1rem;height:1rem;vertical-align:middle;display:inline-block;"><polyline points="6 9 12 15 18 9"></polyline></svg></td>
            `;
            const detail = document.createElement('tr');
            detail.className = 'expand-detail' + (openRow === rowId ? ' open' : '');
            detail.innerHTML = `
                <td colspan="4">
                    <div class="mini-bars">
                        <div class="mini-bar-col"><div class="mini-bar" style="height:${Math.max(6, (p.a / p.total) * 60)}px; background:var(--accent);"></div><span class="mini-bar-label">WH-A: ${p.a}</span></div>
                        <div class="mini-bar-col"><div class="mini-bar" style="height:${Math.max(6, (p.b / p.total) * 60)}px; background:#0284c7;"></div><span class="mini-bar-label">WH-B: ${p.b}</span></div>
                        <div class="mini-bar-col"><div class="mini-bar" style="height:${Math.max(6, (p.c / p.total) * 60)}px; background:#7c3aed;"></div><span class="mini-bar-label">WH-C: ${p.c}</span></div>
                    </div>
                </td>
            `;

            const toggle = () => {
                openRow = openRow === rowId ? null : rowId;
                render();
            };
            tr.addEventListener('click', toggle);
            tr.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
            });

            tbody.appendChild(tr);
            tbody.appendChild(detail);
        });

        document.getElementById('stat-low-count').textContent =
            products.filter(p => status(p.a + p.b + p.c, p.threshold) !== 'ok').length;


        renderWarehouseChart(list);
    }

    document.getElementById('sku-search').addEventListener('input', (e) => {
        searchTerm = e.target.value;
        openRow = null;
        render();
    });

    document.querySelectorAll('.chip-btn[data-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.chip-btn[data-filter]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.getAttribute('data-filter');
            openRow = null;
            render();
        });
    });

    document.querySelectorAll('.tab-btn[data-sort]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn[data-sort]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            sortMode = btn.getAttribute('data-sort');
            render();
        });
    });

    window.addEventListener('demo-theme-changed', render);
    render();
});
