/**
 * Tepkime Arenası - Reaktif ve Tepkime Veritabanı (data.js)
 * MEB Kimya Müfredatı ve yonerge.docx standartlarına uygun 12 reaktif ve 66 reaksiyon matrisi.
 */

(function(window) {
  'use strict';

  /* ----------------- 1. REAKTİF HAVUZU (12 REAGENT) -----------------
     Gerçek Görünüm Standardı:
     - Sulu çözeltilerin neredeyse tamamı renksiz ve şeffaftır.
     - Sadece Cu(NO₃)₂ karakteristik mavi çözeltidir.
     - NaHCO₃, CaCO₃ ve Na₂CO₃ katı beyaz tozdur.
  ---------------------------------------------------------------------- */
  var REAGENTS = [
    {
      id: 'NaHCO3',
      f: 'NaHCO₃',
      name: 'Sodyum Hidrojen Karbonat',
      state: '(katı toz)',
      category: 'salt',
      solid: true,
      beakerColor: '#ffffff',
      desc: 'Yemek sodası tozu; katı beyaz kristal, asitlerle köpürerek CO₂ gazı açığa çıkarır.'
    },
    {
      id: 'H2O2',
      f: 'H₂O₂',
      name: 'Hidrojen Peroksit',
      state: '(suda)',
      category: 'acid',
      solid: false,
      beakerColor: 'rgba(232, 244, 253, 0.45)',
      desc: 'Oksijenli su çözeltisi; renksiz berrak sıvı, katalizör varlığında hızla O₂ gazı ve ısı üretir.'
    },
    {
      id: 'KI',
      f: 'KI',
      name: 'Potasyum İyodür',
      state: '(suda)',
      category: 'salt',
      solid: false,
      beakerColor: 'rgba(232, 244, 253, 0.45)',
      desc: 'Berrak ve renksiz iyodür tuzu çözeltisi; kurşun iyonlarıyla parlak altın sarısı çökelti verir.'
    },
    {
      id: 'Pb(NO3)2',
      f: 'Pb(NO₃)₂',
      name: 'Kurşun(II) Nitrat',
      state: '(suda)',
      category: 'salt',
      solid: false,
      beakerColor: 'rgba(232, 244, 253, 0.45)',
      desc: 'Berrak ve renksiz kurşun tuzu çözeltisi; ağır metal çökelme tepkimelerinde kullanılır.'
    },
    {
      id: 'CaCO3',
      f: 'CaCO₃',
      name: 'Kalsiyum Karbonat',
      state: '(katı toz)',
      category: 'salt',
      solid: true,
      beakerColor: '#ffffff',
      desc: 'Doğal kireç taşı tozu; suda çözünmeyen beyaz toz, asitlerle köpürerek CO₂ gazı açığa çıkarır.'
    },
    {
      id: 'HCl',
      f: 'HCl',
      name: 'Hidroklorik Asit',
      state: '(suda)',
      category: 'acid',
      solid: false,
      beakerColor: 'rgba(232, 244, 253, 0.45)',
      desc: 'Kuvvetli mineral asit; renksiz ve şeffaf sıvı, bazlarla ekzotermik nötrleşir, karbonatlarla gaz açığa çıkarır.'
    },
    {
      id: 'CaCl2',
      f: 'CaCl₂',
      name: 'Kalsiyum Klorür',
      state: '(suda)',
      category: 'salt',
      solid: false,
      beakerColor: 'rgba(232, 244, 253, 0.45)',
      desc: 'Kalsiyum tuzu çözeltisi; renksiz ve berrak sıvı, karbonat iyonlarıyla beyaz tebeşir (CaCO₃) çökeltisi kurar.'
    },
    {
      id: 'NaOH',
      f: 'NaOH',
      name: 'Sodyum Hidroksit',
      state: '(suda)',
      category: 'base',
      solid: false,
      beakerColor: 'rgba(232, 244, 253, 0.45)',
      desc: 'Kuvvetli baz (kostik); renksiz ve şeffaf sıvı, yüksek sıcaklık artışı veren nötrleşmeler ve metal hidroksit çökelmeleri yapar.'
    },
    {
      id: 'NH3',
      f: 'NH₃',
      name: 'Amonyak Çözeltisi',
      state: '(suda)',
      category: 'base',
      solid: false,
      beakerColor: 'rgba(232, 244, 253, 0.45)',
      desc: 'Zayıf baz çözeltisi; renksiz berrak sıvı, bakır iyonlarıyla safir laciverti tetraamin koordinasyon kompleksi kurar.'
    },
    {
      id: 'AgNO3',
      f: 'AgNO₃',
      name: 'Gümüş Nitrat',
      state: '(suda)',
      category: 'salt',
      solid: false,
      beakerColor: 'rgba(232, 244, 253, 0.45)',
      desc: 'Hassas gümüş tuzu çözeltisi; renksiz şeffaf sıvı, klorür iyonuyla temas edince anında süt beyazı AgCl çökeltisi verir.'
    },
    {
      id: 'Cu(NO3)2',
      f: 'Cu(NO₃)₂',
      name: 'Bakır(II) Nitrat',
      state: '(suda)',
      category: 'salt',
      solid: false,
      beakerColor: '#0284c7',
      desc: 'Karakteristik açık mavi bakır çözeltisi; bazla mavi jel çökelti, amonyakla koyu safir çözelti verir.'
    },
    {
      id: 'Na2CO3',
      f: 'Na₂CO₃',
      name: 'Sodyum Karbonat',
      state: '(katı toz)',
      category: 'salt',
      solid: true,
      beakerColor: '#ffffff',
      desc: 'Çamaşır sodası tozu; beyaz kristal katı, asitlerle tepkimesinden şiddetli CO₂ gazı ve sofra tuzu üretir.'
    }
  ];

  /* ----------------- 2. GÖZLEM VE KANIT LİSTESİ -----------------
     Yönerge uyarınca: "Enerji / Isı değişimi" yerine "Sıcaklık değişimi" kullanılmıştır.
  ----------------------------------------------------------------- */
  var OBS = [
    { key: 'gas', label: 'Gaz çıkışı' },
    { key: 'precipitate', label: 'Çökelti oluşumu' },
    { key: 'color', label: 'Renk değişimi' },
    { key: 'temp', label: 'Sıcaklık değişimi' },
    { key: 'none', label: 'Belirgin değişim yok' }
  ];

  /* ----------------- 3. PEDAGOJİK DEĞERLENDİRME SEÇENEKLERİ -----------------
     Yönergedeki resmi şık formatı:
     A — Çökelme tepkimesi
     B — Asit–baz tepkimesi
     C — Yükseltgenme–indirgenme (redoks) tepkimesi
     D — Kompleksleşme tepkimesi
     E — Bu koşullarda belirgin bir tepkime gözlenmez
  ---------------------------------------------------------------------------- */
  var QUIZ_OPTIONS = [
    'A — Çökelme tepkimesi',
    'B — Asit–baz tepkimesi',
    'C — Yükseltgenme–indirgenme (redoks) tepkimesi',
    'D — Kompleksleşme tepkimesi',
    'E — Bu koşullarda belirgin bir tepkime gözlenmez'
  ];

  /* ----------------- 4. REAKSİYON MATRİSİ (66 REAKSİYON ÇİFTİ) ----------------- */
  var REACTION_PAIRS = {
    // 1. NaHCO3 + Pb(NO3)2
    'NaHCO3|Pb(NO3)2': {
      title: 'Kurşun(II) Karbonat Çökelmesi ve Gaz Çıkışı',
      canonical: 'A — Çökelme tepkimesi ve B — Asit–baz tepkimesi',
      typeCategories: ["ppt","acidbase"],
      pedagogicalNote: "Pb²⁺ iyonları suda çözünmeyen katı PbCO₃ oluşturarak çökelir (Çökelme); bikarbonatın proton aktarımıyla CO₂ gazı ve su açığa çıkar (Asit–Baz).",
      typeCategory: 'ppt',
      eq: 'Pb(NO₃)₂(suda) + 2NaHCO₃(katı) → PbCO₃(katı, beyaz)↓ + 2NaNO₃(suda) + CO₂(gaz)↑ + H₂O(sıvı)',
      netIonic: 'Pb²⁺(suda) + 2HCO₃⁻(suda) → PbCO₃(katı)↓ + CO₂(gaz)↑ + H₂O(sıvı)',
      spectators: 'Na⁺(suda) ve NO₃⁻(suda)',
      products: 'PbCO₃(katı, beyaz çökelti) + CO₂(gaz) + 2NaNO₃(suda) + H₂O(sıvı)',
      mainProductSymbol: 'PbCO₃(k)',
      obs: ['precipitate', 'gas'],
      precipColor: '#ffffff',
      tempInit: 22.0, tempFinal: 22.0, hasTempRise: false,
      macroReactantsText: 'Renksiz kurşun(II) nitrat çözeltisi ile beyaz sodyum hidrojen karbonat tozu hazırlanmıştır.',
      macroProductsText: 'Maddeler karıştığında beherde beyaz PbCO₃ çökeltisi oluşur ve hafif CO₂ gaz kabarcıkları gözlenir.',
      microReactantsNote: 'Sulu ortamda serbest Pb²⁺ ve NO₃⁻ iyonları katı bikarbonat yüzeyiyle temas eder.',
      microProductsNote: 'Pb²⁺ katyonları karbonatla birleşerek suda çözünmeyen beyaz PbCO₃ kristal kafesini kurar; CO₂ gazı ve su açığa çıkar.'
    },

    // 2. HCl + NaHCO3
    'HCl|NaHCO3': {
      title: 'Asit - Bikarbonat Gaz Çıkışı ve Nötrleşme',
      canonical: 'B — Asit–baz tepkimesi',
      typeCategories: ["acidbase"],
      pedagogicalNote: "Kuvvetli asit (HCl) ile bazik bikarbonat arasındaki proton aktarımı sonucu CO₂ gazı, su ve sofra tuzu oluşur.",
      typeCategory: 'acidbase',
      eq: 'HCl(suda) + NaHCO₃(katı) → NaCl(suda) + H₂O(sıvı) + CO₂(gaz)↑ + Isı',
      netIonic: 'HCO₃⁻(katı) + H⁺(suda) → CO₂(gaz)↑ + H₂O(sıvı)',
      spectators: 'Na⁺(suda) ve Cl⁻(suda)',
      products: 'NaCl(suda) + H₂O(sıvı) + CO₂(gaz) + Isı',
      mainProductSymbol: 'NaCl + H₂O + CO₂',
      obs: ['gas', 'temp'],
      tempInit: 22.0, tempFinal: 36.5, hasTempRise: true,
      macroReactantsText: 'Renksiz berrak hidroklorik asit ile beyaz katı yemek sodası tozu tepkime için hazır bekler.',
      macroProductsText: 'Toz asitle birleştiğinde anında şiddetli köpürme ve yoğun CO₂ gaz fışkırması gerçekleşir, çözelti sıcaklığı 36.5°C\'ye yükselir.',
      microReactantsNote: 'HCl çözeltisindeki serbest H⁺ protonları katı bikarbonat (HCO₃⁻) yüzeyine hücum eder.',
      microProductsNote: 'Proton transferiyle derhal doğrusal apolar CO₂ gazı ve kovalent H₂O molekülleri oluşur; Na⁺ ve Cl⁻ serbest solvatize kalır.'
    },

    // 3. CaCl2 + NaHCO3
    'CaCl2|NaHCO3': {
      title: 'Kalsiyum Klorür - Bikarbonat Çökelmesi ve Gaz Çıkışı',
      canonical: 'A — Çökelme tepkimesi ve B — Asit–baz tepkimesi',
      typeCategories: ["ppt","acidbase"],
      pedagogicalNote: "Ca²⁺ iyonları kalsiyum karbonat (CaCO₃) katısı halinde çöker (Çökelme); bikarbonatın asit-baz tepkimesiyle CO₂ gazı açığa çıkar (Asit–Baz).",
      typeCategory: 'ppt',
      eq: 'CaCl₂(suda) + 2NaHCO₃(katı) → CaCO₃(katı, beyaz)↓ + 2NaCl(suda) + CO₂(gaz)↑ + H₂O(sıvı)',
      netIonic: 'Ca²⁺(suda) + 2HCO₃⁻(suda) → CaCO₃(katı)↓ + CO₂(gaz)↑ + H₂O(sıvı)',
      spectators: 'Na⁺(suda) ve Cl⁻(suda)',
      products: 'CaCO₃(katı, beyaz çökelti) + CO₂(gaz) + 2NaCl(suda) + H₂O(sıvı)',
      mainProductSymbol: 'CaCO₃(k)',
      obs: ['precipitate', 'gas'],
      precipColor: '#ffffff',
      tempInit: 22.0, tempFinal: 22.5, hasTempRise: false,
      macroReactantsText: 'Renksiz kalsiyum klorür çözeltisi ile beyaz katı bikarbonat tozu hazır bekler.',
      macroProductsText: 'Karışım gerçekleştikten sonra beyaz tebeşir (CaCO₃) çökeltisi oluşur ve çözeltiden hafif CO₂ gazı çıkar.',
      microReactantsNote: 'Ca²⁺ ve Cl⁻ iyonları çözeltide serbest haldeyken katı bikarbonatla etkileşir.',
      microProductsNote: 'Ca²⁺ katyonları karbonat anyonlarıyla kenetlenerek beyaz CaCO₃ kalsit kristal kafesini oluşturur.'
    },

    // 4. NaHCO3 + NaOH
    'NaHCO3|NaOH': {
      title: 'Sodyum Hidrojen Karbonat - Baz Nötrleşmesi',
      canonical: 'B — Asit–baz tepkimesi',
      typeCategories: ["acidbase"],
      pedagogicalNote: "Kuvvetli baz (OH⁻), amfoterik bikarbonatın asidik protonunu alarak su ve çözünmüş karbonat tuzuna dönüştürür.",
      typeCategory: 'acidbase',
      eq: 'NaHCO₃(katı) + NaOH(suda) → Na₂CO₃(suda) + H₂O(sıvı) + Isı',
      netIonic: 'HCO₃⁻(katı) + OH⁻(suda) → CO₃²⁻(suda) + H₂O(sıvı)',
      spectators: 'Na⁺(suda)',
      products: 'Na₂CO₃(suda) + H₂O(sıvı) + Isı',
      mainProductSymbol: 'Na₂CO₃ + H₂O',
      obs: ['temp'],
      tempInit: 22.0, tempFinal: 25.5, hasTempRise: true,
      macroReactantsText: 'Renksiz sodyum hidroksit bazı ile katı beyaz yemek sodası tozu hazırlanmıştır.',
      macroProductsText: 'Katı toz çözünür, belirgin bir renk veya çökelti oluşmaz ancak hafif sıcaklık artışı ölçülür.',
      microReactantsNote: 'Bazdan gelen serbest OH⁻ hidroksit anyonları bikarbonatın asidik protonuna saldırır.',
      microProductsNote: 'Proton transferiyle kararlı kovalent su (H₂O) molekülleri ve serbest karbonat (CO₃²⁻) anyonları oluşur.'
    },

    // 5. AgNO3 + NaHCO3
    'AgNO3|NaHCO3': {
      title: 'Gümüş Karbonat Çökelmesi ve Gaz Çıkışı',
      canonical: 'A — Çökelme tepkimesi ve B — Asit–baz tepkimesi',
      typeCategories: ["ppt","acidbase"],
      pedagogicalNote: "Ag⁺ iyonları sarı-beyaz Ag₂CO₃ katısını çöktürür (Çökelme); bikarbonat tepkimesinden CO₂ gazı ve su açığa çıkar (Asit–Baz).",
      typeCategory: 'ppt',
      eq: '2AgNO₃(suda) + 2NaHCO₃(katı) → Ag₂CO₃(katı, sarı-beyaz)↓ + 2NaNO₃(suda) + CO₂(gaz)↑ + H₂O(sıvı)',
      netIonic: '2Ag⁺(suda) + 2HCO₃⁻(suda) → Ag₂CO₃(katı)↓ + CO₂(gaz)↑ + H₂O(sıvı)',
      spectators: 'Na⁺(suda) ve NO₃⁻(suda)',
      products: 'Ag₂CO₃(katı, soluk sarı-beyaz çökelti) + CO₂(gaz) + 2NaNO₃(suda) + H₂O(sıvı)',
      mainProductSymbol: 'Ag₂CO₃(k)',
      obs: ['precipitate', 'gas'],
      precipColor: '#fef08a',
      tempInit: 22.0, tempFinal: 22.5, hasTempRise: false,
      macroReactantsText: 'Berrak renksiz gümüş nitrat çözeltisi ile beyaz katı bikarbonat tozu birleştirilmek üzere bekler.',
      macroProductsText: 'Maddeler karıştırıldığında soluk sarı-beyaz renkli Ag₂CO₃ çökeltisi ve hafif gaz kabarcıkları gözlenir.',
      microReactantsNote: 'Sulu ortamda serbest Ag⁺ katyonları katı bikarbonat yüzeyiyle reaksiyona girer.',
      microProductsNote: 'Ag⁺ ve karbonat anyonları suda çözünmeyen iyonik Ag₂CO₃ kristal kafesini örer.'
    },

    // 6. Cu(NO3)2 + NaHCO3
    'Cu(NO3)2|NaHCO3': {
      title: 'Bazik Bakır(II) Karbonat Çökelmesi ve Gaz Çıkışı',
      canonical: 'A — Çökelme tepkimesi ve B — Asit–baz tepkimesi',
      typeCategories: ["ppt","acidbase"],
      pedagogicalNote: "Cu²⁺ iyonları mavi-yeşil bazik bakır karbonat katısını çöktürür (Çökelme); eşzamanlı olarak CO₂ gazı açığa çıkar (Asit–Baz).",
      typeCategory: 'ppt',
      eq: '2Cu(NO₃)₂(suda) + 4NaHCO₃(katı) → Cu₂CO₃(OH)₂(katı, mavi-yeşil)↓ + 4NaNO₃(suda) + 3CO₂(gaz)↑ + H₂O(sıvı)',
      netIonic: '2Cu²⁺(suda) + 4HCO₃⁻(suda) → Cu₂CO₃(OH)₂(katı)↓ + 3CO₂(gaz)↑ + H₂O(sıvı)',
      spectators: 'Na⁺(suda) ve NO₃⁻(suda)',
      products: 'Cu₂CO₃(OH)₂(katı, mavi-yeşil malahit çökeltisi) + 3CO₂(gaz) + 4NaNO₃(suda) + H₂O(sıvı)',
      mainProductSymbol: 'Cu₂CO₃(OH)₂(k)',
      obs: ['precipitate', 'gas', 'color'],
      precipColor: '#0d9488',
      toColor: '#0f766e',
      tempInit: 22.0, tempFinal: 23.5, hasTempRise: false,
      macroReactantsText: 'Karakteristik berrak mavi bakır(II) nitrat çözeltisi ile beyaz bikarbonat tozu masadadır.',
      macroProductsText: 'Karışım anında yoğun köpürerek CO₂ gazı çıkarır ve beher tabanında mavi-yeşil renkli katı tortu birikir.',
      microReactantsNote: 'Açık mavi Cu²⁺ hidrat katyonları sulu ortamda bikarbonat anyonlarıyla karşılaşır.',
      microProductsNote: 'Cu²⁺ iyonları bazik karbonat (malahit) kafesini örerek çökerken, karbonik asit CO₂ gazına dönüşür.'
    },

    // 7. H2O2 + KI
    'H2O2|KI': {
      title: 'Fil Dişi Macunu: Katalitik Bozunma ve Oksijen Gazı',
      canonical: 'C — Yükseltgenme–indirgenme (redoks) tepkimesi',
      typeCategories: ["redox"],
      pedagogicalNote: "İyodür iyonlarının katalizörlüğünde hidrojen peroksit elektron aktarımıyla O₂ gazı ve suya bozunur.",
      typeCategory: 'redox',
      eq: '2H₂O₂(suda) —[I⁻]→ 2H₂O(sıvı) + O₂(gaz)↑ + Isı',
      netIonic: '2H₂O₂(suda) → 2H₂O(sıvı) + O₂(gaz)↑ (I⁻ homojen katalizör, I₂ ara ürünü)',
      spectators: 'K⁺(suda)',
      products: 'H₂O(sıvı) + O₂(gaz, yoğun köpük) + I₂(sarı-kahverengi çözelti) + Isı',
      mainProductSymbol: 'O₂ + H₂O + I₂',
      obs: ['gas', 'color', 'temp'],
      toColor: '#b45309',
      tempInit: 22.0, tempFinal: 54.5, hasTempRise: true,
      macroReactantsText: 'İki adet tamamen renksiz ve berrak sulu çözelti (peroksit ve iyodür) hazır bekler.',
      macroProductsText: 'İyodür damladığı anda çözelti sarı-kahverengi renge bürünür, fışkıran O₂ gazı ile köpürür ve sıcaklık 54.5°C\'ye yükselir.',
      microReactantsNote: 'H₂O₂ moleküllerindeki peroksi bağı I⁻ iyonlarının katalitik saldırısına uğrar.',
      microProductsNote: 'Redoks basamaklarında O-O bağları kırılarak kararlı kovalent O₂ gazı ve su açığa çıkar; geçici I₂ çözeltiye renk verir.'
    },

    // 8. H2O2 + HCl
    'H2O2|HCl': {
      title: 'Hidrojen Peroksit - Hidroklorik Asit Redoks Dönüşümü',
      canonical: 'C — Yükseltgenme–indirgenme (redoks) tepkimesi',
      typeCategories: ["redox"],
      pedagogicalNote: "Peroksit ve asidik klorür iyonları arasındaki elektron aktarımı redoks mekanizmasıyla gerçekleşir.",
      typeCategory: 'redox',
      eq: 'H₂O₂(suda) + 2HCl(suda) → Cl₂(gaz)↑ + 2H₂O(sıvı)',
      netIonic: 'H₂O₂(suda) + 2H⁺(suda) + 2Cl⁻(suda) → Cl₂(gaz)↑ + 2H₂O(sıvı)',
      spectators: 'Yok',
      products: 'Cl₂(gaz, keskin klor gazı) + 2H₂O(sıvı)',
      mainProductSymbol: 'Cl₂ + 2H₂O',
      obs: ['gas'],
      tempInit: 22.0, tempFinal: 23.5, hasTempRise: false,
      macroReactantsText: 'Her iki beherde de tamamen renksiz, şeffaf ve berrak asidik çözeltiler yer alır.',
      macroProductsText: 'Maddeler birleştiğinde ortamda klor gazı (Cl₂) oluşumu ve ince kabarcık çıkışı gerçekleşir.',
      microReactantsNote: 'Sulu ortamda serbest H⁺ ve Cl⁻ iyonları ile H₂O₂ molekülleri bir aradadır.',
      microProductsNote: 'Klorür anyonları peroksit tarafından kovalent bağlı Cl₂ klor gazına yükseltgenirken peroksit suya indirgenir.'
    },

    // 9. H2O2 + NaOH
    'H2O2|NaOH': {
      title: 'Hidrojen Peroksit - Baz Etkileşimi ve Sıcaklık Artışı',
      canonical: 'B — Asit–baz tepkimesi',
      typeCategories: ["acidbase"],
      pedagogicalNote: "Çok zayıf bir asit gibi davranan H₂O₂, kuvvetli baz NaOH ile proton alışverişi yaparak hidroperoksit iyonu (HO₂⁻) ve su oluşturur.",
      typeCategory: 'acidbase',
      eq: 'H₂O₂(suda) + NaOH(suda) ⇌ NaHO₂(suda) + H₂O(sıvı) + Isı',
      netIonic: 'H₂O₂(suda) + OH⁻(suda) ⇌ HO₂⁻(suda) + H₂O(sıvı)',
      spectators: 'Na⁺(suda)',
      products: 'NaHO₂(suda) + H₂O(sıvı) + Isı',
      mainProductSymbol: 'NaHO₂ + H₂O',
      obs: ['temp'],
      tempInit: 22.0, tempFinal: 27.5, hasTempRise: true,
      macroReactantsText: 'İki renksiz, berrak sıvı deney masasında ayrı beherlerde bulunur.',
      macroProductsText: 'Görünür bir renk değişimi veya çökelti oluşmaz; dijital termometrede ekzotermik sıcaklık artışı ölçülür.',
      microReactantsNote: 'H₂O₂ zayıf asidik yapısıyla ortamdaki serbest OH⁻ iyonlarıyla karşılaşır.',
      microProductsNote: 'OH⁻ iyonları peroksitten bir proton kopararak su moleküllerini ve hidroperoksit (HO₂⁻) anyonlarını oluşturur.'
    },

    // 10. AgNO3 + H2O2
    'AgNO3|H2O2': {
      title: 'Gümüş(I) İndirgenmesi ve Oksijen Gazı Çıkışı',
      canonical: 'C — Yükseltgenme–indirgenme (redoks) tepkimesi ve A — Çökelme tepkimesi',
      typeCategories: ["redox","ppt"],
      pedagogicalNote: "H₂O₂, Ag⁺ iyonlarını metalik gümüş (Ag) katısına indirgeyerek çöktürür (Çökelme); kendisi O₂ gazına yükseltgenir (Redoks).",
      typeCategory: 'redox',
      eq: 'H₂O₂(suda) + 2AgNO₃(suda) → 2Ag(katı, gri-siyah)↓ + 2HNO₃(suda) + O₂(gaz)↑',
      netIonic: 'H₂O₂(suda) + 2Ag⁺(suda) → 2Ag(katı)↓ + 2H⁺(suda) + O₂(gaz)↑',
      spectators: 'NO₃⁻(suda)',
      products: '2Ag(katı, gri-siyah metalik çökelti) + O₂(gaz) + 2HNO₃(suda)',
      mainProductSymbol: '2Ag(k) + O₂',
      obs: ['precipitate', 'color', 'gas'],
      precipColor: '#475569',
      toColor: '#334155',
      tempInit: 22.0, tempFinal: 25.0, hasTempRise: false,
      macroReactantsText: 'İki tamamen berrak, renksiz tuz ve peroksit çözeltisi masadadır.',
      macroProductsText: 'Karıştığında çözeltiden O₂ gazı kabarır ve ortamda ince taneli gri-siyah metalik gümüş çökeltisi belirir.',
      microReactantsNote: 'Ag⁺ katyonları ile kararsız H₂O₂ molekülleri sulu ortamda temas eder.',
      microProductsNote: 'Gümüş katyonları elektron alarak nötr Ag atomlarına indirgenir; peroksit oksijene yükseltgenir.'
    },

    // 11. Cu(NO3)2 + H2O2
    'Cu(NO3)2|H2O2': {
      title: 'Bakır(II) Katalizli Peroksit Bozunması',
      canonical: 'C — Yükseltgenme–indirgenme (redoks) tepkimesi',
      typeCategories: ["redox"],
      pedagogicalNote: "Cu²⁺ iyonları katalizörlüğünde hidrojen peroksit redoks basamaklarıyla oksijen gazı ve suya ayrışır.",
      typeCategory: 'redox',
      eq: '2H₂O₂(suda) —[Cu²⁺]→ 2H₂O(sıvı) + O₂(gaz)↑ + Isı',
      netIonic: '2H₂O₂(suda) → 2H₂O(sıvı) + O₂(gaz)↑ (Cu²⁺ katalizi)',
      spectators: 'NO₃⁻(suda)',
      products: '2H₂O(sıvı) + O₂(gaz kabarcıkları) + Cu(NO₃)₂(suda)',
      mainProductSymbol: 'O₂ + 2H₂O',
      obs: ['gas', 'temp'],
      tempInit: 22.0, tempFinal: 28.0, hasTempRise: true,
      macroReactantsText: 'Mavi bakır çözeltisi ile renksiz peroksit çözeltisi hazırlanmıştır.',
      macroProductsText: 'Maddeler birleştiğinde mavi renk korunur, ancak çözelti içerisinden O₂ gaz kabarcıkları yükselir ve sıcaklık artar.',
      microReactantsNote: 'Mavi renk veren solvatize Cu²⁺ hidrat iyonları H₂O₂ molekülleriyle redoks döngüsüne girer.',
      microProductsNote: 'Cu²⁺ iyonları kimyasal olarak harcanmadan O-O bağlarının kırılarak O₂ gazına dönüşmesini katalizler.'
    },

    // 12. KI + Pb(NO3)2
    'KI|Pb(NO3)2': {
      title: '"Altın Yağmuru" Kurşun(II) İyodür Çökelmesi',
      canonical: 'A — Çökelme tepkimesi',
      typeCategories: ["ppt"],
      pedagogicalNote: "Pb²⁺ ve I⁻ iyonları birleşerek karakteristik altın sarısı kurşun(II) iyodür (PbI₂) katısını çöktürür.",
      typeCategory: 'ppt',
      eq: 'Pb(NO₃)₂(suda) + 2KI(suda) → PbI₂(katı, parlak sarı)↓ + 2KNO₃(suda)',
      netIonic: 'Pb²⁺(suda) + 2I⁻(suda) → PbI₂(katı, sarı)↓',
      spectators: 'K⁺(suda) ve NO₃⁻(suda)',
      products: 'PbI₂(katı, göz alıcı altın sarısı çökelti) + 2KNO₃(suda)',
      mainProductSymbol: 'PbI₂(k)',
      obs: ['precipitate', 'color'],
      precipColor: '#f5c318',
      toColor: '#fef08a',
      tempInit: 22.0, tempFinal: 22.5, hasTempRise: false,
      macroReactantsText: 'İki beherde de tamamen şeffaf, berrak ve renksiz iki tuz çözeltisi yer alır.',
      macroProductsText: 'İki berrak sıvı birleştiği mikrosaniyede çözelti göz alıcı parlak altın sarısı bir katı çökeltiye bürünür.',
      microReactantsNote: 'KI çözeltisinde solvatize K⁺ ve I⁻ iyonları; kurşun nitratta ise Pb²⁺ ve NO₃⁻ iyonları yüzer.',
      microProductsNote: 'Pb²⁺ katyonları ile I⁻ anyonları bir araya gelerek suda çözünmeyen hekzagonal PbI₂ kristal kafesini kurar.'
    },

    // 13. AgNO3 + KI
    'AgNO3|KI': {
      title: 'Gümüş İyodür Sarı Çökelmesi',
      canonical: 'A — Çökelme tepkimesi',
      typeCategories: ["ppt"],
      pedagogicalNote: "Ag⁺ ve I⁻ iyonları bir araya geldiğinde suda çözünmeyen açık sarı AgI katısı çökelir.",
      typeCategory: 'ppt',
      eq: 'AgNO₃(suda) + KI(suda) → AgI(katı, soluk sarı)↓ + KNO₃(suda)',
      netIonic: 'Ag⁺(suda) + I⁻(suda) → AgI(katı, sarı)↓',
      spectators: 'K⁺(suda) ve NO₃⁻(suda)',
      products: 'AgI(katı, soluk sarı çökelti) + KNO₃(suda)',
      mainProductSymbol: 'AgI(k)',
      obs: ['precipitate', 'color'],
      precipColor: '#fde047',
      toColor: '#fef9c3',
      tempInit: 22.0, tempFinal: 22.5, hasTempRise: false,
      macroReactantsText: 'İki renksiz, berrak ve şeffaf çözelti deney için hazırlanmıştır.',
      macroProductsText: 'Sıvılar karıştığında anında açık sarı renkte opak bir katı AgI çökeltisi meydana gelir.',
      microReactantsNote: 'Ag⁺ ve I⁻ iyonları su molekülleri arasında bağımsız haldeyken karşılaşır.',
      microProductsNote: 'Gümüş ve iyodür iyonları çok güçlü elektrostatik çekimle katı AgI kristal yapısını oluşturur.'
    },

    // 14. Cu(NO3)2 + KI
    'Cu(NO3)2|KI': {
      title: 'Bakır(II) - İyodür Redoks ve Çökelme Tepkimesi',
      canonical: 'C — Yükseltgenme–indirgenme (redoks) tepkimesi ve A — Çökelme tepkimesi',
      typeCategories: ["redox","ppt"],
      pedagogicalNote: "Cu²⁺ iyonları Cu⁺ katyonuna indirgenirken I⁻ iyonları I₂ molekülüne yükseltgenir (Redoks); oluşan Cu⁺ ise iyodürle beyaz-krem CuI katısı olarak çöker (Çökelme).",
      typeCategory: 'redox',
      eq: '2Cu(NO₃)₂(suda) + 4KI(suda) → 2CuI(katı, beyaz)↓ + I₂(suda, kahve) + 4KNO₃(suda)',
      netIonic: '2Cu²⁺(suda) + 4I⁻(suda) → 2CuI(katı)↓ + I₂(suda)',
      spectators: 'K⁺(suda) ve NO₃⁻(suda)',
      products: '2CuI(katı çökelti) + I₂(kahverengi çözelti) + 4KNO₃(suda)',
      mainProductSymbol: 'CuI(k) + I₂',
      obs: ['precipitate', 'color'],
      precipColor: '#e2e8f0',
      toColor: '#92400e',
      tempInit: 22.0, tempFinal: 24.5, hasTempRise: false,
      macroReactantsText: 'Açık mavi bakır çözeltisi ile renksiz iyodür çözeltisi masada bekler.',
      macroProductsText: 'Maddeler temas ettiği anda çözelti koyu kahverengi renge bürünür ve dipte katı CuI çökeltisi birikir.',
      microReactantsNote: 'Cu²⁺ iyonları I⁻ anyonlarından elektron alarak Cu⁺ iyonuna indirgenir.',
      microProductsNote: 'Oluşan Cu⁺ iyonları I⁻ ile CuI katısını oluştururken, iyodür moleküler I₂ iyotuna yükseltgenerek kahverengi rengi verir.'
    },

    // 15. HCl + Pb(NO3)2
    'HCl|Pb(NO3)2': {
      title: 'Kurşun(II) Klorür Beyaz Çökelmesi',
      canonical: 'A — Çökelme tepkimesi',
      typeCategories: ["ppt"],
      pedagogicalNote: "Klorür (Cl⁻) ve kurşun (Pb²⁺) iyonları suda çözünürlüğü düşük beyaz PbCl₂ katısını çöktürür.",
      typeCategory: 'ppt',
      eq: 'Pb(NO₃)₂(suda) + 2HCl(suda) → PbCl₂(katı, beyaz)↓ + 2HNO₃(suda)',
      netIonic: 'Pb²⁺(suda) + 2Cl⁻(suda) → PbCl₂(katı, beyaz)↓',
      spectators: 'H⁺(suda) ve NO₃⁻(suda)',
      products: 'PbCl₂(katı, beyaz çökelti) + 2HNO₃(suda)',
      mainProductSymbol: 'PbCl₂(k)',
      obs: ['precipitate'],
      precipColor: '#ffffff',
      tempInit: 22.0, tempFinal: 22.0, hasTempRise: false,
      macroReactantsText: 'İki berrak ve renksiz çözelti masada beklemektedir.',
      macroProductsText: 'Çözeltiler birleştiği anda beyaz bir PbCl₂ çökeltisi oluşur.',
      microReactantsNote: 'Pb²⁺ ve Cl⁻ iyonları sulu ortamda serbest solvatize haldedir.',
      microProductsNote: 'Pb²⁺ ve Cl⁻ iyonları çözünürlük sınırını aşarak katı beyaz PbCl₂ kristallerini kurar.'
    },

    // 16. CaCl2 + Pb(NO3)2
    'CaCl2|Pb(NO3)2': {
      title: 'Kalsiyum Klorür ile Kurşun(II) Klorür Çökelmesi',
      canonical: 'A — Çökelme tepkimesi',
      typeCategories: ["ppt"],
      pedagogicalNote: "Pb²⁺ ve Cl⁻ iyonları bir araya gelerek beyaz PbCl₂ kristallerini çöktürür.",
      typeCategory: 'ppt',
      eq: 'Pb(NO₃)₂(suda) + CaCl₂(suda) → PbCl₂(katı, beyaz)↓ + Ca(NO₃)₂(suda)',
      netIonic: 'Pb²⁺(suda) + 2Cl⁻(suda) → PbCl₂(katı, beyaz)↓',
      spectators: 'Ca²⁺(suda) ve NO₃⁻(suda)',
      products: 'PbCl₂(katı, beyaz çökelti) + Ca(NO₃)₂(suda)',
      mainProductSymbol: 'PbCl₂(k)',
      obs: ['precipitate'],
      precipColor: '#ffffff',
      tempInit: 22.0, tempFinal: 22.0, hasTempRise: false,
      macroReactantsText: 'İki berrak tuz çözeltisi deney masasında yer alır.',
      macroProductsText: 'Maddeler karıştığında beyaz bir PbCl₂ çökeltisi meydana gelir.',
      microReactantsNote: 'Ca²⁺, Cl⁻, Pb²⁺ ve NO₃⁻ iyonları çözeltide serbest dağılmıştır.',
      microProductsNote: 'Pb²⁺ katyonları ile Cl⁻ anyonları birleşerek suda az çözünen PbCl₂ kristallerini oluşturur.'
    },

    // 17. NaOH + Pb(NO3)2
    'NaOH|Pb(NO3)2': {
      title: 'Kurşun(II) Hidroksit Beyaz Çökelmesi',
      canonical: 'A — Çökelme tepkimesi ve B — Asit–baz tepkimesi',
      typeCategories: ["ppt","acidbase"],
      pedagogicalNote: "Pb²⁺ katyonları kuvvetli bazdan gelen hidroksit (OH⁻) ile birleşerek beyaz Pb(OH)₂ katısını çöktürür (Çökelme); süreç hidroksit iyon transferidir (Asit–Baz).",
      typeCategory: 'ppt',
      eq: 'Pb(NO₃)₂(suda) + 2NaOH(suda) → Pb(OH)₂(katı, beyaz)↓ + 2NaNO₃(suda)',
      netIonic: 'Pb²⁺(suda) + 2OH⁻(suda) → Pb(OH)₂(katı, beyaz)↓',
      spectators: 'Na⁺(suda) ve NO₃⁻(suda)',
      products: 'Pb(OH)₂(katı, beyaz çökelti) + 2NaNO₃(suda)',
      mainProductSymbol: 'Pb(OH)₂(k)',
      obs: ['precipitate'],
      precipColor: '#ffffff',
      tempInit: 22.0, tempFinal: 23.0, hasTempRise: false,
      macroReactantsText: 'İki adet renksiz ve şeffaf çözelti deney için hazırdır.',
      macroProductsText: 'Maddeler birleştiğinde anında beyaz bir Pb(OH)₂ katısı çöker.',
      microReactantsNote: 'Suda serbest Pb²⁺ ve bazdan gelen serbest OH⁻ iyonları karşılaşır.',
      microProductsNote: 'Pb²⁺ katyonları OH⁻ anyonlarıyla suda çözünmeyen Pb(OH)₂ kafesini örer.'
    },

    // 18. NH3 + Pb(NO3)2
    'NH3|Pb(NO3)2': {
      title: 'Amonyak ile Kurşun(II) Hidroksit Çökelmesi',
      canonical: 'A — Çökelme tepkimesi ve B — Asit–baz tepkimesi',
      typeCategories: ["ppt","acidbase"],
      pedagogicalNote: "Zayıf baz amonyak (NH₃) suda oluşturduğu OH⁻ ile beyaz Pb(OH)₂ katısını çöktürür (Çökelme); süreç amonyağın bazik hidrolizine dayanır (Asit–Baz).",
      typeCategory: 'ppt',
      eq: 'Pb(NO₃)₂(suda) + 2NH₃(suda) + 2H₂O(sıvı) → Pb(OH)₂(katı, beyaz)↓ + 2NH₄NO₃(suda)',
      netIonic: 'Pb²⁺(suda) + 2NH₃(suda) + 2H₂O(sıvı) → Pb(OH)₂(katı, beyaz)↓ + 2NH₄⁺(suda)',
      spectators: 'NO₃⁻(suda)',
      products: 'Pb(OH)₂(katı, beyaz çökelti) + 2NH₄NO₃(suda)',
      mainProductSymbol: 'Pb(OH)₂(k)',
      obs: ['precipitate'],
      precipColor: '#ffffff',
      tempInit: 22.0, tempFinal: 22.5, hasTempRise: false,
      macroReactantsText: 'Renksiz kurşun çözeltisi ile renksiz amonyak çözeltisi bulunur.',
      macroProductsText: 'Karışım gerçekleştiğinde beyaz jel kıvamında Pb(OH)₂ çökeltisi oluşur.',
      microReactantsNote: 'Amonyak molekülleri suda az miktarda OH⁻ üretir.',
      microProductsNote: 'Açığa çıkan OH⁻ iyonları Pb²⁺ katyonları ile Pb(OH)₂ katısını oluşturur.'
    },

    // 19. Na2CO3 + Pb(NO3)2
    'Na2CO3|Pb(NO3)2': {
      title: 'Kurşun(II) Karbonat Beyaz Çökelmesi',
      canonical: 'A — Çökelme tepkimesi',
      typeCategories: ["ppt"],
      pedagogicalNote: "Kurşun iyonları (Pb²⁺) karbonatla birleşerek suda çözünmeyen beyaz PbCO₃ katısını oluşturur.",
      typeCategory: 'ppt',
      eq: 'Pb(NO₃)₂(suda) + Na₂CO₃(katı) → PbCO₃(katı, beyaz)↓ + 2NaNO₃(suda)',
      netIonic: 'Pb²⁺(suda) + CO₃²⁻(suda) → PbCO₃(katı, beyaz)↓',
      spectators: 'Na⁺(suda) ve NO₃⁻(suda)',
      products: 'PbCO₃(katı, beyaz çökelti) + 2NaNO₃(suda)',
      mainProductSymbol: 'PbCO₃(k)',
      obs: ['precipitate'],
      precipColor: '#ffffff',
      tempInit: 22.0, tempFinal: 22.0, hasTempRise: false,
      macroReactantsText: 'Renksiz kurşun nitrat çözeltisi ile beyaz katı çamaşır sodası tozu hazırlanmıştır.',
      macroProductsText: 'Maddeler birleştiğinde anında yoğun beyaz PbCO₃ çökeltisi meydana gelir.',
      microReactantsNote: 'Pb²⁺ katyonları ile suda çözünen serbest CO₃²⁻ anyonları temas eder.',
      microProductsNote: 'Pb²⁺ ve CO₃²⁻ iyonları elektrostatik çekimle katı PbCO₃ kristal kafesini kurar.'
    },

    // 20. CaCO3 + HCl
    'CaCO3|HCl': {
      title: 'Kireçtaşının Asitle Çözünmesi ve Gaz Çıkışı',
      canonical: 'B — Asit–baz tepkimesi',
      typeCategories: ["acidbase"],
      pedagogicalNote: "Katı bazik kalsiyum karbonat, hidroklorik asidin protonlarıyla nötrleşerek CO₂ gazı, su ve kalsiyum klorür tuzu verir.",
      typeCategory: 'acidbase',
      eq: 'CaCO₃(katı) + 2HCl(suda) → CaCl₂(suda) + CO₂(gaz)↑ + H₂O(sıvı) + Isı',
      netIonic: 'CaCO₃(katı) + 2H⁺(suda) → Ca²⁺(suda) + CO₂(gaz)↑ + H₂O(sıvı)',
      spectators: 'Cl⁻(suda)',
      products: 'CaCl₂(suda) + CO₂(gaz) + H₂O(sıvı) + Isı',
      mainProductSymbol: 'CaCl₂ + CO₂ + H₂O',
      obs: ['gas', 'temp'],
      tempInit: 22.0, tempFinal: 33.5, hasTempRise: true,
      macroReactantsText: 'Beyaz katı kireçtaşı tozu ile berrak renksiz asit çözeltisi hazırlanmıştır.',
      macroProductsText: 'Katı kireçtaşı asitle temas ettiği anda cızırdayarak erir, yoğun CO₂ gazı fışkırır ve sıcaklık yükselir.',
      microReactantsNote: 'Kalsiyum karbonatın güçlü kristal örgüsü serbest H⁺ protonlarının saldırısına uğrar.',
      microProductsNote: 'Kristaldeki karbonat anyonları CO₂ gazı ve suya dönüşür; kalsiyum serbest Ca²⁺ olarak çözünür.'
    },

    // 21. AgNO3 + CaCO3
    'AgNO3|CaCO3': {
      title: 'Kireçtaşı Üzerinde Gümüş Karbonat Çökelmesi',
      canonical: 'A — Çökelme tepkimesi',
      typeCategories: ["ppt"],
      pedagogicalNote: "Çözeltideki Ag⁺ katyonları katı yüzeyindeki karbonatla etkileşerek çözünmeyen Ag₂CO₃ katısını oluşturur.",
      typeCategory: 'ppt',
      eq: '2AgNO₃(suda) + CaCO₃(katı) → Ag₂CO₃(katı, soluk sarı)↓ + Ca(NO₃)₂(suda)',
      netIonic: '2Ag⁺(suda) + CaCO₃(katı) → Ag₂CO₃(katı)↓ + Ca²⁺(suda)',
      spectators: 'NO₃⁻(suda)',
      products: 'Ag₂CO₃(katı, soluk sarı yüzey çökeltisi) + Ca(NO₃)₂(suda)',
      mainProductSymbol: 'Ag₂CO₃(k)',
      obs: ['precipitate'],
      precipColor: '#fef08a',
      tempInit: 22.0, tempFinal: 22.0, hasTempRise: false,
      macroReactantsText: 'Berrak gümüş çözeltisi ile katı beyaz kireçtaşı tozu birleştirilir.',
      macroProductsText: 'Katı taneciklerin yüzeyi soluk sarı-beyaz renkli Ag₂CO₃ tabakasıyla kaplanır.',
      microReactantsNote: 'Ag⁺ iyonları katı CaCO₃ kristal yüzeyindeki karbonat gruplarıyla temas eder.',
      microProductsNote: 'Çözünürlüğü daha düşük olan Ag₂CO₃ katısı katı yüzeyinde çökelerek kristal tabaka oluşturur.'
    },

    // 22. CaCO3 + Cu(NO3)2
    'CaCO3|Cu(NO3)2': {
      title: 'Kireçtaşı - Bakır Yüzey Reaksiyonu',
      canonical: 'A — Çökelme tepkimesi ve B — Asit–baz tepkimesi',
      typeCategories: ["ppt","acidbase"],
      pedagogicalNote: "Cu²⁺ katyonları karbonat yüzeyinde çözünmeyen bazik bakır karbonat çökeleği oluşturur (Çökelme) ve hidroliz sonucu hafif CO₂ gazı çıkar (Asit–Baz).",
      typeCategory: 'ppt',
      eq: '2Cu(NO₃)₂(suda) + 2CaCO₃(katı) + H₂O(sıvı) → Cu₂CO₃(OH)₂(katı, mavi-yeşil)↓ + 2Ca(NO₃)₂(suda) + CO₂(gaz)↑',
      netIonic: '2Cu²⁺(suda) + 2CaCO₃(katı) + H₂O(sıvı) → Cu₂CO₃(OH)₂(katı)↓ + 2Ca²⁺(suda) + CO₂(gaz)↑',
      spectators: 'NO₃⁻(suda)',
      products: 'Cu₂CO₃(OH)₂(katı, mavi-yeşil tortu) + CO₂(gaz) + 2Ca(NO₃)₂(suda)',
      mainProductSymbol: 'Cu₂CO₃(OH)₂(k)',
      obs: ['color', 'gas'],
      toColor: '#0f766e',
      tempInit: 22.0, tempFinal: 22.5, hasTempRise: false,
      macroReactantsText: 'Mavi bakır çözeltisi ile beyaz katı kireçtaşı tozu bulunur.',
      macroProductsText: 'Zamanla katı yüzeyinde mavi-yeşil bazik bakır karbonat tabakası oluşur ve hafif kabarcıklar görülür.',
      microReactantsNote: 'Cu²⁺ hidrat iyonları katı kireçtaşı yüzeyindeki karbonat anyonları ile etkileşir.',
      microProductsNote: 'Katı yüzeyinde malahit (mavi-yeşil) kafesi örülür.'
    },

    // 23. HCl + NaOH
    'HCl|NaOH': {
      title: 'Kuvvetli Asit - Kuvvetli Baz Nötrleşmesi',
      canonical: 'B — Asit–baz tepkimesi',
      typeCategories: ["acidbase"],
      pedagogicalNote: "Kuvvetli asit ile kuvvetli bazın ekzotermik nötrleşme tepkimesidir; H⁺ ve OH⁻ iyonları birleşerek su ve tuz oluşturur.",
      typeCategory: 'acidbase',
      eq: 'HCl(suda) + NaOH(suda) → NaCl(suda) + H₂O(sıvı) + Isı',
      netIonic: 'H⁺(suda) + OH⁻(suda) → H₂O(sıvı)',
      spectators: 'Na⁺(suda) ve Cl⁻(suda)',
      products: 'NaCl(suda) + H₂O(sıvı) + Isı',
      mainProductSymbol: 'NaCl + H₂O',
      obs: ['temp'],
      tempInit: 22.0, tempFinal: 44.5, hasTempRise: true,
      macroReactantsText: 'Renksiz, şeffaf asit ve baz çözeltileri karıştırılmadan önce ayrı beherlerde oda sıcaklığında bulunur.',
      macroProductsText: 'Maddeler birleştiğinde renk değişimi veya çökelti oluşmaz, ancak güçlü ekzotermik nötrleşme ısısıyla dijital termometrede sıcaklık 22.0°C\'den 44.5°C\'ye fırlar.',
      microReactantsNote: 'HCl suda serbest H⁺ ve Cl⁻ iyonlarına, NaOH ise Na⁺ ve OH⁻ iyonlarına tamamen ayrışmıştır.',
      microProductsNote: 'Serbest H⁺ ve OH⁻ iyonları birleşerek kararlı kovalent su (H₂O) moleküllerini oluşturur. Na⁺ ve Cl⁻ seyirci olarak kalır.'
    },

    // 24. HCl + NH3
    'HCl|NH3': {
      title: 'Asit - Baz Amonyum Klorür Nötrleşmesi',
      canonical: 'B — Asit–baz tepkimesi',
      typeCategories: ["acidbase"],
      pedagogicalNote: "Kuvvetli asit HCl, zayıf baz NH₃ molekülüne proton aktararak amonyum klorür (NH₄Cl) tuzu oluşturur.",
      typeCategory: 'acidbase',
      eq: 'HCl(suda) + NH₃(suda) → NH₄Cl(suda) + Isı',
      netIonic: 'H⁺(suda) + NH₃(suda) → NH₄⁺(suda)',
      spectators: 'Cl⁻(suda)',
      products: 'NH₄Cl(suda) + Isı',
      mainProductSymbol: 'NH₄Cl',
      obs: ['temp'],
      tempInit: 22.0, tempFinal: 36.0, hasTempRise: true,
      macroReactantsText: 'İki berrak ve renksiz çözelti tepkime için hazır bekler.',
      macroProductsText: 'Görünür renk veya çökelti değişimi olmamasına rağmen dijital termometrede 36.0°C sıcaklık yükselmesi ölçülür.',
      microReactantsNote: 'HCl\'den gelen serbest H⁺ protonları ile NH₃ üzerindeki ortaklanmamış elektron çifti etkileşir.',
      microProductsNote: 'Proton transferiyle dörtyüzlü amonyum (NH₄⁺) katyonu ve klorür (Cl⁻) tuzu oluşur.'
    },

    // 25. AgNO3 + HCl
    'AgNO3|HCl': {
      title: 'Gümüş Klorür Süt Beyazı Çökelmesi',
      canonical: 'A — Çökelme tepkimesi',
      typeCategories: ["ppt"],
      pedagogicalNote: "Ag⁺ ve Cl⁻ iyonları anında birleşerek suda tamamen çözünmez süt beyazı AgCl katısını çöktürür.",
      typeCategory: 'ppt',
      eq: 'AgNO₃(suda) + HCl(suda) → AgCl(katı, süt beyazı)↓ + HNO₃(suda)',
      netIonic: 'Ag⁺(suda) + Cl⁻(suda) → AgCl(katı, beyaz)↓',
      spectators: 'H⁺(suda) ve NO₃⁻(suda)',
      products: 'AgCl(katı, süt beyazı çökelti) + HNO₃(suda)',
      mainProductSymbol: 'AgCl(k)',
      obs: ['precipitate'],
      precipColor: '#ffffff',
      tempInit: 22.0, tempFinal: 22.5, hasTempRise: false,
      macroReactantsText: 'Berrak renksiz gümüş nitrat ile berrak hidroklorik asit çözeltisi masada hazırdır.',
      macroProductsText: 'Sıvılar karıştığında anında süt beyazı, opak ve çöken bir katı AgCl tortusu meydana gelir.',
      microReactantsNote: 'Ag⁺, NO₃⁻, H⁺ ve Cl⁻ iyonları çözeltide birbirinden bağımsız hareket eder.',
      microProductsNote: 'Gümüş katyonları ve klorür anyonları hızla kenetlenerek suda çözünmeyen kübik AgCl kristal kafesini oluşturur.'
    },

    // 26. Cu(NO3)2 + HCl
    'Cu(NO3)2|HCl': {
      title: 'Klorokompleks Denge Oluşumu ve Renk Değişimi',
      canonical: 'D — Kompleksleşme tepkimesi',
      typeCategories: ["complex"],
      pedagogicalNote: "Bakır(II) katyonları klorür ligandlarıyla sarı-yeşil renkli tetraklorokuprat(II) [CuCl₄]²⁻ koordinasyon kompleksini kurar.",
      typeCategory: 'complex',
      eq: '[Cu(H₂O)₆]²⁺(suda, mavi) + 4HCl(suda) ⇌ [CuCl₄]²⁻(suda, yeşil/sarı) + 4H⁺(suda) + 6H₂O(sıvı)',
      netIonic: 'Cu²⁺(suda) + 4Cl⁻(suda) ⇌ [CuCl₄]²⁻(suda)',
      spectators: 'NO₃⁻(suda) ve H⁺(suda)',
      products: '[CuCl₄]²⁻(suda, yeşil klorokompleks çözelti)',
      mainProductSymbol: '[CuCl₄]²⁻',
      obs: ['color'],
      toColor: '#15803d',
      tempInit: 22.0, tempFinal: 23.0, hasTempRise: false,
      macroReactantsText: 'Açık mavi bakır çözeltisi ile renksiz asit çözeltisi masadadır.',
      macroProductsText: 'Çözeltiler birleştiğinde klorür iyonlarının ligand etkisiyle renk maviden yeşilimsi tona kayar; çökelti oluşmaz.',
      microReactantsNote: 'Cu²⁺ katyonlarının etrafındaki su molekülleri yüksek derişimli Cl⁻ iyonlarıyla yer değiştirir.',
      microProductsNote: 'Dörtyüzlü [CuCl₄]²⁻ koordinasyon kompleksi oluşur.'
    },

    // 27. HCl + Na2CO3
    'HCl|Na2CO3': {
      title: 'Asit - Karbonat Gaz Çıkışı ve Nötrleşme',
      canonical: 'B — Asit–baz tepkimesi',
      typeCategories: ["acidbase"],
      pedagogicalNote: "Kuvvetli asit ile bazik karbonat tozu arasındaki şiddetli proton transferidir; CO₂ gazı ve su açığa çıkar.",
      typeCategory: 'acidbase',
      eq: '2HCl(suda) + Na₂CO₃(katı) → 2NaCl(suda) + H₂O(sıvı) + CO₂(gaz)↑ + Isı',
      netIonic: 'CO₃²⁻(katı) + 2H⁺(suda) → CO₂(gaz)↑ + H₂O(sıvı)',
      spectators: 'Na⁺(suda) ve Cl⁻(suda)',
      products: '2NaCl(suda) + H₂O(sıvı) + CO₂(gaz) + Isı',
      mainProductSymbol: '2NaCl + H₂O + CO₂',
      obs: ['gas', 'temp'],
      tempInit: 22.0, tempFinal: 38.5, hasTempRise: true,
      macroReactantsText: 'Renksiz berrak hidroklorik asit ile beyaz kristal toz formundaki sodyum karbonat hazır bekler.',
      macroProductsText: 'Maddeler temas ettiği anda beherde şiddetli bir köpürme meydana gelir, yoğun CO₂ gaz kabarcıkları havaya yükselir ve sıcaklık 38.5°C\'ye çıkar.',
      microReactantsNote: 'HCl çözeltisindeki serbest H⁺ iyonları ile katı Na₂CO₃ kristalindeki düzlemsel CO₃²⁻ anyonları temas eder.',
      microProductsNote: 'Proton transferiyle karbonat derhal doğrusal apolar CO₂ gazı ve kovalent H₂O moleküllerine ayrışır.'
    },

    // 28. CaCl2 + NaOH
    'CaCl2|NaOH': {
      title: 'Kalsiyum Hidroksit Çökelmesi',
      canonical: 'A — Çökelme tepkimesi ve B — Asit–baz tepkimesi',
      typeCategories: ["ppt","acidbase"],
      pedagogicalNote: "Ca²⁺ katyonları hidroksit (OH⁻) ile birleşerek beyaz Ca(OH)₂ katısını çöktürür (Çökelme); süreç bazik iyon etkileşimidir (Asit–Baz).",
      typeCategory: 'ppt',
      eq: 'CaCl₂(suda) + 2NaOH(suda) → Ca(OH)₂(katı, beyaz)↓ + 2NaCl(suda)',
      netIonic: 'Ca²⁺(suda) + 2OH⁻(suda) → Ca(OH)₂(katı, beyaz)↓',
      spectators: 'Na⁺(suda) ve Cl⁻(suda)',
      products: 'Ca(OH)₂(katı, beyaz çökelti) + 2NaCl(suda)',
      mainProductSymbol: 'Ca(OH)₂(k)',
      obs: ['precipitate'],
      precipColor: '#ffffff',
      tempInit: 22.0, tempFinal: 23.0, hasTempRise: false,
      macroReactantsText: 'İki renksiz ve berrak çözelti masada beklemektedir.',
      macroProductsText: 'Karışım gerçekleştikten sonra çözeltide beyaz renkli Ca(OH)₂ çökeltisi belirir.',
      microReactantsNote: 'Ca²⁺ katyonları ile bazdan gelen serbest OH⁻ anyonları sulu ortamda karşılaşır.',
      microProductsNote: 'İyonlar elektrostatik çekimle suda az çözünen Ca(OH)₂ kristal kafesini oluşturur.'
    },

    // 29. AgNO3 + CaCl2
    'AgNO3|CaCl2': {
      title: 'Kalsiyum Klorür ile Gümüş Klorür Çökelmesi',
      canonical: 'A — Çökelme tepkimesi',
      typeCategories: ["ppt"],
      pedagogicalNote: "Gümüş ve klorür iyonları temas ettiği anda süt beyazı AgCl katısı çökelir.",
      typeCategory: 'ppt',
      eq: '2AgNO₃(suda) + CaCl₂(suda) → 2AgCl(katı, beyaz)↓ + Ca(NO₃)₂(suda)',
      netIonic: 'Ag⁺(suda) + Cl⁻(suda) → AgCl(katı, beyaz)↓',
      spectators: 'Ca²⁺(suda) ve NO₃⁻(suda)',
      products: 'AgCl(katı, beyaz çökelti) + Ca(NO₃)₂(suda)',
      mainProductSymbol: 'AgCl(k)',
      obs: ['precipitate'],
      precipColor: '#ffffff',
      tempInit: 22.0, tempFinal: 22.0, hasTempRise: false,
      macroReactantsText: 'İki renksiz, şeffaf tuz çözeltisi deney için hazırlanmıştır.',
      macroProductsText: 'Çözeltiler birleştiğinde derhal yoğun beyaz AgCl çökelmesi gerçekleşir.',
      microReactantsNote: 'Ag⁺, NO₃⁻, Ca²⁺ ve Cl⁻ iyonları su molekülleri arasında solvatize haldedir.',
      microProductsNote: 'Ag⁺ ve Cl⁻ iyonları elektrostatik çekimle katı AgCl kafesini kurarken, Ca²⁺ ve NO₃⁻ seyirci iyon olarak kalır.'
    },

    // 30. CaCl2 + Na2CO3
    'CaCl2|Na2CO3': {
      title: 'Kalsiyum Karbonat (Tebeşir) Çökelmesi',
      canonical: 'A — Çökelme tepkimesi',
      typeCategories: ["ppt"],
      pedagogicalNote: "Ca²⁺ ve CO₃²⁻ iyonları kenetlenerek beyaz tebeşir (CaCO₃) katısı halinde çöker.",
      typeCategory: 'ppt',
      eq: 'CaCl₂(suda) + Na₂CO₃(katı) → CaCO₃(katı, beyaz tebeşir)↓ + 2NaCl(suda)',
      netIonic: 'Ca²⁺(suda) + CO₃²⁻(suda) → CaCO₃(katı, beyaz)↓',
      spectators: 'Na⁺(suda) ve Cl⁻(suda)',
      products: 'CaCO₃(katı, beyaz tebeşir çökeltisi) + 2NaCl(suda)',
      mainProductSymbol: 'CaCO₃(k)',
      obs: ['precipitate'],
      precipColor: '#ffffff',
      tempInit: 22.0, tempFinal: 22.0, hasTempRise: false,
      macroReactantsText: 'Berrak kalsiyum klorür çözeltisi ile beyaz sodyum karbonat tozu hazır bekler.',
      macroProductsText: 'Maddeler birleştiğinde anında beyaz tebeşir çökeltisi (CaCO₃) oluşur ve dipte birikir.',
      microReactantsNote: 'Ca²⁺ ve serbest CO₃²⁻ anyonları sulu ortamda karşılaşır.',
      microProductsNote: 'Ca²⁺ ve CO₃²⁻ iyonları çözünürlüğü aşarak katı kalsit kristal kafesini kurar; Na⁺ ve Cl⁻ bağımsız kalır.'
    },

    // 31. AgNO3 + NaOH
    'AgNO3|NaOH': {
      title: 'Gümüş(I) Oksit Kahverengi-Siyah Çökelmesi',
      canonical: 'A — Çökelme tepkimesi ve B — Asit–baz tepkimesi',
      typeCategories: ["ppt","acidbase"],
      pedagogicalNote: "Ag⁺ katyonları hidroksit ile anında kahverengi Ag₂O katısı halinde çöker (Çökelme); süreç bazik hidroksit transferi içerir (Asit–Baz).",
      typeCategory: 'ppt',
      eq: '2AgNO₃(suda) + 2NaOH(suda) → Ag₂O(katı, kahverengi-siyah)↓ + 2NaNO₃(suda) + H₂O(sıvı) + Isı',
      netIonic: '2Ag⁺(suda) + 2OH⁻(suda) → Ag₂O(katı)↓ + H₂O(sıvı)',
      spectators: 'Na⁺(suda) ve NO₃⁻(suda)',
      products: 'Ag₂O(katı, kahverengi-siyah çökelti) + 2NaNO₃(suda) + H₂O(sıvı)',
      mainProductSymbol: 'Ag₂O(k)',
      obs: ['precipitate', 'color', 'temp'],
      precipColor: '#451a03',
      toColor: '#78350f',
      tempInit: 22.0, tempFinal: 26.5, hasTempRise: true,
      macroReactantsText: 'İki renksiz, berrak sıvı deney için hazırlanmıştır.',
      macroProductsText: 'Maddeler karıştırıldığında derhal koyu kahverengi/siyah renkli Ag₂O çökeltisi oluşur ve hafif sıcaklık artışı gözlenir.',
      microReactantsNote: 'Serbest Ag⁺ ve serbest OH⁻ iyonları çözelti içerisinde temas eder.',
      microProductsNote: 'Oluşan kararsız gümüş hidroksit anında su kaybederek koyu renkli Ag₂O kristal kafesini kurar.'
    },

    // 32. Cu(NO3)2 + NaOH
    'Cu(NO3)2|NaOH': {
      title: 'Bakır(II) Hidroksit Mavi Jel Çökelmesi',
      canonical: 'A — Çökelme tepkimesi ve B — Asit–baz tepkimesi',
      typeCategories: ["ppt","acidbase"],
      pedagogicalNote: "Cu²⁺ katyonları kuvvetli bazdan gelen OH⁻ ile mavi jel Cu(OH)₂ katısını oluşturarak çöker (Çökelme); süreç baz-katyon etkileşimidir (Asit–Baz).",
      typeCategory: 'ppt',
      eq: 'Cu(NO₃)₂(suda) + 2NaOH(suda) → Cu(OH)₂(katı, koyu mavi jel)↓ + 2NaNO₃(suda)',
      netIonic: 'Cu²⁺(suda) + 2OH⁻(suda) → Cu(OH)₂(katı, mavi)↓',
      spectators: 'Na⁺(suda) ve NO₃⁻(suda)',
      products: 'Cu(OH)₂(katı, koyu mavi jel çökelti) + 2NaNO₃(suda)',
      mainProductSymbol: 'Cu(OH)₂(k)',
      obs: ['precipitate', 'color'],
      precipColor: '#1d78e3',
      toColor: '#1e40af',
      tempInit: 22.0, tempFinal: 23.5, hasTempRise: false,
      macroReactantsText: 'Açık mavi renkli bakır(II) nitrat çözeltisi ile renksiz kostik bazı bulunur.',
      macroProductsText: 'Maddeler birleştiğinde açık mavi berrak sıvı derhal jel kıvamında koyu mavi bir katı çökeltiye dönüşür.',
      microReactantsNote: 'Sulu ortamda Cu²⁺ hidrat iyonları ile bazdan gelen serbest OH⁻ iyonları dağılmıştır.',
      microProductsNote: 'Cu²⁺ iyonları OH⁻ iyonlarıyla koordine olarak suda çözünmeyen polimerik ağ yapılı Cu(OH)₂ katısını kurar.'
    },

    // 33. AgNO3 + NH3
    'AgNO3|NH3': {
      title: 'Diammingümüş(I) Kompleks İyon Oluşumu',
      canonical: 'D — Kompleksleşme tepkimesi ve A — Çökelme tepkimesi',
      typeCategories: ["complex","ppt"],
      pedagogicalNote: "İlk damlalarda Ag₂O çökeltisi oluşur (Çökelme); amonyak fazlasında bu çökelti çözünerek berrak [Ag(NH₃)₂]⁺ koordinasyon kompleksine dönüşür (Kompleksleşme).",
      typeCategory: 'complex',
      eq: 'AgNO₃(suda) + 2NH₃(suda) ⇌ [Ag(NH₃)₂]NO₃(suda)',
      netIonic: 'Ag⁺(suda) + 2NH₃(suda) ⇌ [Ag(NH₃)₂]⁺(suda)',
      spectators: 'NO₃⁻(suda)',
      products: '[Ag(NH₃)₂]⁺(suda, berrak kompleks çözelti)',
      mainProductSymbol: '[Ag(NH₃)₂]⁺',
      obs: ['none'],
      tempInit: 22.0, tempFinal: 22.5, hasTempRise: false,
      macroReactantsText: 'İki berrak ve renksiz çözelti deney masasında hazırdır.',
      macroProductsText: 'Maddeler karıştırıldığında çözelti tamamen berrak ve renksiz kalır; kompleks iyon çözünür durumdadır.',
      microReactantsNote: 'Ag⁺ katyonları ile serbest elektron çifti taşıyan NH₃ molekülleri karşılaşır.',
      microProductsNote: 'İki adet NH₃ ligandı Ag⁺ iyonuna koordine kovalent bağlarla bağlanarak doğrusal [Ag(NH₃)₂]⁺ kompleksi kurar.'
    },

    // 34. Cu(NO3)2 + NH3
    'Cu(NO3)2|NH3': {
      title: 'Tetraaminbakır(II) Kompleks İyon Oluşumu',
      canonical: 'D — Kompleksleşme tepkimesi ve A — Çökelme tepkimesi',
      typeCategories: ["complex","ppt"],
      pedagogicalNote: "Amonyak eklendiğinde önce açık mavi Cu(OH)₂ katısı çöker (Çökelme); amonyak ilavesiyle çökelti çözünerek koyu safir mavisi [Cu(NH₃)₄]²⁺ kompleksine dönüşür (Kompleksleşme).",
      typeCategory: 'complex',
      eq: 'Cu(NO₃)₂(suda) + 4NH₃(suda) → [Cu(NH₃)₄](NO₃)₂(suda, derin safir)',
      netIonic: 'Cu²⁺(suda) + 4NH₃(suda) → [Cu(NH₃)₄]²⁺(suda, safir)',
      spectators: 'NO₃⁻(suda)',
      products: '[Cu(NH₃)₄]²⁺ (koyu safir lacivert çözelti)',
      mainProductSymbol: '[Cu(NH₃)₄]²⁺',
      obs: ['color'],
      toColor: '#0a1d63',
      tempInit: 22.0, tempFinal: 25.0, hasTempRise: false,
      macroReactantsText: 'Açık gök mavisi bakır çözeltisi ile renksiz amonyak çözeltisi masada bekler.',
      macroProductsText: 'Amonyak eklendiği anda çözelti aniden büyüleyici bir koyu safir lacivert renge bürünür; hiçbir çökelti oluşmaz.',
      microReactantsNote: 'Cu²⁺ katyonları ve serbest elektron çifti barındıran piramidal NH₃ molekülleri mevcuttur.',
      microProductsNote: 'Dört adet NH₃ molekülü ligand olarak elektron çiftleriyle Cu²⁺ iyonuna koordine kovalent bağlanarak kare düzlem safir kompleksi oluşturur.'
    },

    // 35. AgNO3 + Na2CO3
    'AgNO3|Na2CO3': {
      title: 'Gümüş Karbonat Soluk Sarı Çökelmesi',
      canonical: 'A — Çökelme tepkimesi',
      typeCategories: ["ppt"],
      pedagogicalNote: "Ag⁺ katyonları karbonat ile birleşerek suda çözünmeyen sarımsı-beyaz Ag₂CO₃ katısını çöktürür.",
      typeCategory: 'ppt',
      eq: '2AgNO₃(suda) + Na₂CO₃(katı) → Ag₂CO₃(katı, soluk sarı)↓ + 2NaNO₃(suda)',
      netIonic: '2Ag⁺(suda) + CO₃²⁻(suda) → Ag₂CO₃(katı, soluk sarı)↓',
      spectators: 'Na⁺(suda) ve NO₃⁻(suda)',
      products: 'Ag₂CO₃(katı, soluk sarı çökelti) + 2NaNO₃(suda)',
      mainProductSymbol: 'Ag₂CO₃(k)',
      obs: ['precipitate', 'color'],
      precipColor: '#fef08a',
      toColor: '#fef9c3',
      tempInit: 22.0, tempFinal: 22.0, hasTempRise: false,
      macroReactantsText: 'Renksiz gümüş çözeltisi ile katı beyaz sodyum karbonat tozu hazırlanmıştır.',
      macroProductsText: 'Maddeler birleştiğinde anında soluk sarı-krem renkli bir Ag₂CO₃ çökeltisi oluşur.',
      microReactantsNote: 'Serbest Ag⁺ katyonları ile suda çözünen serbest CO₃²⁻ anyonları bir araya gelir.',
      microProductsNote: 'Gümüş katyonları ve karbonat anyonları suda çözünmeyen katı kristal kafesini kurar.'
    },

    // 36. Cu(NO3)2 + Na2CO3
    'Cu(NO3)2|Na2CO3': {
      title: 'Bazik Bakır(II) Karbonat Çökelmesi ve Gaz Çıkışı',
      canonical: 'A — Çökelme tepkimesi ve B — Asit–baz tepkimesi',
      typeCategories: ["ppt","acidbase"],
      pedagogicalNote: "Bakır(II) iyonları yeşil renkli bazik bakır karbonat [Cu₂CO₃(OH)₂] katısını çöktürür (Çökelme); sulu ortamdaki hidroliz dengesi sonucu CO₂ gazı açığa çıkar (Asit–Baz).",
      typeCategory: 'ppt',
      eq: '2Cu(NO₃)₂(suda) + 2Na₂CO₃(katı) + H₂O(sıvı) → Cu₂CO₃(OH)₂(katı, mavi-yeşil)↓ + 4NaNO₃(suda) + CO₂(gaz)↑',
      netIonic: '2Cu²⁺(suda) + 2CO₃²⁻(suda) + H₂O(sıvı) → Cu₂CO₃(OH)₂(katı)↓ + CO₂(gaz)↑',
      spectators: 'Na⁺(suda) ve NO₃⁻(suda)',
      products: 'Cu₂CO₃(OH)₂(katı, mavi-yeşil çökelti) + CO₂(gaz) + 4NaNO₃(suda)',
      mainProductSymbol: 'Cu₂CO₃(OH)₂(k)',
      obs: ['precipitate', 'gas', 'color'],
      precipColor: '#0d9488',
      toColor: '#0f766e',
      tempInit: 22.0, tempFinal: 23.0, hasTempRise: false,
      macroReactantsText: 'Berrak mavi bakır(II) nitrat çözeltisi ile beyaz sodyum karbonat tozu masadadır.',
      macroProductsText: 'Karışım anında mavi-yeşil renkli katı çökelti oluşturur ve hafif CO₂ gaz kabarcıkları açığa çıkar.',
      microReactantsNote: 'Cu²⁺ hidrat iyonları ile karbonat ve su molekülleri temas eder.',
      microProductsNote: 'Cu²⁺ iyonları bazik karbonat yapısını kurarak çökerken, karbonatın bir kısmı CO₂ gazına dönüşür.'
    }
  };

  /* ----------------- YARDIMCI FONKSİYONLAR ----------------- */
  function getReagent(id) {
    if (!id) return null;
    for (var i = 0; i < REAGENTS.length; i++) {
      if (REAGENTS[i].id === id) return REAGENTS[i];
    }
    return null;
  }

  function getReaction(r1Id, r2Id) {
    if (!r1Id || !r2Id) return null;
    var id1 = (typeof r1Id === 'object' && r1Id.id) ? r1Id.id : r1Id;
    var id2 = (typeof r2Id === 'object' && r2Id.id) ? r2Id.id : r2Id;
    var pair = [id1, id2].sort();
    var key = pair[0] + '|' + pair[1];

    if (REACTION_PAIRS[key]) {
      return REACTION_PAIRS[key];
    }

    var r1 = getReagent(r1Id);
    var r2 = getReagent(r2Id);
    return {
      title: 'Fiziksel Karışım (Kimyasal Tepkime Yok)',
      canonical: 'E — Bu koşullarda belirgin bir tepkime gözlenmez',
      typeCategory: 'none',
      typeCategories: ['none'],
      pedagogicalNote: 'Karıştırılan maddeler arasında herhangi bir çökelti, gaz çıkışı, renk veya sıcaklık farkı oluşmamıştır; tanecikler su içinde serbest solvatize kalarak yalnızca fiziksel temas gerçekleşmiştir.',
      eq: (r1 ? r1.f : 'Madde 1') + ' + ' + (r2 ? r2.f : 'Madde 2') + ' → Fiziksel Karışım (Belirgin Tepkime Yok)',
      netIonic: 'Tepkime gerçekleşmez; iyonlar ve moleküller çözelti ortamında bağımsız serbest kalır.',
      spectators: 'Tüm tanecikler bağımsızdır (Fiziksel Karışım)',
      products: 'Fiziksel Karışım: ' + (r1 ? r1.f : '') + ' ve ' + (r2 ? r2.f : '') + ' serbest tanecikleri',
      mainProductSymbol: 'Fiziksel Karışım',
      obs: ['none'],
      tempInit: 22.0,
      tempFinal: 22.0,
      hasTempRise: false,
      macroReactantsText: (r1 ? r1.name : '1. Madde') + ' ile ' + (r2 ? r2.name : '2. Madde') + ' deney masasında ayrı ayrı hazır bulunur.',
      macroProductsText: 'Maddeler karıştırıldığında herhangi bir renk değişimi, gaz kabarcığı, çökelti tortusu veya sıcaklık farkı gözlenmez. Maddeler birbiri içinde çözünmüş veya dağılmış olarak kalır.',
      microReactantsNote: 'Her iki reaktifin tanecikleri su molekülleri tarafından sarılmış (solvatize) bağımsız haldedir.',
      microProductsNote: 'Fiziksel Karışım Modeli: Maddeler arasında yeni bir kimyasal bağ kurulmamıştır. ' + (r1 ? r1.name : '') + ' ve ' + (r2 ? r2.name : '') + ' tanecikleri su molekülleri arasında bağımsız ve serbest olarak solvatize halde kalmaya devam eder.'
    };
  }

  function foldTR(s) {
    if (!s) return '';
    return String(s).toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function matchReactionType(userInput, expectedCategory) {
    var norm = foldTR(userInput);
    if (!norm) return false;
    if (expectedCategory === 'ppt') return /cokel/.test(norm) || /cokelti/.test(norm) || /tortu/.test(norm) || /^a\b/.test(norm);
    if (expectedCategory === 'acidbase') return /asit/.test(norm) || /baz/.test(norm) || /notrles/.test(norm) || /^b\b/.test(norm);
    if (expectedCategory === 'redox') return (/indirgen/.test(norm) && /yukseltgen/.test(norm)) || /redoks/.test(norm) || /redox/.test(norm) || /^c\b/.test(norm);
    if (expectedCategory === 'complex') return /kompleks/.test(norm) || /koordinasyon/.test(norm) || /^d\b/.test(norm);
    if (expectedCategory === 'none') return /belirgin/.test(norm) || /gozlenmez/.test(norm) || /gerceklesmez/.test(norm) || /fiziksel/.test(norm) || /^e\b/.test(norm);
    return false;
  }
  /* ----------------- 5. ÇOKLU TEPKİME TÜRÜ VE PEDAGOJİK DEĞERLENDİRME MOTORU ----------------- */
  var OPTION_CAT_MAP = {
    'A': 'ppt',
    'B': 'acidbase',
    'C': 'redox',
    'D': 'complex',
    'E': 'none'
  };

  var CAT_NAME_MAP = {
    'ppt': 'A — Çökelme tepkimesi',
    'acidbase': 'B — Asit–baz tepkimesi',
    'redox': 'C — Yükseltgenme–indirgenme (redoks) tepkimesi',
    'complex': 'D — Kompleksleşme tepkimesi',
    'none': 'E — Bu koşullarda belirgin bir tepkime gözlenmez'
  };

  function getCategoryFromOption(optStr) {
    if (!optStr) return null;
    var letter = String(optStr).trim().charAt(0).toUpperCase();
    return OPTION_CAT_MAP[letter] || null;
  }

  function evaluateReactionTypes(selectedOptions, rx) {
    if (!selectedOptions || selectedOptions.length === 0) {
      return {
        status: 'empty',
        correct: false,
        userCategories: [],
        validCategories: (rx && rx.typeCategories) ? rx.typeCategories : [(rx && rx.typeCategory) || 'none'],
        explanation: 'Lütfen deneysel gözlem ve bulgularınızı dikkate alarak uygun gördüğünüz seçeneği / seçenekleri işaretleyiniz.'
      };
    }

    var validCats = (rx && rx.typeCategories && rx.typeCategories.length > 0)
      ? rx.typeCategories
      : [rx && rx.typeCategory ? rx.typeCategory : 'none'];

    var userCats = [];
    for (var i = 0; i < selectedOptions.length; i++) {
      var cat = getCategoryFromOption(selectedOptions[i]);
      if (cat && userCats.indexOf(cat) === -1) {
        userCats.push(cat);
      }
    }

    var invalidCats = [];
    var matchedCats = [];
    for (var i = 0; i < userCats.length; i++) {
      if (validCats.indexOf(userCats[i]) > -1) {
        matchedCats.push(userCats[i]);
      } else {
        invalidCats.push(userCats[i]);
      }
    }

    var missedCats = [];
    for (var i = 0; i < validCats.length; i++) {
      if (userCats.indexOf(validCats[i]) === -1) {
        missedCats.push(validCats[i]);
      }
    }

    var note = (rx && rx.pedagogicalNote) ? (' ' + rx.pedagogicalNote) : '';

    // Durum 1: Hiç hatalı/geçersiz seçenek yok
    if (invalidCats.length === 0) {
      if (missedCats.length === 0) {
        // Tam Doğru (Tüm geçerli türler eksiksiz seçildi)
        return {
          status: 'exact',
          correct: true,
          userCategories: userCats,
          validCategories: validCats,
          matchedCategories: matchedCats,
          missedCategories: [],
          title: 'Tam Doğru: ' + (rx ? rx.canonical : ''),
          explanation: (validCats.length > 1)
            ? ('Tebrikler! Deneyde gerçekleşen her iki kimyasal süreci de eksiksiz ve tam doğru tespit ettiniz: <b>' + rx.canonical + '</b>.' + (note ? ('<br><span style="margin-top:6px;display:inline-block;opacity:0.95;">' + note + '</span>') : ''))
            : ('Tebrikler! Kimyasal süreci doğru tespit ettiniz: <b>' + rx.canonical + '</b>.' + (note ? ('<br><span style="margin-top:6px;display:inline-block;opacity:0.95;">' + note + '</span>') : ''))
        };
      } else {
        // Kısmi Başarı (Doğru seçti ama çoklu reaksiyondaki diğer süreci kaçırdı)
        var matchedNames = matchedCats.map(function(c) { return CAT_NAME_MAP[c]; }).join(' ve ');
        var missedNames = missedCats.map(function(c) { return CAT_NAME_MAP[c]; }).join(' ve ');
        return {
          status: 'partial',
          correct: false,
          userCategories: userCats,
          validCategories: validCats,
          matchedCategories: matchedCats,
          missedCategories: missedCats,
          title: 'Kısmi Doğru Tespiti',
          explanation: 'Kısmi Doğru! Seçtiğiniz <b>' + matchedNames + '</b> tespiti bu deney için doğrudur. Ancak deneyde eşzamanlı olarak <b>' + missedNames + '</b> süreci de gerçekleşmektedir. Her iki seçeneği de işaretleyerek tam başarıya ulaşabilirsiniz!' + (note ? ('<br><span style="margin-top:6px;display:inline-block;opacity:0.95;">' + note + '</span>') : '')
        };
      }
    }

    // Durum 2: Seçimler içinde geçersiz seçenekler var
    if (userCats.indexOf('none') > -1 && validCats.indexOf('none') === -1) {
      return {
        status: 'wrong',
        correct: false,
        userCategories: userCats,
        validCategories: validCats,
        matchedCategories: matchedCats,
        missedCategories: missedCats,
        title: 'Gözden Geçiriniz',
        explanation: 'Bu deneyde belirgin kimyasal değişim kanıtları (çökelti, gaz, renk veya sıcaklık değişimi) gözlenmiştir; dolayısıyla fiziksel temas değildir. Bilimsel sınıflandırma: <b>' + rx.canonical + '</b>.' + (note ? ('<br><span style="margin-top:6px;display:inline-block;opacity:0.95;">' + note + '</span>') : '')
      };
    }

    if (matchedCats.length > 0) {
      var matchedNames = matchedCats.map(function(c) { return CAT_NAME_MAP[c]; }).join(' ve ');
      var invalidNames = invalidCats.map(function(c) { return CAT_NAME_MAP[c]; }).join(', ');
      return {
        status: 'wrong',
        correct: false,
        userCategories: userCats,
        validCategories: validCats,
        matchedCategories: matchedCats,
        missedCategories: missedCats,
        title: 'Gözden Geçiriniz',
        explanation: 'İşaretlediğiniz <b>' + matchedNames + '</b> tespiti bu deney için geçerlidir; ancak işaretlediğiniz <b>' + invalidNames + '</b> süreci bu reaksiyonda yer almaz. Doğru sınıflandırma: <b>' + rx.canonical + '</b>.' + (note ? ('<br><span style="margin-top:6px;display:inline-block;opacity:0.95;">' + note + '</span>') : '')
      };
    }

    var invalidNames = invalidCats.map(function(c) { return CAT_NAME_MAP[c]; }).join(', ');
    return {
      status: 'wrong',
      correct: false,
      userCategories: userCats,
      validCategories: validCats,
      matchedCategories: matchedCats,
      missedCategories: missedCats,
      title: 'Gözden Geçiriniz',
      explanation: 'Seçtiğiniz <b>' + invalidNames + '</b> bu deney için uygun değildir. Bu deneyin bilimsel karşılığı: <b>' + rx.canonical + '</b>.' + (note ? ('<br><span style="margin-top:6px;display:inline-block;opacity:0.95;">' + note + '</span>') : '')
    };
  }


  // Global erişim
  window.MebiData = {
    REAGENTS: REAGENTS,
    OBS: OBS,
    QUIZ_OPTIONS: QUIZ_OPTIONS,
    REACTION_PAIRS: REACTION_PAIRS,
    getReagent: getReagent,
    getReaction: getReaction,
    foldTR: foldTR,
    matchReactionType: matchReactionType,
    evaluateReactionTypes: evaluateReactionTypes
  };

})(window);
