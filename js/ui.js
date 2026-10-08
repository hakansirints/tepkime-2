/**
 * MEBİ Arayüz ve Etkileşim Yöneticisi (ui.js)
 * Tema yönetimi, ses geçişi, dokunsal toast bildirimleri ve çekmece/modal kontrolleri.
 */

(function(window) {
  'use strict';

  /* ----------------- 1. TEMA YÖNETİMİ (Light & Neutral Graphite Dark) ----------------- */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('mebi-theme', theme);
    } catch (e) {}

    var themeThumb = document.querySelector('.mebi-theme-thumb');
    if (themeThumb) {
      if (theme === 'dark') {
        themeThumb.style.transform = 'translateX(30px)';
      } else {
        themeThumb.style.transform = 'translateX(0)';
      }
    }
  }

  function getSavedTheme() {
    try {
      var saved = localStorage.getItem('mebi-theme');
      if (saved) return saved;
    } catch (e) {}
    return 'light';
  }

  function toggleTheme() {
    var cur = document.documentElement.getAttribute('data-theme') || 'light';
    var next = cur === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    if (window.MebiAudio) window.MebiAudio.playClick();
    showMebiToast('info', 'Tema Güncellendi', next === 'dark' ? 'Karanlık (Nötr Grafit) mod aktif.' : 'Aydınlık mod aktif.', 2500);
  }

  /* ----------------- 2. DOKUNSAL TOAST BİLDİRİM MOTORU ----------------- */
  function getToastContainer() {
    var container = document.getElementById('mebiToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'mebiToastContainer';
      container.className = 'mebi-toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  var toastIcons = {
    success: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    info: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    warning: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    danger: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    settings: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>'
  };

  function showMebiToast(type, title, message, duration) {
    type = type || 'info';
    duration = duration || 3500;
    var container = getToastContainer();

    var toastEl = document.createElement('div');
    toastEl.className = 'mebi-toast mebi-toast-' + type;

    var iconSvg = toastIcons[type] || toastIcons.info;
    toastEl.innerHTML =
      '<div class="mebi-toast-icon">' + iconSvg + '</div>' +
      '<div class="mebi-toast-content">' +
        '<div class="mebi-toast-title">' + (title || '') + '</div>' +
        '<div class="mebi-toast-desc">' + (message || '') + '</div>' +
      '</div>' +
      '<div class="mebi-toast-timer-wrap">' +
        '<svg class="mebi-toast-circle-svg" viewBox="0 0 32 32">' +
          '<circle class="mebi-toast-circle-bg" cx="16" cy="16" r="13"></circle>' +
          '<circle class="mebi-toast-circle-meter" cx="16" cy="16" r="13" style="animation-duration:' + duration + 'ms;"></circle>' +
        '</svg>' +
        '<button type="button" class="mebi-toast-close" title="Kapat">✕</button>' +
      '</div>';

    function dismissToast() {
      if (toastEl.classList.contains('is-hiding')) return;
      toastEl.classList.add('is-hiding');
      setTimeout(function() {
        if (toastEl.parentNode) {
          toastEl.parentNode.removeChild(toastEl);
        }
      }, 260);
    }

    var closeBtn = toastEl.querySelector('.mebi-toast-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        dismissToast();
      });
    }

    container.appendChild(toastEl);

    var autoTimer = setTimeout(dismissToast, duration);

    toastEl.addEventListener('mouseenter', function() {
      clearTimeout(autoTimer);
      var meter = toastEl.querySelector('.mebi-toast-circle-meter');
      if (meter) meter.style.animationPlayState = 'paused';
    });

    toastEl.addEventListener('mouseleave', function() {
      var meter = toastEl.querySelector('.mebi-toast-circle-meter');
      if (meter) meter.style.animationPlayState = 'running';
      autoTimer = setTimeout(dismissToast, 1600);
    });

    if (window.MebiAudio) window.MebiAudio.playHover();
  }

  /* ----------------- 3. ÇEKMECE PANELİ YÖNETİMİ ----------------- */
  function openDrawer(title, contentHtml) {
    var drawer = document.getElementById('mebiDrawer');
    var overlay = document.getElementById('mebiDrawerOverlay');
    var drawerTitle = document.getElementById('mebiDrawerTitle');
    var drawerBody = document.getElementById('mebiDrawerBody');

    if (drawer && overlay) {
      if (drawerTitle) drawerTitle.innerHTML = title || 'Bilgi';
      if (drawerBody) drawerBody.innerHTML = contentHtml || '';
      drawer.classList.add('is-active');
      overlay.classList.add('is-active');
      document.body.style.overflow = 'hidden';
      if (window.MebiAudio) window.MebiAudio.playClick();
    }
  }

  function closeDrawer() {
    var drawer = document.getElementById('mebiDrawer');
    var overlay = document.getElementById('mebiDrawerOverlay');
    if (drawer && overlay) {
      drawer.classList.remove('is-active');
      overlay.classList.remove('is-active');
      document.body.style.overflow = '';
      if (window.MebiAudio) window.MebiAudio.playClick();
    }
  }

  /* ----------------- 4. 3B TANECİK BÜYÜTME VE İNCELEME MODALI ----------------- */
  function openParticleModal(data) {
    if (!data) return;
    var overlay = document.getElementById('particleModalOverlay');
    var badgeEl = document.getElementById('particleModalBadge');
    var titleEl = document.getElementById('particleModalTitle');
    var bodyEl = document.getElementById('particleModalBody');

    if (!overlay || !bodyEl) return;

    if (badgeEl) {
      badgeEl.className = 'particle-state-badge ' + (data.badgeClass || 'badge-aqueous');
      badgeEl.textContent = data.badgeText || data.badge || '3B Model';
    }
    if (titleEl) {
      titleEl.innerHTML = data.title || 'Tanecik Modeli';
    }

    var svgContent = data.svgHtml || data.svg || '';
    var descContent = data.descText || data.desc || '';

    var ionsHtml = '';
    if (data.ions && data.ions.length > 0) {
      ionsHtml = '<div class="particle-modal-ions-grid" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;">';
      data.ions.forEach(function(ion) {
        ionsHtml += '<div style="background:var(--mebi-bg-surface);box-shadow:0 2px 0 var(--mebi-base-card);border-radius:var(--mebi-radius-md);padding:6px 12px;font-size:12px;display:flex;flex-direction:column;gap:2px;">' +
          '<span style="font-weight:800;color:var(--mebi-text-main);">' + ion.label + '</span>' +
          '<span style="font-size:11px;color:var(--mebi-text-muted);">' + ion.desc + '</span>' +
        '</div>';
      });
      ionsHtml += '</div>';
    }

    if (data.modelKey && window.ParticleScene && window.TepkimeArenasi) {
      bodyEl.innerHTML =
        '<div class="particle-modal-stage-wrap particle-modal-stage-3d" id="particleModalStageWrap">' +
          '<div class="particle-3d-host" id="particleModal3dHost" data-particle-view="' + data.modelKey + '" data-particle-type="' + (data.modelType || '') + '" aria-label="Etkileşimli üç boyutlu tanecik modeli"></div>' +
        '</div>' +
        '<div class="particle-modal-info-panel"><div class="particle-modal-desc-text"><b>Kimyasal ve Fiziksel Durum:</b> ' + descContent + ionsHtml + '</div></div>';
      overlay.classList.add('is-active');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      window.ParticleScene.mountModal(document.getElementById('particleModal3dHost'), data.modelKey, window.TepkimeArenasi.state);
      if (window.MebiAudio) window.MebiAudio.playClick();
      return;
    }

    bodyEl.innerHTML =
      '<div class="particle-modal-toolbar">' +
        '<div class="particle-modal-zoom-controls">' +
          '<span class="zoom-label">Model Ölçeği:</span>' +
          '<button type="button" class="zoom-scale-btn is-active" data-scale="1">1x Normal</button>' +
          '<button type="button" class="zoom-scale-btn" data-scale="1.35">1.35x Yakın</button>' +
          '<button type="button" class="zoom-scale-btn" data-scale="1.7">1.7x Detay</button>' +
        '</div>' +
        '<button type="button" class="mebi-btn mebi-btn-ghost mebi-btn-xs" id="btnResetPan" title="Modeli Merkeze Sıfırla">' +
          '<span class="mebi-btn-badge">🎯</span>' +
          '<span>Merkeze Al</span>' +
        '</button>' +
      '</div>' +
      '<div class="particle-modal-stage-wrap" id="particleModalStageWrap" title="Modeli dokunarak veya sürükleyerek kaydırabilirsiniz">' +
        '<div class="particle-modal-drag-hint">' +
          '<span>🖐️ Modeli dokunarak veya sürükleyerek dilediğiniz yöne kaydırabilirsiniz</span>' +
        '</div>' +
        '<div class="particle-modal-stage" id="particleModalStage">' +
          svgContent +
        '</div>' +
      '</div>' +
      '<div class="particle-modal-info-panel">' +
        '<div class="particle-modal-desc-text">' +
          '<b>Kimyasal ve Fiziksel Durum:</b> ' + descContent +
          ionsHtml +
        '</div>' +
      '</div>';

    var stageWrap = document.getElementById('particleModalStageWrap');
    var stage = document.getElementById('particleModalStage');
    var btnReset = document.getElementById('btnResetPan');
    var scaleBtns = bodyEl.querySelectorAll('.zoom-scale-btn');

    var currentScale = 1;
    var panX = 0;
    var panY = 0;
    var isDragging = false;
    var startPointerX = 0;
    var startPointerY = 0;
    var startPanX = 0;
    var startPanY = 0;

    function clampPan() {
      if (!stageWrap || !stage) return;
      var wrapWidth = stageWrap.clientWidth || 600;
      var wrapHeight = stageWrap.clientHeight || 300;
      var stageW = stage.offsetWidth || 340;
      var stageH = stage.offsetHeight || 230;
      var scaledW = stageW * currentScale;
      var scaledH = stageH * currentScale;
      var maxX = Math.max(120, (scaledW - wrapWidth) / 2 + 120);
      var maxY = Math.max(90, (scaledH - wrapHeight) / 2 + 90);
      if (panX > maxX) panX = maxX;
      if (panX < -maxX) panX = -maxX;
      if (panY > maxY) panY = maxY;
      if (panY < -maxY) panY = -maxY;
    }

    function updateTransform(smooth) {
      if (!stage) return;
      stage.style.transition = smooth ? 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)' : 'none';
      stage.style.transform = 'translate(' + panX + 'px, ' + panY + 'px) scale(' + currentScale + ')';
    }

    scaleBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        scaleBtns.forEach(function(b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        currentScale = parseFloat(btn.getAttribute('data-scale') || '1');
        if (currentScale === 1) {
          panX = 0;
          panY = 0;
        } else {
          clampPan();
        }
        updateTransform(true);
        if (window.MebiAudio) window.MebiAudio.playClick();
      });
    });

    if (btnReset) {
      btnReset.addEventListener('click', function() {
        panX = 0;
        panY = 0;
        updateTransform(true);
        if (window.MebiAudio) window.MebiAudio.playClick();
      });
    }

    if (stageWrap) {
      stageWrap.addEventListener('pointerdown', function(e) {
        if (e.target.closest('button')) return;
        isDragging = true;
        stageWrap.classList.add('is-dragging');
        try { stageWrap.setPointerCapture(e.pointerId); } catch(err) {}
        startPointerX = e.clientX;
        startPointerY = e.clientY;
        startPanX = panX;
        startPanY = panY;
      });

      stageWrap.addEventListener('pointermove', function(e) {
        if (!isDragging) return;
        var dx = e.clientX - startPointerX;
        var dy = e.clientY - startPointerY;
        panX = startPanX + dx;
        panY = startPanY + dy;
        clampPan();
        updateTransform(false);
      });

      function onPointerEnd(e) {
        if (!isDragging) return;
        isDragging = false;
        stageWrap.classList.remove('is-dragging');
        try { stageWrap.releasePointerCapture(e.pointerId); } catch(err) {}
        clampPan();
        updateTransform(true);
      }

      stageWrap.addEventListener('pointerup', onPointerEnd);
      stageWrap.addEventListener('pointercancel', onPointerEnd);

      stageWrap.addEventListener('wheel', function(e) {
        e.preventDefault();
        panX -= e.deltaX;
        panY -= e.deltaY;
        clampPan();
        updateTransform(false);
      }, { passive: false });
    }

    overlay.classList.add('is-active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (window.MebiAudio) window.MebiAudio.playClick();
  }

  function closeParticleModal() {
    var overlay = document.getElementById('particleModalOverlay');
    if (overlay) {
      overlay.classList.remove('is-active');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (window.ParticleScene) window.ParticleScene.disposeModal();
      if (window.MebiAudio) window.MebiAudio.playClick();
    }
  }

  /* ----------------- 5. DEĞERLENDİRME GERİ BİLDİRİM BİLGİ KARTI MODALI ----------------- */
  function openEvalModal(evalData, userSelections, rx) {
    if (!evalData) return;
    var overlay = document.getElementById('evalModalOverlay');
    var headerEl = document.getElementById('evalModalHeader');
    var badgeEl = document.getElementById('evalModalBadge');
    var titleEl = document.getElementById('evalModalTitle');
    var bodyEl = document.getElementById('evalModalBody');

    if (!overlay || !bodyEl) return;

    var status = evalData.status || 'wrong';
    var isExact = (status === 'exact');
    var isPartial = (status === 'partial');

    // Header ve Rozet Konfigürasyonu
    if (headerEl) {
      headerEl.className = 'eval-modal-header ' + (isExact ? 'is-exact' : (isPartial ? 'is-partial' : 'is-wrong'));
    }

    if (badgeEl) {
      if (isExact) {
        badgeEl.className = 'eval-status-badge eval-badge-exact';
        badgeEl.textContent = '✓ TAM DOĞRU DEĞERLENDİRME';
      } else if (isPartial) {
        badgeEl.className = 'eval-status-badge eval-badge-partial';
        badgeEl.textContent = '! KISMİ DOĞRU TESPİTİ';
      } else {
        badgeEl.className = 'eval-status-badge eval-badge-wrong';
        badgeEl.textContent = '! İNCELEME GEREKLİ';
      }
    }

    if (titleEl) {
      titleEl.textContent = evalData.title || (isExact ? 'Tebrikler! Doğru Tespit' : 'Tepkime Türü Analizi');
    }

    // Callout İkonu
    var iconSvg = isExact
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
      : (isPartial
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
      );

    var calloutClass = isExact ? 'eval-callout-exact' : (isPartial ? 'eval-callout-partial' : 'eval-callout-wrong');

    // Seçimlerin Özeti (Kullanıcının işaretlediği şıklar)
    var chipsHtml = '';
    if (userSelections && userSelections.length > 0) {
      chipsHtml = '<div class="eval-selections-bar">' +
        '<span class="eval-selections-label">İşaretlediğiniz Seçenekler:</span>' +
        '<div class="eval-chips-grid">';

      for (var i = 0; i < userSelections.length; i++) {
        var opt = userSelections[i];
        var optLetter = opt.charAt(0);
        var catKey = (optLetter === 'A' ? 'ppt' : (optLetter === 'B' ? 'acidbase' : (optLetter === 'C' ? 'redox' : (optLetter === 'D' ? 'complex' : 'none'))));
        var isValid = (evalData.validCategories && evalData.validCategories.indexOf(catKey) > -1);

        chipsHtml += '<span class="eval-chip ' + (isValid ? 'eval-chip-valid' : 'eval-chip-invalid') + '">' +
          (isValid ? '✓ ' : '✕ ') + opt +
        '</span>';
      }
      chipsHtml += '</div></div>';
    }

    // Johnstone Üçgeni Pedagojik İpucu
    var pedagogyHtml = '<div class="eval-pedagogy-tip">' +
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>' +
      '<span><b>Johnstone Üçgeni:</b> Makroskobik ve sembolik analizi tamamladınız. Tepkimenin moleküler mekanizmasını görmek için alt-mikroskobik tanecik kamerasına geçebilirsiniz.</span>' +
    '</div>';

    bodyEl.innerHTML =
      '<div class="eval-callout ' + calloutClass + '">' +
        '<div class="eval-callout-icon">' + iconSvg + '</div>' +
        '<div class="eval-callout-content">' +
          '<div class="eval-callout-title">' + (evalData.title || 'Değerlendirme Açıklaması') + '</div>' +
          '<div class="eval-callout-text">' + evalData.explanation + '</div>' +
        '</div>' +
      '</div>' +
      chipsHtml +
      pedagogyHtml;

    overlay.classList.add('is-active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (window.MebiAudio) window.MebiAudio.playClick();
  }

  function closeEvalModal() {
    var overlay = document.getElementById('evalModalOverlay');
    if (overlay) {
      overlay.classList.remove('is-active');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (window.MebiAudio) window.MebiAudio.playClick();
    }
  }

  /* ----------------- 5b. SIFIRLAMA ONAY MODALI (RESET CONFIRMATION MODAL) ----------------- */
  var pendingResetConfirmCallback = null;

  function openResetModal(count, onConfirm) {
    var overlay = document.getElementById('resetModalOverlay');
    var textEl = document.getElementById('resetModalText');
    if (!overlay) return;
    pendingResetConfirmCallback = onConfirm;
    if (textEl) {
      textEl.textContent = 'Bu işlem keşfettiğiniz tüm tepkime kartlarını (' + (count || 0) + ' adet) ve mevcut laboratuvar deney ilerlemesini kalıcı olarak silecektir. Devam etmek istiyor musunuz?';
    }
    overlay.classList.add('is-active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (window.MebiAudio) window.MebiAudio.playClick();
  }

  function closeResetModal() {
    var overlay = document.getElementById('resetModalOverlay');
    if (overlay) {
      overlay.classList.remove('is-active');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      pendingResetConfirmCallback = null;
      if (window.MebiAudio) window.MebiAudio.playClick();
    }
  }

  function confirmResetModal() {
    var callback = pendingResetConfirmCallback;
    closeResetModal();
    if (typeof callback === 'function') {
      callback();
    }
  }

  /* ----------------- 6. CİHAZI YATAY ÇEVİRİN (ORIENTATION LOCK) YÖNETİMİ ----------------- */
  var isOrientationDismissed = false;

  function openOrientationOverlay() {
    var overlay = document.getElementById('mebiOrientationOverlay');
    if (overlay) {
      isOrientationDismissed = false;
      document.body.classList.add('mebi-landscape-required');
      overlay.classList.add('is-active');
      document.body.style.overflow = 'hidden';
      if (window.MebiAudio) window.MebiAudio.playClick();
    }
  }

  function closeOrientationOverlay() {
    var overlay = document.getElementById('mebiOrientationOverlay');
    var isPortrait = (window.innerHeight > window.innerWidth) || (window.matchMedia && window.matchMedia('(orientation: portrait)').matches);
    var isMobileOrTablet = (window.innerWidth <= 900) || (window.innerHeight <= 600 && window.innerWidth <= 1024);
    if (isPortrait && isMobileOrTablet) {
      checkOrientation();
      return;
    }
    if (overlay) {
      overlay.classList.remove('is-active');
      overlay.classList.remove('is-forced');
      isOrientationDismissed = true;
      document.body.classList.remove('mebi-landscape-required');
      document.body.style.overflow = '';
      if (window.MebiAudio) window.MebiAudio.playClick();

      // Cihaz yataya çevrildiğinde rehber henüz açılmadıysa popup kartı aç
      var hideWelcome = false;
      try {
        hideWelcome = (localStorage.getItem('mebi_hide_welcome_modal') === 'true');
      } catch (e) {}
      if (!isWelcomeOpened && !hideWelcome) {
        setTimeout(function() {
          openWelcomeModal();
        }, 220);
      }
    }
  }

  function checkOrientation() {
    var overlay = document.getElementById('mebiOrientationOverlay');
    if (!overlay) return;

    var isPortrait = (window.innerHeight > window.innerWidth) || (window.matchMedia && window.matchMedia('(orientation: portrait)').matches);
    var isMobileOrTablet = (window.innerWidth <= 900) || (window.innerHeight <= 600 && window.innerWidth <= 1024);
    var isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);

    document.body.classList.toggle('mebi-mobile-landscape', !isPortrait && isMobileOrTablet);

    if (isPortrait && isMobileOrTablet && isTouchDevice && !isOrientationDismissed) {
      document.body.classList.add('mebi-landscape-required');
      overlay.classList.add('is-forced');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    } else if (!isPortrait || !isMobileOrTablet || isOrientationDismissed) {
      overlay.classList.remove('is-forced');
      overlay.classList.remove('is-active');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('mebi-landscape-required');
      document.body.style.overflow = '';
      if (!isPortrait) {
        isOrientationDismissed = false;

        var hideWelcome = false;
        try {
          hideWelcome = (localStorage.getItem('mebi_hide_welcome_modal') === 'true');
        } catch (e) {}
        if (!isWelcomeOpened && !hideWelcome) {
          setTimeout(function() {
            openWelcomeModal();
          }, 300);
        }
      }
    }
  }

  /* ----------------- 6.5. ÖĞRENCİ BAŞLANGIÇ REHBERİ POP-UP KARTI ----------------- */
  var isWelcomeOpened = false;

  /* ----------------- 6.6. MİNİMALİST SEKMELİ REHBER KARTI (ÖNERİ 3) ----------------- */
  var currentWelcomeStep = 1;
  var welcomeStepData = {
    1: { pillText: '👁️ 1. Makroskobik Gözlem Seviyesi', pillClass: 'pill-makro' },
    2: { pillText: '⚗️ 2. Sembolik & Hipotez Seviyesi', pillClass: 'pill-sembolik' },
    3: { pillText: '👁️ 1. Makroskobik Gözlem Seviyesi', pillClass: 'pill-cyan' },
    4: { pillText: '⚗️ 2. Sembolik Analiz Seviyesi', pillClass: 'pill-emerald' },
    5: { pillText: '🔬 3. Alt-Mikroskobik Tanecik Boyutu', pillClass: 'pill-purple' }
  };

  function setWelcomeStep(stepNum) {
    if (stepNum < 1) stepNum = 1;
    if (stepNum > 5) stepNum = 5;
    currentWelcomeStep = stepNum;

    var tabs = document.querySelectorAll('.welcome-tab-btn');
    for (var t = 0; t < tabs.length; t++) {
      var tab = tabs[t];
      var s = parseInt(tab.getAttribute('data-step'), 10);
      if (s === currentWelcomeStep) {
        tab.classList.add('tab-active');
        tab.setAttribute('aria-selected', 'true');
      } else {
        tab.classList.remove('tab-active');
        tab.setAttribute('aria-selected', 'false');
      }
    }

    for (var i = 1; i <= 5; i++) {
      var panel = document.getElementById('welcomeStep' + i);
      if (panel) {
        if (i === currentWelcomeStep) {
          panel.classList.add('is-active');
        } else {
          panel.classList.remove('is-active');
        }
      }
    }

    var jPill = document.getElementById('welcomeJohnstonePill');
    if (jPill && welcomeStepData[currentWelcomeStep]) {
      jPill.textContent = welcomeStepData[currentWelcomeStep].pillText;
      jPill.className = 'welcome-johnstone-pill ' + welcomeStepData[currentWelcomeStep].pillClass;
    }

    var counter = document.getElementById('welcomeStepCounter');
    if (counter) counter.textContent = currentWelcomeStep + ' / 5';

    var btnPrev = document.getElementById('btnWelcomePrev');
    if (btnPrev) btnPrev.disabled = (currentWelcomeStep === 1);

    var btnNext = document.getElementById('btnWelcomeNext');
    if (btnNext) {
      if (currentWelcomeStep === 5) {
        btnNext.innerHTML = '<span>Başa Dön</span> ↺';
      } else {
        btnNext.innerHTML = '<span>Sonraki</span> →';
      }
    }
  }

  function openWelcomeModal() {
    var overlay = document.getElementById('welcomeModalOverlay');
    var chk = document.getElementById('chkDoNotShowWelcome');
    if (!overlay) return;

    if (chk) {
      try {
        chk.checked = (localStorage.getItem('mebi_hide_welcome_modal') === 'true');
      } catch (e) {
        chk.checked = false;
      }
    }

    setWelcomeStep(1);
    isWelcomeOpened = true;
    overlay.classList.add('is-active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (window.MebiAudio) window.MebiAudio.playClick();
  }

  function closeWelcomeModal() {
    var overlay = document.getElementById('welcomeModalOverlay');
    var chk = document.getElementById('chkDoNotShowWelcome');
    if (overlay) {
      overlay.classList.remove('is-active');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';

      if (chk) {
        try {
          localStorage.setItem('mebi_hide_welcome_modal', chk.checked ? 'true' : 'false');
        } catch (e) {}
      }

      if (window.MebiAudio) window.MebiAudio.playClick();
    }
  }

  /* ----------------- 7. İLK YÜKLEME ----------------- */
  document.addEventListener('DOMContentLoaded', function() {
    applyTheme(getSavedTheme());

    var overlay = document.getElementById('mebiDrawerOverlay');
    var closeBtn = document.getElementById('btnCloseDrawer');
    if (overlay) overlay.addEventListener('click', closeDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

    // Öğrenci Başlangıç Rehberi Pop-up Kartı butonları
    var closeWelcomeBtn = document.getElementById('btnCloseWelcomeModal');
    var dismissWelcomeBtn = document.getElementById('btnDismissWelcomeModal');
    var welcomeOverlay = document.getElementById('welcomeModalOverlay');
    var chkWelcome = document.getElementById('chkDoNotShowWelcome');

    if (closeWelcomeBtn) closeWelcomeBtn.addEventListener('click', closeWelcomeModal);
    if (dismissWelcomeBtn) dismissWelcomeBtn.addEventListener('click', closeWelcomeModal);

    // Sekme Butonları Dinleyicileri
    var tabBtns = document.querySelectorAll('.welcome-tab-btn');
    for (var b = 0; b < tabBtns.length; b++) {
      (function(btn) {
        btn.addEventListener('click', function() {
          var s = parseInt(btn.getAttribute('data-step'), 10);
          if (s) {
            setWelcomeStep(s);
            if (window.MebiAudio) window.MebiAudio.playHover();
          }
        });
      })(tabBtns[b]);
    }

    // İleri / Geri Butonları
    var btnPrev = document.getElementById('btnWelcomePrev');
    var btnNext = document.getElementById('btnWelcomeNext');
    if (btnPrev) {
      btnPrev.addEventListener('click', function() {
        if (currentWelcomeStep > 1) {
          setWelcomeStep(currentWelcomeStep - 1);
          if (window.MebiAudio) window.MebiAudio.playHover();
        }
      });
    }
    if (btnNext) {
      btnNext.addEventListener('click', function() {
        if (currentWelcomeStep < 5) {
          setWelcomeStep(currentWelcomeStep + 1);
        } else {
          setWelcomeStep(1);
        }
        if (window.MebiAudio) window.MebiAudio.playHover();
      });
    }

    if (chkWelcome) {
      chkWelcome.addEventListener('change', function() {
        try {
          localStorage.setItem('mebi_hide_welcome_modal', chkWelcome.checked ? 'true' : 'false');
        } catch (e) {}
      });
    }

    if (welcomeOverlay) {
      welcomeOverlay.addEventListener('click', function(e) {
        if (e.target === welcomeOverlay) {
          closeWelcomeModal();
        }
      });
    }

    // 3B Tanecik Büyütme Modalı butonları
    var closeParticleBtn = document.getElementById('btnCloseParticleModal');
    var dismissParticleBtn = document.getElementById('btnDismissParticleModal');
    var particleOverlay = document.getElementById('particleModalOverlay');

    if (closeParticleBtn) closeParticleBtn.addEventListener('click', closeParticleModal);
    if (dismissParticleBtn) dismissParticleBtn.addEventListener('click', closeParticleModal);
    if (particleOverlay) {
      particleOverlay.addEventListener('click', function(e) {
        if (e.target === particleOverlay) {
          closeParticleModal();
        }
      });
    }

    // Değerlendirme Bilgi Kartı Modalı butonları
    var closeEvalBtn = document.getElementById('btnCloseEvalModal');
    var dismissEvalBtn = document.getElementById('btnDismissEvalModal');
    var proceedMicroBtn = document.getElementById('btnProceedMicroFromModal');
    var evalOverlay = document.getElementById('evalModalOverlay');

    if (closeEvalBtn) closeEvalBtn.addEventListener('click', closeEvalModal);
    if (dismissEvalBtn) dismissEvalBtn.addEventListener('click', closeEvalModal);
    if (proceedMicroBtn) {
      proceedMicroBtn.addEventListener('click', function() {
        closeEvalModal();
        if (window.TepkimeArenasi && window.TepkimeArenasi.dispatch) {
          window.TepkimeArenasi.dispatch('saveCard');
        }
      });
    }
    if (evalOverlay) {
      evalOverlay.addEventListener('click', function(e) {
        if (e.target === evalOverlay) {
          closeEvalModal();
        }
      });
    }

    // Yatay ekran kalkanı butonları
    var closeOriBtn = document.getElementById('btnCloseOrientation');
    var dismissOriBtn = document.getElementById('btnDismissOrientation');
    var oriOverlay = document.getElementById('mebiOrientationOverlay');

    if (closeOriBtn) closeOriBtn.addEventListener('click', closeOrientationOverlay);
    if (dismissOriBtn) dismissOriBtn.addEventListener('click', closeOrientationOverlay);

    if (oriOverlay) {
      oriOverlay.addEventListener('click', function(e) {
        if (e.target === oriOverlay) {
          closeOrientationOverlay();
        }
      });
    }

    // Sıfırlama Onay Modalı butonları
    var closeResetBtn = document.getElementById('btnCloseResetModal');
    var cancelResetBtn = document.getElementById('btnCancelResetModal');
    var confirmResetBtn = document.getElementById('btnConfirmResetModal');
    var resetOverlay = document.getElementById('resetModalOverlay');

    if (closeResetBtn) closeResetBtn.addEventListener('click', closeResetModal);
    if (cancelResetBtn) cancelResetBtn.addEventListener('click', closeResetModal);
    if (confirmResetBtn) confirmResetBtn.addEventListener('click', confirmResetModal);
    if (resetOverlay) {
      resetOverlay.addEventListener('click', function(e) {
        if (e.target === resetOverlay) closeResetModal();
      });
    }

    // ESC tuşu ile kapatma
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        if (resetOverlay && resetOverlay.classList.contains('is-active')) {
          closeResetModal();
          return;
        }
        if (welcomeOverlay && welcomeOverlay.classList.contains('is-active')) {
          closeWelcomeModal();
          return;
        }
        if (evalOverlay && evalOverlay.classList.contains('is-active')) {
          closeEvalModal();
          return;
        }
        if (particleOverlay && particleOverlay.classList.contains('is-active')) {
          closeParticleModal();
          return;
        }
        if (oriOverlay && (oriOverlay.classList.contains('is-active') || oriOverlay.classList.contains('is-forced'))) {
          closeOrientationOverlay();
        }
        closeDrawer();
      }
    });

    // Yön değişimi ve yeniden boyutlandırma dinleyicileri
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    // Öğrenci Arenayı açtığında otomatik gösterim kontrolü
    var hideWelcome = false;
    try {
      hideWelcome = (localStorage.getItem('mebi_hide_welcome_modal') === 'true');
    } catch (e) {}

    var isPortrait = (window.innerHeight > window.innerWidth) || (window.matchMedia && window.matchMedia('(orientation: portrait)').matches);
    var isMobileOrTablet = (window.innerWidth <= 900) || (window.innerHeight <= 600 && window.innerWidth <= 1024);

    if (!hideWelcome && (!isPortrait || !isMobileOrTablet)) {
      setTimeout(function() {
        openWelcomeModal();
      }, 350);
    }
  });

  // Global erişim
  window.MebiUI = {
    applyTheme: applyTheme,
    getSavedTheme: getSavedTheme,
    toggleTheme: toggleTheme,
    showToast: showMebiToast,
    openDrawer: openDrawer,
    closeDrawer: closeDrawer,
    openWelcomeModal: openWelcomeModal,
    closeWelcomeModal: closeWelcomeModal,
    openParticleModal: openParticleModal,
    closeParticleModal: closeParticleModal,
    openEvalModal: openEvalModal,
    closeEvalModal: closeEvalModal,
    openResetModal: openResetModal,
    closeResetModal: closeResetModal,
    openOrientation: openOrientationOverlay,
    closeOrientation: closeOrientationOverlay,
    checkOrientation: checkOrientation
  };

  window.showMebiToast = showMebiToast;

})(window);
