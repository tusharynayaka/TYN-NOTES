/* ═══════════════════════════════════════════════════════════
   Mechanical Statics Notes — app.js
   JSON-driven, fully offline, no frameworks.
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────
   CONFIGURATION
   To add a new unit, add an entry here.
   No other code changes needed.
   ───────────────────────────────────────────── */
const UNITS_CONFIG = [
  { id: 1, name: 'Force Systems & Resultants',       file: 'data/unit1.json' },
  { id: 2, name: 'Equilibrium of Rigid Bodies',      file: 'data/unit2.json' },
  { id: 3, name: 'Analysis of Structures',           file: 'data/unit3.json' },
  { id: 4, name: 'Friction & Virtual Work',          file: 'data/unit4.json' },
  // Add more units here:
  // { id: 5, name: 'Centroids & Distributed Loads', file: 'data/unit5.json' },
];

/* ─────────────────────────────────────────────
   THEME
   ───────────────────────────────────────────── */
function initTheme() {
  const saved = localStorage.getItem('statics-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next    = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('statics-theme', next);
}

/* ─────────────────────────────────────────────
   JSON LOADER — fetch with graceful fallback
   ───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   HOME PAGE
   ───────────────────────────────────────────── */
async function initHome() {
  initTheme();
  bindThemeToggle();

  // Load all units in parallel for question counts
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
  if (qEl) animateCount(qEl, total);
  if (uEl) animateCount(uEl, UNITS_CONFIG.length);
}

function animateCount(el, target) {
  let start = 0;
  const dur  = 800;
  const step = 16;
  const inc  = target / (dur / step);
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

  results.forEach(({ unit, data }) => {
    const count = data ? data.length : 0;
    const card  = document.createElement('a');
    card.href   = `unit.html?unit=${unit.id}`;
    card.className = 'unit-card';
    card.setAttribute('aria-label', `Open Unit ${unit.id}: ${unit.name}`);

    card.innerHTML = `
      <div class="unit-card-number">Unit ${unit.id}</div>
      <div class="unit-card-name">${escHtml(unit.name)}</div>
      <div class="unit-card-meta">
        <div class="unit-card-count">
          <strong>${count}</strong>
          question${count !== 1 ? 's' : ''}
        </div>
        <div class="unit-card-arrow">→</div>
      </div>
    `;
    grid.appendChild(card);
  });
}

/* ─────────────────────────────────────────────
   GLOBAL SEARCH (home page)
   ───────────────────────────────────────────── */
function initGlobalSearch(results) {
  const input    = document.getElementById('globalSearch');
  const dropdown = document.getElementById('searchDropdown');
  if (!input || !dropdown) return;

  // Build flat index
  const index = [];
  results.forEach(({ unit, data }) => {
    if (!data) return;
    data.forEach(q => {
      index.push({
        unitId:   unit.id,
        unitName: unit.name,
        qId:      q.id,
        title:    (q.title || `Question ${q.id}`).toLowerCase(),
      });
    });
  });

  let debounceTimer;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => runGlobalSearch(input.value, index, dropdown), 180);
  });

  // Close on outside click
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
      <span class="sri-num">Question ${m.qId}</span>
    `;
    el.addEventListener('click', () => {
      window.location.href = `unit.html?unit=${m.unitId}#q-${m.qId}`;
    });
    dropdown.appendChild(el);
  });

  dropdown.classList.remove('hidden');
}

/* ─────────────────────────────────────────────
   UNIT PAGE
   ───────────────────────────────────────────── */
async function initUnit() {
  initTheme();
  bindThemeToggle();

  const unitId   = getUnitIdFromURL();
  const unitCfg  = UNITS_CONFIG.find(u => u.id === unitId);

  if (!unitCfg) {
    renderError('Unit not found', `Unit ${unitId} does not exist in UNITS_CONFIG.`);
    return;
  }

  // Set page title
  updatePageTitle(unitId, unitCfg.name);

  // Set prev/next navigation
  setPrevNext(unitId);

  // Load questions
  const questions = await loadJSON(unitCfg.file);
  if (!questions || !questions.length) {
    renderError('No questions found', `Could not load ${unitCfg.file} or the file is empty.`);
    return;
  }

  renderQuestions(questions, unitCfg, unitId);
  buildSidebar(questions);
  initUnitSearch(questions);
  initScrollSpy();
  initProgressBar();
  initBackToTop();
  initSidebarToggle();

  // Scroll to anchor after render
  setTimeout(() => {
    const hash = window.location.hash;
    if (hash) {
      const target = document.querySelector(hash);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 150);
}

function getUnitIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get('unit'), 10) || 1;
}

function updatePageTitle(unitId, unitName) {
  document.title = `Unit ${unitId} – ${unitName} | Mechanical Statics`;
  const titleEl = document.getElementById('unitPageTitle');
  const subEl   = document.getElementById('unitPageSub');
  if (titleEl) titleEl.textContent = `Unit ${unitId}: ${unitName}`;
  if (subEl)   subEl.textContent   = 'Mechanical Statics';
}

