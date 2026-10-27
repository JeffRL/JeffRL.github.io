// Sounds for the wish, all made with the Web Audio API, so there are no sound files to load.
// (luck.js, stars.js and content.js share names with this file, so keep names different)

let soundContext = null;
// every sound for the current wish goes through this, so skipping can cut them all off at once
let soundGroup = null;
// where all groups end up: a dry path plus a reverb, then a compressor so the bass can hit hard without crackling
let soundOut = null;
let roomEcho = null;
let noiseBuffer = null;
let crunchCurve = null;
let soundOn = true;

const groupVolume = 0.5;

try {
  soundOn = localStorage.getItem("dailystargazing-sound") !== "off";
} catch (error) {
  // keep sound on
}

// browsers only allow sound after a click, so this gets called from the wish button
function startSound() {
  if (!soundContext) {
    const AudioType = window.AudioContext || window.webkitAudioContext;
    if (!AudioType) {
      return;
    }
    soundContext = new AudioType();
    noiseBuffer = makeNoise();
    crunchCurve = makeCrunch();
    buildOutput();
  }
  if (soundContext.state === "suspended") {
    soundContext.resume();
  }
  newSoundGroup();
}

function buildOutput() {
  const squeeze = soundContext.createDynamicsCompressor();
  squeeze.threshold.value = -18;
  squeeze.knee.value = 12;
  squeeze.ratio.value = 4;
  squeeze.attack.value = 0.005;
  squeeze.release.value = 0.25;
  squeeze.connect(soundContext.destination);

  soundOut = soundContext.createGain();
  soundOut.connect(squeeze);

  roomEcho = soundContext.createConvolver();
  roomEcho.buffer = makeRoom(2.6);
  const wet = soundContext.createGain();
  wet.gain.value = 0.32;
  roomEcho.connect(wet);
  wet.connect(soundOut);
}

// fades out whatever is playing and starts a fresh group
function newSoundGroup() {
  if (!soundContext) {
    return;
  }
  if (soundGroup) {
    const oldGroup = soundGroup;
    oldGroup.gain.setTargetAtTime(0, soundContext.currentTime, 0.05);
    setTimeout(function () {
      oldGroup.disconnect();
    }, 600);
  }
  soundGroup = soundContext.createGain();
  soundGroup.gain.value = soundOn ? groupVolume : 0;
  soundGroup.connect(soundOut);
  soundGroup.connect(roomEcho);
}

function toggleSound() {
  soundOn = !soundOn;
  try {
    localStorage.setItem("dailystargazing-sound", soundOn ? "on" : "off");
  } catch (error) {
    // not saved, that's fine
  }
  if (soundGroup) {
    soundGroup.gain.setTargetAtTime(soundOn ? groupVolume : 0, soundContext.currentTime, 0.05);
  }
  return soundOn;
}

function canPlay() {
  return soundOn && soundContext && soundGroup;
}

function makeNoise() {
  const length = soundContext.sampleRate * 2;
  const buffer = soundContext.createBuffer(1, length, soundContext.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

// a made-up room echo: random noise fading out, different on each side so it sounds wide
function makeRoom(seconds) {
  const length = Math.floor(soundContext.sampleRate * seconds);
  const buffer = soundContext.createBuffer(2, length, soundContext.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
    }
  }
  return buffer;
}

// a shape that squashes loud parts of a sound, which adds grit so bass can be heard on small speakers
function makeCrunch() {
  const curve = new Float32Array(1024);
  for (let i = 0; i < curve.length; i++) {
    const x = (i / (curve.length - 1)) * 2 - 1;
    curve[i] = Math.tanh(x * 3);
  }
  return curve;
}

// semitones away from A4 (440Hz) to a frequency
function note(semitones) {
  return 440 * Math.pow(2, semitones / 12);
}

// something to plug a sound into, placed left (-1) to right (1)
function placeAt(pan) {
  if (!soundContext.createStereoPanner || !pan) {
    return soundGroup;
  }
  const panner = soundContext.createStereoPanner();
  panner.pan.value = pan;
  panner.connect(soundGroup);
  return panner;
}

// spreads chord notes out: first one near the middle, then further out on alternating sides
function spread(index) {
  const side = index % 2 === 0 ? -1 : 1;
  return side * Math.min(0.15 + index * 0.12, 0.85);
}

/* ---------- basic sounds ---------- */

// a harp-like pluck: a few tones that fade out quickly
function pluck(freq, delay, volume, length, pan) {
  const start = soundContext.currentTime + delay;
  const out = placeAt(pan);
  const partials = [[1, "triangle", 1], [2, "sine", 0.3], [3, "sine", 0.12]];
  for (let i = 0; i < partials.length; i++) {
    const osc = soundContext.createOscillator();
    const gain = soundContext.createGain();
    osc.type = partials[i][1];
    osc.frequency.value = freq * partials[i][0];
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume * partials[i][2], start + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length / (i + 1));
    osc.connect(gain);
    gain.connect(out);
    osc.start(start);
    osc.stop(start + length + 0.1);
  }
}

