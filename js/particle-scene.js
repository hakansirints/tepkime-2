import * as THREE from 'three';

const CPK = {
  H: 0xffffff, C: 0x909090, N: 0x3050f8, O: 0xff0d0d, Na: 0xab5cf2,
  S: 0xffff30, Cl: 0x1ff01f, K: 0x8f40d4, Ca: 0x3dff00, Mn: 0x9c7ac7,
  Fe: 0xe06633, Cu: 0xc88033, Zn: 0x7d80b0, Ag: 0xc0c0c0, I: 0x940094,
  Ba: 0x00c900, Pb: 0x575961
};

const ATOM_RADII = { H:0.20, C:0.29, N:0.29, O:0.28, Cl:0.35, Na:0.36, K:0.40, Ca:0.36, Mn:0.34, Fe:0.34, Cu:0.34, Zn:0.34, Ag:0.38, I:0.40, Ba:0.41, Pb:0.39, S:0.33 };
const ION_CHARGES = {
  H:1, Na:1, K:1, Ag:1, Ca:2, Ba:2, Pb:2, Cu:2, Zn:2, Fe:2, Mn:2,
  Cl:-1, I:-1, O:-2, OH:-1, NO3:-1, HCO3:-1, CO3:-2, SO4:-2, NH4:1
};

const REAGENT_ELEMENTS = {
  NaHCO3:['Na','H','C','O'], H2O2:['H','O'], KI:['K','I'], 'Pb(NO3)2':['Pb','N','O'],
  CaCO3:['Ca','C','O'], HCl:['H','Cl'], CaCl2:['Ca','Cl'], NaOH:['Na','O','H'],
  NH3:['N','H'], 'Cu(NO3)2':['Cu','N','O'], Na2CO3:['Na','C','O'], MnO2:['Mn','O'],
  AgNO3:['Ag','N','O'], NaCl:['Na','Cl'], BaCl2:['Ba','Cl'], Na2SO4:['Na','S','O'],
  CuSO4:['Cu','S','O'], Zn:['Zn'], Cu:['Cu'], Fe:['Fe']
};

const ION_LABELS = {
  Na:'Na⁺', K:'K⁺', Ag:'Ag⁺', H:'H⁺', NH4:'NH₄⁺',
  Ca:'Ca²⁺', Ba:'Ba²⁺', Pb:'Pb²⁺', Cu:'Cu²⁺', Zn:'Zn²⁺', Fe:'Fe²⁺', Mn:'Mn²⁺',
  Cl:'Cl⁻', I:'I⁻', OH:'OH⁻', NO3:'NO₃⁻', HCO3:'HCO₃⁻',
  CO3:'CO₃²⁻', SO4:'SO₄²⁻', O:'O²⁻'
};

function createIonLabelSprite(text) {
  if (typeof document === 'undefined' || !document.createElement) return null;
  const canvas = document.createElement('canvas');
  if (!canvas || !canvas.getContext) return null;
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx || !ctx.fillText) return null;
  ctx.clearRect(0, 0, 256, 128);
  ctx.font = '700 48px "JetBrains Mono", "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#2563eb';
  ctx.fillText(text, 128, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.64, 0.32, 1);
  return sprite;
}

const viewers = new Set();
let animationFrame = 0;
let modalViewer = null;

function materialFor(symbol) {
  return new THREE.MeshStandardMaterial({
    color: CPK[symbol] || 0x7c8f84,
    roughness: 0.28,
    metalness: ['Ag','Cu','Zn','Fe'].includes(symbol) ? 0.55 : 0.05,
    emissive: CPK[symbol] || 0x7c8f84,
    emissiveIntensity: 0
  });
}

function atom(symbol, radius = ATOM_RADII[symbol] || 0.30) {
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, 28, 20), materialFor(symbol));
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  return sphere;
}

function bondCylinder(a, b, parent, offset, radius = 0.038) {
  const direction = b.clone().sub(a);
  const length = direction.length();
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, length, 12),
    new THREE.MeshStandardMaterial({ color: 0xaebbb4, roughness: 0.48, metalness: 0.08 })
  );
  mesh.position.copy(a).add(b).multiplyScalar(0.5).add(offset || new THREE.Vector3());
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  parent.add(mesh);
}

