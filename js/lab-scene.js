import * as THREE from 'three';
window.THREE = THREE;
globalThis.THREE = THREE;
import { OrbitControls } from './vendor/three/OrbitControls.js';

const host = document.getElementById('labWorld');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
} catch (error) {
  console.warn('Laboratuvar WebGL görünümü başlatılamadı.', error);
}

if (renderer) initialize();

function initialize() {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerHeight < 650 ? 1.25 : 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
  host.addEventListener('contextmenu', (e) => e.preventDefault());
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#e7e6dd');
  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 60);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = true;
  controls.screenSpacePanning = true;
  controls.panSpeed = 0.8;
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN
  };
  controls.enableZoom = true;
  controls.zoomSpeed = 0.65;
  controls.minDistance = 1.1;
  controls.maxDistance = 7.7;
  controls.minPolarAngle = 0.45;
  controls.maxPolarAngle = 1.45;
  controls.minAzimuthAngle = -1.1;
  controls.maxAzimuthAngle = 1.1;
  controls.rotateSpeed = 0.45;
  const home = new THREE.Vector3(0.10, 2.40, 2.90);
  const focus = new THREE.Vector3(0, 1.84, 0.25);
  const closeViewPosition = new THREE.Vector3(-0.03, 2.07, 1.85);
  const closeViewFocus = new THREE.Vector3(-0.02, 1.70, 0.34);
  const roomView = new THREE.Vector3(3.8, 3.45, 5.5);
  const roomFocus = new THREE.Vector3(0, 1.60, -0.9);
  const viewFov = { desk: 40, closeup: 38, wide: 52 };
  // Keep the eye inside the floor footprint and clear of walls/ceiling.
  const cameraBounds = new THREE.Box3(
    new THREE.Vector3(-5.6, 1.6, -4.4), new THREE.Vector3(5.6, 4.55, 5.5));
  camera.position.copy(roomView);
  controls.target.copy(roomFocus);
  camera.fov = viewFov.wide;
  camera.updateProjectionMatrix();
  controls.update();

  const hemisphere = new THREE.HemisphereLight(0xf2ffff, 0x8a9191, 1.7);
  scene.add(hemisphere);
  const sunlight = new THREE.DirectionalLight(0xfff4dc, 2.2);
  sunlight.position.set(-3.5, 7.5, 4);
  sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(1024, 1024);
  Object.assign(sunlight.shadow.camera, { left: -6, right: 6, top: 5, bottom: -5, near: 0.5, far: 18 });
  sunlight.shadow.normalBias = 0.035;
  sunlight.shadow.bias = -0.0002;
  scene.add(sunlight);
  const fill = new THREE.DirectionalLight(0xd9f6fa, 0.8);
  fill.position.set(5, 4, -1);
  scene.add(fill);

  const environmentCanvas = document.createElement('canvas');
  environmentCanvas.width = 512;
  environmentCanvas.height = 256;
  const environmentContext = environmentCanvas.getContext('2d');
  environmentContext.fillStyle = '#abbec5';
  environmentContext.fillRect(0, 0, 512, 256);
  environmentContext.fillStyle = '#efffff';
  environmentContext.fillRect(50, 35, 115, 100);
  environmentContext.fillRect(280, 45, 75, 60);
  environmentContext.fillStyle = '#ffffff';
  environmentContext.fillRect(0, 0, 512, 25);
  const environmentTexture = new THREE.CanvasTexture(environmentCanvas);
  environmentTexture.mapping = THREE.EquirectangularReflectionMapping;
  environmentTexture.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromEquirectangular(environmentTexture);
  scene.environment = environment.texture;
  environmentTexture.dispose();
  pmrem.dispose();

  const materials = {
    wall: standard('#efe1c8', 0.92),
    white: standard('#f5f8f6', 0.53),
    teal: standard('#a6b69a', 0.65),
    dark: standard('#34494b', 0.45),
    metal: new THREE.MeshStandardMaterial({ color: '#bccbd0', metalness: 0.82, roughness: 0.24 }),
    black: standard('#263133', 0.7),
    rubber: standard('#183e40', 0.86)
  };

  function standard(color, roughness = 0.4) {
    return new THREE.MeshStandardMaterial({ color, roughness });
  }

  function mesh(geometry, material, parent = scene, x = 0, y = 0, z = 0) {
    const item = new THREE.Mesh(geometry, material);
    item.position.set(x, y, z);
    item.castShadow = !material.transparent;
    item.receiveShadow = true;
    parent.add(item);
    return item;
  }

  function box(w, h, d, material, parent, x, y, z) {
    return mesh(new THREE.BoxGeometry(w, h, d), material, parent, x, y, z);
  }

  function cylinder(radius, height, material, parent, x = 0, y = 0, z = 0) {
    return mesh(new THREE.CylinderGeometry(radius, radius, height, 40), material, parent, x, y, z);
  }

  function canvasTexture(width, height, draw) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    draw(canvas.getContext('2d'), width, height);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return texture;
  }

  // Room geometry adapted from 3b-lab/sicak-sinif-laboratuvari.
  const room = new THREE.Group(); scene.add(room);
  const selected = 'C';
  const t = {wall:'#efe1c8',floor:'#c6ad8b',cabinet:'#a6b69a',top:'#fff2d7',wood:'#aa7a49',tile:'#eee7d9',metal:'#76664f'};
  const tableColor = '#466455';
  let tableSurface;
  const tableY = 1.425;
