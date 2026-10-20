// Aviso sonoro ("ding-dong") generado con Web Audio y lectura del turno en voz alta.

let ctx: AudioContext | null = null;

export function unlockAudio() {
  ctx ??= new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  // Algunos navegadores cargan las voces de forma asíncrona
  window.speechSynthesis?.getVoices();
}

export function chime() {
  if (!ctx) return Promise.resolve();
  const notes = [
    { f: 784, t: 0 },
    { f: 587, t: 0.45 },
  ];
  for (const { f, t } of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = f;
    const start = ctx.currentTime + t;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.5, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.1);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 1.2);
  }
  return new Promise((r) => setTimeout(r, 1300));
}

export function speak(text: string) {
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const voices = synth.getVoices();
  u.voice = voices.find((v) => v.lang === 'es-ES') || voices.find((v) => v.lang.startsWith('es')) || null;
  u.lang = u.voice?.lang || 'es-ES';
  u.rate = 0.9;
  synth.speak(u);
}