function bond(a, b, parent, order = 1, scale = 1) {
  const radius = Math.max(0.018, 0.038 * scale);
  if (order <= 1) return bondCylinder(a, b, parent, null, radius);
  const direction = b.clone().sub(a).normalize();
  const reference = Math.abs(direction.z) < 0.9 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0);
  const perpendicular = new THREE.Vector3().crossVectors(direction, reference).normalize();
  const spacing = (order === 2 ? 0.065 : 0.09) * scale;
  for (let index = 0; index < order; index++) {
    const offset = perpendicular.clone().multiplyScalar((index - (order - 1) / 2) * spacing * 2);
    bondCylinder(a, b, parent, offset, radius);
  }
}

function molecularGroup(atoms, bonds, scale = 1) {
  const group = new THREE.Group();
  group.userData.selectableRoot = group;
  atoms.forEach(entry => {
    const position = new THREE.Vector3(...entry.position).multiplyScalar(scale);
    const item = atom(entry.symbol, (ATOM_RADII[entry.symbol] || 0.30) * scale);
    item.position.copy(position);
    group.add(item);
  });
  bonds.forEach(entry => bond(
    new THREE.Vector3(...atoms[entry[0]].position).multiplyScalar(scale),
    new THREE.Vector3(...atoms[entry[1]].position).multiplyScalar(scale),
    group,
    entry[2] || 1,
    scale
  ));
  return group;
}

