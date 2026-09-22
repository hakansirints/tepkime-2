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
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
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
    danger: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
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
      if (window.MebiAudio) window.MebiAudio.playClick();
    }
  }

  /* ----------------- 5. CİHAZI YATAY ÇEVİRİN (ORIENTATION LOCK) YÖNETİMİ ----------------- */
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
    if (overlay) {
      overlay.classList.remove('is-active');
      overlay.classList.remove('is-forced');
      isOrientationDismissed = true;
      document.body.classList.remove('mebi-landscape-required');
      document.body.style.overflow = '';
      if (window.MebiAudio) window.MebiAudio.playClick();
    }
  }

  function checkOrientation() {
    var overlay = document.getElementById('mebiOrientationOverlay');
    if (!overlay) return;

    var isPortrait = (window.innerHeight > window.innerWidth) || (window.matchMedia && window.matchMedia('(orientation: portrait)').matches);
    var isMobileOrTablet = (window.innerWidth <= 900) || (window.innerHeight <= 600 && window.innerWidth <= 1024);

    if (isPortrait && isMobileOrTablet && !isOrientationDismissed) {
      document.body.classList.add('mebi-landscape-required');
      overlay.classList.add('is-forced');
      document.body.style.overflow = 'hidden';
    } else {
      overlay.classList.remove('is-forced');
      overlay.classList.remove('is-active');
      document.body.style.overflow = '';
      if (!isPortrait) {
        isOrientationDismissed = false;
      }
    }
  }

  /* ----------------- 6. İLK YÜKLEME ----------------- */
  document.addEventListener('DOMContentLoaded', function() {
    applyTheme(getSavedTheme());

    var overlay = document.getElementById('mebiDrawerOverlay');
    var closeBtn = document.getElementById('btnCloseDrawer');
    if (overlay) overlay.addEventListener('click', closeDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

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

    // ESC tuşu ile kapatma
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
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
  });

  // Global erişim
  window.MebiUI = {
    applyTheme: applyTheme,
    getSavedTheme: getSavedTheme,
    toggleTheme: toggleTheme,
    showToast: showMebiToast,
    openDrawer: openDrawer,
    closeDrawer: closeDrawer,
    openParticleModal: openParticleModal,
    closeParticleModal: closeParticleModal,
    openOrientation: openOrientationOverlay,
    closeOrientation: closeOrientationOverlay,
    checkOrientation: checkOrientation
  };

  window.showMebiToast = showMebiToast;

})(window);

