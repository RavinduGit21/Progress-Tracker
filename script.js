(function(){
    const STORAGE_KEY = 'progress-tracker-v1';
    const COUNTDOWN_STORAGE_KEY = 'progress-tracker-countdowns-v1';

    /**
     * Shape in storage:
     * {
     *   activeSemester: string,
     *   semesters: {
     *     [semesterName: string]: { 
     *       rows: string[], 
     *       cols: string[], 
     *       checks: {"r-c": true},
     *       examText: string,
     *       examDate: string
     *     }
     *   }
     * }
     */
    function loadState(){
        try{
            const raw = localStorage.getItem(STORAGE_KEY);
            
            // Retrieve legacy countdowns if they exist for automatic migration
            let legacyCountdowns = [];
            try {
                const cds = localStorage.getItem(COUNTDOWN_STORAGE_KEY);
                if (cds) legacyCountdowns = JSON.parse(cds) || [];
            } catch(e) {}

            function getLegacyDate(semName, defaultVal) {
                const found = legacyCountdowns.find(c => c.text && c.text.includes(semName));
                return found ? found.date : defaultVal;
            }
            function getLegacyText(semName, defaultVal) {
                const found = legacyCountdowns.find(c => c.text && c.text.includes(semName));
                return found ? found.text : defaultVal;
            }

            if(!raw) {
                const def = createDefaultState();
                // Apply any legacy dates to defaults
                Object.keys(def.semesters).forEach(sem => {
                    def.semesters[sem].examDate = getLegacyDate(sem, def.semesters[sem].examDate);
                    def.semesters[sem].examText = getLegacyText(sem, def.semesters[sem].examText);
                });
                return def;
            }
            const data = JSON.parse(raw);
            
            // Check for legacy flat state and migrate if found
            if (data.rows && Array.isArray(data.rows) && data.cols && Array.isArray(data.cols)) {
                const migrated = createDefaultState();
                migrated.activeSemester = "Semester 3";
                migrated.semesters["Semester 3"] = {
                    rows: data.rows,
                    cols: data.cols,
                    checks: data.checks || {},
                    examText: getLegacyText("Semester 3", "Days left for Semester 3 Exam"),
                    examDate: getLegacyDate("Semester 3", "2026-01-26")
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
                return migrated;
            }

            if(!data.activeSemester || !data.semesters || typeof data.semesters !== 'object'){
                return createDefaultState();
            }

            // Fill missing semesters or missing properties
            Object.keys(data.semesters).forEach(sem => {
                const sData = data.semesters[sem];
                if(!sData || !Array.isArray(sData.rows) || !Array.isArray(sData.cols) || typeof sData.checks !== 'object'){
                    data.semesters[sem] = createDefaultSemesterState(sem);
                } else {
                    if (sData.examText === undefined) {
                        sData.examText = getLegacyText(sem, `Days left for ${sem} Exam`);
                    }
                    if (sData.examDate === undefined) {
                        sData.examDate = getLegacyDate(sem, sem === 'Semester 3' ? '2026-01-26' : (sem === 'Semester 1' ? '2026-02-07' : ''));
                    }
                    if (sData.showCountdown === undefined) {
                        sData.showCountdown = true;
                    }
                    if (sData.isArchived === undefined) {
                        sData.isArchived = false;
                    }
                }
            });

            return data;
        }catch(e){
            return createDefaultState();
        }
    }

    function saveState(state){
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function createDefaultSemesterState(semName) {
        let baseState = { rows: [], cols: [], checks: {}, examText: `Days left for ${semName} Exam`, examDate: '', showCountdown: true, isArchived: false };
        if (semName === 'Semester 1') {
            baseState.rows = [
                'Programming Fundamentals',
                'Mathematics 1',
                'English Composition',
                'Introduction to IT'
            ];
            baseState.cols = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6'];
            baseState.examDate = '2026-02-07';
        } else if (semName === 'Semester 2') {
            baseState.rows = [
                'Object Oriented Programming',
                'Mathematics 2',
                'Digital Logic Design',
                'Web Application Development 1'
            ];
            baseState.cols = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6'];
        } else if (semName === 'Semester 3') {
            baseState.rows = [
                'Communication Skills',
                'Object Oriented Analysis & Design',
                'Data Structure and Algorithms',
                'Data Management System',
                'Web Application Development 2'
            ];
            baseState.cols = ['Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8'];
            baseState.examDate = '2026-01-26';
        } else if (semName === 'Semester 4') {
            baseState.rows = [
                'Mobile Application Development',
                'Software Engineering',
                'Operating Systems',
                'Computer Networks',
                'Professional Practice'
            ];
            baseState.cols = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6'];
        } else {
            baseState.rows = ['Subject 1', 'Subject 2'];
            baseState.cols = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6'];
        }
        return baseState;
    }

    function createDefaultState(){
        return {
            activeSemester: "Semester 3",
            semesters: {
                "Semester 1": createDefaultSemesterState("Semester 1"),
                "Semester 2": createDefaultSemesterState("Semester 2"),
                "Semester 3": createDefaultSemesterState("Semester 3"),
                "Semester 4": createDefaultSemesterState("Semester 4")
            }
        };
    }

    const state = loadState();
    let currentSemesterData = state.semesters[state.activeSemester];
    const table = document.getElementById('tracker');
    const wrapper = document.querySelector('.table-wrap');
    let userZoom = 1; // additional zoom factor controlled by buttons

    // Set dropdown to active semester
    const semesterSelect = document.getElementById('semester-select');
    if (semesterSelect) {
        semesterSelect.addEventListener('change', (e) => {
            state.activeSemester = e.target.value;
            currentSemesterData = state.semesters[state.activeSemester];
            saveState(state);
            render();
            // Refresh countdowns on active semester change
            updateExamCountdowns();
        });
    }

    function keyFor(r,c){ return r+'-'+c; }

    function render(){
        // Dynamically populate semester select dropdown options
        if (semesterSelect) {
            semesterSelect.innerHTML = '';
            Object.keys(state.semesters).forEach(sem => {
                const isArchived = !!state.semesters[sem].isArchived;
                if (!isArchived || sem === state.activeSemester) {
                    const opt = document.createElement('option');
                    opt.value = sem;
                    opt.textContent = sem;
                    semesterSelect.appendChild(opt);
                }
            });
            semesterSelect.value = state.activeSemester;
        }

        table.innerHTML = '';
        const thead = document.createElement('thead');
        const headRow = document.createElement('tr');

        const corner = document.createElement('th');
        corner.className = 'muted';
        corner.textContent = 'Rows \\ Columns';
        headRow.appendChild(corner);

        currentSemesterData.cols.forEach((name,colIdx)=>{
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
                currentSemesterData.cols[colIdx] = newText || `Column ${colIdx+1}`;
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
        currentSemesterData.rows.forEach((rowName,rowIdx)=>{
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
                currentSemesterData.rows[rowIdx] = newText || `Row ${rowIdx+1}`;
                saveState(state);
                render();
            });
            tr.appendChild(th);

            currentSemesterData.cols.forEach((_,colIdx)=>{
                const td = document.createElement('td');
                td.className = 'cell';
                const checked = !!currentSemesterData.checks[keyFor(rowIdx,colIdx)];
                if(checked){
                    td.classList.add('checked');
                    td.textContent = '✔';
                } else {
                    td.textContent = '';
                }
                td.addEventListener('click',()=>{
                    const k = keyFor(rowIdx,colIdx);
                    if(currentSemesterData.checks[k]){ delete currentSemesterData.checks[k]; }
                    else { currentSemesterData.checks[k] = true; }
                    saveState(state);
                    // update cell UI without full rerender
                    const nowChecked = !!currentSemesterData.checks[k];
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
        const newIndex = currentSemesterData.rows.length; // index after push will be this
        currentSemesterData.rows.push(`Row ${newIndex+1}`);
        saveState(state);
        render();
        scrollRowIntoView(newIndex);
        fitToViewport();
    }
    function addColumn(){
        const newIndex = currentSemesterData.cols.length; // index after push will be this
        const nextLabel = deriveNextDayLabel();
        currentSemesterData.cols.push(nextLabel);
        saveState(state);
        render();
        scrollColIntoView(newIndex);
        fitToViewport();
    }
    function resetChecks(){
        currentSemesterData.checks = {};
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
        currentSemesterData.cols.forEach(name=>{
            const m = regex.exec(String(name));
            if(m){
                const n = parseInt(m[1],10);
                if(!Number.isNaN(n)) maxDay = Math.max(maxDay, n);
            }
        });
        if(maxDay === -Infinity){
            // Fallback if no day labels exist
            return `Day ${currentSemesterData.cols.length+1}`;
        }
        return `Day ${maxDay+1}`;
    }

    // Delete operations with reindexing of checks
    function deleteRow(rowIdx){
        if(rowIdx<0 || rowIdx>=currentSemesterData.rows.length) return;
        currentSemesterData.rows.splice(rowIdx,1);
        const newChecks = {};
        Object.keys(currentSemesterData.checks).forEach(k=>{
            const [r,c] = k.split('-').map(Number);
            if(r === rowIdx) return; // drop
            const newR = r > rowIdx ? r-1 : r;
            newChecks[`${newR}-${c}`] = true;
        });
        currentSemesterData.checks = newChecks;
        saveState(state);
        render();
        fitToViewport();
    }
    function deleteColumn(colIdx){
        if(colIdx<0 || colIdx>=currentSemesterData.cols.length) return;
        currentSemesterData.cols.splice(colIdx,1);
        const newChecks = {};
        Object.keys(currentSemesterData.checks).forEach(k=>{
            const [r,c] = k.split('-').map(Number);
            if(c === colIdx) return; // drop
            const newC = c > colIdx ? c-1 : c;
            newChecks[`${r}-${newC}`] = true;
        });
        currentSemesterData.checks = newChecks;
        saveState(state);
        render();
        fitToViewport();
    }

    // Scale table to fit within wrapper without scrollbars
    function fitToViewport(){
        if(!wrapper) return;
        
        // Remove scaling styles completely to let table layout naturally
        table.style.transform = '';
        table.style.zoom = '';
        
        // Force synchronous layout reflow so dimensions are accurately calculated at 100%
        const _reflow = table.offsetHeight;
        
        const naturalWidth = table.scrollWidth;
        const naturalHeight = table.scrollHeight;
        
        const availW = wrapper.clientWidth - 2;
        const availH = wrapper.clientHeight - 2;
        const scaleW = availW / naturalWidth;
        const scaleH = availH / naturalHeight;
        
        // baseScale fits the table in the viewport on load
        const baseScale = Math.min(1, scaleW, scaleH);
        
        // Multiply by userZoom, allowing zoom up to 400% (4) for ultra-wide grids
        const scale = Math.max(0.1, Math.min(4, baseScale * userZoom));
        
        if ('zoom' in document.documentElement.style) {
            table.style.zoom = scale;
        } else {
            table.style.transform = `scale(${scale})`;
            table.style.transformOrigin = 'top left';
        }
        
        // Update the zoom percentage indicator button text dynamically
        const zr = document.getElementById('zoom-reset');
        if (zr) {
            zr.textContent = `${Math.round(scale * 100)}%`;
        }
    }

    // Zoom controls
    function setZoom(z){ userZoom = z; fitToViewport(); persistZoom(); }
    function changeZoom(delta){
        const step = delta > 0 ? (userZoom >= 2 ? 0.5 : 0.25) : (userZoom > 2 ? 0.5 : 0.25);
        const newZoom = userZoom + (delta > 0 ? step : -step);
        setZoom(Math.max(0.25, Math.min(15, newZoom)));
    }
    function persistZoom(){ try{ localStorage.setItem('progress-zoom', String(userZoom)); }catch(e){} }
    function loadZoom(){
        const z = parseFloat(localStorage.getItem('progress-zoom'));
        if(!Number.isNaN(z)) {
            userZoom = z;
        } else {
            userZoom = 1;
        }
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
    function updateExamCountdowns() {
        const countdownListContainer = document.getElementById('countdown-list');
        if (!countdownListContainer) return;
        countdownListContainer.innerHTML = '';
        
        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;
        
        // Scan all semesters for configured exam dates
        Object.keys(state.semesters).forEach(semName => {
            const sem = state.semesters[semName];
            if (sem.examDate && sem.showCountdown !== false && sem.isArchived !== true) {
                const examDateObj = new Date(sem.examDate);
                // set to midnight for accurate day calculations
                examDateObj.setHours(0,0,0,0);
                const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const diffTime = examDateObj - todayMidnight;
                const daysLeft = Math.ceil(diffTime / oneDay);
                
                const p = document.createElement('p');
                p.innerHTML = `${sem.examText || `Days left for ${semName} Exam`}: <strong>${daysLeft}</strong>`;
                countdownListContainer.appendChild(p);
            }
        });
    }
    setInterval(updateExamCountdowns, 1000 * 60 * 60); // Update once an hour
    updateExamCountdowns(); // initial call

    // Settings Modal & Semester CRUD Manager
    const modal = document.getElementById('settings-modal');
    const settingsBtn = document.getElementById('settings-btn');
    const closeBtn = document.querySelector('.close-btn');
    const settingsForm = document.getElementById('settings-form');
    const activeExamTextInput = document.getElementById('active-exam-text');
    const activeExamDateInput = document.getElementById('active-exam-date');
    const activeShowCountdownInput = document.getElementById('active-show-countdown');
    const activeSemLabel = document.getElementById('active-sem-label');
    const addSemesterForm = document.getElementById('add-semester-form');
    const newSemNameInput = document.getElementById('new-sem-name');
    const semesterListUl = document.getElementById('semester-list');

    function populateSemesterList() {
        if (!semesterListUl) return;
        semesterListUl.innerHTML = '';
        
        const semesters = Object.keys(state.semesters);
        semesters.forEach(semName => {
            const sem = state.semesters[semName];
            const li = document.createElement('li');
            if (semName === state.activeSemester) {
                li.classList.add('active');
            }
            if (sem.isArchived) {
                li.classList.add('archived');
            }
            
            const span = document.createElement('span');
            span.textContent = semName + (sem.isArchived ? ' (Archived)' : '');
            span.style.cursor = 'pointer';
            span.title = `Switch to ${semName}`;
            // Click semester name to switch to it
            span.addEventListener('click', () => {
                state.activeSemester = semName;
                currentSemesterData = state.semesters[state.activeSemester];
                saveState(state);
                render();
                openSettingsModal(); // refresh contents
            });
            li.appendChild(span);
            
            const actionsWrap = document.createElement('div');
            actionsWrap.style.display = 'flex';
            actionsWrap.style.gap = '6px';
            actionsWrap.style.alignItems = 'center';

            const archiveBtn = document.createElement('button');
            archiveBtn.className = 'archive-sem-btn';
            archiveBtn.innerHTML = sem.isArchived ? '📤' : '📦';
            archiveBtn.title = sem.isArchived ? `Unarchive ${semName}` : `Archive ${semName}`;
            archiveBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleArchiveSemester(semName);
            });
            actionsWrap.appendChild(archiveBtn);

            const delBtn = document.createElement('button');
            delBtn.className = 'delete-sem-btn';
            delBtn.innerHTML = '🗑️';
            delBtn.title = `Delete ${semName}`;
            
            // Cannot delete if it is the last semester remaining
            if (semesters.length <= 1) {
                delBtn.style.opacity = '0.3';
                delBtn.style.cursor = 'not-allowed';
                delBtn.disabled = true;
            } else {
                delBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteSemester(semName);
                });
            }
            actionsWrap.appendChild(delBtn);
            
            li.appendChild(actionsWrap);
            semesterListUl.appendChild(li);
        });
    }

    function toggleArchiveSemester(name) {
        const sem = state.semesters[name];
        sem.isArchived = !sem.isArchived;
        
        if (sem.isArchived && state.activeSemester === name) {
            // Shift active semester to first non-archived semester
            const remaining = Object.keys(state.semesters).filter(k => !state.semesters[k].isArchived);
            if (remaining.length > 0) {
                state.activeSemester = remaining[0];
                currentSemesterData = state.semesters[state.activeSemester];
            } else {
                // If all are archived, we cannot archive the last one!
                sem.isArchived = false;
                alert("You must keep at least one semester unarchived.");
                return;
            }
        }
        
        saveState(state);
        render();
        openSettingsModal(); // refreshes modal inputs & lists
        updateExamCountdowns();
    }

    function openSettingsModal() {
        if (activeSemLabel) activeSemLabel.textContent = state.activeSemester;
        
        const sem = state.semesters[state.activeSemester];
        if (activeExamTextInput) activeExamTextInput.value = sem.examText || `Days left for ${state.activeSemester} Exam`;
        if (activeExamDateInput) activeExamDateInput.value = sem.examDate || '';
        if (activeShowCountdownInput) activeShowCountdownInput.checked = sem.showCountdown !== false;
        
        populateSemesterList();
        modal.style.display = 'block';
    }

    if (settingsBtn) {
        settingsBtn.addEventListener('click', openSettingsModal);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const sem = state.semesters[state.activeSemester];
            sem.examText = activeExamTextInput.value.trim();
            sem.examDate = activeExamDateInput.value;
            sem.showCountdown = activeShowCountdownInput ? activeShowCountdownInput.checked : true;
            saveState(state);
            updateExamCountdowns();
            modal.style.display = 'none';
        });
    }

    if (addSemesterForm) {
        addSemesterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = newSemNameInput.value.trim();
            if (!name) return;
            
            if (state.semesters[name]) {
                alert(`A semester with the name "${name}" already exists.`);
                return;
            }
            
            // Create semester with base defaults
            state.semesters[name] = {
                rows: ['Subject 1', 'Subject 2'],
                cols: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6'],
                checks: {},
                examText: `Days left for ${name} Exam`,
                examDate: '',
                showCountdown: true
            };
            
            state.activeSemester = name;
            currentSemesterData = state.semesters[name];
            saveState(state);
            render();
            
            newSemNameInput.value = '';
            openSettingsModal(); // Refresh modal
        });
    }

    function deleteSemester(name) {
        const semesters = Object.keys(state.semesters);
        if (semesters.length <= 1) {
            alert("You cannot delete the only remaining semester.");
            return;
        }
        
        if (confirm(`Are you sure you want to delete "${name}"?\nThis will permanently erase all of its subjects, columns, and checked progress.`)) {
            delete state.semesters[name];
            
            if (state.activeSemester === name) {
                // Select first remaining semester
                const remaining = Object.keys(state.semesters);
                state.activeSemester = remaining[0];
                currentSemesterData = state.semesters[state.activeSemester];
            }
            
            saveState(state);
            render();
            populateSemesterList();
            if (activeSemLabel) activeSemLabel.textContent = state.activeSemester;
            
            // Update active fields for the new active semester
            const sem = state.semesters[state.activeSemester];
            if (activeExamTextInput) activeExamTextInput.value = sem.examText || `Days left for ${state.activeSemester} Exam`;
            if (activeExamDateInput) activeExamDateInput.value = sem.examDate || '';
            
            // Update countdowns after deletion
            updateExamCountdowns();
        }
    }

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