const STRUCTURES = {
  H2O: {
    atoms:[{symbol:'O',position:[0,0,0]},{symbol:'H',position:[-0.55,0.43,0]},{symbol:'H',position:[0.55,0.43,0]}],
    bonds:[[0,1,1],[0,2,1]]
  },
  H2O2: {
    atoms:[{symbol:'H',position:[-1.05,0.35,0.25]},{symbol:'O',position:[-0.43,0,0]},{symbol:'O',position:[0.43,0,0]},{symbol:'H',position:[1.05,-0.35,0.25]}],
    bonds:[[0,1,1],[1,2,1],[2,3,1]]
  },
  NH3: {
    atoms:[{symbol:'N',position:[0,0.12,0]},{symbol:'H',position:[-0.58,-0.35,0.30]},{symbol:'H',position:[0.58,-0.35,0.30]},{symbol:'H',position:[0,-0.35,-0.60]}],
    bonds:[[0,1,1],[0,2,1],[0,3,1]]
  },
  CO2: {
    atoms:[{symbol:'O',position:[-0.78,0,0]},{symbol:'C',position:[0,0,0]},{symbol:'O',position:[0.78,0,0]}],
    bonds:[[0,1,2],[1,2,2]]
  },
  O2: {
    atoms:[{symbol:'O',position:[-0.38,0,0]},{symbol:'O',position:[0.38,0,0]}],
    bonds:[[0,1,2]]
  },
  Cl2: {
    atoms:[{symbol:'Cl',position:[-0.46,0,0]},{symbol:'Cl',position:[0.46,0,0]}],
    bonds:[[0,1,1]]
  },
  OH: {
    atoms:[{symbol:'O',position:[-0.28,0,0]},{symbol:'H',position:[0.38,0,0]}],
    bonds:[[0,1,1]]
  },
  NO3: {
    atoms:[{symbol:'N',position:[0,0,0]},{symbol:'O',position:[0,0.78,0]},{symbol:'O',position:[-0.68,-0.39,0]},{symbol:'O',position:[0.68,-0.39,0]}],
    bonds:[[0,1,2],[0,2,1],[0,3,1]]
  },
  CO3: {
    atoms:[{symbol:'C',position:[0,0,0]},{symbol:'O',position:[0,0.78,0]},{symbol:'O',position:[-0.68,-0.39,0]},{symbol:'O',position:[0.68,-0.39,0]}],
    bonds:[[0,1,2],[0,2,1],[0,3,1]]
  },
  HCO3: {
    atoms:[{symbol:'C',position:[0,0,0]},{symbol:'O',position:[0,0.78,0]},{symbol:'O',position:[-0.68,-0.39,0]},{symbol:'O',position:[0.68,-0.39,0]},{symbol:'H',position:[1.20,-0.05,0]}],
    bonds:[[0,1,2],[0,2,1],[0,3,1],[3,4,1]]
  },
  SO4: {
    atoms:[{symbol:'S',position:[0,0,0]},{symbol:'O',position:[0.68,0.42,0.46]},{symbol:'O',position:[-0.68,0.42,0.46]},{symbol:'O',position:[0,-0.62,0.62]},{symbol:'O',position:[0,-0.22,-0.82]}],
    bonds:[[0,1,2],[0,2,2],[0,3,1],[0,4,1]]
  },
  NH4: {
    atoms:[{symbol:'N',position:[0,0,0]},{symbol:'H',position:[0.52,0.40,0.42]},{symbol:'H',position:[-0.52,0.40,0.42]},{symbol:'H',position:[0,-0.52,0.48]},{symbol:'H',position:[0,-0.18,-0.68]}],
    bonds:[[0,1,1],[0,2,1],[0,3,1],[0,4,1]]
  },
  'CuCl4': {
    atoms:[{symbol:'Cu',position:[0,0,0]},{symbol:'Cl',position:[0.74,0.56,0.55]},{symbol:'Cl',position:[-0.74,0.56,0.55]},{symbol:'Cl',position:[0,-0.72,0.68]},{symbol:'Cl',position:[0,-0.28,-0.92]}],
    bonds:[[0,1,1],[0,2,1],[0,3,1],[0,4,1]]
  },
  'Ag(NH3)2': {
    atoms:[{symbol:'Ag',position:[0,0,0]},{symbol:'N',position:[-0.78,0,0]},{symbol:'N',position:[0.78,0,0]},{symbol:'H',position:[-1.12,0.48,0.26]},{symbol:'H',position:[-1.12,-0.48,0.26]},{symbol:'H',position:[-1.14,0,-0.50]},{symbol:'H',position:[1.12,0.48,0.26]},{symbol:'H',position:[1.12,-0.48,0.26]},{symbol:'H',position:[1.14,0,-0.50]}],
    bonds:[[0,1,1],[0,2,1],[1,3,1],[1,4,1],[1,5,1],[2,6,1],[2,7,1],[2,8,1]]
  },
  'Cu(NH3)4': {
    atoms:[{symbol:'Cu',position:[0,0,0]},{symbol:'N',position:[0.78,0,0]},{symbol:'N',position:[-0.78,0,0]},{symbol:'N',position:[0,0.78,0]},{symbol:'N',position:[0,-0.78,0]},{symbol:'H',position:[1.15,0.34,0.25]},{symbol:'H',position:[1.15,-0.34,0.25]},{symbol:'H',position:[1.15,0,-0.42]},{symbol:'H',position:[-1.15,0.34,0.25]},{symbol:'H',position:[-1.15,-0.34,0.25]},{symbol:'H',position:[-1.15,0,-0.42]},{symbol:'H',position:[0.34,1.15,0.25]},{symbol:'H',position:[-0.34,1.15,0.25]},{symbol:'H',position:[0,1.15,-0.42]},{symbol:'H',position:[0.34,-1.15,0.25]},{symbol:'H',position:[-0.34,-1.15,0.25]},{symbol:'H',position:[0,-1.15,-0.42]}],
    bonds:[[0,1,1],[0,2,1],[0,3,1],[0,4,1],[1,5,1],[1,6,1],[1,7,1],[2,8,1],[2,9,1],[2,10,1],[3,11,1],[3,12,1],[3,13,1],[4,14,1],[4,15,1],[4,16,1]]
  }
};

function structure(name, scale = 1) {
  const template = STRUCTURES[name];
  return template ? molecularGroup(template.atoms, template.bonds, scale) : null;
}

