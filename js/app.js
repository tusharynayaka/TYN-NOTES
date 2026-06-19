/* ═══════════════════════════════════════════════════════════
   Mechanical Statics Notes — app.js
   Clean Review/Flagged Questions Feature
   ═══════════════════════════════════════════════════════════ */

'use strict';

const UNITS_CONFIG = [
  { id: 1, name: 'Force Systems & Resultants', file: 'data/unit1.json' },
  { id: 2, name: 'Equilibrium of Rigid Bodies', file: 'data/unit2.json' },
  { id: 3, name: 'Analysis of Structures', file: 'data/unit3.json' },
  { id: 4, name: 'Friction & Virtual Work', file: 'data/unit4.json' },
];

/* ─── THEME ─── */
function initTheme() {
  const saved = localStorage.getItem('statics-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('statics-theme', next);
}

/* ─── REVIEW SYSTEM ─── */
function getReviewedQuestions() {
  try {
    const data = localStorage.getItem('reviewed-questions');
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveReviewedQuestions(reviewed) {
  localStorage.setItem('reviewed-questions', JSON.stringify(reviewed));
}

function toggleReview(unitId, questionId) {
  const reviewed = getReviewedQuestions();
  const key = `${unitId}-${questionId}`;
  
  if (reviewed[key]) {
    delete reviewed[key];
    saveReviewedQuestions(reviewed);
    return false;
  } else {
    reviewed[key] = {
      unitId: unitId,
      questionId: questionId,
      timestamp: Date.now(),
      unitName: UNITS_CONFIG.find(u => u.id === unitId)?.name || `Unit ${unitId}`
    };
    saveReviewedQuestions(reviewed);
    return true;
  }
}

function isQuestionReviewed(unitId, questionId) {
  const reviewed = getReviewedQuestions();
  return !!reviewed[`${unitId}-${questionId}`];
}

function getReviewCount() {
  const reviewed = getReviewedQuestions();
  return Object.keys(reviewed).length;
}

function getReviewedList() {
  const reviewed = getReviewedQuestions();
  return Object.values(reviewed).sort((a, b) => a.timestamp - b.timestamp);
}

function clearAllReviews() {
  if (confirm('Remove all questions from review list?')) {
    localStorage.removeItem('reviewed-questions');
    updateReviewBadge();
    window.location.reload();
  }
}

/* ─── JSON LOADER ─── */
async function loadJSON(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[Statics] Could not load ${path}:`, err.message);
    return null;
  }
}

/* ─── HOME PAGE ─── */
async function initHome() {
  initTheme();
  bindThemeToggle();
  updateReviewBadge();

  const results = await Promise.all(
    UNITS_CONFIG.map(u => loadJSON(u.file).then(data => ({ unit: u, data })))
  );

  renderUnitCards(results);
  renderHeroStats(results);
  initGlobalSearch(results);
}


function renderHeroStats(results) {
  let total = 0;
  results.forEach(r => { if (r.data) total += r.data.length; });
  
  const qEl = document.getElementById('totalQ');
  const uEl = document.getElementById('totalU');
  const rEl = document.getElementById('totalR');
  
  if (qEl) animateCount(qEl, total);
  if (uEl) animateCount(uEl, UNITS_CONFIG.length);
  if (rEl) animateCount(rEl, getReviewCount());
}


function animateCount(el, target) {
  let start = 0;
  const dur = 800;
  const step = 16;
  const inc = target / (dur / step);
  const timer = setInterval(() => {
    start += inc;
    if (start >= target) { start = target; clearInterval(timer); }
    el.textContent = Math.round(start);
  }, step);
}

function renderUnitCards(results) {
  const grid = document.getElementById('unitGrid');
  const pill = document.getElementById('unitCount');
  if (!grid) return;

  grid.innerHTML = '';
  if (pill) pill.textContent = `${UNITS_CONFIG.length} units`;

  const reviewed = getReviewedQuestions();

  results.forEach(({ unit, data }) => {
    const count = data ? data.length : 0;
    const unitReviewed = data ? data.filter(q => reviewed[`${unit.id}-${q.id}`]).length : 0;
    
    const card = document.createElement('a');
    card.href = `unit.html?unit=${unit.id}`;
    card.className = 'unit-card';
    card.setAttribute('aria-label', `Open Unit ${unit.id}: ${unit.name}`);

    card.innerHTML = `
      <div class="unit-card-number">Unit ${unit.id}</div>
      <div class="unit-card-name">${escHtml(unit.name)}</div>
      <div class="unit-card-meta">
        <div class="unit-card-count">
          <strong>${count}</strong>
          question${count !== 1 ? 's' : ''}
          ${unitReviewed > 0 ? `<span class="review-badge">${unitReviewed} for review</span>` : ''}
        </div>
        <div class="unit-card-arrow">→</div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function updateReviewBadge() {
  const badge = document.getElementById('reviewBadge');
  if (badge) {
    const count = getReviewCount();
    badge.textContent = count > 0 ? `📋 ${count}` : '📋 0';
  }
}

/* ─── GLOBAL SEARCH ─── */
function initGlobalSearch(results) {
  const input = document.getElementById('globalSearch');
  const dropdown = document.getElementById('searchDropdown');
  if (!input || !dropdown) return;

  const index = [];
  results.forEach(({ unit, data }) => {
    if (!data) return;
    data.forEach(q => {
      index.push({
        unitId: unit.id,
        unitName: unit.name,
        qId: q.id,
        title: (q.title || `Question ${q.id}`).toLowerCase(),
        reviewed: isQuestionReviewed(unit.id, q.id)
      });
    });
  });

  let debounceTimer;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => runGlobalSearch(input.value, index, dropdown), 180);
  });

  document.addEventListener('click', e => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });

  input.addEventListener('focus', () => {
    if (input.value.trim()) dropdown.classList.remove('hidden');
  });
}

