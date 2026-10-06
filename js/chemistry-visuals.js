(function (root) {
  'use strict';
  var CLEAR = '#ffffff';
  var BLUE = '#57a9dd';
  function appearance(reagent) {
    if (!reagent) return { phase: 'empty', color: CLEAR, opacity: 0 };
    return { phase: reagent.solid ? 'powder' : 'solution',
      color: reagent.solid ? CLEAR : (reagent.id === 'Cu(NO3)2' ? BLUE : CLEAR),
      opacity: reagent.solid ? 1 : (reagent.id === 'Cu(NO3)2' ? 0.62 : 0.14) };
  }
  // Visual amounts are normalized scene units, not a quantitative chemistry model.
  function mixture(a, b, reaction, transfer, reactionProgress) {
    transfer = Math.max(0, Math.min(1, transfer));
    reactionProgress = Math.max(0, Math.min(1, reactionProgress));
    var liquid = (a && !a.solid ? 0.42 : 0) + (b && !b.solid ? 0.34 * transfer : 0);
    var powder = (a && a.solid ? 0.42 : 0) + (b && b.solid ? 0.34 * transfer : 0);
    var active = reaction && reaction.typeCategory !== 'none';
    if (liquid > 0) {
      var solid = a && a.solid ? a : (b && b.solid ? b : null);
      if (solid && solid.id !== 'CaCO3') powder *= 1 - (active ? reactionProgress : transfer);
      else if (solid && active) powder *= 1 - reactionProgress * 0.9;
    }
    var copper = (a && a.id === 'Cu(NO3)2') || (b && b.id === 'Cu(NO3)2' && transfer > 0);
    var color = copper ? BLUE : CLEAR;
    var target = color;
    if (active && reactionProgress > 0) {
      if (reaction.typeCategory === 'ppt' && copper) target = CLEAR;
      else if (reaction.toColor) target = reaction.toColor;
    }
    return { liquid: liquid, powder: powder, color: color, targetColor: target,
      opacity: copper || (active && reaction.toColor && reaction.typeCategory !== 'ppt') ? 0.62 : 0.14,
      gas: !!(liquid && active && reactionProgress > 0 && reaction.obs.indexOf('gas') !== -1),
      precipitate: !!(liquid && active && reactionProgress > 0 && reaction.obs.indexOf('precipitate') !== -1) };
  }
  function spectatorSpecies(reaction) {
    var text = reaction && reaction.spectators || '';
    return ['Na⁺','K⁺','Ca²⁺','Cu²⁺','Pb²⁺','Ag⁺','Cl⁻','NO₃⁻','OH⁻','NH₄⁺','CO₃²⁻','HCO₃⁻']
      .filter(function(symbol) { return text.indexOf(symbol) !== -1; });
  }
  root.MebiChemistry = { appearance: appearance, mixture: mixture, spectatorSpecies: spectatorSpecies };
})(typeof window !== 'undefined' ? window : globalThis);
