/**
 * Tepkime Arenası - Uygulama ve Deney Motoru (app.js)
 * Yönerge (yonerge.docx) inceleme raporuna tam uyumlu durum yönetimi,
 * etkileşim akışı, sürükle-bırak, Johnstone üçgeni ve laboratuvar rehberi.
 */

(function(window) {
  'use strict';

  /* ----------------- 1. UYGULAMA DURUMU (APPLICATION STATE) ----------------- */
  var S = {
    screen: 'menu',
    isFilling: false,
    reagentPanelCollapsed: false,
    labSettingsOpen: false,
    labView: 'wide',
    labLighting: 'light',
    tableColor: '#3d4547',
    searchQuery: '',
    categoryFilter: 'all',
    selectedSlot1: null,
    selectedSlot2: null,
    activeReaction: null,
    prediction: [],
    labStep: 'predict', // predict | ready | pouring | reacting | observed
    poured: false,
    currentTemp: 22.0,
    manualTypeInput: '',
    manualTypeSelections: [],
    typeEvaluation: null,
    typeChecked: false,
    typeCorrect: false,
    cameraTab: 'reactants', // reactants | products
    reportTab: null, // null (auto) | 'analysis' | 'quiz' | 'split'
    resumeScreen: null, // lab | card | micro | pool
    resumeLabStep: null, // predict | ready | pouring | reacting | observed
    collection: []
  };

  try {
    S.labLighting = localStorage.getItem('three-faces-laboratory-lighting') || 'light';
    S.tableColor = localStorage.getItem('three-faces-table-color') || '#3d4547';
  } catch (e) {}

  var HISTORY = [];
  var fillToken = 0;
  function highlightSettingsGearOnce() {
    try {
      if (sessionStorage.getItem('mebi_settings_gear_highlighted')) return;
      sessionStorage.setItem('mebi_settings_gear_highlighted', 'true');
      setTimeout(function() {
        var triggers = document.querySelectorAll('.lab-settings-trigger');
        triggers.forEach(function(btn) {
          btn.classList.add('gear-attention-highlight');
        });
        setTimeout(function() {
          triggers.forEach(function(btn) {
            btn.classList.remove('gear-attention-highlight');
          });
        }, 5000);
      }, 450);
    } catch (e) {}
  }
  function enterPredictionScreen() {
    if (!S.selectedSlot1 || !S.selectedSlot2) return false;
    S.activeReaction = window.MebiData.getReaction(S.selectedSlot1, S.selectedSlot2);
    S.prediction = [];
    S.labStep = 'predict';
    S.poured = false;
    S.currentTemp = S.activeReaction.tempInit;
    S.manualTypeInput = '';
    S.manualTypeSelections = [];
    S.typeEvaluation = null;
    S.typeChecked = false;
    S.typeCorrect = false;
    S.cameraTab = 'reactants';
    S.reportTab = 'analysis';
    S.screen = 'lab';
    S.labView = 'desk';
    S.reagentPanelCollapsed = true;
    highlightSettingsGearOnce();
    return true;
  }
  function finishSelection() {
    S.isFilling = !!(S.selectedSlot1 || S.selectedSlot2);
    var token = ++fillToken;
    render(false);
    setTimeout(function() {
      if (token !== fillToken) return;
      S.isFilling = false;
      if (S.screen === 'pool' && S.selectedSlot1 && S.selectedSlot2) enterPredictionScreen();
      render(false);
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 30 : 800);
  }

  // Koleksiyonu yerel depolamadan yükle
  try {
    var savedCol = localStorage.getItem('tepkime_arenasi_collection');
    if (savedCol) {
      S.collection = JSON.parse(savedCol);
    }
  } catch (e) {
    S.collection = [];
  }

  function saveCollectionToStorage() {
    try {
      localStorage.setItem('tepkime_arenasi_collection', JSON.stringify(S.collection));
    } catch (e) {}
  }

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function sameSet(a, b) {
    if (!a || !b || a.length !== b.length) return false;
    var s = a.slice().sort();
    var t = b.slice().sort();
    for (var i = 0; i < s.length; i++) {
      if (s[i] !== t[i]) return false;
    }
    return true;
  }

  /* ----------------- 2. TOPBAR VE STEPPER HTML ----------------- */
  function topbarHTML(showNav, stage) {
    var totalDiscovered = S.collection.length;
    var totalReactions = 36; // Aktif kimyasal tepkime sayısı
    var pct = Math.min(100, Math.round((totalDiscovered / totalReactions) * 100));

    var isAudio = window.MebiAudio ? window.MebiAudio.isEnabled() : true;
    var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    var curTheme = document.documentElement.getAttribute('data-theme') || 'light';
    var gearIcon = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="3"></circle>' +
      '<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>' +
    '</svg>';

    var showLabSettings = true;
    var settingsHTML = showLabSettings ? '<div class="lab-settings-wrap">' +
      '<button class="mebi-btn-icon mebi-btn-secondary lab-settings-trigger" data-action="toggleLabSettings" aria-expanded="' + S.labSettingsOpen + '" aria-controls="labSettingsPanel" title="Ayarlar" aria-label="Ayarlar">' +
        gearIcon +
      '</button>' +
      '<section id="labSettingsPanel" class="lab-settings-panel" aria-label="Ayarlar"' + (S.labSettingsOpen ? '' : ' hidden') + '>' +
        '<div class="lab-settings-heading"><strong>⚙️ Ayarlar</strong><button type="button" data-action="closeLabSettings" aria-label="Ayarları kapat">×</button></div>' +

        '<div class="lab-settings-section lab-settings-quick-grid">' +
          '<button type="button" class="lab-settings-btn-tile" data-action="toggleAudio" title="Sesi Aç / Kapat" aria-pressed="' + isAudio + '">' +
            '<span>' + (isAudio ? '🔊' : '🔇') + '</span><small>' + (isAudio ? 'Ses Açık' : 'Ses Kapalı') + '</small>' +
          '</button>' +
          '<button type="button" class="lab-settings-btn-tile" data-action="toggleFullscreen" title="Tam Ekran" aria-pressed="' + isFs + '">' +
            '<span>' + (isFs ? '🗗' : '⛶') + '</span><small>' + (isFs ? 'Küçült' : 'Tam Ekran') + '</small>' +
          '</button>' +
          '<button type="button" class="lab-settings-btn-tile" data-action="toggleTheme" title="Temayı Değiştir" aria-pressed="' + (curTheme === 'dark') + '">' +
            '<span>' + (curTheme === 'dark' ? '🌙' : '☀️') + '</span><small>' + (curTheme === 'dark' ? 'Karanlık' : 'Aydınlık') + '</small>' +
          '</button>' +
        '</div>' +

        '<div class="lab-settings-section"><span class="lab-settings-label">Kamera Bakış Açısı</span><div class="lab-settings-views" role="group" aria-label="Kamera bakış açısı">' +
          [['desk','Masa'],['wide','Oda']].map(function(view) { return '<button type="button" data-action="setLabView" data-arg="' + view[0] + '" aria-pressed="' + (S.labView === view[0]) + '">' + view[1] + '</button>'; }).join('') +
        '</div></div>' +

        '<div class="lab-settings-section"><span class="lab-settings-label">Laboratuvar Ortamı</span>' +
          '<button type="button" class="lab-settings-light" data-action="toggleLabLighting" aria-pressed="' + (S.labLighting === 'dark') + '">' + (S.labLighting === 'dark' ? '☾ Ortam: Karanlık' : '☀ Ortam: Aydınlık') + '</button>' +
        '</div>' +
        '<div class="lab-settings-section"><span class="lab-settings-label">Masa Rengi</span><div class="lab-settings-colors" role="group" aria-label="Masa rengi">' +
          [['#466455','Yeşil'],['#3d4547','Antrasit'],['#fff2d7','Açık']].map(function(color) { return '<button type="button" data-action="setTableColor" data-arg="' + color[0] + '" aria-pressed="' + (S.tableColor.toLowerCase() === color[0]) + '"><span style="--swatch:' + color[0] + '"></span>' + color[1] + '</button>'; }).join('') +
        '</div></div>' +
      '</section></div>' : '';
      var toolsHTML = settingsHTML +
        '<button class="mebi-btn mebi-btn-secondary mebi-btn-sm mebi-btn-icon-only' + (S.screen === 'collection' ? ' is-active' : '') + '" data-action="goCollection" title="Tepkime Koleksiyonum (' + totalDiscovered + ')" aria-label="Tepkime Koleksiyonum">' +
          '<span class="mebi-btn-badge">' + window.MebiSVG.icon('grid') + '</span>' +
        '</button>' +
        '<button class="mebi-btn mebi-btn-secondary mebi-btn-sm mebi-btn-icon-only" data-action="openGuideDrawer" title="Laboratuvar Rehberi" aria-label="Rehber">' +
          '<span class="mebi-btn-badge">' + window.MebiSVG.icon('helpCircle') + '</span>' +
        '</button>';

      var html = '<div class="mebi-top-shell' + (stage ? ' has-stage' : '') + '"><div class="mebi-topbar">' +
        '<div class="mebi-brand" data-action="goMenu">' +
          '<div class="mebi-brand-icon">' + window.MebiSVG.icon('shield') + '</div>' +
          '<span>TEPKİME ARENASI</span>' +
        '</div>' +

        // Topbar Çukur İlerleme Rozeti
        '<div class="mebi-progress-wrapper" title="Keşfedilen Tepkimeler">' +
          '<span class="mebi-progress-star">' + window.MebiSVG.icon('star') + '</span>' +
          '<span>' + totalDiscovered + ' / ' + totalReactions + ' Keşif</span>' +
          '<div class="mebi-progress-bar-mini">' +
            '<div class="mebi-progress-fill-mini" style="width:' + pct + '%;"></div>' +
          '</div>' +
          '<span>%' + pct + '</span>' +
        '</div>' +

        '<div class="mebi-topbar-tools">' +
          toolsHTML +
        '</div>' +
      '</div>' + (stage ? stepperHTML(stage, toolsHTML) : '') + '</div>';

    return html;
  }

  function stepperHTML(step, toolsHTML) {
    var steps = [
      { key: 'predict', label: '1. TAHMİN' },
      { key: 'reacting', label: '2. DENEY' },
      { key: 'observed', label: '3. GÖZLEM' },
      { key: 'card', label: '4. RAPOR & SORU' },
      { key: 'micro', label: '5. TANECİK KAMERASI' }
    ];
    var order = { predict: 0, ready: 1, pouring: 1, reacting: 1, observed: 2, card: 3, micro: 4 };
    var idx = order[step] || 0;
    var pctLine = (idx / (steps.length - 1)) * 100;

    var html = '<div class="mebi-stepper">' +
      '<div class="mebi-stepper-track">' +
        '<div class="mebi-step-line">' +
          '<div class="mebi-step-line-fill" style="width:' + pctLine + '%;"></div>' +
        '</div>';

    for (var i = 0; i < steps.length; i++) {
      var isDone = i < idx;
      var isActive = i === idx;
      var itemCls = isDone ? 'is-done' : (isActive ? 'is-active' : '');

      html += '<div class="mebi-step-item ' + itemCls + '">' +
        '<div class="mebi-step-node">' +
          (isDone ? window.MebiSVG.icon('check') : (i + 1)) +
        '</div>' +
        '<div class="mebi-step-label">' + steps[i].label + '</div>' +
      '</div>';
    }

    html += '</div>' +
      (toolsHTML ? '<div class="mebi-stepper-inline-tools">' + toolsHTML + '</div>' : '') +
    '</div>';
    return html;
  }

  /* ----------------- 3. EKRANLAR (SCREENS) ----------------- */

  // EKRAN 1: AÇILIŞ MENÜSÜ (Görseldeki Mint Kimya Temalı 16:9 Yatay Kart)
  function screenMenu() {
    return '<div class="mebi-card arena-menu-card arena-menu-mint-16-9">' +
        // Kimya Temalı Arka Plan Çizimleri (Molekül, Baloncuklar, Atom Yörüngeleri)
        '<div class="arena-mint-decorations" aria-hidden="true">' +
          '<svg class="mint-decor-hex top-left" viewBox="0 0 120 120">' +
            '<polygon points="60,10 100,32 100,78 60,100 20,78 20,32" fill="none" stroke="currentColor" stroke-width="2.2"/>' +
            '<polygon points="60,25 85,39 85,71 60,85 35,71 35,39" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3"/>' +
            '<circle cx="60" cy="10" r="3" fill="currentColor"/>' +
            '<circle cx="100" cy="32" r="3" fill="currentColor"/>' +
            '<circle cx="100" cy="78" r="3" fill="currentColor"/>' +
          '</svg>' +
          '<svg class="mint-decor-bubbles top-right" viewBox="0 0 100 100">' +
            '<circle cx="28" cy="72" r="7" fill="none" stroke="currentColor" stroke-width="1.8"/>' +
            '<circle cx="68" cy="42" r="11" fill="none" stroke="currentColor" stroke-width="2"/>' +
            '<circle cx="48" cy="22" r="5" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
            '<circle cx="82" cy="18" r="8" fill="none" stroke="currentColor" stroke-width="1.8"/>' +
          '</svg>' +
          '<svg class="mint-decor-atom bottom-left" viewBox="0 0 90 90">' +
            '<circle cx="45" cy="45" r="4.5" fill="currentColor"/>' +
            '<ellipse cx="45" cy="45" rx="36" ry="13" fill="none" stroke="currentColor" stroke-width="1.8" transform="rotate(32 45 45)"/>' +
            '<ellipse cx="45" cy="45" rx="36" ry="13" fill="none" stroke="currentColor" stroke-width="1.8" transform="rotate(-32 45 45)"/>' +
            '<circle cx="76" cy="56" r="3" fill="currentColor"/>' +
          '</svg>' +
          '<svg class="mint-decor-hex bottom-right" viewBox="0 0 120 120">' +
            '<polygon points="60,10 100,32 100,78 60,100 20,78 20,32" fill="none" stroke="currentColor" stroke-width="2"/>' +
            '<circle cx="20" cy="78" r="3" fill="currentColor"/>' +
            '<circle cx="60" cy="100" r="3" fill="currentColor"/>' +
          '</svg>' +
        '</div>' +

        // Sol Kolon: Erlenmayer, Başlık ve Açıklama
        '<div class="arena-mint-left">' +
          '<div class="arena-mint-flask-wrap">' +
            '<div class="arena-mint-flask-badge">' +
              '<svg viewBox="0 0 72 84" width="60" height="70" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<path d="M30 6V26L10 64C8 68 11 74 16 74H56C61 74 64 68 62 64L42 26V6H30Z" stroke="#059669" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>' +
                '<line x1="26" y1="6" x2="46" y2="6" stroke="#059669" stroke-width="4.5" stroke-linecap="round"/>' +
                '<path d="M16 54L22 42C26 40 32 44 38 42C44 40 50 44 56 54" stroke="#10b981" stroke-width="3" stroke-linecap="round"/>' +
                '<circle cx="26" cy="62" r="3" fill="#10b981"/>' +
                '<circle cx="36" cy="56" r="2.5" fill="#10b981"/>' +
                '<circle cx="46" cy="64" r="3.5" fill="#10b981"/>' +
                '<circle cx="36" cy="16" r="2" fill="#34d399"/>' +
                '<circle cx="33" cy="2" r="2.5" fill="#34d399"/>' +
              '</svg>' +
            '</div>' +
          '</div>' +
          '<h1 class="arena-mint-title">Tepkime Arenası</h1>' +
          '<p class="arena-mint-subtitle">' +
            'Kimyasal maddeleri seç, deney masasında birleştirerek değişimi tahmin et' +
          '</p>' +
        '</div>' +

        // Sağ Kolon: Beyaz Kapsül Buton Paneli
        '<div class="arena-mint-right">' +
          '<div class="arena-mint-actions-panel">' +
            '<button type="button" class="arena-mint-pill-btn is-primary" data-action="goPool">' +
              '<div class="pill-btn-icon-wrap">' +
                '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                  '<path d="M10 2v7.31L4.35 19.35A2 2 0 0 0 6 22h12a2 2 0 0 0 1.65-2.65L14 9.31V2"/>' +
                  '<path d="M8.5 2h7"/>' +
                  '<path d="M14 9.3a6.5 6.5 0 1 1-4 0"/>' +
                '</svg>' +
              '</div>' +
              '<span class="pill-btn-text">Arenaya Gir ve Deneye Başla</span>' +
            '</button>' +

            '<button type="button" class="arena-mint-pill-btn is-white" data-action="goCollection">' +
              '<div class="pill-btn-icon-wrap mint-icon">' +
                '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                  '<circle cx="6" cy="6" r="3"/>' +
                  '<circle cx="18" cy="8" r="3"/>' +
                  '<circle cx="12" cy="18" r="3"/>' +
                  '<line x1="8.5" y1="7.5" x2="15.5" y2="7.5"/>' +
                  '<line x1="8" y1="8" x2="10.5" y2="15.5"/>' +
                  '<line x1="16" y1="10" x2="13.5" y2="15.5"/>' +
                '</svg>' +
              '</div>' +
              '<span class="pill-btn-text">Tepkime Koleksiyonum</span>' +
            '</button>' +

            '<button type="button" class="arena-mint-pill-btn is-white" data-action="openGuideDrawer">' +
              '<div class="pill-btn-icon-wrap mint-icon">' +
                '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                  '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>' +
                  '<path d="M6 6h10"/>' +
                  '<path d="M6 10h7"/>' +
                '</svg>' +
              '</div>' +
              '<span class="pill-btn-text">Laboratuvar Rehberi</span>' +
            '</button>' +

            '<div class="arena-mint-reset-wrap">' +
              '<button type="button" class="arena-mint-reset-link" data-action="resetExperiment">' +
                'Sıfırla' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  // EKRAN 2: MADDE HAVUZU (POOL)
  function reagentPanelHTML() {
    var locked = S.screen !== 'pool';
    var selectionComplete = !!(S.selectedSlot1 && S.selectedSlot2);
    var compactSelection = selectionComplete && S.reagentPanelCollapsed;
    var q = window.MebiData.foldTR(S.searchQuery);
    var cards = window.MebiData.REAGENTS.filter(function(r) {
      if (compactSelection && r.id !== S.selectedSlot1 && r.id !== S.selectedSlot2) return false;
      return (S.categoryFilter === 'all' || r.category === S.categoryFilter) &&
        (compactSelection || !q || window.MebiData.foldTR(r.name + ' ' + r.f).indexOf(q) !== -1);
    }).map(function(r) {
      var slot = S.selectedSlot1 === r.id ? 1 : (S.selectedSlot2 === r.id ? 2 : 0);
      return '<button type="button" class="lab-reagent-card chem-' + esc(r.category) + (slot ? ' is-selected' : '') + (r.solid ? ' is-solid' : ' is-liquid') +
        '" data-action="clickReagent" data-arg="' + esc(r.id) + '" aria-pressed="' + !!slot + '" ' + (locked ? 'disabled' : '') + '>' +
        '<span class="lab-card-copy"><strong>' + esc(r.f) + '</strong><span>' + esc(r.name) + '</span>' +
        '<small>' + (r.solid ? 'Beyaz katı toz' : (r.id === 'Cu(NO3)2' ? 'Mavi sulu çözelti' : 'Renksiz sulu çözelti')) + '</small></span>' +
        (slot ? '<span class="lab-slot-badge">' + slot + '</span>' : '') + '</button>';
    }).join('');
    return '<aside class="lab-reagent-panel' + (S.reagentPanelCollapsed ? ' is-collapsed' : '') + (compactSelection ? ' has-selection-summary' : '') + ((!S.selectedSlot1 || !S.selectedSlot2) ? ' needs-selection' : '') + '" aria-label="Madde kartları">' +
      '<div class="lab-panel-heading"><button type="button" class="lab-panel-toggle" data-action="toggleReagentPanel" aria-controls="reagentPanelContent" aria-expanded="' + !S.reagentPanelCollapsed + '"><span>Maddelerini seç</span><span class="panel-chevron" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="m5.5 12.5 4.5-4.5 4.5 4.5"/></svg></span></button>' +
      '<p class="lab-panel-hint">' + (locked ? 'Deney hazırlanmış durumda. Yeni deney için tepkenleri değiştir.' : 'İlk kart 1. behere, ikinci kart 2. behere doldurulur.') + '</p></div>' +
      '<div id="reagentPanelContent" class="lab-panel-content"' + (S.reagentPanelCollapsed && !compactSelection ? ' hidden' : '') + '>' +
      (compactSelection ? '<div class="lab-selection-summary-label">Seçilen maddeler</div>' : '<input id="poolSearchInput" class="lab-card-search" aria-label="Madde ara" placeholder="Ad veya formül ara" value="' + esc(S.searchQuery) + '" ' + (locked ? 'disabled' : '') + '>' +
      '<div class="lab-card-filters" aria-label="Madde kategorisi">' +
      [['all','Tümü'],['acid','Asit'],['base','Baz'],['salt','Tuz']].map(function(f) {
        return '<button type="button" data-action="setFilter" data-arg="' + f[0] + '" aria-pressed="' + (S.categoryFilter === f[0]) + '">' + f[1] + '</button>';
      }).join('') + '</div>') + '<div class="lab-reagent-list">' + (cards || '<p>Bu aramada madde bulunamadı.</p>') + '</div>' +
      (compactSelection && locked ? '<div class="lab-panel-footer lab-change-reactants"><button type="button" class="mebi-btn mebi-btn-secondary mebi-btn-sm new-experiment-btn" data-action="changeReactants">' + window.MebiSVG.icon('undo') + '<span>Tepkenleri Değiştir</span></button></div>' : '') +
      (compactSelection ? '' : '<div class="lab-panel-footer"><span>' + ((S.selectedSlot1 ? 1 : 0) + (S.selectedSlot2 ? 1 : 0)) + ' / 2 madde seçildi</span>' +
      '<button type="button" class="mebi-btn mebi-btn-secondary mebi-btn-sm" data-action="resetPool" title="Seçimleri temizle">Temizle</button></div>') + '</div></aside>';
  }

  function labSettingsHTML() { return ''; }

  function selectionLabelHTML(id, slot, elementId) {
    var r = window.MebiData.getReagent(id);
    return '<div class="' + (slot === 1 ? 'vessel-main-wrap' : 'vessel-drag-wrap') + '" id="' + elementId + '">' +
      '<div class="selection-vessel">' + window.MebiSVG.renderBeakerSVG(r, !r) + '</div>' +
      '<div class="reagent-tag lab-nameplate' + (r ? ' has-reagent ' + (r.solid ? 'is-solid' : 'is-liquid') : '') + '"><div class="reagent-formula">' + slot + '. BEHER' + (r ? ' · ' + esc(r.f) : '') + '</div>' +
      '<div class="reagent-name">' + (r ? esc(r.name) : 'Madde seçimini bekliyor') + '</div>' +
      '<div class="reagent-state">' + (r ? esc(r.state) : 'Boş beher') + '</div></div></div>';
  }

  function screenPool() {
    var ready = S.selectedSlot1 && S.selectedSlot2 && !S.isFilling;
    return topbarHTML(true, 'predict') + '<div class="mebi-card lab-workspace">' + reagentPanelHTML() +
      '<div class="lab-bench" id="labBenchContainer"><div class="bench-stage">' +
      selectionLabelHTML(S.selectedSlot1, 1, 'mainVessel') + selectionLabelHTML(S.selectedSlot2, 2, 'dragReagentWrap') + '</div>' +
      '<aside class="bench-dock" id="benchDock"><div class="dock-header"><span class="dock-badge">DENEYE HAZIRLIK</span>' +
      '<h3 class="dock-title">Karttan behere</h3><p class="dock-subtext">Soldaki kartlardan iki farklı madde seç. Katılar toz, sulu çözeltiler sıvı olarak beherlere aktarılır.</p></div>' +
      '<div class="lab-selection-status" role="status" aria-live="polite">' + (S.isFilling ? 'Madde behere dolduruluyor…' : (ready ? 'İki beher hazır. Değişimleri tahmin edebilirsin.' : 'İki madde seçerek deneyi hazırla.')) + '</div>' +
      '</aside>' +
      '<div class="lab-camera-tools" role="toolbar" aria-label="Laboratuvar görünümü"><button type="button" class="mebi-btn mebi-btn-secondary mebi-btn-sm" data-lab-view="reset" ' + ((!S.selectedSlot1 || !S.selectedSlot2) ? 'disabled' : '') + '>Beherler</button>' +
      '<button type="button" class="mebi-btn mebi-btn-secondary mebi-btn-sm" data-lab-view="general">Oda</button></div>' +
      labSettingsHTML() + '</div></div>';
  }

  function screenLab() {
    var r1 = window.MebiData.getReagent(S.selectedSlot1);
    var r2 = window.MebiData.getReagent(S.selectedSlot2);
    var rx = S.activeReaction || window.MebiData.getReaction(S.selectedSlot1, S.selectedSlot2);

    var isReacting = (S.labStep === 'reacting' || S.labStep === 'observed');
    var isPoured = S.poured || isReacting;
    var isR1Solid = (r1 && r1.solid);
    var isR2Solid = (r2 && r2.solid);

    // Sıvı Rengi (Gerçek Görünüm)
    var liquidColor = 'rgba(255, 255, 255, 0.16)';
    if (isReacting && rx.toColor) {
      liquidColor = rx.toColor;
    } else if (r1.id === 'Cu(NO3)2' || (isPoured && r2.id === 'Cu(NO3)2')) {
      liquidColor = '#0284c7';
    }

    var precipColor = rx.precipColor || '#ffffff';

    var thermoHeight = 25;
    if (isReacting && rx.hasTempRise) {
      thermoHeight = Math.min(85, Math.max(25, 25 + ((rx.tempFinal - 20) / 40) * 60));
    } else if (isReacting && rx.tempFinal > rx.tempInit) {
      thermoHeight = 35;
    }

    var bubblesHTML = '';
    var surfaceFizzHTML = '';
    if (isReacting && rx.obs.indexOf('gas') > -1) {
      surfaceFizzHTML = '<div class="surface-fizz"></div>';
      var bLefts = [15, 28, 42, 54, 66, 22, 35, 48, 60, 18, 32, 50, 64];
      for (var i = 0; i < bLefts.length; i++) {
        var sz = 6 + (i % 4) * 3.5;
        bubblesHTML += '<div class="bubble-item" style="left:' + bLefts[i] + '%;width:' + sz + 'px;height:' + sz + 'px;animation-delay:' + (i * 0.14) + 's;animation-duration:' + (0.9 + (i % 3) * 0.3) + 's;"></div>';
      }
    }

    var vaporHTML = '';
    if (isReacting && rx.obs.indexOf('gas') > -1) {
      vaporHTML = '<div class="gas-vapor-container">' +
        '<div class="vapor-cloud" style="--drift-x:-12px;animation-delay:0s;"></div>' +
        '<div class="vapor-cloud" style="--drift-x:8px;animation-delay:0.4s;"></div>' +
        '<div class="vapor-cloud" style="--drift-x:-5px;animation-delay:0.9s;"></div>' +
      '</div>';
    }

    var precipHTML = '';
    if (isReacting && rx.obs.indexOf('precipitate') > -1) {
      precipHTML = '<div class="precip-sludge" style="height:32%;background:' + precipColor + 'cc;"></div>';
      var pLefts = [18, 32, 45, 58, 25, 40, 52];
      for (var j = 0; j < pLefts.length; j++) {
        precipHTML += '<div class="precip-flake" style="left:' + pLefts[j] + '%;background:' + precipColor + ';animation-delay:' + (j * 0.2) + 's;"></div>';
      }
    }

    // Sabit Beher İçerik Katmanı (Katı Toz ve Sıvı Reaksiyon Modeli)
    var mainInteriorHTML = '';
    if (isR1Solid) {
      if (!isPoured) {
        mainInteriorHTML = '<div class="main-beaker-powder" id="mainPowder"></div>';
      } else {
        if (isR2Solid) {
          mainInteriorHTML = '<div class="main-beaker-powder" id="mainPowder" style="height:55%;"></div>' +
            (isReacting ? '<div id="flaskLiquid" style="position:absolute;bottom:0;left:0;right:0;height:55%;background:transparent;">' + surfaceFizzHTML + bubblesHTML + precipHTML + '</div>' : '');
        } else {
          mainInteriorHTML = '<div class="main-beaker-powder' + (isReacting && rx.obs.indexOf('gas') > -1 ? ' reacting' : '') + '" id="mainPowder"></div>' +
            '<div id="flaskLiquid" style="position:absolute;bottom:0;left:0;right:0;height:72%;background:' + liquidColor + ';transition:all 1.4s ease;box-shadow:inset 0 0 20px rgba(0,0,0,0.25);">' +
              surfaceFizzHTML + bubblesHTML + precipHTML +
            '</div>';
        }
      }
    } else {
      if (!isPoured) {
        mainInteriorHTML = '<div id="flaskLiquid" style="position:absolute;bottom:0;left:0;right:0;height:46%;background:' + liquidColor + ';transition:all 1.4s ease;box-shadow:inset 0 0 20px rgba(0,0,0,0.25);">' +
          surfaceFizzHTML + bubblesHTML + precipHTML +
        '</div>';
      } else {
        var powderSettledHTML = isR2Solid ? '<div class="main-beaker-powder settled" id="mainPowder"></div>' : '';
        mainInteriorHTML = powderSettledHTML +
          '<div id="flaskLiquid" style="position:absolute;bottom:0;left:0;right:0;height:72%;background:' + liquidColor + ';transition:all 1.4s ease;box-shadow:inset 0 0 20px rgba(0,0,0,0.25);">' +
            surfaceFizzHTML + bubblesHTML + precipHTML +
          '</div>';
      }
    }

    // Durum ve Sensör Barı Metinleri (Yönerge standartları)
    var statusTitle = '1. Aşama: Olası Değişimleri Tahmin Edin';
    var dotClass = '';
    if (S.labStep === 'ready') {
      statusTitle = '2. Aşama: Beheri Dökün veya Sürükleyin';
    } else if (S.labStep === 'pouring') {
      statusTitle = 'Maddeler Karıştırılıyor...';
      dotClass = 'dot-reacting';
    } else if (S.labStep === 'reacting') {
      statusTitle = 'Maddeler Karıştırılıyor ve Tepkime Gerçekleşiyor...';
      dotClass = 'dot-reacting';
    } else if (S.labStep === 'observed') {
      statusTitle = 'Tepkime Tamamlandı - Gözlem ve Kanıt Analizi';
      dotClass = 'dot-done';
    }

    var curDelta = (S.currentTemp - rx.tempInit).toFixed(1);
    var deltaSign = curDelta > 0 ? ('+' + curDelta) : curDelta;

    // Deney Masası Sağ Kontrol ve Gözlem Dock'u (Frosted Glass Panel)
    var dockHTML = '';
    var isNoneSelected = (S.prediction.indexOf('none') > -1);

    if (S.labStep === 'predict') {
      dockHTML = '<div class="bench-dock" id="benchDock">' +
        '<div class="dock-header">' +
          '<span class="dock-badge">1. AŞAMA: TAHMİN</span>' +
          '<h3 class="dock-title">Olası Değişimleri Belirle</h3>' +
          '<p class="dock-subtext">Bu iki madde karıştırıldığında hangi gözlenebilir değişimlerin gerçekleşebileceğini tahmin ediniz:</p>' +
        '</div>' +
        '<div class="dock-obs-grid">' +
          window.MebiData.OBS.map(function(o) {
            var sel = S.prediction.indexOf(o.key) > -1;
            var isPassive = (isNoneSelected && o.key !== 'none');
            var cls = 'dock-obs-chip' + (sel ? ' is-selected' : '') + (isPassive ? ' is-dimmed' : '');
            return '<button type="button" class="' + cls + '" data-action="toggleObs" data-arg="' + o.key + '">' +
              '<span class="dock-chip-left">' +
                '<span class="dock-chip-icon">' + window.MebiSVG.icon(o.key) + '</span>' +
                '<span class="dock-chip-label">' + esc(o.label) + '</span>' +
              '</span>' +
              '<span class="dock-chip-check">' + (sel ? '✓' : '') + '</span>' +
            '</button>';
          }).join('') +
        '</div>' +
        '<div class="dock-actions">' +
          '<button class="mebi-btn mebi-btn-primary dock-btn-full" data-action="savePrediction" ' + (S.prediction.length === 0 ? 'disabled' : '') + '>' +
            '<span class="mebi-btn-badge">' + window.MebiSVG.icon('check') + '</span>' +
            '<span>Tahminimi Onayla</span>' +
          '</button>' +
        '</div>' +
      '</div>';
    } else if (S.labStep === 'ready') {
      dockHTML = '<div class="bench-dock" id="benchDock">' +
        '<div class="dock-header">' +
          '<span class="dock-badge mebi-badge-cyan">2. AŞAMA: KARIŞTIRMA</span>' +
          '<h3 class="dock-title">Beheri Dökün veya Sürükleyin</h3>' +
          '<p class="dock-subtext">Kaydedilen olası değişim tahminleriniz listelenmiştir. Maddeleri karıştırmak için sağdaki beheri dökünüz:</p>' +
        '</div>' +
        '<div class="dock-obs-grid">' +
          window.MebiData.OBS.map(function(o) {
            var sel = S.prediction.indexOf(o.key) > -1;
            var cls = 'dock-obs-chip is-locked' + (sel ? ' is-selected' : ' feedback-neutral');
            return '<div class="' + cls + '">' +
              '<span class="dock-chip-left">' +
                '<span class="dock-chip-icon">' + window.MebiSVG.icon(o.key) + '</span>' +
                '<span class="dock-chip-label">' + esc(o.label) + '</span>' +
              '</span>' +
              (sel
                ? '<span class="dock-chip-status status-pred">Tahmininiz</span>'
                : '<span class="dock-chip-status status-neutral">Seçilmedi</span>'
              ) +
            '</div>';
          }).join('') +
        '</div>' +
        '<div class="dock-actions">' +
          '<button class="mebi-btn mebi-btn-primary dock-btn-full" data-action="triggerPour">' +
            '<span class="mebi-btn-badge">' + window.MebiSVG.icon('flaskIc') + '</span>' +
            '<span>Beheri Dök</span>' +
          '</button>' +
          '<button class="mebi-btn mebi-btn-secondary mebi-btn-sm dock-btn-full" data-action="redoPrediction">' +
            '<span class="mebi-btn-badge">' + window.MebiSVG.icon('undo') + '</span>' +
            '<span>Tahmini Değiştir</span>' +
          '</button>' +
        '</div>' +
      '</div>';
    } else if (S.labStep === 'pouring' || S.labStep === 'reacting') {
      dockHTML = '<div class="bench-dock" id="benchDock">' +
        '<div class="dock-header">' +
          '<span class="dock-badge mebi-badge-indigo">CANLI TEPKİME</span>' +
          '<h3 class="dock-title">Maddeler Karıştırılıyor...</h3>' +
          '<p class="dock-subtext">Kap içerisindeki renk, gaz, çökelti ve sıcaklık değişimlerini izleyiniz.</p>' +
        '</div>' +
        '<div class="dock-obs-grid">' +
          window.MebiData.OBS.map(function(o) {
            var sel = S.prediction.indexOf(o.key) > -1;
            var cls = 'dock-obs-chip is-locked' + (sel ? ' is-selected' : ' feedback-neutral');
            return '<div class="' + cls + '">' +
              '<span class="dock-chip-left">' +
                '<span class="dock-chip-icon">' + window.MebiSVG.icon(o.key) + '</span>' +
                '<span class="dock-chip-label">' + esc(o.label) + '</span>' +
              '</span>' +
              (sel
                ? '<span class="dock-chip-status status-pred">Tahmininiz</span>'
                : '<span class="dock-chip-status status-neutral">Seçilmedi</span>'
              ) +
            '</div>';
          }).join('') +
        '</div>' +
        '<div class="dock-live-box" style="margin-top:4px;">' +
          '<span class="sensor-pulse-dot dot-reacting"></span>' +
          '<span>Reaksiyon devam ediyor...</span>' +
        '</div>' +
      '</div>';
    } else if (S.labStep === 'observed') {
      var exact = sameSet(S.prediction, rx.obs);
      var hasNone = rx.obs.indexOf('none') > -1;

      var feedbackItemsHTML = window.MebiData.OBS.map(function(o) {
        var isPred = S.prediction.indexOf(o.key) > -1;
        var isReal = rx.obs.indexOf(o.key) > -1;

        var cls = 'dock-obs-chip is-locked';
        var badgeHTML = '';

        if (isPred && isReal) {
          cls += ' feedback-correct';
          badgeHTML = '<span class="dock-chip-status status-correct">✓ Doğru Tahmin</span>';
        } else if (isPred && !isReal) {
          cls += ' feedback-wrong';
          badgeHTML = '<span class="dock-chip-status status-wrong">✕ Gerçekleşmedi</span>';
        } else if (!isPred && isReal) {
          cls += ' feedback-missed';
          badgeHTML = '<span class="dock-chip-status status-missed">! Gözden Kaçtı</span>';
        } else {
          cls += ' feedback-neutral';
          badgeHTML = '<span class="dock-chip-status status-neutral">Gözlenmedi</span>';
        }

        return '<div class="' + cls + '">' +
          '<span class="dock-chip-left">' +
            '<span class="dock-chip-icon">' + window.MebiSVG.icon(o.key) + '</span>' +
            '<span class="dock-chip-label">' + esc(o.label) + '</span>' +
          '</span>' +
          badgeHTML +
        '</div>';
      }).join('');

      dockHTML = '<div class="bench-dock" id="benchDock">' +
        '<div class="dock-header">' +
          '<span class="dock-badge ' + (exact ? 'mebi-badge-success' : 'mebi-badge-indigo') + '">' +
            (exact ? 'TAM İSABET • DOĞRU TAHMİN' : 'DENEY SONUÇLANDI') +
          '</span>' +
          '<h3 class="dock-title">' + (exact ? 'Tebrikler! Mükemmel Tahmin' : 'Tahmin & Sonuç Analizi') + '</h3>' +
          '<p class="dock-subtext">' +
            (exact
              ? 'Tüm olası değişimleri eksiksiz ve doğru tahmin ettiniz.'
              : 'Gerçekleşen kanıtlar ve tahminleriniz aşağıda eşleştirildi:'
            ) +
          '</p>' +
        '</div>' +
        '<div class="dock-obs-grid">' +
          feedbackItemsHTML +
        '</div>' +
        (rx.hasTempRise
          ? '<div class="dock-result-temp" style="font-size:11px;color:var(--mebi-danger);font-weight:700;display:flex;align-items:center;gap:6px;padding:4px 8px;border-radius:6px;background:rgba(239,68,68,0.12);">' +
              window.MebiSVG.icon('temp') +
              '<span>Ekzotermik (' + S.currentTemp.toFixed(1) + '°C - Sıcaklık Artışı)</span>' +
            '</div>'
          : '<div class="dock-result-temp" style="font-size:11px;color:var(--mebi-info);font-weight:700;display:flex;align-items:center;gap:6px;padding:4px 8px;border-radius:6px;background:rgba(139,92,246,0.12);">' +
              window.MebiSVG.icon('temp') +
              '<span>' + S.currentTemp.toFixed(1) + '°C · ΔT: ' + (S.currentTemp - rx.tempInit).toFixed(1) + '°C</span>' +
            '</div>'
        ) +
        '<div class="dock-actions" style="display:flex;flex-direction:column;gap:6px;">' +
          (exact
            ? '<button class="mebi-btn mebi-btn-primary dock-btn-full" data-action="toCard">' +
                '<span class="mebi-btn-badge">' + window.MebiSVG.icon('flaskOutline') + '</span>' +
                '<span>Rapor Aşamasına Geç →</span>' +
              '</button>'
            : '<button class="mebi-btn mebi-btn-primary dock-btn-full" data-action="redoPrediction">' +
                '<span class="mebi-btn-badge">' + window.MebiSVG.icon('undo') + '</span>' +
                '<span>Tahmini Tekrarla</span>' +
              '</button>'
          ) +
        '</div>' +
      '</div>';
    }

    var html = topbarHTML(true, S.labStep) +
      '<div class="mebi-card lab-workspace">' +
        reagentPanelHTML() +

        '<div class="lab-experiment-heading">' +
          '<div class="lab-unified-experiment-badge mebi-badge mebi-badge-cyan">' +
            '<span class="lab-badge-label">DENEY MASASI & REAKSİYON DÜZENEĞİ</span>' +
            '<span class="lab-badge-sep">•</span>' +
            '<span class="lab-badge-title">' + esc(r1.f) + ' + ' + esc(r2.f) + ' Deneyi</span>' +
          '</div>' +
        '</div>' +

        // Deney Tezgahı
        '<div class="lab-bench" id="labBenchContainer">' +
          // Tezgah Çalışma Alanı: Solda Beherler, Sağda Gözlem Dock Paneli
          '<div class="bench-stage">' +
            '<div class="bench-items">' +
              // Sabit Beher
              '<div class="vessel-main-wrap" id="mainVessel">' +
                vaporHTML +
                '<div class="main-beaker-glass">' +
                  // 1. Gerçek Borosilikat Beher Arka Camı ve Ağız Arka Çizgisi (z-index: 2)
                  window.MebiSVG.renderRealisticMainBeakerBackSVG() +

                  // 2. Sıvı ve Reaksiyon Haznesi (z-index: 5)
                  '<div class="main-beaker-interior">' +
                    mainInteriorHTML +
                  '</div>' +

                  // 3. Dijital Laboratuvar Termometresi (Prob beherin içinde, Gösterge beherin biraz üstünde)
                  '<div class="digital-thermo-wrap" id="digitalThermoWrap">' +
                    '<div class="digital-thermo-head' + ((isReacting && rx.hasTempRise) ? ' is-heating' : '') + '" id="digitalThermoHead">' +
                      '<div class="digital-lcd-display">' +
                        '<div class="digital-head-top">' +
                          '<span class="digital-brand-label">DIGITAL TEMP</span>' +
                          '<span class="digital-status-led-wrap">REC <span class="digital-status-led" id="digitalStatusLed"></span></span>' +
                        '</div>' +
                        '<div class="digital-temp-center">' +
                          '<span class="digital-temp-value" id="digitalTempValue">' + S.currentTemp.toFixed(1) + '</span>' +
                          '<span class="digital-temp-unit">°C</span>' +
                        '</div>' +
                        '<div class="digital-head-bottom">' +
                          '<span class="digital-sub-label">MEBİ KİMYALAB - PROBE-T1</span>' +
                        '</div>' +
                      '</div>' +
                      '<div class="digital-head-screws"><div class="screw"></div><div class="screw"></div></div>' +
                    '</div>' +
                    '<div class="digital-probe-collar"></div>' +
                    '<div class="digital-probe-stem">' +
                      '<div class="digital-probe-ticks"></div>' +
                    '</div>' +
                    '<div class="digital-probe-tip"></div>' +
                  '</div>' +

                  // 4. Gerçek Borosilikat Cam Beher Ön Modeli (Ön ağız kavisi, Boro 3.3 emaye skala, parlamalar - z-index: 8)
                  window.MebiSVG.renderRealisticMainBeakerGlassSVG() +
                '</div>' +
                '<div class="reagent-tag lab-nameplate has-reagent ' + (r1.solid ? 'is-solid' : 'is-liquid') + '">' +
                  '<div class="reagent-formula">' + esc(r1.f) + '</div>' +
                  '<div class="reagent-name">' + esc(r1.name) + '</div>' +
                  '<div class="reagent-state">' + esc(r1.state) + '</div>' +
                '</div>' +
              '</div>' +

              // Dökülecek Beher
              '<div class="vessel-drag-wrap' + (S.labStep === 'pouring' ? ' pouring' : '') + '" id="dragReagentWrap">' +
                '<div class="drag-beaker' + (S.labStep === 'pouring' ? ' pouring' : '') + '" id="dragBeaker">' +
                  (S.labStep === 'ready' ? '<div class="hand-guide-pill">' + window.MebiSVG.icon('handIc') + 'Tutup Ağız Hizasına Sürükle</div>' : '') +
                  (isR2Solid
                    ? '<div class="drag-powder" style="height:' + (isPoured ? '0%' : '60%') + ';"></div>'
                    : '<div class="drag-liquid" style="background:' + (r2.id === 'Cu(NO3)2' ? '#0284c7' : 'rgba(232, 244, 253, 0.55)') + ';height:' + (isPoured ? '0%' : '65%') + ';"></div>'
                  ) +
                  window.MebiSVG.renderRealisticDragBeakerGlassSVG() +
                  '<div class="pour-stream' + (isR2Solid ? ' powder-stream' : '') + (S.labStep === 'pouring' ? ' active' : '') + '" id="pourStream"></div>' +
                '</div>' +
                '<div class="reagent-tag lab-nameplate has-reagent ' + (r2.solid ? 'is-solid' : 'is-liquid') + '">' +
                  '<div class="reagent-formula">' + esc(r2.f) + '</div>' +
                  '<div class="reagent-name">' + esc(r2.name) + '</div>' +
                  '<div class="reagent-state">' + esc(r2.state) + '</div>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +

          dockHTML + labSettingsHTML() +
          '<div class="lab-camera-tools" role="toolbar" aria-label="Laboratuvar görünümü">' +
            '<button type="button" class="mebi-btn-icon mebi-btn-secondary" data-lab-view="close" title="Düzeneğe Yaklaş" aria-label="Düzeneğe Yaklaş">' + window.MebiSVG.icon('eye') + '</button>' +
            '<button type="button" class="mebi-btn-icon mebi-btn-secondary" data-lab-view="reset" title="Görünümü Sıfırla" aria-label="Görünümü Sıfırla">' + window.MebiSVG.icon('reset') + '</button>' +
          '</div>' +
        '</div>';

    html += '</div>';
    return html;
  }

  // EKRAN 4: SONUÇ RAPORU VE SORU (CARD & QUIZ - BELİRGİN ÇİFT SEKME YAPISI)
  function screenCard() {
    var r1 = window.MebiData.getReagent(S.selectedSlot1);
    var r2 = window.MebiData.getReagent(S.selectedSlot2);
    var rx = S.activeReaction || window.MebiData.getReaction(S.selectedSlot1, S.selectedSlot2);
    if (!rx) rx = window.MebiData.getReaction('NaHCO3', 'Pb(NO3)2');
    if (!r1) r1 = window.MebiData.getReagent('NaHCO3');
    if (!r2) r2 = window.MebiData.getReagent('Pb(NO3)2');

    var obsLabels = rx.obs.map(function(k) {
      for (var i = 0; i < window.MebiData.OBS.length; i++) {
        if (window.MebiData.OBS[i].key === k) return window.MebiData.OBS[i].label;
      }
      return k;
    }).join(', ');

    // 📌 KURAL: Bu bölüme gelindiğinde açık olan sekme her zaman "1. Süreç Analizi"dir
    var activeTab = (S.reportTab === 'quiz') ? 'quiz' : 'analysis';

    // 1. SÜREÇ ANALİZİ BİLEŞENİ (4 Metrik Karosu + Johnstone Sembolik Denklem Kartı)
    var analysisHTML =
      '<div class="report-metrics-grid">' +
        // Karo 1: Reaktifler
        '<div class="report-metric-tile">' +
          '<div class="metric-tile-header">' +
            window.MebiSVG.icon('flaskOutline') +
            '<span>Tepkenler (Başlangıç)</span>' +
          '</div>' +
          '<div class="metric-tile-val">' + esc(r1.f) + ' ' + esc(r1.state) + ' + ' + esc(r2.f) + ' ' + esc(r2.state) + '</div>' +
          '<div class="metric-tile-sub">' + esc(r1.name) + ' ve ' + esc(r2.name) + '</div>' +
        '</div>' +

        // Karo 2: Sıcaklık Değişimi Ölçümü
        '<div class="report-metric-tile">' +
          '<div class="metric-tile-header">' +
            window.MebiSVG.icon('temp') +
            '<span>Sıcaklık Değişimi</span>' +
          '</div>' +
          '<div class="metric-tile-val" style="color:var(--mebi-danger);">' +
            rx.tempInit.toFixed(1) + '°C → ' + rx.tempFinal.toFixed(1) + '°C' +
          '</div>' +
          '<div class="metric-tile-sub">' +
            (rx.hasTempRise
              ? ('ΔT = +' + (rx.tempFinal - rx.tempInit).toFixed(1) + '°C (Ekzotermik / Isı Çıkışı)')
              : 'ΔT = 0.0°C (İzotermik / Değişim Yok)'
            ) +
          '</div>' +
        '</div>' +

        // Karo 3: Gözlemlenen Kanıtlar
        '<div class="report-metric-tile">' +
          '<div class="metric-tile-header">' +
            window.MebiSVG.icon('eye') +
            '<span>Deneysel Kanıtlar</span>' +
          '</div>' +
          '<div class="metric-tile-val" style="color:var(--mebi-primary);">' + esc(obsLabels) + '</div>' +
          '<div class="metric-tile-sub">' +
            (rx.typeCategory === 'none' ? 'Fiziksel temas; yeni kimyasal bağ veya çökelti yok' : 'Kimyasal değişim kanıtlandı') +
          '</div>' +
        '</div>' +

        // Karo 4: Oluşan Ürünler
        '<div class="report-metric-tile">' +
          '<div class="metric-tile-header">' +
            window.MebiSVG.icon('beakerIc') +
            '<span>Oluşan Çıktılar</span>' +
          '</div>' +
          '<div class="metric-tile-val">' + esc(rx.products) + '</div>' +
          '<div class="metric-tile-sub">Tepkime sonucu oluşan yeni maddeler</div>' +
        '</div>' +
      '</div>' +

      // Johnstone Üçgeni - Sembolik Boyut Kartı
      '<div class="chemical-eq-card">' +
        '<div class="chemical-eq-title">Johnstone Üçgeni • Sembolik Boyut: Dengelenmiş Kimyasal Denklem</div>' +
        '<div class="chemical-eq-body">' + esc(rx.eq) + '</div>' +
        (rx.netIonic ? '<div class="chemical-net-ionic"><b>Net İyon Denklemi:</b> ' + esc(rx.netIonic) + '<br><b>Seyirci İyonlar:</b> ' + esc(rx.spectators || 'Yok') + '</div>' : '') +
      '</div>';

    // 2. PEDAGOJİK DEĞERLENDİRME SORUSU BİLEŞENİ
    var ev = S.typeEvaluation;
    var curSelections = S.manualTypeSelections || [];

    var quizHTML =
      '<div class="report-quiz-panel">' +
        '<div class="report-quiz-header">' +
          '<div class="report-quiz-title">Soru - Gerçekleşen kimyasal süreç hangi tepkime türü veya türleriyle açıklanabilir?</div>' +
          '<div class="report-quiz-sub">Deneysel gözlem ve bulgularınızı dikkate alarak uygun olan tüm seçenekleri işaretleyiniz.</div>' +
        '</div>' +

        '<div class="mebi-quiz-grid mebi-quiz-grid-2col">';
          for (var i = 0; i < window.MebiData.QUIZ_OPTIONS.length; i++) {
            var opt = window.MebiData.QUIZ_OPTIONS[i];
            var isSel = (curSelections.indexOf(opt) > -1);
            var optLetter = opt.charAt(0);
            var optText = opt.substring(4);

            var evalClass = '';
            if (S.typeChecked && ev && isSel) {
              var catLetter = optLetter;
              var catKey = (catLetter === 'A' ? 'ppt' : (catLetter === 'B' ? 'acidbase' : (catLetter === 'C' ? 'redox' : (catLetter === 'D' ? 'complex' : 'none'))));
              var isCatValid = (ev.validCategories && ev.validCategories.indexOf(catKey) > -1);
              evalClass = isCatValid ? ' is-correct-eval' : ' is-wrong-eval';
            }

            quizHTML += '<button type="button" class="mebi-quiz-choice' + (isSel ? ' is-selected' : '') + evalClass + '" data-action="selectType" data-arg="' + esc(opt) + '">' +
              '<div class="mebi-quiz-checkbox">' + (isSel ? '✓' : '') + '</div>' +
              '<div class="mebi-quiz-letter">' + esc(optLetter) + '</div>' +
              '<div class="mebi-quiz-text">' + esc(optText) + '</div>' +
            '</button>';
          }
        quizHTML += '</div>' +

        // Yanıtı Kontrol Et ve Değerlendirme Kartını Aç Butonları
        '<div class="report-quiz-actions">' +

          (S.typeChecked
            ? (S.typeCorrect
                ? '<div class="report-quiz-inline-status status-correct" style="margin-top:10px;padding:9px 12px;border-radius:8px;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.3);color:var(--mebi-success);font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;width:100%;">' +
                    '<div style="display:flex;align-items:center;gap:6px;"><span>✓</span><span>Tebrikler! Tepkime türünü eksiksiz ve doğru tespit ettiniz.</span></div>' +
                    '<button type="button" class="mebi-btn mebi-btn-primary mebi-btn-sm" data-action="saveCard" style="white-space:nowrap;margin-left:auto;">' +
                      '<span class="mebi-btn-badge">' + window.MebiSVG.icon('sparkles') + '</span>' +
                      '<span>Tanecik Kamerasına Geç ➔</span>' +
                    '</button>' +
                  '</div>'
                : '<div class="report-quiz-inline-status status-wrong" style="margin-top:10px;padding:9px 12px;border-radius:8px;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);color:var(--mebi-danger);font-size:12px;font-weight:700;display:flex;align-items:center;gap:6px;width:100%;"><span>!</span><span>Henüz tam doğru değil. İşaretlediğiniz seçenekleri tekrar gözden geçirip yanıtınızı kontrol ediniz.</span></div>'
              )
            : ''
          ) +
          
          (curSelections.length === 0
            ? '<span class="report-quiz-hint">(En az bir seçenek işaretleyiniz)</span>'
            : ''
          ) +
        '</div>' +
      '</div>';

    // 2. Sekme Rozet Metni & Durum Sınıfı
    var tab2BadgeText = '1 Soru Bekliyor';
    var tab2BadgeClass = 'is-pending';
    if (S.typeChecked) {
      if (S.typeCorrect) {
        tab2BadgeText = '✓ Doğru Cevaplandı';
        tab2BadgeClass = 'is-correct';
      } else {
        tab2BadgeText = '! Değerlendirildi';
        tab2BadgeClass = 'is-partial';
      }
    }

    var html = topbarHTML(true, 'card') +
      '<div class="mebi-card">' +

        // Resmi MEBİ Laboratuvar Deney Rapor Sayfası
        '<div class="mebi-report-sheet">' +

          // 🌟 BİRBİRİNİN DEVAMI ŞEKLİNDE BÜTÜNLEŞİK ÇİFT SEKME ÇUBUĞU (CONNECTED STEPPER TABS)
          '<div class="report-connected-nav" role="tablist" aria-label="Rapor ve Değerlendirme Aşamaları">' +
            // Adım 1: Süreç Analizi
            '<button type="button" role="tab" aria-selected="' + (activeTab === 'analysis') + '" class="report-conn-tab ' + (activeTab === 'analysis' ? 'is-active' : 'is-completed') + '" data-action="setReportTab" data-arg="analysis">' +
              '<span class="report-conn-badge">1</span>' +
              '<span class="report-conn-icon">' + window.MebiSVG.icon('flaskOutline') + '</span>' +
              '<span class="report-conn-text">' +
                '<span class="report-conn-title">1. SÜREÇ ANALİZİ</span>' +
                '<span class="report-conn-sub">Deneysel Veriler & Denklem</span>' +
              '</span>' +
              (activeTab === 'quiz' ? '<span class="report-conn-check">✓</span>' : '') +
            '</button>' +

            // Akış ve Devam Ayracı (Continuation Chevron)
            '<div class="report-conn-divider" aria-hidden="true">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
                '<polyline points="9 18 15 12 9 6"></polyline>' +
              '</svg>' +
            '</div>' +

            // Adım 2: Değerlendirme Sorusu
            '<button type="button" role="tab" aria-selected="' + (activeTab === 'quiz') + '" class="report-conn-tab ' + (activeTab === 'quiz' ? 'is-active' : '') + '" data-action="setReportTab" data-arg="quiz">' +
              '<span class="report-conn-badge">2</span>' +
              '<span class="report-conn-icon">' + window.MebiSVG.icon('check') + '</span>' +
              '<span class="report-conn-text">' +
                '<span class="report-conn-title">2. DEĞERLENDİRME SORUSU</span>' +
                '<span class="report-conn-sub">Tepkime Türü Tespiti</span>' +
              '</span>' +
              '<span class="report-conn-status ' + tab2BadgeClass + '">' + tab2BadgeText + '</span>' +
            '</button>' +
          '</div>';

          // İÇERİK ALANI (Aktif sekmeye göre)
          if (activeTab === 'analysis') {
            html += '<div class="report-tab-pane is-active">' +
              analysisHTML +
              '<div class="report-tab-footer-prompt">' +
                '<div class="report-footer-hint">Deneysel verileri ve kimyasal denklemi incelediniz mi? Süreci değerlendirmek için soruya geçiniz:</div>' +
                '<button type="button" class="mebi-btn mebi-btn-primary mebi-btn-sm" data-action="setReportTab" data-arg="quiz">' +
                  '<span>2. Değerlendirme Sorusuna Geç ➔</span>' +
                '</button>' +
              '</div>' +
            '</div>';
          } else {
            // 'quiz'
            html += '<div class="report-tab-pane is-active">' +
              quizHTML +
            '</div>';
          }

        html += '</div>'; // mebi-report-sheet end
      html += '</div>';

    return html;
  }

  // EKRAN 5: TANECİK KAMERASI (ALT-MİKROSKOBİK BOYUT - KONSEPT A: ULTRA KOMPAKT)
  function screenMicro() {
    var r1 = window.MebiData.getReagent(S.selectedSlot1);
    var r2 = window.MebiData.getReagent(S.selectedSlot2);
    var rx = S.activeReaction || window.MebiData.getReaction(S.selectedSlot1, S.selectedSlot2);
    if (!r1) r1 = window.MebiData.getReagent('NaHCO3');
    if (!r2) r2 = window.MebiData.getReagent('Pb(NO3)2');
    if (!rx) rx = window.MebiData.getReaction('NaHCO3', 'Pb(NO3)2');

    var currentTab = S.cameraTab || 'reactants';
    var isPhysicalMix = (rx && rx.typeCategory === 'none');

    // 1. Reaksiyona Özel Akıllı CPK Atom Elementleri
    var REAGENT_ELEMENTS = {
      'NaHCO3': ['Na', 'H', 'C', 'O'],
      'H2O2': ['H', 'O'],
      'KI': ['K', 'I'],
      'Pb(NO3)2': ['Pb', 'N', 'O'],
      'CaCO3': ['Ca', 'C', 'O'],
      'HCl': ['H', 'Cl'],
      'CaCl2': ['Ca', 'Cl'],
      'NaOH': ['Na', 'O', 'H'],
      'NH3': ['N', 'H'],
      'CuSO4': ['Cu', 'S', 'O'],
      'Cu(NO3)2': ['Cu', 'N', 'O'],
      'Na2CO3': ['Na', 'C', 'O'],
      'AgNO3': ['Ag', 'N', 'O'],
      'NaCl': ['Na', 'Cl'],
      'BaCl2': ['Ba', 'Cl'],
      'Na2SO4': ['Na', 'S', 'O'],
      'MnO2': ['Mn', 'O'],
      'Zn': ['Zn'],
      'Cu': ['Cu'],
      'Fe': ['Fe']
    };

    var CPK_DATA = {
      H: { name: 'Hidrojen', color: '#FFFFFF', border: '#CBD5E1' },
      O: { name: 'Oksijen', color: '#FF0D0D' },
      C: { name: 'Karbon', color: '#909090' },
      N: { name: 'Azot', color: '#3050F8' },
      Cl: { name: 'Klor', color: '#1FF01F' },
      Na: { name: 'Sodyum', color: '#AB5CF2' },
      Pb: { name: 'Kurşun', color: '#575961' },
      I: { name: 'İyot', color: '#940094' },
      Ag: { name: 'Gümüş', color: '#C0C0C0' },
      Cu: { name: 'Bakır', color: '#C88033' },
      Ca: { name: 'Kalsiyum', color: '#3DFF00' },
      Ba: { name: 'Baryum', color: '#00C900' },
      K: { name: 'Potasyum', color: '#8F40D4' },
      S: { name: 'Kükürt', color: '#FFFF30' },
      Zn: { name: 'Çinko', color: '#7D80B0' },
      Mn: { name: 'Mangan', color: '#9C7AC7' },
      Fe: { name: 'Demir', color: '#E06633' }
    };

    function uniqueSymbols(symbols) {
      return symbols.filter(function(symbol, index) { return CPK_DATA[symbol] && symbols.indexOf(symbol) === index; });
    }
    function formulaSymbols(formula, fallback) {
      var parsed = String(formula || '').match(/[A-Z][a-z]?/g) || [];
      parsed = uniqueSymbols(parsed);
      return parsed.length ? parsed : uniqueSymbols(fallback || []);
    }
    var IONIC_NOTATION = {
      NaHCO3: 'Na⁺ + HCO₃⁻',
      H2O2: 'Moleküler Yapı (İyonlaşmaz)',
      KI: 'K⁺ + I⁻',
      'Pb(NO3)2': 'Pb²⁺ + 2NO₃⁻',
      CaCO3: 'Ca²⁺ + CO₃²⁻ (Kristal Kafes)',
      HCl: 'H⁺ + Cl⁻',
      CaCl2: 'Ca²⁺ + 2Cl⁻',
      NaOH: 'Na⁺ + OH⁻',
      NH3: 'Moleküler Çözelti (İyonlaşmaz)',
      AgNO3: 'Ag⁺ + NO₃⁻',
      'Cu(NO3)2': 'Cu²⁺ + 2NO₃⁻',
      Na2CO3: '2Na⁺ + CO₃²⁻ (Kristal Kafes)',
      NaCl: 'Na⁺ + Cl⁻',
      BaCl2: 'Ba²⁺ + 2Cl⁻',
      Na2SO4: '2Na⁺ + SO₄²⁻',
      CuSO4: 'Cu²⁺ + SO₄²⁻'
    };
    function ionicNotation(reagent) {
      if (!reagent) return '';
      if (IONIC_NOTATION[reagent.id]) return IONIC_NOTATION[reagent.id];
      if (reagent.solid) return reagent.f + ' (Kristal Kafes)';
      return '';
    }
    function getProductIonicNotation(key, rx, r1, r2, isPhysicalMix) {
      if (isPhysicalMix) {
        var reagent = (key === 'p2' ? r2 : r1);
        return ionicNotation(reagent);
      }
      var hasPpt = (rx && rx.obs && rx.obs.indexOf('precipitate') > -1);
      var hasGas = (rx && rx.obs && rx.obs.indexOf('gas') > -1);
      var isComplex = (rx && ((rx.typeCategories && rx.typeCategories.indexOf('complex') > -1) || rx.typeCategory === 'complex'));
      var isHclNaoh = (r1 && r2 && ((r1.id === 'HCl' && r2.id === 'NaOH') || (r1.id === 'NaOH' && r2.id === 'HCl')));
      var isO2Gas = (r1 && r2 && (r1.id === 'H2O2' || r2.id === 'H2O2'));
      var isCl2Gas = (r1 && r2 && ((r1.id === 'H2O2' && r2.id === 'HCl') || (r1.id === 'HCl' && r2.id === 'H2O2')));

      var PPT_IONIC = {
        'AgCl': '[Ag⁺] · [Cl⁻] Kristal Kafesi',
        'PbI2': '[Pb²⁺] · 2[I⁻] Kristal Kafesi',
        'CaCO3': '[Ca²⁺] · [CO₃²⁻] Kristal Kafesi',
        'PbCO3': '[Pb²⁺] · [CO₃²⁻] Kristal Kafesi',
        'BaSO4': '[Ba²⁺] · [SO₄²⁻] Kristal Kafesi',
        'Cu(OH)2': '[Cu²⁺] · 2[OH⁻] Kristal Kafesi',
        'Pb(OH)2': '[Pb²⁺] · 2[OH⁻] Kristal Kafesi',
        'Ag2O': '2[Ag⁺] · [O²⁻] Kristal Kafesi',
        'Ag2CO3': '2[Ag⁺] · [CO₃²⁻] Kristal Kafesi',
        'Cu2CO3(OH)2': '2[Cu²⁺] · [CO₃²⁻] · 2[OH⁻] Kristal Kafesi'
      };

      if (hasPpt) {
        if (key === 'p1') {
          var sym = String((rx && rx.mainProductSymbol) || '').replace(/\(k\)$/i, '').replace(/\s+/g, '');
          return PPT_IONIC[sym] || (sym ? '[' + sym + '] Kristal Kafesi' : 'Katı İyonik Kristal Kafesi');
        }
        if (hasGas) {
          return (isO2Gas ? 'O₂' : 'CO₂') + ' (Moleküler Gaz)';
        }
        return (rx && rx.spectators) ? (rx.spectators + ' (Serbest İyonlar)') : 'Çözeltide Serbest İyonlar';
      }

      if (hasGas) {
        if (key === 'p1') {
          return (isO2Gas ? 'O₂' : (isCl2Gas ? 'Cl₂' : 'CO₂')) + ' (Moleküler Gaz)';
        }
        return (rx && rx.spectators) ? (rx.spectators + ' (Serbest İyonlar)') : 'Çözeltide Serbest İyonlar';
      }

      if (isComplex) {
        if (key === 'p1') {
          return ((rx && rx.mainProductSymbol) || '[Cu(NH₃)₄]²⁺') + ' (Kompleks Katyon)';
        }
        return (rx && rx.spectators) ? (rx.spectators + ' (Seyirci Anyonlar)') : 'NO₃⁻ Seyirci Anyonları';
      }

      // Nötrleşme
      if (key === 'p1') {
        return 'H⁺ + OH⁻ → H₂O (Moleküler Sıvı)';
      }
      return isHclNaoh ? 'Na⁺ + Cl⁻ (Serbest İyonlar)' : ((rx && rx.spectators) ? (rx.spectators + ' (Serbest İyonlar)') : 'Çözeltide Serbest İyonlar');
    }
    function particleIdentityHTML(formulaHTML, symbols, chemicalNameHTML, ionicFormulaHTML) {
      var parts = [];
      if (ionicFormulaHTML) {
        parts.push('<span class="particle-ionic-line" aria-label="Kimyasal gösterim">' + ionicFormulaHTML + '</span>');
      }
      if (chemicalNameHTML) {
        parts.push('<span class="particle-chemical-name">' + chemicalNameHTML + '</span>');
      }
      return '<div class="particle-identity-compact is-inline">' + parts.join('<span class="particle-identity-sep">·</span>') + '</div>';
    }

    var activeSymbols = [];
    var list1 = REAGENT_ELEMENTS[r1.id] || ['H', 'O'];
    var list2 = REAGENT_ELEMENTS[r2.id] || ['Na', 'Cl'];
    var combinedList = list1.concat(list2);
    for (var i = 0; i < combinedList.length; i++) {
      if (activeSymbols.indexOf(combinedList[i]) === -1 && CPK_DATA[combinedList[i]]) {
        activeSymbols.push(combinedList[i]);
      }
    }

    var cpkChipsHtml = '';
    for (var k = 0; k < activeSymbols.length; k++) {
      var sym = activeSymbols[k];
      var cpk = CPK_DATA[sym];
      var bStyle = cpk.border ? ('border:1px solid ' + cpk.border + ';') : '';
      cpkChipsHtml += '<div class="cpk-item">' +
        '<span class="cpk-dot" style="background:' + cpk.color + ';' + bStyle + '"></span>' +
        '<span>' + esc(sym) + ' (' + esc(cpk.name) + ')</span>' +
      '</div>';
    }

    // 2. Üst Yapı
    var html = topbarHTML(true, 'micro') +
      '<div class="mebi-card">' +

        // Bütünleşik Çift Sekme Çubuğu (Connected Stepper Tabs)
        '<div class="report-connected-nav" role="tablist" aria-label="Tanecik Boyutu Aşamaları">' +
          // Adım 1: Giren Tepkenler
          '<button type="button" role="tab" aria-selected="' + (currentTab === 'reactants') + '" class="report-conn-tab ' + (currentTab === 'reactants' ? 'is-active' : 'is-completed') + '" data-action="setCameraTab" data-arg="reactants">' +
            '<span class="report-conn-badge">1</span>' +
            '<span class="report-conn-icon">' + window.MebiSVG.icon('flaskOutline') + '</span>' +
            '<span class="report-conn-text">' +
              '<span class="report-conn-title">1. GİREN TEPKENLER</span>' +
              '<span class="report-conn-sub">Başlangıç Tanecik Modelleri</span>' +
            '</span>' +
            (currentTab === 'products' ? '<span class="report-conn-check">✓</span>' : '') +
          '</button>' +

          // Akış Ayracı (Chevron)
          '<div class="report-conn-divider" aria-hidden="true">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
              '<polyline points="9 18 15 12 9 6"></polyline>' +
            '</svg>' +
          '</div>' +

          // Adım 2: Oluşan Çıktılar / Ürünler
          '<button type="button" role="tab" aria-selected="' + (currentTab === 'products') + '" class="report-conn-tab ' + (currentTab === 'products' ? 'is-active' : '') + '" data-action="setCameraTab" data-arg="products">' +
            '<span class="report-conn-badge">2</span>' +
            '<span class="report-conn-icon">' + window.MebiSVG.icon('sparkles') + '</span>' +
            '<span class="report-conn-text">' +
              '<span class="report-conn-title">' + (isPhysicalMix ? '2. FİZİKSEL KARIŞIM' : '2. OLUŞAN ÜRÜNLER') + '</span>' +
              '<span class="report-conn-sub">' + (isPhysicalMix ? 'Serbest ve Bağımsız Tanecikler' : 'Yeni Bağlar & Kristal/Molekül Modeli') + '</span>' +
            '</span>' +
          '</button>' +
        '</div>';

    var smartBarHTML = '<div class="cpk-smart-bar">' +
      '<div class="cpk-smart-items">' +
        '<span class="cpk-smart-label">ATOM RENKLERİ:</span>' +
        cpkChipsHtml +
      '</div>' +
    '</div>';

    // 3. İÇERİK BÖLÜMÜ
    if (currentTab === 'reactants') {
      // SEKME 1: TEPKENLER (Başlangıç Tanecik Modelleri)
      html += '<div class="camera-tab-pane is-active">' +
        // Makroskobik Durum Şeridi
        '<div class="camera-macro-strip">' +
          '<span class="macro-strip-badge">👁️ Makroskobik Durum:</span>' +
          '<span class="macro-strip-text">' + esc(rx.macroReactantsText || (r1.name + ' ve ' + r2.name + ' sulu ortamda ayrı ayrı hazırlanmıştır.')) + '</span>' +
        '</div>' +

        // 3B Tanecik Kartları Grid'i
        '<div class="camera-particles-row">' +
          // Kart 1: Tepken 1
          '<div class="particle-subcard">' +
            '<div class="particle-subcard-title">' +
              '<div class="particle-title-left">' +
                '<span class="particle-state-badge ' + (r1.solid ? 'badge-solid' : 'badge-aqueous') + '">' +
                  (r1.solid ? 'Katı Kristal' : 'Sulu Çözelti') +
                '</span>' +
                '<span>' + esc(r1.f) + ' ' + (r1.solid ? '(katı)' : '(suda)') + '</span>' +
              '</div>' +
            '</div>' +
            '<div class="particle-subcard-body particle-3d-host" data-particle-view="r1" data-particle-type="' + esc(r1.id) + '" data-particle-mode="' + (r1.solid ? 'crystal' : 'solution') + '" aria-label="' + esc(r1.name) + ' üç boyutlu tanecik modeli"></div>' + particleIdentityHTML(esc(r1.f), list1, esc(r1.name), esc(ionicNotation(r1))) +
            '<div class="particle-caption">' +
              '<div class="sub-ion">' + (r1.solid ? '3B iyonik yapı (kristal)' : (r1.id === 'H2O2' || r1.id === 'NH3' ? 'Suda çözünmüş molekül' : 'Suda birbirinden bağımsız iyonlar')) + '</div>' +
            '</div>' +
          '</div>' +

          // Kart 2: Tepken 2
          '<div class="particle-subcard">' +
            '<div class="particle-subcard-title">' +
              '<div class="particle-title-left">' +
                '<span class="particle-state-badge ' + (r2.solid ? 'badge-solid' : 'badge-aqueous') + '">' +
                  (r2.solid ? 'Katı Kristal' : 'Sulu Çözelti') +
                '</span>' +
                '<span>' + esc(r2.f) + ' ' + (r2.solid ? '(katı)' : '(suda)') + '</span>' +
              '</div>' +
            '</div>' +
            '<div class="particle-subcard-body particle-3d-host" data-particle-view="r2" data-particle-type="' + esc(r2.id) + '" data-particle-mode="' + (r2.solid ? 'crystal' : 'solution') + '" aria-label="' + esc(r2.name) + ' üç boyutlu tanecik modeli"></div>' + particleIdentityHTML(esc(r2.f), list2, esc(r2.name), esc(ionicNotation(r2))) +
            '<div class="particle-caption">' +
              '<div class="sub-ion">' + (r2.solid ? '3B iyonik yapı (kristal)' : (r2.id === 'H2O2' || r2.id === 'NH3' ? 'Suda çözünmüş molekül' : 'Suda birbirinden bağımsız iyonlar')) + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        
        smartBarHTML +

        // Tanecik Düzeyi Değerlendirmesi
        '<div class="camera-note-box">' +
          '<b>Tanecik Düzeyi Değerlendirmesi:</b> ' + esc(rx.microReactantsNote || (r1.name + ' ve ' + r2.name + ' tanecikleri sulu ortamda serbest solvatize dağılmıştır.')) +
        '</div>' +
      '</div>';
    } else {
      // SEKME 2: OLUŞAN ÜRÜNLER VEYA FİZİKSEL KARIŞIM
      html += '<div class="camera-tab-pane is-active">' +
        // Makroskobik Durum Şeridi
        '<div class="camera-macro-strip">' +
          '<span class="macro-strip-badge">👁️ Makroskobik Durum:</span>' +
          '<span class="macro-strip-text">' + esc((rx.macroProductsText || 'Karışım gerçekleştikten sonra elde edilen durum.') + (rx.scenarioNote ? ' ' + rx.scenarioNote : '')) + '</span>' +
        '</div>' +

        // 3B Tanecik Kartları Grid'i
        '<div class="camera-particles-row">';

        if (isPhysicalMix) {
          html += '<div class="particle-subcard">' +
            '<div class="particle-subcard-title">' +
              '<div class="particle-title-left">' +
                '<span class="particle-state-badge badge-physical">Fiziksel Karışım</span>' +
                '<span>' + esc(r1.f) + '</span>' +
              '</div>' +
            '</div>' +
            '<div class="particle-subcard-body particle-3d-host" data-particle-view="p1" aria-label="Birinci madde üç boyutlu karışım modeli"></div>' + particleIdentityHTML(esc(r1.f), list1, esc(r1.name), esc(ionicNotation(r1))) +
            '<div class="particle-caption">' +
              '<div class="sub-ion">' + (r1.solid ? 'Katı Yapısını Korur (Tepkime Yok)' : 'Sulu Çözeltide Orijinal Halinde Kalır') + '</div>' +
            '</div>' +
          '</div>' +

          '<div class="particle-subcard">' +
            '<div class="particle-subcard-title">' +
              '<div class="particle-title-left">' +
                '<span class="particle-state-badge badge-physical">Fiziksel Karışım</span>' +
                '<span>' + esc(r2.f) + '</span>' +
              '</div>' +
            '</div>' +
            '<div class="particle-subcard-body particle-3d-host" data-particle-view="p2" aria-label="İkinci madde üç boyutlu karışım modeli"></div>' + particleIdentityHTML(esc(r2.f), list2, esc(r2.name), esc(ionicNotation(r2))) +
            '<div class="particle-caption">' +
              '<div class="sub-ion">' + (r2.solid ? 'Katı Yapısını Korur (Tepkime Yok)' : 'Sulu Çözeltide Orijinal Halinde Kalır') + '</div>' +
            '</div>' +
          '</div>';
        } else {
          // Modelleme Aşamasında Oluşan BÜTÜN Ürünler, Moleküller ve İyonlar Eksiksiz Listelenir
          var prodCards = [];
          var hasPpt = (rx.obs && rx.obs.indexOf('precipitate') > -1);
          var hasGas = (rx.obs && rx.obs.indexOf('gas') > -1) || /CO2|O2|Cl2/i.test(rx.products || '');
          var hasWater = /H2O|H₂O/i.test(rx.products || '');
          var isComplex = (rx.typeCategories && rx.typeCategories.indexOf('complex') > -1) || (rx.typeCategory === 'complex');
          var isO2Gas = (r1.id === 'H2O2' || r2.id === 'H2O2') && !(r1.id === 'HCl' || r2.id === 'HCl');
          var isCl2Gas = (r1.id === 'H2O2' && r2.id === 'HCl') || (r1.id === 'HCl' && r2.id === 'H2O2');

          // 1. Katı Çökelti (Varsa)
          if (hasPpt) {
            var rawSym = String(rx.mainProductSymbol || '').replace(/\(k\)$/i, '').trim();
            if (/Ag\(k\)/i.test(rx.mainProductSymbol)) rawSym = 'Ag';
            else if (/CuI/i.test(rx.mainProductSymbol)) rawSym = 'CuI';
            else if (/Cu2CO3/i.test(rx.mainProductSymbol)) rawSym = 'Cu2CO3(OH)2';
            else if (!rawSym) rawSym = 'Katı Çökelti';

            var pptName = 'Katı kristal çökelti';
            if (rawSym === 'PbI2') pptName = 'Kurşun(II) iyodür';
            else if (rawSym === 'AgCl') pptName = 'Gümüş klorür';
            else if (rawSym === 'CaCO3') pptName = 'Kalsiyum karbonat';
            else if (rawSym === 'PbCO3') pptName = 'Kurşun(II) karbonat';
            else if (rawSym === 'BaSO4') pptName = 'Baryum sülfat';
            else if (rawSym === 'AgI') pptName = 'Gümüş iyodür';
            else if (rawSym === 'CuI') pptName = 'Bakır(I) iyodür';
            else if (rawSym === 'PbCl2') pptName = 'Kurşun(II) klorür';
            else if (rawSym === 'Pb(OH)2') pptName = 'Kurşun(II) hidroksit';
            else if (rawSym === 'Ca(OH)2') pptName = 'Kalsiyum hidroksit';
            else if (rawSym === 'Ag2O') pptName = 'Gümüş(I) oksit';
            else if (rawSym === 'Cu(OH)2') pptName = 'Bakır(II) hidroksit';
            else if (rawSym === 'Ag2CO3') pptName = 'Gümüş karbonat';
            else if (/Cu2CO3/i.test(rawSym)) pptName = 'Malahit (Bakır karbonat)';

            prodCards.push({
              viewId: 'p_ppt',
              type: rawSym,
              mode: 'crystal',
              badge: '<span class="particle-state-badge badge-solid">Katı Çökelti</span>',
              title: esc(rawSym) + ' (Çökelti)',
              formula: esc(rawSym),
              chemicalName: pptName,
              caption: 'Suda çözünmeyen katı kristal kafesi beherin dibine çöker.',
              ionic: getProductIonicNotation('p1', rx, r1, r2, false)
            });
          }

          // 2. Açığa Çıkan Gaz (Varsa)
          if (hasGas) {
            var gasType = isO2Gas ? 'O2' : (isCl2Gas ? 'Cl2' : 'CO2');
            var gasForm = isO2Gas ? 'O₂' : (isCl2Gas ? 'Cl₂' : 'CO₂');
            var gasName = isO2Gas ? 'Oksijen gazı' : (isCl2Gas ? 'Klor gazı' : 'Karbondioksit gazı');
            prodCards.push({
              viewId: 'p_gas',
              type: gasType,
              mode: 'gas',
              badge: '<span class="particle-state-badge badge-gas">Açığa Çıkan Gaz</span>',
              title: gasForm + ' (Gaz)',
              formula: gasForm,
              chemicalName: gasName,
              caption: 'Tepkime sonucu oluşan serbest gaz molekülleri çözeltiden ayrılır.',
              ionic: gasForm + ' (Moleküler Gaz)'
            });
          }

          // 3. Koordinasyon Kompleksi (Varsa)
          if (isComplex) {
            var compForm = rx.mainProductSymbol || '[Cu(NH₃)₄]²⁺';
            prodCards.push({
              viewId: 'p_complex',
              type: compForm,
              mode: 'solution',
              badge: '<span class="particle-state-badge badge-complex">Koordinasyon Kompleksi</span>',
              title: esc(compForm),
              formula: esc(compForm),
              chemicalName: 'Koordinasyon kompleksi',
              caption: 'Merkez katyona ligandların koordine kovalent bağlarla bağlanmasıyla oluşan kompleks.',
              ionic: esc(compForm) + ' (Kompleks İyon)'
            });
          }

          // 4. Oluşan / Nötrleşme Suyu (H2O) (Varsa)
          if (hasWater) {
            prodCards.push({
              viewId: 'p_water',
              type: 'H2O',
              mode: 'solution',
              badge: '<span class="particle-state-badge badge-aqueous">Tepkime Suyu</span>',
              title: 'H₂O (Su)',
              formula: 'H₂O',
              chemicalName: 'Su',
              caption: 'Tepkime sürecinde oluşan kararlı kovalent H₂O molekülleri.',
              ionic: 'H₂O (Kovalent Molekül)'
            });
          }

          // 5. Sulu Çözeltideki Seyirci / Çözünmüş İyonlar (Varsa)
          var spec = rx.spectators;
          if (spec && spec !== 'Yok' && !/Fiziksel/.test(spec)) {
            var cleanSpecType = spec.replace(/\(suda\)/gi, '').replace(/\s+ve\s+/gi, ', ').replace(/[+−\-⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]/g, '').trim();
            var cleanSpecTitle = spec.replace(/\(suda\)/gi, '').trim();
            prodCards.push({
              viewId: 'p_ions',
              type: cleanSpecType,
              mode: 'solution',
              badge: '<span class="particle-state-badge badge-aqueous">Sulu Çözelti</span>',
              title: esc(cleanSpecTitle) + ' (Çözeltideki İyonlar)',
              formula: esc(cleanSpecTitle),
              chemicalName: 'Seyirci iyonlar',
              caption: 'Çökelmeye veya gaza katılmayan serbest iyonlar çözeltide bağımsız solvatize hareket eder.',
              ionic: esc(cleanSpecTitle) + ' (Serbest İyonlar)'
            });
          } else if (!hasPpt && !hasGas && !isComplex && !hasWater) {
            prodCards.push({
              viewId: 'p_default',
              type: rx.mainProductSymbol || 'NaCl',
              mode: 'solution',
              badge: '<span class="particle-state-badge badge-aqueous">Çözünmüş Ürün</span>',
              title: esc(rx.mainProductSymbol || 'Çözünmüş Ürün'),
              formula: esc(rx.mainProductSymbol || 'Ürün'),
              chemicalName: 'Çözeltideki tanecikler',
              caption: 'Çözeltide serbest hareket eden tanecikler.',
              ionic: 'Çözeltide Serbest İyonlar'
            });
          }

          // Her bir ürün kartı için 3B görselleştirici ve kimyasal bilgi kartı üret
          for (var p = 0; p < prodCards.length; p++) {
            var card = prodCards[p];
            html += '<div class="particle-subcard">' +
              '<div class="particle-subcard-title">' +
                '<div class="particle-title-left">' + card.badge + ' <span>' + card.title + '</span></div>' +
              '</div>' +
              '<div class="particle-subcard-body particle-3d-host" data-particle-view="' + card.viewId + '" data-particle-type="' + esc(card.type) + '" data-particle-mode="' + card.mode + '" aria-label="' + card.title + ' üç boyutlu tanecik modeli"></div>' +
              particleIdentityHTML(card.formula, formulaSymbols(card.formula, list1.concat(list2)), esc(card.chemicalName), card.ionic) +
              '<div class="particle-caption">' +
                '<div>' + card.caption + '</div>' +
              '</div>' +
            '</div>';
          }
        }

        html += '</div>' +

        smartBarHTML +

        // Tanecik Düzeyi Değerlendirmesi
        '<div class="camera-note-box" style="border-left-color:var(--mebi-teal);">' +
          '<b>Tanecik Düzeyi Değerlendirmesi:</b> ' + esc(rx.microProductsNote || 'Süreç sonrasındaki mikroskobik tanecik düzeni.') +
        '</div>' +
      '</div>';
    }

    // 4. Entegre Alt Eylem & Başarı Çubuğu
    html += '<div class="camera-bottom-bar">' +





      '<div class="camera-mastery-pill">' +
        '<span class="mastery-pill-icon">' + window.MebiSVG.icon('award') + '</span>' +
        '<span class="mastery-pill-text">Deney Tamamlandı • Koleksiyona Kaydedildi</span>' +
      '</div>' +

      '<div class="camera-bottom-actions">' +
        (currentTab === 'reactants'
          ? '<button class="mebi-btn mebi-btn-primary mebi-btn-sm" data-action="setCameraTab" data-arg="products">' +
              '<span>2. Oluşan Ürünlerin Modellerine Geç ➔</span>' +
            '</button>'
          : '<button class="mebi-btn mebi-btn-secondary mebi-btn-sm" data-action="goPool">' +
              '<span class="mebi-btn-badge">' + window.MebiSVG.icon('flaskOutline') + '</span>' +
              '<span>Yeni Deney Yap</span>' +
            '</button>' +
            '<button class="mebi-btn mebi-btn-primary mebi-btn-sm" data-action="goCollection">' +
              '<span class="mebi-btn-badge">' + window.MebiSVG.icon('grid') + '</span>' +
              '<span>Koleksiyonum (' + S.collection.length + ')</span>' +
            '</button>'
        ) +
      '</div>' +
    '</div>' +
  '</div>'; // mebi-card end

  return html;
}

  // EKRAN 6: KOLEKSİYON (COLLECTION)
  function screenCollection() {
    var totalDiscovered = S.collection.length;
    var totalReactions = 36;

    var canResume = !!(S.resumeScreen && S.resumeScreen !== 'menu' && S.resumeScreen !== 'collection');

    var resumeBtnHeader = '<button class="mebi-btn ' + (canResume ? 'mebi-btn-primary' : 'mebi-btn-secondary') + ' mebi-btn-sm" ' +
      (canResume ? 'data-action="resumeExperiment"' : 'disabled aria-disabled="true"') +
      ' title="' + (canResume ? 'Kaldığınız deney aşamasına geri dönün' : 'Devam edilecek aktif bir deney aşaması bulunmuyor') + '">' +
        '<span class="mebi-btn-badge">' + window.MebiSVG.icon('play') + '</span>' +
        '<span>Deneye Devam Et</span>' +
      '</button>';

    var resumeBtnFooter = '<button class="mebi-btn ' + (canResume ? 'mebi-btn-primary' : 'mebi-btn-secondary') + '" ' +
      (canResume ? 'data-action="resumeExperiment"' : 'disabled aria-disabled="true"') +
      ' title="' + (canResume ? 'Kaldığınız deney aşamasına geri dönün' : 'Devam edilecek aktif bir deney aşaması bulunmuyor') + '">' +
        '<span class="mebi-btn-badge">' + window.MebiSVG.icon('play') + '</span>' +
        '<span>Deneye Devam Et</span>' +
      '</button>';

    var bodyHtml = '';
    if (totalDiscovered === 0) {
      bodyHtml = '<div style="text-align:center;padding:40px 20px;color:var(--mebi-text-secondary);">' +
        '<p style="font-size:16px;margin-bottom:18px;">Henüz tamamlanmış bir tepkime kartınız bulunmuyor. Madde havuzundan reaktif seçerek ilk deneyinizi gerçekleştirin!</p>' +
        '<div style="display:flex;gap:12px;justify-content:center;align-items:center;flex-wrap:wrap;">' +
          resumeBtnFooter +
          '<button class="mebi-btn mebi-btn-secondary" data-action="goPool">' +
            '<span class="mebi-btn-badge">' + window.MebiSVG.icon('flaskOutline') + '</span>' +
            '<span>Madde Havuzuna Git</span>' +
          '</button>' +
        '</div>' +
      '</div>';
    } else {
      bodyHtml = '<div class="collection-grid">' +
        S.collection.map(function(c, i) {
          return '<div class="collection-card">' +
            '<div class="collection-card-num">DENEY #' + String(i + 1).padStart(3, '0') + '</div>' +
            '<div class="collection-card-formula">' + esc(c.r1) + ' + ' + esc(c.r2) + '</div>' +
            '<div class="collection-card-type">' + esc(c.type) + '</div>' +
            '<div class="collection-card-eq">' + esc(c.eq) + '</div>' +
          '</div>';
        }).join('') +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:24px;flex-wrap:wrap;gap:12px;">' +
        '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">' +
          resumeBtnFooter +
          '<button class="mebi-btn mebi-btn-secondary" data-action="goPool">' +
            '<span class="mebi-btn-badge">' + window.MebiSVG.icon('flaskIc') + '</span>' +
            '<span>Yeni Deney Başlat</span>' +
          '</button>' +
        '</div>' +
        '<button class="mebi-btn mebi-btn-ghost mebi-btn-sm" data-action="clearCollection">' +
          '<span class="mebi-btn-badge">' + window.MebiSVG.icon('reset') + '</span>' +
          '<span>Koleksiyonu Sıfırla</span>' +
        '</button>' +
      '</div>';
    }

    var resumeStage = null;
    if (canResume) {
      if (S.resumeScreen === 'card') resumeStage = 'card';
      else if (S.resumeScreen === 'micro') resumeStage = 'micro';
      else if (S.resumeScreen === 'lab') resumeStage = S.resumeLabStep || 'predict';
      else resumeStage = 'predict';
    }

    var html = topbarHTML(true, resumeStage) +
      '<div class="mebi-card">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:12px;">' +
          '<div>' +
            '<span class="mebi-badge mebi-badge-success">LABORATUVAR GÜNLÜĞÜ</span>' +
            '<h2 style="font-size:24px;margin-top:4px;font-weight:800;">Keşfedilen Tepkime Kartları (' + totalDiscovered + ' / ' + totalReactions + ')</h2>' +
          '</div>' +
          '<div style="display:flex;gap:8px;align-items:center;">' +
            resumeBtnHeader +
            '<button class="mebi-btn mebi-btn-secondary mebi-btn-sm" data-action="goMenu">' +
              '<span class="mebi-btn-badge">' + window.MebiSVG.icon('undo') + '</span>' +
              '<span>Menüye Dön</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
        bodyHtml +
      '</div>';

    return html;
  }

  /* ----------------- 4. SÜRÜKLE VE BIRAK MOTORU (DRAG & DROP) ----------------- */
  function wireDragAndDrop() {
    if (window.LabScene && window.LabScene.available) return;
    var dragEl = document.getElementById('dragBeaker');
    var mainVessel = document.getElementById('mainVessel');
    var bench = document.getElementById('labBenchContainer');
    if (!dragEl || !mainVessel || !bench || S.labStep !== 'ready') return;

    var isDragging = false;
    var startX = 0, startY = 0;

    function getCoords(e) {
      if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      return { x: e.clientX, y: e.clientY };
    }

    function onPointerDown(e) {
      if (e.target && e.target.closest && e.target.closest('.beaker-side-pour-btn')) {
        return;
      }
      isDragging = true;
      dragEl.classList.add('dragging');
      var coords = getCoords(e);
      startX = coords.x;
      startY = coords.y;
      try { dragEl.setPointerCapture(e.pointerId); } catch (err) {}
      if (window.MebiAudio) window.MebiAudio.playClick();
      e.preventDefault();
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      var coords = getCoords(e);
      var dx = coords.x - startX;
      var dy = coords.y - startY;
      dragEl.style.transform = 'translate(' + dx + 'px, ' + dy + 'px) scale(1.05)';
    }

    function onPointerUp(e) {
      if (!isDragging) return;
      isDragging = false;
      dragEl.classList.remove('dragging');

      var dragRect = dragEl.getBoundingClientRect();
      var mainRect = mainVessel.getBoundingClientRect();
      var dragCenter = { x: dragRect.left + dragRect.width / 2, y: dragRect.top + dragRect.height / 2 };
      var pad = 50;

      var isOverMain = (
        dragCenter.x >= mainRect.left - pad &&
        dragCenter.x <= mainRect.right + pad &&
        dragCenter.y >= mainRect.top - pad &&
        dragCenter.y <= mainRect.bottom + pad
      );

      if (isOverMain) {
        dispatch('triggerPour');
      } else {
        dragEl.style.transform = '';
      }
    }

    dragEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  }

  /* ----------------- 5. EYLEMLER VE YÖNLENDİRİCİ (ACTIONS & ROUTER) ----------------- */
  var actions = {
    toggleReagentPanel: function() {
      S.reagentPanelCollapsed = !S.reagentPanelCollapsed;
      render(false);
    },
    goMenu: function() {
      if (window.MebiAudio) window.MebiAudio.playClick();
      S.screen = 'menu';
      S.resumeScreen = null;
      S.resumeLabStep = null;
      render();
    },
    goPool: function() {
      ++fillToken; S.isFilling = false;
      if (window.MebiAudio) window.MebiAudio.playClick();
      S.reagentPanelCollapsed = false;
      S.screen = 'pool';
      S.selectedSlot1 = null;
      S.selectedSlot2 = null;
      S.activeReaction = null;
      S.poured = false;
      S.labStep = 'predict';
      S.prediction = [];
      S.resumeScreen = null;
      S.resumeLabStep = null;
      S.labView = 'wide';
      if (window.Mebi3DLab && typeof window.Mebi3DLab.setView === 'function') {
        window.Mebi3DLab.setView('wide');
      }
      render();
    },
    changeReactants: function() {
      ++fillToken; S.isFilling = false;
      if (window.MebiAudio) window.MebiAudio.playClick();
      S.reagentPanelCollapsed = false;
      S.screen = 'pool';
      S.selectedSlot1 = null;
      S.selectedSlot2 = null;
      S.activeReaction = null;
      S.poured = false;
      S.labStep = 'predict';
      S.prediction = [];
      S.resumeScreen = null;
      S.resumeLabStep = null;
      render();
    },
    goCollection: function() {
      if (window.MebiAudio) window.MebiAudio.playClick();
      if (S.screen !== 'collection') {
        if (S.screen === 'lab' || S.screen === 'card' || S.screen === 'micro' || S.screen === 'pool') {
          S.resumeScreen = S.screen;
          S.resumeLabStep = S.labStep;
        } else {
          S.resumeScreen = null;
          S.resumeLabStep = null;
        }
      }
      S.screen = 'collection';
      render();
    },
    resumeExperiment: function() {
      if (window.MebiAudio) window.MebiAudio.playClick();
      var target = S.resumeScreen || ((S.selectedSlot1 && S.selectedSlot2) ? (S.labStep ? 'lab' : 'pool') : 'pool');
      if (target === 'collection' || target === 'menu') {
        target = (S.selectedSlot1 && S.selectedSlot2) ? (S.labStep ? 'lab' : 'pool') : 'pool';
      }
      S.screen = target;
      if (S.screen === 'lab') {
        if (S.resumeLabStep === 'pouring' || S.resumeLabStep === 'reacting') {
          S.labStep = S.poured ? 'observed' : 'ready';
        } else if (S.resumeLabStep) {
          S.labStep = S.resumeLabStep;
        } else {
          S.labStep = 'predict';
        }
      }
      render();
    },
    // Uygulama ve Laboratuvar Rehberi (Yönerge standartlarına uyarlandı)
    openGuideDrawer: function() {
      if (window.MebiUI && window.MebiUI.openWelcomeModal) {
        window.MebiUI.openWelcomeModal();
        return;
      }
      var guideContent = '<div style="display:flex;flex-direction:column;gap:16px;line-height:1.65;font-size:14px;">' +
        '<div><b>1. Tepken Bölmesi:</b> Deney masasında incelemek istediğin iki kimyasal maddeyi seçerek 1. ve 2. tepken bölmesine yerleştir.</div>' +
        '<div><b>2. Tahmin Basamağı:</b> Maddeler karıştırılmadan önce bir kimyasal tepkimenin gerçekleşip gerçekleşmeyeceğini tahmin et. Gaz çıkışı, yeni bir katının/çökeleğin oluşması, renk değişimi veya sıcaklık değişimi gibi gözlenebilir belirtilerin ortaya çıkıp çıkmayacağını öngör.</div>' +
        '<div><b>3. Beher İçeriğini Aktarma:</b> Sağdaki beheri soldaki beherin üzerine sürükleyerek maddeleri karıştır veya "Beheri Dök" butonuna tıkla.</div>' +
        '<div><b>4. Sıcaklık Takibi:</b> Tepkime sırasında dijital daldırma termometresindeki sıcaklık değerini izle. Başlangıç ve son sıcaklık değerlerini karşılaştırarak ekzotermik veya izotermik değişimleri gözlemle.</div>' +
        '<div><b>5. Tanecik Kamerası:</b> "TEPKENLER" sekmesinde başlangıçtaki tanecik modellerini, "ÜRÜNLER" sekmesinde ise tepkime sonucunda oluşan katıların kristal örgü modellerini ve oluşan moleküllerin 3B modellerini incele. Makroskopik gözlemler ile tanecik düzeyindeki değişimler arasındaki ilişkiyi değerlendir.</div>' +
      '</div>';
      window.MebiUI.openDrawer('Uygulama ve Laboratuvar Rehberi', guideContent);
    },
    testOrientation: function() {
      if (window.MebiUI && window.MebiUI.openOrientation) {
        window.MebiUI.openOrientation();
      }
    },
    toggleFullscreen: function() {
      if (window.MebiAudio) window.MebiAudio.playClick();
      var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
      if (!isFs) {
        var docEl = document.documentElement;
        var rfs = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
        if (rfs) {
          rfs.call(docEl).catch(function(e) {
            console.warn('Tam ekran modu başlatılamadı:', e);
          });
        }
      } else {
        var efs = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
        if (efs) {
          efs.call(document).catch(function(e) {
            console.warn('Tam ekrandan çıkılamadı:', e);
          });
        }
      }
    },
    toggleTheme: function() {
      window.MebiUI.toggleTheme();
      render(false);
    },
    toggleLabSettings: function() {
      var triggers = document.querySelectorAll('.lab-settings-trigger');
      triggers.forEach(function(btn) { btn.classList.remove('gear-attention-highlight'); });
      S.labSettingsOpen = !S.labSettingsOpen;
      render(false);
    },
    closeLabSettings: function() {
      S.labSettingsOpen = false;
      render(false);
    },
    setLabView: function(view) {
      if (['desk', 'closeup', 'wide'].indexOf(view) < 0) return;
      S.labView = view;
      if (window.LabScene && window.LabScene.setView) window.LabScene.setView(view);
      render(false);
    },
    toggleLabLighting: function() {
      S.labLighting = S.labLighting === 'dark' ? 'light' : 'dark';
      if (window.LabScene && window.LabScene.setLighting) window.LabScene.setLighting(S.labLighting);
      try { localStorage.setItem('three-faces-laboratory-lighting', S.labLighting); } catch (e) {}
      render(false);
    },
    setTableColor: function(color) {
      if (['#466455', '#3d4547', '#fff2d7'].indexOf(color) < 0) return;
      S.tableColor = color;
      if (window.LabScene && window.LabScene.setTableColor) window.LabScene.setTableColor(color);
      try { localStorage.setItem('three-faces-table-color', color); } catch (e) {}
      render(false);
    },
    toggleAudio: function() {
      var isAudio = window.MebiAudio.isEnabled();
      window.MebiAudio.setEnabled(!isAudio);
      if (!isAudio) window.MebiAudio.playClick();
      window.MebiUI.showToast('info', 'Ses Ayarı', !isAudio ? 'Ses efektleri açıldı.' : 'Ses efektleri kapatıldı.', 2000);
      render(false);
    },
    setFilter: function(cat) {
      S.categoryFilter = cat;
      if (window.MebiAudio) window.MebiAudio.playClick();
      render(false);
    },
    clickReagent: function(id) {
      if (S.screen !== 'pool' || !window.MebiData.getReagent(id)) return;
      if (window.MebiAudio) window.MebiAudio.playClick();
      if (S.selectedSlot1 === id) {
        S.selectedSlot1 = null;
      } else if (S.selectedSlot2 === id) {
        S.selectedSlot2 = null;
      } else if (!S.selectedSlot1) {
        S.selectedSlot1 = id;
      } else if (!S.selectedSlot2) {
        S.selectedSlot2 = id;
      } else {
        S.selectedSlot2 = id;
      }
      S.reagentPanelCollapsed = !!(S.selectedSlot1 && S.selectedSlot2);
      S.labView = 'desk';
      finishSelection();
    },
    clearSlot: function(num) {
      if (S.screen !== 'pool') return;
      if (window.MebiAudio) window.MebiAudio.playClick();
      if (num === '1') S.selectedSlot1 = null;
      if (num === '2') S.selectedSlot2 = null;
      S.reagentPanelCollapsed = false;
      S.labView = 'desk';
      finishSelection();
    },
    resetPool: function() {
      if (S.screen !== 'pool') return;
      if (window.MebiAudio) window.MebiAudio.playClick();
      S.selectedSlot1 = null;
      S.selectedSlot2 = null;
      S.searchQuery = '';
      S.categoryFilter = 'all';
      S.reagentPanelCollapsed = false;
      S.labView = 'desk';
      finishSelection();
    },
    resetExperiment: function() {
      function doReset() {
        ++fillToken; S.isFilling = false;
        if (window.MebiAudio) window.MebiAudio.playClick();
        S.collection = [];
        saveCollectionToStorage();
        S.selectedSlot1 = null;
        S.selectedSlot2 = null;
        S.activeReaction = null;
        S.prediction = [];
        S.labStep = 'predict';
        S.manualTypeInput = '';
        S.manualTypeSelections = [];
        S.typeEvaluation = null;
        S.typeChecked = false;
        S.typeCorrect = false;
        S.cameraTab = 'reactants';
        S.reportTab = null;
        S.resumeScreen = null;
        S.resumeLabStep = null;
        S.screen = 'menu';
        render();
        if (window.MebiUI && window.MebiUI.showToast) {
          window.MebiUI.showToast('İlerleme ve keşif kartları başarıyla sıfırlandı.', 'info');
        }
      }
      if (window.MebiUI && window.MebiUI.openResetModal) {
        window.MebiUI.openResetModal(S.collection.length, doReset);
      } else {
        var approved = typeof window.confirm === 'function' && window.confirm('Bu işlem yaptığınız bütün keşifleri ve mevcut deney ilerlemesini kalıcı olarak silecektir. Devam etmek istiyor musunuz?');
        if (approved) doReset();
      }
    },
    startExperiment: function() {
      if (!S.selectedSlot1 || !S.selectedSlot2 || S.isFilling) return;
      if (window.MebiAudio) window.MebiAudio.playClick();
      enterPredictionScreen();
      render();
    },
    // Gözlem Butonları Mantığı (Yönergeye göre "Belirgin değişim yok" karşılıklı dışlayan çalışır)
    toggleObs: function(key) {
      if (window.MebiAudio) window.MebiAudio.playClick();
      var idx = S.prediction.indexOf(key);

      if (key === 'none') {
        if (idx > -1) {
          S.prediction = [];
        } else {
          // "Belirgin değişim yok" seçildiğinde diğer tüm seçenekler otomatik olarak pasifleşir/temizlenir
          S.prediction = ['none'];
        }
      } else {
        // Diğer seçeneklerden biri seçildiğinde "none" otomatik olarak kaldırılır
        var noneIdx = S.prediction.indexOf('none');
        if (noneIdx > -1) {
          S.prediction.splice(noneIdx, 1);
        }
        if (idx > -1) {
          S.prediction.splice(idx, 1);
        } else {
          S.prediction.push(key);
        }
      }
      render(false);
    },
    savePrediction: function() {
      if (S.screen !== 'lab' || S.labStep !== 'predict' || !S.activeReaction) return;
      if (window.MebiAudio) window.MebiAudio.playClick();
      S.labStep = 'ready';
      render();
    },
    redoPrediction: function() {
      if (window.MebiAudio) window.MebiAudio.playClick();
      S.labStep = 'predict';
      S.poured = false;
      if (S.activeReaction) {
        S.currentTemp = S.activeReaction.tempInit;
      }
      render();
    },
    triggerPour: function() {
      if (S.labStep !== 'ready') return;
      var reactionAtStart = S.activeReaction;
      S.labStep = 'pouring';
      S.poured = true;
      if (window.MebiAudio) window.MebiAudio.playPour();
      render(false);

      setTimeout(function() {
        if (S.activeReaction !== reactionAtStart || S.labStep !== 'pouring') return;
        S.labStep = 'reacting';
        var rx = S.activeReaction;
        if (window.MebiAudio && (rx.obs.indexOf('gas') > -1 || rx.hasTempRise)) {
          window.MebiAudio.playFizz();
        }

        var targetTemp = rx.tempFinal;
        var initTemp = rx.tempInit;
        var tempStep = (targetTemp - initTemp) / 10;
        var count = 0;
        var tempInterval = setInterval(function() {
          if (S.activeReaction !== reactionAtStart || (S.labStep !== 'reacting' && S.labStep !== 'observed')) {
            clearInterval(tempInterval);
            return;
          }
          count++;
          S.currentTemp += tempStep;
          var digitalValEl = document.getElementById('digitalTempValue');
          var thermoHeadEl = document.getElementById('digitalThermoHead');
          var sensorEl = document.getElementById('sensorTempDisplay');
          var textEl = document.getElementById('thermoText');

          if (digitalValEl) {
            digitalValEl.textContent = S.currentTemp.toFixed(1);
          } else if (textEl) {
            textEl.innerHTML = window.MebiSVG.icon('temp') + '<span>' + S.currentTemp.toFixed(1) + '°C</span>';
          }
          if (window.LabScene) window.LabScene.setTemperature(S.currentTemp);

          if (thermoHeadEl && rx.hasTempRise) {
            thermoHeadEl.classList.add('is-heating');
          }

          if (sensorEl) {
            var curD = (S.currentTemp - rx.tempInit).toFixed(1);
            var curSign = curD > 0 ? ('+' + curD) : curD;
            sensorEl.innerHTML = window.MebiSVG.icon('temp') + '<span>' + S.currentTemp.toFixed(1) + '°C</span><span style="font-size:11px;opacity:0.85;margin-left:4px;">(ΔT: ' + curSign + '°C)</span>';
          }

          if (count >= 10) {
            clearInterval(tempInterval);
            S.currentTemp = targetTemp;
            if (digitalValEl) digitalValEl.textContent = targetTemp.toFixed(1);
          }
        }, 100);

        render(false);

        setTimeout(function() {
          if (S.activeReaction !== reactionAtStart || S.labStep !== 'reacting') return;
          var exact = sameSet(S.prediction, rx.obs);
          S.labStep = 'observed';
          if (exact && window.MebiAudio) {
            window.MebiAudio.playSuccess();
          }
          render();
        }, 1600);
      }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 50 : 5000);
    },
    toCard: function() {
      if (window.MebiAudio) window.MebiAudio.playClick();
      S.reportTab = 'analysis';
      S.screen = 'card';
      render();
    },
    selectType: function(typeText) {
      if (window.MebiAudio) window.MebiAudio.playClick();
      if (!S.manualTypeSelections) S.manualTypeSelections = [];
      var isOptionE = (typeText && typeText.charAt(0) === 'E');
      var idx = S.manualTypeSelections.indexOf(typeText);

      if (isOptionE) {
        if (idx > -1) {
          S.manualTypeSelections = [];
        } else {
          // "Belirgin tepkime gözlenmez" (E) seçilince diğer tüm seçenekler temizlenir
          S.manualTypeSelections = [typeText];
        }
      } else {
        // A, B, C veya D seçilince E seçeneği varsa otomatik kaldırılır
        for (var i = S.manualTypeSelections.length - 1; i >= 0; i--) {
          if (S.manualTypeSelections[i].charAt(0) === 'E') {
            S.manualTypeSelections.splice(i, 1);
          }
        }
        if (idx > -1) {
          S.manualTypeSelections.splice(idx, 1);
        } else {
          S.manualTypeSelections.push(typeText);
        }
      }

      S.manualTypeSelections.sort();
      S.manualTypeInput = S.manualTypeSelections.join(', ');

      // Değerlendirme daha önce yapılmışsa güncel seçime göre anında yeniden değerlendir
      if (!S.activeReaction) S.activeReaction = window.MebiData.getReaction(S.selectedSlot1, S.selectedSlot2);
      if (S.manualTypeSelections.length > 0) {
        S.typeChecked = true;
        var rx = S.activeReaction;
        S.typeEvaluation = window.MebiData.evaluateReactionTypes(S.manualTypeSelections, rx);
        S.typeCorrect = (S.typeEvaluation && S.typeEvaluation.status === 'exact');
        if (S.typeCorrect && window.MebiAudio) window.MebiAudio.playSuccess();
      } else {
        S.typeEvaluation = null;
        S.typeChecked = false;
        S.typeCorrect = false;
      }
      render(false);
    },
    checkType: function() {
      if (!S.manualTypeSelections || S.manualTypeSelections.length === 0) return;
      if (window.MebiAudio) window.MebiAudio.playClick();
      var rx = S.activeReaction || window.MebiData.getReaction(S.selectedSlot1, S.selectedSlot2);
      S.activeReaction = rx;
      S.typeEvaluation = window.MebiData.evaluateReactionTypes(S.manualTypeSelections, rx);
      S.typeChecked = true;
      S.typeCorrect = (S.typeEvaluation && S.typeEvaluation.status === 'exact');

      if (S.typeCorrect && window.MebiAudio) {
        window.MebiAudio.playSuccess();
      } else if (S.typeEvaluation && S.typeEvaluation.status === 'partial' && window.MebiAudio) {
        window.MebiAudio.playSuccess();
      }
      render(false);

      // Inline evaluation status is shown directly in the quiz card
    },
    showEvalModal: function() {
      if (!S.typeEvaluation) return;
      if (window.MebiAudio) window.MebiAudio.playClick();
      if (window.MebiUI && window.MebiUI.openEvalModal) {
        window.MebiUI.openEvalModal(S.typeEvaluation, S.manualTypeSelections, S.activeReaction);
      }
    },
    saveCard: function() {
      if (!S.typeCorrect) return;
      if (window.MebiUI && window.MebiUI.closeEvalModal) {
        window.MebiUI.closeEvalModal();
      }
      if (window.MebiAudio) window.MebiAudio.playClick();
      var r1 = window.MebiData.getReagent(S.selectedSlot1);
      var r2 = window.MebiData.getReagent(S.selectedSlot2);
      var rx = S.activeReaction || (S.selectedSlot1 && S.selectedSlot2 ? window.MebiData.getReaction(S.selectedSlot1, S.selectedSlot2) : null);
      S.activeReaction = rx;

      var alreadyIn = false;
      for (var i = 0; i < S.collection.length; i++) {
        if (S.collection[i].eq === rx.eq) {
          alreadyIn = true;
          break;
        }
      }

      if (rx && !alreadyIn && rx.typeCategory !== 'none') {
        S.collection.push({
          r1: r1.f,
          r2: r2.f,
          type: rx.canonical,
          eq: rx.eq
        });
        saveCollectionToStorage();
        window.MebiUI.showToast('success', 'Yeni Tepkime Keşfedildi!', rx.title + ' başarıyla koleksiyonuna eklendi.', 4000);
      }

      S.cameraTab = 'reactants';
      S.screen = 'micro';
      render();
    },
    setReportTab: function(tab) {
      if (window.MebiAudio) window.MebiAudio.playClick();
      S.reportTab = tab;
      render(false);
    },
    setCameraTab: function(tab) {
      if (window.MebiAudio) window.MebiAudio.playClick();
      S.cameraTab = tab;
      render(false);
    },
    openAllCpkDrawer: function() {
      if (window.MebiAudio) window.MebiAudio.playClick();
      var CPK_ALL = [
        { sym: 'H', name: 'Hidrojen', color: '#FFFFFF', border: '#CBD5E1' },
        { sym: 'O', name: 'Oksijen', color: '#FF0D0D' },
        { sym: 'C', name: 'Karbon', color: '#909090' },
        { sym: 'N', name: 'Azot', color: '#3050F8' },
        { sym: 'Cl', name: 'Klor', color: '#1FF01F' },
        { sym: 'I', name: 'İyot', color: '#940094' },
        { sym: 'S', name: 'Kükürt', color: '#FFFF30' },
        { sym: 'Na', name: 'Sodyum', color: '#AB5CF2' },
        { sym: 'K', name: 'Potasyum', color: '#8F40D4' },
        { sym: 'Ca', name: 'Kalsiyum', color: '#3DFF00' },
        { sym: 'Ba', name: 'Baryum', color: '#00C900' },
        { sym: 'Pb', name: 'Kurşun', color: '#575961' },
        { sym: 'Ag', name: 'Gümüş', color: '#C0C0C0' },
        { sym: 'Cu', name: 'Bakır', color: '#C88033' },
        { sym: 'Fe', name: 'Demir', color: '#E06633' },
        { sym: 'Zn', name: 'Çinko', color: '#7D80B0' },
        { sym: 'Mn', name: 'Mangan', color: '#9C7AC7' }
      ];

      var r1 = window.MebiData.getReagent(S.selectedSlot1);
      var r2 = window.MebiData.getReagent(S.selectedSlot2);
      var currentSyms = [];
      if (r1 && r2) {
        var REAGENT_ELEMENTS = {
          'HCl': ['H', 'Cl'], 'NaOH': ['Na', 'O', 'H'], 'AgNO3': ['Ag', 'N', 'O'],
          'NaCl': ['Na', 'Cl'], 'KI': ['K', 'I'], 'Pb(NO3)2': ['Pb', 'N', 'O'],
          'BaCl2': ['Ba', 'Cl'], 'Na2SO4': ['Na', 'S', 'O'], 'CH3COOH': ['C', 'H', 'O'],
          'NH3': ['N', 'H'], 'H2SO4': ['H', 'S', 'O'], 'Ca(OH)2': ['Ca', 'O', 'H'],
          'CuSO4': ['Cu', 'S', 'O'],
          'Cu(NO3)2': ['Cu', 'N', 'O'],
          'Na2CO3': ['Na', 'C', 'O'], 'Fe': ['Fe'], 'Zn': ['Zn'], 'Cu': ['Cu'],
          'NaHCO3': ['Na', 'H', 'C', 'O'], 'MnO2': ['Mn', 'O'], 'H2O2': ['H', 'O']
        };
        var l1 = REAGENT_ELEMENTS[r1.id] || [];
        var l2 = REAGENT_ELEMENTS[r2.id] || [];
        currentSyms = l1.concat(l2);
      }

      var contentHtml = '<div style="font-size:13px;color:var(--mebi-text-secondary);line-height:1.5;margin-bottom:14px;">' +
        'Corey-Pauling-Koltun (CPK) renk standardı, kimyada moleküler ve iyonik 3B modellerde atom türlerini ayırt etmek için kullanılan uluslararası renk kodlamasıdır.' +
        (currentSyms.length > 0 ? ' <b style="color:var(--mebi-primary);">Vurgulanan elementler mevcut deneyinizde yer almaktadır.</b>' : '') +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(130px, 1fr));gap:8px;">';

      for (var i = 0; i < CPK_ALL.length; i++) {
        var el = CPK_ALL[i];
        var isCurrent = currentSyms.indexOf(el.sym) > -1;
        var bStyle = el.border ? ('border:1px solid ' + el.border + ';') : '';
        contentHtml += '<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;background:' + (isCurrent ? 'var(--mebi-primary-soft, #eff6ff)' : 'var(--mebi-surface-2, #f8fafc)') + ';border:1px solid ' + (isCurrent ? 'var(--mebi-primary, #2563eb)' : 'var(--mebi-border, #e2e8f0)') + ';">' +
          '<div style="width:20px;height:20px;border-radius:50%;background:' + el.color + ';' + bStyle + 'box-shadow:inset 0 2px 4px rgba(255,255,255,0.6), 0 2px 4px rgba(0,0,0,0.15);flex-shrink:0;"></div>' +
          '<div style="min-width:0;flex:1;">' +
            '<div style="font-weight:700;font-size:13px;color:var(--mebi-text-primary);display:flex;align-items:center;gap:4px;">' +
              el.sym + (isCurrent ? '<span style="font-size:10px;color:var(--mebi-primary);font-weight:800;">★ Bu Deneyde</span>' : '') +
            '</div>' +
            '<div style="font-size:11px;color:var(--mebi-text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + el.name + '</div>' +
          '</div>' +
        '</div>';
      }
      contentHtml += '</div>';

      if (window.MebiUI && window.MebiUI.openDrawer) {
        window.MebiUI.openDrawer('Periyodik Tablo Atom Renkleri (CPK Standardı)', contentHtml);
      }
    },
    zoomParticle: function(which) {
      if (window.MebiAudio) window.MebiAudio.playClick();
      var r1 = window.MebiData.getReagent(S.selectedSlot1);
      var r2 = window.MebiData.getReagent(S.selectedSlot2);
      var rx = S.activeReaction || window.MebiData.getReaction(S.selectedSlot1, S.selectedSlot2);
      if (!rx || !r1 || !r2) return;
      var currentTab = S.cameraTab || 'reactants';
      var isPhysicalMix = (rx && (rx.typeCategory === 'none' || (rx.typeCategories && rx.typeCategories.indexOf('none') > -1) || rx.title === 'Fiziksel Karışım (Kimyasal Tepkime Yok)' || rx.type === 'Fiziksel Karışım'));

      var modalData = {
        title: '',
        badge: '',
        badgeClass: '',
        modelKey: which,
        svg: '',
        desc: '',
        ions: []
      };

      if (currentTab === 'reactants') {
        var reactant = (which === 'r2') ? r2 : r1;
        modalData.title = reactant.name + ' (' + reactant.f + ')';
        modalData.badge = reactant.solid ? 'Katı Kristal' : 'Sulu Çözelti';
        modalData.badgeClass = reactant.solid ? 'badge-solid' : 'badge-aqueous';
        modalData.svg = window.MebiSVG.renderGenericReactantParticle(reactant);
        if (reactant.solid) {
          modalData.desc = reactant.name + ' katı halde düzenli 3 boyutlu iyonik veya metalik kristal örgü yapısındadır. Tanecikler elektrostatik veya metalik bağlarla sıkıca bağlıdır ve ortamda serbest hareket edemez; yalnızca titreşim hareketi yapar.';
          if (reactant.id === 'Cu') {
            modalData.ions = [{ label: 'Cu Katısı', desc: 'Metalik kristal örgü' }];
          } else if (reactant.id === 'MnO2') {
            modalData.ions = [{ label: 'Mn⁴⁺ ve O²⁻', desc: 'İyonik kristal kafes' }];
          } else if (reactant.id === 'Zn') {
            modalData.ions = [{ label: 'Zn Katısı', desc: 'Metalik kristal örgü' }];
          } else {
            if (reactant.id === 'CaCO3') {
              modalData.ions = [{ label: 'Ca²⁺ ve CO₃²⁻', desc: 'İyonik kristal örgü kafesi' }, { label: 'CaCO₃ Katısı', desc: 'Suda çözünmeyen katı kristal' }];
            } else if (reactant.id === 'Na2CO3') {
              modalData.ions = [{ label: '2Na⁺ ve CO₃²⁻', desc: 'İyonik kristal örgü kafesi' }, { label: 'Na₂CO₃ Katısı', desc: 'Beyaz katı kristal' }];
            } else if (reactant.id === 'NaHCO3') {
              modalData.ions = [{ label: 'Na⁺ ve HCO₃⁻', desc: 'İyonik kristal örgü kafesi' }, { label: 'NaHCO₃ Katısı', desc: 'Yemek sodası beyaz katı kristal' }];
            } else {
              modalData.ions = [{ label: reactant.f + ' Katısı', desc: 'Kristal örgü kafesi' }];
            }
          }
        } else if (reactant.id === 'H2O2' || reactant.id === 'NH3') {
          modalData.desc = reactant.name + ' sulu çözeltide moleküler halde dağılır ve serbestçe hareket eder.';
          modalData.ions = [
            { label: reactant.f + ' Molekülü', desc: 'Kovalent bağlı nötr tanecik' },
            { label: reactant.f, desc: 'Moleküler kimyasal gösterim' }
          ];
        } else {
          modalData.desc = reactant.name + ' suda katyon ve anyonlarına ayrışır. İyonlar çözeltide birbirinden bağımsız hareket eder; yükleri modelin altındaki kimyasal gösterimde belirtilir.';
          if (reactant.id === 'HCl') {
            modalData.ions = [{ label: 'H₃O⁺ / H⁺', desc: 'Hidronyum katyonu' }, { label: 'Cl⁻', desc: 'Klorür anyonu' }];
          } else if (reactant.id === 'NaOH') {
            modalData.ions = [{ label: 'Na⁺', desc: 'Sodyum katyonu' }, { label: 'OH⁻', desc: 'Hidroksit anyonu' }];
          } else if (reactant.id === 'AgNO3') {
            modalData.ions = [{ label: 'Ag⁺', desc: 'Gümüş katyonu' }, { label: 'NO₃⁻', desc: 'Nitrat anyonu' }];
          } else if (reactant.id === 'NaCl') {
            modalData.ions = [{ label: 'Na⁺', desc: 'Sodyum katyonu' }, { label: 'Cl⁻', desc: 'Klorür anyonu' }];
          } else if (reactant.id === 'BaCl2') {
            modalData.ions = [{ label: 'Ba²⁺', desc: 'Baryum katyonu' }, { label: 'Cl⁻', desc: 'Klorür anyonları' }];
          } else if (reactant.id === 'Na2SO4') {
            modalData.ions = [{ label: 'Na⁺', desc: 'Sodyum katyonları' }, { label: 'SO₄²⁻', desc: 'Sülfat anyonu' }];
          } else if (reactant.id === 'KI') {
            modalData.ions = [{ label: 'K⁺', desc: 'Potasyum katyonu' }, { label: 'I⁻', desc: 'İyodür anyonu' }];
          } else if (reactant.id === 'Pb(NO3)2' || reactant.id === 'PbNO32') {
            modalData.ions = [{ label: 'Pb²⁺', desc: 'Kurşun(II) katyonu' }, { label: 'NO₃⁻', desc: 'Nitrat anyonları' }];
          } else if (reactant.id === 'CuSO4') {
            modalData.ions = [{ label: 'Cu²⁺', desc: 'Bakır(II) katyonu' }, { label: 'SO₄²⁻', desc: 'Sülfat anyonu' }];
          } else if (reactant.id === 'Cu(NO3)2' || reactant.id === 'CuNO32') {
            modalData.ions = [{ label: 'Cu²⁺', desc: 'Bakır(II) katyonu' }, { label: 'NO₃⁻', desc: 'Nitrat anyonları' }];
          } else if (reactant.id === 'KNO3') {
            modalData.ions = [{ label: 'K⁺', desc: 'Potasyum katyonu' }, { label: 'NO₃⁻', desc: 'Nitrat anyonu' }];
          } else if (reactant.id === 'Na2CO3') {
            modalData.ions = [{ label: 'Na⁺', desc: 'Sodyum katyonları' }, { label: 'CO₃²⁻', desc: 'Karbonat anyonu' }];
          } else {
            modalData.ions = [{ label: 'Katyon (+)', desc: 'Solvatize iyon' }, { label: 'Anyon (-)', desc: 'Solvatize iyon' }];
          }
        }
      } else {
        // PRODUCTS TAB
        if (isPhysicalMix) {
          var reactant = (which === 'p2' || which === 'r2') ? r2 : r1;
          modalData.title = reactant.name + ' (' + reactant.f + ')';
          modalData.badge = 'Fiziksel Karışım';
          modalData.badgeClass = 'badge-physical';
          modalData.svg = window.MebiSVG.renderGenericProductParticle((which === 'p2' || which === 'r2') ? 'reactant2' : 'reactant1', rx, r1, r2);
          modalData.desc = 'Fiziksel karışım gerçekleştiğinde herhangi bir kimyasal bağ kopması veya yeni bağ oluşumu gerçekleşmez. Tanecikler kimliklerini korur ve çözeltide bağımsız olarak dağılır.';
          modalData.ions = [
            { label: reactant.f, desc: 'Kimyasal değişime uğramayan orijinal tanecik' },
            { label: 'H₂O', desc: 'Çözücü ortamı' }
          ];
        } else {
          var hasPpt = (rx.obs && rx.obs.indexOf('precipitate') > -1);
          var hasGas = (rx.obs && rx.obs.indexOf('gas') > -1);
          var isComplex = (rx.typeCategories && rx.typeCategories.indexOf('complex') > -1) || (rx.typeCategory === 'complex');
          var isHclNaoh = (r1.id === 'HCl' && r2.id === 'NaOH') || (r1.id === 'NaOH' && r2.id === 'HCl');
          var isO2Gas = (r1.id === 'H2O2' || r2.id === 'H2O2');
          var isCl2Gas = (r1.id === 'H2O2' && r2.id === 'HCl') || (r1.id === 'HCl' && r2.id === 'H2O2');

          var isFirstCard = (which === 'p1' || which === 'r1');

          if (hasPpt) {
            if (isFirstCard) {
              modalData.title = (rx.mainProductSymbol || 'Katı Çökelti') + ' - Çökelti Kristal Kafesi';
              modalData.badge = 'Katı Çökelti';
              modalData.badgeClass = 'badge-solid';
              modalData.svg = window.MebiSVG.renderGenericProductParticle(rx.mainProductSymbol || 'precipitate', rx, r1, r2);
              modalData.desc = 'Tepkimeye giren zıt yüklü iyonlar bir araya gelerek suda çözünmeyen düzenli 3B kristal kafes örgüsü oluşturur. Yerçekimi etkisiyle beherin tabanına çöker.';
              modalData.ions = [
                { label: rx.mainProductSymbol || 'Katı Faz', desc: 'Düzenli 3B kristal örgü' },
                { label: 'İyonik Bağlar', desc: 'Güçlü elektrostatik çekim kuvveti' }
              ];
            } else {
              if (hasGas) {
                modalData.title = (isO2Gas ? 'O₂' : 'CO₂') + ' - Gaz Molekülleri';
                modalData.badge = 'Açığa Çıkan Gaz';
                modalData.badgeClass = 'badge-gas';
                modalData.svg = window.MebiSVG.renderGenericProductParticle(isO2Gas ? 'O2' : 'CO2', rx, r1, r2);
                modalData.desc = 'Kimyasal tepkime sonucunda serbest kalan gaz molekülleri yüksek kinetik enerjiye sahiptir ve çözeltiden ayrılarak atmosfere karışır.';
                modalData.ions = [
                  { label: isO2Gas ? 'O₂ Gazı' : 'CO₂ Gazı', desc: 'Serbest gaz fazı' },
                  { label: 'Kinetik Enerji', desc: 'Çözeltiden faz ayrılması' }
                ];
              } else {
                modalData.title = (rx.spectators || 'Seyirci İyonlar') + ' - Sulu Çözelti';
                modalData.badge = 'Sulu Çözelti';
                modalData.badgeClass = 'badge-aqueous';
                modalData.svg = window.MebiSVG.renderGenericProductParticle('spectators', rx, r1, r2);
                modalData.desc = 'Net çökelme tepkimesine katılmayan seyirci iyonlar çözeltide birbirinden bağımsız hareket etmeye devam eder.';
                modalData.ions = [
                  { label: rx.spectators || 'Seyirci İyonlar', desc: 'Çözeltide serbest iyonlar' },
                  { label: 'İyon Yükleri', desc: 'Kimyasal gösterimde belirtilir' }
                ];
              }
            }
          } else if (hasGas) {
            if (isFirstCard) {
              var gasName = isO2Gas ? 'O₂ (Oksijen)' : (isCl2Gas ? 'Cl₂ (Klor)' : 'CO₂ (Karbondioksit)');
              modalData.title = gasName + ' - Gaz Molekülleri';
              modalData.badge = 'Açığa Çıkan Gaz';
              modalData.badgeClass = 'badge-gas';
              modalData.svg = window.MebiSVG.renderGenericProductParticle(isO2Gas ? 'O2' : (isCl2Gas ? 'Cl2' : 'CO2'), rx, r1, r2);
              modalData.desc = 'Tepkime sonucu açığa çıkan gaz molekülleri çözelti içerisinde kabarcıklar oluşturarak atmosfere yükselir.';
              modalData.ions = [
                { label: gasName, desc: 'Kovalent bağlı serbest gaz molekülleri' },
                { label: 'Kabarcık Dinamiği', desc: 'Yüksek kinetik enerji ve gaz fazı' }
              ];
            } else {
              modalData.title = (rx.spectators || 'Çözünmüş İyonlar') + ' - Sulu Çözelti';
              modalData.badge = 'Sulu Çözelti';
              modalData.badgeClass = 'badge-aqueous';
              modalData.svg = window.MebiSVG.renderGenericProductParticle('spectators', rx, r1, r2);
              modalData.desc = 'Gaz oluşumu sonrasında çözeltide kalan iyonlar su molekülleri tarafından sarılmış halde serbestçe dolaşır.';
              modalData.ions = [
                { label: rx.spectators || 'Çözünmüş İyonlar', desc: 'Solvatize iyonlar' },
                { label: 'H₂O', desc: 'Sıvı çözücü ortamı' }
              ];
            }
          } else if (isComplex) {
            if (isFirstCard) {
              modalData.title = (rx.mainProductSymbol || '[Cu(NH₃)₄]²⁺') + ' - Koordinasyon Kompleksi';
              modalData.badge = 'Koordinasyon Kompleksi';
              modalData.badgeClass = 'badge-complex';
              modalData.svg = window.MebiSVG.renderGenericProductParticle('CuComplex', rx, r1, r2);
              modalData.desc = 'Cu²⁺ merkez metal katyonu çevresine 4 adet NH₃ ligandı koordine kovalent bağlarla bağlanarak karakteristik koyu mavi tetraamminbakır(II) kompleks katyonunu oluşturur.';
              modalData.ions = [
                { label: 'Cu²⁺', desc: 'Merkez atom (Elektron çifti alıcısı / Lewis asidi)' },
                { label: '4 × NH₃', desc: 'Ligandlar (Elektron çifti vericisi / Lewis bazı)' }
              ];
            } else {
              modalData.title = (rx.spectators || 'NO₃⁻ Seyirci İyonları') + ' - Sulu Çözelti';
              modalData.badge = 'Sulu Çözelti';
              modalData.badgeClass = 'badge-aqueous';
              modalData.svg = window.MebiSVG.renderGenericProductParticle('spectators', rx, r1, r2);
              modalData.desc = 'Kompleks oluşum tepkimesine katılmayan nitrat iyonları çözeltide serbest olarak bulunur.';
              modalData.ions = [
                { label: 'NO₃⁻ Anyonları', desc: 'Seyirci iyonlar' },
                { label: 'H₂O', desc: 'Hidratasyon kılıfı' }
              ];
            }
          } else {
            // Nötrleşme
            if (isFirstCard) {
              modalData.title = 'H₂O - Nötrleşme Suyu Molekülleri';
              modalData.badge = 'Nötrleşme Suyu';
              modalData.badgeClass = 'badge-aqueous';
              modalData.svg = window.MebiSVG.renderGenericProductParticle('H2O', rx, r1, r2);
              modalData.desc = 'Asitten gelen H⁺ (veya H₃O⁺) iyonları ile bazdan gelen OH⁻ iyonları birleşerek kararlı kovalent H₂O moleküllerini oluşturur (Nötrleşme net iyon tepkimesi: H⁺ + OH⁻ → H₂O).';
              modalData.ions = [
                { label: 'H₂O Molekülleri', desc: 'Kovalent bağlı nötr moleküller' },
                { label: 'Hidrojen Bağları', desc: 'Moleküller arası dinamik ağ' }
              ];
            } else {
              modalData.title = (isHclNaoh ? 'Na⁺ ve Cl⁻' : (rx.spectators || 'Çözünmüş İyonlar')) + ' - Sulu Çözelti';
              modalData.badge = 'Çözünmüş Tuz';
              modalData.badgeClass = 'badge-aqueous';
              modalData.svg = window.MebiSVG.renderGenericProductParticle('spectators', rx, r1, r2);
              modalData.desc = 'Nötrleşme tepkimesi sonucu oluşan tuz (örneğin NaCl) suda yüksek çözünürlüğe sahip olduğu için katı kristal oluşturmaz; çözeltide serbest iyonlar halinde kalır.';
              modalData.ions = [
                { label: isHclNaoh ? 'Na⁺ ve Cl⁻' : 'Tuz İyonları', desc: 'Çözeltide serbest iyonlar' },
                { label: isHclNaoh ? 'Na⁺ + Cl⁻' : (rx.spectators || 'Tuz iyonları'), desc: 'Yükleriyle kimyasal gösterim' }
              ];
            }
          }
        }
      }

      var sourceParticleHost = document.querySelector('.particle-3d-host[data-particle-view="' + which + '"]');
      modalData.modelType = sourceParticleHost ? (sourceParticleHost.getAttribute('data-particle-type') || '') : '';
      if (window.MebiUI && window.MebiUI.openParticleModal) {
        window.MebiUI.openParticleModal(modalData);
      }
    },
    clearCollection: function() {
      function doClear() {
        if (window.MebiAudio) window.MebiAudio.playClick();
        S.collection = [];
        saveCollectionToStorage();
        render();
        if (window.MebiUI && window.MebiUI.showToast) {
          window.MebiUI.showToast('info', 'Koleksiyon Sıfırlandı', 'Kayıtlı tüm deney kartları temizlendi.', 2500);
        }
      }
      if (window.MebiUI && window.MebiUI.openResetModal) {
        window.MebiUI.openResetModal(S.collection.length, doClear);
      } else {
        var approved = typeof window.confirm === 'function' && window.confirm('Bu işlem keşfettiğiniz tüm tepkime kartlarını (' + S.collection.length + ' adet) ve mevcut laboratuvar deney ilerlemesini kalıcı olarak silecektir. Devam etmek istiyor musunuz?');
        if (approved) doClear();
      }
    },
    undoLast: function() {
      if (window.MebiAudio) window.MebiAudio.playClick();
      if (HISTORY.length > 0) {
        var prev = JSON.parse(HISTORY.pop());
        if (prev.screen === 'pool') {
          prev.selectedSlot1 = null;
          prev.selectedSlot2 = null;
          prev.activeReaction = null;
          prev.prediction = [];
        }
        ++fillToken; prev.isFilling = false;
        S = prev;
        render();
      } else {
        if (S.screen === 'lab') {
          if (S.labStep === 'observed') {
            S.labStep = 'ready';
            S.poured = false;
            S.currentTemp = S.activeReaction ? S.activeReaction.tempInit : 22.0;
          } else if (S.labStep === 'ready') {
            S.labStep = 'predict';
          } else {
            S.screen = 'pool';
            S.selectedSlot1 = null;
            S.selectedSlot2 = null;
            S.activeReaction = null;
            S.prediction = [];
          }
        } else if (S.screen === 'card') {
          S.screen = 'lab';
          S.labStep = 'observed';
        } else if (S.screen === 'micro') {
          S.reportTab = 'analysis';
          S.screen = 'card';
        } else if (S.screen === 'pool') {
          S.screen = 'menu';
        } else if (S.screen === 'collection') {
          if (S.resumeScreen && S.resumeScreen !== 'collection' && S.resumeScreen !== 'menu') {
            S.screen = S.resumeScreen;
            if (S.screen === 'lab' && S.resumeLabStep) S.labStep = S.resumeLabStep;
          } else {
            S.screen = 'menu';
          }
        }
        render();
      }
    }
  };

  function dispatch(action, arg, btn) {
    if (!actions[action]) return;
    if (action !== 'undoLast' && action !== 'toggleTheme' && action !== 'toggleAudio' && action !== 'zoomParticle' && action !== 'toggleFullscreen' && action !== 'testOrientation') {
      HISTORY.push(JSON.stringify(S));
      if (HISTORY.length > 40) HISTORY.shift();
    }
    actions[action](arg, btn);
  }

  /* ----------------- 6. RENDER VE GİRDİ BAĞLANTILARI ----------------- */
  var SCREENS = {
    menu: screenMenu,
    pool: screenPool,
    lab: screenLab,
    card: screenCard,
    micro: screenMicro,
    collection: screenCollection
  };

  function render(scrollTop) {
    var app = document.getElementById('app');
    if (!app) return;
    var fn = SCREENS[S.screen] || screenMenu;
    var oldList = app.querySelector('.lab-reagent-list');
    var listScroll = oldList ? oldList.scrollTop : 0;
    if (window.ParticleScene) window.ParticleScene.disposeCards();
    app.innerHTML = fn();
    var newList = app.querySelector('.lab-reagent-list');
    if (newList) newList.scrollTop = listScroll;
    app.dataset.screen = S.screen;
    if (window.LabScene) window.LabScene.sync(S, dispatch);
    if (window.ParticleScene) window.ParticleScene.sync(S);
    wireInputs();
    wireDragAndDrop();
    if (S.screen === 'lab' && S.labStep === 'predict') {
      highlightSettingsGearOnce();
    }

    if (scrollTop !== false) {
      window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    }
  }

  function wireInputs() {
    var si = document.getElementById('poolSearchInput');
    if (si) {
      si.addEventListener('input', function() {
        S.searchQuery = si.value;
        render(false);
        var nsi = document.getElementById('poolSearchInput');
        if (nsi) {
          nsi.focus();
          nsi.setSelectionRange(nsi.value.length, nsi.value.length);
        }
      });
    }
  }

  /* ----------------- 7. ETKİLEŞİM DİNLEYİCİLERİ ----------------- */
  document.addEventListener('DOMContentLoaded', function() {
    var app = document.getElementById('app');
    if (app) {
      app.addEventListener('click', function(e) {
        var btn = e.target.closest('[data-action]');
        if (!btn) return;
        if (btn.disabled || btn.classList.contains('is-disabled')) return;
        var action = btn.getAttribute('data-action');
        var arg = btn.getAttribute('data-arg');
        dispatch(action, arg, btn);
      });

      // Klavye ile role="button" erişimi (Enter ve Boşluk tuşu)
      app.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          var btn = e.target.closest('[data-action][role="button"]');
          if (btn && !btn.disabled && !btn.classList.contains('is-disabled')) {
            e.preventDefault();
            btn.click();
          }
        }
      });

      // Hover sesleri
      app.addEventListener('mouseenter', function(e) {
        var el = e.target.closest('.beaker-card, .observation-chip, .mebi-btn, .mebi-quiz-choice, .mebi-filter-chip');
        if (el && window.MebiAudio) {
          window.MebiAudio.playHover();
        }
      }, true);
    }

    document.addEventListener('click', function(e) {
      if (!S.labSettingsOpen) return;
      var target = e.target;
      if (target && target.closest && target.closest('.lab-settings-wrap')) return;
      S.labSettingsOpen = false;
      render(false);
    });

    // Tam ekran durumu değiştiğinde buton ikonunu güncelle
    ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(function(evt) {
      document.addEventListener(evt, function() {
        var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
        var btn = document.querySelector('[data-action="toggleFullscreen"]');
        if (btn && window.MebiSVG) {
          btn.innerHTML = window.MebiSVG.icon(isFs ? 'fullscreenExit' : 'fullscreen');
          btn.title = isFs ? 'Tam Ekrandan Çık' : 'Tam Ekran Modu';
        }
      });
    });

    render();
  });

  // Global erişim
  window.TepkimeArenasi = {
    get state() { return S; },
    dispatch: dispatch,
    render: render
  };

})(window);