// one bell tone made of a few tones that aren't exact multiples, which is what makes it sound like metal
function bellTone(freq, start, volume, length, out) {
  const ratios = [1, 2.76, 5.4, 8.93];
  const levels = [1, 0.45, 0.22, 0.1];
  for (let i = 0; i < ratios.length; i++) {
    const osc = soundContext.createOscillator();
    const gain = soundContext.createGain();
    osc.type = "sine";
    osc.frequency.value = freq * ratios[i];
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume * levels[i], start + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length / (1 + i * 0.6));
    osc.connect(gain);
    gain.connect(out);
    osc.start(start);
    osc.stop(start + length + 0.1);
  }
}

// a bell, plus a copy tuned a tiny bit off on the other side so it shimmers and sounds wider
function bell(freq, delay, volume, length, pan) {
  const start = soundContext.currentTime + delay;
  const side = pan || 0.3;
  bellTone(freq, start, volume, length, placeAt(side));
  bellTone(freq * 1.004, start + 0.012, volume * 0.6, length, placeAt(-side * 0.8));
}

// a soft tone that fades in and out
function swell(freq, delay, volume, length) {
  const start = soundContext.currentTime + delay;
  const osc = soundContext.createOscillator();
  const gain = soundContext.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + length * 0.4);
  gain.gain.linearRampToValueAtTime(0, start + length);
  osc.connect(gain);
  gain.connect(soundGroup);
  osc.start(start);
  osc.stop(start + length + 0.1);
}

// a warm low chord: buzzy tones with the top cut off so only the body is left
function lowPad(freqs, delay, volume, length) {
  const start = soundContext.currentTime + delay;
  const filter = soundContext.createBiquadFilter();
  const gain = soundContext.createGain();
  filter.type = "lowpass";
  filter.frequency.value = 500;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  filter.connect(gain);
  gain.connect(soundGroup);
  for (let i = 0; i < freqs.length; i++) {
    // two slightly different copies of each note make it sound thicker
    for (let j = 0; j < 2; j++) {
      const osc = soundContext.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = freqs[i] * (j === 0 ? 0.997 : 1.003);
      osc.connect(filter);
      osc.start(start);
      osc.stop(start + length + 0.1);
    }
  }
}

// a warm chord like a horn section: buzzy tones where the filter opens up and closes again
function brassSwell(freqs, delay, volume, length) {
  const start = soundContext.currentTime + delay;
  const filter = soundContext.createBiquadFilter();
  const gain = soundContext.createGain();
  filter.type = "lowpass";
  filter.Q.value = 1.5;
  filter.frequency.setValueAtTime(300, start);
  filter.frequency.exponentialRampToValueAtTime(1800, start + length * 0.3);
  filter.frequency.exponentialRampToValueAtTime(400, start + length);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + length * 0.25);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  filter.connect(gain);
  gain.connect(soundGroup);
  for (let i = 0; i < freqs.length; i++) {
    for (let j = 0; j < 2; j++) {
      const osc = soundContext.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = freqs[i] * (j === 0 ? 0.996 : 1.004);
      osc.connect(filter);
      osc.start(start);
      osc.stop(start + length + 0.1);
    }
  }
}

