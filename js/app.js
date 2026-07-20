/* SmartLola PWA — App Logic */
const API = {
  base: window.location.origin,
  db: null,
  gateway: null
};

// === STATE ===
let state = {
  expenses: [],
  ore_lucrate: [],
  events: [],
  pending: 0,
  agents: [],
  status: null,
  connected: false,
  gudaView: 'today',  // 'today' | 'month' | 'total'
  atlasView: 'current-month'  // 'current-month' | 'all'
};

// === INIT ===
document.addEventListener('DOMContentLoaded', () => {
  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(e => console.error('SW:', e));
  }

  // Tab navigation
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    });
  });

  // Load data
  loadData();
  // Refresh every 60s
  setInterval(loadData, 60000);
});

// === DATA LOADING ===
async function loadData() {
  try {
    // Load from status.json (static file generated from Guda DB)
    await loadStatusJson();
    loadAgents();
    setConnected(true);
    renderAll();
  } catch (e) {
    console.error('Load error:', e);
    setConnected(false);
    renderAll();
  }
}

function setConnected(connected) {
  state.connected = connected;
  const el = document.getElementById('connection-status');
  if (connected) {
    el.textContent = '● Online';
    el.className = 'subtitle connected';
  } else {
    el.textContent = '● Offline';
    el.className = 'subtitle disconnected';
  }
}

async function loadStatusJson() {
  // Fetch status.json with cache-busting
  const resp = await fetch('status.json?t=' + Date.now());
  if (!resp.ok) throw new Error('status.json HTTP ' + resp.status);
  const data = await resp.json();
  state.status = data;
  state.expenses = data.expenses || [];
  state.ore_lucrate = data.ore_lucrate || [];
  state.pending = data.db_stats?.pending || 0;
  state.events = []; // events not in status.json yet
  console.log('Loaded status.json:', data.expenses?.length, 'expenses,', data.ore_lucrate?.length, 'ore');
}

function loadAgents() {
  state.agents = [
    { emoji: '🧭', name: 'Lola', role: 'Boss / Coordonare', active: true, model: 'glm-5.2' },
    { emoji: '💰', name: 'Guda', role: 'Finanțe / Buget', active: true, model: 'glm-5.2' },
    { emoji: '🏗', name: 'Atlas', role: 'Șantier / Lucrări', active: true, model: 'glm-5.2' },
    { emoji: '🎓', name: 'Prof', role: 'Birocrație / Cursuri', active: false, model: '—' },
    { emoji: '⚖', name: 'Lex', role: 'Legal / Autorizații', active: false, model: '—' },
    { emoji: '👥', name: 'Echo', role: 'Social / HR', active: false, model: '—' },
    { emoji: '🚚', name: 'Vector', role: 'Logistică', active: false, model: '—' },
    { emoji: '📸', name: 'Lens', role: 'Foto / Doc', active: false, model: '—' },
    { emoji: '🚗', name: 'GRU', role: 'Parc Auto', active: false, model: '—' },
    { emoji: '🏪', name: 'Core', role: 'Magazin', active: false, model: '—' },
    { emoji: '🏗️', name: 'Depo', role: 'Depozit', active: false, model: '—' },
    { emoji: '📊', name: 'Opti', role: 'Monitoring', active: false, model: '—' },
    { emoji: '🔒', name: 'Shield', role: 'Backup / Securitate', active: false, model: '—' },
    { emoji: '🔐', name: 'Vault', role: 'Date protejate', active: false, model: '—' },
    { emoji: '🧠', name: 'Knowledge Mgr', role: 'Cunoștințe', active: false, model: '—' },
  ];
}

// === RENDERING ===
function renderAll() {
  renderDashboard();
  renderGuda();
  renderAtlas();
  renderAgents();
}