function runGlobalSearch(query, index, dropdown) {
  query = query.trim().toLowerCase();
  dropdown.innerHTML = '';

  if (!query) { dropdown.classList.add('hidden'); return; }

  const matches = index.filter(item =>
    item.title.includes(query) ||
    String(item.qId).includes(query) ||
    String(item.unitId).includes(query) ||
    item.unitName.toLowerCase().includes(query)
  ).slice(0, 20);

  if (!matches.length) {
    dropdown.innerHTML = `<div class="search-no-result">No results for "<strong>${escHtml(query)}</strong>"</div>`;
    dropdown.classList.remove('hidden');
    return;
  }

  matches.forEach(m => {
    const el = document.createElement('div');
    el.className = 'search-result-item';
    el.innerHTML = `
      <span class="sri-unit">Unit ${m.unitId} · ${escHtml(m.unitName)}</span>
      <span class="sri-title">${escHtml(m.title.charAt(0).toUpperCase() + m.title.slice(1))}</span>
      <span class="sri-num">Q${m.qId} ${m.reviewed ? '📋' : ''}</span>
    `;
    el.addEventListener('click', () => {
      window.location.href = `unit.html?unit=${m.unitId}&q=${m.qId}`;
    });
    dropdown.appendChild(el);
  });

  dropdown.classList.remove('hidden');
}

/* ─── UNIT PAGE ─── */
let currentQuestions = [];
let currentUnitId = 1;

async function initUnit() {
  initTheme();
  bindThemeToggle();
  updateReviewBadge();

  const unitId = getUnitIdFromURL();
  currentUnitId = unitId;
  const unitCfg = UNITS_CONFIG.find(u => u.id === unitId);

  if (!unitCfg) {
    renderError('Unit not found', `Unit ${unitId} does not exist.`);
    return;
  }

  updatePageTitle(unitId, unitCfg.name);
  setPrevNextUnit(unitId);

  const questions = await loadJSON(unitCfg.file);
  if (!questions || !questions.length) {
    renderError('No questions found', `Could not load ${unitCfg.file}`);
    return;
  }

  currentQuestions = questions;

  const qParam = new URLSearchParams(window.location.search).get('q');
  let targetQ = qParam ? parseInt(qParam) : questions[0].id;

  if (!questions.find(q => q.id === targetQ)) {
    targetQ = questions[0].id;
  }

  renderQuestions(questions, unitCfg, unitId, targetQ);
  buildQuestionGrid(questions, targetQ);
  initUnitSearch(questions);
  initProgressBar();
  initBackToTop();
}

function getUnitIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get('unit'), 10) || 1;
}

