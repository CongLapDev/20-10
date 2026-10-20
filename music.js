(() => {
  'use strict';

  // Romantic Ambient Music Generator & Player for Ánh
  // Built using Web Audio API: 100% reliable, zero network latency, works on mobile & desktop!

  let audioCtx = null;
  let isPlaying = false;
  let melodyTimeout = null;
  let masterGain = null;

  // Romantic progression in C major / A minor with dreamy jazz-pop voicings
  // Notes in Hz
  const NOTES = {
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
    C6: 1046.50
  };

  // Tender romantic melody sequences (frequencies & duration in beats)
  const PHRASES = [
    // Phrase 1: "Ánh yêu dấu..."
    [
      { note: NOTES.E4, dur: 1 }, { note: NOTES.G4, dur: 1 }, { note: NOTES.C5, dur: 2 },
      { note: NOTES.B4, dur: 1 }, { note: NOTES.A4, dur: 1 }, { note: NOTES.G4, dur: 2 },
      { note: NOTES.F4, dur: 1 }, { note: NOTES.A4, dur: 1 }, { note: NOTES.D5, dur: 2 },
      { note: NOTES.C5, dur: 3 }, { note: null, dur: 1 }
    ],
    // Phrase 2: "Dù cách xa bao trùng khơi..."
    [
      { note: NOTES.E4, dur: 1 }, { note: NOTES.A4, dur: 1 }, { note: NOTES.C5, dur: 2 },
      { note: NOTES.B4, dur: 1.5 }, { note: NOTES.C5, dur: 0.5 }, { note: NOTES.D5, dur: 2 },
      { note: NOTES.E5, dur: 2 }, { note: NOTES.D5, dur: 1 }, { note: NOTES.C5, dur: 1 },
      { note: NOTES.B4, dur: 2 }, { note: NOTES.G4, dur: 2 }
    ],
    // Phrase 3: "Nụ cười của em luôn sưởi ấm anh..."
    [
      { note: NOTES.C5, dur: 1 }, { note: NOTES.D5, dur: 1 }, { note: NOTES.E5, dur: 2 },
      { note: NOTES.G5, dur: 2 }, { note: NOTES.E5, dur: 2 },
      { note: NOTES.F5, dur: 1.5 }, { note: NOTES.E5, dur: 0.5 }, { note: NOTES.D5, dur: 2 },
      { note: NOTES.C5, dur: 3 }, { note: null, dur: 1 }
    ],
    // Phrase 4: "Mãi yêu em, Ánh của anh ♡"
    [
      { note: NOTES.A4, dur: 1 }, { note: NOTES.C5, dur: 1 }, { note: NOTES.E5, dur: 2 },
      { note: NOTES.D5, dur: 2 }, { note: NOTES.G4, dur: 1 }, { note: NOTES.B4, dur: 1 },
      { note: NOTES.C5, dur: 4 }, { note: null, dur: 2 }
    ]
  ];

  // Accompaniment chords (bass + arpeggio harmony)
  const CHORDS = [
    [NOTES.C3, NOTES.G3, NOTES.C4, NOTES.E4], // C
    [NOTES.A3, NOTES.E4, NOTES.A4, NOTES.C5], // Am
    [NOTES.F3, NOTES.C4, NOTES.F4, NOTES.A4], // F
    [NOTES.G3, NOTES.D4, NOTES.G4, NOTES.B4]  // G
  ];

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Play a soft, warm music box / acoustic chime piano note
  function playNote(freq, time, duration = 1.2, volume = 0.25, isHarmony = false) {
    if (!freq || !audioCtx) return;

    const ctx = audioCtx;
    const osc = ctx.createOscillator();
    const oscHarmonic = ctx.createOscillator();
    const noteGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Warm mellow piano timbre: Sine + gentle Triangle octave overtone
    osc.type = isHarmony ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, time);

    oscHarmonic.type = 'sine';
    oscHarmonic.frequency.setValueAtTime(freq * 2, time);

    // Warm low-pass filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isHarmony ? 900 : 1800, time);
    filter.frequency.exponentialRampToValueAtTime(350, time + duration);

    // Expressive chime envelope: gentle fast attack, mellow exponential release
    const attack = isHarmony ? 0.08 : 0.02;
    noteGain.gain.setValueAtTime(0.0001, time);
    noteGain.gain.linearRampToValueAtTime(volume, time + attack);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(filter);
    oscHarmonic.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(masterGain);

    osc.start(time);
    oscHarmonic.start(time);
    osc.stop(time + duration);
    oscHarmonic.stop(time + duration);
  }

  // Soft sparkle / magical chime when a flower or envelope is touched
  window.playSparkleChime = function () {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const chimeNotes = [NOTES.C5, NOTES.E5, NOTES.G5, NOTES.B5, NOTES.E6];
      chimeNotes.forEach((note, index) => {
        playNote(note, now + index * 0.07, 0.9, 0.18, false);
      });
    } catch {
      // Audio context might not be initialized yet
    }
  };

  let phraseIndex = 0;
  let beatIndex = 0;
  const BEAT_SEC = 0.58; // ~103 bpm, gentle waltz feel

  function scheduleMelodyLoop() {
    if (!isPlaying || !audioCtx) return;

    const ctx = audioCtx;
    const now = ctx.currentTime + 0.05;
    const currentPhrase = PHRASES[phraseIndex % PHRASES.length];
    const currentChord = CHORDS[phraseIndex % CHORDS.length];

    let offset = 0;

    // Schedule melody notes for this phrase
    currentPhrase.forEach(item => {
      if (item.note) {
        playNote(item.note, now + offset, item.dur * BEAT_SEC * 1.5, 0.28, false);
      }
      offset += item.dur * BEAT_SEC;
    });

    // Schedule gentle background arpeggio accompaniment
    let arpTime = 0;
    while (arpTime < offset) {
      currentChord.forEach((chordNote, idx) => {
        if (arpTime + idx * 0.35 < offset) {
          playNote(chordNote, now + arpTime + idx * 0.35, 1.4, 0.10, true);
        }
      });
      arpTime += BEAT_SEC * 2.8;
    }

    phraseIndex++;
    melodyTimeout = setTimeout(scheduleMelodyLoop, (offset - 0.2) * 1000);
  }

  function startMusic() {
    const ctx = getAudioContext();
    isPlaying = true;
    phraseIndex = 0;
    masterGain.gain.cancelScheduledValues(ctx.currentTime);
    masterGain.gain.setValueAtTime(masterGain.gain.value || 0.001, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.75, ctx.currentTime + 1.2);
    scheduleMelodyLoop();
    updateUI(true);
  }

  function stopMusic() {
    if (!audioCtx) return;
    isPlaying = false;
    clearTimeout(melodyTimeout);
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);
    updateUI(false);
  }

  function toggleMusic() {
    if (isPlaying) {
      stopMusic();
    } else {
      startMusic();
    }
  }

  function updateUI(playing) {
    const btn = document.getElementById('musicToggle');
    if (!btn) return;
    btn.setAttribute('aria-pressed', String(playing));
    btn.classList.toggle('is-playing', playing);
    const label = btn.querySelector('.music-label');
    if (label) {
      label.textContent = playing ? 'Đang phát nhạc tình yêu' : 'Bật nhạc cho Ánh';
    }
  }

  // Setup DOM elements and event listeners on load
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('musicToggle');
    if (btn) {
      btn.addEventListener('click', toggleMusic);
    }

    // Auto-init audio on first user touch anywhere to comply with browser autoplay policies
    const enableAudioOnFirstTouch = () => {
      document.removeEventListener('click', enableAudioOnFirstTouch);
      document.removeEventListener('touchstart', enableAudioOnFirstTouch);
      // If user hasn't toggled yet, start music gently!
      if (!isPlaying) {
        startMusic();
      }
    };
    document.addEventListener('click', enableAudioOnFirstTouch, { once: true });
    document.addEventListener('touchstart', enableAudioOnFirstTouch, { once: true });

    // Play sparkle when bouquet flowers or envelope is touched
    document.addEventListener('bouquet:rose', () => {
      if (window.playSparkleChime) window.playSparkleChime();
    });
    const openCardBtn = document.getElementById('openCard');
    if (openCardBtn) {
      openCardBtn.addEventListener('click', () => {
        if (window.playSparkleChime) window.playSparkleChime();
      });
    }
  });

  window.toggleRomanticMusic = toggleMusic;
})();