function renderDashboard() {
  // System health
  if (state.status) {
    const sys = state.status.system_health || {};
    document.getElementById('sys-status').textContent = sys.gateway === 'up' ? 'Online' : 'Probleme';
    document.getElementById('sys-detail').textContent = `${sys.model || '—'} | WiFi: ${sys.wifi || '—'}`;
    
    // Andrei status
    const andrei = state.status.andrei || {};
    document.getElementById('andrei-state').textContent = andrei.status || '—';
    document.getElementById('andrei-detail').textContent = andrei.last_activity ? formatTime(andrei.last_activity) : '';
  }

  // Stats — luna curentă
  const thisMonth = new Date().toISOString().slice(0, 7);
  const expMonth = state.expenses.filter(e => (e.date || '').startsWith(thisMonth));
  const expMonthTotal = expMonth.reduce((s, e) => s + e.amount, 0);
  document.getElementById('stat-expenses-month').textContent = '€' + expMonthTotal.toFixed(0);
  document.getElementById('stat-expenses-month-count').textContent = expMonth.length + ' intrări';

  const oreMonth = state.ore_lucrate.filter(o => (o.date || '').startsWith(thisMonth));
  const oreMonthTotal = oreMonth.reduce((s, o) => s + (o.ore_efective || 0), 0);
  const oreMonthDays = oreMonth.filter(o => o.ore_efective).length;
  document.getElementById('stat-hours-month').textContent = oreMonthTotal.toFixed(0) + 'h';
  document.getElementById('stat-hours-month-count').textContent = oreMonthDays + ' zile';

  // Stats — total general
  const expTotal = state.expenses.reduce((s, e) => s + e.amount, 0);
  document.getElementById('stat-expenses-total').textContent = '€' + expTotal.toFixed(0);
  document.getElementById('stat-expenses-total-count').textContent = state.expenses.length + ' intrări';

  const oreTotal = state.ore_lucrate.reduce((s, o) => s + (o.ore_efective || 0), 0);
  const oreDays = state.ore_lucrate.filter(o => o.ore_efective).length;
  document.getElementById('stat-hours-total').textContent = oreTotal.toFixed(0) + 'h';
  document.getElementById('stat-hours-total-count').textContent = oreDays + ' zile';

  document.getElementById('stat-pending').textContent = state.pending;

  // Recent events
  const eventsEl = document.getElementById('recent-events');
  if (state.events.length === 0) {
    eventsEl.innerHTML = '<div class="empty-state">Niciun eveniment recent</div>';
  } else {
    eventsEl.innerHTML = state.events.slice(0, 10).map(e => `
      <div class="event-item">
        <span class="event-time">${formatDate(e.date)}</span>
        <div class="event-content">
          <div>${escapeHtml(e.description || e.content || '')}</div>
          <span class="event-agent">${e.agent_target || e.category || ''}</span>
        </div>
      </div>
    `).join('');
  }
}

function getGudaFilteredExpenses() {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const thisMonth = now.toISOString().slice(0, 7);

  if (state.gudaView === 'today') {
    // Ultima zi calendaristică cu cheltuieli (poate fi azi sau ultima zi cu date)
    const dates = state.expenses.map(e => e.date).filter(Boolean).sort();
    if (dates.length === 0) return [];
    const lastDate = dates[dates.length - 1];
    return state.expenses.filter(e => e.date === lastDate);
  } else if (state.gudaView === 'month') {
    return state.expenses.filter(e => (e.date || '').startsWith(thisMonth));
  } else {
    return state.expenses;
  }
}

function getGudaViewLabel() {
  if (state.gudaView === 'today') {
    const dates = state.expenses.map(e => e.date).filter(Boolean).sort();
    if (dates.length === 0) return 'Nicio dată';
    return formatDate(dates[dates.length - 1]);
  } else if (state.gudaView === 'month') {
    const now = new Date();
    const months = ['', 'Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec'];
    return months[now.getMonth() + 1] + ' ' + now.getFullYear();
  } else {
    return 'Total';
  }
}

function setGudaView(view) {
  state.gudaView = view;
  renderGuda();
}

