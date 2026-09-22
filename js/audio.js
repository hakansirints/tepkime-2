/**
 * MEBİ Web Audio API Ses Efektleri Motoru (audio.js)
 * Sıfır harici dosya/ağ bağımlılığı; tarayıcı tabanlı dinamik ses sentezleyici.
 */

(function(window) {
  'use strict';

  var audioCtx = null;
  var isAudioEnabled = true;

  // Ses tercihini localStorage'dan oku
  try {
    var savedSound = localStorage.getItem('mebi-sound-enabled');
    if (savedSound !== null) {
      isAudioEnabled = (savedSound === 'true');
    }
  } catch (e) {
    isAudioEnabled = true;
  }

  function getAudioContext() {
    if (!audioCtx) {
      var AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  /**
   * 1. Buton Hover Sesi (Mikro Gamified Blip: 520Hz -> 720Hz, 45ms)
   */
  function playHoverSound() {
    if (!isAudioEnabled) return;
    var ctx = getAudioContext();
    if (!ctx) return;

    try {
      var now = ctx.currentTime;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(720, now + 0.04);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch (e) {}
  }

  /**
   * 2. Buton Tıklama Sesi (3D Katı Basılma Pop/Woodblock Efekti: 75ms)
   */
  function playClickSound() {
    if (!isAudioEnabled) return;
    var ctx = getAudioContext();
    if (!ctx) return;

    try {
      var now = ctx.currentTime;

      // Gövde dalgası (Düşen üçgen dalga)
      var osc1 = ctx.createOscillator();
      var gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(320, now);
      osc1.frequency.exponentialRampToValueAtTime(110, now + 0.07);

      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.075);

      // Tok klik çıtırtısı
      var osc2 = ctx.createOscillator();
      var gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(640, now);
      osc2.frequency.exponentialRampToValueAtTime(220, now + 0.035);

      gain2.gain.setValueAtTime(0.08, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now);
      osc2.stop(now + 0.04);
    } catch (e) {}
  }

  /**
   * 3. Sıvı Dökme Sesi (Beherden Behere Sıvı Akışı: ~900ms)
   */
  function playPourSound() {
    if (!isAudioEnabled) return;
    var ctx = getAudioContext();
    if (!ctx) return;

    try {
      var now = ctx.currentTime;
      var duration = 0.9;

      // Su akışı için modüle edilmiş sinüs ve gürültü sentezi
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(680, now + duration * 0.5);
      osc.frequency.linearRampToValueAtTime(520, now + duration);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {}
  }

  /**
   * 4. Kimyasal Reaksiyon / Köpürme Sesi (Gaz ve Cızırtı: ~1.2s)
   */
  function playFizzSound() {
    if (!isAudioEnabled) return;
    var ctx = getAudioContext();
    if (!ctx) return;

    try {
      var now = ctx.currentTime;
      var bufferSize = ctx.sampleRate * 1.2;
      var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      var output = buffer.getChannelData(0);
      for (var i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.15;
      }

      var whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      var filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.linearRampToValueAtTime(2400, now + 0.6);
      filter.frequency.linearRampToValueAtTime(1400, now + 1.2);
      filter.Q.setValueAtTime(3.0, now);

      var gain = ctx.createGain();
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 1.2);
    } catch (e) {}
  }

  /**
   * 5. Başarı / Yeni Tepkime Keşif Fanfarı (3 Tonlu Arpej: C5, E5, G5)
   */
  function playSuccessSound() {
    if (!isAudioEnabled) return;
    var ctx = getAudioContext();
    if (!ctx) return;

    try {
      var now = ctx.currentTime;
      var notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach(function(freq, index) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        var startAt = now + index * 0.11;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startAt);

        gain.gain.setValueAtTime(0.12, startAt);
        gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startAt);
        osc.stop(startAt + 0.35);
      });
    } catch (e) {}
  }

  function setSoundEnabled(enabled) {
    isAudioEnabled = !!enabled;
    try {
      localStorage.setItem('mebi-sound-enabled', isAudioEnabled);
    } catch (e) {}
  }

  function isSoundActive() {
    return isAudioEnabled;
  }

  // Global ses API'sini pencereye bağla
  window.MebiAudio = {
    playHover: playHoverSound,
    playClick: playClickSound,
    playPour: playPourSound,
    playFizz: playFizzSound,
    playSuccess: playSuccessSound,
    setEnabled: setSoundEnabled,
    isEnabled: isSoundActive
  };

})(window);
