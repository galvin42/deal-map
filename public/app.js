const form        = document.getElementById('generate-form');
const btnText     = document.querySelector('.btn-text');
const btnSpinner  = document.querySelector('.btn-spinner');
const generateBtn = document.getElementById('generate-btn');
const errorMsg    = document.getElementById('error-msg');
const inputScreen = document.getElementById('input-screen');
const mapScreen   = document.getElementById('map-screen');
const newMapBtn   = document.getElementById('new-map-btn');
const printBtn    = document.getElementById('print-btn');

// ── Form submit ──────────────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const companyName       = document.getElementById('company-name').value.trim();
  const productDescription = document.getElementById('product-desc').value.trim();

  setLoading(true);
  hideError();

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyName, productDescription }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Unknown error');
    }

    renderDealMap(data);
    showMapScreen();
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
});

// ── Render ───────────────────────────────────────────────
function renderDealMap(data) {
  // Header
  document.getElementById('map-company-name').textContent = data.companyName;
  document.getElementById('map-date').textContent = formatDate(data.generatedAt);

  // Exec Priorities
  renderList('list-exec-items', data.executivePriorities?.items);
  renderNote('note-exec', data.executivePriorities?.note);

  // Financial Metrics
  renderList('list-fin-opp', data.financialMetrics?.opportunities);
  renderList('list-fin-risk', data.financialMetrics?.risks);
  renderNote('note-financial', data.financialMetrics?.note);

  // Challenges & Trends
  renderList('list-challenges', data.challengesTrends?.risks);
  renderNote('note-challenges', data.challengesTrends?.note);

  // Strategic Initiatives
  renderList('list-initiatives', data.strategicInitiatives?.items);
  renderNote('note-initiatives', data.strategicInitiatives?.note);

  // Desired Outcomes
  renderList('list-outcomes', data.desiredOutcomes?.items);
  renderNote('note-outcomes', data.desiredOutcomes?.note);

  // Solution Fit
  renderList('list-solution', data.solutionFit?.connections);
  renderNote('note-solution', data.solutionFit?.note);

  // Next Moves
  renderList('list-next-gaps', data.nextMoves?.gaps);
  renderList('list-next-actions', data.nextMoves?.actions);
  renderNote('note-next', data.nextMoves?.note);
}

function renderList(id, items) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = '';

  if (!items || items.length === 0) {
    el.innerHTML = '<li>No data</li>';
    return;
  }

  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    el.appendChild(li);
  });
}

function renderNote(id, note) {
  const el = document.getElementById(id);
  if (!el || !note) return;
  el.textContent = note;
}

// ── Navigation ───────────────────────────────────────────
function showMapScreen() {
  inputScreen.hidden = true;
  mapScreen.hidden = false;
  window.scrollTo(0, 0);
}

newMapBtn.addEventListener('click', () => {
  mapScreen.hidden = true;
  inputScreen.hidden = false;
  form.reset();
  window.scrollTo(0, 0);
});

printBtn.addEventListener('click', () => {
  window.print();
});

// ── UI helpers ───────────────────────────────────────────
function setLoading(loading) {
  generateBtn.disabled = loading;
  btnText.hidden = loading;
  btnSpinner.hidden = !loading;
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.hidden = false;
}

function hideError() {
  errorMsg.hidden = true;
  errorMsg.textContent = '';
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