function updatePageTitle(unitId, unitName) {
  document.title = `Unit ${unitId} – ${unitName} | Mechanical Statics`;
  const titleEl = document.getElementById('unitPageTitle');
  const subEl = document.getElementById('unitPageSub');
  if (titleEl) titleEl.textContent = `Unit ${unitId}: ${unitName}`;
  if (subEl) subEl.textContent = 'Mechanical Statics';
}

function setPrevNextUnit(unitId) {
  const prevBtn = document.getElementById('prevUnitBtn');
  const nextBtn = document.getElementById('nextUnitBtn');
  const prevUnit = UNITS_CONFIG.find(u => u.id === unitId - 1);
  const nextUnit = UNITS_CONFIG.find(u => u.id === unitId + 1);

  if (prevBtn) {
    if (prevUnit) {
      prevBtn.href = `unit.html?unit=${prevUnit.id}`;
      prevBtn.textContent = `← Unit ${prevUnit.id}`;
      prevBtn.classList.remove('disabled');
    } else {
      prevBtn.classList.add('disabled');
      prevBtn.textContent = '← Prev Unit';
    }
  }

  if (nextBtn) {
    if (nextUnit) {
      nextBtn.href = `unit.html?unit=${nextUnit.id}`;
      nextBtn.textContent = `Unit ${nextUnit.id} →`;
      nextBtn.classList.remove('disabled');
    } else {
      nextBtn.classList.add('disabled');
      nextBtn.textContent = 'Next Unit →';
    }
  }
}

/* ─── RENDER QUESTIONS ─── */
function renderQuestions(questions, unitCfg, unitId, currentQId) {
  const container = document.getElementById('questionList');
  if (!container) return;

  container.innerHTML = '';

  const currentQ = questions.find(q => q.id === currentQId);
  if (!currentQ) return;

  const currentIndex = questions.findIndex(q => q.id === currentQId);
  const prevQ = currentIndex > 0 ? questions[currentIndex - 1] : null;
  const nextQ = currentIndex < questions.length - 1 ? questions[currentIndex + 1] : null;

  const isReviewed = isQuestionReviewed(unitId, currentQId);

  // Info bar
  const infoBar = document.createElement('div');
  infoBar.className = 'unit-info-bar';
  infoBar.innerHTML = `
    <div class="info-left">
      <h1>Unit ${unitId}: ${escHtml(unitCfg.name)}</h1>
      <span class="q-badge">${currentIndex + 1} / ${questions.length}</span>
    </div>
    <div class="info-right">
      <button class="review-toggle ${isReviewed ? 'active' : ''}" 
              id="reviewToggle"
              data-unit="${unitId}" 
              data-q="${currentQId}">
        <span class="review-icon">${isReviewed ? '✓' : '○'}</span>
        <span class="review-label">${isReviewed ? 'Reviewed' : 'Mark for Review'}</span>
      </button>
      <span class="key-hint">R</span>
    </div>
  `;
  container.appendChild(infoBar);

  // Question card
  const card = createQuestionCard(currentQ, currentIndex + 1);
  container.appendChild(card);

  // Navigation
  const navContainer = document.createElement('div');
  navContainer.className = 'question-nav';

  const prevBtn = document.createElement('button');
  prevBtn.className = `nav-btn ${!prevQ ? 'disabled' : ''}`;
  prevBtn.innerHTML = '← Previous';
  prevBtn.disabled = !prevQ;
  if (prevQ) {
    prevBtn.addEventListener('click', () => {
      window.location.href = `unit.html?unit=${unitId}&q=${prevQ.id}`;
    });
  }

  const counter = document.createElement('span');
  counter.className = 'nav-counter';
  counter.textContent = `${currentIndex + 1} / ${questions.length}`;

  const nextBtn = document.createElement('button');
  nextBtn.className = `nav-btn ${!nextQ ? 'disabled' : ''}`;
  nextBtn.innerHTML = 'Next →';
  nextBtn.disabled = !nextQ;
  if (nextQ) {
    nextBtn.addEventListener('click', () => {
      window.location.href = `unit.html?unit=${unitId}&q=${nextQ.id}`;
    });
  }

  navContainer.appendChild(prevBtn);
  navContainer.appendChild(counter);
  navContainer.appendChild(nextBtn);
  container.appendChild(navContainer);

  // Review toggle
  const reviewBtn = document.getElementById('reviewToggle');
  if (reviewBtn) {
    reviewBtn.addEventListener('click', function() {
      const unitId = parseInt(this.dataset.unit);
      const qId = parseInt(this.dataset.q);
      const reviewed = toggleReview(unitId, qId);
      
      const icon = this.querySelector('.review-icon');
      const label = this.querySelector('.review-label');
      
      if (reviewed) {
        this.classList.add('active');
        icon.textContent = '✓';
        label.textContent = 'Reviewed';
      } else {
        this.classList.remove('active');
        icon.textContent = '○';
        label.textContent = 'Mark for Review';
      }
      
      updateReviewBadge();
      updateGridReviewStatus(unitId, qId);
    });
  }

  // Keyboard shortcut
  document.removeEventListener('keydown', handleKeyNavigation);
  document.addEventListener('keydown', handleKeyNavigation);

  function handleKeyNavigation(e) {
    if (e.key === 'ArrowLeft' && prevQ) {
      window.location.href = `unit.html?unit=${unitId}&q=${prevQ.id}`;
    } else if (e.key === 'ArrowRight' && nextQ) {
      window.location.href = `unit.html?unit=${unitId}&q=${nextQ.id}`;
    } else if (e.key === 'r' || e.key === 'R') {
      reviewBtn?.click();
      e.preventDefault();
    }
  }
}