const roomMat=(color,roughness=.7)=>new THREE.MeshStandardMaterial({color,roughness});
function roomBox(w,h,d,x,y,z,m,parent=room){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function roomCylinder(rt,rb,h,x,y,z,m,parent=room){const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,64),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function roomRing(r,t,x,y,z,m,parent){const o=new THREE.Mesh(new THREE.TorusGeometry(r,t,10,80),m);o.rotation.x=Math.PI/2;o.position.set(x,y,z);parent.add(o);return o}
function roomLabel(text,w,h,color,bg){const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,1024,256);ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='500 58px Segoe UI';ctx.fillText(text,512,128);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex}));}
function roomCabinet(x,z,w,t){roomBox(w,1.13,.64,x,.62,z,roomMat(t.cabinet));roomBox(w+.08,.1,.76,x,1.23,z,roomMat(t.top,.33));const n=Math.round(w/.85);for(let i=0;i<n;i++){let cx=x-w/2+(i+.5)*w/n;roomBox(w/n-.025,.96,.026,cx,.66,z+.334,roomMat(t.cabinet));roomBox(.24,.032,.045,cx,1.02,z+.369,roomMat(t.wood,.4));}roomBox(w,.09,.6,x,.095,z,roomMat(t.metal));}
roomBox(12,.12,12,0,-.06,0,roomMat(t.floor));for(let x=-6;x<=6;x+=1.2)roomBox(.014,.003,12,x,.003,0,roomMat(selected==='C'?'#b79b79':'#aab3b1'));for(let z=-6;z<=6;z+=1.2)roomBox(12,.003,.014,0,.004,z,roomMat(selected==='C'?'#b79b79':'#aab3b1'));
roomBox(12,4.8,.15,0,2.4,-4.8,roomMat(t.wall));roomBox(.15,4.8,10,-6,2.4,.1,roomMat(t.wall));roomBox(12,.11,.12,0,.1,-4.68,roomMat(t.metal));
roomBox(9.2,1.55,.035,0,2.03,-4.69,roomMat(t.tile));for(let x=-4.6;x<4.7;x+=selected==='B'?.8:.32)roomBox(.009,1.55,.01,x,2.03,-4.663,roomMat('#c2c9c4'));for(let y=1.3;y<2.8;y+=selected==='B'?.38:.32)roomBox(9.2,.009,.01,0,y,-4.66,roomMat('#c2c9c4'));
roomCabinet(-3,-4.25,2.8,t);roomCabinet(0,-4.25,2.8,t);roomCabinet(3,-4.25,2.8,t);
for(let y of [2.85,3.5]){roomBox(7.8,.075,.36,0,y,-4.48,roomMat(t.wood,.4));for(let x of [-3.2,3.2]){roomBox(.035,.28,.035,x,y-.15,-4.57,roomMat(t.metal));}} // deliberately empty wall shelves
if(selected==='B'){for(let x of [-3,0,3]){roomBox(2.68,.74,.33,x,3.98,-4.49,roomMat(t.cabinet));roomBox(.016,.7,.025,x,3.98,-4.31,roomMat(t.metal));}}
if(selected==='C'){for(let i=0;i<16;i++)roomBox(.07,2.9,.06,4.75+i*.064,2.45,-4.65,roomMat(t.wood));}
// Window on the left wall, with a daylight panel and deep frames.
roomBox(.03,2.05,3.1,-5.905,2.82,-1.2,new THREE.MeshBasicMaterial({color:selected==='C'?'#e9f2e4':'#d5ebf3'}));for(let z of [-2.79,.39])roomBox(.19,2.22,.085,-5.83,2.82,z,roomMat('#f9f8f0'));for(let y of [1.72,3.91])roomBox(.19,.085,3.25,-5.83,y,-1.2,roomMat('#f9f8f0'));roomBox(.19,2.17,.055,-5.81,2.82,-1.2,roomMat('#f9f8f0'));roomBox(.19,.055,3.16,-5.81,2.8,-1.2,roomMat('#f9f8f0'));roomBox(.38,.09,3.4,-5.76,1.68,-1.2,roomMat(t.top));
const sign=roomLabel('K İ M Y A   L A B O R A T U V A R I',4.6,.39,selected==='B'?'#44616c':'#536a53',t.wall);sign.position.set(0,4.23,-4.7);room.add(sign);
// Central island from the warm classroom reference.
tableSurface=roomBox(7,.15,2.2,0,1.34,0,roomMat(tableColor,.28));roomBox(6.95,.035,2.16,0,1.255,0,roomMat(t.wood,.4));
if(selected==='B'){for(let x of [-3.1,3.1]){for(let z of [-.83,.83])roomBox(.085,1.21,.085,x,.63,z,roomMat(t.metal,.4));roomBox(.09,.08,1.77,x,.17,0,roomMat(t.metal));}roomBox(6.2,.07,.07,0,.39,-.83,roomMat(t.metal));}
else {roomBox(6.5,1.13,1.75,0,.65,0,roomMat(selected==='C'?t.wood:t.cabinet));for(let i=0;i<7;i++){const x=-2.79+i*.93;roomBox(.89,.96,.025,x,.69,.889,roomMat(t.cabinet));roomBox(.28,.025,.04,x,1.03,.918,roomMat(t.wood,.45));}roomBox(6.28,.1,1.56,0,.13,0,roomMat(t.metal));}
// Two interactive experiment beakers replace the six decorative samples.
// Ceiling pendant fixtures give the room scale without cluttering the table.
for(let x of [-2,2]){roomBox(.022,.7,.022,x,4.4,.05,roomMat(t.metal));roomBox(1.45,.065,.38,x,4.04,.05,roomMat(t.metal));roomBox(1.34,.012,.3,x,4,.05,new THREE.MeshBasicMaterial({color:'#fff9dc'}));}
  const roomMaterialColors = [];
  const seenRoomMaterials = new Set();
  room.traverse(object => {
    const list = Array.isArray(object.material) ? object.material : [object.material];
    list.filter(Boolean).forEach(material => {
      if (!material.color || seenRoomMaterials.has(material) || material === tableSurface.material) return;
      seenRoomMaterials.add(material);
      roomMaterialColors.push({ material, color: material.color.clone() });
    });
  });
  let laboratoryLighting = '';

  function setLaboratoryLighting(mode) {
    const dark = mode === 'dark';
    laboratoryLighting = dark ? 'dark' : 'light';
    roomMaterialColors.forEach(entry => {
      entry.material.color.copy(entry.color);
      if (dark) entry.material.color.multiplyScalar(0.30);
    });
    scene.background.set(dark ? '#181b21' : '#e7e6dd');
    hemisphere.intensity = dark ? 0.65 : 1.7;
    sunlight.intensity = dark ? 0.50 : 2.2;
    fill.intensity = dark ? 0.35 : 0.8;
    renderer.toneMappingExposure = dark ? 0.80 : 0.92;
    renderer.shadowMap.needsUpdate = true;
  }

  function setTableColor(color) {
    if (!/^#[0-9a-f]{6}$/i.test(color || '')) return;
    tableSurface.material.color.set(color);
    renderer.shadowMap.needsUpdate = true;
  }
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: '#ffffff', metalness: 0, roughness: 0.08,
    transparent: true, opacity: 0.14, transmission: 0.88, thickness: 0.02,
    side: THREE.DoubleSide, depthWrite: false, envMapIntensity: 1.5
  });
  // Preserve the 67:92 low-form proportions, enlarge for readable classroom use.
  const beakerScale = 0.42 / 1.1;
  const beakerRadius = (0.067 / 0.092) * 1.1 / 2;
  const main = createBeaker(beakerRadius, 1.1);
  main.group.scale.setScalar(beakerScale);
  main.group.name = 'experiment-beaker-1';
  main.group.position.set(-0.4, tableY, 0.48);
  const secondary = createBeaker(beakerRadius, 1.1);
  secondary.group.scale.setScalar(beakerScale);
  secondary.group.name = 'experiment-beaker-2';
  const secondaryHome = new THREE.Vector3(0.15, tableY, 0.48);
  secondary.group.position.copy(secondaryHome);

  function createBenchNameplate(x, slot) {
    const group = new THREE.Group();
    group.position.set(x, tableY + 0.009, 0.73);
    group.name = 'beaker-nameplate-' + slot;
    scene.add(group);
    const canvas = document.createElement('canvas');
    canvas.width = 768; canvas.height = 320;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const card = mesh(new THREE.PlaneGeometry(0.34, 0.19), new THREE.MeshBasicMaterial({ map: texture }), group);
    card.rotation.x = -Math.PI / 2;
    return { group, canvas, texture, key: '' };
  }

  function updateBenchNameplate(plate, id, slot) {
    const reagent = window.MebiData.getReagent(id);
    const key = slot + '|' + (id || 'empty');
    if (plate.key === key) return;
    plate.key = key;
    const ctx = plate.canvas.getContext('2d');
    ctx.fillStyle = '#f4f2df'; ctx.fillRect(0, 0, 768, 320);
    ctx.strokeStyle = '#718171'; ctx.lineWidth = 12; ctx.strokeRect(6, 6, 756, 308);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#294536'; ctx.font = '700 44px Segoe UI, sans-serif';
    ctx.fillText(slot + '. BEHER' + (reagent ? '  ·  ' + reagent.f : ''), 384, 70);
    ctx.fillStyle = '#30453a'; ctx.font = '600 34px Segoe UI, sans-serif';
    ctx.fillText(reagent ? reagent.name : 'Madde seçimini bekliyor', 384, 160);
    ctx.fillStyle = '#41735b'; ctx.font = '500 26px Segoe UI, sans-serif';
    ctx.fillText(reagent ? reagent.state : 'Boş beher', 384, 242);
    plate.texture.needsUpdate = true;
  }

  const mainNameplate = createBenchNameplate(main.group.position.x, 1);
  const secondaryNameplate = createBenchNameplate(secondaryHome.x, 2);


  function createBeaker(radius, height) {
    const group = new THREE.Group();
    scene.add(group);
    const points = [[0, 0.02], [radius - 0.05, 0.02], [radius, 0.07], [radius, height],
      [radius - 0.022, height], [radius - 0.022, 0.075], [0, 0.075]];
    mesh(new THREE.LatheGeometry(points.map(p => new THREE.Vector2(...p)), 64), glassMaterial, group);
    const edgeMaterial = new THREE.MeshStandardMaterial({ color: '#d4e6e7', roughness: 0.22, transparent: true, opacity: 0.32, metalness: 0.1 });
    for (const y of [0.07, height]) {
      const rim = mesh(new THREE.TorusGeometry(radius - 0.011, 0.012, 8, 64), edgeMaterial, group, 0, y, 0);
      rim.rotation.x = Math.PI / 2;
    }
    const marks = canvasTexture(256, 512, (ctx) => {
      ctx.clearRect(0, 0, 256, 512);
      ctx.strokeStyle = '#385e66';
      ctx.fillStyle = '#385e66';
      ctx.lineWidth = 3;
      ctx.font = 'bold 25px sans-serif';
      for (let i = 0; i < 5; i++) {
        const y = 80 + i * 70;
        ctx.beginPath(); ctx.moveTo(18, y); ctx.lineTo(82, y); ctx.stroke();
        ctx.fillText(String(250 - i * 50), 95, y + 7);
      }
      ctx.font = '21px sans-serif';
      ctx.fillText('BORO 3.3', 24, 460);
    });
    mesh(new THREE.CylinderGeometry(radius + 0.002, radius + 0.002, height * 0.82, 32, 1, true, -0.52, 1.08),
      new THREE.MeshBasicMaterial({ map: marks, transparent: true, side: THREE.DoubleSide, depthWrite: false }), group, 0, height * 0.52, 0);
    const liquidMaterial = new THREE.MeshPhysicalMaterial({
      color: '#a7d6e0', transparent: true, opacity: 0.58,
      roughness: 0.21, metalness: 0, side: THREE.DoubleSide, depthWrite: false, envMapIntensity: 0.45
    });
    const liquidGeometry = new THREE.CylinderGeometry(radius - 0.027, radius - 0.027, 1, 64);
    const liquid = mesh(liquidGeometry, liquidMaterial, group);
    liquid.name = 'solution';
    const liquidBaseY = Array.from(liquidGeometry.attributes.position.array).filter((value, index) => index % 3 === 1);
    const surface = mesh(new THREE.CircleGeometry(radius - 0.026, 48), liquidMaterial, group);
    surface.rotation.x = -Math.PI / 2;
    const powder = cylinder(radius - 0.035, 1, standard('#ffffff', 0.95), group);
    powder.name = 'powder';
    const sediment = cylinder(radius - 0.033, 1, standard('#ffffff', 0.92), group);
    sediment.name = 'precipitate';
    sediment.visible = false;
    const grains = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.020, 0), standard('#ffffff', 0.95), 60);
    grains.name = 'solid-grains';
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 60; i++) {
      const angle = i * 2.39996;
      const r = Math.sqrt((i + 0.5) / 60) * (radius - 0.075);
      dummy.position.set(Math.cos(angle) * r, 0.088 + 0.022 * Math.sin(i * 1.7), Math.sin(angle) * r);
      dummy.updateMatrix();
      grains.setMatrixAt(i, dummy.matrix);
    }
    group.add(grains);
    return { group, radius, height, liquid, liquidBaseY, surface, powder, sediment, grains, level: 0.4 };
  }

  // Modern Dijital Daldırma Termometresi (Beherin kenarına monte, 2. görsel ile birebir uyumlu)
  const probeX = main.group.position.x - 0.082;
  const probeZ = main.group.position.z - 0.035;
  // 1. Metalik Daldırma Probu (Paslanmaz çelik çubuk - beherin içine uzanır)
  cylinder(0.0055, 0.46, materials.metal, scene, probeX, tableY + 0.24, probeZ);
  mesh(new THREE.SphereGeometry(0.0055, 10, 8), materials.metal, scene, probeX, tableY + 0.012, probeZ);
  // 2. Yaka Boğaz Halkası (Collar Ring - Beherin üst ağız hizasında)
  const collarRing = mesh(new THREE.TorusGeometry(0.016, 0.005, 8, 24), materials.dark, scene, probeX, tableY + 0.455, probeZ);
  collarRing.rotation.x = Math.PI / 2;
  // 3. Dijital Termometre Gövdesi (Beher kenarında ileriye bakan koyu gövde - %40 küçültülmüş)
  const thermoHead = new THREE.Group();
  thermoHead.scale.setScalar(0.60);
  thermoHead.position.set(probeX, tableY + 0.51, probeZ);
  scene.add(thermoHead);
  box(0.24, 0.15, 0.035, materials.dark, thermoHead, 0, 0, 0);
  // Yüksek Çözünürlüklü Dijital LCD Ekran
  const displayCanvas = document.createElement('canvas');
  displayCanvas.width = 512; displayCanvas.height = 320;
  const displayTexture = new THREE.CanvasTexture(displayCanvas);
  displayTexture.colorSpace = THREE.SRGBColorSpace;
  displayTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  mesh(new THREE.PlaneGeometry(0.21, 0.125), new THREE.MeshBasicMaterial({ map: displayTexture }), thermoHead, 0, 0.004, 0.0185);
  // Alt çerçevedeki iki cyan montaj noktası/v Второй (2. görsel)
  const screw1 = cylinder(0.008, 0.005, standard('#38bdf8'), thermoHead, -0.075, -0.055, 0.0185);
  screw1.rotation.x = Math.PI / 2;
  const screw2 = cylinder(0.008, 0.005, standard('#38bdf8'), thermoHead, 0.075, -0.055, 0.0185);
  screw2.rotation.x = Math.PI / 2;

  const streamCurve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3());
  const streamMaterial = new THREE.MeshPhysicalMaterial({
    color: '#38bdf8',
    roughness: 0.06,
    metalness: 0.0,
    transmission: 0.85,
    thickness: 0.03,
    transparent: true,
    opacity: 0.88,
    ior: 1.333,
    reflectivity: 0.6,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    depthWrite: false
  });
  const streamMesh = new THREE.Mesh(new THREE.TubeGeometry(streamCurve, 18, 0.007, 8, false), streamMaterial);
  streamMesh.visible = false;
  scene.add(streamMesh);
  const splashMaterial = new THREE.MeshBasicMaterial({ color: '#dff5f7', transparent: true, opacity: 0.55, depthWrite: false });
  const splashRings = Array.from({ length: 3 }, (_, index) => {
    const ring = mesh(new THREE.TorusGeometry(0.055 + index * 0.012, 0.005, 8, 40), splashMaterial.clone());
    ring.name = index === 0 ? 'surface-ripple' : 'surface-ripple-' + (index + 1);
    ring.rotation.x = Math.PI / 2;
    ring.visible = false;
    return ring;
  });
  const fillStreams = [main, secondary].map(vessel => {
    const flow = cylinder(0.008, 0.15, vessel.liquid.material.clone()); flow.visible = false;
    const grains = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.0054, 0), standard('#ffffff', 0.95), 30);
    scene.add(grains); grains.visible = false;
    return { flow, grains, vessel, started: -Infinity, id: null };
  });
  const pourGrains = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.0054, 0), standard('#ffffff', 0.95), 70);
  scene.add(pourGrains); pourGrains.visible = false;
  const impactGrains = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.0045, 0), standard('#ffffff', 0.95), 24);
  scene.add(impactGrains); impactGrains.visible = false;
  const bubbleCount = 56;
  const bubbles = new THREE.InstancedMesh(new THREE.SphereGeometry(0.025, 14, 10),
    new THREE.MeshPhysicalMaterial({ color: '#e8fbff', roughness: 0.02, metalness: 0, transmission: 0.18,
      thickness: 0.012, clearcoat: 1, clearcoatRoughness: 0.03, transparent: true, opacity: 0.48,
      side: THREE.DoubleSide, depthWrite: false }), bubbleCount);
  main.group.add(bubbles);
  bubbles.visible = false;
  const gasSurfaceRings = Array.from({ length: 7 }, (_, index) => {
    const ring = mesh(new THREE.TorusGeometry(0.027 + index % 2 * 0.006, 0.0038, 7, 32),
      new THREE.MeshBasicMaterial({ color:'#dff8fb', transparent:true, opacity:0, depthWrite:false }), main.group);
    ring.rotation.x = Math.PI / 2;
    ring.visible = false;
    return ring;
  });
  const flakes = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.016, 0), standard('#ffffff', 0.85), 80);
  flakes.name = 'precipitate-flakes';
  main.group.add(flakes);
  flakes.visible = false;
  const foam = cylinder(main.radius - 0.035, 0.028,
    new THREE.MeshStandardMaterial({ color: '#edf8f5', transparent: true, opacity: 0.62, roughness: 0.9 }), main.group);
  foam.visible = false;
  const dummy = new THREE.Object3D();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const projection = new THREE.Vector3();
  const clock = new THREE.Clock();
  let state = null;
  let dispatch = null;
  let lastPair = '';
  let lastStep = '';
  let pouringStarted = 0;
  let reactionStarted = 0;
  let temperature = 22;
  let drag = null;
  let cameraTransition = null;
  let hasPlayedIntro = false;
  let closeView = false;
  let panelWasCompact = false;
  let activeView = 'wide';
  let frame = 0;
  let lastFrameAt = 0;
  let overlay = null;
  let dragButton = null;
  let handGuide = null;
  let pourTarget = null;
  let thermo = null;
  let mainLabel = null;
  let secondaryLabel = null;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function setTemperature(value) {
    temperature = value;
    const ctx = displayCanvas.getContext('2d');
    const isHeating = state && state.activeReaction && state.activeReaction.hasTempRise && value > 22.5;
    const accentColor = isHeating ? '#f59e0b' : '#38bdf8';
    const numColor = isHeating ? '#fbbf24' : '#22d3ee';
    // Koyu LCD arka planı
    ctx.fillStyle = isHeating ? '#1a0f02' : '#0a1017';
    ctx.fillRect(0, 0, 512, 320);
    // İnce iç çerçeve
    ctx.strokeStyle = isHeating ? '#78350f' : '#1e293b';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 500, 308);
    // Üst şerit: DIGITAL TEMP ve REC ●
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('DIGITAL TEMP', 24, 46);
    ctx.textAlign = 'right';
    ctx.fillText('REC ●', 488, 46);
    // Orta alan: Büyük ve parlak dijital sıcaklık değeri
    ctx.fillStyle = numColor;
    ctx.font = 'bold 98px monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = numColor;
    ctx.shadowBlur = 14;
    ctx.fillText(value.toFixed(1) + ' °C', 256, 178);
    ctx.shadowBlur = 0;
    // Alt şerit: MEBİ KİMYALAB - PROBE-T1
    ctx.fillStyle = isHeating ? '#d97706' : '#0284c7';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('MEBİ KİMYALAB - PROBE-T1', 256, 275);
    displayTexture.needsUpdate = true;
    displayTexture.userData.drawn = true;
  }

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, h < 650 ? 1.25 : 1.75));
    renderer.setSize(w, h);
    camera.aspect = w / h;
    const dock = document.getElementById('benchDock');
    const bench = document.getElementById('labBenchContainer');
    const tools = document.querySelector('.lab-camera-tools');
    const left = document.querySelector('.lab-reagent-panel');
    const predictionStage = state && (state.screen === 'pool' || (state.screen === 'lab' && state.labStep === 'predict'));
    if (left && !left.classList.contains('is-collapsed')) {
      const heading = left.querySelector('.lab-panel-heading');
      const content = left.querySelector('.lab-panel-content');
      const available = Math.max(180, h - left.getBoundingClientRect().top - 18);
      const needed = (heading ? heading.scrollHeight : 0) + (content ? content.scrollHeight : 0) + 38;
      const compact = needed > available;
      document.body.dataset.panelCompact = String(compact);
      if (compact && !panelWasCompact) {
        const list = left.querySelector('.lab-reagent-list');
        if (list) list.scrollTop = 0;
      }
      panelWasCompact = compact;
    } else {
      document.body.dataset.panelCompact = 'false';
      panelWasCompact = false;
    }
    if (dock) {
      const topOffset = dock.getBoundingClientRect().top || 86;
      dock.style.maxHeight = Math.max(100, h - topOffset - 12) + 'px';
    }
    const portrait = w < 600 && h > w;
    const presetFov = viewFov[activeView] || 40;
    if (state && (state.screen === 'lab' || state.screen === 'pool') && dock && !portrait) {
      camera.setViewOffset(w, h, (dock.offsetWidth - (left ? left.offsetWidth : 0)) / 2, h < 650 ? -12 : -20, w, h);
      camera.fov = presetFov;
    } else {
      camera.clearViewOffset();
      camera.fov = portrait ? Math.max(presetFov, 60) : presetFov;
    }
    camera.updateProjectionMatrix();
  }

  function moveCamera(position, target = focus, duration = 650, fov = 40) {
    cameraTransition = { from: camera.position.clone(), to: position.clone(),
      targetFrom: controls.target.clone(), targetTo: target.clone(), fromFov: camera.fov, toFov: fov,
      started: performance.now(), duration };
  }

  function setView(view, duration = 650) {
    activeView = Object.prototype.hasOwnProperty.call(viewFov, view) ? view : 'desk';
    closeView = activeView === 'closeup';
    const position = activeView === 'wide' ? roomView : activeView === 'closeup' ? closeViewPosition : home;
    const target = activeView === 'wide' ? roomFocus : activeView === 'closeup' ? closeViewFocus : focus;
    moveCamera(position, target, reducedMotion.matches ? 1 : duration, viewFov[activeView]);
  }

  function sync(nextState, nextDispatch) {
    const wasInLab = state && (state.screen === 'lab' || state.screen === 'pool');
    state = nextState;
    dispatch = nextDispatch;
    setLaboratoryLighting(state.labLighting || 'light');
    setTableColor(state.tableColor || '#466455');
    if (drag && (state.screen !== 'lab' || state.labStep !== 'ready')) {
      if (drag.capture.hasPointerCapture(drag.pointerId)) drag.capture.releasePointerCapture(drag.pointerId);
      drag = null;
    }
    const inLab = state.screen === 'lab' || state.screen === 'pool';
    mainNameplate.group.visible = inLab;
    secondaryNameplate.group.visible = inLab;
    updateBenchNameplate(mainNameplate, state.selectedSlot1, 1);
    updateBenchNameplate(secondaryNameplate, state.selectedSlot2, 2);
    document.body.dataset.labScreen = state.screen;
    const predictionStage = state.screen === 'pool' || (state.screen === 'lab' && state.labStep === 'predict');
    document.body.dataset.predictionStage = String(predictionStage);
    host.style.pointerEvents = inLab ? 'auto' : 'none';
    controls.enabled = inLab;
    overlay = document.querySelector('.bench-stage');
    mainLabel = document.getElementById('mainVessel');
    secondaryLabel = document.getElementById('dragReagentWrap');
    thermo = document.getElementById('digitalThermoWrap'); if (thermo) thermo.style.display = 'none';
    dragButton = null;
    handGuide = null;
    pourTarget = null;
    if (overlay && thermo) overlay.appendChild(thermo);
    if (inLab) {
      document.querySelectorAll('[data-lab-view]').forEach(button => {
        button.addEventListener('click', () => {
          const view = button.dataset.labView;
          if (view === 'close') {
            setView(activeView === 'closeup' ? 'desk' : 'closeup');
            button.setAttribute('aria-pressed', String(activeView === 'closeup'));
          } else if (view === 'general') {
            setView('wide');
          } else {
            setView('desk');
          }
        });
      });
      if (state.labStep === 'ready') {
        dragButton = document.createElement('button');
        dragButton.className = 'lab-beaker-target';
        dragButton.type = 'button';
        dragButton.setAttribute('aria-label', 'Beheri Dök');
        dragButton.addEventListener('pointerdown', event => beginDrag(event, true));
        dragButton.addEventListener('click', event => {
          if (event.detail === 0 && state.labStep === 'ready') dispatch('triggerPour');
        });
        overlay.appendChild(dragButton);
        const originalGuide = document.querySelector('.hand-guide-pill');
        if (originalGuide) {
          handGuide = document.createElement('div');
          handGuide.className = 'lab-hand-guide';
          handGuide.innerHTML = originalGuide.innerHTML;
          overlay.appendChild(handGuide);
        }
      }
    }
    if (!hasPlayedIntro) {
      hasPlayedIntro = true;
      camera.position.copy(roomView);
      controls.target.copy(roomFocus);
      camera.fov = viewFov.wide;
      camera.updateProjectionMatrix();
      controls.update();
      activeView = 'wide';
      setTimeout(() => {
        setView('desk', 1800);
        if (typeof dispatch === 'function') {
          dispatch('setLabView', 'desk');
        }
      }, 700);
    }
    [state.selectedSlot1, state.selectedSlot2].forEach((id, index) => {
      const filling = fillStreams[index];
      if (id !== filling.id) { filling.id = id; filling.started = performance.now(); }
    });
    const pair = state.selectedSlot1 + '|' + state.selectedSlot2;
    if (pair !== lastPair) {
      lastPair = pair;
      main.group.position.set(-0.4, tableY, 0.48);
      secondary.group.position.copy(secondaryHome);
      secondary.group.rotation.set(0, 0, 0);
      main.level = 0.42;
      secondary.level = 0.52;
      if (state.screen === 'pool') {
        setView(state.labView || 'desk', 700);
      }
    }
    if (state.labStep !== lastStep) {
      if (state.labStep === 'pouring') pouringStarted = performance.now();
      if (state.labStep === 'reacting') reactionStarted = performance.now();
      if (state.labStep === 'predict' || state.labStep === 'ready') {
        secondary.group.position.copy(secondaryHome);
        secondary.group.rotation.set(0, 0, 0);
        main.level = 0.42; secondary.level = 0.52;
        if (streamMesh) streamMesh.visible = false;
        if (splashRings) splashRings.forEach(r => { r.visible = false; });
      }
      lastStep = state.labStep;
    }
    setTemperature(state.currentTemp);
    renderer.shadowMap.needsUpdate = true;
    resize();
    renderFrame();
  }

  function pointerRay(event) {
    pointer.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
    // View offsets are included by the projection matrix used by Raycaster.
    raycaster.setFromCamera(pointer, camera);
  }

  function beginDrag(event, force = false) {
    if (!state || state.screen !== 'lab' || state.labStep !== 'ready' || event.button > 0) return;
    pointerRay(event);
    if (!force && !raycaster.intersectObject(secondary.group, true).length) return;
    event.preventDefault();
    event.stopPropagation();
    cameraTransition = null;
    controls.enabled = false;
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()), secondary.group.position);
    const hit = raycaster.ray.intersectPlane(plane, new THREE.Vector3());
    if (!hit) return;
    drag = { plane, offset: secondary.group.position.clone().sub(hit), startX: event.clientX, startY: event.clientY,
      pointerId: event.pointerId, capture: event.currentTarget, ready: false };
    drag.capture.setPointerCapture(event.pointerId);
    if (pourTarget) pourTarget.classList.add('is-dragging');
    if (window.MebiAudio) window.MebiAudio.playClick();
  }

  function dragMove(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    pointerRay(event);
    const hit = raycaster.ray.intersectPlane(drag.plane, new THREE.Vector3());
    if (hit) {
      secondary.group.position.copy(hit.add(drag.offset));
      secondary.group.position.x = THREE.MathUtils.clamp(secondary.group.position.x, -2.6, 2.2);
      secondary.group.position.y = THREE.MathUtils.clamp(secondary.group.position.y, tableY, tableY + 2);
      const target = screenPoint(pourTargetPoint());
      const spout = screenPoint(pourSpoutPoint());
      drag.ready = isPourReady(spout, target);
      secondary.group.rotation.z += ((drag.ready ? 0.28 : 0) - secondary.group.rotation.z) * 0.24;
      if (pourTarget) pourTarget.classList.toggle('is-ready', drag.ready);
    }
  }

  function endDrag(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const activeDrag = drag;
    drag = null;
    if (activeDrag.capture.hasPointerCapture(event.pointerId)) activeDrag.capture.releasePointerCapture(event.pointerId);
    if (pourTarget) pourTarget.classList.remove('is-dragging', 'is-ready');
    controls.enabled = state.screen === 'lab';
    const target = screenPoint(pourTargetPoint());
    const spout = screenPoint(pourSpoutPoint());
    const releasedOnTarget = isPourReady(spout, target);
    if (event.type !== 'pointercancel' && (activeDrag.ready || releasedOnTarget)) {
      if (state.labStep === 'ready') dispatch('triggerPour');
    } else {
      secondary.group.position.copy(secondaryHome);
      secondary.group.rotation.z = 0;
    }
  }

  renderer.domElement.addEventListener('pointerdown', event => beginDrag(event), true);
  window.addEventListener('pointermove', dragMove);
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  function screenPoint(point) {
    projection.copy(point).project(camera);
    return { x: (projection.x + 1) * window.innerWidth / 2, y: (1 - projection.y) * window.innerHeight / 2 };
  }

  function pourTargetPoint() {
    return main.group.position.clone().add(new THREE.Vector3(0, main.height * beakerScale * 0.88, 0));
  }

  function isPourReady(spout, target) {
    const dx = Math.abs(spout.x - target.x);
    const dy = spout.y - target.y;
    // The active zone extends farther below the receiving beaker mouth so an
    // upward drag can engage naturally before the spout reaches the exact rim.
    return dx < 104 && dy > -62 && dy < 138;
  }

  function pourSpoutPoint() {
    return secondary.group.localToWorld(new THREE.Vector3(-secondary.radius * 0.91, secondary.height * 0.91, 0));
  }

  function place(element, point, dy = 0) {
    if (!element) return;
    const p = screenPoint(point);
    element.style.left = p.x.toFixed(1) + 'px';
    element.style.top = (p.y + dy).toFixed(1) + 'px';
  }

  function updateOverlays() {
    if (!state || (state.screen !== 'lab' && state.screen !== 'pool')) return;
    const mainPoint = screenPoint(main.group.position);
    const secondaryPoint = screenPoint(secondaryHome);
    const labelWidth = Math.min(window.innerWidth <= 1100 ? 176 : 210, Math.max(90, Math.abs(secondaryPoint.x - mainPoint.x) - 18));
    if (mainLabel) mainLabel.style.width = labelWidth + 'px';
    if (secondaryLabel) secondaryLabel.style.width = labelWidth + 'px';
    place(mainLabel, main.group.position.clone().add(new THREE.Vector3(0, 0.025, 0.22)), -2);
    place(secondaryLabel, secondaryHome.clone().add(new THREE.Vector3(0, 0.025, 0.22)), -2);
    // 3D dijital termometre artık beherin kenarına doğrudan 3B olarak monte edilmiştir.
    if (dragButton) {
      const top = screenPoint(secondary.group.position.clone().add(new THREE.Vector3(0, secondary.height * beakerScale, 0)));
      const base = screenPoint(secondary.group.position);
      const edge = screenPoint(secondary.group.position.clone().add(new THREE.Vector3(secondary.radius * beakerScale, 0, 0)));
      const width = Math.max(54, Math.abs(edge.x - base.x) * 2.3);
      Object.assign(dragButton.style, { left: (base.x - width / 2) + 'px', top: (top.y - 8) + 'px',
        width: width + 'px', height: Math.max(50, base.y - top.y + 18) + 'px' });
      place(handGuide, secondary.group.position.clone().add(new THREE.Vector3(0, secondary.height * beakerScale, 0)), -18);
      if (handGuide) handGuide.style.visibility = drag ? 'hidden' : 'visible';
    }
    if (pourTarget) {
      const mouth = screenPoint(pourTargetPoint());
      Object.assign(pourTarget.style, { left: mouth.x + 'px', top: mouth.y + 'px' });
    }
  }

  function setVesselContents(vessel, liquid, powder, color, opacity, angle = 0) {
    vessel.liquid.visible = vessel.surface.visible = liquid > 0.005;
    vessel.powder.visible = vessel.grains.visible = powder > 0.005;
    const positions = vessel.liquid.geometry.attributes.position;
    const floor = 0.065;
    const slope = Math.tan(angle);
    for (let vertex = 0; vertex < positions.count; vertex++) {
      const baseY = vessel.liquidBaseY[vertex];
      const y = baseY > 0.45
        ? floor + THREE.MathUtils.clamp(liquid - positions.getX(vertex) * slope, 0.002, vessel.height - floor - 0.018)
        : floor;
      positions.setY(vertex, y);
    }
    positions.needsUpdate = true;
    vessel.liquid.geometry.computeVertexNormals();
    vessel.liquid.position.y = 0;
    vessel.liquid.scale.y = 1;
    vessel.surface.position.y = 0.066 + liquid;
    vessel.surface.rotation.z = -angle;
    vessel.powder.scale.y = Math.max(0.001, powder * 0.35);
    vessel.powder.position.y = 0.065 + powder * 0.175;
    vessel.grains.position.y = Math.max(0, powder * 0.28);
    vessel.grains.visible = powder > 0.015;
    vessel.liquid.material.color.set(color);
    vessel.liquid.material.opacity = opacity;
    vessel.surface.material.color.set(color);
    vessel.powder.material.color.set(color);
    vessel.grains.material.color.set(color);
  }

  function updateContents(vessel, reagent, level, angle = 0) {
    const visual = window.MebiChemistry.appearance(reagent);
    setVesselContents(vessel, reagent && !reagent.solid ? level : 0,
      reagent && reagent.solid ? level : 0, visual.color, visual.opacity, angle);
  }

  function updateFilling(vessel, reagent, index, time) {
    const filling = fillStreams[index];
    const elapsed = performance.now() - filling.started;
    const duration = reducedMotion.matches ? 1 : 750;
    const p = Math.min(1, elapsed / duration);
    const active = !!reagent && p < 1 && state && state.screen === 'pool';
    // Selection fills emerge inside the vessel from the base upward.
    filling.flow.visible = false;
    filling.grains.visible = false;
    return active ? p : 1;
  }

  function updateExperiment(time) {
    const r1 = window.MebiData.getReagent(state && state.selectedSlot1);
    const r2 = window.MebiData.getReagent(state && state.selectedSlot2);
    const rx = state && state.activeReaction;
    const step = state ? state.labStep : 'predict';
    const reacting = !!rx && (step === 'reacting' || step === 'observed');
    const pouring = step === 'pouring';
    const progress = pouring ? THREE.MathUtils.clamp((performance.now() - pouringStarted) / (reducedMotion.matches ? 1 : 5000), 0, 1) : (reacting ? 1 : 0);
    const transfer = pouring ? THREE.MathUtils.clamp((progress - 0.22) / 0.58, 0, 1) : (reacting ? 1 : 0);
    const reactionProgress = reacting ? THREE.MathUtils.clamp((performance.now() - reactionStarted) / 1200, 0, 1) : 0;
    const fill1 = updateFilling(main, r1, 0, time);
    const fill2 = updateFilling(secondary, r2, 1, time);
    updateContents(main, r1, 0.42 * fill1);
    const lift = THREE.MathUtils.smoothstep(progress, 0, 0.22);
    const returnPhase = THREE.MathUtils.smoothstep(progress, 0.80, 1);
    const pourAngle = !pouring ? 0 : progress < 0.22 ? lift * 0.80
      : progress < 0.80 ? 0.80 + THREE.MathUtils.smoothstep(progress, 0.22, 0.80) * 0.52
      : 1.32 * (1 - returnPhase);
    updateContents(secondary, r2, 0.52 * fill2 * (1 - transfer), pourAngle);
    if (pouring && r2 && r2.solid) secondary.grains.visible = false;
    const mix = window.MebiChemistry.mixture(r1, r2, rx, transfer, reactionProgress);
    if (transfer > 0) {
      setVesselContents(main, mix.liquid, mix.powder, mix.color, mix.opacity);
      main.liquid.material.color.lerp(new THREE.Color(mix.targetColor), reactionProgress);
    }
    const transferring = pouring && progress >= 0.22 && progress <= 0.80 && r2;
    streamMesh.visible = !!(transferring && !r2.solid);
    pourGrains.visible = !!(transferring && r2.solid);
    impactGrains.visible = pourGrains.visible;
    if (!streamMesh.visible) {
      splashRings.forEach(ring => { ring.visible = false; });
      main.surface.scale.set(1, 1, 1);
    }
    if (pouring && r2) {
      secondary.group.rotation.z = pourAngle;
      const spoutLocal = new THREE.Vector3(-secondary.radius * 0.92, secondary.height * 0.95, 0);
      const spoutOffset = spoutLocal.clone().multiplyScalar(beakerScale)
        .applyAxisAngle(new THREE.Vector3(0, 0, 1), secondary.group.rotation.z);
      const restSpout = secondaryHome.clone().add(spoutLocal.clone().multiplyScalar(beakerScale));
      // Gerçek kimya laboratuvarı: Dökülen beherin ağzı alıcı beherin ağız kenarına tam yaslanır
      const targetSpout = new THREE.Vector3(main.group.position.x + (main.radius * beakerScale * 0.88), tableY + main.height * beakerScale + 0.012, main.group.position.z);
      let desiredSpout;
      if (progress < 0.22) desiredSpout = restSpout.clone().lerp(targetSpout, lift);
      else if (progress < 0.80) desiredSpout = targetSpout.clone().add(new THREE.Vector3(0, Math.sin(time * 5) * 0.001, 0));
      else desiredSpout = targetSpout.clone().lerp(restSpout, returnPhase);
      secondary.group.position.copy(desiredSpout.sub(spoutOffset));
      const start = secondary.group.localToWorld(spoutLocal.clone());
      const end = main.group.position.clone();
      end.x += (main.radius * beakerScale * 0.18);
      end.y = tableY + 0.065 + Math.max(0.04, main.level);
      end.z = main.group.position.z;
      const visual = window.MebiChemistry.appearance(r2);
      if (transferring && !r2.solid) {
        // Kesintisiz, pürüzsüz laminer sıvı akışı (Smooth laminar jet)
        const control = start.clone().lerp(end, 0.40);
        control.y = Math.min(start.y - 0.012, (start.y + end.y) * 0.5 - 0.018);
        streamCurve.v0.copy(start);
        streamCurve.v1.copy(control);
        streamCurve.v2.copy(end);
        streamMesh.geometry.dispose();
        const streamRadius = 0.0068 + Math.sin(time * 7) * 0.0003;
        streamMesh.geometry = new THREE.TubeGeometry(streamCurve, 18, streamRadius, 8, false);
        streamMaterial.color.set(visual.color);
        streamMaterial.opacity = Math.max(0.72, visual.opacity);

        // Sıvı yüzeyine çarpma dalga halkaları (Ripples)
        splashRings.forEach((ring, index) => {
          const phase = (time * 2.2 + index / splashRings.length) % 1;
          ring.visible = true;
          ring.position.copy(end).add(new THREE.Vector3(0, 0.003 + index * 0.001, 0));
          ring.scale.setScalar(0.42 + phase * 1.35);
          ring.material.color.set(visual.color);
          ring.material.opacity = (1 - phase) * 0.52;
        });
        const wobble = Math.sin(time * 14) * 0.015 * (1 - transfer * 0.3);
        main.surface.scale.set(1 + wobble, 1 - wobble * 0.4, 1);
      }
      const solidCurve = new THREE.QuadraticBezierCurve3(start, start.clone().lerp(end, 0.48).add(new THREE.Vector3(0, -0.10, 0)), end);
      for (let i = 0; i < 70; i++) {
        const fall = (time * 2.2 + i / 70) % 1;
        dummy.position.copy(solidCurve.getPoint(fall));
        dummy.position.x += Math.sin(i * 5.1 + time * 4) * 0.006 * fall;
        dummy.position.z += Math.cos(i * 3.3) * 0.005;
        dummy.rotation.set(time * 3 + i, time * 2 + i * 0.4, i);
        dummy.scale.setScalar(0.55 + i % 4 * 0.18); dummy.updateMatrix(); pourGrains.setMatrixAt(i, dummy.matrix);
      }
      pourGrains.instanceMatrix.needsUpdate = true;
      pourGrains.material.color.set(visual.color);
      for (let i = 0; i < 24; i++) {
        const phase = (time * 1.6 + i / 24) % 1;
        const angle = i * 2.39996;
        const radius = phase * 0.045;
        dummy.position.copy(end).add(new THREE.Vector3(Math.cos(angle) * radius, 0.012 + Math.sin(phase * Math.PI) * 0.02, Math.sin(angle) * radius));
        dummy.rotation.set(i, phase * 4, time);
        dummy.scale.setScalar((1 - phase) * 0.75); dummy.updateMatrix(); impactGrains.setMatrixAt(i, dummy.matrix);
      }
      impactGrains.instanceMatrix.needsUpdate = true;
      impactGrains.material.color.set(visual.color);
    } else if (!drag) {
      splashRings.forEach(ring => { ring.visible = false; });
      if (streamMesh) streamMesh.visible = false;
      pourGrains.visible = false;
      impactGrains.visible = false;
      main.surface.scale.set(1, 1, 1);
      secondary.group.position.lerp(secondaryHome, 0.12);
      secondary.group.rotation.z *= 0.82;
    }
    const gas = reacting && mix.gas;
    const precipitate = reacting && mix.precipitate;
    bubbles.visible = gas;
    gasSurfaceRings.forEach(ring => { ring.visible = gas; });
    foam.visible = false; // No detergent is present: show bubbles, not stable soap foam.
    flakes.visible = main.sediment.visible = precipitate;
    const liquidHeight = 0.065 + (progress > 0 ? mix.liquid : (r1 && !r1.solid ? 0.42 : 0));
    if (gas) {
      foam.position.y = liquidHeight + 0.006;
      for (let i = 0; i < bubbleCount; i++) {
        const phase = (time * (step === 'observed' ? 0.34 : 0.72) + i * 0.137) % 1;
        const a = i * 2.39996;
        const bubbleScale = 0.34 + phase * 0.92 + (i % 4) * 0.10;
        const safeRadius = Math.max(0.05, main.radius - 0.055 - 0.025 * bubbleScale);
        const radialSeed = Math.sqrt((((i * 29) % bubbleCount) + 0.5) / bubbleCount);
        const r = radialSeed * safeRadius;
        const wobble = Math.sin(time * (2.8 + i % 3 * 0.35) + i * 1.7) * 0.008 * phase;
        const verticalSpan = Math.max(0.02, liquidHeight - 0.145);
        dummy.position.set(Math.cos(a) * r + wobble, 0.105 + phase * verticalSpan, Math.sin(a) * r + wobble * 0.55);
        dummy.scale.setScalar(bubbleScale);
        dummy.updateMatrix(); bubbles.setMatrixAt(i, dummy.matrix);
      }
      bubbles.instanceMatrix.needsUpdate = true;
      gasSurfaceRings.forEach((ring, index) => {
        const phase = (time * (step === 'observed' ? 0.30 : 0.62) + index / gasSurfaceRings.length) % 1;
        const angle = index * 2.39996;
        const radial = 0.045 + (index % 3) * 0.052;
        ring.position.set(Math.cos(angle) * radial, liquidHeight + 0.005 + index * 0.0004, Math.sin(angle) * radial);
        ring.scale.setScalar(0.35 + phase * 1.75);
        ring.material.opacity = Math.sin(phase * Math.PI) * 0.42;
      });
    } else {
      gasSurfaceRings.forEach(ring => { ring.visible = false; ring.material.opacity = 0; });
    }
    if (precipitate) {
      const color = rx.precipColor || '#ffffff';
      flakes.material.color.set(color);
      main.sediment.material.color.set(color);
      const settled = THREE.MathUtils.clamp((performance.now() - reactionStarted) / 1800, 0.05, 1);
      main.sediment.scale.y = 0.08 * settled;
      main.sediment.position.y = 0.065 + 0.04 * settled;
      const maxY = Math.max(0.12, liquidHeight - 0.045);
      const minY = 0.088 + 0.035 * settled;
      for (let i = 0; i < 80; i++) {
        const phase = (time * 0.22 + i * 0.117) % 1;
        const angle = i * 2.39996;
        const flakeScale = 0.55 + (i % 3) * 0.12;
        const safeRadius = Math.max(0.025, (main.radius - 0.085) * (0.8 + 0.2 * (1 - settled)));
        const r = Math.sqrt((i + 0.5) / 80) * safeRadius;
        const fallProgress = (1 - phase) * (1 - settled * 0.75);
        const yPos = minY + fallProgress * (maxY - minY);
        dummy.position.set(Math.cos(angle) * r, yPos, Math.sin(angle) * r);
        dummy.scale.setScalar(flakeScale);
        dummy.updateMatrix(); flakes.setMatrixAt(i, dummy.matrix);
      }
      flakes.instanceMatrix.needsUpdate = true;
    }
  }

  function renderFrame() {
    const time = clock.getElapsedTime();
    if (cameraTransition) {
      const t = reducedMotion.matches ? 1 : Math.min(1, (performance.now() - cameraTransition.started) / cameraTransition.duration);
      const eased = t * t * (3 - 2 * t);
      camera.position.lerpVectors(cameraTransition.from, cameraTransition.to, eased);
      controls.target.lerpVectors(cameraTransition.targetFrom, cameraTransition.targetTo, eased);
      camera.fov = THREE.MathUtils.lerp(cameraTransition.fromFov, cameraTransition.toFov, eased);
      camera.updateProjectionMatrix();
      if (t === 1) cameraTransition = null;
    }
    controls.update();
    camera.position.clamp(cameraBounds.min, cameraBounds.max);
    camera.lookAt(controls.target);
    camera.updateMatrixWorld();
    updateExperiment(time);
    renderer.render(scene, camera);
    updateOverlays();
  }

  function animate() {
    frame = requestAnimationFrame(animate);
    const now = performance.now();
    if (state && state.screen !== 'lab' && state.screen !== 'pool' && now - lastFrameAt < 100) return;
    lastFrameAt = now;
    renderFrame();
  }

  function resume() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (!document.hidden) animate();
  }

  renderer.domElement.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    cancelAnimationFrame(frame); frame = 0;
    document.body.classList.remove('lab-3d-active');
    window.LabScene.available = false;
    host.style.visibility = 'hidden';
    if (window.TepkimeArenasi) window.TepkimeArenasi.render(false);
  });
  renderer.domElement.addEventListener('webglcontextrestored', () => {
    host.style.visibility = '';
    window.LabScene.available = true;
    document.body.classList.add('lab-3d-active');
    if (window.TepkimeArenasi) window.TepkimeArenasi.render(false);
    resume();
  });
  window.addEventListener('resize', resize);
  // User input takes priority over a preset-camera transition.
  controls.addEventListener('start', () => { cameraTransition = null; });
  document.addEventListener('visibilitychange', resume);
  window.LabScene = {
    available: true,
    sync,
    setTemperature,
    setView,
    setLighting: setLaboratoryLighting,
    setTableColor
  };
  document.body.classList.add('lab-3d-active');
  resize();
  setTemperature(22);
  if (window.TepkimeArenasi) sync(window.TepkimeArenasi.state, window.TepkimeArenasi.dispatch);
  animate();
}