function setPrevNext(unitId) {
  const prevBtn = document.getElementById('prevUnitBtn');
  const nextBtn = document.getElementById('nextUnitBtn');
  const prevUnit = UNITS_CONFIG.find(u => u.id === unitId - 1);
  const nextUnit = UNITS_CONFIG.find(u => u.id === unitId + 1);

  if (prevBtn) {
    if (prevUnit) {
      prevBtn.href = `unit.html?unit=${prevUnit.id}`;
      prevBtn.textContent = `← Unit ${prevUnit.id}`;
    } else {
      prevBtn.classList.add('disabled');
      prevBtn.textContent = '← Prev Unit';
    }
  }

  if (nextBtn) {
    if (nextUnit) {
      nextBtn.href = `unit.html?unit=${nextUnit.id}`;
      nextBtn.textContent = `Unit ${nextUnit.id} →`;
    } else {
      nextBtn.classList.add('disabled');
      nextBtn.textContent = 'Next Unit →';
    }
  }
}

/* ─────────────────────────────────────────────
   QUESTION RENDERING
   ───────────────────────────────────────────── */
function renderQuestions(questions, unitCfg, unitId) {
  const container = document.getElementById('questionList');
  if (!container) return;

  // Info bar
  const infoBar = document.createElement('div');
  infoBar.className = 'unit-info-bar';
  infoBar.innerHTML = `
    <h1>Unit ${unitId}: ${escHtml(unitCfg.name)}</h1>
    <span class="q-badge">${questions.length} questions</span>
  `;
  container.appendChild(infoBar);

  // Question cards
  const fragment = document.createDocumentFragment();
  questions.forEach((q, idx) => {
    const card = createQuestionCard(q, idx + 1);
    fragment.appendChild(card);
  });
  container.appendChild(fragment);
}

function createQuestionCard(q, displayNum) {
  const title = q.title || `Question ${q.id}`;

  const card = document.createElement('div');
  card.className  = 'q-card';
  card.id         = `q-${q.id}`;
  card.dataset.qid = q.id;
  card.dataset.title = title.toLowerCase();

  card.innerHTML = `
    <!-- Header -->
    <div class="q-card-header">
      <span class="q-num">Q ${displayNum}</span>
      <span class="q-title">${escHtml(title)}</span>
    </div>

    <!-- Question image -->
    <div class="q-image-wrap">
      <img
        loading="lazy"
        alt="Question ${displayNum}: ${escHtml(title)}"
        data-src="${escHtml(q.question)}"
        src=""
        class="lazy-img"
      />
      <div class="img-error-msg">Image not found: ${escHtml(q.question)}</div>
    </div>

    <!-- Solution toggle -->
    <button class="solution-toggle" aria-expanded="false" aria-controls="sol-${q.id}">
      <span class="toggle-arrow">▶</span>
      Show Solution / FBD
    </button>

    <!-- Solution panel -->
    <div class="solution-panel" id="sol-${q.id}" role="region">
      <div class="solution-inner">
        <div class="solution-label">Free Body Diagram · Solution</div>
        <img
          loading="lazy"
          alt="Solution for Question ${displayNum}"
          data-src="${escHtml(q.answer)}"
          src=""
          class="lazy-img sol-img"
        />
        <div class="img-error-msg">Image not found: ${escHtml(q.answer)}</div>
      </div>
    </div>
  `;

  // Bind solution toggle
  const btn    = card.querySelector('.solution-toggle');
  const panel  = card.querySelector('.solution-panel');
  btn.addEventListener('click', () => toggleSolution(btn, panel));

  // Handle image errors
  card.querySelectorAll('.lazy-img').forEach(img => {
    img.addEventListener('error', handleImgError);
  });

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
    // Load lazy images inside panel when opened
    panel.querySelectorAll('img[data-src]').forEach(loadLazy);
  }
}

function handleImgError(e) {
  const img      = e.target;
  const errMsg   = img.nextElementSibling;
  img.style.display = 'none';
  if (errMsg && errMsg.classList.contains('img-error-msg')) {
    errMsg.classList.add('visible');
  }
}

/* ─────────────────────────────────────────────
   LAZY IMAGE LOADING (IntersectionObserver)
   ───────────────────────────────────────────── */
function initLazyImages() {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadLazy(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '300px' }); // preload 300px before visible

    document.querySelectorAll('img.lazy-img').forEach(img => {
      // Only observe question images (not solution images, those load on toggle)
      if (!img.classList.contains('sol-img')) {
        observer.observe(img);
      }
    });
  } else {
    // Fallback: load all immediately
    document.querySelectorAll('img.lazy-img:not(.sol-img)').forEach(loadLazy);
  }
}

function loadLazy(img) {
  if (img.dataset.src && !img.src.endsWith(img.dataset.src)) {
    img.src = img.dataset.src;
    delete img.dataset.src;
  }
}

// Call after DOM is ready on unit page
function initLazyAfterRender() {
  // Use rAF to ensure DOM is painted
  requestAnimationFrame(() => {
    requestAnimationFrame(initLazyImages);
  });
}

/* ─────────────────────────────────────────────
   SIDEBAR
   ───────────────────────────────────────────── */