function createQuestionCard(q, displayNum) {
  const title = q.title || `Question ${q.id}`;

  const card = document.createElement('div');
  card.className = 'q-card';
  card.id = `q-${q.id}`;

  card.innerHTML = `
    <div class="q-card-header">
      <span class="q-num">Q ${displayNum}</span>
      <span class="q-title">${escHtml(title)}</span>
    </div>

    <div class="q-image-wrap">
      <img
        alt="Question ${displayNum}: ${escHtml(title)}"
        src="${escHtml(q.question)}"
        onerror="this.style.display='none';this.nextElementSibling.classList.add('visible');"
      />
      <div class="img-error-msg">Image not found: ${escHtml(q.question)}</div>
    </div>

    <button class="solution-toggle" aria-expanded="false" aria-controls="sol-${q.id}">
      <span class="toggle-arrow">▶</span>
      Show Solution / FBD
    </button>

    <div class="solution-panel" id="sol-${q.id}" role="region">
      <div class="solution-inner">
        <div class="solution-label">Free Body Diagram · Solution</div>
        <img
          alt="Solution for Question ${displayNum}"
          src="${escHtml(q.answer)}"
          onerror="this.style.display='none';this.nextElementSibling.classList.add('visible');"
        />
        <div class="img-error-msg">Image not found: ${escHtml(q.answer)}</div>
      </div>
    </div>
  `;

  const btn = card.querySelector('.solution-toggle');
  const panel = card.querySelector('.solution-panel');
  btn.addEventListener('click', () => toggleSolution(btn, panel));

  return card;
}

function toggleSolution(btn, panel) {
  const isOpen = panel.classList.contains('open');
  if (isOpen) {
    panel.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = `<span class="toggle-arrow">▶</span> Show Solution / FBD`;
  } else {
    panel.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    btn.innerHTML = `<span class="toggle-arrow" style="transform:rotate(90deg)">▶</span> Hide Solution`;
  }
}

/* ─── GRID NAVIGATOR ─── */
function buildQuestionGrid(questions, currentQId) {
  const container = document.getElementById('questionGrid');
  if (!container) return;

  container.innerHTML = '';

  const grid = document.createElement('div');
  grid.className = 'q-grid';

  questions.forEach((q, idx) => {
    const btn = document.createElement('button');
    const reviewed = isQuestionReviewed(currentUnitId, q.id);
    
    btn.className = `q-grid-btn ${q.id === currentQId ? 'active' : ''} ${reviewed ? 'reviewed' : ''}`;
    btn.textContent = idx + 1;
    btn.title = `${q.title || `Question ${q.id}`}${reviewed ? ' ✓' : ''}`;
    
    btn.addEventListener('click', () => {
      window.location.href = `unit.html?unit=${currentUnitId}&q=${q.id}`;
    });
    
    grid.appendChild(btn);
  });

  container.appendChild(grid);
}

function updateGridReviewStatus(unitId, qId) {
  if (currentQuestions) {
    buildQuestionGrid(currentQuestions, qId);
  }
}

