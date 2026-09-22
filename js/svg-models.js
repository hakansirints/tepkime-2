
/**
 * Tepkime Arenası - 3B SVG Modelleri ve Görselleştirici (svg-models.js)
 * Makroskobik deney çizimleri, MEB standartlarına uygun renk kodlu 3B atom modelleri,
 * iyonik yapılar, gerçek deney ortamını yansıtan 3B mikroskobik odacıklar (solvasyon kılıfı,
 * kristal örgü kafesi, çökelme sedimenti ve gaz dağılımı).
 */

(function(window) {
  'use strict';

  /* ----------------- 1. ORTAK 3B SVG GRADYANLARI VE GÖLGELERİ ----------------- */
  function getShared3DDefs() {
    return '<defs>' +
      // O: Oksijen (Kırmızı)
      '<radialGradient id="gO" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="#ff8577"/><stop offset="35%" stop-color="#e11d48"/><stop offset="80%" stop-color="#9f1239"/><stop offset="100%" stop-color="#4c0519"/></radialGradient>' +
      // H: Hidrojen (Beyaz / Gümüş Gri)
      '<radialGradient id="gH" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="#ffffff"/><stop offset="45%" stop-color="#e2e8f0"/><stop offset="80%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#475569"/></radialGradient>' +
      // C: Karbon (Koyu Nötr Gri / Grafit)
      '<radialGradient id="gC" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="#94a3b8"/><stop offset="40%" stop-color="#334155"/><stop offset="80%" stop-color="#1e293b"/><stop offset="100%" stop-color="#0f172a"/></radialGradient>' +
      // N: Azot (Mavi)
      '<radialGradient id="gN" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="#7dd3fc"/><stop offset="35%" stop-color="#0284c7"/><stop offset="80%" stop-color="#0369a1"/><stop offset="100%" stop-color="#082f49"/></radialGradient>' +
      // Cl: Klor (Yeşil)
      '<radialGradient id="gCl" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="#86efac"/><stop offset="30%" stop-color="#22c55e"/><stop offset="75%" stop-color="#15803d"/><stop offset="100%" stop-color="#052e16"/></radialGradient>' +
      // Na: Sodyum (Mor)
      '<radialGradient id="gNa" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="#d8b4fe"/><stop offset="30%" stop-color="#9333ea"/><stop offset="75%" stop-color="#6b21a8"/><stop offset="100%" stop-color="#3b0764"/></radialGradient>' +
      // K: Potasyum (Menekşe)
      '<radialGradient id="gK" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="#e9d5ff"/><stop offset="35%" stop-color="#a855f7"/><stop offset="80%" stop-color="#7e22ce"/><stop offset="100%" stop-color="#3b0764"/></radialGradient>' +
      // Pb: Kurşun (Altın Sarısı / Amber)
      '<radialGradient id="gPb" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="#fef08a"/><stop offset="35%" stop-color="#f59e0b"/><stop offset="80%" stop-color="#b45309"/><stop offset="100%" stop-color="#451a03"/></radialGradient>' +
      // I: İyot (Koyu Menekşe / Eflatun)
      '<radialGradient id="gI" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="#e9d5ff"/><stop offset="35%" stop-color="#7c3aed"/><stop offset="80%" stop-color="#5b21b6"/><stop offset="100%" stop-color="#2e1065"/></radialGradient>' +
      // Ag: Gümüş (Gümüş Metalik Beyaz)
      '<radialGradient id="gAg" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="#ffffff"/><stop offset="40%" stop-color="#cbd5e1"/><stop offset="80%" stop-color="#64748b"/><stop offset="100%" stop-color="#334155"/></radialGradient>' +
      // Cu: Bakır (Açık Mavi / Mavi)
      '<radialGradient id="gCu" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="#93c5fd"/><stop offset="35%" stop-color="#2563eb"/><stop offset="80%" stop-color="#1d4ed8"/><stop offset="100%" stop-color="#172554"/></radialGradient>' +
      // Ca: Kalsiyum (Teal / Turkuaz)
      '<radialGradient id="gCa" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="#99f6e4"/><stop offset="35%" stop-color="#14b8a6"/><stop offset="80%" stop-color="#0f766e"/><stop offset="100%" stop-color="#042f2e"/></radialGradient>' +
      // Şeffaf Çözelti Sıvı Yansıması
      '<linearGradient id="gClearWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(214, 238, 255, 0.65)"/><stop offset="40%" stop-color="rgba(190, 226, 250, 0.50)"/><stop offset="85%" stop-color="rgba(165, 210, 245, 0.72)"/><stop offset="100%" stop-color="rgba(145, 198, 238, 0.88)"/></linearGradient>' +
      // Şeffaf Çözelti Üst Menisküs
      '<linearGradient id="gClearMeniscus" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="rgba(255, 255, 255, 0.92)"/><stop offset="30%" stop-color="rgba(224, 242, 254, 0.6)"/><stop offset="70%" stop-color="rgba(202, 232, 252, 0.5)"/><stop offset="100%" stop-color="rgba(255, 255, 255, 0.88)"/></linearGradient>' +
      // Cu(NO3)2 Mavi Çözelti
      '<linearGradient id="gCuSolution" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="25%" stop-color="#0284c7"/><stop offset="75%" stop-color="#0369a1"/><stop offset="100%" stop-color="#075985"/></linearGradient>' +
      // Cu(NO3)2 Üst Menisküs
      '<linearGradient id="gCuMeniscus" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#7dd3fc"/><stop offset="40%" stop-color="#38bdf8"/><stop offset="70%" stop-color="#0284c7"/><stop offset="100%" stop-color="#38bdf8"/></linearGradient>' +
      // Katı Maddeler İçin 3B Toz Yığını
      '<linearGradient id="gPowderMound" x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0%" stop-color="#ffffff"/><stop offset="40%" stop-color="#f8fafc"/><stop offset="75%" stop-color="#e2e8f0"/><stop offset="100%" stop-color="#cbd5e1"/></linearGradient>' +
      '<linearGradient id="gPowderShade" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="rgba(255, 255, 255, 0.85)"/><stop offset="50%" stop-color="rgba(241, 245, 249, 0.3)"/><stop offset="100%" stop-color="rgba(148, 163, 184, 0.38)"/></linearGradient>' +
      // Cam Dikey Yansıma
      '<linearGradient id="gGlassReflection" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="rgba(255, 255, 255, 0.9)"/><stop offset="60%" stop-color="rgba(255, 255, 255, 0.45)"/><stop offset="100%" stop-color="rgba(255, 255, 255, 0)"/></linearGradient>' +
      // Zemin Temas Gölgesi
      '<radialGradient id="gBeakerGroundShadow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="rgba(15, 23, 42, 0.22)"/><stop offset="60%" stop-color="rgba(15, 23, 42, 0.08)"/><stop offset="100%" stop-color="rgba(15, 23, 42, 0)"/></radialGradient>' +
      // Cu(NO3)2 Zemin Mavi Işıma
      '<radialGradient id="gCuGroundGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="rgba(2, 132, 199, 0.38)"/><stop offset="60%" stop-color="rgba(2, 132, 199, 0.12)"/><stop offset="100%" stop-color="rgba(2, 132, 199, 0)"/></radialGradient>' +
      // 3B Mikroskobik Odacık Gradyanları
      '<linearGradient id="gAqueousChamber" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(240, 249, 255, 0.75)"/><stop offset="30%" stop-color="rgba(224, 242, 254, 0.82)"/><stop offset="75%" stop-color="rgba(186, 230, 253, 0.88)"/><stop offset="100%" stop-color="rgba(125, 211, 252, 0.95)"/></linearGradient>' +
      '<linearGradient id="gCuAqueousChamber" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(56, 189, 248, 0.75)"/><stop offset="35%" stop-color="rgba(2, 132, 199, 0.85)"/><stop offset="80%" stop-color="rgba(3, 105, 161, 0.92)"/><stop offset="100%" stop-color="rgba(7, 89, 133, 0.96)"/></linearGradient>' +
      '<linearGradient id="gSolidChamber" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(248, 250, 252, 0.9)"/><stop offset="50%" stop-color="rgba(241, 245, 249, 0.95)"/><stop offset="100%" stop-color="rgba(226, 232, 240, 0.98)"/></linearGradient>' +
      '<linearGradient id="gGasChamber" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(241, 245, 249, 0.25)"/><stop offset="40%" stop-color="rgba(224, 242, 254, 0.4)"/><stop offset="46%" stop-color="rgba(186, 230, 253, 0.75)"/><stop offset="100%" stop-color="rgba(125, 211, 252, 0.9)"/></linearGradient>' +
      '<linearGradient id="gPrecipitateChamber" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(224, 242, 254, 0.65)"/><stop offset="65%" stop-color="rgba(186, 230, 253, 0.85)"/><stop offset="75%" stop-color="rgba(241, 245, 249, 0.95)"/><stop offset="100%" stop-color="rgba(203, 213, 225, 0.98)"/></linearGradient>' +
      // 3B Düşme Gölgesi
      '<filter id="spDrop" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="1.5" dy="3.5" stdDeviation="2.5" flood-color="rgba(0,0,0,0.38)"/></filter>' +
      '<filter id="spSoft" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="1" dy="2" stdDeviation="1.8" flood-color="rgba(0,0,0,0.25)"/></filter>' +
    '</defs>';
  }

  /* ----------------- 2. 3B MİKROSKOBİK ORTAM YARDIMCILARI ----------------- */

  // 3B Su Molekülü (Solvasyon kılıfı ve hidrojen bağları için MEB açı ve renk standartlarında)
  function render3DWaterMolecule(cx, cy, rotDeg, scale, opacity) {
    scale = scale || 1;
    opacity = opacity !== undefined ? opacity : 0.88;
    var rad = (rotDeg * Math.PI) / 180;
    var oR = 6.8 * scale;
    var hR = 4.2 * scale;
    var dist = 8.5 * scale;
    var hAngle = 52.5 * (Math.PI / 180);

    var h1x = (cx + dist * Math.cos(rad - hAngle)).toFixed(1);
    var h1y = (cy + dist * Math.sin(rad - hAngle)).toFixed(1);
    var h2x = (cx + dist * Math.cos(rad + hAngle)).toFixed(1);
    var h2y = (cy + dist * Math.sin(rad + hAngle)).toFixed(1);
    var cxFixed = cx.toFixed(1);
    var cyFixed = cy.toFixed(1);

    return '<g opacity="' + opacity + '">' +
      '<line x1="' + cxFixed + '" y1="' + cyFixed + '" x2="' + h1x + '" y2="' + h1y + '" stroke="rgba(255,255,255,0.75)" stroke-width="' + (1.2 * scale).toFixed(1) + '"/>' +
      '<line x1="' + cxFixed + '" y1="' + cyFixed + '" x2="' + h2x + '" y2="' + h2y + '" stroke="rgba(255,255,255,0.75)" stroke-width="' + (1.2 * scale).toFixed(1) + '"/>' +
      '<circle cx="' + h1x + '" cy="' + h1y + '" r="' + hR.toFixed(1) + '" fill="url(#gH)"/>' +
      '<circle cx="' + h2x + '" cy="' + h2y + '" r="' + hR.toFixed(1) + '" fill="url(#gH)"/>' +
      '<circle cx="' + cxFixed + '" cy="' + cyFixed + '" r="' + oR.toFixed(1) + '" fill="url(#gO)"/>' +
    '</g>';
  }

  // 3B Mikroskobik Gözlem Hücresi Zemin/Ortam Şablonu
  function getChamberBackdrop(type, title, subtitle) {
    if (type === 'solid') {
      return '<rect x="4" y="5" width="162" height="105" rx="12" fill="url(#gSolidChamber)" stroke="rgba(148, 163, 184, 0.45)" stroke-width="1.2"/>' +
        '<ellipse cx="85" cy="100" rx="68" ry="7.5" fill="rgba(15, 23, 42, 0.16)"/>' +
        '<text x="12" y="18" font-family="inherit" font-size="7.5" font-weight="800" fill="#475569" opacity="0.85">' + (title || 'Katı Kristal Kafesi (Susuz)') + '</text>';
    }
    if (type === 'cu-aqueous') {
      return '<rect x="4" y="5" width="162" height="105" rx="12" fill="url(#gCuAqueousChamber)" stroke="rgba(3, 105, 161, 0.6)" stroke-width="1.2"/>' +
        '<path d="M 10 18 Q 85 24 160 18" stroke="rgba(125, 211, 252, 0.9)" stroke-width="1.4" fill="none" opacity="0.9"/>' +
        '<path d="M 12 20 L 12 98" stroke="rgba(255, 255, 255, 0.35)" stroke-width="1.2" stroke-linecap="round"/>' +
        '<text x="12" y="17" font-family="inherit" font-size="7.5" font-weight="800" fill="#ffffff" opacity="0.95">' + (title || 'Bakır(II) Çözeltisi (H₂O)') + '</text>';
    }
    if (type === 'gas') {
      return '<rect x="4" y="5" width="162" height="105" rx="12" fill="url(#gGasChamber)" stroke="rgba(56, 189, 248, 0.45)" stroke-width="1.2"/>' +
        '<path d="M 8 52 Q 85 57 162 52" stroke="rgba(255, 255, 255, 0.95)" stroke-width="1.8" fill="none"/>' +
        '<text x="12" y="18" font-family="inherit" font-size="7.5" font-weight="800" fill="#0284c7" opacity="0.85">' + (title || 'Gaz Fazı (Atmosfere Çıkış)') + '</text>' +
        '<text x="12" y="64" font-family="inherit" font-size="7.5" font-weight="800" fill="#0369a1" opacity="0.85">' + (subtitle || 'Sulu Çözelti Katmanı') + '</text>';
    }
    if (type === 'precipitate') {
      return '<rect x="4" y="5" width="162" height="105" rx="12" fill="url(#gPrecipitateChamber)" stroke="rgba(56, 189, 248, 0.45)" stroke-width="1.2"/>' +
        '<path d="M 10 18 Q 85 24 160 18" stroke="rgba(255, 255, 255, 0.9)" stroke-width="1.2" fill="none"/>' +
        '<path d="M 6 80 Q 85 76 164 80 L 164 100 A 10 10 0 0 1 154 108 L 16 108 A 10 10 0 0 1 6 100 Z" fill="rgba(241, 245, 249, 0.92)"/>' +
        '<text x="12" y="17" font-family="inherit" font-size="7.5" font-weight="800" fill="#0284c7" opacity="0.85">' + (title || 'Çözelti (Seyirci İyonlar)') + '</text>' +
        '<text x="12" y="77" font-family="inherit" font-size="7.5" font-weight="800" fill="#334155" opacity="0.9">' + (subtitle || 'Dip Çökelti Katmanı') + '</text>';
    }
    // aqueous default
    return '<rect x="4" y="5" width="162" height="105" rx="12" fill="url(#gAqueousChamber)" stroke="rgba(56, 189, 248, 0.45)" stroke-width="1.2"/>' +
      '<path d="M 10 18 Q 85 24 160 18" stroke="rgba(255, 255, 255, 0.9)" stroke-width="1.4" fill="none" opacity="0.9"/>' +
      '<path d="M 12 20 L 12 98" stroke="rgba(255, 255, 255, 0.45)" stroke-width="1.2" stroke-linecap="round"/>' +
      '<text x="12" y="17" font-family="inherit" font-size="7.5" font-weight="800" fill="#0369a1" opacity="0.85">' + (title || 'Sulu Çözelti Ortamı (H₂O)') + '</text>';
  }

  /* ----------------- 3. MAKROSKOBİK GÖSTERİMLER (GERÇEKÇİ ÇÖZELTİ GÖRÜNÜMÜ) ----------------- */

  // İki Reaktif Beheri Yan Yana (Madde Havuzu Kart Tasarımıyla Birebir Aynı)
  function renderTwoBeakersMacroscopic(r1, r2) {
    return '<div class="camera-macro-beakers-wrap">' +
      '<div class="beaker-card macro-static-card">' +
        '<div class="card-beaker-box">' + renderBeakerSVG(r1, false) + '</div>' +
        '<div class="card-formula">' + (r1 ? r1.f : '') + '</div>' +
        '<div class="card-name">' + (r1 ? r1.name : '') + '</div>' +
        '<div class="card-state">' + (r1 ? r1.state : '') + '</div>' +
      '</div>' +
      '<div class="macro-beakers-plus">+</div>' +
      '<div class="beaker-card macro-static-card">' +
        '<div class="card-beaker-box">' + renderBeakerSVG(r2, false) + '</div>' +
        '<div class="card-formula">' + (r2 ? r2.f : '') + '</div>' +
        '<div class="card-name">' + (r2 ? r2.name : '') + '</div>' +
        '<div class="card-state">' + (r2 ? r2.state : '') + '</div>' +
      '</div>' +
    '</div>';
  }

  // Ürün Beheri SVG (Madde Havuzu ile Birebir Aynı Gerçekçi Beher Standartlarında)
  function renderProductBeakerSVG(rx, r1, r2) {
    if (!rx) return renderBeakerSVG(null, true);

    var hasGas = (rx.obs && rx.obs.indexOf('gas') > -1);
    var hasPpt = (rx.obs && rx.obs.indexOf('precipitate') > -1);
    var isCuOriginal = (r1 && r1.id === 'Cu(NO3)2') || (r2 && r2.id === 'Cu(NO3)2');
    var isBothSolid = (r1 && r1.solid && r2 && r2.solid);

    var fluidFill = 'url(#gClearWater)';
    var meniscusFill = 'url(#gClearMeniscus)';
    var isColored = false;

    if (rx.toColor) {
      fluidFill = rx.toColor;
      meniscusFill = rx.toColor;
      isColored = true;
    } else if (isCuOriginal && rx.typeCategory === 'none') {
      fluidFill = 'url(#gCuSolution)';
      meniscusFill = 'url(#gCuMeniscus)';
      isColored = true;
    }

    var pptColor = rx.precipColor || '#ffffff';
    var groundShadow = isColored ? 'url(#gCuGroundGlow)' : 'url(#gBeakerGroundShadow)';

    var content = '';

    if (isBothSolid && rx.typeCategory === 'none') {
      content = '<g class="beaker-powder">' +
        '<path d="M 18.5 86 Q 32 80 41 64 Q 47 52 50 49 Q 53 52 59 64 Q 68 80 81.5 86 Q 50 90 18.5 86 Z" fill="url(#gPowderMound)" stroke="#94a3b8" stroke-width="0.8" stroke-linejoin="round"/>' +
        '<path d="M 21 85 Q 33 78 43 63 Q 48 53 50 51 Q 52 53 58 63 Q 68 78 79 85 Q 50 89 21 85 Z" fill="url(#gPowderShade)"/>' +
        '<ellipse cx="48" cy="58" rx="8" ry="3" fill="#ffffff" opacity="0.95"/>' +
        '<ellipse cx="38" cy="70" rx="11" ry="3.8" fill="#ffffff" opacity="0.85"/>' +
        '<ellipse cx="60" cy="72" rx="12" ry="4" fill="#f1f5f9" opacity="0.7"/>' +
      '</g>';
    } else {
      content = '<g class="beaker-fluid">' +
        '<path d="M 18.5 35 L 81.5 35 L 81 85 A 9 9 0 0 1 72 94 L 28 94 A 9 9 0 0 1 19 85 Z" fill="' + fluidFill + '" opacity="' + (isColored ? '0.94' : '0.86') + '"/>' +
        '<ellipse cx="50" cy="35" rx="31.5" ry="3.8" fill="' + meniscusFill + '" opacity="0.96"/>' +
        '<path d="M 19 35 Q 50 39 81 35" stroke="rgba(255,255,255,0.92)" stroke-width="1.2" fill="none"/>' +
        '<path d="M 27 37 L 29 88 Q 50 92 71 88 L 73 37" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1"/>' +
      '</g>';

      if (hasPpt) {
        content += '<g class="beaker-product-ppt">' +
          '<path d="M 19 76 Q 50 72 81 76 L 81 85 A 9 9 0 0 1 72 94 L 28 94 A 9 9 0 0 1 19 85 Z" fill="' + pptColor + '" opacity="0.96"/>' +
          '<ellipse cx="50" cy="76" rx="30" ry="3.4" fill="' + pptColor + '" opacity="0.92"/>' +
          '<ellipse cx="44" cy="75" rx="10" ry="2.2" fill="#ffffff" opacity="0.45"/>' +
          '<circle cx="32" cy="78" r="1.8" fill="#ffffff" opacity="0.6"/>' +
          '<circle cx="64" cy="79" r="2.2" fill="#ffffff" opacity="0.5"/>' +
        '</g>';
      }

      if (hasGas) {
        content += '<g class="beaker-product-gas" opacity="0.85">' +
          '<circle cx="36" cy="58" r="2.6" fill="#ffffff"/>' +
          '<circle cx="56" cy="48" r="3.2" fill="#ffffff"/>' +
          '<circle cx="46" cy="66" r="2" fill="#ffffff"/>' +
          '<circle cx="64" cy="62" r="2.5" fill="#ffffff"/>' +
          '<circle cx="32" cy="72" r="1.8" fill="#ffffff"/>' +
          '<circle cx="52" cy="78" r="2.2" fill="#ffffff"/>' +
        '</g>';
      }
    }

    var scaleStroke = isColored ? 'rgba(255,255,255,0.85)' : 'var(--mebi-glass-grad, #64748b)';
    var scaleFill = isColored ? '#ffffff' : 'var(--mebi-glass-grad, #64748b)';

    return '<svg viewBox="0 0 100 118" width="100%" height="100%" style="overflow:visible;" role="img" aria-label="' + (rx ? rx.title : 'Ürün Beheri') + '">' +
      getShared3DDefs() +
      '<ellipse cx="50" cy="103" rx="38" ry="7.5" fill="' + groundShadow + '"/>' +
      '<path d="M 14 15 Q 16 17 18 17.5 L 18 86 A 10 10 0 0 0 28 96 L 72 96 A 10 10 0 0 0 82 86 L 82 17.5 Q 84 17 86 15 Z" fill="rgba(248, 250, 252, 0.45)"/>' +
      content +
      '<path d="M 22 93 Q 50 95.5 78 93 L 76 96 Q 50 98.5 24 96 Z" fill="rgba(255,255,255,0.65)"/>' +
      '<g font-family="Plus Jakarta Sans, sans-serif" font-size="5.8" font-weight="700" fill="' + scaleFill + '" text-anchor="start" opacity="0.88">' +
        '<line x1="58" y1="28" x2="65" y2="28" stroke="' + scaleStroke + '" stroke-width="0.9" stroke-linecap="round"/><text x="67" y="30">100</text>' +
        '<line x1="61" y1="35" x2="65" y2="35" stroke="' + scaleStroke + '" stroke-width="0.6" stroke-linecap="round"/>' +
        '<line x1="58" y1="42" x2="65" y2="42" stroke="' + scaleStroke + '" stroke-width="0.9" stroke-linecap="round"/><text x="67" y="44">80</text>' +
        '<line x1="61" y1="49" x2="65" y2="49" stroke="' + scaleStroke + '" stroke-width="0.6" stroke-linecap="round"/>' +
        '<line x1="58" y1="56" x2="65" y2="56" stroke="' + scaleStroke + '" stroke-width="0.9" stroke-linecap="round"/><text x="67" y="58">60</text>' +
        '<line x1="61" y1="63" x2="65" y2="63" stroke="' + scaleStroke + '" stroke-width="0.6" stroke-linecap="round"/>' +
        '<line x1="58" y1="70" x2="65" y2="70" stroke="' + scaleStroke + '" stroke-width="0.9" stroke-linecap="round"/><text x="67" y="72">40</text>' +
        '<line x1="61" y1="77" x2="65" y2="77" stroke="' + scaleStroke + '" stroke-width="0.6" stroke-linecap="round"/>' +
        '<line x1="58" y1="84" x2="65" y2="84" stroke="' + scaleStroke + '" stroke-width="0.9" stroke-linecap="round"/><text x="67" y="86">20</text>' +
      '</g>' +
      '<path d="M 22 20 L 22 86" stroke="url(#gGlassReflection)" stroke-width="2.2" stroke-linecap="round" opacity="0.92"/>' +
      '<path d="M 25 24 L 25 82" stroke="rgba(255,255,255,0.42)" stroke-width="0.9" stroke-linecap="round"/>' +
      '<path d="M 78 20 L 78 86" stroke="rgba(255,255,255,0.45)" stroke-width="1.1" stroke-linecap="round"/>' +
      '<path d="M 14 14 Q 15 16 18 16.5 L 18 86 A 10 10 0 0 0 28 96 L 72 96 A 10 10 0 0 0 82 86 L 82 16.5 Q 85 16 86 14" fill="none" stroke="var(--mebi-glass-stroke, #475569)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<ellipse cx="50" cy="15" rx="33" ry="3.6" fill="none" stroke="var(--mebi-glass-stroke-rim, #334155)" stroke-width="1.8"/>' +
      '<path d="M 18 15 Q 50 18.5 82 15" stroke="rgba(255,255,255,0.95)" stroke-width="1.3" fill="none"/>' +
      '<path d="M 14 14 Q 17 16.5 20 16.5" stroke="rgba(255,255,255,0.92)" stroke-width="1.3" fill="none"/>' +
    '</svg>';
  }

  // Karışmış Tek Reaksiyon Beheri
  function renderSingleBeakerMacroscopic(rx, r1, r2) {
    var isPhysicalMix = (rx && rx.typeCategory === 'none');
    return '<div class="camera-macro-beakers-wrap">' +
      '<div class="beaker-card macro-static-card">' +
        '<div class="card-beaker-box">' + renderProductBeakerSVG(rx, r1, r2) + '</div>' +
        '<div class="card-formula">' + (rx ? (rx.mainProductSymbol || 'Ürünler') : '') + '</div>' +
        '<div class="card-name">' + (rx ? rx.title : '') + '</div>' +
        '<div class="card-state">' + (isPhysicalMix ? '(Fiziksel Karışım)' : '(Kimyasal Ürün)') + '</div>' +
      '</div>' +
    '</div>';
  }

  /* ----------------- 4. BİLİMSEL 3B TANECİK VE İYON MODELLERİ (TEPKENLER) -----------------
     Gerçek laboratuvar ortamı standardı:
     - Sulu çözeltilerde iyonlar serbest solvatize haldedir ve su (H₂O) molekülleriyle çevrilidir.
     - Katı tozlarda iyonlar 3B kristal örgü kafesinde sıkıca paketlenmiştir.
  ----------------------------------------------------------------------------------------- */

  // 1. HCl: Sulu çözeltide ayrışmış H⁺ ve Cl⁻ iyonları (Solvasyon Kılıfı ile)
  function renderParticleHCl() {
    return '<div style="display:flex;align-items:center;justify-content:center;gap:12px;width:100%;">' +
      '<svg viewBox="0 0 170 115" width="165" height="110" class="micro-chamber-svg">' +
        getShared3DDefs() +
        getChamberBackdrop('aqueous', 'HCl Sulu Çözeltisi') +
        // Solvasyon Su Molekülleri (Cl- çevresinde pozitif H uçları içe dönük)
        render3DWaterMolecule(22, 42, 35, 0.9) +
        render3DWaterMolecule(24, 84, -35, 0.9) +
        render3DWaterMolecule(52, 98, -90, 0.9) +
        render3DWaterMolecule(80, 42, 150, 0.9) +
        // H+ çevresinde negatif O ucu içe dönük
        render3DWaterMolecule(148, 44, 15, 0.9) +
        render3DWaterMolecule(122, 88, 90, 0.9) +
        render3DWaterMolecule(90, 78, -45, 0.9) +
        // İyonlar
        '<g filter="url(#spDrop)">' +
          '<circle cx="52" cy="62" r="20" fill="url(#gCl)"/>' +
          '<text x="52" y="68" fill="#ffffff" font-family="inherit" font-size="12" font-weight="800" text-anchor="middle">Cl⁻</text>' +
          '<circle cx="120" cy="56" r="12" fill="url(#gH)"/>' +
          '<text x="120" y="60" fill="#1e293b" font-family="inherit" font-size="9.5" font-weight="800" text-anchor="middle">H⁺</text>' +
        '</g>' +
      '</svg>' +
      '<div class="particle-legend-col">' +
        '<div class="legend-item"><div class="legend-dot" style="background:#15803d;"></div><span>Cl⁻ (Anyon)</span></div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:#94a3b8;"></div><span>H⁺ (Katyon)</span></div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:#e11d48;"></div><span>H₂O (Çözücü)</span></div>' +
      '</div>' +
    '</div>';
  }

  // 2. NaOH: Sulu çözeltide ayrışmış Na⁺ ve OH⁻ iyonları (Solvasyon Kılıfı ile)
  function renderParticleNaOH() {
    return '<div style="display:flex;align-items:center;justify-content:center;gap:12px;width:100%;">' +
      '<svg viewBox="0 0 170 115" width="165" height="110" class="micro-chamber-svg">' +
        getShared3DDefs() +
        getChamberBackdrop('aqueous', 'NaOH Sulu Çözeltisi') +
        // Na+ çevresinde su molekülleri
        render3DWaterMolecule(24, 46, 180, 0.9) +
        render3DWaterMolecule(26, 82, 140, 0.9) +
        render3DWaterMolecule(52, 92, 90, 0.9) +
        // OH- çevresinde su molekülleri
        render3DWaterMolecule(86, 38, 35, 0.9) +
        render3DWaterMolecule(148, 44, 150, 0.9) +
        render3DWaterMolecule(116, 92, -90, 0.9) +
        // İyonlar
        '<g filter="url(#spDrop)">' +
          '<circle cx="50" cy="62" r="16" fill="url(#gNa)"/>' +
          '<text x="50" y="67" fill="#ffffff" font-family="inherit" font-size="10.5" font-weight="800" text-anchor="middle">Na⁺</text>' +
          // OH- iyonu
          '<circle cx="110" cy="60" r="15" fill="url(#gO)"/>' +
          '<circle cx="126" cy="60" r="9.5" fill="url(#gH)"/>' +
          '<text x="117" y="64" fill="#ffffff" font-family="inherit" font-size="10" font-weight="800" text-anchor="middle">OH⁻</text>' +
        '</g>' +
      '</svg>' +
      '<div class="particle-legend-col">' +
        '<div class="legend-item"><div class="legend-dot" style="background:#9333ea;"></div><span>Na⁺ (Katyon)</span></div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:#e11d48;"></div><span>OH⁻ (Anyon)</span></div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:#0284c7;"></div><span>H₂O (Çözücü)</span></div>' +
      '</div>' +
    '</div>';
  }

  // 3. H2O2: Sulu ortamda hidrojen peroksit molekülü ve çözücü su molekülleri
  function renderParticleH2O2() {
    return '<div style="display:flex;align-items:center;justify-content:center;gap:12px;width:100%;">' +
      '<svg viewBox="0 0 170 115" width="165" height="110" class="micro-chamber-svg">' +
        getShared3DDefs() +
        getChamberBackdrop('aqueous', 'H₂O₂ Sulu Çözeltisi') +
        // Çözücü Su Molekülleri
        render3DWaterMolecule(26, 44, 45, 0.9) +
        render3DWaterMolecule(145, 46, 120, 0.9) +
        render3DWaterMolecule(60, 94, -60, 0.9) +
        render3DWaterMolecule(130, 90, -135, 0.9) +
        // H-Bağları
        '<g stroke="rgba(255,255,255,0.7)" stroke-width="1.2" stroke-dasharray="2.5,2">' +
          '<line x1="38" y1="46" x2="54" y2="46"/>' +
          '<line x1="116" y1="68" x2="132" y2="78"/>' +
        '</g>' +
        // H2O2 Molekülü
        '<g filter="url(#spDrop)">' +
          '<line x1="72" y1="56" x2="98" y2="56" stroke="rgba(255,255,255,0.85)" stroke-width="2.5"/>' +
          '<line x1="72" y1="56" x2="54" y2="44" stroke="rgba(255,255,255,0.85)" stroke-width="2.2"/>' +
          '<line x1="98" y1="56" x2="116" y2="68" stroke="rgba(255,255,255,0.85)" stroke-width="2.2"/>' +
          '<circle cx="72" cy="56" r="14" fill="url(#gO)"/><text x="72" y="60" fill="#fff" font-size="9" font-weight="800" text-anchor="middle">O</text>' +
          '<circle cx="98" cy="56" r="14" fill="url(#gO)"/><text x="98" y="60" fill="#fff" font-size="9" font-weight="800" text-anchor="middle">O</text>' +
          '<circle cx="54" cy="44" r="9" fill="url(#gH)"/><text x="54" y="47.5" fill="#1e293b" font-size="8" font-weight="800" text-anchor="middle">H</text>' +
          '<circle cx="116" cy="68" r="9" fill="url(#gH)"/><text x="116" y="71.5" fill="#1e293b" font-size="8" font-weight="800" text-anchor="middle">H</text>' +
        '</g>' +
        '<text x="85" y="86" fill="#0369a1" font-size="8" font-weight="800" text-anchor="middle">H₂O₂ Kovalent Molekülü</text>' +
      '</svg>' +
      '<div class="particle-legend-col">' +
        '<div class="legend-item"><div class="legend-dot" style="background:#e11d48;"></div><span>O (Oksijen)</span></div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:#94a3b8;"></div><span>H (Hidrojen)</span></div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:#0284c7;"></div><span>H₂O (Çözücü)</span></div>' +
      '</div>' +
    '</div>';
  }

  // 4. NH3: Çözeltide amonyak molekülü ve çözücü su molekülleri
  function renderParticleNH3() {
    return '<div style="display:flex;align-items:center;justify-content:center;gap:12px;width:100%;">' +
      '<svg viewBox="0 0 170 115" width="165" height="110" class="micro-chamber-svg">' +
        getShared3DDefs() +
        getChamberBackdrop('aqueous', 'NH₃ Sulu Çözeltisi') +
        // Çözücü Su Molekülleri
        render3DWaterMolecule(26, 46, 35, 0.9) +
        render3DWaterMolecule(145, 48, 140, 0.9) +
        render3DWaterMolecule(85, 96, -90, 0.9) +
        // H-Bağları
        '<g stroke="rgba(255,255,255,0.7)" stroke-width="1.2" stroke-dasharray="2.5,2">' +
          '<line x1="38" y1="46" x2="65" y2="70"/>' +
          '<line x1="135" y1="52" x2="105" y2="70"/>' +
        '</g>' +
        // NH3 Molekülü (Trigonal Piramit)
        '<g filter="url(#spDrop)">' +
          '<line x1="85" y1="48" x2="65" y2="70" stroke="rgba(255,255,255,0.85)" stroke-width="2.2"/>' +
          '<line x1="85" y1="48" x2="85" y2="76" stroke="rgba(255,255,255,0.85)" stroke-width="2.2"/>' +
          '<line x1="85" y1="48" x2="105" y2="70" stroke="rgba(255,255,255,0.85)" stroke-width="2.2"/>' +
          '<circle cx="85" cy="48" r="17" fill="url(#gN)"/><text x="85" y="52.5" fill="#fff" font-size="11" font-weight="800" text-anchor="middle">N</text>' +
          '<circle cx="65" cy="70" r="9" fill="url(#gH)"/><text x="65" y="73.5" fill="#1e293b" font-size="7.5" font-weight="800" text-anchor="middle">H</text>' +
          '<circle cx="85" cy="76" r="9" fill="url(#gH)"/><text x="85" y="79.5" fill="#1e293b" font-size="7.5" font-weight="800" text-anchor="middle">H</text>' +
          '<circle cx="105" cy="70" r="9" fill="url(#gH)"/><text x="105" y="73.5" fill="#1e293b" font-size="7.5" font-weight="800" text-anchor="middle">H</text>' +
        '</g>' +
        '<text x="85" y="94" fill="#0369a1" font-size="8" font-weight="800" text-anchor="middle">NH₃ Molekülü</text>' +
      '</svg>' +
      '<div class="particle-legend-col">' +
        '<div class="legend-item"><div class="legend-dot" style="background:#0284c7;"></div><span>N (Azot)</span></div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:#94a3b8;"></div><span>H (Hidrojen)</span></div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:#e11d48;"></div><span>H₂O (Çözücü)</span></div>' +
      '</div>' +
    '</div>';
  }

  // 5. KI: Sulu ortamda serbest K⁺ ve I⁻ iyonları (Solvasyon Kılıfı ile)
  function renderParticleKI() {
    return '<div style="display:flex;align-items:center;justify-content:center;gap:12px;width:100%;">' +
      '<svg viewBox="0 0 170 115" width="165" height="110" class="micro-chamber-svg">' +
        getShared3DDefs() +
        getChamberBackdrop('aqueous', 'KI Sulu Çözeltisi') +
        // I- çevresinde su molekülleri (H uçları içe dönük)
        render3DWaterMolecule(20, 42, 35, 0.9) +
        render3DWaterMolecule(22, 84, -35, 0.9) +
        render3DWaterMolecule(52, 98, -90, 0.9) +
        // K+ çevresinde su molekülleri (O ucu içe dönük)
        render3DWaterMolecule(148, 44, 15, 0.9) +
        render3DWaterMolecule(122, 88, 90, 0.9) +
        render3DWaterMolecule(86, 40, 160, 0.9) +
        // İyonlar
        '<g filter="url(#spDrop)">' +
          '<circle cx="52" cy="62" r="21" fill="url(#gI)"/>' +
          '<text x="52" y="68" fill="#ffffff" font-family="inherit" font-size="12" font-weight="800" text-anchor="middle">I⁻</text>' +
          '<circle cx="120" cy="58" r="16" fill="url(#gK)"/>' +
          '<text x="120" y="63" fill="#ffffff" font-family="inherit" font-size="10.5" font-weight="800" text-anchor="middle">K⁺</text>' +
        '</g>' +
      '</svg>' +
      '<div class="particle-legend-col">' +
        '<div class="legend-item"><div class="legend-dot" style="background:#5b21b6;"></div><span>I⁻ (İyodür Anyonu)</span></div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:#a855f7;"></div><span>K⁺ (Potasyum)</span></div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:#e11d48;"></div><span>H₂O (Çözücü)</span></div>' +
      '</div>' +
    '</div>';
  }

  // 6. Pb(NO3)2: Sulu ortamda serbest Pb²⁺ ve 2 NO₃⁻ iyonları
  function renderParticlePbNO32() {
    return '<div style="display:flex;align-items:center;justify-content:center;gap:12px;width:100%;">' +
      '<svg viewBox="0 0 170 115" width="165" height="110" class="micro-chamber-svg">' +
        getShared3DDefs() +
        getChamberBackdrop('aqueous', 'Pb(NO₃)₂ Sulu Çözeltisi') +
        // Solvasyon suları
        render3DWaterMolecule(20, 44, 180, 0.9) +
        render3DWaterMolecule(22, 82, 140, 0.9) +
        render3DWaterMolecule(50, 96, 90, 0.9) +
        render3DWaterMolecule(86, 62, 0, 0.9) +
        // İyonlar
        '<g filter="url(#spDrop)">' +
          // Pb2+
          '<circle cx="50" cy="62" r="19" fill="url(#gPb)"/>' +
          '<text x="50" y="67" fill="#ffffff" font-family="inherit" font-size="11" font-weight="800" text-anchor="middle">Pb²⁺</text>' +
          // NO3- 1
          '<g transform="translate(116, 40)">' +
            '<circle cx="0" cy="0" r="9" fill="url(#gN)"/>' +
            '<circle cx="0" cy="-8" r="6" fill="url(#gO)"/><circle cx="-7" cy="5" r="6" fill="url(#gO)"/><circle cx="7" cy="5" r="6" fill="url(#gO)"/>' +
            '<text x="18" y="3" fill="#0369a1" font-size="8.5" font-weight="800">NO₃⁻</text>' +
          '</g>' +
          // NO3- 2
          '<g transform="translate(116, 80)">' +
            '<circle cx="0" cy="0" r="9" fill="url(#gN)"/>' +
            '<circle cx="0" cy="-8" r="6" fill="url(#gO)"/><circle cx="-7" cy="5" r="6" fill="url(#gO)"/><circle cx="7" cy="5" r="6" fill="url(#gO)"/>' +
            '<text x="18" y="3" fill="#0369a1" font-size="8.5" font-weight="800">NO₃⁻</text>' +
          '</g>' +
        '</g>' +
      '</svg>' +
      '<div class="particle-legend-col">' +
        '<div class="legend-item"><div class="legend-dot" style="background:#f59e0b;"></div><span>Pb²⁺ (Kurşun)</span></div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:#0284c7;"></div><span>NO₃⁻ (Nitrat)</span></div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:#e11d48;"></div><span>H₂O (Çözücü)</span></div>' +
      '</div>' +
    '</div>';
  }

  // 7. CaCl2: Sulu ortamda serbest Ca²⁺ ve 2 Cl⁻ iyonları
  function renderParticleCaCl2() {
    return '<div style="display:flex;align-items:center;justify-content:center;gap:12px;width:100%;">' +
      '<svg viewBox="0 0 170 115" width="165" height="110" class="micro-chamber-svg">' +
        getShared3DDefs() +
        getChamberBackdrop('aqueous', 'CaCl₂ Sulu Çözeltisi') +
        // Solvasyon suları
        render3DWaterMolecule(20, 44, 180, 0.9) +
        render3DWaterMolecule(22, 82, 140, 0.9) +
        render3DWaterMolecule(50, 96, 90, 0.9) +
        render3DWaterMolecule(86, 62, 0, 0.9) +
        // İyonlar
        '<g filter="url(#spDrop)">' +
          '<circle cx="50" cy="62" r="18" fill="url(#gCa)"/>' +
          '<text x="50" y="67" fill="#ffffff" font-family="inherit" font-size="11" font-weight="800" text-anchor="middle">Ca²⁺</text>' +
          '<circle cx="120" cy="40" r="15" fill="url(#gCl)"/>' +
          '<text x="120" y="45" fill="#ffffff" font-family="inherit" font-size="9.5" font-weight="800" text-anchor="middle">Cl⁻</text>' +
          '<circle cx="120" cy="80" r="15" fill="url(#gCl)"/>' +
          '<text x="120" y="85" fill="#ffffff" font-family="inherit" font-size="9.5" font-weight="800" text-anchor="middle">Cl⁻</text>' +
        '</g>' +
      '</svg>' +
      '<div class="particle-legend-col">' +
        '<div class="legend-item"><div class="legend-dot" style="background:#14b8a6;"></div><span>Ca²⁺ (Kalsiyum)</span></div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:#15803d;"></div><span>Cl⁻ (Klorür)</span></div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:#e11d48;"></div><span>H₂O (Çözücü)</span></div>' +
      '</div>' +
    '</div>';
  }

  // 8. AgNO3: Sulu ortamda serbest Ag⁺ ve NO₃⁻ iyonları
  function renderParticleAgNO3() {
    return '<div style="display:flex;align-items:center;justify-content:center;gap:12px;width:100%;">' +
      '<svg viewBox="0 0 170 115" width="165" height="110" class="micro-chamber-svg">' +
        getShared3DDefs() +
        getChamberBackdrop('aqueous', 'AgNO₃ Sulu Çözeltisi') +
        // Solvasyon suları
        render3DWaterMolecule(20, 44, 180, 0.9) +
        render3DWaterMolecule(22, 82, 140, 0.9) +
        render3DWaterMolecule(52, 96, 90, 0.9) +
        render3DWaterMolecule(86, 40, 0, 0.9) +
        render3DWaterMolecule(148, 80, -90, 0.9) +
        // İyonlar
        '<g filter="url(#spDrop)">' +
          '<circle cx="52" cy="62" r="17" fill="url(#gAg)"/>' +
          '<text x="52" y="67" fill="#0f172a" font-family="inherit" font-size="10.5" font-weight="800" text-anchor="middle">Ag⁺</text>' +
          '<g transform="translate(120, 60)">' +
            '<circle cx="0" cy="0" r="10" fill="url(#gN)"/>' +
            '<circle cx="0" cy="-9" r="6.5" fill="url(#gO)"/><circle cx="-8" cy="5.5" r="6.5" fill="url(#gO)"/><circle cx="8" cy="5.5" r="6.5" fill="url(#gO)"/>' +
            '<text x="20" y="3.5" fill="#0369a1" font-size="9" font-weight="800">NO₃⁻</text>' +
          '</g>' +
        '</g>' +
      '</svg>' +
      '<div class="particle-legend-col">' +
        '<div class="legend-item"><div class="legend-dot" style="background:#cbd5e1;"></div><span>Ag⁺ (Gümüş)</span></div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:#0284c7;"></div><span>NO₃⁻ (Nitrat)</span></div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:#e11d48;"></div><span>H₂O (Çözücü)</span></div>' +
      '</div>' +
    '</div>';
  }

  // 9. Cu(NO3)2: Mavi çözelti odacığında Cu²⁺ ve NO₃⁻ iyonları (Koordinasyon Suları ile)
  function renderParticleCuNO32() {
    return '<div style="display:flex;align-items:center;justify-content:center;gap:12px;width:100%;">' +
      '<svg viewBox="0 0 170 115" width="165" height="110" class="micro-chamber-svg">' +
        getShared3DDefs() +
        getChamberBackdrop('cu-aqueous', 'Cu(NO₃)₂ Çözeltisi') +
        // Cu2+ Koordinasyon Suları [Cu(H2O)4]2+
        render3DWaterMolecule(52, 34, 90, 0.92) +
        render3DWaterMolecule(52, 90, -90, 0.92) +
        render3DWaterMolecule(24, 62, 0, 0.92) +
        render3DWaterMolecule(80, 62, 180, 0.92) +
        // İyonlar
        '<g filter="url(#spDrop)">' +
          '<circle cx="52" cy="62" r="18" fill="url(#gCu)"/>' +
          '<text x="52" y="67" fill="#ffffff" font-family="inherit" font-size="11" font-weight="800" text-anchor="middle">Cu²⁺</text>' +
          '<g transform="translate(122, 40)">' +
            '<circle cx="0" cy="0" r="9" fill="url(#gN)"/>' +
            '<circle cx="0" cy="-8" r="6" fill="url(#gO)"/><circle cx="-7" cy="5" r="6" fill="url(#gO)"/><circle cx="7" cy="5" r="6" fill="url(#gO)"/>' +
            '<text x="18" y="3" fill="#ffffff" font-size="8.5" font-weight="800">NO₃⁻</text>' +
          '</g>' +
          '<g transform="translate(122, 82)">' +
            '<circle cx="0" cy="0" r="9" fill="url(#gN)"/>' +
            '<circle cx="0" cy="-8" r="6" fill="url(#gO)"/><circle cx="-7" cy="5" r="6" fill="url(#gO)"/><circle cx="7" cy="5" r="6" fill="url(#gO)"/>' +
            '<text x="18" y="3" fill="#ffffff" font-size="8.5" font-weight="800">NO₃⁻</text>' +
          '</g>' +
        '</g>' +
      '</svg>' +
      '<div class="particle-legend-col">' +
        '<div class="legend-item"><div class="legend-dot" style="background:#2563eb;"></div><span>Cu²⁺ (Bakır İyonu)</span></div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:#7dd3fc;"></div><span>NO₃⁻ (Nitrat)</span></div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:#e11d48;"></div><span>H₂O (Koordinasyon)</span></div>' +
      '</div>' +
    '</div>';
  }

  // 10. CaCO3: Katı Kireçtaşı 3B İzometrik Kristal Örgü Kafesi (Susuz Zemin)
  function renderParticleCaCO3() {
    return '<div style="display:flex;align-items:center;justify-content:center;gap:12px;width:100%;">' +
      '<svg viewBox="0 0 170 115" width="165" height="110" class="micro-chamber-svg">' +
        getShared3DDefs() +
        getChamberBackdrop('solid', 'CaCO₃ Katı Kristal Kafesi') +
        // Arka Kristal Bağları
        '<g stroke="#94a3b8" stroke-width="1.4" stroke-linecap="round">' +
          '<line x1="76" y1="28" x2="126" y2="28"/><line x1="126" y1="28" x2="126" y2="68"/><line x1="126" y1="68" x2="76" y2="68"/><line x1="76" y1="68" x2="76" y2="28"/>' +
          '<line x1="44" y1="46" x2="76" y2="28"/><line x1="94" y1="46" x2="126" y2="28"/><line x1="44" y1="86" x2="76" y2="68"/><line x1="94" y1="86" x2="126" y2="68"/>' +
        '</g>' +
        // Arka Düğüm Noktaları
        '<g opacity="0.85">' +
          '<circle cx="76" cy="28" r="9" fill="url(#gC)"/><circle cx="126" cy="28" r="10" fill="url(#gCa)"/>' +
          '<circle cx="76" cy="68" r="10" fill="url(#gCa)"/><circle cx="126" cy="68" r="9" fill="url(#gC)"/>' +
        '</g>' +
        // Ön Kristal Bağları
        '<g stroke="#64748b" stroke-width="1.8" stroke-linecap="round">' +
          '<line x1="44" y1="46" x2="94" y2="46"/><line x1="94" y1="46" x2="94" y2="86"/><line x1="94" y1="86" x2="44" y2="86"/><line x1="44" y1="86" x2="44" y2="46"/>' +
        '</g>' +
        // Ön Düğüm Noktaları
        '<g filter="url(#spDrop)">' +
          '<circle cx="44" cy="46" r="12" fill="url(#gCa)"/><text x="44" y="50" font-size="8" fill="#fff" text-anchor="middle" font-weight="800">Ca²⁺</text>' +
          '<circle cx="94" cy="46" r="13" fill="url(#gC)"/><circle cx="94" cy="38" r="6" fill="url(#gO)"/><circle cx="87" cy="50" r="6" fill="url(#gO)"/><circle cx="101" cy="50" r="6" fill="url(#gO)"/><text x="94" y="50" font-size="7.5" fill="#fff" text-anchor="middle" font-weight="800">CO₃²⁻</text>' +
          '<circle cx="44" cy="86" r="13" fill="url(#gC)"/><circle cx="44" cy="78" r="6" fill="url(#gO)"/><circle cx="37" cy="90" r="6" fill="url(#gO)"/><circle cx="51" cy="90" r="6" fill="url(#gO)"/><text x="44" y="90" font-size="7.5" fill="#fff" text-anchor="middle" font-weight="800">CO₃²⁻</text>' +
          '<circle cx="94" cy="86" r="12" fill="url(#gCa)"/><text x="94" y="90" font-size="8" fill="#fff" text-anchor="middle" font-weight="800">Ca²⁺</text>' +
        '</g>' +
      '</svg>' +
      '<div class="particle-legend-col">' +
        '<div class="legend-item"><div class="legend-dot" style="background:#14b8a6;"></div><span>Ca²⁺ (Kalsiyum)</span></div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:#334155;"></div><span>CO₃²⁻ (Karbonat)</span></div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:#64748b;"></div><span>Kristal Örgü</span></div>' +
      '</div>' +
    '</div>';
  }

  // 11. NaHCO3: Katı Yemek Sodası 3B İzometrik Kristal Örgü Kafesi
  function renderParticleNaHCO3() {
    return '<div style="display:flex;align-items:center;justify-content:center;gap:12px;width:100%;">' +
      '<svg viewBox="0 0 170 115" width="165" height="110" class="micro-chamber-svg">' +
        getShared3DDefs() +
        getChamberBackdrop('solid', 'NaHCO₃ Katı Kristal Kafesi') +
        // Kristal Izgara Çizgileri
        '<g stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round">' +
          '<line x1="72" y1="28" x2="124" y2="28"/><line x1="124" y1="28" x2="124" y2="68"/><line x1="124" y1="68" x2="72" y2="68"/><line x1="72" y1="68" x2="72" y2="28"/>' +
          '<line x1="42" y1="46" x2="72" y2="28"/><line x1="94" y1="46" x2="124" y2="28"/><line x1="42" y1="86" x2="72" y2="68"/><line x1="94" y1="86" x2="124" y2="68"/>' +
          '<line x1="42" y1="46" x2="94" y2="46"/><line x1="94" y1="46" x2="94" y2="86"/><line x1="94" y1="86" x2="42" y2="86"/><line x1="42" y1="86" x2="42" y2="46"/>' +
        '</g>' +
        '<g filter="url(#spDrop)">' +
          '<circle cx="42" cy="46" r="11" fill="url(#gNa)"/><text x="42" y="49.5" font-size="8" fill="#fff" text-anchor="middle" font-weight="800">Na⁺</text>' +
          '<circle cx="94" cy="46" r="12" fill="url(#gC)"/><circle cx="94" cy="38" r="5.5" fill="url(#gO)"/><circle cx="87" cy="50" r="5.5" fill="url(#gO)"/><circle cx="102" cy="50" r="5.5" fill="url(#gO)"/><circle cx="108" cy="54" r="3.8" fill="url(#gH)"/><text x="94" y="49.5" font-size="7" fill="#fff" text-anchor="middle" font-weight="800">HCO₃⁻</text>' +
          '<circle cx="42" cy="86" r="12" fill="url(#gC)"/><circle cx="42" cy="78" r="5.5" fill="url(#gO)"/><circle cx="35" cy="90" r="5.5" fill="url(#gO)"/><circle cx="50" cy="90" r="5.5" fill="url(#gO)"/><circle cx="56" cy="94" r="3.8" fill="url(#gH)"/><text x="42" y="89.5" font-size="7" fill="#fff" text-anchor="middle" font-weight="800">HCO₃⁻</text>' +
          '<circle cx="94" cy="86" r="11" fill="url(#gNa)"/><text x="94" y="89.5" font-size="8" fill="#fff" text-anchor="middle" font-weight="800">Na⁺</text>' +
        '</g>' +
      '</svg>' +
      '<div class="particle-legend-col">' +
        '<div class="legend-item"><div class="legend-dot" style="background:#9333ea;"></div><span>Na⁺ (Sodyum)</span></div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:#e11d48;"></div><span>HCO₃⁻ (Bikarbonat)</span></div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:#64748b;"></div><span>Kristal Örgü</span></div>' +
      '</div>' +
    '</div>';
  }

  // 12. Na2CO3: Katı Çamaşır Sodası 3B İzometrik Kristal Kafesi
  function renderParticleNa2CO3() {
    return '<div style="display:flex;align-items:center;justify-content:center;gap:12px;width:100%;">' +
      '<svg viewBox="0 0 170 115" width="165" height="110" class="micro-chamber-svg">' +
        getShared3DDefs() +
        getChamberBackdrop('solid', 'Na₂CO₃ Katı Kristal Kafesi') +
        // Kristal Izgara
        '<g stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round">' +
          '<line x1="72" y1="28" x2="124" y2="28"/><line x1="124" y1="28" x2="124" y2="68"/><line x1="124" y1="68" x2="72" y2="68"/><line x1="72" y1="68" x2="72" y2="28"/>' +
          '<line x1="42" y1="46" x2="72" y2="28"/><line x1="94" y1="46" x2="124" y2="28"/><line x1="42" y1="86" x2="72" y2="68"/><line x1="94" y1="86" x2="124" y2="68"/>' +
          '<line x1="42" y1="46" x2="94" y2="46"/><line x1="94" y1="46" x2="94" y2="86"/><line x1="94" y1="86" x2="42" y2="86"/><line x1="42" y1="86" x2="42" y2="46"/>' +
        '</g>' +
        '<g filter="url(#spDrop)">' +
          '<circle cx="34" cy="46" r="9.5" fill="url(#gNa)"/><text x="34" y="49" font-size="7.5" fill="#fff" text-anchor="middle" font-weight="800">Na⁺</text>' +
          '<circle cx="50" cy="46" r="9.5" fill="url(#gNa)"/><text x="50" y="49" font-size="7.5" fill="#fff" text-anchor="middle" font-weight="800">Na⁺</text>' +
          '<circle cx="94" cy="46" r="13" fill="url(#gC)"/><circle cx="94" cy="38" r="6" fill="url(#gO)"/><circle cx="87" cy="50" r="6" fill="url(#gO)"/><circle cx="101" cy="50" r="6" fill="url(#gO)"/><text x="94" y="50" font-size="7.5" fill="#fff" text-anchor="middle" font-weight="800">CO₃²⁻</text>' +
          '<circle cx="42" cy="86" r="13" fill="url(#gC)"/><circle cx="42" cy="78" r="6" fill="url(#gO)"/><circle cx="35" cy="90" r="6" fill="url(#gO)"/><circle cx="49" cy="90" r="6" fill="url(#gO)"/><text x="42" y="90" font-size="7.5" fill="#fff" text-anchor="middle" font-weight="800">CO₃²⁻</text>' +
          '<circle cx="86" cy="86" r="9.5" fill="url(#gNa)"/><text x="86" y="89" font-size="7.5" fill="#fff" text-anchor="middle" font-weight="800">Na⁺</text>' +
          '<circle cx="102" cy="86" r="9.5" fill="url(#gNa)"/><text x="102" y="89" font-size="7.5" fill="#fff" text-anchor="middle" font-weight="800">Na⁺</text>' +
        '</g>' +
      '</svg>' +
      '<div class="particle-legend-col">' +
        '<div class="legend-item"><div class="legend-dot" style="background:#9333ea;"></div><span>Na⁺ (Sodyum)</span></div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:#334155;"></div><span>CO₃²⁻ (Karbonat)</span></div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:#64748b;"></div><span>Kristal Örgü</span></div>' +
      '</div>' +
    '</div>';
  }

  // Reaktif Tanecik Yönlendirici (Her 12 Reaktif İçin Hatasız Model)
  function renderGenericReactantParticle(r) {
    if (!r) return '';
    if (r.id === 'HCl') return renderParticleHCl();
    if (r.id === 'NaOH') return renderParticleNaOH();
    if (r.id === 'H2O2') return renderParticleH2O2();
    if (r.id === 'NH3') return renderParticleNH3();
    if (r.id === 'KI') return renderParticleKI();
    if (r.id === 'Pb(NO3)2') return renderParticlePbNO32();
    if (r.id === 'CaCO3') return renderParticleCaCO3();
    if (r.id === 'CaCl2') return renderParticleCaCl2();
    if (r.id === 'AgNO3') return renderParticleAgNO3();
    if (r.id === 'Cu(NO3)2') return renderParticleCuNO32();
    if (r.id === 'NaHCO3') return renderParticleNaHCO3();
    if (r.id === 'Na2CO3') return renderParticleNa2CO3();
    return renderParticleHCl();
  }

  /* ----------------- 5. BİLİMSEL 3B TANECİK VE ÜRÜN MODELLERİ (ÜRÜNLER) -----------------
     Gerçek Deney Ortamı:
     - Çökelme: Dipte çöken katı kristal tabakası + üst çözeltide serbest seyirci iyonlar.
     - Gaz Çıkışı: Sıvıdan atmosfere yükselen gaz molekülleri + altta kalan çözünmüş iyonlar.
     - Asit-Baz Nötrleşmesi: Kovalent bağlı yeni su molekülleri + suda serbest solvatize tuz iyonları.
     - Kompleksleşme: Koyu safir çözeltide merkezi iyona koordine olmuş ligandlar.
  ----------------------------------------------------------------------------------------- */

  // 1. ÇÖKELME HÜCRESİ (Katı Kristal Sediment + Üst Çözeltideki Seyirci İyonlar)
  function renderProductPrecipitateCell(precipKey, rx, r1, r2) {
    var isPbI2 = (precipKey === 'PbI2' || precipKey === 'PbI₂');
    var isAgCl = (precipKey === 'AgCl');
    var isCuOH2 = (precipKey === 'Cu(OH)2' || precipKey === 'Cu(OH)₂');
    var isMalachite = (precipKey.indexOf('Cu₂CO₃') > -1 || precipKey.indexOf('Cu2CO3') > -1);
    var isAg2O = (precipKey === 'Ag2O' || precipKey === 'Ag₂O' || precipKey === '2Ag(k)');

    var title = rx ? rx.title : 'Çökelme Tepkimesi';
    var catFill = isPbI2 ? 'url(#gPb)' : (isAgCl ? 'url(#gAg)' : (isCuOH2 ? 'url(#gCu)' : (isAg2O ? 'url(#gC)' : 'url(#gCa)')));
    var anFill = isPbI2 ? 'url(#gI)' : (isAgCl ? 'url(#gCl)' : (isCuOH2 ? 'url(#gO)' : 'url(#gC)'));
    var catName = isPbI2 ? 'Pb²⁺' : (isAgCl ? 'Ag⁺' : (isCuOH2 ? 'Cu²⁺' : (isAg2O ? 'Ag' : 'Ca²⁺')));
    var anName = isPbI2 ? 'I⁻' : (isAgCl ? 'Cl⁻' : (isCuOH2 ? 'OH⁻' : (isAg2O ? 'O²⁻' : 'CO₃²⁻')));
    var precipFormula = rx ? (rx.mainProductSymbol || precipKey) : precipKey;

    // Üstte yüzen seyirci iyonlar (K+, NO3-, Na+, Cl-, vb.)
    var spec1Fill = 'url(#gK)', spec1Name = 'K⁺';
    var spec2Fill = 'url(#gN)', spec2Name = 'NO₃⁻';
    if (rx && rx.spectators) {
      if (rx.spectators.indexOf('Na⁺') > -1) { spec1Fill = 'url(#gNa)'; spec1Name = 'Na⁺'; }
      if (rx.spectators.indexOf('Ca²⁺') > -1) { spec1Fill = 'url(#gCa)'; spec1Name = 'Ca²⁺'; }
      if (rx.spectators.indexOf('H⁺') > -1) { spec1Fill = 'url(#gH)'; spec1Name = 'H⁺'; }
      if (rx.spectators.indexOf('Cl⁻') > -1) { spec2Fill = 'url(#gCl)'; spec2Name = 'Cl⁻'; }
    }

    return '<div style="display:flex;align-items:center;justify-content:center;gap:12px;width:100%;">' +
      '<svg viewBox="0 0 170 115" width="165" height="110" class="micro-chamber-svg">' +
        getShared3DDefs() +
        getChamberBackdrop('precipitate', 'Sulu Çözelti (Seyirci İyonlar)', precipFormula + ' Katı Çökeltisi') +
        // Üst Çözelti Bölgesi: Seyirci İyonlar ve Solvasyon Suları
        render3DWaterMolecule(22, 36, 45, 0.85) +
        render3DWaterMolecule(148, 36, 135, 0.85) +
        render3DWaterMolecule(85, 42, -90, 0.85) +
        '<g filter="url(#spDrop)">' +
          '<circle cx="48" cy="46" r="12" fill="' + spec1Fill + '"/>' +
          '<text x="48" y="50" font-size="8.5" fill="#fff" text-anchor="middle" font-weight="800">' + spec1Name + '</text>' +
          '<circle cx="122" cy="46" r="12" fill="' + spec2Fill + '"/>' +
          '<text x="122" y="50" font-size="8" fill="#fff" text-anchor="middle" font-weight="800">' + spec2Name + '</text>' +
        '</g>' +
        // Alt Çökelti Bölgesi: Düzenli 3B Kristal Kafes Sediment Tabakası
        '<g stroke="rgba(100, 116, 139, 0.6)" stroke-width="1.2" stroke-linecap="round">' +
          '<line x1="28" y1="94" x2="142" y2="94"/>' +
          '<line x1="38" y1="102" x2="132" y2="102"/>' +
        '</g>' +
        '<g filter="url(#spDrop)">' +
          // 1. Sıra (Dip)
          '<circle cx="28" cy="94" r="9" fill="' + catFill + '"/><text x="28" y="97" font-size="6" fill="#fff" text-anchor="middle" font-weight="800">' + catName + '</text>' +
          '<circle cx="47" cy="94" r="10" fill="' + anFill + '"/><text x="47" y="97.5" font-size="6.5" fill="#fff" text-anchor="middle" font-weight="800">' + anName + '</text>' +
          '<circle cx="66" cy="94" r="9" fill="' + catFill + '"/><text x="66" y="97" font-size="6" fill="#fff" text-anchor="middle" font-weight="800">' + catName + '</text>' +
          '<circle cx="85" cy="94" r="10" fill="' + anFill + '"/><text x="85" y="97.5" font-size="6.5" fill="#fff" text-anchor="middle" font-weight="800">' + anName + '</text>' +
          '<circle cx="104" cy="94" r="9" fill="' + catFill + '"/><text x="104" y="97" font-size="6" fill="#fff" text-anchor="middle" font-weight="800">' + catName + '</text>' +
          '<circle cx="123" cy="94" r="10" fill="' + anFill + '"/><text x="123" y="97.5" font-size="6.5" fill="#fff" text-anchor="middle" font-weight="800">' + anName + '</text>' +
          '<circle cx="142" cy="94" r="9" fill="' + catFill + '"/><text x="142" y="97" font-size="6" fill="#fff" text-anchor="middle" font-weight="800">' + catName + '</text>' +
          // 2. Sıra (Üst Katman)
          '<circle cx="38" cy="85" r="9" fill="' + anFill + '"/><text x="38" y="88" font-size="6" fill="#fff" text-anchor="middle" font-weight="800">' + anName + '</text>' +
          '<circle cx="57" cy="85" r="9" fill="' + catFill + '"/><text x="57" y="88" font-size="6" fill="#fff" text-anchor="middle" font-weight="800">' + catName + '</text>' +
          '<circle cx="76" cy="85" r="9" fill="' + anFill + '"/><text x="76" y="88" font-size="6" fill="#fff" text-anchor="middle" font-weight="800">' + anName + '</text>' +
          '<circle cx="95" cy="85" r="9" fill="' + catFill + '"/><text x="95" y="88" font-size="6" fill="#fff" text-anchor="middle" font-weight="800">' + catName + '</text>' +
          '<circle cx="114" cy="85" r="9" fill="' + anFill + '"/><text x="114" y="88" font-size="6" fill="#fff" text-anchor="middle" font-weight="800">' + anName + '</text>' +
          '<circle cx="133" cy="85" r="9" fill="' + catFill + '"/><text x="133" y="88" font-size="6" fill="#fff" text-anchor="middle" font-weight="800">' + catName + '</text>' +
        '</g>' +
      '</svg>' +
      '<div class="particle-legend-col">' +
        '<div class="legend-item"><div class="legend-dot" style="background:' + (isPbI2 ? '#f59e0b' : (isAgCl ? '#cbd5e1' : (isCuOH2 ? '#2563eb' : '#14b8a6'))) + ';"></div><span>' + catName + ' (Çöken)</span></div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:' + (isPbI2 ? '#5b21b6' : (isAgCl ? '#15803d' : (isCuOH2 ? '#e11d48' : '#334155'))) + ';"></div><span>' + anName + ' (Çöken)</span></div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:#0284c7;"></div><span>Seyirci İyonlar</span></div>' +
      '</div>' +
    '</div>';
  }

  // 2. GAZ ÇIKIŞI HÜCRESİ (Atmosfere Dağılan Moleküller + Sıvı İçi Kabarcıklar)
  function renderProductGasCell(gasType, rx, r1, r2) {
    var isO2 = (gasType === 'O2' || gasType === 'O₂');
    var isCl2 = (gasType === 'Cl2' || gasType === 'Cl₂');

    var gasName = isO2 ? 'O₂ (Oksijen Gazı)' : (isCl2 ? 'Cl₂ (Klor Gazı)' : 'CO₂ (Karbondioksit Gazı)');

    return '<div style="display:flex;align-items:center;justify-content:center;gap:12px;width:100%;">' +
      '<svg viewBox="0 0 170 115" width="165" height="110" class="micro-chamber-svg">' +
        getShared3DDefs() +
        getChamberBackdrop('gas', gasName, 'Sıvı Çözelti Katmanı') +
        // Sıvı İçi Mikro Kabarcıklar ve İyonlar
        '<circle cx="35" cy="80" r="4" fill="rgba(255,255,255,0.7)"/>' +
        '<circle cx="75" cy="68" r="5" fill="rgba(255,255,255,0.85)"/>' +
        '<circle cx="125" cy="78" r="4" fill="rgba(255,255,255,0.7)"/>' +
        '<circle cx="145" cy="64" r="6" fill="rgba(255,255,255,0.9)"/>' +
        render3DWaterMolecule(52, 88, 30, 0.85) +
        render3DWaterMolecule(102, 92, 120, 0.85) +
        // Gaz Fazında Yükselen Moleküller ve Hız Vektör Okları
        '<g stroke="#0284c7" stroke-width="1.2" stroke-dasharray="2,2">' +
          '<line x1="45" y1="36" x2="45" y2="22"/><polygon points="43,23 45,18 47,23" fill="#0284c7"/>' +
          '<line x1="120" y1="34" x2="120" y2="20"/><polygon points="118,21 120,16 122,21" fill="#0284c7"/>' +
        '</g>' +
        '<g filter="url(#spDrop)">' +
          (isO2
            ? // O2 Molekülleri (O=O)
              '<g transform="translate(45, 36)">' +
                '<circle cx="-8" cy="0" r="10" fill="url(#gO)"/><circle cx="8" cy="0" r="10" fill="url(#gO)"/>' +
                '<text x="0" y="3.5" fill="#fff" font-size="8" font-weight="800" text-anchor="middle">O₂</text>' +
              '</g>' +
              '<g transform="translate(120, 32)">' +
                '<circle cx="-8" cy="0" r="10" fill="url(#gO)"/><circle cx="8" cy="0" r="10" fill="url(#gO)"/>' +
                '<text x="0" y="3.5" fill="#fff" font-size="8" font-weight="800" text-anchor="middle">O₂</text>' +
              '</g>'
            : (isCl2
              ? // Cl2 Molekülleri
                '<g transform="translate(45, 36)">' +
                  '<circle cx="-9" cy="0" r="11" fill="url(#gCl)"/><circle cx="9" cy="0" r="11" fill="url(#gCl)"/>' +
                  '<text x="0" y="3.5" fill="#fff" font-size="8.5" font-weight="800" text-anchor="middle">Cl₂</text>' +
                '</g>' +
                '<g transform="translate(120, 32)">' +
                  '<circle cx="-9" cy="0" r="11" fill="url(#gCl)"/><circle cx="9" cy="0" r="11" fill="url(#gCl)"/>' +
                  '<text x="0" y="3.5" fill="#fff" font-size="8.5" font-weight="800" text-anchor="middle">Cl₂</text>' +
                '</g>'
              : // CO2 Doğrusal Molekülleri (O=C=O)
                '<g transform="translate(45, 36)">' +
                  '<circle cx="-14" cy="0" r="9" fill="url(#gO)"/><circle cx="0" cy="0" r="7.5" fill="url(#gC)"/><circle cx="14" cy="0" r="9" fill="url(#gO)"/>' +
                  '<text x="0" y="3" fill="#fff" font-size="7" font-weight="800" text-anchor="middle">C</text>' +
                '</g>' +
                '<g transform="translate(120, 32)">' +
                  '<circle cx="-14" cy="0" r="9" fill="url(#gO)"/><circle cx="0" cy="0" r="7.5" fill="url(#gC)"/><circle cx="14" cy="0" r="9" fill="url(#gO)"/>' +
                  '<text x="0" y="3" fill="#fff" font-size="7" font-weight="800" text-anchor="middle">C</text>' +
                '</g>'
            )) +
        '</g>' +
      '</svg>' +
      '<div class="particle-legend-col">' +
        '<div class="legend-item"><div class="legend-dot" style="background:' + (isO2 ? '#e11d48' : (isCl2 ? '#22c55e' : '#334155')) + ';"></div><span>' + (isO2 ? 'O₂ Gazı' : (isCl2 ? 'Cl₂ Gazı' : 'CO₂ Gazı')) + '</span></div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:#0284c7;"></div><span>Yükselen Gaz</span></div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:#bae6fd;"></div><span>Sıvı Çözelti</span></div>' +
      '</div>' +
    '</div>';
  }

  // 3. ASİT-BAZ NÖTRLEŞME SUYU (Oluşan Yeni Kovalent H₂O Molekülleri Kümesi)
  function render3DWaterClusterWithLegend() {
    return '<div style="display:flex;align-items:center;justify-content:center;gap:12px;width:100%;">' +
      '<svg viewBox="0 0 170 115" width="165" height="110" class="micro-chamber-svg">' +
        getShared3DDefs() +
        getChamberBackdrop('aqueous', 'Nötrleşme Suyu (H₂O)', 'H⁺ + OH⁻ → H₂O') +
        // Hidrojen Bağları Ağı
        '<g stroke="rgba(255,255,255,0.75)" stroke-width="1.6" stroke-dasharray="3,2.5">' +
          '<line x1="55" y1="46" x2="105" y2="40"/>' +
          '<line x1="48" y1="56" x2="68" y2="82"/>' +
          '<line x1="115" y1="52" x2="115" y2="82"/>' +
          '<line x1="78" y1="84" x2="105" y2="84"/>' +
        '</g>' +
        '<g filter="url(#spDrop)">' +
          // Su Molekülü 1
          '<circle cx="48" cy="45" r="14" fill="url(#gO)"/><circle cx="36" cy="56" r="8" fill="url(#gH)"/><circle cx="64" cy="54" r="8" fill="url(#gH)"/>' +
          // Su Molekülü 2
          '<circle cx="118" cy="40" r="14" fill="url(#gO)"/><circle cx="104" cy="50" r="8" fill="url(#gH)"/><circle cx="132" cy="50" r="8" fill="url(#gH)"/>' +
          // Su Molekülü 3
          '<circle cx="74" cy="85" r="14" fill="url(#gO)"/><circle cx="88" cy="85" r="8" fill="url(#gH)"/><circle cx="62" cy="96" r="8" fill="url(#gH)"/>' +
        '</g>' +
        '<text x="85" y="27" font-size="8" fill="#0369a1" font-weight="800" text-anchor="middle">Oluşan Kovalent H₂O Molekülleri</text>' +
      '</svg>' +
      '<div class="particle-legend-col">' +
        '<div class="legend-item"><div class="legend-dot" style="background:#e11d48;"></div><span>O (Oksijen)</span></div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:#cbd5e1;"></div><span>H (Hidrojen)</span></div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:#38bdf8;"></div><span>H-Bağı Ağı</span></div>' +
      '</div>' +
    '</div>';
  }

  // 4. SUDA ÇÖZÜNMÜŞ SEYİRCİ İYONLAR HÜCRESİ (Katı Kristal Değil, Solvatize İyonlar!)
  function renderProductSpectatorSolutionCell(rx, r1, r2) {
    var specText = rx ? (rx.spectators || 'Seyirci İyonlar') : 'Seyirci İyonlar';
    var isNaCl = (specText.indexOf('Na⁺') > -1 && specText.indexOf('Cl⁻') > -1);
    var isKNO3 = (specText.indexOf('K⁺') > -1 && specText.indexOf('NO₃⁻') > -1);
    var isNaNO3 = (specText.indexOf('Na⁺') > -1 && specText.indexOf('NO₃⁻') > -1);

    var catFill = (isKNO3 ? 'url(#gK)' : 'url(#gNa)');
    var catName = (isKNO3 ? 'K⁺' : 'Na⁺');
    var anFill = (isNaCl ? 'url(#gCl)' : 'url(#gN)');
    var anName = (isNaCl ? 'Cl⁻' : 'NO₃⁻');

    return '<div style="display:flex;align-items:center;justify-content:center;gap:12px;width:100%;">' +
      '<svg viewBox="0 0 170 115" width="165" height="110" class="micro-chamber-svg">' +
        getShared3DDefs() +
        getChamberBackdrop('aqueous', 'Suda Çözünmüş İyonlar', 'Solvatize Seyirci İyonlar') +
        // Solvasyon kılıfı su molekülleri
        render3DWaterMolecule(24, 44, 180, 0.9) +
        render3DWaterMolecule(26, 84, 140, 0.9) +
        render3DWaterMolecule(52, 96, 90, 0.9) +
        render3DWaterMolecule(86, 38, 35, 0.9) +
        render3DWaterMolecule(148, 44, 150, 0.9) +
        render3DWaterMolecule(122, 92, -90, 0.9) +
        // Serbest İyonlar
        '<g filter="url(#spDrop)">' +
          '<circle cx="52" cy="62" r="16" fill="' + catFill + '"/>' +
          '<text x="52" y="67" fill="#ffffff" font-family="inherit" font-size="10.5" font-weight="800" text-anchor="middle">' + catName + '</text>' +
          '<circle cx="120" cy="62" r="18" fill="' + anFill + '"/>' +
          '<text x="120" y="67" fill="#ffffff" font-family="inherit" font-size="11" font-weight="800" text-anchor="middle">' + anName + '</text>' +
        '</g>' +
      '</svg>' +
      '<div class="particle-legend-col">' +
        '<div class="legend-item"><div class="legend-dot" style="background:' + (catName === 'K⁺' ? '#a855f7' : '#9333ea') + ';"></div><span>' + catName + ' (Solvatize)</span></div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:' + (anName === 'Cl⁻' ? '#15803d' : '#0284c7') + ';"></div><span>' + anName + ' (Solvatize)</span></div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:#e11d48;"></div><span>H₂O (Solvasyon)</span></div>' +
      '</div>' +
    '</div>';
  }

  // 5. KOORDİNASYON KOMPLEKSİ ([Cu(NH3)4]²⁺ Safir Mavisi Kompleks)
  function renderParticleCuComplex() {
    return '<div style="display:flex;align-items:center;justify-content:center;gap:12px;width:100%;">' +
      '<svg viewBox="0 0 170 115" width="165" height="110" class="micro-chamber-svg">' +
        getShared3DDefs() +
        getChamberBackdrop('cu-aqueous', '[Cu(NH₃)₄]²⁺ Kompleksi', 'Safir Laciverti Çözelti') +
        // Koordinasyon Kovalent Bağları
        '<g stroke="rgba(255,255,255,0.75)" stroke-width="2" stroke-dasharray="3,2">' +
          '<line x1="85" y1="60" x2="45" y2="60"/><line x1="85" y1="60" x2="125" y2="60"/><line x1="85" y1="60" x2="85" y2="28"/><line x1="85" y1="60" x2="85" y2="92"/>' +
        '</g>' +
        '<g filter="url(#spDrop)">' +
          '<circle cx="85" cy="60" r="17" fill="url(#gCu)"/><text x="85" y="64.5" font-size="9" fill="#fff" text-anchor="middle" font-weight="800">Cu²⁺</text>' +
          // 4 NH3 Ligandı
          '<circle cx="45" cy="60" r="12" fill="url(#gN)"/><text x="45" y="63.5" font-size="7.5" fill="#fff" text-anchor="middle" font-weight="800">NH₃</text>' +
          '<circle cx="125" cy="60" r="12" fill="url(#gN)"/><text x="125" y="63.5" font-size="7.5" fill="#fff" text-anchor="middle" font-weight="800">NH₃</text>' +
          '<circle cx="85" cy="28" r="12" fill="url(#gN)"/><text x="85" y="31.5" font-size="7.5" fill="#fff" text-anchor="middle" font-weight="800">NH₃</text>' +
          '<circle cx="85" cy="92" r="12" fill="url(#gN)"/><text x="85" y="95.5" font-size="7.5" fill="#fff" text-anchor="middle" font-weight="800">NH₃</text>' +
        '</g>' +
        // Köşeli Parantezler ve Yük
        '<path d="M 28 22 L 22 22 L 22 98 L 28 98" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="1.8"/>' +
        '<path d="M 142 22 L 148 22 L 148 98 L 142 98" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="1.8"/>' +
        '<text x="154" y="24" fill="#ffffff" font-size="10" font-weight="800">²⁺</text>' +
      '</svg>' +
      '<div class="particle-legend-col">' +
        '<div class="legend-item"><div class="legend-dot" style="background:#1d4ed8;"></div><span>Cu²⁺ (Merkez)</span></div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:#0284c7;"></div><span>NH₃ (Ligand)</span></div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:#7dd3fc;"></div><span>Safir Kompleks</span></div>' +
      '</div>' +
    '</div>';
  }

  // 6. Geriye Uyumluluk ve Ürün Tanecik Yönlendiricisi
  function renderGenericProductParticle(type, rx, r1, r2) {
    // A. Fiziksel Karışım (Tepkime Yok)
    if (rx && rx.typeCategory === 'none') {
      if (type === 'reactant1' && r1) return renderGenericReactantParticle(r1);
      if (type === 'reactant2' && r2) return renderGenericReactantParticle(r2);
      return renderGenericReactantParticle(r1 || r2);
    }

    // B. Belirtilen Türlere Göre Doğrudan Yönlendirme
    if (type === 'H₂O' || type === 'H2O' || type === 'water') {
      return render3DWaterClusterWithLegend();
    }
    if (type === 'CO₂' || type === 'CO2') {
      return renderProductGasCell('CO2', rx, r1, r2);
    }
    if (type === 'O₂' || type === 'O2') {
      return renderProductGasCell('O2', rx, r1, r2);
    }
    if (type === 'Cl₂' || type === 'Cl2') {
      return renderProductGasCell('Cl2', rx, r1, r2);
    }
    if (type === 'CuComplex' || type === '[Cu(NH₃)₄]²⁺' || type === 'Cu(NH3)4') {
      return renderParticleCuComplex();
    }
    if (type === 'spectators' || type === 'NaCl' || type === 'NaCl(suda)') {
      return renderProductSpectatorSolutionCell(rx, r1, r2);
    }

    // Çökeltiler
    if (type === 'PbI2' || type === 'PbI₂' || type === 'AgCl' || type === 'Cu(OH)2' || type === 'Cu(OH)₂' ||
        type === 'CaCO3' || type === 'CaCO₃' || type === 'PbCO3' || type === 'PbCO₃' || type === 'Ag2CO3' ||
        type === 'Ag₂CO₃' || type === 'Ag2O' || type === 'Ag₂O' || type === 'Cu2CO3(OH)2' || type === 'Cu₂CO₃(OH)₂' ||
        (rx && rx.obs && rx.obs.indexOf('precipitate') > -1)) {
      return renderProductPrecipitateCell(type, rx, r1, r2);
    }

    // Gazlar
    if (rx && rx.obs && rx.obs.indexOf('gas') > -1) {
      return renderProductGasCell((r1 && r1.id === 'H2O2' || r2 && r2.id === 'H2O2') ? 'O2' : 'CO2', rx, r1, r2);
    }

    // Varsayılan
    return renderProductSpectatorSolutionCell(rx, r1, r2);
  }

  // Geriye Uyumluluk İçin Eski Fonksiyon İsimleri
  function render3DNaCLLatticeWithLegend() {
    return renderProductSpectatorSolutionCell(null, null, null);
  }
  function renderParticleCO2() { return renderProductGasCell('CO2', null, null, null); }
  function renderParticleO2() { return renderProductGasCell('O2', null, null, null); }
  function renderParticlePbI2() { return renderProductPrecipitateCell('PbI2', null, null, null); }
  function renderParticleAgCl() { return renderProductPrecipitateCell('AgCl', null, null, null); }
  function renderParticleCuOH2() { return renderProductPrecipitateCell('Cu(OH)2', null, null, null); }

  /* ----------------- 6. REAKTİF HAVUZU GERÇEKÇİ BEHER SVG (REFERANS GÖRSEL STANDARDI) ----------------- */
  function renderBeakerSVG(reagent, isSlotEmpty) {
    var isCu = (!isSlotEmpty && reagent && reagent.id === 'Cu(NO3)2');
    var isSolid = (!isSlotEmpty && reagent && reagent.solid);
    var groundShadow = isCu ? 'url(#gCuGroundGlow)' : 'url(#gBeakerGroundShadow)';

    var content = '';
    if (!isSlotEmpty && reagent) {
      if (isSolid) {
        content = '<g class="beaker-powder">' +
          '<path d="M 18.5 86 Q 32 82 41 68 Q 47 55 50 52 Q 53 55 59 68 Q 68 82 81.5 86 Q 50 90 18.5 86 Z" fill="url(#gPowderMound)" stroke="#94a3b8" stroke-width="0.8" stroke-linejoin="round"/>' +
          '<path d="M 21 85 Q 33 80 43 67 Q 48 56 50 54 Q 52 56 58 67 Q 68 80 79 85 Q 50 89 21 85 Z" fill="url(#gPowderShade)"/>' +
          '<ellipse cx="48" cy="62" rx="7" ry="2.8" fill="#ffffff" opacity="0.95"/>' +
          '<ellipse cx="38" cy="74" rx="10" ry="3.5" fill="#ffffff" opacity="0.85"/>' +
          '<ellipse cx="60" cy="75" rx="11" ry="3.8" fill="#f1f5f9" opacity="0.7"/>' +
          '<path d="M 26 80 Q 38 72 50 74 Q 63 71 74 78" stroke="rgba(255,255,255,0.85)" stroke-width="1" fill="none"/>' +
          '<ellipse cx="50" cy="85" rx="26" ry="2.2" fill="#cbd5e1" opacity="0.45"/>' +
        '</g>';
      } else {
        var fluidFill = isCu ? 'url(#gCuSolution)' : 'url(#gClearWater)';
        var meniscusFill = isCu ? 'url(#gCuMeniscus)' : 'url(#gClearMeniscus)';
        var fluidOpacity = isCu ? '0.94' : '0.85';

        content = '<g class="beaker-fluid">' +
          '<path d="M 18.5 41 L 81.5 41 L 81 85 A 9 9 0 0 1 72 94 L 28 94 A 9 9 0 0 1 19 85 Z" fill="' + fluidFill + '" opacity="' + fluidOpacity + '"/>' +
          '<ellipse cx="50" cy="41" rx="31.5" ry="3.8" fill="' + meniscusFill + '" opacity="0.96"/>' +
          '<path d="M 19 41 Q 50 45 81 41" stroke="rgba(255,255,255,0.92)" stroke-width="1.2" fill="none"/>' +
          '<path d="M 27 43 L 29 88 Q 50 92 71 88 L 73 43" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1"/>' +
        '</g>';
      }
    }

    var scaleStroke = isCu ? 'rgba(255,255,255,0.85)' : 'var(--mebi-glass-grad, #64748b)';
    var scaleFill = isCu ? '#ffffff' : 'var(--mebi-glass-grad, #64748b)';

    return '<svg viewBox="0 0 100 118" width="100%" height="100%" style="overflow:visible;" role="img" aria-label="' + (reagent ? reagent.name : 'Boş Beher') + '">' +
      getShared3DDefs() +
      '<ellipse cx="50" cy="103" rx="38" ry="7.5" fill="' + groundShadow + '"/>' +
      '<path d="M 14 15 Q 16 17 18 17.5 L 18 86 A 10 10 0 0 0 28 96 L 72 96 A 10 10 0 0 0 82 86 L 82 17.5 Q 84 17 86 15 Z" fill="rgba(248, 250, 252, 0.45)"/>' +
      content +
      '<path d="M 22 93 Q 50 95.5 78 93 L 76 96 Q 50 98.5 24 96 Z" fill="rgba(255,255,255,0.65)"/>' +
      '<g font-family="Plus Jakarta Sans, sans-serif" font-size="5.8" font-weight="700" fill="' + scaleFill + '" text-anchor="start" opacity="0.88">' +
        '<line x1="58" y1="28" x2="65" y2="28" stroke="' + scaleStroke + '" stroke-width="0.9" stroke-linecap="round"/><text x="67" y="30">100</text>' +
        '<line x1="61" y1="35" x2="65" y2="35" stroke="' + scaleStroke + '" stroke-width="0.6" stroke-linecap="round"/>' +
        '<line x1="58" y1="42" x2="65" y2="42" stroke="' + scaleStroke + '" stroke-width="0.9" stroke-linecap="round"/><text x="67" y="44">80</text>' +
        '<line x1="61" y1="49" x2="65" y2="49" stroke="' + scaleStroke + '" stroke-width="0.6" stroke-linecap="round"/>' +
        '<line x1="58" y1="56" x2="65" y2="56" stroke="' + scaleStroke + '" stroke-width="0.9" stroke-linecap="round"/><text x="67" y="58">60</text>' +
        '<line x1="61" y1="63" x2="65" y2="63" stroke="' + scaleStroke + '" stroke-width="0.6" stroke-linecap="round"/>' +
        '<line x1="58" y1="70" x2="65" y2="70" stroke="' + scaleStroke + '" stroke-width="0.9" stroke-linecap="round"/><text x="67" y="72">40</text>' +
        '<line x1="61" y1="77" x2="65" y2="77" stroke="' + scaleStroke + '" stroke-width="0.6" stroke-linecap="round"/>' +
        '<line x1="58" y1="84" x2="65" y2="84" stroke="' + scaleStroke + '" stroke-width="0.9" stroke-linecap="round"/><text x="67" y="86">20</text>' +
      '</g>' +
      '<path d="M 22 20 L 22 86" stroke="url(#gGlassReflection)" stroke-width="2.2" stroke-linecap="round" opacity="0.92"/>' +
      '<path d="M 25 24 L 25 82" stroke="rgba(255,255,255,0.42)" stroke-width="0.9" stroke-linecap="round"/>' +
      '<path d="M 78 20 L 78 86" stroke="rgba(255,255,255,0.45)" stroke-width="1.1" stroke-linecap="round"/>' +
      '<path d="M 14 14 Q 15 16 18 16.5 L 18 86 A 10 10 0 0 0 28 96 L 72 96 A 10 10 0 0 0 82 86 L 82 16.5 Q 85 16 86 14" fill="none" stroke="var(--mebi-glass-stroke, #475569)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<ellipse cx="50" cy="15" rx="33" ry="3.6" fill="none" stroke="var(--mebi-glass-stroke-rim, #334155)" stroke-width="1.8"/>' +
      '<path d="M 18 15 Q 50 18.5 82 15" stroke="rgba(255,255,255,0.95)" stroke-width="1.3" fill="none"/>' +
      '<path d="M 14 14 Q 17 16.5 20 16.5" stroke="rgba(255,255,255,0.92)" stroke-width="1.3" fill="none"/>' +
    '</svg>';
  }

  /* ----------------- 7. İKON KÜTÜPHANESİ ----------------- */
  function icon(key, extraClass) {
    var paths = {
      shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
      search: '<circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="2"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
      filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
      down: '<polyline points="6 9 12 15 18 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
      info: '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
      flaskIc: '<path d="M9 2h6M10 2v6.2L4.8 18a2 2 0 0 0 1.8 3h10.8a2 2 0 0 0 1.8-3L14 8.2V2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
      flaskOutline: '<path d="M10 2h4M10 2v5.5L5.5 17a2 2 0 0 0 1.8 3h9.4a2 2 0 0 0 1.8-3L14 7.5V2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
      sparkles: '<path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z" fill="currentColor"/>',
      beakerIc: '<path d="M5 3h14v2l-1.5 1.5V18a2.5 2.5 0 0 1-2.5 2.5H9A2.5 2.5 0 0 1 6.5 18V6.5L5 5V3Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><line x1="10" y1="10" x2="14" y2="10" stroke="currentColor" stroke-width="1.3"/><line x1="10" y1="14" x2="13" y2="14" stroke="currentColor" stroke-width="1.3"/>',
      eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/>',
      grid: '<rect x="3" y="3" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="14" y="3" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="14" y="14" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="3" y="14" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/>',
      helpCircle: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.5-1.5 2-1.5 3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="16.5" r="0.8" fill="currentColor"/>',
      undo: '<path d="M7 8H4V5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 8c1.6-2.5 4.3-4 7.4-4a8 8 0 1 1-7.6 10.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
      reset: '<path d="M20 12a8 8 0 1 1-2.6-5.9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M20 3v5h-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
      gas: '<circle cx="8" cy="15.5" r="4.5" fill="rgba(6,182,212,0.25)" stroke="currentColor" stroke-width="1.8"/><circle cx="6.5" cy="13.5" r="1.3" fill="#ffffff"/><circle cx="16" cy="8.5" r="5.5" fill="rgba(6,182,212,0.25)" stroke="currentColor" stroke-width="1.8"/><circle cx="14" cy="6.2" r="1.6" fill="#ffffff"/><circle cx="15" cy="18.5" r="3.2" fill="rgba(6,182,212,0.25)" stroke="currentColor" stroke-width="1.6"/><circle cx="7" cy="6.5" r="2.5" fill="rgba(6,182,212,0.25)" stroke="currentColor" stroke-width="1.5"/>',
      precipitate: '<path d="M6 4h12l-1.2 13.5A3 3 0 0 1 13.8 20h-3.6a3 3 0 0 1-3-2.5L6 4z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="10" cy="15" r="1.4" fill="currentColor"/><circle cx="14" cy="16.5" r="1.1" fill="currentColor"/><circle cx="12" cy="13" r="0.9" fill="currentColor"/>',
      color: '<path d="M12 3c3 4 6 7.2 6 10.8A6 6 0 1 1 6 13.8C6 10.2 9 7 12 3z" fill="none" stroke="currentColor" stroke-width="1.8"/>',
      temp: '<rect x="10.3" y="3.5" width="3.4" height="11" rx="1.7" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="17.5" r="3" fill="none" stroke="currentColor" stroke-width="1.6"/><line x1="12" y1="7" x2="12" y2="16" stroke="currentColor" stroke-width="1.6"/>',
      none: '<line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
      check: '<path d="M4 12l5 5L20 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
      handIc: '<path d="M9 12.4V6a1.4 1.4 0 0 1 2.8 0v5.3M11.8 11.2V4.7a1.4 1.4 0 0 1 2.8 0v6.6M14.6 11.4V6.7a1.4 1.4 0 0 1 2.8 0v7.6c0 3.5-2.4 6.3-6 6.3h-1.1c-1.9 0-3.1-.7-4.1-2L4.5 15c-.6-.8-.4-1.8.4-2.3.7-.4 1.5-.3 2.1.3L9 14.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
      volumeOn: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
      volumeOff: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
      star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor"/>',
      deviceRotate: '<rect width="18" height="12" x="3" y="6" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="m9 2 3-2 3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
      rotate: '<path d="M21 2v6h-6M21 15.5a9 9 0 1 1-2.5-7.5l5.5-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
      flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.3 1-3a2.5 2.5 0 0 0 2.5 2.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
      atom: '<circle cx="12" cy="12" r="2.5" fill="currentColor"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(30 12 12)" fill="none" stroke="currentColor" stroke-width="1.6"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-30 12 12)" fill="none" stroke="currentColor" stroke-width="1.6"/>',
      award: '<circle cx="12" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m15.5 13.9 2.5 8.1-6-3.5-6 3.5 2.5-8.1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'
    };

    var content = paths[key] || '';
    return '<svg viewBox="0 0 24 24" class="' + (extraClass || '') + '" width="20" height="20">' + content + '</svg>';
  }

  // Global erişim
  window.MebiSVG = {
    getShared3DDefs: getShared3DDefs,
    render3DWaterMolecule: render3DWaterMolecule,
    getChamberBackdrop: getChamberBackdrop,
    renderTwoBeakersMacroscopic: renderTwoBeakersMacroscopic,
    renderSingleBeakerMacroscopic: renderSingleBeakerMacroscopic,
    renderParticleHCl: renderParticleHCl,
    renderParticleNaOH: renderParticleNaOH,
    renderParticleH2O2: renderParticleH2O2,
    renderParticleNH3: renderParticleNH3,
    renderParticleKI: renderParticleKI,
    renderParticlePbNO32: renderParticlePbNO32,
    renderParticleCaCl2: renderParticleCaCl2,
    renderParticleAgNO3: renderParticleAgNO3,
    renderParticleCuNO32: renderParticleCuNO32,
    renderParticleCaCO3: renderParticleCaCO3,
    renderParticleNaHCO3: renderParticleNaHCO3,
    renderParticleNa2CO3: renderParticleNa2CO3,
    renderProductPrecipitateCell: renderProductPrecipitateCell,
    renderProductGasCell: renderProductGasCell,
    render3DWaterClusterWithLegend: render3DWaterClusterWithLegend,
    renderProductSpectatorSolutionCell: renderProductSpectatorSolutionCell,
    renderParticleCuComplex: renderParticleCuComplex,
    render3DNaCLLatticeWithLegend: render3DNaCLLatticeWithLegend,
    renderParticleCO2: renderParticleCO2,
    renderParticleO2: renderParticleO2,
    renderParticlePbI2: renderParticlePbI2,
    renderParticleAgCl: renderParticleAgCl,
    renderParticleCuOH2: renderParticleCuOH2,
    renderGenericReactantParticle: renderGenericReactantParticle,
    renderGenericProductParticle: renderGenericProductParticle,
    renderBeakerSVG: renderBeakerSVG,
    renderProductBeakerSVG: renderProductBeakerSVG,
    icon: icon
  };

})(window);