function singleIon(symbol, scale = 1, charge = 0) {
  const group = new THREE.Group();
  group.userData.selectableRoot = group;
  const ionicSize = charge > 0 ? 0.76 : charge < 0 ? 1.10 : 1;
  group.add(atom(symbol, (ATOM_RADII[symbol] || 0.30) * scale * ionicSize));
  return group;
}

function ionicSpecies(name, scale) {
  const charge = ION_CHARGES[name] || 0;
  const polyatomic = !!STRUCTURES[name];
  const group = polyatomic ? structure(name, scale) : singleIon(name, scale, charge);
  if (charge) {
    group.userData.freeIon = true;
    group.userData.driftPhase = name.length * 0.71;
  }
  return group;
}

const IONIC_SPECIES = {
  NaHCO3:['Na','HCO3'], KI:['K','I'], 'Pb(NO3)2':['Pb','NO3','NO3'], CaCO3:['Ca','CO3'],
  HCl:['H','Cl'], CaCl2:['Ca','Cl','Cl'], NaOH:['Na','OH'], 'Cu(NO3)2':['Cu','NO3','NO3'],
  Na2CO3:['Na','Na','CO3'], MnO2:['Mn','O','O'], AgNO3:['Ag','NO3'], NaCl:['Na','Cl'],
  BaCl2:['Ba','Cl','Cl'], Na2SO4:['Na','Na','SO4'], CuSO4:['Cu','SO4'], PbCO3:['Pb','CO3'],
  AgCl:['Ag','Cl'], BaSO4:['Ba','SO4'], CuCO3:['Cu','CO3'], ZnCl2:['Zn','Cl','Cl'],
  FeCl2:['Fe','Cl','Cl'], CuCl2:['Cu','Cl','Cl'], Ag2CO3:['Ag','Ag','CO3'],
  'Cu2CO3(OH)2':['Cu','Cu','CO3','OH','OH'], PbI2:['Pb','I','I'], AgI:['Ag','I'],
  CuI:['Cu','I'], PbCl2:['Pb','Cl','Cl'], 'Pb(OH)2':['Pb','OH','OH'],
  'Ca(OH)2':['Ca','OH','OH'], Ag2O:['Ag','Ag','O'], 'Cu(OH)2':['Cu','OH','OH'],
  NH4Cl:['NH4','Cl'], NaHO2:['Na','OH','O']
};

function normalizeFormula(formula) {
  const subscriptMap = { '₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9' };
  return String(formula || '')
    .replace(/[₀-₉]/g, digit => subscriptMap[digit])
    .replace(/<[^>]*>/g, '')
    .replace(/\((?:k|s|aq|g|l|çöz|gaz)\)$/i, '')
    .replace(/[\[\]]/g, '')
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]/g, '')
    .replace(/[+−\-]\d*$/g, '')
    .replace(/\s+/g, '');
}

function speciesObject(name, scale, separatedIons) {
  if (separatedIons && ION_CHARGES[name]) return ionicSpecies(name, scale);
  return structure(name, scale) || singleIon(name, scale, ION_CHARGES[name] || 0);
}

function formulaSpecies(formula, symbols) {
  const clean = normalizeFormula(formula);
  if (IONIC_SPECIES[clean]) return IONIC_SPECIES[clean];
  if (STRUCTURES[clean]) return [clean];
  const parts = String(formula || '').split(/\s+(?:ve|and)\s+|\s*\+\s*/i);
  const parsedSpecies = [];
  parts.forEach(part => {
    const normalized = normalizeFormula(part).replace(/^\d+/, '');
    if (/HCO3/.test(normalized)) parsedSpecies.push('HCO3');
    else if (/NO3/.test(normalized)) parsedSpecies.push('NO3');
    else if (/SO4/.test(normalized)) parsedSpecies.push('SO4');
    else if (/CO3/.test(normalized)) parsedSpecies.push('CO3');
    else if (/OH/.test(normalized)) parsedSpecies.push('OH');
    else {
      const symbol = (normalized.match(/[A-Z][a-z]?/) || [])[0];
      if (symbol && CPK[symbol] != null) parsedSpecies.push(symbol);
    }
  });
  if (parsedSpecies.length) return parsedSpecies;
  return (symbols && symbols.length ? symbols : ['H','O']).slice(0, 6);
}