function buildSidebar(questions) {
  const nav = document.getElementById('sidebarNav');
  if (!nav) return;

  const fragment = document.createDocumentFragment();
  questions.forEach((q, idx) => {
    const title   = q.title || `Question ${q.id}`;
    const link    = document.createElement('a');
    link.href     = `#q-${q.id}`;
    link.className = 'sidebar-link';
    link.dataset.qid = q.id;
    link.setAttribute('title', title);
    link.innerHTML = `
      <span class="sidebar-link-num">${idx + 1}</span>
      <span style="overflow:hidden;text-overflow:ellipsis">${escHtml(title)}</span>
    `;
    link.addEventListener('click', e => {
      e.preventDefault();
      const card = document.getElementById(`q-${q.id}`);
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Close mobile sidebar
      document.getElementById('sidebar')?.classList.remove('mobile-open');
    });
    fragment.appendChild(link);
  });
  nav.appendChild(fragment);

  initLazyAfterRender();
}

function initSidebarToggle() {
  const btn     = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  if (!btn || !sidebar) return;

  btn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    btn.title = sidebar.classList.contains('collapsed') ? 'Expand sidebar' : 'Collapse sidebar';
  });
}

/* ─────────────────────────────────────────────
   SCROLL SPY
   ───────────────────────────────────────────── */
function initScrollSpy() {
  const cards = document.querySelectorAll('.q-card');
  if (!cards.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const qid  = entry.target.dataset.qid;
        const link = document.querySelector(`.sidebar-link[data-qid="${qid}"]`);
        // Remove all active
        document.querySelectorAll('.sidebar-link.active').forEach(l => l.classList.remove('active'));
        if (link) {
          link.classList.add('active');
          // Auto-scroll sidebar to keep active link visible
          const nav = document.getElementById('sidebarNav');
          if (nav) {
            const linkTop    = link.offsetTop;
            const navScroll  = nav.scrollTop;
            const navHeight  = nav.clientHeight;
            if (linkTop < navScroll || linkTop > navScroll + navHeight - 40) {
              nav.scrollTop = linkTop - navHeight / 2;
            }
          }
        }
      }
    });
  }, { threshold: 0.2, rootMargin: `-${60}px 0px 0px 0px` });

  cards.forEach(card => observer.observe(card));
}

/* ─────────────────────────────────────────────
   READING PROGRESS BAR
   ───────────────────────────────────────────── */
function initProgressBar() {
  const bar  = document.getElementById('progressBar');
  const list = document.getElementById('questionList');
  if (!bar || !list) return;

  const update = () => {
    const total   = list.scrollHeight - list.clientHeight;
    const current = list.scrollTop;
    const pct     = total > 0 ? Math.round((current / total) * 100) : 0;
    bar.style.width = `${pct}%`;
  };

  list.addEventListener('scroll', update, { passive: true });
}

/* ─────────────────────────────────────────────
   BACK TO TOP
   ───────────────────────────────────────────── */
function initBackToTop() {
  const btn  = document.getElementById('backToTop');
  const list = document.getElementById('questionList');
  if (!btn || !list) return;

  list.addEventListener('scroll', () => {
    btn.classList.toggle('hidden', list.scrollTop < 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    list.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ─────────────────────────────────────────────
   UNIT PAGE SEARCH (filter cards inline)
   ───────────────────────────────────────────── */
function initUnitSearch(questions) {
  const input = document.getElementById('unitSearch');
  if (!input) return;

  let debounceTimer;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => filterQuestions(input.value), 160);
  });
}

function filterQuestions(query) {
  query = query.trim().toLowerCase();
  const cards   = document.querySelectorAll('.q-card');
  const noRes   = document.getElementById('searchNoResults');
  let   visible = 0;

  cards.forEach(card => {
    const title = card.dataset.title || '';
    const qid   = String(card.dataset.qid || '');
    const match = !query || title.includes(query) || qid.includes(query);
    card.classList.toggle('hidden-by-search', !match);
    if (match) visible++;
  });

  // Show/hide no-results message
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
}

/* ─────────────────────────────────────────────
   THEME TOGGLE (shared)
   ───────────────────────────────────────────── */
function bindThemeToggle() {
  const btn = document.getElementById('themeToggle');
  if (btn) btn.addEventListener('click', toggleTheme);
}

/* ─────────────────────────────────────────────
   ERROR STATE RENDERER
   ───────────────────────────────────────────── */
function renderError(heading, detail) {
  const container = document.getElementById('questionList');
  if (!container) return;
  container.innerHTML = `
    <div class="state-msg">
      <h3>⚠ ${escHtml(heading)}</h3>
      <p>${escHtml(detail)}</p>
      <p style="margin-top:8px;font-size:12px;opacity:.6">
        Make sure you are serving the project through a local server (e.g. Live Server in VS Code).
        Opening index.html directly as a file:// URL will block JSON fetches.
      </p>
    </div>
  `;
}

/* ─────────────────────────────────────────────
   UTILITIES
   ───────────────────────────────────────────── */
function escHtml(str) {
  if (typeof str !== 'string') str = String(str ?? '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