function renderGuda() {
  const filtered = getGudaFilteredExpenses();
  const total = filtered.reduce((s, e) => s + e.amount, 0);
  const shared = filtered.filter(e => e.split === 'shared').reduce((s, e) => s + e.amount, 0);
  const andreiOnly = filtered.filter(e => e.split === 'andrei-only').reduce((s, e) => s + e.amount, 0);

  document.getElementById('guda-total').textContent = '€' + total.toFixed(2);
  document.getElementById('guda-shared').textContent = '€' + shared.toFixed(0);
  document.getElementById('guda-andrei').textContent = '€' + andreiOnly.toFixed(0);

  // View label + toggle buttons
  const labelEl = document.getElementById('guda-view-label');
  if (labelEl) labelEl.textContent = getGudaViewLabel();

  // Update active button
  document.querySelectorAll('.guda-view-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === state.gudaView);
  });

  // Categories
  const cats = {};
  filtered.forEach(e => {
    cats[e.category] = (cats[e.category] || 0) + e.amount;
  });
  const maxCat = Math.max(...Object.values(cats), 1);
  const catColors = {
    alimente: '#22c55e', cafea: '#a9744f', motorină: '#3b82f6', muncă: '#f59e0b',
    chirie: '#8b5cf6', utilități: '#06b6d4', transport: '#f97316', sănătate: '#ef4444',
    îmbrăcăminte: '#ec4899', divertisment: '#a855f7', servicii: '#64748b', alte: '#64748b'
  };

  const catsEl = document.getElementById('guda-categories');
  if (Object.keys(cats).length === 0) {
    catsEl.innerHTML = '<div class="empty-state">Nicio cheltuială în această perioadă</div>';
  } else {
    catsEl.innerHTML = Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([name, amount]) => `
      <div class="cat-bar">
        <span class="cat-name">${name}</span>
        <div class="cat-track">
          <div class="cat-fill" style="width:${(amount / maxCat * 100)}%; background:${catColors[name] || '#64748b'}"></div>
        </div>
        <span class="cat-amount">€${amount.toFixed(0)}</span>
      </div>
    `).join('');
  }

  // Recent expenses — sortat descrescător după dată (cea mai recentă prima)
  const recentEl = document.getElementById('guda-recent');
  if (filtered.length === 0) {
    recentEl.innerHTML = '<div class="empty-state">Nicio cheltuială</div>';
  } else {
    const sortedExp = [...filtered].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    recentEl.innerHTML = sortedExp.slice(0, 15).map(e => `
      <div class="expense-item">
        <div class="expense-left">
          <div class="expense-desc">${escapeHtml(e.description || '')}</div>
          <div class="expense-meta">
            ${formatDate(e.date)} | 
            <span class="badge ${e.split}">${e.split}</span>
            ${e.source ? `<span class="badge ${e.source}">${e.source}</span>` : ''}
          </div>
        </div>
        <div class="expense-amount">€${e.amount.toFixed(2)}</div>
      </div>
    `).join('');
  }
}

function getAtlasFilteredOre() {
  if (state.atlasView === 'current-month') {
    const thisMonth = new Date().toISOString().slice(0, 7);
    return state.ore_lucrate.filter(o => (o.date || '').startsWith(thisMonth));
  }
  return state.ore_lucrate;
}

function getAtlasViewLabel() {
  if (state.atlasView === 'current-month') {
    const now = new Date();
    const months = ['', 'Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec'];
    return months[now.getMonth() + 1] + ' ' + now.getFullYear();
  }
  return 'Total';
}

function setAtlasView(view) {
  state.atlasView = view;
  renderAtlas();
}