function assemblyFor(descriptor) {
  const assembly = new THREE.Group();
  assembly.userData.selectableRoot = assembly;
  const clean = normalizeFormula(descriptor.formula);
  const covalent = STRUCTURES[clean];
  const species = formulaSpecies(clean, descriptor.symbols);
  const formulaParts = covalent ? [clean] : species;
  const count = formulaParts.length;
  const separatedIons = descriptor.mode === 'solution' && !covalent;
  for (let index = 0; index < count; index++) {
    const speciesName = formulaParts[index];
    const scale = covalent ? (count === 1 ? 1.02 : 0.82) : separatedIons ? (count > 3 ? 0.68 : 0.76) : (count > 4 ? 0.64 : 0.74);
    const item = speciesObject(speciesName, scale, separatedIons);
    if (separatedIons && ION_LABELS[speciesName]) {
      const sprite = createIonLabelSprite(ION_LABELS[speciesName]);
      if (sprite) {
        sprite.position.set(0, -0.42 * scale - 0.22, 0.05);
        item.add(sprite);
      }
    }
    item.traverse(object => { object.userData.selectableRoot = null; });
    if (count > 1) {
      const angle = (index / count) * Math.PI * 2 + Math.PI / 2;
      const radius = separatedIons ? (count === 2 ? 0.98 : count === 3 ? 1.14 : 1.30) : (count === 2 ? 0.88 : count === 3 ? 1.02 : 1.18);
      item.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.72, index % 2 ? 0.16 : -0.16);
    }
    item.rotation.set(index * 0.12, index * 0.24, index * 0.08);
    if (item.userData.freeIon) item.userData.basePosition = item.position.clone();
    assembly.add(item);
  }
  if (descriptor.mode === 'crystal') assembly.rotation.set(0.20, 0.30, 0.02);
  return assembly;
}

function productDescriptor(key, state, host) {
  const r1 = window.MebiData.getReagent(state.selectedSlot1);
  const r2 = window.MebiData.getReagent(state.selectedSlot2);
  const rx = state.activeReaction || window.MebiData.getReaction(state.selectedSlot1, state.selectedSlot2);
  if (key === 'r1' || key === 'r2') {
    const reagent = key === 'r2' ? r2 : r1;
    return { formula:reagent.id, symbols: REAGENT_ELEMENTS[reagent.id] || ['H','O'], mode: reagent.solid ? 'crystal' : 'solution' };
  }
  const physical = rx && (rx.typeCategory === 'none' || (rx.typeCategories || []).includes('none'));
  if (physical) {
    const reagent = key === 'p2' ? r2 : r1;
    return { formula:reagent.id, symbols: REAGENT_ELEMENTS[reagent.id] || ['H','O'], mode: reagent.solid ? 'crystal' : 'solution' };
  }
  const type = host.dataset.particleType || '';
  const typeSymbols = (type.match(/[A-Z][a-z]?/g) || []).filter(symbol => Object.prototype.hasOwnProperty.call(CPK, symbol));
  const hasPrecipitate = !!(rx && rx.obs && rx.obs.includes('precipitate'));
  const hasGas = !!(rx && rx.obs && rx.obs.includes('gas'));
  if (type === 'O2') return { formula:'O2', symbols:['O'], mode:'gas' };
  if (type === 'CO2') return { formula:'CO2', symbols:['O','C'], mode:'gas' };
  if (type === 'Cl2') return { formula:'Cl2', symbols:['Cl'], mode:'gas' };
  if (key === 'p1' && hasPrecipitate) return { formula:type, symbols:typeSymbols.length ? typeSymbols : [...(REAGENT_ELEMENTS[r1.id] || []), ...(REAGENT_ELEMENTS[r2.id] || [])].slice(0,4), mode:'crystal' };
  if (key === 'p2' && hasPrecipitate && hasGas) return { formula:type, symbols:typeSymbols.length ? typeSymbols : (REAGENT_ELEMENTS[r1.id] || ['O']).slice(-2), mode:'gas' };
  if (key === 'p1' && hasGas) return { formula:type, symbols:typeSymbols.length ? typeSymbols : (REAGENT_ELEMENTS[r1.id] || ['O']).slice(-2), mode:'gas' };
  return { formula:type, symbols:typeSymbols.length ? typeSymbols : [...(REAGENT_ELEMENTS[r1.id] || []), ...(REAGENT_ELEMENTS[r2.id] || [])].slice(0,5), mode:'solution' };
}