/* ─── REVIEW LIST MODAL ─── */
function showReviewed() {
  const reviewed = getReviewedList();
  
  if (reviewed.length === 0) {
    alert('No questions marked for review.\n\nClick "Mark for Review" on any question to add it here.');
    return;
  }
  
  const modal = document.createElement('div');
  modal.className = 'review-modal';
  modal.innerHTML = `
    <div class="review-modal-content">
      <div class="review-modal-header">
        <h2>📋 Review List</h2>
        <span class="review-count">${reviewed.length} questions</span>
        <button class="review-modal-close" onclick="this.closest('.review-modal').remove()">✕</button>
      </div>
      <div class="review-modal-body">
        ${reviewed.map((r, i) => `
          <div class="review-item">
            <div class="review-item-info">
              <span class="review-item-num">${i + 1}.</span>
              <span class="review-item-unit">Unit ${r.unitId}</span>
              <span class="review-item-title">${escHtml(r.unitName)}</span>
              <span class="review-item-q">Q${r.questionId}</span>
            </div>
            <div class="review-item-actions">
              <button onclick="window.location.href='unit.html?unit=${r.unitId}&q=${r.questionId}'">Open</button>
              <button class="remove" onclick="removeReview(${r.unitId}, ${r.questionId})">✕</button>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="review-modal-footer">
        <button class="clear-all" onclick="clearAllReviews()">Clear All</button>
        <button onclick="this.closest('.review-modal').remove()">Close</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

function removeReview(unitId, questionId) {
  const reviewed = getReviewedQuestions();
  const key = `${unitId}-${questionId}`;
  delete reviewed[key];
  saveReviewedQuestions(reviewed);
  updateReviewBadge();
  
  // Refresh modal
  showReviewed();
  if (currentQuestions) {
    const currentQ = new URLSearchParams(window.location.search).get('q');
    buildQuestionGrid(currentQuestions, parseInt(currentQ) || currentQuestions[0].id);
  }
}

/* ─── PROGRESS BAR ─── */
function initProgressBar() {
  const bar = document.getElementById('progressBar');
  if (!bar) return;

  const total = currentQuestions.length;
  const current = new URLSearchParams(window.location.search).get('q');
  const index = currentQuestions.findIndex(q => q.id === parseInt(current));

  if (index >= 0) {
    const pct = ((index + 1) / total) * 100;
    bar.style.width = `${pct}%`;
  }
}

/* ─── BACK TO TOP ─── */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  const container = document.getElementById('questionList');
  if (!container) return;

  container.addEventListener('scroll', () => {
    btn.classList.toggle('hidden', container.scrollTop < 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    container.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ─── UNIT SEARCH ─── */
function initUnitSearch(questions) {
  const input = document.getElementById('unitSearch');
  if (!input) return;

  let debounceTimer;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const query = input.value.trim().toLowerCase();
      const cards = document.querySelectorAll('.q-card');

      let visible = 0;
      cards.forEach(card => {
        const title = card.querySelector('.q-title')?.textContent?.toLowerCase() || '';
        const match = !query || title.includes(query);
        card.style.display = match ? '' : 'none';
        if (match) visible++;
      });

      let noResEl = document.getElementById('searchNoResults');
      if (!visible && query) {
        if (!noResEl) {
          noResEl = document.createElement('div');
          noResEl.id = 'searchNoResults';
          noResEl.className = 'search-no-results-inline';
          document.getElementById('questionList')?.appendChild(noResEl);
        }
        noResEl.textContent = `No questions found for "${query}"`;
      } else if (noResEl) {
        noResEl.remove();
      }
    }, 160);
  });
}

/* ─── THEME TOGGLE ─── */
function bindThemeToggle() {
  const btn = document.getElementById('themeToggle');
  if (btn) btn.addEventListener('click', toggleTheme);
}

/* ─── ERROR STATE ─── */
function renderError(heading, detail) {
  const container = document.getElementById('questionList');
  if (!container) return;
  container.innerHTML = `
    <div class="state-msg">
      <h3>⚠ ${escHtml(heading)}</h3>
      <p>${escHtml(detail)}</p>
    </div>
  `;
}

/* ─── UTILITIES ─── */
function escHtml(str) {
  if (typeof str !== 'string') str = String(str ?? '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}