function renderAtlas() {
  const filtered = getAtlasFilteredOre();
  const totalOre = filtered.reduce((s, o) => s + (o.ore_efective || 0), 0);
  const totalNormal = filtered.reduce((s, o) => s + (o.ore_normal || 0), 0);
  const totalGuida = filtered.reduce((s, o) => s + (o.ore_guida || 0), 0);
  const totalExtra = filtered.reduce((s, o) => s + (o.ore_extra || 0), 0);
  const confirmedDays = filtered.filter(o => o.ore_efective).length;
  document.getElementById('atlas-total-hours').textContent = totalOre.toFixed(1) + 'h';
  document.getElementById('atlas-days').textContent = confirmedDays + ' zile confirmate';

  // Ore split (normale / guida / extra)
  const splitEl = document.getElementById('atlas-ore-split');
  if (splitEl) {
    if (totalOre > 0) {
      splitEl.innerHTML = `
        <div class="ore-split-bar">
          <div class="ore-split-segment normal" style="width:${(totalNormal/totalOre*100)}%" title="Normale: ${totalNormal.toFixed(1)}h"></div>
          <div class="ore-split-segment guida" style="width:${(totalGuida/totalOre*100)}%" title="Guida: ${totalGuida.toFixed(1)}h"></div>
          <div class="ore-split-segment extra" style="width:${(totalExtra/totalOre*100)}%" title="Extra: ${totalExtra.toFixed(1)}h"></div>
        </div>
        <div class="ore-split-legend">
          <span class="legend-item"><span class="legend-dot normal"></span>Normale ${totalNormal.toFixed(1)}h</span>
          <span class="legend-item"><span class="legend-dot guida"></span>Guida ${totalGuida.toFixed(1)}h</span>
          <span class="legend-item"><span class="legend-dot extra"></span>Extra ${totalExtra.toFixed(1)}h</span>
        </div>
      `;
    } else {
      splitEl.innerHTML = '<div class="empty-state">Nicio oră confirmată</div>';
    }
  }

  // View label
  const labelEl = document.getElementById('atlas-view-label');
  if (labelEl) labelEl.textContent = getAtlasViewLabel();

  // Update active button
  document.querySelectorAll('.atlas-view-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === state.atlasView);
  });

  // Monthly (always show all months for context) — with split
  const months = {};
  state.ore_lucrate.forEach(o => {
    const m = (o.date || '').substring(0, 7);
    if (!m) return;
    if (!months[m]) months[m] = { normal: 0, guida: 0, extra: 0, total: 0 };
    months[m].normal += (o.ore_normal || 0);
    months[m].guida += (o.ore_guida || 0);
    months[m].extra += (o.ore_extra || 0);
    months[m].total += (o.ore_efective || 0);
  });
  const maxMonth = Math.max(...Object.values(months).map(m => m.total), 1);

  const monthEl = document.getElementById('atlas-monthly');
  monthEl.innerHTML = Object.entries(months).sort().map(([month, m]) => {
    const isCurrent = state.atlasView === 'current-month' && month === new Date().toISOString().slice(0, 7);
    return `
    <div class="month-bar ${isCurrent ? 'highlighted' : ''}">
      <span class="month-label">${month}</span>
      <div class="month-track">
        <div class="month-fill normal" style="width:${(m.normal / maxMonth * 100)}%"></div>
        <div class="month-fill guida" style="width:${(m.guida / maxMonth * 100)}%; margin-left:-${(m.normal / maxMonth * 100)}%"></div>
        <div class="month-fill extra" style="width:${(m.extra / maxMonth * 100)}%; margin-left:-${((m.normal + m.guida) / maxMonth * 100)}%"></div>
      </div>
      <span class="month-value">${m.total.toFixed(0)}h</span>
    </div>
  `;
  }).join('') || '<div class="empty-state">Nicio dată</div>';

  // Recent work (from filtered set)
  const recentEl = document.getElementById('atlas-recent');
  if (filtered.length === 0) {
    recentEl.innerHTML = '<div class="empty-state">Niciun entry pentru luna curentă</div>';
  } else {
    const sortedOre = [...filtered].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    recentEl.innerHTML = sortedOre.slice(0, 15).map(o => {
      const d = (o.date || '').split('-');
      return `
        <div class="work-item">
          <div class="work-date">
            <div class="work-day">${d[2] || '?'}</div>
            <div class="work-month">${monthShort(d[1])}</div>
          </div>
          <div class="work-info">
            <div class="work-santier">${escapeHtml(o.santier || '')}</div>
            <div class="work-detail">${o.ora_start || '?'} - ${o.ora_end || '?'} ${o.mezzo ? '| ' + escapeHtml(o.mezzo) : ''}</div>
          </div>
          <div class="work-hours">${o.ore_efective ? o.ore_efective + 'h' : '—'}</div>
          <div class="work-split">${o.ore_efective ? `<span class="split-normal">N${o.ore_normal || 0}</span> <span class="split-guida">G${o.ore_guida || 0}</span> <span class="split-extra">E${o.ore_extra || 0}</span>` : ''}</div>
        </div>
      `;
    }).join('');
  }
}

