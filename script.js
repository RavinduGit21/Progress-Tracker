(function(){
    const STORAGE_KEY = 'progress-tracker-v1';
    const COUNTDOWN_STORAGE_KEY = 'progress-tracker-countdowns-v1';

    /**
     * Shape in storage:
     * { rows: string[], cols: string[], checks: {"r-c": true} }
     */
    function loadState(){
        try{
            const raw = localStorage.getItem(STORAGE_KEY);
            if(!raw) return createDefaultState();
            const data = JSON.parse(raw);
            if(!Array.isArray(data.rows) || !Array.isArray(data.cols) || typeof data.checks !== 'object'){
                return createDefaultState();
            }
            return data;
        }catch(e){
            return createDefaultState();
        }
    }

    function saveState(state){
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function createDefaultState(){
        return {
            rows: [
                'Communication Skills',
                'Object Oriented Analysis & Design',
                'Data Structure and Algorithms',
                'Data Management System',
                'Web Application Development 2'
            ],
            cols: ['Day 3','Day 4','Day 5','Day 6','Day 7','Day 8'],
            checks: {}
        };
    }

    const state = loadState();
    const table = document.getElementById('tracker');
    const wrapper = document.querySelector('.table-wrap');
    let userZoom = 1; // additional zoom factor controlled by buttons

    function keyFor(r,c){ return r+'-'+c; }

    function render(){
        table.innerHTML = '';
        const thead = document.createElement('thead');
        const headRow = document.createElement('tr');

        const corner = document.createElement('th');
        corner.className = 'muted';
        corner.textContent = 'Rows \\ Columns';
        headRow.appendChild(corner);

        state.cols.forEach((name,colIdx)=>{
            const th = document.createElement('th');
            th.className = 'col-name';
            th.title = 'Double-click to rename column';
            th.dataset.colIndex = String(colIdx);
            const headerFlex = document.createElement('div');
            headerFlex.className = 'header-flex';
            const nameSpan = document.createElement('span');
            nameSpan.textContent = name;
            headerFlex.appendChild(nameSpan);
            const delBtn = document.createElement('button');
            delBtn.className = 'icon-btn';
            delBtn.textContent = '✖';
            delBtn.title = 'Delete column';
            delBtn.addEventListener('click', (e)=>{ e.stopPropagation(); deleteColumn(colIdx); });
            headerFlex.appendChild(delBtn);
            th.appendChild(headerFlex);
            enableInlineEdit(nameSpan, (newText)=>{
                state.cols[colIdx] = newText || `Column ${colIdx+1}`;
                saveState(state);
                render();
            });
            headRow.appendChild(th);
        });

        // Add a plus cell at the end of header for adding columns quickly
        const addColTh = document.createElement('th');
        addColTh.innerHTML = '<span class="pill">+ Col</span>';
        addColTh.style.cursor = 'pointer';
        addColTh.addEventListener('click', addColumn);
        headRow.appendChild(addColTh);

        thead.appendChild(headRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        state.rows.forEach((rowName,rowIdx)=>{
            const tr = document.createElement('tr');
            tr.dataset.rowIndex = String(rowIdx);

            const th = document.createElement('th');
            th.className = 'name-cell';
            th.title = 'Double-click to rename row';
            const rowHeader = document.createElement('div');
            rowHeader.className = 'row-header';
            const nameSpan = document.createElement('span');
            nameSpan.textContent = rowName;
            rowHeader.appendChild(nameSpan);
            const delBtn = document.createElement('button');
            delBtn.className = 'icon-btn';
            delBtn.textContent = '✖';
            delBtn.title = 'Delete row';
            delBtn.addEventListener('click', (e)=>{ e.stopPropagation(); deleteRow(rowIdx); });
            rowHeader.appendChild(delBtn);
            th.appendChild(rowHeader);
            enableInlineEdit(nameSpan, (newText)=>{
                state.rows[rowIdx] = newText || `Row ${rowIdx+1}`;
                saveState(state);
                render();
            });
            tr.appendChild(th);

            state.cols.forEach((_,colIdx)=>{
                const td = document.createElement('td');
                td.className = 'cell';
                const checked = !!state.checks[keyFor(rowIdx,colIdx)];
                if(checked){
                    td.classList.add('checked');
                    td.textContent = '✔';
                } else {
                    td.textContent = '';
                }
                td.addEventListener('click',()=>{
                    const k = keyFor(rowIdx,colIdx);
                    if(state.checks[k]){ delete state.checks[k]; }
                    else { state.checks[k] = true; }
                    saveState(state);
                    // update cell UI without full rerender
                    const nowChecked = !!state.checks[k];
                    td.classList.toggle('checked', nowChecked);
                    td.textContent = nowChecked ? '✔' : '';
                });
                tr.appendChild(td);
            });

            // Add per-row quick add cell
            const addRowEnd = document.createElement('td');
            addRowEnd.innerHTML = '<span class="pill">+ Row</span>';
            addRowEnd.style.cursor = 'pointer';
            addRowEnd.addEventListener('click', addRow);
            tr.appendChild(addRowEnd);

            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        fitToViewport();
    }

    function enableInlineEdit(element, onCommit){
        element.addEventListener('dblclick', ()=>{
            element.setAttribute('contenteditable','true');
            element.focus();
            selectAllText(element);
        });
        function finish(){
            if(element.isContentEditable){
                element.removeAttribute('contenteditable');
                onCommit(element.textContent.trim());
            }
        }
        element.addEventListener('blur', finish);
        element.addEventListener('keydown', (e)=>{
            if(e.key === 'Enter'){
                e.preventDefault();
                element.blur();
            } else if(e.key === 'Escape'){
                e.preventDefault();
                element.textContent = element.textContent; // noop refresh
                element.blur();
            }
        });
    }

    function selectAllText(el){
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    // Actions
    function addRow(){
        const newIndex = state.rows.length; // index after push will be this
        state.rows.push(`Row ${newIndex+1}`);
        saveState(state);
        render();
        scrollRowIntoView(newIndex);
        fitToViewport();
    }
    function addColumn(){
        const newIndex = state.cols.length; // index after push will be this
        const nextLabel = deriveNextDayLabel();
        state.cols.push(nextLabel);
        saveState(state);
        render();
        scrollColIntoView(newIndex);
        fitToViewport();
    }
    function resetChecks(){
        state.checks = {};
        saveState(state);
        render();
    }

    // View helpers
    function scrollRowIntoView(rowIdx){
        const rowEl = table.querySelector(`tbody tr[data-row-index="${rowIdx}"]`);
        if(rowEl){ rowEl.scrollIntoView({behavior:'smooth',block:'nearest',inline:'nearest'}); }
    }
    function scrollColIntoView(colIdx){
        const colEl = table.querySelector(`thead th.col-name[data-col-index="${colIdx}"]`);
        if(colEl){ colEl.scrollIntoView({behavior:'smooth',block:'nearest',inline:'end'}); }
        if(wrapper){ wrapper.scrollLeft = wrapper.scrollWidth; }
    }

    function deriveNextDayLabel(){
        let maxDay = -Infinity;
        const regex = /^\s*Day\s*(\d+)\s*$/i;
        state.cols.forEach(name=>{
            const m = regex.exec(String(name));
            if(m){
                const n = parseInt(m[1],10);
                if(!Number.isNaN(n)) maxDay = Math.max(maxDay, n);
            }
        });
        if(maxDay === -Infinity){
            // Fallback if no day labels exist
            return `Day ${state.cols.length+1}`;
        }
        return `Day ${maxDay+1}`;
    }

    // Delete operations with reindexing of checks
    function deleteRow(rowIdx){
        if(rowIdx<0 || rowIdx>=state.rows.length) return;
        state.rows.splice(rowIdx,1);
        const newChecks = {};
        Object.keys(state.checks).forEach(k=>{
            const [r,c] = k.split('-').map(Number);
            if(r === rowIdx) return; // drop
            const newR = r > rowIdx ? r-1 : r;
            newChecks[`${newR}-${c}`] = true;
        });
        state.checks = newChecks;
        saveState(state);
        render();
        fitToViewport();
    }
    function deleteColumn(colIdx){
        if(colIdx<0 || colIdx>=state.cols.length) return;
        state.cols.splice(colIdx,1);
        const newChecks = {};
        Object.keys(state.checks).forEach(k=>{
            const [r,c] = k.split('-').map(Number);
            if(c === colIdx) return; // drop
            const newC = c > colIdx ? c-1 : c;
            newChecks[`${r}-${newC}`] = true;
        });
        state.checks = newChecks;
        saveState(state);
        render();
        fitToViewport();
    }

    // Scale table to fit within wrapper without scrollbars
    function fitToViewport(){
        if(!wrapper) return;
        table.style.transform = 'none';
        const naturalWidth = table.scrollWidth;
        const naturalHeight = table.scrollHeight;
        const availW = wrapper.clientWidth - 2;
        const availH = wrapper.clientHeight - 2;
        const scaleW = availW / naturalWidth;
        const scaleH = availH / naturalHeight;
        const baseScale = Math.min(1, scaleW, scaleH);
        const scale = Math.max(0.25, Math.min(2, baseScale * userZoom));
        table.style.transform = `scale(${scale})`;
        wrapper.scrollTop = 0; wrapper.scrollLeft = 0;
    }

    // Zoom controls
    function setZoom(z){ userZoom = z; fitToViewport(); persistZoom(); }
    function changeZoom(delta){ setZoom(Math.max(0.25, Math.min(2, userZoom + delta))); }
    function persistZoom(){ try{ localStorage.setItem('progress-zoom', String(userZoom)); }catch(e){} }
    function loadZoom(){
        const z = parseFloat(localStorage.getItem('progress-zoom'));
        if(!Number.isNaN(z)) userZoom = z;
    }

    // Clock functionality
    const clockElement = document.getElementById('clock');
    function updateClock() {
        if (!clockElement) return;
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        clockElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
    setInterval(updateClock, 1000);
    updateClock(); // initial call

    // Exam countdown functionality
    const countdown1Element = document.getElementById('countdown-1');
    const countdown2Element = document.getElementById('countdown-2');

    function getDefaultCountdowns() {
        return [
            { text: 'Days left for Semester 3 Exam', date: '2026-01-26' },
            { text: 'Days left for Semester 1 Exam', date: '2026-02-07' }
        ];
    }

    function loadCountdowns() {
        try {
            const raw = localStorage.getItem(COUNTDOWN_STORAGE_KEY);
            if (!raw) return getDefaultCountdowns();
            const data = JSON.parse(raw);
            if (!Array.isArray(data) || data.length !== 2) {
                return getDefaultCountdowns();
            }
            return data;
        } catch (e) {
            return getDefaultCountdowns();
        }
    }

    function saveCountdowns(countdowns) {
        localStorage.setItem(COUNTDOWN_STORAGE_KEY, JSON.stringify(countdowns));
    }

    let countdowns = loadCountdowns();

    function updateExamCountdowns() {
        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;

        const [cd1, cd2] = countdowns;

        const date1 = new Date(cd1.date);
        const daysLeft1 = Math.round((date1 - now) / oneDay);
        if (countdown1Element) {
            countdown1Element.textContent = `${cd1.text}: ${daysLeft1}`;
        }

        const date2 = new Date(cd2.date);
        const daysLeft2 = Math.round((date2 - now) / oneDay);
        if (countdown2Element) {
            countdown2Element.textContent = `${cd2.text}: ${daysLeft2}`;
        }
    }
    setInterval(updateExamCountdowns, 1000 * 60 * 60); // Update once an hour
    updateExamCountdowns(); // initial call

    // Settings Modal
    const modal = document.getElementById('settings-modal');
    const settingsBtn = document.getElementById('settings-btn');
    const closeBtn = document.querySelector('.close-btn');
    const settingsForm = document.getElementById('settings-form');
    const countdown1TextInput = document.getElementById('countdown1-text');
    const countdown1DateInput = document.getElementById('countdown1-date');
    const countdown2TextInput = document.getElementById('countdown2-text');
    const countdown2DateInput = document.getElementById('countdown2-date');

    settingsBtn.addEventListener('click', () => {
        const [cd1, cd2] = loadCountdowns();
        countdown1TextInput.value = cd1.text;
        countdown1DateInput.value = cd1.date;
        countdown2TextInput.value = cd2.text;
        countdown2DateInput.value = cd2.date;
        modal.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newCountdowns = [
            { text: countdown1TextInput.value, date: countdown1DateInput.value },
            { text: countdown2TextInput.value, date: countdown2DateInput.value }
        ];
        saveCountdowns(newCountdowns);
        countdowns = newCountdowns;
        updateExamCountdowns();
        modal.style.display = 'none';
    });

    // Wire buttons
    document.getElementById('add-row').addEventListener('click', addRow);
    document.getElementById('add-col').addEventListener('click', addColumn);
    document.getElementById('reset').addEventListener('click', resetChecks);
    const zi = document.getElementById('zoom-in');
    const zo = document.getElementById('zoom-out');
    const zr = document.getElementById('zoom-reset');
    if(zi&&zo&&zr){
        zi.addEventListener('click', ()=> changeZoom(0.1));
        zo.addEventListener('click', ()=> changeZoom(-0.1));
        zr.addEventListener('click', ()=> setZoom(1));
    }

    loadZoom();
    render();
})();