function buildModel(descriptor) {
  return assemblyFor(descriptor);
}

function setSelected(viewer, root) {
  if (viewer.selected === root) return;
  if (viewer.selected) viewer.selected.traverse(object => {
    if (object.material && 'emissiveIntensity' in object.material) object.material.emissiveIntensity = 0;
  });
  viewer.selected = root;
  if (root) root.traverse(object => {
    if (object.material && 'emissiveIntensity' in object.material) object.material.emissiveIntensity = 0.22;
  });
  viewer.host.classList.toggle('has-particle-selection', !!root);
}

function mount(host, key, state, modal = false) {
  if (!host || !state) return null;
  const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  host.replaceChildren(renderer.domElement);
  renderer.domElement.setAttribute('aria-label', host.getAttribute('aria-label') || 'Etkileşimli üç boyutlu tanecik modeli');
  renderer.domElement.setAttribute('role', 'img');

  const scene = new THREE.Scene();
  const descriptor = productDescriptor(key, state, host);
  const solutionIonView = descriptor.mode === 'solution' && !STRUCTURES[normalizeFormula(descriptor.formula)];
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 30);
  camera.position.set(0, 0.20, modal ? (solutionIonView ? 5.5 : 5.2) : (solutionIonView ? 5.0 : 4.6));
  scene.add(new THREE.HemisphereLight(0xffffff, 0x526158, 2.0));
  const light = new THREE.DirectionalLight(0xffffff, 2.4);
  light.position.set(3, 5, 5); light.castShadow = true; scene.add(light);
  const rim = new THREE.DirectionalLight(0x8ed8ff, 1.2);
  rim.position.set(-4, 1, -2); scene.add(rim);
  const model = buildModel(descriptor);
  scene.add(model);
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const viewer = { host, key, renderer, scene, camera, model, raycaster, pointer, selected:null, dragging:false, dragMode:'pan', pointerId:null, lastX:0, lastY:0, observer:null, handlers:{} };

  function resize() {
    const width = Math.max(1, host.clientWidth || (modal ? 720 : 360));
    const height = Math.max(1, host.clientHeight || (modal ? 360 : 190));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  function selectAt(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObject(model, true)[0];
    let root = hit && hit.object;
    while (root && !root.userData.selectableRoot && root !== model) root = root.parent;
    root = root && root.userData.selectableRoot ? root.userData.selectableRoot : null;
    setSelected(viewer, root);
    return !!root;
  }
  viewer.handlers.down = event => {
    event.preventDefault(); event.stopPropagation();
    viewer.dragMode = selectAt(event) ? 'rotate' : 'pan';
    viewer.dragging = true; viewer.pointerId = event.pointerId; viewer.lastX = event.clientX; viewer.lastY = event.clientY;
    renderer.domElement.setPointerCapture(event.pointerId);
  };
  viewer.handlers.move = event => {
    if (!viewer.dragging || event.pointerId !== viewer.pointerId) return;
    const dx = event.clientX - viewer.lastX, dy = event.clientY - viewer.lastY;
    if (viewer.dragMode === 'rotate' && viewer.selected) {
      viewer.selected.rotation.y += dx * 0.012;
      viewer.selected.rotation.x += dy * 0.012;
    } else {
      viewer.model.position.x = THREE.MathUtils.clamp(viewer.model.position.x + dx * 0.009, -1.8, 1.8);
      viewer.model.position.y = THREE.MathUtils.clamp(viewer.model.position.y - dy * 0.009, -1.25, 1.25);
    }
    viewer.lastX = event.clientX; viewer.lastY = event.clientY;
  };
  viewer.handlers.up = event => {
    if (event.pointerId !== viewer.pointerId) return;
    viewer.dragging = false; viewer.pointerId = null;
    if (renderer.domElement.hasPointerCapture(event.pointerId)) renderer.domElement.releasePointerCapture(event.pointerId);
  };
  viewer.handlers.wheel = event => {
    event.preventDefault(); event.stopPropagation();
    camera.position.z = THREE.MathUtils.clamp(camera.position.z + event.deltaY * 0.004, modal ? 2.8 : 3.2, 9);
  };
  viewer.handlers.click = event => event.stopPropagation();
  renderer.domElement.addEventListener('pointerdown', viewer.handlers.down);
  renderer.domElement.addEventListener('pointermove', viewer.handlers.move);
  renderer.domElement.addEventListener('pointerup', viewer.handlers.up);
  viewer.handlers.cancel = viewer.handlers.up;
  renderer.domElement.addEventListener('pointercancel', viewer.handlers.cancel);
  renderer.domElement.addEventListener('wheel', viewer.handlers.wheel, { passive:false });
  renderer.domElement.addEventListener('click', viewer.handlers.click);
  viewer.observer = new ResizeObserver(resize);
  viewer.observer.observe(host);
  resize();
  viewers.add(viewer);
  startAnimation();
  return viewer;
}