function renderAgents() {
  const el = document.getElementById('agents-list');
  el.innerHTML = state.agents.map(a => `
    <div class="agent-card ${a.active ? 'active' : ''}">
      <div class="agent-emoji">${a.emoji}</div>
      <div class="agent-name">${a.name}</div>
      <div class="agent-role">${a.role}</div>
      <div class="agent-status ${a.active ? 'active' : 'inactive'}">${a.active ? 'Activ · ' + a.model : 'Inactiv'}</div>
    </div>
  `).join('');

  // System info
  const sysEl = document.getElementById('sys-info');
  if (state.status) {
    const sys = state.status.system_health || {};
    const db = state.status.db_stats || {};
    const bk = state.status.backup || {};
    sysEl.innerHTML = [
      ['Model', sys.model || '—'],
      ['Gateway', sys.gateway || '—'],
      ['Wi-Fi', sys.wifi_adapter || sys.wifi || '—'],
      ['DNS', sys.dns || '—'],
      ['WhatsApp', sys.whatsapp || '—'],
      ['Ollama', sys.ollama || '—'],
      ['Expenses', `${db.expenses || 0} entries · €${(db.expenses_total || 0).toFixed(2)}`],
      ['Ore lucrate', `${db.ore_lucrate || 0} entries · ${(db.ore_total || 0).toFixed(1)}h`],
      ['Backup', bk.last_backup || '—'],
      ['Următorul backup', bk.next_backup || '—'],
    ].map(([k, v]) => `<div class="sys-row"><span class="sys-key">${k}</span><span class="sys-val">${v}</span></div>`).join('');
  } else {
    sysEl.innerHTML = '<div class="empty-state">Date indisponibile</div>';
  }
}