// one tiny piece of glass: a few very high tones that don't match each other, gone almost right away
function glassTinkle(delay, volume, pan) {
  const start = soundContext.currentTime + delay;
  const out = placeAt(pan);
  const base = 3000 + Math.random() * 4000;
  const ratios = [1, 1.37 + Math.random() * 0.2, 2.1 + Math.random() * 0.3];
  for (let i = 0; i < ratios.length; i++) {
    const osc = soundContext.createOscillator();
    const gain = soundContext.createGain();
    const length = 0.03 + Math.random() * 0.09;
    osc.type = "sine";
    osc.frequency.value = Math.min(base * ratios[i], 16000);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume / (i + 1), start + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
    osc.connect(gain);
    gain.connect(out);
    osc.start(start);
    osc.stop(start + length + 0.05);
  }
  glassClick(delay, volume * 0.6, pan);
}

// a very short, very high click of noise
function glassClick(delay, volume, pan) {
  const start = soundContext.currentTime + delay;
  const source = soundContext.createBufferSource();
  const filter = soundContext.createBiquadFilter();
  const gain = soundContext.createGain();
  source.buffer = noiseBuffer;
  filter.type = "highpass";
  filter.frequency.value = 6000;
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.015);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(placeAt(pan));
  source.start(start, Math.random() * 1.5);
  source.stop(start + 0.03);
}

// filtered noise that sweeps from one pitch to another, sounds like wind or a whoosh
function noiseSweep(delay, length, fromFreq, toFreq, volume, peak, pan, type) {
  const start = soundContext.currentTime + delay;
  const source = soundContext.createBufferSource();
  const filter = soundContext.createBiquadFilter();
  const gain = soundContext.createGain();
  source.buffer = noiseBuffer;
  source.loop = true;
  // start somewhere random in the noise so two sweeps at once don't sound the same
  const offset = Math.random() * 1.5;
  filter.type = type || "bandpass";
  filter.Q.value = 0.9;
  filter.frequency.setValueAtTime(fromFreq, start);
  filter.frequency.exponentialRampToValueAtTime(toFreq, start + length);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + length * peak);
  gain.gain.linearRampToValueAtTime(0, start + length);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(placeAt(pan));
  source.start(start, offset);
  source.stop(start + length + 0.1);
}

// deep roar: noise with everything but the low end cut off
function rumble(delay, length, volume) {
  noiseSweep(delay, length, 160, 90, volume, 0.5, -0.3, "lowpass");
  noiseSweep(delay, length, 140, 80, volume, 0.55, 0.3, "lowpass");
}

// a thump that drops in pitch, with an optional gritty copy so it's heard on small speakers too
function thump(delay, volume, fromFreq, toFreq, length, crunch) {
  const start = soundContext.currentTime + delay;
  const osc = soundContext.createOscillator();
  const gain = soundContext.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(fromFreq, start);
  osc.frequency.exponentialRampToValueAtTime(toFreq, start + length * 0.75);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  osc.connect(gain);
  gain.connect(soundGroup);

  if (crunch) {
    const shaper = soundContext.createWaveShaper();
    const filter = soundContext.createBiquadFilter();
    const crunchGain = soundContext.createGain();
    shaper.curve = crunchCurve;
    filter.type = "lowpass";
    filter.frequency.value = 900;
    crunchGain.gain.value = crunch;
    gain.connect(shaper);
    shaper.connect(filter);
    filter.connect(crunchGain);
    crunchGain.connect(soundGroup);
  }

  osc.start(start);
  osc.stop(start + length + 0.1);
}

/* ---------- the sounds luck.js uses ---------- */

// soft harp going up and across from left to right, when the wish starts
function playWishStart() {
  if (!canPlay()) {
    return;
  }
  const steps = [3, 5, 7, 10, 12, 15, 17, 19, 22];
  for (let i = 0; i < steps.length; i++) {
    pluck(note(steps[i] - 12), i * 0.045, 0.1, 1.2, -0.7 + (i / (steps.length - 1)) * 1.4);
  }
  noiseSweep(0, 0.9, 3000, 600, 0.12, 0.2, -0.4);
  noiseSweep(0.05, 0.9, 2500, 500, 0.12, 0.2, 0.4);
}

