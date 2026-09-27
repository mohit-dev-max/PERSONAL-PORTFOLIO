/**
 * MOHIT — Synthetic Micro-Audio Feedback System
 * Pure Web Audio API synthesized interface sounds (Zero external MP3 dependencies)
 */

(function () {
  'use strict';

  let audioCtx = null;
  let isSoundEnabled = localStorage.getItem('mohit_sound_enabled') === 'true';

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Soft high-tech micro hover sound
  function playHoverSound() {
    if (!isSoundEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(680, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } catch (e) {}
  }

  // Tactile click sound
  function playClickSound() {
    if (!isSoundEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, audioCtx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.06);
    } catch (e) {}
  }

  // Harmonious success chime
  function playSuccessSound() {
    if (!isSoundEnabled || !audioCtx) return;
    try {
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.07);

        gain.gain.setValueAtTime(0.03, audioCtx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + idx * 0.07 + 0.35);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(audioCtx.currentTime + idx * 0.07);
        osc.stop(audioCtx.currentTime + idx * 0.07 + 0.35);
      });
    } catch (e) {}
  }

  function updateSoundButtonUI() {
    const btn = document.getElementById('sound-toggle-btn');
    if (!btn) return;
    btn.setAttribute('aria-label', isSoundEnabled ? 'Mute Interface Audio' : 'Enable Interface Audio');
    const soundOnIcon = btn.querySelector('.icon-sound-on');
    const soundOffIcon = btn.querySelector('.icon-sound-off');
    if (soundOnIcon && soundOffIcon) {
      soundOnIcon.style.display = isSoundEnabled ? 'block' : 'none';
      soundOffIcon.style.display = isSoundEnabled ? 'none' : 'block';
    }
  }

  window.SoundSystem = {
    init: initAudio,
    hover: playHoverSound,
    click: playClickSound,
    success: playSuccessSound,
    toggle: function () {
      initAudio();
      isSoundEnabled = !isSoundEnabled;
      localStorage.setItem('mohit_sound_enabled', isSoundEnabled);
      updateSoundButtonUI();
      if (isSoundEnabled) playSuccessSound();
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    updateSoundButtonUI();
    const btn = document.getElementById('sound-toggle-btn');
    if (btn) {
      btn.addEventListener('click', window.SoundSystem.toggle);
    }

    // Attach to interactive elements
    document.querySelectorAll('button, a, .clickable').forEach(el => {
      el.addEventListener('mouseenter', window.SoundSystem.hover);
      el.addEventListener('click', () => {
        initAudio();
        window.SoundSystem.click();
      });
    });
  });
})();