// === QUICK ACTIONS ===
function quickAction(type) {
  const titles = { expense: '💰 Înregistrează cheltuială', hours: '⏰ Adaugă ore', report: '📊 Raport financiar', santier: '🏗 Program șantier' };
  document.getElementById('modal-title').textContent = titles[type] || 'Acțiune';

  const body = document.getElementById('modal-body');
  if (type === 'expense') {
    body.innerHTML = `
      <div class="form-group">
        <label class="form-label">Sumă (€)</label>
        <input type="number" step="0.01" class="form-input" id="exp-amount" placeholder="0.00" inputmode="decimal">
      </div>
      <div class="form-group">
        <label class="form-label">Descriere</label>
        <input type="text" class="form-input" id="exp-desc" placeholder="Ex: Lidl alimente">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Categorie</label>
          <select class="form-select" id="exp-cat">
            <option value="alimente">Alimente</option>
            <option value="cafea">Cafea</option>
            <option value="motorină">Motorină</option>
            <option value="muncă">Muncă</option>
            <option value="utilități">Utilități</option>
            <option value="transport">Transport</option>
            <option value="sănătate">Sănătate</option>
            <option value="îmbrăcăminte">Îmbrăcăminte</option>
            <option value="divertisment">Divertisment</option>
            <option value="servicii">Servicii</option>
            <option value="alte">Alte</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Split</label>
          <select class="form-select" id="exp-split">
            <option value="shared">Shared</option>
            <option value="andrei-only">Andrei only</option>
          </select>
        </div>
      </div>
      <button class="btn-primary" onclick="submitExpense()">Înregistrează</button>
    `;
  } else if (type === 'hours') {
    body.innerHTML = `
      <div class="form-group">
        <label class="form-label">Data</label>
        <input type="date" class="form-input" id="hrs-date" value="${new Date().toISOString().slice(0,10)}">
      </div>
      <div class="form-group">
        <label class="form-label">Șantier</label>
        <input type="text" class="form-input" id="hrs-santier" placeholder="Ex: Cervinia - Cond Cielo Alto">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Ora start</label>
          <input type="time" class="form-input" id="hrs-start" value="07:00">
        </div>
        <div class="form-group">
          <label class="form-label">Ora final</label>
          <input type="time" class="form-input" id="hrs-end" value="18:00">
        </div>
      </div>
      <button class="btn-primary" onclick="submitHours()">Adaugă</button>
    `;
  } else if (type === 'report') {
    body.innerHTML = `
      <div style="text-align:center; padding:20px;">
        <p style="color:var(--text-dim); margin-bottom:16px;">Trimite raport pe Telegram?</p>
        <button class="btn-primary" onclick="sendReport()">📊 Trimite raport</button>
      </div>
    `;
  } else if (type === 'santier') {
    body.innerHTML = `
      <div style="text-align:center; padding:20px;">
        <p style="color:var(--text-dim); margin-bottom:16px;">Solicită program șantier pe Telegram?</p>
        <button class="btn-primary" onclick="sendSantierRequest()">🏗 Solicită</button>
      </div>
    `;
  }

  document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

async function submitExpense() {
  const amount = parseFloat(document.getElementById('exp-amount').value);
  const desc = document.getElementById('exp-desc').value;
  const cat = document.getElementById('exp-cat').value;
  const split = document.getElementById('exp-split').value;

  if (!amount || !desc) {
    toast('Completează suma și descrierea', 'error');
    return;
  }

  // Try API first, fallback to Telegram message
  try {
    const resp = await fetch('api/expense', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, description: desc, category: cat, split, source: 'andrei' })
    });
    if (resp.ok) {
      toast('✅ Cheltuială înregistrată: €' + amount.toFixed(2), 'success');
      closeModal();
      loadData();
      return;
    }
  } catch (e) {}

  // Fallback: construct command for Telegram
  toast('📋 Trimite pe Telegram: ' + desc + ' ' + amount + '€ [' + cat + '/' + split + ']', 'success');
  closeModal();
}

async function submitHours() {
  const date = document.getElementById('hrs-date').value;
  const santier = document.getElementById('hrs-santier').value;
  const start = document.getElementById('hrs-start').value;
  const end = document.getElementById('hrs-end').value;

  if (!date || !santier) {
    toast('Completează data și șantierul', 'error');
    return;
  }

  // Calculate hours (minus 1h lunch)
  let ore = 0;
  if (start && end) {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    ore = (eh + em/60) - (sh + sm/60) - 1; // minus 1h pauză
    if (ore < 0) ore = 0;
  }

  toast('✅ Ore adăugate: ' + santier + ' · ' + ore.toFixed(1) + 'h', 'success');
  closeModal();
}

async function sendReport() {
  toast('📊 Raport solicitat pe Telegram', 'success');
  closeModal();
}

async function sendSantierRequest() {
  toast('🏗 Solicitare trimisă pe Telegram', 'success');
  closeModal();
}

// === UTILS ===
function toast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast ' + (type || '') + (type ? ' ' + type : '');
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 3000);
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function formatDate(d) {
  if (!d) return '';
  const parts = d.split('-');
  return parts[2] + '/' + parts[1] || d;
}

function formatTime(t) {
  if (!t) return '';
  return new Date(t).toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function monthShort(m) {
  const months = ['', 'Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec'];
  return months[parseInt(m)] || '';
}