// the star launching: a heavy push, then a roar that lasts the whole flight
function playLaunch(length) {
  if (!canPlay()) {
    return;
  }
  thump(0, 0.6, 70, 32, 0.9, 0.35);
  rumble(0, length, 0.5);
  noiseSweep(0, length, 1600, 300, 0.14, 0.15, -0.5);
  noiseSweep(0, length, 1300, 260, 0.14, 0.2, 0.5);
  swell(note(-33), 0, 0.2, length);
}

// the second star joining the main one: a short deep hit and two notes going up
function playMerge() {
  if (!canPlay()) {
    return;
  }
  thump(0, 0.45, 75, 38, 0.7, 0.3);
  bell(note(-5), 0, 0.05, 1.4, -0.4);
  bell(note(2), 0.1, 0.05, 1.6, 0.4);
  noiseSweep(0, 0.5, 4000, 900, 0.08, 0.1, 0);
}

// the moment it turns purple or gold
function playChange(count) {
  if (!canPlay()) {
    return;
  }
  thump(0, 0.55, 60, 30, 1.1, 0.3);
  if (count === 5) {
    // deep chord with a bright shimmer on top running left to right
    lowPad([note(-36), note(-29), note(-24)], 0, 0.22, 2.4);
    const chord = [0, 4, 7, 12, 16];
    for (let i = 0; i < chord.length; i++) {
      bell(note(chord[i]), i * 0.025, 0.06, 2.5, spread(i));
    }
    const sparkle = [12, 16, 19, 24, 28, 31];
    for (let i = 0; i < sparkle.length; i++) {
      pluck(note(sparkle[i]), 0.15 + i * 0.05, 0.05, 0.8, -0.8 + (i / (sparkle.length - 1)) * 1.6);
    }
    swell(note(-45), 0, 0.35, 2.4);
  } else {
    // green, blue and purple each sit a little higher than the last
    const lift = (count - 2) * 3;
    lowPad([note(-29 + lift), note(-22 + lift), note(-17 + lift)], 0, 0.2, 1.9);
    const chord = [-5, -1, 2, 7];
    for (let i = 0; i < chord.length; i++) {
      bell(note(chord[i] + lift), i * 0.03, 0.06, 1.8, spread(i));
    }
    swell(note(-41 + lift), 0, 0.28, 1.8);
  }
}

// one of the five stars arriving on a 5 star wish, each one a step higher
function playArrive(index) {
  if (!canPlay()) {
    return;
  }
  const steps = [0, 4, 7, 12, 16];
  pluck(note(steps[index] + 3), 0, 0.09, 1.2, spread(index));
  thump(0, 0.25, 70, 40, 0.4, 0.2);
}

/* ---------- fakeout sounds ---------- */

// everything slows down: a low drone and a whoosh sinking away
function playStall() {
  if (!canPlay()) {
    return;
  }
  noiseSweep(0, 1.4, 1200, 150, 0.2, 0.3, 0, "lowpass");
  swell(note(-40), 0, 0.25, 1.6);
  swell(note(-33), 0.2, 0.12, 1.4);
}

// a deep double thump, like a heartbeat
function playHeartbeat() {
  if (!canPlay()) {
    return;
  }
  thump(0, 0.6, 62, 34, 0.35, 0.35);
  thump(0.17, 0.45, 56, 32, 0.3, 0.3);
}

// glass splitting: a sharp high snap, then a crackle running along the crack. strength 1 is the big first crack
function playCrack(strength) {
  if (!canPlay()) {
    return;
  }
  glassClick(0, 0.5 * strength, -0.2);
  glassClick(0.004, 0.4 * strength, 0.2);
  noiseSweep(0, 0.05 + 0.03 * strength, 12000, 6000, 0.25 * strength, 0.05, 0, "highpass");
  // the crack running out: a quick handful of tiny clicks
  for (let i = 0; i < 6; i++) {
    glassClick(0.01 + i * 0.012, (0.25 - i * 0.03) * strength, Math.random() * 1.6 - 0.8);
  }
  for (let i = 0; i < 3; i++) {
    glassTinkle(0.02 + Math.random() * 0.12, 0.05 * strength, Math.random() * 1.4 - 0.7);
  }
  // a quiet strain underneath instead of a drum hit
  swell(note(-38), 0, 0.12 * strength, 0.5);
}

