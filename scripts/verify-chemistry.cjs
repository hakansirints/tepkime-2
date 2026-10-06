const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '..');
let now = 0;
let timers = [];
let frameCallback;
let renderedScene;
let renderedCamera;
let sceneControls;
const appElement = { innerHTML: '', dataset: {}, querySelector: () => null };
function element() {
  return { style: {}, dataset: {}, classList: {add(){},remove(){},toggle(){},contains(){return false}},
    addEventListener(){},removeEventListener(){},appendChild(){},replaceChildren(){},querySelector(){return null}, querySelectorAll(){return []},
    setAttribute(){},getAttribute(){return null},getBoundingClientRect(){return {top:160,left:0,width:360,height:190}},
    getContext(){return new Proxy({}, {get:(o,k)=> k in o ? o[k] : (()=>{}),set:(o,k,v)=>(o[k]=v,true)})}};
}
const host = element();
const document = { hidden:false, documentElement:{dataset:{theme:'light'},getAttribute(){return 'light'}},
  body:element(), getElementById(id){return id==='app'?appElement:id==='labWorld'?host:null},
  querySelector(selector){return selector === '.bench-stage' ? host : null}, querySelectorAll(){return []}, createElement:element, addEventListener(){} };
const context = vm.createContext({ console, document, innerWidth:1440, innerHeight:900,
  devicePixelRatio:1, performance:{now:()=>now},
  localStorage:{getItem(){return null},setItem(){}},
  confirm(){return true},
  matchMedia:()=>({matches:false}), addEventListener(){}, scrollTo(){},
  setTimeout(fn,ms){timers.push({fn,at:now+ms});return timers.length},
  setInterval(fn,ms){const timer={fn,at:now+ms,interval:ms};timers.push(timer);return timer},
  clearInterval(timer){timer.cancelled=true},
  requestAnimationFrame(fn){frameCallback=fn;return 1}, cancelAnimationFrame(){},
  MutationObserver:class{observe(){}},
  ResizeObserver:class{constructor(fn){this.fn=fn}observe(){this.fn()}disconnect(){}},
});
context.window=context;
const load = name => vm.runInContext(fs.readFileSync(path.join(root,'js',name),'utf8'),context,{filename:name});
function advance(ms) {
  const target=now+ms;
  for (;;) {
    timers.sort((a,b)=>a.at-b.at);
    const timer=timers.find(t=>!t.cancelled && t.at<=target);
    if(!timer)break;
    timers.splice(timers.indexOf(timer),1); now=timer.at; timer.fn();
    if(timer.interval && !timer.cancelled){timer.at=now+timer.interval;timers.push(timer)}
  }
  now=target;
  if(frameCallback)frameCallback();
}
load('data.js'); load('chemistry-visuals.js'); load('svg-models.js');
context.LabScene={available:true,sync(){},setTemperature(){}};
load('app.js');
const data=context.MebiData, chemistry=context.MebiChemistry, app=context.TepkimeArenasi;
const r=id=>data.getReagent(id);
app.dispatch('goMenu');
assert.ok(appElement.innerHTML.includes('mebi-top-shell has-stage') && appElement.innerHTML.includes('5. TANECİK KAMERASI'),'Opening screen uses the shared five-stage header');
assert.equal(data.REAGENTS.length,12);
assert.equal(Object.keys(data.REACTION_PAIRS).length,36);
assert.equal(chemistry.appearance(r('HCl')).color,'#ffffff');
assert.equal(chemistry.appearance(r('NaOH')).color,'#ffffff');
assert.equal(chemistry.appearance(r('Na2CO3')).phase,'powder');
assert.equal(chemistry.appearance(null).phase,'empty');
assert.notEqual(chemistry.appearance(r('Cu(NO3)2')).color,'#ffffff');
assert.deepEqual(Array.from(chemistry.spectatorSpecies(data.getReaction('H2O2','KI'))),['K⁺']);
assert.equal(data.getReaction('H2O2','KI').title.includes('Macunu'),false);
assert.equal(context.MebiSVG.renderGenericProductParticle('spectators',data.getReaction('H2O2','KI'),r('H2O2'),r('KI')).includes('Na⁺'),false);
for(const ids of [['CaCO3','NaHCO3'],['Na2CO3','NaHCO3']]) {
  const mix=chemistry.mixture(r(ids[0]),r(ids[1]),data.getReaction(...ids),1,1);
  assert.equal(mix.liquid,0);assert.ok(mix.powder>0);assert.equal(mix.gas,false);
  assert.ok(data.getReaction(...ids).microProductsNote.includes('Kuru katı'));
}
for(const ids of [['Cu(NO3)2','H2O2'],['H2O2','Cu(NO3)2']]) {
  const mix=chemistry.mixture(r(ids[0]),r(ids[1]),null,1,0);
  assert.notEqual(mix.color,'#ffffff');
}
app.dispatch('goPool');
assert.equal(app.state.selectedSlot1,null);
assert.equal((appElement.innerHTML.match(/class="lab-reagent-card/g)||[]).length,12);
assert.equal(appElement.innerHTML.includes('reagent-sample'),false);
assert.equal(appElement.innerHTML.includes('data-table-color'),false);
assert.equal(appElement.innerHTML.includes('SICAK SINIF LABORATUVARI'),false);
assert.ok(appElement.innerHTML.includes('class="panel-chevron"'));
assert.equal(appElement.innerHTML.includes('data-lab-view="angle"'),false);
assert.equal(appElement.innerHTML.includes('chemical-hover-orbit'),false);
assert.ok(appElement.innerHTML.includes('chem-acid'));
assert.ok(appElement.innerHTML.includes('id="labSettingsPanel"'));
assert.ok(appElement.innerHTML.includes('data-action="setTableColor"'));
app.dispatch('setLabView','closeup');assert.equal(app.state.labView,'closeup');
app.dispatch('toggleLabLighting');assert.equal(app.state.labLighting,'dark');
app.dispatch('setTableColor','#3d4547');assert.equal(app.state.tableColor,'#3d4547');
app.dispatch('setLabView','wide');app.dispatch('toggleLabLighting');app.dispatch('setTableColor','#466455');
app.dispatch('toggleReagentPanel');
assert.equal(app.state.reagentPanelCollapsed,true);
assert.ok(appElement.innerHTML.includes('class="lab-panel-content" hidden'));
app.dispatch('toggleReagentPanel');
assert.equal(app.state.reagentPanelCollapsed,false);
app.dispatch('clickReagent','NaHCO3');assert.equal(app.state.labView,'desk','First selection moves to desk view');
app.dispatch('clickReagent','HCl');assert.equal(app.state.labView,'closeup','Second selection moves to close view');
assert.equal(app.state.reagentPanelCollapsed,true);
assert.ok(appElement.innerHTML.includes('has-selection-summary'));
assert.equal((appElement.innerHTML.match(/class="lab-reagent-card/g)||[]).length,2,'Collapsed selection panel only shows chosen reagents');
app.dispatch('startExperiment');assert.equal(app.state.screen,'pool','Cannot leave during filling');
advance(810);assert.equal(app.state.screen,'lab','Prediction opens automatically after the second beaker is filled');
assert.equal(app.state.reagentPanelCollapsed,true);
assert.equal(appElement.innerHTML.includes('Değişimleri Tahmin Et'),false);
assert.ok(appElement.innerHTML.includes('data-action="changeReactants"'),'Reactant-change control is inside the selected-material panel');
app.dispatch('clickReagent','KI');assert.equal(app.state.selectedSlot2,'HCl','Experiment cards are locked');
app.dispatch('toggleObs','gas');app.dispatch('toggleObs','none');
assert.deepEqual(Array.from(app.state.prediction),['none']);
app.dispatch('toggleObs','gas');assert.deepEqual(Array.from(app.state.prediction),['gas']);
app.dispatch('savePrediction');assert.equal(app.state.reagentPanelCollapsed,true);app.dispatch('triggerPour');advance(7000);
assert.equal(app.state.labStep,'observed');assert.equal(app.state.currentTemp,app.state.activeReaction.tempFinal);
assert.ok(appElement.innerHTML.includes('Rapor Aşamasına Geç'));
app.dispatch('toCard');assert.equal(app.state.screen,'card');
assert.ok(appElement.innerHTML.includes('TEPKİME ARENASI') && appElement.innerHTML.includes('mebi-stepper'),'Report screen retains the shared header and four-stage stepper');
app.dispatch('goPool');app.dispatch('clickReagent','HCl');app.dispatch('clickReagent','NaOH');
app.dispatch('clickReagent','HCl');advance(810);assert.equal(app.state.isFilling,false);assert.equal(app.state.selectedSlot1,null);
let pairs=0;
for(let i=0;i<12;i++)for(let j=i+1;j<12;j++) {
  const a=data.REAGENTS[i],b=data.REAGENTS[j],rx=data.getReaction(a.id,b.id);
  assert.equal(data.getReaction(b.id,a.id).canonical,rx.canonical);
  assert.deepEqual(Array.from(data.getReaction(b.id,a.id).obs),Array.from(rx.obs));
  app.state.selectedSlot1=a.id;app.state.selectedSlot2=b.id;app.state.activeReaction=rx;
  app.state.screen='lab';app.state.labStep='observed';app.state.currentTemp=rx.tempFinal;
  for(const screen of ['lab','card','micro']){app.state.screen=screen;app.render(false);assert.ok(appElement.innerHTML.includes(a.f));}
  for(const order of [[a,b],[b,a]]) {
    const mix=chemistry.mixture(...order,rx,1,1);
    assert.ok(Number.isFinite(mix.liquid)&&Number.isFinite(mix.powder));
    if(a.solid&&b.solid)assert.equal(mix.liquid,0);
  }
  pairs++;
}
// Exercise actual Three.js scene geometry and animation using a renderer stub.
// This checks object state, not browser layout or visual quality.
(async()=>{
  const actual=await import(pathToFileURL(path.join(root,'js/vendor/three/three.module.js')).href);
  context.THREE={...actual,WebGLRenderer:class{
    constructor(){this.domElement=element();this.shadowMap={};this.capabilities={getMaxAnisotropy:()=>1}}
    setPixelRatio(){}setSize(){}dispose(){}
    render(scene,camera){renderedScene=scene;renderedCamera=camera;scene.updateMatrixWorld();scene.traverse(o=>{
      assert.ok(o.position.toArray().every(Number.isFinite),'Finite positions: '+o.name);
    })}
  },PMREMGenerator:class{fromEquirectangular(){return {texture:new actual.Texture()}}dispose(){}}};
  context.OrbitControls=class extends actual.EventDispatcher{constructor(camera){super();sceneControls=this;this.camera=camera;this.target=new actual.Vector3()}update(){this.camera.lookAt(this.target);this.camera.updateMatrixWorld()}};
  let source=fs.readFileSync(path.join(root,'js/lab-scene.js'),'utf8').replace(/^import .*;\r?\n/gm,'');
  vm.runInContext(source,context,{filename:'lab-scene.js'});
  const main=renderedScene.getObjectByName('experiment-beaker-1');
  const second=renderedScene.getObjectByName('experiment-beaker-2');
  const mainPlate=renderedScene.getObjectByName('beaker-nameplate-1');
  const secondPlate=renderedScene.getObjectByName('beaker-nameplate-2');
  assert.ok(mainPlate && secondPlate,'Fixed 3D nameplates exist');
  assert.deepEqual(mainPlate.rotation.toArray().slice(0,3),[0,0,0],'Nameplates keep a fixed front-facing world rotation');
  assert.ok(Math.abs(main.scale.y * 1.1 - 0.42) < 0.00001, 'Beakers enlarged by 50% with preserved proportions');
  assert.equal(main.scale.y,second.scale.y,'Both beakers use the same display scale');
  assert.ok(second.position.x - main.position.x < 0.8,'Second beaker closer to the first');
  assert.ok(second.position.x - main.position.x > 0.42 * 0.067 / 0.092,'Beakers do not overlap');
  assert.equal(sceneControls.enableZoom,true);
  assert.ok(sceneControls.minDistance > 0 && sceneControls.maxDistance > sceneControls.minDistance);
  sceneControls.dispatchEvent({type:'start'});
  renderedCamera.position.set(-20,-20,-20);advance(120);
  assert.deepEqual(renderedCamera.position.toArray(),[-5.6,1.6,-4.4],'Camera stays inside minimum room bounds');
  renderedCamera.position.set(20,20,20);advance(120);
  assert.deepEqual(renderedCamera.position.toArray(),[5.6,4.55,5.5],'Camera stays inside maximum room bounds');
  renderedCamera.position.set(0.2,2.4,2.8);
  app.dispatch('goPool');advance(900);
  assert.ok(Math.abs(renderedCamera.position.x - 3.8) < 0.001 && Math.abs(renderedCamera.position.z - 5.5) < 0.001,'Room view uses the Three Faces wide preset');
  assert.equal(main.getObjectByName('solution').visible,false);assert.equal(main.getObjectByName('powder').visible,false);
  app.dispatch('clickReagent','NaHCO3');advance(400);
  assert.equal(main.getObjectByName('powder').visible,true);assert.equal(main.getObjectByName('solution').visible,false);
  app.dispatch('clickReagent','HCl');advance(900);
  assert.ok(Math.abs(renderedCamera.position.x + 0.03) < 0.001 && Math.abs(renderedCamera.position.z - 1.85) < 0.001,'Second selection moves to the close view');
  assert.equal(second.getObjectByName('solution').material.color.getHexString(),'ffffff');
  app.dispatch('startExperiment');app.dispatch('toggleObs','gas');app.dispatch('savePrediction');app.dispatch('triggerPour');advance(3000);
  assert.ok(Math.abs(renderedScene.getObjectByName('surface-ripple').position.x-main.position.x)<0.00001,'Pour landing point is horizontally centered');
  advance(4000);
  assert.equal(main.getObjectByName('solution').visible,true);assert.equal(main.getObjectByName('powder').visible,false);
  app.dispatch('goPool');app.dispatch('clickReagent','KI');app.dispatch('clickReagent','Pb(NO3)2');advance(900);
  app.dispatch('startExperiment');app.dispatch('toggleObs','precipitate');app.dispatch('savePrediction');app.dispatch('triggerPour');advance(7000);
  assert.equal(main.getObjectByName('precipitate').visible,true);
  assert.equal(main.getObjectByName('precipitate').material.color.getHexString(),data.getReaction('KI','Pb(NO3)2').precipColor.slice(1));
  const precipitateFlakes=main.getObjectByName('precipitate-flakes');
  const flakeMatrix=new context.THREE.Matrix4();const flakePosition=new context.THREE.Vector3();let maximumFlakeRadius=0;
  for(let index=0;index<80;index++){precipitateFlakes.getMatrixAt(index,flakeMatrix);flakePosition.setFromMatrixPosition(flakeMatrix);maximumFlakeRadius=Math.max(maximumFlakeRadius,Math.hypot(flakePosition.x,flakePosition.z));}
  assert.ok(maximumFlakeRadius<0.335,'Falling precipitate remains inside the beaker wall');
  app.dispatch('goPool');app.dispatch('clickReagent','CaCO3');app.dispatch('clickReagent','Na2CO3');advance(900);
  app.dispatch('startExperiment');app.dispatch('toggleObs','none');app.dispatch('savePrediction');app.dispatch('triggerPour');advance(3000);
  assert.equal(second.getObjectByName('solid-grains').visible,false,'Source beaker bottom grains are hidden during solid transfer');
  advance(4000);
  assert.equal(main.getObjectByName('solution').visible,false);assert.equal(main.getObjectByName('powder').visible,true);
  for(let i=0;i<12;i++)for(let j=i+1;j<12;j++)for(const ids of [[i,j],[j,i]]) {
    app.state.selectedSlot1=data.REAGENTS[ids[0]].id;app.state.selectedSlot2=data.REAGENTS[ids[1]].id;
    app.state.activeReaction=data.getReaction(app.state.selectedSlot1,app.state.selectedSlot2);
    app.state.screen='lab';app.state.labStep='pouring';app.render(false);advance(350);
    app.state.labStep='reacting';app.render(false);advance(1800);
    app.state.labStep='observed';app.render(false);
    if(data.REAGENTS[i].solid && data.REAGENTS[j].solid) assert.equal(main.getObjectByName('solution').visible,false);
  }
  app.state.selectedSlot1='NaHCO3';app.state.selectedSlot2='HCl';app.state.activeReaction=data.getReaction('NaHCO3','HCl');
  app.state.screen='micro';app.state.cameraTab='reactants';app.render(false);
  assert.ok(appElement.innerHTML.includes('TEPKİME ARENASI') && appElement.innerHTML.includes('mebi-stepper'),'Micro screen retains the shared header and four-stage stepper');
  assert.ok(appElement.innerHTML.includes('data-particle-view="r1"') && appElement.innerHTML.includes('data-particle-view="r2"'),'Reactant cards expose real 3D hosts');
  assert.ok(appElement.innerHTML.includes('particle-formula-line') && appElement.innerHTML.includes('particle-element-legend'),'Each 3D model exposes its formula and element legend');
  assert.ok(appElement.innerHTML.includes('particle-chemical-name'),'Each 3D model exposes its chemical name');
  assert.ok(appElement.innerHTML.includes('particle-ionic-line') && appElement.innerHTML.includes('Na⁺ + HCO₃⁻'),'Ionic charge notation is shown below the 3D model');
  app.state.cameraTab='products';app.render(false);
  assert.ok(appElement.innerHTML.includes('particle-formula-line') && appElement.innerHTML.includes('particle-ionic-line'),'Product cards expose both molecular formula and ionic notation');
  app.state.cameraTab='reactants';app.render(false);
  assert.equal(appElement.innerHTML.includes('zoomParticle') || appElement.innerHTML.includes('particle-zoom-badge') || appElement.innerHTML.includes('sub-zoom-hint'),false,'Particle cards have no enlargement controls');
  const particleHosts=[Object.assign(element(),{clientWidth:360,clientHeight:190,dataset:{particleView:'r1'},children:[],replaceChildren(child){this.children=[child]},getAttribute(){return '3D model'},querySelector(selector){return selector==='canvas'&&this.children.length?this.children[0]:null}}),
    Object.assign(element(),{clientWidth:360,clientHeight:190,dataset:{particleView:'r2'},children:[],replaceChildren(child){this.children=[child]},getAttribute(){return '3D model'},querySelector(selector){return selector==='canvas'&&this.children.length?this.children[0]:null}})];
  document.querySelectorAll=selector=>selector==='.particle-3d-host[data-particle-view]'?particleHosts:[];
  let particleSource=fs.readFileSync(path.join(root,'js/particle-scene.js'),'utf8').replace(/^import .*;\r?\n/gm,'');
  for (const value of ['0xffffff','0x909090','0x3050f8','0xff0d0d','0x1ff01f','0xab5cf2','0x575961']) assert.ok(particleSource.includes(value),'Official Jmol CPK value present: '+value);
  for (const formula of ['H2O','H2O2','NH3','CO2','O2','Cl2','NO3','CO3','HCO3','SO4']) assert.ok(particleSource.includes(formula+':'),'Standard structure template present: '+formula);
  assert.ok(particleSource.includes('ION_CHARGES') && particleSource.includes('ionicSpecies') && !particleSource.includes('hydratedIon'),'Dissolved ions are separated without hydration-shell models');
  assert.ok(particleSource.includes('0.038 * scale'),'Bond thickness scales with the molecular model');
  assert.ok(particleSource.includes("viewer.dragMode === 'rotate'") && particleSource.includes('viewer.model.position.x'),'Particle viewer supports object rotation and x/y model panning');
  vm.runInContext(particleSource,context,{filename:'particle-scene.js'});
  context.ParticleScene.sync(app.state);
  advance(20);
  assert.equal(particleHosts.filter(host=>host.children.length===1).length,2,'Both reactant cards mount a WebGL canvas');
  assert.ok(renderedScene.children.some(object=>object.type==='Group'),'Particle scene builds selectable 3D groups');
  let selectableRoots=0;renderedScene.traverse(object=>{if(object.userData&&object.userData.selectableRoot)selectableRoots++});
  assert.equal(selectableRoots,1,'Each particle card renders one selectable 3D formula-unit model');
  context.ParticleScene.disposeCards();
  app.state.collection=[{canonical:'test'}];
  context.confirm=()=>false;app.dispatch('resetExperiment');assert.equal(app.state.collection.length,1,'Reset cancellation preserves discoveries');
  context.confirm=()=>true;app.dispatch('resetExperiment');assert.equal(app.state.collection.length,0,'Confirmed reset clears discoveries');
  console.log(JSON.stringify({passed:true,pairs,checks:'12 reagent appearances, 66 pairs in both orders, report/micro rendering, fill race guards, prediction exclusivity, Three.js empty/powder/liquid/precipitate states',browserVisualVerification:false},null,2));
})().catch(error=>{console.error(error);process.exitCode=1});
