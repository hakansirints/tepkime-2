const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require('playwright');
const sharp = require('sharp');

const output = process.env.LAB_ARTIFACT_DIR || path.join(os.tmpdir(), 'tepkime-lab-verification');
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.LAB_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: true,
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => localStorage.setItem('mebi_hide_welcome_modal', 'true'));
    await page.goto(process.env.LAB_URL || 'http://127.0.0.1:8173/', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.LabScene && window.LabScene.available);
    console.log('WebGL laboratory ready');
    await page.evaluate(async () => {
      document.querySelectorAll('.mebi-modal-overlay.is-active, .mebi-modal-overlay.is-open').forEach(el => el.classList.remove('is-active', 'is-open'));
      const close = document.getElementById('btnCloseWelcomeModal');
      if (close) close.click();
      localStorage.setItem('mebi_hide_welcome_modal', 'true');
    });
    let changedPixels = 0;
    if (process.env.LAB_LAYOUT_ONLY) {
      await page.evaluate(async () => {
        const app = window.TepkimeArenasi;
        app.dispatch('goPool');
        app.dispatch('clickReagent', 'NaHCO3');
        app.dispatch('clickReagent', 'Pb(NO3)2');
        await new Promise(resolve => setTimeout(resolve, 850));
        app.dispatch('startExperiment');
      });
    } else {
    await page.screenshot({ path: path.join(output, 'menu.png') });
    await page.locator('.arena-menu-actions [data-action="goPool"]').click();
    await page.locator('[data-action="clickReagent"][data-arg="NaHCO3"]').click();
    await page.locator('[data-action="clickReagent"][data-arg="HCl"]').click();
    await page.waitForFunction(() => !window.TepkimeArenasi.state.isFilling);
    await page.locator('[data-action="startExperiment"]').click();
    assert.equal(await page.locator('#app').getAttribute('data-screen'), 'lab');
    await page.screenshot({ path: path.join(output, 'desktop-lab.png') });
    console.log('Desktop layout captured');
    const pixels = await sharp(await page.locator('#labWorld canvas').screenshot()).removeAlpha().raw().toBuffer();
    assert.ok(new Set(pixels).size > 100, 'WebGL canvas must contain a rendered laboratory');
    await page.locator('[data-action="toggleObs"][data-arg="gas"]').click();
    await page.locator('[data-action="savePrediction"]').click();
    assert.equal(await page.locator('.lab-beaker-target').count(), 1);
    await page.locator('[data-action="triggerPour"]').click();
    await page.waitForFunction(() => window.TepkimeArenasi.state.labStep === 'observed');
    assert.equal(await page.locator('[data-action="toCard"]').count(), 1);
    await page.screenshot({ path: path.join(output, 'gas-result.png') });
    const gasFrame1 = await sharp(await page.locator('#labWorld canvas').screenshot()).resize(400, 250).removeAlpha().raw().toBuffer();
    await page.waitForTimeout(250);
    const gasFrame2 = await sharp(await page.locator('#labWorld canvas').screenshot()).resize(400, 250).removeAlpha().raw().toBuffer();
    changedPixels = gasFrame1.reduce((count, value, i) => count + (Math.abs(value - gasFrame2[i]) > 2 ? 1 : 0), 0);
    assert.ok(changedPixels > 10, 'Gas bubbles must animate in the canvas');
    await page.locator('[data-action="toCard"]').click();
    assert.equal(await page.locator('#app').getAttribute('data-screen'), 'card');
    await page.locator('[data-action="setReportTab"][data-arg="quiz"]').first().click();
    await page.screenshot({ path: path.join(output, 'report.png') });

    await page.evaluate(async () => {
      const app = window.TepkimeArenasi;
      app.dispatch('goPool');
      app.dispatch('clickReagent', 'KI');
      app.dispatch('clickReagent', 'Pb(NO3)2');
      await new Promise(resolve => setTimeout(resolve, 850));
        app.dispatch('startExperiment');
      app.dispatch('toggleObs', 'precipitate');
      app.dispatch('savePrediction');
    });
    const source = await page.locator('.lab-beaker-target').boundingBox();
    const destination = await page.locator('#mainVessel').boundingBox();
    await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
    await page.mouse.down();
    await page.mouse.move(destination.x + destination.width / 2, source.y + 15, { steps: 15 });
    await page.mouse.up();
    await page.waitForFunction(() => window.TepkimeArenasi.state.labStep === 'observed');
    await page.screenshot({ path: path.join(output, 'precipitate-result.png') });
    console.log('Pour button, raycast drag and reaction rendering passed');

    await page.evaluate(async () => {
      const app = window.TepkimeArenasi;
      app.dispatch('goPool');
      app.dispatch('clickReagent', 'HCl');
      app.dispatch('clickReagent', 'NaOH');
      await new Promise(resolve => setTimeout(resolve, 850));
        app.dispatch('startExperiment');
      app.dispatch('toggleObs', 'temp');
      app.dispatch('savePrediction');
      app.dispatch('triggerPour');
    });
    await page.waitForFunction(() => window.TepkimeArenasi.state.labStep === 'observed');
    const heat = await page.evaluate(() => ({ actual: window.TepkimeArenasi.state.currentTemp,
      expected: window.TepkimeArenasi.state.activeReaction.tempFinal,
      text: document.getElementById('digitalTempValue').textContent }));
    assert.equal(heat.actual, heat.expected);
    assert.equal(heat.text, heat.expected.toFixed(1));
    await page.screenshot({ path: path.join(output, 'temperature-result.png') });
    }

    for (const viewport of [{ width: 1024, height: 768 }, { width: 844, height: 390 }, { width: 667, height: 375 }]) {
      await page.setViewportSize(viewport);
      await page.evaluate(() => window.TepkimeArenasi.dispatch('redoPrediction'));
      await page.waitForTimeout(700);
      await page.screenshot({ path: path.join(output, `lab-${viewport.width}.png`) });
      const layout = await page.evaluate(async () => {
        const selectors = ['.mebi-topbar', '.mebi-stepper', '.lab-experiment-heading', '.bench-dock', '.lab-action-bar', '#mainVessel', '#dragReagentWrap', '#digitalThermoWrap'];
        return selectors.map(selector => {
          const r = document.querySelector(selector).getBoundingClientRect();
          return { selector, x: r.x, y: r.y, w: r.width, h: r.height, right: r.right, bottom: r.bottom };
        });
      });
      console.log(JSON.stringify({ viewport, layout }));
      for (const rect of layout) {
        assert.ok(rect.x >= 0 && rect.right <= viewport.width + 1, `${rect.selector} horizontal overflow`);
        assert.ok(rect.y >= 0 && rect.bottom <= viewport.height + 1, `${rect.selector} vertical overflow`);
      }
      const firstLabel = layout.find(rect => rect.selector === '#mainVessel');
      const secondLabel = layout.find(rect => rect.selector === '#dragReagentWrap');
      assert.ok(firstLabel.right + 5 <= secondLabel.x, 'Reagent labels must not overlap');
      const toolbarFits = await page.locator('.mebi-topbar').evaluate(el => el.scrollWidth <= el.clientWidth + 2);
      assert.ok(toolbarFits, 'Top toolbar content must fit');
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.locator('[data-lab-view="close"]').click();
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(output, 'close-view.png') });
    await page.locator('[data-lab-view="reset"]').click();
    await page.locator('[data-action="toggleTheme"]').click();
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(output, 'dark-lab.png') });
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark');
    if (process.env.LAB_LAYOUT_ONLY) {
      assert.deepEqual(errors, []);
      console.log(JSON.stringify({ passed: true, output, layoutOnly: true, errors }));
      return;
    }
    const matrix = await page.evaluate(async () => {
      const app = window.TepkimeArenasi;
      const reagents = window.MebiData.REAGENTS;
      let pairs = 0;
      for (let i = 0; i < reagents.length; i++) {
        for (let j = i + 1; j < reagents.length; j++) {
          app.state.selectedSlot1 = reagents[i].id;
          app.state.selectedSlot2 = reagents[j].id;
          app.state.activeReaction = window.MebiData.getReaction(reagents[i].id, reagents[j].id);
          app.state.labStep = 'observed';
          app.state.currentTemp = app.state.activeReaction.tempFinal;
          app.render(false);
          if (document.querySelectorAll('.reagent-tag').length !== 2) throw new Error('Missing reagent content');
          pairs++;
        }
      }
      return { pairs, reagents: reagents.length };
    });
    assert.deepEqual(matrix, { pairs: 66, reagents: 12 });
    console.log('All 66 reagent pairs render with existing content');
    assert.deepEqual(errors, [], 'No browser JavaScript errors');
    console.log(JSON.stringify({ passed: true, output, errors, matrix, changedPixels }));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