// the glass straining after the crack: little clicks and ticks at random, getting busier until it gives
function playCrackle(length) {
  if (!canPlay()) {
    return;
  }
  let time = 0.08;
  while (time < length) {
    const progress = time / length;
    glassClick(time, 0.06 + progress * 0.14, Math.random() * 1.6 - 0.8);
    if (Math.random() < 0.2) {
      glassTinkle(time, 0.02 + progress * 0.03, Math.random() * 1.4 - 0.7);
    }
    // the gaps get shorter as it goes, with some randomness so it never sounds even
    time += (0.07 - progress * 0.05) * (0.4 + Math.random() * 1.2);
  }
  swell(note(-40), 0, 0.1, length + 0.1);
}

// a quick rush that gets higher and louder, pulling everything into the break
function playImplode() {
  if (!canPlay()) {
    return;
  }
  noiseSweep(0, 0.3, 200, 5000, 0.25, 0.95, -0.4);
  noiseSweep(0, 0.3, 250, 4500, 0.25, 0.95, 0.4);
  brassSwell([note(-33), note(-26), note(-21)], 0, 0.1, 0.45);
}

// the sky shattering: a bright crash and lots of glass raining down on both sides
function playShatter(count) {
  if (!canPlay()) {
    return;
  }
  noiseSweep(0, 1.2, 14000, 4000, 0.3, 0.01, -0.6, "highpass");
  noiseSweep(0.01, 1.2, 12000, 3500, 0.3, 0.01, 0.6, "highpass");
  noiseSweep(0, 0.6, 6000, 1500, 0.15, 0.02, 0);
  // most of the pieces fall right away, then fewer and fewer
  for (let i = 0; i < 50; i++) {
    const time = Math.pow(Math.random(), 2.2) * 1.2;
    glassTinkle(time, 0.07 * (1 - time * 0.6), Math.random() * 1.8 - 0.9);
  }
  thump(0, 0.35, 70, 35, 0.8, 0);
}

// the real color bursting out after a fakeout: a big warm chord blooming wide, with a deep swell under it
function playBigReveal(count) {
  if (!canPlay()) {
    return;
  }
  const root = count === 5 ? -24 : -26 + count;
  const chord = [0, 4, 7, 12, 16];
  const freqs = [];
  for (let i = 0; i < chord.length; i++) {
    freqs.push(note(root + chord[i]));
  }
  brassSwell(freqs, 0, 0.14, 3.2);
  swell(note(root - 24), 0, 0.3, 3);
  noiseSweep(0, 2.5, 400, 3000, 0.12, 0.3, -0.5, "lowpass");
  noiseSweep(0.05, 2.5, 350, 2600, 0.12, 0.3, 0.5, "lowpass");
}

// the final burst: a big deep boom, a gritty punch, a low crash on both sides, and a dark chord
function playImpact(count) {
  if (!canPlay()) {
    return;
  }
  thump(0, 0.85, 80, 28, 1.8, 0);
  thump(0, 0.45, 160, 55, 0.5, 0.6);
  noiseSweep(0, 1.6, 1800, 120, 0.4, 0.02, -0.7, "lowpass");
  noiseSweep(0, 1.5, 1400, 100, 0.4, 0.02, 0.7, "lowpass");
  noiseSweep(0, 0.4, 5000, 1500, 0.08, 0.02, 0);

  let root = -33;
  let chord = [0, 7, 12];
  if (count >= 3) {
    root = -31;
    chord = [0, 4, 7, 11];
  }
  if (count === 5) {
    root = -36;
    chord = [0, 4, 7, 12, 16];
  }
  // the better result in each color gets one more note on top and a lower octave underneath
  const upper = count === 2 || count === 4 || count === 5;
  if (upper) {
    chord = chord.concat([chord[chord.length - 1] + 5]);
    thump(0.03, 0.5, 55, 25, 1.6, 0);
  }
  const padNotes = [];
  for (let i = 0; i < chord.length; i++) {
    padNotes.push(note(root + chord[i]));
  }
  lowPad(padNotes, 0.02, 0.25, 3);
  swell(note(root - 12), 0, 0.3, 2.8);

  // quiet shimmer on top
  for (let i = 0; i < chord.length; i++) {
    bell(note(root + 36 + chord[i]), 0.06 + i * 0.02, 0.04, 2.6, spread(i));
  }
}

