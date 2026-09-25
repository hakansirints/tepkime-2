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
    collection: []
  };

  var HISTORY = [];

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
  function topbarHTML(showNav) {
    var totalDiscovered = S.collection.length;
    var totalReactions = 36; // Aktif kimyasal tepkime sayısı
    var pct = Math.min(100, Math.round((totalDiscovered / totalReactions) * 100));

    var isAudio = window.MebiAudio ? window.MebiAudio.isEnabled() : true;
    var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    var curTheme = document.documentElement.getAttribute('data-theme') || 'light';

    var html = '<div class="mebi-topbar">' +
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
        // Ses Butonu
        '<button class="mebi-btn-icon mebi-btn-secondary" data-action="toggleAudio" title="' + (isAudio ? 'Sesi Kapat' : 'Sesi Aç') + '">' +
          window.MebiSVG.icon(isAudio ? 'volumeOn' : 'volumeOff') +
        '</button>' +

        // Tam Ekran Butonu
        '<button class="mebi-btn-icon mebi-btn-secondary" data-action="toggleFullscreen" title="' + (isFs ? 'Tam Ekrandan Çık' : 'Tam Ekran Modu') + '">' +
          window.MebiSVG.icon(isFs ? 'fullscreenExit' : 'fullscreen') +
        '</button>' +

        // Yatay Ekran Uyarısı Önizleme Butonu
        '<button class="mebi-btn-icon mebi-btn-secondary" data-action="testOrientation" title="Yatay Ekran Modunu Önizle">' +
          window.MebiSVG.icon('deviceRotate') +
        '</button>' +

        // Kayar Tema Anahtarı
        '<button class="mebi-theme-toggle" data-action="toggleTheme" title="Temayı Değiştir">' +
          '<span class="mebi-theme-icon-sun">☀️</span>' +
          '<span class="mebi-theme-icon-moon">🌙</span>' +
          '<span class="mebi-theme-thumb"' + (curTheme === 'dark' ? ' style="transform:translateX(30px);"' : '') + '></span>' +
        '</button>' +

        // Uygulama ve Laboratuvar Rehberi Butonu
        '<button class="mebi-btn mebi-btn-secondary mebi-btn-sm" data-action="openGuideDrawer">' +
          '<span class="mebi-btn-badge">' + window.MebiSVG.icon('helpCircle') + '</span>' +
          '<span>Rehber</span>' +
        '</button>' +
      '</div>' +
    '</div>';

    return html;
  }

  function stepperHTML(step) {
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

    html += '</div>';
    return html;
  }

  /* ----------------- 3. EKRANLAR (SCREENS) ----------------- */

  // EKRAN 1: AÇILIŞ MENÜSÜ
  function screenMenu() {
    return topbarHTML(false) +
      '<div class="mebi-card arena-menu-card">' +
        '<div class="arena-hero-badge">' +
          '<span class="mebi-badge mebi-badge-cyan">ETKİLEŞİMLİ KİMYA SİMÜLASYONU</span>' +
        '</div>' +
        '<h1 class="arena-title">' +
          '<span class="arena-title-icon">' + window.MebiSVG.icon('flaskIc') + '</span>' +
          '<span>Tepkime Arenası</span>' +
        '</h1>' +
        '<p class="arena-lead">' +
          'Kimyasal maddeleri seç, deney masasında birleştirerek değişimi tahmin et, reaksiyonu gözlemle ve mikroskobik atom dünyasında tepkime türünü keşfet!' +
        '</p>' +

        '<div class="arena-menu-actions">' +
          '<button class="mebi-btn mebi-btn-primary arena-menu-btn" data-action="goPool">' +
            '<div class="arena-menu-btn-icon">' + window.MebiSVG.icon('flaskOutline') + '</div>' +
            '<div class="arena-menu-btn-text">' +
              '<span class="arena-menu-btn-main">Arenaya Gir ve Deneye Başla</span>' +
              '<span class="arena-menu-btn-sub">12 farklı kimyasal madde arasından tepken seç</span>' +
            '</div>' +
          '</button>' +

          '<button class="mebi-btn mebi-btn-secondary arena-menu-btn" data-action="goCollection">' +
            '<div class="arena-menu-btn-icon">' + window.MebiSVG.icon('grid') + '</div>' +
            '<div class="arena-menu-btn-text">' +
              '<span class="arena-menu-btn-main">Tepkime Koleksiyonum (' + S.collection.length + ' Keşif)</span>' +
              '<span class="arena-menu-btn-sub">Tamamladığın deney kartlarını ve denklemleri incele</span>' +
            '</div>' +
          '</button>' +

          '<button class="mebi-btn mebi-btn-secondary arena-menu-btn" data-action="openGuideDrawer">' +
            '<div class="arena-menu-btn-icon">' + window.MebiSVG.icon('helpCircle') + '</div>' +
            '<div class="arena-menu-btn-text">' +
              '<span class="arena-menu-btn-main">Uygulama ve Laboratuvar Rehberi</span>' +
              '<span class="arena-menu-btn-sub">Deney adımları, dökme mekaniği ve gözlem ipuçları</span>' +
            '</div>' +
          '</button>' +
        '</div>' +

        '<div style="display:flex;justify-content:center;gap:12px;margin-top:10px;">' +
          '<button class="mebi-btn mebi-btn-ghost" data-action="resetExperiment">' +
            '<span class="mebi-btn-badge">' + window.MebiSVG.icon('reset') + '</span>' +
            '<span>Sıfırla</span>' +
          '</button>' +
        '</div>' +
      '</div>';
  }

  // EKRAN 2: MADDE HAVUZU (POOL)
  function screenPool() {
    var r1 = S.selectedSlot1 ? window.MebiData.getReagent(S.selectedSlot1) : null;
    var r2 = S.selectedSlot2 ? window.MebiData.getReagent(S.selectedSlot2) : null;
    var canStart = (r1 && r2);

    var q = window.MebiData.foldTR(S.searchQuery);
    var filteredReagents = window.MebiData.REAGENTS.filter(function(r) {
      if (S.categoryFilter !== 'all' && r.category !== S.categoryFilter) return false;
      if (q) {
        var n = window.MebiData.foldTR(r.name + ' ' + r.f + ' ' + r.state);
        if (n.indexOf(q) === -1) return false;
      }
      return true;
    });

    var html = topbarHTML(true) +
      '<div class="mebi-card">' +
        '<div class="pool-intro">' +
          '<div class="pool-badge-row">' +
            '<span class="mebi-badge mebi-badge-primary">1. AŞAMA: REAKTİF SEÇİMİ</span>' +
            '<span class="pool-status-chip ' + (canStart ? 'status-ready' : ((r1 || r2) ? 'status-partial' : '')) + '">' +
              (canStart ? '✓ 2 Reaktif Seçildi (Hazır)' : ((r1 || r2) ? '1/2 Reaktif Seçildi' : 'Reaktif Bekleniyor (0/2)')) +
            '</span>' +
          '</div>' +
          '<h2 class="pool-title">Madde Havuzundan Deney Seçimi Yap</h2>' +
          '<p class="pool-subtitle">Tepkimeye sokmak istediğiniz iki reaktifi aşağıdaki havuzdan seçerek Tepken Bölmesine yerleştiriniz.</p>' +
        '</div>' +

        // Tepken Bölmesi (ÜST TARAFTA - Deney İçin Seçilen Maddeler)
        '<div class="staging-header-row">' +
          '<span class="staging-title">TEPKEN BÖLMESİ</span>' +
          '<span class="staging-subtitle">(Deney İçin Seçilen Maddeler)</span>' +
        '</div>' +

        '<div class="staging-area">' +
          // Yuva 1
          '<div class="slot-card slot-1' + (r1 ? ' filled' : '') + '">' +
            (r1 ? '<button class="btn-remove-slot" data-action="clearSlot" data-arg="1" title="Kaldır">✕</button>' : '') +
            (r1
              ? '<div class="slot-tile-badge slot-1-badge">' +
                  '<span class="slot-order-tag">1. TEPKEN</span>' +
                  '<span class="slot-formula-big">' + esc(r1.f) + '</span>' +
                '</div>'
              : '<div class="slot-icon-box">' + window.MebiSVG.icon('flaskOutline') + '</div>'
            ) +
            '<div class="slot-text-box">' +
              (r1
                ? '<div class="slot-main-text" style="color:var(--mebi-primary);">' + esc(r1.name) + '</div><div class="slot-sub-text">' + esc(r1.category === 'acid' ? 'Asit' : (r1.category === 'base' ? 'Baz' : 'Tuz')) + ' • ' + esc(r1.state) + '</div>'
                : '<div class="slot-main-text">1. Tepkeni Seç</div><div class="slot-sub-text">Aşağıdaki havuzdan bir maddeye tıkla</div>'
              ) +
            '</div>' +
          '</div>' +

          '<div class="staging-plus">+</div>' +

          // Yuva 2
          '<div class="slot-card slot-2' + (r2 ? ' filled' : '') + '">' +
            (r2 ? '<button class="btn-remove-slot" data-action="clearSlot" data-arg="2" title="Kaldır">✕</button>' : '') +
            (r2
              ? '<div class="slot-tile-badge slot-2-badge">' +
                  '<span class="slot-order-tag">2. TEPKEN</span>' +
                  '<span class="slot-formula-big">' + esc(r2.f) + '</span>' +
                '</div>'
              : '<div class="slot-icon-box">' + window.MebiSVG.icon('flaskOutline') + '</div>'
            ) +
            '<div class="slot-text-box">' +
              (r2
                ? '<div class="slot-main-text" style="color:var(--mebi-success);">' + esc(r2.name) + '</div><div class="slot-sub-text">' + esc(r2.category === 'acid' ? 'Asit' : (r2.category === 'base' ? 'Baz' : 'Tuz')) + ' • ' + esc(r2.state) + '</div>'
                : '<div class="slot-main-text">2. Tepkeni Seç</div><div class="slot-sub-text">Aşağıdaki havuzdan ikinci maddeye tıkla</div>'
              ) +
            '</div>' +
          '</div>' +

          // Deneye Başla Butonu
          '<button class="mebi-btn mebi-btn-primary staging-start-btn" data-action="startExperiment" style="height:52px;min-width:160px;font-size:14px;padding:0 18px;" ' + (canStart ? '' : 'disabled') + '>' +
            '<span class="mebi-btn-badge">' + window.MebiSVG.icon('flaskIc') + '</span>' +
            '<span>Deney Masasına Geç</span>' +
          '</button>' +
        '</div>' +

        // Arama ve Filtre Kontrolleri
        '<div class="pool-controls-bar">' +
          '<div class="mebi-search-box">' +
            window.MebiSVG.icon('search') +
            '<input type="text" id="poolSearchInput" class="mebi-search-input" placeholder="Formül veya kimyasal ada göre filtrele..." value="' + esc(S.searchQuery) + '">' +
          '</div>' +

          '<div class="pool-filters">' +
            '<button class="mebi-filter-chip ' + (S.categoryFilter === 'all' ? 'is-active' : '') + '" data-action="setFilter" data-arg="all">Tümü (12)</button>' +
            '<button class="mebi-filter-chip ' + (S.categoryFilter === 'acid' ? 'is-active' : '') + '" data-action="setFilter" data-arg="acid">Asitler</button>' +
            '<button class="mebi-filter-chip ' + (S.categoryFilter === 'base' ? 'is-active' : '') + '" data-action="setFilter" data-arg="base">Bazlar</button>' +
            '<button class="mebi-filter-chip ' + (S.categoryFilter === 'salt' ? 'is-active' : '') + '" data-action="setFilter" data-arg="salt">Tuzlar</button>' +
          '</div>' +
        '</div>' +

        // Madde Havuzu (ALT TARAFTA - 2 Satır x 6 Sütun, Beher filigransız)
        '<div class="reagents-grid">' +
          filteredReagents.map(function(r) {
            var isSel1 = (S.selectedSlot1 === r.id);
            var isSel2 = (S.selectedSlot2 === r.id);
            var selCls = isSel1 ? ' selected-1' : (isSel2 ? ' selected-2' : '');
            var catLabel = r.category === 'acid' ? 'Asit' : (r.category === 'base' ? 'Baz' : 'Tuz');
            var stateClean = r.state ? r.state.replace(/[()]/g, '') : '';
            var selBadge = isSel1
              ? '<span class="card-sel-badge badge-slot1">1. TEPKEN</span>'
              : (isSel2 ? '<span class="card-sel-badge badge-slot2">2. TEPKEN</span>' : '<span class="card-state-pill">' + esc(stateClean) + '</span>');

            return '<div class="beaker-card' + selCls + '" data-action="clickReagent" data-arg="' + esc(r.id) + '" title="' + esc(r.name) + '">' +
              '<div class="card-top-row">' +
                '<span class="card-cat-tag cat-' + r.category + '">' + catLabel + '</span>' +
                selBadge +
              '</div>' +
              '<div class="card-reagent-tile">' +
                '<div class="card-formula-hero">' + esc(r.f) + '</div>' +
              '</div>' +
              '<div class="card-name">' + esc(r.name) + '</div>' +
            '</div>';
          }).join('') +
        '</div>' +

        '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:20px;padding-top:16px;border-top:1px solid var(--mebi-border);">' +
          '<button class="mebi-btn mebi-btn-secondary mebi-btn-sm" data-action="goMenu">' +
            '<span class="mebi-btn-badge">' + window.MebiSVG.icon('undo') + '</span>' +
            '<span>Ana Menüye Dön</span>' +
          '</button>' +
          '<button class="mebi-btn mebi-btn-ghost mebi-btn-sm" data-action="resetPool">' +
            '<span class="mebi-btn-badge">' + window.MebiSVG.icon('reset') + '</span>' +
            '<span>Seçimi Temizle</span>' +
          '</button>' +
        '</div>' +
      '</div>';

    return html;
  }

  // EKRAN 3: DENEY TEZGAHI (LAB EXPERIMENT)
  function screenLab() {
    var r1 = window.MebiData.getReagent(S.selectedSlot1);
    var r2 = window.MebiData.getReagent(S.selectedSlot2);
    var rx = S.activeReaction || window.MebiData.getReaction(S.selectedSlot1, S.selectedSlot2);

    var isReacting = (S.labStep === 'reacting' || S.labStep === 'observed');
    var isPoured = S.poured || isReacting;
    var isR1Solid = (r1 && r1.solid);
    var isR2Solid = (r2 && r2.solid);

    // Sıvı Rengi (Gerçek Görünüm)
    var liquidColor = 'rgba(230, 242, 252, 0.45)';
    if (isReacting && rx.toColor) {
      liquidColor = rx.toColor;
    } else if (r1.id === 'Cu(NO3)2') {
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
            '<span>Tahminimi Onayla ve Düzeneğe Geç</span>' +
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
              '<span>İzotermik (' + S.currentTemp.toFixed(1) + '°C - Sıcaklık Değişimi Yok)</span>' +
            '</div>'
        ) +
        '<div class="dock-actions">' +
          '<button class="mebi-btn mebi-btn-primary dock-btn-full" data-action="toCard">' +
            '<span class="mebi-btn-badge">' + window.MebiSVG.icon('flaskOutline') + '</span>' +
            '<span>Rapor ve Değerlendirmeye Geç →</span>' +
          '</button>' +
          '<button class="mebi-btn mebi-btn-secondary mebi-btn-sm dock-btn-full" data-action="redoPrediction">' +
            '<span class="mebi-btn-badge">' + window.MebiSVG.icon('undo') + '</span>' +
            '<span>Tahmine Dön</span>' +
          '</button>' +
        '</div>' +
      '</div>';
    }

    var html = topbarHTML(true) +
      '<div class="mebi-card">' +
        stepperHTML(S.labStep) +

        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px;">' +
          '<div>' +
            '<div class="mebi-badge mebi-badge-cyan">DENEY MASASI & REAKSİYON DÜZENEĞİ</div>' +
            '<h2 style="font-size:23px;margin-top:5px;font-weight:800;">' + esc(r1.f) + ' + ' + esc(r2.f) + ' Deneyi</h2>' +
          '</div>' +
          '<div style="display:flex;gap:8px;">' +
            '<button class="mebi-btn mebi-btn-secondary mebi-btn-sm" data-action="goPool">' +
              '<span class="mebi-btn-badge">' + window.MebiSVG.icon('undo') + '</span>' +
              '<span>Tepken Değiştir</span>' +
            '</button>' +
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
                      '<div class="digital-head-top">' +
                        '<span class="digital-brand-label">DİJİTAL TERMOMETRE</span>' +
                        '<span class="digital-status-led" id="digitalStatusLed" title="Sensör Aktif"></span>' +
                      '</div>' +
                      '<div class="digital-lcd-display">' +
                        '<span class="digital-temp-value" id="digitalTempValue">' + S.currentTemp.toFixed(1) + '</span>' +
                        '<span class="digital-temp-unit">°C</span>' +
                      '</div>' +
                      '<div class="digital-head-bottom">' +
                        '<span class="digital-sub-label">PASLANMAZ PROB</span>' +
                        '<span class="digital-mode-tag">CANLI</span>' +
                      '</div>' +
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
                '<div class="reagent-tag">' +
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
                '<div class="reagent-tag">' +
                  '<div class="reagent-formula">' + esc(r2.f) + '</div>' +
                  '<div class="reagent-name">' + esc(r2.name) + '</div>' +
                  '<div class="reagent-state">' + esc(r2.state) + '</div>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +

          dockHTML +
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
          '<button type="button" class="mebi-btn mebi-btn-primary mebi-btn-sm" data-action="checkType"' + (curSelections.length === 0 ? ' disabled style="opacity:0.55;cursor:not-allowed;"' : '') + '>' +
            '<span class="mebi-btn-badge">' + window.MebiSVG.icon('check') + '</span>' +
            '<span>' + (S.typeChecked ? 'Seçimi Yeniden Değerlendir' : 'Yanıtı Kontrol Et') + '</span>' +
          '</button>' +
          (S.typeChecked
            ? '<button type="button" class="mebi-btn mebi-btn-secondary mebi-btn-sm" data-action="showEvalModal">' +
                '<span class="mebi-btn-badge">' + window.MebiSVG.icon('info') + '</span>' +
                '<span>Değerlendirme Kartını Gör</span>' +
              '</button>'
            : ''
          ) +
          (curSelections.length === 0
            ? '<span class="report-quiz-hint">(En az bir seçenek işaretleyiniz)</span>'
            : (S.typeChecked ? '' : '<span class="report-quiz-hint" style="color:var(--mebi-primary);font-weight:600;">Seçiminizi tamamlayınca kontrol ediniz.</span>')
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

    var html = topbarHTML(true) +
      '<div class="mebi-card">' +
        stepperHTML('card') +

        // Resmi MEBİ Laboratuvar Deney Rapor Sayfası
        '<div class="mebi-report-sheet">' +
          // Üst Bilgi Satırı
          '<div class="report-meta-banner">' +
            '<div class="report-meta-title-group">' +
              '<div class="report-meta-badge">' +
                window.MebiSVG.icon('shield') +
                '<span>MEBİ KİMYA DİJİTAL LABORATUVARI • DENEY RAPORU</span>' +
              '</div>' +
              '<h2 class="report-meta-title">' + esc(r1.f) + ' + ' + esc(r2.f) + ' Süreç Analizi</h2>' +
            '</div>' +
            '<div class="report-meta-pills">' +
              '<div class="report-meta-pill">Standart Koşullar (25°C, 1 atm)</div>' +
            '</div>' +
          '</div>' +

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

        // Alt Eylem Butonları
        html += '<div class="report-bottom-bar">' +
          '<button class="mebi-btn mebi-btn-secondary mebi-btn-sm" data-action="undoLast">' +
            '<span class="mebi-btn-badge">' + window.MebiSVG.icon('undo') + '</span>' +
            '<span>Deney Masasına Dön</span>' +
          '</button>' +
          (activeTab === 'quiz'
            ? '<button class="mebi-btn mebi-btn-ghost mebi-btn-sm" data-action="setReportTab" data-arg="analysis">' +
                '<span>⬅ 1. Süreç Analizine Geri Dön</span>' +
              '</button>'
            : ''
          ) +
          (activeTab === 'quiz' && S.typeChecked
            ? '<button class="mebi-btn mebi-btn-primary mebi-btn-sm" data-action="saveCard">' +
                '<span class="mebi-btn-badge">' + window.MebiSVG.icon('sparkles') + '</span>' +
                '<span>Tanecik Kamerasına Geç (Alt-Mikroskobik Boyut) ➔</span>' +
              '</button>'
            : ''
          ) +
        '</div>' +
      '</div>';

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
      H: { name: 'Hidrojen', color: '#f1f5f9', border: '#cbd5e1' },
      O: { name: 'Oksijen', color: '#e11d48' },
      C: { name: 'Karbon', color: '#334155' },
      N: { name: 'Azot', color: '#0284c7' },
      Cl: { name: 'Klor', color: '#22c55e' },
      Na: { name: 'Sodyum', color: '#9333ea' },
      Pb: { name: 'Kurşun', color: '#f59e0b' },
      I: { name: 'İyot', color: '#7c3aed' },
      Ag: { name: 'Gümüş', color: '#94a3b8' },
      Cu: { name: 'Bakır', color: '#2563eb' },
      Ca: { name: 'Kalsiyum', color: '#14b8a6' },
      Ba: { name: 'Baryum', color: '#10b981' },
      K: { name: 'Potasyum', color: '#8b5cf6' },
      S: { name: 'Kükürt', color: '#eab308' },
      Zn: { name: 'Çinko', color: '#64748b' },
      Mn: { name: 'Mangan', color: '#a855f7' },
      Fe: { name: 'Demir', color: '#ea580c' }
    };

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
    var html = topbarHTML(true) +
      '<div class="mebi-card">' +
        stepperHTML('micro') +

        // Kompakt Üst Bilgi Başlığı (Meta Banner) & Johnstone Entegrasyonu
        '<div class="camera-meta-banner">' +
          '<div class="camera-meta-title-group">' +
            '<div class="camera-meta-badge">' +
              '<span class="mebi-badge-purple">5. AŞAMA • TANECİK KAMERASI</span>' +
              '<span class="camera-meta-sep">•</span>' +
              '<span class="camera-meta-rx">' + esc(r1.f) + ' + ' + esc(r2.f) + '</span>' +
            '</div>' +
            '<h2 class="camera-meta-title">Alt-Mikroskobik Tanecik Boyutu İncelemesi</h2>' +
          '</div>' +
          '<div class="camera-meta-pills">' +
            '<div class="johnstone-pill-badge" title="Johnstone Kimya Üçgeni Aşamaları">' +
              '<span class="j-pill is-done">1. Makroskobik ✓</span>' +
              '<span class="j-sep">›</span>' +
              '<span class="j-pill is-done">2. Sembolik ✓</span>' +
              '<span class="j-sep">›</span>' +
              '<span class="j-pill is-active">3. Alt-Mikroskobik 3B ●</span>' +
            '</div>' +
          '</div>' +
        '</div>' +

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
        '</div>' +

        // Akıllı CPK Atom Renk Lejantı
        '<div class="cpk-smart-bar">' +
          '<div class="cpk-smart-items">' +
            '<span class="cpk-smart-label">ATOM RENKLERİ:</span>' +
            cpkChipsHtml +
          '</div>' +
          '<button type="button" class="cpk-drawer-btn" data-action="openAllCpkDrawer" title="Tüm standart CPK periyodik atom renklerini incele">' +
            '<span>🎨 Tüm Renkler (CPK) ▾</span>' +
          '</button>' +
        '</div>';

    // 3. İÇERİK BÖLÜMÜ
    if (currentTab === 'reactants') {
      // SEKME 1: TEPKENLER (Başlangıç Tanecik Modelleri)
      html += '<div class="camera-tab-pane is-active">' +
        // Makroskobik Durum Şeridi
        '<div class="camera-macro-strip">' +
          '<span class="macro-strip-badge">👁️ Makroskobik Durum:</span>' +
          '<span class="macro-strip-text">' + esc(rx.macroReactantsText || (r1.name + ' ve ' + r2.name + ' sulu ortamda ayrı ayrı hazırlanmıştır.')) + '</span>' +
          '<span class="macro-strip-hint">🔍 Modelleri 3B büyütmek için kartlara dokununuz</span>' +
        '</div>' +

        // 3B Tanecik Kartları Grid'i
        '<div class="camera-particles-row">' +
          // Kart 1: Tepken 1
          '<div class="particle-subcard" data-action="zoomParticle" data-arg="r1" tabindex="0" role="button" title="Modeli Büyüt ve İncele">' +
            '<div class="particle-subcard-title">' +
              '<div class="particle-title-left">' +
                '<span class="particle-state-badge ' + (r1.solid ? 'badge-solid' : 'badge-aqueous') + '">' +
                  (r1.solid ? 'Katı Kristal' : 'Sulu Çözelti') +
                '</span>' +
                '<span>' + esc(r1.f) + ' ' + (r1.solid ? '(katı)' : '(suda)') + '</span>' +
              '</div>' +
              '<span class="particle-zoom-badge">🔍 Büyüt</span>' +
            '</div>' +
            '<div class="particle-subcard-body">' + window.MebiSVG.renderGenericReactantParticle(r1) + '</div>' +
            '<div class="particle-caption">' +
              '<div>' + esc(r1.name) + '</div>' +
              '<div class="sub-ion">' + (r1.solid ? '3B İyonik Kristal Kafesi (Susuz)' : (r1.id === 'H2O2' || r1.id === 'NH3' ? 'Suda Çözünmüş Molekül / Hidrojen Bağları' : 'Suda Ayrışmış Serbest Solvatize İyonlar')) + '</div>' +
              '<div class="sub-zoom-hint">🔍 Modeli büyütmek için tıklayınız</div>' +
            '</div>' +
          '</div>' +

          // Kart 2: Tepken 2
          '<div class="particle-subcard" data-action="zoomParticle" data-arg="r2" tabindex="0" role="button" title="Modeli Büyüt ve İncele">' +
            '<div class="particle-subcard-title">' +
              '<div class="particle-title-left">' +
                '<span class="particle-state-badge ' + (r2.solid ? 'badge-solid' : 'badge-aqueous') + '">' +
                  (r2.solid ? 'Katı Kristal' : 'Sulu Çözelti') +
                '</span>' +
                '<span>' + esc(r2.f) + ' ' + (r2.solid ? '(katı)' : '(suda)') + '</span>' +
              '</div>' +
              '<span class="particle-zoom-badge">🔍 Büyüt</span>' +
            '</div>' +
            '<div class="particle-subcard-body">' + window.MebiSVG.renderGenericReactantParticle(r2) + '</div>' +
            '<div class="particle-caption">' +
              '<div>' + esc(r2.name) + '</div>' +
              '<div class="sub-ion">' + (r2.solid ? '3B İyonik Kristal Kafesi (Susuz)' : (r2.id === 'H2O2' || r2.id === 'NH3' ? 'Suda Çözünmüş Molekül / Hidrojen Bağları' : 'Suda Ayrışmış Serbest Solvatize İyonlar')) + '</div>' +
              '<div class="sub-zoom-hint">🔍 Modeli büyütmek için tıklayınız</div>' +
            '</div>' +
          '</div>' +
        '</div>' +

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
          '<span class="macro-strip-text">' + esc(rx.macroProductsText || 'Karışım gerçekleştikten sonra elde edilen durum.') + '</span>' +
          '<span class="macro-strip-hint">🔍 Modelleri 3B büyütmek için kartlara dokununuz</span>' +
        '</div>' +

        // 3B Tanecik Kartları Grid'i
        '<div class="camera-particles-row">';

        if (isPhysicalMix) {
          html += '<div class="particle-subcard" data-action="zoomParticle" data-arg="p1" tabindex="0" role="button" title="Modeli Büyüt ve İncele">' +
            '<div class="particle-subcard-title">' +
              '<div class="particle-title-left">' +
                '<span class="particle-state-badge badge-physical">Fiziksel Karışım</span>' +
                '<span>' + esc(r1.f) + '</span>' +
              '</div>' +
              '<span class="particle-zoom-badge">🔍 Büyüt</span>' +
            '</div>' +
            '<div class="particle-subcard-body">' + window.MebiSVG.renderGenericProductParticle('reactant1', rx, r1, r2) + '</div>' +
            '<div class="particle-caption">' +
              '<div>' + esc(r1.name) + '</div>' +
              '<div class="sub-ion">' + (r1.solid ? 'Katı Kristal Yapısını Korur (Tepkime Yok)' : 'Sulu Çözeltide Orijinal Halinde Kalır') + '</div>' +
              '<div class="sub-zoom-hint">🔍 Modeli büyütmek için tıklayınız</div>' +
            '</div>' +
          '</div>' +

          '<div class="particle-subcard" data-action="zoomParticle" data-arg="p2" tabindex="0" role="button" title="Modeli Büyüt ve İncele">' +
            '<div class="particle-subcard-title">' +
              '<div class="particle-title-left">' +
                '<span class="particle-state-badge badge-physical">Fiziksel Karışım</span>' +
                '<span>' + esc(r2.f) + '</span>' +
              '</div>' +
              '<span class="particle-zoom-badge">🔍 Büyüt</span>' +
            '</div>' +
            '<div class="particle-subcard-body">' + window.MebiSVG.renderGenericProductParticle('reactant2', rx, r1, r2) + '</div>' +
            '<div class="particle-caption">' +
              '<div>' + esc(r2.name) + '</div>' +
              '<div class="sub-ion">' + (r2.solid ? 'Katı Kristal Yapısını Korur (Tepkime Yok)' : 'Sulu Çözeltide Orijinal Halinde Kalır') + '</div>' +
              '<div class="sub-zoom-hint">🔍 Modeli büyütmek için tıklayınız</div>' +
            '</div>' +
          '</div>';
        } else {
          var hasPpt = (rx.obs && rx.obs.indexOf('precipitate') > -1);
          var hasGas = (rx.obs && rx.obs.indexOf('gas') > -1);
          var isComplex = (rx.typeCategories && rx.typeCategories.indexOf('complex') > -1) || (rx.typeCategory === 'complex');
          var isHclNaoh = (r1.id === 'HCl' && r2.id === 'NaOH') || (r1.id === 'NaOH' && r2.id === 'HCl');
          var isO2Gas = (r1.id === 'H2O2' || r2.id === 'H2O2');
          var isCl2Gas = (r1.id === 'H2O2' && r2.id === 'HCl') || (r1.id === 'HCl' && r2.id === 'H2O2');

          var p1Title = '', p1Badge = '', p1Type = '', p1Caption = '';
          var p2Title = '', p2Badge = '', p2Type = '', p2Caption = '';

          if (hasPpt) {
            p1Badge = '<span class="particle-state-badge badge-solid">Katı Çökelti</span>';
            p1Title = esc(rx.mainProductSymbol || 'Katı Çökelti');
            p1Type = rx.mainProductSymbol || 'precipitate';
            p1Caption = 'Suda çözünmeyen katı kristal kafesi beherin dibine çöker.';

            if (hasGas) {
              p2Badge = '<span class="particle-state-badge badge-gas">Açığa Çıkan Gaz</span>';
              p2Title = isO2Gas ? 'O₂ (Oksijen Gazı)' : 'CO₂ (Karbondioksit Gazı)';
              p2Type = isO2Gas ? 'O2' : 'CO2';
              p2Caption = 'Tepkime sonucu oluşan serbest gaz molekülleri çözeltiden ayrılır.';
            } else {
              p2Badge = '<span class="particle-state-badge badge-aqueous">Sulu Çözelti</span>';
              p2Title = esc(rx.spectators || 'Seyirci İyonlar');
              p2Type = 'spectators';
              p2Caption = 'Çökelmeye katılmayan seyirci iyonlar çözeltide serbest solvatize kalır.';
            }
          } else if (hasGas) {
            p1Badge = '<span class="particle-state-badge badge-gas">Açığa Çıkan Gaz</span>';
            p1Title = isO2Gas ? 'O₂ (Oksijen Gazı)' : (isCl2Gas ? 'Cl₂ (Klor Gazı)' : 'CO₂ (Karbondioksit Gazı)');
            p1Type = isO2Gas ? 'O2' : (isCl2Gas ? 'Cl2' : 'CO2');
            p1Caption = 'Sıvıdan atmosfere yükselen kinetik serbest gaz molekülleri.';

            p2Badge = '<span class="particle-state-badge badge-aqueous">Sulu Çözelti</span>';
            p2Title = esc(rx.spectators || 'Çözünmüş İyonlar ve Su');
            p2Type = 'spectators';
            p2Caption = 'Tuz iyonları suda serbest solvatize haldedir.';
          } else if (isComplex) {
            p1Badge = '<span class="particle-state-badge badge-complex">Koordinasyon Kompleksi</span>';
            p1Title = esc(rx.mainProductSymbol || '[Cu(NH₃)₄]²⁺');
            p1Type = 'CuComplex';
            p1Caption = 'Merkez katyona ligandların koordine kovalent bağlarla bağlanması.';

            p2Badge = '<span class="particle-state-badge badge-aqueous">Sulu Çözelti</span>';
            p2Title = esc(rx.spectators || 'NO₃⁻ Seyirci İyonları');
            p2Type = 'spectators';
            p2Caption = 'Kompleksleşmeye katılmayan nitrat iyonları çözeltide serbest solvatize kalır.';
          } else {
            p1Badge = '<span class="particle-state-badge badge-aqueous">Nötrleşme Suyu</span>';
            p1Title = 'H₂O (Su Molekülleri)';
            p1Type = 'H2O';
            p1Caption = 'Asit ve bazın nötrleşmesiyle oluşan kararlı kovalent H₂O molekülleri.';

            p2Badge = '<span class="particle-state-badge badge-aqueous">Çözünmüş Tuz</span>';
            p2Title = isHclNaoh ? 'Na⁺ ve Cl⁻ (Tuz Çözeltisi)' : esc(rx.spectators || 'Çözünmüş İyonlar');
            p2Type = 'spectators';
            p2Caption = 'Oluşan tuz iyonları suda serbest solvatize haldedir (katı kristal oluşturmaz).';
          }

          html += '<div class="particle-subcard" data-action="zoomParticle" data-arg="p1" tabindex="0" role="button" title="Modeli Büyüt ve İncele">' +
            '<div class="particle-subcard-title">' +
              '<div class="particle-title-left">' + p1Badge + ' <span>' + p1Title + '</span></div>' +
              '<span class="particle-zoom-badge">🔍 Büyüt</span>' +
            '</div>' +
            '<div class="particle-subcard-body">' + window.MebiSVG.renderGenericProductParticle(p1Type, rx, r1, r2) + '</div>' +
            '<div class="particle-caption">' +
              '<div>' + p1Caption + '</div>' +
              '<div class="sub-zoom-hint">🔍 Modeli büyütmek için tıklayınız</div>' +
            '</div>' +
          '</div>' +

          '<div class="particle-subcard" data-action="zoomParticle" data-arg="p2" tabindex="0" role="button" title="Modeli Büyüt ve İncele">' +
            '<div class="particle-subcard-title">' +
              '<div class="particle-title-left">' + p2Badge + ' <span>' + p2Title + '</span></div>' +
              '<span class="particle-zoom-badge">🔍 Büyüt</span>' +
            '</div>' +
            '<div class="particle-subcard-body">' + window.MebiSVG.renderGenericProductParticle(p2Type, rx, r1, r2) + '</div>' +
            '<div class="particle-caption">' +
              '<div>' + p2Caption + '</div>' +
              '<div class="sub-zoom-hint">🔍 Modeli büyütmek için tıklayınız</div>' +
            '</div>' +
          '</div>';
        }

        html += '</div>' +

        // Tanecik Düzeyi Değerlendirmesi
        '<div class="camera-note-box" style="border-left-color:var(--mebi-teal);">' +
          '<b>Tanecik Düzeyi Değerlendirmesi:</b> ' + esc(rx.microProductsNote || 'Süreç sonrasındaki mikroskobik tanecik düzeni.') +
        '</div>' +
      '</div>';
    }

    // 4. Entegre Alt Eylem & Başarı Çubuğu
    html += '<div class="camera-bottom-bar">' +
      '<button class="mebi-btn mebi-btn-secondary mebi-btn-sm" data-action="undoLast">' +
        '<span class="mebi-btn-badge">' + window.MebiSVG.icon('undo') + '</span>' +
        '<span>Rapor Sayfasına Dön</span>' +
      '</button>' +

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

    var bodyHtml = '';
    if (totalDiscovered === 0) {
      bodyHtml = '<div style="text-align:center;padding:40px 20px;color:var(--mebi-text-secondary);">' +
        '<p style="font-size:16px;margin-bottom:18px;">Henüz tamamlanmış bir tepkime kartınız bulunmuyor. Madde havuzundan reaktif seçerek ilk deneyinizi gerçekleştirin!</p>' +
        '<button class="mebi-btn mebi-btn-primary" data-action="goPool">' +
          '<span class="mebi-btn-badge">' + window.MebiSVG.icon('flaskOutline') + '</span>' +
          '<span>Madde Havuzuna Git</span>' +
        '</button>' +
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
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:24px;">' +
        '<button class="mebi-btn mebi-btn-primary" data-action="goPool">' +
          '<span class="mebi-btn-badge">' + window.MebiSVG.icon('flaskIc') + '</span>' +
          '<span>Yeni Deney Başlat</span>' +
        '</button>' +
        '<button class="mebi-btn mebi-btn-ghost mebi-btn-sm" data-action="clearCollection">' +
          '<span class="mebi-btn-badge">' + window.MebiSVG.icon('reset') + '</span>' +
          '<span>Koleksiyonu Sıfırla</span>' +
        '</button>' +
      '</div>';
    }

    var html = topbarHTML(true) +
      '<div class="mebi-card">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">' +
          '<div>' +
            '<span class="mebi-badge mebi-badge-success">LABORATUVAR GÜNLÜĞÜ</span>' +
            '<h2 style="font-size:24px;margin-top:4px;font-weight:800;">Keşfedilen Tepkime Kartları (' + totalDiscovered + ' / ' + totalReactions + ')</h2>' +
          '</div>' +
          '<button class="mebi-btn mebi-btn-secondary mebi-btn-sm" data-action="goMenu">' +
            '<span class="mebi-btn-badge">' + window.MebiSVG.icon('undo') + '</span>' +
            '<span>Menüye Dön</span>' +
          '</button>' +
        '</div>' +
        bodyHtml +
      '</div>';

    return html;
  }

  /* ----------------- 4. SÜRÜKLE VE BIRAK MOTORU (DRAG & DROP) ----------------- */
  function wireDragAndDrop() {
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
    goMenu: function() {
      S.screen = 'menu';
      render();
    },
    goPool: function() {
      S.screen = 'pool';
      S.selectedSlot1 = null;
      S.selectedSlot2 = null;
      S.activeReaction = null;
      S.poured = false;
      S.labStep = 'predict';
      S.prediction = [];
      render();
    },
    goCollection: function() {
      S.screen = 'collection';
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
      render(false);
    },
    clearSlot: function(num) {
      if (window.MebiAudio) window.MebiAudio.playClick();
      if (num === '1') S.selectedSlot1 = null;
      if (num === '2') S.selectedSlot2 = null;
      render(false);
    },
    resetPool: function() {
      if (window.MebiAudio) window.MebiAudio.playClick();
      S.selectedSlot1 = null;
      S.selectedSlot2 = null;
      S.searchQuery = '';
      S.categoryFilter = 'all';
      render(false);
    },
    resetExperiment: function() {
      if (window.MebiAudio) window.MebiAudio.playClick();
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
      S.screen = 'menu';
      render();
    },
    startExperiment: function() {
      if (!S.selectedSlot1 || !S.selectedSlot2) return;
      if (window.MebiAudio) window.MebiAudio.playClick();
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
      S.labStep = 'pouring';
      S.poured = true;
      if (window.MebiAudio) window.MebiAudio.playPour();
      render(false);

      setTimeout(function() {
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
          var exact = sameSet(S.prediction, rx.obs);
          S.labStep = 'observed';
          if (exact && window.MebiAudio) {
            window.MebiAudio.playSuccess();
          }
          render();
        }, 1600);
      }, 600);
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
      if (S.typeChecked) {
        var rx = S.activeReaction;
        S.typeEvaluation = window.MebiData.evaluateReactionTypes(S.manualTypeSelections, rx);
        S.typeCorrect = (S.typeEvaluation && S.typeEvaluation.status === 'exact');
      }
      render(false);
    },
    checkType: function() {
      if (!S.manualTypeSelections || S.manualTypeSelections.length === 0) return;
      if (window.MebiAudio) window.MebiAudio.playClick();
      var rx = S.activeReaction;
      S.typeEvaluation = window.MebiData.evaluateReactionTypes(S.manualTypeSelections, rx);
      S.typeChecked = true;
      S.typeCorrect = (S.typeEvaluation && S.typeEvaluation.status === 'exact');

      if (S.typeCorrect && window.MebiAudio) {
        window.MebiAudio.playSuccess();
      } else if (S.typeEvaluation && S.typeEvaluation.status === 'partial' && window.MebiAudio) {
        window.MebiAudio.playSuccess();
      }
      render(false);

      if (window.MebiUI && window.MebiUI.openEvalModal) {
        window.MebiUI.openEvalModal(S.typeEvaluation, S.manualTypeSelections, rx);
      }
    },
    showEvalModal: function() {
      if (!S.typeEvaluation) return;
      if (window.MebiAudio) window.MebiAudio.playClick();
      if (window.MebiUI && window.MebiUI.openEvalModal) {
        window.MebiUI.openEvalModal(S.typeEvaluation, S.manualTypeSelections, S.activeReaction);
      }
    },
    saveCard: function() {
      if (window.MebiUI && window.MebiUI.closeEvalModal) {
        window.MebiUI.closeEvalModal();
      }
      if (window.MebiAudio) window.MebiAudio.playClick();
      var r1 = window.MebiData.getReagent(S.selectedSlot1);
      var r2 = window.MebiData.getReagent(S.selectedSlot2);
      var rx = S.activeReaction;

      var alreadyIn = false;
      for (var i = 0; i < S.collection.length; i++) {
        if (S.collection[i].eq === rx.eq) {
          alreadyIn = true;
          break;
        }
      }

      if (!alreadyIn && rx.typeCategory !== 'none') {
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
        { sym: 'H', name: 'Hidrojen', color: '#f1f5f9', border: '#cbd5e1' },
        { sym: 'O', name: 'Oksijen', color: '#e11d48' },
        { sym: 'C', name: 'Karbon', color: '#334155' },
        { sym: 'N', name: 'Azot', color: '#0284c7' },
        { sym: 'Cl', name: 'Klor', color: '#22c55e' },
        { sym: 'I', name: 'İyot', color: '#7c3aed' },
        { sym: 'S', name: 'Kükürt', color: '#eab308' },
        { sym: 'Na', name: 'Sodyum', color: '#9333ea' },
        { sym: 'K', name: 'Potasyum', color: '#8b5cf6' },
        { sym: 'Ca', name: 'Kalsiyum', color: '#14b8a6' },
        { sym: 'Ba', name: 'Baryum', color: '#10b981' },
        { sym: 'Pb', name: 'Kurşun', color: '#f59e0b' },
        { sym: 'Ag', name: 'Gümüş', color: '#94a3b8' },
        { sym: 'Cu', name: 'Bakır', color: '#2563eb' },
        { sym: 'Fe', name: 'Demir', color: '#ea580c' },
        { sym: 'Zn', name: 'Çinko', color: '#64748b' },
        { sym: 'Mn', name: 'Mangan', color: '#a855f7' }
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
          'CuSO4': ['Cu', 'S', 'O'], 'Fe': ['Fe'], 'Zn': ['Zn'], 'Cu': ['Cu'],
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
            modalData.ions = [{ label: reactant.f + ' Katısı', desc: 'Kristal örgü kafesi' }];
          }
        } else if (reactant.id === 'H2O2' || reactant.id === 'NH3') {
          modalData.desc = reactant.name + ' sulu çözeltide moleküler halde dağılmıştır. Su molekülleri ile hidrojen bağları kurarak çözünür ve serbest solvatize moleküller halinde hareket eder.';
          modalData.ions = [
            { label: reactant.f + ' Molekülü', desc: 'Kovalent bağlı nötr tanecik' },
            { label: 'H₂O Molekülleri', desc: 'Çözücü hidratasyon kılıfı' }
          ];
        } else {
          modalData.desc = reactant.name + ' suda tamamen iyonlaşarak katyon ve anyonlarına ayrışır. Her bir iyon su moleküllerinin dipolleri tarafından sarılarak (hidrate / solvatize) çözeltide serbestçe hareket eder.';
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
          } else if (reactant.id === 'PbNO32') {
            modalData.ions = [{ label: 'Pb²⁺', desc: 'Kurşun(II) katyonu' }, { label: 'NO₃⁻', desc: 'Nitrat anyonları' }];
          } else if (reactant.id === 'CuSO4') {
            modalData.ions = [{ label: 'Cu²⁺', desc: 'Bakır(II) katyonu' }, { label: 'SO₄²⁻', desc: 'Sülfat anyonu' }];
          } else if (reactant.id === 'CuNO32') {
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
                modalData.desc = 'Net çökelme tepkimesine katılmayan seyirci iyonlar, çözeltide serbest solvatize iyonlar halinde kalmaya devam eder.';
                modalData.ions = [
                  { label: rx.spectators || 'Seyirci İyonlar', desc: 'Çözeltide serbest ve hidrate iyonlar' },
                  { label: 'H₂O Molekülleri', desc: 'Solvatasyon kılıfı' }
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
              modalData.desc = 'Kompleks oluşum tepkimesine katılmayan nitrat iyonları çözeltide elektriksel nötralliği sağlamak üzere serbest solvatize olarak bulunur.';
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
              modalData.desc = 'Nötrleşme tepkimesi sonucu oluşan tuz (örneğin NaCl) suda yüksek çözünürlüğe sahip olduğu için katı kristal oluşturmaz; çözeltide serbest solvatize iyonlar halinde kalır.';
              modalData.ions = [
                { label: isHclNaoh ? 'Na⁺ ve Cl⁻' : 'Tuz İyonları', desc: 'Çözeltide serbest solvatize iyonlar' },
                { label: 'H₂O', desc: 'Solvatasyon kılıfı' }
              ];
            }
          }
        }
      }

      if (window.MebiUI && window.MebiUI.openParticleModal) {
        window.MebiUI.openParticleModal(modalData);
      }
    },
    clearCollection: function() {
      if (window.MebiAudio) window.MebiAudio.playClick();
      S.collection = [];
      saveCollectionToStorage();
      window.MebiUI.showToast('info', 'Koleksiyon Sıfırlandı', 'Kayıtlı tüm deney kartları temizlendi.', 2500);
      render();
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
          S.screen = 'menu';
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
    app.innerHTML = fn();
    wireInputs();
    wireDragAndDrop();

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
    state: S,
    dispatch: dispatch,
    render: render
  };

})(window);