function disposeViewer(viewer) {
  if (!viewer) return;
  viewer.observer.disconnect();
  const canvas = viewer.renderer.domElement;
  Object.entries(viewer.handlers).forEach(([name, handler]) => {
    const eventName = name === 'down' ? 'pointerdown' : name === 'move' ? 'pointermove' : name === 'up' ? 'pointerup' : name === 'cancel' ? 'pointercancel' : name;
    canvas.removeEventListener(eventName, handler);
  });
  viewer.scene.traverse(object => {
    if (object.geometry) object.geometry.dispose();
    if (object.material) {
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach(material => { if (material.map) material.map.dispose(); material.dispose(); });
    }
  });
  viewer.renderer.dispose();
  viewers.delete(viewer);
}

function animate() {
  animationFrame = 0;
  const now = performance.now() * 0.00025;
  const driftTime = performance.now() * 0.001;
  viewers.forEach(viewer => {
    viewer.model.children.forEach((item, index) => {
      if (!item.userData.freeIon || !item.userData.basePosition) return;
      const base = item.userData.basePosition;
      const phase = item.userData.driftPhase + index * 1.83;
      item.position.set(
        base.x + Math.sin(driftTime * 0.62 + phase) * 0.045,
        base.y + Math.cos(driftTime * 0.48 + phase * 1.3) * 0.035,
        base.z + Math.sin(driftTime * 0.41 + phase * 0.7) * 0.038
      );
    });
    if (!viewer.dragging && !viewer.selected) viewer.model.rotation.y = Math.sin(now + viewer.key.length) * 0.08;
    viewer.renderer.render(viewer.scene, viewer.camera);
  });
  if (viewers.size) animationFrame = requestAnimationFrame(animate);
}

function startAnimation() {
  if (!animationFrame) animationFrame = requestAnimationFrame(animate);
}

function disposeCards() {
  [...viewers].filter(viewer => viewer !== modalViewer).forEach(disposeViewer);
}

function sync(state) {
  if (!state || state.screen !== 'micro') return;
  document.querySelectorAll('.particle-3d-host[data-particle-view]').forEach(host => {
    if (!host.querySelector('canvas')) mount(host, host.dataset.particleView, state, false);
  });
}

function mountModal(host, key, state) {
  if (modalViewer) disposeViewer(modalViewer);
  modalViewer = mount(host, key, state, true);
}

function disposeModal() {
  if (modalViewer) disposeViewer(modalViewer);
  modalViewer = null;
}

window.ParticleScene = { sync, disposeCards, mountModal, disposeModal };
if (window.TepkimeArenasi) sync(window.TepkimeArenasi.state);