// harp going up when the emotes show up, longer and higher for better results
function playReveal(count) {
  if (!canPlay()) {
    return;
  }
  const scale = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
  const base = count === 5 ? 0 : count >= 3 ? -5 : -9;
  const length = 3 + count;
  for (let i = 0; i < length; i++) {
    pluck(note(scale[i] + base), 0.2 + i * 0.08, 0.09, 1.6, spread(i) * 0.8);
  }
  lowPad([note(base - 24), note(base - 17)], 0.15, 0.1, 2.5);
}

/* ---------- constellation sounds ---------- */

// these can play without a wish first, so they get the sound ready themselves (a click is always behind them)
function readySound() {
  if (!soundContext) {
    startSound();
  } else if (soundContext.state === "suspended") {
    soundContext.resume();
  }
}

// a wish turning into a glowing ball: a soft swell and a harp run going up
function playOrb(rarity) {
  readySound();
  if (!canPlay()) {
    return;
  }
  swell(note(-24 + rarity * 2), 0, 0.2, 2);
  const steps = [0, 4, 7, 12, 16, 19, 24];
  for (let i = 0; i < steps.length; i++) {
    pluck(note(steps[i] + rarity), 0.3 + i * 0.07, 0.08, 1.4, -0.6 + i * 0.2);
  }
  bell(note(24 + rarity), 1.1, 0.05, 2.2, 0.2);
}

// collecting stardust from a star: a short bright twinkle
function playCollect(rarity) {
  readySound();
  if (!canPlay()) {
    return;
  }
  // two soft, low notes and a gentle swell under them, a little higher for rarer stars
  const steps = [0, 7];
  for (let i = 0; i < steps.length; i++) {
    softTone(note(steps[i] + rarity), i * 0.09, 0.07, 1.6, spread(i) * 0.5);
  }
  swell(note(rarity - 12), 0, 0.05, 1.2);
}

// a plain, round tone that fades in gently instead of starting with a click
function softTone(freq, delay, volume, length, pan) {
  const start = soundContext.currentTime + delay;
  const osc = soundContext.createOscillator();
  const gain = soundContext.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  osc.connect(gain);
  gain.connect(placeAt(pan));
  osc.start(start);
  osc.stop(start + length + 0.1);
}

// going up a rank: a whoosh lifting into a warm horn chord. higher for each tier, and each step of a climb
// goes up a bit more. the first rank of a new tier gets a bigger, longer version
function playRankUp(index, step) {
  readySound();
  if (!canPlay()) {
    return;
  }
  const newTier = index > 0 && rankList[index].tier !== rankList[index - 1].tier;
  const lift = Math.min(Math.floor(index / 5) * 2 + (step || 0), 12);
  const root = -36 + lift;
  const length = newTier ? 2.5 : 1.4;
  const chord = [0, 7, 12, 16, 19];
  const freqs = [];
  for (let i = 0; i < chord.length; i++) {
    freqs.push(note(root + chord[i]));
  }
  brassSwell(freqs, 0.05, newTier ? 0.13 : 0.09, length);
  swell(note(root - 12), 0, 0.2, length);
  if (newTier) {
    thump(0, 0.5, 70, 30, 1.2, 0.15);
    lowPad([note(root - 12), note(root - 5)], 0.05, 0.15, length);
    noiseSweep(0, 0.9, 250, 2200, 0.12, 0.8, -0.5, "lowpass");
    noiseSweep(0.03, 0.9, 220, 2000, 0.12, 0.8, 0.5, "lowpass");
  } else {
    thump(0, 0.3, 65, 35, 0.6, 0);
    noiseSweep(0, 0.6, 250, 2200, 0.1, 0.8, 0, "lowpass");
  }
}
